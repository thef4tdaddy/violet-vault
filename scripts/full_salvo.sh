#!/bin/bash
# full_salvo.sh - Multi-language verification script for v2.0 Polyglot Backend
# Runs TypeScript, Go, and Python linters/type checkers

set -e

echo "🚀 VioletVault v2.0 Full Salvo - Multi-Language Verification"
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall status
OVERALL_STATUS=0

# Helper function for status reporting
report_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2 passed${NC}"
    else
        echo -e "${RED}✗ $2 failed${NC}"
        OVERALL_STATUS=1
    fi
}

# 1. TypeScript/JavaScript Checks
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  1️⃣  TypeScript/JavaScript Checks${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

echo -e "\n${YELLOW}→ Running ESLint...${NC}"
npm run lint || report_status $? "ESLint"

echo -e "\n${YELLOW}→ Running TypeScript type check...${NC}"
npm run typecheck || report_status $? "TypeScript"

echo -e "\n${YELLOW}→ Running Prettier format check...${NC}"
npm run format:check || report_status $? "Prettier"

# 2. Go Checks
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  2️⃣  Go Backend Checks${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if [ -d "api" ] && [ -f "api/go.mod" ]; then
    echo -e "\n${YELLOW}→ Running go fmt...${NC}"
    cd api
    if ! gofmt -l . | grep -q .; then
        echo -e "${GREEN}✓ go fmt passed${NC}"
    else
        echo -e "${RED}✗ go fmt found unformatted files:${NC}"
        gofmt -l .
        OVERALL_STATUS=1
    fi

    echo -e "\n${YELLOW}→ Running go vet...${NC}"
    go vet ./... || report_status $? "go vet"

    echo -e "\n${YELLOW}→ Running go build...${NC}"
    go build ./... || report_status $? "go build"

    # Check if golangci-lint is available
    if command -v golangci-lint &> /dev/null; then
        echo -e "\n${YELLOW}→ Running golangci-lint...${NC}"
        golangci-lint run || report_status $? "golangci-lint"
    else
        echo -e "${YELLOW}⚠ golangci-lint not found, skipping${NC}"
    fi

    # Run Go tests if any exist
    if ls *_test.go 1> /dev/null 2>&1; then
        echo -e "\n${YELLOW}→ Running go test...${NC}"
        go test ./... -v || report_status $? "go test"
    else
        echo -e "${YELLOW}ℹ No Go tests found${NC}"
    fi

    cd ..
else
    echo -e "${YELLOW}⚠ No Go code found in api/, skipping Go checks${NC}"
fi

# 3. Python Checks
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  3️⃣  Python Backend Checks${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if [ -f "pyproject.toml" ] && [ -f "api/analytics.py" ]; then
    # Check if ruff is available
    if command -v ruff &> /dev/null; then
        echo -e "\n${YELLOW}→ Running ruff lint...${NC}"
        ruff check api/ || report_status $? "ruff lint"

        echo -e "\n${YELLOW}→ Running ruff format check...${NC}"
        ruff format --check api/ || report_status $? "ruff format"
    else
        echo -e "${YELLOW}⚠ ruff not found, skipping ruff checks${NC}"
        echo -e "${YELLOW}  Install with: pip install ruff${NC}"
    fi

    # Check if mypy is available
    if command -v mypy &> /dev/null; then
        echo -e "\n${YELLOW}→ Running mypy type check...${NC}"
        mypy api/ || report_status $? "mypy"
    else
        echo -e "${YELLOW}⚠ mypy not found, skipping type checks${NC}"
        echo -e "${YELLOW}  Install with: pip install mypy${NC}"
    fi

    # Run Python tests if pytest is available
    if command -v pytest &> /dev/null; then
        if [ -d "api/__tests__" ] || ls api/test_*.py 1> /dev/null 2>&1; then
            echo -e "\n${YELLOW}→ Running pytest...${NC}"
            pytest api/ || report_status $? "pytest"
        else
            echo -e "${YELLOW}ℹ No Python tests found${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠ No Python code found, skipping Python checks${NC}"
fi

# 4. Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  📊 Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "\n${GREEN}✓✓✓ All checks passed! ✓✓✓${NC}"
    echo -e "${GREEN}Ready for deployment to v2.0 Polyglot Backend${NC}\n"
else
    echo -e "\n${RED}✗✗✗ Some checks failed ✗✗✗${NC}"
    echo -e "${RED}Please fix the errors above before committing${NC}\n"
fi

exit $OVERALL_STATUS
