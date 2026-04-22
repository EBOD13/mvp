#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
LOG_DIR="$ROOT_DIR/.logs"
ADB_EXE="${ANDROID_ADB_EXE:-/mnt/c/Users/maril/AppData/Local/Android/Sdk/platform-tools/adb.exe}"
EMULATOR_SERIAL="${1:-}"

mkdir -p "$LOG_DIR"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

wait_for_http() {
  local url="$1"
  local max_tries="${2:-30}"
  local i=1
  while [[ "$i" -le "$max_tries" ]]; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
    i=$((i + 1))
  done
  return 1
}

windows_metro_running() {
  local status
  status="$(powershell.exe -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing http://localhost:8081/status).Content } catch { '' }" | tr -d '\r')"
  [[ "$status" == "packager-status:running" ]]
}

detect_emulator() {
  "$ADB_EXE" devices | awk '$1 ~ /^emulator-/ && $2 == "device" { print $1; exit }'
}

require_cmd curl
require_cmd npm
require_cmd powershell.exe

if [[ ! -x "$ADB_EXE" ]]; then
  echo "Windows adb.exe not found at: $ADB_EXE"
  echo "Set ANDROID_ADB_EXE to the correct adb.exe path and retry."
  exit 1
fi

echo "[1/5] Starting backend..."
cd "$BACKEND_DIR"

if [[ ! -x "$BACKEND_DIR/.venv/bin/python" ]]; then
  echo "Creating backend virtualenv..."
  /usr/bin/python3 -m venv .venv
  ./.venv/bin/pip install -r requirements.txt
fi

if wait_for_http "http://127.0.0.1:8000/docs" 2; then
  echo "Backend already running on port 8000."
else
  nohup ./.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload \
    > "$LOG_DIR/backend.log" 2>&1 &
  if wait_for_http "http://127.0.0.1:8000/docs" 30; then
    echo "Backend started. Logs: $LOG_DIR/backend.log"
  else
    echo "Backend failed to start. Check: $LOG_DIR/backend.log"
    exit 1
  fi
fi

echo "[2/5] Starting Metro..."
cd "$FRONTEND_DIR"
if windows_metro_running; then
  echo "Metro already running on port 8081."
else
  nohup npm start > "$LOG_DIR/metro.log" 2>&1 &
  local_tries=1
  until windows_metro_running || [[ "$local_tries" -gt 45 ]]; do
    sleep 1
    local_tries=$((local_tries + 1))
  done
  if windows_metro_running; then
    echo "Metro started. Logs: $LOG_DIR/metro.log"
  else
    echo "Metro failed to start. Check: $LOG_DIR/metro.log"
    exit 1
  fi
fi

echo "[3/5] Resolving emulator..."
if [[ -z "$EMULATOR_SERIAL" ]]; then
  EMULATOR_SERIAL="$(detect_emulator)"
fi

if [[ -z "$EMULATOR_SERIAL" ]]; then
  echo "No running emulator detected via adb.exe. Start Pixel_7 and retry."
  exit 1
fi

echo "Using emulator: $EMULATOR_SERIAL"

echo "[4/5] Setting adb reverse ports..."
"$ADB_EXE" -s "$EMULATOR_SERIAL" reverse tcp:8081 tcp:8081
"$ADB_EXE" -s "$EMULATOR_SERIAL" reverse tcp:8000 tcp:8000
"$ADB_EXE" -s "$EMULATOR_SERIAL" reverse --list

echo "[5/5] Launching Android app..."
if grep -q '^API_BASE_URL=http://10.0.2.2:8000/$' "$FRONTEND_DIR/.env"; then
  echo "frontend/.env API_BASE_URL is set correctly."
else
  echo "Warning: frontend/.env API_BASE_URL is not exactly http://10.0.2.2:8000/"
fi

cd "$FRONTEND_DIR"
npm run android -- --deviceId "$EMULATOR_SERIAL"
