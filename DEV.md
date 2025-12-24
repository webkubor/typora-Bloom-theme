## Dev Guide

### Structure
- `theme-src/`: source of truth (base + theme roots)
- `dist/`: generated theme files (ignored by git)
- `index.html`: preview page (loads themes from `dist/`)
- `typora-bloom-theme/`: assets used by preview + release

### Scripts
- `npm run build`: generate `dist/bloom-*.css`
- `npm run preview`: build + run local preview server
- `npm run package`: build + create `Bloom-theme.zip`
- `npm run release`: package + commit + tag + push

### Release Flow
1. Update `VERSION.txt`
2. Run `npm run release`

Notes:
- `release` will `git add -A`, commit, tag, and push.
- `package` requires the `zip` command available in your shell.
