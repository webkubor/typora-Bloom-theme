const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "theme-src");
const distDir = path.join(root, "dist");
const themes = require("./theme-list");
const { colorToPreview, themePreview } = require("./theme-vars");

const forbiddenPatterns = [
  "title-bar-bg",
  "title-bar-text",
  "chrome-bg",
  "chrome-text"
];

const outputVars = [
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
  "shadow-sm",
  "shadow",
  "shadow-lg",
  "font-sans",
  "font-mono",
  "selection",
  "code-bg",
  "code-text",
  "code-ink",
  "code-dot-red",
  "code-dot-yellow",
  "code-dot-green",
  "code-token-keyword",
  "code-token-string",
  "code-token-number",
  "code-token-blue",
  "code-muted-rgb",
  "bg-color",
  "side-bar-bg-color",
  "item-hover-bg-color",
  "item-hover-text-color",
  "window-border",
  "primary-color",
  "text-color",
  "select-text-bg-color",
  "white-rgb",
  "black-rgb",
  "icon-document",
  "icon-folder"
];

const darkOutputVars = [
  "page-depth-1",
  "page-depth-2",
  "ink-rgb"
];

const generatedLightColorKeys = [
  "accent",
  "bg",
  "surface",
  "surface-2",
  "text",
  "text-semi",
  "code-token-keyword",
  "code-token-string",
  "code-token-number",
  "code-token-blue",
  "code-muted-rgb"
];

const generatedDarkColorKeys = [
  ...generatedLightColorKeys,
  "code-bg"
];

function hasCssVar(content, name) {
  return new RegExp(`--${name}:\\s*[^;]+;`).test(content);
}

function readCssVar(content, name) {
  const match = content.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return match ? match[1].trim() : null;
}

function report(errors, file, message) {
  errors.push(`${file}: ${message}`);
}

function validateThemeList(errors) {
  const names = new Set();
  themes.forEach((theme) => {
    if (names.has(theme.name)) {
      report(errors, "scripts/theme-list.js", `duplicate theme name ${theme.name}`);
    }
    names.add(theme.name);

    if (!theme.base || (!theme.vars && !theme.template)) {
      report(errors, "scripts/theme-list.js", `${theme.name} must define base and vars/template`);
    }

    if (theme.template) {
      if (!theme.description) {
        report(errors, "scripts/theme-list.js", `${theme.name} template theme must define description`);
      }

      const keys = Object.keys(theme.colors || {});
      const required = theme.base.includes("dark") ? generatedDarkColorKeys : generatedLightColorKeys;
      required.forEach((key) => {
        if (!keys.includes(key)) {
          report(errors, "scripts/theme-list.js", `${theme.name}.colors missing ${key}`);
        }
      });
    }
  });
}

function validateCssFile(errors, filePath, requiredVars, options = {}) {
  const content = fs.readFileSync(filePath, "utf8");
  const relative = path.relative(root, filePath);
  const seen = new Set();
  const duplicates = new Set();

  forbiddenPatterns.forEach((pattern) => {
    if (content.includes(pattern)) {
      report(errors, relative, `forbidden legacy variable or selector fragment ${pattern}`);
    }
  });

  if (options.checkDuplicates) {
    Array.from(content.matchAll(/--([\w-]+):\s*[^;]+;/g)).forEach((match) => {
      const name = match[1];
      if (seen.has(name)) duplicates.add(name);
      seen.add(name);
    });
    duplicates.forEach((name) => {
      report(errors, relative, `duplicate --${name}`);
    });
  }

  requiredVars.forEach((name) => {
    if (!hasCssVar(content, name)) {
      report(errors, relative, `missing --${name}`);
    }
  });
}

function validateSources(errors) {
  fs.readdirSync(srcDir)
    .filter((file) => /^root-.+\.css$/.test(file))
    .forEach((file) => {
      validateCssFile(errors, path.join(srcDir, file), outputVars, { checkDuplicates: true });
    });
}

