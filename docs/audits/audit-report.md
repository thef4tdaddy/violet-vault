# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 3 | 0 |
| TypeScript Errors | 8 | 0 |
| TypeScript Strict Mode Errors | 14 | 0 |

*Last updated: 2025-11-26 19:03:05 UTC*

## Table of Contents
- [Lint Audit](#lint-audit)
  - [Files with Most Issues](#files-with-most-issues)
  - [Issue Count by Category](#issue-count-by-category)
  - [Detailed Lint Report](#detailed-lint-report)
- [Typecheck Audit](#typecheck-audit)
  - [Files with Most Type Errors](#files-with-most-type-errors)
  - [Type Error Breakdown by Category](#type-error-breakdown-by-category)
  - [Detailed Type Error Report](#detailed-type-error-report)
- [Typecheck Strict Mode Audit](#typecheck-strict-mode-audit)
  - [Files with Most Strict Mode Errors](#files-with-most-strict-mode-errors)
  - [Strict Mode Error Breakdown](#strict-mode-error-breakdown)
  - [Detailed Strict Mode Report](#detailed-strict-mode-report)

## Lint Audit

### Files with Most Issues
- 2 issues in `violet-vault/src/hooks/bills/useBillDetail.ts`
- 1 issues in `violet-vault/src/hooks/budgeting/useSmartSuggestions.ts`
- 1 issues in `violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution.ts`
- 1 issues in `violet-vault/src/components/receipts/ReceiptScanner.tsx`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 2 | `react-hooks/exhaustive-deps` |
| 2 | `max-lines-per-function` |
| 1 | `complexity` |

### Detailed Lint Report
```
violet-vault/src/components/receipts/ReceiptScanner.tsx:67:79 - 1 - Arrow function has a complexity of 17. Maximum allowed is 15. (complexity)
violet-vault/src/hooks/bills/useBillDetail.ts:53:30 - 1 - Arrow function has too many lines (157). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/bills/useBillDetail.ts:82:6 - 1 - React Hook useMemo has a missing dependency: 'bill'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution.ts:52:9 - 1 - The 'budgetWithDefaults' logical expression could make the dependencies of useCallback Hook (at line 130) change on every render. To fix this, wrap the initialization of 'budgetWithDefaults' in its own useMemo() Hook. (react-hooks/exhaustive-deps)
violet-vault/src/hooks/budgeting/useSmartSuggestions.ts:104:29 - 1 - Arrow function has too many lines (151). Maximum allowed is 150. (max-lines-per-function)
```

## Typecheck Audit

### Files with Most Type Errors
- 3 errors in `src/hooks/analytics/useAnalyticsData.ts`
- 2 errors in `src/components/auth/AuthGateway.tsx`
- 1 errors in `src/hooks/common/usePrompt.ts`
- 1 errors in `src/components/transactions/TransactionLedger.tsx`
- 1 errors in `src/components/budgeting/EnvelopeGrid.tsx`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 6 | `TS2345` |
| 2 | `TS2322` |

### Detailed Type Error Report
```
src/components/auth/AuthGateway.tsx(26,28): error TS2345: Argument of type 'LocalOnlyUser' is not assignable to parameter of type 'import("violet-vault/src/types/auth").LocalOnlyUser'.
  Property 'userName' is optional in type 'LocalOnlyUser' but required in type 'LocalOnlyUser'.
src/components/auth/AuthGateway.tsx(79,30): error TS2345: Argument of type 'LocalOnlyUser' is not assignable to parameter of type 'import("violet-vault/src/types/auth").LocalOnlyUser'.
  Property 'userName' is optional in type 'LocalOnlyUser' but required in type 'LocalOnlyUser'.
src/components/budgeting/EnvelopeGrid.tsx(452,7): error TS2322: Type 'EnvelopeData[]' is not assignable to type '{ [key: string]: unknown; id: string; }[]'.
  Type 'EnvelopeData' is not assignable to type '{ [key: string]: unknown; id: string; }'.
    Index signature for type 'string' is missing in type 'EnvelopeData'.
src/components/transactions/TransactionLedger.tsx(188,7): error TS2322: Type 'unknown[]' is not assignable to type 'Record<string, unknown>[] | { data: Record<string, unknown>[]; }'.
  Type 'unknown[]' is not assignable to type 'Record<string, unknown>[]'.
    Type 'unknown' is not assignable to type 'Record<string, unknown>'.
      Index signature for type 'string' is missing in type '{}'.
src/hooks/analytics/useAnalyticsData.ts(61,59): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{}' is missing the following properties from type 'Envelope': id, name
src/hooks/analytics/useAnalyticsData.ts(78,64): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Property 'name' is missing in type '{}' but required in type 'Envelope'.
src/hooks/analytics/useAnalyticsData.ts(82,57): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Property 'name' is missing in type '{}' but required in type 'Envelope'.
src/hooks/common/usePrompt.ts(117,20): error TS2345: Argument of type 'string | void' is not assignable to parameter of type 'string'.
  Type 'void' is not assignable to type 'string'.
```

## Typecheck Strict Mode Audit

### Files with Most Strict Mode Errors
- 4 errors in `src/hooks/analytics/useAnalyticsData.ts`
- 2 errors in `src/hooks/common/useEditLock.ts`
- 2 errors in `src/components/debt/DebtDashboard.tsx`
- 1 errors in `src/hooks/common/useImportData.ts`
- 1 errors in `src/hooks/analytics/useReportExporter.ts`
- 1 errors in `src/components/transactions/TransactionLedger.tsx`
- 1 errors in `src/components/history/BudgetHistoryViewer.tsx`
- 1 errors in `src/components/budgeting/EnvelopeGrid.tsx`
- 1 errors in `src/components/bills/BulkUpdateEditor.tsx`

### Strict Mode Error Breakdown
| Count | Error Code |
|---|---|
| 8 | `TS2345` |
| 6 | `TS2322` |

### Detailed Strict Mode Report
```
src/components/bills/BulkUpdateEditor.tsx(106,15): error TS2322: Type '(billId: string, field: BillField, value: string | number) => void' is not assignable to type '(billId: string, field: string, value: string | number) => void'.
  Types of parameters 'field' and 'field' are incompatible.
    Type 'string' is not assignable to type 'BillField'.
src/components/budgeting/EnvelopeGrid.tsx(452,7): error TS2322: Type 'EnvelopeData[]' is not assignable to type '{ [key: string]: unknown; id: string; }[]'.
  Type 'EnvelopeData' is not assignable to type '{ [key: string]: unknown; id: string; }'.
    Index signature for type 'string' is missing in type 'EnvelopeData'.
src/components/debt/DebtDashboard.tsx(94,15): error TS2322: Type '(debt: DebtAccount) => void' is not assignable to type '(debt: DebtAccount | Debt) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/debt/DebtDashboard.tsx(95,15): error TS2322: Type '(debt: DebtAccount, amount: number) => void' is not assignable to type '(debt: DebtAccount | Debt, amount: number) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/history/BudgetHistoryViewer.tsx(153,15): error TS2322: Type '{ commit?: BudgetCommit | undefined; changes: BudgetChange[]; } | null' is not assignable to type 'CommitDetails | null'.
  Type '{ commit?: BudgetCommit | undefined; changes: BudgetChange[]; }' is not assignable to type 'CommitDetails'.
    Types of property 'commit' are incompatible.
      Type 'BudgetCommit | undefined' is not assignable to type 'Commit | undefined'.
        Type 'BudgetCommit' is not assignable to type 'Commit'.
          Types of property 'parentHash' are incompatible.
            Type 'string | null | undefined' is not assignable to type 'string | undefined'.
              Type 'null' is not assignable to type 'string | undefined'.
src/components/transactions/TransactionLedger.tsx(188,7): error TS2322: Type 'unknown[]' is not assignable to type 'Record<string, unknown>[] | { data: Record<string, unknown>[]; }'.
  Type 'unknown[]' is not assignable to type 'Record<string, unknown>[]'.
    Type 'unknown' is not assignable to type 'Record<string, unknown>'.
src/hooks/analytics/useAnalyticsData.ts(49,36): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type 'unknown' is not assignable to type 'Transaction'.
src/hooks/analytics/useAnalyticsData.ts(61,59): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type 'unknown' is not assignable to type 'Envelope'.
src/hooks/analytics/useAnalyticsData.ts(78,64): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type 'unknown' is not assignable to type 'Envelope'.
src/hooks/analytics/useAnalyticsData.ts(82,57): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type 'unknown' is not assignable to type 'Envelope'.
src/hooks/analytics/useReportExporter.ts(46,9): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'AnalyticsData'.
src/hooks/common/useEditLock.ts(120,37): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/hooks/common/useEditLock.ts(162,54): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/hooks/common/useImportData.ts(166,26): error TS2345: Argument of type '{ budgetId: string | null; encryptionKey: CryptoKey | null; currentUser: { userName: string; userColor: string; } | undefined; }' is not assignable to parameter of type 'SyncConfig'.
  Types of property 'budgetId' are incompatible.
    Type 'string | null' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
```

