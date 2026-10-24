# Platinum Skills Signature — Platnumz Cuesport Scoreboard
Branded for **KRAVO PLATNUMZ OFFICIAL**.

An elite cuesport broadcast scoreboard controller and transparent OBS Studio overlay system designed for 8-ball, 9-ball, 10-ball, and blackball pool tournaments.

---

## 🌟 What's New & Included Features

1. **⏱️ Interactive Shot Clock & Table Action**
   - 30s, 45s, and 60s preset countdown shot clock.
   - **+30s Extension button** for player extensions.
   - Built-in audio warning beeps (at 10s and 5s) and buzzer alarm (at 0s).
   - **Active Player / On-Table indicator** highlights the shooting player with a gold banner on OBS.
   - Hotkey controls: Space (Start/Pause), `E` (Extension).

2. **⚡ Hill-Hill & Match Point Animations**
   - **Hill-Hill Alert**: Flashing crimson & gold banner automatically appears in the center when both players are 1 rack away from winning (`RaceTo - 1`).
   - **Match Point Badge**: Automatically highlights the leading player when on match point.
   - **Winner Celebration Modal**: Confetti and champion banner emerge when either player reaches the target frame score.

3. **🎨 Visual Customization & 5 Luxury Themes**
   - **Signature Platnumz** (Sapphire Blue & Pure Gold)
   - **Emerald Onyx** (Tournament Green & Champagne Gold)
   - **Ruby Crimson** (Velvet Red & Gold)
   - **Midnight Cyber** (Carbon Black & Neon Cyan/Gold)
   - **Royal Purple** (Imperial Violet & Crown Gold)
   - Custom Tournament Logo upload (with auto-compression & preview).
   - Custom Player 1 & Player 2 Avatar photo uploads.
   - Switchable OBS Overlay Position: **Bottom Bar**, **Top Banner**, or **Floating Lower-Third**.

4. **🌍 Complete Flag Database**
   - Expanded list of all 54 African nations plus major international cuesport countries (UK, USA, Philippines, China, etc.).

5. **🎱 Rack & Ball Tracker**
   - Remaining ball tracker (15 balls down to 8-ball/final ball).
   - Break & Run (B&R) counter for both players.

6. **📡 Triple-Redundant Synchronization**
   - **Firebase Realtime Database** for remote phone-to-PC internet sync.
   - **BroadcastChannel API** for instantaneous zero-latency local multi-tab sync.
   - **LocalStorage fallback** for offline resilience.

---

## 📁 Repository Structure

- `index.html` — Scoreboard Controller & Match Manager.
- `overlay.html` — Transparent OBS Browser Source overlay.
- `README.md` — Setup, OBS guide, and deployment notes.

---

## 🎥 OBS Studio Setup

1. In OBS Studio, add a new **Browser Source** in your scene.
2. Set the URL to your deployed overlay:
   ```
   https://YOUR-DOMAIN/overlay.html?room=platnumz-live-match
   ```
3. Recommended Resolution:
   - Width: `1920`
   - Height: `1080` (or `350` if positioning solely at the bottom)
4. Enable **Shutdown source when not visible** and ensure **Custom CSS** is empty or default.
5. The background is **100% transparent** and will overlay cleanly over your pool table camera feed!

---

## ⌨️ Hotkeys Reference

| Key | Action |
|-----|--------|
| `Q` | Player 1: Score +1 |
| `A` | Player 1: Score −1 |
| `P` | Player 2: Score +1 |
| `L` | Player 2: Score −1 |
| `SPACE` | Shot Clock: Start / Pause |
| `E` | Shot Clock: +30s Extension |
| `S` | Swap Players (Names, Flags, Scores) |
| `R` | Reset Scores to 0-0 |

---

## 🐧 Linux Mint Desktop Installation

Platnumz Scoreboard provides native installation capability for **Linux Mint (Cinnamon, MATE, Xfce)** and Ubuntu-based distributions:

### Option 1: Automated 1-Line Terminal Installer
Run this command in your Linux Mint terminal:
```bash
curl -fsSL https://ais-dev-yxnie2e36phjg3qeo7atdj-703565137561.europe-west2.run.app/install-linux-mint.sh | bash
```
Or if running locally or from this repository:
```bash
chmod +x install-linux-mint.sh
./install-linux-mint.sh
```
This automatically:
- Installs the high-resolution Platnumz icons into `~/.local/share/icons/`
- Creates `~/.local/share/applications/platnumz-scoreboard.desktop` (adding it to your Linux Mint Cinnamon start menu under *Sound & Video* / *Games*)
- Creates an executable trusted shortcut on your Linux Mint Desktop (`~/Desktop/platnumz-scoreboard.desktop`)
- Launches in standalone window mode (Chrome/Chromium/Brave/Firefox)

### Option 2: Linux Mint Web App Manager (`webapp-manager`)
Linux Mint includes a native **Web App Manager** built by the Linux Mint development team:
1. Open the Linux Mint Menu and search for **Web App Manager**.
2. Click **+** (Add a new Web App).
3. Fill in:
   - **Name**: `Platnumz Scoreboard`
   - **Address**: `https://ais-dev-yxnie2e36phjg3qeo7atdj-703565137561.europe-west2.run.app` (or your local URL)
   - **Icon**: Choose icon or paste `/pwa-512x512.png`
   - **Category**: `Sound & Video` or `Games`
   - **Browser**: Firefox, Chromium, or Google Chrome
   - **Navigation bar**: Off
4. Click **OK**. Platnumz Scoreboard is now integrated with your Cinnamon taskbar, alt-tab switcher, and system tray!

---

## 🚀 Deploy on Vercel, Netlify, or GitHub Pages

The repository includes native zero-configuration real-time synchronization designed specifically for serverless hosting platforms:

### Vercel Deployment
1. Import this repository into [Vercel](https://vercel.com).
2. Framework Preset: **Vite** (or **Other**).
3. The included `vercel.json` and `/api/sync.ts` serverless route automatically handle dynamic routing, preflight CORS headers, and `/overlay.html` asset serving.
4. Click **Deploy**.

### Netlify Deployment
1. Import this repository into [Netlify](https://netlify.com).
2. The included `netlify.toml` automatically configures static redirects, CORS headers, and serverless sync fallbacks.
3. Click **Deploy**.

### Universal Cross-Device Real-Time Sync
- **No API keys or databases required**: When deployed on Vercel, Netlify, or GitHub Pages, cross-device sync between your phone (mobile controller) and PC (OBS Studio Browser Source) works instantly worldwide using high-speed encrypted WebSockets with automatic multi-broker failover.
- **Retained State Memory**: When OBS opens or restarts, the latest score and match state are delivered immediately.
- **Zero-Latency Same-PC Mode**: When OBS and the controller run on the same computer, the `BroadcastChannel` API and local storage events deliver sub-1ms instant updates with zero network usage.

---
© Kravo Platnumz Official. Built for cuesport streaming excellence.
