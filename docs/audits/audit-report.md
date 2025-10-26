# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 89 | 0 |
| TypeScript Errors | 2092 | 0 |

*Last updated: 2025-10-26 20:21:37 UTC*

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
- 32 issues in `violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts`
- 25 issues in `violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts`
- 12 issues in `violet-vault/src/hooks/bills/useBillManagerHelpers.ts`
- 7 issues in `violet-vault/src/services/bugReport/performanceInfoService.ts`
- 6 issues in `violet-vault/src/hooks/budgeting/useBudgetData/mutationsHelpers.ts`
- 4 issues in `violet-vault/src/services/chunkedSyncService.ts`
- 1 issues in `violet-vault/src/hooks/transactions/useTransactionsV2.ts`
- 1 issues in `violet-vault/src/hooks/transactions/useTransactionSplitter.ts`
- 1 issues in `violet-vault/src/hooks/transactions/useTransactionOperations.ts`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 84 | `@typescript-eslint/no-explicit-any` |
| 3 | `max-lines-per-function` |
| 2 | `max-params` |

### Detailed Lint Report
```
violet-vault/src/hooks/bills/useBillManagerHelpers.ts:49:18 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/bills/useBillManagerHelpers.ts:50:22 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/bills/useBillManagerHelpers.ts:51:20 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/bills/useBillManagerHelpers.ts:52:4 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/bills/useBillManagerHelpers.ts:98:33 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/bills/useBillManagerHelpers.ts:135:21 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/bills/useBillManagerHelpers.ts:137:18 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/bills/useBillManagerHelpers.ts:149:14 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/bills/useBillManagerHelpers.ts:200:42 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/bills/useBillManagerHelpers.ts:218:14 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/bills/useBillManagerHelpers.ts:224:18 - 1 - Async arrow function has too many parameters (8). Maximum allowed is 5. (max-params)
violet-vault/src/hooks/bills/useBillManagerHelpers.ts:248:18 - 1 - Async arrow function has too many parameters (6). Maximum allowed is 5. (max-params)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:13:45 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:22:43 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:22:49 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:32:44 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:32:50 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:48:40 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:48:71 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:49:17 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:90:42 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:121:40 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:121:46 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:122:21 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:140:36 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:158:23 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:159:12 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:162:62 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:168:54 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:189:9 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:190:23 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:194:23 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:219:53 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:219:68 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:221:62 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:243:42 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingDataHelpers.ts:244:22 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:11:45 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:19:16 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:20:14 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:21:41 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:21:57 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:55:14 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:56:11 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:94:14 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:95:16 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:96:11 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:97:13 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:98:18 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:133:14 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:134:16 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:135:13 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:155:15 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:156:13 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:157:14 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:177:11 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:178:16 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:179:14 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:180:13 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:190:19 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:191:29 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:206:14 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:207:18 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:208:16 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:209:13 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:224:50 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:224:68 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:234:13 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts:235:14 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/useBudgetData/mutationsHelpers.ts:12:19 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/useBudgetData/mutationsHelpers.ts:13:20 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/useBudgetData/mutationsHelpers.ts:36:71 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/useBudgetData/mutationsHelpers.ts:58:12 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/useBudgetData/mutationsHelpers.ts:81:82 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/budgeting/useBudgetData/mutationsHelpers.ts:89:15 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/hooks/transactions/useTransactionOperations.ts:24:34 - 1 - Arrow function has too many lines (161). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/transactions/useTransactionSplitter.ts:29:32 - 1 - Arrow function has too many lines (183). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/transactions/useTransactionsV2.ts:18:27 - 1 - Arrow function has too many lines (166). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/services/bugReport/performanceInfoService.ts:286:36 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/services/bugReport/performanceInfoService.ts:310:40 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/services/bugReport/performanceInfoService.ts:310:73 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/services/bugReport/performanceInfoService.ts:310:109 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/services/bugReport/performanceInfoService.ts:336:40 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/services/bugReport/performanceInfoService.ts:336:73 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/services/bugReport/performanceInfoService.ts:336:109 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/services/chunkedSyncService.ts:233:12 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/services/chunkedSyncService.ts:657:65 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/services/chunkedSyncService.ts:867:20 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
violet-vault/src/services/chunkedSyncService.ts:871:16 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
```

## Typecheck Audit

### Files with Most Type Errors
- 84 errors in `src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx`
- 52 errors in `src/hooks/common/__tests__/useModalManager.test.ts`
- 46 errors in `src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx`
- 42 errors in `src/services/__tests__/budgetHistoryService.test.ts`
- 39 errors in `src/stores/ui/__tests__/onboardingStore.test.ts`
- 36 errors in `src/utils/budgeting/autofunding/__tests__/rules.test.ts`
- 34 errors in `src/utils/sync/syncEdgeCaseTester.ts`
- 34 errors in `src/utils/budgeting/autofunding/__tests__/conditions.test.ts`
- 32 errors in `src/utils/transactions/__tests__/splitting.test.ts`
- 30 errors in `src/utils/query/__tests__/integration/queryIntegration.test.ts`
- 30 errors in `src/hooks/savings/useSavingsGoals/savingsMutations.ts`
- 29 errors in `src/utils/transactions/__tests__/operations.test.ts`
- 29 errors in `src/services/bugReport/__tests__/index.test.ts`
- 26 errors in `src/utils/debug/syncDiagnostic.ts`
- 26 errors in `src/utils/debts/__tests__/debtFormValidation.test.ts`
- 26 errors in `src/services/__tests__/budgetDatabaseService.test.ts`
- 25 errors in `src/stores/ui/__tests__/fabStore.test.ts`
- 25 errors in `src/services/bugReport/__tests__/systemInfoService.test.ts`
- 25 errors in `src/services/__tests__/integration/syncIntegration.test.ts`
- 24 errors in `src/services/keys/__tests__/keyManagementService.test.ts`
- 23 errors in `src/utils/debug/dataDiagnostic.ts`
- 23 errors in `src/hooks/transactions/useTransactionData.ts`
- 22 errors in `src/utils/query/__tests__/prefetchHelpers.test.ts`
- 22 errors in `src/hooks/transactions/__tests__/useTransactionUtils.test.ts`
- 22 errors in `src/hooks/bills/useBills/billMutations.ts`
- 21 errors in `src/utils/budgeting/__tests__/envelopeFormUtils.test.ts`
- 21 errors in `src/stores/ui/fabStore.ts`
- 21 errors in `src/hooks/budgeting/useBudgetHistoryQuery.ts`
- 21 errors in `src/hooks/budgeting/metadata/useActualBalance.ts`
- 20 errors in `src/hooks/auth/__tests__/useAuthManager.test.ts`
- 19 errors in `src/utils/budgeting/suggestionUtils.ts`
- 19 errors in `src/hooks/common/useReceipts.ts`
- 19 errors in `src/hooks/bills/useBills/__tests__/billMutations.test.ts`
- 18 errors in `src/utils/analytics/transactionAnalyzer.ts`
- 17 errors in `src/utils/accounts/accountHelpers.ts`
- 17 errors in `src/hooks/transactions/useTransactionOperations.ts`
- 16 errors in `src/utils/query/__tests__/optimisticHelpers.test.ts`
- 15 errors in `src/hooks/debts/__tests__/useDebtForm.test.ts`
- 14 errors in `src/utils/transactions/operations.ts`
- 14 errors in `src/utils/query/prefetchHelpers.ts`
- 14 errors in `src/utils/budgeting/envelopeFormUtils.ts`
- 14 errors in `src/services/bugReport/__tests__/screenshotService.test.ts`
- 13 errors in `src/utils/common/analyticsProcessor.ts`
- 13 errors in `src/utils/budgeting/autofunding/__tests__/simulation.test.ts`
- 13 errors in `src/utils/analytics/billAnalyzer.ts`
- 13 errors in `src/services/security/__tests__/securityService.test.ts`
- 13 errors in `src/services/__tests__/types/firebaseTypes.test.ts`
- 13 errors in `src/hooks/transactions/useTransactionsV2.ts`
- 13 errors in `src/hooks/transactions/__tests__/useTransactionFilters.test.ts`
- 12 errors in `src/utils/sync/SyncMutex.ts`
- 12 errors in `src/utils/sync/RetryManager.ts`
- 12 errors in `src/utils/pwa/pwaManager.ts`
- 12 errors in `src/services/chunkedSyncService.ts`
- 12 errors in `src/services/bugReport/index.ts`
- 11 errors in `src/utils/sync/autoBackupService.ts`
- 11 errors in `src/utils/analytics/categoryHelpers.ts`
- 11 errors in `src/hooks/transactions/helpers/transactionOperationsHelpers.ts`
- 11 errors in `src/hooks/transactions/__tests__/useTransactionMutations.test.ts`
- 11 errors in `src/hooks/savings/useSavingsGoals/index.ts`
- 11 errors in `src/hooks/budgeting/useBudgetData/queryFunctions.ts`
- 11 errors in `src/hooks/bills/useBills/billQueries.ts`
- 11 errors in `src/components/modals/UnassignedCashModal.tsx`
- 11 errors in `src/components/debt/ui/DebtList.tsx`
- 11 errors in `src/components/budgeting/envelope/EnvelopeBudgetFields.tsx`
- 10 errors in `src/utils/sync/validation/__tests__/manifestValidator.test.ts`
- 10 errors in `src/utils/budgeting/paycheckUtils.ts`
- 9 errors in `src/services/cloudSyncService.ts`
- 9 errors in `src/hooks/auth/__tests__/useAuthenticationManager.test.ts`
- 9 errors in `src/hooks/analytics/__tests__/useTrendAnalysis.test.ts`
- 8 errors in `src/utils/sync/__tests__/syncHealthHelpers.test.ts`
- 8 errors in `src/utils/budgeting/__tests__/paycheckUtils.test.ts`
- 8 errors in `src/services/bugReport/screenshotService.ts`
- 8 errors in `src/hooks/debts/useDebtManagement.ts`
- 8 errors in `src/hooks/common/__tests__/useExportData.test.ts`
- 8 errors in `src/components/ui/Header.tsx`
- 8 errors in `src/components/sync/ManualSyncControls.tsx`
- 8 errors in `src/components/budgeting/envelope/EnvelopeBasicFields.tsx`
- 7 errors in `src/utils/sync/validation/__tests__/encryptedDataValidator.test.ts`
- 7 errors in `src/utils/bills/__tests__/billCalculations.test.ts`
- 7 errors in `src/hooks/transactions/useTransactionLedger.ts`
- 7 errors in `src/hooks/transactions/__tests__/useTransactionQuery.test.ts`
- 7 errors in `src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts`
- 7 errors in `src/components/automation/AutoFundingRuleBuilder.tsx`
- 6 errors in `src/utils/stores/storeRegistry.ts`
- 6 errors in `src/utils/stores/createSafeStore.ts`
- 6 errors in `src/hooks/transactions/useTransactionFileUpload.ts`
- 6 errors in `src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts`
- 6 errors in `src/hooks/receipts/__tests__/useReceiptScanner.test.ts`
- 6 errors in `src/hooks/debts/helpers/debtManagementHelpers.ts`
- 6 errors in `src/hooks/common/useOnboardingAutoComplete.ts`
- 6 errors in `src/hooks/common/useEditLock.ts`
- 6 errors in `src/hooks/common/__tests__/useImportData.test.ts`
- 6 errors in `src/hooks/budgeting/autofunding/useAutoFunding.ts`
- 6 errors in `src/hooks/auth/mutations/__tests__/useProfileMutations.test.ts`
- 6 errors in `src/components/onboarding/OnboardingProgress.tsx`
- 5 errors in `src/utils/common/performance.ts`
- 5 errors in `src/utils/common/ocrProcessor.ts`
- 5 errors in `src/utils/common/logger.ts`
- 5 errors in `src/utils/common/highlight.ts`
- 5 errors in `src/services/firebaseMessaging.ts`
- 5 errors in `src/hooks/settings/useTransactionArchiving.ts`
- 5 errors in `src/hooks/common/usePrompt.ts`
- 5 errors in `src/hooks/common/useConfirm.ts`
- 5 errors in `src/hooks/budgeting/metadata/useBudgetMetadataUtils.ts`
- 5 errors in `src/hooks/budgeting/metadata/useBudgetMetadataQuery.ts`
- 5 errors in `src/hooks/auth/mutations/__tests__/usePasswordMutations.test.ts`
- 5 errors in `src/db/__tests__/budgetDb.comprehensive.test.ts`
- 5 errors in `src/components/transactions/TransactionLedger.tsx`
- 5 errors in `src/components/debt/ui/DebtFilters.tsx`
- 4 errors in `src/utils/sync/corruptionRecoveryHelper.ts`
- 4 errors in `src/utils/savings/savingsFormUtils.ts`
- 4 errors in `src/utils/pwa/offlineDataValidator.ts`
- 4 errors in `src/utils/common/version.ts`
- 4 errors in `src/utils/budgeting/envelopeCalculations.ts`
- 4 errors in `src/utils/bills/billDetailUtils.ts`
- 4 errors in `src/hooks/sync/useFirebaseSync.ts`
- 4 errors in `src/hooks/common/useTransactionArchiving.ts`
- 4 errors in `src/hooks/budgeting/useBudgetData/mutationsHelpers.ts`
- 4 errors in `src/hooks/auth/__tests__/useSecurityManagerUI.test.ts`
- 4 errors in `src/hooks/auth/__tests__/useKeyManagementUI.test.ts`
- 4 errors in `src/contexts/__tests__/AuthContext.test.tsx`
- 4 errors in `src/components/sync/ActivityBanner.tsx`
- 4 errors in `src/components/settings/sections/SyncDebugToolsSection.tsx`
- 4 errors in `src/components/settings/archiving/ArchivingPreviewResults.tsx`
- 4 errors in `src/components/mobile/ResponsiveModal.tsx`
- 4 errors in `src/components/debt/DebtDashboardComponents.tsx`
- 4 errors in `src/components/bills/BillManagerModals.tsx`
- 3 errors in `src/utils/transactions/__tests__/filtering.test.ts`
- 3 errors in `src/utils/sync/syncHealthHelpers.ts`
- 3 errors in `src/utils/sync/retryUtils.ts`
- 3 errors in `src/utils/sync/resilience/index.ts`
- 3 errors in `src/utils/security/shareCodeUtils.ts`
- 3 errors in `src/utils/savings/savingsCalculations.ts`
- 3 errors in `src/utils/debts/debtFormValidation.ts`
- 3 errors in `src/utils/dataManagement/firebaseUtils.ts`
- 3 errors in `src/utils/dataManagement/__tests__/firebaseUtils.test.ts`
- 3 errors in `src/utils/common/transactionArchiving.ts`
- 3 errors in `src/utils/common/fixAutoAllocateUndefined.ts`
- 3 errors in `src/utils/budgeting/envelopeIntegrityChecker.ts`
- 3 errors in `src/utils/budgeting/billEnvelopeCalculations.ts`
- 3 errors in `src/utils/accounts/__tests__/accountValidation.test.ts`
- 3 errors in `src/services/keys/keyManagementService.ts`
- 3 errors in `src/services/bugReport/contextAnalysisService.ts`
- 3 errors in `src/services/bugReport/apiService.ts`
- 3 errors in `src/services/authService.ts`
- 3 errors in `src/main.tsx`
- 3 errors in `src/hooks/transactions/useTransactionSplitter.ts`
- 3 errors in `src/hooks/transactions/helpers/transactionDataHelpers.ts`
- 3 errors in `src/hooks/transactions/__tests__/useTransactionAnalytics.test.ts`
- 3 errors in `src/hooks/settings/__tests__/useSettingsDashboard.test.ts`
- 3 errors in `src/hooks/debts/useDebts.ts`
- 3 errors in `src/hooks/budgeting/useUnassignedCashDistribution.ts`
- 3 errors in `src/hooks/budgeting/useEnvelopeForm.ts`
- 3 errors in `src/hooks/budgeting/useBudgetData/utilities.ts`
- 3 errors in `src/hooks/budgeting/useBudgetData/mutations.ts`
- 3 errors in `src/hooks/budgeting/metadata/useUnassignedCashOperations.ts`
- 3 errors in `src/hooks/budgeting/metadata/useBudgetMetadataMutation.ts`
- 3 errors in `src/hooks/budgeting/metadata/useActualBalanceOperations.ts`
- 3 errors in `src/hooks/bills/useBills/__tests__/billQueries.test.ts`
- 3 errors in `src/hooks/bills/useBillManagerHelpers.ts`
- 3 errors in `src/hooks/bills/useBillManager.ts`
- 3 errors in `src/hooks/auth/mutations/useProfileMutations.ts`
- 3 errors in `src/hooks/auth/mutations/useLoginMutations.ts`
- 3 errors in `src/hooks/auth/mutations/useJoinBudgetMutation.ts`
- 3 errors in `src/hooks/analytics/__tests__/useAnalyticsExport.test.ts`
- 3 errors in `src/domain/schemas/paycheck-history.ts`
- 3 errors in `src/db/__tests__/budgetDb.migrations.test.ts`
- 3 errors in `src/components/onboarding/hooks/useTutorialControls.ts`
- 3 errors in `src/components/onboarding/EmptyStateHints.tsx`
- 3 errors in `src/components/layout/ViewRenderer.tsx`
- 3 errors in `src/components/debt/modals/DebtDetailModalComponents.tsx`
- 3 errors in `src/components/debt/DebtDashboard.tsx`
- 3 errors in `src/components/budgeting/EnvelopeSystem.tsx`
- 3 errors in `src/components/auth/UserIndicator.tsx`
- 2 errors in `src/utils/transactions/index.ts`
- 2 errors in `src/utils/testing/storeTestUtils.ts`
- 2 errors in `src/utils/sync/dataDetectionHelper.ts`
- 2 errors in `src/utils/services/editLockHelpers.ts`
- 2 errors in `src/utils/security/index.ts`
- 2 errors in `src/utils/security/errorViewer.ts`
- 2 errors in `src/utils/query/__tests__/config/queryClientConfig.test.ts`
- 2 errors in `src/utils/pwa/backgroundSync.ts`
- 2 errors in `src/utils/dataManagement/__tests__/dexieUtils.test.ts`
- 2 errors in `src/utils/dataManagement/__tests__/backupUtils.test.ts`
- 2 errors in `src/utils/common/testBudgetHistory.ts`
- 2 errors in `src/utils/accounts/accountValidation.ts`
- 2 errors in `src/stores/ui/toastStore.ts`
- 2 errors in `src/services/transactions/__tests__/transactionSplitterService.test.ts`
- 2 errors in `src/services/syncServiceInitializer.ts`
- 2 errors in `src/services/editLockService.ts`
- 2 errors in `src/services/bugReport/githubApiService.ts`
- 2 errors in `src/services/bugReport/errorTrackingService.ts`
- 2 errors in `src/services/__tests__/syncErrorHandling.test.ts`
- 2 errors in `src/hooks/receipts/useReceiptToTransaction.ts`
- 2 errors in `src/hooks/debts/useDebtDashboard.ts`
- 2 errors in `src/hooks/common/useDataManagement.ts`
- 2 errors in `src/hooks/common/useDataInitialization.ts`
- 2 errors in `src/hooks/budgeting/usePaycheckProcessor.ts`
- 2 errors in `src/hooks/budgeting/useBudgetData/index.ts`
- 2 errors in `src/hooks/budgeting/autofunding/useAutoFundingHistory.ts`
- 2 errors in `src/hooks/bills/useBillForm.ts`
- 2 errors in `src/hooks/auth/mutations/usePasswordMutations.ts`
- 2 errors in `src/hooks/analytics/usePerformanceMonitor.ts`
- 2 errors in `src/hooks/analytics/useAnalyticsIntegration.ts`
- 2 errors in `src/hooks/accounts/__tests__/useSupplementalAccounts.test.ts`
- 2 errors in `src/domain/schemas/utility.ts`
- 2 errors in `src/domain/schemas/audit-log.ts`
- 2 errors in `src/contexts/__tests__/authUtils.test.ts`
- 2 errors in `src/components/security/LockScreen.tsx`
- 2 errors in `src/components/savings/SavingsGoalCard.tsx`
- 2 errors in `src/components/pwa/ShareTargetHandler.tsx`
- 2 errors in `src/components/history/ObjectHistoryViewer.tsx`
- 2 errors in `src/components/debt/modals/DebtFormSections.tsx`
- 2 errors in `src/components/debt/modals/DebtDetailModal.tsx`
- 2 errors in `src/components/charts/ComposedFinancialChart.tsx`
- 2 errors in `src/components/charts/CategoryBarChart.tsx`
- 2 errors in `src/components/budgeting/SmartEnvelopeSuggestions.tsx`
- 2 errors in `src/components/budgeting/EditEnvelopeModal.tsx`
- 2 errors in `src/components/budgeting/CreateEnvelopeModalComponents.tsx`
- 2 errors in `src/components/automation/AutoFundingDashboard.tsx`
- 2 errors in `src/components/analytics/ChartsAndAnalytics.tsx`
- 2 errors in `src/components/analytics/CategoryAdvancedTab.tsx`
- 1 errors in `src/utils/validation/transactionValidation.ts`
- 1 errors in `src/utils/sync/validation/checksumUtils.ts`
- 1 errors in `src/utils/sync/validation/__tests__/checksumUtils.test.ts`
- 1 errors in `src/utils/sync/syncHealthChecker.ts`
- 1 errors in `src/utils/sync/syncFlowValidator.ts`
- 1 errors in `src/utils/sync/index.ts`
- 1 errors in `src/utils/sync/__tests__/dataIntegrity.test.ts`
- 1 errors in `src/utils/sync/__tests__/SyncMutex.test.ts`
- 1 errors in `src/utils/security/optimizedSerialization.ts`
- 1 errors in `src/utils/security/encryption.ts`
- 1 errors in `src/utils/receipts/receiptHelpers.tsx`
- 1 errors in `src/utils/query/__tests__/queryKeys.test.ts`
- 1 errors in `src/utils/pwa/serviceWorkerDiagnostics.ts`
- 1 errors in `src/utils/pwa/patchNotesManager.ts`
- 1 errors in `src/utils/debts/debtCalculations.ts`
- 1 errors in `src/utils/dataManagement/dexieUtils.ts`
- 1 errors in `src/utils/common/budgetHistoryTracker.ts`
- 1 errors in `src/utils/common/billDiscovery.ts`
- 1 errors in `src/utils/budgeting/paycheckProcessing.ts`
- 1 errors in `src/utils/budgeting/autofunding/simulation.ts`
- 1 errors in `src/utils/budgeting/autofunding/conditions.ts`
- 1 errors in `src/utils/bills/index.ts`
- 1 errors in `src/test/queryTestUtils.tsx`
- 1 errors in `src/stores/ui/uiStore.ts`
- 1 errors in `src/services/typedFirebaseSyncService.ts`
- 1 errors in `src/services/typedChunkedSyncService.ts`
- 1 errors in `src/services/bugReport/systemInfoService.ts`
- 1 errors in `src/services/bugReport/reportSubmissionService.ts`
- 1 errors in `src/services/bugReport/performanceInfoService.ts`
- 1 errors in `src/services/bugReport/pageDetectionService.ts`
- 1 errors in `src/hooks/transactions/useTransactionMutations.ts`
- 1 errors in `src/hooks/transactions/useTransactionBalanceUpdater.ts`
- 1 errors in `src/hooks/transactions/helpers/useLedgerOperations.ts`
- 1 errors in `src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts`
- 1 errors in `src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts`
- 1 errors in `src/hooks/sync/useSyncHealthIndicator.ts`
- 1 errors in `src/hooks/sync/useManualSync.ts`
- 1 errors in `src/hooks/sharing/useBudgetJoining.ts`
- 1 errors in `src/hooks/settings/__tests__/useTransactionArchiving.test.ts`
- 1 errors in `src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts`
- 1 errors in `src/hooks/savings/useSavingsGoals/savingsQueries.ts`
- 1 errors in `src/hooks/savings/__tests__/useSavingsGoalsActions.test.ts`
- 1 errors in `src/hooks/notifications/__tests__/useFirebaseMessaging.test.ts`
- 1 errors in `src/hooks/mobile/__tests__/useSlideUpModal.test.ts`
- 1 errors in `src/hooks/layout/useLayoutData.ts`
- 1 errors in `src/hooks/debts/useDebtModalLogic.ts`
- 1 errors in `src/hooks/dashboard/useMainDashboard.ts`
- 1 errors in `src/hooks/common/useTransactionsCompat.ts`
- 1 errors in `src/hooks/common/useRouterPageDetection.ts`
- 1 errors in `src/hooks/common/useImportData.ts`
- 1 errors in `src/hooks/common/useConnectionManager/useConnectionOperations.ts`
- 1 errors in `src/hooks/common/useActivityLogger.ts`
- 1 errors in `src/hooks/budgeting/useBudgetData/paycheckMutations.ts`
- 1 errors in `src/hooks/budgeting/autofunding/utils/useRuleSummaries.ts`
- 1 errors in `src/hooks/budgeting/autofunding/utils/useRuleStatistics.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingData.ts`
- 1 errors in `src/hooks/budgeting/autofunding/queries/useRuleFilters.ts`
- 1 errors in `src/hooks/budgeting/autofunding/queries/useExecutableRules.ts`
- 1 errors in `src/hooks/budgeting/__tests__/useEnvelopesQuery.test.ts`
- 1 errors in `src/hooks/bills/useBills/index.ts`
- 1 errors in `src/hooks/bills/useBillValidation.ts`
- 1 errors in `src/hooks/auth/useSecurityManagerUI.ts`
- 1 errors in `src/hooks/auth/useAuthenticationManager.ts`
- 1 errors in `src/hooks/auth/useAuthCompatibility.ts`
- 1 errors in `src/hooks/auth/queries/usePasswordValidation.ts`
- 1 errors in `src/hooks/auth/mutations/__tests__/useJoinBudgetMutation.test.ts`
- 1 errors in `src/hooks/auth/__tests__/useUserSetup.test.ts`
- 1 errors in `src/hooks/auth/__tests__/useAuthQueries.test.ts`
- 1 errors in `src/hooks/analytics/utils/pdfGeneratorUtils.ts`
- 1 errors in `src/hooks/analytics/queries/usePaycheckTrendsQuery.ts`
- 1 errors in `src/hooks/accounts/useSupplementalAccounts.ts`
- 1 errors in `src/domain/schemas/version-control.ts`
- 1 errors in `src/domain/schemas/transaction.ts`
- 1 errors in `src/domain/schemas/bill.ts`
- 1 errors in `src/domain/schemas/backup.ts`
- 1 errors in `src/db/budgetDb.ts`
- 1 errors in `src/components/ui/LoadingSpinner.tsx`
- 1 errors in `src/components/ui/EditableBalance.tsx`
- 1 errors in `src/components/ui/EditLockIndicator.tsx`
- 1 errors in `src/components/ui/ConnectionDisplay.tsx`
- 1 errors in `src/components/transactions/components/DeleteConfirmation.tsx`
- 1 errors in `src/components/transactions/TransactionFormSections.tsx`
- 1 errors in `src/components/sync/health/SyncStatusIndicator.tsx`
- 1 errors in `src/components/sync/health/SyncHealthDetails.tsx`
- 1 errors in `src/components/sync/SyncHealthDashboard.tsx`
- 1 errors in `src/components/settings/sections/DataManagementSection.tsx`
- 1 errors in `src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx`
- 1 errors in `src/components/settings/TransactionArchiving.tsx`
- 1 errors in `src/components/savings/DistributeModal.tsx`
- 1 errors in `src/components/savings/AddEditGoalModal.tsx`
- 1 errors in `src/components/pwa/OfflineStatusIndicator.tsx`
- 1 errors in `src/components/pages/MainDashboard.tsx`
- 1 errors in `src/components/onboarding/hooks/useTutorialSteps.ts`
- 1 errors in `src/components/modals/CorruptionRecoveryModal.tsx`
- 1 errors in `src/components/mobile/SlideUpModal.tsx`
- 1 errors in `src/components/mobile/BottomNavItem.tsx`
- 1 errors in `src/components/layout/SummaryCards.tsx`
- 1 errors in `src/components/history/BudgetHistoryViewer.tsx`
- 1 errors in `src/components/feedback/hooks/useBugReportState.ts`
- 1 errors in `src/components/debt/modals/DebtFormFields.tsx`
- 1 errors in `src/components/debt/modals/AddDebtModal.tsx`
- 1 errors in `src/components/dashboard/AccountBalanceOverview.tsx`
- 1 errors in `src/components/charts/DistributionPieChart.tsx`
- 1 errors in `src/components/budgeting/paycheck/PaycheckHistory.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeSummary.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeHistoryModal.tsx`
- 1 errors in `src/components/budgeting/PaycheckProcessor.tsx`
- 1 errors in `src/components/budgeting/EnvelopeGrid.tsx`
- 1 errors in `src/components/budgeting/CreateEnvelopeModal.tsx`
- 1 errors in `src/components/bills/BulkUpdateBillRow.tsx`
- 1 errors in `src/components/bills/BillTableBulkActions.tsx`
- 1 errors in `src/components/bills/BillManager.tsx`
- 1 errors in `src/components/bills/BillFormFields.tsx`
- 1 errors in `src/components/automation/tabs/RulesTab.tsx`
- 1 errors in `src/components/automation/steps/config/SplitRemainderConfig.tsx`
- 1 errors in `src/components/automation/steps/RuleConfigurationStep.tsx`
- 1 errors in `src/components/auth/KeyManagementSettings.tsx`
- 1 errors in `src/components/accounts/form/AccountColorAndSettings.tsx`
- 1 errors in `src/components/accounts/AccountsGrid.tsx`
- 1 errors in `src/components/accounts/AccountFormModal.tsx`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 1243 | `TS2339` |
| 342 | `TS2345` |
| 111 | `TS2322` |
| 80 | `TS2554` |
| 72 | `TS6133` |
| 54 | `TS2551` |
| 24 | `TS2353` |
| 21 | `TS2352` |
| 17 | `TS2307` |
| 16 | `TS2739` |
| 16 | `TS2363` |
| 16 | `TS2362` |
| 9 | `TS2741` |
| 9 | `TS2365` |
| 8 | `TS2305` |
| 7 | `TS2708` |
| 6 | `TS2769` |
| 5 | `TS2740` |
| 5 | `TS2698` |
| 5 | `TS2613` |
| 3 | `TS6196` |
| 3 | `TS4104` |
| 3 | `TS2614` |
| 3 | `TS2538` |
| 3 | `TS2349` |
| 2 | `TS2719` |
| 2 | `TS2419` |
| 2 | `TS1117` |
| 1 | `TS2794` |
| 1 | `TS2559` |
| 1 | `TS2456` |
| 1 | `TS2448` |
| 1 | `TS2356` |

### Detailed Type Error Report
```
src/components/accounts/AccountFormModal.tsx(127,11): error TS2322: Type '{ editingAccount: any; onClose: any; isLocked: any; isOwnLock: any; _lock: any; breakLock: any; lockLoading: any; }' is not assignable to type 'IntrinsicAttributes & AccountModalHeaderProps'.
  Property '_lock' does not exist on type 'IntrinsicAttributes & AccountModalHeaderProps'.
src/components/accounts/AccountsGrid.tsx(35,13): error TS2322: Type '{ key: string; account: unknown; typeInfo: { value: string; label: string; icon: string; }; _daysUntilExpiration: number; expirationStatus: { text: string; color: string; }; showBalances: any; onEdit: any; onDelete: any; onStartTransfer: any; }' is not assignable to type 'IntrinsicAttributes & { account: any; typeInfo: any; expirationStatus: any; showBalances: any; onEdit: any; onDelete: any; onStartTransfer: any; }'.
  Property '_daysUntilExpiration' does not exist on type 'IntrinsicAttributes & { account: any; typeInfo: any; expirationStatus: any; showBalances: any; onEdit: any; onDelete: any; onStartTransfer: any; }'.
src/components/accounts/form/AccountColorAndSettings.tsx(29,9): error TS2322: Type '{ id: string; checked: any; onCheckedChange: (checked: any) => any; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & CheckboxProps & RefAttributes<HTMLInputElement>'.
  Property 'onCheckedChange' does not exist on type 'IntrinsicAttributes & CheckboxProps & RefAttributes<HTMLInputElement>'.
src/components/analytics/CategoryAdvancedTab.tsx(45,17): error TS2322: Type 'unknown' is not assignable to type 'Key'.
src/components/analytics/CategoryAdvancedTab.tsx(48,71): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/analytics/ChartsAndAnalytics.tsx(145,9): error TS2322: Type 'Transaction[]' is not assignable to type 'import("violet-vault/src/types/analytics").Transaction[]'.
  Type 'Transaction' is missing the following properties from type 'Transaction': id, description, type
src/components/analytics/ChartsAndAnalytics.tsx(146,9): error TS2322: Type 'FinancialMetrics' is not assignable to type 'AnalyticsMetrics'.
  Index signature for type 'string' is missing in type 'FinancialMetrics'.
src/components/auth/KeyManagementSettings.tsx(159,11): error TS2739: Type '{}' is missing the following properties from type '{ success: boolean; importResult: { budgetId: string; fingerprint: string; exportedAt?: string; deviceFingerprint?: string; }; loginResult: { success: boolean; error?: string; suggestion?: string; code?: string; canCreateNew?: boolean; data?: unknown; }; }': success, importResult, loginResult
src/components/auth/UserIndicator.tsx(7,31): error TS2339: Property 'currentUser' does not exist on type '{}'.
src/components/auth/UserIndicator.tsx(7,44): error TS2339: Property 'onUserChange' does not exist on type '{}'.
src/components/auth/UserIndicator.tsx(7,58): error TS2339: Property 'onUpdateProfile' does not exist on type '{}'.
src/components/automation/AutoFundingDashboard.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/automation/AutoFundingDashboard.tsx(97,63): error TS2554: Expected 0-1 arguments, but got 2.
src/components/automation/AutoFundingRuleBuilder.tsx(28,13): error TS2322: Type '"success"' is not assignable to type 'ButtonColor'.
src/components/automation/AutoFundingRuleBuilder.tsx(98,15): error TS2322: Type '"ghost"' is not assignable to type 'ButtonVariant'.
src/components/automation/AutoFundingRuleBuilder.tsx(105,12): error TS2741: Property 'onStepChange' is missing in type '{ currentStep: any; }' but required in type '{ currentStep: any; onStepChange: any; }'.
src/components/automation/AutoFundingRuleBuilder.tsx(162,46): error TS2339: Property 'name' does not exist on type '{}'.
src/components/automation/AutoFundingRuleBuilder.tsx(165,46): error TS2339: Property 'type' does not exist on type '{}'.
src/components/automation/AutoFundingRuleBuilder.tsx(194,37): error TS2345: Argument of type '{ id: string; name: string; description: string; type: string; trigger: string; priority: number; enabled: boolean; createdAt: string; lastExecuted: any; executionCount: number; config: { sourceType: string; ... 7 more ...; scheduleConfig: {}; }; }' is not assignable to parameter of type 'Partial<AutoFundingRule>'.
  The types of 'config.sourceType' are incompatible between these types.
    Type 'string' is not assignable to type '"envelope" | "income" | "unassigned"'.
src/components/automation/AutoFundingRuleBuilder.tsx(210,37): error TS2345: Argument of type '{ id: string; name: string; description: string; type: string; trigger: string; priority: number; enabled: boolean; createdAt: string; lastExecuted: any; executionCount: number; config: { sourceType: string; ... 7 more ...; scheduleConfig: {}; }; }' is not assignable to parameter of type 'Partial<AutoFundingRule>'.
  The types of 'config.sourceType' are incompatible between these types.
    Type 'string' is not assignable to type '"envelope" | "income" | "unassigned"'.
src/components/automation/steps/config/SplitRemainderConfig.tsx(28,23): error TS2322: Type '{ checked: any; onCheckedChange: () => any; }' is not assignable to type 'IntrinsicAttributes & CheckboxProps & RefAttributes<HTMLInputElement>'.
  Property 'onCheckedChange' does not exist on type 'IntrinsicAttributes & CheckboxProps & RefAttributes<HTMLInputElement>'.
src/components/automation/steps/RuleConfigurationStep.tsx(37,11): error TS2322: Type '{ ruleData: any; updateConfig: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }' is not assignable to type 'IntrinsicAttributes & { ruleData: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }'.
  Property 'updateConfig' does not exist on type 'IntrinsicAttributes & { ruleData: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }'.
src/components/automation/tabs/RulesTab.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/bills/BillFormFields.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/bills/BillManager.tsx(98,5): error TS2322: Type 'Set<unknown>' is not assignable to type 'Set<string>'.
  Type 'unknown' is not assignable to type 'string'.
src/components/bills/BillManagerModals.tsx(53,11): error TS2322: Type '{ isOpen: any; onClose: any; editingBill: any; availableEnvelopes: any; onAddBill: any; onUpdateBill: any; onDeleteBill: any; onError: any; }' is not assignable to type 'IntrinsicAttributes & { isOpen: any; onClose: any; onAddBill: any; onUpdateBill: any; onDeleteBill: any; onError: any; editingBill?: any; _forceMobileMode?: boolean; }'.
  Property 'availableEnvelopes' does not exist on type 'IntrinsicAttributes & { isOpen: any; onClose: any; onAddBill: any; onUpdateBill: any; onDeleteBill: any; onError: any; editingBill?: any; _forceMobileMode?: boolean; }'.
src/components/bills/BillManagerModals.tsx(68,11): error TS2322: Type '{ isOpen: any; onClose: () => any; selectedBills: any[]; availableEnvelopes: any; onUpdateBills: any; onError: any; }' is not assignable to type 'IntrinsicAttributes & { isOpen: any; onClose: any; selectedBills?: any[]; onUpdateBills: any; onError: any; }'.
  Property 'availableEnvelopes' does not exist on type 'IntrinsicAttributes & { isOpen: any; onClose: any; selectedBills?: any[]; onUpdateBills: any; onError: any; }'.
src/components/bills/BillManagerModals.tsx(81,11): error TS2322: Type '{ isOpen: any; onClose: () => void; discoveredBills: any; existingBills: any; availableEnvelopes: any; onAddBills: any; onError: any; }' is not assignable to type 'IntrinsicAttributes & BillDiscoveryModalProps'.
  Property 'existingBills' does not exist on type 'IntrinsicAttributes & BillDiscoveryModalProps'.
src/components/bills/BillManagerModals.tsx(107,11): error TS2322: Type '{ isOpen: boolean; onClose: () => any; objectId: any; objectType: string; title: string; }' is not assignable to type 'IntrinsicAttributes & ObjectHistoryViewerProps'.
  Property 'isOpen' does not exist on type 'IntrinsicAttributes & ObjectHistoryViewerProps'.
src/components/bills/BillTableBulkActions.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/bills/BulkUpdateBillRow.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/budgeting/CreateEnvelopeModal.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(145,9): error TS2322: Type '{ formData: { envelopeType: string; color: string; autoAllocate: boolean; billId?: string; }; errors: Record<string, string>; onUpdateField: (field: string, value: unknown) => void; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & { formData: any; onUpdateField: any; errors?: {}; canEdit?: boolean; }'.
  Property 'disabled' does not exist on type 'IntrinsicAttributes & { formData: any; onUpdateField: any; errors?: {}; canEdit?: boolean; }'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(154,9): error TS2322: Type '{ formData: { envelopeType: string; color: string; autoAllocate: boolean; billId?: string; }; errors: Record<string, string>; calculatedAmounts: unknown; onUpdateField: (field: string, value: unknown) => void; disabled: boolean; showBiweeklyPreview: boolean; }' is not assignable to type 'IntrinsicAttributes & { formData: any; onUpdateField: any; errors?: {}; calculatedAmounts?: {}; canEdit?: boolean; }'.
  Property 'disabled' does not exist on type 'IntrinsicAttributes & { formData: any; onUpdateField: any; errors?: {}; calculatedAmounts?: {}; canEdit?: boolean; }'.
src/components/budgeting/EditEnvelopeModal.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/budgeting/EditEnvelopeModal.tsx(126,13): error TS2322: Type 'unknown' is not assignable to type 'boolean'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(27,20): error TS2339: Property 'name' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(32,17): error TS2339: Property 'name' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(37,21): error TS2339: Property 'name' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(50,20): error TS2339: Property 'category' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(60,17): error TS2339: Property 'category' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(65,21): error TS2339: Property 'category' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(86,17): error TS2339: Property 'description' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(91,21): error TS2339: Property 'description' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(10,39): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(94,66): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(106,10): error TS2741: Property 'icon' is missing in type '{ label: string; value: any; onChange: (e: any) => any; error: any; canEdit: boolean; required: true; hint: string; }' but required in type '{ label: any; value: any; onChange: any; error: any; canEdit: any; hint: any; icon: any; required: any; }'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(110,25): error TS2339: Property 'monthlyAmount' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(114,31): error TS2339: Property 'biweeklyAllocation' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(115,49): error TS2339: Property 'biweeklyAllocation' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(120,10): error TS2739: Type '{ label: string; value: any; onChange: (e: any) => any; error: any; canEdit: boolean; }' is missing the following properties from type '{ label: any; value: any; onChange: any; error: any; canEdit: any; hint: any; icon: any; required: any; }': hint, icon, required
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(124,25): error TS2339: Property 'currentBalance' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(130,10): error TS2741: Property 'hint' is missing in type '{ label: string; icon: string; value: any; onChange: (e: any) => any; error: any; canEdit: boolean; required: true; }' but required in type '{ label: any; value: any; onChange: any; error: any; canEdit: any; hint: any; icon: any; required: any; }'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(135,25): error TS2339: Property 'targetAmount' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(145,25): error TS2339: Property 'frequency' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeHistoryModal.tsx(48,15): error TS2322: Type '{ objectType: string; objectId: any; objectName: any; showModal: boolean; }' is not assignable to type 'IntrinsicAttributes & ObjectHistoryViewerProps'.
  Property 'showModal' does not exist on type 'IntrinsicAttributes & ObjectHistoryViewerProps'.
src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx(38,63): error TS2339: Property 'balanceLabel' does not exist on type '{ primaryStatus: string; secondaryStatus: string; fundingProgress: string; }'.
src/components/budgeting/envelope/EnvelopeSummary.tsx(6,45): error TS2322: Type '{ totals: any; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes & { totals?: EnvelopeTotals; }'.
  Property 'unassignedCash' does not exist on type 'IntrinsicAttributes & { totals?: EnvelopeTotals; }'.
src/components/budgeting/EnvelopeGrid.tsx(227,7): error TS2739: Type '{}' is missing the following properties from type 'FilterOptions': timeRange, showEmpty, sortBy, envelopeType
src/components/budgeting/EnvelopeSystem.tsx(5,10): error TS2614: Module '"../../hooks/bills/useBills"' has no exported member 'useBills'. Did you mean to use 'import useBills from "../../hooks/bills/useBills"' instead?
src/components/budgeting/EnvelopeSystem.tsx(7,10): error TS2305: Module '"../../constants/categories"' has no exported member 'FREQUENCY_MULTIPLIERS'.
src/components/budgeting/EnvelopeSystem.tsx(7,33): error TS2305: Module '"../../constants/categories"' has no exported member 'BIWEEKLY_MULTIPLIER'.
src/components/budgeting/paycheck/PaycheckHistory.tsx(92,47): error TS2554: Expected 0 arguments, but got 1.
src/components/budgeting/PaycheckProcessor.tsx(63,9): error TS2322: Type '{ paycheckHistory: any[]; onDeletePaycheck: (paycheck: any) => Promise<void>; deletingPaycheckId: any; }' is not assignable to type 'IntrinsicAttributes & { paycheckHistory?: any[]; paycheckStats: any; onSelectPaycheck?: () => void; }'.
  Property 'onDeletePaycheck' does not exist on type 'IntrinsicAttributes & { paycheckHistory?: any[]; paycheckStats: any; onSelectPaycheck?: () => void; }'. Did you mean 'onSelectPaycheck'?
src/components/budgeting/SmartEnvelopeSuggestions.tsx(36,7): error TS2322: Type '"secondary" | "ghost"' is not assignable to type 'ButtonVariant'.
  Type '"ghost"' is not assignable to type 'ButtonVariant'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(59,7): error TS2322: Type '"ghost"' is not assignable to type 'ButtonVariant'.
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
src/components/debt/DebtDashboard.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/debt/DebtDashboard.tsx(51,24): error TS2322: Type '{ totalDebt: number; totalMonthlyPayments: number; averageInterestRate: number; debtsByType: {}; totalInterestPaid: number; activeDebtCount: number; totalDebtCount: number; dueSoonAmount: number; dueSoonCount: number; }' is not assignable to type 'DebtStats'.
  Types of property 'debtsByType' are incompatible.
    Type '{}' is missing the following properties from type 'Record<DebtType, DebtAccount[]>': credit_card, mortgage, other, auto, and 4 more.
src/components/debt/DebtDashboard.tsx(68,15): error TS2322: Type '{ totalDebt: number; totalMonthlyPayments: number; averageInterestRate: number; debtsByType: {}; totalInterestPaid: number; activeDebtCount: number; totalDebtCount: number; dueSoonAmount: number; dueSoonCount: number; }' is not assignable to type 'DebtStats'.
  Types of property 'debtsByType' are incompatible.
    Type '{}' is missing the following properties from type 'Record<DebtType, DebtAccount[]>': credit_card, mortgage, other, auto, and 4 more.
src/components/debt/DebtDashboardComponents.tsx(54,10): error TS2739: Type '{ filterOptions: FilterOptions; setFilterOptions: (options: FilterOptions) => void; }' is missing the following properties from type '{ filterOptions: any; setFilterOptions: any; debtTypes: any; debtsByType: any; }': debtTypes, debtsByType
src/components/debt/DebtDashboardComponents.tsx(74,15): error TS2322: Type 'DebtAccount[]' is not assignable to type 'Debt[]'.
  Type 'DebtAccount' is not assignable to type 'Debt'.
    Index signature for type 'string' is missing in type 'DebtAccount'.
src/components/debt/DebtDashboardComponents.tsx(75,15): error TS2322: Type '(debt: DebtAccount) => void' is not assignable to type '(debt: Debt) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/debt/DebtDashboardComponents.tsx(76,15): error TS2322: Type '(debt: DebtAccount, amount: number) => void' is not assignable to type '(debt: Debt, amount: number) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/debt/modals/AddDebtModal.tsx(74,11): error TS2322: Type '{ formData: { name: string; creditor: string; type: "personal"; currentBalance: string; originalBalance: string; interestRate: string; minimumPayment: string; paymentFrequency: "monthly"; paymentDueDate: string; ... 5 more ...; newEnvelopeName: string; }; ... 12 more ...; debtMetrics: DebtMetrics; }' is not assignable to type 'IntrinsicAttributes & { formData: any; setFormData: any; errors: any; canEdit: any; isEditMode: any; isSubmitting: any; handleFormSubmit: any; onClose: any; bills: any; billsLoading: any; }'.
  Property 'envelopes' does not exist on type 'IntrinsicAttributes & { formData: any; setFormData: any; errors: any; canEdit: any; isEditMode: any; isSubmitting: any; handleFormSubmit: any; onClose: any; bills: any; billsLoading: any; }'.
src/components/debt/modals/DebtDetailModal.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/debt/modals/DebtDetailModal.tsx(49,32): error TS2554: Expected 1 arguments, but got 6.
src/components/debt/modals/DebtDetailModalComponents.tsx(14,61): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/debt/modals/DebtDetailModalComponents.tsx(16,11): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/debt/modals/DebtDetailModalComponents.tsx(16,29): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/debt/modals/DebtFormFields.tsx(68,13): error TS2322: Type '{ checked: any; onCheckedChange: (checked: any) => any; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & CheckboxProps & RefAttributes<HTMLInputElement>'.
  Property 'onCheckedChange' does not exist on type 'IntrinsicAttributes & CheckboxProps & RefAttributes<HTMLInputElement>'.
src/components/debt/modals/DebtFormSections.tsx(53,23): error TS2339: Property 'label' does not exist on type 'DebtTypeConfig'.
src/components/debt/modals/DebtFormSections.tsx(206,32): error TS2339: Property 'map' does not exist on type '{ readonly WEEKLY: "weekly"; readonly BIWEEKLY: "biweekly"; readonly MONTHLY: "monthly"; readonly QUARTERLY: "quarterly"; readonly ANNUALLY: "annually"; }'.
src/components/debt/ui/DebtFilters.tsx(70,51): error TS2538: Type 'unknown' cannot be used as an index type.
src/components/debt/ui/DebtFilters.tsx(71,45): error TS2538: Type 'unknown' cannot be used as an index type.
src/components/debt/ui/DebtFilters.tsx(73,29): error TS2322: Type 'unknown' is not assignable to type 'Key'.
src/components/debt/ui/DebtFilters.tsx(73,40): error TS2322: Type 'unknown' is not assignable to type 'string | number | readonly string[]'.
src/components/debt/ui/DebtFilters.tsx(116,19): error TS2322: Type '{ id: string; checked: any; onCheckedChange: (checked: any) => void; }' is not assignable to type 'IntrinsicAttributes & CheckboxProps & RefAttributes<HTMLInputElement>'.
  Property 'onCheckedChange' does not exist on type 'IntrinsicAttributes & CheckboxProps & RefAttributes<HTMLInputElement>'.
src/components/debt/ui/DebtList.tsx(33,11): error TS2322: Type '{ key: string; debt: Debt; onClick: () => void; _onRecordPayment: (debt: Debt, amount: number) => void; }' is not assignable to type 'IntrinsicAttributes & DebtCardProps'.
  Property '_onRecordPayment' does not exist on type 'IntrinsicAttributes & DebtCardProps'.
src/components/debt/ui/DebtList.tsx(98,45): error TS2339: Property 'name' does not exist on type '{ bgColor: string; textColor: string; }'.
src/components/debt/ui/DebtList.tsx(113,77): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/debt/ui/DebtList.tsx(120,32): error TS2339: Property 'display' does not exist on type '{}'.
src/components/debt/ui/DebtList.tsx(128,19): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/debt/ui/DebtList.tsx(134,71): error TS2339: Property 'label' does not exist on type '{}'.
src/components/debt/ui/DebtList.tsx(136,36): error TS2339: Property 'hasIcon' does not exist on type '{}'.
src/components/debt/ui/DebtList.tsx(138,40): error TS2339: Property 'type' does not exist on type '{}'.
src/components/debt/ui/DebtList.tsx(145,40): error TS2339: Property 'value' does not exist on type '{}'.
src/components/debt/ui/DebtList.tsx(156,28): error TS2339: Property 'hasRelationships' does not exist on type 'any[]'.
src/components/debt/ui/DebtList.tsx(158,32): error TS2339: Property 'items' does not exist on type 'any[]'.
src/components/feedback/hooks/useBugReportState.ts(102,7): error TS2352: Conversion of type '{ screenshot: string; previewScreenshot: string; isSubmitting: boolean; submitError: string; submitResult: SubmitResult; diagnostics: unknown; openModal: () => Promise<void>; ... 29 more ...; isModalOpen: boolean; }' to type 'BugReportHookReturn' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Property 'setScreenshot' is missing in type '{ screenshot: string; previewScreenshot: string; isSubmitting: boolean; submitError: string; submitResult: SubmitResult; diagnostics: unknown; openModal: () => Promise<void>; ... 29 more ...; isModalOpen: boolean; }' but required in type 'BugReportHookReturn'.
src/components/history/BudgetHistoryViewer.tsx(72,43): error TS2322: Type 'string | Error' is not assignable to type 'ReactNode'.
  Type 'Error' is not assignable to type 'ReactNode'.
src/components/history/ObjectHistoryViewer.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/history/ObjectHistoryViewer.tsx(38,11): error TS2339: Property 'data' does not exist on type '{ commits: any; isLoading: boolean; isError: boolean; error: Error; createCommit: UseMutateFunction<any, Error, void, unknown>; createCommitAsync: UseMutateAsyncFunction<any, Error, void, unknown>; refetch: (options?: RefetchOptions) => Promise<...>; }'.
src/components/layout/SummaryCards.tsx(46,44): error TS2339: Property 'reduce' does not exist on type 'unknown'.
src/components/layout/ViewRenderer.tsx(217,9): error TS2322: Type 'Envelope[]' is not assignable to type 'Record<string, unknown>[]'.
  Type 'Envelope' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type 'Envelope'.
src/components/layout/ViewRenderer.tsx(220,9): error TS2322: Type 'unknown' is not assignable to type '() => void'.
  Type '{}' provides no match for the signature '(): void'.
src/components/layout/ViewRenderer.tsx(221,9): error TS2322: Type 'unknown' is not assignable to type '() => void'.
  Type '{}' provides no match for the signature '(): void'.
src/components/mobile/BottomNavItem.tsx(10,20): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
src/components/mobile/ResponsiveModal.tsx(81,27): error TS2339: Property 'isOpen' does not exist on type '{}'.
src/components/mobile/ResponsiveModal.tsx(84,25): error TS2339: Property 'isOpen' does not exist on type '{}'.
src/components/mobile/ResponsiveModal.tsx(85,26): error TS2339: Property 'onClose' does not exist on type '{}'.
src/components/mobile/ResponsiveModal.tsx(86,24): error TS2339: Property 'title' does not exist on type '{}'.
src/components/mobile/SlideUpModal.tsx(350,9): error TS2322: Type '{ onTouchStart: (_event: any) => void; onClick: (originalHandler: any) => (event: any) => void; className: any; }' is not assignable to type '{ onClick: (handler?: () => void) => () => void; onTouchStart: () => void; className: string; }'.
  The types returned by 'onClick(...)' are incompatible between these types.
    Type '(event: any) => void' is not assignable to type '() => void'.
      Target signature provides too few arguments. Expected 1 or more, but got 0.
src/components/modals/CorruptionRecoveryModal.tsx(176,6): error TS2741: Property 'onConfirm' is missing in type '{ children: ReactElement<unknown, string | JSXElementConstructor<any>>; isOpen: boolean; onCancel: () => void; }' but required in type '{ isOpen?: boolean; title?: string; message?: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean; isLoading?: boolean; icon?: any; onConfirm: any; onCancel: any; children: any; }'.
src/components/modals/UnassignedCashModal.tsx(219,6): error TS2339: Property 'envelope' does not exist on type '{}'.
src/components/modals/UnassignedCashModal.tsx(219,16): error TS2339: Property 'distributionAmount' does not exist on type '{}'.
src/components/modals/UnassignedCashModal.tsx(219,36): error TS2339: Property 'updateDistribution' does not exist on type '{}'.
src/components/modals/UnassignedCashModal.tsx(219,56): error TS2339: Property 'isProcessing' does not exist on type '{}'.
src/components/modals/UnassignedCashModal.tsx(219,70): error TS2339: Property 'bills' does not exist on type '{}'.
src/components/modals/UnassignedCashModal.tsx(309,28): error TS2365: Operator '>' cannot be applied to types 'unknown' and 'number'.
src/components/modals/UnassignedCashModal.tsx(310,29): error TS2365: Operator '>' cannot be applied to types 'unknown' and 'number'.
src/components/modals/UnassignedCashModal.tsx(324,11): error TS2322: Type 'unknown' is not assignable to type 'number'.
src/components/modals/UnassignedCashModal.tsx(360,19): error TS2322: Type '{ key: string; envelope: Envelope; distributionAmount: any; updateDistribution: (envelopeId: string, amount: string | number) => void; isProcessing: boolean; bills: any[]; }' is not assignable to type 'IntrinsicAttributes & object'.
  Property 'envelope' does not exist on type 'IntrinsicAttributes & object'.
src/components/modals/UnassignedCashModal.tsx(416,47): error TS2339: Property 'toFixed' does not exist on type 'unknown'.
src/components/modals/UnassignedCashModal.tsx(431,19): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/onboarding/EmptyStateHints.tsx(168,29): error TS2339: Property 'shouldShowHint' does not exist on type 'unknown'.
src/components/onboarding/EmptyStateHints.tsx(169,31): error TS2339: Property 'markStepComplete' does not exist on type 'unknown'.
src/components/onboarding/EmptyStateHints.tsx(170,26): error TS2339: Property 'preferences' does not exist on type 'unknown'.
src/components/onboarding/hooks/useTutorialControls.ts(15,63): error TS2339: Property 'endTutorialStep' does not exist on type 'unknown'.
src/components/onboarding/hooks/useTutorialControls.ts(16,64): error TS2339: Property 'markStepComplete' does not exist on type 'unknown'.
src/components/onboarding/hooks/useTutorialControls.ts(17,61): error TS2339: Property 'setPreference' does not exist on type 'unknown'.
src/components/onboarding/hooks/useTutorialSteps.ts(12,65): error TS2339: Property 'startTutorialStep' does not exist on type 'unknown'.
src/components/onboarding/OnboardingProgress.tsx(155,28): error TS2339: Property 'isOnboarded' does not exist on type 'unknown'.
src/components/onboarding/OnboardingProgress.tsx(156,33): error TS2339: Property 'tutorialProgress' does not exist on type 'unknown'.
src/components/onboarding/OnboardingProgress.tsx(157,28): error TS2339: Property 'getProgress' does not exist on type 'unknown'.
src/components/onboarding/OnboardingProgress.tsx(158,28): error TS2339: Property 'preferences' does not exist on type 'unknown'.
src/components/onboarding/OnboardingProgress.tsx(159,30): error TS2339: Property 'setPreference' does not exist on type 'unknown'.
src/components/onboarding/OnboardingProgress.tsx(254,17): error TS2740: Type '{}' is missing the following properties from type 'StepData[]': length, pop, push, concat, and 29 more.
src/components/pages/MainDashboard.tsx(61,41): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'any[]'.
  Type '{}' is missing the following properties from type 'any[]': length, pop, push, concat, and 29 more.
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
src/components/savings/SavingsGoalCard.tsx(15,22): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/savings/SavingsGoalCard.tsx(15,31): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/security/LockScreen.tsx(90,29): error TS2339: Property 'isValid' does not exist on type 'unknown'.
src/components/security/LockScreen.tsx(96,9): error TS2554: Expected 1 arguments, but got 0.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(3,30): error TS2307: Cannot find module '../SecuritySettingsRefactored' or its corresponding type declarations.
src/components/settings/archiving/ArchivingPreviewResults.tsx(68,45): error TS2339: Property 'count' does not exist on type 'unknown'.
src/components/settings/archiving/ArchivingPreviewResults.tsx(68,55): error TS2339: Property 'count' does not exist on type 'unknown'.
src/components/settings/archiving/ArchivingPreviewResults.tsx(80,33): error TS2339: Property 'count' does not exist on type 'unknown'.
src/components/settings/archiving/ArchivingPreviewResults.tsx(84,43): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/components/settings/sections/DataManagementSection.tsx(227,26): error TS2322: Type '(config?: {}) => Promise<unknown>' is not assignable to type '(options: { title: string; message: string; confirmText: string; cancelText: string; }) => Promise<boolean>'.
  Type 'Promise<unknown>' is not assignable to type 'Promise<boolean>'.
    Type 'unknown' is not assignable to type 'boolean'.
src/components/settings/sections/SyncDebugToolsSection.tsx(66,46): error TS2345: Argument of type 'ValidationResults' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'ValidationResults'.
src/components/settings/sections/SyncDebugToolsSection.tsx(86,47): error TS2339: Property 'detectLocalDataDebug' does not exist on type 'Window & typeof globalThis'.
src/components/settings/sections/SyncDebugToolsSection.tsx(109,47): error TS2339: Property 'hasLocalDataDebug' does not exist on type 'Window & typeof globalThis'.
src/components/settings/sections/SyncDebugToolsSection.tsx(140,49): error TS2551: Property 'safeCloudDataReset' does not exist on type 'Window & typeof globalThis'. Did you mean 'forceCloudDataReset'?
src/components/settings/TransactionArchiving.tsx(3,37): error TS2307: Cannot find module '../../hooks/transactions/useTransactionArchiving' or its corresponding type declarations.
src/components/sync/ActivityBanner.tsx(41,39): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/sync/ActivityBanner.tsx(41,71): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/sync/ActivityBanner.tsx(128,39): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/sync/ActivityBanner.tsx(128,45): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/sync/health/SyncHealthDetails.tsx(139,17): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/sync/health/SyncStatusIndicator.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/sync/ManualSyncControls.tsx(4,27): error TS2307: Cannot find module '../../hooks/common/useManualSync' or its corresponding type declarations.
src/components/sync/ManualSyncControls.tsx(51,47): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/components/sync/ManualSyncControls.tsx(64,49): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/components/sync/ManualSyncControls.tsx(77,45): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/components/sync/ManualSyncControls.tsx(142,17): error TS2322: Type '"ghost"' is not assignable to type 'ButtonVariant'.
src/components/sync/ManualSyncControls.tsx(175,13): error TS2322: Type '"outline"' is not assignable to type 'ButtonVariant'.
src/components/sync/ManualSyncControls.tsx(192,13): error TS2322: Type '"outline"' is not assignable to type 'ButtonVariant'.
src/components/sync/ManualSyncControls.tsx(209,13): error TS2322: Type '"default"' is not assignable to type 'ButtonVariant'.
src/components/sync/SyncHealthDashboard.tsx(48,11): error TS2339: Property 'exportBackup' does not exist on type '{ exportData: () => Promise<void>; }'.
src/components/transactions/components/DeleteConfirmation.tsx(20,11): error TS2322: Type 'string' is not assignable to type 'number'.
src/components/transactions/TransactionFormSections.tsx(324,11): error TS2322: Type '{ id: string; checked: boolean; onCheckedChange: (checked: any) => void; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & CheckboxProps & RefAttributes<HTMLInputElement>'.
  Property 'onCheckedChange' does not exist on type 'IntrinsicAttributes & CheckboxProps & RefAttributes<HTMLInputElement>'.
src/components/transactions/TransactionLedger.tsx(4,32): error TS2614: Module '"../ui/StandardFilters"' has no exported member 'FilterConfig'. Did you mean to use 'import FilterConfig from "../ui/StandardFilters"' instead?
src/components/transactions/TransactionLedger.tsx(127,9): error TS2322: Type 'Envelope[]' is not assignable to type 'import("violet-vault/src/types/finance").Envelope[]'.
  Type 'Envelope' is not assignable to type 'import("violet-vault/src/types/finance").Envelope'.
    Property 'currentBalance' is optional in type 'Envelope' but required in type 'Envelope'.
src/components/transactions/TransactionLedger.tsx(148,9): error TS4104: The type 'readonly ["Housing", "Transportation", "Insurance", "Bills & Utilities", "Subscriptions", "Food & Dining", "Entertainment", "Shopping", "Health & Medical", "Personal Care", ... 7 more ..., "Other"]' is 'readonly' and cannot be assigned to the mutable type 'any[]'.
src/components/transactions/TransactionLedger.tsx(175,9): error TS4104: The type 'readonly ["Housing", "Transportation", "Insurance", "Bills & Utilities", "Subscriptions", "Food & Dining", "Entertainment", "Shopping", "Health & Medical", "Personal Care", ... 7 more ..., "Other"]' is 'readonly' and cannot be assigned to the mutable type 'unknown[]'.
src/components/transactions/TransactionLedger.tsx(176,9): error TS2322: Type '(originalTransaction: any, splitTransactions: any) => Promise<void>' is not assignable to type '(allocations: unknown[]) => void'.
  Target signature provides too few arguments. Expected 2 or more, but got 1.
src/components/ui/ConnectionDisplay.tsx(220,4): error TS2741: Property 'onDisconnect' is missing in type '{ children: Element[]; title: any; icon: any; theme: any; }' but required in type '{ title?: string; icon: any; onDisconnect: any; children: any; isVisible?: boolean; className?: string; theme?: string; }'.
src/components/ui/EditableBalance.tsx(25,35): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/components/ui/EditLockIndicator.tsx(13,54): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/ui/Header.tsx(10,5): error TS2339: Property 'currentUser' does not exist on type '{}'.
src/components/ui/Header.tsx(11,5): error TS2339: Property 'onUserChange' does not exist on type '{}'.
src/components/ui/Header.tsx(12,5): error TS2339: Property 'onUpdateProfile' does not exist on type '{}'.
src/components/ui/Header.tsx(13,5): error TS2339: Property 'isLocalOnlyMode' does not exist on type '{}'.
src/components/ui/Header.tsx(14,5): error TS2339: Property 'onShowSettings' does not exist on type '{}'.
src/components/ui/Header.tsx(15,5): error TS2339: Property 'onShowDataSettings' does not exist on type '{}'.
src/components/ui/Header.tsx(51,19): error TS2322: Type '"high-quality"' is not assignable to type 'ImageRendering'.
src/components/ui/Header.tsx(77,15): error TS2322: Type '{ currentUser: any; onUserChange: any; onUpdateProfile: any; }' is not assignable to type 'IntrinsicAttributes & object'.
  Property 'currentUser' does not exist on type 'IntrinsicAttributes & object'.
src/components/ui/LoadingSpinner.tsx(4,32): error TS2339: Property 'message' does not exist on type '{}'.
src/contexts/__tests__/AuthContext.test.tsx(27,48): error TS2345: Argument of type '{ userName: string; }' is not assignable to parameter of type 'UserData'.
  Property 'userColor' is missing in type '{ userName: string; }' but required in type 'UserData'.
src/contexts/__tests__/AuthContext.test.tsx(470,39): error TS2345: Argument of type '{ userName: string; }' is not assignable to parameter of type 'UserData'.
  Property 'userColor' is missing in type '{ userName: string; }' but required in type 'UserData'.
src/contexts/__tests__/AuthContext.test.tsx(610,39): error TS2345: Argument of type '{ userName: string; }' is not assignable to parameter of type 'UserData'.
  Property 'userColor' is missing in type '{ userName: string; }' but required in type 'UserData'.
src/contexts/__tests__/AuthContext.test.tsx(611,39): error TS2345: Argument of type '{ userName: string; }' is not assignable to parameter of type 'UserData'.
  Property 'userColor' is missing in type '{ userName: string; }' but required in type 'UserData'.
src/contexts/__tests__/authUtils.test.ts(403,9): error TS2741: Property 'userColor' is missing in type '{ userName: string; }' but required in type 'UserData'.
src/contexts/__tests__/authUtils.test.ts(430,9): error TS2741: Property 'userColor' is missing in type '{ userName: string; }' but required in type 'UserData'.
src/db/__tests__/budgetDb.comprehensive.test.ts(12,3): error TS6196: 'PaycheckHistory' is declared but never used.
src/db/__tests__/budgetDb.comprehensive.test.ts(13,3): error TS6196: 'Debt' is declared but never used.
src/db/__tests__/budgetDb.comprehensive.test.ts(16,3): error TS6196: 'CacheEntry' is declared but never used.
src/db/__tests__/budgetDb.comprehensive.test.ts(716,20): error TS2322: Type 'string' is not assignable to type 'void[]'.
src/db/__tests__/budgetDb.comprehensive.test.ts(716,29): error TS2322: Type 'boolean' is not assignable to type 'void[]'.
src/db/__tests__/budgetDb.migrations.test.ts(5,32): error TS6133: 'beforeEach' is declared but its value is never read.
src/db/__tests__/budgetDb.migrations.test.ts(5,44): error TS6133: 'afterEach' is declared but its value is never read.
src/db/__tests__/budgetDb.migrations.test.ts(6,1): error TS6133: 'Dexie' is declared but its value is never read.
src/db/budgetDb.ts(652,57): error TS2345: Argument of type 'DatabaseStats' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'DatabaseStats'.
src/domain/schemas/audit-log.ts(20,14): error TS2554: Expected 2-3 arguments, but got 1.
src/domain/schemas/audit-log.ts(21,15): error TS2554: Expected 2-3 arguments, but got 1.
src/domain/schemas/backup.ts(32,15): error TS2554: Expected 2-3 arguments, but got 1.
src/domain/schemas/bill.ts(22,46): error TS2353: Object literal may only specify known properties, and 'errorMap' does not exist in type '{ error?: string | $ZodErrorMap<$ZodIssueInvalidUnion>; message?: string; }'.
src/domain/schemas/paycheck-history.ts(15,43): error TS2353: Object literal may only specify known properties, and 'errorMap' does not exist in type '{ error?: string | $ZodErrorMap<$ZodIssueInvalidUnion>; message?: string; }'.
src/domain/schemas/paycheck-history.ts(18,18): error TS2554: Expected 2-3 arguments, but got 1.
src/domain/schemas/paycheck-history.ts(21,17): error TS2554: Expected 2-3 arguments, but got 1.
src/domain/schemas/transaction.ts(21,43): error TS2353: Object literal may only specify known properties, and 'errorMap' does not exist in type '{ error?: string | $ZodErrorMap<$ZodIssueInvalidUnion>; message?: string; }'.
src/domain/schemas/utility.ts(14,44): error TS2353: Object literal may only specify known properties, and 'errorMap' does not exist in type '{ error?: string | $ZodErrorMap<$ZodIssueInvalidUnion>; message?: string; }'.
src/domain/schemas/utility.ts(15,42): error TS2353: Object literal may only specify known properties, and 'errorMap' does not exist in type '{ error?: string | $ZodErrorMap<$ZodIssueInvalidUnion>; message?: string; }'.
src/domain/schemas/version-control.ts(20,14): error TS2554: Expected 2-3 arguments, but got 1.
src/hooks/accounts/__tests__/useSupplementalAccounts.test.ts(298,78): error TS2353: Object literal may only specify known properties, and 'balance' does not exist in type 'SetStateAction<AccountForm>'.
src/hooks/accounts/__tests__/useSupplementalAccounts.test.ts(308,40): error TS2322: Type 'number' is not assignable to type 'string'.
src/hooks/accounts/useSupplementalAccounts.ts(132,42): error TS2345: Argument of type '(config?: {}) => Promise<unknown>' is not assignable to parameter of type '(options: { title: string; message: string; confirmLabel: string; cancelLabel: string; destructive: boolean; }) => Promise<boolean>'.
  Type 'Promise<unknown>' is not assignable to type 'Promise<boolean>'.
    Type 'unknown' is not assignable to type 'boolean'.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(5,1): error TS2739: Type '{ createObjectURL: Mock<() => string>; revokeObjectURL: Mock<Procedure>; }' is missing the following properties from type '{ new (url: string | URL, base?: string | URL): URL; prototype: URL; canParse(url: string | URL, base?: string | URL): boolean; createObjectURL(obj: Blob | MediaSource): string; parse(url: string | URL, base?: string | URL): URL; revokeObjectURL(url: string): void; }': prototype, canParse, parse
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(20,3): error TS2322: Type 'Mock<() => { href: string; download: string; click: Mock<Procedure>; style: { visibility: string; }; }>' is not assignable to type '{ <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K]; <K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementDeprecatedTagNameMap[K]; (tagName: string, options?: ElementCreationOptions): HTMLElement; }'.
  Type '{ href: string; download: string; click: Mock<Procedure>; style: { visibility: string; }; }' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 312 more.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(21,3): error TS2740: Type '{ appendChild: Mock<Procedure>; removeChild: Mock<Procedure>; }' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 312 more.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(117,27): error TS2339: Property 'suggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(118,27): error TS2339: Property 'isAnalyzing' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(119,27): error TS2339: Property 'isApplying' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(120,27): error TS2339: Property 'selectedSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(121,27): error TS2339: Property 'modelAccuracy' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(122,27): error TS2339: Property 'analysisResults' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(133,28): error TS2551: Property 'analyzeSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'. Did you mean 'applySuggestion'?
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(140,27): error TS2339: Property 'suggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(141,27): error TS2339: Property 'isAnalyzing' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(153,28): error TS2551: Property 'analyzeSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'. Did you mean 'applySuggestion'?
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(156,27): error TS2339: Property 'suggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(157,27): error TS2339: Property 'isAnalyzing' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(168,22): error TS2339: Property 'setSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(173,22): error TS2339: Property 'toggleSuggestionSelection' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(176,27): error TS2339: Property 'selectedSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(180,22): error TS2339: Property 'toggleSuggestionSelection' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(183,27): error TS2339: Property 'selectedSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(192,22): error TS2339: Property 'setSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(196,22): error TS2339: Property 'selectHighConfidenceSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(200,27): error TS2339: Property 'selectedSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(221,22): error TS2339: Property 'setSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(222,22): error TS2339: Property 'setSelectedSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(226,28): error TS2339: Property 'applySelectedSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(233,27): error TS2339: Property 'isApplying' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(245,22): error TS2339: Property 'setSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(246,22): error TS2339: Property 'setSelectedSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(250,28): error TS2339: Property 'applySelectedSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(253,27): error TS2339: Property 'isApplying' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(268,28): error TS2339: Property 'trainModel' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(286,28): error TS2339: Property 'checkModelAccuracy' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(289,27): error TS2339: Property 'modelAccuracy' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(311,28): error TS2339: Property 'analyzeCategoryPatterns' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(314,27): error TS2339: Property 'analysisResults' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(323,22): error TS2339: Property 'setSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(324,22): error TS2339: Property 'setSelectedSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(328,22): error TS2339: Property 'clearSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(331,27): error TS2339: Property 'suggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(332,27): error TS2339: Property 'selectedSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(341,22): error TS2339: Property 'setSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(344,43): error TS2339: Property 'getFilteredSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(345,45): error TS2339: Property 'getFilteredSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(346,43): error TS2339: Property 'getFilteredSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(359,22): error TS2339: Property 'setSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(360,22): error TS2339: Property 'setSelectedSuggestions' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(363,34): error TS2339: Property 'getSuggestionStats' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(391,27): error TS2339: Property 'isDataLoading' does not exist on type '{ activeTab: string; showSettings: boolean; dismissedSuggestions: Set<unknown>; dateRange: string; analysisSettings: { minTransactionCount: number; minAmount: number; similarityThreshold: number; unusedCategoryThreshold: number; consolidationThreshold: number; }; ... 6 more ...; applySuggestion: (suggestion: any, on...'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(72,70): error TS2339: Property 'name' does not exist on type '{ season: string; avgSpending: number; categories: string[]; }'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(94,28): error TS2339: Property 'projectedSpending' does not exist on type '{ projectedMonthlySpending?: undefined; projectedSavings?: undefined; confidenceLevel?: undefined; trendDirection?: undefined; } | { projectedMonthlySpending: number; projectedSavings: number; confidenceLevel: number; trendDirection: string; }'.
  Property 'projectedSpending' does not exist on type '{ projectedMonthlySpending?: undefined; projectedSavings?: undefined; confidenceLevel?: undefined; trendDirection?: undefined; }'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(95,28): error TS2339: Property 'growthRate' does not exist on type '{ projectedMonthlySpending?: undefined; projectedSavings?: undefined; confidenceLevel?: undefined; trendDirection?: undefined; } | { projectedMonthlySpending: number; projectedSavings: number; confidenceLevel: number; trendDirection: string; }'.
  Property 'growthRate' does not exist on type '{ projectedMonthlySpending?: undefined; projectedSavings?: undefined; confidenceLevel?: undefined; trendDirection?: undefined; }'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(96,21): error TS2339: Property 'confidence' does not exist on type '{ projectedMonthlySpending?: undefined; projectedSavings?: undefined; confidenceLevel?: undefined; trendDirection?: undefined; } | { projectedMonthlySpending: number; projectedSavings: number; confidenceLevel: number; trendDirection: string; }'.
  Property 'confidence' does not exist on type '{ projectedMonthlySpending?: undefined; projectedSavings?: undefined; confidenceLevel?: undefined; trendDirection?: undefined; }'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(97,21): error TS2339: Property 'confidence' does not exist on type '{ projectedMonthlySpending?: undefined; projectedSavings?: undefined; confidenceLevel?: undefined; trendDirection?: undefined; } | { projectedMonthlySpending: number; projectedSavings: number; confidenceLevel: number; trendDirection: string; }'.
  Property 'confidence' does not exist on type '{ projectedMonthlySpending?: undefined; projectedSavings?: undefined; confidenceLevel?: undefined; trendDirection?: undefined; }'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(98,71): error TS2339: Property 'trend' does not exist on type '{ projectedMonthlySpending?: undefined; projectedSavings?: undefined; confidenceLevel?: undefined; trendDirection?: undefined; } | { projectedMonthlySpending: number; projectedSavings: number; confidenceLevel: number; trendDirection: string; }'.
  Property 'trend' does not exist on type '{ projectedMonthlySpending?: undefined; projectedSavings?: undefined; confidenceLevel?: undefined; trendDirection?: undefined; }'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(109,28): error TS2339: Property 'highestSpendingSeason' does not exist on type '{ type: string; title: string; description: string; action: string; }[]'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(110,28): error TS2339: Property 'avgVelocity' does not exist on type '{ type: string; title: string; description: string; action: string; }[]'.
src/hooks/analytics/__tests__/useTrendAnalysis.test.ts(111,28): error TS2339: Property 'hasHighGrowth' does not exist on type '{ type: string; title: string; description: string; action: string; }[]'.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(13,30): error TS2339: Property 'paycheckHistory' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsIntegration.ts(3,32): error TS2307: Cannot find module './useChartConfig' or its corresponding type declarations.
src/hooks/analytics/useAnalyticsIntegration.ts(101,12): error TS2339: Property 'map' does not exist on type 'any[] | { summary: any; monthly: any; categories: any; envelopes: any; exportedAt: string; }'.
  Property 'map' does not exist on type '{ summary: any; monthly: any; categories: any; envelopes: any; exportedAt: string; }'.
src/hooks/analytics/usePerformanceMonitor.ts(51,7): error TS2353: Object literal may only specify known properties, and 'spendingEfficiency' does not exist in type 'Metrics'.
src/hooks/analytics/usePerformanceMonitor.ts(58,7): error TS2353: Object literal may only specify known properties, and 'spendingEfficiency' does not exist in type 'Metrics'.
src/hooks/analytics/utils/pdfGeneratorUtils.ts(93,54): error TS2339: Property 'envelopeAnalysis' does not exist on type 'unknown'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(47,17): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isUnlocked: boolean; encryptionKey: CryptoKey; currentUser: UserData; budgetId: string; salt: Uint8Array<ArrayBufferLike>; handleSetup: (userDataOrPassword: any) => Promise<...>; handleLogout: () => void; handleChangePassword: (oldPass: any, newPass: any) => Promise<...>; handleUpdateProfile: (updatedProfile...'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(59,24): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isLocked: boolean; securitySettings: SecuritySettings; securityEvents: SecurityEvent[]; lockSession: () => void; unlockSession: (_password: any) => void; ... 9 more ...; cleanup: () => void; }'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(67,22): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isLocalOnlyMode: boolean; localOnlyUser: any; isInitialized: boolean; loading: boolean; error: any; clearError: () => void; enterLocalOnlyMode: () => Promise<{ success: boolean; error: string; }>; ... 8 more ...; validateImportFile: () => { ...; }; }'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(113,22): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isLocalOnlyMode: boolean; localOnlyUser: any; isInitialized: boolean; loading: boolean; error: any; clearError: () => void; enterLocalOnlyMode: () => Promise<{ success: boolean; error: string; }>; ... 8 more ...; validateImportFile: () => { ...; }; }'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(127,17): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isUnlocked: boolean; encryptionKey: CryptoKey; currentUser: UserData; budgetId: string; salt: Uint8Array<ArrayBufferLike>; handleSetup: (userDataOrPassword: any) => Promise<...>; handleLogout: () => void; handleChangePassword: (oldPass: any, newPass: any) => Promise<...>; handleUpdateProfile: (updatedProfile...'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(152,17): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isUnlocked: boolean; encryptionKey: CryptoKey; currentUser: UserData; budgetId: string; salt: Uint8Array<ArrayBufferLike>; handleSetup: (userDataOrPassword: any) => Promise<...>; handleLogout: () => void; handleChangePassword: (oldPass: any, newPass: any) => Promise<...>; handleUpdateProfile: (updatedProfile...'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(169,22): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isLocalOnlyMode: boolean; localOnlyUser: any; isInitialized: boolean; loading: boolean; error: any; clearError: () => void; enterLocalOnlyMode: () => Promise<{ success: boolean; error: string; }>; ... 8 more ...; validateImportFile: () => { ...; }; }'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(179,22): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isLocalOnlyMode: boolean; localOnlyUser: any; isInitialized: boolean; loading: boolean; error: any; clearError: () => void; enterLocalOnlyMode: () => Promise<{ success: boolean; error: string; }>; ... 8 more ...; validateImportFile: () => { ...; }; }'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(189,24): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isLocked: boolean; securitySettings: SecuritySettings; securityEvents: SecurityEvent[]; lockSession: () => void; unlockSession: (_password: any) => void; ... 9 more ...; cleanup: () => void; }'.
src/hooks/auth/__tests__/useAuthManager.test.ts(55,32): error TS6133: 'mutation' is declared but its value is never read.
src/hooks/auth/__tests__/useAuthManager.test.ts(56,37): error TS6133: 'mutation' is declared but its value is never read.
src/hooks/auth/__tests__/useAuthManager.test.ts(57,33): error TS6133: 'mutation' is declared but its value is never read.
src/hooks/auth/__tests__/useAuthManager.test.ts(58,41): error TS6133: 'mutation' is declared but its value is never read.
src/hooks/auth/__tests__/useAuthManager.test.ts(58,51): error TS6133: 'context' is declared but its value is never read.
src/hooks/auth/__tests__/useAuthManager.test.ts(59,40): error TS6133: 'mutation' is declared but its value is never read.
src/hooks/auth/__tests__/useAuthManager.test.ts(60,38): error TS6133: 'context' is declared but its value is never read.
src/hooks/auth/__tests__/useAuthManager.test.ts(61,41): error TS6133: 'context' is declared but its value is never read.
src/hooks/auth/__tests__/useAuthManager.test.ts(99,27): error TS2339: Property 'joinBudgetWithShareCode' does not exist on type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }'.
src/hooks/auth/__tests__/useAuthManager.test.ts(100,27): error TS2339: Property 'handleSetup' does not exist on type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }'.
src/hooks/auth/__tests__/useAuthManager.test.ts(101,27): error TS2339: Property 'handleLogout' does not exist on type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }'.
src/hooks/auth/__tests__/useAuthManager.test.ts(102,27): error TS2551: Property 'handleChangePassword' does not exist on type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }'. Did you mean 'changePassword'?
src/hooks/auth/__tests__/useAuthManager.test.ts(103,27): error TS2551: Property 'handleUpdateProfile' does not exist on type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }'. Did you mean 'updateProfile'?
src/hooks/auth/__tests__/useAuthManager.test.ts(122,34): error TS2339: Property 'handleSetup' does not exist on type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }'.
src/hooks/auth/__tests__/useAuthManager.test.ts(123,34): error TS2339: Property 'handleLogout' does not exist on type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }'.
src/hooks/auth/__tests__/useAuthManager.test.ts(158,29): error TS2339: Property 'handleSetup' does not exist on type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }'.
src/hooks/auth/__tests__/useAuthManager.test.ts(159,29): error TS2339: Property 'handleLogout' does not exist on type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }'.
src/hooks/auth/__tests__/useAuthManager.test.ts(160,29): error TS2551: Property 'handleChangePassword' does not exist on type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }'. Did you mean 'changePassword'?
src/hooks/auth/__tests__/useAuthManager.test.ts(161,29): error TS2339: Property 'joinBudgetWithShareCode' does not exist on type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }'.
src/hooks/auth/__tests__/useAuthManager.test.ts(168,29): error TS2551: Property 'setLastActivity' does not exist on type '{ login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { success: boolean; error: any; data?: undefined; }>; ... 26 more ...; setError: (error: string) => void; }'. Did you mean 'lastActivity'?
src/hooks/auth/__tests__/useAuthQueries.test.ts(113,58): error TS2345: Argument of type '{ oldPassword: string; newPassword: string; }' is not assignable to parameter of type 'void'.
src/hooks/auth/__tests__/useKeyManagementUI.test.ts(268,56): error TS2345: Argument of type '{ text: Mock<() => Promise<string>>; }' is not assignable to parameter of type 'File'.
  Type '{ text: Mock<() => Promise<string>>; }' is missing the following properties from type 'File': lastModified, name, webkitRelativePath, size, and 5 more.
src/hooks/auth/__tests__/useKeyManagementUI.test.ts(284,50): error TS2345: Argument of type '{ text: Mock<() => Promise<never>>; }' is not assignable to parameter of type 'File'.
  Type '{ text: Mock<() => Promise<never>>; }' is missing the following properties from type 'File': lastModified, name, webkitRelativePath, size, and 5 more.
src/hooks/auth/__tests__/useKeyManagementUI.test.ts(299,50): error TS2345: Argument of type '{ text: Mock<() => Promise<string>>; }' is not assignable to parameter of type 'File'.
  Type '{ text: Mock<() => Promise<string>>; }' is missing the following properties from type 'File': lastModified, name, webkitRelativePath, size, and 5 more.
src/hooks/auth/__tests__/useKeyManagementUI.test.ts(327,40): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Error'.
  Type '{}' is missing the following properties from type 'Error': name, message
src/hooks/auth/__tests__/useSecurityManagerUI.test.ts(418,34): error TS2339: Property 'mockResolvedValueOnce' does not exist on type '() => Promise<string>'.
src/hooks/auth/__tests__/useSecurityManagerUI.test.ts(447,35): error TS2339: Property 'mockRejectedValueOnce' does not exist on type '(data: string) => Promise<void>'.
src/hooks/auth/__tests__/useSecurityManagerUI.test.ts(477,34): error TS2339: Property 'mockResolvedValueOnce' does not exist on type '() => Promise<string>'.
src/hooks/auth/__tests__/useSecurityManagerUI.test.ts(488,35): error TS2339: Property 'mockClear' does not exist on type '(data: string) => Promise<void>'.
src/hooks/auth/__tests__/useUserSetup.test.ts(36,27): error TS2339: Property 'mockClear' does not exist on type '(message: string, title?: string, duration?: number) => number'.
src/hooks/auth/mutations/__tests__/useJoinBudgetMutation.test.ts(190,11): error TS6133: 'joinData' is declared but its value is never read.
src/hooks/auth/mutations/__tests__/usePasswordMutations.test.ts(90,61): error TS2345: Argument of type '{ oldPassword: string; newPassword: string; }' is not assignable to parameter of type 'void'.
src/hooks/auth/mutations/__tests__/usePasswordMutations.test.ts(103,40): error TS2345: Argument of type '{ oldPassword: string; newPassword: string; }' is not assignable to parameter of type 'void'.
src/hooks/auth/mutations/__tests__/usePasswordMutations.test.ts(115,40): error TS2345: Argument of type '{ oldPassword: string; newPassword: string; }' is not assignable to parameter of type 'void'.
src/hooks/auth/mutations/__tests__/usePasswordMutations.test.ts(127,61): error TS2345: Argument of type '{ oldPassword: string; newPassword: string; }' is not assignable to parameter of type 'void'.
src/hooks/auth/mutations/__tests__/usePasswordMutations.test.ts(139,61): error TS2345: Argument of type '{ oldPassword: string; newPassword: string; }' is not assignable to parameter of type 'void'.
src/hooks/auth/mutations/__tests__/useProfileMutations.test.ts(86,61): error TS2345: Argument of type '{ userName: string; userColor: string; }' is not assignable to parameter of type 'void'.
src/hooks/auth/mutations/__tests__/useProfileMutations.test.ts(89,33): error TS2339: Property 'userName' does not exist on type 'void'.
src/hooks/auth/mutations/__tests__/useProfileMutations.test.ts(100,40): error TS2345: Argument of type '{ userName: string; userColor: string; }' is not assignable to parameter of type 'void'.
src/hooks/auth/mutations/__tests__/useProfileMutations.test.ts(114,40): error TS2345: Argument of type '{ userName: string; userColor: string; }' is not assignable to parameter of type 'void'.
src/hooks/auth/mutations/__tests__/useProfileMutations.test.ts(123,40): error TS2345: Argument of type '{ updateUser: Mock<Procedure>; encryptionKey: null; salt: null; }' is not assignable to parameter of type 'AuthContextValue'.
  Type '{ updateUser: Mock<Procedure>; encryptionKey: null; salt: null; }' is missing the following properties from type 'AuthContextValue': currentUser, hasCurrentUser, hasBudgetId, user, and 12 more.
src/hooks/auth/mutations/__tests__/useProfileMutations.test.ts(136,61): error TS2345: Argument of type '{ userName: string; userColor: string; }' is not assignable to parameter of type 'void'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(60,30): error TS2339: Property 'userColor' does not exist on type '{ budgetId: string; joinedVia: string; sharedBy: string; userName: string; email?: string; }'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(85,30): error TS2339: Property 'userColor' does not exist on type '{ budgetId: string; joinedVia: string; sharedBy: string; userName: string; email?: string; }'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(137,26): error TS2345: Argument of type 'UserData' is not assignable to parameter of type 'import("violet-vault/src/types/auth").UserData'.
  Property 'userColor' is missing in type 'UserData' but required in type 'import("violet-vault/src/types/auth").UserData'.
src/hooks/auth/mutations/useLoginMutations.ts(109,30): error TS2339: Property 'userColor' does not exist on type '{ budgetId: string; userName: string; id?: string; email?: string; }'.
src/hooks/auth/mutations/useLoginMutations.ts(116,30): error TS2339: Property 'userColor' does not exist on type '{ budgetId: string; userName: string; id?: string; email?: string; }'.
src/hooks/auth/mutations/useLoginMutations.ts(242,26): error TS2345: Argument of type 'UserData' is not assignable to parameter of type 'import("violet-vault/src/types/auth").UserData'.
  Property 'userColor' is missing in type 'UserData' but required in type 'import("violet-vault/src/types/auth").UserData'.
src/hooks/auth/mutations/usePasswordMutations.ts(19,26): error TS2339: Property 'oldPassword' does not exist on type 'void'.
src/hooks/auth/mutations/usePasswordMutations.ts(19,39): error TS2339: Property 'newPassword' does not exist on type 'void'.
src/hooks/auth/mutations/useProfileMutations.ts(27,36): error TS2339: Property 'userName' does not exist on type 'void'.
src/hooks/auth/mutations/useProfileMutations.ts(28,37): error TS2339: Property 'userColor' does not exist on type 'void'.
src/hooks/auth/mutations/useProfileMutations.ts(59,20): error TS2345: Argument of type 'void' is not assignable to parameter of type 'Partial<UserData>'.
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
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(88,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(92,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(93,27): error TS2339: Property 'bulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(94,27): error TS2339: Property 'isProcessing' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(95,27): error TS2339: Property 'progress' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(96,27): error TS2339: Property 'operationResults' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(97,27): error TS2339: Property 'validationErrors' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(101,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(107,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(110,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(114,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(117,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(121,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(126,22): error TS2339: Property 'selectAllBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(129,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(133,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(138,22): error TS2339: Property 'selectAllBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(142,22): error TS2339: Property 'clearSelection' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(145,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(149,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(159,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(160,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(163,27): error TS2339: Property 'bulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(173,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(183,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(184,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(187,27): error TS2339: Property 'validationErrors' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(193,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(203,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(204,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(205,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(209,28): error TS2339: Property 'executeBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(215,27): error TS2339: Property 'isProcessing' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(221,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(230,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(231,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(235,28): error TS2339: Property 'executeBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(239,27): error TS2339: Property 'isProcessing' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(244,8): error TS6133: 'id' is declared but its value is never read.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(247,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(257,22): error TS2339: Property 'selectAllBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(258,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(262,28): error TS2339: Property 'executeBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(266,27): error TS2339: Property 'progress' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(267,27): error TS2339: Property 'isProcessing' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(271,27): error TS2339: Property 'progress' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(272,27): error TS2339: Property 'isProcessing' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(281,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(291,22): error TS2339: Property 'selectAllBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(292,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(296,28): error TS2339: Property 'executeBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(299,27): error TS2339: Property 'operationResults' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(300,27): error TS2339: Property 'operationResults' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(305,27): error TS2339: Property 'operationResults' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(310,27): error TS2339: Property 'operationResults' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(322,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(332,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(333,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(334,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(338,28): error TS2339: Property 'executeBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(341,34): error TS2339: Property 'getOperationStats' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(352,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(358,22): error TS2339: Property 'selectAllBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(359,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(366,22): error TS2339: Property 'resetOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(369,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(370,27): error TS2339: Property 'bulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(371,27): error TS2339: Property 'operationResults' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(372,27): error TS2339: Property 'validationErrors' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(373,27): error TS2339: Property 'progress' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(377,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(383,22): error TS2339: Property 'selectBillsByPredicate' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(386,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(390,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(395,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(396,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(399,46): error TS2339: Property 'getSelectedBillsData' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(410,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(420,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(424,28): error TS2339: Property 'executeBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(428,27): error TS2339: Property 'validationErrors' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(432,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(437,22): error TS2339: Property 'selectAllBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(440,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/useBillForm.ts(104,47): error TS2345: Argument of type 'Bill' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'Bill'.
src/hooks/bills/useBillForm.ts(171,5): error TS4104: The type 'readonly string[]' is 'readonly' and cannot be assigned to the mutable type 'string[]'.
src/hooks/bills/useBillManager.ts(83,30): error TS2352: Conversion of type 'UseMutateFunction<any, Error, void, unknown>' to type '(bill: Bill) => Promise<void>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of parameters 'variables' and 'bill' are incompatible.
    Type 'Bill' is not comparable to type 'void'.
src/hooks/bills/useBillManager.ts(121,72): error TS2345: Argument of type 'import("violet-vault/src/db/types").Transaction[]' is not assignable to parameter of type 'Transaction[]'.
  Type 'import("violet-vault/src/db/types").Transaction' is not assignable to type 'Transaction'.
    Index signature for type 'string' is missing in type 'Transaction'.
src/hooks/bills/useBillManager.ts(181,7): error TS2345: Argument of type 'UseMutateFunction<any, Error, void, { previousBills: unknown; }>' is not assignable to parameter of type '(bill: Bill) => Promise<void>'.
  Types of parameters 'variables' and 'bill' are incompatible.
    Type 'Bill' is not assignable to type 'void'.
src/hooks/bills/useBillManagerHelpers.ts(66,10): error TS2352: Conversion of type 'Transaction[]' to type 'Bill[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Transaction' is missing the following properties from type 'Bill': name, dueDate
src/hooks/bills/useBillManagerHelpers.ts(100,3): error TS2719: Type 'Bill[]' is not assignable to type 'Bill[]'. Two different types with this name exist, but they are unrelated.
  Type 'Bill' is not assignable to type 'Bill'. Two different types with this name exist, but they are unrelated.
    Property 'name' is optional in type 'Bill' but required in type 'Bill'.
src/hooks/bills/useBillManagerHelpers.ts(140,3): error TS2719: Type 'Bill[]' is not assignable to type 'Bill[]'. Two different types with this name exist, but they are unrelated.
  Type 'Bill' is not assignable to type 'Bill'. Two different types with this name exist, but they are unrelated.
    Property 'name' is optional in type 'Bill' but required in type 'Bill'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(6,22): error TS6133: 'waitFor' is declared but its value is never read.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(93,42): error TS2345: Argument of type '{ name: string; provider: string; amount: number; dueDate: string; category: string; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(116,42): error TS2345: Argument of type '{ id: string; name: string; provider: string; amount: number; dueDate: string; category: string; isPaid: boolean; createdAt: string; updatedAt: string; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(133,42): error TS2345: Argument of type '{ id: string; name: string; provider: string; amount: number; dueDate: string; category: string; isPaid: boolean; createdAt: string; updatedAt: string; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(154,49): error TS2345: Argument of type '{ id: string; name: string; provider: string; amount: number; dueDate: string; category: string; isPaid: boolean; createdAt: string; updatedAt: string; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(174,42): error TS2345: Argument of type '{ billId: string; updates: { name: string; amount: number; }; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(198,38): error TS2345: Argument of type '{ billId: string; updates: { name: string; }; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(212,42): error TS2345: Argument of type '{ billId: string; updates: { name: string; }; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(233,42): error TS2345: Argument of type '{ billId: string; updates: { name: string; }; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(255,42): error TS2345: Argument of type 'string' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(270,42): error TS2345: Argument of type 'string' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(284,42): error TS2345: Argument of type 'string' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(311,42): error TS2345: Argument of type '{ billId: string; paidAmount: number; paidDate: string; envelopeId: string; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(350,42): error TS2345: Argument of type '{ billId: string; paidAmount: number; envelopeId: string; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(368,42): error TS2345: Argument of type '{ billId: string; paidAmount: number; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(390,42): error TS2345: Argument of type '{ billId: string; paidAmount: number; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(413,38): error TS2345: Argument of type '{ billId: string; paidAmount: number; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(442,42): error TS2345: Argument of type '{ id: string; name: string; provider: string; amount: number; dueDate: string; category: string; isPaid: boolean; createdAt: string; updatedAt: string; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(461,44): error TS2345: Argument of type '{ id: string; name: string; provider: string; amount: number; dueDate: string; category: string; isPaid: boolean; createdAt: string; updatedAt: string; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBills/__tests__/billQueries.test.ts(11,3): error TS6133: 'expectQuerySuccess' is declared but its value is never read.
src/hooks/bills/useBills/__tests__/billQueries.test.ts(12,3): error TS6133: 'expectQueryData' is declared but its value is never read.
src/hooks/bills/useBills/__tests__/billQueries.test.ts(15,1): error TS6133: 'queryKeys' is declared but its value is never read.
src/hooks/bills/useBills/billMutations.ts(58,27): error TS2554: Expected 3 arguments, but got 2.
src/hooks/bills/useBills/billMutations.ts(85,9): error TS2698: Spread types may only be created from object types.
src/hooks/bills/useBills/billMutations.ts(92,31): error TS2339: Property 'addBill' does not exist on type '{ updateEnvelope: (queryClient: any, envelopeId: any, updates: any) => Promise<void>; addEnvelope: (queryClient: any, newEnvelope: any) => Promise<void>; removeEnvelope: (queryClient: any, envelopeId: any) => Promise<...>; ... 7 more ...; createOptimisticMutation: (queryClient: any, { mutationKey, queryKey, updateFn...'.
src/hooks/bills/useBills/billMutations.ts(112,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/bills/useBills/billMutations.ts(119,22): error TS6133: 'billData' is declared but its value is never read.
src/hooks/bills/useBills/billMutations.ts(137,26): error TS2339: Property 'billId' does not exist on type 'void'.
src/hooks/bills/useBills/billMutations.ts(137,34): error TS2339: Property 'updates' does not exist on type 'void'.
src/hooks/bills/useBills/billMutations.ts(151,31): error TS2554: Expected 3 arguments, but got 2.
src/hooks/bills/useBills/billMutations.ts(162,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/bills/useBills/billMutations.ts(184,31): error TS2339: Property 'deleteBill' does not exist on type '{ updateEnvelope: (queryClient: any, envelopeId: any, updates: any) => Promise<void>; addEnvelope: (queryClient: any, newEnvelope: any) => Promise<void>; removeEnvelope: (queryClient: any, envelopeId: any) => Promise<...>; ... 7 more ...; createOptimisticMutation: (queryClient: any, { mutationKey, queryKey, updateFn...'.
src/hooks/bills/useBills/billMutations.ts(187,35): error TS2345: Argument of type 'void' is not assignable to parameter of type 'string'.
src/hooks/bills/useBills/billMutations.ts(189,39): error TS2345: Argument of type 'void' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/bills/useBills/billMutations.ts(195,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/bills/useBills/billMutations.ts(215,26): error TS2339: Property 'billId' does not exist on type 'void'.
src/hooks/bills/useBills/billMutations.ts(215,34): error TS2339: Property 'paidAmount' does not exist on type 'void'.
src/hooks/bills/useBills/billMutations.ts(215,46): error TS2339: Property 'paidDate' does not exist on type 'void'.
src/hooks/bills/useBills/billMutations.ts(215,56): error TS2339: Property 'envelopeId' does not exist on type 'void'.
src/hooks/bills/useBills/billMutations.ts(232,31): error TS2554: Expected 3 arguments, but got 2.
src/hooks/bills/useBills/billMutations.ts(237,9): error TS2353: Object literal may only specify known properties, and 'updatedAt' does not exist in type 'UpdateSpec<Bill> | ((obj: Bill, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/hooks/bills/useBills/billMutations.ts(250,39): error TS2345: Argument of type '{ id: string; date: any; description: any; amount: number; envelopeId: any; category: any; type: string; source: string; billId: any; notes: string; createdAt: string; }' is not assignable to parameter of type 'Transaction'.
  Property 'lastModified' is missing in type '{ id: string; date: any; description: any; amount: number; envelopeId: any; category: any; type: string; source: string; billId: any; notes: string; createdAt: string; }' but required in type 'Transaction'.
src/hooks/bills/useBills/billMutations.ts(251,31): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/useBills/billMutations.ts(268,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/bills/useBills/billQueries.ts(13,5): error TS2339: Property 'status' does not exist on type '{}'.
src/hooks/bills/useBills/billQueries.ts(14,5): error TS2339: Property 'daysAhead' does not exist on type '{}'.
src/hooks/bills/useBills/billQueries.ts(15,5): error TS2339: Property 'category' does not exist on type '{}'.
src/hooks/bills/useBills/billQueries.ts(16,5): error TS2339: Property 'sortBy' does not exist on type '{}'.
src/hooks/bills/useBills/billQueries.ts(17,5): error TS2339: Property 'sortOrder' does not exist on type '{}'.
src/hooks/bills/useBills/billQueries.ts(125,5): error TS2339: Property 'status' does not exist on type '{}'.
src/hooks/bills/useBills/billQueries.ts(126,5): error TS2339: Property 'daysAhead' does not exist on type '{}'.
src/hooks/bills/useBills/billQueries.ts(127,5): error TS2339: Property 'category' does not exist on type '{}'.
src/hooks/bills/useBills/billQueries.ts(128,5): error TS2339: Property 'sortBy' does not exist on type '{}'.
src/hooks/bills/useBills/billQueries.ts(129,5): error TS2339: Property 'sortOrder' does not exist on type '{}'.
src/hooks/bills/useBills/billQueries.ts(190,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/bills/useBills/index.ts(22,60): error TS2339: Property 'daysAhead' does not exist on type '{}'.
src/hooks/bills/useBillValidation.ts(20,40): error TS2339: Property 'errors' does not exist on type 'ZodError<{ id: string; name: string; amount: number; category: string; isPaid: boolean; isRecurring: boolean; lastModified: number; dueDate?: string | Date; frequency?: "monthly" | "quarterly" | "annually"; envelopeId?: string; createdAt?: number; description?: string; paymentMethod?: string; }>'.
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(92,36): error TS2339: Property 'name' does not exist on type '{}'.
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(99,71): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(102,72): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(167,36): error TS2339: Property 'name' does not exist on type '{}'.
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(168,36): error TS2339: Property 'monthlyAmount' does not exist on type '{}'.
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(187,36): error TS2339: Property 'name' does not exist on type '{}'.
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(193,34): error TS2554: Expected 1 arguments, but got 0.
src/hooks/budgeting/__tests__/useEnvelopesQuery.test.ts(11,3): error TS6133: 'expectQuerySuccess' is declared but its value is never read.
src/hooks/budgeting/autofunding/queries/useExecutableRules.ts(21,57): error TS2345: Argument of type 'Rule' is not assignable to parameter of type 'Rule'.
  Type 'Rule' is missing the following properties from type 'Rule': enabled, trigger, type
src/hooks/budgeting/autofunding/queries/useRuleFilters.ts(21,41): error TS2345: Argument of type 'Rule[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type 'Rule' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 7 more.
src/hooks/budgeting/autofunding/useAutoFunding.ts(28,24): error TS2339: Property 'envelopes' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(29,29): error TS2339: Property 'unassignedCash' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(30,30): error TS2339: Property 'allTransactions' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(66,30): error TS2345: Argument of type 'boolean' is not assignable to parameter of type 'string'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(80,63): error TS2345: Argument of type '(shouldAutoAllocate?: boolean) => Promise<any>' is not assignable to parameter of type '(trigger: string, data: any) => Promise<any>'.
  Types of parameters 'shouldAutoAllocate' and 'trigger' are incompatible.
    Type 'string' is not assignable to type 'boolean'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(93,69): error TS2345: Argument of type '(shouldAutoAllocate?: boolean) => Promise<any>' is not assignable to parameter of type '(trigger: string) => Promise<void>'.
  Types of parameters 'shouldAutoAllocate' and 'trigger' are incompatible.
    Type 'string' is not assignable to type 'boolean'.
src/hooks/budgeting/autofunding/useAutoFundingData.ts(18,7): error TS6133: '_STORAGE_KEY' is declared but its value is never read.
src/hooks/budgeting/autofunding/useAutoFundingHistory.ts(31,18): error TS2339: Property 'clearUndoStack' does not exist on type '{ undoStack: any[]; addToUndoStack: (executionRecord: any, executionResults: any) => void; getUndoableExecutions: () => any[]; getUndoStatistics: () => { totalUndoable: number; totalAmount: any; oldestUndoable: any; newestUndoable: any; }; undoLastExecution: () => Promise<...>; undoExecution: (executionId: any) => P...'.
src/hooks/budgeting/autofunding/useAutoFundingHistory.ts(71,32): error TS2345: Argument of type 'ExecutionRecord[]' is not assignable to parameter of type 'HistoryExecution[]'.
  Type 'ExecutionRecord' is not assignable to type 'HistoryExecution'.
    Property 'executedAt' is optional in type 'ExecutionRecord' but required in type 'HistoryExecution'.
src/hooks/budgeting/autofunding/utils/useRuleStatistics.ts(20,32): error TS2345: Argument of type 'Rule[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type 'Rule' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 7 more.
src/hooks/budgeting/autofunding/utils/useRuleSummaries.ts(26,65): error TS2345: Argument of type 'Rule' is not assignable to parameter of type 'AutoFundingRule'.
  Type 'Rule' is missing the following properties from type 'AutoFundingRule': name, description, type, trigger, and 6 more.
src/hooks/budgeting/metadata/useActualBalance.ts(32,5): error TS2739: Type '{ unassignedCash: number; actualBalance: number; isActualBalanceManual: boolean; biweeklyAllocation: number; }' is missing the following properties from type 'BudgetRecord': id, lastModified
src/hooks/budgeting/metadata/useActualBalance.ts(75,26): error TS2339: Property 'balance' does not exist on type 'void'.
src/hooks/budgeting/metadata/useActualBalance.ts(75,35): error TS2339: Property 'isManual' does not exist on type 'void'.
src/hooks/budgeting/metadata/useActualBalance.ts(93,49): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/budgeting/metadata/useActualBalance.ts(103,15): error TS2339: Property 'isManual' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(103,32): error TS2339: Property 'author' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(109,43): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(112,55): error TS2345: Argument of type '{ balance: any; isManual: any; }' is not assignable to parameter of type 'void'.
src/hooks/budgeting/metadata/useActualBalance.ts(124,47): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(130,24): error TS2339: Property 'isActualBalanceManual' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(131,27): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(133,18): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(133,45): error TS2339: Property 'isActualBalanceManual' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(138,63): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(141,18): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(146,7): error TS2339: Property 'showCurrency' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(147,7): error TS2339: Property 'showSign' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(148,7): error TS2339: Property 'minimumFractionDigits' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(149,7): error TS2339: Property 'maximumFractionDigits' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(186,32): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(187,40): error TS2339: Property 'isActualBalanceManual' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalanceOperations.ts(13,15): error TS2339: Property 'isManual' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalanceOperations.ts(13,32): error TS2339: Property 'author' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalanceOperations.ts(35,50): error TS2345: Argument of type '{ actualBalance: number; isActualBalanceManual: any; }' is not assignable to parameter of type 'void'.
src/hooks/budgeting/metadata/useBudgetMetadataMutation.ts(11,73): error TS2345: Argument of type 'void' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/budgeting/metadata/useBudgetMetadataMutation.ts(12,31): error TS2345: Argument of type 'void' is not assignable to parameter of type 'Partial<BudgetRecord>'.
src/hooks/budgeting/metadata/useBudgetMetadataMutation.ts(19,49): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/budgeting/metadata/useBudgetMetadataQuery.ts(29,9): error TS2739: Type '{ unassignedCash: number; actualBalance: number; isActualBalanceManual: boolean; biweeklyAllocation: number; }' is missing the following properties from type 'BudgetRecord': id, lastModified
src/hooks/budgeting/metadata/useBudgetMetadataQuery.ts(48,35): error TS2339: Property 'unassignedCash' does not exist on type '{}'.
src/hooks/budgeting/metadata/useBudgetMetadataQuery.ts(49,34): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useBudgetMetadataQuery.ts(50,42): error TS2339: Property 'isActualBalanceManual' does not exist on type '{}'.
src/hooks/budgeting/metadata/useBudgetMetadataQuery.ts(51,39): error TS2339: Property 'biweeklyAllocation' does not exist on type '{}'.
src/hooks/budgeting/metadata/useBudgetMetadataUtils.ts(18,50): error TS2345: Argument of type '{ biweeklyAllocation: number; }' is not assignable to parameter of type 'void'.
src/hooks/budgeting/metadata/useBudgetMetadataUtils.ts(49,7): error TS2339: Property 'showCurrency' does not exist on type '{}'.
src/hooks/budgeting/metadata/useBudgetMetadataUtils.ts(50,7): error TS2339: Property 'showSign' does not exist on type '{}'.
src/hooks/budgeting/metadata/useBudgetMetadataUtils.ts(51,7): error TS2339: Property 'minimumFractionDigits' does not exist on type '{}'.
src/hooks/budgeting/metadata/useBudgetMetadataUtils.ts(52,7): error TS2339: Property 'maximumFractionDigits' does not exist on type '{}'.
src/hooks/budgeting/metadata/useUnassignedCashOperations.ts(18,15): error TS2339: Property 'author' does not exist on type '{}'.
src/hooks/budgeting/metadata/useUnassignedCashOperations.ts(18,40): error TS2339: Property 'source' does not exist on type '{}'.
src/hooks/budgeting/metadata/useUnassignedCashOperations.ts(22,50): error TS2345: Argument of type '{ unassignedCash: number; }' is not assignable to parameter of type 'void'.
src/hooks/budgeting/useBudgetData/index.ts(42,47): error TS2339: Property 'unassignedCash' does not exist on type '{}'.
src/hooks/budgeting/useBudgetData/index.ts(43,46): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/useBudgetData/mutations.ts(33,26): error TS2339: Property 'envelopeId' does not exist on type 'void'.
src/hooks/budgeting/useBudgetData/mutations.ts(33,38): error TS2339: Property 'updates' does not exist on type 'void'.
src/hooks/budgeting/useBudgetData/mutations.ts(76,63): error TS2345: Argument of type 'void' is not assignable to parameter of type 'string'.
src/hooks/budgeting/useBudgetData/mutationsHelpers.ts(67,51): error TS2339: Property 'envelopeAllocations' does not exist on type 'PaycheckHistory'.
src/hooks/budgeting/useBudgetData/mutationsHelpers.ts(91,19): error TS2339: Property 'paycheckId' does not exist on type 'Transaction'.
src/hooks/budgeting/useBudgetData/mutationsHelpers.ts(94,31): error TS2339: Property 'paycheckId' does not exist on type 'Transaction'.
src/hooks/budgeting/useBudgetData/mutationsHelpers.ts(98,73): error TS2339: Property 'paycheckId' does not exist on type 'Transaction'.
src/hooks/budgeting/useBudgetData/paycheckMutations.ts(37,35): error TS2345: Argument of type 'void' is not assignable to parameter of type 'string'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(18,17): error TS2339: Property 'dateRange' does not exist on type '{}'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(19,38): error TS2339: Property 'dateRange' does not exist on type '{}'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(26,17): error TS2339: Property 'envelopeId' does not exist on type '{}'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(27,62): error TS2339: Property 'envelopeId' does not exist on type '{}'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(74,34): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(79,33): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(84,44): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(85,43): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(102,13): error TS2551: Property 'virtualBalance' does not exist on type '{ totalEnvelopeBalance: number; totalSavingsBalance: number; unassignedCash: number; actualBalance: number; recentTransactions: Transaction[]; upcomingBills: Bill[]; }'. Did you mean 'actualBalance'?
src/hooks/budgeting/useBudgetData/queryFunctions.ts(104,13): error TS2339: Property 'balanceDifference' does not exist on type '{ totalEnvelopeBalance: number; totalSavingsBalance: number; unassignedCash: number; actualBalance: number; recentTransactions: Transaction[]; upcomingBills: Bill[]; }'.
src/hooks/budgeting/useBudgetData/queryFunctions.ts(104,65): error TS2551: Property 'virtualBalance' does not exist on type '{ totalEnvelopeBalance: number; totalSavingsBalance: number; unassignedCash: number; actualBalance: number; recentTransactions: Transaction[]; upcomingBills: Bill[]; }'. Did you mean 'actualBalance'?
src/hooks/budgeting/useBudgetData/utilities.ts(17,38): error TS2554: Expected 1 arguments, but got 0.
src/hooks/budgeting/useBudgetData/utilities.ts(18,50): error TS2554: Expected 2-3 arguments, but got 1.
src/hooks/budgeting/useBudgetData/utilities.ts(56,31): error TS2554: Expected 2 arguments, but got 1.
src/hooks/budgeting/useBudgetHistoryQuery.ts(21,40): error TS2551: Property 'getBudgetCommits' does not exist on type 'VioletVaultDB'. Did you mean 'budgetCommits'?
src/hooks/budgeting/useBudgetHistoryQuery.ts(38,51): error TS2339: Property 'deriveKeyFromPassword' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(38,84): error TS2339: Property 'password' does not exist on type 'void'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(39,74): error TS2339: Property 'snapshot' does not exist on type 'void'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(42,9): error TS2698: Spread types may only be created from object types.
src/hooks/budgeting/useBudgetHistoryQuery.ts(52,22): error TS2339: Property 'changes' does not exist on type 'void'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(52,44): error TS2339: Property 'changes' does not exist on type 'void'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(53,36): error TS2339: Property 'changes' does not exist on type 'void'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(64,59): error TS2349: This expression is not callable.
  Type 'string[]' has no call signatures.
src/hooks/budgeting/useBudgetHistoryQuery.ts(87,20): error TS2551: Property 'getBudgetCommit' does not exist on type 'VioletVaultDB'. Did you mean 'budgetCommits'?
src/hooks/budgeting/useBudgetHistoryQuery.ts(88,20): error TS2551: Property 'getBudgetChanges' does not exist on type 'VioletVaultDB'. Did you mean 'budgetChanges'?
src/hooks/budgeting/useBudgetHistoryQuery.ts(107,44): error TS2339: Property 'getBudgetCommitCount' does not exist on type 'VioletVaultDB'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(108,40): error TS2551: Property 'getBudgetCommits' does not exist on type 'VioletVaultDB'. Did you mean 'budgetCommits'?
src/hooks/budgeting/useBudgetHistoryQuery.ts(136,26): error TS2339: Property 'commitHash' does not exist on type 'void'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(136,38): error TS2339: Property 'password' does not exist on type 'void'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(137,37): error TS2551: Property 'getBudgetCommit' does not exist on type 'VioletVaultDB'. Did you mean 'budgetCommits'?
src/hooks/budgeting/useBudgetHistoryQuery.ts(143,51): error TS2339: Property 'deriveKeyFromPassword' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(196,22): error TS2339: Property 'clearBudgetHistory' does not exist on type 'VioletVaultDB'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(200,59): error TS2349: This expression is not callable.
  Type 'string[]' has no call signatures.
src/hooks/budgeting/useBudgetHistoryQuery.ts(206,24): error TS2322: Type '{}' is not assignable to type 'void'.
src/hooks/budgeting/useBudgetHistoryQuery.ts(207,38): error TS2551: Property 'getBudgetCommits' does not exist on type 'VioletVaultDB'. Did you mean 'budgetCommits'?
src/hooks/budgeting/useEnvelopeForm.ts(34,19): error TS2345: Argument of type '{ name: string | boolean; monthlyAmount: string; currentBalance: string; category: string | boolean; color: string | boolean; frequency: string | boolean; description: string | boolean; ... 6 more ...; targetAmount: string; }' is not assignable to parameter of type 'SetStateAction<{ name: string; monthlyAmount: string; currentBalance: string; category: string; color: string; frequency: string; description: string; priority: string; autoAllocate: boolean; icon: string; envelopeType: "variable"; monthlyBudget: string; biweeklyAllocation: string; targetAmount: string; }>'.
  Type '{ name: string | boolean; monthlyAmount: string; currentBalance: string; category: string | boolean; color: string | boolean; frequency: string | boolean; description: string | boolean; ... 6 more ...; targetAmount: string; }' is not assignable to type '{ name: string; monthlyAmount: string; currentBalance: string; category: string; color: string; frequency: string; description: string; priority: string; autoAllocate: boolean; icon: string; envelopeType: "variable"; monthlyBudget: string; biweeklyAllocation: string; targetAmount: string; }'.
    Types of property 'name' are incompatible.
      Type 'string | boolean' is not assignable to type 'string'.
        Type 'boolean' is not assignable to type 'string'.
src/hooks/budgeting/useEnvelopeForm.ts(52,22): error TS2538: Type 'any' cannot be used as an index type.
src/hooks/budgeting/useEnvelopeForm.ts(96,19): error TS2345: Argument of type '{ name: string | boolean; monthlyAmount: string; currentBalance: string; category: string | boolean; color: string | boolean; frequency: string | boolean; description: string | boolean; ... 6 more ...; targetAmount: string; }' is not assignable to parameter of type 'SetStateAction<{ name: string; monthlyAmount: string; currentBalance: string; category: string; color: string; frequency: string; description: string; priority: string; autoAllocate: boolean; icon: string; envelopeType: "variable"; monthlyBudget: string; biweeklyAllocation: string; targetAmount: string; }>'.
  Type '{ name: string | boolean; monthlyAmount: string; currentBalance: string; category: string | boolean; color: string | boolean; frequency: string | boolean; description: string | boolean; ... 6 more ...; targetAmount: string; }' is not assignable to type '{ name: string; monthlyAmount: string; currentBalance: string; category: string; color: string; frequency: string; description: string; priority: string; autoAllocate: boolean; icon: string; envelopeType: "variable"; monthlyBudget: string; biweeklyAllocation: string; targetAmount: string; }'.
    Types of property 'name' are incompatible.
      Type 'string | boolean' is not assignable to type 'string'.
        Type 'boolean' is not assignable to type 'string'.
src/hooks/budgeting/usePaycheckProcessor.ts(39,5): error TS2345: Argument of type '(formData: PaycheckFormData) => ValidationResult' is not assignable to parameter of type '(data: FormData) => ValidationResult'.
  Types of parameters 'formData' and 'data' are incompatible.
    Type 'FormData' is missing the following properties from type 'PaycheckFormData': payerName, allocationMode
src/hooks/budgeting/usePaycheckProcessor.ts(187,5): error TS2448: Block-scoped variable 'resetForm' used before its declaration.
src/hooks/budgeting/useUnassignedCashDistribution.ts(115,14): error TS2365: Operator '+' cannot be applied to types 'unknown' and 'number'.
src/hooks/budgeting/useUnassignedCashDistribution.ts(121,29): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(126,12): error TS2365: Operator '>' cannot be applied to types 'unknown' and 'number'.
src/hooks/common/__tests__/useExportData.test.ts(14,13): error TS2339: Property 'mockReturnValue' does not exist on type '() => AuthContextValue'.
src/hooks/common/__tests__/useExportData.test.ts(18,21): error TS2339: Property 'mockReturnValue' does not exist on type '() => { showSuccessToast: (message: string, title?: string, duration?: number) => number; showErrorToast: (message: string, title?: string, duration?: number) => number; showWarningToast: (message: string, title?: string, duration?: number) => number; showInfoToast: (message: string, title?: string, duration?: numbe...'.
src/hooks/common/__tests__/useExportData.test.ts(23,32): error TS2339: Property 'mockResolvedValue' does not exist on type '{ (): PromiseExtended<Envelope[]>; <R>(thenShortcut: ThenShortcut<Envelope[], R>): PromiseExtended<R>; }'.
src/hooks/common/__tests__/useExportData.test.ts(24,23): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<BudgetRecord>'.
src/hooks/common/__tests__/useExportData.test.ts(36,13): error TS2339: Property 'mockReturnValue' does not exist on type '() => AuthContextValue'.
src/hooks/common/__tests__/useExportData.test.ts(40,21): error TS2339: Property 'mockReturnValue' does not exist on type '() => { showSuccessToast: (message: string, title?: string, duration?: number) => number; showErrorToast: (message: string, title?: string, duration?: number) => number; showWarningToast: (message: string, title?: string, duration?: number) => number; showInfoToast: (message: string, title?: string, duration?: numbe...'.
src/hooks/common/__tests__/useExportData.test.ts(45,32): error TS2339: Property 'mockResolvedValue' does not exist on type '{ (): PromiseExtended<Envelope[]>; <R>(thenShortcut: ThenShortcut<Envelope[], R>): PromiseExtended<R>; }'.
src/hooks/common/__tests__/useExportData.test.ts(46,23): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<BudgetRecord>'.
src/hooks/common/__tests__/useImportData.test.ts(26,13): error TS2339: Property 'mockReturnValue' does not exist on type '() => AuthContextValue'.
src/hooks/common/__tests__/useImportData.test.ts(30,21): error TS2339: Property 'mockReturnValue' does not exist on type '() => { showSuccessToast: (message: string, title?: string, duration?: number) => number; showErrorToast: (message: string, title?: string, duration?: number) => number; showWarningToast: (message: string, title?: string, duration?: number) => number; showInfoToast: (message: string, title?: string, duration?: numbe...'.
src/hooks/common/__tests__/useImportData.test.ts(34,16): error TS2339: Property 'mockReturnValue' does not exist on type '() => (config?: {}) => Promise<unknown>'.
src/hooks/common/__tests__/useImportData.test.ts(35,21): error TS2339: Property 'mockResolvedValue' does not exist on type '(file: any) => Promise<unknown>'.
src/hooks/common/__tests__/useImportData.test.ts(36,26): error TS2339: Property 'mockReturnValue' does not exist on type '(importedData: any, currentUser: any) => { validatedData: any; hasBudgetIdMismatch: boolean; importBudgetId: any; }'.
src/hooks/common/__tests__/useImportData.test.ts(40,22): error TS2339: Property 'mockResolvedValue' does not exist on type '(authConfig?: any) => Promise<{ success: boolean; }>'.
src/hooks/common/__tests__/useModalManager.test.ts(8,27): error TS2551: Property 'openModals' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'. Did you mean 'openModal'?
src/hooks/common/__tests__/useModalManager.test.ts(9,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(10,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(20,27): error TS2551: Property 'openModals' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'. Did you mean 'openModal'?
src/hooks/common/__tests__/useModalManager.test.ts(21,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(22,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(36,27): error TS2551: Property 'openModals' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'. Did you mean 'openModal'?
src/hooks/common/__tests__/useModalManager.test.ts(37,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(38,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(50,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(51,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(68,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(69,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(70,27): error TS2551: Property 'openModals' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'. Did you mean 'openModal'?
src/hooks/common/__tests__/useModalManager.test.ts(81,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(88,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(104,27): error TS2551: Property 'openModals' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'. Did you mean 'openModal'?
src/hooks/common/__tests__/useModalManager.test.ts(105,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(106,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(154,27): error TS2339: Property 'getModalDepth' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(155,27): error TS2339: Property 'getModalDepth' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(156,27): error TS2339: Property 'getModalDepth' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(157,27): error TS2339: Property 'getModalDepth' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(169,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(170,27): error TS2551: Property 'openModals' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'. Did you mean 'openModal'?
src/hooks/common/__tests__/useModalManager.test.ts(186,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(187,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(193,27): error TS2339: Property 'modalCount' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(200,27): error TS2339: Property 'modalCount' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(206,27): error TS2339: Property 'modalCount' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(212,27): error TS2551: Property 'hasOpenModals' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'. Did you mean 'openModal'?
src/hooks/common/__tests__/useModalManager.test.ts(218,27): error TS2551: Property 'hasOpenModals' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'. Did you mean 'openModal'?
src/hooks/common/__tests__/useModalManager.test.ts(224,27): error TS2551: Property 'hasOpenModals' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'. Did you mean 'openModal'?
src/hooks/common/__tests__/useModalManager.test.ts(236,43): error TS2339: Property 'getOpenModalNames' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(252,22): error TS2339: Property 'closeModalByPosition' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(255,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(268,22): error TS2339: Property 'closeModalByPosition' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(269,22): error TS2339: Property 'closeModalByPosition' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(273,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(274,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(288,22): error TS2551: Property 'closeTopModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'. Did you mean 'closeModal'?
src/hooks/common/__tests__/useModalManager.test.ts(291,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(292,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(299,22): error TS2551: Property 'closeTopModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'. Did you mean 'closeModal'?
src/hooks/common/__tests__/useModalManager.test.ts(302,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(303,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(316,22): error TS2339: Property 'replaceCurrentModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(319,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(320,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(328,22): error TS2339: Property 'replaceCurrentModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(331,27): error TS2339: Property 'modalStack' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/__tests__/useModalManager.test.ts(332,27): error TS2339: Property 'activeModal' does not exist on type '{ modals: {}; openModal: (modalName: any) => void; closeModal: (modalName: any) => void; toggleModal: (modalName: any) => void; closeAllModals: () => void; isModalOpen: (modalName: any) => boolean; getOpenModalsCount: () => number; }'.
src/hooks/common/useActivityLogger.ts(16,37): error TS2345: Argument of type 'UserData' is not assignable to parameter of type 'ActivityUser'.
  Property 'id' is missing in type 'UserData' but required in type 'ActivityUser'.
src/hooks/common/useConfirm.ts(36,56): error TS2339: Property 'showConfirm' does not exist on type 'unknown'.
src/hooks/common/useConfirm.ts(65,51): error TS2339: Property 'isOpen' does not exist on type 'unknown'.
src/hooks/common/useConfirm.ts(66,51): error TS2339: Property 'config' does not exist on type 'unknown'.
src/hooks/common/useConfirm.ts(67,53): error TS2339: Property 'resolver' does not exist on type 'unknown'.
src/hooks/common/useConfirm.ts(68,56): error TS2339: Property 'hideConfirm' does not exist on type 'unknown'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(90,58): error TS2339: Property 'provider' does not exist on type 'Envelope | Bill | Debt'.
  Property 'provider' does not exist on type 'Envelope'.
src/hooks/common/useDataInitialization.ts(12,65): error TS2339: Property 'autoAllocate' does not exist on type 'Envelope'.
src/hooks/common/useDataInitialization.ts(21,11): error TS2353: Object literal may only specify known properties, and 'autoAllocate' does not exist in type 'UpdateSpec<Envelope> | ((obj: Envelope, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/hooks/common/useDataManagement.ts(25,5): error TS2322: Type '(event: any) => Promise<{ success: boolean; imported: { envelopes: any; bills: any; transactions: any; savingsGoals: any; debts: any; paycheckHistory: any; auditLog: any; }; }>' is not assignable to type '(file: File) => Promise<void>'.
  Type 'Promise<{ success: boolean; imported: { envelopes: any; bills: any; transactions: any; savingsGoals: any; debts: any; paycheckHistory: any; auditLog: any; }; }>' is not assignable to type 'Promise<void>'.
    Type '{ success: boolean; imported: { envelopes: any; bills: any; transactions: any; savingsGoals: any; debts: any; paycheckHistory: any; auditLog: any; }; }' is not assignable to type 'void'.
src/hooks/common/useDataManagement.ts(26,5): error TS2322: Type '() => void' is not assignable to type '() => Promise<void>'.
  Type 'void' is not assignable to type 'Promise<void>'.
src/hooks/common/useEditLock.ts(161,25): error TS2339: Property 'toDate' does not exist on type 'number'.
src/hooks/common/useEditLock.ts(196,33): error TS2339: Property 'toDate' does not exist on type 'number'.
src/hooks/common/useEditLock.ts(205,37): error TS2339: Property 'toDate' does not exist on type 'number'.
src/hooks/common/useEditLock.ts(205,61): error TS2339: Property 'toDate' does not exist on type 'number'.
src/hooks/common/useEditLock.ts(208,25): error TS2339: Property 'toDate' does not exist on type 'number'.
src/hooks/common/useEditLock.ts(208,49): error TS2339: Property 'toDate' does not exist on type 'number'.
src/hooks/common/useImportData.ts(108,41): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/hooks/common/useOnboardingAutoComplete.ts(84,9): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/common/useOnboardingAutoComplete.ts(95,71): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/common/useOnboardingAutoComplete.ts(111,9): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/common/useOnboardingAutoComplete.ts(134,9): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/common/useOnboardingAutoComplete.ts(149,9): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/common/useOnboardingAutoComplete.ts(164,9): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/common/usePrompt.ts(45,54): error TS2339: Property 'showPrompt' does not exist on type 'unknown'.
src/hooks/common/usePrompt.ts(78,50): error TS2339: Property 'isOpen' does not exist on type 'unknown'.
src/hooks/common/usePrompt.ts(79,50): error TS2339: Property 'config' does not exist on type 'unknown'.
src/hooks/common/usePrompt.ts(80,52): error TS2339: Property 'resolver' does not exist on type 'unknown'.
src/hooks/common/usePrompt.ts(81,54): error TS2339: Property 'hidePrompt' does not exist on type 'unknown'.
src/hooks/common/useReceipts.ts(13,59): error TS2339: Property 'receipts' does not exist on type '{ budget: string[]; budgetData: () => string[]; budgetSummary: () => string[]; budgetMetadata: string[]; unassignedCash: () => string[]; actualBalance: () => string[]; envelopes: string[]; envelopesList: (filters?: {}) => {}[]; ... 44 more ...; syncActivity: () => string[]; }'.
src/hooks/common/useReceipts.ts(14,59): error TS2339: Property 'receiptsList' does not exist on type '{ budget: string[]; budgetData: () => string[]; budgetSummary: () => string[]; budgetMetadata: string[]; unassignedCash: () => string[]; actualBalance: () => string[]; envelopes: string[]; envelopesList: (filters?: {}) => {}[]; ... 44 more ...; syncActivity: () => string[]; }'.
src/hooks/common/useReceipts.ts(33,39): error TS2339: Property 'receipts' does not exist on type 'VioletVaultDB'.
src/hooks/common/useReceipts.ts(45,25): error TS2339: Property 'receiptsList' does not exist on type '{ budget: string[]; budgetData: () => string[]; budgetSummary: () => string[]; budgetMetadata: string[]; unassignedCash: () => string[]; actualBalance: () => string[]; envelopes: string[]; envelopesList: (filters?: {}) => {}[]; ... 44 more ...; syncActivity: () => string[]; }'.
src/hooks/common/useReceipts.ts(60,9): error TS2698: Spread types may only be created from object types.
src/hooks/common/useReceipts.ts(65,22): error TS2339: Property 'receipts' does not exist on type 'VioletVaultDB'.
src/hooks/common/useReceipts.ts(69,59): error TS2339: Property 'receipts' does not exist on type '{ budget: string[]; budgetData: () => string[]; budgetSummary: () => string[]; budgetMetadata: string[]; unassignedCash: () => string[]; actualBalance: () => string[]; envelopes: string[]; envelopesList: (filters?: {}) => {}[]; ... 44 more ...; syncActivity: () => string[]; }'.
src/hooks/common/useReceipts.ts(76,26): error TS2339: Property 'id' does not exist on type 'void'.
src/hooks/common/useReceipts.ts(76,30): error TS2339: Property 'updates' does not exist on type 'void'.
src/hooks/common/useReceipts.ts(77,22): error TS2339: Property 'receipts' does not exist on type 'VioletVaultDB'.
src/hooks/common/useReceipts.ts(84,59): error TS2339: Property 'receipts' does not exist on type '{ budget: string[]; budgetData: () => string[]; budgetSummary: () => string[]; budgetMetadata: string[]; unassignedCash: () => string[]; actualBalance: () => string[]; envelopes: string[]; envelopesList: (filters?: {}) => {}[]; ... 44 more ...; syncActivity: () => string[]; }'.
src/hooks/common/useReceipts.ts(92,38): error TS2339: Property 'receipts' does not exist on type 'VioletVaultDB'.
src/hooks/common/useReceipts.ts(99,22): error TS2339: Property 'receipts' does not exist on type 'VioletVaultDB'.
src/hooks/common/useReceipts.ts(103,59): error TS2339: Property 'receipts' does not exist on type '{ budget: string[]; budgetData: () => string[]; budgetSummary: () => string[]; budgetMetadata: string[]; unassignedCash: () => string[]; actualBalance: () => string[]; envelopes: string[]; envelopesList: (filters?: {}) => {}[]; ... 44 more ...; syncActivity: () => string[]; }'.
src/hooks/common/useReceipts.ts(109,26): error TS2339: Property 'receiptId' does not exist on type 'void'.
src/hooks/common/useReceipts.ts(109,37): error TS2339: Property 'transactionId' does not exist on type 'void'.
src/hooks/common/useReceipts.ts(110,22): error TS2339: Property 'receipts' does not exist on type 'VioletVaultDB'.
src/hooks/common/useReceipts.ts(117,59): error TS2339: Property 'receipts' does not exist on type '{ budget: string[]; budgetData: () => string[]; budgetSummary: () => string[]; budgetMetadata: string[]; unassignedCash: () => string[]; actualBalance: () => string[]; envelopes: string[]; envelopesList: (filters?: {}) => {}[]; ... 44 more ...; syncActivity: () => string[]; }'.
src/hooks/common/useReceipts.ts(166,75): error TS2339: Property 'receipts' does not exist on type '{ budget: string[]; budgetData: () => string[]; budgetSummary: () => string[]; budgetMetadata: string[]; unassignedCash: () => string[]; actualBalance: () => string[]; envelopes: string[]; envelopesList: (filters?: {}) => {}[]; ... 44 more ...; syncActivity: () => string[]; }'.
src/hooks/common/useRouterPageDetection.ts(101,34): error TS2339: Property 'offsetParent' does not exist on type 'Element'.
src/hooks/common/useTransactionArchiving.ts(26,35): error TS2339: Property 'balance' does not exist on type 'string[]'.
src/hooks/common/useTransactionArchiving.ts(50,26): error TS2554: Expected 1 arguments, but got 0.
src/hooks/common/useTransactionArchiving.ts(87,24): error TS2554: Expected 1 arguments, but got 0.
src/hooks/common/useTransactionArchiving.ts(102,26): error TS2554: Expected 1 arguments, but got 0.
src/hooks/common/useTransactionsCompat.ts(7,10): error TS2614: Module '"../transactions/useTransactionsV2.ts"' has no exported member 'useTransactionsV2'. Did you mean to use 'import useTransactionsV2 from "../transactions/useTransactionsV2.ts"' instead?
src/hooks/dashboard/useMainDashboard.ts(78,43): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/hooks/debts/__tests__/useDebtForm.test.ts(80,36): error TS2339: Property 'name' does not exist on type '{}'.
src/hooks/debts/__tests__/useDebtForm.test.ts(81,36): error TS2339: Property 'creditor' does not exist on type '{}'.
src/hooks/debts/__tests__/useDebtForm.test.ts(82,36): error TS2339: Property 'currentBalance' does not exist on type '{}'.
src/hooks/debts/__tests__/useDebtForm.test.ts(83,36): error TS2339: Property 'minimumPayment' does not exist on type '{}'.
src/hooks/debts/__tests__/useDebtForm.test.ts(105,36): error TS2339: Property 'currentBalance' does not exist on type '{}'.
src/hooks/debts/__tests__/useDebtForm.test.ts(106,36): error TS2339: Property 'originalBalance' does not exist on type '{}'.
src/hooks/debts/__tests__/useDebtForm.test.ts(107,36): error TS2339: Property 'interestRate' does not exist on type '{}'.
src/hooks/debts/__tests__/useDebtForm.test.ts(108,36): error TS2339: Property 'minimumPayment' does not exist on type '{}'.
src/hooks/debts/__tests__/useDebtForm.test.ts(153,36): error TS2339: Property 'existingBillId' does not exist on type '{}'.
src/hooks/debts/__tests__/useDebtForm.test.ts(166,36): error TS2339: Property 'name' does not exist on type '{}'.
src/hooks/debts/__tests__/useDebtForm.test.ts(174,36): error TS2339: Property 'name' does not exist on type '{}'.
src/hooks/debts/__tests__/useDebtForm.test.ts(180,36): error TS2554: Expected 1 arguments, but got 0.
src/hooks/debts/__tests__/useDebtForm.test.ts(226,36): error TS2554: Expected 1 arguments, but got 0.
src/hooks/debts/__tests__/useDebtForm.test.ts(265,36): error TS2339: Property 'submit' does not exist on type '{}'.
src/hooks/debts/__tests__/useDebtForm.test.ts(312,28): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/debts/helpers/debtManagementHelpers.ts(160,40): error TS2345: Argument of type 'string' is not assignable to parameter of type 'PaymentFrequency'.
src/hooks/debts/helpers/debtManagementHelpers.ts(219,5): error TS2353: Object literal may only specify known properties, and 'lastPaymentDate' does not exist in type 'Debt'.
src/hooks/debts/helpers/debtManagementHelpers.ts(247,45): error TS2345: Argument of type 'DebtData & { connectionData?: ConnectionData; }' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'DebtData & { connectionData?: ConnectionData; }'.
src/hooks/debts/helpers/debtManagementHelpers.ts(251,34): error TS2345: Argument of type 'CreatedDebt' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'CreatedDebt'.
src/hooks/debts/helpers/debtManagementHelpers.ts(452,37): error TS2345: Argument of type 'Debt' is not assignable to parameter of type 'DebtAccount'.
  Type 'Debt' is missing the following properties from type 'DebtAccount': creditor, balance, type, paymentFrequency, compoundFrequency
src/hooks/debts/helpers/debtManagementHelpers.ts(468,40): error TS2339: Property 'currentBalance' does not exist on type 'DebtAccount'.
src/hooks/debts/useDebtDashboard.ts(18,5): error TS2339: Property '_linkDebtToBill' does not exist on type '{ debts: DebtAccount[]; debtStats: { totalDebt: number; totalMonthlyPayments: number; averageInterestRate: number; debtsByType: {}; totalInterestPaid: number; activeDebtCount: number; totalDebtCount: number; dueSoonAmount: number; dueSoonCount: number; }; ... 12 more ...; COMPOUND_FREQUENCIES: { ...; }; }'.
src/hooks/debts/useDebtDashboard.ts(18,5): error TS6133: '_linkDebtToBill' is declared but its value is never read.
src/hooks/debts/useDebtManagement.ts(34,23): error TS2339: Property 'createBill' does not exist on type '{ refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<any[], Error>>; invalidate: () => Promise<void>; ... 36 more ...; bills: any[]; }'.
src/hooks/debts/useDebtManagement.ts(35,27): error TS2339: Property 'createEnvelope' does not exist on type '{ envelopes: Envelope[]; totalBalance: any; totalTargetAmount: any; underfundedEnvelopes: any[]; overfundedEnvelopes: any[]; availableCategories: any[]; isLoading: boolean; isFetching: boolean; ... 18 more ...; invalidate: () => Promise<...>; }'.
src/hooks/debts/useDebtManagement.ts(36,30): error TS2339: Property 'createTransaction' does not exist on type '{ isLoading: false; isFetching: boolean; isError: boolean; error: Error; addTransaction: UseMutateFunction<Transaction, Error, TransactionInput, unknown>; ... 29 more ...; transactions: Transaction[]; }'.
src/hooks/debts/useDebtManagement.ts(45,62): error TS2345: Argument of type 'Transaction[]' is not assignable to parameter of type '{ debtId?: string; }[]'.
  Type 'Transaction' has no properties in common with type '{ debtId?: string; }'.
src/hooks/debts/useDebtManagement.ts(70,43): error TS2339: Property 'currentBalance' does not exist on type 'DebtAccount'.
src/hooks/debts/useDebtManagement.ts(100,7): error TS2322: Type 'UseMutateFunction<any, Error, void, unknown>' is not assignable to type '(id: string, data: { debtId: string; }) => Promise<void>'.
  Types of parameters 'variables' and 'id' are incompatible.
    Type 'string' is not assignable to type 'void'.
src/hooks/debts/useDebtManagement.ts(125,7): error TS2322: Type 'UseMutateFunction<any, Error, void, unknown>' is not assignable to type '(id: string, data: { debtId: string; amount: number; }) => Promise<void>'.
  Types of parameters 'variables' and 'id' are incompatible.
    Type 'string' is not assignable to type 'void'.
src/hooks/debts/useDebtManagement.ts(154,7): error TS2322: Type 'UseMutateFunction<void, Error, void, unknown>' is not assignable to type '(id: string) => Promise<void>'.
  Types of parameters 'variables' and 'id' are incompatible.
    Type 'string' is not assignable to type 'void'.
src/hooks/debts/useDebtModalLogic.ts(64,9): error TS2353: Object literal may only specify known properties, and 'currentBalance' does not exist in type 'DebtFormData'.
src/hooks/debts/useDebts.ts(98,31): error TS2339: Property 'paymentHistory' does not exist on type 'Debt'.
src/hooks/debts/useDebts.ts(110,7): error TS2353: Object literal may only specify known properties, and 'paymentHistory' does not exist in type 'UpdateSpec<Debt> | ((obj: Debt, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/hooks/debts/useDebts.ts(132,49): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/layout/useLayoutData.ts(74,26): error TS2339: Property 'error' does not exist on type '{ envelopes: Envelope[]; transactions: any; bills: Bill[]; savingsGoals: SavingsGoal[]; paycheckHistory: PaycheckHistory[]; dashboardSummary: {}; ... 33 more ...; dashboardError: Error; }'.
src/hooks/mobile/__tests__/useSlideUpModal.test.ts(2,32): error TS6133: 'beforeEach' is declared but its value is never read.
src/hooks/notifications/__tests__/useFirebaseMessaging.test.ts(97,84): error TS2345: Argument of type '{ success: false; reason: string; }' is not assignable to parameter of type 'PermissionRequestResult'.
  Property 'permission' is missing in type '{ success: false; reason: string; }' but required in type 'PermissionRequestResult'.
src/hooks/receipts/__tests__/useReceiptScanner.test.ts(17,7): error TS2353: Object literal may only specify known properties, and 'size' does not exist in type 'FilePropertyBag'.
src/hooks/receipts/__tests__/useReceiptScanner.test.ts(20,25): error TS2339: Property 'mockClear' does not exist on type '(imageSource: any) => Promise<{ rawText: any; confidence: any; processingTime: number; total: any; merchant: any; date: any; time: any; tax: any; subtotal: any; items: any[]; }>'.
src/hooks/receipts/__tests__/useReceiptScanner.test.ts(59,7): error TS2353: Object literal may only specify known properties, and 'size' does not exist in type 'FilePropertyBag'.
src/hooks/receipts/__tests__/useReceiptScanner.test.ts(79,25): error TS2339: Property 'mockResolvedValue' does not exist on type '(imageSource: any) => Promise<{ rawText: any; confidence: any; processingTime: number; total: any; merchant: any; date: any; time: any; tax: any; subtotal: any; items: any[]; }>'.
src/hooks/receipts/__tests__/useReceiptScanner.test.ts(99,25): error TS2339: Property 'mockRejectedValue' does not exist on type '(imageSource: any) => Promise<{ rawText: any; confidence: any; processingTime: number; total: any; merchant: any; date: any; time: any; tax: any; subtotal: any; items: any[]; }>'.
src/hooks/receipts/__tests__/useReceiptScanner.test.ts(116,25): error TS2339: Property 'mockResolvedValue' does not exist on type '(imageSource: any) => Promise<{ rawText: any; confidence: any; processingTime: number; total: any; merchant: any; date: any; time: any; tax: any; subtotal: any; items: any[]; }>'.
src/hooks/receipts/useReceiptToTransaction.ts(71,53): error TS2345: Argument of type '{ amount: number; description: any; date: any; envelopeId: string; category: string; type: string; notes: string; }' is not assignable to parameter of type 'TransactionInput'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"income" | "expense" | "transfer"'.
src/hooks/receipts/useReceiptToTransaction.ts(77,45): error TS2345: Argument of type '{ merchant: any; amount: any; date: any; transactionId: string; imageData: any; ocrData: { rawText: any; confidence: any; items: any; tax: any; subtotal: any; processingTime: any; }; }' is not assignable to parameter of type 'void'.
src/hooks/savings/__tests__/useSavingsGoalsActions.test.ts(1,22): error TS6133: 'waitFor' is declared but its value is never read.
src/hooks/savings/useSavingsGoals/index.ts(60,23): error TS2339: Property 'length' does not exist on type 'unknown'.
src/hooks/savings/useSavingsGoals/index.ts(100,46): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type '{}'.
src/hooks/savings/useSavingsGoals/index.ts(112,48): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/savings/useSavingsGoals/index.ts(137,29): error TS2339: Property 'find' does not exist on type 'unknown'.
src/hooks/savings/useSavingsGoals/index.ts(142,29): error TS2339: Property 'filter' does not exist on type 'unknown'.
src/hooks/savings/useSavingsGoals/index.ts(147,29): error TS2339: Property 'filter' does not exist on type 'unknown'.
src/hooks/savings/useSavingsGoals/index.ts(152,29): error TS2339: Property 'filter' does not exist on type 'unknown'.
src/hooks/savings/useSavingsGoals/index.ts(157,29): error TS2339: Property 'filter' does not exist on type 'unknown'.
src/hooks/savings/useSavingsGoals/index.ts(162,29): error TS2339: Property 'filter' does not exist on type 'unknown'.
src/hooks/savings/useSavingsGoals/index.ts(167,29): error TS2339: Property 'filter' does not exist on type 'unknown'.
src/hooks/savings/useSavingsGoals/index.ts(172,29): error TS2339: Property 'some' does not exist on type 'unknown'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(25,9): error TS2698: Spread types may only be created from object types.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(31,31): error TS2339: Property 'addSavingsGoal' does not exist on type '{ updateEnvelope: (queryClient: any, envelopeId: any, updates: any) => Promise<void>; addEnvelope: (queryClient: any, newEnvelope: any) => Promise<void>; removeEnvelope: (queryClient: any, envelopeId: any) => Promise<...>; ... 7 more ...; createOptimisticMutation: (queryClient: any, { mutationKey, queryKey, updateFn...'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(51,49): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(57,22): error TS6133: 'goalData' is declared but its value is never read.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(75,26): error TS2339: Property 'goalId' does not exist on type 'void'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(75,34): error TS2339: Property 'updates' does not exist on type 'void'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(89,31): error TS2339: Property 'updateSavingsGoal' does not exist on type '{ updateEnvelope: (queryClient: any, envelopeId: any, updates: any) => Promise<void>; addEnvelope: (queryClient: any, newEnvelope: any) => Promise<void>; removeEnvelope: (queryClient: any, envelopeId: any) => Promise<...>; ... 7 more ...; createOptimisticMutation: (queryClient: any, { mutationKey, queryKey, updateFn...'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(100,49): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(121,31): error TS2339: Property 'deleteSavingsGoal' does not exist on type '{ updateEnvelope: (queryClient: any, envelopeId: any, updates: any) => Promise<void>; addEnvelope: (queryClient: any, newEnvelope: any) => Promise<void>; removeEnvelope: (queryClient: any, envelopeId: any) => Promise<...>; ... 7 more ...; createOptimisticMutation: (queryClient: any, { mutationKey, queryKey, updateFn...'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(124,42): error TS2345: Argument of type 'void' is not assignable to parameter of type 'string'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(126,47): error TS2345: Argument of type 'void' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(132,49): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(151,26): error TS2339: Property 'goalId' does not exist on type 'void'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(151,34): error TS2339: Property 'amount' does not exist on type 'void'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(151,42): error TS2339: Property 'description' does not exist on type 'void'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(176,31): error TS2339: Property 'updateSavingsGoal' does not exist on type '{ updateEnvelope: (queryClient: any, envelopeId: any, updates: any) => Promise<void>; addEnvelope: (queryClient: any, newEnvelope: any) => Promise<void>; removeEnvelope: (queryClient: any, envelopeId: any) => Promise<...>; ... 7 more ...; createOptimisticMutation: (queryClient: any, { mutationKey, queryKey, updateFn...'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(197,39): error TS2345: Argument of type '{ id: string; date: string; description: string; amount: number; envelopeId: string; category: string; type: string; source: string; savingsGoalId: any; notes: string; createdAt: string; }' is not assignable to parameter of type 'Transaction'.
  Property 'lastModified' is missing in type '{ id: string; date: string; description: string; amount: number; envelopeId: string; category: string; type: string; source: string; savingsGoalId: any; notes: string; createdAt: string; }' but required in type 'Transaction'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(198,31): error TS2554: Expected 2 arguments, but got 1.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(211,49): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(231,26): error TS2339: Property 'distribution' does not exist on type 'void'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(231,40): error TS2339: Property 'description' does not exist on type 'void'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(234,26): error TS2365: Operator '+' cannot be applied to types 'unknown' and 'number'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(234,44): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(238,11): error TS2365: Operator '<=' cannot be applied to types 'unknown' and 'number'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(244,47): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(267,33): error TS2339: Property 'updateSavingsGoal' does not exist on type '{ updateEnvelope: (queryClient: any, envelopeId: any, updates: any) => Promise<void>; addEnvelope: (queryClient: any, newEnvelope: any) => Promise<void>; removeEnvelope: (queryClient: any, envelopeId: any) => Promise<...>; ... 7 more ...; createOptimisticMutation: (queryClient: any, { mutationKey, queryKey, updateFn...'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(287,41): error TS2345: Argument of type '{ id: string; date: string; description: string; amount: number; envelopeId: string; category: string; type: string; source: string; savingsGoalId: string; notes: string; createdAt: string; }' is not assignable to parameter of type 'Transaction'.
  Property 'lastModified' is missing in type '{ id: string; date: string; description: string; amount: number; envelopeId: string; category: string; type: string; source: string; savingsGoalId: string; notes: string; createdAt: string; }' but required in type 'Transaction'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(288,33): error TS2554: Expected 2 arguments, but got 1.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(308,46): error TS2339: Property 'toFixed' does not exist on type 'unknown'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(313,49): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/savings/useSavingsGoals/savingsQueries.ts(85,10): error TS2769: No overload matches this call.
  Overload 1 of 3, '(options: DefinedInitialDataOptions<unknown, Error, unknown, (string | boolean)[]>, queryClient?: QueryClient): DefinedUseQueryResult<unknown, Error>', gave the following error.
    Argument of type '{ queryKey: (string | boolean)[]; queryFn: () => Promise<any[]>; staleTime: number; gcTime: number; refetchOnMount: false; refetchOnWindowFocus: false; placeholderData: (previousData: unknown) => unknown; enabled: true; }' is not assignable to parameter of type 'DefinedInitialDataOptions<unknown, Error, unknown, (string | boolean)[]>'.
      Property 'initialData' is missing in type '{ queryKey: (string | boolean)[]; queryFn: () => Promise<any[]>; staleTime: number; gcTime: number; refetchOnMount: false; refetchOnWindowFocus: false; placeholderData: (previousData: unknown) => unknown; enabled: true; }' but required in type '{ initialData: unknown; queryFn?: QueryFunction<unknown, (string | boolean)[]>; }'.
  Overload 2 of 3, '(options: UndefinedInitialDataOptions<any[], Error, any[], (string | boolean)[]>, queryClient?: QueryClient): UseQueryResult<any[], Error>', gave the following error.
    Type '(previousData: unknown) => unknown' is not assignable to type 'any[] | PlaceholderDataFunction<any[], Error, any[], (string | boolean)[]>'.
      Type '(previousData: unknown) => unknown' is not assignable to type 'PlaceholderDataFunction<any[], Error, any[], (string | boolean)[]>'.
        Type '{}' is missing the following properties from type 'any[]': length, pop, push, concat, and 29 more.
  Overload 3 of 3, '(options: UseQueryOptions<any[], Error, any[], (string | boolean)[]>, queryClient?: QueryClient): UseQueryResult<any[], Error>', gave the following error.
    Type '(previousData: unknown) => unknown' is not assignable to type 'any[] | PlaceholderDataFunction<any[], Error, any[], (string | boolean)[]>'.
      Type '(previousData: unknown) => unknown' is not assignable to type 'PlaceholderDataFunction<any[], Error, any[], (string | boolean)[]>'.
        Type '{}' is missing the following properties from type 'any[]': length, pop, push, concat, and 29 more.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(99,57): error TS2345: Argument of type '{ setAttribute: Mock<Procedure>; click: Mock<Procedure>; }' is not assignable to parameter of type 'HTMLElement'.
  Type '{ setAttribute: Mock<Procedure>; click: Mock<Procedure>; }' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 312 more.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(151,32): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<any>'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(204,29): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<{ commit: { hash: string; timestamp: number; message: string; author: string; parentHash: any; encryptedSnapshot: string; deviceFingerprint: string; }; changes: ({ commitHash: string; entityType: string; ... 4 more ...; afterData: { ...; }; } | { ...; })[]; }>'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(224,29): error TS2339: Property 'mockRejectedValue' does not exist on type '() => Promise<{ commit: { hash: string; timestamp: number; message: string; author: string; parentHash: any; encryptedSnapshot: string; deviceFingerprint: string; }; changes: ({ commitHash: string; entityType: string; ... 4 more ...; afterData: { ...; }; } | { ...; })[]; }>'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(138,42): error TS2554: Expected 1 arguments, but got 0.
src/hooks/settings/useTransactionArchiving.ts(37,47): error TS2307: Cannot find module '../../utils/transactionArchiving' or its corresponding type declarations.
src/hooks/settings/useTransactionArchiving.ts(118,13): error TS2339: Property 'onSuccess' does not exist on type '{}'.
src/hooks/settings/useTransactionArchiving.ts(118,24): error TS2339: Property 'onError' does not exist on type '{}'.
src/hooks/settings/useTransactionArchiving.ts(118,33): error TS2339: Property '_onReset' does not exist on type '{}'.
src/hooks/settings/useTransactionArchiving.ts(118,33): error TS6133: '_onReset' is declared but its value is never read.
src/hooks/sharing/useBudgetJoining.ts(65,27): error TS2345: Argument of type 'Location' is not assignable to parameter of type 'string | URL'.
  Type 'Location' is missing the following properties from type 'URL': password, searchParams, username, toJSON
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(28,5): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(32,5): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(33,5): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(119,7): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(131,7): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(207,7): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/useFirebaseSync.ts(108,9): error TS6133: '_handleManualSave' is declared but its value is never read.
src/hooks/sync/useFirebaseSync.ts(113,28): error TS2339: Property 'success' does not exist on type 'unknown'.
src/hooks/sync/useFirebaseSync.ts(132,28): error TS2339: Property 'success' does not exist on type 'unknown'.
src/hooks/sync/useFirebaseSync.ts(134,49): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type '{}'.
src/hooks/sync/useManualSync.ts(234,7): error TS2322: Type '{ isSyncing: boolean; isRunning: boolean; lastSyncTime: number; syncIntervalMs: number; syncType: string; hasConfig: boolean; }' is not assignable to type 'ServiceStatus'.
  Types of property 'lastSyncTime' are incompatible.
    Type 'number' is not assignable to type 'Date'.
src/hooks/sync/useSyncHealthIndicator.ts(133,65): error TS2345: Argument of type 'ValidationSummary' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'ValidationSummary'.
src/hooks/transactions/__tests__/useTransactionAnalytics.test.ts(2,22): error TS6133: 'act' is declared but its value is never read.
src/hooks/transactions/__tests__/useTransactionAnalytics.test.ts(3,8): error TS2613: Module '"violet-vault/src/hooks/transactions/useTransactionAnalytics"' has no default export. Did you mean to use 'import { useTransactionAnalytics } from "/Users/thef4tdaddy/Git/violet-vault/src/hooks/transactions/useTransactionAnalytics"' instead?
src/hooks/transactions/__tests__/useTransactionAnalytics.test.ts(239,18): error TS2322: Type '({ id: string; description: string; amount: number; date: string; category: string; tags: string[]; } | { id: string; description: string; amount: number; date: string; category: string; })[]' is not assignable to type '{ id: string; description: string; amount: number; date: string; category: string; tags: string[]; }[]'.
  Type '{ id: string; description: string; amount: number; date: string; category: string; tags: string[]; } | { id: string; description: string; amount: number; date: string; category: string; }' is not assignable to type '{ id: string; description: string; amount: number; date: string; category: string; tags: string[]; }'.
    Property 'tags' is missing in type '{ id: string; description: string; amount: number; date: string; category: string; }' but required in type '{ id: string; description: string; amount: number; date: string; category: string; tags: string[]; }'.
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(3,8): error TS2613: Module '"violet-vault/src/hooks/transactions/useTransactionBalanceUpdater"' has no default export. Did you mean to use 'import { useTransactionBalanceUpdater } from "/Users/thef4tdaddy/Git/violet-vault/src/hooks/transactions/useTransactionBalanceUpdater"' instead?
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(1,22): error TS6133: 'act' is declared but its value is never read.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(70,81): error TS2554: Expected 1 arguments, but got 2.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(85,47): error TS2554: Expected 1 arguments, but got 2.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(101,47): error TS2554: Expected 1 arguments, but got 2.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(118,47): error TS2554: Expected 1 arguments, but got 2.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(136,47): error TS2554: Expected 1 arguments, but got 2.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(155,47): error TS2554: Expected 1 arguments, but got 2.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(181,47): error TS2554: Expected 1 arguments, but got 2.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(200,67): error TS2554: Expected 1 arguments, but got 2.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(207,69): error TS2554: Expected 1 arguments, but got 2.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(221,74): error TS2554: Expected 1 arguments, but got 2.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(249,74): error TS2554: Expected 1 arguments, but got 2.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(289,74): error TS2554: Expected 1 arguments, but got 2.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(4,8): error TS2613: Module '"violet-vault/src/hooks/transactions/useTransactionMutations"' has no default export. Did you mean to use 'import { useTransactionMutations } from "/Users/thef4tdaddy/Git/violet-vault/src/hooks/transactions/useTransactionMutations"' instead?
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(41,20): error TS2339: Property 'mockReturnValue' does not exist on type '(queryClient?: QueryClient) => QueryClient'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(53,19): error TS2339: Property 'mockReturnValue' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TOnMutateResult = unknown>(options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(77,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TOnMutateResult = unknown>(options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(107,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TOnMutateResult = unknown>(options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(131,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TOnMutateResult = unknown>(options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(147,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TOnMutateResult = unknown>(options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(177,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TOnMutateResult = unknown>(options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(193,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TOnMutateResult = unknown>(options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(219,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TOnMutateResult = unknown>(options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(238,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TOnMutateResult = unknown>(options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(4,8): error TS2613: Module '"violet-vault/src/hooks/transactions/useTransactionQuery"' has no default export. Did you mean to use 'import { useTransactionQuery } from "/Users/thef4tdaddy/Git/violet-vault/src/hooks/transactions/useTransactionQuery"' instead?
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(41,14): error TS2339: Property 'mockReturnValue' does not exist on type '{ <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKey extends QueryKey = readonly unknown[]>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<...>; <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKe...'.
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(65,14): error TS2339: Property 'mockReturnValue' does not exist on type '{ <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKey extends QueryKey = readonly unknown[]>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<...>; <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKe...'.
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(82,14): error TS2339: Property 'mockReturnValue' does not exist on type '{ <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKey extends QueryKey = readonly unknown[]>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<...>; <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKe...'.
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(100,14): error TS2339: Property 'mockReturnValue' does not exist on type '{ <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKey extends QueryKey = readonly unknown[]>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<...>; <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKe...'.
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(115,14): error TS2339: Property 'mockReturnValue' does not exist on type '{ <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKey extends QueryKey = readonly unknown[]>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<...>; <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKe...'.
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(131,14): error TS2339: Property 'mockReturnValue' does not exist on type '{ <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKey extends QueryKey = readonly unknown[]>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<...>; <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKe...'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(3,8): error TS2613: Module '"violet-vault/src/hooks/transactions/useTransactionSplitterUI"' has no default export. Did you mean to use 'import { useTransactionSplitterUI } from "/Users/thef4tdaddy/Git/violet-vault/src/hooks/transactions/useTransactionSplitterUI"' instead?
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
src/hooks/transactions/helpers/transactionDataHelpers.ts(56,26): error TS2339: Property 'account' does not exist on type 'Transaction'.
src/hooks/transactions/helpers/transactionDataHelpers.ts(93,43): error TS2339: Property 'isSplit' does not exist on type 'Transaction'.
src/hooks/transactions/helpers/transactionDataHelpers.ts(93,58): error TS2339: Property 'parentTransactionId' does not exist on type 'Transaction'.
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(41,33): error TS2551: Property 'addTransaction' does not exist on type 'VioletVaultDB'. Did you mean 'Transaction'?
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(53,34): error TS2551: Property 'getTransaction' does not exist on type 'VioletVaultDB'. Did you mean 'transaction'?
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(65,33): error TS2339: Property 'updateTransaction' does not exist on type 'VioletVaultDB'.
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(76,18): error TS2339: Property 'deleteTransaction' does not exist on type 'VioletVaultDB'.
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(112,18): error TS2339: Property 'updateTransaction' does not exist on type 'VioletVaultDB'.
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(117,35): error TS2551: Property 'addTransaction' does not exist on type 'VioletVaultDB'. Did you mean 'Transaction'?
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(137,41): error TS2551: Property 'addTransaction' does not exist on type 'VioletVaultDB'. Did you mean 'Transaction'?
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(140,41): error TS2551: Property 'addTransaction' does not exist on type 'VioletVaultDB'. Did you mean 'Transaction'?
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(169,24): error TS2339: Property 'deleteTransaction' does not exist on type 'VioletVaultDB'.
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(178,39): error TS2339: Property 'updateTransaction' does not exist on type 'VioletVaultDB'.
src/hooks/transactions/helpers/transactionOperationsHelpers.ts(187,39): error TS2339: Property 'updateTransaction' does not exist on type 'VioletVaultDB'.
src/hooks/transactions/helpers/useLedgerOperations.ts(9,3): error TS6133: 'updateTransaction' is declared but its value is never read.
src/hooks/transactions/useTransactionBalanceUpdater.ts(45,7): error TS2353: Object literal may only specify known properties, and 'updatedAt' does not exist in type 'UpdateSpec<Envelope> | ((obj: Envelope, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/hooks/transactions/useTransactionData.ts(38,5): error TS2339: Property 'dateRange' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(39,5): error TS2339: Property 'envelopeId' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(40,5): error TS2339: Property 'category' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(41,5): error TS2339: Property 'type' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(42,5): error TS2339: Property 'searchQuery' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(45,5): error TS2339: Property 'sortBy' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(46,5): error TS2339: Property 'sortOrder' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(47,5): error TS2339: Property 'limit' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(50,5): error TS2339: Property 'enabled' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(51,5): error TS2339: Property 'staleTime' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(52,5): error TS2339: Property 'refetchInterval' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(82,45): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, description, amount, category
src/hooks/transactions/useTransactionData.ts(118,40): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, description, amount, category
src/hooks/transactions/useTransactionData.ts(131,33): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, amount, envelopeId, and 3 more.
src/hooks/transactions/useTransactionData.ts(135,33): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, amount, envelopeId, and 3 more.
src/hooks/transactions/useTransactionData.ts(139,34): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, amount, envelopeId, and 3 more.
src/hooks/transactions/useTransactionData.ts(143,35): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, amount, envelopeId, and 3 more.
src/hooks/transactions/useTransactionData.ts(147,32): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, amount, envelopeId, and 3 more.
src/hooks/transactions/useTransactionData.ts(151,40): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, amount, envelopeId, and 3 more.
src/hooks/transactions/useTransactionData.ts(157,53): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, amount, envelopeId, and 3 more.
src/hooks/transactions/useTransactionData.ts(161,44): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, amount, envelopeId, and 3 more.
src/hooks/transactions/useTransactionData.ts(165,46): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, amount, envelopeId, and 3 more.
src/hooks/transactions/useTransactionData.ts(169,47): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, amount, envelopeId, and 3 more.
src/hooks/transactions/useTransactionFileUpload.ts(19,21): error TS2353: Object literal may only specify known properties, and 'clearExisting' does not exist in type 'SetStateAction<any[]>'.
src/hooks/transactions/useTransactionFileUpload.ts(19,44): error TS2339: Property 'clearExisting' does not exist on type '{}'.
src/hooks/transactions/useTransactionFileUpload.ts(28,33): error TS2345: Argument of type 'string | ArrayBuffer' is not assignable to parameter of type 'string'.
  Type 'ArrayBuffer' is not assignable to type 'string'.
src/hooks/transactions/useTransactionFileUpload.ts(30,33): error TS2345: Argument of type 'string | ArrayBuffer' is not assignable to parameter of type 'string'.
  Type 'ArrayBuffer' is not assignable to type 'string'.
src/hooks/transactions/useTransactionFileUpload.ts(41,11): error TS2353: Object literal may only specify known properties, and 'data' does not exist in type 'SetStateAction<any[]>'.
src/hooks/transactions/useTransactionFileUpload.ts(42,34): error TS2339: Property 'clearExisting' does not exist on type '{}'.
src/hooks/transactions/useTransactionLedger.ts(32,32): error TS2339: Property 'updateTransaction' does not exist on type 'unknown'.
src/hooks/transactions/useTransactionLedger.ts(33,33): error TS2339: Property 'setAllTransactions' does not exist on type 'unknown'.
src/hooks/transactions/useTransactionLedger.ts(34,25): error TS2339: Property 'updateBill' does not exist on type 'unknown'.
src/hooks/transactions/useTransactionLedger.ts(49,66): error TS2345: Argument of type 'number' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/transactions/useTransactionLedger.ts(66,59): error TS2554: Expected 2 arguments, but got 3.
src/hooks/transactions/useTransactionLedger.ts(70,5): error TS2554: Expected 1 arguments, but got 7.
src/hooks/transactions/useTransactionLedger.ts(111,22): error TS2345: Argument of type '{ amount: number; createdBy: any; createdAt: string; importSource: string; date: string; description: string; type: string; envelopeId: string; category: string; notes: string; reconciled: boolean; id: number; }' is not assignable to parameter of type 'TransactionInput'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"income" | "expense" | "transfer"'.
src/hooks/transactions/useTransactionMutations.ts(102,9): error TS2353: Object literal may only specify known properties, and 'reconciledAt' does not exist in type 'Transaction'.
src/hooks/transactions/useTransactionOperations.ts(26,11): error TS2339: Property 'categoryRules' does not exist on type '{}'.
src/hooks/transactions/useTransactionOperations.ts(49,26): error TS2339: Property 'id' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(49,30): error TS2339: Property 'updates' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(50,17): error TS6133: 'data' is declared but its value is never read.
src/hooks/transactions/useTransactionOperations.ts(53,71): error TS2339: Property 'id' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(56,75): error TS2339: Property 'id' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(65,66): error TS2345: Argument of type 'void' is not assignable to parameter of type 'string'.
src/hooks/transactions/useTransactionOperations.ts(81,26): error TS2339: Property 'originalTransaction' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(81,47): error TS2339: Property 'splitTransactions' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(120,26): error TS2339: Property 'operation' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(120,37): error TS2339: Property 'transactions' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(120,51): error TS2339: Property 'updates' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(125,37): error TS2339: Property 'operation' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(128,38): error TS2339: Property 'operation' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(142,52): error TS2345: Argument of type '{ id: any; updates: any; }' is not assignable to parameter of type 'void'.
src/hooks/transactions/useTransactionOperations.ts(156,51): error TS2345: Argument of type '{ originalTransaction: any; splitTransactions: any; }' is not assignable to parameter of type 'void'.
src/hooks/transactions/useTransactionOperations.ts(173,48): error TS2345: Argument of type '{ operation: any; transactions: any; updates: any; }' is not assignable to parameter of type 'void'.
src/hooks/transactions/useTransactionSplitter.ts(30,11): error TS2339: Property 'transaction' does not exist on type '{}'.
src/hooks/transactions/useTransactionSplitter.ts(30,24): error TS2339: Property 'envelopes' does not exist on type '{}'.
src/hooks/transactions/useTransactionSplitter.ts(30,40): error TS2339: Property 'onSplit' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(21,5): error TS2339: Property 'dateRange' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(22,5): error TS2339: Property 'envelopeId' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(23,5): error TS2339: Property 'category' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(24,5): error TS2339: Property 'type' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(25,5): error TS2339: Property 'searchQuery' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(26,5): error TS2339: Property 'sortBy' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(27,5): error TS2339: Property 'sortOrder' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(28,5): error TS2339: Property 'limit' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(31,5): error TS2339: Property 'categoryRules' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(34,5): error TS2339: Property 'enabled' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(35,5): error TS2339: Property 'staleTime' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(36,5): error TS2339: Property 'refetchInterval' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(42,33): error TS2339: Property 'updateTransactions' does not exist on type 'unknown'.
src/main.tsx(250,50): error TS2345: Argument of type 'number' is not assignable to parameter of type 'Record<string, unknown>'.
src/main.tsx(251,43): error TS2345: Argument of type 'number' is not assignable to parameter of type 'Record<string, unknown>'.
src/main.tsx(257,49): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/services/__tests__/budgetDatabaseService.test.ts(52,5): error TS1117: An object literal cannot have multiple properties with the same name.
src/services/__tests__/budgetDatabaseService.test.ts(53,5): error TS1117: An object literal cannot have multiple properties with the same name.
src/services/__tests__/budgetDatabaseService.test.ts(78,21): error TS2339: Property 'mockResolvedValue' does not exist on type '() => PromiseExtended<Dexie>'.
src/services/__tests__/budgetDatabaseService.test.ts(88,21): error TS2339: Property 'mockRejectedValue' does not exist on type '() => PromiseExtended<Dexie>'.
src/services/__tests__/budgetDatabaseService.test.ts(107,33): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<DatabaseStats>'.
src/services/__tests__/budgetDatabaseService.test.ts(123,35): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<Envelope[]>'.
src/services/__tests__/budgetDatabaseService.test.ts(134,39): error TS2339: Property 'mockResolvedValue' does not exist on type '(category: string, includeArchived?: boolean) => Promise<Envelope[]>'.
src/services/__tests__/budgetDatabaseService.test.ts(148,31): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string, maxAge?: number) => Promise<unknown>'.
src/services/__tests__/budgetDatabaseService.test.ts(166,36): error TS2339: Property 'mockResolvedValue' does not exist on type '(envelopes: Envelope[]) => Promise<void>'.
src/services/__tests__/budgetDatabaseService.test.ts(167,35): error TS2339: Property 'mockResolvedValue' does not exist on type '(category: string) => Promise<void>'.
src/services/__tests__/budgetDatabaseService.test.ts(188,43): error TS2339: Property 'mockResolvedValue' does not exist on type '(startDate: Date, endDate: Date) => Promise<Transaction[]>'.
src/services/__tests__/budgetDatabaseService.test.ts(205,42): error TS2339: Property 'mockResolvedValue' does not exist on type '(envelopeId: string, dateRange?: DateRange) => Promise<Transaction[]>'.
src/services/__tests__/budgetDatabaseService.test.ts(226,43): error TS2339: Property 'mockResolvedValue' does not exist on type '(startDate: Date, endDate: Date) => Promise<Transaction[]>'.
src/services/__tests__/budgetDatabaseService.test.ts(243,33): error TS2339: Property 'mockResolvedValue' does not exist on type '(daysAhead?: number) => Promise<Bill[]>'.
src/services/__tests__/budgetDatabaseService.test.ts(244,32): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<Bill[]>'.
src/services/__tests__/budgetDatabaseService.test.ts(259,29): error TS2339: Property 'mockResolvedValue' does not exist on type '(dateRange?: DateRange) => Promise<Bill[]>'.
src/services/__tests__/budgetDatabaseService.test.ts(278,27): error TS2339: Property 'mockResolvedValue' does not exist on type '{ (key: string): PromiseExtended<BudgetRecord>; <R>(key: string, thenShortcut: ThenShortcut<BudgetRecord, R>): PromiseExtended<...>; (equalityCriterias: { ...; }): PromiseExtended<...>; <R>(equalityCriterias: { ...; }, thenShortcut: ThenShortcut<...>): PromiseExtended<...>; }'.
src/services/__tests__/budgetDatabaseService.test.ts(287,27): error TS2339: Property 'mockResolvedValue' does not exist on type '{ (key: string): PromiseExtended<BudgetRecord>; <R>(key: string, thenShortcut: ThenShortcut<BudgetRecord, R>): PromiseExtended<...>; (equalityCriterias: { ...; }): PromiseExtended<...>; <R>(equalityCriterias: { ...; }, thenShortcut: ThenShortcut<...>): PromiseExtended<...>; }'.
src/services/__tests__/budgetDatabaseService.test.ts(303,31): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string, maxAge?: number) => Promise<unknown>'.
src/services/__tests__/budgetDatabaseService.test.ts(304,33): error TS2339: Property 'mockResolvedValue' does not exist on type '(dateRange: DateRange, includeTransfers?: boolean) => Promise<Transaction[]>'.
src/services/__tests__/budgetDatabaseService.test.ts(305,31): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string, value: unknown, ttl?: number, category?: string) => Promise<void>'.
src/services/__tests__/budgetDatabaseService.test.ts(324,31): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string, maxAge?: number) => Promise<unknown>'.
src/services/__tests__/budgetDatabaseService.test.ts(337,28): error TS2339: Property 'mockImplementation' does not exist on type '{ <U>(mode: TransactionMode, tables: readonly (string | Table<any, any, any>)[], scope: (trans: Transaction & { transactions: Table<Transaction, string, Transaction>; ... 12 more ...; autoBackups: Table<...>; }) => U | PromiseLike<...>): PromiseExtended<...>; <U>(mode: TransactionMode, table: string | Table<...>, sc...'.
src/services/__tests__/budgetDatabaseService.test.ts(337,48): error TS6133: 'mode' is declared but its value is never read.
src/services/__tests__/budgetDatabaseService.test.ts(337,54): error TS6133: 'tables' is declared but its value is never read.
src/services/__tests__/budgetDatabaseService.test.ts(354,23): error TS2339: Property 'mockReturnValue' does not exist on type '() => boolean'.
src/services/__tests__/budgetHistoryService.test.ts(111,49): error TS2339: Property 'mockReturnValue' does not exist on type '() => string'.
src/services/__tests__/budgetHistoryService.test.ts(112,36): error TS2339: Property 'mockReturnValue' does not exist on type '(data: any) => string'.
src/services/__tests__/budgetHistoryService.test.ts(113,35): error TS2339: Property 'mockResolvedValue' does not exist on type '(commit: BudgetCommit) => Promise<string>'.
src/services/__tests__/budgetHistoryService.test.ts(114,36): error TS2339: Property 'mockResolvedValue' does not exist on type '(changes: BudgetChange[]) => Promise<number>'.
src/services/__tests__/budgetHistoryService.test.ts(154,35): error TS2339: Property 'mockRejectedValue' does not exist on type '(commit: BudgetCommit) => Promise<string>'.
src/services/__tests__/budgetHistoryService.test.ts(173,36): error TS2339: Property 'mockReturnValue' does not exist on type '(data: any) => string'.
src/services/__tests__/budgetHistoryService.test.ts(174,35): error TS2339: Property 'mockResolvedValue' does not exist on type '(commit: BudgetCommit) => Promise<string>'.
src/services/__tests__/budgetHistoryService.test.ts(175,36): error TS2339: Property 'mockResolvedValue' does not exist on type '(changes: BudgetChange[]) => Promise<number>'.
src/services/__tests__/budgetHistoryService.test.ts(193,36): error TS2339: Property 'mockReturnValue' does not exist on type '(data: any) => string'.
src/services/__tests__/budgetHistoryService.test.ts(194,35): error TS2339: Property 'mockResolvedValue' does not exist on type '(commit: BudgetCommit) => Promise<string>'.
src/services/__tests__/budgetHistoryService.test.ts(195,36): error TS2339: Property 'mockResolvedValue' does not exist on type '(changes: BudgetChange[]) => Promise<number>'.
src/services/__tests__/budgetHistoryService.test.ts(214,36): error TS2339: Property 'mockReturnValue' does not exist on type '(data: any) => string'.
src/services/__tests__/budgetHistoryService.test.ts(215,35): error TS2339: Property 'mockResolvedValue' does not exist on type '(commit: BudgetCommit) => Promise<string>'.
src/services/__tests__/budgetHistoryService.test.ts(216,36): error TS2339: Property 'mockResolvedValue' does not exist on type '(changes: BudgetChange[]) => Promise<number>'.
src/services/__tests__/budgetHistoryService.test.ts(237,36): error TS2339: Property 'mockReturnValue' does not exist on type '(data: any) => string'.
src/services/__tests__/budgetHistoryService.test.ts(238,35): error TS2339: Property 'mockResolvedValue' does not exist on type '(commit: BudgetCommit) => Promise<string>'.
src/services/__tests__/budgetHistoryService.test.ts(239,36): error TS2339: Property 'mockResolvedValue' does not exist on type '(changes: BudgetChange[]) => Promise<number>'.
src/services/__tests__/budgetHistoryService.test.ts(258,36): error TS2339: Property 'mockReturnValue' does not exist on type '(data: any) => string'.
src/services/__tests__/budgetHistoryService.test.ts(259,35): error TS2339: Property 'mockResolvedValue' does not exist on type '(commit: BudgetCommit) => Promise<string>'.
src/services/__tests__/budgetHistoryService.test.ts(260,36): error TS2339: Property 'mockResolvedValue' does not exist on type '(changes: BudgetChange[]) => Promise<number>'.
src/services/__tests__/budgetHistoryService.test.ts(277,36): error TS2339: Property 'mockReturnValue' does not exist on type '(data: any) => string'.
src/services/__tests__/budgetHistoryService.test.ts(278,35): error TS2339: Property 'mockResolvedValue' does not exist on type '(commit: BudgetCommit) => Promise<string>'.
src/services/__tests__/budgetHistoryService.test.ts(279,36): error TS2339: Property 'mockResolvedValue' does not exist on type '(changes: BudgetChange[]) => Promise<number>'.
src/services/__tests__/budgetHistoryService.test.ts(312,36): error TS2339: Property 'mockReturnValue' does not exist on type '{ (index: string | string[]): WhereClause<BudgetChange, number, BudgetChange>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetChange, number, BudgetChange>; }'.
src/services/__tests__/budgetHistoryService.test.ts(322,36): error TS2339: Property 'mockImplementation' does not exist on type '{ (index: string | string[]): WhereClause<BudgetChange, number, BudgetChange>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetChange, number, BudgetChange>; }'.
src/services/__tests__/budgetHistoryService.test.ts(336,37): error TS2339: Property 'mockReturnValue' does not exist on type '{ (index: string | string[]): WhereClause<BudgetBranch, number, BudgetBranch>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetBranch, number, BudgetBranch>; }'.
src/services/__tests__/budgetHistoryService.test.ts(342,36): error TS2339: Property 'mockReturnValue' does not exist on type '{ (index: string | string[]): WhereClause<BudgetCommit, string, BudgetCommit>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetCommit, string, BudgetCommit>; }'.
src/services/__tests__/budgetHistoryService.test.ts(348,35): error TS2339: Property 'mockResolvedValue' does not exist on type '(branch: BudgetBranch) => Promise<number>'.
src/services/__tests__/budgetHistoryService.test.ts(366,37): error TS2339: Property 'mockReturnValue' does not exist on type '{ (index: string | string[]): WhereClause<BudgetBranch, number, BudgetBranch>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetBranch, number, BudgetBranch>; }'.
src/services/__tests__/budgetHistoryService.test.ts(384,37): error TS2339: Property 'mockReturnValue' does not exist on type '{ (index: string | string[]): WhereClause<BudgetBranch, number, BudgetBranch>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetBranch, number, BudgetBranch>; }'.
src/services/__tests__/budgetHistoryService.test.ts(390,36): error TS2339: Property 'mockReturnValue' does not exist on type '{ (index: string | string[]): WhereClause<BudgetCommit, string, BudgetCommit>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetCommit, string, BudgetCommit>; }'.
src/services/__tests__/budgetHistoryService.test.ts(412,33): error TS2339: Property 'mockReturnValue' does not exist on type '{ (index: string | string[]): WhereClause<BudgetTag, number, BudgetTag>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetTag, number, BudgetTag>; }'.
src/services/__tests__/budgetHistoryService.test.ts(418,36): error TS2339: Property 'mockReturnValue' does not exist on type '{ (index: string | string[]): WhereClause<BudgetCommit, string, BudgetCommit>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetCommit, string, BudgetCommit>; }'.
src/services/__tests__/budgetHistoryService.test.ts(424,32): error TS2339: Property 'mockResolvedValue' does not exist on type '(tag: BudgetTag) => Promise<number>'.
src/services/__tests__/budgetHistoryService.test.ts(445,36): error TS2339: Property 'mockReturnValue' does not exist on type '{ (index: string | string[]): WhereClause<BudgetCommit, string, BudgetCommit>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetCommit, string, BudgetCommit>; }'.
src/services/__tests__/budgetHistoryService.test.ts(469,36): error TS2339: Property 'mockReturnValue' does not exist on type '{ (index: string | string[]): WhereClause<BudgetCommit, string, BudgetCommit>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetCommit, string, BudgetCommit>; }'.
src/services/__tests__/budgetHistoryService.test.ts(493,36): error TS2339: Property 'mockReturnValue' does not exist on type '{ (index: string | string[]): WhereClause<BudgetCommit, string, BudgetCommit>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetCommit, string, BudgetCommit>; }'.
src/services/__tests__/budgetHistoryService.test.ts(517,36): error TS2339: Property 'mockResolvedValue' does not exist on type '{ (): PromiseExtended<number>; <R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>; }'.
src/services/__tests__/budgetHistoryService.test.ts(523,38): error TS2339: Property 'mockReturnValue' does not exist on type '(index: string | string[]) => Collection<BudgetCommit, string, BudgetCommit>'.
src/services/__tests__/budgetHistoryService.test.ts(529,41): error TS2339: Property 'mockResolvedValue' does not exist on type '(keys: string[]) => PromiseExtended<void>'.
src/services/__tests__/budgetHistoryService.test.ts(530,36): error TS2339: Property 'mockReturnValue' does not exist on type '{ (index: string | string[]): WhereClause<BudgetChange, number, BudgetChange>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetChange, number, BudgetChange>; }'.
src/services/__tests__/budgetHistoryService.test.ts(543,36): error TS2339: Property 'mockResolvedValue' does not exist on type '{ (): PromiseExtended<number>; <R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>; }'.
src/services/__tests__/integration/syncIntegration.test.ts(2,55): error TS6133: 'vi' is declared but its value is never read.
src/services/__tests__/integration/syncIntegration.test.ts(20,47): error TS2339: Property 'generateEncryptionKey' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/services/__tests__/integration/syncIntegration.test.ts(122,38): error TS2339: Property 'name' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(123,38): error TS2339: Property 'name' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(124,38): error TS2339: Property 'balance' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(145,32): error TS2339: Property 'description' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(146,32): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(164,31): error TS2339: Property 'name' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(165,31): error TS2339: Property 'isPaid' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(180,29): error TS2339: Property 'isPaid' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(210,25): error TS2339: Property 'unassignedCash' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(211,25): error TS2339: Property 'actualBalance' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(218,36): error TS2339: Property 'description' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(239,58): error TS2339: Property 'encryptForCloud' does not exist on type 'FirebaseSyncService'.
src/services/__tests__/integration/syncIntegration.test.ts(240,39): error TS2339: Property 'encryptForCloud' does not exist on type 'FirebaseSyncService'.
src/services/__tests__/integration/syncIntegration.test.ts(377,23): error TS2339: Property 'envelopes' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(378,63): error TS2339: Property 'envelopes' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(380,23): error TS2339: Property 'transactions' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(381,66): error TS2339: Property 'transactions' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(383,23): error TS2339: Property 'bills' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(384,59): error TS2339: Property 'bills' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(500,13): error TS2322: Type 'string' is not assignable to type 'boolean'.
src/services/__tests__/integration/syncIntegration.test.ts(508,22): error TS2339: Property 'name' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(508,39): error TS2339: Property 'balance' does not exist on type 'unknown'.
src/services/__tests__/integration/syncIntegration.test.ts(508,72): error TS2339: Property 'archived' does not exist on type 'unknown'.
src/services/__tests__/syncErrorHandling.test.ts(1,32): error TS6133: 'beforeEach' is declared but its value is never read.
src/services/__tests__/syncErrorHandling.test.ts(165,50): error TS6133: 'auth' is declared but its value is never read.
src/services/__tests__/types/firebaseTypes.test.ts(6,48): error TS6133: 'afterEach' is declared but its value is never read.
src/services/__tests__/types/firebaseTypes.test.ts(72,45): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/services/__tests__/types/firebaseTypes.test.ts(94,55): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<boolean>'.
src/services/__tests__/types/firebaseTypes.test.ts(102,55): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<boolean>'.
src/services/__tests__/types/firebaseTypes.test.ts(110,55): error TS2339: Property 'mockRejectedValue' does not exist on type '() => Promise<boolean>'.
src/services/__tests__/types/firebaseTypes.test.ts(122,47): error TS2339: Property 'mockResolvedValue' does not exist on type '(data: unknown, metadata?: SyncMetadata) => Promise<boolean>'.
src/services/__tests__/types/firebaseTypes.test.ts(143,75): error TS2345: Argument of type '{ version: number; }' is not assignable to parameter of type 'Partial<SyncMetadata>'.
  Types of property 'version' are incompatible.
    Type 'number' is not assignable to type 'string'.
src/services/__tests__/types/firebaseTypes.test.ts(152,49): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<unknown>'.
src/services/__tests__/types/firebaseTypes.test.ts(162,49): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<unknown>'.
src/services/__tests__/types/firebaseTypes.test.ts(234,45): error TS2339: Property 'mockResolvedValue' does not exist on type '(budgetId: any, encryptionKey: any) => Promise<void>'.
src/services/__tests__/types/firebaseTypes.test.ts(235,43): error TS2339: Property 'mockReturnValue' does not exist on type '() => { resilience: any; phase1: { mutexEnabled: boolean; validationEnabled: boolean; }; phase2: { retryEnabled: boolean; circuitBreakerEnabled: boolean; queueEnabled: boolean; }; maxChunkSize: number; maxArrayChunkSize: number; isInitialized: boolean; }'.
src/services/__tests__/types/firebaseTypes.test.ts(263,74): error TS2345: Argument of type '{ uid: string; }' is not assignable to parameter of type '{ readonly uid: string; readonly userName: string; }'.
  Property 'userName' is missing in type '{ uid: string; }' but required in type '{ readonly uid: string; readonly userName: string; }'.
src/services/__tests__/types/firebaseTypes.test.ts(271,46): error TS2339: Property 'mockResolvedValue' does not exist on type '(data: any, currentUser: any) => Promise<any>'.
src/services/authService.ts(97,11): error TS6133: '_decryptedData' is declared but its value is never read.
src/services/authService.ts(149,38): error TS2554: Expected 0 arguments, but got 1.
src/services/authService.ts(282,38): error TS2554: Expected 0 arguments, but got 1.
src/services/bugReport/__tests__/index.test.ts(65,3): error TS2554: Expected 1-2 arguments, but got 3.
src/services/bugReport/__tests__/index.test.ts(73,41): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/services/bugReport/__tests__/index.test.ts(74,41): error TS2339: Property 'mockReturnValue' does not exist on type '(dataUrl: any) => { size: number; sizeKB: number; format: string; timestamp: string; }'.
src/services/bugReport/__tests__/index.test.ts(75,46): error TS2339: Property 'mockImplementation' does not exist on type '(dataUrl: any) => Promise<any>'.
src/services/bugReport/__tests__/index.test.ts(77,41): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<SystemInfo>'.
src/services/bugReport/__tests__/index.test.ts(83,50): error TS2339: Property 'mockReturnValue' does not exist on type '() => PageContext'.
src/services/bugReport/__tests__/index.test.ts(88,44): error TS2339: Property 'mockReturnValue' does not exist on type '(reportData: BugReportData) => ValidationResult'.
src/services/bugReport/__tests__/index.test.ts(94,25): error TS2339: Property 'prepareReportData' does not exist on type 'typeof BugReportAPIService'.
src/services/bugReport/__tests__/index.test.ts(96,45): error TS2339: Property 'mockResolvedValue' does not exist on type '(reportData: BugReportData, providers?: ProviderConfig[]) => Promise<FallbackSubmissionResult>'.
src/services/bugReport/__tests__/index.test.ts(115,21): error TS2339: Property 'submissionId' does not exist on type '{ reportData: { title: any; hasScreenshot: boolean; systemInfo: SystemInfo; }; overallSuccess: boolean; error?: string; validationErrors?: string[]; attempts: number; results: unknown[]; success: boolean; }'.
src/services/bugReport/__tests__/index.test.ts(135,46): error TS2339: Property 'mockReturnValue' does not exist on type '(reportData: BugReportData) => ValidationResult'.
src/services/bugReport/__tests__/index.test.ts(151,47): error TS2339: Property 'mockRejectedValue' does not exist on type '(reportData: BugReportData, providers?: ProviderConfig[]) => Promise<FallbackSubmissionResult>'.
src/services/bugReport/__tests__/index.test.ts(179,43): error TS2339: Property 'mockRejectedValue' does not exist on type '() => Promise<SystemInfo>'.
src/services/bugReport/__tests__/index.test.ts(180,47): error TS2339: Property 'mockReturnValue' does not exist on type '() => SystemInfo'.
src/services/bugReport/__tests__/index.test.ts(183,49): error TS2339: Property 'mockReturnValue' does not exist on type '() => PageContext'.
src/services/bugReport/__tests__/index.test.ts(198,43): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/services/bugReport/__tests__/index.test.ts(199,43): error TS2339: Property 'mockReturnValue' does not exist on type '(dataUrl: any) => { size: number; sizeKB: number; format: string; timestamp: string; }'.
src/services/bugReport/__tests__/index.test.ts(209,43): error TS2339: Property 'mockRejectedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/services/bugReport/__tests__/index.test.ts(220,43): error TS2339: Property 'mockReturnValue' does not exist on type '(dataUrl: any) => { size: number; sizeKB: number; format: string; timestamp: string; }'.
src/services/bugReport/__tests__/index.test.ts(222,47): error TS2339: Property 'mockResolvedValue' does not exist on type '(reportData: BugReportData, providers?: ProviderConfig[]) => Promise<FallbackSubmissionResult>'.
src/services/bugReport/__tests__/index.test.ts(229,21): error TS2339: Property 'screenshotStatus' does not exist on type 'FallbackSubmissionResult'.
src/services/bugReport/__tests__/index.test.ts(230,21): error TS2339: Property 'screenshotStatus' does not exist on type 'FallbackSubmissionResult'.
src/services/bugReport/__tests__/index.test.ts(231,21): error TS2339: Property 'screenshotStatus' does not exist on type 'FallbackSubmissionResult'.
src/services/bugReport/__tests__/index.test.ts(232,21): error TS2339: Property 'screenshotStatus' does not exist on type 'FallbackSubmissionResult'.
src/services/bugReport/__tests__/index.test.ts(237,43): error TS2339: Property 'mockReturnValue' does not exist on type '(dataUrl: any) => { size: number; sizeKB: number; format: string; timestamp: string; }'.
src/services/bugReport/__tests__/index.test.ts(247,47): error TS2339: Property 'mockResolvedValue' does not exist on type '(reportData: BugReportData, providers?: ProviderConfig[]) => Promise<FallbackSubmissionResult>'.
src/services/bugReport/__tests__/index.test.ts(255,21): error TS2339: Property 'submissionId' does not exist on type '{ reportData: { title: any; hasScreenshot: boolean; systemInfo: SystemInfo; }; overallSuccess: boolean; error?: string; validationErrors?: string[]; attempts: number; results: unknown[]; success: boolean; }'.
src/services/bugReport/__tests__/index.test.ts(319,43): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/services/bugReport/__tests__/index.test.ts(320,43): error TS2339: Property 'mockReturnValue' does not exist on type '(dataUrl: any) => { size: number; sizeKB: number; format: string; timestamp: string; }'.
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
src/services/bugReport/__tests__/screenshotService.test.ts(183,72): error TS2345: Argument of type '{ sizeKB: number; }' is not assignable to parameter of type '{ size: number; sizeKB: number; format: string; timestamp: string; }'.
  Type '{ sizeKB: number; }' is missing the following properties from type '{ size: number; sizeKB: number; format: string; timestamp: string; }': size, format, timestamp
src/services/bugReport/__tests__/screenshotService.test.ts(194,72): error TS2345: Argument of type '{ sizeKB: number; }' is not assignable to parameter of type '{ size: number; sizeKB: number; format: string; timestamp: string; }'.
  Type '{ sizeKB: number; }' is missing the following properties from type '{ size: number; sizeKB: number; format: string; timestamp: string; }': size, format, timestamp
src/services/bugReport/__tests__/screenshotService.test.ts(213,72): error TS2345: Argument of type '{ sizeKB: number; }' is not assignable to parameter of type '{ size: number; sizeKB: number; format: string; timestamp: string; }'.
  Type '{ sizeKB: number; }' is missing the following properties from type '{ size: number; sizeKB: number; format: string; timestamp: string; }': size, format, timestamp
src/services/bugReport/__tests__/screenshotService.test.ts(232,72): error TS2345: Argument of type '{ sizeKB: number; }' is not assignable to parameter of type '{ size: number; sizeKB: number; format: string; timestamp: string; }'.
  Type '{ sizeKB: number; }' is missing the following properties from type '{ size: number; sizeKB: number; format: string; timestamp: string; }': size, format, timestamp
src/services/bugReport/__tests__/screenshotService.test.ts(264,62): error TS2345: Argument of type '(tagName: string) => {}' is not assignable to parameter of type '(tagName: string, options?: ElementCreationOptions) => HTMLElement'.
  Type '{}' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 314 more.
src/services/bugReport/__tests__/systemInfoService.test.ts(25,38): error TS2339: Property 'getBrowserInfo' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(41,7): error TS2740: Type '{ userAgent: string; language: string; platform: string; }' is missing the following properties from type 'Navigator': clipboard, credentials, doNotTrack, geolocation, and 37 more.
src/services/bugReport/__tests__/systemInfoService.test.ts(47,38): error TS2339: Property 'getBrowserInfo' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(59,38): error TS2339: Property 'getViewportInfo' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(75,38): error TS2339: Property 'getViewportInfo' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(84,38): error TS2339: Property 'getPerformanceInfo' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(96,7): error TS2740: Type '{ getEntriesByType: Mock<() => any[]>; }' is missing the following properties from type 'Performance': eventCounts, navigation, onresourcetimingbufferfull, timeOrigin, and 14 more.
src/services/bugReport/__tests__/systemInfoService.test.ts(100,38): error TS2339: Property 'getPerformanceInfo' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(110,38): error TS2339: Property 'getStorageInfo' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(118,38): error TS2339: Property 'getStorageInfo' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(138,38): error TS2339: Property 'getStorageInfo' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(148,43): error TS2339: Property 'isStorageAvailable' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(153,43): error TS2339: Property 'isStorageAvailable' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(158,43): error TS2339: Property 'isStorageAvailable' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(168,38): error TS2339: Property 'estimateStorageSize' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(177,38): error TS2339: Property 'estimateStorageSize' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(182,38): error TS2339: Property 'estimateStorageSize' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(189,38): error TS2339: Property 'getUrlInfo' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(205,38): error TS2339: Property 'getDOMInfo' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(227,42): error TS2339: Property 'getSafeLocalStorageSnapshot' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(240,42): error TS2339: Property 'getSafeLocalStorageSnapshot' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(257,42): error TS2339: Property 'getSafeLocalStorageSnapshot' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(288,35): error TS2345: Argument of type '"getBrowserInfo"' is not assignable to parameter of type '"cleanup" | "collectSystemInfo" | "getFallbackSystemInfo" | "initializeErrorCapture" | "getRecentErrors" | "clearCapturedData" | "getErrorStats"'.
src/services/bugReport/__tests__/systemInfoService.test.ts(298,25): error TS2339: Property 'getBrowserInfo' does not exist on type 'typeof SystemInfoService'.
src/services/bugReport/__tests__/systemInfoService.test.ts(313,30): error TS2551: Property 'error' does not exist on type 'SystemInfo'. Did you mean 'errors'?
src/services/bugReport/apiService.ts(107,44): error TS2345: Argument of type 'import("violet-vault/src/services/bugReport/apiService").BugReportData' is not assignable to parameter of type 'BugReportData'.
  Types of property 'steps' are incompatible.
    Type 'string[]' is not assignable to type 'string'.
src/services/bugReport/apiService.ts(219,51): error TS2345: Argument of type 'import("violet-vault/src/services/bugReport/apiService").BugReportData' is not assignable to parameter of type 'BugReportData'.
  Types of property 'steps' are incompatible.
    Type 'string[]' is not assignable to type 'string'.
src/services/bugReport/apiService.ts(226,56): error TS2559: Type 'unknown[]' has no properties in common with type '{ recentErrors?: { type?: string; message?: string; stack?: string; filename?: string; lineno?: number; timestamp?: string; }[]; consoleLogs?: { level: string; message: string; timestamp: number; }[]; }'.
src/services/bugReport/contextAnalysisService.ts(116,7): error TS2740: Type '{ currentPage: string; pathname: string; }' is missing the following properties from type 'RouteInfo': search, hash, searchParams, segments, and 5 more.
src/services/bugReport/contextAnalysisService.ts(117,7): error TS2739: Type '{ documentTitle: string; }' is missing the following properties from type 'ScreenContext': screenTitle, breadcrumbs, mainHeading
src/services/bugReport/contextAnalysisService.ts(119,7): error TS2739: Type '{ modals: undefined[]; forms: undefined[]; buttons: undefined[]; inputs: undefined[]; }' is missing the following properties from type 'UIState': drawers, tabs, loading, interactions
src/services/bugReport/errorTrackingService.ts(9,6): error TS2456: Type alias 'EventListenerOrEventListenerObject' circularly references itself.
src/services/bugReport/errorTrackingService.ts(186,10): error TS2352: Conversion of type 'Console' to type 'Record<string, (...args: unknown[]) => void>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Console'.
src/services/bugReport/githubApiService.ts(130,25): error TS2339: Property 'error' does not exist on type 'GitHubAPIResponse'.
  Property 'error' does not exist on type 'GitHubAPISuccessResponse'.
src/services/bugReport/githubApiService.ts(429,7): error TS2322: Type '{ success: boolean; issueNumber: number; url: string; }' is not assignable to type 'GitHubAPIResponse'.
  Type '{ success: boolean; issueNumber: number; url: string; }' is not assignable to type 'GitHubAPISuccessResponse'.
    Types of property 'success' are incompatible.
      Type 'boolean' is not assignable to type 'true'.
src/services/bugReport/index.ts(33,24): error TS2339: Property 'title' does not exist on type '{}'.
src/services/bugReport/index.ts(34,36): error TS2339: Property 'includeScreenshot' does not exist on type '{}'.
src/services/bugReport/index.ts(50,51): error TS2339: Property 'providers' does not exist on type '{}'.
src/services/bugReport/index.ts(54,30): error TS2339: Property 'submissionId' does not exist on type 'FallbackSubmissionResult'.
src/services/bugReport/index.ts(55,26): error TS2339: Property 'primaryProvider' does not exist on type 'FallbackSubmissionResult'.
src/services/bugReport/index.ts(212,16): error TS2339: Property 'screenshotStatus' does not exist on type 'FallbackSubmissionResult'.
src/services/bugReport/index.ts(246,25): error TS2339: Property 'github' does not exist on type '{}'.
src/services/bugReport/index.ts(249,33): error TS2339: Property 'github' does not exist on type '{}'.
src/services/bugReport/index.ts(254,25): error TS2339: Property 'email' does not exist on type '{}'.
src/services/bugReport/index.ts(257,33): error TS2339: Property 'email' does not exist on type '{}'.
src/services/bugReport/index.ts(262,25): error TS2339: Property 'webhook' does not exist on type '{}'.
src/services/bugReport/index.ts(265,30): error TS2339: Property 'webhook' does not exist on type '{}'.
src/services/bugReport/pageDetectionService.ts(255,32): error TS2339: Property 'offsetParent' does not exist on type 'Element'.
src/services/bugReport/performanceInfoService.ts(147,11): error TS2322: Type 'string | number' is not assignable to type 'number'.
  Type 'string' is not assignable to type 'number'.
src/services/bugReport/reportSubmissionService.ts(175,30): error TS6133: 'reportData' is declared but its value is never read.
src/services/bugReport/screenshotService.ts(16,13): error TS2339: Property 'compress' does not exist on type '{}'.
src/services/bugReport/screenshotService.ts(20,13): error TS6133: '_isMobile' is declared but its value is never read.
src/services/bugReport/screenshotService.ts(90,38): error TS2794: Expected 1 arguments, but got 0. Did you forget to include 'void' in your type argument to 'Promise'?
src/services/bugReport/screenshotService.ts(133,38): error TS2339: Property 'toDataURL' does not exist on type 'unknown'.
src/services/bugReport/screenshotService.ts(229,15): error TS2339: Property 'quality' does not exist on type '{}'.
src/services/bugReport/screenshotService.ts(229,30): error TS2339: Property 'maxWidth' does not exist on type '{}'.
src/services/bugReport/screenshotService.ts(229,47): error TS2339: Property 'maxHeight' does not exist on type '{}'.
src/services/bugReport/screenshotService.ts(229,65): error TS2339: Property 'format' does not exist on type '{}'.
src/services/bugReport/systemInfoService.ts(72,65): error TS2345: Argument of type 'SystemInfo' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'SystemInfo'.
src/services/chunkedSyncService.ts(83,5): error TS2322: Type 'SyncMutex' is not assignable to type '{ acquire: (name: string, timeout?: number) => Promise<void>; release: () => void; }'.
  The types returned by 'acquire(...)' are incompatible between these types.
    Type 'Promise<unknown>' is not assignable to type 'Promise<void>'.
      Type 'unknown' is not assignable to type 'void'.
src/services/chunkedSyncService.ts(87,5): error TS2739: Type '{ retryManager: RetryManager; circuitBreaker: CircuitBreaker; syncQueue: SyncQueue; execute(operation: any, operationType?: string, operationName?: string): Promise<...>; getStatus(): { ...; }; reset(): void; }' is missing the following properties from type '{ verifyDataIntegrity: (data: unknown) => boolean; detectDataCorruption: (error: Error) => boolean; }': verifyDataIntegrity, detectDataCorruption
src/services/chunkedSyncService.ts(277,27): error TS2339: Property 'execute' does not exist on type '{ acquire: (name: string, timeout?: number) => Promise<void>; release: () => void; }'.
src/services/chunkedSyncService.ts(377,27): error TS2339: Property 'execute' does not exist on type '{ verifyDataIntegrity: (data: unknown) => boolean; detectDataCorruption: (error: Error) => boolean; }'.
src/services/chunkedSyncService.ts(447,29): error TS2339: Property 'execute' does not exist on type '{ verifyDataIntegrity: (data: unknown) => boolean; detectDataCorruption: (error: Error) => boolean; }'.
src/services/chunkedSyncService.ts(483,27): error TS2339: Property 'execute' does not exist on type '{ acquire: (name: string, timeout?: number) => Promise<void>; release: () => void; }'.
src/services/chunkedSyncService.ts(495,47): error TS2339: Property 'execute' does not exist on type '{ verifyDataIntegrity: (data: unknown) => boolean; detectDataCorruption: (error: Error) => boolean; }'.
src/services/chunkedSyncService.ts(560,38): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/services/chunkedSyncService.ts(565,57): error TS2345: Argument of type 'number' is not assignable to parameter of type '{ count: number; lastFailure: number; }'.
src/services/chunkedSyncService.ts(599,56): error TS2339: Property 'execute' does not exist on type '{ verifyDataIntegrity: (data: unknown) => boolean; detectDataCorruption: (error: Error) => boolean; }'.
src/services/chunkedSyncService.ts(810,47): error TS2339: Property 'getStatus' does not exist on type '{ verifyDataIntegrity: (data: unknown) => boolean; detectDataCorruption: (error: Error) => boolean; }'.
src/services/chunkedSyncService.ts(841,11): error TS2365: Operator '>' cannot be applied to types '{ count: number; lastFailure: number; }' and 'number'.
src/services/cloudSyncService.ts(148,46): error TS2339: Property 'substring' does not exist on type 'unknown'.
src/services/cloudSyncService.ts(345,43): error TS2339: Property 'userName' does not exist on type 'unknown'.
src/services/cloudSyncService.ts(461,37): error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'BudgetRecord'.
  Type 'Record<string, unknown>' is missing the following properties from type 'BudgetRecord': id, lastModified
src/services/cloudSyncService.ts(570,31): error TS2339: Property 'joinedVia' does not exist on type 'unknown'.
src/services/cloudSyncService.ts(571,30): error TS2339: Property 'sharedBy' does not exist on type 'unknown'.
src/services/cloudSyncService.ts(576,47): error TS2339: Property 'joinedVia' does not exist on type 'unknown'.
src/services/cloudSyncService.ts(577,48): error TS2339: Property 'sharedBy' does not exist on type 'unknown'.
src/services/cloudSyncService.ts(581,31): error TS2339: Property 'joinedVia' does not exist on type 'unknown'.
src/services/cloudSyncService.ts(582,30): error TS2339: Property 'sharedBy' does not exist on type 'unknown'.
src/services/editLockService.ts(305,54): error TS2339: Property 'id' does not exist on type '{ userName: string; userColor: string; userId?: string; }'.
src/services/editLockService.ts(320,45): error TS2339: Property 'id' does not exist on type '{ userName: string; userColor: string; userId?: string; }'.
src/services/firebaseMessaging.ts(133,56): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
  Type 'string' is not assignable to type 'Record<string, unknown>'.
src/services/firebaseMessaging.ts(143,64): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
  Type 'string' is not assignable to type 'Record<string, unknown>'.
src/services/firebaseMessaging.ts(179,53): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/services/firebaseMessaging.ts(246,53): error TS2345: Argument of type 'MessagePayload' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'MessagePayload'.
src/services/firebaseMessaging.ts(331,7): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/services/keys/__tests__/keyManagementService.test.ts(73,54): error TS2554: Expected 1 arguments, but got 0.
src/services/keys/__tests__/keyManagementService.test.ts(81,40): error TS2307: Cannot find module '../../../stores/auth/authStore' or its corresponding type declarations.
src/services/keys/__tests__/keyManagementService.test.ts(87,41): error TS2554: Expected 1 arguments, but got 0.
src/services/keys/__tests__/keyManagementService.test.ts(97,34): error TS2554: Expected 2-3 arguments, but got 1.
src/services/keys/__tests__/keyManagementService.test.ts(110,37): error TS2339: Property 'mockRejectedValueOnce' does not exist on type '(data: string) => Promise<void>'.
src/services/keys/__tests__/keyManagementService.test.ts(112,41): error TS2554: Expected 2-3 arguments, but got 0.
src/services/keys/__tests__/keyManagementService.test.ts(125,30): error TS2339: Property 'mockReturnValueOnce' does not exist on type '{ <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K]; <K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementDeprecatedTagNameMap[K]; (tagName: string, options?: ElementCreationOptions): HTMLElement; }'.
src/services/keys/__tests__/keyManagementService.test.ts(127,34): error TS2554: Expected 2-4 arguments, but got 0.
src/services/keys/__tests__/keyManagementService.test.ts(135,40): error TS2307: Cannot find module '../../../stores/auth/authStore' or its corresponding type declarations.
src/services/keys/__tests__/keyManagementService.test.ts(141,41): error TS2554: Expected 2-4 arguments, but got 0.
src/services/keys/__tests__/keyManagementService.test.ts(154,30): error TS2339: Property 'mockReturnValueOnce' does not exist on type '{ <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K]; <K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementDeprecatedTagNameMap[K]; (tagName: string, options?: ElementCreationOptions): HTMLElement; }'.
src/services/keys/__tests__/keyManagementService.test.ts(156,34): error TS2554: Expected 3-5 arguments, but got 1.
src/services/keys/__tests__/keyManagementService.test.ts(164,41): error TS2554: Expected 3-5 arguments, but got 1.
src/services/keys/__tests__/keyManagementService.test.ts(172,48): error TS2554: Expected 2 arguments, but got 0.
src/services/keys/__tests__/keyManagementService.test.ts(179,40): error TS2307: Cannot find module '../../../stores/auth/authStore' or its corresponding type declarations.
src/services/keys/__tests__/keyManagementService.test.ts(185,41): error TS2554: Expected 2 arguments, but got 0.
src/services/keys/__tests__/keyManagementService.test.ts(200,59): error TS2345: Argument of type '{ version: string; type: string; key: number[]; salt: number[]; }' is not assignable to parameter of type 'KeyFileData'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"protected" | "unprotected"'.
src/services/keys/__tests__/keyManagementService.test.ts(214,59): error TS2345: Argument of type '{ version: string; type: string; encryptedKey: string; exportSalt: number[]; }' is not assignable to parameter of type 'KeyFileData'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"protected" | "unprotected"'.
src/services/keys/__tests__/keyManagementService.test.ts(227,59): error TS2345: Argument of type '{ version: string; type: string; }' is not assignable to parameter of type 'KeyFileData'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"protected" | "unprotected"'.
src/services/keys/__tests__/keyManagementService.test.ts(251,40): error TS2307: Cannot find module '../../../stores/auth/authStore' or its corresponding type declarations.
src/services/keys/__tests__/keyManagementService.test.ts(257,49): error TS2339: Property 'importAndLogin' does not exist on type 'KeyManagementService'.
src/services/keys/__tests__/keyManagementService.test.ts(272,40): error TS2307: Cannot find module '../../../stores/auth/authStore' or its corresponding type declarations.
src/services/keys/__tests__/keyManagementService.test.ts(278,49): error TS2339: Property 'importAndLogin' does not exist on type 'KeyManagementService'.
src/services/keys/__tests__/keyManagementService.test.ts(297,30): error TS2339: Property 'importAndLogin' does not exist on type 'KeyManagementService'.
src/services/keys/keyManagementService.ts(39,64): error TS2769: No overload matches this call.
  Overload 1 of 2, '(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>', gave the following error.
    Argument of type 'CryptoKey | Uint8Array<ArrayBufferLike>' is not assignable to parameter of type 'BufferSource'.
      Type 'CryptoKey' is not assignable to type 'BufferSource'.
  Overload 2 of 2, '(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>', gave the following error.
    Argument of type 'CryptoKey | Uint8Array<ArrayBufferLike>' is not assignable to parameter of type 'BufferSource'.
      Type 'CryptoKey' is not assignable to type 'BufferSource'.
src/services/keys/keyManagementService.ts(329,11): error TS2554: Expected 1 arguments, but got 2.
src/services/keys/keyManagementService.ts(333,53): error TS2554: Expected 3 arguments, but got 2.
src/services/security/__tests__/securityService.test.ts(1,48): error TS6133: 'afterEach' is declared but its value is never read.
src/services/security/__tests__/securityService.test.ts(91,36): error TS2345: Argument of type '{ autoLockEnabled: boolean; }' is not assignable to parameter of type 'SecuritySettings'.
  Type '{ autoLockEnabled: boolean; }' is missing the following properties from type 'SecuritySettings': autoLockTimeout, clipboardClearTimeout, securityLoggingEnabled, lockOnPageHide
src/services/security/__tests__/securityService.test.ts(104,49): error TS2345: Argument of type '{}' is not assignable to parameter of type 'SecuritySettings'.
  Type '{}' is missing the following properties from type 'SecuritySettings': autoLockEnabled, autoLockTimeout, clipboardClearTimeout, securityLoggingEnabled, lockOnPageHide
src/services/security/__tests__/securityService.test.ts(134,42): error TS2345: Argument of type '{ id: string; type: string; }[]' is not assignable to parameter of type 'SecurityEvent[]'.
  Type '{ id: string; type: string; }' is missing the following properties from type 'SecurityEvent': timestamp, description, metadata
src/services/security/__tests__/securityService.test.ts(171,21): error TS2339: Property 'level1' does not exist on type 'unknown'.
src/services/security/__tests__/securityService.test.ts(176,11): error TS2339: Property 'self' does not exist on type '{ name: string; }'.
src/services/security/__tests__/securityService.test.ts(180,21): error TS2339: Property 'name' does not exist on type 'unknown'.
src/services/security/__tests__/securityService.test.ts(181,21): error TS2339: Property 'self' does not exist on type 'unknown'.
src/services/security/__tests__/securityService.test.ts(215,34): error TS2339: Property 'ref' does not exist on type '{}'.
src/services/security/__tests__/securityService.test.ts(217,58): error TS2345: Argument of type '{ type: number; description: any; metadata: { circular: {}; }; }' is not assignable to parameter of type 'Partial<SecurityEvent> & { type: string; description: string; }'.
  Type '{ type: number; description: any; metadata: { circular: {}; }; }' is not assignable to type 'Partial<SecurityEvent>'.
    Types of property 'type' are incompatible.
      Type 'number' is not assignable to type 'string'.
src/services/security/__tests__/securityService.test.ts(235,22): error TS2339: Property 'mockRestore' does not exist on type '{ (value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string; (value: any, replacer?: (string | number)[], space?: string | number): string; }'.
src/services/security/__tests__/securityService.test.ts(246,47): error TS2345: Argument of type '{ securityLoggingEnabled: boolean; }' is not assignable to parameter of type 'SecuritySettings'.
  Type '{ securityLoggingEnabled: boolean; }' is missing the following properties from type 'SecuritySettings': autoLockEnabled, autoLockTimeout, clipboardClearTimeout, lockOnPageHide
src/services/security/__tests__/securityService.test.ts(258,47): error TS2345: Argument of type '{ securityLoggingEnabled: boolean; }' is not assignable to parameter of type 'SecuritySettings'.
  Type '{ securityLoggingEnabled: boolean; }' is missing the following properties from type 'SecuritySettings': autoLockEnabled, autoLockTimeout, clipboardClearTimeout, lockOnPageHide
src/services/syncServiceInitializer.ts(59,7): error TS2739: Type 'ChunkedSyncService' is missing the following properties from type 'ChunkedSyncService': start, stop, isRunning
src/services/syncServiceInitializer.ts(60,7): error TS2739: Type 'FirebaseSyncService' is missing the following properties from type 'FirebaseSyncService': start, stop, isRunning
src/services/transactions/__tests__/transactionSplitterService.test.ts(2,32): error TS6133: 'beforeEach' is declared but its value is never read.
src/services/transactions/__tests__/transactionSplitterService.test.ts(2,44): error TS6133: 'vi' is declared but its value is never read.
src/services/typedChunkedSyncService.ts(150,19): error TS2352: Conversion of type 'ChunkedSyncStats' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'ChunkedSyncStats'.
src/services/typedFirebaseSyncService.ts(63,46): error TS2345: Argument of type 'string' is not assignable to parameter of type 'CryptoKey'.
src/stores/ui/__tests__/fabStore.test.ts(8,29): error TS2322: Type 'unknown' is not assignable to type 'object'.
src/stores/ui/__tests__/fabStore.test.ts(9,27): error TS2339: Property 'isVisible' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(14,30): error TS2322: Type 'unknown' is not assignable to type 'object'.
src/stores/ui/__tests__/fabStore.test.ts(15,27): error TS2339: Property 'isExpanded' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(20,33): error TS2322: Type 'unknown' is not assignable to type 'object'.
src/stores/ui/__tests__/fabStore.test.ts(21,27): error TS2339: Property 'currentScreen' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(26,20): error TS2339: Property 'primaryActions' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(31,20): error TS2339: Property 'secondaryActions' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(36,43): error TS2322: Type 'unknown' is not assignable to type 'object'.
src/stores/ui/__tests__/fabStore.test.ts(37,27): error TS2339: Property 'defaultSecondaryActions' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(44,27): error TS2339: Property 'setCurrentScreen' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(49,27): error TS2339: Property 'setVisibility' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(54,27): error TS2339: Property 'setExpanded' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(59,27): error TS2339: Property 'toggleExpanded' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(64,27): error TS2339: Property 'registerPrimaryAction' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(69,27): error TS2339: Property 'unregisterPrimaryAction' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(74,27): error TS2339: Property 'registerSecondaryAction' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(79,27): error TS2339: Property 'unregisterSecondaryAction' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(84,27): error TS2339: Property 'setDefaultActionHandler' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(89,27): error TS2339: Property 'clearScreenActions' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(96,27): error TS2339: Property 'getDebugInfo' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(101,31): error TS2339: Property 'getDebugInfo' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(113,31): error TS2339: Property 'getDebugInfo' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(129,27): error TS2339: Property 'setCurrentScreen' does not exist on type 'unknown'.
src/stores/ui/__tests__/fabStore.test.ts(134,27): error TS2339: Property 'toggleExpanded' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(33,20): error TS2339: Property 'isOnboarded' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(38,30): error TS2339: Property 'tutorialProgress' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(54,20): error TS2339: Property 'currentTutorialStep' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(59,20): error TS2339: Property 'preferences' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(70,39): error TS2339: Property 'tutorialProgress' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(93,20): error TS2339: Property 'tutorialProgress' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(94,20): error TS2339: Property 'tutorialProgress' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(114,30): error TS2339: Property 'tutorialProgress' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(134,20): error TS2339: Property 'currentTutorialStep' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(142,20): error TS2339: Property 'currentTutorialStep' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(156,20): error TS2339: Property 'preferences' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(168,20): error TS2339: Property 'preferences' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(180,20): error TS2339: Property 'preferences' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(193,20): error TS2339: Property 'preferences' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(204,27): error TS2339: Property 'markStepComplete' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(209,27): error TS2339: Property 'startTutorialStep' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(214,27): error TS2339: Property 'endTutorialStep' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(219,27): error TS2339: Property 'completeOnboarding' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(224,27): error TS2339: Property 'resetOnboarding' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(229,27): error TS2339: Property 'setPreference' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(234,39): error TS2339: Property 'markStepComplete' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(240,39): error TS2339: Property 'startTutorialStep' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(246,39): error TS2339: Property 'endTutorialStep' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(252,39): error TS2339: Property 'completeOnboarding' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(258,39): error TS2339: Property 'resetOnboarding' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(264,39): error TS2339: Property 'setPreference' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(272,27): error TS2339: Property 'isStepComplete' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(277,20): error TS2339: Property 'isStepComplete' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(278,20): error TS2339: Property 'isStepComplete' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(279,20): error TS2339: Property 'isStepComplete' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(284,27): error TS2339: Property 'shouldShowHint' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(289,20): error TS2339: Property 'shouldShowHint' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(290,20): error TS2339: Property 'shouldShowHint' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(291,20): error TS2339: Property 'shouldShowHint' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(296,27): error TS2339: Property 'getProgress' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(301,30): error TS2339: Property 'getProgress' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(317,20): error TS2339: Property 'isOnboarded' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(318,20): error TS2339: Property 'currentTutorialStep' does not exist on type 'unknown'.
src/stores/ui/__tests__/onboardingStore.test.ts(326,20): error TS2339: Property 'isOnboarded' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(44,16): error TS2339: Property 'action' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(193,36): error TS2339: Property 'currentScreen' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(194,32): error TS2339: Property 'isVisible' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(195,33): error TS2339: Property 'isExpanded' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(196,42): error TS2339: Property 'primaryActions' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(197,44): error TS2339: Property 'secondaryActions' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(198,63): error TS2339: Property 'defaultSecondaryActions' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(199,26): error TS2339: Property 'action' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(223,54): error TS2339: Property 'currentScreen' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(224,50): error TS2339: Property 'isVisible' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(225,51): error TS2339: Property 'isExpanded' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(244,57): error TS2339: Property 'setCurrentScreen' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(245,54): error TS2339: Property 'setVisibility' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(246,52): error TS2339: Property 'setExpanded' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(247,55): error TS2339: Property 'toggleExpanded' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(248,62): error TS2339: Property 'registerPrimaryAction' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(249,64): error TS2339: Property 'unregisterPrimaryAction' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(250,64): error TS2339: Property 'registerSecondaryAction' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(251,66): error TS2339: Property 'unregisterSecondaryAction' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(252,64): error TS2339: Property 'setDefaultActionHandler' does not exist on type 'unknown'.
src/stores/ui/fabStore.ts(253,59): error TS2339: Property 'clearScreenActions' does not exist on type 'unknown'.
src/stores/ui/toastStore.ts(46,49): error TS2345: Argument of type '(set: { (partial: ToastState | Partial<ToastState> | ((state: ToastState) => ToastState | Partial<ToastState>), replace?: false): void; (state: ToastState | ((state: ToastState) => ToastState), replace: true): void; }, _get: () => ToastState) => { ...; }' is not assignable to parameter of type 'StateCreator<ToastState, [], []>'.
  Type '(set: { (partial: ToastState | Partial<ToastState> | ((state: ToastState) => ToastState | Partial<ToastState>), replace?: false): void; (state: ToastState | ((state: ToastState) => ToastState), replace: true): void; }, _get: () => ToastState) => { ...; }' is not assignable to type '(setState: { (partial: ToastState | Partial<ToastState> | ((state: ToastState) => ToastState | Partial<ToastState>), replace?: false): void; (state: ToastState | ((state: ToastState) => ToastState), replace: true): void; }, getState: () => ToastState, store: StoreApi<...>) => ToastState'.
    Call signature return types '{ toasts: any[]; addToast: ({ type, title, message, duration }: { type?: string; title: any; message: any; duration?: number; }) => number; removeToast: (id: any) => void; clearAllToasts: () => void; showSuccess: (message: any, title?: string, duration?: number) => number; showError: (message: any, title?: string, d...' and 'ToastState' are incompatible.
      The types of 'addToast' are incompatible between these types.
        Type '({ type, title, message, duration }: { type?: string; title: any; message: any; duration?: number; }) => number' is not assignable to type '(options: AddToastOptions) => number'.
          Types of parameters '__0' and 'options' are incompatible.
            Type 'AddToastOptions' is not assignable to type '{ type?: string; title: any; message: any; duration?: number; }'.
              Property 'title' is optional in type 'AddToastOptions' but required in type '{ type?: string; title: any; message: any; duration?: number; }'.
src/stores/ui/toastStore.ts(60,11): error TS2345: Argument of type '(state: ToastState) => { toasts: (Toast | { id: number; type: string; title: any; message: any; duration: number; })[]; }' is not assignable to parameter of type 'ToastState | Partial<ToastState> | ((state: ToastState) => ToastState | Partial<ToastState>)'.
  Type '(state: ToastState) => { toasts: (Toast | { id: number; type: string; title: any; message: any; duration: number; })[]; }' is not assignable to type '(state: ToastState) => ToastState | Partial<ToastState>'.
    Type '{ toasts: (Toast | { id: number; type: string; title: any; message: any; duration: number; })[]; }' is not assignable to type 'ToastState | Partial<ToastState>'.
      Type '{ toasts: (Toast | { id: number; type: string; title: any; message: any; duration: number; })[]; }' is not assignable to type 'Partial<ToastState>'.
        Types of property 'toasts' are incompatible.
          Type '(Toast | { id: number; type: string; title: any; message: any; duration: number; })[]' is not assignable to type 'Toast[]'.
            Type 'Toast | { id: number; type: string; title: any; message: any; duration: number; }' is not assignable to type 'Toast'.
              Type '{ id: number; type: string; title: any; message: any; duration: number; }' is not assignable to type 'Toast'.
                Types of property 'type' are incompatible.
                  Type 'string' is not assignable to type 'ToastType'.
src/stores/ui/uiStore.ts(277,81): error TS2554: Expected 1 arguments, but got 2.
src/test/queryTestUtils.tsx(28,5): error TS2353: Object literal may only specify known properties, and 'logger' does not exist in type 'QueryClientConfig'.
src/utils/accounts/__tests__/accountValidation.test.ts(210,13): error TS6133: 'expectedDays' is declared but its value is never read.
src/utils/accounts/__tests__/accountValidation.test.ts(210,39): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/accounts/__tests__/accountValidation.test.ts(210,52): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/accounts/accountHelpers.ts(142,43): error TS2769: No overload matches this call.
  Overload 1 of 3, '(locales?: LocalesArgument, options?: DateTimeFormatOptions): string', gave the following error.
    Argument of type '{ year: string; month: string; day: string; }' is not assignable to parameter of type 'DateTimeFormatOptions'.
      Types of property 'year' are incompatible.
        Type 'string' is not assignable to type '"numeric" | "2-digit"'.
  Overload 2 of 3, '(locales?: string | string[], options?: DateTimeFormatOptions): string', gave the following error.
    Argument of type '{ year: string; month: string; day: string; }' is not assignable to parameter of type 'DateTimeFormatOptions'.
      Types of property 'year' are incompatible.
        Type 'string' is not assignable to type '"numeric" | "2-digit"'.
src/utils/accounts/accountHelpers.ts(189,9): error TS6133: '_typeInfo' is declared but its value is never read.
src/utils/accounts/accountHelpers.ts(237,14): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/accounts/accountHelpers.ts(237,43): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/accounts/accountHelpers.ts(239,28): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/accounts/accountHelpers.ts(239,54): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/accounts/accountHelpers.ts(257,15): error TS2339: Property 'activeOnly' does not exist on type '{}'.
src/utils/accounts/accountHelpers.ts(262,15): error TS2339: Property 'type' does not exist on type '{}'.
src/utils/accounts/accountHelpers.ts(263,86): error TS2339: Property 'type' does not exist on type '{}'.
src/utils/accounts/accountHelpers.ts(267,15): error TS2339: Property 'minBalance' does not exist on type '{}'.
src/utils/accounts/accountHelpers.ts(269,54): error TS2339: Property 'minBalance' does not exist on type '{}'.
src/utils/accounts/accountHelpers.ts(274,15): error TS2339: Property 'expiringSoon' does not exist on type '{}'.
src/utils/accounts/accountHelpers.ts(275,35): error TS2339: Property 'expirationDays' does not exist on type '{}'.
src/utils/accounts/accountHelpers.ts(284,15): error TS2339: Property 'search' does not exist on type '{}'.
src/utils/accounts/accountHelpers.ts(285,32): error TS2339: Property 'search' does not exist on type '{}'.
src/utils/accounts/accountHelpers.ts(306,20): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/accounts/accountHelpers.ts(306,29): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/accounts/accountValidation.ts(194,20): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/accounts/accountValidation.ts(194,29): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/analytics/billAnalyzer.ts(12,9): error TS6133: '_minAmount' is declared but its value is never read.
src/utils/analytics/billAnalyzer.ts(48,23): error TS2339: Property 'length' does not exist on type 'unknown'.
src/utils/analytics/billAnalyzer.ts(49,41): error TS2339: Property 'reduce' does not exist on type 'unknown'.
src/utils/analytics/billAnalyzer.ts(57,39): error TS2339: Property 'length' does not exist on type 'unknown'.
src/utils/analytics/billAnalyzer.ts(58,44): error TS2339: Property 'map' does not exist on type 'unknown'.
src/utils/analytics/billAnalyzer.ts(60,45): error TS2339: Property 'length' does not exist on type 'unknown'.
src/utils/analytics/billAnalyzer.ts(65,34): error TS2339: Property 'map' does not exist on type 'unknown'.
src/utils/analytics/billAnalyzer.ts(100,46): error TS2339: Property 'count' does not exist on type 'unknown'.
src/utils/analytics/billAnalyzer.ts(100,66): error TS2339: Property 'totalAmount' does not exist on type 'unknown'.
src/utils/analytics/billAnalyzer.ts(108,28): error TS2339: Property 'bills' does not exist on type 'unknown'.
src/utils/analytics/billAnalyzer.ts(108,52): error TS2339: Property 'totalAmount' does not exist on type 'unknown'.
src/utils/analytics/billAnalyzer.ts(111,22): error TS2339: Property 'totalAmount' does not exist on type 'unknown'.
src/utils/analytics/billAnalyzer.ts(115,25): error TS2339: Property 'bills' does not exist on type 'unknown'.
src/utils/analytics/categoryHelpers.ts(38,14): error TS2339: Property 'transactionCount' does not exist on type 'unknown'.
src/utils/analytics/categoryHelpers.ts(39,12): error TS2339: Property 'avgAmount' does not exist on type 'unknown'.
src/utils/analytics/categoryHelpers.ts(39,29): error TS2339: Property 'totalAmount' does not exist on type 'unknown'.
src/utils/analytics/categoryHelpers.ts(39,48): error TS2339: Property 'transactionCount' does not exist on type 'unknown'.
src/utils/analytics/categoryHelpers.ts(42,16): error TS2339: Property 'lastUsed' does not exist on type 'unknown'.
src/utils/analytics/categoryHelpers.ts(43,28): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/analytics/categoryHelpers.ts(43,46): error TS2339: Property 'lastUsed' does not exist on type 'unknown'.
src/utils/analytics/categoryHelpers.ts(44,14): error TS2339: Property 'frequency' does not exist on type 'unknown'.
src/utils/analytics/categoryHelpers.ts(44,31): error TS2339: Property 'transactionCount' does not exist on type 'unknown'.
src/utils/analytics/categoryHelpers.ts(49,48): error TS2339: Property 'totalAmount' does not exist on type 'unknown'.
src/utils/analytics/categoryHelpers.ts(49,64): error TS2339: Property 'totalAmount' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(40,17): error TS2339: Property 'transactions' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(40,71): error TS2339: Property 'totalAmount' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(41,15): error TS2339: Property 'avgAmount' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(41,35): error TS2339: Property 'totalAmount' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(41,57): error TS2339: Property 'transactions' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(46,22): error TS2339: Property 'some' does not exist on type 'RegExp'.
src/utils/analytics/transactionAnalyzer.ts(46,42): error TS2339: Property 'merchant' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(53,36): error TS2339: Property 'merchant' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(55,27): error TS2339: Property 'totalAmount' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(55,64): error TS2339: Property 'totalAmount' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(57,39): error TS2339: Property 'merchant' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(58,33): error TS2339: Property 'transactions' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(58,87): error TS2339: Property 'totalAmount' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(59,41): error TS2339: Property 'avgAmount' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(61,39): error TS2339: Property 'transactions' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(62,25): error TS2339: Property 'totalAmount' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(65,29): error TS2339: Property 'merchant' does not exist on type 'unknown'.
src/utils/analytics/transactionAnalyzer.ts(66,35): error TS2339: Property 'transactions' does not exist on type 'unknown'.
src/utils/bills/__tests__/billCalculations.test.ts(211,38): error TS2345: Argument of type 'import("violet-vault/src/types/bills").Bill' is not assignable to parameter of type 'Bill'.
  Index signature for type 'string' is missing in type 'Bill'.
src/utils/bills/__tests__/billCalculations.test.ts(212,38): error TS2345: Argument of type 'import("violet-vault/src/types/bills").Bill' is not assignable to parameter of type 'Bill'.
  Index signature for type 'string' is missing in type 'Bill'.
src/utils/bills/__tests__/billCalculations.test.ts(213,38): error TS2345: Argument of type 'import("violet-vault/src/types/bills").Bill' is not assignable to parameter of type 'Bill'.
  Index signature for type 'string' is missing in type 'Bill'.
src/utils/bills/__tests__/billCalculations.test.ts(308,42): error TS2345: Argument of type '{ upcoming: Bill[]; overdue: Bill[]; paid: Bill[]; all: Bill[]; }' is not assignable to parameter of type 'CategorizedBills'.
  Types of property 'upcoming' are incompatible.
    Type 'import("violet-vault/src/types/bills").Bill[]' is not assignable to type 'Bill[]'.
      Type 'import("violet-vault/src/types/bills").Bill' is not assignable to type 'Bill'.
        Index signature for type 'string' is missing in type 'Bill'.
src/utils/bills/__tests__/billCalculations.test.ts(317,42): error TS2345: Argument of type '{ upcoming: Bill[]; overdue: Bill[]; paid: Bill[]; all: Bill[]; }' is not assignable to parameter of type 'CategorizedBills'.
  Types of property 'upcoming' are incompatible.
    Type 'import("violet-vault/src/types/bills").Bill[]' is not assignable to type 'Bill[]'.
      Type 'import("violet-vault/src/types/bills").Bill' is not assignable to type 'Bill'.
        Index signature for type 'string' is missing in type 'Bill'.
src/utils/bills/__tests__/billCalculations.test.ts(334,42): error TS2345: Argument of type '{ upcoming: Bill[]; overdue: Bill[]; paid: Bill[]; all: Bill[]; }' is not assignable to parameter of type 'CategorizedBills'.
  Types of property 'upcoming' are incompatible.
    Type 'import("violet-vault/src/types/bills").Bill[]' is not assignable to type 'Bill[]'.
      Type 'import("violet-vault/src/types/bills").Bill' is not assignable to type 'Bill'.
        Index signature for type 'string' is missing in type 'Bill'.
src/utils/bills/__tests__/billCalculations.test.ts(356,42): error TS2345: Argument of type '{ upcoming: Bill[]; overdue: Bill[]; paid: Bill[]; all: Bill[]; }' is not assignable to parameter of type 'CategorizedBills'.
  Types of property 'upcoming' are incompatible.
    Type 'import("violet-vault/src/types/bills").Bill[]' is not assignable to type 'Bill[]'.
      Type 'import("violet-vault/src/types/bills").Bill' is not assignable to type 'Bill'.
        Index signature for type 'string' is missing in type 'Bill'.
src/utils/bills/billDetailUtils.ts(107,35): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/bills/billDetailUtils.ts(107,60): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/bills/billDetailUtils.ts(120,35): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/bills/billDetailUtils.ts(120,60): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/bills/index.ts(1,10): error TS2305: Module '"./recurringBillUtils.ts"' has no exported member 'default'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(65,28): error TS2339: Property 'name' does not exist on type '{}'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(73,28): error TS2339: Property 'name' does not exist on type '{}'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(82,28): error TS2339: Property 'name' does not exist on type '{}'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(91,28): error TS2339: Property 'name' does not exist on type '{}'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(99,28): error TS2339: Property 'monthlyAmount' does not exist on type '{}'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(107,28): error TS2339: Property 'monthlyAmount' does not exist on type '{}'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(113,38): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(119,28): error TS2339: Property 'targetAmount' does not exist on type '{}'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(125,38): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(131,28): error TS2339: Property 'targetAmount' does not exist on type '{}'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(139,28): error TS2339: Property 'category' does not exist on type '{}'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(147,28): error TS2339: Property 'priority' does not exist on type '{}'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(155,28): error TS2339: Property 'color' does not exist on type '{}'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(221,21): error TS2339: Property 'id' does not exist on type '{ name: any; monthlyAmount: number; currentBalance: number; category: any; color: any; frequency: any; description: any; priority: any; autoAllocate: boolean; icon: any; envelopeType: any; targetAmount: number; ... 4 more ...; updatedBy: any; }'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(222,21): error TS2339: Property 'createdAt' does not exist on type '{ name: any; monthlyAmount: number; currentBalance: number; category: any; color: any; frequency: any; description: any; priority: any; autoAllocate: boolean; icon: any; envelopeType: any; targetAmount: number; ... 4 more ...; updatedBy: any; }'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(230,21): error TS2339: Property 'id' does not exist on type '{ name: any; monthlyAmount: number; currentBalance: number; category: any; color: any; frequency: any; description: any; priority: any; autoAllocate: boolean; icon: any; envelopeType: any; targetAmount: number; ... 4 more ...; updatedBy: any; }'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(231,21): error TS2339: Property 'createdAt' does not exist on type '{ name: any; monthlyAmount: number; currentBalance: number; category: any; color: any; frequency: any; description: any; priority: any; autoAllocate: boolean; icon: any; envelopeType: any; targetAmount: number; ... 4 more ...; updatedBy: any; }'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(279,38): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(305,38): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(350,38): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/__tests__/envelopeFormUtils.test.ts(363,64): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/__tests__/paycheckUtils.test.ts(131,38): error TS2345: Argument of type '{ payerName: string; }[]' is not assignable to parameter of type 'PaycheckRecord[]'.
  Property 'amount' is missing in type '{ payerName: string; }' but required in type 'PaycheckRecord'.
src/utils/budgeting/__tests__/paycheckUtils.test.ts(137,38): error TS2345: Argument of type '{ payerName: string; }[]' is not assignable to parameter of type 'PaycheckRecord[]'.
  Property 'amount' is missing in type '{ payerName: string; }' but required in type 'PaycheckRecord'.
src/utils/budgeting/__tests__/paycheckUtils.test.ts(236,58): error TS2345: Argument of type '{ allocations: { envelopeId: string; amount: number; }[]; totalAllocated: number; remainingAmount: number; }' is not assignable to parameter of type 'AllocationResult'.
  Property 'allocationRate' is missing in type '{ allocations: { envelopeId: string; amount: number; }[]; totalAllocated: number; remainingAmount: number; }' but required in type 'AllocationResult'.
src/utils/budgeting/__tests__/paycheckUtils.test.ts(254,58): error TS2345: Argument of type '{ allocations: { envelopeId: string; amount: number; }[]; totalAllocated: number; remainingAmount: number; }' is not assignable to parameter of type 'AllocationResult'.
  Property 'allocationRate' is missing in type '{ allocations: { envelopeId: string; amount: number; }[]; totalAllocated: number; remainingAmount: number; }' but required in type 'AllocationResult'.
src/utils/budgeting/__tests__/paycheckUtils.test.ts(263,42): error TS2345: Argument of type '{ amount: number; }[]' is not assignable to parameter of type 'AllocationItem[]'.
  Type '{ amount: number; }' is missing the following properties from type 'AllocationItem': envelopeId, envelopeName, monthlyAmount, envelopeType, priority
src/utils/budgeting/__tests__/paycheckUtils.test.ts(272,42): error TS2345: Argument of type '{ amount: number; }[]' is not assignable to parameter of type 'AllocationItem[]'.
  Type '{ amount: number; }' is missing the following properties from type 'AllocationItem': envelopeId, envelopeName, monthlyAmount, envelopeType, priority
src/utils/budgeting/__tests__/paycheckUtils.test.ts(282,42): error TS2345: Argument of type '{ amount: number; }[]' is not assignable to parameter of type 'AllocationItem[]'.
  Type '{ amount: number; }' is missing the following properties from type 'AllocationItem': envelopeId, envelopeName, monthlyAmount, envelopeType, priority
src/utils/budgeting/__tests__/paycheckUtils.test.ts(296,35): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(196,41): error TS2345: Argument of type '{ startDate: string; endDate: string; }' is not assignable to parameter of type 'Condition'.
  Type '{ startDate: string; endDate: string; }' is missing the following properties from type 'Condition': type, value
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(204,41): error TS2345: Argument of type '{ startDate: string; endDate: string; }' is not assignable to parameter of type 'Condition'.
  Type '{ startDate: string; endDate: string; }' is missing the following properties from type 'Condition': type, value
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(212,41): error TS2345: Argument of type '{ startDate: string; endDate: string; }' is not assignable to parameter of type 'Condition'.
  Type '{ startDate: string; endDate: string; }' is missing the following properties from type 'Condition': type, value
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(217,41): error TS2345: Argument of type '{}' is not assignable to parameter of type 'Condition'.
  Type '{}' is missing the following properties from type 'Condition': type, value
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(225,41): error TS2345: Argument of type '{ startDate: string; endDate: string; }' is not assignable to parameter of type 'Condition'.
  Type '{ startDate: string; endDate: string; }' is missing the following properties from type 'Condition': type, value
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(233,41): error TS2345: Argument of type '{ startDate: string; endDate: string; }' is not assignable to parameter of type 'Condition'.
  Type '{ startDate: string; endDate: string; }' is missing the following properties from type 'Condition': type, value
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(245,49): error TS2345: Argument of type '{ operator: string; value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ operator: string; value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(248,49): error TS2345: Argument of type '{ operator: string; value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ operator: string; value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(253,49): error TS2345: Argument of type '{ operator: string; value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ operator: string; value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(256,49): error TS2345: Argument of type '{ operator: string; value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ operator: string; value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(261,49): error TS2345: Argument of type '{ operator: string; value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ operator: string; value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(264,49): error TS2345: Argument of type '{ operator: string; value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ operator: string; value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(267,49): error TS2345: Argument of type '{ operator: string; value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ operator: string; value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(272,49): error TS2345: Argument of type '{ operator: string; value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ operator: string; value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(275,49): error TS2345: Argument of type '{ operator: string; value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ operator: string; value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(280,49): error TS2345: Argument of type '{ operator: string; value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ operator: string; value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(283,49): error TS2345: Argument of type '{ operator: string; value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ operator: string; value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(292,49): error TS2345: Argument of type '{ operator: string; value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ operator: string; value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(297,49): error TS2345: Argument of type '{ operator: string; value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ operator: string; value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(440,24): error TS2339: Property 'id' does not exist on type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(452,40): error TS2345: Argument of type '{ value: number; }' is not assignable to parameter of type 'Condition'.
  Property 'type' is missing in type '{ value: number; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(473,40): error TS2345: Argument of type '{ type: string; startDate: string; endDate: string; }' is not assignable to parameter of type 'Condition'.
  Property 'value' is missing in type '{ type: string; startDate: string; endDate: string; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(483,40): error TS2345: Argument of type '{ type: string; operator: string; }' is not assignable to parameter of type 'Condition'.
  Property 'value' is missing in type '{ type: string; operator: string; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(511,49): error TS2345: Argument of type '{ id: string; name: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Property 'currentBalance' is missing in type '{ id: string; name: string; }' but required in type 'Envelope'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(520,49): error TS2345: Argument of type '{ id: string; name: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Property 'currentBalance' is missing in type '{ id: string; name: string; }' but required in type 'Envelope'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(528,49): error TS2345: Argument of type '{ id: string; name: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Property 'currentBalance' is missing in type '{ id: string; name: string; }' but required in type 'Envelope'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(536,49): error TS2345: Argument of type '{ id: string; name: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Property 'currentBalance' is missing in type '{ id: string; name: string; }' but required in type 'Envelope'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(545,38): error TS2345: Argument of type '{ type: string; startDate: string; endDate: string; }' is not assignable to parameter of type 'Condition'.
  Property 'value' is missing in type '{ type: string; startDate: string; endDate: string; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(554,49): error TS2345: Argument of type '{ id: string; name: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Property 'currentBalance' is missing in type '{ id: string; name: string; }' but required in type 'Envelope'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(561,38): error TS2345: Argument of type '{ type: string; }' is not assignable to parameter of type 'Condition'.
  Property 'value' is missing in type '{ type: string; }' but required in type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(570,49): error TS2345: Argument of type '{ id: string; name: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Property 'currentBalance' is missing in type '{ id: string; name: string; }' but required in type 'Envelope'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(604,26): error TS2339: Property 'id' does not exist on type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(610,26): error TS2339: Property 'id' does not exist on type 'Condition'.
src/utils/budgeting/autofunding/__tests__/conditions.test.ts(619,26): error TS2339: Property 'id' does not exist on type 'Condition'.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(85,35): error TS2345: Argument of type '{ name: string; type: string; trigger: string; config: { amount: number; targetType: string; targetId: string; }; }' is not assignable to parameter of type 'Partial<AutoFundingRule>'.
  Types of property 'config' are incompatible.
    Type '{ amount: number; targetType: string; targetId: string; }' is missing the following properties from type 'RuleConfig': sourceType, sourceId, targetIds, percentage, and 2 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(97,35): error TS2345: Argument of type '{ type: string; trigger: string; config: { amount: number; }; }' is not assignable to parameter of type 'Partial<AutoFundingRule>'.
  Types of property 'config' are incompatible.
    Type '{ amount: number; }' is missing the following properties from type 'RuleConfig': sourceType, sourceId, targetType, targetId, and 4 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(122,35): error TS2345: Argument of type '{ name: string; type: string; trigger: string; config: { amount: number; }; }' is not assignable to parameter of type 'Partial<AutoFundingRule>'.
  Types of property 'config' are incompatible.
    Type '{ amount: number; }' is missing the following properties from type 'RuleConfig': sourceType, sourceId, targetType, targetId, and 4 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(135,35): error TS2345: Argument of type '{ name: string; type: string; trigger: string; config: { percentage: number; }; }' is not assignable to parameter of type 'Partial<AutoFundingRule>'.
  Types of property 'config' are incompatible.
    Type '{ percentage: number; }' is missing the following properties from type 'RuleConfig': sourceType, sourceId, targetType, targetId, and 4 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(148,35): error TS2345: Argument of type '{ name: string; type: string; trigger: string; config: { conditions: any[]; }; }' is not assignable to parameter of type 'Partial<AutoFundingRule>'.
  Types of property 'config' are incompatible.
    Type '{ conditions: any[]; }' is missing the following properties from type 'RuleConfig': sourceType, sourceId, targetType, targetId, and 4 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(165,35): error TS2345: Argument of type '{ name: string; type: string; trigger: string; config: { amount: number; targetType: string; }; }' is not assignable to parameter of type 'Partial<AutoFundingRule>'.
  Types of property 'config' are incompatible.
    Type '{ amount: number; targetType: string; }' is missing the following properties from type 'RuleConfig': sourceType, sourceId, targetId, targetIds, and 3 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(189,45): error TS2345: Argument of type '{ type: string; config: { amount: number; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ type: string; config: { amount: number; }; }' is missing the following properties from type 'AutoFundingRule': id, name, description, trigger, and 5 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(199,45): error TS2345: Argument of type '{ type: string; config: { amount: number; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ type: string; config: { amount: number; }; }' is missing the following properties from type 'AutoFundingRule': id, name, description, trigger, and 5 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(209,45): error TS2345: Argument of type '{ type: string; config: { percentage: number; sourceType: string; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ type: string; config: { percentage: number; sourceType: string; }; }' is missing the following properties from type 'AutoFundingRule': id, name, description, trigger, and 5 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(219,45): error TS2345: Argument of type '{ type: string; config: { targetId: string; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ type: string; config: { targetId: string; }; }' is missing the following properties from type 'AutoFundingRule': id, name, description, trigger, and 5 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(229,45): error TS2345: Argument of type '{ type: string; config: { targetIds: string[]; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ type: string; config: { targetIds: string[]; }; }' is missing the following properties from type 'AutoFundingRule': id, name, description, trigger, and 5 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(245,49): error TS2345: Argument of type '{ config: { sourceType: string; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ config: { sourceType: string; }; }' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 6 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(251,49): error TS2345: Argument of type '{ config: { sourceType: string; sourceId: string; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ config: { sourceType: string; sourceId: string; }; }' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 6 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(257,49): error TS2345: Argument of type '{ config: { sourceType: string; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ config: { sourceType: string; }; }' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 6 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(265,49): error TS2345: Argument of type '{ config: { sourceType: string; sourceId: string; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ config: { sourceType: string; sourceId: string; }; }' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 6 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(283,50): error TS2345: Argument of type '{ config: { targetId: string; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ config: { targetId: string; }; }' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 6 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(289,50): error TS2345: Argument of type '{ config: { targetId: string; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ config: { targetId: string; }; }' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 6 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(302,50): error TS2345: Argument of type '{ config: { targetId: string; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ config: { targetId: string; }; }' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 6 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(308,50): error TS2345: Argument of type '{ config: { targetId: string; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ config: { targetId: string; }; }' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 6 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(321,42): error TS2345: Argument of type '{ id: string; priority: number; }[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type '{ id: string; priority: number; }' is missing the following properties from type 'AutoFundingRule': name, description, type, trigger, and 5 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(332,42): error TS2345: Argument of type '{ id: string; priority: number; createdAt: string; }[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type '{ id: string; priority: number; createdAt: string; }' is missing the following properties from type 'AutoFundingRule': name, description, type, trigger, and 4 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(343,42): error TS2345: Argument of type '({ id: string; priority: number; } | { id: string; priority?: undefined; })[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type '{ id: string; priority: number; } | { id: string; priority?: undefined; }' is not assignable to type 'AutoFundingRule'.
    Type '{ id: string; priority: number; }' is missing the following properties from type 'AutoFundingRule': name, description, type, trigger, and 5 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(374,34): error TS2345: Argument of type '{ id: string; name: string; enabled: boolean; type: string; trigger: string; }[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type '{ id: string; name: string; enabled: boolean; type: string; trigger: string; }' is missing the following properties from type 'AutoFundingRule': description, priority, createdAt, lastExecuted, and 2 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(380,34): error TS2345: Argument of type '{ id: string; name: string; enabled: boolean; type: string; trigger: string; }[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type '{ id: string; name: string; enabled: boolean; type: string; trigger: string; }' is missing the following properties from type 'AutoFundingRule': description, priority, createdAt, lastExecuted, and 2 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(386,34): error TS2345: Argument of type '{ id: string; name: string; enabled: boolean; type: string; trigger: string; }[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type '{ id: string; name: string; enabled: boolean; type: string; trigger: string; }' is missing the following properties from type 'AutoFundingRule': description, priority, createdAt, lastExecuted, and 2 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(392,34): error TS2345: Argument of type '{ id: string; name: string; enabled: boolean; type: string; trigger: string; }[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type '{ id: string; name: string; enabled: boolean; type: string; trigger: string; }' is missing the following properties from type 'AutoFundingRule': description, priority, createdAt, lastExecuted, and 2 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(398,34): error TS2345: Argument of type '{ id: string; name: string; enabled: boolean; type: string; trigger: string; }[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type '{ id: string; name: string; enabled: boolean; type: string; trigger: string; }' is missing the following properties from type 'AutoFundingRule': description, priority, createdAt, lastExecuted, and 2 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(407,34): error TS2345: Argument of type '{ id: string; name: string; enabled: boolean; type: string; trigger: string; }[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type '{ id: string; name: string; enabled: boolean; type: string; trigger: string; }' is missing the following properties from type 'AutoFundingRule': description, priority, createdAt, lastExecuted, and 2 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(437,39): error TS2345: Argument of type '({ enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted: string; } | { enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted?: undefined; })[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type '{ enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted: string; } | { enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted?: undefined; }' is not assignable to type 'AutoFundingRule'.
    Type '{ enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted: string; }' is missing the following properties from type 'AutoFundingRule': id, name, description, priority, and 2 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(447,39): error TS2345: Argument of type '({ enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted: string; } | { enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted?: undefined; })[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type '{ enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted: string; } | { enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted?: undefined; }' is not assignable to type 'AutoFundingRule'.
    Type '{ enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted: string; }' is missing the following properties from type 'AutoFundingRule': id, name, description, priority, and 2 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(454,39): error TS2345: Argument of type '({ enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted: string; } | { enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted?: undefined; })[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type '{ enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted: string; } | { enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted?: undefined; }' is not assignable to type 'AutoFundingRule'.
    Type '{ enabled: boolean; type: string; trigger: string; executionCount: number; lastExecuted: string; }' is missing the following properties from type 'AutoFundingRule': id, name, description, priority, and 2 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(483,41): error TS2345: Argument of type '{ id: string; name: string; enabled: boolean; priority: number; type: string; trigger: string; config: { amount: number; targetType: string; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ id: string; name: string; enabled: boolean; priority: number; type: string; trigger: string; config: { amount: number; targetType: string; }; }' is missing the following properties from type 'AutoFundingRule': description, createdAt, lastExecuted, executionCount
src/utils/budgeting/autofunding/__tests__/rules.test.ts(503,41): error TS2345: Argument of type '{ id: string; name: string; type: string; trigger: string; config: { percentage: number; targetType: string; targetIds: string[]; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ id: string; name: string; type: string; trigger: string; config: { percentage: number; targetType: string; targetIds: string[]; }; }' is missing the following properties from type 'AutoFundingRule': description, priority, enabled, createdAt, and 2 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(518,41): error TS2345: Argument of type '{ id: string; name: string; type: string; trigger: string; config: { targetType: string; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ id: string; name: string; type: string; trigger: string; config: { targetType: string; }; }' is missing the following properties from type 'AutoFundingRule': description, priority, enabled, createdAt, and 2 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(536,41): error TS2345: Argument of type '{ id: string; name: string; type: string; trigger: string; config: { conditions: { type: string; value: number; }[]; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ id: string; name: string; type: string; trigger: string; config: { conditions: { type: string; value: number; }[]; }; }' is missing the following properties from type 'AutoFundingRule': description, priority, enabled, createdAt, and 2 more.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(549,41): error TS2345: Argument of type '{ id: string; name: string; type: string; trigger: string; config: { amount: number; }; }' is not assignable to parameter of type 'AutoFundingRule'.
  Type '{ id: string; name: string; type: string; trigger: string; config: { amount: number; }; }' is missing the following properties from type 'AutoFundingRule': description, priority, enabled, createdAt, and 2 more.
src/utils/budgeting/autofunding/__tests__/simulation.test.ts(300,21): error TS2339: Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; } | { success: boolean; error: any; simulation: any; } | { ...; }'.
  Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; }'.
src/utils/budgeting/autofunding/__tests__/simulation.test.ts(301,21): error TS2339: Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; } | { success: boolean; error: any; simulation: any; } | { ...; }'.
  Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; }'.
src/utils/budgeting/autofunding/__tests__/simulation.test.ts(302,21): error TS2339: Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; } | { success: boolean; error: any; simulation: any; } | { ...; }'.
  Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; }'.
src/utils/budgeting/autofunding/__tests__/simulation.test.ts(303,21): error TS2339: Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; } | { success: boolean; error: any; simulation: any; } | { ...; }'.
  Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; }'.
src/utils/budgeting/autofunding/__tests__/simulation.test.ts(304,21): error TS2339: Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; } | { success: boolean; error: any; simulation: any; } | { ...; }'.
  Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; }'.
src/utils/budgeting/autofunding/__tests__/simulation.test.ts(305,21): error TS2339: Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; } | { success: boolean; error: any; simulation: any; } | { ...; }'.
  Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; }'.
src/utils/budgeting/autofunding/__tests__/simulation.test.ts(306,21): error TS2339: Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; } | { success: boolean; error: any; simulation: any; } | { ...; }'.
  Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; }'.
src/utils/budgeting/autofunding/__tests__/simulation.test.ts(307,21): error TS2339: Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; } | { success: boolean; error: any; simulation: any; } | { ...; }'.
  Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; }'.
src/utils/budgeting/autofunding/__tests__/simulation.test.ts(308,21): error TS2339: Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; } | { success: boolean; error: any; simulation: any; } | { ...; }'.
  Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; }'.
src/utils/budgeting/autofunding/__tests__/simulation.test.ts(309,21): error TS2339: Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; } | { success: boolean; error: any; simulation: any; } | { ...; }'.
  Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; }'.
src/utils/budgeting/autofunding/__tests__/simulation.test.ts(310,21): error TS2339: Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; } | { success: boolean; error: any; simulation: any; } | { ...; }'.
  Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; }'.
src/utils/budgeting/autofunding/__tests__/simulation.test.ts(322,21): error TS2339: Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; } | { success: boolean; error: any; simulation: any; } | { ...; }'.
  Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; }'.
src/utils/budgeting/autofunding/__tests__/simulation.test.ts(323,21): error TS2339: Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; } | { success: boolean; error: any; simulation: any; } | { ...; }'.
  Property 'plan' does not exist on type '{ success: boolean; simulation: { totalPlanned: number; rulesExecuted: number; plannedTransfers: any[]; ruleResults: any[]; remainingCash: any; errors: any[]; }; error?: undefined; }'.
src/utils/budgeting/autofunding/conditions.ts(251,3): error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Condition'.
src/utils/budgeting/autofunding/simulation.ts(328,22): error TS6133: '_unassignedCash' is declared but its value is never read.
src/utils/budgeting/billEnvelopeCalculations.ts(132,49): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/billEnvelopeCalculations.ts(158,5): error TS2322: Type 'unknown' is not assignable to type 'number'.
src/utils/budgeting/billEnvelopeCalculations.ts(159,5): error TS2322: Type '{ id: string; name: unknown; amount: number; dueDate: string | Date; category: unknown; frequency: unknown; }' is not assignable to type '{ id: string; name: string; amount: number; dueDate: string; category?: string; frequency: string; }'.
  Types of property 'name' are incompatible.
    Type 'unknown' is not assignable to type 'string'.
src/utils/budgeting/envelopeCalculations.ts(40,14): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/envelopeCalculations.ts(40,22): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/envelopeCalculations.ts(107,21): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/envelopeCalculations.ts(107,53): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/envelopeFormUtils.ts(100,48): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/envelopeFormUtils.ts(180,50): error TS2554: Expected 2-3 arguments, but got 1.
src/utils/budgeting/envelopeFormUtils.ts(186,48): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/envelopeFormUtils.ts(224,11): error TS2339: Property 'editingId' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(224,22): error TS2339: Property 'createdBy' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(253,14): error TS2339: Property 'id' does not exist on type '{ name: any; monthlyAmount: number; currentBalance: number; category: any; color: any; frequency: any; description: any; priority: any; autoAllocate: boolean; icon: any; envelopeType: any; targetAmount: number; ... 4 more ...; updatedBy: any; }'.
src/utils/budgeting/envelopeFormUtils.ts(254,14): error TS2339: Property 'createdAt' does not exist on type '{ name: any; monthlyAmount: number; currentBalance: number; category: any; color: any; frequency: any; description: any; priority: any; autoAllocate: boolean; icon: any; envelopeType: any; targetAmount: number; ... 4 more ...; updatedBy: any; }'.
src/utils/budgeting/envelopeFormUtils.ts(255,14): error TS2339: Property 'createdBy' does not exist on type '{ name: any; monthlyAmount: number; currentBalance: number; category: any; color: any; frequency: any; description: any; priority: any; autoAllocate: boolean; icon: any; envelopeType: any; targetAmount: number; ... 4 more ...; updatedBy: any; }'.
src/utils/budgeting/envelopeFormUtils.ts(257,14): error TS2339: Property 'id' does not exist on type '{ name: any; monthlyAmount: number; currentBalance: number; category: any; color: any; frequency: any; description: any; priority: any; autoAllocate: boolean; icon: any; envelopeType: any; targetAmount: number; ... 4 more ...; updatedBy: any; }'.
src/utils/budgeting/envelopeFormUtils.ts(267,3): error TS2322: Type 'unknown' is not assignable to type 'string | boolean'.
src/utils/budgeting/envelopeFormUtils.ts(309,48): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/envelopeFormUtils.ts(380,46): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/envelopeFormUtils.ts(381,32): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/envelopeFormUtils.ts(389,34): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/envelopeIntegrityChecker.ts(46,30): error TS2339: Property 'monthlyAmount' does not exist on type 'Envelope'.
src/utils/budgeting/envelopeIntegrityChecker.ts(230,28): error TS2339: Property 'monthlyAmount' does not exist on type 'Envelope'.
src/utils/budgeting/envelopeIntegrityChecker.ts(236,15): error TS2339: Property 'monthlyAmount' does not exist on type 'Envelope'.
src/utils/budgeting/paycheckProcessing.ts(104,38): error TS2345: Argument of type '{ id: string; date: Date; amount: any; mode: any; unassignedCashBefore: any; unassignedCashAfter: any; actualBalanceBefore: any; actualBalanceAfter: any; envelopeAllocations: any; notes: any; }' is not assignable to parameter of type 'PaycheckHistory'.
  Type '{ id: string; date: Date; amount: any; mode: any; unassignedCashBefore: any; unassignedCashAfter: any; actualBalanceBefore: any; actualBalanceAfter: any; envelopeAllocations: any; notes: any; }' is missing the following properties from type 'PaycheckHistory': source, lastModified
src/utils/budgeting/paycheckUtils.ts(130,12): error TS2339: Property 'amount' does not exist on type '{}'.
src/utils/budgeting/paycheckUtils.ts(132,31): error TS2345: Argument of type 'string | number' is not assignable to parameter of type 'string'.
  Type 'number' is not assignable to type 'string'.
src/utils/budgeting/paycheckUtils.ts(134,14): error TS2339: Property 'amount' does not exist on type '{}'.
src/utils/budgeting/paycheckUtils.ts(136,14): error TS2339: Property 'amount' does not exist on type '{}'.
src/utils/budgeting/paycheckUtils.ts(142,12): error TS2339: Property 'payerName' does not exist on type '{}'.
src/utils/budgeting/paycheckUtils.ts(144,12): error TS2339: Property 'payerName' does not exist on type '{}'.
src/utils/budgeting/paycheckUtils.ts(149,12): error TS2339: Property 'allocationMode' does not exist on type '{}'.
src/utils/budgeting/paycheckUtils.ts(221,3): error TS2322: Type 'unknown[]' is not assignable to type 'string[]'.
  Type 'unknown' is not assignable to type 'string'.
src/utils/budgeting/paycheckUtils.ts(245,29): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/utils/budgeting/paycheckUtils.ts(342,24): error TS2345: Argument of type 'string | number' is not assignable to parameter of type 'string'.
  Type 'number' is not assignable to type 'string'.
src/utils/budgeting/suggestionUtils.ts(123,22): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(123,58): error TS2339: Property 'count' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(124,43): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(128,40): error TS2339: Property 'category' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(130,32): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(131,40): error TS2339: Property 'category' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(132,39): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(132,82): error TS2339: Property 'count' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(134,45): error TS2339: Property 'count' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(138,30): error TS2339: Property 'category' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(140,34): error TS2339: Property 'category' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(190,14): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(190,42): error TS2339: Property 'count' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(191,35): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(205,26): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(207,33): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(207,72): error TS2339: Property 'count' does not exist on type 'unknown'.
src/utils/budgeting/suggestionUtils.ts(320,11): error TS2339: Property 'dismissedSuggestions' does not exist on type '{}'.
src/utils/budgeting/suggestionUtils.ts(320,45): error TS2339: Property 'showDismissed' does not exist on type '{}'.
src/utils/common/analyticsProcessor.ts(39,41): error TS2345: Argument of type 'Date' is not assignable to parameter of type 'number'.
src/utils/common/analyticsProcessor.ts(123,77): error TS2554: Expected 1-2 arguments, but got 3.
src/utils/common/analyticsProcessor.ts(127,50): error TS2339: Property 'month' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(127,72): error TS2339: Property 'month' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(160,53): error TS2339: Property 'expenses' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(160,66): error TS2339: Property 'expenses' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(232,7): error TS2698: Spread types may only be created from object types.
src/utils/common/analyticsProcessor.ts(233,41): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(233,53): error TS2339: Property 'budget' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(234,40): error TS2339: Property 'budget' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(234,53): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(286,50): error TS2339: Property 'income' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(295,50): error TS2339: Property 'expenses' does not exist on type 'unknown'.
src/utils/common/billDiscovery.ts(126,15): error TS2339: Property 'length' does not exist on type 'unknown'.
src/utils/common/budgetHistoryTracker.ts(347,38): error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'BudgetTag'.
  Type 'Record<string, unknown>' is missing the following properties from type 'BudgetTag': name, commitHash, tagType, author, created
src/utils/common/fixAutoAllocateUndefined.ts(18,65): error TS2339: Property 'autoAllocate' does not exist on type 'Envelope'.
src/utils/common/fixAutoAllocateUndefined.ts(30,9): error TS2353: Object literal may only specify known properties, and 'autoAllocate' does not exist in type 'UpdateSpec<Envelope> | ((obj: Envelope, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/utils/common/fixAutoAllocateUndefined.ts(40,61): error TS2339: Property 'autoAllocate' does not exist on type 'Envelope'.
src/utils/common/highlight.ts(110,7): error TS2353: Object literal may only specify known properties, and 'privacyOptions' does not exist in type 'HighlightOptions'.
src/utils/common/highlight.ts(136,7): error TS6133: '_setupConsoleCapture' is declared but its value is never read.
src/utils/common/highlight.ts(247,52): error TS2339: Property 'message' does not exist on type 'unknown'.
src/utils/common/highlight.ts(247,62): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/utils/common/highlight.ts(279,27): error TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'string'.
src/utils/common/logger.ts(55,27): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/common/logger.ts(93,27): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/common/logger.ts(162,25): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/common/logger.ts(282,4): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/common/logger.ts(283,4): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/common/ocrProcessor.ts(29,25): error TS2339: Property 'loadLanguage' does not exist on type 'unknown'.
src/utils/common/ocrProcessor.ts(30,25): error TS2339: Property 'initialize' does not exist on type 'unknown'.
src/utils/common/ocrProcessor.ts(33,25): error TS2339: Property 'setParameters' does not exist on type 'unknown'.
src/utils/common/ocrProcessor.ts(61,40): error TS2339: Property 'recognize' does not exist on type 'unknown'.
src/utils/common/ocrProcessor.ts(276,27): error TS2339: Property 'terminate' does not exist on type 'unknown'.
src/utils/common/performance.ts(47,37): error TS2339: Property 'usedJSHeapSize' does not exist on type 'unknown'.
src/utils/common/performance.ts(48,38): error TS2339: Property 'totalJSHeapSize' does not exist on type 'unknown'.
src/utils/common/performance.ts(49,38): error TS2339: Property 'jsHeapSizeLimit' does not exist on type 'unknown'.
src/utils/common/performance.ts(71,37): error TS2339: Property '__vitePreload' does not exist on type 'Window & typeof globalThis'.
src/utils/common/performance.ts(74,16): error TS2339: Property '__vitePreload' does not exist on type 'Window & typeof globalThis'.
src/utils/common/testBudgetHistory.ts(47,40): error TS2345: Argument of type '({ commitHash: string; entityType: string; entityId: string; changeType: string; description: string; beforeData: { balance: number; }; afterData: { balance: number; amount?: undefined; description?: undefined; }; } | { ...; })[]' is not assignable to parameter of type 'BudgetChange[]'.
  Type '{ commitHash: string; entityType: string; entityId: string; changeType: string; description: string; beforeData: { balance: number; }; afterData: { balance: number; amount?: undefined; description?: undefined; }; } | { ...; }' is not assignable to type 'BudgetChange'.
    Type '{ commitHash: string; entityType: string; entityId: string; changeType: string; description: string; beforeData: { balance: number; }; afterData: { balance: number; amount?: undefined; description?: undefined; }; }' is not assignable to type 'BudgetChange'.
      Types of property 'changeType' are incompatible.
        Type 'string' is not assignable to type '"create" | "update" | "delete"'.
src/utils/common/testBudgetHistory.ts(66,36): error TS2551: Property 'getBudgetCommits' does not exist on type 'VioletVaultDB'. Did you mean 'budgetCommits'?
src/utils/common/transactionArchiving.ts(437,45): error TS2339: Property 'transactions' does not exist on type 'unknown'.
src/utils/common/transactionArchiving.ts(442,33): error TS2339: Property 'transactions' does not exist on type 'unknown'.
src/utils/common/transactionArchiving.ts(444,26): error TS2339: Property 'transactions' does not exist on type 'unknown'.
src/utils/common/version.ts(49,5): error TS2741: Property 'ttl' is missing in type '{ data: any; timestamp: number; }' but required in type '{ data: any; timestamp: any; ttl: number; }'.
src/utils/common/version.ts(130,48): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/utils/common/version.ts(144,46): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/utils/common/version.ts(507,5): error TS2741: Property 'ttl' is missing in type '{ data: any; timestamp: number; }' but required in type '{ data: any; timestamp: any; ttl: number; }'.
src/utils/dataManagement/__tests__/backupUtils.test.ts(23,34): error TS2339: Property 'mockResolvedValue' does not exist on type '{ (): PromiseExtended<Envelope[]>; <R>(thenShortcut: ThenShortcut<Envelope[], R>): PromiseExtended<R>; }'.
src/utils/dataManagement/__tests__/backupUtils.test.ts(24,25): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<BudgetRecord>'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(7,25): error TS6133: 'mode' is declared but its value is never read.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(7,31): error TS6133: 'tables' is declared but its value is never read.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(31,23): error TS2339: Property 'syncMetadata' does not exist on type 'VioletVaultDB'.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(37,41): error TS2339: Property 'mockResolvedValue' does not exist on type '(overrideConfig?: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>'.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(45,41): error TS2339: Property 'mockResolvedValue' does not exist on type '(overrideConfig?: any) => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>'.
src/utils/dataManagement/dexieUtils.ts(70,33): error TS2345: Argument of type '{ id: string; unassignedCash: any; biweeklyAllocation: any; actualBalance: any; isActualBalanceManual: any; supplementalAccounts: any; lastUpdated: string; }' is not assignable to parameter of type 'BudgetRecord'.
  Property 'lastModified' is missing in type '{ id: string; unassignedCash: any; biweeklyAllocation: any; actualBalance: any; isActualBalanceManual: any; supplementalAccounts: any; lastUpdated: string; }' but required in type 'BudgetRecord'.
src/utils/dataManagement/firebaseUtils.ts(12,18): error TS2339: Property 'syncMetadata' does not exist on type 'VioletVaultDB'.
src/utils/dataManagement/firebaseUtils.ts(13,22): error TS2339: Property 'syncMetadata' does not exist on type 'VioletVaultDB'.
src/utils/dataManagement/firebaseUtils.ts(36,13): error TS2339: Property 'chunkedSyncService' does not exist on type 'typeof import("violet-vault/src/services/chunkedSyncService")'.
src/utils/debts/__tests__/debtFormValidation.test.ts(8,3): error TS2305: Module '"../debtFormValidation"' has no exported member 'formatDebtMetrics'.
src/utils/debts/__tests__/debtFormValidation.test.ts(39,32): error TS2339: Property 'currentBalance' does not exist on type 'DebtFormData'.
src/utils/debts/__tests__/debtFormValidation.test.ts(172,32): error TS2339: Property 'currentBalance' does not exist on type 'DebtFormData'.
src/utils/debts/__tests__/debtFormValidation.test.ts(173,32): error TS2339: Property 'originalBalance' does not exist on type 'DebtFormData'.
src/utils/debts/__tests__/debtFormValidation.test.ts(188,32): error TS2339: Property 'originalBalance' does not exist on type 'DebtFormData'.
src/utils/debts/__tests__/debtFormValidation.test.ts(204,44): error TS2345: Argument of type '{ currentBalance: number; originalBalance: number; interestRate: number; minimumPayment: number; paymentFrequency: string; }' is not assignable to parameter of type 'DebtFormData'.
  Type '{ currentBalance: number; originalBalance: number; interestRate: number; minimumPayment: number; paymentFrequency: string; }' is missing the following properties from type 'DebtFormData': name, creditor, balance, type, and 2 more.
src/utils/debts/__tests__/debtFormValidation.test.ts(207,22): error TS2339: Property 'totalPaid' does not exist on type 'DebtMetrics'.
src/utils/debts/__tests__/debtFormValidation.test.ts(208,22): error TS2339: Property 'paymentToBalanceRatio' does not exist on type 'DebtMetrics'.
src/utils/debts/__tests__/debtFormValidation.test.ts(209,22): error TS2339: Property 'monthsToPayoff' does not exist on type 'DebtMetrics'.
src/utils/debts/__tests__/debtFormValidation.test.ts(210,22): error TS2551: Property 'totalInterest' does not exist on type 'DebtMetrics'. Did you mean 'totalInterestPaid'?
src/utils/debts/__tests__/debtFormValidation.test.ts(211,22): error TS2339: Property 'isPaymentSufficient' does not exist on type 'DebtMetrics'.
src/utils/debts/__tests__/debtFormValidation.test.ts(224,44): error TS2345: Argument of type '{ currentBalance: number; originalBalance: number; interestRate: number; minimumPayment: number; paymentFrequency: string; }' is not assignable to parameter of type 'DebtFormData'.
  Type '{ currentBalance: number; originalBalance: number; interestRate: number; minimumPayment: number; paymentFrequency: string; }' is missing the following properties from type 'DebtFormData': name, creditor, balance, type, and 2 more.
src/utils/debts/__tests__/debtFormValidation.test.ts(226,22): error TS2339: Property 'monthsToPayoff' does not exist on type 'DebtMetrics'.
src/utils/debts/__tests__/debtFormValidation.test.ts(227,22): error TS2551: Property 'totalInterest' does not exist on type 'DebtMetrics'. Did you mean 'totalInterestPaid'?
src/utils/debts/__tests__/debtFormValidation.test.ts(228,22): error TS2339: Property 'isPaymentSufficient' does not exist on type 'DebtMetrics'.
src/utils/debts/__tests__/debtFormValidation.test.ts(241,44): error TS2345: Argument of type '{ currentBalance: number; originalBalance: number; interestRate: number; minimumPayment: number; paymentFrequency: string; }' is not assignable to parameter of type 'DebtFormData'.
  Type '{ currentBalance: number; originalBalance: number; interestRate: number; minimumPayment: number; paymentFrequency: string; }' is missing the following properties from type 'DebtFormData': name, creditor, balance, type, and 2 more.
src/utils/debts/__tests__/debtFormValidation.test.ts(243,22): error TS2339: Property 'isPaymentSufficient' does not exist on type 'DebtMetrics'.
src/utils/debts/__tests__/debtFormValidation.test.ts(244,22): error TS2339: Property 'monthsToPayoff' does not exist on type 'DebtMetrics'.
src/utils/debts/__tests__/debtFormValidation.test.ts(245,22): error TS2551: Property 'totalInterest' does not exist on type 'DebtMetrics'. Did you mean 'totalInterestPaid'?
src/utils/debts/__tests__/debtFormValidation.test.ts(259,44): error TS2345: Argument of type '{ currentBalance: number; originalBalance: number; interestRate: number; minimumPayment: number; paymentFrequency: string; }' is not assignable to parameter of type 'DebtFormData'.
  Type '{ currentBalance: number; originalBalance: number; interestRate: number; minimumPayment: number; paymentFrequency: string; }' is missing the following properties from type 'DebtFormData': name, creditor, balance, type, and 2 more.
src/utils/debts/__tests__/debtFormValidation.test.ts(262,22): error TS2339: Property 'monthsToPayoff' does not exist on type 'DebtMetrics'.
src/utils/debts/__tests__/debtFormValidation.test.ts(274,44): error TS2345: Argument of type '{ currentBalance: number; originalBalance: number; interestRate: number; minimumPayment: number; paymentFrequency: string; }' is not assignable to parameter of type 'DebtFormData'.
  Type '{ currentBalance: number; originalBalance: number; interestRate: number; minimumPayment: number; paymentFrequency: string; }' is missing the following properties from type 'DebtFormData': name, creditor, balance, type, and 2 more.
src/utils/debts/__tests__/debtFormValidation.test.ts(277,22): error TS2339: Property 'monthsToPayoff' does not exist on type 'DebtMetrics'.
src/utils/debts/__tests__/debtFormValidation.test.ts(288,44): error TS2345: Argument of type '{ currentBalance: number; minimumPayment: number; }' is not assignable to parameter of type 'DebtFormData'.
  Type '{ currentBalance: number; minimumPayment: number; }' is missing the following properties from type 'DebtFormData': name, creditor, balance, interestRate, and 4 more.
src/utils/debts/__tests__/debtFormValidation.test.ts(302,44): error TS2345: Argument of type '{ currentBalance: number; originalBalance: number; interestRate: number; minimumPayment: number; }' is not assignable to parameter of type 'DebtFormData'.
  Type '{ currentBalance: number; originalBalance: number; interestRate: number; minimumPayment: number; }' is missing the following properties from type 'DebtFormData': name, creditor, balance, type, and 3 more.
src/utils/debts/__tests__/debtFormValidation.test.ts(305,22): error TS2339: Property 'monthsToPayoff' does not exist on type 'DebtMetrics'.
src/utils/debts/debtCalculations.ts(89,5): error TS2739: Type '{ monthsToPayoff: any; totalInterest: number; payoffDate: string; }' is missing the following properties from type 'PayoffProjection': totalMonths, monthlyBreakdown
src/utils/debts/debtFormValidation.ts(103,28): error TS2339: Property 'trim' does not exist on type 'unknown'.
src/utils/debts/debtFormValidation.ts(104,36): error TS2339: Property 'trim' does not exist on type 'unknown'.
src/utils/debts/debtFormValidation.ts(112,30): error TS2339: Property 'trim' does not exist on type 'unknown'.
src/utils/debug/dataDiagnostic.ts(21,17): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(31,35): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(32,18): error TS2339: Property 'metadata' does not exist on type '{}'.
src/utils/debug/dataDiagnostic.ts(57,22): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(59,22): error TS2339: Property 'metadata' does not exist on type '{}'.
src/utils/debug/dataDiagnostic.ts(60,22): error TS2339: Property 'metadata' does not exist on type '{}'.
src/utils/debug/dataDiagnostic.ts(73,36): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(74,37): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(86,18): error TS2339: Property 'tableCounts' does not exist on type '{}'.
src/utils/debug/dataDiagnostic.ts(90,40): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(91,18): error TS2339: Property 'budgetTable' does not exist on type '{}'.
src/utils/debug/dataDiagnostic.ts(114,15): error TS2345: Argument of type '{ timestamp: string; browser: string; url: string; data: {}; errors: any[]; }' is not assignable to parameter of type 'string'.
src/utils/debug/dataDiagnostic.ts(125,15): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(131,39): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(136,19): error TS2345: Argument of type '{ id: any; idType: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"; idValid: boolean; amount: any; amountType: "string" | "number" | "bigint" | ... 4 more ... | "function"; ... 7 more ...; fullRecord: any; }' is not assignable to parameter of type 'string'.
src/utils/debug/dataDiagnostic.ts(164,15): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(171,39): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(233,27): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(236,27): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(250,49): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(274,10): error TS2551: Property 'runDataDiagnostic' does not exist on type 'Window & typeof globalThis'. Did you mean 'dataDiagnostic'?
src/utils/debug/dataDiagnostic.ts(275,10): error TS2339: Property 'cleanupCorruptedPaychecks' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(276,10): error TS2339: Property 'inspectPaycheckRecords' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(27,15): error TS2339: Property 'indexedDB' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(31,42): error TS2345: Argument of type 'string[]' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'string[]'.
src/utils/debug/syncDiagnostic.ts(45,16): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(46,37): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(47,15): error TS2339: Property 'budgetMetadata' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(72,16): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(85,40): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(91,15): error TS2339: Property 'dataCounts' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(96,54): error TS2365: Operator '+' cannot be applied to types 'unknown' and 'number'.
src/utils/debug/syncDiagnostic.ts(114,15): error TS2339: Property 'cloudSync' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(115,44): error TS2339: Property 'isRunning' does not exist on type '{ triggerSyncForCriticalChange: (changeType: string) => void; }'.
src/utils/debug/syncDiagnostic.ts(116,43): error TS2339: Property 'config' does not exist on type '{ triggerSyncForCriticalChange: (changeType: string) => void; }'.
src/utils/debug/syncDiagnostic.ts(117,47): error TS2339: Property 'lastSyncTime' does not exist on type '{ triggerSyncForCriticalChange: (changeType: string) => void; }'.
src/utils/debug/syncDiagnostic.ts(120,58): error TS2339: Property 'cloudSync' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(122,36): error TS2339: Property 'isRunning' does not exist on type '{ triggerSyncForCriticalChange: (changeType: string) => void; }'.
src/utils/debug/syncDiagnostic.ts(138,16): error TS2551: Property 'firebase' does not exist on type 'Window & typeof globalThis'. Did you mean 'firebaseDb'?
src/utils/debug/syncDiagnostic.ts(138,35): error TS2551: Property 'firebase' does not exist on type 'Window & typeof globalThis'. Did you mean 'firebaseDb'?
src/utils/debug/syncDiagnostic.ts(139,27): error TS2551: Property 'firebase' does not exist on type 'Window & typeof globalThis'. Did you mean 'firebaseDb'?
src/utils/debug/syncDiagnostic.ts(140,15): error TS2339: Property 'firebaseAuth' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(168,11): error TS2339: Property 'network' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(170,27): error TS2339: Property 'connection' does not exist on type 'Navigator'.
src/utils/debug/syncDiagnostic.ts(172,36): error TS2339: Property 'connection' does not exist on type 'Navigator'.
src/utils/debug/syncDiagnostic.ts(173,31): error TS2339: Property 'connection' does not exist on type 'Navigator'.
src/utils/debug/syncDiagnostic.ts(179,46): error TS2339: Property 'network' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(203,15): error TS2345: Argument of type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }' is not assignable to parameter of type 'string'.
src/utils/debug/syncDiagnostic.ts(210,10): error TS2551: Property 'runSyncDiagnostic' does not exist on type 'Window & typeof globalThis'. Did you mean 'syncDiagnostic'?
src/utils/pwa/backgroundSync.ts(86,9): error TS2356: An arithmetic operand must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/pwa/backgroundSync.ts(235,4): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/pwa/offlineDataValidator.ts(152,20): error TS2352: Conversion of type 'Transaction' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Transaction'.
src/utils/pwa/offlineDataValidator.ts(169,64): error TS2352: Conversion of type 'Envelope' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Envelope'.
src/utils/pwa/offlineDataValidator.ts(170,60): error TS2352: Conversion of type 'Envelope' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Envelope'.
src/utils/pwa/offlineDataValidator.ts(316,4): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/pwa/patchNotesManager.ts(297,4): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/pwa/pwaManager.ts(69,24): error TS2339: Property 'getState' does not exist on type '{ setUpdateAvailable: (available: boolean) => void; }'.
src/utils/pwa/pwaManager.ts(99,24): error TS2339: Property 'getState' does not exist on type '{ setUpdateAvailable: (available: boolean) => void; }'.
src/utils/pwa/pwaManager.ts(120,20): error TS2339: Property 'getState' does not exist on type '{ setUpdateAvailable: (available: boolean) => void; }'.
src/utils/pwa/pwaManager.ts(138,26): error TS2339: Property 'getState' does not exist on type '{ setUpdateAvailable: (available: boolean) => void; }'.
src/utils/pwa/pwaManager.ts(139,24): error TS2339: Property 'getState' does not exist on type '{ setUpdateAvailable: (available: boolean) => void; }'.
src/utils/pwa/pwaManager.ts(147,20): error TS2339: Property 'getState' does not exist on type '{ setUpdateAvailable: (available: boolean) => void; }'.
src/utils/pwa/pwaManager.ts(148,20): error TS2339: Property 'hideInstallModal' does not exist on type '{ setUpdateAvailable: (available: boolean) => void; }'.
src/utils/pwa/pwaManager.ts(174,24): error TS2339: Property 'getState' does not exist on type '{ setUpdateAvailable: (available: boolean) => void; }'.
src/utils/pwa/pwaManager.ts(212,43): error TS2339: Property 'installPromptEvent' does not exist on type '{ setUpdateAvailable: (available: boolean) => void; }'.
src/utils/pwa/pwaManager.ts(239,14): error TS2339: Property 'getState' does not exist on type '{ setUpdateAvailable: (available: boolean) => void; }'.
src/utils/pwa/pwaManager.ts(264,38): error TS2551: Property 'updateAvailable' does not exist on type '{ setUpdateAvailable: (available: boolean) => void; }'. Did you mean 'setUpdateAvailable'?
src/utils/pwa/pwaManager.ts(275,4): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/pwa/serviceWorkerDiagnostics.ts(380,4): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/query/__tests__/config/queryClientConfig.test.ts(5,36): error TS6133: 'beforeEach' is declared but its value is never read.
src/utils/query/__tests__/config/queryClientConfig.test.ts(221,13): error TS6133: 'onErrorSpy' is declared but its value is never read.
src/utils/query/__tests__/integration/queryIntegration.test.ts(31,7): error TS2353: Object literal may only specify known properties, and 'logger' does not exist in type 'QueryClientConfig'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(347,61): error TS2339: Property 'name' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(351,70): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(359,74): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(362,93): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(369,59): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(369,79): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(370,32): error TS2339: Property 'balance' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(371,32): error TS2339: Property 'name' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(400,57): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(402,30): error TS2339: Property 'name' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(419,39): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(420,39): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(422,55): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(430,47): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(430,74): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(430,78): error TS2339: Property 'balance' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(431,47): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(431,74): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(431,78): error TS2339: Property 'balance' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(435,50): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(435,80): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(435,84): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(449,70): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(457,76): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(462,95): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(467,56): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(467,76): error TS2339: Property 'id' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(468,29): error TS2339: Property 'balance' does not exist on type 'unknown'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(468,56): error TS2339: Property 'balance' does not exist on type 'unknown'.
src/utils/query/__tests__/optimisticHelpers.test.ts(57,56): error TS6133: 'key' is declared but its value is never read.
src/utils/query/__tests__/optimisticHelpers.test.ts(64,33): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string | Envelope, changes: UpdateSpec<Envelope> | ((obj: Envelope, ctx: { value: any; primKey: IndexableType; }) => boolean | void)) => PromiseExtended<...>'.
src/utils/query/__tests__/optimisticHelpers.test.ts(95,33): error TS2339: Property 'mockRejectedValue' does not exist on type '(key: string | Envelope, changes: UpdateSpec<Envelope> | ((obj: Envelope, ctx: { value: any; primKey: IndexableType; }) => boolean | void)) => PromiseExtended<...>'.
src/utils/query/__tests__/optimisticHelpers.test.ts(144,56): error TS6133: 'key' is declared but its value is never read.
src/utils/query/__tests__/optimisticHelpers.test.ts(151,30): error TS2339: Property 'mockResolvedValue' does not exist on type '(item: Envelope, key?: string) => PromiseExtended<string>'.
src/utils/query/__tests__/optimisticHelpers.test.ts(172,56): error TS6133: 'key' is declared but its value is never read.
src/utils/query/__tests__/optimisticHelpers.test.ts(202,56): error TS6133: 'key' is declared but its value is never read.
src/utils/query/__tests__/optimisticHelpers.test.ts(209,33): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string) => PromiseExtended<void>'.
src/utils/query/__tests__/optimisticHelpers.test.ts(237,56): error TS6133: 'key' is declared but its value is never read.
src/utils/query/__tests__/optimisticHelpers.test.ts(244,36): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string | Transaction, changes: UpdateSpec<Transaction> | ((obj: Transaction, ctx: { value: any; primKey: IndexableType; }) => boolean | void)) => PromiseExtended<...>'.
src/utils/query/__tests__/optimisticHelpers.test.ts(277,33): error TS2339: Property 'mockResolvedValue' does not exist on type '(item: Transaction, key?: string) => PromiseExtended<string>'.
src/utils/query/__tests__/optimisticHelpers.test.ts(309,29): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string | Bill, changes: UpdateSpec<Bill> | ((obj: Bill, ctx: { value: any; primKey: IndexableType; }) => boolean | void)) => PromiseExtended<...>'.
src/utils/query/__tests__/optimisticHelpers.test.ts(337,48): error TS2339: Property 'mockResolvedValue' does not exist on type '(metadata: any) => Promise<void>'.
src/utils/query/__tests__/optimisticHelpers.test.ts(487,82): error TS2345: Argument of type '{ mutationKey: string[]; queryKey: string[]; updateFn: (old: any, variables: any) => any[]; }' is not assignable to parameter of type '{ mutationKey: any; queryKey: any; updateFn: any; rollbackFn: any; }'.
  Property 'rollbackFn' is missing in type '{ mutationKey: string[]; queryKey: string[]; updateFn: (old: any, variables: any) => any[]; }' but required in type '{ mutationKey: any; queryKey: any; updateFn: any; rollbackFn: any; }'.
src/utils/query/__tests__/optimisticHelpers.test.ts(507,82): error TS2345: Argument of type '{ mutationKey: string[]; queryKey: string[]; rollbackFn: Mock<Procedure>; }' is not assignable to parameter of type '{ mutationKey: any; queryKey: any; updateFn: any; rollbackFn: any; }'.
  Property 'updateFn' is missing in type '{ mutationKey: string[]; queryKey: string[]; rollbackFn: Mock<Procedure>; }' but required in type '{ mutationKey: any; queryKey: any; updateFn: any; rollbackFn: any; }'.
src/utils/query/__tests__/optimisticHelpers.test.ts(526,82): error TS2345: Argument of type '{ mutationKey: string[]; queryKey: string[]; }' is not assignable to parameter of type '{ mutationKey: any; queryKey: any; updateFn: any; rollbackFn: any; }'.
  Type '{ mutationKey: string[]; queryKey: string[]; }' is missing the following properties from type '{ mutationKey: any; queryKey: any; updateFn: any; rollbackFn: any; }': updateFn, rollbackFn
src/utils/query/__tests__/prefetchHelpers.test.ts(51,42): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: GetEnvelopesOptions) => Promise<unknown[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(69,42): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: GetEnvelopesOptions) => Promise<unknown[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(70,39): error TS2339: Property 'mockResolvedValue' does not exist on type '(category: string, includeArchived?: boolean) => Promise<Envelope[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(81,17): error TS2339: Property 'includeArchived' does not exist on type '{ category: string; }'.
src/utils/query/__tests__/prefetchHelpers.test.ts(96,42): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: GetEnvelopesOptions) => Promise<unknown[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(97,39): error TS2339: Property 'mockResolvedValue' does not exist on type '(category: string, includeArchived?: boolean) => Promise<Envelope[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(119,45): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: GetTransactionsOptions) => Promise<unknown[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(152,45): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: GetTransactionsOptions) => Promise<unknown[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(153,43): error TS2339: Property 'mockResolvedValue' does not exist on type '(startDate: Date, endDate: Date) => Promise<Transaction[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(173,38): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: GetBillsOptions) => Promise<unknown[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(189,38): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: GetBillsOptions) => Promise<unknown[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(205,45): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: GetSavingsGoalsOptions) => Promise<unknown[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(223,31): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string, maxAge?: number) => Promise<unknown>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(238,31): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string, maxAge?: number) => Promise<unknown>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(239,42): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: GetEnvelopesOptions) => Promise<unknown[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(240,45): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: GetTransactionsOptions) => Promise<unknown[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(241,38): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: GetBillsOptions) => Promise<unknown[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(242,47): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<unknown>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(243,31): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string, value: unknown, ttl?: number, category?: string) => Promise<void>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(273,46): error TS2339: Property 'mockResolvedValue' does not exist on type '(dateRange: DateRange, options?: GetAnalyticsDataOptions) => Promise<unknown>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(289,46): error TS2339: Property 'mockResolvedValue' does not exist on type '(dateRange: DateRange, options?: GetAnalyticsDataOptions) => Promise<unknown>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(310,13): error TS6133: 'mockResults' is declared but its value is never read.
src/utils/query/__tests__/queryKeys.test.ts(197,42): error TS2339: Property 'unknown' does not exist on type '{ budget: string[]; budgetData: () => string[]; budgetSummary: () => string[]; budgetMetadata: string[]; unassignedCash: () => string[]; actualBalance: () => string[]; envelopes: string[]; envelopesList: (filters?: {}) => {}[]; ... 44 more ...; syncActivity: () => string[]; }'.
src/utils/query/prefetchHelpers.ts(22,31): error TS2339: Property 'category' does not exist on type '{}'.
src/utils/query/prefetchHelpers.ts(23,38): error TS2339: Property 'includeArchived' does not exist on type '{}'.
src/utils/query/prefetchHelpers.ts(33,21): error TS2339: Property 'category' does not exist on type '{}'.
src/utils/query/prefetchHelpers.ts(34,21): error TS2339: Property 'includeArchived' does not exist on type '{}'.
src/utils/query/prefetchHelpers.ts(66,28): error TS2339: Property 'limit' does not exist on type '{}'.
src/utils/query/prefetchHelpers.ts(78,44): error TS2339: Property 'limit' does not exist on type '{}'.
src/utils/query/prefetchHelpers.ts(100,15): error TS2339: Property 'category' does not exist on type '{}'.
src/utils/query/prefetchHelpers.ts(100,25): error TS2339: Property 'isPaid' does not exist on type '{}'.
src/utils/query/prefetchHelpers.ts(100,33): error TS2339: Property 'daysAhead' does not exist on type '{}'.
src/utils/query/prefetchHelpers.ts(140,34): error TS2339: Property 'isCompleted' does not exist on type '{}'.
src/utils/query/prefetchHelpers.ts(141,31): error TS2339: Property 'category' does not exist on type '{}'.
src/utils/query/prefetchHelpers.ts(192,57): error TS2339: Property 'archived' does not exist on type 'unknown'.
src/utils/query/prefetchHelpers.ts(195,39): error TS2339: Property 'unassignedCash' does not exist on type 'unknown'.
src/utils/query/prefetchHelpers.ts(196,38): error TS2339: Property 'actualBalance' does not exist on type 'unknown'.
src/utils/receipts/receiptHelpers.tsx(201,43): error TS6133: 'field' is declared but its value is never read.
src/utils/savings/savingsCalculations.ts(43,70): error TS2554: Expected 1-2 arguments, but got 3.
src/utils/savings/savingsCalculations.ts(262,11): error TS2339: Property 'status' does not exist on type '{}'.
src/utils/savings/savingsCalculations.ts(262,27): error TS2339: Property 'includeCompleted' does not exist on type '{}'.
src/utils/savings/savingsFormUtils.ts(281,28): error TS2339: Property 'monthlyNeeded' does not exist on type 'SavingsGoalData'.
src/utils/savings/savingsFormUtils.ts(286,38): error TS2339: Property 'monthlyNeeded' does not exist on type 'SavingsGoalData'.
src/utils/savings/savingsFormUtils.ts(304,28): error TS2339: Property 'remainingAmount' does not exist on type 'SavingsGoalData'.
src/utils/savings/savingsFormUtils.ts(309,34): error TS2339: Property 'remainingAmount' does not exist on type 'SavingsGoalData'.
src/utils/security/encryption.ts(154,17): error TS2339: Property 'deviceMemory' does not exist on type 'Navigator'.
src/utils/security/errorViewer.ts(15,12): error TS2339: Property 'VioletVaultErrors' does not exist on type 'Window & typeof globalThis'.
src/utils/security/errorViewer.ts(27,9): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/utils/security/index.ts(1,10): error TS2305: Module '"./encryption.ts"' has no exported member 'default'.
src/utils/security/index.ts(2,10): error TS2305: Module '"./keyExport.ts"' has no exported member 'default'.
src/utils/security/optimizedSerialization.ts(67,38): error TS2769: No overload matches this call.
  Overload 1 of 2, '(data: Data, options: InflateFunctionOptions & { to: "string"; }): string', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'Data'.
  Overload 2 of 2, '(data: Data, options?: InflateFunctionOptions): Uint8Array<ArrayBuffer>', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'Data'.
src/utils/security/shareCodeUtils.ts(181,14): error TS2339: Property 'createdBy' does not exist on type '{ type: string; shareCode: any; version: string; }'.
src/utils/security/shareCodeUtils.ts(182,14): error TS2339: Property 'creatorColor' does not exist on type '{ type: string; shareCode: any; version: string; }'.
src/utils/security/shareCodeUtils.ts(183,14): error TS2339: Property 'createdAt' does not exist on type '{ type: string; shareCode: any; version: string; }'.
src/utils/services/editLockHelpers.ts(52,47): error TS2339: Property 'duration' does not exist on type '{}'.
src/utils/services/editLockHelpers.ts(98,47): error TS2339: Property 'duration' does not exist on type '{}'.
src/utils/stores/createSafeStore.ts(89,5): error TS2322: Type 'StateCreator<Record<string, unknown>, [], [["zustand/immer", never]]>' is not assignable to type 'StateCreator<Record<string, unknown>>'.
  Type 'StateCreator<Record<string, unknown>, [], [["zustand/immer", never]]>' is not assignable to type '{ $$storeMutators?: []; }'.
    Types of property '$$storeMutators' are incompatible.
      Type '[["zustand/immer", never]]' is not assignable to type '[]'.
        Source has 1 element(s) but target allows only 0.
src/utils/stores/createSafeStore.ts(106,5): error TS2322: Type 'StateCreator<Record<string, unknown>, [], [["zustand/persist", Record<string, unknown>]]>' is not assignable to type 'StateCreator<Record<string, unknown>>'.
  Type 'StateCreator<Record<string, unknown>, [], [["zustand/persist", Record<string, unknown>]]>' is not assignable to type '{ $$storeMutators?: []; }'.
    Types of property '$$storeMutators' are incompatible.
      Type '[["zustand/persist", Record<string, unknown>]]' is not assignable to type '[]'.
        Source has 1 element(s) but target allows only 0.
src/utils/stores/createSafeStore.ts(110,5): error TS2322: Type 'StateCreator<Record<string, unknown>, [], [["zustand/devtools", never]]>' is not assignable to type 'StateCreator<Record<string, unknown>>'.
  Type 'StateCreator<Record<string, unknown>, [], [["zustand/devtools", never]]>' is not assignable to type '{ $$storeMutators?: []; }'.
    Types of property '$$storeMutators' are incompatible.
      Type '[["zustand/devtools", never]]' is not assignable to type '[]'.
        Source has 1 element(s) but target allows only 0.
src/utils/stores/createSafeStore.ts(113,3): error TS2322: Type 'StateCreator<Record<string, unknown>, [], [["zustand/subscribeWithSelector", never]]>' is not assignable to type 'StateCreator<Record<string, unknown>>'.
  Type 'StateCreator<Record<string, unknown>, [], [["zustand/subscribeWithSelector", never]]>' is not assignable to type '{ $$storeMutators?: []; }'.
    Types of property '$$storeMutators' are incompatible.
      Type '[["zustand/subscribeWithSelector", never]]' is not assignable to type '[]'.
        Source has 1 element(s) but target allows only 0.
src/utils/stores/createSafeStore.ts(156,53): error TS2345: Argument of type '{ (partial: (T & Record<string, unknown>) | Partial<T & Record<string, unknown>> | ((state: T & Record<string, unknown>) => (T & Record<string, unknown>) | Partial<...>), replace?: false): void; (state: (T & Record<...>) | ((state: T & Record<...>) => T & Record<...>), replace: true): void; }' is not assignable to parameter of type '(fn: (state: Record<string, unknown>) => void | Record<string, unknown>) => void'.
  Types of parameters 'partial' and 'fn' are incompatible.
    Type '(state: Record<string, unknown>) => void | Record<string, unknown>' is not assignable to type '(T & Record<string, unknown>) | Partial<T & Record<string, unknown>> | ((state: T & Record<string, unknown>) => (T & Record<string, unknown>) | Partial<...>)'.
      Type '(state: Record<string, unknown>) => void | Record<string, unknown>' is not assignable to type '(state: T & Record<string, unknown>) => (T & Record<string, unknown>) | Partial<T & Record<string, unknown>>'.
        Type 'void | Record<string, unknown>' is not assignable to type '(T & Record<string, unknown>) | Partial<T & Record<string, unknown>>'.
          Type 'void' is not assignable to type '(T & Record<string, unknown>) | Partial<T & Record<string, unknown>>'.
src/utils/stores/createSafeStore.ts(172,3): error TS2322: Type 'UseBoundStore<StoreApi<Record<string, unknown>>>' is not assignable to type 'StoreApi<T & Record<string, unknown>>'.
  The types returned by 'getState()' are incompatible between these types.
    Type 'Record<string, unknown>' is not assignable to type 'T & Record<string, unknown>'.
      Type 'Record<string, unknown>' is not assignable to type 'T'.
        'Record<string, unknown>' is assignable to the constraint of type 'T', but 'T' could be instantiated with a different subtype of constraint 'object'.
src/utils/stores/storeRegistry.ts(36,28): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Window & typeof globalThis'.
src/utils/stores/storeRegistry.ts(76,17): error TS2339: Property 'getState' does not exist on type 'unknown'.
src/utils/stores/storeRegistry.ts(76,42): error TS2339: Property 'getState' does not exist on type 'unknown'.
src/utils/stores/storeRegistry.ts(77,15): error TS2339: Property 'getState' does not exist on type 'unknown'.
src/utils/stores/storeRegistry.ts(91,29): error TS2339: Property 'getState' does not exist on type 'unknown'.
src/utils/stores/storeRegistry.ts(117,12): error TS2339: Property '__VIOLET_VAULT_DEBUG__' does not exist on type 'Window & typeof globalThis'.
src/utils/sync/__tests__/dataIntegrity.test.ts(1,32): error TS6133: 'beforeEach' is declared but its value is never read.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(17,29): error TS2345: Argument of type '{ isLoading: true; }' is not assignable to parameter of type 'SyncStatus'.
  Property 'status' is missing in type '{ isLoading: true; }' but required in type 'SyncStatus'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(32,39): error TS2345: Argument of type '{ isLoading: true; }' is not assignable to parameter of type 'SyncStatus'.
  Property 'status' is missing in type '{ isLoading: true; }' but required in type 'SyncStatus'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(47,28): error TS2345: Argument of type '{ isLoading: true; }' is not assignable to parameter of type 'SyncStatus'.
  Property 'status' is missing in type '{ isLoading: true; }' but required in type 'SyncStatus'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(63,35): error TS2345: Argument of type '{ isLoading: true; }' is not assignable to parameter of type 'SyncStatus'.
  Property 'status' is missing in type '{ isLoading: true; }' but required in type 'SyncStatus'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(227,21): error TS2554: Expected 2 arguments, but got 1.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(234,21): error TS2554: Expected 2 arguments, but got 1.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(241,21): error TS2554: Expected 2 arguments, but got 1.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(248,21): error TS2554: Expected 2 arguments, but got 1.
src/utils/sync/__tests__/SyncMutex.test.ts(26,27): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/autoBackupService.ts(11,10): error TS2339: Property 'maxBackups' does not exist on type 'AutoBackupService'.
src/utils/sync/autoBackupService.ts(12,10): error TS2339: Property 'backupPrefix' does not exist on type 'AutoBackupService'.
src/utils/sync/autoBackupService.ts(13,10): error TS2551: Property 'isEnabled' does not exist on type 'AutoBackupService'. Did you mean 'setEnabled'?
src/utils/sync/autoBackupService.ts(20,15): error TS2551: Property 'isEnabled' does not exist on type 'AutoBackupService'. Did you mean 'setEnabled'?
src/utils/sync/autoBackupService.ts(25,30): error TS2339: Property 'backupPrefix' does not exist on type 'AutoBackupService'.
src/utils/sync/autoBackupService.ts(139,27): error TS2339: Property 'data' does not exist on type 'AutoBackup'.
src/utils/sync/autoBackupService.ts(204,33): error TS2339: Property 'maxBackups' does not exist on type 'AutoBackupService'.
src/utils/sync/autoBackupService.ts(205,45): error TS2339: Property 'maxBackups' does not exist on type 'AutoBackupService'.
src/utils/sync/autoBackupService.ts(212,27): error TS2339: Property 'maxBackups' does not exist on type 'AutoBackupService'.
src/utils/sync/autoBackupService.ts(226,52): error TS2365: Operator '+' cannot be applied to types 'number' and 'unknown'.
src/utils/sync/autoBackupService.ts(274,10): error TS2551: Property 'isEnabled' does not exist on type 'AutoBackupService'. Did you mean 'setEnabled'?
src/utils/sync/corruptionRecoveryHelper.ts(33,43): error TS2339: Property 'samplesFound' does not exist on type '{ databaseOpen: boolean; samplesFound: { envelopes: boolean; transactions: boolean; bills: boolean; }; envelopes: number; transactions: number; bills: number; savingsGoals: number; paychecks: number; cache: number; lastOptimized: number; } | { ...; }'.
  Property 'samplesFound' does not exist on type '{ error: any; }'.
src/utils/sync/corruptionRecoveryHelper.ts(79,10): error TS2551: Property 'safeCloudDataReset' does not exist on type 'Window & typeof globalThis'. Did you mean 'forceCloudDataReset'?
src/utils/sync/corruptionRecoveryHelper.ts(82,10): error TS2339: Property 'detectLocalDataDebug' does not exist on type 'Window & typeof globalThis'.
src/utils/sync/corruptionRecoveryHelper.ts(83,10): error TS2339: Property 'hasLocalDataDebug' does not exist on type 'Window & typeof globalThis'.
src/utils/sync/dataDetectionHelper.ts(27,39): error TS2345: Argument of type 'DatabaseStats' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'DatabaseStats'.
src/utils/sync/dataDetectionHelper.ts(31,66): error TS2339: Property 'goals' does not exist on type 'DatabaseStats'.
src/utils/sync/index.ts(4,43): error TS2307: Cannot find module './syncDiagnostic.js' or its corresponding type declarations.
src/utils/sync/resilience/index.ts(24,49): error TS2339: Property 'retryManager' does not exist on type '{}'.
src/utils/sync/resilience/index.ts(29,16): error TS2339: Property 'circuitBreaker' does not exist on type '{}'.
src/utils/sync/resilience/index.ts(35,16): error TS2339: Property 'syncQueue' does not exist on type '{}'.
src/utils/sync/RetryManager.ts(14,10): error TS2339: Property 'name' does not exist on type 'RetryManager'.
src/utils/sync/RetryManager.ts(15,10): error TS2551: Property 'retryMetrics' does not exist on type 'RetryManager'. Did you mean 'getMetrics'?
src/utils/sync/RetryManager.ts(23,10): error TS2551: Property 'retryMetrics' does not exist on type 'RetryManager'. Did you mean 'getMetrics'?
src/utils/sync/RetryManager.ts(66,31): error TS2551: Property 'retryMetrics' does not exist on type 'RetryManager'. Did you mean 'getMetrics'?
src/utils/sync/RetryManager.ts(73,10): error TS2551: Property 'retryMetrics' does not exist on type 'RetryManager'. Did you mean 'getMetrics'?
src/utils/sync/RetryManager.ts(97,18): error TS2339: Property 'name' does not exist on type 'RetryManager'.
src/utils/sync/RetryManager.ts(107,29): error TS2551: Property 'retryMetrics' does not exist on type 'RetryManager'. Did you mean 'getMetrics'?
src/utils/sync/RetryManager.ts(108,28): error TS2339: Property 'name' does not exist on type 'RetryManager'.
src/utils/sync/RetryManager.ts(116,28): error TS2339: Property 'name' does not exist on type 'RetryManager'.
src/utils/sync/RetryManager.ts(125,19): error TS2339: Property 'name' does not exist on type 'RetryManager'.
src/utils/sync/RetryManager.ts(131,28): error TS2339: Property 'name' does not exist on type 'RetryManager'.
src/utils/sync/RetryManager.ts(133,11): error TS2349: This expression is not callable.
  Type 'Number' has no call signatures.
src/utils/sync/retryUtils.ts(12,11): error TS2339: Property 'baseDelay' does not exist on type '{}'.
src/utils/sync/retryUtils.ts(12,29): error TS2339: Property 'maxDelay' does not exist on type '{}'.
src/utils/sync/retryUtils.ts(12,47): error TS2339: Property 'jitter' does not exist on type '{}'.
src/utils/sync/syncEdgeCaseTester.ts(12,10): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(13,10): error TS2339: Property 'cloudSyncService' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(39,14): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(49,17): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(75,10): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(96,34): error TS2345: Argument of type '{ id: string; name: string; lastModified: string; createdAt: any; }' is not assignable to parameter of type 'Envelope'.
  Type '{ id: string; name: string; lastModified: string; createdAt: any; }' is missing the following properties from type 'Envelope': category, archived
src/utils/sync/syncEdgeCaseTester.ts(102,12): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(128,38): error TS2345: Argument of type '{ id: string; lastModified: string; name: string; } | { id: string; lastModified: number; name: string; } | { id: string; name: string; lastModified?: undefined; }' is not assignable to parameter of type 'Envelope'.
  Type '{ id: string; lastModified: string; name: string; }' is missing the following properties from type 'Envelope': category, archived
src/utils/sync/syncEdgeCaseTester.ts(134,12): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(170,12): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(194,36): error TS2345: Argument of type '{ id: string; name: string; lastModified: number; }' is not assignable to parameter of type 'Envelope'.
  Type '{ id: string; name: string; lastModified: number; }' is missing the following properties from type 'Envelope': category, archived
src/utils/sync/syncEdgeCaseTester.ts(198,38): error TS2345: Argument of type '{ name: string; id: string; lastModified: number; }' is not assignable to parameter of type 'Envelope'.
  Type '{ name: string; id: string; lastModified: number; }' is missing the following properties from type 'Envelope': category, archived
src/utils/sync/syncEdgeCaseTester.ts(203,14): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(209,14): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(235,10): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(258,34): error TS2345: Argument of type '{ id: string; lastModified: number; name: string; } | { id: string; lastModified: string; name: string; }' is not assignable to parameter of type 'Bill'.
  Type '{ id: string; lastModified: number; name: string; }' is missing the following properties from type 'Bill': dueDate, amount, category, isPaid, isRecurring
src/utils/sync/syncEdgeCaseTester.ts(264,12): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(289,32): error TS2345: Argument of type '{ id: string; name: any; amount: any; lastModified: any; createdAt: any; }' is not assignable to parameter of type 'Debt'.
  Type '{ id: string; name: any; amount: any; lastModified: any; createdAt: any; }' is missing the following properties from type 'Debt': creditor, type, status, currentBalance, minimumPayment
src/utils/sync/syncEdgeCaseTester.ts(294,12): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(311,13): error TS2339: Property 'self' does not exist on type '{ id: string; name: string; }'.
src/utils/sync/syncEdgeCaseTester.ts(315,36): error TS2345: Argument of type '{ id: string; name: string; }' is not assignable to parameter of type 'Envelope'.
  Type '{ id: string; name: string; }' is missing the following properties from type 'Envelope': category, archived, lastModified
src/utils/sync/syncEdgeCaseTester.ts(318,31): error TS2339: Property 'cloudSyncService' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(322,29): error TS6133: 'key' is declared but its value is never read.
src/utils/sync/syncEdgeCaseTester.ts(335,12): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(348,12): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(370,39): error TS2345: Argument of type '{ id: string; name: string; description: string; lastModified: number; }' is not assignable to parameter of type 'Transaction'.
  Type '{ id: string; name: string; description: string; lastModified: number; }' is missing the following properties from type 'Transaction': date, amount, envelopeId, category, type
src/utils/sync/syncEdgeCaseTester.ts(374,45): error TS2339: Property 'name' does not exist on type 'Transaction'.
src/utils/sync/syncEdgeCaseTester.ts(376,12): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(390,25): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(391,25): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(394,19): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(397,46): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(400,10): error TS2339: Property 'testResults' does not exist on type 'SyncEdgeCaseTester'.
src/utils/sync/syncEdgeCaseTester.ts(412,10): error TS2551: Property 'syncEdgeCaseTester' does not exist on type 'Window & typeof globalThis'. Did you mean 'runSyncEdgeCaseTests'?
src/utils/sync/syncFlowValidator.ts(345,4): error TS2352: Conversion of type 'Window & typeof globalThis' to type 'Window & { validateAllSyncFlows?: () => Promise<ValidationResult[]>; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Window & typeof globalThis' is not comparable to type '{ validateAllSyncFlows?: () => Promise<ValidationResult[]>; }'.
    The types returned by 'validateAllSyncFlows()' are incompatible between these types.
      Type 'void' is not comparable to type 'Promise<ValidationResult[]>'.
src/utils/sync/syncHealthChecker.ts(317,4): error TS2352: Conversion of type 'Window & typeof globalThis' to type '{ runSyncHealthCheck?: () => Promise<unknown>; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  The types returned by 'runSyncHealthCheck()' are incompatible between these types.
    Type 'void' is not comparable to type 'Promise<unknown>'.
src/utils/sync/syncHealthHelpers.ts(116,20): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/sync/syncHealthHelpers.ts(116,26): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/sync/syncHealthHelpers.ts(162,3): error TS2322: Type '(() => Promise<ValidationResults>) | (() => Promise<{ success: boolean; message?: string; error?: string; }>)' is not assignable to type 'boolean'.
  Type '() => Promise<ValidationResults>' is not assignable to type 'boolean'.
src/utils/sync/SyncMutex.ts(13,10): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(40,26): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(50,21): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(67,10): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(68,10): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(69,10): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(70,12): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(70,45): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(72,10): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(72,50): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(73,10): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(80,23): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/validation/__tests__/checksumUtils.test.ts(133,12): error TS2339: Property 'self' does not exist on type '{ name: string; }'.
src/utils/sync/validation/__tests__/encryptedDataValidator.test.ts(31,21): error TS2339: Property 'dataLength' does not exist on type '{ isValid: boolean; errors: any; warnings: any; }'.
src/utils/sync/validation/__tests__/encryptedDataValidator.test.ts(32,21): error TS2339: Property 'ivLength' does not exist on type '{ isValid: boolean; errors: any; warnings: any; }'.
src/utils/sync/validation/__tests__/encryptedDataValidator.test.ts(155,21): error TS2339: Property 'dataLength' does not exist on type '{ isValid: boolean; errors: any; warnings: any; }'.
src/utils/sync/validation/__tests__/encryptedDataValidator.test.ts(156,21): error TS2339: Property 'ivLength' does not exist on type '{ isValid: boolean; errors: any; warnings: any; }'.
src/utils/sync/validation/__tests__/encryptedDataValidator.test.ts(174,35): error TS2307: Cannot find module '../../common/logger' or its corresponding type declarations.
src/utils/sync/validation/__tests__/encryptedDataValidator.test.ts(194,35): error TS2307: Cannot find module '../../common/logger' or its corresponding type declarations.
src/utils/sync/validation/__tests__/encryptedDataValidator.test.ts(213,35): error TS2307: Cannot find module '../../common/logger' or its corresponding type declarations.
src/utils/sync/validation/__tests__/manifestValidator.test.ts(34,21): error TS2339: Property 'chunkCount' does not exist on type '{ isValid: boolean; errors: any; warnings: any; chunkCount: number; manifestSize: number; } | { isValid: boolean; errors: any[]; warnings: any[]; }'.
  Property 'chunkCount' does not exist on type '{ isValid: boolean; errors: any[]; warnings: any[]; }'.
src/utils/sync/validation/__tests__/manifestValidator.test.ts(35,21): error TS2339: Property 'manifestSize' does not exist on type '{ isValid: boolean; errors: any; warnings: any; chunkCount: number; manifestSize: number; } | { isValid: boolean; errors: any[]; warnings: any[]; }'.
  Property 'manifestSize' does not exist on type '{ isValid: boolean; errors: any[]; warnings: any[]; }'.
src/utils/sync/validation/__tests__/manifestValidator.test.ts(219,21): error TS2339: Property 'chunkCount' does not exist on type '{ isValid: boolean; errors: any; warnings: any; chunkCount: number; manifestSize: number; } | { isValid: boolean; errors: any[]; warnings: any[]; }'.
  Property 'chunkCount' does not exist on type '{ isValid: boolean; errors: any[]; warnings: any[]; }'.
src/utils/sync/validation/__tests__/manifestValidator.test.ts(236,21): error TS2339: Property 'chunkCount' does not exist on type '{ isValid: boolean; errors: any; warnings: any; chunkCount: number; manifestSize: number; } | { isValid: boolean; errors: any[]; warnings: any[]; }'.
  Property 'chunkCount' does not exist on type '{ isValid: boolean; errors: any[]; warnings: any[]; }'.
src/utils/sync/validation/__tests__/manifestValidator.test.ts(265,21): error TS2339: Property 'manifestSize' does not exist on type '{ isValid: boolean; errors: any; warnings: any; chunkCount: number; manifestSize: number; } | { isValid: boolean; errors: any[]; warnings: any[]; }'.
  Property 'manifestSize' does not exist on type '{ isValid: boolean; errors: any[]; warnings: any[]; }'.
src/utils/sync/validation/__tests__/manifestValidator.test.ts(266,28): error TS2339: Property 'manifestSize' does not exist on type '{ isValid: boolean; errors: any; warnings: any; chunkCount: number; manifestSize: number; } | { isValid: boolean; errors: any[]; warnings: any[]; }'.
  Property 'manifestSize' does not exist on type '{ isValid: boolean; errors: any[]; warnings: any[]; }'.
src/utils/sync/validation/__tests__/manifestValidator.test.ts(292,21): error TS2339: Property 'chunkCount' does not exist on type '{ isValid: boolean; errors: any; warnings: any; chunkCount: number; manifestSize: number; } | { isValid: boolean; errors: any[]; warnings: any[]; }'.
  Property 'chunkCount' does not exist on type '{ isValid: boolean; errors: any[]; warnings: any[]; }'.
src/utils/sync/validation/__tests__/manifestValidator.test.ts(328,35): error TS2307: Cannot find module '../../common/logger' or its corresponding type declarations.
src/utils/sync/validation/__tests__/manifestValidator.test.ts(347,35): error TS2307: Cannot find module '../../common/logger' or its corresponding type declarations.
src/utils/sync/validation/__tests__/manifestValidator.test.ts(368,35): error TS2307: Cannot find module '../../common/logger' or its corresponding type declarations.
src/utils/sync/validation/checksumUtils.ts(26,48): error TS6133: 'key' is declared but its value is never read.
src/utils/testing/storeTestUtils.ts(38,35): error TS2339: Property 'reset' does not exist on type 'T'.
src/utils/testing/storeTestUtils.ts(40,35): error TS2339: Property 'reset' does not exist on type 'T'.
src/utils/transactions/__tests__/filtering.test.ts(181,36): error TS2322: Type '{ type: string; amount: number; id: string; description: string; date: string; category: string; account: string; envelopeId: string; }' is not assignable to type 'Transaction'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type 'TransactionType'.
src/utils/transactions/__tests__/filtering.test.ts(240,37): error TS2345: Argument of type '({ id: string; description: string; amount: number; account?: undefined; } | { id: string; amount: number; account: string; description?: undefined; })[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{ id: string; description: string; amount: number; account?: undefined; } | { id: string; amount: number; account: string; description?: undefined; }' is not assignable to type 'Transaction'.
    Type '{ id: string; description: string; amount: number; account?: undefined; }' is missing the following properties from type 'Transaction': date, category
src/utils/transactions/__tests__/filtering.test.ts(462,48): error TS2345: Argument of type '({ id: string; amount: number; date: string; category?: undefined; account?: undefined; } | { id: string; amount: number; date: string; category: any; account: any; })[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{ id: string; amount: number; date: string; category?: undefined; account?: undefined; } | { id: string; amount: number; date: string; category: any; account: any; }' is not assignable to type 'Transaction'.
    Property 'description' is missing in type '{ id: string; amount: number; date: string; category?: undefined; account?: undefined; }' but required in type 'Transaction'.
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
src/utils/transactions/__tests__/operations.test.ts(406,24): error TS2339: Property 'isExpense' does not exist on type 'FormattedTransaction'.
src/utils/transactions/__tests__/operations.test.ts(407,24): error TS2339: Property 'isIncome' does not exist on type 'FormattedTransaction'.
src/utils/transactions/__tests__/operations.test.ts(408,24): error TS2339: Property 'categoryDisplay' does not exist on type 'FormattedTransaction'.
src/utils/transactions/__tests__/operations.test.ts(413,53): error TS2345: Argument of type '{ amount: number; id: string; description: string; date: string; category: string; account: string; type: string; }' is not assignable to parameter of type 'TransactionBase'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"income" | "expense" | "transfer"'.
src/utils/transactions/__tests__/operations.test.ts(416,24): error TS2339: Property 'isIncome' does not exist on type 'FormattedTransaction'.
src/utils/transactions/__tests__/operations.test.ts(417,24): error TS2339: Property 'isExpense' does not exist on type 'FormattedTransaction'.
src/utils/transactions/__tests__/operations.test.ts(421,53): error TS2345: Argument of type '{ id: string; description: string; amount: number; date: string; category: string; account: string; type: string; }' is not assignable to parameter of type 'TransactionBase'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"income" | "expense" | "transfer"'.
src/utils/transactions/__tests__/operations.test.ts(432,53): error TS2345: Argument of type '{ category: any; id: string; description: string; amount: number; date: string; account: string; type: string; }' is not assignable to parameter of type 'TransactionBase'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"income" | "expense" | "transfer"'.
src/utils/transactions/__tests__/operations.test.ts(434,24): error TS2339: Property 'categoryDisplay' does not exist on type 'FormattedTransaction'.
src/utils/transactions/__tests__/operations.test.ts(439,53): error TS2345: Argument of type '{ type: string; id: string; description: string; amount: number; date: string; category: string; account: string; }' is not assignable to parameter of type 'TransactionBase'.
  Types of property 'type' are incompatible.
    Type 'string' is not assignable to type '"income" | "expense" | "transfer"'.
src/utils/transactions/__tests__/operations.test.ts(441,24): error TS2339: Property 'isTransfer' does not exist on type 'FormattedTransaction'.
src/utils/transactions/__tests__/splitting.test.ts(52,48): error TS2345: Argument of type '{ id: string; name: string; category: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{ id: string; name: string; category: string; }' is missing the following properties from type 'Envelope': currentBalance, targetAmount
src/utils/transactions/__tests__/splitting.test.ts(57,48): error TS2345: Argument of type '{ id: string; name: string; category: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{ id: string; name: string; category: string; }' is missing the following properties from type 'Envelope': currentBalance, targetAmount
src/utils/transactions/__tests__/splitting.test.ts(62,48): error TS2345: Argument of type '{ id: string; name: string; category: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{ id: string; name: string; category: string; }' is missing the following properties from type 'Envelope': currentBalance, targetAmount
src/utils/transactions/__tests__/splitting.test.ts(67,48): error TS2345: Argument of type '{ id: string; name: string; category: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{ id: string; name: string; category: string; }' is missing the following properties from type 'Envelope': currentBalance, targetAmount
src/utils/transactions/__tests__/splitting.test.ts(73,38): error TS2345: Argument of type '{ id: string; name: string; category: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{ id: string; name: string; category: string; }' is missing the following properties from type 'Envelope': currentBalance, targetAmount
src/utils/transactions/__tests__/splitting.test.ts(74,38): error TS2345: Argument of type '{ id: string; name: string; category: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{ id: string; name: string; category: string; }' is missing the following properties from type 'Envelope': currentBalance, targetAmount
src/utils/transactions/__tests__/splitting.test.ts(80,71): error TS2345: Argument of type '{ id: string; name: string; category: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{ id: string; name: string; category: string; }' is missing the following properties from type 'Envelope': currentBalance, targetAmount
src/utils/transactions/__tests__/splitting.test.ts(105,75): error TS2345: Argument of type '{ id: string; name: string; category: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{ id: string; name: string; category: string; }' is missing the following properties from type 'Envelope': currentBalance, targetAmount
src/utils/transactions/__tests__/splitting.test.ts(119,60): error TS2345: Argument of type '{ id: string; name: string; category: string; }[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{ id: string; name: string; category: string; }' is missing the following properties from type 'Envelope': currentBalance, targetAmount
src/utils/transactions/__tests__/splitting.test.ts(132,60): error TS2345: Argument of type '{ id: number; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Type '{ id: number; amount: number; }' is missing the following properties from type 'SplitAllocation': description, category, envelopeId
src/utils/transactions/__tests__/splitting.test.ts(150,60): error TS2345: Argument of type '{ id: number; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Type '{ id: number; amount: number; }' is missing the following properties from type 'SplitAllocation': description, category, envelopeId
src/utils/transactions/__tests__/splitting.test.ts(163,60): error TS2345: Argument of type '{ id: number; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Type '{ id: number; amount: number; }' is missing the following properties from type 'SplitAllocation': description, category, envelopeId
src/utils/transactions/__tests__/splitting.test.ts(189,47): error TS2345: Argument of type '{ id: number; description: string; category: string; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Property 'envelopeId' is missing in type '{ id: number; description: string; category: string; amount: number; }' but required in type 'SplitAllocation'.
src/utils/transactions/__tests__/splitting.test.ts(196,47): error TS2345: Argument of type '{ id: number; description: string; category: string; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Property 'envelopeId' is missing in type '{ id: number; description: string; category: string; amount: number; }' but required in type 'SplitAllocation'.
src/utils/transactions/__tests__/splitting.test.ts(203,47): error TS2345: Argument of type '{ id: number; description: string; category: string; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Property 'envelopeId' is missing in type '{ id: number; description: string; category: string; amount: number; }' but required in type 'SplitAllocation'.
src/utils/transactions/__tests__/splitting.test.ts(213,47): error TS2345: Argument of type '{ id: number; description: string; category: string; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Property 'envelopeId' is missing in type '{ id: number; description: string; category: string; amount: number; }' but required in type 'SplitAllocation'.
src/utils/transactions/__tests__/splitting.test.ts(221,47): error TS2345: Argument of type '{ id: number; description: string; category: string; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Property 'envelopeId' is missing in type '{ id: number; description: string; category: string; amount: number; }' but required in type 'SplitAllocation'.
src/utils/transactions/__tests__/splitting.test.ts(234,42): error TS2345: Argument of type '{ id: number; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Type '{ id: number; amount: number; }' is missing the following properties from type 'SplitAllocation': description, category, envelopeId
src/utils/transactions/__tests__/splitting.test.ts(246,40): error TS2345: Argument of type '{ id: number; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Type '{ id: number; amount: number; }' is missing the following properties from type 'SplitAllocation': description, category, envelopeId
src/utils/transactions/__tests__/splitting.test.ts(264,38): error TS2345: Argument of type '{ id: number; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Type '{ id: number; amount: number; }' is missing the following properties from type 'SplitAllocation': description, category, envelopeId
src/utils/transactions/__tests__/splitting.test.ts(276,38): error TS2345: Argument of type '{ id: number; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Type '{ id: number; amount: number; }' is missing the following properties from type 'SplitAllocation': description, category, envelopeId
src/utils/transactions/__tests__/splitting.test.ts(284,38): error TS2345: Argument of type '{ id: number; amount: number; description: string; category: string; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Property 'envelopeId' is missing in type '{ id: number; amount: number; description: string; category: string; }' but required in type 'SplitAllocation'.
src/utils/transactions/__tests__/splitting.test.ts(302,37): error TS2345: Argument of type '{ id: number; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Type '{ id: number; amount: number; }' is missing the following properties from type 'SplitAllocation': description, category, envelopeId
src/utils/transactions/__tests__/splitting.test.ts(333,40): error TS2345: Argument of type '{ id: number; description: string; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Type '{ id: number; description: string; amount: number; }' is missing the following properties from type 'SplitAllocation': category, envelopeId
src/utils/transactions/__tests__/splitting.test.ts(342,40): error TS2345: Argument of type '{ id: number; category: string; envelopeId: string; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Type '{ id: number; category: string; envelopeId: string; }' is missing the following properties from type 'SplitAllocation': description, amount
src/utils/transactions/__tests__/splitting.test.ts(357,35): error TS2345: Argument of type '{ id: number; description: string; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Type '{ id: number; description: string; }' is missing the following properties from type 'SplitAllocation': amount, category, envelopeId
src/utils/transactions/__tests__/splitting.test.ts(366,35): error TS2345: Argument of type '{ id: number; description: string; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Type '{ id: number; description: string; }' is missing the following properties from type 'SplitAllocation': amount, category, envelopeId
src/utils/transactions/__tests__/splitting.test.ts(410,49): error TS2345: Argument of type '{ id: number; description: string; amount: number; category: string; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Property 'envelopeId' is missing in type '{ id: number; description: string; amount: number; category: string; }' but required in type 'SplitAllocation'.
src/utils/transactions/__tests__/splitting.test.ts(414,34): error TS2339: Property 'account' does not exist on type '{ id: string; description: string; amount: number; category: string; date: string; envelopeId: string; }'.
src/utils/transactions/__tests__/splitting.test.ts(415,31): error TS2339: Property 'type' does not exist on type '{ id: string; description: string; amount: number; category: string; date: string; envelopeId: string; }'.
src/utils/transactions/__tests__/splitting.test.ts(428,39): error TS2345: Argument of type '{ id: number; description: string; category: string; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Property 'envelopeId' is missing in type '{ id: number; description: string; category: string; amount: number; }' but required in type 'SplitAllocation'.
src/utils/transactions/__tests__/splitting.test.ts(445,39): error TS2345: Argument of type '{ id: number; description: string; category: string; amount: number; }[]' is not assignable to parameter of type 'SplitAllocation[]'.
  Property 'envelopeId' is missing in type '{ id: number; description: string; category: string; amount: number; }' but required in type 'SplitAllocation'.
src/utils/transactions/index.ts(2,10): error TS2305: Module '"./envelopeMatching.ts"' has no exported member 'default'.
src/utils/transactions/index.ts(3,10): error TS2305: Module '"./fileParser.ts"' has no exported member 'default'.
src/utils/transactions/operations.ts(74,26): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/utils/transactions/operations.ts(179,13): error TS2322: Type '{ id: string; description: string; amount: number; date: string; category: string; account: string; type: string; envelopeId: string; metadata: { isTransfer: boolean; transferId: string; transferType: string; fromAccount: string; toAccount: string; createdAt: string; updatedAt: string; }; }' is not assignable to type 'Transaction'.
  Type '{ id: string; description: string; amount: number; date: string; category: string; account: string; type: string; envelopeId: string; metadata: { isTransfer: boolean; transferId: string; transferType: string; fromAccount: string; toAccount: string; createdAt: string; updatedAt: string; }; }' is missing the following properties from type 'Required<Omit<TransactionBase, "metadata">>': isSplit, parentTransactionId
src/utils/transactions/operations.ts(179,34): error TS2322: Type '{ id: string; description: string; amount: number; date: string; category: string; account: string; type: string; envelopeId: string; metadata: { isTransfer: boolean; transferId: string; transferType: string; fromAccount: string; toAccount: string; createdAt: string; updatedAt: string; }; }' is not assignable to type 'Transaction'.
  Type '{ id: string; description: string; amount: number; date: string; category: string; account: string; type: string; envelopeId: string; metadata: { isTransfer: boolean; transferId: string; transferType: string; fromAccount: string; toAccount: string; createdAt: string; updatedAt: string; }; }' is missing the following properties from type 'Required<Omit<TransactionBase, "metadata">>': isSplit, parentTransactionId
src/utils/transactions/operations.ts(400,15): error TS2339: Property 'formattedAmount' does not exist on type '{ id?: string; description: string; amount: number; date: string | Date; category?: string; account?: string; envelopeId?: string; type?: "income" | "expense" | "transfer"; isSplit?: boolean; parentTransactionId?: string; metadata?: Record<...>; }'.
src/utils/transactions/operations.ts(405,15): error TS2339: Property 'amountDisplay' does not exist on type '{ id?: string; description: string; amount: number; date: string | Date; category?: string; account?: string; envelopeId?: string; type?: "income" | "expense" | "transfer"; isSplit?: boolean; parentTransactionId?: string; metadata?: Record<...>; }'.
src/utils/transactions/operations.ts(406,46): error TS2339: Property 'formattedAmount' does not exist on type '{ id?: string; description: string; amount: number; date: string | Date; category?: string; account?: string; envelopeId?: string; type?: "income" | "expense" | "transfer"; isSplit?: boolean; parentTransactionId?: string; metadata?: Record<...>; }'.
src/utils/transactions/operations.ts(406,76): error TS2339: Property 'formattedAmount' does not exist on type '{ id?: string; description: string; amount: number; date: string | Date; category?: string; account?: string; envelopeId?: string; type?: "income" | "expense" | "transfer"; isSplit?: boolean; parentTransactionId?: string; metadata?: Record<...>; }'.
src/utils/transactions/operations.ts(410,15): error TS2339: Property 'formattedDate' does not exist on type '{ id?: string; description: string; amount: number; date: string | Date; category?: string; account?: string; envelopeId?: string; type?: "income" | "expense" | "transfer"; isSplit?: boolean; parentTransactionId?: string; metadata?: Record<...>; }'.
src/utils/transactions/operations.ts(417,17): error TS2339: Property 'formattedTime' does not exist on type '{ id?: string; description: string; amount: number; date: string | Date; category?: string; account?: string; envelopeId?: string; type?: "income" | "expense" | "transfer"; isSplit?: boolean; parentTransactionId?: string; metadata?: Record<...>; }'.
src/utils/transactions/operations.ts(424,15): error TS2339: Property 'isIncome' does not exist on type '{ id?: string; description: string; amount: number; date: string | Date; category?: string; account?: string; envelopeId?: string; type?: "income" | "expense" | "transfer"; isSplit?: boolean; parentTransactionId?: string; metadata?: Record<...>; }'.
src/utils/transactions/operations.ts(425,15): error TS2339: Property 'isExpense' does not exist on type '{ id?: string; description: string; amount: number; date: string | Date; category?: string; account?: string; envelopeId?: string; type?: "income" | "expense" | "transfer"; isSplit?: boolean; parentTransactionId?: string; metadata?: Record<...>; }'.
src/utils/transactions/operations.ts(426,15): error TS2339: Property 'isTransfer' does not exist on type '{ id?: string; description: string; amount: number; date: string | Date; category?: string; account?: string; envelopeId?: string; type?: "income" | "expense" | "transfer"; isSplit?: boolean; parentTransactionId?: string; metadata?: Record<...>; }'.
src/utils/transactions/operations.ts(427,15): error TS2339: Property 'categoryDisplay' does not exist on type '{ id?: string; description: string; amount: number; date: string | Date; category?: string; account?: string; envelopeId?: string; type?: "income" | "expense" | "transfer"; isSplit?: boolean; parentTransactionId?: string; metadata?: Record<...>; }'.
src/utils/transactions/operations.ts(428,15): error TS2339: Property 'accountDisplay' does not exist on type '{ id?: string; description: string; amount: number; date: string | Date; category?: string; account?: string; envelopeId?: string; type?: "income" | "expense" | "transfer"; isSplit?: boolean; parentTransactionId?: string; metadata?: Record<...>; }'.
src/utils/validation/transactionValidation.ts(13,3): error TS2322: Type 'unknown' is not assignable to type 'boolean'.
```

