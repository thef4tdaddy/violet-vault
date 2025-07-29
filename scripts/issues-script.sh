#!/bin/bash

REPO="thef4tdaddy/violet-vault"

# Create priority labels
echo "🔖 Creating labels (if not present)..."
gh label create "🔴 Critical" --color "B60205" --description "Highest priority" --repo $REPO || true
gh label create "🟠 High" --color "D93F0B" --description "Important features" --repo $REPO || true
gh label create "🟡 Medium" --color "FBCA04" --description "Mid-tier priority" --repo $REPO || true
gh label create "⚪ Low" --color "CCCCCC" --description "Low priority" --repo $REPO || true

# Define roadmap issues: "Title:::Label:::Description"
issues=(
  "Zustand state management:::🔴 Critical:::Core session and UI state handler"
  "Encrypted edit history log:::🔴 Critical:::Audit trail with actor, timestamp, encrypted diff"
  "Dexie.js for offline cache:::🔴 Critical:::Local encrypted caching and offline queueing"
  "Push notification (FCM):::🔴 Critical:::Web push reminders like payday/ledger alerts"
  "Expected payday support:::🔴 Critical:::Drives notification logic"
  "Transaction CRUD:::🔴 Critical:::Ledger entry add/edit/delete"
  "Password rotation:::🟠 High:::Re-encrypt data on password change"
  "Customizable profiles:::🟠 High:::Name/avatar per user profile"
  "PWA support (vite-plugin-pwa):::🟠 High:::Installable app with offline fallback"
  "TanStack Query:::🟠 High:::Smart caching of encrypted Firestore data"
  "Amazon receipt import:::🟠 High:::IMAP scraping to enrich imports"
  "Smart category system:::🟠 High:::Suggestions, bulk edit, analytics integration"
  "Mobile layout optimization:::🟠 High:::Touch-friendly responsive views"
  "Transaction log archiving:::🟡 Medium:::Delete/squash old data while keeping analytics"
  "Edit history viewer:::🟡 Medium:::UI for viewing change log"
  "Analytics improvements:::🟡 Medium:::Better trends, insights"
  "Accessibility (ARIA, SR):::🟡 Medium:::Keyboard nav, screen readers, color contrast"
  "Performance tuning:::🟡 Medium:::Lazy loading, pagination, bundle split"
  "Local-only mode:::⚪ Low:::Budget without cloud"
  "Exportable encryption key:::⚪ Low:::For backup or syncing"
  "Auto-funding rules:::⚪ Low:::If X, then fund envelope Y"
  "Predictive analytics:::⚪ Low:::Budget predictions based on history"
  "Advanced reporting:::⚪ Low:::Custom exports, scheduled reports"
)

echo -e "\n📦 Creating issues...\n"

for entry in "${issues[@]}"; do
  IFS=":::" read -r title label desc <<< "$entry"

  echo "➡️  Creating issue: $title"
  gh issue create --repo "$REPO" --title "$title" --body "$desc" --label "$label"
  echo "✅ Created: $title"
done

echo -e "\n🧾 All issues created! Copy the numbers and send them back so we can add them to the project board.\n"