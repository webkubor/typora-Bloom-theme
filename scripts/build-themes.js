const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "theme-src");
const distDir = path.join(root, "dist");

const themes = require("./theme-list");
const { buildGeneratedVars, withTyporaRootVars } = require("./theme-vars");

function readSrc(file) {
  const filePath = path.join(srcDir, file);
  return fs.readFileSync(filePath, "utf8");
}

function writeIfChanged(filePath, content) {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
  if (existing === content) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return true;
}

let updated = 0;

themes.forEach((theme) => {
  const isDark = theme.base.includes("dark");
  const vars = withTyporaRootVars(buildGeneratedVars(theme, srcDir) || readSrc(theme.vars), isDark).trimEnd();
  const base = readSrc(theme.base).trimStart();
  const output = `${vars}\n\n${base}\n`;
  const outPath = path.join(distDir, `bloom-${theme.name}.css`);
  if (writeIfChanged(outPath, output)) updated += 1;
});

console.log(updated ? `主题已更新：${updated} 个文件` : "主题已是最新");
