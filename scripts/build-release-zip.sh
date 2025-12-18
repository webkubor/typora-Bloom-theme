#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ZIP_NAME="Bloom-theme.zip"

cd "$ROOT_DIR"

rm -f "$ZIP_NAME"

FILES=(
  "bloom-light.css"
  "bloom-dark.css"
)

if [[ -d "assets" ]]; then
  FILES+=("assets")
fi

zip -r "$ZIP_NAME" "${FILES[@]}" -x "**/.DS_Store" "**/Thumbs.db" >/dev/null

echo "Created $ZIP_NAME"
