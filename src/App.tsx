/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy,
  Plus,
  Minus,
  RefreshCw,
  Copy,
  ExternalLink,
  Volume2,
  VolumeX,
  Check,
  Github,
  Tv,
  Gamepad2,
  Globe,
  Download,
  Flame,
  ArrowLeftRight,
  Smartphone,
  X,
  Share2,
  Search,
  Sparkles,
  Terminal,
  Monitor,
  FolderDown,
  BarChart2,
  Award,
  FileText,
  Percent,
  User,
  Users,
  Settings,
  LogIn,
  LogOut,
  Sliders,
  History,
  Key,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { WORLD_COUNTRIES, Country, getCountryCode, getFlagEmoji } from './countries';
import { FlagBadge } from './FlagBadge';
import { RealtimeSyncEngine } from './realtimeSync';
import { useAuth, ADMIN_EMAIL, UserProfile } from './AuthContext';

export interface ScoreState {
  name1: string;
  name2: string;
  nameBold1?: boolean;
  nameBold2?: boolean;
  flag1: string;
  flag2: string;
  avatar1?: string;
  avatar2?: string;
  score1: number;
  score2: number;
  br1: number;
  br2: number;
  appleRed1?: number;
  appleGreen1?: number;
  appleRed2?: number;
  appleGreen2?: number;
  raceTo: number;
  matchType?: string;
  tournament: string;
  venue: string;
  pot: string;
  showPot?: boolean;
  brand: string;
  room: string;
  overlayPosition?: 'bottom' | 'top';
  activeShooter?: 0 | 1 | 2;
  updatedAt: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'controller' | 'preview' | 'account' | 'admin' | 'flags' | 'install' | 'github'>('controller');
  const {
    currentUser,
    userProfile,
    loading: authLoading,
    isAdmin,
    isRevoked,
    signInWithGoogle,
    signOut,
    updateProfileData,
    flushProfileSave,
    fetchAllUsers,
    setAccountStatus
  } = useAuth();

  // Master Admin State (kravoplatnumzofficial@gmail.com)
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [revokingUser, setRevokingUser] = useState<UserProfile | null>(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [actionProcessingUid, setActionProcessingUid] = useState<string | null>(null);

  // PWA Install Hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Core state initialized from permanent localStorage, retaining last entered details
  const [state, setState] = useState<ScoreState>(() => {
    try {
      const saved = localStorage.getItem('platnumz-scoreboard-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const parsedTime = Number(parsed.updatedAt) || 0;
          return {
            name1: 'PLAYER 1',
            name2: 'PLAYER 2',
            flag1: '🇿🇼',
            flag2: '🇿🇼',
            score1: 0,
            score2: 0,
            br1: 0,
            br2: 0,
            appleRed1: 0,
            appleGreen1: 0,
            appleRed2: 0,
            appleGreen2: 0,
            raceTo: 5,
            matchType: parsed.matchType || parsed.tournament || 'CHALLENGE MATCH',
            tournament: parsed.tournament || parsed.matchType || 'CHALLENGE MATCH',
            venue: 'HARARE, ZIMBABWE',
            pot: '$500',
            showPot: true,
            brand: 'KRAVO PLATNUMZ OFFICIAL',
            room: 'platnumz-live-match',
            overlayPosition: 'bottom',
            activeShooter: 0,
            nameBold1: true,
            nameBold2: true,
            ...parsed,
            updatedAt: parsedTime > 1 ? parsedTime : (parsed.name1 && parsed.name1 !== 'PLAYER 1' ? Date.now() : 1)
          };
        }
      }
    } catch (e) {}

    // Factory baseline if brand new installation
    return {
      name1: 'PLAYER 1',
      name2: 'PLAYER 2',
      nameBold1: true,
      nameBold2: true,
      flag1: '🇿🇼',
      flag2: '🇿🇼',
      score1: 0,
      score2: 0,
      br1: 0,
      br2: 0,
      appleRed1: 0,
      appleGreen1: 0,
      appleRed2: 0,
      appleGreen2: 0,
      raceTo: 5,
      matchType: 'CHALLENGE MATCH',
      tournament: 'CHALLENGE MATCH',
      venue: 'HARARE, ZIMBABWE',
      pot: '$500',
      showPot: true,
      brand: 'KRAVO PLATNUMZ OFFICIAL',
      room: 'platnumz-live-match',
      overlayPosition: 'bottom',
      activeShooter: 0,
      updatedAt: 1
    };
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [flagSearch, setFlagSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');

  // Quick flag picker modal for cards
  const [targetPlayerForFlag, setTargetPlayerForFlag] = useState<1 | 2 | null>(null);

  // In-app confirmation modal (works reliably inside iframes and standalone PWAs)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Post-match summary report modal state
  const [showMatchReportModal, setShowMatchReportModal] = useState(false);
  const hasAutoOpenedReportRef = useRef(false);

  // Git state
  const [githubToken, setGithubToken] = useState('');
  const [gitStatusData, setGitStatusData] = useState<{ branch: string; log: string; status: string } | null>(null);
  const [gitLoading, setGitLoading] = useState(false);
  const [gitOutput, setGitOutput] = useState<{ success: boolean; message: string } | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const name1InputRef = useRef<HTMLInputElement | null>(null);
  const name2InputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const stripNameBoldMarkers = (val: string) => (val || '').replace(/\*\*/g, '');

  const renderFormattedNameJSX = (raw: string, isAllBold: boolean = true) => {
    const str = raw || '';
    const hasMarkers = /\*\*[^*]+\*\*/.test(str);
    if (hasMarkers) {
      const parts = str.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={i} className="font-black text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return (
          <span key={i} className="font-normal text-slate-300">
            {part}
          </span>
        );
      });
    }
    return (
      <span className={isAllBold === false ? 'font-normal text-slate-200' : 'font-black text-white'}>
        {stripNameBoldMarkers(str)}
      </span>
    );
  };

