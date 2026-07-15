const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "theme-src");
const distDir = path.join(root, "dist");

const themes = require("./theme-list");
const { buildGeneratedVars, withTyporaRootVars } = require("./theme-vars");
const { compileThemeCss } = require("./color-compat");

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

// Variables adopted from the light sibling when printing a dark theme, so
// exported PDFs keep readable ink-on-paper colors (issues #7 / #20). Child
// rules like `#write h1 { color: var(--text) }` pick these up automatically.
const PRINT_PALETTE_VARS = [
  "accent",
  "accent-rgb",
  "accent-hover",
  "accent-active",
  "accent-soft",
  "success",
  "warning",
  "error",
  "info",
  "important",
  "bg",
  "surface",
  "surface-2",
  "text",
  "text-rgb",
  "text-semi",
  "muted",
  "border",
  "border-semi",
  "selection",
  "code-bg",
  "code-text",
  "code-ink",
  "code-token-keyword",
  "code-token-string",
  "code-token-number",
  "code-token-blue",
  "code-muted-rgb",
  "bg-color",
  "side-bar-bg-color",
  "item-hover-bg-color",
  "item-hover-text-color",
  "primary-color",
  "text-color",
  "select-text-bg-color",
];

function buildDarkPrintOverride(theme) {
  const light = themes.find((t) => t.name === theme.name.replace(/-dark$/, ""));
  if (!light) return "";

  const lightVars = withTyporaRootVars(
    buildGeneratedVars(light, srcDir) || readSrc(light.vars),
    false
  );
  const decls = [];
  PRINT_PALETTE_VARS.forEach((name) => {
    const match = lightVars.match(new RegExp(`--${name}:\\s*([^;]+);`));
    if (match) decls.push(`        --${name}: ${match[1].trim()};`);
  });
  // dark base tints headings with --ink-rgb (near-white); on paper it must
  // become the light theme's ink
  const lightTextRgb = lightVars.match(/--text-rgb:\s*([^;]+);/);
  if (lightTextRgb) decls.push(`        --ink-rgb: ${lightTextRgb[1].trim()};`);
  decls.push("        --page-depth-1: var(--bg);");
  decls.push("        --page-depth-2: var(--bg);");
  decls.push("        --shadow-sm: none;");
  decls.push("        --shadow: none;");
  decls.push("        --shadow-lg: none;");

  return [
    "",
    "/* Generated: print/PDF adopts the light sibling palette (issues #7 / #20). */",
    "@media print {",
    "    :root {",
    decls.join("\n"),
    "    }",
    "}",
    "",
  ].join("\n");
}

let updated = 0;

themes.forEach((theme) => {
  const isDark = theme.base.includes("dark");
  const vars = withTyporaRootVars(buildGeneratedVars(theme, srcDir) || readSrc(theme.vars), isDark).trimEnd();
  const base = readSrc(theme.base).trimStart();
  // compile the print override separately: its light-palette values must not
  // leak into var() resolution of the dark body above
  const printOverride = isDark ? compileThemeCss(buildDarkPrintOverride(theme)) : "";
  const output = compileThemeCss(`${vars}\n\n${base}\n`) + printOverride;
  const outPath = path.join(distDir, `bloom-${theme.name}.css`);
  if (writeIfChanged(outPath, output)) updated += 1;
});

console.log(updated ? `主题已更新：${updated} 个文件` : "主题已是最新");
