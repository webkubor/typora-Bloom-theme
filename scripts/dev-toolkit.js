const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const repo = "https://github.com/typora/typora-theme-toolkit.git";
const toolkitDir = process.env.TYPORA_TOOLKIT_DIR || path.join(root, ".cache", "typora-theme-toolkit");
const host = "127.0.0.1";
const port = Number(process.env.PORT || 5173);
const previewPage = (process.env.PREVIEW_PAGE || "bloom-shot.html").replace(/^\/+/, "");

const theme = (process.argv[2] || process.env.THEME || "petal").replace(/^bloom-/, "").replace(/\.css$/, "");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
};

function run(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: options.cwd || root,
    stdio: options.stdio || "inherit",
  });
}

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function ensureToolkit() {
  if (fs.existsSync(path.join(toolkitDir, ".git"))) {
    run("git", ["pull", "--ff-only"], { cwd: toolkitDir });
    return;
  }

  fs.mkdirSync(path.dirname(toolkitDir), { recursive: true });
  run("git", ["clone", "--depth", "1", repo, toolkitDir]);
}

function buildTheme() {
  run(process.execPath, ["scripts/gen-site-data.js"]);
  run(process.execPath, ["scripts/build-themes.js"]);
}

function syncTheme() {
  const cssPath = path.join(root, "dist", `bloom-${theme}.css`);
  if (!fs.existsSync(cssPath)) {
    throw new Error(`Theme CSS not found: ${cssPath}`);
  }

  const themeDir = path.join(toolkitDir, "html-preview", "theme");
  fs.mkdirSync(themeDir, { recursive: true });
  fs.copyFileSync(cssPath, path.join(themeDir, "test.css"));
  copyDir(path.join(root, "bloom"), path.join(themeDir, "bloom"));
}

function syncPreviewPage() {
  const htmlDir = path.join(toolkitDir, "html-preview", "html");
  const assetsDir = path.join(toolkitDir, "html-preview", "assets");
  fs.mkdirSync(htmlDir, { recursive: true });
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.copyFileSync(path.join(root, "scripts", "fixtures", "toolkit-shot.html"), path.join(htmlDir, "bloom-shot.html"));
  fs.copyFileSync(path.join(root, "website", "assets", "banner.png"), path.join(assetsDir, "banner.png"));
}

function openBrowser(url) {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  try {
    run(command, args, { stdio: "ignore" });
  } catch {
    // Browser auto-open is best effort.
  }
}

function safePath(urlPath) {
  const baseDir = path.join(toolkitDir, "html-preview");
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(clean).replace(/^([/\\])+/, "");
  const resolved = path.resolve(baseDir, normalized);
  const relative = path.relative(baseDir, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return resolved;
}

function startServer() {
  const server = http.createServer((req, res) => {
    if (!req.url) {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }

    let filePath = safePath(req.url === "/" ? `/html/${previewPage}` : req.url);
    if (!filePath) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const type = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    fs.createReadStream(filePath).pipe(res);
  });

  server.listen(port, host, () => {
    const url = `http://${host}:${port}/html/${previewPage}`;
    console.log(`Toolkit preview theme: bloom-${theme}.css`);
    console.log(`Toolkit test CSS: ${path.join(toolkitDir, "html-preview", "theme", "test.css")}`);
    console.log(`Preview URL: ${url}`);
    if (process.env.NO_OPEN !== "1") {
      openBrowser(url);
    }
  });
}

ensureToolkit();
buildTheme();
syncTheme();
syncPreviewPage();
startServer();
