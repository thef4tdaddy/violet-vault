#!/bin/bash

# Script to create comprehensive testing epic with all sub-issues
# Usage: ./scripts/create-testing-epic.sh

set -e

echo "🧪 Creating Comprehensive Testing Epic..."

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Feature areas to test
declare -a FEATURES=(
  "Authentication & User Management"
  "Dashboard & Overview"
  "Budgeting & Envelopes"
  "Transactions & Ledger"
  "Bills & Recurring Payments"
  "Debts & Loans"
  "Analytics & Reporting"
  "Charts & Visualizations"
  "Trends & History"
  "Savings Goals"
  "Auto-Funding & Automation"
  "Receipt Scanning & OCR"
  "Data Sync & Cloud Storage"
  "Sharing & Collaboration"
  "Mobile Responsiveness"
  "PWA & Offline Mode"
  "Security & Data Protection"
  "Performance & Load Testing"
  "Error Handling & Recovery"
  "Accessibility (a11y)"
  "Cross-Browser Compatibility"
)

# Test scopes for each feature
declare -A SCOPES=(
  ["Authentication & User Management"]="User registration and signup;Login and logout flows;Password reset and recovery;Account settings and profile management;Session management and timeout;Multi-device authentication;Security token validation"
  ["Dashboard & Overview"]="Dashboard layout and widgets;Summary cards accuracy;Real-time data updates;Quick actions functionality;Navigation between views;Mobile dashboard layout;Widget customization"
  ["Budgeting & Envelopes"]="Envelope creation and editing;Fund allocation;Envelope categories;Budget tracking;Envelope limits and warnings;Quick fund actions;Envelope history"
  ["Transactions & Ledger"]="Transaction creation;Transaction editing and deletion;Transaction filtering and search;Transaction categorization;Envelope assignment;Split transactions;Transaction import"
  ["Bills & Recurring Payments"]="Bill creation and management;Recurring bill setup;Bill payment tracking;Due date reminders;Bill discovery;Bulk bill operations;Bill envelope connections"
  ["Debts & Loans"]="Debt tracking;Payment scheduling;Interest calculations;Payoff strategies;Debt progress visualization;Multiple debt management;Debt consolidation"
  ["Analytics & Reporting"]="Spending analytics;Category analysis;Budget performance metrics;Custom reports;Data export;Report scheduling;Trend identification"
  ["Charts & Visualizations"]="Spending charts;Income vs expense visualization;Category breakdowns;Trend lines;Interactive charts;Chart exports;Mobile chart rendering"
  ["Trends & History"]="Historical data tracking;Trend analysis;Pattern recognition;Forecasting;Year-over-year comparisons;Budget history;Data archiving"
  ["Savings Goals"]="Goal creation and editing;Progress tracking;Contribution management;Goal prioritization;Target date calculations;Auto-distribution;Goal completion"
  ["Auto-Funding & Automation"]="Auto-funding rule creation;Condition-based funding;Scheduled funding;Rule triggers and actions;Funding automation accuracy;Rule management;Execution history"
  ["Receipt Scanning & OCR"]="Receipt image upload;OCR text extraction;Data field mapping;Transaction creation from receipt;Receipt storage;Multi-receipt processing;Error handling"
  ["Data Sync & Cloud Storage"]="Real-time sync;Conflict resolution;Multi-device sync;Offline changes sync;Sync status indicators;Data encryption;Sync error recovery"
  ["Sharing & Collaboration"]="Budget sharing setup;Share code generation;User invitation;Shared budget access;Permission management;Activity tracking;Conflict resolution"
  ["Mobile Responsiveness"]="Mobile layout adaptation;Touch gestures;Mobile navigation;Form inputs on mobile;Modal behavior;Bottom navigation;Responsive breakpoints"
  ["PWA & Offline Mode"]="PWA installation;Offline functionality;Service worker caching;Background sync;Update notifications;Offline indicators;Data persistence"
  ["Security & Data Protection"]="Data encryption;Secure storage;Authentication security;XSS prevention;CSRF protection;Data validation;Security headers"
  ["Performance & Load Testing"]="Page load times;Component render performance;Large dataset handling;Memory management;Bundle size optimization;Network performance;Cache efficiency"
  ["Error Handling & Recovery"]="Error boundary functionality;Error logging;User error feedback;Data corruption recovery;Sync error handling;Network error handling;Graceful degradation"
  ["Accessibility (a11y)"]="Keyboard navigation;Screen reader support;Focus management;Color contrast;ARIA labels;Alternative text;Semantic HTML"
  ["Cross-Browser Compatibility"]="Chrome compatibility;Firefox compatibility;Safari compatibility;Edge compatibility;Mobile browser testing;Feature detection;Polyfills"
)

# Create the master epic
echo -e "${BLUE}Creating master epic issue...${NC}"

