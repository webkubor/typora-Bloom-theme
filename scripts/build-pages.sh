#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/_pages"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cp "$ROOT_DIR/index.html" "$OUT_DIR/index.html"
cp "$ROOT_DIR/bloom-light.css" "$OUT_DIR/bloom-light.css"
cp "$ROOT_DIR/bloom-dark.css" "$OUT_DIR/bloom-dark.css"

if [[ -f "$ROOT_DIR/favicon.svg" ]]; then
  cp "$ROOT_DIR/favicon.svg" "$OUT_DIR/favicon.svg"
fi

if [[ -f "$ROOT_DIR/logo.svg" ]]; then
  cp "$ROOT_DIR/logo.svg" "$OUT_DIR/logo.svg"
fi

touch "$OUT_DIR/.nojekyll"

if [[ -d "$ROOT_DIR/assets" ]]; then
  cp -R "$ROOT_DIR/assets" "$OUT_DIR/assets"
fi

echo "Built Pages site at $OUT_DIR"
