# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 3 | 0 |
| TypeScript Errors | 49 | -9 |
| TypeScript Strict Mode Errors | 648 | -9 |

*Last updated: 2025-11-25 13:57:05 UTC*

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
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/useSmartSuggestions.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/budgeting/EditEnvelopeModal.tsx`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/auth/UserSetup.tsx`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 3 | `max-lines-per-function` |

### Detailed Lint Report
```
/home/runner/work/violet-vault/violet-vault/src/components/auth/UserSetup.tsx:26:19 - 1 - Arrow function has too many lines (151). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/components/budgeting/EditEnvelopeModal.tsx:27:27 - 1 - Arrow function has too many lines (152). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/useSmartSuggestions.ts:63:29 - 1 - Arrow function has too many lines (190). Maximum allowed is 150. (max-lines-per-function)
```

## Typecheck Audit

### Files with Most Type Errors
- 3 errors in `src/components/receipts/ReceiptButton.tsx`
- 3 errors in `src/components/layout/ViewRenderer.tsx`
- 2 errors in `src/hooks/settings/useSettingsSectionRenderer.ts`
- 2 errors in `src/hooks/layout/usePaycheckOperations.ts`
- 2 errors in `src/hooks/auth/useAuthManager.ts`
- 2 errors in `src/hooks/analytics/useTransactionAnalysis.ts`
- 2 errors in `src/components/transactions/splitter/SplitAllocationsSection.tsx`
- 2 errors in `src/components/transactions/import/ImportModal.tsx`
- 2 errors in `src/components/transactions/TransactionTable.tsx`
- 2 errors in `src/components/sync/health/SyncHealthDetails.tsx`
- 2 errors in `src/components/savings/SavingsGoals.tsx`
- 2 errors in `src/components/bills/BillTable.tsx`
- 1 errors in `src/utils/sync/corruptionRecoveryHelper.ts`
- 1 errors in `src/hooks/transactions/useTransactionLedger.ts`
- 1 errors in `src/hooks/debts/useDebtDashboard.ts`
- 1 errors in `src/hooks/common/useTransactions.ts`
- 1 errors in `src/hooks/bills/useBillOperations.ts`
- 1 errors in `src/hooks/bills/useBillDetail.ts`
- 1 errors in `src/hooks/analytics/useSmartCategoryAnalysis.ts`
- 1 errors in `src/db/budgetDb.ts`
- 1 errors in `src/components/ui/SecurityAlert.tsx`
- 1 errors in `src/components/ui/ConfirmModal.tsx`
- 1 errors in `src/components/transactions/splitter/SplitterHeader.tsx`
- 1 errors in `src/components/settings/TransactionArchiving.tsx`
- 1 errors in `src/components/settings/SecuritySettings.tsx`
- 1 errors in `src/components/security/LockScreen.tsx`
- 1 errors in `src/components/receipts/components/ExtractedDataField.tsx`
- 1 errors in `src/components/receipts/ReceiptScanner.tsx`
- 1 errors in `src/components/history/BudgetHistoryViewer.tsx`
- 1 errors in `src/components/debt/DebtStrategies.tsx`
- 1 errors in `src/components/debt/DebtDashboard.tsx`
- 1 errors in `src/components/budgeting/PaydayPrediction.tsx`
- 1 errors in `src/components/budgeting/PaycheckProcessor.tsx`
- 1 errors in `src/components/budgeting/EditEnvelopeModal.tsx`
- 1 errors in `src/components/budgeting/CreateEnvelopeModalComponents.tsx`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 18 | `TS2322` |
| 15 | `TS2345` |
| 6 | `TS2769` |
| 2 | `TS2719` |
| 2 | `TS2459` |
| 1 | `TS2741` |
| 1 | `TS2739` |
| 1 | `TS2717` |
| 1 | `TS2694` |
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
src/components/budgeting/EditEnvelopeModal.tsx(185,9): error TS2322: Type '{ id: string; name?: string; currentBalance?: number; targetAmount?: number; }' is not assignable to type 'Envelope'.
  Property 'name' is optional in type '{ id: string; name?: string; currentBalance?: number; targetAmount?: number; }' but required in type 'Envelope'.
src/components/budgeting/PaycheckProcessor.tsx(87,9): error TS2719: Type 'PaycheckHistoryItem[]' is not assignable to type 'PaycheckHistoryItem[]'. Two different types with this name exist, but they are unrelated.
  Type 'PaycheckHistoryItem' is not assignable to type 'PaycheckHistoryItem'. Two different types with this name exist, but they are unrelated.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/budgeting/PaydayPrediction.tsx(105,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Object literal may only specify known properties, and 'title' does not exist in type 'Attributes & { className?: string; }'.
src/components/debt/DebtDashboard.tsx(122,15): error TS2353: Object literal may only specify known properties, and 'paymentDate' does not exist in type '{ amount: number; date?: string; }'.
src/components/debt/DebtStrategies.tsx(110,73): error TS2694: Namespace '"/home/runner/work/violet-vault/violet-vault/src/components/debt/ui/PaymentImpactTable"' has no exported member 'PaymentImpactScenario'.
src/components/history/BudgetHistoryViewer.tsx(139,15): error TS2322: Type '{ commit: BudgetCommit; changes: BudgetChange[]; }' is not assignable to type 'CommitDetails'.
  Types of property 'commit' are incompatible.
    Type 'BudgetCommit' is not assignable to type '{ [key: string]: unknown; hash?: string; message?: string; author?: string; timestamp?: string | number; parentHash?: string; }'.
      Index signature for type 'string' is missing in type 'BudgetCommit'.
src/components/layout/ViewRenderer.tsx(323,46): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").PaycheckHistory[]' is not assignable to parameter of type 'PaycheckHistory[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").PaycheckHistory' is not assignable to type 'PaycheckHistory'.
    Types of property 'allocations' are incompatible.
      Type 'Record<string, number> | { envelopeId: string; envelopeName: string; amount: number; }[]' is not assignable to type 'unknown[]'.
        Type 'Record<string, number>' is missing the following properties from type 'unknown[]': length, pop, push, concat, and 29 more.
src/components/layout/ViewRenderer.tsx(332,9): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]' is not assignable to type 'Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to type 'Transaction'.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/layout/ViewRenderer.tsx(333,9): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope[]' is not assignable to type 'Envelope[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope' is not assignable to type 'Envelope'.
    Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Envelope'.
      Types of property 'id' are incompatible.
        Type 'string | number' is not assignable to type 'string'.
          Type 'number' is not assignable to type 'string'.
src/components/receipts/ReceiptButton.tsx(154,25): error TS2322: Type '(processedReceipt: ProcessedReceipt) => void' is not assignable to type '(data: ReceiptData) => void'.
  Types of parameters 'processedReceipt' and 'data' are incompatible.
    Type 'ReceiptData' is missing the following properties from type 'ProcessedReceipt': total, time, tax, subtotal, and 2 more.
src/components/receipts/ReceiptButton.tsx(160,11): error TS2322: Type 'ProcessedReceipt' is not assignable to type 'ReceiptData'.
  Types of property 'total' are incompatible.
    Type 'string' is not assignable to type 'number'.
src/components/receipts/ReceiptButton.tsx(161,11): error TS2322: Type '(transaction: Transaction, receipt: Receipt) => void' is not assignable to type '() => void'.
  Target signature provides too few arguments. Expected 2 or more, but got 0.
src/components/receipts/ReceiptScanner.tsx(54,25): error TS2345: Argument of type '(data: ReceiptData) => void' is not assignable to parameter of type 'OnReceiptProcessedCallback'.
  Types of parameters 'data' and 'data' are incompatible.
    Type 'ReceiptProcessedData' is not assignable to type 'ReceiptData'.
      Index signature for type 'string' is missing in type 'ReceiptProcessedData'.
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
src/components/transactions/import/ImportModal.tsx(60,44): error TS2322: Type '(data: unknown[]) => void' is not assignable to type '(event: ChangeEvent<HTMLInputElement>, options: { clearExisting: boolean; }) => void'.
  Types of parameters 'data' and 'event' are incompatible.
    Type 'ChangeEvent<HTMLInputElement>' is missing the following properties from type 'unknown[]': length, pop, push, concat, and 29 more.
src/components/transactions/import/ImportModal.tsx(64,13): error TS2322: Type 'unknown[]' is not assignable to type 'ImportData | DataRow[]'.
  Type 'unknown[]' is not assignable to type 'DataRow[]'.
    Type 'unknown' is not assignable to type 'DataRow'.
      Index signature for type 'string' is missing in type '{}'.
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
src/db/budgetDb.ts(94,9): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type '"creating"' is not assignable to parameter of type '"deleting"'.
src/hooks/analytics/useSmartCategoryAnalysis.ts(47,5): error TS2345: Argument of type 'TransactionForStats[]' is not assignable to parameter of type 'Transaction[]'.
  Type 'TransactionForStats' is missing the following properties from type 'Transaction': id, description
src/hooks/analytics/useTransactionAnalysis.ts(23,7): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]'.
  Property 'lastModified' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction'.
src/hooks/analytics/useTransactionAnalysis.ts(27,7): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]'.
  Property 'lastModified' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction'.
