#!/bin/bash
# full_salvo.sh - Multi-language verification script for v2.0 Polyglot Backend
# Runs TypeScript, Go, and Python linters/type checkers

# Allow commands to fail (errors handled by run_check function)
set +e

# Parse command line arguments
FIX_MODE=false
if [[ "$1" == "--fix" ]]; then
  FIX_MODE=true
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Error directory for persisting failure reports
ERROR_DIR=".salvo_errors"

# Header
echo ""
echo -e "${MAGENTA}================================================================================${NC}"
echo -e "${MAGENTA}🚀 VioletVault Full Salvo - Multi-Language Full Build Verification${NC}"
echo -e "${MAGENTA}================================================================================${NC}"
if [ "$FIX_MODE" = true ]; then
  echo -e "${YELLOW}🔧 Running in FIX mode - will auto-fix issues where possible${NC}"
fi
echo ""

# Track overall status
OVERALL_STATUS=0
# Track failed steps using associative array
declare -A FAILED_CHECKS

# Helper function for running checks with ESLint-style reporting
# Usage: run_check "Check Name" "command to run"
run_check() {
  local name=$1
  local command=$2
  local output_file="${ERROR_DIR}/${name//[^a-zA-Z0-9]/_}.txt"
  
  # Ensure error directory exists
  mkdir -p "$ERROR_DIR"
  
  # Print check name without newline
  echo -n "  ${name}..."
  
  # Run command and capture output
  if eval "$command" > "$output_file" 2>&1; then
    echo -e " ${GREEN}✓${NC}"
    rm -f "$output_file"  # Delete output file on success
    return 0
  else
    echo -e " ${RED}✗${NC}"
    FAILED_CHECKS["$name"]="$output_file"
    OVERALL_STATUS=1
    return 1
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# 1. TypeScript/JavaScript Checks
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}Running TypeScript/JavaScript Checks...${NC}"

# ESLint
if [ "$FIX_MODE" = true ]; then
  run_check "ESLint" "npm run lint:fix"
else
  run_check "ESLint" "npm run lint"
fi

# TypeScript type checking
run_check "TypeScript" "npm run typecheck"

# Prettier
if [ "$FIX_MODE" = true ]; then
  run_check "Prettier" "npm run format"
else
  run_check "Prettier" "npm run format:check"
fi

# Vitest
run_check "Vitest" "npm run test:run"

# Build verification
run_check "Build" "npm run build"

# ═══════════════════════════════════════════════════════════════════════════════
# 2. Go Backend Checks
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}Running Go Backend Checks...${NC}"

if [ -d "api" ] && [ -f "api/go.mod" ]; then
    # Go fmt (always auto-fixes)
    run_check "go fmt" "cd api && go fmt ./..."
    
    # Go vet
    run_check "go vet" "cd api && go vet ./..."
    
    # Go build
    run_check "go build" "cd api && go build ./..."
    
    # golangci-lint (if available)
    if command -v golangci-lint &> /dev/null; then
        if [ "$FIX_MODE" = true ]; then
            run_check "golangci-lint" "cd api && golangci-lint run --fix ./..."
        else
            run_check "golangci-lint" "cd api && golangci-lint run ./..."
        fi
    else
        echo -e "  ${YELLOW}golangci-lint (skipped - not installed)${NC}"
    fi
    
    # Go tests with coverage
    run_check "go test" "cd api && go test ./... -coverprofile=coverage.out; EXIT_CODE=\$?; rm -f coverage.out; exit \$EXIT_CODE"
else
    echo -e "  ${YELLOW}Go checks (skipped - no Go code found)${NC}"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# 3. Python Backend Checks
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}Running Python Backend Checks...${NC}"

