![banner](https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/blog/projects/typora-bloom-theme-banner/cs-token4ai-1784197429494387000.png)

<h1 align="center">Bloom for Typora</h1>

<p align="center">
  <img src="https://img.shields.io/github/v/release/webkubor/typora-Bloom-theme?style=flat-square&color=A873C4" alt="Release" />
  <img src="https://img.shields.io/github/license/webkubor/typora-Bloom-theme?style=flat-square&color=92a8b3" alt="License" />
  <img src="https://img.shields.io/github/stars/webkubor/typora-Bloom-theme?style=flat-square&color=cc584d" alt="Stars" />
  <a href="https://theme.typora.io/theme/Bloom/"><img src="https://img.shields.io/badge/Typora-Official%20Theme-5fa8b2?style=flat-square" alt="Listed on Typora official theme gallery" /></a>
  <a href="README.md"><img src="https://img.shields.io/badge/文档-简体中文-A873C4?style=flat-square" alt="Chinese Document" /></a>
</p>

<p align="center">
  A Typora theme collection made for long-form writing.
  <br />
  Calmer pages, clearer hierarchy, and a more consistent look for code and prose.
</p>

<p align="center">
  <a href="https://bloom.webkubor.online"><strong>Preview Site</strong></a> ·
  <a href="https://github.com/webkubor/typora-Bloom-theme/releases/latest"><strong>Download Latest</strong></a> ·
  <a href="https://github.com/webkubor/typora-Bloom-theme/issues/22"><strong>🗳️ Vote for palettes</strong></a>
</p>

## What Bloom Is

Bloom is a Typora theme set built around three goals:

- make long writing sessions easier on the eyes
- keep code fences, quotes, tables, alerts, and YAML frontmatter visually consistent
- preserve stable contrast and hierarchy across light and dark themes

The current release is `v1.3.5`.

## Why Bloom

| Feature | Description |
| :-- | :-- |
| 24-theme matrix | 12 light themes and 12 dark themes for different moods and writing environments. |
| OKLCH palette system | Uses a perceptual color model to keep lightness more stable across theme switches. |
| Unified module styling | Code fences, HTML blocks, YAML frontmatter, and alerts follow the same visual logic. |
| Tuned for Typora | Adjusted specifically for Markdown editing, reading flow, and dark-mode contrast. |

## Theme Matrix

12 palettes, each with a light and a dark (`-dark`) variant — 24 themes in total.

<table>
  <tr>
    <td align="center" width="50%">
      <img src="website/assets/screenshots/petal.png" alt="petal" />
      <sub><code>petal</code> · <code>petal-dark</code></sub>
    </td>
    <td align="center" width="50%">
      <img src="website/assets/screenshots/mist-dark.png" alt="mist-dark" />
      <sub><code>mist</code> · <code>mist-dark</code></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="website/assets/screenshots/verdant.png" alt="verdant" />
      <sub><code>verdant</code> · <code>verdant-dark</code></sub>
    </td>
    <td align="center" width="50%">
      <img src="website/assets/screenshots/stone-dark.png" alt="stone-dark" />
      <sub><code>stone</code> · <code>stone-dark</code></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="website/assets/screenshots/wheat.png" alt="wheat" />
      <sub><code>wheat</code> · <code>wheat-dark</code></sub>
    </td>
    <td align="center" width="50%">
      <img src="website/assets/screenshots/ink.png" alt="ink" />
      <sub><code>ink</code> · <code>ink-dark</code></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="website/assets/screenshots/amber-dark.png" alt="amber-dark" />
      <sub><code>amber</code> · <code>amber-dark</code></sub>
    </td>
    <td align="center" width="50%">
      <img src="website/assets/screenshots/lapis.png" alt="lapis" />
      <sub><code>lapis</code> · <code>lapis-dark</code></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="website/assets/screenshots/ripple-dark.png" alt="ripple-dark" />
      <sub><code>ripple</code> · <code>ripple-dark</code></sub>
    </td>
    <td align="center" width="50%">
      <img src="website/assets/screenshots/cinnabar.png" alt="cinnabar" />
      <sub><code>cinnabar</code> · <code>cinnabar-dark</code></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="website/assets/screenshots/sage-dark.png" alt="sage-dark" />
      <sub><code>sage</code> · <code>sage-dark</code></sub>
    </td>
    <td align="center" width="50%">
      <img src="website/assets/screenshots/spring.png" alt="spring" />
      <sub><code>spring</code> · <code>spring-dark</code></sub>
    </td>
  </tr>
