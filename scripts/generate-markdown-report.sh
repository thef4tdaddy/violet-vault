#!/bin/bash

# This script combines the text-based lint and typecheck reports into a single markdown file.
# It also generates a summary table with current counts and compares with previous audit run.

# --- Configuration ---
LINT_INPUT="docs/audits/sorted-lint-report.txt"
TYPECHECK_INPUT="docs/audits/sorted-typecheck-report.txt"
OUTPUT_FILE="docs/audits/audit-report.md"
METRICS_FILE=".audit-metrics.json"

# --- Pre-flight checks ---
if [ ! -f "$LINT_INPUT" ] || [ ! -f "$TYPECHECK_INPUT" ]; then
    echo "Error: Input report files not found." >&2
    echo "Please run the sort-lint-audit.sh and sort-typecheck-audit.sh scripts first." >&2
    exit 1
fi

# --- Extract Metrics ---
# Check if lint has issues
if grep -q "✅ No Lint Issues Found" "$LINT_INPUT"; then
    LINT_TOTAL=0
else
    # Count total lint issues (only from Issue Count by Category section, excluding fully-excluded rules)
    # Excludes react-hooks/* rules which are all handled by exclusions config
    LINT_TOTAL=$(sed -n '/--- Issue Count by Category (ESLint Rule) ---/,/--- Detailed Lint Report ---/p' "$LINT_INPUT" | grep -E "^\s+[0-9]+" | grep -v "react-hooks/" | awk '{sum+=$1} END {print sum}')
fi

# Check if typecheck has errors
if grep -q "✅ No TypeScript Type Errors Found" "$TYPECHECK_INPUT"; then
    TYPECHECK_TOTAL=0
else
    # Count total typecheck errors
    TYPECHECK_TOTAL=$(grep -c "error TS" "$TYPECHECK_INPUT")
fi

# Get timestamp
CURRENT_TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

# Load previous metrics if they exist
PREV_LINT=0
PREV_TYPECHECK=0
if [ -f "$METRICS_FILE" ]; then
    PREV_LINT=$(grep '"lint_total"' "$METRICS_FILE" | grep -o '[0-9]*' | head -1)
    PREV_TYPECHECK=$(grep '"typecheck_total"' "$METRICS_FILE" | grep -o '[0-9]*' | head -1)
fi

# Calculate differences
LINT_DIFF=$((LINT_TOTAL - PREV_LINT))
TYPECHECK_DIFF=$((TYPECHECK_TOTAL - PREV_TYPECHECK))

# Format difference with +/- sign
format_diff() {
    local diff=$1
    if [ "$diff" -gt 0 ]; then
        echo "+$diff"
    elif [ "$diff" -lt 0 ]; then
        echo "$diff"
    else
        echo "0"
    fi
}

LINT_DIFF_STR=$(format_diff "$LINT_DIFF")
TYPECHECK_DIFF_STR=$(format_diff "$TYPECHECK_DIFF")

# Save current metrics for next run
cat > "$METRICS_FILE" <<EOF
{
  "timestamp": "$CURRENT_TIMESTAMP",
  "lint_total": $LINT_TOTAL,
  "typecheck_total": $TYPECHECK_TOTAL,
  "previous_lint": $PREV_LINT,
  "previous_typecheck": $PREV_TYPECHECK
}
EOF

# --- Report Generation ---
> "$OUTPUT_FILE"

# Main Title and TOC
cat <<EOF >> "$OUTPUT_FILE"
# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | $LINT_TOTAL | $LINT_DIFF_STR |
| TypeScript Errors | $TYPECHECK_TOTAL | $TYPECHECK_DIFF_STR |

*Last updated: $CURRENT_TIMESTAMP*

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

if grep -q "✅ No Lint Issues Found" "$LINT_INPUT"; then
    # No issues found
    echo "✅ **All files passed ESLint validation!**" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    grep "Last check:" "$LINT_INPUT" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
else
    # Files with Most Issues
    echo "### Files with Most Issues" >> "$OUTPUT_FILE"
    sed -n '/--- Files with Most Issues (Errors + Warnings) ---/,/--- Issue Count by Category (ESLint Rule) ---/p' "$LINT_INPUT" | \
        sed '1d;$d' | \
        grep -v "^\s*$" | \
        awk '{$1=$1; print "- " $0}' | \
        sed -E 's/(issues in )(.*)/\1`\2`/g' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    # Issue Count by Category
    echo "### Issue Count by Category" >> "$OUTPUT_FILE"
    echo "| Count | Rule ID |" >> "$OUTPUT_FILE"
    echo "|---|---|" >> "$OUTPUT_FILE"
    sed -n '/--- Issue Count by Category (ESLint Rule) ---/,/--- Detailed Lint Report ---/p' "$LINT_INPUT" | \
        sed '1d;$d' | \
        grep -v "^\s*$" | \
        awk '{$1=$1; count=$1; $1=""; rule=substr($0,2); printf "| %s | `%s` |\n", count, rule}' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    # Detailed Report
    echo "### Detailed Lint Report" >> "$OUTPUT_FILE"
    echo "\`\`\`" >> "$OUTPUT_FILE"
    sed -n '/--- Detailed Lint Report ---/,$p' "$LINT_INPUT" | sed '1d' >> "$OUTPUT_FILE"
    echo "\`\`\`" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi


# --- Typecheck Section ---
echo "## Typecheck Audit" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if grep -q "✅ No TypeScript Type Errors Found" "$TYPECHECK_INPUT"; then
    # No errors found
    echo "✅ **All files passed TypeScript type checking!**" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    grep "Last check:" "$TYPECHECK_INPUT" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
else
    # Files with Most Errors
    echo "### Files with Most Type Errors" >> "$OUTPUT_FILE"
    sed -n '/--- Files with Most Type Errors ---/,/--- Type Error Breakdown by Category ---/p' "$TYPECHECK_INPUT" | \
        sed '1d;$d' | \
        grep -v "^\s*$" | \
        awk '{$1=$1; print "- " $0}' | \
        sed -E 's/([0-9]+) (.*)/\1 errors in `\2`/g' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    # Error Breakdown
    echo "### Type Error Breakdown by Category" >> "$OUTPUT_FILE"
    echo "| Count | Error Code |" >> "$OUTPUT_FILE"
    echo "|---|---|" >> "$OUTPUT_FILE"
    sed -n '/--- Type Error Breakdown by Category ---/,/--- Detailed Type Error Report ---/p' "$TYPECHECK_INPUT" | \
        sed '1d;$d' | \
        grep -v "^\s*$" | \
        awk '{$1=$1; printf "| %s | `%s` |\n", $1, $2}' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    # Detailed Report
    echo "### Detailed Type Error Report" >> "$OUTPUT_FILE"
    echo "\`\`\`" >> "$OUTPUT_FILE"
    sed -n '/--- Detailed Type Error Report ---/,$p' "$TYPECHECK_INPUT" | sed '1d' >> "$OUTPUT_FILE"
    echo "\`\`\`" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi


echo "Combined markdown report generated at '$OUTPUT_FILE'"
