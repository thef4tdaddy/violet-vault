# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 28 | -2 |
| TypeScript Errors | 333 | 0 |
| TypeScript Strict Mode Errors | 1229 | 0 |

*Last updated: 2025-11-24 02:53:09 UTC*

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
- 5 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/usePaycheckProcessor.ts`
- 2 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/mobile/useFABBehavior.ts`
- 2 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/useEnvelopeForm.ts`
- 2 issues in `/home/runner/work/violet-vault/violet-vault/src/components/debt/ui/QuickPaymentForm.tsx`
- 2 issues in `/home/runner/work/violet-vault/violet-vault/src/components/bills/BillManager.tsx`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/utils/savings/savingsCalculations.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/stores/ui/uiStore.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/debts/useDebtDetailModal.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/debts/useDebtDashboard.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/usePaycheckForm.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/accounts/useSupplementalAccounts.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/transactions/import/ImportModal.tsx`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/transactions/import/FieldMapper.tsx`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/sync/health/SyncHealthDetails.tsx`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/sharing/ShareCodeModal.tsx`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/settings/SettingsDashboard.tsx`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/budgeting/shared/BillConnectionSelector.tsx`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/bills/modals/BillDetailModal.tsx`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/bills/BulkBillUpdateModal.tsx`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 17 | `no-undef` |
| 5 | `max-lines-per-function` |
| 2 | `complexity` |
| 2 | `@typescript-eslint/no-unused-vars` |
| 1 | `null` |
| 1 | `@typescript-eslint/no-explicit-any` |

### Detailed Lint Report
```
/home/runner/work/violet-vault/violet-vault/src/components/bills/BillManager.tsx:43:27 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/components/bills/BillManager.tsx:52:20 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/components/bills/BulkBillUpdateModal.tsx:23:28 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/components/bills/modals/BillDetailModal.tsx:1:17 - 1 - 'FormEvent' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
/home/runner/work/violet-vault/violet-vault/src/components/budgeting/shared/BillConnectionSelector.tsx:15:11 - 1 - 'Envelope' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
/home/runner/work/violet-vault/violet-vault/src/components/debt/ui/QuickPaymentForm.tsx:7:17 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/components/debt/ui/QuickPaymentForm.tsx:17:25 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/components/settings/SettingsDashboard.tsx:27:27 - 1 - Arrow function has too many lines (164). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/components/sharing/ShareCodeModal.tsx:29:23 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/components/sync/health/SyncHealthDetails.tsx:47:26 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/components/transactions/import/FieldMapper.tsx:27:20 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/components/transactions/import/ImportModal.tsx:25:20 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/hooks/accounts/useSupplementalAccounts.ts:41:33 - 1 - Arrow function has too many lines (152). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts:30:34 - 1 - Arrow function has too many lines (159). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/useEnvelopeForm.ts:102:5 - 1 - Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any'). (null)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/useEnvelopeForm.ts:105:28 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/usePaycheckForm.ts:16:18 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/usePaycheckProcessor.ts:47:14 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/usePaycheckProcessor.ts:47:29 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/usePaycheckProcessor.ts:70:14 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/usePaycheckProcessor.ts:70:29 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/usePaycheckProcessor.ts:86:30 - 1 - Arrow function has too many lines (152). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/hooks/debts/useDebtDashboard.ts:7:33 - 1 - Arrow function has too many lines (151). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/hooks/debts/useDebtDetailModal.ts:122:35 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/hooks/mobile/useFABBehavior.ts:10:26 - 1 - 'NodeJS' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/hooks/mobile/useFABBehavior.ts:46:17 - 1 - 'React' is not defined. (no-undef)
/home/runner/work/violet-vault/violet-vault/src/stores/ui/uiStore.ts:13:79 - 1 - Arrow function has a complexity of 23. Maximum allowed is 15. (complexity)
/home/runner/work/violet-vault/violet-vault/src/utils/savings/savingsCalculations.ts:238:93 - 1 - Arrow function has a complexity of 16. Maximum allowed is 15. (complexity)
```

## Typecheck Audit

### Files with Most Type Errors
- 12 errors in `src/stores/ui/uiStore.ts`
- 12 errors in `src/main.tsx`
- 12 errors in `src/components/pwa/UpdateAvailableModal.tsx`
- 10 errors in `src/components/budgeting/EnvelopeGrid.tsx`
- 8 errors in `src/components/layout/ViewRenderer.tsx`
- 8 errors in `src/components/bills/modals/BillDetailModal.tsx`
- 8 errors in `src/components/bills/BillManagerModals.tsx`
- 7 errors in `src/components/layout/MainLayout.tsx`
- 7 errors in `src/components/accounts/SupplementalAccounts.tsx`
- 6 errors in `src/hooks/debts/useDebtManagement.ts`
- 6 errors in `src/hooks/budgeting/usePaycheckForm.ts`
- 6 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution.ts`
- 6 errors in `src/components/modals/QuickFundModal.tsx`
- 5 errors in `src/utils/layout/paycheckDeletionUtils.ts`
- 5 errors in `src/hooks/transactions/useTransactionLedger.ts`
- 5 errors in `src/hooks/transactions/useTransactionFilters.ts`
- 5 errors in `src/hooks/sync/useFirebaseSync.ts`
- 5 errors in `src/hooks/debts/useDebts.ts`
- 5 errors in `src/hooks/budgeting/useSmartSuggestions.ts`
- 5 errors in `src/hooks/accounts/useSupplementalAccounts.ts`
- 5 errors in `src/components/transactions/TransactionLedger.tsx`
- 5 errors in `src/components/settings/sections/SyncDebugToolsSection.tsx`
- 5 errors in `src/components/savings/SavingsGoals.tsx`
- 5 errors in `src/components/pwa/PatchNotesModal.tsx`
- 5 errors in `src/components/debt/DebtDashboard.tsx`
- 5 errors in `src/components/budgeting/EditEnvelopeModal.tsx`
- 5 errors in `src/App.tsx`
- 4 errors in `src/hooks/receipts/useReceiptToTransaction.ts`
- 4 errors in `src/hooks/notifications/useFirebaseMessaging.ts`
- 4 errors in `src/hooks/common/useNetworkStatus.ts`
- 4 errors in `src/hooks/common/useActualBalance.ts`
- 4 errors in `src/hooks/budgeting/useEnvelopeEdit.ts`
- 4 errors in `src/hooks/bills/useBillManager.ts`
- 4 errors in `src/components/transactions/TransactionSplitter.tsx`
- 4 errors in `src/components/debt/modals/DebtDetailModal.tsx`
- 4 errors in `src/components/debt/DebtStrategies.tsx`
- 4 errors in `src/components/budgeting/SmartEnvelopeSuggestions.tsx`
- 4 errors in `src/components/budgeting/CreateEnvelopeModal.tsx`
- 3 errors in `src/utils/sync/corruptionRecoveryHelper.ts`
- 3 errors in `src/utils/pwa/patchNotesManager.ts`
- 3 errors in `src/hooks/transactions/useTransactionsV2.ts`
- 3 errors in `src/hooks/transactions/useTransactionQuery.ts`
- 3 errors in `src/hooks/settings/useSettingsDashboard.ts`
- 3 errors in `src/hooks/layout/usePaycheckOperations.ts`
- 3 errors in `src/hooks/common/useImportData.ts`
- 3 errors in `src/hooks/bills/useBillManagerHelpers.ts`
- 3 errors in `src/hooks/analytics/useReportExporter.ts`
- 3 errors in `src/components/transactions/splitter/SplitAllocationsSection.tsx`
- 3 errors in `src/components/transactions/import/ImportModal.tsx`
- 3 errors in `src/components/history/BudgetHistoryViewer.tsx`
- 3 errors in `src/components/budgeting/suggestions/SuggestionsList.tsx`
- 3 errors in `src/components/budgeting/PaycheckProcessor.tsx`
- 3 errors in `src/components/automation/AutoFundingDashboard.tsx`
- 2 errors in `src/utils/sync/validation/checksumUtils.ts`
- 2 errors in `src/utils/debug/dataDiagnostic.ts`
- 2 errors in `src/services/chunkedSyncService.ts`
- 2 errors in `src/hooks/transactions/useTransactionImport.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useUndoOperations.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useAutoFunding.ts`
- 2 errors in `src/hooks/analytics/queries/usePaycheckTrendsQuery.ts`
- 2 errors in `src/components/transactions/components/TransactionRow.tsx`
- 2 errors in `src/components/sync/health/SyncHealthDetails.tsx`
- 2 errors in `src/components/settings/sections/GeneralSettingsSection.tsx`
- 2 errors in `src/components/settings/SettingsDashboard.tsx`
- 2 errors in `src/components/receipts/steps/ConfirmationStep.tsx`
- 2 errors in `src/components/receipts/ReceiptToTransactionModal.tsx`
- 2 errors in `src/components/modals/UnassignedCashModal.tsx`
- 2 errors in `src/components/bills/SmartBillMatcher.tsx`
- 2 errors in `src/components/bills/BulkUpdateEditor.tsx`
- 2 errors in `src/components/bills/BulkUpdateBillRow.tsx`
- 2 errors in `src/components/bills/BillManager.tsx`
- 2 errors in `src/components/automation/tabs/HistoryTab.tsx`
- 1 errors in `src/services/editLockService.ts`
- 1 errors in `src/services/authService.ts`
- 1 errors in `src/hooks/mobile/useFABBehavior.ts`
- 1 errors in `src/hooks/debts/useDebtDashboard.ts`
- 1 errors in `src/hooks/common/useTransactions.ts`
- 1 errors in `src/hooks/common/useDataInitialization.ts`
- 1 errors in `src/hooks/budgeting/useEnvelopes.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingHistory.ts`
- 1 errors in `src/hooks/auth/useAuthenticationManager.ts`
- 1 errors in `src/hooks/auth/mutations/useLoginMutations.ts`
- 1 errors in `src/hooks/auth/mutations/useJoinBudgetMutation.ts`
- 1 errors in `src/db/budgetDb.ts`
- 1 errors in `src/components/transactions/TransactionTable.tsx`
- 1 errors in `src/components/settings/sections/NotificationSettingsSection.tsx`
- 1 errors in `src/components/settings/SecuritySettings.tsx`
- 1 errors in `src/components/security/LockScreen.tsx`
- 1 errors in `src/components/receipts/components/ReceiptExtractedData.tsx`
- 1 errors in `src/components/pwa/OfflineStatusIndicator.tsx`
- 1 errors in `src/components/layout/SummaryCards.tsx`
- 1 errors in `src/components/budgeting/shared/BillConnectionSelector.tsx`
- 1 errors in `src/components/budgeting/envelope/UnassignedCashEnvelope.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeItem.tsx`
- 1 errors in `src/components/budgeting/CreateEnvelopeModalComponents.tsx`
- 1 errors in `src/components/bills/BulkUpdateBillRowComponents.tsx`
- 1 errors in `src/components/bills/BulkBillUpdateModal.tsx`
- 1 errors in `src/components/automation/steps/config/SplitRemainderConfig.tsx`
- 1 errors in `src/components/auth/UserSetup.tsx`
- 1 errors in `src/components/analytics/ReportExporter.tsx`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 103 | `TS2345` |
| 102 | `TS2322` |
| 80 | `TS2339` |
| 9 | `TS2739` |
| 9 | `TS2719` |
| 7 | `TS2352` |
| 4 | `TS2740` |
| 4 | `TS2717` |
| 4 | `TS2687` |
| 3 | `TS2741` |
| 2 | `TS2554` |
| 1 | `TS6196` |
| 1 | `TS6133` |
| 1 | `TS2769` |
| 1 | `TS2559` |
| 1 | `TS2538` |
| 1 | `TS2349` |

