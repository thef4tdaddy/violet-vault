# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 13 | +8 |
| TypeScript Errors | 587 | -1534 |

*Last updated: 2025-10-28 17:21:37 UTC*

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
- 2 issues in `violet-vault/src/utils/budgeting/billEnvelopeCalculations.ts`
- 2 issues in `violet-vault/src/hooks/budgeting/useBudgetData/queryFunctions.ts`
- 1 issues in `violet-vault/src/utils/dataManagement/firebaseUtils.ts`
- 1 issues in `violet-vault/src/utils/common/highlight.ts`
- 1 issues in `violet-vault/src/services/bugReport/index.ts`
- 1 issues in `violet-vault/src/services/bugReport/errorTrackingService.ts`
- 1 issues in `violet-vault/src/services/authService.ts`
- 1 issues in `violet-vault/src/hooks/debts/useDebtModalLogic.ts`
- 1 issues in `violet-vault/src/hooks/debts/helpers/debtManagementHelpers.ts`
- 1 issues in `violet-vault/src/hooks/common/useDataManagement.ts`
- 1 issues in `violet-vault/src/hooks/auth/mutations/useProfileMutations.ts`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 4 | `@typescript-eslint/no-unused-vars` |
| 3 | `no-undef` |
| 2 | `null` |
| 2 | `no-redeclare` |
| 2 | `@typescript-eslint/no-explicit-any` |

### Detailed Lint Report
```
violet-vault/src/hooks/auth/mutations/useProfileMutations.ts:6:15 - 1 - 'UserData' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/hooks/budgeting/useBudgetData/queryFunctions.ts:8:34 - 1 - 'Transaction' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/hooks/budgeting/useBudgetData/queryFunctions.ts:18:11 - 1 - 'Bill' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/hooks/common/useDataManagement.ts:10:23 - 1 - 'React' is not defined. (no-undef)
violet-vault/src/hooks/debts/helpers/debtManagementHelpers.ts:455:84 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/debts/useDebtModalLogic.ts:35:53 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/services/authService.ts:97:5 - 1 - Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-unused-vars'). (null)
violet-vault/src/services/bugReport/errorTrackingService.ts:38:12 - 1 - 'EventListenerOrEventListenerObject' is not defined. (no-undef)
violet-vault/src/services/bugReport/index.ts:201:48 - 1 - 'SystemInfo' is not defined. (no-undef)
violet-vault/src/utils/budgeting/billEnvelopeCalculations.ts:68:11 - 2 - 'Bill' is already defined. (no-redeclare)
violet-vault/src/utils/budgeting/billEnvelopeCalculations.ts:78:11 - 2 - 'Envelope' is already defined. (no-redeclare)
violet-vault/src/utils/common/highlight.ts:131:1 - 1 - Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-unused-vars'). (null)
violet-vault/src/utils/dataManagement/firebaseUtils.ts:2:10 - 1 - 'budgetDb' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
```

## Typecheck Audit

### Files with Most Type Errors
- 88 errors in `src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts`
- 36 errors in `src/components/budgeting/__tests__/EnvelopeSystem.test.tsx`
- 23 errors in `src/services/bugReport/__tests__/index.test.ts`
- 22 errors in `src/utils/transactions/__tests__/operations.test.ts`
- 22 errors in `src/utils/budgeting/__tests__/envelopeFormUtils.test.ts`
- 22 errors in `src/hooks/transactions/__tests__/useTransactionUtils.test.ts`
- 22 errors in `src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts`
- 15 errors in `src/components/transactions/__tests__/TransactionFilters.test.tsx`
- 15 errors in `src/components/sharing/__tests__/ShareCodeModal.test.tsx`
- 14 errors in `src/services/bugReport/__tests__/screenshotService.test.ts`
- 12 errors in `src/hooks/budgeting/autofunding/useAutoFunding.ts`
- 11 errors in `src/hooks/debts/useDebtManagement.ts`
- 9 errors in `src/hooks/bills/useBillManager.ts`
- 6 errors in `src/utils/query/__tests__/integration/queryIntegration.test.ts`
- 5 errors in `src/hooks/settings/useTransactionArchiving.ts`
- 5 errors in `src/hooks/savings/useSavingsGoals/savingsMutations.ts`
- 4 errors in `src/utils/budgeting/billEnvelopeCalculations.ts`
- 4 errors in `src/hooks/transactions/useTransactionOperations.ts`
- 4 errors in `src/hooks/analytics/useAnalyticsIntegration.ts`
- 4 errors in `src/components/transactions/TransactionSplitter.tsx`
- 3 errors in `src/utils/common/fixAutoAllocateUndefined.ts`
- 3 errors in `src/services/keys/__tests__/keyManagementService.test.ts`
- 3 errors in `src/services/__tests__/integration/syncIntegration.test.ts`
- 3 errors in `src/hooks/transactions/helpers/transactionOperationsHelpers.ts`
- 3 errors in `src/hooks/transactions/__tests__/useTransactionAnalytics.test.ts`
- 3 errors in `src/hooks/settings/__tests__/useSettingsDashboard.test.ts`
- 3 errors in `src/hooks/debts/useDebts.ts`
- 3 errors in `src/hooks/budgeting/useUnassignedCashDistribution.ts`
- 3 errors in `src/hooks/auth/mutations/useLoginMutations.ts`
- 3 errors in `src/hooks/analytics/__tests__/useAnalyticsExport.test.ts`
- 2 errors in `src/utils/query/__tests__/prefetchHelpers.test.ts`
- 2 errors in `src/utils/budgeting/envelopeIntegrityChecker.ts`
- 2 errors in `src/utils/budgeting/__tests__/paycheckUtils.test.ts`
- 2 errors in `src/services/keys/keyManagementService.ts`
- 2 errors in `src/services/bugReport/apiService.ts`
- 2 errors in `src/hooks/transactions/useTransactionsV2.ts`
- 2 errors in `src/hooks/common/bug-report/useBugReportSubmission.ts`
- 2 errors in `src/hooks/budgeting/usePaycheckProcessor.ts`
- 2 errors in `src/hooks/budgeting/useBudgetData/utilities.ts`
- 2 errors in `src/hooks/budgeting/useBudgetData/queryFunctions.ts`
- 2 errors in `src/hooks/budgeting/useBudgetData/index.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useAutoFundingHistory.ts`
- 2 errors in `src/hooks/bills/useBills/__tests__/billQueries.test.ts`
- 2 errors in `src/hooks/bills/useBillForm.ts`
- 2 errors in `src/hooks/auth/mutations/useJoinBudgetMutation.ts`
- 2 errors in `src/hooks/analytics/usePerformanceMonitor.ts`
- 2 errors in `src/hooks/accounts/__tests__/useSupplementalAccounts.test.ts`
- 2 errors in `src/contexts/__tests__/authUtils.test.ts`
- 2 errors in `src/components/security/LockScreen.tsx`
- 2 errors in `src/components/pwa/ShareTargetHandler.tsx`
- 2 errors in `src/components/modals/UnassignedCashModal.tsx`
- 2 errors in `src/components/mobile/ResponsiveModal.tsx`
- 2 errors in `src/components/layout/MainLayout.tsx`
- 2 errors in `src/components/history/ObjectHistoryViewer.tsx`
- 2 errors in `src/components/feedback/hooks/useBugReportState.ts`
- 2 errors in `src/components/debt/ui/DebtList.tsx`
- 2 errors in `src/components/debt/modals/DebtFormSections.tsx`
- 2 errors in `src/components/debt/modals/DebtDetailModal.tsx`
- 2 errors in `src/components/charts/ComposedFinancialChart.tsx`
- 2 errors in `src/components/charts/CategoryBarChart.tsx`
- 2 errors in `src/components/budgeting/SmartEnvelopeSuggestions.tsx`
- 2 errors in `src/components/budgeting/EnvelopeGrid.tsx`
- 2 errors in `src/components/budgeting/EditEnvelopeModalComponents.tsx`
- 2 errors in `src/components/budgeting/EditEnvelopeModal.tsx`
- 2 errors in `src/components/budgeting/CreateEnvelopeModalComponents.tsx`
- 2 errors in `src/components/analytics/__tests__/AnalyticsDashboard.test.tsx`
- 2 errors in `src/components/analytics/ChartsAndAnalytics.tsx`
- 2 errors in `src/components/analytics/CategoryAdvancedTab.tsx`
- 1 errors in `src/utils/validation/transactionValidation.ts`
- 1 errors in `src/utils/sync/validation/checksumUtils.ts`
- 1 errors in `src/utils/sync/validation/__tests__/checksumUtils.test.ts`
- 1 errors in `src/utils/sync/syncHealthChecker.ts`
- 1 errors in `src/utils/sync/syncFlowValidator.ts`
- 1 errors in `src/utils/sync/syncEdgeCaseTester.ts`
- 1 errors in `src/utils/sync/dataDetectionHelper.ts`
- 1 errors in `src/utils/sync/corruptionRecoveryHelper.ts`
- 1 errors in `src/utils/sync/__tests__/dataIntegrity.test.ts`
- 1 errors in `src/utils/stores/storeRegistry.ts`
- 1 errors in `src/utils/security/optimizedSerialization.ts`
- 1 errors in `src/utils/security/errorViewer.ts`
- 1 errors in `src/utils/security/encryption.ts`
- 1 errors in `src/utils/receipts/receiptHelpers.tsx`
- 1 errors in `src/utils/query/__tests__/queryKeys.test.ts`
- 1 errors in `src/utils/pwa/serviceWorkerDiagnostics.ts`
- 1 errors in `src/utils/pwa/patchNotesManager.ts`
- 1 errors in `src/utils/pwa/backgroundSync.ts`
- 1 errors in `src/utils/notifications/permissionUtils.ts`
- 1 errors in `src/utils/debts/debtCalculations.ts`
- 1 errors in `src/utils/dataManagement/firebaseUtils.ts`
- 1 errors in `src/utils/dataManagement/dexieUtils.ts`
- 1 errors in `src/utils/dataManagement/__tests__/firebaseUtils.test.ts`
- 1 errors in `src/utils/dataManagement/__tests__/backupUtils.test.ts`
- 1 errors in `src/utils/common/version.ts`
- 1 errors in `src/utils/common/transactionArchiving.ts`
- 1 errors in `src/utils/common/highlight.ts`
- 1 errors in `src/utils/common/budgetHistoryTracker.ts`
- 1 errors in `src/utils/common/billDiscovery.ts`
- 1 errors in `src/utils/budgeting/paycheckProcessing.ts`
- 1 errors in `src/utils/budgeting/envelopeFormUtils.ts`
- 1 errors in `src/utils/budgeting/autofunding/simulation.ts`
- 1 errors in `src/utils/bills/index.ts`
- 1 errors in `src/utils/accounts/__tests__/accountValidation.test.ts`
- 1 errors in `src/test/queryTestUtils.tsx`
- 1 errors in `src/stores/ui/uiStore.ts`
- 1 errors in `src/stores/ui/onboardingStore.ts`
- 1 errors in `src/stores/ui/fabStore.ts`
- 1 errors in `src/services/typedFirebaseSyncService.ts`
- 1 errors in `src/services/typedChunkedSyncService.ts`
- 1 errors in `src/services/transactions/__tests__/transactionSplitterService.test.ts`
- 1 errors in `src/services/chunkedSyncService.ts`
- 1 errors in `src/services/bugReport/systemInfoService.ts`
- 1 errors in `src/services/bugReport/reportSubmissionService.ts`
- 1 errors in `src/services/bugReport/performanceInfoService.ts`
- 1 errors in `src/services/bugReport/pageDetectionService.ts`
- 1 errors in `src/services/bugReport/index.ts`
- 1 errors in `src/services/authService.ts`
- 1 errors in `src/services/__tests__/types/firebaseTypes.test.ts`
- 1 errors in `src/hooks/transactions/useTransactionMutations.ts`
- 1 errors in `src/hooks/transactions/useTransactionLedger.ts`
- 1 errors in `src/hooks/transactions/useTransactionFileUpload.ts`
- 1 errors in `src/hooks/sync/useManualSync.ts`
- 1 errors in `src/hooks/settings/useEnvelopeIntegrity.ts`
- 1 errors in `src/hooks/layout/useLayoutData.ts`
- 1 errors in `src/hooks/debts/helpers/debtManagementHelpers.ts`
- 1 errors in `src/hooks/dashboard/useMainDashboard.ts`
- 1 errors in `src/hooks/common/useConnectionManager.ts`
- 1 errors in `src/hooks/common/useActivityLogger.ts`
- 1 errors in `src/hooks/budgeting/useSmartSuggestions.ts`
- 1 errors in `src/hooks/budgeting/useEnvelopeForm.ts`
- 1 errors in `src/hooks/budgeting/useBudgetData/paycheckMutations.ts`
- 1 errors in `src/hooks/budgeting/metadata/useUnassignedCash.ts`
- 1 errors in `src/hooks/budgeting/metadata/useBudgetMetadataUtils.ts`
- 1 errors in `src/hooks/budgeting/metadata/useBudgetMetadataQuery.ts`
- 1 errors in `src/hooks/budgeting/metadata/useActualBalanceOperations.ts`
- 1 errors in `src/hooks/budgeting/metadata/useActualBalance.ts`
- 1 errors in `src/hooks/budgeting/autofunding/utils/useRuleSummaries.ts`
- 1 errors in `src/hooks/budgeting/autofunding/utils/useRuleStatistics.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts`
- 1 errors in `src/hooks/budgeting/autofunding/queries/useRuleFilters.ts`
- 1 errors in `src/hooks/budgeting/autofunding/queries/useExecutableRules.ts`
- 1 errors in `src/hooks/budgeting/__tests__/useEnvelopesQuery.test.ts`
- 1 errors in `src/hooks/bills/useBills/index.ts`
- 1 errors in `src/hooks/bills/useBills/billQueries.ts`
- 1 errors in `src/hooks/bills/useBills/billMutations.ts`
- 1 errors in `src/hooks/bills/useBills/__tests__/billMutations.test.ts`
- 1 errors in `src/hooks/bills/useBillValidation.ts`
- 1 errors in `src/hooks/auth/useSecurityManagerUI.ts`
- 1 errors in `src/hooks/auth/useAuthenticationManager.ts`
- 1 errors in `src/hooks/auth/useAuthCompatibility.ts`
- 1 errors in `src/hooks/auth/queries/usePasswordValidation.ts`
- 1 errors in `src/hooks/auth/mutations/useProfileMutations.ts`
- 1 errors in `src/hooks/auth/mutations/__tests__/useJoinBudgetMutation.test.ts`
- 1 errors in `src/hooks/auth/__tests__/useUserSetup.test.ts`
- 1 errors in `src/hooks/analytics/utils/pdfGeneratorUtils.ts`
- 1 errors in `src/hooks/analytics/queries/usePaycheckTrendsQuery.ts`
- 1 errors in `src/domain/schemas/version-control.ts`
- 1 errors in `src/domain/schemas/transaction.ts`
- 1 errors in `src/domain/schemas/bill.ts`
- 1 errors in `src/domain/schemas/backup.ts`
- 1 errors in `src/components/ui/VersionFooter.tsx`
- 1 errors in `src/components/ui/PromptProvider.tsx`
- 1 errors in `src/components/ui/LoadingSpinner.tsx`
- 1 errors in `src/components/ui/EditableBalance.tsx`
- 1 errors in `src/components/ui/EditLockIndicator.tsx`
- 1 errors in `src/components/ui/ConnectionDisplay.tsx`
- 1 errors in `src/components/ui/ConfirmProvider.tsx`
- 1 errors in `src/components/transactions/splitter/SplitterHeader.tsx`
- 1 errors in `src/components/transactions/components/DeleteConfirmation.tsx`
- 1 errors in `src/components/transactions/__tests__/TransactionLedger.test.tsx`
- 1 errors in `src/components/sync/health/SyncStatusIndicator.tsx`
- 1 errors in `src/components/sync/health/SyncHealthDetails.tsx`
- 1 errors in `src/components/sync/SyncHealthDashboard.tsx`
- 1 errors in `src/components/sharing/__tests__/JoinBudgetModal.test.tsx`
- 1 errors in `src/components/sharing/ShareCodeModal.tsx`
- 1 errors in `src/components/settings/sections/NotificationSettingsSection.tsx`
- 1 errors in `src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx`
- 1 errors in `src/components/settings/TransactionArchiving.tsx`
- 1 errors in `src/components/savings/DistributeModal.tsx`
- 1 errors in `src/components/savings/AddEditGoalModal.tsx`
- 1 errors in `src/components/pwa/OfflineStatusIndicator.tsx`
- 1 errors in `src/components/modals/CorruptionRecoveryModal.tsx`
- 1 errors in `src/components/mobile/SlideUpModal.tsx`
- 1 errors in `src/components/mobile/BottomNavItem.tsx`
- 1 errors in `src/components/layout/SummaryCards.tsx`
- 1 errors in `src/components/history/BudgetHistoryViewer.tsx`
- 1 errors in `src/components/debt/modals/AddDebtModal.tsx`
- 1 errors in `src/components/dashboard/AccountBalanceOverview.tsx`
- 1 errors in `src/components/charts/DistributionPieChart.tsx`
- 1 errors in `src/components/budgeting/paycheck/PaycheckHistory.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeSummary.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeHistoryModal.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeGridView.tsx`
- 1 errors in `src/components/budgeting/__tests__/EnvelopeGrid.test.tsx`
- 1 errors in `src/components/budgeting/PaycheckProcessor.tsx`
- 1 errors in `src/components/budgeting/CreateEnvelopeModal.tsx`
- 1 errors in `src/components/bills/BulkUpdateBillRow.tsx`
- 1 errors in `src/components/bills/BillTableBulkActions.tsx`
- 1 errors in `src/components/bills/BillManager.tsx`
- 1 errors in `src/components/bills/BillFormFields.tsx`
- 1 errors in `src/components/automation/tabs/RulesTab.tsx`
- 1 errors in `src/components/automation/steps/RuleConfigurationStep.tsx`
- 1 errors in `src/components/auth/KeyManagementSettings.tsx`
- 1 errors in `src/components/analytics/SmartCategoryManager.tsx`
- 1 errors in `src/components/accounts/AccountsGrid.tsx`
- 1 errors in `src/components/accounts/AccountFormModal.tsx`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 164 | `TS2339` |
| 126 | `TS2345` |
| 73 | `TS2322` |
| 37 | `TS2554` |
| 33 | `TS6133` |
| 30 | `TS2352` |
| 18 | `TS2786` |
| 18 | `TS2551` |
| 14 | `TS2740` |
| 14 | `TS2353` |
| 10 | `TS2739` |
| 8 | `TS2559` |
| 7 | `TS2741` |
| 5 | `TS2365` |
| 4 | `TS2769` |
| 4 | `TS2307` |
| 4 | `TS2300` |
| 2 | `TS6196` |
| 2 | `TS2419` |
| 2 | `TS2363` |
| 1 | `TS6192` |
| 1 | `TS4104` |
| 1 | `TS2698` |
| 1 | `TS2694` |
| 1 | `TS2677` |
| 1 | `TS2614` |
| 1 | `TS2613` |
| 1 | `TS2538` |
| 1 | `TS2448` |
| 1 | `TS2416` |
| 1 | `TS2305` |
| 1 | `TS2304` |

