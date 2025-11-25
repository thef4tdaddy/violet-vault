# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 6 | 0 |
| TypeScript Errors | 57 | 0 |
| TypeScript Strict Mode Errors | 400 | 0 |

*Last updated: 2025-11-25 20:07:27 UTC*

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
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/utils/common/lazyImport.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/utils/budgeting/autofunding/conditions.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/sync/useManualSync.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/useSmartSuggestions.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/budgeting/EditEnvelopeModal.tsx`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/auth/UserSetup.tsx`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 4 | `max-lines-per-function` |
| 1 | `react-hooks/exhaustive-deps` |
| 1 | `no-undef` |
| 1 | `complexity` |

### Detailed Lint Report
```
/home/runner/work/violet-vault/violet-vault/src/components/auth/UserSetup.tsx:26:19 - 1 - Arrow function has too many lines (151). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/components/budgeting/EditEnvelopeModal.tsx:27:27 - 1 - Arrow function has too many lines (152). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution.ts:51:9 - 1 - The 'budgetWithDefaults' logical expression could make the dependencies of useCallback Hook (at line 123) change on every render. To fix this, wrap the initialization of 'budgetWithDefaults' in its own useMemo() Hook. (react-hooks/exhaustive-deps)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/useSmartSuggestions.ts:63:29 - 1 - Arrow function has too many lines (190). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/hooks/sync/useManualSync.ts:65:30 - 1 - Arrow function has too many lines (159). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/utils/budgeting/autofunding/conditions.ts:355:11 - 1 - Arrow function has a complexity of 17. Maximum allowed is 15. (complexity)
/home/runner/work/violet-vault/violet-vault/src/utils/common/lazyImport.ts:14:31 - 1 - 'React' is not defined. (no-undef)
```

## Typecheck Audit

### Files with Most Type Errors
- 3 errors in `src/hooks/transactions/useTransactionLedger.ts`
- 3 errors in `src/components/transactions/import/ImportModal.tsx`
- 3 errors in `src/components/transactions/TransactionTable.tsx`
- 3 errors in `src/components/budgeting/PaycheckProcessor.tsx`
- 2 errors in `src/hooks/layout/usePaycheckOperations.ts`
- 2 errors in `src/hooks/auth/useAuthManager.ts`
- 2 errors in `src/hooks/analytics/useTransactionAnalysis.ts`
- 2 errors in `src/hooks/analytics/useSmartCategoryAnalysis.ts`
- 2 errors in `src/components/transactions/splitter/SplitAllocationsSection.tsx`
- 2 errors in `src/components/sync/health/SyncHealthDetails.tsx`
- 2 errors in `src/components/savings/SavingsGoals.tsx`
- 2 errors in `src/components/receipts/ReceiptScanner.tsx`
- 2 errors in `src/components/receipts/ReceiptButton.tsx`
- 2 errors in `src/components/layout/ViewRenderer.tsx`
- 2 errors in `src/components/budgeting/EditEnvelopeModal.tsx`
- 2 errors in `src/components/bills/BillTable.tsx`
- 1 errors in `src/utils/debts/debtCalculations.ts`
- 1 errors in `src/hooks/debts/useDebtDashboard.ts`
- 1 errors in `src/hooks/common/useTransactions.ts`
- 1 errors in `src/hooks/budgeting/usePaycheckHistory.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution.ts`
- 1 errors in `src/hooks/bills/useBillOperations.ts`
- 1 errors in `src/hooks/bills/useBillDetail.ts`
- 1 errors in `src/components/ui/SecurityAlert.tsx`
- 1 errors in `src/components/ui/ConfirmModal.tsx`
- 1 errors in `src/components/transactions/splitter/SplitterHeader.tsx`
- 1 errors in `src/components/settings/TransactionArchiving.tsx`
- 1 errors in `src/components/settings/SettingsDashboard.tsx`
- 1 errors in `src/components/settings/SecuritySettings.tsx`
- 1 errors in `src/components/security/LockScreen.tsx`
- 1 errors in `src/components/receipts/components/ExtractedDataField.tsx`
- 1 errors in `src/components/onboarding/OnboardingTutorial.tsx`
- 1 errors in `src/components/history/BudgetHistoryViewer.tsx`
- 1 errors in `src/components/debt/DebtStrategies.tsx`
- 1 errors in `src/components/debt/DebtDashboard.tsx`
- 1 errors in `src/components/budgeting/PaydayPrediction.tsx`
- 1 errors in `src/components/budgeting/CreateEnvelopeModalComponents.tsx`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 22 | `TS2322` |
| 21 | `TS2345` |
| 3 | `TS2769` |
| 2 | `TS2741` |
| 2 | `TS2719` |
| 2 | `TS2694` |
| 2 | `TS2459` |
| 1 | `TS2739` |
| 1 | `TS2353` |
| 1 | `TS18047` |

### Detailed Type Error Report
```
src/components/bills/BillTable.tsx(358,13): error TS2322: Type 'BillEntity[]' is not assignable to type 'Bill[]'.
  Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, color
src/components/bills/BillTable.tsx(359,13): error TS2322: Type 'Record<string, BillEntity[]>' is not assignable to type 'CategorizedBills'.
  'string' index signatures are incompatible.
    Type 'BillEntity[]' is not assignable to type 'Bill[]'.
      Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, color
src/components/budgeting/CreateEnvelopeModalComponents.tsx(171,11): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill[]' is not assignable to type 'Bill[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill' is not assignable to type 'Bill'.
    Index signature for type 'string' is missing in type 'Bill'.
src/components/budgeting/EditEnvelopeModal.tsx(66,5): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope' is not assignable to type 'Envelope'.
  Index signature for type 'string' is missing in type 'Envelope'.
src/components/budgeting/EditEnvelopeModal.tsx(185,9): error TS2322: Type '{ id: string; name?: string; currentBalance?: number; targetAmount?: number; }' is not assignable to type 'Envelope'.
  Property 'name' is optional in type '{ id: string; name?: string; currentBalance?: number; targetAmount?: number; }' but required in type 'Envelope'.
src/components/budgeting/PaycheckProcessor.tsx(59,5): error TS2322: Type '(paycheck: PaycheckHistoryItem) => Promise<void>' is not assignable to type '(id: string | number) => Promise<void>'.
  Types of parameters 'paycheck' and 'id' are incompatible.
    Type 'string | number' is not assignable to type 'PaycheckHistoryItem'.
      Type 'string' is not assignable to type 'PaycheckHistoryItem'.
src/components/budgeting/PaycheckProcessor.tsx(87,9): error TS2719: Type 'PaycheckHistoryItem[]' is not assignable to type 'PaycheckHistoryItem[]'. Two different types with this name exist, but they are unrelated.
  Type 'PaycheckHistoryItem' is not assignable to type 'PaycheckHistoryItem'. Two different types with this name exist, but they are unrelated.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/budgeting/PaycheckProcessor.tsx(88,9): error TS2322: Type '(paycheck: Paycheck) => Promise<void>' is not assignable to type '(paycheck: PaycheckHistoryItem) => void | Promise<void>'.
  Types of parameters 'paycheck' and 'paycheck' are incompatible.
    Type 'PaycheckHistoryItem' is not assignable to type 'Paycheck'.
      Property 'payerName' is optional in type 'PaycheckHistoryItem' but required in type 'Paycheck'.
src/components/budgeting/PaydayPrediction.tsx(105,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Object literal may only specify known properties, and 'title' does not exist in type 'Attributes & { className?: string; }'.
src/components/debt/DebtDashboard.tsx(122,15): error TS2353: Object literal may only specify known properties, and 'paymentDate' does not exist in type '{ amount: number; date?: string; }'.
src/components/debt/DebtStrategies.tsx(110,73): error TS2694: Namespace '"/home/runner/work/violet-vault/violet-vault/src/components/debt/ui/PaymentImpactTable"' has no exported member 'PaymentImpactScenario'.
src/components/history/BudgetHistoryViewer.tsx(139,15): error TS2322: Type '{ commit: BudgetCommit; changes: BudgetChange[]; }' is not assignable to type 'CommitDetails'.
  Types of property 'commit' are incompatible.
    Type 'BudgetCommit' is not assignable to type 'Commit'.
      Index signature for type 'string' is missing in type 'BudgetCommit'.
src/components/layout/ViewRenderer.tsx(337,78): error TS2694: Namespace '"/home/runner/work/violet-vault/violet-vault/src/types/bills"' has no exported member 'Transaction'.
src/components/layout/ViewRenderer.tsx(338,9): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Envelope[]' is not assignable to type 'Envelope[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Envelope' is not assignable to type 'Envelope'.
    Type 'Envelope' is not assignable to type '{ [key: string]: unknown; id: string | number; }'.
      Index signature for type 'string' is missing in type 'Envelope'.
src/components/onboarding/OnboardingTutorial.tsx(90,66): error TS2345: Argument of type '{ id: string; title: string; description: string; target: string; position: string; action: () => void; }' is not assignable to parameter of type 'TutorialStep'.
  Types of property 'position' are incompatible.
    Type 'string' is not assignable to type '"bottom" | "top" | "center" | "left" | "right"'.
src/components/receipts/ReceiptButton.tsx(160,11): error TS2322: Type 'ProcessedReceipt' is not assignable to type 'ReceiptData'.
  Types of property 'total' are incompatible.
    Type 'string' is not assignable to type 'number'.
src/components/receipts/ReceiptButton.tsx(161,11): error TS2322: Type '(transaction: Transaction, receipt: Receipt) => void' is not assignable to type '() => void'.
  Target signature provides too few arguments. Expected 2 or more, but got 0.
src/components/receipts/ReceiptScanner.tsx(60,25): error TS2345: Argument of type '(data: ReceiptProcessedData) => void' is not assignable to parameter of type 'OnReceiptProcessedCallback'.
  Types of parameters 'data' and 'data' are incompatible.
    Type 'ReceiptProcessedData' is not assignable to type 'ReceiptProcessedData'. Two different types with this name exist, but they are unrelated.
      Types of property 'imageData' are incompatible.
        Property 'preview' is missing in type 'UploadedImage' but required in type '{ file: File; preview: string; }'.
src/components/receipts/ReceiptScanner.tsx(95,37): error TS2322: Type 'ExtendedReceiptData' is not assignable to type 'ExtractedData'.
  Types of property 'total' are incompatible.
    Type 'string' is not assignable to type 'number'.
src/components/receipts/components/ExtractedDataField.tsx(27,49): error TS2345: Argument of type 'number' is not assignable to parameter of type 'ConfidenceLevel'.
src/components/savings/SavingsGoals.tsx(45,5): error TS2322: Type '(amount: number, goals: unknown[]) => void' is not assignable to type '(distribution: unknown) => void | Promise<void>'.
  Target signature provides too few arguments. Expected 2 or more, but got 1.
src/components/savings/SavingsGoals.tsx(134,17): error TS2741: Property 'color' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").SavingsGoal' but required in type 'SavingsGoal'.
src/components/security/LockScreen.tsx(239,20): error TS2345: Argument of type 'KeyboardEvent<HTMLInputElement>' is not assignable to parameter of type 'FormEvent<HTMLFormElement>'.
  Types of property 'currentTarget' are incompatible.
    Type 'EventTarget & HTMLInputElement' is not assignable to type 'EventTarget & HTMLFormElement'.
      Type 'EventTarget & HTMLInputElement' is missing the following properties from type 'HTMLFormElement': acceptCharset, action, elements, encoding, and 11 more.
src/components/settings/SecuritySettings.tsx(74,16): error TS2322: Type '{ isLocked: boolean; securitySettings: SecuritySettings; securityEvents: SecurityEvent[]; timeUntilAutoLock: () => "Active"; }' is not assignable to type 'SecurityStatusSectionProps'.
  Types of property 'securitySettings' are incompatible.
    Type 'import("/home/runner/work/violet-vault/violet-vault/src/services/security/securityService").SecuritySettings' is not assignable to type 'SecuritySettings'.
      Index signature for type 'string' is missing in type 'SecuritySettings'.
src/components/settings/SettingsDashboard.tsx(218,5): error TS2741: Property 'lockApp' is missing in type '{}' but required in type 'SecurityManager'.
src/components/settings/TransactionArchiving.tsx(87,9): error TS2322: Type '(urgency: string) => string' is not assignable to type '(urgency: string) => ComponentType<{ className?: string; }>'.
  Type 'string' is not assignable to type 'ComponentType<{ className?: string; }>'.
src/components/sync/health/SyncHealthDetails.tsx(57,50): error TS2345: Argument of type 'SyncStatus' is not assignable to parameter of type 'SyncStatus'.
  Index signature for type 'string' is missing in type 'SyncStatus'.
src/components/sync/health/SyncHealthDetails.tsx(59,56): error TS2345: Argument of type 'RecoveryResult' is not assignable to parameter of type 'RecoveryResult'.
  Index signature for type 'string' is missing in type 'RecoveryResult'.
src/components/transactions/TransactionTable.tsx(124,21): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to type 'Transaction'.
  Index signature for type 'string' is missing in type 'Transaction'.
src/components/transactions/TransactionTable.tsx(127,21): error TS2322: Type 'VirtualItem' is not assignable to type 'VirtualRow'.
  Index signature for type 'string' is missing in type 'VirtualItem'.
src/components/transactions/TransactionTable.tsx(374,11): error TS2322: Type 'string | number' is not assignable to type 'string'.
  Type 'number' is not assignable to type 'string'.
src/components/transactions/import/ImportModal.tsx(60,44): error TS2322: Type '(data: unknown[]) => void' is not assignable to type '(event: ChangeEvent<HTMLInputElement>, options: { clearExisting: boolean; }) => void'.
  Types of parameters 'data' and 'event' are incompatible.
    Type 'ChangeEvent<HTMLInputElement>' is missing the following properties from type 'unknown[]': length, pop, push, concat, and 29 more.
src/components/transactions/import/ImportModal.tsx(64,13): error TS2322: Type 'unknown[]' is not assignable to type 'ImportData | DataRow[]'.
  Type 'unknown[]' is not assignable to type 'DataRow[]'.
    Type 'unknown' is not assignable to type 'DataRow'.
      Index signature for type 'string' is missing in type '{}'.
src/components/transactions/import/ImportModal.tsx(73,51): error TS2322: Type '{ current: number; total: number; percentage: number; }' is not assignable to type 'number'.
src/components/transactions/splitter/SplitAllocationsSection.tsx(111,13): error TS2739: Type 'SplitAllocation' is missing the following properties from type 'Split': description, amount, category
src/components/transactions/splitter/SplitAllocationsSection.tsx(117,13): error TS2719: Type 'Envelope[]' is not assignable to type 'Envelope[]'. Two different types with this name exist, but they are unrelated.
  Type 'Envelope' is not assignable to type 'Envelope'. Two different types with this name exist, but they are unrelated.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/transactions/splitter/SplitterHeader.tsx(42,37): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/components/ui/ConfirmModal.tsx(55,30): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'string | FunctionComponent<{ className: string; }> | ComponentClass<{ className: string; }, any>'.
src/components/ui/SecurityAlert.tsx(99,22): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type 'string | number | bigint | true | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<...> | ComponentType<...>' is not assignable to parameter of type 'string | FunctionComponent<{ className?: string; }> | ComponentClass<{ className?: string; }, any>'.
      Type 'number' is not assignable to type 'string | FunctionComponent<{ className?: string; }> | ComponentClass<{ className?: string; }, any>'.
src/hooks/analytics/useSmartCategoryAnalysis.ts(47,5): error TS2345: Argument of type 'TransactionForStats[]' is not assignable to parameter of type 'Transaction[]'.
  Type 'TransactionForStats' is missing the following properties from type 'Transaction': id, description
src/hooks/analytics/useSmartCategoryAnalysis.ts(51,40): error TS2345: Argument of type 'Record<string, unknown>[]' is not assignable to parameter of type 'Bill[]'.
  Type 'Record<string, unknown>' is missing the following properties from type 'Bill': id, name, amount, frequency, and 3 more.
src/hooks/analytics/useTransactionAnalysis.ts(23,7): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]'.
  Property 'lastModified' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction'.
src/hooks/analytics/useTransactionAnalysis.ts(27,7): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]'.
  Property 'lastModified' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction'.
src/hooks/auth/useAuthManager.ts(17,8): error TS2459: Module '"./authOperations"' declares 'LoginResult' locally, but it is not exported.
src/hooks/auth/useAuthManager.ts(18,8): error TS2459: Module '"./authOperations"' declares 'AuthContext' locally, but it is not exported.
src/hooks/bills/useBillDetail.ts(74,72): error TS18047: 'bill.dueDate' is possibly 'null'.
src/hooks/bills/useBillOperations.ts(42,77): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Envelope[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope[]'.
  Property 'targetAmount' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Envelope' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(101,61): error TS2345: Argument of type '{ trigger: string; currentDate: string; data: { envelopes: unknown[]; unassignedCash: number; transactions: unknown[]; }; }' is not assignable to parameter of type 'ExecutionContext'.
  The types of 'data.envelopes' are incompatible between these types.
    Type 'unknown[]' is not assignable to type 'Envelope[]'.
      Type '{}' is missing the following properties from type 'Envelope': id, currentBalance
src/hooks/budgeting/usePaycheckHistory.ts(39,41): error TS2345: Argument of type 'string | number' is not assignable to parameter of type 'Record<string, unknown>'.
  Type 'string' is not assignable to type 'Record<string, unknown>'.
src/hooks/common/useTransactions.ts(42,48): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction'.
    Types of property 'date' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/debts/useDebtDashboard.ts(164,35): error TS2345: Argument of type '{ amount: number; date?: string; }' is not assignable to parameter of type '{ amount: number; paymentDate: string; notes?: string; }'.
  Property 'paymentDate' is missing in type '{ amount: number; date?: string; }' but required in type '{ amount: number; paymentDate: string; notes?: string; }'.
src/hooks/layout/usePaycheckOperations.ts(43,71): error TS2345: Argument of type 'PaycheckHistory[]' is not assignable to parameter of type 'Paycheck[]'.
  Type 'PaycheckHistory' is not assignable to type 'Paycheck'.
    Property 'amount' is optional in type 'PaycheckHistory' but required in type 'Paycheck'.
src/hooks/layout/usePaycheckOperations.ts(53,11): error TS2345: Argument of type 'VioletVaultDB' is not assignable to parameter of type '{ envelopes: { get: (id: string | number) => Promise<unknown>; update: (id: string | number, data: unknown) => Promise<void>; }; }'.
  The types of 'envelopes.update' are incompatible between these types.
    Type '(key: string | Envelope, changes: UpdateSpec<Envelope> | ((obj: Envelope, ctx: { value: any; primKey: IndexableType; }) => boolean | void)) => PromiseExtended<...>' is not assignable to type '(id: string | number, data: unknown) => Promise<void>'.
      Types of parameters 'key' and 'id' are incompatible.
        Type 'string | number' is not assignable to type 'string | Envelope'.
          Type 'number' is not assignable to type 'string | Envelope'.
src/hooks/transactions/useTransactionLedger.ts(82,5): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction'.
    Types of property 'date' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/transactions/useTransactionLedger.ts(155,46): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'CurrentUser'.
  Property 'userName' is missing in type '{}' but required in type 'CurrentUser'.
src/hooks/transactions/useTransactionLedger.ts(205,18): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'Transaction'.
  Types of property 'envelopeId' are incompatible.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.
src/utils/debts/debtCalculations.ts(84,52): error TS2345: Argument of type 'DebtAccount' is not assignable to parameter of type 'Debt'.
  Types of property 'nextPaymentDate' are incompatible.
    Type 'string | Date' is not assignable to type 'string'.
      Type 'Date' is not assignable to type 'string'.
```

