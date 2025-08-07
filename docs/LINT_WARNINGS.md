# Lint Warnings Tracking

This document tracks ESLint warnings in the Violet Vault project to maintain code quality and monitor progress toward our target of 17 warnings.

**Last Updated:** 2025-08-07  
**Current Status:** 21 warnings (Target: 17 warnings)

## Current Warnings Breakdown

### By Severity

- **Errors:** 0
- **Warnings:** 21

### By Category

#### Unused Variables (no-unused-vars) - 15 warnings

- `scripts/rollback.js` - 3 warnings
  - Line 200: `'error'` parameter unused
  - Line 214: `'error'` parameter unused
  - Line 251: `'error'` parameter unused
- `src/components/layout/MainLayout.jsx` - 1 warning
  - Line 397: `'Icon'` parameter unused in NavButton component
- `src/components/layout/NavigationTabs.jsx` - 1 warning
  - Line 78: `'Icon'` parameter unused
- `src/components/layout/SummaryCards.jsx` - 1 warning
  - Line 66: `'Icon'` parameter unused
- `src/components/layout/ViewRenderer.jsx` - 3 warnings
  - Line 45: `'deleteTransaction'` assigned but never used
  - Line 48: `'setAllTransactions'` assigned but never used
  - Line 49: `'setTransactions'` assigned but never used
- `src/db/budgetDb.js` - 6 warnings
  - Line 25: `'_trans'` parameter unused
  - Line 29: `'_primKey'` parameter unused
  - Line 29: `'_obj'` parameter unused
  - Line 29: `'_trans'` parameter unused
  - Line 33: `'_trans'` parameter unused
  - Line 37: `'_primKey'` parameter unused
  - Line 37: `'_obj'` parameter unused
  - Line 37: `'_trans'` parameter unused
- `src/utils/highlight.js` - 1 warning
  - Line 36: `'setupConsoleCapture'` assigned but never used

#### React Hooks (react-hooks/exhaustive-deps) - 1 warning

- `src/hooks/useFirebaseSync.js` - 1 warning
  - Line 56: Missing dependency `'budget'` in useEffect

#### React Refresh (react-refresh/only-export-components) - 2 warnings

- `src/contexts/AuthContext.jsx` - 1 warning
  - Line 7: Fast refresh issue - move constants/functions to separate file
- `src/contexts/BudgetContext.jsx` - 1 warning
  - Line 7: Fast refresh issue - move React context to separate file

## Progress History

| Date       | Total Warnings | Change   | Notes                 |
| ---------- | -------------- | -------- | --------------------- |
| 2025-08-07 | 21             | Baseline | Initial documentation |

## Previous Improvements

Based on recent work, we've successfully addressed several warnings:

- ✅ Fixed missing logger imports in BillManager.jsx (5 warnings resolved)
- ✅ Removed unused imports from EnvelopeGrid.jsx
- ✅ Cleaned up unused variables in MainLayout.jsx (11 warnings resolved)
- ✅ Removed unused convertFrequency import from EditEnvelopeModal.jsx
- ✅ Fixed unused Icon variables in multiple components

## Action Plan

### High Priority (Quick Fixes)

1. **Fix unused Icon parameters** (4 warnings)
   - Update NavButton components to use Icon parameter or rename with underscore
   - Files: MainLayout.jsx, NavigationTabs.jsx, SummaryCards.jsx

2. **Clean up ViewRenderer unused variables** (3 warnings)
   - Remove or properly use deleteTransaction, setAllTransactions, setTransactions
   - Consider if these are needed for future functionality

### Medium Priority

3. **Database parameter cleanup** (6 warnings)
   - Prefix unused parameters with underscore in budgetDb.js
   - These are callback parameters that may be intentionally unused

4. **Utility function cleanup** (1 warning)
   - Remove or use setupConsoleCapture in highlight.js

### Low Priority (Architectural)

5. **React context organization** (2 warnings)
   - Refactor AuthContext and BudgetContext to separate files
   - This requires careful consideration of import dependencies

6. **Hook dependency fix** (1 warning)
   - Add missing 'budget' dependency to useFirebaseSync useEffect

7. **Script error handling** (3 warnings)
   - Add proper error handling or prefix with underscore in rollback.js

## Monitoring

- **Target:** Maintain ≤ 17 warnings
- **Review Frequency:** After significant changes or weekly
- **Auto-check:** Consider adding lint warning count to CI/CD

## Commands

```bash
# Check current warnings
npm run lint

# Count warnings only
npm run lint 2>&1 | grep -c "warning"

# Check specific file
npx eslint src/path/to/file.js
```
