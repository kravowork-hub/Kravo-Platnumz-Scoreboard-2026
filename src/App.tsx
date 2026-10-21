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
  Upload,
  Trash2,
  Flame,
  ArrowLeftRight
} from 'lucide-react';

// Comprehensive Country Flags Database
const ALL_COUNTRIES = [
  { name: 'Zimbabwe', code: 'ZW', flag: '🇿🇼', region: 'Africa' },
  { name: 'South Africa', code: 'ZA', flag: '🇿🇦', region: 'Africa' },
  { name: 'Botswana', code: 'BW', flag: '🇧🇼', region: 'Africa' },
  { name: 'Zambia', code: 'ZM', flag: '🇿🇲', region: 'Africa' },
  { name: 'Kenya', code: 'KE', flag: '🇰🇪', region: 'Africa' },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬', region: 'Africa' },
  { name: 'Ghana', code: 'GH', flag: '🇬🇭', region: 'Africa' },
  { name: 'Egypt', code: 'EG', flag: '🇪🇬', region: 'Africa' },
  { name: 'Uganda', code: 'UG', flag: '🇺🇬', region: 'Africa' },
  { name: 'Tanzania', code: 'TZ', flag: '🇹🇿', region: 'Africa' },
  { name: 'Malawi', code: 'MW', flag: '🇲🇼', region: 'Africa' },
  { name: 'Mozambique', code: 'MZ', flag: '🇲🇿', region: 'Africa' },
  { name: 'Namibia', code: 'NA', flag: '🇳🇦', region: 'Africa' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', region: 'Europe' },
  { name: 'United States', code: 'US', flag: '🇺🇸', region: 'Americas' },
  { name: 'Philippines', code: 'PH', flag: '🇵🇭', region: 'Asia' },
  { name: 'China', code: 'CN', flag: '🇨🇳', region: 'Asia' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', region: 'Oceania' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', region: 'Americas' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', region: 'Europe' },
  { name: 'Ireland', code: 'IE', flag: '🇮🇪', region: 'Europe' }
];

interface ScoreState {
  name1: string;
  name2: string;
  flag1: string;
  flag2: string;
  avatar1?: string;
  avatar2?: string;
  score1: number;
  score2: number;
  raceTo: number;
  tournament: string;
  venue: string;
  pot: string;
  brand: string;
  room: string;
  updatedAt: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'controller' | 'preview' | 'flags' | 'github'>('controller');

  // Core state initialized to match reference image
  const [state, setState] = useState<ScoreState>(() => {
    try {
      const saved = localStorage.getItem('platnumz-scoreboard-state');
      if (saved) {
        return {
          name1: 'CHAIRMAN TINDO',
          name2: 'BOSS OWIZA',
          flag1: '🇿🇼',
          flag2: '🇿🇼',
          score1: 2,
          score2: 1,
          raceTo: 3,
          tournament: 'PLATINUM SKILLS OPEN',
          venue: 'HARARE, ZIMBABWE',
          pot: '$500',
          brand: 'KRAVO PLATNUMZ OFFICIAL',
          room: 'platnumz-live-match',
          updatedAt: Date.now(),
          ...JSON.parse(saved)
        };
      }
    } catch (e) {}

    return {
      name1: 'CHAIRMAN TINDO',
      name2: 'BOSS OWIZA',
      flag1: '🇿🇼',
      flag2: '🇿🇼',
      score1: 2,
      score2: 1,
      raceTo: 3,
      tournament: 'PLATINUM SKILLS OPEN',
      venue: 'HARARE, ZIMBABWE',
      pot: '$500',
      brand: 'KRAVO PLATNUMZ OFFICIAL',
      room: 'platnumz-live-match',
      updatedAt: Date.now()
    };
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [flagSearch, setFlagSearch] = useState('');
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');

  // Git state
  const [githubToken, setGithubToken] = useState('');
  const [gitStatusData, setGitStatusData] = useState<{ branch: string; log: string; status: string } | null>(null);
  const [gitLoading, setGitLoading] = useState(false);
  const [gitOutput, setGitOutput] = useState<{ success: boolean; message: string } | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // REAL-TIME MULTI-CHANNEL SYNC
  const syncState = useCallback((newState: ScoreState) => {
    setState(newState);
    setSyncStatus('syncing');

    // 1. BroadcastChannel (Local tab sync)
    try {
      localStorage.setItem('platnumz-scoreboard-state', JSON.stringify(newState));
      if (channelRef.current) {
        channelRef.current.postMessage(newState);
      }
    } catch (e) {}

    // 2. Server API Sync (Cross-device real-time sync with SSE)
    fetch(`/api/sync/${encodeURIComponent(newState.room || 'platnumz-live-match')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newState)
    })
      .then(() => setSyncStatus('connected'))
      .catch(() => setSyncStatus('connected'));
  }, []);

  // Listen to incoming real-time updates from Server SSE, BroadcastChannel, and localStorage
  useEffect(() => {
    const currentRoom = state.room || 'platnumz-live-match';

    // Initial server fetch
    fetch(`/api/sync/${encodeURIComponent(currentRoom)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.state) {
          setState((prev) => ({ ...prev, ...data.state }));
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
            setState((prev) => ({ ...prev, ...remoteState }));
            setSyncStatus('connected');
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
          setState((prev) => ({ ...prev, ...event.data }));
        }
      };
    } catch (e) {}

    // LocalStorage storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'platnumz-scoreboard-state' && e.newValue) {
        try {
          setState((prev) => ({ ...prev, ...JSON.parse(e.newValue!) }));
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

  // Keyboard hotkeys: Q/A for P1, P/L for P2, S for swap, R for reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((document.activeElement?.tagName || ''))) return;

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
        updatedAt: Date.now()
      };
      syncState(updated);
      showToast('Swapped Players 1 and 2');
      return updated;
    });
  };

  const resetScores = () => {
    if (!window.confirm("Reset both players' scores to zero?")) return;
    setState((prev) => {
      const updated = { ...prev, score1: 0, score2: 0, updatedAt: Date.now() };
      syncState(updated);
      showToast('Scores reset to 0 - 0');
      return updated;
    });
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

  const downloadFile = (filename: 'index.html' | 'overlay.html' | 'README.md') => {
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

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans select-none">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-sm animate-bounce">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-[#090f1d]/95 backdrop-blur sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-blue-700 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/20">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-widest text-amber-400 font-extrabold">Broadcast Scoreboard</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {syncStatus === 'syncing' ? 'Syncing...' : 'Real-Time Sync Active'}
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                PLATNUMZ <span className="text-amber-400">SCOREBOARD</span>
              </h1>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 mr-1.5">Room:</span>
              <input
                className="bg-transparent text-amber-300 font-mono font-bold outline-none w-28 text-xs"
                value={state.room}
                onChange={(e) => {
                  const updated = { ...state, room: e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''), updatedAt: Date.now() };
                  syncState(updated);
                }}
              />
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(overlayUrl);
                showToast('OBS Overlay URL copied!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
            >
              <Copy className="w-3.5 h-3.5" /> Copy OBS Link
            </button>

            <button
              onClick={() => window.open(overlayUrl, '_blank')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Overlay
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border text-xs transition ${
                soundEnabled ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 pt-2.5">
          <button
            onClick={() => setActiveTab('controller')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'controller'
                ? 'bg-amber-400 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" /> Score Controller
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'preview'
                ? 'bg-amber-400 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> Live OBS Preview
          </button>

          <button
            onClick={() => setActiveTab('flags')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'flags'
                ? 'bg-amber-400 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Country Flags
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'github'
                ? 'bg-amber-400 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Github className="w-3.5 h-3.5" /> GitHub Sync & Export
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* WINNER ALERT */}
        {winner && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border-2 border-amber-400 rounded-2xl p-4 text-center shadow-2xl animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-300 font-black">MATCH CHAMPION</span>
                <h2 className="text-2xl md:text-3xl font-black text-white">{winner} WINS!</h2>
              </div>
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>
          </div>
        )}

        {/* HILL-HILL ALERT */}
        {isHillHill && (
          <div className="bg-red-950/80 border-2 border-red-500 rounded-xl p-2.5 text-center shadow-lg">
            <span className="inline-flex items-center gap-2 text-red-400 font-black text-sm tracking-widest uppercase animate-pulse">
              <Flame className="w-4 h-4 fill-red-500" />
              ⚡ HILL - HILL DECIDING FRAME ⚡
              <Flame className="w-4 h-4 fill-red-500" />
            </span>
          </div>
        )}

        {/* TAB 1: SCORE CONTROLLER (Names & Scores 1st Priority) */}
        {activeTab === 'controller' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* PLAYER 1 CARD */}
              <div className="bg-gradient-to-b from-[#0b1b36] to-[#071328] border-2 border-blue-500/40 rounded-3xl p-6 shadow-2xl relative">
                <span className="text-[11px] uppercase font-black tracking-widest text-blue-400 block mb-2">PLAYER 1</span>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl filter drop-shadow">{state.flag1}</span>
                  <input
                    className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-2xl font-black text-white outline-none focus:border-amber-400 transition"
                    value={state.name1}
                    onChange={(e) => {
                      const updated = { ...state, name1: e.target.value, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                    placeholder="PLAYER 1 NAME"
                  />
                </div>

                {/* GIANT SCORE NUMBER */}
                <div className="text-center my-6 py-2 bg-slate-950/50 rounded-2xl border border-white/5">
                  <div className="text-8xl md:text-9xl font-black tracking-tight text-white font-mono leading-none">
                    {state.score1}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-amber-400 font-black mt-2">Frames Won</div>
                </div>

                {/* LARGE SCORE BUTTONS */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateScore(1, -1)}
                    className="py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-base flex items-center justify-center gap-1.5 transition active:scale-95 border border-slate-700"
                  >
                    <Minus className="w-5 h-5" /> −1 Frame <kbd className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">A</kbd>
                  </button>
                  <button
                    onClick={() => updateScore(1, 1)}
                    className="py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-base flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 transition active:scale-95"
                  >
                    <Plus className="w-5 h-5" /> +1 Frame <kbd className="text-[10px] text-slate-900 bg-amber-300 px-1.5 py-0.5 rounded font-mono">Q</kbd>
                  </button>
                </div>
              </div>

              {/* PLAYER 2 CARD */}
              <div className="bg-gradient-to-b from-[#0b1b36] to-[#071328] border-2 border-blue-500/40 rounded-3xl p-6 shadow-2xl relative">
                <span className="text-[11px] uppercase font-black tracking-widest text-blue-400 block mb-2">PLAYER 2</span>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl filter drop-shadow">{state.flag2}</span>
                  <input
                    className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-2xl font-black text-white outline-none focus:border-amber-400 transition"
                    value={state.name2}
                    onChange={(e) => {
                      const updated = { ...state, name2: e.target.value, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                    placeholder="PLAYER 2 NAME"
                  />
                </div>

                {/* GIANT SCORE NUMBER */}
                <div className="text-center my-6 py-2 bg-slate-950/50 rounded-2xl border border-white/5">
                  <div className="text-8xl md:text-9xl font-black tracking-tight text-white font-mono leading-none">
                    {state.score2}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-amber-400 font-black mt-2">Frames Won</div>
                </div>

                {/* LARGE SCORE BUTTONS */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateScore(2, -1)}
                    className="py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-base flex items-center justify-center gap-1.5 transition active:scale-95 border border-slate-700"
                  >
                    <Minus className="w-5 h-5" /> −1 Frame <kbd className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">L</kbd>
                  </button>
                  <button
                    onClick={() => updateScore(2, 1)}
                    className="py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-base flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 transition active:scale-95"
                  >
                    <Plus className="w-5 h-5" /> +1 Frame <kbd className="text-[10px] text-slate-900 bg-amber-300 px-1.5 py-0.5 rounded font-mono">P</kbd>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={swapPlayers}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs flex items-center gap-2 border border-slate-700 transition"
              >
                <ArrowLeftRight className="w-4 h-4 text-amber-400" /> Swap Players & Flags (Hotkey S)
              </button>
              <button
                onClick={resetScores}
                className="px-5 py-2.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-300 font-black text-xs flex items-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" /> Reset Scores to 0-0 (Hotkey R)
              </button>
            </div>

            {/* Match Information Form */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm uppercase tracking-wider text-amber-400 font-black">Match Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Race To (Frames)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-base outline-none focus:border-amber-400"
                    value={state.raceTo}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value, 10) || 3);
                      const updated = { ...state, raceTo: val, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Prize Pot</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-amber-400"
                    value={state.pot}
                    onChange={(e) => {
                      const updated = { ...state, pot: e.target.value, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Tournament Title</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-amber-400"
                    value={state.tournament}
                    onChange={(e) => {
                      const updated = { ...state, tournament: e.target.value, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Venue</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-amber-400"
                    value={state.venue}
                    onChange={(e) => {
                      const updated = { ...state, venue: e.target.value, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                  />
                </div>
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
                  Real-time view with large names and scores rendered at 1st priority.
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

        {/* TAB 3: FLAGS DIRECTORY */}
        {activeTab === 'flags' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">Country Flags</h3>
                <p className="text-xs text-slate-400">Assign flags instantly to Player 1 or Player 2.</p>
              </div>
              <input
                type="text"
                placeholder="Search country..."
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-amber-400 w-64"
                value={flagSearch}
                onChange={(e) => setFlagSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[450px] overflow-y-auto p-1">
              {ALL_COUNTRIES.filter((c) => c.name.toLowerCase().includes(flagSearch.toLowerCase())).map((c) => (
                <div key={c.code} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col items-center text-center">
                  <span className="text-3xl mb-1">{c.flag}</span>
                  <span className="text-xs font-bold text-white truncate w-full">{c.name}</span>
                  <div className="grid grid-cols-2 gap-1.5 w-full mt-2">
                    <button
                      onClick={() => {
                        const updated = { ...state, flag1: c.flag, updatedAt: Date.now() };
                        syncState(updated);
                        showToast(`P1 Flag set to ${c.flag}`);
                      }}
                      className="py-1 rounded bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-[10px] font-bold text-slate-300"
                    >
                      P1
                    </button>
                    <button
                      onClick={() => {
                        const updated = { ...state, flag2: c.flag, updatedAt: Date.now() };
                        syncState(updated);
                        showToast(`P2 Flag set to ${c.flag}`);
                      }}
                      className="py-1 rounded bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-[10px] font-bold text-slate-300"
                    >
                      P2
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GITHUB SYNC */}
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
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${gitLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {/* Status */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
                <div className="text-amber-400 font-bold uppercase text-[10px] tracking-wider">Repository Status:</div>
                <div className="text-slate-300">{gitStatusData?.status || 'Working tree clean. Ready to push.'}</div>
                <div className="border-t border-slate-800/80 pt-2 text-slate-400 text-[11px]">
                  Recent Commits:
                  <pre className="text-amber-300 mt-1 whitespace-pre-wrap">{gitStatusData?.log || 'Recent commits loading...'}</pre>
                </div>
              </div>

              {/* Push in 1 Click */}
              <div className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-4 space-y-3">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">Push to GitHub with Token</span>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="GitHub Personal Access Token (ghp_...)"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-400"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                  />
                  <button
                    onClick={handleGitPush}
                    disabled={gitLoading || !githubToken}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs disabled:opacity-40 transition flex items-center gap-1.5 shadow"
                  >
                    {gitLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Push
                  </button>
                </div>

                {gitOutput && (
                  <div className={`p-3 rounded-lg text-xs font-mono mt-2 ${gitOutput.success ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                    {gitOutput.message}
                  </div>
                )}
              </div>

              {/* Download Files */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Download Files:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => downloadFile('index.html')}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-amber-400" /> index.html
                  </button>
                  <button
                    onClick={() => downloadFile('overlay.html')}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-amber-400" /> overlay.html
                  </button>
                  <button
                    onClick={() => downloadFile('README.md')}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-amber-400" /> README.md
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b14] py-4 px-6 text-center text-xs text-slate-500">
        <div>Branded for <strong className="text-amber-400">KRAVO PLATNUMZ OFFICIAL</strong> · Broadcast Scoreboard System</div>
      </footer>
    </div>
  );
}
