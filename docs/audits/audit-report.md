# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 6 | -4 |
| TypeScript Errors | 2121 | -4 |

*Last updated: 2025-10-28 17:04:32 UTC*

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
- 1 issues in `violet-vault/src/utils/dataManagement/firebaseUtils.ts`
- 1 issues in `violet-vault/src/utils/common/highlight.ts`
- 1 issues in `violet-vault/src/services/bugReport/index.ts`
- 1 issues in `violet-vault/src/services/authService.ts`
- 1 issues in `violet-vault/src/hooks/debts/useDebtModalLogic.ts`
- 1 issues in `violet-vault/src/hooks/debts/helpers/debtManagementHelpers.ts`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 2 | `null` |
| 2 | `@typescript-eslint/no-explicit-any` |
| 1 | `no-undef` |
| 1 | `@typescript-eslint/no-unused-vars` |

### Detailed Lint Report
```
violet-vault/src/hooks/debts/helpers/debtManagementHelpers.ts:455:84 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/debts/useDebtModalLogic.ts:35:53 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/services/authService.ts:97:5 - 1 - Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-unused-vars'). (null)
violet-vault/src/services/bugReport/index.ts:201:48 - 1 - 'SystemInfo' is not defined. (no-undef)
violet-vault/src/utils/common/highlight.ts:131:1 - 1 - Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-unused-vars'). (null)
violet-vault/src/utils/dataManagement/firebaseUtils.ts:2:10 - 1 - 'budgetDb' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
```

## Typecheck Audit