### Detailed Type Error Report
```
src/App.tsx(29,20): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/App.tsx(30,28): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/App.tsx(31,42): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/App.tsx(33,27): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/App.tsx(36,27): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/components/accounts/SupplementalAccounts.tsx(90,5): error TS2322: Type 'unknown' is not assignable to type '(account: Account) => void'.
  Type '{}' provides no match for the signature '(account: Account): void'.
src/components/accounts/SupplementalAccounts.tsx(91,5): error TS2322: Type 'unknown' is not assignable to type '(account: Account) => void'.
  Type '{}' provides no match for the signature '(account: Account): void'.
src/components/accounts/SupplementalAccounts.tsx(92,5): error TS2322: Type 'unknown' is not assignable to type '(accountId: string) => void'.
  Type '{}' provides no match for the signature '(accountId: string): void'.
src/components/accounts/SupplementalAccounts.tsx(93,5): error TS2322: Type 'unknown' is not assignable to type '(transfer: { accountId: string; envelopeId: string; amount: number; description: string; }) => void'.
  Type '{}' provides no match for the signature '(transfer: { accountId: string; envelopeId: string; amount: number; description: string; }): void'.
src/components/accounts/SupplementalAccounts.tsx(129,11): error TS2719: Type '(account: Account) => void' is not assignable to type '(account: Account) => void'. Two different types with this name exist, but they are unrelated.
  Types of parameters 'account' and 'account' are incompatible.
    Type 'Account' is not assignable to type 'Account'. Two different types with this name exist, but they are unrelated.
      Types of property 'id' are incompatible.
        Type 'string | number' is not assignable to type 'string'.
          Type 'number' is not assignable to type 'string'.
src/components/accounts/SupplementalAccounts.tsx(131,11): error TS2322: Type '(account: TransferringAccount) => void' is not assignable to type '(account: Account) => void'.
  Types of parameters 'account' and 'account' are incompatible.
    Type 'Account' is not assignable to type 'TransferringAccount'.
      Types of property 'id' are incompatible.
        Type 'string | number' is not assignable to type 'string'.
          Type 'number' is not assignable to type 'string'.
src/components/accounts/SupplementalAccounts.tsx(154,9): error TS2741: Property 'currentBalance' is missing in type 'TransferringAccount' but required in type 'TransferringAccount'.
src/components/analytics/ReportExporter.tsx(107,15): error TS2322: Type '{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; }; }' is not assignable to type 'Record<string, boolean>'.
  Property 'customDateRange' is incompatible with index signature.
    Type '{ start: string; end: string; }' is not assignable to type 'boolean'.
src/components/auth/UserSetup.tsx(115,17): error TS2322: Type '(e: FormEvent) => Promise<void>' is not assignable to type '() => void'.
  Target signature provides too few arguments. Expected 1 or more, but got 0.
src/components/automation/AutoFundingDashboard.tsx(14,53): error TS2339: Property 'envelopes' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/components/automation/AutoFundingDashboard.tsx(149,15): error TS2322: Type 'FC<HistoryTabProps>' is not assignable to type 'ComponentType<HistoryTabProps>'.
  Type 'React.FunctionComponent<HistoryTabProps>' is not assignable to type 'React.FunctionComponent<HistoryTabProps>'. Two different types with this name exist, but they are unrelated.
    Type 'HistoryTabProps' is not assignable to type 'HistoryTabProps'. Two different types with this name exist, but they are unrelated.
      Types of property 'executionHistory' are incompatible.
        Type 'Execution[]' is not assignable to type 'ExecutionHistoryEntry[]'.
          Type 'Execution' is missing the following properties from type 'ExecutionHistoryEntry': timestamp, trigger
src/components/automation/AutoFundingDashboard.tsx(162,9): error TS2322: Type 'undefined[] | UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to type 'unknown[]'.
  Type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to type 'unknown[]'.
src/components/automation/steps/config/SplitRemainderConfig.tsx(35,68): error TS2345: Argument of type 'string | number' is not assignable to parameter of type 'string'.
  Type 'number' is not assignable to type 'string'.
src/components/automation/tabs/HistoryTab.tsx(134,30): error TS2339: Property 'error' does not exist on type 'Execution'.
src/components/automation/tabs/HistoryTab.tsx(136,58): error TS2339: Property 'error' does not exist on type 'Execution'.
src/components/bills/BillManager.tsx(105,5): error TS2719: Type 'Envelope[]' is not assignable to type 'Envelope[]'. Two different types with this name exist, but they are unrelated.
  Type 'Envelope' is not assignable to type 'Envelope'. Two different types with this name exist, but they are unrelated.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/bills/BillManager.tsx(182,9): error TS2322: Type '{ id: string; label: string; count: number; icon: string; color: string; }[]' is not assignable to type 'Tab[]'.
  Type '{ id: string; label: string; count: number; icon: string; color: string; }' is not assignable to type 'Tab'.
    Types of property 'icon' are incompatible.
      Type 'string' is not assignable to type 'ComponentType<{ className?: string; }>'.
src/components/bills/BillManagerModals.tsx(149,11): error TS2739: Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, category, color
src/components/bills/BillManagerModals.tsx(152,11): error TS2322: Type '(billId: string, deleteEnvelope?: boolean) => Promise<void>' is not assignable to type '(bill: Bill) => void | Promise<void>'.
  Types of parameters 'billId' and 'bill' are incompatible.
    Type 'Bill' is not assignable to type 'string'.
src/components/bills/BillManagerModals.tsx(154,13): error TS2322: Type 'Promise<unknown>' is not assignable to type 'void | Promise<void>'.
  Type 'Promise<unknown>' is not assignable to type 'Promise<void>'.
    Type 'unknown' is not assignable to type 'void'.
src/components/bills/BillManagerModals.tsx(154,42): error TS2345: Argument of type 'Bill' is not assignable to parameter of type 'string'.
src/components/bills/BillManagerModals.tsx(155,35): error TS2339: Property 'amount' does not exist on type 'number'.
src/components/bills/BillManagerModals.tsx(156,37): error TS2339: Property 'paidDate' does not exist on type 'number'.
src/components/bills/BillManagerModals.tsx(159,11): error TS2322: Type '(bill: BillEntity) => void' is not assignable to type '(bill: Bill) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'Bill' is not assignable to type 'BillEntity'.
      Type 'Bill' is not assignable to type 'Record<string, unknown>'.
        Index signature for type 'string' is missing in type 'Bill'.
src/components/bills/BillManagerModals.tsx(163,11): error TS2322: Type '(bill: BillEntity) => void' is not assignable to type '(bill: Bill) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'Bill' is not assignable to type 'BillEntity'.
      Type 'Bill' is not assignable to type 'Record<string, unknown>'.
        Index signature for type 'string' is missing in type 'Bill'.
src/components/bills/BulkBillUpdateModal.tsx(40,25): error TS2345: Argument of type 'Bill[]' is not assignable to parameter of type '{ id: string; name: string; amount: number; category: string; isPaid: boolean; isRecurring: boolean; lastModified: number; dueDate?: string | Date; frequency?: "monthly" | "quarterly" | "annually"; envelopeId?: string; createdAt?: number; description?: string; paymentMethod?: string; }[]'.
  Type 'Bill' is missing the following properties from type '{ id: string; name: string; amount: number; category: string; isPaid: boolean; isRecurring: boolean; lastModified: number; dueDate?: string | Date; frequency?: "monthly" | "quarterly" | "annually"; envelopeId?: string; createdAt?: number; description?: string; paymentMethod?: string; }': isRecurring, lastModified
src/components/bills/BulkUpdateBillRow.tsx(59,19): error TS2739: Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, category, color
src/components/bills/BulkUpdateBillRow.tsx(65,15): error TS2719: Type 'AmountChange' is not assignable to type 'AmountChange'. Two different types with this name exist, but they are unrelated.
  Types of property 'original' are incompatible.
    Type 'string' is not assignable to type 'number'.
src/components/bills/BulkUpdateBillRowComponents.tsx(90,70): error TS2339: Property 'description' does not exist on type 'Bill'.
src/components/bills/BulkUpdateEditor.tsx(94,15): error TS2322: Type 'Bill' is not assignable to type 'BillEntity'.
  Type 'Bill' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type 'Bill'.
src/components/bills/BulkUpdateEditor.tsx(96,15): error TS2322: Type 'string' is not assignable to type 'UpdateMode'.
src/components/bills/SmartBillMatcher.tsx(32,23): error TS2352: Conversion of type 'Suggestion[]' to type 'Suggestion[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Suggestion' is not comparable to type 'Suggestion'.
    Types of property 'envelope' are incompatible.
      Type 'Envelope' is not comparable to type 'Envelope'.
        Index signature for type 'string' is missing in type 'Envelope'.
src/components/bills/SmartBillMatcher.tsx(32,47): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Bill[]'.
  Type '{}' is missing the following properties from type 'Bill': id, name
src/components/bills/modals/BillDetailModal.tsx(1,17): error TS6133: 'FormEvent' is declared but its value is never read.
src/components/bills/modals/BillDetailModal.tsx(48,23): error TS2739: Type 'Bill' is missing the following properties from type 'Bill': isRecurring, lastModified
src/components/bills/modals/BillDetailModal.tsx(48,29): error TS2322: Type '(bill: Bill) => void | Promise<void>' is not assignable to type '(billId: string) => void'.
  Types of parameters 'bill' and 'billId' are incompatible.
    Type 'string' is not assignable to type 'Bill'.
src/components/bills/modals/BillDetailModal.tsx(48,39): error TS2322: Type '(bill: Bill, amount: number) => void | Promise<void>' is not assignable to type '(billId: string, paymentData: PaymentData) => void'.
  Types of parameters 'bill' and 'billId' are incompatible.
    Type 'string' is not assignable to type 'Bill'.
src/components/bills/modals/BillDetailModal.tsx(48,60): error TS2322: Type '(bill: import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill) => void' is not assignable to type '(bill: import("/home/runner/work/violet-vault/violet-vault/src/db/types").Bill) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Property 'color' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Bill' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill'.
src/components/bills/modals/BillDetailModal.tsx(48,68): error TS2322: Type '(bill: import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill) => void' is not assignable to type '(bill: import("/home/runner/work/violet-vault/violet-vault/src/db/types").Bill) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Property 'color' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Bill' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill'.
src/components/bills/modals/BillDetailModal.tsx(83,44): error TS2339: Property 'nextDueDate' does not exist on type 'Bill'.
src/components/bills/modals/BillDetailModal.tsx(90,34): error TS2339: Property 'nextDueDate' does not exist on type 'Bill'.
src/components/budgeting/CreateEnvelopeModal.tsx(57,5): error TS2322: Type 'unknown[]' is not assignable to type 'Record<string, unknown>[]'.
  Type 'unknown' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type '{}'.
src/components/budgeting/CreateEnvelopeModal.tsx(58,5): error TS2322: Type '(envelope: unknown) => void' is not assignable to type '(data: unknown) => Promise<void>'.
  Type 'void' is not assignable to type 'Promise<void>'.
src/components/budgeting/CreateEnvelopeModal.tsx(104,13): error TS2719: Type 'Bill[]' is not assignable to type 'Bill[]'. Two different types with this name exist, but they are unrelated.
  Type 'Bill' is not assignable to type 'Bill'. Two different types with this name exist, but they are unrelated.
    Property 'name' is optional in type 'Bill' but required in type 'Bill'.
src/components/budgeting/CreateEnvelopeModal.tsx(133,13): error TS2719: Type 'Bill[]' is not assignable to type 'Bill[]'. Two different types with this name exist, but they are unrelated.
  Type 'Bill' is not assignable to type 'Bill'. Two different types with this name exist, but they are unrelated.
    Property 'name' is optional in type 'Bill' but required in type 'Bill'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(171,11): error TS2719: Type 'Bill[]' is not assignable to type 'Bill[]'. Two different types with this name exist, but they are unrelated.
  Type 'Bill' is not assignable to type 'Bill'. Two different types with this name exist, but they are unrelated.
    Index signature for type 'string' is missing in type 'Bill'.
src/components/budgeting/EditEnvelopeModal.tsx(67,5): error TS2322: Type 'unknown[]' is not assignable to type 'Envelope[]'.
  Property 'id' is missing in type '{}' but required in type 'Envelope'.
src/components/budgeting/EditEnvelopeModal.tsx(68,5): error TS2322: Type '(envelope: unknown) => void | Promise<void>' is not assignable to type '(envelopeData: unknown) => Promise<void>'.
  Type 'void | Promise<void>' is not assignable to type 'Promise<void>'.
    Type 'void' is not assignable to type 'Promise<void>'.
src/components/budgeting/EditEnvelopeModal.tsx(70,5): error TS2322: Type '(envelopeId: string) => void | Promise<void>' is not assignable to type '(envelopeId: string | number) => Promise<void>'.
  Type 'void | Promise<void>' is not assignable to type 'Promise<void>'.
    Type 'void' is not assignable to type 'Promise<void>'.
src/components/budgeting/EditEnvelopeModal.tsx(129,11): error TS2739: Type 'EnvelopeRef' is missing the following properties from type 'Envelope': name, currentBalance, targetAmount
src/components/budgeting/EditEnvelopeModal.tsx(181,9): error TS2739: Type 'EnvelopeRef' is missing the following properties from type 'Envelope': name, currentBalance, targetAmount
src/components/budgeting/EnvelopeGrid.tsx(147,9): error TS2322: Type '(id: string, amount: number) => Promise<void>' is not assignable to type '(amount: number) => void'.
  Target signature provides too few arguments. Expected 2 or more, but got 1.
src/components/budgeting/EnvelopeGrid.tsx(272,42): error TS2345: Argument of type '(state: BudgetState) => BudgetEnvelope[]' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => BudgetEnvelope[]' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'BudgetState'.
src/components/budgeting/EnvelopeGrid.tsx(273,45): error TS2345: Argument of type '(state: BudgetState) => unknown[]' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => unknown[]' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'BudgetState'.
src/components/budgeting/EnvelopeGrid.tsx(274,38): error TS2345: Argument of type '(state: BudgetState) => unknown[]' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => unknown[]' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'BudgetState'.
src/components/budgeting/EnvelopeGrid.tsx(275,44): error TS2345: Argument of type '(state: BudgetState) => unknown' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => unknown' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'BudgetState'.
src/components/budgeting/EnvelopeGrid.tsx(276,43): error TS2345: Argument of type '(state: BudgetState) => (bill: unknown) => void' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => (bill: unknown) => void' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'BudgetState'.
src/components/budgeting/EnvelopeGrid.tsx(371,33): error TS2345: Argument of type 'Envelope[] | Envelope[] | ({ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; ... 31 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = []>(initiali...' is not assignable to parameter of type 'Envelope[]'.
  Type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...' is not assignable to type 'Envelope[]'.
src/components/budgeting/EnvelopeGrid.tsx(414,7): error TS2322: Type 'Bill[] | ({ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unk...' is not assignable to type 'unknown[]'.
  Type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...' is not assignable to type 'unknown[]'.
src/components/budgeting/EnvelopeGrid.tsx(420,9): error TS2322: Type 'Envelope[] | Envelope[] | ({ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; ... 31 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = []>(initiali...' is not assignable to type 'Envelope[]'.
  Type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...' is not assignable to type 'Envelope[]'.
src/components/budgeting/EnvelopeGrid.tsx(432,9): error TS2322: Type 'Bill[] | ({ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unk...' is not assignable to type 'unknown[]'.
  Type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...' is not assignable to type 'unknown[]'.
src/components/budgeting/PaycheckProcessor.tsx(80,13): error TS2322: Type 'Envelope[]' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope[]'.
  Property 'targetAmount' is missing in type 'Envelope' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope'.
src/components/budgeting/PaycheckProcessor.tsx(87,9): error TS2719: Type 'PaycheckHistoryItem[]' is not assignable to type 'PaycheckHistoryItem[]'. Two different types with this name exist, but they are unrelated.
  Type 'PaycheckHistoryItem' is not assignable to type 'PaycheckHistoryItem'. Two different types with this name exist, but they are unrelated.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/budgeting/PaycheckProcessor.tsx(139,7): error TS2322: Type 'string' is not assignable to type 'AllocationMode'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(167,11): error TS2739: Type '{}' is missing the following properties from type 'AnalysisSettings': minAmount, minTransactions, overspendingThreshold, bufferPercentage
src/components/budgeting/SmartEnvelopeSuggestions.tsx(171,11): error TS2739: Type '{}' is missing the following properties from type 'SuggestionStats': totalSuggestions, priorityCounts, potentialSavings
src/components/budgeting/SmartEnvelopeSuggestions.tsx(176,7): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/utils/budgeting/suggestionUtils").Suggestion[]' is not assignable to type 'Suggestion[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/utils/budgeting/suggestionUtils").Suggestion' is not assignable to type 'Suggestion'.
    Index signature for type 'string' is missing in type 'Suggestion'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(212,5): error TS2322: Type '(envelope: Envelope) => void' is not assignable to type '(envelopeId: string, updates: Record<string, unknown>) => void | Promise<void>'.
  Types of parameters 'envelope' and 'envelopeId' are incompatible.
    Type 'string' is not assignable to type 'Envelope'.
src/components/budgeting/envelope/EnvelopeItem.tsx(66,91): error TS2345: Argument of type 'Envelope' is not assignable to parameter of type 'EnvelopeWithStatus'.
  Types of property 'status' are incompatible.
    Type 'string' is not assignable to type '"overdue" | "healthy" | "overspent" | "underfunded"'.
src/components/budgeting/envelope/UnassignedCashEnvelope.tsx(16,5): error TS2345: Argument of type '(state: { openUnassignedCashModal?: () => void; }) => () => void' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: { openUnassignedCashModal?: () => void; }) => () => void' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Type '() => void' is not assignable to type 'StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
      Type '() => void' is not assignable to type 'StoreState'.
src/components/budgeting/shared/BillConnectionSelector.tsx(15,11): error TS6196: 'Envelope' is declared but never used.
src/components/budgeting/suggestions/SuggestionsList.tsx(112,19): error TS2740: Type 'Suggestion' is missing the following properties from type 'Suggestion': title, description, reasoning, type, and 3 more.
src/components/budgeting/suggestions/SuggestionsList.tsx(113,19): error TS2719: Type '(suggestion: Suggestion) => void' is not assignable to type '(suggestion: Suggestion) => void'. Two different types with this name exist, but they are unrelated.
  Types of parameters 'suggestion' and 'suggestion' are incompatible.
    Type 'Suggestion' is not assignable to type 'Suggestion'. Two different types with this name exist, but they are unrelated.
      Index signature for type 'string' is missing in type 'Suggestion'.
src/components/budgeting/suggestions/SuggestionsList.tsx(114,19): error TS2322: Type '(suggestion: Suggestion) => void' is not assignable to type '(id: string) => void'.
  Types of parameters 'suggestion' and 'id' are incompatible.
    Type 'string' is not assignable to type 'Suggestion'.
src/components/debt/DebtDashboard.tsx(89,15): error TS2322: Type '(debtId: string, paymentData: { amount: number; date?: string; }) => Promise<void>' is not assignable to type '(debt: DebtAccount, amount: number) => void'.
  Types of parameters 'debtId' and 'debt' are incompatible.
    Type 'DebtAccount' is not assignable to type 'string'.
src/components/debt/DebtDashboard.tsx(110,11): error TS2322: Type 'DebtAccount' is not assignable to type 'Record<string, unknown> & { id: string; }'.
  Type 'DebtAccount' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type 'DebtAccount'.
src/components/debt/DebtDashboard.tsx(114,11): error TS2322: Type '(debtId: string, paymentData: { amount: number; date?: string; }) => Promise<void>' is not assignable to type '(debtId: string, amount: number) => Promise<void>'.
  Types of parameters 'paymentData' and 'amount' are incompatible.
    Type 'number' is not assignable to type '{ amount: number; date?: string; }'.
src/components/debt/DebtDashboard.tsx(115,11): error TS2322: Type '(debt: DebtAccount) => void' is not assignable to type '(debt: Record<string, unknown>) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'Record<string, unknown>' is missing the following properties from type 'DebtAccount': id, name, creditor, balance, and 6 more.
src/components/debt/DebtDashboard.tsx(122,9): error TS2322: Type 'DebtAccount[]' is not assignable to type 'UpcomingPayment[]'.
  Type 'DebtAccount' is missing the following properties from type 'UpcomingPayment': debtId, debtName, dueDate, amount
src/components/debt/DebtStrategies.tsx(25,25): error TS2345: Argument of type 'DebtAccount[]' is not assignable to parameter of type 'Debt[]'.
  Type 'DebtAccount' is not assignable to type 'Debt'.
    Property 'currentBalance' is optional in type 'DebtAccount' but required in type 'Debt'.
src/components/debt/DebtStrategies.tsx(59,11): error TS2322: Type '{ debts: any[]; totalInterest: number; payoffTime: number; name?: undefined; description?: undefined; } | { debts: { priority: number; monthsToPayoff: number; totalInterestCost: number; strategy: string; ... 6 more ...; interestRate?: number; }[]; totalInterest: number; payoffTime: number; name: string; description:...' is not assignable to type 'Strategy'.
  Type '{ debts: any[]; totalInterest: number; payoffTime: number; name?: undefined; description?: undefined; }' is not assignable to type 'Strategy'.
    Property 'name' is optional in type '{ debts: any[]; totalInterest: number; payoffTime: number; name?: undefined; description?: undefined; }' but required in type 'Strategy'.
src/components/debt/DebtStrategies.tsx(63,11): error TS2322: Type '{ debts: any[]; totalInterest: number; payoffTime: number; name?: undefined; description?: undefined; } | { debts: { priority: number; monthsToPayoff: number; totalInterestCost: number; strategy: string; ... 6 more ...; interestRate?: number; }[]; totalInterest: number; payoffTime: number; name: string; description:...' is not assignable to type 'Strategy'.
  Type '{ debts: any[]; totalInterest: number; payoffTime: number; name?: undefined; description?: undefined; }' is not assignable to type 'Strategy'.
    Property 'name' is optional in type '{ debts: any[]; totalInterest: number; payoffTime: number; name?: undefined; description?: undefined; }' but required in type 'Strategy'.
src/components/debt/DebtStrategies.tsx(113,27): error TS2322: Type '{ extraPayment: number; avalanche: { monthsToPayoff: number; totalInterest: number; savings: number; timeSavings?: undefined; interestSavings?: undefined; } | { monthsToPayoff: number; totalInterest: number; timeSavings: number; interestSavings: number; savings?: undefined; }; snowball: { ...; } | { ...; }; }[]' is not assignable to type 'PaymentImpactScenario[]'.
  Type '{ extraPayment: number; avalanche: { monthsToPayoff: number; totalInterest: number; savings: number; timeSavings?: undefined; interestSavings?: undefined; } | { monthsToPayoff: number; totalInterest: number; timeSavings: number; interestSavings: number; savings?: undefined; }; snowball: { monthsToPayoff: number; tot...' is not assignable to type 'PaymentImpactScenario'.
    Types of property 'avalanche' are incompatible.
      Type '{ monthsToPayoff: number; totalInterest: number; savings: number; timeSavings?: undefined; interestSavings?: undefined; } | { monthsToPayoff: number; totalInterest: number; timeSavings: number; interestSavings: number; savings?: undefined; }' is not assignable to type '{ timeSavings: number; interestSavings: number; }'.
        Type '{ monthsToPayoff: number; totalInterest: number; savings: number; timeSavings?: undefined; interestSavings?: undefined; }' is not assignable to type '{ timeSavings: number; interestSavings: number; }'.
          Property 'timeSavings' is optional in type '{ monthsToPayoff: number; totalInterest: number; savings: number; timeSavings?: undefined; interestSavings?: undefined; }' but required in type '{ timeSavings: number; interestSavings: number; }'.
src/components/debt/modals/DebtDetailModal.tsx(52,5): error TS2740: Type 'Record<string, unknown> & { id: string; }' is missing the following properties from type 'DebtWithHistory': name, status, balance, type, and 5 more.
src/components/debt/modals/DebtDetailModal.tsx(56,5): error TS2322: Type '(debtId: string, amount: number) => Promise<void>' is not assignable to type '(debtId: string, paymentData: PaymentData) => void'.
  Types of parameters 'amount' and 'paymentData' are incompatible.
    Type 'PaymentData' is not assignable to type 'number'.
src/components/debt/modals/DebtDetailModal.tsx(57,5): error TS2322: Type '(debt: Record<string, unknown>) => void' is not assignable to type '(debt: DebtWithHistory) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtWithHistory' is not assignable to type 'Record<string, unknown>'.
      Index signature for type 'string' is missing in type 'DebtWithHistory'.
src/components/debt/modals/DebtDetailModal.tsx(81,47): error TS2322: Type '{ id: string | number; displayDate: string; formattedAmount: string; principalDisplay: string; interestDisplay: string; date: string; amount: number; principalAmount?: number; interestAmount?: number; }[]' is not assignable to type '{ id: string; formattedAmount: string; displayDate: string; principalDisplay?: string; interestDisplay?: string; }[]'.
  Type '{ id: string | number; displayDate: string; formattedAmount: string; principalDisplay: string; interestDisplay: string; date: string; amount: number; principalAmount?: number; interestAmount?: number; }' is not assignable to type '{ id: string; formattedAmount: string; displayDate: string; principalDisplay?: string; interestDisplay?: string; }'.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/history/BudgetHistoryViewer.tsx(49,64): error TS2345: Argument of type 'UseMutateFunction<{ commitHash: string; snapshot: any; }, Error, { commitHash: string; password: string; }, unknown>' is not assignable to parameter of type '(params: { commitHash: string; password: string; }) => Promise<void>'.
  Type 'void' is not assignable to type 'Promise<void>'.
src/components/history/BudgetHistoryViewer.tsx(121,15): error TS2322: Type 'BudgetCommit[]' is not assignable to type 'HistoryCommit[]'.
  Property 'shortHash' is missing in type 'BudgetCommit' but required in type 'HistoryCommit'.
src/components/history/BudgetHistoryViewer.tsx(133,15): error TS2322: Type '{ commit: BudgetCommit; changes: BudgetChange[]; }' is not assignable to type 'CommitDetails'.
  Types of property 'changes' are incompatible.
    Type 'BudgetChange[]' is not assignable to type 'Change[]'.
      Property 'type' is missing in type 'BudgetChange' but required in type 'Change'.
src/components/layout/MainLayout.tsx(237,5): error TS2345: Argument of type '(state: Record<string, unknown>) => () => void' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: Record<string, unknown>) => () => void' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'Record<string, unknown>'.
        Index signature for type 'string' is missing in type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/components/layout/MainLayout.tsx(288,5): error TS2345: Argument of type '(state: Record<string, unknown>) => boolean' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: Record<string, unknown>) => boolean' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'Record<string, unknown>'.
        Index signature for type 'string' is missing in type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/components/layout/MainLayout.tsx(291,5): error TS2345: Argument of type '(state: Record<string, unknown>) => boolean' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: Record<string, unknown>) => boolean' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'Record<string, unknown>'.
        Index signature for type 'string' is missing in type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/components/layout/MainLayout.tsx(324,11): error TS2322: Type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...' is not assignable to type 'boolean'.
src/components/layout/MainLayout.tsx(325,11): error TS2322: Type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...' is not assignable to type 'boolean'.
src/components/layout/MainLayout.tsx(477,11): error TS2322: Type '(event: ChangeEvent<HTMLInputElement>) => Promise<{ success: boolean; imported: { envelopes: number; bills: number; transactions: number; savingsGoals: number; debts: number; paycheckHistory: number; auditLog: number; }; }>' is not assignable to type '() => void'.
  Target signature provides too few arguments. Expected 1 or more, but got 0.
src/components/layout/MainLayout.tsx(484,11): error TS2322: Type '(oldPassword: string, newPassword: string) => Promise<void>' is not assignable to type '(password: string) => void'.
  Target signature provides too few arguments. Expected 2 or more, but got 1.
src/components/layout/SummaryCards.tsx(34,5): error TS2345: Argument of type '(state: { openUnassignedCashModal: () => void; }) => () => void' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: { openUnassignedCashModal: () => void; }) => () => void' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type '{ openUnassignedCashModal: () => void; }'.
src/components/layout/ViewRenderer.tsx(253,9): error TS2322: Type '(distribution: unknown, description: string) => Promise<unknown>' is not assignable to type '(amount: number, goals: unknown[]) => void'.
  Types of parameters 'description' and 'goals' are incompatible.
    Type 'unknown[]' is not assignable to type 'string'.
src/components/layout/ViewRenderer.tsx(271,9): error TS2322: Type 'UseMutateFunction<{ id: string; date: Date; amount: number; source: string; lastModified: number; createdAt: number; mode: string; unassignedCashBefore: number; unassignedCashAfter: number; actualBalanceBefore: number; actualBalanceAfter: number; envelopeAllocations: { ...; }[]; notes: string; }, Error, PaycheckData...' is not assignable to type '(data: unknown) => Promise<void>'.
  Type 'void' is not assignable to type 'Promise<void>'.
src/components/layout/ViewRenderer.tsx(272,9): error TS2322: Type '(paycheckId: string) => Promise<void>' is not assignable to type '(paycheck: PaycheckHistoryItem) => Promise<void>'.
  Types of parameters 'paycheckId' and 'paycheck' are incompatible.
    Type 'PaycheckHistoryItem' is not assignable to type 'string'.
src/components/layout/ViewRenderer.tsx(273,44): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").PaycheckHistory[]' is not assignable to parameter of type 'PaycheckHistory[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").PaycheckHistory' is not assignable to type 'PaycheckHistory'.
    Types of property 'allocations' are incompatible.
      Type 'Record<string, number> | { envelopeId: string; envelopeName: string; amount: number; }[]' is not assignable to type 'unknown[]'.
        Type 'Record<string, number>' is missing the following properties from type 'unknown[]': length, pop, push, concat, and 29 more.
src/components/layout/ViewRenderer.tsx(275,9): error TS2741: Property 'userName' is missing in type 'Record<string, unknown>' but required in type 'User'.
src/components/layout/ViewRenderer.tsx(280,9): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]' is not assignable to type 'Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction' is not assignable to type 'Transaction'.
    Index signature for type 'string' is missing in type 'Transaction'.
src/components/layout/ViewRenderer.tsx(281,9): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Envelope[]' is not assignable to type 'Envelope[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Envelope' is not assignable to type 'Envelope'.
    Index signature for type 'string' is missing in type 'Envelope'.
src/components/layout/ViewRenderer.tsx(282,9): error TS2322: Type '(updatedBill: Record<string, unknown>) => void' is not assignable to type '(bill: Bill) => void | Promise<void>'.
  Types of parameters 'updatedBill' and 'bill' are incompatible.
    Type 'Bill' is not assignable to type 'Record<string, unknown>'.
      Index signature for type 'string' is missing in type 'Bill'.
src/components/modals/QuickFundModal.tsx(53,28): error TS2339: Property 'id' does not exist on type 'unknown'.
src/components/modals/QuickFundModal.tsx(53,32): error TS2554: Expected 1 arguments, but got 2.
src/components/modals/QuickFundModal.tsx(59,24): error TS2339: Property 'id' does not exist on type 'unknown'.
src/components/modals/QuickFundModal.tsx(59,28): error TS2554: Expected 1 arguments, but got 2.
src/components/modals/QuickFundModal.tsx(83,66): error TS2339: Property 'name' does not exist on type 'unknown'.
src/components/modals/QuickFundModal.tsx(90,11): error TS2741: Property 'name' is missing in type '{}' but required in type 'Envelope'.
src/components/modals/UnassignedCashModal.tsx(311,22): error TS2339: Property 'isUnassignedCashModalOpen' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/components/modals/UnassignedCashModal.tsx(315,22): error TS2339: Property 'closeUnassignedCashModal' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/components/pwa/OfflineStatusIndicator.tsx(34,48): error TS2339: Property 'isOnline' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/components/pwa/PatchNotesModal.tsx(89,37): error TS2345: Argument of type '(state: UiStore) => boolean' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: UiStore) => boolean' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'UiStore'.
src/components/pwa/PatchNotesModal.tsx(90,26): error TS2352: Conversion of type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...' to type 'PatchNotesData' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
src/components/pwa/PatchNotesModal.tsx(91,5): error TS2345: Argument of type '(state: UiStore) => { version: string; notes: string[]; fromVersion?: string; toVersion?: string; isUpdate?: boolean; }' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: UiStore) => { version: string; notes: string[]; fromVersion?: string; toVersion?: string; isUpdate?: boolean; }' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'UiStore'.
src/components/pwa/PatchNotesModal.tsx(93,40): error TS2345: Argument of type '(state: UiStore) => boolean' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: UiStore) => boolean' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'UiStore'.
src/components/pwa/PatchNotesModal.tsx(94,42): error TS2345: Argument of type '(state: UiStore) => () => void' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: UiStore) => () => void' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'UiStore'.
src/components/pwa/UpdateAvailableModal.tsx(29,28): error TS2339: Property 'hasContent' does not exist on type 'string'.
src/components/pwa/UpdateAvailableModal.tsx(30,65): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/components/pwa/UpdateAvailableModal.tsx(31,25): error TS2345: Argument of type '{ type: string; text: string; }[]' is not assignable to parameter of type 'SetStateAction<PatchNote[]>'.
  Type '{ type: string; text: string; }[]' is not assignable to type 'PatchNote[]'.
    Type '{ type: string; text: string; }' is not assignable to type 'PatchNote'.
      Types of property 'type' are incompatible.
        Type 'string' is not assignable to type '"other" | "breaking" | "fix" | "feature"'.
src/components/pwa/UpdateAvailableModal.tsx(53,55): error TS2339: Property 'updateAvailable' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/components/pwa/UpdateAvailableModal.tsx(54,50): error TS2339: Property 'isUpdating' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/components/pwa/UpdateAvailableModal.tsx(55,58): error TS2339: Property 'setUpdateAvailable' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/components/pwa/UpdateAvailableModal.tsx(56,49): error TS2339: Property 'updateApp' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/components/pwa/UpdateAvailableModal.tsx(58,54): error TS2345: Argument of type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to parameter of type 'boolean'.
src/components/pwa/UpdateAvailableModal.tsx(59,39): error TS2345: Argument of type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to parameter of type 'boolean'.
src/components/pwa/UpdateAvailableModal.tsx(68,24): error TS2345: Argument of type 'boolean' is not assignable to parameter of type '(state: StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) => unknown'.
src/components/pwa/UpdateAvailableModal.tsx(164,13): error TS2322: Type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to type 'boolean'.
src/components/pwa/UpdateAvailableModal.tsx(184,13): error TS2322: Type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to type 'boolean'.
src/components/receipts/ReceiptToTransactionModal.tsx(161,13): error TS2719: Type 'Envelope[]' is not assignable to type 'Envelope[]'. Two different types with this name exist, but they are unrelated.
  Type 'Envelope' is missing the following properties from type 'Envelope': allocated, spent
src/components/receipts/ReceiptToTransactionModal.tsx(184,13): error TS2322: Type 'string | boolean' is not assignable to type 'boolean'.
  Type 'string' is not assignable to type 'boolean'.
src/components/receipts/components/ReceiptExtractedData.tsx(94,86): error TS2339: Property 'processingTime' does not exist on type 'ExtractedData'.
src/components/receipts/steps/ConfirmationStep.tsx(64,70): error TS2345: Argument of type 'string | number | Date' is not assignable to parameter of type 'string'.
  Type 'number' is not assignable to type 'string'.
src/components/receipts/steps/ConfirmationStep.tsx(139,70): error TS2345: Argument of type 'string | number | Date' is not assignable to parameter of type 'string'.
  Type 'number' is not assignable to type 'string'.
src/components/savings/SavingsGoals.tsx(44,5): error TS2322: Type '(amount: number, goals: unknown[]) => void' is not assignable to type '(distribution: unknown) => void | Promise<void>'.
  Target signature provides too few arguments. Expected 2 or more, but got 1.
src/components/savings/SavingsGoals.tsx(93,27): error TS2322: Type 'unknown[]' is not assignable to type 'SavingsGoal[]'.
  Type '{}' is missing the following properties from type 'SavingsGoal': id, name, category, priority, and 5 more.
src/components/savings/SavingsGoals.tsx(132,27): error TS2339: Property 'id' does not exist on type 'unknown'.
src/components/savings/SavingsGoals.tsx(133,17): error TS2740: Type '{}' is missing the following properties from type 'SavingsGoal': id, name, currentAmount, targetAmount, and 2 more.
src/components/savings/SavingsGoals.tsx(156,9): error TS2322: Type 'unknown[]' is not assignable to type 'SavingsGoal[]'.
  Type '{}' is missing the following properties from type 'SavingsGoal': id, name, targetAmount, currentAmount, priority
src/components/security/LockScreen.tsx(239,20): error TS2345: Argument of type 'KeyboardEvent<HTMLInputElement>' is not assignable to parameter of type 'FormEvent<HTMLFormElement>'.
  Types of property 'currentTarget' are incompatible.
    Type 'EventTarget & HTMLInputElement' is not assignable to type 'EventTarget & HTMLFormElement'.
      Type 'EventTarget & HTMLInputElement' is missing the following properties from type 'HTMLFormElement': acceptCharset, action, elements, encoding, and 11 more.
src/components/settings/SecuritySettings.tsx(83,16): error TS2322: Type '{ securitySettings: SecuritySettings; handleSettingChange: (setting: any, value: any) => void; }' is not assignable to type 'ClipboardSecuritySectionProps'.
  Types of property 'securitySettings' are incompatible.
    Type 'import("/home/runner/work/violet-vault/violet-vault/src/services/security/securityService").SecuritySettings' is not assignable to type 'SecuritySettings'.
      Index signature for type 'string' is missing in type 'SecuritySettings'.
src/components/settings/SettingsDashboard.tsx(110,5): error TS2322: Type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to type 'boolean'.
src/components/settings/SettingsDashboard.tsx(162,13): error TS2322: Type '(password: string) => void' is not assignable to type '(current: string, newPass: string) => Promise<AuthResult>'.
  Type 'void' is not assignable to type 'Promise<AuthResult>'.
src/components/settings/sections/GeneralSettingsSection.tsx(286,53): error TS2339: Property 'manualInstall' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/components/settings/sections/GeneralSettingsSection.tsx(303,53): error TS2538: Type 'unknown' cannot be used as an index type.
src/components/settings/sections/NotificationSettingsSection.tsx(264,27): error TS2322: Type 'string' is not assignable to type 'PermissionStatus'.
src/components/settings/sections/SyncDebugToolsSection.tsx(10,5): error TS2717: Subsequent property declarations must have the same type.  Property 'getQuickSyncStatus' must be of type '() => Promise<any>', but here has type '() => Promise<unknown>'.
src/components/settings/sections/SyncDebugToolsSection.tsx(11,5): error TS2717: Subsequent property declarations must have the same type.  Property 'runMasterSyncValidation' must be of type '() => Promise<ValidationResults>', but here has type '() => Promise<unknown>'.
src/components/settings/sections/SyncDebugToolsSection.tsx(12,5): error TS2687: All declarations of 'detectLocalDataDebug' must have identical modifiers.
src/components/settings/sections/SyncDebugToolsSection.tsx(13,5): error TS2687: All declarations of 'hasLocalDataDebug' must have identical modifiers.
src/components/settings/sections/SyncDebugToolsSection.tsx(14,5): error TS2717: Subsequent property declarations must have the same type.  Property 'forceCloudDataReset' must be of type '() => Promise<{ success: boolean; message?: string; error?: string; }>', but here has type '() => Promise<unknown>'.
src/components/sync/health/SyncHealthDetails.tsx(56,50): error TS2345: Argument of type 'SyncStatus' is not assignable to parameter of type 'SyncStatus'.
  Index signature for type 'string' is missing in type 'SyncStatus'.
src/components/sync/health/SyncHealthDetails.tsx(58,56): error TS2345: Argument of type 'RecoveryResult' is not assignable to parameter of type 'RecoveryResult'.
  Index signature for type 'string' is missing in type 'RecoveryResult'.
src/components/transactions/TransactionLedger.tsx(176,7): error TS2322: Type 'unknown' is not assignable to type 'number'.
src/components/transactions/TransactionLedger.tsx(178,7): error TS2740: Type '{}' is missing the following properties from type 'unknown[]': length, pop, push, concat, and 29 more.
src/components/transactions/TransactionLedger.tsx(180,7): error TS2322: Type 'unknown' is not assignable to type 'Record<string, string>'.
  Index signature for type 'string' is missing in type '{}'.
src/components/transactions/TransactionLedger.tsx(182,7): error TS2739: Type '{}' is missing the following properties from type '{ current: number; total: number; percentage: number; }': current, total, percentage
src/components/transactions/TransactionLedger.tsx(184,7): error TS2322: Type '(file: File) => void' is not assignable to type '(data: unknown[]) => void'.
  Types of parameters 'file' and 'data' are incompatible.
    Type 'unknown[]' is missing the following properties from type 'File': lastModified, name, webkitRelativePath, size, and 5 more.
src/components/transactions/TransactionSplitter.tsx(102,19): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").SplitAllocation[]' is not assignable to type 'SplitAllocation[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").SplitAllocation' is not assignable to type 'SplitAllocation'.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/transactions/TransactionSplitter.tsx(103,19): error TS2322: Type 'string[]' is not assignable to type 'Category[]'.
  Type 'string' is not assignable to type 'Category'.
src/components/transactions/TransactionSplitter.tsx(104,19): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope[]' is not assignable to type 'Envelope[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope' is not assignable to type 'Envelope'.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/transactions/TransactionSplitter.tsx(106,19): error TS2322: Type '(splitId: string, field: keyof SplitAllocation, value: unknown) => void' is not assignable to type '(id: string, updates: Record<string, unknown>) => void'.
  Target signature provides too few arguments. Expected 3 or more, but got 2.
src/components/transactions/TransactionTable.tsx(139,21): error TS2322: Type '(transaction: Transaction) => void' is not assignable to type '(transactionId: string) => void'.
  Types of parameters 'transaction' and 'transactionId' are incompatible.
    Type 'string' is not assignable to type 'Transaction'.
src/components/transactions/components/TransactionRow.tsx(39,60): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{}' is missing the following properties from type 'Envelope': id, name, currentBalance, targetAmount
src/components/transactions/components/TransactionRow.tsx(134,42): error TS2345: Argument of type 'Transaction' is not assignable to parameter of type 'string'.
src/components/transactions/import/ImportModal.tsx(59,44): error TS2322: Type '(data: unknown[]) => void' is not assignable to type '(event: ChangeEvent<HTMLInputElement>, options: { clearExisting: boolean; }) => void'.
  Types of parameters 'data' and 'event' are incompatible.
    Type 'ChangeEvent<HTMLInputElement>' is missing the following properties from type 'unknown[]': length, pop, push, concat, and 29 more.
src/components/transactions/import/ImportModal.tsx(63,13): error TS2322: Type 'unknown[]' is not assignable to type 'ImportData | DataRow[]'.
  Type 'unknown[]' is not assignable to type 'DataRow[]'.
    Type 'unknown' is not assignable to type 'DataRow'.
      Index signature for type 'string' is missing in type '{}'.
src/components/transactions/import/ImportModal.tsx(72,51): error TS2322: Type '{ current: number; total: number; percentage: number; }' is not assignable to type 'number'.
src/components/transactions/splitter/SplitAllocationsSection.tsx(117,13): error TS2739: Type 'SplitAllocation' is missing the following properties from type 'Split': description, amount, category
src/components/transactions/splitter/SplitAllocationsSection.tsx(120,13): error TS2322: Type '(id: string, updates: Record<string, unknown>) => void' is not assignable to type '(id: string, field: string, value: string | number) => void'.
  Types of parameters 'updates' and 'field' are incompatible.
    Type 'string' is not assignable to type 'Record<string, unknown>'.
src/components/transactions/splitter/SplitAllocationsSection.tsx(122,13): error TS2322: Type 'Category[]' is not assignable to type 'string[]'.
  Type 'Category' is not assignable to type 'string'.
src/db/budgetDb.ts(94,9): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type '"creating"' is not assignable to parameter of type '"deleting"'.
src/hooks/accounts/useSupplementalAccounts.ts(109,44): error TS2345: Argument of type 'Account' is not assignable to parameter of type 'Account'.
  Type 'Account' is missing the following properties from type 'Account': type, currentBalance, color, isActive
src/hooks/accounts/useSupplementalAccounts.ts(134,7): error TS2322: Type '(account: Account) => void' is not assignable to type '(id: string, data: unknown) => void'.
  Types of parameters 'account' and 'id' are incompatible.
    Type 'string' is not assignable to type 'Account'.
src/hooks/accounts/useSupplementalAccounts.ts(143,22): error TS2345: Argument of type 'Account' is not assignable to parameter of type 'Account'.
  Type 'Account' is missing the following properties from type 'Account': type, currentBalance, color, isActive
src/hooks/accounts/useSupplementalAccounts.ts(157,7): error TS2345: Argument of type 'TransferringAccount' is not assignable to parameter of type 'Account'.
  Type 'TransferringAccount' is missing the following properties from type 'Account': type, currentBalance, color, isActive
src/hooks/accounts/useSupplementalAccounts.ts(172,35): error TS2345: Argument of type 'TransferringAccount' is not assignable to parameter of type 'TransferringAccount'.
  Property 'currentBalance' is missing in type 'TransferringAccount' but required in type 'TransferringAccount'.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(16,11): error TS2339: Property 'paycheckHistory' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...'.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(17,5): error TS2345: Argument of type '(state: { paycheckHistory?: PaycheckItem[]; }) => { paycheckHistory: PaycheckItem[]; }' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: { paycheckHistory?: PaycheckItem[]; }) => { paycheckHistory: PaycheckItem[]; }' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Type '{ paycheckHistory: PaycheckItem[]; }' is not assignable to type 'StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
      Type '{ paycheckHistory: PaycheckItem[]; }' is missing the following properties from type 'StoreState': biweeklyAllocation, isUnassignedCashModalOpen, isActualBalanceManual, isOnline, and 9 more.
src/hooks/analytics/useReportExporter.ts(48,9): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/hooks/analytics/useReportExporter.ts(112,41): error TS2322: Type 'unknown' is not assignable to type 'string'.
src/hooks/analytics/useReportExporter.ts(129,24): error TS2345: Argument of type '(prev: { includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; }; }) => { ...; }' is not assignable to parameter of type 'SetStateAction<{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; }; }>'.
  Type '(prev: { includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; }; }) => { ...; }' is not assignable to type '(prevState: { includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; }; }) => { ...; }'.
    Call signature return types '{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: unknown; }' and '{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; }; }' are incompatible.
      The types of 'customDateRange' are incompatible between these types.
        Type '{}' is missing the following properties from type '{ start: string; end: string; }': start, end
src/hooks/auth/mutations/useJoinBudgetMutation.ts(194,46): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/hooks/auth/mutations/useLoginMutations.ts(53,40): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/hooks/auth/useAuthenticationManager.ts(132,34): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string | UserData'.
src/hooks/bills/useBillManager.ts(93,18): error TS2352: Conversion of type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...' to type 'BudgetState' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
src/hooks/bills/useBillManager.ts(94,5): error TS2345: Argument of type '(state: BudgetState) => { allTransactions: Transaction[]; envelopes: Envelope[]; bills: Bill[]; }' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => { allTransactions: Transaction[]; envelopes: Envelope[]; bills: Bill[]; }' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'BudgetState'.
src/hooks/bills/useBillManager.ts(197,5): error TS2322: Type '(bills: Bill[]) => void' is not assignable to type '(bills: Set<string>) => void'.
  Types of parameters 'bills' and 'bills' are incompatible.
    Type 'Set<string>' is missing the following properties from type 'Bill[]': length, pop, push, concat, and 24 more.
src/hooks/bills/useBillManager.ts(197,23): error TS2352: Conversion of type 'Dispatch<SetStateAction<Set<unknown>>>' to type '(bills: Bill[]) => void' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of parameters 'value' and 'bills' are incompatible.
    Type 'Bill[]' is not comparable to type 'SetStateAction<Set<unknown>>'.
      Type 'Bill[]' is missing the following properties from type 'Set<unknown>': add, clear, delete, has, and 2 more.
src/hooks/bills/useBillManagerHelpers.ts(260,48): error TS2345: Argument of type 'BillRecord' is not assignable to parameter of type 'Bill'.
  Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManagerHelpers.ts(262,22): error TS2345: Argument of type 'Bill' is not assignable to parameter of type 'BillRecord'.
  Index signature for type 'string' is missing in type 'Bill'.
src/hooks/bills/useBillManagerHelpers.ts(276,52): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill' is not assignable to parameter of type 'Bill'.
  Index signature for type 'string' is missing in type 'Bill'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(41,18): error TS2352: Conversion of type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...' to type 'BudgetContext' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(42,5): error TS2345: Argument of type '(state: BudgetSelector) => { envelopes: Envelope[]; unassignedCash: number; allTransactions: Transaction[]; }' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetSelector) => { envelopes: Envelope[]; unassignedCash: number; allTransactions: Transaction[]; }' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Type '{ envelopes: Envelope[]; unassignedCash: number; allTransactions: Transaction[]; }' is not assignable to type 'StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
      Type '{ envelopes: Envelope[]; unassignedCash: number; allTransactions: Transaction[]; }' is missing the following properties from type 'StoreState': biweeklyAllocation, isUnassignedCashModalOpen, paycheckHistory, isActualBalanceManual, and 10 more.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(23,46): error TS2339: Property 'budget' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(36,25): error TS2345: Argument of type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to parameter of type 'Budget'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(58,31): error TS2339: Property 'envelopes' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(59,36): error TS2339: Property 'unassignedCash' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(60,34): error TS2339: Property 'allTransactions' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(71,54): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type '{}' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 7 more.
src/hooks/budgeting/autofunding/useAutoFundingHistory.ts(74,45): error TS2345: Argument of type 'ExecutionRecord[]' is not assignable to parameter of type 'ExecutionHistoryItem[]'.
  Type 'ExecutionRecord' is not assignable to type 'ExecutionHistoryItem'.
    Property 'executedAt' is optional in type 'ExecutionRecord' but required in type 'ExecutionHistoryItem'.
src/hooks/budgeting/autofunding/useUndoOperations.ts(190,46): error TS2339: Property 'budget' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/hooks/budgeting/autofunding/useUndoOperations.ts(241,22): error TS2339: Property 'transferFunds' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/budgeting/useEnvelopeEdit.ts(66,31): error TS2345: Argument of type 'string | number' is not assignable to parameter of type 'string'.
  Type 'number' is not assignable to type 'string'.
src/hooks/budgeting/useEnvelopeEdit.ts(115,5): error TS2322: Type 'Envelope' is not assignable to type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'Envelope'.
src/hooks/budgeting/useEnvelopeEdit.ts(116,5): error TS2322: Type 'Envelope[]' is not assignable to type 'Record<string, unknown>[]'.
  Type 'Envelope' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type 'Envelope'.
src/hooks/budgeting/useEnvelopeEdit.ts(117,5): error TS2322: Type '(envelopeData: unknown) => Promise<boolean>' is not assignable to type '(data: unknown) => Promise<void>'.
  Type 'Promise<boolean>' is not assignable to type 'Promise<void>'.
    Type 'boolean' is not assignable to type 'void'.
src/hooks/budgeting/useEnvelopes.ts(17,54): error TS2345: Argument of type 'Envelope[]' is not assignable to parameter of type 'Envelope[]'.
  Type 'Envelope' is not assignable to type 'Envelope'. Two different types with this name exist, but they are unrelated.
    Index signature for type 'string' is missing in type 'Envelope'.
src/hooks/budgeting/usePaycheckForm.ts(67,40): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'PaycheckHistory[]'.
  Type '{}' is missing the following properties from type 'PaycheckHistory': id, amount, lastModified
src/hooks/budgeting/usePaycheckForm.ts(77,58): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'PaycheckHistory[]'.
  Type '{}' is missing the following properties from type 'PaycheckHistory': id, amount, lastModified
src/hooks/budgeting/usePaycheckForm.ts(111,85): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{}' is missing the following properties from type 'Envelope': id, name, category, archived, lastModified
src/hooks/budgeting/usePaycheckForm.ts(143,43): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type '{}'.
src/hooks/budgeting/usePaycheckForm.ts(174,64): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{}' is missing the following properties from type 'Envelope': id, name, category, archived, lastModified
src/hooks/budgeting/usePaycheckForm.ts(208,70): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'PaycheckHistory[]'.
  Type '{}' is missing the following properties from type 'PaycheckHistory': id, amount, lastModified
src/hooks/budgeting/useSmartSuggestions.ts(88,37): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': amount, date
src/hooks/budgeting/useSmartSuggestions.ts(138,39): error TS2345: Argument of type '{ [key: string]: unknown; id: string; action: string; data: Record<string, unknown>; }' is not assignable to parameter of type '{ data: { [key: string]: unknown; name: string; }; }'.
  Types of property 'data' are incompatible.
    Property 'name' is missing in type 'Record<string, unknown>' but required in type '{ [key: string]: unknown; name: string; }'.
src/hooks/budgeting/useSmartSuggestions.ts(142,37): error TS2345: Argument of type '{ [key: string]: unknown; id: string; action: string; data: Record<string, unknown>; }' is not assignable to parameter of type '{ data: { [key: string]: unknown; envelopeId: string; suggestedAmount: number; currentAmount?: number; }; }'.
  Types of property 'data' are incompatible.
    Type 'Record<string, unknown>' is missing the following properties from type '{ [key: string]: unknown; envelopeId: string; suggestedAmount: number; currentAmount?: number; }': envelopeId, suggestedAmount
src/hooks/budgeting/useSmartSuggestions.ts(146,37): error TS2345: Argument of type '{ [key: string]: unknown; id: string; action: string; data: Record<string, unknown>; }' is not assignable to parameter of type '{ data: { [key: string]: unknown; envelopeId: string; suggestedAmount: number; currentAmount?: number; }; }'.
  Types of property 'data' are incompatible.
    Type 'Record<string, unknown>' is missing the following properties from type '{ [key: string]: unknown; envelopeId: string; suggestedAmount: number; currentAmount?: number; }': envelopeId, suggestedAmount
src/hooks/budgeting/useSmartSuggestions.ts(150,55): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/common/useActualBalance.ts(30,5): error TS2339: Property 'actualBalance' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...'.
src/hooks/common/useActualBalance.ts(31,5): error TS2339: Property 'isActualBalanceManual' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...'.
src/hooks/common/useActualBalance.ts(32,5): error TS2339: Property 'setActualBalance' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...'.
src/hooks/common/useActualBalance.ts(34,5): error TS2345: Argument of type '(state: BudgetState) => { actualBalance: number; isActualBalanceManual: boolean; setActualBalance: (balance: number) => void; }' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => { actualBalance: number; isActualBalanceManual: boolean; setActualBalance: (balance: number) => void; }' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'BudgetState'.
src/hooks/common/useDataInitialization.ts(40,60): error TS2339: Property 'cloudSyncEnabled' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/hooks/common/useImportData.ts(212,11): error TS2345: Argument of type 'ImportedData & { allTransactions: unknown[]; }' is not assignable to parameter of type 'ValidatedImportData'.
  Types of property 'envelopes' are incompatible.
    Type 'unknown[]' is not assignable to type 'Envelope[]'.
      Type '{}' is missing the following properties from type 'Envelope': id, name, currentBalance, targetAmount
src/hooks/common/useImportData.ts(231,29): error TS2345: Argument of type 'ImportedData & { allTransactions: unknown[]; }' is not assignable to parameter of type 'ValidatedImportData'.
  Types of property 'envelopes' are incompatible.
    Type 'unknown[]' is not assignable to type 'Envelope[]'.
      Type '{}' is missing the following properties from type 'Envelope': id, name, currentBalance, targetAmount
src/hooks/common/useImportData.ts(233,34): error TS2345: Argument of type 'ImportedData & { allTransactions: unknown[]; }' is not assignable to parameter of type 'ValidatedImportData'.
  Types of property 'envelopes' are incompatible.
    Type 'unknown[]' is not assignable to type 'Envelope[]'.
      Type '{}' is missing the following properties from type 'Envelope': id, name, currentBalance, targetAmount
src/hooks/common/useNetworkStatus.ts(11,59): error TS2339: Property 'setOnlineStatus' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/hooks/common/useNetworkStatus.ts(18,23): error TS2345: Argument of type 'boolean' is not assignable to parameter of type '(state: StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) => unknown'.
src/hooks/common/useNetworkStatus.ts(24,23): error TS2345: Argument of type 'boolean' is not assignable to parameter of type '(state: StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) => unknown'.
src/hooks/common/useNetworkStatus.ts(32,21): error TS2345: Argument of type 'boolean' is not assignable to parameter of type '(state: StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) => unknown'.
src/hooks/common/useTransactions.ts(42,48): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction'.
    Types of property 'date' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/debts/useDebtDashboard.ts(156,35): error TS2345: Argument of type '{ amount: number; date?: string; }' is not assignable to parameter of type '{ amount: number; paymentDate: string; notes?: string; }'.
  Property 'paymentDate' is missing in type '{ amount: number; date?: string; }' but required in type '{ amount: number; paymentDate: string; notes?: string; }'.
src/hooks/debts/useDebtManagement.ts(134,7): error TS2322: Type 'UseMutateAsyncFunction<{ id?: string; status: string; author?: string; }, Error, { [key: string]: unknown; id?: string; status?: string; author?: string; }, unknown>' is not assignable to type '(data: DebtData) => Promise<CreatedDebt>'.
  Types of parameters 'variables' and 'data' are incompatible.
    Type 'DebtData' is not assignable to type '{ [key: string]: unknown; id?: string; status?: string; author?: string; }'.
      Index signature for type 'string' is missing in type 'DebtData'.
src/hooks/debts/useDebtManagement.ts(148,7): error TS2322: Type 'UseMutateAsyncFunction<{ id: string; }, Error, { id: string; updates: Record<string, unknown>; author?: string; }, unknown>' is not assignable to type '(params: { id: string; updates: Debt; }) => Promise<void>'.
  Types of parameters 'variables' and 'params' are incompatible.
    Type '{ id: string; updates: Debt; }' is not assignable to type '{ id: string; updates: Record<string, unknown>; author?: string; }'.
      Types of property 'updates' are incompatible.
        Type 'Debt' is not assignable to type 'Record<string, unknown>'.
          Index signature for type 'string' is missing in type 'Debt'.
src/hooks/debts/useDebtManagement.ts(161,7): error TS2322: Type 'UseMutateAsyncFunction<{ id: string; }, Error, { id: string; updates: Record<string, unknown>; author?: string; }, unknown>' is not assignable to type '(params: { id: string; updates: Partial<Debt>; }) => Promise<void>'.
  Type 'Promise<{ id: string; }>' is not assignable to type 'Promise<void>'.
    Type '{ id: string; }' is not assignable to type 'void'.
src/hooks/debts/useDebtManagement.ts(170,7): error TS2322: Type 'UseMutateAsyncFunction<{ id: string; }, Error, { id: string; updates: Record<string, unknown>; author?: string; }, unknown>' is not assignable to type '(params: { id: string; updates: Partial<Debt>; }) => Promise<void>'.
  Type 'Promise<{ id: string; }>' is not assignable to type 'Promise<void>'.
    Type '{ id: string; }' is not assignable to type 'void'.
src/hooks/debts/useDebtManagement.ts(180,59): error TS2322: Type 'UseMutateAsyncFunction<{ id: string; }, Error, { id: string; updates: Record<string, unknown>; author?: string; }, unknown>' is not assignable to type '(params: { id: string; updates: Partial<Debt>; author?: string; }) => Promise<void>'.
  Type 'Promise<{ id: string; }>' is not assignable to type 'Promise<void>'.
    Type '{ id: string; }' is not assignable to type 'void'.
src/hooks/debts/useDebtManagement.ts(200,7): error TS2322: Type 'UseMutateAsyncFunction<string, Error, { id: string; author?: string; }, unknown>' is not assignable to type '(params: { id: string; }) => Promise<void>'.
  Type 'Promise<string>' is not assignable to type 'Promise<void>'.
    Type 'string' is not assignable to type 'void'.
src/hooks/debts/useDebts.ts(46,28): error TS2345: Argument of type '{ id?: string; status: string; author?: string; }' is not assignable to parameter of type 'Debt'.
  Type '{ id?: string; status: string; author?: string; }' is missing the following properties from type 'Debt': name, creditor, type, currentBalance, and 2 more.
src/hooks/debts/useDebts.ts(195,20): error TS2339: Property 'name' does not exist on type '{ id?: string; status: string; author?: string; }'.
src/hooks/debts/useDebts.ts(196,20): error TS2339: Property 'type' does not exist on type '{ id?: string; status: string; author?: string; }'.
src/hooks/debts/useDebts.ts(197,30): error TS2339: Property 'currentBalance' does not exist on type '{ id?: string; status: string; author?: string; }'.
src/hooks/debts/useDebts.ts(198,28): error TS2339: Property 'interestRate' does not exist on type '{ id?: string; status: string; author?: string; }'.
src/hooks/layout/usePaycheckOperations.ts(43,71): error TS2345: Argument of type 'PaycheckHistory[]' is not assignable to parameter of type 'Paycheck[]'.
  Type 'PaycheckHistory' is not assignable to type 'Paycheck'.
    Property 'amount' is optional in type 'PaycheckHistory' but required in type 'Paycheck'.
src/hooks/layout/usePaycheckOperations.ts(53,11): error TS2345: Argument of type 'VioletVaultDB' is not assignable to parameter of type '{ envelopes: { get: (id: string | number) => Promise<unknown>; update: (id: string | number, data: unknown) => Promise<void>; }; }'.
  The types of 'envelopes.update' are incompatible between these types.
    Type '(key: string | Envelope, changes: UpdateSpec<Envelope> | ((obj: Envelope, ctx: { value: any; primKey: IndexableType; }) => boolean | void)) => PromiseExtended<...>' is not assignable to type '(id: string | number, data: unknown) => Promise<void>'.
      Types of parameters 'key' and 'id' are incompatible.
        Type 'string | number' is not assignable to type 'string | Envelope'.
          Type 'number' is not assignable to type 'string | Envelope'.
src/hooks/layout/usePaycheckOperations.ts(75,68): error TS2345: Argument of type '{ budget: string[]; budgetData: () => string[]; budgetSummary: () => string[]; budgetMetadata: string[]; unassignedCash: () => string[]; actualBalance: () => string[]; envelopes: string[]; envelopesList: (filters?: FilterParams) => (string | FilterParams)[]; ... 48 more ...; syncActivity: () => string[]; }' is not assignable to parameter of type '{ paycheckHistory: unknown[]; budgetMetadata: unknown[]; }'.
  Types of property 'paycheckHistory' are incompatible.
    Type '() => string[]' is not assignable to type 'unknown[]'.
src/hooks/mobile/useFABBehavior.ts(76,39): error TS2339: Property 'focus' does not exist on type 'Element'.
src/hooks/notifications/useFirebaseMessaging.ts(32,25): error TS2345: Argument of type 'PermissionStatusForUI' is not assignable to parameter of type 'SetStateAction<string>'.
src/hooks/notifications/useFirebaseMessaging.ts(137,54): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type '{}'.
src/hooks/notifications/useFirebaseMessaging.ts(177,45): error TS2339: Property 'canShowPrompt' does not exist on type 'string'.
src/hooks/notifications/useFirebaseMessaging.ts(178,36): error TS2339: Property 'isSupported' does not exist on type 'string'.
src/hooks/receipts/useReceiptToTransaction.ts(46,82): error TS2345: Argument of type 'Envelope[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope[]'.
  Type 'Envelope' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope'.
    Property 'currentBalance' is optional in type 'Envelope' but required in type 'Envelope'.
src/hooks/receipts/useReceiptToTransaction.ts(48,28): error TS2345: Argument of type '(prev: { description: string; amount: number; date: string; envelopeId: string; category: string; type: string; notes: string; }) => { envelopeId: string | number; category: string; description: string; amount: number; date: string; type: string; notes: string; }' is not assignable to parameter of type 'SetStateAction<{ description: string; amount: number; date: string; envelopeId: string; category: string; type: string; notes: string; }>'.
  Type '(prev: { description: string; amount: number; date: string; envelopeId: string; category: string; type: string; notes: string; }) => { envelopeId: string | number; category: string; description: string; amount: number; date: string; type: string; notes: string; }' is not assignable to type '(prevState: { description: string; amount: number; date: string; envelopeId: string; category: string; type: string; notes: string; }) => { description: string; amount: number; date: string; envelopeId: string; category: string; type: string; notes: string; }'.
    Call signature return types '{ envelopeId: string | number; category: string; description: string; amount: number; date: string; type: string; notes: string; }' and '{ description: string; amount: number; date: string; envelopeId: string; category: string; type: string; notes: string; }' are incompatible.
      The types of 'envelopeId' are incompatible between these types.
        Type 'string | number' is not assignable to type 'string'.
          Type 'number' is not assignable to type 'string'.
src/hooks/receipts/useReceiptToTransaction.ts(86,37): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/hooks/receipts/useReceiptToTransaction.ts(101,9): error TS2559: Type 'string' has no properties in common with type '{ url?: string; }'.
src/hooks/settings/useSettingsDashboard.ts(103,60): error TS2339: Property 'cloudSyncEnabled' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/hooks/settings/useSettingsDashboard.ts(104,63): error TS2339: Property 'setCloudSyncEnabled' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/hooks/settings/useSettingsDashboard.ts(109,25): error TS2345: Argument of type 'boolean' is not assignable to parameter of type '(state: StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) => unknown'.
src/hooks/sync/useFirebaseSync.ts(57,46): error TS2339: Property 'budget' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/hooks/sync/useFirebaseSync.ts(129,28): error TS2339: Property 'getActiveUsers' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/sync/useFirebaseSync.ts(129,54): error TS2339: Property 'getRecentActivity' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/sync/useFirebaseSync.ts(133,30): error TS2339: Property 'getActiveUsers' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/sync/useFirebaseSync.ts(134,33): error TS2339: Property 'getRecentActivity' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/transactions/useTransactionFilters.ts(41,29): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'Transaction'.
  Types of property 'envelopeId' are incompatible.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.
src/hooks/transactions/useTransactionFilters.ts(42,29): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'Transaction'.
  Types of property 'envelopeId' are incompatible.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.
src/hooks/transactions/useTransactionFilters.ts(43,33): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'Transaction'.
  Types of property 'envelopeId' are incompatible.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.
src/hooks/transactions/useTransactionFilters.ts(44,29): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'Transaction'.
  Types of property 'envelopeId' are incompatible.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.
src/hooks/transactions/useTransactionFilters.ts(47,43): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'Transaction'.
  Types of property 'envelopeId' are incompatible.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.
src/hooks/transactions/useTransactionImport.ts(78,61): error TS2345: Argument of type 'ImportData' is not assignable to parameter of type 'unknown[] | { data?: unknown[]; }'.
  Type 'ImportData' is missing the following properties from type 'unknown[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionImport.ts(101,44): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type '{ amount: number; }[]'.
  Property 'amount' is missing in type '{}' but required in type '{ amount: number; }'.
src/hooks/transactions/useTransactionLedger.ts(35,5): error TS2345: Argument of type '(state: { setAllTransactions?: (transactions: unknown[]) => void; updateBill?: (bill: unknown) => void; }) => { setAllTransactions: (transactions: unknown[]) => void; updateBill: (bill: unknown) => void; }' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: { setAllTransactions?: (transactions: unknown[]) => void; updateBill?: (bill: unknown) => void; }) => { setAllTransactions: (transactions: unknown[]) => void; updateBill: (bill: unknown) => void; }' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Type '{ setAllTransactions: (transactions: unknown[]) => void; updateBill: (bill: unknown) => void; }' is not assignable to type 'StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
      Type '{ setAllTransactions: (transactions: unknown[]) => void; updateBill: (bill: unknown) => void; }' is missing the following properties from type 'StoreState': biweeklyAllocation, isUnassignedCashModalOpen, paycheckHistory, isActualBalanceManual, and 10 more.
src/hooks/transactions/useTransactionLedger.ts(45,11): error TS2339: Property 'setAllTransactions' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...'.
src/hooks/transactions/useTransactionLedger.ts(45,31): error TS2339: Property 'updateBill' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...'.
src/hooks/transactions/useTransactionLedger.ts(80,5): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction'.
    Types of property 'date' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/transactions/useTransactionLedger.ts(86,5): error TS2322: Type 'string' is not assignable to type '"asc" | "desc"'.
src/hooks/transactions/useTransactionQuery.ts(44,11): error TS2339: Property 'transactions' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...'.
src/hooks/transactions/useTransactionQuery.ts(44,46): error TS2339: Property 'allTransactions' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...'.
src/hooks/transactions/useTransactionQuery.ts(46,7): error TS2345: Argument of type '(state: BudgetStore) => { transactions: Transaction[]; allTransactions: Transaction[]; }' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetStore) => { transactions: Transaction[]; allTransactions: Transaction[]; }' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' is not assignable to type 'BudgetStore'.
src/hooks/transactions/useTransactionsV2.ts(57,5): error TS2345: Argument of type '(state: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): v...' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): v...' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false)...'.
    Type '{ updateTransactions: unknown; }' is not assignable to type 'StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
      Type '{ updateTransactions: unknown; }' is missing the following properties from type 'StoreState': biweeklyAllocation, isUnassignedCashModalOpen, paycheckHistory, isActualBalanceManual, and 10 more.
src/hooks/transactions/useTransactionsV2.ts(58,28): error TS2352: Conversion of type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false): void; (st...'.
src/hooks/transactions/useTransactionsV2.ts(86,19): error TS2339: Property 'updateTransactions' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = ...'.
src/main.tsx(151,55): error TS2339: Property 'length' does not exist on type 'unknown'.
src/main.tsx(152,61): error TS2339: Property 'length' does not exist on type 'unknown'.
src/main.tsx(153,47): error TS2339: Property 'length' does not exist on type 'unknown'.
src/main.tsx(154,47): error TS2339: Property 'length' does not exist on type 'unknown'.
src/main.tsx(160,45): error TS2339: Property 'length' does not exist on type 'unknown'.
src/main.tsx(160,95): error TS2339: Property 'length' does not exist on type 'unknown'.
src/main.tsx(160,141): error TS2339: Property 'length' does not exist on type 'unknown'.
src/main.tsx(160,180): error TS2339: Property 'length' does not exist on type 'unknown'.
src/main.tsx(178,47): error TS2339: Property 'forcePushToCloud' does not exist on type '{ stop: () => void; clearAllData: () => Promise<void>; forcePushData: () => Promise<{ success: boolean; error?: string; }>; }'.
src/main.tsx(197,40): error TS2345: Argument of type 'DexieData' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'DexieData'.
src/main.tsx(205,29): error TS2345: Argument of type 'DexieData' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'DexieData'.
src/main.tsx(207,50): error TS2345: Argument of type 'CloudSyncService' is not assignable to parameter of type '{ stop: () => void; clearAllData: () => Promise<void>; forcePushData: () => Promise<{ success: boolean; error?: string; }>; }'.
  Property 'forcePushData' is missing in type 'CloudSyncService' but required in type '{ stop: () => void; clearAllData: () => Promise<void>; forcePushData: () => Promise<{ success: boolean; error?: string; }>; }'.
src/services/authService.ts(577,32): error TS2352: Conversion of type 'typeof import("/home/runner/work/violet-vault/violet-vault/src/stores/ui/uiStore")' to type '{ useBudgetStore: { getState: () => { cloudSyncEnabled: boolean; startBackgroundSync: () => Promise<void>; }; }; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'useBudgetStore' are incompatible.
    Type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>' is not comparable to type '{ getState: () => { cloudSyncEnabled: boolean; startBackgroundSync: () => Promise<void>; }; }'.
src/services/chunkedSyncService.ts(427,34): error TS2345: Argument of type 'Promise<unknown>[]' is not assignable to parameter of type 'Iterable<void | PromiseLike<void>>'.
  The types returned by '[Symbol.iterator]().next(...)' are incompatible between these types.
    Type 'IteratorResult<Promise<unknown>, any>' is not assignable to type 'IteratorResult<void | PromiseLike<void>, any>'.
      Type 'IteratorYieldResult<Promise<unknown>>' is not assignable to type 'IteratorResult<void | PromiseLike<void>, any>'.
        Type 'IteratorYieldResult<Promise<unknown>>' is not assignable to type 'IteratorYieldResult<void | PromiseLike<void>>'.
          Type 'Promise<unknown>' is not assignable to type 'void | PromiseLike<void>'.
            Type 'Promise<unknown>' is not assignable to type 'PromiseLike<void>'.
              Types of property 'then' are incompatible.
                Type '<TResult1 = unknown, TResult2 = never>(onfulfilled?: (value: unknown) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>) => Promise<...>' is not assignable to type '<TResult1 = void, TResult2 = never>(onfulfilled?: (value: void) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>) => PromiseLike<...>'.
                  Types of parameters 'onfulfilled' and 'onfulfilled' are incompatible.
                    Types of parameters 'value' and 'value' are incompatible.
                      Type 'unknown' is not assignable to type 'void'.
src/services/chunkedSyncService.ts(497,36): error TS2345: Argument of type 'Promise<unknown>[]' is not assignable to parameter of type 'Iterable<void | PromiseLike<void>>'.
  The types returned by '[Symbol.iterator]().next(...)' are incompatible between these types.
    Type 'IteratorResult<Promise<unknown>, any>' is not assignable to type 'IteratorResult<void | PromiseLike<void>, any>'.
      Type 'IteratorYieldResult<Promise<unknown>>' is not assignable to type 'IteratorResult<void | PromiseLike<void>, any>'.
        Type 'IteratorYieldResult<Promise<unknown>>' is not assignable to type 'IteratorYieldResult<void | PromiseLike<void>>'.
          Type 'Promise<unknown>' is not assignable to type 'void | PromiseLike<void>'.
            Type 'Promise<unknown>' is not assignable to type 'PromiseLike<void>'.
              Types of property 'then' are incompatible.
                Type '<TResult1 = unknown, TResult2 = never>(onfulfilled?: (value: unknown) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>) => Promise<...>' is not assignable to type '<TResult1 = void, TResult2 = never>(onfulfilled?: (value: void) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>) => PromiseLike<...>'.
                  Types of parameters 'onfulfilled' and 'onfulfilled' are incompatible.
                    Types of parameters 'value' and 'value' are incompatible.
                      Type 'unknown' is not assignable to type 'void'.
src/services/editLockService.ts(129,51): error TS2345: Argument of type 'LockDocument' is not assignable to parameter of type 'ExistingLock'.
  Property 'userId' is optional in type 'LockDocument' but required in type 'ExistingLock'.
src/stores/ui/uiStore.ts(155,25): error TS2345: Argument of type '(fn: (state: StoreState) => void) => void' is not assignable to parameter of type 'ImmerSet<UiStore>'.
  Types of parameters 'fn' and 'updater' are incompatible.
    Types of parameters 'draft' and 'state' are incompatible.
      Type 'StoreState' is missing the following properties from type 'WritableDraft<UiStore>': setBiweeklyAllocation, openUnassignedCashModal, closeUnassignedCashModal, setPaycheckHistory, and 19 more.
src/stores/ui/uiStore.ts(158,29): error TS2345: Argument of type '(fn: (state: StoreState) => void) => void' is not assignable to parameter of type 'ImmerSet<UiStore>'.
  Types of parameters 'fn' and 'updater' are incompatible.
    Types of parameters 'draft' and 'state' are incompatible.
      Type 'StoreState' is missing the following properties from type 'WritableDraft<UiStore>': setBiweeklyAllocation, openUnassignedCashModal, closeUnassignedCashModal, setPaycheckHistory, and 19 more.
src/stores/ui/uiStore.ts(161,30): error TS2345: Argument of type '(fn: (state: StoreState) => void) => void' is not assignable to parameter of type 'ImmerSet<UiStore>'.
  Types of parameters 'fn' and 'updater' are incompatible.
    Types of parameters 'draft' and 'state' are incompatible.
      Type 'StoreState' is missing the following properties from type 'WritableDraft<UiStore>': setBiweeklyAllocation, openUnassignedCashModal, closeUnassignedCashModal, setPaycheckHistory, and 19 more.
src/stores/ui/uiStore.ts(176,9): error TS2322: Type 'string' is not assignable to type '{ version: string; notes: string[]; fromVersion?: string; toVersion?: string; isUpdate?: boolean; }'.
src/stores/ui/uiStore.ts(223,32): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/stores/ui/uiStore.ts(295,3): error TS2322: Type 'UseBoundStore<WithImmer<Write<StoreApi<StoreState>, StoreSubscribeWithSelector<StoreState>>>>' is not assignable to type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
  Type 'StoreState' is not assignable to type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
    Type 'StoreState' is not assignable to type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; }'.
      Type 'StoreState' provides no match for the signature '(): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
src/stores/ui/uiStore.ts(297,3): error TS2322: Type 'UseBoundStore<WithImmer<Write<WithPersist<WithDevtools<StoreApi<StoreState>>, { biweeklyAllocation: number; paycheckHistory: { id: string; amount: number; date: string; payerName?: string; notes?: string; }[]; ... 7 more ...; showPatchNotes: boolean; }>, StoreSubscribeWithSelector<...>>>>' is not assignable to type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
  Type 'StoreState' is not assignable to type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
    Type 'StoreState' is not assignable to type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; }'.
      Type 'StoreState' provides no match for the signature '(): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
src/stores/ui/uiStore.ts(324,26): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/stores/ui/uiStore.ts(324,71): error TS2339: Property 'setState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/stores/ui/uiStore.ts(325,26): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/stores/ui/uiStore.ts(325,72): error TS2339: Property 'setState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/stores/ui/uiStore.ts(325,82): error TS2345: Argument of type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>' is not assignable to parameter of type '{ getState: () => UiStore; }'.
src/utils/debug/dataDiagnostic.ts(124,84): error TS2339: Property 'count' does not exist on type 'string | number | Dexie | Table<BudgetRecord, string, BudgetRecord> | Table<Envelope, string, Envelope> | ... 76 more ... | { ...; }'.
  Property 'count' does not exist on type 'string'.
src/utils/debug/dataDiagnostic.ts(126,12): error TS2339: Property 'limit' does not exist on type 'string | number | Dexie | Table<BudgetRecord, string, BudgetRecord> | Table<Envelope, string, Envelope> | ... 76 more ... | { ...; }'.
  Property 'limit' does not exist on type 'string'.
src/utils/layout/paycheckDeletionUtils.ts(52,47): error TS2339: Property 'currentBalance' does not exist on type 'unknown'.
src/utils/layout/paycheckDeletionUtils.ts(110,56): error TS2339: Property 'get' does not exist on type '{ delete: (id: string | number) => Promise<void>; }'.
src/utils/layout/paycheckDeletionUtils.ts(126,25): error TS2349: This expression is not callable.
  Type 'unknown[]' has no call signatures.
src/utils/layout/paycheckDeletionUtils.ts(128,55): error TS2339: Property 'envelopes' does not exist on type '{ paycheckHistory: unknown[]; budgetMetadata: unknown[]; }'.
src/utils/layout/paycheckDeletionUtils.ts(132,55): error TS2339: Property 'dashboard' does not exist on type '{ paycheckHistory: unknown[]; budgetMetadata: unknown[]; }'.
src/utils/pwa/patchNotesManager.ts(68,7): error TS2322: Type 'Record<string, unknown>' is not assignable to type 'string'.
src/utils/pwa/patchNotesManager.ts(85,7): error TS2322: Type 'Record<string, unknown>' is not assignable to type 'string'.
src/utils/pwa/patchNotesManager.ts(103,5): error TS2322: Type 'Record<string, unknown>' is not assignable to type 'string'.
src/utils/sync/corruptionRecoveryHelper.ts(48,5): error TS2687: All declarations of 'detectLocalDataDebug' must have identical modifiers.
src/utils/sync/corruptionRecoveryHelper.ts(48,5): error TS2717: Subsequent property declarations must have the same type.  Property 'detectLocalDataDebug' must be of type '() => Promise<unknown>', but here has type '() => Promise<DataDetectionResult>'.
src/utils/sync/corruptionRecoveryHelper.ts(49,5): error TS2687: All declarations of 'hasLocalDataDebug' must have identical modifiers.
src/utils/sync/validation/checksumUtils.ts(23,7): error TS2322: Type 'Uint8Array<ArrayBuffer>' is not assignable to type 'ArrayBuffer'.
  Types of property '[Symbol.toStringTag]' are incompatible.
    Type '"Uint8Array"' is not assignable to type '"ArrayBuffer"'.
src/utils/sync/validation/checksumUtils.ts(32,7): error TS2322: Type 'Uint8Array<ArrayBuffer>' is not assignable to type 'ArrayBuffer'.
  Types of property '[Symbol.toStringTag]' are incompatible.
    Type '"Uint8Array"' is not assignable to type '"ArrayBuffer"'.
```

