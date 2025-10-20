#!/usr/bin/env node

/**
 * Parse ESLint output and convert to structured JSON format for tracking
 * Usage: node scripts/parse-eslint-warnings.js <eslint-output-file>
 */

import fs from "fs";
import path from "path";

if (process.argv.length < 3) {
  console.error("Usage: node parse-eslint-warnings.js <eslint-output-file>");
  process.exit(1);
}

const eslintOutputFile = process.argv[2];

try {
  const eslintOutput = fs.readFileSync(eslintOutputFile, "utf8");
  const warnings = parseESLintOutput(eslintOutput);

  const result = {
    project: "violet-vault",
    lastUpdated: new Date().toISOString().split("T")[0],
    currentStatus: {
      totalWarnings: warnings.totalCount,
      targetWarnings: 17,
      errors: warnings.errorCount,
    },
    fileSizeTracking: {
      files300Plus:
        warnings.categories.find((c) => c.type === "max-lines" && c.severity === "warning")
          ?.count || 0,
      files400Plus:
        warnings.categories.find((c) => c.type === "max-lines" && c.severity === "error")?.count ||
        0,
      refactoringTarget: "Files over 300 lines should be refactored",
    },
    warningCategories: warnings.categories,
    actionPlan: generateActionPlan(warnings.categories),
    commands: {
      checkWarnings: "npm run lint",
      countWarnings: 'npm run lint 2>&1 | grep -c "warning"',
      checkSpecificFile: "npx eslint src/path/to/file.js",
    },
    monitoring: {
      target: "≤ 17 warnings",
      reviewFrequency: "After significant changes or weekly",
      autoCheck: "Automated via GitHub Actions",
    },
  };

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Error parsing ESLint output:", error.message);
  process.exit(1);
}

function parseESLintOutput(output) {
  const lines = output.split("\n");
  const warnings = [];
  const errors = [];
  const warningsByFile = new Map();

  let currentFile = "";
  let inSummary = false;

  for (const line of lines) {
    // Check if we've reached the summary section
    if (line.includes("✖") && line.includes("problems")) {
      inSummary = true;
      continue;
    }

    if (inSummary) continue;

    // Match file paths (absolute or relative)
    const fileMatch = line.match(/^\/.*?\.(js|jsx|ts|tsx)$|^[^/\s].*?\.(js|jsx|ts|tsx)$/);
    if (fileMatch) {
      currentFile = fileMatch[0];
      // Convert absolute paths to relative paths
      if (currentFile.startsWith("/")) {
        const projectRoot = process.cwd();
        if (currentFile.startsWith(projectRoot)) {
          currentFile = currentFile.substring(projectRoot.length + 1);
        }
      }
      continue;
    }

    // Match warning/error lines with format: "  line:col  level  message  rule"
    const issueMatch = line.match(
      /^\s*(\d+):(\d+)\s+(warning|error)\s+(.*?)\s+([\w-]+(?:\/[\w-]+)*)$/
    );
    if (issueMatch && currentFile) {
      const [, lineNum, col, level, message, rule] = issueMatch;

      const issue = {
        file: currentFile,
        line: parseInt(lineNum),
        column: parseInt(col),
        level: level,
        message: message.trim(),
        rule: rule,
      };

      if (level === "warning") {
        warnings.push(issue);

        // Group by file
        if (!warningsByFile.has(currentFile)) {
          warningsByFile.set(currentFile, []);
        }
        warningsByFile.get(currentFile).push(issue);
      } else if (level === "error") {
        errors.push(issue);
      }
    }
  }

  // Group warnings by rule type
  const categoriesByRule = new Map();

  warnings.forEach((warning) => {
    if (!categoriesByRule.has(warning.rule)) {
      categoriesByRule.set(warning.rule, {
        type: warning.rule,
        count: 0,
        severity: "warning",
        files: new Map(),
      });
    }

    const category = categoriesByRule.get(warning.rule);
    category.count++;

    if (!category.files.has(warning.file)) {
      category.files.set(warning.file, {
        path: warning.file,
        warnings: 0,
        details: [],
      });
    }

    const fileData = category.files.get(warning.file);
    fileData.warnings++;
    fileData.details.push({
      line: warning.line,
      message: warning.message,
    });
  });

  // Convert to array format
  const categories = Array.from(categoriesByRule.values()).map((category) => ({
    type: category.type,
    count: category.count,
    severity: category.severity,
    files: Array.from(category.files.values()),
  }));

  return {
    totalCount: warnings.length,
    errorCount: errors.length,
    categories: categories,
    warningsByFile: Array.from(warningsByFile.entries()).map(([file, fileWarnings]) => ({
      file,
      count: fileWarnings.length,
      warnings: fileWarnings,
    })),
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
      task: `Fix ${category.type} warnings`,
      warningsAffected: category.count,
      files: category.files.map((f) => path.basename(f.path)),
      action: getActionForRule(category.type),
    };

    // Categorize by priority based on rule type and count
    if (category.type === "max-lines" && category.severity === "error") {
      // Files over 400/500 lines - critical refactoring needed
      actionPlan.highPriority.push(action);
    } else if (category.type.includes("no-unused-vars") && category.count > 5) {
      actionPlan.highPriority.push(action);
    } else if (category.type.includes("react-hooks")) {
      actionPlan.highPriority.push(action);
    } else if (category.type === "complexity" && category.count > 5) {
      // High complexity violations need attention
      actionPlan.mediumPriority.push(action);
    } else if (category.type === "max-lines" && category.severity === "warning") {
      // Files 300-400 lines - moderate priority
      actionPlan.mediumPriority.push(action);
    } else if (category.type.includes("react-refresh")) {
      actionPlan.lowPriority.push(action);
    } else if (category.count > 3) {
      actionPlan.mediumPriority.push(action);
    } else {
      actionPlan.lowPriority.push(action);
    }
  });

  return actionPlan;
}

function getActionForRule(rule) {
  const actionMap = {
    "no-unused-vars": "Remove unused variables or prefix with underscore if intentionally unused",
    "react-hooks/exhaustive-deps": "Add missing dependencies to useEffect dependency array",
    "react-refresh/only-export-components":
      "Refactor to separate component and non-component exports",
    "prefer-const": "Use const instead of let for variables that are never reassigned",
    "no-console": "Remove console statements or add eslint-disable comment",
    "no-debugger": "Remove debugger statements",
    "no-unreachable": "Remove unreachable code after return/throw statements",
    "max-lines": "Refactor large file - split into smaller components or extract utilities",
    complexity: "Reduce function complexity - extract smaller functions or simplify logic",
    "max-lines-per-function": "Split large function into smaller, focused functions",
    "max-depth": "Reduce nesting depth - use early returns or extract nested logic",
    "max-params": "Reduce function parameters - use object parameters or split function",
    "max-statements": "Split long function into smaller functions with single responsibilities",
  };

  return actionMap[rule] || `Review and fix ${rule} violations`;
}
