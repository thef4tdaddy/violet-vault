#!/bin/bash
echo "🟢 Script started"


# Set these to your repo and project
REPO="thef4tdaddy/violet-vault"
## echo "🔍 Fetching project list..."
## gh project list --owner thef4tdaddy --format json

PROJECT_ID="3"
echo "📁 Using hardcoded project ID: $PROJECT_ID"

if [[ -z "$PROJECT_ID" ]]; then
  echo "❌ Project not found. Make sure 'VioletVault Roadmap' exists."
  exit 1
fi

ISSUES_KEYS=("24:In Progress" "25:To Do" "26:In Progress" "27:To Do" "28:To Do" "29:To Do" "30:To Do" "31:To Do" "32:To Do" "33:In Progress" "34:In Progress" "35:To Do" "36:To Do" "37:To Do" "38:To Do" "39:To Do" "40:To Do" "41:To Do" "42:To Do" "43:To Do" "44:To Do" "45:To Do" "46:To Do")

echo "📌 Adding issues to project $PROJECT_ID..."

for entry in "${ISSUES_KEYS[@]}"; do
  IFS=":" read -r ISSUE STATUS <<< "$entry"
  echo "🔗 Adding issue #$ISSUE to project with status '$STATUS'..."
  gh project item-add "$PROJECT_ID" --owner thef4tdaddy --url "https://github.com/thef4tdaddy/violet-vault/issues/$ISSUE" > /dev/null

  FIELDS_JSON=$(gh project field-list "$PROJECT_ID" --owner thef4tdaddy --format json)
  COLUMN_ID=$(echo "$FIELDS_JSON" | jq -r '.[] | select(.name=="Status") | .id')
  STATUS_ID=$(echo "$FIELDS_JSON" | jq -r '.[] | select(.name=="Status") | .options[] | select(.name=="'"$STATUS"'") | .id')

  if [[ -n "$COLUMN_ID" && -n "$STATUS_ID" ]]; then
    ITEM_ID=$(gh project item-list "$PROJECT_ID" --owner thef4tdaddy --format json | jq -r ".[] | select(.content.url | contains(\"$ISSUE\")) | .id")
    gh project item-edit "$PROJECT_ID" --owner thef4tdaddy --id "$ITEM_ID" --field-id "$COLUMN_ID" --value-id "$STATUS_ID" > /dev/null
  else
    echo "⚠️  Could not set status for issue #$ISSUE"
  fi
done

echo "✅ All issues added to project!"