## Typecheck Strict Mode Audit

### Files with Most Strict Mode Errors
- 17 errors in `src/hooks/auth/authOperations.ts`
- 16 errors in `src/services/bugReport/screenshotService.ts`
- 16 errors in `src/components/automation/steps/ReviewStep.tsx`
- 14 errors in `src/hooks/receipts/useReceiptScanner.ts`
- 14 errors in `src/components/sharing/steps/UserSetupStep.tsx`
- 14 errors in `src/components/pwa/UpdateAvailableModal.tsx`
- 14 errors in `src/components/dashboard/RecentTransactionsWidget.tsx`
- 14 errors in `src/components/dashboard/AccountBalanceOverview.tsx`
- 14 errors in `src/components/budgeting/EnvelopeGrid.tsx`
- 14 errors in `src/components/automation/AutoFundingDashboard.tsx`
- 13 errors in `src/utils/settings/settingsHelpers.ts`
- 13 errors in `src/utils/security/optimizedSerialization.ts`
- 13 errors in `src/hooks/bills/useBillManager.ts`
- 12 errors in `src/utils/pwa/serviceWorkerDiagnostics.ts`
- 12 errors in `src/utils/accounts/accountValidation.ts`
- 12 errors in `src/stores/ui/uiStore.ts`
- 12 errors in `src/main.tsx`
- 12 errors in `src/hooks/settings/useSettingsSectionRenderer.ts`
- 11 errors in `src/db/budgetDb.ts`
- 11 errors in `src/components/bills/BillManager.tsx`
- 10 errors in `src/components/layout/MainLayout.tsx`
- 10 errors in `src/components/bills/modals/BillDetailModal.tsx`
- 9 errors in `src/utils/budgeting/envelopeFormUtils.ts`
- 9 errors in `src/utils/budgeting/autofunding/simulation.ts`
- 9 errors in `src/hooks/debts/useDebts.ts`
- 9 errors in `src/components/transactions/TransactionLedger.tsx`
- 9 errors in `src/components/settings/sections/SyncDebugToolsSection.tsx`
- 9 errors in `src/components/bills/BillManagerModals.tsx`
- 8 errors in `src/hooks/transactions/useTransactionLedger.ts`
- 8 errors in `src/hooks/transactions/helpers/transactionQueryHelpers.ts`
- 8 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution.ts`
- 8 errors in `src/hooks/accounts/useSupplementalAccounts.ts`
- 8 errors in `src/components/layout/ViewRenderer.tsx`
- 8 errors in `src/components/budgeting/SmartEnvelopeSuggestions.tsx`
- 8 errors in `src/components/accounts/SupplementalAccounts.tsx`
- 7 errors in `src/hooks/debts/useDebtManagement.ts`
- 7 errors in `src/hooks/common/useActualBalance.ts`
- 7 errors in `src/components/pwa/PatchNotesModal.tsx`
- 6 errors in `src/services/bugReport/index.ts`
- 6 errors in `src/hooks/budgeting/usePaycheckForm.ts`
- 6 errors in `src/components/transactions/TransactionSplitter.tsx`
- 6 errors in `src/components/modals/QuickFundModal.tsx`
- 6 errors in `src/components/debt/DebtDashboard.tsx`
- 6 errors in `src/components/budgeting/EditEnvelopeModal.tsx`
- 6 errors in `src/App.tsx`
- 5 errors in `src/utils/sync/syncFlowValidator.ts`
- 5 errors in `src/utils/sync/syncEdgeCaseTester.ts`
- 5 errors in `src/utils/pwa/offlineDataValidator.ts`
- 5 errors in `src/utils/layout/paycheckDeletionUtils.ts`
- 5 errors in `src/utils/debug/dataDiagnostic.ts`
- 5 errors in `src/utils/dataManagement/dexieUtils.ts`
- 5 errors in `src/utils/budgeting/envelopeIntegrityChecker.ts`
- 5 errors in `src/utils/budgeting/autofunding/conditions.ts`
- 5 errors in `src/services/security/securityService.ts`
- 5 errors in `src/services/chunkedSyncService.ts`
- 5 errors in `src/services/bugReport/pageDetectionService.ts`
- 5 errors in `src/hooks/transactions/useTransactionSplitter.ts`
- 5 errors in `src/hooks/transactions/useTransactionFilters.ts`
- 5 errors in `src/hooks/transactions/useTransactionData.ts`
- 5 errors in `src/hooks/sync/useManualSync.ts`
- 5 errors in `src/hooks/sync/useFirebaseSync.ts`
- 5 errors in `src/hooks/sharing/useQRCodeProcessing.ts`
- 5 errors in `src/hooks/savings/useSavingsGoals/index.ts`
- 5 errors in `src/hooks/notifications/useFirebaseMessaging.ts`
- 5 errors in `src/hooks/common/useFABActions.ts`
- 5 errors in `src/hooks/common/bug-report/useBugReportHighlight.ts`
- 5 errors in `src/hooks/budgeting/useSmartSuggestions.ts`
- 5 errors in `src/hooks/budgeting/mutations/useTransferFunds.ts`
- 5 errors in `src/hooks/budgeting/mutations/useDeleteEnvelope.ts`
- 5 errors in `src/hooks/bills/useBillManagerHelpers.ts`
- 5 errors in `src/components/transactions/splitter/SplitActions.tsx`
- 5 errors in `src/components/transactions/components/DeleteConfirmation.tsx`
- 5 errors in `src/components/transactions/TransactionTable.tsx`
- 5 errors in `src/components/sync/health/SyncHealthDetails.tsx`
- 5 errors in `src/components/settings/sections/AccountSettingsSection.tsx`
- 5 errors in `src/components/settings/archiving/ArchivingConfiguration.tsx`
- 5 errors in `src/components/settings/SettingsDashboard.tsx`
- 5 errors in `src/components/savings/SavingsGoals.tsx`
- 5 errors in `src/components/receipts/steps/ReceiptDataStep.tsx`
- 5 errors in `src/components/receipts/steps/EnvelopeSelectionStep.tsx`
- 5 errors in `src/components/receipts/components/ReceiptUploadArea.tsx`
- 5 errors in `src/components/receipts/components/ExtractedDataField.tsx`
- 5 errors in `src/components/receipts/ReceiptToTransactionModal.tsx`
- 5 errors in `src/components/receipts/ReceiptButton.tsx`
- 5 errors in `src/components/debt/modals/DebtDetailModal.tsx`
- 4 errors in `src/utils/sync/retryUtils.ts`
- 4 errors in `src/utils/sync/retryPolicies.ts`
- 4 errors in `src/utils/sync/corruptionRecoveryHelper.ts`
- 4 errors in `src/utils/pwa/pwaManager.ts`
- 4 errors in `src/utils/pwa/patchNotesManager.ts`
- 4 errors in `src/utils/icons/index.ts`
- 4 errors in `src/utils/debug/reactErrorDetector.ts`
- 4 errors in `src/utils/bills/billCalculations.ts`
- 4 errors in `src/services/keys/keyManagementService.ts`
- 4 errors in `src/services/bugReport/browserInfoService.ts`
- 4 errors in `src/hooks/transactions/useTransactionsV2.ts`
- 4 errors in `src/hooks/transactions/useTransactionImport.ts`
- 4 errors in `src/hooks/receipts/useReceiptToTransaction.ts`
- 4 errors in `src/hooks/mobile/usePullToRefresh.ts`
- 4 errors in `src/hooks/common/useNetworkStatus.ts`
- 4 errors in `src/hooks/common/useImportData.ts`
- 4 errors in `src/hooks/budgeting/useEnvelopeEdit.ts`
- 4 errors in `src/hooks/budgeting/useBudgetHistoryQuery.ts`
- 4 errors in `src/hooks/budgeting/useBudgetData/queries.ts`
- 4 errors in `src/hooks/budgeting/autofunding/useAutoFunding.ts`
- 4 errors in `src/hooks/bills/useBillValidation.ts`
- 4 errors in `src/hooks/bills/useBillOperationWrappers.ts`
- 4 errors in `src/hooks/auth/useAuthenticationManager.ts`
- 4 errors in `src/hooks/analytics/useReportExporter.ts`
- 4 errors in `src/components/transactions/ledger/TransactionLedgerHeader.tsx`
- 4 errors in `src/components/transactions/import/ImportModal.tsx`
- 4 errors in `src/components/sync/health/SyncStatusIndicator.tsx`
- 4 errors in `src/components/settings/sections/SecurityStatusSection.tsx`
- 4 errors in `src/components/settings/archiving/ArchivingStatusOverview.tsx`
- 4 errors in `src/components/pwa/OfflineStatusIndicator.tsx`
- 4 errors in `src/components/pages/MainDashboard.tsx`
- 4 errors in `src/components/onboarding/hooks/useTutorialHighlight.ts`
- 4 errors in `src/components/onboarding/hooks/useTutorialControls.ts`
- 4 errors in `src/components/layout/AppRoutes.tsx`
- 4 errors in `src/components/history/viewer/HistoryControls.tsx`
- 4 errors in `src/components/history/BudgetHistoryViewer.tsx`
- 4 errors in `src/components/debt/ui/DebtList.tsx`
- 4 errors in `src/components/debt/DebtStrategies.tsx`
- 4 errors in `src/components/budgeting/shared/EnvelopeTypeSelector.tsx`
- 4 errors in `src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx`
- 4 errors in `src/components/budgeting/envelope/EnvelopeItem.tsx`
- 4 errors in `src/components/budgeting/CreateEnvelopeModalComponents.tsx`
- 4 errors in `src/components/budgeting/CreateEnvelopeModal.tsx`
- 4 errors in `src/components/budgeting/BillEnvelopeFundingInfo.tsx`
- 4 errors in `src/components/bills/BulkBillUpdateModal.tsx`
- 4 errors in `src/components/auth/components/UserSetupHeader.tsx`
- 4 errors in `src/components/auth/components/ShareCodeDisplay.tsx`
- 4 errors in `src/components/analytics/tabs/TrendsTab.tsx`
- 3 errors in `src/utils/sync/masterSyncValidator.ts`
- 3 errors in `src/utils/budgeting/paycheckProcessing.ts`
- 3 errors in `src/utils/auth/shareCodeManager.ts`
- 3 errors in `src/utils/analytics/transactionAnalyzer.ts`
- 3 errors in `src/stores/ui/fabStore.ts`
- 3 errors in `src/services/bugReport/contextAnalysisService.ts`
- 3 errors in `src/hooks/transactions/useTransactionQuery.ts`
- 3 errors in `src/hooks/settings/useSettingsDashboard.ts`
- 3 errors in `src/hooks/mobile/useFABSmartPositioning.ts`
- 3 errors in `src/hooks/layout/usePaycheckOperations.ts`
- 3 errors in `src/hooks/common/useDataInitialization.ts`
- 3 errors in `src/hooks/common/useConnectionManager/useConnectionOperations.ts`
- 3 errors in `src/hooks/common/bug-report/useBugReportSubmission.ts`
- 3 errors in `src/hooks/common/bug-report/useBugReportDiagnostics.ts`
- 3 errors in `src/hooks/budgeting/useBudgetData/mutationsHelpers.ts`
- 3 errors in `src/hooks/budgeting/autofunding/useAutoFundingData.ts`
- 3 errors in `src/hooks/auth/useAuthFlow.ts`
- 3 errors in `src/hooks/auth/queries/usePasswordValidation.ts`
- 3 errors in `src/hooks/auth/mutations/usePasswordMutations.ts`
- 3 errors in `src/hooks/auth/mutations/useLoginMutations.ts`
- 3 errors in `src/hooks/analytics/useTransactionAnalysis.ts`
- 3 errors in `src/hooks/analytics/useChartsAnalytics.ts`
- 3 errors in `src/components/transactions/splitter/SplitterHeader.tsx`
- 3 errors in `src/components/transactions/splitter/SplitAllocationsSection.tsx`
- 3 errors in `src/components/transactions/ledger/TransactionPagination.tsx`
- 3 errors in `src/components/sync/ConflictResolutionModal.tsx`
- 3 errors in `src/components/sharing/JoinBudgetModal.tsx`
- 3 errors in `src/components/settings/sections/SecuritySettingsSection.tsx`
- 3 errors in `src/components/settings/archiving/ArchivingPreviewResults.tsx`
- 3 errors in `src/components/security/LocalDataSecurityWarning.tsx`
- 3 errors in `src/components/receipts/components/ReceiptImagePreview.tsx`
- 3 errors in `src/components/receipts/components/ReceiptActionButtons.tsx`
- 3 errors in `src/components/receipts/components/ExtractedItemsList.tsx`
- 3 errors in `src/components/mobile/SlideUpModal.tsx`
- 3 errors in `src/components/layout/SummaryCards.tsx`
- 3 errors in `src/components/history/viewer/IntegrityWarning.tsx`
- 3 errors in `src/components/charts/CategoryBarChart.tsx`
- 3 errors in `src/components/budgeting/suggestions/SuggestionsList.tsx`
- 3 errors in `src/components/budgeting/envelope/EnvelopeHistoryModal.tsx`
- 3 errors in `src/components/budgeting/PaycheckProcessor.tsx`
- 3 errors in `src/components/bills/modals/BillDetailHeader.tsx`
- 3 errors in `src/components/bills/BulkUpdateSummary.tsx`
- 3 errors in `src/components/bills/BillTabs.tsx`
- 3 errors in `src/components/bills/BillTableHeader.tsx`
- 3 errors in `src/components/bills/BillTableEmptyState.tsx`
- 3 errors in `src/components/bills/BillModalHeader.tsx`
- 3 errors in `src/components/bills/AddBillModal.tsx`
- 3 errors in `src/components/automation/steps/RuleTypeStep.tsx`
- 3 errors in `src/components/analytics/tabs/HealthTab.tsx`
- 3 errors in `src/components/analytics/components/AnalyticsHeader.tsx`
- 2 errors in `src/utils/testing/storeTestUtils.ts`
- 2 errors in `src/utils/sync/validation/checksumUtils.ts`
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
- 2 errors in `src/hooks/transactions/useTransactionForm.ts`
- 2 errors in `src/hooks/transactions/useTransactionFileUpload.ts`
- 2 errors in `src/hooks/sharing/useShareCodeValidation.ts`
- 2 errors in `src/hooks/security/useSecuritySettingsLogic.ts`
- 2 errors in `src/hooks/mobile/useFABBehavior.ts`
- 2 errors in `src/hooks/mobile/useBottomNavigation.ts`
- 2 errors in `src/hooks/common/useTransactionArchiving.ts`
- 2 errors in `src/hooks/common/useRouterPageDetection.ts`
- 2 errors in `src/hooks/budgeting/usePaydayPrediction.ts`
- 2 errors in `src/hooks/budgeting/usePaycheckHistory.ts`
- 2 errors in `src/hooks/budgeting/useEnvelopesQuery.ts`
- 2 errors in `src/hooks/budgeting/useBudgetData/utilities.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useUndoOperations.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useExecutionHistory.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useAutoFundingHistory.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionSummary.ts`
- 2 errors in `src/hooks/bills/useBillOperations.ts`
- 2 errors in `src/hooks/auth/useAuthCompatibility.ts`
- 2 errors in `src/hooks/auth/mutations/useProfileMutations.ts`
- 2 errors in `src/hooks/auth/mutations/useJoinBudgetMutation.ts`
- 2 errors in `src/hooks/analytics/utils/pdfGeneratorUtils.ts`
- 2 errors in `src/hooks/analytics/useBillAnalysis.ts`
- 2 errors in `src/hooks/analytics/queries/usePaycheckTrendsQuery.ts`
- 2 errors in `src/contexts/authUtils.ts`
- 2 errors in `src/components/transactions/components/TransactionRow.tsx`
- 2 errors in `src/components/settings/sections/GeneralSettingsSection.tsx`
- 2 errors in `src/components/receipts/steps/ConfirmationStep.tsx`
- 2 errors in `src/components/onboarding/EmptyStateHints.tsx`
- 2 errors in `src/components/modals/UnassignedCashModal.tsx`
- 2 errors in `src/components/mobile/FABActionMenu.tsx`
- 2 errors in `src/components/history/viewer/ChangeDetails.tsx`
- 2 errors in `src/components/debt/DebtDashboardComponents.tsx`
- 2 errors in `src/components/budgeting/paycheck/PaycheckAmountInput.tsx`
- 2 errors in `src/components/budgeting/paycheck/AllocationPreview.tsx`
- 2 errors in `src/components/budgeting/envelope/SwipeIndicatorOverlay.tsx`
- 2 errors in `src/components/budgeting/envelope/EnvelopeModalHeader.tsx`
- 2 errors in `src/components/budgeting/EditEnvelopeModalComponents.tsx`
- 2 errors in `src/components/bills/smartBillMatcherHelpers.ts`
- 2 errors in `src/components/bills/SmartBillMatcher.tsx`
- 2 errors in `src/components/bills/BulkUpdateModeSelector.tsx`
- 2 errors in `src/components/bills/BulkUpdateEditor.tsx`
- 2 errors in `src/components/bills/BulkUpdateBillRow.tsx`
- 2 errors in `src/components/bills/BillFormFields.tsx`
- 2 errors in `src/components/automation/tabs/HistoryTab.tsx`
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
- 1 errors in `src/utils/sync/SyncQueue.ts`
- 1 errors in `src/utils/stores/createSafeStore.ts`
- 1 errors in `src/utils/query/prefetchHelpers.ts`
- 1 errors in `src/utils/query/backgroundSyncService.ts`
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
- 1 errors in `src/services/authService.ts`
- 1 errors in `src/services/activityLogger.ts`
- 1 errors in `src/hooks/sync/useSyncHealthIndicator.ts`
- 1 errors in `src/hooks/mobile/useSlideUpModal.ts`
- 1 errors in `src/hooks/debts/useDebtModalLogic.ts`
- 1 errors in `src/hooks/debts/useDebtDashboard.ts`
- 1 errors in `src/hooks/dashboard/useMainDashboard.ts`
- 1 errors in `src/hooks/common/useTransactions.ts`
- 1 errors in `src/hooks/common/usePrompt.ts`
- 1 errors in `src/hooks/common/useConnectionManager/useConnectionConfig.ts`
- 1 errors in `src/hooks/common/useBugReport.ts`
- 1 errors in `src/hooks/budgeting/usePaycheckFormValidated.ts`
- 1 errors in `src/hooks/budgeting/useEnvelopes.ts`
- 1 errors in `src/hooks/budgeting/useBudgetData/queryFunctions.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts`
- 1 errors in `src/hooks/bills/useBulkBillOperations.ts`
- 1 errors in `src/hooks/bills/useBills/index.ts`
- 1 errors in `src/hooks/bills/useBillManagerUI.ts`
- 1 errors in `src/hooks/bills/useBillManagerDisplayLogic.ts`
- 1 errors in `src/hooks/auth/useKeyManagementUI.ts`
- 1 errors in `src/hooks/auth/useKeyManagement.ts`
- 1 errors in `src/hooks/auth/useAuthManager.ts`
- 1 errors in `src/hooks/analytics/utils/csvImageExportUtils.ts`
- 1 errors in `src/hooks/analytics/useTransactionFiltering.ts`
- 1 errors in `src/hooks/analytics/useAnalyticsIntegration.ts`
- 1 errors in `src/components/transactions/splitter/SplitTotals.tsx`
- 1 errors in `src/components/settings/sections/NotificationSettingsSection.tsx`
- 1 errors in `src/components/settings/archiving/ArchivingResult.tsx`
- 1 errors in `src/components/settings/SecuritySettings.tsx`
- 1 errors in `src/components/security/LockScreen.tsx`
- 1 errors in `src/components/receipts/components/ReceiptScannerHeader.tsx`
- 1 errors in `src/components/receipts/components/ReceiptExtractedData.tsx`
- 1 errors in `src/components/onboarding/hooks/useTutorialSteps.ts`
- 1 errors in `src/components/monitoring/HighlightLoader.tsx`
- 1 errors in `src/components/layout/AppWrapper.tsx`
- 1 errors in `src/components/history/viewer/HistoryStatistics.tsx`
- 1 errors in `src/components/history/viewer/HistoryHeader.tsx`
- 1 errors in `src/components/history/ObjectHistoryViewer.tsx`
- 1 errors in `src/components/history/IntegrityStatusIndicatorHelpers.tsx`
- 1 errors in `src/components/history/IntegrityStatusIndicator.tsx`
- 1 errors in `src/components/debt/ui/DebtSummaryCards.tsx`
- 1 errors in `src/components/debt/ui/DebtProgressBar.tsx`
- 1 errors in `src/components/debt/ui/DebtCardProgressBar.tsx`
- 1 errors in `src/components/debt/modals/DebtFormFields.tsx`
- 1 errors in `src/components/debt/modals/AddDebtModal.tsx`
- 1 errors in `src/components/charts/TrendLineChart.tsx`
- 1 errors in `src/components/budgeting/shared/BillConnectionSelector.tsx`
- 1 errors in `src/components/budgeting/envelope/UnassignedCashEnvelope.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeSummary.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeGridView.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeActivitySummary.tsx`
- 1 errors in `src/components/budgeting/CashFlowSummary.tsx`
- 1 errors in `src/components/bills/modals/BulkUpdateConfirmModal.tsx`
- 1 errors in `src/components/bills/modals/BillDetailStats.tsx`
- 1 errors in `src/components/bills/modals/BillDetailSections.tsx`
- 1 errors in `src/components/bills/BulkUpdateBillRowComponents.tsx`
- 1 errors in `src/components/bills/BillFormSections.tsx`
- 1 errors in `src/components/bills/BillDiscoveryModal.tsx`
- 1 errors in `src/components/automation/steps/config/SplitRemainderConfig.tsx`
- 1 errors in `src/components/automation/AutoFundingView.tsx`
- 1 errors in `src/components/automation/AutoFundingRuleBuilder.tsx`
- 1 errors in `src/components/auth/key-management/MainContent.tsx`
- 1 errors in `src/components/auth/components/UserSetupLayout.tsx`
- 1 errors in `src/components/auth/UserSetup.tsx`
- 1 errors in `src/components/auth/KeyManagementSettings.tsx`
- 1 errors in `src/components/analytics/TrendAnalysisCharts.tsx`
- 1 errors in `src/components/analytics/SmartCategoryManager.tsx`
- 1 errors in `src/components/analytics/ReportExporter.tsx`
- 1 errors in `src/components/analytics/CategorySuggestionsTab.tsx`

### Strict Mode Error Breakdown
| Count | Error Code |
|---|---|
| 236 | `TS2345` |
| 231 | `TS2322` |
| 205 | `TS7031` |
| 184 | `TS7006` |
| 123 | `TS2339` |
| 53 | `TS18046` |
| 35 | `TS18048` |
| 33 | `TS2769` |
| 25 | `TS7053` |
| 22 | `TS18047` |
| 10 | `TS2719` |
| 10 | `TS2352` |
| 7 | `TS7005` |
| 7 | `TS2774` |
| 6 | `TS7034` |
| 5 | `TS2717` |
| 4 | `TS2739` |
| 4 | `TS2687` |
| 3 | `TS2783` |
| 3 | `TS2722` |
| 2 | `TS7022` |
| 2 | `TS2740` |
| 2 | `TS2554` |
| 2 | `TS2538` |
| 2 | `TS2531` |
| 2 | `TS2353` |
| 2 | `TS2349` |
| 1 | `TS7023` |
| 1 | `TS7019` |
| 1 | `TS7016` |
| 1 | `TS6196` |
| 1 | `TS6133` |
| 1 | `TS2741` |
| 1 | `TS2698` |
| 1 | `TS2683` |
| 1 | `TS2365` |

### Detailed Strict Mode Report
```
src/App.tsx(29,20): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/App.tsx(30,28): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/App.tsx(31,42): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/App.tsx(33,27): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/App.tsx(36,27): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/App.tsx(63,25): error TS2322: Type 'CloudSyncService' is not assignable to type 'FirebaseSyncService'.
  Types of property 'start' are incompatible.
    Type '(config: SyncConfig) => void' is not assignable to type '(config: unknown) => void'.
      Types of parameters 'config' and 'config' are incompatible.
        Type 'unknown' is not assignable to type 'SyncConfig'.
