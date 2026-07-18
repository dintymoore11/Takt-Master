#!/usr/bin/env bash
set -euo pipefail

PI_USER="${PI_USER:-admin}"
PI_HOME="${PI_HOME:-/home/${PI_USER}}"
GAME_DIR="${PI_HOME}/TaktBuilder"
PROFILE_DIR="${PI_HOME}/TaktBuilderProfile"
DATA_DIR="${PI_HOME}/TaktBuilderData"
SOURCE_DIST="${1:-}"

if [ -z "${SOURCE_DIST}" ]; then
  echo "Usage: update.sh /path/to/dist"
  exit 1
fi

if [ ! -d "${SOURCE_DIST}" ] || [ ! -f "${SOURCE_DIST}/index.html" ]; then
  echo "Update source must be a Vite dist folder containing index.html: ${SOURCE_DIST}"
  exit 1
fi

mkdir -p "${GAME_DIR}" "${PROFILE_DIR}" "${DATA_DIR}"

STAGING_DIR="${GAME_DIR}.staging"
BACKUP_DIR="${GAME_DIR}.previous"

rm -rf "${STAGING_DIR}"
mkdir -p "${STAGING_DIR}"
cp -a "${SOURCE_DIST}/." "${STAGING_DIR}/"

# Controller mappings, high scores, and settings live in Chromium's profile
# at TaktBuilderProfile. This update only replaces static game files.
rm -rf "${BACKUP_DIR}"
if [ -d "${GAME_DIR}" ]; then
  mv "${GAME_DIR}" "${BACKUP_DIR}"
fi
mv "${STAGING_DIR}" "${GAME_DIR}"
rm -rf "${BACKUP_DIR}"

echo "Updated ${GAME_DIR} from ${SOURCE_DIST}"
