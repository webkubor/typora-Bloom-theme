#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/_pages"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cp "$ROOT_DIR/index.html" "$OUT_DIR/index.html"
cp "$ROOT_DIR/bloom-light.css" "$OUT_DIR/bloom-light.css"
cp "$ROOT_DIR/bloom-dark.css" "$OUT_DIR/bloom-dark.css"

# Copy all root SVG assets (logo, favicon, etc.)
cp "$ROOT_DIR"/*.svg "$OUT_DIR/" 2>/dev/null || true

touch "$OUT_DIR/.nojekyll"

if [[ -d "$ROOT_DIR/assets" ]]; then
  cp -R "$ROOT_DIR/assets" "$OUT_DIR/assets"
fi

echo "Built Pages site at $OUT_DIR"