src/components/accounts/SupplementalAccounts.tsx(90,5): error TS2322: Type 'unknown' is not assignable to type '(account: Account) => void'.
src/components/accounts/SupplementalAccounts.tsx(91,5): error TS2322: Type 'unknown' is not assignable to type '(account: Account) => void'.
src/components/accounts/SupplementalAccounts.tsx(92,5): error TS2322: Type 'unknown' is not assignable to type '(accountId: string) => void'.
src/components/accounts/SupplementalAccounts.tsx(93,5): error TS2322: Type 'unknown' is not assignable to type '(transfer: { accountId: string; envelopeId: string; amount: number; description: string; }) => void'.
src/components/accounts/SupplementalAccounts.tsx(129,11): error TS2719: Type '(account: Account) => void' is not assignable to type '(account: Account) => void'. Two different types with this name exist, but they are unrelated.
  Types of parameters 'account' and 'account' are incompatible.
    Type 'Account' is not assignable to type 'Account'. Two different types with this name exist, but they are unrelated.
      Types of property 'id' are incompatible.
        Type 'string | number' is not assignable to type 'string'.
          Type 'number' is not assignable to type 'string'.
src/components/accounts/SupplementalAccounts.tsx(130,11): error TS2322: Type '(accountId: string) => Promise<void>' is not assignable to type '(accountId: string | number) => void'.
  Types of parameters 'accountId' and 'accountId' are incompatible.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.
src/components/accounts/SupplementalAccounts.tsx(131,11): error TS2322: Type '(account: TransferringAccount) => void' is not assignable to type '(account: Account) => void'.
  Types of parameters 'account' and 'account' are incompatible.
    Type 'Account' is not assignable to type 'TransferringAccount'.
      Types of property 'id' are incompatible.
        Type 'string | number' is not assignable to type 'string'.
          Type 'number' is not assignable to type 'string'.
src/components/accounts/SupplementalAccounts.tsx(154,9): error TS2719: Type 'TransferringAccount | null' is not assignable to type 'TransferringAccount | null'. Two different types with this name exist, but they are unrelated.
  Property 'currentBalance' is missing in type 'TransferringAccount' but required in type 'TransferringAccount'.
src/components/analytics/AnalyticsDashboard.tsx(169,5): error TS2322: Type 'unknown[]' is not assignable to type 'never[]'.
  Type 'unknown' is not assignable to type 'never'.
src/components/analytics/AnalyticsDashboard.tsx(170,5): error TS2322: Type 'NormalizedEnvelope[]' is not assignable to type 'never[]'.
  Type 'NormalizedEnvelope' is not assignable to type 'never'.
src/components/analytics/CategorySuggestionsTab.tsx(93,32): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/analytics/ReportExporter.tsx(107,15): error TS2322: Type '{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; } | null; }' is not assignable to type 'Record<string, boolean>'.
  Property 'customDateRange' is incompatible with index signature.
    Type '{ start: string; end: string; } | null' is not assignable to type 'boolean'.
      Type 'null' is not assignable to type 'boolean'.
src/components/analytics/SmartCategoryManager.tsx(120,9): error TS2322: Type '(tabId: CategoryTabId) => void' is not assignable to type '(tabId: string) => void'.
  Types of parameters 'tabId' and 'tabId' are incompatible.
    Type 'string' is not assignable to type 'CategoryTabId'.
src/components/analytics/TrendAnalysisCharts.tsx(47,22): error TS2322: Type 'SpendingVelocity[]' is not assignable to type 'never[]'.
  Type 'SpendingVelocity' is not assignable to type 'never'.
src/components/analytics/components/AnalyticsHeader.tsx(9,28): error TS7031: Binding element 'dateRange' implicitly has an 'any' type.
src/components/analytics/components/AnalyticsHeader.tsx(9,39): error TS7031: Binding element 'handleDateRangeChange' implicitly has an 'any' type.
src/components/analytics/components/AnalyticsHeader.tsx(9,62): error TS7031: Binding element 'handleExport' implicitly has an 'any' type.
src/components/analytics/components/TabContent.tsx(86,32): error TS2322: Type 'AnalyticsData | null | undefined' is not assignable to type 'AnalyticsData'.
  Type 'undefined' is not assignable to type 'AnalyticsData'.
src/components/analytics/components/TabContent.tsx(86,62): error TS2322: Type 'Record<string, unknown> | null | undefined' is not assignable to type 'BalanceData'.
  Type 'undefined' is not assignable to type 'BalanceData'.
src/components/analytics/tabs/HealthTab.tsx(7,22): error TS7031: Binding element 'envelopeHealth' implicitly has an 'any' type.
src/components/analytics/tabs/HealthTab.tsx(7,38): error TS7031: Binding element 'budgetVsActual' implicitly has an 'any' type.
src/components/analytics/tabs/HealthTab.tsx(18,21): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/components/analytics/tabs/OverviewTab.tsx(7,24): error TS7031: Binding element 'monthlyTrends' implicitly has an 'any' type.
src/components/analytics/tabs/OverviewTab.tsx(7,39): error TS7031: Binding element 'envelopeSpending' implicitly has an 'any' type.
src/components/analytics/tabs/TrendsTab.tsx(8,22): error TS7031: Binding element 'chartType' implicitly has an 'any' type.
src/components/analytics/tabs/TrendsTab.tsx(8,33): error TS7031: Binding element 'handleChartTypeChange' implicitly has an 'any' type.
src/components/analytics/tabs/TrendsTab.tsx(8,56): error TS7031: Binding element 'monthlyTrends' implicitly has an 'any' type.
src/components/analytics/tabs/TrendsTab.tsx(8,71): error TS7031: Binding element 'weeklyPatterns' implicitly has an 'any' type.
src/components/auth/KeyManagementSettings.tsx(166,11): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/components/auth/UserIndicator.tsx(71,23): error TS2349: This expression is not callable.
  Type 'never' has no call signatures.
src/components/auth/UserIndicator.tsx(116,11): error TS2322: Type '((updates: { [key: string]: unknown; userName: string; userColor: string; budgetId?: string | undefined; }) => Promise<void>) | undefined' is not assignable to type '(updates: Record<string, unknown>) => void | Promise<void>'.
  Type 'undefined' is not assignable to type '(updates: Record<string, unknown>) => void | Promise<void>'.
src/components/auth/UserSetup.tsx(115,17): error TS2322: Type '(e: FormEvent) => Promise<void>' is not assignable to type '() => void'.
  Target signature provides too few arguments. Expected 1 or more, but got 0.
src/components/auth/components/ShareCodeDisplay.tsx(10,29): error TS7031: Binding element 'shareCode' implicitly has an 'any' type.
src/components/auth/components/ShareCodeDisplay.tsx(10,40): error TS7031: Binding element 'onCreateBudget' implicitly has an 'any' type.
src/components/auth/components/ShareCodeDisplay.tsx(10,56): error TS7031: Binding element 'onBack' implicitly has an 'any' type.
src/components/auth/components/ShareCodeDisplay.tsx(10,64): error TS7031: Binding element 'isLoading' implicitly has an 'any' type.
src/components/auth/components/UserNameInput.tsx(7,3): error TS7031: Binding element 'value' implicitly has an 'any' type.
src/components/auth/components/UserNameInput.tsx(8,3): error TS7031: Binding element 'onChange' implicitly has an 'any' type.
src/components/auth/components/UserSetupHeader.tsx(9,28): error TS7031: Binding element 'step' implicitly has an 'any' type.
src/components/auth/components/UserSetupHeader.tsx(9,34): error TS7031: Binding element 'isReturningUser' implicitly has an 'any' type.
src/components/auth/components/UserSetupHeader.tsx(9,51): error TS7031: Binding element 'userName' implicitly has an 'any' type.
src/components/auth/components/UserSetupHeader.tsx(9,61): error TS7031: Binding element 'userColor' implicitly has an 'any' type.
src/components/auth/components/UserSetupLayout.tsx(6,28): error TS7031: Binding element 'children' implicitly has an 'any' type.
src/components/auth/key-management/MainContent.tsx(116,9): error TS2322: Type 'string | null' is not assignable to type 'string'.
  Type 'null' is not assignable to type 'string'.
src/components/automation/AutoFundingDashboard.tsx(13,33): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboard.tsx(13,41): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboard.tsx(14,53): error TS2339: Property 'envelopes' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/components/automation/AutoFundingDashboard.tsx(33,27): error TS7006: Parameter 'rule' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboard.tsx(38,33): error TS7006: Parameter 'ruleData' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboard.tsx(41,32): error TS2339: Property 'id' does not exist on type 'never'.
src/components/automation/AutoFundingDashboard.tsx(49,55): error TS18046: 'error' is of type 'unknown'.
src/components/automation/AutoFundingDashboard.tsx(53,35): error TS7006: Parameter 'ruleId' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboard.tsx(67,59): error TS18046: 'error' is of type 'unknown'.
src/components/automation/AutoFundingDashboard.tsx(72,29): error TS7006: Parameter 'ruleId' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboard.tsx(109,59): error TS18046: 'error' is of type 'unknown'.
src/components/automation/AutoFundingDashboard.tsx(141,15): error TS2322: Type 'Dispatch<SetStateAction<null>>' is not assignable to type '(show: string | null) => void'.
  Types of parameters 'value' and 'show' are incompatible.
    Type 'string | null' is not assignable to type 'SetStateAction<null>'.
      Type 'string' is not assignable to type 'SetStateAction<null>'.
src/components/automation/AutoFundingDashboard.tsx(149,15): error TS2322: Type 'FC<HistoryTabProps>' is not assignable to type 'ComponentType<HistoryTabProps>'.
  Type 'React.FunctionComponent<HistoryTabProps>' is not assignable to type 'React.FunctionComponent<HistoryTabProps>'. Two different types with this name exist, but they are unrelated.
    Type 'HistoryTabProps' is not assignable to type 'HistoryTabProps'. Two different types with this name exist, but they are unrelated.
      Types of property 'executionHistory' are incompatible.
        Type 'ExecutionHistoryEntry[]' is not assignable to type 'Execution[]'.
          Property 'success' is missing in type 'ExecutionHistoryEntry' but required in type 'Execution'.
src/components/automation/AutoFundingDashboard.tsx(162,9): error TS2322: Type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to type 'unknown[]'.
src/components/automation/AutoFundingRuleBuilder.tsx(158,9): error TS2322: Type '(envelopeId: string) => void' is not assignable to type '(envelopeId: string | number) => void'.
  Types of parameters 'envelopeId' and 'envelopeId' are incompatible.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.
src/components/automation/AutoFundingView.tsx(120,11): error TS2322: Type 'FC<HistoryTabProps>' is not assignable to type 'ComponentType<{ executionHistory: unknown[]; showExecutionDetails: string | null; onToggleDetails: (show: string | null) => void; }>'.
  Type 'FunctionComponent<HistoryTabProps>' is not assignable to type 'FunctionComponent<{ executionHistory: unknown[]; showExecutionDetails: string | null; onToggleDetails: (show: string | null) => void; }>'.
    Type '{ executionHistory: unknown[]; showExecutionDetails: string | null; onToggleDetails: (show: string | null) => void; }' is not assignable to type 'HistoryTabProps'.
      Types of property 'executionHistory' are incompatible.
        Type 'unknown[]' is not assignable to type 'Execution[]'.
          Type 'unknown' is not assignable to type 'Execution'.
src/components/automation/components/StepNavigation.tsx(4,27): error TS7031: Binding element 'currentStep' implicitly has an 'any' type.
src/components/automation/components/StepNavigation.tsx(4,40): error TS7031: Binding element 'onStepChange' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(6,27): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(17,30): error TS7006: Parameter 'trigger' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(28,21): error TS7031: Binding element 'label' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(28,28): error TS7031: Binding element 'value' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(36,24): error TS7031: Binding element 'amount' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(43,28): error TS7031: Binding element 'percentage' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(50,30): error TS7031: Binding element 'targetId' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(50,40): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(53,38): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(58,33): error TS7031: Binding element 'targetIds' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(58,44): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(65,25): error TS7006: Parameter 'id' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(66,44): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(82,31): error TS7031: Binding element 'description' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(93,23): error TS7031: Binding element 'ruleData' implicitly has an 'any' type.
src/components/automation/steps/ReviewStep.tsx(93,33): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/automation/steps/RuleTypeStep.tsx(5,25): error TS7031: Binding element 'ruleData' implicitly has an 'any' type.
src/components/automation/steps/RuleTypeStep.tsx(5,35): error TS7031: Binding element 'updateRuleData' implicitly has an 'any' type.
src/components/automation/steps/RuleTypeStep.tsx(5,51): error TS7031: Binding element 'errors' implicitly has an 'any' type.
src/components/automation/steps/TriggerScheduleStep.tsx(5,32): error TS7031: Binding element 'ruleData' implicitly has an 'any' type.
src/components/automation/steps/TriggerScheduleStep.tsx(5,42): error TS7031: Binding element 'updateRuleData' implicitly has an 'any' type.
src/components/automation/steps/config/SplitRemainderConfig.tsx(35,68): error TS2345: Argument of type 'string | number' is not assignable to parameter of type 'string'.
  Type 'number' is not assignable to type 'string'.
src/components/automation/tabs/HistoryTab.tsx(134,30): error TS2339: Property 'error' does not exist on type 'Execution'.
src/components/automation/tabs/HistoryTab.tsx(136,58): error TS2339: Property 'error' does not exist on type 'Execution'.
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
src/components/bills/BillManager.tsx(105,5): error TS2719: Type 'Envelope[]' is not assignable to type 'Envelope[]'. Two different types with this name exist, but they are unrelated.
  Type 'Envelope' is not assignable to type 'Envelope'. Two different types with this name exist, but they are unrelated.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/bills/BillManager.tsx(143,5): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: unknown) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'unknown' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(144,5): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: unknown) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'unknown' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(171,9): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/bills/BillManager.tsx(182,9): error TS2322: Type '{ id: string; label: string; count: number; icon: string; color: string; }[]' is not assignable to type 'Tab[]'.
  Type '{ id: string; label: string; count: number; icon: string; color: string; }' is not assignable to type 'Tab'.
    Types of property 'icon' are incompatible.
      Type 'string' is not assignable to type 'ComponentType<{ className?: string | undefined; }> | undefined'.
src/components/bills/BillManager.tsx(198,9): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: BillEntity) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillEntity' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(220,9): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: BillEntity | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillEntity | null' is not assignable to type 'BillRecord | null'.
      Type 'BillEntity' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(221,9): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: BillEntity | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillEntity | null' is not assignable to type 'BillRecord | null'.
      Type 'BillEntity' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(226,9): error TS2322: Type '(updatedBills: Bill[]) => Promise<void>' is not assignable to type '(updates: BillEntity[]) => Promise<void>'.
  Types of parameters 'updatedBills' and 'updates' are incompatible.
    Type 'BillEntity[]' is not assignable to type 'Bill[]'.
      Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, category, color
src/components/bills/BillManager.tsx(227,9): error TS2322: Type '(billsToAdd: Bill[]) => Promise<void>' is not assignable to type '(bills: BillEntity[]) => Promise<void>'.
  Types of parameters 'billsToAdd' and 'bills' are incompatible.
    Type 'BillEntity[]' is not assignable to type 'Bill[]'.
      Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, category, color
src/components/bills/BillManager.tsx(229,9): error TS2322: Type '((error: string) => void) | undefined' is not assignable to type '(error: string) => void'.
  Type 'undefined' is not assignable to type '(error: string) => void'.
src/components/bills/BillManagerModals.tsx(115,11): error TS2322: Type '(billId: string, deleteEnvelope?: boolean | undefined) => Promise<void>' is not assignable to type '(id: unknown, deleteEnvelope?: boolean | undefined) => void | Promise<void>'.
  Types of parameters 'billId' and 'id' are incompatible.
    Type 'unknown' is not assignable to type 'string'.
src/components/bills/BillManagerModals.tsx(149,11): error TS2322: Type 'BillEntity' is not assignable to type 'Bill | null'.
  Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, category, color
src/components/bills/BillManagerModals.tsx(152,11): error TS2322: Type '(billId: string, deleteEnvelope?: boolean | undefined) => Promise<void>' is not assignable to type '(bill: Bill) => void | Promise<void>'.
  Types of parameters 'billId' and 'bill' are incompatible.
    Type 'Bill' is not assignable to type 'string'.
src/components/bills/BillManagerModals.tsx(154,13): error TS2322: Type 'Promise<unknown>' is not assignable to type 'void | Promise<void>'.
  Type 'Promise<unknown>' is not assignable to type 'Promise<void>'.
    Type 'unknown' is not assignable to type 'void'.
src/components/bills/BillManagerModals.tsx(154,42): error TS2345: Argument of type 'Bill' is not assignable to parameter of type 'string'.
src/components/bills/BillManagerModals.tsx(155,35): error TS2339: Property 'amount' does not exist on type 'number'.
src/components/bills/BillManagerModals.tsx(156,37): error TS2339: Property 'paidDate' does not exist on type 'number'.
src/components/bills/BillManagerModals.tsx(159,11): error TS2322: Type '(bill: BillEntity) => void' is not assignable to type '(bill: Bill) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'Bill' is not assignable to type 'BillEntity'.
      Type 'Bill' is not assignable to type 'Record<string, unknown>'.
        Index signature for type 'string' is missing in type 'Bill'.
src/components/bills/BillManagerModals.tsx(163,11): error TS2322: Type '(bill: BillEntity) => void' is not assignable to type '(bill: Bill) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'Bill' is not assignable to type 'BillEntity'.
      Type 'Bill' is not assignable to type 'Record<string, unknown>'.
        Index signature for type 'string' is missing in type 'Bill'.
src/components/bills/BillModalHeader.tsx(10,28): error TS7031: Binding element 'editingBill' implicitly has an 'any' type.
src/components/bills/BillModalHeader.tsx(10,41): error TS7031: Binding element 'formData' implicitly has an 'any' type.
src/components/bills/BillModalHeader.tsx(10,51): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/bills/BillTableEmptyState.tsx(8,32): error TS7031: Binding element 'viewMode' implicitly has an 'any' type.
src/components/bills/BillTableEmptyState.tsx(8,42): error TS7031: Binding element 'filteredBills' implicitly has an 'any' type.
src/components/bills/BillTableEmptyState.tsx(8,57): error TS7031: Binding element 'categorizedBills' implicitly has an 'any' type.
src/components/bills/BillTableHeader.tsx(9,28): error TS7031: Binding element 'selectionState' implicitly has an 'any' type.
src/components/bills/BillTableHeader.tsx(9,44): error TS7031: Binding element 'clearSelection' implicitly has an 'any' type.
src/components/bills/BillTableHeader.tsx(9,60): error TS7031: Binding element 'selectAllBills' implicitly has an 'any' type.
src/components/bills/BillTabs.tsx(5,21): error TS7031: Binding element 'activeTab' implicitly has an 'any' type.
src/components/bills/BillTabs.tsx(5,32): error TS7031: Binding element 'onTabChange' implicitly has an 'any' type.
src/components/bills/BillTabs.tsx(5,45): error TS7031: Binding element 'bills' implicitly has an 'any' type.
src/components/bills/BulkBillUpdateModal.tsx(40,25): error TS2345: Argument of type 'Bill[]' is not assignable to parameter of type '{ id: string; name: string; dueDate: string | Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; lastModified: number; frequency?: "monthly" | "quarterly" | "annually" | undefined; envelopeId?: string | undefined; createdAt?: number | undefined; description?: string | undefined; paymentMe...'.
  Type 'Bill' is missing the following properties from type '{ id: string; name: string; dueDate: string | Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; lastModified: number; frequency?: "monthly" | "quarterly" | "annually" | undefined; envelopeId?: string | undefined; createdAt?: number | undefined; description?: string | undefined; paymentMe...': isRecurring, lastModified
src/components/bills/BulkBillUpdateModal.tsx(70,17): error TS18046: 'error' is of type 'unknown'.
src/components/bills/BulkBillUpdateModal.tsx(111,17): error TS2322: Type '(billId: string, field: BillField, value: string | number) => void' is not assignable to type '(billId: string, field: string, value: string | number) => void'.
  Types of parameters 'field' and 'field' are incompatible.
    Type 'string' is not assignable to type 'BillField'.
src/components/bills/BulkBillUpdateModal.tsx(112,17): error TS2322: Type '(field: BillField, value: string | number) => void' is not assignable to type '(field: string, value: string | number) => void'.
  Types of parameters 'field' and 'field' are incompatible.
    Type 'string' is not assignable to type 'BillField'.
src/components/bills/BulkUpdateBillRow.tsx(59,19): error TS2739: Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, category, color
src/components/bills/BulkUpdateBillRow.tsx(65,15): error TS2719: Type 'AmountChange' is not assignable to type 'AmountChange'. Two different types with this name exist, but they are unrelated.
  Types of property 'original' are incompatible.
    Type 'string' is not assignable to type 'number'.
src/components/bills/BulkUpdateBillRowComponents.tsx(90,70): error TS2339: Property 'description' does not exist on type 'Bill'.
src/components/bills/BulkUpdateEditor.tsx(94,15): error TS2322: Type 'Bill' is not assignable to type 'BillEntity'.
  Type 'Bill' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type 'Bill'.
src/components/bills/BulkUpdateEditor.tsx(96,15): error TS2322: Type 'string' is not assignable to type 'UpdateMode'.
src/components/bills/BulkUpdateModeSelector.tsx(9,35): error TS7031: Binding element 'updateMode' implicitly has an 'any' type.
src/components/bills/BulkUpdateModeSelector.tsx(9,47): error TS7031: Binding element 'setUpdateMode' implicitly has an 'any' type.
src/components/bills/BulkUpdateSummary.tsx(9,30): error TS7031: Binding element 'summary' implicitly has an 'any' type.
src/components/bills/BulkUpdateSummary.tsx(9,39): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/bills/BulkUpdateSummary.tsx(9,48): error TS7031: Binding element 'handleSubmit' implicitly has an 'any' type.
src/components/bills/SmartBillMatcher.tsx(32,23): error TS2352: Conversion of type 'Suggestion[]' to type 'Suggestion[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Suggestion' is not comparable to type 'Suggestion'.
    Types of property 'envelope' are incompatible.
      Type 'Envelope' is not comparable to type 'Envelope'.
        Index signature for type 'string' is missing in type 'Envelope'.
src/components/bills/SmartBillMatcher.tsx(32,47): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Bill[]'.
  Type 'unknown' is not assignable to type 'Bill'.
src/components/bills/modals/BillDetailHeader.tsx(10,36): error TS7031: Binding element 'bill' implicitly has an 'any' type.
src/components/bills/modals/BillDetailHeader.tsx(10,42): error TS7031: Binding element 'statusInfo' implicitly has an 'any' type.
src/components/bills/modals/BillDetailHeader.tsx(10,54): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/bills/modals/BillDetailModal.tsx(1,17): error TS6133: 'FormEvent' is declared but its value is never read.
src/components/bills/modals/BillDetailModal.tsx(48,23): error TS2322: Type 'Bill | null' is not assignable to type 'Bill'.
  Type 'null' is not assignable to type 'Bill'.
src/components/bills/modals/BillDetailModal.tsx(48,29): error TS2322: Type '(bill: Bill) => void | Promise<void>' is not assignable to type '(billId: string) => void'.
  Types of parameters 'bill' and 'billId' are incompatible.
    Type 'string' is not assignable to type 'Bill'.
src/components/bills/modals/BillDetailModal.tsx(48,39): error TS2322: Type '(bill: Bill, amount: number) => void | Promise<void>' is not assignable to type '(billId: string, paymentData: PaymentData) => void'.
  Types of parameters 'bill' and 'billId' are incompatible.
    Type 'string' is not assignable to type 'Bill'.
src/components/bills/modals/BillDetailModal.tsx(48,60): error TS2322: Type '(bill: import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill) => void' is not assignable to type '(bill: import("/home/runner/work/violet-vault/violet-vault/src/db/types").Bill) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Property 'color' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Bill' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill'.
src/components/bills/modals/BillDetailModal.tsx(48,68): error TS2322: Type '(bill: import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill) => void' is not assignable to type '(bill: import("/home/runner/work/violet-vault/violet-vault/src/db/types").Bill) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Property 'color' is missing in type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Bill' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill'.
src/components/bills/modals/BillDetailModal.tsx(54,44): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/bills/modals/BillDetailModal.tsx(83,44): error TS2339: Property 'nextDueDate' does not exist on type 'Bill'.
src/components/bills/modals/BillDetailModal.tsx(90,34): error TS2339: Property 'nextDueDate' does not exist on type 'Bill'.
src/components/bills/modals/BillDetailModal.tsx(131,11): error TS2322: Type '(e: FormEvent<HTMLFormElement>) => Promise<void>' is not assignable to type '(e: FormEvent<Element>) => void | Promise<void>'.
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
src/components/budgeting/BillEnvelopeFundingInfo.tsx(8,30): error TS7006: Parameter 'progress' implicitly has an 'any' type.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(16,28): error TS7006: Parameter 'days' implicitly has an 'any' type.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(103,47): error TS18048: 'nextBill.amount' is possibly 'undefined'.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(301,11): error TS2322: Type '{ id: string; name: string; amount: number; dueDate: string; category?: string | undefined; frequency: string; } | null | undefined' is not assignable to type '{ amount: number; frequency?: string | undefined; } | undefined'.
  Type 'null' is not assignable to type '{ amount: number; frequency?: string | undefined; } | undefined'.
src/components/budgeting/CashFlowSummary.tsx(4,28): error TS7031: Binding element 'cashFlow' implicitly has an 'any' type.
src/components/budgeting/CreateEnvelopeModal.tsx(57,5): error TS2322: Type 'unknown[]' is not assignable to type 'Record<string, unknown>[]'.
  Type 'unknown' is not assignable to type 'Record<string, unknown>'.
src/components/budgeting/CreateEnvelopeModal.tsx(58,5): error TS2322: Type '(envelope: unknown) => void' is not assignable to type '(data: unknown) => Promise<void>'.
  Type 'void' is not assignable to type 'Promise<void>'.
src/components/budgeting/CreateEnvelopeModal.tsx(104,13): error TS2719: Type 'Bill[]' is not assignable to type 'Bill[]'. Two different types with this name exist, but they are unrelated.
  Type 'Bill' is not assignable to type 'Bill'. Two different types with this name exist, but they are unrelated.
    Types of property 'name' are incompatible.
      Type 'string | undefined' is not assignable to type 'string'.
        Type 'undefined' is not assignable to type 'string'.
src/components/budgeting/CreateEnvelopeModal.tsx(133,13): error TS2719: Type 'Bill[]' is not assignable to type 'Bill[]'. Two different types with this name exist, but they are unrelated.
  Type 'Bill' is not assignable to type 'Bill'. Two different types with this name exist, but they are unrelated.
    Types of property 'name' are incompatible.
      Type 'string | undefined' is not assignable to type 'string'.
        Type 'undefined' is not assignable to type 'string'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(140,24): error TS2322: Type '"savings"' is not assignable to type 'never'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(140,48): error TS2322: Type '"sinking_fund"' is not assignable to type 'never'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(171,11): error TS2719: Type 'Bill[]' is not assignable to type 'Bill[]'. Two different types with this name exist, but they are unrelated.
  Type 'Bill' is not assignable to type 'Bill'. Two different types with this name exist, but they are unrelated.
    Index signature for type 'string' is missing in type 'Bill'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(172,11): error TS2322: Type 'string | undefined' is not assignable to type 'string | null'.
  Type 'undefined' is not assignable to type 'string | null'.
src/components/budgeting/EditEnvelopeModal.tsx(67,5): error TS2322: Type 'unknown[]' is not assignable to type 'Envelope[]'.
  Type 'unknown' is not assignable to type 'Envelope'.
src/components/budgeting/EditEnvelopeModal.tsx(68,5): error TS2322: Type '((envelope: unknown) => void | Promise<void>) | undefined' is not assignable to type '(envelopeData: unknown) => Promise<void>'.
  Type 'undefined' is not assignable to type '(envelopeData: unknown) => Promise<void>'.
src/components/budgeting/EditEnvelopeModal.tsx(70,5): error TS2322: Type '((envelopeId: string) => void | Promise<void>) | undefined' is not assignable to type '(envelopeId: string | number) => Promise<void>'.
  Type 'undefined' is not assignable to type '(envelopeId: string | number) => Promise<void>'.
src/components/budgeting/EditEnvelopeModal.tsx(129,11): error TS2739: Type 'EnvelopeRef' is missing the following properties from type 'Envelope': name, currentBalance, targetAmount
src/components/budgeting/EditEnvelopeModal.tsx(150,13): error TS2322: Type 'LockDocument | null' is not assignable to type 'null | undefined'.
  Type 'LockDocument' is not assignable to type 'null | undefined'.
src/components/budgeting/EditEnvelopeModal.tsx(181,9): error TS2739: Type 'EnvelopeRef' is missing the following properties from type 'Envelope': name, currentBalance, targetAmount
src/components/budgeting/EditEnvelopeModalComponents.tsx(178,26): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/budgeting/EditEnvelopeModalComponents.tsx(179,11): error TS2322: Type '("savings" | "sinking_fund")[]' is not assignable to type 'never[]'.
  Type '"savings" | "sinking_fund"' is not assignable to type 'never'.
    Type '"savings"' is not assignable to type 'never'.
src/components/budgeting/EnvelopeGrid.tsx(147,9): error TS2322: Type '(id: string, amount: number) => Promise<void>' is not assignable to type '(amount: number) => void'.
  Target signature provides too few arguments. Expected 2 or more, but got 1.