  // Master Admin functions
  const loadUsersForAdmin = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingAdminUsers(true);
    try {
      const users = await fetchAllUsers();
      setAdminUsers(users);
    } catch (err: any) {
      showToast('Error loading accounts: ' + (err.message || 'Permission denied'));
    } finally {
      setLoadingAdminUsers(false);
    }
  }, [isAdmin, fetchAllUsers]);

  useEffect(() => {
    if (activeTab === 'admin' && isAdmin) {
      loadUsersForAdmin();
    }
  }, [activeTab, isAdmin, loadUsersForAdmin]);

  const handleConfirmRevoke = async () => {
    if (!revokingUser) return;
    setActionProcessingUid(revokingUser.uid);
    try {
      await setAccountStatus(
        revokingUser.uid,
        'revoked',
        revocationReason.trim() || 'Access revoked by administrator'
      );
      showToast(`Access revoked for ${revokingUser.displayName || revokingUser.email}`);
      setRevokingUser(null);
      setRevocationReason('');
      await loadUsersForAdmin();
    } catch (err: any) {
      showToast('Failed to revoke access: ' + (err.message || 'Error'));
    } finally {
      setActionProcessingUid(null);
    }
  };

  const handleRestoreAccess = async (targetUser: UserProfile) => {
    setActionProcessingUid(targetUser.uid);
    try {
      await setAccountStatus(targetUser.uid, 'active');
      showToast(`Access restored for ${targetUser.displayName || targetUser.email}`);
      await loadUsersForAdmin();
    } catch (err: any) {
      showToast('Failed to restore access: ' + (err.message || 'Error'));
    } finally {
      setActionProcessingUid(null);
    }
  };

  // Online status tracker
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); showToast('Online mode restored'); };
    const handleOffline = () => { setIsOnline(false); showToast('Offline mode — Local cache active'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Web Audio Synthesizer
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playScoreChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    } catch (e) {}
  }, [soundEnabled, getAudioContext]);

  const playBreakAndRunChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.2, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.22);
      });
    } catch (e) {}
  }, [soundEnabled, getAudioContext]);

  const syncEngineRef = useRef<RealtimeSyncEngine | null>(null);

  // Initialize Universal Real-Time Sync Engine (MQTT WebSockets + BroadcastChannel + LocalStorage)
  useEffect(() => {
    const engine = new RealtimeSyncEngine({
      onStateReceived: (remoteState) => {
        setState((prev) => {
          const remoteTime = Number(remoteState.updatedAt) || 0;
          const localTime = Number(prev.updatedAt) || 0;
          // Never overwrite an active match with default baseline placeholder (<= 1)
          if (localTime > 1 && remoteTime <= 1) {
            return prev;
          }
          if (localTime > remoteTime && localTime > 1) {
            return prev;
          }
          const merged = { ...prev, ...remoteState };
          try {
            const serialized = JSON.stringify(merged);
            localStorage.setItem('platnumz-scoreboard-state', serialized);
            if (merged.room) {
              localStorage.setItem(`platnumz_state_${merged.room}`, serialized);
            }
            sessionStorage.setItem('platnumz-scoreboard-state', serialized);
            if (merged.room) {
              sessionStorage.setItem(`platnumz_state_${merged.room}`, serialized);
            }
          } catch (e) {}
          return merged;
        });
      },
      onStatusChange: (status) => {
        setSyncStatus(status);
      }
    });

    syncEngineRef.current = engine;
    engine.setRoom(state.room || 'platnumz-live-match');

    return () => {
      engine.destroy();
    };
  }, []);

  // Update room in sync engine when changed
  useEffect(() => {
    if (syncEngineRef.current && state.room) {
      syncEngineRef.current.setRoom(state.room);
    }
  }, [state.room]);

  // When user logs in with their personalized profile, adopt their personal channel and branding
  useEffect(() => {
    if (userProfile) {
      setState((prev) => {
        // If current room is still the generic default or matches old profile, update to personal channel
        const shouldAdoptChannel = !prev.room || prev.room === 'platnumz-live-match' || prev.room === userProfile.channelSlug;
        const updatedRoom = shouldAdoptChannel ? userProfile.channelSlug : prev.room;
        const updatedBrand = userProfile.brandName || prev.brand;
        const updatedVenue = prev.venue === 'HARARE, ZIMBABWE' && userProfile.defaultVenue ? userProfile.defaultVenue : prev.venue;
        
        if (updatedRoom !== prev.room || updatedBrand !== prev.brand) {
          const merged = {
            ...prev,
            room: updatedRoom,
            brand: updatedBrand,
            venue: updatedVenue,
            updatedAt: Date.now()
          };
          syncState(merged);
          return merged;
        }
        return prev;
      });
    }
  }, [userProfile]);

  const syncDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSyncStateRef = useRef<ScoreState | null>(null);

  // REAL-TIME MULTI-CHANNEL SYNC (Immediate for score buttons, debounced for text typing)
  const syncState = useCallback((newState: ScoreState, immediate: boolean = true) => {
    const withTimestamp = {
      ...newState,
      updatedAt: newState.updatedAt && newState.updatedAt > 1 ? newState.updatedAt : Date.now()
    };

    // 1. ALWAYS update local React state immediately so text inputs & UI never stutter or lag
    setState(withTimestamp);
    pendingSyncStateRef.current = withTimestamp;

    const executeSync = (targetState: ScoreState, isImmediate: boolean) => {
      setSyncStatus('syncing');

      // Permanent LocalStorage with multi-key backup
      try {
        const serialized = JSON.stringify(targetState);
        localStorage.setItem('platnumz-scoreboard-state', serialized);
        if (targetState.room) {
          localStorage.setItem(`platnumz_state_${targetState.room}`, serialized);
        }
        sessionStorage.setItem('platnumz-scoreboard-state', serialized);
        if (targetState.room) {
          sessionStorage.setItem(`platnumz_state_${targetState.room}`, serialized);
        }
      } catch (e) {}

      // Publish via Realtime Engine (MQTT + BroadcastChannel + LocalStorage + Firestore + API)
      if (syncEngineRef.current) {
        syncEngineRef.current.publish(targetState, isImmediate);
      }
    };

    if (immediate) {
      if (syncDebounceTimerRef.current) {
        clearTimeout(syncDebounceTimerRef.current);
        syncDebounceTimerRef.current = null;
      }
      executeSync(withTimestamp, true);
    } else {
      // Debounce network & disk writes for typing/erasing (300ms)
      if (syncDebounceTimerRef.current) {
        clearTimeout(syncDebounceTimerRef.current);
      }
      syncDebounceTimerRef.current = setTimeout(() => {
        syncDebounceTimerRef.current = null;
        if (pendingSyncStateRef.current) {
          executeSync(pendingSyncStateRef.current, false);
        }
      }, 300);
    }
  }, []);

  const flushSync = useCallback(() => {
    if (syncDebounceTimerRef.current) {
      clearTimeout(syncDebounceTimerRef.current);
      syncDebounceTimerRef.current = null;
    }
    if (pendingSyncStateRef.current) {
      const target = pendingSyncStateRef.current;
      try {
        const serialized = JSON.stringify(target);
        localStorage.setItem('platnumz-scoreboard-state', serialized);
        if (target.room) {
          localStorage.setItem(`platnumz_state_${target.room}`, serialized);
        }
      } catch (e) {}
      if (syncEngineRef.current) {
        syncEngineRef.current.publish(target, true);
      }
    }
  }, []);

  // Listen to incoming real-time updates from Server SSE & API (when deployed with Node.js/Express)
  useEffect(() => {
    const currentRoom = state.room || 'platnumz-live-match';

    // Initial server fetch: compare timestamps so user-entered details are never replaced with older server defaults
    fetch(`/api/sync/${encodeURIComponent(currentRoom)}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.state) {
          setState((prev) => {
            const serverTime = Number(data.state.updatedAt) || 0;
            const localTime = Number(prev.updatedAt) || 0;
            // Never overwrite real local match with default baseline server state (<= 1)
            if (localTime > 1 && serverTime <= 1) {
              fetch(`/api/sync/${encodeURIComponent(currentRoom)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prev)
              }).catch(() => {});
              return prev;
            }
            if (localTime > serverTime && localTime > 1) {
              fetch(`/api/sync/${encodeURIComponent(currentRoom)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prev)
              }).catch(() => {});
              return prev;
            }
            const merged = { ...prev, ...data.state };
            try {
              const serialized = JSON.stringify(merged);
              localStorage.setItem('platnumz-scoreboard-state', serialized);
              if (merged.room) {
                localStorage.setItem(`platnumz_state_${merged.room}`, serialized);
              }
            } catch (e) {}
            return merged;
          });
        }
      })
      .catch(() => {});

    // SSE connection for live updates from custom Node/VPS server
    let sse: EventSource | null = null;
    try {
      sse = new EventSource(`/api/sync/${encodeURIComponent(currentRoom)}/events`);
      sse.onmessage = (event) => {
        if (event.data) {
          try {
            const remoteState = JSON.parse(event.data);
            if (remoteState && typeof remoteState === 'object') {
              setState((prev) => {
                const remoteTime = Number(remoteState.updatedAt) || 0;
                const localTime = Number(prev.updatedAt) || 0;
                if (localTime > remoteTime && localTime > 1) {
                  return prev;
                }
                const merged = { ...prev, ...remoteState };
                try {
                  localStorage.setItem('platnumz-scoreboard-state', JSON.stringify(merged));
                } catch (e) {}
                return merged;
              });
              setSyncStatus('connected');
            }
          } catch (e) {}
        }
      };
      sse.onerror = () => {
        // Tolerates serverless hosts where SSE is not persistent
        if (sse) sse.close();
      };
    } catch (e) {}

    return () => {
      if (sse) sse.close();
    };
  }, [state.room]);

  // Keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;

      const k = e.key.toUpperCase();
      if (k === 'Q') {
        e.preventDefault();
        updateScore(1, 1);
      } else if (k === 'A') {
        e.preventDefault();
        updateScore(1, -1);
      } else if (k === 'P') {
        e.preventDefault();
        updateScore(2, 1);
      } else if (k === 'L') {
        e.preventDefault();
        updateScore(2, -1);
      } else if (k === 'S') {
        e.preventDefault();
        swapPlayers();
      } else if (k === 'R') {
        e.preventDefault();
        resetScores();
      } else if (k === '1') {
        e.preventDefault();
        setActiveShooter(1);
      } else if (k === '2') {
        e.preventDefault();
        setActiveShooter(2);
      } else if (k === '0') {
        e.preventDefault();
        setActiveShooter(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const updateScore = (player: 1 | 2, delta: number) => {
    setState((prev) => {
      const key = player === 1 ? 'score1' : 'score2';
      const newScore = Math.max(0, Math.min(999, prev[key] + delta));
      if (delta > 0) playScoreChime();
      const updated = { ...prev, [key]: newScore, updatedAt: Date.now() };
      syncState(updated);
      return updated;
    });
  };

  const updateBreakAndRun = (player: 1 | 2, delta: number) => {
    setState((prev) => {
      const key = player === 1 ? 'br1' : 'br2';
      const current = prev[key] || 0;
      const nextVal = Math.max(0, Math.min(99, current + delta));
      if (delta > 0) playBreakAndRunChime();
      const updated = { ...prev, [key]: nextVal, updatedAt: Date.now() };
      syncState(updated);
      showToast(`P${player} Break & Run: ${nextVal}`);
      return updated;
    });
  };

  const updateApple = (player: 1 | 2, color: 'red' | 'green', delta: number) => {
    setState((prev) => {
      const key = (player === 1
        ? (color === 'red' ? 'appleRed1' : 'appleGreen1')
        : (color === 'red' ? 'appleRed2' : 'appleGreen2')) as 'appleRed1' | 'appleGreen1' | 'appleRed2' | 'appleGreen2';
      const current = prev[key] || 0;
      const nextVal = Math.max(0, Math.min(99, current + delta));
      if (delta > 0) playBreakAndRunChime();
      const updated = { ...prev, [key]: nextVal, updatedAt: Date.now() };
      syncState(updated);
      showToast(`P${player} ${color === 'red' ? '🍎 Red Apple (One Visit Clearance)' : '🍏 Green Apple (Break & Run)'}: ${nextVal}`);
      return updated;
    });
  };

  const setActiveShooter = (target: 0 | 1 | 2) => {
    setState((prev) => {
      const current = prev.activeShooter || 0;
      const nextShooter: 0 | 1 | 2 = target !== 0 && current === target ? 0 : target;
      const updated = { ...prev, activeShooter: nextShooter, updatedAt: Date.now() };
      syncState(updated, true);
      if (nextShooter === 0) {
        showToast('On Table indicator removed');
      } else {
        const rawName = nextShooter === 1 ? (prev.name1 || 'PLAYER 1') : (prev.name2 || 'PLAYER 2');
        showToast(`${stripNameBoldMarkers(rawName)} marked ON TABLE`);
      }
      return updated;
    });
  };

  const applyNameBoldMode = (player: 1 | 2, mode: 'all' | 'normal' | 'first' | 'last' | 'selection') => {
    const nameKey = player === 1 ? 'name1' : 'name2';
    const boldKey = player === 1 ? 'nameBold1' : 'nameBold2';
    const inputEl = player === 1 ? name1InputRef.current : name2InputRef.current;

    if (mode === 'selection') {
      const currentRaw = state[nameKey] || '';
      const start = inputEl?.selectionStart ?? 0;
      const end = inputEl?.selectionEnd ?? 0;

      if (!inputEl || end <= start) {
        showToast('Highlight part of the name in the box first, or use 1st / Last');
        return;
      }

      const selected = currentRaw.slice(start, end);
      let nextName = currentRaw;
      if (selected.startsWith('**') && selected.endsWith('**') && selected.length > 4) {
        nextName = currentRaw.slice(0, start) + selected.slice(2, -2) + currentRaw.slice(end);
      } else if (
        start >= 2 &&
        currentRaw.slice(start - 2, start) === '**' &&
        currentRaw.slice(end, end + 2) === '**'
      ) {
        nextName = currentRaw.slice(0, start - 2) + selected + currentRaw.slice(end + 2);
      } else {
        const cleanSelected = selected.replace(/\*\*/g, '');
        if (!cleanSelected.trim()) return;
        nextName = currentRaw.slice(0, start) + `**${cleanSelected}**` + currentRaw.slice(end);
      }

      setState((prev) => {
        const updated = {
          ...prev,
          [nameKey]: nextName,
          [boldKey]: false,
          updatedAt: Date.now()
        };
        syncState(updated, true);
        return updated;
      });
      showToast(`P${player} partial bold updated`);
      return;
    }

    setState((prev) => {
      const clean = stripNameBoldMarkers(prev[nameKey] || '').trim();
      let nextName = prev[nameKey] || '';
      let nextAllBold = prev[boldKey] !== false;

      if (mode === 'all') {
        nextName = stripNameBoldMarkers(prev[nameKey] || '');
        nextAllBold = true;
        showToast(`P${player} full name set to Bold`);
      } else if (mode === 'normal') {
        nextName = stripNameBoldMarkers(prev[nameKey] || '');
        nextAllBold = false;
        showToast(`P${player} name set to Normal weight`);
      } else if (mode === 'first') {
        const words = clean.split(/\s+/).filter(Boolean);
        if (words.length > 0) {
          nextName = words.length === 1 ? `**${words[0]}**` : `**${words[0]}** ${words.slice(1).join(' ')}`;
        }
        nextAllBold = false;
        showToast(`P${player} first word set to Bold`);
      } else if (mode === 'last') {
        const words = clean.split(/\s+/).filter(Boolean);
        if (words.length > 0) {
          nextName =
            words.length === 1
              ? `**${words[0]}**`
              : `${words.slice(0, -1).join(' ')} **${words[words.length - 1]}**`;
        }
        nextAllBold = false;
        showToast(`P${player} last word set to Bold`);
      }

      const updated = {
        ...prev,
        [nameKey]: nextName,
        [boldKey]: nextAllBold,
        updatedAt: Date.now()
      };
      syncState(updated, true);
      return updated;
    });
  };

  const swapPlayers = () => {
    setState((prev) => {
      const nextShooter: 0 | 1 | 2 =
        prev.activeShooter === 1 ? 2 : prev.activeShooter === 2 ? 1 : 0;
      const updated = {
        ...prev,
        name1: prev.name2,
        name2: prev.name1,
        nameBold1: prev.nameBold2 ?? true,
        nameBold2: prev.nameBold1 ?? true,
        flag1: prev.flag2,
        flag2: prev.flag1,
        avatar1: prev.avatar2,
        avatar2: prev.avatar1,
        score1: prev.score2,
        score2: prev.score1,
        br1: prev.br2 || 0,
        br2: prev.br1 || 0,
        appleRed1: prev.appleRed2 || 0,
        appleRed2: prev.appleRed1 || 0,
        appleGreen1: prev.appleGreen2 || 0,
        appleGreen2: prev.appleGreen1 || 0,
        activeShooter: nextShooter,
        updatedAt: Date.now()
      };
      syncState(updated);
      showToast('Swapped Players, Flags & Stats');
      return updated;
    });
  };

  const executeResetScores = () => {
    setState((prev) => {
      const updated = {
        ...prev,
        score1: 0,
        score2: 0,
        br1: 0,
        br2: 0,
        appleRed1: 0,
        appleGreen1: 0,
        appleRed2: 0,
        appleGreen2: 0,
        activeShooter: 0 as const,
        updatedAt: Date.now()
      };
      syncState(updated);
      showToast('Scores & Apples reset to 0');
      return updated;
    });
  };

  const resetScores = () => {
    setConfirmModal({
      isOpen: true,
      title: "Reset Scores & Apples to 0?",
      description: "Both players' frame scores, Green Apples (🍏 Break & Run), and Red Apples (🍎 One Visit Clearance) will be reset to 0. Player names, venue, and match details will remain intact.",
      confirmText: "Reset to 0",
      cancelText: "Cancel",
      isDestructive: true,
      onConfirm: executeResetScores
    });
  };

  const executeResetToDefaults = () => {
    const defaults: ScoreState = {
      name1: 'PLAYER 1',
      name2: 'PLAYER 2',
      nameBold1: true,
      nameBold2: true,
      flag1: '🇿🇼',
      flag2: '🇿🇼',
      score1: 0,
      score2: 0,
      br1: 0,
      br2: 0,
      appleRed1: 0,
      appleGreen1: 0,
      appleRed2: 0,
      appleGreen2: 0,
      raceTo: 5,
      matchType: 'CHALLENGE MATCH',
      tournament: 'CHALLENGE MATCH',
      venue: 'HARARE, ZIMBABWE',
      pot: '$500',
      showPot: true,
      brand: 'KRAVO PLATNUMZ OFFICIAL',
      room: state.room || 'platnumz-live-match',
      overlayPosition: 'bottom',
      activeShooter: 0,
      updatedAt: Date.now()
    };
    setState(defaults);
    syncState(defaults);
    showToast('Scoreboard reset to default template (0 - 0)');
  };

  const resetToDefaults = () => {
    setConfirmModal({
      isOpen: true,
      title: "Restore Default Match Template?",
      description: "This will reset player names to 'PLAYER 1' & 'PLAYER 2', scores to 0 - 0, Race to 5, Pot to $500, and clear all apple/break counters. Ready to start a fresh match.",
      confirmText: "Restore Defaults",
      cancelText: "Cancel",
      isDestructive: false,
      onConfirm: executeResetToDefaults
    });
  };

  const selectCountryForPlayer = (c: Country, player: 1 | 2) => {
    setState((prev) => {
      const key = player === 1 ? 'flag1' : 'flag2';
      const updated = { ...prev, [key]: c.flag, updatedAt: Date.now() };
      syncState(updated);
      showToast(`Player ${player} flag set to ${c.name} ${c.flag}`);
      return updated;
    });
    setTargetPlayerForFlag(null);
  };

  const fetchGitStatus = async () => {
    setGitLoading(true);
    try {
      const res = await fetch('/api/git-status');
      if (res.ok) {
        const data = await res.json();
        setGitStatusData(data);
      }
    } catch (e) {} finally {
      setGitLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'github') fetchGitStatus();
  }, [activeTab]);

  const handleGitPush = async () => {
    if (!githubToken.trim()) {
      alert('Please enter your GitHub Personal Access Token.');
      return;
    }
    setGitLoading(true);
    setGitOutput(null);
    try {
      const res = await fetch('/api/git-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: githubToken.trim(), branch: 'main' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGitOutput({ success: true, message: data.message || 'Push successful!' });
        fetchGitStatus();
      } else {
        setGitOutput({ success: false, message: data.error || 'Push failed.' });
      }
    } catch (e: any) {
      setGitOutput({ success: false, message: e.message || 'Network error.' });
    } finally {
      setGitLoading(false);
    }
  };

  const downloadFile = (filename: 'index.html' | 'overlay.html' | 'README.md' | 'install-linux-mint.sh' | 'platnumz-scoreboard.desktop') => {
    if (filename === 'install-linux-mint.sh' || filename === 'platnumz-scoreboard.desktop') {
      const a = document.createElement('a');
      a.href = `/${filename}`;
      a.download = filename;
      a.click();
      showToast(`Downloaded ${filename}`);
      return;
    }
    fetch('/api/repo-files')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.files[filename]) {
          const blob = new Blob([data.files[filename]], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
          showToast(`Downloaded ${filename}`);
        }
      });
  };

  const isHillHill = state.score1 === state.raceTo - 1 && state.score2 === state.raceTo - 1;
  const totalFrames = (state.score1 || 0) + (state.score2 || 0);
  const raceTarget = Math.max(1, state.raceTo || 5);
  const isMatchConcluded = (state.score1 >= raceTarget || state.score2 >= raceTarget);
  const winnerIndex: 1 | 2 | null = state.score1 >= raceTarget ? 1 : (state.score2 >= raceTarget ? 2 : null);
  const winner = winnerIndex === 1 ? state.name1 : (winnerIndex === 2 ? state.name2 : null);
  const runnerUp = winnerIndex === 1 ? state.name2 : (winnerIndex === 2 ? state.name1 : null);
  const winnerFlag = winnerIndex === 1 ? state.flag1 : (winnerIndex === 2 ? state.flag2 : '');
  const runnerUpFlag = winnerIndex === 1 ? state.flag2 : (winnerIndex === 2 ? state.flag1 : '');
  const winnerScore = winnerIndex === 1 ? state.score1 : (winnerIndex === 2 ? state.score2 : 0);
  const runnerUpScore = winnerIndex === 1 ? state.score2 : (winnerIndex === 2 ? state.score1 : 0);
  const frameMargin = Math.abs(state.score1 - state.score2);

  const winRate1 = totalFrames > 0 ? ((state.score1 / totalFrames) * 100).toFixed(1) : '0.0';
  const winRate2 = totalFrames > 0 ? ((state.score2 / totalFrames) * 100).toFixed(1) : '0.0';
  const totalApples1 = (state.appleRed1 || 0) + (state.appleGreen1 || 0);
  const totalApples2 = (state.appleRed2 || 0) + (state.appleGreen2 || 0);
  const effectiveBR1 = (state.appleGreen1 || 0) + (state.br1 || 0);
  const effectiveBR2 = (state.appleGreen2 || 0) + (state.br2 || 0);
  const brRate1 = state.score1 > 0 ? ((effectiveBR1 / state.score1) * 100).toFixed(0) : '0';
  const brRate2 = state.score2 > 0 ? ((effectiveBR2 / state.score2) * 100).toFixed(0) : '0';

  // Automatically trigger post-match report when match concludes
  useEffect(() => {
    if (isMatchConcluded) {
      if (!hasAutoOpenedReportRef.current) {
        hasAutoOpenedReportRef.current = true;
        setShowMatchReportModal(true);
      }
    } else {
      hasAutoOpenedReportRef.current = false;
    }
  }, [isMatchConcluded]);

  const generateReportText = () => {
    const p1Clean = stripNameBoldMarkers(state.name1 || 'PLAYER 1');
    const p2Clean = stripNameBoldMarkers(state.name2 || 'PLAYER 2');
    const winClean = stripNameBoldMarkers(winner || '');
    const runClean = stripNameBoldMarkers(runnerUp || '');
    const title = `🏆 KRAVO PLATNUMZ OFFICIAL — POST-MATCH REPORT`;
    const divider = `══════════════════════════════════════════`;
    const outcome = isMatchConcluded
      ? `👑 CHAMPION: ${winClean} ${winnerFlag} (${winnerScore} frames)\n🥈 RUNNER-UP: ${runClean} ${runnerUpFlag} (${runnerUpScore} frames)`
      : `⚔️ CURRENT LEADER: ${state.score1 >= state.score2 ? p1Clean : p2Clean} (${Math.max(state.score1, state.score2)} - ${Math.min(state.score1, state.score2)})`;

    const showPotInReport = state.showPot !== false && Boolean((state.pot || '').trim());
    const potLine = showPotInReport ? `\n💰 PRIZE POT: ${(state.pot || '').trim()}` : '';

    return `${title}
${divider}
${outcome}
🎯 FINAL SCORE: ${state.score1} - ${state.score2} (Race to ${raceTarget})
🎱 TOTAL FRAMES PLAYED: ${totalFrames}
⚡ MARGIN: ${frameMargin} frame${frameMargin === 1 ? '' : 's'}${potLine}
📍 VENUE: ${state.venue || 'Harare, Zimbabwe'}
🏆 EVENT: ${state.tournament || state.matchType || 'Challenge Match'}
${divider}
📊 PLAYER PERFORMANCE STATS:
• ${p1Clean} ${state.flag1}:
  - Frame Win Rate: ${winRate1}% (${state.score1}/${totalFrames} frames won)
  - Break & Runs (🍏 Green Apples): ${effectiveBR1} (${brRate1}% of won frames)
  - One Visit Clearances (🍎 Red Apples): ${state.appleRed1 || 0}
  - Total Clearance Honors: ${totalApples1}

• ${p2Clean} ${state.flag2}:
  - Frame Win Rate: ${winRate2}% (${state.score2}/${totalFrames} frames won)
  - Break & Runs (🍏 Green Apples): ${effectiveBR2} (${brRate2}% of won frames)
  - One Visit Clearances (🍎 Red Apples): ${state.appleRed2 || 0}
  - Total Clearance Honors: ${totalApples2}
${divider}
🎱 Kravo Platnumz Official Cuesport Scoreboard
Generated on: ${new Date().toLocaleString()}`;
  };

  const copyMatchReport = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    showToast('Copied Post-Match Report to Clipboard!');
  };

  const downloadMatchReport = () => {
    const text = generateReportText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanRoom = (state.room || 'match').replace(/[^a-zA-Z0-9_-]/g, '');
    a.download = `kravo-post-match-report-${cleanRoom}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded Post-Match Report (.txt)');
  };

  const overlayUrl = `${window.location.origin}/overlay.html?room=${encodeURIComponent(state.room)}`;

  // Filter countries
  const filteredCountries = WORLD_COUNTRIES.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(flagSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(flagSearch.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || c.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans select-none">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-sm animate-bounce">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Offline Toast Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Offline Mode — Local Cache Active
        </div>
      )}

      {/* iOS Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" /> Install on iPhone / iPad
              </h3>
              <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To install <strong>Platnumz Scoreboard</strong> as a standalone app on your home screen:
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                <span>Tap the <strong className="text-white">Share</strong> button <Share2 className="w-3.5 h-3.5 inline text-blue-400" /> in Safari’s bottom toolbar.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                <span>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Flag Selector Modal */}
      {targetPlayerForFlag !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  Select Flag for Player {targetPlayerForFlag}
                </h3>
              </div>
              <button onClick={() => setTargetPlayerForFlag(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search countries by name or code (e.g. Zimbabwe, ZW, South Africa)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-amber-400"
                  value={flagSearch}
                  onChange={(e) => setFlagSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 overflow-y-auto max-h-[50vh] p-1">
              {filteredCountries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => selectCountryForPlayer(c, targetPlayerForFlag)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/60 rounded-xl p-2.5 flex items-center gap-2.5 text-left transition group active:scale-95"
                >
                  <FlagBadge codeOrFlag={c.code} alt={c.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-white block truncate group-hover:text-amber-300">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.code}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal (Bypasses iFrame sandbox restrictions) */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${confirmModal.isDestructive ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                  {confirmModal.isDestructive ? '⚠️' : '🔄'}
                </div>
                <h3 className="text-base font-black text-white">
                  {confirmModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModal.description}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition"
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const onConf = confirmModal.onConfirm;
                  setConfirmModal(null);
                  onConf();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-lg transition active:scale-95 ${
                  confirmModal.isDestructive
                    ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-amber-500/20'
                }`}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST-MATCH SUMMARY REPORT MODAL */}
      {showMatchReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-slate-900 via-[#071328] to-slate-950 border-2 border-amber-400/60 p-4 sm:p-6 shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/30">
                  <Trophy className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-wide">POST-MATCH SUMMARY REPORT</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${isMatchConcluded ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-blue-900/60 text-blue-200 border border-blue-500/40'}`}>
                      {isMatchConcluded ? 'Official Result' : 'In Progress'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {state.tournament || state.matchType || 'Challenge Match'} · {state.venue || 'Harare, Zimbabwe'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMatchReportModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Winner / Status Hero Card */}
            <div className="relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#0c224a] via-[#081836] to-[#040e21] border border-amber-400/40 shadow-xl text-center overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
              
              {isMatchConcluded ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase">
                    👑 MATCH CHAMPION
                  </div>
                  <div className="flex items-center justify-center gap-2.5">
                    <FlagBadge codeOrFlag={winnerFlag} alt={winner || ''} size="md" />
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                      {stripNameBoldMarkers(winner || '')}
                    </h2>
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    Defeated <strong className="text-white">{stripNameBoldMarkers(runnerUp || '')}</strong> by <strong className="text-amber-300">+{frameMargin} frame{frameMargin === 1 ? '' : 's'}</strong>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">LIVE MATCH STANDINGS</div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {state.score1 > state.score2 ? `${stripNameBoldMarkers(state.name1)} Leads` : state.score2 > state.score1 ? `${stripNameBoldMarkers(state.name2)} Leads` : 'Match Tied'}
                  </div>
                </div>
              )}

              {/* Large Score Capsule & Race */}
              <div className="mt-3.5 inline-flex items-center gap-3 sm:gap-4 bg-slate-950/80 border border-amber-400/30 rounded-2xl px-5 py-2.5 shadow-inner">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold block truncate max-w-[100px]">{stripNameBoldMarkers(state.name1)}</span>
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">{state.score1}</span>
                </div>
                <div className="text-center px-1">
                  <span className="text-xs font-black text-amber-400 block tracking-widest uppercase">VS</span>
                  <span className="text-[10px] text-slate-400 font-bold">Race to {raceTarget}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold block truncate max-w-[100px]">{stripNameBoldMarkers(state.name2)}</span>
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">{state.score2}</span>
                </div>
              </div>

              {/* Quick Meta Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] font-bold text-slate-300">
                <span className="bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-lg">
                  🎱 Total Frames: <strong className="text-amber-300 font-mono">{totalFrames}</strong>
                </span>
                {state.showPot !== false && Boolean((state.pot || '').trim()) && (
                  <span className="bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-lg">
                    💰 Pot: <strong className="text-emerald-300">{state.pot}</strong>
                  </span>
                )}
                {isHillHill && (
                  <span className="bg-red-950/80 border border-red-500/60 px-2.5 py-1 rounded-lg text-red-300">
                    ⚡ Hill-Hill Thriller
                  </span>
                )}
              </div>
            </div>

            {/* Head-to-Head Performance Comparison Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 tracking-wider">
                  <BarChart2 className="w-4 h-4 text-amber-400" /> Head-to-Head Performance Metrics
                </div>
                <span className="text-[10px] text-slate-400">Official Match Statistics</span>
              </div>

              {/* Player Columns Comparison */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-xs">
                {/* P1 Name */}
                <div className="flex items-center justify-center gap-1.5 font-black text-white truncate">
                  <FlagBadge codeOrFlag={state.flag1} alt={stripNameBoldMarkers(state.name1)} size="sm" />
                  <span className="truncate">{stripNameBoldMarkers(state.name1)}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase px-2">METRIC</div>
                {/* P2 Name */}
                <div className="flex items-center justify-center gap-1.5 font-black text-white truncate">
                  <span className="truncate">{stripNameBoldMarkers(state.name2)}</span>
                  <FlagBadge codeOrFlag={state.flag2} alt={stripNameBoldMarkers(state.name2)} size="sm" />
                </div>
              </div>

              {/* Stat Row 1: Frames Won */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
                <div className="text-center font-black text-base font-mono text-blue-400">{state.score1}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase text-center min-w-[120px]">Frames Won</div>
                <div className="text-center font-black text-base font-mono text-blue-400">{state.score2}</div>
              </div>

              {/* Stat Row 2: Win Rate % with Bar */}
              <div className="space-y-1.5 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div className="text-center font-black font-mono text-sm text-amber-300">{winRate1}%</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase text-center min-w-[120px]">Frame Win Rate</div>
                  <div className="text-center font-black font-mono text-sm text-amber-300">{winRate2}%</div>
                </div>
                {/* Visual Ratio Bar */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${Math.max(5, Math.min(95, totalFrames > 0 ? (state.score1 / totalFrames) * 100 : 50))}%` }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-500"
                  />
                  <div
                    style={{ width: `${Math.max(5, Math.min(95, totalFrames > 0 ? (state.score2 / totalFrames) * 100 : 50))}%` }}
                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Stat Row 3: Break & Runs (Green Apples 🍏) */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
                <div className="text-center font-black text-sm text-emerald-400">
                  🍏 {effectiveBR1} <span className="text-[10px] text-slate-400 block sm:inline font-normal">({brRate1}% of wins)</span>
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase text-center min-w-[130px]">Break & Runs (🍏)</div>
                <div className="text-center font-black text-sm text-emerald-400">
                  🍏 {effectiveBR2} <span className="text-[10px] text-slate-400 block sm:inline font-normal">({brRate2}% of wins)</span>
                </div>
              </div>

              {/* Stat Row 4: One Visit Clearances (Red Apples 🍎) */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
                <div className="text-center font-black text-sm text-red-400">🍎 {state.appleRed1 || 0}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase text-center min-w-[130px]">One Visit Clearances (🍎)</div>
                <div className="text-center font-black text-sm text-red-400">🍎 {state.appleRed2 || 0}</div>
              </div>

              {/* Stat Row 5: Total Apple Honors */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-gradient-to-r from-amber-950/30 via-slate-950 to-amber-950/30 rounded-xl p-2.5 border border-amber-500/30">
                <div className="text-center font-black text-sm text-amber-300 font-mono">{totalApples1}</div>
                <div className="text-[11px] font-black text-amber-400 uppercase text-center min-w-[130px]">Total Apple Honors</div>
                <div className="text-center font-black text-sm text-amber-300 font-mono">{totalApples2}</div>
              </div>
            </div>

            {/* Performance Awards / Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Match MVP</div>
                <div className="text-xs font-black text-amber-300 truncate mt-0.5">
                  🏆 {winner || 'In Contention'}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">One Visit Leader</div>
                <div className="text-xs font-black text-red-300 truncate mt-0.5">
                  🍎 {(state.appleRed1 || 0) > (state.appleRed2 || 0) ? state.name1 : (state.appleRed2 || 0) > (state.appleRed1 || 0) ? state.name2 : (state.appleRed1 || 0) > 0 ? 'Tied Honors' : 'None Awarded'}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Break & Run Ace</div>
                <div className="text-xs font-black text-emerald-300 truncate mt-0.5">
                  🍏 {effectiveBR1 > effectiveBR2 ? state.name1 : effectiveBR2 > effectiveBR1 ? state.name2 : effectiveBR1 > 0 ? 'Tied' : 'None'}
                </div>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {/* Copy WhatsApp / Social report */}
                <button
                  type="button"
                  onClick={copyMatchReport}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition active:scale-95"
                  title="Copy formatted text to paste into WhatsApp, Facebook, or SMS"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy WhatsApp Report
                </button>

                {/* Download Text Report */}
                <button
                  type="button"
                  onClick={downloadMatchReport}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" /> Download (.txt)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMatchReportModal(false);
                    resetToDefaults();
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition"
                >
                  New Match
                </button>

                <button
                  type="button"
                  onClick={() => setShowMatchReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-600 to-blue-700 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-amber-500/20">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-black tracking-wide text-white">PLATNUMZ SCOREBOARD</h1>
                <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded-full font-bold">
                  PRO CUESPORT
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Master Controller & OBS Overlay Synchronizer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Real-time sync badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus === 'connected' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="text-slate-300">
                {syncStatus === 'connected' ? 'Live Synced' : 'Syncing…'}
              </span>
            </div>

            {/* Post-Match Report button */}
            <button
              onClick={() => setShowMatchReportModal(true)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition border ${
                isMatchConcluded
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 font-black shadow-md shadow-amber-500/20 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
              title="View Post-Match Summary Report & Performance Statistics"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Match Report</span>
              {isMatchConcluded && '🏆'}
            </button>

            {/* User Profile / Login Button */}
            {currentUser ? (
              <button
                onClick={() => setActiveTab('account')}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-200 text-xs font-bold transition"
                title="Account & Branding Settings"
              >
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="User" className="w-5 h-5 rounded-full object-cover border border-amber-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="hidden sm:inline truncate max-w-[110px]">{userProfile?.brandName || currentUser.displayName || 'My Profile'}</span>
              </button>
            ) : (
              <button
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                    showToast('Welcome! Signed in with Google');
                  } catch (e: any) {
                    showToast('Sign-in cancelled or failed');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition active:scale-95"
                title="Sign in with Google to personalize your branding"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-950" />
                <span>Login</span>
              </button>
            )}

            {/* Sound toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                showToast(soundEnabled ? 'Muted' : 'Sound Enabled');
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Toggle Audio Feedback"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-4xl mx-auto mt-2 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 pt-2">
          <button
            onClick={() => setActiveTab('controller')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'controller'
                ? 'bg-amber-400 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" /> Score Controller
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'preview'
                ? 'bg-amber-400 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> Live OBS Preview
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'account'
                ? 'bg-amber-400 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Branding & Account {currentUser ? '✨' : ''}
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'admin'
                  ? 'bg-rose-600 text-white font-black shadow-lg shadow-rose-600/30'
                  : 'text-rose-400 hover:text-white hover:bg-rose-950/60 border border-rose-500/30'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-rose-400" /> Admin Hub 👑
            </button>
          )}

          <button
            onClick={() => setActiveTab('flags')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'flags'
                ? 'bg-amber-400 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> All World Flags ({WORLD_COUNTRIES.length})
          </button>

          <button
            onClick={() => setActiveTab('install')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'install'
                ? 'bg-amber-400 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Standalone & Linux Mint
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'github'
                ? 'bg-amber-400 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Github className="w-3.5 h-3.5" /> GitHub Sync
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-4 space-y-3.5">

        {/* REVOKED ACCESS WARNING BANNER */}
        {isRevoked && (
          <div className="bg-gradient-to-r from-red-950 via-rose-950 to-red-950 border-2 border-red-500 rounded-2xl p-4 shadow-2xl flex items-start sm:items-center gap-3.5 text-red-100 animate-in fade-in">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/40 shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  BROADCAST ACCESS SUSPENDED
                </span>
                <span className="text-xs text-red-300 font-bold">
                  Action taken by Master Admin ({ADMIN_EMAIL})
                </span>
              </div>
              <p className="text-xs text-red-200 mt-1 leading-relaxed">
                Your channel publishing privileges have been revoked by the administrator. Contact {ADMIN_EMAIL} to request access reinstatement.
                {userProfile?.revokedReason ? (
                  <span className="font-semibold block text-red-300 mt-0.5">Reason: "{userProfile.revokedReason}"</span>
                ) : null}
              </p>
            </div>
          </div>
        )}

        {/* WINNER ALERT & POST-MATCH REPORT CALLOUT */}
        {winner && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border-2 border-amber-400 rounded-2xl p-3 sm:p-3.5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30 shrink-0">
                <Trophy className="w-6 h-6 text-slate-950" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    MATCH CONCLUDED
                  </span>
                  <span className="text-xs text-amber-200 font-bold">
                    {totalFrames} Total Frames · Final Score: {state.score1} - {state.score2}
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  {stripNameBoldMarkers(winner)} WINS THE MATCH!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMatchReportModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center gap-1.5 transition active:scale-95 shrink-0"
            >
              <BarChart2 className="w-4 h-4" /> View Post-Match Report
            </button>
          </div>
        )}

        {/* HILL-HILL ALERT */}
        {isHillHill && (
          <div className="bg-red-950/80 border border-red-500 rounded-lg p-2 text-center shadow-md">
            <span className="inline-flex items-center gap-1.5 text-red-400 font-black text-xs tracking-wider uppercase animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-red-500" />
              ⚡ HILL - HILL DECIDING FRAME ⚡
              <Flame className="w-3.5 h-3.5 fill-red-500" />
            </span>
          </div>
        )}

        {/* TAB 1: SCORE CONTROLLER */}
        {activeTab === 'controller' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

              {/* PLAYER 1 CARD */}
              <div
                className={`rounded-2xl p-3.5 sm:p-4 shadow-xl relative transition-all duration-200 border ${
                  state.activeShooter === 1
                    ? 'bg-gradient-to-b from-[#1a3363] via-[#0e2042] to-[#071328] border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_28px_rgba(251,191,36,0.24)]'
                    : state.activeShooter === 2
                    ? 'bg-gradient-to-b from-[#0b1b36] to-[#071328] border-blue-500/25 opacity-90'
                    : 'bg-gradient-to-b from-[#0b1b36] to-[#071328] border-blue-500/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${state.activeShooter === 1 ? 'bg-amber-400 animate-ping' : 'bg-blue-400'}`} />
                    <span className={`text-[10px] uppercase font-black tracking-wider ${state.activeShooter === 1 ? 'text-amber-300' : 'text-blue-400'}`}>
                      PLAYER 1
                    </span>
                    {state.activeShooter === 1 && (
                      <span
                        key={`on-table-p1-${state.activeShooter}`}
                        className="on-table-badge-pulse inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        ON TABLE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveShooter(1)}
                      className={`text-[10px] px-2.5 py-0.5 rounded-md font-black transition flex items-center gap-1 active:scale-95 border ${
                        state.activeShooter === 1
                          ? 'bg-amber-400/20 hover:bg-red-500/25 text-amber-200 hover:text-red-200 border-amber-400/60 hover:border-red-400/60'
                          : 'bg-slate-900/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border-slate-700 hover:border-amber-400/50'
                      }`}
                      title={state.activeShooter === 1 ? 'Click to remove ON TABLE indicator (Hotkey 1 or 0)' : 'Mark Player 1 as active shooter ON TABLE (Hotkey 1)'}
                    >
                      {state.activeShooter === 1 ? (
                        <>
                          <X className="w-2.5 h-2.5" /> Clear On Table
                        </>
                      ) : (
                        <>
                          <Zap className="w-2.5 h-2.5 text-amber-400" /> Set On Table
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setTargetPlayerForFlag(1)}
                      className="text-[10px] text-amber-300 hover:text-white bg-blue-900/60 hover:bg-blue-800 px-2 py-0.5 rounded-md border border-blue-400/30 font-bold transition flex items-center gap-1"
                    >
                      Change Flag <Globe className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <button
                    type="button"
                    onClick={() => setTargetPlayerForFlag(1)}
                    className="p-0.5 rounded-md hover:ring-2 hover:ring-amber-400 transition shrink-0"
                    title="Click to change flag"
                  >
                    <FlagBadge codeOrFlag={state.flag1} size="md" alt="P1 Flag" />
                  </button>
                  <input
                    ref={name1InputRef}
                    className={`flex-1 min-w-0 bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-base sm:text-lg text-white outline-none focus:border-amber-400 transition ${
                      state.nameBold1 === false && !/\*\*[^*]+\*\*/.test(state.name1 || '')
                        ? 'font-medium'
                        : 'font-black'
                    }`}
                    value={state.name1}
                    onChange={(e) => {
                      const updated = { ...state, name1: e.target.value, updatedAt: Date.now() };
                      syncState(updated, false);
                    }}
                    onBlur={flushSync}
                    placeholder="PLAYER 1 NAME"
                  />
                </div>

                {/* Name Boldness Controls (Whole Name or Selected/Word Part) */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5 px-0.5">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 mr-0.5">Name:</span>
                    <button
                      type="button"
                      onClick={() => applyNameBoldMode(1, 'all')}
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-black transition ${
                        state.nameBold1 !== false && !/\*\*[^*]+\*\*/.test(state.name1 || '')
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                      title="Make entire name bold"
                    >
                      All Bold
                    </button>
                    <button
                      type="button"
                      onClick={() => applyNameBoldMode(1, 'normal')}
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium transition ${
                        state.nameBold1 === false && !/\*\*[^*]+\*\*/.test(state.name1 || '')
                          ? 'bg-blue-500 text-white border-blue-400'
                          : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                      title="Make entire name regular weight"
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => applyNameBoldMode(1, 'first')}
                      className="text-[10px] px-1.5 py-0.5 rounded border bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border-slate-700 font-semibold transition"
                      title="Bold only the 1st word"
                    >
                      1st Word
                    </button>
                    <button
                      type="button"
                      onClick={() => applyNameBoldMode(1, 'last')}
                      className="text-[10px] px-1.5 py-0.5 rounded border bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border-slate-700 font-semibold transition"
                      title="Bold only the last word"
                    >
                      Last Word
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyNameBoldMode(1, 'selection')}
                      className="text-[10px] px-1.5 py-0.5 rounded border bg-slate-900/80 hover:bg-amber-500/20 text-amber-300 border-amber-500/40 font-black transition"
                      title="Highlight any part of the name above and click to toggle bold on just that part (or wrap with **text**)"
                    >
                      B Selected
                    </button>
                  </div>
                  {(/\*\*[^*]+\*\*/.test(state.name1 || '') || state.nameBold1 === false) && (
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide truncate max-w-full">
                      Overlay: {renderFormattedNameJSX(state.name1 || 'PLAYER 1', state.nameBold1 !== false)}
                    </span>
                  )}
                </div>

                {/* Integrated Compact Horizontal Score Row */}
                <div className="bg-slate-950/60 rounded-xl border border-white/5 p-2 mb-2.5">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    {/* -1 Button */}
                    <button
                      onClick={() => updateScore(1, -1)}
                      className="h-14 sm:h-16 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 transition active:scale-95 border border-slate-700"
                      title="Decrease Score (Hotkey A)"
                    >
                      <div className="flex items-center gap-1">
                        <Minus className="w-4 h-4" /> <span>−1 Frame</span>
                      </div>
                      <kbd className="text-[9px] text-slate-400 bg-slate-900/80 px-1 py-0.2 rounded font-mono">Key A</kbd>
                    </button>

                    {/* Score Number Display */}
                    <div className="px-5 sm:px-7 py-1 text-center bg-slate-900/90 rounded-lg border border-slate-700/60 shadow-inner min-w-[90px]">
                      <div className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono leading-none">
                        {state.score1}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-amber-400 font-bold mt-1">Frames</div>
                    </div>

                    {/* +1 Button */}
                    <button
                      onClick={() => updateScore(1, 1)}
                      className="h-14 sm:h-16 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 shadow-md shadow-amber-500/20 transition active:scale-95"
                      title="Increase Score (Hotkey Q)"
                    >
                      <div className="flex items-center gap-1">
                        <Plus className="w-4 h-4" /> <span>+1 Frame</span>
                      </div>
                      <kbd className="text-[9px] text-slate-900 bg-amber-300 px-1 py-0.2 rounded font-mono font-bold">Key Q</kbd>
                    </button>
                  </div>
                </div>

                {/* Clearance Honors: Green Apple (Break & Run) & Red Apple (One Visit Clearance) */}
                <div className="bg-slate-950/60 rounded-xl border border-white/5 p-2.5 sm:p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs sm:text-sm">
                      <span className="text-base">🍏</span> Clearance Honors (Apples)
                    </span>
                    <span className="text-[10px] text-slate-400">🍏 Break & Run · 🍎 One Visit</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* GREEN APPLE — BREAK & RUN */}
                    <div className="flex items-center justify-between bg-emerald-950/50 border border-emerald-500/40 rounded-xl px-2.5 py-2 shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-2xl select-none leading-none filter drop-shadow shrink-0">🍏</span>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-emerald-200 block leading-tight">Green Apple</span>
                          <span className="text-[9px] text-emerald-400/90 font-semibold block leading-tight">Break & Run</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateApple(1, 'green', -1)}
                          className="w-8 h-8 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 active:scale-95 text-emerald-200 font-bold flex items-center justify-center border border-emerald-700/60 transition shadow"
                          title="Decrease Break & Run (Green Apple)"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="min-w-8 text-center font-mono font-black text-lg text-white px-2 py-0.5 rounded-lg bg-slate-950 border border-emerald-500/50 shadow-inner">
                          {state.appleGreen1 || 0}
                        </div>
                        <button
                          type="button"
                          onClick={() => updateApple(1, 'green', 1)}
                          className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 active:scale-95 text-white font-bold flex items-center justify-center shadow transition"
                          title="Increase Break & Run (Green Apple)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* RED APPLE — ONE VISIT CLEARANCE */}
                    <div className="flex items-center justify-between bg-red-950/50 border border-red-500/40 rounded-xl px-2.5 py-2 shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-2xl select-none leading-none filter drop-shadow shrink-0">🍎</span>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-red-200 block leading-tight">Red Apple</span>
                          <span className="text-[9px] text-red-400/90 font-semibold block leading-tight">
                            <span className="sm:hidden">One Visit</span>
                            <span className="hidden sm:inline">One Visit Clearance</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateApple(1, 'red', -1)}
                          className="w-8 h-8 rounded-lg bg-red-900/70 hover:bg-red-800 active:scale-95 text-red-200 font-bold flex items-center justify-center border border-red-700/60 transition shadow"
                          title="Decrease One Visit Clearance (Red Apple)"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="min-w-8 text-center font-mono font-black text-lg text-white px-2 py-0.5 rounded-lg bg-slate-950 border border-red-500/50 shadow-inner">
                          {state.appleRed1 || 0}
                        </div>
                        <button
                          type="button"
                          onClick={() => updateApple(1, 'red', 1)}
                          className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:brightness-110 active:scale-95 text-white font-bold flex items-center justify-center shadow transition"
                          title="Increase One Visit Clearance (Red Apple)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* PLAYER 2 CARD */}
              <div
                className={`rounded-2xl p-3.5 sm:p-4 shadow-xl relative transition-all duration-200 border ${
                  state.activeShooter === 2
                    ? 'bg-gradient-to-b from-[#1a3363] via-[#0e2042] to-[#071328] border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_28px_rgba(251,191,36,0.24)]'
                    : state.activeShooter === 1
                    ? 'bg-gradient-to-b from-[#0b1b36] to-[#071328] border-blue-500/25 opacity-90'
                    : 'bg-gradient-to-b from-[#0b1b36] to-[#071328] border-blue-500/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${state.activeShooter === 2 ? 'bg-amber-400 animate-ping' : 'bg-blue-400'}`} />
                    <span className={`text-[10px] uppercase font-black tracking-wider ${state.activeShooter === 2 ? 'text-amber-300' : 'text-blue-400'}`}>
                      PLAYER 2
                    </span>
                    {state.activeShooter === 2 && (
                      <span
                        key={`on-table-p2-${state.activeShooter}`}
                        className="on-table-badge-pulse inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        ON TABLE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveShooter(2)}
                      className={`text-[10px] px-2.5 py-0.5 rounded-md font-black transition flex items-center gap-1 active:scale-95 border ${
                        state.activeShooter === 2
                          ? 'bg-amber-400/20 hover:bg-red-500/25 text-amber-200 hover:text-red-200 border-amber-400/60 hover:border-red-400/60'
                          : 'bg-slate-900/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border-slate-700 hover:border-amber-400/50'
                      }`}
                      title={state.activeShooter === 2 ? 'Click to remove ON TABLE indicator (Hotkey 2 or 0)' : 'Mark Player 2 as active shooter ON TABLE (Hotkey 2)'}
                    >
                      {state.activeShooter === 2 ? (
                        <>
                          <X className="w-2.5 h-2.5" /> Clear On Table
                        </>
                      ) : (
                        <>
                          <Zap className="w-2.5 h-2.5 text-amber-400" /> Set On Table
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setTargetPlayerForFlag(2)}
                      className="text-[10px] text-amber-300 hover:text-white bg-blue-900/60 hover:bg-blue-800 px-2 py-0.5 rounded-md border border-blue-400/30 font-bold transition flex items-center gap-1"
                    >
                      Change Flag <Globe className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <button
                    type="button"
                    onClick={() => setTargetPlayerForFlag(2)}
                    className="p-0.5 rounded-md hover:ring-2 hover:ring-amber-400 transition shrink-0"
                    title="Click to change flag"
                  >
                    <FlagBadge codeOrFlag={state.flag2} size="md" alt="P2 Flag" />
                  </button>
                  <input
                    ref={name2InputRef}
                    className={`flex-1 min-w-0 bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-base sm:text-lg text-white outline-none focus:border-amber-400 transition ${
                      state.nameBold2 === false && !/\*\*[^*]+\*\*/.test(state.name2 || '')
                        ? 'font-medium'
                        : 'font-black'
                    }`}
                    value={state.name2}
                    onChange={(e) => {
                      const updated = { ...state, name2: e.target.value, updatedAt: Date.now() };
                      syncState(updated, false);
                    }}
                    onBlur={flushSync}
                    placeholder="PLAYER 2 NAME"
                  />
                </div>

                {/* Name Boldness Controls (Whole Name or Selected/Word Part) */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5 px-0.5">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 mr-0.5">Name:</span>
                    <button
                      type="button"
                      onClick={() => applyNameBoldMode(2, 'all')}
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-black transition ${
                        state.nameBold2 !== false && !/\*\*[^*]+\*\*/.test(state.name2 || '')
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                      title="Make entire name bold"
                    >
                      All Bold
                    </button>
                    <button
                      type="button"
                      onClick={() => applyNameBoldMode(2, 'normal')}
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium transition ${
                        state.nameBold2 === false && !/\*\*[^*]+\*\*/.test(state.name2 || '')
                          ? 'bg-blue-500 text-white border-blue-400'
                          : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                      title="Make entire name regular weight"
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => applyNameBoldMode(2, 'first')}
                      className="text-[10px] px-1.5 py-0.5 rounded border bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border-slate-700 font-semibold transition"
                      title="Bold only the 1st word"
                    >
                      1st Word
                    </button>
                    <button
                      type="button"
                      onClick={() => applyNameBoldMode(2, 'last')}
                      className="text-[10px] px-1.5 py-0.5 rounded border bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border-slate-700 font-semibold transition"
                      title="Bold only the last word"
                    >
                      Last Word
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyNameBoldMode(2, 'selection')}
                      className="text-[10px] px-1.5 py-0.5 rounded border bg-slate-900/80 hover:bg-amber-500/20 text-amber-300 border-amber-500/40 font-black transition"
                      title="Highlight any part of the name above and click to toggle bold on just that part (or wrap with **text**)"
                    >
                      B Selected
                    </button>
                  </div>
                  {(/\*\*[^*]+\*\*/.test(state.name2 || '') || state.nameBold2 === false) && (
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide truncate max-w-full">
                      Overlay: {renderFormattedNameJSX(state.name2 || 'PLAYER 2', state.nameBold2 !== false)}
                    </span>
                  )}
                </div>

                {/* Integrated Compact Horizontal Score Row */}
                <div className="bg-slate-950/60 rounded-xl border border-white/5 p-2 mb-2.5">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    {/* -1 Button */}
                    <button
                      onClick={() => updateScore(2, -1)}
                      className="h-14 sm:h-16 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 transition active:scale-95 border border-slate-700"
                      title="Decrease Score (Hotkey L)"
                    >
                      <div className="flex items-center gap-1">
                        <Minus className="w-4 h-4" /> <span>−1 Frame</span>
                      </div>
                      <kbd className="text-[9px] text-slate-400 bg-slate-900/80 px-1 py-0.2 rounded font-mono">Key L</kbd>
                    </button>

                    {/* Score Number Display */}
                    <div className="px-5 sm:px-7 py-1 text-center bg-slate-900/90 rounded-lg border border-slate-700/60 shadow-inner min-w-[90px]">
                      <div className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono leading-none">
                        {state.score2}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-amber-400 font-bold mt-1">Frames</div>
                    </div>

                    {/* +1 Button */}
                    <button
                      onClick={() => updateScore(2, 1)}
                      className="h-14 sm:h-16 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 shadow-md shadow-amber-500/20 transition active:scale-95"
                      title="Increase Score (Hotkey P)"
                    >
                      <div className="flex items-center gap-1">
                        <Plus className="w-4 h-4" /> <span>+1 Frame</span>
                      </div>
                      <kbd className="text-[9px] text-slate-900 bg-amber-300 px-1 py-0.2 rounded font-mono font-bold">Key P</kbd>
                    </button>
                  </div>
                </div>

                {/* Clearance Honors: Green Apple (Break & Run) & Red Apple (One Visit Clearance) */}
                <div className="bg-slate-950/60 rounded-xl border border-white/5 p-2.5 sm:p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs sm:text-sm">
                      <span className="text-base">🍏</span> Clearance Honors (Apples)
                    </span>
                    <span className="text-[10px] text-slate-400">🍏 Break & Run · 🍎 One Visit</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* GREEN APPLE — BREAK & RUN */}
                    <div className="flex items-center justify-between bg-emerald-950/50 border border-emerald-500/40 rounded-xl px-2.5 py-2 shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-2xl select-none leading-none filter drop-shadow shrink-0">🍏</span>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-emerald-200 block leading-tight">Green Apple</span>
                          <span className="text-[9px] text-emerald-400/90 font-semibold block leading-tight">Break & Run</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateApple(2, 'green', -1)}
                          className="w-8 h-8 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 active:scale-95 text-emerald-200 font-bold flex items-center justify-center border border-emerald-700/60 transition shadow"
                          title="Decrease Break & Run (Green Apple)"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="min-w-8 text-center font-mono font-black text-lg text-white px-2 py-0.5 rounded-lg bg-slate-950 border border-emerald-500/50 shadow-inner">
                          {state.appleGreen2 || 0}
                        </div>
                        <button
                          type="button"
                          onClick={() => updateApple(2, 'green', 1)}
                          className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 active:scale-95 text-white font-bold flex items-center justify-center shadow transition"
                          title="Increase Break & Run (Green Apple)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* RED APPLE — ONE VISIT CLEARANCE */}
                    <div className="flex items-center justify-between bg-red-950/50 border border-red-500/40 rounded-xl px-2.5 py-2 shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-2xl select-none leading-none filter drop-shadow shrink-0">🍎</span>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-red-200 block leading-tight">Red Apple</span>
                          <span className="text-[9px] text-red-400/90 font-semibold block leading-tight">
                            <span className="sm:hidden">One Visit</span>
                            <span className="hidden sm:inline">One Visit Clearance</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateApple(2, 'red', -1)}
                          className="w-8 h-8 rounded-lg bg-red-900/70 hover:bg-red-800 active:scale-95 text-red-200 font-bold flex items-center justify-center border border-red-700/60 transition shadow"
                          title="Decrease One Visit Clearance (Red Apple)"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="min-w-8 text-center font-mono font-black text-lg text-white px-2 py-0.5 rounded-lg bg-slate-950 border border-red-500/50 shadow-inner">
                          {state.appleRed2 || 0}
                        </div>
                        <button
                          type="button"
                          onClick={() => updateApple(2, 'red', 1)}
                          className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:brightness-110 active:scale-95 text-white font-bold flex items-center justify-center shadow transition"
                          title="Increase One Visit Clearance (Red Apple)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 py-0.5">
              {/* Active Shooter (On Table) Segmented Control with instant Off/Remove option */}
              <div className="inline-flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 gap-0.5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> On Table:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveShooter(1)}
                  className={`px-2.5 py-1 rounded-md text-xs font-black transition flex items-center gap-1 ${
                    state.activeShooter === 1
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Mark Player 1 On Table (Hotkey 1)"
                >
                  P1 <kbd className="text-[9px] opacity-70 font-mono">1</kbd>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveShooter(0)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                    (state.activeShooter || 0) === 0
                      ? 'bg-slate-700 text-white shadow'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-red-300'
                  }`}
                  title="Remove On Table indicator when not tracking turns (Hotkey 0)"
                >
                  Off <kbd className="text-[9px] opacity-70 font-mono">0</kbd>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveShooter(2)}
                  className={`px-2.5 py-1 rounded-md text-xs font-black transition flex items-center gap-1 ${
                    state.activeShooter === 2
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Mark Player 2 On Table (Hotkey 2)"
                >
                  P2 <kbd className="text-[9px] opacity-70 font-mono">2</kbd>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowMatchReportModal(true)}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 border transition active:scale-95 shadow-sm ${
                  isMatchConcluded
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 font-black shadow-amber-500/30 animate-pulse'
                    : 'bg-blue-900/50 hover:bg-blue-800/80 text-amber-300 border-blue-500/40'
                }`}
                title="View Post-Match Summary Report & Performance Statistics"
              >
                <BarChart2 className="w-3.5 h-3.5 text-amber-400" /> Post-Match Report {isMatchConcluded && '🏆'}
              </button>
              <button
                onClick={swapPlayers}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition active:scale-95"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" /> Swap Players & Flags <kbd className="text-[9px] text-slate-400 bg-slate-900 px-1 py-0.2 rounded font-mono">S</kbd>
              </button>
              <button
                onClick={resetScores}
                className="px-3.5 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-800/80 text-red-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Scores & Break/Run <kbd className="text-[9px] text-red-300 bg-red-950 px-1 py-0.2 rounded font-mono">R</kbd>
              </button>
            </div>

            {/* Match Information Form (Centralized Bottom Panel with Larger Font) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3.5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800 pb-2.5 text-center sm:text-left">
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-amber-400 font-black">Match Details & Broadcast Settings</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time persistent sync to OBS broadcast overlay</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-700/50 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Autosaved
                  </span>
                </div>
              </div>

              {/* Centralized Form Fields with Enhanced Font Size */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs uppercase font-bold text-slate-300 block mb-1">Venue / City</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-sm font-medium outline-none focus:border-amber-400 transition"
                    value={state.venue}
                    onChange={(e) => {
                      const updated = { ...state, venue: e.target.value, updatedAt: Date.now() };
                      syncState(updated, false);
                    }}
                    onBlur={flushSync}
                    placeholder="e.g. HARARE, ZIMBABWE"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-slate-300 block mb-1">Match Type</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-sm font-medium outline-none focus:border-amber-400 transition"
                    value={state.matchType || state.tournament || ''}
                    onChange={(e) => {
                      const updated = {
                        ...state,
                        matchType: e.target.value,
                        tournament: e.target.value,
                        updatedAt: Date.now()
                      };
                      syncState(updated, false);
                    }}
                    onBlur={flushSync}
                    placeholder="e.g. Challenge Match, Money Match, Tournament"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs uppercase font-bold text-slate-300">Prize Pot</label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextShowPot = state.showPot === false;
                        const updated = { ...state, showPot: nextShowPot, updatedAt: Date.now() };
                        syncState(updated, true);
                        showToast(nextShowPot ? 'Prize Pot shown on overlay' : 'Prize Pot removed for tournament');
                      }}
                      title={state.showPot === false ? 'Show Prize Pot on overlay' : 'Remove Prize Pot altogether for tournaments'}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border transition cursor-pointer ${
                        state.showPot === false
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-red-950/60 hover:text-red-300 hover:border-red-700/50'
                      }`}
                    >
                      {state.showPot === false ? 'Show Pot' : 'Remove Pot'}
                    </button>
                  </div>
                  {state.showPot === false ? (
                    <div className="w-full bg-slate-950/60 border border-dashed border-slate-700/80 rounded-lg px-3 py-2 text-slate-400 text-xs font-semibold flex items-center justify-between">
                      <span>Pot hidden (Tournament mode)</span>
                    </div>
                  ) : (
                    <input
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-sm font-medium outline-none focus:border-amber-400 transition"
                      value={state.pot}
                      onChange={(e) => {
                        const updated = { ...state, pot: e.target.value, updatedAt: Date.now() };
                        syncState(updated, false);
                      }}
                      onBlur={flushSync}
                      placeholder="e.g. $500 (empty hides POT)"
                    />
                  )}
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-slate-300 block mb-1">Race To (Frames)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm outline-none focus:border-amber-400 transition"
                    value={state.raceTo}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                      const updated = { ...state, raceTo: val, updatedAt: Date.now() };
                      syncState(updated, false);
                    }}
                    onBlur={flushSync}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-slate-300 block mb-1">Brand / Media</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-sm font-medium outline-none focus:border-amber-400 transition"
                    value={state.brand}
                    onChange={(e) => {
                      const updated = { ...state, brand: e.target.value, updatedAt: Date.now() };
                      syncState(updated, false);
                    }}
                    onBlur={flushSync}
                    placeholder="e.g. KRAVO PLATNUMZ OFFICIAL"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-slate-300 block mb-1">Overlay Position</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-sm font-medium outline-none focus:border-amber-400 cursor-pointer transition"
                    value={state.overlayPosition || 'bottom'}
                    onChange={(e) => {
                      const pos = (e.target.value === 'top' ? 'top' : 'bottom') as 'bottom' | 'top';
                      const updated = { ...state, overlayPosition: pos, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                  >
                    <option value="bottom">Bottom (Standard Broadcast)</option>
                    <option value="top">Top (Header Banner)</option>
                  </select>
                </div>
              </div>

              {/* Reset to Factory Defaults Footer (Centralized) */}
              <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-center gap-2">
                <span className="text-xs text-slate-400">
                  Entered details stay saved even when refreshing the browser or restarting the computer.
                </span>
                <button
                  type="button"
                  onClick={resetToDefaults}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
                  title="Restore clean match template (PLAYER 1 vs PLAYER 2, 0 - 0, Race to 5)"
                >
                  Restore Sample Defaults
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE OBS PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-amber-400" /> Live Broadcast Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time OBS stream overlay with styled flags, names, and Break & Run badges.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(overlayUrl);
                    showToast('Copied OBS URL!');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy OBS URL
                </button>
                <button
                  onClick={() => window.open(overlayUrl, '_blank')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Direct Overlay
                </button>
              </div>
            </div>

            {/* Simulated 1080p Screen */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-[#030914] aspect-video w-full flex flex-col justify-end">
              <iframe
                src={`/overlay.html?room=${encodeURIComponent(state.room)}`}
                title="OBS Overlay Preview"
                className="w-full h-full border-none bg-transparent"
              />
            </div>
          </div>
        )}

        {/* TAB: BRANDING & ACCOUNT PERSONALIZATION */}
        {activeTab === 'account' && (
          <div className="max-w-3xl mx-auto space-y-5">
            {currentUser ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-2xl">
                {/* User Header Profile */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-3.5">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="Avatar" className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-lg" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center">
                        {currentUser.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-white">{currentUser.displayName || 'Kravo User'}</h3>
                        {isAdmin ? (
                          <span className="text-[10px] bg-rose-500/25 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full font-black flex items-center gap-1 shadow-sm">
                            <Shield className="w-3 h-3 text-rose-400" /> Master Admin
                          </span>
                        ) : isRevoked ? (
                          <span className="text-[10px] bg-red-500/25 text-red-300 border border-red-500/40 px-2.5 py-0.5 rounded-full font-black flex items-center gap-1 shadow-sm">
                            <ShieldAlert className="w-3 h-3 text-red-400" /> Access Revoked
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                            Active Streamer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('admin')}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-rose-200 text-xs font-bold transition active:scale-95"
                        >
                          <Shield className="w-3.5 h-3.5 text-rose-400" /> Open Admin Hub to Revoke / Manage Accounts
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await signOut();
                      showToast('Logged out');
                    }}
                    className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/70 hover:text-red-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>

                {/* Personal OBS Stream Links Card */}
                <div className="bg-gradient-to-br from-[#0c2044] to-slate-950 border border-blue-500/40 rounded-xl p-4 sm:p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black uppercase text-amber-300 tracking-wider">Your Permanent Personal OBS Browser Source</span>
                    </div>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono">
                      Isolated Channel
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Paste this exact URL into OBS Studio as a Browser Source. Only your scoring dashboard controls this overlay, completely private from all other users:
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex-1 bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2 font-mono text-xs text-amber-300 truncate select-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}/overlay.html?room=${userProfile?.channelSlug || 'channel'}` : ''}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/overlay.html?room=${userProfile?.channelSlug || 'channel'}`;
                        navigator.clipboard.writeText(url);
                        showToast('Copied Personal OBS URL!');
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy OBS Link
                    </button>
                  </div>
                </div>

                {/* Personalize Branding Settings Form */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Customize Your Overlay Branding</h4>
                    </div>
                    <span className="text-[10px] text-slate-400">Stored in your Cloud Account</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Brand Name */}
                    <div>
                      <label className="text-xs uppercase font-bold text-slate-300 block mb-1">
                        Brand / League Name
                      </label>
                      <input
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none focus:border-amber-400"
                        value={userProfile?.brandName || ''}
                        onChange={(e) => updateProfileData({ brandName: e.target.value }, false)}
                        onBlur={() => flushProfileSave?.()}
                        placeholder="e.g. QUEENS POOL ACADEMY"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">Displayed on the live broadcast ticker</span>
                    </div>

                    {/* Channel Slug */}
                    <div>
                      <label className="text-xs uppercase font-bold text-slate-300 block mb-1">
                        Private Channel Slug
                      </label>
                      <input
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono text-xs font-bold outline-none focus:border-amber-400"
                        value={userProfile?.channelSlug || ''}
                        onChange={(e) => {
                          const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32);
                          updateProfileData({ channelSlug: clean }, false);
                        }}
                        onBlur={() => flushProfileSave?.()}
                        placeholder="e.g. harare-champions"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">Forms your OBS URL: /overlay.html?room={userProfile?.channelSlug}</span>
                    </div>

                    {/* Default Venue */}
                    <div>
                      <label className="text-xs uppercase font-bold text-slate-300 block mb-1">
                        Home Venue / Club Location
                      </label>
                      <input
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-amber-400"
                        value={userProfile?.defaultVenue || ''}
                        onChange={(e) => updateProfileData({ defaultVenue: e.target.value }, false)}
                        onBlur={() => flushProfileSave?.()}
                        placeholder="e.g. BULAWAYO CUE CLUB"
                      />
                    </div>

                    {/* Quick Broadcast Theme Preset */}
                    <div>
                      <label className="text-xs uppercase font-bold text-slate-300 block mb-1">
                        Broadcast Color Accent
                      </label>
                      <div className="flex items-center gap-2 pt-1">
                        {[
                          { name: 'Royal Blue', color: '#0066f6' },
                          { name: 'Emerald Baize', color: '#10b981' },
                          { name: 'Gold Trophy', color: '#f59e0b' },
                          { name: 'Crimson Clash', color: '#ef4444' }
                        ].map((th) => (
                          <button
                            key={th.name}
                            type="button"
                            onClick={() => {
                              updateProfileData({ themeColor: th.color }, true);
                              showToast(`Theme set to ${th.name}`);
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition ${
                              userProfile?.themeColor === th.color
                                ? 'bg-slate-800 text-white border-amber-400'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: th.color }} />
                            <span>{th.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Apply Branding to Active Match Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!userProfile) return;
                        const updated = {
                          ...state,
                          brand: userProfile.brandName || state.brand,
                          venue: userProfile.defaultVenue || state.venue,
                          room: userProfile.channelSlug || state.room,
                          updatedAt: Date.now()
                        };
                        syncState(updated);
                        showToast('Applied your branding & channel to current match!');
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs shadow-md transition flex items-center gap-2 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Apply My Branding to Live Scoreboard Now
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Signed Out State / Value Proposition */
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-blue-700 flex items-center justify-center font-black text-slate-950 text-3xl mx-auto shadow-xl shadow-amber-500/20">
                  <User className="w-8 h-8 text-slate-950" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-xl font-black text-white">Create Your Personal Scoreboard Account</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sign in with Google to get your own dedicated OBS overlay URL, customize your league logo & brand name, and save match history to the cloud.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <div className="text-amber-400 font-black text-xs mb-1">🔒 Private OBS Link</div>
                    <div className="text-[11px] text-slate-400">Never get your overlay overwritten by other streamers.</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <div className="text-amber-400 font-black text-xs mb-1">🎨 Custom Branding</div>
                    <div className="text-[11px] text-slate-400">Display your own club logo, title, and venue in the stream ticker.</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <div className="text-amber-400 font-black text-xs mb-1">☁️ Multi-Device Sync</div>
                    <div className="text-[11px] text-slate-400">Score from your phone at table-side while OBS runs on your PC.</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                      showToast('Welcome! Signed in with Google');
                    } catch (e: any) {
                      showToast('Sign-in cancelled or failed');
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 inline-flex items-center gap-2 transition active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-slate-950" />
                  Sign In with Google Account
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: SUPER ADMIN ACCESS CONTROL & USER REVOCATION HUB */}
        {activeTab === 'admin' && isAdmin && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
            {/* Super Admin Banner Card */}
            <div className="bg-gradient-to-r from-slate-950 via-rose-950/40 to-slate-950 border border-rose-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-rose-600/30 shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white tracking-wide">Super Admin Command Center</h3>
                      <span className="text-[10px] bg-rose-500/25 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                        Full Authority
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Master Administrator: <span className="font-mono text-rose-300 font-semibold">{ADMIN_EMAIL}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadUsersForAdmin}
                    disabled={loadingAdminUsers}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingAdminUsers ? 'animate-spin text-rose-400' : ''}`} />
                    Refresh Accounts
                  </button>
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Registered</div>
                  <div className="text-2xl font-black text-white mt-1 font-mono">
                    {adminUsers.length}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Accounts in Cloud Firestore</div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Active Broadcasters
                  </div>
                  <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                    {adminUsers.filter((u) => u.status !== 'revoked').length}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Can publish live scores to OBS</div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Revoked Accounts
                  </div>
                  <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
                    {adminUsers.filter((u) => u.status === 'revoked').length}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Publishing privileges suspended</div>
                </div>
              </div>
            </div>

            {/* Revoke Confirmation Modal Dialog */}
            {revokingUser && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border-2 border-red-500/60 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">Confirm Revoke Access</h4>
                        <p className="text-xs text-slate-400">Target: {revokingUser.displayName || revokingUser.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRevokingUser(null);
                        setRevocationReason('');
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Revoking access will immediately prevent this user from saving scores, broadcasting on their channel, or altering their settings in Firestore.
                  </p>

                  <div>
                    <label className="text-xs uppercase font-bold text-slate-300 block mb-1">
                      Reason for Revocation (Optional note)
                    </label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-red-500"
                      placeholder="e.g. Terms violation, unauthorized stream, or suspended match"
                      value={revocationReason}
                      onChange={(e) => setRevocationReason(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRevokingUser(null);
                        setRevocationReason('');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmRevoke}
                      disabled={actionProcessingUid === revokingUser.uid}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {actionProcessingUid === revokingUser.uid ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserX className="w-3.5 h-3.5" />
                      )}
                      Revoke Access Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Accounts Directory */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-400" /> Registered User Accounts
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Search and manage individual account permissions across the platform
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    placeholder="Search name, email, slug..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Users List */}
              {loadingAdminUsers ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rose-400" />
                  <p className="text-xs">Loading user registry from Cloud Firestore...</p>
                </div>
              ) : adminUsers.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs">
                  No accounts found. Click "Refresh Accounts" to sync with Firestore.
                </div>
              ) : (
                <div className="space-y-3">
                  {adminUsers
                    .filter((u) => {
                      if (!adminSearchQuery.trim()) return true;
                      const q = adminSearchQuery.toLowerCase();
                      return (
                        u.displayName?.toLowerCase().includes(q) ||
                        u.email?.toLowerCase().includes(q) ||
                        u.channelSlug?.toLowerCase().includes(q) ||
                        u.brandName?.toLowerCase().includes(q)
                      );
                    })
                    .map((userItem) => {
                      const isMasterUser = userItem.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                      const isItemRevoked = userItem.status === 'revoked';

                      return (
                        <div
                          key={userItem.uid}
                          className={`border rounded-xl p-3.5 sm:p-4 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            isItemRevoked
                              ? 'bg-red-950/20 border-red-900/60'
                              : isMasterUser
                              ? 'bg-rose-950/20 border-rose-900/40'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* User Identity info */}
                          <div className="flex items-start sm:items-center gap-3">
                            {userItem.photoURL ? (
                              <img
                                src={userItem.photoURL}
                                alt={userItem.displayName}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-black text-amber-400 shrink-0">
                                {userItem.displayName?.charAt(0) || 'U'}
                              </div>
                            )}

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-black text-white">{userItem.displayName || 'Unnamed User'}</span>
                                {isMasterUser ? (
                                  <span className="text-[10px] bg-rose-500/25 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-black">
                                    Master Admin
                                  </span>
                                ) : isItemRevoked ? (
                                  <span className="text-[10px] bg-red-500/25 text-red-300 border border-red-500/50 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3 text-red-400" /> REVOKED
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-400" /> ACTIVE
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">{userItem.email}</p>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500">
                                <span>Brand: <strong className="text-slate-300">{userItem.brandName || 'Default'}</strong></span>
                                <span>•</span>
                                <span>Channel: <strong className="text-amber-300 font-mono">/overlay.html?room={userItem.channelSlug}</strong></span>
                                {userItem.defaultVenue && (
                                  <>
                                    <span>•</span>
                                    <span>Venue: {userItem.defaultVenue}</span>
                                  </>
                                )}
                              </div>

                              {isItemRevoked && userItem.revokedReason && (
                                <p className="text-[11px] text-red-300/90 mt-1 italic">
                                  Revocation Note: "{userItem.revokedReason}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Controls */}
                          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                            {/* Preview OBS Link */}
                            <a
                              href={`/overlay.html?room=${userItem.channelSlug || 'channel'}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
                              title="Preview user overlay in browser"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Preview</span>
                            </a>

                            {/* Revoke / Restore Action */}
                            {isMasterUser ? (
                              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-500">
                                Protected
                              </span>
                            ) : isItemRevoked ? (
                              <button
                                type="button"
                                onClick={() => handleRestoreAccess(userItem)}
                                disabled={actionProcessingUid === userItem.uid}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                              >
                                {actionProcessingUid === userItem.uid ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <UserCheck className="w-3.5 h-3.5" />
                                )}
                                Restore Access
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setRevokingUser(userItem)}
                                disabled={actionProcessingUid === userItem.uid}
                                className="px-3.5 py-1.5 rounded-lg bg-red-950 hover:bg-red-900/80 text-red-300 border border-red-700/60 text-xs font-black shadow-md transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                              >
                                {actionProcessingUid === userItem.uid ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <UserX className="w-3.5 h-3.5" />
                                )}
                                Revoke Access
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FLAGS DIRECTORY (ALL WORLD FLAGS) */}
        {activeTab === 'flags' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    All World Flags ({WORLD_COUNTRIES.length} Countries)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Uniform styled country flags for Zimbabwe and all nations. Assign to Player 1 or Player 2 with one click.
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search countries by name or code..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-amber-400"
                  value={flagSearch}
                  onChange={(e) => setFlagSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Continent / Region Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['All', 'Africa', 'Europe', 'Americas', 'Asia', 'Oceania'].map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    selectedRegion === region
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {region} {region === 'All' ? `(${WORLD_COUNTRIES.length})` : ''}
                </button>
              ))}
            </div>

            {/* Countries Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-h-[550px] overflow-y-auto p-1">
              {filteredCountries.map((c) => (
                <div
                  key={c.code}
                  className="bg-slate-950 border border-slate-800/90 hover:border-amber-400/50 rounded-xl p-3 flex flex-col items-center text-center transition group shadow-sm"
                >
                  <div className="my-1">
                    <FlagBadge codeOrFlag={c.code} alt={c.name} size="md" />
                  </div>
                  <span className="text-xs font-bold text-white truncate w-full mt-1.5 group-hover:text-amber-300">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mb-2">
                    {c.code} · {c.region}
                  </span>

                  <div className="grid grid-cols-2 gap-1.5 w-full mt-auto">
                    <button
                      onClick={() => {
                        const updated = { ...state, flag1: c.flag, updatedAt: Date.now() };
                        syncState(updated);
                        showToast(`P1 Flag set to ${c.name}`);
                      }}
                      className="py-1 rounded bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-[10px] font-bold text-slate-300 transition"
                      title={`Assign ${c.name} to Player 1`}
                    >
                      Set P1
                    </button>
                    <button
                      onClick={() => {
                        const updated = { ...state, flag2: c.flag, updatedAt: Date.now() };
                        syncState(updated);
                        showToast(`P2 Flag set to ${c.name}`);
                      }}
                      className="py-1 rounded bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-[10px] font-bold text-slate-300 transition"
                      title={`Assign ${c.name} to Player 2`}
                    >
                      Set P2
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STANDALONE APP & LINUX MINT INSTALL HUB */}
        {activeTab === 'install' && (
          <div className="max-w-3xl mx-auto space-y-6">

            {/* LINUX MINT SPECIALTY CARD */}
            <div className="bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg shadow-emerald-500/20">
                    🌿
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">Linux Mint Desktop Installation</h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                        CINNAMON · MATE · XFCE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Native desktop launcher, Cinnamon start menu entry, and transparent OBS Studio integration.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => downloadFile('install-linux-mint.sh')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download install.sh
                </button>
              </div>

              {/* METHOD 1: 1-Line Terminal Command */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" /> Method 1: Instant Terminal Command (Recommended)
                  </span>
                  <button
                    onClick={() => {
                      const cmd = `curl -sSL ${window.location.origin}/install-linux-mint.sh | bash`;
                      navigator.clipboard.writeText(cmd);
                      showToast('Copied Linux Mint Install Command!');
                    }}
                    className="text-[11px] font-bold text-amber-300 hover:text-white bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 transition active:scale-95"
                  >
                    <Copy className="w-3 h-3" /> Copy Command
                  </button>
                </div>

                <p className="text-xs text-slate-300">
                  Open your terminal on Linux Mint (<kbd className="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-amber-300 text-[11px]">Ctrl+Alt+T</kbd>) and paste:
                </p>

                <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3 font-mono text-xs text-emerald-300 break-all select-all flex items-center justify-between gap-2 shadow-inner">
                  <code>curl -sSL {typeof window !== 'undefined' ? window.location.origin : 'https://...'}/install-linux-mint.sh | bash</code>
                </div>

                <div className="text-[11px] text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Creates Desktop & Mint Menu icons</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Enables Cinnamon Desktop Trust permission</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Downloads 512×512 HD application logo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Right-click menu: Controller & OBS Overlay</span>
                  </div>
                </div>
              </div>

              {/* METHOD 2: Linux Mint Web App Manager */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-amber-400" /> Method 2: Linux Mint Web App Manager (Built-in GUI)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin);
                      showToast('Copied App URL!');
                    }}
                    className="text-[11px] font-bold text-amber-300 hover:text-white bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 transition active:scale-95"
                  >
                    <Copy className="w-3 h-3" /> Copy URL
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-700">1</span>
                    <span>Click <strong>Linux Mint Menu</strong>, search for <strong>"Web App Manager"</strong> (pre-installed on Mint) and launch it.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-700">2</span>
                    <span>Click the <strong>+</strong> button at the bottom left to create a new Web App.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-700">3</span>
                    <span>Fill in <strong>Name:</strong> <code className="text-amber-300 font-mono">Platnumz Scoreboard</code> and <strong>Address:</strong> <code className="text-amber-300 font-mono">{typeof window !== 'undefined' ? window.location.origin : '...'}</code>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-700">4</span>
                    <span>Category: <strong>Games</strong> or <strong>Audio & Video</strong> ➔ Click <strong>OK</strong>. Platnumz Scoreboard will now appear in your Mint application menu!</span>
                  </div>
                </div>
              </div>

              {/* METHOD 3: Direct Desktop File Download */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                    Method 3: Direct .desktop Launcher File
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Download <code className="text-amber-300 font-mono">platnumz-scoreboard.desktop</code> and place it into <code className="text-slate-300 font-mono">~/.local/share/applications/</code> or on your Desktop.
                  </p>
                </div>
                <button
                  onClick={() => downloadFile('platnumz-scoreboard.desktop')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download .desktop File
                </button>
              </div>
            </div>

            {/* PWA & OTHER PLATFORMS HUB */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-blue-700 flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg shadow-amber-500/20">
                  P
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Browser & Mobile Standalone Installation (PWA)</h3>
                  <p className="text-xs text-slate-400">Install Platnumz Scoreboard on your phone, tablet, or PC to run full-screen without browser URL bars.</p>
                </div>
              </div>

              {/* Status Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current App State:</div>
                  <div className="text-sm font-black text-white mt-0.5">
                    {isInstalled ? '✅ Running as Standalone App (Installed)' : '🌐 Running in Web Browser (Installable)'}
                  </div>
                </div>

                {!isInstalled && isInstallable && (
                  <button
                    onClick={install}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Install Now
                  </button>
                )}

                {!isInstalled && isIOS && (
                  <button
                    onClick={() => setShowIOSGuide(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <Smartphone className="w-4 h-4" /> iOS Install
                  </button>
                )}
              </div>

              {/* Platform Installation Guide Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    📱 Android & Google Chrome
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tap the <strong>"Install App"</strong> button above, or open the Chrome menu (⋮) and select <strong>"Install application"</strong> or <strong>"Add to Home screen"</strong>.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    🍎 Apple iPhone & iPad (Safari)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tap Safari's <strong>Share</strong> button, then scroll down and tap <strong>"Add to Home Screen"</strong>. It launches as a full-screen app without Safari address bars.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    💻 Windows & Mac (Chrome / Edge)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click the install icon in the address bar (or the <strong>"Install App"</strong> button) to install Platnumz Scoreboard into your Windows Start Menu or Mac Applications.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    ⚡ Offline & Low-Latency Support
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Service Worker precaches the application assets so referees and streamers can operate matches smoothly even if internet coverage drops.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GITHUB SYNC */}
        {activeTab === 'github' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <Github className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">kravowork-hub/Platnumz-Scoreboard</h3>
                    <p className="text-xs text-slate-400">Branch: <span className="text-amber-400 font-mono">main</span></p>
                  </div>
                </div>

                <button
                  onClick={fetchGitStatus}
                  disabled={gitLoading}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${gitLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {/* Status Display */}
              {gitStatusData && (
                <div className="space-y-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs">
                    <div className="text-slate-400 text-[11px] mb-1">Recent Commits:</div>
                    <pre className="text-amber-300/90 whitespace-pre-wrap">{gitStatusData.log || 'No commits yet.'}</pre>
                  </div>
                </div>
              )}

              {/* Git Push Action */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Push Local Updates to GitHub Repository
                </h4>
                <p className="text-xs text-slate-400">
                  Provide a GitHub Personal Access Token (with repo scope) to push all improvements to your GitHub repo.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-400"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                  />
                  <button
                    onClick={handleGitPush}
                    disabled={gitLoading}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition disabled:opacity-50"
                  >
                    {gitLoading ? 'Pushing…' : 'Push to GitHub'}
                  </button>
                </div>

                {gitOutput && (
                  <div
                    className={`p-3 rounded-xl text-xs font-mono ${
                      gitOutput.success
                        ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
                        : 'bg-red-950/80 border border-red-500 text-red-200'
                    }`}
                  >
                    {gitOutput.message}
                  </div>
                )}
              </div>

              {/* Download standalone files */}
              <div className="border-t border-slate-800 pt-4">
                <div className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                  Direct File Downloads
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => downloadFile('overlay.html')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> overlay.html
                  </button>
                  <button
                    onClick={() => downloadFile('index.html')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> index.html
                  </button>
                  <button
                    onClick={() => downloadFile('README.md')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> README.md
                  </button>
                  <button
                    onClick={() => downloadFile('install-linux-mint.sh')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-600/50 hover:bg-emerald-900 text-emerald-200 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> install-linux-mint.sh
                  </button>
                  <button
                    onClick={() => downloadFile('platnumz-scoreboard.desktop')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> platnumz-scoreboard.desktop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
