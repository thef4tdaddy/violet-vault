#!/bin/bash

# This script processes the TypeScript compiler output and creates a sorted, readable report.

# --- Configuration ---
# The location of the raw output from the typecheck command
INPUT_FILE="docs/audits/typecheck-results.txt"
# The location for the generated report
OUTPUT_FILE="docs/audits/sorted-typecheck-report.txt"

# --- Pre-flight checks ---
# Check if the input file exists.
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Typecheck results file not found at '$INPUT_FILE'" >&2
    echo "Please run 'npm run typecheck:json' first." >&2
    exit 1
fi

# --- Report Generation ---
# Clear the output file to ensure a fresh report.
> "$OUTPUT_FILE"

# Section 1: Summary of files with the most errors.
echo "--- Files with Most Type Errors ---" >> "$OUTPUT_FILE"
grep -oE '^[a-zA-Z0-9/._-]+' "$INPUT_FILE" | sort | uniq -c | sort -nr >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Section 2: Breakdown of errors by category.
echo "--- Type Error Breakdown by Category ---" >> "$OUTPUT_FILE"
grep -oE 'TS[0-9]+' "$INPUT_FILE" | sort | uniq -c | sort -nr >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Section 3: A detailed, classic-style report.
echo "--- Detailed Type Error Report ---" >> "$OUTPUT_FILE"
cat "$INPUT_FILE" >> "$OUTPUT_FILE"

# --- Completion ---
echo "Sorted typecheck report has been generated at '$OUTPUT_FILE'"