src/components/budgeting/EnvelopeGrid.tsx(272,42): error TS2345: Argument of type '(state: BudgetState) => BudgetEnvelope[]' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => BudgetEnvelope[]' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'BudgetState'.
src/components/budgeting/EnvelopeGrid.tsx(273,45): error TS2345: Argument of type '(state: BudgetState) => unknown[]' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => unknown[]' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'BudgetState'.
src/components/budgeting/EnvelopeGrid.tsx(274,38): error TS2345: Argument of type '(state: BudgetState) => unknown[]' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => unknown[]' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'BudgetState'.
src/components/budgeting/EnvelopeGrid.tsx(275,44): error TS2345: Argument of type '(state: BudgetState) => unknown' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => unknown' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'BudgetState'.
src/components/budgeting/EnvelopeGrid.tsx(276,43): error TS2345: Argument of type '(state: BudgetState) => (bill: unknown) => void' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => (bill: unknown) => void' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'BudgetState'.
src/components/budgeting/EnvelopeGrid.tsx(371,33): error TS2345: Argument of type 'Envelope[] | Envelope[] | ({ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; ... 31 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = []>(i...' is not assignable to parameter of type 'Envelope[]'.
  Type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...' is not assignable to type 'Envelope[]'.
src/components/budgeting/EnvelopeGrid.tsx(404,7): error TS2322: Type 'Dispatch<SetStateAction<FilterOptions>>' is not assignable to type '(opts: unknown) => void'.
  Types of parameters 'value' and 'opts' are incompatible.
    Type 'unknown' is not assignable to type 'SetStateAction<FilterOptions>'.
src/components/budgeting/EnvelopeGrid.tsx(408,7): error TS2322: Type '(envelope: EnvelopeRef) => void' is not assignable to type '(env: unknown) => void'.
  Types of parameters 'envelope' and 'env' are incompatible.
    Type 'unknown' is not assignable to type 'EnvelopeRef'.
src/components/budgeting/EnvelopeGrid.tsx(411,7): error TS2322: Type '(envelope: EnvelopeRef) => void' is not assignable to type '(env: unknown) => void'.
  Types of parameters 'envelope' and 'env' are incompatible.
    Type 'unknown' is not assignable to type 'EnvelopeRef'.
src/components/budgeting/EnvelopeGrid.tsx(414,7): error TS2322: Type 'Bill[] | ({ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<...>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifie...' is not assignable to type 'unknown[]'.
  Type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...' is not assignable to type 'unknown[]'.
src/components/budgeting/EnvelopeGrid.tsx(420,9): error TS2322: Type 'Envelope[] | Envelope[] | ({ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; ... 31 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknown][] = []>(i...' is not assignable to type 'Envelope[]'.
  Type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...' is not assignable to type 'Envelope[]'.
src/components/budgeting/EnvelopeGrid.tsx(427,9): error TS2322: Type '(envelopeData: { id: string; [key: string]: unknown; }) => Promise<void>' is not assignable to type '(data: unknown) => Promise<void>'.
  Types of parameters 'envelopeData' and 'data' are incompatible.
    Type 'unknown' is not assignable to type '{ [key: string]: unknown; id: string; }'.
src/components/budgeting/EnvelopeGrid.tsx(432,9): error TS2322: Type 'Bill[] | ({ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<...>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifie...' is not assignable to type 'unknown[]'.
  Type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...' is not assignable to type 'unknown[]'.
src/components/budgeting/PaycheckProcessor.tsx(80,13): error TS2322: Type 'Envelope[]' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope[]'.
  Property 'targetAmount' is missing in type 'Envelope' but required in type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope'.
src/components/budgeting/PaycheckProcessor.tsx(87,9): error TS2719: Type 'PaycheckHistoryItem[]' is not assignable to type 'PaycheckHistoryItem[]'. Two different types with this name exist, but they are unrelated.
  Type 'PaycheckHistoryItem' is not assignable to type 'PaycheckHistoryItem'. Two different types with this name exist, but they are unrelated.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/budgeting/PaycheckProcessor.tsx(139,7): error TS2322: Type 'string' is not assignable to type 'AllocationMode'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(167,11): error TS2322: Type 'unknown' is not assignable to type 'AnalysisSettings'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(171,11): error TS2322: Type 'unknown' is not assignable to type 'SuggestionStats | null'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(176,7): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/utils/budgeting/suggestionUtils").Suggestion[]' is not assignable to type 'Suggestion[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/utils/budgeting/suggestionUtils").Suggestion' is not assignable to type 'Suggestion'.
    Index signature for type 'string' is missing in type 'Suggestion'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(211,5): error TS2322: Type '(envelope: Partial<Envelope>) => void' is not assignable to type '(data: unknown) => void | Promise<void>'.
  Types of parameters 'envelope' and 'data' are incompatible.
    Type 'unknown' is not assignable to type 'Partial<Envelope>'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(212,5): error TS2322: Type '(envelope: Envelope) => void' is not assignable to type '(envelopeId: string, updates: Record<string, unknown>) => void | Promise<void>'.
  Types of parameters 'envelope' and 'envelopeId' are incompatible.
    Type 'string' is not assignable to type 'Envelope'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(264,11): error TS2322: Type '(newSettings: Partial<typeof DEFAULT_ANALYSIS_SETTINGS>) => void' is not assignable to type '(settings: unknown) => void'.
  Types of parameters 'newSettings' and 'settings' are incompatible.
    Type 'unknown' is not assignable to type 'Partial<{ minAmount: number; minTransactions: number; overspendingThreshold: number; overfundingThreshold: number; bufferPercentage: number; }>'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(269,11): error TS2322: Type '(suggestion: { id: string; action: string; data: Record<string, unknown>; [key: string]: unknown; }) => Promise<void>' is not assignable to type '(suggestion: unknown) => void'.
  Types of parameters 'suggestion' and 'suggestion' are incompatible.
    Type 'unknown' is not assignable to type '{ [key: string]: unknown; id: string; action: string; data: Record<string, unknown>; }'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(270,11): error TS2322: Type '(suggestionId: string) => void' is not assignable to type '(suggestion: unknown) => void'.
  Types of parameters 'suggestionId' and 'suggestion' are incompatible.
    Type 'unknown' is not assignable to type 'string'.
src/components/budgeting/envelope/EnvelopeActivitySummary.tsx(11,36): error TS7031: Binding element 'envelope' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeGridView.tsx(101,30): error TS2345: Argument of type '(envelope: { id: string; [key: string]: unknown; }) => JSX.Element' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => Element'.
  Types of parameters 'envelope' and 'value' are incompatible.
    Type 'unknown' is not assignable to type '{ [key: string]: unknown; id: string; }'.
src/components/budgeting/envelope/EnvelopeHistoryModal.tsx(10,49): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeHistoryModal.tsx(10,58): error TS7031: Binding element 'envelope' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeHistoryModal.tsx(16,32): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeItem.tsx(66,91): error TS2345: Argument of type 'Envelope' is not assignable to parameter of type 'EnvelopeWithStatus'.
  Types of property 'status' are incompatible.
    Type 'string' is not assignable to type '"overdue" | "healthy" | "overspent" | "underfunded" | undefined'.
src/components/budgeting/envelope/EnvelopeItem.tsx(77,9): error TS2322: Type '((envelopeId: string) => void) | undefined' is not assignable to type '(envelopeId: string) => void'.
  Type 'undefined' is not assignable to type '(envelopeId: string) => void'.
src/components/budgeting/envelope/EnvelopeItem.tsx(78,9): error TS2322: Type '((envelope: Envelope) => void) | undefined' is not assignable to type '(envelope: Envelope) => void'.
  Type 'undefined' is not assignable to type '(envelope: Envelope) => void'.
src/components/budgeting/envelope/EnvelopeItem.tsx(79,9): error TS2322: Type '((envelope: Envelope) => void) | undefined' is not assignable to type '(envelope: Envelope) => void'.
  Type 'undefined' is not assignable to type '(envelope: Envelope) => void'.
src/components/budgeting/envelope/EnvelopeModalHeader.tsx(15,3): error TS7031: Binding element 'onBreakLock' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeModalHeader.tsx(16,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx(13,34): error TS7031: Binding element 'envelope' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx(13,44): error TS7031: Binding element 'bills' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx(13,51): error TS7031: Binding element 'utilizationColorClass' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx(14,26): error TS7006: Parameter 'status' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeSummary.tsx(3,28): error TS7031: Binding element 'totals' implicitly has an 'any' type.
src/components/budgeting/envelope/SwipeIndicatorOverlay.tsx(11,34): error TS7031: Binding element 'swipeState' implicitly has an 'any' type.
src/components/budgeting/envelope/SwipeIndicatorOverlay.tsx(11,46): error TS7031: Binding element 'unassignedCash' implicitly has an 'any' type.
src/components/budgeting/envelope/UnassignedCashEnvelope.tsx(16,5): error TS2345: Argument of type '(state: { openUnassignedCashModal?: () => void; }) => (() => void) | undefined' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: { openUnassignedCashModal?: () => void; }) => (() => void) | undefined' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Type '(() => void) | undefined' is not assignable to type 'StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
      Type 'undefined' is not assignable to type 'StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
        Type 'undefined' is not assignable to type 'StoreState'.
src/components/budgeting/paycheck/AllocationPreview.tsx(147,51): error TS18048: 'allocation.monthlyAmount' is possibly 'undefined'.
src/components/budgeting/paycheck/AllocationPreview.tsx(149,44): error TS18048: 'allocation.monthlyAmount' is possibly 'undefined'.
src/components/budgeting/paycheck/PaycheckAmountInput.tsx(8,32): error TS7031: Binding element 'value' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAmountInput.tsx(8,39): error TS7031: Binding element 'onChange' implicitly has an 'any' type.
src/components/budgeting/shared/BillConnectionSelector.tsx(15,11): error TS6196: 'Envelope' is declared but never used.
src/components/budgeting/shared/EnvelopeTypeSelector.tsx(11,3): error TS7031: Binding element 'selectedType' implicitly has an 'any' type.
src/components/budgeting/shared/EnvelopeTypeSelector.tsx(12,3): error TS7031: Binding element 'onTypeChange' implicitly has an 'any' type.
src/components/budgeting/shared/EnvelopeTypeSelector.tsx(16,24): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/budgeting/shared/EnvelopeTypeSelector.tsx(40,54): error TS2345: Argument of type 'string' is not assignable to parameter of type 'never'.
src/components/budgeting/suggestions/SuggestionsList.tsx(112,19): error TS2740: Type 'Suggestion' is missing the following properties from type 'Suggestion': title, description, reasoning, type, and 3 more.
src/components/budgeting/suggestions/SuggestionsList.tsx(113,19): error TS2719: Type '(suggestion: Suggestion) => void' is not assignable to type '(suggestion: Suggestion) => void'. Two different types with this name exist, but they are unrelated.
  Types of parameters 'suggestion' and 'suggestion' are incompatible.
    Type 'Suggestion' is not assignable to type 'Suggestion'. Two different types with this name exist, but they are unrelated.
      Index signature for type 'string' is missing in type 'Suggestion'.
src/components/budgeting/suggestions/SuggestionsList.tsx(114,19): error TS2322: Type '(suggestion: Suggestion) => void' is not assignable to type '(id: string) => void'.
  Types of parameters 'suggestion' and 'id' are incompatible.
    Type 'string' is not assignable to type 'Suggestion'.
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
src/components/charts/TrendLineChart.tsx(63,18): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ line: { type: string; dataKey: string; name: string; stroke: string; strokeWidth: number; }[]; area: ({ type: string; dataKey: string; name: string; stroke: string; fill: string; fillOpacity: number; strokeWidth?: undefined; } | { ...; })[]; bar: ({ ...; } | { ...; })[]; }'.
  No index signature with a parameter of type 'string' was found on type '{ line: { type: string; dataKey: string; name: string; stroke: string; strokeWidth: number; }[]; area: ({ type: string; dataKey: string; name: string; stroke: string; fill: string; fillOpacity: number; strokeWidth?: undefined; } | { ...; })[]; bar: ({ ...; } | { ...; })[]; }'.
src/components/dashboard/AccountBalanceOverview.tsx(7,34): error TS7006: Parameter 'isBalanced' implicitly has an 'any' type.
src/components/dashboard/AccountBalanceOverview.tsx(7,46): error TS7006: Parameter 'difference' implicitly has an 'any' type.
src/components/dashboard/AccountBalanceOverview.tsx(14,31): error TS7006: Parameter 'isBalanced' implicitly has an 'any' type.
src/components/dashboard/AccountBalanceOverview.tsx(14,43): error TS7006: Parameter 'difference' implicitly has an 'any' type.
src/components/dashboard/AccountBalanceOverview.tsx(20,3): error TS7031: Binding element 'actualBalance' implicitly has an 'any' type.
src/components/dashboard/AccountBalanceOverview.tsx(21,3): error TS7031: Binding element 'totalVirtualBalance' implicitly has an 'any' type.
src/components/dashboard/AccountBalanceOverview.tsx(22,3): error TS7031: Binding element 'totalEnvelopeBalance' implicitly has an 'any' type.
src/components/dashboard/AccountBalanceOverview.tsx(23,3): error TS7031: Binding element 'totalSavingsBalance' implicitly has an 'any' type.
src/components/dashboard/AccountBalanceOverview.tsx(24,3): error TS7031: Binding element 'unassignedCash' implicitly has an 'any' type.
src/components/dashboard/AccountBalanceOverview.tsx(25,3): error TS7031: Binding element 'difference' implicitly has an 'any' type.
src/components/dashboard/AccountBalanceOverview.tsx(26,3): error TS7031: Binding element 'isBalanced' implicitly has an 'any' type.
src/components/dashboard/AccountBalanceOverview.tsx(27,3): error TS7031: Binding element 'onUpdateBalance' implicitly has an 'any' type.
src/components/dashboard/AccountBalanceOverview.tsx(28,3): error TS7031: Binding element 'onOpenReconcileModal' implicitly has an 'any' type.
src/components/dashboard/AccountBalanceOverview.tsx(29,3): error TS7031: Binding element 'onAutoReconcileDifference' implicitly has an 'any' type.
src/components/dashboard/RecentTransactionsWidget.tsx(17,30): error TS2339: Property 'id' does not exist on type 'never'.
src/components/dashboard/RecentTransactionsWidget.tsx(23,31): error TS2339: Property 'amount' does not exist on type 'never'.
src/components/dashboard/RecentTransactionsWidget.tsx(27,39): error TS2339: Property 'amount' does not exist on type 'never'.
src/components/dashboard/RecentTransactionsWidget.tsx(29,55): error TS2339: Property 'amount' does not exist on type 'never'.
src/components/dashboard/RecentTransactionsWidget.tsx(34,59): error TS2339: Property 'description' does not exist on type 'never'.
src/components/dashboard/RecentTransactionsWidget.tsx(36,41): error TS2339: Property 'date' does not exist on type 'never'.
src/components/dashboard/RecentTransactionsWidget.tsx(37,32): error TS2339: Property 'envelopeId' does not exist on type 'never'.
src/components/dashboard/RecentTransactionsWidget.tsx(37,58): error TS2339: Property 'envelopeId' does not exist on type 'never'.
src/components/dashboard/RecentTransactionsWidget.tsx(40,63): error TS2339: Property 'id' does not exist on type 'never'.
src/components/dashboard/RecentTransactionsWidget.tsx(40,82): error TS2339: Property 'envelopeId' does not exist on type 'never'.
src/components/dashboard/RecentTransactionsWidget.tsx(41,27): error TS2339: Property 'name' does not exist on type 'never'.
src/components/dashboard/RecentTransactionsWidget.tsx(48,51): error TS2339: Property 'amount' does not exist on type 'never'.
src/components/dashboard/RecentTransactionsWidget.tsx(50,28): error TS2339: Property 'amount' does not exist on type 'never'.
src/components/dashboard/RecentTransactionsWidget.tsx(50,73): error TS2339: Property 'amount' does not exist on type 'never'.
src/components/debt/DebtDashboard.tsx(66,52): error TS2322: Type 'Dispatch<SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>>' is not assignable to type 'Dispatch<SetStateAction<Record<string, string | boolean>>>'.
  Type 'SetStateAction<Record<string, string | boolean>>' is not assignable to type 'SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>'.
    Type 'Record<string, string | boolean>' is not assignable to type 'SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>'.
      Type 'Record<string, string | boolean>' is missing the following properties from type '{ type: string; status: string; sortBy: string; sortOrder: string; }': type, status, sortBy, sortOrder
src/components/debt/DebtDashboard.tsx(89,15): error TS2322: Type '(debtId: string, paymentData: { amount: number; date?: string; }) => Promise<void>' is not assignable to type '(debt: DebtAccount, amount: number) => void'.
  Types of parameters 'debtId' and 'debt' are incompatible.
    Type 'DebtAccount' is not assignable to type 'string'.
src/components/debt/DebtDashboard.tsx(110,11): error TS2322: Type 'DebtAccount' is not assignable to type 'Record<string, unknown> & { id: string; }'.
  Type 'DebtAccount' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type 'DebtAccount'.
src/components/debt/DebtDashboard.tsx(114,11): error TS2322: Type '(debtId: string, paymentData: { amount: number; date?: string; }) => Promise<void>' is not assignable to type '(debtId: string, amount: number) => Promise<void>'.
  Types of parameters 'paymentData' and 'amount' are incompatible.
    Type 'number' is not assignable to type '{ amount: number; date?: string | undefined; }'.
src/components/debt/DebtDashboard.tsx(115,11): error TS2322: Type '(debt: DebtAccount) => void' is not assignable to type '(debt: Record<string, unknown>) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'Record<string, unknown>' is missing the following properties from type 'DebtAccount': id, name, creditor, balance, and 6 more.
src/components/debt/DebtDashboard.tsx(122,9): error TS2322: Type 'DebtAccount[]' is not assignable to type 'UpcomingPayment[]'.
  Type 'DebtAccount' is missing the following properties from type 'UpcomingPayment': debtId, debtName, dueDate, amount
src/components/debt/DebtDashboardComponents.tsx(62,15): error TS2322: Type '(debt: DebtAccount) => void' is not assignable to type '(debt: DebtAccount | Debt) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/debt/DebtDashboardComponents.tsx(63,15): error TS2322: Type '(debt: DebtAccount, amount: number) => void' is not assignable to type '(debt: DebtAccount | Debt, amount: number) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/debt/DebtStrategies.tsx(25,25): error TS2345: Argument of type 'DebtAccount[]' is not assignable to parameter of type 'Debt[]'.
  Type 'DebtAccount' is not assignable to type 'Debt'.
    Types of property 'currentBalance' are incompatible.
      Type 'number | undefined' is not assignable to type 'number'.
        Type 'undefined' is not assignable to type 'number'.
src/components/debt/DebtStrategies.tsx(59,11): error TS2322: Type '{ debts: never[]; totalInterest: number; payoffTime: number; name?: undefined; description?: undefined; } | { debts: { priority: number; monthsToPayoff: number; totalInterestCost: number; strategy: string; ... 6 more ...; interestRate?: number | undefined; }[]; totalInterest: number; payoffTime: number; name: string...' is not assignable to type 'Strategy'.
  Type '{ debts: never[]; totalInterest: number; payoffTime: number; name?: undefined; description?: undefined; }' is not assignable to type 'Strategy'.
    Types of property 'name' are incompatible.
      Type 'undefined' is not assignable to type 'string'.
src/components/debt/DebtStrategies.tsx(63,11): error TS2322: Type '{ debts: never[]; totalInterest: number; payoffTime: number; name?: undefined; description?: undefined; } | { debts: { priority: number; monthsToPayoff: number; totalInterestCost: number; strategy: string; ... 6 more ...; interestRate?: number | undefined; }[]; totalInterest: number; payoffTime: number; name: string...' is not assignable to type 'Strategy'.
  Type '{ debts: never[]; totalInterest: number; payoffTime: number; name?: undefined; description?: undefined; }' is not assignable to type 'Strategy'.
    Types of property 'name' are incompatible.
      Type 'undefined' is not assignable to type 'string'.
src/components/debt/DebtStrategies.tsx(113,27): error TS2322: Type '{ extraPayment: number; avalanche: { monthsToPayoff: number; totalInterest: number; savings: number; timeSavings?: undefined; interestSavings?: undefined; } | { monthsToPayoff: number; totalInterest: number; timeSavings: number; interestSavings: number; savings?: undefined; }; snowball: { ...; } | { ...; }; }[]' is not assignable to type 'PaymentImpactScenario[]'.
  Type '{ extraPayment: number; avalanche: { monthsToPayoff: number; totalInterest: number; savings: number; timeSavings?: undefined; interestSavings?: undefined; } | { monthsToPayoff: number; totalInterest: number; timeSavings: number; interestSavings: number; savings?: undefined; }; snowball: { monthsToPayoff: number; tot...' is not assignable to type 'PaymentImpactScenario'.
    Types of property 'avalanche' are incompatible.
      Type '{ monthsToPayoff: number; totalInterest: number; savings: number; timeSavings?: undefined; interestSavings?: undefined; } | { monthsToPayoff: number; totalInterest: number; timeSavings: number; interestSavings: number; savings?: undefined; }' is not assignable to type '{ timeSavings: number; interestSavings: number; }'.
        Type '{ monthsToPayoff: number; totalInterest: number; savings: number; timeSavings?: undefined; interestSavings?: undefined; }' is not assignable to type '{ timeSavings: number; interestSavings: number; }'.
          Types of property 'timeSavings' are incompatible.
            Type 'undefined' is not assignable to type 'number'.
src/components/debt/modals/AddDebtModal.tsx(47,7): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/debt/modals/DebtDetailModal.tsx(52,5): error TS2322: Type '(Record<string, unknown> & { id: string; }) | undefined' is not assignable to type 'DebtWithHistory | null'.
  Type 'undefined' is not assignable to type 'DebtWithHistory | null'.
src/components/debt/modals/DebtDetailModal.tsx(56,5): error TS2322: Type '(debtId: string, amount: number) => Promise<void>' is not assignable to type '(debtId: string, paymentData: PaymentData) => void'.
  Types of parameters 'amount' and 'paymentData' are incompatible.
    Type 'PaymentData' is not assignable to type 'number'.
src/components/debt/modals/DebtDetailModal.tsx(57,5): error TS2322: Type '(debt: Record<string, unknown>) => void' is not assignable to type '(debt: DebtWithHistory) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtWithHistory' is not assignable to type 'Record<string, unknown>'.
      Index signature for type 'string' is missing in type 'DebtWithHistory'.
src/components/debt/modals/DebtDetailModal.tsx(71,27): error TS2322: Type '{ expectedPayoff: string; totalInterest: string; payoffDate: string; } | null' is not assignable to type '{ expectedPayoff: string; totalInterest: string; payoffDate: string; }'.
  Type 'null' is not assignable to type '{ expectedPayoff: string; totalInterest: string; payoffDate: string; }'.
src/components/debt/modals/DebtDetailModal.tsx(81,47): error TS2322: Type '{ id: string | number; displayDate: string; formattedAmount: string; principalDisplay: string | undefined; interestDisplay: string | undefined; date: string; amount: number; principalAmount?: number | undefined; interestAmount?: number | undefined; }[]' is not assignable to type '{ id: string; formattedAmount: string; displayDate: string; principalDisplay?: string | undefined; interestDisplay?: string | undefined; }[]'.
  Type '{ id: string | number; displayDate: string; formattedAmount: string; principalDisplay: string | undefined; interestDisplay: string | undefined; date: string; amount: number; principalAmount?: number; interestAmount?: number; }' is not assignable to type '{ id: string; formattedAmount: string; displayDate: string; principalDisplay?: string | undefined; interestDisplay?: string | undefined; }'.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/debt/modals/DebtFormFields.tsx(96,11): error TS2322: Type 'string | null | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/debt/ui/DebtCardProgressBar.tsx(5,32): error TS7031: Binding element 'progressData' implicitly has an 'any' type.
src/components/debt/ui/DebtList.tsx(200,107): error TS2339: Property 'className' does not exist on type 'never'.
src/components/debt/ui/DebtList.tsx(203,29): error TS2339: Property 'icon' does not exist on type 'never'.
src/components/debt/ui/DebtList.tsx(203,41): error TS2339: Property 'label' does not exist on type 'never'.
src/components/debt/ui/DebtList.tsx(203,55): error TS2339: Property 'name' does not exist on type 'never'.
src/components/debt/ui/DebtProgressBar.tsx(5,28): error TS7031: Binding element 'progressData' implicitly has an 'any' type.
src/components/debt/ui/DebtSummaryCards.tsx(64,11): error TS2322: Type '(() => void) | null | undefined' is not assignable to type '(() => void) | undefined'.
  Type 'null' is not assignable to type '(() => void) | undefined'.
src/components/history/BudgetHistoryViewer.tsx(49,64): error TS2345: Argument of type 'UseMutateFunction<{ commitHash: string; snapshot: any; }, Error, { commitHash: string; password: string; }, unknown>' is not assignable to parameter of type '(params: { commitHash: string; password: string; }) => Promise<void>'.
  Type 'void' is not assignable to type 'Promise<void>'.
src/components/history/BudgetHistoryViewer.tsx(56,28): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/components/history/BudgetHistoryViewer.tsx(121,15): error TS2322: Type 'BudgetCommit[]' is not assignable to type 'HistoryCommit[]'.
  Property 'shortHash' is missing in type 'BudgetCommit' but required in type 'HistoryCommit'.
src/components/history/BudgetHistoryViewer.tsx(133,15): error TS2322: Type '{ commit: BudgetCommit | undefined; changes: BudgetChange[]; } | null | undefined' is not assignable to type 'CommitDetails | null'.
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
src/components/history/viewer/ChangeDetails.tsx(116,73): error TS18048: 'change.diff' is possibly 'undefined'.
src/components/history/viewer/ChangeDetails.tsx(117,47): error TS18048: 'change.diff' is possibly 'undefined'.
src/components/history/viewer/HistoryControls.tsx(7,28): error TS7031: Binding element 'filter' implicitly has an 'any' type.
src/components/history/viewer/HistoryControls.tsx(7,36): error TS7031: Binding element 'updateFilter' implicitly has an 'any' type.
src/components/history/viewer/HistoryControls.tsx(7,50): error TS7031: Binding element 'loading' implicitly has an 'any' type.
src/components/history/viewer/HistoryControls.tsx(7,59): error TS7031: Binding element 'exportHistory' implicitly has an 'any' type.
src/components/history/viewer/HistoryHeader.tsx(7,26): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/history/viewer/HistoryStatistics.tsx(4,30): error TS7031: Binding element 'statistics' implicitly has an 'any' type.
src/components/history/viewer/IntegrityWarning.tsx(5,29): error TS7031: Binding element 'integrityCheck' implicitly has an 'any' type.
src/components/history/viewer/IntegrityWarning.tsx(5,45): error TS7031: Binding element 'showIntegrityDetails' implicitly has an 'any' type.
src/components/history/viewer/IntegrityWarning.tsx(5,67): error TS7031: Binding element 'toggleIntegrityDetails' implicitly has an 'any' type.
src/components/layout/AppRoutes.tsx(18,22): error TS7031: Binding element 'budget' implicitly has an 'any' type.
src/components/layout/AppRoutes.tsx(18,30): error TS7031: Binding element 'currentUser' implicitly has an 'any' type.
src/components/layout/AppRoutes.tsx(18,43): error TS7031: Binding element 'totalBiweeklyNeed' implicitly has an 'any' type.
src/components/layout/AppRoutes.tsx(18,62): error TS7031: Binding element 'setActiveView' implicitly has an 'any' type.
src/components/layout/AppWrapper.tsx(9,23): error TS7031: Binding element 'firebaseSync' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(210,54): error TS2322: Type '(id: number) => void' is not assignable to type '(id: string | number) => void'.
  Types of parameters 'id' and 'id' are incompatible.
    Type 'string | number' is not assignable to type 'number'.
      Type 'string' is not assignable to type 'number'.
src/components/layout/MainLayout.tsx(237,5): error TS2345: Argument of type '(state: Record<string, unknown>) => () => void' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: Record<string, unknown>) => () => void' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'Record<string, unknown>'.
        Index signature for type 'string' is missing in type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/components/layout/MainLayout.tsx(256,18): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ dashboard: string; envelopes: string; savings: string; supplemental: string; paycheck: string; bills: string; transactions: string; debts: string; analytics: string; automation: string; activity: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ dashboard: string; envelopes: string; savings: string; supplemental: string; paycheck: string; bills: string; transactions: string; debts: string; analytics: string; automation: string; activity: string; }'.
src/components/layout/MainLayout.tsx(288,5): error TS2345: Argument of type '(state: Record<string, unknown>) => boolean' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: Record<string, unknown>) => boolean' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'Record<string, unknown>'.
        Index signature for type 'string' is missing in type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/components/layout/MainLayout.tsx(291,5): error TS2345: Argument of type '(state: Record<string, unknown>) => boolean' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: Record<string, unknown>) => boolean' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'Record<string, unknown>'.
        Index signature for type 'string' is missing in type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/components/layout/MainLayout.tsx(324,11): error TS2322: Type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...' is not assignable to type 'boolean'.
src/components/layout/MainLayout.tsx(325,11): error TS2322: Type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...' is not assignable to type 'boolean'.
src/components/layout/MainLayout.tsx(477,11): error TS2322: Type '(event: ChangeEvent<HTMLInputElement>) => Promise<{ success: boolean; imported: { envelopes: number; bills: number; transactions: number; savingsGoals: number; debts: number; paycheckHistory: number; auditLog: number; }; } | undefined>' is not assignable to type '() => void'.
  Target signature provides too few arguments. Expected 1 or more, but got 0.
src/components/layout/MainLayout.tsx(484,11): error TS2322: Type '(oldPassword: string, newPassword: string) => Promise<void>' is not assignable to type '(password: string) => void'.
  Target signature provides too few arguments. Expected 2 or more, but got 1.
src/components/layout/MainLayout.tsx(485,11): error TS2322: Type 'unknown' is not assignable to type '{ userName?: string | undefined; userColor?: string | undefined; }'.
src/components/layout/SummaryCards.tsx(34,5): error TS2345: Argument of type '(state: { openUnassignedCashModal: () => void; }) => () => void' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: { openUnassignedCashModal: () => void; }) => () => void' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type '{ openUnassignedCashModal: () => void; }'.
src/components/layout/SummaryCards.tsx(161,13): error TS2322: Type 'boolean | undefined' is not assignable to type 'boolean'.
  Type 'undefined' is not assignable to type 'boolean'.
src/components/layout/SummaryCards.tsx(162,13): error TS2322: Type 'boolean | undefined' is not assignable to type 'boolean'.
  Type 'undefined' is not assignable to type 'boolean'.
src/components/layout/ViewRenderer.tsx(253,9): error TS2322: Type '(distribution: unknown, description: string) => Promise<unknown>' is not assignable to type '(amount: number, goals: unknown[]) => void'.
  Types of parameters 'description' and 'goals' are incompatible.
    Type 'unknown[]' is not assignable to type 'string'.
src/components/layout/ViewRenderer.tsx(271,9): error TS2322: Type 'UseMutateFunction<{ id: string; date: Date; amount: number; source: string; lastModified: number; createdAt: number; mode: string; unassignedCashBefore: number; unassignedCashAfter: number; actualBalanceBefore: number; actualBalanceAfter: number; envelopeAllocations: { ...; }[]; notes: string; }, Error, PaycheckData...' is not assignable to type '(data: unknown) => Promise<void>'.
  Types of parameters 'variables' and 'data' are incompatible.
    Type 'unknown' is not assignable to type 'PaycheckData & { mode: string; }'.
      Type 'unknown' is not assignable to type 'PaycheckData'.
src/components/layout/ViewRenderer.tsx(272,9): error TS2322: Type '(paycheckId: string) => Promise<void>' is not assignable to type '(paycheck: PaycheckHistoryItem) => Promise<void>'.
  Types of parameters 'paycheckId' and 'paycheck' are incompatible.
    Type 'PaycheckHistoryItem' is not assignable to type 'string'.
src/components/layout/ViewRenderer.tsx(273,44): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").PaycheckHistory[]' is not assignable to parameter of type 'PaycheckHistory[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").PaycheckHistory' is not assignable to type 'PaycheckHistory'.
    Types of property 'allocations' are incompatible.
      Type 'Record<string, number> | { envelopeId: string; envelopeName: string; amount: number; }[] | undefined' is not assignable to type 'unknown[] | undefined'.
        Type 'Record<string, number>' is missing the following properties from type 'unknown[]': length, pop, push, concat, and 29 more.
src/components/layout/ViewRenderer.tsx(275,9): error TS2322: Type 'Record<string, unknown> | undefined' is not assignable to type 'User'.
  Type 'undefined' is not assignable to type 'User'.
src/components/layout/ViewRenderer.tsx(280,9): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]' is not assignable to type 'Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction' is not assignable to type 'Transaction'.
    Index signature for type 'string' is missing in type 'Transaction'.
src/components/layout/ViewRenderer.tsx(281,9): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Envelope[]' is not assignable to type 'Envelope[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Envelope' is not assignable to type 'Envelope'.
    Index signature for type 'string' is missing in type 'Envelope'.
src/components/layout/ViewRenderer.tsx(282,9): error TS2322: Type '(updatedBill: Record<string, unknown>) => void' is not assignable to type '(bill: Bill) => void | Promise<void>'.
  Types of parameters 'updatedBill' and 'bill' are incompatible.
    Type 'Bill' is not assignable to type 'Record<string, unknown>'.
      Index signature for type 'string' is missing in type 'Bill'.
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
src/components/modals/QuickFundModal.tsx(53,28): error TS2339: Property 'id' does not exist on type '{}'.
src/components/modals/QuickFundModal.tsx(53,32): error TS2554: Expected 1 arguments, but got 2.
src/components/modals/QuickFundModal.tsx(59,24): error TS2339: Property 'id' does not exist on type '{}'.
src/components/modals/QuickFundModal.tsx(59,28): error TS2554: Expected 1 arguments, but got 2.
src/components/modals/QuickFundModal.tsx(83,66): error TS2339: Property 'name' does not exist on type '{}'.
src/components/modals/QuickFundModal.tsx(90,11): error TS2741: Property 'name' is missing in type '{}' but required in type 'Envelope'.
src/components/modals/UnassignedCashModal.tsx(311,22): error TS2339: Property 'isUnassignedCashModalOpen' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/components/modals/UnassignedCashModal.tsx(315,22): error TS2339: Property 'closeUnassignedCashModal' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/components/monitoring/HighlightLoader.tsx(22,63): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/onboarding/EmptyStateHints.tsx(228,46): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
src/components/onboarding/EmptyStateHints.tsx(258,37): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
src/components/onboarding/hooks/useTutorialControls.ts(10,3): error TS7006: Parameter 'tutorialSteps' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialControls.ts(11,3): error TS7006: Parameter 'currentStep' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialControls.ts(12,3): error TS7006: Parameter 'setCurrentStep' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialControls.ts(13,3): error TS7006: Parameter 'setShowTutorial' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialHighlight.ts(8,41): error TS7006: Parameter 'element' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialHighlight.ts(35,40): error TS7006: Parameter 'element' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialHighlight.ts(45,31): error TS7006: Parameter 'shouldHighlight' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialHighlight.ts(45,48): error TS7006: Parameter 'element' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialSteps.ts(128,6): error TS7006: Parameter 'currentStep' implicitly has an 'any' type.
src/components/pages/MainDashboard.tsx(81,38): error TS7006: Parameter 'newBalance' implicitly has an 'any' type.
src/components/pages/MainDashboard.tsx(158,9): error TS2322: Type 'Transaction[]' is not assignable to type 'never[]'.
  Type 'Transaction' is not assignable to type 'never'.
src/components/pages/MainDashboard.tsx(159,9): error TS2322: Type '() => EnvelopeOption[]' is not assignable to type '() => never[]'.
  Type 'EnvelopeOption[]' is not assignable to type 'never[]'.
    Type 'EnvelopeOption' is not assignable to type 'never'.
src/components/pages/MainDashboard.tsx(167,9): error TS2322: Type '(updates: Partial<TransactionFormState>) => void' is not assignable to type '(updates: Partial<NewTransaction>) => void'.
  Types of parameters 'updates' and 'updates' are incompatible.
    Type 'Partial<NewTransaction>' is not assignable to type 'Partial<TransactionFormState>'.
      Types of property 'amount' are incompatible.
        Type 'string | number | undefined' is not assignable to type 'string | undefined'.
          Type 'number' is not assignable to type 'string'.
src/components/pwa/OfflineStatusIndicator.tsx(34,48): error TS2339: Property 'isOnline' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/components/pwa/OfflineStatusIndicator.tsx(55,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/pwa/OfflineStatusIndicator.tsx(106,7): error TS2774: This condition will always return true since this function is always defined. Did you mean to call it instead?
src/components/pwa/OfflineStatusIndicator.tsx(255,45): error TS2774: This condition will always return true since this function is always defined. Did you mean to call it instead?
src/components/pwa/PatchNotesModal.tsx(89,37): error TS2345: Argument of type '(state: UiStore) => boolean' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: UiStore) => boolean' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'UiStore'.
src/components/pwa/PatchNotesModal.tsx(90,26): error TS2352: Conversion of type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...' to type 'PatchNotesData | null' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
src/components/pwa/PatchNotesModal.tsx(91,5): error TS2345: Argument of type '(state: UiStore) => { version: string; notes: string[]; fromVersion?: string; toVersion?: string; isUpdate?: boolean; } | null' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: UiStore) => { version: string; notes: string[]; fromVersion?: string; toVersion?: string; isUpdate?: boolean; } | null' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'UiStore'.
src/components/pwa/PatchNotesModal.tsx(93,40): error TS2345: Argument of type '(state: UiStore) => boolean' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: UiStore) => boolean' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'UiStore'.
src/components/pwa/PatchNotesModal.tsx(94,42): error TS2345: Argument of type '(state: UiStore) => () => void' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: UiStore) => () => void' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'UiStore'.
src/components/pwa/PatchNotesModal.tsx(95,24): error TS2774: This condition will always return true since this function is always defined. Did you mean to call it instead?
src/components/pwa/PatchNotesModal.tsx(130,7): error TS2774: This condition will always return true since this function is always defined. Did you mean to call it instead?
src/components/pwa/UpdateAvailableModal.tsx(29,28): error TS2339: Property 'hasContent' does not exist on type 'string'.
src/components/pwa/UpdateAvailableModal.tsx(30,65): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/components/pwa/UpdateAvailableModal.tsx(31,25): error TS2345: Argument of type '{ type: string; text: string; }[]' is not assignable to parameter of type 'SetStateAction<PatchNote[]>'.
  Type '{ type: string; text: string; }[]' is not assignable to type 'PatchNote[]'.
    Type '{ type: string; text: string; }' is not assignable to type 'PatchNote'.
      Types of property 'type' are incompatible.
        Type 'string' is not assignable to type '"other" | "breaking" | "fix" | "feature"'.
