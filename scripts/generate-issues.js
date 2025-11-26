#!/usr/bin/env node

/**
 * Generate GitHub issues for TypeScript errors or ESLint problems
 * Supports: TypeScript (normal/strict mode) and ESLint
 * Groups errors into issues with configurable errors per issue
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const NORMAL_RESULTS_FILE = path.join(__dirname, "../docs/audits/typecheck-results.txt");
const STRICT_RESULTS_FILE = path.join(__dirname, "../docs/audits/typecheck-strict-results.txt");
const ESLINT_RESULTS_FILE = path.join(__dirname, "../docs/audits/lint-results.json");
const AGENT_PROMPT_FILE = path.join(
  __dirname,
  "../docs/development/agent-prompt-typescript-strict.md"
);
const DEFAULT_ERRORS_PER_ISSUE = 120; // Default target ~100-150 errors per issue

// GitHub configuration
const GITHUB_REPO = process.env.GITHUB_REPO || "thef4tdaddy/violet-vault";

/**
 * Parse TypeScript errors from results file
 */
function parseTypeScriptErrors(resultsFile) {
  if (!fs.existsSync(resultsFile)) {
    return { errorsByFile: {}, allErrors: [] };
  }

  const content = fs.readFileSync(resultsFile, "utf-8");
  const lines = content.split("\n");

  const errorsByFile = {};
  const allErrors = [];

  for (const line of lines) {
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
    if (match) {
      const [, filePath, lineNum, colNum, errorCode, message] = match;

      if (!errorsByFile[filePath]) {
        errorsByFile[filePath] = [];
      }

      const error = {
        file: filePath,
        line: parseInt(lineNum, 10),
        col: parseInt(colNum, 10),
        code: errorCode,
        message: message.trim(),
        fullLine: line.trim(),
      };

      errorsByFile[filePath].push(error);
      allErrors.push(error);
    }
  }

  return { errorsByFile, allErrors };
}

/**
 * Parse ESLint problems from JSON results file
 */
function parseESLintProblems(resultsFile) {
  if (!fs.existsSync(resultsFile)) {
    return { errorsByFile: {}, allErrors: [] };
  }

  const content = fs.readFileSync(resultsFile, "utf-8");
  const eslintData = JSON.parse(content);

  const errorsByFile = {};
  const allErrors = [];

  for (const fileResult of eslintData) {
    if (!fileResult.messages || fileResult.messages.length === 0) {
      continue;
    }

    // Convert absolute paths to relative paths
    let filePath = fileResult.filePath;
    if (filePath.startsWith(process.cwd())) {
      filePath = path.relative(process.cwd(), filePath);
    }

    if (!errorsByFile[filePath]) {
      errorsByFile[filePath] = [];
    }

    for (const message of fileResult.messages) {
      // Only include errors and warnings (severity 2 and 1)
      if (message.severity >= 1) {
        const error = {
          file: filePath,
          line: message.line || 0,
          col: message.column || 0,
          code: message.ruleId || "unknown",
          message: message.message,
          severity: message.severity === 2 ? "error" : "warning",
          fullLine: `${filePath}:${message.line}:${message.column} ${message.severity === 2 ? "error" : "warning"} ${message.message} ${message.ruleId || ""}`,
        };

        errorsByFile[filePath].push(error);
        allErrors.push(error);
      }
    }
  }

  return { errorsByFile, allErrors };
}

/**
 * Get agent prompt template (without worktree section)
 * Includes all rules and instructions from the agent prompt document
 */