</table>

## Quick Install

1. Download `Bloom-theme.zip` from [Releases](https://github.com/webkubor/typora-Bloom-theme/releases/latest).
2. In Typora, open `Preferences -> Appearance -> Open Theme Folder`.
3. Copy all `bloom-*.css` files and the `bloom/` directory into the Typora theme folder.
4. Restart Typora, or switch to a Bloom theme from the `Themes` menu.

## Latest Release Highlights

`v1.3.5` includes:

- New Wheat (light & dark) themes.
- Fixed dark-mode title bar, Quick Open list, and Source Mode contrast.
- Fixed table column resize UI glitch.
- Enhanced dev toolchain and unified release workflow.

See [CHANGELOG.md](CHANGELOG.md) for the full history.

<details>
<summary>Development and Build</summary>

### Local Development

```bash
pnpm install
npm run dev
```

`npm run dev` prepares a local browser preview through Typora's official toolkit flow: it fetches `typora/typora-theme-toolkit`, copies the selected theme CSS into `html-preview/theme/test.css`, and opens the toolkit HTML preview. To choose a theme:

```bash
npm run dev -- wheat-dark
```

### Common Commands

- `npm run build`: regenerate theme CSS files and website theme data
- `npm run dev`: preview locally through the official toolkit path for debugging and screenshots
- `npm run dev:site`: build and open the local website display page
- `npm run sync:typora`: build and sync theme CSS files plus `bloom/` assets to Typora's theme folder
- `npm run dev:typora`: watch theme sources, rebuild, and sync to Typora's theme folder
- `npm run validate:themes`: validate theme variables and generated color definitions against the `mist` / `wheat` standard
- `npm run package`: create `Bloom-theme.zip`

### Debug in Typora

Before the first run, open `Preferences -> Appearance -> Open Theme Folder` in Typora and make sure the theme folder exists. The default macOS path is:

```bash
~/Library/Application Support/abnerworks.Typora/themes
```

Then run:

```bash
npm run dev:typora
```

After changes under `theme-src/`, the script rebuilds and syncs the generated theme files into Typora's theme folder. If Typora does not refresh immediately, switch to another Bloom theme and back, or restart Typora. For selector-level debugging, enable Typora debug mode and inspect elements with DevTools.

### Official Toolkit Browser Preview

The browser preview is local-only for debugging and screenshots. It is not deployed as a public website page:

```bash
npm run dev -- petal
```

The script writes `dist/bloom-<theme>.css` to `.cache/typora-theme-toolkit/html-preview/theme/test.css` and copies the `bloom/` assets folder. This matches the test location recommended by Typora's official toolkit.

Generated themes such as `wheat` / `wheat-dark` use `scripts/theme-list.js` as the color entrypoint. The build derives theme CSS and website theme data from that single definition. Theme colors must follow [Theme Color Standard](docs/theme-color-standard.md).

### Repository Layout

- `theme-src/`: source styles, base layers, and theme-specific variables
- `dist/`: generated CSS files used by Typora
- `bloom/`: shared static assets such as bundled fonts
- `scripts/`: build, packaging, and site-data scripts
- `website/` and `_pages/`: public website assets

</details>

## License

[MIT](LICENSE)

## Author

[webkubor](https://github.com/webkubor)
