#!/bin/bash

# Script to resolve audit report merge conflicts
# Usage: ./scripts/resolve-audit-conflict.sh

set -e

AUDIT_FILE="docs/audits/audit-report.md"

if [ ! -f "$AUDIT_FILE" ]; then
  echo "Error: $AUDIT_FILE not found"
  exit 1
fi

# Check if file has conflict markers
if grep -q '^<<<<<<< ' "$AUDIT_FILE"; then
  echo "Conflict detected in $AUDIT_FILE"
  echo "Resolving by using develop branch version..."
  
  # Fetch latest develop
  git fetch origin develop:develop 2>/dev/null || true
  
  # Use theirs (develop) version
  git checkout --theirs "$AUDIT_FILE"
  git add "$AUDIT_FILE"
  
  echo "✅ Conflict resolved. File staged for commit."
  echo "Run: git commit -m 'chore: resolve audit report conflict'"
else
  echo "No conflict markers found in $AUDIT_FILE"
fi

