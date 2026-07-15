/**
 * Build-time color compiler.
 *
 * Typora bundles old Chromium builds (and exported HTML may be opened in
 * legacy browser cores) that cannot parse `oklch()` / `color-mix()`. When a
 * custom property resolves to an unparsable color, every `var()` consumer is
 * invalidated — the classic "black background inheriting the previous theme"
 * failure (issues #10 / #18) and unreadable exports (#15 / #20).
 *
 * Source files keep OKLCH as the authoring format; this module compiles every
 * `oklch()` and `color-mix()` occurrence in the final CSS to static sRGB
 * (`#hex` / `rgba()`), which parses everywhere back to Typora 1.0.
 */

const EPS = 1e-4;

/* --- sRGB <-> OKLab --- */

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

function rgbToOklab({ r, g, b }) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function oklabToRgb({ L, a, b }) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return {
    r: linearToSrgb(Math.max(0, Math.min(1, lr))),
    g: linearToSrgb(Math.max(0, Math.min(1, lg))),
    b: linearToSrgb(Math.max(0, Math.min(1, lb))),
  };
}

function rgbaToLch(rgba) {
  const { L, a, b } = rgbToOklab(rgba);
  const c = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, c, h, alpha: rgba.a };
}

function lchToRgba({ L, c, h, alpha }) {
  const rad = (h * Math.PI) / 180;
  const rgb = oklabToRgb({ L, a: c * Math.cos(rad), b: c * Math.sin(rad) });
  return { ...rgb, a: alpha };
}

/* --- parsing --- */

function parseAlphaToken(token) {
  if (token == null) return 1;
  const t = token.trim();
  if (t.endsWith("%")) return parseFloat(t) / 100;
  return parseFloat(t);
}

// -> { r,g,b (0..1), a (0..1), lch? } or null when not a static color
function parseColor(input) {
  const str = String(input).trim();

  if (/^transparent$/i.test(str)) return { r: 0, g: 0, b: 0, a: 0 };
  if (/^black$/i.test(str)) return { r: 0, g: 0, b: 0, a: 1 };
  if (/^white$/i.test(str)) return { r: 1, g: 1, b: 1, a: 1 };

  let m = str.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (m) {
    let hex = m[1];
    if (hex.length === 3) hex = hex.replace(/./g, (ch) => ch + ch);
    const int = (offset) => parseInt(hex.slice(offset, offset + 2), 16);
    return {
      r: int(0) / 255,
      g: int(2) / 255,
      b: int(4) / 255,
      a: hex.length === 8 ? int(6) / 255 : 1,
    };
  }

  m = str.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+%?)\s*)?\)$/i);
  if (m) {
    return {
      r: Number(m[1]) / 255,
      g: Number(m[2]) / 255,
      b: Number(m[3]) / 255,
      a: parseAlphaToken(m[4]),
    };
  }

  m = str.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+%?)\s*)?\)$/i);
  if (m) {
    const L = m[2] ? Number(m[1]) / 100 : Number(m[1]);
    const lch = { L, c: Number(m[3]), h: Number(m[4]), alpha: parseAlphaToken(m[5]) };
    return { ...lchToRgba(lch), lch };
  }

  return null;
}

/* --- formatting --- */

