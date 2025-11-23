# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 4 | 0 |
| TypeScript Errors | 40 | 0 |
| TypeScript Strict Mode Errors | 2135 | -4 |

*Last updated: 2025-11-23 15:36:23 UTC*

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
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/usePaycheckForm.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/accounts/useSupplementalAccounts.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/settings/SettingsDashboard.tsx`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 3 | `max-lines-per-function` |
| 1 | `no-undef` |

### Detailed Lint Report
```
/home/runner/work/violet-vault/violet-vault/src/components/settings/SettingsDashboard.tsx:27:27 - 1 - Arrow function has too many lines (164). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/hooks/accounts/useSupplementalAccounts.ts:41:33 - 1 - Arrow function has too many lines (152). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts:30:34 - 1 - Arrow function has too many lines (159). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/usePaycheckForm.ts:16:18 - 1 - 'React' is not defined. (no-undef)
```

## Typecheck Audit

### Files with Most Type Errors
- 7 errors in `src/components/accounts/SupplementalAccounts.tsx`
- 6 errors in `src/hooks/debts/useDebtManagement.ts`
- 6 errors in `src/hooks/budgeting/usePaycheckForm.ts`
- 5 errors in `src/hooks/debts/useDebts.ts`
- 5 errors in `src/hooks/accounts/useSupplementalAccounts.ts`
- 3 errors in `src/hooks/analytics/useReportExporter.ts`
- 2 errors in `src/hooks/transactions/useTransactionImport.ts`
- 2 errors in `src/hooks/bills/useBillManager.ts`
- 2 errors in `src/components/layout/MainLayout.tsx`
- 1 errors in `src/components/settings/SettingsDashboard.tsx`
- 1 errors in `src/components/analytics/ReportExporter.tsx`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 18 | `TS2322` |
| 15 | `TS2345` |
| 4 | `TS2339` |
| 1 | `TS2741` |
| 1 | `TS2719` |
| 1 | `TS2352` |

### Detailed Type Error Report
```
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
src/components/layout/MainLayout.tsx(477,11): error TS2322: Type '(event: ChangeEvent<HTMLInputElement>) => Promise<{ success: boolean; imported: { envelopes: number; bills: number; transactions: number; savingsGoals: number; debts: number; paycheckHistory: number; auditLog: number; }; }>' is not assignable to type '() => void'.
  Target signature provides too few arguments. Expected 1 or more, but got 0.
src/components/layout/MainLayout.tsx(484,11): error TS2322: Type '(oldPassword: string, newPassword: string) => Promise<void>' is not assignable to type '(password: string) => void'.
  Target signature provides too few arguments. Expected 2 or more, but got 1.
src/components/settings/SettingsDashboard.tsx(162,13): error TS2322: Type '(password: string) => void' is not assignable to type '(current: string, newPass: string) => Promise<AuthResult>'.
  Type 'void' is not assignable to type 'Promise<AuthResult>'.
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
src/hooks/analytics/useReportExporter.ts(48,9): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/hooks/analytics/useReportExporter.ts(112,41): error TS2322: Type 'unknown' is not assignable to type 'string'.
src/hooks/analytics/useReportExporter.ts(129,24): error TS2345: Argument of type '(prev: { includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; }; }) => { ...; }' is not assignable to parameter of type 'SetStateAction<{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; }; }>'.
  Type '(prev: { includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; }; }) => { ...; }' is not assignable to type '(prevState: { includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; }; }) => { ...; }'.
    Call signature return types '{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: unknown; }' and '{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: { start: string; end: string; }; }' are incompatible.
      The types of 'customDateRange' are incompatible between these types.
        Type '{}' is missing the following properties from type '{ start: string; end: string; }': start, end
src/hooks/bills/useBillManager.ts(197,5): error TS2322: Type '(bills: Bill[]) => void' is not assignable to type '(bills: Set<string>) => void'.
  Types of parameters 'bills' and 'bills' are incompatible.
    Type 'Set<string>' is missing the following properties from type 'Bill[]': length, pop, push, concat, and 24 more.
src/hooks/bills/useBillManager.ts(197,23): error TS2352: Conversion of type 'Dispatch<SetStateAction<Set<unknown>>>' to type '(bills: Bill[]) => void' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of parameters 'value' and 'bills' are incompatible.
    Type 'Bill[]' is not comparable to type 'SetStateAction<Set<unknown>>'.
      Type 'Bill[]' is missing the following properties from type 'Set<unknown>': add, clear, delete, has, and 2 more.
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
src/hooks/transactions/useTransactionImport.ts(78,61): error TS2345: Argument of type 'ImportData' is not assignable to parameter of type 'unknown[] | { data?: unknown[]; }'.
  Type 'ImportData' is missing the following properties from type 'unknown[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionImport.ts(101,44): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type '{ amount: number; }[]'.
  Property 'amount' is missing in type '{}' but required in type '{ amount: number; }'.
```

## Typecheck Strict Mode Audit

### Files with Most Strict Mode Errors
- 18 errors in `src/components/pwa/PatchNotesModal.tsx`
- 18 errors in `src/components/budgeting/paycheck/PaycheckPayerSelector.tsx`
- 17 errors in `src/hooks/transactions/useTransactionSplitterUI.ts`
- 17 errors in `src/hooks/auth/authOperations.ts`
- 16 errors in `src/utils/sync/autoBackupService.ts`
- 16 errors in `src/services/bugReport/screenshotService.ts`
- 16 errors in `src/components/automation/steps/ReviewStep.tsx`
- 15 errors in `src/hooks/transactions/useTransactionBalanceUpdater.ts`
- 15 errors in `src/hooks/budgeting/usePaycheckProcessor.ts`
- 15 errors in `src/hooks/bills/useSmartBillSuggestions.ts`
- 15 errors in `src/components/transactions/TransactionFilters.tsx`
- 15 errors in `src/components/sharing/ShareCodeModal.tsx`
- 14 errors in `src/utils/sync/validation/encryptedDataValidator.ts`
- 14 errors in `src/utils/pwa/patchNotesManager.ts`
- 14 errors in `src/utils/layout/paycheckDeletionUtils.ts`
- 14 errors in `src/stores/ui/uiStore.ts`
- 14 errors in `src/hooks/receipts/useReceiptScanner.ts`
- 14 errors in `src/hooks/budgeting/useSmartSuggestions.ts`
- 14 errors in `src/components/sharing/steps/UserSetupStep.tsx`
- 14 errors in `src/components/dashboard/RecentTransactionsWidget.tsx`
- 14 errors in `src/components/dashboard/AccountBalanceOverview.tsx`
- 14 errors in `src/components/automation/AutoFundingDashboard.tsx`
- 13 errors in `src/utils/settings/settingsHelpers.ts`
- 13 errors in `src/utils/security/optimizedSerialization.ts`
- 13 errors in `src/hooks/bills/useBillManager.ts`
- 13 errors in `src/components/receipts/ReceiptToTransactionModal.tsx`
- 12 errors in `src/utils/pwa/serviceWorkerDiagnostics.ts`
- 12 errors in `src/utils/debug/dataDiagnostic.ts`
- 12 errors in `src/utils/accounts/accountValidation.ts`
- 12 errors in `src/components/bills/BillManager.tsx`
- 12 errors in `src/components/automation/tabs/RulesTabComponents.tsx`
- 11 errors in `src/utils/security/shareCodeUtils.ts`
- 11 errors in `src/utils/savings/savingsFormUtils.ts`
- 11 errors in `src/utils/bills/billDetailUtils.ts`
- 11 errors in `src/hooks/history/useBudgetHistoryViewer.ts`
- 11 errors in `src/components/transactions/splitter/SplitAllocationsSection.tsx`
- 11 errors in `src/components/transactions/import/ImportModal.tsx`
- 11 errors in `src/components/budgeting/suggestions/SuggestionSettings.tsx`
- 11 errors in `src/components/budgeting/shared/BillConnectionSelector.tsx`
- 10 errors in `src/utils/sync/syncHealthChecker.ts`
- 10 errors in `src/utils/sync/RetryManager.ts`
- 10 errors in `src/utils/services/editLockHelpers.ts`
- 10 errors in `src/utils/query/queryClientConfig.ts`
- 10 errors in `src/hooks/notifications/useFirebaseMessaging.ts`
- 10 errors in `src/hooks/budgeting/autofunding/useExecutionStatistics.ts`
- 10 errors in `src/hooks/auth/useAuthCompatibility.ts`
- 10 errors in `src/hooks/analytics/queries/usePaycheckTrendsQuery.ts`
- 10 errors in `src/components/settings/sections/SecurityLoggingSection.tsx`
- 10 errors in `src/components/settings/sections/GeneralSettingsSection.tsx`
- 10 errors in `src/components/receipts/steps/ConfirmationStep.tsx`
- 10 errors in `src/components/pwa/UpdateAvailableModal.tsx`
- 10 errors in `src/components/layout/MainLayout.tsx`
- 10 errors in `src/components/budgeting/paycheck/PaycheckAllocationModes.tsx`
- 10 errors in `src/components/budgeting/EnvelopeGrid.tsx`
- 10 errors in `src/components/bills/modals/BulkUpdateConfirmModal.tsx`
- 10 errors in `src/components/bills/modals/BillDetailSections.tsx`
- 9 errors in `src/utils/ui/touchFeedback.ts`
- 9 errors in `src/utils/sync/retryMetrics.ts`
- 9 errors in `src/utils/receipts/receiptHelpers.ts`
- 9 errors in `src/utils/query/prefetchHelpers.ts`
- 9 errors in `src/utils/pwa/backgroundSync.ts`
- 9 errors in `src/utils/debug/syncDiagnostic.ts`
- 9 errors in `src/utils/debug/reactErrorDetector.ts`
- 9 errors in `src/utils/budgeting/envelopeMatching.ts`
- 9 errors in `src/utils/budgeting/envelopeFormUtils.ts`
- 9 errors in `src/utils/budgeting/autofunding/simulation.ts`
- 9 errors in `src/utils/analytics/trendHelpers.ts`
- 9 errors in `src/services/bugReport/uiStateService.ts`
- 9 errors in `src/hooks/debts/useDebts.ts`
- 9 errors in `src/hooks/debts/useDebtDetailModal.ts`
- 9 errors in `src/hooks/debts/useDebtDashboard.ts`
- 9 errors in `src/hooks/budgeting/useEnvelopeForm.ts`
- 9 errors in `src/hooks/budgeting/useEnvelopeCalculations.ts`
- 9 errors in `src/hooks/auth/useAuthFlow.ts`
- 9 errors in `src/db/budgetDb.ts`
- 9 errors in `src/components/transactions/splitter/SplitAllocationRow.tsx`
- 9 errors in `src/components/savings/SavingsGoalCard.tsx`
- 9 errors in `src/components/onboarding/components/TutorialOverlay.tsx`
- 9 errors in `src/components/history/viewer/HistoryList.tsx`
- 9 errors in `src/components/debt/modals/UpcomingPaymentsModal.tsx`
- 9 errors in `src/components/automation/tabs/RulesTab.tsx`
- 9 errors in `src/components/automation/AutoFundingView.tsx`
- 8 errors in `src/utils/savings/savingsCalculations.ts`
- 8 errors in `src/utils/bills/recurringBillUtils.ts`
- 8 errors in `src/utils/auth/userSetupHelpers.tsx`
- 8 errors in `src/main.tsx`
- 8 errors in `src/hooks/transactions/helpers/transactionQueryHelpers.ts`
- 8 errors in `src/hooks/savings/useSavingsGoalsActions.ts`
- 8 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution.ts`
- 8 errors in `src/hooks/accounts/useSupplementalAccounts.ts`
- 8 errors in `src/components/transactions/components/TransactionRow.tsx`
- 8 errors in `src/components/sync/health/SyncHealthDetails.tsx`
- 8 errors in `src/components/dashboard/ReconcileTransactionModal.tsx`
- 8 errors in `src/components/budgeting/suggestions/SuggestionCard.tsx`
- 8 errors in `src/components/budgeting/DeleteEnvelopeModal.tsx`
- 8 errors in `src/components/bills/BulkUpdateBillRowComponents.tsx`
- 8 errors in `src/components/analytics/AnalyticsDashboard.tsx`
- 8 errors in `src/components/accounts/SupplementalAccounts.tsx`
- 7 errors in `src/utils/security/errorViewer.ts`
- 7 errors in `src/utils/security/cryptoCompat.ts`
- 7 errors in `src/utils/billIcons/iconUtils.ts`
- 7 errors in `src/services/bugReport/index.ts`
- 7 errors in `src/services/bugReport/contextAnalysisService.ts`
- 7 errors in `src/hooks/transactions/useTransactionUtils.ts`
- 7 errors in `src/hooks/transactions/useTransactionFilters.ts`
- 7 errors in `src/hooks/sharing/useBudgetJoining.ts`
- 7 errors in `src/hooks/receipts/useReceiptToTransaction.ts`
- 7 errors in `src/hooks/mobile/useFABBehavior.ts`
- 7 errors in `src/hooks/debts/useDebtManagement.ts`
- 7 errors in `src/hooks/common/useModalManager.ts`
- 7 errors in `src/hooks/budgeting/useEnvelopeEdit.ts`
- 7 errors in `src/components/transactions/import/FieldMapper.tsx`
- 7 errors in `src/components/settings/sections/SyncDebugToolsSection.tsx`
- 7 errors in `src/components/settings/archiving/ArchivingActionButtons.tsx`
- 7 errors in `src/components/security/LockScreen.tsx`
- 7 errors in `src/components/savings/SavingsSummaryCard.tsx`
- 7 errors in `src/components/pwa/InstallPromptModal.tsx`
- 7 errors in `src/components/modals/UnassignedCashModal.tsx`
- 7 errors in `src/components/modals/QuickFundForm.tsx`
- 7 errors in `src/components/history/viewer/ChangeDetails.tsx`
- 7 errors in `src/components/debt/ui/QuickPaymentForm.tsx`
- 7 errors in `src/components/budgeting/suggestions/SuggestionsList.tsx`
- 7 errors in `src/components/budgeting/paycheck/PaycheckAllocationPreview.tsx`
- 7 errors in `src/components/budgeting/PaydayPrediction.tsx`
- 7 errors in `src/components/bills/modals/BillDetailModal.tsx`
- 7 errors in `src/components/bills/BulkUpdateEditor.tsx`
- 7 errors in `src/components/automation/tabs/HistoryTab.tsx`
- 7 errors in `src/App.tsx`
- 6 errors in `src/utils/transactions/splitting.ts`
- 6 errors in `src/utils/transactions/fileParser.ts`
- 6 errors in `src/utils/debts/debtFormValidation.ts`
- 6 errors in `src/utils/debts/debtDebugConfig.ts`
- 6 errors in `src/utils/dataManagement/validationUtils.ts`
- 6 errors in `src/utils/common/BaseMutex.ts`
- 6 errors in `src/utils/budgeting/envelopeStyles.ts`
- 6 errors in `src/services/firebaseSyncService.ts`
- 6 errors in `src/hooks/transactions/useTransactionLedger.ts`
- 6 errors in `src/hooks/common/useExportData.ts`
- 6 errors in `src/hooks/budgeting/usePaycheckForm.ts`
- 6 errors in `src/hooks/bills/useBillManagerUI.ts`
- 6 errors in `src/components/sharing/steps/ShareCodeStep.tsx`
- 6 errors in `src/components/settings/sections/AutoLockSettingsSection.tsx`
- 6 errors in `src/components/savings/SavingsGoals.tsx`
- 6 errors in `src/components/modals/QuickFundModal.tsx`
- 6 errors in `src/components/layout/NavigationTabs.tsx`
- 6 errors in `src/components/debt/ui/PaymentImpactTable.tsx`
- 6 errors in `src/components/budgeting/paycheck/PaycheckHistoryComponents.tsx`
- 6 errors in `src/components/budgeting/paycheck/AllocationPreview.tsx`
- 6 errors in `src/components/budgeting/envelope/UnassignedCashEnvelope.tsx`
- 6 errors in `src/components/budgeting/CreateEnvelopeModalComponents.tsx`
- 6 errors in `src/components/automation/steps/config/PriorityFillConfig.tsx`
- 5 errors in `src/utils/sync/validation/checksumUtils.ts`
- 5 errors in `src/utils/sync/syncFlowValidator.ts`
- 5 errors in `src/utils/sync/syncEdgeCaseTester.ts`
- 5 errors in `src/utils/pwa/offlineDataValidator.ts`
- 5 errors in `src/utils/dataManagement/dexieUtils.ts`
- 5 errors in `src/utils/budgeting/envelopeIntegrityChecker.ts`
- 5 errors in `src/utils/budgeting/autofunding/conditions.ts`
- 5 errors in `src/services/security/securityService.ts`
- 5 errors in `src/services/bugReport/pageDetectionService.ts`
- 5 errors in `src/hooks/transactions/useTransactionSplitter.ts`
- 5 errors in `src/hooks/transactions/useTransactionData.ts`
- 5 errors in `src/hooks/sync/useManualSync.ts`
- 5 errors in `src/hooks/sharing/useQRCodeProcessing.ts`
- 5 errors in `src/hooks/settings/useSettingsDashboard.ts`
- 5 errors in `src/hooks/savings/useSavingsGoals/index.ts`
- 5 errors in `src/hooks/common/useFABActions.ts`
- 5 errors in `src/hooks/common/useActualBalance.ts`
- 5 errors in `src/hooks/common/bug-report/useBugReportHighlight.ts`
- 5 errors in `src/hooks/budgeting/mutations/useTransferFunds.ts`
- 5 errors in `src/hooks/budgeting/mutations/useDeleteEnvelope.ts`
- 5 errors in `src/components/transactions/splitter/SplitActions.tsx`
- 5 errors in `src/components/transactions/components/DeleteConfirmation.tsx`
- 5 errors in `src/components/settings/sections/AccountSettingsSection.tsx`
- 5 errors in `src/components/settings/archiving/ArchivingConfiguration.tsx`
- 5 errors in `src/components/receipts/steps/ReceiptDataStep.tsx`
- 5 errors in `src/components/receipts/steps/EnvelopeSelectionStep.tsx`
- 5 errors in `src/components/receipts/components/ReceiptUploadArea.tsx`
- 5 errors in `src/components/receipts/components/ExtractedDataField.tsx`
- 5 errors in `src/components/receipts/ReceiptButton.tsx`
- 5 errors in `src/components/layout/ViewRenderer.tsx`
- 5 errors in `src/components/layout/SummaryCards.tsx`
- 5 errors in `src/components/budgeting/envelope/EnvelopeActions.tsx`
- 5 errors in `src/components/budgeting/PaycheckProcessor.tsx`
- 5 errors in `src/components/bills/modals/BillDetailActions.tsx`
- 5 errors in `src/components/bills/BulkBillUpdateModal.tsx`
- 5 errors in `src/components/bills/BillManagerHeader.tsx`
- 5 errors in `src/components/automation/steps/config/SplitRemainderConfig.tsx`
- 5 errors in `src/components/automation/steps/config/PercentageConfig.tsx`
- 5 errors in `src/components/automation/steps/config/FixedAmountConfig.tsx`
- 5 errors in `src/components/automation/steps/RuleConfigurationStep.tsx`
- 5 errors in `src/components/auth/components/ReturningUserActions.tsx`
- 4 errors in `src/utils/sync/retryUtils.ts`
- 4 errors in `src/utils/sync/retryPolicies.ts`
- 4 errors in `src/utils/pwa/pwaManager.ts`
- 4 errors in `src/utils/icons/index.ts`
- 4 errors in `src/utils/bills/billCalculations.ts`
- 4 errors in `src/services/keys/keyManagementService.ts`
- 4 errors in `src/services/chunkedSyncService.ts`
- 4 errors in `src/services/bugReport/browserInfoService.ts`
- 4 errors in `src/hooks/transactions/useTransactionImport.ts`
- 4 errors in `src/hooks/settings/useSettingsSectionRenderer.ts`
- 4 errors in `src/hooks/mobile/usePullToRefresh.ts`
- 4 errors in `src/hooks/layout/usePaycheckOperations.ts`
- 4 errors in `src/hooks/common/useDataInitialization.ts`
- 4 errors in `src/hooks/budgeting/useBudgetHistoryQuery.ts`
- 4 errors in `src/hooks/budgeting/useBudgetData/queries.ts`
- 4 errors in `src/hooks/budgeting/autofunding/useAutoFunding.ts`
- 4 errors in `src/hooks/auth/mutations/useLoginMutations.ts`
- 4 errors in `src/hooks/analytics/useReportExporter.ts`
- 4 errors in `src/components/transactions/ledger/TransactionLedgerHeader.tsx`
- 4 errors in `src/components/transactions/TransactionTable.tsx`
- 4 errors in `src/components/transactions/TransactionLedger.tsx`
- 4 errors in `src/components/sync/health/SyncStatusIndicator.tsx`
- 4 errors in `src/components/settings/sections/SecurityStatusSection.tsx`
- 4 errors in `src/components/settings/archiving/ArchivingStatusOverview.tsx`
- 4 errors in `src/components/pwa/OfflineStatusIndicator.tsx`
- 4 errors in `src/components/pages/MainDashboard.tsx`
- 4 errors in `src/components/onboarding/hooks/useTutorialHighlight.ts`
- 4 errors in `src/components/onboarding/hooks/useTutorialControls.ts`
- 4 errors in `src/components/layout/AppRoutes.tsx`
- 4 errors in `src/components/history/viewer/HistoryControls.tsx`
- 4 errors in `src/components/debt/ui/DebtList.tsx`
- 4 errors in `src/components/budgeting/shared/EnvelopeTypeSelector.tsx`
- 4 errors in `src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx`
- 4 errors in `src/components/budgeting/BillEnvelopeFundingInfo.tsx`
- 4 errors in `src/components/auth/components/UserSetupHeader.tsx`
- 4 errors in `src/components/auth/components/ShareCodeDisplay.tsx`
- 4 errors in `src/components/analytics/tabs/TrendsTab.tsx`
- 3 errors in `src/utils/sync/masterSyncValidator.ts`
- 3 errors in `src/utils/budgeting/paycheckProcessing.ts`
- 3 errors in `src/utils/auth/shareCodeManager.ts`
- 3 errors in `src/utils/analytics/transactionAnalyzer.ts`
- 3 errors in `src/stores/ui/fabStore.ts`
- 3 errors in `src/hooks/transactions/useTransactionsV2.ts`
- 3 errors in `src/hooks/sync/useFirebaseSync.ts`
- 3 errors in `src/hooks/mobile/useFABSmartPositioning.ts`
- 3 errors in `src/hooks/common/useNetworkStatus.ts`
- 3 errors in `src/hooks/common/useConnectionManager/useConnectionOperations.ts`
- 3 errors in `src/hooks/common/bug-report/useBugReportSubmission.ts`
- 3 errors in `src/hooks/common/bug-report/useBugReportDiagnostics.ts`
- 3 errors in `src/hooks/budgeting/useBudgetData/mutationsHelpers.ts`
- 3 errors in `src/hooks/budgeting/autofunding/useUndoOperations.ts`
- 3 errors in `src/hooks/budgeting/autofunding/useAutoFundingData.ts`
- 3 errors in `src/hooks/bills/useBillManagerHelpers.ts`
- 3 errors in `src/hooks/auth/queries/usePasswordValidation.ts`
- 3 errors in `src/hooks/auth/mutations/usePasswordMutations.ts`
- 3 errors in `src/hooks/auth/mutations/useJoinBudgetMutation.ts`
- 3 errors in `src/hooks/analytics/useTransactionAnalysis.ts`
- 3 errors in `src/hooks/analytics/useChartsAnalytics.ts`
- 3 errors in `src/components/transactions/splitter/SplitterHeader.tsx`
- 3 errors in `src/components/transactions/ledger/TransactionPagination.tsx`
- 3 errors in `src/components/transactions/TransactionSplitter.tsx`
- 3 errors in `src/components/sync/ConflictResolutionModal.tsx`
- 3 errors in `src/components/sharing/JoinBudgetModal.tsx`
- 3 errors in `src/components/settings/sections/SecuritySettingsSection.tsx`
- 3 errors in `src/components/settings/archiving/ArchivingPreviewResults.tsx`
- 3 errors in `src/components/settings/SettingsDashboard.tsx`
- 3 errors in `src/components/security/LocalDataSecurityWarning.tsx`
- 3 errors in `src/components/receipts/components/ReceiptImagePreview.tsx`
- 3 errors in `src/components/receipts/components/ReceiptActionButtons.tsx`
- 3 errors in `src/components/receipts/components/ExtractedItemsList.tsx`
- 3 errors in `src/components/mobile/SlideUpModal.tsx`
- 3 errors in `src/components/history/viewer/IntegrityWarning.tsx`
- 3 errors in `src/components/charts/CategoryBarChart.tsx`
- 3 errors in `src/components/budgeting/envelope/EnvelopeItem.tsx`
- 3 errors in `src/components/budgeting/envelope/EnvelopeHistoryModal.tsx`
- 3 errors in `src/components/budgeting/envelope/EnvelopeHeader.tsx`
- 3 errors in `src/components/budgeting/EditEnvelopeModal.tsx`
- 3 errors in `src/components/bills/modals/BillDetailHeader.tsx`
- 3 errors in `src/components/bills/BulkUpdateSummary.tsx`
- 3 errors in `src/components/bills/BillTabs.tsx`
- 3 errors in `src/components/bills/BillTableHeader.tsx`
- 3 errors in `src/components/bills/BillTableEmptyState.tsx`
- 3 errors in `src/components/bills/BillModalHeader.tsx`
- 3 errors in `src/components/bills/BillManagerModals.tsx`
- 3 errors in `src/components/bills/AddBillModal.tsx`
- 3 errors in `src/components/automation/steps/RuleTypeStep.tsx`
- 3 errors in `src/components/analytics/tabs/HealthTab.tsx`
- 3 errors in `src/components/analytics/components/AnalyticsHeader.tsx`
- 2 errors in `src/utils/testing/storeTestUtils.ts`
- 2 errors in `src/utils/sync/SyncMutex.ts`
- 2 errors in `src/utils/security/keyExport.ts`
- 2 errors in `src/utils/debts/calculations/nextPaymentDate.ts`
- 2 errors in `src/utils/debts/calculations/interestCalculation.ts`
- 2 errors in `src/utils/dataManagement/fileUtils.ts`
- 2 errors in `src/utils/common/transactionArchiving.ts`
- 2 errors in `src/utils/common/lazyImport.ts`
- 2 errors in `src/utils/budgeting/envelopeCalculations.ts`
- 2 errors in `src/utils/bills/billUpdateHelpers.ts`
- 2 errors in `src/services/firebaseMessaging.ts`
- 2 errors in `src/services/bugReport/errorTrackingService.ts`
- 2 errors in `src/hooks/transactions/useTransactionTable.ts`
- 2 errors in `src/hooks/transactions/useTransactionQuery.ts`
- 2 errors in `src/hooks/transactions/useTransactionForm.ts`
- 2 errors in `src/hooks/transactions/useTransactionFileUpload.ts`
- 2 errors in `src/hooks/sharing/useShareCodeValidation.ts`
- 2 errors in `src/hooks/security/useSecuritySettingsLogic.ts`
- 2 errors in `src/hooks/mobile/useBottomNavigation.ts`
- 2 errors in `src/hooks/common/useTransactionArchiving.ts`
- 2 errors in `src/hooks/common/useRouterPageDetection.ts`
- 2 errors in `src/hooks/budgeting/usePaydayPrediction.ts`
- 2 errors in `src/hooks/budgeting/usePaycheckHistory.ts`
- 2 errors in `src/hooks/budgeting/useEnvelopesQuery.ts`
- 2 errors in `src/hooks/budgeting/useBudgetData/utilities.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useExecutionHistory.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionSummary.ts`
- 2 errors in `src/hooks/auth/useAuthenticationManager.ts`
- 2 errors in `src/hooks/auth/mutations/useProfileMutations.ts`
- 2 errors in `src/hooks/analytics/utils/pdfGeneratorUtils.ts`
- 2 errors in `src/hooks/analytics/useBillAnalysis.ts`
- 2 errors in `src/hooks/analytics/useAnalyticsExport.ts`
- 2 errors in `src/contexts/authUtils.ts`
- 2 errors in `src/components/transactions/import/ImportProgress.tsx`
- 2 errors in `src/components/settings/sections/DevToolsSection.tsx`
- 2 errors in `src/components/settings/sections/ClipboardSecuritySection.tsx`
- 2 errors in `src/components/settings/archiving/ArchivingProgress.tsx`
- 2 errors in `src/components/settings/archiving/ArchivingHeader.tsx`
- 2 errors in `src/components/settings/EnvelopeIntegrityChecker.tsx`
- 2 errors in `src/components/receipts/components/ReceiptExtractedData.tsx`
- 2 errors in `src/components/receipts/components/ReceiptErrorState.tsx`
- 2 errors in `src/components/receipts/ReceiptScanner.tsx`
- 2 errors in `src/components/onboarding/hooks/useTutorialPositioning.ts`
- 2 errors in `src/components/onboarding/EmptyStateHints.tsx`
- 2 errors in `src/components/mobile/FABActionMenu.tsx`
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
- 2 errors in `src/components/budgeting/envelope/SwipeIndicatorOverlay.tsx`
- 2 errors in `src/components/budgeting/envelope/EnvelopeModalHeader.tsx`
- 2 errors in `src/components/budgeting/SmartEnvelopeSuggestions.tsx`
- 2 errors in `src/components/budgeting/EditEnvelopeModalComponents.tsx`
- 2 errors in `src/components/bills/smartBillMatcherHelpers.ts`
- 2 errors in `src/components/bills/BulkUpdateModeSelector.tsx`
- 2 errors in `src/components/bills/BillFormFields.tsx`
- 2 errors in `src/components/automation/steps/TriggerScheduleStep.tsx`
- 2 errors in `src/components/automation/components/StepNavigation.tsx`
- 2 errors in `src/components/auth/components/UserNameInput.tsx`
- 2 errors in `src/components/auth/UserIndicator.tsx`
- 2 errors in `src/components/analytics/tabs/OverviewTab.tsx`
- 2 errors in `src/components/analytics/components/TabContent.tsx`
- 1 errors in `src/utils/transactions/operations.ts`
- 1 errors in `src/utils/sync/resilience/index.ts`
- 1 errors in `src/utils/sync/dataDetectionHelper.ts`
- 1 errors in `src/utils/sync/SyncQueue.ts`
- 1 errors in `src/utils/stores/createSafeStore.ts`
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
- 1 errors in `src/services/editLockService.ts`
- 1 errors in `src/services/activityLogger.ts`
- 1 errors in `src/hooks/sync/useSyncHealthIndicator.ts`
- 1 errors in `src/hooks/mobile/useSlideUpModal.ts`
- 1 errors in `src/hooks/debts/useDebtModalLogic.ts`
- 1 errors in `src/hooks/dashboard/useMainDashboard.ts`
- 1 errors in `src/hooks/common/useTransactions.ts`
- 1 errors in `src/hooks/common/usePrompt.ts`
- 1 errors in `src/hooks/common/useImportData.ts`
- 1 errors in `src/hooks/common/useConnectionManager/useConnectionConfig.ts`
- 1 errors in `src/hooks/common/useBugReport.ts`
- 1 errors in `src/hooks/budgeting/usePaycheckFormValidated.ts`
- 1 errors in `src/hooks/budgeting/useEnvelopes.ts`
- 1 errors in `src/hooks/budgeting/useBudgetData/queryFunctions.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingHistory.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts`
- 1 errors in `src/hooks/bills/useBulkBillOperations.ts`
- 1 errors in `src/hooks/bills/useBills/index.ts`
- 1 errors in `src/hooks/bills/useBillOperations.ts`
- 1 errors in `src/hooks/auth/useKeyManagementUI.ts`
- 1 errors in `src/hooks/auth/useKeyManagement.ts`
- 1 errors in `src/hooks/auth/useAuthManager.ts`
- 1 errors in `src/hooks/analytics/utils/csvImageExportUtils.ts`
- 1 errors in `src/hooks/analytics/useTransactionFiltering.ts`
- 1 errors in `src/hooks/analytics/useAnalyticsIntegration.ts`
- 1 errors in `src/components/transactions/splitter/SplitTotals.tsx`
- 1 errors in `src/components/settings/archiving/ArchivingResult.tsx`
- 1 errors in `src/components/receipts/components/ReceiptScannerHeader.tsx`
- 1 errors in `src/components/onboarding/hooks/useTutorialSteps.ts`
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
- 1 errors in `src/components/budgeting/envelope/EnvelopeSummary.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeGridView.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeActivitySummary.tsx`
- 1 errors in `src/components/budgeting/CreateEnvelopeModal.tsx`
- 1 errors in `src/components/budgeting/CashFlowSummary.tsx`
- 1 errors in `src/components/bills/modals/BillDetailStats.tsx`
- 1 errors in `src/components/bills/BillFormSections.tsx`
- 1 errors in `src/components/bills/BillDiscoveryModal.tsx`
- 1 errors in `src/components/auth/key-management/MainContent.tsx`
- 1 errors in `src/components/auth/components/UserSetupLayout.tsx`
- 1 errors in `src/components/auth/KeyManagementSettings.tsx`
- 1 errors in `src/components/analytics/TrendAnalysisCharts.tsx`
- 1 errors in `src/components/analytics/SmartCategoryManager.tsx`
- 1 errors in `src/components/analytics/ReportExporter.tsx`
- 1 errors in `src/components/analytics/CategorySuggestionsTab.tsx`

