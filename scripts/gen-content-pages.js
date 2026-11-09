/**
 * 生成官网的可索引内容页：install 与 palettes。
 *
 * 为什么要单独生成而不是手写：手写的安装说明和配色数会跟发布包脱节。
 * 2026-11-09 实测：官网把浅色文件名写成 `bloom-*-light.css`，而 v1.7.2
 * 发布包里根本没有这个命名（实际是 `bloom-petal.css` / `bloom-petal-dark.css`），
 * 用户照着做就会找不到文件。
 *
 * 所以这里的事实全部来自仓库里的真实来源：
 *   - 文件名与数量 → dist/ 里实际构建出的 bloom-*.css
 *   - 取色 → theme-src/root-*.css 的真实变量
 *   - 主题名 → scripts/theme-list.js
 * 手写只剩「怎么讲」这部分文案。
 */
const fs = require('fs');
const path = require('path');
const themes = require('./theme-list');
const { themePreview } = require('./theme-vars');

const root = path.resolve(__dirname, '..');
const websiteDir = path.join(root, 'website');
const distDir = path.join(root, 'dist');
const srcDir = path.join(root, 'theme-src');
const { homepage } = require(path.join(root, 'package.json'));
// homepage 结尾可能没有斜杠，拼 URL 时统一补上，避免出现 https://hostpage.html
const SITE = `${homepage.replace(/\/$/, '')}/`;

/** 发布包里实际存在的 CSS 文件名（排序稳定） */
function builtStylesheets() {
  if (!fs.existsSync(distDir)) return [];
  return fs.readdirSync(distDir)
    .filter((name) => /^bloom-.*\.css$/.test(name))
    .sort();
}

/** 主题名 → 中文标签（去掉 emoji） */
function plainLabel(label) {
  return String(label).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\s]+/gu, '').trim();
}

/** 按色系分组：去掉 -dark 后缀即为色系键 */
function paletteGroups() {
  const groups = new Map();
  for (const theme of themes) {
    const key = theme.name.endsWith('-dark') ? theme.name.replace(/-dark$/, '') : theme.name;
    if (!groups.has(key)) groups.set(key, { key, light: null, dark: null });
    if (theme.name.endsWith('-dark')) groups.get(key).dark = theme;
    else groups.get(key).light = theme;
  }
  return [...groups.values()];
}