if [ -f "pyproject.toml" ] && [ -n "$(find api -name "*.py" -print -quit 2>/dev/null)" ]; then
    # Define python executable paths
    RUFF_CMD="ruff"
    MYPY_CMD="mypy"
    PYTEST_CMD="pytest"
    
    if [ -f ".venv/bin/ruff" ]; then
        RUFF_CMD=".venv/bin/ruff"
    fi
    if [ -f ".venv/bin/mypy" ]; then
        MYPY_CMD=".venv/bin/mypy"
    fi
    if [ -f ".venv/bin/pytest" ]; then
        PYTEST_CMD=".venv/bin/pytest"
    fi

    # Ruff format
    if command -v "$RUFF_CMD" &> /dev/null || [ -f "$RUFF_CMD" ]; then
        if [ "$FIX_MODE" = true ]; then
            run_check "ruff format" "$RUFF_CMD format api/"
        else
            run_check "ruff format" "$RUFF_CMD format --check api/"
        fi
        
        # Ruff lint
        if [ "$FIX_MODE" = true ]; then
            run_check "ruff lint" "$RUFF_CMD check --fix api/"
        else
            run_check "ruff lint" "$RUFF_CMD check api/"
        fi
    else
        echo -e "  ${YELLOW}ruff (skipped - not installed)${NC}"
    fi

    # Mypy type checking
    if command -v "$MYPY_CMD" &> /dev/null || [ -f "$MYPY_CMD" ]; then
        run_check "mypy" "$MYPY_CMD -p api"
    else
        echo -e "  ${YELLOW}mypy (skipped - not installed)${NC}"
    fi

    # Pytest
    if command -v "$PYTEST_CMD" &> /dev/null || [ -f "$PYTEST_CMD" ]; then
        if [ -d "api/__tests__" ] || ls api/test_*.py 1> /dev/null 2>&1; then
            run_check "pytest" "$PYTEST_CMD --cov=api --cov-report=term-missing api/"
        else
            echo -e "  ${YELLOW}pytest (skipped - no tests found)${NC}"
        fi
    else
        echo -e "  ${YELLOW}pytest (skipped - not installed)${NC}"
    fi
else
    echo -e "  ${YELLOW}Python checks (skipped - no Python code found)${NC}"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# 4. Integration Tests (Playwright) - TODO for Beta
# ═══════════════════════════════════════════════════════════════════════════════
# TODO: Playwright Integration Tests (Beta)
# Uncomment when ready for beta testing
#
# echo ""
# echo -e "${BLUE}Running Integration Tests...${NC}"
# if [ -d "e2e" ] && [ -f "playwright.config.ts" ]; then
#   run_check "Playwright" "npm run test:e2e"
# else
#   echo -e "  ${YELLOW}Playwright (skipped - no e2e tests found)${NC}"
# fi

# ═══════════════════════════════════════════════════════════════════════════════
# 5. Summary
# ═══════════════════════════════════════════════════════════════════════════════
echo ""

if [ $OVERALL_STATUS -eq 0 ]; then
    # All checks passed
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✓ All Checks Passed${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}Ready for deployment! 🚀${NC}"
    echo ""
    
    # Clean up error directory if it exists
    rm -rf "$ERROR_DIR"
    
    # Touch success token for pre-commit hook
    mkdir -p .git
    touch .git/FULL_SALVO_SUCCESS
else
    # Some checks failed
    echo -e "${RED}═══════════════════════════════════════${NC}"
    echo -e "${RED}  ✗ ${#FAILED_CHECKS[@]} Check(s) Failed${NC}"
    echo -e "${RED}═══════════════════════════════════════${NC}"
    echo ""
    
    # Display detailed error output for each failed check
    for check_name in "${!FAILED_CHECKS[@]}"; do
        error_file="${FAILED_CHECKS[$check_name]}"
        echo -e "${RED}▼ $check_name${NC}"
        if [ -f "$error_file" ]; then
            cat "$error_file"
        fi
        echo ""
    done
    
    echo -e "${YELLOW}💡 Tip: Run with --fix flag to auto-fix some issues:${NC}"
    echo -e "${YELLOW}   ./scripts/full_salvo.sh --fix${NC}"
    echo ""
    echo -e "${YELLOW}📁 Error reports saved in: $ERROR_DIR/${NC}"
    echo ""
fi

exit $OVERALL_STATUS
