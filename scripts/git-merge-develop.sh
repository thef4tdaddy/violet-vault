#!/bin/bash
# Merge driver that always uses develop branch version of audit-report.md
# This ensures develop's version always wins in conflicts
# Git passes: %O (ancestor) %A (ours) %B (theirs) %P (path)

FILE_PATH="$4"

# Determine which version is from develop
# If we're merging develop into current branch, theirs is develop
# If we're merging current branch into develop, ours is develop
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

# Try to get develop branch version directly
if git show develop:"$FILE_PATH" > /dev/null 2>&1; then
  git show develop:"$FILE_PATH"
  exit 0
fi

# Fallback: if we're on develop, use ours; otherwise use theirs
# (This handles the case where develop branch isn't available locally)
if [ "$CURRENT_BRANCH" = "develop" ]; then
  cat "$2"  # ours (develop)
else
  cat "$3"  # theirs (assuming we're merging develop in)
fi
exit 0

