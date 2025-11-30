#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");

// Get list of TS6133 errors in test files
const output = execSync('npm run typecheck 2>&1 | grep "TS6133"', { encoding: "utf8" });
const lines = output.split("\n").filter((line) => line.trim() && line.includes("__tests__"));

console.log(`Found ${lines.length} test file TS6133 errors to fix`);

lines.forEach((line) => {
  // Parse the error line: "src/components/file.test.tsx(1,1): error TS6133: 'Select' is declared but its value is never read."
  const match = line.match(
    /^([^:]+)\((\d+),\d+\): error TS6133: '([^']+)' is declared but its value is never read\.$/
  );
  if (!match) return;

  const filePath = match[1];
  const lineNumber = parseInt(match[2]);
  const unusedImport = match[3];

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  // Read the file
  const content = fs.readFileSync(filePath, "utf8");
  const fileLines = content.split("\n");

  // Check if line contains the unused import
  const targetLine = fileLines[lineNumber - 1]; // 0-indexed
  if (!targetLine || !targetLine.includes(`import ${unusedImport}`)) {
    console.log(`Import not found on line ${lineNumber} in ${filePath}`);
    return;
  }

  // Check if the import is actually used elsewhere in the file
  const usesImport =
    content.includes(`${unusedImport}.`) ||
    content.includes(`${unusedImport} `) ||
    content.includes(`${unusedImport}>`) ||
    content.includes(`${unusedImport}<`);

  if (usesImport) {
    console.log(`Skipping ${filePath} - ${unusedImport} is actually used`);
    return;
  }

  // Remove the import line
  fileLines.splice(lineNumber - 1, 1);
  const newContent = fileLines.join("\n");

  // Write back
  fs.writeFileSync(filePath, newContent);
  console.log(`Fixed: ${filePath} - removed unused import '${unusedImport}'`);
});

console.log("Done!");
