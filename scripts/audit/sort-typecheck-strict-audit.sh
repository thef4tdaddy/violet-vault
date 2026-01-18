#!/bin/bash

# This script processes the TypeScript strict mode compiler output and creates a sorted, readable report.

# --- Configuration ---
INPUT_FILE="docs/audits/typecheck-strict-results.txt"
OUTPUT_FILE="docs/audits/sorted-typecheck-strict-report.txt"
PROJECT_ROOT="/Users/thef4tdaddy/Git/"

# --- Pre-flight checks ---
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Strict mode typecheck results file not found." >&2
    exit 1
fi

# --- Report Generation ---
> "$OUTPUT_FILE"

# Count total errors
TOTAL_ERRORS=$(grep -c "error TS" "$INPUT_FILE" 2>/dev/null || echo 0)

if [ "$TOTAL_ERRORS" -eq 0 ]; then
    # No errors found
    echo "✅ No TypeScript Strict Mode Errors Found" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "All files passed TypeScript strict mode type checking!" >> "$OUTPUT_FILE"
    echo "Last check: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" >> "$OUTPUT_FILE"
else
    # Section 1: Summary of files with the most errors.
    echo "--- Files with Most Strict Mode Errors ---" >> "$OUTPUT_FILE"
    grep -oE '^[a-zA-Z0-9/._-]+' "$INPUT_FILE" | sed "s|$PROJECT_ROOT||" | sort | uniq -c | sort -nr >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    # Section 2: Breakdown of errors by category.
    echo "--- Strict Mode Error Breakdown by Category ---" >> "$OUTPUT_FILE"
    grep -oE 'TS[0-9]+' "$INPUT_FILE" | sort | uniq -c | sort -nr >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    # Section 3: A detailed, classic-style report.
    echo "--- Detailed Strict Mode Error Report ---" >> "$OUTPUT_FILE"
    cat "$INPUT_FILE" | sed "s|$PROJECT_ROOT||" >> "$OUTPUT_FILE"
fi

# --- Completion ---
echo "Sorted strict mode typecheck report has been generated at '$OUTPUT_FILE'"