src/hooks/auth/useAuthManager.ts(17,8): error TS2459: Module '"./authOperations"' declares 'LoginResult' locally, but it is not exported.
src/hooks/auth/useAuthManager.ts(18,8): error TS2459: Module '"./authOperations"' declares 'AuthContext' locally, but it is not exported.
src/hooks/bills/useBillDetail.ts(74,72): error TS18047: 'bill.dueDate' is possibly 'null'.
src/hooks/bills/useBillOperations.ts(42,77): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Envelope[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope[]'.
  Property 'targetAmount' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Envelope' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope'.
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
src/hooks/settings/useSettingsSectionRenderer.ts(105,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'User' is not assignable to type 'CurrentUser'.
      Index signature for type 'string' is missing in type 'User'.
src/hooks/settings/useSettingsSectionRenderer.ts(114,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Property 'lockApp' is missing in type 'SecurityManager' but required in type 'SecurityManager'.
src/hooks/transactions/useTransactionLedger.ts(80,5): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction'.
    Types of property 'date' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/utils/sync/corruptionRecoveryHelper.ts(52,5): error TS2717: Subsequent property declarations must have the same type.  Property 'detectLocalDataDebug' must be of type '() => Promise<DataDetectionResult>', but here has type '() => Promise<DataDetectionResult>'.
```

## Typecheck Strict Mode Audit

### Files with Most Strict Mode Errors
- 18 errors in `src/hooks/settings/useSettingsSectionRenderer.ts`
- 11 errors in `src/hooks/bills/useBillManager.ts`
- 11 errors in `src/db/budgetDb.ts`
- 10 errors in `src/components/pwa/UpdateAvailableModal.tsx`
- 9 errors in `src/utils/budgeting/envelopeFormUtils.ts`
- 9 errors in `src/utils/budgeting/autofunding/simulation.ts`
- 9 errors in `src/components/bills/BillManager.tsx`
- 8 errors in `src/hooks/transactions/helpers/transactionQueryHelpers.ts`
- 7 errors in `src/components/layout/MainLayout.tsx`
- 7 errors in `src/App.tsx`
- 6 errors in `src/services/bugReport/index.ts`
- 6 errors in `src/hooks/transactions/useTransactionLedger.ts`
- 6 errors in `src/components/transactions/TransactionTable.tsx`
- 5 errors in `src/utils/budgeting/envelopeIntegrityChecker.ts`
- 5 errors in `src/utils/budgeting/autofunding/conditions.ts`
- 5 errors in `src/services/security/securityService.ts`
- 5 errors in `src/services/bugReport/pageDetectionService.ts`
- 5 errors in `src/hooks/transactions/useTransactionSplitter.ts`
- 5 errors in `src/hooks/transactions/useTransactionData.ts`
- 5 errors in `src/hooks/sync/useManualSync.ts`
- 5 errors in `src/hooks/settings/useSettingsDashboard.ts`
- 5 errors in `src/hooks/savings/useSavingsGoals/index.ts`
- 5 errors in `src/hooks/debts/useDebtManagement.ts`
- 5 errors in `src/hooks/budgeting/mutations/useTransferFunds.ts`
- 5 errors in `src/hooks/budgeting/mutations/useDeleteEnvelope.ts`
- 5 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution.ts`
- 5 errors in `src/hooks/auth/useAuthManager.ts`
- 5 errors in `src/hooks/accounts/useSupplementalAccounts.ts`
- 5 errors in `src/components/sync/health/SyncHealthDetails.tsx`
- 5 errors in `src/components/receipts/components/ReceiptExtractedData.tsx`
- 5 errors in `src/components/pwa/PatchNotesModal.tsx`
- 4 errors in `src/utils/pwa/pwaManager.ts`
- 4 errors in `src/utils/bills/billCalculations.ts`
- 4 errors in `src/stores/ui/uiStore.ts`
- 4 errors in `src/services/keys/keyManagementService.ts`
- 4 errors in `src/services/chunkedSyncService.ts`
- 4 errors in `src/services/bugReport/browserInfoService.ts`
- 4 errors in `src/hooks/budgeting/useBudgetHistoryQuery.ts`
- 4 errors in `src/hooks/budgeting/autofunding/useAutoFunding.ts`
- 4 errors in `src/hooks/auth/mutations/useLoginMutations.ts`
- 4 errors in `src/components/settings/SettingsDashboard.tsx`
- 4 errors in `src/components/receipts/ReceiptButton.tsx`
- 4 errors in `src/components/layout/ViewRenderer.tsx`
- 4 errors in `src/components/history/viewer/ChangeDetails.tsx`
- 4 errors in `src/components/budgeting/SmartEnvelopeSuggestions.tsx`
- 3 errors in `src/utils/sync/masterSyncValidator.ts`
- 3 errors in `src/utils/budgeting/paycheckProcessing.ts`
- 3 errors in `src/utils/auth/shareCodeManager.ts`
- 3 errors in `src/utils/analytics/transactionAnalyzer.ts`
- 3 errors in `src/stores/ui/fabStore.ts`
- 3 errors in `src/services/bugReport/contextAnalysisService.ts`
- 3 errors in `src/hooks/transactions/useTransactionsV2.ts`
- 3 errors in `src/hooks/sync/useFirebaseSync.ts`
- 3 errors in `src/hooks/mobile/useFABSmartPositioning.ts`
- 3 errors in `src/hooks/common/useNetworkStatus.ts`
- 3 errors in `src/hooks/common/useDataInitialization.ts`
- 3 errors in `src/hooks/common/useConnectionManager/useConnectionOperations.ts`
- 3 errors in `src/hooks/common/bug-report/useBugReportSubmission.ts`
- 3 errors in `src/hooks/common/bug-report/useBugReportHighlight.ts`
- 3 errors in `src/hooks/common/bug-report/useBugReportDiagnostics.ts`
- 3 errors in `src/hooks/budgeting/useBudgetData/mutationsHelpers.ts`
- 3 errors in `src/hooks/budgeting/autofunding/useUndoOperations.ts`
- 3 errors in `src/hooks/budgeting/autofunding/useAutoFundingData.ts`
- 3 errors in `src/hooks/auth/useAuthenticationManager.ts`
- 3 errors in `src/hooks/auth/mutations/useJoinBudgetMutation.ts`
- 3 errors in `src/components/transactions/import/ImportModal.tsx`
- 3 errors in `src/components/settings/archiving/ArchivingPreviewResults.tsx`
- 3 errors in `src/components/security/LocalDataSecurityWarning.tsx`
- 3 errors in `src/components/receipts/components/ReceiptImagePreview.tsx`
- 3 errors in `src/components/receipts/components/ReceiptActionButtons.tsx`
- 3 errors in `src/components/receipts/components/ExtractedItemsList.tsx`
- 3 errors in `src/components/receipts/ReceiptScanner.tsx`
- 3 errors in `src/components/mobile/SlideUpModal.tsx`
- 3 errors in `src/components/history/viewer/IntegrityWarning.tsx`
- 3 errors in `src/components/charts/CategoryBarChart.tsx`
- 3 errors in `src/components/budgeting/envelope/EnvelopeItem.tsx`
- 3 errors in `src/components/bills/modals/BillDetailModal.tsx`
- 3 errors in `src/components/bills/AddBillModal.tsx`
- 2 errors in `src/utils/testing/storeTestUtils.ts`
- 2 errors in `src/utils/sync/SyncMutex.ts`
- 2 errors in `src/utils/security/keyExport.ts`
- 2 errors in `src/utils/query/queryClientConfig.ts`
- 2 errors in `src/utils/debts/calculations/nextPaymentDate.ts`
- 2 errors in `src/utils/debts/calculations/interestCalculation.ts`
- 2 errors in `src/utils/dataManagement/fileUtils.ts`
- 2 errors in `src/utils/common/transactionArchiving.ts`
- 2 errors in `src/utils/common/lazyImport.ts`
- 2 errors in `src/utils/budgeting/envelopeCalculations.ts`
- 2 errors in `src/utils/bills/billUpdateHelpers.ts`
- 2 errors in `src/services/firebaseMessaging.ts`
- 2 errors in `src/services/editLockService.ts`
- 2 errors in `src/services/bugReport/errorTrackingService.ts`
- 2 errors in `src/hooks/transactions/useTransactionTable.ts`
- 2 errors in `src/hooks/transactions/useTransactionQuery.ts`
- 2 errors in `src/hooks/transactions/useTransactionImport.ts`
- 2 errors in `src/hooks/transactions/useTransactionForm.ts`
- 2 errors in `src/hooks/transactions/useTransactionFileUpload.ts`
- 2 errors in `src/hooks/sharing/useShareCodeValidation.ts`
- 2 errors in `src/hooks/security/useSecuritySettingsLogic.ts`
- 2 errors in `src/hooks/mobile/useBottomNavigation.ts`
- 2 errors in `src/hooks/layout/usePaycheckOperations.ts`
- 2 errors in `src/hooks/common/useTransactionArchiving.ts`
- 2 errors in `src/hooks/common/useRouterPageDetection.ts`
- 2 errors in `src/hooks/common/useActualBalance.ts`
- 2 errors in `src/hooks/budgeting/usePaydayPrediction.ts`
- 2 errors in `src/hooks/budgeting/usePaycheckHistory.ts`
- 2 errors in `src/hooks/budgeting/useEnvelopesQuery.ts`
- 2 errors in `src/hooks/budgeting/useBudgetData/utilities.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useExecutionHistory.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionSummary.ts`
- 2 errors in `src/hooks/bills/useBillOperations.ts`
- 2 errors in `src/hooks/bills/useBillManagerHelpers.ts`
- 2 errors in `src/hooks/auth/useAuthFlow.ts`
- 2 errors in `src/hooks/auth/mutations/useProfileMutations.ts`
- 2 errors in `src/hooks/analytics/utils/pdfGeneratorUtils.ts`
- 2 errors in `src/hooks/analytics/useTransactionAnalysis.ts`
- 2 errors in `src/hooks/analytics/useBillAnalysis.ts`
- 2 errors in `src/hooks/analytics/useAnalyticsExport.ts`
- 2 errors in `src/hooks/analytics/queries/usePaycheckTrendsQuery.ts`
- 2 errors in `src/contexts/authUtils.ts`
- 2 errors in `src/components/transactions/splitter/SplitAllocationsSection.tsx`
- 2 errors in `src/components/transactions/import/ImportProgress.tsx`
- 2 errors in `src/components/transactions/TransactionLedger.tsx`
- 2 errors in `src/components/settings/sections/SyncDebugToolsSection.tsx`
- 2 errors in `src/components/settings/sections/GeneralSettingsSection.tsx`
- 2 errors in `src/components/settings/sections/DevToolsSection.tsx`
- 2 errors in `src/components/settings/sections/ClipboardSecuritySection.tsx`
- 2 errors in `src/components/settings/archiving/ArchivingProgress.tsx`
- 2 errors in `src/components/settings/archiving/ArchivingHeader.tsx`
- 2 errors in `src/components/settings/EnvelopeIntegrityChecker.tsx`
- 2 errors in `src/components/savings/SavingsGoals.tsx`
- 2 errors in `src/components/receipts/components/ReceiptErrorState.tsx`
- 2 errors in `src/components/pwa/OfflineStatusIndicator.tsx`
- 2 errors in `src/components/pages/MainDashboard.tsx`
- 2 errors in `src/components/onboarding/hooks/useTutorialPositioning.ts`
- 2 errors in `src/components/onboarding/EmptyStateHints.tsx`
- 2 errors in `src/components/modals/UnassignedCashModal.tsx`
- 2 errors in `src/components/mobile/FABActionMenu.tsx`
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
- 2 errors in `src/components/budgeting/EditEnvelopeModal.tsx`
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
- 1 errors in `src/utils/sync/dataDetectionHelper.ts`
- 1 errors in `src/utils/sync/corruptionRecoveryHelper.ts`
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
- 1 errors in `src/hooks/budgeting/usePaycheckFormValidated.ts`
- 1 errors in `src/hooks/budgeting/useBudgetData/queryFunctions.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingHistory.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts`
- 1 errors in `src/hooks/bills/useBulkBillOperations.ts`
- 1 errors in `src/hooks/bills/useBills/index.ts`
- 1 errors in `src/hooks/bills/useBillManagerUI.ts`
- 1 errors in `src/hooks/bills/useBillManagerDisplayLogic.ts`
- 1 errors in `src/hooks/auth/useKeyManagementUI.ts`
- 1 errors in `src/hooks/auth/mutations/usePasswordMutations.ts`
- 1 errors in `src/hooks/auth/authOperations.ts`
- 1 errors in `src/hooks/analytics/utils/csvImageExportUtils.ts`
- 1 errors in `src/hooks/analytics/useTransactionFiltering.ts`
- 1 errors in `src/hooks/analytics/useSmartCategoryAnalysis.ts`
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
- 1 errors in `src/components/monitoring/HighlightLoader.tsx`
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
- 1 errors in `src/components/budgeting/PaycheckProcessor.tsx`
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
| 133 | `TS2345` |
| 129 | `TS2322` |
| 73 | `TS7031` |
| 73 | `TS7006` |
| 43 | `TS7005` |
| 43 | `TS2769` |
| 29 | `TS7034` |
| 26 | `TS18048` |
| 25 | `TS18046` |
| 22 | `TS7053` |
| 14 | `TS2339` |
| 10 | `TS18047` |
| 4 | `TS2783` |
| 2 | `TS7022` |
| 2 | `TS2722` |
| 2 | `TS2719` |
| 2 | `TS2531` |
| 2 | `TS2459` |
| 2 | `TS2353` |
| 2 | `TS2352` |
| 1 | `TS7023` |
| 1 | `TS7016` |
| 1 | `TS2741` |
| 1 | `TS2740` |
| 1 | `TS2739` |
| 1 | `TS2717` |
| 1 | `TS2694` |
| 1 | `TS2538` |
| 1 | `TS2365` |
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
src/components/analytics/components/TabContent.tsx(91,32): error TS2322: Type 'AnalyticsData | null | undefined' is not assignable to type 'AnalyticsData'.
  Type 'undefined' is not assignable to type 'AnalyticsData'.
src/components/analytics/components/TabContent.tsx(91,62): error TS2322: Type 'Record<string, unknown> | null | undefined' is not assignable to type 'BalanceData'.
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
src/components/budgeting/EditEnvelopeModal.tsx(154,13): error TS2322: Type 'LockDocument | null' is not assignable to type 'null | undefined'.
  Type 'LockDocument' is not assignable to type 'null | undefined'.
src/components/budgeting/EditEnvelopeModal.tsx(185,9): error TS2322: Type '{ id: string; name?: string | undefined; currentBalance?: number | undefined; targetAmount?: number | undefined; } | null' is not assignable to type 'Envelope | null'.
  Type '{ id: string; name?: string | undefined; currentBalance?: number | undefined; targetAmount?: number | undefined; }' is not assignable to type 'Envelope'.
    Types of property 'name' are incompatible.
      Type 'string | undefined' is not assignable to type 'string'.
        Type 'undefined' is not assignable to type 'string'.
src/components/budgeting/EnvelopeGrid.tsx(3,8): error TS7034: Variable 'useUiStoreRaw' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/budgeting/EnvelopeGrid.tsx(302,22): error TS7005: Variable 'useUiStoreRaw' implicitly has an 'any' type.
src/components/budgeting/PaycheckProcessor.tsx(87,9): error TS2719: Type 'PaycheckHistoryItem[]' is not assignable to type 'PaycheckHistoryItem[]'. Two different types with this name exist, but they are unrelated.
  Type 'PaycheckHistoryItem' is not assignable to type 'PaycheckHistoryItem'. Two different types with this name exist, but they are unrelated.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
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
src/components/history/viewer/ChangeDetails.tsx(80,50): error TS2769: No overload matches this call.
  Overload 1 of 4, '(value: string | number | Date): Date', gave the following error.
    Argument of type 'string | number | undefined' is not assignable to parameter of type 'string | number | Date'.
      Type 'undefined' is not assignable to type 'string | number | Date'.
  Overload 2 of 4, '(value: string | number): Date', gave the following error.
    Argument of type 'string | number | undefined' is not assignable to parameter of type 'string | number'.
      Type 'undefined' is not assignable to type 'string | number'.
src/components/history/viewer/ChangeDetails.tsx(109,36): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/history/viewer/ChangeDetails.tsx(118,73): error TS18048: 'change.diff' is possibly 'undefined'.
src/components/history/viewer/ChangeDetails.tsx(119,47): error TS18048: 'change.diff' is possibly 'undefined'.
src/components/history/viewer/HistoryHeader.tsx(7,26): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/history/viewer/HistoryStatistics.tsx(4,30): error TS7031: Binding element 'statistics' implicitly has an 'any' type.
src/components/history/viewer/IntegrityWarning.tsx(5,29): error TS7031: Binding element 'integrityCheck' implicitly has an 'any' type.
src/components/history/viewer/IntegrityWarning.tsx(5,45): error TS7031: Binding element 'showIntegrityDetails' implicitly has an 'any' type.
src/components/history/viewer/IntegrityWarning.tsx(5,67): error TS7031: Binding element 'toggleIntegrityDetails' implicitly has an 'any' type.
src/components/layout/AppWrapper.tsx(9,23): error TS7031: Binding element 'firebaseSync' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(3,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/layout/MainLayout.tsx(210,54): error TS2322: Type '(id: number) => void' is not assignable to type '(id: string | number) => void'.
  Types of parameters 'id' and 'id' are incompatible.
    Type 'string | number' is not assignable to type 'number'.
      Type 'string' is not assignable to type 'number'.
src/components/layout/MainLayout.tsx(236,24): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(256,18): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ dashboard: string; envelopes: string; savings: string; supplemental: string; paycheck: string; bills: string; transactions: string; debts: string; analytics: string; automation: string; activity: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ dashboard: string; envelopes: string; savings: string; supplemental: string; paycheck: string; bills: string; transactions: string; debts: string; analytics: string; automation: string; activity: string; }'.
src/components/layout/MainLayout.tsx(287,20): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(290,21): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(489,11): error TS2322: Type 'unknown' is not assignable to type '{ userName?: string | undefined; userColor?: string | undefined; }'.
src/components/layout/SummaryCards.tsx(4,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/layout/SummaryCards.tsx(33,35): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/ViewRenderer.tsx(321,9): error TS2322: Type '(paycheck: PaycheckHistory) => Promise<void>' is not assignable to type '(paycheck: PaycheckHistoryItem) => Promise<void>'.
  Types of parameters 'paycheck' and 'paycheck' are incompatible.
    Property 'lastModified' is missing in type 'PaycheckHistoryItem' but required in type 'PaycheckHistory'.
src/components/layout/ViewRenderer.tsx(323,46): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").PaycheckHistory[]' is not assignable to parameter of type 'PaycheckHistory[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").PaycheckHistory' is not assignable to type 'PaycheckHistory'.
    Types of property 'allocations' are incompatible.
      Type 'Record<string, number> | { envelopeId: string; envelopeName: string; amount: number; }[] | undefined' is not assignable to type 'unknown[] | undefined'.
        Type 'Record<string, number>' is missing the following properties from type 'unknown[]': length, pop, push, concat, and 29 more.
src/components/layout/ViewRenderer.tsx(332,9): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]' is not assignable to type 'Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to type 'Transaction'.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/layout/ViewRenderer.tsx(333,9): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope[]' is not assignable to type 'Envelope[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope' is not assignable to type 'Envelope'.
    Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Envelope'.
      Types of property 'id' are incompatible.
        Type 'string | number' is not assignable to type 'string'.
          Type 'number' is not assignable to type 'string'.
src/components/mobile/FABActionMenu.tsx(121,30): error TS7006: Parameter 'action' implicitly has an 'any' type.
src/components/mobile/FABActionMenu.tsx(121,38): error TS7006: Parameter 'index' implicitly has an 'any' type.
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
src/components/onboarding/EmptyStateHints.tsx(228,46): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
src/components/onboarding/EmptyStateHints.tsx(258,37): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
src/components/onboarding/hooks/useTutorialPositioning.ts(8,43): error TS7006: Parameter 'element' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialPositioning.ts(8,52): error TS7006: Parameter 'step' implicitly has an 'any' type.
src/components/pages/MainDashboard.tsx(81,38): error TS7006: Parameter 'newBalance' implicitly has an 'any' type.
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
src/components/pwa/UpdateAvailableModal.tsx(35,61): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/pwa/UpdateAvailableModal.tsx(53,27): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/UpdateAvailableModal.tsx(53,39): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/pwa/UpdateAvailableModal.tsx(54,22): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/UpdateAvailableModal.tsx(54,34): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/pwa/UpdateAvailableModal.tsx(55,30): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/UpdateAvailableModal.tsx(55,42): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/pwa/UpdateAvailableModal.tsx(56,21): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/UpdateAvailableModal.tsx(56,33): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/receipts/ReceiptButton.tsx(55,47): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/receipts/ReceiptButton.tsx(154,25): error TS2322: Type '(processedReceipt: ProcessedReceipt) => void' is not assignable to type '(data: ReceiptData) => void'.
  Types of parameters 'processedReceipt' and 'data' are incompatible.
    Type 'ReceiptData' is missing the following properties from type 'ProcessedReceipt': total, time, tax, subtotal, and 2 more.
src/components/receipts/ReceiptButton.tsx(160,11): error TS2322: Type 'ProcessedReceipt' is not assignable to type 'ReceiptData'.
  Types of property 'merchant' are incompatible.
    Type 'string | null' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/components/receipts/ReceiptButton.tsx(161,11): error TS2322: Type '(transaction: Transaction, receipt: Receipt) => void' is not assignable to type '() => void'.
  Target signature provides too few arguments. Expected 2 or more, but got 0.
src/components/receipts/ReceiptScanner.tsx(54,25): error TS2345: Argument of type '(data: ReceiptData) => void' is not assignable to parameter of type 'OnReceiptProcessedCallback'.
  Types of parameters 'data' and 'data' are incompatible.
    Type 'ReceiptProcessedData' is not assignable to type 'ReceiptData'.
      Types of property 'merchant' are incompatible.
        Type 'string | null' is not assignable to type 'string | undefined'.
          Type 'null' is not assignable to type 'string | undefined'.
src/components/receipts/ReceiptScanner.tsx(71,15): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/components/receipts/ReceiptScanner.tsx(72,15): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/components/receipts/components/ExtractedDataField.tsx(27,49): error TS2345: Argument of type 'number' is not assignable to parameter of type 'ConfidenceLevel'.
src/components/receipts/components/ExtractedItemsList.tsx(5,31): error TS7031: Binding element 'items' implicitly has an 'any' type.
src/components/receipts/components/ExtractedItemsList.tsx(16,35): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/receipts/components/ExtractedItemsList.tsx(16,41): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/receipts/components/ReceiptActionButtons.tsx(8,33): error TS7031: Binding element 'extractedData' implicitly has an 'any' type.
src/components/receipts/components/ReceiptActionButtons.tsx(8,48): error TS7031: Binding element 'onReset' implicitly has an 'any' type.
src/components/receipts/components/ReceiptActionButtons.tsx(8,57): error TS7031: Binding element 'onConfirm' implicitly has an 'any' type.
src/components/receipts/components/ReceiptErrorState.tsx(9,30): error TS7031: Binding element 'error' implicitly has an 'any' type.
src/components/receipts/components/ReceiptErrorState.tsx(9,37): error TS7031: Binding element 'onRetry' implicitly has an 'any' type.
src/components/receipts/components/ReceiptExtractedData.tsx(11,33): error TS7031: Binding element 'extractedData' implicitly has an 'any' type.
src/components/receipts/components/ReceiptExtractedData.tsx(14,27): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/components/receipts/components/ReceiptExtractedData.tsx(39,13): error TS2322: Type '(value: any) => string | null' is not assignable to type '(val: string | number) => string | number'.
  Type 'string | null' is not assignable to type 'string | number'.
    Type 'null' is not assignable to type 'string | number'.
src/components/receipts/components/ReceiptExtractedData.tsx(57,15): error TS2322: Type '(value: any) => string | null' is not assignable to type '(val: string | number) => string | number'.
  Type 'string | null' is not assignable to type 'string | number'.
    Type 'null' is not assignable to type 'string | number'.
src/components/receipts/components/ReceiptExtractedData.tsx(67,15): error TS2322: Type '(value: any) => string | null' is not assignable to type '(val: string | number) => string | number'.
  Type 'string | null' is not assignable to type 'string | number'.
    Type 'null' is not assignable to type 'string | number'.
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
src/components/settings/EnvelopeIntegrityChecker.tsx(17,37): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/settings/EnvelopeIntegrityChecker.tsx(17,45): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
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
src/components/settings/SettingsDashboard.tsx(218,5): error TS2322: Type 'unknown' is not assignable to type 'SecurityManager | undefined'.
src/components/settings/SettingsDashboard.tsx(257,9): error TS2322: Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'RefObject<HTMLDivElement>'.
  Type 'HTMLDivElement | null' is not assignable to type 'HTMLDivElement'.
    Type 'null' is not assignable to type 'HTMLDivElement'.
src/components/settings/TransactionArchiving.tsx(87,9): error TS2322: Type '(urgency: string) => string' is not assignable to type '(urgency: string) => ComponentType<{ className?: string | undefined; }>'.
  Type 'string' is not assignable to type 'ComponentType<{ className?: string | undefined; }>'.
src/components/settings/archiving/ArchivingHeader.tsx(5,28): error TS7031: Binding element 'onRefresh' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingHeader.tsx(5,39): error TS7031: Binding element 'isLoading' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingPreviewResults.tsx(5,36): error TS7031: Binding element 'showPreview' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingPreviewResults.tsx(5,49): error TS7031: Binding element 'previewData' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingPreviewResults.tsx(5,62): error TS7031: Binding element 'onClosePreview' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingProgress.tsx(4,30): error TS7031: Binding element 'isArchiving' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingProgress.tsx(4,43): error TS7031: Binding element 'archivingProgress' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingResult.tsx(4,28): error TS7031: Binding element 'lastResult' implicitly has an 'any' type.
src/components/settings/sections/ClipboardSecuritySection.tsx(8,37): error TS7031: Binding element 'securitySettings' implicitly has an 'any' type.
src/components/settings/sections/ClipboardSecuritySection.tsx(8,55): error TS7031: Binding element 'handleSettingChange' implicitly has an 'any' type.
src/components/settings/sections/DevToolsSection.tsx(17,28): error TS7031: Binding element 'onOpenEnvelopeChecker' implicitly has an 'any' type.
src/components/settings/sections/DevToolsSection.tsx(17,51): error TS7031: Binding element 'onCreateTestHistory' implicitly has an 'any' type.
src/components/settings/sections/GeneralSettingsSection.tsx(4,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/settings/sections/GeneralSettingsSection.tsx(286,25): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/settings/sections/SyncDebugToolsSection.tsx(201,42): error TS2722: Cannot invoke an object which is possibly 'undefined'.
src/components/settings/sections/SyncDebugToolsSection.tsx(201,42): error TS18048: 'window.forceCloudDataReset' is possibly 'undefined'.
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
src/components/transactions/TransactionLedger.tsx(491,7): error TS2322: Type 'Dispatch<SetStateAction<{ date: string; description: string; amount: string; type: string; envelopeId: string; category: string; notes: string; reconciled: boolean; }>>' is not assignable to type '(form: unknown) => void'.
  Types of parameters 'value' and 'form' are incompatible.
    Type 'unknown' is not assignable to type 'SetStateAction<{ date: string; description: string; amount: string; type: string; envelopeId: string; category: string; notes: string; reconciled: boolean; }>'.
src/components/transactions/TransactionTable.tsx(124,21): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to type 'Transaction'.
  Index signature for type 'string' is missing in type 'Transaction'.
src/components/transactions/TransactionTable.tsx(127,21): error TS2322: Type 'VirtualItem' is not assignable to type 'VirtualRow'.
  Index signature for type 'string' is missing in type 'VirtualItem'.
src/components/transactions/TransactionTable.tsx(322,27): error TS2345: Argument of type 'Transaction[]' is not assignable to parameter of type 'never[]'.
  Type 'Transaction' is not assignable to type 'never'.
src/components/transactions/TransactionTable.tsx(326,36): error TS2339: Property 'id' does not exist on type 'never'.
src/components/transactions/TransactionTable.tsx(374,40): error TS2339: Property 'id' does not exist on type 'never'.
src/components/transactions/TransactionTable.tsx(376,42): error TS2339: Property 'description' does not exist on type 'never'.
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
src/components/transactions/import/ImportProgress.tsx(4,27): error TS7031: Binding element 'importData' implicitly has an 'any' type.
src/components/transactions/import/ImportProgress.tsx(4,39): error TS7031: Binding element 'importProgress' implicitly has an 'any' type.
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
src/db/budgetDb.ts(94,9): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type '"creating"' is not assignable to parameter of type '"deleting"'.
src/db/budgetDb.ts(142,31): error TS2769: No overload matches this call.
  Overload 1 of 4, '(target: {}, source: Record<string, unknown>): Record<string, unknown>', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type '{}'.
  Overload 2 of 4, '(target: object, ...sources: any[]): any', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'object'.
src/db/budgetDb.ts(191,9): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type '"updating"' is not assignable to parameter of type '"deleting"'.
src/db/budgetDb.ts(203,23): error TS2345: Argument of type 'Table<Envelope, string, Envelope>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(204,23): error TS2345: Argument of type 'Table<Transaction, string, Transaction>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(205,23): error TS2345: Argument of type 'Table<Bill, string, Bill>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(206,23): error TS2345: Argument of type 'Table<SavingsGoal, string, SavingsGoal>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(207,23): error TS2345: Argument of type 'Table<PaycheckHistory, string, PaycheckHistory>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(208,23): error TS2345: Argument of type 'Table<Debt, string, Debt>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(578,5): error TS2322: Type 'BudgetRecord | undefined' is not assignable to type 'BudgetRecord | null'.
  Type 'undefined' is not assignable to type 'BudgetRecord | null'.
src/db/budgetDb.ts(602,5): error TS2322: Type 'BudgetRecord | undefined' is not assignable to type 'BudgetRecord | null'.
  Type 'undefined' is not assignable to type 'BudgetRecord | null'.
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
src/hooks/analytics/useAnalyticsExport.ts(8,44): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/hooks/analytics/useAnalyticsExport.ts(8,50): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/hooks/analytics/useAnalyticsIntegration.ts(129,36): error TS7006: Parameter 'newTimeFilter' implicitly has an 'any' type.
src/hooks/analytics/useBillAnalysis.ts(11,33): error TS7006: Parameter 'bills' implicitly has an 'any' type.
src/hooks/analytics/useBillAnalysis.ts(11,40): error TS7006: Parameter 'settings' implicitly has an 'any' type.
src/hooks/analytics/useSmartCategoryAnalysis.ts(47,5): error TS2345: Argument of type 'TransactionForStats[]' is not assignable to parameter of type 'Transaction[]'.
  Type 'TransactionForStats' is missing the following properties from type 'Transaction': id, description
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
src/hooks/auth/mutations/useJoinBudgetMutation.ts(194,31): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(203,18): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string | null'.
  Type 'undefined' is not assignable to type 'string | null'.
src/hooks/auth/mutations/useLoginMutations.ts(52,13): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/auth/mutations/useLoginMutations.ts(53,25): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/auth/mutations/useLoginMutations.ts(313,7): error TS2322: Type 'null' is not assignable to type 'Record<string, unknown>'.
src/hooks/auth/mutations/useLoginMutations.ts(356,18): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string | null'.
  Type 'undefined' is not assignable to type 'string | null'.
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
src/hooks/auth/useAuthenticationManager.ts(85,45): error TS2339: Property 'budgetId' does not exist on type 'never'.
src/hooks/auth/useAuthenticationManager.ts(86,39): error TS2339: Property 'budgetId' does not exist on type 'never'.
src/hooks/auth/useAuthenticationManager.ts(140,5): error TS2322: Type '(updatedProfile: UserProfile) => Promise<void>' is not assignable to type '(updatedProfile: unknown) => void'.
  Types of parameters 'updatedProfile' and 'updatedProfile' are incompatible.
    Type 'unknown' is not assignable to type 'UserProfile'.
src/hooks/auth/useKeyManagementUI.ts(164,5): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/hooks/bills/useBillManager.ts(12,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/bills/useBillManager.ts(93,18): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/bills/useBillManager.ts(118,9): error TS2345: Argument of type '((bill: Bill) => void | Promise<void>) | undefined' is not assignable to parameter of type '((bill: BillRecord) => void | Promise<void>) | undefined'.
  Type '(bill: Bill) => void | Promise<void>' is not assignable to type '(bill: BillRecord) => void | Promise<void>'.
    Types of parameters 'bill' and 'bill' are incompatible.
      Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManager.ts(143,5): error TS2322: Type '((bill: Bill) => void | Promise<void>) | undefined' is not assignable to type '((bill: import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill) => void | Promise<void>) | undefined'.
  Type '(bill: Bill) => void | Promise<void>' is not assignable to type '(bill: import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill) => void | Promise<void>'.
    Types of parameters 'bill' and 'bill' are incompatible.
      Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill' is not assignable to type 'Bill'.
        Index signature for type 'string' is missing in type 'Bill'.
src/hooks/bills/useBillManager.ts(145,5): error TS2322: Type '{ unassignedCash?: number | undefined; updateBill?: ((bill: Bill) => void | Promise<void>) | undefined; }' is not assignable to type 'BudgetContext'.
  Types of property 'updateBill' are incompatible.
    Type '((bill: Bill) => void | Promise<void>) | undefined' is not assignable to type '((bill: import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill) => void | Promise<void>) | undefined'.
      Type '(bill: Bill) => void | Promise<void>' is not assignable to type '(bill: import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill) => void | Promise<void>'.
        Types of parameters 'bill' and 'bill' are incompatible.
          Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill' is not assignable to type 'Bill'.
            Index signature for type 'string' is missing in type 'Bill'.
src/hooks/bills/useBillManager.ts(164,11): error TS2322: Type 'Dispatch<SetStateAction<never[]>>' is not assignable to type '(bills: BillRecord[]) => void'.
  Types of parameters 'value' and 'bills' are incompatible.
    Type 'BillRecord[]' is not assignable to type 'SetStateAction<never[]>'.
      Type 'BillRecord[]' is not assignable to type 'never[]'.
        Type 'BillRecord' is not assignable to type 'never'.
src/hooks/bills/useBillManager.ts(176,11): error TS2322: Type '((bill: Bill) => void | Promise<void>) | undefined' is not assignable to type '((bill: BillRecord) => void | Promise<void>) | undefined'.
  Type '(bill: Bill) => void | Promise<void>' is not assignable to type '(bill: BillRecord) => void | Promise<void>'.
    Types of parameters 'bill' and 'bill' are incompatible.
      Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManager.ts(177,11): error TS2322: Type '(bill: Bill) => Promise<void>' is not assignable to type '(bill: BillRecord) => Promise<void>'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManager.ts(201,5): error TS2322: Type '(bill: Bill | null) => void' is not assignable to type '(bill: BillRecord | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillRecord | null' is not assignable to type 'Bill | null'.
      Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManager.ts(203,5): error TS2322: Type '(bill: Bill | null) => void' is not assignable to type '(bill: BillRecord | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillRecord | null' is not assignable to type 'Bill | null'.
      Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManager.ts(206,5): error TS2322: Type '(bill: Bill | null) => void' is not assignable to type '(bill: BillRecord | null) => void'.
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
src/hooks/bills/useBillManagerUI.ts(100,50): error TS2345: Argument of type '(bill: { id: string; }) => string' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => string'.
  Types of parameters 'bill' and 'value' are incompatible.
    Type 'unknown' is not assignable to type '{ id: string; }'.
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
src/hooks/budgeting/autofunding/useAutoFunding.ts(121,12): error TS7006: Parameter 'executionId' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFunding.ts(141,6): error TS7006: Parameter 'importData' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingData.ts(31,65): error TS2345: Argument of type 'Dispatch<SetStateAction<null>>' is not assignable to parameter of type '(val: string | null) => void'.
  Types of parameters 'value' and 'val' are incompatible.
    Type 'string | null' is not assignable to type 'SetStateAction<null>'.
      Type 'string' is not assignable to type 'SetStateAction<null>'.
src/hooks/budgeting/autofunding/useAutoFundingData.ts(37,52): error TS2345: Argument of type 'Dispatch<SetStateAction<null>>' is not assignable to parameter of type '(val: string | null) => void'.
  Types of parameters 'value' and 'val' are incompatible.
    Type 'string | null' is not assignable to type 'SetStateAction<null>'.
      Type 'string' is not assignable to type 'SetStateAction<null>'.
src/hooks/budgeting/autofunding/useAutoFundingData.ts(42,54): error TS2345: Argument of type 'Dispatch<SetStateAction<null>>' is not assignable to parameter of type '(val: string | null) => void'.
  Types of parameters 'value' and 'val' are incompatible.
    Type 'string | null' is not assignable to type 'SetStateAction<null>'.
      Type 'string' is not assignable to type 'SetStateAction<null>'.
src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts(215,18): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string | null'.
  Type 'undefined' is not assignable to type 'string | null'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(3,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(23,18): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(23,30): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(76,28): error TS18048: 'result.execution' is possibly 'undefined'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(77,26): error TS18048: 'result.execution' is possibly 'undefined'.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionSummary.ts(7,37): error TS7006: Parameter 'lastExecution' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionSummary.ts(23,47): error TS7006: Parameter 'r' implicitly has an 'any' type.
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
src/hooks/budgeting/autofunding/useUndoOperations.ts(190,18): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useUndoOperations.ts(190,30): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/hooks/budgeting/mutations/useDeleteEnvelope.ts(27,23): error TS18048: 'envelope.currentBalance' is possibly 'undefined'.
src/hooks/budgeting/mutations/useDeleteEnvelope.ts(31,59): error TS18048: 'envelope.currentBalance' is possibly 'undefined'.
src/hooks/budgeting/mutations/useDeleteEnvelope.ts(36,27): error TS18048: 'envelope.currentBalance' is possibly 'undefined'.
src/hooks/budgeting/mutations/useDeleteEnvelope.ts(71,52): error TS2322: Type 'null' is not assignable to type 'string | PropModification | undefined'.
src/hooks/budgeting/mutations/useDeleteEnvelope.ts(72,72): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/budgeting/mutations/useTransferFunds.ts(39,11): error TS18048: 'fromEnvelope.currentBalance' is possibly 'undefined'.
src/hooks/budgeting/mutations/useTransferFunds.ts(45,25): error TS18048: 'fromEnvelope.currentBalance' is possibly 'undefined'.
src/hooks/budgeting/mutations/useTransferFunds.ts(50,25): error TS18048: 'toEnvelope.currentBalance' is possibly 'undefined'.
src/hooks/budgeting/mutations/useTransferFunds.ts(70,25): error TS18048: 'fromEnvelope.currentBalance' is possibly 'undefined'.
src/hooks/budgeting/mutations/useTransferFunds.ts(74,25): error TS18048: 'toEnvelope.currentBalance' is possibly 'undefined'.
src/hooks/budgeting/useBudgetData/mutationsHelpers.ts(81,26): error TS18048: 'envelope.currentBalance' is possibly 'undefined'.
src/hooks/budgeting/useBudgetData/mutationsHelpers.ts(105,49): error TS2345: Argument of type 'BudgetRecord | null' is not assignable to parameter of type 'BudgetMetadata'.
  Type 'null' is not assignable to type 'BudgetMetadata'.
src/hooks/budgeting/useBudgetData/mutationsHelpers.ts(106,36): error TS2345: Argument of type 'EnvelopeAllocation[] | undefined' is not assignable to parameter of type 'EnvelopeAllocation[]'.
  Type 'undefined' is not assignable to type 'EnvelopeAllocation[]'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(66,66): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/budgeting/useBudgetData/utilities.ts(17,17): error TS7006: Parameter 'filters' implicitly has an 'any' type.
src/hooks/budgeting/useBudgetData/utilities.ts(19,20): error TS7006: Parameter 'dateRange' implicitly has an 'any' type.
src/hooks/budgeting/useBudgetHistoryQuery.ts(25,56): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(63,40): error TS2345: Argument of type '{ hash: string; message: string; author: string; parentHash: string | null; deviceFingerprint: string; encryptedSnapshot: number[]; iv: number[]; timestamp: number; }' is not assignable to parameter of type 'BudgetCommit'.
  Types of property 'parentHash' are incompatible.
    Type 'string | null' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(107,56): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(136,62): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
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
src/hooks/budgeting/usePaycheckHistory.ts(10,38): error TS7031: Binding element 'onDeletePaycheck' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckHistory.ts(14,39): error TS7006: Parameter 'paycheck' implicitly has an 'any' type.
src/hooks/budgeting/usePaydayPrediction.ts(11,30): error TS7006: Parameter 'paycheckHistory' implicitly has an 'any' type.
src/hooks/budgeting/usePaydayPrediction.ts(11,47): error TS7006: Parameter 'isUnlocked' implicitly has an 'any' type.
src/hooks/common/bug-report/useBugReportDiagnostics.ts(36,22): error TS2345: Argument of type '{ success: boolean; components: { screenshot: { success: boolean; screenshot: boolean; info: ScreenshotInfo | null; methods: { displayMedia: boolean; html2canvas: boolean; }; error?: undefined; } | { ...; }; systemInfo: { ...; } | { ...; }; contextAnalysis: { ...; } | { ...; }; }; timestamp: string; error?: undefine...' is not assignable to parameter of type 'SetStateAction<null>'.
  Type '{ success: boolean; components: { screenshot: { success: boolean; screenshot: boolean; info: ScreenshotInfo | null; methods: { displayMedia: boolean; html2canvas: boolean; }; error?: undefined; } | { ...; }; systemInfo: { ...; } | { ...; }; contextAnalysis: { ...; } | { ...; }; }; timestamp: string; error?: undefine...' is not assignable to type 'SetStateAction<null>'.
    Type '{ success: boolean; components: { screenshot: { success: boolean; screenshot: boolean; info: ScreenshotInfo | null; methods: { displayMedia: boolean; html2canvas: boolean; }; error?: undefined; } | { ...; }; systemInfo: { ...; } | { ...; }; contextAnalysis: { ...; } | { ...; }; }; timestamp: string; error?: undefine...' provides no match for the signature '(prevState: null): null'.
src/hooks/common/bug-report/useBugReportDiagnostics.ts(42,16): error TS18046: 'error' is of type 'unknown'.
src/hooks/common/bug-report/useBugReportDiagnostics.ts(45,22): error TS2345: Argument of type '{ success: boolean; error: any; timestamp: string; }' is not assignable to parameter of type 'SetStateAction<null>'.
  Type '{ success: boolean; error: any; timestamp: string; }' provides no match for the signature '(prevState: null): null'.
src/hooks/common/bug-report/useBugReportHighlight.ts(91,62): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/common/bug-report/useBugReportHighlight.ts(103,67): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/common/bug-report/useBugReportHighlight.ts(118,7): error TS2322: Type 'string | undefined' is not assignable to type 'string | null'.
  Type 'undefined' is not assignable to type 'string | null'.
src/hooks/common/bug-report/useBugReportSubmission.ts(109,7): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/common/bug-report/useBugReportSubmission.ts(179,22): error TS18046: 'error' is of type 'unknown'.
src/hooks/common/bug-report/useBugReportSubmission.ts(230,5): error TS2322: Type '(description: string, severity?: "low" | "medium" | "high" | "critical") => Promise<{ reportData: { title: string; hasScreenshot: boolean; systemInfo: SystemInfo | Promise<SystemInfo>; }; ... 8 more ...; screenshotStatus?: { captured: boolean; size: number; uploaded: boolean; reason?: string; }; }>' is not assignable to type '(description: string, severity?: string | undefined) => Promise<unknown>'.
  Types of parameters 'severity' and 'severity' are incompatible.
    Type 'string | undefined' is not assignable to type '"low" | "medium" | "high" | "critical" | undefined'.
      Type 'string' is not assignable to type '"low" | "medium" | "high" | "critical" | undefined'.
src/hooks/common/useActualBalance.ts(2,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/common/useActualBalance.ts(33,7): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/common/useBugReport.ts(60,53): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/common/useConnectionManager/useConnectionConfig.ts(6,32): error TS7006: Parameter 'entityType' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(183,40): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(196,67): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(209,55): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/common/useDataInitialization.ts(2,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/common/useDataInitialization.ts(40,28): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/common/useDataInitialization.ts(40,44): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(166,26): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'null | undefined'.
src/hooks/common/useNetworkStatus.ts(2,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/common/useNetworkStatus.ts(11,27): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/common/useNetworkStatus.ts(11,43): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/hooks/common/usePrompt.ts(109,12): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/common/useRouterPageDetection.ts(22,25): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ "/app": string; "/app/dashboard": string; "/app/envelopes": string; "/app/savings": string; "/app/supplemental": string; "/app/paycheck": string; "/app/bills": string; "/app/transactions": string; "/app/debts": string; "/app/analytics": string; "/app/automation": string; "/app/activity": string; }'.
  No index signature with a parameter of type 'string' was found on type '{ "/app": string; "/app/dashboard": string; "/app/envelopes": string; "/app/savings": string; "/app/supplemental": string; "/app/paycheck": string; "/app/bills": string; "/app/transactions": string; "/app/debts": string; "/app/analytics": string; "/app/automation": string; "/app/activity": string; }'.
src/hooks/common/useRouterPageDetection.ts(66,24): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ dashboard: string; envelopes: string; savings: string; supplemental: string; paycheck: string; bills: string; transactions: string; debts: string; analytics: string; automation: string; activity: string; }'.
src/hooks/common/useTransactionArchiving.ts(105,12): error TS7006: Parameter 'archiveId' implicitly has an 'any' type.
src/hooks/common/useTransactionArchiving.ts(126,41): error TS7006: Parameter 'transactionCount' implicitly has an 'any' type.
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
src/hooks/mobile/useBottomNavigation.ts(132,20): error TS7006: Parameter 'itemKey' implicitly has an 'any' type.
src/hooks/mobile/useBottomNavigation.ts(133,20): error TS7006: Parameter 'key' implicitly has an 'any' type.
src/hooks/mobile/useFABBehavior.ts(127,50): error TS2345: Argument of type 'RefObject<null>' is not assignable to parameter of type 'RefObject<HTMLElement>'.
  Type 'null' is not assignable to type 'HTMLElement'.
src/hooks/mobile/useFABSmartPositioning.ts(13,9): error TS7034: Variable 'resizeTimeout' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/mobile/useFABSmartPositioning.ts(17,20): error TS7005: Variable 'resizeTimeout' implicitly has an 'any' type.
src/hooks/mobile/useFABSmartPositioning.ts(60,20): error TS7005: Variable 'resizeTimeout' implicitly has an 'any' type.
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
src/hooks/security/useSecuritySettingsLogic.ts(18,6): error TS7006: Parameter 'setting' implicitly has an 'any' type.
src/hooks/security/useSecuritySettingsLogic.ts(18,15): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/settings/useSettingsDashboard.ts(2,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/settings/useSettingsDashboard.ts(103,28): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/settings/useSettingsDashboard.ts(103,44): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/hooks/settings/useSettingsDashboard.ts(104,31): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/settings/useSettingsDashboard.ts(104,47): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(95,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'boolean | undefined' is not assignable to type 'boolean'.
      Type 'undefined' is not assignable to type 'boolean'.
        Type 'boolean | undefined' is not assignable to type 'boolean'.
          Type 'undefined' is not assignable to type 'boolean'.
            Type 'boolean | undefined' is not assignable to type 'boolean'.
              Type 'undefined' is not assignable to type 'boolean'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
                    Type '(() => void) | undefined' is not assignable to type '() => void'.
                      Type 'undefined' is not assignable to type '() => void'.
                        Type '(() => void) | undefined' is not assignable to type '() => void'.
                          Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(96,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'boolean | undefined' is not assignable to type 'boolean'.
      Type 'undefined' is not assignable to type 'boolean'.
        Type 'boolean | undefined' is not assignable to type 'boolean'.
          Type 'undefined' is not assignable to type 'boolean'.
            Type 'boolean | undefined' is not assignable to type 'boolean'.
              Type 'undefined' is not assignable to type 'boolean'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
                    Type '(() => void) | undefined' is not assignable to type '() => void'.
                      Type 'undefined' is not assignable to type '() => void'.
                        Type '(() => void) | undefined' is not assignable to type '() => void'.
                          Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(97,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'boolean | undefined' is not assignable to type 'boolean'.
      Type 'undefined' is not assignable to type 'boolean'.
        Type 'boolean | undefined' is not assignable to type 'boolean'.
          Type 'undefined' is not assignable to type 'boolean'.
            Type 'boolean | undefined' is not assignable to type 'boolean'.
              Type 'undefined' is not assignable to type 'boolean'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
                    Type '(() => void) | undefined' is not assignable to type '() => void'.
                      Type 'undefined' is not assignable to type '() => void'.
                        Type '(() => void) | undefined' is not assignable to type '() => void'.
                          Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(98,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'boolean | undefined' is not assignable to type 'boolean'.
      Type 'undefined' is not assignable to type 'boolean'.
        Type 'boolean | undefined' is not assignable to type 'boolean'.
          Type 'undefined' is not assignable to type 'boolean'.
            Type 'boolean | undefined' is not assignable to type 'boolean'.
              Type 'undefined' is not assignable to type 'boolean'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
                    Type '(() => void) | undefined' is not assignable to type '() => void'.
                      Type 'undefined' is not assignable to type '() => void'.
                        Type '(() => void) | undefined' is not assignable to type '() => void'.
                          Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(99,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'boolean | undefined' is not assignable to type 'boolean'.
      Type 'undefined' is not assignable to type 'boolean'.
        Type 'boolean | undefined' is not assignable to type 'boolean'.
          Type 'undefined' is not assignable to type 'boolean'.
            Type 'boolean | undefined' is not assignable to type 'boolean'.
              Type 'undefined' is not assignable to type 'boolean'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
                    Type '(() => void) | undefined' is not assignable to type '() => void'.
                      Type 'undefined' is not assignable to type '() => void'.
                        Type '(() => void) | undefined' is not assignable to type '() => void'.
                          Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(100,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'boolean | undefined' is not assignable to type 'boolean'.
      Type 'undefined' is not assignable to type 'boolean'.
        Type 'boolean | undefined' is not assignable to type 'boolean'.
          Type 'undefined' is not assignable to type 'boolean'.
            Type 'boolean | undefined' is not assignable to type 'boolean'.
              Type 'undefined' is not assignable to type 'boolean'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
                    Type '(() => void) | undefined' is not assignable to type '() => void'.
                      Type 'undefined' is not assignable to type '() => void'.
                        Type '(() => void) | undefined' is not assignable to type '() => void'.
                          Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(105,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'User | undefined' is not assignable to type 'CurrentUser'.
      Type 'undefined' is not assignable to type 'CurrentUser'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '(() => void) | undefined' is not assignable to type '() => void'.
              Type 'undefined' is not assignable to type '() => void'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
                    Type '((profile: UserProfile) => void) | undefined' is not assignable to type '(profile: CurrentUser) => void'.
                      Type 'undefined' is not assignable to type '(profile: CurrentUser) => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(106,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'User | undefined' is not assignable to type 'CurrentUser'.
      Type 'undefined' is not assignable to type 'CurrentUser'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '(() => void) | undefined' is not assignable to type '() => void'.
              Type 'undefined' is not assignable to type '() => void'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
                    Type '((profile: UserProfile) => void) | undefined' is not assignable to type '(profile: CurrentUser) => void'.
                      Type 'undefined' is not assignable to type '(profile: CurrentUser) => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(107,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'User | undefined' is not assignable to type 'CurrentUser'.
      Type 'undefined' is not assignable to type 'CurrentUser'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '(() => void) | undefined' is not assignable to type '() => void'.
              Type 'undefined' is not assignable to type '() => void'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
                    Type '((profile: UserProfile) => void) | undefined' is not assignable to type '(profile: CurrentUser) => void'.
                      Type 'undefined' is not assignable to type '(profile: CurrentUser) => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(108,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'User | undefined' is not assignable to type 'CurrentUser'.
      Type 'undefined' is not assignable to type 'CurrentUser'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '(() => void) | undefined' is not assignable to type '() => void'.
              Type 'undefined' is not assignable to type '() => void'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
                    Type '((profile: UserProfile) => void) | undefined' is not assignable to type '(profile: CurrentUser) => void'.
                      Type 'undefined' is not assignable to type '(profile: CurrentUser) => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(109,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'User | undefined' is not assignable to type 'CurrentUser'.
      Type 'undefined' is not assignable to type 'CurrentUser'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '(() => void) | undefined' is not assignable to type '() => void'.
              Type 'undefined' is not assignable to type '() => void'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
                    Type '((profile: UserProfile) => void) | undefined' is not assignable to type '(profile: CurrentUser) => void'.
                      Type 'undefined' is not assignable to type '(profile: CurrentUser) => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(114,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'SecurityManager | undefined' is not assignable to type 'SecurityManager'.
      Type 'undefined' is not assignable to type 'SecurityManager'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '(() => void) | undefined' is not assignable to type '() => void'.
              Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(115,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'SecurityManager | undefined' is not assignable to type 'SecurityManager'.
      Type 'undefined' is not assignable to type 'SecurityManager'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '(() => void) | undefined' is not assignable to type '() => void'.
              Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(116,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'SecurityManager | undefined' is not assignable to type 'SecurityManager'.
      Type 'undefined' is not assignable to type 'SecurityManager'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '(() => void) | undefined' is not assignable to type '() => void'.
              Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(121,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '(() => void) | undefined' is not assignable to type '() => void'.
      Type 'undefined' is not assignable to type '() => void'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '((event: ChangeEvent<HTMLInputElement>) => void) | undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
              Type 'undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(122,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '(() => void) | undefined' is not assignable to type '() => void'.
      Type 'undefined' is not assignable to type '() => void'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '((event: ChangeEvent<HTMLInputElement>) => void) | undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
              Type 'undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(123,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '(() => void) | undefined' is not assignable to type '() => void'.
      Type 'undefined' is not assignable to type '() => void'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '((event: ChangeEvent<HTMLInputElement>) => void) | undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
              Type 'undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(124,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '(() => void) | undefined' is not assignable to type '() => void'.
      Type 'undefined' is not assignable to type '() => void'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '((event: ChangeEvent<HTMLInputElement>) => void) | undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
              Type 'undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
src/hooks/sharing/useQRCodeProcessing.ts(42,46): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/sharing/useShareCodeValidation.ts(19,36): error TS7006: Parameter 'code' implicitly has an 'any' type.
src/hooks/sharing/useShareCodeValidation.ts(39,11): error TS2353: Object literal may only specify known properties, and 'createdBy' does not exist in type '(prevState: null) => null'.
src/hooks/sync/useFirebaseSync.ts(2,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/sync/useFirebaseSync.ts(57,18): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/hooks/sync/useFirebaseSync.ts(57,30): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/hooks/sync/useManualSync.ts(92,39): error TS2339: Property 'counts' does not exist on type '{ success: boolean; reason: string; direction?: undefined; error?: undefined; } | { success: boolean; direction: string; reason?: undefined; error?: undefined; } | { success: boolean; error: string; reason?: undefined; direction?: undefined; }'.
  Property 'counts' does not exist on type '{ success: boolean; reason: string; direction?: undefined; error?: undefined; }'.
src/hooks/sync/useManualSync.ts(97,30): error TS2339: Property 'counts' does not exist on type '{ success: boolean; reason: string; direction?: undefined; error?: undefined; } | { success: boolean; direction: string; reason?: undefined; error?: undefined; } | { success: boolean; error: string; reason?: undefined; direction?: undefined; }'.
  Property 'counts' does not exist on type '{ success: boolean; reason: string; direction?: undefined; error?: undefined; }'.
src/hooks/sync/useManualSync.ts(133,41): error TS2339: Property 'counts' does not exist on type '{ success: boolean; reason: string; direction?: undefined; error?: undefined; } | { success: boolean; direction: string; reason?: undefined; error?: undefined; } | { success: boolean; error: string; reason?: undefined; direction?: undefined; }'.
  Property 'counts' does not exist on type '{ success: boolean; reason: string; direction?: undefined; error?: undefined; }'.
src/hooks/sync/useManualSync.ts(149,30): error TS2339: Property 'counts' does not exist on type '{ success: boolean; reason: string; direction?: undefined; error?: undefined; } | { success: boolean; direction: string; reason?: undefined; error?: undefined; } | { success: boolean; error: string; reason?: undefined; direction?: undefined; }'.
  Property 'counts' does not exist on type '{ success: boolean; reason: string; direction?: undefined; error?: undefined; }'.
src/hooks/sync/useManualSync.ts(180,30): error TS2339: Property 'counts' does not exist on type '{ success: boolean; reason: string; direction?: undefined; error?: undefined; } | { success: boolean; direction: string; reason?: undefined; error?: undefined; } | { success: boolean; error: string; reason?: undefined; direction?: undefined; }'.
  Property 'counts' does not exist on type '{ success: boolean; reason: string; direction?: undefined; error?: undefined; }'.
src/hooks/sync/useSyncHealthIndicator.ts(200,5): error TS2322: Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'RefObject<HTMLDivElement>'.
  Type 'HTMLDivElement | null' is not assignable to type 'HTMLDivElement'.
    Type 'null' is not assignable to type 'HTMLDivElement'.
src/hooks/transactions/helpers/transactionQueryHelpers.ts(50,12): error TS18046: 'bVal' is of type 'unknown'.
src/hooks/transactions/helpers/transactionQueryHelpers.ts(50,19): error TS18046: 'aVal' is of type 'unknown'.
src/hooks/transactions/helpers/transactionQueryHelpers.ts(50,30): error TS18046: 'bVal' is of type 'unknown'.
src/hooks/transactions/helpers/transactionQueryHelpers.ts(50,37): error TS18046: 'aVal' is of type 'unknown'.
src/hooks/transactions/helpers/transactionQueryHelpers.ts(52,10): error TS18046: 'aVal' is of type 'unknown'.
src/hooks/transactions/helpers/transactionQueryHelpers.ts(52,17): error TS18046: 'bVal' is of type 'unknown'.
src/hooks/transactions/helpers/transactionQueryHelpers.ts(52,28): error TS18046: 'aVal' is of type 'unknown'.
src/hooks/transactions/helpers/transactionQueryHelpers.ts(52,35): error TS18046: 'bVal' is of type 'unknown'.
src/hooks/transactions/useTransactionData.ts(120,54): error TS2345: Argument of type 'Logger' is not assignable to parameter of type 'Logger'.
  Types of property 'debug' are incompatible.
    Type '(message: string, data?: Record<string, unknown>) => void' is not assignable to type '(msg: string, data?: unknown) => void'.
      Types of parameters 'data' and 'data' are incompatible.
        Type 'unknown' is not assignable to type 'Record<string, unknown> | undefined'.
src/hooks/transactions/useTransactionData.ts(123,5): error TS2769: No overload matches this call.
  Overload 1 of 3, '(options: DefinedInitialDataOptions<unknown, Error, unknown, (string | FilterParams)[]>, queryClient?: QueryClient | undefined): DefinedUseQueryResult<...>', gave the following error.
    Type 'number | null' is not assignable to type 'number | false | ((query: Query<unknown, Error, unknown, (string | FilterParams)[]>) => number | false | undefined) | undefined'.
      Type 'null' is not assignable to type 'number | false | ((query: Query<unknown, Error, unknown, (string | FilterParams)[]>) => number | false | undefined) | undefined'.
  Overload 2 of 3, '(options: UndefinedInitialDataOptions<Transaction[], Error, Transaction[], (string | FilterParams)[]>, queryClient?: QueryClient | undefined): UseQueryResult<...>', gave the following error.
    Type 'number | null' is not assignable to type 'number | false | ((query: Query<Transaction[], Error, Transaction[], (string | FilterParams)[]>) => number | false | undefined) | undefined'.
      Type 'null' is not assignable to type 'number | false | ((query: Query<Transaction[], Error, Transaction[], (string | FilterParams)[]>) => number | false | undefined) | undefined'.
  Overload 3 of 3, '(options: UseQueryOptions<Transaction[], Error, Transaction[], (string | FilterParams)[]>, queryClient?: QueryClient | undefined): UseQueryResult<...>', gave the following error.
    Type 'number | null' is not assignable to type 'number | false | ((query: Query<Transaction[], Error, Transaction[], (string | FilterParams)[]>) => number | false | undefined) | undefined'.
      Type 'null' is not assignable to type 'number | false | ((query: Query<Transaction[], Error, Transaction[], (string | FilterParams)[]>) => number | false | undefined) | undefined'.
src/hooks/transactions/useTransactionData.ts(144,45): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(150,7): error TS2740: Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(234,85): error TS2339: Property 'length' does not exist on type '{}'.
src/hooks/transactions/useTransactionFileUpload.ts(27,18): error TS18047: 'event.target.files' is possibly 'null'.
src/hooks/transactions/useTransactionFileUpload.ts(59,56): error TS18046: 'error' is of type 'unknown'.
src/hooks/transactions/useTransactionForm.ts(21,25): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/hooks/transactions/useTransactionForm.ts(34,30): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
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
src/hooks/transactions/useTransactionLedger.ts(80,5): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction'.
    Types of property 'date' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/transactions/useTransactionLedger.ts(104,5): error TS2345: Argument of type 'UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>' is not assignable to parameter of type 'AddTransactionFn'.
  Types of parameters 'variables' and 'transaction' are incompatible.
    Type 'unknown' is not assignable to type 'TransactionInput'.
src/hooks/transactions/useTransactionLedger.ts(158,44): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/transactions/useTransactionLedger.ts(204,39): error TS2345: Argument of type 'Transaction' is not assignable to parameter of type 'SetStateAction<null>'.
  Type 'Transaction' provides no match for the signature '(prevState: null): null'.
src/hooks/transactions/useTransactionQuery.ts(3,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/transactions/useTransactionQuery.ts(45,5): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitter.ts(117,7): error TS2345: Argument of type 'Transaction | undefined' is not assignable to parameter of type 'Transaction'.
  Type 'undefined' is not assignable to type 'Transaction'.
src/hooks/transactions/useTransactionSplitter.ts(153,24): error TS2345: Argument of type 'Transaction | undefined' is not assignable to parameter of type 'Transaction'.
  Type 'undefined' is not assignable to type 'Transaction'.
src/hooks/transactions/useTransactionSplitter.ts(160,29): error TS2345: Argument of type 'Transaction | undefined' is not assignable to parameter of type 'Transaction'.
  Type 'undefined' is not assignable to type 'Transaction'.
src/hooks/transactions/useTransactionSplitter.ts(167,49): error TS2345: Argument of type 'Transaction | undefined' is not assignable to parameter of type 'Transaction'.
  Type 'undefined' is not assignable to type 'Transaction'.
src/hooks/transactions/useTransactionSplitter.ts(178,9): error TS2322: Type 'Transaction | undefined' is not assignable to type 'Transaction'.
  Type 'undefined' is not assignable to type 'Transaction'.
src/hooks/transactions/useTransactionTable.ts(24,30): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/hooks/transactions/useTransactionTable.ts(32,31): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/hooks/transactions/useTransactionsV2.ts(7,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/transactions/useTransactionsV2.ts(56,23): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/transactions/useTransactionsV2.ts(89,41): error TS2339: Property 'length' does not exist on type '{}'.
src/services/activityLogger.ts(126,68): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/browserInfoService.ts(117,52): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/browserInfoService.ts(160,50): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/browserInfoService.ts(184,53): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/browserInfoService.ts(218,48): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/contextAnalysisService.ts(123,11): error TS2352: Conversion of type '{ modals: never[]; forms: never[]; buttons: never[]; inputs: never[]; }' to type 'UIState' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ modals: never[]; forms: never[]; buttons: never[]; inputs: never[]; }' is missing the following properties from type 'UIState': drawers, tabs, loading, interactions
src/services/bugReport/contextAnalysisService.ts(260,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/bugReport/contextAnalysisService.ts(260,29): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/bugReport/errorTrackingService.ts(106,26): error TS2322: Type '(event: ErrorEvent) => void' is not assignable to type '{ handleEvent: (event: Event) => void; } | ((event: Event) => void)'.
  Type '(event: ErrorEvent) => void' is not assignable to type '(event: Event) => void'.
    Types of parameters 'event' and 'event' are incompatible.
      Type 'Event' is missing the following properties from type 'ErrorEvent': colno, error, filename, lineno, message
src/services/bugReport/errorTrackingService.ts(217,53): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/index.ts(107,9): error TS2783: 'success' is specified more than once, so this usage will be overwritten.
src/services/bugReport/index.ts(120,47): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Error'.
src/services/bugReport/index.ts(431,16): error TS18046: 'error' is of type 'unknown'.
src/services/bugReport/index.ts(457,16): error TS18046: 'error' is of type 'unknown'.
src/services/bugReport/index.ts(482,16): error TS18046: 'error' is of type 'unknown'.
src/services/bugReport/index.ts(513,16): error TS18046: 'error' is of type 'unknown'.
src/services/bugReport/pageDetectionService.ts(50,27): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ "/app": string; "/app/dashboard": string; "/app/envelopes": string; "/app/savings": string; "/app/supplemental": string; "/app/paycheck": string; "/app/bills": string; "/app/transactions": string; "/app/debts": string; "/app/analytics": string; "/app/automation": string; "/app/activity": string; }'.
  No index signature with a parameter of type 'string' was found on type '{ "/app": string; "/app/dashboard": string; "/app/envelopes": string; "/app/savings": string; "/app/supplemental": string; "/app/paycheck": string; "/app/bills": string; "/app/transactions": string; "/app/debts": string; "/app/analytics": string; "/app/automation": string; "/app/activity": string; }'.
src/services/bugReport/pageDetectionService.ts(73,50): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/pageDetectionService.ts(104,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/pageDetectionService.ts(147,13): error TS7034: Variable 'breadcrumbs' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/services/bugReport/pageDetectionService.ts(168,14): error TS7005: Variable 'breadcrumbs' implicitly has an 'any[]' type.
src/services/chunkedSyncService.ts(278,7): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/chunkedSyncService.ts(431,29): error TS2769: No overload matches this call.
  Overload 1 of 3, '(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'string | null' is not assignable to parameter of type 'string'.
      Type 'null' is not assignable to type 'string'.
  Overload 2 of 3, '(reference: CollectionReference<unknown, DocumentData>, path?: string | undefined, ...pathSegments: string[]): DocumentReference<unknown, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'CollectionReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'CollectionReference<unknown, DocumentData>': id, path, parent, withConverter, and 2 more.
  Overload 3 of 3, '(reference: DocumentReference<unknown, DocumentData>, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'DocumentReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'DocumentReference<unknown, DocumentData>': converter, firestore, id, path, and 2 more.
src/services/chunkedSyncService.ts(547,24): error TS2769: No overload matches this call.
  Overload 1 of 3, '(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'string | null' is not assignable to parameter of type 'string'.
      Type 'null' is not assignable to type 'string'.
  Overload 2 of 3, '(reference: CollectionReference<unknown, DocumentData>, path?: string | undefined, ...pathSegments: string[]): DocumentReference<unknown, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'CollectionReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'CollectionReference<unknown, DocumentData>': id, path, parent, withConverter, and 2 more.
  Overload 3 of 3, '(reference: DocumentReference<unknown, DocumentData>, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'DocumentReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'DocumentReference<unknown, DocumentData>': converter, firestore, id, path, and 2 more.
src/services/chunkedSyncService.ts(590,13): error TS2322: Type 'unknown' is not assignable to type 'ManifestType'.
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
src/services/keys/keyManagementService.ts(111,58): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/keys/keyManagementService.ts(345,26): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type 'number[] | undefined' is not assignable to parameter of type 'ArrayBuffer | ArrayLike<number>'.
      Type 'undefined' is not assignable to type 'ArrayBuffer | ArrayLike<number>'.
src/services/keys/keyManagementService.ts(359,34): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type 'number[] | undefined' is not assignable to parameter of type 'ArrayBuffer | ArrayLike<number>'.
      Type 'undefined' is not assignable to type 'ArrayBuffer | ArrayLike<number>'.
src/services/keys/keyManagementService.ts(360,35): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type 'number[] | undefined' is not assignable to parameter of type 'ArrayBuffer | ArrayLike<number>'.
      Type 'undefined' is not assignable to type 'ArrayBuffer | ArrayLike<number>'.
src/services/security/securityService.ts(73,72): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/security/securityService.ts(97,54): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/security/securityService.ts(190,78): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/security/securityService.ts(296,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/security/securityService.ts(296,37): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/typedChunkedSyncService.ts(275,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/stores/ui/fabStore.ts(216,14): error TS7022: 'useFABStore' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.
src/stores/ui/fabStore.ts(249,11): error TS7023: 'getDebugInfo' implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.
src/stores/ui/fabStore.ts(251,19): error TS7022: 'state' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.
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
src/utils/analytics/transactionAnalyzer.ts(58,40): error TS18048: 'minTransactionCount' is possibly 'undefined'.
src/utils/analytics/transactionAnalyzer.ts(58,86): error TS18048: 'minAmount' is possibly 'undefined'.
src/utils/analytics/transactionAnalyzer.ts(107,47): error TS18048: 'unusedCategoryThreshold' is possibly 'undefined'.
src/utils/auth/shareCodeManager.ts(30,20): error TS7006: Parameter 'shareCode' implicitly has an 'any' type.
src/utils/auth/shareCodeManager.ts(44,20): error TS7006: Parameter 'shareCode' implicitly has an 'any' type.
src/utils/auth/shareCodeManager.ts(54,18): error TS7006: Parameter 'shareCode' implicitly has an 'any' type.
src/utils/billIcons/iconOptions.ts(179,10): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ utilities: BillIconOption[]; housing: BillIconOption[]; transportation: BillIconOption[]; insurance: BillIconOption[]; ... 6 more ...; business: BillIconOption[]; }'.
  No index signature with a parameter of type 'string' was found on type '{ utilities: BillIconOption[]; housing: BillIconOption[]; transportation: BillIconOption[]; insurance: BillIconOption[]; ... 6 more ...; business: BillIconOption[]; }'.
src/utils/bills/billCalculations.ts(131,57): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/bills/billCalculations.ts(166,49): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/bills/billCalculations.ts(192,46): error TS2345: Argument of type 'string | Date | undefined' is not assignable to parameter of type 'string | Date'.
  Type 'undefined' is not assignable to type 'string | Date'.
src/utils/bills/billCalculations.ts(201,5): error TS2322: Type 'number | null' is not assignable to type 'number | undefined'.
  Type 'null' is not assignable to type 'number | undefined'.
src/utils/bills/billUpdateHelpers.ts(106,71): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/bills/billUpdateHelpers.ts(107,5): error TS2722: Cannot invoke an object which is possibly 'undefined'.
src/utils/budgeting/autofunding/conditions.ts(237,31): error TS18048: 'rule.config' is possibly 'undefined'.
src/utils/budgeting/autofunding/conditions.ts(237,31): error TS2345: Argument of type 'Condition[] | undefined' is not assignable to parameter of type 'Condition[]'.
  Type 'undefined' is not assignable to type 'Condition[]'.
src/utils/budgeting/autofunding/conditions.ts(377,34): error TS2769: No overload matches this call.
  Overload 1 of 4, '(value: string | number | Date): Date', gave the following error.
    Argument of type 'string | null | undefined' is not assignable to parameter of type 'string | number | Date'.
      Type 'undefined' is not assignable to type 'string | number | Date'.
  Overload 2 of 4, '(value: string | number): Date', gave the following error.
    Argument of type 'string | null | undefined' is not assignable to parameter of type 'string | number'.
      Type 'undefined' is not assignable to type 'string | number'.
src/utils/budgeting/autofunding/conditions.ts(378,32): error TS2769: No overload matches this call.
  Overload 1 of 4, '(value: string | number | Date): Date', gave the following error.
    Argument of type 'string | null | undefined' is not assignable to parameter of type 'string | number | Date'.
      Type 'undefined' is not assignable to type 'string | number | Date'.
  Overload 2 of 4, '(value: string | number): Date', gave the following error.
    Argument of type 'string | null | undefined' is not assignable to parameter of type 'string | number'.
      Type 'undefined' is not assignable to type 'string | number'.
src/utils/budgeting/autofunding/conditions.ts(390,34): error TS2538: Type 'undefined' cannot be used as an index type.
src/utils/budgeting/autofunding/simulation.ts(58,25): error TS2345: Argument of type 'AutoFundingRule' is not assignable to parameter of type 'Rule'.
  Types of property 'lastExecuted' are incompatible.
    Type 'string | null' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/utils/budgeting/autofunding/simulation.ts(267,16): error TS18047: 'simulation.simulation' is possibly 'null'.
src/utils/budgeting/autofunding/simulation.ts(268,22): error TS18047: 'simulation.simulation' is possibly 'null'.
src/utils/budgeting/autofunding/simulation.ts(269,17): error TS18047: 'simulation.simulation' is possibly 'null'.
src/utils/budgeting/autofunding/simulation.ts(270,21): error TS18047: 'simulation.simulation' is possibly 'null'.
src/utils/budgeting/autofunding/simulation.ts(271,12): error TS18047: 'simulation.simulation' is possibly 'null'.
src/utils/budgeting/autofunding/simulation.ts(272,16): error TS18047: 'simulation.simulation' is possibly 'null'.
src/utils/budgeting/autofunding/simulation.ts(273,13): error TS18047: 'simulation.simulation' is possibly 'null'.
src/utils/budgeting/autofunding/simulation.ts(274,36): error TS2345: Argument of type '{ totalPlanned: number; rulesExecuted: number; plannedTransfers: { fromEnvelopeId: string; toEnvelopeId: string; amount: number; description: string; ruleId: string; ruleName: string; }[]; ruleResults: { ...; }[]; remainingCash: number; errors: { ...; }[]; } | null' is not assignable to parameter of type '{ errors: { error: string; }[]; rulesExecuted: number; remainingCash: number; }'.
  Type 'null' is not assignable to type '{ errors: { error: string; }[]; rulesExecuted: number; remainingCash: number; }'.
src/utils/budgeting/envelopeCalculations.ts(110,63): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/utils/budgeting/envelopeCalculations.ts(521,24): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Record<FrequencyType, number>'.
  No index signature with a parameter of type 'string' was found on type 'Record<FrequencyType, number>'.
src/utils/budgeting/envelopeFormUtils.ts(133,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string | number' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(186,22): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Record<EnvelopeType, EnvelopeTypeConfig>'.
  No index signature with a parameter of type 'string' was found on type 'Record<EnvelopeType, EnvelopeTypeConfig>'.
src/utils/budgeting/envelopeFormUtils.ts(440,22): error TS18048: 'envelope.monthlyAmount' is possibly 'undefined'.
src/utils/budgeting/envelopeFormUtils.ts(441,51): error TS18048: 'envelope.monthlyAmount' is possibly 'undefined'.
src/utils/budgeting/envelopeFormUtils.ts(489,9): error TS7034: Variable 'warnings' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/utils/budgeting/envelopeFormUtils.ts(490,9): error TS7034: Variable 'errors' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/utils/budgeting/envelopeFormUtils.ts(492,42): error TS7005: Variable 'warnings' implicitly has an 'any[]' type.
src/utils/budgeting/envelopeFormUtils.ts(492,52): error TS7005: Variable 'errors' implicitly has an 'any[]' type.
src/utils/budgeting/envelopeFormUtils.ts(499,9): error TS18048: 'envelope.targetAmount' is possibly 'undefined'.
src/utils/budgeting/envelopeIntegrityChecker.ts(78,48): error TS7006: Parameter 'envelopeIds' implicitly has an 'any' type.
src/utils/budgeting/envelopeIntegrityChecker.ts(119,14): error TS18046: 'error' is of type 'unknown'.
src/utils/budgeting/envelopeIntegrityChecker.ts(130,48): error TS7006: Parameter 'corruptedEnvelopes' implicitly has an 'any' type.
src/utils/budgeting/envelopeIntegrityChecker.ts(216,14): error TS18046: 'error' is of type 'unknown'.
src/utils/budgeting/envelopeIntegrityChecker.ts(277,14): error TS18046: 'error' is of type 'unknown'.
src/utils/budgeting/paycheckDeletion.ts(34,26): error TS18048: 'envelope.currentBalance' is possibly 'undefined'.
src/utils/budgeting/paycheckProcessing.ts(35,5): error TS2769: No overload matches this call.
  Overload 1 of 3, '(callbackfn: (previousValue: { currentBalance?: string | number | undefined; }, currentValue: { currentBalance?: string | number | undefined; }, currentIndex: number, array: { currentBalance?: string | ... 1 more ... | undefined; }[]) => { ...; }, initialValue: { ...; }): { ...; }', gave the following error.
    Argument of type '(sum: number, env: { currentBalance: string | number; }) => number' is not assignable to parameter of type '(previousValue: { currentBalance?: string | number | undefined; }, currentValue: { currentBalance?: string | number | undefined; }, currentIndex: number, array: { currentBalance?: string | number | undefined; }[]) => { ...; }'.
      Types of parameters 'sum' and 'previousValue' are incompatible.
        Type '{ currentBalance?: string | number | undefined; }' is not assignable to type 'number'.
  Overload 2 of 3, '(callbackfn: (previousValue: number, currentValue: { currentBalance?: string | number | undefined; }, currentIndex: number, array: { currentBalance?: string | number | undefined; }[]) => number, initialValue: number): number', gave the following error.
    Argument of type '(sum: number, env: { currentBalance: string | number; }) => number' is not assignable to parameter of type '(previousValue: number, currentValue: { currentBalance?: string | number | undefined; }, currentIndex: number, array: { currentBalance?: string | number | undefined; }[]) => number'.
      Types of parameters 'env' and 'currentValue' are incompatible.
        Type '{ currentBalance?: string | number | undefined; }' is not assignable to type '{ currentBalance: string | number; }'.
          Types of property 'currentBalance' are incompatible.
            Type 'string | number | undefined' is not assignable to type 'string | number'.
              Type 'undefined' is not assignable to type 'string | number'.
src/utils/budgeting/paycheckProcessing.ts(40,5): error TS2769: No overload matches this call.
  Overload 1 of 3, '(callbackfn: (previousValue: { currentBalance?: string | number | undefined; }, currentValue: { currentBalance?: string | number | undefined; }, currentIndex: number, array: { currentBalance?: string | ... 1 more ... | undefined; }[]) => { ...; }, initialValue: { ...; }): { ...; }', gave the following error.
    Argument of type '(sum: number, saving: { currentBalance: string | number; }) => number' is not assignable to parameter of type '(previousValue: { currentBalance?: string | number | undefined; }, currentValue: { currentBalance?: string | number | undefined; }, currentIndex: number, array: { currentBalance?: string | number | undefined; }[]) => { ...; }'.
      Types of parameters 'sum' and 'previousValue' are incompatible.
        Type '{ currentBalance?: string | number | undefined; }' is not assignable to type 'number'.
  Overload 2 of 3, '(callbackfn: (previousValue: number, currentValue: { currentBalance?: string | number | undefined; }, currentIndex: number, array: { currentBalance?: string | number | undefined; }[]) => number, initialValue: number): number', gave the following error.
    Argument of type '(sum: number, saving: { currentBalance: string | number; }) => number' is not assignable to parameter of type '(previousValue: number, currentValue: { currentBalance?: string | number | undefined; }, currentIndex: number, array: { currentBalance?: string | number | undefined; }[]) => number'.
      Types of parameters 'saving' and 'currentValue' are incompatible.
        Type '{ currentBalance?: string | number | undefined; }' is not assignable to type '{ currentBalance: string | number; }'.
          Types of property 'currentBalance' are incompatible.
            Type 'string | number | undefined' is not assignable to type 'string | number'.
              Type 'undefined' is not assignable to type 'string | number'.
src/utils/budgeting/paycheckProcessing.ts(44,33): error TS2365: Operator '+' cannot be applied to types '{ currentBalance?: string | number | undefined; }' and '{ currentBalance?: string | number | undefined; }'.
src/utils/common/budgetHistoryTracker.ts(109,41): error TS2345: Argument of type '{ hash: string; timestamp: number; message: string; author: string; parentHash: string | null; snapshotData: string; deviceFingerprint: string; }' is not assignable to parameter of type 'BudgetCommit'.
  Types of property 'parentHash' are incompatible.
    Type 'string | null' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/utils/common/fixAutoAllocateUndefined.ts(66,37): error TS18046: 'error' is of type 'unknown'.
src/utils/common/highlight.ts(285,73): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/lazyImport.ts(4,21): error TS7006: Parameter 'factory' implicitly has an 'any' type.
src/utils/common/lazyImport.ts(6,21): error TS7006: Parameter 'module' implicitly has an 'any' type.
src/utils/common/ocrProcessor.ts(349,43): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/testBudgetHistory.ts(47,39): error TS2345: Argument of type '{ hash: string; timestamp: number; message: string; author: string; parentHash: null; encryptedSnapshot: string; deviceFingerprint: string; }' is not assignable to parameter of type 'BudgetCommit'.
  Types of property 'parentHash' are incompatible.
    Type 'null' is not assignable to type 'string | undefined'.
src/utils/common/toastHelpers.ts(117,16): error TS7006: Parameter 'error' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(255,11): error TS2322: Type 'null' is not assignable to type 'number'.
src/utils/common/transactionArchiving.ts(423,9): error TS2322: Type 'null' is not assignable to type 'number'.
src/utils/dataManagement/backupUtils.ts(45,44): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/dataManagement/fileUtils.ts(3,33): error TS7006: Parameter 'file' implicitly has an 'any' type.
src/utils/dataManagement/fileUtils.ts(11,36): error TS18047: 'e.target' is possibly 'null'.
src/utils/dataManagement/firebaseUtils.ts(15,74): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/debts/calculations/interestCalculation.ts(12,42): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/utils/debts/calculations/interestCalculation.ts(12,48): error TS7006: Parameter 'paymentAmount' implicitly has an 'any' type.
src/utils/debts/calculations/nextPaymentDate.ts(13,42): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/utils/debts/calculations/nextPaymentDate.ts(13,48): error TS7006: Parameter 'relatedBill' implicitly has an 'any' type.
src/utils/debts/calculations/payoffProjection.ts(11,43): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/utils/pageDetection/pageIdentifier.ts(37,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/pwa/patchNotesManager.ts(89,24): error TS18048: 'match.index' is possibly 'undefined'.
src/utils/pwa/pwaManager.ts(71,7): error TS2322: Type 'ServiceWorkerRegistration | undefined' is not assignable to type 'ServiceWorkerRegistration | null'.
  Type 'undefined' is not assignable to type 'ServiceWorkerRegistration | null'.
src/utils/pwa/pwaManager.ts(88,11): error TS2531: Object is possibly 'null'.
src/utils/pwa/pwaManager.ts(118,11): error TS2531: Object is possibly 'null'.
src/utils/pwa/pwaManager.ts(259,38): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
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
src/utils/sync/SyncMutex.ts(71,15): error TS2339: Property 'resolve' does not exist on type '{ resolve: () => void; operationName: string; } | undefined'.
src/utils/sync/SyncMutex.ts(80,18): error TS7006: Parameter 'duration' implicitly has an 'any' type.
src/utils/sync/SyncQueue.ts(79,39): error TS2345: Argument of type 'QueueItem<T>' is not assignable to parameter of type 'QueueItem<unknown>'.
  Types of property 'operation' are incompatible.
    Type '(data: T) => Promise<unknown>' is not assignable to type '(data: unknown) => Promise<unknown>'.
      Types of parameters 'data' and 'data' are incompatible.
        Type 'unknown' is not assignable to type 'T'.
          'T' could be instantiated with an arbitrary type which could be unrelated to 'unknown'.
src/utils/sync/corruptionRecoveryHelper.ts(52,5): error TS2717: Subsequent property declarations must have the same type.  Property 'detectLocalDataDebug' must be of type '() => Promise<DataDetectionResult>', but here has type '() => Promise<DataDetectionResult>'.
src/utils/sync/dataDetectionHelper.ts(118,48): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/masterSyncValidator.ts(517,16): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/masterSyncValidator.ts(536,16): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/masterSyncValidator.ts(568,14): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/resilience/index.ts(52,19): error TS7006: Parameter 'operation' implicitly has an 'any' type.
src/utils/testing/storeTestUtils.ts(58,13): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'unknown'.
  No index signature with a parameter of type 'string' was found on type 'unknown'.
src/utils/testing/storeTestUtils.ts(72,16): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'unknown'.
  No index signature with a parameter of type 'string' was found on type 'unknown'.
src/utils/transactions/operations.ts(61,39): error TS18046: 'error' is of type 'unknown'.
```

