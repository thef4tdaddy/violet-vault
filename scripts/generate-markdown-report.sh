#!/bin/bash

# This script combines the text-based lint and typecheck reports into a single markdown file.

# --- Configuration ---
LINT_INPUT="docs/audits/sorted-lint-report.txt"
TYPECHECK_INPUT="docs/audits/sorted-typecheck-report.txt"
OUTPUT_FILE="docs/audits/audit-report.md"

# --- Pre-flight checks ---
if [ ! -f "$LINT_INPUT" ] || [ ! -f "$TYPECHECK_INPUT" ]; then
    echo "Error: Input report files not found." >&2
    echo "Please run the sort-lint-audit.sh and sort-typecheck-audit.sh scripts first." >&2
    exit 1
fi

# --- Report Generation ---
> "$OUTPUT_FILE"

# Main Title and TOC
cat <<EOF >> "$OUTPUT_FILE"
# Combined Audit Report

## Table of Contents
- [Lint Audit](#lint-audit)
  - [Files with Most Issues](#files-with-most-issues)
  - [Issue Count by Category](#issue-count-by-category)
  - [Detailed Lint Report](#detailed-lint-report)
- [Typecheck Audit](#typecheck-audit)
  - [Files with Most Type Errors](#files-with-most-type-errors)
  - [Type Error Breakdown by Category](#type-error-breakdown-by-category)
  - [Detailed Type Error Report](#detailed-type-error-report)

EOF

# --- Lint Section ---
echo "## Lint Audit" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Files with Most Issues
echo "### Files with Most Issues" >> "$OUTPUT_FILE"
sed -n '/--- Files with Most Issues ---/,/--- Issue Count by Category ---/p' "$LINT_INPUT" | sed '1d;$d' | sed '$d' | awk '{print "- " $0}' | sed -E 's/issues in (.*)/issues in `\1`/g' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Issue Count by Category
echo "### Issue Count by Category" >> "$OUTPUT_FILE"
echo "| Count | Rule ID |" >> "$OUTPUT_FILE"
echo "|---|---|" >> "$OUTPUT_FILE"
sed -n '/--- Issue Count by Category ---/,/--- Detailed Lint Report ---/p' "$LINT_INPUT" | sed '1d;$d' | sed '$d' | awk '{printf "| %s | `%s` |\n", $1, $2}' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Detailed Report
echo "### Detailed Lint Report" >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
sed -n '/--- Detailed Lint Report ---/,$p' "$LINT_INPUT" | tail -n +2 >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"


# --- Typecheck Section ---
echo "## Typecheck Audit" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Files with Most Errors
echo "### Files with Most Type Errors" >> "$OUTPUT_FILE"
sed -n '/--- Files with Most Type Errors ---/,/--- Type Error Breakdown by Category ---/p' "$TYPECHECK_INPUT" | sed '1d;$d' | sed '$d' | awk '{print "- " $1 " errors in `" $2 "`"}' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Error Breakdown
echo "### Type Error Breakdown by Category" >> "$OUTPUT_FILE"
echo "| Count | Error Code |" >> "$OUTPUT_FILE"
echo "|---|---|" >> "$OUTPUT_FILE"
sed -n '/--- Type Error Breakdown by Category ---/,/--- Detailed Type Error Report ---/p' "$TYPECHECK_INPUT" | sed '1d;$d' | sed '$d' | awk '{printf "| %s | `%s` |\n", $1, $2}' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Detailed Report
echo "### Detailed Type Error Report" >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
sed -n '/--- Detailed Type Error Report ---/,$p' "$TYPECHECK_INPUT" | tail -n +2 >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"


echo "Combined markdown report generated at '$OUTPUT_FILE'"
