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

# Count total issues - sum all errorCount and warningCount across all files
TOTAL_ISSUES=$(jq '[.[] | (.errorCount + .warningCount)] | add // 0' "$INPUT_FILE")

# Ensure TOTAL_ISSUES is a valid integer
if [ -z "$TOTAL_ISSUES" ] || [ "$TOTAL_ISSUES" = "null" ]; then
    TOTAL_ISSUES=0
fi

if [ "$TOTAL_ISSUES" -eq 0 ]; then
    # No issues found
    echo "✅ No Lint Issues Found" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "All files passed ESLint validation!" >> "$OUTPUT_FILE"
    echo "Last check: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" >> "$OUTPUT_FILE"
else
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
fi

# --- Completion ---
echo "Sorted lint report has been generated at '$OUTPUT_FILE'"
