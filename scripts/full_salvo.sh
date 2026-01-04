#!/bin/bash
# full_salvo.sh - Multi-language verification script for v2.0 Polyglot Backend
# Runs TypeScript, Go, and Python linters/type checkers

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Header
echo ""
echo -e "${MAGENTA}================================================================================${NC}"
echo -e "${MAGENTA}🚀 VioletVault Full Salvo - Multi-Language Full Build Verification${NC}"
echo -e "${MAGENTA}================================================================================${NC}"
echo ""

# Track overall status
OVERALL_STATUS=0
# Track failed steps
FAILED_STEPS=()

# Helper function for status reporting
report_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2 passed${NC}"
    else
        echo -e "${RED}✗ $2 failed${NC}"
        FAILED_STEPS+=("$2")
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

echo -e "\n${YELLOW}→ Running Prettier format...${NC}"
# Run format quietly, only showing output on error
if npm run format > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Prettier passed${NC}"
else
    echo -e "${RED}✗ Prettier failed${NC}"
    # Re-run to show error
    npm run format
    FAILED_STEPS+=("Prettier")
    OVERALL_STATUS=1
fi

# 1.5 TypeScript Tests (Vitest)
echo -e "\n${YELLOW}→ Running Vitest with coverage...${NC}"
echo -e "${YELLOW}ℹ Skipping Vitest (Run via VS Code Test Explorer)${NC}"
# npm run test:coverage || report_status $? "Vitest Coverage"

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
        FAILED_STEPS+=("go fmt")
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

    echo -e "\n${YELLOW}→ Running go test with coverage...${NC}"
    # Generate coverage profile
    go test ./... -coverprofile=coverage.out -v || report_status $? "go test"
    
    # Display detailed function coverage
    if [ -f coverage.out ]; then
        echo -e "\n${BLUE}📊 Go Coverage Breakdown:${NC}"
        go tool cover -func=coverage.out
        rm coverage.out
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

if [ -f "pyproject.toml" ] && [ -n "$(find api -name "*.py" -print -quit)" ]; then
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

    # Check if ruff is available
    if command -v "$RUFF_CMD" &> /dev/null || [ -f "$RUFF_CMD" ]; then
        echo -e "\n${YELLOW}→ Running ruff lint...${NC}"
        $RUFF_CMD check api/ || report_status $? "ruff lint"

        echo -e "\n${YELLOW}→ Running ruff format check...${NC}"
        $RUFF_CMD format --check api/ || report_status $? "ruff format"
    else
        echo -e "${YELLOW}⚠ ruff not found, skipping ruff checks${NC}"
        echo -e "${YELLOW}  Install with: pip install ruff${NC}"
    fi

    # Check if mypy is available
    if command -v "$MYPY_CMD" &> /dev/null || [ -f "$MYPY_CMD" ]; then
        echo -e "\n${YELLOW}→ Running mypy type check...${NC}"

        $MYPY_CMD -p api || report_status $? "mypy"
    else
        echo -e "${YELLOW}⚠ mypy not found, skipping type checks${NC}"
        echo -e "${YELLOW}  Install with: pip install mypy${NC}"
    fi

    # Run Python tests if pytest is available
    if command -v "$PYTEST_CMD" &> /dev/null || [ -f "$PYTEST_CMD" ]; then
        if [ -d "api/__tests__" ] || ls api/test_*.py 1> /dev/null 2>&1; then
            echo -e "\n${YELLOW}→ Running pytest with coverage...${NC}"
            # Add --cov=api for coverage report
            $PYTEST_CMD --cov=api --cov-report=term-missing api/ || report_status $? "pytest"
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
    # Touch success token for pre-commit hook
    mkdir -p .git
    touch .git/FULL_SALVO_SUCCESS
    echo -e "${GREEN}Ready for deployment!!! 🚀🚀🚀${NC}\n"
else
    echo -e "\n${RED}✗✗✗ Some checks failed ✗✗✗${NC}"
    echo -e "${RED}Failed steps:${NC}"
    for step in "${FAILED_STEPS[@]}"; do
        echo -e "  - ${RED}$step${NC}"
    done
    echo -e "\n${RED}Please fix the errors above before committing${NC}\n"
fi

exit $OVERALL_STATUS