function formatColor({ r, g, b, a }) {
  const bytes = [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c * 255))));
  if (a >= 1 - EPS) {
    return `#${bytes.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  }
  const alpha = Math.round(Math.max(0, Math.min(1, a)) * 1000) / 1000;
  return `rgba(${bytes.join(", ")}, ${alpha})`;
}

/* --- color-mix --- */

function interpolateHue(h1, h2, w1, w2) {
  // shorter-path hue interpolation
  let delta = ((h2 - h1) % 360 + 540) % 360 - 180;
  return (h1 + delta * (w2 / (w1 + w2)) + 360) % 360;
}

function mixInOklch(c1, w1, c2, w2) {
  const a1 = rgbaToLch(c1);
  const a2 = rgbaToLch(c2);
  // prefer authored oklch components to avoid round-trip drift
  if (c1.lch) Object.assign(a1, c1.lch, { alpha: c1.a });
  if (c2.lch) Object.assign(a2, c2.lch, { alpha: c2.a });

  const alpha = w1 * a1.alpha + w2 * a2.alpha;
  if (alpha < EPS) return { r: 0, g: 0, b: 0, a: 0 };

  const p1 = (w1 * a1.alpha) / alpha;
  const p2 = (w2 * a2.alpha) / alpha;

  // hue is powerless for achromatic or fully transparent endpoints
  const h1Missing = a1.c < EPS || a1.alpha < EPS;
  const h2Missing = a2.c < EPS || a2.alpha < EPS;
  let h;
  if (h1Missing && h2Missing) h = 0;
  else if (h1Missing) h = a2.h;
  else if (h2Missing) h = a1.h;
  else h = interpolateHue(a1.h, a2.h, p1, p2);

  return lchToRgba({
    L: p1 * a1.L + p2 * a2.L,
    c: p1 * a1.c + p2 * a2.c,
    h,
    alpha,
  });
}

function mixInSrgb(c1, w1, c2, w2) {
  const alpha = w1 * c1.a + w2 * c2.a;
  if (alpha < EPS) return { r: 0, g: 0, b: 0, a: 0 };
  const p1 = (w1 * c1.a) / alpha;
  const p2 = (w2 * c2.a) / alpha;
  return {
    r: p1 * c1.r + p2 * c2.r,
    g: p1 * c1.g + p2 * c2.g,
    b: p1 * c1.b + p2 * c2.b,
    a: alpha,
  };
}

function splitTopLevel(str, separator) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of str) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === separator && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts.map((part) => part.trim());
}

// body: contents inside color-mix( ... ) -> rgba object or null
function evalColorMixBody(body) {
  const parts = splitTopLevel(body, ",");
  if (parts.length !== 3) return null;

  const spaceMatch = parts[0].match(/^in\s+(oklch|oklab|srgb)$/i);
  if (!spaceMatch) return null;
  const space = spaceMatch[1].toLowerCase();

  const readArg = (arg) => {
    const m = arg.match(/^([\s\S]*?)(?:\s+([\d.]+)%)?$/);
    return { color: parseColor(m[1]), pct: m[2] != null ? Number(m[2]) : null };
  };

  const arg1 = readArg(parts[1]);
  const arg2 = readArg(parts[2]);
  if (!arg1.color || !arg2.color) return null;

  let w1 = arg1.pct;
  let w2 = arg2.pct;
  if (w1 == null && w2 == null) {
    w1 = w2 = 50;
  } else if (w1 == null) {
    w1 = 100 - w2;
  } else if (w2 == null) {
    w2 = 100 - w1;
  }
  const total = w1 + w2;
  if (total <= 0) return null;
  w1 /= total;
  w2 /= total;

  return space === "srgb"
    ? mixInSrgb(arg1.color, w1, arg2.color, w2)
    : mixInOklch(arg1.color, w1, arg2.color, w2);
}

/* --- CSS text transformation --- */

// find `fn(` at/after `from`, return { start, end } spanning the balanced call
function findCall(text, fn, from) {
  const start = text.indexOf(`${fn}(`, from);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start + fn.length; i < text.length; i += 1) {
    if (text[i] === "(") depth += 1;
    if (text[i] === ")") {
      depth -= 1;
      if (depth === 0) return { start, end: i + 1 };
    }
  }
  return null;
}

// compile a single declaration value; lookup resolves var names to static text
function compileValue(value, lookup) {
  let result = value;

  for (let guard = 0; guard < 32; guard += 1) {
    let changed = false;

    for (const fn of ["oklch", "color-mix"]) {
      let cursor = 0;
      for (;;) {
        const call = findCall(result, fn, cursor);
        if (!call) break;
        let expr = result.slice(call.start, call.end);

        // resolve var() references inside the color expression only
        expr = expr.replace(/var\(\s*--([a-zA-Z0-9-]+)\s*\)/g, (whole, name) => {
          const resolved = lookup(name);
          return resolved != null ? resolved : whole;
        });

        const parsed = fn === "oklch"
          ? parseColor(expr)
          : evalColorMixBody(expr.slice("color-mix(".length, -1));

        if (parsed) {
          const replacement = formatColor(parsed);
          result = result.slice(0, call.start) + replacement + result.slice(call.end);
          cursor = call.start + replacement.length;
          changed = true;
        } else {
          cursor = call.end;
        }
      }
    }

    if (!changed) return result;
  }
  return result;
}

function extractProps(blockBody) {
  const props = {};
  const pattern = /--([a-zA-Z0-9-]+)\s*:\s*([^;{}]+)/g;
  let m;
  while ((m = pattern.exec(blockBody))) {
    props[m[1]] = m[2].trim();
  }
  return props;
}

/**
 * Compile every oklch()/color-mix() occurrence in a full theme stylesheet to
 * static sRGB. var() references are resolved from :root-level custom
 * properties plus the containing rule's own custom properties.
 */
function compileThemeCss(css) {
  // collect custom properties from every block (root vars + rule-local ones
  // like --alert-color; names are globally unique enough in this codebase,
  // and rule-local props shadow root ones per block below)
  const rootProps = {};
  for (const body of css.match(/\{[^{}]*\}/g) || []) {
    Object.assign(rootProps, extractProps(body.slice(1, -1)));
  }

  const resolved = {};
  const resolving = new Set();

  function lookupIn(localProps) {
    return function lookup(name) {
      const raw = (localProps && localProps[name]) ?? rootProps[name];
      if (raw == null) return null;
      const key = localProps && localProps[name] != null ? `local:${raw}` : name;
      if (resolved[key] != null) return resolved[key];
      if (resolving.has(key)) return null;
      resolving.add(key);
      let value = raw;
      // resolve plain aliases (--code-bg: var(--surface)) and nested colors
      value = value.replace(/var\(\s*--([a-zA-Z0-9-]+)\s*\)/g, (whole, ref) => {
        const inner = lookup(ref);
        return inner != null ? inner : whole;
      });
      value = compileValue(value, lookup);
      resolving.delete(key);
      resolved[key] = value;
      return value;
    };
  }

  return css.replace(/\{([^{}]*)\}/g, (whole, body) => {
    if (!/oklch\(|color-mix\(/i.test(body)) return whole;
    const local = extractProps(body);
    const lookup = lookupIn(local);
    const compiled = body.replace(
      /([\w-]+\s*:\s*)([^;{}]+)/g,
      (declWhole, prop, value) =>
        /oklch\(|color-mix\(/i.test(value) ? prop + compileValue(value, lookup) : declWhole,
    );
    return `{${compiled}}`;
  });
}

module.exports = {
  compileThemeCss,
  compileValue,
  parseColor,
  formatColor,
};