src/components/pwa/UpdateAvailableModal.tsx(35,61): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/pwa/UpdateAvailableModal.tsx(53,55): error TS2339: Property 'updateAvailable' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/components/pwa/UpdateAvailableModal.tsx(54,50): error TS2339: Property 'isUpdating' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/components/pwa/UpdateAvailableModal.tsx(55,58): error TS2339: Property 'setUpdateAvailable' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/components/pwa/UpdateAvailableModal.tsx(56,49): error TS2339: Property 'updateApp' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/components/pwa/UpdateAvailableModal.tsx(58,54): error TS2345: Argument of type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to parameter of type 'boolean'.
src/components/pwa/UpdateAvailableModal.tsx(59,39): error TS2345: Argument of type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to parameter of type 'boolean'.
src/components/pwa/UpdateAvailableModal.tsx(68,24): error TS2345: Argument of type 'boolean' is not assignable to parameter of type '(state: StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) => unknown'.
src/components/pwa/UpdateAvailableModal.tsx(164,13): error TS2322: Type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to type 'boolean | undefined'.
src/components/pwa/UpdateAvailableModal.tsx(167,14): error TS2774: This condition will always return true since this function is always defined. Did you mean to call it instead?
src/components/pwa/UpdateAvailableModal.tsx(184,13): error TS2322: Type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to type 'boolean | undefined'.
src/components/receipts/ReceiptButton.tsx(13,26): error TS7031: Binding element 'onTransactionCreated' implicitly has an 'any' type.
src/components/receipts/ReceiptButton.tsx(26,47): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/receipts/ReceiptButton.tsx(35,35): error TS7006: Parameter 'processedReceipt' implicitly has an 'any' type.
src/components/receipts/ReceiptButton.tsx(41,38): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/components/receipts/ReceiptButton.tsx(41,51): error TS7006: Parameter 'receipt' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(105,38): error TS7031: Binding element 'receiptData' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(105,51): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(105,60): error TS7031: Binding element 'onComplete' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(161,13): error TS2719: Type 'Envelope[]' is not assignable to type 'Envelope[]'. Two different types with this name exist, but they are unrelated.
  Type 'Envelope' is missing the following properties from type 'Envelope': allocated, spent
src/components/receipts/ReceiptToTransactionModal.tsx(184,13): error TS2322: Type 'string | boolean' is not assignable to type 'boolean'.
  Type 'string' is not assignable to type 'boolean'.
src/components/receipts/components/ExtractedDataField.tsx(7,31): error TS7031: Binding element 'label' implicitly has an 'any' type.
src/components/receipts/components/ExtractedDataField.tsx(7,38): error TS7031: Binding element 'value' implicitly has an 'any' type.
src/components/receipts/components/ExtractedDataField.tsx(7,45): error TS7031: Binding element 'confidence' implicitly has an 'any' type.
src/components/receipts/components/ExtractedDataField.tsx(7,57): error TS7031: Binding element 'fieldName' implicitly has an 'any' type.
src/components/receipts/components/ExtractedDataField.tsx(7,81): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/components/receipts/components/ExtractedItemsList.tsx(5,31): error TS7031: Binding element 'items' implicitly has an 'any' type.
src/components/receipts/components/ExtractedItemsList.tsx(16,35): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/receipts/components/ExtractedItemsList.tsx(16,41): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/receipts/components/ReceiptActionButtons.tsx(8,33): error TS7031: Binding element 'extractedData' implicitly has an 'any' type.
src/components/receipts/components/ReceiptActionButtons.tsx(8,48): error TS7031: Binding element 'onReset' implicitly has an 'any' type.
src/components/receipts/components/ReceiptActionButtons.tsx(8,57): error TS7031: Binding element 'onConfirm' implicitly has an 'any' type.
src/components/receipts/components/ReceiptExtractedData.tsx(94,86): error TS2339: Property 'processingTime' does not exist on type 'ExtractedData'.
src/components/receipts/components/ReceiptImagePreview.tsx(10,32): error TS7031: Binding element 'uploadedImage' implicitly has an 'any' type.
src/components/receipts/components/ReceiptImagePreview.tsx(10,47): error TS7031: Binding element 'showImagePreview' implicitly has an 'any' type.
src/components/receipts/components/ReceiptImagePreview.tsx(10,65): error TS7031: Binding element 'onTogglePreview' implicitly has an 'any' type.
src/components/receipts/components/ReceiptScannerHeader.tsx(9,33): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/receipts/components/ReceiptUploadArea.tsx(10,3): error TS7031: Binding element 'onDrop' implicitly has an 'any' type.
src/components/receipts/components/ReceiptUploadArea.tsx(11,3): error TS7031: Binding element 'onDragOver' implicitly has an 'any' type.
src/components/receipts/components/ReceiptUploadArea.tsx(12,3): error TS7031: Binding element 'fileInputRef' implicitly has an 'any' type.
src/components/receipts/components/ReceiptUploadArea.tsx(13,3): error TS7031: Binding element 'cameraInputRef' implicitly has an 'any' type.
src/components/receipts/components/ReceiptUploadArea.tsx(14,3): error TS7031: Binding element 'onFileInputChange' implicitly has an 'any' type.
src/components/receipts/steps/ConfirmationStep.tsx(64,70): error TS2345: Argument of type 'string | number | Date' is not assignable to parameter of type 'string'.
  Type 'number' is not assignable to type 'string'.
src/components/receipts/steps/ConfirmationStep.tsx(139,70): error TS2345: Argument of type 'string | number | Date' is not assignable to parameter of type 'string'.
  Type 'number' is not assignable to type 'string'.
src/components/receipts/steps/EnvelopeSelectionStep.tsx(5,34): error TS7031: Binding element 'transactionForm' implicitly has an 'any' type.
src/components/receipts/steps/EnvelopeSelectionStep.tsx(5,51): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/receipts/steps/EnvelopeSelectionStep.tsx(5,62): error TS7031: Binding element 'handleFormChange' implicitly has an 'any' type.
src/components/receipts/steps/EnvelopeSelectionStep.tsx(6,44): error TS7006: Parameter 'env' implicitly has an 'any' type.
src/components/receipts/steps/EnvelopeSelectionStep.tsx(52,27): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/components/receipts/steps/ReceiptDataStep.tsx(6,28): error TS7031: Binding element 'receiptData' implicitly has an 'any' type.
src/components/receipts/steps/ReceiptDataStep.tsx(6,41): error TS7031: Binding element 'transactionForm' implicitly has an 'any' type.
src/components/receipts/steps/ReceiptDataStep.tsx(6,58): error TS7031: Binding element 'handleFormChange' implicitly has an 'any' type.
src/components/receipts/steps/ReceiptDataStep.tsx(105,49): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/receipts/steps/ReceiptDataStep.tsx(105,55): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/savings/SavingsGoals.tsx(44,5): error TS2322: Type '(amount: number, goals: unknown[]) => void' is not assignable to type '(distribution: unknown) => void | Promise<void>'.
  Target signature provides too few arguments. Expected 2 or more, but got 1.
src/components/savings/SavingsGoals.tsx(93,27): error TS2322: Type 'unknown[]' is not assignable to type 'SavingsGoal[]'.
  Type 'unknown' is not assignable to type 'SavingsGoal'.
src/components/savings/SavingsGoals.tsx(132,22): error TS18046: 'goal' is of type 'unknown'.
src/components/savings/SavingsGoals.tsx(133,17): error TS2322: Type 'unknown' is not assignable to type 'SavingsGoal'.
src/components/savings/SavingsGoals.tsx(156,9): error TS2322: Type 'unknown[]' is not assignable to type 'SavingsGoal[]'.
  Type 'unknown' is not assignable to type 'SavingsGoal'.
src/components/security/LocalDataSecurityWarning.tsx(12,37): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/security/LocalDataSecurityWarning.tsx(12,46): error TS7031: Binding element 'onAcknowledge' implicitly has an 'any' type.
src/components/security/LocalDataSecurityWarning.tsx(133,26): error TS7031: Binding element 'onAcknowledge' implicitly has an 'any' type.
src/components/security/LockScreen.tsx(239,20): error TS2345: Argument of type 'KeyboardEvent<HTMLInputElement>' is not assignable to parameter of type 'FormEvent<HTMLFormElement>'.
  Types of property 'currentTarget' are incompatible.
    Type 'EventTarget & HTMLInputElement' is not assignable to type 'EventTarget & HTMLFormElement'.
      Type 'EventTarget & HTMLInputElement' is missing the following properties from type 'HTMLFormElement': acceptCharset, action, elements, encoding, and 11 more.
src/components/settings/SecuritySettings.tsx(83,16): error TS2322: Type '{ securitySettings: SecuritySettings; handleSettingChange: (setting: any, value: any) => void; }' is not assignable to type 'ClipboardSecuritySectionProps'.
  Types of property 'securitySettings' are incompatible.
    Type 'import("/home/runner/work/violet-vault/violet-vault/src/services/security/securityService").SecuritySettings' is not assignable to type 'SecuritySettings'.
      Index signature for type 'string' is missing in type 'SecuritySettings'.
src/components/settings/SettingsDashboard.tsx(110,5): error TS2322: Type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to type 'boolean | undefined'.
src/components/settings/SettingsDashboard.tsx(121,5): error TS2322: Type '(profile: { userName: string; userColor: string; }) => void' is not assignable to type '(profile: UserProfile) => void'.
  Types of parameters 'profile' and 'profile' are incompatible.
    Type 'UserProfile' is not assignable to type '{ userName: string; userColor: string; }'.
      Types of property 'userName' are incompatible.
        Type 'string | undefined' is not assignable to type 'string'.
          Type 'undefined' is not assignable to type 'string'.
src/components/settings/SettingsDashboard.tsx(124,5): error TS2322: Type 'unknown' is not assignable to type 'SecurityManager | undefined'.
src/components/settings/SettingsDashboard.tsx(162,13): error TS2322: Type '(password: string) => void' is not assignable to type '(current: string, newPass: string) => Promise<AuthResult>'.
  Type 'void' is not assignable to type 'Promise<AuthResult>'.
src/components/settings/SettingsDashboard.tsx(167,9): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/settings/archiving/ArchivingConfiguration.tsx(7,3): error TS7031: Binding element 'selectedPeriod' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingConfiguration.tsx(8,3): error TS7031: Binding element 'isArchiving' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingConfiguration.tsx(9,3): error TS7031: Binding element 'showAdvancedOptions' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingConfiguration.tsx(10,3): error TS7031: Binding element 'handlePeriodChange' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingConfiguration.tsx(11,3): error TS7031: Binding element 'toggleAdvancedOptions' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingPreviewResults.tsx(5,36): error TS7031: Binding element 'showPreview' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingPreviewResults.tsx(5,49): error TS7031: Binding element 'previewData' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingPreviewResults.tsx(5,62): error TS7031: Binding element 'onClosePreview' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingResult.tsx(4,28): error TS7031: Binding element 'lastResult' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingStatusOverview.tsx(5,3): error TS7031: Binding element 'archivingStatus' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingStatusOverview.tsx(6,3): error TS7031: Binding element 'needsArchiving' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingStatusOverview.tsx(7,3): error TS7031: Binding element 'getUrgencyColor' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingStatusOverview.tsx(8,3): error TS7031: Binding element 'getUrgencyIcon' implicitly has an 'any' type.
src/components/settings/sections/AccountSettingsSection.tsx(11,3): error TS7031: Binding element 'currentUser' implicitly has an 'any' type.
src/components/settings/sections/AccountSettingsSection.tsx(12,3): error TS7031: Binding element 'onOpenPasswordModal' implicitly has an 'any' type.
src/components/settings/sections/AccountSettingsSection.tsx(13,3): error TS7031: Binding element 'onLogout' implicitly has an 'any' type.
src/components/settings/sections/AccountSettingsSection.tsx(14,3): error TS7031: Binding element 'onOpenResetConfirm' implicitly has an 'any' type.
src/components/settings/sections/AccountSettingsSection.tsx(15,3): error TS7031: Binding element 'onUpdateProfile' implicitly has an 'any' type.
src/components/settings/sections/GeneralSettingsSection.tsx(286,53): error TS2339: Property 'manualInstall' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/components/settings/sections/GeneralSettingsSection.tsx(303,53): error TS2538: Type 'unknown' cannot be used as an index type.
src/components/settings/sections/NotificationSettingsSection.tsx(264,27): error TS2322: Type 'string | null' is not assignable to type 'PermissionStatus | null'.
  Type 'string' is not assignable to type 'PermissionStatus'.
src/components/settings/sections/SecuritySettingsSection.tsx(6,3): error TS7031: Binding element 'securityManager' implicitly has an 'any' type.
src/components/settings/sections/SecuritySettingsSection.tsx(7,3): error TS7031: Binding element 'onOpenSecuritySettings' implicitly has an 'any' type.
src/components/settings/sections/SecuritySettingsSection.tsx(8,3): error TS7031: Binding element 'onShowLocalDataSecurity' implicitly has an 'any' type.
src/components/settings/sections/SecurityStatusSection.tsx(9,3): error TS7031: Binding element 'isLocked' implicitly has an 'any' type.
src/components/settings/sections/SecurityStatusSection.tsx(10,3): error TS7031: Binding element 'securitySettings' implicitly has an 'any' type.
src/components/settings/sections/SecurityStatusSection.tsx(11,3): error TS7031: Binding element 'securityEvents' implicitly has an 'any' type.
src/components/settings/sections/SecurityStatusSection.tsx(12,3): error TS7031: Binding element 'timeUntilAutoLock' implicitly has an 'any' type.
src/components/settings/sections/SyncDebugToolsSection.tsx(10,5): error TS2717: Subsequent property declarations must have the same type.  Property 'getQuickSyncStatus' must be of type '(() => Promise<any>) | undefined', but here has type '(() => Promise<unknown>) | undefined'.
src/components/settings/sections/SyncDebugToolsSection.tsx(11,5): error TS2717: Subsequent property declarations must have the same type.  Property 'runMasterSyncValidation' must be of type '(() => Promise<ValidationResults>) | undefined', but here has type '(() => Promise<unknown>) | undefined'.
src/components/settings/sections/SyncDebugToolsSection.tsx(12,5): error TS2687: All declarations of 'detectLocalDataDebug' must have identical modifiers.
src/components/settings/sections/SyncDebugToolsSection.tsx(13,5): error TS2687: All declarations of 'hasLocalDataDebug' must have identical modifiers.
src/components/settings/sections/SyncDebugToolsSection.tsx(14,5): error TS2717: Subsequent property declarations must have the same type.  Property 'forceCloudDataReset' must be of type '(() => Promise<{ success: boolean; message?: string | undefined; error?: string | undefined; }>) | undefined', but here has type '(() => Promise<unknown>) | undefined'.
src/components/settings/sections/SyncDebugToolsSection.tsx(103,40): error TS2722: Cannot invoke an object which is possibly 'undefined'.
src/components/settings/sections/SyncDebugToolsSection.tsx(103,40): error TS18048: 'window.detectLocalDataDebug' is possibly 'undefined'.
src/components/settings/sections/SyncDebugToolsSection.tsx(126,40): error TS2722: Cannot invoke an object which is possibly 'undefined'.
src/components/settings/sections/SyncDebugToolsSection.tsx(126,40): error TS18048: 'window.hasLocalDataDebug' is possibly 'undefined'.
src/components/sharing/JoinBudgetModal.tsx(17,28): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/sharing/JoinBudgetModal.tsx(17,36): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/sharing/JoinBudgetModal.tsx(17,45): error TS7031: Binding element 'onJoinSuccess' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(9,3): error TS7031: Binding element 'shareInfo' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(10,3): error TS7031: Binding element 'creatorInfo' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(11,3): error TS7031: Binding element 'password' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(12,3): error TS7031: Binding element 'setPassword' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(13,3): error TS7031: Binding element 'showPassword' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(14,3): error TS7031: Binding element 'setShowPassword' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(15,3): error TS7031: Binding element 'userName' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(16,3): error TS7031: Binding element 'setUserName' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(17,3): error TS7031: Binding element 'userColor' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(18,3): error TS7031: Binding element 'onGenerateRandomColor' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(19,3): error TS7031: Binding element 'onJoin' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(20,3): error TS7031: Binding element 'onBack' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(21,3): error TS7031: Binding element 'isJoining' implicitly has an 'any' type.
src/components/sharing/steps/UserSetupStep.tsx(23,25): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/sync/ConflictResolutionModal.tsx(26,36): error TS7031: Binding element 'syncConflicts' implicitly has an 'any' type.
src/components/sync/ConflictResolutionModal.tsx(26,51): error TS7031: Binding element 'onResolveConflict' implicitly has an 'any' type.
src/components/sync/ConflictResolutionModal.tsx(26,70): error TS7031: Binding element 'onDismiss' implicitly has an 'any' type.
src/components/sync/health/SyncHealthDetails.tsx(56,50): error TS2345: Argument of type 'SyncStatus' is not assignable to parameter of type 'SyncStatus'.
  Index signature for type 'string' is missing in type 'SyncStatus'.
src/components/sync/health/SyncHealthDetails.tsx(58,56): error TS2345: Argument of type 'RecoveryResult | null' is not assignable to parameter of type 'RecoveryResult | null'.
  Type 'RecoveryResult' is not assignable to type 'RecoveryResult'. Two different types with this name exist, but they are unrelated.
    Index signature for type 'string' is missing in type 'RecoveryResult'.
src/components/sync/health/SyncHealthDetails.tsx(109,16): error TS18048: 'syncStatus.failedTests' is possibly 'undefined'.
src/components/sync/health/SyncHealthDetails.tsx(111,13): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/sync/health/SyncHealthDetails.tsx(142,13): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/sync/health/SyncStatusIndicator.tsx(27,32): error TS7031: Binding element 'syncStatus' implicitly has an 'any' type.
src/components/sync/health/SyncStatusIndicator.tsx(27,44): error TS7031: Binding element 'isBackgroundSyncing' implicitly has an 'any' type.
src/components/sync/health/SyncStatusIndicator.tsx(27,65): error TS7031: Binding element 'onClick' implicitly has an 'any' type.
src/components/sync/health/SyncStatusIndicator.tsx(27,74): error TS7031: Binding element 'showDetails' implicitly has an 'any' type.
src/components/transactions/TransactionLedger.tsx(176,7): error TS2322: Type 'unknown' is not assignable to type 'number'.
src/components/transactions/TransactionLedger.tsx(178,7): error TS2322: Type 'unknown' is not assignable to type 'unknown[]'.
src/components/transactions/TransactionLedger.tsx(180,7): error TS2322: Type 'unknown' is not assignable to type 'Record<string, string>'.
src/components/transactions/TransactionLedger.tsx(182,7): error TS2322: Type 'unknown' is not assignable to type '{ current: number; total: number; percentage: number; }'.
src/components/transactions/TransactionLedger.tsx(184,7): error TS2322: Type '(file: File) => void' is not assignable to type '(data: unknown[]) => void'.
  Types of parameters 'file' and 'data' are incompatible.
    Type 'unknown[]' is missing the following properties from type 'File': lastModified, name, webkitRelativePath, size, and 5 more.
src/components/transactions/TransactionLedger.tsx(476,7): error TS2322: Type 'Dispatch<SetStateAction<null>>' is not assignable to type '(transaction: Transaction | null) => void'.
  Types of parameters 'value' and 'transaction' are incompatible.
    Type 'Transaction | null' is not assignable to type 'SetStateAction<null>'.
      Type 'Transaction' is not assignable to type 'SetStateAction<null>'.
        Type 'Transaction' provides no match for the signature '(prevState: null): null'.
src/components/transactions/TransactionLedger.tsx(486,7): error TS2322: Type 'Dispatch<SetStateAction<{ date: string; description: string; amount: string; type: string; envelopeId: string; category: string; notes: string; reconciled: boolean; }>>' is not assignable to type '(form: unknown) => void'.
  Types of parameters 'value' and 'form' are incompatible.
    Type 'unknown' is not assignable to type 'SetStateAction<{ date: string; description: string; amount: string; type: string; envelopeId: string; category: string; notes: string; reconciled: boolean; }>'.
src/components/transactions/TransactionLedger.tsx(495,7): error TS2322: Type '(step: number) => void' is not assignable to type '(step: unknown) => void'.
  Types of parameters 'step' and 'step' are incompatible.
    Type 'unknown' is not assignable to type 'number'.
src/components/transactions/TransactionLedger.tsx(498,7): error TS2322: Type '(mapping: FieldMapping) => void' is not assignable to type '(mapping: unknown) => void'.
  Types of parameters 'mapping' and 'mapping' are incompatible.
    Type 'unknown' is not assignable to type 'FieldMapping'.
src/components/transactions/TransactionSplitter.tsx(34,5): error TS2322: Type 'Transaction | null' is not assignable to type 'Transaction | undefined'.
  Type 'null' is not assignable to type 'Transaction | undefined'.
src/components/transactions/TransactionSplitter.tsx(102,19): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").SplitAllocation[]' is not assignable to type 'SplitAllocation[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").SplitAllocation' is not assignable to type 'SplitAllocation'.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/transactions/TransactionSplitter.tsx(103,19): error TS2322: Type 'string[]' is not assignable to type 'Category[]'.
  Type 'string' is not assignable to type 'Category'.
src/components/transactions/TransactionSplitter.tsx(104,19): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope[]' is not assignable to type 'Envelope[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope' is not assignable to type 'Envelope'.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/transactions/TransactionSplitter.tsx(106,19): error TS2322: Type '(splitId: string, field: keyof SplitAllocation, value: unknown) => void' is not assignable to type '(id: string, updates: Record<string, unknown>) => void'.
  Target signature provides too few arguments. Expected 3 or more, but got 2.
src/components/transactions/TransactionSplitter.tsx(126,13): error TS2322: Type 'string[]' is not assignable to type 'never[]'.
  Type 'string' is not assignable to type 'never'.
src/components/transactions/TransactionTable.tsx(139,21): error TS2322: Type '(transaction: Transaction) => void' is not assignable to type '(transactionId: string) => void'.
  Types of parameters 'transaction' and 'transactionId' are incompatible.
    Type 'string' is not assignable to type 'Transaction'.
src/components/transactions/TransactionTable.tsx(322,27): error TS2345: Argument of type 'Transaction[]' is not assignable to parameter of type 'never[]'.
  Type 'Transaction' is not assignable to type 'never'.
src/components/transactions/TransactionTable.tsx(326,36): error TS2339: Property 'id' does not exist on type 'never'.
src/components/transactions/TransactionTable.tsx(374,40): error TS2339: Property 'id' does not exist on type 'never'.
src/components/transactions/TransactionTable.tsx(376,42): error TS2339: Property 'description' does not exist on type 'never'.
src/components/transactions/components/DeleteConfirmation.tsx(8,31): error TS7031: Binding element 'transaction' implicitly has an 'any' type.
src/components/transactions/components/DeleteConfirmation.tsx(8,44): error TS7031: Binding element 'onConfirm' implicitly has an 'any' type.
src/components/transactions/components/DeleteConfirmation.tsx(8,55): error TS7031: Binding element 'onCancel' implicitly has an 'any' type.
src/components/transactions/components/DeleteConfirmation.tsx(8,65): error TS7031: Binding element 'virtualRow' implicitly has an 'any' type.
src/components/transactions/components/DeleteConfirmation.tsx(8,77): error TS7031: Binding element 'gridTemplate' implicitly has an 'any' type.
src/components/transactions/components/TransactionRow.tsx(39,60): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type 'unknown' is not assignable to type 'Envelope'.
src/components/transactions/components/TransactionRow.tsx(134,42): error TS2345: Argument of type 'Transaction' is not assignable to parameter of type 'string'.
src/components/transactions/import/ImportModal.tsx(59,44): error TS2322: Type '(data: unknown[]) => void' is not assignable to type '(event: ChangeEvent<HTMLInputElement>, options: { clearExisting: boolean; }) => void'.
  Types of parameters 'data' and 'event' are incompatible.
    Type 'ChangeEvent<HTMLInputElement>' is missing the following properties from type 'unknown[]': length, pop, push, concat, and 29 more.
src/components/transactions/import/ImportModal.tsx(63,13): error TS2322: Type 'unknown[]' is not assignable to type 'ImportData | DataRow[]'.
  Type 'unknown[]' is not assignable to type 'DataRow[]'.
    Type 'unknown' is not assignable to type 'DataRow'.
src/components/transactions/import/ImportModal.tsx(65,13): error TS2322: Type '(mapping: Record<string, string>) => void' is not assignable to type '(mapping: FieldMapping) => void'.
  Types of parameters 'mapping' and 'mapping' are incompatible.
    Type 'FieldMapping' is not assignable to type 'Record<string, string>'.
      'string' index signatures are incompatible.
        Type 'string | undefined' is not assignable to type 'string'.
          Type 'undefined' is not assignable to type 'string'.
src/components/transactions/import/ImportModal.tsx(72,51): error TS2322: Type '{ current: number; total: number; percentage: number; }' is not assignable to type 'number'.
src/components/transactions/ledger/TransactionLedgerHeader.tsx(7,3): error TS7031: Binding element 'transactionCount' implicitly has an 'any' type.
src/components/transactions/ledger/TransactionLedgerHeader.tsx(8,3): error TS7031: Binding element 'netCashFlow' implicitly has an 'any' type.
src/components/transactions/ledger/TransactionLedgerHeader.tsx(9,3): error TS7031: Binding element 'onAddTransaction' implicitly has an 'any' type.
src/components/transactions/ledger/TransactionLedgerHeader.tsx(10,3): error TS7031: Binding element 'onImportTransactions' implicitly has an 'any' type.
src/components/transactions/ledger/TransactionPagination.tsx(3,34): error TS7031: Binding element 'currentPage' implicitly has an 'any' type.
src/components/transactions/ledger/TransactionPagination.tsx(3,47): error TS7031: Binding element 'totalPages' implicitly has an 'any' type.
src/components/transactions/ledger/TransactionPagination.tsx(3,59): error TS7031: Binding element 'onPageChange' implicitly has an 'any' type.
src/components/transactions/splitter/SplitActions.tsx(5,25): error TS7031: Binding element 'totals' implicitly has an 'any' type.
src/components/transactions/splitter/SplitActions.tsx(5,33): error TS7031: Binding element 'hasUnsavedChanges' implicitly has an 'any' type.
src/components/transactions/splitter/SplitActions.tsx(5,52): error TS7031: Binding element 'isSaving' implicitly has an 'any' type.
src/components/transactions/splitter/SplitActions.tsx(5,75): error TS7031: Binding element 'onSave' implicitly has an 'any' type.
src/components/transactions/splitter/SplitActions.tsx(5,83): error TS7031: Binding element 'onCancel' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationsSection.tsx(117,13): error TS2739: Type 'SplitAllocation' is missing the following properties from type 'Split': description, amount, category
src/components/transactions/splitter/SplitAllocationsSection.tsx(120,13): error TS2322: Type '(id: string, updates: Record<string, unknown>) => void' is not assignable to type '(id: string, field: string, value: string | number) => void'.
  Types of parameters 'updates' and 'field' are incompatible.
    Type 'string' is not assignable to type 'Record<string, unknown>'.
src/components/transactions/splitter/SplitAllocationsSection.tsx(122,13): error TS2322: Type 'Category[]' is not assignable to type 'string[]'.
  Type 'Category' is not assignable to type 'string'.
src/components/transactions/splitter/SplitTotals.tsx(5,24): error TS7031: Binding element 'totals' implicitly has an 'any' type.
src/components/transactions/splitter/SplitterHeader.tsx(5,27): error TS7031: Binding element 'transaction' implicitly has an 'any' type.
src/components/transactions/splitter/SplitterHeader.tsx(5,40): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/transactions/splitter/SplitterHeader.tsx(5,49): error TS7031: Binding element 'hasUnsavedChanges' implicitly has an 'any' type.
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
src/db/budgetDb.ts(208,23): error TS2345: Argument of type 'Table<Envelope, string, Envelope>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(209,23): error TS2345: Argument of type 'Table<Transaction, string, Transaction>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(210,23): error TS2345: Argument of type 'Table<Bill, string, Bill>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(211,23): error TS2345: Argument of type 'Table<SavingsGoal, string, SavingsGoal>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(212,23): error TS2345: Argument of type 'Table<PaycheckHistory, string, PaycheckHistory>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(213,23): error TS2345: Argument of type 'Table<Debt, string, Debt>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(583,5): error TS2322: Type 'BudgetRecord | undefined' is not assignable to type 'BudgetRecord | null'.
  Type 'undefined' is not assignable to type 'BudgetRecord | null'.
src/db/budgetDb.ts(607,5): error TS2322: Type 'BudgetRecord | undefined' is not assignable to type 'BudgetRecord | null'.
  Type 'undefined' is not assignable to type 'BudgetRecord | null'.
src/hooks/accounts/useSupplementalAccounts.ts(97,43): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/hooks/accounts/useSupplementalAccounts.ts(109,44): error TS2345: Argument of type 'Account' is not assignable to parameter of type 'Account'.
  Type 'Account' is missing the following properties from type 'Account': type, currentBalance, color, isActive
src/hooks/accounts/useSupplementalAccounts.ts(134,7): error TS2322: Type '(account: Account) => void' is not assignable to type '(id: string, data: unknown) => void'.
  Types of parameters 'account' and 'id' are incompatible.
    Type 'string' is not assignable to type 'Account'.
src/hooks/accounts/useSupplementalAccounts.ts(135,7): error TS2322: Type '(account: Account) => void' is not assignable to type '(data: unknown) => void'.
  Types of parameters 'account' and 'data' are incompatible.
    Type 'unknown' is not assignable to type 'Account'.
src/hooks/accounts/useSupplementalAccounts.ts(143,22): error TS2345: Argument of type 'Account' is not assignable to parameter of type 'Account'.
  Type 'Account' is missing the following properties from type 'Account': type, currentBalance, color, isActive
src/hooks/accounts/useSupplementalAccounts.ts(157,7): error TS2345: Argument of type 'TransferringAccount' is not assignable to parameter of type 'Account'.
  Type 'TransferringAccount' is missing the following properties from type 'Account': type, currentBalance, color, isActive
src/hooks/accounts/useSupplementalAccounts.ts(172,35): error TS2345: Argument of type 'TransferringAccount | null' is not assignable to parameter of type 'TransferringAccount'.
  Type 'null' is not assignable to type 'TransferringAccount'.
src/hooks/accounts/useSupplementalAccounts.ts(192,48): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'never[]'.
  Type 'unknown' is not assignable to type 'never'.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(16,11): error TS2339: Property 'paycheckHistory' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...'.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(17,5): error TS2345: Argument of type '(state: { paycheckHistory?: PaycheckItem[] | undefined; }) => { paycheckHistory: PaycheckItem[]; }' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: { paycheckHistory?: PaycheckItem[] | undefined; }) => { paycheckHistory: PaycheckItem[]; }' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Type '{ paycheckHistory: PaycheckItem[]; }' is not assignable to type 'StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
      Type '{ paycheckHistory: PaycheckItem[]; }' is missing the following properties from type 'StoreState': biweeklyAllocation, isUnassignedCashModalOpen, isActualBalanceManual, isOnline, and 9 more.
src/hooks/analytics/useAnalyticsIntegration.ts(129,36): error TS7006: Parameter 'newTimeFilter' implicitly has an 'any' type.
src/hooks/analytics/useBillAnalysis.ts(13,65): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'BillItem[]'.
  Type 'unknown' is not assignable to type 'BillItem'.
src/hooks/analytics/useBillAnalysis.ts(14,69): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'BillItem[]'.
  Type 'unknown' is not assignable to type 'BillItem'.
src/hooks/analytics/useChartsAnalytics.ts(39,6): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/analytics/useChartsAnalytics.ts(47,46): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/hooks/analytics/useChartsAnalytics.ts(51,40): error TS7006: Parameter 'tabId' implicitly has an 'any' type.
src/hooks/analytics/useReportExporter.ts(48,9): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/hooks/analytics/useReportExporter.ts(58,37): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'AnalyticsData'.
src/hooks/analytics/useReportExporter.ts(112,41): error TS2322: Type 'unknown' is not assignable to type 'string'.
src/hooks/analytics/useReportExporter.ts(129,24): error TS2345: Argument of type '(prev: { includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; } | null; }) => { ...; }' is not assignable to parameter of type 'SetStateAction<{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; } | null; }>'.
  Type '(prev: { includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; } | null; }) => { ...; }' is not assignable to type '(prevState: { includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; } | null; }) => { ...; }'.
    Call signature return types '{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: unknown; }' and '{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; } | null; }' are incompatible.
      The types of 'customDateRange' are incompatible between these types.
        Type 'unknown' is not assignable to type '{ start: string; end: string; } | null'.
src/hooks/analytics/useTransactionAnalysis.ts(11,40): error TS7006: Parameter 'filteredTransactions' implicitly has an 'any' type.
src/hooks/analytics/useTransactionAnalysis.ts(11,62): error TS7006: Parameter 'allTransactions' implicitly has an 'any' type.
src/hooks/analytics/useTransactionAnalysis.ts(11,79): error TS7006: Parameter 'settings' implicitly has an 'any' type.
src/hooks/analytics/useTransactionFiltering.ts(15,23): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ 7: Date; 30: Date; 90: Date; "6months": Date; }'.
  No index signature with a parameter of type 'string' was found on type '{ 7: Date; 30: Date; 90: Date; "6months": Date; }'.
src/hooks/analytics/utils/csvImageExportUtils.ts(97,57): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/analytics/utils/pdfGeneratorUtils.ts(85,30): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'AnalyticsData'.
src/hooks/analytics/utils/pdfGeneratorUtils.ts(94,39): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'BalanceData'.
src/hooks/auth/authOperations.ts(12,4): error TS7006: Parameter 'loginMutation' implicitly has an 'any' type.
src/hooks/auth/authOperations.ts(13,10): error TS7006: Parameter 'password' implicitly has an 'any' type.
src/hooks/auth/authOperations.ts(35,39): error TS18046: 'error' is of type 'unknown'.
src/hooks/auth/authOperations.ts(42,43): error TS7006: Parameter 'joinBudgetMutation' implicitly has an 'any' type.
src/hooks/auth/authOperations.ts(42,73): error TS7006: Parameter 'joinData' implicitly has an 'any' type.
src/hooks/auth/authOperations.ts(61,14): error TS18046: 'error' is of type 'unknown'.
src/hooks/auth/authOperations.ts(69,39): error TS7006: Parameter 'logoutMutation' implicitly has an 'any' type.
src/hooks/auth/authOperations.ts(86,4): error TS7006: Parameter 'changePasswordMutation' implicitly has an 'any' type.
src/hooks/auth/authOperations.ts(86,28): error TS7006: Parameter 'authContext' implicitly has an 'any' type.
src/hooks/auth/authOperations.ts(86,51): error TS7006: Parameter 'oldPassword' implicitly has an 'any' type.
src/hooks/auth/authOperations.ts(86,64): error TS7006: Parameter 'newPassword' implicitly has an 'any' type.
src/hooks/auth/authOperations.ts(109,16): error TS18046: 'error' is of type 'unknown'.
src/hooks/auth/authOperations.ts(117,46): error TS7006: Parameter 'updateProfileMutation' implicitly has an 'any' type.
src/hooks/auth/authOperations.ts(117,79): error TS7006: Parameter 'updatedProfile' implicitly has an 'any' type.
src/hooks/auth/authOperations.ts(135,14): error TS18046: 'error' is of type 'unknown'.
src/hooks/auth/authOperations.ts(143,44): error TS7006: Parameter 'authContext' implicitly has an 'any' type.
src/hooks/auth/authOperations.ts(151,47): error TS7006: Parameter 'authContext' implicitly has an 'any' type.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(194,46): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(203,18): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string | null'.
  Type 'undefined' is not assignable to type 'string | null'.
