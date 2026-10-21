/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  RefreshCw,
  Palette,
  Eye,
  Copy,
  ExternalLink,
  Volume2,
  VolumeX,
  Upload,
  Trash2,
  Flame,
  Check,
  Github,
  Tv,
  Gamepad2,
  Sliders,
  Globe,
  Radio,
  Download,
  AlertTriangle,
  ArrowLeftRight
} from 'lucide-react';

// Comprehensive Country Flags Database
const ALL_COUNTRIES = [
  // African Nations
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
  { name: 'Lesotho', code: 'LS', flag: '🇱🇸', region: 'Africa' },
  { name: 'Eswatini', code: 'SZ', flag: '🇸🇿', region: 'Africa' },
  { name: 'Algeria', code: 'DZ', flag: '🇩🇿', region: 'Africa' },
  { name: 'Angola', code: 'AO', flag: '🇦🇴', region: 'Africa' },
  { name: 'Cameroon', code: 'CM', flag: '🇨🇲', region: 'Africa' },
  { name: 'DR Congo', code: 'CD', flag: '🇨🇩', region: 'Africa' },
  { name: 'Ethiopia', code: 'ET', flag: '🇪🇹', region: 'Africa' },
  { name: 'Morocco', code: 'MA', flag: '🇲🇦', region: 'Africa' },
  { name: 'Senegal', code: 'SN', flag: '🇸🇳', region: 'Africa' },
  { name: 'Rwanda', code: 'RW', flag: '🇷🇼', region: 'Africa' },

  // World Cuesport Nations
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', region: 'Europe' },
  { name: 'United States', code: 'US', flag: '🇺🇸', region: 'Americas' },
  { name: 'Philippines', code: 'PH', flag: '🇵🇭', region: 'Asia' },
  { name: 'China', code: 'CN', flag: '🇨🇳', region: 'Asia' },
  { name: 'Chinese Taipei', code: 'TW', flag: '🇹🇼', region: 'Asia' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', region: 'Americas' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', region: 'Oceania' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', region: 'Europe' },
  { name: 'Spain', code: 'ES', flag: '🇪🇸', region: 'Europe' },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱', region: 'Europe' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵', region: 'Asia' },
  { name: 'Ireland', code: 'IE', flag: '🇮🇪', region: 'Europe' },
  { name: 'Poland', code: 'PL', flag: '🇵🇱', region: 'Europe' },
  { name: 'India', code: 'IN', flag: '🇮🇳', region: 'Asia' },
  { name: 'Vietnam', code: 'VN', flag: '🇻🇳', region: 'Asia' },
  { name: 'UAE', code: 'AE', flag: '🇦🇪', region: 'Asia' }
];

const THEMES = [
  { id: 'platnumz', name: 'Signature Platnumz', color: '#1257a4', gold: '#e8bd61', desc: 'Sapphire Blue & Pure Gold' },
  { id: 'emerald', name: 'Emerald Onyx', color: '#0f683a', gold: '#f5d77f', desc: 'Tournament Felt Green & Gold' },
  { id: 'crimson', name: 'Ruby Crimson', color: '#87192b', gold: '#f7ca78', desc: 'Velvet Red & Champagne' },
  { id: 'cyber', name: 'Midnight Cyber', color: '#1d3557', gold: '#00f0ff', desc: 'Carbon Obsidian & Neon Cyan' },
  { id: 'royal', name: 'Royal Purple', color: '#5e1c8a', gold: '#ffcf40', desc: 'Imperial Violet & Crown Gold' },
];

