#!/bin/bash

# Generate GitHub issues for TypeScript strict mode errors
# This script wraps the Node.js script and provides a convenient interface

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Check if strict mode results exist
if [ ! -f "docs/audits/typecheck-strict-results.txt" ]; then
  echo "❌ Error: Strict mode results file not found"
  echo "   Run: npm run typecheck:strict"
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

echo "🚀 Generating GitHub issues for strict mode errors..."
echo ""
echo "Configuration:"
echo "  Repository: $GITHUB_REPO"
echo "  Results file: docs/audits/typecheck-strict-results.txt"
echo "  Using: GitHub CLI (gh)"
echo ""

# Run the Node.js script
node "$SCRIPT_DIR/generate-strict-mode-issues.js"

echo ""
echo "✅ Done!"
