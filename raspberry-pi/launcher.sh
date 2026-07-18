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
SERVER_PID_FILE="${DATA_DIR}/server.pid"
CHROMIUM_PID_FILE="${DATA_DIR}/chromium.pid"

mkdir -p "${GAME_DIR}" "${PROFILE_DIR}" "${DATA_DIR}" "${LOG_DIR}" "${STATUS_DIR}"

log() {
  printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" | tee -a "${LOG_DIR}/launcher.log"
}

exec 9>"${DATA_DIR}/launcher.lock"
if ! flock -n 9; then
  log "Another Takt Builder launcher is already running."
  exit 0
fi

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

launcher_update_dir_for_dist() {
  local dist_path="$1"
  local usb_root
  usb_root="$(dirname "${dist_path}")"

  local candidate
  for candidate in "${usb_root}/raspberry-pi" "${dist_path}/raspberry-pi"; do
    if [ -f "${candidate}/launcher.sh" ] && [ -f "${candidate}/update.sh" ]; then
      printf '%s\n' "${candidate}"
      return 0
    fi
  done
  return 1
}

update_launcher_from_usb() {
  local dist_path="$1"
  local launcher_source
  launcher_source="$(launcher_update_dir_for_dist "${dist_path}" || true)"
  if [ -z "${launcher_source}" ]; then
    return 0
  fi

  log "Launcher update found at ${launcher_source}; installing for next boot."
  cp "${launcher_source}/launcher.sh" "${INSTALL_DIR}/launcher.sh"
  cp "${launcher_source}/update.sh" "${INSTALL_DIR}/update.sh"
  chmod +x "${INSTALL_DIR}/launcher.sh" "${INSTALL_DIR}/update.sh"
}

write_status_page() {
  local title="$1"
  local message="$2"
  local percent="$3"
  local detail="${4:-}"
  local revision
  revision="$(date +%s%N)"

  cat >"${STATUS_DIR}/index.html" <<HTML
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="takt-status-page" content="true">
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
        cursor: none;
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
    <main data-status-revision="${revision}">
      <h1>${title}</h1>
      <p>${message}</p>
      <div class="bar" aria-label="Startup progress"><div class="fill"></div></div>
      <p class="detail">${detail}</p>
    </main>
    <script>
      (() => {
        const currentRevision = "${revision}";
        const marker = 'name="takt-status-page"';
        const serverUrl = "http://127.0.0.1:${PORT}/";
        async function poll() {
          try {
            const response = await fetch(serverUrl + '?taktBootProbe=' + Date.now(), { cache: 'no-store' });
            if (response.ok) {
              const html = await response.text();
              if (!html.includes(marker)) {
                window.location.replace(serverUrl + '?taktLaunch=' + Date.now());
                return;
              }
              const match = html.match(/data-status-revision="([^"]+)"/);
              if (match && match[1] !== currentRevision) {
                document.open();
                document.write(html);
                document.close();
                return;
              }
            }
          } catch (error) {
            // The local server may restart briefly while switching from status to game.
          }
          window.setTimeout(poll, 1000);
        }
        window.setTimeout(poll, 1000);
      })();
    </script>
  </body>
</html>
HTML
}

start_server() {
  local root_dir="$1"
  local log_file="$2"
  log "Starting local web server for ${root_dir} on port ${PORT}."
  cd "${root_dir}"
  python3 -m http.server "${PORT}" --bind 127.0.0.1 >>"${LOG_DIR}/${log_file}" 2>&1 &
  SERVER_PID="$!"
  printf '%s\n' "${SERVER_PID}" >"${SERVER_PID_FILE}"
}

wait_for_server() {
  local attempt
  for attempt in $(seq 1 40); do
    if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
      log "Local web server stopped unexpectedly."
      return 1
    fi
    if python3 - "${PORT}" >/dev/null 2>&1 <<'PYWAIT'
import sys
import urllib.request

port = sys.argv[1]
with urllib.request.urlopen(f"http://127.0.0.1:{port}", timeout=0.5) as response:
    if response.status >= 400:
        raise SystemExit(1)
PYWAIT
    then
      return 0
    fi
    sleep 0.25
  done

  log "Timed out waiting for local web server."
  return 1
}

stop_server() {
  if [ -n "${SERVER_PID:-}" ]; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
    SERVER_PID=""
  fi
  rm -f "${SERVER_PID_FILE}"
}

stop_chromium() {
  if [ -n "${CHROMIUM_PID:-}" ]; then
    kill "${CHROMIUM_PID}" 2>/dev/null || true
    wait "${CHROMIUM_PID}" 2>/dev/null || true
    CHROMIUM_PID=""
  fi
  pkill -f -- "--user-data-dir=${PROFILE_DIR}" 2>/dev/null || true
  rm -f "${CHROMIUM_PID_FILE}"
}

