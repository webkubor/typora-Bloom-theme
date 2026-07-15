// Dev-only: generates scratch HTML that compares build-time compiled colors
// against the browser's native oklch()/color-mix() rendering via canvas.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "theme-src");
const distDir = path.join(root, "dist");
const themes = require("./theme-list");
const { buildGeneratedVars, withTyporaRootVars } = require("./theme-vars");

function varTable(css) {
  const table = {};
  const pattern = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = pattern.exec(css))) table[m[1]] = m[2].trim();
  return table;
}

const cases = [];
themes.forEach((theme) => {
  const isDark = theme.base.includes("dark");
  const rawVars = withTyporaRootVars(
    buildGeneratedVars(theme, srcDir) ||
      fs.readFileSync(path.join(srcDir, theme.vars), "utf8"),
    isDark,
  );
  const dist = fs.readFileSync(path.join(distDir, `bloom-${theme.name}.css`), "utf8");
  const original = varTable(rawVars);
  const compiled = varTable(dist.slice(0, dist.indexOf("}")));

  Object.entries(original).forEach(([name, value]) => {
    if (!/oklch\(|color-mix\(/i.test(value)) return;
    // resolve var() refs textually against the original table
    let resolvedOriginal = value;
    for (let i = 0; i < 10 && /var\(/.test(resolvedOriginal); i += 1) {
      resolvedOriginal = resolvedOriginal.replace(
        /var\(\s*--([a-zA-Z0-9-]+)\s*\)/g,
        (w, n) => original[n] || w,
      );
    }
    if (/^0\s|shadow/.test(name) || /shadow/.test(name)) return; // shadows aren't single colors
    cases.push({ theme: theme.name, name, original: resolvedOriginal, compiled: compiled[name] });
  });
});

const html = `<!doctype html><meta charset="utf-8"><title>color verify</title>
<body><pre id="out">running…</pre>
<script>
const cases = ${JSON.stringify(cases)};
const canvas = document.createElement('canvas');
canvas.width = canvas.height = 1;
const ctx = canvas.getContext('2d', { willReadFrequently: true });
function px(color) {
  ctx.clearRect(0,0,1,1);
  ctx.fillStyle = '#000'; // detect parse failure: fillStyle keeps old value
  ctx.fillStyle = color;
  if (color !== '#000' && ctx.fillStyle === '#000000') return null;
  ctx.clearRect(0,0,1,1);
  ctx.fillRect(0,0,1,1);
  return [...ctx.getImageData(0,0,1,1).data];
}
const failures = [];
let checked = 0, skipped = 0;
for (const c of cases) {
  const a = px(c.original);
  const b = px(c.compiled);
  if (!a) { skipped++; continue; }
  if (!b) { failures.push({...c, reason: 'compiled unparsable'}); continue; }
  checked++;
  const alphaScale = a[3] / 255;
  // compare premultiplied-ish: channel diffs matter less at low alpha
  const diff = Math.max(Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1]), Math.abs(a[2]-b[2]));
  const alphaDiff = Math.abs(a[3]-b[3]);
  if (diff > 8 || alphaDiff > 3) failures.push({...c, browser: a, mine: b, diff, alphaDiff});
}
document.getElementById('out').textContent = JSON.stringify({checked, skipped, failCount: failures.length, failures: failures.slice(0, 40)}, null, 2);
document.title = failures.length ? 'FAIL ' + failures.length : 'PASS ' + checked;
</script>`;

const outPath = process.argv[2] || path.join(root, ".cache", "color-verify.html");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html);
console.log(`${cases.length} cases -> ${outPath}`);
