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

copy(path.join(root, "index.html"), path.join(outDir, "index.html"));
copy(path.join(root, "netlify.toml"), path.join(outDir, "netlify.toml"));

const distDir = path.join(root, "dist");
if (fs.existsSync(distDir)) {
  copyDir(distDir, path.join(outDir, "dist"));
}

const assetsDir = path.join(root, "typora-bloom-theme");
if (fs.existsSync(assetsDir)) {
  copyDir(assetsDir, path.join(outDir, "typora-bloom-theme"));
}

console.log("已生成 _pages 目录");