interface ScoreState {
  name1: string;
  name2: string;
  flag1: string;
  flag2: string;
  avatar1: string;
  avatar2: string;
  score1: number;
  score2: number;
  raceTo: number;
  tournament: string;
  venue: string;
  pot: string;
  brand: string;
  customLogo: string;
  theme: string;
  overlayPosition: string;
  ballsRemaining: string;
  activeShooter: number;
  br1: number;
  br2: number;
  shotClock: {
    visible: boolean;
    seconds: number;
    running: boolean;
  };
  room: string;
  updatedAt: number;
}

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'controller' | 'shotclock' | 'preview' | 'custom' | 'flags' | 'github'>('controller');

  // Core state
  const [state, setState] = useState<ScoreState>(() => {
    try {
      const saved = localStorage.getItem('platnumz-scoreboard-state');
      if (saved) {
        return {
          name1: 'PLAYER ONE',
          name2: 'PLAYER TWO',
          flag1: '🇿🇼',
          flag2: '🇿🇦',
          avatar1: '',
          avatar2: '',
          score1: 0,
          score2: 0,
          raceTo: 13,
          tournament: 'PLATNUMZ CUESPORT',
          venue: 'QUEENS POOL ARCADE',
          pot: '$1,000',
          brand: 'KRAVO PLATNUMZ OFFICIAL',
          customLogo: '',
          theme: 'platnumz',
          overlayPosition: 'bottom',
          ballsRemaining: '',
          activeShooter: 0,
          br1: 0,
          br2: 0,
          shotClock: { visible: true, seconds: 30, running: false },
          room: 'platnumz-live-match',
          updatedAt: Date.now(),
          ...JSON.parse(saved)
        };
      }
    } catch (e) {}

    return {
      name1: 'PLAYER ONE',
      name2: 'PLAYER TWO',
      flag1: '🇿🇼',
      flag2: '🇿🇦',
      avatar1: '',
      avatar2: '',
      score1: 0,
      score2: 0,
      raceTo: 13,
      tournament: 'PLATNUMZ CUESPORT',
      venue: 'QUEENS POOL ARCADE',
      pot: '$1,000',
      brand: 'KRAVO PLATNUMZ OFFICIAL',
      customLogo: '',
      theme: 'platnumz',
      overlayPosition: 'bottom',
      ballsRemaining: '',
      activeShooter: 0,
      br1: 0,
      br2: 0,
      shotClock: { visible: true, seconds: 30, running: false },
      room: 'platnumz-live-match',
      updatedAt: Date.now()
    };
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState<'1080p' | '720p' | 'compact'>('1080p');
  const [flagSearch, setFlagSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Git Hub push state
  const [githubToken, setGithubToken] = useState('');
  const [gitStatusData, setGitStatusData] = useState<{ branch: string; log: string; status: string } | null>(null);
  const [gitLoading, setGitLoading] = useState(false);
  const [gitOutput, setGitOutput] = useState<{ success: boolean; message: string } | null>(null);

  // Broadcast channel
  const channelRef = useRef<BroadcastChannel | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
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

  const playSynthBeep = useCallback((freq = 600, duration = 0.1, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }, [soundEnabled, getAudioContext]);

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

  const playBuzzer = useCallback(() => {
    if (!soundEnabled) return;
    playSynthBeep(220, 0.6, 'sawtooth');
  }, [soundEnabled, playSynthBeep]);

  // Sync state broadcast
  const syncState = useCallback((newState: ScoreState) => {
    setState(newState);
    try {
      localStorage.setItem('platnumz-scoreboard-state', JSON.stringify(newState));
      if (channelRef.current) {
        channelRef.current.postMessage(newState);
      }
    } catch (e) {}
  }, []);

  // Initialize broadcast and storage listeners
  useEffect(() => {
    try {
      const bc = new BroadcastChannel('platnumz_scoreboard_bus');
      channelRef.current = bc;
      bc.onmessage = (event) => {
        if (event.data && typeof event.data === 'object') {
          setState((prev) => ({ ...prev, ...event.data }));
        }
      };
    } catch (e) {}

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
    };
  }, []);

  // Fetch Git Status
  const fetchGitStatus = async () => {
    setGitLoading(true);
    try {
      const res = await fetch('/api/git-status');
      if (res.ok) {
        const data = await res.json();
        setGitStatusData(data);
      }
    } catch (e) {
      console.warn('Git status fetch failed', e);
    } finally {
      setGitLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'github') {
      fetchGitStatus();
    }
  }, [activeTab]);

  // Shot clock interval
  useEffect(() => {
    if (!state.shotClock.running) return;
    const interval = setInterval(() => {
      setState((prev) => {
        const nextSec = prev.shotClock.seconds - 1;
        if (nextSec <= 0) {
          playBuzzer();
          const updated = {
            ...prev,
            shotClock: { ...prev.shotClock, seconds: 0, running: false },
            updatedAt: Date.now()
          };
          syncState(updated);
          return updated;
        }

        if (nextSec <= 5) {
          playSynthBeep(880, 0.08);
        } else if (nextSec === 10) {
          playSynthBeep(440, 0.12);
        }

        const updated = {
          ...prev,
          shotClock: { ...prev.shotClock, seconds: nextSec },
          updatedAt: Date.now()
        };
        syncState(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.shotClock.running, playBuzzer, playSynthBeep, syncState]);

  // Keyboard hotkeys
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
      } else if (k === ' ' || e.code === 'Space') {
        e.preventDefault();
        toggleShotClock();
      } else if (k === 'E') {
        e.preventDefault();
        addExtension();
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

  // Score modification
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

  const toggleShotClock = () => {
    setState((prev) => {
      const willRun = !prev.shotClock.running;
      let sec = prev.shotClock.seconds;
      if (willRun && sec <= 0) sec = 30;
      const updated = {
        ...prev,
        shotClock: { ...prev.shotClock, running: willRun, seconds: sec },
        updatedAt: Date.now()
      };
      syncState(updated);
      return updated;
    });
  };

  const resetShotClock = (seconds = 30) => {
    setState((prev) => {
      const updated = {
        ...prev,
        shotClock: { ...prev.shotClock, seconds, running: false },
        updatedAt: Date.now()
      };
      syncState(updated);
      return updated;
    });
  };

  const addExtension = () => {
    setState((prev) => {
      const updated = {
        ...prev,
        shotClock: { ...prev.shotClock, seconds: prev.shotClock.seconds + 30 },
        updatedAt: Date.now()
      };
      syncState(updated);
      showToast('+30s Shot clock extension added!');
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
        br1: prev.br2,
        br2: prev.br1,
        activeShooter: prev.activeShooter === 1 ? 2 : prev.activeShooter === 2 ? 1 : 0,
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
      const updated = { ...prev, score1: 0, score2: 0, br1: 0, br2: 0, updatedAt: Date.now() };
      syncState(updated);
      showToast('Scores reset to 0 - 0');
      return updated;
    });
  };

  // Avatar & Logo upload helper
  const handleFileUpload = (type: 'avatar1' | 'avatar2' | 'logo', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = type === 'logo' ? 320 : 180;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) { h *= maxDim / w; w = maxDim; }
        } else {
          if (h > maxDim) { w *= maxDim / h; h = maxDim; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/webp', 0.85);

        setState((prev) => {
          const key = type === 'logo' ? 'customLogo' : type;
          const updated = { ...prev, [key]: dataUrl, updatedAt: Date.now() };
          syncState(updated);
          return updated;
        });
        showToast(`${type === 'logo' ? 'Tournament logo' : 'Player photo'} updated!`);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Push to GitHub API
  const handleGitPush = async () => {
    if (!githubToken.trim()) {
      alert('Please enter your GitHub Personal Access Token to push.');
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
        setGitOutput({ success: true, message: data.message || 'Push completed successfully!' });
        fetchGitStatus();
      } else {
        setGitOutput({ success: false, message: data.error || 'Push failed.' });
      }
    } catch (e: any) {
      setGitOutput({ success: false, message: e.message || 'Network error pushing to GitHub.' });
    } finally {
      setGitLoading(false);
    }
  };

  // Download raw repo file
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

  // Calculation for Hill-Hill & Match Point
  const isHillHill = state.score1 === state.raceTo - 1 && state.score2 === state.raceTo - 1;
  const isMatchPoint1 = !isHillHill && state.score1 === state.raceTo - 1 && state.score1 < state.raceTo;
  const isMatchPoint2 = !isHillHill && state.score2 === state.raceTo - 1 && state.score2 < state.raceTo;
  const winner = state.score1 >= state.raceTo ? state.name1 : state.score2 >= state.raceTo ? state.name2 : null;

  // Filtered countries
  const filteredCountries = ALL_COUNTRIES.filter((c) => {
    const matchReg = selectedRegion === 'All' || c.region === selectedRegion;
    const matchSearch = c.name.toLowerCase().includes(flagSearch.toLowerCase()) || c.code.toLowerCase().includes(flagSearch.toLowerCase());
    return matchReg && matchSearch;
  });

  const overlayUrl = `${window.location.origin}/overlay.html?room=${encodeURIComponent(state.room)}`;

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans select-none">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-sm animate-bounce">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-[#0a111e]/95 backdrop-blur sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-blue-700 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/20">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-extrabold">Professional Broadcast</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Sync Active
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                PLATNUMZ <span className="text-amber-400">SCOREBOARD</span>
              </h1>
            </div>
          </div>

          {/* Quick Bar Actions */}
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
                showToast('OBS Overlay URL copied to clipboard!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
              title="Copy link to paste into OBS Browser Source"
            >
              <Copy className="w-3.5 h-3.5" /> Copy OBS Link
            </button>

            <button
              onClick={() => window.open(overlayUrl, '_blank')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
              title="Open full transparent overlay in separate window"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Overlay
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border text-xs transition ${
                soundEnabled ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Mute audio cues' : 'Enable audio cues'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 pt-2.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('controller')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'controller'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" /> Score Controller
          </button>

          <button
            onClick={() => setActiveTab('shotclock')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'shotclock'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Shot Clock Studio
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'preview'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> OBS Live Preview
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'custom'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Themes & Branding
          </button>

          <button
            onClick={() => setActiveTab('flags')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'flags'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Country Flag Picker
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'github'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Github className="w-3.5 h-3.5" /> GitHub Sync & Export
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* WINNER ALERT NOTIFICATION */}
        {winner && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border-2 border-amber-400 rounded-2xl p-4 text-center shadow-2xl relative overflow-hidden animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-300 font-black">MATCH VICTORY REACHED</span>
                <h2 className="text-2xl md:text-3xl font-black text-white">{winner} WINS THE MATCH!</h2>
              </div>
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>
          </div>
        )}

        {/* HILL-HILL ALERT BANNER */}
        {isHillHill && (
          <div className="bg-red-950/80 border-2 border-red-500 rounded-xl p-3 text-center shadow-lg shadow-red-900/40">
            <div className="inline-flex items-center gap-2 text-red-400 font-black text-sm tracking-widest uppercase animate-pulse">
              <Flame className="w-4 h-4 fill-red-500" />
              ⚡ HILL - HILL DECIDING FRAME ⚡
              <Flame className="w-4 h-4 fill-red-500" />
            </div>
          </div>
        )}

        {/* TAB 1: SCORE CONTROLLER */}
        {activeTab === 'controller' && (
          <div className="space-y-6">
            {/* Quick Mini Shot-Clock Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-black font-mono tracking-tight ${state.shotClock.seconds <= 5 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
                  {state.shotClock.seconds}s
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400">SHOT CLOCK</div>
                  <div className="text-[11px] text-slate-500">Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">SPACE</kbd> to pause/run</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleShotClock}
                  className={`px-4 py-2 rounded-xl font-black text-sm flex items-center gap-1.5 transition ${
                    state.shotClock.running
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950'
                  }`}
                >
                  {state.shotClock.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {state.shotClock.running ? 'PAUSE' : 'START CLOCK'}
                </button>
                <button
                  onClick={() => resetShotClock(30)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center gap-1 transition"
                  title="Reset to 30s"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <button
                  onClick={addExtension}
                  className="px-3 py-2 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700 text-blue-300 text-sm font-bold transition"
                  title="Add 30s extension (Hotkey E)"
                >
                  +30s Ext
                </button>
              </div>

              {/* Active Shooter Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 text-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold px-2">Table:</span>
                <button
                  onClick={() => {
                    const updated = { ...state, activeShooter: 1, updatedAt: Date.now() };
                    syncState(updated);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition ${
                    state.activeShooter === 1 ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  P1 On Table
                </button>
                <button
                  onClick={() => {
                    const updated = { ...state, activeShooter: 0, updatedAt: Date.now() };
                    syncState(updated);
                  }}
                  className={`px-2 py-1.5 rounded-lg font-bold transition ${
                    state.activeShooter === 0 ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  Neutral
                </button>
                <button
                  onClick={() => {
                    const updated = { ...state, activeShooter: 2, updatedAt: Date.now() };
                    syncState(updated);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition ${
                    state.activeShooter === 2 ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  P2 On Table
                </button>
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PLAYER 1 CARD */}
              <div
                className={`bg-slate-900/80 border-2 rounded-2xl p-6 relative transition-all duration-300 shadow-xl ${
                  state.activeShooter === 1
                    ? 'border-amber-400 shadow-amber-500/10'
                    : 'border-slate-800'
                }`}
              >
                {state.activeShooter === 1 && (
                  <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow">
                    🎱 CURRENTLY AT TABLE
                  </span>
                )}
                {isMatchPoint1 && (
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider uppercase animate-pulse">
                    MATCH POINT
                  </span>
                )}

                <div className="flex items-center gap-3 mb-4">
                  {state.avatar1 ? (
                    <img src={state.avatar1} alt="P1" className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-3xl border border-slate-700">
                      {state.flag1}
                    </div>
                  )}

                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">PLAYER ONE</span>
                    <input
                      className="w-full bg-transparent text-xl font-black text-white outline-none border-b border-transparent focus:border-amber-400 transition"
                      value={state.name1}
                      onChange={(e) => {
                        const updated = { ...state, name1: e.target.value, updatedAt: Date.now() };
                        syncState(updated);
                      }}
                    />
                  </div>
                </div>

                {/* Score Number Display */}
                <div className="text-center my-6">
                  <div className="text-7xl font-black tracking-tight text-white font-mono">{state.score1}</div>
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">Frames Won</div>
                </div>

                {/* + / - Score Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => updateScore(1, -1)}
                    className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black flex items-center justify-center gap-1.5 transition text-sm"
                  >
                    <Minus className="w-4 h-4" /> −1 Frame <kbd className="text-[10px] text-slate-400 bg-slate-900 px-1 rounded ml-1 font-mono">A</kbd>
                  </button>
                  <button
                    onClick={() => updateScore(1, 1)}
                    className="py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition text-sm"
                  >
                    <Plus className="w-4 h-4" /> +1 Frame <kbd className="text-[10px] text-slate-900 bg-amber-300 px-1 rounded ml-1 font-mono">Q</kbd>
                  </button>
                </div>

                {/* Break and Run & Country row */}
                <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Break & Run:</span>
                    <strong className="text-amber-400 font-mono text-sm">{state.br1}</strong>
                    <button
                      onClick={() => {
                        const updated = { ...state, br1: Math.max(0, state.br1 - 1), updatedAt: Date.now() };
                        syncState(updated);
                      }}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400"
                    >
                      -
                    </button>
                    <button
                      onClick={() => {
                        const updated = { ...state, br1: state.br1 + 1, updatedAt: Date.now() };
                        syncState(updated);
                        showToast('Player 1 Break & Run added!');
                      }}
                      className="w-5 h-5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-slate-400">{state.flag1} Flag</span>
                </div>
              </div>

              {/* PLAYER 2 CARD */}
              <div
                className={`bg-slate-900/80 border-2 rounded-2xl p-6 relative transition-all duration-300 shadow-xl ${
                  state.activeShooter === 2
                    ? 'border-amber-400 shadow-amber-500/10'
                    : 'border-slate-800'
                }`}
              >
                {state.activeShooter === 2 && (
                  <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow">
                    🎱 CURRENTLY AT TABLE
                  </span>
                )}
                {isMatchPoint2 && (
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider uppercase animate-pulse">
                    MATCH POINT
                  </span>
                )}

                <div className="flex items-center gap-3 mb-4">
                  {state.avatar2 ? (
                    <img src={state.avatar2} alt="P2" className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-3xl border border-slate-700">
                      {state.flag2}
                    </div>
                  )}

                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">PLAYER TWO</span>
                    <input
                      className="w-full bg-transparent text-xl font-black text-white outline-none border-b border-transparent focus:border-amber-400 transition"
                      value={state.name2}
                      onChange={(e) => {
                        const updated = { ...state, name2: e.target.value, updatedAt: Date.now() };
                        syncState(updated);
                      }}
                    />
                  </div>
                </div>

                {/* Score Number Display */}
                <div className="text-center my-6">
                  <div className="text-7xl font-black tracking-tight text-white font-mono">{state.score2}</div>
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">Frames Won</div>
                </div>

                {/* + / - Score Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => updateScore(2, -1)}
                    className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black flex items-center justify-center gap-1.5 transition text-sm"
                  >
                    <Minus className="w-4 h-4" /> −1 Frame <kbd className="text-[10px] text-slate-400 bg-slate-900 px-1 rounded ml-1 font-mono">L</kbd>
                  </button>
                  <button
                    onClick={() => updateScore(2, 1)}
                    className="py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition text-sm"
                  >
                    <Plus className="w-4 h-4" /> +1 Frame <kbd className="text-[10px] text-slate-900 bg-amber-300 px-1 rounded ml-1 font-mono">P</kbd>
                  </button>
                </div>

                {/* Break and Run & Country row */}
                <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Break & Run:</span>
                    <strong className="text-amber-400 font-mono text-sm">{state.br2}</strong>
                    <button
                      onClick={() => {
                        const updated = { ...state, br2: Math.max(0, state.br2 - 1), updatedAt: Date.now() };
                        syncState(updated);
                      }}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400"
                    >
                      -
                    </button>
                    <button
                      onClick={() => {
                        const updated = { ...state, br2: state.br2 + 1, updatedAt: Date.now() };
                        syncState(updated);
                        showToast('Player 2 Break & Run added!');
                      }}
                      className="w-5 h-5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-slate-400">{state.flag2} Flag</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={swapPlayers}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
              >
                <ArrowLeftRight className="w-4 h-4 text-amber-400" /> Swap Players & Flags (Hotkey S)
              </button>
              <button
                onClick={resetScores}
                className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 font-bold text-xs flex items-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" /> Reset Scores to 0-0 (Hotkey R)
              </button>
            </div>

            {/* Match Details & Settings */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm uppercase tracking-wider text-amber-400 font-black flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Match & Rack Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Race To (Frames)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm outline-none focus:border-amber-400"
                    value={state.raceTo}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value, 10) || 13);
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
                  <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Remaining Balls / State</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-amber-400 cursor-pointer"
                    value={state.ballsRemaining}
                    onChange={(e) => {
                      const updated = { ...state, ballsRemaining: e.target.value, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                  >
                    <option value="">Off (Hide)</option>
                    <option value="Break Shot">Break Shot</option>
                    <option value="15 Balls Remaining">15 Balls Remaining</option>
                    <option value="12 Balls Remaining">12 Balls Remaining</option>
                    <option value="9 Balls Remaining">9 Balls Remaining</option>
                    <option value="6 Balls Remaining">6 Balls Remaining</option>
                    <option value="3 Balls Remaining">3 Balls Remaining</option>
                    <option value="8-Ball / Black Ball">8-Ball / Black Ball</option>
                    <option value="Final Ball">Final Ball</option>
                  </select>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Venue Name</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-amber-400"
                    value={state.venue}
                    onChange={(e) => {
                      const updated = { ...state, venue: e.target.value, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Broadcast Branding</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-amber-400"
                    value={state.brand}
                    onChange={(e) => {
                      const updated = { ...state, brand: e.target.value, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHOT CLOCK STUDIO */}
        {activeTab === 'shotclock' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-wider uppercase">
                <Clock className="w-3.5 h-3.5" /> Official Cuesport Shot Clock
              </div>

              {/* Giant Digital Counter */}
              <div className="relative py-4">
                <div
                  className={`text-9xl md:text-[140px] font-black font-mono tracking-tight transition-colors duration-200 ${
                    state.shotClock.seconds <= 5
                      ? 'text-red-500 animate-pulse drop-shadow-[0_0_35px_rgba(239,68,68,0.6)]'
                      : state.shotClock.seconds <= 10
                      ? 'text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]'
                      : 'text-white'
                  }`}
                >
                  {state.shotClock.seconds}
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Seconds Remaining</div>
              </div>

              {/* Primary Clock Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={toggleShotClock}
                  className={`px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-2 shadow-2xl transition transform active:scale-95 ${
                    state.shotClock.running
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950'
                  }`}
                >
                  {state.shotClock.running ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  {state.shotClock.running ? 'PAUSE CLOCK' : 'START CLOCK'}
                </button>

                <button
                  onClick={() => resetShotClock(30)}
                  className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base flex items-center gap-2 border border-slate-700 transition"
                >
                  <RotateCcw className="w-5 h-5" /> Reset (30s)
                </button>

                <button
                  onClick={addExtension}
                  className="px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base flex items-center gap-2 shadow-lg shadow-blue-500/25 transition"
                >
                  <Plus className="w-5 h-5" /> +30s Extension
                </button>
              </div>

              {/* Preset Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Presets:</span>
                {[30, 45, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => resetShotClock(sec)}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition"
                  >
                    {sec} Seconds
                  </button>
                ))}
              </div>

              {/* Table Action Selector */}
              <div className="border-t border-slate-800 pt-6">
                <div className="text-xs uppercase font-bold text-slate-400 mb-3">Player on table / shooting:</div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      const updated = { ...state, activeShooter: 1, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                    className={`p-3 rounded-xl border text-sm font-black transition ${
                      state.activeShooter === 1
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    🎱 {state.name1}
                  </button>
                  <button
                    onClick={() => {
                      const updated = { ...state, activeShooter: 0, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                    className={`p-3 rounded-xl border text-sm font-black transition ${
                      state.activeShooter === 0
                        ? 'bg-slate-800 text-white border-slate-700'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Neutral / Rack
                  </button>
                  <button
                    onClick={() => {
                      const updated = { ...state, activeShooter: 2, updatedAt: Date.now() };
                      syncState(updated);
                    }}
                    className={`p-3 rounded-xl border text-sm font-black transition ${
                      state.activeShooter === 2
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    🎱 {state.name2}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OBS OVERLAY PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-amber-400" /> Live Broadcast Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time preview of how OBS Studio renders the scoreboard overlay over camera video feeds.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(overlayUrl);
                    showToast('Copied OBS URL to clipboard!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy OBS URL
                </button>
                <button
                  onClick={() => window.open(overlayUrl, '_blank')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Direct Overlay
                </button>
              </div>
            </div>

            {/* Simulated Stream Feed Container */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-gradient-to-b from-[#0a1b14] to-[#040e0a] aspect-video w-full flex flex-col justify-end p-4">
              {/* Pool table markings simulation */}
              <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-4 border-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/40"></div>
                </div>
              </div>

              <div className="absolute top-4 left-4 text-xs font-mono bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-amber-300 font-bold border border-white/10">
                ● SIMULATED 1080p CAMERA FEED
              </div>

              {/* Embedded Live Overlay Iframe */}
              <div className="w-full h-full absolute inset-0 z-10 pointer-events-auto">
                <iframe
                  src={`/overlay.html?room=${encodeURIComponent(state.room)}`}
                  title="OBS Overlay Preview"
                  className="w-full h-full border-none bg-transparent"
                />
              </div>
            </div>

            {/* OBS Setup instructions */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
              <div className="font-bold text-amber-400 uppercase tracking-wider">How to add to OBS Studio in 30 seconds:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>In OBS Studio, click the <strong className="text-white">+ (Add Source)</strong> icon in your scene and select <strong className="text-white">Browser</strong>.</li>
                <li>Name it <span className="text-amber-300">"Platnumz Scoreboard"</span> and paste this URL: <code className="bg-black/50 px-2 py-0.5 rounded text-amber-400 font-mono text-[11px] select-all">{overlayUrl}</code></li>
                <li>Set Width: <code className="text-amber-400">1920</code>, Height: <code className="text-amber-400">1080</code> (or <code className="text-amber-400">350</code> for bottom bar).</li>
                <li>Check <strong className="text-white">"Shutdown source when not visible"</strong>. The background is 100% transparent and overlays directly over your table!</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 4: THEMES & BRANDING */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            {/* Theme Selector */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4" /> 5 Luxury Broadcast Themes
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      const updated = { ...state, theme: th.id, updatedAt: Date.now() };
                      syncState(updated);
                      showToast(`Applied ${th.name} theme!`);
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition flex flex-col justify-between h-32 relative overflow-hidden ${
                      state.theme === th.id
                        ? 'border-amber-400 shadow-xl shadow-amber-500/20 bg-slate-800'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                    }`}
                  >
                    <div
                      className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-30 pointer-events-none"
                      style={{ background: th.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: th.gold }} />
                        <span className="text-xs font-black text-white">{th.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{th.desc}</p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="h-2 w-8 rounded-full" style={{ background: th.color }}></span>
                      <span className="h-2 w-4 rounded-full" style={{ background: th.gold }}></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Logo & Player Photos Upload */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tournament Logo */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Tournament Logo</span>
                <div className="h-32 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-3 relative bg-slate-950">
                  {state.customLogo ? (
                    <>
                      <img src={state.customLogo} alt="Logo" className="max-h-20 max-w-full object-contain" />
                      <button
                        onClick={() => {
                          const updated = { ...state, customLogo: '', updatedAt: Date.now() };
                          syncState(updated);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900"
                        title="Remove logo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer text-center">
                      <Upload className="w-6 h-6 mx-auto text-slate-500 mb-1" />
                      <span className="text-xs text-slate-400 block font-bold">Upload Custom Logo</span>
                      <span className="text-[10px] text-slate-500">PNG / WEBP / JPG</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload('logo', e)}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Player 1 Photo */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Player 1 Avatar Photo</span>
                <div className="h-32 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-3 relative bg-slate-950">
                  {state.avatar1 ? (
                    <>
                      <img src={state.avatar1} alt="Avatar 1" className="w-20 h-20 rounded-full object-cover border-2 border-amber-400" />
                      <button
                        onClick={() => {
                          const updated = { ...state, avatar1: '', updatedAt: Date.now() };
                          syncState(updated);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer text-center">
                      <Upload className="w-6 h-6 mx-auto text-slate-500 mb-1" />
                      <span className="text-xs text-slate-400 block font-bold">Upload Player 1 Photo</span>
                      <span className="text-[10px] text-slate-500">Square portrait photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload('avatar1', e)}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Player 2 Photo */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Player 2 Avatar Photo</span>
                <div className="h-32 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-3 relative bg-slate-950">
                  {state.avatar2 ? (
                    <>
                      <img src={state.avatar2} alt="Avatar 2" className="w-20 h-20 rounded-full object-cover border-2 border-amber-400" />
                      <button
                        onClick={() => {
                          const updated = { ...state, avatar2: '', updatedAt: Date.now() };
                          syncState(updated);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer text-center">
                      <Upload className="w-6 h-6 mx-auto text-slate-500 mb-1" />
                      <span className="text-xs text-slate-400 block font-bold">Upload Player 2 Photo</span>
                      <span className="text-[10px] text-slate-500">Square portrait photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload('avatar2', e)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Position Layout Selector */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">Overlay Screen Positioning</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'bottom', label: 'Bottom Broadcast Bar', desc: 'Standard TV broadcast baseline position' },
                  { id: 'top', label: 'Top Header Banner', desc: 'Placed across top of screen' },
                  { id: 'floating', label: 'Floating Lower-Third', desc: 'Centered floating glass card' }
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => {
                      const updated = { ...state, overlayPosition: pos.id, updatedAt: Date.now() };
                      syncState(updated);
                      showToast(`Position set to ${pos.label}`);
                    }}
                    className={`p-4 rounded-xl border text-left transition ${
                      state.overlayPosition === pos.id
                        ? 'border-amber-400 bg-slate-800 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-bold text-white">{pos.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{pos.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COUNTRY FLAGS */}
        {activeTab === 'flags' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Comprehensive Worldwide Flag Directory
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Click any nation to assign its flag to Player 1 or Player 2 instantly.</p>
                </div>

                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="Search country or code (e.g. Zimbabwe, ZW)..."
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-amber-400 w-72"
                  value={flagSearch}
                  onChange={(e) => setFlagSearch(e.target.value)}
                />
              </div>

              {/* Region Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {['All', 'Africa', 'Europe', 'Americas', 'Asia', 'Oceania'].map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      selectedRegion === reg ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>

              {/* Flag Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto p-1">
                {filteredCountries.map((c) => (
                  <div key={c.code} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center text-center hover:border-slate-700 transition">
                    <span className="text-3xl mb-1">{c.flag}</span>
                    <span className="text-xs font-bold text-white truncate w-full">{c.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{c.code} · {c.region}</span>

                    <div className="grid grid-cols-2 gap-1.5 w-full mt-2.5">
                      <button
                        onClick={() => {
                          const updated = { ...state, flag1: c.flag, updatedAt: Date.now() };
                          syncState(updated);
                          showToast(`Assigned ${c.flag} to Player 1`);
                        }}
                        className="py-1 rounded bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-[10px] font-bold text-slate-300 transition"
                      >
                        Set P1
                      </button>
                      <button
                        onClick={() => {
                          const updated = { ...state, flag2: c.flag, updatedAt: Date.now() };
                          syncState(updated);
                          showToast(`Assigned ${c.flag} to Player 2`);
                        }}
                        className="py-1 rounded bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-[10px] font-bold text-slate-300 transition"
                      >
                        Set P2
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: GITHUB SYNC & EXPORT HUB */}
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
                    <p className="text-xs text-slate-400">Linked GitHub repository branch: <span className="text-amber-400 font-mono">main</span></p>
                  </div>
                </div>

                <button
                  onClick={fetchGitStatus}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${gitLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {/* Status info box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
                <div className="text-amber-400 font-bold uppercase text-[10px] tracking-wider">Repository Status:</div>
                <div className="text-slate-300">{gitStatusData?.status || 'Working tree clean. All changes committed to branch main.'}</div>
                <div className="border-t border-slate-800/80 pt-2 text-slate-400 text-[11px]">
                  Recent commits:
                  <pre className="text-amber-300 mt-1 whitespace-pre-wrap">{gitStatusData?.log || 'f2c6197 Add shot clock, sound effects, themes, avatars/logo upload, hill-hill alert, and expanded countries'}</pre>
                </div>
              </div>

              {/* Push Directly to GitHub with Personal Access Token */}
              <div className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Push to GitHub in 1 Click</span>
                </div>
                <p className="text-xs text-slate-400">
                  Enter your GitHub Personal Access Token (PAT) with write permissions to push the latest commit directly to <code className="text-amber-300">kravowork-hub/Platnumz-Scoreboard</code>:
                </p>

                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
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
                    Push to GitHub
                  </button>
                </div>

                {gitOutput && (
                  <div className={`p-3 rounded-lg text-xs font-mono mt-2 ${gitOutput.success ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                    {gitOutput.message}
                  </div>
                )}
              </div>

              {/* Download Repo Files directly */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Or Download Updated Files:</span>
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
      <footer className="border-t border-slate-800/80 bg-[#080d17] py-4 px-6 text-center text-xs text-slate-500">
        <div>
          Branded for <strong className="text-amber-400">KRAVO PLATNUMZ OFFICIAL</strong> · Professional Cuesport Broadcast Scoreboard
        </div>
      </footer>
    </div>
  );
}