### Strict Mode Error Breakdown
| Count | Error Code |
|---|---|
| 628 | `TS7006` |
| 609 | `TS7031` |
| 185 | `TS2345` |
| 154 | `TS2322` |
| 127 | `TS2339` |
| 110 | `TS18046` |
| 64 | `TS7005` |
| 63 | `TS7053` |
| 50 | `TS18048` |
| 39 | `TS7034` |
| 37 | `TS18047` |
| 25 | `TS2769` |
| 6 | `TS2411` |
| 5 | `TS2722` |
| 5 | `TS2531` |
| 5 | `TS2353` |
| 4 | `TS2352` |
| 3 | `TS2783` |
| 2 | `TS7022` |
| 2 | `TS7019` |
| 2 | `TS2719` |
| 1 | `TS7023` |
| 1 | `TS7016` |
| 1 | `TS2774` |
| 1 | `TS2740` |
| 1 | `TS2698` |
| 1 | `TS2683` |
| 1 | `TS2538` |
| 1 | `TS2532` |
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
src/components/analytics/AnalyticsDashboard.tsx(170,5): error TS2322: Type 'unknown[]' is not assignable to type 'never[]'.
  Type 'unknown' is not assignable to type 'never'.
src/components/analytics/AnalyticsDashboard.tsx(460,15): error TS2322: Type '{ period: string; dateRange: { startDate: Date; endDate: Date; }; summary: { totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number; incomeTransactionCount: number; ... 4 more ...; expenseRatio: number; }; ... 10 more ...; _meta: { ...; }; } | undefined' is not assignable to type 'Record<string, unknown>'.
  Type 'undefined' is not assignable to type 'Record<string, unknown>'.
src/components/analytics/AnalyticsDashboard.tsx(461,15): error TS2322: Type '{ period: string; dateRange: { startDate: Date; endDate: Date; }; summary: { totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number; incomeTransactionCount: number; ... 4 more ...; expenseRatio: number; }; ... 10 more ...; _meta: { ...; }; } | undefined' is not assignable to type 'Record<string, unknown>'.
  Type 'undefined' is not assignable to type 'Record<string, unknown>'.
src/components/analytics/AnalyticsDashboard.tsx(462,15): error TS2322: Type '{ period: string; dateRange: { startDate: Date; endDate: Date; }; summary: { totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number; incomeTransactionCount: number; ... 4 more ...; expenseRatio: number; }; ... 10 more ...; _meta: { ...; }; } | undefined' is not assignable to type 'Record<string, unknown>'.
  Type 'undefined' is not assignable to type 'Record<string, unknown>'.
src/components/analytics/AnalyticsDashboard.tsx(463,15): error TS2322: Type '{ period: string; dateRange: { startDate: Date; endDate: Date; }; summary: { totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number; incomeTransactionCount: number; ... 4 more ...; expenseRatio: number; }; ... 10 more ...; _meta: { ...; }; } | undefined' is not assignable to type 'Record<string, unknown>'.
  Type 'undefined' is not assignable to type 'Record<string, unknown>'.
src/components/analytics/AnalyticsDashboard.tsx(464,15): error TS2322: Type '{ period: string; dateRange: { startDate: Date; endDate: Date; }; summary: { totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number; incomeTransactionCount: number; ... 4 more ...; expenseRatio: number; }; ... 10 more ...; _meta: { ...; }; } | undefined' is not assignable to type 'Record<string, unknown>'.
  Type 'undefined' is not assignable to type 'Record<string, unknown>'.
src/components/analytics/AnalyticsDashboard.tsx(466,13): error TS2322: Type '{ period: string; dateRange: { startDate: Date; endDate: Date; }; summary: { totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number; incomeTransactionCount: number; ... 4 more ...; expenseRatio: number; }; ... 10 more ...; _meta: { ...; }; } | undefined' is not assignable to type 'Record<string, unknown>'.
  Type 'undefined' is not assignable to type 'Record<string, unknown>'.
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
src/components/auth/components/ReturningUserActions.tsx(10,3): error TS7031: Binding element 'onSubmit' implicitly has an 'any' type.
src/components/auth/components/ReturningUserActions.tsx(11,3): error TS7031: Binding element 'onChangeProfile' implicitly has an 'any' type.
src/components/auth/components/ReturningUserActions.tsx(12,3): error TS7031: Binding element 'onStartFresh' implicitly has an 'any' type.
src/components/auth/components/ReturningUserActions.tsx(13,3): error TS7031: Binding element 'isLoading' implicitly has an 'any' type.
src/components/auth/components/ReturningUserActions.tsx(14,3): error TS7031: Binding element 'canSubmit' implicitly has an 'any' type.
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
src/components/automation/AutoFundingDashboard.tsx(8,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/automation/AutoFundingDashboard.tsx(13,33): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboard.tsx(13,41): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboard.tsx(14,21): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboard.tsx(14,37): error TS7006: Parameter 'state' implicitly has an 'any' type.
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
src/components/automation/AutoFundingView.tsx(7,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/automation/AutoFundingView.tsx(17,21): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/automation/AutoFundingView.tsx(17,37): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/automation/AutoFundingView.tsx(33,7): error TS2322: Type 'Dispatch<SetStateAction<null>>' is not assignable to type '(rule: unknown) => void'.
  Types of parameters 'value' and 'rule' are incompatible.
    Type 'unknown' is not assignable to type 'SetStateAction<null>'.
src/components/automation/AutoFundingView.tsx(35,22): error TS2322: Type '(ruleId: string, updates: Partial<AutoFundingRule>) => void' is not assignable to type '(id: unknown, data: unknown) => void'.
  Types of parameters 'ruleId' and 'id' are incompatible.
    Type 'unknown' is not assignable to type 'string'.
src/components/automation/AutoFundingView.tsx(35,34): error TS2322: Type '(rule: Partial<AutoFundingRule>) => void' is not assignable to type '(data: unknown) => void'.
  Types of parameters 'rule' and 'data' are incompatible.
    Type 'unknown' is not assignable to type 'Partial<AutoFundingRule>'.
src/components/automation/AutoFundingView.tsx(70,59): error TS18046: 'error' is of type 'unknown'.
src/components/automation/AutoFundingView.tsx(104,11): error TS2322: Type 'null' is not assignable to type 'boolean'.
src/components/automation/AutoFundingView.tsx(105,11): error TS2322: Type 'Dispatch<SetStateAction<null>>' is not assignable to type '(show: boolean) => void'.
  Types of parameters 'value' and 'show' are incompatible.
    Type 'boolean' is not assignable to type 'SetStateAction<null>'.
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
src/components/automation/steps/RuleConfigurationStep.tsx(8,3): error TS7031: Binding element 'ruleData' implicitly has an 'any' type.
src/components/automation/steps/RuleConfigurationStep.tsx(9,3): error TS7031: Binding element 'updateConfig' implicitly has an 'any' type.
src/components/automation/steps/RuleConfigurationStep.tsx(10,3): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/automation/steps/RuleConfigurationStep.tsx(11,3): error TS7031: Binding element 'toggleTargetEnvelope' implicitly has an 'any' type.
src/components/automation/steps/RuleConfigurationStep.tsx(12,3): error TS7031: Binding element 'errors' implicitly has an 'any' type.
src/components/automation/steps/RuleTypeStep.tsx(5,25): error TS7031: Binding element 'ruleData' implicitly has an 'any' type.
src/components/automation/steps/RuleTypeStep.tsx(5,35): error TS7031: Binding element 'updateRuleData' implicitly has an 'any' type.
src/components/automation/steps/RuleTypeStep.tsx(5,51): error TS7031: Binding element 'errors' implicitly has an 'any' type.
src/components/automation/steps/TriggerScheduleStep.tsx(5,32): error TS7031: Binding element 'ruleData' implicitly has an 'any' type.
src/components/automation/steps/TriggerScheduleStep.tsx(5,42): error TS7031: Binding element 'updateRuleData' implicitly has an 'any' type.
src/components/automation/steps/config/FixedAmountConfig.tsx(5,30): error TS7031: Binding element 'ruleData' implicitly has an 'any' type.
src/components/automation/steps/config/FixedAmountConfig.tsx(5,40): error TS7031: Binding element 'updateConfig' implicitly has an 'any' type.
src/components/automation/steps/config/FixedAmountConfig.tsx(5,54): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/automation/steps/config/FixedAmountConfig.tsx(5,65): error TS7031: Binding element 'errors' implicitly has an 'any' type.
src/components/automation/steps/config/FixedAmountConfig.tsx(47,27): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/components/automation/steps/config/PercentageConfig.tsx(5,29): error TS7031: Binding element 'ruleData' implicitly has an 'any' type.
src/components/automation/steps/config/PercentageConfig.tsx(5,39): error TS7031: Binding element 'updateConfig' implicitly has an 'any' type.
src/components/automation/steps/config/PercentageConfig.tsx(5,53): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/automation/steps/config/PercentageConfig.tsx(5,64): error TS7031: Binding element 'errors' implicitly has an 'any' type.
src/components/automation/steps/config/PercentageConfig.tsx(50,27): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/components/automation/steps/config/PriorityFillConfig.tsx(5,31): error TS7031: Binding element 'ruleData' implicitly has an 'any' type.
src/components/automation/steps/config/PriorityFillConfig.tsx(5,41): error TS7031: Binding element 'updateConfig' implicitly has an 'any' type.
src/components/automation/steps/config/PriorityFillConfig.tsx(5,55): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/automation/steps/config/PriorityFillConfig.tsx(5,66): error TS7031: Binding element 'errors' implicitly has an 'any' type.
src/components/automation/steps/config/PriorityFillConfig.tsx(18,27): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/components/automation/steps/config/PriorityFillConfig.tsx(49,46): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/automation/steps/config/SplitRemainderConfig.tsx(5,33): error TS7031: Binding element 'ruleData' implicitly has an 'any' type.
src/components/automation/steps/config/SplitRemainderConfig.tsx(5,43): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/automation/steps/config/SplitRemainderConfig.tsx(5,54): error TS7031: Binding element 'toggleTargetEnvelope' implicitly has an 'any' type.
src/components/automation/steps/config/SplitRemainderConfig.tsx(5,76): error TS7031: Binding element 'errors' implicitly has an 'any' type.
src/components/automation/steps/config/SplitRemainderConfig.tsx(14,27): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/components/automation/tabs/HistoryTab.tsx(5,23): error TS7031: Binding element 'executionHistory' implicitly has an 'any' type.
src/components/automation/tabs/HistoryTab.tsx(5,41): error TS7031: Binding element 'showExecutionDetails' implicitly has an 'any' type.
src/components/automation/tabs/HistoryTab.tsx(5,63): error TS7031: Binding element 'onToggleDetails' implicitly has an 'any' type.
src/components/automation/tabs/HistoryTab.tsx(20,34): error TS7006: Parameter 'execution' implicitly has an 'any' type.
src/components/automation/tabs/HistoryTab.tsx(20,45): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/automation/tabs/HistoryTab.tsx(92,46): error TS7006: Parameter 'result' implicitly has an 'any' type.
src/components/automation/tabs/HistoryTab.tsx(92,54): error TS7006: Parameter 'resultIndex' implicitly has an 'any' type.
src/components/automation/tabs/RulesTab.tsx(4,3): error TS7031: Binding element 'rules' implicitly has an 'any' type.
src/components/automation/tabs/RulesTab.tsx(5,3): error TS7031: Binding element 'onCreateRule' implicitly has an 'any' type.
src/components/automation/tabs/RulesTab.tsx(6,3): error TS7031: Binding element 'onEditRule' implicitly has an 'any' type.
src/components/automation/tabs/RulesTab.tsx(7,3): error TS7031: Binding element 'onDeleteRule' implicitly has an 'any' type.
src/components/automation/tabs/RulesTab.tsx(8,3): error TS7031: Binding element 'onToggleRule' implicitly has an 'any' type.
src/components/automation/tabs/RulesTab.tsx(9,3): error TS7031: Binding element 'onExecuteRules' implicitly has an 'any' type.
src/components/automation/tabs/RulesTab.tsx(10,3): error TS7031: Binding element 'isExecuting' implicitly has an 'any' type.
src/components/automation/tabs/RulesTab.tsx(12,40): error TS7006: Parameter 'r' implicitly has an 'any' type.
src/components/automation/tabs/RulesTab.tsx(28,23): error TS7006: Parameter 'rule' implicitly has an 'any' type.
src/components/automation/tabs/RulesTabComponents.tsx(9,33): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/automation/tabs/RulesTabComponents.tsx(24,34): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/automation/tabs/RulesTabComponents.tsx(39,35): error TS7006: Parameter 'trigger' implicitly has an 'any' type.
src/components/automation/tabs/RulesTabComponents.tsx(58,32): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/automation/tabs/RulesTabComponents.tsx(93,28): error TS7031: Binding element 'rule' implicitly has an 'any' type.
src/components/automation/tabs/RulesTabComponents.tsx(93,34): error TS7031: Binding element 'onToggleRule' implicitly has an 'any' type.
src/components/automation/tabs/RulesTabComponents.tsx(93,48): error TS7031: Binding element 'onEditRule' implicitly has an 'any' type.
src/components/automation/tabs/RulesTabComponents.tsx(93,60): error TS7031: Binding element 'onDeleteRule' implicitly has an 'any' type.
src/components/automation/tabs/RulesTabComponents.tsx(183,36): error TS7031: Binding element 'onCreateRule' implicitly has an 'any' type.
src/components/automation/tabs/RulesTabComponents.tsx(200,36): error TS7031: Binding element 'onExecuteRules' implicitly has an 'any' type.
src/components/automation/tabs/RulesTabComponents.tsx(200,52): error TS7031: Binding element 'isExecuting' implicitly has an 'any' type.
src/components/automation/tabs/RulesTabComponents.tsx(200,65): error TS7031: Binding element 'hasActiveRules' implicitly has an 'any' type.
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
src/components/bills/BillManager.tsx(19,31): error TS7031: Binding element 'className' implicitly has an 'any' type.
src/components/bills/BillManager.tsx(31,17): error TS7031: Binding element '_onUpdateBill' implicitly has an 'any' type.
src/components/bills/BillManager.tsx(32,26): error TS7031: Binding element '_onCreateRecurringBill' implicitly has an 'any' type.
src/components/bills/BillManager.tsx(33,21): error TS7031: Binding element '_onSearchNewBills' implicitly has an 'any' type.
src/components/bills/BillManager.tsx(34,3): error TS7031: Binding element 'onError' implicitly has an 'any' type.
src/components/bills/BillManager.tsx(115,5): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: unknown) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'unknown' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(116,5): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: unknown) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'unknown' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(170,9): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: BillEntity) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillEntity' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(192,9): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: BillEntity | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillEntity | null' is not assignable to type 'BillRecord | null'.
      Type 'BillEntity' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(193,9): error TS2322: Type '(bill: BillRecord | null) => void' is not assignable to type '(bill: BillEntity | null) => void'.
  Types of parameters 'bill' and 'bill' are incompatible.
    Type 'BillEntity | null' is not assignable to type 'BillRecord | null'.
      Type 'BillEntity' is not assignable to type 'BillRecord | null'.
src/components/bills/BillManager.tsx(198,9): error TS2322: Type '(updatedBills: Bill[]) => Promise<void>' is not assignable to type '(updates: BillEntity[]) => Promise<void>'.
  Types of parameters 'updatedBills' and 'updates' are incompatible.
    Type 'BillEntity[]' is not assignable to type 'Bill[]'.
      Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, category, color
src/components/bills/BillManager.tsx(199,9): error TS2322: Type '(billsToAdd: Bill[]) => Promise<void>' is not assignable to type '(bills: BillEntity[]) => Promise<void>'.
  Types of parameters 'billsToAdd' and 'bills' are incompatible.
    Type 'BillEntity[]' is not assignable to type 'Bill[]'.
      Type 'BillEntity' is missing the following properties from type 'Bill': amount, frequency, dueDate, category, color
src/components/bills/BillManagerHeader.tsx(10,3): error TS7031: Binding element 'isEditLocked' implicitly has an 'any' type.
src/components/bills/BillManagerHeader.tsx(11,3): error TS7031: Binding element 'currentEditor' implicitly has an 'any' type.
src/components/bills/BillManagerHeader.tsx(12,3): error TS7031: Binding element 'isSearching' implicitly has an 'any' type.
src/components/bills/BillManagerHeader.tsx(13,3): error TS7031: Binding element 'searchNewBills' implicitly has an 'any' type.
src/components/bills/BillManagerHeader.tsx(14,3): error TS7031: Binding element 'handleAddNewBill' implicitly has an 'any' type.
src/components/bills/BillManagerModals.tsx(115,11): error TS2322: Type '(billId: string, deleteEnvelope?: boolean | undefined) => Promise<void>' is not assignable to type '(id: unknown, deleteEnvelope?: boolean | undefined) => void | Promise<void>'.
  Types of parameters 'billId' and 'id' are incompatible.
    Type 'unknown' is not assignable to type 'string'.