src/hooks/auth/mutations/useLoginMutations.ts(53,40): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/hooks/auth/mutations/useLoginMutations.ts(313,7): error TS2322: Type 'null' is not assignable to type 'Record<string, unknown>'.
src/hooks/auth/mutations/useLoginMutations.ts(356,18): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string | null'.
  Type 'undefined' is not assignable to type 'string | null'.
src/hooks/auth/mutations/usePasswordMutations.ts(61,13): error TS18046: 'error' is of type 'unknown'.
src/hooks/auth/mutations/usePasswordMutations.ts(61,48): error TS18046: 'error' is of type 'unknown'.
src/hooks/auth/mutations/usePasswordMutations.ts(64,41): error TS18046: 'error' is of type 'unknown'.
src/hooks/auth/mutations/useProfileMutations.ts(37,44): error TS2345: Argument of type '{ userName: string | undefined; userColor: string | undefined; }' is not assignable to parameter of type '{ userName: string; userColor: string; shareCode?: string | undefined; joinedVia?: string | undefined; sharedBy?: string | undefined; }'.
  Types of property 'userName' are incompatible.
    Type 'string | undefined' is not assignable to type 'string'.
      Type 'undefined' is not assignable to type 'string'.
src/hooks/auth/mutations/useProfileMutations.ts(67,20): error TS2345: Argument of type 'UpdateProfileInput | undefined' is not assignable to parameter of type 'Partial<UserData>'.
  Type 'undefined' is not assignable to type 'Partial<UserData>'.
src/hooks/auth/queries/usePasswordValidation.ts(13,16): error TS7006: Parameter 'password' implicitly has an 'any' type.
src/hooks/auth/queries/usePasswordValidation.ts(74,39): error TS7006: Parameter 'password' implicitly has an 'any' type.
src/hooks/auth/queries/usePasswordValidation.ts(111,18): error TS18046: 'error' is of type 'unknown'.
src/hooks/auth/useAuthCompatibility.ts(30,56): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'null | undefined'.
src/hooks/auth/useAuthCompatibility.ts(44,30): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Partial<UserData>'.
src/hooks/auth/useAuthFlow.ts(69,58): error TS2345: Argument of type '(password: any, userData?: null) => Promise<any>' is not assignable to parameter of type 'LoginFunction'.
  Types of parameters 'userData' and 'userData' are incompatible.
    Type 'UserData | null' is not assignable to type 'null | undefined'.
      Type 'UserData' is not assignable to type 'null | undefined'.
src/hooks/auth/useAuthFlow.ts(73,57): error TS2345: Argument of type 'UserData | null' is not assignable to parameter of type 'UserData'.
  Type 'null' is not assignable to type 'UserData'.
src/hooks/auth/useAuthFlow.ts(77,51): error TS2345: Argument of type 'UserData | null' is not assignable to parameter of type 'UserData'.
  Type 'null' is not assignable to type 'UserData'.
src/hooks/auth/useAuthManager.ts(95,31): error TS7006: Parameter 'password' implicitly has an 'any' type.
src/hooks/auth/useAuthenticationManager.ts(85,45): error TS2339: Property 'budgetId' does not exist on type 'never'.
src/hooks/auth/useAuthenticationManager.ts(86,39): error TS2339: Property 'budgetId' does not exist on type 'never'.
src/hooks/auth/useAuthenticationManager.ts(132,34): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string | UserData'.
src/hooks/auth/useAuthenticationManager.ts(138,5): error TS2322: Type '(updatedProfile: UserProfile) => Promise<void>' is not assignable to type '(updatedProfile: unknown) => void'.
  Types of parameters 'updatedProfile' and 'updatedProfile' are incompatible.
    Type 'unknown' is not assignable to type 'UserProfile'.
src/hooks/auth/useKeyManagement.ts(321,56): error TS2345: Argument of type '{ budgetId: string; importedSalt: Uint8Array<ArrayBufferLike>; }' is not assignable to parameter of type 'null | undefined'.
src/hooks/auth/useKeyManagementUI.ts(164,5): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/hooks/bills/useBillManager.ts(93,18): error TS2352: Conversion of type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...' to type 'BudgetState' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
src/hooks/bills/useBillManager.ts(94,5): error TS2345: Argument of type '(state: BudgetState) => { allTransactions: Transaction[]; envelopes: Envelope[]; bills: Bill[]; }' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => { allTransactions: Transaction[]; envelopes: Envelope[]; bills: Bill[]; }' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'BudgetState'.
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
src/hooks/bills/useBillManager.ts(197,5): error TS2322: Type '(bills: Bill[]) => void' is not assignable to type '(bills: Set<string>) => void'.
  Types of parameters 'bills' and 'bills' are incompatible.
    Type 'Set<string>' is missing the following properties from type 'Bill[]': length, pop, push, concat, and 24 more.
src/hooks/bills/useBillManager.ts(197,23): error TS2352: Conversion of type 'Dispatch<SetStateAction<Set<unknown>>>' to type '(bills: Bill[]) => void' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of parameters 'value' and 'bills' are incompatible.
    Type 'Bill[]' is not comparable to type 'SetStateAction<Set<unknown>>'.
      Type 'Bill[]' is missing the following properties from type 'Set<unknown>': add, clear, delete, has, and 2 more.
src/hooks/bills/useBillManager.ts(199,5): error TS2322: Type '(bill: Bill | null) => void' is not assignable to type '(bill: BillRecord | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillRecord | null' is not assignable to type 'Bill | null'.
      Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManager.ts(201,5): error TS2322: Type '(bill: Bill | null) => void' is not assignable to type '(bill: BillRecord | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillRecord | null' is not assignable to type 'Bill | null'.
      Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManager.ts(204,5): error TS2322: Type '(bill: Bill | null) => void' is not assignable to type '(bill: BillRecord | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillRecord | null' is not assignable to type 'Bill | null'.
      Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManagerDisplayLogic.ts(36,26): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/hooks/bills/useBillManagerHelpers.ts(260,48): error TS2345: Argument of type 'BillRecord' is not assignable to parameter of type 'Bill'.
  Type 'BillRecord' is missing the following properties from type 'Bill': frequency, color
src/hooks/bills/useBillManagerHelpers.ts(262,22): error TS2345: Argument of type 'Bill' is not assignable to parameter of type 'BillRecord'.
  Index signature for type 'string' is missing in type 'Bill'.
src/hooks/bills/useBillManagerHelpers.ts(276,52): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/bills").Bill' is not assignable to parameter of type 'Bill'.
  Index signature for type 'string' is missing in type 'Bill'.
src/hooks/bills/useBillManagerHelpers.ts(285,44): error TS2345: Argument of type 'BillRecord[]' is not assignable to parameter of type 'Bill[]'.
  Type 'BillRecord' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'string | Date | null' is not assignable to type 'string | Date | undefined'.
        Type 'null' is not assignable to type 'string | Date | undefined'.
src/hooks/bills/useBillManagerHelpers.ts(316,22): error TS2345: Argument of type 'BillRecord[]' is not assignable to parameter of type 'Bill[]'.
  Type 'BillRecord' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'string | Date | null' is not assignable to type 'string | Date | undefined'.
        Type 'null' is not assignable to type 'string | Date | undefined'.
src/hooks/bills/useBillManagerUI.ts(101,50): error TS2345: Argument of type '(bill: { id: string; }) => string' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => string'.
  Types of parameters 'bill' and 'value' are incompatible.
    Type 'unknown' is not assignable to type '{ id: string; }'.
src/hooks/bills/useBillOperationWrappers.ts(38,12): error TS7006: Parameter 'updatedBills' implicitly has an 'any' type.
src/hooks/bills/useBillOperationWrappers.ts(47,30): error TS18046: 'error' is of type 'unknown'.
src/hooks/bills/useBillOperationWrappers.ts(83,12): error TS7006: Parameter 'billIds' implicitly has an 'any' type.
src/hooks/bills/useBillOperationWrappers.ts(92,30): error TS18046: 'error' is of type 'unknown'.
src/hooks/bills/useBillOperations.ts(42,77): error TS2345: Argument of type 'Envelope[]' is not assignable to parameter of type 'never[]'.
  Type 'Envelope' is not assignable to type 'never'.
src/hooks/bills/useBillOperations.ts(68,7): error TS2322: Type '(updatedBills: Bill[]) => Promise<BulkOperationResult>' is not assignable to type '(updatedBills: unknown[]) => Promise<{ success: boolean; successCount: number; errorCount: number; errors: string[]; message: string; }>'.
  Types of parameters 'updatedBills' and 'updatedBills' are incompatible.
    Type 'unknown[]' is not assignable to type 'Bill[]'.
      Type 'unknown' is not assignable to type 'Bill'.
src/hooks/bills/useBillValidation.ts(15,6): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/hooks/bills/useBillValidation.ts(32,59): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/bills/useBillValidation.ts(48,6): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/hooks/bills/useBillValidation.ts(48,12): error TS7006: Parameter 'changes' implicitly has an 'any' type.
src/hooks/bills/useBills/index.ts(43,5): error TS2783: 'upcomingBills' is specified more than once, so this usage will be overwritten.
src/hooks/bills/useBulkBillOperations.ts(31,39): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFunding.ts(41,18): error TS2352: Conversion of type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...' to type 'BudgetContext' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(42,5): error TS2345: Argument of type '(state: BudgetSelector) => { envelopes: Envelope[] | undefined; unassignedCash: number | undefined; allTransactions: Transaction[] | undefined; }' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetSelector) => { envelopes: Envelope[] | undefined; unassignedCash: number | undefined; allTransactions: Transaction[] | undefined; }' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Type '{ envelopes: Envelope[] | undefined; unassignedCash: number | undefined; allTransactions: Transaction[] | undefined; }' is not assignable to type 'StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
      Type '{ envelopes: Envelope[] | undefined; unassignedCash: number | undefined; allTransactions: Transaction[] | undefined; }' is missing the following properties from type 'StoreState': biweeklyAllocation, isUnassignedCashModalOpen, paycheckHistory, isActualBalanceManual, and 10 more.
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
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(23,46): error TS2339: Property 'budget' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(36,25): error TS2345: Argument of type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>' is not assignable to parameter of type 'Budget'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(58,31): error TS2339: Property 'envelopes' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(59,36): error TS2339: Property 'unassignedCash' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(60,34): error TS2339: Property 'allTransactions' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(71,54): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type 'unknown' is not assignable to type 'AutoFundingRule'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(76,28): error TS18048: 'result.execution' is possibly 'undefined'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(77,26): error TS18048: 'result.execution' is possibly 'undefined'.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionSummary.ts(7,37): error TS7006: Parameter 'lastExecution' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionSummary.ts(23,47): error TS7006: Parameter 'r' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingHistory.ts(74,45): error TS2345: Argument of type 'ExecutionRecord[]' is not assignable to parameter of type 'ExecutionHistoryItem[]'.
  Type 'ExecutionRecord' is not assignable to type 'ExecutionHistoryItem'.
    Types of property 'executedAt' are incompatible.
      Type 'string | undefined' is not assignable to type 'string | number | Date'.
        Type 'undefined' is not assignable to type 'string | number | Date'.
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
src/hooks/budgeting/autofunding/useUndoOperations.ts(190,46): error TS2339: Property 'budget' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/hooks/budgeting/autofunding/useUndoOperations.ts(241,22): error TS2339: Property 'transferFunds' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
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
src/hooks/budgeting/useBudgetData/queries.ts(9,30): error TS7006: Parameter 'queries' implicitly has an 'any' type.
src/hooks/budgeting/useBudgetData/queries.ts(10,24): error TS7006: Parameter 'query' implicitly has an 'any' type.
src/hooks/budgeting/useBudgetData/queries.ts(13,28): error TS7006: Parameter 'queries' implicitly has an 'any' type.
src/hooks/budgeting/useBudgetData/queries.ts(14,24): error TS7006: Parameter 'query' implicitly has an 'any' type.
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
src/hooks/budgeting/useEnvelopeEdit.ts(66,31): error TS2345: Argument of type 'string | number | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/hooks/budgeting/useEnvelopeEdit.ts(115,5): error TS2322: Type 'Envelope | null' is not assignable to type 'Record<string, unknown> | null | undefined'.
  Type 'Envelope' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type 'Envelope'.
src/hooks/budgeting/useEnvelopeEdit.ts(116,5): error TS2322: Type 'Envelope[]' is not assignable to type 'Record<string, unknown>[]'.
  Type 'Envelope' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type 'Envelope'.
src/hooks/budgeting/useEnvelopeEdit.ts(117,5): error TS2322: Type '(envelopeData: unknown) => Promise<boolean>' is not assignable to type '(data: unknown) => Promise<void>'.
  Type 'Promise<boolean>' is not assignable to type 'Promise<void>'.
    Type 'boolean' is not assignable to type 'void'.
src/hooks/budgeting/useEnvelopes.ts(17,54): error TS2345: Argument of type 'Envelope[]' is not assignable to parameter of type 'Envelope[]'.
  Type 'Envelope' is not assignable to type 'Envelope'. Two different types with this name exist, but they are unrelated.
    Index signature for type 'string' is missing in type 'Envelope'.
src/hooks/budgeting/useEnvelopesQuery.ts(117,22): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Envelope'.
  No index signature with a parameter of type 'string' was found on type 'Envelope'.
src/hooks/budgeting/useEnvelopesQuery.ts(118,22): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Envelope'.
  No index signature with a parameter of type 'string' was found on type 'Envelope'.
src/hooks/budgeting/usePaycheckForm.ts(67,40): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'PaycheckHistory[]'.
  Type 'unknown' is not assignable to type 'PaycheckHistory'.
src/hooks/budgeting/usePaycheckForm.ts(77,58): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'PaycheckHistory[]'.
  Type 'unknown' is not assignable to type 'PaycheckHistory'.
src/hooks/budgeting/usePaycheckForm.ts(111,85): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type 'unknown' is not assignable to type 'Envelope'.
src/hooks/budgeting/usePaycheckForm.ts(143,43): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/budgeting/usePaycheckForm.ts(174,64): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type 'unknown' is not assignable to type 'Envelope'.
src/hooks/budgeting/usePaycheckForm.ts(208,70): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'PaycheckHistory[]'.
  Type 'unknown' is not assignable to type 'PaycheckHistory'.
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
src/hooks/budgeting/useSmartSuggestions.ts(88,37): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type 'unknown' is not assignable to type 'Transaction'.
src/hooks/budgeting/useSmartSuggestions.ts(138,39): error TS2345: Argument of type '{ [key: string]: unknown; id: string; action: string; data: Record<string, unknown>; }' is not assignable to parameter of type '{ data: { [key: string]: unknown; name: string; }; }'.
  Types of property 'data' are incompatible.
    Property 'name' is missing in type 'Record<string, unknown>' but required in type '{ [key: string]: unknown; name: string; }'.
src/hooks/budgeting/useSmartSuggestions.ts(142,37): error TS2345: Argument of type '{ [key: string]: unknown; id: string; action: string; data: Record<string, unknown>; }' is not assignable to parameter of type '{ data: { [key: string]: unknown; envelopeId: string; suggestedAmount: number; currentAmount?: number | undefined; }; }'.
  Types of property 'data' are incompatible.
    Type 'Record<string, unknown>' is missing the following properties from type '{ [key: string]: unknown; envelopeId: string; suggestedAmount: number; currentAmount?: number | undefined; }': envelopeId, suggestedAmount
src/hooks/budgeting/useSmartSuggestions.ts(146,37): error TS2345: Argument of type '{ [key: string]: unknown; id: string; action: string; data: Record<string, unknown>; }' is not assignable to parameter of type '{ data: { [key: string]: unknown; envelopeId: string; suggestedAmount: number; currentAmount?: number | undefined; }; }'.
  Types of property 'data' are incompatible.
    Type 'Record<string, unknown>' is missing the following properties from type '{ [key: string]: unknown; envelopeId: string; suggestedAmount: number; currentAmount?: number | undefined; }': envelopeId, suggestedAmount
src/hooks/budgeting/useSmartSuggestions.ts(150,55): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/common/bug-report/useBugReportDiagnostics.ts(36,22): error TS2345: Argument of type '{ success: boolean; components: { screenshot: { success: boolean; screenshot: boolean; info: ScreenshotInfo | null; methods: { displayMedia: boolean; html2canvas: boolean; }; error?: undefined; } | { ...; }; systemInfo: { ...; } | { ...; }; contextAnalysis: { ...; } | { ...; }; }; timestamp: string; error?: undefine...' is not assignable to parameter of type 'SetStateAction<null>'.
  Type '{ success: boolean; components: { screenshot: { success: boolean; screenshot: boolean; info: ScreenshotInfo | null; methods: { displayMedia: boolean; html2canvas: boolean; }; error?: undefined; } | { ...; }; systemInfo: { ...; } | { ...; }; contextAnalysis: { ...; } | { ...; }; }; timestamp: string; error?: undefine...' is not assignable to type 'SetStateAction<null>'.
    Type '{ success: boolean; components: { screenshot: { success: boolean; screenshot: boolean; info: ScreenshotInfo | null; methods: { displayMedia: boolean; html2canvas: boolean; }; error?: undefined; } | { ...; }; systemInfo: { ...; } | { ...; }; contextAnalysis: { ...; } | { ...; }; }; timestamp: string; error?: undefine...' provides no match for the signature '(prevState: null): null'.
src/hooks/common/bug-report/useBugReportDiagnostics.ts(42,16): error TS18046: 'error' is of type 'unknown'.
src/hooks/common/bug-report/useBugReportDiagnostics.ts(45,22): error TS2345: Argument of type '{ success: boolean; error: any; timestamp: string; }' is not assignable to parameter of type 'SetStateAction<null>'.
  Type '{ success: boolean; error: any; timestamp: string; }' provides no match for the signature '(prevState: null): null'.
src/hooks/common/bug-report/useBugReportHighlight.ts(54,49): error TS18046: 'error' is of type 'unknown'.
src/hooks/common/bug-report/useBugReportHighlight.ts(80,60): error TS18046: 'error' is of type 'unknown'.
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
src/hooks/common/useActualBalance.ts(30,5): error TS2339: Property 'actualBalance' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...'.
src/hooks/common/useActualBalance.ts(31,5): error TS2339: Property 'isActualBalanceManual' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...'.
src/hooks/common/useActualBalance.ts(32,5): error TS2339: Property 'setActualBalance' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...'.
src/hooks/common/useActualBalance.ts(34,5): error TS2345: Argument of type '(state: BudgetState) => { actualBalance: number; isActualBalanceManual: boolean; setActualBalance: (balance: number) => void; }' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetState) => { actualBalance: number; isActualBalanceManual: boolean; setActualBalance: (balance: number) => void; }' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'BudgetState'.
src/hooks/common/useActualBalance.ts(98,6): error TS7006: Parameter 'calculatedBalance' implicitly has an 'any' type.
src/hooks/common/useActualBalance.ts(112,6): error TS7006: Parameter 'newBalance' implicitly has an 'any' type.
src/hooks/common/useActualBalance.ts(149,45): error TS7006: Parameter 'inputValue' implicitly has an 'any' type.
src/hooks/common/useBugReport.ts(60,53): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/common/useConnectionManager/useConnectionConfig.ts(6,32): error TS7006: Parameter 'entityType' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(183,40): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(196,67): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(209,55): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/common/useDataInitialization.ts(40,60): error TS2339: Property 'cloudSyncEnabled' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/hooks/common/useDataInitialization.ts(57,13): error TS2774: This condition will always return true since this function is always defined. Did you mean to call it instead?
src/hooks/common/useDataInitialization.ts(67,22): error TS18046: 'error' is of type 'unknown'.
src/hooks/common/useFABActions.ts(44,11): error TS7034: Variable 'actionIds' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/hooks/common/useFABActions.ts(47,18): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/common/useFABActions.ts(49,31): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/common/useFABActions.ts(54,7): error TS7005: Variable 'actionIds' implicitly has an 'any[]' type.
src/hooks/common/useFABActions.ts(90,34): error TS7006: Parameter 'screenId' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(166,26): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'null | undefined'.
src/hooks/common/useImportData.ts(212,11): error TS2345: Argument of type 'ImportedData & { allTransactions: unknown[]; }' is not assignable to parameter of type 'ValidatedImportData'.
  Types of property 'envelopes' are incompatible.
    Type 'unknown[] | undefined' is not assignable to type 'Envelope[] | undefined'.
      Type 'unknown[]' is not assignable to type 'Envelope[]'.
        Type 'unknown' is not assignable to type 'Envelope'.
src/hooks/common/useImportData.ts(231,29): error TS2345: Argument of type 'ImportedData & { allTransactions: unknown[]; }' is not assignable to parameter of type 'ValidatedImportData'.
  Types of property 'envelopes' are incompatible.
    Type 'unknown[] | undefined' is not assignable to type 'Envelope[] | undefined'.
      Type 'unknown[]' is not assignable to type 'Envelope[]'.
        Type 'unknown' is not assignable to type 'Envelope'.
src/hooks/common/useImportData.ts(233,34): error TS2345: Argument of type 'ImportedData & { allTransactions: unknown[]; }' is not assignable to parameter of type 'ValidatedImportData'.
  Types of property 'envelopes' are incompatible.
    Type 'unknown[] | undefined' is not assignable to type 'Envelope[] | undefined'.
      Type 'unknown[]' is not assignable to type 'Envelope[]'.
        Type 'unknown' is not assignable to type 'Envelope'.
src/hooks/common/useNetworkStatus.ts(11,59): error TS2339: Property 'setOnlineStatus' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/hooks/common/useNetworkStatus.ts(18,23): error TS2345: Argument of type 'boolean' is not assignable to parameter of type '(state: StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) => unknown'.
src/hooks/common/useNetworkStatus.ts(24,23): error TS2345: Argument of type 'boolean' is not assignable to parameter of type '(state: StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) => unknown'.
src/hooks/common/useNetworkStatus.ts(32,21): error TS2345: Argument of type 'boolean' is not assignable to parameter of type '(state: StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) => unknown'.
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
src/hooks/debts/useDebtDashboard.ts(156,35): error TS2345: Argument of type '{ amount: number; date?: string | undefined; }' is not assignable to parameter of type '{ amount: number; paymentDate: string; notes?: string | undefined; }'.
  Property 'paymentDate' is missing in type '{ amount: number; date?: string | undefined; }' but required in type '{ amount: number; paymentDate: string; notes?: string | undefined; }'.
src/hooks/debts/useDebtManagement.ts(78,7): error TS2345: Argument of type 'UseMutateAsyncFunction<{ envelopeType: string; name: string; category: string; targetAmount: number; description?: string | undefined; id: string; currentBalance: number; archived: boolean; createdAt: number; lastModified: number; }, Error, AddEnvelopeData, unknown>' is not assignable to parameter of type '(data: unknown) => unknown'.
  Types of parameters 'variables' and 'data' are incompatible.
    Type 'unknown' is not assignable to type 'AddEnvelopeData'.
src/hooks/debts/useDebtManagement.ts(134,7): error TS2322: Type 'UseMutateAsyncFunction<{ id?: string | undefined; status: string; author?: string | undefined; }, Error, { [key: string]: unknown; id?: string | undefined; status?: string | undefined; author?: string | undefined; }, unknown>' is not assignable to type '(data: DebtData) => Promise<CreatedDebt>'.
  Types of parameters 'variables' and 'data' are incompatible.
    Type 'DebtData' is not assignable to type '{ [key: string]: unknown; id?: string | undefined; status?: string | undefined; author?: string | undefined; }'.
      Index signature for type 'string' is missing in type 'DebtData'.
src/hooks/debts/useDebtManagement.ts(148,7): error TS2322: Type 'UseMutateAsyncFunction<{ id: string; }, Error, { id: string; updates: Record<string, unknown>; author?: string | undefined; }, unknown>' is not assignable to type '(params: { id: string; updates: Debt; }) => Promise<void>'.
  Types of parameters 'variables' and 'params' are incompatible.
    Type '{ id: string; updates: Debt; }' is not assignable to type '{ id: string; updates: Record<string, unknown>; author?: string | undefined; }'.
      Types of property 'updates' are incompatible.
        Type 'Debt' is not assignable to type 'Record<string, unknown>'.
          Index signature for type 'string' is missing in type 'Debt'.
src/hooks/debts/useDebtManagement.ts(161,7): error TS2322: Type 'UseMutateAsyncFunction<{ id: string; }, Error, { id: string; updates: Record<string, unknown>; author?: string | undefined; }, unknown>' is not assignable to type '(params: { id: string; updates: Partial<Debt>; }) => Promise<void>'.
  Type 'Promise<{ id: string; }>' is not assignable to type 'Promise<void>'.
    Type '{ id: string; }' is not assignable to type 'void'.
src/hooks/debts/useDebtManagement.ts(170,7): error TS2322: Type 'UseMutateAsyncFunction<{ id: string; }, Error, { id: string; updates: Record<string, unknown>; author?: string | undefined; }, unknown>' is not assignable to type '(params: { id: string; updates: Partial<Debt>; }) => Promise<void>'.
  Type 'Promise<{ id: string; }>' is not assignable to type 'Promise<void>'.
    Type '{ id: string; }' is not assignable to type 'void'.
src/hooks/debts/useDebtManagement.ts(180,59): error TS2322: Type 'UseMutateAsyncFunction<{ id: string; }, Error, { id: string; updates: Record<string, unknown>; author?: string | undefined; }, unknown>' is not assignable to type '(params: { id: string; updates: Partial<Debt>; author?: string | undefined; }) => Promise<void>'.
  Type 'Promise<{ id: string; }>' is not assignable to type 'Promise<void>'.
    Type '{ id: string; }' is not assignable to type 'void'.
src/hooks/debts/useDebtManagement.ts(200,7): error TS2322: Type 'UseMutateAsyncFunction<string, Error, { id: string; author?: string | undefined; }, unknown>' is not assignable to type '(params: { id: string; }) => Promise<void>'.
  Type 'Promise<string>' is not assignable to type 'Promise<void>'.
    Type 'string' is not assignable to type 'void'.
src/hooks/debts/useDebtModalLogic.ts(78,44): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/hooks/debts/useDebts.ts(46,28): error TS2345: Argument of type '{ id?: string; status: string; author?: string; }' is not assignable to parameter of type 'Debt'.
  Type '{ id?: string | undefined; status: string; author?: string | undefined; }' is missing the following properties from type 'Debt': name, creditor, type, currentBalance, and 2 more.
src/hooks/debts/useDebts.ts(51,5): error TS2322: Type 'null' is not assignable to type 'Debt'.
src/hooks/debts/useDebts.ts(81,5): error TS2322: Type 'Debt | null' is not assignable to type 'Debt'.
  Type 'null' is not assignable to type 'Debt'.
src/hooks/debts/useDebts.ts(82,5): error TS2322: Type 'Debt | null' is not assignable to type 'Debt'.
  Type 'null' is not assignable to type 'Debt'.
src/hooks/debts/useDebts.ts(106,7): error TS2322: Type 'null' is not assignable to type 'Debt'.
src/hooks/debts/useDebts.ts(195,20): error TS2339: Property 'name' does not exist on type '{ id?: string | undefined; status: string; author?: string | undefined; }'.
src/hooks/debts/useDebts.ts(196,20): error TS2339: Property 'type' does not exist on type '{ id?: string | undefined; status: string; author?: string | undefined; }'.
src/hooks/debts/useDebts.ts(197,30): error TS2339: Property 'currentBalance' does not exist on type '{ id?: string | undefined; status: string; author?: string | undefined; }'.
src/hooks/debts/useDebts.ts(198,28): error TS2339: Property 'interestRate' does not exist on type '{ id?: string | undefined; status: string; author?: string | undefined; }'.
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
src/hooks/layout/usePaycheckOperations.ts(75,68): error TS2345: Argument of type '{ budget: string[]; budgetData: () => string[]; budgetSummary: () => string[]; budgetMetadata: string[]; unassignedCash: () => string[]; actualBalance: () => string[]; envelopes: string[]; envelopesList: (filters?: FilterParams) => (string | FilterParams)[]; ... 48 more ...; syncActivity: () => string[]; }' is not assignable to parameter of type '{ paycheckHistory: unknown[]; budgetMetadata: unknown[]; }'.
  Types of property 'paycheckHistory' are incompatible.
    Type '() => string[]' is not assignable to type 'unknown[]'.
src/hooks/mobile/useBottomNavigation.ts(132,20): error TS7006: Parameter 'itemKey' implicitly has an 'any' type.
src/hooks/mobile/useBottomNavigation.ts(133,20): error TS7006: Parameter 'key' implicitly has an 'any' type.
src/hooks/mobile/useFABBehavior.ts(76,39): error TS2339: Property 'focus' does not exist on type 'Element'.
src/hooks/mobile/useFABBehavior.ts(127,50): error TS2345: Argument of type 'RefObject<null>' is not assignable to parameter of type 'RefObject<HTMLElement>'.
  Type 'null' is not assignable to type 'HTMLElement'.
src/hooks/mobile/useFABSmartPositioning.ts(13,9): error TS7034: Variable 'resizeTimeout' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/mobile/useFABSmartPositioning.ts(17,20): error TS7005: Variable 'resizeTimeout' implicitly has an 'any' type.
src/hooks/mobile/useFABSmartPositioning.ts(60,20): error TS7005: Variable 'resizeTimeout' implicitly has an 'any' type.
src/hooks/mobile/usePullToRefresh.ts(11,3): error TS7006: Parameter 'onRefresh' implicitly has an 'any' type.
src/hooks/mobile/usePullToRefresh.ts(21,29): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/mobile/usePullToRefresh.ts(30,32): error TS2339: Property 'scrollTop' does not exist on type 'never'.
src/hooks/mobile/usePullToRefresh.ts(35,28): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/mobile/useSlideUpModal.ts(41,37): error TS7006: Parameter 'newConfig' implicitly has an 'any' type.
src/hooks/notifications/useFirebaseMessaging.ts(32,25): error TS2345: Argument of type 'PermissionStatusForUI' is not assignable to parameter of type 'SetStateAction<string | null>'.
src/hooks/notifications/useFirebaseMessaging.ts(97,7): error TS2322: Type 'TokenResult' is not assignable to type 'PermissionResult'.
  Types of property 'token' are incompatible.
    Type 'string | null | undefined' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/hooks/notifications/useFirebaseMessaging.ts(137,54): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/notifications/useFirebaseMessaging.ts(177,45): error TS2339: Property 'canShowPrompt' does not exist on type 'string'.
src/hooks/notifications/useFirebaseMessaging.ts(178,36): error TS2339: Property 'isSupported' does not exist on type 'string'.
src/hooks/receipts/useReceiptScanner.ts(10,35): error TS7006: Parameter 'onReceiptProcessed' implicitly has an 'any' type.
src/hooks/receipts/useReceiptScanner.ts(23,37): error TS7006: Parameter 'file' implicitly has an 'any' type.
src/hooks/receipts/useReceiptScanner.ts(45,12): error TS7006: Parameter 'file' implicitly has an 'any' type.
src/hooks/receipts/useReceiptScanner.ts(48,18): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'SetStateAction<null>'.
  Type 'string' is not assignable to type 'SetStateAction<null>'.
src/hooks/receipts/useReceiptScanner.ts(59,11): error TS2353: Object literal may only specify known properties, and 'file' does not exist in type '(prevState: null) => null'.
src/hooks/receipts/useReceiptScanner.ts(74,26): error TS2345: Argument of type 'ExtendedReceiptData' is not assignable to parameter of type 'SetStateAction<null>'.
  Type 'ExtendedReceiptData' provides no match for the signature '(prevState: null): null'.
src/hooks/receipts/useReceiptScanner.ts(82,18): error TS2345: Argument of type '"Failed to process receipt. Please try again with a clearer image."' is not assignable to parameter of type 'SetStateAction<null>'.
src/hooks/receipts/useReceiptScanner.ts(93,6): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/receipts/useReceiptScanner.ts(103,39): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/receipts/useReceiptScanner.ts(109,6): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/receipts/useReceiptScanner.ts(121,9): error TS2698: Spread types may only be created from object types.
src/hooks/receipts/useReceiptScanner.ts(136,24): error TS2339: Property 'url' does not exist on type 'never'.
src/hooks/receipts/useReceiptScanner.ts(137,41): error TS2339: Property 'url' does not exist on type 'never'.
src/hooks/receipts/useReceiptScanner.ts(139,22): error TS2339: Property 'url' does not exist on type 'never'.
src/hooks/receipts/useReceiptToTransaction.ts(46,82): error TS2345: Argument of type 'Envelope[]' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope[]'.
  Type 'Envelope' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Envelope'.
    Types of property 'currentBalance' are incompatible.
      Type 'number | undefined' is not assignable to type 'number'.
        Type 'undefined' is not assignable to type 'number'.
src/hooks/receipts/useReceiptToTransaction.ts(48,28): error TS2345: Argument of type '(prev: { description: string; amount: number; date: string; envelopeId: string; category: string; type: string; notes: string; }) => { envelopeId: string | number; category: string; description: string; amount: number; date: string; type: string; notes: string; }' is not assignable to parameter of type 'SetStateAction<{ description: string; amount: number; date: string; envelopeId: string; category: string; type: string; notes: string; }>'.
  Type '(prev: { description: string; amount: number; date: string; envelopeId: string; category: string; type: string; notes: string; }) => { envelopeId: string | number; category: string; description: string; amount: number; date: string; type: string; notes: string; }' is not assignable to type '(prevState: { description: string; amount: number; date: string; envelopeId: string; category: string; type: string; notes: string; }) => { description: string; amount: number; date: string; envelopeId: string; category: string; type: string; notes: string; }'.
    Call signature return types '{ envelopeId: string | number; category: string; description: string; amount: number; date: string; type: string; notes: string; }' and '{ description: string; amount: number; date: string; envelopeId: string; category: string; type: string; notes: string; }' are incompatible.
      The types of 'envelopeId' are incompatible between these types.
        Type 'string | number' is not assignable to type 'string'.
          Type 'number' is not assignable to type 'string'.
