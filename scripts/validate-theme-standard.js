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

const errors = [];
validateThemeList(errors);
validateSources(errors);
validateDist(errors);

if (errors.length > 0) {
  console.error("Theme standard validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Theme standard validation passed.");
