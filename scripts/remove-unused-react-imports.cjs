#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get list of TS6133 errors related to React imports
const output = execSync('npm run typecheck 2>&1 | grep "TS6133.*React"', { encoding: "utf8" });
const lines = output.split("\n").filter((line) => line.trim());

console.log(`Found ${lines.length} React import errors to fix`);

lines.forEach((line) => {
  // Parse the error line: "src/components/file.tsx(1,1): error TS6133: 'React' is declared but its value is never read."
  const match = line.match(
    /^([^:]+)\((\d+),\d+\): error TS6133: 'React' is declared but its value is never read\.$/
  );
  if (!match) return;

  const filePath = match[1];
  const lineNumber = parseInt(match[2]);

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  // Read the file
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  // Check if line contains React import
  const targetLine = lines[lineNumber - 1]; // 0-indexed
  if (!targetLine || !targetLine.includes("import React")) {
    console.log(`React import not found on line ${lineNumber} in ${filePath}`);
    return;
  }

  // Check if React is actually used in the file (more precise check)
  const usesReact =
    content.includes("React.") ||
    content.includes("React[") ||
    content.includes("React.createElement") ||
    content.includes("React.cloneElement") ||
    content.includes("React.Fragment");

  if (usesReact) {
    console.log(`Skipping ${filePath} - React is actually used`);
    return;
  }

  // Remove the React import line
  lines.splice(lineNumber - 1, 1);
  const newContent = lines.join("\n");

  // Write back
  fs.writeFileSync(filePath, newContent);
  console.log(`Fixed: ${filePath}`);
});

console.log("Done!");
