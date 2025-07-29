#!/bin/bash

set -e

ROADMAP_FILE="ROADMAP.md"
REPO="thef4tdaddy/violet-vault"
PROJECT_LABEL="roadmap"

echo "📌 Scanning for missing issues in $ROADMAP_FILE..."

# Read the file and find TODO placeholders
grep -B 2 "create GitHub issue" "$ROADMAP_FILE" | grep -E '^- \[ \] (\*\*.+\*\*|\[.+\]\(.+\))$' | while read -r line; do
  # Extract the issue title (remove markdown, supports **bold** and [Bracketed](link))
  title=$(echo "$line" | sed -E 's/^- \[ \] \*\*(.+)\*\*/\1/' | sed -E 's/^- \[ \] \[(.+)\]\(.+\)/\1/' | sed 's/^[[:space:]]*//')

  echo "🚀 Creating issue: $title"

  # Create issue via GitHub CLI and capture number
  ISSUE_URL=$(gh issue create \
    --title "$title" \
    --body "This issue was auto-created from the roadmap. Please add sub-tasks or planning notes here." \
    --label "$PROJECT_LABEL" \
    --repo "$REPO" \
    --assignee "@me" \
    --json number,url \
    | jq -r '.url')

  echo "🔗 Created: $ISSUE_URL"

  # Escape special characters for sed
  escaped_title=$(printf '%s\n' "$title" | sed -e 's/[]\/$*.^[]/\\&/g')

  # Insert link in-place (replaces placeholder comment)
  sed -i '' "s|^- \[ \] \*\*$escaped_title\*\*|[ ] [$title]($ISSUE_URL)|" "$ROADMAP_FILE"
  sed -i '' "s|\[\] \[$escaped_title\](.*)|[ ] [$title]($ISSUE_URL)|" "$ROADMAP_FILE"
  sed -i '' '/<!-- TODO: create GitHub issue and link here -->/d' "$ROADMAP_FILE"
done

echo "✅ All missing issues created and linked in $ROADMAP_FILE."