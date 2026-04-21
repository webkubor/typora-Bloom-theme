# Bloom for Typora

<p align="center">
  <img src="website/assets/banner.png" alt="Bloom Banner" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/v/release/webkubor/typora-Bloom-theme?style=flat-square&color=A873C4" alt="Release" />
  <img src="https://img.shields.io/github/license/webkubor/typora-Bloom-theme?style=flat-square&color=92a8b3" alt="License" />
  <img src="https://img.shields.io/github/stars/webkubor/typora-Bloom-theme?style=flat-square&color=cc584d" alt="Stars" />
  <img src="https://img.shields.io/badge/Typora-Compatible-5fa8b2?style=flat-square" alt="Typora" />
  <a href="README.md"><img src="https://img.shields.io/badge/文档-简体中文-A873C4?style=flat-square" alt="Chinese Document" /></a>
</p>

<p align="center">
  A Typora theme collection made for long-form writing.
  <br />
  Calmer pages, clearer hierarchy, and a more consistent look for code and prose.
</p>

<p align="center">
  <a href="https://typora-bloom-theme.webkubor.online"><strong>Preview Site</strong></a> ·
  <a href="https://typora-bloom-theme.webkubor.online/showcase.html"><strong>Live Showcase</strong></a> ·
  <a href="https://github.com/webkubor/typora-Bloom-theme/releases/latest"><strong>Download Latest</strong></a>
</p>

## What Bloom Is

Bloom is a Typora theme set built around three goals:

- make long writing sessions easier on the eyes
- keep code fences, quotes, tables, alerts, and YAML frontmatter visually consistent
- preserve stable contrast and hierarchy across light and dark themes

The current release is `v1.3.4`.

## Why Bloom

| Feature | Description |
| :-- | :-- |
| 16-theme matrix | 8 light themes and 8 dark themes for different moods and writing environments. |
| OKLCH palette system | Uses a perceptual color model to keep lightness more stable across theme switches. |
| Unified module styling | Code fences, HTML blocks, YAML frontmatter, and alerts follow the same visual logic. |
| Tuned for Typora | Adjusted specifically for Markdown editing, reading flow, and dark-mode contrast. |

## Theme Matrix

| Light Themes | Dark Themes |
| :-- | :-- |
| `petal` | `petal-dark` |
| `mist` | `mist-dark` |
| `verdant` | `verdant-dark` |
| `stone` | `stone-dark` |
| `ripple` | `ripple-dark` |
| `cinnabar` | `cinnabar-dark` |
| `sage` | `sage-dark` |
| `spring` | `spring-dark` |

## Quick Install

1. Download `Bloom-theme.zip` from [Releases](https://github.com/webkubor/typora-Bloom-theme/releases/latest).
2. In Typora, open `Preferences -> Appearance -> Open Theme Folder`.
3. Copy all `bloom-*.css` files and the `bloom/` directory into the Typora theme folder.
4. Restart Typora, or switch to a Bloom theme from the `Themes` menu.

## Latest Release Highlights

`v1.3.4` includes:

- a unified visual language for code fences, HTML blocks, and YAML frontmatter
- native support for GitHub-style alert syntax
- fixes for Mermaid readability and local contrast issues in dark themes

<details>
<summary>Development and Build</summary>

### Local Development

```bash
pnpm install
npm run dev
```

### Common Commands

- `npm run build`: regenerate theme CSS files and website theme data
- `npm run package`: create `Bloom-theme.zip`
- `npm run release`: run the package, commit, push, and tag workflow

### Repository Layout

- `theme-src/`: source styles, base layers, and theme-specific variables
- `dist/`: generated CSS files used by Typora
- `bloom/`: shared static assets such as bundled fonts
- `scripts/`: build, packaging, release, and site-data scripts
- `website/` and `_pages/`: showcase site assets
- `demo/`: preview-related resources

</details>

## License

[MIT](LICENSE)

## Author

[webkubor](https://github.com/webkubor)
