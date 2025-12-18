#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-5173}"
HOST="127.0.0.1"

URL="http://${HOST}:${PORT}/"

echo "Preview server: ${URL}"

if command -v open >/dev/null 2>&1; then
  open "$URL" || true
fi

python3 -m http.server "$PORT" --bind "$HOST"
