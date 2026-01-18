#!/bin/bash

# This script combines the text-based lint and typecheck reports into a single markdown file.
# It also generates a summary table with current counts and compares with previous audit run.

# --- Configuration ---
LINT_INPUT="docs/audits/sorted-lint-report.txt"
TYPECHECK_INPUT="docs/audits/sorted-typecheck-report.txt"
TYPECHECK_STRICT_INPUT="docs/audits/sorted-typecheck-strict-report.txt"
OUTPUT_FILE="docs/audits/audit-report.md"
METRICS_FILE=".audit-metrics.json"

# --- Pre-flight checks ---
if [ ! -f "$LINT_INPUT" ] || [ ! -f "$TYPECHECK_INPUT" ]; then
    echo "Error: Input report files not found." >&2
    echo "Please run the sort-lint-audit.sh and sort-typecheck-audit.sh scripts first." >&2
    exit 1
fi

# Strict mode report is optional
if [ ! -f "$TYPECHECK_STRICT_INPUT" ]; then
    echo "Warning: Strict mode report not found. Skipping strict mode section." >&2
    HAS_STRICT_REPORT=false
else
    HAS_STRICT_REPORT=true
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

# Check if strict mode has errors
if [ "$HAS_STRICT_REPORT" = true ]; then
    if grep -q "✅ No TypeScript Strict Mode Errors Found" "$TYPECHECK_STRICT_INPUT"; then
        TYPECHECK_STRICT_TOTAL=0
    else
        # Count total strict mode errors
        TYPECHECK_STRICT_TOTAL=$(grep -c "error TS" "$TYPECHECK_STRICT_INPUT")
    fi
else
    TYPECHECK_STRICT_TOTAL="N/A"
fi

# Get timestamp
CURRENT_TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

# Load previous metrics if they exist
PREV_LINT=0
PREV_TYPECHECK=0
PREV_TYPECHECK_STRICT=0
if [ -f "$METRICS_FILE" ]; then
    PREV_LINT=$(grep '"lint_total"' "$METRICS_FILE" | grep -o '[0-9]*' | head -1)
    PREV_TYPECHECK=$(grep '"typecheck_total"' "$METRICS_FILE" | grep -o '[0-9]*' | head -1)
    PREV_TYPECHECK_STRICT=$(grep '"typecheck_strict_total"' "$METRICS_FILE" | grep -o '[0-9]*' | head -1)
fi

# Calculate differences
LINT_DIFF=$((LINT_TOTAL - PREV_LINT))
TYPECHECK_DIFF=$((TYPECHECK_TOTAL - PREV_TYPECHECK))
if [ "$TYPECHECK_STRICT_TOTAL" != "N/A" ]; then
    TYPECHECK_STRICT_DIFF=$((TYPECHECK_STRICT_TOTAL - PREV_TYPECHECK_STRICT))
else
    TYPECHECK_STRICT_DIFF="N/A"
fi

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
if [ "$TYPECHECK_STRICT_DIFF" != "N/A" ]; then
    TYPECHECK_STRICT_DIFF_STR=$(format_diff "$TYPECHECK_STRICT_DIFF")
else
    TYPECHECK_STRICT_DIFF_STR="N/A"
fi

# Save current metrics for next run
cat > "$METRICS_FILE" <<EOF
{
  "timestamp": "$CURRENT_TIMESTAMP",
  "lint_total": $LINT_TOTAL,
  "typecheck_total": $TYPECHECK_TOTAL,
  "typecheck_strict_total": $([ "$TYPECHECK_STRICT_TOTAL" = "N/A" ] && echo 0 || echo $TYPECHECK_STRICT_TOTAL),
  "previous_lint": $PREV_LINT,
  "previous_typecheck": $PREV_TYPECHECK,
  "previous_typecheck_strict": $PREV_TYPECHECK_STRICT
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
| TypeScript Strict Mode Errors | $TYPECHECK_STRICT_TOTAL | $TYPECHECK_STRICT_DIFF_STR |

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
- [Typecheck Strict Mode Audit](#typecheck-strict-mode-audit)
  - [Files with Most Strict Mode Errors](#files-with-most-strict-mode-errors)
  - [Strict Mode Error Breakdown](#strict-mode-error-breakdown)
  - [Detailed Strict Mode Report](#detailed-strict-mode-report)

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


# --- Typecheck Strict Mode Section ---
if [ "$HAS_STRICT_REPORT" = true ]; then
    echo "## Typecheck Strict Mode Audit" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    if grep -q "✅ No TypeScript Strict Mode Errors Found" "$TYPECHECK_STRICT_INPUT"; then
        # No errors found
        echo "✅ **All files passed TypeScript strict mode checking!**" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        grep "Last check:" "$TYPECHECK_STRICT_INPUT" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    else
        # Files with Most Errors
        echo "### Files with Most Strict Mode Errors" >> "$OUTPUT_FILE"
        sed -n '/--- Files with Most Strict Mode Errors ---/,/--- Strict Mode Error Breakdown by Category ---/p' "$TYPECHECK_STRICT_INPUT" | \
            sed '1d;$d' | \
            grep -v "^\s*$" | \
            awk '{$1=$1; print "- " $0}' | \
            sed -E 's/([0-9]+) (.*)/\1 errors in `\2`/g' >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"

        # Error Breakdown
        echo "### Strict Mode Error Breakdown" >> "$OUTPUT_FILE"
        echo "| Count | Error Code |" >> "$OUTPUT_FILE"
        echo "|---|---|" >> "$OUTPUT_FILE"
        sed -n '/--- Strict Mode Error Breakdown by Category ---/,/--- Detailed Strict Mode Error Report ---/p' "$TYPECHECK_STRICT_INPUT" | \
            sed '1d;$d' | \
            grep -v "^\s*$" | \
            awk '{$1=$1; printf "| %s | `%s` |\n", $1, $2}' >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"

        # Detailed Report
        echo "### Detailed Strict Mode Report" >> "$OUTPUT_FILE"
        echo "\`\`\`" >> "$OUTPUT_FILE"
        sed -n '/--- Detailed Strict Mode Error Report ---/,$p' "$TYPECHECK_STRICT_INPUT" | sed '1d' >> "$OUTPUT_FILE"
        echo "\`\`\`" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
fi


echo "Combined markdown report generated at '$OUTPUT_FILE'"
