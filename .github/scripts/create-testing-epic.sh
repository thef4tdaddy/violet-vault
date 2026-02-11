#!/bin/bash
# Script to create comprehensive testing epic and sub-issues
# Usage: ./.github/scripts/create-testing-epic.sh

set -e

echo "🧪 Creating Comprehensive Testing Epic and Sub-Issues..."

# Master Epic
EPIC_URL=$(gh issue create --title "🧪 E2E Testing & QA - Comprehensive App Testing Epic" --body "# 🧪 E2E Testing & QA - Comprehensive App Testing Epic

**Status**: 🔄 ONGOING | **Type**: Epic
**Purpose**: Systematic testing and validation of all app features
**Last Created**: $(date)

## Overview

This epic tracks comprehensive end-to-end testing and QA for every major feature area of Violet Vault. Each sub-issue represents a distinct feature area with its own test checklist and reporting requirements.

## Testing Levels

Each sub-issue should cover:
- **Unit Tests**: Component/function level tests
- **Integration Tests**: Feature interaction tests
- **E2E Tests**: Full user workflow tests
- **Manual QA**: UI/UX validation

## Success Criteria

- [ ] All sub-issues have test cases defined
- [ ] All test cases pass
- [ ] All bugs documented and triaged
- [ ] Coverage reports generated
- [ ] Performance benchmarks recorded
- [ ] Accessibility validation complete

## Resources

- Test command: \`npm run test\`
- E2E command: \`npm run test:e2e\`
- Coverage report: \`npm run test:ci\`
- Lighthouse: \`npm run lighthouse\`

---

**To Regenerate This Epic:** Run \`.github/scripts/create-testing-epic.sh\`

🤖 Generated with [Claude Code](https://claude.com/claude-code)" --label "testing | grep -o 'https://github.com.*')

echo "✅ Epic created: $EPIC_URL"

# Core Features
echo "Creating Core Features sub-issues..."

gh issue create --title "Testing: Authentication & User Management" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Dashboard & Overview" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Budgeting & Envelopes" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Transactions & Ledger" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Bills & Recurring Payments" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Debts & Loans" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null

# Analytics & Insights
echo "Creating Analytics & Insights sub-issues..."

gh issue create --title "Testing: Analytics & Reporting" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Charts & Visualizations" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Trends & History" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null

# Advanced Features
echo "Creating Advanced Features sub-issues..."

gh issue create --title "Testing: Savings Goals" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Auto-Funding & Automation" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Receipt Scanning & OCR" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Data Sync & Cloud Storage" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null

# Platform Features
echo "Creating Platform Features sub-issues..."

gh issue create --title "Testing: Sharing & Collaboration" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Mobile Responsiveness" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: PWA & Offline Mode" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Security & Data Protection" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null

# System & DevOps
echo "Creating System & DevOps sub-issues..."

gh issue create --title "Testing: Performance & Load Testing" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Error Handling & Recovery" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Accessibility (a11y)" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null
gh issue create --title "Testing: Cross-Browser Compatibility" --body "Parent Epic: $EPIC_URL" --label "testing" > /dev/null

echo ""
echo "✅ Testing Epic created successfully!"
echo "📊 Total sub-issues: 20"
echo "🔗 Epic URL: $EPIC_URL"
echo ""
echo "Next steps:"
echo "1. Go through each sub-issue and add detailed test cases"
echo "2. Assign sub-issues to team members or use for test automation"
echo "3. Track progress using the epic view"
echo "4. Generate reports from completed sub-issues"
