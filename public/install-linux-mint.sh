#!/usr/bin/env bash
# ==============================================================================
# Platnumz Scoreboard — Linux Mint & Ubuntu Desktop Installer
# Branded for KRAVO PLATNUMZ OFFICIAL
# ==============================================================================

set -e

# Terminal Colors
GOLD='\033[1;33m'
BLUE='\033[1;34m'
CYAN='\033[1;36m'
GREEN='\033[1;32m'
RED='\033[1;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BLUE}"
echo "  ____  _       _                                  "
echo " |  _ \| | __ _| |_ _ __  _   _ _ __ ___  ____     "
echo " | |_) | |/ _\` | __| '_ \| | | | '_ \` _ \|_  /     "
echo " |  __/| | (_| | |_| | | | |_| | | | | | |/ /      "
echo " |_|   |_|\__,_|\__|_| |_|\__,_|_| |_| |_/___|     "
echo -e "${GOLD}   SCOREBOARD & OBS OVERLAY — LINUX MINT EDITION${NC}"
echo "======================================================"
echo ""

# Configuration Variables
DEFAULT_URL="https://ais-dev-yxnie2e36phjg3qeo7atdj-703565137561.europe-west2.run.app"
APP_URL="${PLATNUMZ_URL:-$DEFAULT_URL}"

# Detect if passed an argument for custom URL
if [ -n "$1" ]; then
    APP_URL="$1"
fi

echo -e "${CYAN}* Target Application URL:${NC} ${BOLD}$APP_URL${NC}"

# Target directories according to XDG Desktop Base Directory Specification
APPS_DIR="$HOME/.local/share/applications"
ICONS_512_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
ICONS_SCALABLE_DIR="$HOME/.local/share/icons/hicolor/scalable/apps"
DESKTOP_DIR="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")"

mkdir -p "$APPS_DIR"
mkdir -p "$ICONS_512_DIR"
mkdir -p "$ICONS_SCALABLE_DIR"
mkdir -p "$DESKTOP_DIR"

echo -e "${BLUE}* Setting up desktop and application directories...${NC}"

# Download or install icon
ICON_PNG_PATH="$ICONS_512_DIR/platnumz-scoreboard.png"
ICON_SVG_PATH="$ICONS_SCALABLE_DIR/platnumz-scoreboard.svg"

echo -e "${BLUE}* Fetching official Platnumz high-resolution icon...${NC}"
if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$APP_URL/pwa-512x512.png" -o "$ICON_PNG_PATH" 2>/dev/null || true
    curl -fsSL "$APP_URL/icon.svg" -o "$ICON_SVG_PATH" 2>/dev/null || true
elif command -v wget >/dev/null 2>&1; then
    wget -q "$APP_URL/pwa-512x512.png" -O "$ICON_PNG_PATH" 2>/dev/null || true
    wget -q "$APP_URL/icon.svg" -O "$ICON_SVG_PATH" 2>/dev/null || true
fi

# Detect available browser for standalone web app mode
APP_RUNNER=""
if command -v google-chrome >/dev/null 2>&1; then
    APP_RUNNER="google-chrome --app=\"$APP_URL\""
elif command -v chromium >/dev/null 2>&1; then
    APP_RUNNER="chromium --app=\"$APP_URL\""
elif command -v chromium-browser >/dev/null 2>&1; then
    APP_RUNNER="chromium-browser --app=\"$APP_URL\""
elif command -v brave-browser >/dev/null 2>&1; then
    APP_RUNNER="brave-browser --app=\"$APP_URL\""
elif command -v flatpak >/dev/null 2>&1 && flatpak info org.chromium.Chromium >/dev/null 2>&1; then
    APP_RUNNER="flatpak run org.chromium.Chromium --app=\"$APP_URL\""
elif command -v firefox >/dev/null 2>&1; then
    APP_RUNNER="firefox \"$APP_URL\""
else
    APP_RUNNER="xdg-open \"$APP_URL\""
fi

OVERLAY_RUNNER="xdg-open \"$APP_URL/overlay.html\""

echo -e "${BLUE}* Selected Browser Engine:${NC} ${GREEN}$APP_RUNNER${NC}"

# Create the .desktop launcher file
DESKTOP_FILE="$APPS_DIR/platnumz-scoreboard.desktop"

cat <<EOF > "$DESKTOP_FILE"
[Desktop Entry]
Version=1.0
Type=Application
Name=Platnumz Scoreboard
GenericName=Cuesport Scoreboard & OBS Overlay
Comment=Professional Cuesport Scoreboard and OBS Overlay System by Kravo Platnumz
Exec=$APP_RUNNER
Icon=platnumz-scoreboard
Terminal=false
StartupNotify=true
Categories=Game;AudioVideo;Video;Network;Utility;
Keywords=pool;billiards;snooker;scoreboard;obs;overlay;stream;kravo;platnumz;
Actions=Controller;Overlay;LocalHost;

[Desktop Action Controller]
Name=Open Scoreboard Controller
Exec=$APP_RUNNER

[Desktop Action Overlay]
Name=Open Transparent OBS Overlay
Exec=$OVERLAY_RUNNER

[Desktop Action LocalHost]
Name=Open Local Match (localhost:3000)
Exec=xdg-open "http://localhost:3000"
EOF

chmod +x "$DESKTOP_FILE"

# Place shortcut on Linux Mint Desktop
if [ -d "$DESKTOP_DIR" ]; then
    cp "$DESKTOP_FILE" "$DESKTOP_DIR/platnumz-scoreboard.desktop"
    chmod +x "$DESKTOP_DIR/platnumz-scoreboard.desktop"
    
    # Trust the desktop launcher in Cinnamon / GNOME / MATE (prevents "Untrusted Application Launcher" prompt)
    if command -v gio >/dev/null 2>&1; then
        gio set "$DESKTOP_DIR/platnumz-scoreboard.desktop" metadata::trusted true 2>/dev/null || true
    fi
    echo -e "${GREEN}✓ Desktop shortcut created at:${NC} $DESKTOP_DIR/platnumz-scoreboard.desktop"
fi

# Refresh Linux Mint desktop and icon caches
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$APPS_DIR" 2>/dev/null || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}${BOLD}======================================================"
echo -e "🎉 Platnumz Scoreboard successfully installed on Linux Mint!"
echo -e "======================================================${NC}"
echo ""
echo -e "${GOLD}How to launch:${NC}"
echo -e " 1. Click ${BOLD}Linux Mint Menu${NC} ➔ search for ${CYAN}\"Platnumz Scoreboard\"${NC}"
echo -e " 2. Or double-click the icon on your ${BOLD}Desktop${NC}"
echo -e " 3. Or launch from terminal: ${BOLD}xdg-open \"$APP_URL\"${NC}"
echo ""
echo -e "${GOLD}OBS Studio on Linux Mint:${NC}"
echo -e " • Add a Browser Source with URL: ${CYAN}$APP_URL/overlay.html${NC}"
echo -e " • Set dimensions to ${BOLD}1920x1080${NC} (100% transparent overlay)"
echo ""
echo -e "${GOLD}Linux Mint Web App Manager:${NC}"
echo -e " • You can also open ${BOLD}Web App Manager${NC} (built into Linux Mint)"
echo -e " • Enter Name: ${BOLD}Platnumz Scoreboard${NC}"
echo -e " • Enter Address: ${CYAN}$APP_URL${NC}"
echo ""
