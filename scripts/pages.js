const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "_pages");

const copy = (src, dest) => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
};

const copyDir = (srcDir, destDir) => {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copy(srcPath, destPath);
    }
  }
};

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

const websiteDir = path.join(root, "website");

const themes = require('./theme-list');
const defaultTheme = themes.find(t => t.default) || themes[0];

const processHtml = (html) => {
  let processed = html;
  // Replace CSS link
  processed = processed.replace(
    /<link id="theme-css" rel="stylesheet" href="[^"]+" \/>/,
    `<link id="theme-css" rel="stylesheet" href="dist/bloom-${defaultTheme.name}.css" />`
  );
  // Replace Theme Name Display
  processed = processed.replace(
    /<span id="current-theme-name">[^<]+<\/span>/,
    `<span id="current-theme-name">${defaultTheme.label}</span>`
  );
  // Keep structured-data version in sync with package.json
  const { version } = require(path.join(root, "package.json"));
  processed = processed.replace(
    /"softwareVersion":\s*"[^"]+"/,
    `"softwareVersion": "${version}"`
  );
  return processed;
};

const copyAndProcessHtml = (src, dest) => {
  const content = fs.readFileSync(src, 'utf8');
  const processed = processHtml(content);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, processed);
};

copyAndProcessHtml(path.join(websiteDir, "index.html"), path.join(outDir, "index.html"));
// 可索引内容页：单页站只把内容塞进一个 URL，爬虫无法建立索引结构，
// 用户搜到具体问题时也落不到对应页面。这些页各自是真实 URL，能被单独收录。
for (const page of ["install.html", "palettes.html"]) {
  copyAndProcessHtml(path.join(websiteDir, page), path.join(outDir, page));
}
copy(path.join(websiteDir, "site.css"), path.join(outDir, "site.css"));
copy(path.join(websiteDir, "site.js"), path.join(outDir, "site.js"));
for (const file of ["robots.txt", "sitemap.xml", "llms.txt", "humans.txt"]) {
  copy(path.join(websiteDir, file), path.join(outDir, file));
}

const distDir = path.join(root, "dist");
if (fs.existsSync(distDir)) {
  const siteDist = path.join(outDir, "dist");
  copyDir(distDir, siteDist);
  // Site CSS lives in /dist/, while its resources live in /bloom/.
  // Rewrite only the website copy; release CSS keeps its original relative paths.
  for (const name of fs.readdirSync(siteDist)) {
    if (!/^bloom-.*\.css$/.test(name)) continue;
    const file = path.join(siteDist, name);
    const css = fs.readFileSync(file, "utf8");
    fs.writeFileSync(file, css.replace(/url\((["'])\.\/bloom\//g, "url($1../bloom/"));
  }
}

const assetsDir = path.join(root, "bloom");
if (fs.existsSync(assetsDir)) {
  copyDir(assetsDir, path.join(outDir, "bloom"));
}

// Fix: Copy assets directory (images, scripts, etc.)
const staticAssetsDir = path.join(websiteDir, "assets");
if (fs.existsSync(staticAssetsDir)) {
  copyDir(staticAssetsDir, path.join(outDir, "assets"));
}

const screenshotsDir = path.join(root, "screenshots");
if (fs.existsSync(screenshotsDir)) {
  copyDir(screenshotsDir, path.join(outDir, "screenshots"));
}

console.log("已生成 _pages 目录");
