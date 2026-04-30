const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const bloomDir = path.join(root, "bloom");
const themeDir =
  process.env.TYPORA_THEME_DIR ||
  path.join(process.env.HOME || "", "Library", "Application Support", "abnerworks.Typora", "themes");
const once = process.argv.includes("--once");

let running = false;
let pending = false;
let timer = null;

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

function copyDir(source, target) {
  fs.mkdirSync(target, { recursive: true });

  fs.readdirSync(source, { withFileTypes: true }).forEach((entry) => {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
      return;
    }

    if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

function syncToTypora() {
  if (!fs.existsSync(themeDir)) {
    throw new Error(`Typora theme folder not found: ${themeDir}`);
  }

  const cssFiles = fs
    .readdirSync(distDir)
    .filter((file) => /^bloom-.+\.css$/.test(file))
    .sort();

  cssFiles.forEach((file) => {
    fs.copyFileSync(path.join(distDir, file), path.join(themeDir, file));
  });

  copyDir(bloomDir, path.join(themeDir, "bloom"));
  console.log(`同步到 Typora 主题目录：${cssFiles.length} 个 CSS + bloom/`);
  console.log(themeDir);
}

function rebuildAndSync() {
  if (running) {
    pending = true;
    return;
  }

  running = true;
  pending = false;

  try {
    run("node", ["scripts/gen-site-data.js"]);
    run("node", ["scripts/build-themes.js"]);
    syncToTypora();
  } catch (error) {
    console.error(error.message);
  } finally {
    running = false;
  }

  if (pending) {
    rebuildAndSync();
  }
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(rebuildAndSync, 150);
}

function watch(target) {
  if (!fs.existsSync(target)) return;

  const stats = fs.statSync(target);
  fs.watch(target, { recursive: stats.isDirectory() && process.platform === "darwin" }, schedule);
}

rebuildAndSync();

if (!once) {
  [
    path.join(root, "theme-src"),
    path.join(root, "bloom"),
    path.join(root, "scripts", "theme-list.js"),
    path.join(root, "scripts", "theme-vars.js"),
    path.join(root, "scripts", "build-themes.js"),
    path.join(root, "scripts", "gen-site-data.js")
  ].forEach(watch);

  console.log("正在监听主题源码变化，按 Ctrl+C 停止。");
}