## Typecheck Strict Mode Audit

### Files with Most Strict Mode Errors
- 11 errors in `src/hooks/bills/useBillManager.ts`
- 9 errors in `src/components/bills/BillManager.tsx`
- 8 errors in `src/hooks/transactions/useTransactionLedger.ts`
- 7 errors in `src/App.tsx`
- 6 errors in `src/components/pwa/UpdateAvailableModal.tsx`
- 5 errors in `src/hooks/savings/useSavingsGoals/index.ts`
- 5 errors in `src/hooks/debts/useDebtManagement.ts`
- 5 errors in `src/hooks/auth/useAuthManager.ts`
- 5 errors in `src/hooks/accounts/useSupplementalAccounts.ts`
- 5 errors in `src/components/sync/health/SyncHealthDetails.tsx`
- 5 errors in `src/components/pwa/PatchNotesModal.tsx`
- 4 errors in `src/stores/ui/uiStore.ts`
- 4 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution.ts`
- 4 errors in `src/components/transactions/import/ImportModal.tsx`
- 4 errors in `src/components/settings/SettingsDashboard.tsx`
- 4 errors in `src/components/receipts/ReceiptScanner.tsx`
- 4 errors in `src/components/layout/MainLayout.tsx`
- 4 errors in `src/components/budgeting/SmartEnvelopeSuggestions.tsx`
- 3 errors in `src/utils/sync/masterSyncValidator.ts`
- 3 errors in `src/hooks/settings/useSettingsDashboard.ts`
- 3 errors in `src/components/transactions/TransactionTable.tsx`
- 3 errors in `src/components/settings/archiving/ArchivingPreviewResults.tsx`
- 3 errors in `src/components/security/LocalDataSecurityWarning.tsx`
- 3 errors in `src/components/receipts/components/ReceiptImagePreview.tsx`
- 3 errors in `src/components/receipts/components/ReceiptActionButtons.tsx`
- 3 errors in `src/components/receipts/components/ExtractedItemsList.tsx`
- 3 errors in `src/components/receipts/ReceiptButton.tsx`
- 3 errors in `src/components/mobile/SlideUpModal.tsx`
- 3 errors in `src/components/layout/ViewRenderer.tsx`
- 3 errors in `src/components/charts/CategoryBarChart.tsx`
- 3 errors in `src/components/budgeting/envelope/EnvelopeItem.tsx`
- 3 errors in `src/components/budgeting/PaycheckProcessor.tsx`
- 3 errors in `src/components/budgeting/EditEnvelopeModal.tsx`
- 3 errors in `src/components/bills/modals/BillDetailModal.tsx`
- 3 errors in `src/components/bills/AddBillModal.tsx`
- 2 errors in `src/utils/security/keyExport.ts`
- 2 errors in `src/utils/query/queryClientConfig.ts`
- 2 errors in `src/utils/debts/debtCalculations.ts`
- 2 errors in `src/utils/common/transactionArchiving.ts`
- 2 errors in `src/utils/budgeting/envelopeCalculations.ts`
- 2 errors in `src/utils/bills/billUpdateHelpers.ts`
- 2 errors in `src/services/firebaseMessaging.ts`
- 2 errors in `src/services/editLockService.ts`
- 2 errors in `src/services/chunkedSyncService.ts`
- 2 errors in `src/services/bugReport/errorTrackingService.ts`
- 2 errors in `src/hooks/transactions/useTransactionsV2.ts`
- 2 errors in `src/hooks/transactions/useTransactionQuery.ts`
- 2 errors in `src/hooks/transactions/useTransactionImport.ts`
- 2 errors in `src/hooks/transactions/useTransactionFileUpload.ts`
- 2 errors in `src/hooks/sync/useFirebaseSync.ts`
- 2 errors in `src/hooks/layout/usePaycheckOperations.ts`
- 2 errors in `src/hooks/common/useRouterPageDetection.ts`
- 2 errors in `src/hooks/common/useNetworkStatus.ts`
- 2 errors in `src/hooks/common/useDataInitialization.ts`
- 2 errors in `src/hooks/common/useActualBalance.ts`
- 2 errors in `src/hooks/budgeting/useEnvelopesQuery.ts`
- 2 errors in `src/hooks/budgeting/useBudgetHistoryQuery.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useUndoOperations.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useExecutionHistory.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useAutoFunding.ts`
- 2 errors in `src/hooks/bills/useBillOperations.ts`
- 2 errors in `src/hooks/bills/useBillManagerHelpers.ts`
- 2 errors in `src/hooks/auth/useAuthenticationManager.ts`
- 2 errors in `src/hooks/auth/useAuthFlow.ts`
- 2 errors in `src/hooks/auth/mutations/useProfileMutations.ts`
- 2 errors in `src/hooks/auth/mutations/useLoginMutations.ts`
- 2 errors in `src/hooks/auth/mutations/useJoinBudgetMutation.ts`
- 2 errors in `src/hooks/analytics/utils/pdfGeneratorUtils.ts`
- 2 errors in `src/hooks/analytics/useTransactionAnalysis.ts`
- 2 errors in `src/hooks/analytics/useSmartCategoryAnalysis.ts`
- 2 errors in `src/hooks/analytics/queries/usePaycheckTrendsQuery.ts`
- 2 errors in `src/contexts/authUtils.ts`
- 2 errors in `src/components/transactions/splitter/SplitAllocationsSection.tsx`
- 2 errors in `src/components/transactions/TransactionLedger.tsx`
- 2 errors in `src/components/settings/sections/SyncDebugToolsSection.tsx`
- 2 errors in `src/components/settings/sections/GeneralSettingsSection.tsx`
- 2 errors in `src/components/savings/SavingsGoals.tsx`
- 2 errors in `src/components/pwa/OfflineStatusIndicator.tsx`
- 2 errors in `src/components/modals/UnassignedCashModal.tsx`
- 2 errors in `src/components/layout/SummaryCards.tsx`
- 2 errors in `src/components/history/BudgetHistoryViewer.tsx`
- 2 errors in `src/components/debt/ui/StrategyCard.tsx`
- 2 errors in `src/components/debt/ui/DebtSummaryCards.tsx`
- 2 errors in `src/components/debt/modals/DebtModalHeader.tsx`
- 2 errors in `src/components/debt/DebtStrategies.tsx`
- 2 errors in `src/components/debt/DebtDashboardComponents.tsx`
- 2 errors in `src/components/debt/DebtDashboard.tsx`
- 2 errors in `src/components/charts/ComposedFinancialChart.tsx`
- 2 errors in `src/components/budgeting/shared/FrequencySelector.tsx`
- 2 errors in `src/components/budgeting/shared/AllocationModeSelector.tsx`
- 2 errors in `src/components/budgeting/paycheck/PaycheckAmountInput.tsx`
- 2 errors in `src/components/budgeting/paycheck/AllocationPreview.tsx`
- 2 errors in `src/components/budgeting/envelope/UnassignedCashEnvelope.tsx`
- 2 errors in `src/components/budgeting/envelope/SwipeIndicatorOverlay.tsx`
- 2 errors in `src/components/budgeting/envelope/EnvelopeModalHeader.tsx`
- 2 errors in `src/components/budgeting/EnvelopeGrid.tsx`
- 2 errors in `src/components/budgeting/CreateEnvelopeModalComponents.tsx`
- 2 errors in `src/components/bills/smartBillMatcherHelpers.ts`
- 2 errors in `src/components/bills/BulkUpdateModeSelector.tsx`
- 2 errors in `src/components/bills/BulkBillUpdateModal.tsx`
- 2 errors in `src/components/bills/BillTable.tsx`
- 2 errors in `src/components/bills/BillFormFields.tsx`
- 2 errors in `src/components/automation/steps/TriggerScheduleStep.tsx`
- 2 errors in `src/components/automation/components/StepNavigation.tsx`
- 2 errors in `src/components/auth/components/UserNameInput.tsx`
- 2 errors in `src/components/auth/UserIndicator.tsx`
- 2 errors in `src/components/analytics/tabs/OverviewTab.tsx`
- 2 errors in `src/components/analytics/components/TabContent.tsx`
- 2 errors in `src/components/analytics/AnalyticsDashboard.tsx`
- 1 errors in `src/utils/transactions/operations.ts`
- 1 errors in `src/utils/sync/resilience/index.ts`
- 1 errors in `src/utils/sync/SyncQueue.ts`
- 1 errors in `src/utils/sync/RetryManager.ts`
- 1 errors in `src/utils/stores/createSafeStore.ts`
- 1 errors in `src/utils/query/prefetchHelpers.ts`
- 1 errors in `src/utils/query/backgroundSyncService.ts`
- 1 errors in `src/utils/pwa/patchNotesManager.ts`
- 1 errors in `src/utils/pageDetection/pageIdentifier.ts`
- 1 errors in `src/utils/debts/calculations/payoffProjection.ts`
- 1 errors in `src/utils/dataManagement/firebaseUtils.ts`
- 1 errors in `src/utils/dataManagement/backupUtils.ts`
- 1 errors in `src/utils/common/toastHelpers.ts`
- 1 errors in `src/utils/common/testBudgetHistory.ts`
- 1 errors in `src/utils/common/ocrProcessor.ts`
- 1 errors in `src/utils/common/highlight.ts`
- 1 errors in `src/utils/common/fixAutoAllocateUndefined.ts`
- 1 errors in `src/utils/common/budgetHistoryTracker.ts`
- 1 errors in `src/utils/budgeting/paycheckDeletion.ts`
- 1 errors in `src/utils/billIcons/iconOptions.ts`
- 1 errors in `src/utils/analytics/categoryPatterns.ts`
- 1 errors in `src/stores/ui/toastStore.ts`
- 1 errors in `src/services/typedChunkedSyncService.ts`
- 1 errors in `src/services/firebaseSyncService.ts`
- 1 errors in `src/services/activityLogger.ts`
- 1 errors in `src/hooks/sync/useSyncHealthIndicator.ts`
- 1 errors in `src/hooks/sharing/useQRCodeProcessing.ts`
- 1 errors in `src/hooks/notifications/useFirebaseMessaging.ts`
- 1 errors in `src/hooks/mobile/useSlideUpModal.ts`
- 1 errors in `src/hooks/mobile/useFABBehavior.ts`
- 1 errors in `src/hooks/debts/useDebtModalLogic.ts`
- 1 errors in `src/hooks/debts/useDebtDashboard.ts`
- 1 errors in `src/hooks/dashboard/useMainDashboard.ts`
- 1 errors in `src/hooks/common/useTransactions.ts`
- 1 errors in `src/hooks/common/usePrompt.ts`
- 1 errors in `src/hooks/common/useImportData.ts`
- 1 errors in `src/hooks/common/useConnectionManager/useConnectionConfig.ts`
- 1 errors in `src/hooks/common/useBugReport.ts`
- 1 errors in `src/hooks/budgeting/usePaycheckHistory.ts`
- 1 errors in `src/hooks/budgeting/usePaycheckFormValidated.ts`
- 1 errors in `src/hooks/budgeting/useBudgetData/queryFunctions.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingHistory.ts`
- 1 errors in `src/hooks/bills/useBulkBillOperations.ts`
- 1 errors in `src/hooks/bills/useBills/index.ts`
- 1 errors in `src/hooks/bills/useBillManagerDisplayLogic.ts`
- 1 errors in `src/hooks/auth/useKeyManagementUI.ts`
- 1 errors in `src/hooks/auth/mutations/usePasswordMutations.ts`
- 1 errors in `src/hooks/auth/authOperations.ts`
- 1 errors in `src/hooks/analytics/utils/csvImageExportUtils.ts`
- 1 errors in `src/hooks/analytics/useTransactionFiltering.ts`
- 1 errors in `src/hooks/analytics/useAnalyticsIntegration.ts`
- 1 errors in `src/components/ui/SecurityAlert.tsx`
- 1 errors in `src/components/ui/ConfirmModal.tsx`
- 1 errors in `src/components/transactions/splitter/SplitterHeader.tsx`
- 1 errors in `src/components/transactions/splitter/SplitTotals.tsx`
- 1 errors in `src/components/sync/ConflictResolutionModal.tsx`
- 1 errors in `src/components/settings/archiving/ArchivingResult.tsx`
- 1 errors in `src/components/settings/TransactionArchiving.tsx`
- 1 errors in `src/components/settings/SecuritySettings.tsx`
- 1 errors in `src/components/security/LockScreen.tsx`
- 1 errors in `src/components/receipts/components/ReceiptScannerHeader.tsx`
- 1 errors in `src/components/receipts/components/ExtractedDataField.tsx`
- 1 errors in `src/components/pages/MainDashboard.tsx`
- 1 errors in `src/components/onboarding/OnboardingTutorial.tsx`
- 1 errors in `src/components/monitoring/HighlightLoader.tsx`
- 1 errors in `src/components/mobile/FABActionMenu.tsx`
- 1 errors in `src/components/layout/AppWrapper.tsx`
- 1 errors in `src/components/history/viewer/HistoryStatistics.tsx`
- 1 errors in `src/components/history/viewer/HistoryHeader.tsx`
- 1 errors in `src/components/history/ObjectHistoryViewer.tsx`
- 1 errors in `src/components/history/IntegrityStatusIndicatorHelpers.tsx`
- 1 errors in `src/components/history/IntegrityStatusIndicator.tsx`
- 1 errors in `src/components/debt/ui/DebtProgressBar.tsx`
- 1 errors in `src/components/debt/ui/DebtCardProgressBar.tsx`
- 1 errors in `src/components/debt/modals/DebtFormFields.tsx`
- 1 errors in `src/components/debt/modals/DebtDetailModal.tsx`
- 1 errors in `src/components/debt/modals/AddDebtModal.tsx`
- 1 errors in `src/components/charts/TrendLineChart.tsx`
- 1 errors in `src/components/budgeting/suggestions/SuggestionsList.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeSummary.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeGridView.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeActivitySummary.tsx`
- 1 errors in `src/components/budgeting/PaydayPrediction.tsx`
- 1 errors in `src/components/budgeting/CashFlowSummary.tsx`
- 1 errors in `src/components/bills/modals/BulkUpdateConfirmModal.tsx`
- 1 errors in `src/components/bills/modals/BillDetailStats.tsx`
- 1 errors in `src/components/bills/modals/BillDetailSections.tsx`
- 1 errors in `src/components/bills/BillManagerModals.tsx`
- 1 errors in `src/components/bills/BillFormSections.tsx`
- 1 errors in `src/components/bills/BillDiscoveryModal.tsx`
- 1 errors in `src/components/automation/AutoFundingView.tsx`
- 1 errors in `src/components/automation/AutoFundingRuleBuilder.tsx`
- 1 errors in `src/components/auth/key-management/MainContent.tsx`
- 1 errors in `src/components/auth/components/UserSetupLayout.tsx`
- 1 errors in `src/components/auth/UserSetup.tsx`
- 1 errors in `src/components/auth/KeyManagementSettings.tsx`
- 1 errors in `src/components/analytics/TrendAnalysisCharts.tsx`
- 1 errors in `src/components/analytics/SmartCategoryManager.tsx`
- 1 errors in `src/components/analytics/CategorySuggestionsTab.tsx`
- 1 errors in `src/components/accounts/SupplementalAccounts.tsx`
- 1 errors in `src/components/accounts/ExpirationAlert.tsx`
- 1 errors in `src/components/accounts/AccountsGrid.tsx`

### Strict Mode Error Breakdown
| Count | Error Code |
|---|---|
| 113 | `TS2322` |
| 93 | `TS2345` |
| 54 | `TS7031` |
| 38 | `TS7005` |
| 25 | `TS7034` |
| 19 | `TS7006` |
| 13 | `TS2769` |
| 9 | `TS7053` |
| 7 | `TS18046` |
| 6 | `TS18048` |
| 3 | `TS2783` |
| 3 | `TS2719` |
| 3 | `TS2339` |
| 2 | `TS2722` |
| 2 | `TS2694` |
| 2 | `TS2459` |
| 2 | `TS18047` |
| 1 | `TS7016` |
| 1 | `TS2741` |
| 1 | `TS2739` |
| 1 | `TS2353` |
| 1 | `TS2352` |
| 1 | `TS2349` |

### Detailed Strict Mode Report
```
src/App.tsx(16,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/App.tsx(29,9): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/App.tsx(30,17): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/App.tsx(31,31): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/App.tsx(33,16): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/App.tsx(36,16): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/App.tsx(63,25): error TS2322: Type 'CloudSyncService' is not assignable to type 'FirebaseSyncService'.
  Types of property 'start' are incompatible.
    Type '(config: SyncConfig) => void' is not assignable to type '(config: unknown) => void'.
      Types of parameters 'config' and 'config' are incompatible.
        Type 'unknown' is not assignable to type 'SyncConfig'.
src/components/accounts/AccountsGrid.tsx(68,66): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string | undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/components/accounts/ExpirationAlert.tsx(31,57): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string | undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/components/accounts/SupplementalAccounts.tsx(157,11): error TS2322: Type '(accountId: string) => Promise<void>' is not assignable to type '(accountId: string | number) => void'.
  Types of parameters 'accountId' and 'accountId' are incompatible.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.
src/components/analytics/AnalyticsDashboard.tsx(169,5): error TS2322: Type 'unknown[]' is not assignable to type 'never[]'.
  Type 'unknown' is not assignable to type 'never'.
src/components/analytics/AnalyticsDashboard.tsx(170,5): error TS2322: Type 'NormalizedEnvelope[]' is not assignable to type 'never[]'.
  Type 'NormalizedEnvelope' is not assignable to type 'never'.
src/components/analytics/CategorySuggestionsTab.tsx(93,32): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/analytics/SmartCategoryManager.tsx(120,9): error TS2322: Type '(tabId: CategoryTabId) => void' is not assignable to type '(tabId: string) => void'.
  Types of parameters 'tabId' and 'tabId' are incompatible.
    Type 'string' is not assignable to type 'CategoryTabId'.
src/components/analytics/TrendAnalysisCharts.tsx(47,22): error TS2322: Type 'SpendingVelocity[]' is not assignable to type 'never[]'.
  Type 'SpendingVelocity' is not assignable to type 'never'.
src/components/analytics/components/TabContent.tsx(113,32): error TS2322: Type 'AnalyticsData | null | undefined' is not assignable to type 'AnalyticsData'.
  Type 'undefined' is not assignable to type 'AnalyticsData'.
src/components/analytics/components/TabContent.tsx(113,62): error TS2322: Type 'Record<string, unknown> | null | undefined' is not assignable to type 'BalanceData'.
  Type 'undefined' is not assignable to type 'BalanceData'.
src/components/analytics/tabs/OverviewTab.tsx(7,24): error TS7031: Binding element 'monthlyTrends' implicitly has an 'any' type.
src/components/analytics/tabs/OverviewTab.tsx(7,39): error TS7031: Binding element 'envelopeSpending' implicitly has an 'any' type.
src/components/auth/KeyManagementSettings.tsx(166,11): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/components/auth/UserIndicator.tsx(71,23): error TS2349: This expression is not callable.
  Type 'never' has no call signatures.
src/components/auth/UserIndicator.tsx(116,11): error TS2322: Type '((updates: { [key: string]: unknown; userName: string; userColor: string; budgetId?: string | undefined; }) => Promise<void>) | undefined' is not assignable to type '(updates: Record<string, unknown>) => void | Promise<void>'.
  Type 'undefined' is not assignable to type '(updates: Record<string, unknown>) => void | Promise<void>'.
src/components/auth/UserSetup.tsx(158,13): error TS2322: Type '(e: FormEvent) => Promise<void>' is not assignable to type '(e?: FormEvent<Element> | undefined) => void | Promise<void>'.
  Types of parameters 'e' and 'e' are incompatible.
    Type 'FormEvent<Element> | undefined' is not assignable to type 'FormEvent<Element>'.
      Type 'undefined' is not assignable to type 'FormEvent<Element>'.
src/components/auth/components/UserNameInput.tsx(7,3): error TS7031: Binding element 'value' implicitly has an 'any' type.
src/components/auth/components/UserNameInput.tsx(8,3): error TS7031: Binding element 'onChange' implicitly has an 'any' type.
src/components/auth/components/UserSetupLayout.tsx(6,28): error TS7031: Binding element 'children' implicitly has an 'any' type.
src/components/auth/key-management/MainContent.tsx(116,9): error TS2322: Type 'string | null' is not assignable to type 'string'.
  Type 'null' is not assignable to type 'string'.
src/components/automation/AutoFundingRuleBuilder.tsx(158,9): error TS2322: Type '(envelopeId: string) => void' is not assignable to type '(envelopeId: string | number) => void'.
  Types of parameters 'envelopeId' and 'envelopeId' are incompatible.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.
src/components/automation/AutoFundingView.tsx(120,11): error TS2322: Type 'FC<HistoryTabProps>' is not assignable to type 'ComponentType<{ executionHistory: unknown[]; showExecutionDetails: string | null; onToggleDetails: (show: string | null) => void; }>'.
  Type 'FunctionComponent<HistoryTabProps>' is not assignable to type 'FunctionComponent<{ executionHistory: unknown[]; showExecutionDetails: string | null; onToggleDetails: (show: string | null) => void; }>'.
    Type '{ executionHistory: unknown[]; showExecutionDetails: string | null; onToggleDetails: (show: string | null) => void; }' is not assignable to type 'HistoryTabProps'.
      Types of property 'executionHistory' are incompatible.
        Type 'unknown[]' is not assignable to type 'ExecutionHistoryEntry[]'.
          Type 'unknown' is not assignable to type 'ExecutionHistoryEntry'.
src/components/automation/components/StepNavigation.tsx(4,27): error TS7031: Binding element 'currentStep' implicitly has an 'any' type.
src/components/automation/components/StepNavigation.tsx(4,40): error TS7031: Binding element 'onStepChange' implicitly has an 'any' type.
src/components/automation/steps/TriggerScheduleStep.tsx(5,32): error TS7031: Binding element 'ruleData' implicitly has an 'any' type.
src/components/automation/steps/TriggerScheduleStep.tsx(5,42): error TS7031: Binding element 'updateRuleData' implicitly has an 'any' type.
src/components/bills/AddBillModal.tsx(211,5): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/components/bills/AddBillModal.tsx(257,5): error TS2322: Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'RefObject<HTMLDivElement>'.
  Type 'HTMLDivElement | null' is not assignable to type 'HTMLDivElement'.
    Type 'null' is not assignable to type 'HTMLDivElement'.
src/components/bills/AddBillModal.tsx(316,13): error TS2322: Type 'unknown' is not assignable to type 'LockData | null | undefined'.
src/components/bills/BillDiscoveryModal.tsx(76,23): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/components/bills/BillFormFields.tsx(89,9): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/bills/BillFormFields.tsx(101,11): error TS2322: Type 'boolean | null | undefined' is not assignable to type 'boolean | undefined'.
  Type 'null' is not assignable to type 'boolean | undefined'.
src/components/bills/BillFormSections.tsx(266,17): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Object literal may only specify known properties, and 'className' does not exist in type 'Attributes'.
src/components/bills/BillManager.tsx(144,5): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: unknown) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'unknown' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(145,5): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: unknown) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'unknown' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(172,9): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/bills/BillManager.tsx(208,9): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: BillEntity) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillEntity' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(230,9): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: BillEntity | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillEntity | null' is not assignable to type 'BillRecord | null'.
      Type 'BillEntity' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(231,9): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: BillEntity | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillEntity | null' is not assignable to type 'BillRecord | null'.
      Type 'BillEntity' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(236,9): error TS2322: Type '(updatedBills: Bill[]) => Promise<void>' is not assignable to type '(updates: BillEntity[]) => Promise<void>'.
  Types of parameters 'updatedBills' and 'updates' are incompatible.
    Type 'BillEntity[]' is not assignable to type 'Bill[]'.
      Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, category, color
