# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 16 | +2 |
| TypeScript Errors | 21 | -12 |

*Last updated: 2025-10-30 16:43:27 UTC*

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
- 3 issues in `violet-vault/src/components/mobile/ResponsiveModal.tsx`
- 2 issues in `violet-vault/src/hooks/bills/useBillValidation.ts`
- 1 issues in `violet-vault/src/utils/common/highlight.ts`
- 1 issues in `violet-vault/src/hooks/savings/useSavingsGoals/index.ts`
- 1 issues in `violet-vault/src/hooks/debts/useDebtManagement.ts`
- 1 issues in `violet-vault/src/hooks/bills/useBillManager.ts`
- 1 issues in `violet-vault/src/hooks/analytics/useAnalyticsIntegration.ts`
- 1 issues in `violet-vault/src/hooks/analytics/queries/usePaycheckTrendsQuery.ts`
- 1 issues in `violet-vault/src/components/savings/DistributeModal.tsx`
- 1 issues in `violet-vault/src/components/layout/MainLayout.tsx`
- 1 issues in `violet-vault/src/components/charts/ChartContainer.tsx`
- 1 issues in `violet-vault/src/components/charts/CategoryBarChart.tsx`
- 1 issues in `violet-vault/src/components/budgeting/paycheck/PaycheckHistory.tsx`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 9 | `@typescript-eslint/no-explicit-any` |
| 4 | `max-lines-per-function` |
| 1 | `no-undef` |
| 1 | `complexity` |
| 1 | `@typescript-eslint/ban-ts-comment` |

### Detailed Lint Report
```
violet-vault/src/components/budgeting/paycheck/PaycheckHistory.tsx:26:25 - 1 - Arrow function has too many lines (177). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/charts/CategoryBarChart.tsx:14:62 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/components/charts/ChartContainer.tsx:34:4 - 1 - Arrow function has a complexity of 19. Maximum allowed is 15. (complexity)
violet-vault/src/components/layout/MainLayout.tsx:66:22 - 1 - 'React' is not defined. (no-undef)
violet-vault/src/components/mobile/ResponsiveModal.tsx:66:73 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/components/mobile/ResponsiveModal.tsx:67:35 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/components/mobile/ResponsiveModal.tsx:67:45 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/components/savings/DistributeModal.tsx:76:75 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/analytics/queries/usePaycheckTrendsQuery.ts:12:24 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/analytics/useAnalyticsIntegration.ts:44:67 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/bills/useBillManager.ts:64:31 - 1 - Arrow function has too many lines (190). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/bills/useBillValidation.ts:20:44 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/bills/useBillValidation.ts:20:66 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/debts/useDebtManagement.ts:85:34 - 1 - Arrow function has too many lines (151). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/savings/useSavingsGoals/index.ts:33:25 - 1 - Arrow function has too many lines (153). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/utils/common/highlight.ts:131:1 - 2 - Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free. (@typescript-eslint/ban-ts-comment)
```

## Typecheck Audit

### Files with Most Type Errors
- 1 errors in `src/utils/common/transactionArchiving.ts`
- 1 errors in `src/services/typedFirebaseSyncService.ts`
- 1 errors in `src/services/keys/keyManagementService.ts`
- 1 errors in `src/hooks/transactions/useTransactionFileUpload.ts`
- 1 errors in `src/hooks/layout/useLayoutData.ts`
- 1 errors in `src/hooks/debts/helpers/debtManagementHelpers.ts`
- 1 errors in `src/hooks/common/useConnectionManager.ts`
- 1 errors in `src/hooks/budgeting/usePaycheckProcessor.ts`
- 1 errors in `src/hooks/budgeting/useEnvelopeForm.ts`
- 1 errors in `src/hooks/budgeting/useBudgetData/paycheckMutations.ts`
- 1 errors in `src/hooks/budgeting/metadata/useBudgetMetadataQuery.ts`
- 1 errors in `src/hooks/budgeting/autofunding/utils/useRuleSummaries.ts`
- 1 errors in `src/hooks/budgeting/autofunding/utils/useRuleStatistics.ts`
- 1 errors in `src/hooks/budgeting/autofunding/queries/useRuleFilters.ts`
- 1 errors in `src/hooks/budgeting/autofunding/queries/useExecutableRules.ts`
- 1 errors in `src/hooks/bills/useBills/index.ts`
- 1 errors in `src/hooks/bills/useBills/billQueries.ts`
- 1 errors in `src/hooks/auth/useSecurityManagerUI.ts`
- 1 errors in `src/hooks/auth/useAuthenticationManager.ts`
- 1 errors in `src/hooks/auth/useAuthCompatibility.ts`
- 1 errors in `src/hooks/analytics/utils/pdfGeneratorUtils.ts`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 10 | `TS2345` |
| 4 | `TS2339` |
| 3 | `TS2322` |
| 1 | `TS2769` |
| 1 | `TS2739` |
| 1 | `TS2554` |
| 1 | `TS2538` |

