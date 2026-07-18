#!/usr/bin/env bash
set -euo pipefail

PI_USER="${PI_USER:-admin}"
PI_HOME="${PI_HOME:-/home/${PI_USER}}"
INSTALL_DIR="${PI_HOME}/TaktBuilderLauncher"
GAME_DIR="${PI_HOME}/TaktBuilder"
PROFILE_DIR="${PI_HOME}/TaktBuilderProfile"
DATA_DIR="${PI_HOME}/TaktBuilderData"
SERVICE_NAME="launcher.service"

if ! id "${PI_USER}" >/dev/null 2>&1; then
  echo "User ${PI_USER} does not exist. Set PI_USER before running install.sh."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing Takt Builder launcher for ${PI_USER}..."

if ! command -v python3 >/dev/null 2>&1 || {
  ! command -v chromium-browser >/dev/null 2>&1 && ! command -v chromium >/dev/null 2>&1
}; then
  if command -v apt-get >/dev/null 2>&1; then
    echo "Installing required runtime packages..."
    sudo apt-get update
    sudo apt-get install -y python3 chromium-browser || sudo apt-get install -y python3 chromium
  else
    echo "Missing python3 or Chromium, and apt-get is not available."
    exit 1
  fi
fi

sudo mkdir -p "${INSTALL_DIR}" "${GAME_DIR}" "${PROFILE_DIR}" "${DATA_DIR}"
sudo cp "${SCRIPT_DIR}/launcher.sh" "${INSTALL_DIR}/launcher.sh"
sudo cp "${SCRIPT_DIR}/update.sh" "${INSTALL_DIR}/update.sh"
sudo chmod +x "${INSTALL_DIR}/launcher.sh" "${INSTALL_DIR}/update.sh"
sudo chown -R "${PI_USER}:${PI_USER}" "${INSTALL_DIR}" "${GAME_DIR}" "${PROFILE_DIR}" "${DATA_DIR}"

if [ -d "${SCRIPT_DIR}/../dist" ] && [ -f "${SCRIPT_DIR}/../dist/index.html" ]; then
  echo "Installing current local dist build..."
  sudo -u "${PI_USER}" "${INSTALL_DIR}/update.sh" "${SCRIPT_DIR}/../dist"
elif [ ! -f "${GAME_DIR}/index.html" ]; then
  echo "No local dist build found. Creating placeholder until the first USB update."
  sudo -u "${PI_USER}" tee "${GAME_DIR}/index.html" >/dev/null <<'HTML'
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Takt Builder</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #172033; color: white; font: 24px system-ui, sans-serif; }
      main { max-width: 720px; padding: 32px; text-align: center; }
    </style>
  </head>
  <body>
    <main>
      <h1>Takt Builder</h1>
      <p>No game build installed yet. Copy a Vite <strong>dist</strong> folder to a USB drive, insert it, and reboot.</p>
    </main>
  </body>
</html>
HTML
fi

sudo cp "${SCRIPT_DIR}/${SERVICE_NAME}" "/etc/systemd/system/${SERVICE_NAME}"
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}"

echo "Installation complete."
echo "Reboot the Pi. Future updates only need: npm run build, copy dist to USB, insert USB, reboot."
