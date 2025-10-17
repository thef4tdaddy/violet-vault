#!/usr/bin/env node

/**
 * Parse TypeScript (tsc) output and convert to structured JSON format for tracking
 * Usage: node scripts/parse-tsc-errors.js <tsc-output-file>
 */

import fs from "fs";
import path from "path";

if (process.argv.length < 3) {
  console.error("Usage: node parse-tsc-errors.js <tsc-output-file>");
  process.exit(1);
}

const tscOutputFile = process.argv[2];

try {
  const tscOutput = fs.readFileSync(tscOutputFile, "utf8");
  const errors = parseTscOutput(tscOutput);

  const result = {
    project: "violet-vault",
    lastUpdated: new Date().toISOString().split("T")[0],
    currentStatus: {
      totalErrors: errors.totalCount,
      targetErrors: 0,
    },
    errorCategories: errors.categories,
    actionPlan: generateActionPlan(errors.categories),
    commands: {
      checkTypes: "npm run tsc:check",
      watchTypes: "npm run tsc:watch",
      checkSpecificFile: "npx tsc --noEmit src/path/to/file.ts",
    },
    monitoring: {
      target: "0 type errors",
      reviewFrequency: "On every PR",
      autoCheck: "Automated via GitHub Actions",
    },
  };

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Error parsing TypeScript output:", error.message);
  process.exit(1);
}

function parseTscOutput(output) {
  const lines = output.split("\n");
  const errors = [];
  const errorsByFile = new Map();

  for (const line of lines) {
    // Match TypeScript error format: "path/to/file.ts(line,col): error TSxxxx: message"
    const errorMatch = line.match(
      /^(.+?\.(?:ts|tsx|js|jsx))\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/,
    );

    if (errorMatch) {
      const [, filePath, lineNum, col, errorCode, message] = errorMatch;

      // Convert absolute paths to relative paths
      let relativePath = filePath;
      if (filePath.startsWith("/")) {
        const projectRoot = process.cwd();
        if (filePath.startsWith(projectRoot)) {
          relativePath = filePath.substring(projectRoot.length + 1);
        }
      }

      const error = {
        file: relativePath,
        line: parseInt(lineNum),
        column: parseInt(col),
        code: errorCode,
        message: message.trim(),
      };

      errors.push(error);

      // Group by file
      if (!errorsByFile.has(relativePath)) {
        errorsByFile.set(relativePath, []);
      }
      errorsByFile.get(relativePath).push(error);
    }
  }

  // Group errors by error code
  const categoriesByCode = new Map();

  errors.forEach((error) => {
    if (!categoriesByCode.has(error.code)) {
      categoriesByCode.set(error.code, {
        type: error.code,
        count: 0,
        files: new Map(),
      });
    }

    const category = categoriesByCode.get(error.code);
    category.count++;

    if (!category.files.has(error.file)) {
      category.files.set(error.file, {
        path: error.file,
        errors: 0,
        details: [],
      });
    }

    const fileData = category.files.get(error.file);
    fileData.errors++;
    fileData.details.push({
      line: error.line,
      message: error.message,
    });
  });

  // Convert to array format
  const categories = Array.from(categoriesByCode.values()).map((category) => ({
    type: category.type,
    count: category.count,
    files: Array.from(category.files.values()),
  }));

  // Sort by count descending
  categories.sort((a, b) => b.count - a.count);

  return {
    totalCount: errors.length,
    categories: categories,
    errorsByFile: Array.from(errorsByFile.entries()).map(
      ([file, fileErrors]) => ({
        file,
        count: fileErrors.length,
        errors: fileErrors,
      }),
    ),
  };
}

function generateActionPlan(categories) {
  const actionPlan = {
    highPriority: [],
    mediumPriority: [],
    lowPriority: [],
  };

  categories.forEach((category) => {
    const action = {
      task: `Fix ${category.type} errors`,
      errorsAffected: category.count,
      files: category.files.map((f) => path.basename(f.path)),
      action: getActionForErrorCode(category.type),
    };

    // Categorize by priority based on error code and count
    const errorCode = parseInt(category.type.replace("TS", ""));

    // Critical type safety errors
    if (
      [
        2304, // Cannot find name
        2345, // Argument type mismatch
        2322, // Type not assignable
        2339, // Property does not exist
      ].includes(errorCode)
    ) {
      actionPlan.highPriority.push(action);
    }
    // Important but less critical
    else if (
      [
        2307, // Cannot find module
        2551, // Property does not exist (suggestion available)
        2769, // No overload matches this call
      ].includes(errorCode)
    ) {
      actionPlan.mediumPriority.push(action);
    }
    // All other errors
    else {
      actionPlan.lowPriority.push(action);
    }
  });

  return actionPlan;
}

function getActionForErrorCode(code) {
  const actionMap = {
    TS2304: "Add type definitions or import missing types",
    TS2345: "Fix argument types to match function signature",
    TS2322: "Ensure assigned value matches the expected type",
    TS2339: "Add missing property or check property name spelling",
    TS2307: "Install missing module or fix import path",
    TS2551: "Check property name (TypeScript suggests alternatives)",
    TS2769: "Fix function call arguments to match available overloads",
    TS7006: "Add explicit type annotations",
    TS7016: "Install type definitions (@types/package-name)",
    TS2532: "Add null/undefined checks",
    TS2531: "Check for null/undefined before accessing",
    TS18047: "Add type guards or null checks",
    TS18048: "Add undefined checks",
  };

  return actionMap[code] || `Review and fix ${code} violations`;
}
