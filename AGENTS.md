# AGENTS.md — AI 助手工作守则

本文件给进入本仓库的 AI 编码助手提供工作上下文。

## 这是什么

Bloom for Typora —— 面向长文写作与阅读的 Typora 主题集，24 套明暗主题，
OKLCH 调色，已收录 Typora 官方主题画廊（theme.typora.io）。

## 关键文件 —— 主题 CSS 是**生成物**，不要手改

- `scripts/theme-vars.js` / `scripts/theme-list.js`：**主题的真源** —— 改配色、加主题都在这里。
- `scripts/build-themes.js`：由真源生成 `bloom-*.css`（产物不进 git，发布时打包）。
- `docs/theme-color-standard.md`：配色标准文档。
- `contrast.config.json` + `npm run check:contrast`：对比度护栏 —— **任何配色改动必须过这道门**（WCAG 是本项目对外承诺）。
- `bloom/fonts/`：内置字体。
- `README.md` / `README.en.md`：双语 README，**两边必须同步改**。

## 常用命令

```bash
npm run build            # 生成站点数据 + 构建全部主题 CSS
npm run validate:themes  # 主题标准校验（构建后再跑）
npm run check:contrast   # ui-craft 对比度护栏
npm run package          # 打包发布用 zip
npm run deploy           # 构建并部署预览官网（Cloudflare Pages）
```

## 约定

- 改主题永远改 `theme-vars.js`，重新 build —— 直接改生成出来的 CSS 会被下次构建覆盖。
- 配色不过 `check:contrast` 不许合入。
- 版本号与 CHANGELOG 由 release-please 管理（见 `release-please-config.json`），不要手改。