function validateDist(errors) {
  themes.forEach((theme) => {
    const distPath = path.join(distDir, `bloom-${theme.name}.css`);
    if (!fs.existsSync(distPath)) {
      report(errors, path.relative(root, distPath), "missing generated dist file; run npm run build");
      return;
    }

    const required = theme.base.includes("dark")
      ? [...outputVars, ...darkOutputVars]
      : outputVars;
    validateCssFile(errors, distPath, required);

    const content = fs.readFileSync(distPath, "utf8");
    const expected = themePreview(theme, srcDir);
    const actual = {
      accent: colorToPreview(readCssVar(content, "accent")),
      bg: readCssVar(content, "bg-color"),
      text: readCssVar(content, "text-color")
    };

    ["accent", "bg", "text"].forEach((key) => {
      if (String(expected[key]).toLowerCase() !== String(actual[key]).toLowerCase()) {
        report(errors, "scripts/theme-list.js", `${theme.name}.${key} metadata drift: expected ${expected[key]}, got ${actual[key]}`);
      }
    });
  });
}

/* --- WCAG contrast enforcement ---
   Every ink-vs-paper pair must stay above these floors (all 24 themes
   currently clear them with margin — this locks the floor in CI so the
   ink-rgb/mermaid/export class of low-contrast regressions can't return). */
const CONTRAST_FLOORS = [
  { fg: "text", bgVar: "bg", min: 7 },        // AAA body text
  { fg: "text-semi", bgVar: "bg", min: 4.5 }, // AA secondary text
  { fg: "muted", bgVar: "bg", min: 3 },       // AA large/tertiary
  { fg: "code-text", bgVar: "code-bg", min: 4.5 },
  // accent 是链接色（`#write a { color: var(--accent) }`）——正文里唯一会被点击的东西，
  // 却一直不在这份清单里。2026-08-19 审计发现 16 套浅色主题中有 4 套低于 AA
  // （petal 3.55 / sage 3.27 / spring 3.11 / ripple 3.02），而上面几项文字对比度
  // 全部宽裕达标。缺口恰好落在护栏没覆盖的那一格。
  { fg: "accent", bgVar: "bg", min: 4.5 },
];

function parseColorForContrast(value, backdrop) {
  if (!value) return null;
  const str = value.trim();
  let m = str.match(/^#([0-9a-f]{6})$/i);
  if (m) return [1, 3, 5].map((i) => parseInt(m[1].slice(i - 1, i + 1), 16));
  m = str.match(/^rgba?\(([\d\s,.]+)\)$/);
  if (m) {
    const [r, g, b, a] = m[1].split(",").map(Number);
    if (a != null && a < 1 && backdrop) {
      return [r, g, b].map((v, i) => Math.round(v * a + backdrop[i] * (1 - a)));
    }
    return [r, g, b];
  }
  return null;
}

function contrastRatio(a, b) {
  const luminance = ([r, g, bl]) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function validateContrast(errors) {
  themes.forEach((theme) => {
    const distPath = path.join(distDir, `bloom-${theme.name}.css`);
    if (!fs.existsSync(distPath)) return;
    const content = fs.readFileSync(distPath, "utf8");
    // only the main :root block — print overrides redeclare vars later
    const mediaIndex = content.indexOf("@media");
    const head = mediaIndex > 0 ? content.slice(0, mediaIndex) : content;

    const resolveVar = (name, backdrop, depth = 0) => {
      if (depth > 4) return null;
      const raw = readCssVar(head, name);
      if (!raw) return null;
      const alias = raw.match(/^var\(--([\w-]+)\)$/);
      if (alias) return resolveVar(alias[1], backdrop, depth + 1);
      return parseColorForContrast(raw, backdrop);
    };

    const bg = resolveVar("bg");
    if (!bg) {
      report(errors, `dist/bloom-${theme.name}.css`, "cannot parse --bg for contrast check");
      return;
    }

    CONTRAST_FLOORS.forEach(({ fg, bgVar, min }) => {
      const backdrop = bgVar === "bg" ? bg : resolveVar(bgVar, bg) || bg;
      const ink = resolveVar(fg, backdrop);
      if (!ink) {
        report(errors, `dist/bloom-${theme.name}.css`, `cannot parse --${fg} for contrast check`);
        return;
      }
      const ratio = contrastRatio(ink, backdrop);
      if (ratio < min) {
        report(
          errors,
          `dist/bloom-${theme.name}.css`,
          `contrast --${fg} vs --${bgVar} is ${ratio.toFixed(2)}, below WCAG floor ${min}`
        );
      }
    });
  });
}

const errors = [];
validateThemeList(errors);
validateSources(errors);
validateDist(errors);
validateContrast(errors);

if (errors.length > 0) {
  console.error("Theme standard validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Theme standard validation passed.");