### Detailed Type Error Report
```
src/components/accounts/AccountFormModal.tsx(127,11): error TS2322: Type '{ editingAccount: any; onClose: any; isLocked: any; isOwnLock: any; _lock: any; breakLock: any; lockLoading: any; }' is not assignable to type 'IntrinsicAttributes & AccountModalHeaderProps'.
  Property '_lock' does not exist on type 'IntrinsicAttributes & AccountModalHeaderProps'.
src/components/accounts/AccountsGrid.tsx(35,13): error TS2322: Type '{ key: string; account: unknown; typeInfo: { value: string; label: string; icon: string; }; _daysUntilExpiration: number; expirationStatus: { text: string; color: string; }; showBalances: any; onEdit: any; onDelete: any; onStartTransfer: any; }' is not assignable to type 'IntrinsicAttributes & { account: any; typeInfo: any; expirationStatus: any; showBalances: any; onEdit: any; onDelete: any; onStartTransfer: any; }'.
  Property '_daysUntilExpiration' does not exist on type 'IntrinsicAttributes & { account: any; typeInfo: any; expirationStatus: any; showBalances: any; onEdit: any; onDelete: any; onStartTransfer: any; }'.
src/components/analytics/__tests__/AnalyticsDashboard.test.tsx(6,10): error TS2614: Module '"@/stores/ui/uiStore"' has no exported member 'useBudgetStoreOriginal'. Did you mean to use 'import useBudgetStoreOriginal from "@/stores/ui/uiStore"' instead?
src/components/analytics/__tests__/AnalyticsDashboard.test.tsx(68,15): error TS6133: 'activeTab' is declared but its value is never read.
src/components/analytics/CategoryAdvancedTab.tsx(45,17): error TS2322: Type 'unknown' is not assignable to type 'Key'.
src/components/analytics/CategoryAdvancedTab.tsx(48,71): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/analytics/ChartsAndAnalytics.tsx(145,9): error TS2322: Type 'Transaction[]' is not assignable to type 'import("violet-vault/src/types/analytics").Transaction[]'.
  Type 'Transaction' is missing the following properties from type 'Transaction': id, description, type
src/components/analytics/ChartsAndAnalytics.tsx(146,9): error TS2322: Type 'FinancialMetrics' is not assignable to type 'AnalyticsMetrics'.
  Index signature for type 'string' is missing in type 'FinancialMetrics'.
src/components/analytics/SmartCategoryManager.tsx(58,51): error TS2345: Argument of type 'Suggestion[]' is not assignable to parameter of type 'Suggestion[]'.
  Type 'Suggestion' is not assignable to type 'Suggestion'. Two different types with this name exist, but they are unrelated.
    Types of property 'priority' are incompatible.
      Type 'string' is not assignable to type '"low" | "medium" | "high"'.
src/components/auth/KeyManagementSettings.tsx(159,11): error TS2739: Type '{}' is missing the following properties from type '{ success: boolean; importResult: { budgetId: string; fingerprint: string; exportedAt?: string; deviceFingerprint?: string; }; loginResult: { success: boolean; error?: string; suggestion?: string; code?: string; canCreateNew?: boolean; data?: unknown; }; }': success, importResult, loginResult
src/components/automation/steps/RuleConfigurationStep.tsx(37,11): error TS2322: Type '{ ruleData: any; updateConfig: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }' is not assignable to type 'IntrinsicAttributes & { ruleData: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }'.
  Property 'updateConfig' does not exist on type 'IntrinsicAttributes & { ruleData: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }'.
src/components/automation/tabs/RulesTab.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/bills/BillFormFields.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/bills/BillManager.tsx(98,5): error TS2322: Type 'Set<unknown>' is not assignable to type 'Set<string>'.
  Type 'unknown' is not assignable to type 'string'.
src/components/bills/BillTableBulkActions.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/bills/BulkUpdateBillRow.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/budgeting/__tests__/EnvelopeGrid.test.tsx(1,26): error TS6133: 'waitFor' is declared but its value is never read.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(60,15): error TS2559: Type '{ envelopes: any[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<Procedure>; unassignedCash: number; }' has no properties in common with type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(60,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(67,15): error TS2559: Type '{ envelopes: any[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<Procedure>; unassignedCash: number; }' has no properties in common with type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(67,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(72,15): error TS2559: Type '{ envelopes: any[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<Procedure>; unassignedCash: number; }' has no properties in common with type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(72,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(77,15): error TS2559: Type '{ envelopes: any[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<Procedure>; unassignedCash: number; }' has no properties in common with type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(77,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(89,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(89,48): error TS2322: Type '{ envelopes: { id: string; name: string; balance: number; }[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<...>; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'envelopes' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(100,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(100,48): error TS2322: Type '{ envelopes: undefined[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<Procedure>; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'envelopes' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(105,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(105,48): error TS2322: Type '{ envelopes: undefined; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<Procedure>; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'envelopes' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(115,10): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(115,43): error TS2322: Type '{ onCreateEnvelope: Mock<Procedure>; envelopes: any[]; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<Procedure>; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'onCreateEnvelope' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(130,10): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(130,43): error TS2322: Type '{ onUpdateEnvelope: Mock<Procedure>; envelopes: any[]; onCreateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<Procedure>; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'onUpdateEnvelope' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(140,10): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(140,43): error TS2322: Type '{ onDeleteEnvelope: Mock<Procedure>; envelopes: any[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'onDeleteEnvelope' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(149,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(149,48): error TS2322: Type '{ unassignedCash: number; envelopes: any[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'unassignedCash' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(156,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(156,48): error TS2322: Type '{ unassignedCash: number; envelopes: any[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'unassignedCash' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(162,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(162,48): error TS2322: Type '{ unassignedCash: number; envelopes: any[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'unassignedCash' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(175,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(175,48): error TS2322: Type '{ envelopes: { id: string; name: string; balance: number; }[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<...>; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'envelopes' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(186,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(186,48): error TS2322: Type '{ envelopes: { id: string; name: string; balance: number; }[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<...>; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'envelopes' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(201,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(201,48): error TS2322: Type '{ envelopes: null; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<Procedure>; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'envelopes' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(215,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(215,48): error TS2322: Type '{ envelopes: { id: string; name: string; balance: number; }[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<...>; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'envelopes' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(228,15): error TS2786: 'EnvelopeSystem' cannot be used as a JSX component.
  Its type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not a valid JSX element type.
    Type '() => { envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, delet...' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type '{ envelopes: Envelope[]; bills: Bill[]; unassignedCash: any; isLoading: boolean; createEnvelope: (envelopeData: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>; updateEnvelope: (envelopeId: any, updates: any) => Promise<...>; deleteEnvelope: (envelopeId: any, deleteBills...' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/budgeting/__tests__/EnvelopeSystem.test.tsx(228,48): error TS2322: Type '{ envelopes: { id: string; name: string; balance: number; }[]; onCreateEnvelope: Mock<Procedure>; onUpdateEnvelope: Mock<Procedure>; onDeleteEnvelope: Mock<...>; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'envelopes' does not exist on type 'IntrinsicAttributes'.
src/components/budgeting/CreateEnvelopeModal.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(142,9): error TS2559: Type '{ envelopeType: string; color: string; autoAllocate: boolean; billId?: string; }' has no properties in common with type '{ name?: string; category?: string; description?: string; }'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(152,9): error TS2322: Type 'unknown' is not assignable to type 'Record<string, number>'.
  Index signature for type 'string' is missing in type '{}'.
src/components/budgeting/EditEnvelopeModal.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/budgeting/EditEnvelopeModal.tsx(126,13): error TS2322: Type 'unknown' is not assignable to type 'boolean'.
src/components/budgeting/EditEnvelopeModalComponents.tsx(188,9): error TS2559: Type '{ envelopeType: string; priority?: string; autoAllocate?: boolean; }' has no properties in common with type '{ name?: string; category?: string; description?: string; }'.
src/components/budgeting/EditEnvelopeModalComponents.tsx(210,11): error TS2322: Type 'unknown' is not assignable to type 'Record<string, number>'.
  Index signature for type 'string' is missing in type '{}'.
src/components/budgeting/envelope/EnvelopeGridView.tsx(126,9): error TS2739: Type '{}' is missing the following properties from type 'FilterOptions': timeRange, showEmpty, sortBy, envelopeType
src/components/budgeting/envelope/EnvelopeHistoryModal.tsx(48,15): error TS2322: Type '{ objectType: string; objectId: any; objectName: any; showModal: boolean; }' is not assignable to type 'IntrinsicAttributes & ObjectHistoryViewerProps'.
  Property 'showModal' does not exist on type 'IntrinsicAttributes & ObjectHistoryViewerProps'.
src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx(38,63): error TS2339: Property 'balanceLabel' does not exist on type '{ primaryStatus: string; secondaryStatus: string; fundingProgress: string; }'.
src/components/budgeting/envelope/EnvelopeSummary.tsx(6,45): error TS2322: Type '{ totals: any; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes & { totals?: EnvelopeTotals; }'.
  Property 'unassignedCash' does not exist on type 'IntrinsicAttributes & { totals?: EnvelopeTotals; }'.
src/components/budgeting/EnvelopeGrid.tsx(2,8): error TS6133: 'React' is declared but its value is never read.
src/components/budgeting/EnvelopeGrid.tsx(373,8): error TS2741: Property 'bills' is missing in type '{ showCreateModal: boolean; setShowCreateModal: Dispatch<SetStateAction<boolean>>; handleCreateEnvelope: (envelopeData: any) => Promise<void>; ... 12 more ...; handleQuickFundConfirm: (envelopeId: any, amount: any) => Promise<...>; }' but required in type '{ showCreateModal: boolean; setShowCreateModal: (show: boolean) => void; handleCreateEnvelope: (data: unknown) => Promise<void>; envelopes: unknown[]; budget: { currentUser: unknown; updateBill: (bill: unknown) => void; }; ... 11 more ...; handleQuickFundConfirm: (id: string, amount: number) => Promise<...>; }'.
src/components/budgeting/paycheck/PaycheckHistory.tsx(92,47): error TS2554: Expected 0 arguments, but got 1.
src/components/budgeting/PaycheckProcessor.tsx(63,9): error TS2322: Type '{ paycheckHistory: any[]; onDeletePaycheck: (paycheck: any) => Promise<void>; deletingPaycheckId: any; }' is not assignable to type 'IntrinsicAttributes & { paycheckHistory?: any[]; paycheckStats: any; onSelectPaycheck?: () => void; }'.
  Property 'onDeletePaycheck' does not exist on type 'IntrinsicAttributes & { paycheckHistory?: any[]; paycheckStats: any; onSelectPaycheck?: () => void; }'. Did you mean 'onSelectPaycheck'?
src/components/budgeting/SmartEnvelopeSuggestions.tsx(32,27): error TS6133: '_showSettings' is declared but its value is never read.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(71,25): error TS2322: Type '{ showSettings: any; onClick: any; }' is not assignable to type 'IntrinsicAttributes & { _showSettings: any; onClick: any; }'.
  Property 'showSettings' does not exist on type 'IntrinsicAttributes & { _showSettings: any; onClick: any; }'. Did you mean '_showSettings'?
src/components/charts/CategoryBarChart.tsx(92,12): error TS2322: Type '{ fontSize: number; tickFormatter: (value: any) => string; type: string; stroke: any; dataKey?: undefined; } | { fontSize: number; tickFormatter: (value: any) => string; dataKey: string; stroke: any; type?: undefined; }' is not assignable to type 'IntrinsicAttributes & Omit<PresentationAttributesAdaptChildEvent<any, SVGElement>, "ref" | "scale"> & XAxisProps'.
  Type '{ fontSize: number; tickFormatter: (value: any) => string; type: string; stroke: any; dataKey?: undefined; }' is not assignable to type 'XAxisProps'.
    Types of property 'type' are incompatible.
      Type 'string' is not assignable to type 'AxisDomainType'.
src/components/charts/CategoryBarChart.tsx(97,12): error TS2322: Type '{ fontSize: number; tickFormatter: (value: any) => string; dataKey: string; type: string; stroke: any; width: number; } | { fontSize: number; tickFormatter: (value: any) => string; stroke: any; dataKey?: undefined; type?: undefined; width?: undefined; }' is not assignable to type 'IntrinsicAttributes & Omit<PresentationAttributesAdaptChildEvent<any, SVGElement>, "ref" | "scale"> & YAxisProps'.
  Type '{ fontSize: number; tickFormatter: (value: any) => string; dataKey: string; type: string; stroke: any; width: number; }' is not assignable to type 'YAxisProps'.
    Types of property 'type' are incompatible.
      Type 'string' is not assignable to type 'AxisDomainType'.
src/components/charts/ComposedFinancialChart.tsx(182,11): error TS2739: Type '{ title: string; data: any; series: ({ type: string; dataKey: string; name: string; fill: string; stroke?: undefined; strokeWidth?: undefined; } | { type: string; dataKey: string; name: string; stroke: string; strokeWidth: number; fill?: undefined; })[]; }' is missing the following properties from type '{ [x: string]: any; title?: string; subtitle: any; data?: any[]; series?: any[]; height?: number; className?: string; loading?: boolean; error?: any; emptyMessage?: string; actions: any; showGrid?: boolean; showLegend?: boolean; formatTooltip: any; xAxisKey?: string; }': subtitle, actions, formatTooltip
src/components/charts/ComposedFinancialChart.tsx(208,6): error TS2739: Type '{ title: string; data: any; series: { type: string; dataKey: string; name: string; fill: string; }[]; xAxisKey: string; }' is missing the following properties from type '{ [x: string]: any; title?: string; subtitle: any; data?: any[]; series?: any[]; height?: number; className?: string; loading?: boolean; error?: any; emptyMessage?: string; actions: any; showGrid?: boolean; showLegend?: boolean; formatTooltip: any; xAxisKey?: string; }': subtitle, actions, formatTooltip
src/components/charts/DistributionPieChart.tsx(141,8): error TS2739: Type '{ title: any; subtitle: any; data: any[]; dataKey: string; nameKey: string; className: string; showLegend: false; outerRadius: number; }' is missing the following properties from type '{ [x: string]: any; title?: string; subtitle: any; data?: any[]; dataKey?: string; nameKey?: string; height?: number; className?: string; loading?: boolean; error?: any; emptyMessage?: string; actions: any; showLegend?: boolean; ... 5 more ...; maxItems?: number; }': actions, formatTooltip, labelFormatter
src/components/dashboard/AccountBalanceOverview.tsx(58,13): error TS2322: Type '{ value: any; onChange: any; title: string; subtitle: string; className: string; currencyClassName: string; subtitleClassName: string; }' is not assignable to type 'IntrinsicAttributes & { value: any; onChange: any; title?: string; subtitle?: string; className?: string; colorClass?: string; bgClass?: string; hoverClass?: string; isManuallySet?: boolean; confirmThreshold?: number; formatCurrency?: boolean; }'.
  Property 'currencyClassName' does not exist on type 'IntrinsicAttributes & { value: any; onChange: any; title?: string; subtitle?: string; className?: string; colorClass?: string; bgClass?: string; hoverClass?: string; isManuallySet?: boolean; confirmThreshold?: number; formatCurrency?: boolean; }'.
src/components/debt/modals/AddDebtModal.tsx(74,11): error TS2322: Type '{ formData: { name: string; creditor: string; type: "personal"; currentBalance: string; originalBalance: string; interestRate: string; minimumPayment: string; paymentFrequency: "monthly"; paymentDueDate: string; ... 5 more ...; newEnvelopeName: string; }; ... 12 more ...; debtMetrics: DebtMetrics; }' is not assignable to type 'IntrinsicAttributes & { formData: any; setFormData: any; errors: any; canEdit: any; isEditMode: any; isSubmitting: any; handleFormSubmit: any; onClose: any; bills: any; billsLoading: any; }'.
  Property 'envelopes' does not exist on type 'IntrinsicAttributes & { formData: any; setFormData: any; errors: any; canEdit: any; isEditMode: any; isSubmitting: any; handleFormSubmit: any; onClose: any; bills: any; billsLoading: any; }'.
src/components/debt/modals/DebtDetailModal.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/debt/modals/DebtDetailModal.tsx(49,32): error TS2554: Expected 1 arguments, but got 6.
src/components/debt/modals/DebtFormSections.tsx(53,23): error TS2339: Property 'label' does not exist on type 'DebtTypeConfig'.
src/components/debt/modals/DebtFormSections.tsx(206,32): error TS2339: Property 'map' does not exist on type '{ readonly WEEKLY: "weekly"; readonly BIWEEKLY: "biweekly"; readonly MONTHLY: "monthly"; readonly QUARTERLY: "quarterly"; readonly ANNUALLY: "annually"; }'.
src/components/debt/ui/DebtList.tsx(26,41): error TS2339: Property '_onRecordPayment' does not exist on type 'DebtListProps'.
src/components/debt/ui/DebtList.tsx(26,41): error TS6133: '_onRecordPayment' is declared but its value is never read.
src/components/feedback/hooks/useBugReportState.ts(102,7): error TS2352: Conversion of type '{ screenshot: string; previewScreenshot: string; isSubmitting: boolean; submitError: string; submitResult: SubmitResult; diagnostics: unknown; openModal: () => Promise<void>; ... 29 more ...; isModalOpen: boolean; }' to type 'BugReportHookReturn' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Property 'setScreenshot' is missing in type '{ screenshot: string; previewScreenshot: string; isSubmitting: boolean; submitError: string; submitResult: SubmitResult; diagnostics: unknown; openModal: () => Promise<void>; ... 29 more ...; isModalOpen: boolean; }' but required in type 'BugReportHookReturn'.
src/components/feedback/hooks/useBugReportState.ts(164,54): error TS2345: Argument of type 'Error' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'Error'.
src/components/history/BudgetHistoryViewer.tsx(72,43): error TS2322: Type 'string | Error' is not assignable to type 'ReactNode'.
  Type 'Error' is not assignable to type 'ReactNode'.
src/components/history/ObjectHistoryViewer.tsx(47,65): error TS2677: A type predicate's type must be assignable to its parameter's type.
  Type '_BudgetCommit' is not assignable to type 'BudgetCommit'.
    Types of property 'timestamp' are incompatible.
      Type 'string' is not assignable to type 'number'.
src/components/history/ObjectHistoryViewer.tsx(58,5): error TS2322: Type 'BudgetCommit[]' is not assignable to type '_BudgetCommit[]'.
  Type 'BudgetCommit' is not assignable to type '_BudgetCommit'.
    Types of property 'timestamp' are incompatible.
      Type 'number' is not assignable to type 'string'.
src/components/layout/MainLayout.tsx(168,9): error TS2322: Type '(event: ChangeEvent<HTMLInputElement>) => Promise<{ success: boolean; imported: { envelopes: number; bills: number; transactions: number; savingsGoals: number; debts: number; paycheckHistory: number; auditLog: number; }; }>' is not assignable to type '(file: File) => Promise<void>'.
  Types of parameters 'event' and 'file' are incompatible.
    Type 'File' is missing the following properties from type 'ChangeEvent<HTMLInputElement>': target, nativeEvent, currentTarget, bubbles, and 10 more.
src/components/layout/MainLayout.tsx(222,5): error TS2345: Argument of type '(state: Record<string, unknown>) => boolean' is not assignable to parameter of type '(state: OnboardingState) => boolean'.
  Types of parameters 'state' and 'state' are incompatible.
    Type 'OnboardingState' is not assignable to type 'Record<string, unknown>'.
      Index signature for type 'string' is missing in type 'OnboardingState'.
src/components/layout/SummaryCards.tsx(47,20): error TS2365: Operator '+' cannot be applied to types 'number' and 'unknown'.
src/components/mobile/BottomNavItem.tsx(10,20): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
src/components/mobile/ResponsiveModal.tsx(69,39): error TS2345: Argument of type '(props: P, ref: ForwardedRef<unknown>) => Element' is not assignable to parameter of type 'ForwardRefRenderFunction<unknown, PropsWithoutRef<P>>'.
  Types of parameters 'props' and 'props' are incompatible.
    Type 'PropsWithoutRef<P>' is not assignable to type 'P'.
      'PropsWithoutRef<P>' is assignable to the constraint of type 'P', but 'P' could be instantiated with a different subtype of constraint 'Record<string, unknown>'.
        Type 'Omit<Record<string, unknown>, "ref">' is not assignable to type 'P'.
          'Omit<Record<string, unknown>, "ref">' is assignable to the constraint of type 'P', but 'P' could be instantiated with a different subtype of constraint 'Record<string, unknown>'.
src/components/mobile/ResponsiveModal.tsx(86,11): error TS2322: Type 'unknown' is not assignable to type 'boolean'.
src/components/mobile/SlideUpModal.tsx(350,9): error TS2322: Type '{ onTouchStart: (_event: any) => void; onClick: (originalHandler: any) => (event: any) => void; className: any; }' is not assignable to type '{ onClick: (handler?: () => void) => () => void; onTouchStart: () => void; className: string; }'.
  The types returned by 'onClick(...)' are incompatible between these types.
    Type '(event: any) => void' is not assignable to type '() => void'.
      Target signature provides too few arguments. Expected 1 or more, but got 0.
src/components/modals/CorruptionRecoveryModal.tsx(176,6): error TS2741: Property 'onConfirm' is missing in type '{ children: ReactElement<unknown, string | JSXElementConstructor<any>>; isOpen: boolean; onCancel: () => void; }' but required in type '{ isOpen?: boolean; title?: string; message?: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean; isLoading?: boolean; icon?: any; onConfirm: any; onCancel: any; children: any; }'.
src/components/modals/UnassignedCashModal.tsx(391,19): error TS2322: Type 'Envelope' is not assignable to type '{ id: string; name: string; currentBalance?: number; monthlyBudget?: number; monthlyAmount?: number; color: string; envelopeType: string; }'.
  Property 'color' is optional in type 'Envelope' but required in type '{ id: string; name: string; currentBalance?: number; monthlyBudget?: number; monthlyAmount?: number; color: string; envelopeType: string; }'.
src/components/modals/UnassignedCashModal.tsx(395,19): error TS2322: Type 'Bill[]' is not assignable to type '{ [key: string]: unknown; id: string; name: string; }[]'.
  Type 'Bill' is not assignable to type '{ [key: string]: unknown; id: string; name: string; }'.
    Index signature for type 'string' is missing in type 'Bill'.
src/components/pwa/OfflineStatusIndicator.tsx(46,23): error TS2345: Argument of type '{ isOnline: boolean; pendingCount: number; pendingOperations: { id: unknown; type: unknown; timestamp: unknown; retryCount: unknown; lastError: unknown; }[]; }' is not assignable to parameter of type 'SetStateAction<SyncStatus>'.
  Type '{ isOnline: boolean; pendingCount: number; pendingOperations: { id: unknown; type: unknown; timestamp: unknown; retryCount: unknown; lastError: unknown; }[]; }' is not assignable to type 'SyncStatus'.
    Types of property 'pendingOperations' are incompatible.
      Type '{ id: unknown; type: unknown; timestamp: unknown; retryCount: unknown; lastError: unknown; }[]' is not assignable to type 'PendingOperation[]'.
        Type '{ id: unknown; type: unknown; timestamp: unknown; retryCount: unknown; lastError: unknown; }' is not assignable to type 'PendingOperation'.
          Types of property 'id' are incompatible.
            Type 'unknown' is not assignable to type 'string | number'.
src/components/pwa/ShareTargetHandler.tsx(40,14): error TS2339: Property 'hasFiles' does not exist on type '{ title: string; text: string; url: string; timestamp: string; }'.
src/components/pwa/ShareTargetHandler.tsx(47,18): error TS2339: Property 'hasFiles' does not exist on type '{ title: string; text: string; url: string; timestamp: string; }'.
src/components/savings/AddEditGoalModal.tsx(184,9): error TS2322: Type 'string' is not assignable to type 'number'.
src/components/savings/DistributeModal.tsx(76,59): error TS2345: Argument of type 'SavingsGoal[]' is not assignable to parameter of type 'SavingsGoalData[]'.
  Type 'SavingsGoal' is missing the following properties from type 'SavingsGoalData': targetDate, category, description, createdAt, updatedAt
src/components/security/LockScreen.tsx(48,9): error TS2353: Object literal may only specify known properties, and 'confirmText' does not exist in type 'ConfirmConfig'.
src/components/security/LockScreen.tsx(97,9): error TS2554: Expected 1 arguments, but got 0.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(3,30): error TS2307: Cannot find module '../SecuritySettingsRefactored' or its corresponding type declarations.
src/components/settings/sections/NotificationSettingsSection.tsx(197,58): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/components/settings/TransactionArchiving.tsx(3,37): error TS2307: Cannot find module '../../hooks/transactions/useTransactionArchiving' or its corresponding type declarations.
src/components/sharing/__tests__/JoinBudgetModal.test.tsx(2,53): error TS6133: 'Mock' is declared but its value is never read.
src/components/sharing/__tests__/ShareCodeModal.test.tsx(2,53): error TS6133: 'Mock' is declared but its value is never read.
src/components/sharing/__tests__/ShareCodeModal.test.tsx(88,49): error TS2352: Conversion of type '{ user: { userName: string; shareCode: null; }; updateProfile: Mock<Procedure>; }' to type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ user: { userName: string; shareCode: null; }; updateProfile: Mock<Procedure>; }' is missing the following properties from type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }': login, joinBudget, logout, changePassword, and 23 more.
src/components/sharing/__tests__/ShareCodeModal.test.tsx(108,49): error TS2352: Conversion of type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' to type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' is missing the following properties from type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }': login, joinBudget, logout, changePassword, and 23 more.
src/components/sharing/__tests__/ShareCodeModal.test.tsx(125,49): error TS2352: Conversion of type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' to type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' is missing the following properties from type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }': login, joinBudget, logout, changePassword, and 23 more.
src/components/sharing/__tests__/ShareCodeModal.test.tsx(155,49): error TS2352: Conversion of type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' to type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' is missing the following properties from type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }': login, joinBudget, logout, changePassword, and 23 more.
src/components/sharing/__tests__/ShareCodeModal.test.tsx(163,50): error TS2352: Conversion of type '{ showSuccessToast: Mock<Procedure>; showErrorToast: Mock<Procedure>; }' to type '{ showSuccessToast: (message: string, title?: string, duration?: number) => number; showErrorToast: (message: string, title?: string, duration?: number) => number; showWarningToast: (message: string, title?: string, duration?: number) => number; showInfoToast: (message: string, title?: string, duration?: number) => ...' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ showSuccessToast: Mock<Procedure>; showErrorToast: Mock<Procedure>; }' is missing the following properties from type '{ showSuccessToast: (message: string, title?: string, duration?: number) => number; showErrorToast: (message: string, title?: string, duration?: number) => number; showWarningToast: (message: string, title?: string, duration?: number) => number; showInfoToast: (message: string, title?: string, duration?: number) => ...': showWarningToast, showInfoToast, showPaydayToast
src/components/sharing/__tests__/ShareCodeModal.test.tsx(190,49): error TS2352: Conversion of type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' to type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' is missing the following properties from type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }': login, joinBudget, logout, changePassword, and 23 more.
src/components/sharing/__tests__/ShareCodeModal.test.tsx(198,50): error TS2352: Conversion of type '{ showSuccessToast: Mock<Procedure>; showErrorToast: Mock<Procedure>; }' to type '{ showSuccessToast: (message: string, title?: string, duration?: number) => number; showErrorToast: (message: string, title?: string, duration?: number) => number; showWarningToast: (message: string, title?: string, duration?: number) => number; showInfoToast: (message: string, title?: string, duration?: number) => ...' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ showSuccessToast: Mock<Procedure>; showErrorToast: Mock<Procedure>; }' is missing the following properties from type '{ showSuccessToast: (message: string, title?: string, duration?: number) => number; showErrorToast: (message: string, title?: string, duration?: number) => number; showWarningToast: (message: string, title?: string, duration?: number) => number; showInfoToast: (message: string, title?: string, duration?: number) => ...': showWarningToast, showInfoToast, showPaydayToast
src/components/sharing/__tests__/ShareCodeModal.test.tsx(217,49): error TS2352: Conversion of type '{ user: { userName: null; shareCode: null; }; updateProfile: Mock<Procedure>; }' to type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ user: { userName: null; shareCode: null; }; updateProfile: Mock<Procedure>; }' is missing the following properties from type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }': login, joinBudget, logout, changePassword, and 23 more.
src/components/sharing/__tests__/ShareCodeModal.test.tsx(225,50): error TS2352: Conversion of type '{ showSuccessToast: Mock<Procedure>; showErrorToast: Mock<Procedure>; }' to type '{ showSuccessToast: (message: string, title?: string, duration?: number) => number; showErrorToast: (message: string, title?: string, duration?: number) => number; showWarningToast: (message: string, title?: string, duration?: number) => number; showInfoToast: (message: string, title?: string, duration?: number) => ...' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ showSuccessToast: Mock<Procedure>; showErrorToast: Mock<Procedure>; }' is missing the following properties from type '{ showSuccessToast: (message: string, title?: string, duration?: number) => number; showErrorToast: (message: string, title?: string, duration?: number) => number; showWarningToast: (message: string, title?: string, duration?: number) => number; showInfoToast: (message: string, title?: string, duration?: number) => ...': showWarningToast, showInfoToast, showPaydayToast
src/components/sharing/__tests__/ShareCodeModal.test.tsx(242,49): error TS2352: Conversion of type '{ user: { userName: string; shareCode: null; }; updateProfile: Mock<Procedure>; }' to type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ user: { userName: string; shareCode: null; }; updateProfile: Mock<Procedure>; }' is missing the following properties from type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }': login, joinBudget, logout, changePassword, and 23 more.
src/components/sharing/__tests__/ShareCodeModal.test.tsx(250,50): error TS2352: Conversion of type '{ showSuccessToast: Mock<Procedure>; showErrorToast: Mock<Procedure>; }' to type '{ showSuccessToast: (message: string, title?: string, duration?: number) => number; showErrorToast: (message: string, title?: string, duration?: number) => number; showWarningToast: (message: string, title?: string, duration?: number) => number; showInfoToast: (message: string, title?: string, duration?: number) => ...' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ showSuccessToast: Mock<Procedure>; showErrorToast: Mock<Procedure>; }' is missing the following properties from type '{ showSuccessToast: (message: string, title?: string, duration?: number) => number; showErrorToast: (message: string, title?: string, duration?: number) => number; showWarningToast: (message: string, title?: string, duration?: number) => number; showInfoToast: (message: string, title?: string, duration?: number) => ...': showWarningToast, showInfoToast, showPaydayToast
src/components/sharing/__tests__/ShareCodeModal.test.tsx(267,49): error TS2352: Conversion of type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' to type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' is missing the following properties from type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }': login, joinBudget, logout, changePassword, and 23 more.
src/components/sharing/__tests__/ShareCodeModal.test.tsx(292,49): error TS2352: Conversion of type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' to type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' is missing the following properties from type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }': login, joinBudget, logout, changePassword, and 23 more.
src/components/sharing/__tests__/ShareCodeModal.test.tsx(315,49): error TS2352: Conversion of type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' to type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ user: { userName: string; shareCode: string; }; updateProfile: Mock<Procedure>; }' is missing the following properties from type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }': login, joinBudget, logout, changePassword, and 23 more.
src/components/sharing/ShareCodeModal.tsx(151,7): error TS2353: Object literal may only specify known properties, and 'confirmText' does not exist in type 'ConfirmConfig'.
src/components/sync/health/SyncHealthDetails.tsx(139,17): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/sync/health/SyncStatusIndicator.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/sync/SyncHealthDashboard.tsx(48,11): error TS2339: Property 'exportBackup' does not exist on type '{ exportData: () => Promise<void>; }'.
src/components/transactions/__tests__/TransactionFilters.test.tsx(66,15): error TS2740: Type '{ filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; envelopes: { ...; }[]; }' is missing the following properties from type '{ searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; sortBy: any; setSortBy: any; sortOrder: any; setSortOrder: any; envelopes?: any[]; }': searchTerm, setSearchTerm, dateFilter, setDateFilter, and 8 more.
src/components/transactions/__tests__/TransactionFilters.test.tsx(71,15): error TS2740: Type '{ filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; envelopes: { ...; }[]; }' is missing the following properties from type '{ searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; sortBy: any; setSortBy: any; sortOrder: any; setSortOrder: any; envelopes?: any[]; }': searchTerm, setSearchTerm, dateFilter, setDateFilter, and 8 more.
src/components/transactions/__tests__/TransactionFilters.test.tsx(79,15): error TS2740: Type '{ filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; envelopes: { ...; }[]; }' is missing the following properties from type '{ searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; sortBy: any; setSortBy: any; sortOrder: any; setSortOrder: any; envelopes?: any[]; }': searchTerm, setSearchTerm, dateFilter, setDateFilter, and 8 more.
src/components/transactions/__tests__/TransactionFilters.test.tsx(86,15): error TS2740: Type '{ filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; envelopes: { ...; }[]; }' is missing the following properties from type '{ searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; sortBy: any; setSortBy: any; sortOrder: any; setSortOrder: any; envelopes?: any[]; }': searchTerm, setSearchTerm, dateFilter, setDateFilter, and 8 more.
src/components/transactions/__tests__/TransactionFilters.test.tsx(93,15): error TS2740: Type '{ filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; envelopes: { ...; }[]; }' is missing the following properties from type '{ searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; sortBy: any; setSortBy: any; sortOrder: any; setSortOrder: any; envelopes?: any[]; }': searchTerm, setSearchTerm, dateFilter, setDateFilter, and 8 more.
src/components/transactions/__tests__/TransactionFilters.test.tsx(102,15): error TS2740: Type '{ filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; envelopes: { ...; }[]; }' is missing the following properties from type '{ searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; sortBy: any; setSortBy: any; sortOrder: any; setSortOrder: any; envelopes?: any[]; }': searchTerm, setSearchTerm, dateFilter, setDateFilter, and 8 more.
src/components/transactions/__tests__/TransactionFilters.test.tsx(111,15): error TS2740: Type '{ filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; envelopes: { ...; }[]; }' is missing the following properties from type '{ searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; sortBy: any; setSortBy: any; sortOrder: any; setSortOrder: any; envelopes?: any[]; }': searchTerm, setSearchTerm, dateFilter, setDateFilter, and 8 more.
src/components/transactions/__tests__/TransactionFilters.test.tsx(120,15): error TS2740: Type '{ filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; envelopes: { ...; }[]; }' is missing the following properties from type '{ searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; sortBy: any; setSortBy: any; sortOrder: any; setSortOrder: any; envelopes?: any[]; }': searchTerm, setSearchTerm, dateFilter, setDateFilter, and 8 more.
src/components/transactions/__tests__/TransactionFilters.test.tsx(141,52): error TS2322: Type '{ filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; envelopes: { ...; }[]; }' is not assignable to type 'IntrinsicAttributes & { searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; ... 4 more ...; envelopes?: any[]; }'.
  Property 'filters' does not exist on type 'IntrinsicAttributes & { searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; ... 4 more ...; envelopes?: any[]; }'.
src/components/transactions/__tests__/TransactionFilters.test.tsx(151,15): error TS2740: Type '{ filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; envelopes: { ...; }[]; }' is missing the following properties from type '{ searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; sortBy: any; setSortBy: any; sortOrder: any; setSortOrder: any; envelopes?: any[]; }': searchTerm, setSearchTerm, dateFilter, setDateFilter, and 8 more.
src/components/transactions/__tests__/TransactionFilters.test.tsx(158,52): error TS2322: Type '{ categories: undefined[]; filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; envelopes: { ...; }[]; }' is not assignable to type 'IntrinsicAttributes & { searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; ... 4 more ...; envelopes?: any[]; }'.
  Property 'categories' does not exist on type 'IntrinsicAttributes & { searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; ... 4 more ...; envelopes?: any[]; }'.
src/components/transactions/__tests__/TransactionFilters.test.tsx(165,15): error TS2740: Type '{ envelopes: undefined[]; filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; }' is missing the following properties from type '{ searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; sortBy: any; setSortBy: any; sortOrder: any; setSortOrder: any; envelopes?: any[]; }': searchTerm, setSearchTerm, dateFilter, setDateFilter, and 8 more.
src/components/transactions/__tests__/TransactionFilters.test.tsx(174,15): error TS2740: Type '{ filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; envelopes: { ...; }[]; }' is missing the following properties from type '{ searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; sortBy: any; setSortBy: any; sortOrder: any; setSortOrder: any; envelopes?: any[]; }': searchTerm, setSearchTerm, dateFilter, setDateFilter, and 8 more.
src/components/transactions/__tests__/TransactionFilters.test.tsx(184,15): error TS2740: Type '{ filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; envelopes: { ...; }[]; }' is missing the following properties from type '{ searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; sortBy: any; setSortBy: any; sortOrder: any; setSortOrder: any; envelopes?: any[]; }': searchTerm, setSearchTerm, dateFilter, setDateFilter, and 8 more.
src/components/transactions/__tests__/TransactionFilters.test.tsx(196,15): error TS2740: Type '{ filters: { startDate: string; endDate: string; category: string; envelope: string; minAmount: string; maxAmount: string; description: string; }; onFilterChange: Mock<Procedure>; onReset: Mock<...>; categories: string[]; envelopes: { ...; }[]; }' is missing the following properties from type '{ searchTerm: any; setSearchTerm: any; dateFilter: any; setDateFilter: any; typeFilter: any; setTypeFilter: any; envelopeFilter: any; setEnvelopeFilter: any; sortBy: any; setSortBy: any; sortOrder: any; setSortOrder: any; envelopes?: any[]; }': searchTerm, setSearchTerm, dateFilter, setDateFilter, and 8 more.
src/components/transactions/__tests__/TransactionLedger.test.tsx(1,26): error TS6133: 'waitFor' is declared but its value is never read.
src/components/transactions/components/DeleteConfirmation.tsx(20,11): error TS2322: Type 'string' is not assignable to type 'number'.
src/components/transactions/splitter/SplitterHeader.tsx(13,9): error TS2353: Object literal may only specify known properties, and 'confirmText' does not exist in type 'ConfirmConfig'.
src/components/transactions/TransactionSplitter.tsx(37,5): error TS2741: Property 'category' is missing in type '{ id: string; amount: number; description?: string; date?: Date; }' but required in type 'Transaction'.
src/components/transactions/TransactionSplitter.tsx(38,5): error TS2322: Type 'unknown[]' is not assignable to type 'Envelope[]'.
  Type '{}' is missing the following properties from type 'Envelope': id, name, currentBalance, targetAmount
src/components/transactions/TransactionSplitter.tsx(39,5): error TS2322: Type '(allocations: unknown[]) => void' is not assignable to type '(splitTransactions: Transaction[], transaction: Transaction) => Promise<void>'.
  Type 'void' is not assignable to type 'Promise<void>'.
src/components/transactions/TransactionSplitter.tsx(62,9): error TS2353: Object literal may only specify known properties, and 'confirmText' does not exist in type 'ConfirmConfig'.
src/components/ui/ConfirmProvider.tsx(28,15): error TS2339: Property 'children' does not exist on type 'ConfirmConfig'.
src/components/ui/ConnectionDisplay.tsx(220,4): error TS2741: Property 'onDisconnect' is missing in type '{ children: Element[]; title: any; icon: any; theme: any; }' but required in type '{ title?: string; icon: any; onDisconnect: any; children: any; isVisible?: boolean; className?: string; theme?: string; }'.
src/components/ui/EditableBalance.tsx(25,35): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/components/ui/EditLockIndicator.tsx(13,54): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/ui/LoadingSpinner.tsx(4,32): error TS2339: Property 'message' does not exist on type '{}'.
src/components/ui/PromptProvider.tsx(32,15): error TS2339: Property 'children' does not exist on type 'PromptConfig'.
src/components/ui/VersionFooter.tsx(34,60): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type '{}'.
src/contexts/__tests__/authUtils.test.ts(403,9): error TS2741: Property 'userColor' is missing in type '{ userName: string; }' but required in type 'UserData'.
src/contexts/__tests__/authUtils.test.ts(430,9): error TS2741: Property 'userColor' is missing in type '{ userName: string; }' but required in type 'UserData'.
src/domain/schemas/backup.ts(32,15): error TS2554: Expected 2-3 arguments, but got 1.
src/domain/schemas/bill.ts(22,46): error TS2353: Object literal may only specify known properties, and 'errorMap' does not exist in type '{ error?: string | $ZodErrorMap<$ZodIssueInvalidUnion>; message?: string; }'.
src/domain/schemas/transaction.ts(21,43): error TS2353: Object literal may only specify known properties, and 'errorMap' does not exist in type '{ error?: string | $ZodErrorMap<$ZodIssueInvalidUnion>; message?: string; }'.
src/domain/schemas/version-control.ts(20,14): error TS2554: Expected 2-3 arguments, but got 1.
src/hooks/accounts/__tests__/useSupplementalAccounts.test.ts(298,78): error TS2353: Object literal may only specify known properties, and 'balance' does not exist in type 'SetStateAction<AccountForm>'.
src/hooks/accounts/__tests__/useSupplementalAccounts.test.ts(308,40): error TS2322: Type 'number' is not assignable to type 'string'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(5,1): error TS2739: Type '{ createObjectURL: Mock<() => string>; revokeObjectURL: Mock<Procedure>; }' is missing the following properties from type '{ new (url: string | URL, base?: string | URL): URL; prototype: URL; canParse(url: string | URL, base?: string | URL): boolean; createObjectURL(obj: Blob | MediaSource): string; parse(url: string | URL, base?: string | URL): URL; revokeObjectURL(url: string): void; }': prototype, canParse, parse
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(20,3): error TS2322: Type 'Mock<() => { href: string; download: string; click: Mock<Procedure>; style: { visibility: string; }; }>' is not assignable to type '{ <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K]; <K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementDeprecatedTagNameMap[K]; (tagName: string, options?: ElementCreationOptions): HTMLElement; }'.
  Type '{ href: string; download: string; click: Mock<Procedure>; style: { visibility: string; }; }' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 312 more.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(21,3): error TS2740: Type '{ appendChild: Mock<Procedure>; removeChild: Mock<Procedure>; }' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 312 more.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(13,30): error TS2339: Property 'paycheckHistory' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsIntegration.ts(3,32): error TS2307: Cannot find module './useChartConfig' or its corresponding type declarations.
src/hooks/analytics/useAnalyticsIntegration.ts(44,36): error TS2345: Argument of type 'MonthlyTrend[]' is not assignable to parameter of type 'MonthlyGroupData[]'.
  Property 'transactions' is missing in type 'MonthlyTrend' but required in type 'MonthlyGroupData'.
src/hooks/analytics/useAnalyticsIntegration.ts(62,7): error TS2698: Spread types may only be created from object types.
src/hooks/analytics/useAnalyticsIntegration.ts(101,12): error TS2339: Property 'map' does not exist on type 'unknown'.
src/hooks/analytics/usePerformanceMonitor.ts(51,7): error TS2353: Object literal may only specify known properties, and 'spendingEfficiency' does not exist in type 'Metrics'.
src/hooks/analytics/usePerformanceMonitor.ts(58,7): error TS2353: Object literal may only specify known properties, and 'spendingEfficiency' does not exist in type 'Metrics'.
src/hooks/analytics/utils/pdfGeneratorUtils.ts(93,54): error TS2339: Property 'envelopeAnalysis' does not exist on type 'unknown'.
src/hooks/auth/__tests__/useUserSetup.test.ts(36,27): error TS2339: Property 'mockClear' does not exist on type '(message: string, title?: string, duration?: number) => number'.
src/hooks/auth/mutations/__tests__/useJoinBudgetMutation.test.ts(190,11): error TS6133: 'joinData' is declared but its value is never read.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(139,26): error TS2352: Conversion of type 'UserData' to type 'import("violet-vault/src/types/auth").UserData' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Property 'userColor' is missing in type 'UserData' but required in type 'import("violet-vault/src/types/auth").UserData'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(139,74): error TS2559: Type 'SessionData' has no properties in common with type 'SessionData'.
src/hooks/auth/mutations/useLoginMutations.ts(112,38): error TS2345: Argument of type '{ userName: string; userColor: unknown; }' is not assignable to parameter of type '{ userName: string; userColor: string; }'.
  Types of property 'userColor' are incompatible.
    Type 'unknown' is not assignable to type 'string'.
src/hooks/auth/mutations/useLoginMutations.ts(243,26): error TS2352: Conversion of type 'UserData' to type 'import("violet-vault/src/types/auth").UserData' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Property 'userColor' is missing in type 'UserData' but required in type 'import("violet-vault/src/types/auth").UserData'.
src/hooks/auth/mutations/useLoginMutations.ts(243,74): error TS2559: Type 'SessionData' has no properties in common with type 'SessionData'.
src/hooks/auth/mutations/useProfileMutations.ts(6,1): error TS6133: 'UserData' is declared but its value is never read.
src/hooks/auth/queries/usePasswordValidation.ts(68,5): error TS2769: No overload matches this call.
  Overload 1 of 3, '(options: DefinedInitialDataOptions<unknown, Error, unknown, any[]>, queryClient?: QueryClient): DefinedUseQueryResult<unknown, Error>', gave the following error.
    Object literal may only specify known properties, and 'cacheTime' does not exist in type 'DefinedInitialDataOptions<unknown, Error, unknown, any[]>'.
  Overload 2 of 3, '(options: UndefinedInitialDataOptions<{ isValid: boolean; reason: string; error?: undefined; } | { isValid: boolean; reason?: undefined; error?: undefined; } | { isValid: boolean; reason: string; error: any; }, Error, { ...; } | { ...; } | { ...; }, any[]>, queryClient?: QueryClient): UseQueryResult<...>', gave the following error.
    Object literal may only specify known properties, and 'cacheTime' does not exist in type 'UndefinedInitialDataOptions<{ isValid: boolean; reason: string; error?: undefined; } | { isValid: boolean; reason?: undefined; error?: undefined; } | { isValid: boolean; reason: string; error: any; }, Error, { isValid: boolean; reason: string; error?: undefined; } | { ...; } | { ...; }, any[]>'.
  Overload 3 of 3, '(options: UseQueryOptions<{ isValid: boolean; reason: string; error?: undefined; } | { isValid: boolean; reason?: undefined; error?: undefined; } | { isValid: boolean; reason: string; error: any; }, Error, { ...; } | { ...; } | { ...; }, any[]>, queryClient?: QueryClient): UseQueryResult<...>', gave the following error.
    Object literal may only specify known properties, and 'cacheTime' does not exist in type 'UseQueryOptions<{ isValid: boolean; reason: string; error?: undefined; } | { isValid: boolean; reason?: undefined; error?: undefined; } | { isValid: boolean; reason: string; error: any; }, Error, { isValid: boolean; reason: string; error?: undefined; } | { ...; } | { ...; }, any[]>'.
src/hooks/auth/useAuthCompatibility.ts(63,38): error TS2339: Property 'refetch' does not exist on type '{ password: any; enabled: boolean; }'.
src/hooks/auth/useAuthenticationManager.ts(132,7): error TS2322: Type '(userDataOrPassword: any) => Promise<LoginResult>' is not assignable to type '(userDataOrPassword: unknown) => Promise<void>'.
  Type 'Promise<LoginResult>' is not assignable to type 'Promise<void>'.
    Type 'LoginResult' is not assignable to type 'void'.
src/hooks/auth/useSecurityManagerUI.ts(181,85): error TS2554: Expected 1-2 arguments, but got 3.
src/hooks/bills/useBillForm.ts(104,47): error TS2345: Argument of type 'Bill' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'Bill'.
src/hooks/bills/useBillForm.ts(171,5): error TS4104: The type 'readonly string[]' is 'readonly' and cannot be assigned to the mutable type 'string[]'.
src/hooks/bills/useBillManager.ts(83,30): error TS2352: Conversion of type 'UseMutateFunction<{ id: string; lastModified: number; name: string; dueDate: Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; frequency?: "monthly" | "quarterly" | "annually"; envelopeId?: string; createdAt?: number; description?: string; paymentMethod?: string; }, Error, { ...; }, unkn...' to type '(bill: Bill) => Promise<void>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of parameters 'variables' and 'bill' are incompatible.
    Type 'Bill' is missing the following properties from type '{ billId: string; updates: Record<string, unknown>; }': billId, updates
src/hooks/bills/useBillManager.ts(121,72): error TS2345: Argument of type 'import("violet-vault/src/db/types").Transaction[]' is not assignable to parameter of type 'Transaction[]'.
  Type 'import("violet-vault/src/db/types").Transaction' is not assignable to type 'Transaction'.
    Index signature for type 'string' is missing in type 'Transaction'.
src/hooks/bills/useBillManager.ts(122,63): error TS2345: Argument of type 'Envelope[]' is not assignable to parameter of type 'Envelope[]'.
  Type 'Envelope' is not assignable to type 'Envelope'. Two different types with this name exist, but they are unrelated.
    Index signature for type 'string' is missing in type 'Envelope'.
src/hooks/bills/useBillManager.ts(124,40): error TS2345: Argument of type 'import("violet-vault/src/db/types").Bill[]' is not assignable to parameter of type 'Bill[]'.
  Type 'import("violet-vault/src/db/types").Bill' is not assignable to type 'Bill'.
    Index signature for type 'string' is missing in type 'Bill'.
src/hooks/bills/useBillManager.ts(125,70): error TS2345: Argument of type '(bill: Bill) => Promise<void>' is not assignable to parameter of type '(updates: { billId: string; updates: Record<string, unknown>; }) => Promise<void>'.
  Types of parameters 'bill' and 'updates' are incompatible.
    Type '{ billId: string; updates: Record<string, unknown>; }' is missing the following properties from type 'Bill': id, name, amount, dueDate
src/hooks/bills/useBillManager.ts(127,39): error TS2345: Argument of type 'CategorizedBills' is not assignable to parameter of type 'CategorizedBills'.
  Types of property 'all' are incompatible.
    Type 'Bill[]' is not assignable to type 'Bill[]'. Two different types with this name exist, but they are unrelated.
      Type 'Bill' is not assignable to type 'Bill'. Two different types with this name exist, but they are unrelated.
        Property 'name' is optional in type 'Bill' but required in type 'Bill'.
src/hooks/bills/useBillManager.ts(167,7): error TS2554: Expected 2 arguments, but got 8.
src/hooks/bills/useBillManager.ts(181,7): error TS2554: Expected 2 arguments, but got 6.
src/hooks/bills/useBillManager.ts(200,84): error TS2322: Type 'Dispatch<SetStateAction<{ search: string; urgency: string; envelope: string; amountMin: string; amountMax: string; }>>' is not assignable to type '(options: FilterOptions) => void'.
  Types of parameters 'value' and 'options' are incompatible.
    Type 'FilterOptions' is not assignable to type 'SetStateAction<{ search: string; urgency: string; envelope: string; amountMin: string; amountMax: string; }>'.
      Type 'FilterOptions' is not assignable to type '{ search: string; urgency: string; envelope: string; amountMin: string; amountMax: string; }'.
        Property 'search' is optional in type 'FilterOptions' but required in type '{ search: string; urgency: string; envelope: string; amountMin: string; amountMax: string; }'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(6,22): error TS6133: 'waitFor' is declared but its value is never read.
src/hooks/bills/useBills/__tests__/billQueries.test.ts(421,69): error TS2345: Argument of type '{ id: string; name: string; provider: string; amount: number; dueDate: string; category: string; isPaid: boolean; createdAt: string; updatedAt: string; }[]' is not assignable to parameter of type 'Bill[]'.
  Type '{ id: string; name: string; provider: string; amount: number; dueDate: string; category: string; isPaid: boolean; createdAt: string; updatedAt: string; }' is missing the following properties from type 'Bill': isRecurring, lastModified
src/hooks/bills/useBills/__tests__/billQueries.test.ts(452,69): error TS2345: Argument of type '{ id: string; name: string; provider: string; amount: number; dueDate: string; category: string; isPaid: boolean; createdAt: string; updatedAt: string; }[]' is not assignable to parameter of type 'Bill[]'.
  Type '{ id: string; name: string; provider: string; amount: number; dueDate: string; category: string; isPaid: boolean; createdAt: string; updatedAt: string; }' is missing the following properties from type 'Bill': isRecurring, lastModified
src/hooks/bills/useBills/billMutations.ts(224,39): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/bills/useBills/billQueries.ts(213,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/bills/useBills/index.ts(22,60): error TS2339: Property 'daysAhead' does not exist on type '{}'.
src/hooks/bills/useBillValidation.ts(20,40): error TS2339: Property 'errors' does not exist on type 'ZodError<{ id: string; name: string; amount: number; category: string; isPaid: boolean; isRecurring: boolean; lastModified: number; dueDate?: string | Date; frequency?: "monthly" | "quarterly" | "annually"; envelopeId?: string; createdAt?: number; description?: string; paymentMethod?: string; }>'.
src/hooks/budgeting/__tests__/useEnvelopesQuery.test.ts(11,3): error TS6133: 'expectQuerySuccess' is declared but its value is never read.
src/hooks/budgeting/autofunding/queries/useExecutableRules.ts(21,57): error TS2345: Argument of type 'Rule' is not assignable to parameter of type 'import("violet-vault/src/utils/budgeting/autofunding/conditions").Rule'.
  Type 'Rule' is missing the following properties from type 'Rule': enabled, trigger, type
src/hooks/budgeting/autofunding/queries/useRuleFilters.ts(21,41): error TS2345: Argument of type 'Rule[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type 'Rule' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 7 more.
src/hooks/budgeting/autofunding/useAutoFunding.ts(28,24): error TS2339: Property 'envelopes' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(29,29): error TS2339: Property 'unassignedCash' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(30,30): error TS2339: Property 'allTransactions' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(43,45): error TS2345: Argument of type '{ rules: Rule[]; addRule: (ruleConfig: Partial<Rule>) => Rule; updateRule: (ruleId: string, updates: Partial<Rule>) => Rule; deleteRule: (ruleId: string) => true; ... 15 more ...; setAllRules: (newRules: Rule[]) => void; }' is not assignable to parameter of type 'UseAutoFundingRulesReturn'.
  Types of property 'rules' are incompatible.
    Type 'Rule[]' is not assignable to type 'AutoFundingRule[]'.
      Type 'Rule' is missing the following properties from type 'AutoFundingRule': description, trigger, priority, createdAt, config
src/hooks/budgeting/autofunding/useAutoFunding.ts(50,49): error TS2345: Argument of type '{ rules: Rule[]; addRule: (ruleConfig: Partial<Rule>) => Rule; updateRule: (ruleId: string, updates: Partial<Rule>) => Rule; deleteRule: (ruleId: string) => true; ... 15 more ...; setAllRules: (newRules: Rule[]) => void; }' is not assignable to parameter of type 'UseAutoFundingRulesReturn'.
  Types of property 'rules' are incompatible.
    Type 'Rule[]' is not assignable to type 'AutoFundingRule[]'.
      Type 'Rule' is missing the following properties from type 'AutoFundingRule': description, trigger, priority, createdAt, config
src/hooks/budgeting/autofunding/useAutoFunding.ts(65,50): error TS2345: Argument of type '{ rules: Rule[]; addRule: (ruleConfig: Partial<Rule>) => Rule; updateRule: (ruleId: string, updates: Partial<Rule>) => Rule; deleteRule: (ruleId: string) => true; ... 15 more ...; setAllRules: (newRules: Rule[]) => void; }' is not assignable to parameter of type 'UseAutoFundingRulesReturn'.
  Types of property 'rules' are incompatible.
    Type 'Rule[]' is not assignable to type 'AutoFundingRule[]'.
      Type 'Rule' is missing the following properties from type 'AutoFundingRule': description, trigger, priority, createdAt, config
src/hooks/budgeting/autofunding/useAutoFunding.ts(66,30): error TS2345: Argument of type 'boolean' is not assignable to parameter of type 'string'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(80,52): error TS2345: Argument of type '{ rules: Rule[]; addRule: (ruleConfig: Partial<Rule>) => Rule; updateRule: (ruleId: string, updates: Partial<Rule>) => Rule; deleteRule: (ruleId: string) => true; ... 15 more ...; setAllRules: (newRules: Rule[]) => void; }' is not assignable to parameter of type 'UseAutoFundingRulesReturn'.
  Types of property 'rules' are incompatible.
    Type 'Rule[]' is not assignable to type 'AutoFundingRule[]'.
      Type 'Rule' is missing the following properties from type 'AutoFundingRule': description, trigger, priority, createdAt, config
src/hooks/budgeting/autofunding/useAutoFunding.ts(93,50): error TS2345: Argument of type '{ rules: Rule[]; addRule: (ruleConfig: Partial<Rule>) => Rule; updateRule: (ruleId: string, updates: Partial<Rule>) => Rule; deleteRule: (ruleId: string) => true; ... 15 more ...; setAllRules: (newRules: Rule[]) => void; }' is not assignable to parameter of type 'UseAutoFundingRulesReturn'.
  Types of property 'rules' are incompatible.
    Type 'Rule[]' is not assignable to type 'AutoFundingRule[]'.
      Type 'Rule' is missing the following properties from type 'AutoFundingRule': description, trigger, priority, createdAt, config
src/hooks/budgeting/autofunding/useAutoFunding.ts(128,30): error TS2345: Argument of type '{ rules: Rule[]; addRule: (ruleConfig: Partial<Rule>) => Rule; updateRule: (ruleId: string, updates: Partial<Rule>) => Rule; deleteRule: (ruleId: string) => true; ... 15 more ...; setAllRules: (newRules: Rule[]) => void; }' is not assignable to parameter of type 'UseAutoFundingRulesReturn'.
  Types of property 'rules' are incompatible.
    Type 'Rule[]' is not assignable to type 'AutoFundingRule[]'.
      Type 'Rule' is missing the following properties from type 'AutoFundingRule': description, trigger, priority, createdAt, config
src/hooks/budgeting/autofunding/useAutoFunding.ts(134,49): error TS2345: Argument of type '{ rules: Rule[]; addRule: (ruleConfig: Partial<Rule>) => Rule; updateRule: (ruleId: string, updates: Partial<Rule>) => Rule; deleteRule: (ruleId: string) => true; ... 15 more ...; setAllRules: (newRules: Rule[]) => void; }' is not assignable to parameter of type 'UseAutoFundingRulesReturn'.
  Types of property 'rules' are incompatible.
    Type 'Rule[]' is not assignable to type 'AutoFundingRule[]'.
      Type 'Rule' is missing the following properties from type 'AutoFundingRule': description, trigger, priority, createdAt, config
src/hooks/budgeting/autofunding/useAutoFunding.ts(141,26): error TS2345: Argument of type '{ rules: Rule[]; addRule: (ruleConfig: Partial<Rule>) => Rule; updateRule: (ruleId: string, updates: Partial<Rule>) => Rule; deleteRule: (ruleId: string) => true; ... 15 more ...; setAllRules: (newRules: Rule[]) => void; }' is not assignable to parameter of type 'UseAutoFundingRulesReturn'.
  Types of property 'rules' are incompatible.
    Type 'Rule[]' is not assignable to type 'AutoFundingRule[]'.
      Type 'Rule' is missing the following properties from type 'AutoFundingRule': description, trigger, priority, createdAt, config
src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts(193,30): error TS2345: Argument of type 'ExecutionDetails' is not assignable to parameter of type 'ExecutionHistoryEntry'.
  Property 'timestamp' is optional in type 'ExecutionDetails' but required in type 'ExecutionHistoryEntry'.
src/hooks/budgeting/autofunding/useAutoFundingHistory.ts(31,18): error TS2339: Property 'clearUndoStack' does not exist on type '{ undoStack: any[]; addToUndoStack: (executionRecord: any, executionResults: any) => void; getUndoableExecutions: () => any[]; getUndoStatistics: () => { totalUndoable: number; totalAmount: any; oldestUndoable: any; newestUndoable: any; }; undoLastExecution: () => Promise<...>; undoExecution: (executionId: any) => P...'.
src/hooks/budgeting/autofunding/useAutoFundingHistory.ts(71,32): error TS2345: Argument of type 'ExecutionRecord[]' is not assignable to parameter of type 'HistoryExecution[]'.
  Type 'ExecutionRecord' is not assignable to type 'HistoryExecution'.
    Property 'executedAt' is optional in type 'ExecutionRecord' but required in type 'HistoryExecution'.
src/hooks/budgeting/autofunding/utils/useRuleStatistics.ts(20,32): error TS2345: Argument of type 'Rule[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type 'Rule' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 7 more.
src/hooks/budgeting/autofunding/utils/useRuleSummaries.ts(26,65): error TS2345: Argument of type 'Rule' is not assignable to parameter of type 'AutoFundingRule'.
  Type 'Rule' is missing the following properties from type 'AutoFundingRule': name, description, type, trigger, and 6 more.
src/hooks/budgeting/metadata/useActualBalance.ts(82,5): error TS2769: No overload matches this call.
  Overload 1 of 3, '(options: DefinedInitialDataOptions<BalanceData, Error, BalanceData, readonly unknown[]>, queryClient?: QueryClient): DefinedUseQueryResult<...>', gave the following error.
    Type '() => Promise<{ actualBalance: number; isActualBalanceManual: unknown; }>' is not assignable to type 'QueryFunction<BalanceData, readonly unknown[]>'.
      Type 'Promise<{ actualBalance: number; isActualBalanceManual: unknown; }>' is not assignable to type 'BalanceData | Promise<BalanceData>'.
        Type 'Promise<{ actualBalance: number; isActualBalanceManual: unknown; }>' is not assignable to type 'Promise<BalanceData>'.
          Type '{ actualBalance: number; isActualBalanceManual: unknown; }' is not assignable to type 'BalanceData'.
            Types of property 'isActualBalanceManual' are incompatible.
              Type 'unknown' is not assignable to type 'boolean'.
  Overload 2 of 3, '(options: UndefinedInitialDataOptions<BalanceData, Error, BalanceData, readonly unknown[]>, queryClient?: QueryClient): UseQueryResult<...>', gave the following error.
    Type '() => Promise<{ actualBalance: number; isActualBalanceManual: unknown; }>' is not assignable to type 'unique symbol | QueryFunction<BalanceData, readonly unknown[], never>'.
      Type '() => Promise<{ actualBalance: number; isActualBalanceManual: unknown; }>' is not assignable to type 'QueryFunction<BalanceData, readonly unknown[], never>'.
        Type 'Promise<{ actualBalance: number; isActualBalanceManual: unknown; }>' is not assignable to type 'BalanceData | Promise<BalanceData>'.
          Type 'Promise<{ actualBalance: number; isActualBalanceManual: unknown; }>' is not assignable to type 'Promise<BalanceData>'.
            Type '{ actualBalance: number; isActualBalanceManual: unknown; }' is not assignable to type 'BalanceData'.
              Types of property 'isActualBalanceManual' are incompatible.
                Type 'unknown' is not assignable to type 'boolean'.
  Overload 3 of 3, '(options: UseQueryOptions<BalanceData, Error, BalanceData, readonly unknown[]>, queryClient?: QueryClient): UseQueryResult<BalanceData, Error>', gave the following error.
    Type '() => Promise<{ actualBalance: number; isActualBalanceManual: unknown; }>' is not assignable to type 'unique symbol | QueryFunction<BalanceData, readonly unknown[], never>'.
      Type '() => Promise<{ actualBalance: number; isActualBalanceManual: unknown; }>' is not assignable to type 'QueryFunction<BalanceData, readonly unknown[], never>'.
        Type 'Promise<{ actualBalance: number; isActualBalanceManual: unknown; }>' is not assignable to type 'BalanceData | Promise<BalanceData>'.
          Type 'Promise<{ actualBalance: number; isActualBalanceManual: unknown; }>' is not assignable to type 'Promise<BalanceData>'.
            Type '{ actualBalance: number; isActualBalanceManual: unknown; }' is not assignable to type 'BalanceData'.
              Types of property 'isActualBalanceManual' are incompatible.
                Type 'unknown' is not assignable to type 'boolean'.
src/hooks/budgeting/metadata/useActualBalanceOperations.ts(16,48): error TS2345: Argument of type 'number' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/budgeting/metadata/useBudgetMetadataQuery.ts(37,9): error TS2739: Type 'BudgetMetadata' is missing the following properties from type 'BudgetRecord': id, lastModified
src/hooks/budgeting/metadata/useBudgetMetadataUtils.ts(20,53): error TS2345: Argument of type 'number' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/budgeting/metadata/useUnassignedCash.ts(93,56): error TS2345: Argument of type 'number' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/budgeting/useBudgetData/index.ts(42,47): error TS2339: Property 'unassignedCash' does not exist on type '{}'.
src/hooks/budgeting/useBudgetData/index.ts(43,46): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/useBudgetData/paycheckMutations.ts(37,35): error TS2345: Argument of type 'void' is not assignable to parameter of type 'string'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(8,34): error TS6196: 'Transaction' is declared but never used.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(18,11): error TS6196: 'Bill' is declared but never used.
src/hooks/budgeting/useBudgetData/utilities.ts(17,38): error TS2554: Expected 1 arguments, but got 0.
src/hooks/budgeting/useBudgetData/utilities.ts(18,50): error TS2554: Expected 2-3 arguments, but got 1.
src/hooks/budgeting/useEnvelopeForm.ts(52,22): error TS2538: Type 'any' cannot be used as an index type.
src/hooks/budgeting/usePaycheckProcessor.ts(39,5): error TS2345: Argument of type '(formData: PaycheckFormData) => ValidationResult' is not assignable to parameter of type '(data: FormData) => ValidationResult'.
  Types of parameters 'formData' and 'data' are incompatible.
    Type 'FormData' is missing the following properties from type 'PaycheckFormData': payerName, allocationMode
src/hooks/budgeting/usePaycheckProcessor.ts(187,5): error TS2448: Block-scoped variable 'resetForm' used before its declaration.
src/hooks/budgeting/useSmartSuggestions.ts(63,9): error TS2322: Type 'Set<unknown>' is not assignable to type 'Set<string>'.
  Type 'unknown' is not assignable to type 'string'.
src/hooks/budgeting/useUnassignedCashDistribution.ts(115,14): error TS2365: Operator '+' cannot be applied to types 'unknown' and 'number'.
src/hooks/budgeting/useUnassignedCashDistribution.ts(121,29): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(126,12): error TS2365: Operator '>' cannot be applied to types 'unknown' and 'number'.
src/hooks/common/bug-report/useBugReportSubmission.ts(148,59): error TS2345: Argument of type '{ title: string; description: string; includeScreenshot: boolean; severity: string; labels: string[]; providers: Record<string, unknown>; customData: { highlightSession: HighlightSessionState; }; }' is not assignable to parameter of type 'BugReportOptions'.
  Types of property 'severity' are incompatible.
    Type 'string' is not assignable to type '"low" | "medium" | "high" | "critical"'.
src/hooks/common/bug-report/useBugReportSubmission.ts(188,9): error TS2322: Type 'string' is not assignable to type '"low" | "medium" | "high" | "critical"'.
src/hooks/common/useActivityLogger.ts(16,37): error TS2345: Argument of type 'UserData' is not assignable to parameter of type 'ActivityUser'.
  Property 'id' is missing in type 'UserData' but required in type 'ActivityUser'.
src/hooks/common/useConnectionManager.ts(103,9): error TS2322: Type 'Envelope | Bill | Debt' is not assignable to type 'Envelope'.
  Property 'archived' is missing in type 'Bill' but required in type 'Envelope'.
src/hooks/dashboard/useMainDashboard.ts(78,43): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/hooks/debts/helpers/debtManagementHelpers.ts(455,89): error TS2345: Argument of type 'Envelope' is not assignable to parameter of type 'import("violet-vault/src/db/types").Envelope'.
  Type 'Envelope' is missing the following properties from type 'Envelope': name, category, archived, lastModified
src/hooks/debts/useDebtManagement.ts(35,23): error TS2339: Property 'createBill' does not exist on type '{ refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<Bill[], Error>>; invalidate: () => Promise<void>; ... 36 more ...; bills: Bill[]; }'.
src/hooks/debts/useDebtManagement.ts(36,27): error TS2339: Property 'createEnvelope' does not exist on type '{ envelopes: Envelope[]; totalBalance: any; totalTargetAmount: any; underfundedEnvelopes: any[]; overfundedEnvelopes: any[]; availableCategories: any[]; isLoading: boolean; isFetching: boolean; ... 18 more ...; invalidate: () => Promise<...>; }'.
src/hooks/debts/useDebtManagement.ts(37,30): error TS2339: Property 'createTransaction' does not exist on type '{ isLoading: false; isFetching: boolean; isError: boolean; error: Error; addTransaction: UseMutateFunction<Transaction, Error, TransactionInput, unknown>; ... 29 more ...; transactions: Transaction[]; }'.
src/hooks/debts/useDebtManagement.ts(46,44): error TS2345: Argument of type 'import("violet-vault/src/db/types").Bill[]' is not assignable to parameter of type 'Bill[]'.
  Type 'import("violet-vault/src/db/types").Bill' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/debts/useDebtManagement.ts(71,43): error TS2339: Property 'currentBalance' does not exist on type 'DebtAccount'.
src/hooks/debts/useDebtManagement.ts(101,7): error TS2322: Type 'UseMutateFunction<{ id: string; lastModified: number; name: string; dueDate: Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; frequency?: "monthly" | "quarterly" | "annually"; envelopeId?: string; createdAt?: number; description?: string; paymentMethod?: string; }, Error, { ...; }, unkn...' is not assignable to type '(id: string, data: { debtId: string; }) => Promise<void>'.
  Types of parameters 'variables' and 'id' are incompatible.
    Type 'string' is not assignable to type '{ billId: string; updates: Record<string, unknown>; }'.
src/hooks/debts/useDebtManagement.ts(125,7): error TS2322: Type 'import("violet-vault/src/db/types").Bill[]' is not assignable to type 'Bill[]'.
  Type 'import("violet-vault/src/db/types").Bill' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/debts/useDebtManagement.ts(126,7): error TS2322: Type 'UseMutateFunction<{ id: string; lastModified: number; name: string; dueDate: Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; frequency?: "monthly" | "quarterly" | "annually"; envelopeId?: string; createdAt?: number; description?: string; paymentMethod?: string; }, Error, { ...; }, unkn...' is not assignable to type '(id: string, data: { debtId: string; amount: number; }) => Promise<void>'.
  Types of parameters 'variables' and 'id' are incompatible.
    Type 'string' is not assignable to type '{ billId: string; updates: Record<string, unknown>; }'.
src/hooks/debts/useDebtManagement.ts(135,7): error TS2322: Type 'import("violet-vault/src/db/types").Bill[]' is not assignable to type 'Bill[]'.
  Type 'import("violet-vault/src/db/types").Bill' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/debts/useDebtManagement.ts(154,7): error TS2322: Type 'import("violet-vault/src/db/types").Bill[]' is not assignable to type 'Bill[]'.
  Type 'import("violet-vault/src/db/types").Bill' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/debts/useDebtManagement.ts(155,7): error TS2322: Type 'UseMutateFunction<string, Error, string, unknown>' is not assignable to type '(id: string) => Promise<void>'.
  Type 'void' is not assignable to type 'Promise<void>'.
src/hooks/debts/useDebts.ts(98,31): error TS2339: Property 'paymentHistory' does not exist on type 'Debt'.
src/hooks/debts/useDebts.ts(110,7): error TS2353: Object literal may only specify known properties, and 'paymentHistory' does not exist in type 'UpdateSpec<Debt> | ((obj: Debt, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/hooks/debts/useDebts.ts(132,49): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/layout/useLayoutData.ts(74,28): error TS2339: Property 'error' does not exist on type '{ envelopes: Envelope[]; transactions: any; bills: Bill[]; savingsGoals: SavingsGoal[]; paycheckHistory: PaycheckHistory[]; dashboardSummary: {}; ... 33 more ...; dashboardError: Error; }'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(40,45): error TS2345: Argument of type 'SavingsGoal' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'SavingsGoal'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(61,22): error TS6133: 'goalData' is declared but its value is never read.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(98,47): error TS2345: Argument of type 'SavingsGoal' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'SavingsGoal'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(130,47): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(231,26): error TS2365: Operator '+' cannot be applied to types 'string | number' and 'number'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(151,32): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<any>'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(204,29): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<{ commit: { hash: string; timestamp: number; message: string; author: string; parentHash: any; encryptedSnapshot: string; deviceFingerprint: string; }; changes: BudgetChange[]; }>'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(224,29): error TS2339: Property 'mockRejectedValue' does not exist on type '() => Promise<{ commit: { hash: string; timestamp: number; message: string; author: string; parentHash: any; encryptedSnapshot: string; deviceFingerprint: string; }; changes: BudgetChange[]; }>'.
src/hooks/settings/useEnvelopeIntegrity.ts(49,17): error TS2345: Argument of type '{ total: number; corrupted: number; healthy: number; corruptedEnvelopes: { id: string | number; name: string; category: string; monthlyAmount: number; currentBalance: number; createdAt: string; issues: string[]; }[]; recommendations: string[]; } | { ...; }' is not assignable to parameter of type 'SetStateAction<IntegrityReport>'.
  Type '{ total: number; corrupted: number; healthy: number; corruptedEnvelopes: { id: string | number; name: string; category: string; monthlyAmount: number; currentBalance: number; createdAt: string; issues: string[]; }[]; recommendations: string[]; }' is not assignable to type 'SetStateAction<IntegrityReport>'.
    Type '{ total: number; corrupted: number; healthy: number; corruptedEnvelopes: { id: string | number; name: string; category: string; monthlyAmount: number; currentBalance: number; createdAt: string; issues: string[]; }[]; recommendations: string[]; }' is not assignable to type 'IntegrityReport'.
      Types of property 'corruptedEnvelopes' are incompatible.
        Type '{ id: string | number; name: string; category: string; monthlyAmount: number; currentBalance: number; createdAt: string; issues: string[]; }[]' is not assignable to type '{ id: string; name?: string; category?: string; currentBalance?: number; monthlyAmount?: number; issues: string[]; }[]'.
          Type '{ id: string | number; name: string; category: string; monthlyAmount: number; currentBalance: number; createdAt: string; issues: string[]; }' is not assignable to type '{ id: string; name?: string; category?: string; currentBalance?: number; monthlyAmount?: number; issues: string[]; }'.
            Types of property 'id' are incompatible.
              Type 'string | number' is not assignable to type 'string'.
                Type 'number' is not assignable to type 'string'.
src/hooks/settings/useTransactionArchiving.ts(37,47): error TS2307: Cannot find module '../../utils/transactionArchiving' or its corresponding type declarations.
src/hooks/settings/useTransactionArchiving.ts(118,13): error TS2339: Property 'onSuccess' does not exist on type '{}'.
src/hooks/settings/useTransactionArchiving.ts(118,24): error TS2339: Property 'onError' does not exist on type '{}'.
src/hooks/settings/useTransactionArchiving.ts(118,33): error TS2339: Property '_onReset' does not exist on type '{}'.
src/hooks/settings/useTransactionArchiving.ts(118,33): error TS6133: '_onReset' is declared but its value is never read.
src/hooks/sync/useManualSync.ts(234,22): error TS2352: Conversion of type '{ isSyncing: boolean; isRunning: boolean; lastSyncTime: number; syncIntervalMs: number; syncType: string; hasConfig: boolean; }' to type 'ServiceStatus' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'lastSyncTime' are incompatible.
    Type 'number' is not comparable to type 'Date'.
src/hooks/transactions/__tests__/useTransactionAnalytics.test.ts(2,22): error TS6133: 'act' is declared but its value is never read.
src/hooks/transactions/__tests__/useTransactionAnalytics.test.ts(3,8): error TS2613: Module '"violet-vault/src/hooks/transactions/useTransactionAnalytics"' has no default export. Did you mean to use 'import { useTransactionAnalytics } from "/Users/thef4tdaddy/Git/violet-vault/src/hooks/transactions/useTransactionAnalytics"' instead?
src/hooks/transactions/__tests__/useTransactionAnalytics.test.ts(239,18): error TS2322: Type '({ id: string; description: string; amount: number; date: string; category: string; tags: string[]; } | { id: string; description: string; amount: number; date: string; category: string; })[]' is not assignable to type '{ id: string; description: string; amount: number; date: string; category: string; tags: string[]; }[]'.
  Type '{ id: string; description: string; amount: number; date: string; category: string; tags: string[]; } | { id: string; description: string; amount: number; date: string; category: string; }' is not assignable to type '{ id: string; description: string; amount: number; date: string; category: string; tags: string[]; }'.
    Property 'tags' is missing in type '{ id: string; description: string; amount: number; date: string; category: string; }' but required in type '{ id: string; description: string; amount: number; date: string; category: string; tags: string[]; }'.
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(44,27): error TS2339: Property 'isUpdating' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'.
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(45,27): error TS2339: Property 'updateError' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'.
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(46,34): error TS2551: Property 'updateBalanceForTransaction' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(47,34): error TS2551: Property 'updateBalanceForMultipleTransactions' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(68,45): error TS2551: Property 'updateBalanceForTransaction' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(94,45): error TS2551: Property 'updateBalanceForTransaction' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(99,29): error TS2339: Property 'updateError' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'.
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(107,45): error TS2551: Property 'updateBalanceForTransaction' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(129,24): error TS2551: Property 'updateBalanceForTransaction' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(133,29): error TS2339: Property 'isUpdating' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'.
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(137,29): error TS2339: Property 'isUpdating' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'.
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(158,45): error TS2551: Property 'updateBalanceForMultipleTransactions' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(184,45): error TS2551: Property 'updateBalanceForMultipleTransactions' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(199,45): error TS2551: Property 'updateBalanceForMultipleTransactions' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(225,30): error TS2551: Property 'updateBalanceForTransaction' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(250,30): error TS2551: Property 'updateBalanceForTransaction' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(276,30): error TS2551: Property 'updateBalanceForTransaction' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(279,29): error TS2339: Property 'updateError' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'.
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(289,30): error TS2551: Property 'updateBalanceForTransaction' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(292,29): error TS2339: Property 'updateError' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'.
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(311,26): error TS2551: Property 'updateBalanceForTransaction' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(312,26): error TS2551: Property 'updateBalanceForTransaction' does not exist on type '{ updateBalancesForTransaction: (transaction: any, isRemoving?: boolean) => Promise<void>; }'. Did you mean 'updateBalancesForTransaction'?
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(64,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(66,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(68,29): error TS2339: Property 'errors' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(69,29): error TS2339: Property 'totals' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(73,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(75,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(76,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(77,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(78,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(87,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(89,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(90,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(91,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(92,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(98,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(101,24): error TS2339: Property 'addSplit' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(104,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(105,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(106,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(110,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(113,24): error TS2339: Property 'addSplit' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(116,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(119,24): error TS2339: Property 'removeSplit' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(122,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(126,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(129,24): error TS2339: Property 'removeSplit' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(132,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(136,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(139,24): error TS2339: Property 'updateSplitField' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(142,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(152,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(155,24): error TS2339: Property 'updateSplitField' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(158,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(159,29): error TS2339: Property 'totals' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(165,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(168,24): error TS2339: Property 'addSplit' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(169,24): error TS2339: Property 'distributeEvenly' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(172,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(173,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(174,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(178,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(183,24): error TS2339: Property 'distributeByPercentage' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(186,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(187,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(191,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(194,24): error TS2339: Property 'clearAllAmounts' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(197,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(198,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(204,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(208,34): error TS2339: Property 'validateSplits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(213,24): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(227,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(231,34): error TS2339: Property 'validateSplits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(235,29): error TS2339: Property 'errors' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(236,29): error TS2339: Property 'errors' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(250,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(253,30): error TS2339: Property 'handleSubmit' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(258,24): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(272,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(275,30): error TS2339: Property 'handleSubmit' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(278,29): error TS2339: Property 'submitError' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(288,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(291,30): error TS2339: Property 'handleSubmit' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(306,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(309,24): error TS2339: Property 'handleSubmit' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(323,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(327,24): error TS2339: Property 'updateSplitField' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(328,24): error TS2339: Property 'addSplit' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(331,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(332,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(336,24): error TS2339: Property 'resetForm' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(339,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(340,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(341,29): error TS2339: Property 'errors' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(345,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(348,24): error TS2339: Property 'handleCancel' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(360,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(364,24): error TS2339: Property 'validateSplits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(367,29): error TS2339: Property 'errors' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(371,24): error TS2339: Property 'updateSplitField' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(374,29): error TS2339: Property 'errors' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(390,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(392,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(393,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(407,68): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(409,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(410,29): error TS2339: Property 'splits' does not exist on type '{ splitAllocations: any[]; setSplitAllocations: Dispatch<SetStateAction<any[]>>; isProcessing: boolean; setIsProcessing: Dispatch<SetStateAction<boolean>>; resetState: () => void; }'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(420,51): error TS2554: Expected 0 arguments, but got 1.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(41,39): error TS2339: Property 'filterTransactions' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(52,39): error TS2339: Property 'filterTransactions' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(63,39): error TS2339: Property 'filterTransactions' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(76,39): error TS2339: Property 'filterTransactions' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(88,39): error TS2339: Property 'filterTransactions' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(104,37): error TS2339: Property 'sortTransactions' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(114,37): error TS2339: Property 'sortTransactions' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(127,37): error TS2339: Property 'sortTransactions' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(140,37): error TS2339: Property 'sortTransactions' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(155,37): error TS2339: Property 'calculateTransactionTotals' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(166,37): error TS2339: Property 'calculateTransactionTotals' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(182,37): error TS2339: Property 'calculateTransactionTotals' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(194,38): error TS2551: Property 'groupTransactionsByCategory' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'. Did you mean 'getTransactionsByCategory'?
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(210,38): error TS2551: Property 'groupTransactionsByCategory' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'. Did you mean 'getTransactionsByCategory'?
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(221,40): error TS2339: Property 'formatTransactionAmount' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(229,40): error TS2339: Property 'formatTransactionAmount' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(237,40): error TS2339: Property 'formatTransactionAmount' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(245,40): error TS2339: Property 'formatTransactionAmount' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(265,41): error TS2339: Property 'validateTransaction' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(278,41): error TS2339: Property 'validateTransaction' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(294,41): error TS2339: Property 'validateTransaction' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(309,41): error TS2339: Property 'validateTransaction' does not exist on type '{ getTransactionById: (id: any) => any; getTransactionsByEnvelope: (envId: any) => any[]; getTransactionsByCategory: (cat: any) => any[]; availableCategories: any[]; getThisMonth: () => { start: Date; end: Date; }; getLastMonth: () => { ...; }; getLast30Days: () => { ...; }; }'.
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(67,45): error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'TransactionBase'.
  Type 'Record<string, unknown>' is missing the following properties from type 'TransactionBase': description, amount, date
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(168,57): error TS2345: Argument of type 'TransactionBase' is not assignable to parameter of type 'TransactionBase & { fromAccount: string; toAccount: string; fromEnvelopeId?: string; toEnvelopeId?: string; }'.
  Type 'TransactionBase' is missing the following properties from type '{ fromAccount: string; toAccount: string; fromEnvelopeId?: string; toEnvelopeId?: string; }': fromAccount, toAccount
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(218,94): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'CategoryRule[]'.
  Type '{}' is missing the following properties from type 'CategoryRule': keywords, category
src/hooks/transactions/useTransactionFileUpload.ts(57,48): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'ParsedRow[]'.
  Property '_index' is missing in type '{}' but required in type 'ParsedRow'.
src/hooks/transactions/useTransactionLedger.ts(101,5): error TS2554: Expected 4 arguments, but got 5.
src/hooks/transactions/useTransactionMutations.ts(102,9): error TS2353: Object literal may only specify known properties, and 'reconciledAt' does not exist in type 'Transaction'.
src/hooks/transactions/useTransactionOperations.ts(37,5): error TS2345: Argument of type '{ mutationKey: string[]; mutationFn: (transactionData: unknown) => Promise<string>; onSuccess: (data: { id: string; }) => void; onError: (error: Error) => void; }' is not assignable to parameter of type 'UseMutationOptions<string, Error, unknown, unknown>'.
  Types of property 'onSuccess' are incompatible.
    Type '(data: { id: string; }) => void' is not assignable to type '(data: string, variables: unknown, onMutateResult: unknown, context: MutationFunctionContext) => unknown'.
      Types of parameters 'data' and 'data' are incompatible.
        Type 'string' is not assignable to type '{ id: string; }'.
src/hooks/transactions/useTransactionOperations.ts(48,45): error TS2345: Argument of type '{ mutationKey: string[]; mutationFn: (transferData: unknown) => Promise<{ outgoing: string; incoming: string; transferId: unknown; }>; onSuccess: (data: { transferId: string; outgoing: { amount: number; }; }) => void; onError: (error: Error) => void; }' is not assignable to parameter of type 'UseMutationOptions<{ outgoing: string; incoming: string; transferId: unknown; }, Error, unknown, unknown>'.
  Types of property 'onSuccess' are incompatible.
    Type '(data: { transferId: string; outgoing: { amount: number; }; }) => void' is not assignable to type '(data: { outgoing: string; incoming: string; transferId: unknown; }, variables: unknown, onMutateResult: unknown, context: MutationFunctionContext) => unknown'.
      Types of parameters 'data' and 'data' are incompatible.
        Type '{ outgoing: string; incoming: string; transferId: unknown; }' is not assignable to type '{ transferId: string; outgoing: { amount: number; }; }'.
          Types of property 'transferId' are incompatible.
            Type 'unknown' is not assignable to type 'string'.
src/hooks/transactions/useTransactionOperations.ts(63,70): error TS2353: Object literal may only specify known properties, and 'updates' does not exist in type '{ id: string; }'.
src/hooks/transactions/useTransactionOperations.ts(106,9): error TS2353: Object literal may only specify known properties, and 'transactions' does not exist in type '{ operation: string; }'.
src/hooks/transactions/useTransactionsV2.ts(58,33): error TS2339: Property 'updateTransactions' does not exist on type 'unknown'.
src/hooks/transactions/useTransactionsV2.ts(79,5): error TS2322: Type 'unknown[]' is not assignable to type '{ pattern: string; category: string; envelopeId?: string | number; }[]'.
  Type '{}' is missing the following properties from type '{ pattern: string; category: string; envelopeId?: string | number; }': pattern, category
src/services/__tests__/integration/syncIntegration.test.ts(138,56): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'CryptoKey'.
  Type '{}' is missing the following properties from type 'CryptoKey': algorithm, extractable, type, usages
src/services/__tests__/integration/syncIntegration.test.ts(139,55): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/services/__tests__/integration/syncIntegration.test.ts(547,13): error TS2322: Type 'string' is not assignable to type 'boolean'.
src/services/__tests__/types/firebaseTypes.test.ts(234,55): error TS2554: Expected 1 arguments, but got 0.
src/services/authService.ts(98,11): error TS6133: '_decryptedData' is declared but its value is never read.
src/services/bugReport/__tests__/index.test.ts(74,47): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: ScreenshotOptions) => Promise<string>'.
src/services/bugReport/__tests__/index.test.ts(75,47): error TS2339: Property 'mockReturnValue' does not exist on type '(dataUrl: string) => ScreenshotInfo'.
src/services/bugReport/__tests__/index.test.ts(81,52): error TS2339: Property 'mockImplementation' does not exist on type '(dataUrl: string) => Promise<string>'.
src/services/bugReport/__tests__/index.test.ts(83,47): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<SystemInfo>'.
src/services/bugReport/__tests__/index.test.ts(139,56): error TS2339: Property 'mockReturnValue' does not exist on type '() => PageContext'.
src/services/bugReport/__tests__/index.test.ts(180,50): error TS2339: Property 'mockReturnValue' does not exist on type '(reportData: BugReportData) => ValidationResult'.
src/services/bugReport/__tests__/index.test.ts(186,51): error TS2339: Property 'mockResolvedValue' does not exist on type '(reportData: BugReportData, providers?: ProviderConfig[]) => Promise<FallbackSubmissionResult>'.
src/services/bugReport/__tests__/index.test.ts(228,52): error TS2339: Property 'mockReturnValue' does not exist on type '(reportData: BugReportData) => ValidationResult'.
src/services/bugReport/__tests__/index.test.ts(244,53): error TS2339: Property 'mockRejectedValue' does not exist on type '(reportData: BugReportData, providers?: ProviderConfig[]) => Promise<FallbackSubmissionResult>'.
src/services/bugReport/__tests__/index.test.ts(272,49): error TS2339: Property 'mockRejectedValue' does not exist on type '() => Promise<SystemInfo>'.
src/services/bugReport/__tests__/index.test.ts(273,53): error TS2339: Property 'mockReturnValue' does not exist on type '() => SystemInfo'.
src/services/bugReport/__tests__/index.test.ts(324,55): error TS2339: Property 'mockReturnValue' does not exist on type '() => PageContext'.
src/services/bugReport/__tests__/index.test.ts(371,49): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: ScreenshotOptions) => Promise<string>'.
src/services/bugReport/__tests__/index.test.ts(372,49): error TS2339: Property 'mockReturnValue' does not exist on type '(dataUrl: string) => ScreenshotInfo'.
src/services/bugReport/__tests__/index.test.ts(382,49): error TS2339: Property 'mockRejectedValue' does not exist on type '(options?: ScreenshotOptions) => Promise<string>'.
src/services/bugReport/__tests__/index.test.ts(393,49): error TS2339: Property 'mockReturnValue' does not exist on type '(dataUrl: string) => ScreenshotInfo'.
src/services/bugReport/__tests__/index.test.ts(395,53): error TS2339: Property 'mockResolvedValue' does not exist on type '(reportData: BugReportData, providers?: ProviderConfig[]) => Promise<FallbackSubmissionResult>'.
src/services/bugReport/__tests__/index.test.ts(403,80): error TS2345: Argument of type '{ screenshot: string; }' is not assignable to parameter of type 'BugReportData'.
  Property 'title' is missing in type '{ screenshot: string; }' but required in type 'BugReportData'.
src/services/bugReport/__tests__/index.test.ts(413,49): error TS2339: Property 'mockReturnValue' does not exist on type '(dataUrl: string) => ScreenshotInfo'.
src/services/bugReport/__tests__/index.test.ts(415,65): error TS2345: Argument of type '{ screenshot: string; }' is not assignable to parameter of type 'BugReportData'.
  Property 'title' is missing in type '{ screenshot: string; }' but required in type 'BugReportData'.
src/services/bugReport/__tests__/index.test.ts(423,53): error TS2339: Property 'mockResolvedValue' does not exist on type '(reportData: BugReportData, providers?: ProviderConfig[]) => Promise<FallbackSubmissionResult>'.
src/services/bugReport/__tests__/index.test.ts(497,49): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: ScreenshotOptions) => Promise<string>'.
src/services/bugReport/__tests__/index.test.ts(498,49): error TS2339: Property 'mockReturnValue' does not exist on type '(dataUrl: string) => ScreenshotInfo'.
src/services/bugReport/__tests__/screenshotService.test.ts(123,62): error TS2345: Argument of type '(tagName: string) => {}' is not assignable to parameter of type '(tagName: string, options?: ElementCreationOptions) => HTMLElement'.
  Type '{}' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 314 more.
src/services/bugReport/__tests__/screenshotService.test.ts(129,7): error TS2419: Types of construct signatures are incompatible.
  Type 'new () => Image' is not assignable to type 'new (width?: number, height?: number) => HTMLImageElement'.
    Type 'Image' is missing the following properties from type 'HTMLImageElement': align, alt, border, complete, and 341 more.
src/services/bugReport/__tests__/screenshotService.test.ts(132,18): error TS2339: Property 'width' does not exist on type 'Image'.
src/services/bugReport/__tests__/screenshotService.test.ts(133,18): error TS2339: Property 'height' does not exist on type 'Image'.
src/services/bugReport/__tests__/screenshotService.test.ts(134,22): error TS2339: Property 'onload' does not exist on type 'Image'.
src/services/bugReport/__tests__/screenshotService.test.ts(134,35): error TS2339: Property 'onload' does not exist on type 'Image'.
src/services/bugReport/__tests__/screenshotService.test.ts(164,7): error TS2419: Types of construct signatures are incompatible.
  Type 'new () => Image' is not assignable to type 'new (width?: number, height?: number) => HTMLImageElement'.
    Type 'Image' is missing the following properties from type 'HTMLImageElement': align, alt, border, complete, and 341 more.
src/services/bugReport/__tests__/screenshotService.test.ts(167,22): error TS2339: Property 'onerror' does not exist on type 'Image'.
src/services/bugReport/__tests__/screenshotService.test.ts(167,36): error TS2339: Property 'onerror' does not exist on type 'Image'.
src/services/bugReport/__tests__/screenshotService.test.ts(183,72): error TS2345: Argument of type '{ sizeKB: number; }' is not assignable to parameter of type 'ScreenshotInfo'.
  Type '{ sizeKB: number; }' is missing the following properties from type 'ScreenshotInfo': size, format, timestamp
src/services/bugReport/__tests__/screenshotService.test.ts(194,72): error TS2345: Argument of type '{ sizeKB: number; }' is not assignable to parameter of type 'ScreenshotInfo'.
  Type '{ sizeKB: number; }' is missing the following properties from type 'ScreenshotInfo': size, format, timestamp
src/services/bugReport/__tests__/screenshotService.test.ts(213,72): error TS2345: Argument of type '{ sizeKB: number; }' is not assignable to parameter of type 'ScreenshotInfo'.
  Type '{ sizeKB: number; }' is missing the following properties from type 'ScreenshotInfo': size, format, timestamp
src/services/bugReport/__tests__/screenshotService.test.ts(232,72): error TS2345: Argument of type '{ sizeKB: number; }' is not assignable to parameter of type 'ScreenshotInfo'.
  Type '{ sizeKB: number; }' is missing the following properties from type 'ScreenshotInfo': size, format, timestamp
src/services/bugReport/__tests__/screenshotService.test.ts(264,62): error TS2345: Argument of type '(tagName: string) => {}' is not assignable to parameter of type '(tagName: string, options?: ElementCreationOptions) => HTMLElement'.
  Type '{}' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 314 more.
src/services/bugReport/apiService.ts(161,5): error TS2741: Property 'success' is missing in type '{ overallSuccess: boolean; successfulProvider: any; attempts: number; results: any[]; summary: { successful: number; failed: number; }; }' but required in type 'FallbackSubmissionResult'.
src/services/bugReport/apiService.ts(231,51): error TS2345: Argument of type 'import("violet-vault/src/services/bugReport/apiService").BugReportData' is not assignable to parameter of type 'BugReportData'.
  Types of property 'steps' are incompatible.
    Type 'string[]' is not assignable to type 'string'.
src/services/bugReport/index.ts(201,48): error TS2304: Cannot find name 'SystemInfo'.
src/services/bugReport/pageDetectionService.ts(255,32): error TS2339: Property 'offsetParent' does not exist on type 'Element'.
src/services/bugReport/performanceInfoService.ts(187,11): error TS2322: Type 'string | number' is not assignable to type 'number'.
  Type 'string' is not assignable to type 'number'.
src/services/bugReport/reportSubmissionService.ts(175,30): error TS6133: 'reportData' is declared but its value is never read.
src/services/bugReport/systemInfoService.ts(72,65): error TS2345: Argument of type 'SystemInfo' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'SystemInfo'.
src/services/chunkedSyncService.ts(300,9): error TS2416: Property 'saveToCloud' in type 'ChunkedSyncService' is not assignable to the same property in base type 'IChunkedSyncService'.
  Type '(data: unknown, currentUser: { readonly uid: string; readonly userName: string; }) => Promise<{ success: boolean; }>' is not assignable to type '(data: unknown, currentUser: { readonly uid: string; readonly userName: string; }) => Promise<boolean>'.
    Type 'Promise<{ success: boolean; }>' is not assignable to type 'Promise<boolean>'.
      Type '{ success: boolean; }' is not assignable to type 'boolean'.
src/services/keys/__tests__/keyManagementService.test.ts(233,132): error TS2694: Namespace '"violet-vault/src/services/keys/keyManagementService"' has no exported member 'KeyFileData'.
src/services/keys/__tests__/keyManagementService.test.ts(251,21): error TS2339: Property 'key' does not exist on type '{ encryptionKey: any; salt: any; currentUser: unknown; budgetId: unknown; timestamp: unknown; }'.
src/services/keys/__tests__/keyManagementService.test.ts(265,21): error TS2339: Property 'key' does not exist on type '{ encryptionKey: any; salt: any; currentUser: unknown; budgetId: unknown; timestamp: unknown; }'.
src/services/keys/keyManagementService.ts(39,64): error TS2352: Conversion of type 'CryptoKey | Uint8Array<ArrayBufferLike>' to type 'ArrayBuffer' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Uint8Array<ArrayBufferLike>' is not comparable to type 'ArrayBuffer'.
    The types of 'slice(...)[Symbol.toStringTag]' are incompatible between these types.
      Type '"Uint8Array"' is not comparable to type '"ArrayBuffer"'.
src/services/keys/keyManagementService.ts(329,11): error TS2554: Expected 1 arguments, but got 2.
src/services/transactions/__tests__/transactionSplitterService.test.ts(2,32): error TS6133: 'vi' is declared but its value is never read.
src/services/typedChunkedSyncService.ts(150,19): error TS2352: Conversion of type 'ChunkedSyncStats' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'ChunkedSyncStats'.
src/services/typedFirebaseSyncService.ts(63,46): error TS2345: Argument of type 'string' is not assignable to parameter of type 'CryptoKey'.
src/stores/ui/fabStore.ts(163,60): error TS2345: Argument of type 'FABAction' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'FABAction'.
src/stores/ui/onboardingStore.ts(31,3): error TS2345: Argument of type 'StateCreator<OnboardingState, [], [["zustand/persist", OnboardingState]]>' is not assignable to parameter of type 'StateCreator<OnboardingState, [], []>'.
  Type 'StateCreator<OnboardingState, [], [["zustand/persist", OnboardingState]]>' is not assignable to type '{ $$storeMutators?: []; }'.
    Types of property '$$storeMutators' are incompatible.
      Type '[["zustand/persist", OnboardingState]]' is not assignable to type '[]'.
        Source has 1 element(s) but target allows only 0.
src/stores/ui/uiStore.ts(277,81): error TS2554: Expected 1 arguments, but got 2.
src/test/queryTestUtils.tsx(28,5): error TS2353: Object literal may only specify known properties, and 'logger' does not exist in type 'QueryClientConfig'.
src/utils/accounts/__tests__/accountValidation.test.ts(210,13): error TS6133: 'expectedDays' is declared but its value is never read.
src/utils/bills/index.ts(1,10): error TS2305: Module '"./recurringBillUtils.ts"' has no exported member 'default'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(64,43): error TS2345: Argument of type '{ name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is missing the following properties from type 'EnvelopeFormData': autoAllocate, icon
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(72,43): error TS2345: Argument of type '{ name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is missing the following properties from type 'EnvelopeFormData': autoAllocate, icon
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(80,43): error TS2345: Argument of type '{ name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is missing the following properties from type 'EnvelopeFormData': autoAllocate, icon
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(89,43): error TS2345: Argument of type '{ name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is missing the following properties from type 'EnvelopeFormData': autoAllocate, icon
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(98,43): error TS2345: Argument of type '{ name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is missing the following properties from type 'EnvelopeFormData': autoAllocate, icon
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(106,43): error TS2345: Argument of type '{ monthlyAmount: string; name: string; category: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ monthlyAmount: string; name: string; category: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is missing the following properties from type 'EnvelopeFormData': autoAllocate, icon
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(114,43): error TS2345: Argument of type '{ monthlyAmount: string; name: string; category: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ monthlyAmount: string; name: string; category: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is missing the following properties from type 'EnvelopeFormData': autoAllocate, icon
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(126,43): error TS2345: Argument of type '{ envelopeType: "sinking_fund"; targetAmount: string; name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ envelopeType: "sinking_fund"; targetAmount: string; name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; }' is missing the following properties from type 'EnvelopeFormData': autoAllocate, icon
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(138,43): error TS2345: Argument of type '{ envelopeType: "sinking_fund"; targetAmount: string; name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ envelopeType: "sinking_fund"; targetAmount: string; name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; }' is missing the following properties from type 'EnvelopeFormData': autoAllocate, icon
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(146,43): error TS2345: Argument of type '{ category: string; name: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ category: string; name: string; monthlyAmount: string; currentBalance: string; priority: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is missing the following properties from type 'EnvelopeFormData': autoAllocate, icon
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(154,43): error TS2345: Argument of type '{ priority: string; name: string; category: string; monthlyAmount: string; currentBalance: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ priority: string; name: string; category: string; monthlyAmount: string; currentBalance: string; color: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is missing the following properties from type 'EnvelopeFormData': autoAllocate, icon
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(162,43): error TS2345: Argument of type '{ color: string; name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ color: string; name: string; category: string; monthlyAmount: string; currentBalance: string; priority: string; frequency: string; description: string; envelopeType: "variable"; targetAmount: string; }' is missing the following properties from type 'EnvelopeFormData': autoAllocate, icon
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(172,47): error TS2345: Argument of type '{ monthlyAmount: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ monthlyAmount: string; }' is missing the following properties from type 'EnvelopeFormData': name, currentBalance, category, color, and 5 more.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(180,47): error TS2345: Argument of type '{ monthlyAmount: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ monthlyAmount: string; }' is missing the following properties from type 'EnvelopeFormData': name, currentBalance, category, color, and 5 more.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(188,47): error TS2345: Argument of type '{ monthlyAmount: string; }' is not assignable to parameter of type 'EnvelopeFormData'.
  Type '{ monthlyAmount: string; }' is missing the following properties from type 'EnvelopeFormData': name, currentBalance, category, color, and 5 more.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(262,46): error TS2345: Argument of type '{ name: string; monthlyAmount: number; currentBalance: number; category: string; color: string; frequency: string; description: string; priority: string; autoAllocate: boolean; icon: string; envelopeType: "variable"; targetAmount: number; }' is not assignable to parameter of type 'Envelope'.
  Property 'id' is missing in type '{ name: string; monthlyAmount: number; currentBalance: number; category: string; color: string; frequency: string; description: string; priority: string; autoAllocate: boolean; icon: string; envelopeType: "variable"; targetAmount: number; }' but required in type 'Envelope'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(295,48): error TS2345: Argument of type '{ envelopeType: "sinking_fund"; currentBalance: number; targetAmount: number; monthlyAmount: number; }' is not assignable to parameter of type 'Envelope'.
  Type '{ envelopeType: "sinking_fund"; currentBalance: number; targetAmount: number; monthlyAmount: number; }' is missing the following properties from type 'Envelope': id, name
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(309,48): error TS2345: Argument of type '{ envelopeType: "variable"; }' is not assignable to parameter of type 'Envelope'.
  Type '{ envelopeType: "variable"; }' is missing the following properties from type 'Envelope': id, name
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(320,48): error TS2345: Argument of type '{ envelopeType: "sinking_fund"; currentBalance: number; targetAmount: number; }' is not assignable to parameter of type 'Envelope'.
  Type '{ envelopeType: "sinking_fund"; currentBalance: number; targetAmount: number; }' is missing the following properties from type 'Envelope': id, name
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(351,70): error TS2345: Argument of type '{ envelopeType: "variable"; }' is not assignable to parameter of type 'Envelope'.
  Type '{ envelopeType: "variable"; }' is missing the following properties from type 'Envelope': id, name
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(363,74): error TS2345: Argument of type '{ envelopeType: "sinking_fund"; targetAmount: number; }' is not assignable to parameter of type 'Envelope'.
  Type '{ envelopeType: "sinking_fund"; targetAmount: number; }' is missing the following properties from type 'Envelope': id, name
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(373,78): error TS2345: Argument of type '{ envelopeType: "variable"; }' is not assignable to parameter of type 'Envelope'.
  Type '{ envelopeType: "variable"; }' is missing the following properties from type 'Envelope': id, name
src/utils/budgeting/__tests__/paycheckUtils.test.ts(242,9): error TS2739: Type '{ envelopeId: string; amount: number; }' is missing the following properties from type '{ envelopeId: string; envelopeName: string; amount: number; monthlyAmount: number; envelopeType: string; priority: string; }': envelopeName, monthlyAmount, envelopeType, priority
src/utils/budgeting/__tests__/paycheckUtils.test.ts(243,9): error TS2739: Type '{ envelopeId: string; amount: number; }' is missing the following properties from type '{ envelopeId: string; envelopeName: string; amount: number; monthlyAmount: number; envelopeType: string; priority: string; }': envelopeName, monthlyAmount, envelopeType, priority
src/utils/budgeting/autofunding/simulation.ts(328,22): error TS6133: '_unassignedCash' is declared but its value is never read.
src/utils/budgeting/billEnvelopeCalculations.ts(9,6): error TS2300: Duplicate identifier 'Envelope'.
src/utils/budgeting/billEnvelopeCalculations.ts(18,6): error TS2300: Duplicate identifier 'Bill'.
src/utils/budgeting/billEnvelopeCalculations.ts(68,11): error TS2300: Duplicate identifier 'Bill'.
src/utils/budgeting/billEnvelopeCalculations.ts(78,11): error TS2300: Duplicate identifier 'Envelope'.
src/utils/budgeting/envelopeFormUtils.ts(243,35): error TS2345: Argument of type 'ZodSafeParseResult<{ id: string; name: string; category: string; archived: boolean; lastModified: number; createdAt?: number; currentBalance?: number; targetAmount?: number; description?: string; }>' is not assignable to parameter of type 'ZodResult'.
  Type 'ZodSafeParseError<{ id: string; name: string; category: string; archived: boolean; lastModified: number; createdAt?: number; currentBalance?: number; targetAmount?: number; description?: string; }>' is not assignable to type 'ZodResult'.
    Types of property 'error' are incompatible.
      Property 'errors' is missing in type 'ZodError<{ id: string; name: string; category: string; archived: boolean; lastModified: number; createdAt?: number; currentBalance?: number; targetAmount?: number; description?: string; }>' but required in type '{ errors: { path: (string | number)[]; message: string; }[]; }'.
src/utils/budgeting/envelopeIntegrityChecker.ts(46,26): error TS2352: Conversion of type 'Envelope[]' to type 'EnvelopeWithOptionalFields[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Envelope' is not comparable to type 'EnvelopeWithOptionalFields'.
    Types of property 'createdAt' are incompatible.
      Type 'number' is not comparable to type 'string'.
src/utils/budgeting/envelopeIntegrityChecker.ts(229,26): error TS2352: Conversion of type 'Envelope[]' to type 'EnvelopeWithOptionalFields[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Envelope' is not comparable to type 'EnvelopeWithOptionalFields'.
    Types of property 'createdAt' are incompatible.
      Type 'number' is not comparable to type 'string'.
src/utils/budgeting/paycheckProcessing.ts(104,38): error TS2345: Argument of type '{ id: string; date: Date; amount: any; mode: any; unassignedCashBefore: any; unassignedCashAfter: any; actualBalanceBefore: any; actualBalanceAfter: any; envelopeAllocations: any; notes: any; }' is not assignable to parameter of type 'PaycheckHistory'.
  Type '{ id: string; date: Date; amount: any; mode: any; unassignedCashBefore: any; unassignedCashAfter: any; actualBalanceBefore: any; actualBalanceAfter: any; envelopeAllocations: any; notes: any; }' is missing the following properties from type 'PaycheckHistory': source, lastModified
src/utils/common/billDiscovery.ts(126,15): error TS2339: Property 'length' does not exist on type 'unknown'.
src/utils/common/budgetHistoryTracker.ts(347,38): error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'BudgetTag'.
  Type 'Record<string, unknown>' is missing the following properties from type 'BudgetTag': name, commitHash, tagType, author, created
src/utils/common/fixAutoAllocateUndefined.ts(21,26): error TS2352: Conversion of type 'Envelope[]' to type 'EnvelopeWithAutoAllocate[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Envelope' is not comparable to type 'EnvelopeWithAutoAllocate'.
    Index signature for type 'string' is missing in type 'Envelope'.
src/utils/common/fixAutoAllocateUndefined.ts(36,39): error TS2345: Argument of type 'string | number' is not assignable to parameter of type 'string | Envelope'.
  Type 'number' is not assignable to type 'string | Envelope'.
src/utils/common/fixAutoAllocateUndefined.ts(46,26): error TS2352: Conversion of type 'Envelope[]' to type 'EnvelopeWithAutoAllocate[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Envelope' is not comparable to type 'EnvelopeWithAutoAllocate'.
    Index signature for type 'string' is missing in type 'Envelope'.
src/utils/common/highlight.ts(132,10): error TS6133: '_setupConsoleCapture' is declared but its value is never read.
src/utils/common/transactionArchiving.ts(440,39): error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'Transaction'.
  Type 'Record<string, unknown>' is missing the following properties from type 'Transaction': id, date, amount, envelopeId, and 3 more.
src/utils/common/version.ts(177,7): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/utils/dataManagement/__tests__/backupUtils.test.ts(2,1): error TS6192: All imports in import declaration are unused.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(31,23): error TS2339: Property 'syncMetadata' does not exist on type 'VioletVaultDB'.
src/utils/dataManagement/dexieUtils.ts(70,33): error TS2345: Argument of type '{ id: string; unassignedCash: any; biweeklyAllocation: any; actualBalance: any; isActualBalanceManual: any; supplementalAccounts: any; lastUpdated: string; }' is not assignable to parameter of type 'BudgetRecord'.
  Property 'lastModified' is missing in type '{ id: string; unassignedCash: any; biweeklyAllocation: any; actualBalance: any; isActualBalanceManual: any; supplementalAccounts: any; lastUpdated: string; }' but required in type 'BudgetRecord'.
src/utils/dataManagement/firebaseUtils.ts(2,1): error TS6133: 'budgetDb' is declared but its value is never read.
src/utils/debts/debtCalculations.ts(89,5): error TS2739: Type '{ monthsToPayoff: any; totalInterest: number; payoffDate: string; }' is missing the following properties from type 'PayoffProjection': totalMonths, monthlyBreakdown
src/utils/notifications/permissionUtils.ts(169,69): error TS2345: Argument of type 'BrowserSupportResult' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'BrowserSupportResult'.
src/utils/pwa/backgroundSync.ts(86,32): error TS2365: Operator '+' cannot be applied to types 'unknown' and '1'.
src/utils/pwa/patchNotesManager.ts(297,4): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/pwa/serviceWorkerDiagnostics.ts(380,4): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(262,13): error TS2322: Type 'string' is not assignable to type 'Date'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(263,13): error TS2322: Type 'string' is not assignable to type 'Date'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(496,11): error TS2322: Type 'string' is not assignable to type 'Date'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(497,11): error TS2322: Type 'string' is not assignable to type 'Date'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(621,13): error TS2322: Type 'string' is not assignable to type 'Date'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(622,13): error TS2322: Type 'string' is not assignable to type 'Date'.
src/utils/query/__tests__/prefetchHelpers.test.ts(127,108): error TS2345: Argument of type '{ start: string; end: string; }' is not assignable to parameter of type 'DateRange'.
  Types of property 'start' are incompatible.
    Type 'string' is not assignable to type 'Date'.
src/utils/query/__tests__/prefetchHelpers.test.ts(164,108): error TS2345: Argument of type '{ start: string; end: string; }' is not assignable to parameter of type 'DateRange'.
  Types of property 'start' are incompatible.
    Type 'string' is not assignable to type 'Date'.
src/utils/query/__tests__/queryKeys.test.ts(197,42): error TS2339: Property 'unknown' does not exist on type '{ budget: string[]; budgetData: () => string[]; budgetSummary: () => string[]; budgetMetadata: string[]; unassignedCash: () => string[]; actualBalance: () => string[]; envelopes: string[]; envelopesList: (filters?: {}) => {}[]; ... 48 more ...; syncActivity: () => string[]; }'.
src/utils/receipts/receiptHelpers.tsx(201,43): error TS6133: 'field' is declared but its value is never read.
src/utils/security/encryption.ts(154,17): error TS2339: Property 'deviceMemory' does not exist on type 'Navigator'.
src/utils/security/errorViewer.ts(26,9): error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'string'.
src/utils/security/optimizedSerialization.ts(67,38): error TS2769: No overload matches this call.
  Overload 1 of 2, '(data: Data, options: InflateFunctionOptions & { to: "string"; }): string', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'Data'.
  Overload 2 of 2, '(data: Data, options?: InflateFunctionOptions): Uint8Array<ArrayBuffer>', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'Data'.
src/utils/stores/storeRegistry.ts(36,28): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/sync/__tests__/dataIntegrity.test.ts(1,32): error TS6133: 'beforeEach' is declared but its value is never read.
src/utils/sync/corruptionRecoveryHelper.ts(78,43): error TS2339: Property 'samplesFound' does not exist on type '{ databaseOpen: boolean; samplesFound: { envelopes: boolean; transactions: boolean; bills: boolean; }; envelopes: number; transactions: number; bills: number; savingsGoals: number; paychecks: number; cache: number; lastOptimized: number; } | { ...; }'.
  Property 'samplesFound' does not exist on type '{ databaseOpen: boolean; envelopes: number; transactions: number; bills: number; savingsGoals: number; paychecks: number; cache: number; lastOptimized: number; error: string; }'.
src/utils/sync/dataDetectionHelper.ts(27,17): error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'string'.
src/utils/sync/syncEdgeCaseTester.ts(424,10): error TS2551: Property 'syncEdgeCaseTester' does not exist on type 'Window & typeof globalThis'. Did you mean 'runSyncEdgeCaseTests'?
src/utils/sync/syncFlowValidator.ts(345,4): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Window & { validateAllSyncFlows?: () => Promise<ValidationResult[]>; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Window & typeof globalThis' is not comparable to type '{ validateAllSyncFlows?: () => Promise<ValidationResult[]>; }'.
    The types returned by 'validateAllSyncFlows()' are incompatible between these types.
      Type 'void' is not comparable to type 'Promise<ValidationResult[]>'.
src/utils/sync/syncHealthChecker.ts(317,4): error TS2352: Conversion of type 'Window & typeof globalThis' to type '{ runSyncHealthCheck?: () => Promise<unknown>; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  The types returned by 'runSyncHealthCheck()' are incompatible between these types.
    Type 'void' is not comparable to type 'Promise<unknown>'.
src/utils/sync/validation/__tests__/checksumUtils.test.ts(133,12): error TS2339: Property 'self' does not exist on type '{ name: string; }'.
src/utils/sync/validation/checksumUtils.ts(26,48): error TS6133: 'key' is declared but its value is never read.
src/utils/transactions/__tests__/operations.test.ts(98,53): error TS2345: Argument of type '{ description: string; amount: string; date: string; category: string; account: string; }' is not assignable to parameter of type 'TransactionBase'.
  Types of property 'amount' are incompatible.
    Type 'string' is not assignable to type 'number'.
src/utils/transactions/__tests__/operations.test.ts(109,53): error TS2345: Argument of type '{ description: string; amount: string; date: string; category: string; account: string; }' is not assignable to parameter of type 'TransactionBase'.
  Types of property 'amount' are incompatible.
    Type 'string' is not assignable to type 'number'.
src/utils/transactions/__tests__/operations.test.ts(116,53): error TS2345: Argument of type '{ id: string; description: string; amount: string; date: string; category: string; account: string; }' is not assignable to parameter of type 'TransactionBase'.
  Types of property 'amount' are incompatible.
    Type 'string' is not assignable to type 'number'.
src/utils/transactions/__tests__/operations.test.ts(122,53): error TS2345: Argument of type '{ description: string; amount: string; date: string; category: string; account: string; }' is not assignable to parameter of type 'TransactionBase'.
  Types of property 'amount' are incompatible.
    Type 'string' is not assignable to type 'number'.
src/utils/transactions/__tests__/operations.test.ts(125,23): error TS2769: No overload matches this call.
  Overload 1 of 4, '(value: string | number | Date): Date', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'string | number | Date'.
  Overload 2 of 4, '(value: string | number): Date', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'string | number'.
src/utils/transactions/__tests__/operations.test.ts(147,39): error TS2345: Argument of type '{ amount: number; type: string; }' is not assignable to parameter of type 'TransactionBase'.
  Type '{ amount: number; type: string; }' is missing the following properties from type 'TransactionBase': description, date
src/utils/transactions/__tests__/operations.test.ts(153,39): error TS2345: Argument of type '{ amount: number; }' is not assignable to parameter of type 'TransactionBase'.
  Type '{ amount: number; }' is missing the following properties from type 'TransactionBase': description, date
src/utils/transactions/__tests__/operations.test.ts(159,39): error TS2345: Argument of type '{ amount: number; }' is not assignable to parameter of type 'TransactionBase'.
  Type '{ amount: number; }' is missing the following properties from type 'TransactionBase': description, date
src/utils/transactions/__tests__/operations.test.ts(165,39): error TS2345: Argument of type '{ amount: number; metadata: { isTransfer: boolean; }; }' is not assignable to parameter of type 'TransactionBase'.
  Type '{ amount: number; metadata: { isTransfer: boolean; }; }' is missing the following properties from type 'TransactionBase': description, date
src/utils/transactions/__tests__/operations.test.ts(238,49): error TS2345: Argument of type '{ description: string; amount: number; }' is not assignable to parameter of type 'TransactionBase'.
  Property 'date' is missing in type '{ description: string; amount: number; }' but required in type 'TransactionBase'.
src/utils/transactions/__tests__/operations.test.ts(248,49): error TS2345: Argument of type '{ description: string; amount: number; }' is not assignable to parameter of type 'TransactionBase'.
  Property 'date' is missing in type '{ description: string; amount: number; }' but required in type 'TransactionBase'.
src/utils/transactions/__tests__/operations.test.ts(262,49): error TS2345: Argument of type '{ description: string; amount: number; category: string; }' is not assignable to parameter of type 'TransactionBase'.
  Property 'date' is missing in type '{ description: string; amount: number; category: string; }' but required in type 'TransactionBase'.
src/utils/transactions/__tests__/operations.test.ts(270,49): error TS2345: Argument of type '{ description: string; amount: number; }' is not assignable to parameter of type 'TransactionBase'.
  Property 'date' is missing in type '{ description: string; amount: number; }' but required in type 'TransactionBase'.
src/utils/transactions/__tests__/operations.test.ts(278,49): error TS2345: Argument of type '{ description: string; amount: number; }' is not assignable to parameter of type 'TransactionBase'.
  Property 'date' is missing in type '{ description: string; amount: number; }' but required in type 'TransactionBase'.
src/utils/transactions/__tests__/operations.test.ts(361,51): error TS2345: Argument of type '{ id: string; amount: number; date: string; }[]' is not assignable to parameter of type 'TransactionBase[]'.
  Property 'description' is missing in type '{ id: string; amount: number; date: string; }' but required in type 'TransactionBase'.
src/utils/transactions/__tests__/operations.test.ts(369,51): error TS2345: Argument of type '{ id: string; amount: number; date: string; }[]' is not assignable to parameter of type 'TransactionBase[]'.
  Property 'description' is missing in type '{ id: string; amount: number; date: string; }' but required in type 'TransactionBase'.
src/utils/transactions/__tests__/operations.test.ts(382,51): error TS2345: Argument of type '{ id: string; amount: number; }[]' is not assignable to parameter of type 'TransactionBase[]'.
  Type '{ id: string; amount: number; }' is missing the following properties from type 'TransactionBase': description, date
src/utils/transactions/__tests__/operations.test.ts(401,53): error TS2345: Argument of type '{ id: string; description: string; amount: number; date: string; category: string; account: string; type: string; }' is not assignable to parameter of type 'TransactionBase'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"income" | "expense" | "transfer"'.
src/utils/transactions/__tests__/operations.test.ts(413,53): error TS2345: Argument of type '{ amount: number; id: string; description: string; date: string; category: string; account: string; type: string; }' is not assignable to parameter of type 'TransactionBase'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"income" | "expense" | "transfer"'.
src/utils/transactions/__tests__/operations.test.ts(421,53): error TS2345: Argument of type '{ id: string; description: string; amount: number; date: string; category: string; account: string; type: string; }' is not assignable to parameter of type 'TransactionBase'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"income" | "expense" | "transfer"'.
src/utils/transactions/__tests__/operations.test.ts(432,53): error TS2345: Argument of type '{ category: any; id: string; description: string; amount: number; date: string; account: string; type: string; }' is not assignable to parameter of type 'TransactionBase'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"income" | "expense" | "transfer"'.
src/utils/transactions/__tests__/operations.test.ts(439,53): error TS2345: Argument of type '{ type: string; id: string; description: string; amount: number; date: string; category: string; account: string; }' is not assignable to parameter of type 'TransactionBase'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"income" | "expense" | "transfer"'.
src/utils/validation/transactionValidation.ts(13,3): error TS2322: Type 'unknown' is not assignable to type 'boolean'.
```

