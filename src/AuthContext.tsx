import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';

export const ADMIN_EMAIL = 'kravoplatnumzofficial@gmail.com';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  channelSlug: string;
  brandName: string;
  defaultVenue: string;
  themeColor: string;
  customLogoUrl: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'revoked';
  revokedAt?: string;
  revokedReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isRevoked: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>, immediate?: boolean) => void;
  flushProfileSave?: () => Promise<void>;
  fetchAllUsers: () => Promise<UserProfile[]>;
  setAccountStatus: (targetUid: string, status: 'active' | 'revoked', reason?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  isRevoked: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateProfileData: () => {},
  flushProfileSave: async () => {},
  fetchAllUsers: async () => [],
  setAccountStatus: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const profileDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingProfileRef = useRef<UserProfile | null>(null);

  const isAdmin = Boolean(
    currentUser?.email && currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  const isRevoked = Boolean(userProfile?.status === 'revoked');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const isMasterAdmin = Boolean(
          user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        );
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            // Ensure master admin has 'admin' role if not already stamped
            if (isMasterAdmin && data.role !== 'admin') {
              const upgraded: UserProfile = { ...data, role: 'admin', updatedAt: new Date().toISOString() };
              await setDoc(userDocRef, upgraded, { merge: true });
              setUserProfile(upgraded);
            } else {
              setUserProfile(data);
            }
          } else {
            // Generate unique channel slug from display name or uid
            const cleanName = (user.displayName || 'user')
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '')
              .slice(0, 16) || 'channel';
            const slug = isMasterAdmin ? 'kravo-official' : `${cleanName}-${user.uid.slice(0, 6)}`;

            const initialProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || (isMasterAdmin ? 'Kravo Platnumz' : 'Kravo Scorer'),
              photoURL: user.photoURL || '',
              channelSlug: slug,
              brandName: isMasterAdmin
                ? 'KRAVO PLATNUMZ OFFICIAL'
                : (user.displayName ? `${user.displayName.toUpperCase()} SCOREBOARD` : 'KRAVO PLATNUMZ SCOREBOARD'),
              defaultVenue: 'HARARE, ZIMBABWE',
              themeColor: '#0066f6',
              customLogoUrl: '',
              role: isMasterAdmin ? 'admin' : 'user',
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, initialProfile);
            setUserProfile(initialProfile);

            // If master admin, also record in admins collection
            if (isMasterAdmin) {
              const adminDocRef = doc(db, 'admins', user.uid);
              await setDoc(adminDocRef, {
                uid: user.uid,
                email: user.email,
                role: 'super_admin',
                assignedAt: new Date().toISOString(),
              }, { merge: true });
            }
          }
        } catch (err) {
          console.error('Failed to load user profile from Firestore:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (err: any) {
      console.error('Sign Out failed:', err);
    }
  };

  const saveProfileToFirestore = async (profileToSave: UserProfile) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await setDoc(userDocRef, profileToSave, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const updateProfileData = (data: Partial<UserProfile>, immediate = false) => {
    if (!currentUser || !userProfile) return;
    if (isRevoked) {
      throw new Error('Your account access has been revoked by the administrator.');
    }

    const sanitized = { ...data };
    if (!isAdmin) {
      delete sanitized.role;
      delete sanitized.status;
      delete sanitized.revokedAt;
      delete sanitized.revokedReason;
    }

    const updated: UserProfile = {
      ...userProfile,
      ...sanitized,
      updatedAt: new Date().toISOString(),
    };

    // 1. INSTANT LOCAL STATE UPDATE: Zero-delay UI reactivity when typing/erasing
    setUserProfile(updated);
    pendingProfileRef.current = updated;

    // 2. Debounced Cloud Persistence
    if (immediate) {
      if (profileDebounceRef.current) {
        clearTimeout(profileDebounceRef.current);
        profileDebounceRef.current = null;
      }
      saveProfileToFirestore(updated);
    } else {
      if (profileDebounceRef.current) {
        clearTimeout(profileDebounceRef.current);
      }
      profileDebounceRef.current = setTimeout(() => {
        profileDebounceRef.current = null;
        if (pendingProfileRef.current) {
          saveProfileToFirestore(pendingProfileRef.current);
        }
      }, 400);
    }
  };

  const flushProfileSave = async () => {
    if (profileDebounceRef.current) {
      clearTimeout(profileDebounceRef.current);
      profileDebounceRef.current = null;
    }
    if (pendingProfileRef.current) {
      await saveProfileToFirestore(pendingProfileRef.current);
    }
  };

  const fetchAllUsers = async (): Promise<UserProfile[]> => {
    if (!isAdmin) {
      throw new Error('Only the administrator (kravoplatnumzofficial@gmail.com) can access all users.');
    }
    const path = 'users';
    try {
      const snap = await getDocs(collection(db, path));
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        list.push(d.data() as UserProfile);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  };

  const setAccountStatus = async (targetUid: string, status: 'active' | 'revoked', reason?: string) => {
    if (!isAdmin) {
      throw new Error('Permission denied: Only the administrator can change account status.');
    }
    if (targetUid === currentUser?.uid) {
      throw new Error('You cannot revoke access for your own master admin account.');
    }

    const path = `users/${targetUid}`;
    const targetRef = doc(db, 'users', targetUid);
    const updatePayload: Partial<UserProfile> = {
      status,
      revokedAt: status === 'revoked' ? new Date().toISOString() : '',
      revokedReason: status === 'revoked' ? (reason || 'Access revoked by administrator') : '',
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(targetRef, updatePayload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        isRevoked,
        signInWithGoogle,
        signOut,
        updateProfileData,
        flushProfileSave,
        fetchAllUsers,
        setAccountStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