wait_for_display() {
  local attempt
  for attempt in $(seq 1 90); do
    if [ -S "/tmp/.X11-unix/X0" ] || [ -n "${WAYLAND_DISPLAY:-}" ]; then
      return 0
    fi
    sleep 1
  done

  log "Timed out waiting for the desktop display."
  return 1
}

start_chromium_once() {
  local launch_url="$1"
  local chromium_bin=""
  export DISPLAY="${DISPLAY:-:0}"
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

  log "Starting Chromium at ${launch_url}."
  "${chromium_bin}" \
    --kiosk "${launch_url}" \
    --user-data-dir="${PROFILE_DIR}" \
    --no-first-run \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-restore-session-state \
    --autoplay-policy=no-user-gesture-required \
    >>"${LOG_DIR}/chromium.log" 2>&1 &
  CHROMIUM_PID="$!"
  printf '%s\n' "${CHROMIUM_PID}" >"${CHROMIUM_PID_FILE}"
}

start_chromium() {
  local launch_url="${1:-http://127.0.0.1:${PORT}/}"
  local attempt
  wait_for_display || return 1

  for attempt in $(seq 1 6); do
    start_chromium_once "${launch_url}" || return 1
    sleep 2
    if kill -0 "${CHROMIUM_PID}" 2>/dev/null; then
      log "Chromium launched."
      return 0
    fi
    wait "${CHROMIUM_PID}" 2>/dev/null || true
    CHROMIUM_PID=""
    log "Chromium exited immediately; retrying (${attempt}/6)."
    sleep 3
  done

  log "Chromium did not stay open after retries."
  return 1
}

cleanup_stale_processes() {
  local old_pid
  if [ -f "${CHROMIUM_PID_FILE}" ]; then
    old_pid="$(cat "${CHROMIUM_PID_FILE}" 2>/dev/null || true)"
    if [ -n "${old_pid}" ]; then
      kill "${old_pid}" 2>/dev/null || true
    fi
  fi
  pkill -f -- "--user-data-dir=${PROFILE_DIR}" 2>/dev/null || true

  if [ -f "${SERVER_PID_FILE}" ]; then
    old_pid="$(cat "${SERVER_PID_FILE}" 2>/dev/null || true)"
    if [ -n "${old_pid}" ]; then
      kill "${old_pid}" 2>/dev/null || true
    fi
  fi
  pkill -f -- "python3 -m http.server ${PORT} --bind 127.0.0.1" 2>/dev/null || true
  rm -f "${SERVER_PID_FILE}" "${CHROMIUM_PID_FILE}"
}

cleanup() {
  stop_chromium
  stop_server
}
trap cleanup EXIT INT TERM

cleanup_stale_processes
write_status_page "Takt Builder" "Starting the arcade cabinet." 10 "Checking for USB updates..."
start_chromium "file://${STATUS_DIR}/index.html" || true
start_server "${STATUS_DIR}" "server-status.log"
if wait_for_server; then
  stop_chromium
  start_chromium "http://127.0.0.1:${PORT}/" || true
fi

if usb_dist="$(wait_for_usb_update)"; then
  log "USB update found at ${usb_dist}"
  write_status_page "Updating Takt Builder" "A USB update was found. Installing the new game now." 20 "Please leave the USB drive inserted."
  write_status_page "Updating Takt Builder" "Copying the new build from USB." 45 "Please leave the USB drive inserted."
  if "${INSTALL_DIR}/update.sh" "${usb_dist}" >>"${LOG_DIR}/update.log" 2>&1; then
    update_launcher_from_usb "${usb_dist}" >>"${LOG_DIR}/update.log" 2>&1 || log "Launcher script update failed; game update still completed."
    write_status_page "Update Complete" "The game update is complete. You can remove the USB drive now." 100 "Starting Takt Builder..."
    log "USB update completed."
    sleep 5
  else
    write_status_page "Update Failed" "The USB update did not complete. Launching the previously installed game." 100 "You can remove the USB drive and check logs later."
    log "Update failed; launching existing game."
    sleep 6
  fi
else
  write_status_page "Takt Builder" "Starting the installed game." 75 "No USB update found."
  log "No USB update found; launching installed game."
  sleep 1
fi

write_status_page "Takt Builder" "Loading the game." 90 "Almost ready..."
stop_server
start_server "${GAME_DIR}" "server.log"
if wait_for_server; then
  if [ -z "${CHROMIUM_PID:-}" ]; then
    start_chromium || true
  fi
else
  log "Game server did not become ready."
fi

wait "${SERVER_PID}"
