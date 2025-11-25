#!/usr/bin/env node

/**
 * Generate GitHub issues for TypeScript errors (normal and strict mode)
 * Groups errors into issues with ~100-150 errors per issue
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
const AGENT_PROMPT_FILE = path.join(
  __dirname,
  "../docs/development/agent-prompt-typescript-strict.md"
);
const ERRORS_PER_ISSUE = 120; // Target ~100-150 errors per issue

// GitHub configuration
const GITHUB_REPO = process.env.GITHUB_REPO || "thef4tdaddy/violet-vault";

/**
 * Parse TypeScript errors from results file
 */
function parseErrors(resultsFile) {
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
 * Get agent prompt template (without worktree section)
 * Includes all rules and instructions from the agent prompt document
 */
function getAgentPrompt() {
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
function groupErrorsIntoBatches(errorsByFile, errorsPerIssue = ERRORS_PER_ISSUE) {
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
  lines.push(`## Files with ${errorType} Errors\n`);
  lines.push(`**Total Errors**: ${errors.length}\n`);
  lines.push("### Error Summary by File\n");

  // Sort files by error count
  const sortedFiles = Object.entries(byFile).sort(([, a], [, b]) => b.length - a.length);

  for (const [file, fileErrors] of sortedFiles) {
    lines.push(`\n#### \`${file}\` (${fileErrors.length} errors)`);
    lines.push("");

    // Group by error code
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
      lines.push(`**${code}** (${codeErrors.length} occurrences):`);
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
  errorType = "TypeScript",
  mode = "normal"
) {
  const modeLabel = mode === "strict" ? "Strict Mode" : "Normal";
  const title = `Fix TypeScript ${modeLabel} Errors (Batch ${batchNumber}/${totalBatches}) - ${batch.errorCount} errors in ${batch.files.length} files`;

  const body = [
    `# TypeScript ${modeLabel} Error Fixing - Batch ${batchNumber}/${totalBatches}`,
    "",
    `**Total Errors**: ${batch.errorCount}`,
    `**Total Files**: ${batch.files.length}`,
    "",
    "---",
    "",
    "## 📋 Files to Fix",
    "",
    batch.files
      .map(
        (file, idx) =>
          `${idx + 1}. \`${file}\` (${batch.errors.filter((e) => e.file === file).length} errors)`
      )
      .join("\n"),
    "",
    "---",
    "",
    formatErrorList(batch.errors, errorType),
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
    "- [ ] Verified normal TypeScript errors remain at 0",
    "- [ ] Verified ESLint errors remain at 0",
    mode === "strict"
      ? "- [ ] Verified strict mode errors for these files are resolved"
      : "- [ ] Verified normal TypeScript errors for these files are resolved",
    "- [ ] All changes committed with descriptive messages",
    "- [ ] Branch pushed and ready for review",
    "",
    "---",
    "",
    `*This issue was automatically generated from ${modeLabel.toLowerCase()} type checking results*`,
  ].join("\n");

  const labels = [
    "typescript",
    mode === "strict" ? "strict-mode" : "typescript-normal",
    "type-safety",
    "technical-debt",
    `batch-${batchNumber}`,
  ];

  try {
    // Use GitHub CLI to create the issue
    // Create a temporary file for the body (gh CLI can handle long bodies better this way)
    const tempFile = path.join(__dirname, `../.temp-issue-body-${mode}-${batchNumber}.md`);

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
  const mode = process.argv[2] || "normal"; // 'normal' or 'strict'
  const maxErrors = process.argv[3] ? parseInt(process.argv[3], 10) : null; // Optional: limit total errors

  const resultsFile = mode === "strict" ? STRICT_RESULTS_FILE : NORMAL_RESULTS_FILE;
  const modeLabel = mode === "strict" ? "strict mode" : "normal";

  console.log(`📊 Parsing ${modeLabel} TypeScript errors...`);
  const { errorsByFile, allErrors } = parseErrors(resultsFile);

  let errorsToProcess = allErrors;
  if (maxErrors && allErrors.length > maxErrors) {
    // Take the last N errors (most recent/relevant)
    console.log(`⚠️  Limiting to last ${maxErrors} errors (out of ${allErrors.length} total)`);
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

  console.log(`Found ${totalErrors} errors across ${totalFiles} files`);

  console.log("\n📦 Grouping errors into batches...");
  const batches = groupErrorsIntoBatches(errorsByFile);

  console.log(`Created ${batches.length} batches:`);
  batches.forEach((batch, idx) => {
    console.log(`  Batch ${idx + 1}: ${batch.errorCount} errors in ${batch.files.length} files`);
  });

  console.log("\n📝 Loading agent prompt template...");
  const agentPrompt = getAgentPrompt();

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
        "TypeScript",
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
  process.argv[1]?.endsWith("generate-typescript-issues.js")
) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { parseErrors, groupErrorsIntoBatches, createGitHubIssue };
