const { execSync } = require("child_process");
const fs = require("fs");

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function read(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

const version = fs.readFileSync("VERSION.txt", "utf8").trim();
if (!version) {
  console.error("VERSION.txt 为空，请先填写版本号。");
  process.exit(1);
}

const existingTag = read(`git tag -l "${version}"`);
if (existingTag) {
  console.error(`Tag ${version} 已存在，请修改版本号。`);
  process.exit(1);
}

console.log("开始打包...");
run("node scripts/package.js");

console.log("开始提交...");
run("git add -A");

let hasChanges = true;
try {
  execSync("git diff --cached --quiet");
  hasChanges = false;
} catch {
  hasChanges = true;
}

if (hasChanges) {
  run(`git commit -m "chore: ${version}"`);
} else {
  console.log("没有可提交的改动，跳过提交。");
}

const branch = read("git rev-parse --abbrev-ref HEAD");
console.log(`开始推送分支 ${branch}...`);
run(`git push origin ${branch}`);
console.log(`开始打 Tag ${version} 并推送...`);
run(`git tag ${version}`);
run(`git push origin ${version}`);
console.log(`发布完成：${version}`);
