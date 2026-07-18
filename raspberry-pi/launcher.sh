#!/usr/bin/env bash
set -euo pipefail

PI_USER="${PI_USER:-admin}"
PI_HOME="${PI_HOME:-/home/${PI_USER}}"
INSTALL_DIR="${PI_HOME}/TaktBuilderLauncher"
GAME_DIR="${PI_HOME}/TaktBuilder"
PROFILE_DIR="${PI_HOME}/TaktBuilderProfile"
DATA_DIR="${PI_HOME}/TaktBuilderData"
PORT="${TAKT_PORT:-8080}"
LOG_DIR="${DATA_DIR}/logs"
STATUS_DIR="${DATA_DIR}/status"

mkdir -p "${GAME_DIR}" "${PROFILE_DIR}" "${DATA_DIR}" "${LOG_DIR}" "${STATUS_DIR}"

log() {
  printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" | tee -a "${LOG_DIR}/launcher.log"
}

find_usb_dist() {
  local roots=(
    "/media/${PI_USER}"
    "/media/admin"
    "/media/pi"
    "/run/media/${PI_USER}"
    "/mnt"
  )

  local root
  local candidate
  for root in "${roots[@]}"; do
    [ -d "${root}" ] || continue
    while IFS= read -r candidate; do
      if [ -f "${candidate}/index.html" ]; then
        printf '%s\n' "${candidate}"
        return 0
      fi
    done < <(find "${root}" -mindepth 1 -maxdepth 3 -type d -name dist -print 2>/dev/null)
  done
}

wait_for_usb_update() {
  local attempt
  for attempt in $(seq 1 20); do
    local dist_path
    dist_path="$(find_usb_dist | head -n 1 || true)"
    if [ -n "${dist_path}" ]; then
      printf '%s\n' "${dist_path}"
      return 0
    fi
    sleep 1
  done
  return 1
}

write_status_page() {
  local title="$1"
  local message="$2"
  local percent="$3"
  local detail="${4:-}"
  local refresh="${5:-2}"

  cat >"${STATUS_DIR}/index.html" <<HTML
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="${refresh}">
    <title>${title}</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #172033;
        color: #f8fafc;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
      }
      main {
        width: min(760px, calc(100vw - 48px));
        padding: 32px;
        border: 2px solid rgba(248, 250, 252, 0.22);
        border-radius: 8px;
        background: rgba(15, 23, 42, 0.88);
        text-align: center;
      }
      h1 {
        margin: 0 0 16px;
        font-size: clamp(34px, 6vw, 64px);
        letter-spacing: 0;
      }
      p {
        margin: 12px 0;
        font-size: clamp(20px, 3vw, 30px);
        line-height: 1.35;
      }
      .bar {
        overflow: hidden;
        height: 32px;
        margin: 28px 0 16px;
        border: 2px solid rgba(248, 250, 252, 0.4);
        border-radius: 6px;
        background: #0f172a;
      }
      .fill {
        width: ${percent}%;
        height: 100%;
        background: linear-gradient(90deg, #34d399, #f4c430);
        transition: width 0.35s ease;
      }
      .detail {
        color: #a7f3d0;
        font-weight: 800;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${message}</p>
      <div class="bar" aria-label="Update progress"><div class="fill"></div></div>
      <p class="detail">${detail}</p>
    </main>
  </body>
</html>
HTML
}

start_server() {
  local root_dir="$1"
  local log_file="$2"
  cd "${root_dir}"
  python3 -m http.server "${PORT}" --bind 127.0.0.1 >>"${LOG_DIR}/${log_file}" 2>&1 &
  SERVER_PID="$!"
}

stop_server() {
  if [ -n "${SERVER_PID:-}" ]; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
    SERVER_PID=""
  fi
}

start_chromium() {
  local chromium_bin=""
  export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
  export DBUS_SESSION_BUS_ADDRESS="${DBUS_SESSION_BUS_ADDRESS:-unix:path=${XDG_RUNTIME_DIR}/bus}"

  if command -v chromium-browser >/dev/null 2>&1; then
    chromium_bin="chromium-browser"
  elif command -v chromium >/dev/null 2>&1; then
    chromium_bin="chromium"
  else
    log "Chromium is not installed. Install chromium-browser or chromium."
    return 1
  fi

  "${chromium_bin}" \
    --kiosk "http://localhost:${PORT}" \
    --user-data-dir="${PROFILE_DIR}" \
    --no-first-run \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-restore-session-state \
    --autoplay-policy=no-user-gesture-required \
    >>"${LOG_DIR}/chromium.log" 2>&1 &
  CHROMIUM_PID="$!"
}

cleanup() {
  [ -n "${CHROMIUM_PID:-}" ] && kill "${CHROMIUM_PID}" 2>/dev/null || true
  [ -n "${SERVER_PID:-}" ] && kill "${SERVER_PID}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

if usb_dist="$(wait_for_usb_update)"; then
  log "USB update found at ${usb_dist}"
  write_status_page "Updating Takt Builder" "A USB update was found. Installing the new game now." 12 "Please leave the USB drive inserted."
  start_server "${STATUS_DIR}" "server-status.log"
  sleep 1
  start_chromium || true
  write_status_page "Updating Takt Builder" "Copying the new build from USB." 35 "Please leave the USB drive inserted."
  if "${INSTALL_DIR}/update.sh" "${usb_dist}" >>"${LOG_DIR}/update.log" 2>&1; then
    write_status_page "Update Complete" "The game update is complete. You can remove the USB drive now." 100 "Starting Takt Builder..." 1
    log "USB update completed."
    sleep 5
  else
    write_status_page "Update Failed" "The USB update did not complete. Launching the previously installed game." 100 "You can remove the USB drive and check logs later." 4
    log "Update failed; launching existing game."
    sleep 6
  fi
  stop_server
else
  log "No USB update found; launching installed game."
fi

start_server "${GAME_DIR}" "server.log"
sleep 1
if [ -z "${CHROMIUM_PID:-}" ]; then
  start_chromium || true
fi

wait "${SERVER_PID}"
