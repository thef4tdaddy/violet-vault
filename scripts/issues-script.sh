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
  "Transaction CRUD:::🔴 Critical:::Ledger entry add/edit/delete"
  "Amazon receipt import:::🔴 Critical:::IMAP scraping to enrich imports"
  "Smart category system:::🔴 Critical:::Suggestions, bulk edit, analytics integration"
  "Zustand state management:::🔴 Critical:::Core session and UI state handler"
  "Dexie.js for offline cache:::🔴 Critical:::Local encrypted caching and offline queueing"
  "TanStack Query integration:::🔴 Critical:::Smart caching of encrypted Firestore data"
  "Smart Category Management:::🔴 Critical:::Integrate SmartCategoryManager into analytics dashboard; Add category optimization suggestions; Implement bulk category updates"
  "Encrypted edit history log:::🔴 Critical:::Audit trail with actor, timestamp, encrypted diff"
  "Expected payday support:::🔴 Critical:::Drives notification logic"
  "Push notification (FCM):::🔴 Critical:::Web push reminders like payday/ledger alerts"
  "Mobile layout optimization:::🟠 High:::Touch-friendly responsive views"
  "Accessibility Enhancements:::🟠 High:::Add ARIA labels and keyboard navigation; Implement screen reader support; Ensure color contrast compliance"
  "Performance tuning:::🟠 High:::Implement lazy loading for large transaction lists; Optimize bundle size with code splitting; Add data pagination"
  "Customizable profiles:::🟠 High:::Name/avatar per user profile"
  "Password rotation:::🟠 High:::Re-encrypt data on password change"
  "PWA support (vite-plugin-pwa):::🟠 High:::Installable app with offline fallback"
  "Transaction log archiving:::🟡 Medium:::Delete/squash old data while keeping analytics"
  "Edit history viewer:::🟡 Medium:::UI for viewing change log"
  "Analytics improvements:::🟡 Medium:::Better trends, insights"
  "Predictive Analytics:::🟡 Medium:::Spending trend predictions using historical data; Budget variance alerts and recommendations; Seasonal spending pattern recognition"
  "Advanced Reporting:::🟡 Medium:::Custom date range reports; Export functionality (PDF, CSV, Excel); Scheduled report generation"
  "Goal Tracking Enhancements:::🟡 Medium:::Milestone-based savings goals; Automatic goal adjustments based on spending; Visual progress tracking with charts"
  "Role-Based Access Control:::🟡 Medium:::Admin/viewer/editor roles for shared budgets; Permission-based feature access; Audit logs for security compliance"
  "Team Communication:::🟡 Medium:::In-app messaging for budget discussions; Comment system for transactions and envelopes; Notification system for important changes"
  "Open Banking API:::🟡 Medium:::Automatic transaction import from banks; Real-time balance synchronization; Account reconciliation tools"
  "Local-only mode:::⚪ Low:::Budget without cloud"
  "Exportable encryption key:::⚪ Low:::For backup or syncing"
  "Receipt Scanning:::⚪ Low:::OCR-powered receipt processing; Automatic expense categorization; Digital receipt storage"
  "Intelligent Budgeting Assistant:::⚪ Low:::AI-powered budget recommendations; Spending habit analysis and suggestions; Automated envelope rebalancing"
  "Auto-funding rules:::⚪ Low:::If X, then fund envelope Y"
  "Predictive analytics:::⚪ Low:::Budget predictions based on history"
  "Advanced reporting:::⚪ Low:::Custom exports, scheduled reports"
  "Financial Health Scoring:::⚪ Low:::Credit score integration; Debt management recommendations; Investment opportunity suggestions"
  "Mobile Applications:::⚪ Low:::Native iOS and Android apps; Offline-first architecture; Push notifications for budget alerts"
  "Desktop Applications:::⚪ Low:::Electron-based desktop apps; Enhanced keyboard shortcuts; Local file system integration"
  "Business Budgeting:::⚪ Low:::Multi-department budget management; Expense approval workflows; Corporate reporting tools"
  "API Platform:::⚪ Low:::Public API; Webhook support; Developer documentation and SDKs"
  "Component Refactoring:::⚪ Low:::Standardize patterns; Add TS migration; Add test coverage; Fix React Fast Refresh warnings"
  "State Management Optimization:::⚪ Low:::Evaluate Redux or Zustand; Optimistic updates; Add persistence and hydration"
  "CI/CD Pipeline Enhancement:::⚪ Low:::Automated testing; Security scanning; Performance monitoring"
  "Infrastructure Scaling:::⚪ Low:::CDN setup; DB optimization; Horizontal scaling preparation"
  "Advanced Security Features:::⚪ Low:::MFA; Session improvements; Pen testing"
  "Compliance & Privacy:::⚪ Low:::GDPR compliance; SOC 2; Privacy policy and data governance"
  "Design System Expansion:::⚪ Low:::Component library; Dark mode; Theming support"
  "Advanced Visualizations:::⚪ Low:::Interactive charts; 3D visualizations; Animated transitions"
  "User Testing Program:::⚪ Low:::Usability testing; A/B testing; Feedback collection"
  "Accessibility Standards:::⚪ Low:::WCAG 2.1 compliance; Screen reader optimization; Keyboard nav improvements"
)

echo -e "\n📦 Creating issues...\n"

# Fetch existing issue titles to avoid duplicates
existing_titles=$(gh issue list --repo "$REPO" --limit 500 --json title | jq -r '.[].title')

for entry in "${issues[@]}"; do
  IFS=":::" read -r title label desc <<< "$entry"

  if echo "$existing_titles" | grep -Fxq "$title"; then
    echo "⏭️  Skipping duplicate: $title"
    continue
  fi

  echo "➡️  Creating issue: $title"
  gh issue create --repo "$REPO" --title "$title" --body "$desc" --label "$label"
  echo "✅ Created: $title"
done

echo -e "\n🧾 All issues created! Copy the numbers and send them back so we can add them to the project board.\n"