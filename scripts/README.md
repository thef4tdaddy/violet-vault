# Testing Epic Generation Script

## Overview

This script automatically creates a comprehensive testing epic with all sub-issues for systematic app testing.

## What It Creates

**1 Master Epic + 21 Sub-Issues covering:**

### Core Features (6)
- Authentication & User Management
- Dashboard & Overview
- Budgeting & Envelopes
- Transactions & Ledger
- Bills & Recurring Payments
- Debts & Loans

### Analytics & Insights (3)
- Analytics & Reporting
- Charts & Visualizations
- Trends & History

### Advanced Features (4)
- Savings Goals
- Auto-Funding & Automation
- Receipt Scanning & OCR
- Data Sync & Cloud Storage

### Platform Features (4)
- Sharing & Collaboration
- Mobile Responsiveness
- PWA & Offline Mode
- Security & Data Protection

### System & DevOps (4)
- Performance & Load Testing
- Error Handling & Recovery
- Accessibility (a11y)
- Cross-Browser Compatibility

## Usage

```bash
# Run the script
./scripts/create-testing-epic.sh
```

## Output

The script will:
1. Create a master epic issue with full overview
2. Create 21 linked sub-issues with test checklists
3. Apply appropriate labels to all issues
4. Display the epic URL and all sub-issue numbers

## Example Output

```
🧪 Creating Comprehensive Testing Epic...
Creating master epic issue...
✓ Created epic issue #919

Creating sub-issue: Testing: Authentication & User Management...
  ✓ Created #920
Creating sub-issue: Testing: Dashboard & Overview...
  ✓ Created #921
...

========================================
✓ Epic created successfully!
========================================

Epic Issue: #919
Epic URL: https://github.com/username/repo/issues/919

Sub-Issues Created (21 total):
  - #920
  - #921
  ...
```

## Each Sub-Issue Includes

- **Test Scope**: List of areas to test
- **Test Checklist**: 
  - Unit Tests
  - Integration Tests
  - E2E Tests
  - Manual QA
- **Reporting**: What to document
- **Parent Epic Reference**: Links back to master epic

## Labels Applied

- `bug` - for QA tracking
- `enhancement` - improvements found
- `testing` - testing tasks
- `Todo` - work status
- Feature-specific labels (PWA, sync, performance, accessibility)

## Tracking Progress

After creation, track progress with:

```bash
# View all testing issues
gh issue list --label testing

# View epic details
gh issue view [EPIC_NUMBER]

# Check sub-issue status
gh issue list --label testing --state open
```

## Re-running the Script

You can run this script multiple times to create new testing cycles. Each run will create a fresh set of issues with updated dates.

## Requirements

- GitHub CLI (`gh`) installed and authenticated
- Proper repository permissions to create issues
- Bash shell environment

## Notes

- The script includes a 0.5s delay between issue creation to avoid rate limiting
- All issues are created with consistent formatting
- Parent-child relationships are documented in issue bodies
- Issues can be bulk-closed or updated using GitHub CLI filters