src/components/bills/BillManager.tsx(237,9): error TS2322: Type '(billsToAdd: Bill[]) => Promise<void>' is not assignable to type '(bills: BillEntity[]) => Promise<void>'.
  Types of parameters 'billsToAdd' and 'bills' are incompatible.
    Type 'BillEntity[]' is not assignable to type 'Bill[]'.
      Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, category, color
src/components/bills/BillManager.tsx(239,9): error TS2322: Type '((error: string) => void) | undefined' is not assignable to type '(error: string) => void'.
  Type 'undefined' is not assignable to type '(error: string) => void'.
src/components/bills/BillManagerModals.tsx(115,11): error TS2322: Type '(billId: string, deleteEnvelope?: boolean | undefined) => Promise<void>' is not assignable to type '(id: unknown, deleteEnvelope?: boolean | undefined) => void | Promise<void>'.
  Types of parameters 'billId' and 'id' are incompatible.
    Type 'unknown' is not assignable to type 'string'.
src/components/bills/BillTable.tsx(358,13): error TS2322: Type 'BillEntity[]' is not assignable to type 'Bill[]'.
  Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, color
src/components/bills/BillTable.tsx(359,13): error TS2322: Type 'Record<string, BillEntity[]>' is not assignable to type 'CategorizedBills'.
  'string' index signatures are incompatible.
    Type 'BillEntity[]' is not assignable to type 'Bill[]'.
      Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, color
src/components/bills/BulkBillUpdateModal.tsx(111,17): error TS2322: Type '(billId: string, field: BillField, value: string | number) => void' is not assignable to type '(billId: string, field: string, value: string | number) => void'.
  Types of parameters 'field' and 'field' are incompatible.
    Type 'string' is not assignable to type 'BillField'.
src/components/bills/BulkBillUpdateModal.tsx(112,17): error TS2322: Type '(field: BillField, value: string | number) => void' is not assignable to type '(field: string, value: string | number) => void'.
  Types of parameters 'field' and 'field' are incompatible.
    Type 'string' is not assignable to type 'BillField'.
src/components/bills/BulkUpdateModeSelector.tsx(9,35): error TS7031: Binding element 'updateMode' implicitly has an 'any' type.
src/components/bills/BulkUpdateModeSelector.tsx(9,47): error TS7031: Binding element 'setUpdateMode' implicitly has an 'any' type.
src/components/bills/modals/BillDetailModal.tsx(53,23): error TS2322: Type 'Bill | null' is not assignable to type 'Bill'.
  Type 'null' is not assignable to type 'Bill'.
src/components/bills/modals/BillDetailModal.tsx(59,44): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/bills/modals/BillDetailModal.tsx(136,11): error TS2322: Type '(e: FormEvent<HTMLFormElement>) => Promise<void>' is not assignable to type '(e: FormEvent<Element>) => void | Promise<void>'.
  Types of parameters 'e' and 'e' are incompatible.
    Type 'FormEvent<Element>' is not assignable to type 'FormEvent<HTMLFormElement>'.
      Type 'Element' is missing the following properties from type 'HTMLFormElement': acceptCharset, action, autocomplete, elements, and 148 more.
src/components/bills/modals/BillDetailSections.tsx(45,29): error TS2769: No overload matches this call.
  Overload 1 of 4, '(value: string | number | Date): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'string | number | Date'.
      Type 'undefined' is not assignable to type 'string | number | Date'.
  Overload 2 of 4, '(value: string | number): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'string | number'.
      Type 'undefined' is not assignable to type 'string | number'.
