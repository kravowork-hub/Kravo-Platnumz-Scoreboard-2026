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
  FolderDown
} from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { WORLD_COUNTRIES, Country, getCountryCode, getFlagEmoji } from './countries';
import { FlagBadge } from './FlagBadge';

export interface ScoreState {
  name1: string;
  name2: string;
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
  brand: string;
  room: string;
  overlayPosition?: 'bottom' | 'top';
  updatedAt: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'controller' | 'preview' | 'flags' | 'install' | 'github'>('controller');

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
          return {
            name1: 'CHAIRMAN TINDO',
            name2: 'BOSS OWIZA',
            flag1: '🇿🇼',
            flag2: '🇿🇼',
            score1: 2,
            score2: 1,
            br1: 0,
            br2: 0,
            appleRed1: 0,
            appleGreen1: 0,
            appleRed2: 0,
            appleGreen2: 0,
            raceTo: 3,
            matchType: parsed.matchType || parsed.tournament || 'CHALLENGE MATCH',
            tournament: parsed.tournament || parsed.matchType || 'CHALLENGE MATCH',
            venue: 'HARARE, ZIMBABWE',
            pot: '$500',
            brand: 'KRAVO PLATNUMZ OFFICIAL',
            room: 'platnumz-live-match',
            overlayPosition: 'bottom',
            updatedAt: 1,
            ...parsed
          };
        }
      }
    } catch (e) {}

    // Factory baseline if brand new installation
    return {
      name1: 'CHAIRMAN TINDO',
      name2: 'BOSS OWIZA',
      flag1: '🇿🇼',
      flag2: '🇿🇼',
      score1: 2,
      score2: 1,
      br1: 0,
      br2: 0,
      appleRed1: 0,
      appleGreen1: 0,
      appleRed2: 0,
      appleGreen2: 0,
      raceTo: 3,
      matchType: 'CHALLENGE MATCH',
      tournament: 'CHALLENGE MATCH',
      venue: 'HARARE, ZIMBABWE',
      pot: '$500',
      brand: 'KRAVO PLATNUMZ OFFICIAL',
      room: 'platnumz-live-match',
      overlayPosition: 'bottom',
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

  // Git state
  const [githubToken, setGithubToken] = useState('');
  const [gitStatusData, setGitStatusData] = useState<{ branch: string; log: string; status: string } | null>(null);
  const [gitLoading, setGitLoading] = useState(false);
  const [gitOutput, setGitOutput] = useState<{ success: boolean; message: string } | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const stateRef = useRef<ScoreState>(initialState);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  // REAL-TIME MULTI-CHANNEL SYNC
  const syncState = useCallback((newState: ScoreState) => {
    // Every local publish must be newer than the last rendered state. Reusing a
    // timestamp lets delayed requests or SSE messages overwrite newer changes.
    const previousTimestamp = Number(stateRef.current.updatedAt) || 1;
    const requestedTimestamp = Number(newState.updatedAt) || 0;
    const withTimestamp = {
      ...newState,
      updatedAt: Math.max(Date.now(), previousTimestamp + 1, requestedTimestamp)
    };
    stateRef.current = withTimestamp;
    setState(withTimestamp);
    setSyncStatus('syncing');

    // 1. Permanent LocalStorage
    try {
      localStorage.setItem('platnumz-scoreboard-state', JSON.stringify(withTimestamp));
      if (channelRef.current) {
        channelRef.current.postMessage(withTimestamp);
      }
    } catch (e) {}

    // 2. Server API Sync (Cross-device real-time sync with SSE)
    fetch(`/api/sync/${encodeURIComponent(withTimestamp.room || 'platnumz-live-match')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withTimestamp)
    })
      .then(() => setSyncStatus('connected'))
      .catch(() => setSyncStatus('connected'));
  }, []);

  // Guarantee that every state update persists permanently in local storage
  useEffect(() => {
    stateRef.current = state;
    try {
      localStorage.setItem('platnumz-scoreboard-state', JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  // Listen to incoming real-time updates from Server SSE, BroadcastChannel, and localStorage
  useEffect(() => {
    const currentRoom = state.room || 'platnumz-live-match';

    // Initial server fetch: compare timestamps so user-entered details are never replaced with older server defaults
    fetch(`/api/sync/${encodeURIComponent(currentRoom)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.state) {
          setState((prev) => {
            const serverTime = Number(data.state.updatedAt) || 0;
            const localTime = Number(prev.updatedAt) || 0;
            // If local state has newer details than server (or server is baseline default <= 1):
            if (localTime > serverTime && localTime > 1) {
              // Local state has the latest entered details! Push to server so server & OBS overlay update!
              fetch(`/api/sync/${encodeURIComponent(currentRoom)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prev)
              }).catch(() => {});
              return prev;
            }
            // Server state is newer or equal: accept server state and sync to localStorage
            const merged = { ...prev, ...data.state };
            try {
              localStorage.setItem('platnumz-scoreboard-state', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      })
      .catch(() => {});

    // SSE connection for live updates from phone or other devices
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
        setSyncStatus('connected');
      };
    } catch (e) {}

    // BroadcastChannel for local instant tab communication
    try {
      const bc = new BroadcastChannel('platnumz_scoreboard_bus');
      channelRef.current = bc;
      bc.onmessage = (event) => {
        if (event.data && typeof event.data === 'object') {
          setState((prev) => {
            const remoteTime = Number(event.data.updatedAt) || 0;
            const localTime = Number(prev.updatedAt) || 0;
            if (localTime > remoteTime && localTime > 1) return prev;
            const merged = { ...prev, ...event.data };
            try {
              localStorage.setItem('platnumz-scoreboard-state', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      };
    } catch (e) {}

    // LocalStorage storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'platnumz-scoreboard-state' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState((prev) => {
            const remoteTime = Number(parsed.updatedAt) || 0;
            const localTime = Number(prev.updatedAt) || 0;
            if (localTime > remoteTime && localTime > 1) return prev;
            return { ...prev, ...parsed };
          });
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channelRef.current) channelRef.current.close();
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
      showToast(`P${player} ${color === 'red' ? '🍎 Red Apple' : '🍏 Green Apple'}: ${nextVal}`);
      return updated;
    });
  };

  const swapPlayers = () => {
    setState((prev) => {
      const updated = {
        ...prev,
        name1: prev.name2,
        name2: prev.name1,
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
        updatedAt: Date.now()
      };
      syncState(updated);
      showToast('Swapped Players, Flags & Stats');
      return updated;
    });
  };

  const resetScores = () => {
    if (!window.confirm("Reset both players' scores, Red & Green Apples, and Break & Run counters to zero? (Player names and match details will be kept)")) return;
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
        updatedAt: Date.now()
      };
      syncState(updated);
      showToast('Scores & Apples reset to 0');
      return updated;
    });
  };

  const resetToDefaults = () => {
    if (!window.confirm("Restore default sample players ('CHAIRMAN TINDO' & 'BOSS OWIZA') and reference details? This will replace your current match entries.")) return;
    const defaults: ScoreState = {
      name1: 'CHAIRMAN TINDO',
      name2: 'BOSS OWIZA',
      flag1: '🇿🇼',
      flag2: '🇿🇼',
      score1: 2,
      score2: 1,
      br1: 0,
      br2: 0,
      appleRed1: 0,
      appleGreen1: 0,
      appleRed2: 0,
      appleGreen2: 0,
      raceTo: 3,
      matchType: 'CHALLENGE MATCH',
      tournament: 'CHALLENGE MATCH',
      venue: 'HARARE, ZIMBABWE',
      pot: '$1,000',
      brand: 'KRAVO PLATNUMZ OFFICIAL',
      room: state.room || 'platnumz-live-match',
      overlayPosition: 'bottom',
      updatedAt: Date.now()
    };
    syncState(defaults);
    showToast('Scoreboard reset to sample defaults');
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
  const winner = state.score1 >= state.raceTo ? state.name1 : state.score2 >= state.raceTo ? state.name2 : null;
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

        {/* WINNER ALERT */}
        {winner && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border border-amber-400 rounded-xl p-2.5 text-center shadow-lg animate-pulse">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">MATCH CHAMPION:</span>
              <span className="text-base sm:text-lg font-black text-white">{winner} WINS!</span>
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
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
              <div className="bg-gradient-to-b from-[#0b1b36] to-[#071328] border border-blue-500/40 rounded-2xl p-3.5 sm:p-4 shadow-xl relative">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-[10px] uppercase font-black tracking-wider text-blue-400">PLAYER 1</span>
                  </div>
                  <button
                    onClick={() => setTargetPlayerForFlag(1)}
                    className="text-[10px] text-amber-300 hover:text-white bg-blue-900/60 hover:bg-blue-800 px-2 py-0.5 rounded-md border border-blue-400/30 font-bold transition flex items-center gap-1"
                  >
                    Change Flag <Globe className="w-2.5 h-2.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setTargetPlayerForFlag(1)}
                    className="p-0.5 rounded-md hover:ring-2 hover:ring-amber-400 transition shrink-0"
                    title="Click to change flag"
                  >
                    <FlagBadge codeOrFlag={state.flag1} size="md" alt="P1 Flag" />
                  </button>
                  <input
                    className="flex-1 min-w-0 bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-base sm:text-lg font-black text-white outline-none focus:border-amber-400 transition"
                    value={state.name1}
                    onChange={(e) => {
                      const updated = { ...state, name1: e.target.value, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                    placeholder="PLAYER 1 NAME"
                  />
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

                {/* Break & Run (Red Apple & Green Apple) Options */}
                <div className="bg-slate-950/60 rounded-xl border border-white/5 p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <span>🍏</span> Break & Run Options (Apples)
                    </span>
                    <span className="text-[10px] text-slate-400">Clearances off the break</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* RED APPLE */}
                    <div className="flex items-center justify-between bg-red-950/40 border border-red-500/30 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base select-none">🍎</span>
                        <span className="text-xs font-bold text-red-200">Red Apple</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateApple(1, 'red', -1)}
                          className="w-7 h-7 rounded bg-red-900/60 hover:bg-red-800 active:scale-95 text-red-200 font-bold flex items-center justify-center border border-red-700/50 transition"
                          title="Decrease Red Apple"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <div className="min-w-7 text-center font-mono font-black text-base text-white px-1.5 py-0.5 rounded bg-slate-950 border border-red-500/40 shadow-inner">
                          {state.appleRed1 || 0}
                        </div>
                        <button
                          type="button"
                          onClick={() => updateApple(1, 'red', 1)}
                          className="w-7 h-7 rounded bg-gradient-to-r from-red-500 to-red-600 hover:brightness-110 active:scale-95 text-white font-bold flex items-center justify-center shadow transition"
                          title="Increase Red Apple"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* GREEN APPLE */}
                    <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base select-none">🍏</span>
                        <span className="text-xs font-bold text-emerald-200">Green Apple</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateApple(1, 'green', -1)}
                          className="w-7 h-7 rounded bg-emerald-900/60 hover:bg-emerald-800 active:scale-95 text-emerald-200 font-bold flex items-center justify-center border border-emerald-700/50 transition"
                          title="Decrease Green Apple"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <div className="min-w-7 text-center font-mono font-black text-base text-white px-1.5 py-0.5 rounded bg-slate-950 border border-emerald-500/40 shadow-inner">
                          {state.appleGreen1 || 0}
                        </div>
                        <button
                          type="button"
                          onClick={() => updateApple(1, 'green', 1)}
                          className="w-7 h-7 rounded bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 active:scale-95 text-white font-bold flex items-center justify-center shadow transition"
                          title="Increase Green Apple"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* PLAYER 2 CARD */}
              <div className="bg-gradient-to-b from-[#0b1b36] to-[#071328] border border-blue-500/40 rounded-2xl p-3.5 sm:p-4 shadow-xl relative">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-[10px] uppercase font-black tracking-wider text-blue-400">PLAYER 2</span>
                  </div>
                  <button
                    onClick={() => setTargetPlayerForFlag(2)}
                    className="text-[10px] text-amber-300 hover:text-white bg-blue-900/60 hover:bg-blue-800 px-2 py-0.5 rounded-md border border-blue-400/30 font-bold transition flex items-center gap-1"
                  >
                    Change Flag <Globe className="w-2.5 h-2.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setTargetPlayerForFlag(2)}
                    className="p-0.5 rounded-md hover:ring-2 hover:ring-amber-400 transition shrink-0"
                    title="Click to change flag"
                  >
                    <FlagBadge codeOrFlag={state.flag2} size="md" alt="P2 Flag" />
                  </button>
                  <input
                    className="flex-1 min-w-0 bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-base sm:text-lg font-black text-white outline-none focus:border-amber-400 transition"
                    value={state.name2}
                    onChange={(e) => {
                      const updated = { ...state, name2: e.target.value, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                    placeholder="PLAYER 2 NAME"
                  />
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

                {/* Break & Run (Red Apple & Green Apple) Options */}
                <div className="bg-slate-950/60 rounded-xl border border-white/5 p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <span>🍏</span> Break & Run Options (Apples)
                    </span>
                    <span className="text-[10px] text-slate-400">Clearances off the break</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* RED APPLE */}
                    <div className="flex items-center justify-between bg-red-950/40 border border-red-500/30 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base select-none">🍎</span>
                        <span className="text-xs font-bold text-red-200">Red Apple</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateApple(2, 'red', -1)}
                          className="w-7 h-7 rounded bg-red-900/60 hover:bg-red-800 active:scale-95 text-red-200 font-bold flex items-center justify-center border border-red-700/50 transition"
                          title="Decrease Red Apple"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <div className="min-w-7 text-center font-mono font-black text-base text-white px-1.5 py-0.5 rounded bg-slate-950 border border-red-500/40 shadow-inner">
                          {state.appleRed2 || 0}
                        </div>
                        <button
                          type="button"
                          onClick={() => updateApple(2, 'red', 1)}
                          className="w-7 h-7 rounded bg-gradient-to-r from-red-500 to-red-600 hover:brightness-110 active:scale-95 text-white font-bold flex items-center justify-center shadow transition"
                          title="Increase Red Apple"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* GREEN APPLE */}
                    <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base select-none">🍏</span>
                        <span className="text-xs font-bold text-emerald-200">Green Apple</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateApple(2, 'green', -1)}
                          className="w-7 h-7 rounded bg-emerald-900/60 hover:bg-emerald-800 active:scale-95 text-emerald-200 font-bold flex items-center justify-center border border-emerald-700/50 transition"
                          title="Decrease Green Apple"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <div className="min-w-7 text-center font-mono font-black text-base text-white px-1.5 py-0.5 rounded bg-slate-950 border border-emerald-500/40 shadow-inner">
                          {state.appleGreen2 || 0}
                        </div>
                        <button
                          type="button"
                          onClick={() => updateApple(2, 'green', 1)}
                          className="w-7 h-7 rounded bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 active:scale-95 text-white font-bold flex items-center justify-center shadow transition"
                          title="Increase Green Apple"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 py-0.5">
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
                      syncState(updated);
                    }}
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
                      syncState(updated);
                    }}
                    placeholder="e.g. Challenge Match, Money Match, Tournament"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-slate-300 block mb-1">Prize Pot</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-sm font-medium outline-none focus:border-amber-400 transition"
                    value={state.pot}
                    onChange={(e) => {
                      const updated = { ...state, pot: e.target.value, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                    placeholder="e.g. $500"
                  />
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
                      const val = Math.max(1, parseInt(e.target.value, 10) || 3);
                      const updated = { ...state, raceTo: val, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-slate-300 block mb-1">Brand / Media</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-sm font-medium outline-none focus:border-amber-400 transition"
                    value={state.brand}
                    onChange={(e) => {
                      const updated = { ...state, brand: e.target.value, updatedAt: Date.now() };
                      syncState(updated);
                    }}
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
                  title="Restore default Chairman Tindo vs Boss Owiza reference match"
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