### Files with Most Type Errors
- 175 errors in `src/utils/transactions/__tests__/filtering.test.ts`
- 170 errors in `src/utils/bills/__tests__/billCalculations.test.ts`
- 103 errors in `src/utils/sync/__tests__/syncHealthHelpers.test.ts`
- 95 errors in `src/hooks/dashboard/__tests__/useMainDashboard.test.ts`
- 89 errors in `src/utils/debts/__tests__/debtFormValidation.test.ts`
- 88 errors in `src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts`
- 81 errors in `src/utils/transactions/__tests__/ledgerHelpers.test.ts`
- 72 errors in `src/hooks/debts/__tests__/useDebtForm.test.ts`
- 71 errors in `src/hooks/transactions/__tests__/useTransactionLedger.test.tsx`
- 64 errors in `src/utils/analytics/__tests__/trendHelpers.test.ts`
- 57 errors in `src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts`
- 57 errors in `src/hooks/analytics/__tests__/useTrendAnalysis.test.ts`
- 54 errors in `src/hooks/settings/__tests__/useTransactionArchiving.test.ts`
- 49 errors in `src/hooks/transactions/__tests__/useTransactionFilters.test.ts`
- 49 errors in `src/hooks/common/__tests__/useModalManager.test.ts`
- 48 errors in `src/hooks/settings/__tests__/useSettingsDashboard.test.ts`
- 43 errors in `src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx`
- 43 errors in `src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx`
- 36 errors in `src/components/budgeting/__tests__/EnvelopeSystem.test.tsx`
- 32 errors in `src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts`
- 28 errors in `src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx`
- 26 errors in `src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts`
- 23 errors in `src/services/bugReport/__tests__/index.test.ts`
- 22 errors in `src/utils/transactions/__tests__/operations.test.ts`
- 22 errors in `src/utils/dataManagement/__tests__/dexieUtils.test.ts`
- 22 errors in `src/utils/budgeting/__tests__/envelopeFormUtils.test.ts`
- 22 errors in `src/hooks/transactions/__tests__/useTransactionUtils.test.ts`
- 22 errors in `src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts`
- 21 errors in `src/hooks/analytics/__tests__/useAnalyticsExport.test.ts`
- 15 errors in `src/components/transactions/__tests__/TransactionFilters.test.tsx`
- 14 errors in `src/utils/dataManagement/__tests__/firebaseUtils.test.ts`
- 14 errors in `src/services/bugReport/__tests__/screenshotService.test.ts`
- 14 errors in `src/hooks/analytics/__tests__/useChartsAnalytics.test.ts`
- 12 errors in `src/hooks/budgeting/autofunding/useAutoFunding.ts`
- 11 errors in `src/utils/dataManagement/__tests__/validationUtils.test.ts`
- 11 errors in `src/hooks/debts/useDebtManagement.ts`
- 9 errors in `src/hooks/transactions/__tests__/useTransactionMutations.test.ts`
- 9 errors in `src/hooks/common/__tests__/useImportData.test.ts`
- 9 errors in `src/hooks/bills/useBillManager.ts`
- 8 errors in `src/utils/dataManagement/__tests__/fileUtils.test.ts`
- 7 errors in `src/utils/dataManagement/__tests__/backupUtils.test.ts`
- 7 errors in `src/test/queryTestUtils.tsx`
- 6 errors in `src/utils/query/__tests__/integration/queryIntegration.test.ts`
- 6 errors in `src/hooks/common/__tests__/useResetEncryption.test.ts`
- 6 errors in `src/hooks/common/__tests__/useExportData.test.ts`
- 5 errors in `src/hooks/settings/useTransactionArchiving.ts`
- 5 errors in `src/hooks/savings/useSavingsGoals/savingsMutations.ts`
- 5 errors in `src/hooks/budgeting/autofunding/__tests__/useAutoFundingRules.test.ts`
- 5 errors in `src/hooks/bills/useBills/billMutations.ts`
- 4 errors in `src/hooks/transactions/useTransactionOperations.ts`
- 4 errors in `src/hooks/common/useTransactionArchiving.ts`
- 4 errors in `src/hooks/budgeting/useBudgetData/queryFunctions.ts`
- 4 errors in `src/hooks/analytics/useAnalyticsIntegration.ts`
- 4 errors in `src/components/transactions/TransactionSplitter.tsx`
- 4 errors in `src/components/sharing/__tests__/ShareCodeModal.test.tsx`
- 4 errors in `src/components/sharing/__tests__/JoinBudgetModal.test.tsx`
- 3 errors in `src/utils/common/fixAutoAllocateUndefined.ts`
- 3 errors in `src/services/keys/__tests__/keyManagementService.test.ts`
- 3 errors in `src/services/__tests__/integration/syncIntegration.test.ts`
- 3 errors in `src/hooks/transactions/helpers/transactionOperationsHelpers.ts`
- 3 errors in `src/hooks/transactions/__tests__/useTransactionAnalytics.test.ts`
- 3 errors in `src/hooks/debts/useDebts.ts`
- 3 errors in `src/hooks/budgeting/useUnassignedCashDistribution.ts`
- 3 errors in `src/hooks/auth/mutations/useLoginMutations.ts`
- 2 errors in `src/utils/query/__tests__/prefetchHelpers.test.ts`
- 2 errors in `src/utils/budgeting/envelopeIntegrityChecker.ts`
- 2 errors in `src/utils/budgeting/__tests__/paycheckUtils.test.ts`
- 2 errors in `src/services/keys/keyManagementService.ts`
- 2 errors in `src/services/bugReport/apiService.ts`
- 2 errors in `src/hooks/transactions/useTransactionsV2.ts`
- 2 errors in `src/hooks/common/bug-report/useBugReportSubmission.ts`
- 2 errors in `src/hooks/budgeting/usePaycheckProcessor.ts`
- 2 errors in `src/hooks/budgeting/useBudgetData/utilities.ts`
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
- 1 errors in `src/hooks/bills/useBills/__tests__/billMutations.test.ts`
- 1 errors in `src/hooks/bills/useBillValidation.ts`
- 1 errors in `src/hooks/auth/useSecurityManagerUI.ts`
- 1 errors in `src/hooks/auth/useAuthenticationManager.ts`
- 1 errors in `src/hooks/auth/useAuthCompatibility.ts`
- 1 errors in `src/hooks/auth/queries/usePasswordValidation.ts`
- 1 errors in `src/hooks/auth/mutations/__tests__/useProfileMutations.test.ts`
- 1 errors in `src/hooks/auth/mutations/__tests__/useJoinBudgetMutation.test.ts`
- 1 errors in `src/hooks/auth/__tests__/useUserSetup.test.ts`
- 1 errors in `src/hooks/auth/__tests__/useAuthManager.test.ts`
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
- 1 errors in `src/components/sharing/ShareCodeModal.tsx`
- 1 errors in `src/components/settings/sections/NotificationSettingsSection.tsx`
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
| 1050 | `TS2304` |
| 479 | `TS2582` |
| 166 | `TS2339` |
| 129 | `TS2345` |
| 72 | `TS2322` |
| 41 | `TS2554` |
| 32 | `TS6133` |
| 29 | `TS2551` |
| 18 | `TS2786` |
| 17 | `TS2352` |
| 15 | `TS2353` |
| 14 | `TS2740` |
| 10 | `TS2739` |
| 8 | `TS2559` |
| 7 | `TS2741` |
| 5 | `TS2365` |
| 4 | `TS2769` |
| 4 | `TS2724` |
| 4 | `TS2307` |
| 2 | `TS2614` |
| 2 | `TS2419` |
| 2 | `TS2363` |
| 2 | `TS2305` |
| 1 | `TS6192` |
| 1 | `TS4104` |
| 1 | `TS2698` |
| 1 | `TS2694` |
| 1 | `TS2677` |
| 1 | `TS2613` |
| 1 | `TS2538` |
| 1 | `TS2448` |
| 1 | `TS2416` |

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
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(6,1): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(7,29): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(26,26): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(27,27): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(28,24): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(29,26): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(30,29): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(31,29): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(32,25): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(37,1): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(43,1): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(49,1): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(55,1): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(61,1): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(67,1): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(73,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(76,14): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(79,3): error TS2304: Cannot find name 'beforeEach'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(80,5): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(83,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(84,54): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(85,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(88,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(91,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(92,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(93,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(94,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(95,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(96,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(99,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(100,25): error TS2304: Cannot find name 'vi'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(106,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(109,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(112,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(113,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(116,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(120,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(121,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(122,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(125,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(130,5): error TS2304: Cannot find name 'expect'.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(131,5): error TS2304: Cannot find name 'expect'.
src/components/settings/sections/NotificationSettingsSection.tsx(197,58): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/components/settings/TransactionArchiving.tsx(3,37): error TS2307: Cannot find module '../../hooks/transactions/useTransactionArchiving' or its corresponding type declarations.
src/components/sharing/__tests__/JoinBudgetModal.test.tsx(5,10): error TS2724: '"@/hooks/sharing/useShareCodeValidation"' has no exported member named 'useShareCodeValidationOriginal'. Did you mean 'useShareCodeValidation'?
src/components/sharing/__tests__/JoinBudgetModal.test.tsx(6,10): error TS2724: '"@/hooks/sharing/useBudgetJoining"' has no exported member named 'useBudgetJoiningOriginal'. Did you mean 'useBudgetJoining'?
src/components/sharing/__tests__/JoinBudgetModal.test.tsx(7,10): error TS2724: '"@/hooks/sharing/useQRCodeProcessing"' has no exported member named 'useQRCodeProcessingOriginal'. Did you mean 'useQRCodeProcessing'?
src/components/sharing/__tests__/JoinBudgetModal.test.tsx(101,7): error TS6133: 'useQRCodeProcessing' is declared but its value is never read.
src/components/sharing/__tests__/ShareCodeModal.test.tsx(5,10): error TS2305: Module '"@/hooks/auth/useAuthManager"' has no exported member 'useAuthManagerOriginal'.
src/components/sharing/__tests__/ShareCodeModal.test.tsx(6,10): error TS2724: '"@/hooks/common/useConfirm"' has no exported member named 'useConfirmOriginal'. Did you mean 'useConfirmModal'?
src/components/sharing/__tests__/ShareCodeModal.test.tsx(7,10): error TS2614: Module '"@/utils/common/toastHelpers"' has no exported member 'useToastHelpersOriginal'. Did you mean to use 'import useToastHelpersOriginal from "@/utils/common/toastHelpers"' instead?
src/components/sharing/__tests__/ShareCodeModal.test.tsx(66,7): error TS6133: 'useConfirm' is declared but its value is never read.
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
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(5,1): error TS2739: Type '{ createObjectURL: any; revokeObjectURL: any; }' is missing the following properties from type '{ new (url: string | URL, base?: string | URL): URL; prototype: URL; canParse(url: string | URL, base?: string | URL): boolean; createObjectURL(obj: Blob | MediaSource): string; parse(url: string | URL, base?: string | URL): URL; revokeObjectURL(url: string): void; }': prototype, canParse, parse
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(6,20): error TS2304: Cannot find name 'vi'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(7,20): error TS2304: Cannot find name 'vi'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(11,19): error TS2304: Cannot find name 'vi'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(20,18): error TS2304: Cannot find name 'vi'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(21,3): error TS2740: Type '{ appendChild: any; removeChild: any; }' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 312 more.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(22,18): error TS2304: Cannot find name 'vi'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(23,18): error TS2304: Cannot find name 'vi'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(27,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(28,3): error TS2304: Cannot find name 'beforeEach'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(29,5): error TS2304: Cannot find name 'vi'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(32,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(49,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(50,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(51,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(54,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(69,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(70,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(73,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(80,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(81,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(4,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(5,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(8,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(9,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(10,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(13,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(16,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(17,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(20,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(27,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(30,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(37,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(40,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useChartsAnalytics.test.ts(47,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(43,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(44,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(52,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(53,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(59,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(60,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(63,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(68,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(69,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(75,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(78,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(92,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(93,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(96,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(100,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(103,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(106,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(107,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(108,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(109,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(112,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(115,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(116,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(117,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(120,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryAnalysis.test.ts(129,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(82,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(125,3): error TS2304: Cannot find name 'beforeEach'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(140,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(145,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(146,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(147,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(148,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(149,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(150,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(153,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(164,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(168,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(169,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(172,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(184,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(185,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(188,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(204,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(211,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(214,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(228,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(231,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(257,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(261,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(264,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(281,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(284,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(299,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(302,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(317,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(324,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(342,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(345,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(359,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(360,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(363,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(376,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(377,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(378,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(381,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(393,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(403,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(419,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(4,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(16,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(19,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(20,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(23,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(26,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(29,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(30,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(31,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(32,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(33,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(34,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(35,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(38,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(41,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(44,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(45,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(46,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(47,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(48,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(51,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(54,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(58,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(59,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(62,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(63,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(64,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(67,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(70,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(73,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(74,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(75,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(76,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(79,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(80,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(81,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(84,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(88,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(89,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(90,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(91,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(94,7): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(97,7): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(98,7): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(101,7): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(105,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(109,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(110,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(113,7): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(114,7): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(115,7): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(119,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(124,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(127,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(128,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(129,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(132,5): error TS2304: Cannot find name 'expect'.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(13,30): error TS2339: Property 'paycheckHistory' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsIntegration.ts(3,32): error TS2307: Cannot find module './useChartConfig' or its corresponding type declarations.
src/hooks/analytics/useAnalyticsIntegration.ts(44,36): error TS2345: Argument of type 'MonthlyTrend[]' is not assignable to parameter of type 'MonthlyGroupData[]'.
  Property 'transactions' is missing in type 'MonthlyTrend' but required in type 'MonthlyGroupData'.
src/hooks/analytics/useAnalyticsIntegration.ts(62,7): error TS2698: Spread types may only be created from object types.
src/hooks/analytics/useAnalyticsIntegration.ts(101,12): error TS2339: Property 'map' does not exist on type 'unknown'.
src/hooks/analytics/usePerformanceMonitor.ts(51,7): error TS2353: Object literal may only specify known properties, and 'spendingEfficiency' does not exist in type 'Metrics'.
src/hooks/analytics/usePerformanceMonitor.ts(58,7): error TS2353: Object literal may only specify known properties, and 'spendingEfficiency' does not exist in type 'Metrics'.
src/hooks/analytics/utils/pdfGeneratorUtils.ts(93,54): error TS2339: Property 'envelopeAnalysis' does not exist on type 'unknown'.
src/hooks/auth/__tests__/useAuthManager.test.ts(65,3): error TS2304: Cannot find name 'beforeEach'.
src/hooks/auth/__tests__/useUserSetup.test.ts(36,27): error TS2339: Property 'mockClear' does not exist on type '(message: string, title?: string, duration?: number) => number'.
src/hooks/auth/mutations/__tests__/useJoinBudgetMutation.test.ts(190,11): error TS6133: 'joinData' is declared but its value is never read.
src/hooks/auth/mutations/__tests__/useProfileMutations.test.ts(123,40): error TS2345: Argument of type '{ updateUser: Mock<Procedure>; encryptionKey: null; salt: null; }' is not assignable to parameter of type 'AuthContextValue'.
  Type '{ updateUser: Mock<Procedure>; encryptionKey: null; salt: null; }' is missing the following properties from type 'AuthContextValue': currentUser, hasCurrentUser, hasBudgetId, user, and 12 more.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(139,26): error TS2352: Conversion of type 'UserData' to type 'import("violet-vault/src/types/auth").UserData' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Property 'userColor' is missing in type 'UserData' but required in type 'import("violet-vault/src/types/auth").UserData'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(139,74): error TS2559: Type 'SessionData' has no properties in common with type 'SessionData'.
src/hooks/auth/mutations/useLoginMutations.ts(112,38): error TS2345: Argument of type '{ userName: string; userColor: unknown; }' is not assignable to parameter of type '{ userName: string; userColor: string; }'.
  Types of property 'userColor' are incompatible.
    Type 'unknown' is not assignable to type 'string'.
src/hooks/auth/mutations/useLoginMutations.ts(243,26): error TS2352: Conversion of type 'UserData' to type 'import("violet-vault/src/types/auth").UserData' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Property 'userColor' is missing in type 'UserData' but required in type 'import("violet-vault/src/types/auth").UserData'.
src/hooks/auth/mutations/useLoginMutations.ts(243,74): error TS2559: Type 'SessionData' has no properties in common with type 'SessionData'.
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
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(38,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(66,3): error TS2304: Cannot find name 'beforeEach'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(70,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(75,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(76,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(79,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(88,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(89,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(90,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(91,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(92,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(95,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(108,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(109,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(112,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(125,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(126,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(127,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(130,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(147,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(150,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(155,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(161,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(164,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(173,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(176,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(194,5): error TS2304: Cannot find name 'expect'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(196,5): error TS2304: Cannot find name 'expect'.
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
src/hooks/bills/useBills/billMutations.ts(273,9): error TS2353: Object literal may only specify known properties, and 'paidAmount' does not exist in type 'UpdateSpec<Bill> | ((obj: Bill, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/hooks/bills/useBills/billMutations.ts(282,9): error TS2345: Argument of type 'Bill' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'Bill'.
src/hooks/bills/useBills/billMutations.ts(291,39): error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'Transaction'.
  Type 'Record<string, unknown>' is missing the following properties from type 'Transaction': id, date, amount, envelopeId, and 3 more.
src/hooks/bills/useBills/billMutations.ts(298,11): error TS2554: Expected 1 arguments, but got 6.
src/hooks/bills/useBills/billQueries.ts(213,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/bills/useBills/index.ts(22,60): error TS2339: Property 'daysAhead' does not exist on type '{}'.
src/hooks/bills/useBillValidation.ts(20,40): error TS2339: Property 'errors' does not exist on type 'ZodError<{ id: string; name: string; amount: number; category: string; isPaid: boolean; isRecurring: boolean; lastModified: number; dueDate?: string | Date; frequency?: "monthly" | "quarterly" | "annually"; envelopeId?: string; createdAt?: number; description?: string; paymentMethod?: string; }>'.
src/hooks/budgeting/__tests__/useEnvelopesQuery.test.ts(11,3): error TS6133: 'expectQuerySuccess' is declared but its value is never read.
src/hooks/budgeting/autofunding/__tests__/useAutoFundingRules.test.ts(11,1): error TS2304: Cannot find name 'vi'.
src/hooks/budgeting/autofunding/__tests__/useAutoFundingRules.test.ts(13,11): error TS2304: Cannot find name 'vi'.
src/hooks/budgeting/autofunding/__tests__/useAutoFundingRules.test.ts(14,12): error TS2304: Cannot find name 'vi'.
src/hooks/budgeting/autofunding/__tests__/useAutoFundingRules.test.ts(15,12): error TS2304: Cannot find name 'vi'.
src/hooks/budgeting/autofunding/__tests__/useAutoFundingRules.test.ts(16,11): error TS2304: Cannot find name 'vi'.
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
src/hooks/budgeting/useBudgetData/queryFunctions.ts(106,23): error TS2352: Conversion of type 'import("violet-vault/src/db/types").Bill[]' to type 'Bill[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'import("violet-vault/src/db/types").Bill' is not comparable to type 'Bill'.
    Index signature for type 'string' is missing in type 'Bill'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(115,13): error TS2551: Property 'virtualBalance' does not exist on type '{ totalEnvelopeBalance: number; totalSavingsBalance: number; unassignedCash: number; actualBalance: number; recentTransactions: Transaction[]; upcomingBills: Bill[]; }'. Did you mean 'actualBalance'?
src/hooks/budgeting/useBudgetData/queryFunctions.ts(117,13): error TS2339: Property 'balanceDifference' does not exist on type '{ totalEnvelopeBalance: number; totalSavingsBalance: number; unassignedCash: number; actualBalance: number; recentTransactions: Transaction[]; upcomingBills: Bill[]; }'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(117,65): error TS2551: Property 'virtualBalance' does not exist on type '{ totalEnvelopeBalance: number; totalSavingsBalance: number; unassignedCash: number; actualBalance: number; recentTransactions: Transaction[]; upcomingBills: Bill[]; }'. Did you mean 'actualBalance'?
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
src/hooks/common/__tests__/useExportData.test.ts(12,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useExportData.test.ts(13,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useExportData.test.ts(29,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useExportData.test.ts(30,7): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useExportData.test.ts(35,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useExportData.test.ts(51,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useImportData.test.ts(24,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useImportData.test.ts(25,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useImportData.test.ts(46,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useImportData.test.ts(47,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useImportData.test.ts(48,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useImportData.test.ts(49,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useImportData.test.ts(50,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useImportData.test.ts(51,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useImportData.test.ts(52,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(4,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useModalManager.test.ts(5,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useModalManager.test.ts(8,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(9,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(12,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useModalManager.test.ts(19,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(20,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(23,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useModalManager.test.ts(34,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(35,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(38,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useModalManager.test.ts(47,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(48,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(49,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(50,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(53,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useModalManager.test.ts(66,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(67,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(68,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(69,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(72,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useModalManager.test.ts(85,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(86,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(87,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(88,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(91,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useModalManager.test.ts(94,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(100,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(106,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(109,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useModalManager.test.ts(116,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(122,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(125,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useModalManager.test.ts(134,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(135,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(138,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useModalManager.test.ts(149,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(150,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(153,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useModalManager.test.ts(162,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(163,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(164,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(165,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(168,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useModalManager.test.ts(171,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(176,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(182,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(187,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useModalManager.test.ts(192,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useResetEncryption.test.ts(5,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useResetEncryption.test.ts(6,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/common/__tests__/useResetEncryption.test.ts(20,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useResetEncryption.test.ts(21,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useResetEncryption.test.ts(22,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/__tests__/useResetEncryption.test.ts(23,5): error TS2304: Cannot find name 'expect'.
src/hooks/common/bug-report/useBugReportSubmission.ts(148,59): error TS2345: Argument of type '{ title: string; description: string; includeScreenshot: boolean; severity: string; labels: string[]; providers: Record<string, unknown>; customData: { highlightSession: HighlightSessionState; }; }' is not assignable to parameter of type 'BugReportOptions'.
  Types of property 'severity' are incompatible.
    Type 'string' is not assignable to type '"low" | "medium" | "high" | "critical"'.
src/hooks/common/bug-report/useBugReportSubmission.ts(188,9): error TS2322: Type 'string' is not assignable to type '"low" | "medium" | "high" | "critical"'.
src/hooks/common/useActivityLogger.ts(16,37): error TS2345: Argument of type 'UserData' is not assignable to parameter of type 'ActivityUser'.
  Property 'id' is missing in type 'UserData' but required in type 'ActivityUser'.
src/hooks/common/useConnectionManager.ts(103,9): error TS2322: Type 'Envelope | Bill | Debt' is not assignable to type 'Envelope'.
  Property 'archived' is missing in type 'Bill' but required in type 'Envelope'.
src/hooks/common/useTransactionArchiving.ts(26,35): error TS2339: Property 'balance' does not exist on type 'string[]'.
src/hooks/common/useTransactionArchiving.ts(50,26): error TS2554: Expected 1 arguments, but got 0.
src/hooks/common/useTransactionArchiving.ts(87,24): error TS2554: Expected 1 arguments, but got 0.
src/hooks/common/useTransactionArchiving.ts(102,26): error TS2554: Expected 1 arguments, but got 0.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(29,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(30,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(33,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(34,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(39,13): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(43,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(49,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(54,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(57,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(64,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(65,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(68,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(84,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(85,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(89,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(101,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(106,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(107,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(108,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(109,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(110,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(111,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(114,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(119,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(120,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(123,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(131,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(132,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(133,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(136,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(139,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(140,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(141,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(142,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(146,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(151,3): error TS2304: Cannot find name 'beforeEach'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(160,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(175,7): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(178,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(179,7): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(182,23): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(185,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(188,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(203,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(204,7): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(210,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(223,7): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(226,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(238,7): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(242,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(251,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(252,7): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(261,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(270,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(271,7): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(280,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(287,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(296,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(300,3): error TS2304: Cannot find name 'beforeEach'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(309,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(316,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(317,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(320,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(325,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(328,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(336,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(337,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(340,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(348,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(355,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(356,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(367,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(368,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(369,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(372,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(375,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(376,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(377,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(378,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(381,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(384,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(385,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(386,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(389,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(392,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(393,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(394,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(397,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(400,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(401,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(402,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(405,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(408,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(409,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(410,5): error TS2304: Cannot find name 'expect'.
src/hooks/dashboard/useMainDashboard.ts(78,43): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/hooks/debts/__tests__/useDebtForm.test.ts(22,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(49,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(50,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(53,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(54,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(55,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(56,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(57,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(60,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(63,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(64,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(65,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(66,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(67,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(68,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(69,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(70,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(71,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(74,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(79,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(80,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(84,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(85,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(90,9): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(94,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(95,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(96,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(97,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(100,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(116,9): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(120,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(121,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(122,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(123,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(126,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(143,9): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(146,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(149,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(165,9): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(169,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(173,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(174,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(183,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(190,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(192,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(196,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(197,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(216,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(217,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(243,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(252,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(253,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(255,9): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(264,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(282,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(284,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(287,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(297,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(298,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(302,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(303,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(320,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(321,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(322,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(323,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(324,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(325,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(329,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(330,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/debts/__tests__/useDebtForm.test.ts(345,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(351,7): error TS2304: Cannot find name 'expect'.
src/hooks/debts/__tests__/useDebtForm.test.ts(355,7): error TS2304: Cannot find name 'expect'.
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
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(24,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(25,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(28,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(29,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(30,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(31,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(34,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(41,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(44,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(52,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(59,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(62,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(69,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(76,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(79,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(86,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(92,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(96,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(101,3): error TS2304: Cannot find name 'beforeEach'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(110,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(119,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(121,16): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(126,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(127,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(130,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(140,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(141,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(147,19): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(149,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(152,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(166,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(172,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(178,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(183,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(194,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(200,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(213,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(215,7): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(220,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(221,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(231,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(232,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(233,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(234,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(237,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(240,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(241,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(242,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(245,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(248,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(249,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(250,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(251,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(254,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(260,5): error TS2304: Cannot find name 'expect'.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(263,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/history/__tests__/useBudgetHistoryViewer.test.ts(269,5): error TS2304: Cannot find name 'expect'.
src/hooks/layout/useLayoutData.ts(74,28): error TS2339: Property 'error' does not exist on type '{ envelopes: Envelope[]; transactions: any; bills: Bill[]; savingsGoals: SavingsGoal[]; paycheckHistory: PaycheckHistory[]; dashboardSummary: {}; ... 33 more ...; dashboardError: Error; }'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(40,45): error TS2345: Argument of type 'SavingsGoal' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'SavingsGoal'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(61,22): error TS6133: 'goalData' is declared but its value is never read.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(98,47): error TS2345: Argument of type 'SavingsGoal' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'SavingsGoal'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(130,47): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(231,26): error TS2365: Operator '+' cannot be applied to types 'string | number' and 'number'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(5,1): error TS2304: Cannot find name 'vi'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(6,23): error TS2304: Cannot find name 'vi'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(23,21): error TS2304: Cannot find name 'vi'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(24,26): error TS2304: Cannot find name 'vi'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(28,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(29,3): error TS2304: Cannot find name 'beforeEach'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(30,5): error TS2304: Cannot find name 'vi'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(33,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(36,5): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(37,5): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(38,5): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(39,5): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(42,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(51,5): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(54,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(57,5): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(63,5): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(66,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(73,5): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(79,5): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(82,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(86,5): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(89,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(93,23): error TS2304: Cannot find name 'vi'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(94,30): error TS2304: Cannot find name 'vi'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(99,5): error TS2304: Cannot find name 'vi'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(105,5): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(106,5): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(108,7): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(110,5): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(112,7): error TS2304: Cannot find name 'expect'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(114,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(57,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(58,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(61,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(62,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(63,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(64,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(65,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(66,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(67,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(70,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(77,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(80,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(87,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(92,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(98,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(103,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(109,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(114,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(118,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(124,3): error TS2304: Cannot find name 'beforeEach'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(130,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(133,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(134,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(137,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(144,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(147,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(151,32): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<any>'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(159,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(162,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(171,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(175,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(176,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(179,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(180,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(184,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(188,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(192,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(199,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(200,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(204,29): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<{ commit: { hash: string; timestamp: number; message: string; author: string; parentHash: any; encryptedSnapshot: string; deviceFingerprint: string; }; changes: BudgetChange[]; }>'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(212,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(213,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(219,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(224,29): error TS2339: Property 'mockRejectedValue' does not exist on type '() => Promise<{ commit: { hash: string; timestamp: number; message: string; author: string; parentHash: any; encryptedSnapshot: string; deviceFingerprint: string; }; changes: BudgetChange[]; }>'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(232,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(238,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(249,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(250,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(44,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(45,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(48,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(49,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(50,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(51,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(52,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(55,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(62,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(65,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(72,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(78,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(81,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(88,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(91,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(105,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(106,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(107,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(110,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(117,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(118,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(119,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(120,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(121,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(124,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(131,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(135,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(136,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(149,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(150,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(151,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(154,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(168,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(169,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(170,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(174,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(175,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(178,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(179,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(180,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(181,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(184,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(187,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(188,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(189,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(190,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(193,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(196,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(197,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(198,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(201,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(206,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(207,5): error TS2304: Cannot find name 'expect'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(208,5): error TS2304: Cannot find name 'expect'.
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
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(5,1): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(6,23): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(7,22): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(8,22): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(9,26): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(10,22): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(11,24): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(23,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(61,3): error TS2304: Cannot find name 'beforeEach'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(62,5): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(73,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(76,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(77,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(78,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(79,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(80,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(81,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(84,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(95,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(96,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(99,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(110,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(111,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(114,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(125,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(126,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(129,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(140,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(141,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(144,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(155,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(156,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(159,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(172,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(173,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(174,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(175,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(176,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(177,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(180,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(183,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(186,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(189,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(192,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(209,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(212,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(231,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(234,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(251,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(6,1): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(7,20): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(9,21): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(10,24): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(15,1): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(16,17): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(22,1): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(23,19): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(24,24): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(25,25): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(26,17): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(30,1): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(31,23): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(33,25): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(34,16): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(35,19): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(36,24): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(40,1): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(41,25): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(44,20): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(46,22): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(48,23): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(49,19): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(50,18): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(54,1): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(55,26): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(68,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(71,3): error TS2304: Cannot find name 'beforeEach'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(72,5): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(75,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(80,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(81,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(82,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(83,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(84,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(85,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(88,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(93,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(94,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(95,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(96,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(97,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(98,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(101,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(109,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(114,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(119,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(122,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(133,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(138,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(144,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(147,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(152,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(153,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(154,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(157,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(162,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(163,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(164,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(165,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(166,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(169,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(174,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(175,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(176,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(179,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(188,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(191,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(195,23): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(196,26): error TS2304: Cannot find name 'vi'.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(204,5): error TS2304: Cannot find name 'expect'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(66,29): error TS2551: Property 'isAddingTransaction' does not exist on type '{ addTransaction: UseMutateFunction<Transaction, Error, TransactionInput, unknown>; addTransactionAsync: UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>; ... 11 more ...; isUpdating: boolean; }'. Did you mean 'addTransaction'?
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(136,29): error TS2551: Property 'isUpdatingTransaction' does not exist on type '{ addTransaction: UseMutateFunction<Transaction, Error, TransactionInput, unknown>; addTransactionAsync: UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>; ... 11 more ...; isUpdating: boolean; }'. Did you mean 'updateTransaction'?
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(182,29): error TS2551: Property 'isDeletingTransaction' does not exist on type '{ addTransaction: UseMutateFunction<Transaction, Error, TransactionInput, unknown>; addTransactionAsync: UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>; ... 11 more ...; isUpdating: boolean; }'. Did you mean 'deleteTransaction'?
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(223,29): error TS2551: Property 'isAddingTransaction' does not exist on type '{ addTransaction: UseMutateFunction<Transaction, Error, TransactionInput, unknown>; addTransactionAsync: UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>; ... 11 more ...; isUpdating: boolean; }'. Did you mean 'addTransaction'?
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(224,29): error TS2551: Property 'isUpdatingTransaction' does not exist on type '{ addTransaction: UseMutateFunction<Transaction, Error, TransactionInput, unknown>; addTransactionAsync: UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>; ... 11 more ...; isUpdating: boolean; }'. Did you mean 'updateTransaction'?
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(225,29): error TS2551: Property 'isDeletingTransaction' does not exist on type '{ addTransaction: UseMutateFunction<Transaction, Error, TransactionInput, unknown>; addTransactionAsync: UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>; ... 11 more ...; isUpdating: boolean; }'. Did you mean 'deleteTransaction'?
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(242,29): error TS2551: Property 'addTransactionError' does not exist on type '{ addTransaction: UseMutateFunction<Transaction, Error, TransactionInput, unknown>; addTransactionAsync: UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>; ... 11 more ...; isUpdating: boolean; }'. Did you mean 'addTransaction'?
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(243,29): error TS2551: Property 'updateTransactionError' does not exist on type '{ addTransaction: UseMutateFunction<Transaction, Error, TransactionInput, unknown>; addTransactionAsync: UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>; ... 11 more ...; isUpdating: boolean; }'. Did you mean 'updateTransaction'?
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(244,29): error TS2551: Property 'deleteTransactionError' does not exist on type '{ addTransaction: UseMutateFunction<Transaction, Error, TransactionInput, unknown>; addTransactionAsync: UseMutateAsyncFunction<Transaction, Error, TransactionInput, unknown>; ... 11 more ...; isUpdating: boolean; }'. Did you mean 'deleteTransaction'?
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
src/test/queryTestUtils.tsx(169,3): error TS2304: Cannot find name 'expect'.
src/test/queryTestUtils.tsx(177,3): error TS2304: Cannot find name 'expect'.
src/test/queryTestUtils.tsx(178,3): error TS2304: Cannot find name 'expect'.
src/test/queryTestUtils.tsx(186,3): error TS2304: Cannot find name 'expect'.
src/test/queryTestUtils.tsx(187,3): error TS2304: Cannot find name 'expect'.
src/test/queryTestUtils.tsx(199,3): error TS2304: Cannot find name 'expect'.
src/utils/accounts/__tests__/accountValidation.test.ts(210,13): error TS6133: 'expectedDays' is declared but its value is never read.
src/utils/analytics/__tests__/trendHelpers.test.ts(11,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(12,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(13,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(14,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(15,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(18,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(19,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(22,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(23,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(26,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(27,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(31,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(32,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(33,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(34,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(37,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(38,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(39,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(42,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(43,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(47,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(48,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(50,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(51,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(52,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(55,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(57,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(58,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(59,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(62,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(64,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(65,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(66,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(69,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(71,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(72,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(73,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(77,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(78,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(79,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(80,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(83,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(84,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(85,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(88,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(89,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(93,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(94,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(99,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(100,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(101,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(104,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(105,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(109,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(110,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(112,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(113,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(117,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(118,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(120,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(121,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(124,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/analytics/__tests__/trendHelpers.test.ts(126,7): error TS2304: Cannot find name 'expect'.
src/utils/analytics/__tests__/trendHelpers.test.ts(127,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(12,1): error TS2304: Cannot find name 'vi'.
src/utils/bills/__tests__/billCalculations.test.ts(14,11): error TS2304: Cannot find name 'vi'.
src/utils/bills/__tests__/billCalculations.test.ts(18,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(21,3): error TS2304: Cannot find name 'beforeEach'.
src/utils/bills/__tests__/billCalculations.test.ts(22,5): error TS2304: Cannot find name 'vi'.
src/utils/bills/__tests__/billCalculations.test.ts(25,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(26,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(27,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(30,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(32,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(35,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(36,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(37,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(40,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(41,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(42,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(45,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(46,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(47,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(50,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(51,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(52,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(55,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(56,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(57,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(60,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(61,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(62,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(63,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(66,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(68,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(69,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(72,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(73,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(76,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(78,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(79,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(83,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(84,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(86,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(89,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(91,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(94,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(96,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(99,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(102,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(105,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(108,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(111,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(112,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(113,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(114,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(117,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(118,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(119,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(123,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(124,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(125,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(126,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(129,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(130,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(131,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(132,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(135,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(136,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(137,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(138,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(141,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(142,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(143,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(146,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(147,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(148,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(152,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(153,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(164,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(171,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(179,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(182,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(191,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(194,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(202,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(205,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(210,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(211,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(212,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(216,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(231,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(234,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(235,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(237,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(238,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(240,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(241,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(243,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(246,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(249,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(252,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(261,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(264,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(271,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(274,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(276,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(277,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(278,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(279,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(283,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(306,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(309,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(310,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(311,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(312,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(315,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(318,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(319,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(320,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(321,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(324,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(335,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(336,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(337,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(338,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(339,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(342,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(356,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(357,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(361,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(392,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(394,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(395,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(398,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(400,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(401,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(404,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(406,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(407,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(410,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(412,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(413,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(416,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(418,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(419,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(422,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(423,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(426,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(428,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(431,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(433,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(434,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(437,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(439,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(440,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(443,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(445,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(446,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(449,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(451,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(452,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(455,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(462,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(463,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(466,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(468,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(471,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(476,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(479,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(486,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(487,7): error TS2304: Cannot find name 'expect'.
src/utils/bills/__tests__/billCalculations.test.ts(490,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/bills/__tests__/billCalculations.test.ts(493,7): error TS2304: Cannot find name 'expect'.
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
src/utils/dataManagement/__tests__/backupUtils.test.ts(20,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/backupUtils.test.ts(21,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/backupUtils.test.ts(22,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/backupUtils.test.ts(27,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/backupUtils.test.ts(28,9): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/backupUtils.test.ts(29,9): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(51,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(52,3): error TS2304: Cannot find name 'afterEach'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(56,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(57,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(59,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(60,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(61,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(62,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(63,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(64,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(65,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(66,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(70,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(71,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(82,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(83,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(84,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(85,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(86,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(87,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(88,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(89,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/fileUtils.test.ts(4,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/fileUtils.test.ts(5,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/fileUtils.test.ts(6,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/fileUtils.test.ts(9,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/fileUtils.test.ts(12,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/fileUtils.test.ts(13,13): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/fileUtils.test.ts(16,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/fileUtils.test.ts(31,13): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(22,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(23,3): error TS2304: Cannot find name 'afterEach'.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(27,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(28,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(30,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(31,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(31,23): error TS2339: Property 'syncMetadata' does not exist on type 'VioletVaultDB'.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(35,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(36,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(39,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(40,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(41,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(44,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(49,13): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/validationUtils.test.ts(3,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/validationUtils.test.ts(4,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/validationUtils.test.ts(7,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/validationUtils.test.ts(8,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/validationUtils.test.ts(13,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/validationUtils.test.ts(15,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/validationUtils.test.ts(20,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/validationUtils.test.ts(31,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/validationUtils.test.ts(32,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/__tests__/validationUtils.test.ts(35,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/dataManagement/__tests__/validationUtils.test.ts(41,7): error TS2304: Cannot find name 'expect'.
src/utils/dataManagement/dexieUtils.ts(70,33): error TS2345: Argument of type '{ id: string; unassignedCash: any; biweeklyAllocation: any; actualBalance: any; isActualBalanceManual: any; supplementalAccounts: any; lastUpdated: string; }' is not assignable to parameter of type 'BudgetRecord'.
  Property 'lastModified' is missing in type '{ id: string; unassignedCash: any; biweeklyAllocation: any; actualBalance: any; isActualBalanceManual: any; supplementalAccounts: any; lastUpdated: string; }' but required in type 'BudgetRecord'.
src/utils/dataManagement/firebaseUtils.ts(2,1): error TS6133: 'budgetDb' is declared but its value is never read.
src/utils/debts/__tests__/debtFormValidation.test.ts(11,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(12,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(13,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(17,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(18,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(19,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(20,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(21,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(24,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(37,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(38,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(39,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(40,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(41,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(45,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(46,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(57,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(58,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(59,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(62,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(73,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(76,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(87,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(88,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(92,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(93,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(104,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(109,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(120,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(125,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(136,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(141,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(153,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(159,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(160,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(172,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(173,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(174,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(175,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(178,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(188,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(193,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(194,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(195,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(206,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(207,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(208,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(209,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(210,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(211,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(212,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(215,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(226,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(227,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(228,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(229,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(232,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(243,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(244,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(245,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(249,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(250,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(261,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(262,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(265,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(276,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(277,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(281,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(282,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(290,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(293,5): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(304,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(305,7): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(310,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(311,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(321,5): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(322,5): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(323,5): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(324,5): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(327,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(337,5): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(340,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(350,5): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(351,5): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(352,5): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(355,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(358,5): error TS2304: Cannot find name 'expect'.
src/utils/debts/__tests__/debtFormValidation.test.ts(361,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/debts/__tests__/debtFormValidation.test.ts(371,5): error TS2304: Cannot find name 'expect'.
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
src/utils/sync/__tests__/syncHealthHelpers.test.ts(14,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(15,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(16,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(17,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(18,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(21,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(22,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(23,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(24,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(25,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(26,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(30,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(31,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(32,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(33,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(36,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(37,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(38,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(39,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(40,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(41,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(45,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(46,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(47,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(48,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(51,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(52,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(53,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(54,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(55,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(56,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(57,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(61,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(62,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(63,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(66,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(71,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(72,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(75,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(78,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(81,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(84,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(88,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(89,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(90,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(91,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(94,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(96,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(99,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(101,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(104,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(107,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(109,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(112,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(115,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(118,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(121,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(122,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(126,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(127,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(128,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(129,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(130,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(131,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(132,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(136,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(137,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(138,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(139,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(142,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(143,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(144,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(145,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(149,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(150,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(151,47): error TS2304: Cannot find name 'vi'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(152,43): error TS2304: Cannot find name 'vi'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(154,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(161,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(162,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(165,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(166,47): error TS2304: Cannot find name 'vi'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(168,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(175,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(176,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(177,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(178,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(181,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(189,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(196,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(204,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(211,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(215,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(218,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(222,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(227,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(229,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(234,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(236,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(241,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(243,7): error TS2304: Cannot find name 'expect'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(248,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(250,7): error TS2304: Cannot find name 'expect'.
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
src/utils/transactions/__tests__/filtering.test.ts(15,1): error TS2304: Cannot find name 'vi'.
src/utils/transactions/__tests__/filtering.test.ts(17,12): error TS2304: Cannot find name 'vi'.
src/utils/transactions/__tests__/filtering.test.ts(21,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(61,3): error TS2304: Cannot find name 'beforeEach'.
src/utils/transactions/__tests__/filtering.test.ts(62,5): error TS2304: Cannot find name 'vi'.
src/utils/transactions/__tests__/filtering.test.ts(65,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(66,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(67,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(68,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(69,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(72,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(76,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(77,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(80,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(82,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(83,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(86,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(91,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(92,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(95,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(100,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(101,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(104,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(105,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(109,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(110,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(111,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(112,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(113,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(116,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(118,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(119,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(122,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(124,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(128,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(129,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(130,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(131,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(132,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(135,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(137,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(138,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(141,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(143,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(146,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(152,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(156,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(157,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(158,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(159,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(160,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(163,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(165,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(166,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(169,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(171,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(172,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(175,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(182,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(185,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(187,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(191,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(192,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(193,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(194,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(195,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(196,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(199,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(201,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(202,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(205,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(207,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(208,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(211,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(213,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(214,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(217,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(219,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(220,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(223,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(225,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(226,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(229,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(231,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(232,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(235,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(241,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(245,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(246,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(248,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(251,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(253,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(256,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(258,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(261,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(263,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(266,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(268,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(271,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(273,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(276,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(282,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(285,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(288,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(292,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(293,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(303,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(304,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(307,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(314,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(315,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(318,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(325,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(326,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(329,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(331,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(334,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(336,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(339,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(342,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(343,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(347,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(348,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(350,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(351,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(352,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(355,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(357,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(360,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(362,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(363,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(366,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(368,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(369,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(372,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(374,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(378,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(379,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(381,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(382,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(385,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(391,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(394,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(396,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(400,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(401,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(404,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(405,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(406,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(407,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(408,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(411,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(414,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(415,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(421,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(424,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(425,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(431,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(434,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(435,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(438,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(441,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(442,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(443,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(444,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(445,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(446,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(447,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(450,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(464,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(465,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(468,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/filtering.test.ts(472,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(473,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/filtering.test.ts(474,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(7,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(8,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(9,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(20,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(21,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(22,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(25,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(30,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(31,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(32,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(35,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(40,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(41,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(42,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(45,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(48,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(49,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(50,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(53,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(58,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(59,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(60,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(63,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(75,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(76,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(77,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(81,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(88,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(91,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(92,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(93,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(94,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(95,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(98,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(102,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(103,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(104,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(105,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(109,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(113,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(117,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(123,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(127,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(128,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(129,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(130,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(134,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(138,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(144,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(148,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(149,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(150,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(152,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(156,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(160,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(164,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(168,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(174,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(178,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(179,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(180,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(181,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(185,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(189,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(195,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(199,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(200,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(204,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(211,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(212,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(214,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(217,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(219,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(222,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(224,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(227,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(229,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(232,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(234,7): error TS2304: Cannot find name 'expect'.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(237,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/utils/transactions/__tests__/ledgerHelpers.test.ts(239,7): error TS2304: Cannot find name 'expect'.
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

