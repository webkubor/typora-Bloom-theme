const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const zipName = "Bloom-theme.zip";
const zipPath = path.join(root, zipName);
const files = ["bloom-light.css", "bloom-dark.css", "bloom-forest.css", "bloom-sea.css"];
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
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

const fileArgs = files.map((file) => `"${file}"`).join(" ");
run(`zip -r "${zipName}" ${fileArgs} -x "**/.DS_Store" "**/Thumbs.db" >/dev/null`);
console.log(`已生成 ${zipName}`);