function esc(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function pageShell({ title, description, keywords, canonical, body }) {
  return `<!doctype html>
<html lang="zh-CN">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="keywords" content="${esc(keywords)}" />
  <meta name="author" content="webkubor" />

  <meta property="og:type" content="article" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(SITE)}assets/banner.png" />

  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="${esc(title)}" />
  <meta property="twitter:description" content="${esc(description)}" />
  <meta property="twitter:image" content="${esc(SITE)}assets/banner.png" />

  <link rel="canonical" href="${esc(canonical)}" />
  <link rel="stylesheet" href="site.css" />
</head>

<body>
  <main class="doc-main">
    <article class="doc-article">
${body}
    </article>
  </main>
</body>

</html>
`;
}

function installPage() {
  const sheets = builtStylesheets();
  const light = sheets.filter((name) => !name.endsWith('-dark.css'));
  const dark = sheets.filter((name) => name.endsWith('-dark.css'));
  const sample = light[0] || 'bloom-petal.css';
  const sampleDark = dark[0] || 'bloom-petal-dark.css';

  const body = `      <nav class="doc-breadcrumb"><a href="${esc(SITE)}">Bloom</a> / 安装指南</nav>
      <h1>如何安装 Bloom Typora 主题</h1>
      <p class="doc-lead">
        Bloom 是给 Typora 的 ${light.length} 浅色 + ${dark.length} 深色莫兰迪主题。把主题文件放进
        Typora 的主题文件夹，重启后就能在「主题」菜单里切换。下面是完整步骤和各系统的文件夹位置。
      </p>

      <h2>方式一：从 GitHub Releases 下载（推荐）</h2>
      <ol>
        <li>打开 <a href="https://github.com/webkubor/typora-Bloom-theme/releases/latest" target="_blank" rel="noopener">Releases 页面</a>，下载最新的 <code>Bloom-theme.zip</code>。</li>
        <li>解压后你会看到 ${sheets.length} 个 <code>bloom-*.css</code> 文件和一个 <code>bloom/</code> 文件夹（字体等资源）。</li>
        <li>把 <strong>这些文件和文件夹一起</strong>复制进 Typora 的主题文件夹。</li>
        <li>重启 Typora，在「主题」菜单里选择 Bloom 系列，例如 <strong>${esc(plainLabel(themes.find((t) => t.default)?.label || 'Bloom Petal'))}</strong>。</li>
      </ol>
      <p class="doc-note">
        注意：字体在 <code>bloom/</code> 文件夹里。只复制 CSS 而不复制这个文件夹，字体不会生效。
      </p>

      <h2>方式二：从源码目录手动复制</h2>
      <ol>
        <li>打开 Typora，进入「偏好设置 → 外观 → 打开主题文件夹」。</li>
        <li>把 <code>bloom-*.css</code>（例如 <code>${esc(sample)}</code>、<code>${esc(sampleDark)}</code>）和 <code>bloom/</code> 文件夹复制进该目录。</li>
        <li>重启 Typora，在「主题」菜单中选择 Bloom 系列。</li>
      </ol>

      <h2>发布包里有哪些文件</h2>
      <p>${sheets.length} 个主题 CSS，每个色系一个浅色和一个深色：</p>
      <ul class="doc-filelist">
${sheets.map((name) => `        <li><code>${esc(name)}</code></li>`).join('\n')}
      </ul>

      <h2>主题文件夹在哪</h2>
      <p>不同系统位置不同，但都可以通过上面的「打开主题文件夹」直达：</p>
      <ul>
        <li><strong>macOS</strong>：<code>~/Library/Application Support/Typora/themes/</code></li>
        <li><strong>Windows</strong>：<code>%APPDATA%\\Typora\\themes\\</code></li>
        <li><strong>Linux</strong>：<code>~/.config/Typora/themes/</code></li>
      </ul>

      <h2>常见问题</h2>
      <h3>装完了，主题菜单里还是看不到 Bloom？</h3>
      <ul>
        <li>确认复制的是 <code>.css</code> 文件本身，而不是多套了一层文件夹。主题文件夹里应当直接是 <code>${esc(sample)}</code> 这样的文件。</li>
        <li>确认文件名没有被改过。有些系统解压后中文名会变成别的样子。</li>
        <li>复制完成后<strong>重启 Typora</strong>，主题菜单不会自动刷新。</li>
      </ul>
      <h3>主题出现了，但字体没变？</h3>
      <p>
        字体文件在 <code>bloom/</code> 目录里，需要和 CSS 一起复制。确认主题文件夹下确实存在
        <code>bloom/fonts/</code>。
      </p>

      <h2>还想了解</h2>
      <ul>
        <li><a href="${esc(SITE)}palettes">24 套配色分别是什么样 →</a></li>
        <li><a href="https://github.com/webkubor/typora-Bloom-theme">源码、主题定制与问题反馈 →</a></li>
        <li><a href="${esc(SITE)}">返回 Bloom 首页 →</a></li>
      </ul>`;

  return pageShell({
    title: '如何安装 Bloom Typora 主题（完整步骤）· Bloom for Typora',
    description: `Bloom Typora 主题安装指南：Windows、macOS、Linux 三步装好，含主题文件夹路径、Releases 下载方式、常见问题排查（装了不生效、找不到主题菜单）。`,
    keywords: 'Bloom 安装, Typora 主题安装, Typora 主题文件夹路径, Typora 主题不生效, bloom-petal.css',
    canonical: `${SITE}install`,
    body,
  });
}

function palettesPage() {
  const groups = paletteGroups();
  const cards = groups.map((group) => {
    const light = group.light;
    const dark = group.dark;
    const lightPreview = light ? themePreview(light, srcDir) : null;
    const darkPreview = dark ? themePreview(dark, srcDir) : null;
    const lightCell = lightPreview
      ? `        <div class="palette-swatches">
          <div class="swatch" title="${esc(plainLabel(light.label))}（浅色）" style="background:${lightPreview.bg}">
            <i style="background:${lightPreview.accent}"></i><small style="color:${lightPreview.text}">浅</small>
          </div>
          <div class="swatch" title="${esc(plainLabel(dark ? dark.label : light.label))}（深色）" style="background:${darkPreview.bg}">
            <i style="background:${darkPreview.accent}"></i><small style="color:${darkPreview.text}">暗</small>
          </div>
        </div>
        <div class="palette-meta">
          <span class="palette-name">${esc(plainLabel(light.label))}</span>
          <code class="palette-file">bloom-${esc(light.name)}.css</code>
          <code class="palette-file">bloom-${esc(dark ? dark.name : light.name)}.css</code>
        </div>`
      : `        <div class="palette-swatches"><div class="swatch"></div></div>
        <div class="palette-meta"><span class="palette-name">${esc(plainLabel(light ? light.label : group.key))}</span></div>`;
    return `      <article class="palette-card" data-palette="${esc(group.key)}">
${lightCell}
      </article>`;
  }).join('\n');

  const body = `      <nav class="doc-breadcrumb"><a href="${esc(SITE)}">Bloom</a> / 配色一览</nav>
      <h1>Bloom 的 ${groups.length} 组配色</h1>
      <p class="doc-lead">
        Bloom 共 ${groups.length} 组色系，每组都有浅色和深色两套，共 ${groups.length * 2} 个主题文件。
        下面的色块取自实际构建出的主题变量，不是示意图。
      </p>
      <div class="palette-grid" id="palette-grid-static">
${cards}
      </div>
      <h2>怎么选</h2>
      <p>
        白天长时间阅读建议用浅色，夜里写作用深色；两套的排版比例完全一致，切换只是换光感。
        想要逐个看真实排版效果，可以到 <a href="${esc(SITE)}">Bloom 首页</a> 切换预览。
      </p>
      <h2>还想了解</h2>
      <ul>
        <li><a href="${esc(SITE)}install">安装步骤与主题文件夹位置 →</a></li>
        <li><a href="https://github.com/webkubor/typora-Bloom-theme">源码、主题定制与问题反馈 →</a></li>
        <li><a href="${esc(SITE)}">返回 Bloom 首页 →</a></li>
      </ul>`;

  return pageShell({
    title: `Bloom 的 ${groups.length} 组配色（${groups.length * 2} 套主题）· Bloom for Typora`,
    description: `Bloom Typora 主题的全部 ${groups.length * 2} 套莫兰迪配色一览，每组含浅色与深色两套，颜色取自实际构建出的主题变量。`,
    keywords: 'Bloom 配色, Typora 主题配色, 莫兰迪配色, Typora 深色主题, bloom-petal',
    canonical: `${SITE}palettes`,
    body,
  });
}

fs.writeFileSync(path.join(websiteDir, 'install.html'), installPage());
fs.writeFileSync(path.join(websiteDir, 'palettes.html'), palettesPage());
console.log('已生成 website/install.html 与 website/palettes.html');
