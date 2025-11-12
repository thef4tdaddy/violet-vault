# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 15 | 0 |
| TypeScript Errors | 0 | 0 |
| TypeScript Strict Mode Errors | 3217 | 0 |

*Last updated: 2025-11-12 14:06:19 UTC*

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
- 6 issues in `/home/runner/work/violet-vault/violet-vault/src/components/tips/TipCard.tsx`
- 5 issues in `/home/runner/work/violet-vault/violet-vault/src/components/tips/TipSettings.tsx`
- 2 issues in `/home/runner/work/violet-vault/violet-vault/src/services/tipService.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/tips/useUserStateForTips.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/components/tips/TipContainer.tsx`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 7 | `enforce-ui-library/enforce-ui-library` |
| 4 | `zustand-safe-patterns/zustand-selective-subscriptions` |
| 2 | `complexity` |
| 1 | `no-legacy-toast/no-legacy-toast` |
| 1 | `max-statements` |

### Detailed Lint Report
```
/home/runner/work/violet-vault/violet-vault/src/components/tips/TipCard.tsx:25:4 - 1 - Arrow function has a complexity of 17. Maximum allowed is 15. (complexity)
/home/runner/work/violet-vault/violet-vault/src/components/tips/TipCard.tsx:26:29 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
/home/runner/work/violet-vault/violet-vault/src/components/tips/TipCard.tsx:60:11 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
/home/runner/work/violet-vault/violet-vault/src/components/tips/TipCard.tsx:90:17 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
/home/runner/work/violet-vault/violet-vault/src/components/tips/TipCard.tsx:98:17 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
/home/runner/work/violet-vault/violet-vault/src/components/tips/TipCard.tsx:109:11 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
/home/runner/work/violet-vault/violet-vault/src/components/tips/TipContainer.tsx:34:39 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
/home/runner/work/violet-vault/violet-vault/src/components/tips/TipSettings.tsx:1:1 - 1 - Consider using the new toast system: const { showSuccess, showError, showWarning, showInfo, showUrgent } = useToast() (no-legacy-toast/no-legacy-toast)
/home/runner/work/violet-vault/violet-vault/src/components/tips/TipSettings.tsx:12:75 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
/home/runner/work/violet-vault/violet-vault/src/components/tips/TipSettings.tsx:55:11 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
/home/runner/work/violet-vault/violet-vault/src/components/tips/TipSettings.tsx:126:19 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
/home/runner/work/violet-vault/violet-vault/src/components/tips/TipSettings.tsx:141:9 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
/home/runner/work/violet-vault/violet-vault/src/hooks/tips/useUserStateForTips.ts:13:39 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
/home/runner/work/violet-vault/violet-vault/src/services/tipService.ts:51:3 - 1 - Method 'shouldShowTip' has a complexity of 22. Maximum allowed is 15. (complexity)
/home/runner/work/violet-vault/violet-vault/src/services/tipService.ts:51:23 - 1 - Method 'shouldShowTip' has too many statements (30). Maximum allowed is 25. (max-statements)
```

## Typecheck Audit

✅ **All files passed TypeScript type checking!**

Last check: 2025-11-12 14:06:02 UTC

## Typecheck Strict Mode Audit

