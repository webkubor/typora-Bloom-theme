#!/bin/bash
set -e

ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

# 1. 构建主题 CSS 到 dist/
node scripts/build-themes.js

# 2. 生成 _pages/ 部署目录
node scripts/pages.js

echo "Pages 构建完成"
