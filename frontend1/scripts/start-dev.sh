#!/usr/bin/env bash
set -euo pipefail

pids=()

cleanup() {
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
}

trap cleanup EXIT INT TERM

npm run dev:backend &
pids+=("$!")

npm run dev:vite &
pids+=("$!")

printf "AURA frontend + vision backend avviati.\n"
printf "Avvia il detector webcam in un altro terminale con: npm run dev:vision\n"

while true; do
  for pid in "${pids[@]}"; do
    if ! kill -0 "$pid" 2>/dev/null; then
      wait "$pid"
      exit "$?"
    fi
  done

  sleep 1
done
