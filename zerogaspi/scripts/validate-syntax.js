const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const targets = [
  path.join(root, "api"),
  path.join(root, "backend"),
  path.join(root, "frontend", "js"),
];

function collectJsFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJsFiles(fullPath, files);
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

function checkSyntax(filePath) {
  const result = spawnSync(process.execPath, ["--check", filePath], {
    encoding: "utf8",
  });

  return {
    ok: result.status === 0,
    output: `${result.stdout || ""}${result.stderr || ""}`.trim(),
  };
}

const files = targets.flatMap((dir) => collectJsFiles(dir));

if (files.length === 0) {
  console.log("No JavaScript files found for syntax validation.");
  process.exit(0);
}

const failures = [];

for (const file of files) {
  const check = checkSyntax(file);
  if (!check.ok) {
    failures.push({ file, output: check.output });
  }
}

if (failures.length > 0) {
  console.error("Syntax validation failed:");
  for (const failure of failures) {
    const rel = path.relative(root, failure.file);
    console.error(`\n- ${rel}`);
    if (failure.output) {
      console.error(failure.output);
    }
  }
  process.exit(1);
}

console.log(`Syntax validation passed for ${files.length} JavaScript files.`);