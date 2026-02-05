#!/bin/bash

###############################################################################
# Full Salvo - Comprehensive Pre-Commit Quality Checks
#
# This script runs all pre-commit checks including optional E2E tests.
# By default, it runs the standard lint-staged checks.
#
# Usage:
#   ./full-salvo.sh              # Run standard checks only
#   ./full-salvo.sh --playwright # Include E2E smoke tests
#   ./full-salvo.sh --help       # Show this help
#
# Features:
# - Runs ESLint, Prettier, TypeScript checks
# - Optional: Smoke tests (fast, ~2 min)
# - Debouncing: E2E tests only run if 15+ minutes since last run
# - Caching: Uses existing test cache to speed up runs
#
# Exit codes:
#   0 = All checks passed
#   1 = Lint-staged checks failed
#   2 = E2E tests failed
#   3 = Invalid arguments
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DEBOUNCE_FILE=".full-salvo-debounce"
DEBOUNCE_INTERVAL=$((15 * 60)) # 15 minutes in seconds
PLAYWRIGHT_MODE=false
HELP_FLAG=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --playwright)
      PLAYWRIGHT_MODE=true
      shift
      ;;
    --help|-h)
      HELP_FLAG=true
      shift
      ;;
    *)
      echo -e "${RED}❌ Unknown argument: $1${NC}"
      echo "Use --help for usage information"
      exit 3
      ;;
  esac
done

# Show help
if [ "$HELP_FLAG" = true ]; then
  cat << 'EOF'
Full Salvo - Comprehensive Pre-Commit Quality Checks

USAGE:
  ./full-salvo.sh              Run standard lint-staged checks
  ./full-salvo.sh --playwright Include E2E smoke tests
  ./full-salvo.sh --help       Show this help

WHAT RUNS:
  Standard (always):
    ✓ ESLint     - TypeScript/JavaScript linting
    ✓ Prettier   - Code formatting
    ✓ TypeScript - Type checking
    ✓ Vitest     - Unit tests (via npm run test:coverage)

  Optional (--playwright):
    ✓ Smoke tests - Critical path E2E tests (~2 minutes)
    ✓ Debouncing - Only runs if 15+ minutes since last run
    ✓ Cached browsers - Reuses existing browser cache

TYPICAL WORKFLOW:
  1. Make code changes
  2. Stage files: git add .
  3. Pre-commit check: npm run pre-commit
  4. Before final push: ./full-salvo.sh --playwright
  5. Push: git push

PERFORMANCE:
  Standard checks:  ~1-2 minutes
  With E2E (first): ~4-5 minutes (browser install)
  With E2E (cached): ~3-4 minutes
  Debounced skip:   Skips if run within last 15 minutes

EXIT CODES:
  0 - All checks passed
  1 - Lint-staged checks failed
  2 - E2E tests failed
  3 - Invalid arguments

TIPS:
  - Use during development before pushing
  - Use --playwright before major feature commits
  - Debouncing prevents repeated runs within 15 minutes
  - Browsers are cached to speed up E2E runs
  - See GitHub Actions for full 4-shard CI results

EOF
  exit 0
fi

# Helper function to print section headers
print_header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Helper function to print success
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Helper function to print error
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Helper function to print warning
print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if debounce timeout has passed
check_debounce() {
  if [ -f "$DEBOUNCE_FILE" ]; then
    LAST_RUN=$(cat "$DEBOUNCE_FILE")
    CURRENT_TIME=$(date +%s)
    TIME_DIFF=$((CURRENT_TIME - LAST_RUN))

    if [ $TIME_DIFF -lt $DEBOUNCE_INTERVAL ]; then
      REMAINING=$((DEBOUNCE_INTERVAL - TIME_DIFF))
      REMAINING_MIN=$((REMAINING / 60))
      print_warning "E2E tests debounced (ran within last 15 minutes)"
      print_warning "E2E tests will run again in ~${REMAINING_MIN} minutes"
      echo "Use 'rm $DEBOUNCE_FILE' to force immediate run"
      return 1
    fi
  fi
  return 0
}

# Update debounce timestamp
update_debounce() {
  date +%s > "$DEBOUNCE_FILE"
}

# Main execution
print_header "🚀 Full Salvo - Pre-Commit Quality Checks"

# Run lint-staged
print_header "Step 1/2: Standard Checks (lint-staged)"
echo "Running ESLint, Prettier, TypeScript, and unit tests..."
echo ""

if npx lint-staged; then
  print_success "All standard checks passed"
else
  print_error "Standard checks failed"
  exit 1
fi

# Run E2E tests if requested
if [ "$PLAYWRIGHT_MODE" = true ]; then
  print_header "Step 2/2: E2E Smoke Tests (--playwright)"

  if check_debounce; then
    echo "Running Playwright smoke tests..."
    echo "This may take 2-3 minutes (cached browsers)..."
    echo ""

    if npm run test:e2e:smoke; then
      print_success "E2E smoke tests passed"
      update_debounce
    else
      print_error "E2E smoke tests failed"
      exit 2
    fi
  else
    print_warning "Skipping E2E tests (debounced)"
    echo ""
  fi
else
  print_header "Optional: E2E Tests Skipped"
  echo "E2E tests not requested. To include them, run:"
  echo "  ./full-salvo.sh --playwright"
  echo ""
  echo "E2E tests are slower (~3-4 min) but important for:"
  echo "  • Critical path testing"
  echo "  • Before major feature commits"
  echo "  • Before pushing to main"
  echo ""
fi

print_header "✅ Full Salvo Complete"
echo "All checks passed! Ready to commit and push."
echo ""