src/hooks/receipts/useReceiptToTransaction.ts(86,37): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/hooks/receipts/useReceiptToTransaction.ts(101,9): error TS2322: Type 'string | undefined' is not assignable to type '{ url?: string | undefined; } | undefined'.
  Type 'string' has no properties in common with type '{ url?: string | undefined; }'.
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
src/hooks/settings/useSettingsDashboard.ts(103,60): error TS2339: Property 'cloudSyncEnabled' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/hooks/settings/useSettingsDashboard.ts(104,63): error TS2339: Property 'setCloudSyncEnabled' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/hooks/settings/useSettingsDashboard.ts(109,25): error TS2345: Argument of type 'boolean' is not assignable to parameter of type '(state: StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) => unknown'.
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
src/hooks/settings/useSettingsSectionRenderer.ts(135,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '(() => void) | undefined' is not assignable to type '() => void'.
      Type 'undefined' is not assignable to type '() => void'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(136,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '(() => void) | undefined' is not assignable to type '() => void'.
      Type 'undefined' is not assignable to type '() => void'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
src/hooks/sharing/useQRCodeProcessing.ts(12,26): error TS7006: Parameter 'qrData' implicitly has an 'any' type.
src/hooks/sharing/useQRCodeProcessing.ts(12,34): error TS7006: Parameter 'setShareCode' implicitly has an 'any' type.
src/hooks/sharing/useQRCodeProcessing.ts(12,48): error TS7006: Parameter 'setCreatorInfo' implicitly has an 'any' type.
src/hooks/sharing/useQRCodeProcessing.ts(12,64): error TS7006: Parameter 'validateShareCode' implicitly has an 'any' type.
src/hooks/sharing/useQRCodeProcessing.ts(31,46): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/sharing/useShareCodeValidation.ts(19,36): error TS7006: Parameter 'code' implicitly has an 'any' type.
src/hooks/sharing/useShareCodeValidation.ts(39,11): error TS2353: Object literal may only specify known properties, and 'createdBy' does not exist in type '(prevState: null) => null'.
src/hooks/sync/useFirebaseSync.ts(57,46): error TS2339: Property 'budget' does not exist on type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/hooks/sync/useFirebaseSync.ts(129,28): error TS2339: Property 'getActiveUsers' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/sync/useFirebaseSync.ts(129,54): error TS2339: Property 'getRecentActivity' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/sync/useFirebaseSync.ts(133,30): error TS2339: Property 'getActiveUsers' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
src/hooks/sync/useFirebaseSync.ts(134,33): error TS2339: Property 'getRecentActivity' does not exist on type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
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
src/hooks/transactions/useTransactionFilters.ts(41,29): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'Transaction'.
  Types of property 'envelopeId' are incompatible.
    Type 'string | number | undefined' is not assignable to type 'string | undefined'.
      Type 'number' is not assignable to type 'string'.
src/hooks/transactions/useTransactionFilters.ts(42,29): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'Transaction'.
  Types of property 'envelopeId' are incompatible.
    Type 'string | number | undefined' is not assignable to type 'string | undefined'.
      Type 'number' is not assignable to type 'string'.
src/hooks/transactions/useTransactionFilters.ts(43,33): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'Transaction'.
  Types of property 'envelopeId' are incompatible.
    Type 'string | number | undefined' is not assignable to type 'string | undefined'.
      Type 'number' is not assignable to type 'string'.
src/hooks/transactions/useTransactionFilters.ts(44,29): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'Transaction'.
  Types of property 'envelopeId' are incompatible.
    Type 'string | number | undefined' is not assignable to type 'string | undefined'.
      Type 'number' is not assignable to type 'string'.
src/hooks/transactions/useTransactionFilters.ts(47,43): error TS2345: Argument of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'Transaction'.
  Types of property 'envelopeId' are incompatible.
    Type 'string | number | undefined' is not assignable to type 'string | undefined'.
      Type 'number' is not assignable to type 'string'.
src/hooks/transactions/useTransactionForm.ts(21,25): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/hooks/transactions/useTransactionForm.ts(34,30): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/hooks/transactions/useTransactionImport.ts(49,38): error TS2345: Argument of type 'unknown' is not assignable to parameter of type '{ userName?: string | undefined; }'.
src/hooks/transactions/useTransactionImport.ts(78,61): error TS2345: Argument of type 'ImportData' is not assignable to parameter of type 'unknown[] | { data?: unknown[] | undefined; }'.
  Type 'ImportData' is missing the following properties from type 'unknown[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionImport.ts(86,7): error TS2769: No overload matches this call.
  Overload 1 of 2, '(predicate: (value: unknown, index: number, array: unknown[]) => value is unknown, thisArg?: any): unknown[]', gave the following error.
    Argument of type '(t: { amount: number; }) => boolean' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => value is unknown'.
      Types of parameters 't' and 'value' are incompatible.
        Type 'unknown' is not assignable to type '{ amount: number; }'.
  Overload 2 of 2, '(predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any): unknown[]', gave the following error.
    Argument of type '(t: { amount: number; }) => boolean' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => unknown'.
      Types of parameters 't' and 'value' are incompatible.
        Type 'unknown' is not assignable to type '{ amount: number; }'.
src/hooks/transactions/useTransactionImport.ts(101,44): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type '{ amount: number; }[]'.
  Type 'unknown' is not assignable to type '{ amount: number; }'.
src/hooks/transactions/useTransactionLedger.ts(35,5): error TS2345: Argument of type '(state: { setAllTransactions?: ((transactions: unknown[]) => void) | undefined; updateBill?: ((bill: unknown) => void) | undefined; }) => { setAllTransactions: ((transactions: unknown[]) => void) | undefined; updateBill: ((bill: unknown) => void) | undefined; }' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: { setAllTransactions?: ((transactions: unknown[]) => void) | undefined; updateBill?: ((bill: unknown) => void) | undefined; }) => { setAllTransactions: ((transactions: unknown[]) => void) | undefined; updateBill: ((bill: unknown) => void) | undefined; }' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Type '{ setAllTransactions: ((transactions: unknown[]) => void) | undefined; updateBill: ((bill: unknown) => void) | undefined; }' is not assignable to type 'StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
      Type '{ setAllTransactions: ((transactions: unknown[]) => void) | undefined; updateBill: ((bill: unknown) => void) | undefined; }' is missing the following properties from type 'StoreState': biweeklyAllocation, isUnassignedCashModalOpen, paycheckHistory, isActualBalanceManual, and 10 more.
src/hooks/transactions/useTransactionLedger.ts(45,11): error TS2339: Property 'setAllTransactions' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...'.
src/hooks/transactions/useTransactionLedger.ts(45,31): error TS2339: Property 'updateBill' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...'.
src/hooks/transactions/useTransactionLedger.ts(80,5): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction'.
    Types of property 'date' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/transactions/useTransactionLedger.ts(86,5): error TS2322: Type 'string' is not assignable to type '"asc" | "desc"'.
src/hooks/transactions/useTransactionLedger.ts(104,5): error TS2345: Argument of type 'UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>' is not assignable to parameter of type 'AddTransactionFn'.
  Types of parameters 'variables' and 'transaction' are incompatible.
    Type 'unknown' is not assignable to type 'TransactionInput'.
src/hooks/transactions/useTransactionLedger.ts(158,44): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/transactions/useTransactionLedger.ts(204,39): error TS2345: Argument of type 'Transaction' is not assignable to parameter of type 'SetStateAction<null>'.
  Type 'Transaction' provides no match for the signature '(prevState: null): null'.
src/hooks/transactions/useTransactionQuery.ts(44,11): error TS2339: Property 'transactions' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...'.
src/hooks/transactions/useTransactionQuery.ts(44,46): error TS2339: Property 'allTransactions' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...'.
src/hooks/transactions/useTransactionQuery.ts(46,7): error TS2345: Argument of type '(state: BudgetStore) => { transactions: Transaction[]; allTransactions: Transaction[]; }' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: BudgetStore) => { transactions: Transaction[]; allTransactions: Transaction[]; }' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Types of parameters 'state' and 'setState' are incompatible.
      Type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' is not assignable to type 'BudgetStore'.
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
src/hooks/transactions/useTransactionsV2.ts(57,5): error TS2345: Argument of type '(state: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: fa...' is not assignable to parameter of type 'StateCreator<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }, [], []>'.
  Type '(state: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: fa...' is not assignable to type '(setState: { (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?:...'.
    Type '{ updateTransactions: unknown; }' is not assignable to type 'StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
      Type '{ updateTransactions: unknown; }' is missing the following properties from type 'StoreState': biweeklyAllocation, isUnassignedCashModalOpen, paycheckHistory, isActualBalanceManual, and 10 more.
src/hooks/transactions/useTransactionsV2.ts(58,28): error TS2352: Conversion of type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type '{ (partial: (StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }) | Partial<...> | ((state: StoreState & { ...; }) => (StoreState & { ...; }) | Partial<...>), replace?: false | un...'.
src/hooks/transactions/useTransactionsV2.ts(86,19): error TS2339: Property 'updateTransactions' does not exist on type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; } & StoreApi<...> & (<Mos extends [StoreMutatorIdentifier, unknow...'.
src/hooks/transactions/useTransactionsV2.ts(89,41): error TS2339: Property 'length' does not exist on type '{}'.
src/main.tsx(151,55): error TS2339: Property 'length' does not exist on type '{}'.
src/main.tsx(152,61): error TS2339: Property 'length' does not exist on type '{}'.
src/main.tsx(153,47): error TS2339: Property 'length' does not exist on type '{}'.
src/main.tsx(154,47): error TS2339: Property 'length' does not exist on type '{}'.
src/main.tsx(160,45): error TS2339: Property 'length' does not exist on type '{}'.
src/main.tsx(160,95): error TS2339: Property 'length' does not exist on type '{}'.
src/main.tsx(160,141): error TS2339: Property 'length' does not exist on type '{}'.
src/main.tsx(160,180): error TS2339: Property 'length' does not exist on type '{}'.
src/main.tsx(178,47): error TS2339: Property 'forcePushToCloud' does not exist on type '{ stop: () => void; clearAllData: () => Promise<void>; forcePushData: () => Promise<{ success: boolean; error?: string | undefined; }>; }'.
src/main.tsx(197,40): error TS2345: Argument of type 'DexieData' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'DexieData'.
src/main.tsx(205,29): error TS2345: Argument of type 'DexieData' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'DexieData'.
src/main.tsx(207,50): error TS2345: Argument of type 'CloudSyncService' is not assignable to parameter of type '{ stop: () => void; clearAllData: () => Promise<void>; forcePushData: () => Promise<{ success: boolean; error?: string | undefined; }>; }'.
  Property 'forcePushData' is missing in type 'CloudSyncService' but required in type '{ stop: () => void; clearAllData: () => Promise<void>; forcePushData: () => Promise<{ success: boolean; error?: string | undefined; }>; }'.
src/services/activityLogger.ts(126,68): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/authService.ts(577,32): error TS2352: Conversion of type 'typeof import("/home/runner/work/violet-vault/violet-vault/src/stores/ui/uiStore")' to type '{ useBudgetStore: { getState: () => { cloudSyncEnabled: boolean; startBackgroundSync: () => Promise<void>; }; }; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'useBudgetStore' are incompatible.
    Type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>' is not comparable to type '{ getState: () => { cloudSyncEnabled: boolean; startBackgroundSync: () => Promise<void>; }; }'.
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
src/services/bugReport/screenshotService.ts(39,37): error TS2774: This condition will always return true since this function is always defined. Did you mean to call it instead?
src/services/bugReport/screenshotService.ts(43,69): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/screenshotService.ts(52,75): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/screenshotService.ts(113,5): error TS18047: 'ctx' is possibly 'null'.
src/services/bugReport/screenshotService.ts(201,7): error TS18047: 'ctx' is possibly 'null'.
src/services/bugReport/screenshotService.ts(202,7): error TS18047: 'ctx' is possibly 'null'.
src/services/bugReport/screenshotService.ts(205,7): error TS18047: 'ctx' is possibly 'null'.
src/services/bugReport/screenshotService.ts(206,7): error TS18047: 'ctx' is possibly 'null'.
src/services/bugReport/screenshotService.ts(207,7): error TS18047: 'ctx' is possibly 'null'.
src/services/bugReport/screenshotService.ts(210,7): error TS18047: 'ctx' is possibly 'null'.
src/services/bugReport/screenshotService.ts(213,7): error TS18047: 'ctx' is possibly 'null'.
src/services/bugReport/screenshotService.ts(214,7): error TS18047: 'ctx' is possibly 'null'.
src/services/bugReport/screenshotService.ts(219,9): error TS18047: 'ctx' is possibly 'null'.
src/services/bugReport/screenshotService.ts(283,7): error TS18047: 'ctx' is possibly 'null'.
src/services/bugReport/screenshotService.ts(284,7): error TS18047: 'ctx' is possibly 'null'.
src/services/bugReport/screenshotService.ts(287,7): error TS18047: 'ctx' is possibly 'null'.
src/services/chunkedSyncService.ts(278,7): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/chunkedSyncService.ts(427,34): error TS2345: Argument of type 'Promise<unknown>[]' is not assignable to parameter of type 'Iterable<void | PromiseLike<void>>'.
  The types returned by '[Symbol.iterator]().next(...)' are incompatible between these types.
    Type 'IteratorResult<Promise<unknown>, undefined>' is not assignable to type 'IteratorResult<void | PromiseLike<void>, any>'.
      Type 'IteratorYieldResult<Promise<unknown>>' is not assignable to type 'IteratorResult<void | PromiseLike<void>, any>'.
        Type 'IteratorYieldResult<Promise<unknown>>' is not assignable to type 'IteratorYieldResult<void | PromiseLike<void>>'.
          Type 'Promise<unknown>' is not assignable to type 'void | PromiseLike<void>'.
            Type 'Promise<unknown>' is not assignable to type 'PromiseLike<void>'.
              Types of property 'then' are incompatible.
                Type '<TResult1 = unknown, TResult2 = never>(onfulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined) => Promise<...>' is not assignable to type '<TResult1 = void, TResult2 = never>(onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<...>) | null | undefined) => PromiseLike<...>'.
                  Types of parameters 'onfulfilled' and 'onfulfilled' are incompatible.
                    Types of parameters 'value' and 'value' are incompatible.
                      Type 'unknown' is not assignable to type 'void'.
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
src/services/chunkedSyncService.ts(497,36): error TS2345: Argument of type 'Promise<unknown>[]' is not assignable to parameter of type 'Iterable<void | PromiseLike<void>>'.
  The types returned by '[Symbol.iterator]().next(...)' are incompatible between these types.
    Type 'IteratorResult<Promise<unknown>, undefined>' is not assignable to type 'IteratorResult<void | PromiseLike<void>, any>'.
      Type 'IteratorYieldResult<Promise<unknown>>' is not assignable to type 'IteratorResult<void | PromiseLike<void>, any>'.
        Type 'IteratorYieldResult<Promise<unknown>>' is not assignable to type 'IteratorYieldResult<void | PromiseLike<void>>'.
          Type 'Promise<unknown>' is not assignable to type 'void | PromiseLike<void>'.
            Type 'Promise<unknown>' is not assignable to type 'PromiseLike<void>'.
              Types of property 'then' are incompatible.
                Type '<TResult1 = unknown, TResult2 = never>(onfulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined) => Promise<...>' is not assignable to type '<TResult1 = void, TResult2 = never>(onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<...>) | null | undefined) => PromiseLike<...>'.
                  Types of parameters 'onfulfilled' and 'onfulfilled' are incompatible.
                    Types of parameters 'value' and 'value' are incompatible.
                      Type 'unknown' is not assignable to type 'void'.
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
src/services/editLockService.ts(129,51): error TS2345: Argument of type 'LockDocument | null' is not assignable to parameter of type 'ExistingLock | null | undefined'.
  Type 'LockDocument' is not assignable to type 'ExistingLock'.
    Types of property 'userId' are incompatible.
      Type 'string | undefined' is not assignable to type 'string'.
        Type 'undefined' is not assignable to type 'string'.
src/services/editLockService.ts(372,26): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
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
src/stores/ui/uiStore.ts(155,25): error TS2345: Argument of type '(fn: (state: StoreState) => void) => void' is not assignable to parameter of type 'ImmerSet<UiStore>'.
  Types of parameters 'fn' and 'updater' are incompatible.
    Types of parameters 'draft' and 'state' are incompatible.
      Type 'StoreState' is missing the following properties from type 'WritableDraft<UiStore>': setBiweeklyAllocation, openUnassignedCashModal, closeUnassignedCashModal, setPaycheckHistory, and 19 more.
src/stores/ui/uiStore.ts(158,29): error TS2345: Argument of type '(fn: (state: StoreState) => void) => void' is not assignable to parameter of type 'ImmerSet<UiStore>'.
  Types of parameters 'fn' and 'updater' are incompatible.
    Types of parameters 'draft' and 'state' are incompatible.
      Type 'StoreState' is missing the following properties from type 'WritableDraft<UiStore>': setBiweeklyAllocation, openUnassignedCashModal, closeUnassignedCashModal, setPaycheckHistory, and 19 more.
src/stores/ui/uiStore.ts(161,30): error TS2345: Argument of type '(fn: (state: StoreState) => void) => void' is not assignable to parameter of type 'ImmerSet<UiStore>'.
  Types of parameters 'fn' and 'updater' are incompatible.
    Types of parameters 'draft' and 'state' are incompatible.
      Type 'StoreState' is missing the following properties from type 'WritableDraft<UiStore>': setBiweeklyAllocation, openUnassignedCashModal, closeUnassignedCashModal, setPaycheckHistory, and 19 more.
src/stores/ui/uiStore.ts(176,9): error TS2322: Type 'string' is not assignable to type '{ version: string; notes: string[]; fromVersion?: string | undefined; toVersion?: string | undefined; isUpdate?: boolean | undefined; }'.
src/stores/ui/uiStore.ts(223,32): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/stores/ui/uiStore.ts(295,3): error TS2322: Type 'UseBoundStore<WithImmer<Write<StoreApi<{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; startBackgroundSync(authData?: { ...; } | undefined): Promise<...>; ... 29 more ...; loadingPatchNotes: boolean; }>, StoreSubscribeWithSelector<...>...' is not assignable to type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
  Type '{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; startBackgroundSync(authData?: { ...; } | undefined): Promise<...>; ... 29 more ...; loadingPatchNotes: boolean; }' is not assignable to type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
    Type '{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; startBackgroundSync(authData?: { ...; } | undefined): Promise<...>; ... 29 more ...; loadingPatchNotes: boolean; }' is not assignable to type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; }'.
      Type '{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; startBackgroundSync(authData?: { ...; } | undefined): Promise<...>; ... 29 more ...; loadingPatchNotes: boolean; }' provides no match for the signature '(): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
src/stores/ui/uiStore.ts(297,3): error TS2322: Type 'UseBoundStore<WithImmer<Write<WithPersist<WithDevtools<StoreApi<{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; startBackgroundSync(authData?: { ...; } | undefined): Promise<...>; ... 29 more ...; loadingPatchNotes: boolean; }>>, { ......' is not assignable to type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
  Type '{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; startBackgroundSync(authData?: { ...; } | undefined): Promise<...>; ... 29 more ...; loadingPatchNotes: boolean; }' is not assignable to type 'UseBoundStore<StoreApi<StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }>>'.
    Type '{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; startBackgroundSync(authData?: { ...; } | undefined): Promise<...>; ... 29 more ...; loadingPatchNotes: boolean; }' is not assignable to type '{ (): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }; <U>(selector: (state: StoreState & { ...; }) => U): U; }'.
      Type '{ loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; startBackgroundSync(authData?: { ...; } | undefined): Promise<...>; ... 29 more ...; loadingPatchNotes: boolean; }' provides no match for the signature '(): StoreState & { loadPatchNotesForUpdate(fromVersion: string, toVersion: string): Promise<string | null>; runMigrationIfNeeded(): Promise<void>; ... 30 more ...; loadingPatchNotes: boolean; }'.
src/stores/ui/uiStore.ts(324,26): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/stores/ui/uiStore.ts(324,71): error TS2339: Property 'setState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/stores/ui/uiStore.ts(325,26): error TS2339: Property 'getState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/stores/ui/uiStore.ts(325,72): error TS2339: Property 'setState' does not exist on type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>'.
src/stores/ui/uiStore.ts(325,82): error TS2345: Argument of type 'typeof create<StoreState & ReturnType<typeof storeInitializer>>' is not assignable to parameter of type '{ getState: () => UiStore; }'.
src/utils/accounts/accountValidation.ts(11,37): error TS7006: Parameter 'accountForm' implicitly has an 'any' type.
src/utils/accounts/accountValidation.ts(93,38): error TS7006: Parameter 'transferForm' implicitly has an 'any' type.
src/utils/accounts/accountValidation.ts(93,52): error TS7006: Parameter 'fromAccount' implicitly has an 'any' type.
src/utils/accounts/accountValidation.ts(153,63): error TS2339: Property 'isActive' does not exist on type 'never'.
src/utils/accounts/accountValidation.ts(156,38): error TS2339: Property 'currentBalance' does not exist on type 'never'.
src/utils/accounts/accountValidation.ts(161,55): error TS2339: Property 'expirationDate' does not exist on type 'never'.
src/utils/accounts/accountValidation.ts(166,38): error TS2339: Property 'annualContribution' does not exist on type 'never'.
src/utils/accounts/accountValidation.ts(184,46): error TS7006: Parameter 'expirationDate' implicitly has an 'any' type.
src/utils/accounts/accountValidation.ts(205,37): error TS7006: Parameter 'daysUntil' implicitly has an 'any' type.
src/utils/accounts/accountValidation.ts(220,39): error TS7006: Parameter 'currentBalance' implicitly has an 'any' type.
src/utils/accounts/accountValidation.ts(220,55): error TS7006: Parameter 'changeAmount' implicitly has an 'any' type.
src/utils/accounts/accountValidation.ts(251,42): error TS7006: Parameter 'account' implicitly has an 'any' type.
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
src/utils/dataManagement/dexieUtils.ts(4,27): error TS7006: Parameter 'table' implicitly has an 'any' type.
src/utils/dataManagement/dexieUtils.ts(8,87): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/dataManagement/dexieUtils.ts(41,33): error TS7006: Parameter 'table' implicitly has an 'any' type.
src/utils/dataManagement/dexieUtils.ts(41,40): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/utils/dataManagement/dexieUtils.ts(47,41): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/utils/dataManagement/fileUtils.ts(3,33): error TS7006: Parameter 'file' implicitly has an 'any' type.
src/utils/dataManagement/fileUtils.ts(11,36): error TS18047: 'e.target' is possibly 'null'.
src/utils/dataManagement/firebaseUtils.ts(15,74): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/debts/calculations/interestCalculation.ts(12,42): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/utils/debts/calculations/interestCalculation.ts(12,48): error TS7006: Parameter 'paymentAmount' implicitly has an 'any' type.
src/utils/debts/calculations/nextPaymentDate.ts(13,42): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/utils/debts/calculations/nextPaymentDate.ts(13,48): error TS7006: Parameter 'relatedBill' implicitly has an 'any' type.
src/utils/debts/calculations/payoffProjection.ts(11,43): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/utils/debug/dataDiagnostic.ts(124,84): error TS2339: Property 'count' does not exist on type 'string | number | Dexie | Table<BudgetRecord, string, BudgetRecord> | Table<Envelope, string, Envelope> | ... 76 more ... | { ...; }'.
  Property 'count' does not exist on type 'string'.
src/utils/debug/dataDiagnostic.ts(126,12): error TS2339: Property 'limit' does not exist on type 'string | number | Dexie | Table<BudgetRecord, string, BudgetRecord> | Table<Envelope, string, Envelope> | ... 76 more ... | { ...; }'.
  Property 'limit' does not exist on type 'string'.
src/utils/debug/dataDiagnostic.ts(304,20): error TS18048: 'window.budgetDb' is possibly 'undefined'.
src/utils/debug/dataDiagnostic.ts(307,20): error TS18048: 'window.budgetDb' is possibly 'undefined'.
src/utils/debug/dataDiagnostic.ts(309,23): error TS2345: Argument of type 'string | Date | undefined' is not assignable to parameter of type 'IndexableType'.
  Type 'undefined' is not assignable to type 'IndexableType'.
src/utils/debug/reactErrorDetector.ts(132,40): error TS7006: Parameter 'store' implicitly has an 'any' type.
src/utils/debug/reactErrorDetector.ts(132,47): error TS7006: Parameter 'storeName' implicitly has an 'any' type.
src/utils/debug/reactErrorDetector.ts(141,26): error TS7019: Rest parameter 'args' implicitly has an 'any[]' type.
src/utils/debug/reactErrorDetector.ts(143,30): error TS2683: 'this' implicitly has type 'any' because it does not have a type annotation.
src/utils/icons/index.ts(334,25): error TS7006: Parameter 'iconName' implicitly has an 'any' type.
src/utils/icons/index.ts(336,10): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ "arrow-right": ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; ... 123 more ...; CreditCard: ForwardRefExoticComponent<...>; }'.
src/utils/icons/index.ts(340,29): error TS7006: Parameter 'iconComponent' implicitly has an 'any' type.
src/utils/icons/index.ts(346,28): error TS7006: Parameter 'iconName' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(52,47): error TS2339: Property 'currentBalance' does not exist on type '{}'.
src/utils/layout/paycheckDeletionUtils.ts(110,56): error TS2339: Property 'get' does not exist on type '{ delete: (id: string | number) => Promise<void>; }'.
src/utils/layout/paycheckDeletionUtils.ts(126,25): error TS2349: This expression is not callable.
  Type 'unknown[]' has no call signatures.
src/utils/layout/paycheckDeletionUtils.ts(128,55): error TS2339: Property 'envelopes' does not exist on type '{ paycheckHistory: unknown[]; budgetMetadata: unknown[]; }'.
src/utils/layout/paycheckDeletionUtils.ts(132,55): error TS2339: Property 'dashboard' does not exist on type '{ paycheckHistory: unknown[]; budgetMetadata: unknown[]; }'.
src/utils/pageDetection/pageIdentifier.ts(37,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/pwa/offlineDataValidator.ts(119,23): error TS7006: Parameter 'tableName' implicitly has an 'any' type.
src/utils/pwa/offlineDataValidator.ts(121,21): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'VioletVaultDB'.
src/utils/pwa/offlineDataValidator.ts(131,63): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/pwa/offlineDataValidator.ts(155,65): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/pwa/offlineDataValidator.ts(181,54): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/pwa/patchNotesManager.ts(68,7): error TS2322: Type 'Record<string, unknown>' is not assignable to type 'string'.
src/utils/pwa/patchNotesManager.ts(85,7): error TS2322: Type 'Record<string, unknown>' is not assignable to type 'string'.
src/utils/pwa/patchNotesManager.ts(89,24): error TS18048: 'match.index' is possibly 'undefined'.
src/utils/pwa/patchNotesManager.ts(103,5): error TS2322: Type 'Record<string, unknown>' is not assignable to type 'string'.
src/utils/pwa/pwaManager.ts(71,7): error TS2322: Type 'ServiceWorkerRegistration | undefined' is not assignable to type 'ServiceWorkerRegistration | null'.
  Type 'undefined' is not assignable to type 'ServiceWorkerRegistration | null'.
src/utils/pwa/pwaManager.ts(88,11): error TS2531: Object is possibly 'null'.
src/utils/pwa/pwaManager.ts(118,11): error TS2531: Object is possibly 'null'.
src/utils/pwa/pwaManager.ts(259,38): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/utils/pwa/serviceWorkerDiagnostics.ts(87,74): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/pwa/serviceWorkerDiagnostics.ts(94,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/utils/pwa/serviceWorkerDiagnostics.ts(117,34): error TS18046: 'error' is of type 'unknown'.
src/utils/pwa/serviceWorkerDiagnostics.ts(124,27): error TS7006: Parameter 'report' implicitly has an 'any' type.
src/utils/pwa/serviceWorkerDiagnostics.ts(170,20): error TS7006: Parameter 'cacheName' implicitly has an 'any' type.
src/utils/pwa/serviceWorkerDiagnostics.ts(262,16): error TS18046: 'error' is of type 'unknown'.
src/utils/pwa/serviceWorkerDiagnostics.ts(300,13): error TS18048: 'cachedResponse' is possibly 'undefined'.
src/utils/pwa/serviceWorkerDiagnostics.ts(364,22): error TS18048: 'estimate.quota' is possibly 'undefined'.
src/utils/pwa/serviceWorkerDiagnostics.ts(364,39): error TS18048: 'estimate.usage' is possibly 'undefined'.
src/utils/pwa/serviceWorkerDiagnostics.ts(365,37): error TS18048: 'estimate.usage' is possibly 'undefined'.
src/utils/pwa/serviceWorkerDiagnostics.ts(365,54): error TS18048: 'estimate.quota' is possibly 'undefined'.
src/utils/pwa/serviceWorkerDiagnostics.ts(368,25): error TS18046: 'error' is of type 'unknown'.
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
src/utils/security/optimizedSerialization.ts(20,13): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/utils/security/optimizedSerialization.ts(50,48): error TS18046: 'error' is of type 'unknown'.
src/utils/security/optimizedSerialization.ts(59,15): error TS7006: Parameter 'packedData' implicitly has an 'any' type.
src/utils/security/optimizedSerialization.ts(82,50): error TS18046: 'error' is of type 'unknown'.
src/utils/security/optimizedSerialization.ts(91,22): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/utils/security/optimizedSerialization.ts(124,12): error TS7006: Parameter 'binaryData' implicitly has an 'any' type.
src/utils/security/optimizedSerialization.ts(134,50): error TS18046: 'error' is of type 'unknown'.
src/utils/security/optimizedSerialization.ts(143,14): error TS7006: Parameter 'base64String' implicitly has an 'any' type.
src/utils/security/optimizedSerialization.ts(153,50): error TS18046: 'error' is of type 'unknown'.
src/utils/security/optimizedSerialization.ts(162,22): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/utils/security/optimizedSerialization.ts(172,23): error TS7006: Parameter 'base64String' implicitly has an 'any' type.
src/utils/security/optimizedSerialization.ts(182,16): error TS7006: Parameter 'testData' implicitly has an 'any' type.
src/utils/security/optimizedSerialization.ts(212,16): error TS18046: 'error' is of type 'unknown'.
src/utils/settings/settingsHelpers.ts(24,43): error TS7006: Parameter 'settings' implicitly has an 'any' type.
src/utils/settings/settingsHelpers.ts(46,42): error TS7006: Parameter 'settings' implicitly has an 'any' type.
src/utils/settings/settingsHelpers.ts(77,39): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/utils/settings/settingsHelpers.ts(89,29): error TS7006: Parameter 'bytes' implicitly has an 'any' type.
src/utils/settings/settingsHelpers.ts(132,33): error TS7006: Parameter 'settings1' implicitly has an 'any' type.
src/utils/settings/settingsHelpers.ts(132,44): error TS7006: Parameter 'settings2' implicitly has an 'any' type.
src/utils/settings/settingsHelpers.ts(133,9): error TS7034: Variable 'changes' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/utils/settings/settingsHelpers.ts(135,20): error TS7006: Parameter 'obj1' implicitly has an 'any' type.
src/utils/settings/settingsHelpers.ts(135,26): error TS7006: Parameter 'obj2' implicitly has an 'any' type.
src/utils/settings/settingsHelpers.ts(162,10): error TS7005: Variable 'changes' implicitly has an 'any[]' type.
src/utils/settings/settingsHelpers.ts(168,43): error TS7006: Parameter 'settings' implicitly has an 'any' type.
src/utils/settings/settingsHelpers.ts(175,32): error TS7006: Parameter 'obj' implicitly has an 'any' type.
src/utils/settings/settingsHelpers.ts(189,42): error TS7006: Parameter 'importedData' implicitly has an 'any' type.
src/utils/stores/createSafeStore.ts(182,5): error TS2345: Argument of type 'StateCreator<T & Record<string, unknown>>' is not assignable to parameter of type 'StateCreator<Record<string, unknown>>'.
  Type 'StateCreator<T & Record<string, unknown>>' is not assignable to type '(setState: { (partial: Record<string, unknown> | Partial<Record<string, unknown>> | ((state: Record<string, unknown>) => Record<string, unknown> | Partial<Record<string, unknown>>), replace?: false | undefined): void; (state: Record<...> | ((state: Record<...>) => Record<...>), replace: true): void; }, getState: () ...'.
    Types of parameters 'getState' and 'getState' are incompatible.
      Type '() => Record<string, unknown>' is not assignable to type '() => T & Record<string, unknown>'.
        Type 'Record<string, unknown>' is not assignable to type 'T & Record<string, unknown>'.
          Type 'Record<string, unknown>' is not assignable to type 'T'.
            'Record<string, unknown>' is assignable to the constraint of type 'T', but 'T' could be instantiated with a different subtype of constraint 'object'.
src/utils/sync/SyncMutex.ts(71,15): error TS2339: Property 'resolve' does not exist on type '{ resolve: () => void; operationName: string; } | undefined'.
src/utils/sync/SyncMutex.ts(80,18): error TS7006: Parameter 'duration' implicitly has an 'any' type.
src/utils/sync/SyncQueue.ts(79,39): error TS2345: Argument of type 'QueueItem<T>' is not assignable to parameter of type 'QueueItem<unknown>'.
  Types of property 'operation' are incompatible.
    Type '(data: T) => Promise<unknown>' is not assignable to type '(data: unknown) => Promise<unknown>'.
      Types of parameters 'data' and 'data' are incompatible.
        Type 'unknown' is not assignable to type 'T'.
          'T' could be instantiated with an arbitrary type which could be unrelated to 'unknown'.
src/utils/sync/corruptionRecoveryHelper.ts(48,5): error TS2687: All declarations of 'detectLocalDataDebug' must have identical modifiers.
src/utils/sync/corruptionRecoveryHelper.ts(48,5): error TS2717: Subsequent property declarations must have the same type.  Property 'detectLocalDataDebug' must be of type '(() => Promise<unknown>) | undefined', but here has type '() => Promise<DataDetectionResult>'.
src/utils/sync/corruptionRecoveryHelper.ts(49,5): error TS2687: All declarations of 'hasLocalDataDebug' must have identical modifiers.
src/utils/sync/corruptionRecoveryHelper.ts(49,5): error TS2717: Subsequent property declarations must have the same type.  Property 'hasLocalDataDebug' must be of type '(() => Promise<boolean>) | undefined', but here has type '() => Promise<boolean>'.
src/utils/sync/dataDetectionHelper.ts(104,48): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/masterSyncValidator.ts(517,16): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/masterSyncValidator.ts(536,16): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/masterSyncValidator.ts(568,14): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/resilience/index.ts(52,19): error TS7006: Parameter 'operation' implicitly has an 'any' type.
src/utils/sync/retryPolicies.ts(11,34): error TS7006: Parameter 'error' implicitly has an 'any' type.
src/utils/sync/retryPolicies.ts(39,42): error TS7006: Parameter 'errorCode' implicitly has an 'any' type.
src/utils/sync/retryPolicies.ts(54,44): error TS7006: Parameter 'error' implicitly has an 'any' type.
src/utils/sync/retryPolicies.ts(63,31): error TS7006: Parameter 'error' implicitly has an 'any' type.
src/utils/sync/retryUtils.ts(29,27): error TS7006: Parameter 'delay' implicitly has an 'any' type.
src/utils/sync/retryUtils.ts(40,23): error TS7006: Parameter 'ms' implicitly has an 'any' type.
src/utils/sync/retryUtils.ts(47,34): error TS7006: Parameter 'attempt' implicitly has an 'any' type.
src/utils/sync/retryUtils.ts(55,29): error TS7006: Parameter 'ms' implicitly has an 'any' type.
src/utils/sync/syncEdgeCaseTester.ts(53,18): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/syncEdgeCaseTester.ts(176,43): error TS2345: Argument of type '{ id: string; description: string; amount: number; date: string; lastModified: number; }[]' is not assignable to parameter of type 'readonly Transaction[]'.
  Type '{ id: string; description: string; amount: number; date: string; lastModified: number; }' is missing the following properties from type 'Transaction': envelopeId, category, type
src/utils/sync/syncEdgeCaseTester.ts(300,32): error TS2352: Conversion of type '{ id: string; name: null; amount: undefined; lastModified: null; createdAt: undefined; }' to type 'Partial<Debt>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'name' are incompatible.
    Type 'null' is not comparable to type 'string | undefined'.
src/utils/sync/syncEdgeCaseTester.ts(359,40): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/sync/syncEdgeCaseTester.ts(365,57): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/syncFlowValidator.ts(169,49): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'IndexableType'.
  Type 'undefined' is not assignable to type 'IndexableType'.
src/utils/sync/syncFlowValidator.ts(170,52): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'IndexableType'.
  Type 'undefined' is not assignable to type 'IndexableType'.
src/utils/sync/syncFlowValidator.ts(171,45): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'IndexableType'.
  Type 'undefined' is not assignable to type 'IndexableType'.
src/utils/sync/syncFlowValidator.ts(172,45): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'IndexableType'.
  Type 'undefined' is not assignable to type 'IndexableType'.
src/utils/sync/syncFlowValidator.ts(309,11): error TS2345: Argument of type 'DataCollection | null' is not assignable to parameter of type 'DataCollection'.
  Type 'null' is not assignable to type 'DataCollection'.
src/utils/sync/validation/checksumUtils.ts(23,7): error TS2322: Type 'Uint8Array<ArrayBuffer>' is not assignable to type 'ArrayBuffer'.
  Types of property '[Symbol.toStringTag]' are incompatible.
    Type '"Uint8Array"' is not assignable to type '"ArrayBuffer"'.
src/utils/sync/validation/checksumUtils.ts(32,7): error TS2322: Type 'Uint8Array<ArrayBuffer>' is not assignable to type 'ArrayBuffer'.
  Types of property '[Symbol.toStringTag]' are incompatible.
    Type '"Uint8Array"' is not assignable to type '"ArrayBuffer"'.
src/utils/testing/storeTestUtils.ts(58,13): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'unknown'.
  No index signature with a parameter of type 'string' was found on type 'unknown'.
src/utils/testing/storeTestUtils.ts(72,16): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'unknown'.
  No index signature with a parameter of type 'string' was found on type 'unknown'.
src/utils/transactions/operations.ts(61,39): error TS18046: 'error' is of type 'unknown'.
```

