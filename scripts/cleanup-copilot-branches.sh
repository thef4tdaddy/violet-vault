#!/bin/bash
# Cleanup local copilot branches
# Usage: ./scripts/cleanup-copilot-branches.sh [--dry-run]

set -e

DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
  DRY_RUN=true
  echo "🔍 DRY RUN MODE - No branches will be deleted"
  echo ""
fi

echo "🧹 Cleaning up local copilot branches..."
echo ""

# Get current branch to avoid deleting it
CURRENT_BRANCH=$(git branch --show-current)

# Get all local copilot branches
COPILOT_BRANCHES=$(git branch | grep 'copilot/' | tr -d ' *' || true)

if [ -z "$COPILOT_BRANCHES" ]; then
  echo "✅ No local copilot branches found"
  exit 0
fi

DELETED_COUNT=0
SKIPPED_COUNT=0

for BRANCH in $COPILOT_BRANCHES; do
  if [ "$BRANCH" = "$CURRENT_BRANCH" ]; then
    echo "⏭️  Skipping $BRANCH (current branch)"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    continue
  fi
  
  if [ "$DRY_RUN" = true ]; then
    echo "🗑️  Would delete: $BRANCH"
    DELETED_COUNT=$((DELETED_COUNT + 1))
  else
    echo "🗑️  Deleting: $BRANCH"
    git branch -D "$BRANCH"
    DELETED_COUNT=$((DELETED_COUNT + 1))
  fi
done

echo ""
echo "📊 Summary"
echo "=========="
if [ "$DRY_RUN" = true ]; then
  echo "Would delete: $DELETED_COUNT branches"
else
  echo "Deleted: $DELETED_COUNT branches"
fi
echo "Skipped: $SKIPPED_COUNT branches"
echo ""
echo "✅ Done!"