EPIC_BODY=$(cat <<'EOF'
# 🧪 E2E Testing & QA - Comprehensive App Testing Epic

**Status**: 🔄 ONGOING | **Type**: Epic  
**Purpose**: Systematic testing and validation of all app features  
**Last Updated**: $(date +%Y-%m-%d)

## Overview

This epic tracks comprehensive end-to-end testing and QA for every major feature area of Violet Vault. Each sub-issue represents a distinct feature area with its own test checklist and reporting requirements.

## 📋 Sub-Issues by Feature Area (21 Total)

### Core Features (6 issues)
- Testing: Authentication & User Management
- Testing: Dashboard & Overview
- Testing: Budgeting & Envelopes
- Testing: Transactions & Ledger
- Testing: Bills & Recurring Payments
- Testing: Debts & Loans

### Analytics & Insights (3 issues)
- Testing: Analytics & Reporting
- Testing: Charts & Visualizations
- Testing: Trends & History

### Advanced Features (4 issues)
- Testing: Savings Goals
- Testing: Auto-Funding & Automation
- Testing: Receipt Scanning & OCR
- Testing: Data Sync & Cloud Storage

### Platform Features (4 issues)
- Testing: Sharing & Collaboration
- Testing: Mobile Responsiveness
- Testing: PWA & Offline Mode
- Testing: Security & Data Protection

### System & DevOps (4 issues)
- Testing: Performance & Load Testing
- Testing: Error Handling & Recovery
- Testing: Accessibility (a11y)
- Testing: Cross-Browser Compatibility

---

## 📊 Testing Framework

Each sub-issue includes:
- **Unit Tests**: Component/function level tests
- **Integration Tests**: Feature interaction tests
- **E2E Tests**: Full user workflow tests
- **Manual QA**: UI/UX validation

## ✅ Success Criteria

- [ ] All 21 sub-issues created and assigned
- [ ] Each sub-issue has detailed test cases
- [ ] All test cases pass
- [ ] All bugs documented and triaged
- [ ] Coverage reports generated (target: 85%+)
- [ ] Performance benchmarks recorded
- [ ] Accessibility validation complete (WCAG 2.1 AA)

## 📚 Resources & Commands

```bash
# Run all tests
npm run test

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:ci

# Run Lighthouse performance audit
npm run lighthouse

# Run accessibility checks
npm run a11y

# Type checking
npm run typecheck

# Lint validation
npm run lint
```

## 🔄 How to Regenerate This Epic

To easily recreate this epic with all sub-issues:

```bash
./scripts/create-testing-epic.sh
```

This script will:
1. Create a new master epic issue
2. Create 21 sub-issues for all feature areas
3. Link them together for easy tracking
4. Output the epic URL for your reference

## 📈 Progress Tracking

Use the epic view in GitHub to:
- See overall completion percentage
- Track which sub-issues are in progress
- View related PRs and branches
- Generate reports from completed work

---

**Created**: $(date +%Y-%m-%d)  
**Automation Available**: Yes - use `./scripts/create-testing-epic.sh`  
**Re-creatable**: Yes - all sub-issues follow consistent template

🤖 Generated with Cursor AI
EOF
)

# Create epic issue
EPIC_URL=$(gh issue create \
  --title "🧪 E2E Testing & QA - Comprehensive App Testing Epic" \
  --body "$EPIC_BODY" \
  --label "bug,enhancement,question,Todo,PWA,accessibility,testing,sync,performance" \
  2>&1)

EPIC_NUMBER=$(echo "$EPIC_URL" | grep -oE '[0-9]+$')

echo -e "${GREEN}✓ Created epic issue #${EPIC_NUMBER}${NC}"
echo "URL: $EPIC_URL"
echo ""

# Array to store sub-issue numbers
declare -a SUB_ISSUES=()

# Create sub-issues for each feature
for FEATURE in "${FEATURES[@]}"; do
  echo -e "${BLUE}Creating sub-issue: Testing: ${FEATURE}...${NC}"
  
  # Get scope for this feature
  SCOPE="${SCOPES[$FEATURE]}"
  
  # Replace semicolons with newlines for better formatting
  SCOPE_FORMATTED=$(echo "$SCOPE" | sed 's/;/\n- /g')
  
  # Create sub-issue body
  SUB_ISSUE_BODY=$(cat <<EOF
## Test Scope
- ${SCOPE_FORMATTED}

## Test Checklist

### Unit Tests
- [ ] Component/function unit tests
- [ ] Type definitions validation
- [ ] Utility function tests
- [ ] Data transformation tests

### Integration Tests
- [ ] Feature interactions
- [ ] State management integration
- [ ] API integration
- [ ] Data flow validation

### E2E Tests
- [ ] Complete user workflows
- [ ] Multi-step processes
- [ ] Cross-feature interactions
- [ ] Error scenarios

### Manual QA
- [ ] UI/UX validation
- [ ] Mobile testing
- [ ] Error message clarity
- [ ] Performance check
- [ ] Accessibility review
- [ ] Smart suggestion banners populate for synthetic merchants (e.g., Starbucks Coffee, Amazon Marketplace)
- [ ] Discover Bills modal surfaces recurring candidates (e.g., Brightstream Broadband, Evergreen Water Services)

## Reporting
- Test results summary
- Coverage percentage
- Failed tests with error details
- Performance metrics

---
Parent Epic: #${EPIC_NUMBER}
🤖 Generated with Cursor AI
EOF
)
  
  # Create the sub-issue
  SUB_URL=$(gh issue create \
    --title "Testing: ${FEATURE}" \
    --body "$SUB_ISSUE_BODY" \
    --label "bug,Todo,testing" \
    2>&1)
  
  SUB_NUMBER=$(echo "$SUB_URL" | grep -oE '[0-9]+$')
  SUB_ISSUES+=("#${SUB_NUMBER}")
  
  echo -e "${GREEN}  ✓ Created #${SUB_NUMBER}${NC}"
  
  # Small delay to avoid rate limiting
  sleep 0.5
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Epic created successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Epic Issue: #${EPIC_NUMBER}"
echo "Epic URL: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/issues/${EPIC_NUMBER}"
echo ""
echo "Sub-Issues Created (${#SUB_ISSUES[@]} total):"
for issue in "${SUB_ISSUES[@]}"; do
  echo "  - $issue"
done
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Review the epic and sub-issues"
echo "2. Assign issues to team members"
echo "3. Begin testing following the checklists"
echo "4. Update issues as tests complete"
echo ""
echo "View all issues: gh issue list --label testing"

