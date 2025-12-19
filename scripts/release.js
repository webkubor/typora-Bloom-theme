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
  console.error("VERSION.txt is empty.");
  process.exit(1);
}

const existingTag = read(`git tag -l "${version}"`);
if (existingTag) {
  console.error(`Tag ${version} already exists.`);
  process.exit(1);
}

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
}

const branch = read("git rev-parse --abbrev-ref HEAD");
run(`git push origin ${branch}`);
run(`git tag ${version}`);
run(`git push origin ${version}`);