### Detailed Type Error Report
```
src/hooks/analytics/utils/pdfGeneratorUtils.ts(89,54): error TS2339: Property 'envelopeAnalysis' does not exist on type 'unknown'.
src/hooks/auth/useAuthCompatibility.ts(63,38): error TS2339: Property 'refetch' does not exist on type '{ password: any; enabled: boolean; }'.
src/hooks/auth/useAuthenticationManager.ts(132,7): error TS2322: Type '(userDataOrPassword: any) => Promise<LoginResult>' is not assignable to type '(userDataOrPassword: unknown) => Promise<void>'.
  Type 'Promise<LoginResult>' is not assignable to type 'Promise<void>'.
    Type 'LoginResult' is not assignable to type 'void'.
src/hooks/auth/useSecurityManagerUI.ts(181,85): error TS2554: Expected 1-2 arguments, but got 3.
src/hooks/bills/useBills/billQueries.ts(219,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/bills/useBills/index.ts(22,60): error TS2339: Property 'daysAhead' does not exist on type '{}'.
src/hooks/budgeting/autofunding/queries/useExecutableRules.ts(21,57): error TS2345: Argument of type 'Rule' is not assignable to parameter of type 'import("violet-vault/src/utils/budgeting/autofunding/conditions").Rule'.
  Type 'Rule' is missing the following properties from type 'Rule': enabled, trigger, type
src/hooks/budgeting/autofunding/queries/useRuleFilters.ts(21,41): error TS2345: Argument of type 'Rule[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type 'Rule' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 7 more.
src/hooks/budgeting/autofunding/utils/useRuleStatistics.ts(20,32): error TS2345: Argument of type 'Rule[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type 'Rule' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 7 more.
src/hooks/budgeting/autofunding/utils/useRuleSummaries.ts(26,65): error TS2345: Argument of type 'Rule' is not assignable to parameter of type 'AutoFundingRule'.
  Type 'Rule' is missing the following properties from type 'AutoFundingRule': name, description, type, trigger, and 6 more.
src/hooks/budgeting/metadata/useBudgetMetadataQuery.ts(37,9): error TS2739: Type 'BudgetMetadata' is missing the following properties from type 'BudgetRecord': id, lastModified
src/hooks/budgeting/useBudgetData/paycheckMutations.ts(37,35): error TS2345: Argument of type 'void' is not assignable to parameter of type 'string'.
src/hooks/budgeting/useEnvelopeForm.ts(52,22): error TS2538: Type 'any' cannot be used as an index type.
src/hooks/budgeting/usePaycheckProcessor.ts(40,5): error TS2345: Argument of type '(allocations: AllocationItem[], paycheckAmount: number) => { isValid: boolean; message: string; overage?: number; }' is not assignable to parameter of type '(allocations: Allocation[], amount: number) => AllocationValidationResult'.
  Types of parameters 'allocations' and 'allocations' are incompatible.
    Type 'Allocation[]' is not assignable to type 'AllocationItem[]'.
      Type 'Allocation' is missing the following properties from type 'AllocationItem': envelopeId, envelopeName, amount, monthlyAmount, and 2 more.
src/hooks/common/useConnectionManager.ts(109,9): error TS2322: Type 'Envelope | Bill | Debt' is not assignable to type 'Envelope'.
  Property 'archived' is missing in type 'Bill' but required in type 'Envelope'.
src/hooks/debts/helpers/debtManagementHelpers.ts(468,7): error TS2345: Argument of type 'Bill' is not assignable to parameter of type 'import("violet-vault/src/db/types").Bill'.
  Type 'Bill' is missing the following properties from type 'Bill': name, category, isPaid, isRecurring, lastModified
src/hooks/layout/useLayoutData.ts(74,28): error TS2339: Property 'error' does not exist on type '{ envelopes: Envelope[]; transactions: any; bills: Bill[]; savingsGoals: SavingsGoal[]; paycheckHistory: PaycheckHistory[]; dashboardSummary: {}; ... 33 more ...; dashboardError: Error; }'.
src/hooks/transactions/useTransactionFileUpload.ts(57,48): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'ParsedRow[]'.
  Property '_index' is missing in type '{}' but required in type 'ParsedRow'.
src/services/keys/keyManagementService.ts(42,64): error TS2769: No overload matches this call.
  Overload 1 of 2, '(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>', gave the following error.
    Argument of type 'ArrayBufferLike' is not assignable to parameter of type 'BufferSource'.
      Type 'SharedArrayBuffer' is not assignable to type 'BufferSource'.
        Type 'SharedArrayBuffer' is not assignable to type 'ArrayBuffer'.
          Types of property '[Symbol.toStringTag]' are incompatible.
            Type '"SharedArrayBuffer"' is not assignable to type '"ArrayBuffer"'.
  Overload 2 of 2, '(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>', gave the following error.
    Argument of type 'ArrayBufferLike' is not assignable to parameter of type 'BufferSource'.
      Type 'SharedArrayBuffer' is not assignable to type 'BufferSource'.
        Type 'SharedArrayBuffer' is not assignable to type 'ArrayBuffer'.
          Types of property '[Symbol.toStringTag]' are incompatible.
            Type '"SharedArrayBuffer"' is not assignable to type '"ArrayBuffer"'.
src/services/typedFirebaseSyncService.ts(63,46): error TS2345: Argument of type 'string' is not assignable to parameter of type 'CryptoKey'.
src/utils/common/transactionArchiving.ts(445,39): error TS2345: Argument of type 'import("violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'import("/Users/thef4tdaddy/Git/violet-vault/src/db/types").Transaction'.
  Property 'lastModified' is missing in type 'import("violet-vault/src/types/finance").Transaction' but required in type 'import("/Users/thef4tdaddy/Git/violet-vault/src/db/types").Transaction'.
```

