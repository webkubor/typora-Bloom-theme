const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const zipName = "Bloom-theme.zip";
const zipPath = path.join(root, zipName);
const distDir = path.join(root, "dist");
const files = ["bloom-light.css", "bloom-dark.css", "bloom-forest.css", "bloom-sea.css"].map((file) =>
  path.join(distDir, file)
);
if (fs.existsSync(path.join(root, "typora-bloom-theme"))) {
  files.push("typora-bloom-theme");
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit", cwd: root, shell: "/bin/bash" });
}

try {
  execSync("command -v zip", { stdio: "ignore", shell: "/bin/bash" });
} catch {
  console.error("未找到 zip 命令，请先安装 zip。");
  process.exit(1);
}

console.log("开始生成本地包...");
run("node scripts/build-themes.js");
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

const cssFiles = files.filter((file) => file.endsWith(".css"));
const assetDirs = files.filter((file) => !file.endsWith(".css"));
const cssArgs = cssFiles.map((file) => `"${file}"`).join(" ");
run(`zip -j "${zipName}" ${cssArgs} >/dev/null`);
assetDirs.forEach((dir) => {
  run(`zip -r "${zipName}" "${dir}" -x "**/.DS_Store" "**/Thumbs.db" >/dev/null`);
});
console.log(`已生成 ${zipName}`);
