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
  return processed;
};

const copyAndProcessHtml = (src, dest) => {
  const content = fs.readFileSync(src, 'utf8');
  const processed = processHtml(content);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, processed);
};

copyAndProcessHtml(path.join(websiteDir, "index.html"), path.join(outDir, "index.html"));
copy(path.join(websiteDir, "site.css"), path.join(outDir, "site.css"));
copy(path.join(websiteDir, "site.js"), path.join(outDir, "site.js"));
copy(path.join(root, "netlify.toml"), path.join(outDir, "netlify.toml")); // netlify.toml stays in root

const distDir = path.join(root, "dist");
if (fs.existsSync(distDir)) {
  copyDir(distDir, path.join(outDir, "dist"));
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
