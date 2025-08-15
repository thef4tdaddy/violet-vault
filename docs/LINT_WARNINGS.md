# Lint Warnings Tracking

This document tracks ESLint warnings in the Violet Vault project to maintain code quality and monitor progress toward our target of 17 warnings.

**Last Updated:** 2025-08-15  
**Current Status:** 62 warnings (Target: 17 warnings) ⚠️ NEEDS ATTENTION

## Current Warnings Breakdown

### By Severity

- **Errors:** 0
- **Warnings:** 62 ⚠️

### By Category

- **Unused Variables (no-unused-vars):** 37 warnings
- **React Hooks Dependencies (react-hooks/exhaustive-deps):** 8 warnings
- **Test Setup Issues (no-undef):** 16 warnings
- **Case Block Declarations (no-case-declarations):** 2 warnings

## Impact Analysis After Envelope Refactoring (#212)

The significant increase from 0 to 62 warnings is primarily due to:

1. **Envelope System Refactoring** - New components with unused imports/variables
2. **TanStack Query Migration** - Legacy Zustand imports left unused
3. **Modal Extraction** - Unused parameters in new dedicated components
4. **Test Setup Configuration** - Vitest globals not properly configured

## Current Warnings by File

### 🔴 High Priority (Refactoring-Related)

#### Envelope System Components
- `src/components/budgeting/envelope/EnvelopeCreateModal.jsx` (2 warnings)
  - `unassignedCash` parameter unused
  - `currentTypeConfig` variable unused
- `src/components/budgeting/envelope/EnvelopeEditModal.jsx` (4 warnings)
  - `toMonthly`, `toBiweekly` imports unused
  - `currentTypeConfig`, `frequencyOptions` variables unused

#### Legacy Zustand References
- `src/hooks/useEnvelopes.js` (1 warning)
  - `useBudgetStore` import unused (TanStack Query migration)

### 🟡 Medium Priority (Development Features)

#### Auto-Funding System (Feature in Development)
- `src/components/automation/AutoFundingRuleBuilder.jsx` (6 warnings)
  - Multiple unused condition management functions
  - Icon parameters unused in UI mapping

#### Bill Management
- `src/components/bills/BillManager.jsx` (2 warnings)
  - `onPayBill` function unused (future feature)
  - Missing dependency in useMemo hook

### 🟢 Low Priority (Legacy/Cleanup)

#### React Hooks Dependencies (8 warnings)
- `src/hooks/useAuthFlow.js` (2 warnings)
- `src/hooks/useDataManagement.js` (2 warnings)
- `src/hooks/useFirebaseSync.js` (1 warning)
- `src/hooks/usePasswordRotation.js` (1 warning)
- `src/hooks/useSavingsGoals.js` (1 warning)
- `src/hooks/useAutoFunding.js` (1 warning)

#### Unused Development Functions
- `src/components/history/ObjectHistoryViewer.jsx` (2 warnings)
  - `getChangeIcon`, `formatChangeDescription` functions prepared but unused
- `src/utils/autoFundingEngine.js` (6 warnings)
  - Variables prepared for future auto-funding features

#### Test Configuration
- `src/test/setup.js` (16 warnings)
  - Vitest `vi` global not properly configured in ESLint

## Recommended Action Plan

### Phase 1: Quick Wins (Target: -20 warnings)

1. **Clean Up Envelope Components** (6 warnings)
   - Remove unused imports in modal components
   - Clean up unused variables from refactoring

2. **Fix Test Configuration** (16 warnings)
   - Add vitest globals to ESLint config

### Phase 2: Code Quality (Target: -15 warnings)

3. **Hook Dependencies** (8 warnings)
   - Add missing dependencies or disable with documentation
   - Review actual dependency needs

4. **Remove Legacy Imports** (5 warnings)
   - Clean up unused Zustand imports after TanStack migration

### Phase 3: Feature Cleanup (Target: -21 warnings)

5. **Auto-Funding System** (12 warnings)
   - Either implement or remove prepared functions
   - Clean up development scaffolding

6. **Misc Cleanup** (9 warnings)
   - Review and clean unused development functions

## Progress History

| Date       | Total Warnings | Change   | Notes                                            |
| ---------- | -------------- | -------- | ------------------------------------------------ |
| 2025-08-15 | 62             | +62      | Envelope refactoring and TanStack Query migration |
| 2025-08-11 | 0              | -39      | Complete cleanup - all warnings resolved         |
| 2025-08-07 | 39             | +18      | Warning count increased from ongoing development |
| 2025-08-07 | 21             | Baseline | Initial documentation                            |

## Best Practices Applied

### Lint Warning Resolution Strategies

1. **Unused Variables**
   - Prefix with underscore (`_variable`) to indicate intentional non-use
   - Remove parameters entirely from catch blocks when not needed
   - Use `// eslint-disable-next-line no-unused-vars` for legitimate patterns

2. **React Hooks Dependencies**
   - Add `// eslint-disable-next-line react-hooks/exhaustive-deps` for complex dependency scenarios
   - Document why dependencies are intentionally excluded

3. **Import Cleanup**
   - Remove unused imports after major refactoring
   - Clean up legacy patterns after architecture migrations

4. **Development Features**
   - Use underscore prefix for prepared-but-unused functions
   - Comment or remove incomplete feature scaffolding

## Monitoring

- **Target:** Maintain ≤ 17 warnings
- **Current Goal:** Reduce from 62 → 17 warnings (28% of current)
- **Review Frequency:** After significant changes or weekly
- **Auto-check:** ✅ Automated via GitHub Actions

### Automated Tracking via GitHub Actions

The project includes an automated lint warning tracker that:

- **Runs on every PR and push** to main/develop branches
- **Parses ESLint output** and updates `.github/data/lint-warnings.json` automatically
- **Enforces 20% increase threshold** - PRs that increase warnings by more than 20% will be blocked
- **Posts PR comments** with warning analysis and trends
- **Updates tracking data** automatically on main/develop pushes

#### Workflow Details

- **Workflow:** `.github/workflows/lint-warnings-tracker.yml`
- **Parser Script:** `scripts/parse-eslint-warnings.js`
- **Data File:** `.github/data/lint-warnings.json` (auto-updated)
- **Threshold:** 20% increase limit (currently suspended due to refactoring)
- **Actions:** Blocks PRs exceeding threshold, comments on all PRs with analysis

## Commands

```bash
# Check current warnings
npm run lint

# Count warnings only
npm run lint 2>&1 | grep -c "warning"

# Check specific file
npx eslint src/path/to/file.js

# Fix auto-fixable issues
npm run lint:fix
```

## Notes

- The current high warning count is expected after major refactoring (#212)
- Most warnings are cleanup-related rather than code quality issues
- Priority should be on removing unused code from refactoring
- Test configuration needs updating for Vitest globals