src/components/bills/BillManagerModals.tsx(153,24): error TS7006: Parameter 'billId' implicitly has an 'any' type.
src/components/bills/BillManagerModals.tsx(153,32): error TS7006: Parameter 'paymentData' implicitly has an 'any' type.
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
src/components/bills/BulkBillUpdateModal.tsx(14,32): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/bills/BulkBillUpdateModal.tsx(14,40): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/bills/BulkBillUpdateModal.tsx(14,69): error TS7031: Binding element 'onUpdateBills' implicitly has an 'any' type.
src/components/bills/BulkBillUpdateModal.tsx(14,84): error TS7031: Binding element 'onError' implicitly has an 'any' type.
src/components/bills/BulkBillUpdateModal.tsx(55,17): error TS18046: 'error' is of type 'unknown'.
src/components/bills/BulkUpdateBillRowComponents.tsx(7,37): error TS7031: Binding element 'change' implicitly has an 'any' type.
src/components/bills/BulkUpdateBillRowComponents.tsx(7,45): error TS7031: Binding element 'amountChange' implicitly has an 'any' type.
src/components/bills/BulkUpdateBillRowComponents.tsx(7,59): error TS7031: Binding element 'billId' implicitly has an 'any' type.
src/components/bills/BulkUpdateBillRowComponents.tsx(7,67): error TS7031: Binding element 'updateChange' implicitly has an 'any' type.
src/components/bills/BulkUpdateBillRowComponents.tsx(32,35): error TS7031: Binding element 'change' implicitly has an 'any' type.
src/components/bills/BulkUpdateBillRowComponents.tsx(32,43): error TS7031: Binding element 'billId' implicitly has an 'any' type.
src/components/bills/BulkUpdateBillRowComponents.tsx(32,51): error TS7031: Binding element 'updateChange' implicitly has an 'any' type.
src/components/bills/BulkUpdateBillRowComponents.tsx(53,28): error TS7031: Binding element 'bill' implicitly has an 'any' type.
src/components/bills/BulkUpdateEditor.tsx(7,3): error TS7031: Binding element 'selectedBills' implicitly has an 'any' type.
src/components/bills/BulkUpdateEditor.tsx(8,3): error TS7031: Binding element 'changes' implicitly has an 'any' type.
src/components/bills/BulkUpdateEditor.tsx(9,3): error TS7031: Binding element 'updateMode' implicitly has an 'any' type.
src/components/bills/BulkUpdateEditor.tsx(10,3): error TS7031: Binding element 'updateChange' implicitly has an 'any' type.
src/components/bills/BulkUpdateEditor.tsx(11,3): error TS7031: Binding element 'applyBulkChange' implicitly has an 'any' type.
src/components/bills/BulkUpdateEditor.tsx(12,3): error TS7031: Binding element 'resetChanges' implicitly has an 'any' type.
src/components/bills/BulkUpdateEditor.tsx(73,31): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/components/bills/BulkUpdateModeSelector.tsx(9,35): error TS7031: Binding element 'updateMode' implicitly has an 'any' type.
src/components/bills/BulkUpdateModeSelector.tsx(9,47): error TS7031: Binding element 'setUpdateMode' implicitly has an 'any' type.
src/components/bills/BulkUpdateSummary.tsx(9,30): error TS7031: Binding element 'summary' implicitly has an 'any' type.
src/components/bills/BulkUpdateSummary.tsx(9,39): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/bills/BulkUpdateSummary.tsx(9,48): error TS7031: Binding element 'handleSubmit' implicitly has an 'any' type.
src/components/bills/modals/BillDetailActions.tsx(10,3): error TS7031: Binding element 'bill' implicitly has an 'any' type.
src/components/bills/modals/BillDetailActions.tsx(11,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/bills/modals/BillDetailActions.tsx(12,3): error TS7031: Binding element 'handleEdit' implicitly has an 'any' type.
src/components/bills/modals/BillDetailActions.tsx(13,3): error TS7031: Binding element 'handleDelete' implicitly has an 'any' type.
src/components/bills/modals/BillDetailActions.tsx(14,3): error TS7031: Binding element 'handleCreateRecurring' implicitly has an 'any' type.
src/components/bills/modals/BillDetailHeader.tsx(10,36): error TS7031: Binding element 'bill' implicitly has an 'any' type.
src/components/bills/modals/BillDetailHeader.tsx(10,42): error TS7031: Binding element 'statusInfo' implicitly has an 'any' type.
src/components/bills/modals/BillDetailHeader.tsx(10,54): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/bills/modals/BillDetailModal.tsx(17,3): error TS7031: Binding element 'bill' implicitly has an 'any' type.
src/components/bills/modals/BillDetailModal.tsx(18,3): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/bills/modals/BillDetailModal.tsx(19,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/bills/modals/BillDetailModal.tsx(20,3): error TS7031: Binding element 'onDelete' implicitly has an 'any' type.
src/components/bills/modals/BillDetailModal.tsx(21,3): error TS7031: Binding element 'onMarkPaid' implicitly has an 'any' type.
src/components/bills/modals/BillDetailModal.tsx(22,3): error TS7031: Binding element 'onEdit' implicitly has an 'any' type.
src/components/bills/modals/BillDetailModal.tsx(23,3): error TS7031: Binding element 'onCreateRecurring' implicitly has an 'any' type.
src/components/bills/modals/BillDetailSections.tsx(9,44): error TS7031: Binding element 'bill' implicitly has an 'any' type.
src/components/bills/modals/BillDetailSections.tsx(21,17): error TS7006: Parameter 'payment' implicitly has an 'any' type.
src/components/bills/modals/BillDetailSections.tsx(21,26): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/bills/modals/BillDetailSections.tsx(49,3): error TS7031: Binding element 'bill' implicitly has an 'any' type.
src/components/bills/modals/BillDetailSections.tsx(50,3): error TS7031: Binding element 'showPaymentForm' implicitly has an 'any' type.
src/components/bills/modals/BillDetailSections.tsx(51,3): error TS7031: Binding element 'paymentAmount' implicitly has an 'any' type.
src/components/bills/modals/BillDetailSections.tsx(52,3): error TS7031: Binding element 'handleShowPaymentForm' implicitly has an 'any' type.
src/components/bills/modals/BillDetailSections.tsx(53,3): error TS7031: Binding element 'handleHidePaymentForm' implicitly has an 'any' type.
src/components/bills/modals/BillDetailSections.tsx(54,3): error TS7031: Binding element 'handleMarkPaid' implicitly has an 'any' type.
src/components/bills/modals/BillDetailSections.tsx(55,3): error TS7031: Binding element 'handlePaymentAmountChange' implicitly has an 'any' type.
src/components/bills/modals/BillDetailStats.tsx(10,35): error TS7031: Binding element 'bill' implicitly has an 'any' type.
src/components/bills/modals/BulkUpdateConfirmModal.tsx(11,3): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/bills/modals/BulkUpdateConfirmModal.tsx(12,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/bills/modals/BulkUpdateConfirmModal.tsx(13,3): error TS7031: Binding element 'onConfirm' implicitly has an 'any' type.
src/components/bills/modals/BulkUpdateConfirmModal.tsx(14,3): error TS7031: Binding element 'selectedBills' implicitly has an 'any' type.
src/components/bills/modals/BulkUpdateConfirmModal.tsx(15,3): error TS7031: Binding element 'changes' implicitly has an 'any' type.
src/components/bills/modals/BulkUpdateConfirmModal.tsx(16,3): error TS7031: Binding element 'summary' implicitly has an 'any' type.
src/components/bills/modals/BulkUpdateConfirmModal.tsx(51,35): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/components/bills/modals/BulkUpdateConfirmModal.tsx(71,24): error TS18047: 'dateChange' is possibly 'null'.
src/components/bills/modals/BulkUpdateConfirmModal.tsx(73,70): error TS18047: 'dateChange' is possibly 'null'.
src/components/bills/modals/BulkUpdateConfirmModal.tsx(74,72): error TS18047: 'dateChange' is possibly 'null'.
src/components/bills/smartBillMatcherHelpers.ts(45,36): error TS7006: Parameter 'confidence' implicitly has an 'any' type.
src/components/bills/smartBillMatcherHelpers.ts(52,35): error TS7006: Parameter 'confidence' implicitly has an 'any' type.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(8,30): error TS7006: Parameter 'progress' implicitly has an 'any' type.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(16,28): error TS7006: Parameter 'days' implicitly has an 'any' type.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(103,47): error TS18048: 'nextBill.amount' is possibly 'undefined'.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(301,11): error TS2322: Type '{ id: string; name: string; amount: number; dueDate: string; category?: string | undefined; frequency: string; } | null | undefined' is not assignable to type '{ amount: number; frequency?: string | undefined; } | undefined'.
  Type 'null' is not assignable to type '{ amount: number; frequency?: string | undefined; } | undefined'.
src/components/budgeting/CashFlowSummary.tsx(4,28): error TS7031: Binding element 'cashFlow' implicitly has an 'any' type.
src/components/budgeting/CreateEnvelopeModal.tsx(57,5): error TS2322: Type 'unknown[]' is not assignable to type 'never[]'.
  Type 'unknown' is not assignable to type 'never'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(133,24): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(134,24): error TS2322: Type '"savings"' is not assignable to type 'never'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(134,48): error TS2322: Type '"sinking_fund"' is not assignable to type 'never'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(158,32): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(165,11): error TS2322: Type 'unknown[]' is not assignable to type 'never[]'.
  Type 'unknown' is not assignable to type 'never'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(168,11): error TS2322: Type '(() => void) | undefined' is not assignable to type 'null | undefined'.
  Type '() => void' is not assignable to type 'null | undefined'.
src/components/budgeting/DeleteEnvelopeModal.tsx(8,3): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/budgeting/DeleteEnvelopeModal.tsx(9,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/budgeting/DeleteEnvelopeModal.tsx(10,3): error TS7031: Binding element 'onConfirm' implicitly has an 'any' type.
src/components/budgeting/DeleteEnvelopeModal.tsx(11,3): error TS7031: Binding element 'envelope' implicitly has an 'any' type.
src/components/budgeting/DeleteEnvelopeModal.tsx(65,33): error TS2339: Property 'id' does not exist on type 'never'.
src/components/budgeting/DeleteEnvelopeModal.tsx(68,31): error TS2339: Property 'name' does not exist on type 'never'.
src/components/budgeting/DeleteEnvelopeModal.tsx(68,44): error TS2339: Property 'provider' does not exist on type 'never'.
src/components/budgeting/DeleteEnvelopeModal.tsx(68,72): error TS2339: Property 'amount' does not exist on type 'never'.
src/components/budgeting/EditEnvelopeModal.tsx(66,5): error TS2322: Type 'EnvelopeRef | null | undefined' is not assignable to type 'null | undefined'.
  Type 'EnvelopeRef' is not assignable to type 'null | undefined'.
src/components/budgeting/EditEnvelopeModal.tsx(67,5): error TS2322: Type 'unknown[]' is not assignable to type 'never[]'.
  Type 'unknown' is not assignable to type 'never'.
src/components/budgeting/EditEnvelopeModal.tsx(150,13): error TS2322: Type 'LockDocument | null' is not assignable to type 'null | undefined'.
  Type 'LockDocument' is not assignable to type 'null | undefined'.
src/components/budgeting/EditEnvelopeModalComponents.tsx(178,26): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/budgeting/EditEnvelopeModalComponents.tsx(179,11): error TS2322: Type '("savings" | "sinking_fund")[]' is not assignable to type 'never[]'.
  Type '"savings" | "sinking_fund"' is not assignable to type 'never'.
    Type '"savings"' is not assignable to type 'never'.
src/components/budgeting/EnvelopeGrid.tsx(3,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/budgeting/EnvelopeGrid.tsx(272,27): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/budgeting/EnvelopeGrid.tsx(273,30): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/budgeting/EnvelopeGrid.tsx(274,23): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/budgeting/EnvelopeGrid.tsx(275,29): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/budgeting/EnvelopeGrid.tsx(276,28): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/budgeting/EnvelopeGrid.tsx(404,7): error TS2322: Type 'Dispatch<SetStateAction<FilterOptions>>' is not assignable to type '(opts: unknown) => void'.
  Types of parameters 'value' and 'opts' are incompatible.
    Type 'unknown' is not assignable to type 'SetStateAction<FilterOptions>'.
src/components/budgeting/EnvelopeGrid.tsx(408,7): error TS2322: Type '(envelope: EnvelopeRef) => void' is not assignable to type '(env: unknown) => void'.
  Types of parameters 'envelope' and 'env' are incompatible.
    Type 'unknown' is not assignable to type 'EnvelopeRef'.
src/components/budgeting/EnvelopeGrid.tsx(411,7): error TS2322: Type '(envelope: EnvelopeRef) => void' is not assignable to type '(env: unknown) => void'.
  Types of parameters 'envelope' and 'env' are incompatible.
    Type 'unknown' is not assignable to type 'EnvelopeRef'.
src/components/budgeting/EnvelopeGrid.tsx(427,9): error TS2322: Type '(envelopeData: { id: string; [key: string]: unknown; }) => Promise<void>' is not assignable to type '(data: unknown) => Promise<void>'.
  Types of parameters 'envelopeData' and 'data' are incompatible.
    Type 'unknown' is not assignable to type '{ [key: string]: unknown; id: string; }'.
src/components/budgeting/PaycheckProcessor.tsx(20,3): error TS7031: Binding element 'onProcessPaycheck' implicitly has an 'any' type.
src/components/budgeting/PaycheckProcessor.tsx(21,3): error TS7031: Binding element 'onDeletePaycheck' implicitly has an 'any' type.
src/components/budgeting/PaycheckProcessor.tsx(22,3): error TS7031: Binding element 'currentUser' implicitly has an 'any' type.
src/components/budgeting/PaycheckProcessor.tsx(91,25): error TS7031: Binding element 'formHook' implicitly has an 'any' type.
src/components/budgeting/PaycheckProcessor.tsx(125,32): error TS7031: Binding element 'formHook' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(261,36): error TS18047: 'daysUntil' is possibly 'null'.
src/components/budgeting/PaydayPrediction.tsx(261,54): error TS18047: 'daysUntil' is possibly 'null'.
src/components/budgeting/PaydayPrediction.tsx(266,74): error TS2345: Argument of type 'number | null' is not assignable to parameter of type 'number'.
  Type 'null' is not assignable to type 'number'.
src/components/budgeting/PaydayPrediction.tsx(270,9): error TS2322: Type 'number | null' is not assignable to type 'number'.
  Type 'null' is not assignable to type 'number'.
src/components/budgeting/PaydayPrediction.tsx(277,11): error TS2322: Type 'number | null' is not assignable to type 'number'.
  Type 'null' is not assignable to type 'number'.
src/components/budgeting/PaydayPrediction.tsx(278,11): error TS2322: Type '(() => void) | undefined' is not assignable to type '() => void'.
  Type 'undefined' is not assignable to type '() => void'.
src/components/budgeting/PaydayPrediction.tsx(279,11): error TS2322: Type '(() => void) | undefined' is not assignable to type '() => void'.
  Type 'undefined' is not assignable to type '() => void'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(209,5): error TS2322: Type 'Transaction[]' is not assignable to type 'never[]'.
  Type 'Transaction' is not assignable to type 'never'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(210,5): error TS2322: Type 'Envelope[]' is not assignable to type 'never[]'.
  Type 'Envelope' is not assignable to type 'never'.
src/components/budgeting/envelope/EnvelopeActions.tsx(13,28): error TS7031: Binding element 'isCollapsed' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeActions.tsx(13,41): error TS7031: Binding element 'onToggleCollapse' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeActions.tsx(13,59): error TS7031: Binding element 'onEdit' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeActions.tsx(13,67): error TS7031: Binding element 'onViewHistory' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeActions.tsx(14,26): error TS7006: Parameter 'isCollapsed' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeActivitySummary.tsx(11,36): error TS7031: Binding element 'envelope' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeGridView.tsx(101,30): error TS2345: Argument of type '(envelope: { id: string; [key: string]: unknown; }) => JSX.Element' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => Element'.
  Types of parameters 'envelope' and 'value' are incompatible.
    Type 'unknown' is not assignable to type '{ [key: string]: unknown; id: string; }'.
src/components/budgeting/envelope/EnvelopeHeader.tsx(42,38): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeHeader.tsx(74,40): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeHeader.tsx(87,40): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeHistoryModal.tsx(10,49): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeHistoryModal.tsx(10,58): error TS7031: Binding element 'envelope' implicitly has an 'any' type.
src/components/budgeting/envelope/EnvelopeHistoryModal.tsx(16,32): error TS7006: Parameter 'e' implicitly has an 'any' type.
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
src/components/budgeting/envelope/UnassignedCashEnvelope.tsx(4,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/budgeting/envelope/UnassignedCashEnvelope.tsx(6,35): error TS7031: Binding element 'unassignedCash' implicitly has an 'any' type.
src/components/budgeting/envelope/UnassignedCashEnvelope.tsx(6,51): error TS7031: Binding element 'onViewHistory' implicitly has an 'any' type.
src/components/budgeting/envelope/UnassignedCashEnvelope.tsx(7,35): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/budgeting/envelope/UnassignedCashEnvelope.tsx(7,51): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/budgeting/envelope/UnassignedCashEnvelope.tsx(14,31): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/budgeting/paycheck/AllocationPreview.tsx(4,30): error TS7031: Binding element 'allocationPreview' implicitly has an 'any' type.
src/components/budgeting/paycheck/AllocationPreview.tsx(4,49): error TS7031: Binding element 'hasAmount' implicitly has an 'any' type.
src/components/budgeting/paycheck/AllocationPreview.tsx(4,60): error TS7031: Binding element 'allocationMode' implicitly has an 'any' type.
src/components/budgeting/paycheck/AllocationPreview.tsx(32,29): error TS7006: Parameter 'priority' implicitly has an 'any' type.
src/components/budgeting/paycheck/AllocationPreview.tsx(47,29): error TS7006: Parameter 'priority' implicitly has an 'any' type.
src/components/budgeting/paycheck/AllocationPreview.tsx(98,29): error TS7006: Parameter 'allocation' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationModes.tsx(9,36): error TS7031: Binding element 'allocationMode' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationModes.tsx(9,52): error TS7031: Binding element 'onChange' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationModes.tsx(49,3): error TS7031: Binding element 'value' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationModes.tsx(50,3): error TS7031: Binding element 'checked' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationModes.tsx(51,3): error TS7031: Binding element 'onChange' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationModes.tsx(52,3): error TS7031: Binding element 'disabled' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationModes.tsx(53,3): error TS7031: Binding element 'icon' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationModes.tsx(54,3): error TS7031: Binding element 'iconColor' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationModes.tsx(55,3): error TS7031: Binding element 'title' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationModes.tsx(56,3): error TS7031: Binding element 'description' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationPreview.tsx(8,38): error TS7031: Binding element 'preview' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationPreview.tsx(8,47): error TS7031: Binding element 'hasAmount' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationPreview.tsx(57,30): error TS7031: Binding element 'preview' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationPreview.tsx(80,32): error TS7031: Binding element 'preview' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationPreview.tsx(80,41): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationPreview.tsx(84,23): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAllocationPreview.tsx(111,34): error TS7031: Binding element 'preview' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAmountInput.tsx(8,32): error TS7031: Binding element 'value' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckAmountInput.tsx(8,39): error TS7031: Binding element 'onChange' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckHistoryComponents.tsx(62,33): error TS2345: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.
  Type 'undefined' is not assignable to type 'number'.
src/components/budgeting/paycheck/PaycheckHistoryComponents.tsx(68,33): error TS2345: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.
  Type 'undefined' is not assignable to type 'number'.
src/components/budgeting/paycheck/PaycheckHistoryComponents.tsx(74,33): error TS2345: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.
  Type 'undefined' is not assignable to type 'number'.
src/components/budgeting/paycheck/PaycheckHistoryComponents.tsx(75,33): error TS2345: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.
  Type 'undefined' is not assignable to type 'number'.
src/components/budgeting/paycheck/PaycheckHistoryComponents.tsx(140,74): error TS2345: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.
  Type 'undefined' is not assignable to type 'number'.
src/components/budgeting/paycheck/PaycheckHistoryComponents.tsx(153,35): error TS2345: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.
  Type 'undefined' is not assignable to type 'number'.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(12,3): error TS7031: Binding element 'payerName' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(13,3): error TS7031: Binding element 'uniquePayers' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(14,3): error TS7031: Binding element 'showAddNewPayer' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(15,3): error TS7031: Binding element 'newPayerName' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(16,3): error TS7031: Binding element 'isProcessing' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(17,3): error TS7031: Binding element 'onPayerChange' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(18,3): error TS7031: Binding element 'onNewPayerNameChange' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(19,3): error TS7031: Binding element 'onAddNewPayer' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(20,3): error TS7031: Binding element 'onToggleAddNewPayer' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(21,3): error TS7031: Binding element 'getPayerPrediction' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(48,32): error TS7006: Parameter 'payer' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(80,32): error TS7031: Binding element 'payerName' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(80,43): error TS7031: Binding element 'prediction' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(96,3): error TS7031: Binding element 'uniquePayers' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(97,3): error TS7031: Binding element 'newPayerName' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(98,3): error TS7031: Binding element 'onNewPayerNameChange' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(99,3): error TS7031: Binding element 'onAddNewPayer' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckPayerSelector.tsx(100,3): error TS7031: Binding element 'onToggleAddNewPayer' implicitly has an 'any' type.
src/components/budgeting/shared/AllocationModeSelector.tsx(9,35): error TS7031: Binding element 'autoAllocate' implicitly has an 'any' type.
src/components/budgeting/shared/AllocationModeSelector.tsx(9,49): error TS7031: Binding element 'onAutoAllocateChange' implicitly has an 'any' type.
src/components/budgeting/shared/BillConnectionSelector.tsx(6,28): error TS7006: Parameter 'allBills' implicitly has an 'any' type.
src/components/budgeting/shared/BillConnectionSelector.tsx(6,38): error TS7006: Parameter 'envelopeId' implicitly has an 'any' type.
src/components/budgeting/shared/BillConnectionSelector.tsx(7,27): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/components/budgeting/shared/BillConnectionSelector.tsx(11,27): error TS7006: Parameter 'allBills' implicitly has an 'any' type.
src/components/budgeting/shared/BillConnectionSelector.tsx(11,37): error TS7006: Parameter 'selectedBillId' implicitly has an 'any' type.
src/components/budgeting/shared/BillConnectionSelector.tsx(13,25): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/components/budgeting/shared/BillConnectionSelector.tsx(17,27): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/components/budgeting/shared/BillConnectionSelector.tsx(25,33): error TS7031: Binding element 'bill' implicitly has an 'any' type.
src/components/budgeting/shared/BillConnectionSelector.tsx(54,3): error TS7031: Binding element 'selectedBillId' implicitly has an 'any' type.
src/components/budgeting/shared/BillConnectionSelector.tsx(55,3): error TS7031: Binding element 'onBillSelection' implicitly has an 'any' type.
src/components/budgeting/shared/BillConnectionSelector.tsx(87,32): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/components/budgeting/shared/EnvelopeTypeSelector.tsx(11,3): error TS7031: Binding element 'selectedType' implicitly has an 'any' type.
src/components/budgeting/shared/EnvelopeTypeSelector.tsx(12,3): error TS7031: Binding element 'onTypeChange' implicitly has an 'any' type.
src/components/budgeting/shared/EnvelopeTypeSelector.tsx(16,24): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/budgeting/shared/EnvelopeTypeSelector.tsx(40,54): error TS2345: Argument of type 'string' is not assignable to parameter of type 'never'.
src/components/budgeting/shared/FrequencySelector.tsx(11,3): error TS7031: Binding element 'selectedFrequency' implicitly has an 'any' type.
src/components/budgeting/shared/FrequencySelector.tsx(12,3): error TS7031: Binding element 'onFrequencyChange' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionCard.tsx(24,27): error TS7031: Binding element 'suggestion' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionCard.tsx(24,39): error TS7031: Binding element 'onApply' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionCard.tsx(24,48): error TS7031: Binding element 'onDismiss' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionCard.tsx(25,28): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ high: string; medium: string; low: string; }'.
src/components/budgeting/suggestions/SuggestionCard.tsx(26,24): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ new_envelope: string; merchant_pattern: string; increase_envelope: string; decrease_envelope: string; }'.
src/components/budgeting/suggestions/SuggestionCard.tsx(27,25): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ high: string; medium: string; low: string; }'.
src/components/budgeting/suggestions/SuggestionCard.tsx(29,32): error TS7006: Parameter 'action' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionCard.tsx(42,33): error TS7006: Parameter 'action' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionSettings.tsx(6,25): error TS7031: Binding element 'label' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionSettings.tsx(6,32): error TS7031: Binding element 'helpText' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionSettings.tsx(6,42): error TS7031: Binding element 'children' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionSettings.tsx(15,25): error TS7031: Binding element 'stats' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionSettings.tsx(48,3): error TS7031: Binding element 'settings' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionSettings.tsx(49,3): error TS7031: Binding element 'onUpdateSettings' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionSettings.tsx(50,3): error TS7031: Binding element 'onResetSettings' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionSettings.tsx(51,3): error TS7031: Binding element 'onRefresh' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionSettings.tsx(52,3): error TS7031: Binding element 'suggestionStats' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionSettings.tsx(54,32): error TS7006: Parameter 'key' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionSettings.tsx(54,37): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionsList.tsx(6,3): error TS7031: Binding element 'suggestions' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionsList.tsx(7,3): error TS7031: Binding element 'onApplySuggestion' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionsList.tsx(8,3): error TS7031: Binding element 'onDismissSuggestion' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionsList.tsx(26,50): error TS7006: Parameter 'acc' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionsList.tsx(26,55): error TS7006: Parameter 'suggestion' implicitly has an 'any' type.
src/components/budgeting/suggestions/SuggestionsList.tsx(64,24): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ high: { label: string; icon: string; color: string; bgColor: string; borderColor: string; }; medium: { label: string; icon: string; color: string; bgColor: string; borderColor: string; }; low: { label: string; icon: string; color: string; bgColor: string; borderColor: string; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ high: { label: string; icon: string; color: string; bgColor: string; borderColor: string; }; medium: { label: string; icon: string; color: string; bgColor: string; borderColor: string; }; low: { label: string; icon: string; color: string; bgColor: string; borderColor: string; }; }'.
src/components/budgeting/suggestions/SuggestionsList.tsx(84,41): error TS7006: Parameter 'suggestion' implicitly has an 'any' type.
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
src/components/dashboard/ReconcileTransactionModal.tsx(9,3): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/dashboard/ReconcileTransactionModal.tsx(10,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/dashboard/ReconcileTransactionModal.tsx(11,3): error TS7031: Binding element 'newTransaction' implicitly has an 'any' type.
src/components/dashboard/ReconcileTransactionModal.tsx(12,3): error TS7031: Binding element 'onUpdateTransaction' implicitly has an 'any' type.
src/components/dashboard/ReconcileTransactionModal.tsx(13,3): error TS7031: Binding element 'onReconcile' implicitly has an 'any' type.
src/components/dashboard/ReconcileTransactionModal.tsx(103,37): error TS2339: Property 'id' does not exist on type 'never'.
src/components/dashboard/ReconcileTransactionModal.tsx(103,55): error TS2339: Property 'id' does not exist on type 'never'.
src/components/dashboard/ReconcileTransactionModal.tsx(104,27): error TS2339: Property 'name' does not exist on type 'never'.
src/components/debt/DebtDashboard.tsx(66,52): error TS2322: Type 'Dispatch<SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>>' is not assignable to type 'Dispatch<SetStateAction<Record<string, string | boolean>>>'.
  Type 'SetStateAction<Record<string, string | boolean>>' is not assignable to type 'SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>'.
    Type 'Record<string, string | boolean>' is not assignable to type 'SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>'.
      Type 'Record<string, string | boolean>' is missing the following properties from type '{ type: string; status: string; sortBy: string; sortOrder: string; }': type, status, sortBy, sortOrder
src/components/debt/DebtDashboard.tsx(122,9): error TS2322: Type 'DebtAccount[]' is not assignable to type 'never[]'.
  Type 'DebtAccount' is not assignable to type 'never'.
src/components/debt/DebtDashboardComponents.tsx(62,15): error TS2322: Type '(debt: DebtAccount) => void' is not assignable to type '(debt: DebtAccount | Debt) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/debt/DebtDashboardComponents.tsx(63,15): error TS2322: Type '(debt: DebtAccount, amount: number) => void' is not assignable to type '(debt: DebtAccount | Debt, amount: number) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/debt/DebtStrategies.tsx(11,27): error TS7031: Binding element 'debts' implicitly has an 'any' type.
src/components/debt/DebtStrategies.tsx(108,27): error TS2322: Type '{ extraPayment: number; avalanche: { monthsToPayoff: number; totalInterest: number; savings: number; timeSavings?: undefined; interestSavings?: undefined; } | { monthsToPayoff: number; totalInterest: number; timeSavings: number; interestSavings: number; savings?: undefined; }; snowball: { ...; } | { ...; }; }[]' is not assignable to type 'never[]'.
  Type '{ extraPayment: number; avalanche: { monthsToPayoff: number; totalInterest: number; savings: number; timeSavings?: undefined; interestSavings?: undefined; } | { monthsToPayoff: number; totalInterest: number; timeSavings: number; interestSavings: number; savings?: undefined; }; snowball: { monthsToPayoff: number; tot...' is not assignable to type 'never'.
src/components/debt/modals/AddDebtModal.tsx(47,7): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/debt/modals/DebtDetailModal.tsx(71,27): error TS2322: Type '{ expectedPayoff: string; totalInterest: any; payoffDate: string; } | null' is not assignable to type '{ expectedPayoff: string; totalInterest: string; payoffDate: string; }'.
  Type 'null' is not assignable to type '{ expectedPayoff: string; totalInterest: string; payoffDate: string; }'.
src/components/debt/modals/DebtFormFields.tsx(96,11): error TS2322: Type 'string | null | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/debt/modals/DebtModalHeader.tsx(9,28): error TS7031: Binding element 'isEditMode' implicitly has an 'any' type.
src/components/debt/modals/DebtModalHeader.tsx(9,40): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/debt/modals/UpcomingPaymentsModal.tsx(11,34): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/debt/modals/UpcomingPaymentsModal.tsx(11,42): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/debt/modals/UpcomingPaymentsModal.tsx(16,23): error TS7006: Parameter 'dateString' implicitly has an 'any' type.
src/components/debt/modals/UpcomingPaymentsModal.tsx(24,82): error TS2339: Property 'amount' does not exist on type 'never'.
src/components/debt/modals/UpcomingPaymentsModal.tsx(67,35): error TS2339: Property 'debtId' does not exist on type 'never'.
src/components/debt/modals/UpcomingPaymentsModal.tsx(71,71): error TS2339: Property 'debtName' does not exist on type 'never'.
src/components/debt/modals/UpcomingPaymentsModal.tsx(72,83): error TS2339: Property 'dueDate' does not exist on type 'never'.
src/components/debt/modals/UpcomingPaymentsModal.tsx(76,33): error TS2339: Property 'amount' does not exist on type 'never'.
src/components/debt/modals/UpcomingPaymentsModal.tsx(78,78): error TS2339: Property 'type' does not exist on type 'never'.
src/components/debt/ui/DebtCardProgressBar.tsx(5,32): error TS7031: Binding element 'progressData' implicitly has an 'any' type.
src/components/debt/ui/DebtList.tsx(200,107): error TS2339: Property 'className' does not exist on type 'never'.
src/components/debt/ui/DebtList.tsx(203,29): error TS2339: Property 'icon' does not exist on type 'never'.
src/components/debt/ui/DebtList.tsx(203,41): error TS2339: Property 'label' does not exist on type 'never'.
src/components/debt/ui/DebtList.tsx(203,55): error TS2339: Property 'name' does not exist on type 'never'.
src/components/debt/ui/DebtProgressBar.tsx(5,28): error TS7031: Binding element 'progressData' implicitly has an 'any' type.
src/components/debt/ui/DebtSummaryCards.tsx(8,29): error TS7031: Binding element 'stats' implicitly has an 'any' type.
src/components/debt/ui/DebtSummaryCards.tsx(8,36): error TS7031: Binding element 'onDueSoonClick' implicitly has an 'any' type.
src/components/debt/ui/PaymentImpactTable.tsx(53,45): error TS2339: Property 'extraPayment' does not exist on type 'never'.
src/components/debt/ui/PaymentImpactTable.tsx(61,79): error TS2339: Property 'extraPayment' does not exist on type 'never'.
src/components/debt/ui/PaymentImpactTable.tsx(75,35): error TS2339: Property 'avalanche' does not exist on type 'never'.
src/components/debt/ui/PaymentImpactTable.tsx(81,35): error TS2339: Property 'avalanche' does not exist on type 'never'.
src/components/debt/ui/PaymentImpactTable.tsx(99,35): error TS2339: Property 'snowball' does not exist on type 'never'.
src/components/debt/ui/PaymentImpactTable.tsx(105,35): error TS2339: Property 'snowball' does not exist on type 'never'.
src/components/debt/ui/QuickPaymentForm.tsx(8,3): error TS7031: Binding element 'showPaymentForm' implicitly has an 'any' type.
src/components/debt/ui/QuickPaymentForm.tsx(9,3): error TS7031: Binding element 'paymentAmount' implicitly has an 'any' type.
src/components/debt/ui/QuickPaymentForm.tsx(10,3): error TS7031: Binding element 'setPaymentAmount' implicitly has an 'any' type.
src/components/debt/ui/QuickPaymentForm.tsx(11,3): error TS7031: Binding element 'onSubmit' implicitly has an 'any' type.
src/components/debt/ui/QuickPaymentForm.tsx(12,3): error TS7031: Binding element 'onShowForm' implicitly has an 'any' type.
src/components/debt/ui/QuickPaymentForm.tsx(13,3): error TS7031: Binding element 'onCancel' implicitly has an 'any' type.
src/components/debt/ui/QuickPaymentForm.tsx(14,3): error TS7031: Binding element 'isActiveDebt' implicitly has an 'any' type.
src/components/debt/ui/StrategyCard.tsx(8,25): error TS7031: Binding element 'strategy' implicitly has an 'any' type.
src/components/debt/ui/StrategyCard.tsx(78,35): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/components/history/BudgetHistoryViewer.tsx(23,32): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/history/BudgetHistoryViewer.tsx(52,28): error TS2345: Argument of type 'null' is not assignable to parameter of type 'string'.
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
src/components/history/viewer/ChangeDetails.tsx(6,3): error TS7031: Binding element 'selectedCommit' implicitly has an 'any' type.
src/components/history/viewer/ChangeDetails.tsx(7,3): error TS7031: Binding element 'commitDetailsLoading' implicitly has an 'any' type.
src/components/history/viewer/ChangeDetails.tsx(8,3): error TS7031: Binding element 'commitDetails' implicitly has an 'any' type.
src/components/history/viewer/ChangeDetails.tsx(9,3): error TS7031: Binding element 'handleRestoreFromHistory' implicitly has an 'any' type.
src/components/history/viewer/ChangeDetails.tsx(10,3): error TS7031: Binding element 'getChangeIcon' implicitly has an 'any' type.
src/components/history/viewer/ChangeDetails.tsx(75,45): error TS7006: Parameter 'change' implicitly has an 'any' type.
src/components/history/viewer/ChangeDetails.tsx(75,53): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/history/viewer/HistoryControls.tsx(7,28): error TS7031: Binding element 'filter' implicitly has an 'any' type.
src/components/history/viewer/HistoryControls.tsx(7,36): error TS7031: Binding element 'updateFilter' implicitly has an 'any' type.
src/components/history/viewer/HistoryControls.tsx(7,50): error TS7031: Binding element 'loading' implicitly has an 'any' type.
src/components/history/viewer/HistoryControls.tsx(7,59): error TS7031: Binding element 'exportHistory' implicitly has an 'any' type.
src/components/history/viewer/HistoryHeader.tsx(7,26): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/history/viewer/HistoryList.tsx(6,3): error TS7031: Binding element 'loading' implicitly has an 'any' type.
src/components/history/viewer/HistoryList.tsx(7,3): error TS7031: Binding element 'history' implicitly has an 'any' type.
src/components/history/viewer/HistoryList.tsx(8,3): error TS7031: Binding element 'selectedCommit' implicitly has an 'any' type.
src/components/history/viewer/HistoryList.tsx(9,3): error TS7031: Binding element 'expandedCommits' implicitly has an 'any' type.
src/components/history/viewer/HistoryList.tsx(10,3): error TS7031: Binding element 'handleCommitSelection' implicitly has an 'any' type.
src/components/history/viewer/HistoryList.tsx(11,3): error TS7031: Binding element 'handleRestoreFromHistory' implicitly has an 'any' type.
src/components/history/viewer/HistoryList.tsx(12,3): error TS7031: Binding element 'toggleCommitExpanded' implicitly has an 'any' type.
src/components/history/viewer/HistoryList.tsx(13,3): error TS7031: Binding element 'getAuthorColor' implicitly has an 'any' type.
src/components/history/viewer/HistoryList.tsx(38,25): error TS7006: Parameter 'commit' implicitly has an 'any' type.
src/components/history/viewer/HistoryStatistics.tsx(4,30): error TS7031: Binding element 'statistics' implicitly has an 'any' type.
src/components/history/viewer/IntegrityWarning.tsx(5,29): error TS7031: Binding element 'integrityCheck' implicitly has an 'any' type.
src/components/history/viewer/IntegrityWarning.tsx(5,45): error TS7031: Binding element 'showIntegrityDetails' implicitly has an 'any' type.
src/components/history/viewer/IntegrityWarning.tsx(5,67): error TS7031: Binding element 'toggleIntegrityDetails' implicitly has an 'any' type.
src/components/layout/AppRoutes.tsx(18,22): error TS7031: Binding element 'budget' implicitly has an 'any' type.
src/components/layout/AppRoutes.tsx(18,30): error TS7031: Binding element 'currentUser' implicitly has an 'any' type.
src/components/layout/AppRoutes.tsx(18,43): error TS7031: Binding element 'totalBiweeklyNeed' implicitly has an 'any' type.
src/components/layout/AppRoutes.tsx(18,62): error TS7031: Binding element 'setActiveView' implicitly has an 'any' type.
src/components/layout/AppWrapper.tsx(9,23): error TS7031: Binding element 'firebaseSync' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(3,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/layout/MainLayout.tsx(195,9): error TS2322: Type 'Dispatch<SetStateAction<null>>' is not assignable to type '(conflicts: unknown) => void'.
  Types of parameters 'value' and 'conflicts' are incompatible.
    Type 'unknown' is not assignable to type 'SetStateAction<null>'.
src/components/layout/MainLayout.tsx(210,54): error TS2322: Type '(id: number) => void' is not assignable to type '(id: string | number) => void'.
  Types of parameters 'id' and 'id' are incompatible.
    Type 'string | number' is not assignable to type 'number'.
      Type 'string' is not assignable to type 'number'.
src/components/layout/MainLayout.tsx(236,24): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(256,18): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ dashboard: string; envelopes: string; savings: string; supplemental: string; paycheck: string; bills: string; transactions: string; debts: string; analytics: string; automation: string; activity: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ dashboard: string; envelopes: string; savings: string; supplemental: string; paycheck: string; bills: string; transactions: string; debts: string; analytics: string; automation: string; activity: string; }'.
src/components/layout/MainLayout.tsx(287,20): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(290,21): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(477,11): error TS2322: Type '(event: ChangeEvent<HTMLInputElement>) => Promise<{ success: boolean; imported: { envelopes: number; bills: number; transactions: number; savingsGoals: number; debts: number; paycheckHistory: number; auditLog: number; }; } | undefined>' is not assignable to type '() => void'.
  Target signature provides too few arguments. Expected 1 or more, but got 0.
src/components/layout/MainLayout.tsx(484,11): error TS2322: Type '(oldPassword: string, newPassword: string) => Promise<void>' is not assignable to type '(password: string) => void'.
  Target signature provides too few arguments. Expected 2 or more, but got 1.
src/components/layout/MainLayout.tsx(485,11): error TS2322: Type 'unknown' is not assignable to type '{ userName?: string | undefined; userColor?: string | undefined; }'.
src/components/layout/NavigationTabs.tsx(38,18): error TS2339: Property 'style' does not exist on type 'never'.
src/components/layout/NavigationTabs.tsx(40,18): error TS2339: Property 'style' does not exist on type 'never'.
src/components/layout/NavigationTabs.tsx(45,19): error TS2339: Property 'style' does not exist on type 'never'.
src/components/layout/NavigationTabs.tsx(47,19): error TS2339: Property 'style' does not exist on type 'never'.
src/components/layout/NavigationTabs.tsx(55,16): error TS2339: Property 'addEventListener' does not exist on type 'never'.
src/components/layout/NavigationTabs.tsx(61,18): error TS2339: Property 'removeEventListener' does not exist on type 'never'.
src/components/layout/SummaryCards.tsx(4,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/layout/SummaryCards.tsx(33,35): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/SummaryCards.tsx(34,6): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/layout/SummaryCards.tsx(157,13): error TS2322: Type 'boolean | undefined' is not assignable to type 'boolean'.
  Type 'undefined' is not assignable to type 'boolean'.
src/components/layout/SummaryCards.tsx(158,13): error TS2322: Type 'boolean | undefined' is not assignable to type 'boolean'.
  Type 'undefined' is not assignable to type 'boolean'.
src/components/layout/ViewRenderer.tsx(248,9): error TS2322: Type 'Record<string, unknown>[]' is not assignable to type 'never[]'.
  Type 'Record<string, unknown>' is not assignable to type 'never'.
src/components/layout/ViewRenderer.tsx(269,9): error TS2322: Type 'Envelope[]' is not assignable to type 'never[]'.
  Type 'Envelope' is not assignable to type 'never'.
src/components/layout/ViewRenderer.tsx(270,9): error TS2322: Type 'PaycheckHistory[]' is not assignable to type 'never[]'.
  Type 'PaycheckHistory' is not assignable to type 'never'.
src/components/layout/ViewRenderer.tsx(280,9): error TS2322: Type 'Transaction[]' is not assignable to type 'never[]'.
  Type 'Transaction' is not assignable to type 'never'.
src/components/layout/ViewRenderer.tsx(281,9): error TS2322: Type 'Envelope[]' is not assignable to type 'never[]'.
  Type 'Envelope' is not assignable to type 'never'.
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
src/components/modals/QuickFundForm.tsx(4,26): error TS7031: Binding element 'envelope' implicitly has an 'any' type.
src/components/modals/QuickFundForm.tsx(4,36): error TS7031: Binding element 'amount' implicitly has an 'any' type.
src/components/modals/QuickFundForm.tsx(4,44): error TS7031: Binding element 'setAmount' implicitly has an 'any' type.
src/components/modals/QuickFundForm.tsx(4,55): error TS7031: Binding element 'unassignedCash' implicitly has an 'any' type.
src/components/modals/QuickFundForm.tsx(4,71): error TS7031: Binding element 'onConfirm' implicitly has an 'any' type.
src/components/modals/QuickFundForm.tsx(4,82): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/modals/QuickFundForm.tsx(5,31): error TS7006: Parameter 'quickAmount' implicitly has an 'any' type.
src/components/modals/QuickFundModal.tsx(13,3): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/modals/QuickFundModal.tsx(14,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/modals/QuickFundModal.tsx(15,3): error TS7031: Binding element 'onConfirm' implicitly has an 'any' type.
src/components/modals/QuickFundModal.tsx(16,3): error TS7031: Binding element 'envelope' implicitly has an 'any' type.
src/components/modals/QuickFundModal.tsx(17,3): error TS7031: Binding element 'suggestedAmount' implicitly has an 'any' type.
src/components/modals/QuickFundModal.tsx(18,3): error TS7031: Binding element 'unassignedCash' implicitly has an 'any' type.
src/components/modals/UnassignedCashModal.tsx(4,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/modals/UnassignedCashModal.tsx(264,35): error TS2532: Object is possibly 'undefined'.
src/components/modals/UnassignedCashModal.tsx(304,37): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/modals/UnassignedCashModal.tsx(304,53): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/modals/UnassignedCashModal.tsx(305,36): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/modals/UnassignedCashModal.tsx(305,52): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/modals/UnassignedCashModal.tsx(337,7): error TS2322: Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'RefObject<HTMLDivElement>'.
  Type 'HTMLDivElement | null' is not assignable to type 'HTMLDivElement'.
    Type 'null' is not assignable to type 'HTMLDivElement'.
src/components/monitoring/HighlightLoader.tsx(22,63): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/onboarding/EmptyStateHints.tsx(228,46): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
src/components/onboarding/EmptyStateHints.tsx(258,37): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
src/components/onboarding/components/TutorialOverlay.tsx(10,3): error TS7031: Binding element 'currentStepElement' implicitly has an 'any' type.
src/components/onboarding/components/TutorialOverlay.tsx(11,3): error TS7031: Binding element 'step' implicitly has an 'any' type.
src/components/onboarding/components/TutorialOverlay.tsx(12,3): error TS7031: Binding element 'currentStep' implicitly has an 'any' type.
src/components/onboarding/components/TutorialOverlay.tsx(13,3): error TS7031: Binding element 'tutorialStepsLength' implicitly has an 'any' type.
src/components/onboarding/components/TutorialOverlay.tsx(14,3): error TS7031: Binding element 'tooltipPosition' implicitly has an 'any' type.
src/components/onboarding/components/TutorialOverlay.tsx(15,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/onboarding/components/TutorialOverlay.tsx(16,3): error TS7031: Binding element 'onNext' implicitly has an 'any' type.
src/components/onboarding/components/TutorialOverlay.tsx(17,3): error TS7031: Binding element 'onPrev' implicitly has an 'any' type.
src/components/onboarding/components/TutorialOverlay.tsx(18,3): error TS7031: Binding element 'onSkip' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialControls.ts(10,3): error TS7006: Parameter 'tutorialSteps' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialControls.ts(11,3): error TS7006: Parameter 'currentStep' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialControls.ts(12,3): error TS7006: Parameter 'setCurrentStep' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialControls.ts(13,3): error TS7006: Parameter 'setShowTutorial' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialHighlight.ts(8,41): error TS7006: Parameter 'element' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialHighlight.ts(35,40): error TS7006: Parameter 'element' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialHighlight.ts(45,31): error TS7006: Parameter 'shouldHighlight' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialHighlight.ts(45,48): error TS7006: Parameter 'element' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialPositioning.ts(8,43): error TS7006: Parameter 'element' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialPositioning.ts(8,52): error TS7006: Parameter 'step' implicitly has an 'any' type.
src/components/onboarding/hooks/useTutorialSteps.ts(128,6): error TS7006: Parameter 'currentStep' implicitly has an 'any' type.
src/components/pages/MainDashboard.tsx(81,38): error TS7006: Parameter 'newBalance' implicitly has an 'any' type.
src/components/pages/MainDashboard.tsx(158,9): error TS2322: Type 'Transaction[]' is not assignable to type 'never[]'.
  Type 'Transaction' is not assignable to type 'never'.
src/components/pages/MainDashboard.tsx(159,9): error TS2322: Type '() => EnvelopeOption[]' is not assignable to type '() => never[]'.
  Type 'EnvelopeOption[]' is not assignable to type 'never[]'.
    Type 'EnvelopeOption' is not assignable to type 'never'.
src/components/pages/MainDashboard.tsx(169,9): error TS2322: Type '() => EnvelopeOption[]' is not assignable to type '() => never[]'.
  Type 'EnvelopeOption[]' is not assignable to type 'never[]'.
    Type 'EnvelopeOption' is not assignable to type 'never'.
src/components/pwa/InstallPromptModal.tsx(4,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/pwa/InstallPromptModal.tsx(13,29): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/InstallPromptModal.tsx(13,41): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/pwa/InstallPromptModal.tsx(14,32): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/InstallPromptModal.tsx(14,44): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/pwa/InstallPromptModal.tsx(15,22): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/InstallPromptModal.tsx(15,34): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/pwa/OfflineStatusIndicator.tsx(4,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/pwa/OfflineStatusIndicator.tsx(34,20): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/OfflineStatusIndicator.tsx(34,32): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/pwa/OfflineStatusIndicator.tsx(55,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/pwa/PatchNotesModal.tsx(6,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/pwa/PatchNotesModal.tsx(89,26): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/PatchNotesModal.tsx(89,38): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/pwa/PatchNotesModal.tsx(90,26): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/PatchNotesModal.tsx(90,38): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/pwa/PatchNotesModal.tsx(91,29): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/PatchNotesModal.tsx(91,41): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/pwa/PatchNotesModal.tsx(92,31): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/pwa/PatchNotesModal.tsx(92,43): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/pwa/PatchNotesModal.tsx(123,52): error TS18047: 'patchNotesData' is possibly 'null'.
src/components/pwa/PatchNotesModal.tsx(171,16): error TS18047: 'patchNotesData' is possibly 'null'.
src/components/pwa/PatchNotesModal.tsx(175,12): error TS18047: 'patchNotesData' is possibly 'null'.
src/components/pwa/PatchNotesModal.tsx(176,69): error TS18047: 'patchNotesData' is possibly 'null'.
src/components/pwa/PatchNotesModal.tsx(211,10): error TS18047: 'patchNotesData' is possibly 'null'.
src/components/pwa/PatchNotesModal.tsx(211,37): error TS18047: 'patchNotesData' is possibly 'null'.
src/components/pwa/PatchNotesModal.tsx(218,59): error TS18047: 'patchNotesData' is possibly 'null'.
src/components/pwa/PatchNotesModal.tsx(219,46): error TS18047: 'patchNotesData' is possibly 'null'.
src/components/pwa/PatchNotesModal.tsx(226,10): error TS18047: 'patchNotesData' is possibly 'null'.
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
src/components/receipts/ReceiptButton.tsx(13,26): error TS7031: Binding element 'onTransactionCreated' implicitly has an 'any' type.
src/components/receipts/ReceiptButton.tsx(26,47): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/receipts/ReceiptButton.tsx(35,35): error TS7006: Parameter 'processedReceipt' implicitly has an 'any' type.
src/components/receipts/ReceiptButton.tsx(41,38): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/components/receipts/ReceiptButton.tsx(41,51): error TS7006: Parameter 'receipt' implicitly has an 'any' type.
src/components/receipts/ReceiptScanner.tsx(21,27): error TS7031: Binding element 'onReceiptProcessed' implicitly has an 'any' type.
src/components/receipts/ReceiptScanner.tsx(21,47): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(13,24): error TS7031: Binding element 'step' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(13,30): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(34,24): error TS7031: Binding element 'currentStep' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(64,24): error TS7031: Binding element 'step' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(64,30): error TS7031: Binding element 'isSubmitting' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(64,44): error TS7031: Binding element 'canProceed' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(64,56): error TS7031: Binding element 'onBack' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(64,64): error TS7031: Binding element 'onNext' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(64,72): error TS7031: Binding element 'onSubmit' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(64,82): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(97,38): error TS7031: Binding element 'receiptData' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(97,51): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/receipts/ReceiptToTransactionModal.tsx(97,60): error TS7031: Binding element 'onComplete' implicitly has an 'any' type.
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
src/components/receipts/components/ReceiptErrorState.tsx(9,30): error TS7031: Binding element 'error' implicitly has an 'any' type.
src/components/receipts/components/ReceiptErrorState.tsx(9,37): error TS7031: Binding element 'onRetry' implicitly has an 'any' type.
src/components/receipts/components/ReceiptExtractedData.tsx(11,33): error TS7031: Binding element 'extractedData' implicitly has an 'any' type.
src/components/receipts/components/ReceiptExtractedData.tsx(14,27): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/components/receipts/components/ReceiptImagePreview.tsx(10,32): error TS7031: Binding element 'uploadedImage' implicitly has an 'any' type.
src/components/receipts/components/ReceiptImagePreview.tsx(10,47): error TS7031: Binding element 'showImagePreview' implicitly has an 'any' type.
src/components/receipts/components/ReceiptImagePreview.tsx(10,65): error TS7031: Binding element 'onTogglePreview' implicitly has an 'any' type.
src/components/receipts/components/ReceiptScannerHeader.tsx(9,33): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/receipts/components/ReceiptUploadArea.tsx(10,3): error TS7031: Binding element 'onDrop' implicitly has an 'any' type.
src/components/receipts/components/ReceiptUploadArea.tsx(11,3): error TS7031: Binding element 'onDragOver' implicitly has an 'any' type.
src/components/receipts/components/ReceiptUploadArea.tsx(12,3): error TS7031: Binding element 'fileInputRef' implicitly has an 'any' type.
src/components/receipts/components/ReceiptUploadArea.tsx(13,3): error TS7031: Binding element 'cameraInputRef' implicitly has an 'any' type.
src/components/receipts/components/ReceiptUploadArea.tsx(14,3): error TS7031: Binding element 'onFileInputChange' implicitly has an 'any' type.
src/components/receipts/steps/ConfirmationStep.tsx(10,35): error TS7031: Binding element 'transactionForm' implicitly has an 'any' type.
src/components/receipts/steps/ConfirmationStep.tsx(56,35): error TS7031: Binding element 'selectedEnvelope' implicitly has an 'any' type.
src/components/receipts/steps/ConfirmationStep.tsx(56,53): error TS7031: Binding element 'transactionForm' implicitly has an 'any' type.
src/components/receipts/steps/ConfirmationStep.tsx(95,35): error TS7031: Binding element 'receiptData' implicitly has an 'any' type.
src/components/receipts/steps/ConfirmationStep.tsx(131,33): error TS7031: Binding element 'receiptData' implicitly has an 'any' type.
src/components/receipts/steps/ConfirmationStep.tsx(131,46): error TS7031: Binding element 'transactionForm' implicitly has an 'any' type.
src/components/receipts/steps/ConfirmationStep.tsx(150,29): error TS7031: Binding element 'receiptData' implicitly has an 'any' type.
src/components/receipts/steps/ConfirmationStep.tsx(150,42): error TS7031: Binding element 'transactionForm' implicitly has an 'any' type.
src/components/receipts/steps/ConfirmationStep.tsx(150,59): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/receipts/steps/ConfirmationStep.tsx(151,44): error TS7006: Parameter 'env' implicitly has an 'any' type.
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
src/components/savings/SavingsGoalCard.tsx(6,28): error TS7031: Binding element 'goal' implicitly has an 'any' type.
src/components/savings/SavingsGoalCard.tsx(6,34): error TS7031: Binding element 'onEdit' implicitly has an 'any' type.
src/components/savings/SavingsGoalCard.tsx(6,42): error TS7031: Binding element 'onDelete' implicitly has an 'any' type.
src/components/savings/SavingsGoalCard.tsx(6,52): error TS7031: Binding element 'priorities' implicitly has an 'any' type.
src/components/savings/SavingsGoalCard.tsx(7,34): error TS7006: Parameter 'current' implicitly has an 'any' type.
src/components/savings/SavingsGoalCard.tsx(7,43): error TS7006: Parameter 'target' implicitly has an 'any' type.
src/components/savings/SavingsGoalCard.tsx(11,29): error TS7006: Parameter 'targetDate' implicitly has an 'any' type.
src/components/savings/SavingsGoalCard.tsx(32,37): error TS7006: Parameter 'p' implicitly has an 'any' type.
src/components/savings/SavingsGoalCard.tsx(34,34): error TS7006: Parameter 'status' implicitly has an 'any' type.
src/components/savings/SavingsGoals.tsx(17,3): error TS7031: Binding element 'onAddGoal' implicitly has an 'any' type.
src/components/savings/SavingsGoals.tsx(18,3): error TS7031: Binding element 'onUpdateGoal' implicitly has an 'any' type.
src/components/savings/SavingsGoals.tsx(19,3): error TS7031: Binding element 'onDeleteGoal' implicitly has an 'any' type.
src/components/savings/SavingsGoals.tsx(20,3): error TS7031: Binding element 'onDistributeToGoals' implicitly has an 'any' type.
src/components/savings/SavingsGoals.tsx(125,27): error TS2339: Property 'id' does not exist on type 'never'.
src/components/savings/SavingsGoals.tsx(140,9): error TS2322: Type '(goalData: any, goalId?: null) => Promise<void>' is not assignable to type '(goalData: Omit<Goal, "id">, goalId?: string | undefined) => void'.
  Types of parameters 'goalId' and 'goalId' are incompatible.
    Type 'string | undefined' is not assignable to type 'null | undefined'.
      Type 'string' is not assignable to type 'null | undefined'.
src/components/savings/SavingsSummaryCard.tsx(5,61): error TS7031: Binding element '_onAddGoal' implicitly has an 'any' type.
src/components/savings/SavingsSummaryCard.tsx(7,69): error TS2339: Property 'currentAmount' does not exist on type 'never'.
src/components/savings/SavingsSummaryCard.tsx(8,71): error TS2339: Property 'targetAmount' does not exist on type 'never'.
src/components/savings/SavingsSummaryCard.tsx(12,26): error TS2339: Property 'currentAmount' does not exist on type 'never'.
src/components/savings/SavingsSummaryCard.tsx(13,25): error TS2339: Property 'targetAmount' does not exist on type 'never'.
src/components/savings/SavingsSummaryCard.tsx(18,26): error TS2339: Property 'currentAmount' does not exist on type 'never'.
src/components/savings/SavingsSummaryCard.tsx(19,25): error TS2339: Property 'targetAmount' does not exist on type 'never'.
src/components/security/LocalDataSecurityWarning.tsx(12,37): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/security/LocalDataSecurityWarning.tsx(12,46): error TS7031: Binding element 'onAcknowledge' implicitly has an 'any' type.
src/components/security/LocalDataSecurityWarning.tsx(133,26): error TS7031: Binding element 'onAcknowledge' implicitly has an 'any' type.
src/components/security/LockScreen.tsx(58,9): error TS2353: Object literal may only specify known properties, and 'cancel' does not exist in type '(prevState: null) => null'.
src/components/security/LockScreen.tsx(126,9): error TS2353: Object literal may only specify known properties, and 'cancel' does not exist in type '(prevState: null) => null'.
src/components/security/LockScreen.tsx(156,7): error TS2322: Type '{ isValid: boolean; reason?: string | undefined; isCorrupted?: boolean | undefined; } | { isValid: boolean; reason: string; error: any; }' is not assignable to type 'null'.
  Type '{ isValid: boolean; reason?: string | undefined; isCorrupted?: boolean | undefined; }' is not assignable to type 'null'.
src/components/security/LockScreen.tsx(161,26): error TS2339: Property 'cancel' does not exist on type 'never'.
src/components/security/LockScreen.tsx(204,35): error TS2339: Property 'focus' does not exist on type 'never'.
src/components/security/LockScreen.tsx(217,31): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/security/LockScreen.tsx(232,27): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/settings/EnvelopeIntegrityChecker.tsx(17,37): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/settings/EnvelopeIntegrityChecker.tsx(17,45): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/settings/SettingsDashboard.tsx(121,5): error TS2322: Type '(profile: { userName: string; userColor: string; }) => void' is not assignable to type '(profile: unknown) => void'.
  Types of parameters 'profile' and 'profile' are incompatible.
    Type 'unknown' is not assignable to type '{ userName: string; userColor: string; }'.
src/components/settings/SettingsDashboard.tsx(162,13): error TS2322: Type '(password: string) => void' is not assignable to type '(current: string, newPass: string) => Promise<AuthResult>'.
  Type 'void' is not assignable to type 'Promise<AuthResult>'.
src/components/settings/SettingsDashboard.tsx(167,9): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/settings/archiving/ArchivingActionButtons.tsx(6,3): error TS7031: Binding element 'needsArchiving' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingActionButtons.tsx(7,3): error TS7031: Binding element 'isArchiving' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingActionButtons.tsx(8,3): error TS7031: Binding element 'showPreview' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingActionButtons.tsx(9,3): error TS7031: Binding element 'confirmArchiving' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingActionButtons.tsx(10,3): error TS7031: Binding element 'handlePreview' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingActionButtons.tsx(11,3): error TS7031: Binding element 'toggleConfirmArchiving' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingActionButtons.tsx(12,3): error TS7031: Binding element 'onArchiveClick' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingConfiguration.tsx(7,3): error TS7031: Binding element 'selectedPeriod' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingConfiguration.tsx(8,3): error TS7031: Binding element 'isArchiving' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingConfiguration.tsx(9,3): error TS7031: Binding element 'showAdvancedOptions' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingConfiguration.tsx(10,3): error TS7031: Binding element 'handlePeriodChange' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingConfiguration.tsx(11,3): error TS7031: Binding element 'toggleAdvancedOptions' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingHeader.tsx(5,28): error TS7031: Binding element 'onRefresh' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingHeader.tsx(5,39): error TS7031: Binding element 'isLoading' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingPreviewResults.tsx(5,36): error TS7031: Binding element 'showPreview' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingPreviewResults.tsx(5,49): error TS7031: Binding element 'previewData' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingPreviewResults.tsx(5,62): error TS7031: Binding element 'onClosePreview' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingProgress.tsx(4,30): error TS7031: Binding element 'isArchiving' implicitly has an 'any' type.
src/components/settings/archiving/ArchivingProgress.tsx(4,43): error TS7031: Binding element 'archivingProgress' implicitly has an 'any' type.
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
src/components/settings/sections/AutoLockSettingsSection.tsx(8,25): error TS7031: Binding element 'enabled' implicitly has an 'any' type.
src/components/settings/sections/AutoLockSettingsSection.tsx(8,34): error TS7031: Binding element 'onChange' implicitly has an 'any' type.
src/components/settings/sections/AutoLockSettingsSection.tsx(8,44): error TS7031: Binding element 'label' implicitly has an 'any' type.
src/components/settings/sections/AutoLockSettingsSection.tsx(8,51): error TS7031: Binding element 'description' implicitly has an 'any' type.
src/components/settings/sections/AutoLockSettingsSection.tsx(33,36): error TS7031: Binding element 'securitySettings' implicitly has an 'any' type.
src/components/settings/sections/AutoLockSettingsSection.tsx(33,54): error TS7031: Binding element 'handleSettingChange' implicitly has an 'any' type.
src/components/settings/sections/ClipboardSecuritySection.tsx(8,37): error TS7031: Binding element 'securitySettings' implicitly has an 'any' type.
src/components/settings/sections/ClipboardSecuritySection.tsx(8,55): error TS7031: Binding element 'handleSettingChange' implicitly has an 'any' type.
src/components/settings/sections/DevToolsSection.tsx(17,28): error TS7031: Binding element 'onOpenEnvelopeChecker' implicitly has an 'any' type.
src/components/settings/sections/DevToolsSection.tsx(17,51): error TS7031: Binding element 'onCreateTestHistory' implicitly has an 'any' type.
src/components/settings/sections/GeneralSettingsSection.tsx(4,8): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/settings/sections/GeneralSettingsSection.tsx(270,3): error TS7031: Binding element 'isLocalOnlyMode' implicitly has an 'any' type.
src/components/settings/sections/GeneralSettingsSection.tsx(271,3): error TS7031: Binding element 'cloudSyncEnabled' implicitly has an 'any' type.
src/components/settings/sections/GeneralSettingsSection.tsx(272,3): error TS7031: Binding element 'isSyncing' implicitly has an 'any' type.
src/components/settings/sections/GeneralSettingsSection.tsx(273,3): error TS7031: Binding element 'onOpenLocalOnlySettings' implicitly has an 'any' type.
src/components/settings/sections/GeneralSettingsSection.tsx(274,3): error TS7031: Binding element 'onToggleCloudSync' implicitly has an 'any' type.
src/components/settings/sections/GeneralSettingsSection.tsx(275,3): error TS7031: Binding element 'onManualSync' implicitly has an 'any' type.
src/components/settings/sections/GeneralSettingsSection.tsx(277,25): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/components/settings/sections/GeneralSettingsSection.tsx(277,37): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/settings/sections/GeneralSettingsSection.tsx(294,44): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ already_installed: string; not_available: string; declined: string; }'.
src/components/settings/sections/SecurityLoggingSection.tsx(10,3): error TS7031: Binding element 'securitySettings' implicitly has an 'any' type.
src/components/settings/sections/SecurityLoggingSection.tsx(11,3): error TS7031: Binding element 'securityEvents' implicitly has an 'any' type.
src/components/settings/sections/SecurityLoggingSection.tsx(12,3): error TS7031: Binding element 'showEvents' implicitly has an 'any' type.
src/components/settings/sections/SecurityLoggingSection.tsx(13,3): error TS7031: Binding element 'handleSettingChange' implicitly has an 'any' type.
src/components/settings/sections/SecurityLoggingSection.tsx(14,3): error TS7031: Binding element 'toggleEventsDisplay' implicitly has an 'any' type.
src/components/settings/sections/SecurityLoggingSection.tsx(15,3): error TS7031: Binding element 'exportSecurityEvents' implicitly has an 'any' type.
src/components/settings/sections/SecurityLoggingSection.tsx(16,3): error TS7031: Binding element 'showClearConfirmDialog' implicitly has an 'any' type.
src/components/settings/sections/SecurityLoggingSection.tsx(19,32): error TS7031: Binding element 'event' implicitly has an 'any' type.
src/components/settings/sections/SecurityLoggingSection.tsx(20,32): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/settings/sections/SecurityLoggingSection.tsx(148,41): error TS7006: Parameter 'event' implicitly has an 'any' type.
src/components/settings/sections/SecuritySettingsSection.tsx(6,3): error TS7031: Binding element 'securityManager' implicitly has an 'any' type.
src/components/settings/sections/SecuritySettingsSection.tsx(7,3): error TS7031: Binding element 'onOpenSecuritySettings' implicitly has an 'any' type.
src/components/settings/sections/SecuritySettingsSection.tsx(8,3): error TS7031: Binding element 'onShowLocalDataSecurity' implicitly has an 'any' type.
src/components/settings/sections/SecurityStatusSection.tsx(9,3): error TS7031: Binding element 'isLocked' implicitly has an 'any' type.
src/components/settings/sections/SecurityStatusSection.tsx(10,3): error TS7031: Binding element 'securitySettings' implicitly has an 'any' type.
src/components/settings/sections/SecurityStatusSection.tsx(11,3): error TS7031: Binding element 'securityEvents' implicitly has an 'any' type.
src/components/settings/sections/SecurityStatusSection.tsx(12,3): error TS7031: Binding element 'timeUntilAutoLock' implicitly has an 'any' type.
src/components/settings/sections/SyncDebugToolsSection.tsx(7,34): error TS7031: Binding element 'isDebugMode' implicitly has an 'any' type.
src/components/settings/sections/SyncDebugToolsSection.tsx(41,36): error TS2722: Cannot invoke an object which is possibly 'undefined'.
src/components/settings/sections/SyncDebugToolsSection.tsx(41,36): error TS18048: 'window.getQuickSyncStatus' is possibly 'undefined'.
src/components/settings/sections/SyncDebugToolsSection.tsx(65,40): error TS2722: Cannot invoke an object which is possibly 'undefined'.
src/components/settings/sections/SyncDebugToolsSection.tsx(65,40): error TS18048: 'window.runMasterSyncValidation' is possibly 'undefined'.
src/components/settings/sections/SyncDebugToolsSection.tsx(171,42): error TS2722: Cannot invoke an object which is possibly 'undefined'.
src/components/settings/sections/SyncDebugToolsSection.tsx(171,42): error TS18048: 'window.forceCloudDataReset' is possibly 'undefined'.
src/components/sharing/JoinBudgetModal.tsx(17,28): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/sharing/JoinBudgetModal.tsx(17,36): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/sharing/JoinBudgetModal.tsx(17,45): error TS7031: Binding element 'onJoinSuccess' implicitly has an 'any' type.
src/components/sharing/ShareCodeModal.tsx(17,27): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/sharing/ShareCodeModal.tsx(17,35): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/sharing/ShareCodeModal.tsx(45,67): error TS2345: Argument of type 'UserData' is not assignable to parameter of type 'null | undefined'.
src/components/sharing/ShareCodeModal.tsx(54,22): error TS2345: Argument of type '{ shareCode: any; qrData: string; shareUrl: string; expiresAt: number; }' is not assignable to parameter of type 'SetStateAction<null>'.
  Type '{ shareCode: any; qrData: string; shareUrl: string; expiresAt: number; }' provides no match for the signature '(prevState: null): null'.
src/components/sharing/ShareCodeModal.tsx(84,65): error TS2345: Argument of type 'UserData' is not assignable to parameter of type 'null | undefined'.
src/components/sharing/ShareCodeModal.tsx(93,20): error TS2345: Argument of type '{ shareCode: any; qrData: string; shareUrl: string; expiresAt: number; }' is not assignable to parameter of type 'SetStateAction<null>'.
  Type '{ shareCode: any; qrData: string; shareUrl: string; expiresAt: number; }' provides no match for the signature '(prevState: null): null'.
src/components/sharing/ShareCodeModal.tsx(124,21): error TS2339: Property 'shareCode' does not exist on type 'never'.
src/components/sharing/ShareCodeModal.tsx(127,53): error TS2339: Property 'shareCode' does not exist on type 'never'.
src/components/sharing/ShareCodeModal.tsx(132,50): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/sharing/ShareCodeModal.tsx(138,21): error TS2339: Property 'shareUrl' does not exist on type 'never'.
src/components/sharing/ShareCodeModal.tsx(141,53): error TS2339: Property 'shareUrl' does not exist on type 'never'.
src/components/sharing/ShareCodeModal.tsx(144,54): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/sharing/ShareCodeModal.tsx(197,38): error TS2339: Property 'qrData' does not exist on type 'never'.
src/components/sharing/ShareCodeModal.tsx(218,38): error TS2339: Property 'shareCode' does not exist on type 'never'.
src/components/sharing/ShareCodeModal.tsx(243,38): error TS2339: Property 'shareUrl' does not exist on type 'never'.
src/components/sharing/steps/ShareCodeStep.tsx(8,26): error TS7031: Binding element 'shareCode' implicitly has an 'any' type.
src/components/sharing/steps/ShareCodeStep.tsx(8,37): error TS7031: Binding element 'setShareCode' implicitly has an 'any' type.
src/components/sharing/steps/ShareCodeStep.tsx(8,51): error TS7031: Binding element 'onValidate' implicitly has an 'any' type.
src/components/sharing/steps/ShareCodeStep.tsx(8,63): error TS7031: Binding element 'onQRScan' implicitly has an 'any' type.
src/components/sharing/steps/ShareCodeStep.tsx(8,73): error TS7031: Binding element 'isValidating' implicitly has an 'any' type.
src/components/sharing/steps/ShareCodeStep.tsx(9,25): error TS7006: Parameter 'e' implicitly has an 'any' type.
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
src/components/sync/health/SyncHealthDetails.tsx(43,3): error TS7031: Binding element 'syncStatus' implicitly has an 'any' type.
src/components/sync/health/SyncHealthDetails.tsx(44,3): error TS7031: Binding element 'isBackgroundSyncing' implicitly has an 'any' type.
src/components/sync/health/SyncHealthDetails.tsx(45,3): error TS7031: Binding element 'isRecovering' implicitly has an 'any' type.
src/components/sync/health/SyncHealthDetails.tsx(46,3): error TS7031: Binding element 'recoveryResult' implicitly has an 'any' type.
src/components/sync/health/SyncHealthDetails.tsx(47,3): error TS7031: Binding element 'onRefresh' implicitly has an 'any' type.
src/components/sync/health/SyncHealthDetails.tsx(48,3): error TS7031: Binding element 'onRunValidation' implicitly has an 'any' type.
src/components/sync/health/SyncHealthDetails.tsx(49,3): error TS7031: Binding element 'onResetData' implicitly has an 'any' type.
src/components/sync/health/SyncHealthDetails.tsx(137,13): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/sync/health/SyncStatusIndicator.tsx(27,32): error TS7031: Binding element 'syncStatus' implicitly has an 'any' type.
src/components/sync/health/SyncStatusIndicator.tsx(27,44): error TS7031: Binding element 'isBackgroundSyncing' implicitly has an 'any' type.
src/components/sync/health/SyncStatusIndicator.tsx(27,65): error TS7031: Binding element 'onClick' implicitly has an 'any' type.
src/components/sync/health/SyncStatusIndicator.tsx(27,74): error TS7031: Binding element 'showDetails' implicitly has an 'any' type.
src/components/transactions/TransactionFilters.tsx(7,3): error TS7031: Binding element 'searchTerm' implicitly has an 'any' type.
src/components/transactions/TransactionFilters.tsx(8,3): error TS7031: Binding element 'setSearchTerm' implicitly has an 'any' type.
src/components/transactions/TransactionFilters.tsx(9,3): error TS7031: Binding element 'dateFilter' implicitly has an 'any' type.
src/components/transactions/TransactionFilters.tsx(10,3): error TS7031: Binding element 'setDateFilter' implicitly has an 'any' type.
src/components/transactions/TransactionFilters.tsx(11,3): error TS7031: Binding element 'typeFilter' implicitly has an 'any' type.
src/components/transactions/TransactionFilters.tsx(12,3): error TS7031: Binding element 'setTypeFilter' implicitly has an 'any' type.
src/components/transactions/TransactionFilters.tsx(13,3): error TS7031: Binding element 'envelopeFilter' implicitly has an 'any' type.
src/components/transactions/TransactionFilters.tsx(14,3): error TS7031: Binding element 'setEnvelopeFilter' implicitly has an 'any' type.
src/components/transactions/TransactionFilters.tsx(15,3): error TS7031: Binding element 'sortBy' implicitly has an 'any' type.
src/components/transactions/TransactionFilters.tsx(16,3): error TS7031: Binding element 'setSortBy' implicitly has an 'any' type.
src/components/transactions/TransactionFilters.tsx(17,3): error TS7031: Binding element 'sortOrder' implicitly has an 'any' type.
src/components/transactions/TransactionFilters.tsx(18,3): error TS7031: Binding element 'setSortOrder' implicitly has an 'any' type.
src/components/transactions/TransactionFilters.tsx(115,39): error TS2339: Property 'id' does not exist on type 'never'.
src/components/transactions/TransactionFilters.tsx(115,59): error TS2339: Property 'id' does not exist on type 'never'.
src/components/transactions/TransactionFilters.tsx(116,29): error TS2339: Property 'name' does not exist on type 'never'.
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
src/components/transactions/TransactionSplitter.tsx(105,19): error TS2322: Type 'string[]' is not assignable to type 'never[]'.
  Type 'string' is not assignable to type 'never'.
src/components/transactions/TransactionSplitter.tsx(126,13): error TS2322: Type 'string[]' is not assignable to type 'never[]'.
  Type 'string' is not assignable to type 'never'.
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
src/components/transactions/components/TransactionRow.tsx(16,3): error TS7031: Binding element 'transaction' implicitly has an 'any' type.
src/components/transactions/components/TransactionRow.tsx(17,3): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/transactions/components/TransactionRow.tsx(18,3): error TS7031: Binding element 'virtualRow' implicitly has an 'any' type.
src/components/transactions/components/TransactionRow.tsx(20,3): error TS7031: Binding element 'gridTemplate' implicitly has an 'any' type.
src/components/transactions/components/TransactionRow.tsx(21,3): error TS7031: Binding element 'onEdit' implicitly has an 'any' type.
src/components/transactions/components/TransactionRow.tsx(22,3): error TS7031: Binding element 'onSplit' implicitly has an 'any' type.
src/components/transactions/components/TransactionRow.tsx(23,3): error TS7031: Binding element 'onDeleteClick' implicitly has an 'any' type.
src/components/transactions/components/TransactionRow.tsx(24,3): error TS7031: Binding element 'onHistoryClick' implicitly has an 'any' type.
src/components/transactions/import/FieldMapper.tsx(4,24): error TS7031: Binding element 'importData' implicitly has an 'any' type.
src/components/transactions/import/FieldMapper.tsx(4,36): error TS7031: Binding element 'fieldMapping' implicitly has an 'any' type.
src/components/transactions/import/FieldMapper.tsx(4,50): error TS7031: Binding element 'setFieldMapping' implicitly has an 'any' type.
src/components/transactions/import/FieldMapper.tsx(4,67): error TS7031: Binding element 'onBack' implicitly has an 'any' type.
src/components/transactions/import/FieldMapper.tsx(4,75): error TS7031: Binding element 'onImport' implicitly has an 'any' type.
src/components/transactions/import/FieldMapper.tsx(67,69): error TS7006: Parameter 'row' implicitly has an 'any' type.
src/components/transactions/import/FieldMapper.tsx(67,74): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/transactions/import/ImportModal.tsx(8,3): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/transactions/import/ImportModal.tsx(9,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/transactions/import/ImportModal.tsx(10,3): error TS7031: Binding element 'importStep' implicitly has an 'any' type.
src/components/transactions/import/ImportModal.tsx(11,3): error TS7031: Binding element 'setImportStep' implicitly has an 'any' type.
src/components/transactions/import/ImportModal.tsx(12,3): error TS7031: Binding element 'importData' implicitly has an 'any' type.
src/components/transactions/import/ImportModal.tsx(13,3): error TS7031: Binding element 'setImportData' implicitly has an 'any' type.
src/components/transactions/import/ImportModal.tsx(14,3): error TS7031: Binding element 'fieldMapping' implicitly has an 'any' type.
src/components/transactions/import/ImportModal.tsx(15,3): error TS7031: Binding element 'setFieldMapping' implicitly has an 'any' type.
src/components/transactions/import/ImportModal.tsx(16,3): error TS7031: Binding element 'importProgress' implicitly has an 'any' type.
src/components/transactions/import/ImportModal.tsx(17,3): error TS7031: Binding element 'onImport' implicitly has an 'any' type.
src/components/transactions/import/ImportModal.tsx(18,3): error TS7031: Binding element 'onFileUpload' implicitly has an 'any' type.
src/components/transactions/import/ImportProgress.tsx(4,27): error TS7031: Binding element 'importData' implicitly has an 'any' type.
src/components/transactions/import/ImportProgress.tsx(4,39): error TS7031: Binding element 'importProgress' implicitly has an 'any' type.
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
src/components/transactions/splitter/SplitAllocationRow.tsx(7,3): error TS7031: Binding element 'split' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationRow.tsx(8,10): error TS7031: Binding element '_index' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationRow.tsx(9,3): error TS7031: Binding element 'canRemove' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationRow.tsx(10,3): error TS7031: Binding element 'onUpdate' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationRow.tsx(11,3): error TS7031: Binding element 'onRemove' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationRow.tsx(12,3): error TS7031: Binding element 'availableCategories' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationRow.tsx(13,3): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationRow.tsx(57,39): error TS7006: Parameter 'category' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationRow.tsx(74,28): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationsSection.tsx(7,3): error TS7031: Binding element 'splitAllocations' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationsSection.tsx(8,3): error TS7031: Binding element 'availableCategories' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationsSection.tsx(9,3): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationsSection.tsx(10,3): error TS7031: Binding element 'onUpdateSplit' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationsSection.tsx(11,3): error TS7031: Binding element 'onRemoveSplit' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationsSection.tsx(12,3): error TS7031: Binding element 'onAddSplit' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationsSection.tsx(13,3): error TS7031: Binding element 'onSmartSplit' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationsSection.tsx(14,3): error TS7031: Binding element 'onAutoBalance' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationsSection.tsx(15,3): error TS7031: Binding element 'canAutoBalance' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationsSection.tsx(84,32): error TS7006: Parameter 'split' implicitly has an 'any' type.
src/components/transactions/splitter/SplitAllocationsSection.tsx(84,39): error TS7006: Parameter 'index' implicitly has an 'any' type.
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
src/db/budgetDb.ts(133,29): error TS2769: No overload matches this call.
  Overload 1 of 4, '(target: {}, source: Record<string, unknown>): Record<string, unknown>', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type '{}'.
  Overload 2 of 4, '(target: object, ...sources: any[]): any', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'object'.
src/db/budgetDb.ts(186,23): error TS2345: Argument of type 'Table<Envelope, string, Envelope>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(187,23): error TS2345: Argument of type 'Table<Transaction, string, Transaction>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(188,23): error TS2345: Argument of type 'Table<Bill, string, Bill>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(189,23): error TS2345: Argument of type 'Table<SavingsGoal, string, SavingsGoal>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(190,23): error TS2345: Argument of type 'Table<PaycheckHistory, string, PaycheckHistory>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(191,23): error TS2345: Argument of type 'Table<Debt, string, Debt>' is not assignable to parameter of type 'Table<unknown, unknown, unknown>'.
  Types of property 'hook' are incompatible.
    Types of parameters 'subscriber' and 'subscriber' are incompatible.
      Type 'unknown' is not assignable to type 'string | void | undefined'.
src/db/budgetDb.ts(561,5): error TS2322: Type 'BudgetRecord | undefined' is not assignable to type 'BudgetRecord | null'.
  Type 'undefined' is not assignable to type 'BudgetRecord | null'.
src/db/budgetDb.ts(585,5): error TS2322: Type 'BudgetRecord | undefined' is not assignable to type 'BudgetRecord | null'.
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
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(3,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(11,31): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(35,33): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(35,38): error TS7006: Parameter 'pc' implicitly has an 'any' type.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(60,61): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(60,66): error TS7006: Parameter 'pc' implicitly has an 'any' type.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(61,62): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(61,67): error TS7006: Parameter 'pc' implicitly has an 'any' type.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(71,46): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(71,51): error TS7006: Parameter 'pc' implicitly has an 'any' type.
src/hooks/analytics/useAnalyticsExport.ts(8,44): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/hooks/analytics/useAnalyticsExport.ts(8,50): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/hooks/analytics/useAnalyticsIntegration.ts(129,36): error TS7006: Parameter 'newTimeFilter' implicitly has an 'any' type.
src/hooks/analytics/useBillAnalysis.ts(11,33): error TS7006: Parameter 'bills' implicitly has an 'any' type.
src/hooks/analytics/useBillAnalysis.ts(11,40): error TS7006: Parameter 'settings' implicitly has an 'any' type.
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
src/hooks/auth/mutations/useJoinBudgetMutation.ts(193,19): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(194,31): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(203,18): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string | null'.
  Type 'undefined' is not assignable to type 'string | null'.
src/hooks/auth/mutations/useLoginMutations.ts(52,13): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/auth/mutations/useLoginMutations.ts(53,25): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
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
src/hooks/auth/useAuthCompatibility.ts(29,19): error TS7006: Parameter 'password' implicitly has an 'any' type.
src/hooks/auth/useAuthCompatibility.ts(34,37): error TS7006: Parameter 'joinData' implicitly has an 'any' type.
src/hooks/auth/useAuthCompatibility.ts(43,18): error TS7006: Parameter 'updatedUser' implicitly has an 'any' type.
src/hooks/auth/useAuthCompatibility.ts(47,28): error TS7006: Parameter 'oldPassword' implicitly has an 'any' type.
src/hooks/auth/useAuthCompatibility.ts(47,41): error TS7006: Parameter 'newPassword' implicitly has an 'any' type.
src/hooks/auth/useAuthCompatibility.ts(52,27): error TS7006: Parameter 'updatedProfile' implicitly has an 'any' type.
src/hooks/auth/useAuthCompatibility.ts(57,23): error TS7006: Parameter '_timestamp' implicitly has an 'any' type.
src/hooks/auth/useAuthCompatibility.ts(61,30): error TS7006: Parameter 'password' implicitly has an 'any' type.
src/hooks/auth/useAuthCompatibility.ts(73,28): error TS7031: Binding element '_key' implicitly has an 'any' type.
src/hooks/auth/useAuthCompatibility.ts(73,40): error TS7031: Binding element '_salt' implicitly has an 'any' type.
src/hooks/auth/useAuthFlow.ts(29,12): error TS7006: Parameter 'userDataOrPassword' implicitly has an 'any' type.
src/hooks/auth/useAuthFlow.ts(50,58): error TS2345: Argument of type '(password: any, userData?: null) => Promise<any>' is not assignable to parameter of type 'LoginFunction'.
  Types of parameters 'userData' and 'userData' are incompatible.
    Type 'UserData | null' is not assignable to type 'null | undefined'.
      Type 'UserData' is not assignable to type 'null | undefined'.
src/hooks/auth/useAuthFlow.ts(54,67): error TS2345: Argument of type '(password: any, userData?: null) => Promise<any>' is not assignable to parameter of type 'LoginFunction'.
  Types of parameters 'userData' and 'userData' are incompatible.
    Type 'UserData | null' is not assignable to type 'null | undefined'.
      Type 'UserData' is not assignable to type 'null | undefined'.
src/hooks/auth/useAuthFlow.ts(58,61): error TS2345: Argument of type '(password: any, userData?: null) => Promise<any>' is not assignable to parameter of type 'LoginFunction'.
  Types of parameters 'userData' and 'userData' are incompatible.
    Type 'UserData | null' is not assignable to type 'null | undefined'.
      Type 'UserData' is not assignable to type 'null | undefined'.
src/hooks/auth/useAuthFlow.ts(63,13): error TS18046: 'error' is of type 'unknown'.
src/hooks/auth/useAuthFlow.ts(67,40): error TS18046: 'error' is of type 'unknown'.
src/hooks/auth/useAuthFlow.ts(78,12): error TS7006: Parameter 'oldPass' implicitly has an 'any' type.
src/hooks/auth/useAuthFlow.ts(78,21): error TS7006: Parameter 'newPass' implicitly has an 'any' type.
src/hooks/auth/useAuthFlow.ts(90,12): error TS7006: Parameter 'updatedProfile' implicitly has an 'any' type.
src/hooks/auth/useAuthManager.ts(95,31): error TS7006: Parameter 'password' implicitly has an 'any' type.
src/hooks/auth/useAuthenticationManager.ts(85,45): error TS2339: Property 'budgetId' does not exist on type 'never'.
src/hooks/auth/useAuthenticationManager.ts(86,39): error TS2339: Property 'budgetId' does not exist on type 'never'.
src/hooks/auth/useKeyManagement.ts(321,56): error TS2345: Argument of type '{ budgetId: string; importedSalt: Uint8Array<ArrayBufferLike>; }' is not assignable to parameter of type 'null | undefined'.
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
src/hooks/bills/useBillManagerHelpers.ts(260,55): error TS7006: Parameter 'updatedBill' implicitly has an 'any' type.
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
src/hooks/bills/useBillManagerUI.ts(19,25): error TS7006: Parameter 'id' implicitly has an 'any' type.
src/hooks/bills/useBillManagerUI.ts(19,29): error TS7006: Parameter 'label' implicitly has an 'any' type.
src/hooks/bills/useBillManagerUI.ts(19,36): error TS7006: Parameter 'count' implicitly has an 'any' type.
src/hooks/bills/useBillManagerUI.ts(19,43): error TS7006: Parameter 'icon' implicitly has an 'any' type.
src/hooks/bills/useBillManagerUI.ts(19,49): error TS7006: Parameter 'color' implicitly has an 'any' type.
src/hooks/bills/useBillManagerUI.ts(95,50): error TS2345: Argument of type '(bill: { id: string; }) => string' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => string'.
  Types of parameters 'bill' and 'value' are incompatible.
    Type 'unknown' is not assignable to type '{ id: string; }'.
src/hooks/bills/useBillOperations.ts(68,7): error TS2322: Type '(updatedBills: Bill[]) => Promise<BulkOperationResult>' is not assignable to type '(updatedBills: unknown[]) => Promise<{ success: boolean; successCount: number; errorCount: number; errors: string[]; message: string; }>'.
  Types of parameters 'updatedBills' and 'updatedBills' are incompatible.
    Type 'unknown[]' is not assignable to type 'Bill[]'.
      Type 'unknown' is not assignable to type 'Bill'.
src/hooks/bills/useBills/index.ts(43,5): error TS2783: 'upcomingBills' is specified more than once, so this usage will be overwritten.
src/hooks/bills/useBulkBillOperations.ts(31,39): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/hooks/bills/useSmartBillSuggestions.ts(8,41): error TS7006: Parameter 'bills' implicitly has an 'any' type.
src/hooks/bills/useSmartBillSuggestions.ts(8,48): error TS7006: Parameter 'envelopes' implicitly has an 'any' type.
src/hooks/bills/useSmartBillSuggestions.ts(8,59): error TS7006: Parameter 'searchQuery' implicitly has an 'any' type.
src/hooks/bills/useSmartBillSuggestions.ts(20,32): error TS7006: Parameter 'query' implicitly has an 'any' type.
src/hooks/bills/useSmartBillSuggestions.ts(22,11): error TS7034: Variable 'suggestions' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/hooks/bills/useSmartBillSuggestions.ts(25,24): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/hooks/bills/useSmartBillSuggestions.ts(37,20): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/hooks/bills/useSmartBillSuggestions.ts(39,50): error TS7006: Parameter 'env' implicitly has an 'any' type.
src/hooks/bills/useSmartBillSuggestions.ts(59,28): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/hooks/bills/useSmartBillSuggestions.ts(67,18): error TS7005: Variable 'suggestions' implicitly has an 'any[]' type.
src/hooks/bills/useSmartBillSuggestions.ts(81,24): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/hooks/bills/useSmartBillSuggestions.ts(86,10): error TS7006: Parameter 'word' implicitly has an 'any' type.
src/hooks/bills/useSmartBillSuggestions.ts(89,40): error TS7005: Variable 'suggestions' implicitly has an 'any[]' type.
src/hooks/bills/useSmartBillSuggestions.ts(101,31): error TS7005: Variable 'suggestions' implicitly has an 'any[]' type.
src/hooks/bills/useSmartBillSuggestions.ts(109,20): error TS2345: Argument of type 'any[]' is not assignable to parameter of type 'SetStateAction<never[]>'.
  Type 'any[]' is not assignable to type 'never[]'.
    Type 'any' is not assignable to type 'never'.
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
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(14,18): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(14,30): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(32,12): error TS7006: Parameter 'rules' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(61,28): error TS2345: Argument of type '{ id: string; trigger: string; executedAt: string; rulesExecuted: number; totalFunded: number; results: ({ ruleId: string; ruleName: string; success: boolean; error: string; amount: number; executedAt: string; transfers?: undefined; targetEnvelopes?: undefined; } | { ...; })[]; remainingCash: number; initialCash: nu...' is not assignable to parameter of type 'SetStateAction<null>'.
  Type 'undefined' is not assignable to type 'SetStateAction<null>'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(63,28): error TS18048: 'result.execution' is possibly 'undefined'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(64,26): error TS18048: 'result.execution' is possibly 'undefined'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(75,41): error TS18046: 'error' is of type 'unknown'.
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
src/hooks/budgeting/autofunding/useExecutionStatistics.ts(10,47): error TS7006: Parameter 'executionHistory' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useExecutionStatistics.ts(14,10): error TS7006: Parameter 'execution' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useExecutionStatistics.ts(17,10): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useExecutionStatistics.ts(17,15): error TS7006: Parameter 'execution' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useExecutionStatistics.ts(21,18): error TS7006: Parameter 'execution' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useExecutionStatistics.ts(22,18): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useExecutionStatistics.ts(22,23): error TS7006: Parameter 'execution' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useExecutionStatistics.ts(25,50): error TS7006: Parameter 'acc' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useExecutionStatistics.ts(25,55): error TS7006: Parameter 'execution' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useExecutionStatistics.ts(35,10): error TS7006: Parameter 'execution' implicitly has an 'any' type.
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
src/hooks/budgeting/useEnvelopeCalculations.ts(10,66): error TS2339: Property 'currentBalance' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeCalculations.ts(11,71): error TS2339: Property 'targetAmount' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeCalculations.ts(13,19): error TS2339: Property 'currentBalance' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeCalculations.ts(13,47): error TS2339: Property 'targetAmount' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeCalculations.ts(16,19): error TS2339: Property 'currentBalance' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeCalculations.ts(16,47): error TS2339: Property 'targetAmount' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeCalculations.ts(20,71): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeCalculations.ts(22,81): error TS2339: Property 'category' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeCalculations.ts(25,59): error TS2339: Property 'category' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeEdit.ts(15,3): error TS7031: Binding element 'onSave' implicitly has an 'any' type.
src/hooks/budgeting/useEnvelopeEdit.ts(16,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/hooks/budgeting/useEnvelopeEdit.ts(17,3): error TS7031: Binding element 'onDelete' implicitly has an 'any' type.
src/hooks/budgeting/useEnvelopeEdit.ts(46,41): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeEdit.ts(47,38): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeEdit.ts(61,29): error TS7006: Parameter 'envelopeData' implicitly has an 'any' type.
src/hooks/budgeting/useEnvelopeEdit.ts(83,20): error TS18047: 'envelope' is possibly 'null'.
src/hooks/budgeting/useEnvelopeForm.ts(20,3): error TS7031: Binding element 'onSave' implicitly has an 'any' type.
src/hooks/budgeting/useEnvelopeForm.ts(21,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/hooks/budgeting/useEnvelopeForm.ts(85,39): error TS7006: Parameter 'updates' implicitly has an 'any' type.
src/hooks/budgeting/useEnvelopeForm.ts(92,84): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeForm.ts(95,46): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeForm.ts(124,30): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeForm.ts(136,29): error TS18046: 'error' is of type 'unknown'.
src/hooks/budgeting/useEnvelopeForm.ts(141,27): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopeForm.ts(188,27): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopes.ts(17,54): error TS2345: Argument of type 'Envelope[]' is not assignable to parameter of type 'never[]'.
  Type 'Envelope' is not assignable to type 'never'.
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
src/hooks/budgeting/usePaycheckProcessor.ts(16,26): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckProcessor.ts(16,33): error TS7006: Parameter 'errors' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckProcessor.ts(16,41): error TS7006: Parameter 'setErrors' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckProcessor.ts(18,16): error TS7006: Parameter 'prevErrors' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckProcessor.ts(35,37): error TS7006: Parameter 'formData' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckProcessor.ts(35,47): error TS7006: Parameter 'currentAllocations' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckProcessor.ts(35,67): error TS7006: Parameter 'setErrors' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckProcessor.ts(56,3): error TS7031: Binding element 'onAddPaycheck' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckProcessor.ts(86,29): error TS2345: Argument of type 'AllocationResult' is not assignable to parameter of type 'SetStateAction<{ allocations: never[]; totalAllocated: number; remainingAmount: number; allocationRate: number; }>'.
  Type 'AllocationResult' is not assignable to type '{ allocations: never[]; totalAllocated: number; remainingAmount: number; allocationRate: number; }'.
    Types of property 'allocations' are incompatible.
      Type 'AllocationItem[]' is not assignable to type 'never[]'.
        Type 'AllocationItem' is not assignable to type 'never'.
src/hooks/budgeting/usePaycheckProcessor.ts(94,6): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckProcessor.ts(94,13): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckProcessor.ts(106,6): error TS7006: Parameter 'payerName' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckProcessor.ts(115,6): error TS7006: Parameter 'payerName' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckProcessor.ts(171,23): error TS2345: Argument of type '(prev: never[]) => string[]' is not assignable to parameter of type 'SetStateAction<never[]>'.
  Type '(prev: never[]) => string[]' is not assignable to type '(prevState: never[]) => never[]'.
    Type 'string[]' is not assignable to type 'never[]'.
      Type 'string' is not assignable to type 'never'.
src/hooks/budgeting/usePaycheckProcessor.ts(186,9): error TS18046: 'error' is of type 'unknown'.
src/hooks/budgeting/usePaydayPrediction.ts(11,30): error TS7006: Parameter 'paycheckHistory' implicitly has an 'any' type.
src/hooks/budgeting/usePaydayPrediction.ts(11,47): error TS7006: Parameter 'isUnlocked' implicitly has an 'any' type.
src/hooks/budgeting/useSmartSuggestions.ts(11,36): error TS7006: Parameter 'suggestion' implicitly has an 'any' type.
src/hooks/budgeting/useSmartSuggestions.ts(11,48): error TS7006: Parameter 'onCreateEnvelope' implicitly has an 'any' type.
src/hooks/budgeting/useSmartSuggestions.ts(19,34): error TS7006: Parameter 'suggestion' implicitly has an 'any' type.
src/hooks/budgeting/useSmartSuggestions.ts(19,46): error TS7006: Parameter 'onUpdateEnvelope' implicitly has an 'any' type.
src/hooks/budgeting/useSmartSuggestions.ts(19,64): error TS7006: Parameter 'actionType' implicitly has an 'any' type.
src/hooks/budgeting/useSmartSuggestions.ts(39,3): error TS7031: Binding element 'onCreateEnvelope' implicitly has an 'any' type.
src/hooks/budgeting/useSmartSuggestions.ts(40,3): error TS7031: Binding element 'onUpdateEnvelope' implicitly has an 'any' type.
src/hooks/budgeting/useSmartSuggestions.ts(41,3): error TS7031: Binding element 'onDismissSuggestion' implicitly has an 'any' type.
src/hooks/budgeting/useSmartSuggestions.ts(78,47): error TS7006: Parameter 'newSettings' implicitly has an 'any' type.
src/hooks/budgeting/useSmartSuggestions.ts(89,6): error TS7006: Parameter 'suggestionId' implicitly has an 'any' type.
src/hooks/budgeting/useSmartSuggestions.ts(100,12): error TS7006: Parameter 'suggestion' implicitly has an 'any' type.
src/hooks/budgeting/useSmartSuggestions.ts(125,11): error TS18046: 'error' is of type 'unknown'.
src/hooks/budgeting/useSmartSuggestions.ts(164,7): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/hooks/budgeting/useSmartSuggestions.ts(164,22): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
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
src/hooks/common/useActualBalance.ts(2,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/common/useActualBalance.ts(33,7): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/common/useActualBalance.ts(98,6): error TS7006: Parameter 'calculatedBalance' implicitly has an 'any' type.
src/hooks/common/useActualBalance.ts(112,6): error TS7006: Parameter 'newBalance' implicitly has an 'any' type.
src/hooks/common/useActualBalance.ts(149,45): error TS7006: Parameter 'inputValue' implicitly has an 'any' type.
src/hooks/common/useBugReport.ts(60,53): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/common/useConnectionManager/useConnectionConfig.ts(6,32): error TS7006: Parameter 'entityType' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(183,40): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(196,67): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(209,55): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/common/useDataInitialization.ts(2,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/common/useDataInitialization.ts(40,28): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/common/useDataInitialization.ts(40,44): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/hooks/common/useDataInitialization.ts(67,22): error TS18046: 'error' is of type 'unknown'.
src/hooks/common/useExportData.ts(22,26): error TS7006: Parameter 'exportableData' implicitly has an 'any' type.
src/hooks/common/useExportData.ts(41,27): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/hooks/common/useExportData.ts(41,33): error TS7006: Parameter 'pureTransactions' implicitly has an 'any' type.
src/hooks/common/useExportData.ts(41,51): error TS7006: Parameter 'fileSize' implicitly has an 'any' type.
src/hooks/common/useExportData.ts(60,29): error TS7006: Parameter 'counts' implicitly has an 'any' type.
src/hooks/common/useExportData.ts(106,40): error TS18046: 'error' is of type 'unknown'.
src/hooks/common/useFABActions.ts(44,11): error TS7034: Variable 'actionIds' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/hooks/common/useFABActions.ts(47,18): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/common/useFABActions.ts(49,31): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/common/useFABActions.ts(54,7): error TS7005: Variable 'actionIds' implicitly has an 'any[]' type.
src/hooks/common/useFABActions.ts(90,34): error TS7006: Parameter 'screenId' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(166,26): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'null | undefined'.
src/hooks/common/useModalManager.ts(11,34): error TS7006: Parameter 'modalName' implicitly has an 'any' type.
src/hooks/common/useModalManager.ts(15,35): error TS7006: Parameter 'modalName' implicitly has an 'any' type.
src/hooks/common/useModalManager.ts(19,36): error TS7006: Parameter 'modalName' implicitly has an 'any' type.
src/hooks/common/useModalManager.ts(20,51): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/common/useModalManager.ts(27,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/hooks/common/useModalManager.ts(34,6): error TS7006: Parameter 'modalName' implicitly has an 'any' type.
src/hooks/common/useModalManager.ts(35,22): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/common/useNetworkStatus.ts(2,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/common/useNetworkStatus.ts(11,27): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/common/useNetworkStatus.ts(11,43): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/hooks/common/usePrompt.ts(109,12): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/common/useRouterPageDetection.ts(22,25): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ "/app": string; "/app/dashboard": string; "/app/envelopes": string; "/app/savings": string; "/app/supplemental": string; "/app/paycheck": string; "/app/bills": string; "/app/transactions": string; "/app/debts": string; "/app/analytics": string; "/app/automation": string; "/app/activity": string; }'.
  No index signature with a parameter of type 'string' was found on type '{ "/app": string; "/app/dashboard": string; "/app/envelopes": string; "/app/savings": string; "/app/supplemental": string; "/app/paycheck": string; "/app/bills": string; "/app/transactions": string; "/app/debts": string; "/app/analytics": string; "/app/automation": string; "/app/activity": string; }'.
src/hooks/common/useRouterPageDetection.ts(66,24): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ dashboard: string; envelopes: string; savings: string; supplemental: string; paycheck: string; bills: string; transactions: string; debts: string; analytics: string; automation: string; activity: string; }'.
src/hooks/common/useTransactionArchiving.ts(105,12): error TS7006: Parameter 'archiveId' implicitly has an 'any' type.
src/hooks/common/useTransactionArchiving.ts(126,41): error TS7006: Parameter 'transactionCount' implicitly has an 'any' type.
src/hooks/common/useTransactions.ts(42,48): error TS2345: Argument of type 'Transaction[]' is not assignable to parameter of type 'never[]'.
  Type 'Transaction' is not assignable to type 'never'.
src/hooks/dashboard/useMainDashboard.ts(173,6): error TS7006: Parameter 'difference' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(61,20): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'DebtAccount'.
  No index signature with a parameter of type 'string' was found on type 'DebtAccount'.
src/hooks/debts/useDebtDashboard.ts(62,20): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'DebtAccount'.
  No index signature with a parameter of type 'string' was found on type 'DebtAccount'.
src/hooks/debts/useDebtDashboard.ts(84,27): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(89,28): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(145,35): error TS7006: Parameter 'debtId' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(155,38): error TS7006: Parameter 'debtId' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(155,46): error TS7006: Parameter 'paymentData' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(159,40): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/debts/useDebtDashboard.ts(161,25): error TS2345: Argument of type 'DebtAccount | undefined' is not assignable to parameter of type 'SetStateAction<null>'.
  Type 'undefined' is not assignable to type 'SetStateAction<null>'.
src/hooks/debts/useDebtDetailModal.ts(10,3): error TS7031: Binding element 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtDetailModal.ts(11,3): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/hooks/debts/useDebtDetailModal.ts(12,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/hooks/debts/useDebtDetailModal.ts(13,3): error TS7031: Binding element 'onDelete' implicitly has an 'any' type.
src/hooks/debts/useDebtDetailModal.ts(14,3): error TS7031: Binding element 'onRecordPayment' implicitly has an 'any' type.
src/hooks/debts/useDebtDetailModal.ts(15,3): error TS7031: Binding element 'onEdit' implicitly has an 'any' type.
src/hooks/debts/useDebtDetailModal.ts(69,13): error TS7006: Parameter 'payment' implicitly has an 'any' type.
src/hooks/debts/useDebtDetailModal.ts(69,22): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/hooks/debts/useDebtDetailModal.ts(80,32): error TS7006: Parameter 'e' implicitly has an 'any' type.
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
src/hooks/history/useBudgetHistoryViewer.ts(17,46): error TS7006: Parameter 'commitHash' implicitly has an 'any' type.
src/hooks/history/useBudgetHistoryViewer.ts(21,45): error TS7006: Parameter 'commitHash' implicitly has an 'any' type.
src/hooks/history/useBudgetHistoryViewer.ts(33,37): error TS7006: Parameter 'updates' implicitly has an 'any' type.
src/hooks/history/useBudgetHistoryViewer.ts(60,41): error TS7006: Parameter 'restore' implicitly has an 'any' type.
src/hooks/history/useBudgetHistoryViewer.ts(65,12): error TS7006: Parameter 'commitHash' implicitly has an 'any' type.
src/hooks/history/useBudgetHistoryViewer.ts(122,38): error TS7006: Parameter 'changeType' implicitly has an 'any' type.
src/hooks/history/useBudgetHistoryViewer.ts(143,39): error TS7006: Parameter 'author' implicitly has an 'any' type.
src/hooks/history/useBudgetHistoryViewer.ts(149,12): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ system: string; user: string; default: string; }'.
src/hooks/history/useBudgetHistoryViewer.ts(152,41): error TS7006: Parameter 'hash' implicitly has an 'any' type.
src/hooks/history/useBudgetHistoryViewer.ts(156,40): error TS7006: Parameter 'timestamp' implicitly has an 'any' type.
src/hooks/history/useBudgetHistoryViewer.ts(160,35): error TS7006: Parameter 'date' implicitly has an 'any' type.
src/hooks/layout/usePaycheckOperations.ts(18,51): error TS7006: Parameter 'paycheckId' implicitly has an 'any' type.
src/hooks/layout/usePaycheckOperations.ts(18,63): error TS7006: Parameter 'paycheckHistory' implicitly has an 'any' type.
src/hooks/layout/usePaycheckOperations.ts(66,23): error TS18046: 'error' is of type 'unknown'.
src/hooks/layout/usePaycheckOperations.ts(67,21): error TS18046: 'error' is of type 'unknown'.
src/hooks/mobile/useBottomNavigation.ts(132,20): error TS7006: Parameter 'itemKey' implicitly has an 'any' type.
src/hooks/mobile/useBottomNavigation.ts(133,20): error TS7006: Parameter 'key' implicitly has an 'any' type.
src/hooks/mobile/useFABBehavior.ts(8,23): error TS7006: Parameter 'callback' implicitly has an 'any' type.
src/hooks/mobile/useFABBehavior.ts(13,6): error TS7006: Parameter 'event' implicitly has an 'any' type.
src/hooks/mobile/useFABBehavior.ts(15,7): error TS2322: Type 'Timeout' is not assignable to type 'null'.
src/hooks/mobile/useFABBehavior.ts(43,32): error TS7006: Parameter 'isExpanded' implicitly has an 'any' type.
src/hooks/mobile/useFABBehavior.ts(43,44): error TS7006: Parameter 'setExpanded' implicitly has an 'any' type.
src/hooks/mobile/useFABBehavior.ts(43,57): error TS7006: Parameter 'containerRef' implicitly has an 'any' type.
src/hooks/mobile/useFABBehavior.ts(45,28): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/mobile/useFABSmartPositioning.ts(13,9): error TS7034: Variable 'resizeTimeout' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/mobile/useFABSmartPositioning.ts(17,20): error TS7005: Variable 'resizeTimeout' implicitly has an 'any' type.
src/hooks/mobile/useFABSmartPositioning.ts(60,20): error TS7005: Variable 'resizeTimeout' implicitly has an 'any' type.
src/hooks/mobile/usePullToRefresh.ts(11,3): error TS7006: Parameter 'onRefresh' implicitly has an 'any' type.
src/hooks/mobile/usePullToRefresh.ts(21,29): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/mobile/usePullToRefresh.ts(30,32): error TS2339: Property 'scrollTop' does not exist on type 'never'.
src/hooks/mobile/usePullToRefresh.ts(35,28): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/mobile/useSlideUpModal.ts(41,37): error TS7006: Parameter 'newConfig' implicitly has an 'any' type.
src/hooks/notifications/useFirebaseMessaging.ts(25,25): error TS2345: Argument of type 'PermissionStatusForUI' is not assignable to parameter of type 'SetStateAction<null>'.
  Type 'PermissionStatusForUI' provides no match for the signature '(prevState: null): null'.
src/hooks/notifications/useFirebaseMessaging.ts(46,20): error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<null>'.
src/hooks/notifications/useFirebaseMessaging.ts(53,16): error TS18046: 'err' is of type 'unknown'.
src/hooks/notifications/useFirebaseMessaging.ts(85,18): error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<null>'.
src/hooks/notifications/useFirebaseMessaging.ts(92,16): error TS18046: 'err' is of type 'unknown'.
src/hooks/notifications/useFirebaseMessaging.ts(93,56): error TS18046: 'err' is of type 'unknown'.
src/hooks/notifications/useFirebaseMessaging.ts(124,31): error TS7006: Parameter 'event' implicitly has an 'any' type.
src/hooks/notifications/useFirebaseMessaging.ts(126,24): error TS2353: Object literal may only specify known properties, and 'payload' does not exist in type '(prevState: null) => null'.
src/hooks/notifications/useFirebaseMessaging.ts(167,45): error TS2339: Property 'canShowPrompt' does not exist on type 'never'.
src/hooks/notifications/useFirebaseMessaging.ts(168,36): error TS2339: Property 'isSupported' does not exist on type 'never'.
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
src/hooks/receipts/useReceiptToTransaction.ts(11,41): error TS7006: Parameter 'receiptData' implicitly has an 'any' type.
src/hooks/receipts/useReceiptToTransaction.ts(43,29): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/hooks/receipts/useReceiptToTransaction.ts(43,36): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/receipts/useReceiptToTransaction.ts(108,39): error TS18046: 'error' is of type 'unknown'.
src/hooks/receipts/useReceiptToTransaction.ts(130,37): error TS7006: Parameter 'merchant' implicitly has an 'any' type.
src/hooks/receipts/useReceiptToTransaction.ts(130,47): error TS7006: Parameter 'envelopes' implicitly has an 'any' type.
src/hooks/receipts/useReceiptToTransaction.ts(158,10): error TS7006: Parameter 'env' implicitly has an 'any' type.
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
src/hooks/savings/useSavingsGoalsActions.ts(10,35): error TS7031: Binding element 'onAddGoal' implicitly has an 'any' type.
src/hooks/savings/useSavingsGoalsActions.ts(10,46): error TS7031: Binding element 'onUpdateGoal' implicitly has an 'any' type.
src/hooks/savings/useSavingsGoalsActions.ts(10,60): error TS7031: Binding element 'onDeleteGoal' implicitly has an 'any' type.
src/hooks/savings/useSavingsGoalsActions.ts(10,74): error TS7031: Binding element 'onDistributeToGoals' implicitly has an 'any' type.
src/hooks/savings/useSavingsGoalsActions.ts(19,35): error TS7006: Parameter 'goalData' implicitly has an 'any' type.
src/hooks/savings/useSavingsGoalsActions.ts(43,27): error TS7006: Parameter 'goal' implicitly has an 'any' type.
src/hooks/savings/useSavingsGoalsActions.ts(48,35): error TS7006: Parameter 'goal' implicitly has an 'any' type.
src/hooks/savings/useSavingsGoalsActions.ts(68,35): error TS7006: Parameter 'distribution' implicitly has an 'any' type.
src/hooks/security/useSecuritySettingsLogic.ts(18,6): error TS7006: Parameter 'setting' implicitly has an 'any' type.
src/hooks/security/useSecuritySettingsLogic.ts(18,15): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/settings/useSettingsDashboard.ts(2,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/settings/useSettingsDashboard.ts(103,28): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/settings/useSettingsDashboard.ts(103,44): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/hooks/settings/useSettingsDashboard.ts(104,31): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/settings/useSettingsDashboard.ts(104,47): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(100,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '(() => void) | undefined' is not assignable to type '() => void'.
      Type 'undefined' is not assignable to type '() => void'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '((event: ChangeEvent<HTMLInputElement>) => void) | undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
              Type 'undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(101,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '(() => void) | undefined' is not assignable to type '() => void'.
      Type 'undefined' is not assignable to type '() => void'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '((event: ChangeEvent<HTMLInputElement>) => void) | undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
              Type 'undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(102,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '(() => void) | undefined' is not assignable to type '() => void'.
      Type 'undefined' is not assignable to type '() => void'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '((event: ChangeEvent<HTMLInputElement>) => void) | undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
              Type 'undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
src/hooks/settings/useSettingsSectionRenderer.ts(103,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '(() => void) | undefined' is not assignable to type '() => void'.
      Type 'undefined' is not assignable to type '() => void'.
        Type '(() => void) | undefined' is not assignable to type '() => void'.
          Type 'undefined' is not assignable to type '() => void'.
            Type '((event: ChangeEvent<HTMLInputElement>) => void) | undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
              Type 'undefined' is not assignable to type '(event: ChangeEvent<HTMLInputElement>) => void'.
                Type '(() => void) | undefined' is not assignable to type '() => void'.
                  Type 'undefined' is not assignable to type '() => void'.
src/hooks/sharing/useBudgetJoining.ts(16,5): error TS7031: Binding element 'shareCode' implicitly has an 'any' type.
src/hooks/sharing/useBudgetJoining.ts(17,5): error TS7031: Binding element 'password' implicitly has an 'any' type.
src/hooks/sharing/useBudgetJoining.ts(18,5): error TS7031: Binding element 'userName' implicitly has an 'any' type.
src/hooks/sharing/useBudgetJoining.ts(19,5): error TS7031: Binding element 'userColor' implicitly has an 'any' type.
src/hooks/sharing/useBudgetJoining.ts(20,5): error TS7031: Binding element 'onJoinSuccess' implicitly has an 'any' type.
src/hooks/sharing/useBudgetJoining.ts(21,5): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/hooks/sharing/useBudgetJoining.ts(72,22): error TS18046: 'error' is of type 'unknown'.
src/hooks/sharing/useQRCodeProcessing.ts(12,26): error TS7006: Parameter 'qrData' implicitly has an 'any' type.
src/hooks/sharing/useQRCodeProcessing.ts(12,34): error TS7006: Parameter 'setShareCode' implicitly has an 'any' type.
src/hooks/sharing/useQRCodeProcessing.ts(12,48): error TS7006: Parameter 'setCreatorInfo' implicitly has an 'any' type.
src/hooks/sharing/useQRCodeProcessing.ts(12,64): error TS7006: Parameter 'validateShareCode' implicitly has an 'any' type.
src/hooks/sharing/useQRCodeProcessing.ts(31,46): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
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
src/hooks/transactions/useTransactionBalanceUpdater.ts(5,39): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(5,45): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(5,53): error TS7006: Parameter 'multiplier' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(16,33): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(16,39): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(16,47): error TS7006: Parameter 'multiplier' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(22,3): error TS7006: Parameter 'currentActualBalance' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(23,3): error TS7006: Parameter 'currentUnassignedCash' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(24,3): error TS7006: Parameter 'actualBalanceChange' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(25,3): error TS7006: Parameter 'unassignedChange' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(35,3): error TS7006: Parameter 'envelopeId' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(36,3): error TS7006: Parameter 'balanceChange' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(37,3): error TS7006: Parameter 'currentActualBalance' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(38,3): error TS7006: Parameter 'actualBalanceChange' implicitly has an 'any' type.
src/hooks/transactions/useTransactionBalanceUpdater.ts(56,47): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
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
src/hooks/transactions/useTransactionFilters.ts(12,3): error TS7031: Binding element 'transactions' implicitly has an 'any' type.
src/hooks/transactions/useTransactionFilters.ts(13,3): error TS7031: Binding element 'searchTerm' implicitly has an 'any' type.
src/hooks/transactions/useTransactionFilters.ts(14,3): error TS7031: Binding element 'dateFilter' implicitly has an 'any' type.
src/hooks/transactions/useTransactionFilters.ts(15,3): error TS7031: Binding element 'typeFilter' implicitly has an 'any' type.
src/hooks/transactions/useTransactionFilters.ts(16,3): error TS7031: Binding element 'envelopeFilter' implicitly has an 'any' type.
src/hooks/transactions/useTransactionFilters.ts(17,3): error TS7031: Binding element 'sortBy' implicitly has an 'any' type.
src/hooks/transactions/useTransactionFilters.ts(18,3): error TS7031: Binding element 'sortOrder' implicitly has an 'any' type.
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
src/hooks/transactions/useTransactionLedger.ts(7,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/transactions/useTransactionLedger.ts(34,18): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/transactions/useTransactionLedger.ts(104,5): error TS2345: Argument of type 'UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>' is not assignable to parameter of type 'AddTransactionFn'.
  Types of parameters 'variables' and 'transaction' are incompatible.
    Type 'unknown' is not assignable to type 'TransactionInput'.
src/hooks/transactions/useTransactionLedger.ts(158,44): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/transactions/useTransactionLedger.ts(202,22): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/hooks/transactions/useTransactionLedger.ts(226,29): error TS7006: Parameter 'direction' implicitly has an 'any' type.
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
src/hooks/transactions/useTransactionSplitterUI.ts(29,3): error TS7006: Parameter 'splitAllocations' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(30,3): error TS7006: Parameter 'setSplitAllocations' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(31,3): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(32,3): error TS7006: Parameter 'envelopes' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(51,26): error TS7006: Parameter 'prev' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(56,6): error TS7006: Parameter 'id' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(56,10): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(56,17): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(71,6): error TS7006: Parameter 'id' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(72,28): error TS7006: Parameter 'prev' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(72,50): error TS7006: Parameter 'split' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(131,3): error TS7006: Parameter 'splitAllocations' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(132,3): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(133,3): error TS7006: Parameter 'setIsProcessing' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(134,3): error TS7006: Parameter 'onSplitTransaction' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(135,3): error TS7006: Parameter 'onClose' implicitly has an 'any' type.
src/hooks/transactions/useTransactionSplitterUI.ts(166,39): error TS18046: 'error' is of type 'unknown'.
src/hooks/transactions/useTransactionTable.ts(24,30): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/hooks/transactions/useTransactionTable.ts(32,31): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/hooks/transactions/useTransactionUtils.ts(6,6): error TS7006: Parameter 'id' implicitly has an 'any' type.
src/hooks/transactions/useTransactionUtils.ts(6,40): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/transactions/useTransactionUtils.ts(11,6): error TS7006: Parameter 'envId' implicitly has an 'any' type.
src/hooks/transactions/useTransactionUtils.ts(11,45): error TS2339: Property 'envelopeId' does not exist on type 'never'.
src/hooks/transactions/useTransactionUtils.ts(16,6): error TS7006: Parameter 'cat' implicitly has an 'any' type.
src/hooks/transactions/useTransactionUtils.ts(16,43): error TS2339: Property 'category' does not exist on type 'never'.
src/hooks/transactions/useTransactionUtils.ts(21,58): error TS2339: Property 'category' does not exist on type 'never'.
src/hooks/transactions/useTransactionsV2.ts(7,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/transactions/useTransactionsV2.ts(56,23): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/transactions/useTransactionsV2.ts(89,41): error TS2339: Property 'length' does not exist on type '{}'.
src/main.tsx(36,32): error TS7006: Parameter 'loadOnce' implicitly has an 'any' type.
src/main.tsx(147,40): error TS7006: Parameter 'localData' implicitly has an 'any' type.
src/main.tsx(158,34): error TS7006: Parameter 'localData' implicitly has an 'any' type.
src/main.tsx(164,40): error TS7006: Parameter 'cloudSyncService' implicitly has an 'any' type.
src/main.tsx(218,43): error TS18046: 'error' is of type 'unknown'.
src/main.tsx(236,43): error TS18046: 'error' is of type 'unknown'.
src/main.tsx(271,20): error TS18046: 'error' is of type 'unknown'.
src/main.tsx(280,23): error TS2345: Argument of type 'HTMLElement | null' is not assignable to parameter of type 'Container'.
  Type 'null' is not assignable to type 'Container'.
src/services/activityLogger.ts(126,68): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/browserInfoService.ts(117,52): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/browserInfoService.ts(160,50): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/browserInfoService.ts(184,53): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/browserInfoService.ts(218,48): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/contextAnalysisService.ts(123,11): error TS2352: Conversion of type '{ modals: never[]; forms: never[]; buttons: never[]; inputs: never[]; }' to type 'UIState' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ modals: never[]; forms: never[]; buttons: never[]; inputs: never[]; }' is missing the following properties from type 'UIState': drawers, tabs, loading, interactions
src/services/bugReport/contextAnalysisService.ts(157,54): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/contextAnalysisService.ts(186,56): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/contextAnalysisService.ts(206,48): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/contextAnalysisService.ts(226,57): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/contextAnalysisService.ts(243,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/bugReport/contextAnalysisService.ts(243,29): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/bugReport/errorTrackingService.ts(106,26): error TS2322: Type '(event: ErrorEvent) => void' is not assignable to type '{ handleEvent: (event: Event) => void; } | ((event: Event) => void)'.
  Type '(event: ErrorEvent) => void' is not assignable to type '(event: Event) => void'.
    Types of parameters 'event' and 'event' are incompatible.
      Type 'Event' is missing the following properties from type 'ErrorEvent': colno, error, filename, lineno, message
src/services/bugReport/errorTrackingService.ts(217,53): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/index.ts(107,9): error TS2783: 'success' is specified more than once, so this usage will be overwritten.
src/services/bugReport/index.ts(120,47): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Error'.
src/services/bugReport/index.ts(158,26): error TS18046: 'error' is of type 'unknown'.
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
src/services/bugReport/uiStateService.ts(96,48): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/uiStateService.ts(146,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/uiStateService.ts(178,52): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/uiStateService.ts(210,49): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/uiStateService.ts(241,50): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/uiStateService.ts(271,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/uiStateService.ts(305,50): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/uiStateService.ts(338,52): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/uiStateService.ts(379,58): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/chunkedSyncService.ts(195,68): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/chunkedSyncService.ts(275,7): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/chunkedSyncService.ts(428,29): error TS2769: No overload matches this call.
  Overload 1 of 3, '(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'string | null' is not assignable to parameter of type 'string'.
      Type 'null' is not assignable to type 'string'.
  Overload 2 of 3, '(reference: CollectionReference<unknown, DocumentData>, path?: string | undefined, ...pathSegments: string[]): DocumentReference<unknown, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'CollectionReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'CollectionReference<unknown, DocumentData>': id, path, parent, withConverter, and 2 more.
  Overload 3 of 3, '(reference: DocumentReference<unknown, DocumentData>, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'DocumentReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'DocumentReference<unknown, DocumentData>': converter, firestore, id, path, and 2 more.
src/services/chunkedSyncService.ts(544,24): error TS2769: No overload matches this call.
  Overload 1 of 3, '(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'string | null' is not assignable to parameter of type 'string'.
      Type 'null' is not assignable to type 'string'.
  Overload 2 of 3, '(reference: CollectionReference<unknown, DocumentData>, path?: string | undefined, ...pathSegments: string[]): DocumentReference<unknown, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'CollectionReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'CollectionReference<unknown, DocumentData>': id, path, parent, withConverter, and 2 more.
  Overload 3 of 3, '(reference: DocumentReference<unknown, DocumentData>, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'DocumentReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'DocumentReference<unknown, DocumentData>': converter, firestore, id, path, and 2 more.
src/services/editLockService.ts(372,26): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/services/firebaseMessaging.ts(175,36): error TS2345: Argument of type 'Messaging | null' is not assignable to parameter of type 'Messaging'.
  Type 'null' is not assignable to type 'Messaging'.
src/services/firebaseMessaging.ts(294,38): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/services/firebaseSyncService.ts(166,46): error TS2345: Argument of type 'Auth | null' is not assignable to parameter of type 'Auth'.
  Type 'null' is not assignable to type 'Auth'.
src/services/firebaseSyncService.ts(178,58): error TS2345: Argument of type 'Auth | null' is not assignable to parameter of type 'Auth'.
  Type 'null' is not assignable to type 'Auth'.
src/services/firebaseSyncService.ts(237,26): error TS2769: No overload matches this call.
  Overload 1 of 3, '(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore | null' is not assignable to parameter of type 'Firestore'.
      Type 'null' is not assignable to type 'Firestore'.
  Overload 2 of 3, '(reference: CollectionReference<unknown, DocumentData>, path?: string | undefined, ...pathSegments: string[]): DocumentReference<unknown, DocumentData>', gave the following error.
    Argument of type 'Firestore | null' is not assignable to parameter of type 'CollectionReference<unknown, DocumentData>'.
      Type 'null' is not assignable to type 'CollectionReference<unknown, DocumentData>'.
  Overload 3 of 3, '(reference: DocumentReference<unknown, DocumentData>, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore | null' is not assignable to parameter of type 'DocumentReference<unknown, DocumentData>'.
      Type 'null' is not assignable to type 'DocumentReference<unknown, DocumentData>'.
src/services/firebaseSyncService.ts(268,26): error TS2769: No overload matches this call.
  Overload 1 of 3, '(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore | null' is not assignable to parameter of type 'Firestore'.
      Type 'null' is not assignable to type 'Firestore'.
  Overload 2 of 3, '(reference: CollectionReference<unknown, DocumentData>, path?: string | undefined, ...pathSegments: string[]): DocumentReference<unknown, DocumentData>', gave the following error.
    Argument of type 'Firestore | null' is not assignable to parameter of type 'CollectionReference<unknown, DocumentData>'.
      Type 'null' is not assignable to type 'CollectionReference<unknown, DocumentData>'.
  Overload 3 of 3, '(reference: DocumentReference<unknown, DocumentData>, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore | null' is not assignable to parameter of type 'DocumentReference<unknown, DocumentData>'.
      Type 'null' is not assignable to type 'DocumentReference<unknown, DocumentData>'.
src/services/firebaseSyncService.ts(305,24): error TS2769: No overload matches this call.
  Overload 1 of 3, '(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore | null' is not assignable to parameter of type 'Firestore'.
      Type 'null' is not assignable to type 'Firestore'.
  Overload 2 of 3, '(reference: CollectionReference<unknown, DocumentData>, path?: string | undefined, ...pathSegments: string[]): DocumentReference<unknown, DocumentData>', gave the following error.
    Argument of type 'Firestore | null' is not assignable to parameter of type 'CollectionReference<unknown, DocumentData>'.
      Type 'null' is not assignable to type 'CollectionReference<unknown, DocumentData>'.
  Overload 3 of 3, '(reference: DocumentReference<unknown, DocumentData>, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore | null' is not assignable to parameter of type 'DocumentReference<unknown, DocumentData>'.
      Type 'null' is not assignable to type 'DocumentReference<unknown, DocumentData>'.
src/services/firebaseSyncService.ts(367,15): error TS2722: Cannot invoke an object which is possibly 'undefined'.
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
src/stores/ui/uiStore.ts(13,27): error TS7006: Parameter 'parsedOldData' implicitly has an 'any' type.
src/stores/ui/uiStore.ts(33,42): error TS7006: Parameter 'transformedData' implicitly has an 'any' type.
src/stores/ui/uiStore.ts(81,14): error TS18046: 'error' is of type 'unknown'.
src/stores/ui/uiStore.ts(96,27): error TS7006: Parameter 'set' implicitly has an 'any' type.
src/stores/ui/uiStore.ts(96,32): error TS7006: Parameter '_get' implicitly has an 'any' type.
src/stores/ui/uiStore.ts(131,33): error TS7006: Parameter 'fromVersion' implicitly has an 'any' type.
src/stores/ui/uiStore.ts(131,46): error TS7006: Parameter 'toVersion' implicitly has an 'any' type.
src/stores/ui/uiStore.ts(132,10): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/uiStore.ts(140,12): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/uiStore.ts(155,12): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/uiStore.ts(167,57): error TS18046: 'error' is of type 'unknown'.
src/stores/ui/uiStore.ts(188,21): error TS7005: Variable 'useUiStore' implicitly has an 'any' type.
src/stores/ui/uiStore.ts(227,10): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/uiStore.ts(256,5): error TS7034: Variable 'useUiStore' implicitly has type 'any' in some locations where its type cannot be determined.
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
src/utils/analytics/trendHelpers.ts(8,32): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/utils/analytics/trendHelpers.ts(13,31): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/utils/analytics/trendHelpers.ts(18,36): error TS7006: Parameter 'trend' implicitly has an 'any' type.
src/utils/analytics/trendHelpers.ts(44,36): error TS7006: Parameter 'growthRate' implicitly has an 'any' type.
src/utils/analytics/trendHelpers.ts(51,39): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/utils/analytics/trendHelpers.ts(66,42): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/utils/analytics/trendHelpers.ts(66,49): error TS7006: Parameter 'name' implicitly has an 'any' type.
src/utils/analytics/trendHelpers.ts(71,42): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/utils/analytics/trendHelpers.ts(71,49): error TS7006: Parameter 'name' implicitly has an 'any' type.
src/utils/auth/shareCodeManager.ts(30,20): error TS7006: Parameter 'shareCode' implicitly has an 'any' type.
src/utils/auth/shareCodeManager.ts(44,20): error TS7006: Parameter 'shareCode' implicitly has an 'any' type.
src/utils/auth/shareCodeManager.ts(54,18): error TS7006: Parameter 'shareCode' implicitly has an 'any' type.
src/utils/auth/userSetupHelpers.tsx(23,37): error TS7031: Binding element 'masterPassword' implicitly has an 'any' type.
src/utils/auth/userSetupHelpers.tsx(23,53): error TS7031: Binding element 'userName' implicitly has an 'any' type.
src/utils/auth/userSetupHelpers.tsx(23,63): error TS7031: Binding element 'userColor' implicitly has an 'any' type.
src/utils/auth/userSetupHelpers.tsx(47,30): error TS7006: Parameter 'step' implicitly has an 'any' type.
src/utils/auth/userSetupHelpers.tsx(47,36): error TS7006: Parameter 'isReturningUser' implicitly has an 'any' type.
src/utils/auth/userSetupHelpers.tsx(47,53): error TS7006: Parameter 'userName' implicitly has an 'any' type.
src/utils/auth/userSetupHelpers.tsx(86,33): error TS7006: Parameter 'step' implicitly has an 'any' type.
src/utils/auth/userSetupHelpers.tsx(86,39): error TS7006: Parameter 'isReturningUser' implicitly has an 'any' type.
src/utils/billIcons/iconOptions.ts(179,10): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ utilities: BillIconOption[]; housing: BillIconOption[]; transportation: BillIconOption[]; insurance: BillIconOption[]; ... 6 more ...; business: BillIconOption[]; }'.
  No index signature with a parameter of type 'string' was found on type '{ utilities: BillIconOption[]; housing: BillIconOption[]; transportation: BillIconOption[]; insurance: BillIconOption[]; ... 6 more ...; business: BillIconOption[]; }'.
src/utils/billIcons/iconUtils.ts(22,24): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ utilities: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; ... 60 more ...; other: ForwardRefExoticComponent<...>; }'.
  No index signature with a parameter of type 'string' was found on type '{ utilities: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; ... 60 more ...; other: ForwardRefExoticComponent<...>; }'.
src/utils/billIcons/iconUtils.ts(40,17): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ utilities: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; ... 60 more ...; other: ForwardRefExoticComponent<...>; }'.
  No index signature with a parameter of type 'string' was found on type '{ utilities: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; ... 60 more ...; other: ForwardRefExoticComponent<...>; }'.
src/utils/billIcons/iconUtils.ts(41,33): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ utilities: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; ... 60 more ...; other: ForwardRefExoticComponent<...>; }'.
  No index signature with a parameter of type 'string' was found on type '{ utilities: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; ... 60 more ...; other: ForwardRefExoticComponent<...>; }'.
src/utils/billIcons/iconUtils.ts(60,31): error TS7006: Parameter 'iconName' implicitly has an 'any' type.
src/utils/billIcons/iconUtils.ts(64,10): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ Zap: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; ... 42 more ...; Receipt: ForwardRefExoticComponent<...>; }'.
  No index signature with a parameter of type 'string' was found on type '{ Zap: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; ... 42 more ...; Receipt: ForwardRefExoticComponent<...>; }'.
src/utils/billIcons/iconUtils.ts(70,29): error TS7006: Parameter 'IconComponent' implicitly has an 'any' type.
src/utils/billIcons/iconUtils.ts(86,39): error TS7006: Parameter 'IconComponent' implicitly has an 'any' type.
src/utils/bills/billCalculations.ts(131,57): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/bills/billCalculations.ts(166,49): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/bills/billCalculations.ts(192,46): error TS2345: Argument of type 'string | Date | undefined' is not assignable to parameter of type 'string | Date'.
  Type 'undefined' is not assignable to type 'string | Date'.
src/utils/bills/billCalculations.ts(201,5): error TS2322: Type 'number | null' is not assignable to type 'number | undefined'.
  Type 'null' is not assignable to type 'number | undefined'.
src/utils/bills/billDetailUtils.ts(13,38): error TS7006: Parameter 'currentDueDate' implicitly has an 'any' type.
src/utils/bills/billDetailUtils.ts(13,54): error TS7006: Parameter 'frequency' implicitly has an 'any' type.
src/utils/bills/billDetailUtils.ts(52,35): error TS7006: Parameter 'status' implicitly has an 'any' type.
src/utils/bills/billDetailUtils.ts(52,43): error TS7006: Parameter 'isOverdue' implicitly has an 'any' type.
src/utils/bills/billDetailUtils.ts(52,54): error TS7006: Parameter 'isDueSoon' implicitly has an 'any' type.
src/utils/bills/billDetailUtils.ts(64,34): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/utils/bills/billDetailUtils.ts(74,37): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/utils/bills/billDetailUtils.ts(85,38): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/utils/bills/billDetailUtils.ts(85,43): error TS7006: Parameter 'payment' implicitly has an 'any' type.
src/utils/bills/billDetailUtils.ts(103,36): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/utils/bills/billDetailUtils.ts(118,37): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(106,71): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/bills/billUpdateHelpers.ts(107,5): error TS2722: Cannot invoke an object which is possibly 'undefined'.
src/utils/bills/recurringBillUtils.ts(9,38): error TS7006: Parameter 'paidDate' implicitly has an 'any' type.
src/utils/bills/recurringBillUtils.ts(9,48): error TS7006: Parameter 'frequency' implicitly has an 'any' type.
src/utils/bills/recurringBillUtils.ts(53,38): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/utils/bills/recurringBillUtils.ts(53,44): error TS7006: Parameter 'updateBillFn' implicitly has an 'any' type.
src/utils/bills/recurringBillUtils.ts(75,57): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/bills/recurringBillUtils.ts(90,39): error TS7006: Parameter 'bills' implicitly has an 'any' type.
src/utils/bills/recurringBillUtils.ts(90,46): error TS7006: Parameter 'updateBillFn' implicitly has an 'any' type.
src/utils/bills/recurringBillUtils.ts(91,21): error TS7006: Parameter 'bill' implicitly has an 'any' type.
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
src/utils/budgeting/envelopeMatching.ts(5,33): error TS7006: Parameter 'description' implicitly has an 'any' type.
src/utils/budgeting/envelopeMatching.ts(5,46): error TS7006: Parameter 'envelopes' implicitly has an 'any' type.
src/utils/budgeting/envelopeMatching.ts(9,38): error TS7006: Parameter 'env' implicitly has an 'any' type.
src/utils/budgeting/envelopeMatching.ts(28,10): error TS7006: Parameter 'env' implicitly has an 'any' type.
src/utils/budgeting/envelopeMatching.ts(42,37): error TS7006: Parameter 'transactions' implicitly has an 'any' type.
src/utils/budgeting/envelopeMatching.ts(42,51): error TS7006: Parameter 'envelopes' implicitly has an 'any' type.
src/utils/budgeting/envelopeMatching.ts(43,28): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/utils/budgeting/envelopeMatching.ts(61,39): error TS7006: Parameter 'description' implicitly has an 'any' type.
src/utils/budgeting/envelopeMatching.ts(61,52): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/utils/budgeting/envelopeStyles.ts(6,38): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/utils/budgeting/envelopeStyles.ts(8,18): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'Record<EnvelopeType, EnvelopeTypeConfig>'.
src/utils/budgeting/envelopeStyles.ts(20,32): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/utils/budgeting/envelopeStyles.ts(39,31): error TS7006: Parameter 'status' implicitly has an 'any' type.
src/utils/budgeting/envelopeStyles.ts(55,37): error TS7006: Parameter 'utilizationRate' implicitly has an 'any' type.
src/utils/budgeting/envelopeStyles.ts(55,54): error TS7006: Parameter 'status' implicitly has an 'any' type.
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
src/utils/common/BaseMutex.ts(62,35): error TS2531: Object is possibly 'null'.
src/utils/common/BaseMutex.ts(71,15): error TS2339: Property 'resolve' does not exist on type '{ resolve: () => void; operationName: string; } | undefined'.
src/utils/common/BaseMutex.ts(71,24): error TS2339: Property 'operationName' does not exist on type '{ resolve: () => void; operationName: string; } | undefined'.
src/utils/common/BaseMutex.ts(80,17): error TS7006: Parameter 'fn' implicitly has an 'any' type.
src/utils/common/BaseMutex.ts(109,48): error TS2531: Object is possibly 'null'.
src/utils/common/BaseMutex.ts(116,9): error TS7006: Parameter 'operationName' implicitly has an 'any' type.
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
src/utils/dataManagement/validationUtils.ts(3,32): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/utils/dataManagement/validationUtils.ts(13,32): error TS7006: Parameter 'importedData' implicitly has an 'any' type.
src/utils/dataManagement/validationUtils.ts(13,46): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/utils/dataManagement/validationUtils.ts(19,28): error TS7006: Parameter 'importedData' implicitly has an 'any' type.
src/utils/dataManagement/validationUtils.ts(25,38): error TS7006: Parameter 'importedData' implicitly has an 'any' type.
src/utils/dataManagement/validationUtils.ts(25,52): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/utils/debts/calculations/interestCalculation.ts(12,42): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/utils/debts/calculations/interestCalculation.ts(12,48): error TS7006: Parameter 'paymentAmount' implicitly has an 'any' type.
src/utils/debts/calculations/nextPaymentDate.ts(13,42): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/utils/debts/calculations/nextPaymentDate.ts(13,48): error TS7006: Parameter 'relatedBill' implicitly has an 'any' type.
src/utils/debts/calculations/payoffProjection.ts(11,43): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/utils/debts/debtDebugConfig.ts(42,38): error TS7006: Parameter 'feature' implicitly has an 'any' type.
src/utils/debts/debtDebugConfig.ts(43,10): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ ENABLE_DEBT_MANAGEMENT_HOOK: boolean; ENABLE_DEBT_DASHBOARD: boolean; ENABLE_DEBT_SUMMARY_CARDS: boolean; ENABLE_DEBT_LIST: boolean; ENABLE_DEBT_FILTERS: boolean; ENABLE_DEBT_MODALS: boolean; ... 9 more ...; ENABLE_DEBT_STRATEGIES: boolean; }'.
src/utils/debts/debtDebugConfig.ts(50,36): error TS7006: Parameter 'feature' implicitly has an 'any' type.
src/utils/debts/debtDebugConfig.ts(51,3): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ ENABLE_DEBT_MANAGEMENT_HOOK: boolean; ENABLE_DEBT_DASHBOARD: boolean; ENABLE_DEBT_SUMMARY_CARDS: boolean; ENABLE_DEBT_LIST: boolean; ENABLE_DEBT_FILTERS: boolean; ENABLE_DEBT_MODALS: boolean; ... 9 more ...; ENABLE_DEBT_STRATEGIES: boolean; }'.
src/utils/debts/debtDebugConfig.ts(59,35): error TS7006: Parameter 'feature' implicitly has an 'any' type.
src/utils/debts/debtDebugConfig.ts(60,3): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ ENABLE_DEBT_MANAGEMENT_HOOK: boolean; ENABLE_DEBT_DASHBOARD: boolean; ENABLE_DEBT_SUMMARY_CARDS: boolean; ENABLE_DEBT_LIST: boolean; ENABLE_DEBT_FILTERS: boolean; ENABLE_DEBT_MODALS: boolean; ... 9 more ...; ENABLE_DEBT_STRATEGIES: boolean; }'.
src/utils/debts/debtFormValidation.ts(101,38): error TS2345: Argument of type '{ name: string; creditor: string; notes: string; balance: string; currentBalance: string; type: "credit_card" | "mortgage" | "other" | "auto" | "chapter13" | "student" | "personal" | "business"; ... 12 more ...; paymentDueDate?: string | undefined; } | undefined' is not assignable to parameter of type '{ name: string; creditor: string; notes: string; balance: string; currentBalance: string; type: "credit_card" | "mortgage" | "other" | "auto" | "chapter13" | "student" | "personal" | "business"; ... 12 more ...; paymentDueDate?: string | undefined; }'.
  Type 'undefined' is not assignable to type '{ name: string; creditor: string; notes: string; balance: string; currentBalance: string; type: "credit_card" | "mortgage" | "other" | "auto" | "chapter13" | "student" | "personal" | "business"; ... 12 more ...; paymentDueDate?: string | undefined; }'.
src/utils/debts/debtFormValidation.ts(239,30): error TS18048: 'monthsToPayoff' is possibly 'undefined'.
src/utils/debts/debtFormValidation.ts(240,20): error TS18048: 'monthsToPayoff' is possibly 'undefined'.
src/utils/debts/debtFormValidation.ts(259,35): error TS2345: Argument of type 'number | null | undefined' is not assignable to parameter of type 'number | null'.
  Type 'undefined' is not assignable to type 'number | null'.
src/utils/debts/debtFormValidation.ts(260,37): error TS2345: Argument of type 'number | undefined' is not assignable to parameter of type 'number | null'.
  Type 'undefined' is not assignable to type 'number | null'.
src/utils/debts/debtFormValidation.ts(261,5): error TS2322: Type 'boolean | undefined' is not assignable to type 'boolean'.
  Type 'undefined' is not assignable to type 'boolean'.
src/utils/debug/dataDiagnostic.ts(113,59): error TS18046: 'error' is of type 'unknown'.
src/utils/debug/dataDiagnostic.ts(123,29): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'VioletVaultDB'.
  No index signature with a parameter of type 'string' was found on type 'VioletVaultDB'.
src/utils/debug/dataDiagnostic.ts(124,30): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'VioletVaultDB'.
  No index signature with a parameter of type 'string' was found on type 'VioletVaultDB'.
src/utils/debug/dataDiagnostic.ts(125,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/utils/debug/dataDiagnostic.ts(131,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/utils/debug/dataDiagnostic.ts(131,34): error TS18046: 'err' is of type 'unknown'.
src/utils/debug/dataDiagnostic.ts(148,47): error TS18046: 'error' is of type 'unknown'.
src/utils/debug/dataDiagnostic.ts(206,37): error TS18046: 'error' is of type 'unknown'.
src/utils/debug/dataDiagnostic.ts(298,20): error TS18048: 'window.budgetDb' is possibly 'undefined'.
src/utils/debug/dataDiagnostic.ts(301,20): error TS18048: 'window.budgetDb' is possibly 'undefined'.
src/utils/debug/dataDiagnostic.ts(303,23): error TS2345: Argument of type 'string | Date | undefined' is not assignable to parameter of type 'IndexableType'.
  Type 'undefined' is not assignable to type 'IndexableType'.
src/utils/debug/dataDiagnostic.ts(333,37): error TS18046: 'error' is of type 'unknown'.
src/utils/debug/reactErrorDetector.ts(29,34): error TS7006: Parameter 'actionName' implicitly has an 'any' type.
src/utils/debug/reactErrorDetector.ts(56,40): error TS7006: Parameter 'hookName' implicitly has an 'any' type.
src/utils/debug/reactErrorDetector.ts(56,50): error TS7006: Parameter 'dependencies' implicitly has an 'any' type.
src/utils/debug/reactErrorDetector.ts(60,6): error TS7006: Parameter 'dep' implicitly has an 'any' type.
src/utils/debug/reactErrorDetector.ts(69,42): error TS7006: Parameter 'dep' implicitly has an 'any' type.
src/utils/debug/reactErrorDetector.ts(127,40): error TS7006: Parameter 'store' implicitly has an 'any' type.
src/utils/debug/reactErrorDetector.ts(127,47): error TS7006: Parameter 'storeName' implicitly has an 'any' type.
src/utils/debug/reactErrorDetector.ts(136,26): error TS7019: Rest parameter 'args' implicitly has an 'any[]' type.
src/utils/debug/reactErrorDetector.ts(138,30): error TS2683: 'this' implicitly has type 'any' because it does not have a type annotation.
src/utils/debug/syncDiagnostic.ts(107,47): error TS18046: 'error' is of type 'unknown'.
src/utils/debug/syncDiagnostic.ts(135,60): error TS18046: 'error' is of type 'unknown'.
src/utils/debug/syncDiagnostic.ts(156,11): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/utils/debug/syncDiagnostic.ts(156,33): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'VioletVaultDB'.
  No index signature with a parameter of type 'string' was found on type 'VioletVaultDB'.
src/utils/debug/syncDiagnostic.ts(158,11): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/utils/debug/syncDiagnostic.ts(158,39): error TS18046: 'err' is of type 'unknown'.
src/utils/debug/syncDiagnostic.ts(177,55): error TS18046: 'error' is of type 'unknown'.
src/utils/debug/syncDiagnostic.ts(204,55): error TS18046: 'error' is of type 'unknown'.
src/utils/debug/syncDiagnostic.ts(236,58): error TS18046: 'error' is of type 'unknown'.
src/utils/icons/index.ts(334,25): error TS7006: Parameter 'iconName' implicitly has an 'any' type.
src/utils/icons/index.ts(336,10): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ "arrow-right": ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; ... 123 more ...; CreditCard: ForwardRefExoticComponent<...>; }'.
src/utils/icons/index.ts(340,29): error TS7006: Parameter 'iconComponent' implicitly has an 'any' type.
src/utils/icons/index.ts(346,28): error TS7006: Parameter 'iconName' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(10,42): error TS7006: Parameter 'paycheckId' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(10,54): error TS7006: Parameter 'paycheckHistory' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(15,50): error TS7006: Parameter 'p' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(33,50): error TS7006: Parameter 'paycheckToDelete' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(33,68): error TS7006: Parameter 'budgetDb' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(56,6): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(56,11): error TS7006: Parameter 'alloc' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(65,49): error TS7006: Parameter 'paycheckToDelete' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(65,67): error TS7006: Parameter 'budgetDb' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(65,77): error TS7006: Parameter 'getBudgetMetadata' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(96,44): error TS7006: Parameter 'paycheckId' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(96,56): error TS7006: Parameter 'budgetDb' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(117,48): error TS7006: Parameter 'queryClient' implicitly has an 'any' type.
src/utils/layout/paycheckDeletionUtils.ts(117,61): error TS7006: Parameter 'queryKeys' implicitly has an 'any' type.
src/utils/pageDetection/pageIdentifier.ts(37,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/pwa/backgroundSync.ts(35,24): error TS7006: Parameter 'operation' implicitly has an 'any' type.
src/utils/pwa/backgroundSync.ts(74,11): error TS7034: Variable 'successfulOperations' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/utils/pwa/backgroundSync.ts(75,11): error TS7034: Variable 'failedOperations' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/utils/pwa/backgroundSync.ts(89,13): error TS18046: 'operation.retryCount' is of type 'unknown'.
src/utils/pwa/backgroundSync.ts(89,37): error TS18046: 'operation.maxRetries' is of type 'unknown'.
src/utils/pwa/backgroundSync.ts(102,20): error TS18046: 'error' is of type 'unknown'.
src/utils/pwa/backgroundSync.ts(110,16): error TS7005: Variable 'successfulOperations' implicitly has an 'any[]' type.
src/utils/pwa/backgroundSync.ts(115,16): error TS7005: Variable 'failedOperations' implicitly has an 'any[]' type.
src/utils/pwa/backgroundSync.ts(130,26): error TS7006: Parameter 'operation' implicitly has an 'any' type.
src/utils/pwa/offlineDataValidator.ts(119,23): error TS7006: Parameter 'tableName' implicitly has an 'any' type.
src/utils/pwa/offlineDataValidator.ts(121,21): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'VioletVaultDB'.
src/utils/pwa/offlineDataValidator.ts(131,63): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/pwa/offlineDataValidator.ts(155,65): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/pwa/offlineDataValidator.ts(181,54): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/pwa/patchNotesManager.ts(52,49): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/pwa/patchNotesManager.ts(62,33): error TS7006: Parameter 'version' implicitly has an 'any' type.
src/utils/pwa/patchNotesManager.ts(75,23): error TS7006: Parameter 'changelog' implicitly has an 'any' type.
src/utils/pwa/patchNotesManager.ts(75,34): error TS7006: Parameter 'version' implicitly has an 'any' type.
src/utils/pwa/patchNotesManager.ts(109,23): error TS7006: Parameter 'content' implicitly has an 'any' type.
src/utils/pwa/patchNotesManager.ts(109,32): error TS7006: Parameter 'version' implicitly has an 'any' type.
src/utils/pwa/patchNotesManager.ts(110,47): error TS7006: Parameter 'line' implicitly has an 'any' type.
src/utils/pwa/patchNotesManager.ts(194,20): error TS7006: Parameter 'patchNotes' implicitly has an 'any' type.
src/utils/pwa/patchNotesManager.ts(200,49): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/utils/pwa/patchNotesManager.ts(207,57): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/utils/pwa/patchNotesManager.ts(214,54): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/utils/pwa/patchNotesManager.ts(221,54): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/utils/pwa/patchNotesManager.ts(231,25): error TS7006: Parameter 'version' implicitly has an 'any' type.
src/utils/pwa/patchNotesManager.ts(287,57): error TS2531: Object is possibly 'null'.
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
src/utils/query/prefetchHelpers.ts(250,29): error TS7006: Parameter 'queryClient' implicitly has an 'any' type.
src/utils/query/prefetchHelpers.ts(299,35): error TS7006: Parameter 'queryClient' implicitly has an 'any' type.
src/utils/query/prefetchHelpers.ts(336,25): error TS7006: Parameter 'queryClient' implicitly has an 'any' type.
src/utils/query/prefetchHelpers.ts(336,38): error TS7006: Parameter 'currentRoute' implicitly has an 'any' type.
src/utils/query/prefetchHelpers.ts(359,24): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ "/": string[]; "/envelopes": string[]; "/transactions": string[]; "/bills": string[]; "/analytics": string[]; "/goals": string[]; }'.
src/utils/query/prefetchHelpers.ts(363,15): error TS7006: Parameter 'entity' implicitly has an 'any' type.
src/utils/query/prefetchHelpers.ts(363,26): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ dashboard: () => Promise<void | null>; envelopes: () => Promise<void | null>; transactions: () => Promise<void | null>; bills: () => Promise<void | null>; analytics: () => Promise<...>; savingsGoals: () => Promise<...>; }'.
src/utils/query/prefetchHelpers.ts(365,15): error TS7006: Parameter 'fn' implicitly has an 'any' type.
src/utils/query/queryClientConfig.ts(125,22): error TS7006: Parameter 'entityType' implicitly has an 'any' type.
src/utils/query/queryClientConfig.ts(149,24): error TS7006: Parameter 'queryKey' implicitly has an 'any' type.
src/utils/query/queryClientConfig.ts(149,34): error TS7006: Parameter 'queryFn' implicitly has an 'any' type.
src/utils/query/queryClientConfig.ts(160,16): error TS18046: 'error' is of type 'unknown'.
src/utils/query/queryClientConfig.ts(170,21): error TS7006: Parameter 'queryKeys' implicitly has an 'any' type.
src/utils/query/queryClientConfig.ts(171,24): error TS7006: Parameter 'queryKey' implicitly has an 'any' type.
src/utils/query/queryClientConfig.ts(180,18): error TS7006: Parameter 'queryKey' implicitly has an 'any' type.
src/utils/query/queryClientConfig.ts(187,22): error TS7006: Parameter 'queryKey' implicitly has an 'any' type.
src/utils/query/queryClientConfig.ts(187,32): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/utils/query/queryClientConfig.ts(194,16): error TS18046: 'error' is of type 'unknown'.
src/utils/receipts/receiptHelpers.ts(161,39): error TS7006: Parameter 'receiptData' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.ts(174,42): error TS7006: Parameter 'merchant' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.ts(174,52): error TS7006: Parameter 'date' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.ts(174,58): error TS7006: Parameter 'total' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.ts(189,39): error TS7006: Parameter 'receiptData' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.ts(189,52): error TS7006: Parameter 'transactionForm' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.ts(223,43): error TS7006: Parameter '_field' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.ts(223,51): error TS7006: Parameter 'confidence' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.ts(231,16): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ high: { color: string; iconName: string; }; medium: { color: string; iconName: string; }; low: { color: string; iconName: string; }; none: { color: string; iconName: string; }; }'.
src/utils/savings/savingsCalculations.ts(240,12): error TS18046: 'bVal' is of type 'unknown'.
src/utils/savings/savingsCalculations.ts(240,19): error TS18046: 'aVal' is of type 'unknown'.
src/utils/savings/savingsCalculations.ts(240,30): error TS18046: 'bVal' is of type 'unknown'.
src/utils/savings/savingsCalculations.ts(240,37): error TS18046: 'aVal' is of type 'unknown'.
src/utils/savings/savingsCalculations.ts(242,10): error TS18046: 'aVal' is of type 'unknown'.
src/utils/savings/savingsCalculations.ts(242,17): error TS18046: 'bVal' is of type 'unknown'.
src/utils/savings/savingsCalculations.ts(242,28): error TS18046: 'aVal' is of type 'unknown'.
src/utils/savings/savingsCalculations.ts(242,35): error TS18046: 'bVal' is of type 'unknown'.
src/utils/savings/savingsFormUtils.ts(49,25): error TS2339: Property 'name' does not exist on type 'never'.
src/utils/savings/savingsFormUtils.ts(50,33): error TS2339: Property 'targetAmount' does not exist on type 'never'.
src/utils/savings/savingsFormUtils.ts(51,34): error TS2339: Property 'currentAmount' does not exist on type 'never'.
src/utils/savings/savingsFormUtils.ts(52,31): error TS2339: Property 'targetDate' does not exist on type 'never'.
src/utils/savings/savingsFormUtils.ts(53,29): error TS2339: Property 'category' does not exist on type 'never'.
src/utils/savings/savingsFormUtils.ts(54,26): error TS2339: Property 'color' does not exist on type 'never'.
src/utils/savings/savingsFormUtils.ts(55,32): error TS2339: Property 'description' does not exist on type 'never'.
src/utils/savings/savingsFormUtils.ts(56,29): error TS2339: Property 'priority' does not exist on type 'never'.
src/utils/savings/savingsFormUtils.ts(186,23): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ high: number; medium: number; low: number; }'.
  No index signature with a parameter of type 'string' was found on type '{ high: number; medium: number; low: number; }'.
src/utils/savings/savingsFormUtils.ts(190,24): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ high: number; medium: number; low: number; }'.
  No index signature with a parameter of type 'string' was found on type '{ high: number; medium: number; low: number; }'.
src/utils/savings/savingsFormUtils.ts(284,47): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/security/cryptoCompat.ts(23,54): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/security/cryptoCompat.ts(61,43): error TS7006: Parameter 'operation' implicitly has an 'any' type.
src/utils/security/cryptoCompat.ts(61,54): error TS7019: Rest parameter 'args' implicitly has an 'any[]' type.
src/utils/security/cryptoCompat.ts(69,16): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'SubtleCrypto'.
src/utils/security/cryptoCompat.ts(73,18): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'SubtleCrypto'.
src/utils/security/cryptoCompat.ts(85,32): error TS7006: Parameter 'length' implicitly has an 'any' type.
src/utils/security/cryptoCompat.ts(129,49): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/security/errorViewer.ts(52,21): error TS7006: Parameter 'error' implicitly has an 'any' type.
src/utils/security/errorViewer.ts(52,28): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/utils/security/errorViewer.ts(96,21): error TS7006: Parameter 'error' implicitly has an 'any' type.
src/utils/security/errorViewer.ts(96,28): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/utils/security/errorViewer.ts(103,14): error TS7006: Parameter 'timestamp' implicitly has an 'any' type.
src/utils/security/errorViewer.ts(129,21): error TS7006: Parameter 'error' implicitly has an 'any' type.
src/utils/security/errorViewer.ts(129,28): error TS7006: Parameter 'index' implicitly has an 'any' type.
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
src/utils/security/shareCodeUtils.ts(53,21): error TS7006: Parameter 'shareCode' implicitly has an 'any' type.
src/utils/security/shareCodeUtils.ts(110,22): error TS7006: Parameter 'shareCode' implicitly has an 'any' type.
src/utils/security/shareCodeUtils.ts(122,26): error TS7006: Parameter 'password' implicitly has an 'any' type.
src/utils/security/shareCodeUtils.ts(122,36): error TS7006: Parameter 'shareCode' implicitly has an 'any' type.
src/utils/security/shareCodeUtils.ts(165,18): error TS7006: Parameter 'shareCode' implicitly has an 'any' type.
src/utils/security/shareCodeUtils.ts(187,22): error TS2339: Property 'userName' does not exist on type 'never'.
src/utils/security/shareCodeUtils.ts(188,38): error TS2339: Property 'userName' does not exist on type 'never'.
src/utils/security/shareCodeUtils.ts(189,41): error TS2339: Property 'userColor' does not exist on type 'never'.
src/utils/security/shareCodeUtils.ts(201,15): error TS7006: Parameter 'qrData' implicitly has an 'any' type.
src/utils/security/shareCodeUtils.ts(248,20): error TS7006: Parameter 'shareCode' implicitly has an 'any' type.
src/utils/security/shareCodeUtils.ts(258,13): error TS7006: Parameter 'word' implicitly has an 'any' type.
src/utils/services/editLockHelpers.ts(11,43): error TS7006: Parameter 'budgetId' implicitly has an 'any' type.
src/utils/services/editLockHelpers.ts(11,53): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/utils/services/editLockHelpers.ts(11,66): error TS7006: Parameter 'auth' implicitly has an 'any' type.
src/utils/services/editLockHelpers.ts(29,32): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/utils/services/editLockHelpers.ts(67,42): error TS7006: Parameter 'existingLock' implicitly has an 'any' type.
src/utils/services/editLockHelpers.ts(67,56): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/utils/services/editLockHelpers.ts(67,69): error TS7006: Parameter 'releaseLockFn' implicitly has an 'any' type.
src/utils/services/editLockHelpers.ts(115,33): error TS7006: Parameter 'error' implicitly has an 'any' type.
src/utils/services/editLockHelpers.ts(115,40): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/utils/services/editLockHelpers.ts(115,53): error TS7006: Parameter 'budgetId' implicitly has an 'any' type.
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
src/utils/sync/RetryManager.ts(24,17): error TS7006: Parameter 'operation' implicitly has an 'any' type.
src/utils/sync/RetryManager.ts(45,22): error TS7006: Parameter 'operations' implicitly has an 'any' type.
src/utils/sync/RetryManager.ts(83,21): error TS7006: Parameter 'options' implicitly has an 'any' type.
src/utils/sync/RetryManager.ts(98,27): error TS7006: Parameter 'operation' implicitly has an 'any' type.
src/utils/sync/RetryManager.ts(98,38): error TS7006: Parameter 'config' implicitly has an 'any' type.
src/utils/sync/RetryManager.ts(98,46): error TS7006: Parameter 'attempt' implicitly has an 'any' type.
src/utils/sync/RetryManager.ts(109,17): error TS7006: Parameter 'attempt' implicitly has an 'any' type.
src/utils/sync/RetryManager.ts(118,24): error TS7006: Parameter 'error' implicitly has an 'any' type.
src/utils/sync/RetryManager.ts(118,31): error TS7006: Parameter 'config' implicitly has an 'any' type.
src/utils/sync/RetryManager.ts(118,39): error TS7006: Parameter 'attempt' implicitly has an 'any' type.
src/utils/sync/SyncMutex.ts(71,15): error TS2339: Property 'resolve' does not exist on type '{ resolve: () => void; operationName: string; } | undefined'.
src/utils/sync/SyncMutex.ts(80,18): error TS7006: Parameter 'duration' implicitly has an 'any' type.
src/utils/sync/SyncQueue.ts(79,39): error TS2345: Argument of type 'QueueItem<T>' is not assignable to parameter of type 'QueueItem<unknown>'.
  Types of property 'operation' are incompatible.
    Type '(data: T) => Promise<unknown>' is not assignable to type '(data: unknown) => Promise<unknown>'.
      Types of parameters 'data' and 'data' are incompatible.
        Type 'unknown' is not assignable to type 'T'.
          'T' could be instantiated with an arbitrary type which could be unrelated to 'unknown'.
src/utils/sync/autoBackupService.ts(93,18): error TS18048: 'backup.metadata' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(94,31): error TS18048: 'backup.metadata' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(197,15): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(197,72): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(198,15): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(198,78): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(199,15): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(199,64): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(200,15): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(200,64): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(201,15): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(201,78): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(202,15): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(203,52): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(206,15): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/autoBackupService.ts(209,19): error TS18048: 'data' is possibly 'undefined'.
src/utils/sync/dataDetectionHelper.ts(104,48): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/masterSyncValidator.ts(517,16): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/masterSyncValidator.ts(536,16): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/masterSyncValidator.ts(568,14): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/resilience/index.ts(52,19): error TS7006: Parameter 'operation' implicitly has an 'any' type.
src/utils/sync/retryMetrics.ts(24,36): error TS7006: Parameter 'metrics' implicitly has an 'any' type.
src/utils/sync/retryMetrics.ts(24,45): error TS7006: Parameter 'attempt' implicitly has an 'any' type.
src/utils/sync/retryMetrics.ts(38,35): error TS7006: Parameter 'metrics' implicitly has an 'any' type.
src/utils/sync/retryMetrics.ts(38,44): error TS7006: Parameter 'errorType' implicitly has an 'any' type.
src/utils/sync/retryMetrics.ts(45,41): error TS7006: Parameter 'metrics' implicitly has an 'any' type.
src/utils/sync/retryMetrics.ts(53,38): error TS7006: Parameter 'metrics' implicitly has an 'any' type.
src/utils/sync/retryMetrics.ts(62,36): error TS7006: Parameter 'metrics' implicitly has an 'any' type.
src/utils/sync/retryMetrics.ts(71,31): error TS7006: Parameter 'metrics' implicitly has an 'any' type.
src/utils/sync/retryMetrics.ts(81,30): error TS7006: Parameter 'metrics' implicitly has an 'any' type.
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
src/utils/sync/syncFlowValidator.ts(305,11): error TS2345: Argument of type 'DataCollection | null' is not assignable to parameter of type 'DataCollection'.
  Type 'null' is not assignable to type 'DataCollection'.
src/utils/sync/syncHealthChecker.ts(26,40): error TS7006: Parameter 'results' implicitly has an 'any' type.
src/utils/sync/syncHealthChecker.ts(80,14): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/syncHealthChecker.ts(120,14): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/syncHealthChecker.ts(160,14): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/syncHealthChecker.ts(195,14): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/syncHealthChecker.ts(225,14): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/syncHealthChecker.ts(261,14): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/syncHealthChecker.ts(290,14): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/syncHealthChecker.ts(317,14): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/syncHealthChecker.ts(331,26): error TS7006: Parameter 'test' implicitly has an 'any' type.
src/utils/sync/validation/checksumUtils.ts(15,40): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/utils/sync/validation/checksumUtils.ts(51,59): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/validation/checksumUtils.ts(62,40): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/utils/sync/validation/checksumUtils.ts(62,46): error TS7006: Parameter 'expectedChecksum' implicitly has an 'any' type.
src/utils/sync/validation/checksumUtils.ts(87,58): error TS18046: 'error' is of type 'unknown'.
src/utils/sync/validation/encryptedDataValidator.ts(14,39): error TS7006: Parameter 'encryptedData' implicitly has an 'any' type.
src/utils/sync/validation/encryptedDataValidator.ts(16,9): error TS7034: Variable 'warnings' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/utils/sync/validation/encryptedDataValidator.ts(21,38): error TS7005: Variable 'warnings' implicitly has an 'any[]' type.
src/utils/sync/validation/encryptedDataValidator.ts(34,38): error TS7005: Variable 'warnings' implicitly has an 'any[]' type.
src/utils/sync/validation/encryptedDataValidator.ts(37,63): error TS7005: Variable 'warnings' implicitly has an 'any[]' type.
src/utils/sync/validation/encryptedDataValidator.ts(44,29): error TS7006: Parameter 'encryptedData' implicitly has an 'any' type.
src/utils/sync/validation/encryptedDataValidator.ts(44,44): error TS7006: Parameter 'operation' implicitly has an 'any' type.
src/utils/sync/validation/encryptedDataValidator.ts(44,55): error TS7006: Parameter 'errors' implicitly has an 'any' type.
src/utils/sync/validation/encryptedDataValidator.ts(44,63): error TS7006: Parameter 'warnings' implicitly has an 'any' type.
src/utils/sync/validation/encryptedDataValidator.ts(76,43): error TS18046: 'validationError' is of type 'unknown'.
src/utils/sync/validation/encryptedDataValidator.ts(85,33): error TS7006: Parameter 'encryptedData' implicitly has an 'any' type.
src/utils/sync/validation/encryptedDataValidator.ts(85,48): error TS7006: Parameter 'errors' implicitly has an 'any' type.
src/utils/sync/validation/encryptedDataValidator.ts(85,56): error TS7006: Parameter 'warnings' implicitly has an 'any' type.
src/utils/sync/validation/encryptedDataValidator.ts(85,66): error TS7006: Parameter 'operation' implicitly has an 'any' type.
src/utils/testing/storeTestUtils.ts(58,13): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'unknown'.
  No index signature with a parameter of type 'string' was found on type 'unknown'.
src/utils/testing/storeTestUtils.ts(72,16): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'unknown'.
  No index signature with a parameter of type 'string' was found on type 'unknown'.
src/utils/transactions/fileParser.ts(23,3): error TS2411: Property 'date' of type 'string | undefined' is not assignable to 'string' index type 'string | number'.
src/utils/transactions/fileParser.ts(24,3): error TS2411: Property 'type' of type 'string | undefined' is not assignable to 'string' index type 'string | number'.
src/utils/transactions/fileParser.ts(25,3): error TS2411: Property 'amount' of type 'string | undefined' is not assignable to 'string' index type 'string | number'.
src/utils/transactions/fileParser.ts(26,3): error TS2411: Property 'id' of type 'string | undefined' is not assignable to 'string' index type 'string | number'.
src/utils/transactions/fileParser.ts(27,3): error TS2411: Property 'description' of type 'string | undefined' is not assignable to 'string' index type 'string | number'.
src/utils/transactions/fileParser.ts(28,3): error TS2411: Property 'notes' of type 'string | undefined' is not assignable to 'string' index type 'string | number'.
src/utils/transactions/operations.ts(61,39): error TS18046: 'error' is of type 'unknown'.
src/utils/transactions/splitting.ts(59,11): error TS18048: 'transaction.metadata.shipping' is possibly 'undefined'.
src/utils/transactions/splitting.ts(70,11): error TS18048: 'transaction.metadata.tax' is possibly 'undefined'.
src/utils/transactions/splitting.ts(81,7): error TS2322: Type '({ id: number; description: string; amount: number; category: string; envelopeId: string | number; isOriginalItem: boolean; originalItem: { name: string; price?: number | undefined; totalPrice?: number | undefined; category?: { ...; } | undefined; }; } | { ...; })[]' is not assignable to type 'SplitAllocation[]'.
  Type '{ id: number; description: string; amount: number; category: string; envelopeId: string | number; isOriginalItem: boolean; originalItem: { name: string; price?: number | undefined; totalPrice?: number | undefined; category?: { ...; } | undefined; }; } | { ...; }' is not assignable to type 'SplitAllocation'.
    Type '{ id: number; description: string; amount: number | undefined; category: string; envelopeId: string; isOriginalItem: boolean; }' is not assignable to type 'SplitAllocation'.
      Types of property 'amount' are incompatible.
        Type 'number | undefined' is not assignable to type 'number'.
          Type 'undefined' is not assignable to type 'number'.
src/utils/transactions/splitting.ts(141,14): error TS18046: 'error' is of type 'unknown'.
src/utils/transactions/splitting.ts(182,40): error TS18046: 'error' is of type 'unknown'.
src/utils/transactions/splitting.ts(432,58): error TS18046: 'error' is of type 'unknown'.
src/utils/ui/touchFeedback.ts(41,19): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ light: number[]; medium: number[]; heavy: number[]; tap: number[]; confirm: number[]; error: number[]; success: number[]; warning: number[]; navigation: number[]; select: number[]; longPress: number[]; }'.
  No index signature with a parameter of type 'string' was found on type '{ light: number[]; medium: number[]; heavy: number[]; tap: number[]; confirm: number[]; error: number[]; success: number[]; warning: number[]; navigation: number[]; select: number[]; longPress: number[]; }'.
src/utils/ui/touchFeedback.ts(100,36): error TS7006: Parameter 'originalHandler' implicitly has an 'any' type.
src/utils/ui/touchFeedback.ts(101,11): error TS7006: Parameter 'event' implicitly has an 'any' type.
src/utils/ui/touchFeedback.ts(115,34): error TS7006: Parameter 'baseClasses' implicitly has an 'any' type.
src/utils/ui/touchFeedback.ts(116,24): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ primary: string; secondary: string; card: string; small: string; tab: string; destructive: string; success: string; fab: string; envelope: string; navigation: string; comprehensive: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ primary: string; secondary: string; card: string; small: string; tab: string; destructive: string; success: string; fab: string; envelope: string; navigation: string; comprehensive: string; }'.
src/utils/ui/touchFeedback.ts(136,29): error TS7006: Parameter '_event' implicitly has an 'any' type.
src/utils/ui/touchFeedback.ts(140,24): error TS7006: Parameter 'originalHandler' implicitly has an 'any' type.
src/utils/ui/touchFeedback.ts(141,13): error TS7006: Parameter 'event' implicitly has an 'any' type.
src/utils/ui/touchFeedback.ts(157,16): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ primary: string; secondary: string; card: string; small: string; tab: string; destructive: string; success: string; fab: string; envelope: string; navigation: string; comprehensive: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ primary: string; secondary: string; card: string; small: string; tab: string; destructive: string; success: string; fab: string; envelope: string; navigation: string; comprehensive: string; }'.
```

