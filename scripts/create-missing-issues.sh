#!/bin/bash

set -e

ROADMAP_FILE="ROADMAP.md"
REPO="thef4tdaddy/violet-vault"
PROJECT_LABEL="roadmap"

echo "📌 Scanning for missing issues in $ROADMAP_FILE..."

# Read the file and find lines with unchecked items that are not yet linked
grep -E '^- \[ \] (\*\*.+\*\*|\[.+\](\(\s*\)))' "$ROADMAP_FILE" | while read -r line; do
  # Extract the issue title
  title=$(echo "$line" | sed -E 's/^- \[ \] \*\*(.+)\*\*/\1/' | sed -E 's/^- \[ \] \[(.+)\]\(\s*\)/\1/' | sed 's/^[[:space:]]*//')

  echo "🚀 Creating issue: $title"

  issue_output=$(gh issue create \
    --title "$title" \
    --body "This issue was auto-created from the roadmap. Please add sub-tasks or planning notes here." \
    --label "$PROJECT_LABEL" \
    --repo "$REPO" \
    --assignee "@me")

  ISSUE_URL=$(echo "$issue_output" | grep -Eo 'https://github\.com/[^ ]+/issues/[0-9]+')

  echo "🔗 Created: $ISSUE_URL"

  # Escape for sed
  escaped_title=$(printf '%s\n' "$title" | sed -e 's/[]\/$*.^[]/\\&/g')

  # Replace with linked item
  sed -i '' "s|^- \[ \] \*\*$escaped_title\*\*|[ ] [$title]($ISSUE_URL)|" "$ROADMAP_FILE"
  sed -i '' "s|^- \[ \] \[$escaped_title\](\s*)|[ ] [$title]($ISSUE_URL)|" "$ROADMAP_FILE"
done

echo "✅ All missing issues created and linked in $ROADMAP_FILE."