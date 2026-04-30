const fs = require("fs");
const path = require("path");

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function oklchToRgb(value) {
  const match = String(value).match(/oklch\(\s*([0-9.]+)%\s+([0-9.]+)\s+([0-9.]+)/i);
  if (!match) return null;

  const l = Number(match[1]) / 100;
  const c = Number(match[2]);
  const h = (Number(match[3]) * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = l - 0.0894841775 * a - 1.291485548 * b;

  const lCube = lPrime ** 3;
  const mCube = mPrime ** 3;
  const sCube = sPrime ** 3;

  const linear = [
    4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube,
    -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube,
    -0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube
  ];

  return linear.map((channel) => {
    const clamped = Math.max(0, Math.min(1, channel));
    const srgb = clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * (clamped ** (1 / 2.4)) - 0.055;
    return clampByte(srgb * 255);
  });
}

function rgbToHex(rgb) {
  return `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function colorToPreview(value) {
  if (!value) return null;
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  const rgb = oklchToRgb(value);
  return rgb ? rgbToHex(rgb) : value;
}

function readCssVar(content, name) {
  const match = content.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return match ? match[1].trim() : null;
}

function replaceVar(content, name, value) {
  const pattern = new RegExp(`(--${name}:\\s*)[^;]+;`);
  if (!pattern.test(content)) {
    throw new Error(`Missing CSS variable --${name}`);
  }
  return content.replace(pattern, `$1${value};`);
}

function setOrInsertVar(content, name, value, afterName = "text") {
  const pattern = new RegExp(`(--${name}:\\s*)[^;]+;`);
  if (pattern.test(content)) {
    return content.replace(pattern, `$1${value};`);
  }

  const afterPattern = new RegExp(`(--${afterName}:\\s*[^;]+;)`);
  if (afterPattern.test(content)) {
    return content.replace(afterPattern, `$1\n    --${name}: ${value};`);
  }

  return content.replace(/(:root\s*\{)/, `$1\n    --${name}: ${value};`);
}

function insertVarIfMissing(content, name, value, afterName = "text") {
  const pattern = new RegExp(`--${name}:\\s*[^;]+;`);
  if (pattern.test(content)) return content;
  return setOrInsertVar(content, name, value, afterName);
}

function withTyporaRootVars(content, isDark = false) {
  const bg = colorToPreview(readCssVar(content, "bg"));
  const text = colorToPreview(readCssVar(content, "text"));
  if (!bg || !text) return content;

  let next = content;
  if (isDark) {
    next = insertVarIfMissing(next, "page-depth-1", "var(--bg)", "bg");
    next = insertVarIfMissing(next, "page-depth-2", "var(--bg)", "page-depth-1");
  }
  next = setOrInsertVar(next, "bg-color", bg, "bg");
  next = setOrInsertVar(next, "text-color", text, "text");
  return next;
}

function themePreview(theme, srcDir) {
  if (srcDir) {
    const content = buildGeneratedVars(theme, srcDir) || fs.readFileSync(path.join(srcDir, theme.vars), "utf8");
    return {
      accent: colorToPreview(readCssVar(content, "accent")),
      bg: colorToPreview(readCssVar(content, "bg")),
      text: colorToPreview(readCssVar(content, "text"))
    };
  }

  if (!theme.colors) {
    return {
      accent: theme.accent,
      bg: theme.bg,
      text: theme.text
    };
  }

  return {
    accent: colorToPreview(theme.colors.accent),
    bg: colorToPreview(theme.colors.bg),
    text: colorToPreview(theme.colors.text)
  };
}

function buildGeneratedVars(theme, srcDir) {
  if (!theme.template || !theme.colors) return null;

  const templatePath = path.join(srcDir, theme.template);
  let content = fs.readFileSync(templatePath, "utf8");
  content = content.replace(/\/\* --- Morandi [\s\S]*? --- \*\//, `/* --- ${theme.description} --- */`);

  const colors = { ...theme.colors };
  if (colors.accent && !colors["accent-rgb"]) {
    const rgb = oklchToRgb(colors.accent);
    if (rgb) colors["accent-rgb"] = rgb.join(", ");
  }
  if (colors.text && !colors["text-rgb"]) {
    const rgb = oklchToRgb(colors.text);
    if (rgb) colors["text-rgb"] = rgb.join(", ");
  }

  Object.entries(colors).forEach(([name, value]) => {
    content = replaceVar(content, name, value);
  });

  return content;
}

module.exports = {
  buildGeneratedVars,
  colorToPreview,
  themePreview,
  withTyporaRootVars
};