src/components/bills/modals/BillDetailStats.tsx(10,35): error TS7031: Binding element 'bill' implicitly has an 'any' type.
src/components/bills/modals/BulkUpdateConfirmModal.tsx(74,53): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/bills/smartBillMatcherHelpers.ts(45,36): error TS7006: Parameter 'confidence' implicitly has an 'any' type.
src/components/bills/smartBillMatcherHelpers.ts(52,35): error TS7006: Parameter 'confidence' implicitly has an 'any' type.
src/components/budgeting/CashFlowSummary.tsx(4,28): error TS7031: Binding element 'cashFlow' implicitly has an 'any' type.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(171,11): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill[]' is not assignable to type 'Bill[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill' is not assignable to type 'Bill'.
    Index signature for type 'string' is missing in type 'Bill'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(172,11): error TS2322: Type 'string | undefined' is not assignable to type 'string | null'.
  Type 'undefined' is not assignable to type 'string | null'.
src/components/budgeting/EditEnvelopeModal.tsx(66,5): error TS2322: Type 'Envelope | null' is not assignable to type 'Envelope | null | undefined'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope' is not assignable to type 'Envelope'.
    Index signature for type 'string' is missing in type 'Envelope'.
src/components/budgeting/EditEnvelopeModal.tsx(154,13): error TS2322: Type 'LockDocument | null' is not assignable to type 'null | undefined'.
  Type 'LockDocument' is not assignable to type 'null | undefined'.
src/components/budgeting/EditEnvelopeModal.tsx(185,9): error TS2322: Type '{ id: string; name?: string | undefined; currentBalance?: number | undefined; targetAmount?: number | undefined; } | null' is not assignable to type 'Envelope | null'.
  Type '{ id: string; name?: string | undefined; currentBalance?: number | undefined; targetAmount?: number | undefined; }' is not assignable to type 'Envelope'.
    Types of property 'name' are incompatible.
      Type 'string | undefined' is not assignable to type 'string'.
        Type 'undefined' is not assignable to type 'string'.
src/components/budgeting/EnvelopeGrid.tsx(3,8): error TS7034: Variable 'useUiStoreRaw' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/budgeting/EnvelopeGrid.tsx(302,22): error TS7005: Variable 'useUiStoreRaw' implicitly has an 'any' type.
src/components/budgeting/PaycheckProcessor.tsx(59,5): error TS2322: Type '(paycheck: PaycheckHistoryItem) => Promise<void>' is not assignable to type '(id: string | number) => Promise<void>'.
  Types of parameters 'paycheck' and 'id' are incompatible.
    Type 'string | number' is not assignable to type 'PaycheckHistoryItem'.
      Type 'string' is not assignable to type 'PaycheckHistoryItem'.
src/components/budgeting/PaycheckProcessor.tsx(87,9): error TS2719: Type 'PaycheckHistoryItem[]' is not assignable to type 'PaycheckHistoryItem[]'. Two different types with this name exist, but they are unrelated.
  Type 'PaycheckHistoryItem' is not assignable to type 'PaycheckHistoryItem'. Two different types with this name exist, but they are unrelated.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/budgeting/PaycheckProcessor.tsx(88,9): error TS2322: Type '(paycheck: Paycheck) => Promise<void>' is not assignable to type '(paycheck: PaycheckHistoryItem) => void | Promise<void>'.
  Types of parameters 'paycheck' and 'paycheck' are incompatible.
    Type 'PaycheckHistoryItem' is not assignable to type 'Paycheck'.
      Types of property 'payerName' are incompatible.
        Type 'string | undefined' is not assignable to type 'string'.
          Type 'undefined' is not assignable to type 'string'.
src/components/budgeting/PaydayPrediction.tsx(105,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Object literal may only specify known properties, and 'title' does not exist in type 'Attributes & { className?: string | undefined; }'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(227,5): error TS2322: Type '(envelope: Partial<Envelope>) => void' is not assignable to type '(data: unknown) => void | Promise<void>'.
  Types of parameters 'envelope' and 'data' are incompatible.
    Type 'unknown' is not assignable to type 'Partial<Envelope>'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(282,11): error TS2322: Type '(newSettings: Partial<typeof DEFAULT_ANALYSIS_SETTINGS>) => void' is not assignable to type '(settings: unknown) => void'.
  Types of parameters 'newSettings' and 'settings' are incompatible.
    Type 'unknown' is not assignable to type 'Partial<{ minAmount: number; minTransactions: number; overspendingThreshold: number; overfundingThreshold: number; bufferPercentage: number; }>'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(289,11): error TS2322: Type '(suggestion: { id: string; action: string; data: Record<string, unknown>; [key: string]: unknown; }) => Promise<void>' is not assignable to type '(suggestion: unknown) => void'.
  Types of parameters 'suggestion' and 'suggestion' are incompatible.
    Type 'unknown' is not assignable to type '{ [key: string]: unknown; id: string; action: string; data: Record<string, unknown>; }'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(290,11): error TS2322: Type '(suggestionId: string) => void' is not assignable to type '(suggestion: unknown) => void'.
  Types of parameters 'suggestionId' and 'suggestion' are incompatible.
    Type 'unknown' is not assignable to type 'string'.
src/components/budgeting/envelope/EnvelopeActivitySummary.tsx(11,36): error TS7031: Binding element 'envelope' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeGridView.tsx(101,30): error TS2345: Argument of type '(envelope: { id: string; [key: string]: unknown; }) => JSX.Element' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => Element'.
  Types of parameters 'envelope' and 'value' are incompatible.
    Type 'unknown' is not assignable to type '{ [key: string]: unknown; id: string; }'.
src/components/budgeting/envelope/EnvelopeItem.tsx(77,9): error TS2322: Type '((envelopeId: string) => void) | undefined' is not assignable to type '(envelopeId: string) => void'.
  Type 'undefined' is not assignable to type '(envelopeId: string) => void'.
src/components/budgeting/envelope/EnvelopeItem.tsx(78,9): error TS2322: Type '((envelope: Envelope) => void) | undefined' is not assignable to type '(envelope: Envelope) => void'.
  Type 'undefined' is not assignable to type '(envelope: Envelope) => void'.
src/components/budgeting/envelope/EnvelopeItem.tsx(79,9): error TS2322: Type '((envelope: Envelope) => void) | undefined' is not assignable to type '(envelope: Envelope) => void'.
  Type 'undefined' is not assignable to type '(envelope: Envelope) => void'.
src/components/budgeting/envelope/EnvelopeModalHeader.tsx(15,3): error TS7031: Binding element 'onBreakLock' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeModalHeader.tsx(16,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeSummary.tsx(3,28): error TS7031: Binding element 'totals' implicitly has an 'any' type.
src/components/budgeting/envelope/SwipeIndicatorOverlay.tsx(11,34): error TS7031: Binding element 'swipeState' implicitly has an 'any' type.
src/components/budgeting/envelope/SwipeIndicatorOverlay.tsx(11,46): error TS7031: Binding element 'unassignedCash' implicitly has an 'any' type.
src/components/budgeting/envelope/UnassignedCashEnvelope.tsx(4,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/budgeting/envelope/UnassignedCashEnvelope.tsx(15,35): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/budgeting/paycheck/AllocationPreview.tsx(147,51): error TS18048: 'allocation.monthlyAmount' is possibly 'undefined'.
src/components/budgeting/paycheck/AllocationPreview.tsx(149,44): error TS18048: 'allocation.monthlyAmount' is possibly 'undefined'.
src/components/budgeting/paycheck/PaycheckAmountInput.tsx(8,32): error TS7031: Binding element 'value' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAmountInput.tsx(8,39): error TS7031: Binding element 'onChange' implicitly has an 'any' type.
src/components/budgeting/shared/AllocationModeSelector.tsx(9,35): error TS7031: Binding element 'autoAllocate' implicitly has an 'any' type.
src/components/budgeting/shared/AllocationModeSelector.tsx(9,49): error TS7031: Binding element 'onAutoAllocateChange' implicitly has an 'any' type.
src/components/budgeting/shared/FrequencySelector.tsx(11,3): error TS7031: Binding element 'selectedFrequency' implicitly has an 'any' type.
src/components/budgeting/shared/FrequencySelector.tsx(12,3): error TS7031: Binding element 'onFrequencyChange' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionsList.tsx(128,19): error TS2322: Type '(suggestion: import("/home/runner/work/violet-vault/violet-vault/src/components/budgeting/suggestions/SuggestionsList").Suggestion) => void' is not assignable to type '(suggestion: Suggestion) => void'.
  Types of parameters 'suggestion' and 'suggestion' are incompatible.
    Type 'Suggestion' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/components/budgeting/suggestions/SuggestionsList").Suggestion'.
      Index signature for type 'string' is missing in type 'Suggestion'.
src/components/charts/CategoryBarChart.tsx(153,14): error TS2769: No overload matches this call.
  Overload 2 of 2, '(props: Props): string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<...> | Component<...> | null | undefined', gave the following error.
    Type 'unknown' is not assignable to type 'Key | null | undefined'.
  Overload 2 of 2, '(props: Props): string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<...> | Component<...> | null | undefined', gave the following error.
    Type 'number[]' is not assignable to type 'number | [number, number, number, number] | undefined'.
      Type 'number[]' is not assignable to type '[number, number, number, number]'.
        Target requires 4 element(s) but source may have fewer.
  Overload 2 of 2, '(props: Props): string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<...> | Component<...> | null | undefined', gave the following error.
    Type '{}' is not assignable to type 'string'.
src/components/charts/CategoryBarChart.tsx(157,15): error TS2783: 'fill' is specified more than once, so this usage will be overwritten.
src/components/charts/CategoryBarChart.tsx(157,57): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/components/charts/ComposedFinancialChart.tsx(230,33): error TS7031: Binding element 'data' implicitly has an 'any' type.
src/components/charts/ComposedFinancialChart.tsx(258,3): error TS7031: Binding element 'data' implicitly has an 'any' type.
src/components/charts/TrendLineChart.tsx(63,18): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ line: { type: string; dataKey: string; name: string; stroke: string; strokeWidth: number; }[]; area: ({ type: string; dataKey: string; name: string; stroke: string; fill: string; fillOpacity: number; strokeWidth?: undefined; } | { ...; })[]; bar: ({ ...; } | { ...; })[]; }'.
  No index signature with a parameter of type 'string' was found on type '{ line: { type: string; dataKey: string; name: string; stroke: string; strokeWidth: number; }[]; area: ({ type: string; dataKey: string; name: string; stroke: string; fill: string; fillOpacity: number; strokeWidth?: undefined; } | { ...; })[]; bar: ({ ...; } | { ...; })[]; }'.
src/components/debt/DebtDashboard.tsx(66,52): error TS2322: Type 'Dispatch<SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>>' is not assignable to type 'Dispatch<SetStateAction<Record<string, string | boolean>>>'.
  Type 'SetStateAction<Record<string, string | boolean>>' is not assignable to type 'SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>'.
    Type 'Record<string, string | boolean>' is not assignable to type 'SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>'.
      Type 'Record<string, string | boolean>' is missing the following properties from type '{ type: string; status: string; sortBy: string; sortOrder: string; }': type, status, sortBy, sortOrder
src/components/debt/DebtDashboard.tsx(122,15): error TS2353: Object literal may only specify known properties, and 'paymentDate' does not exist in type '{ amount: number; date?: string | undefined; }'.
src/components/debt/DebtDashboardComponents.tsx(62,15): error TS2322: Type '(debt: DebtAccount) => void' is not assignable to type '(debt: DebtAccount | Debt) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/debt/DebtDashboardComponents.tsx(63,15): error TS2322: Type '(debt: DebtAccount, amount: number) => void' is not assignable to type '(debt: DebtAccount | Debt, amount: number) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/debt/DebtStrategies.tsx(11,27): error TS7031: Binding element 'debts' implicitly has an 'any' type.
src/components/debt/DebtStrategies.tsx(110,73): error TS2694: Namespace '"/home/runner/work/violet-vault/violet-vault/src/components/debt/ui/PaymentImpactTable"' has no exported member 'PaymentImpactScenario'.
src/components/debt/modals/AddDebtModal.tsx(47,7): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/debt/modals/DebtDetailModal.tsx(89,27): error TS2322: Type '{ expectedPayoff: string; totalInterest: string; payoffDate: string; } | null' is not assignable to type '{ expectedPayoff: string; totalInterest: string; payoffDate: string; }'.
  Type 'null' is not assignable to type '{ expectedPayoff: string; totalInterest: string; payoffDate: string; }'.
src/components/debt/modals/DebtFormFields.tsx(96,11): error TS2322: Type 'string | null | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/debt/modals/DebtModalHeader.tsx(9,28): error TS7031: Binding element 'isEditMode' implicitly has an 'any' type.
src/components/debt/modals/DebtModalHeader.tsx(9,40): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/debt/ui/DebtCardProgressBar.tsx(5,32): error TS7031: Binding element 'progressData' implicitly has an 'any' type.
src/components/debt/ui/DebtProgressBar.tsx(5,28): error TS7031: Binding element 'progressData' implicitly has an 'any' type.
src/components/debt/ui/DebtSummaryCards.tsx(8,29): error TS7031: Binding element 'stats' implicitly has an 'any' type.
src/components/debt/ui/DebtSummaryCards.tsx(8,36): error TS7031: Binding element 'onDueSoonClick' implicitly has an 'any' type.
src/components/debt/ui/StrategyCard.tsx(8,25): error TS7031: Binding element 'strategy' implicitly has an 'any' type.
src/components/debt/ui/StrategyCard.tsx(78,35): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/components/history/BudgetHistoryViewer.tsx(62,28): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/components/history/BudgetHistoryViewer.tsx(139,15): error TS2322: Type '{ commit: BudgetCommit | undefined; changes: BudgetChange[]; } | null | undefined' is not assignable to type 'CommitDetails | null'.
  Type 'undefined' is not assignable to type 'CommitDetails | null'.
src/components/history/IntegrityStatusIndicator.tsx(148,40): error TS2769: No overload matches this call.
  Overload 1 of 4, '(value: string | number | Date): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'string | number | Date'.
      Type 'undefined' is not assignable to type 'string | number | Date'.
  Overload 2 of 4, '(value: string | number): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'string | number'.
      Type 'undefined' is not assignable to type 'string | number'.
src/components/history/IntegrityStatusIndicatorHelpers.tsx(185,75): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/history/ObjectHistoryViewer.tsx(39,7): error TS2322: Type 'string | boolean' is not assignable to type 'boolean'.
  Type 'string' is not assignable to type 'boolean'.
src/components/history/viewer/HistoryHeader.tsx(7,26): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/history/viewer/HistoryStatistics.tsx(4,30): error TS7031: Binding element 'statistics' implicitly has an 'any' type.
src/components/layout/AppWrapper.tsx(9,23): error TS7031: Binding element 'firebaseSync' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(3,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/layout/MainLayout.tsx(240,24): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(288,20): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(289,21): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/SummaryCards.tsx(4,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/layout/SummaryCards.tsx(33,35): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/ViewRenderer.tsx(321,9): error TS2322: Type '(paycheck: PaycheckHistory) => Promise<void>' is not assignable to type '(paycheck: PaycheckHistoryItem) => Promise<void>'.
  Types of parameters 'paycheck' and 'paycheck' are incompatible.
    Property 'lastModified' is missing in type 'PaycheckHistoryItem' but required in type 'PaycheckHistory'.
src/components/layout/ViewRenderer.tsx(337,78): error TS2694: Namespace '"/home/runner/work/violet-vault/violet-vault/src/types/bills"' has no exported member 'Transaction'.
src/components/layout/ViewRenderer.tsx(338,9): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Envelope[]' is not assignable to type 'Envelope[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Envelope' is not assignable to type 'Envelope'.
    Type 'Envelope' is not assignable to type '{ [key: string]: unknown; id: string | number; }'.
      Index signature for type 'string' is missing in type 'Envelope'.
src/components/mobile/FABActionMenu.tsx(124,11): error TS2719: Type 'FABAction' is not assignable to type 'FABAction'. Two different types with this name exist, but they are unrelated.
  Types of property 'action' are incompatible.
    Type '(() => void) | null' is not assignable to type '(() => void) | undefined'.
      Type 'null' is not assignable to type '(() => void) | undefined'.
src/components/mobile/SlideUpModal.tsx(302,5): error TS2345: Argument of type 'RefObject<HTMLDivElement | null>' is not assignable to parameter of type 'RefObject<HTMLDivElement>'.
  Type 'HTMLDivElement | null' is not assignable to type 'HTMLDivElement'.
    Type 'null' is not assignable to type 'HTMLDivElement'.
src/components/mobile/SlideUpModal.tsx(350,9): error TS2322: Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'RefObject<HTMLDivElement>'.
  Type 'HTMLDivElement | null' is not assignable to type 'HTMLDivElement'.
    Type 'null' is not assignable to type 'HTMLDivElement'.
src/components/mobile/SlideUpModal.tsx(351,9): error TS2322: Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'RefObject<HTMLDivElement>'.
  Type 'HTMLDivElement | null' is not assignable to type 'HTMLDivElement'.
    Type 'null' is not assignable to type 'HTMLDivElement'.
src/components/modals/UnassignedCashModal.tsx(311,6): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/modals/UnassignedCashModal.tsx(315,6): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/monitoring/HighlightLoader.tsx(22,63): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/onboarding/OnboardingTutorial.tsx(90,66): error TS2345: Argument of type '{ id: string; title: string; description: string; target: null; position: string; action: () => void; } | { id: string; title: string; description: string; target: string; position: string; action: () => void; }' is not assignable to parameter of type 'TutorialStep'.
  Type '{ id: string; title: string; description: string; target: null; position: string; action: () => void; }' is not assignable to type 'TutorialStep'.
    Types of property 'position' are incompatible.
      Type 'string' is not assignable to type '"bottom" | "top" | "center" | "left" | "right" | undefined'.
src/components/pages/MainDashboard.tsx(167,9): error TS2322: Type '(updates: Partial<TransactionFormState>) => void' is not assignable to type '(updates: Partial<NewTransaction>) => void'.
  Types of parameters 'updates' and 'updates' are incompatible.
    Type 'Partial<NewTransaction>' is not assignable to type 'Partial<TransactionFormState>'.
      Types of property 'amount' are incompatible.
        Type 'string | number | undefined' is not assignable to type 'string | undefined'.
          Type 'number' is not assignable to type 'string'.
src/components/pwa/OfflineStatusIndicator.tsx(4,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/pwa/OfflineStatusIndicator.tsx(34,20): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/PatchNotesModal.tsx(6,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/pwa/PatchNotesModal.tsx(89,26): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/PatchNotesModal.tsx(90,26): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/PatchNotesModal.tsx(93,29): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/PatchNotesModal.tsx(94,31): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/UpdateAvailableModal.tsx(4,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/pwa/UpdateAvailableModal.tsx(37,61): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/pwa/UpdateAvailableModal.tsx(55,27): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/UpdateAvailableModal.tsx(56,22): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/UpdateAvailableModal.tsx(57,30): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/UpdateAvailableModal.tsx(58,21): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/receipts/ReceiptButton.tsx(55,47): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/receipts/ReceiptButton.tsx(160,11): error TS2322: Type 'ProcessedReceipt' is not assignable to type 'ReceiptData'.
  Types of property 'merchant' are incompatible.
    Type 'string | null' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/components/receipts/ReceiptButton.tsx(161,11): error TS2322: Type '(transaction: Transaction, receipt: Receipt) => void' is not assignable to type '() => void'.
  Target signature provides too few arguments. Expected 2 or more, but got 0.
src/components/receipts/ReceiptScanner.tsx(60,25): error TS2345: Argument of type '(data: ReceiptProcessedData) => void' is not assignable to parameter of type 'OnReceiptProcessedCallback'.
  Types of parameters 'data' and 'data' are incompatible.
    Type 'ReceiptProcessedData' is not assignable to type 'ReceiptProcessedData'. Two different types with this name exist, but they are unrelated.
      Types of property 'imageData' are incompatible.
        Property 'preview' is missing in type 'UploadedImage' but required in type '{ file: File; preview: string; }'.
src/components/receipts/ReceiptScanner.tsx(77,15): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/components/receipts/ReceiptScanner.tsx(78,15): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/components/receipts/ReceiptScanner.tsx(95,37): error TS2322: Type 'ExtendedReceiptData' is not assignable to type 'ExtractedData'.
  Types of property 'merchant' are incompatible.
    Type 'string | null' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/components/receipts/components/ExtractedDataField.tsx(27,49): error TS2345: Argument of type 'number' is not assignable to parameter of type 'ConfidenceLevel'.
src/components/receipts/components/ExtractedItemsList.tsx(5,31): error TS7031: Binding element 'items' implicitly has an 'any' type.
src/components/receipts/components/ExtractedItemsList.tsx(16,35): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/receipts/components/ExtractedItemsList.tsx(16,41): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/receipts/components/ReceiptActionButtons.tsx(8,33): error TS7031: Binding element 'extractedData' implicitly has an 'any' type.
src/components/receipts/components/ReceiptActionButtons.tsx(8,48): error TS7031: Binding element 'onReset' implicitly has an 'any' type.
src/components/receipts/components/ReceiptActionButtons.tsx(8,57): error TS7031: Binding element 'onConfirm' implicitly has an 'any' type.
src/components/receipts/components/ReceiptImagePreview.tsx(10,32): error TS7031: Binding element 'uploadedImage' implicitly has an 'any' type.
src/components/receipts/components/ReceiptImagePreview.tsx(10,47): error TS7031: Binding element 'showImagePreview' implicitly has an 'any' type.
src/components/receipts/components/ReceiptImagePreview.tsx(10,65): error TS7031: Binding element 'onTogglePreview' implicitly has an 'any' type.
src/components/receipts/components/ReceiptScannerHeader.tsx(9,33): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/savings/SavingsGoals.tsx(45,5): error TS2322: Type '(amount: number, goals: unknown[]) => void' is not assignable to type '(distribution: unknown) => void | Promise<void>'.
  Target signature provides too few arguments. Expected 2 or more, but got 1.
src/components/savings/SavingsGoals.tsx(134,17): error TS2741: Property 'color' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").SavingsGoal' but required in type 'SavingsGoal'.
src/components/security/LocalDataSecurityWarning.tsx(12,37): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/security/LocalDataSecurityWarning.tsx(12,46): error TS7031: Binding element 'onAcknowledge' implicitly has an 'any' type.
src/components/security/LocalDataSecurityWarning.tsx(133,26): error TS7031: Binding element 'onAcknowledge' implicitly has an 'any' type.
src/components/security/LockScreen.tsx(239,20): error TS2345: Argument of type 'KeyboardEvent<HTMLInputElement>' is not assignable to parameter of type 'FormEvent<HTMLFormElement>'.
  Types of property 'currentTarget' are incompatible.
    Type 'EventTarget & HTMLInputElement' is not assignable to type 'EventTarget & HTMLFormElement'.
      Type 'EventTarget & HTMLInputElement' is missing the following properties from type 'HTMLFormElement': acceptCharset, action, elements, encoding, and 11 more.
src/components/settings/SecuritySettings.tsx(74,16): error TS2322: Type '{ isLocked: boolean; securitySettings: SecuritySettings; securityEvents: SecurityEvent[]; timeUntilAutoLock: () => "Active" | null; }' is not assignable to type 'SecurityStatusSectionProps'.
  Types of property 'securitySettings' are incompatible.
    Type 'import("/home/runner/work/violet-vault/violet-vault/src/services/security/securityService").SecuritySettings' is not assignable to type 'SecuritySettings'.
      Index signature for type 'string' is missing in type 'SecuritySettings'.
src/components/settings/SettingsDashboard.tsx(100,7): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/settings/SettingsDashboard.tsx(215,5): error TS2322: Type '(profile: { userName: string; userColor: string; }) => void' is not assignable to type '(profile: UserProfile) => void'.
  Types of parameters 'profile' and 'profile' are incompatible.
    Type 'UserProfile' is not assignable to type '{ userName: string; userColor: string; }'.
      Types of property 'userName' are incompatible.
        Type 'string | undefined' is not assignable to type 'string'.
          Type 'undefined' is not assignable to type 'string'.
src/components/settings/SettingsDashboard.tsx(218,5): error TS2322: Type 'unknown' is not assignable to type 'SecurityManager'.
src/components/settings/SettingsDashboard.tsx(257,9): error TS2322: Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'RefObject<HTMLDivElement>'.
  Type 'HTMLDivElement | null' is not assignable to type 'HTMLDivElement'.
    Type 'null' is not assignable to type 'HTMLDivElement'.
src/components/settings/TransactionArchiving.tsx(87,9): error TS2322: Type '(urgency: string) => string' is not assignable to type '(urgency: string) => ComponentType<{ className?: string | undefined; }>'.
  Type 'string' is not assignable to type 'ComponentType<{ className?: string | undefined; }>'.
src/components/settings/archiving/ArchivingPreviewResults.tsx(5,36): error TS7031: Binding element 'showPreview' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingPreviewResults.tsx(5,49): error TS7031: Binding element 'previewData' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingPreviewResults.tsx(5,62): error TS7031: Binding element 'onClosePreview' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingResult.tsx(4,28): error TS7031: Binding element 'lastResult' implicitly has an 'any' type.
src/components/settings/sections/GeneralSettingsSection.tsx(4,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/settings/sections/GeneralSettingsSection.tsx(286,25): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/settings/sections/SyncDebugToolsSection.tsx(193,42): error TS2722: Cannot invoke an object which is possibly 'undefined'.
src/components/settings/sections/SyncDebugToolsSection.tsx(193,42): error TS18048: 'window.forceCloudDataReset' is possibly 'undefined'.
src/components/sync/ConflictResolutionModal.tsx(66,22): error TS18047: 'syncConflicts' is possibly 'null'.
src/components/sync/health/SyncHealthDetails.tsx(57,50): error TS2345: Argument of type 'SyncStatus' is not assignable to parameter of type 'SyncStatus'.
  Index signature for type 'string' is missing in type 'SyncStatus'.
src/components/sync/health/SyncHealthDetails.tsx(59,56): error TS2345: Argument of type 'RecoveryResult | null' is not assignable to parameter of type 'RecoveryResult | null'.
  Type 'RecoveryResult' is not assignable to type 'RecoveryResult'. Two different types with this name exist, but they are unrelated.
    Index signature for type 'string' is missing in type 'RecoveryResult'.
src/components/sync/health/SyncHealthDetails.tsx(110,16): error TS18048: 'syncStatus.failedTests' is possibly 'undefined'.
src/components/sync/health/SyncHealthDetails.tsx(112,13): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/sync/health/SyncHealthDetails.tsx(143,13): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/transactions/TransactionLedger.tsx(481,7): error TS2322: Type 'Dispatch<SetStateAction<null>>' is not assignable to type '(transaction: Transaction | null) => void'.
  Types of parameters 'value' and 'transaction' are incompatible.
    Type 'Transaction | null' is not assignable to type 'SetStateAction<null>'.
      Type 'Transaction' is not assignable to type 'SetStateAction<null>'.
        Type 'Transaction' provides no match for the signature '(prevState: null): null'.
src/components/transactions/TransactionLedger.tsx(491,7): error TS2322: Type 'Dispatch<SetStateAction<TransactionFormData>>' is not assignable to type '(form: unknown) => void'.
  Types of parameters 'value' and 'form' are incompatible.
    Type 'unknown' is not assignable to type 'SetStateAction<TransactionFormData>'.
src/components/transactions/TransactionTable.tsx(124,21): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to type 'Transaction'.
  Index signature for type 'string' is missing in type 'Transaction'.
src/components/transactions/TransactionTable.tsx(127,21): error TS2322: Type 'VirtualItem' is not assignable to type 'VirtualRow'.
  Index signature for type 'string' is missing in type 'VirtualItem'.
src/components/transactions/TransactionTable.tsx(374,11): error TS2322: Type 'string | number' is not assignable to type 'string'.
  Type 'number' is not assignable to type 'string'.
src/components/transactions/import/ImportModal.tsx(60,44): error TS2322: Type '(data: unknown[]) => void' is not assignable to type '(event: ChangeEvent<HTMLInputElement>, options: { clearExisting: boolean; }) => void'.
  Types of parameters 'data' and 'event' are incompatible.
    Type 'ChangeEvent<HTMLInputElement>' is missing the following properties from type 'unknown[]': length, pop, push, concat, and 29 more.
src/components/transactions/import/ImportModal.tsx(64,13): error TS2322: Type 'unknown[]' is not assignable to type 'ImportData | DataRow[]'.
  Type 'unknown[]' is not assignable to type 'DataRow[]'.
    Type 'unknown' is not assignable to type 'DataRow'.
src/components/transactions/import/ImportModal.tsx(66,13): error TS2322: Type '(mapping: Record<string, string>) => void' is not assignable to type '(mapping: FieldMapping) => void'.
  Types of parameters 'mapping' and 'mapping' are incompatible.
    Type 'FieldMapping' is not assignable to type 'Record<string, string>'.
      'string' index signatures are incompatible.
        Type 'string | undefined' is not assignable to type 'string'.
          Type 'undefined' is not assignable to type 'string'.
src/components/transactions/import/ImportModal.tsx(73,51): error TS2322: Type '{ current: number; total: number; percentage: number; }' is not assignable to type 'number'.
src/components/transactions/splitter/SplitAllocationsSection.tsx(111,13): error TS2739: Type 'SplitAllocation' is missing the following properties from type 'Split': description, amount, category
src/components/transactions/splitter/SplitAllocationsSection.tsx(117,13): error TS2719: Type 'Envelope[]' is not assignable to type 'Envelope[]'. Two different types with this name exist, but they are unrelated.
  Type 'Envelope' is not assignable to type 'Envelope'. Two different types with this name exist, but they are unrelated.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/transactions/splitter/SplitTotals.tsx(5,24): error TS7031: Binding element 'totals' implicitly has an 'any' type.
src/components/transactions/splitter/SplitterHeader.tsx(42,37): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/components/ui/ConfirmModal.tsx(55,30): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type '{}' is not assignable to parameter of type 'string | FunctionComponent<{ className: string; }> | ComponentClass<{ className: string; }, any>'.
src/components/ui/SecurityAlert.tsx(99,22): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type 'string | number | bigint | true | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<...> | ComponentType<...>' is not assignable to parameter of type 'string | FunctionComponent<{ className?: string | undefined; }> | ComponentClass<{ className?: string | undefined; }, any>'.
      Type 'number' is not assignable to type 'string | FunctionComponent<{ className?: string | undefined; }> | ComponentClass<{ className?: string | undefined; }, any>'.
src/contexts/authUtils.ts(81,18): error TS2345: Argument of type '(prev: AuthContextState) => { user: UserData; isAuthenticated: true; isUnlocked: true; budgetId: string | undefined; encryptionKey: CryptoKey | null; salt: Uint8Array<...> | null; lastActivity: number; error: null; isLoading: boolean; }' is not assignable to parameter of type 'SetStateAction<AuthContextState>'.
  Type '(prev: AuthContextState) => { user: UserData; isAuthenticated: true; isUnlocked: true; budgetId: string | undefined; encryptionKey: CryptoKey | null; salt: Uint8Array<...> | null; lastActivity: number; error: null; isLoading: boolean; }' is not assignable to type '(prevState: AuthContextState) => AuthContextState'.
    Call signature return types '{ user: UserData; isAuthenticated: true; isUnlocked: true; budgetId: string | undefined; encryptionKey: CryptoKey | null; salt: Uint8Array<ArrayBufferLike> | null; lastActivity: number; error: null; isLoading: boolean; }' and 'AuthContextState' are incompatible.
      The types of 'budgetId' are incompatible between these types.
        Type 'string | undefined' is not assignable to type 'string | null'.
          Type 'undefined' is not assignable to type 'string | null'.
src/contexts/authUtils.ts(106,18): error TS2345: Argument of type '(prev: AuthContextState) => { user: { userName?: string | undefined; userColor?: string | undefined; budgetId?: string | undefined; shareCode?: string | undefined; sharedBy?: string | undefined; password?: string | undefined; }; ... 7 more ...; error: string | null; }' is not assignable to parameter of type 'SetStateAction<AuthContextState>'.
  Type '(prev: AuthContextState) => { user: { userName?: string | undefined; userColor?: string | undefined; budgetId?: string | undefined; shareCode?: string | undefined; sharedBy?: string | undefined; password?: string | undefined; }; ... 7 more ...; error: string | null; }' is not assignable to type '(prevState: AuthContextState) => AuthContextState'.
    Call signature return types '{ user: { userName?: string | undefined; userColor?: string | undefined; budgetId?: string | undefined; shareCode?: string | undefined; sharedBy?: string | undefined; password?: string | undefined; }; ... 7 more ...; error: string | null; }' and 'AuthContextState' are incompatible.
      The types of 'user.userName' are incompatible between these types.
        Type 'string | undefined' is not assignable to type 'string'.
          Type 'undefined' is not assignable to type 'string'.
src/hooks/accounts/useSupplementalAccounts.ts(99,43): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/hooks/accounts/useSupplementalAccounts.ts(129,44): error TS2345: Argument of type '{ name: string; type: string; currentBalance: number; annualContribution?: number | undefined; expirationDate?: string | null | undefined; description?: string | null | undefined; color: string; ... 5 more ...; transactions?: unknown[] | undefined; }' is not assignable to parameter of type 'Account'.
  Types of property 'expirationDate' are incompatible.
    Type 'string | null | undefined' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/hooks/accounts/useSupplementalAccounts.ts(198,22): error TS2345: Argument of type '{ name: string; type: string; currentBalance: number; annualContribution?: number | undefined; expirationDate?: string | null | undefined; description?: string | null | undefined; color: string; ... 5 more ...; transactions?: unknown[] | undefined; }' is not assignable to parameter of type 'Account'.
  Types of property 'expirationDate' are incompatible.
    Type 'string | null | undefined' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/hooks/accounts/useSupplementalAccounts.ts(263,7): error TS2345: Argument of type '{ name: string; type: string; currentBalance: number; annualContribution?: number | undefined; expirationDate?: string | null | undefined; description?: string | null | undefined; color: string; ... 5 more ...; transactions?: unknown[] | undefined; }' is not assignable to parameter of type 'Account'.
  Types of property 'expirationDate' are incompatible.
    Type 'string | null | undefined' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/hooks/accounts/useSupplementalAccounts.ts(272,59): error TS2345: Argument of type 'TransferringAccount | null' is not assignable to parameter of type 'Account'.
  Type 'null' is not assignable to type 'Account'.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(3,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(16,31): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/analytics/useAnalyticsIntegration.ts(129,36): error TS7006: Parameter 'newTimeFilter' implicitly has an 'any' type.
src/hooks/analytics/useSmartCategoryAnalysis.ts(47,5): error TS2345: Argument of type 'TransactionForStats[]' is not assignable to parameter of type 'Transaction[]'.
  Type 'TransactionForStats' is missing the following properties from type 'Transaction': id, description
src/hooks/analytics/useSmartCategoryAnalysis.ts(51,40): error TS2345: Argument of type 'Record<string, unknown>[]' is not assignable to parameter of type 'Bill[]'.
  Type 'Record<string, unknown>' is missing the following properties from type 'Bill': id, name, amount, frequency, and 3 more.
src/hooks/analytics/useTransactionAnalysis.ts(23,7): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]'.
  Property 'lastModified' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction'.
src/hooks/analytics/useTransactionAnalysis.ts(27,7): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]'.
  Property 'lastModified' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction'.
src/hooks/analytics/useTransactionFiltering.ts(15,23): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ 7: Date; 30: Date; 90: Date; "6months": Date; }'.
  No index signature with a parameter of type 'string' was found on type '{ 7: Date; 30: Date; 90: Date; "6months": Date; }'.
src/hooks/analytics/utils/csvImageExportUtils.ts(97,57): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/analytics/utils/pdfGeneratorUtils.ts(85,30): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'AnalyticsData'.
src/hooks/analytics/utils/pdfGeneratorUtils.ts(94,39): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'BalanceData'.
src/hooks/auth/authOperations.ts(102,18): error TS2783: 'success' is specified more than once, so this usage will be overwritten.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(193,19): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(195,13): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/auth/mutations/useLoginMutations.ts(52,13): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/auth/mutations/useLoginMutations.ts(53,25): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/auth/mutations/usePasswordMutations.ts(70,18): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string | null'.
  Type 'undefined' is not assignable to type 'string | null'.
src/hooks/auth/mutations/useProfileMutations.ts(37,44): error TS2345: Argument of type '{ userName: string | undefined; userColor: string | undefined; }' is not assignable to parameter of type '{ userName: string; userColor: string; shareCode?: string | undefined; joinedVia?: string | undefined; sharedBy?: string | undefined; }'.
  Types of property 'userName' are incompatible.
    Type 'string | undefined' is not assignable to type 'string'.
      Type 'undefined' is not assignable to type 'string'.
src/hooks/auth/mutations/useProfileMutations.ts(67,20): error TS2345: Argument of type 'UpdateProfileInput | undefined' is not assignable to parameter of type 'Partial<UserData>'.
  Type 'undefined' is not assignable to type 'Partial<UserData>'.
src/hooks/auth/useAuthFlow.ts(73,57): error TS2345: Argument of type 'UserData | null' is not assignable to parameter of type 'UserData'.
  Type 'null' is not assignable to type 'UserData'.
src/hooks/auth/useAuthFlow.ts(77,51): error TS2345: Argument of type 'UserData | null' is not assignable to parameter of type 'UserData'.
  Type 'null' is not assignable to type 'UserData'.
src/hooks/auth/useAuthManager.ts(17,8): error TS2459: Module '"./authOperations"' declares 'LoginResult' locally, but it is not exported.
src/hooks/auth/useAuthManager.ts(18,8): error TS2459: Module '"./authOperations"' declares 'AuthContext' locally, but it is not exported.
src/hooks/auth/useAuthManager.ts(50,38): error TS2345: Argument of type 'UseMutationResult<LoginResult, Error, LoginMutationVariables, unknown>' is not assignable to parameter of type 'UseMutationResult<LoginResult, Error, LoginData, unknown>'.
  Type 'Override<MutationObserverIdleResult<LoginResult, Error, LoginMutationVariables, unknown>, { mutate: UseMutateFunction<LoginResult, Error, LoginMutationVariables, unknown>; }> & { ...; }' is not assignable to type 'UseMutationResult<LoginResult, Error, LoginData, unknown>'.
    Type 'Override<MutationObserverIdleResult<LoginResult, Error, LoginMutationVariables, unknown>, { mutate: UseMutateFunction<LoginResult, Error, LoginMutationVariables, unknown>; }> & { ...; }' is not assignable to type 'Override<MutationObserverIdleResult<LoginResult, Error, LoginData, unknown>, { mutate: UseMutateFunction<LoginResult, Error, LoginData, unknown>; }> & { ...; }'.
      Type 'Override<MutationObserverIdleResult<LoginResult, Error, LoginMutationVariables, unknown>, { mutate: UseMutateFunction<LoginResult, Error, LoginMutationVariables, unknown>; }> & { ...; }' is not assignable to type 'Override<MutationObserverIdleResult<LoginResult, Error, LoginData, unknown>, { mutate: UseMutateFunction<LoginResult, Error, LoginData, unknown>; }>'.
        Types of property 'mutate' are incompatible.
          Type 'UseMutateFunction<LoginResult, Error, LoginMutationVariables, unknown>' is not assignable to type 'UseMutateFunction<LoginResult, Error, LoginData, unknown>'.
            Types of parameters 'variables' and 'variables' are incompatible.
              Type 'LoginData' is not assignable to type 'LoginMutationVariables'.
                Types of property 'userData' are incompatible.
                  Type 'unknown' is not assignable to type 'Record<string, unknown> | undefined'.
src/hooks/auth/useAuthManager.ts(63,54): error TS2345: Argument of type 'UseMutationResult<{ success: boolean; error: string; profile?: undefined; } | { success: boolean; profile: UpdateProfileInput; error?: undefined; }, Error, UpdateProfileInput, unknown>' is not assignable to parameter of type 'UseMutationResult<UpdateProfileResult, Error, UpdateProfileData, unknown>'.
  Type 'Override<MutationObserverIdleResult<{ success: boolean; error: string; profile?: undefined; } | { success: boolean; profile: UpdateProfileInput; error?: undefined; }, Error, UpdateProfileInput, unknown>, { ...; }> & { ...; }' is not assignable to type 'UseMutationResult<UpdateProfileResult, Error, UpdateProfileData, unknown>'.
    Type 'Override<MutationObserverIdleResult<{ success: boolean; error: string; profile?: undefined; } | { success: boolean; profile: UpdateProfileInput; error?: undefined; }, Error, UpdateProfileInput, unknown>, { ...; }> & { ...; }' is not assignable to type 'Override<MutationObserverIdleResult<UpdateProfileResult, Error, UpdateProfileData, unknown>, { mutate: UseMutateFunction<...>; }> & { ...; }'.
      Type 'Override<MutationObserverIdleResult<{ success: boolean; error: string; profile?: undefined; } | { success: boolean; profile: UpdateProfileInput; error?: undefined; }, Error, UpdateProfileInput, unknown>, { ...; }> & { ...; }' is not assignable to type 'Override<MutationObserverIdleResult<UpdateProfileResult, Error, UpdateProfileData, unknown>, { mutate: UseMutateFunction<...>; }>'.
        Types of property 'mutate' are incompatible.
          Type 'UseMutateFunction<{ success: boolean; error: string; profile?: undefined; } | { success: boolean; profile: UpdateProfileInput; error?: undefined; }, Error, UpdateProfileInput, unknown>' is not assignable to type 'UseMutateFunction<UpdateProfileResult, Error, UpdateProfileData, unknown>'.
            Types of parameters 'variables' and 'variables' are incompatible.
              Type 'UpdateProfileData' is not assignable to type 'UpdateProfileInput'.
                Index signature for type 'string' is missing in type 'UpdateProfileData'.
src/hooks/auth/useAuthManager.ts(107,31): error TS7006: Parameter 'password' implicitly has an 'any' type.
src/hooks/auth/useAuthenticationManager.ts(98,45): error TS2339: Property 'budgetId' does not exist on type 'never'.
src/hooks/auth/useAuthenticationManager.ts(99,39): error TS2339: Property 'budgetId' does not exist on type 'never'.
src/hooks/auth/useKeyManagementUI.ts(164,5): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/hooks/bills/useBillManager.ts(12,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/bills/useBillManager.ts(100,18): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/bills/useBillManager.ts(125,9): error TS2345: Argument of type '((bill: Bill) => void | Promise<void>) | undefined' is not assignable to parameter of type '((bill: BillRecord) => void | Promise<void>) | undefined'.
  Type '(bill: Bill) => void | Promise<void>' is not assignable to type '(bill: BillRecord) => void | Promise<void>'.
    Types of parameters 'bill' and 'bill' are incompatible.
      Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManager.ts(150,5): error TS2322: Type '((bill: Bill) => void | Promise<void>) | undefined' is not assignable to type '((bill: import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill) => void | Promise<void>) | undefined'.
  Type '(bill: Bill) => void | Promise<void>' is not assignable to type '(bill: import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill) => void | Promise<void>'.
    Types of parameters 'bill' and 'bill' are incompatible.
      Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill' is not assignable to type 'Bill'.
        Index signature for type 'string' is missing in type 'Bill'.
src/hooks/bills/useBillManager.ts(152,5): error TS2322: Type '{ unassignedCash?: number | undefined; updateBill?: ((bill: Bill) => void | Promise<void>) | undefined; }' is not assignable to type 'BudgetContext'.
  Types of property 'updateBill' are incompatible.
    Type '((bill: Bill) => void | Promise<void>) | undefined' is not assignable to type '((bill: import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill) => void | Promise<void>) | undefined'.
      Type '(bill: Bill) => void | Promise<void>' is not assignable to type '(bill: import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill) => void | Promise<void>'.
        Types of parameters 'bill' and 'bill' are incompatible.
          Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill' is not assignable to type 'Bill'.
            Index signature for type 'string' is missing in type 'Bill'.
src/hooks/bills/useBillManager.ts(171,11): error TS2322: Type 'Dispatch<SetStateAction<never[]>>' is not assignable to type '(bills: BillRecord[]) => void'.
  Types of parameters 'value' and 'bills' are incompatible.
    Type 'BillRecord[]' is not assignable to type 'SetStateAction<never[]>'.
      Type 'BillRecord[]' is not assignable to type 'never[]'.
        Type 'BillRecord' is not assignable to type 'never'.
src/hooks/bills/useBillManager.ts(183,11): error TS2322: Type '((bill: Bill) => void | Promise<void>) | undefined' is not assignable to type '((bill: BillRecord) => void | Promise<void>) | undefined'.
  Type '(bill: Bill) => void | Promise<void>' is not assignable to type '(bill: BillRecord) => void | Promise<void>'.
    Types of parameters 'bill' and 'bill' are incompatible.
      Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManager.ts(184,11): error TS2322: Type '(bill: Bill) => Promise<void>' is not assignable to type '(bill: BillRecord) => Promise<void>'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManager.ts(208,5): error TS2322: Type '(bill: Bill | null) => void' is not assignable to type '(bill: BillRecord | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillRecord | null' is not assignable to type 'Bill | null'.
      Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManager.ts(210,5): error TS2322: Type '(bill: Bill | null) => void' is not assignable to type '(bill: BillRecord | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillRecord | null' is not assignable to type 'Bill | null'.
      Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManager.ts(213,5): error TS2322: Type '(bill: Bill | null) => void' is not assignable to type '(bill: BillRecord | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillRecord | null' is not assignable to type 'Bill | null'.
      Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManagerDisplayLogic.ts(36,26): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/hooks/bills/useBillManagerHelpers.ts(286,44): error TS2345: Argument of type 'BillRecord[]' is not assignable to parameter of type 'Bill[]'.
  Type 'BillRecord' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'string | Date | null' is not assignable to type 'string | Date | undefined'.
        Type 'null' is not assignable to type 'string | Date | undefined'.
src/hooks/bills/useBillManagerHelpers.ts(317,22): error TS2345: Argument of type 'BillRecord[]' is not assignable to parameter of type 'Bill[]'.
  Type 'BillRecord' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'string | Date | null' is not assignable to type 'string | Date | undefined'.
        Type 'null' is not assignable to type 'string | Date | undefined'.
src/hooks/bills/useBillOperations.ts(42,77): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Envelope[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope[]'.
  Property 'targetAmount' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Envelope' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope'.
src/hooks/bills/useBillOperations.ts(68,7): error TS2322: Type '(updatedBills: Bill[]) => Promise<BulkOperationResult>' is not assignable to type '(updatedBills: unknown[]) => Promise<{ success: boolean; successCount: number; errorCount: number; errors: string[]; message: string; }>'.
  Types of parameters 'updatedBills' and 'updatedBills' are incompatible.
    Type 'unknown[]' is not assignable to type 'Bill[]'.
      Type 'unknown' is not assignable to type 'Bill'.
src/hooks/bills/useBills/index.ts(43,5): error TS2783: 'upcomingBills' is specified more than once, so this usage will be overwritten.
src/hooks/bills/useBulkBillOperations.ts(31,39): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFunding.ts(6,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/budgeting/autofunding/useAutoFunding.ts(41,18): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(3,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(46,18): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(65,5): error TS2345: Argument of type 'BudgetData & { transferFunds: ((from: string, to: string, amount: number, description?: string | undefined) => Promise<void>) | undefined; }' is not assignable to parameter of type 'Budget'.
  Types of property 'transferFunds' are incompatible.
    Type '((from: string, to: string, amount: number, description?: string | undefined) => Promise<void>) | undefined' is not assignable to type '(from: string, to: string, amount: number, description?: string | undefined) => Promise<void>'.
      Type 'undefined' is not assignable to type '(from: string, to: string, amount: number, description?: string | undefined) => Promise<void>'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(101,61): error TS2345: Argument of type '{ trigger: string; currentDate: string; data: { envelopes: unknown[]; unassignedCash: number; transactions: unknown[]; }; }' is not assignable to parameter of type 'ExecutionContext'.
  The types of 'data.envelopes' are incompatible between these types.
    Type 'unknown[]' is not assignable to type 'Envelope[]'.
      Type 'unknown' is not assignable to type 'Envelope'.
src/hooks/budgeting/autofunding/useAutoFundingHistory.ts(77,21): error TS7006: Parameter 'options' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useExecutionHistory.ts(68,37): error TS2769: No overload matches this call.
  Overload 1 of 4, '(value: string | number | Date): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'string | number | Date'.
      Type 'undefined' is not assignable to type 'string | number | Date'.
  Overload 2 of 4, '(value: string | number): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'string | number'.
      Type 'undefined' is not assignable to type 'string | number'.
src/hooks/budgeting/autofunding/useExecutionHistory.ts(75,37): error TS2769: No overload matches this call.
  Overload 1 of 4, '(value: string | number | Date): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'string | number | Date'.
      Type 'undefined' is not assignable to type 'string | number | Date'.
  Overload 2 of 4, '(value: string | number): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'string | number'.
      Type 'undefined' is not assignable to type 'string | number'.
src/hooks/budgeting/autofunding/useUndoOperations.ts(2,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/budgeting/autofunding/useUndoOperations.ts(200,18): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(66,66): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(25,56): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(63,40): error TS2345: Argument of type '{ hash: string; message: string; author: string; parentHash: string | null; deviceFingerprint: string; encryptedSnapshot: number[]; iv: number[]; timestamp: number; }' is not assignable to parameter of type 'BudgetCommit'.
  Types of property 'parentHash' are incompatible.
    Type 'string | null' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/hooks/budgeting/useEnvelopesQuery.ts(117,22): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Envelope'.
  No index signature with a parameter of type 'string' was found on type 'Envelope'.
src/hooks/budgeting/useEnvelopesQuery.ts(118,22): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Envelope'.
  No index signature with a parameter of type 'string' was found on type 'Envelope'.
src/hooks/budgeting/usePaycheckFormValidated.ts(62,26): error TS2769: No overload matches this call.
  Overload 1 of 4, '(value: string | number | Date): Date', gave the following error.
    Argument of type 'Date | undefined' is not assignable to parameter of type 'string | number | Date'.
      Type 'undefined' is not assignable to type 'string | number | Date'.
  Overload 2 of 4, '(value: string | number): Date', gave the following error.
    Argument of type 'Date | undefined' is not assignable to parameter of type 'string | number'.
      Type 'undefined' is not assignable to type 'string | number'.
src/hooks/budgeting/usePaycheckHistory.ts(39,41): error TS2345: Argument of type 'string | number' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
  Type 'string' is not assignable to type 'Record<string, unknown>'.
src/hooks/common/useActualBalance.ts(2,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/common/useActualBalance.ts(33,7): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/common/useBugReport.ts(60,53): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/common/useConnectionManager/useConnectionConfig.ts(6,32): error TS7006: Parameter 'entityType' implicitly has an 'any' type.
src/hooks/common/useDataInitialization.ts(2,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/common/useDataInitialization.ts(40,28): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(166,26): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'null | undefined'.
src/hooks/common/useNetworkStatus.ts(2,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/common/useNetworkStatus.ts(11,27): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/common/usePrompt.ts(109,12): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/common/useRouterPageDetection.ts(22,25): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ "/app": string; "/app/dashboard": string; "/app/envelopes": string; "/app/savings": string; "/app/supplemental": string; "/app/paycheck": string; "/app/bills": string; "/app/transactions": string; "/app/debts": string; "/app/analytics": string; "/app/automation": string; "/app/activity": string; }'.
  No index signature with a parameter of type 'string' was found on type '{ "/app": string; "/app/dashboard": string; "/app/envelopes": string; "/app/savings": string; "/app/supplemental": string; "/app/paycheck": string; "/app/bills": string; "/app/transactions": string; "/app/debts": string; "/app/analytics": string; "/app/automation": string; "/app/activity": string; }'.
src/hooks/common/useRouterPageDetection.ts(66,24): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ dashboard: string; envelopes: string; savings: string; supplemental: string; paycheck: string; bills: string; transactions: string; debts: string; analytics: string; automation: string; activity: string; }'.
src/hooks/common/useTransactions.ts(42,48): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction'.
    Types of property 'date' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/dashboard/useMainDashboard.ts(173,6): error TS7006: Parameter 'difference' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(164,35): error TS2345: Argument of type '{ amount: number; date?: string | undefined; }' is not assignable to parameter of type '{ amount: number; paymentDate: string; notes?: string | undefined; }'.
  Property 'paymentDate' is missing in type '{ amount: number; date?: string | undefined; }' but required in type '{ amount: number; paymentDate: string; notes?: string | undefined; }'.
src/hooks/debts/useDebtManagement.ts(81,7): error TS2345: Argument of type 'UseMutateAsyncFunction<{ createdAt: number; id: string; name: string; dueDate: Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; lastModified: number; }, Error, Record<string, unknown>, { ...; }>' is not assignable to parameter of type '(data: unknown) => unknown'.
  Types of parameters 'variables' and 'data' are incompatible.
    Type 'unknown' is not assignable to type 'Record<string, unknown>'.
src/hooks/debts/useDebtManagement.ts(211,7): error TS2322: Type '(params: { id: string; updates: { [key: string]: unknown; id: string; name: string; currentBalance: number; minimumPayment: number; }; }) => Promise<void>' is not assignable to type '(params: { id: string; updates: Debt; }) => Promise<void>'.
  Types of parameters 'params' and 'params' are incompatible.
    Type '{ id: string; updates: Debt; }' is not assignable to type '{ id: string; updates: { [key: string]: unknown; id: string; name: string; currentBalance: number; minimumPayment: number; }; }'.
      Types of property 'updates' are incompatible.
        Type 'Debt' is not assignable to type '{ [key: string]: unknown; id: string; name: string; currentBalance: number; minimumPayment: number; }'.
          Index signature for type 'string' is missing in type 'Debt'.
src/hooks/debts/useDebtManagement.ts(224,7): error TS2322: Type '(params: { id: string; updates: { [key: string]: unknown; id: string; name: string; currentBalance: number; minimumPayment: number; }; }) => Promise<void>' is not assignable to type '(params: { id: string; updates: Partial<Debt>; }) => Promise<void>'.
  Types of parameters 'params' and 'params' are incompatible.
    Type '{ id: string; updates: Partial<Debt>; }' is not assignable to type '{ id: string; updates: { [key: string]: unknown; id: string; name: string; currentBalance: number; minimumPayment: number; }; }'.
      The types of 'updates.id' are incompatible between these types.
        Type 'string | undefined' is not assignable to type 'string'.
          Type 'undefined' is not assignable to type 'string'.
src/hooks/debts/useDebtManagement.ts(233,7): error TS2322: Type '(params: { id: string; updates: { [key: string]: unknown; id: string; name: string; currentBalance: number; minimumPayment: number; }; }) => Promise<void>' is not assignable to type '(params: { id: string; updates: Partial<Debt>; }) => Promise<void>'.
  Types of parameters 'params' and 'params' are incompatible.
    Type '{ id: string; updates: Partial<Debt>; }' is not assignable to type '{ id: string; updates: { [key: string]: unknown; id: string; name: string; currentBalance: number; minimumPayment: number; }; }'.
      The types of 'updates.id' are incompatible between these types.
        Type 'string | undefined' is not assignable to type 'string'.
          Type 'undefined' is not assignable to type 'string'.
src/hooks/debts/useDebtManagement.ts(243,59): error TS2322: Type '(params: { id: string; updates: { [key: string]: unknown; id: string; name: string; currentBalance: number; minimumPayment: number; }; }) => Promise<void>' is not assignable to type '(params: { id: string; updates: Partial<Debt>; author?: string | undefined; }) => Promise<void>'.
  Types of parameters 'params' and 'params' are incompatible.
    Type '{ id: string; updates: Partial<Debt>; author?: string | undefined; }' is not assignable to type '{ id: string; updates: { [key: string]: unknown; id: string; name: string; currentBalance: number; minimumPayment: number; }; }'.
      The types of 'updates.id' are incompatible between these types.
        Type 'string | undefined' is not assignable to type 'string'.
          Type 'undefined' is not assignable to type 'string'.
src/hooks/debts/useDebtModalLogic.ts(78,44): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/hooks/layout/usePaycheckOperations.ts(43,71): error TS2345: Argument of type 'PaycheckHistory[]' is not assignable to parameter of type 'Paycheck[]'.
  Type 'PaycheckHistory' is not assignable to type 'Paycheck'.
    Types of property 'amount' are incompatible.
      Type 'number | undefined' is not assignable to type 'number'.
        Type 'undefined' is not assignable to type 'number'.
src/hooks/layout/usePaycheckOperations.ts(53,11): error TS2345: Argument of type 'VioletVaultDB' is not assignable to parameter of type '{ envelopes: { get: (id: string | number) => Promise<unknown>; update: (id: string | number, data: unknown) => Promise<void>; }; }'.
  The types of 'envelopes.get' are incompatible between these types.
    Type '{ (key: string): PromiseExtended<Envelope | undefined>; <R>(key: string, thenShortcut: ThenShortcut<Envelope | undefined, R>): PromiseExtended<...>; (equalityCriterias: { ...; }): PromiseExtended<...>; <R>(equalityCriterias: { ...; }, thenShortcut: ThenShortcut<...>): PromiseExtended<...>; }' is not assignable to type '(id: string | number) => Promise<unknown>'.
      Types of parameters 'key' and 'id' are incompatible.
        Type 'string | number' is not assignable to type 'string'.
          Type 'number' is not assignable to type 'string'.
src/hooks/mobile/useFABBehavior.ts(127,50): error TS2345: Argument of type 'RefObject<null>' is not assignable to parameter of type 'RefObject<HTMLElement>'.
  Type 'null' is not assignable to type 'HTMLElement'.
src/hooks/mobile/useSlideUpModal.ts(41,37): error TS7006: Parameter 'newConfig' implicitly has an 'any' type.
src/hooks/notifications/useFirebaseMessaging.ts(98,7): error TS2322: Type 'TokenResult' is not assignable to type 'PermissionResult'.
  Types of property 'token' are incompatible.
    Type 'string | null | undefined' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/hooks/savings/useSavingsGoals/index.ts(85,9): error TS2322: Type 'UseMutationResult<SavingsGoal, Error, NewSavingsGoalData, { previousGoals: unknown; }>' is not assignable to type 'MutationHandler'.
  Type 'Override<MutationObserverIdleResult<SavingsGoal, Error, NewSavingsGoalData, { previousGoals: unknown; }>, { mutate: UseMutateFunction<...>; }> & { ...; }' is not assignable to type 'MutationHandler'.
    Types of property 'mutateAsync' are incompatible.
      Type 'UseMutateAsyncFunction<SavingsGoal, Error, NewSavingsGoalData, { previousGoals: unknown; }>' is not assignable to type '(...args: unknown[]) => Promise<unknown>'.
        Types of parameters 'variables' and 'args' are incompatible.
          Type 'unknown' is not assignable to type 'NewSavingsGoalData'.
src/hooks/savings/useSavingsGoals/index.ts(86,9): error TS2322: Type 'UseMutationResult<SavingsGoal, Error, { goalId: string; updates: Partial<SavingsGoal>; }, unknown>' is not assignable to type 'MutationHandler'.
  Type 'Override<MutationObserverIdleResult<SavingsGoal, Error, { goalId: string; updates: Partial<SavingsGoal>; }, unknown>, { ...; }> & { ...; }' is not assignable to type 'MutationHandler'.
    Types of property 'mutateAsync' are incompatible.
      Type 'UseMutateAsyncFunction<SavingsGoal, Error, { goalId: string; updates: Partial<SavingsGoal>; }, unknown>' is not assignable to type '(...args: unknown[]) => Promise<unknown>'.
        Types of parameters 'variables' and 'args' are incompatible.
          Type 'unknown' is not assignable to type '{ goalId: string; updates: Partial<SavingsGoal>; }'.
src/hooks/savings/useSavingsGoals/index.ts(87,9): error TS2322: Type 'UseMutationResult<string, Error, string, unknown>' is not assignable to type 'MutationHandler'.
  Type 'Override<MutationObserverIdleResult<string, Error, string, unknown>, { mutate: UseMutateFunction<string, Error, string, unknown>; }> & { ...; }' is not assignable to type 'MutationHandler'.
    Types of property 'mutateAsync' are incompatible.
      Type 'UseMutateAsyncFunction<string, Error, string, unknown>' is not assignable to type '(...args: unknown[]) => Promise<unknown>'.
        Types of parameters 'variables' and 'args' are incompatible.
          Type 'unknown' is not assignable to type 'string'.
src/hooks/savings/useSavingsGoals/index.ts(88,9): error TS2322: Type 'UseMutationResult<{ updatedGoal: SavingsGoal; contributionTransaction: { id: string; date: Date; description: string; amount: number; envelopeId: string; category: string; type: "expense"; lastModified: number; createdAt: number; }; }, Error, { ...; }, unknown>' is not assignable to type 'MutationHandler'.
  Type 'Override<MutationObserverIdleResult<{ updatedGoal: SavingsGoal; contributionTransaction: { id: string; date: Date; description: string; amount: number; envelopeId: string; category: string; type: "expense"; lastModified: number; createdAt: number; }; }, Error, { ...; }, unknown>, { ...; }> & { ...; }' is not assignable to type 'MutationHandler'.
    Types of property 'mutateAsync' are incompatible.
      Type 'UseMutateAsyncFunction<{ updatedGoal: SavingsGoal; contributionTransaction: { id: string; date: Date; description: string; amount: number; envelopeId: string; category: string; type: "expense"; lastModified: number; createdAt: number; }; }, Error, { ...; }, unknown>' is not assignable to type '(...args: unknown[]) => Promise<unknown>'.
        Types of parameters 'variables' and 'args' are incompatible.
          Type 'unknown' is not assignable to type '{ goalId: string; amount: string | number; description?: string | undefined; }'.
src/hooks/savings/useSavingsGoals/index.ts(89,9): error TS2322: Type 'UseMutationResult<{ totalAmount: number; results: { goalId: string; goalName: string; amount: number; updatedGoal: SavingsGoal; transaction: { id: string; date: Date; description: string; amount: number; ... 4 more ...; createdAt: number; }; }[]; summary: string; }, Error, { ...; }, unknown>' is not assignable to type 'MutationHandler'.
  Type 'Override<MutationObserverIdleResult<{ totalAmount: number; results: { goalId: string; goalName: string; amount: number; updatedGoal: SavingsGoal; transaction: { id: string; date: Date; description: string; ... 5 more ...; createdAt: number; }; }[]; summary: string; }, Error, { ...; }, unknown>, { ...; }> & { ...; }' is not assignable to type 'MutationHandler'.
    Types of property 'mutateAsync' are incompatible.
      Type 'UseMutateAsyncFunction<{ totalAmount: number; results: { goalId: string; goalName: string; amount: number; updatedGoal: SavingsGoal; transaction: { id: string; date: Date; description: string; amount: number; ... 4 more ...; createdAt: number; }; }[]; summary: string; }, Error, { ...; }, unknown>' is not assignable to type '(...args: unknown[]) => Promise<unknown>'.
        Types of parameters 'variables' and 'args' are incompatible.
          Type 'unknown' is not assignable to type '{ distribution: Record<string, string | number>; description?: string | undefined; }'.
src/hooks/settings/useSettingsDashboard.ts(2,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/settings/useSettingsDashboard.ts(103,28): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/settings/useSettingsDashboard.ts(104,31): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/sharing/useQRCodeProcessing.ts(42,46): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/sync/useFirebaseSync.ts(2,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/sync/useFirebaseSync.ts(63,18): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/hooks/sync/useSyncHealthIndicator.ts(200,5): error TS2322: Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'RefObject<HTMLDivElement>'.
  Type 'HTMLDivElement | null' is not assignable to type 'HTMLDivElement'.
    Type 'null' is not assignable to type 'HTMLDivElement'.
src/hooks/transactions/useTransactionFileUpload.ts(27,18): error TS18047: 'event.target.files' is possibly 'null'.
src/hooks/transactions/useTransactionFileUpload.ts(59,56): error TS18046: 'error' is of type 'unknown'.
src/hooks/transactions/useTransactionImport.ts(49,38): error TS2345: Argument of type 'unknown' is not assignable to parameter of type '{ userName?: string | undefined; }'.
src/hooks/transactions/useTransactionImport.ts(95,7): error TS2769: No overload matches this call.
  Overload 1 of 2, '(predicate: (value: unknown, index: number, array: unknown[]) => value is unknown, thisArg?: any): unknown[]', gave the following error.
    Argument of type '(t: { amount: number; }) => boolean' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => value is unknown'.
      Types of parameters 't' and 'value' are incompatible.
        Type 'unknown' is not assignable to type '{ amount: number; }'.
  Overload 2 of 2, '(predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any): unknown[]', gave the following error.
    Argument of type '(t: { amount: number; }) => boolean' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => unknown'.
      Types of parameters 't' and 'value' are incompatible.
        Type 'unknown' is not assignable to type '{ amount: number; }'.
src/hooks/transactions/useTransactionLedger.ts(7,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/transactions/useTransactionLedger.ts(34,18): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/transactions/useTransactionLedger.ts(82,5): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction'.
    Types of property 'date' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/transactions/useTransactionLedger.ts(106,5): error TS2345: Argument of type 'UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>' is not assignable to parameter of type 'AddTransactionFn'.
  Types of parameters 'variables' and 'transaction' are incompatible.
    Type 'unknown' is not assignable to type 'TransactionInput'.
src/hooks/transactions/useTransactionLedger.ts(155,46): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'CurrentUser'.
src/hooks/transactions/useTransactionLedger.ts(160,44): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/transactions/useTransactionLedger.ts(205,18): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'Transaction'.
  Types of property 'envelopeId' are incompatible.
    Type 'string | number | undefined' is not assignable to type 'string | undefined'.
      Type 'number' is not assignable to type 'string'.
src/hooks/transactions/useTransactionLedger.ts(206,39): error TS2345: Argument of type 'Transaction' is not assignable to parameter of type 'SetStateAction<null>'.
  Type 'Transaction' provides no match for the signature '(prevState: null): null'.
src/hooks/transactions/useTransactionQuery.ts(3,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/transactions/useTransactionQuery.ts(45,5): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/transactions/useTransactionsV2.ts(7,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/transactions/useTransactionsV2.ts(61,23): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/services/activityLogger.ts(126,68): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/errorTrackingService.ts(106,26): error TS2322: Type '(event: ErrorEvent) => void' is not assignable to type '{ handleEvent: (event: Event) => void; } | ((event: Event) => void)'.
  Type '(event: ErrorEvent) => void' is not assignable to type '(event: Event) => void'.
    Types of parameters 'event' and 'event' are incompatible.
      Type 'Event' is missing the following properties from type 'ErrorEvent': colno, error, filename, lineno, message
src/services/bugReport/errorTrackingService.ts(217,53): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/chunkedSyncService.ts(448,29): error TS2769: No overload matches this call.
  Overload 1 of 3, '(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'string | null' is not assignable to parameter of type 'string'.
      Type 'null' is not assignable to type 'string'.
  Overload 2 of 3, '(reference: CollectionReference<unknown, DocumentData>, path?: string | undefined, ...pathSegments: string[]): DocumentReference<unknown, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'CollectionReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'CollectionReference<unknown, DocumentData>': id, path, parent, withConverter, and 2 more.
  Overload 3 of 3, '(reference: DocumentReference<unknown, DocumentData>, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'DocumentReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'DocumentReference<unknown, DocumentData>': converter, firestore, id, path, and 2 more.
src/services/chunkedSyncService.ts(564,24): error TS2769: No overload matches this call.
  Overload 1 of 3, '(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'string | null' is not assignable to parameter of type 'string'.
      Type 'null' is not assignable to type 'string'.
  Overload 2 of 3, '(reference: CollectionReference<unknown, DocumentData>, path?: string | undefined, ...pathSegments: string[]): DocumentReference<unknown, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'CollectionReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'CollectionReference<unknown, DocumentData>': id, path, parent, withConverter, and 2 more.
  Overload 3 of 3, '(reference: DocumentReference<unknown, DocumentData>, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'DocumentReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'DocumentReference<unknown, DocumentData>': converter, firestore, id, path, and 2 more.
src/services/editLockService.ts(131,9): error TS2345: Argument of type 'CurrentUser | null' is not assignable to parameter of type 'User'.
  Type 'null' is not assignable to type 'User'.
src/services/editLockService.ts(376,26): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/services/firebaseMessaging.ts(175,36): error TS2345: Argument of type 'Messaging | null' is not assignable to parameter of type 'Messaging'.
  Type 'null' is not assignable to type 'Messaging'.
src/services/firebaseMessaging.ts(294,38): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/services/firebaseSyncService.ts(170,46): error TS2345: Argument of type 'Auth | null' is not assignable to parameter of type 'Auth'.
  Type 'null' is not assignable to type 'Auth'.
src/services/typedChunkedSyncService.ts(275,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/stores/ui/toastStore.ts(87,11): error TS2352: Conversion of type '{ toasts: never[]; }' to type 'ToastState' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ toasts: never[]; }' is missing the following properties from type 'ToastState': addToast, removeToast, clearAllToasts, showSuccess, and 4 more.
src/stores/ui/uiStore.ts(228,21): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/stores/ui/uiStore.ts(296,5): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/stores/ui/uiStore.ts(329,60): error TS2345: Argument of type '{ (nextStateOrUpdater: { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<Record<string, unknown> | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; } | Partial<...> | ((state: WritableDraft<...>) => void), shouldReplace?: false | undefined): void; (n...' is not assignable to parameter of type 'ImmerSet<UiStore>'.
  Type '{ (nextStateOrUpdater: { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<Record<string, unknown> | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; } | Partial<...> | ((state: WritableDraft<...>) => void), shouldReplace?: false | undefined): void; (n...' is not assignable to type 'ImmerSet<UiStore>'.
    Types of parameters 'nextStateOrUpdater' and 'updater' are incompatible.
      Type '(draft: WritableDraft<UiStore>) => void' is not assignable to type '{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<Record<string, unknown> | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; } | Partial<...> | ((state: WritableDraft<...>) => void)'.
        Type '(draft: WritableDraft<UiStore>) => void' is not assignable to type '(state: WritableDraft<{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<Record<string, unknown> | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>) => void'.
          Types of parameters 'draft' and 'state' are incompatible.
            Type 'WritableDraft<{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<Record<string, unknown> | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>' is missing the following properties from type 'WritableDraft<UiStore>': updateApp, installApp, manualInstall, dismissInstallPrompt
src/stores/ui/uiStore.ts(330,61): error TS2345: Argument of type '{ (nextStateOrUpdater: { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<Record<string, unknown> | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; } | Partial<...> | ((state: WritableDraft<...>) => void), shouldReplace?: false | undefined): void; (n...' is not assignable to parameter of type 'ImmerSet<UiStore>'.
  Type '{ (nextStateOrUpdater: { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<Record<string, unknown> | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; } | Partial<...> | ((state: WritableDraft<...>) => void), shouldReplace?: false | undefined): void; (n...' is not assignable to type 'ImmerSet<UiStore>'.
    Types of parameters 'nextStateOrUpdater' and 'updater' are incompatible.
      Type '(draft: WritableDraft<UiStore>) => void' is not assignable to type '{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<Record<string, unknown> | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; } | Partial<...> | ((state: WritableDraft<...>) => void)'.
        Type '(draft: WritableDraft<UiStore>) => void' is not assignable to type '(state: WritableDraft<{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<Record<string, unknown> | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>) => void'.
          Types of parameters 'draft' and 'state' are incompatible.
            Type 'WritableDraft<{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<Record<string, unknown> | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>' is missing the following properties from type 'WritableDraft<UiStore>': updateApp, installApp, manualInstall, dismissInstallPrompt
src/utils/analytics/categoryPatterns.ts(36,37): error TS7006: Parameter 'billName' implicitly has an 'any' type.
src/utils/billIcons/iconOptions.ts(179,10): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ utilities: BillIconOption[]; housing: BillIconOption[]; transportation: BillIconOption[]; insurance: BillIconOption[]; ... 6 more ...; business: BillIconOption[]; }'.
  No index signature with a parameter of type 'string' was found on type '{ utilities: BillIconOption[]; housing: BillIconOption[]; transportation: BillIconOption[]; insurance: BillIconOption[]; ... 6 more ...; business: BillIconOption[]; }'.
src/utils/bills/billUpdateHelpers.ts(106,71): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/bills/billUpdateHelpers.ts(107,5): error TS2722: Cannot invoke an object which is possibly 'undefined'.
src/utils/budgeting/envelopeCalculations.ts(110,63): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/utils/budgeting/envelopeCalculations.ts(521,24): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Record<FrequencyType, number>'.
  No index signature with a parameter of type 'string' was found on type 'Record<FrequencyType, number>'.
src/utils/budgeting/paycheckDeletion.ts(34,26): error TS18048: 'envelope.currentBalance' is possibly 'undefined'.
src/utils/common/budgetHistoryTracker.ts(109,41): error TS2345: Argument of type '{ hash: string; timestamp: number; message: string; author: string; parentHash: string | null; snapshotData: string; deviceFingerprint: string; }' is not assignable to parameter of type 'BudgetCommit'.
  Types of property 'parentHash' are incompatible.
    Type 'string | null' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/utils/common/fixAutoAllocateUndefined.ts(66,37): error TS18046: 'error' is of type 'unknown'.
src/utils/common/highlight.ts(285,73): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/ocrProcessor.ts(349,43): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/testBudgetHistory.ts(47,39): error TS2345: Argument of type '{ hash: string; timestamp: number; message: string; author: string; parentHash: null; encryptedSnapshot: string; deviceFingerprint: string; }' is not assignable to parameter of type 'BudgetCommit'.
  Types of property 'parentHash' are incompatible.
    Type 'null' is not assignable to type 'string | undefined'.
src/utils/common/toastHelpers.ts(117,16): error TS7006: Parameter 'error' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(255,11): error TS2322: Type 'null' is not assignable to type 'number'.
src/utils/common/transactionArchiving.ts(423,9): error TS2322: Type 'null' is not assignable to type 'number'.
src/utils/dataManagement/backupUtils.ts(45,44): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/dataManagement/firebaseUtils.ts(15,74): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/debts/calculations/payoffProjection.ts(11,43): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/utils/debts/debtCalculations.ts(84,52): error TS2345: Argument of type 'DebtAccount' is not assignable to parameter of type 'Debt'.
  Types of property 'nextPaymentDate' are incompatible.
    Type 'string | Date | undefined' is not assignable to type 'string | undefined'.
      Type 'Date' is not assignable to type 'string'.
src/utils/debts/debtCalculations.ts(94,5): error TS2322: Type 'string | null' is not assignable to type 'string | Date | undefined'.
  Type 'null' is not assignable to type 'string | Date | undefined'.
src/utils/pageDetection/pageIdentifier.ts(37,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/pwa/patchNotesManager.ts(89,24): error TS18048: 'match.index' is possibly 'undefined'.
src/utils/query/backgroundSyncService.ts(92,20): error TS18046: 'restoreError' is of type 'unknown'.
src/utils/query/prefetchHelpers.ts(55,13): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/utils/query/queryClientConfig.ts(58,7): error TS2322: Type '(error: unknown, query: Query) => void' is not assignable to type '(error: Error, query: Query<unknown, unknown, unknown, readonly unknown[]>) => void'.
  Types of parameters 'query' and 'query' are incompatible.
    Type 'Query<unknown, unknown, unknown, readonly unknown[]>' is not assignable to type 'Query<unknown, Error, unknown, readonly unknown[]>'.
      Types of property 'state' are incompatible.
        Type 'QueryState<unknown, unknown>' is not assignable to type 'QueryState<unknown, Error>'.
          Type 'unknown' is not assignable to type 'Error'.
src/utils/query/queryClientConfig.ts(65,7): error TS2322: Type '(_data: unknown, query: Query) => void' is not assignable to type '(data: unknown, query: Query<unknown, unknown, unknown, readonly unknown[]>) => void'.
  Types of parameters 'query' and 'query' are incompatible.
    Type 'Query<unknown, unknown, unknown, readonly unknown[]>' is not assignable to type 'Query<unknown, Error, unknown, readonly unknown[]>'.
      Types of property 'state' are incompatible.
        Type 'QueryState<unknown, unknown>' is not assignable to type 'QueryState<unknown, Error>'.
          Type 'unknown' is not assignable to type 'Error'.
src/utils/security/keyExport.ts(268,58): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/security/keyExport.ts(319,35): error TS7016: Could not find a declaration file for module 'qrcode'. '/home/runner/work/violet-vault/violet-vault/node_modules/qrcode/lib/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/qrcode` if it exists or add a new declaration (.d.ts) file containing `declare module 'qrcode';`
src/utils/stores/createSafeStore.ts(182,5): error TS2345: Argument of type 'StateCreator<T & Record<string, unknown>>' is not assignable to parameter of type 'StateCreator<Record<string, unknown>>'.
  Type 'StateCreator<T & Record<string, unknown>>' is not assignable to type '(setState: { (partial: Record<string, unknown> | Partial<Record<string, unknown>> | ((state: Record<string, unknown>) => Record<string, unknown> | Partial<Record<string, unknown>>), replace?: false | undefined): void; (state: Record<...> | ((state: Record<...>) => Record<...>), replace: true): void; }, getState: () ...'.
    Types of parameters 'getState' and 'getState' are incompatible.
      Type '() => Record<string, unknown>' is not assignable to type '() => T & Record<string, unknown>'.
        Type 'Record<string, unknown>' is not assignable to type 'T & Record<string, unknown>'.
          Type 'Record<string, unknown>' is not assignable to type 'T'.
            'Record<string, unknown>' is assignable to the constraint of type 'T', but 'T' could be instantiated with a different subtype of constraint 'object'.
src/utils/sync/RetryManager.ts(171,60): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'RetryableError'.
src/utils/sync/SyncQueue.ts(79,39): error TS2345: Argument of type 'QueueItem<T>' is not assignable to parameter of type 'QueueItem<unknown>'.
  Types of property 'operation' are incompatible.
    Type '(data: T) => Promise<unknown>' is not assignable to type '(data: unknown) => Promise<unknown>'.
      Types of parameters 'data' and 'data' are incompatible.
        Type 'unknown' is not assignable to type 'T'.
          'T' could be instantiated with an arbitrary type which could be unrelated to 'unknown'.
src/utils/sync/masterSyncValidator.ts(517,16): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/masterSyncValidator.ts(536,16): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/masterSyncValidator.ts(568,14): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/resilience/index.ts(52,19): error TS7006: Parameter 'operation' implicitly has an 'any' type.
src/utils/transactions/operations.ts(61,39): error TS18046: 'error' is of type 'unknown'.
```

