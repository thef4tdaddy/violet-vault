#!/bin/bash
# scripts/lint-python.sh - Robust wrapper for Ruff/Mypy inside lint-staged

MODE=$1
shift # The rest of the arguments are the files passed by lint-staged

# Discover ruff
if [ -f ".venv/bin/ruff" ]; then
    RUFF_CMD=".venv/bin/ruff"
elif command -v "ruff" &> /dev/null; then
    RUFF_CMD="ruff"
elif python3 -m ruff --version &> /dev/null; then
    RUFF_CMD="python3 -m ruff"
else
    echo "Error: ruff not found globally, in .venv, or as python module"
    exit 1
fi

if [ "$MODE" == "check" ]; then
    $RUFF_CMD check "$@"
elif [ "$MODE" == "format" ]; then
    $RUFF_CMD format "$@"
else
    echo "Unknown mode: $MODE"
    exit 1
fi
