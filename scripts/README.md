# Scripts Documentation

## Overview

This directory contains utility scripts for VioletVault development and operations.

---

## full_salvo.sh - Multi-Language Verification

### Overview

`full_salvo.sh` is the comprehensive verification script that runs all linters, type checkers, tests, and build verification for TypeScript, Go, and Python codebases.

### Features

✨ **ESLint-Style Reporting** - Quiet execution with summary at the end
🔧 **Auto-Fix Support** - Use `--fix` flag to automatically fix issues
🔄 **Retry Failed Checks** - Re-run only failed checks with `--retry-failed` (within 5 minutes)
📁 **Error Persistence** - Failed checks saved to `.salvo_errors/`
🎯 **Multi-Language** - TypeScript, Go, Python support
🚀 **CI-Ready** - Returns proper exit codes for CI/CD integration

### Usage

```bash
# Normal mode (read-only checks)
./scripts/full_salvo.sh

# Fix mode (auto-fix issues where possible)
./scripts/full_salvo.sh --fix

# Retry failed mode (re-run only failed checks from last run)
# Only works if last run was within 5 minutes
./scripts/full_salvo.sh --retry-failed
```

### What It Checks

#### TypeScript/JavaScript Checks

- **ESLint** - Code linting and style
- **TypeScript** - Type checking
- **Prettier** - Code formatting
- **Vitest** - Unit tests
- **Build** - Production build verification

#### Go Backend Checks

- **go fmt** - Code formatting
- **go vet** - Static analysis
- **go build** - Compilation check
- **golangci-lint** - Comprehensive linting (if installed)
- **go test** - Unit tests with coverage

#### Python Backend Checks

- **ruff format** - Code formatting
- **ruff lint** - Code linting
- **mypy** - Type checking
- **pytest** - Unit tests with coverage

### Output Examples

#### Success Case

```
================================================================================
🚀 VioletVault Full Salvo - Multi-Language Full Build Verification
================================================================================

Running TypeScript/JavaScript Checks...
  ESLint... ✓
  TypeScript... ✓
  Prettier... ✓
  Vitest... ✓
  Build... ✓

Running Go Backend Checks...
  go fmt... ✓
  go vet... ✓
  go build... ✓
  go test... ✓

Running Python Backend Checks...
  ruff format... ✓
  ruff lint... ✓
  mypy... ✓
  pytest... ✓

═══════════════════════════════════════
  ✓ All Checks Passed
═══════════════════════════════════════

Ready for deployment! 🚀
```

#### Failure Case

```
Running TypeScript/JavaScript Checks...
  ESLint... ✓
  TypeScript... ✓
  Prettier... ✗
  Vitest... ✓
  Build... ✓

═══════════════════════════════════════
  ✗ 1 Check(s) Failed
═══════════════════════════════════════

▼ Prettier
src/components/App.tsx
  12:5  error  Delete `··`  prettier/prettier

💡 Tip: Run with --fix flag to auto-fix some issues:
   ./scripts/full_salvo.sh --fix

💡 Tip: Re-run only failed checks (within 5 minutes):
   ./scripts/full_salvo.sh --retry-failed

📁 Error reports saved in: .salvo_errors/
```

### Exit Codes

- `0` - All checks passed
- `1` - One or more checks failed

### Error Persistence

When checks fail, detailed error output is saved to `.salvo_errors/` directory:

- Each failed check gets its own file
- Failed checks list saved for retry functionality
- Timestamp saved to enforce 5-minute retry window
- Directory is automatically cleaned up when all checks pass
- Directory is in `.gitignore` (not committed)

### Retry Failed Checks

The `--retry-failed` flag allows you to re-run only the checks that failed in the last run:

**How it works:**

1. Run `./scripts/full_salvo.sh` - some checks fail
2. Fix the issues in your code
3. Run `./scripts/full_salvo.sh --retry-failed` - only failed checks run again

**Time limit:**

- Retry is only allowed within 5 minutes of the last run
- This ensures you're working with a recent baseline
- After 5 minutes, you must run a full check again

**Example:**

```bash
# First run - some checks fail
$ ./scripts/full_salvo.sh
Running TypeScript/JavaScript Checks...
  ESLint... ✗
  TypeScript... ✓
  Prettier... ✗

✗ 2 Check(s) Failed
💡 Tip: Re-run only failed checks (within 5 minutes):
   ./scripts/full_salvo.sh --retry-failed

# Fix the issues, then retry only failed checks
$ ./scripts/full_salvo.sh --retry-failed
🔄 Running in RETRY FAILED mode - re-running only failed checks
Last run was 45s ago - proceeding with retry

Running TypeScript/JavaScript Checks...
  ESLint... ✓
  Prettier... ✓

✓ All Checks Passed
```

### CI/CD Integration

The script is designed for CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Full Salvo
  run: ./scripts/full_salvo.sh
```

### Requirements

- Node.js and npm (for TypeScript checks)
- Go toolchain (if Go code exists)
- Python 3.12+ and pip (if Python code exists)

Optional tools:

- `golangci-lint` for enhanced Go linting
- `ruff`, `mypy`, `pytest` for Python checks (can be in `.venv`)

### Notes

- Skips language checks if code doesn't exist (e.g., skips Go if no `api/go.mod`)
- Uses virtual environment Python tools if available (`.venv/bin/`)
- Auto-fix mode is safe - won't break working code
- Playwright integration tests section is commented out (TODO for beta)

---

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