### Files with Most Strict Mode Errors
- 28 errors in `src/services/chunkedSyncService.ts`
- 28 errors in `src/services/budgetHistoryService.ts`
- 27 errors in `src/services/editLockService.ts`
- 27 errors in `src/hooks/budgeting/useUnassignedCashDistribution.ts`
- 26 errors in `src/utils/common/billDiscovery.ts`
- 25 errors in `src/hooks/common/useConnectionManager/useConnectionOperations.ts`
- 25 errors in `src/hooks/auth/useKeyManagement.ts`
- 24 errors in `src/utils/security/keyExport.ts`
- 24 errors in `src/utils/common/transactionArchiving.ts`
- 24 errors in `src/hooks/transactions/useTransactionData.ts`
- 24 errors in `src/hooks/transactions/useTransactionAnalytics.ts`
- 23 errors in `src/hooks/bills/useBulkBillUpdate.ts`
- 23 errors in `src/components/onboarding/EmptyStateHints.tsx`
- 23 errors in `src/components/budgeting/SmartEnvelopeSuggestions.tsx`
- 22 errors in `src/utils/sync/validation/manifestValidator.ts`
- 22 errors in `src/hooks/common/useChartConfig.tsx`
- 22 errors in `src/components/budgeting/PaydayPrediction.tsx`
- 21 errors in `src/utils/bills/billUpdateHelpers.ts`
- 21 errors in `src/hooks/settings/useSettingsSectionRenderer.ts`
- 21 errors in `src/components/budgeting/paycheck/PaycheckForm.tsx`
- 20 errors in `src/utils/common/version.ts`
- 20 errors in `src/utils/budgeting/billEnvelopeCalculations.ts`
- 20 errors in `src/services/bugReport/githubApiService.ts`
- 20 errors in `src/hooks/debts/useDebtStrategies.ts`
- 20 errors in `src/hooks/dashboard/useMainDashboard.ts`
- 20 errors in `src/hooks/auth/useUserSetup.ts`
- 20 errors in `src/hooks/auth/useSecurityManagerUI.ts`
- 20 errors in `src/components/automation/AutoFundingDashboardComponents.tsx`
- 19 errors in `src/stores/ui/fabStore.ts`
- 19 errors in `src/hooks/common/useToast.ts`
- 19 errors in `src/hooks/common/useImportData.ts`
- 19 errors in `src/components/sync/ActivityBanner.tsx`
- 19 errors in `src/components/savings/AddEditGoalModal.tsx`
- 19 errors in `src/components/budgeting/EnvelopeSystem.tsx`
- 19 errors in `src/components/automation/AutoFundingViewComponents.tsx`
- 18 errors in `src/utils/receipts/receiptHelpers.tsx`
- 18 errors in `src/utils/common/frequencyCalculations.ts`
- 18 errors in `src/services/bugReport/reportSubmissionService.ts`
- 18 errors in `src/hooks/debts/useDebtForm.ts`
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
- 15 errors in `src/components/budgeting/CreateEnvelopeModal.tsx`
- 14 errors in `src/utils/sync/validation/encryptedDataValidator.ts`
- 14 errors in `src/utils/pwa/patchNotesManager.ts`
- 14 errors in `src/utils/layout/paycheckDeletionUtils.ts`
- 14 errors in `src/stores/ui/uiStore.ts`
- 14 errors in `src/hooks/receipts/useReceiptScanner.ts`
- 14 errors in `src/hooks/budgeting/useSmartSuggestions.ts`
- 14 errors in `src/components/sharing/steps/UserSetupStep.tsx`
- 14 errors in `src/components/dashboard/RecentTransactionsWidget.tsx`
- 14 errors in `src/components/dashboard/AccountBalanceOverview.tsx`
- 13 errors in `src/utils/settings/settingsHelpers.ts`
- 13 errors in `src/utils/security/optimizedSerialization.ts`
- 13 errors in `src/services/bugReport/performanceInfoService.ts`
- 13 errors in `src/services/authService.ts`
- 13 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts`
- 13 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts`
- 13 errors in `src/components/receipts/ReceiptToTransactionModal.tsx`
- 13 errors in `src/components/automation/AutoFundingDashboard.tsx`
- 12 errors in `src/utils/pwa/serviceWorkerDiagnostics.ts`
- 12 errors in `src/utils/debug/dataDiagnostic.ts`
- 12 errors in `src/utils/accounts/accountValidation.ts`
- 12 errors in `src/utils/accounts/accountHelpers.ts`
- 12 errors in `src/hooks/transactions/useTransactionImportProcessing.ts`
- 12 errors in `src/hooks/mobile/useFABLoadingStates.ts`
- 12 errors in `src/hooks/debts/useDebts.ts`
- 12 errors in `src/hooks/budgeting/usePaycheckForm.ts`
- 12 errors in `src/hooks/analytics/useReportExporter.ts`
- 12 errors in `src/hooks/accounts/useSupplementalAccounts.ts`
- 12 errors in `src/components/settings/SettingsDashboard.tsx`
- 12 errors in `src/components/debt/modals/DebtFormSections.tsx`
- 12 errors in `src/components/bills/SmartBillMatcher.tsx`
- 12 errors in `src/components/automation/tabs/RulesTabComponents.tsx`
- 11 errors in `src/utils/security/shareCodeUtils.ts`
- 11 errors in `src/utils/savings/savingsFormUtils.ts`
- 11 errors in `src/utils/bills/billDetailUtils.ts`
- 11 errors in `src/hooks/history/useBudgetHistoryViewer.ts`
- 11 errors in `src/hooks/debts/useDebtDashboard.ts`
- 11 errors in `src/hooks/analytics/useTrendAnalysis.ts`
- 11 errors in `src/components/transactions/splitter/SplitAllocationsSection.tsx`
- 11 errors in `src/components/transactions/import/ImportModal.tsx`
- 11 errors in `src/components/budgeting/suggestions/SuggestionSettings.tsx`
- 11 errors in `src/components/budgeting/shared/BillConnectionSelector.tsx`
- 11 errors in `src/components/budgeting/EnvelopeGrid.tsx`
- 11 errors in `src/components/bills/BillManager.tsx`
- 10 errors in `src/utils/sync/syncHealthChecker.ts`
- 10 errors in `src/utils/sync/RetryManager.ts`
- 10 errors in `src/utils/services/editLockHelpers.ts`
- 10 errors in `src/utils/query/queryClientConfig.ts`
- 10 errors in `src/utils/budgeting/envelopeFormUtils.ts`
- 10 errors in `src/hooks/notifications/useFirebaseMessaging.ts`
- 10 errors in `src/hooks/budgeting/autofunding/useExecutionStatistics.ts`
- 10 errors in `src/hooks/auth/useAuthCompatibility.ts`
- 10 errors in `src/hooks/analytics/queries/usePaycheckTrendsQuery.ts`
- 10 errors in `src/components/settings/sections/SecurityLoggingSection.tsx`
- 10 errors in `src/components/settings/sections/GeneralSettingsSection.tsx`
- 10 errors in `src/components/receipts/steps/ConfirmationStep.tsx`
- 10 errors in `src/components/pwa/UpdateAvailableModal.tsx`
- 10 errors in `src/components/budgeting/paycheck/PaycheckAllocationModes.tsx`
- 10 errors in `src/components/bills/modals/BulkUpdateConfirmModal.tsx`
- 10 errors in `src/components/bills/modals/BillDetailSections.tsx`
- 10 errors in `src/components/auth/AuthGateway.tsx`
- 9 errors in `src/utils/ui/touchFeedback.ts`
- 9 errors in `src/utils/sync/retryMetrics.ts`
- 9 errors in `src/utils/query/prefetchHelpers.ts`
- 9 errors in `src/utils/pwa/backgroundSync.ts`
- 9 errors in `src/utils/debug/syncDiagnostic.ts`
- 9 errors in `src/utils/debug/reactErrorDetector.ts`
- 9 errors in `src/utils/budgeting/envelopeMatching.ts`
- 9 errors in `src/utils/budgeting/autofunding/simulation.ts`
- 9 errors in `src/utils/analytics/trendHelpers.ts`
- 9 errors in `src/services/bugReport/uiStateService.ts`
- 9 errors in `src/hooks/debts/useDebtDetailModal.ts`
- 9 errors in `src/hooks/budgeting/useEnvelopeForm.ts`
- 9 errors in `src/hooks/budgeting/useEnvelopeCalculations.ts`
- 9 errors in `src/hooks/bills/useBillManager.ts`
- 9 errors in `src/hooks/auth/useAuthFlow.ts`
- 9 errors in `src/db/budgetDb.ts`
- 9 errors in `src/components/transactions/splitter/SplitAllocationRow.tsx`
- 9 errors in `src/components/savings/SavingsGoalCard.tsx`
- 9 errors in `src/components/onboarding/components/TutorialOverlay.tsx`
- 9 errors in `src/components/history/viewer/HistoryList.tsx`
- 9 errors in `src/components/debt/modals/UpcomingPaymentsModal.tsx`
- 9 errors in `src/components/automation/tabs/RulesTab.tsx`
- 8 errors in `src/utils/savings/savingsCalculations.ts`
- 8 errors in `src/utils/bills/recurringBillUtils.ts`
- 8 errors in `src/utils/auth/userSetupHelpers.tsx`
- 8 errors in `src/main.tsx`
- 8 errors in `src/hooks/transactions/helpers/transactionQueryHelpers.ts`
- 8 errors in `src/hooks/savings/useSavingsGoalsActions.ts`
- 8 errors in `src/hooks/common/useTransactionArchiving.ts`
- 8 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution.ts`
- 8 errors in `src/hooks/bills/useBulkBillOperations.ts`
- 8 errors in `src/components/transactions/components/TransactionRow.tsx`
- 8 errors in `src/components/sync/health/SyncHealthDetails.tsx`
- 8 errors in `src/components/layout/ViewRenderer.tsx`
- 8 errors in `src/components/dashboard/ReconcileTransactionModal.tsx`
- 8 errors in `src/components/budgeting/suggestions/SuggestionCard.tsx`
- 8 errors in `src/components/budgeting/DeleteEnvelopeModal.tsx`
- 8 errors in `src/components/bills/BulkUpdateBillRowComponents.tsx`
- 8 errors in `src/components/analytics/AnalyticsDashboard.tsx`
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
- 7 errors in `src/hooks/debts/useDebtModalLogic.ts`
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
- 7 errors in `src/components/modals/PasswordRotationModal.tsx`
- 7 errors in `src/components/layout/MainLayout.tsx`
- 7 errors in `src/components/history/viewer/ChangeDetails.tsx`
- 7 errors in `src/components/debt/ui/QuickPaymentForm.tsx`
- 7 errors in `src/components/budgeting/suggestions/SuggestionsList.tsx`
- 7 errors in `src/components/budgeting/paycheck/PaycheckAllocationPreview.tsx`
- 7 errors in `src/components/bills/modals/BillDetailModal.tsx`
- 7 errors in `src/components/bills/BulkUpdateEditor.tsx`
- 7 errors in `src/components/automation/tabs/HistoryTab.tsx`
- 7 errors in `src/components/automation/AutoFundingView.tsx`
- 7 errors in `src/components/auth/components/StepButtons.tsx`
- 7 errors in `src/components/auth/PasswordRotationModal.tsx`
- 7 errors in `src/components/auth/KeyManagementSettings.tsx`
- 7 errors in `src/App.tsx`
- 6 errors in `src/utils/transactions/splitting.ts`
- 6 errors in `src/utils/transactions/fileParser.ts`
- 6 errors in `src/utils/debts/debtDebugConfig.ts`
- 6 errors in `src/utils/dataManagement/validationUtils.ts`
- 6 errors in `src/utils/common/BaseMutex.ts`
- 6 errors in `src/utils/budgeting/envelopeStyles.ts`
- 6 errors in `src/services/firebaseSyncService.ts`
- 6 errors in `src/hooks/transactions/useTransactionLedger.ts`
- 6 errors in `src/hooks/common/useExportData.ts`
- 6 errors in `src/hooks/bills/useBillManagerUI.ts`
- 6 errors in `src/components/sharing/steps/ShareCodeStep.tsx`
- 6 errors in `src/components/settings/sections/AutoLockSettingsSection.tsx`
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
- 5 errors in `src/utils/debts/debtFormValidation.ts`
- 5 errors in `src/utils/dataManagement/dexieUtils.ts`
- 5 errors in `src/utils/budgeting/envelopeIntegrityChecker.ts`
- 5 errors in `src/utils/budgeting/autofunding/conditions.ts`
- 5 errors in `src/services/security/securityService.ts`
- 5 errors in `src/services/bugReport/pageDetectionService.ts`
- 5 errors in `src/hooks/transactions/useTransactionSplitter.ts`
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
- 5 errors in `src/components/savings/SavingsGoals.tsx`
- 5 errors in `src/components/receipts/steps/ReceiptDataStep.tsx`
- 5 errors in `src/components/receipts/steps/EnvelopeSelectionStep.tsx`
- 5 errors in `src/components/receipts/components/ReceiptUploadArea.tsx`
- 5 errors in `src/components/receipts/components/ExtractedDataField.tsx`
- 5 errors in `src/components/receipts/ReceiptButton.tsx`
- 5 errors in `src/components/pages/MainDashboard.tsx`
- 5 errors in `src/components/layout/SummaryCards.tsx`
- 5 errors in `src/components/budgeting/envelope/EnvelopeActions.tsx`
- 5 errors in `src/components/budgeting/PaycheckProcessor.tsx`
- 5 errors in `src/components/budgeting/EditEnvelopeModal.tsx`
- 5 errors in `src/components/bills/modals/BillDetailActions.tsx`
- 5 errors in `src/components/bills/BulkBillUpdateModal.tsx`
- 5 errors in `src/components/bills/BillManagerHeader.tsx`
- 5 errors in `src/components/automation/steps/config/SplitRemainderConfig.tsx`
- 5 errors in `src/components/automation/steps/config/PercentageConfig.tsx`
- 5 errors in `src/components/automation/steps/config/FixedAmountConfig.tsx`
- 5 errors in `src/components/automation/steps/RuleConfigurationStep.tsx`
- 5 errors in `src/components/auth/components/ReturningUserActions.tsx`
- 5 errors in `src/components/auth/ChangePasswordModal.tsx`
- 4 errors in `src/utils/sync/retryUtils.ts`
- 4 errors in `src/utils/sync/retryPolicies.ts`
- 4 errors in `src/utils/pwa/pwaManager.ts`
- 4 errors in `src/utils/icons/index.ts`
- 4 errors in `src/utils/bills/billCalculations.ts`
- 4 errors in `src/services/keys/keyManagementService.ts`
- 4 errors in `src/services/bugReport/browserInfoService.ts`
- 4 errors in `src/hooks/mobile/usePullToRefresh.ts`
- 4 errors in `src/hooks/layout/usePaycheckOperations.ts`
- 4 errors in `src/hooks/common/useEditLock.ts`
- 4 errors in `src/hooks/common/useDataInitialization.ts`
- 4 errors in `src/hooks/budgeting/useBudgetHistoryQuery.ts`
- 4 errors in `src/hooks/budgeting/useBudgetData/queries.ts`
- 4 errors in `src/hooks/budgeting/autofunding/useAutoFunding.ts`
- 4 errors in `src/hooks/bills/useBillValidation.ts`
- 4 errors in `src/hooks/bills/useBillOperationWrappers.ts`
- 4 errors in `src/hooks/bills/useBillManagerHelpers.ts`
- 4 errors in `src/hooks/auth/mutations/useLoginMutations.ts`
- 4 errors in `src/components/transactions/ledger/TransactionLedgerHeader.tsx`
- 4 errors in `src/components/transactions/TransactionTable.tsx`
- 4 errors in `src/components/transactions/TransactionLedger.tsx`
- 4 errors in `src/components/sync/health/SyncStatusIndicator.tsx`
- 4 errors in `src/components/sync/SyncHealthDashboard.tsx`
- 4 errors in `src/components/settings/sections/SecurityStatusSection.tsx`
- 4 errors in `src/components/settings/archiving/ArchivingStatusOverview.tsx`
- 4 errors in `src/components/pwa/OfflineStatusIndicator.tsx`
- 4 errors in `src/components/onboarding/hooks/useTutorialHighlight.ts`
- 4 errors in `src/components/onboarding/hooks/useTutorialControls.ts`
- 4 errors in `src/components/layout/AppRoutes.tsx`
- 4 errors in `src/components/history/viewer/HistoryControls.tsx`
- 4 errors in `src/components/debt/ui/DebtList.tsx`
- 4 errors in `src/components/debt/modals/AddDebtModal.tsx`
- 4 errors in `src/components/budgeting/shared/EnvelopeTypeSelector.tsx`
- 4 errors in `src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx`
- 4 errors in `src/components/budgeting/BillEnvelopeFundingInfo.tsx`
- 4 errors in `src/components/auth/components/UserSetupHeader.tsx`
- 4 errors in `src/components/auth/components/ShareCodeDisplay.tsx`
- 4 errors in `src/components/auth/LocalOnlySetup.tsx`
- 4 errors in `src/components/analytics/trends/CategoryTrendsSection.tsx`
- 4 errors in `src/components/analytics/tabs/TrendsTab.tsx`
- 4 errors in `src/components/analytics/performance/PerformanceTabNavigation.tsx`
- 4 errors in `src/components/analytics/performance/PerformanceRecommendationsTab.tsx`
- 4 errors in `src/components/analytics/performance/PerformanceAlertsTab.tsx`
- 4 errors in `src/components/analytics/performance/MetricCard.tsx`
- 4 errors in `src/components/analytics/TrendAnalysisCharts.tsx`
- 3 errors in `src/utils/sync/masterSyncValidator.ts`
- 3 errors in `src/utils/budgeting/paycheckProcessing.ts`
- 3 errors in `src/utils/auth/shareCodeManager.ts`
- 3 errors in `src/utils/analytics/transactionAnalyzer.ts`
- 3 errors in `src/hooks/transactions/useTransactionsV2.ts`
- 3 errors in `src/hooks/sync/useFirebaseSync.ts`
- 3 errors in `src/hooks/mobile/useFABSmartPositioning.ts`
- 3 errors in `src/hooks/common/useNetworkStatus.ts`
- 3 errors in `src/hooks/common/bug-report/useBugReportSubmission.ts`
- 3 errors in `src/hooks/common/bug-report/useBugReportDiagnostics.ts`
- 3 errors in `src/hooks/budgeting/useBudgetData/mutationsHelpers.ts`
- 3 errors in `src/hooks/budgeting/autofunding/useUndoOperations.ts`
- 3 errors in `src/hooks/budgeting/autofunding/useAutoFundingData.ts`
- 3 errors in `src/hooks/auth/queries/usePasswordValidation.ts`
- 3 errors in `src/hooks/auth/mutations/usePasswordMutations.ts`
- 3 errors in `src/hooks/auth/mutations/useJoinBudgetMutation.ts`
- 3 errors in `src/hooks/analytics/useTransactionAnalysis.ts`
- 3 errors in `src/hooks/analytics/usePerformanceMonitor.ts`
- 3 errors in `src/hooks/analytics/useChartsAnalytics.ts`
- 3 errors in `src/components/transactions/splitter/SplitterHeader.tsx`
- 3 errors in `src/components/transactions/ledger/TransactionPagination.tsx`
- 3 errors in `src/components/transactions/TransactionSplitter.tsx`
- 3 errors in `src/components/sync/ConflictResolutionModal.tsx`
- 3 errors in `src/components/sharing/JoinBudgetModal.tsx`
- 3 errors in `src/components/settings/sections/SecuritySettingsSection.tsx`
- 3 errors in `src/components/settings/archiving/ArchivingPreviewResults.tsx`
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
- 3 errors in `src/components/analytics/performance/PerformanceTabContent.tsx`
- 3 errors in `src/components/analytics/performance/PerformanceOverviewTab.tsx`
- 3 errors in `src/components/analytics/components/AnalyticsHeader.tsx`
- 2 errors in `src/utils/testing/storeTestUtils.ts`
- 2 errors in `src/utils/sync/SyncMutex.ts`
- 2 errors in `src/utils/debts/calculations/nextPaymentDate.ts`
- 2 errors in `src/utils/debts/calculations/interestCalculation.ts`
- 2 errors in `src/utils/dataManagement/fileUtils.ts`
- 2 errors in `src/utils/common/lazyImport.ts`
- 2 errors in `src/utils/budgeting/envelopeCalculations.ts`
- 2 errors in `src/services/firebaseMessaging.ts`
- 2 errors in `src/services/bugReport/errorTrackingService.ts`
- 2 errors in `src/hooks/transactions/useTransactionTable.ts`
- 2 errors in `src/hooks/transactions/useTransactionQuery.ts`
- 2 errors in `src/hooks/transactions/useTransactionForm.ts`
- 2 errors in `src/hooks/transactions/useTransactionFileUpload.ts`
- 2 errors in `src/hooks/sharing/useShareCodeValidation.ts`
- 2 errors in `src/hooks/security/useSecuritySettingsLogic.ts`
- 2 errors in `src/hooks/mobile/useBottomNavigation.ts`
- 2 errors in `src/hooks/common/useTransactions.ts`
- 2 errors in `src/hooks/common/useRouterPageDetection.ts`
- 2 errors in `src/hooks/budgeting/usePaydayPrediction.ts`
- 2 errors in `src/hooks/budgeting/usePaycheckHistory.ts`
- 2 errors in `src/hooks/budgeting/useEnvelopesQuery.ts`
- 2 errors in `src/hooks/budgeting/useBudgetData/utilities.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useExecutionHistory.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionSummary.ts`
- 2 errors in `src/hooks/auth/useSecurityManager.ts`
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
- 2 errors in `src/components/budgeting/EditEnvelopeModalComponents.tsx`
- 2 errors in `src/components/bills/smartBillMatcherHelpers.ts`
- 2 errors in `src/components/bills/BulkUpdateModeSelector.tsx`
- 2 errors in `src/components/bills/BillFormFields.tsx`
- 2 errors in `src/components/automation/steps/TriggerScheduleStep.tsx`
- 2 errors in `src/components/automation/components/StepNavigation.tsx`
- 2 errors in `src/components/auth/components/UserNameInput.tsx`
- 2 errors in `src/components/auth/components/ColorPicker.tsx`
- 2 errors in `src/components/auth/UserIndicator.tsx`
- 2 errors in `src/components/analytics/trends/SeasonalPatternsSection.tsx`
- 2 errors in `src/components/analytics/trends/InsightsPanel.tsx`
- 2 errors in `src/components/analytics/trends/HistoricalTrendsChart.tsx`
- 2 errors in `src/components/analytics/tabs/OverviewTab.tsx`
- 2 errors in `src/components/analytics/performance/PerformanceHeader.tsx`
- 2 errors in `src/components/analytics/PerformanceMonitor.tsx`
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
- 1 errors in `src/services/tipService.ts`
- 1 errors in `src/services/bugReport/apiService.ts`
- 1 errors in `src/services/activityLogger.ts`
- 1 errors in `src/hooks/transactions/useTransactionImport.ts`
- 1 errors in `src/hooks/sync/useSyncHealthIndicator.ts`
- 1 errors in `src/hooks/mobile/useSlideUpModal.ts`
- 1 errors in `src/hooks/layout/useLayoutData.ts`
- 1 errors in `src/hooks/debts/useDebtManagement.ts`
- 1 errors in `src/hooks/common/usePrompt.ts`
- 1 errors in `src/hooks/common/useConnectionManager/useConnectionConfig.ts`
- 1 errors in `src/hooks/common/useBugReport.ts`
- 1 errors in `src/hooks/budgeting/usePaycheckFormValidated.ts`
- 1 errors in `src/hooks/budgeting/useEnvelopes.ts`
- 1 errors in `src/hooks/budgeting/useBudgetData/queryFunctions.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingHistory.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts`
- 1 errors in `src/hooks/bills/useBills/index.ts`
- 1 errors in `src/hooks/bills/useBillOperations.ts`
- 1 errors in `src/hooks/auth/useKeyManagementUI.ts`
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
- 1 errors in `src/components/charts/TrendLineChart.tsx`
- 1 errors in `src/components/budgeting/envelope/hooks/useEnvelopeDisplayData.ts`
- 1 errors in `src/components/budgeting/envelope/EnvelopeSummary.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeGridView.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeActivitySummary.tsx`
- 1 errors in `src/components/budgeting/envelope/BillEnvelopeStatus.tsx`
- 1 errors in `src/components/budgeting/CashFlowSummary.tsx`
- 1 errors in `src/components/bills/modals/BillDetailStats.tsx`
- 1 errors in `src/components/bills/BillFormSections.tsx`
- 1 errors in `src/components/bills/BillDiscoveryModal.tsx`
- 1 errors in `src/components/auth/key-management/MainContent.tsx`
- 1 errors in `src/components/auth/components/UserSetupLayout.tsx`
- 1 errors in `src/components/auth/UserSetup.tsx`
- 1 errors in `src/components/analytics/trends/ForecastSummaryCard.tsx`
- 1 errors in `src/components/analytics/performance/OverallScore.tsx`
- 1 errors in `src/components/analytics/performance/MetricsGrid.tsx`
- 1 errors in `src/components/analytics/SmartCategoryManager.tsx`
- 1 errors in `src/components/analytics/ReportExporter.tsx`
- 1 errors in `src/components/analytics/CategorySuggestionsTab.tsx`

### Strict Mode Error Breakdown
| Count | Error Code |
|---|---|
| 1153 | `TS7006` |
| 860 | `TS7031` |
| 232 | `TS2345` |
| 211 | `TS2339` |
| 192 | `TS18046` |
| 133 | `TS2322` |
| 117 | `TS7053` |
| 81 | `TS18048` |
| 77 | `TS7005` |
| 44 | `TS7034` |
| 41 | `TS18047` |
| 24 | `TS2769` |
| 9 | `TS2353` |
| 6 | `TS2531` |
| 6 | `TS2411` |
| 4 | `TS2783` |
| 4 | `TS2722` |
| 4 | `TS2352` |
| 3 | `TS7019` |
| 3 | `TS2698` |
| 3 | `TS2538` |
| 2 | `TS7022` |
| 1 | `TS7023` |
| 1 | `TS7016` |
| 1 | `TS2774` |
| 1 | `TS2683` |
| 1 | `TS2532` |
| 1 | `TS2365` |
| 1 | `TS2349` |
| 1 | `TS18049` |

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
src/components/analytics/AnalyticsDashboard.tsx(168,5): error TS2322: Type 'unknown[]' is not assignable to type 'never[]'.
  Type 'unknown' is not assignable to type 'never'.
src/components/analytics/AnalyticsDashboard.tsx(169,5): error TS2322: Type 'unknown[]' is not assignable to type 'never[]'.
  Type 'unknown' is not assignable to type 'never'.
src/components/analytics/AnalyticsDashboard.tsx(459,15): error TS2322: Type '{ period: string; dateRange: { startDate: Date; endDate: Date; }; summary: { totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number; incomeTransactionCount: number; ... 4 more ...; expenseRatio: number; }; ... 10 more ...; _meta: { ...; }; } | undefined' is not assignable to type 'Record<string, unknown>'.
  Type 'undefined' is not assignable to type 'Record<string, unknown>'.
src/components/analytics/AnalyticsDashboard.tsx(460,15): error TS2322: Type '{ period: string; dateRange: { startDate: Date; endDate: Date; }; summary: { totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number; incomeTransactionCount: number; ... 4 more ...; expenseRatio: number; }; ... 10 more ...; _meta: { ...; }; } | undefined' is not assignable to type 'Record<string, unknown>'.
  Type 'undefined' is not assignable to type 'Record<string, unknown>'.
src/components/analytics/AnalyticsDashboard.tsx(461,15): error TS2322: Type '{ period: string; dateRange: { startDate: Date; endDate: Date; }; summary: { totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number; incomeTransactionCount: number; ... 4 more ...; expenseRatio: number; }; ... 10 more ...; _meta: { ...; }; } | undefined' is not assignable to type 'Record<string, unknown>'.
  Type 'undefined' is not assignable to type 'Record<string, unknown>'.
src/components/analytics/AnalyticsDashboard.tsx(462,15): error TS2322: Type '{ period: string; dateRange: { startDate: Date; endDate: Date; }; summary: { totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number; incomeTransactionCount: number; ... 4 more ...; expenseRatio: number; }; ... 10 more ...; _meta: { ...; }; } | undefined' is not assignable to type 'Record<string, unknown>'.
  Type 'undefined' is not assignable to type 'Record<string, unknown>'.
src/components/analytics/AnalyticsDashboard.tsx(463,15): error TS2322: Type '{ period: string; dateRange: { startDate: Date; endDate: Date; }; summary: { totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number; incomeTransactionCount: number; ... 4 more ...; expenseRatio: number; }; ... 10 more ...; _meta: { ...; }; } | undefined' is not assignable to type 'Record<string, unknown>'.
  Type 'undefined' is not assignable to type 'Record<string, unknown>'.
src/components/analytics/AnalyticsDashboard.tsx(465,13): error TS2322: Type '{ period: string; dateRange: { startDate: Date; endDate: Date; }; summary: { totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number; incomeTransactionCount: number; ... 4 more ...; expenseRatio: number; }; ... 10 more ...; _meta: { ...; }; } | undefined' is not assignable to type 'Record<string, unknown>'.
  Type 'undefined' is not assignable to type 'Record<string, unknown>'.
src/components/analytics/CategorySuggestionsTab.tsx(93,32): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/analytics/PerformanceMonitor.tsx(13,31): error TS7031: Binding element 'analyticsData' implicitly has an 'any' type.
src/components/analytics/PerformanceMonitor.tsx(13,46): error TS7031: Binding element 'balanceData' implicitly has an 'any' type.
src/components/analytics/ReportExporter.tsx(107,15): error TS2322: Type '{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: null; }' is not assignable to type 'Record<string, boolean>'.
  Property 'customDateRange' is incompatible with index signature.
    Type 'null' is not assignable to type 'boolean'.
src/components/analytics/SmartCategoryManager.tsx(120,9): error TS2322: Type '(tabId: CategoryTabId) => void' is not assignable to type '(tabId: string) => void'.
  Types of parameters 'tabId' and 'tabId' are incompatible.
    Type 'string' is not assignable to type 'CategoryTabId'.
src/components/analytics/TrendAnalysisCharts.tsx(20,32): error TS7031: Binding element 'analyticsData' implicitly has an 'any' type.
src/components/analytics/TrendAnalysisCharts.tsx(20,47): error TS7031: Binding element 'timeFilter' implicitly has an 'any' type.
src/components/analytics/TrendAnalysisCharts.tsx(36,30): error TS2322: Type '{ month: string; spending: number; income: number; net: number; forecast: boolean; }[]' is not assignable to type 'never[]'.
  Type '{ month: string; spending: number; income: number; net: number; forecast: boolean; }' is not assignable to type 'never'.
src/components/analytics/TrendAnalysisCharts.tsx(39,22): error TS2322: Type '{ month: any; change: number; percentChange: number; }[]' is not assignable to type 'never[]'.
  Type '{ month: any; change: number; percentChange: number; }' is not assignable to type 'never'.
src/components/analytics/components/AnalyticsHeader.tsx(9,28): error TS7031: Binding element 'dateRange' implicitly has an 'any' type.
src/components/analytics/components/AnalyticsHeader.tsx(9,39): error TS7031: Binding element 'handleDateRangeChange' implicitly has an 'any' type.
src/components/analytics/components/AnalyticsHeader.tsx(9,62): error TS7031: Binding element 'handleExport' implicitly has an 'any' type.
src/components/analytics/performance/MetricCard.tsx(9,23): error TS7031: Binding element 'title' implicitly has an 'any' type.
src/components/analytics/performance/MetricCard.tsx(9,30): error TS7031: Binding element 'score' implicitly has an 'any' type.
src/components/analytics/performance/MetricCard.tsx(9,37): error TS7031: Binding element 'iconName' implicitly has an 'any' type.
src/components/analytics/performance/MetricCard.tsx(9,47): error TS7031: Binding element 'description' implicitly has an 'any' type.
src/components/analytics/performance/MetricsGrid.tsx(7,24): error TS7031: Binding element 'performanceMetrics' implicitly has an 'any' type.
src/components/analytics/performance/OverallScore.tsx(7,25): error TS7031: Binding element 'score' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceAlertsTab.tsx(9,33): error TS7031: Binding element 'alerts' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceAlertsTab.tsx(12,28): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceAlertsTab.tsx(31,21): error TS7006: Parameter 'alert' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceAlertsTab.tsx(31,28): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceHeader.tsx(9,30): error TS7031: Binding element 'alertsEnabled' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceHeader.tsx(9,45): error TS7031: Binding element 'setAlertsEnabled' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceOverviewTab.tsx(8,35): error TS7031: Binding element 'performanceHistory' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceOverviewTab.tsx(17,49): error TS7006: Parameter 'entry' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceOverviewTab.tsx(17,56): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceRecommendationsTab.tsx(9,42): error TS7031: Binding element 'recommendations' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceRecommendationsTab.tsx(12,37): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceRecommendationsTab.tsx(31,30): error TS7006: Parameter 'rec' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceRecommendationsTab.tsx(31,35): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceTabContent.tsx(9,34): error TS7031: Binding element 'selectedMetric' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceTabContent.tsx(9,50): error TS7031: Binding element 'performanceHistory' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceTabContent.tsx(9,70): error TS7031: Binding element 'performanceMetrics' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceTabNavigation.tsx(10,3): error TS7031: Binding element 'selectedMetric' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceTabNavigation.tsx(11,3): error TS7031: Binding element 'setSelectedMetric' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceTabNavigation.tsx(12,3): error TS7031: Binding element 'alertsCount' implicitly has an 'any' type.
src/components/analytics/performance/PerformanceTabNavigation.tsx(13,3): error TS7031: Binding element 'recommendationsCount' implicitly has an 'any' type.
src/components/analytics/tabs/HealthTab.tsx(7,22): error TS7031: Binding element 'envelopeHealth' implicitly has an 'any' type.
src/components/analytics/tabs/HealthTab.tsx(7,38): error TS7031: Binding element 'budgetVsActual' implicitly has an 'any' type.
src/components/analytics/tabs/HealthTab.tsx(18,21): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/components/analytics/tabs/OverviewTab.tsx(7,24): error TS7031: Binding element 'monthlyTrends' implicitly has an 'any' type.
src/components/analytics/tabs/OverviewTab.tsx(7,39): error TS7031: Binding element 'envelopeSpending' implicitly has an 'any' type.
src/components/analytics/tabs/TrendsTab.tsx(8,22): error TS7031: Binding element 'chartType' implicitly has an 'any' type.
src/components/analytics/tabs/TrendsTab.tsx(8,33): error TS7031: Binding element 'handleChartTypeChange' implicitly has an 'any' type.
src/components/analytics/tabs/TrendsTab.tsx(8,56): error TS7031: Binding element 'monthlyTrends' implicitly has an 'any' type.
src/components/analytics/tabs/TrendsTab.tsx(8,71): error TS7031: Binding element 'weeklyPatterns' implicitly has an 'any' type.
src/components/analytics/trends/CategoryTrendsSection.tsx(4,34): error TS7031: Binding element 'categoryTrends' implicitly has an 'any' type.
src/components/analytics/trends/CategoryTrendsSection.tsx(5,29): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/components/analytics/trends/CategoryTrendsSection.tsx(14,30): error TS7006: Parameter 'category' implicitly has an 'any' type.
src/components/analytics/trends/CategoryTrendsSection.tsx(14,40): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/analytics/trends/ForecastSummaryCard.tsx(9,32): error TS7031: Binding element 'forecastInsights' implicitly has an 'any' type.
src/components/analytics/trends/HistoricalTrendsChart.tsx(18,29): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/components/analytics/trends/HistoricalTrendsChart.tsx(18,36): error TS7006: Parameter 'name' implicitly has an 'any' type.
src/components/analytics/trends/InsightsPanel.tsx(5,26): error TS7031: Binding element 'forecastInsights' implicitly has an 'any' type.
src/components/analytics/trends/InsightsPanel.tsx(5,44): error TS7031: Binding element 'insights' implicitly has an 'any' type.
src/components/analytics/trends/SeasonalPatternsSection.tsx(3,36): error TS7031: Binding element 'seasonalPatterns' implicitly has an 'any' type.
src/components/analytics/trends/SeasonalPatternsSection.tsx(11,32): error TS7006: Parameter 'season' implicitly has an 'any' type.
src/components/auth/AuthGateway.tsx(12,24): error TS7031: Binding element 'onSetupComplete' implicitly has an 'any' type.
src/components/auth/AuthGateway.tsx(12,41): error TS7031: Binding element 'onLocalOnlyReady' implicitly has an 'any' type.
src/components/auth/AuthGateway.tsx(24,23): error TS2345: Argument of type '"local-only"' is not assignable to parameter of type 'SetStateAction<null>'.
src/components/auth/AuthGateway.tsx(31,25): error TS2345: Argument of type '"standard"' is not assignable to parameter of type 'SetStateAction<null>'.
src/components/auth/AuthGateway.tsx(34,25): error TS2345: Argument of type '"standard"' is not assignable to parameter of type 'SetStateAction<null>'.
src/components/auth/AuthGateway.tsx(40,21): error TS2345: Argument of type '"standard"' is not assignable to parameter of type 'SetStateAction<null>'.
src/components/auth/AuthGateway.tsx(75,26): error TS7006: Parameter 'mode' implicitly has an 'any' type.
src/components/auth/AuthGateway.tsx(81,43): error TS2345: Argument of type '"standard"' is not assignable to parameter of type 'SetStateAction<null>'.
src/components/auth/AuthGateway.tsx(100,42): error TS2345: Argument of type '"standard"' is not assignable to parameter of type 'SetStateAction<null>'.
src/components/auth/AuthGateway.tsx(131,42): error TS2345: Argument of type '"local-only"' is not assignable to parameter of type 'SetStateAction<null>'.
src/components/auth/ChangePasswordModal.tsx(6,32): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/auth/ChangePasswordModal.tsx(6,40): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/auth/ChangePasswordModal.tsx(6,49): error TS7031: Binding element 'onChangePassword' implicitly has an 'any' type.
src/components/auth/ChangePasswordModal.tsx(16,31): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/auth/ChangePasswordModal.tsx(33,16): error TS18046: 'err' is of type 'unknown'.
src/components/auth/KeyManagementSettings.tsx(80,46): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Error'.
src/components/auth/KeyManagementSettings.tsx(88,40): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Error'.
src/components/auth/KeyManagementSettings.tsx(101,50): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Error'.
src/components/auth/KeyManagementSettings.tsx(119,9): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'null | undefined'.
  Type 'string' is not assignable to type 'null | undefined'.
src/components/auth/KeyManagementSettings.tsx(127,25): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Error'.
src/components/auth/KeyManagementSettings.tsx(137,50): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Error'.
src/components/auth/KeyManagementSettings.tsx(166,11): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/components/auth/LocalOnlySetup.tsx(58,47): error TS18046: 'err' is of type 'unknown'.
src/components/auth/LocalOnlySetup.tsx(65,27): error TS7031: Binding element 'onModeSelected' implicitly has an 'any' type.
src/components/auth/LocalOnlySetup.tsx(65,43): error TS7031: Binding element 'onSwitchToAuth' implicitly has an 'any' type.
src/components/auth/LocalOnlySetup.tsx(128,15): error TS2322: Type 'Dispatch<SetStateAction<null>>' is not assignable to type '(file: File | null) => void'.
  Types of parameters 'value' and 'file' are incompatible.
    Type 'File | null' is not assignable to type 'SetStateAction<null>'.
      Type 'File' is not assignable to type 'SetStateAction<null>'.
        Type 'File' provides no match for the signature '(prevState: null): null'.
src/components/auth/PasswordRotationModal.tsx(11,3): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/auth/PasswordRotationModal.tsx(12,3): error TS7031: Binding element 'newPassword' implicitly has an 'any' type.
src/components/auth/PasswordRotationModal.tsx(13,3): error TS7031: Binding element 'confirmPassword' implicitly has an 'any' type.
src/components/auth/PasswordRotationModal.tsx(14,3): error TS7031: Binding element 'setNewPassword' implicitly has an 'any' type.
src/components/auth/PasswordRotationModal.tsx(15,3): error TS7031: Binding element 'setConfirmPassword' implicitly has an 'any' type.
src/components/auth/PasswordRotationModal.tsx(16,3): error TS7031: Binding element 'onSubmit' implicitly has an 'any' type.
src/components/auth/PasswordRotationModal.tsx(17,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/auth/UserIndicator.tsx(71,23): error TS2349: This expression is not callable.
  Type 'never' has no call signatures.
src/components/auth/UserIndicator.tsx(116,11): error TS2322: Type '((updates: { [key: string]: unknown; userName: string; userColor: string; budgetId?: string | undefined; }) => Promise<void>) | undefined' is not assignable to type '(updates: Record<string, unknown>) => void | Promise<void>'.
  Type 'undefined' is not assignable to type '(updates: Record<string, unknown>) => void | Promise<void>'.
src/components/auth/UserSetup.tsx(59,36): error TS7006: Parameter 'joinData' implicitly has an 'any' type.
src/components/auth/components/ColorPicker.tsx(9,24): error TS7031: Binding element 'selectedColor' implicitly has an 'any' type.
src/components/auth/components/ColorPicker.tsx(9,39): error TS7031: Binding element 'onColorChange' implicitly has an 'any' type.
src/components/auth/components/ReturningUserActions.tsx(10,3): error TS7031: Binding element 'onSubmit' implicitly has an 'any' type.
src/components/auth/components/ReturningUserActions.tsx(11,3): error TS7031: Binding element 'onChangeProfile' implicitly has an 'any' type.
src/components/auth/components/ReturningUserActions.tsx(12,3): error TS7031: Binding element 'onStartFresh' implicitly has an 'any' type.
src/components/auth/components/ReturningUserActions.tsx(13,3): error TS7031: Binding element 'isLoading' implicitly has an 'any' type.
src/components/auth/components/ReturningUserActions.tsx(14,3): error TS7031: Binding element 'canSubmit' implicitly has an 'any' type.
src/components/auth/components/ShareCodeDisplay.tsx(10,29): error TS7031: Binding element 'shareCode' implicitly has an 'any' type.
src/components/auth/components/ShareCodeDisplay.tsx(10,40): error TS7031: Binding element 'onCreateBudget' implicitly has an 'any' type.
src/components/auth/components/ShareCodeDisplay.tsx(10,56): error TS7031: Binding element 'onBack' implicitly has an 'any' type.
src/components/auth/components/ShareCodeDisplay.tsx(10,64): error TS7031: Binding element 'isLoading' implicitly has an 'any' type.
src/components/auth/components/StepButtons.tsx(9,3): error TS7031: Binding element 'step' implicitly has an 'any' type.
src/components/auth/components/StepButtons.tsx(10,3): error TS7031: Binding element 'onContinue' implicitly has an 'any' type.
src/components/auth/components/StepButtons.tsx(11,3): error TS7031: Binding element 'onBack' implicitly has an 'any' type.
src/components/auth/components/StepButtons.tsx(12,3): error TS7031: Binding element 'onStartTracking' implicitly has an 'any' type.
src/components/auth/components/StepButtons.tsx(13,3): error TS7031: Binding element 'isLoading' implicitly has an 'any' type.
src/components/auth/components/StepButtons.tsx(14,3): error TS7031: Binding element 'canContinue' implicitly has an 'any' type.
src/components/auth/components/StepButtons.tsx(15,3): error TS7031: Binding element 'canStartTracking' implicitly has an 'any' type.
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
src/components/automation/AutoFundingDashboardComponents.tsx(7,35): error TS7031: Binding element 'rules' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(7,42): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(15,30): error TS7006: Parameter 'r' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(31,33): error TS7031: Binding element 'activeTab' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(31,44): error TS7031: Binding element 'setActiveTab' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(31,58): error TS7031: Binding element 'rules' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(31,65): error TS7031: Binding element 'executionHistory' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(62,3): error TS7031: Binding element 'activeTab' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(63,3): error TS7031: Binding element 'rules' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(64,3): error TS7031: Binding element 'executionHistory' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(65,3): error TS7031: Binding element 'showExecutionDetails' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(66,3): error TS7031: Binding element 'setShowExecutionDetails' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(67,3): error TS7031: Binding element 'handleCreateRule' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(68,3): error TS7031: Binding element 'handleEditRule' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(69,3): error TS7031: Binding element 'handleDeleteRule' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(70,3): error TS7031: Binding element 'handleToggleRule' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(71,3): error TS7031: Binding element 'handleExecuteRules' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(72,3): error TS7031: Binding element 'isExecuting' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(73,3): error TS7031: Binding element 'RulesTabComponent' implicitly has an 'any' type.
src/components/automation/AutoFundingDashboardComponents.tsx(74,3): error TS7031: Binding element 'HistoryTabComponent' implicitly has an 'any' type.
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
src/components/automation/AutoFundingViewComponents.tsx(6,30): error TS7031: Binding element 'rules' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(18,28): error TS7006: Parameter 'r' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(32,28): error TS7031: Binding element 'activeTab' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(32,39): error TS7031: Binding element 'setActiveTab' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(32,53): error TS7031: Binding element 'rules' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(32,60): error TS7031: Binding element 'displayHistory' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(63,3): error TS7031: Binding element 'activeTab' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(64,3): error TS7031: Binding element 'rules' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(65,3): error TS7031: Binding element 'displayHistory' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(66,3): error TS7031: Binding element 'showExecutionDetails' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(67,3): error TS7031: Binding element 'setShowExecutionDetails' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(68,3): error TS7031: Binding element 'handleCreateRule' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(69,3): error TS7031: Binding element 'handleEditRule' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(70,3): error TS7031: Binding element 'handleDeleteRule' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(71,3): error TS7031: Binding element 'handleToggleRule' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(72,3): error TS7031: Binding element 'handleExecuteRules' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(73,3): error TS7031: Binding element 'isExecuting' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(74,3): error TS7031: Binding element 'RulesTabComponent' implicitly has an 'any' type.
src/components/automation/AutoFundingViewComponents.tsx(75,3): error TS7031: Binding element 'HistoryTabComponent' implicitly has an 'any' type.
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
src/components/bills/BillManager.tsx(199,9): error TS2322: Type '(billsToAdd: Bill[]) => Promise<void>' is not assignable to type '(bills: BillEntity[]) => Promise<void>'.
  Types of parameters 'billsToAdd' and 'bills' are incompatible.
    Type 'BillEntity[]' is not assignable to type 'Bill[]'.
      Type 'BillEntity' is missing the following properties from type 'Bill': amount, dueDate
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
src/components/bills/SmartBillMatcher.tsx(8,29): error TS7031: Binding element 'bills' implicitly has an 'any' type.
src/components/bills/SmartBillMatcher.tsx(8,36): error TS7031: Binding element 'envelopes' implicitly has an 'any' type.
src/components/bills/SmartBillMatcher.tsx(8,47): error TS7031: Binding element 'onSuggestEnvelope' implicitly has an 'any' type.
src/components/bills/SmartBillMatcher.tsx(8,66): error TS7031: Binding element 'searchQuery' implicitly has an 'any' type.
src/components/bills/SmartBillMatcher.tsx(28,67): error TS2339: Property 'confidence' does not exist on type 'never'.
src/components/bills/SmartBillMatcher.tsx(32,34): error TS2339: Property 'envelope' does not exist on type 'never'.
src/components/bills/SmartBillMatcher.tsx(33,59): error TS2339: Property 'envelope' does not exist on type 'never'.
src/components/bills/SmartBillMatcher.tsx(39,56): error TS2339: Property 'envelope' does not exist on type 'never'.
src/components/bills/SmartBillMatcher.tsx(42,74): error TS2339: Property 'envelope' does not exist on type 'never'.
src/components/bills/SmartBillMatcher.tsx(43,70): error TS2339: Property 'reason' does not exist on type 'never'.
src/components/bills/SmartBillMatcher.tsx(50,32): error TS2339: Property 'confidence' does not exist on type 'never'.
src/components/bills/SmartBillMatcher.tsx(53,31): error TS2339: Property 'confidence' does not exist on type 'never'.
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
src/components/budgeting/BillEnvelopeFundingInfo.tsx(6,30): error TS7006: Parameter 'progress' implicitly has an 'any' type.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(14,28): error TS7006: Parameter 'days' implicitly has an 'any' type.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(101,47): error TS18048: 'nextBill.amount' is possibly 'undefined'.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(237,62): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'never[]'.
  Type 'unknown' is not assignable to type 'never'.
src/components/budgeting/CashFlowSummary.tsx(4,28): error TS7031: Binding element 'cashFlow' implicitly has an 'any' type.
src/components/budgeting/CreateEnvelopeModal.tsx(10,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/budgeting/CreateEnvelopeModal.tsx(11,3): error TS7031: Binding element 'onCreateEnvelope' implicitly has an 'any' type.
src/components/budgeting/CreateEnvelopeModal.tsx(12,3): error TS7031: Binding element 'onCreateBill' implicitly has an 'any' type.
src/components/budgeting/CreateEnvelopeModal.tsx(43,32): error TS7006: Parameter 'billId' implicitly has an 'any' type.
src/components/budgeting/CreateEnvelopeModal.tsx(46,55): error TS2339: Property 'id' does not exist on type 'never'.
src/components/budgeting/CreateEnvelopeModal.tsx(51,26): error TS2339: Property 'name' does not exist on type 'never'.
src/components/budgeting/CreateEnvelopeModal.tsx(51,47): error TS2339: Property 'provider' does not exist on type 'never'.
src/components/budgeting/CreateEnvelopeModal.tsx(52,30): error TS2339: Property 'category' does not exist on type 'never'.
src/components/budgeting/CreateEnvelopeModal.tsx(53,27): error TS2339: Property 'color' does not exist on type 'never'.
src/components/budgeting/CreateEnvelopeModal.tsx(54,31): error TS2339: Property 'frequency' does not exist on type 'never'.
src/components/budgeting/CreateEnvelopeModal.tsx(55,35): error TS2339: Property 'amount' does not exist on type 'never'.
src/components/budgeting/CreateEnvelopeModal.tsx(56,54): error TS2339: Property 'name' does not exist on type 'never'.
src/components/budgeting/CreateEnvelopeModal.tsx(56,75): error TS2339: Property 'provider' does not exist on type 'never'.
src/components/budgeting/CreateEnvelopeModal.tsx(82,13): error TS2322: Type 'string | boolean' is not assignable to type 'boolean'.
  Type 'string' is not assignable to type 'boolean'.
src/components/budgeting/CreateEnvelopeModal.tsx(111,13): error TS2322: Type 'string | boolean' is not assignable to type 'boolean'.
  Type 'string' is not assignable to type 'boolean'.
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
src/components/budgeting/EditEnvelopeModal.tsx(65,5): error TS2322: Type 'EnvelopeRef | null | undefined' is not assignable to type 'null | undefined'.
  Type 'EnvelopeRef' is not assignable to type 'null | undefined'.
src/components/budgeting/EditEnvelopeModal.tsx(66,5): error TS2322: Type 'unknown[]' is not assignable to type 'never[]'.
  Type 'unknown' is not assignable to type 'never'.
src/components/budgeting/EditEnvelopeModal.tsx(111,15): error TS2322: Type 'string | boolean' is not assignable to type 'boolean'.
  Type 'string' is not assignable to type 'boolean'.
src/components/budgeting/EditEnvelopeModal.tsx(149,13): error TS2322: Type 'LockDocument | null' is not assignable to type 'null | undefined'.
  Type 'LockDocument' is not assignable to type 'null | undefined'.
src/components/budgeting/EditEnvelopeModal.tsx(162,15): error TS2322: Type 'string | boolean' is not assignable to type 'boolean'.
  Type 'string' is not assignable to type 'boolean'.
src/components/budgeting/EditEnvelopeModalComponents.tsx(178,26): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/budgeting/EditEnvelopeModalComponents.tsx(179,11): error TS2322: Type '("savings" | "sinking_fund")[]' is not assignable to type 'never[]'.
  Type '"savings" | "sinking_fund"' is not assignable to type 'never'.
    Type '"savings"' is not assignable to type 'never'.
src/components/budgeting/EnvelopeGrid.tsx(3,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/budgeting/EnvelopeGrid.tsx(108,9): error TS2322: Type 'Envelope[]' is not assignable to type 'never[]'.
  Type 'Envelope' is not assignable to type 'never'.
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
src/components/budgeting/EnvelopeSystem.tsx(3,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/components/budgeting/EnvelopeSystem.tsx(34,26): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/budgeting/EnvelopeSystem.tsx(34,42): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/budgeting/EnvelopeSystem.tsx(35,24): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/budgeting/EnvelopeSystem.tsx(35,40): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/budgeting/EnvelopeSystem.tsx(36,33): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/budgeting/EnvelopeSystem.tsx(36,49): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/budgeting/EnvelopeSystem.tsx(37,29): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/budgeting/EnvelopeSystem.tsx(37,45): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/budgeting/EnvelopeSystem.tsx(74,19): error TS7006: Parameter 'currentEnvelopes' implicitly has an 'any' type.
src/components/budgeting/EnvelopeSystem.tsx(86,56): error TS2538: Type 'undefined' cannot be used as an index type.
src/components/budgeting/EnvelopeSystem.tsx(136,7): error TS2322: Type 'string' is not assignable to type 'null'.
src/components/budgeting/EnvelopeSystem.tsx(146,12): error TS7006: Parameter 'envelopeData' implicitly has an 'any' type.
src/components/budgeting/EnvelopeSystem.tsx(152,41): error TS18046: 'error' is of type 'unknown'.
src/components/budgeting/EnvelopeSystem.tsx(159,12): error TS7006: Parameter 'envelopeId' implicitly has an 'any' type.
src/components/budgeting/EnvelopeSystem.tsx(159,24): error TS7006: Parameter 'updates' implicitly has an 'any' type.
src/components/budgeting/EnvelopeSystem.tsx(165,41): error TS18046: 'error' is of type 'unknown'.
src/components/budgeting/EnvelopeSystem.tsx(172,12): error TS7006: Parameter 'envelopeId' implicitly has an 'any' type.
src/components/budgeting/EnvelopeSystem.tsx(178,41): error TS18046: 'error' is of type 'unknown'.
src/components/budgeting/PaycheckProcessor.tsx(20,3): error TS7031: Binding element 'onProcessPaycheck' implicitly has an 'any' type.
src/components/budgeting/PaycheckProcessor.tsx(21,3): error TS7031: Binding element 'onDeletePaycheck' implicitly has an 'any' type.
src/components/budgeting/PaycheckProcessor.tsx(22,3): error TS7031: Binding element 'currentUser' implicitly has an 'any' type.
src/components/budgeting/PaycheckProcessor.tsx(91,25): error TS7031: Binding element 'formHook' implicitly has an 'any' type.
src/components/budgeting/PaycheckProcessor.tsx(125,32): error TS7031: Binding element 'formHook' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(48,26): error TS7031: Binding element 'confidence' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(48,38): error TS7031: Binding element 'confidenceColor' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(67,29): error TS7031: Binding element 'prediction' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(67,41): error TS7031: Binding element 'daysUntil' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(67,52): error TS7031: Binding element 'formattedPrediction' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(67,73): error TS7031: Binding element 'confidenceColor' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(95,3): error TS7031: Binding element 'prediction' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(97,3): error TS7031: Binding element 'onProcessPaycheck' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(98,3): error TS7031: Binding element 'onPrepareEnvelopes' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(106,36): error TS18047: 'daysUntil' is possibly 'null'.
src/components/budgeting/PaydayPrediction.tsx(106,54): error TS18047: 'daysUntil' is possibly 'null'.
src/components/budgeting/PaydayPrediction.tsx(111,74): error TS2345: Argument of type 'number | null' is not assignable to parameter of type 'number'.
  Type 'null' is not assignable to type 'number'.
src/components/budgeting/PaydayPrediction.tsx(133,23): error TS7031: Binding element 'bgColor' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(133,32): error TS7031: Binding element 'borderColor' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(133,45): error TS7031: Binding element 'icon' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(133,51): error TS7031: Binding element 'iconColor' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(133,62): error TS7031: Binding element 'title' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(133,69): error TS7031: Binding element 'description' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(133,82): error TS7031: Binding element 'button' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(153,33): error TS7031: Binding element 'daysUntil' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(153,44): error TS7031: Binding element 'onProcessPaycheck' implicitly has an 'any' type.
src/components/budgeting/PaydayPrediction.tsx(153,63): error TS7031: Binding element 'onPrepareEnvelopes' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(10,22): error TS7031: Binding element 'isCollapsed' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(22,28): error TS7031: Binding element 'count' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(22,35): error TS7031: Binding element 'hasSuggestions' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(33,27): error TS7031: Binding element 'onClick' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(45,3): error TS7031: Binding element 'isCollapsed' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(46,3): error TS7031: Binding element 'toggleCollapse' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(47,3): error TS7031: Binding element 'hasSuggestions' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(48,3): error TS7031: Binding element 'suggestions' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(49,3): error TS7031: Binding element 'toggleSettings' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(78,26): error TS7031: Binding element 'suggestions' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(79,45): error TS7006: Parameter 's' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(103,3): error TS7031: Binding element 'showSettings' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(104,3): error TS7031: Binding element 'analysisSettings' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(105,3): error TS7031: Binding element 'updateAnalysisSettings' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(106,3): error TS7031: Binding element 'resetAnalysisSettings' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(107,3): error TS7031: Binding element 'refreshSuggestions' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(108,3): error TS7031: Binding element 'suggestionStats' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(109,3): error TS7031: Binding element 'suggestions' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(110,3): error TS7031: Binding element 'handleApplySuggestion' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(111,3): error TS7031: Binding element 'handleDismissSuggestion' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(137,3): error TS7031: Binding element 'onCreateEnvelope' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(138,3): error TS7031: Binding element 'onUpdateEnvelope' implicitly has an 'any' type.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(139,3): error TS7031: Binding element 'onDismissSuggestion' implicitly has an 'any' type.
src/components/budgeting/envelope/BillEnvelopeStatus.tsx(32,68): error TS2345: Argument of type 'Bill[]' is not assignable to parameter of type 'never[]'.
  Type 'Bill' is not assignable to type 'never'.
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
src/components/budgeting/envelope/EnvelopeItem.tsx(90,9): error TS2322: Type '((envelopeId: string) => void) | undefined' is not assignable to type '(envelopeId: string) => void'.
  Type 'undefined' is not assignable to type '(envelopeId: string) => void'.
src/components/budgeting/envelope/EnvelopeItem.tsx(91,9): error TS2322: Type '((envelope: Envelope) => void) | undefined' is not assignable to type '(envelope: Envelope) => void'.
  Type 'undefined' is not assignable to type '(envelope: Envelope) => void'.
src/components/budgeting/envelope/EnvelopeItem.tsx(92,9): error TS2322: Type '((envelope: Envelope) => void) | undefined' is not assignable to type '(envelope: Envelope) => void'.
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
src/components/budgeting/envelope/hooks/useEnvelopeDisplayData.ts(136,64): error TS2345: Argument of type 'Bill[]' is not assignable to parameter of type 'never[]'.
  Type 'Bill' is not assignable to type 'never'.
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
src/components/budgeting/paycheck/PaycheckForm.tsx(7,23): error TS7031: Binding element 'stats' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(7,30): error TS7031: Binding element 'payerName' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(40,33): error TS7031: Binding element 'value' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(40,40): error TS7031: Binding element 'checked' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(40,49): error TS7031: Binding element 'onChange' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(40,59): error TS7031: Binding element 'title' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(40,66): error TS7031: Binding element 'description' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(66,3): error TS7031: Binding element 'formData' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(67,3): error TS7031: Binding element 'errors' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(68,3): error TS7031: Binding element 'uniquePayers' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(69,3): error TS7031: Binding element 'selectedPayerStats' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(70,3): error TS7031: Binding element 'onUpdateField' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(71,3): error TS7031: Binding element 'onApplyPrediction' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(72,3): error TS7031: Binding element 'canSubmit' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(73,3): error TS7031: Binding element 'isLoading' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(74,3): error TS7031: Binding element 'onProcess' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(75,3): error TS7031: Binding element 'onReset' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(80,30): error TS7006: Parameter 'payerName' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(133,32): error TS7006: Parameter 'payer' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(156,24): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/budgeting/paycheck/PaycheckForm.tsx(163,24): error TS7006: Parameter 'e' implicitly has an 'any' type.
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
src/components/charts/CategoryBarChart.tsx(154,15): error TS2322: Type 'unknown' is not assignable to type 'Key | null | undefined'.
src/components/charts/CategoryBarChart.tsx(155,15): error TS2322: Type 'number[]' is not assignable to type 'number | [number, number, number, number] | undefined'.
  Type 'number[]' is not assignable to type '[number, number, number, number]'.
    Target requires 4 element(s) but source may have fewer.
src/components/charts/CategoryBarChart.tsx(157,15): error TS2783: 'fill' is specified more than once, so this usage will be overwritten.
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
src/components/debt/DebtDashboard.tsx(65,52): error TS2322: Type 'Dispatch<SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>>' is not assignable to type 'Dispatch<SetStateAction<Record<string, string | boolean>>>'.
  Type 'SetStateAction<Record<string, string | boolean>>' is not assignable to type 'SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>'.
    Type 'Record<string, string | boolean>' is not assignable to type 'SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>'.
      Type 'Record<string, string | boolean>' is missing the following properties from type '{ type: string; status: string; sortBy: string; sortOrder: string; }': type, status, sortBy, sortOrder
src/components/debt/DebtDashboard.tsx(121,9): error TS2322: Type 'DebtAccount[]' is not assignable to type 'never[]'.
  Type 'DebtAccount' is not assignable to type 'never'.
src/components/debt/DebtDashboardComponents.tsx(62,15): error TS2322: Type '(debt: DebtAccount) => void' is not assignable to type '(debt: DebtAccount | Debt) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/debt/DebtDashboardComponents.tsx(63,15): error TS2322: Type '(debt: DebtAccount, amount: number) => void' is not assignable to type '(debt: DebtAccount | Debt, amount: number) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/debt/DebtStrategies.tsx(14,27): error TS7031: Binding element 'debts' implicitly has an 'any' type.
src/components/debt/DebtStrategies.tsx(114,27): error TS2322: Type '{ extraPayment: number; avalanche: { monthsToPayoff: number; totalInterest: number; savings: number; timeSavings?: undefined; interestSavings?: undefined; } | { monthsToPayoff: number; totalInterest: number; timeSavings: number; interestSavings: number; savings?: undefined; }; snowball: { ...; } | { ...; }; }[]' is not assignable to type 'never[]'.
  Type '{ extraPayment: number; avalanche: { monthsToPayoff: number; totalInterest: number; savings: number; timeSavings?: undefined; interestSavings?: undefined; } | { monthsToPayoff: number; totalInterest: number; timeSavings: number; interestSavings: number; savings?: undefined; }; snowball: { monthsToPayoff: number; tot...' is not assignable to type 'never'.
src/components/debt/modals/AddDebtModal.tsx(12,25): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/debt/modals/AddDebtModal.tsx(12,33): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/debt/modals/AddDebtModal.tsx(12,42): error TS7031: Binding element 'onSubmit' implicitly has an 'any' type.
src/components/debt/modals/AddDebtModal.tsx(38,7): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/debt/modals/DebtDetailModal.tsx(71,27): error TS2322: Type '{ expectedPayoff: string; totalInterest: any; payoffDate: string; } | null' is not assignable to type '{ expectedPayoff: string; totalInterest: string; payoffDate: string; }'.
  Type 'null' is not assignable to type '{ expectedPayoff: string; totalInterest: string; payoffDate: string; }'.
src/components/debt/modals/DebtFormFields.tsx(94,11): error TS2322: Type 'string | null | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/debt/modals/DebtFormSections.tsx(8,33): error TS7031: Binding element 'formData' implicitly has an 'any' type.
src/components/debt/modals/DebtFormSections.tsx(8,43): error TS7031: Binding element 'setFormData' implicitly has an 'any' type.
src/components/debt/modals/DebtFormSections.tsx(8,56): error TS7031: Binding element 'errors' implicitly has an 'any' type.
src/components/debt/modals/DebtFormSections.tsx(8,64): error TS7031: Binding element 'canEdit' implicitly has an 'any' type.
src/components/debt/modals/DebtFormSections.tsx(66,40): error TS7031: Binding element 'formData' implicitly has an 'any' type.
src/components/debt/modals/DebtFormSections.tsx(66,50): error TS7031: Binding element 'setFormData' implicitly has an 'any' type.
src/components/debt/modals/DebtFormSections.tsx(66,63): error TS7031: Binding element 'errors' implicitly has an 'any' type.
src/components/debt/modals/DebtFormSections.tsx(66,71): error TS7031: Binding element 'canEdit' implicitly has an 'any' type.
src/components/debt/modals/DebtFormSections.tsx(158,38): error TS7031: Binding element 'formData' implicitly has an 'any' type.
src/components/debt/modals/DebtFormSections.tsx(158,48): error TS7031: Binding element 'setFormData' implicitly has an 'any' type.
src/components/debt/modals/DebtFormSections.tsx(158,61): error TS7031: Binding element 'errors' implicitly has an 'any' type.
src/components/debt/modals/DebtFormSections.tsx(158,69): error TS7031: Binding element 'canEdit' implicitly has an 'any' type.
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
src/components/layout/MainLayout.tsx(190,9): error TS2322: Type 'Dispatch<SetStateAction<null>>' is not assignable to type '(conflicts: unknown) => void'.
  Types of parameters 'value' and 'conflicts' are incompatible.
    Type 'unknown' is not assignable to type 'SetStateAction<null>'.
src/components/layout/MainLayout.tsx(205,54): error TS2322: Type '(id: number) => void' is not assignable to type '(id: string | number) => void'.
  Types of parameters 'id' and 'id' are incompatible.
    Type 'string | number' is not assignable to type 'number'.
      Type 'string' is not assignable to type 'number'.
src/components/layout/MainLayout.tsx(231,24): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(251,18): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ dashboard: string; envelopes: string; savings: string; supplemental: string; paycheck: string; bills: string; transactions: string; debts: string; analytics: string; automation: string; activity: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ dashboard: string; envelopes: string; savings: string; supplemental: string; paycheck: string; bills: string; transactions: string; debts: string; analytics: string; automation: string; activity: string; }'.
src/components/layout/MainLayout.tsx(282,20): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/layout/MainLayout.tsx(285,21): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
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
src/components/layout/ViewRenderer.tsx(95,11): error TS2322: Type 'Record<string, unknown>[]' is not assignable to type 'never[]'.
  Type 'Record<string, unknown>' is not assignable to type 'never'.
src/components/layout/ViewRenderer.tsx(96,11): error TS2322: Type 'Record<string, unknown>[]' is not assignable to type 'never[]'.
  Type 'Record<string, unknown>' is not assignable to type 'never'.
src/components/layout/ViewRenderer.tsx(235,9): error TS2322: Type 'Transaction[]' is not assignable to type 'Record<string, unknown>[]'.
  Type 'Transaction' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type 'Transaction'.
src/components/layout/ViewRenderer.tsx(244,9): error TS2322: Type 'Record<string, unknown>[]' is not assignable to type 'never[]'.
  Type 'Record<string, unknown>' is not assignable to type 'never'.
src/components/layout/ViewRenderer.tsx(265,9): error TS2322: Type 'Envelope[]' is not assignable to type 'never[]'.
  Type 'Envelope' is not assignable to type 'never'.
src/components/layout/ViewRenderer.tsx(266,9): error TS2322: Type 'PaycheckHistory[]' is not assignable to type 'never[]'.
  Type 'PaycheckHistory' is not assignable to type 'never'.
src/components/layout/ViewRenderer.tsx(276,9): error TS2322: Type 'Transaction[]' is not assignable to type 'never[]'.
  Type 'Transaction' is not assignable to type 'never'.
src/components/layout/ViewRenderer.tsx(277,9): error TS2322: Type 'Envelope[]' is not assignable to type 'never[]'.
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
src/components/modals/PasswordRotationModal.tsx(10,3): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/modals/PasswordRotationModal.tsx(11,3): error TS7031: Binding element 'newPassword' implicitly has an 'any' type.
src/components/modals/PasswordRotationModal.tsx(12,3): error TS7031: Binding element 'confirmPassword' implicitly has an 'any' type.
src/components/modals/PasswordRotationModal.tsx(13,3): error TS7031: Binding element 'onNewPasswordChange' implicitly has an 'any' type.
src/components/modals/PasswordRotationModal.tsx(14,3): error TS7031: Binding element 'onConfirmPasswordChange' implicitly has an 'any' type.
src/components/modals/PasswordRotationModal.tsx(15,3): error TS7031: Binding element 'onSubmit' implicitly has an 'any' type.
src/components/modals/PasswordRotationModal.tsx(16,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
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
src/components/modals/UnassignedCashModal.tsx(283,35): error TS2532: Object is possibly 'undefined'.
src/components/modals/UnassignedCashModal.tsx(323,37): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/modals/UnassignedCashModal.tsx(323,53): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/modals/UnassignedCashModal.tsx(324,36): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/components/modals/UnassignedCashModal.tsx(324,52): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/components/modals/UnassignedCashModal.tsx(361,7): error TS2322: Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'RefObject<HTMLDivElement>'.
  Type 'HTMLDivElement | null' is not assignable to type 'HTMLDivElement'.
    Type 'null' is not assignable to type 'HTMLDivElement'.
src/components/monitoring/HighlightLoader.tsx(22,63): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/components/onboarding/EmptyStateHints.tsx(14,15): error TS7006: Parameter 'onAction' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(14,25): error TS7006: Parameter '_markStepComplete' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(29,15): error TS7006: Parameter 'onAction' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(29,25): error TS7006: Parameter 'markStepComplete' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(49,15): error TS7006: Parameter 'onAction' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(49,25): error TS7006: Parameter 'markStepComplete' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(70,15): error TS7006: Parameter 'onAction' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(70,25): error TS7006: Parameter '_markStepComplete' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(86,15): error TS7006: Parameter 'onAction' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(86,25): error TS7006: Parameter '_markStepComplete' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(102,15): error TS7006: Parameter 'onAction' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(102,25): error TS7006: Parameter '_markStepComplete' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(118,15): error TS7006: Parameter 'onAction' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(118,25): error TS7006: Parameter 'markStepComplete' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(164,28): error TS7031: Binding element 'type' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(164,34): error TS7031: Binding element 'onAction' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(164,44): error TS7031: Binding element 'customMessage' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(164,59): error TS7031: Binding element 'customActions' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(178,18): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ bankBalance: { icon: string; title: string; message: string; actions: (onAction: any, _markStepComplete: any) => { label: string; onClick: any; primary: boolean; }[]; step: string; color: string; }; ... 5 more ...; linkedEnvelopes: { ...; }; }'.
src/components/onboarding/EmptyStateHints.tsx(189,46): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
src/components/onboarding/EmptyStateHints.tsx(213,81): error TS7006: Parameter 'action' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(213,89): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/onboarding/EmptyStateHints.tsx(219,37): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ blue: string; red: string; orange: string; green: string; purple: string; indigo: string; teal: string; }'.
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
src/components/pages/MainDashboard.tsx(63,30): error TS2345: Argument of type 'Envelope[]' is not assignable to parameter of type 'never[]'.
  Type 'Envelope' is not assignable to type 'never'.
src/components/pages/MainDashboard.tsx(79,52): error TS2345: Argument of type 'Transaction[]' is not assignable to parameter of type 'never[]'.
  Type 'Transaction' is not assignable to type 'never'.
src/components/pages/MainDashboard.tsx(81,38): error TS7006: Parameter 'newBalance' implicitly has an 'any' type.
src/components/pages/MainDashboard.tsx(159,9): error TS2322: Type '() => any[]' is not assignable to type '() => never[]'.
  Type 'any[]' is not assignable to type 'never[]'.
    Type 'any' is not assignable to type 'never'.
src/components/pages/MainDashboard.tsx(169,9): error TS2322: Type '() => any[]' is not assignable to type '() => never[]'.
  Type 'any[]' is not assignable to type 'never[]'.
    Type 'any' is not assignable to type 'never'.
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
src/components/savings/AddEditGoalModal.tsx(25,28): error TS7006: Parameter 'goal' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(36,27): error TS7006: Parameter 'formData' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(40,25): error TS7006: Parameter 'formData' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(51,29): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(51,37): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(51,46): error TS7031: Binding element 'onSubmit' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(62,25): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(65,53): error TS2339: Property 'id' does not exist on type 'never'.
src/components/savings/AddEditGoalModal.tsx(75,28): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(75,35): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(98,24): error TS7031: Binding element 'title' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(98,31): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(105,27): error TS7031: Binding element 'formData' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(105,37): error TS7031: Binding element 'updateFormField' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(180,23): error TS7006: Parameter 'color' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(195,24): error TS7031: Binding element 'selectedColor' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(195,39): error TS7031: Binding element 'onColorSelect' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(214,24): error TS7031: Binding element 'onCancel' implicitly has an 'any' type.
src/components/savings/AddEditGoalModal.tsx(214,34): error TS7031: Binding element 'isEdit' implicitly has an 'any' type.
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
src/components/settings/SettingsDashboard.tsx(28,3): error TS7031: Binding element 'isOpen' implicitly has an 'any' type.
src/components/settings/SettingsDashboard.tsx(29,3): error TS7031: Binding element 'onClose' implicitly has an 'any' type.
src/components/settings/SettingsDashboard.tsx(30,3): error TS7031: Binding element 'onExport' implicitly has an 'any' type.
src/components/settings/SettingsDashboard.tsx(31,3): error TS7031: Binding element 'onImport' implicitly has an 'any' type.
src/components/settings/SettingsDashboard.tsx(32,3): error TS7031: Binding element 'onLogout' implicitly has an 'any' type.
src/components/settings/SettingsDashboard.tsx(33,3): error TS7031: Binding element 'onResetEncryption' implicitly has an 'any' type.
src/components/settings/SettingsDashboard.tsx(34,3): error TS7031: Binding element 'onSync' implicitly has an 'any' type.
src/components/settings/SettingsDashboard.tsx(35,3): error TS7031: Binding element 'onChangePassword' implicitly has an 'any' type.
src/components/settings/SettingsDashboard.tsx(36,3): error TS7031: Binding element 'currentUser' implicitly has an 'any' type.
src/components/settings/SettingsDashboard.tsx(38,3): error TS7031: Binding element 'securityManager' implicitly has an 'any' type.
src/components/settings/SettingsDashboard.tsx(40,3): error TS7031: Binding element 'onUpdateProfile' implicitly has an 'any' type.
src/components/settings/SettingsDashboard.tsx(78,50): error TS7006: Parameter 'sectionId' implicitly has an 'any' type.
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
src/components/sync/ActivityBanner.tsx(43,30): error TS2339: Property 'timestamp' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(43,72): error TS2339: Property 'timestamp' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(55,28): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/sync/ActivityBanner.tsx(85,29): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/components/sync/ActivityBanner.tsx(105,38): error TS7006: Parameter 'activity' implicitly has an 'any' type.
src/components/sync/ActivityBanner.tsx(128,26): error TS7006: Parameter 'timestamp' implicitly has an 'any' type.
src/components/sync/ActivityBanner.tsx(145,77): error TS2339: Property 'id' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(145,96): error TS2339: Property 'id' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(220,31): error TS2339: Property 'id' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(225,54): error TS2339: Property 'color' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(228,31): error TS2339: Property 'userName' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(232,29): error TS2339: Property 'userName' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(253,59): error TS2339: Property 'type' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(256,40): error TS2339: Property 'id' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(258,88): error TS2339: Property 'type' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(266,51): error TS2339: Property 'timestamp' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(271,33): error TS2339: Property 'userColor' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(274,62): error TS2339: Property 'userColor' does not exist on type 'never'.
src/components/sync/ActivityBanner.tsx(277,39): error TS2339: Property 'userName' does not exist on type 'never'.
src/components/sync/ConflictResolutionModal.tsx(26,36): error TS7031: Binding element 'syncConflicts' implicitly has an 'any' type.
src/components/sync/ConflictResolutionModal.tsx(26,51): error TS7031: Binding element 'onResolveConflict' implicitly has an 'any' type.
src/components/sync/ConflictResolutionModal.tsx(26,70): error TS7031: Binding element 'onDismiss' implicitly has an 'any' type.
src/components/sync/SyncHealthDashboard.tsx(68,27): error TS7006: Parameter 'status' implicitly has an 'any' type.
src/components/sync/SyncHealthDashboard.tsx(88,26): error TS7006: Parameter 'status' implicitly has an 'any' type.
src/components/sync/SyncHealthDashboard.tsx(112,50): error TS18046: 'error' is of type 'unknown'.
src/components/sync/SyncHealthDashboard.tsx(121,27): error TS7006: Parameter 'ms' implicitly has an 'any' type.
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
src/hooks/accounts/useSupplementalAccounts.ts(31,3): error TS7031: Binding element 'onAddAccount' implicitly has an 'any' type.
src/hooks/accounts/useSupplementalAccounts.ts(32,3): error TS7031: Binding element 'onUpdateAccount' implicitly has an 'any' type.
src/hooks/accounts/useSupplementalAccounts.ts(33,3): error TS7031: Binding element 'onDeleteAccount' implicitly has an 'any' type.
src/hooks/accounts/useSupplementalAccounts.ts(34,3): error TS7031: Binding element 'onTransferToEnvelope' implicitly has an 'any' type.
src/hooks/accounts/useSupplementalAccounts.ts(72,59): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/accounts/useSupplementalAccounts.ts(83,32): error TS7006: Parameter 'account' implicitly has an 'any' type.
src/hooks/accounts/useSupplementalAccounts.ts(117,22): error TS7006: Parameter 'account' implicitly has an 'any' type.
src/hooks/accounts/useSupplementalAccounts.ts(118,52): error TS2345: Argument of type 'Dispatch<SetStateAction<null>>' is not assignable to parameter of type '(account: Account) => void'.
  Types of parameters 'value' and 'account' are incompatible.
    Type 'Account' is not assignable to type 'SetStateAction<null>'.
      Type 'Account' provides no match for the signature '(prevState: null): null'.
src/hooks/accounts/useSupplementalAccounts.ts(125,31): error TS7006: Parameter 'accountId' implicitly has an 'any' type.
src/hooks/accounts/useSupplementalAccounts.ts(130,26): error TS7006: Parameter 'account' implicitly has an 'any' type.
src/hooks/accounts/useSupplementalAccounts.ts(133,7): error TS2345: Argument of type 'Dispatch<SetStateAction<null>>' is not assignable to parameter of type '(account: Account) => void'.
  Types of parameters 'value' and 'account' are incompatible.
    Type 'Account' is not assignable to type 'SetStateAction<null>'.
      Type 'Account' provides no match for the signature '(prevState: null): null'.
src/hooks/accounts/useSupplementalAccounts.ts(147,35): error TS2345: Argument of type 'null' is not assignable to parameter of type 'TransferringAccount'.
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
src/hooks/analytics/usePerformanceMonitor.ts(15,39): error TS7006: Parameter 'analyticsData' implicitly has an 'any' type.
src/hooks/analytics/usePerformanceMonitor.ts(15,54): error TS7006: Parameter 'balanceData' implicitly has an 'any' type.
src/hooks/analytics/usePerformanceMonitor.ts(75,29): error TS2345: Argument of type '(prev: never[]) => { timestamp: number; score: number; budgetAdherence: number; savingsRate: number; }[]' is not assignable to parameter of type 'SetStateAction<never[]>'.
  Type '(prev: never[]) => { timestamp: number; score: number; budgetAdherence: number; savingsRate: number; }[]' is not assignable to type '(prevState: never[]) => never[]'.
    Type '{ timestamp: number; score: number; budgetAdherence: number; savingsRate: number; }[]' is not assignable to type 'never[]'.
      Type '{ timestamp: number; score: number; budgetAdherence: number; savingsRate: number; }' is not assignable to type 'never'.
src/hooks/analytics/useReportExporter.ts(36,12): error TS7006: Parameter 'analyticsData' implicitly has an 'any' type.
src/hooks/analytics/useReportExporter.ts(36,27): error TS7006: Parameter 'balanceData' implicitly has an 'any' type.
src/hooks/analytics/useReportExporter.ts(36,40): error TS7006: Parameter 'timeFilter' implicitly has an 'any' type.
src/hooks/analytics/useReportExporter.ts(48,42): error TS7006: Parameter 'analyticsData' implicitly has an 'any' type.
src/hooks/analytics/useReportExporter.ts(71,52): error TS2345: Argument of type '(element: HTMLElement, options?: Partial<Options> | undefined) => Promise<HTMLCanvasElement>' is not assignable to parameter of type '(element: Element, options: Record<string, unknown>) => Promise<HTMLCanvasElement>'.
  Types of parameters 'element' and 'element' are incompatible.
    Type 'Element' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 129 more.
src/hooks/analytics/useReportExporter.ts(81,12): error TS7006: Parameter 'analyticsData' implicitly has an 'any' type.
src/hooks/analytics/useReportExporter.ts(81,27): error TS7006: Parameter 'balanceData' implicitly has an 'any' type.
src/hooks/analytics/useReportExporter.ts(81,40): error TS7006: Parameter 'timeFilter' implicitly has an 'any' type.
src/hooks/analytics/useReportExporter.ts(81,52): error TS7006: Parameter 'onExport' implicitly has an 'any' type.
src/hooks/analytics/useReportExporter.ts(81,62): error TS7006: Parameter 'onClose' implicitly has an 'any' type.
src/hooks/analytics/useReportExporter.ts(105,38): error TS7006: Parameter 'template' implicitly has an 'any' type.
src/hooks/analytics/useReportExporter.ts(108,24): error TS2345: Argument of type '(prev: { includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: null; }) => { ...; }' is not assignable to parameter of type 'SetStateAction<{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: null; }>'.
  Type '(prev: { includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: null; }) => { ...; }' is not assignable to type '(prevState: { includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: null; }) => { ...; }'.
    Call signature return types '{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: unknown; }' and '{ includeSummary: boolean; includeCharts: boolean; includeTransactions: boolean; includeEnvelopes: boolean; includeSavings: boolean; includeInsights: boolean; customDateRange: null; }' are incompatible.
      The types of 'customDateRange' are incompatible between these types.
        Type 'unknown' is not assignable to type 'null'.
src/hooks/analytics/useTransactionAnalysis.ts(11,40): error TS7006: Parameter 'filteredTransactions' implicitly has an 'any' type.
src/hooks/analytics/useTransactionAnalysis.ts(11,62): error TS7006: Parameter 'allTransactions' implicitly has an 'any' type.
src/hooks/analytics/useTransactionAnalysis.ts(11,79): error TS7006: Parameter 'settings' implicitly has an 'any' type.
src/hooks/analytics/useTransactionFiltering.ts(15,23): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ 7: Date; 30: Date; 90: Date; "6months": Date; }'.
  No index signature with a parameter of type 'string' was found on type '{ 7: Date; 30: Date; 90: Date; "6months": Date; }'.
src/hooks/analytics/useTrendAnalysis.ts(6,33): error TS7006: Parameter 'analyticsData' implicitly has an 'any' type.
src/hooks/analytics/useTrendAnalysis.ts(56,36): error TS7006: Parameter 'spendingTrends' implicitly has an 'any' type.
src/hooks/analytics/useTrendAnalysis.ts(79,33): error TS7006: Parameter 'analyticsData' implicitly has an 'any' type.
src/hooks/analytics/useTrendAnalysis.ts(99,35): error TS7006: Parameter 'analyticsData' implicitly has an 'any' type.
src/hooks/analytics/useTrendAnalysis.ts(129,35): error TS7006: Parameter 'spendingTrends' implicitly has an 'any' type.
src/hooks/analytics/useTrendAnalysis.ts(136,26): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/hooks/analytics/useTrendAnalysis.ts(136,31): error TS7006: Parameter 'month' implicitly has an 'any' type.
src/hooks/analytics/useTrendAnalysis.ts(149,27): error TS7006: Parameter '_categoryTrends' implicitly has an 'any' type.
src/hooks/analytics/useTrendAnalysis.ts(149,44): error TS7006: Parameter '_seasonalPatterns' implicitly has an 'any' type.
src/hooks/analytics/useTrendAnalysis.ts(174,34): error TS7006: Parameter 'analyticsData' implicitly has an 'any' type.
src/hooks/analytics/useTrendAnalysis.ts(174,49): error TS7006: Parameter '_timeFilter' implicitly has an 'any' type.
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
src/hooks/auth/useKeyManagement.ts(54,53): error TS18046: 'err' is of type 'unknown'.
src/hooks/auth/useKeyManagement.ts(55,16): error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<null>'.
src/hooks/auth/useKeyManagement.ts(67,12): error TS7006: Parameter 'exportPassword' implicitly has an 'any' type.
src/hooks/auth/useKeyManagement.ts(85,70): error TS18046: 'err' is of type 'unknown'.
src/hooks/auth/useKeyManagement.ts(86,18): error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<null>'.
src/hooks/auth/useKeyManagement.ts(119,66): error TS18046: 'err' is of type 'unknown'.
src/hooks/auth/useKeyManagement.ts(120,18): error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<null>'.
src/hooks/auth/useKeyManagement.ts(149,62): error TS18046: 'err' is of type 'unknown'.
src/hooks/auth/useKeyManagement.ts(150,18): error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<null>'.
src/hooks/auth/useKeyManagement.ts(164,12): error TS7006: Parameter 'exportPassword' implicitly has an 'any' type.
src/hooks/auth/useKeyManagement.ts(175,72): error TS18046: 'err' is of type 'unknown'.
src/hooks/auth/useKeyManagement.ts(176,18): error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<null>'.
src/hooks/auth/useKeyManagement.ts(204,59): error TS18046: 'err' is of type 'unknown'.
src/hooks/auth/useKeyManagement.ts(205,16): error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<null>'.
src/hooks/auth/useKeyManagement.ts(216,40): error TS7006: Parameter 'keyFileData' implicitly has an 'any' type.
src/hooks/auth/useKeyManagement.ts(253,53): error TS18046: 'err' is of type 'unknown'.
src/hooks/auth/useKeyManagement.ts(254,16): error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<null>'.
src/hooks/auth/useKeyManagement.ts(266,12): error TS7006: Parameter 'keyFileData' implicitly has an 'any' type.
src/hooks/auth/useKeyManagement.ts(266,48): error TS7006: Parameter 'vaultPassword' implicitly has an 'any' type.
src/hooks/auth/useKeyManagement.ts(279,56): error TS2345: Argument of type '{ budgetId: any; importedSalt: Uint8Array<any>; }' is not assignable to parameter of type 'null | undefined'.
src/hooks/auth/useKeyManagement.ts(299,61): error TS18046: 'err' is of type 'unknown'.
src/hooks/auth/useKeyManagement.ts(300,18): error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<null>'.
src/hooks/auth/useKeyManagement.ts(323,57): error TS18046: 'err' is of type 'unknown'.
src/hooks/auth/useKeyManagement.ts(331,12): error TS7006: Parameter 'keyFileData' implicitly has an 'any' type.
src/hooks/auth/useKeyManagement.ts(343,53): error TS18046: 'err' is of type 'unknown'.
src/hooks/auth/useKeyManagementUI.ts(164,5): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/hooks/auth/useSecurityManager.ts(162,6): error TS7006: Parameter 'newSettings' implicitly has an 'any' type.
src/hooks/auth/useSecurityManager.ts(201,15): error TS18047: 'lastLog' is possibly 'null'.
src/hooks/auth/useSecurityManagerUI.ts(20,5): error TS2322: Type 'number' is not assignable to type 'null'.
src/hooks/auth/useSecurityManagerUI.ts(33,47): error TS7006: Parameter 'updates' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(37,41): error TS7006: Parameter 'event' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(54,5): error TS2322: Type 'number' is not assignable to type 'null'.
src/hooks/auth/useSecurityManagerUI.ts(81,41): error TS7006: Parameter 'securitySettings' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(81,59): error TS7006: Parameter 'addSecurityEvent' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(83,6): error TS7006: Parameter 'event' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(100,6): error TS7006: Parameter 'success' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(115,6): error TS7006: Parameter 'activity' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(130,6): error TS7006: Parameter 'action' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(157,3): error TS7006: Parameter 'securitySettings' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(158,3): error TS7006: Parameter 'isLocked' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(159,3): error TS7006: Parameter 'lockSession' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(160,3): error TS7006: Parameter 'lastActivityRef' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(161,3): error TS7006: Parameter 'autoLockTimerRef' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(218,38): error TS7006: Parameter 'securitySettings' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(218,56): error TS7006: Parameter 'clipboardTimerRef' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(218,75): error TS7006: Parameter 'logSecurityEvent' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(220,12): error TS7006: Parameter 'text' implicitly has an 'any' type.
src/hooks/auth/useSecurityManagerUI.ts(250,60): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/auth/useUserSetup.ts(12,30): error TS7006: Parameter 'onSetupComplete' implicitly has an 'any' type.
src/hooks/auth/useUserSetup.ts(53,69): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/auth/useUserSetup.ts(71,56): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/hooks/auth/useUserSetup.ts(84,36): error TS7006: Parameter 'asyncFn' implicitly has an 'any' type.
src/hooks/auth/useUserSetup.ts(94,31): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/auth/useUserSetup.ts(128,38): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/auth/useUserSetup.ts(153,20): error TS2339: Property 'code' does not exist on type '{}'.
src/hooks/auth/useUserSetup.ts(153,75): error TS2339: Property 'canCreateNew' does not exist on type '{}'.
src/hooks/auth/useUserSetup.ts(156,22): error TS2339: Property 'error' does not exist on type '{}'.
src/hooks/auth/useUserSetup.ts(156,40): error TS2339: Property 'suggestion' does not exist on type '{}'.
src/hooks/auth/useUserSetup.ts(163,20): error TS2339: Property 'code' does not exist on type '{}'.
src/hooks/auth/useUserSetup.ts(163,72): error TS2339: Property 'canCreateNew' does not exist on type '{}'.
src/hooks/auth/useUserSetup.ts(165,22): error TS2339: Property 'error' does not exist on type '{}'.
src/hooks/auth/useUserSetup.ts(165,40): error TS2339: Property 'suggestion' does not exist on type '{}'.
src/hooks/auth/useUserSetup.ts(182,43): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/auth/useUserSetup.ts(212,46): error TS18046: 'error' is of type 'unknown'.
src/hooks/auth/useUserSetup.ts(219,37): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/auth/useUserSetup.ts(246,46): error TS18046: 'error' is of type 'unknown'.
src/hooks/auth/useUserSetup.ts(296,33): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/auth/useUserSetup.ts(302,29): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/bills/useBillManager.ts(12,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/bills/useBillManager.ts(98,18): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/bills/useBillManager.ts(148,5): error TS2322: Type '((bill: Bill) => void | Promise<void>) | undefined' is not assignable to type '((bill: Record<string, unknown>) => void | Promise<void>) | undefined'.
  Type '(bill: Bill) => void | Promise<void>' is not assignable to type '(bill: Record<string, unknown>) => void | Promise<void>'.
    Types of parameters 'bill' and 'bill' are incompatible.
      Type 'Record<string, unknown>' is missing the following properties from type 'Bill': id, name, amount, dueDate
src/hooks/bills/useBillManager.ts(166,11): error TS2322: Type 'Dispatch<SetStateAction<never[]>>' is not assignable to type '(bills: BillRecord[]) => void'.
  Types of parameters 'value' and 'bills' are incompatible.
    Type 'BillRecord[]' is not assignable to type 'SetStateAction<never[]>'.
      Type 'BillRecord[]' is not assignable to type 'never[]'.
        Type 'BillRecord' is not assignable to type 'never'.
src/hooks/bills/useBillManager.ts(184,11): error TS2322: Type 'Dispatch<SetStateAction<never[]>>' is not assignable to type '(bills: BillRecord[]) => void'.
  Types of parameters 'value' and 'bills' are incompatible.
    Type 'BillRecord[]' is not assignable to type 'SetStateAction<never[]>'.
      Type 'BillRecord[]' is not assignable to type 'never[]'.
        Type 'BillRecord' is not assignable to type 'never'.
src/hooks/bills/useBillManager.ts(191,12): error TS7006: Parameter 'updatedBills' implicitly has an 'any' type.
src/hooks/bills/useBillManager.ts(201,5): error TS2322: Type 'Dispatch<SetStateAction<null>>' is not assignable to type '(bill: BillRecord | null) => void'.
  Types of parameters 'value' and 'bill' are incompatible.
    Type 'BillRecord | null' is not assignable to type 'SetStateAction<null>'.
      Type 'BillRecord' is not assignable to type 'SetStateAction<null>'.
        Type 'BillRecord' provides no match for the signature '(prevState: null): null'.
src/hooks/bills/useBillManager.ts(203,5): error TS2322: Type 'Dispatch<SetStateAction<null>>' is not assignable to type '(bill: BillRecord | null) => void'.
  Types of parameters 'value' and 'bill' are incompatible.
    Type 'BillRecord | null' is not assignable to type 'SetStateAction<null>'.
      Type 'BillRecord' is not assignable to type 'SetStateAction<null>'.
        Type 'BillRecord' provides no match for the signature '(prevState: null): null'.
src/hooks/bills/useBillManager.ts(206,5): error TS2322: Type 'Dispatch<SetStateAction<null>>' is not assignable to type '(bill: BillRecord | null) => void'.
  Types of parameters 'value' and 'bill' are incompatible.
    Type 'BillRecord | null' is not assignable to type 'SetStateAction<null>'.
      Type 'BillRecord' is not assignable to type 'SetStateAction<null>'.
        Type 'BillRecord' provides no match for the signature '(prevState: null): null'.
src/hooks/bills/useBillManagerHelpers.ts(251,55): error TS7006: Parameter 'updatedBill' implicitly has an 'any' type.
src/hooks/bills/useBillManagerHelpers.ts(276,44): error TS2345: Argument of type 'BillRecord[]' is not assignable to parameter of type 'Bill[]'.
  Type 'BillRecord' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'string | Date | null' is not assignable to type 'string | Date | undefined'.
        Type 'null' is not assignable to type 'string | Date | undefined'.
src/hooks/bills/useBillManagerHelpers.ts(307,22): error TS2345: Argument of type 'BillRecord[]' is not assignable to parameter of type 'Bill[]'.
  Type 'BillRecord' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'string | Date | null' is not assignable to type 'string | Date | undefined'.
        Type 'null' is not assignable to type 'string | Date | undefined'.
src/hooks/bills/useBillManagerHelpers.ts(321,3): error TS2322: Type '{ suggestedEnvelopeId: any; suggestedEnvelopeName: any; envelopeConfidence: any; id: string; provider: string; description: string; amount: number; dueDate: string; category: string; frequency: string; ... 4 more ...; metadata: { ...; }; }[]' is not assignable to type 'BillRecord[]'.
  Property 'name' is missing in type '{ suggestedEnvelopeId: any; suggestedEnvelopeName: any; envelopeConfidence: any; id: string; provider: string; description: string; amount: number; dueDate: string; category: string; frequency: string; ... 4 more ...; metadata: { ...; }; }' but required in type 'BillRecord'.
src/hooks/bills/useBillManagerUI.ts(19,25): error TS7006: Parameter 'id' implicitly has an 'any' type.
src/hooks/bills/useBillManagerUI.ts(19,29): error TS7006: Parameter 'label' implicitly has an 'any' type.
src/hooks/bills/useBillManagerUI.ts(19,36): error TS7006: Parameter 'count' implicitly has an 'any' type.
src/hooks/bills/useBillManagerUI.ts(19,43): error TS7006: Parameter 'icon' implicitly has an 'any' type.
src/hooks/bills/useBillManagerUI.ts(19,49): error TS7006: Parameter 'color' implicitly has an 'any' type.
src/hooks/bills/useBillManagerUI.ts(95,50): error TS2345: Argument of type '(bill: { id: string; }) => string' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => string'.
  Types of parameters 'bill' and 'value' are incompatible.
    Type 'unknown' is not assignable to type '{ id: string; }'.
src/hooks/bills/useBillOperationWrappers.ts(38,12): error TS7006: Parameter 'updatedBills' implicitly has an 'any' type.
src/hooks/bills/useBillOperationWrappers.ts(47,30): error TS18046: 'error' is of type 'unknown'.
src/hooks/bills/useBillOperationWrappers.ts(83,12): error TS7006: Parameter 'billIds' implicitly has an 'any' type.
src/hooks/bills/useBillOperationWrappers.ts(92,30): error TS18046: 'error' is of type 'unknown'.
src/hooks/bills/useBillOperations.ts(34,77): error TS2345: Argument of type 'Record<string, unknown>[]' is not assignable to parameter of type 'never[]'.
  Type 'Record<string, unknown>' is not assignable to type 'never'.
src/hooks/bills/useBillValidation.ts(15,6): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/hooks/bills/useBillValidation.ts(32,59): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/bills/useBillValidation.ts(48,6): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/hooks/bills/useBillValidation.ts(48,12): error TS7006: Parameter 'changes' implicitly has an 'any' type.
src/hooks/bills/useBills/index.ts(43,5): error TS2783: 'upcomingBills' is specified more than once, so this usage will be overwritten.
src/hooks/bills/useBulkBillOperations.ts(9,41): error TS7031: Binding element 'updateBill' implicitly has an 'any' type.
src/hooks/bills/useBulkBillOperations.ts(9,53): error TS7031: Binding element 'onUpdateBill' implicitly has an 'any' type.
src/hooks/bills/useBulkBillOperations.ts(9,67): error TS7031: Binding element 'budget' implicitly has an 'any' type.
src/hooks/bills/useBulkBillOperations.ts(9,75): error TS7031: Binding element 'handlePayBill' implicitly has an 'any' type.
src/hooks/bills/useBulkBillOperations.ts(14,12): error TS7006: Parameter 'updatedBills' implicitly has an 'any' type.
src/hooks/bills/useBulkBillOperations.ts(15,39): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/hooks/bills/useBulkBillOperations.ts(41,12): error TS7006: Parameter 'billIds' implicitly has an 'any' type.
src/hooks/bills/useBulkBillOperations.ts(42,36): error TS7006: Parameter 'billId' implicitly has an 'any' type.
src/hooks/bills/useBulkBillUpdate.ts(7,55): error TS7006: Parameter '_isOpen' implicitly has an 'any' type.
src/hooks/bills/useBulkBillUpdate.ts(15,7): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/bills/useBulkBillUpdate.ts(15,27): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/bills/useBulkBillUpdate.ts(16,22): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/bills/useBulkBillUpdate.ts(17,23): error TS2339: Property 'dueDate' does not exist on type 'never'.
src/hooks/bills/useBulkBillUpdate.ts(18,30): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/bills/useBulkBillUpdate.ts(19,31): error TS2339: Property 'dueDate' does not exist on type 'never'.
src/hooks/bills/useBulkBillUpdate.ts(27,25): error TS7006: Parameter 'billId' implicitly has an 'any' type.
src/hooks/bills/useBulkBillUpdate.ts(27,33): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/hooks/bills/useBulkBillUpdate.ts(27,40): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/bills/useBulkBillUpdate.ts(31,12): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/bills/useBulkBillUpdate.ts(38,28): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/hooks/bills/useBulkBillUpdate.ts(38,35): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/bills/useBulkBillUpdate.ts(41,11): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/bills/useBulkBillUpdate.ts(41,27): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/bills/useBulkBillUpdate.ts(42,9): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/bills/useBulkBillUpdate.ts(42,25): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/bills/useBulkBillUpdate.ts(52,7): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/bills/useBulkBillUpdate.ts(52,25): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/bills/useBulkBillUpdate.ts(53,22): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/bills/useBulkBillUpdate.ts(54,23): error TS2339: Property 'dueDate' does not exist on type 'never'.
src/hooks/bills/useBulkBillUpdate.ts(55,30): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/bills/useBulkBillUpdate.ts(56,31): error TS2339: Property 'dueDate' does not exist on type 'never'.
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
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(61,28): error TS2345: Argument of type '{ id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: number; results: ({ ruleId: any; ruleName: any; success: boolean; error: string; amount: number; executedAt: string; transfers?: undefined; targetEnvelopes?: undefined; } | { ...; } | { ...; })[]; remainingCash: any; initialCash: any...' is not assignable to parameter of type 'SetStateAction<null>'.
  Type 'undefined' is not assignable to type 'SetStateAction<null>'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(63,28): error TS18048: 'result.execution' is possibly 'undefined'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(64,26): error TS18048: 'result.execution' is possibly 'undefined'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(75,41): error TS18046: 'error' is of type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionSummary.ts(7,37): error TS7006: Parameter 'lastExecution' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionSummary.ts(23,47): error TS7006: Parameter 'r' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts(16,35): error TS7006: Parameter 'budget' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts(19,12): error TS7006: Parameter 'transfer' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts(30,60): error TS18046: 'error' is of type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts(39,6): error TS7006: Parameter 'rules' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts(55,41): error TS18046: 'error' is of type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts(63,6): error TS7006: Parameter 'rules' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts(79,41): error TS18046: 'error' is of type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts(87,6): error TS7006: Parameter 'transfers' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts(100,52): error TS18046: 'error' is of type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts(108,6): error TS7006: Parameter 'transfers' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts(133,6): error TS7006: Parameter 'rules' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts(145,47): error TS7006: Parameter 'rule' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useExecutionUtils.ts(151,49): error TS7006: Parameter 'rule' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts(14,34): error TS7006: Parameter '_budget' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts(16,48): error TS7006: Parameter 'rule' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts(16,54): error TS7006: Parameter 'context' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts(16,63): error TS7006: Parameter 'availableCash' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts(16,78): error TS7006: Parameter 'executeTransfer' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts(61,12): error TS7006: Parameter 'rules' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts(61,19): error TS7006: Parameter 'context' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts(61,28): error TS7006: Parameter 'executeTransfer' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts(67,47): error TS7006: Parameter 'rule' implicitly has an 'any' type.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts(97,22): error TS18046: 'error' is of type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts(104,22): error TS18046: 'error' is of type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts(135,18): error TS18046: 'error' is of type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingExecution/useRuleExecution.ts(139,18): error TS18046: 'error' is of type 'unknown'.
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
src/hooks/budgeting/useEnvelopeForm.ts(187,27): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/budgeting/useEnvelopes.ts(17,54): error TS2345: Argument of type 'Envelope[]' is not assignable to parameter of type 'never[]'.
  Type 'Envelope' is not assignable to type 'never'.
src/hooks/budgeting/useEnvelopesQuery.ts(109,22): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Envelope'.
  No index signature with a parameter of type 'string' was found on type 'Envelope'.
src/hooks/budgeting/useEnvelopesQuery.ts(110,22): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Envelope'.
  No index signature with a parameter of type 'string' was found on type 'Envelope'.
src/hooks/budgeting/usePaycheckForm.ts(13,37): error TS7006: Parameter 'uniquePayersLength' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckForm.ts(13,57): error TS7006: Parameter 'setShowAddNewPayer' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckForm.ts(13,77): error TS7006: Parameter 'initialRender' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckForm.ts(29,3): error TS7031: Binding element 'paycheckHistory' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckForm.ts(30,3): error TS7031: Binding element 'currentUser' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckForm.ts(31,3): error TS7031: Binding element 'onProcessPaycheck' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckForm.ts(55,30): error TS7006: Parameter 'selectedPayer' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckForm.ts(71,30): error TS7006: Parameter 'trimmedName' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckForm.ts(73,19): error TS2345: Argument of type '(prev: never[]) => any[]' is not assignable to parameter of type 'SetStateAction<never[]>'.
  Type '(prev: never[]) => any[]' is not assignable to type '(prevState: never[]) => never[]'.
    Type 'any[]' is not assignable to type 'never[]'.
      Type 'any' is not assignable to type 'never'.
src/hooks/budgeting/usePaycheckForm.ts(81,31): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckForm.ts(136,37): error TS7006: Parameter 'processedPayerName' implicitly has an 'any' type.
src/hooks/budgeting/usePaycheckForm.ts(190,26): error TS7006: Parameter 'payer' implicitly has an 'any' type.
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
src/hooks/budgeting/useUnassignedCashDistribution.ts(17,33): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(32,31): error TS7006: Parameter 'envelopes' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(33,28): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(33,33): error TS7006: Parameter 'env' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(37,42): error TS7006: Parameter 'envelopes' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(37,53): error TS7006: Parameter 'unassignedCash' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(37,69): error TS7006: Parameter 'totalBudget' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(40,22): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(46,7): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/budgeting/useUnassignedCashDistribution.ts(54,42): error TS7006: Parameter 'billEnvelopes' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(54,57): error TS7006: Parameter 'bills' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(54,64): error TS7006: Parameter 'unassignedCash' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(55,54): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(70,33): error TS7006: Parameter 'a' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(70,36): error TS7006: Parameter 'b' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(76,38): error TS7031: Binding element 'envelope' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(76,48): error TS7031: Binding element 'recommendedAmount' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(76,67): error TS7031: Binding element 'isUrgent' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(78,7): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/budgeting/useUnassignedCashDistribution.ts(84,38): error TS7031: Binding element 'envelope' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(84,48): error TS7031: Binding element 'recommendedAmount' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(84,67): error TS7031: Binding element 'isUrgent' implicitly has an 'any' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(88,9): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/budgeting/useUnassignedCashDistribution.ts(153,7): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/hooks/budgeting/useUnassignedCashDistribution.ts(207,13): error TS7034: Variable 'envelopeUpdates' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/hooks/budgeting/useUnassignedCashDistribution.ts(224,44): error TS7005: Variable 'envelopeUpdates' implicitly has an 'any[]' type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(267,36): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
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
src/hooks/common/useChartConfig.tsx(4,26): error TS7006: Parameter 'monthKey' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(15,30): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(71,40): error TS7031: Binding element 'active' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(71,48): error TS7031: Binding element 'payload' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(71,57): error TS7031: Binding element 'label' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(77,22): error TS7006: Parameter 'entry' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(78,19): error TS7006: Parameter 'entry' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(78,26): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(145,6): error TS7006: Parameter 'category' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(145,16): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(146,14): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ income: string; expenses: string; net: string; savings: string; budget: string; actual: string; }'.
src/hooks/common/useChartConfig.tsx(152,39): error TS7006: Parameter 'status' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(153,25): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ critical: { text: string; bg: string; }; warning: { text: string; bg: string; }; healthy: { text: string; bg: string; }; overfunded: { text: string; bg: string; }; }'.
src/hooks/common/useChartConfig.tsx(171,42): error TS7006: Parameter 'chartType' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(171,53): error TS7006: Parameter 'timeFilter' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(179,18): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(180,20): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(181,15): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(189,44): error TS7006: Parameter 'breakpoint' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(189,56): error TS7006: Parameter 'chartType' implicitly has an 'any' type.
src/hooks/common/useChartConfig.tsx(191,7): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ mobile: { default: number; pie: number; bar: number; }; tablet: { default: number; pie: number; bar: number; }; desktop: { default: number; pie: number; bar: number; }; }'.
src/hooks/common/useChartConfig.tsx(191,54): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ mobile: { default: number; pie: number; bar: number; }; tablet: { default: number; pie: number; bar: number; }; desktop: { default: number; pie: number; bar: number; }; }'.
src/hooks/common/useConnectionManager/useConnectionConfig.ts(6,32): error TS7006: Parameter 'entityType' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(9,28): error TS7006: Parameter 'entityId' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(9,38): error TS7006: Parameter 'targetId' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(9,48): error TS7006: Parameter 'envelopes' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(9,59): error TS7006: Parameter 'updateBill' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(9,71): error TS7006: Parameter 'addToast' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(10,42): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(23,32): error TS7006: Parameter 'entityId' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(23,42): error TS7006: Parameter 'targetId' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(23,52): error TS7006: Parameter 'bills' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(23,59): error TS7006: Parameter 'updateBill' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(23,71): error TS7006: Parameter 'addToast' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(24,34): error TS7006: Parameter 'b' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(37,28): error TS7006: Parameter 'entityId' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(37,38): error TS7006: Parameter 'targetId' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(37,48): error TS7006: Parameter 'envelopes' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(37,59): error TS7006: Parameter 'updateDebt' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(37,71): error TS7006: Parameter 'addToast' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(38,49): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(125,18): error TS18046: 'error' is of type 'unknown'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(128,39): error TS18046: 'error' is of type 'unknown'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(150,40): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(163,67): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(176,55): error TS2322: Type 'null' is not assignable to type 'string | undefined'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(203,18): error TS18046: 'error' is of type 'unknown'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(206,39): error TS18046: 'error' is of type 'unknown'.
src/hooks/common/useDataInitialization.ts(2,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/common/useDataInitialization.ts(40,28): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/common/useDataInitialization.ts(40,44): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/hooks/common/useDataInitialization.ts(67,22): error TS18046: 'error' is of type 'unknown'.
src/hooks/common/useEditLock.ts(49,70): error TS7006: Parameter 'lockDoc' implicitly has an 'any' type.
src/hooks/common/useEditLock.ts(74,9): error TS18048: 'result' is possibly 'undefined'.
src/hooks/common/useEditLock.ts(85,11): error TS18048: 'result' is possibly 'undefined'.
src/hooks/common/useEditLock.ts(102,17): error TS18048: 'result' is possibly 'undefined'.
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
src/hooks/common/useImportData.ts(13,26): error TS7006: Parameter 'validatedData' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(21,27): error TS7006: Parameter 'counts' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(24,31): error TS7006: Parameter 'importBudgetId' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(24,47): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(30,30): error TS7006: Parameter 'validatedData' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(30,45): error TS7006: Parameter 'hasBudgetIdMismatch' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(30,66): error TS7006: Parameter 'importBudgetId' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(30,82): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(42,3): error TS7006: Parameter 'confirm' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(43,3): error TS7006: Parameter 'validatedData' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(44,3): error TS7006: Parameter 'hasBudgetIdMismatch' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(45,3): error TS7006: Parameter 'importBudgetId' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(46,3): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(65,28): error TS7006: Parameter 'validatedData' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(78,30): error TS7006: Parameter 'validatedData' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(78,45): error TS7006: Parameter 'showSuccessToast' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(78,63): error TS7006: Parameter 'authConfig' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(110,12): error TS7006: Parameter 'event' implicitly has an 'any' type.
src/hooks/common/useImportData.ts(157,42): error TS18046: 'error' is of type 'unknown'.
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
src/hooks/common/useToast.ts(8,50): error TS7031: Binding element 'title' implicitly has an 'any' type.
src/hooks/common/useToast.ts(8,57): error TS7031: Binding element 'message' implicitly has an 'any' type.
src/hooks/common/useToast.ts(18,15): error TS2345: Argument of type '(prev: never[]) => { id: number; type: string; title: any; message: any; duration: number; }[]' is not assignable to parameter of type 'SetStateAction<never[]>'.
  Type '(prev: never[]) => { id: number; type: string; title: any; message: any; duration: number; }[]' is not assignable to type '(prevState: never[]) => never[]'.
    Type '{ id: number; type: string; title: any; message: any; duration: number; }[]' is not assignable to type 'never[]'.
      Type '{ id: number; type: string; title: any; message: any; duration: number; }' is not assignable to type 'never'.
src/hooks/common/useToast.ts(23,36): error TS7006: Parameter 'id' implicitly has an 'any' type.
src/hooks/common/useToast.ts(24,54): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/common/useToast.ts(33,6): error TS7006: Parameter 'title' implicitly has an 'any' type.
src/hooks/common/useToast.ts(33,13): error TS7006: Parameter 'message' implicitly has an 'any' type.
src/hooks/common/useToast.ts(33,22): error TS7006: Parameter 'duration' implicitly has an 'any' type.
src/hooks/common/useToast.ts(40,6): error TS7006: Parameter 'title' implicitly has an 'any' type.
src/hooks/common/useToast.ts(40,13): error TS7006: Parameter 'message' implicitly has an 'any' type.
src/hooks/common/useToast.ts(40,22): error TS7006: Parameter 'duration' implicitly has an 'any' type.
src/hooks/common/useToast.ts(47,6): error TS7006: Parameter 'title' implicitly has an 'any' type.
src/hooks/common/useToast.ts(47,13): error TS7006: Parameter 'message' implicitly has an 'any' type.
src/hooks/common/useToast.ts(47,22): error TS7006: Parameter 'duration' implicitly has an 'any' type.
src/hooks/common/useToast.ts(54,6): error TS7006: Parameter 'title' implicitly has an 'any' type.
src/hooks/common/useToast.ts(54,13): error TS7006: Parameter 'message' implicitly has an 'any' type.
src/hooks/common/useToast.ts(54,22): error TS7006: Parameter 'duration' implicitly has an 'any' type.
src/hooks/common/useToast.ts(61,6): error TS7006: Parameter 'title' implicitly has an 'any' type.
src/hooks/common/useToast.ts(61,13): error TS7006: Parameter 'message' implicitly has an 'any' type.
src/hooks/common/useTransactionArchiving.ts(45,32): error TS2353: Object literal may only specify known properties, and 'stage' does not exist in type '(prevState: null) => null'.
src/hooks/common/useTransactionArchiving.ts(52,32): error TS2353: Object literal may only specify known properties, and 'stage' does not exist in type '(prevState: null) => null'.
src/hooks/common/useTransactionArchiving.ts(57,32): error TS2353: Object literal may only specify known properties, and 'stage' does not exist in type '(prevState: null) => null'.
src/hooks/common/useTransactionArchiving.ts(58,30): error TS2345: Argument of type '{ success: boolean; stats: { processed: number; archived: number; aggregated: number; errors: number; }; message: string; }' is not assignable to parameter of type 'SetStateAction<null>'.
  Type '{ success: boolean; stats: { processed: number; archived: number; aggregated: number; errors: number; }; message: string; }' provides no match for the signature '(prevState: null): null'.
src/hooks/common/useTransactionArchiving.ts(69,11): error TS2353: Object literal may only specify known properties, and 'success' does not exist in type '(prevState: null) => null'.
src/hooks/common/useTransactionArchiving.ts(70,18): error TS18046: 'error' is of type 'unknown'.
src/hooks/common/useTransactionArchiving.ts(99,12): error TS7006: Parameter 'archiveId' implicitly has an 'any' type.
src/hooks/common/useTransactionArchiving.ts(120,41): error TS7006: Parameter 'transactionCount' implicitly has an 'any' type.
src/hooks/common/useTransactions.ts(39,49): error TS2345: Argument of type 'Transaction[]' is not assignable to parameter of type 'never[]'.
  Type 'Transaction' is not assignable to type 'never'.
src/hooks/common/useTransactions.ts(42,48): error TS2345: Argument of type 'Transaction[]' is not assignable to parameter of type 'never[]'.
  Type 'Transaction' is not assignable to type 'never'.
src/hooks/dashboard/useMainDashboard.ts(28,45): error TS7006: Parameter 'updates' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(68,39): error TS2339: Property 'currentBalance' does not exist on type 'never'.
src/hooks/dashboard/useMainDashboard.ts(73,46): error TS2339: Property 'currentAmount' does not exist on type 'never'.
src/hooks/dashboard/useMainDashboard.ts(105,46): error TS7006: Parameter 'reconcileTransaction' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(105,68): error TS7006: Parameter 'envelopes' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(105,79): error TS7006: Parameter 'savingsGoals' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(107,6): error TS7006: Parameter 'newTransaction' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(107,22): error TS7006: Parameter 'onSuccess' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(129,6): error TS7006: Parameter 'difference' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(170,25): error TS7006: Parameter 'env' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(171,28): error TS7006: Parameter 'goal' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(190,34): error TS7006: Parameter 'paycheckHistory' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(190,51): error TS7006: Parameter 'setActiveView' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(226,39): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(230,43): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(234,44): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(238,46): error TS7006: Parameter 'isBalanced' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(238,58): error TS7006: Parameter 'difference' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(243,45): error TS7006: Parameter 'isBalanced' implicitly has an 'any' type.
src/hooks/dashboard/useMainDashboard.ts(243,57): error TS7006: Parameter 'difference' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(59,20): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'DebtAccount'.
  No index signature with a parameter of type 'string' was found on type 'DebtAccount'.
src/hooks/debts/useDebtDashboard.ts(60,20): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'DebtAccount'.
  No index signature with a parameter of type 'string' was found on type 'DebtAccount'.
src/hooks/debts/useDebtDashboard.ts(82,27): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(87,28): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(91,36): error TS7006: Parameter 'debtData' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(94,38): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/debts/useDebtDashboard.ts(106,35): error TS7006: Parameter 'debtId' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(116,38): error TS7006: Parameter 'debtId' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(116,46): error TS7006: Parameter 'paymentData' implicitly has an 'any' type.
src/hooks/debts/useDebtDashboard.ts(120,40): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/debts/useDebtDashboard.ts(122,25): error TS2345: Argument of type 'DebtAccount | undefined' is not assignable to parameter of type 'SetStateAction<null>'.
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
src/hooks/debts/useDebtForm.ts(30,33): error TS7006: Parameter 'connectedBill' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(34,23): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(36,24): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(36,30): error TS7006: Parameter 'connectedEnvelope' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(38,28): error TS7006: Parameter 'connectedBill' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(40,28): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(48,33): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(56,34): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(56,40): error TS7006: Parameter 'connectedBill' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(56,55): error TS7006: Parameter 'connectedEnvelope' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(64,28): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(64,34): error TS7006: Parameter 'connectedBill' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(64,49): error TS7006: Parameter 'connectedEnvelope' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(101,31): error TS7006: Parameter 'onSubmitCallback' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(127,37): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/debts/useDebtForm.ts(158,27): error TS7006: Parameter 'updates' implicitly has an 'any' type.
src/hooks/debts/useDebtForm.ts(161,44): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/hooks/debts/useDebtForm.ts(165,18): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/hooks/debts/useDebtManagement.ts(78,7): error TS2345: Argument of type 'UseMutateAsyncFunction<{ envelopeType: string; name: string; category: string; targetAmount: number; description?: string | undefined; id: string; currentBalance: number; archived: boolean; createdAt: number; lastModified: number; }, Error, AddEnvelopeData, unknown>' is not assignable to parameter of type '(data: unknown) => unknown'.
  Types of parameters 'variables' and 'data' are incompatible.
    Type 'unknown' is not assignable to type 'AddEnvelopeData'.
src/hooks/debts/useDebtModalLogic.ts(15,35): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtModalLogic.ts(15,41): error TS7006: Parameter 'isOpen' implicitly has an 'any' type.
src/hooks/debts/useDebtModalLogic.ts(15,49): error TS7006: Parameter 'onSubmit' implicitly has an 'any' type.
src/hooks/debts/useDebtModalLogic.ts(15,59): error TS7006: Parameter 'onClose' implicitly has an 'any' type.
src/hooks/debts/useDebtModalLogic.ts(56,50): error TS2345: Argument of type 'Bill | null | undefined' is not assignable to parameter of type 'null | undefined'.
  Type 'Bill' is not assignable to type 'null | undefined'.
src/hooks/debts/useDebtModalLogic.ts(83,35): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/hooks/debts/useDebtModalLogic.ts(140,47): error TS18049: 'connectedEnvelope' is possibly 'null' or 'undefined'.
src/hooks/debts/useDebtStrategies.ts(11,40): error TS2339: Property 'status' does not exist on type 'never'.
src/hooks/debts/useDebtStrategies.ts(11,68): error TS2339: Property 'currentBalance' does not exist on type 'never'.
src/hooks/debts/useDebtStrategies.ts(19,20): error TS2339: Property 'interestRate' does not exist on type 'never'.
src/hooks/debts/useDebtStrategies.ts(19,44): error TS2339: Property 'interestRate' does not exist on type 'never'.
src/hooks/debts/useDebtStrategies.ts(32,9): error TS2698: Spread types may only be created from object types.
src/hooks/debts/useDebtStrategies.ts(54,20): error TS2339: Property 'currentBalance' does not exist on type 'never'.
src/hooks/debts/useDebtStrategies.ts(54,46): error TS2339: Property 'currentBalance' does not exist on type 'never'.
src/hooks/debts/useDebtStrategies.ts(67,9): error TS2698: Spread types may only be created from object types.
src/hooks/debts/useDebtStrategies.ts(163,30): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtStrategies.ts(181,33): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtStrategies.ts(190,44): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtStrategies.ts(190,50): error TS7006: Parameter 'extraPayment' implicitly has an 'any' type.
src/hooks/debts/useDebtStrategies.ts(214,31): error TS7006: Parameter 'activeDebts' implicitly has an 'any' type.
src/hooks/debts/useDebtStrategies.ts(218,49): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtStrategies.ts(219,44): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/hooks/debts/useDebtStrategies.ts(219,49): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtStrategies.ts(221,6): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/hooks/debts/useDebtStrategies.ts(221,11): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtStrategies.ts(242,47): error TS7006: Parameter 'debt' implicitly has an 'any' type.
src/hooks/debts/useDebtStrategies.ts(255,35): error TS7006: Parameter 'recommendation' implicitly has an 'any' type.
src/hooks/debts/useDebts.ts(27,14): error TS18046: 'error' is of type 'unknown'.
src/hooks/debts/useDebts.ts(35,28): error TS7006: Parameter 'debtData' implicitly has an 'any' type.
src/hooks/debts/useDebts.ts(45,5): error TS2322: Type 'null' is not assignable to type 'Debt'.
src/hooks/debts/useDebts.ts(54,33): error TS7031: Binding element 'id' implicitly has an 'any' type.
src/hooks/debts/useDebts.ts(54,37): error TS7031: Binding element 'updates' implicitly has an 'any' type.
src/hooks/debts/useDebts.ts(67,5): error TS2322: Type 'Debt | undefined' is not assignable to type 'Debt'.
  Type 'undefined' is not assignable to type 'Debt'.
src/hooks/debts/useDebts.ts(68,5): error TS2322: Type 'Debt | undefined' is not assignable to type 'Debt'.
  Type 'undefined' is not assignable to type 'Debt'.
src/hooks/debts/useDebts.ts(76,35): error TS7031: Binding element 'id' implicitly has an 'any' type.
src/hooks/debts/useDebts.ts(86,7): error TS2322: Type 'null' is not assignable to type 'Debt'.
src/hooks/debts/useDebts.ts(95,36): error TS7031: Binding element 'id' implicitly has an 'any' type.
src/hooks/debts/useDebts.ts(95,40): error TS7031: Binding element 'payment' implicitly has an 'any' type.
src/hooks/debts/useDebts.ts(213,24): error TS7006: Parameter 'id' implicitly has an 'any' type.
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
src/hooks/layout/useLayoutData.ts(59,7): error TS2352: Conversion of type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction[]' to type 'import("/home/runner/work/violet-vault/violet-vault/src/utils/budgeting/envelopeCalculations").Transaction[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/db/types").Transaction' is not comparable to type 'import("/home/runner/work/violet-vault/violet-vault/src/utils/budgeting/envelopeCalculations").Transaction'.
    Types of property 'date' are incompatible.
      Type 'Date' is not comparable to type 'string'.
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
src/hooks/mobile/useFABLoadingStates.ts(15,6): error TS7006: Parameter 'actionId' implicitly has an 'any' type.
src/hooks/mobile/useFABLoadingStates.ts(27,37): error TS7006: Parameter 'actionId' implicitly has an 'any' type.
src/hooks/mobile/useFABLoadingStates.ts(32,36): error TS7006: Parameter 'actionId' implicitly has an 'any' type.
src/hooks/mobile/useFABLoadingStates.ts(42,6): error TS7006: Parameter 'actionId' implicitly has an 'any' type.
src/hooks/mobile/useFABLoadingStates.ts(42,16): error TS7006: Parameter 'actionFn' implicitly has an 'any' type.
src/hooks/mobile/useFABLoadingStates.ts(43,21): error TS7019: Rest parameter 'args' implicitly has an 'any[]' type.
src/hooks/mobile/useFABLoadingStates.ts(62,20): error TS18046: 'error' is of type 'unknown'.
src/hooks/mobile/useFABLoadingStates.ts(64,20): error TS18046: 'error' is of type 'unknown'.
src/hooks/mobile/useFABLoadingStates.ts(68,46): error TS18046: 'error' is of type 'unknown'.
src/hooks/mobile/useFABLoadingStates.ts(82,6): error TS7006: Parameter 'actionId' implicitly has an 'any' type.
src/hooks/mobile/useFABLoadingStates.ts(82,16): error TS7006: Parameter 'actionFn' implicitly has an 'any' type.
src/hooks/mobile/useFABLoadingStates.ts(82,26): error TS7006: Parameter 'actionLabel' implicitly has an 'any' type.
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
src/hooks/settings/useSettingsSectionRenderer.ts(16,3): error TS7031: Binding element 'isLocalOnlyMode' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(17,3): error TS7031: Binding element 'cloudSyncEnabled' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(18,3): error TS7031: Binding element 'isSyncing' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(19,3): error TS7031: Binding element 'onOpenLocalOnlySettings' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(20,3): error TS7031: Binding element 'onToggleCloudSync' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(21,3): error TS7031: Binding element 'onManualSync' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(24,3): error TS7031: Binding element 'currentUser' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(25,3): error TS7031: Binding element 'onOpenPasswordModal' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(26,3): error TS7031: Binding element 'onLogout' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(27,3): error TS7031: Binding element 'onOpenResetConfirm' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(28,3): error TS7031: Binding element 'onUpdateProfile' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(31,3): error TS7031: Binding element 'securityManager' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(32,3): error TS7031: Binding element 'onOpenSecuritySettings' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(33,3): error TS7031: Binding element 'onShowLocalDataSecurity' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(36,3): error TS7031: Binding element 'onOpenActivityFeed' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(37,3): error TS7031: Binding element 'onExport' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(38,3): error TS7031: Binding element 'onImport' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(39,3): error TS7031: Binding element 'onSync' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(42,3): error TS7031: Binding element 'onOpenEnvelopeChecker' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(43,3): error TS7031: Binding element 'onCreateTestHistory' implicitly has an 'any' type.
src/hooks/settings/useSettingsSectionRenderer.ts(45,33): error TS7006: Parameter 'activeSection' implicitly has an 'any' type.
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
src/hooks/transactions/useTransactionAnalytics.ts(6,24): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/transactions/useTransactionAnalytics.ts(7,35): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/transactions/useTransactionAnalytics.ts(9,36): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/transactions/useTransactionAnalytics.ts(9,75): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/transactions/useTransactionAnalytics.ts(11,63): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/transactions/useTransactionAnalytics.ts(16,26): error TS2339: Property 'category' does not exist on type 'never'.
src/hooks/transactions/useTransactionAnalytics.ts(17,12): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/transactions/useTransactionAnalytics.ts(18,9): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/transactions/useTransactionAnalytics.ts(21,13): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/transactions/useTransactionAnalytics.ts(22,9): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/transactions/useTransactionAnalytics.ts(22,35): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/transactions/useTransactionAnalytics.ts(24,9): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/transactions/useTransactionAnalytics.ts(24,46): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/transactions/useTransactionAnalytics.ts(26,7): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/transactions/useTransactionAnalytics.ts(33,22): error TS2339: Property 'date' does not exist on type 'never'.
src/hooks/transactions/useTransactionAnalytics.ts(34,12): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/transactions/useTransactionAnalytics.ts(35,9): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/transactions/useTransactionAnalytics.ts(38,13): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/transactions/useTransactionAnalytics.ts(39,9): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/transactions/useTransactionAnalytics.ts(39,31): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/transactions/useTransactionAnalytics.ts(41,9): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/transactions/useTransactionAnalytics.ts(41,42): error TS2339: Property 'amount' does not exist on type 'never'.
src/hooks/transactions/useTransactionAnalytics.ts(43,7): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/hooks/transactions/useTransactionAnalytics.ts(53,52): error TS2339: Property 'date' does not exist on type 'never'.
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
src/hooks/transactions/useTransactionData.ts(85,54): error TS2345: Argument of type 'Logger' is not assignable to parameter of type 'Logger'.
  Types of property 'debug' are incompatible.
    Type '(message: string, data?: Record<string, unknown>) => void' is not assignable to type '(msg: string, data?: unknown) => void'.
      Types of parameters 'data' and 'data' are incompatible.
        Type 'unknown' is not assignable to type 'Record<string, unknown> | undefined'.
src/hooks/transactions/useTransactionData.ts(88,5): error TS2769: No overload matches this call.
  Overload 1 of 3, '(options: DefinedInitialDataOptions<unknown, Error, unknown, (string | FilterParams)[]>, queryClient?: QueryClient | undefined): DefinedUseQueryResult<...>', gave the following error.
    Type 'number | null' is not assignable to type 'number | false | ((query: Query<unknown, Error, unknown, (string | FilterParams)[]>) => number | false | undefined) | undefined'.
      Type 'null' is not assignable to type 'number | false | ((query: Query<unknown, Error, unknown, (string | FilterParams)[]>) => number | false | undefined) | undefined'.
  Overload 2 of 3, '(options: UndefinedInitialDataOptions<Transaction[], Error, Transaction[], (string | FilterParams)[]>, queryClient?: QueryClient | undefined): UseQueryResult<...>', gave the following error.
    Type 'number | null' is not assignable to type 'number | false | ((query: Query<Transaction[], Error, Transaction[], (string | FilterParams)[]>) => number | false | undefined) | undefined'.
      Type 'null' is not assignable to type 'number | false | ((query: Query<Transaction[], Error, Transaction[], (string | FilterParams)[]>) => number | false | undefined) | undefined'.
  Overload 3 of 3, '(options: UseQueryOptions<Transaction[], Error, Transaction[], (string | FilterParams)[]>, queryClient?: QueryClient | undefined): UseQueryResult<...>', gave the following error.
    Type 'number | null' is not assignable to type 'number | false | ((query: Query<Transaction[], Error, Transaction[], (string | FilterParams)[]>) => number | false | undefined) | undefined'.
      Type 'null' is not assignable to type 'number | false | ((query: Query<Transaction[], Error, Transaction[], (string | FilterParams)[]>) => number | false | undefined) | undefined'.
src/hooks/transactions/useTransactionData.ts(98,45): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(131,32): error TS2339: Property 'length' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(134,40): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(139,38): error TS2339: Property 'length' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(140,16): error TS18046: 'error' is of type 'unknown'.
src/hooks/transactions/useTransactionData.ts(147,33): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(151,33): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(155,34): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(159,35): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(163,32): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(167,40): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(173,12): error TS7006: Parameter 'startDate' implicitly has an 'any' type.
src/hooks/transactions/useTransactionData.ts(173,23): error TS7006: Parameter 'endDate' implicitly has an 'any' type.
src/hooks/transactions/useTransactionData.ts(173,53): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(177,12): error TS7006: Parameter 'envelopeId' implicitly has an 'any' type.
src/hooks/transactions/useTransactionData.ts(177,44): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(181,12): error TS7006: Parameter 'categoryName' implicitly has an 'any' type.
src/hooks/transactions/useTransactionData.ts(181,46): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(185,12): error TS7006: Parameter 'query' implicitly has an 'any' type.
src/hooks/transactions/useTransactionData.ts(185,47): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/hooks/transactions/useTransactionData.ts(193,50): error TS2339: Property 'length' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(193,85): error TS2339: Property 'length' does not exist on type '{}'.
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
src/hooks/transactions/useTransactionImport.ts(97,27): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'SetStateAction<never[]>'.
  Type 'unknown[]' is not assignable to type 'never[]'.
    Type 'unknown' is not assignable to type 'never'.
src/hooks/transactions/useTransactionImportProcessing.ts(9,48): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/hooks/transactions/useTransactionImportProcessing.ts(43,38): error TS7006: Parameter 'importData' implicitly has an 'any' type.
src/hooks/transactions/useTransactionImportProcessing.ts(43,50): error TS7006: Parameter 'fieldMapping' implicitly has an 'any' type.
src/hooks/transactions/useTransactionImportProcessing.ts(86,35): error TS7006: Parameter 'processedTransactions' implicitly has an 'any' type.
src/hooks/transactions/useTransactionImportProcessing.ts(86,58): error TS7006: Parameter 'importData' implicitly has an 'any' type.
src/hooks/transactions/useTransactionImportProcessing.ts(86,70): error TS7006: Parameter 'autoFundingPromises' implicitly has an 'any' type.
src/hooks/transactions/useTransactionImportProcessing.ts(87,55): error TS7006: Parameter 't' implicitly has an 'any' type.
src/hooks/transactions/useTransactionImportProcessing.ts(88,56): error TS7006: Parameter 't' implicitly has an 'any' type.
src/hooks/transactions/useTransactionImportProcessing.ts(99,10): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/hooks/transactions/useTransactionImportProcessing.ts(99,15): error TS7006: Parameter 'result' implicitly has an 'any' type.
src/hooks/transactions/useTransactionImportProcessing.ts(105,58): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/hooks/transactions/useTransactionImportProcessing.ts(105,63): error TS7006: Parameter 'result' implicitly has an 'any' type.
src/hooks/transactions/useTransactionLedger.ts(7,10): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/hooks/transactions/useTransactionLedger.ts(34,18): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/hooks/transactions/useTransactionLedger.ts(102,5): error TS2345: Argument of type 'UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>' is not assignable to parameter of type 'AddTransactionFn'.
  Types of parameters 'variables' and 'transaction' are incompatible.
    Type 'unknown' is not assignable to type 'TransactionInput'.
src/hooks/transactions/useTransactionLedger.ts(156,44): error TS2339: Property 'id' does not exist on type 'never'.
src/hooks/transactions/useTransactionLedger.ts(200,22): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/hooks/transactions/useTransactionLedger.ts(224,29): error TS7006: Parameter 'direction' implicitly has an 'any' type.
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
src/services/authService.ts(67,16): error TS18046: 'parseError' is of type 'unknown'.
src/services/authService.ts(107,14): error TS18046: 'error' is of type 'unknown'.
src/services/authService.ts(108,18): error TS18046: 'error' is of type 'unknown'.
src/services/authService.ts(111,14): error TS18046: 'error' is of type 'unknown'.
src/services/authService.ts(302,20): error TS18046: 'decryptError' is of type 'unknown'.
src/services/authService.ts(303,24): error TS18046: 'decryptError' is of type 'unknown'.
src/services/authService.ts(354,11): error TS18046: 'error' is of type 'unknown'.
src/services/authService.ts(354,46): error TS18046: 'error' is of type 'unknown'.
src/services/authService.ts(502,37): error TS18046: 'error' is of type 'unknown'.
src/services/authService.ts(547,9): error TS18046: 'error' is of type 'unknown'.
src/services/authService.ts(547,44): error TS18046: 'error' is of type 'unknown'.
src/services/authService.ts(573,13): error TS7034: Variable 'useBudgetStore' implicitly has type 'any' in some locations where its type cannot be determined.
src/services/authService.ts(574,25): error TS7005: Variable 'useBudgetStore' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(38,22): error TS7006: Parameter 'options' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(122,35): error TS7006: Parameter 'options' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(144,34): error TS7006: Parameter 'options' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(164,25): error TS7006: Parameter 'options' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(201,26): error TS7006: Parameter 'entityType' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(220,26): error TS7006: Parameter 'entityType' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(258,22): error TS7006: Parameter 'options' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(305,22): error TS7006: Parameter 'branchName' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(345,19): error TS7006: Parameter 'options' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(406,20): error TS7006: Parameter 'commitData' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(406,32): error TS7006: Parameter 'deviceFingerprint' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(435,33): error TS7006: Parameter 'author' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(435,41): error TS7006: Parameter 'currentFingerprint' implicitly has an 'any' type.
src/services/budgetHistoryService.ts(493,9): error TS7053: Element implicitly has an 'any' type because expression of type '"create" | "update" | "delete"' can't be used to index type '{}'.
  Property 'create' does not exist on type '{}'.
src/services/budgetHistoryService.ts(494,12): error TS7053: Element implicitly has an 'any' type because expression of type '"create" | "update" | "delete"' can't be used to index type '{}'.
  Property 'create' does not exist on type '{}'.
src/services/budgetHistoryService.ts(495,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/budgetHistoryService.ts(496,12): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/budgetHistoryService.ts(501,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/budgetHistoryService.ts(501,51): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/budgetHistoryService.ts(507,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/budgetHistoryService.ts(507,41): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/budgetHistoryService.ts(518,9): error TS7053: Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{}'.
  No index signature with a parameter of type 'number' was found on type '{}'.
src/services/budgetHistoryService.ts(518,29): error TS7053: Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{}'.
  No index signature with a parameter of type 'number' was found on type '{}'.
src/services/budgetHistoryService.ts(521,7): error TS2322: Type 'string' is not assignable to type 'null'.
src/services/budgetHistoryService.ts(522,28): error TS2769: No overload matches this call.
  Overload 1 of 3, '(callbackfn: (previousValue: string, currentValue: string, currentIndex: number, array: string[]) => string, initialValue: string): string', gave the following error.
    Type 'string | null' is not assignable to type 'string'.
      Type 'null' is not assignable to type 'string'.
  Overload 2 of 3, '(callbackfn: (previousValue: null, currentValue: string, currentIndex: number, array: string[]) => null, initialValue: null): null', gave the following error.
    Type 'string | null' is not assignable to type 'null'.
      Type 'string' is not assignable to type 'null'.
src/services/budgetHistoryService.ts(522,29): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/budgetHistoryService.ts(522,60): error TS2538: Type 'null' cannot be used as an index type.
src/services/budgetHistoryService.ts(536,19): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/services/bugReport/apiService.ts(161,77): error TS2345: Argument of type 'ProviderConfig[]' is not assignable to parameter of type 'never[]'.
  Type 'ProviderConfig' is not assignable to type 'never'.
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
src/services/bugReport/githubApiService.ts(138,16): error TS18046: 'error' is of type 'unknown'.
src/services/bugReport/githubApiService.ts(289,41): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(293,9): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(294,39): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(294,66): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(298,9): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(299,40): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(299,69): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(303,9): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(305,9): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(306,13): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(307,13): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(312,9): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(313,32): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(317,39): error TS18048: 'systemInfo' is possibly 'undefined'.
src/services/bugReport/githubApiService.ts(343,73): error TS2339: Property 'errors' does not exist on type '{ appVersion?: string | undefined; browser?: { name: string; version: string; } | undefined; viewport?: { width: number; height: number; } | undefined; userAgent?: string | undefined; performance?: { ...; } | undefined; timestamp?: string | undefined; errors?: { ...; } | undefined; } | undefined'.
src/services/bugReport/githubApiService.ts(353,29): error TS7006: Parameter 'error' implicitly has an 'any' type.
src/services/bugReport/githubApiService.ts(353,36): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/services/bugReport/githubApiService.ts(380,15): error TS7006: Parameter 'log' implicitly has an 'any' type.
src/services/bugReport/githubApiService.ts(439,16): error TS18046: 'error' is of type 'unknown'.
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
src/services/bugReport/performanceInfoService.ts(175,29): error TS18048: 'navigation.domContentLoadedEventEnd' is possibly 'undefined'.
src/services/bugReport/performanceInfoService.ts(175,68): error TS18048: 'navigation.fetchStart' is possibly 'undefined'.
src/services/bugReport/performanceInfoService.ts(176,25): error TS18048: 'navigation.loadEventEnd' is possibly 'undefined'.
src/services/bugReport/performanceInfoService.ts(176,52): error TS18048: 'navigation.fetchStart' is possibly 'undefined'.
src/services/bugReport/performanceInfoService.ts(177,27): error TS18048: 'navigation.domInteractive' is possibly 'undefined'.
src/services/bugReport/performanceInfoService.ts(177,56): error TS18048: 'navigation.fetchStart' is possibly 'undefined'.
src/services/bugReport/performanceInfoService.ts(193,56): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/performanceInfoService.ts(215,52): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/performanceInfoService.ts(353,9): error TS2322: Type 'string | undefined' is not assignable to type 'string | null'.
  Type 'undefined' is not assignable to type 'string | null'.
src/services/bugReport/performanceInfoService.ts(354,9): error TS2322: Type 'number | undefined' is not assignable to type 'number | null'.
  Type 'undefined' is not assignable to type 'number | null'.
src/services/bugReport/performanceInfoService.ts(355,9): error TS2322: Type 'number | undefined' is not assignable to type 'number | null'.
  Type 'undefined' is not assignable to type 'number | null'.
src/services/bugReport/performanceInfoService.ts(361,52): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/performanceInfoService.ts(390,53): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/reportSubmissionService.ts(16,36): error TS7006: Parameter 'reportData' implicitly has an 'any' type.
src/services/bugReport/reportSubmissionService.ts(49,68): error TS2339: Property 'config' does not exist on type '{ type: string; priority: number; url?: undefined; } | { type: string; priority: number; url: string | undefined; }'.
  Property 'config' does not exist on type '{ type: string; priority: number; url?: undefined; }'.
src/services/bugReport/reportSubmissionService.ts(63,11): error TS2783: 'provider' is specified more than once, so this usage will be overwritten.
src/services/bugReport/reportSubmissionService.ts(73,25): error TS2339: Property 'redundant' does not exist on type '{ type: string; priority: number; url?: undefined; } | { type: string; priority: number; url: string | undefined; }'.
  Property 'redundant' does not exist on type '{ type: string; priority: number; url?: undefined; }'.
src/services/bugReport/reportSubmissionService.ts(81,18): error TS18046: 'error' is of type 'unknown'.
src/services/bugReport/reportSubmissionService.ts(117,32): error TS7006: Parameter 'reportData' implicitly has an 'any' type.
src/services/bugReport/reportSubmissionService.ts(117,44): error TS7006: Parameter 'webhookUrl' implicitly has an 'any' type.
src/services/bugReport/reportSubmissionService.ts(164,16): error TS18046: 'error' is of type 'unknown'.
src/services/bugReport/reportSubmissionService.ts(176,30): error TS7006: Parameter '_reportData' implicitly has an 'any' type.
src/services/bugReport/reportSubmissionService.ts(176,43): error TS7006: Parameter 'emailConfig' implicitly has an 'any' type.
src/services/bugReport/reportSubmissionService.ts(192,16): error TS18046: 'error' is of type 'unknown'.
src/services/bugReport/reportSubmissionService.ts(203,32): error TS7006: Parameter 'reportData' implicitly has an 'any' type.
src/services/bugReport/reportSubmissionService.ts(229,67): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/reportSubmissionService.ts(240,16): error TS18046: 'error' is of type 'unknown'.
src/services/bugReport/reportSubmissionService.ts(256,46): error TS7006: Parameter 'r' implicitly has an 'any' type.
src/services/bugReport/reportSubmissionService.ts(265,54): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/bugReport/reportSubmissionService.ts(271,16): error TS18046: 'error' is of type 'unknown'.
src/services/bugReport/reportSubmissionService.ts(286,39): error TS18046: 'error' is of type 'unknown'.
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
src/services/chunkedSyncService.ts(77,80): error TS18046: 'error' is of type 'unknown'.
src/services/chunkedSyncService.ts(144,25): error TS2769: No overload matches this call.
  Overload 1 of 4, '(app: FirebaseApp): Firestore', gave the following error.
    Argument of type 'FirebaseApp | null' is not assignable to parameter of type 'FirebaseApp'.
      Type 'null' is not assignable to type 'FirebaseApp'.
  Overload 2 of 4, '(databaseId: string): Firestore', gave the following error.
    Argument of type 'FirebaseApp | null' is not assignable to parameter of type 'string'.
      Type 'null' is not assignable to type 'string'.
src/services/chunkedSyncService.ts(150,17): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/services/chunkedSyncService.ts(168,23): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/services/chunkedSyncService.ts(189,68): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/chunkedSyncService.ts(200,20): error TS7006: Parameter 'array' implicitly has an 'any' type.
src/services/chunkedSyncService.ts(200,27): error TS7006: Parameter 'arrayName' implicitly has an 'any' type.
src/services/chunkedSyncService.ts(209,7): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/services/chunkedSyncService.ts(230,7): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/chunkedSyncService.ts(239,19): error TS7006: Parameter 'arrayName' implicitly has an 'any' type.
src/services/chunkedSyncService.ts(239,30): error TS7006: Parameter 'chunkIndex' implicitly has an 'any' type.
src/services/chunkedSyncService.ts(247,24): error TS7006: Parameter 'chunkMap' implicitly has an 'any' type.
src/services/chunkedSyncService.ts(269,7): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/chunkedSyncService.ts(343,51): error TS2769: No overload matches this call.
  Overload 1 of 2, '(o: ArrayLike<unknown> | { [s: string]: unknown; }): [string, unknown][]', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'ArrayLike<unknown> | { [s: string]: unknown; }'.
  Overload 2 of 2, '(o: {}): [string, any][]', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type '{}'.
src/services/chunkedSyncService.ts(349,13): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/chunkedSyncService.ts(352,13): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/chunkedSyncService.ts(363,37): error TS2769: No overload matches this call.
  Overload 1 of 2, '(o: {}): string[]', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type '{}'.
  Overload 2 of 2, '(o: object): string[]', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'object'.
src/services/chunkedSyncService.ts(398,38): error TS2769: No overload matches this call.
  Overload 1 of 2, '(o: {}): string[]', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type '{}'.
  Overload 2 of 2, '(o: object): string[]', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'object'.
src/services/chunkedSyncService.ts(399,38): error TS18046: 'data' is of type 'unknown'.
src/services/chunkedSyncService.ts(399,52): error TS18046: 'data' is of type 'unknown'.
src/services/chunkedSyncService.ts(410,29): error TS2769: No overload matches this call.
  Overload 1 of 3, '(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'string | null' is not assignable to parameter of type 'string'.
      Type 'null' is not assignable to type 'string'.
  Overload 2 of 3, '(reference: CollectionReference<unknown, DocumentData>, path?: string | undefined, ...pathSegments: string[]): DocumentReference<unknown, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'CollectionReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'CollectionReference<unknown, DocumentData>': id, path, parent, withConverter, and 2 more.
  Overload 3 of 3, '(reference: DocumentReference<unknown, DocumentData>, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'DocumentReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'DocumentReference<unknown, DocumentData>': converter, firestore, id, path, and 2 more.
src/services/chunkedSyncService.ts(526,24): error TS2769: No overload matches this call.
  Overload 1 of 3, '(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'string | null' is not assignable to parameter of type 'string'.
      Type 'null' is not assignable to type 'string'.
  Overload 2 of 3, '(reference: CollectionReference<unknown, DocumentData>, path?: string | undefined, ...pathSegments: string[]): DocumentReference<unknown, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'CollectionReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'CollectionReference<unknown, DocumentData>': id, path, parent, withConverter, and 2 more.
  Overload 3 of 3, '(reference: DocumentReference<unknown, DocumentData>, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>', gave the following error.
    Argument of type 'Firestore' is not assignable to parameter of type 'DocumentReference<unknown, DocumentData>'.
      Type 'Firestore' is missing the following properties from type 'DocumentReference<unknown, DocumentData>': converter, firestore, id, path, and 2 more.
src/services/chunkedSyncService.ts(571,22): error TS18046: 'decryptError' is of type 'unknown'.
src/services/chunkedSyncService.ts(572,26): error TS18046: 'decryptError' is of type 'unknown'.
src/services/chunkedSyncService.ts(578,56): error TS18046: 'decryptError' is of type 'unknown'.
src/services/chunkedSyncService.ts(680,24): error TS18046: 'chunkDecryptError' is of type 'unknown'.
src/services/chunkedSyncService.ts(681,28): error TS18046: 'chunkDecryptError' is of type 'unknown'.
src/services/chunkedSyncService.ts(715,13): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/services/editLockService.ts(52,14): error TS7006: Parameter 'budgetId' implicitly has an 'any' type.
src/services/editLockService.ts(52,24): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/services/editLockService.ts(64,21): error TS7006: Parameter 'recordType' implicitly has an 'any' type.
src/services/editLockService.ts(64,33): error TS7006: Parameter 'recordId' implicitly has an 'any' type.
src/services/editLockService.ts(77,7): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/services/editLockService.ts(118,19): error TS2531: Object is possibly 'null'.
src/services/editLockService.ts(130,21): error TS7006: Parameter 'recordType' implicitly has an 'any' type.
src/services/editLockService.ts(130,33): error TS7006: Parameter 'recordId' implicitly has an 'any' type.
src/services/editLockService.ts(148,9): error TS18046: 'error' is of type 'unknown'.
src/services/editLockService.ts(149,9): error TS18046: 'error' is of type 'unknown'.
src/services/editLockService.ts(162,39): error TS18046: 'error' is of type 'unknown'.
src/services/editLockService.ts(169,17): error TS7006: Parameter 'recordType' implicitly has an 'any' type.
src/services/editLockService.ts(169,29): error TS7006: Parameter 'recordId' implicitly has an 'any' type.
src/services/editLockService.ts(188,9): error TS18046: 'error' is of type 'unknown'.
src/services/editLockService.ts(189,9): error TS18046: 'error' is of type 'unknown'.
src/services/editLockService.ts(206,13): error TS7006: Parameter 'recordType' implicitly has an 'any' type.
src/services/editLockService.ts(206,25): error TS7006: Parameter 'recordId' implicitly has an 'any' type.
src/services/editLockService.ts(206,35): error TS7006: Parameter 'callback' implicitly has an 'any' type.
src/services/editLockService.ts(238,15): error TS7006: Parameter 'recordType' implicitly has an 'any' type.
src/services/editLockService.ts(238,27): error TS7006: Parameter 'recordId' implicitly has an 'any' type.
src/services/editLockService.ts(250,18): error TS7006: Parameter 'lockId' implicitly has an 'any' type.
src/services/editLockService.ts(278,63): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/services/editLockService.ts(290,17): error TS7006: Parameter 'lockId' implicitly has an 'any' type.
src/services/editLockService.ts(302,12): error TS7006: Parameter 'recordType' implicitly has an 'any' type.
src/services/editLockService.ts(302,24): error TS7006: Parameter 'recordId' implicitly has an 'any' type.
src/services/editLockService.ts(341,37): error TS7006: Parameter 'budgetId' implicitly has an 'any' type.
src/services/editLockService.ts(341,47): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
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
src/services/tipService.ts(69,43): error TS18048: 'tip.minUserMaturity' is possibly 'undefined'.
src/services/typedChunkedSyncService.ts(275,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/stores/ui/fabStore.ts(216,14): error TS7022: 'useFABStore' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.
src/stores/ui/fabStore.ts(249,11): error TS7023: 'getDebugInfo' implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.
src/stores/ui/fabStore.ts(251,19): error TS7022: 'state' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.
src/stores/ui/fabStore.ts(283,38): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(284,34): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(285,35): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(286,38): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(287,38): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(288,41): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(304,41): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(305,38): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(306,36): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(307,39): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(308,46): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(309,48): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(310,48): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(311,50): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(312,48): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/stores/ui/fabStore.ts(313,43): error TS7006: Parameter 'state' implicitly has an 'any' type.
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
src/utils/accounts/accountHelpers.ts(41,36): error TS7006: Parameter 'type' implicitly has an 'any' type.
src/utils/accounts/accountHelpers.ts(53,35): error TS7006: Parameter 'accountForm' implicitly has an 'any' type.
src/utils/accounts/accountHelpers.ts(53,48): error TS7006: Parameter 'currentUser' implicitly has an 'any' type.
src/utils/accounts/accountHelpers.ts(116,32): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/utils/accounts/accountHelpers.ts(151,3): error TS7031: Binding element 'accountId' implicitly has an 'any' type.
src/utils/accounts/accountHelpers.ts(152,3): error TS7031: Binding element 'type' implicitly has an 'any' type.
src/utils/accounts/accountHelpers.ts(153,3): error TS7031: Binding element 'amount' implicitly has an 'any' type.
src/utils/accounts/accountHelpers.ts(154,3): error TS7031: Binding element 'description' implicitly has an 'any' type.
src/utils/accounts/accountHelpers.ts(175,37): error TS7006: Parameter 'color' implicitly has an 'any' type.
src/utils/accounts/accountHelpers.ts(210,45): error TS7006: Parameter 'currentBalance' implicitly has an 'any' type.
src/utils/accounts/accountHelpers.ts(210,61): error TS7006: Parameter 'annualContribution' implicitly has an 'any' type.
src/utils/accounts/accountHelpers.ts(295,46): error TS18048: 'filters.minBalance' is possibly 'undefined'.
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
src/utils/bills/billUpdateHelpers.ts(10,41): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(10,47): error TS7006: Parameter 'updateFunctions' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(25,71): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/bills/billUpdateHelpers.ts(33,44): error TS7006: Parameter 'items' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(33,51): error TS7006: Parameter 'operationName' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(33,66): error TS7006: Parameter 'operationFn' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(45,35): error TS18046: 'error' is of type 'unknown'.
src/utils/bills/billUpdateHelpers.ts(67,40): error TS7006: Parameter 'selectedBills' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(67,55): error TS7006: Parameter 'changes' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(68,46): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(76,50): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(76,55): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(92,28): error TS7006: Parameter 'change' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(100,48): error TS7006: Parameter 'change' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(118,41): error TS7006: Parameter 'selectedBills' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(118,56): error TS7006: Parameter 'changes' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(120,11): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(141,36): error TS7006: Parameter 'originalAmount' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(141,52): error TS7006: Parameter 'newAmount' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(160,34): error TS7006: Parameter 'originalDate' implicitly has an 'any' type.
src/utils/bills/billUpdateHelpers.ts(160,48): error TS7006: Parameter 'newDate' implicitly has an 'any' type.
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
src/utils/budgeting/billEnvelopeCalculations.ts(78,29): error TS7006: Parameter 'targetDate' implicitly has an 'any' type.
src/utils/budgeting/billEnvelopeCalculations.ts(88,35): error TS7006: Parameter 'currentBalance' implicitly has an 'any' type.
src/utils/budgeting/billEnvelopeCalculations.ts(88,51): error TS7006: Parameter 'targetAmount' implicitly has an 'any' type.
src/utils/budgeting/billEnvelopeCalculations.ts(88,65): error TS7006: Parameter 'nextBillAmount' implicitly has an 'any' type.
src/utils/budgeting/billEnvelopeCalculations.ts(98,39): error TS7006: Parameter 'linkedBills' implicitly has an 'any' type.
src/utils/budgeting/billEnvelopeCalculations.ts(103,14): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/utils/budgeting/billEnvelopeCalculations.ts(104,14): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/utils/budgeting/billEnvelopeCalculations.ts(104,19): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/utils/budgeting/billEnvelopeCalculations.ts(182,47): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/utils/budgeting/billEnvelopeCalculations.ts(260,43): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/utils/budgeting/billEnvelopeCalculations.ts(317,44): error TS7006: Parameter 'envelope' implicitly has an 'any' type.
src/utils/budgeting/billEnvelopeCalculations.ts(358,18): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ critical: { color: string; icon: string; bgColor: string; textColor: string; }; high: { color: string; icon: string; bgColor: string; textColor: string; }; medium: { color: string; icon: string; bgColor: string; textColor: string; }; low: { ...; }; none: { ...; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ critical: { color: string; icon: string; bgColor: string; textColor: string; }; high: { color: string; icon: string; bgColor: string; textColor: string; }; medium: { color: string; icon: string; bgColor: string; textColor: string; }; low: { ...; }; none: { ...; }; }'.
src/utils/budgeting/billEnvelopeCalculations.ts(372,13): error TS18048: 'currentBalance' is possibly 'undefined'.
src/utils/budgeting/billEnvelopeCalculations.ts(372,31): error TS18048: 'targetAmount' is possibly 'undefined'.
src/utils/budgeting/billEnvelopeCalculations.ts(377,25): error TS18047: 'daysUntilNextBill' is possibly 'null'.
src/utils/budgeting/billEnvelopeCalculations.ts(388,29): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ weekly: number; biweekly: number; monthly: number; quarterly: number; semiannual: number; yearly: number; }'.
  No index signature with a parameter of type 'string' was found on type '{ weekly: number; biweekly: number; monthly: number; quarterly: number; semiannual: number; yearly: number; }'.
src/utils/budgeting/billEnvelopeCalculations.ts(391,38): error TS18047: 'daysUntilNextBill' is possibly 'null'.
src/utils/budgeting/billEnvelopeCalculations.ts(393,35): error TS18048: 'targetAmount' is possibly 'undefined'.
src/utils/budgeting/billEnvelopeCalculations.ts(400,15): error TS18048: 'currentBalance' is possibly 'undefined'.
src/utils/budgeting/billEnvelopeCalculations.ts(404,52): error TS18048: 'currentBalance' is possibly 'undefined'.
src/utils/budgeting/envelopeCalculations.ts(110,63): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/utils/budgeting/envelopeCalculations.ts(521,24): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Record<FrequencyType, number>'.
  No index signature with a parameter of type 'string' was found on type 'Record<FrequencyType, number>'.
src/utils/budgeting/envelopeFormUtils.ts(126,5): error TS18048: 'zodResult.error' is possibly 'undefined'.
src/utils/budgeting/envelopeFormUtils.ts(129,9): error TS7053: Element implicitly has an 'any' type because expression of type 'string | number' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(164,22): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Record<EnvelopeType, EnvelopeTypeConfig>'.
  No index signature with a parameter of type 'string' was found on type 'Record<EnvelopeType, EnvelopeTypeConfig>'.
src/utils/budgeting/envelopeFormUtils.ts(418,22): error TS18048: 'envelope.monthlyAmount' is possibly 'undefined'.
src/utils/budgeting/envelopeFormUtils.ts(419,51): error TS18048: 'envelope.monthlyAmount' is possibly 'undefined'.
src/utils/budgeting/envelopeFormUtils.ts(467,9): error TS7034: Variable 'warnings' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/utils/budgeting/envelopeFormUtils.ts(468,9): error TS7034: Variable 'errors' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/utils/budgeting/envelopeFormUtils.ts(470,42): error TS7005: Variable 'warnings' implicitly has an 'any[]' type.
src/utils/budgeting/envelopeFormUtils.ts(470,52): error TS7005: Variable 'errors' implicitly has an 'any[]' type.
src/utils/budgeting/envelopeFormUtils.ts(477,9): error TS18048: 'envelope.targetAmount' is possibly 'undefined'.
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
src/utils/common/billDiscovery.ts(79,45): error TS7006: Parameter 'transactions' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(82,38): error TS2339: Property 'description' does not exist on type 'never'.
src/utils/common/billDiscovery.ts(82,73): error TS2339: Property 'provider' does not exist on type 'never'.
src/utils/common/billDiscovery.ts(108,35): error TS7006: Parameter 'transactions' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(111,25): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(117,10): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/utils/common/billDiscovery.ts(118,7): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/utils/common/billDiscovery.ts(120,5): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.
src/utils/common/billDiscovery.ts(127,7): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
src/utils/common/billDiscovery.ts(137,42): error TS7006: Parameter 'description' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(271,34): error TS7006: Parameter 'transactions' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(271,48): error TS7006: Parameter 'groupKey' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(275,35): error TS7006: Parameter 't' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(275,65): error TS7006: Parameter 'a' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(275,68): error TS7006: Parameter 'b' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(284,37): error TS7006: Parameter 't' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(285,37): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(285,42): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(321,28): error TS7006: Parameter 'description' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(343,41): error TS7006: Parameter 'transactions' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(343,55): error TS7006: Parameter 'bills' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(343,62): error TS7006: Parameter 'envelopes' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(364,34): error TS7006: Parameter 'bill' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(364,40): error TS7006: Parameter 'envelopes' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(396,8): error TS7006: Parameter 'word' implicitly has an 'any' type.
src/utils/common/billDiscovery.ts(396,56): error TS7006: Parameter 'envWord' implicitly has an 'any' type.
src/utils/common/budgetHistoryTracker.ts(109,41): error TS2345: Argument of type '{ hash: string; timestamp: number; message: string; author: string; parentHash: string | null; snapshotData: string; deviceFingerprint: string; }' is not assignable to parameter of type 'BudgetCommit'.
  Types of property 'parentHash' are incompatible.
    Type 'string | null' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/utils/common/fixAutoAllocateUndefined.ts(66,37): error TS18046: 'error' is of type 'unknown'.
src/utils/common/frequencyCalculations.ts(43,34): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(43,42): error TS7006: Parameter 'fromFrequency' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(43,57): error TS7006: Parameter 'toFrequency' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(48,26): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ weekly: number; biweekly: number; monthly: number; quarterly: number; yearly: number; }'.
src/utils/common/frequencyCalculations.ts(49,24): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ weekly: number; biweekly: number; monthly: number; quarterly: number; yearly: number; }'.
src/utils/common/frequencyCalculations.ts(68,28): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(68,36): error TS7006: Parameter 'fromFrequency' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(79,27): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(79,35): error TS7006: Parameter 'fromFrequency' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(90,26): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(90,34): error TS7006: Parameter 'fromFrequency' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(100,31): error TS7006: Parameter 'frequency' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(102,10): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ weekly: number; biweekly: number; monthly: number; quarterly: number; yearly: number; }'.
src/utils/common/frequencyCalculations.ts(114,3): error TS7006: Parameter 'targetAmount' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(115,3): error TS7006: Parameter 'targetFrequency' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(127,34): error TS7006: Parameter 'frequency' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(157,41): error TS7006: Parameter 'frequency' implicitly has an 'any' type.
src/utils/common/frequencyCalculations.ts(171,21): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ once: string; weekly: string; biweekly: string; monthly: string; quarterly: string; biannual: string; annual: string; yearly: string; }'.
src/utils/common/highlight.ts(285,73): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/lazyImport.ts(4,21): error TS7006: Parameter 'factory' implicitly has an 'any' type.
src/utils/common/lazyImport.ts(6,21): error TS7006: Parameter 'module' implicitly has an 'any' type.
src/utils/common/ocrProcessor.ts(349,43): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/testBudgetHistory.ts(47,39): error TS2345: Argument of type '{ hash: string; timestamp: number; message: string; author: string; parentHash: null; encryptedSnapshot: string; deviceFingerprint: string; }' is not assignable to parameter of type 'BudgetCommit'.
  Types of property 'parentHash' are incompatible.
    Type 'null' is not assignable to type 'string | undefined'.
src/utils/common/toastHelpers.ts(117,16): error TS7006: Parameter 'error' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(96,44): error TS18046: 'error' is of type 'unknown'.
src/utils/common/transactionArchiving.ts(103,23): error TS7006: Parameter 'months' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(113,37): error TS7006: Parameter 'cutoffDate' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(120,37): error TS7006: Parameter 'transactions' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(136,11): error TS2322: Type 'null' is not assignable to type 'number'.
src/utils/common/transactionArchiving.ts(213,25): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/utils/common/transactionArchiving.ts(239,21): error TS7006: Parameter 'transactions' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(239,35): error TS7006: Parameter 'periodType' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(242,27): error TS7006: Parameter 'transaction' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(265,35): error TS7006: Parameter 'transactions' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(278,41): error TS7006: Parameter 't' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(279,39): error TS7006: Parameter 't' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(282,36): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(282,41): error TS7006: Parameter 't' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(283,44): error TS7006: Parameter 't' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(284,43): error TS7006: Parameter 't' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(286,34): error TS7006: Parameter 't' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(306,9): error TS2322: Type 'null' is not assignable to type 'number'.
src/utils/common/transactionArchiving.ts(315,36): error TS7006: Parameter 'transactions' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(318,46): error TS7006: Parameter 't' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(343,68): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/transactionArchiving.ts(432,37): error TS7006: Parameter 'archiveId' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(471,32): error TS7006: Parameter 'config' implicitly has an 'any' type.
src/utils/common/transactionArchiving.ts(478,43): error TS7006: Parameter 'olderThanMonths' implicitly has an 'any' type.
src/utils/common/version.ts(47,52): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/version.ts(63,50): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/version.ts(118,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/version.ts(207,32): error TS7006: Parameter 'timestamp' implicitly has an 'any' type.
src/utils/common/version.ts(207,43): error TS7006: Parameter 'environment' implicitly has an 'any' type.
src/utils/common/version.ts(265,31): error TS7006: Parameter 'envVars' implicitly has an 'any' type.
src/utils/common/version.ts(265,40): error TS7006: Parameter 'vercelInfo' implicitly has an 'any' type.
src/utils/common/version.ts(293,27): error TS7006: Parameter 'environment' implicitly has an 'any' type.
src/utils/common/version.ts(293,40): error TS7006: Parameter 'branch' implicitly has an 'any' type.
src/utils/common/version.ts(293,48): error TS7006: Parameter 'fallbackVersion' implicitly has an 'any' type.
src/utils/common/version.ts(293,65): error TS7006: Parameter 'platform' implicitly has an 'any' type.
src/utils/common/version.ts(318,10): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ development: { branch: any; environment: string; futureVersion: any; isDevelopment: boolean; platform: string; }; preview: { branch: any; environment: string; futureVersion: any; isDevelopment: boolean; platform: string; }; production: { ...; }; }'.
src/utils/common/version.ts(408,72): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/version.ts(424,43): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/version.ts(433,37): error TS18047: 'versionCache.timestamp' is possibly 'null'.
src/utils/common/version.ts(455,53): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/version.ts(460,36): error TS7006: Parameter 'version' implicitly has an 'any' type.
src/utils/common/version.ts(465,53): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/version.ts(524,52): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/common/version.ts(532,42): error TS7006: Parameter 'fromVersion' implicitly has an 'any' type.
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
src/utils/debts/debtFormValidation.ts(181,30): error TS18048: 'monthsToPayoff' is possibly 'undefined'.
src/utils/debts/debtFormValidation.ts(182,20): error TS18048: 'monthsToPayoff' is possibly 'undefined'.
src/utils/debts/debtFormValidation.ts(201,35): error TS2345: Argument of type 'number | null | undefined' is not assignable to parameter of type 'number | null'.
  Type 'undefined' is not assignable to type 'number | null'.
src/utils/debts/debtFormValidation.ts(202,37): error TS2345: Argument of type 'number | undefined' is not assignable to parameter of type 'number | null'.
  Type 'undefined' is not assignable to type 'number | null'.
src/utils/debts/debtFormValidation.ts(203,5): error TS2322: Type 'boolean | undefined' is not assignable to type 'boolean'.
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
src/utils/receipts/receiptHelpers.tsx(11,37): error TS7006: Parameter 'receiptData' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(40,41): error TS7006: Parameter 'form' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(68,32): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(79,35): error TS7006: Parameter 'dateString' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(97,42): error TS7006: Parameter 'confidence' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(110,36): error TS7006: Parameter 'confidence' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(121,39): error TS7006: Parameter 'receiptData' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(139,39): error TS7006: Parameter 'receiptData' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(152,42): error TS7006: Parameter 'merchant' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(152,52): error TS7006: Parameter 'date' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(152,58): error TS7006: Parameter 'total' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(167,39): error TS7006: Parameter 'receiptData' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(167,52): error TS7006: Parameter 'transactionForm' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(201,43): error TS7006: Parameter '_field' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(201,51): error TS7006: Parameter 'confidence' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(209,16): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ high: { color: string; iconName: string; }; medium: { color: string; iconName: string; }; low: { color: string; iconName: string; }; none: { color: string; iconName: string; }; }'.
src/utils/receipts/receiptHelpers.tsx(219,32): error TS7006: Parameter 'bytes' implicitly has an 'any' type.
src/utils/receipts/receiptHelpers.tsx(226,41): error TS7006: Parameter 'extractedData' implicitly has an 'any' type.
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
src/utils/security/keyExport.ts(15,32): error TS7006: Parameter 'key' implicitly has an 'any' type.
src/utils/security/keyExport.ts(25,62): error TS18046: 'error' is of type 'unknown'.
src/utils/security/keyExport.ts(36,23): error TS7006: Parameter 'key' implicitly has an 'any' type.
src/utils/security/keyExport.ts(36,28): error TS7006: Parameter 'salt' implicitly has an 'any' type.
src/utils/security/keyExport.ts(36,34): error TS7006: Parameter 'budgetId' implicitly has an 'any' type.
src/utils/security/keyExport.ts(52,53): error TS18046: 'error' is of type 'unknown'.
src/utils/security/keyExport.ts(62,32): error TS7006: Parameter 'keyData' implicitly has an 'any' type.
src/utils/security/keyExport.ts(62,41): error TS7006: Parameter 'exportPassword' implicitly has an 'any' type.
src/utils/security/keyExport.ts(81,63): error TS18046: 'error' is of type 'unknown'.
src/utils/security/keyExport.ts(90,23): error TS7006: Parameter 'keyData' implicitly has an 'any' type.
src/utils/security/keyExport.ts(124,53): error TS18046: 'error' is of type 'unknown'.
src/utils/security/keyExport.ts(134,32): error TS7006: Parameter 'protectedKeyFile' implicitly has an 'any' type.
src/utils/security/keyExport.ts(134,50): error TS7006: Parameter 'exportPassword' implicitly has an 'any' type.
src/utils/security/keyExport.ts(158,63): error TS18046: 'error' is of type 'unknown'.
src/utils/security/keyExport.ts(167,27): error TS7006: Parameter 'keyData' implicitly has an 'any' type.
src/utils/security/keyExport.ts(180,58): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/security/keyExport.ts(186,55): error TS18046: 'error' is of type 'unknown'.
src/utils/security/keyExport.ts(196,19): error TS7006: Parameter 'keyData' implicitly has an 'any' type.
src/utils/security/keyExport.ts(214,55): error TS18046: 'error' is of type 'unknown'.
src/utils/security/keyExport.ts(223,24): error TS7006: Parameter 'keyData' implicitly has an 'any' type.
src/utils/security/keyExport.ts(225,35): error TS7016: Could not find a declaration file for module 'qrcode'. '/home/runner/work/violet-vault/violet-vault/node_modules/qrcode/lib/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/qrcode` if it exists or add a new declaration (.d.ts) file containing `declare module 'qrcode';`
src/utils/security/keyExport.ts(245,54): error TS18046: 'error' is of type 'unknown'.
src/utils/security/keyExport.ts(254,19): error TS7006: Parameter 'keyFileData' implicitly has an 'any' type.
src/utils/security/keyExport.ts(299,59): error TS18046: 'error' is of type 'unknown'.
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
src/utils/sync/validation/manifestValidator.ts(14,34): error TS7006: Parameter 'manifest' implicitly has an 'any' type.
src/utils/sync/validation/manifestValidator.ts(15,9): error TS7034: Variable 'errors' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/utils/sync/validation/manifestValidator.ts(16,9): error TS7034: Variable 'warnings' implicitly has type 'any[]' in some locations where its type cannot be determined.
src/utils/sync/validation/manifestValidator.ts(20,38): error TS7005: Variable 'warnings' implicitly has an 'any[]' type.
src/utils/sync/validation/manifestValidator.ts(23,41): error TS7005: Variable 'errors' implicitly has an 'any[]' type.
src/utils/sync/validation/manifestValidator.ts(24,30): error TS7005: Variable 'errors' implicitly has an 'any[]' type.
src/utils/sync/validation/manifestValidator.ts(25,32): error TS7005: Variable 'warnings' implicitly has an 'any[]' type.
src/utils/sync/validation/manifestValidator.ts(26,29): error TS7005: Variable 'errors' implicitly has an 'any[]' type.
src/utils/sync/validation/manifestValidator.ts(28,43): error TS7005: Variable 'errors' implicitly has an 'any[]' type.
src/utils/sync/validation/manifestValidator.ts(28,51): error TS7005: Variable 'warnings' implicitly has an 'any[]' type.
src/utils/sync/validation/manifestValidator.ts(35,38): error TS7006: Parameter 'manifest' implicitly has an 'any' type.
src/utils/sync/validation/manifestValidator.ts(35,48): error TS7006: Parameter 'errors' implicitly has an 'any' type.
src/utils/sync/validation/manifestValidator.ts(48,27): error TS7006: Parameter 'manifest' implicitly has an 'any' type.
src/utils/sync/validation/manifestValidator.ts(48,37): error TS7006: Parameter 'errors' implicitly has an 'any' type.
src/utils/sync/validation/manifestValidator.ts(58,29): error TS7006: Parameter 'manifest' implicitly has an 'any' type.
src/utils/sync/validation/manifestValidator.ts(58,39): error TS7006: Parameter 'warnings' implicitly has an 'any' type.
src/utils/sync/validation/manifestValidator.ts(81,26): error TS7006: Parameter 'manifest' implicitly has an 'any' type.
src/utils/sync/validation/manifestValidator.ts(81,36): error TS7006: Parameter 'errors' implicitly has an 'any' type.
src/utils/sync/validation/manifestValidator.ts(91,33): error TS7006: Parameter 'manifest' implicitly has an 'any' type.
src/utils/sync/validation/manifestValidator.ts(91,43): error TS7006: Parameter 'errors' implicitly has an 'any' type.
src/utils/sync/validation/manifestValidator.ts(91,51): error TS7006: Parameter 'warnings' implicitly has an 'any' type.
src/utils/sync/validation/manifestValidator.ts(91,61): error TS7006: Parameter 'operation' implicitly has an 'any' type.
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

