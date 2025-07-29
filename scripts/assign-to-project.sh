#!/bin/bash
echo "🐐 Running Baby Billy Freeman... (because it be misbehavin')"
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

ISSUES_KEYS=("24:In Progress:🟠 High" "25:To Do:🟡 Medium" "26:In Progress:🟠 High" "27:To Do:🟡 Medium" "28:To Do:🟡 Medium" "29:To Do:🟠 High" "30:To Do:🟠 High" "31:To Do:🟡 Medium" "32:To Do:🟡 Medium" "33:In Progress:🟠 High" "34:In Progress:🟠 High" "35:To Do:🟡 Medium" "36:To Do:🟡 Medium" "37:To Do:🟡 Medium" "38:To Do:🟡 Medium" "39:To Do:🟡 Medium" "40:To Do:🟡 Medium" "41:To Do:🟠 High" "42:To Do:⚪ Low" "43:To Do:⚪ Low" "44:To Do:🟠 High" "45:To Do:🟠 High" "46:To Do:🟠 High" "49:To Do:🟠 High" "50:To Do:🟠 High" "51:To Do:🟡 Medium" "52:To Do:🟠 High" "53:To Do:🟠 High" "54:To Do:🟠 High" "55:To Do:🟠 High" "56:To Do:🟠 High" "57:To Do:🟠 High" "58:To Do:🟡 Medium" "59:To Do:🟠 High" "60:To Do:🟠 High" "61:To Do:🟠 High" "62:To Do:🟠 High" "63:To Do:🟠 High" "64:To Do:🟠 High" "65:To Do:🟠 High" "66:To Do:🟠 High" "67:To Do:🟠 High" "68:To Do:🟠 High" "69:To Do:🟠 High" "70:To Do:🟠 High" "71:To Do:🟡 Medium" "72:To Do:🟡 Medium" "73:To Do:🟡 Medium" "74:To Do:🟡 Medium")

echo "📌 Adding issues to project $PROJECT_ID..."

for entry in "${ISSUES_KEYS[@]}"; do
  IFS=":" read -r ISSUE STATUS PRIORITY <<< "$entry"
  echo "🔗 Adding issue #$ISSUE to project..."
  gh project item-add "$PROJECT_ID" --owner thef4tdaddy --url "https://github.com/thef4tdaddy/violet-vault/issues/$ISSUE"
done

echo "✅ All issues added to project (without status/priority)!"
echo "🎤 Baby Billy out."