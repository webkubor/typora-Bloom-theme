# Theme Color Standard

Bloom 的主题色定义以 `mist` / `mist-dark` 和 `wheat` / `wheat-dark` 为标准。新增颜色或修改颜色时，不允许临时发明变量、删减 key、改 section 顺序，先按这里的结构落地，再跑校验。

## Canonical Sources

- 完整 root 文件标准：`theme-src/root-mist.css`、`theme-src/root-mist-dark.css`
- template + colors 标准：`scripts/theme-list.js` 里的 `wheat`、`wheat-dark`
- 构建输出标准：`dist/bloom-<theme>.css`

## Preferred Workflow

新增主题优先使用 `template + colors`，不要复制一整份 root 文件。

浅色主题：

```js
{
  name: "new-color",
  base: "base-light.css",
  template: "root-stone.css",
  label: "...",
  description: "Morandi ...",
  colors: {
    accent: "oklch(...)",
    bg: "oklch(...)",
    surface: "oklch(...)",
    "surface-2": "oklch(...)",
    text: "oklch(...)",
    "text-semi": "oklch(...)",
    "code-token-keyword": "oklch(...)",
    "code-token-string": "oklch(...)",
    "code-token-number": "oklch(...)",
    "code-token-blue": "oklch(...)",
    "code-muted-rgb": "120, 125, 130"
  }
}
```

深色主题：

```js
{
  name: "new-color-dark",
  base: "base-dark.css",
  template: "root-stone-dark.css",
  label: "...",
  description: "Morandi ... Dark",
  colors: {
    accent: "oklch(...)",
    bg: "oklch(...)",
    surface: "oklch(...)",
    "surface-2": "oklch(...)",
    text: "oklch(...)",
    "text-semi": "oklch(...)",
    "code-bg": "oklch(...)",
    "code-token-keyword": "oklch(...)",
    "code-token-string": "oklch(...)",
    "code-token-number": "oklch(...)",
    "code-token-blue": "oklch(...)",
    "code-muted-rgb": "140, 135, 120"
  }
}
```

`accent-rgb` 和 `text-rgb` 由构建脚本从 OKLCH 自动生成，不要手写第二份。

## Required Variable Groups

所有主题输出必须包含同一套变量组：

- Spacing System
- Accent and Dynamic States
- Semantic Colors
- Neutrals
- Effects
- Typography
- Selection
- Code Layer
- Code Token Colors
- Typora variables
- RGB Helpers
- Icons

深色主题额外必须有 `--page-depth-1` 和 `--page-depth-2`。如果源文件没有写，构建脚本会补成 `var(--bg)`；如果要做 Mist 这种深色层次，就在源文件里显式写 OKLCH。

## Hard Rules

- `--bg-color` 和 `--text-color` 是 Typora 官方入口，必须保留。
- `--side-bar-bg-color` 默认使用 `var(--surface)`。
- 不再添加 `--title-bar-bg`、`--title-bar-text`、`--chrome-bg`、`--chrome-text`。
- 不再使用临时批量改色脚本改 root 文件。
- 修改颜色后必须运行：

```bash
npm run validate:themes
```

需要同步到 Typora 实机测试时再运行：

```bash
npm run sync:typora
```
