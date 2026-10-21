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

## 🚀 Deploy on Vercel or GitHub Pages

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Add shot clock, themes, avatars, hill-hill alert, and expanded countries"
   git push origin main
   ```
2. Link the repository in **Vercel** or enable **GitHub Pages** (Deploy from branch `main`, root `/`).
3. Your controller is at `/index.html` (or root `/`) and OBS overlay is at `/overlay.html`.

---
© Kravo Platnumz Official. Built for cuesport streaming excellence.
