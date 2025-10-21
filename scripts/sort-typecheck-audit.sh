#!/bin/bash

# This script processes the TypeScript compiler output and creates a sorted, readable report.

# --- Configuration ---
INPUT_FILE="docs/audits/typecheck-results.txt"
OUTPUT_FILE="docs/audits/sorted-typecheck-report.txt"
PROJECT_ROOT="/Users/thef4tdaddy/Git/"

# --- Pre-flight checks ---
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Typecheck results file not found." >&2
    exit 1
fi

# --- Report Generation ---
> "$OUTPUT_FILE"

# Section 1: Summary of files with the most errors.
echo "--- Files with Most Type Errors ---" >> "$OUTPUT_FILE"
grep -oE '^[a-zA-Z0-9/._-]+' "$INPUT_FILE" | sed "s|$PROJECT_ROOT||" | sort | uniq -c | sort -nr >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Section 2: Breakdown of errors by category.
echo "--- Type Error Breakdown by Category ---" >> "$OUTPUT_FILE"
grep -oE 'TS[0-9]+' "$INPUT_FILE" | sort | uniq -c | sort -nr >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Section 3: A detailed, classic-style report.
echo "--- Detailed Type Error Report ---" >> "$OUTPUT_FILE"
cat "$INPUT_FILE" | sed "s|$PROJECT_ROOT||" >> "$OUTPUT_FILE"

# --- Completion ---
echo "Sorted typecheck report has been generated at '$OUTPUT_FILE'"
