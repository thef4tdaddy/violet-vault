# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 4 | +4 |
| TypeScript Errors | 2 | -308 |

*Last updated: 2025-10-28 22:38:12 UTC*

## Table of Contents
- [Lint Audit](#lint-audit)
  - [Files with Most Issues](#files-with-most-issues)
  - [Issue Count by Category](#issue-count-by-category)
  - [Detailed Lint Report](#detailed-lint-report)
- [Typecheck Audit](#typecheck-audit)
  - [Files with Most Type Errors](#files-with-most-type-errors)
  - [Type Error Breakdown by Category](#type-error-breakdown-by-category)
  - [Detailed Type Error Report](#detailed-type-error-report)

## Lint Audit

### Files with Most Issues
- 1 issues in `violet-vault/src/utils/debts/debtCalculations.ts`
- 1 issues in `violet-vault/src/utils/common/transactionArchiving.ts`
- 1 issues in `violet-vault/src/utils/common/highlight.ts`
- 1 issues in `violet-vault/src/utils/common/budgetHistoryTracker.ts`
- 1 issues in `violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHistory.ts`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 3 | `no-undef` |
| 1 | `react-hooks/exhaustive-deps` |
| 1 | `null` |

### Detailed Lint Report
```
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHistory.ts:43:5 - 1 - React Hook useCallback has an unnecessary dependency: 'undoHook'. Either exclude it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/utils/common/budgetHistoryTracker.ts:347:56 - 1 - 'BudgetTag' is not defined. (no-undef)
violet-vault/src/utils/common/highlight.ts:131:1 - 1 - Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-unused-vars'). (null)
violet-vault/src/utils/common/transactionArchiving.ts:440:65 - 1 - 'Transaction' is not defined. (no-undef)
violet-vault/src/utils/debts/debtCalculations.ts:81:68 - 1 - 'PayoffProjection' is not defined. (no-undef)
```

## Typecheck Audit

### Files with Most Type Errors
- 2 errors in `src/utils/query/__tests__/queryKeys.test.ts`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 2 | `TS1128` |

### Detailed Type Error Report
```
src/utils/query/__tests__/queryKeys.test.ts(288,1): error TS1128: Declaration or statement expected.
src/utils/query/__tests__/queryKeys.test.ts(288,2): error TS1128: Declaration or statement expected.
```

