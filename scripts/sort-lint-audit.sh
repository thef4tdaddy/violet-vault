#!/bin/bash

# This script processes the ESLint JSON output and creates a sorted, readable report.

# --- Configuration ---
INPUT_FILE="docs/audits/lint-results.json"
OUTPUT_FILE="docs/audits/sorted-lint-report.txt"
PROJECT_ROOT="/Users/thef4tdaddy/Git/"

# --- Pre-flight checks ---
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed." >&2
    exit 1
fi
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Lint results file not found." >&2
    exit 1
fi

# --- Report Generation ---
> "$OUTPUT_FILE"

# Section 1: Summary of files with the most issues.
echo "--- Files with Most Issues (Errors + Warnings) ---" >> "$OUTPUT_FILE"
jq -r '.[] | select((.errorCount + .warningCount) > 0) | "\((.errorCount + .warningCount)) issues in \(.filePath)"' "$INPUT_FILE" | sed "s|$PROJECT_ROOT||" | sort -nr >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Section 2: Breakdown of issues by ESLint rule.
echo "--- Issue Count by Category (ESLint Rule) ---" >> "$OUTPUT_FILE"
jq -r '.[].messages[].ruleId' "$INPUT_FILE" | sort | uniq -c | sort -nr >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Section 3: A detailed, classic lint-style report.
echo "--- Detailed Lint Report ---" >> "$OUTPUT_FILE"
jq -r '.[] | .filePath as $file | .messages[] | "\($file):\(.line):\(.column) - \(.severity) - \(.message) (\(.ruleId))"' "$INPUT_FILE" | sed "s|$PROJECT_ROOT||" >> "$OUTPUT_FILE"

# --- Completion ---
echo "Sorted lint report has been generated at '$OUTPUT_FILE'"