function getAgentPrompt(issueType = "TypeScript") {
  if (issueType === "ESLint") {
    return "Follow ESLint best practices and fix all linting issues. Use `npm run lint:fix` to auto-fix issues where possible.";
  }

  if (!fs.existsSync(AGENT_PROMPT_FILE)) {
    return "See docs/development/agent-prompt-typescript-strict.md for instructions.";
  }

  const content = fs.readFileSync(AGENT_PROMPT_FILE, "utf-8");

  // Remove the worktree section (section 0) since offline agents work on separate branches
  const lines = content.split("\n");
  const startIdx = lines.findIndex((line) => line.includes("### 0. Setup: Use Git Worktrees"));
  const endIdx = lines.findIndex((line, idx) => idx > startIdx && line.match(/^### \d+\./));

  if (startIdx === -1) {
    // Worktree section not found, return full content
    return content;
  }

  // Remove worktree section but keep everything else
  const beforeWorktree = lines.slice(0, startIdx);
  const afterWorktree = lines.slice(endIdx);

  // Combine and update section numbers (renumber from 1)
  const filteredLines = [...beforeWorktree, ...afterWorktree];

  let sectionNum = 0;
  const result = filteredLines.map((line) => {
    const match = line.match(/^### (\d+)\./);
    if (match) {
      sectionNum++;
      return line.replace(/^### \d+\./, `### ${sectionNum}.`);
    }
    return line;
  });

  // Add a note about working on separate branches instead of worktrees
  const noteIndex = result.findIndex((line) => line.includes("## Instructions"));
  if (noteIndex !== -1) {
    result.splice(
      noteIndex + 1,
      0,
      "",
      "**Note for Offline Agents**: Since you are working offline on separate branches, you do not need to use git worktrees. Simply create a feature branch and work there:",
      "",
      "```bash",
      "# Create a feature branch",
      "git checkout -b fix-ts-errors-batch-X",
      "",
      "# Work on fixes...",
      "# Commit changes...",
      "",
      "# Push when ready",
      "git push origin fix-ts-errors-batch-X",
      "```",
      ""
    );
  }

  return result.join("\n");
}

/**
 * Group errors into batches for issues
 */
function groupErrorsIntoBatches(errorsByFile, errorsPerIssue = DEFAULT_ERRORS_PER_ISSUE) {
  const batches = [];
  let currentBatch = {
    files: [],
    errors: [],
    errorCount: 0,
  };

  // Sort files by error count (descending)
  const sortedFiles = Object.entries(errorsByFile).sort(([, a], [, b]) => b.length - a.length);

  for (const [file, errors] of sortedFiles) {
    // If adding this file would exceed the limit, start a new batch
    if (currentBatch.errorCount + errors.length > errorsPerIssue && currentBatch.files.length > 0) {
      batches.push(currentBatch);
      currentBatch = {
        files: [],
        errors: [],
        errorCount: 0,
      };
    }

    currentBatch.files.push(file);
    currentBatch.errors.push(...errors);
    currentBatch.errorCount += errors.length;
  }

  // Add the last batch if it has errors
  if (currentBatch.files.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

/**
 * Format error list for issue body
 */
function formatErrorList(errors, errorType = "TypeScript") {
  const byFile = {};
  for (const error of errors) {
    if (!byFile[error.file]) {
      byFile[error.file] = [];
    }
    byFile[error.file].push(error);
  }

  const lines = [];
  lines.push(`## Files with ${errorType} Issues\n`);
  lines.push(`**Total Issues**: ${errors.length}\n`);
  lines.push("### Issue Summary by File\n");

  // Sort files by error count
  const sortedFiles = Object.entries(byFile).sort(([, a], [, b]) => b.length - a.length);

  for (const [file, fileErrors] of sortedFiles) {
    lines.push(`\n#### \`${file}\` (${fileErrors.length} issues)`);
    lines.push("");

    // Group by error code/rule
    const byCode = {};
    for (const error of fileErrors) {
      if (!byCode[error.code]) {
        byCode[error.code] = [];
      }
      byCode[error.code].push(error);
    }

    for (const [code, codeErrors] of Object.entries(byCode).sort(
      (a, b) => b[1].length - a[1].length
    )) {
      const severityLabel =
        errorType === "ESLint" && codeErrors[0].severity ? ` (${codeErrors[0].severity})` : "";
      lines.push(`**${code}**${severityLabel} (${codeErrors.length} occurrences):`);
      for (const error of codeErrors.slice(0, 10)) {
        // Show first 10 of each type
        lines.push(`- Line ${error.line}:${error.col} - ${error.message}`);
      }
      if (codeErrors.length > 10) {
        lines.push(`- ... and ${codeErrors.length - 10} more`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Create GitHub issue
 */
async function createGitHubIssue(
  batch,
  batchNumber,
  totalBatches,
  agentPrompt,
  issueType = "TypeScript",
  mode = "normal"
) {
  const modeLabel = mode === "strict" ? "Strict Mode" : mode === "normal" ? "Normal" : "";
  const typeLabel = issueType === "ESLint" ? "ESLint" : "TypeScript";
  const title = `Fix ${typeLabel} ${modeLabel ? modeLabel + " " : ""}Issues (Batch ${batchNumber}/${totalBatches}) - ${batch.errorCount} issues in ${batch.files.length} files`;

  const body = [
    `# ${typeLabel} ${modeLabel ? modeLabel + " " : ""}Issue Fixing - Batch ${batchNumber}/${totalBatches}`,
    "",
    `**Total Issues**: ${batch.errorCount}`,
    `**Total Files**: ${batch.files.length}`,
    "",
    "---",
    "",
    "## 📋 Files to Fix",
    "",
    batch.files
      .map(
        (file, idx) =>
          `${idx + 1}. \`${file}\` (${batch.errors.filter((e) => e.file === file).length} issues)`
      )
      .join("\n"),
    "",
    "---",
    "",
    formatErrorList(batch.errors, typeLabel),
    "",
    "---",
    "",
    "## 🤖 Complete Agent Instructions",
    "",
    "**⚠️ CRITICAL: Read and follow ALL instructions below before starting work.**",
    "",
    agentPrompt,
    "",
    "---",
    "",
    "## ✅ Progress Checklist",
    "",
    "- [ ] Read and understood all agent instructions above",
    "- [ ] Created feature branch for this batch",
    "- [ ] Fixed all files in this batch",
    issueType === "ESLint"
      ? "- [ ] Verified ESLint issues for these files are resolved"
      : "- [ ] Verified normal TypeScript errors remain at 0",
    "- [ ] Verified ESLint errors remain at 0",
    issueType === "TypeScript" && mode === "strict"
      ? "- [ ] Verified strict mode errors for these files are resolved"
      : issueType === "TypeScript"
        ? "- [ ] Verified normal TypeScript errors for these files are resolved"
        : "",
    "- [ ] All changes committed with descriptive messages",
    "- [ ] Branch pushed and ready for review",
    "",
    "---",
    "",
    `*This issue was automatically generated from ${modeLabel ? modeLabel.toLowerCase() + " " : ""}${typeLabel.toLowerCase()} results*`,
  ].join("\n");

  const labels = [
    issueType === "ESLint" ? "eslint" : "typescript",
    issueType === "TypeScript" && mode === "strict"
      ? "strict-mode"
      : issueType === "TypeScript"
        ? "typescript-normal"
        : "linting",
    issueType === "ESLint" ? "code-quality" : "type-safety",
    "technical-debt",
    `batch-${batchNumber}`,
  ];

  try {
    // Use GitHub CLI to create the issue
    // Create a temporary file for the body (gh CLI can handle long bodies better this way)
    const tempFile = path.join(
      __dirname,
      `../.temp-issue-body-${issueType.toLowerCase()}-${mode}-${batchNumber}.md`
    );

    try {
      fs.writeFileSync(tempFile, body, "utf-8");

      // Build gh command - try with labels, but continue if labels fail
      const labelArgs = labels.map((label) => `-l "${label}"`).join(" ");
      const command = `gh issue create --repo ${GITHUB_REPO} --title "${title.replace(/"/g, '\\"')}" --body-file "${tempFile}" ${labelArgs}`;

      let output;
      try {
        output = execSync(command, {
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        });
      } catch (labelError) {
        // If labels fail, try without them
        if (labelError.message.includes("not found")) {
          console.log(`   ⚠️  Some labels not found, creating issue without labels...`);
          const commandNoLabels = `gh issue create --repo ${GITHUB_REPO} --title "${title.replace(/"/g, '\\"')}" --body-file "${tempFile}"`;
          output = execSync(commandNoLabels, {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"],
          });
        } else {
          throw labelError;
        }
      }

      // Parse the issue URL from output
      const urlMatch = output.match(/https:\/\/github\.com\/[^\s]+/);
      const issueNumberMatch = output.match(/#(\d+)/);

      // Clean up temp file
      fs.unlinkSync(tempFile);

      return {
        number: issueNumberMatch ? parseInt(issueNumberMatch[1], 10) : batchNumber,
        title: title,
        html_url: urlMatch
          ? urlMatch[0]
          : `https://github.com/${GITHUB_REPO}/issues/${batchNumber}`,
        body: body,
      };
    } catch (writeError) {
      // Clean up temp file if it exists
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      throw writeError;
    }
  } catch (error) {
    console.error(`Failed to create issue for batch ${batchNumber}:`, error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const issueType = process.argv[2] || "typescript"; // 'typescript' or 'eslint'
  const mode = process.argv[3] || "normal"; // For TypeScript: 'normal' or 'strict'

  // Parse optional arguments: maxErrors and errorsPerIssue
  // Arguments: [issueType, mode, maxErrors (optional), errorsPerIssue (optional)]
  // Empty strings are passed for missing optional args
  let maxErrors = null;
  let errorsPerIssue = DEFAULT_ERRORS_PER_ISSUE;

  // argv[4] = maxErrors (optional, can be empty string)
  if (process.argv[4] && process.argv[4].trim() !== "") {
    const parsed = parseInt(process.argv[4], 10);
    if (!isNaN(parsed) && parsed > 0) {
      maxErrors = parsed;
    }
  }

  // argv[5] = errorsPerIssue (optional, can be empty string)
  if (process.argv[5] && process.argv[5].trim() !== "") {
    const parsed = parseInt(process.argv[5], 10);
    if (!isNaN(parsed) && parsed > 0) {
      errorsPerIssue = parsed;
    }
  }

  // Determine which results file to use
  let resultsFile;
  let modeLabel;
  let parseFunction;

  if (issueType === "eslint") {
    resultsFile = ESLINT_RESULTS_FILE;
    modeLabel = "ESLint";
    parseFunction = parseESLintProblems;
  } else {
    resultsFile = mode === "strict" ? STRICT_RESULTS_FILE : NORMAL_RESULTS_FILE;
    modeLabel = mode === "strict" ? "strict mode TypeScript" : "normal TypeScript";
    parseFunction = parseTypeScriptErrors;
  }

  console.log(`📊 Parsing ${modeLabel} issues...`);
  const { errorsByFile, allErrors } = parseFunction(resultsFile);

  let errorsToProcess = allErrors;
  if (maxErrors && allErrors.length > maxErrors) {
    // Take the last N errors (most recent/relevant)
    console.log(`⚠️  Limiting to last ${maxErrors} issues (out of ${allErrors.length} total)`);
    errorsToProcess = allErrors.slice(-maxErrors);

    // Rebuild errorsByFile with limited errors
    const limitedErrorsByFile = {};
    for (const error of errorsToProcess) {
      if (!limitedErrorsByFile[error.file]) {
        limitedErrorsByFile[error.file] = [];
      }
      limitedErrorsByFile[error.file].push(error);
    }
    Object.assign(errorsByFile, limitedErrorsByFile);
  }

  const totalErrors = errorsToProcess.length;
  const totalFiles = Object.keys(errorsByFile).length;

  console.log(`Found ${totalErrors} issues across ${totalFiles} files`);
  console.log(`Using ${errorsPerIssue} issues per issue`);

  console.log(`\n📦 Grouping issues into batches...`);
  const batches = groupErrorsIntoBatches(errorsByFile, errorsPerIssue);

  console.log(`Created ${batches.length} batches:`);
  batches.forEach((batch, idx) => {
    console.log(`  Batch ${idx + 1}: ${batch.errorCount} issues in ${batch.files.length} files`);
  });

  console.log("\n📝 Loading agent prompt template...");
  const agentPrompt = getAgentPrompt(issueType === "eslint" ? "ESLint" : "TypeScript");

  console.log("\n🚀 Creating GitHub issues...");
  const createdIssues = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\nCreating issue ${i + 1}/${batches.length}...`);

    try {
      const issue = await createGitHubIssue(
        batch,
        i + 1,
        batches.length,
        agentPrompt,
        issueType === "eslint" ? "ESLint" : "TypeScript",
        mode
      );
      createdIssues.push(issue);
      console.log(`✅ Created issue #${issue.number}: ${issue.title}`);
      console.log(`   URL: ${issue.html_url}`);

      // Rate limiting: wait 1 second between requests
      if (i < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ Failed to create issue ${i + 1}:`, error.message);
      // Continue with next issue
    }
  }

  console.log("\n✨ Summary:");
  console.log(`   Total batches: ${batches.length}`);
  console.log(`   Issues created: ${createdIssues.length}`);
  console.log(`   Issues failed: ${batches.length - createdIssues.length}`);

  if (createdIssues.length > 0) {
    console.log("\n📋 Created Issues:");
    createdIssues.forEach((issue) => {
      console.log(`   #${issue.number}: ${issue.title}`);
      console.log(`   ${issue.html_url}`);
    });
  }
}

// Run if called directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("generate-issues.js")
) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { parseTypeScriptErrors, parseESLintProblems, groupErrorsIntoBatches, createGitHubIssue };
