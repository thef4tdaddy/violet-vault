#!/bin/bash

# Generate GitHub issues for TypeScript errors (normal or strict mode)
# This script wraps the Node.js script and provides a convenient interface

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Parse arguments
MODE="${1:-normal}" # 'normal' or 'strict'
MAX_ERRORS="${2:-}" # Optional: limit to last N errors
ERRORS_PER_ISSUE="${3:-}" # Optional: number of errors per issue (defaults to 120)

# Determine which results file to use
if [ "$MODE" = "strict" ]; then
  RESULTS_FILE="docs/audits/typecheck-strict-results.txt"
  MODE_LABEL="strict mode"
else
  RESULTS_FILE="docs/audits/typecheck-results.txt"
  MODE_LABEL="normal"
fi

# Check if results file exists
if [ ! -f "$RESULTS_FILE" ]; then
  echo "❌ Error: ${MODE_LABEL} results file not found: $RESULTS_FILE"
  if [ "$MODE" = "strict" ]; then
    echo "   Run: npm run typecheck:strict"
  else
    echo "   Run: npm run typecheck"
  fi
  exit 1
fi

# Check for GitHub CLI
if ! command -v gh &> /dev/null; then
  echo "❌ Error: GitHub CLI (gh) is required but not installed"
  echo ""
  echo "Install it with:"
  echo "  brew install gh"
  echo "  # or visit: https://cli.github.com/"
  exit 1
fi

# Check if gh is authenticated
if ! gh auth status &> /dev/null; then
  echo "❌ Error: GitHub CLI is not authenticated"
  echo ""
  echo "Authenticate with:"
  echo "  gh auth login"
  exit 1
fi

# Optional: Set GitHub repo (defaults to thef4tdaddy/violet-vault)
export GITHUB_REPO="${GITHUB_REPO:-thef4tdaddy/violet-vault}"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
  echo "❌ Error: Node.js is required but not installed"
  exit 1
fi

# Check if fetch is available in Node.js (Node 18+)
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "⚠️  Warning: Node.js 18+ is recommended for native fetch support"
  echo "   You may need to install node-fetch: npm install node-fetch"
fi

echo "🚀 Generating GitHub issues for ${MODE_LABEL} TypeScript errors..."
echo ""

# Prompt for errors per issue if not provided
if [ -z "$ERRORS_PER_ISSUE" ]; then
  echo "How many problems per issue? (default: 120)"
  read -r ERRORS_PER_ISSUE_INPUT
  if [ -n "$ERRORS_PER_ISSUE_INPUT" ]; then
    ERRORS_PER_ISSUE="$ERRORS_PER_ISSUE_INPUT"
  else
    ERRORS_PER_ISSUE="120"
  fi
fi

# Validate ERRORS_PER_ISSUE is a number
if ! [[ "$ERRORS_PER_ISSUE" =~ ^[0-9]+$ ]]; then
  echo "❌ Error: Errors per issue must be a positive number"
  exit 1
fi

echo ""
echo "Configuration:"
echo "  Repository: $GITHUB_REPO"
echo "  Results file: $RESULTS_FILE"
echo "  Mode: $MODE_LABEL"
echo "  Errors per issue: $ERRORS_PER_ISSUE"
if [ -n "$MAX_ERRORS" ]; then
  echo "  Max errors: $MAX_ERRORS (last N errors)"
fi
echo "  Using: GitHub CLI (gh)"
echo ""

# Run the Node.js script
# Pass arguments: MODE, MAX_ERRORS (or empty), ERRORS_PER_ISSUE
# Always pass all three for consistent parsing
node "$SCRIPT_DIR/generate-typescript-issues.js" "$MODE" "${MAX_ERRORS:-}" "${ERRORS_PER_ISSUE:-}"

echo ""
echo "✅ Done!"

