# Combined Audit Report

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
- 16 issues in `violet-vault/src/hooks/common/useBugReportV2.ts`
- 5 issues in `violet-vault/src/services/authService.ts`
- 5 issues in `violet-vault/src/hooks/common/useFABActions.ts`
- 4 issues in `violet-vault/src/utils/common/highlight.ts`
- 4 issues in `violet-vault/src/components/automation/AutoFundingRuleBuilder.tsx`
- 3 issues in `violet-vault/src/utils/sync/syncHealthChecker.ts`
- 3 issues in `violet-vault/src/utils/sync/syncFlowValidator.ts`
- 3 issues in `violet-vault/src/utils/budgeting/envelopeFormUtils.ts`
- 3 issues in `violet-vault/src/hooks/transactions/useTransactionQuery.ts`
- 3 issues in `violet-vault/src/hooks/transactions/useTransactionLedger.ts`
- 3 issues in `violet-vault/src/hooks/bills/useBillManager.ts`
- 3 issues in `violet-vault/src/hooks/bills/useBillForm.ts`
- 3 issues in `violet-vault/src/components/sync/SyncIndicator.tsx`
- 3 issues in `violet-vault/src/components/security/LockScreen.tsx`
- 3 issues in `violet-vault/src/components/pwa/PatchNotesModal.tsx`
- 3 issues in `violet-vault/src/components/modals/UnassignedCashModal.tsx`
- 3 issues in `violet-vault/src/components/auth/LocalOnlyModeSettings.tsx`
- 2 issues in `violet-vault/src/utils/pwa/patchNotesManager.ts`
- 2 issues in `violet-vault/src/utils/notifications/permissionUtils.ts`
- 2 issues in `violet-vault/src/utils/common/billDiscovery.ts`
- 2 issues in `violet-vault/src/utils/budgeting/envelopeIntegrityChecker.ts`
- 2 issues in `violet-vault/src/utils/budgeting/autofunding/rules.ts`
- 2 issues in `violet-vault/src/services/firebaseMessaging.ts`
- 2 issues in `violet-vault/src/services/bugReport/browserInfoService.ts`
- 2 issues in `violet-vault/src/hooks/transactions/useTransactionsV2.ts`
- 2 issues in `violet-vault/src/hooks/mobile/useFABBehavior.ts`
- 2 issues in `violet-vault/src/hooks/common/usePrompt.ts`
- 2 issues in `violet-vault/src/hooks/common/useConfirm.ts`
- 2 issues in `violet-vault/src/hooks/budgeting/useBudgetData/mutations.ts`
- 2 issues in `violet-vault/src/hooks/budgeting/autofunding/useAutoFunding.ts`
- 2 issues in `violet-vault/src/hooks/auth/useUserSetup.ts`
- 2 issues in `violet-vault/src/hooks/analytics/useReportExporter.ts`
- 2 issues in `violet-vault/src/hooks/analytics/useAnalyticsIntegration.ts`
- 2 issues in `violet-vault/src/hooks/analytics/useAnalytics.ts`
- 2 issues in `violet-vault/src/components/ui/forms/Select.tsx`
- 2 issues in `violet-vault/src/components/ui/EditableBalance.tsx`
- 2 issues in `violet-vault/src/components/sync/SyncHealthIndicator.tsx`
- 2 issues in `violet-vault/src/components/sync/SyncHealthDashboard.tsx`
- 2 issues in `violet-vault/src/components/sync/ActivityBanner.tsx`
- 2 issues in `violet-vault/src/components/sharing/JoinBudgetModal.tsx`
- 2 issues in `violet-vault/src/components/settings/sections/GeneralSettingsSection.tsx`
- 2 issues in `violet-vault/src/components/settings/archiving/ArchivingConfiguration.tsx`
- 2 issues in `violet-vault/src/components/settings/TransactionArchiving.tsx`
- 2 issues in `violet-vault/src/components/settings/EnvelopeIntegrityChecker.tsx`
- 2 issues in `violet-vault/src/components/pwa/ShareTargetHandler.tsx`
- 2 issues in `violet-vault/src/components/pwa/OfflineStatusIndicator.tsx`
- 2 issues in `violet-vault/src/components/pages/MainDashboard.tsx`
- 2 issues in `violet-vault/src/components/onboarding/OnboardingTutorial.tsx`
- 2 issues in `violet-vault/src/components/onboarding/OnboardingProgress.tsx`
- 2 issues in `violet-vault/src/components/onboarding/EmptyStateHints.tsx`
- 2 issues in `violet-vault/src/components/mobile/SlideUpModal.tsx`
- 2 issues in `violet-vault/src/components/layout/MainLayout.tsx`
- 2 issues in `violet-vault/src/components/history/IntegrityStatusIndicator.tsx`
- 2 issues in `violet-vault/src/components/history/BudgetHistoryViewer.tsx`
- 2 issues in `violet-vault/src/components/feedback/BugReportButton.tsx`
- 2 issues in `violet-vault/src/components/budgeting/shared/AllocationModeSelector.tsx`
- 2 issues in `violet-vault/src/components/budgeting/envelope/EnvelopeItem.tsx`
- 2 issues in `violet-vault/src/components/budgeting/SmartEnvelopeSuggestions.tsx`
- 2 issues in `violet-vault/src/components/budgeting/EnvelopeSystem.tsx`
- 2 issues in `violet-vault/src/components/budgeting/EditEnvelopeModal.tsx`
- 2 issues in `violet-vault/src/components/budgeting/DeleteEnvelopeModal.tsx`
- 2 issues in `violet-vault/src/components/bills/BillTable.tsx`
- 2 issues in `violet-vault/src/components/bills/BillDiscoveryModal.tsx`
- 2 issues in `violet-vault/src/components/bills/AddBillModal.tsx`
- 2 issues in `violet-vault/src/components/automation/AutoFundingView.tsx`
- 2 issues in `violet-vault/src/components/automation/AutoFundingDashboard.tsx`
- 2 issues in `violet-vault/src/components/auth/KeyManagementSettings.tsx`
- 2 issues in `violet-vault/src/components/analytics/ReportExporter.tsx`
- 1 issues in `violet-vault/src/vite-env.d.ts`
- 1 issues in `violet-vault/src/utils/pwa/serviceWorkerDiagnostics.ts`
- 1 issues in `violet-vault/src/utils/debts/debtStrategies.ts`
- 1 issues in `violet-vault/src/utils/debts/debtFormValidation.ts`
- 1 issues in `violet-vault/src/utils/common/transactionArchiving.ts`
- 1 issues in `violet-vault/src/utils/common/toastHelpers.ts`
- 1 issues in `violet-vault/src/utils/bills/billCalculations.ts`
- 1 issues in `violet-vault/src/types/common.ts`
- 1 issues in `violet-vault/src/test/setup.ts`
- 1 issues in `violet-vault/src/services/types/firebaseServiceTypes.ts`
- 1 issues in `violet-vault/src/services/bugReport/performanceInfoService.ts`
- 1 issues in `violet-vault/src/services/bugReport/githubApiService.ts`
- 1 issues in `violet-vault/src/services/bugReport/apiService.ts`
- 1 issues in `violet-vault/src/main.tsx`
- 1 issues in `violet-vault/src/hooks/transactions/useTransactionSplitter.ts`
- 1 issues in `violet-vault/src/hooks/transactions/useTransactionOperations.ts`
- 1 issues in `violet-vault/src/hooks/transactions/useTransactionFilters.ts`
- 1 issues in `violet-vault/src/hooks/transactions/useTransactionData.ts`
- 1 issues in `violet-vault/src/hooks/sync/useFirebaseSync.ts`
- 1 issues in `violet-vault/src/hooks/sharing/useShareCodeValidation.ts`
- 1 issues in `violet-vault/src/hooks/settings/useSettingsDashboard.ts`
- 1 issues in `violet-vault/src/hooks/notifications/useFirebaseMessaging.ts`
- 1 issues in `violet-vault/src/hooks/debts/useDebtManagement.ts`
- 1 issues in `violet-vault/src/hooks/common/useOnboardingAutoComplete.ts`
- 1 issues in `violet-vault/src/hooks/common/useNetworkStatus.ts`
- 1 issues in `violet-vault/src/hooks/common/useExportData.ts`
- 1 issues in `violet-vault/src/hooks/common/useDataInitialization.ts`
- 1 issues in `violet-vault/src/hooks/common/useActualBalance.ts`
- 1 issues in `violet-vault/src/hooks/budgeting/usePaycheckProcessor.ts`
- 1 issues in `violet-vault/src/hooks/budgeting/usePaycheckForm.ts`
- 1 issues in `violet-vault/src/hooks/budgeting/useEnvelopes.ts`
- 1 issues in `violet-vault/src/hooks/budgeting/metadata/useActualBalance.ts`
- 1 issues in `violet-vault/src/hooks/budgeting/autofunding/useUndoOperations.ts`
- 1 issues in `violet-vault/src/hooks/budgeting/autofunding/useAutoFundingRules.ts`
- 1 issues in `violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution.ts`
- 1 issues in `violet-vault/src/hooks/budgeting/autofunding/useAutoFundingData.ts`
- 1 issues in `violet-vault/src/hooks/auth/useSecurityManager.ts`
- 1 issues in `violet-vault/src/hooks/auth/useKeyManagement.ts`
- 1 issues in `violet-vault/src/hooks/analytics/usePerformanceMonitor.ts`
- 1 issues in `violet-vault/src/hooks/analytics/useAnalyticsData.ts`
- 1 issues in `violet-vault/src/hooks/accounts/useSupplementalAccounts.ts`
- 1 issues in `violet-vault/src/components/ui/StandardTabs.tsx`
- 1 issues in `violet-vault/src/components/transactions/import/FileUploader.tsx`
- 1 issues in `violet-vault/src/components/transactions/TransactionFormFields.tsx`
- 1 issues in `violet-vault/src/components/sync/health/SyncStatusIndicator.tsx`
- 1 issues in `violet-vault/src/components/sync/health/SyncHealthDetails.tsx`
- 1 issues in `violet-vault/src/components/sync/ManualSyncControls.tsx`
- 1 issues in `violet-vault/src/components/sharing/steps/UserSetupStep.tsx`
- 1 issues in `violet-vault/src/components/sharing/ShareCodeModal.tsx`
- 1 issues in `violet-vault/src/components/settings/sections/SyncDebugToolsSection.tsx`
- 1 issues in `violet-vault/src/components/settings/sections/NotificationSettingsSection.tsx`
- 1 issues in `violet-vault/src/components/settings/sections/DataManagementSection.tsx`
- 1 issues in `violet-vault/src/components/pwa/UpdateAvailableModal.tsx`
- 1 issues in `violet-vault/src/components/pwa/InstallPromptModal.tsx`
- 1 issues in `violet-vault/src/components/onboarding/hooks/useTutorialSteps.ts`
- 1 issues in `violet-vault/src/components/onboarding/hooks/useTutorialControls.ts`
- 1 issues in `violet-vault/src/components/modals/CorruptionRecoveryModal.tsx`
- 1 issues in `violet-vault/src/components/layout/ViewRenderer.tsx`
- 1 issues in `violet-vault/src/components/layout/SummaryCards.tsx`
- 1 issues in `violet-vault/src/components/history/ObjectHistoryViewer.tsx`
- 1 issues in `violet-vault/src/components/debt/ui/DebtFilters.tsx`
- 1 issues in `violet-vault/src/components/debt/modals/DebtFormFields.tsx`
- 1 issues in `violet-vault/src/components/debt/modals/DebtDetailModal.tsx`
- 1 issues in `violet-vault/src/components/debt/DebtDashboard.tsx`
- 1 issues in `violet-vault/src/components/charts/TrendLineChart.tsx`
- 1 issues in `violet-vault/src/components/charts/DistributionPieChart.tsx`
- 1 issues in `violet-vault/src/components/charts/ComposedFinancialChart.tsx`
- 1 issues in `violet-vault/src/components/charts/CategoryBarChart.tsx`
- 1 issues in `violet-vault/src/components/budgeting/shared/BillConnectionSelector.tsx`
- 1 issues in `violet-vault/src/components/budgeting/paycheck/PaycheckForm.tsx`
- 1 issues in `violet-vault/src/components/budgeting/paycheck/PaycheckAllocationModes.tsx`
- 1 issues in `violet-vault/src/components/budgeting/envelope/UnassignedCashEnvelope.tsx`
- 1 issues in `violet-vault/src/components/budgeting/envelope/EnvelopeHeader.tsx`
- 1 issues in `violet-vault/src/components/budgeting/PaydayPrediction.tsx`
- 1 issues in `violet-vault/src/components/budgeting/EnvelopeGrid.tsx`
- 1 issues in `violet-vault/src/components/budgeting/CreateEnvelopeModal.tsx`
- 1 issues in `violet-vault/src/components/bills/modals/BillDetailModal.tsx`
- 1 issues in `violet-vault/src/components/bills/SmartBillMatcher.tsx`
- 1 issues in `violet-vault/src/components/bills/BulkUpdateEditor.tsx`
- 1 issues in `violet-vault/src/components/bills/BulkBillUpdateModal.tsx`
- 1 issues in `violet-vault/src/components/bills/BillManager.tsx`
- 1 issues in `violet-vault/src/components/automation/tabs/RulesTab.tsx`
- 1 issues in `violet-vault/src/components/automation/steps/config/SplitRemainderConfig.tsx`
- 1 issues in `violet-vault/src/components/auth/LocalOnlySetup.tsx`
- 1 issues in `violet-vault/src/components/analytics/AnalyticsDashboard.tsx`
- 1 issues in `violet-vault/src/components/activity/ActivityFeed.tsx`
- 1 issues in `violet-vault/src/components/accounts/form/AccountColorAndSettings.tsx`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 71 | `max-lines-per-function` |
| 42 | `zustand-safe-patterns/zustand-selective-subscriptions` |
| 36 | `complexity` |
| 29 | `enforce-ui-library/enforce-ui-library` |
| 21 | `max-statements` |
| 17 | `react-hooks/exhaustive-deps` |
| 16 | `no-undef` |
| 5 | `no-restricted-imports` |
| 5 | `no-architecture-violations/no-architecture-violations` |
| 4 | `null` |
| 3 | `no-restricted-syntax` |
| 3 | `@typescript-eslint/no-unused-vars` |
| 1 | `zustand-safe-patterns/zustand-no-auto-executing-store-calls` |
| 1 | `no-redeclare` |
| 1 | `no-import-assign` |
| 1 | `max-depth` |
| 1 | `@typescript-eslint/no-unused-expressions` |
| 1 | `@typescript-eslint/no-unsafe-function-type` |
| 1 | `@typescript-eslint/no-explicit-any` |

### Detailed Lint Report
```
violet-vault/src/components/accounts/form/AccountColorAndSettings.tsx:27:7 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/activity/ActivityFeed.tsx:7:1 - 2 - '../../services/activityLogger' import is restricted from being used by a pattern. Components should not directly import services. Use hooks in src/hooks/ to encapsulate service calls. Utils and hooks are allowed. (no-restricted-imports)
violet-vault/src/components/analytics/AnalyticsDashboard.tsx:24:28 - 1 - Arrow function has too many lines (239). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/analytics/ReportExporter.tsx:10:24 - 1 - Arrow function has too many lines (279). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/analytics/ReportExporter.tsx:214:21 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/auth/KeyManagementSettings.tsx:21:69 - 1 - Arrow function has too many lines (232). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/auth/KeyManagementSettings.tsx:43:7 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/auth/LocalOnlyModeSettings.tsx:21:69 - 1 - Arrow function has too many lines (369). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/auth/LocalOnlyModeSettings.tsx:55:6 - 1 - React Hook useEffect has a missing dependency: 'getStats'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/components/auth/LocalOnlyModeSettings.tsx:65:6 - 1 - React Hook useEffect has a missing dependency: 'clearError'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/components/auth/LocalOnlySetup.tsx:91:24 - 1 - Arrow function has too many lines (258). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/automation/AutoFundingDashboard.tsx:14:30 - 1 - Arrow function has too many lines (185). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/automation/AutoFundingDashboard.tsx:15:18 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/automation/AutoFundingRuleBuilder.tsx:14:7 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/automation/AutoFundingRuleBuilder.tsx:23:11 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/automation/AutoFundingRuleBuilder.tsx:30:11 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/automation/AutoFundingRuleBuilder.tsx:99:13 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/automation/AutoFundingView.tsx:13:25 - 1 - Arrow function has too many lines (184). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/automation/AutoFundingView.tsx:15:18 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/automation/steps/config/SplitRemainderConfig.tsx:30:21 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/automation/tabs/RulesTab.tsx:6:18 - 1 - Arrow function has too many lines (206). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/bills/AddBillModal.tsx:102:6 - 1 - React Hook useEffect has a missing dependency: 'resetForm'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/components/bills/AddBillModal.tsx:108:9 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/bills/BillDiscoveryModal.tsx:7:28 - 1 - Arrow function has too many lines (313). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/bills/BillDiscoveryModal.tsx:190:27 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/bills/BillManager.tsx:24:21 - 1 - Arrow function has too many lines (191). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/bills/BillTable.tsx:9:19 - 1 - Arrow function has too many lines (165). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/bills/BillTable.tsx:96:21 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/bills/BulkBillUpdateModal.tsx:12:29 - 1 - Arrow function has too many lines (167). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/bills/BulkUpdateEditor.tsx:73:30 - 1 - Arrow function has a complexity of 21. Maximum allowed is 15. (complexity)
violet-vault/src/components/bills/SmartBillMatcher.tsx:6:26 - 1 - Arrow function has too many lines (180). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/bills/modals/BillDetailModal.tsx:14:25 - 1 - Arrow function has too many lines (251). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/budgeting/CreateEnvelopeModal.tsx:13:29 - 1 - Arrow function has too many lines (184). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/budgeting/DeleteEnvelopeModal.tsx:66:21 - 1 - Use <Radio> or <RadioGroup> from @/components/ui instead of <input type="radio">. Import: import { Radio, RadioGroup } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/budgeting/DeleteEnvelopeModal.tsx:79:21 - 1 - Use <Radio> or <RadioGroup> from @/components/ui instead of <input type="radio">. Import: import { Radio, RadioGroup } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/budgeting/EditEnvelopeModal.tsx:17:27 - 1 - Arrow function has too many lines (222). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/budgeting/EditEnvelopeModal.tsx:147:13 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/budgeting/EnvelopeGrid.tsx:301:18 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/budgeting/EnvelopeSystem.tsx:24:5 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/budgeting/EnvelopeSystem.tsx:126:6 - 1 - React Hook useEffect has a missing dependency: 'updateBiweeklyAllocations'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/components/budgeting/PaydayPrediction.tsx:6:26 - 1 - Arrow function has too many lines (171). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/budgeting/SmartEnvelopeSuggestions.tsx:37:5 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/budgeting/SmartEnvelopeSuggestions.tsx:53:5 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/budgeting/envelope/EnvelopeHeader.tsx:84:13 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/budgeting/envelope/EnvelopeItem.tsx:12:22 - 1 - Arrow function has too many lines (307). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/budgeting/envelope/EnvelopeItem.tsx:12:22 - 1 - Arrow function has a complexity of 21. Maximum allowed is 15. (complexity)
violet-vault/src/components/budgeting/envelope/UnassignedCashEnvelope.tsx:7:39 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/budgeting/paycheck/PaycheckAllocationModes.tsx:59:7 - 1 - Use <Radio> or <RadioGroup> from @/components/ui instead of <input type="radio">. Import: import { Radio, RadioGroup } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/budgeting/paycheck/PaycheckForm.tsx:45:7 - 1 - Use <Radio> or <RadioGroup> from @/components/ui instead of <input type="radio">. Import: import { Radio, RadioGroup } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/budgeting/shared/AllocationModeSelector.tsx:17:13 - 1 - Use <Radio> or <RadioGroup> from @/components/ui instead of <input type="radio">. Import: import { Radio, RadioGroup } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/budgeting/shared/AllocationModeSelector.tsx:44:13 - 1 - Use <Radio> or <RadioGroup> from @/components/ui instead of <input type="radio">. Import: import { Radio, RadioGroup } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/budgeting/shared/BillConnectionSelector.tsx:106:17 - 1 - Use <Radio> or <RadioGroup> from @/components/ui instead of <input type="radio">. Import: import { Radio, RadioGroup } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/charts/CategoryBarChart.tsx:39:26 - 1 - Arrow function has a complexity of 22. Maximum allowed is 15. (complexity)
violet-vault/src/components/charts/ComposedFinancialChart.tsx:57:32 - 1 - Arrow function has a complexity of 18. Maximum allowed is 15. (complexity)
violet-vault/src/components/charts/DistributionPieChart.tsx:44:30 - 1 - Arrow function has a complexity of 21. Maximum allowed is 15. (complexity)
violet-vault/src/components/charts/TrendLineChart.tsx:21:24 - 1 - Arrow function has a complexity of 17. Maximum allowed is 15. (complexity)
violet-vault/src/components/debt/DebtDashboard.tsx:18:23 - 1 - Arrow function has too many lines (174). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/debt/modals/DebtDetailModal.tsx:13:25 - 1 - Arrow function has too many lines (175). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/debt/modals/DebtFormFields.tsx:240:13 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/debt/ui/DebtFilters.tsx:113:17 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/feedback/BugReportButton.tsx:43:35 - 1 - Arrow function has too many lines (332). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/feedback/BugReportButton.tsx:288:19 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/history/BudgetHistoryViewer.tsx:41:7 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/history/BudgetHistoryViewer.tsx:44:45 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/history/IntegrityStatusIndicator.tsx:6:34 - 1 - Arrow function has too many lines (251). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/history/IntegrityStatusIndicator.tsx:6:34 - 1 - Arrow function has a complexity of 20. Maximum allowed is 15. (complexity)
violet-vault/src/components/history/ObjectHistoryViewer.tsx:14:29 - 1 - Arrow function has too many lines (199). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/layout/MainLayout.tsx:189:21 - 1 - Arrow function has too many lines (181). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/layout/MainLayout.tsx:189:21 - 1 - Arrow function has too many statements (27). Maximum allowed is 25. (max-statements)
violet-vault/src/components/layout/SummaryCards.tsx:22:39 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/layout/ViewRenderer.tsx:30:22 - 1 - Arrow function has too many lines (230). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/mobile/SlideUpModal.tsx:27:22 - 1 - Arrow function has too many lines (158). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/mobile/SlideUpModal.tsx:27:22 - 1 - Arrow function has a complexity of 16. Maximum allowed is 15. (complexity)
violet-vault/src/components/modals/CorruptionRecoveryModal.tsx:61:7 - 2 - Components should not use localStorage directly. Use Dexie service through hooks instead. (no-restricted-syntax)
violet-vault/src/components/modals/UnassignedCashModal.tsx:74:29 - 1 - Arrow function has too many lines (242). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/modals/UnassignedCashModal.tsx:74:29 - 1 - Arrow function has a complexity of 20. Maximum allowed is 15. (complexity)
violet-vault/src/components/modals/UnassignedCashModal.tsx:75:67 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/onboarding/EmptyStateHints.tsx:9:25 - 1 - Arrow function has too many lines (196). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/onboarding/EmptyStateHints.tsx:10:61 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/onboarding/OnboardingProgress.tsx:9:28 - 1 - Arrow function has too many lines (232). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/onboarding/OnboardingProgress.tsx:11:5 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/onboarding/OnboardingTutorial.tsx:14:53 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/onboarding/OnboardingTutorial.tsx:52:6 - 1 - React Hook useEffect has a missing dependency: 'getProgress'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/components/onboarding/hooks/useTutorialControls.ts:15:64 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/onboarding/hooks/useTutorialSteps.ts:12:33 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/pages/MainDashboard.tsx:26:19 - 1 - Arrow function has too many lines (153). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/pages/MainDashboard.tsx:53:7 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/pwa/InstallPromptModal.tsx:11:67 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/pwa/OfflineStatusIndicator.tsx:13:32 - 1 - Arrow function has too many lines (222). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/pwa/OfflineStatusIndicator.tsx:14:24 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/pwa/PatchNotesModal.tsx:11:25 - 1 - Arrow function has too many lines (184). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/pwa/PatchNotesModal.tsx:11:25 - 1 - Arrow function has a complexity of 25. Maximum allowed is 15. (complexity)
violet-vault/src/components/pwa/PatchNotesModal.tsx:12:86 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/pwa/ShareTargetHandler.tsx:11:28 - 1 - Arrow function has too many lines (194). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/pwa/ShareTargetHandler.tsx:23:6 - 1 - React Hook useEffect has a missing dependency: 'handleSharedContent'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/components/pwa/UpdateAvailableModal.tsx:11:74 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/security/LockScreen.tsx:11:20 - 1 - Arrow function has too many lines (260). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/security/LockScreen.tsx:95:7 - 2 - Components should not use localStorage directly. Use Dexie service through hooks instead. (no-restricted-syntax)
violet-vault/src/components/security/LockScreen.tsx:96:7 - 2 - Components should not use localStorage directly. Use Dexie service through hooks instead. (no-restricted-syntax)
violet-vault/src/components/settings/EnvelopeIntegrityChecker.tsx:17:34 - 1 - Arrow function has too many lines (345). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/settings/EnvelopeIntegrityChecker.tsx:329:31 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/settings/TransactionArchiving.tsx:45:7 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/settings/TransactionArchiving.tsx:48:47 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/settings/archiving/ArchivingConfiguration.tsx:73:17 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/settings/archiving/ArchivingConfiguration.tsx:85:17 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/settings/sections/DataManagementSection.tsx:26:69 - 1 - Arrow function has too many lines (178). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/settings/sections/GeneralSettingsSection.tsx:8:32 - 1 - Arrow function has too many lines (235). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/settings/sections/GeneralSettingsSection.tsx:16:29 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/components/settings/sections/NotificationSettingsSection.tsx:11:37 - 1 - Arrow function has too many lines (221). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/settings/sections/SyncDebugToolsSection.tsx:7:31 - 1 - Arrow function has too many lines (179). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/sharing/JoinBudgetModal.tsx:43:6 - 1 - React Hook useEffect has a missing dependency: 'validateShareCode'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/components/sharing/JoinBudgetModal.tsx:54:6 - 1 - React Hook useEffect has a missing dependency: 'resetValidation'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/components/sharing/ShareCodeModal.tsx:15:24 - 1 - Arrow function has too many lines (272). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/sharing/steps/UserSetupStep.tsx:9:23 - 1 - Arrow function has too many lines (151). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/sync/ActivityBanner.tsx:34:24 - 1 - Arrow function has too many lines (227). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/sync/ActivityBanner.tsx:102:37 - 1 - Arrow function has a complexity of 21. Maximum allowed is 15. (complexity)
violet-vault/src/components/sync/ManualSyncControls.tsx:27:35 - 1 - Arrow function has too many lines (190). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/sync/SyncHealthDashboard.tsx:40:29 - 1 - Arrow function has too many lines (261). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/sync/SyncHealthDashboard.tsx:40:29 - 1 - Arrow function has a complexity of 16. Maximum allowed is 15. (complexity)
violet-vault/src/components/sync/SyncHealthIndicator.tsx:3:1 - 2 - '../../utils/sync/masterSyncValidator' import is restricted from being used by a pattern. Components should not import storage or sync utilities directly. Use service hooks from src/hooks/ instead. (no-restricted-imports)
violet-vault/src/components/sync/SyncHealthIndicator.tsx:4:1 - 2 - '../../services/cloudSyncService' import is restricted from being used by a pattern. Components should not directly import services. Use hooks in src/hooks/ to encapsulate service calls. Utils and hooks are allowed. (no-restricted-imports)
violet-vault/src/components/sync/SyncIndicator.tsx:5:1 - 2 - '../../utils/sync/syncHealthMonitor' import is restricted from being used by a pattern. Components should not import storage or sync utilities directly. Use service hooks from src/hooks/ instead. (no-restricted-imports)
violet-vault/src/components/sync/SyncIndicator.tsx:37:23 - 1 - Arrow function has too many lines (287). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/sync/SyncIndicator.tsx:37:23 - 1 - Arrow function has a complexity of 46. Maximum allowed is 15. (complexity)
violet-vault/src/components/sync/health/SyncHealthDetails.tsx:43:27 - 1 - Arrow function has a complexity of 17. Maximum allowed is 15. (complexity)
violet-vault/src/components/sync/health/SyncStatusIndicator.tsx:3:1 - 2 - '../../../utils/sync/syncHealthHelpers' import is restricted from being used by a pattern. Components should not import storage or sync utilities directly. Use service hooks from src/hooks/ instead. (no-restricted-imports)
violet-vault/src/components/transactions/TransactionFormFields.tsx:254:9 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/transactions/import/FileUploader.tsx:36:13 - 1 - Use <Checkbox> from @/components/ui instead of <input type="checkbox">. Import: import { Checkbox } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/ui/EditableBalance.tsx:4:25 - 1 - Arrow function has too many lines (190). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/components/ui/EditableBalance.tsx:4:25 - 1 - Arrow function has a complexity of 19. Maximum allowed is 15. (complexity)
violet-vault/src/components/ui/StandardTabs.tsx:2:10 - 1 - 'Button' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/ui/forms/Select.tsx:46:7 - 2 - 'Select' is already defined. (no-redeclare)
violet-vault/src/components/ui/forms/Select.tsx:46:7 - 2 - 'Select' is read-only. (no-import-assign)
violet-vault/src/hooks/accounts/useSupplementalAccounts.ts:18:33 - 1 - Arrow function has too many lines (205). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/analytics/useAnalytics.ts:10:22 - 1 - Arrow function has too many lines (346). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/analytics/useAnalytics.ts:21:5 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/analytics/useAnalyticsData.ts:9:33 - 1 - Arrow function has too many lines (241). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/analytics/useAnalyticsIntegration.ts:17:40 - 1 - Arrow function has too many lines (193). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/analytics/useAnalyticsIntegration.ts:120:5 - 1 - Async arrow function has too many statements (27). Maximum allowed is 25. (max-statements)
violet-vault/src/hooks/analytics/usePerformanceMonitor.ts:8:38 - 1 - Arrow function has too many lines (249). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/analytics/useReportExporter.ts:11:34 - 1 - Arrow function has too many lines (299). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/analytics/useReportExporter.ts:26:5 - 1 - Async arrow function has too many statements (67). Maximum allowed is 25. (max-statements)
violet-vault/src/hooks/auth/useKeyManagement.ts:10:33 - 1 - Arrow function has too many lines (272). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/auth/useSecurityManager.ts:27:7 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/auth/useUserSetup.ts:12:29 - 1 - Arrow function has too many lines (269). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/auth/useUserSetup.ts:25:27 - 1 - Async arrow function has too many statements (26). Maximum allowed is 25. (max-statements)
violet-vault/src/hooks/bills/useBillForm.ts:30:28 - 1 - Arrow function has a complexity of 21. Maximum allowed is 15. (complexity)
violet-vault/src/hooks/bills/useBillForm.ts:69:28 - 1 - Arrow function has too many lines (227). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/bills/useBillForm.ts:202:5 - 1 - Async arrow function has a complexity of 20. Maximum allowed is 15. (complexity)
violet-vault/src/hooks/bills/useBillManager.ts:28:31 - 1 - Arrow function has too many lines (186). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/bills/useBillManager.ts:28:31 - 1 - Arrow function has too many statements (28). Maximum allowed is 25. (max-statements)
violet-vault/src/hooks/bills/useBillManager.ts:49:18 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/budgeting/autofunding/useAutoFunding.ts:14:31 - 1 - Arrow function has too many lines (270). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/budgeting/autofunding/useAutoFunding.ts:15:18 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingData.ts:11:35 - 1 - Arrow function has too many lines (259). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution.ts:14:18 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingRules.ts:17:36 - 1 - Arrow function has too many lines (296). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/budgeting/autofunding/useUndoOperations.ts:69:18 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/budgeting/metadata/useActualBalance.ts:39:7 - 2 - Validation functions (validate*, is*Valid) should be in /src/utils/validation/, not in hooks. Extract to utils/validation/ directory. See ARCHITECTURE_VIOLATIONS.md (no-architecture-violations/no-architecture-violations)
violet-vault/src/hooks/budgeting/useBudgetData/mutations.ts:76:17 - 1 - Async method 'mutationFn' has too many statements (30). Maximum allowed is 25. (max-statements)
violet-vault/src/hooks/budgeting/useBudgetData/mutations.ts:116:17 - 1 - Blocks are nested too deeply (6). Maximum allowed is 5. (max-depth)
violet-vault/src/hooks/budgeting/useEnvelopes.ts:19:22 - 1 - Arrow function has too many lines (332). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/budgeting/usePaycheckForm.ts:16:6 - 1 - React Hook useEffect has a missing dependency: 'setShowAddNewPayer'. Either include it or remove the dependency array. If 'setShowAddNewPayer' changes too often, find the parent component that defines it and wrap that definition in useCallback. (react-hooks/exhaustive-deps)
violet-vault/src/hooks/budgeting/usePaycheckProcessor.ts:33:7 - 2 - Validation functions (validate*, is*Valid) should be in /src/utils/validation/, not in hooks. Extract to utils/validation/ directory. See ARCHITECTURE_VIOLATIONS.md (no-architecture-violations/no-architecture-violations)
violet-vault/src/hooks/common/useActualBalance.ts:14:7 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/common/useBugReportV2.ts:6:8 - 1 - 'React' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/hooks/common/useBugReportV2.ts:23:11 - 1 - 'BugReportSubmissionResult' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/hooks/common/useBugReportV2.ts:57:24 - 1 - Arrow function has too many lines (303). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/common/useBugReportV2.ts:57:24 - 1 - Arrow function has too many statements (30). Maximum allowed is 25. (max-statements)
violet-vault/src/hooks/common/useBugReportV2.ts:291:18 - 1 - 'H' is not defined. (no-undef)
violet-vault/src/hooks/common/useBugReportV2.ts:292:14 - 1 - 'H' is not defined. (no-undef)
violet-vault/src/hooks/common/useBugReportV2.ts:294:13 - 1 - 'H' is not defined. (no-undef)
violet-vault/src/hooks/common/useBugReportV2.ts:305:25 - 1 - 'H' is not defined. (no-undef)
violet-vault/src/hooks/common/useBugReportV2.ts:307:22 - 1 - 'H' is not defined. (no-undef)
violet-vault/src/hooks/common/useBugReportV2.ts:307:68 - 1 - 'H' is not defined. (no-undef)
violet-vault/src/hooks/common/useBugReportV2.ts:310:13 - 1 - 'H' is not defined. (no-undef)
violet-vault/src/hooks/common/useBugReportV2.ts:330:18 - 1 - 'H' is not defined. (no-undef)
violet-vault/src/hooks/common/useBugReportV2.ts:331:22 - 1 - 'H' is not defined. (no-undef)
violet-vault/src/hooks/common/useBugReportV2.ts:334:18 - 1 - 'H' is not defined. (no-undef)
violet-vault/src/hooks/common/useBugReportV2.ts:335:26 - 1 - 'H' is not defined. (no-undef)
violet-vault/src/hooks/common/useBugReportV2.ts:372:9 - 2 - Validation functions (validate*, is*Valid) should be in /src/utils/validation/, not in hooks. Extract to utils/validation/ directory. See ARCHITECTURE_VIOLATIONS.md (no-architecture-violations/no-architecture-violations)
violet-vault/src/hooks/common/useConfirm.ts:36:27 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/common/useConfirm.ts:65:53 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/common/useDataInitialization.ts:40:32 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/common/useExportData.ts:21:31 - 1 - Arrow function has a complexity of 16. Maximum allowed is 15. (complexity)
violet-vault/src/hooks/common/useFABActions.ts:40:6 - 1 - React Hook useEffect has missing dependencies: 'registerPrimaryAction' and 'unregisterPrimaryAction'. Either include them or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/hooks/common/useFABActions.ts:58:6 - 1 - React Hook useEffect has missing dependencies: 'registerSecondaryAction' and 'unregisterSecondaryAction'. Either include them or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/hooks/common/useFABActions.ts:63:6 - 1 - React Hook useEffect has a missing dependency: 'setVisibility'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/hooks/common/useFABActions.ts:79:6 - 1 - React Hook useEffect has a missing dependency: 'setDefaultActionHandler'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/hooks/common/useFABActions.ts:95:6 - 1 - React Hook useEffect has a missing dependency: 'setCurrentScreen'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/hooks/common/useNetworkStatus.ts:39:6 - 1 - React Hook useEffect has a missing dependency: 'setOnlineStatus'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/hooks/common/useOnboardingAutoComplete.ts:13:74 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/common/usePrompt.ts:45:26 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/common/usePrompt.ts:78:52 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/debts/useDebtManagement.ts:25:34 - 1 - Arrow function has too many lines (287). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/mobile/useFABBehavior.ts:24:5 - 2 - Expected an assignment or function call and instead saw an expression. (@typescript-eslint/no-unused-expressions)
violet-vault/src/hooks/mobile/useFABBehavior.ts:83:6 - 1 - React Hook useEffect has a missing dependency: 'setExpanded'. Either include it or remove the dependency array. If 'setExpanded' changes too often, find the parent component that defines it and wrap that definition in useCallback. (react-hooks/exhaustive-deps)
violet-vault/src/hooks/notifications/useFirebaseMessaging.ts:145:6 - 1 - React Hook useEffect has a missing dependency: 'updatePermissionStatus'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/hooks/settings/useSettingsDashboard.ts:103:53 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/sharing/useShareCodeValidation.ts:17:9 - 2 - Validation functions (validate*, is*Valid) should be in /src/utils/validation/, not in hooks. Extract to utils/validation/ directory. See ARCHITECTURE_VIOLATIONS.md (no-architecture-violations/no-architecture-violations)
violet-vault/src/hooks/sync/useFirebaseSync.ts:57:18 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/transactions/useTransactionData.ts:21:28 - 1 - Arrow function has too many lines (202). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/transactions/useTransactionFilters.ts:4:7 - 2 - Validation functions (validate*, is*Valid) should be in /src/utils/validation/, not in hooks. Extract to utils/validation/ directory. See ARCHITECTURE_VIOLATIONS.md (no-architecture-violations/no-architecture-violations)
violet-vault/src/hooks/transactions/useTransactionLedger.ts:15:37 - 1 - Arrow function has too many lines (187). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/transactions/useTransactionLedger.ts:15:37 - 1 - Arrow function has too many statements (33). Maximum allowed is 25. (max-statements)
violet-vault/src/hooks/transactions/useTransactionLedger.ts:27:18 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/transactions/useTransactionOperations.ts:30:34 - 1 - Arrow function has too many lines (278). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/transactions/useTransactionQuery.ts:22:5 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/hooks/transactions/useTransactionQuery.ts:25:25 - 1 - Async arrow function has too many statements (30). Maximum allowed is 25. (max-statements)
violet-vault/src/hooks/transactions/useTransactionQuery.ts:25:25 - 1 - Async arrow function has a complexity of 18. Maximum allowed is 15. (complexity)
violet-vault/src/hooks/transactions/useTransactionSplitter.ts:29:32 - 1 - Arrow function has too many lines (183). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/transactions/useTransactionsV2.ts:17:27 - 1 - Arrow function has too many lines (162). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/transactions/useTransactionsV2.ts:39:23 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/main.tsx:245:1 - 2 - Dangerous pattern: Store operation called in module scope! This can trigger React error #185 during app initialization. Move this call to explicit initialization functions instead of auto-executing on module load. Example: Create an init() function and call it from App component. (zustand-safe-patterns/zustand-no-auto-executing-store-calls)
violet-vault/src/services/authService.ts:39:33 - 1 - Async arrow function has too many statements (29). Maximum allowed is 25. (max-statements)
violet-vault/src/services/authService.ts:124:22 - 1 - Async arrow function has too many lines (200). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/services/authService.ts:134:25 - 1 - Async arrow function has too many lines (190). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/services/authService.ts:134:25 - 1 - Async arrow function has too many statements (66). Maximum allowed is 25. (max-statements)
violet-vault/src/services/authService.ts:134:25 - 1 - Async arrow function has a complexity of 36. Maximum allowed is 15. (complexity)
violet-vault/src/services/bugReport/apiService.ts:155:28 - 1 - Static method 'validateReportData' has a complexity of 19. Maximum allowed is 15. (complexity)
violet-vault/src/services/bugReport/browserInfoService.ts:73:24 - 1 - Static method 'getBrowserInfo' has a complexity of 19. Maximum allowed is 15. (complexity)
violet-vault/src/services/bugReport/browserInfoService.ts:169:25 - 1 - Static method 'getViewportInfo' has a complexity of 20. Maximum allowed is 15. (complexity)
violet-vault/src/services/bugReport/githubApiService.ts:68:31 - 1 - Static method 'formatGitHubIssueBody' has a complexity of 17. Maximum allowed is 15. (complexity)
violet-vault/src/services/bugReport/performanceInfoService.ts:115:28 - 1 - Static method 'getPerformanceInfo' has a complexity of 22. Maximum allowed is 15. (complexity)
violet-vault/src/services/firebaseMessaging.ts:22:16 - 1 - 'NotificationPermission' is not defined. (no-undef)
violet-vault/src/services/firebaseMessaging.ts:31:15 - 1 - 'NotificationPermission' is not defined. (no-undef)
violet-vault/src/services/types/firebaseServiceTypes.ts:85:18 - 1 - Method 'categorizeError' has a complexity of 34. Maximum allowed is 15. (complexity)
violet-vault/src/test/setup.ts:25:59 - 1 - 'BufferSource' is not defined. (no-undef)
violet-vault/src/types/common.ts:79:54 - 2 - The `Function` type accepts any function-like value.
Prefer explicitly defining any function parameters and return type. (@typescript-eslint/no-unsafe-function-type)
violet-vault/src/utils/bills/billCalculations.ts:47:34 - 1 - Arrow function has too many statements (26). Maximum allowed is 25. (max-statements)
violet-vault/src/utils/budgeting/autofunding/rules.ts:76:29 - 1 - Arrow function has a complexity of 32. Maximum allowed is 15. (complexity)
violet-vault/src/utils/budgeting/autofunding/rules.ts:314:34 - 1 - Arrow function has a complexity of 16. Maximum allowed is 15. (complexity)
violet-vault/src/utils/budgeting/envelopeFormUtils.ts:41:37 - 1 - Arrow function has too many statements (36). Maximum allowed is 25. (max-statements)
violet-vault/src/utils/budgeting/envelopeFormUtils.ts:41:37 - 1 - Arrow function has a complexity of 31. Maximum allowed is 15. (complexity)
violet-vault/src/utils/budgeting/envelopeFormUtils.ts:238:40 - 1 - Arrow function has a complexity of 20. Maximum allowed is 15. (complexity)
violet-vault/src/utils/budgeting/envelopeIntegrityChecker.ts:119:41 - 1 - Async arrow function has too many statements (37). Maximum allowed is 25. (max-statements)
violet-vault/src/utils/budgeting/envelopeIntegrityChecker.ts:119:41 - 1 - Async arrow function has a complexity of 20. Maximum allowed is 15. (complexity)
violet-vault/src/utils/common/billDiscovery.ts:131:33 - 1 - Arrow function has too many statements (27). Maximum allowed is 25. (max-statements)
violet-vault/src/utils/common/billDiscovery.ts:131:33 - 1 - Arrow function has a complexity of 25. Maximum allowed is 15. (complexity)
violet-vault/src/utils/common/highlight.ts:124:3 - 1 - Unused eslint-disable directive (no problems were reported from 'no-console'). (null)
violet-vault/src/utils/common/highlight.ts:126:3 - 1 - Unused eslint-disable directive (no problems were reported from 'no-console'). (null)
violet-vault/src/utils/common/highlight.ts:130:3 - 1 - Unused eslint-disable directive (no problems were reported from 'no-console'). (null)
violet-vault/src/utils/common/highlight.ts:155:3 - 1 - Unused eslint-disable directive (no problems were reported from 'no-console'). (null)
violet-vault/src/utils/common/toastHelpers.ts:20:73 - 1 - Use selective subscriptions instead of subscribing to entire store. Replace useUIStore() with useUIStore(state => state.specificValue) to prevent unnecessary re-renders. See docs/development/architecture/data-flow.md for performance patterns. (zustand-safe-patterns/zustand-selective-subscriptions)
violet-vault/src/utils/common/transactionArchiving.ts:141:26 - 1 - Arrow function has too many statements (28). Maximum allowed is 25. (max-statements)
violet-vault/src/utils/debts/debtFormValidation.ts:68:8 - 1 - Function 'validateDebtFormData' has a complexity of 18. Maximum allowed is 15. (complexity)
violet-vault/src/utils/debts/debtStrategies.ts:33:1 - 1 - Function 'simulatePayoffStrategy' has too many statements (28). Maximum allowed is 25. (max-statements)
violet-vault/src/utils/notifications/permissionUtils.ts:38:11 - 1 - 'NotificationPermission' is not defined. (no-undef)
violet-vault/src/utils/notifications/permissionUtils.ts:47:15 - 1 - 'NotificationPermission' is not defined. (no-undef)
violet-vault/src/utils/pwa/patchNotesManager.ts:105:22 - 1 - Method 'parseVersionContent' has too many statements (30). Maximum allowed is 25. (max-statements)
violet-vault/src/utils/pwa/patchNotesManager.ts:105:22 - 1 - Method 'parseVersionContent' has a complexity of 28. Maximum allowed is 15. (complexity)
violet-vault/src/utils/pwa/serviceWorkerDiagnostics.ts:44:23 - 1 - Async method 'getCacheHealth' has too many statements (29). Maximum allowed is 25. (max-statements)
violet-vault/src/utils/sync/syncFlowValidator.ts:10:37 - 1 - Async arrow function has too many lines (249). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/utils/sync/syncFlowValidator.ts:10:37 - 1 - Async arrow function has too many statements (66). Maximum allowed is 25. (max-statements)
violet-vault/src/utils/sync/syncFlowValidator.ts:10:37 - 1 - Async arrow function has a complexity of 16. Maximum allowed is 15. (complexity)
violet-vault/src/utils/sync/syncHealthChecker.ts:25:1 - 1 - Async function 'runHealthChecksInternal' has too many lines (238). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/utils/sync/syncHealthChecker.ts:25:1 - 1 - Async function 'runHealthChecksInternal' has too many statements (84). Maximum allowed is 25. (max-statements)
violet-vault/src/utils/sync/syncHealthChecker.ts:25:1 - 1 - Async function 'runHealthChecksInternal' has a complexity of 31. Maximum allowed is 15. (complexity)
violet-vault/src/vite-env.d.ts:65:26 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
```

## Typecheck Audit

### Files with Most Type Errors
- 102 errors in `src/services/budgetDatabaseService.ts`
- 100 errors in `src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx`
- 74 errors in `src/services/firebaseSyncService.ts`
- 68 errors in `src/services/chunkedSyncService.ts`
- 59 errors in `src/utils/sync/syncHealthMonitor.ts`
- 56 errors in `src/utils/sync/CircuitBreaker.ts`
- 52 errors in `src/services/cloudSyncService.ts`
- 52 errors in `src/hooks/common/__tests__/useModalManager.test.ts`
- 48 errors in `src/utils/sync/SyncQueue.ts`
- 48 errors in `src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx`
- 47 errors in `src/services/__tests__/budgetHistoryService.test.ts`
- 37 errors in `src/utils/common/BaseMutex.ts`
- 37 errors in `src/services/editLockService.ts`
- 35 errors in `src/utils/sync/syncEdgeCaseTester.ts`
- 33 errors in `src/utils/pwa/pwaManager.ts`
- 32 errors in `src/utils/transactions/__tests__/splitting.test.ts`
- 32 errors in `src/hooks/savings/useSavingsGoals/savingsMutations.ts`
- 32 errors in `src/hooks/budgeting/useEnvelopes.ts`
- 31 errors in `src/hooks/transactions/useTransactionOperations.ts`
- 30 errors in `src/utils/pwa/backgroundSync.ts`
- 29 errors in `src/utils/budgeting/envelopeFormUtils.ts`
- 29 errors in `src/services/bugReport/__tests__/index.test.ts`
- 29 errors in `src/hooks/transactions/__tests__/useTransactionLedger.test.tsx`
- 27 errors in `src/utils/common/highlight.ts`
- 26 errors in `src/utils/debts/__tests__/debtFormValidation.test.ts`
- 26 errors in `src/services/__tests__/budgetDatabaseService.test.ts`
- 25 errors in `src/utils/debug/syncDiagnostic.ts`
- 25 errors in `src/services/bugReport/__tests__/systemInfoService.test.ts`
- 24 errors in `src/hooks/bills/useBills/billMutations.ts`
- 23 errors in `src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx`
- 22 errors in `src/utils/query/__tests__/prefetchHelpers.test.ts`
- 22 errors in `src/utils/pwa/patchNotesManager.ts`
- 22 errors in `src/hooks/analytics/useAnalytics.ts`
- 21 errors in `src/utils/debug/dataDiagnostic.ts`
- 21 errors in `src/utils/budgeting/__tests__/envelopeFormUtils.test.ts`
- 21 errors in `src/stores/ui/fabStore.ts`
- 21 errors in `src/hooks/budgeting/useBudgetHistoryQuery.ts`
- 21 errors in `src/hooks/budgeting/metadata/useActualBalance.ts`
- 20 errors in `src/utils/sync/SyncMutex.ts`
- 20 errors in `src/utils/common/logger.ts`
- 20 errors in `src/hooks/transactions/__tests__/useTransactionFilters.test.ts`
- 20 errors in `src/components/layout/MainLayout.tsx`
- 19 errors in `src/utils/budgeting/suggestionUtils.ts`
- 19 errors in `src/hooks/common/useReceipts.ts`
- 19 errors in `src/hooks/common/useBugReportV2.ts`
- 19 errors in `src/hooks/budgeting/useBudgetData/mutations.ts`
- 18 errors in `src/utils/analytics/transactionAnalyzer.ts`
- 17 errors in `src/utils/stores/storeRegistry.ts`
- 17 errors in `src/utils/accounts/accountHelpers.ts`
- 17 errors in `src/hooks/debts/__tests__/useDebtForm.test.ts`
- 16 errors in `src/utils/query/__tests__/optimisticHelpers.test.ts`
- 16 errors in `src/utils/common/ocrProcessor.ts`
- 15 errors in `src/utils/common/transactionArchiving.ts`
- 15 errors in `src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts`
- 14 errors in `src/utils/pwa/serviceWorkerDiagnostics.ts`
- 14 errors in `src/utils/common/analyticsProcessor.ts`
- 14 errors in `src/services/bugReport/__tests__/screenshotService.test.ts`
- 13 errors in `src/utils/common/toastHelpers.ts`
- 13 errors in `src/utils/budgeting/autofunding/__tests__/simulation.test.ts`
- 13 errors in `src/utils/analytics/billAnalyzer.ts`
- 13 errors in `src/services/bugReport/performanceInfoService.ts`
- 13 errors in `src/services/__tests__/types/firebaseTypes.test.ts`
- 13 errors in `src/hooks/transactions/useTransactionData.ts`
- 12 errors in `src/utils/sync/RetryManager.ts`
- 12 errors in `src/utils/common/budgetHistoryTracker.ts`
- 12 errors in `src/services/bugReport/index.ts`
- 12 errors in `src/services/budgetHistoryService.ts`
- 12 errors in `src/hooks/transactions/useTransactionsV2.ts`
- 12 errors in `src/components/modals/UnassignedCashModal.tsx`
- 12 errors in `src/components/layout/ViewRenderer.tsx`
- 12 errors in `src/components/layout/SummaryCards.tsx`
- 11 errors in `src/utils/sync/autoBackupService.ts`
- 11 errors in `src/utils/sync/__tests__/syncHealthHelpers.test.ts`
- 11 errors in `src/utils/query/prefetchHelpers.ts`
- 11 errors in `src/utils/pwa/offlineDataValidator.ts`
- 11 errors in `src/utils/analytics/categoryHelpers.ts`
- 11 errors in `src/main.tsx`
- 11 errors in `src/hooks/transactions/__tests__/useTransactionMutations.test.ts`
- 11 errors in `src/hooks/debts/useDebtManagement.ts`
- 11 errors in `src/hooks/budgeting/useBudgetData/queryFunctions.ts`
- 11 errors in `src/hooks/bills/useBills/billQueries.ts`
- 11 errors in `src/hooks/analytics/useAnalyticsData.ts`
- 11 errors in `src/components/receipts/__tests__/ReceiptScanner.test.tsx`
- 11 errors in `src/components/budgeting/envelope/EnvelopeBudgetFields.tsx`
- 10 errors in `src/utils/testing/storeTestUtils.ts`
- 10 errors in `src/utils/sync/validation/__tests__/manifestValidator.test.ts`
- 10 errors in `src/utils/budgeting/autofunding/rules.ts`
- 10 errors in `src/utils/bills/__tests__/billCalculations.test.ts`
- 10 errors in `src/hooks/savings/useSavingsGoals/savingsQueries.ts`
- 10 errors in `src/hooks/mobile/useFABModalIntegration.ts`
- 10 errors in `src/hooks/common/useEditLock.ts`
- 10 errors in `src/hooks/budgeting/autofunding/useAutoFunding.ts`
- 10 errors in `src/hooks/auth/mutations/useLoginMutations.ts`
- 10 errors in `src/hooks/auth/mutations/useJoinBudgetMutation.ts`
- 10 errors in `src/components/budgeting/EnvelopeSummaryCards.tsx`
- 10 errors in `src/components/bills/BillSummaryCards.tsx`
- 9 errors in `src/utils/transactions/operations.ts`
- 9 errors in `src/utils/transactions/fileParser.ts`
- 9 errors in `src/utils/query/queryClientConfig.ts`
- 9 errors in `src/hooks/transactions/useTransactionMutations.ts`
- 9 errors in `src/hooks/layout/__tests__/useLayoutData.test.ts`
- 9 errors in `src/hooks/auth/__tests__/useAuthenticationManager.test.ts`
- 9 errors in `src/hooks/analytics/__tests__/useTrendAnalysis.test.ts`
- 9 errors in `src/components/debt/ui/DebtList.tsx`
- 8 errors in `src/utils/transactions/filtering.ts`
- 8 errors in `src/utils/transactions/__tests__/filtering.test.ts`
- 8 errors in `src/utils/budgeting/billEnvelopeCalculations.ts`
- 8 errors in `src/services/keys/keyManagementService.ts`
- 8 errors in `src/services/keys/__tests__/keyManagementService.test.ts`
- 8 errors in `src/services/bugReport/screenshotService.ts`
- 8 errors in `src/hooks/transactions/useTransactionQuery.ts`
- 8 errors in `src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts`
- 8 errors in `src/hooks/common/useConnectionManager/useConnectionData.ts`
- 8 errors in `src/hooks/common/__tests__/useExportData.test.ts`
- 8 errors in `src/hooks/budgeting/autofunding/useExecutionHistory.ts`
- 8 errors in `src/components/ui/Header.tsx`
- 8 errors in `src/components/budgeting/envelope/EnvelopeBasicFields.tsx`
- 8 errors in `src/components/auth/__tests__/UserSetup.test.tsx`
- 7 errors in `src/utils/sync/validation/__tests__/encryptedDataValidator.test.ts`
- 7 errors in `src/utils/sync/syncFlowValidator.ts`
- 7 errors in `src/utils/stores/createSafeStore.ts`
- 7 errors in `src/utils/savings/savingsFormUtils.ts`
- 7 errors in `src/utils/budgeting/paycheckDeletion.ts`
- 7 errors in `src/utils/budgeting/envelopeIntegrityChecker.ts`
- 7 errors in `src/utils/bills/billCalculations.ts`
- 7 errors in `src/utils/auth/authFlowHelpers.ts`
- 7 errors in `src/services/security/__tests__/securityService.test.ts`
- 7 errors in `src/hooks/transactions/__tests__/useTransactionQuery.test.ts`
- 7 errors in `src/hooks/savings/useSavingsGoalsActions.ts`
- 7 errors in `src/hooks/savings/useSavingsGoals/index.ts`
- 7 errors in `src/hooks/budgeting/autofunding/useHistoryExport.ts`
- 7 errors in `src/hooks/budgeting/autofunding/useAutoFundingData.ts`
- 7 errors in `src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts`
- 7 errors in `src/hooks/bills/useBillManagerUI.ts`
- 7 errors in `src/db/budgetDb.ts`
- 7 errors in `src/components/ui/VirtualList.tsx`
- 7 errors in `src/components/savings/DistributeModal.tsx`
- 7 errors in `src/components/layout/NavigationTabs.tsx`
- 7 errors in `src/components/budgeting/EnvelopeGrid.tsx`
- 7 errors in `src/components/budgeting/BillEnvelopeFundingInfo.tsx`
- 7 errors in `src/components/automation/AutoFundingView.tsx`
- 6 errors in `src/utils/budgeting/paydayPredictor.ts`
- 6 errors in `src/utils/budgeting/paycheckUtils.ts`
- 6 errors in `src/utils/budgeting/autofunding/conditions.ts`
- 6 errors in `src/utils/budgeting/__tests__/paycheckUtils.test.ts`
- 6 errors in `src/stores/ui/toastStore.ts`
- 6 errors in `src/services/security/securityService.ts`
- 6 errors in `src/services/bugReport/systemInfoService.ts`
- 6 errors in `src/services/bugReport/githubApiService.ts`
- 6 errors in `src/hooks/receipts/__tests__/useReceiptScanner.test.ts`
- 6 errors in `src/hooks/common/useConnectionManager.ts`
- 6 errors in `src/hooks/common/useActualBalance.ts`
- 6 errors in `src/hooks/common/__tests__/useImportData.test.ts`
- 6 errors in `src/hooks/budgeting/useUnassignedCashDistribution.ts`
- 6 errors in `src/hooks/budgeting/metadata/useUnassignedCash.ts`
- 6 errors in `src/hooks/bills/useBillManager.ts`
- 6 errors in `src/hooks/auth/useKeyManagementUI.ts`
- 6 errors in `src/hooks/auth/useAuthenticationManager.ts`
- 6 errors in `src/components/sync/ManualSyncControls.tsx`
- 6 errors in `src/components/security/LockScreen.tsx`
- 6 errors in `src/components/pwa/OfflineStatusIndicator.tsx`
- 6 errors in `src/components/onboarding/OnboardingProgress.tsx`
- 6 errors in `src/components/bills/BillManager.tsx`
- 5 errors in `src/utils/sync/syncHealthChecker.ts`
- 5 errors in `src/utils/common/performance.ts`
- 5 errors in `src/services/__tests__/integration/syncIntegration.test.ts`
- 5 errors in `src/hooks/transactions/useTransactionImport.ts`
- 5 errors in `src/hooks/transactions/useTransactionFileUpload.ts`
- 5 errors in `src/hooks/sync/useSyncHealthIndicator.ts`
- 5 errors in `src/hooks/settings/useTransactionArchiving.ts`
- 5 errors in `src/hooks/common/usePrompt.ts`
- 5 errors in `src/hooks/common/useOnboardingAutoComplete.ts`
- 5 errors in `src/hooks/common/useConfirm.ts`
- 5 errors in `src/hooks/common/useBugReportSubmission.ts`
- 5 errors in `src/hooks/budgeting/metadata/useBudgetMetadataUtils.ts`
- 5 errors in `src/hooks/budgeting/metadata/useBudgetMetadataQuery.ts`
- 5 errors in `src/hooks/auth/mutations/useProfileMutations.ts`
- 5 errors in `src/components/ui/StandardFilters.tsx`
- 5 errors in `src/components/sync/SyncHealthIndicator.tsx`
- 5 errors in `src/components/pages/MainDashboard.tsx`
- 5 errors in `src/components/history/IntegrityStatusIndicator.tsx`
- 5 errors in `src/components/budgeting/envelope/EnvelopeItem.tsx`
- 4 errors in `src/utils/sync/corruptionRecoveryHelper.ts`
- 4 errors in `src/utils/common/fixAutoAllocateUndefined.ts`
- 4 errors in `src/utils/budgeting/envelopeCalculations.ts`
- 4 errors in `src/utils/bills/billDetailUtils.ts`
- 4 errors in `src/hooks/sync/useManualSync.ts`
- 4 errors in `src/hooks/common/useTransactionArchiving.ts`
- 4 errors in `src/hooks/auth/mutations/usePasswordMutations.ts`
- 4 errors in `src/hooks/auth/__tests__/useSecurityManagerUI.test.ts`
- 4 errors in `src/hooks/analytics/useAnalyticsIntegration.ts`
- 4 errors in `src/components/sync/ActivityBanner.tsx`
- 4 errors in `src/components/settings/archiving/ArchivingPreviewResults.tsx`
- 4 errors in `src/components/onboarding/OnboardingTutorial.tsx`
- 4 errors in `src/components/mobile/ResponsiveModal.tsx`
- 4 errors in `src/components/debt/ui/DebtFilters.tsx`
- 4 errors in `src/components/budgeting/EnvelopeSystem.tsx`
- 4 errors in `src/components/analytics/AnalyticsSummaryCards.tsx`
- 3 errors in `src/utils/sync/syncHealthHelpers.ts`
- 3 errors in `src/utils/sync/retryUtils.ts`
- 3 errors in `src/utils/sync/resilience/index.ts`
- 3 errors in `src/utils/security/shareCodeUtils.ts`
- 3 errors in `src/utils/savings/savingsCalculations.ts`
- 3 errors in `src/utils/query/optimisticHelpers.ts`
- 3 errors in `src/utils/debts/debtFormValidation.ts`
- 3 errors in `src/utils/dataManagement/firebaseUtils.ts`
- 3 errors in `src/utils/dataManagement/__tests__/firebaseUtils.test.ts`
- 3 errors in `src/utils/common/__tests__/BaseMutex.test.ts`
- 3 errors in `src/utils/accounts/__tests__/accountValidation.test.ts`
- 3 errors in `src/services/typedFirebaseSyncService.ts`
- 3 errors in `src/services/bugReport/contextAnalysisService.ts`
- 3 errors in `src/services/authService.ts`
- 3 errors in `src/hooks/transactions/useTransactionSplitter.ts`
- 3 errors in `src/hooks/transactions/__tests__/useTransactionAnalytics.test.ts`
- 3 errors in `src/hooks/sync/useFirebaseSync.ts`
- 3 errors in `src/hooks/settings/__tests__/useSettingsDashboard.test.ts`
- 3 errors in `src/hooks/debts/useDebts.ts`
- 3 errors in `src/hooks/budgeting/usePaycheckProcessor.ts`
- 3 errors in `src/hooks/budgeting/useBudgetData/utilities.ts`
- 3 errors in `src/hooks/budgeting/metadata/useUnassignedCashOperations.ts`
- 3 errors in `src/hooks/budgeting/metadata/useBudgetMetadataMutation.ts`
- 3 errors in `src/hooks/budgeting/metadata/useActualBalanceOperations.ts`
- 3 errors in `src/hooks/auth/useUserSetup.ts`
- 3 errors in `src/hooks/analytics/__tests__/useAnalyticsExport.test.ts`
- 3 errors in `src/db/__tests__/budgetDb.test.ts`
- 3 errors in `src/components/transactions/TransactionLedger.tsx`
- 3 errors in `src/components/sync/SyncIndicator.tsx`
- 3 errors in `src/components/sharing/JoinBudgetModal.tsx`
- 3 errors in `src/components/settings/sections/SyncDebugToolsSection.tsx`
- 3 errors in `src/components/onboarding/hooks/useTutorialControls.ts`
- 3 errors in `src/components/onboarding/EmptyStateHints.tsx`
- 3 errors in `src/components/history/ObjectHistoryViewer.tsx`
- 3 errors in `src/components/feedback/BugReportButton.tsx`
- 3 errors in `src/components/debt/modals/DebtFormFields.tsx`
- 3 errors in `src/components/charts/ComposedFinancialChart.tsx`
- 3 errors in `src/components/charts/CategoryBarChart.tsx`
- 3 errors in `src/components/budgeting/CreateEnvelopeModal.tsx`
- 3 errors in `src/components/automation/AutoFundingRuleBuilder.tsx`
- 3 errors in `src/components/auth/UserIndicator.tsx`
- 3 errors in `src/components/analytics/SmartCategoryManager.tsx`
- 3 errors in `src/components/analytics/CategoryAdvancedTab.tsx`
- 3 errors in `src/components/accounts/SupplementalAccounts.tsx`
- 2 errors in `src/utils/transactions/index.ts`
- 2 errors in `src/utils/sync/__tests__/SyncMutex.test.ts`
- 2 errors in `src/utils/services/editLockHelpers.ts`
- 2 errors in `src/utils/security/index.ts`
- 2 errors in `src/utils/dataManagement/__tests__/dexieUtils.test.ts`
- 2 errors in `src/utils/dataManagement/__tests__/backupUtils.test.ts`
- 2 errors in `src/utils/common/version.ts`
- 2 errors in `src/utils/common/testBudgetHistory.ts`
- 2 errors in `src/utils/accounts/accountValidation.ts`
- 2 errors in `src/services/syncServiceInitializer.ts`
- 2 errors in `src/services/bugReport/errorTrackingService.ts`
- 2 errors in `src/hooks/transactions/useTransactionLedger.ts`
- 2 errors in `src/hooks/settings/useSettingsDashboard.ts`
- 2 errors in `src/hooks/receipts/useReceiptToTransaction.ts`
- 2 errors in `src/hooks/debts/useDebtDashboard.ts`
- 2 errors in `src/hooks/dashboard/useMainDashboard.ts`
- 2 errors in `src/hooks/dashboard/__tests__/useMainDashboard.test.ts`
- 2 errors in `src/hooks/common/useDataManagement.ts`
- 2 errors in `src/hooks/common/useDataInitialization.ts`
- 2 errors in `src/hooks/common/useConnectionManager/useConnectionOperations.ts`
- 2 errors in `src/hooks/budgeting/useSmartSuggestions.ts`
- 2 errors in `src/hooks/budgeting/usePaycheckHistory.ts`
- 2 errors in `src/hooks/budgeting/usePaycheckForm.ts`
- 2 errors in `src/hooks/budgeting/useEnvelopeForm.ts`
- 2 errors in `src/hooks/budgeting/useBudgetData/index.ts`
- 2 errors in `src/hooks/analytics/useReportExporter.ts`
- 2 errors in `src/hooks/analytics/usePerformanceMonitor.ts`
- 2 errors in `src/components/ui/VersionFooter.tsx`
- 2 errors in `src/components/transactions/TransactionForm.tsx`
- 2 errors in `src/components/sync/health/SyncHealthDetails.tsx`
- 2 errors in `src/components/sync/SyncHealthDashboard.tsx`
- 2 errors in `src/components/savings/SavingsGoalCard.tsx`
- 2 errors in `src/components/pwa/ShareTargetHandler.tsx`
- 2 errors in `src/components/mobile/BottomNavItem.tsx`
- 2 errors in `src/components/dev/DevAuthBypass.tsx`
- 2 errors in `src/components/debt/ui/DebtSummaryWidget.tsx`
- 2 errors in `src/components/debt/modals/DebtDetailModal.tsx`
- 2 errors in `src/components/debt/modals/AddDebtModal.tsx`
- 2 errors in `src/components/debt/DebtDashboard.tsx`
- 2 errors in `src/components/charts/DistributionPieChart.tsx`
- 2 errors in `src/components/budgeting/envelope/EnvelopeSummary.tsx`
- 2 errors in `src/components/bills/AddBillModal.tsx`
- 2 errors in `src/components/automation/steps/RuleConfigurationStep.tsx`
- 2 errors in `src/components/automation/AutoFundingDashboard.tsx`
- 2 errors in `src/components/accounts/AccountCard.tsx`
- 1 errors in `src/utils/sync/validation/checksumUtils.ts`
- 1 errors in `src/utils/sync/validation/__tests__/checksumUtils.test.ts`
- 1 errors in `src/utils/sync/index.ts`
- 1 errors in `src/utils/sync/dataDetectionHelper.ts`
- 1 errors in `src/utils/security/optimizedSerialization.ts`
- 1 errors in `src/utils/security/errorViewer.ts`
- 1 errors in `src/utils/security/encryption.ts`
- 1 errors in `src/utils/receipts/receiptHelpers.tsx`
- 1 errors in `src/utils/query/__tests__/queryKeys.test.ts`
- 1 errors in `src/utils/query/__tests__/integration/queryIntegration.test.ts`
- 1 errors in `src/utils/debts/debtCalculations.ts`
- 1 errors in `src/utils/dataManagement/dexieUtils.ts`
- 1 errors in `src/utils/dataManagement/__tests__/fileUtils.test.ts`
- 1 errors in `src/utils/common/billDiscovery.ts`
- 1 errors in `src/utils/budgeting/paycheckProcessing.ts`
- 1 errors in `src/utils/budgeting/autofunding/simulation.ts`
- 1 errors in `src/utils/budgeting/autofunding/__tests__/rules.test.ts`
- 1 errors in `src/utils/bills/index.ts`
- 1 errors in `src/stores/ui/uiStore.ts`
- 1 errors in `src/services/typedChunkedSyncService.ts`
- 1 errors in `src/services/bugReport/reportSubmissionService.ts`
- 1 errors in `src/services/bugReport/pageDetectionService.ts`
- 1 errors in `src/hooks/transactions/useTransactionBalanceUpdater.ts`
- 1 errors in `src/hooks/transactions/__tests__/useTransactionUtils.test.ts`
- 1 errors in `src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts`
- 1 errors in `src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts`
- 1 errors in `src/hooks/sharing/useBudgetJoining.ts`
- 1 errors in `src/hooks/settings/__tests__/useTransactionArchiving.test.ts`
- 1 errors in `src/hooks/layout/useLayoutData.ts`
- 1 errors in `src/hooks/debts/useDebtModalLogic.ts`
- 1 errors in `src/hooks/common/useTransactionsCompat.ts`
- 1 errors in `src/hooks/common/useRouterPageDetection.ts`
- 1 errors in `src/hooks/common/useImportData.ts`
- 1 errors in `src/hooks/common/useActivityLogger.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useUndoOperations.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingRules.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingHistory.ts`
- 1 errors in `src/hooks/bills/useBills/index.ts`
- 1 errors in `src/hooks/bills/useBillForm.ts`
- 1 errors in `src/hooks/auth/useSecurityManagerUI.ts`
- 1 errors in `src/hooks/auth/useKeyManagement.ts`
- 1 errors in `src/hooks/auth/useAuthCompatibility.ts`
- 1 errors in `src/hooks/auth/queries/usePasswordValidation.ts`
- 1 errors in `src/hooks/auth/__tests__/useUserSetup.test.ts`
- 1 errors in `src/hooks/accounts/useSupplementalAccounts.ts`
- 1 errors in `src/components/ui/forms/Select.tsx`
- 1 errors in `src/components/ui/TouchButton.tsx`
- 1 errors in `src/components/ui/Toast.tsx`
- 1 errors in `src/components/ui/StandardTabs.tsx`
- 1 errors in `src/components/ui/SecurityAlert.tsx`
- 1 errors in `src/components/ui/PromptProvider.tsx`
- 1 errors in `src/components/ui/LoadingSpinner.tsx`
- 1 errors in `src/components/ui/EditLockIndicator.tsx`
- 1 errors in `src/components/ui/ConnectionDisplay.tsx`
- 1 errors in `src/components/ui/ConfirmProvider.tsx`
- 1 errors in `src/components/transactions/splitter/SplitterHeader.tsx`
- 1 errors in `src/components/transactions/ledger/TransactionPagination.tsx`
- 1 errors in `src/components/transactions/ledger/TransactionLedgerLoading.tsx`
- 1 errors in `src/components/transactions/import/FileUploader.tsx`
- 1 errors in `src/components/transactions/import/FieldMapper.tsx`
- 1 errors in `src/components/transactions/components/DeleteConfirmation.tsx`
- 1 errors in `src/components/transactions/TransactionSummaryCards.tsx`
- 1 errors in `src/components/transactions/TransactionSplitter.tsx`
- 1 errors in `src/components/sync/health/SyncStatusIndicator.tsx`
- 1 errors in `src/components/sync/SyncStatusIndicators.tsx`
- 1 errors in `src/components/sharing/steps/UserSetupStep.tsx`
- 1 errors in `src/components/sharing/steps/ShareCodeStep.tsx`
- 1 errors in `src/components/sharing/ShareCodeModal.tsx`
- 1 errors in `src/components/settings/sections/AccountSettingsSection.tsx`
- 1 errors in `src/components/settings/TransactionArchiving.tsx`
- 1 errors in `src/components/savings/AddEditGoalModal.tsx`
- 1 errors in `src/components/receipts/components/ReceiptActionButtons.tsx`
- 1 errors in `src/components/receipts/components/ExtractedItemsList.tsx`
- 1 errors in `src/components/receipts/components/ExtractedDataField.tsx`
- 1 errors in `src/components/receipts/ReceiptScanner.tsx`
- 1 errors in `src/components/onboarding/hooks/useTutorialSteps.ts`
- 1 errors in `src/components/modals/QuickFundForm.tsx`
- 1 errors in `src/components/modals/PasswordRotationModal.tsx`
- 1 errors in `src/components/modals/CorruptionRecoveryModal.tsx`
- 1 errors in `src/components/mobile/BottomNavigationBar.tsx`
- 1 errors in `src/components/layout/AppWrapper.tsx`
- 1 errors in `src/components/layout/AppRoutes.tsx`
- 1 errors in `src/components/history/BudgetHistoryViewer.tsx`
- 1 errors in `src/components/debt/ui/QuickPaymentForm.tsx`
- 1 errors in `src/components/debt/ui/DebtSummaryCards.tsx`
- 1 errors in `src/components/debt/ui/DebtProgressBar.tsx`
- 1 errors in `src/components/debt/ui/DebtCardProgressBar.tsx`
- 1 errors in `src/components/dashboard/AccountBalanceOverview.tsx`
- 1 errors in `src/components/charts/TrendLineChart.tsx`
- 1 errors in `src/components/budgeting/paycheck/PaycheckHistory.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeHistoryModal.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeActivitySummary.tsx`
- 1 errors in `src/components/budgeting/PaycheckProcessor.tsx`
- 1 errors in `src/components/budgeting/EditEnvelopeModal.tsx`
- 1 errors in `src/components/bills/BillViewTabs.tsx`
- 1 errors in `src/components/auth/components/UserSetupLayout.tsx`
- 1 errors in `src/components/auth/components/UserSetupHeader.tsx`
- 1 errors in `src/components/auth/components/UserNameInput.tsx`
- 1 errors in `src/components/auth/components/StepButtons.tsx`
- 1 errors in `src/components/auth/components/ShareCodeDisplay.tsx`
- 1 errors in `src/components/auth/components/ReturningUserActions.tsx`
- 1 errors in `src/components/auth/components/ColorPicker.tsx`
- 1 errors in `src/components/auth/UserSetup.tsx`
- 1 errors in `src/components/auth/ProfileSettings.tsx`
- 1 errors in `src/components/auth/PasswordRotationModal.tsx`
- 1 errors in `src/components/analytics/trends/SeasonalPatternsSection.tsx`
- 1 errors in `src/components/analytics/trends/CategoryTrendsSection.tsx`
- 1 errors in `src/components/analytics/tabs/TrendsTab.tsx`
- 1 errors in `src/components/analytics/tabs/OverviewTab.tsx`
- 1 errors in `src/components/analytics/tabs/HealthTab.tsx`
- 1 errors in `src/components/analytics/tabs/CategoriesTab.tsx`
- 1 errors in `src/components/analytics/performance/PerformanceTabContent.tsx`
- 1 errors in `src/components/analytics/performance/OverallScore.tsx`
- 1 errors in `src/components/analytics/performance/MetricsGrid.tsx`
- 1 errors in `src/components/analytics/components/TabContent.tsx`
- 1 errors in `src/components/analytics/TrendAnalysisCharts.tsx`
- 1 errors in `src/components/analytics/ChartsAndAnalytics.tsx`
- 1 errors in `src/components/analytics/CategorySettingsPanel.tsx`
- 1 errors in `src/components/analytics/CategoryNavigationTabs.tsx`
- 1 errors in `src/components/accounts/transfer/TransferFormFields.tsx`
- 1 errors in `src/components/accounts/form/AccountModalHeader.tsx`
- 1 errors in `src/components/accounts/form/AccountFormActions.tsx`
- 1 errors in `src/components/accounts/form/AccountFinancialFields.tsx`
- 1 errors in `src/components/accounts/form/AccountColorAndSettings.tsx`
- 1 errors in `src/components/accounts/AccountFormModal.tsx`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 2203 | `TS2339` |
| 180 | `TS6133` |
| 154 | `TS2345` |
| 118 | `TS2554` |
| 106 | `TS2708` |
| 103 | `TS2551` |
| 88 | `TS2322` |
| 36 | `TS2362` |
| 35 | `TS2363` |
| 19 | `TS2353` |
| 17 | `TS2739` |
| 17 | `TS2307` |
| 15 | `TS2365` |
| 12 | `TS2769` |
| 11 | `TS2304` |
| 10 | `TS2698` |
| 9 | `TS2741` |
| 8 | `TS2305` |
| 7 | `TS2613` |
| 6 | `TS2740` |
| 6 | `TS2448` |
| 4 | `TS2349` |
| 3 | `TS4104` |
| 3 | `TS2614` |
| 3 | `TS2538` |
| 2 | `TS2794` |
| 2 | `TS2717` |
| 2 | `TS2419` |
| 2 | `TS2352` |
| 2 | `TS1117` |
| 1 | `TS6196` |
| 1 | `TS2724` |
| 1 | `TS2719` |
| 1 | `TS2456` |
| 1 | `TS2440` |
| 1 | `TS2367` |

### Detailed Type Error Report
```
src/components/accounts/AccountCard.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/accounts/AccountCard.tsx(8,3): error TS6133: '_daysUntilExpiration' is declared but its value is never read.
src/components/accounts/AccountFormModal.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/accounts/form/AccountColorAndSettings.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/accounts/form/AccountFinancialFields.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/accounts/form/AccountFormActions.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/accounts/form/AccountModalHeader.tsx(10,3): error TS6133: '_lock' is declared but its value is never read.
src/components/accounts/SupplementalAccounts.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/accounts/SupplementalAccounts.tsx(35,5): error TS2339: Property '_releaseLock' does not exist on type '{ showAddModal: boolean; editingAccount: any; showBalances: boolean; showTransferModal: boolean; transferringAccount: any; accountForm: { name: string; type: string; currentBalance: string; ... 4 more ...; isActive: boolean; }; ... 21 more ...; getAccountTypeInfo: (type: any) => { ...; }; }'.
src/components/accounts/SupplementalAccounts.tsx(35,5): error TS6133: '_releaseLock' is declared but its value is never read.
src/components/accounts/transfer/TransferFormFields.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/AnalyticsSummaryCards.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/AnalyticsSummaryCards.tsx(10,11): error TS2339: Property 'totalExpenses' does not exist on type '{}'.
src/components/analytics/AnalyticsSummaryCards.tsx(10,30): error TS2339: Property 'envelopeUtilization' does not exist on type '{}'.
src/components/analytics/AnalyticsSummaryCards.tsx(10,55): error TS2339: Property 'savingsProgress' does not exist on type '{}'.
src/components/analytics/CategoryAdvancedTab.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/CategoryAdvancedTab.tsx(46,17): error TS2322: Type 'unknown' is not assignable to type 'Key'.
src/components/analytics/CategoryAdvancedTab.tsx(49,71): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/analytics/CategoryNavigationTabs.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/CategorySettingsPanel.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/ChartsAndAnalytics.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/components/TabContent.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/performance/MetricsGrid.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/performance/OverallScore.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/performance/PerformanceTabContent.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/SmartCategoryManager.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/SmartCategoryManager.tsx(16,3): error TS6133: '_currentCategories' is declared but its value is never read.
src/components/analytics/SmartCategoryManager.tsx(19,3): error TS6133: '_onUpdateCategory' is declared but its value is never read.
src/components/analytics/tabs/CategoriesTab.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/tabs/HealthTab.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/tabs/OverviewTab.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/tabs/TrendsTab.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/TrendAnalysisCharts.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/trends/CategoryTrendsSection.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/analytics/trends/SeasonalPatternsSection.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/auth/__tests__/UserSetup.test.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/auth/__tests__/UserSetup.test.tsx(2,1): error TS6133: 'Select' is declared but its value is never read.
src/components/auth/__tests__/UserSetup.test.tsx(3,1): error TS6133: 'Button' is declared but its value is never read.
src/components/auth/__tests__/UserSetup.test.tsx(101,18): error TS2339: Property 'mockReturnValue' does not exist on type '(onSetupComplete: any) => { step: number; masterPassword: string; userName: string; userColor: string; showPassword: boolean; isLoading: boolean; isReturningUser: boolean; shareCode: string; ... 12 more ...; handleWithTimeout: (asyncFn: any, timeoutMs?: number) => Promise<...>; }'.
src/components/auth/__tests__/UserSetup.test.tsx(122,18): error TS2339: Property 'mockReturnValue' does not exist on type '(onSetupComplete: any) => { step: number; masterPassword: string; userName: string; userColor: string; showPassword: boolean; isLoading: boolean; isReturningUser: boolean; shareCode: string; ... 12 more ...; handleWithTimeout: (asyncFn: any, timeoutMs?: number) => Promise<...>; }'.
src/components/auth/__tests__/UserSetup.test.tsx(135,18): error TS2339: Property 'mockReturnValue' does not exist on type '(onSetupComplete: any) => { step: number; masterPassword: string; userName: string; userColor: string; showPassword: boolean; isLoading: boolean; isReturningUser: boolean; shareCode: string; ... 12 more ...; handleWithTimeout: (asyncFn: any, timeoutMs?: number) => Promise<...>; }'.
src/components/auth/__tests__/UserSetup.test.tsx(149,18): error TS2339: Property 'mockReturnValue' does not exist on type '(onSetupComplete: any) => { step: number; masterPassword: string; userName: string; userColor: string; showPassword: boolean; isLoading: boolean; isReturningUser: boolean; shareCode: string; ... 12 more ...; handleWithTimeout: (asyncFn: any, timeoutMs?: number) => Promise<...>; }'.
src/components/auth/__tests__/UserSetup.test.tsx(175,18): error TS2339: Property 'mockReturnValue' does not exist on type '(onSetupComplete: any) => { step: number; masterPassword: string; userName: string; userColor: string; showPassword: boolean; isLoading: boolean; isReturningUser: boolean; shareCode: string; ... 12 more ...; handleWithTimeout: (asyncFn: any, timeoutMs?: number) => Promise<...>; }'.
src/components/auth/components/ColorPicker.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/auth/components/ReturningUserActions.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/auth/components/ShareCodeDisplay.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/auth/components/StepButtons.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/auth/components/UserNameInput.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/auth/components/UserSetupHeader.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/auth/components/UserSetupLayout.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/auth/PasswordRotationModal.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/auth/ProfileSettings.tsx(65,19): error TS2554: Expected 3 arguments, but got 2.
src/components/auth/UserIndicator.tsx(7,31): error TS2339: Property 'currentUser' does not exist on type '{}'.
src/components/auth/UserIndicator.tsx(7,44): error TS2339: Property 'onUserChange' does not exist on type '{}'.
src/components/auth/UserIndicator.tsx(7,58): error TS2339: Property 'onUpdateProfile' does not exist on type '{}'.
src/components/auth/UserSetup.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/automation/AutoFundingDashboard.tsx(97,36): error TS2339: Property 'execution' does not exist on type '{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; }'.
  Property 'execution' does not exist on type '{ success: boolean; error: any; }'.
src/components/automation/AutoFundingDashboard.tsx(98,38): error TS2339: Property 'execution' does not exist on type '{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; }'.
  Property 'execution' does not exist on type '{ success: boolean; error: any; }'.
src/components/automation/AutoFundingRuleBuilder.tsx(103,12): error TS2741: Property 'onStepChange' is missing in type '{ currentStep: any; }' but required in type '{ currentStep: any; onStepChange: any; }'.
src/components/automation/AutoFundingRuleBuilder.tsx(164,46): error TS2339: Property 'name' does not exist on type '{}'.
src/components/automation/AutoFundingRuleBuilder.tsx(167,46): error TS2339: Property 'type' does not exist on type '{}'.
src/components/automation/AutoFundingView.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/automation/AutoFundingView.tsx(46,19): error TS2554: Expected 3 arguments, but got 2.
src/components/automation/AutoFundingView.tsx(100,41): error TS2345: Argument of type '{ trigger: string; currentDate: string; data: { envelopes: any; unassignedCash: any; transactions: any; }; }' is not assignable to parameter of type 'string'.
src/components/automation/AutoFundingView.tsx(103,36): error TS2339: Property 'execution' does not exist on type '{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; }'.
  Property 'execution' does not exist on type '{ success: boolean; error: any; }'.
src/components/automation/AutoFundingView.tsx(104,38): error TS2339: Property 'execution' does not exist on type '{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; }'.
  Property 'execution' does not exist on type '{ success: boolean; error: any; }'.
src/components/automation/AutoFundingView.tsx(107,23): error TS2554: Expected 3 arguments, but got 2.
src/components/automation/AutoFundingView.tsx(112,23): error TS2554: Expected 3 arguments, but got 2.
src/components/automation/steps/RuleConfigurationStep.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/automation/steps/RuleConfigurationStep.tsx(38,11): error TS2322: Type '{ ruleData: any; updateConfig: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }' is not assignable to type 'IntrinsicAttributes & { ruleData: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }'.
  Property 'updateConfig' does not exist on type 'IntrinsicAttributes & { ruleData: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }'.
src/components/bills/AddBillModal.tsx(8,8): error TS6133: 'React' is declared but its value is never read.
src/components/bills/AddBillModal.tsx(169,9): error TS2322: Type '{ formData: BillFormData; updateField: (field: keyof BillFormData, value: string | boolean) => void; canEdit: boolean; editingBill: any; handleSubmit: (e: FormEvent<...>) => Promise<...>; ... 8 more ...; onDeleteClick: () => Promise<...>; }' is not assignable to type 'IntrinsicAttributes & { formData: any; updateField: any; canEdit: any; editingBill: any; handleSubmit: any; isSubmitting: any; onClose: any; suggestedIconName: any; ... 4 more ...; getNextDueDate: any; }'.
  Property 'onDeleteClick' does not exist on type 'IntrinsicAttributes & { formData: any; updateField: any; canEdit: any; editingBill: any; handleSubmit: any; isSubmitting: any; onClose: any; suggestedIconName: any; ... 4 more ...; getNextDueDate: any; }'.
src/components/bills/BillManager.tsx(78,5): error TS2353: Object literal may only specify known properties, and 'onUpdateBill' does not exist in type '{ propTransactions?: any[]; propEnvelopes?: any[]; }'.
src/components/bills/BillManager.tsx(111,35): error TS2339: Property 'currentEditor' does not exist on type '{ lock: any; isLocked: boolean; isOwnLock: boolean; isLoading: boolean; canEdit: boolean; lockedBy: any; expiresAt: any; acquireLock: () => Promise<{ success: boolean; reason: string; lockedBy: any; expiresAt: any; } | { ...; } | { ...; } | { ...; } | { ...; }>; releaseLock: () => Promise<...>; breakLock: () => Prom...'.
src/components/bills/BillManager.tsx(174,11): error TS2322: Type '{ isOpen: true; onClose: () => void; editingBill: any; availableEnvelopes: any; onAddBill: UseMutateFunction<any, Error, void, { previousBills: unknown; }>; onUpdateBill: UseMutateFunction<...>; onDeleteBill: UseMutateFunction<...>; onError: any; }' is not assignable to type 'IntrinsicAttributes & { isOpen: any; onClose: any; onAddBill: any; onUpdateBill: any; onDeleteBill: any; onError: any; editingBill?: any; _forceMobileMode?: boolean; }'.
  Property 'availableEnvelopes' does not exist on type 'IntrinsicAttributes & { isOpen: any; onClose: any; onAddBill: any; onUpdateBill: any; onDeleteBill: any; onError: any; editingBill?: any; _forceMobileMode?: boolean; }'.
src/components/bills/BillManager.tsx(189,11): error TS2322: Type '{ isOpen: true; onClose: () => void; selectedBills: Bill[]; availableEnvelopes: any; onUpdateBills: (updatedBills: any) => Promise<void>; onError: any; }' is not assignable to type 'IntrinsicAttributes & { isOpen: any; onClose: any; selectedBills?: any[]; onUpdateBills: any; onError: any; }'.
  Property 'availableEnvelopes' does not exist on type 'IntrinsicAttributes & { isOpen: any; onClose: any; selectedBills?: any[]; onUpdateBills: any; onError: any; }'.
src/components/bills/BillManager.tsx(202,11): error TS2322: Type '{ isOpen: true; onClose: () => void; discoveredBills: any[]; existingBills: Bill[]; availableEnvelopes: any; onAddBills: (billsToAdd: any) => Promise<void>; onError: any; }' is not assignable to type 'IntrinsicAttributes & { isOpen: any; onClose: any; discoveredBills?: any[]; onAddBills: any; onError: any; availableEnvelopes?: any[]; }'.
  Property 'existingBills' does not exist on type 'IntrinsicAttributes & { isOpen: any; onClose: any; discoveredBills?: any[]; onAddBills: any; onError: any; availableEnvelopes?: any[]; }'.
src/components/bills/BillManager.tsx(230,11): error TS2322: Type '{ isOpen: boolean; onClose: () => void; objectId: any; objectType: string; title: string; }' is not assignable to type 'IntrinsicAttributes & { objectId: any; objectType: any; objectName: any; onClose: any; }'.
  Property 'isOpen' does not exist on type 'IntrinsicAttributes & { objectId: any; objectType: any; objectName: any; onClose: any; }'.
src/components/bills/BillSummaryCards.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/bills/BillSummaryCards.tsx(15,26): error TS2339: Property 'total' does not exist on type '{}'.
src/components/bills/BillSummaryCards.tsx(17,26): error TS2339: Property 'totalCount' does not exist on type '{}'.
src/components/bills/BillSummaryCards.tsx(23,26): error TS2339: Property 'overdue' does not exist on type '{}'.
src/components/bills/BillSummaryCards.tsx(25,26): error TS2339: Property 'overdueCount' does not exist on type '{}'.
src/components/bills/BillSummaryCards.tsx(26,22): error TS2339: Property 'overdueCount' does not exist on type '{}'.
src/components/bills/BillSummaryCards.tsx(32,26): error TS2339: Property 'paid' does not exist on type '{}'.
src/components/bills/BillSummaryCards.tsx(34,26): error TS2339: Property 'paidCount' does not exist on type '{}'.
src/components/bills/BillSummaryCards.tsx(40,26): error TS2339: Property 'upcoming' does not exist on type '{}'.
src/components/bills/BillSummaryCards.tsx(42,26): error TS2339: Property 'upcomingCount' does not exist on type '{}'.
src/components/bills/BillViewTabs.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(175,41): error TS2339: Property 'envelope' does not exist on type '{}'.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(175,51): error TS2339: Property 'bills' does not exist on type '{}'.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(175,63): error TS2339: Property 'showDetails' does not exist on type '{}'.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(183,5): error TS2339: Property 'nextBill' does not exist on type '{ priority: { priority: number; priorityLevel: string; reason: string; }; status: any; displayText: { primaryStatus: string; secondaryStatus: string; fundingProgress: string; }; isValidBillEnvelope: boolean; ... 6 more ...; linkedBills: any[]; } | { ...; }'.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(188,5): error TS2339: Property 'currentBalance' does not exist on type '{ priority: { priority: number; priorityLevel: string; reason: string; }; status: any; displayText: { primaryStatus: string; secondaryStatus: string; fundingProgress: string; }; isValidBillEnvelope: boolean; ... 6 more ...; linkedBills: any[]; } | { ...; }'.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(189,5): error TS2339: Property 'targetMonthlyAmount' does not exist on type '{ priority: { priority: number; priorityLevel: string; reason: string; }; status: any; displayText: { primaryStatus: string; secondaryStatus: string; fundingProgress: string; }; isValidBillEnvelope: boolean; ... 6 more ...; linkedBills: any[]; } | { ...; }'.
src/components/budgeting/BillEnvelopeFundingInfo.tsx(190,5): error TS2339: Property 'upcomingBillsAmount' does not exist on type '{ priority: { priority: number; priorityLevel: string; reason: string; }; status: any; displayText: { primaryStatus: string; secondaryStatus: string; fundingProgress: string; }; isValidBillEnvelope: boolean; ... 6 more ...; linkedBills: any[]; } | { ...; }'.
src/components/budgeting/CreateEnvelopeModal.tsx(84,9): error TS2322: Type '{ formData: { name: string; monthlyAmount: string; currentBalance: string; category: string; color: string; frequency: string; description: string; priority: string; autoAllocate: boolean; icon: string; envelopeType: "variable"; monthlyBudget: string; biweeklyAllocation: string; targetAmount: string; }; errors: {}; ...' is not assignable to type 'IntrinsicAttributes & { formData: any; onUpdateField: any; errors?: {}; canEdit?: boolean; }'.
  Property 'disabled' does not exist on type 'IntrinsicAttributes & { formData: any; onUpdateField: any; errors?: {}; canEdit?: boolean; }'.
src/components/budgeting/CreateEnvelopeModal.tsx(93,9): error TS2322: Type '{ formData: { name: string; monthlyAmount: string; currentBalance: string; category: string; color: string; frequency: string; description: string; priority: string; autoAllocate: boolean; icon: string; envelopeType: "variable"; monthlyBudget: string; biweeklyAllocation: string; targetAmount: string; }; ... 4 more ....' is not assignable to type 'IntrinsicAttributes & { formData: any; onUpdateField: any; errors?: {}; calculatedAmounts?: {}; canEdit?: boolean; }'.
  Property 'disabled' does not exist on type 'IntrinsicAttributes & { formData: any; onUpdateField: any; errors?: {}; calculatedAmounts?: {}; canEdit?: boolean; }'.
src/components/budgeting/CreateEnvelopeModal.tsx(108,36): error TS2339: Property 'billId' does not exist on type '{ name: string; monthlyAmount: string; currentBalance: string; category: string; color: string; frequency: string; description: string; priority: string; autoAllocate: boolean; icon: string; envelopeType: "variable"; monthlyBudget: string; biweeklyAllocation: string; targetAmount: string; }'.
src/components/budgeting/EditEnvelopeModal.tsx(88,25): error TS2367: This comparison appears to be unintentional because the types '"variable"' and '"savings"' have no overlap.
src/components/budgeting/envelope/EnvelopeActivitySummary.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(27,20): error TS2339: Property 'name' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(32,17): error TS2339: Property 'name' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(37,21): error TS2339: Property 'name' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(50,20): error TS2339: Property 'category' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(60,17): error TS2339: Property 'category' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(65,21): error TS2339: Property 'category' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(86,17): error TS2339: Property 'description' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBasicFields.tsx(91,21): error TS2339: Property 'description' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(10,39): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(93,66): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(105,10): error TS2741: Property 'icon' is missing in type '{ label: string; value: any; onChange: (e: any) => any; error: any; canEdit: boolean; required: true; hint: string; }' but required in type '{ label: any; value: any; onChange: any; error: any; canEdit: any; hint: any; icon: any; required: any; }'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(109,25): error TS2339: Property 'monthlyAmount' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(113,31): error TS2339: Property 'biweeklyAllocation' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(114,49): error TS2339: Property 'biweeklyAllocation' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(119,10): error TS2739: Type '{ label: string; value: any; onChange: (e: any) => any; error: any; canEdit: boolean; }' is missing the following properties from type '{ label: any; value: any; onChange: any; error: any; canEdit: any; hint: any; icon: any; required: any; }': hint, icon, required
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(123,25): error TS2339: Property 'currentBalance' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(129,10): error TS2741: Property 'hint' is missing in type '{ label: string; icon: string; value: any; onChange: (e: any) => any; error: any; canEdit: boolean; required: true; }' but required in type '{ label: any; value: any; onChange: any; error: any; canEdit: any; hint: any; icon: any; required: any; }'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(134,25): error TS2339: Property 'targetAmount' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeBudgetFields.tsx(144,25): error TS2339: Property 'frequency' does not exist on type '{}'.
src/components/budgeting/envelope/EnvelopeHistoryModal.tsx(48,15): error TS2322: Type '{ objectType: string; objectId: any; objectName: any; showModal: boolean; }' is not assignable to type 'IntrinsicAttributes & { objectId: any; objectType: any; objectName: any; onClose: any; }'.
  Property 'showModal' does not exist on type 'IntrinsicAttributes & { objectId: any; objectType: any; objectName: any; onClose: any; }'.
src/components/budgeting/envelope/EnvelopeItem.tsx(180,37): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/budgeting/envelope/EnvelopeItem.tsx(180,59): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/budgeting/envelope/EnvelopeItem.tsx(199,55): error TS2339: Property 'currentBalance' does not exist on type '{ priority: { priority: number; priorityLevel: string; reason: string; }; status: any; displayText: { primaryStatus: string; secondaryStatus: string; fundingProgress: string; }; isValidBillEnvelope: boolean; ... 6 more ...; linkedBills: any[]; } | { ...; }'.
src/components/budgeting/envelope/EnvelopeItem.tsx(199,71): error TS2339: Property 'targetMonthlyAmount' does not exist on type '{ priority: { priority: number; priorityLevel: string; reason: string; }; status: any; displayText: { primaryStatus: string; secondaryStatus: string; fundingProgress: string; }; isValidBillEnvelope: boolean; ... 6 more ...; linkedBills: any[]; } | { ...; }'.
src/components/budgeting/envelope/EnvelopeItem.tsx(265,25): error TS2339: Property 'nextBill' does not exist on type '{ priority: { priority: number; priorityLevel: string; reason: string; }; status: any; displayText: { primaryStatus: string; secondaryStatus: string; fundingProgress: string; }; isValidBillEnvelope: boolean; ... 6 more ...; linkedBills: any[]; } | { ...; }'.
src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx(38,63): error TS2339: Property 'balanceLabel' does not exist on type '{ primaryStatus: string; secondaryStatus: string; fundingProgress: string; } | { primaryStatus: string; secondaryStatus: string; fundingProgress: string; }'.
  Property 'balanceLabel' does not exist on type '{ primaryStatus: string; secondaryStatus: string; fundingProgress: string; }'.
src/components/budgeting/envelope/EnvelopeSummary.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/budgeting/envelope/EnvelopeSummary.tsx(7,45): error TS2322: Type '{ totals: any; unassignedCash: number; }' is not assignable to type 'IntrinsicAttributes & { totals?: {}; _unassignedCash?: number; }'.
  Property 'unassignedCash' does not exist on type 'IntrinsicAttributes & { totals?: {}; _unassignedCash?: number; }'. Did you mean '_unassignedCash'?
src/components/budgeting/EnvelopeGrid.tsx(2,8): error TS6133: 'React' is declared but its value is never read.
src/components/budgeting/EnvelopeGrid.tsx(35,13): error TS2739: Type '{ type: string; onAction: () => any; }' is missing the following properties from type '{ type: any; onAction: any; customMessage: any; customActions: any; }': customMessage, customActions
src/components/budgeting/EnvelopeGrid.tsx(74,9): error TS2322: Type '{ isOpen: any; onClose: () => any; onCreateEnvelope: any; existingEnvelopes: any; currentUser: any; unassignedCash: any; }' is not assignable to type 'IntrinsicAttributes & { isOpen?: boolean; onClose: any; onCreateEnvelope: any; onCreateBill: any; existingEnvelopes?: any[]; allBills?: any[]; currentUser?: { userName: string; userColor: string; }; _forceMobileMode?: boolean; }'.
  Property 'unassignedCash' does not exist on type 'IntrinsicAttributes & { isOpen?: boolean; onClose: any; onCreateEnvelope: any; onCreateBill: any; existingEnvelopes?: any[]; allBills?: any[]; currentUser?: { userName: string; userColor: string; }; _forceMobileMode?: boolean; }'.
src/components/budgeting/EnvelopeGrid.tsx(85,9): error TS2322: Type '{ isOpen: boolean; onClose: () => any; envelope: any; onUpdateEnvelope: any; onDeleteEnvelope: any; onUpdateBill: (bill: any) => void; existingEnvelopes: any; allBills: any; currentUser: any; }' is not assignable to type 'IntrinsicAttributes & { isOpen?: boolean; onClose: any; envelope: any; onUpdateEnvelope: any; onDeleteEnvelope: any; existingEnvelopes?: any[]; currentUser?: { userName: string; userColor: string; }; _forceMobileMode?: boolean; }'.
  Property 'onUpdateBill' does not exist on type 'IntrinsicAttributes & { isOpen?: boolean; onClose: any; envelope: any; onUpdateEnvelope: any; onDeleteEnvelope: any; existingEnvelopes?: any[]; currentUser?: { userName: string; userColor: string; }; _forceMobileMode?: boolean; }'.
src/components/budgeting/EnvelopeGrid.tsx(154,7): error TS2322: Type '{ isPulling: any; isRefreshing: any; pullProgress: any; isReady: any; pullRotation: any; }' is not assignable to type 'IntrinsicAttributes & { isVisible: any; isRefreshing: any; pullProgress: any; pullRotation: any; isReady: any; }'.
  Property 'isPulling' does not exist on type 'IntrinsicAttributes & { isVisible: any; isRefreshing: any; pullProgress: any; pullRotation: any; isReady: any; }'.
src/components/budgeting/EnvelopeGrid.tsx(192,6): error TS2740: Type '{}' is missing the following properties from type '{ showCreateModal: any; setShowCreateModal: any; handleCreateEnvelope: any; envelopes: any; budget: any; unassignedCash: any; editingEnvelope: any; setEditingEnvelope: any; handleUpdateEnvelope: any; ... 7 more ...; handleQuickFundConfirm: any; }': showCreateModal, setShowCreateModal, handleCreateEnvelope, envelopes, and 13 more.
src/components/budgeting/EnvelopeGrid.tsx(298,11): error TS2339: Property 'data' does not exist on type '{ isLoading: false; isFetching: boolean; isError: boolean; error: Error; addTransaction: UseMutateFunction<any, Error, void, unknown>; addTransactionAsync: UseMutateAsyncFunction<...>; ... 28 more ...; transactions: any; }'.
src/components/budgeting/EnvelopeSummaryCards.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/budgeting/EnvelopeSummaryCards.tsx(9,46): error TS6133: '_unassignedCash' is declared but its value is never read.
src/components/budgeting/EnvelopeSummaryCards.tsx(11,37): error TS2339: Property 'totalBalance' does not exist on type '{}'.
src/components/budgeting/EnvelopeSummaryCards.tsx(11,66): error TS2339: Property 'totalUpcoming' does not exist on type '{}'.
src/components/budgeting/EnvelopeSummaryCards.tsx(18,26): error TS2339: Property 'totalAllocated' does not exist on type '{}'.
src/components/budgeting/EnvelopeSummaryCards.tsx(20,26): error TS2339: Property 'envelopeCount' does not exist on type '{}'.
src/components/budgeting/EnvelopeSummaryCards.tsx(26,26): error TS2339: Property 'totalBalance' does not exist on type '{}'.
src/components/budgeting/EnvelopeSummaryCards.tsx(35,26): error TS2339: Property 'totalSpent' does not exist on type '{}'.
src/components/budgeting/EnvelopeSummaryCards.tsx(43,26): error TS2339: Property 'totalBiweeklyNeed' does not exist on type '{}'.
src/components/budgeting/EnvelopeSummaryCards.tsx(45,26): error TS2339: Property 'billsDueCount' does not exist on type '{}'.
src/components/budgeting/EnvelopeSystem.tsx(5,10): error TS2614: Module '"../../hooks/bills/useBills"' has no exported member 'useBills'. Did you mean to use 'import useBills from "../../hooks/bills/useBills"' instead?
src/components/budgeting/EnvelopeSystem.tsx(7,10): error TS2305: Module '"../../constants/categories"' has no exported member 'FREQUENCY_MULTIPLIERS'.
src/components/budgeting/EnvelopeSystem.tsx(7,33): error TS2305: Module '"../../constants/categories"' has no exported member 'BIWEEKLY_MULTIPLIER'.
src/components/budgeting/EnvelopeSystem.tsx(145,30): error TS2345: Argument of type '{ id: any; updates: any; }' is not assignable to parameter of type 'void'.
src/components/budgeting/paycheck/PaycheckHistory.tsx(92,47): error TS2554: Expected 0 arguments, but got 1.
src/components/budgeting/PaycheckProcessor.tsx(63,9): error TS2322: Type '{ paycheckHistory: any[]; onDeletePaycheck: (paycheck: any) => Promise<void>; deletingPaycheckId: any; }' is not assignable to type 'IntrinsicAttributes & { paycheckHistory?: any[]; paycheckStats: any; onSelectPaycheck?: () => void; }'.
  Property 'onDeletePaycheck' does not exist on type 'IntrinsicAttributes & { paycheckHistory?: any[]; paycheckStats: any; onSelectPaycheck?: () => void; }'. Did you mean 'onSelectPaycheck'?
src/components/charts/CategoryBarChart.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/charts/CategoryBarChart.tsx(93,12): error TS2769: No overload matches this call.
  Overload 1 of 2, '(props: Props): XAxis', gave the following error.
    Type '{ fontSize: number; tickFormatter: (value: any) => string; type: string; stroke: any; dataKey?: undefined; } | { fontSize: number; tickFormatter: (value: any) => string; dataKey: string; stroke: any; type?: undefined; }' is not assignable to type 'IntrinsicAttributes & IntrinsicClassAttributes<XAxis> & Pick<Readonly<Props>, "string" | "mode" | ... 283 more ... | "AxisComp"> & InexactPartial<...> & InexactPartial<...>'.
      Type '{ fontSize: number; tickFormatter: (value: any) => string; type: string; stroke: any; dataKey?: undefined; }' is not assignable to type 'InexactPartial<Pick<Readonly<Props>, "type" | "orientation" | "hide" | "height" | "scale" | "xAxisId" | "mirror" | "padding" | "reversed" | "tickCount" | "allowDataOverflow" | "allowDuplicatedCategory" | "allowDecimals">>'.
        Types of property 'type' are incompatible.
          Type 'string' is not assignable to type '"number" | "category"'.
  Overload 2 of 2, '(props: Props, context: any): XAxis', gave the following error.
    Type '{ fontSize: number; tickFormatter: (value: any) => string; type: string; stroke: any; dataKey?: undefined; } | { fontSize: number; tickFormatter: (value: any) => string; dataKey: string; stroke: any; type?: undefined; }' is not assignable to type 'IntrinsicAttributes & IntrinsicClassAttributes<XAxis> & Pick<Readonly<Props>, "string" | "mode" | ... 283 more ... | "AxisComp"> & InexactPartial<...> & InexactPartial<...>'.
      Type '{ fontSize: number; tickFormatter: (value: any) => string; type: string; stroke: any; dataKey?: undefined; }' is not assignable to type 'InexactPartial<Pick<Readonly<Props>, "type" | "orientation" | "hide" | "height" | "scale" | "xAxisId" | "mirror" | "padding" | "reversed" | "tickCount" | "allowDataOverflow" | "allowDuplicatedCategory" | "allowDecimals">>'.
        Types of property 'type' are incompatible.
          Type 'string' is not assignable to type '"number" | "category"'.
src/components/charts/CategoryBarChart.tsx(98,12): error TS2769: No overload matches this call.
  Overload 1 of 2, '(props: Props): YAxis', gave the following error.
    Type '{ fontSize: number; tickFormatter: (value: any) => string; dataKey: string; type: string; stroke: any; width: number; } | { fontSize: number; tickFormatter: (value: any) => string; stroke: any; dataKey?: undefined; type?: undefined; width?: undefined; }' is not assignable to type 'IntrinsicAttributes & IntrinsicClassAttributes<YAxis> & Pick<Readonly<Props>, never> & InexactPartial<...> & InexactPartial<...>'.
      Type '{ fontSize: number; tickFormatter: (value: any) => string; dataKey: string; type: string; stroke: any; width: number; }' is not assignable to type 'InexactPartial<Pick<Readonly<Props>, "string" | "mode" | "id" | "version" | "r" | "x" | "fill" | "filter" | "values" | "style" | "alphabetic" | "hanging" | "ideographic" | "in" | ... 253 more ... | keyof YAxisProps>>'.
        Types of property 'type' are incompatible.
          Type 'string' is not assignable to type '"number" | "category"'.
  Overload 2 of 2, '(props: Props, context: any): YAxis', gave the following error.
    Type '{ fontSize: number; tickFormatter: (value: any) => string; dataKey: string; type: string; stroke: any; width: number; } | { fontSize: number; tickFormatter: (value: any) => string; stroke: any; dataKey?: undefined; type?: undefined; width?: undefined; }' is not assignable to type 'IntrinsicAttributes & IntrinsicClassAttributes<YAxis> & Pick<Readonly<Props>, never> & InexactPartial<...> & InexactPartial<...>'.
      Type '{ fontSize: number; tickFormatter: (value: any) => string; dataKey: string; type: string; stroke: any; width: number; }' is not assignable to type 'InexactPartial<Pick<Readonly<Props>, "string" | "mode" | "id" | "version" | "r" | "x" | "fill" | "filter" | "values" | "style" | "alphabetic" | "hanging" | "ideographic" | "in" | ... 253 more ... | keyof YAxisProps>>'.
        Types of property 'type' are incompatible.
          Type 'string' is not assignable to type '"number" | "category"'.
src/components/charts/ComposedFinancialChart.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/charts/ComposedFinancialChart.tsx(183,11): error TS2739: Type '{ title: string; data: any; series: ({ type: string; dataKey: string; name: string; fill: string; stroke?: undefined; strokeWidth?: undefined; } | { type: string; dataKey: string; name: string; stroke: string; strokeWidth: number; fill?: undefined; })[]; }' is missing the following properties from type '{ [x: string]: any; title?: string; subtitle: any; data?: any[]; series?: any[]; height?: number; className?: string; loading?: boolean; error?: any; emptyMessage?: string; actions: any; showGrid?: boolean; showLegend?: boolean; formatTooltip: any; xAxisKey?: string; }': subtitle, actions, formatTooltip
src/components/charts/ComposedFinancialChart.tsx(209,6): error TS2739: Type '{ title: string; data: any; series: { type: string; dataKey: string; name: string; fill: string; }[]; xAxisKey: string; }' is missing the following properties from type '{ [x: string]: any; title?: string; subtitle: any; data?: any[]; series?: any[]; height?: number; className?: string; loading?: boolean; error?: any; emptyMessage?: string; actions: any; showGrid?: boolean; showLegend?: boolean; formatTooltip: any; xAxisKey?: string; }': subtitle, actions, formatTooltip
src/components/charts/DistributionPieChart.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/charts/DistributionPieChart.tsx(142,8): error TS2739: Type '{ title: any; subtitle: any; data: any[]; dataKey: string; nameKey: string; className: string; showLegend: false; outerRadius: number; }' is missing the following properties from type '{ [x: string]: any; title?: string; subtitle: any; data?: any[]; dataKey?: string; nameKey?: string; height?: number; className?: string; loading?: boolean; error?: any; emptyMessage?: string; actions: any; showLegend?: boolean; ... 5 more ...; maxItems?: number; }': actions, formatTooltip, labelFormatter
src/components/charts/TrendLineChart.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/dashboard/AccountBalanceOverview.tsx(58,13): error TS2322: Type '{ value: any; onChange: any; title: string; subtitle: string; className: string; currencyClassName: string; subtitleClassName: string; }' is not assignable to type 'IntrinsicAttributes & { value: any; onChange: any; title?: string; subtitle?: string; className?: string; colorClass?: string; bgClass?: string; hoverClass?: string; isManuallySet?: boolean; confirmThreshold?: number; formatCurrency?: boolean; }'.
  Property 'currencyClassName' does not exist on type 'IntrinsicAttributes & { value: any; onChange: any; title?: string; subtitle?: string; className?: string; colorClass?: string; bgClass?: string; hoverClass?: string; isManuallySet?: boolean; confirmThreshold?: number; formatCurrency?: boolean; }'.
src/components/debt/DebtDashboard.tsx(116,18): error TS2739: Type '{ filterOptions: { type: string; status: string; sortBy: string; sortOrder: string; }; setFilterOptions: Dispatch<SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>>; }' is missing the following properties from type '{ filterOptions: any; setFilterOptions: any; debtTypes: any; debtsByType: any; }': debtTypes, debtsByType
src/components/debt/DebtDashboard.tsx(187,10): error TS2741: Property '_onLinkToBill' is missing in type '{ debt: any; isOpen: boolean; onClose: () => void; onDelete: (debtId: any) => Promise<void>; onRecordPayment: (debtId: any, paymentData: any) => Promise<void>; onEdit: (debt: any) => void; }' but required in type '{ debt: any; isOpen: any; onClose: any; onDelete: any; onRecordPayment: any; _onLinkToBill: any; onEdit: any; }'.
src/components/debt/modals/AddDebtModal.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/debt/modals/AddDebtModal.tsx(63,11): error TS2322: Type '{ formData: { name: string; creditor: string; type: "personal"; currentBalance: string; originalBalance: string; interestRate: string; minimumPayment: string; paymentFrequency: "monthly"; paymentDueDate: string; ... 5 more ...; newEnvelopeName: string; }; ... 12 more ...; debtMetrics: DebtMetrics; }' is not assignable to type 'IntrinsicAttributes & { formData: any; setFormData: any; errors: any; canEdit: any; isEditMode: any; isSubmitting: any; handleFormSubmit: any; onClose: any; bills: any; billsLoading: any; }'.
  Property 'envelopes' does not exist on type 'IntrinsicAttributes & { formData: any; setFormData: any; errors: any; canEdit: any; isEditMode: any; isSubmitting: any; handleFormSubmit: any; onClose: any; bills: any; billsLoading: any; }'.
src/components/debt/modals/DebtDetailModal.tsx(19,3): error TS6133: '_onLinkToBill' is declared but its value is never read.
src/components/debt/modals/DebtDetailModal.tsx(36,32): error TS2554: Expected 1 arguments, but got 6.
src/components/debt/modals/DebtFormFields.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/debt/modals/DebtFormFields.tsx(79,25): error TS2339: Property 'label' does not exist on type 'DebtTypeConfig'.
src/components/debt/modals/DebtFormFields.tsx(220,34): error TS2339: Property 'map' does not exist on type '{ readonly WEEKLY: "weekly"; readonly BIWEEKLY: "biweekly"; readonly MONTHLY: "monthly"; readonly QUARTERLY: "quarterly"; readonly ANNUALLY: "annually"; }'.
src/components/debt/ui/DebtCardProgressBar.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/debt/ui/DebtFilters.tsx(70,51): error TS2538: Type 'unknown' cannot be used as an index type.
src/components/debt/ui/DebtFilters.tsx(71,45): error TS2538: Type 'unknown' cannot be used as an index type.
src/components/debt/ui/DebtFilters.tsx(73,29): error TS2322: Type 'unknown' is not assignable to type 'Key'.
src/components/debt/ui/DebtFilters.tsx(73,40): error TS2322: Type 'unknown' is not assignable to type 'string | number | readonly string[]'.
src/components/debt/ui/DebtList.tsx(26,36): error TS6133: '_onRecordPayment' is declared but its value is never read.
src/components/debt/ui/DebtList.tsx(79,45): error TS2339: Property 'name' does not exist on type '{ bgColor: string; textColor: string; }'.
src/components/debt/ui/DebtList.tsx(101,32): error TS2339: Property 'display' does not exist on type '{}'.
src/components/debt/ui/DebtList.tsx(115,71): error TS2339: Property 'label' does not exist on type '{}'.
src/components/debt/ui/DebtList.tsx(117,36): error TS2339: Property 'hasIcon' does not exist on type '{}'.
src/components/debt/ui/DebtList.tsx(119,40): error TS2339: Property 'type' does not exist on type '{}'.
src/components/debt/ui/DebtList.tsx(126,40): error TS2339: Property 'value' does not exist on type '{}'.
src/components/debt/ui/DebtList.tsx(137,28): error TS2339: Property 'hasRelationships' does not exist on type 'any[]'.
src/components/debt/ui/DebtList.tsx(139,32): error TS2339: Property 'items' does not exist on type 'any[]'.
src/components/debt/ui/DebtProgressBar.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/debt/ui/DebtSummaryCards.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/debt/ui/DebtSummaryWidget.tsx(12,22): error TS2339: Property '_debts' does not exist on type '{ debts: DebtAccount[]; debtStats: { totalDebt: number; totalMonthlyPayments: number; averageInterestRate: number; debtsByType: {}; totalInterestPaid: number; activeDebtCount: number; totalDebtCount: number; dueSoonAmount: number; dueSoonCount: number; }; ... 12 more ...; COMPOUND_FREQUENCIES: { ...; }; }'.
src/components/debt/ui/DebtSummaryWidget.tsx(12,22): error TS6133: '_debts' is declared but its value is never read.
src/components/debt/ui/QuickPaymentForm.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/dev/DevAuthBypass.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/dev/DevAuthBypass.tsx(63,12): error TS2339: Property 'setAuthState' does not exist on type '{ shouldShowAuthGateway: () => boolean; _internal: { authFlow: { isUnlocked: boolean; encryptionKey: CryptoKey; currentUser: UserData; budgetId: string; salt: Uint8Array<ArrayBufferLike>; handleSetup: (userDataOrPassword: any) => Promise<...>; handleLogout: () => void; handleChangePassword: (oldPass: any, newPass: a...'.
src/components/feedback/BugReportButton.tsx(75,18): error TS2339: Property 'issueUrl' does not exist on type 'true'.
src/components/feedback/BugReportButton.tsx(79,76): error TS2339: Property 'issueNumber' does not exist on type 'true'.
src/components/feedback/BugReportButton.tsx(82,25): error TS2339: Property 'localFallback' does not exist on type 'true'.
src/components/history/BudgetHistoryViewer.tsx(72,43): error TS2322: Type 'string | Error' is not assignable to type 'ReactNode'.
  Type 'Error' is not assignable to type 'ReactNode'.
src/components/history/IntegrityStatusIndicator.tsx(177,73): error TS2339: Property 'totalCommits' does not exist on type '{ valid: boolean; message: string; }'.
src/components/history/IntegrityStatusIndicator.tsx(179,36): error TS2339: Property 'verifiedCommits' does not exist on type '{ valid: boolean; message: string; }'.
src/components/history/IntegrityStatusIndicator.tsx(182,75): error TS2339: Property 'verifiedCommits' does not exist on type '{ valid: boolean; message: string; }'.
src/components/history/IntegrityStatusIndicator.tsx(185,36): error TS2339: Property 'brokenAt' does not exist on type '{ valid: boolean; message: string; }'.
src/components/history/IntegrityStatusIndicator.tsx(189,49): error TS2339: Property 'brokenAt' does not exist on type '{ valid: boolean; message: string; }'.
src/components/history/ObjectHistoryViewer.tsx(15,11): error TS2339: Property 'data' does not exist on type '{ commits: any; isLoading: boolean; isError: boolean; error: Error; createCommit: UseMutateFunction<any, Error, void, unknown>; createCommitAsync: UseMutateAsyncFunction<any, Error, void, unknown>; refetch: (options?: RefetchOptions) => Promise<...>; }'.
src/components/history/ObjectHistoryViewer.tsx(51,9): error TS6133: '_getChangeIcon' is declared but its value is never read.
src/components/history/ObjectHistoryViewer.tsx(83,9): error TS6133: '_formatChangeDescription' is declared but its value is never read.
src/components/layout/AppRoutes.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/layout/AppWrapper.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/layout/MainLayout.tsx(2,8): error TS6133: 'React' is declared but its value is never read.
src/components/layout/MainLayout.tsx(64,7): error TS2339: Property 'isLocalOnlyMode' does not exist on type '{ isUnlocked: boolean; currentUser: UserData; budgetId: string; encryptionKey: CryptoKey; salt: Uint8Array<ArrayBufferLike>; lastActivity: number; ... 11 more ...; handleUpdateProfile: (updatedProfile: any) => Promise<...>; } | {}'.
src/components/layout/MainLayout.tsx(65,7): error TS2339: Property '_localOnlyUser' does not exist on type '{ isUnlocked: boolean; currentUser: UserData; budgetId: string; encryptionKey: CryptoKey; salt: Uint8Array<ArrayBufferLike>; lastActivity: number; ... 11 more ...; handleUpdateProfile: (updatedProfile: any) => Promise<...>; } | {}'.
src/components/layout/MainLayout.tsx(65,7): error TS6133: '_localOnlyUser' is declared but its value is never read.
src/components/layout/MainLayout.tsx(70,7): error TS2339: Property '_internal' does not exist on type '{ isUnlocked: boolean; currentUser: UserData; budgetId: string; encryptionKey: CryptoKey; salt: Uint8Array<ArrayBufferLike>; lastActivity: number; ... 11 more ...; handleUpdateProfile: (updatedProfile: any) => Promise<...>; } | {}'.
src/components/layout/MainLayout.tsx(75,9): error TS6133: '_isOnboarded' is declared but its value is never read.
src/components/layout/MainLayout.tsx(75,60): error TS2339: Property 'isOnboarded' does not exist on type 'unknown'.
src/components/layout/MainLayout.tsx(101,49): error TS2339: Property 'toasts' does not exist on type 'unknown'.
src/components/layout/MainLayout.tsx(102,54): error TS2339: Property 'removeToast' does not exist on type 'unknown'.
src/components/layout/MainLayout.tsx(139,19): error TS2339: Property '_lastLogKey' does not exist on type '({ firebaseSync }: { firebaseSync: any; }) => Element'.
src/components/layout/MainLayout.tsx(139,45): error TS2339: Property '_lastLogKey' does not exist on type '({ firebaseSync }: { firebaseSync: any; }) => Element'.
src/components/layout/MainLayout.tsx(146,16): error TS2339: Property '_lastLogKey' does not exist on type '({ firebaseSync }: { firebaseSync: any; }) => Element'.
src/components/layout/MainLayout.tsx(172,9): error TS2322: Type '{ currentUser: UserData; auth: { login: (password: any, userData?: any) => Promise<any>; joinBudget: (joinData: any) => Promise<{ success: boolean; data: any; error?: undefined; } | { ...; }>; ... 26 more ...; setError: (error: string) => void; }; ... 15 more ...; openBugReport: any; }' is not assignable to type 'IntrinsicAttributes & { currentUser: any; auth: any; layoutData: any; onUserChange: any; onExport: any; onImport: any; onLogout: any; onResetEncryption: any; onChangePassword: any; ... 8 more ...; _openBugReport: any; }'.
  Property 'openBugReport' does not exist on type 'IntrinsicAttributes & { currentUser: any; auth: any; layoutData: any; onUserChange: any; onExport: any; onImport: any; onLogout: any; onResetEncryption: any; onChangePassword: any; ... 8 more ...; _openBugReport: any; }'. Did you mean '_openBugReport'?
src/components/layout/MainLayout.tsx(207,3): error TS6133: '_openBugReport' is declared but its value is never read.
src/components/layout/MainLayout.tsx(215,59): error TS2339: Property 'isOnboarded' does not exist on type 'unknown'.
src/components/layout/MainLayout.tsx(227,9): error TS6133: '_activeView' is declared but its value is never read.
src/components/layout/MainLayout.tsx(282,5): error TS2554: Expected 1 arguments, but got 4.
src/components/layout/MainLayout.tsx(306,25): error TS2322: Type '{ children: Element; setActiveView: (view: any) => void; }' is not assignable to type 'IntrinsicAttributes & { children: any; }'.
  Property 'setActiveView' does not exist on type 'IntrinsicAttributes & { children: any; }'.
src/components/layout/MainLayout.tsx(311,15): error TS2322: Type '{ currentUser: any; onUserChange: any; onUpdateProfile: any; isLocalOnlyMode: boolean; onShowSettings: () => void; onShowDataSettings: () => void; }' is not assignable to type 'IntrinsicAttributes & object'.
  Property 'currentUser' does not exist on type 'IntrinsicAttributes & object'.
src/components/layout/MainLayout.tsx(396,13): error TS2322: Type '{ isOpen: true; onClose: () => void; initialSection: string; onExport: any; onImport: (event: any) => Promise<void>; onLogout: any; onResetEncryption: () => void; onSync: () => Promise<void>; ... 5 more ...; securityManager: any; }' is not assignable to type 'IntrinsicAttributes & { isOpen: any; onClose: any; onExport: any; onImport: any; onLogout: any; onResetEncryption: any; onSync: any; onChangePassword: any; currentUser: any; isLocalOnlyMode?: boolean; securityManager: any; initialSection?: string; }'.
  Property 'onUserChange' does not exist on type 'IntrinsicAttributes & { isOpen: any; onClose: any; onExport: any; onImport: any; onLogout: any; onResetEncryption: any; onSync: any; onChangePassword: any; currentUser: any; isLocalOnlyMode?: boolean; securityManager: any; initialSection?: string; }'.
src/components/layout/NavigationTabs.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/layout/NavigationTabs.tsx(132,13): error TS2322: Type '{ key: string; active: boolean; to: string; icon: any; label: string; viewKey: string; }' is not assignable to type 'IntrinsicAttributes & object'.
  Property 'active' does not exist on type 'IntrinsicAttributes & object'.
src/components/layout/NavigationTabs.tsx(154,27): error TS2339: Property 'active' does not exist on type '{}'.
src/components/layout/NavigationTabs.tsx(154,35): error TS2339: Property 'to' does not exist on type '{}'.
src/components/layout/NavigationTabs.tsx(154,39): error TS2339: Property 'icon' does not exist on type '{}'.
src/components/layout/NavigationTabs.tsx(154,52): error TS2339: Property 'label' does not exist on type '{}'.
src/components/layout/NavigationTabs.tsx(154,59): error TS2339: Property 'viewKey' does not exist on type '{}'.
src/components/layout/SummaryCards.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/layout/SummaryCards.tsx(89,38): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/components/layout/SummaryCards.tsx(139,13): error TS2322: Type '{ key: string; icon: any; label: string; value: any; color: string; onClick: any; clickable: boolean; isNegative: boolean; subtitle: string; dataTour: string; }' is not assignable to type 'IntrinsicAttributes & object'.
  Property 'icon' does not exist on type 'IntrinsicAttributes & object'.
src/components/layout/SummaryCards.tsx(160,6): error TS2339: Property 'icon' does not exist on type '{}'.
src/components/layout/SummaryCards.tsx(160,19): error TS2339: Property 'label' does not exist on type '{}'.
src/components/layout/SummaryCards.tsx(160,26): error TS2339: Property 'value' does not exist on type '{}'.
src/components/layout/SummaryCards.tsx(160,33): error TS2339: Property 'color' does not exist on type '{}'.
src/components/layout/SummaryCards.tsx(160,40): error TS2339: Property 'onClick' does not exist on type '{}'.
src/components/layout/SummaryCards.tsx(160,49): error TS2339: Property 'clickable' does not exist on type '{}'.
src/components/layout/SummaryCards.tsx(160,60): error TS2339: Property 'isNegative' does not exist on type '{}'.
src/components/layout/SummaryCards.tsx(160,72): error TS2339: Property 'subtitle' does not exist on type '{}'.
src/components/layout/SummaryCards.tsx(160,82): error TS2339: Property 'dataTour' does not exist on type '{}'.
src/components/layout/ViewRenderer.tsx(49,5): error TS6133: '_envelopes' is declared but its value is never read.
src/components/layout/ViewRenderer.tsx(50,5): error TS6133: '_bills' is declared but its value is never read.
src/components/layout/ViewRenderer.tsx(53,5): error TS6133: '_transactions' is declared but its value is never read.
src/components/layout/ViewRenderer.tsx(78,28): error TS2345: Argument of type '{ id: any; updates: any; }' is not assignable to parameter of type 'void'.
src/components/layout/ViewRenderer.tsx(145,11): error TS2322: Type '{ transactions: any; envelopes: Envelope[]; onCreateEnvelope: any; onUpdateEnvelope: any; dateRange: string; minAmount: number; minTransactions: number; }' is not assignable to type 'IntrinsicAttributes & { transactions?: any[]; envelopes?: any[]; onCreateEnvelope: any; onUpdateEnvelope: any; onDismissSuggestion: any; dateRange?: string; showDismissed?: boolean; className?: string; }'.
  Property 'minAmount' does not exist on type 'IntrinsicAttributes & { transactions?: any[]; envelopes?: any[]; onCreateEnvelope: any; onUpdateEnvelope: any; onDismissSuggestion: any; dateRange?: string; showDismissed?: boolean; className?: string; }'.
src/components/layout/ViewRenderer.tsx(148,10): error TS2741: Property 'unassignedCash' is missing in type '{ "data-tour": string; }' but required in type '{ envelopes?: any[]; transactions?: any[]; unassignedCash: any; className?: string; }'.
src/components/layout/ViewRenderer.tsx(174,9): error TS2322: Type '{ biweeklyAllocation: any; envelopes: Envelope[]; paycheckHistory: PaycheckHistory[]; onProcessPaycheck: UseMutateFunction<{ id: string; date: Date; amount: any; mode: any; unassignedCashBefore: any; ... 4 more ...; notes: any; }, Error, void, unknown>; onDeletePaycheck: (paycheckId: any) => Promise<...>; currentUse...' is not assignable to type 'IntrinsicAttributes & { envelopes?: any[]; paycheckHistory?: any[]; onProcessPaycheck: any; onDeletePaycheck: any; currentUser: any; }'.
  Property 'biweeklyAllocation' does not exist on type 'IntrinsicAttributes & { envelopes?: any[]; paycheckHistory?: any[]; onProcessPaycheck: any; onDeletePaycheck: any; currentUser: any; }'.
src/components/layout/ViewRenderer.tsx(186,9): error TS2322: Type '{ transactions: any; envelopes: Envelope[]; onPayBill: (updatedBill: any) => void; onUpdateBill: (updatedBill: any) => void; onCreateRecurringBill: (newBill: any) => void; onSearchNewBills: () => Promise<...>; onError: (error: any) => void; }' is not assignable to type 'IntrinsicAttributes & { transactions?: any[]; envelopes?: any[]; onUpdateBill: any; onCreateRecurringBill: any; onSearchNewBills: any; onError: any; className?: string; }'.
  Property 'onPayBill' does not exist on type 'IntrinsicAttributes & { transactions?: any[]; envelopes?: any[]; onUpdateBill: any; onCreateRecurringBill: any; onSearchNewBills: any; onError: any; className?: string; }'.
src/components/layout/ViewRenderer.tsx(195,30): error TS2345: Argument of type '{ id: any; updates: any; }' is not assignable to parameter of type 'void'.
src/components/layout/ViewRenderer.tsx(222,25): error TS2554: Expected 3 arguments, but got 2.
src/components/layout/ViewRenderer.tsx(228,25): error TS2554: Expected 3 arguments, but got 2.
src/components/layout/ViewRenderer.tsx(281,43): error TS2322: Type '{ message: string; }' is not assignable to type 'IntrinsicAttributes & object'.
  Property 'message' does not exist on type 'IntrinsicAttributes & object'.
src/components/mobile/BottomNavigationBar.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/mobile/BottomNavItem.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/mobile/BottomNavItem.tsx(11,20): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
src/components/mobile/ResponsiveModal.tsx(81,27): error TS2339: Property 'isOpen' does not exist on type '{}'.
src/components/mobile/ResponsiveModal.tsx(84,25): error TS2339: Property 'isOpen' does not exist on type '{}'.
src/components/mobile/ResponsiveModal.tsx(85,26): error TS2339: Property 'onClose' does not exist on type '{}'.
src/components/mobile/ResponsiveModal.tsx(86,24): error TS2339: Property 'title' does not exist on type '{}'.
src/components/modals/CorruptionRecoveryModal.tsx(175,6): error TS2741: Property 'onConfirm' is missing in type '{ children: ReactElement<unknown, string | JSXElementConstructor<any>>; isOpen: boolean; onCancel: () => void; }' but required in type '{ isOpen?: boolean; title?: string; message?: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean; isLoading?: boolean; icon?: any; onConfirm: any; onCancel: any; children: any; }'.
src/components/modals/PasswordRotationModal.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/modals/QuickFundForm.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/modals/UnassignedCashModal.tsx(15,6): error TS2339: Property 'envelope' does not exist on type '{}'.
src/components/modals/UnassignedCashModal.tsx(15,16): error TS2339: Property 'distributionAmount' does not exist on type '{}'.
src/components/modals/UnassignedCashModal.tsx(15,36): error TS2339: Property 'updateDistribution' does not exist on type '{}'.
src/components/modals/UnassignedCashModal.tsx(15,56): error TS2339: Property 'isProcessing' does not exist on type '{}'.
src/components/modals/UnassignedCashModal.tsx(15,70): error TS2339: Property 'bills' does not exist on type '{}'.
src/components/modals/UnassignedCashModal.tsx(65,40): error TS2322: Type '{ envelope: any; bills: any; showDetails: boolean; }' is not assignable to type 'IntrinsicAttributes & object'.
  Property 'envelope' does not exist on type 'IntrinsicAttributes & object'.
src/components/modals/UnassignedCashModal.tsx(104,28): error TS2365: Operator '>' cannot be applied to types 'unknown' and 'number'.
src/components/modals/UnassignedCashModal.tsx(105,29): error TS2365: Operator '>' cannot be applied to types 'unknown' and 'number'.
src/components/modals/UnassignedCashModal.tsx(147,36): error TS2339: Property 'toFixed' does not exist on type 'unknown'.
src/components/modals/UnassignedCashModal.tsx(253,19): error TS2322: Type '{ key: any; envelope: any; distributionAmount: any; updateDistribution: (envelopeId: any, amount: any) => void; isProcessing: boolean; bills: any[]; }' is not assignable to type 'IntrinsicAttributes & object'.
  Property 'envelope' does not exist on type 'IntrinsicAttributes & object'.
src/components/modals/UnassignedCashModal.tsx(309,47): error TS2339: Property 'toFixed' does not exist on type 'unknown'.
src/components/modals/UnassignedCashModal.tsx(324,19): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/onboarding/EmptyStateHints.tsx(10,11): error TS2339: Property 'shouldShowHint' does not exist on type '{}'.
src/components/onboarding/EmptyStateHints.tsx(10,27): error TS2339: Property 'markStepComplete' does not exist on type '{}'.
src/components/onboarding/EmptyStateHints.tsx(10,45): error TS2339: Property 'preferences' does not exist on type '{}'.
src/components/onboarding/hooks/useTutorialControls.ts(15,11): error TS2339: Property 'endTutorialStep' does not exist on type '{}'.
src/components/onboarding/hooks/useTutorialControls.ts(15,28): error TS2339: Property 'markStepComplete' does not exist on type '{}'.
src/components/onboarding/hooks/useTutorialControls.ts(15,46): error TS2339: Property 'setPreference' does not exist on type '{}'.
src/components/onboarding/hooks/useTutorialSteps.ts(12,11): error TS2339: Property 'startTutorialStep' does not exist on type '{}'.
src/components/onboarding/OnboardingProgress.tsx(10,11): error TS2339: Property 'isOnboarded' does not exist on type '{}'.
src/components/onboarding/OnboardingProgress.tsx(10,24): error TS2339: Property 'tutorialProgress' does not exist on type '{}'.
src/components/onboarding/OnboardingProgress.tsx(10,42): error TS2339: Property 'getProgress' does not exist on type '{}'.
src/components/onboarding/OnboardingProgress.tsx(10,55): error TS2339: Property 'preferences' does not exist on type '{}'.
src/components/onboarding/OnboardingProgress.tsx(10,68): error TS2339: Property 'setPreference' does not exist on type '{}'.
src/components/onboarding/OnboardingProgress.tsx(173,32): error TS2339: Property 'map' does not exist on type 'unknown'.
src/components/onboarding/OnboardingTutorial.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/onboarding/OnboardingTutorial.tsx(14,11): error TS2339: Property 'isOnboarded' does not exist on type '{}'.
src/components/onboarding/OnboardingTutorial.tsx(14,24): error TS2339: Property 'getProgress' does not exist on type '{}'.
src/components/onboarding/OnboardingTutorial.tsx(14,37): error TS2339: Property 'preferences' does not exist on type '{}'.
src/components/pages/MainDashboard.tsx(30,11): error TS2339: Property 'data' does not exist on type '{ savingsGoals: any[]; summary: { totalGoals: any; completedGoals: any; activeGoals: number; totalTargetAmount: any; totalCurrentAmount: any; totalRemainingAmount: number; overallProgressRate: number; urgentGoals: any; overdueGoals: any; totalMonthlyNeeded: number; }; ... 8 more ...; mutations: { ...; }; }'.
src/components/pages/MainDashboard.tsx(32,11): error TS2339: Property 'data' does not exist on type '{ isLoading: false; isFetching: boolean; isError: boolean; error: Error; addTransaction: UseMutateFunction<any, Error, void, unknown>; addTransactionAsync: UseMutateAsyncFunction<...>; ... 28 more ...; transactions: any; }'.
src/components/pages/MainDashboard.tsx(59,5): error TS2339: Property '_safeUnassignedCash' does not exist on type '{ totalEnvelopeBalance: any; totalSavingsBalance: any; safeUnassignedCash: number; totalVirtualBalance: any; difference: number; isBalanced: boolean; }'.
src/components/pages/MainDashboard.tsx(59,5): error TS6133: '_safeUnassignedCash' is declared but its value is never read.
src/components/pages/MainDashboard.tsx(114,11): error TS6133: '_success' is declared but its value is never read.
src/components/pwa/OfflineStatusIndicator.tsx(74,18): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/pwa/OfflineStatusIndicator.tsx(197,23): error TS2339: Property 'pendingOperations' does not exist on type '{ pendingCount: number; isOnline: boolean; }'.
src/components/pwa/OfflineStatusIndicator.tsx(197,55): error TS2339: Property 'pendingOperations' does not exist on type '{ pendingCount: number; isOnline: boolean; }'.
src/components/pwa/OfflineStatusIndicator.tsx(206,29): error TS2339: Property 'pendingOperations' does not exist on type '{ pendingCount: number; isOnline: boolean; }'.
src/components/pwa/OfflineStatusIndicator.tsx(217,29): error TS2339: Property 'pendingOperations' does not exist on type '{ pendingCount: number; isOnline: boolean; }'.
src/components/pwa/OfflineStatusIndicator.tsx(219,34): error TS2339: Property 'pendingOperations' does not exist on type '{ pendingCount: number; isOnline: boolean; }'.
src/components/pwa/ShareTargetHandler.tsx(47,14): error TS2339: Property 'hasFiles' does not exist on type '{ title: string; text: string; url: string; timestamp: string; }'.
src/components/pwa/ShareTargetHandler.tsx(54,18): error TS2339: Property 'hasFiles' does not exist on type '{ title: string; text: string; url: string; timestamp: string; }'.
src/components/receipts/__tests__/ReceiptScanner.test.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/receipts/__tests__/ReceiptScanner.test.tsx(2,1): error TS6133: 'Button' is declared but its value is never read.
src/components/receipts/__tests__/ReceiptScanner.test.tsx(3,37): error TS6133: 'waitFor' is declared but its value is never read.
src/components/receipts/__tests__/ReceiptScanner.test.tsx(93,23): error TS2339: Property 'mockReturnValue' does not exist on type '(onReceiptProcessed: any) => { isProcessing: boolean; uploadedImage: any; extractedData: any; error: any; showImagePreview: boolean; fileInputRef: RefObject<any>; cameraInputRef: RefObject<...>; ... 6 more ...; toggleImagePreview: () => void; }'.
src/components/receipts/__tests__/ReceiptScanner.test.tsx(106,23): error TS2339: Property 'mockReturnValue' does not exist on type '(onReceiptProcessed: any) => { isProcessing: boolean; uploadedImage: any; extractedData: any; error: any; showImagePreview: boolean; fileInputRef: RefObject<any>; cameraInputRef: RefObject<...>; ... 6 more ...; toggleImagePreview: () => void; }'.
src/components/receipts/__tests__/ReceiptScanner.test.tsx(118,23): error TS2339: Property 'mockReturnValue' does not exist on type '(onReceiptProcessed: any) => { isProcessing: boolean; uploadedImage: any; extractedData: any; error: any; showImagePreview: boolean; fileInputRef: RefObject<any>; cameraInputRef: RefObject<...>; ... 6 more ...; toggleImagePreview: () => void; }'.
src/components/receipts/__tests__/ReceiptScanner.test.tsx(140,23): error TS2339: Property 'mockReturnValue' does not exist on type '(onReceiptProcessed: any) => { isProcessing: boolean; uploadedImage: any; extractedData: any; error: any; showImagePreview: boolean; fileInputRef: RefObject<any>; cameraInputRef: RefObject<...>; ... 6 more ...; toggleImagePreview: () => void; }'.
src/components/receipts/__tests__/ReceiptScanner.test.tsx(165,23): error TS2339: Property 'mockReturnValue' does not exist on type '(onReceiptProcessed: any) => { isProcessing: boolean; uploadedImage: any; extractedData: any; error: any; showImagePreview: boolean; fileInputRef: RefObject<any>; cameraInputRef: RefObject<...>; ... 6 more ...; toggleImagePreview: () => void; }'.
src/components/receipts/__tests__/ReceiptScanner.test.tsx(180,23): error TS2339: Property 'mockReturnValue' does not exist on type '(onReceiptProcessed: any) => { isProcessing: boolean; uploadedImage: any; extractedData: any; error: any; showImagePreview: boolean; fileInputRef: RefObject<any>; cameraInputRef: RefObject<...>; ... 6 more ...; toggleImagePreview: () => void; }'.
src/components/receipts/__tests__/ReceiptScanner.test.tsx(195,23): error TS2339: Property 'mockReturnValue' does not exist on type '(onReceiptProcessed: any) => { isProcessing: boolean; uploadedImage: any; extractedData: any; error: any; showImagePreview: boolean; fileInputRef: RefObject<any>; cameraInputRef: RefObject<...>; ... 6 more ...; toggleImagePreview: () => void; }'.
src/components/receipts/__tests__/ReceiptScanner.test.tsx(226,23): error TS2339: Property 'mockReturnValue' does not exist on type '(onReceiptProcessed: any) => { isProcessing: boolean; uploadedImage: any; extractedData: any; error: any; showImagePreview: boolean; fileInputRef: RefObject<any>; cameraInputRef: RefObject<...>; ... 6 more ...; toggleImagePreview: () => void; }'.
src/components/receipts/components/ExtractedDataField.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/receipts/components/ExtractedItemsList.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/receipts/components/ReceiptActionButtons.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/receipts/ReceiptScanner.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/savings/AddEditGoalModal.tsx(194,9): error TS2322: Type 'string' is not assignable to type 'number'.
src/components/savings/DistributeModal.tsx(20,12): error TS2365: Operator '+' cannot be applied to types 'unknown' and 'number'.
src/components/savings/DistributeModal.tsx(20,30): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/components/savings/DistributeModal.tsx(27,37): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/components/savings/DistributeModal.tsx(64,9): error TS2365: Operator '<=' cannot be applied to types 'unknown' and 'number'.
src/components/savings/DistributeModal.tsx(64,35): error TS2365: Operator '>' cannot be applied to types 'unknown' and 'number'.
src/components/savings/DistributeModal.tsx(81,31): error TS2365: Operator '>' cannot be applied to types 'unknown' and 'number'.
src/components/savings/DistributeModal.tsx(81,56): error TS2365: Operator '<=' cannot be applied to types 'unknown' and 'number'.
src/components/savings/SavingsGoalCard.tsx(15,22): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/savings/SavingsGoalCard.tsx(15,31): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/security/LockScreen.tsx(35,29): error TS2339: Property 'isValid' does not exist on type 'unknown'.
src/components/security/LockScreen.tsx(41,9): error TS2554: Expected 1 arguments, but got 0.
src/components/security/LockScreen.tsx(58,5): error TS2448: Block-scoped variable 'handleIncorrectPassword' used before its declaration.
src/components/security/LockScreen.tsx(165,9): error TS6133: '_handleReset' is declared but its value is never read.
src/components/security/LockScreen.tsx(263,26): error TS2739: Type '{ type: string; message: string; variant: string; }' is missing the following properties from type '{ type?: string; message: any; icon: any; dismissible?: boolean; onDismiss: any; variant?: string; className?: string; }': icon, onDismiss
src/components/security/LockScreen.tsx(267,18): error TS2739: Type '{ type: string; message: string; variant: string; }' is missing the following properties from type '{ type?: string; message: any; icon: any; dismissible?: boolean; onDismiss: any; variant?: string; className?: string; }': icon, onDismiss
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(2,1): error TS6133: 'Select' is declared but its value is never read.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(3,1): error TS6133: 'Button' is declared but its value is never read.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(6,30): error TS2307: Cannot find module '../SecuritySettingsRefactored' or its corresponding type declarations.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(9,1): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(10,29): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(29,26): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(30,27): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(31,24): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(32,26): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(33,29): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(34,29): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(35,25): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(40,1): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(46,1): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(52,1): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(58,1): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(64,1): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(70,1): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(79,14): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(83,5): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(87,54): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/__tests__/SecuritySettingsRefactored.test.tsx(103,25): error TS2708: Cannot use namespace 'jest' as a value.
src/components/settings/archiving/ArchivingPreviewResults.tsx(68,45): error TS2339: Property 'count' does not exist on type 'unknown'.
src/components/settings/archiving/ArchivingPreviewResults.tsx(68,55): error TS2339: Property 'count' does not exist on type 'unknown'.
src/components/settings/archiving/ArchivingPreviewResults.tsx(80,33): error TS2339: Property 'count' does not exist on type 'unknown'.
src/components/settings/archiving/ArchivingPreviewResults.tsx(84,43): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/components/settings/sections/AccountSettingsSection.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/settings/sections/SyncDebugToolsSection.tsx(86,47): error TS2339: Property 'detectLocalDataDebug' does not exist on type 'Window & typeof globalThis'.
src/components/settings/sections/SyncDebugToolsSection.tsx(109,47): error TS2339: Property 'hasLocalDataDebug' does not exist on type 'Window & typeof globalThis'.
src/components/settings/sections/SyncDebugToolsSection.tsx(140,49): error TS2551: Property 'safeCloudDataReset' does not exist on type 'Window & typeof globalThis'. Did you mean 'forceCloudDataReset'?
src/components/settings/TransactionArchiving.tsx(3,37): error TS2307: Cannot find module '../../hooks/transactions/useTransactionArchiving' or its corresponding type declarations.
src/components/sharing/JoinBudgetModal.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/sharing/JoinBudgetModal.tsx(65,33): error TS2554: Expected 1 arguments, but got 6.
src/components/sharing/JoinBudgetModal.tsx(68,9): error TS6133: '_handleProcessQRData' is declared but its value is never read.
src/components/sharing/ShareCodeModal.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/sharing/steps/ShareCodeStep.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/sharing/steps/UserSetupStep.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/sync/ActivityBanner.tsx(41,39): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/sync/ActivityBanner.tsx(41,71): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/sync/ActivityBanner.tsx(128,39): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/sync/ActivityBanner.tsx(128,45): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/sync/health/SyncHealthDetails.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/sync/health/SyncHealthDetails.tsx(140,17): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
src/components/sync/health/SyncStatusIndicator.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/sync/ManualSyncControls.tsx(3,24): error TS2307: Cannot find module '@/components/ui/button' or its corresponding type declarations.
src/components/sync/ManualSyncControls.tsx(4,58): error TS2307: Cannot find module '@/components/ui/card' or its corresponding type declarations.
src/components/sync/ManualSyncControls.tsx(5,23): error TS2307: Cannot find module '@/components/ui/badge' or its corresponding type declarations.
src/components/sync/ManualSyncControls.tsx(6,41): error TS2307: Cannot find module '@/components/ui/alert' or its corresponding type declarations.
src/components/sync/ManualSyncControls.tsx(8,27): error TS2307: Cannot find module '../../hooks/common/useManualSync' or its corresponding type declarations.
src/components/sync/ManualSyncControls.tsx(94,18): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/sync/SyncHealthDashboard.tsx(6,8): error TS6133: 'React' is declared but its value is never read.
src/components/sync/SyncHealthDashboard.tsx(46,11): error TS2339: Property 'exportBackup' does not exist on type '{ exportData: () => Promise<void>; }'.
src/components/sync/SyncHealthIndicator.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/sync/SyncHealthIndicator.tsx(48,42): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/components/sync/SyncHealthIndicator.tsx(48,72): error TS2339: Property 'activeSyncPromise' does not exist on type 'CloudSyncService'.
src/components/sync/SyncHealthIndicator.tsx(78,9): error TS2353: Object literal may only specify known properties, and 'error' does not exist in type 'SetStateAction<{ isHealthy: any; status: string; lastChecked: any; isLoading: boolean; }>'.
src/components/sync/SyncHealthIndicator.tsx(185,30): error TS2339: Property 'failedTests' does not exist on type '{ isHealthy: any; status: string; lastChecked: any; isLoading: boolean; }'.
src/components/sync/SyncIndicator.tsx(3,8): error TS6133: 'React' is declared but its value is never read.
src/components/sync/SyncIndicator.tsx(71,39): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/sync/SyncIndicator.tsx(71,45): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/sync/SyncStatusIndicators.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/transactions/components/DeleteConfirmation.tsx(20,11): error TS2322: Type 'string' is not assignable to type 'number'.
src/components/transactions/import/FieldMapper.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/transactions/import/FileUploader.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/transactions/ledger/TransactionLedgerLoading.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/transactions/ledger/TransactionPagination.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/transactions/splitter/SplitterHeader.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/transactions/TransactionForm.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/transactions/TransactionForm.tsx(90,15): error TS2322: Type '{ isLocked: boolean; isOwnLock: boolean; isLoading: boolean; lock: { userName: any; expiresAt: Date; isExpired: boolean; }; onBreakLock: () => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; } | { ...; }>; showDetails: true; }' is not assignable to type 'IntrinsicAttributes & { isLocked: any; isOwnLock: any; lock: any; onBreakLock: any; className?: string; showDetails?: boolean; }'.
  Property 'isLoading' does not exist on type 'IntrinsicAttributes & { isLocked: any; isOwnLock: any; lock: any; onBreakLock: any; className?: string; showDetails?: boolean; }'.
src/components/transactions/TransactionLedger.tsx(4,32): error TS2614: Module '"../ui/StandardFilters"' has no exported member 'FilterConfig'. Did you mean to use 'import FilterConfig from "../ui/StandardFilters"' instead?
src/components/transactions/TransactionLedger.tsx(148,9): error TS4104: The type 'readonly ["Housing", "Transportation", "Insurance", "Bills & Utilities", "Subscriptions", "Food & Dining", "Entertainment", "Shopping", "Health & Medical", "Personal Care", ... 7 more ..., "Other"]' is 'readonly' and cannot be assigned to the mutable type 'any[]'.
src/components/transactions/TransactionLedger.tsx(175,9): error TS4104: The type 'readonly ["Housing", "Transportation", "Insurance", "Bills & Utilities", "Subscriptions", "Food & Dining", "Entertainment", "Shopping", "Health & Medical", "Personal Care", ... 7 more ..., "Other"]' is 'readonly' and cannot be assigned to the mutable type 'any[]'.
src/components/transactions/TransactionSplitter.tsx(2,8): error TS2613: Module '"violet-vault/src/hooks/transactions/useTransactionSplitter"' has no default export. Did you mean to use 'import { useTransactionSplitter } from "/Users/thef4tdaddy/Git/violet-vault/src/hooks/transactions/useTransactionSplitter"' instead?
src/components/transactions/TransactionSummaryCards.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/ui/ConfirmProvider.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/ui/ConnectionDisplay.tsx(220,4): error TS2741: Property 'onDisconnect' is missing in type '{ children: Element[]; title: any; icon: any; theme: any; }' but required in type '{ title?: string; icon: any; onDisconnect: any; children: any; isVisible?: boolean; className?: string; theme?: string; }'.
src/components/ui/EditLockIndicator.tsx(13,54): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/components/ui/forms/Select.tsx(2,10): error TS2440: Import declaration conflicts with local declaration of 'Select'.
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
src/components/ui/PromptProvider.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/ui/SecurityAlert.tsx(80,9): error TS6133: '_isFullscreen' is declared but its value is never read.
src/components/ui/StandardFilters.tsx(47,20): error TS2339: Property 'search' does not exist on type '{}'.
src/components/ui/StandardFilters.tsx(64,17): error TS2339: Property 'search' does not exist on type '{}'.
src/components/ui/StandardFilters.tsx(64,35): error TS2339: Property 'search' does not exist on type '{}'.
src/components/ui/StandardFilters.tsx(107,28): error TS2339: Property 'search' does not exist on type '{}'.
src/components/ui/StandardFilters.tsx(116,20): error TS2339: Property 'search' does not exist on type '{}'.
src/components/ui/StandardTabs.tsx(2,1): error TS6133: 'Button' is declared but its value is never read.
src/components/ui/Toast.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/ui/TouchButton.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/components/ui/VersionFooter.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/ui/VersionFooter.tsx(2,69): error TS2307: Cannot find module '../../utils/version' or its corresponding type declarations.
src/components/ui/VirtualList.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/components/ui/VirtualList.tsx(5,5): error TS2339: Property 'items' does not exist on type '{}'.
src/components/ui/VirtualList.tsx(6,5): error TS2339: Property 'itemHeight' does not exist on type '{}'.
src/components/ui/VirtualList.tsx(7,5): error TS2339: Property 'containerHeight' does not exist on type '{}'.
src/components/ui/VirtualList.tsx(8,5): error TS2339: Property 'renderItem' does not exist on type '{}'.
src/components/ui/VirtualList.tsx(9,5): error TS2339: Property 'className' does not exist on type '{}'.
src/components/ui/VirtualList.tsx(10,5): error TS2339: Property 'overscan' does not exist on type '{}'.
src/db/__tests__/budgetDb.test.ts(4,32): error TS6133: 'beforeEach' is declared but its value is never read.
src/db/__tests__/budgetDb.test.ts(4,44): error TS6133: 'afterEach' is declared but its value is never read.
src/db/__tests__/budgetDb.test.ts(6,1): error TS6133: 'logger' is declared but its value is never read.
src/db/budgetDb.ts(416,41): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Envelope'.
  Type '{}' is missing the following properties from type 'Envelope': id, name, category, archived, lastModified
src/db/budgetDb.ts(418,44): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Transaction'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, amount, envelopeId, and 3 more.
src/db/budgetDb.ts(420,37): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Bill'.
  Type '{}' is missing the following properties from type 'Bill': id, name, dueDate, amount, and 4 more.
src/db/budgetDb.ts(422,44): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'SavingsGoal'.
  Type '{}' is missing the following properties from type 'SavingsGoal': id, name, category, priority, and 5 more.
src/db/budgetDb.ts(424,47): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'PaycheckHistory'.
  Type '{}' is missing the following properties from type 'PaycheckHistory': id, date, amount, source, lastModified
src/db/budgetDb.ts(632,3): error TS2322: Type 'unknown' is not assignable to type 'number'.
src/db/budgetDb.ts(637,3): error TS2322: Type 'unknown' is not assignable to type 'number'.
src/hooks/accounts/useSupplementalAccounts.ts(118,19): error TS2554: Expected 3 arguments, but got 2.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(5,1): error TS2739: Type '{ createObjectURL: Mock<() => string>; revokeObjectURL: Mock<Procedure>; }' is missing the following properties from type '{ new (url: string | URL, base?: string | URL): URL; prototype: URL; canParse(url: string | URL, base?: string | URL): boolean; createObjectURL(obj: Blob | MediaSource): string; parse(url: string | URL, base?: string | URL): URL; revokeObjectURL(url: string): void; }': prototype, canParse, parse
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(20,3): error TS2322: Type 'Mock<() => { href: string; download: string; click: Mock<Procedure>; style: { visibility: string; }; }>' is not assignable to type '{ <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K]; <K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementDeprecatedTagNameMap[K]; (tagName: string, options?: ElementCreationOptions): HTMLElement; }'.
  Type '{ href: string; download: string; click: Mock<Procedure>; style: { visibility: string; }; }' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 312 more.
src/hooks/analytics/__tests__/useAnalyticsExport.test.ts(21,3): error TS2740: Type '{ appendChild: Mock<Procedure>; removeChild: Mock<Procedure>; }' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 312 more.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(1,27): error TS6133: 'waitFor' is declared but its value is never read.
src/hooks/analytics/__tests__/useSmartCategoryManager.test.tsx(2,1): error TS6133: 'Select' is declared but its value is never read.
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
src/hooks/analytics/useAnalytics.ts(13,5): error TS2339: Property 'period' does not exist on type '{}'.
src/hooks/analytics/useAnalytics.ts(14,5): error TS2339: Property 'customDateRange' does not exist on type '{}'.
src/hooks/analytics/useAnalytics.ts(15,5): error TS2339: Property 'includeTransfers' does not exist on type '{}'.
src/hooks/analytics/useAnalytics.ts(16,5): error TS2339: Property 'groupBy' does not exist on type '{}'.
src/hooks/analytics/useAnalytics.ts(193,38): error TS2339: Property 'expenses' does not exist on type 'unknown'.
src/hooks/analytics/useAnalytics.ts(194,37): error TS2339: Property 'expenses' does not exist on type 'unknown'.
src/hooks/analytics/useAnalytics.ts(194,50): error TS2339: Property 'expenses' does not exist on type 'unknown'.
src/hooks/analytics/useAnalytics.ts(196,51): error TS2698: Spread types may only be created from object types.
src/hooks/analytics/useAnalytics.ts(199,38): error TS2339: Property 'income' does not exist on type 'unknown'.
src/hooks/analytics/useAnalytics.ts(200,37): error TS2339: Property 'income' does not exist on type 'unknown'.
src/hooks/analytics/useAnalytics.ts(200,48): error TS2339: Property 'income' does not exist on type 'unknown'.
src/hooks/analytics/useAnalytics.ts(202,51): error TS2698: Spread types may only be created from object types.
src/hooks/analytics/useAnalytics.ts(324,19): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/analytics/useAnalytics.ts(324,38): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/analytics/useAnalytics.ts(335,34): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/analytics/useAnalytics.ts(335,44): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/analytics/useAnalytics.ts(379,54): error TS2339: Property 'expenses' does not exist on type 'unknown'.
src/hooks/analytics/useAnalytics.ts(382,33): error TS2339: Property 'expenses' does not exist on type 'unknown'.
src/hooks/analytics/useAnalytics.ts(383,33): error TS2339: Property 'count' does not exist on type 'unknown'.
src/hooks/analytics/useAnalytics.ts(397,34): error TS2339: Property 'expenses' does not exist on type 'unknown'.
src/hooks/analytics/useAnalytics.ts(398,32): error TS2339: Property 'income' does not exist on type 'unknown'.
src/hooks/analytics/useAnalytics.ts(399,29): error TS2339: Property 'net' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsData.ts(26,45): error TS2345: Argument of type 'Date' is not assignable to parameter of type 'number'.
src/hooks/analytics/useAnalyticsData.ts(109,61): error TS2339: Property 'month' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsData.ts(109,83): error TS2339: Property 'month' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsData.ts(148,62): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsData.ts(148,73): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsData.ts(174,55): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsData.ts(174,66): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsData.ts(247,58): error TS2339: Property 'budgeted' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsData.ts(247,79): error TS2339: Property 'actual' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsData.ts(265,54): error TS2339: Property 'income' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsData.ts(274,54): error TS2339: Property 'expenses' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsIntegration.ts(3,32): error TS2307: Cannot find module './useChartConfig' or its corresponding type declarations.
src/hooks/analytics/useAnalyticsIntegration.ts(88,20): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsIntegration.ts(95,66): error TS2339: Property 'name' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsIntegration.ts(145,14): error TS2339: Property 'map' does not exist on type 'any[] | { summary: any; monthly: any; categories: any; envelopes: any; exportedAt: string; }'.
  Property 'map' does not exist on type '{ summary: any; monthly: any; categories: any; envelopes: any; exportedAt: string; }'.
src/hooks/analytics/usePerformanceMonitor.ts(14,37): error TS6133: 'analytics' is declared but its value is never read.
src/hooks/analytics/usePerformanceMonitor.ts(94,27): error TS6133: 'analytics' is declared but its value is never read.
src/hooks/analytics/useReportExporter.ts(256,42): error TS2345: Argument of type 'Element' is not assignable to parameter of type 'HTMLElement'.
  Type 'Element' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 129 more.
src/hooks/analytics/useReportExporter.ts(308,21): error TS2554: Expected 3 arguments, but got 2.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(47,17): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isUnlocked: boolean; encryptionKey: CryptoKey; currentUser: UserData; budgetId: string; salt: Uint8Array<ArrayBufferLike>; handleSetup: (userDataOrPassword: any) => Promise<...>; handleLogout: () => void; handleChangePassword: (oldPass: any, newPass: any) => Promise<...>; handleUpdateProfile: (updatedProfile...'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(59,24): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isLocked: boolean; securitySettings: any; securityEvents: any; lockSession: () => void; unlockSession: (_password: any) => void; trackActivity: () => void; resetAutoLockTimer: () => void; updateSettings: (newSettings: any) => void; ... 6 more ...; cleanup: () => void; }'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(67,22): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isLocalOnlyMode: boolean; localOnlyUser: any; isInitialized: boolean; loading: boolean; error: any; clearError: () => void; enterLocalOnlyMode: () => Promise<{ success: boolean; error: string; }>; ... 8 more ...; validateImportFile: () => { ...; }; }'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(113,22): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isLocalOnlyMode: boolean; localOnlyUser: any; isInitialized: boolean; loading: boolean; error: any; clearError: () => void; enterLocalOnlyMode: () => Promise<{ success: boolean; error: string; }>; ... 8 more ...; validateImportFile: () => { ...; }; }'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(127,17): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isUnlocked: boolean; encryptionKey: CryptoKey; currentUser: UserData; budgetId: string; salt: Uint8Array<ArrayBufferLike>; handleSetup: (userDataOrPassword: any) => Promise<...>; handleLogout: () => void; handleChangePassword: (oldPass: any, newPass: any) => Promise<...>; handleUpdateProfile: (updatedProfile...'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(152,17): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isUnlocked: boolean; encryptionKey: CryptoKey; currentUser: UserData; budgetId: string; salt: Uint8Array<ArrayBufferLike>; handleSetup: (userDataOrPassword: any) => Promise<...>; handleLogout: () => void; handleChangePassword: (oldPass: any, newPass: any) => Promise<...>; handleUpdateProfile: (updatedProfile...'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(169,22): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isLocalOnlyMode: boolean; localOnlyUser: any; isInitialized: boolean; loading: boolean; error: any; clearError: () => void; enterLocalOnlyMode: () => Promise<{ success: boolean; error: string; }>; ... 8 more ...; validateImportFile: () => { ...; }; }'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(179,22): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isLocalOnlyMode: boolean; localOnlyUser: any; isInitialized: boolean; loading: boolean; error: any; clearError: () => void; enterLocalOnlyMode: () => Promise<{ success: boolean; error: string; }>; ... 8 more ...; validateImportFile: () => { ...; }; }'.
src/hooks/auth/__tests__/useAuthenticationManager.test.ts(189,24): error TS2339: Property 'mockReturnValue' does not exist on type '() => { isLocked: boolean; securitySettings: any; securityEvents: any; lockSession: () => void; unlockSession: (_password: any) => void; trackActivity: () => void; resetAutoLockTimer: () => void; updateSettings: (newSettings: any) => void; ... 6 more ...; cleanup: () => void; }'.
src/hooks/auth/__tests__/useSecurityManagerUI.test.ts(418,34): error TS2339: Property 'mockResolvedValueOnce' does not exist on type '() => Promise<string>'.
src/hooks/auth/__tests__/useSecurityManagerUI.test.ts(447,35): error TS2339: Property 'mockRejectedValueOnce' does not exist on type '(data: string) => Promise<void>'.
src/hooks/auth/__tests__/useSecurityManagerUI.test.ts(477,34): error TS2339: Property 'mockResolvedValueOnce' does not exist on type '() => Promise<string>'.
src/hooks/auth/__tests__/useSecurityManagerUI.test.ts(488,35): error TS2339: Property 'mockClear' does not exist on type '(data: string) => Promise<void>'.
src/hooks/auth/__tests__/useUserSetup.test.ts(36,27): error TS2339: Property 'mockClear' does not exist on type '(message: any, title: any, duration: any) => any'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(44,5): error TS2322: Type 'number[]' is not assignable to type 'string'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(46,5): error TS2322: Type 'number[]' is not assignable to type 'string'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(74,28): error TS2339: Property 'budgetId' does not exist on type 'void'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(75,33): error TS2339: Property 'password' does not exist on type 'void'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(76,33): error TS2339: Property 'userInfo' does not exist on type 'void'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(77,28): error TS2339: Property 'sharedBy' does not exist on type 'void'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(103,18): error TS2339: Property 'success' does not exist on type 'unknown'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(104,33): error TS2339: Property 'user' does not exist on type 'unknown'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(104,46): error TS2339: Property 'sessionData' does not exist on type 'unknown'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(121,25): error TS2339: Property 'error' does not exist on type 'unknown'.
src/hooks/auth/mutations/useLoginMutations.ts(26,32): error TS2554: Expected 0 arguments, but got 1.
src/hooks/auth/mutations/useLoginMutations.ts(70,5): error TS2322: Type 'number[]' is not assignable to type 'string'.
src/hooks/auth/mutations/useLoginMutations.ts(72,5): error TS2322: Type 'number[]' is not assignable to type 'string'.
src/hooks/auth/mutations/useLoginMutations.ts(172,26): error TS2339: Property 'password' does not exist on type 'void'.
src/hooks/auth/mutations/useLoginMutations.ts(172,36): error TS2339: Property 'userData' does not exist on type 'void'.
src/hooks/auth/mutations/useLoginMutations.ts(208,18): error TS2339: Property 'success' does not exist on type 'unknown'.
src/hooks/auth/mutations/useLoginMutations.ts(209,33): error TS2339: Property 'user' does not exist on type 'unknown'.
src/hooks/auth/mutations/useLoginMutations.ts(209,46): error TS2339: Property 'sessionData' does not exist on type 'unknown'.
src/hooks/auth/mutations/useLoginMutations.ts(217,33): error TS2339: Property 'isNewUser' does not exist on type 'unknown'.
src/hooks/auth/mutations/useLoginMutations.ts(235,25): error TS2339: Property 'error' does not exist on type 'unknown'.
src/hooks/auth/mutations/usePasswordMutations.ts(19,26): error TS2339: Property 'oldPassword' does not exist on type 'void'.
src/hooks/auth/mutations/usePasswordMutations.ts(19,39): error TS2339: Property 'newPassword' does not exist on type 'void'.
src/hooks/auth/mutations/usePasswordMutations.ts(36,11): error TS2322: Type 'number[]' is not assignable to type 'string'.
src/hooks/auth/mutations/usePasswordMutations.ts(38,11): error TS2322: Type 'number[]' is not assignable to type 'string'.
src/hooks/auth/mutations/useProfileMutations.ts(27,36): error TS2339: Property 'userName' does not exist on type 'void'.
src/hooks/auth/mutations/useProfileMutations.ts(28,37): error TS2339: Property 'userColor' does not exist on type 'void'.
src/hooks/auth/mutations/useProfileMutations.ts(45,13): error TS2322: Type 'number[]' is not assignable to type 'string'.
src/hooks/auth/mutations/useProfileMutations.ts(47,13): error TS2322: Type 'number[]' is not assignable to type 'string'.
src/hooks/auth/mutations/useProfileMutations.ts(59,20): error TS2345: Argument of type 'void' is not assignable to parameter of type 'Partial<UserData>'.
src/hooks/auth/queries/usePasswordValidation.ts(68,5): error TS2769: No overload matches this call.
  Overload 1 of 3, '(options: DefinedInitialDataOptions<unknown, Error, unknown, any[]>, queryClient?: QueryClient): DefinedUseQueryResult<unknown, Error>', gave the following error.
    Object literal may only specify known properties, and 'cacheTime' does not exist in type 'DefinedInitialDataOptions<unknown, Error, unknown, any[]>'.
  Overload 2 of 3, '(options: UndefinedInitialDataOptions<{ isValid: boolean; reason: string; error?: undefined; } | { isValid: boolean; reason?: undefined; error?: undefined; } | { isValid: boolean; reason: string; error: any; }, Error, { ...; } | { ...; } | { ...; }, any[]>, queryClient?: QueryClient): UseQueryResult<...>', gave the following error.
    Object literal may only specify known properties, and 'cacheTime' does not exist in type 'UndefinedInitialDataOptions<{ isValid: boolean; reason: string; error?: undefined; } | { isValid: boolean; reason?: undefined; error?: undefined; } | { isValid: boolean; reason: string; error: any; }, Error, { isValid: boolean; reason: string; error?: undefined; } | { ...; } | { ...; }, any[]>'.
  Overload 3 of 3, '(options: UseQueryOptions<{ isValid: boolean; reason: string; error?: undefined; } | { isValid: boolean; reason?: undefined; error?: undefined; } | { isValid: boolean; reason: string; error: any; }, Error, { ...; } | { ...; } | { ...; }, any[]>, queryClient?: QueryClient): UseQueryResult<...>', gave the following error.
    Object literal may only specify known properties, and 'cacheTime' does not exist in type 'UseQueryOptions<{ isValid: boolean; reason: string; error?: undefined; } | { isValid: boolean; reason?: undefined; error?: undefined; } | { isValid: boolean; reason: string; error: any; }, Error, { isValid: boolean; reason: string; error?: undefined; } | { ...; } | { ...; }, any[]>'.
src/hooks/auth/useAuthCompatibility.ts(63,38): error TS2339: Property 'refetch' does not exist on type '{ password: any; enabled: boolean; }'.
src/hooks/auth/useAuthenticationManager.ts(52,63): error TS2339: Property 'canUnlock' does not exist on type '{ isLocked: boolean; securitySettings: any; securityEvents: any; lockSession: () => void; unlockSession: (_password: any) => void; trackActivity: () => void; resetAutoLockTimer: () => void; updateSettings: (newSettings: any) => void; ... 6 more ...; cleanup: () => void; }'.
src/hooks/auth/useAuthenticationManager.ts(63,23): error TS2339: Property 'canUnlock' does not exist on type '{ isLocked: boolean; securitySettings: any; securityEvents: any; lockSession: () => void; unlockSession: (_password: any) => void; trackActivity: () => void; resetAutoLockTimer: () => void; updateSettings: (newSettings: any) => void; ... 6 more ...; cleanup: () => void; }'.
src/hooks/auth/useAuthenticationManager.ts(91,32): error TS2339: Property 'lockApp' does not exist on type '{ isLocked: boolean; securitySettings: any; securityEvents: any; lockSession: () => void; unlockSession: (_password: any) => void; trackActivity: () => void; resetAutoLockTimer: () => void; updateSettings: (newSettings: any) => void; ... 6 more ...; cleanup: () => void; }'.
src/hooks/auth/useAuthenticationManager.ts(93,44): error TS2339: Property 'checkSecurityStatus' does not exist on type '{ isLocked: boolean; securitySettings: any; securityEvents: any; lockSession: () => void; unlockSession: (_password: any) => void; trackActivity: () => void; resetAutoLockTimer: () => void; updateSettings: (newSettings: any) => void; ... 6 more ...; cleanup: () => void; }'.
src/hooks/auth/useAuthenticationManager.ts(100,23): error TS2339: Property 'lockApp' does not exist on type '{ isLocked: boolean; securitySettings: any; securityEvents: any; lockSession: () => void; unlockSession: (_password: any) => void; trackActivity: () => void; resetAutoLockTimer: () => void; updateSettings: (newSettings: any) => void; ... 6 more ...; cleanup: () => void; }'.
src/hooks/auth/useAuthenticationManager.ts(102,23): error TS2339: Property 'checkSecurityStatus' does not exist on type '{ isLocked: boolean; securitySettings: any; securityEvents: any; lockSession: () => void; unlockSession: (_password: any) => void; trackActivity: () => void; resetAutoLockTimer: () => void; updateSettings: (newSettings: any) => void; ... 6 more ...; cleanup: () => void; }'.
src/hooks/auth/useKeyManagement.ts(272,56): error TS2345: Argument of type '{ budgetId: any; importedSalt: any; }' is not assignable to parameter of type 'NewUserData'.
  Property 'shareCode' is missing in type '{ budgetId: any; importedSalt: any; }' but required in type 'NewUserData'.
src/hooks/auth/useKeyManagementUI.ts(112,19): error TS2554: Expected 3 arguments, but got 2.
src/hooks/auth/useKeyManagementUI.ts(122,6): error TS6133: 'keyFileData' is declared but its value is never read.
src/hooks/auth/useKeyManagementUI.ts(129,21): error TS2554: Expected 3 arguments, but got 2.
src/hooks/auth/useKeyManagementUI.ts(137,21): error TS2554: Expected 3 arguments, but got 2.
src/hooks/auth/useKeyManagementUI.ts(155,19): error TS2554: Expected 3 arguments, but got 2.
src/hooks/auth/useKeyManagementUI.ts(170,17): error TS2554: Expected 3 arguments, but got 2.
src/hooks/auth/useSecurityManagerUI.ts(176,85): error TS2554: Expected 1-2 arguments, but got 3.
src/hooks/auth/useUserSetup.ts(155,23): error TS2554: Expected 3 arguments, but got 2.
src/hooks/auth/useUserSetup.ts(164,23): error TS2554: Expected 3 arguments, but got 2.
src/hooks/auth/useUserSetup.ts(267,19): error TS2554: Expected 3 arguments, but got 2.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(1,27): error TS6133: 'waitFor' is declared but its value is never read.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(2,1): error TS6133: 'Select' is declared but its value is never read.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(7,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(8,19): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(9,17): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(10,17): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(15,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(17,12): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(18,11): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(19,11): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(23,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(24,27): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(25,26): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(72,26): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(73,26): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(76,5): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(89,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(93,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(94,27): error TS2339: Property 'bulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(95,27): error TS2339: Property 'isProcessing' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(96,27): error TS2339: Property 'progress' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(97,27): error TS2339: Property 'operationResults' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(98,27): error TS2339: Property 'validationErrors' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(102,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(108,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(111,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(115,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(118,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(122,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(127,22): error TS2339: Property 'selectAllBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(130,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(134,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(139,22): error TS2339: Property 'selectAllBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(143,22): error TS2339: Property 'clearSelection' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(146,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(150,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(160,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(161,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(164,27): error TS2339: Property 'bulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(174,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(184,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(185,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(188,27): error TS2339: Property 'validationErrors' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(194,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(204,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(205,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(206,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(210,28): error TS2339: Property 'executeBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(216,27): error TS2339: Property 'isProcessing' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(222,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(231,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(232,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(236,28): error TS2339: Property 'executeBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(240,27): error TS2339: Property 'isProcessing' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(245,8): error TS6133: 'id' is declared but its value is never read.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(248,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(258,22): error TS2339: Property 'selectAllBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(259,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(263,28): error TS2339: Property 'executeBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(267,27): error TS2339: Property 'progress' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(268,27): error TS2339: Property 'isProcessing' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(272,27): error TS2339: Property 'progress' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(273,27): error TS2339: Property 'isProcessing' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(282,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(292,22): error TS2339: Property 'selectAllBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(293,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(297,28): error TS2339: Property 'executeBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(300,27): error TS2339: Property 'operationResults' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(301,27): error TS2339: Property 'operationResults' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(306,27): error TS2339: Property 'operationResults' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(311,27): error TS2339: Property 'operationResults' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(323,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(333,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(334,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(335,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(339,28): error TS2339: Property 'executeBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(342,34): error TS2339: Property 'getOperationStats' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(353,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(359,22): error TS2339: Property 'selectAllBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(360,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(367,22): error TS2339: Property 'resetOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(370,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(371,27): error TS2339: Property 'bulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(372,27): error TS2339: Property 'operationResults' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(373,27): error TS2339: Property 'validationErrors' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(374,27): error TS2339: Property 'progress' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(378,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(384,22): error TS2339: Property 'selectBillsByPredicate' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(387,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(391,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(396,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(397,22): error TS2339: Property 'selectBill' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(400,46): error TS2339: Property 'getSelectedBillsData' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(411,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(421,22): error TS2339: Property 'setBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(425,28): error TS2339: Property 'executeBulkOperation' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(429,27): error TS2339: Property 'validationErrors' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(433,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(438,22): error TS2339: Property 'selectAllBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx(441,27): error TS2339: Property 'selectedBills' does not exist on type '{ changes: {}; showConfirmation: boolean; setShowConfirmation: Dispatch<SetStateAction<boolean>>; initializeChanges: () => void; updateChange: (billId: any, field: any, value: any) => void; applyBulkChange: (field: any, value: any) => void; resetChanges: () => void; }'.
src/hooks/bills/useBillForm.ts(328,5): error TS4104: The type 'readonly string[]' is 'readonly' and cannot be assigned to the mutable type 'string[]'.
src/hooks/bills/useBillManager.ts(31,3): error TS2339: Property 'onUpdateBill' does not exist on type '{ propTransactions?: any[]; propEnvelopes?: any[]; }'.
src/hooks/bills/useBillManager.ts(32,3): error TS2339: Property 'onCreateRecurringBill' does not exist on type '{ propTransactions?: any[]; propEnvelopes?: any[]; }'.
src/hooks/bills/useBillManager.ts(33,3): error TS2339: Property 'onSearchNewBills' does not exist on type '{ propTransactions?: any[]; propEnvelopes?: any[]; }'.
src/hooks/bills/useBillManager.ts(34,3): error TS2339: Property 'onError' does not exist on type '{ propTransactions?: any[]; propEnvelopes?: any[]; }'.
src/hooks/bills/useBillManager.ts(37,11): error TS2339: Property 'data' does not exist on type '{ isLoading: false; isFetching: boolean; isError: boolean; error: Error; addTransaction: UseMutateFunction<any, Error, void, unknown>; addTransactionAsync: UseMutateAsyncFunction<...>; ... 28 more ...; transactions: any; }'.
src/hooks/bills/useBillManager.ts(117,22): error TS2345: Argument of type '{ id: any; updates: { isPaid: boolean; dueDate: any; paidDate: null; }; }' is not assignable to parameter of type 'void'.
src/hooks/bills/useBillManagerUI.ts(63,63): error TS2339: Property 'upcoming' does not exist on type '{}'.
src/hooks/bills/useBillManagerUI.ts(64,61): error TS2339: Property 'overdue' does not exist on type '{}'.
src/hooks/bills/useBillManagerUI.ts(65,55): error TS2339: Property 'paid' does not exist on type '{}'.
src/hooks/bills/useBillManagerUI.ts(144,13): error TS2339: Property 'overdue' does not exist on type '{}'.
src/hooks/bills/useBillManagerUI.ts(144,26): error TS2339: Property 'upcoming' does not exist on type '{}'.
src/hooks/bills/useBillManagerUI.ts(144,40): error TS2339: Property 'paid' does not exist on type '{}'.
src/hooks/bills/useBillManagerUI.ts(144,50): error TS2339: Property 'total' does not exist on type '{}'.
src/hooks/bills/useBills/billMutations.ts(9,47): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/hooks/bills/useBills/billMutations.ts(10,12): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/hooks/bills/useBills/billMutations.ts(52,27): error TS2554: Expected 3 arguments, but got 2.
src/hooks/bills/useBills/billMutations.ts(79,9): error TS2698: Spread types may only be created from object types.
src/hooks/bills/useBills/billMutations.ts(86,31): error TS2339: Property 'addBill' does not exist on type '{ updateEnvelope: (queryClient: any, envelopeId: any, updates: any) => Promise<void>; addEnvelope: (queryClient: any, newEnvelope: any) => Promise<void>; removeEnvelope: (queryClient: any, envelopeId: any) => Promise<...>; ... 7 more ...; createOptimisticMutation: (queryClient: any, { mutationKey, queryKey, updateFn...'.
src/hooks/bills/useBills/billMutations.ts(106,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/bills/useBills/billMutations.ts(113,22): error TS6133: 'billData' is declared but its value is never read.
src/hooks/bills/useBills/billMutations.ts(131,26): error TS2339: Property 'billId' does not exist on type 'void'.
src/hooks/bills/useBills/billMutations.ts(131,34): error TS2339: Property 'updates' does not exist on type 'void'.
src/hooks/bills/useBills/billMutations.ts(145,31): error TS2554: Expected 3 arguments, but got 2.
src/hooks/bills/useBills/billMutations.ts(156,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/bills/useBills/billMutations.ts(178,31): error TS2339: Property 'deleteBill' does not exist on type '{ updateEnvelope: (queryClient: any, envelopeId: any, updates: any) => Promise<void>; addEnvelope: (queryClient: any, newEnvelope: any) => Promise<void>; removeEnvelope: (queryClient: any, envelopeId: any) => Promise<...>; ... 7 more ...; createOptimisticMutation: (queryClient: any, { mutationKey, queryKey, updateFn...'.
src/hooks/bills/useBills/billMutations.ts(181,35): error TS2345: Argument of type 'void' is not assignable to parameter of type 'string'.
src/hooks/bills/useBills/billMutations.ts(183,39): error TS2345: Argument of type 'void' is not assignable to parameter of type '{}'.
src/hooks/bills/useBills/billMutations.ts(189,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/bills/useBills/billMutations.ts(209,26): error TS2339: Property 'billId' does not exist on type 'void'.
src/hooks/bills/useBills/billMutations.ts(209,34): error TS2339: Property 'paidAmount' does not exist on type 'void'.
src/hooks/bills/useBills/billMutations.ts(209,46): error TS2339: Property 'paidDate' does not exist on type 'void'.
src/hooks/bills/useBills/billMutations.ts(209,56): error TS2339: Property 'envelopeId' does not exist on type 'void'.
src/hooks/bills/useBills/billMutations.ts(226,31): error TS2554: Expected 3 arguments, but got 2.
src/hooks/bills/useBills/billMutations.ts(231,9): error TS2353: Object literal may only specify known properties, and 'updatedAt' does not exist in type 'UpdateSpec<Bill> | ((obj: Bill, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/hooks/bills/useBills/billMutations.ts(238,39): error TS2345: Argument of type '{ id: string; date: any; description: any; amount: number; envelopeId: any; category: any; type: string; source: string; billId: any; notes: string; createdAt: string; }' is not assignable to parameter of type 'Transaction'.
  Property 'lastModified' is missing in type '{ id: string; date: any; description: any; amount: number; envelopeId: any; category: any; type: string; source: string; billId: any; notes: string; createdAt: string; }' but required in type 'Transaction'.
src/hooks/bills/useBills/billMutations.ts(239,31): error TS2554: Expected 2 arguments, but got 1.
src/hooks/bills/useBills/billMutations.ts(250,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
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
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(92,36): error TS2339: Property 'name' does not exist on type '{}'.
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(99,71): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(102,72): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(167,36): error TS2339: Property 'name' does not exist on type '{}'.
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(168,36): error TS2339: Property 'monthlyAmount' does not exist on type '{}'.
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(187,36): error TS2339: Property 'name' does not exist on type '{}'.
src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts(193,34): error TS2554: Expected 1 arguments, but got 0.
src/hooks/budgeting/autofunding/useAutoFunding.ts(31,25): error TS2339: Property 'rules' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(32,45): error TS2339: Property 'rules' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(79,43): error TS2339: Property 'execution' does not exist on type '{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; } | { ...; }'.
  Property 'execution' does not exist on type '{ success: boolean; error: any; }'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(82,22): error TS2339: Property 'execution' does not exist on type '{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; } | { ...; }'.
  Property 'execution' does not exist on type '{ success: boolean; error: any; }'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(83,47): error TS2339: Property 'execution' does not exist on type '{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; } | { ...; }'.
  Property 'execution' does not exist on type '{ success: boolean; error: any; }'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(83,65): error TS2339: Property 'results' does not exist on type '{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; } | { ...; }'.
  Property 'results' does not exist on type '{ success: boolean; error: any; }'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(87,18): error TS2339: Property 'results' does not exist on type '{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; } | { ...; }'.
  Property 'results' does not exist on type '{ success: boolean; error: any; }'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(91,38): error TS2339: Property 'execution' does not exist on type '{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; } | { ...; }'.
  Property 'execution' does not exist on type '{ success: boolean; error: any; }'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(133,39): error TS2339: Property 'execution' does not exist on type '{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; }'.
  Property 'execution' does not exist on type '{ success: boolean; error: any; }'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(134,37): error TS2339: Property 'execution' does not exist on type '{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; }'.
  Property 'execution' does not exist on type '{ success: boolean; error: any; }'.
src/hooks/budgeting/autofunding/useAutoFundingData.ts(26,28): error TS2339: Property 'rules' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingData.ts(27,30): error TS2339: Property 'executionHistory' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingData.ts(28,31): error TS2339: Property 'undoStack' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingData.ts(33,26): error TS2339: Property 'lastSaved' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingData.ts(80,25): error TS2339: Property 'lastSaved' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingData.ts(83,26): error TS2339: Property 'rules' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingData.ts(84,28): error TS2339: Property 'executionHistory' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFundingHistory.ts(31,18): error TS2339: Property 'clearUndoStack' does not exist on type '{ undoStack: any[]; addToUndoStack: (executionRecord: any, executionResults: any) => void; getUndoableExecutions: () => any[]; getUndoStatistics: () => { totalUndoable: number; totalAmount: any; oldestUndoable: any; newestUndoable: any; }; undoLastExecution: () => Promise<...>; undoExecution: (executionId: any) => P...'.
src/hooks/budgeting/autofunding/useAutoFundingRules.ts(158,21): error TS2339: Property 'sort' does not exist on type '{}'.
src/hooks/budgeting/autofunding/useExecutionHistory.ts(37,21): error TS2339: Property 'trigger' does not exist on type '{}'.
src/hooks/budgeting/autofunding/useExecutionHistory.ts(39,58): error TS2339: Property 'trigger' does not exist on type '{}'.
src/hooks/budgeting/autofunding/useExecutionHistory.ts(43,21): error TS2339: Property 'successful' does not exist on type '{}'.
src/hooks/budgeting/autofunding/useExecutionHistory.ts(45,70): error TS2339: Property 'successful' does not exist on type '{}'.
src/hooks/budgeting/autofunding/useExecutionHistory.ts(49,21): error TS2339: Property 'dateFrom' does not exist on type '{}'.
src/hooks/budgeting/autofunding/useExecutionHistory.ts(50,45): error TS2339: Property 'dateFrom' does not exist on type '{}'.
src/hooks/budgeting/autofunding/useExecutionHistory.ts(56,21): error TS2339: Property 'dateTo' does not exist on type '{}'.
src/hooks/budgeting/autofunding/useExecutionHistory.ts(57,43): error TS2339: Property 'dateTo' does not exist on type '{}'.
src/hooks/budgeting/autofunding/useHistoryExport.ts(13,17): error TS2339: Property 'includeUndoStack' does not exist on type '{}'.
src/hooks/budgeting/autofunding/useHistoryExport.ts(13,42): error TS2339: Property 'dateFrom' does not exist on type '{}'.
src/hooks/budgeting/autofunding/useHistoryExport.ts(13,52): error TS2339: Property 'dateTo' does not exist on type '{}'.
src/hooks/budgeting/autofunding/useHistoryExport.ts(13,60): error TS2339: Property 'format' does not exist on type '{}'.
src/hooks/budgeting/autofunding/useHistoryExport.ts(57,6): error TS2448: Block-scoped variable 'exportToCsv' used before its declaration.
src/hooks/budgeting/autofunding/useHistoryExport.ts(57,19): error TS2448: Block-scoped variable 'generateFilename' used before its declaration.
src/hooks/budgeting/autofunding/useHistoryExport.ts(88,6): error TS2448: Block-scoped variable 'generateFilename' used before its declaration.
src/hooks/budgeting/autofunding/useUndoOperations.ts(130,30): error TS2448: Block-scoped variable 'undoExecution' used before its declaration.
src/hooks/budgeting/metadata/useActualBalance.ts(29,5): error TS2739: Type '{ unassignedCash: number; actualBalance: number; isActualBalanceManual: boolean; biweeklyAllocation: number; }' is missing the following properties from type 'BudgetRecord': id, lastModified
src/hooks/budgeting/metadata/useActualBalance.ts(93,26): error TS2339: Property 'balance' does not exist on type 'void'.
src/hooks/budgeting/metadata/useActualBalance.ts(93,35): error TS2339: Property 'isManual' does not exist on type 'void'.
src/hooks/budgeting/metadata/useActualBalance.ts(111,49): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/budgeting/metadata/useActualBalance.ts(121,15): error TS2339: Property 'isManual' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(121,32): error TS2339: Property 'author' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(127,43): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(130,55): error TS2345: Argument of type '{ balance: any; isManual: any; }' is not assignable to parameter of type 'void'.
src/hooks/budgeting/metadata/useActualBalance.ts(142,47): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(148,24): error TS2339: Property 'isActualBalanceManual' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(149,27): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(151,18): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(151,45): error TS2339: Property 'isActualBalanceManual' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(156,63): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(159,18): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(164,7): error TS2339: Property 'showCurrency' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(165,7): error TS2339: Property 'showSign' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(166,7): error TS2339: Property 'minimumFractionDigits' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(167,7): error TS2339: Property 'maximumFractionDigits' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(204,32): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalance.ts(205,40): error TS2339: Property 'isActualBalanceManual' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalanceOperations.ts(13,15): error TS2339: Property 'isManual' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalanceOperations.ts(13,32): error TS2339: Property 'author' does not exist on type '{}'.
src/hooks/budgeting/metadata/useActualBalanceOperations.ts(35,50): error TS2345: Argument of type '{ actualBalance: number; isActualBalanceManual: any; }' is not assignable to parameter of type 'void'.
src/hooks/budgeting/metadata/useBudgetMetadataMutation.ts(11,73): error TS2345: Argument of type 'void' is not assignable to parameter of type '{}'.
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
src/hooks/budgeting/metadata/useUnassignedCash.ts(40,9): error TS2739: Type '{ unassignedCash: number; actualBalance: number; isActualBalanceManual: boolean; biweeklyAllocation: number; }' is missing the following properties from type 'BudgetRecord': id, lastModified
src/hooks/budgeting/metadata/useUnassignedCash.ts(60,33): error TS2345: Argument of type 'void' is not assignable to parameter of type 'number'.
src/hooks/budgeting/metadata/useUnassignedCash.ts(66,49): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/budgeting/metadata/useUnassignedCash.ts(81,15): error TS2339: Property 'author' does not exist on type '{}'.
src/hooks/budgeting/metadata/useUnassignedCash.ts(81,40): error TS2339: Property 'source' does not exist on type '{}'.
src/hooks/budgeting/metadata/useUnassignedCash.ts(85,56): error TS2345: Argument of type 'number' is not assignable to parameter of type 'void'.
src/hooks/budgeting/metadata/useUnassignedCashOperations.ts(18,15): error TS2339: Property 'author' does not exist on type '{}'.
src/hooks/budgeting/metadata/useUnassignedCashOperations.ts(18,40): error TS2339: Property 'source' does not exist on type '{}'.
src/hooks/budgeting/metadata/useUnassignedCashOperations.ts(22,50): error TS2345: Argument of type '{ unassignedCash: number; }' is not assignable to parameter of type 'void'.
src/hooks/budgeting/useBudgetData/index.ts(42,47): error TS2339: Property 'unassignedCash' does not exist on type '{}'.
src/hooks/budgeting/useBudgetData/index.ts(43,46): error TS2339: Property 'actualBalance' does not exist on type '{}'.
src/hooks/budgeting/useBudgetData/mutations.ts(33,26): error TS2339: Property 'envelopeId' does not exist on type 'void'.
src/hooks/budgeting/useBudgetData/mutations.ts(33,38): error TS2339: Property 'updates' does not exist on type 'void'.
src/hooks/budgeting/useBudgetData/mutations.ts(80,59): error TS2769: No overload matches this call.
  Overload 1 of 4, '(key: string): PromiseExtended<Transaction>', gave the following error.
    Argument of type 'void' is not assignable to parameter of type 'string'.
  Overload 2 of 4, '(equalityCriterias: { [key: string]: any; }): PromiseExtended<Transaction>', gave the following error.
    Argument of type 'void' is not assignable to parameter of type '{ [key: string]: any; }'.
src/hooks/budgeting/useBudgetData/mutations.ts(86,23): error TS2339: Property 'paycheckId' does not exist on type 'Transaction'.
src/hooks/budgeting/useBudgetData/mutations.ts(89,35): error TS2339: Property 'paycheckId' does not exist on type 'Transaction'.
src/hooks/budgeting/useBudgetData/mutations.ts(93,81): error TS2339: Property 'paycheckId' does not exist on type 'Transaction'.
src/hooks/budgeting/useBudgetData/mutations.ts(101,38): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/budgeting/useBudgetData/mutations.ts(103,30): error TS2339: Property 'unassignedCashAfter' does not exist on type 'PaycheckHistory'.
src/hooks/budgeting/useBudgetData/mutations.ts(103,67): error TS2339: Property 'unassignedCashBefore' does not exist on type 'PaycheckHistory'.
src/hooks/budgeting/useBudgetData/mutations.ts(104,39): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/budgeting/useBudgetData/mutations.ts(113,32): error TS2339: Property 'envelopeAllocations' does not exist on type 'PaycheckHistory'.
src/hooks/budgeting/useBudgetData/mutations.ts(114,55): error TS2339: Property 'envelopeAllocations' does not exist on type 'PaycheckHistory'.
src/hooks/budgeting/useBudgetData/mutations.ts(126,63): error TS2339: Property 'paycheckId' does not exist on type 'Transaction'.
src/hooks/budgeting/useBudgetData/mutations.ts(129,39): error TS2339: Property 'paycheckId' does not exist on type 'Transaction'.
src/hooks/budgeting/useBudgetData/mutations.ts(130,55): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/budgeting/useBudgetData/mutations.ts(131,57): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/budgeting/useBudgetData/mutations.ts(135,48): error TS2345: Argument of type 'void' is not assignable to parameter of type 'string'.
src/hooks/budgeting/useBudgetData/mutations.ts(139,44): error TS2339: Property 'paycheckId' does not exist on type 'Transaction'.
src/hooks/budgeting/useBudgetData/mutations.ts(149,42): error TS2345: Argument of type 'void' is not assignable to parameter of type 'string'.
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
src/hooks/budgeting/useEnvelopeForm.ts(52,22): error TS2538: Type 'any' cannot be used as an index type.
src/hooks/budgeting/useEnvelopeForm.ts(143,19): error TS2554: Expected 3 arguments, but got 2.
src/hooks/budgeting/useEnvelopes.ts(10,47): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/hooks/budgeting/useEnvelopes.ts(11,12): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/hooks/budgeting/useEnvelopes.ts(21,11): error TS2339: Property 'category' does not exist on type '{}'.
src/hooks/budgeting/useEnvelopes.ts(21,21): error TS2339: Property 'includeArchived' does not exist on type '{}'.
src/hooks/budgeting/useEnvelopes.ts(21,46): error TS2339: Property 'sortBy' does not exist on type '{}'.
src/hooks/budgeting/useEnvelopes.ts(21,63): error TS2339: Property 'sortOrder' does not exist on type '{}'.
src/hooks/budgeting/useEnvelopes.ts(139,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/budgeting/useEnvelopes.ts(163,9): error TS2698: Spread types may only be created from object types.
src/hooks/budgeting/useEnvelopes.ts(166,24): error TS2339: Property 'envelopeType' does not exist on type 'void'.
src/hooks/budgeting/useEnvelopes.ts(167,52): error TS2339: Property 'category' does not exist on type 'void'.
src/hooks/budgeting/useEnvelopes.ts(171,31): error TS2554: Expected 2 arguments, but got 1.
src/hooks/budgeting/useEnvelopes.ts(194,26): error TS2339: Property 'id' does not exist on type 'void'.
src/hooks/budgeting/useEnvelopes.ts(194,30): error TS2339: Property 'updates' does not exist on type 'void'.
src/hooks/budgeting/useEnvelopes.ts(219,31): error TS2554: Expected 3 arguments, but got 2.
src/hooks/budgeting/useEnvelopes.ts(244,26): error TS2339: Property 'envelopeId' does not exist on type 'void'.
src/hooks/budgeting/useEnvelopes.ts(244,38): error TS2339: Property 'deleteBillsToo' does not exist on type 'void'.
src/hooks/budgeting/useEnvelopes.ts(277,37): error TS2339: Property 'removeBill' does not exist on type '{ updateEnvelope: (queryClient: any, envelopeId: any, updates: any) => Promise<void>; addEnvelope: (queryClient: any, newEnvelope: any) => Promise<void>; removeEnvelope: (queryClient: any, envelopeId: any) => Promise<...>; ... 7 more ...; createOptimisticMutation: (queryClient: any, { mutationKey, queryKey, updateFn...'.
src/hooks/budgeting/useEnvelopes.ts(293,37): error TS2554: Expected 3 arguments, but got 2.
src/hooks/budgeting/useEnvelopes.ts(299,31): error TS2554: Expected 2 arguments, but got 1.
src/hooks/budgeting/useEnvelopes.ts(330,26): error TS2339: Property 'fromEnvelopeId' does not exist on type 'void'.
src/hooks/budgeting/useEnvelopes.ts(330,42): error TS2339: Property 'toEnvelopeId' does not exist on type 'void'.
src/hooks/budgeting/useEnvelopes.ts(330,56): error TS2339: Property 'amount' does not exist on type 'void'.
src/hooks/budgeting/useEnvelopes.ts(330,64): error TS2339: Property 'description' does not exist on type 'void'.
src/hooks/budgeting/useEnvelopes.ts(346,9): error TS2353: Object literal may only specify known properties, and 'updatedAt' does not exist in type 'UpdateSpec<Envelope> | ((obj: Envelope, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/hooks/budgeting/useEnvelopes.ts(351,9): error TS2353: Object literal may only specify known properties, and 'updatedAt' does not exist in type 'UpdateSpec<Envelope> | ((obj: Envelope, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/hooks/budgeting/useEnvelopes.ts(366,39): error TS2345: Argument of type '{ id: string; amount: any; description: any; type: string; fromEnvelopeId: any; toEnvelopeId: any; date: string; createdAt: string; }' is not assignable to parameter of type 'Transaction'.
  Type '{ id: string; amount: any; description: any; type: string; fromEnvelopeId: any; toEnvelopeId: any; date: string; createdAt: string; }' is missing the following properties from type 'Transaction': envelopeId, category, lastModified
src/hooks/budgeting/useEnvelopes.ts(369,31): error TS2554: Expected 3 arguments, but got 2.
src/hooks/budgeting/useEnvelopes.ts(373,31): error TS2554: Expected 3 arguments, but got 2.
src/hooks/budgeting/useEnvelopes.ts(377,31): error TS2554: Expected 2 arguments, but got 1.
src/hooks/budgeting/useEnvelopes.ts(431,47): error TS2345: Argument of type '{ id: any; updates: { name: any; category: string; targetAmount: number; monthlyBudget: number; biweeklyAllocation: number; envelopeType: EnvelopeType; description: string; lastUpdate: string; }; }' is not assignable to parameter of type 'void'.
src/hooks/budgeting/useEnvelopes.ts(436,35): error TS2345: Argument of type '{ envelopeId: any; deleteBillsToo: boolean; }' is not assignable to parameter of type 'void'.
src/hooks/budgeting/useEnvelopes.ts(440,47): error TS2345: Argument of type '{ envelopeId: any; deleteBillsToo: boolean; }' is not assignable to parameter of type 'void'.
src/hooks/budgeting/usePaycheckForm.ts(92,19): error TS2554: Expected 3 arguments, but got 1.
src/hooks/budgeting/usePaycheckForm.ts(95,19): error TS2554: Expected 3 arguments, but got 1.
src/hooks/budgeting/usePaycheckHistory.ts(30,19): error TS2554: Expected 3 arguments, but got 1.
src/hooks/budgeting/usePaycheckHistory.ts(33,19): error TS2554: Expected 3 arguments, but got 1.
src/hooks/budgeting/usePaycheckProcessor.ts(125,21): error TS2554: Expected 3 arguments, but got 2.
src/hooks/budgeting/usePaycheckProcessor.ts(168,19): error TS2554: Expected 3 arguments, but got 2.
src/hooks/budgeting/usePaycheckProcessor.ts(188,5): error TS2448: Block-scoped variable 'resetForm' used before its declaration.
src/hooks/budgeting/useSmartSuggestions.ts(14,17): error TS2554: Expected 3 arguments, but got 2.
src/hooks/budgeting/useSmartSuggestions.ts(30,17): error TS2554: Expected 3 arguments, but got 2.
src/hooks/budgeting/useUnassignedCashDistribution.ts(113,65): error TS2365: Operator '+' cannot be applied to types 'unknown' and 'number'.
src/hooks/budgeting/useUnassignedCashDistribution.ts(113,83): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/hooks/budgeting/useUnassignedCashDistribution.ts(118,29): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/budgeting/useUnassignedCashDistribution.ts(123,12): error TS2365: Operator '>' cannot be applied to types 'unknown' and 'number'.
src/hooks/budgeting/useUnassignedCashDistribution.ts(207,47): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/hooks/budgeting/useUnassignedCashDistribution.ts(231,51): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/common/__tests__/useExportData.test.ts(14,13): error TS2339: Property 'mockReturnValue' does not exist on type 'UseBoundStore<StoreApi<AuthStore>>'.
src/hooks/common/__tests__/useExportData.test.ts(18,21): error TS2339: Property 'mockReturnValue' does not exist on type '() => { showSuccessToast: any; showErrorToast: any; showWarningToast: any; showInfoToast: any; showPaydayToast: any; }'.
src/hooks/common/__tests__/useExportData.test.ts(23,32): error TS2339: Property 'mockResolvedValue' does not exist on type '{ (): PromiseExtended<Envelope[]>; <R>(thenShortcut: ThenShortcut<Envelope[], R>): PromiseExtended<R>; }'.
src/hooks/common/__tests__/useExportData.test.ts(24,23): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<BudgetRecord>'.
src/hooks/common/__tests__/useExportData.test.ts(36,13): error TS2339: Property 'mockReturnValue' does not exist on type 'UseBoundStore<StoreApi<AuthStore>>'.
src/hooks/common/__tests__/useExportData.test.ts(40,21): error TS2339: Property 'mockReturnValue' does not exist on type '() => { showSuccessToast: any; showErrorToast: any; showWarningToast: any; showInfoToast: any; showPaydayToast: any; }'.
src/hooks/common/__tests__/useExportData.test.ts(45,32): error TS2339: Property 'mockResolvedValue' does not exist on type '{ (): PromiseExtended<Envelope[]>; <R>(thenShortcut: ThenShortcut<Envelope[], R>): PromiseExtended<R>; }'.
src/hooks/common/__tests__/useExportData.test.ts(46,23): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<BudgetRecord>'.
src/hooks/common/__tests__/useImportData.test.ts(26,13): error TS2339: Property 'mockReturnValue' does not exist on type 'UseBoundStore<StoreApi<AuthStore>>'.
src/hooks/common/__tests__/useImportData.test.ts(30,21): error TS2339: Property 'mockReturnValue' does not exist on type '() => { showSuccessToast: any; showErrorToast: any; showWarningToast: any; showInfoToast: any; showPaydayToast: any; }'.
src/hooks/common/__tests__/useImportData.test.ts(34,16): error TS2339: Property 'mockReturnValue' does not exist on type '() => (config?: {}) => Promise<unknown>'.
src/hooks/common/__tests__/useImportData.test.ts(35,21): error TS2339: Property 'mockResolvedValue' does not exist on type '(file: any) => Promise<unknown>'.
src/hooks/common/__tests__/useImportData.test.ts(36,26): error TS2339: Property 'mockReturnValue' does not exist on type '(importedData: any, currentUser: any) => { validatedData: any; hasBudgetIdMismatch: boolean; importBudgetId: any; }'.
src/hooks/common/__tests__/useImportData.test.ts(40,22): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<{ success: boolean; }>'.
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
src/hooks/common/useActualBalance.ts(25,15): error TS2339: Property 'isManual' does not exist on type '{}'.
src/hooks/common/useActualBalance.ts(25,32): error TS2339: Property 'source' does not exist on type '{}'.
src/hooks/common/useActualBalance.ts(104,7): error TS2339: Property 'showCurrency' does not exist on type '{}'.
src/hooks/common/useActualBalance.ts(105,7): error TS2339: Property 'showSign' does not exist on type '{}'.
src/hooks/common/useActualBalance.ts(106,7): error TS2339: Property 'minimumFractionDigits' does not exist on type '{}'.
src/hooks/common/useActualBalance.ts(107,7): error TS2339: Property 'maximumFractionDigits' does not exist on type '{}'.
src/hooks/common/useBugReportSubmission.ts(20,20): error TS2339: Property 'getSessionMetadata' does not exist on type 'HighlightPublicInterface'.
src/hooks/common/useBugReportSubmission.ts(21,57): error TS2339: Property 'getSessionMetadata' does not exist on type 'HighlightPublicInterface'.
src/hooks/common/useBugReportSubmission.ts(29,20): error TS2339: Property 'getCurrentSessionURL' does not exist on type 'HighlightPublicInterface'.
src/hooks/common/useBugReportSubmission.ts(30,40): error TS2339: Property 'getCurrentSessionURL' does not exist on type 'HighlightPublicInterface'.
src/hooks/common/useBugReportSubmission.ts(72,63): error TS2345: Argument of type '{ title: any; description: any; screenshot: any; sessionUrl: any; systemInfo: Promise<SystemInfo>; contextInfo: PageContext; severity: string; labels: string[]; }' is not assignable to parameter of type 'BugReportData'.
  Types of property 'severity' are incompatible.
    Type 'string' is not assignable to type '"low" | "medium" | "high" | "critical"'.
src/hooks/common/useBugReportV2.ts(6,8): error TS6133: 'React' is declared but its value is never read.
src/hooks/common/useBugReportV2.ts(23,11): error TS6196: 'BugReportSubmissionResult' is declared but never used.
src/hooks/common/useBugReportV2.ts(221,32): error TS2339: Property 'submissionId' does not exist on type '{ reportData: { title: any; hasScreenshot: boolean; systemInfo: SystemInfo; }; overallSuccess: boolean; error?: string; validationErrors?: string[]; attempts: number; results: unknown[]; success: boolean; }'.
src/hooks/common/useBugReportV2.ts(222,23): error TS2339: Property 'url' does not exist on type '{ reportData: { title: any; hasScreenshot: boolean; systemInfo: SystemInfo; }; overallSuccess: boolean; error?: string; validationErrors?: string[]; attempts: number; results: unknown[]; success: boolean; }'.
src/hooks/common/useBugReportV2.ts(223,28): error TS2339: Property 'primaryProvider' does not exist on type '{ reportData: { title: any; hasScreenshot: boolean; systemInfo: SystemInfo; }; overallSuccess: boolean; error?: string; validationErrors?: string[]; attempts: number; results: unknown[]; success: boolean; }'.
src/hooks/common/useBugReportV2.ts(224,36): error TS2339: Property 'screenshotStatus' does not exist on type '{ reportData: { title: any; hasScreenshot: boolean; systemInfo: SystemInfo; }; overallSuccess: boolean; error?: string; validationErrors?: string[]; attempts: number; results: unknown[]; success: boolean; }'.
src/hooks/common/useBugReportV2.ts(228,32): error TS2339: Property 'submissionId' does not exist on type '{ reportData: { title: any; hasScreenshot: boolean; systemInfo: SystemInfo; }; overallSuccess: boolean; error?: string; validationErrors?: string[]; attempts: number; results: unknown[]; success: boolean; }'.
src/hooks/common/useBugReportV2.ts(229,28): error TS2339: Property 'primaryProvider' does not exist on type '{ reportData: { title: any; hasScreenshot: boolean; systemInfo: SystemInfo; }; overallSuccess: boolean; error?: string; validationErrors?: string[]; attempts: number; results: unknown[]; success: boolean; }'.
src/hooks/common/useBugReportV2.ts(291,18): error TS2304: Cannot find name 'H'.
src/hooks/common/useBugReportV2.ts(292,14): error TS2304: Cannot find name 'H'.
src/hooks/common/useBugReportV2.ts(294,13): error TS2304: Cannot find name 'H'.
src/hooks/common/useBugReportV2.ts(305,25): error TS2304: Cannot find name 'H'.
src/hooks/common/useBugReportV2.ts(307,22): error TS2304: Cannot find name 'H'.
src/hooks/common/useBugReportV2.ts(307,68): error TS2304: Cannot find name 'H'.
src/hooks/common/useBugReportV2.ts(310,13): error TS2304: Cannot find name 'H'.
src/hooks/common/useBugReportV2.ts(330,18): error TS2304: Cannot find name 'H'.
src/hooks/common/useBugReportV2.ts(331,22): error TS2304: Cannot find name 'H'.
src/hooks/common/useBugReportV2.ts(334,18): error TS2304: Cannot find name 'H'.
src/hooks/common/useBugReportV2.ts(335,26): error TS2304: Cannot find name 'H'.
src/hooks/common/useConfirm.ts(36,11): error TS2339: Property 'showConfirm' does not exist on type '{}'.
src/hooks/common/useConfirm.ts(65,11): error TS2339: Property 'isOpen' does not exist on type '{}'.
src/hooks/common/useConfirm.ts(65,19): error TS2339: Property 'config' does not exist on type '{}'.
src/hooks/common/useConfirm.ts(65,27): error TS2339: Property 'resolver' does not exist on type '{}'.
src/hooks/common/useConfirm.ts(65,37): error TS2339: Property 'hideConfirm' does not exist on type '{}'.
src/hooks/common/useConnectionManager.ts(60,9): error TS2322: Type 'UseMutateFunction<any, Error, void, unknown>' is not assignable to type '(id: string, updates: Partial<Bill>) => Promise<void>'.
  Types of parameters 'variables' and 'id' are incompatible.
    Type 'string' is not assignable to type 'void'.
src/hooks/common/useConnectionManager.ts(61,9): error TS2322: Type 'UseMutateFunction<any, Error, { id: any; updates: any; author?: string; }, unknown>' is not assignable to type '(params: { id: string; updates: Partial<Debt>; }) => Promise<void>'.
  Type 'void' is not assignable to type 'Promise<void>'.
src/hooks/common/useConnectionManager.ts(78,9): error TS2322: Type 'Envelope[] | Bill[]' is not assignable to type 'Bill[]'.
  Type 'Envelope[]' is not assignable to type 'Bill[]'.
    Type 'Envelope' is missing the following properties from type 'Bill': dueDate, amount, isPaid, isRecurring
src/hooks/common/useConnectionManager.ts(79,9): error TS2322: Type 'UseMutateFunction<any, Error, void, unknown>' is not assignable to type '(id: string, updates: Partial<Bill>) => Promise<void>'.
  Types of parameters 'variables' and 'id' are incompatible.
    Type 'string' is not assignable to type 'void'.
src/hooks/common/useConnectionManager.ts(80,9): error TS2322: Type 'UseMutateFunction<any, Error, { id: any; updates: any; author?: string; }, unknown>' is not assignable to type '(params: { id: string; updates: Partial<Debt>; }) => Promise<void>'.
  Type 'void' is not assignable to type 'Promise<void>'.
src/hooks/common/useConnectionManager.ts(96,9): error TS2322: Type 'UseMutateFunction<{ id: any; updates: any; }, Error, void, unknown>' is not assignable to type '(id: string, updates: Partial<Envelope>) => Promise<void>'.
  Types of parameters 'variables' and 'id' are incompatible.
    Type 'string' is not assignable to type 'void'.
src/hooks/common/useConnectionManager/useConnectionData.ts(30,30): error TS2339: Property 'envelopeId' does not exist on type 'Envelope | Bill | Debt'.
  Property 'envelopeId' does not exist on type 'Envelope'.
src/hooks/common/useConnectionManager/useConnectionData.ts(31,60): error TS2339: Property 'envelopeId' does not exist on type 'Envelope | Bill | Debt'.
  Property 'envelopeId' does not exist on type 'Envelope'.
src/hooks/common/useConnectionManager/useConnectionData.ts(38,30): error TS2339: Property 'envelopeId' does not exist on type 'Envelope | Bill | Debt'.
  Property 'envelopeId' does not exist on type 'Envelope'.
src/hooks/common/useConnectionManager/useConnectionData.ts(39,60): error TS2339: Property 'envelopeId' does not exist on type 'Envelope | Bill | Debt'.
  Property 'envelopeId' does not exist on type 'Envelope'.
src/hooks/common/useConnectionManager/useConnectionData.ts(51,57): error TS2339: Property 'billId' does not exist on type 'Envelope'.
src/hooks/common/useConnectionManager/useConnectionData.ts(51,76): error TS2339: Property 'billId' does not exist on type 'Envelope'.
src/hooks/common/useConnectionManager/useConnectionData.ts(57,57): error TS2339: Property 'debtId' does not exist on type 'Envelope'.
src/hooks/common/useConnectionManager/useConnectionData.ts(57,76): error TS2339: Property 'debtId' does not exist on type 'Envelope'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(90,58): error TS2339: Property 'provider' does not exist on type 'Envelope | Bill | Debt'.
  Property 'provider' does not exist on type 'Envelope'.
src/hooks/common/useConnectionManager/useConnectionOperations.ts(174,55): error TS2353: Object literal may only specify known properties, and 'envelopeId' does not exist in type 'Partial<Debt>'.
src/hooks/common/useDataInitialization.ts(12,65): error TS2339: Property 'autoAllocate' does not exist on type 'Envelope'.
src/hooks/common/useDataInitialization.ts(21,11): error TS2353: Object literal may only specify known properties, and 'autoAllocate' does not exist in type 'UpdateSpec<Envelope> | ((obj: Envelope, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/hooks/common/useDataManagement.ts(25,5): error TS2322: Type '(event: any) => Promise<{ success: boolean; imported: { envelopes: any; bills: any; transactions: any; savingsGoals: any; debts: any; paycheckHistory: any; auditLog: any; }; }>' is not assignable to type '(file: File) => Promise<void>'.
  Type 'Promise<{ success: boolean; imported: { envelopes: any; bills: any; transactions: any; savingsGoals: any; debts: any; paycheckHistory: any; auditLog: any; }; }>' is not assignable to type 'Promise<void>'.
    Type '{ success: boolean; imported: { envelopes: any; bills: any; transactions: any; savingsGoals: any; debts: any; paycheckHistory: any; auditLog: any; }; }' is not assignable to type 'void'.
src/hooks/common/useDataManagement.ts(26,5): error TS2322: Type '() => void' is not assignable to type '() => Promise<void>'.
  Type 'void' is not assignable to type 'Promise<void>'.
src/hooks/common/useEditLock.ts(18,5): error TS2339: Property 'autoAcquire' does not exist on type '{}'.
src/hooks/common/useEditLock.ts(19,5): error TS2339: Property 'autoRelease' does not exist on type '{}'.
src/hooks/common/useEditLock.ts(20,5): error TS2339: Property 'showToasts' does not exist on type '{}'.
src/hooks/common/useEditLock.ts(32,25): error TS2339: Property 'currentUser' does not exist on type 'EditLockService'.
src/hooks/common/useEditLock.ts(33,25): error TS2339: Property 'currentUser' does not exist on type 'EditLockService'.
src/hooks/common/useEditLock.ts(34,33): error TS2339: Property 'currentUser' does not exist on type 'EditLockService'.
src/hooks/common/useEditLock.ts(77,44): error TS2339: Property 'expiresAt' does not exist on type '{ success: boolean; reason: string; lockedBy: any; expiresAt: any; } | { success: boolean; reason: string; lockDoc: any; error?: undefined; } | { success: boolean; reason: string; error: any; lockDoc?: undefined; } | { ...; } | { ...; }'.
  Property 'expiresAt' does not exist on type '{ success: boolean; reason: string; lockDoc: any; error?: undefined; }'.
src/hooks/common/useEditLock.ts(77,56): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/common/useEditLock.ts(81,30): error TS2339: Property 'lockedBy' does not exist on type '{ success: boolean; reason: string; lockedBy: any; expiresAt: any; } | { success: boolean; reason: string; lockDoc: any; error?: undefined; } | { success: boolean; reason: string; error: any; lockDoc?: undefined; } | { ...; } | { ...; }'.
  Property 'lockedBy' does not exist on type '{ success: boolean; reason: string; lockDoc: any; error?: undefined; }'.
src/hooks/common/useEditLock.ts(182,90): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/common/useImportData.ts(102,41): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/hooks/common/useOnboardingAutoComplete.ts(13,11): error TS2339: Property 'markStepComplete' does not exist on type '{}'.
src/hooks/common/useOnboardingAutoComplete.ts(13,29): error TS2339: Property 'isStepComplete' does not exist on type '{}'.
src/hooks/common/useOnboardingAutoComplete.ts(13,45): error TS2339: Property 'preferences' does not exist on type '{}'.
src/hooks/common/useOnboardingAutoComplete.ts(13,58): error TS2339: Property 'isOnboarded' does not exist on type '{}'.
src/hooks/common/useOnboardingAutoComplete.ts(17,11): error TS2339: Property 'data' does not exist on type '{ isLoading: false; isFetching: boolean; isError: boolean; error: Error; addTransaction: UseMutateFunction<any, Error, void, unknown>; addTransactionAsync: UseMutateAsyncFunction<...>; ... 28 more ...; transactions: any; }'.
src/hooks/common/usePrompt.ts(45,11): error TS2339: Property 'showPrompt' does not exist on type '{}'.
src/hooks/common/usePrompt.ts(78,11): error TS2339: Property 'isOpen' does not exist on type '{}'.
src/hooks/common/usePrompt.ts(78,19): error TS2339: Property 'config' does not exist on type '{}'.
src/hooks/common/usePrompt.ts(78,27): error TS2339: Property 'resolver' does not exist on type '{}'.
src/hooks/common/usePrompt.ts(78,37): error TS2339: Property 'hidePrompt' does not exist on type '{}'.
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
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(218,38): error TS2554: Expected 2 arguments, but got 1.
src/hooks/dashboard/__tests__/useMainDashboard.test.ts(233,38): error TS2554: Expected 2 arguments, but got 1.
src/hooks/dashboard/useMainDashboard.ts(78,43): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/hooks/dashboard/useMainDashboard.ts(195,17): error TS2554: Expected 3 arguments, but got 2.
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
src/hooks/debts/__tests__/useDebtForm.test.ts(180,28): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/debts/__tests__/useDebtForm.test.ts(226,28): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/debts/__tests__/useDebtForm.test.ts(247,28): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/debts/__tests__/useDebtForm.test.ts(265,36): error TS2339: Property 'submit' does not exist on type '{}'.
src/hooks/debts/__tests__/useDebtForm.test.ts(269,28): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/debts/__tests__/useDebtForm.test.ts(312,28): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/debts/useDebtDashboard.ts(18,5): error TS2339: Property '_linkDebtToBill' does not exist on type '{ debts: DebtAccount[]; debtStats: { totalDebt: number; totalMonthlyPayments: number; averageInterestRate: number; debtsByType: {}; totalInterestPaid: number; activeDebtCount: number; totalDebtCount: number; dueSoonAmount: number; dueSoonCount: number; }; ... 12 more ...; COMPOUND_FREQUENCIES: { ...; }; }'.
src/hooks/debts/useDebtDashboard.ts(18,5): error TS6133: '_linkDebtToBill' is declared but its value is never read.
src/hooks/debts/useDebtManagement.ts(28,23): error TS2339: Property 'createBill' does not exist on type '{ refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<any[], Error>>; invalidate: () => Promise<void>; ... 36 more ...; bills: any[]; }'.
src/hooks/debts/useDebtManagement.ts(29,27): error TS2339: Property 'createEnvelope' does not exist on type '{ envelopes: any; totalBalance: any; totalTargetAmount: any; underfundedEnvelopes: any; overfundedEnvelopes: any; availableCategories: unknown[]; isLoading: false; isFetching: boolean; isError: boolean; ... 17 more ...; invalidate: () => Promise<...>; }'.
src/hooks/debts/useDebtManagement.ts(30,30): error TS2339: Property 'createTransaction' does not exist on type '{ isLoading: false; isFetching: boolean; isError: boolean; error: Error; addTransaction: UseMutateFunction<any, Error, void, unknown>; addTransactionAsync: UseMutateAsyncFunction<...>; ... 28 more ...; transactions: any; }'.
src/hooks/debts/useDebtManagement.ts(54,16): error TS2339: Property 'envelopeId' does not exist on type 'Debt'.
src/hooks/debts/useDebtManagement.ts(55,53): error TS2339: Property 'envelopeId' does not exist on type 'Debt'.
src/hooks/debts/useDebtManagement.ts(64,39): error TS2345: Argument of type 'Debt' is not assignable to parameter of type 'DebtAccount'.
  Type 'Debt' is missing the following properties from type 'DebtAccount': balance, paymentFrequency, compoundFrequency
src/hooks/debts/useDebtManagement.ts(80,42): error TS2339: Property 'currentBalance' does not exist on type 'DebtAccount'.
src/hooks/debts/useDebtManagement.ts(124,43): error TS2339: Property 'currentBalance' does not exist on type 'DebtAccount'.
src/hooks/debts/useDebtManagement.ts(186,42): error TS2353: Object literal may only specify known properties, and 'debtId' does not exist in type 'MutateOptions<any, Error, void, unknown>'.
src/hooks/debts/useDebtManagement.ts(280,9): error TS2353: Object literal may only specify known properties, and 'debtId' does not exist in type 'MutateOptions<any, Error, void, unknown>'.
src/hooks/debts/useDebtManagement.ts(305,32): error TS2339: Property 'paymentDueDate' does not exist on type 'Debt'.
src/hooks/debts/useDebtModalLogic.ts(64,9): error TS2353: Object literal may only specify known properties, and 'currentBalance' does not exist in type 'DebtFormData'.
src/hooks/debts/useDebts.ts(98,31): error TS2339: Property 'paymentHistory' does not exist on type 'Debt'.
src/hooks/debts/useDebts.ts(110,7): error TS2353: Object literal may only specify known properties, and 'paymentHistory' does not exist in type 'UpdateSpec<Debt> | ((obj: Debt, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/hooks/debts/useDebts.ts(132,49): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/layout/__tests__/useLayoutData.test.ts(43,10): error TS2724: '"../../../utils/budgeting/envelopeCalculations"' has no exported member named 'calculateEnvelopeSummary'. Did you mean 'calculateEnvelopeData'?
src/hooks/layout/__tests__/useLayoutData.test.ts(53,19): error TS2339: Property 'mockReturnValue' does not exist on type '() => { envelopes: Envelope[]; transactions: any; bills: Bill[]; savingsGoals: SavingsGoal[]; paycheckHistory: PaycheckHistory[]; dashboardSummary: {}; ... 33 more ...; dashboardError: Error; }'.
src/hooks/layout/__tests__/useLayoutData.test.ts(69,19): error TS2339: Property 'mockReturnValue' does not exist on type '() => { envelopes: Envelope[]; transactions: any; bills: Bill[]; savingsGoals: SavingsGoal[]; paycheckHistory: PaycheckHistory[]; dashboardSummary: {}; ... 33 more ...; dashboardError: Error; }'.
src/hooks/layout/__tests__/useLayoutData.test.ts(91,19): error TS2339: Property 'mockReturnValue' does not exist on type '() => { envelopes: Envelope[]; transactions: any; bills: Bill[]; savingsGoals: SavingsGoal[]; paycheckHistory: PaycheckHistory[]; dashboardSummary: {}; ... 33 more ...; dashboardError: Error; }'.
src/hooks/layout/__tests__/useLayoutData.test.ts(119,19): error TS2339: Property 'mockReturnValue' does not exist on type '() => { envelopes: Envelope[]; transactions: any; bills: Bill[]; savingsGoals: SavingsGoal[]; paycheckHistory: PaycheckHistory[]; dashboardSummary: {}; ... 33 more ...; dashboardError: Error; }'.
src/hooks/layout/__tests__/useLayoutData.test.ts(132,19): error TS2339: Property 'mockReturnValue' does not exist on type '() => { envelopes: Envelope[]; transactions: any; bills: Bill[]; savingsGoals: SavingsGoal[]; paycheckHistory: PaycheckHistory[]; dashboardSummary: {}; ... 33 more ...; dashboardError: Error; }'.
src/hooks/layout/__tests__/useLayoutData.test.ts(139,14): error TS2339: Property 'mockReturnValue' does not exist on type '(options?: {}) => { refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<any[], Error>>; invalidate: () => Promise<void>; ... 36 more ...; bills: any[]; }'.
src/hooks/layout/__tests__/useLayoutData.test.ts(151,19): error TS2339: Property 'mockReturnValue' does not exist on type '() => { envelopes: Envelope[]; transactions: any; bills: Bill[]; savingsGoals: SavingsGoal[]; paycheckHistory: PaycheckHistory[]; dashboardSummary: {}; ... 33 more ...; dashboardError: Error; }'.
src/hooks/layout/__tests__/useLayoutData.test.ts(166,19): error TS2339: Property 'mockReturnValue' does not exist on type '() => { envelopes: Envelope[]; transactions: any; bills: Bill[]; savingsGoals: SavingsGoal[]; paycheckHistory: PaycheckHistory[]; dashboardSummary: {}; ... 33 more ...; dashboardError: Error; }'.
src/hooks/layout/useLayoutData.ts(74,26): error TS2339: Property 'error' does not exist on type '{ envelopes: Envelope[]; transactions: any; bills: Bill[]; savingsGoals: SavingsGoal[]; paycheckHistory: PaycheckHistory[]; dashboardSummary: {}; ... 33 more ...; dashboardError: Error; }'.
src/hooks/mobile/useFABModalIntegration.ts(13,37): error TS2554: Expected 1 arguments, but got 2.
src/hooks/mobile/useFABModalIntegration.ts(21,36): error TS2554: Expected 1 arguments, but got 2.
src/hooks/mobile/useFABModalIntegration.ts(30,34): error TS2554: Expected 1 arguments, but got 2.
src/hooks/mobile/useFABModalIntegration.ts(39,27): error TS2554: Expected 1 arguments, but got 2.
src/hooks/mobile/useFABModalIntegration.ts(47,33): error TS2554: Expected 1 arguments, but got 2.
src/hooks/mobile/useFABModalIntegration.ts(56,35): error TS2554: Expected 1 arguments, but got 2.
src/hooks/mobile/useFABModalIntegration.ts(64,37): error TS2554: Expected 1 arguments, but got 2.
src/hooks/mobile/useFABModalIntegration.ts(73,37): error TS2554: Expected 1 arguments, but got 2.
src/hooks/mobile/useFABModalIntegration.ts(81,31): error TS2554: Expected 1 arguments, but got 2.
src/hooks/mobile/useFABModalIntegration.ts(90,27): error TS2554: Expected 1 arguments, but got 2.
src/hooks/receipts/__tests__/useReceiptScanner.test.ts(17,7): error TS2353: Object literal may only specify known properties, and 'size' does not exist in type 'FilePropertyBag'.
src/hooks/receipts/__tests__/useReceiptScanner.test.ts(20,25): error TS2339: Property 'mockClear' does not exist on type '(imageSource: any) => Promise<{ rawText: any; confidence: any; processingTime: number; total: any; merchant: any; date: any; time: any; tax: any; subtotal: any; items: any[]; }>'.
src/hooks/receipts/__tests__/useReceiptScanner.test.ts(59,7): error TS2353: Object literal may only specify known properties, and 'size' does not exist in type 'FilePropertyBag'.
src/hooks/receipts/__tests__/useReceiptScanner.test.ts(79,25): error TS2339: Property 'mockResolvedValue' does not exist on type '(imageSource: any) => Promise<{ rawText: any; confidence: any; processingTime: number; total: any; merchant: any; date: any; time: any; tax: any; subtotal: any; items: any[]; }>'.
src/hooks/receipts/__tests__/useReceiptScanner.test.ts(99,25): error TS2339: Property 'mockRejectedValue' does not exist on type '(imageSource: any) => Promise<{ rawText: any; confidence: any; processingTime: number; total: any; merchant: any; date: any; time: any; tax: any; subtotal: any; items: any[]; }>'.
src/hooks/receipts/__tests__/useReceiptScanner.test.ts(116,25): error TS2339: Property 'mockResolvedValue' does not exist on type '(imageSource: any) => Promise<{ rawText: any; confidence: any; processingTime: number; total: any; merchant: any; date: any; time: any; tax: any; subtotal: any; items: any[]; }>'.
src/hooks/receipts/useReceiptToTransaction.ts(71,53): error TS2345: Argument of type '{ amount: number; description: any; date: any; envelopeId: string; category: string; type: string; notes: string; }' is not assignable to parameter of type 'void'.
src/hooks/receipts/useReceiptToTransaction.ts(77,45): error TS2345: Argument of type '{ merchant: any; amount: any; date: any; transactionId: any; imageData: any; ocrData: { rawText: any; confidence: any; items: any; tax: any; subtotal: any; processingTime: any; }; }' is not assignable to parameter of type 'void'.
src/hooks/savings/useSavingsGoals/index.ts(19,5): error TS2339: Property 'status' does not exist on type '{}'.
src/hooks/savings/useSavingsGoals/index.ts(20,5): error TS2339: Property 'sortBy' does not exist on type '{}'.
src/hooks/savings/useSavingsGoals/index.ts(21,5): error TS2339: Property 'sortOrder' does not exist on type '{}'.
src/hooks/savings/useSavingsGoals/index.ts(22,5): error TS2339: Property 'includeCompleted' does not exist on type '{}'.
src/hooks/savings/useSavingsGoals/index.ts(100,54): error TS2345: Argument of type '{ goalId: any; updates: any; }' is not assignable to parameter of type 'void'.
src/hooks/savings/useSavingsGoals/index.ts(112,52): error TS2345: Argument of type '{ goalId: any; amount: any; description: any; }' is not assignable to parameter of type 'void'.
src/hooks/savings/useSavingsGoals/index.ts(122,52): error TS2345: Argument of type '{ distribution: any; description: any; }' is not assignable to parameter of type 'void'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(9,47): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/hooks/savings/useSavingsGoals/savingsMutations.ts(10,12): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
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
src/hooks/savings/useSavingsGoals/savingsMutations.ts(126,47): error TS2345: Argument of type 'void' is not assignable to parameter of type '{}'.
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
src/hooks/savings/useSavingsGoals/savingsQueries.ts(18,5): error TS2339: Property 'status' does not exist on type '{}'.
src/hooks/savings/useSavingsGoals/savingsQueries.ts(19,5): error TS2339: Property 'sortBy' does not exist on type '{}'.
src/hooks/savings/useSavingsGoals/savingsQueries.ts(20,5): error TS2339: Property 'sortOrder' does not exist on type '{}'.
src/hooks/savings/useSavingsGoals/savingsQueries.ts(21,5): error TS2339: Property 'includeCompleted' does not exist on type '{}'.
src/hooks/savings/useSavingsGoals/savingsQueries.ts(70,5): error TS2339: Property 'status' does not exist on type '{}'.
src/hooks/savings/useSavingsGoals/savingsQueries.ts(71,5): error TS2339: Property 'sortBy' does not exist on type '{}'.
src/hooks/savings/useSavingsGoals/savingsQueries.ts(72,5): error TS2339: Property 'sortOrder' does not exist on type '{}'.
src/hooks/savings/useSavingsGoals/savingsQueries.ts(73,5): error TS2339: Property 'includeCompleted' does not exist on type '{}'.
src/hooks/savings/useSavingsGoals/savingsQueries.ts(79,42): error TS2554: Expected 0 arguments, but got 1.
src/hooks/savings/useSavingsGoals/savingsQueries.ts(127,49): error TS2322: Type '() => string[]' is not assignable to type 'readonly unknown[]'.
src/hooks/savings/useSavingsGoalsActions.ts(24,21): error TS2339: Property 'success' does not exist on type '{ showSuccess: (message: any, title: any, duration: any) => any; showError: (message: any, title: any, duration: any) => any; showWarning: (message: any, title: any, duration: any) => any; showInfo: (message: any, title: any, duration: any) => any; showPayday: (message: any, title: any, duration: any) => any; }'.
src/hooks/savings/useSavingsGoalsActions.ts(29,21): error TS2339: Property 'success' does not exist on type '{ showSuccess: (message: any, title: any, duration: any) => any; showError: (message: any, title: any, duration: any) => any; showWarning: (message: any, title: any, duration: any) => any; showInfo: (message: any, title: any, duration: any) => any; showPayday: (message: any, title: any, duration: any) => any; }'.
src/hooks/savings/useSavingsGoalsActions.ts(33,19): error TS2339: Property 'error' does not exist on type '{ showSuccess: (message: any, title: any, duration: any) => any; showError: (message: any, title: any, duration: any) => any; showWarning: (message: any, title: any, duration: any) => any; showInfo: (message: any, title: any, duration: any) => any; showPayday: (message: any, title: any, duration: any) => any; }'.
src/hooks/savings/useSavingsGoalsActions.ts(55,21): error TS2339: Property 'success' does not exist on type '{ showSuccess: (message: any, title: any, duration: any) => any; showError: (message: any, title: any, duration: any) => any; showWarning: (message: any, title: any, duration: any) => any; showInfo: (message: any, title: any, duration: any) => any; showPayday: (message: any, title: any, duration: any) => any; }'.
src/hooks/savings/useSavingsGoalsActions.ts(57,21): error TS2339: Property 'error' does not exist on type '{ showSuccess: (message: any, title: any, duration: any) => any; showError: (message: any, title: any, duration: any) => any; showWarning: (message: any, title: any, duration: any) => any; showInfo: (message: any, title: any, duration: any) => any; showPayday: (message: any, title: any, duration: any) => any; }'.
src/hooks/savings/useSavingsGoalsActions.ts(67,19): error TS2339: Property 'success' does not exist on type '{ showSuccess: (message: any, title: any, duration: any) => any; showError: (message: any, title: any, duration: any) => any; showWarning: (message: any, title: any, duration: any) => any; showInfo: (message: any, title: any, duration: any) => any; showPayday: (message: any, title: any, duration: any) => any; }'.
src/hooks/savings/useSavingsGoalsActions.ts(69,19): error TS2339: Property 'error' does not exist on type '{ showSuccess: (message: any, title: any, duration: any) => any; showError: (message: any, title: any, duration: any) => any; showWarning: (message: any, title: any, duration: any) => any; showInfo: (message: any, title: any, duration: any) => any; showPayday: (message: any, title: any, duration: any) => any; }'.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(5,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(6,23): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(23,21): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(24,26): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(30,5): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(93,23): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(94,30): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/security/__tests__/useSecuritySettingsLogic.test.ts(99,5): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(151,32): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<any>'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(204,29): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<{ commit: { hash: string; timestamp: number; message: string; author: string; parentHash: any; encryptedSnapshot: string; deviceFingerprint: string; }; changes: ({ commitHash: string; entityType: string; ... 4 more ...; afterData: { ...; }; } | { ...; })[]; }>'.
src/hooks/settings/__tests__/useSettingsDashboard.test.ts(224,29): error TS2339: Property 'mockRejectedValue' does not exist on type '() => Promise<{ commit: { hash: string; timestamp: number; message: string; author: string; parentHash: any; encryptedSnapshot: string; deviceFingerprint: string; }; changes: ({ commitHash: string; entityType: string; ... 4 more ...; afterData: { ...; }; } | { ...; })[]; }>'.
src/hooks/settings/__tests__/useTransactionArchiving.test.ts(138,42): error TS2554: Expected 1 arguments, but got 0.
src/hooks/settings/useSettingsDashboard.ts(146,29): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/hooks/settings/useSettingsDashboard.ts(229,19): error TS2554: Expected 3 arguments, but got 2.
src/hooks/settings/useTransactionArchiving.ts(37,47): error TS2307: Cannot find module '../../utils/transactionArchiving' or its corresponding type declarations.
src/hooks/settings/useTransactionArchiving.ts(118,13): error TS2339: Property 'onSuccess' does not exist on type '{}'.
src/hooks/settings/useTransactionArchiving.ts(118,24): error TS2339: Property 'onError' does not exist on type '{}'.
src/hooks/settings/useTransactionArchiving.ts(118,33): error TS2339: Property '_onReset' does not exist on type '{}'.
src/hooks/settings/useTransactionArchiving.ts(118,33): error TS6133: '_onReset' is declared but its value is never read.
src/hooks/sharing/useBudgetJoining.ts(65,27): error TS2345: Argument of type 'Location' is not assignable to parameter of type 'string | URL'.
  Type 'Location' is missing the following properties from type 'URL': password, searchParams, username, toJSON
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(5,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(6,23): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(9,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(16,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(18,12): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(19,11): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(27,5): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(28,5): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(32,5): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(33,5): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(119,7): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(131,7): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(146,45): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(169,41): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/__tests__/useSyncHealthIndicator.test.ts(207,7): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/sync/useFirebaseSync.ts(108,9): error TS6133: '_handleManualSave' is declared but its value is never read.
src/hooks/sync/useFirebaseSync.ts(113,28): error TS2339: Property 'success' does not exist on type 'unknown'.
src/hooks/sync/useFirebaseSync.ts(132,28): error TS2339: Property 'success' does not exist on type 'unknown'.
src/hooks/sync/useManualSync.ts(88,30): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/hooks/sync/useManualSync.ts(138,30): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/hooks/sync/useManualSync.ts(233,43): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/hooks/sync/useManualSync.ts(234,7): error TS2322: Type '{ isSyncing: any; isRunning: any; lastSyncTime: number; syncIntervalMs: number; syncType: string; hasConfig: boolean; }' is not assignable to type 'ServiceStatus'.
  Types of property 'lastSyncTime' are incompatible.
    Type 'number' is not assignable to type 'Date'.
src/hooks/sync/useSyncHealthIndicator.ts(9,5): error TS2717: Subsequent property declarations must have the same type.  Property 'runMasterSyncValidation' must be of type '() => Promise<ValidationResults>', but here has type '() => Promise<ValidationResults>'.
src/hooks/sync/useSyncHealthIndicator.ts(10,5): error TS2717: Subsequent property declarations must have the same type.  Property 'forceCloudDataReset' must be of type '() => Promise<{ success: boolean; message?: string; error?: string; }>', but here has type '() => Promise<RecoveryResult>'.
src/hooks/sync/useSyncHealthIndicator.ts(95,42): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/hooks/sync/useSyncHealthIndicator.ts(95,72): error TS2339: Property 'activeSyncPromise' does not exist on type 'CloudSyncService'.
src/hooks/sync/useSyncHealthIndicator.ts(147,11): error TS2719: Type 'ValidationResults' is not assignable to type 'ValidationResults'. Two different types with this name exist, but they are unrelated.
  Types of property 'summary' are incompatible.
    Type 'ValidationSummary' is not assignable to type '{ [key: string]: unknown; overallStatus: string; totalFailed: number; }'.
      Index signature for type 'string' is missing in type 'ValidationSummary'.
src/hooks/transactions/__tests__/useTransactionAnalytics.test.ts(2,22): error TS6133: 'act' is declared but its value is never read.
src/hooks/transactions/__tests__/useTransactionAnalytics.test.ts(3,8): error TS2613: Module '"violet-vault/src/hooks/transactions/useTransactionAnalytics"' has no default export. Did you mean to use 'import { useTransactionAnalytics } from "/Users/thef4tdaddy/Git/violet-vault/src/hooks/transactions/useTransactionAnalytics"' instead?
src/hooks/transactions/__tests__/useTransactionAnalytics.test.ts(239,18): error TS2322: Type '({ id: string; description: string; amount: number; date: string; category: string; tags: string[]; } | { id: string; description: string; amount: number; date: string; category: string; })[]' is not assignable to type '{ id: string; description: string; amount: number; date: string; category: string; tags: string[]; }[]'.
  Type '{ id: string; description: string; amount: number; date: string; category: string; tags: string[]; } | { id: string; description: string; amount: number; date: string; category: string; }' is not assignable to type '{ id: string; description: string; amount: number; date: string; category: string; tags: string[]; }'.
    Property 'tags' is missing in type '{ id: string; description: string; amount: number; date: string; category: string; }' but required in type '{ id: string; description: string; amount: number; date: string; category: string; tags: string[]; }'.
src/hooks/transactions/__tests__/useTransactionBalanceUpdater.test.ts(3,8): error TS2613: Module '"violet-vault/src/hooks/transactions/useTransactionBalanceUpdater"' has no default export. Did you mean to use 'import { useTransactionBalanceUpdater } from "/Users/thef4tdaddy/Git/violet-vault/src/hooks/transactions/useTransactionBalanceUpdater"' instead?
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(1,22): error TS6133: 'act' is declared but its value is never read.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(5,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(6,20): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(7,20): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(8,24): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(9,22): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(10,17): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionFilters.test.ts(59,5): error TS2708: Cannot use namespace 'jest' as a value.
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
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(6,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(7,20): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(9,21): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(10,24): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(15,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(16,17): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(22,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(23,19): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(24,24): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(25,25): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(26,17): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(30,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(31,23): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(33,25): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(34,16): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(35,19): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(36,24): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(40,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(41,25): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(44,20): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(46,22): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(48,23): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(49,19): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(50,18): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(54,1): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(55,26): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(72,5): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(195,23): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionLedger.test.tsx(196,26): error TS2708: Cannot use namespace 'jest' as a value.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(4,8): error TS2613: Module '"violet-vault/src/hooks/transactions/useTransactionMutations"' has no default export. Did you mean to use 'import { useTransactionMutations } from "/Users/thef4tdaddy/Git/violet-vault/src/hooks/transactions/useTransactionMutations"' instead?
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(41,20): error TS2339: Property 'mockReturnValue' does not exist on type '(queryClient?: QueryClient) => QueryClient'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(53,19): error TS2339: Property 'mockReturnValue' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(options: UseMutationOptions<TData, TError, TVariables, TContext>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(77,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(options: UseMutationOptions<TData, TError, TVariables, TContext>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(107,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(options: UseMutationOptions<TData, TError, TVariables, TContext>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(131,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(options: UseMutationOptions<TData, TError, TVariables, TContext>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(147,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(options: UseMutationOptions<TData, TError, TVariables, TContext>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(177,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(options: UseMutationOptions<TData, TError, TVariables, TContext>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(193,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(options: UseMutationOptions<TData, TError, TVariables, TContext>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(219,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(options: UseMutationOptions<TData, TError, TVariables, TContext>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionMutations.test.ts(238,19): error TS2339: Property 'mockImplementation' does not exist on type '<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(options: UseMutationOptions<TData, TError, TVariables, TContext>, queryClient?: QueryClient) => UseMutationResult<...>'.
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(4,8): error TS2613: Module '"violet-vault/src/hooks/transactions/useTransactionQuery"' has no default export. Did you mean to use 'import { useTransactionQuery } from "/Users/thef4tdaddy/Git/violet-vault/src/hooks/transactions/useTransactionQuery"' instead?
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(41,14): error TS2339: Property 'mockReturnValue' does not exist on type '{ <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKey extends QueryKey = readonly unknown[]>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<...>; <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKe...'.
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(65,14): error TS2339: Property 'mockReturnValue' does not exist on type '{ <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKey extends QueryKey = readonly unknown[]>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<...>; <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKe...'.
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(82,14): error TS2339: Property 'mockReturnValue' does not exist on type '{ <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKey extends QueryKey = readonly unknown[]>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<...>; <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKe...'.
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(100,14): error TS2339: Property 'mockReturnValue' does not exist on type '{ <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKey extends QueryKey = readonly unknown[]>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<...>; <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKe...'.
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(115,14): error TS2339: Property 'mockReturnValue' does not exist on type '{ <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKey extends QueryKey = readonly unknown[]>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<...>; <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKe...'.
src/hooks/transactions/__tests__/useTransactionQuery.test.ts(131,14): error TS2339: Property 'mockReturnValue' does not exist on type '{ <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKey extends QueryKey = readonly unknown[]>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<...>; <TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryKe...'.
src/hooks/transactions/__tests__/useTransactionSplitterUI.test.ts(3,8): error TS2613: Module '"violet-vault/src/hooks/transactions/useTransactionSplitterUI"' has no default export. Did you mean to use 'import { useTransactionSplitterUI } from "/Users/thef4tdaddy/Git/violet-vault/src/hooks/transactions/useTransactionSplitterUI"' instead?
src/hooks/transactions/__tests__/useTransactionUtils.test.ts(3,8): error TS2613: Module '"violet-vault/src/hooks/transactions/useTransactionUtils"' has no default export. Did you mean to use 'import { useTransactionUtils } from "/Users/thef4tdaddy/Git/violet-vault/src/hooks/transactions/useTransactionUtils"' instead?
src/hooks/transactions/useTransactionBalanceUpdater.ts(45,7): error TS2353: Object literal may only specify known properties, and 'updatedAt' does not exist in type 'UpdateSpec<Envelope> | ((obj: Envelope, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/hooks/transactions/useTransactionData.ts(24,5): error TS2339: Property 'dateRange' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(25,5): error TS2339: Property 'envelopeId' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(26,5): error TS2339: Property 'category' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(27,5): error TS2339: Property 'type' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(28,5): error TS2339: Property 'searchQuery' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(31,5): error TS2339: Property 'sortBy' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(32,5): error TS2339: Property 'sortOrder' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(33,5): error TS2339: Property 'limit' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(36,5): error TS2339: Property 'enabled' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(37,5): error TS2339: Property 'staleTime' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(38,5): error TS2339: Property 'refetchInterval' does not exist on type '{}'.
src/hooks/transactions/useTransactionData.ts(161,51): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/transactions/useTransactionData.ts(161,70): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/hooks/transactions/useTransactionFileUpload.ts(19,21): error TS2353: Object literal may only specify known properties, and 'clearExisting' does not exist in type 'SetStateAction<any[]>'.
src/hooks/transactions/useTransactionFileUpload.ts(19,44): error TS2339: Property 'clearExisting' does not exist on type '{}'.
src/hooks/transactions/useTransactionFileUpload.ts(32,23): error TS2554: Expected 3 arguments, but got 2.
src/hooks/transactions/useTransactionFileUpload.ts(41,11): error TS2353: Object literal may only specify known properties, and 'data' does not exist in type 'SetStateAction<any[]>'.
src/hooks/transactions/useTransactionFileUpload.ts(42,34): error TS2339: Property 'clearExisting' does not exist on type '{}'.
src/hooks/transactions/useTransactionImport.ts(29,23): error TS2339: Property 'date' does not exist on type '{}'.
src/hooks/transactions/useTransactionImport.ts(29,45): error TS2339: Property 'description' does not exist on type '{}'.
src/hooks/transactions/useTransactionImport.ts(29,74): error TS2339: Property 'amount' does not exist on type '{}'.
src/hooks/transactions/useTransactionImport.ts(30,19): error TS2554: Expected 3 arguments, but got 2.
src/hooks/transactions/useTransactionImport.ts(38,20): error TS2339: Property 'clearExisting' does not exist on type 'any[]'.
src/hooks/transactions/useTransactionLedger.ts(71,5): error TS2554: Expected 1 arguments, but got 7.
src/hooks/transactions/useTransactionLedger.ts(104,22): error TS2345: Argument of type '{ amount: number; createdBy: any; createdAt: string; importSource: string; date: string; description: string; type: string; envelopeId: string; category: string; notes: string; reconciled: boolean; id: number; }' is not assignable to parameter of type 'void'.
src/hooks/transactions/useTransactionMutations.ts(9,47): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/hooks/transactions/useTransactionMutations.ts(10,12): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/hooks/transactions/useTransactionMutations.ts(28,9): error TS2698: Spread types may only be created from object types.
src/hooks/transactions/useTransactionMutations.ts(29,33): error TS2339: Property 'amount' does not exist on type 'void'.
src/hooks/transactions/useTransactionMutations.ts(65,9): error TS2698: Spread types may only be created from object types.
src/hooks/transactions/useTransactionMutations.ts(97,59): error TS2769: No overload matches this call.
  Overload 1 of 4, '(key: string): PromiseExtended<Transaction>', gave the following error.
    Argument of type 'void' is not assignable to parameter of type 'string'.
  Overload 2 of 4, '(equalityCriterias: { [key: string]: any; }): PromiseExtended<Transaction>', gave the following error.
    Argument of type 'void' is not assignable to parameter of type '{ [key: string]: any; }'.
src/hooks/transactions/useTransactionMutations.ts(103,42): error TS2345: Argument of type 'void' is not assignable to parameter of type 'string'.
src/hooks/transactions/useTransactionMutations.ts(133,26): error TS2339: Property 'id' does not exist on type 'void'.
src/hooks/transactions/useTransactionMutations.ts(133,30): error TS2339: Property 'updates' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(20,47): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/hooks/transactions/useTransactionOperations.ts(21,12): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/hooks/transactions/useTransactionOperations.ts(32,11): error TS2339: Property 'categoryRules' does not exist on type '{}'.
src/hooks/transactions/useTransactionOperations.ts(40,64): error TS2339: Property 'id' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(55,37): error TS2551: Property 'addTransaction' does not exist on type 'VioletVaultDB'. Did you mean 'Transaction'?
src/hooks/transactions/useTransactionOperations.ts(77,26): error TS2339: Property 'id' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(77,30): error TS2339: Property 'updates' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(81,38): error TS2551: Property 'getTransaction' does not exist on type 'VioletVaultDB'. Did you mean 'transaction'?
src/hooks/transactions/useTransactionOperations.ts(99,37): error TS2339: Property 'updateTransaction' does not exist on type 'VioletVaultDB'.
src/hooks/transactions/useTransactionOperations.ts(104,17): error TS6133: 'data' is declared but its value is never read.
src/hooks/transactions/useTransactionOperations.ts(109,71): error TS2339: Property 'id' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(112,75): error TS2339: Property 'id' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(125,22): error TS2339: Property 'deleteTransaction' does not exist on type 'VioletVaultDB'.
src/hooks/transactions/useTransactionOperations.ts(147,26): error TS2339: Property 'originalTransaction' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(147,47): error TS2339: Property 'splitTransactions' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(177,24): error TS2339: Property 'updateTransaction' does not exist on type 'VioletVaultDB'.
src/hooks/transactions/useTransactionOperations.ts(182,41): error TS2551: Property 'addTransaction' does not exist on type 'VioletVaultDB'. Did you mean 'Transaction'?
src/hooks/transactions/useTransactionOperations.ts(219,41): error TS2345: Argument of type 'void' is not assignable to parameter of type '{}'.
src/hooks/transactions/useTransactionOperations.ts(225,45): error TS2551: Property 'addTransaction' does not exist on type 'VioletVaultDB'. Did you mean 'Transaction'?
src/hooks/transactions/useTransactionOperations.ts(228,45): error TS2551: Property 'addTransaction' does not exist on type 'VioletVaultDB'. Did you mean 'Transaction'?
src/hooks/transactions/useTransactionOperations.ts(260,26): error TS2339: Property 'operation' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(260,37): error TS2339: Property 'transactions' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(260,51): error TS2339: Property 'updates' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(270,28): error TS2339: Property 'deleteTransaction' does not exist on type 'VioletVaultDB'.
src/hooks/transactions/useTransactionOperations.ts(279,43): error TS2339: Property 'updateTransaction' does not exist on type 'VioletVaultDB'.
src/hooks/transactions/useTransactionOperations.ts(288,43): error TS2339: Property 'updateTransaction' does not exist on type 'VioletVaultDB'.
src/hooks/transactions/useTransactionOperations.ts(305,37): error TS2339: Property 'operation' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(310,38): error TS2339: Property 'operation' does not exist on type 'void'.
src/hooks/transactions/useTransactionOperations.ts(324,52): error TS2345: Argument of type '{ id: any; updates: any; }' is not assignable to parameter of type 'void'.
src/hooks/transactions/useTransactionOperations.ts(338,51): error TS2345: Argument of type '{ originalTransaction: any; splitTransactions: any; }' is not assignable to parameter of type 'void'.
src/hooks/transactions/useTransactionOperations.ts(355,48): error TS2345: Argument of type '{ operation: any; transactions: any; updates: any; }' is not assignable to parameter of type 'void'.
src/hooks/transactions/useTransactionQuery.ts(11,5): error TS2339: Property 'dateRange' does not exist on type '{}'.
src/hooks/transactions/useTransactionQuery.ts(12,5): error TS2339: Property 'envelopeId' does not exist on type '{}'.
src/hooks/transactions/useTransactionQuery.ts(13,5): error TS2339: Property 'category' does not exist on type '{}'.
src/hooks/transactions/useTransactionQuery.ts(14,5): error TS2339: Property 'type' does not exist on type '{}'.
src/hooks/transactions/useTransactionQuery.ts(15,5): error TS2339: Property 'limit' does not exist on type '{}'.
src/hooks/transactions/useTransactionQuery.ts(16,5): error TS2339: Property 'sortBy' does not exist on type '{}'.
src/hooks/transactions/useTransactionQuery.ts(17,5): error TS2339: Property 'sortOrder' does not exist on type '{}'.
src/hooks/transactions/useTransactionQuery.ts(159,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/transactions/useTransactionSplitter.ts(30,11): error TS2339: Property 'transaction' does not exist on type '{}'.
src/hooks/transactions/useTransactionSplitter.ts(30,24): error TS2339: Property 'envelopes' does not exist on type '{}'.
src/hooks/transactions/useTransactionSplitter.ts(30,40): error TS2339: Property 'onSplit' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(20,5): error TS2339: Property 'dateRange' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(21,5): error TS2339: Property 'envelopeId' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(22,5): error TS2339: Property 'category' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(23,5): error TS2339: Property 'type' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(24,5): error TS2339: Property 'searchQuery' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(25,5): error TS2339: Property 'sortBy' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(26,5): error TS2339: Property 'sortOrder' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(27,5): error TS2339: Property 'limit' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(30,5): error TS2339: Property 'categoryRules' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(33,5): error TS2339: Property 'enabled' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(34,5): error TS2339: Property 'staleTime' does not exist on type '{}'.
src/hooks/transactions/useTransactionsV2.ts(35,5): error TS2339: Property 'refetchInterval' does not exist on type '{}'.
src/main.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
src/main.tsx(90,10): error TS2339: Property 'dataDiagnostic' does not exist on type 'Window & typeof globalThis'.
src/main.tsx(91,10): error TS2339: Property 'syncDiagnostic' does not exist on type 'Window & typeof globalThis'.
src/main.tsx(92,10): error TS2339: Property 'runSyncHealthCheck' does not exist on type 'Window & typeof globalThis'.
src/main.tsx(93,10): error TS2339: Property 'runSyncEdgeCaseTests' does not exist on type 'Window & typeof globalThis'.
src/main.tsx(94,10): error TS2339: Property 'validateAllSyncFlows' does not exist on type 'Window & typeof globalThis'.
src/main.tsx(97,10): error TS2339: Property 'fixAutoAllocateUndefined' does not exist on type 'Window & typeof globalThis'.
src/main.tsx(103,10): error TS2339: Property 'swDiagnostics' does not exist on type 'Window & typeof globalThis'.
src/main.tsx(109,10): error TS2339: Property 'offlineReadiness' does not exist on type 'Window & typeof globalThis'.
src/main.tsx(187,10): error TS2339: Property 'clearCloudDataOnly' does not exist on type 'Window & typeof globalThis'.
src/main.tsx(205,10): error TS2339: Property 'testBugReportCapture' does not exist on type 'Window & typeof globalThis'.
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
src/services/__tests__/budgetHistoryService.test.ts(514,47): error TS2339: Property 'maxRecentCommits' does not exist on type 'BudgetHistoryService'.
src/services/__tests__/budgetHistoryService.test.ts(517,36): error TS2339: Property 'mockResolvedValue' does not exist on type '{ (): PromiseExtended<number>; <R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>; }'.
src/services/__tests__/budgetHistoryService.test.ts(523,38): error TS2339: Property 'mockReturnValue' does not exist on type '(index: string | string[]) => Collection<BudgetCommit, string, BudgetCommit>'.
src/services/__tests__/budgetHistoryService.test.ts(529,41): error TS2339: Property 'mockResolvedValue' does not exist on type '(keys: string[]) => PromiseExtended<void>'.
src/services/__tests__/budgetHistoryService.test.ts(530,36): error TS2339: Property 'mockReturnValue' does not exist on type '{ (index: string | string[]): WhereClause<BudgetChange, number, BudgetChange>; (equalityCriterias: { [key: string]: any; }): Collection<BudgetChange, number, BudgetChange>; }'.
src/services/__tests__/budgetHistoryService.test.ts(542,47): error TS2339: Property 'maxRecentCommits' does not exist on type 'BudgetHistoryService'.
src/services/__tests__/budgetHistoryService.test.ts(543,36): error TS2339: Property 'mockResolvedValue' does not exist on type '{ (): PromiseExtended<number>; <R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>; }'.
src/services/__tests__/budgetHistoryService.test.ts(556,48): error TS2339: Property 'maxRecentCommits' does not exist on type 'BudgetHistoryService'.
src/services/__tests__/budgetHistoryService.test.ts(557,51): error TS2339: Property 'maxDevicesPerAuthor' does not exist on type 'BudgetHistoryService'.
src/services/__tests__/budgetHistoryService.test.ts(558,52): error TS2339: Property 'defaultAnalysisRange' does not exist on type 'BudgetHistoryService'.
src/services/__tests__/integration/syncIntegration.test.ts(2,55): error TS6133: 'vi' is declared but its value is never read.
src/services/__tests__/integration/syncIntegration.test.ts(20,47): error TS2339: Property 'generateEncryptionKey' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/services/__tests__/integration/syncIntegration.test.ts(239,58): error TS2339: Property 'encryptForCloud' does not exist on type 'FirebaseSyncService'.
src/services/__tests__/integration/syncIntegration.test.ts(240,39): error TS2339: Property 'encryptForCloud' does not exist on type 'FirebaseSyncService'.
src/services/__tests__/integration/syncIntegration.test.ts(500,13): error TS2322: Type 'string' is not assignable to type 'boolean'.
src/services/__tests__/types/firebaseTypes.test.ts(6,48): error TS6133: 'afterEach' is declared but its value is never read.
src/services/__tests__/types/firebaseTypes.test.ts(72,45): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/services/__tests__/types/firebaseTypes.test.ts(94,55): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<unknown>'.
src/services/__tests__/types/firebaseTypes.test.ts(102,55): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<unknown>'.
src/services/__tests__/types/firebaseTypes.test.ts(110,55): error TS2339: Property 'mockRejectedValue' does not exist on type '() => Promise<unknown>'.
src/services/__tests__/types/firebaseTypes.test.ts(122,47): error TS2339: Property 'mockResolvedValue' does not exist on type '(data: any, metadata?: {}) => Promise<boolean>'.
src/services/__tests__/types/firebaseTypes.test.ts(143,75): error TS2345: Argument of type '{ version: number; }' is not assignable to parameter of type 'Partial<SyncMetadata>'.
  Types of property 'version' are incompatible.
    Type 'number' is not assignable to type 'string'.
src/services/__tests__/types/firebaseTypes.test.ts(152,49): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<any>'.
src/services/__tests__/types/firebaseTypes.test.ts(162,49): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<any>'.
src/services/__tests__/types/firebaseTypes.test.ts(234,45): error TS2339: Property 'mockResolvedValue' does not exist on type '(budgetId: any, encryptionKey: any) => Promise<void>'.
src/services/__tests__/types/firebaseTypes.test.ts(235,43): error TS2339: Property 'mockReturnValue' does not exist on type '() => { resilience: any; phase1: { mutexEnabled: boolean; validationEnabled: boolean; }; phase2: { retryEnabled: boolean; circuitBreakerEnabled: boolean; queueEnabled: boolean; }; maxChunkSize: any; maxArrayChunkSize: any; isInitialized: boolean; }'.
src/services/__tests__/types/firebaseTypes.test.ts(263,74): error TS2345: Argument of type '{ uid: string; }' is not assignable to parameter of type '{ readonly uid: string; readonly userName: string; }'.
  Property 'userName' is missing in type '{ uid: string; }' but required in type '{ readonly uid: string; readonly userName: string; }'.
src/services/__tests__/types/firebaseTypes.test.ts(271,46): error TS2339: Property 'mockResolvedValue' does not exist on type '(data: any, currentUser: any) => Promise<any>'.
src/services/authService.ts(97,11): error TS6133: '_decryptedData' is declared but its value is never read.
src/services/authService.ts(149,38): error TS2554: Expected 0 arguments, but got 1.
src/services/authService.ts(282,38): error TS2554: Expected 0 arguments, but got 1.
src/services/budgetDatabaseService.ts(11,10): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(12,10): error TS2339: Property 'cachePrefix' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(13,10): error TS2339: Property 'defaultCacheTtl' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(21,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(35,25): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(46,13): error TS2339: Property 'category' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(46,23): error TS2339: Property 'includeArchived' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(46,48): error TS2339: Property 'useCache' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(50,27): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(54,34): error TS2339: Property 'cachePrefix' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(55,36): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(55,69): error TS2339: Property 'defaultCacheTtl' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(58,34): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(59,22): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(59,66): error TS2339: Property 'defaultCacheTtl' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(65,25): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(74,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(87,13): error TS2339: Property 'dateRange' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(87,24): error TS2339: Property 'envelopeId' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(87,36): error TS2339: Property 'category' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(87,46): error TS2339: Property 'type' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(87,52): error TS2339: Property 'limit' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(87,65): error TS2339: Property 'useCache' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(91,27): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(95,27): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(99,27): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(103,41): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(112,34): error TS2339: Property 'cachePrefix' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(113,39): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(118,37): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(120,22): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(135,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(148,13): error TS2339: Property 'category' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(148,23): error TS2339: Property 'isPaid' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(148,31): error TS2339: Property 'daysAhead' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(148,47): error TS2339: Property 'includeOverdue' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(152,27): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(156,27): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(161,16): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(162,33): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(169,25): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(178,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(190,13): error TS2339: Property 'category' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(190,23): error TS2339: Property 'isCompleted' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(190,36): error TS2339: Property '_isPaused' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(190,36): error TS6133: '_isPaused' is declared but its value is never read.
src/services/budgetDatabaseService.ts(190,47): error TS2339: Property 'priority' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(194,27): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(198,27): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(202,27): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(206,27): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(210,25): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(219,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(231,13): error TS2339: Property 'limit' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(231,25): error TS2339: Property 'dateRange' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(231,36): error TS2339: Property 'source' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(235,27): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(239,27): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(242,25): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(251,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(264,25): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(273,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(286,35): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(296,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(313,25): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(322,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(339,13): error TS2339: Property 'includeTransfers' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(339,39): error TS2339: Property 'useCache' does not exist on type '{}'.
src/services/budgetDatabaseService.ts(342,32): error TS2339: Property 'cachePrefix' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(345,31): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(345,64): error TS2339: Property 'defaultCacheTtl' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(351,39): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(354,20): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(354,67): error TS2339: Property 'defaultCacheTtl' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(369,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(383,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(393,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(396,16): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(397,16): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(398,16): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(399,16): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(400,16): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(401,16): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(402,16): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(403,16): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(404,16): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(408,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(409,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(410,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(411,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(412,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(413,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(414,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(415,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(416,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(432,16): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(436,16): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(440,16): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(448,27): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(449,25): error TS2339: Property 'cachePrefix' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(450,29): error TS2339: Property 'defaultCacheTtl' does not exist on type 'BudgetDatabaseService'.
src/services/budgetDatabaseService.ts(459,18): error TS2339: Property 'db' does not exist on type 'BudgetDatabaseService'.
src/services/budgetHistoryService.ts(13,10): error TS2339: Property 'maxRecentCommits' does not exist on type 'BudgetHistoryService'.
src/services/budgetHistoryService.ts(14,10): error TS2339: Property 'maxDevicesPerAuthor' does not exist on type 'BudgetHistoryService'.
src/services/budgetHistoryService.ts(15,10): error TS2339: Property 'defaultAnalysisRange' does not exist on type 'BudgetHistoryService'.
src/services/budgetHistoryService.ts(304,62): error TS2345: Argument of type 'boolean' is not assignable to parameter of type 'IndexableType'.
src/services/budgetHistoryService.ts(444,44): error TS2339: Property 'maxDevicesPerAuthor' does not exist on type 'BudgetHistoryService'.
src/services/budgetHistoryService.ts(447,43): error TS2339: Property 'maxDevicesPerAuthor' does not exist on type 'BudgetHistoryService'.
src/services/budgetHistoryService.ts(461,46): error TS2339: Property 'defaultAnalysisRange' does not exist on type 'BudgetHistoryService'.
src/services/budgetHistoryService.ts(540,30): error TS2339: Property 'maxRecentCommits' does not exist on type 'BudgetHistoryService'.
src/services/budgetHistoryService.ts(541,33): error TS2339: Property 'maxDevicesPerAuthor' does not exist on type 'BudgetHistoryService'.
src/services/budgetHistoryService.ts(542,34): error TS2339: Property 'defaultAnalysisRange' does not exist on type 'BudgetHistoryService'.
src/services/budgetHistoryService.ts(553,31): error TS2339: Property 'maxRecentCommits' does not exist on type 'BudgetHistoryService'.
src/services/budgetHistoryService.ts(556,38): error TS2339: Property 'maxRecentCommits' does not exist on type 'BudgetHistoryService'.
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
src/services/bugReport/__tests__/screenshotService.test.ts(123,62): error TS2345: Argument of type '(tagName: string) => {}' is not assignable to parameter of type 'NormalizedProcedure<{ <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K]; <K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementDeprecatedTagNameMap[K]; (tagName: string, options?: ElementCreationOption...'.
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
src/services/bugReport/__tests__/screenshotService.test.ts(264,62): error TS2345: Argument of type '(tagName: string) => {}' is not assignable to parameter of type 'NormalizedProcedure<{ <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K]; <K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementDeprecatedTagNameMap[K]; (tagName: string, options?: ElementCreationOption...'.
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
src/services/bugReport/contextAnalysisService.ts(116,7): error TS2740: Type '{ currentPage: string; pathname: string; }' is missing the following properties from type 'RouteInfo': search, hash, searchParams, segments, and 5 more.
src/services/bugReport/contextAnalysisService.ts(117,7): error TS2739: Type '{ documentTitle: string; }' is missing the following properties from type 'ScreenContext': screenTitle, breadcrumbs, mainHeading
src/services/bugReport/contextAnalysisService.ts(119,7): error TS2739: Type '{ modals: undefined[]; forms: undefined[]; buttons: undefined[]; inputs: undefined[]; }' is missing the following properties from type 'UIState': drawers, tabs, loading, interactions
src/services/bugReport/errorTrackingService.ts(9,6): error TS2456: Type alias 'EventListenerOrEventListenerObject' circularly references itself.
src/services/bugReport/errorTrackingService.ts(186,10): error TS2352: Conversion of type 'Console' to type 'Record<string, (...args: unknown[]) => void>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Console'.
src/services/bugReport/githubApiService.ts(35,31): error TS2339: Property 'issueNumber' does not exist on type '{ success: boolean; issueNumber: number; url: string; } | { success: boolean; error: any; }'.
  Property 'issueNumber' does not exist on type '{ success: boolean; error: any; }'.
src/services/bugReport/githubApiService.ts(36,23): error TS2339: Property 'url' does not exist on type '{ success: boolean; issueNumber: number; url: string; } | { success: boolean; error: any; }'.
  Property 'url' does not exist on type '{ success: boolean; error: any; }'.
src/services/bugReport/githubApiService.ts(41,31): error TS2339: Property 'issueNumber' does not exist on type '{ success: boolean; issueNumber: number; url: string; } | { success: boolean; error: any; }'.
  Property 'issueNumber' does not exist on type '{ success: boolean; error: any; }'.
src/services/bugReport/githubApiService.ts(42,23): error TS2339: Property 'url' does not exist on type '{ success: boolean; issueNumber: number; url: string; } | { success: boolean; error: any; }'.
  Property 'url' does not exist on type '{ success: boolean; error: any; }'.
src/services/bugReport/githubApiService.ts(49,25): error TS2339: Property 'error' does not exist on type '{ success: boolean; issueNumber: number; url: string; } | { success: boolean; error: any; }'.
  Property 'error' does not exist on type '{ success: boolean; issueNumber: number; url: string; }'.
src/services/bugReport/githubApiService.ts(123,13): error TS6133: '_screenshotInfo' is declared but its value is never read.
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
src/services/bugReport/performanceInfoService.ts(141,11): error TS2322: Type 'string | number' is not assignable to type 'number'.
  Type 'string' is not assignable to type 'number'.
src/services/bugReport/performanceInfoService.ts(280,32): error TS2339: Property 'usageDetails' does not exist on type 'StorageEstimate'.
src/services/bugReport/performanceInfoService.ts(308,48): error TS2339: Property 'effectiveType' does not exist on type 'unknown'.
src/services/bugReport/performanceInfoService.ts(309,43): error TS2339: Property 'downlink' does not exist on type 'unknown'.
src/services/bugReport/performanceInfoService.ts(310,38): error TS2339: Property 'rtt' does not exist on type 'unknown'.
src/services/bugReport/performanceInfoService.ts(311,21): error TS2339: Property 'saveData' does not exist on type '{ onLine: boolean; connection: ConnectionInfo; effectiveType: any; downlink: any; rtt: any; }'.
src/services/bugReport/performanceInfoService.ts(311,43): error TS2339: Property 'saveData' does not exist on type 'unknown'.
src/services/bugReport/performanceInfoService.ts(338,35): error TS2339: Property 'effectiveType' does not exist on type 'unknown'.
src/services/bugReport/performanceInfoService.ts(339,26): error TS2339: Property 'type' does not exist on type 'unknown'.
src/services/bugReport/performanceInfoService.ts(340,30): error TS2339: Property 'downlink' does not exist on type 'unknown'.
src/services/bugReport/performanceInfoService.ts(341,33): error TS2339: Property 'downlinkMax' does not exist on type 'unknown'.
src/services/bugReport/performanceInfoService.ts(342,25): error TS2339: Property 'rtt' does not exist on type 'unknown'.
src/services/bugReport/performanceInfoService.ts(343,30): error TS2339: Property 'saveData' does not exist on type 'unknown'.
src/services/bugReport/reportSubmissionService.ts(175,30): error TS6133: 'reportData' is declared but its value is never read.
src/services/bugReport/screenshotService.ts(16,13): error TS2339: Property 'compress' does not exist on type '{}'.
src/services/bugReport/screenshotService.ts(20,13): error TS6133: '_isMobile' is declared but its value is never read.
src/services/bugReport/screenshotService.ts(90,38): error TS2794: Expected 1 arguments, but got 0. Did you forget to include 'void' in your type argument to 'Promise'?
src/services/bugReport/screenshotService.ts(133,38): error TS2339: Property 'toDataURL' does not exist on type 'unknown'.
src/services/bugReport/screenshotService.ts(229,15): error TS2339: Property 'quality' does not exist on type '{}'.
src/services/bugReport/screenshotService.ts(229,30): error TS2339: Property 'maxWidth' does not exist on type '{}'.
src/services/bugReport/screenshotService.ts(229,47): error TS2339: Property 'maxHeight' does not exist on type '{}'.
src/services/bugReport/screenshotService.ts(229,65): error TS2339: Property 'format' does not exist on type '{}'.
src/services/bugReport/systemInfoService.ts(91,9): error TS2322: Type 'import("violet-vault/src/services/bugReport/browserInfoService").BrowserInfo' is not assignable to type 'BrowserInfo'.
  Index signature for type 'string' is missing in type 'BrowserInfo'.
src/services/bugReport/systemInfoService.ts(93,9): error TS2322: Type 'import("violet-vault/src/services/bugReport/browserInfoService").UrlInfo' is not assignable to type 'UrlInfo'.
  Index signature for type 'string' is missing in type 'UrlInfo'.
src/services/bugReport/systemInfoService.ts(94,9): error TS2322: Type 'import("violet-vault/src/services/bugReport/performanceInfoService").PerformanceInfo' is not assignable to type 'PerformanceInfo'.
  Index signature for type 'string' is missing in type 'PerformanceInfo'.
src/services/bugReport/systemInfoService.ts(95,9): error TS2322: Type 'StorageInformation' is not assignable to type 'StorageInfo'.
  Types of property 'localStorage' are incompatible.
    Type 'StorageInfo' is not assignable to type '{ [key: string]: unknown; available: boolean; }'.
      Index signature for type 'string' is missing in type 'StorageInfo'.
src/services/bugReport/systemInfoService.ts(96,9): error TS2322: Type 'import("violet-vault/src/services/bugReport/performanceInfoService").NetworkInfo' is not assignable to type 'NetworkInfo'.
  Index signature for type 'string' is missing in type 'NetworkInfo'.
src/services/bugReport/systemInfoService.ts(97,9): error TS2322: Type 'RecentErrorsResponse' is not assignable to type 'ErrorInfo'.
  Index signature for type 'string' is missing in type 'RecentErrorsResponse'.
src/services/chunkedSyncService.ts(61,10): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(62,10): error TS2339: Property 'encryptionKey' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(64,10): error TS2339: Property 'maxChunkSize' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(65,10): error TS2339: Property 'maxArrayChunkSize' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(66,10): error TS2339: Property 'lastCorruptedDataClear' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(67,10): error TS2339: Property 'corruptedDataClearCooldown' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(70,10): error TS2339: Property 'syncMutex' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(71,10): error TS2339: Property 'decryptionFailures' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(74,10): error TS2339: Property 'resilience' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(92,10): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(93,10): error TS2339: Property 'encryptionKey' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(100,26): error TS2339: Property 'maxChunkSize' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(108,45): error TS2339: Property 'app' does not exist on type 'FirebaseSyncService'.
src/services/chunkedSyncService.ts(116,36): error TS6133: 'key' is declared but its value is never read.
src/services/chunkedSyncService.ts(178,26): error TS2339: Property 'maxArrayChunkSize' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(184,47): error TS2339: Property 'maxChunkSize' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(239,7): error TS2365: Operator '+=' cannot be applied to types 'number' and 'Promise<number>'.
src/services/chunkedSyncService.ts(264,17): error TS2339: Property 'syncMutex' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(265,17): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(265,35): error TS2339: Property 'encryptionKey' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(326,16): error TS2339: Property 'encryptionKey' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(364,16): error TS2339: Property 'resilience' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(367,53): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(397,20): error TS2339: Property 'encryptionKey' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(416,30): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(428,47): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(434,18): error TS2339: Property 'resilience' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(470,17): error TS2339: Property 'syncMutex' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(471,17): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(471,35): error TS2339: Property 'encryptionKey' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(482,36): error TS2339: Property 'resilience' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(483,48): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(524,20): error TS2339: Property 'encryptionKey' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(531,30): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(536,44): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(540,23): error TS2339: Property 'decryptionFailures' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(541,20): error TS2339: Property 'decryptionFailures' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(544,38): error TS2339: Property 'decryptionFailures' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(552,18): error TS2339: Property 'decryptionFailures' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(558,20): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(582,44): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(583,42): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(586,45): error TS2339: Property 'resilience' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(615,22): error TS2339: Property 'encryptionKey' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(644,61): error TS2339: Property '_chunked' does not exist on type 'object'.
src/services/chunkedSyncService.ts(686,15): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(696,44): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(703,40): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(704,38): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(727,15): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(738,40): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(739,38): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(753,44): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(775,15): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(791,26): error TS2339: Property 'maxChunkSize' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(792,31): error TS2339: Property 'maxArrayChunkSize' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(793,30): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(793,47): error TS2339: Property 'encryptionKey' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(797,35): error TS2339: Property 'resilience' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(803,30): error TS2339: Property 'syncMutex' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(818,15): error TS2339: Property 'decryptionFailures' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(818,42): error TS2339: Property 'decryptionFailures' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(827,52): error TS2339: Property 'decryptionFailures' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(841,29): error TS2339: Property 'decryptionFailures' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(854,16): error TS2339: Property 'corruptionModalShown' does not exist on type 'Window & typeof globalThis'.
src/services/chunkedSyncService.ts(858,12): error TS2339: Property 'corruptionModalShown' does not exist on type 'Window & typeof globalThis'.
src/services/chunkedSyncService.ts(863,28): error TS2339: Property 'decryptionFailures' does not exist on type 'ChunkedSyncService'.
src/services/chunkedSyncService.ts(864,24): error TS2339: Property 'budgetId' does not exist on type 'ChunkedSyncService'.
src/services/cloudSyncService.ts(12,10): error TS2339: Property 'syncIntervalId' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(13,10): error TS2339: Property 'isSyncing' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(14,10): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(15,10): error TS2339: Property 'debounceTimer' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(16,10): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(17,10): error TS2339: Property 'syncQueue' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(21,14): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(26,10): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(27,10): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(41,15): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(44,18): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(47,23): error TS2339: Property 'debounceTimer' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(48,10): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(53,23): error TS2339: Property 'debounceTimer' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(58,10): error TS2339: Property 'debounceTimer' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(59,12): error TS2339: Property 'syncQueue' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(59,29): error TS2339: Property 'syncQueue' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(66,23): error TS2339: Property 'debounceTimer' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(67,10): error TS2339: Property 'syncQueue' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(67,27): error TS2339: Property 'syncQueue' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(71,14): error TS2339: Property 'isSyncing' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(76,10): error TS2339: Property 'isSyncing' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(87,17): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(87,43): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(89,31): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(90,36): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(96,16): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(98,32): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(105,48): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(105,70): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(141,28): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(203,71): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(245,12): error TS2339: Property 'isSyncing' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(333,15): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(333,31): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(338,24): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(454,37): error TS2345: Argument of type '{ id: string; unassignedCash: any; actualBalance: any; supplementalAccounts: any; lastUpdated: string; }' is not assignable to parameter of type 'BudgetRecord'.
  Property 'lastModified' is missing in type '{ id: string; unassignedCash: any; actualBalance: any; supplementalAccounts: any; lastUpdated: string; }' but required in type 'BudgetRecord'.
src/services/cloudSyncService.ts(558,30): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(560,25): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(584,23): error TS2339: Property 'isSyncing' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(585,23): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(589,25): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(596,14): error TS2339: Property 'isSyncing' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(601,10): error TS2339: Property 'isSyncing' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(610,48): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(610,70): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(613,75): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(625,12): error TS2339: Property 'isSyncing' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(635,16): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(635,38): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(637,20): error TS2339: Property 'config' does not exist on type 'CloudSyncService'.
src/services/cloudSyncService.ts(662,10): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/services/editLockService.ts(36,10): error TS2339: Property 'locks' does not exist on type 'EditLockService'.
src/services/editLockService.ts(37,10): error TS2339: Property 'lockListeners' does not exist on type 'EditLockService'.
src/services/editLockService.ts(38,10): error TS2339: Property 'heartbeatIntervals' does not exist on type 'EditLockService'.
src/services/editLockService.ts(39,10): error TS2339: Property 'currentUser' does not exist on type 'EditLockService'.
src/services/editLockService.ts(40,10): error TS2339: Property 'budgetId' does not exist on type 'EditLockService'.
src/services/editLockService.ts(47,10): error TS2339: Property 'budgetId' does not exist on type 'EditLockService'.
src/services/editLockService.ts(48,10): error TS2339: Property 'currentUser' does not exist on type 'EditLockService'.
src/services/editLockService.ts(60,55): error TS2339: Property 'budgetId' does not exist on type 'EditLockService'.
src/services/editLockService.ts(60,70): error TS2339: Property 'currentUser' does not exist on type 'EditLockService'.
src/services/editLockService.ts(71,12): error TS2339: Property 'budgetId' does not exist on type 'EditLockService'.
src/services/editLockService.ts(72,12): error TS2339: Property 'currentUser' does not exist on type 'EditLockService'.
src/services/editLockService.ts(79,70): error TS2339: Property 'currentUser' does not exist on type 'EditLockService'.
src/services/editLockService.ts(95,14): error TS2339: Property 'locks' does not exist on type 'EditLockService'.
src/services/editLockService.ts(106,12): error TS2339: Property 'locks' does not exist on type 'EditLockService'.
src/services/editLockService.ts(112,24): error TS2339: Property 'currentUser' does not exist on type 'EditLockService'.
src/services/editLockService.ts(117,42): error TS2339: Property 'currentUser' does not exist on type 'EditLockService'.
src/services/editLockService.ts(117,60): error TS2339: Property 'budgetId' does not exist on type 'EditLockService'.
src/services/editLockService.ts(132,12): error TS2339: Property 'locks' does not exist on type 'EditLockService'.
src/services/editLockService.ts(150,14): error TS2339: Property 'locks' does not exist on type 'EditLockService'.
src/services/editLockService.ts(170,38): error TS2339: Property 'budgetId' does not exist on type 'EditLockService'.
src/services/editLockService.ts(207,36): error TS2339: Property 'budgetId' does not exist on type 'EditLockService'.
src/services/editLockService.ts(225,10): error TS2339: Property 'lockListeners' does not exist on type 'EditLockService'.
src/services/editLockService.ts(234,30): error TS2339: Property 'lockListeners' does not exist on type 'EditLockService'.
src/services/editLockService.ts(237,12): error TS2339: Property 'lockListeners' does not exist on type 'EditLockService'.
src/services/editLockService.ts(261,32): error TS2339: Property 'locks' does not exist on type 'EditLockService'.
src/services/editLockService.ts(277,10): error TS2339: Property 'heartbeatIntervals' does not exist on type 'EditLockService'.
src/services/editLockService.ts(285,36): error TS2339: Property 'heartbeatIntervals' does not exist on type 'EditLockService'.
src/services/editLockService.ts(288,12): error TS2339: Property 'heartbeatIntervals' does not exist on type 'EditLockService'.
src/services/editLockService.ts(298,23): error TS2339: Property 'locks' does not exist on type 'EditLockService'.
src/services/editLockService.ts(299,41): error TS2339: Property 'currentUser' does not exist on type 'EditLockService'.
src/services/editLockService.ts(307,53): error TS2339: Property 'heartbeatIntervals' does not exist on type 'EditLockService'.
src/services/editLockService.ts(310,10): error TS2339: Property 'heartbeatIntervals' does not exist on type 'EditLockService'.
src/services/editLockService.ts(313,33): error TS2339: Property 'locks' does not exist on type 'EditLockService'.
src/services/editLockService.ts(314,32): error TS2339: Property 'currentUser' does not exist on type 'EditLockService'.
src/services/editLockService.ts(320,36): error TS2339: Property 'lockListeners' does not exist on type 'EditLockService'.
src/services/editLockService.ts(324,10): error TS2339: Property 'lockListeners' does not exist on type 'EditLockService'.
src/services/editLockService.ts(325,10): error TS2339: Property 'locks' does not exist on type 'EditLockService'.
src/services/firebaseSyncService.ts(15,10): error TS2339: Property 'app' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(16,10): error TS2339: Property 'db' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(17,10): error TS2339: Property 'auth' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(18,10): error TS2339: Property 'budgetId' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(19,10): error TS2339: Property 'encryptionKey' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(20,10): error TS2339: Property 'unsubscribe' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(21,10): error TS2339: Property 'lastSyncTimestamp' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(24,10): error TS2339: Property 'isOnline' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(25,10): error TS2339: Property 'syncQueue' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(26,10): error TS2339: Property 'retryAttempts' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(27,10): error TS2339: Property 'maxRetryAttempts' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(28,10): error TS2339: Property 'retryDelay' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(29,10): error TS2339: Property 'activeUsers' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(30,10): error TS2551: Property 'syncListeners' does not exist on type 'FirebaseSyncService'. Did you mean 'addSyncListener'?
src/services/firebaseSyncService.ts(31,10): error TS2339: Property 'errorListeners' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(34,10): error TS2339: Property 'recentActivity' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(35,10): error TS2339: Property 'maxActivityItems' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(51,12): error TS2339: Property 'app' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(52,12): error TS2339: Property 'db' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(52,35): error TS2339: Property 'app' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(53,12): error TS2339: Property 'auth' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(53,32): error TS2339: Property 'app' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(61,16): error TS2339: Property 'firebaseApp' does not exist on type 'Window & typeof globalThis'.
src/services/firebaseSyncService.ts(61,35): error TS2339: Property 'app' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(62,16): error TS2339: Property 'firebaseDb' does not exist on type 'Window & typeof globalThis'.
src/services/firebaseSyncService.ts(62,34): error TS2339: Property 'db' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(63,16): error TS2339: Property 'firebaseAuth' does not exist on type 'Window & typeof globalThis'.
src/services/firebaseSyncService.ts(63,36): error TS2339: Property 'auth' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(89,14): error TS2339: Property 'isOnline' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(95,14): error TS2339: Property 'isOnline' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(111,51): error TS2339: Property 'auth' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(123,63): error TS2339: Property 'auth' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(141,10): error TS2339: Property 'budgetId' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(142,10): error TS2339: Property 'encryptionKey' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(143,10): error TS2339: Property 'retryAttempts' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(144,10): error TS2339: Property 'syncQueue' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(156,15): error TS2339: Property 'budgetId' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(156,33): error TS2339: Property 'encryptionKey' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(168,86): error TS2339: Property 'encryptionKey' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(181,31): error TS2339: Property 'db' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(181,51): error TS2339: Property 'budgetId' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(199,15): error TS2339: Property 'budgetId' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(199,33): error TS2339: Property 'encryptionKey' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(211,31): error TS2339: Property 'db' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(211,51): error TS2339: Property 'budgetId' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(222,51): error TS2554: Expected 3 arguments, but got 2.
src/services/firebaseSyncService.ts(224,14): error TS2339: Property 'encryptionKey' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(243,15): error TS2339: Property 'budgetId' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(247,29): error TS2339: Property 'db' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(247,49): error TS2339: Property 'budgetId' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(249,10): error TS2339: Property 'unsubscribe' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(269,14): error TS2339: Property 'unsubscribe' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(270,12): error TS2339: Property 'unsubscribe' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(271,12): error TS2339: Property 'unsubscribe' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(280,10): error TS2551: Property 'syncListeners' does not exist on type 'FirebaseSyncService'. Did you mean 'addSyncListener'?
src/services/firebaseSyncService.ts(287,10): error TS2551: Property 'syncListeners' does not exist on type 'FirebaseSyncService'. Did you mean 'addSyncListener'?
src/services/firebaseSyncService.ts(294,10): error TS2551: Property 'syncListeners' does not exist on type 'FirebaseSyncService'. Did you mean 'addSyncListener'?
src/services/firebaseSyncService.ts(307,15): error TS2339: Property 'isOnline' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(307,32): error TS2339: Property 'syncQueue' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(311,36): error TS2339: Property 'syncQueue' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(313,17): error TS2339: Property 'syncQueue' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(314,30): error TS2339: Property 'syncQueue' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(327,14): error TS2339: Property 'syncQueue' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(328,12): error TS2339: Property 'syncQueue' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(330,10): error TS2339: Property 'syncQueue' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(338,22): error TS2339: Property 'isOnline' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(339,30): error TS2339: Property 'budgetId' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(339,47): error TS2339: Property 'encryptionKey' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(340,30): error TS2339: Property 'syncQueue' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(341,31): error TS2339: Property 'lastSyncTimestamp' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(342,25): error TS2339: Property 'activeUsers' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(351,10): error TS2551: Property 'syncListeners' does not exist on type 'FirebaseSyncService'. Did you mean 'addSyncListener'?
src/services/firebaseSyncService.ts(352,10): error TS2339: Property 'errorListeners' does not exist on type 'FirebaseSyncService'.
src/services/firebaseSyncService.ts(353,10): error TS2339: Property 'syncQueue' does not exist on type 'FirebaseSyncService'.
src/services/keys/__tests__/keyManagementService.test.ts(90,24): error TS2339: Property 'mockReturnValueOnce' does not exist on type '() => AuthStore'.
src/services/keys/__tests__/keyManagementService.test.ts(118,37): error TS2339: Property 'mockRejectedValueOnce' does not exist on type '(data: string) => Promise<void>'.
src/services/keys/__tests__/keyManagementService.test.ts(133,30): error TS2339: Property 'mockReturnValueOnce' does not exist on type '{ <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K]; <K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementDeprecatedTagNameMap[K]; (tagName: string, options?: ElementCreationOptions): HTMLElement; }'.
src/services/keys/__tests__/keyManagementService.test.ts(144,24): error TS2339: Property 'mockReturnValueOnce' does not exist on type '() => AuthStore'.
src/services/keys/__tests__/keyManagementService.test.ts(162,30): error TS2339: Property 'mockReturnValueOnce' does not exist on type '{ <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K]; <K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementDeprecatedTagNameMap[K]; (tagName: string, options?: ElementCreationOptions): HTMLElement; }'.
src/services/keys/__tests__/keyManagementService.test.ts(188,24): error TS2339: Property 'mockReturnValueOnce' does not exist on type '() => AuthStore'.
src/services/keys/__tests__/keyManagementService.test.ts(261,24): error TS2339: Property 'mockReturnValueOnce' does not exist on type '() => AuthStore'.
src/services/keys/__tests__/keyManagementService.test.ts(282,24): error TS2339: Property 'mockReturnValueOnce' does not exist on type '() => AuthStore'.
src/services/keys/keyManagementService.ts(25,64): error TS2769: No overload matches this call.
  Overload 1 of 2, '(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>', gave the following error.
    Argument of type 'CryptoKey | Uint8Array<ArrayBuffer>' is not assignable to parameter of type 'BufferSource'.
      Type 'CryptoKey' is not assignable to type 'BufferSource'.
  Overload 2 of 2, '(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>', gave the following error.
    Argument of type 'CryptoKey | Uint8Array<ArrayBuffer>' is not assignable to parameter of type 'BufferSource'.
      Type 'CryptoKey' is not assignable to type 'BufferSource'.
src/services/keys/keyManagementService.ts(59,25): error TS2769: No overload matches this call.
  Overload 1 of 4, '(iterable: Iterable<unknown> | ArrayLike<unknown>): unknown[]', gave the following error.
    Argument of type 'CryptoKey' is not assignable to parameter of type 'Iterable<unknown> | ArrayLike<unknown>'.
  Overload 2 of 4, '(arrayLike: ArrayLike<unknown>): unknown[]', gave the following error.
    Argument of type 'CryptoKey' is not assignable to parameter of type 'ArrayLike<unknown>'.
      Property 'length' is missing in type 'CryptoKey' but required in type 'ArrayLike<unknown>'.
src/services/keys/keyManagementService.ts(103,25): error TS2769: No overload matches this call.
  Overload 1 of 4, '(iterable: Iterable<unknown> | ArrayLike<unknown>): unknown[]', gave the following error.
    Argument of type 'CryptoKey' is not assignable to parameter of type 'Iterable<unknown> | ArrayLike<unknown>'.
  Overload 2 of 4, '(arrayLike: ArrayLike<unknown>): unknown[]', gave the following error.
    Argument of type 'CryptoKey' is not assignable to parameter of type 'ArrayLike<unknown>'.
      Property 'length' is missing in type 'CryptoKey' but required in type 'ArrayLike<unknown>'.
src/services/keys/keyManagementService.ts(152,35): error TS2769: No overload matches this call.
  Overload 1 of 4, '(iterable: Iterable<unknown> | ArrayLike<unknown>): unknown[]', gave the following error.
    Argument of type 'CryptoKey' is not assignable to parameter of type 'Iterable<unknown> | ArrayLike<unknown>'.
  Overload 2 of 4, '(arrayLike: ArrayLike<unknown>): unknown[]', gave the following error.
    Argument of type 'CryptoKey' is not assignable to parameter of type 'ArrayLike<unknown>'.
      Property 'length' is missing in type 'CryptoKey' but required in type 'ArrayLike<unknown>'.
src/services/keys/keyManagementService.ts(201,25): error TS2769: No overload matches this call.
  Overload 1 of 4, '(iterable: Iterable<unknown> | ArrayLike<unknown>): unknown[]', gave the following error.
    Argument of type 'CryptoKey' is not assignable to parameter of type 'Iterable<unknown> | ArrayLike<unknown>'.
  Overload 2 of 4, '(arrayLike: ArrayLike<unknown>): unknown[]', gave the following error.
    Argument of type 'CryptoKey' is not assignable to parameter of type 'ArrayLike<unknown>'.
      Property 'length' is missing in type 'CryptoKey' but required in type 'ArrayLike<unknown>'.
src/services/keys/keyManagementService.ts(292,11): error TS2554: Expected 1 arguments, but got 2.
src/services/keys/keyManagementService.ts(296,53): error TS2554: Expected 3 arguments, but got 2.
src/services/keys/keyManagementService.ts(319,53): error TS2345: Argument of type '{ encryptionKey: any; salt: any; currentUser: any; budgetId: any; }' is not assignable to parameter of type 'NewUserData'.
  Property 'shareCode' is missing in type '{ encryptionKey: any; salt: any; currentUser: any; budgetId: any; }' but required in type 'NewUserData'.
src/services/security/__tests__/securityService.test.ts(1,48): error TS6133: 'afterEach' is declared but its value is never read.
src/services/security/__tests__/securityService.test.ts(176,11): error TS2339: Property 'self' does not exist on type '{ name: string; }'.
src/services/security/__tests__/securityService.test.ts(215,34): error TS2339: Property 'ref' does not exist on type '{}'.
src/services/security/__tests__/securityService.test.ts(233,30): error TS2339: Property 'error' does not exist on type '{ userAgent: string; timestamp: number; url: string; } | { error: string; }'.
  Property 'error' does not exist on type '{ userAgent: string; timestamp: number; url: string; }'.
src/services/security/__tests__/securityService.test.ts(235,22): error TS2339: Property 'mockRestore' does not exist on type '{ (value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string; (value: any, replacer?: (string | number)[], space?: string | number): string; }'.
src/services/security/__tests__/securityService.test.ts(324,27): error TS2339: Property 'LOGIN' does not exist on type '{}'.
src/services/security/__tests__/securityService.test.ts(325,27): error TS2339: Property 'LOGOUT' does not exist on type '{}'.
src/services/security/securityService.ts(9,10): error TS2339: Property 'storageKeys' does not exist on type 'SecurityService'.
src/services/security/securityService.ts(33,47): error TS2339: Property 'storageKeys' does not exist on type 'SecurityService'.
src/services/security/securityService.ts(46,33): error TS2339: Property 'storageKeys' does not exist on type 'SecurityService'.
src/services/security/securityService.ts(57,47): error TS2339: Property 'storageKeys' does not exist on type 'SecurityService'.
src/services/security/securityService.ts(72,33): error TS2339: Property 'storageKeys' does not exist on type 'SecurityService'.
src/services/security/securityService.ts(190,36): error TS2339: Property 'storageKeys' does not exist on type 'SecurityService'.
src/services/syncServiceInitializer.ts(59,7): error TS2739: Type 'ChunkedSyncService' is missing the following properties from type 'ChunkedSyncService': start, stop, isRunning
src/services/syncServiceInitializer.ts(60,7): error TS2739: Type 'FirebaseSyncService' is missing the following properties from type 'FirebaseSyncService': start, stop, isRunning
src/services/typedChunkedSyncService.ts(155,19): error TS2352: Conversion of type 'ChunkedSyncStats' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'ChunkedSyncStats'.
src/services/typedFirebaseSyncService.ts(38,32): error TS2339: Property 'app' does not exist on type 'FirebaseSyncService'.
src/services/typedFirebaseSyncService.ts(42,32): error TS2339: Property 'db' does not exist on type 'FirebaseSyncService'.
src/services/typedFirebaseSyncService.ts(46,32): error TS2339: Property 'auth' does not exist on type 'FirebaseSyncService'.
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
src/stores/ui/toastStore.ts(26,36): error TS2339: Property 'removeToast' does not exist on type 'unknown'.
src/stores/ui/toastStore.ts(71,30): error TS2339: Property 'showSuccess' does not exist on type 'unknown'.
src/stores/ui/toastStore.ts(73,30): error TS2339: Property 'showError' does not exist on type 'unknown'.
src/stores/ui/toastStore.ts(75,30): error TS2339: Property 'showWarning' does not exist on type 'unknown'.
src/stores/ui/toastStore.ts(77,30): error TS2339: Property 'showInfo' does not exist on type 'unknown'.
src/stores/ui/toastStore.ts(79,30): error TS2339: Property 'showPayday' does not exist on type 'unknown'.
src/stores/ui/uiStore.ts(274,81): error TS2554: Expected 1 arguments, but got 2.
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
src/utils/auth/authFlowHelpers.ts(21,11): error TS2339: Property 'code' does not exist on type 'Error'.
src/utils/auth/authFlowHelpers.ts(22,11): error TS2339: Property 'canCreateNew' does not exist on type 'Error'.
src/utils/auth/authFlowHelpers.ts(23,11): error TS2339: Property 'suggestion' does not exist on type 'Error'.
src/utils/auth/authFlowHelpers.ts(48,11): error TS2339: Property 'code' does not exist on type 'Error'.
src/utils/auth/authFlowHelpers.ts(109,11): error TS2339: Property 'code' does not exist on type 'Error'.
src/utils/auth/authFlowHelpers.ts(110,11): error TS2339: Property 'canCreateNew' does not exist on type 'Error'.
src/utils/auth/authFlowHelpers.ts(111,11): error TS2339: Property 'suggestion' does not exist on type 'Error'.
src/utils/bills/__tests__/billCalculations.test.ts(12,1): error TS2708: Cannot use namespace 'jest' as a value.
src/utils/bills/__tests__/billCalculations.test.ts(14,11): error TS2708: Cannot use namespace 'jest' as a value.
src/utils/bills/__tests__/billCalculations.test.ts(19,9): error TS6133: 'mockBills' is declared but its value is never read.
src/utils/bills/__tests__/billCalculations.test.ts(58,5): error TS2708: Cannot use namespace 'jest' as a value.
src/utils/bills/__tests__/billCalculations.test.ts(246,38): error TS2345: Argument of type '{ id: string; dueDate: string; isPaid: string; }' is not assignable to parameter of type 'Bill'.
  Types of property 'isPaid' are incompatible.
    Type 'string' is not assignable to type 'boolean'.
src/utils/bills/__tests__/billCalculations.test.ts(247,38): error TS2345: Argument of type '{ id: string; dueDate: string; isPaid: number; }' is not assignable to parameter of type 'Bill'.
  Types of property 'isPaid' are incompatible.
    Type 'number' is not assignable to type 'boolean'.
src/utils/bills/__tests__/billCalculations.test.ts(343,42): error TS2345: Argument of type '{ upcoming: ({ amount: number; monthlyAmount?: undefined; } | { monthlyAmount: number; amount?: undefined; })[]; overdue: { amount: number; }[]; paid: { amount: number; }[]; all: { amount: number; }[]; }' is not assignable to parameter of type 'CategorizedBills'.
  Types of property 'upcoming' are incompatible.
    Type '({ amount: number; monthlyAmount?: undefined; } | { monthlyAmount: number; amount?: undefined; })[]' is not assignable to type 'Bill[]'.
      Type '{ amount: number; monthlyAmount?: undefined; } | { monthlyAmount: number; amount?: undefined; }' is not assignable to type 'Bill'.
        Property 'id' is missing in type '{ amount: number; monthlyAmount?: undefined; }' but required in type 'Bill'.
src/utils/bills/__tests__/billCalculations.test.ts(352,42): error TS2345: Argument of type '{ upcoming: ({ amount: number; monthlyAmount?: undefined; } | { monthlyAmount: number; amount?: undefined; })[]; overdue: { amount: number; }[]; paid: { amount: number; }[]; all: { amount: number; }[]; }' is not assignable to parameter of type 'CategorizedBills'.
  Types of property 'upcoming' are incompatible.
    Type '({ amount: number; monthlyAmount?: undefined; } | { monthlyAmount: number; amount?: undefined; })[]' is not assignable to type 'Bill[]'.
      Type '{ amount: number; monthlyAmount?: undefined; } | { monthlyAmount: number; amount?: undefined; }' is not assignable to type 'Bill'.
        Property 'id' is missing in type '{ amount: number; monthlyAmount?: undefined; }' but required in type 'Bill'.
src/utils/bills/__tests__/billCalculations.test.ts(367,42): error TS2345: Argument of type '{ upcoming: { amount: number; }[]; all: { amount: number; }[]; }' is not assignable to parameter of type 'CategorizedBills'.
  Type '{ upcoming: { amount: number; }[]; all: { amount: number; }[]; }' is missing the following properties from type 'CategorizedBills': overdue, paid
src/utils/bills/__tests__/billCalculations.test.ts(389,42): error TS2345: Argument of type '{ upcoming: ({ amount: number; monthlyAmount?: undefined; } | { amount?: undefined; monthlyAmount?: undefined; } | { monthlyAmount: number; amount?: undefined; })[]; overdue: any[]; paid: any[]; all: ({ amount: number; monthlyAmount?: undefined; } | { ...; } | { ...; })[]; }' is not assignable to parameter of type 'CategorizedBills'.
  Types of property 'upcoming' are incompatible.
    Type '({ amount: number; monthlyAmount?: undefined; } | { amount?: undefined; monthlyAmount?: undefined; } | { monthlyAmount: number; amount?: undefined; })[]' is not assignable to type 'Bill[]'.
      Type '{ amount: number; monthlyAmount?: undefined; } | { amount?: undefined; monthlyAmount?: undefined; } | { monthlyAmount: number; amount?: undefined; }' is not assignable to type 'Bill'.
        Property 'id' is missing in type '{ amount: number; monthlyAmount?: undefined; }' but required in type 'Bill'.
src/utils/bills/billCalculations.ts(68,10): error TS6133: 'match' is declared but its value is never read.
src/utils/bills/billCalculations.ts(137,23): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/bills/billCalculations.ts(137,29): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/bills/billCalculations.ts(192,36): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/bills/billCalculations.ts(192,69): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/bills/billCalculations.ts(260,34): error TS2345: Argument of type 'string | number' is not assignable to parameter of type 'string'.
  Type 'number' is not assignable to type 'string'.
src/utils/bills/billCalculations.ts(267,34): error TS2345: Argument of type 'string | number' is not assignable to parameter of type 'string'.
  Type 'number' is not assignable to type 'string'.
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
src/utils/budgeting/__tests__/paycheckUtils.test.ts(34,28): error TS2339: Property 'amount' does not exist on type '{}'.
src/utils/budgeting/__tests__/paycheckUtils.test.ts(42,28): error TS2339: Property 'amount' does not exist on type '{}'.
src/utils/budgeting/__tests__/paycheckUtils.test.ts(50,28): error TS2339: Property 'amount' does not exist on type '{}'.
src/utils/budgeting/__tests__/paycheckUtils.test.ts(58,28): error TS2339: Property 'payerName' does not exist on type '{}'.
src/utils/budgeting/__tests__/paycheckUtils.test.ts(66,28): error TS2339: Property 'payerName' does not exist on type '{}'.
src/utils/budgeting/__tests__/paycheckUtils.test.ts(74,28): error TS2339: Property 'allocationMode' does not exist on type '{}'.
src/utils/budgeting/autofunding/__tests__/rules.test.ts(10,3): error TS6133: 'INCOME_DETECTION_TYPES' is declared but its value is never read.
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
src/utils/budgeting/autofunding/conditions.ts(112,21): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/autofunding/conditions.ts(112,27): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/autofunding/conditions.ts(342,15): error TS2339: Property 'type' does not exist on type '{}'.
src/utils/budgeting/autofunding/conditions.ts(343,74): error TS2339: Property 'type' does not exist on type '{}'.
src/utils/budgeting/autofunding/conditions.ts(346,15): error TS2339: Property 'envelopeId' does not exist on type '{}'.
src/utils/budgeting/autofunding/conditions.ts(347,80): error TS2339: Property 'envelopeId' does not exist on type '{}'.
src/utils/budgeting/autofunding/rules.ts(228,12): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/autofunding/rules.ts(228,41): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/autofunding/rules.ts(241,15): error TS2339: Property 'enabled' does not exist on type '{}'.
src/utils/budgeting/autofunding/rules.ts(242,67): error TS2339: Property 'enabled' does not exist on type '{}'.
src/utils/budgeting/autofunding/rules.ts(245,15): error TS2339: Property 'type' does not exist on type '{}'.
src/utils/budgeting/autofunding/rules.ts(246,64): error TS2339: Property 'type' does not exist on type '{}'.
src/utils/budgeting/autofunding/rules.ts(249,15): error TS2339: Property 'trigger' does not exist on type '{}'.
src/utils/budgeting/autofunding/rules.ts(250,67): error TS2339: Property 'trigger' does not exist on type '{}'.
src/utils/budgeting/autofunding/rules.ts(253,15): error TS2339: Property 'search' does not exist on type '{}'.
src/utils/budgeting/autofunding/rules.ts(254,32): error TS2339: Property 'search' does not exist on type '{}'.
src/utils/budgeting/autofunding/simulation.ts(328,22): error TS6133: '_unassignedCash' is declared but its value is never read.
src/utils/budgeting/billEnvelopeCalculations.ts(29,21): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/billEnvelopeCalculations.ts(29,43): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/billEnvelopeCalculations.ts(220,28): error TS2339: Property 'biweeklyAllocation' does not exist on type '{ isValidBillEnvelope: boolean; nextBillAmount: number; remainingToFund: number; daysUntilNextBill: any; fundingProgress: number; isFullyFunded: boolean; nextBillDate: any; linkedBills: any[]; } | { ...; }'.
src/utils/budgeting/billEnvelopeCalculations.ts(318,45): error TS2339: Property 'currentBalance' does not exist on type '{ isValidBillEnvelope: boolean; nextBillAmount: number; remainingToFund: number; daysUntilNextBill: any; fundingProgress: number; isFullyFunded: boolean; nextBillDate: any; linkedBills: any[]; } | { ...; }'.
  Property 'currentBalance' does not exist on type '{ isValidBillEnvelope: boolean; nextBillAmount: number; remainingToFund: number; daysUntilNextBill: any; fundingProgress: number; isFullyFunded: boolean; nextBillDate: any; linkedBills: any[]; }'.
src/utils/budgeting/billEnvelopeCalculations.ts(319,43): error TS2339: Property 'targetMonthlyAmount' does not exist on type '{ isValidBillEnvelope: boolean; nextBillAmount: number; remainingToFund: number; daysUntilNextBill: any; fundingProgress: number; isFullyFunded: boolean; nextBillDate: any; linkedBills: any[]; } | { ...; }'.
  Property 'targetMonthlyAmount' does not exist on type '{ isValidBillEnvelope: boolean; nextBillAmount: number; remainingToFund: number; daysUntilNextBill: any; fundingProgress: number; isFullyFunded: boolean; nextBillDate: any; linkedBills: any[]; }'.
src/utils/budgeting/billEnvelopeCalculations.ts(320,39): error TS2339: Property 'nextBill' does not exist on type '{ isValidBillEnvelope: boolean; nextBillAmount: number; remainingToFund: number; daysUntilNextBill: any; fundingProgress: number; isFullyFunded: boolean; nextBillDate: any; linkedBills: any[]; } | { ...; }'.
  Property 'nextBill' does not exist on type '{ isValidBillEnvelope: boolean; nextBillAmount: number; remainingToFund: number; daysUntilNextBill: any; fundingProgress: number; isFullyFunded: boolean; nextBillDate: any; linkedBills: any[]; }'.
src/utils/budgeting/billEnvelopeCalculations.ts(365,37): error TS2339: Property 'nextBill' does not exist on type '{ isValidBillEnvelope: boolean; nextBillAmount: number; remainingToFund: number; daysUntilNextBill: any; fundingProgress: number; isFullyFunded: boolean; nextBillDate: any; linkedBills: any[]; } | { ...; }'.
  Property 'nextBill' does not exist on type '{ isValidBillEnvelope: boolean; nextBillAmount: number; remainingToFund: number; daysUntilNextBill: any; fundingProgress: number; isFullyFunded: boolean; nextBillDate: any; linkedBills: any[]; }'.
src/utils/budgeting/billEnvelopeCalculations.ts(366,33): error TS2339: Property 'nextBill' does not exist on type '{ isValidBillEnvelope: boolean; nextBillAmount: number; remainingToFund: number; daysUntilNextBill: any; fundingProgress: number; isFullyFunded: boolean; nextBillDate: any; linkedBills: any[]; } | { ...; }'.
  Property 'nextBill' does not exist on type '{ isValidBillEnvelope: boolean; nextBillAmount: number; remainingToFund: number; daysUntilNextBill: any; fundingProgress: number; isFullyFunded: boolean; nextBillDate: any; linkedBills: any[]; }'.
src/utils/budgeting/envelopeCalculations.ts(43,14): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/envelopeCalculations.ts(43,22): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/envelopeCalculations.ts(114,21): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/envelopeCalculations.ts(114,53): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/envelopeFormUtils.ts(50,12): error TS2339: Property 'name' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(52,12): error TS2339: Property 'name' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(61,14): error TS2339: Property 'name' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(69,12): error TS2339: Property 'monthlyAmount' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(76,12): error TS2339: Property 'monthlyAmount' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(80,12): error TS2339: Property 'monthlyAmount' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(84,48): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/envelopeFormUtils.ts(86,14): error TS2339: Property 'targetAmount' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(88,14): error TS2339: Property 'targetAmount' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(90,14): error TS2339: Property 'targetAmount' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(99,12): error TS2339: Property 'currentBalance' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(104,12): error TS2339: Property 'category' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(108,14): error TS2339: Property 'category' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(114,12): error TS2339: Property 'priority' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(119,12): error TS2339: Property 'color' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(125,12): error TS2339: Property 'frequency' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(130,12): error TS2339: Property 'description' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(150,50): error TS2554: Expected 2-3 arguments, but got 1.
src/utils/budgeting/envelopeFormUtils.ts(156,48): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/envelopeFormUtils.ts(194,11): error TS2339: Property 'editingId' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(194,22): error TS2339: Property 'createdBy' does not exist on type '{}'.
src/utils/budgeting/envelopeFormUtils.ts(223,14): error TS2339: Property 'id' does not exist on type '{ name: any; monthlyAmount: number; currentBalance: number; category: any; color: any; frequency: any; description: any; priority: any; autoAllocate: boolean; icon: any; envelopeType: any; targetAmount: number; ... 4 more ...; updatedBy: any; }'.
src/utils/budgeting/envelopeFormUtils.ts(224,14): error TS2339: Property 'createdAt' does not exist on type '{ name: any; monthlyAmount: number; currentBalance: number; category: any; color: any; frequency: any; description: any; priority: any; autoAllocate: boolean; icon: any; envelopeType: any; targetAmount: number; ... 4 more ...; updatedBy: any; }'.
src/utils/budgeting/envelopeFormUtils.ts(225,14): error TS2339: Property 'createdBy' does not exist on type '{ name: any; monthlyAmount: number; currentBalance: number; category: any; color: any; frequency: any; description: any; priority: any; autoAllocate: boolean; icon: any; envelopeType: any; targetAmount: number; ... 4 more ...; updatedBy: any; }'.
src/utils/budgeting/envelopeFormUtils.ts(227,14): error TS2339: Property 'id' does not exist on type '{ name: any; monthlyAmount: number; currentBalance: number; category: any; color: any; frequency: any; description: any; priority: any; autoAllocate: boolean; icon: any; envelopeType: any; targetAmount: number; ... 4 more ...; updatedBy: any; }'.
src/utils/budgeting/envelopeFormUtils.ts(265,48): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/envelopeFormUtils.ts(336,46): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/envelopeFormUtils.ts(337,32): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/envelopeFormUtils.ts(345,34): error TS2339: Property 'SINKING_FUND' does not exist on type '{ readonly BILL: "bill"; readonly VARIABLE: "variable"; readonly SAVINGS: "savings"; }'.
src/utils/budgeting/envelopeIntegrityChecker.ts(46,30): error TS2339: Property 'monthlyAmount' does not exist on type 'Envelope'.
src/utils/budgeting/envelopeIntegrityChecker.ts(92,49): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/utils/budgeting/envelopeIntegrityChecker.ts(93,14): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/utils/budgeting/envelopeIntegrityChecker.ts(190,51): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/utils/budgeting/envelopeIntegrityChecker.ts(191,16): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/utils/budgeting/envelopeIntegrityChecker.ts(230,28): error TS2339: Property 'monthlyAmount' does not exist on type 'Envelope'.
src/utils/budgeting/envelopeIntegrityChecker.ts(236,15): error TS2339: Property 'monthlyAmount' does not exist on type 'Envelope'.
src/utils/budgeting/paycheckDeletion.ts(44,28): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/paycheckDeletion.ts(46,20): error TS2339: Property 'unassignedCashAfter' does not exist on type 'PaycheckHistory'.
src/utils/budgeting/paycheckDeletion.ts(46,57): error TS2339: Property 'unassignedCashBefore' does not exist on type 'PaycheckHistory'.
src/utils/budgeting/paycheckDeletion.ts(47,29): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/paycheckDeletion.ts(56,51): error TS2339: Property 'envelopeAllocations' does not exist on type 'PaycheckHistory'.
src/utils/budgeting/paycheckDeletion.ts(63,45): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/paycheckDeletion.ts(64,47): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/paycheckProcessing.ts(104,38): error TS2345: Argument of type '{ id: string; date: Date; amount: any; mode: any; unassignedCashBefore: any; unassignedCashAfter: any; actualBalanceBefore: any; actualBalanceAfter: any; envelopeAllocations: any; notes: any; }' is not assignable to parameter of type 'PaycheckHistory'.
  Type '{ id: string; date: Date; amount: any; mode: any; unassignedCashBefore: any; unassignedCashAfter: any; actualBalanceBefore: any; actualBalanceAfter: any; envelopeAllocations: any; notes: any; }' is missing the following properties from type 'PaycheckHistory': source, lastModified
src/utils/budgeting/paycheckUtils.ts(19,12): error TS2339: Property 'amount' does not exist on type '{}'.
src/utils/budgeting/paycheckUtils.ts(23,14): error TS2339: Property 'amount' does not exist on type '{}'.
src/utils/budgeting/paycheckUtils.ts(25,14): error TS2339: Property 'amount' does not exist on type '{}'.
src/utils/budgeting/paycheckUtils.ts(31,12): error TS2339: Property 'payerName' does not exist on type '{}'.
src/utils/budgeting/paycheckUtils.ts(33,12): error TS2339: Property 'payerName' does not exist on type '{}'.
src/utils/budgeting/paycheckUtils.ts(38,12): error TS2339: Property 'allocationMode' does not exist on type '{}'.
src/utils/budgeting/paydayPredictor.ts(24,21): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/paydayPredictor.ts(24,40): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/paydayPredictor.ts(31,36): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/paydayPredictor.ts(31,46): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/paydayPredictor.ts(109,20): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/budgeting/paydayPredictor.ts(132,44): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
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
src/utils/common/__tests__/BaseMutex.test.ts(15,27): error TS2339: Property 'name' does not exist on type 'BaseMutex'.
src/utils/common/__tests__/BaseMutex.test.ts(16,27): error TS2339: Property 'locked' does not exist on type 'BaseMutex'.
src/utils/common/__tests__/BaseMutex.test.ts(148,13): error TS6133: 'thirdPromise' is declared but its value is never read.
src/utils/common/analyticsProcessor.ts(16,12): error TS2345: Argument of type 'Date' is not assignable to parameter of type 'number'.
src/utils/common/analyticsProcessor.ts(28,41): error TS2345: Argument of type 'Date' is not assignable to parameter of type 'number'.
src/utils/common/analyticsProcessor.ts(112,77): error TS2554: Expected 1-2 arguments, but got 3.
src/utils/common/analyticsProcessor.ts(116,50): error TS2339: Property 'month' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(116,72): error TS2339: Property 'month' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(149,53): error TS2339: Property 'expenses' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(149,66): error TS2339: Property 'expenses' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(221,7): error TS2698: Spread types may only be created from object types.
src/utils/common/analyticsProcessor.ts(222,41): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(222,53): error TS2339: Property 'budget' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(223,40): error TS2339: Property 'budget' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(223,53): error TS2339: Property 'amount' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(275,50): error TS2339: Property 'income' does not exist on type 'unknown'.
src/utils/common/analyticsProcessor.ts(284,50): error TS2339: Property 'expenses' does not exist on type 'unknown'.
src/utils/common/BaseMutex.ts(12,10): error TS2339: Property 'name' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(13,10): error TS2339: Property 'locked' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(14,10): error TS2339: Property 'queue' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(15,10): error TS2339: Property 'currentOperation' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(16,10): error TS2339: Property 'lockStartTime' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(25,18): error TS2339: Property 'locked' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(26,35): error TS2339: Property 'name' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(27,36): error TS2339: Property 'currentOperation' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(28,31): error TS2339: Property 'queue' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(30,16): error TS2339: Property 'queue' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(35,9): error TS2794: Expected 1 arguments, but got 0. Did you forget to include 'void' in your type argument to 'Promise'?
src/utils/common/BaseMutex.ts(51,15): error TS2339: Property 'locked' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(52,30): error TS2339: Property 'name' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(56,40): error TS2339: Property 'lockStartTime' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(57,29): error TS2339: Property 'name' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(57,43): error TS2339: Property 'currentOperation' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(59,10): error TS2339: Property 'locked' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(60,10): error TS2339: Property 'currentOperation' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(61,10): error TS2339: Property 'lockStartTime' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(64,14): error TS2339: Property 'queue' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(65,47): error TS2339: Property 'queue' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(75,29): error TS2339: Property 'name' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(78,29): error TS2339: Property 'name' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(81,31): error TS2339: Property 'name' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(83,31): error TS2339: Property 'name' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(86,31): error TS2339: Property 'name' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(89,31): error TS2339: Property 'name' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(91,31): error TS2339: Property 'name' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(100,20): error TS2339: Property 'locked' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(101,30): error TS2339: Property 'currentOperation' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(102,25): error TS2339: Property 'queue' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(103,26): error TS2339: Property 'locked' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(103,53): error TS2339: Property 'lockStartTime' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(111,10): error TS2339: Property 'locked' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(112,10): error TS2339: Property 'currentOperation' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(113,10): error TS2339: Property 'lockStartTime' does not exist on type 'BaseMutex'.
src/utils/common/BaseMutex.ts(115,29): error TS2339: Property 'name' does not exist on type 'BaseMutex'.
src/utils/common/billDiscovery.ts(106,15): error TS2339: Property 'length' does not exist on type 'unknown'.
src/utils/common/budgetHistoryTracker.ts(113,42): error TS2339: Property 'formatCurrency' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/utils/common/budgetHistoryTracker.ts(114,59): error TS2339: Property 'formatCurrency' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/utils/common/budgetHistoryTracker.ts(114,112): error TS2339: Property 'formatCurrency' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/utils/common/budgetHistoryTracker.ts(137,86): error TS2339: Property 'formatCurrency' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/utils/common/budgetHistoryTracker.ts(137,140): error TS2339: Property 'formatCurrency' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/utils/common/budgetHistoryTracker.ts(164,75): error TS2339: Property 'formatCurrency' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/utils/common/budgetHistoryTracker.ts(168,81): error TS2339: Property 'formatCurrency' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/utils/common/budgetHistoryTracker.ts(168,147): error TS2339: Property 'formatCurrency' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/utils/common/budgetHistoryTracker.ts(346,38): error TS2345: Argument of type '{ name: any; description: string; commitHash: any; tagType: string; author: string; created: number; }' is not assignable to parameter of type 'BudgetTag'.
  Types of property 'tagType' are incompatible.
    Type 'string' is not assignable to type '"release" | "milestone" | "backup"'.
src/utils/common/budgetHistoryTracker.ts(369,62): error TS2345: Argument of type 'boolean' is not assignable to parameter of type 'IndexableType'.
src/utils/common/budgetHistoryTracker.ts(560,22): error TS2339: Property 'formatCurrency' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/utils/common/budgetHistoryTracker.ts(561,19): error TS2339: Property 'formatCurrency' does not exist on type '{ deriveKey(password: any): Promise<any>; deriveKeyFromSalt(password: any, salt: any): Promise<any>; generateKey(password: any): Promise<{ key: any; salt: Uint8Array<any>; }>; ... 7 more ...; generateHash(data: any): string; }'.
src/utils/common/fixAutoAllocateUndefined.ts(18,65): error TS2339: Property 'autoAllocate' does not exist on type 'Envelope'.
src/utils/common/fixAutoAllocateUndefined.ts(30,9): error TS2353: Object literal may only specify known properties, and 'autoAllocate' does not exist in type 'UpdateSpec<Envelope> | ((obj: Envelope, ctx: { value: any; primKey: IndexableType; }) => boolean | void)'.
src/utils/common/fixAutoAllocateUndefined.ts(40,61): error TS2339: Property 'autoAllocate' does not exist on type 'Envelope'.
src/utils/common/fixAutoAllocateUndefined.ts(63,10): error TS2339: Property 'fixAutoAllocateUndefined' does not exist on type 'Window & typeof globalThis'.
src/utils/common/highlight.ts(52,14): error TS2339: Property 'debug' does not exist on type '{ enabled: boolean; sessionSampleRate: number; debug: boolean; projectId: string; environment: string; errorSampleRate: number; } | { enabled: boolean; projectId: string; environment: string; errorSampleRate: number; sessionSampleRate: number; }'.
  Property 'debug' does not exist on type '{ enabled: boolean; projectId: string; environment: string; errorSampleRate: number; sessionSampleRate: number; }'.
src/utils/common/highlight.ts(64,16): error TS2339: Property 'debug' does not exist on type '{ enabled: boolean; sessionSampleRate: number; debug: boolean; projectId: string; environment: string; errorSampleRate: number; } | { enabled: boolean; projectId: string; environment: string; errorSampleRate: number; sessionSampleRate: number; }'.
  Property 'debug' does not exist on type '{ enabled: boolean; projectId: string; environment: string; errorSampleRate: number; sessionSampleRate: number; }'.
src/utils/common/highlight.ts(82,7): error TS2353: Object literal may only specify known properties, and 'sessionSamplingRate' does not exist in type 'HighlightOptions'.
src/utils/common/highlight.ts(103,21): error TS2339: Property 'debug' does not exist on type '{ enabled: boolean; sessionSampleRate: number; debug: boolean; projectId: string; environment: string; errorSampleRate: number; } | { enabled: boolean; projectId: string; environment: string; errorSampleRate: number; sessionSampleRate: number; }'.
  Property 'debug' does not exist on type '{ enabled: boolean; projectId: string; environment: string; errorSampleRate: number; sessionSampleRate: number; }'.
src/utils/common/highlight.ts(106,16): error TS2339: Property 'debug' does not exist on type '{ enabled: boolean; sessionSampleRate: number; debug: boolean; projectId: string; environment: string; errorSampleRate: number; } | { enabled: boolean; projectId: string; environment: string; errorSampleRate: number; sessionSampleRate: number; }'.
  Property 'debug' does not exist on type '{ enabled: boolean; projectId: string; environment: string; errorSampleRate: number; sessionSampleRate: number; }'.
src/utils/common/highlight.ts(123,7): error TS6133: '_setupConsoleCapture' is declared but its value is never read.
src/utils/common/highlight.ts(186,10): error TS2339: Property 'queue' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(187,10): error TS2339: Property 'retryInterval' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(188,10): error TS2339: Property 'maxQueueSize' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(189,10): error TS2339: Property 'retryIntervalMs' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(193,14): error TS2339: Property 'queue' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(193,35): error TS2339: Property 'maxQueueSize' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(194,12): error TS2339: Property 'queue' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(197,10): error TS2339: Property 'queue' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(211,15): error TS2339: Property 'retryInterval' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(220,10): error TS2339: Property 'retryInterval' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(222,13): error TS2339: Property 'retryIntervalMs' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(226,14): error TS2339: Property 'queue' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(227,26): error TS2339: Property 'retryInterval' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(228,12): error TS2339: Property 'retryInterval' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(239,38): error TS2339: Property 'queue' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(243,14): error TS2339: Property 'queue' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(248,25): error TS2339: Property 'queue' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(254,21): error TS2339: Property 'queue' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(258,10): error TS2339: Property 'queue' does not exist on type 'ErrorReportingFallback'.
src/utils/common/highlight.ts(272,27): error TS2345: Argument of type '{}' is not assignable to parameter of type 'string'.
src/utils/common/highlight.ts(290,33): error TS2339: Property 'retryInterval' does not exist on type 'ErrorReportingFallback'.
src/utils/common/logger.ts(6,10): error TS2339: Property 'isDevelopment' does not exist on type 'Logger'.
src/utils/common/logger.ts(7,10): error TS2551: Property 'isDevSite' does not exist on type 'Logger'. Did you mean 'getIsDevSite'?
src/utils/common/logger.ts(8,10): error TS2551: Property 'debugThrottles' does not exist on type 'Logger'. Did you mean 'debugThrottled'?
src/utils/common/logger.ts(49,14): error TS2339: Property 'isDevelopment' does not exist on type 'Logger'.
src/utils/common/logger.ts(49,36): error TS2551: Property 'isDevSite' does not exist on type 'Logger'. Did you mean 'getIsDevSite'?
src/utils/common/logger.ts(51,33): error TS2339: Property 'originalConsoleLog' does not exist on type 'Window & typeof globalThis'.
src/utils/common/logger.ts(53,21): error TS2339: Property 'isDevelopment' does not exist on type 'Logger'.
src/utils/common/logger.ts(53,50): error TS2551: Property 'isDevSite' does not exist on type 'Logger'. Did you mean 'getIsDevSite'?
src/utils/common/logger.ts(77,27): error TS2551: Property 'debugThrottles' does not exist on type 'Logger'. Did you mean 'debugThrottled'?
src/utils/common/logger.ts(81,12): error TS2551: Property 'debugThrottles' does not exist on type 'Logger'. Did you mean 'debugThrottled'?
src/utils/common/logger.ts(88,14): error TS2339: Property 'isDevelopment' does not exist on type 'Logger'.
src/utils/common/logger.ts(88,36): error TS2551: Property 'isDevSite' does not exist on type 'Logger'. Did you mean 'getIsDevSite'?
src/utils/common/logger.ts(89,33): error TS2339: Property 'originalConsoleLog' does not exist on type 'Window & typeof globalThis'.
src/utils/common/logger.ts(158,31): error TS2339: Property 'originalConsoleLog' does not exist on type 'Window & typeof globalThis'.
src/utils/common/logger.ts(178,14): error TS2339: Property 'isDevelopment' does not exist on type 'Logger'.
src/utils/common/logger.ts(210,26): error TS2339: Property 'password' does not exist on type '{}'.
src/utils/common/logger.ts(211,26): error TS2339: Property 'encryptionKey' does not exist on type '{}'.
src/utils/common/logger.ts(212,26): error TS2339: Property 'token' does not exist on type '{}'.
src/utils/common/logger.ts(278,10): error TS2339: Property 'logger' does not exist on type 'Window & typeof globalThis'.
src/utils/common/logger.ts(279,10): error TS2551: Property 'testHighlight' does not exist on type 'Window & typeof globalThis'. Did you mean 'Highlight'?
src/utils/common/ocrProcessor.ts(10,10): error TS2339: Property 'worker' does not exist on type 'OCRProcessor'.
src/utils/common/ocrProcessor.ts(11,10): error TS2551: Property 'isInitialized' does not exist on type 'OCRProcessor'. Did you mean 'initialize'?
src/utils/common/ocrProcessor.ts(18,14): error TS2551: Property 'isInitialized' does not exist on type 'OCRProcessor'. Did you mean 'initialize'?
src/utils/common/ocrProcessor.ts(24,12): error TS2339: Property 'worker' does not exist on type 'OCRProcessor'.
src/utils/common/ocrProcessor.ts(26,18): error TS2339: Property 'worker' does not exist on type 'OCRProcessor'.
src/utils/common/ocrProcessor.ts(27,18): error TS2339: Property 'worker' does not exist on type 'OCRProcessor'.
src/utils/common/ocrProcessor.ts(30,18): error TS2339: Property 'worker' does not exist on type 'OCRProcessor'.
src/utils/common/ocrProcessor.ts(36,12): error TS2551: Property 'isInitialized' does not exist on type 'OCRProcessor'. Did you mean 'initialize'?
src/utils/common/ocrProcessor.ts(50,15): error TS2551: Property 'isInitialized' does not exist on type 'OCRProcessor'. Did you mean 'initialize'?
src/utils/common/ocrProcessor.ts(58,33): error TS2339: Property 'worker' does not exist on type 'OCRProcessor'.
src/utils/common/ocrProcessor.ts(261,27): error TS2551: Property 'isInitialized' does not exist on type 'OCRProcessor'. Did you mean 'initialize'?
src/utils/common/ocrProcessor.ts(262,26): error TS2339: Property 'worker' does not exist on type 'OCRProcessor'.
src/utils/common/ocrProcessor.ts(271,14): error TS2339: Property 'worker' does not exist on type 'OCRProcessor'.
src/utils/common/ocrProcessor.ts(273,20): error TS2339: Property 'worker' does not exist on type 'OCRProcessor'.
src/utils/common/ocrProcessor.ts(274,14): error TS2339: Property 'worker' does not exist on type 'OCRProcessor'.
src/utils/common/ocrProcessor.ts(275,14): error TS2551: Property 'isInitialized' does not exist on type 'OCRProcessor'. Did you mean 'initialize'?
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
src/utils/common/toastHelpers.ts(20,11): error TS2339: Property 'showSuccess' does not exist on type '{}'.
src/utils/common/toastHelpers.ts(20,24): error TS2339: Property 'showError' does not exist on type '{}'.
src/utils/common/toastHelpers.ts(20,35): error TS2339: Property 'showWarning' does not exist on type '{}'.
src/utils/common/toastHelpers.ts(20,48): error TS2339: Property 'showInfo' does not exist on type '{}'.
src/utils/common/toastHelpers.ts(20,58): error TS2339: Property 'showPayday' does not exist on type '{}'.
src/utils/common/toastHelpers.ts(102,48): error TS2339: Property 'showSuccess' does not exist on type 'unknown'.
src/utils/common/toastHelpers.ts(103,51): error TS2339: Property 'showSuccess' does not exist on type 'unknown'.
src/utils/common/toastHelpers.ts(104,52): error TS2339: Property 'showError' does not exist on type 'unknown'.
src/utils/common/toastHelpers.ts(107,49): error TS2339: Property 'showSuccess' does not exist on type 'unknown'.
src/utils/common/toastHelpers.ts(108,49): error TS2339: Property 'showSuccess' does not exist on type 'unknown'.
src/utils/common/toastHelpers.ts(109,47): error TS2339: Property 'showSuccess' does not exist on type 'unknown'.
src/utils/common/toastHelpers.ts(112,47): error TS2339: Property 'showSuccess' does not exist on type 'unknown'.
src/utils/common/toastHelpers.ts(114,30): error TS2339: Property 'showError' does not exist on type 'unknown'.
src/utils/common/transactionArchiving.ts(35,10): error TS2339: Property 'config' does not exist on type 'TransactionArchiver'.
src/utils/common/transactionArchiving.ts(36,10): error TS2339: Property 'stats' does not exist on type 'TransactionArchiver'.
src/utils/common/transactionArchiving.ts(47,55): error TS2339: Property 'config' does not exist on type 'TransactionArchiver'.
src/utils/common/transactionArchiving.ts(60,23): error TS2339: Property 'stats' does not exist on type 'TransactionArchiver'.
src/utils/common/transactionArchiving.ts(79,72): error TS2339: Property 'stats' does not exist on type 'TransactionArchiver'.
src/utils/common/transactionArchiving.ts(83,21): error TS2339: Property 'stats' does not exist on type 'TransactionArchiver'.
src/utils/common/transactionArchiving.ts(84,48): error TS2339: Property 'stats' does not exist on type 'TransactionArchiver'.
src/utils/common/transactionArchiving.ts(130,14): error TS2339: Property 'stats' does not exist on type 'TransactionArchiver'.
src/utils/common/transactionArchiving.ts(224,28): error TS2339: Property 'config' does not exist on type 'TransactionArchiver'.
src/utils/common/transactionArchiving.ts(264,12): error TS2339: Property 'stats' does not exist on type 'TransactionArchiver'.
src/utils/common/transactionArchiving.ts(275,28): error TS2339: Property 'config' does not exist on type 'TransactionArchiver'.
src/utils/common/transactionArchiving.ts(280,12): error TS2339: Property 'stats' does not exist on type 'TransactionArchiver'.
src/utils/common/transactionArchiving.ts(397,45): error TS2339: Property 'transactions' does not exist on type 'unknown'.
src/utils/common/transactionArchiving.ts(402,33): error TS2339: Property 'transactions' does not exist on type 'unknown'.
src/utils/common/transactionArchiving.ts(404,26): error TS2339: Property 'transactions' does not exist on type 'unknown'.
src/utils/common/version.ts(49,5): error TS2741: Property 'ttl' is missing in type '{ data: any; timestamp: number; }' but required in type '{ data: any; timestamp: any; ttl: number; }'.
src/utils/common/version.ts(505,5): error TS2741: Property 'ttl' is missing in type '{ data: any; timestamp: number; }' but required in type '{ data: any; timestamp: any; ttl: number; }'.
src/utils/dataManagement/__tests__/backupUtils.test.ts(23,34): error TS2339: Property 'mockResolvedValue' does not exist on type '{ (): PromiseExtended<Envelope[]>; <R>(thenShortcut: ThenShortcut<Envelope[], R>): PromiseExtended<R>; }'.
src/utils/dataManagement/__tests__/backupUtils.test.ts(24,25): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<BudgetRecord>'.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(7,25): error TS6133: 'mode' is declared but its value is never read.
src/utils/dataManagement/__tests__/dexieUtils.test.ts(7,31): error TS6133: 'tables' is declared but its value is never read.
src/utils/dataManagement/__tests__/fileUtils.test.ts(26,63): error TS2740: Type '{ readAsText: Mock<Procedure>; onload: Mock<Procedure>; onerror: Mock<Procedure>; }' is missing the following properties from type 'FileReader': error, onabort, onloadend, onloadstart, and 13 more.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(31,23): error TS2339: Property 'syncMetadata' does not exist on type 'VioletVaultDB'.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(37,41): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>'.
src/utils/dataManagement/__tests__/firebaseUtils.test.ts(45,41): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: any; }>'.
src/utils/dataManagement/dexieUtils.ts(70,33): error TS2345: Argument of type '{ id: string; unassignedCash: any; biweeklyAllocation: any; actualBalance: any; isActualBalanceManual: any; supplementalAccounts: any; lastUpdated: string; }' is not assignable to parameter of type 'BudgetRecord'.
  Property 'lastModified' is missing in type '{ id: string; unassignedCash: any; biweeklyAllocation: any; actualBalance: any; isActualBalanceManual: any; supplementalAccounts: any; lastUpdated: string; }' but required in type 'BudgetRecord'.
src/utils/dataManagement/firebaseUtils.ts(12,18): error TS2339: Property 'syncMetadata' does not exist on type 'VioletVaultDB'.
src/utils/dataManagement/firebaseUtils.ts(13,22): error TS2339: Property 'syncMetadata' does not exist on type 'VioletVaultDB'.
src/utils/dataManagement/firebaseUtils.ts(31,13): error TS2339: Property 'chunkedSyncService' does not exist on type 'typeof import("violet-vault/src/services/chunkedSyncService")'.
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
src/utils/debts/debtCalculations.ts(98,5): error TS2739: Type '{ monthsToPayoff: any; totalInterest: number; payoffDate: string; }' is missing the following properties from type 'PayoffProjection': totalMonths, monthlyBreakdown
src/utils/debts/debtFormValidation.ts(106,28): error TS2339: Property 'trim' does not exist on type 'unknown'.
src/utils/debts/debtFormValidation.ts(107,36): error TS2339: Property 'trim' does not exist on type 'unknown'.
src/utils/debts/debtFormValidation.ts(115,30): error TS2339: Property 'trim' does not exist on type 'unknown'.
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
src/utils/debug/dataDiagnostic.ts(125,15): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(131,39): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(164,15): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(171,39): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(233,27): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(236,27): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(250,49): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(274,10): error TS2339: Property 'runDataDiagnostic' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(275,10): error TS2339: Property 'cleanupCorruptedPaychecks' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/dataDiagnostic.ts(276,10): error TS2339: Property 'inspectPaycheckRecords' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(27,15): error TS2339: Property 'indexedDB' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(45,16): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(46,37): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(47,15): error TS2339: Property 'budgetMetadata' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(72,16): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(85,40): error TS2339: Property 'budgetDb' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(91,15): error TS2339: Property 'dataCounts' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(96,54): error TS2365: Operator '+' cannot be applied to types 'unknown' and 'number'.
src/utils/debug/syncDiagnostic.ts(113,16): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(114,15): error TS2339: Property 'cloudSync' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(115,27): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(116,26): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(117,30): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(120,58): error TS2339: Property 'cloudSync' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(122,19): error TS2339: Property 'cloudSyncService' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(138,16): error TS2339: Property 'firebase' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(138,35): error TS2339: Property 'firebase' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(139,27): error TS2339: Property 'firebase' does not exist on type 'Window & typeof globalThis'.
src/utils/debug/syncDiagnostic.ts(140,15): error TS2339: Property 'firebaseAuth' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(168,11): error TS2339: Property 'network' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(170,27): error TS2339: Property 'connection' does not exist on type 'Navigator'.
src/utils/debug/syncDiagnostic.ts(172,36): error TS2339: Property 'connection' does not exist on type 'Navigator'.
src/utils/debug/syncDiagnostic.ts(173,31): error TS2339: Property 'connection' does not exist on type 'Navigator'.
src/utils/debug/syncDiagnostic.ts(179,46): error TS2339: Property 'network' does not exist on type '{ timestamp: string; browser: string; url: string; errors: any[]; warnings: any[]; info: any[]; }'.
src/utils/debug/syncDiagnostic.ts(210,10): error TS2339: Property 'runSyncDiagnostic' does not exist on type 'Window & typeof globalThis'.
src/utils/pwa/backgroundSync.ts(10,10): error TS2339: Property 'syncQueue' does not exist on type 'BackgroundSyncManager'.
src/utils/pwa/backgroundSync.ts(11,10): error TS2339: Property 'isOnline' does not exist on type 'BackgroundSyncManager'.
src/utils/pwa/backgroundSync.ts(12,10): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(40,10): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(46,22): error TS2339: Property 'isOnline' does not exist on type 'BackgroundSyncManager'.
src/utils/pwa/backgroundSync.ts(50,14): error TS2339: Property 'isOnline' does not exist on type 'BackgroundSyncManager'.
src/utils/pwa/backgroundSync.ts(61,15): error TS2339: Property 'isOnline' does not exist on type 'BackgroundSyncManager'.
src/utils/pwa/backgroundSync.ts(61,32): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(66,28): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(69,39): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(105,10): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(105,35): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(110,10): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(110,35): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(119,23): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(149,10): error TS2339: Property 'isOnline' does not exist on type 'BackgroundSyncManager'.
src/utils/pwa/backgroundSync.ts(151,31): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(164,10): error TS2339: Property 'isOnline' does not exist on type 'BackgroundSyncManager'.
src/utils/pwa/backgroundSync.ts(166,31): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(175,33): error TS2339: Property 'syncQueue' does not exist on type 'BackgroundSyncManager'.
src/utils/pwa/backgroundSync.ts(175,64): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(186,48): error TS2339: Property 'syncQueue' does not exist on type 'BackgroundSyncManager'.
src/utils/pwa/backgroundSync.ts(188,14): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(190,32): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(195,12): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(204,22): error TS2339: Property 'isOnline' does not exist on type 'BackgroundSyncManager'.
src/utils/pwa/backgroundSync.ts(205,26): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(206,31): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(220,10): error TS2551: Property 'pendingOperations' does not exist on type 'BackgroundSyncManager'. Did you mean 'syncPendingOperations'?
src/utils/pwa/backgroundSync.ts(231,10): error TS2339: Property 'backgroundSyncManager' does not exist on type 'Window & typeof globalThis'.
src/utils/pwa/offlineDataValidator.ts(11,10): error TS2339: Property 'criticalTables' does not exist on type 'OfflineDataValidator'.
src/utils/pwa/offlineDataValidator.ts(36,32): error TS2339: Property 'criticalTables' does not exist on type 'OfflineDataValidator'.
src/utils/pwa/offlineDataValidator.ts(49,59): error TS2339: Property 'envelopes' does not exist on type '{}'.
src/utils/pwa/offlineDataValidator.ts(50,62): error TS2339: Property 'transactions' does not exist on type '{}'.
src/utils/pwa/offlineDataValidator.ts(90,15): error TS2339: Property 'error' does not exist on type '{ isReady: boolean; hasData: boolean; criticalDataAvailable: {}; recommendations: any[]; lastValidated: string; totalRecords: number; }'.
src/utils/pwa/offlineDataValidator.ts(131,22): error TS2551: Property 'envelope' does not exist on type 'Transaction'. Did you mean 'envelopeId'?
src/utils/pwa/offlineDataValidator.ts(148,67): error TS2339: Property 'allocated' does not exist on type 'Envelope'.
src/utils/pwa/offlineDataValidator.ts(149,63): error TS2339: Property 'spent' does not exist on type 'Envelope'.
src/utils/pwa/offlineDataValidator.ts(195,15): error TS2339: Property 'error' does not exist on type '{ envelopeLoadTime: number; transactionLoadTime: number; totalTime: number; success: boolean; }'.
src/utils/pwa/offlineDataValidator.ts(270,15): error TS2339: Property 'error' does not exist on type '{ envelopesCached: boolean; transactionsCached: boolean; billsCached: boolean; success: boolean; cacheTime: number; }'.
src/utils/pwa/offlineDataValidator.ts(282,10): error TS2339: Property 'offlineDataValidator' does not exist on type 'Window & typeof globalThis'.
src/utils/pwa/patchNotesManager.ts(10,10): error TS2339: Property 'changelogCache' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(11,10): error TS2339: Property 'cacheTimestamp' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(12,10): error TS2339: Property 'cacheTTL' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(21,14): error TS2339: Property 'changelogCache' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(21,37): error TS2339: Property 'cacheTimestamp' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(21,66): error TS2339: Property 'cacheTimestamp' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(21,88): error TS2339: Property 'cacheTTL' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(23,19): error TS2339: Property 'changelogCache' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(42,12): error TS2339: Property 'changelogCache' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(43,12): error TS2339: Property 'cacheTimestamp' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(266,10): error TS2339: Property 'changelogCache' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(267,10): error TS2339: Property 'cacheTimestamp' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(277,12): error TS2339: Property 'changelogCache' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(277,35): error TS2339: Property 'cacheTimestamp' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(277,64): error TS2339: Property 'cacheTimestamp' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(277,86): error TS2339: Property 'cacheTTL' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(280,24): error TS2339: Property 'changelogCache' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(282,22): error TS2339: Property 'cacheTimestamp' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(282,50): error TS2339: Property 'cacheTimestamp' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(283,39): error TS2339: Property 'cacheTTL' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(283,62): error TS2339: Property 'cacheTimestamp' does not exist on type 'PatchNotesManager'.
src/utils/pwa/patchNotesManager.ts(293,10): error TS2339: Property 'patchNotesManager' does not exist on type 'Window & typeof globalThis'.
src/utils/pwa/pwaManager.ts(11,10): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(12,10): error TS2339: Property 'uiStore' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(13,10): error TS2551: Property 'isInitialized' does not exist on type 'PWAManager'. Did you mean 'initialize'?
src/utils/pwa/pwaManager.ts(20,14): error TS2551: Property 'isInitialized' does not exist on type 'PWAManager'. Did you mean 'initialize'?
src/utils/pwa/pwaManager.ts(22,10): error TS2339: Property 'uiStore' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(32,10): error TS2551: Property 'isInitialized' does not exist on type 'PWAManager'. Did you mean 'initialize'?
src/utils/pwa/pwaManager.ts(48,12): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(50,16): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(52,23): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(53,23): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(57,14): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(63,18): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(65,16): error TS2339: Property 'uiStore' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(81,15): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(83,28): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(95,16): error TS2339: Property 'uiStore' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(116,12): error TS2339: Property 'uiStore' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(134,18): error TS2339: Property 'uiStore' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(135,16): error TS2339: Property 'uiStore' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(143,12): error TS2339: Property 'uiStore' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(144,12): error TS2339: Property 'uiStore' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(170,16): error TS2339: Property 'uiStore' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(188,15): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(195,18): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(208,34): error TS2339: Property 'uiStore' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(234,16): error TS2339: Property 'uiStore' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(255,27): error TS2551: Property 'isInitialized' does not exist on type 'PWAManager'. Did you mean 'initialize'?
src/utils/pwa/pwaManager.ts(256,31): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(257,31): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(258,32): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(259,32): error TS2339: Property 'registration' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(260,29): error TS2339: Property 'uiStore' does not exist on type 'PWAManager'.
src/utils/pwa/pwaManager.ts(271,10): error TS2339: Property 'pwaManager' does not exist on type 'Window & typeof globalThis'.
src/utils/pwa/serviceWorkerDiagnostics.ts(10,10): error TS2551: Property 'isInitialized' does not exist on type 'ServiceWorkerDiagnostics'. Did you mean 'initialize'?
src/utils/pwa/serviceWorkerDiagnostics.ts(11,10): error TS2339: Property 'cacheNames' does not exist on type 'ServiceWorkerDiagnostics'.
src/utils/pwa/serviceWorkerDiagnostics.ts(27,14): error TS2551: Property 'isInitialized' does not exist on type 'ServiceWorkerDiagnostics'. Did you mean 'initialize'?
src/utils/pwa/serviceWorkerDiagnostics.ts(31,12): error TS2551: Property 'isInitialized' does not exist on type 'ServiceWorkerDiagnostics'. Did you mean 'initialize'?
src/utils/pwa/serviceWorkerDiagnostics.ts(45,15): error TS2551: Property 'isInitialized' does not exist on type 'ServiceWorkerDiagnostics'. Did you mean 'initialize'?
src/utils/pwa/serviceWorkerDiagnostics.ts(95,30): error TS2339: Property 'cacheNames' does not exist on type 'ServiceWorkerDiagnostics'.
src/utils/pwa/serviceWorkerDiagnostics.ts(242,16): error TS2339: Property 'activeState' does not exist on type '{ supported: boolean; registered: boolean; scope: string; updateViaCache: ServiceWorkerUpdateViaCache; installing: boolean; waiting: boolean; active: boolean; controlsPage: boolean; }'.
src/utils/pwa/serviceWorkerDiagnostics.ts(243,16): error TS2339: Property 'activeScriptURL' does not exist on type '{ supported: boolean; registered: boolean; scope: string; updateViaCache: ServiceWorkerUpdateViaCache; installing: boolean; waiting: boolean; active: boolean; controlsPage: boolean; }'.
src/utils/pwa/serviceWorkerDiagnostics.ts(247,16): error TS2339: Property 'waitingState' does not exist on type '{ supported: boolean; registered: boolean; scope: string; updateViaCache: ServiceWorkerUpdateViaCache; installing: boolean; waiting: boolean; active: boolean; controlsPage: boolean; }'.
src/utils/pwa/serviceWorkerDiagnostics.ts(251,16): error TS2551: Property 'installingState' does not exist on type '{ supported: boolean; registered: boolean; scope: string; updateViaCache: ServiceWorkerUpdateViaCache; installing: boolean; waiting: boolean; active: boolean; controlsPage: boolean; }'. Did you mean 'installing'?
src/utils/pwa/serviceWorkerDiagnostics.ts(299,15): error TS2339: Property 'totalTime' does not exist on type '{ writeTime: number; readTime: number; deleteTime: number; success: boolean; }'.
src/utils/pwa/serviceWorkerDiagnostics.ts(305,37): error TS2339: Property 'totalTime' does not exist on type '{ writeTime: number; readTime: number; deleteTime: number; success: boolean; }'.
src/utils/pwa/serviceWorkerDiagnostics.ts(309,15): error TS2339: Property 'error' does not exist on type '{ writeTime: number; readTime: number; deleteTime: number; success: boolean; }'.
src/utils/pwa/serviceWorkerDiagnostics.ts(370,10): error TS2339: Property 'swDiagnostics' does not exist on type 'Window & typeof globalThis'.
src/utils/query/__tests__/integration/queryIntegration.test.ts(31,7): error TS2353: Object literal may only specify known properties, and 'logger' does not exist in type 'QueryClientConfig'.
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
src/utils/query/__tests__/prefetchHelpers.test.ts(51,42): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(69,42): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(70,39): error TS2339: Property 'mockResolvedValue' does not exist on type '(category: string, includeArchived?: boolean) => Promise<Envelope[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(81,17): error TS2339: Property 'includeArchived' does not exist on type '{ category: string; }'.
src/utils/query/__tests__/prefetchHelpers.test.ts(96,42): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(97,39): error TS2339: Property 'mockResolvedValue' does not exist on type '(category: string, includeArchived?: boolean) => Promise<Envelope[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(119,45): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(152,45): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(153,43): error TS2339: Property 'mockResolvedValue' does not exist on type '(startDate: Date, endDate: Date) => Promise<Transaction[]>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(173,38): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(189,38): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(205,45): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(223,31): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string, maxAge?: number) => Promise<unknown>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(238,31): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string, maxAge?: number) => Promise<unknown>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(239,42): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(240,45): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(241,38): error TS2339: Property 'mockResolvedValue' does not exist on type '(options?: {}) => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(242,47): error TS2339: Property 'mockResolvedValue' does not exist on type '() => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(243,31): error TS2339: Property 'mockResolvedValue' does not exist on type '(key: string, value: unknown, ttl?: number, category?: string) => Promise<void>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(273,46): error TS2339: Property 'mockResolvedValue' does not exist on type '(dateRange: any, options?: {}) => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(289,46): error TS2339: Property 'mockResolvedValue' does not exist on type '(dateRange: any, options?: {}) => Promise<any>'.
src/utils/query/__tests__/prefetchHelpers.test.ts(310,13): error TS6133: 'mockResults' is declared but its value is never read.
src/utils/query/__tests__/queryKeys.test.ts(197,42): error TS2339: Property 'unknown' does not exist on type '{ budget: string[]; budgetData: () => string[]; budgetSummary: () => string[]; budgetMetadata: string[]; unassignedCash: () => string[]; actualBalance: () => string[]; envelopes: string[]; envelopesList: (filters?: {}) => {}[]; ... 44 more ...; syncActivity: () => string[]; }'.
src/utils/query/optimisticHelpers.ts(47,29): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/utils/query/optimisticHelpers.ts(84,29): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
src/utils/query/optimisticHelpers.ts(226,29): error TS2339: Property 'isRunning' does not exist on type 'CloudSyncService'.
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
src/utils/query/queryClientConfig.ts(19,22): error TS2339: Property 'status' does not exist on type 'Error'.
src/utils/query/queryClientConfig.ts(19,47): error TS2339: Property 'status' does not exist on type 'Error'.
src/utils/query/queryClientConfig.ts(60,19): error TS6133: 'data' is declared but its value is never read.
src/utils/query/queryClientConfig.ts(73,19): error TS6133: 'data' is declared but its value is never read.
src/utils/query/queryClientConfig.ts(73,25): error TS6133: 'variables' is declared but its value is never read.
src/utils/query/queryClientConfig.ts(73,36): error TS6133: 'context' is declared but its value is never read.
src/utils/query/queryClientConfig.ts(75,54): error TS2339: Property 'queryClient' does not exist on type 'MutationOptions<unknown, unknown, unknown, unknown>'.
src/utils/query/queryClientConfig.ts(89,63): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/utils/query/queryClientConfig.ts(140,48): error TS2339: Property 'isFetching' does not exist on type 'Query<unknown, Error, unknown, readonly unknown[]>'.
src/utils/receipts/receiptHelpers.tsx(201,43): error TS6133: 'field' is declared but its value is never read.
src/utils/savings/savingsCalculations.ts(43,70): error TS2554: Expected 1-2 arguments, but got 3.
src/utils/savings/savingsCalculations.ts(262,11): error TS2339: Property 'status' does not exist on type '{}'.
src/utils/savings/savingsCalculations.ts(262,27): error TS2339: Property 'includeCompleted' does not exist on type '{}'.
src/utils/savings/savingsFormUtils.ts(190,14): error TS2339: Property 'createdAt' does not exist on type '{ name: any; targetAmount: number; currentAmount: number; targetDate: any; category: any; color: any; description: any; priority: any; updatedAt: string; }'.
src/utils/savings/savingsFormUtils.ts(191,14): error TS2339: Property 'id' does not exist on type '{ name: any; targetAmount: number; currentAmount: number; targetDate: any; category: any; color: any; description: any; priority: any; updatedAt: string; }'.
src/utils/savings/savingsFormUtils.ts(193,14): error TS2339: Property 'id' does not exist on type '{ name: any; targetAmount: number; currentAmount: number; targetDate: any; category: any; color: any; description: any; priority: any; updatedAt: string; }'.
src/utils/savings/savingsFormUtils.ts(194,14): error TS2339: Property 'createdAt' does not exist on type '{ name: any; targetAmount: number; currentAmount: number; targetDate: any; category: any; color: any; description: any; priority: any; updatedAt: string; }'.
src/utils/savings/savingsFormUtils.ts(309,12): error TS2365: Operator '+' cannot be applied to types 'unknown' and 'number'.
src/utils/savings/savingsFormUtils.ts(309,30): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
src/utils/savings/savingsFormUtils.ts(312,31): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/security/encryption.ts(154,17): error TS2339: Property 'deviceMemory' does not exist on type 'Navigator'.
src/utils/security/errorViewer.ts(15,12): error TS2339: Property 'VioletVaultErrors' does not exist on type 'Window & typeof globalThis'.
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
src/utils/stores/createSafeStore.ts(25,24): error TS2349: This expression is not callable.
  Type '{}' has no call signatures.
src/utils/stores/createSafeStore.ts(56,21): error TS2339: Property 'partialize' does not exist on type '{ name: string; version: any; }'.
src/utils/stores/createSafeStore.ts(78,5): error TS2339: Property 'persist' does not exist on type '{}'.
src/utils/stores/createSafeStore.ts(79,5): error TS2339: Property 'persistedKeys' does not exist on type '{}'.
src/utils/stores/createSafeStore.ts(80,5): error TS2339: Property 'immer' does not exist on type '{}'.
src/utils/stores/createSafeStore.ts(81,5): error TS2339: Property 'devtools' does not exist on type '{}'.
src/utils/stores/createSafeStore.ts(82,5): error TS2339: Property 'version' does not exist on type '{}'.
src/utils/stores/storeRegistry.ts(8,10): error TS2339: Property 'stores' does not exist on type 'StoreRegistry'.
src/utils/stores/storeRegistry.ts(9,10): error TS2339: Property 'initialized' does not exist on type 'StoreRegistry'.
src/utils/stores/storeRegistry.ts(16,14): error TS2339: Property 'stores' does not exist on type 'StoreRegistry'.
src/utils/stores/storeRegistry.ts(20,10): error TS2339: Property 'stores' does not exist on type 'StoreRegistry'.
src/utils/stores/storeRegistry.ts(33,19): error TS2339: Property '__VIOLET_VAULT_STORES__' does not exist on type 'Window & typeof globalThis'.
src/utils/stores/storeRegistry.ts(34,16): error TS2339: Property '__VIOLET_VAULT_STORES__' does not exist on type 'Window & typeof globalThis'.
src/utils/stores/storeRegistry.ts(36,14): error TS2339: Property '__VIOLET_VAULT_STORES__' does not exist on type 'Window & typeof globalThis'.
src/utils/stores/storeRegistry.ts(44,24): error TS2339: Property 'stores' does not exist on type 'StoreRegistry'.
src/utils/stores/storeRegistry.ts(52,28): error TS2339: Property 'stores' does not exist on type 'StoreRegistry'.
src/utils/stores/storeRegistry.ts(63,24): error TS2339: Property 'stores' does not exist on type 'StoreRegistry'.
src/utils/stores/storeRegistry.ts(71,10): error TS2339: Property 'stores' does not exist on type 'StoreRegistry'.
src/utils/stores/storeRegistry.ts(85,10): error TS2339: Property 'stores' does not exist on type 'StoreRegistry'.
src/utils/stores/storeRegistry.ts(110,14): error TS2339: Property 'initialized' does not exist on type 'StoreRegistry'.
src/utils/stores/storeRegistry.ts(113,12): error TS2339: Property '__VIOLET_VAULT_DEBUG__' does not exist on type 'Window & typeof globalThis'.
src/utils/stores/storeRegistry.ts(117,41): error TS2339: Property 'stores' does not exist on type 'StoreRegistry'.
src/utils/stores/storeRegistry.ts(121,31): error TS2339: Property 'stores' does not exist on type 'StoreRegistry'.
src/utils/stores/storeRegistry.ts(124,10): error TS2339: Property 'initialized' does not exist on type 'StoreRegistry'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(17,29): error TS2345: Argument of type '{ isLoading: true; }' is not assignable to parameter of type 'SyncStatus'.
  Property 'status' is missing in type '{ isLoading: true; }' but required in type 'SyncStatus'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(32,39): error TS2345: Argument of type '{ isLoading: true; }' is not assignable to parameter of type 'SyncStatus'.
  Property 'status' is missing in type '{ isLoading: true; }' but required in type 'SyncStatus'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(47,28): error TS2345: Argument of type '{ isLoading: true; }' is not assignable to parameter of type 'SyncStatus'.
  Property 'status' is missing in type '{ isLoading: true; }' but required in type 'SyncStatus'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(63,35): error TS2345: Argument of type '{ isLoading: true; }' is not assignable to parameter of type 'SyncStatus'.
  Property 'status' is missing in type '{ isLoading: true; }' but required in type 'SyncStatus'.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(151,47): error TS2708: Cannot use namespace 'jest' as a value.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(152,43): error TS2708: Cannot use namespace 'jest' as a value.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(166,47): error TS2708: Cannot use namespace 'jest' as a value.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(227,21): error TS2554: Expected 2 arguments, but got 1.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(234,21): error TS2554: Expected 2 arguments, but got 1.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(241,21): error TS2554: Expected 2 arguments, but got 1.
src/utils/sync/__tests__/syncHealthHelpers.test.ts(248,21): error TS2554: Expected 2 arguments, but got 1.
src/utils/sync/__tests__/SyncMutex.test.ts(25,27): error TS2339: Property 'name' does not exist on type 'SyncMutex'.
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
src/utils/sync/CircuitBreaker.ts(11,10): error TS2339: Property 'name' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(11,25): error TS2339: Property 'name' does not exist on type '{}'.
src/utils/sync/CircuitBreaker.ts(12,10): error TS2339: Property 'failureThreshold' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(12,37): error TS2339: Property 'failureThreshold' does not exist on type '{}'.
src/utils/sync/CircuitBreaker.ts(13,10): error TS2339: Property 'timeout' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(13,28): error TS2339: Property 'timeout' does not exist on type '{}'.
src/utils/sync/CircuitBreaker.ts(14,10): error TS2339: Property 'monitoringPeriod' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(14,37): error TS2339: Property 'monitoringPeriod' does not exist on type '{}'.
src/utils/sync/CircuitBreaker.ts(16,10): error TS2339: Property 'state' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(17,10): error TS2339: Property 'failures' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(18,10): error TS2339: Property 'lastFailureTime' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(19,10): error TS2339: Property 'nextAttempt' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(20,10): error TS2339: Property 'successCount' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(21,10): error TS2339: Property 'totalRequests' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(28,10): error TS2339: Property 'totalRequests' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(30,14): error TS2339: Property 'state' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(49,19): error TS2339: Property 'state' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(50,22): error TS2339: Property 'failures' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(51,26): error TS2339: Property 'successCount' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(52,27): error TS2339: Property 'totalRequests' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(53,30): error TS2339: Property 'failureThreshold' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(55,23): error TS2339: Property 'state' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(63,28): error TS2339: Property 'name' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(72,28): error TS2339: Property 'nextAttempt' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(73,31): error TS2339: Property 'name' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(81,11): error TS2339: Property 'code' does not exist on type 'Error'.
src/utils/sync/CircuitBreaker.ts(96,30): error TS2339: Property 'name' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(105,10): error TS2339: Property 'successCount' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(107,14): error TS2339: Property 'state' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(108,29): error TS2339: Property 'name' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(110,21): error TS2339: Property 'failures' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(112,12): error TS2339: Property 'failures' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(121,10): error TS2339: Property 'failures' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(122,10): error TS2339: Property 'lastFailureTime' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(125,18): error TS2339: Property 'name' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(125,57): error TS2339: Property 'failures' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(125,74): error TS2339: Property 'failureThreshold' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(128,21): error TS2339: Property 'state' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(132,14): error TS2339: Property 'failures' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(132,31): error TS2339: Property 'failureThreshold' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(142,10): error TS2339: Property 'state' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(143,10): error TS2339: Property 'failures' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(144,10): error TS2339: Property 'nextAttempt' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(145,29): error TS2339: Property 'name' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(153,10): error TS2339: Property 'state' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(154,10): error TS2339: Property 'nextAttempt' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(154,42): error TS2339: Property 'timeout' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(156,29): error TS2339: Property 'name' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(157,22): error TS2339: Property 'failures' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(158,23): error TS2339: Property 'failureThreshold' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(159,25): error TS2339: Property 'timeout' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(168,10): error TS2339: Property 'state' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(169,29): error TS2339: Property 'name' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(177,14): error TS2339: Property 'state' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(177,40): error TS2339: Property 'nextAttempt' does not exist on type 'CircuitBreaker'.
src/utils/sync/CircuitBreaker.ts(180,29): error TS2339: Property 'nextAttempt' does not exist on type 'CircuitBreaker'.
src/utils/sync/corruptionRecoveryHelper.ts(33,43): error TS2339: Property 'samplesFound' does not exist on type '{ databaseOpen: boolean; samplesFound: { envelopes: boolean; transactions: boolean; bills: boolean; }; envelopes: number; transactions: number; bills: number; savingsGoals: number; paychecks: number; cache: number; lastOptimized: number; } | { ...; }'.
  Property 'samplesFound' does not exist on type '{ error: any; }'.
src/utils/sync/corruptionRecoveryHelper.ts(79,10): error TS2551: Property 'safeCloudDataReset' does not exist on type 'Window & typeof globalThis'. Did you mean 'forceCloudDataReset'?
src/utils/sync/corruptionRecoveryHelper.ts(82,10): error TS2339: Property 'detectLocalDataDebug' does not exist on type 'Window & typeof globalThis'.
src/utils/sync/corruptionRecoveryHelper.ts(83,10): error TS2339: Property 'hasLocalDataDebug' does not exist on type 'Window & typeof globalThis'.
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
src/utils/sync/syncEdgeCaseTester.ts(412,10): error TS2339: Property 'syncEdgeCaseTester' does not exist on type 'Window & typeof globalThis'.
src/utils/sync/syncEdgeCaseTester.ts(413,10): error TS2339: Property 'runSyncEdgeCaseTests' does not exist on type 'Window & typeof globalThis'.
src/utils/sync/syncFlowValidator.ts(50,34): error TS2345: Argument of type '{ id: string; name: string; category: string; allocatedAmount: number; lastModified: number; }' is not assignable to parameter of type 'Envelope'.
  Property 'archived' is missing in type '{ id: string; name: string; category: string; allocatedAmount: number; lastModified: number; }' but required in type 'Envelope'.
src/utils/sync/syncFlowValidator.ts(51,37): error TS2345: Argument of type '{ id: string; description: string; amount: number; date: string; lastModified: number; }' is not assignable to parameter of type 'Transaction'.
  Type '{ id: string; description: string; amount: number; date: string; lastModified: number; }' is missing the following properties from type 'Transaction': envelopeId, category, type
src/utils/sync/syncFlowValidator.ts(52,30): error TS2345: Argument of type '{ id: string; name: string; amount: number; dueDate: Date; lastModified: number; }' is not assignable to parameter of type 'Bill'.
  Type '{ id: string; name: string; amount: number; dueDate: Date; lastModified: number; }' is missing the following properties from type 'Bill': category, isPaid, isRecurring
src/utils/sync/syncFlowValidator.ts(53,30): error TS2345: Argument of type '{ id: string; name: string; creditor: string; currentBalance: number; lastModified: number; }' is not assignable to parameter of type 'Debt'.
  Type '{ id: string; name: string; creditor: string; currentBalance: number; lastModified: number; }' is missing the following properties from type 'Debt': type, status, minimumPayment
src/utils/sync/syncFlowValidator.ts(135,40): error TS2345: Argument of type '{ id: string; name: string; lastModified: number; }[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{ id: string; name: string; lastModified: number; }' is missing the following properties from type 'Envelope': category, archived
src/utils/sync/syncFlowValidator.ts(136,43): error TS2345: Argument of type '{ id: string; description: string; amount: number; lastModified: number; }[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{ id: string; description: string; amount: number; lastModified: number; }' is missing the following properties from type 'Transaction': date, envelopeId, category, type
src/utils/sync/syncFlowValidator.ts(314,10): error TS2339: Property 'validateAllSyncFlows' does not exist on type 'Window & typeof globalThis'.
src/utils/sync/syncHealthChecker.ts(57,34): error TS2345: Argument of type '{ id: string; name: string; lastModified: string; createdAt: number; }' is not assignable to parameter of type 'Envelope'.
  Type '{ id: string; name: string; lastModified: string; createdAt: number; }' is missing the following properties from type 'Envelope': category, archived
src/utils/sync/syncHealthChecker.ts(118,20): error TS2339: Property 'direction' does not exist on type 'unknown'.
src/utils/sync/syncHealthChecker.ts(126,54): error TS2339: Property 'direction' does not exist on type 'unknown'.
src/utils/sync/syncHealthChecker.ts(277,150): error TS2339: Property 'samplesFound' does not exist on type '{ databaseOpen: boolean; samplesFound: { envelopes: boolean; transactions: boolean; bills: boolean; }; envelopes: number; transactions: number; bills: number; savingsGoals: number; paychecks: number; cache: number; lastOptimized: number; } | { ...; }'.
  Property 'samplesFound' does not exist on type '{ error: any; }'.
src/utils/sync/syncHealthChecker.ts(313,10): error TS2339: Property 'runSyncHealthCheck' does not exist on type 'Window & typeof globalThis'.
src/utils/sync/syncHealthHelpers.ts(110,20): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/sync/syncHealthHelpers.ts(110,26): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/sync/syncHealthHelpers.ts(156,3): error TS2322: Type '(() => Promise<ValidationResults>) | (() => Promise<{ success: boolean; message?: string; error?: string; }>)' is not assignable to type 'boolean'.
  Type '() => Promise<ValidationResults>' is not assignable to type 'boolean'.
src/utils/sync/syncHealthMonitor.ts(10,10): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(21,10): error TS2339: Property 'recentSyncs' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(22,10): error TS2339: Property 'maxRecentSyncs' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(24,10): error TS2339: Property 'healthThresholds' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(43,10): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(44,10): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(49,27): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(59,15): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(59,35): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(63,10): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(64,10): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(65,10): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(78,15): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(78,35): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(83,37): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(86,15): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(102,10): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(109,15): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(109,35): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(111,12): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(112,12): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(117,37): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(120,15): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(139,33): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(143,10): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(150,10): error TS2339: Property 'recentSyncs' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(151,14): error TS2339: Property 'recentSyncs' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(151,40): error TS2339: Property 'maxRecentSyncs' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(152,12): error TS2339: Property 'recentSyncs' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(152,31): error TS2339: Property 'recentSyncs' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(152,57): error TS2339: Property 'maxRecentSyncs' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(161,12): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(162,12): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(163,12): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(165,12): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(166,12): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(170,29): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(170,60): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(172,30): error TS2339: Property 'recentSyncs' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(175,12): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(175,76): error TS2339: Property 'recentSyncs' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(178,10): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(185,24): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(185,55): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(186,29): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(193,24): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(193,55): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(194,29): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(202,26): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(203,38): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(208,26): error TS2339: Property 'healthThresholds' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(213,37): error TS2339: Property 'healthThresholds' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(218,24): error TS2339: Property 'healthThresholds' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(226,26): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(227,25): error TS2339: Property 'recentSyncs' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(243,14): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(258,10): error TS2339: Property 'metrics' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(268,10): error TS2339: Property 'recentSyncs' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/syncHealthMonitor.ts(269,10): error TS2339: Property 'currentSync' does not exist on type 'SyncHealthMonitor'.
src/utils/sync/SyncMutex.ts(13,10): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(26,14): error TS2339: Property 'locked' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(26,29): error TS2339: Property 'lockStartTime' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(27,42): error TS2339: Property 'lockStartTime' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(40,26): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(48,28): error TS2339: Property 'name' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(49,30): error TS2339: Property 'currentOperation' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(50,21): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(56,17): error TS2339: Property 'queue' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(57,32): error TS2339: Property 'queue' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(67,10): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(68,10): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(69,10): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(70,12): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(70,45): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(72,10): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(72,50): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(73,10): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(79,25): error TS2339: Property 'currentOperation' does not exist on type 'SyncMutex'.
src/utils/sync/SyncMutex.ts(80,23): error TS2339: Property 'syncMetrics' does not exist on type 'SyncMutex'.
src/utils/sync/SyncQueue.ts(11,10): error TS2339: Property 'name' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(11,25): error TS2339: Property 'name' does not exist on type '{}'.
src/utils/sync/SyncQueue.ts(12,10): error TS2339: Property 'debounceMs' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(12,31): error TS2339: Property 'debounceMs' does not exist on type '{}'.
src/utils/sync/SyncQueue.ts(13,10): error TS2339: Property 'maxBatchSize' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(13,33): error TS2339: Property 'maxBatchSize' does not exist on type '{}'.
src/utils/sync/SyncQueue.ts(14,10): error TS2339: Property 'maxQueueAge' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(14,32): error TS2339: Property 'maxQueueAge' does not exist on type '{}'.
src/utils/sync/SyncQueue.ts(16,10): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
src/utils/sync/SyncQueue.ts(17,10): error TS2339: Property 'timers' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(18,10): error TS2339: Property 'processing' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(19,10): error TS2339: Property 'stats' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(38,31): error TS2339: Property 'name' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(39,25): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
src/utils/sync/SyncQueue.ts(40,26): error TS2339: Property 'debounceMs' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(49,40): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
src/utils/sync/SyncQueue.ts(61,28): error TS2339: Property 'name' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(70,15): error TS2339: Property 'stats' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(71,30): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
src/utils/sync/SyncQueue.ts(72,29): error TS2339: Property 'processing' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(82,32): error TS2339: Property 'timers' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(87,46): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
src/utils/sync/SyncQueue.ts(91,10): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
src/utils/sync/SyncQueue.ts(92,10): error TS2339: Property 'timers' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(93,28): error TS2339: Property 'name' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(102,14): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
src/utils/sync/SyncQueue.ts(103,29): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
src/utils/sync/SyncQueue.ts(105,12): error TS2339: Property 'stats' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(108,10): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
src/utils/sync/SyncQueue.ts(109,10): error TS2339: Property 'stats' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(118,14): error TS2339: Property 'timers' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(119,25): error TS2339: Property 'timers' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(125,13): error TS2339: Property 'debounceMs' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(127,10): error TS2339: Property 'timers' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(135,15): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
src/utils/sync/SyncQueue.ts(135,48): error TS2339: Property 'processing' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(139,23): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
src/utils/sync/SyncQueue.ts(140,10): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
src/utils/sync/SyncQueue.ts(141,10): error TS2339: Property 'timers' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(142,10): error TS2339: Property 'processing' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(145,30): error TS2339: Property 'name' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(149,12): error TS2339: Property 'stats' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(151,30): error TS2339: Property 'name' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(154,30): error TS2339: Property 'name' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(158,12): error TS2339: Property 'stats' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(161,12): error TS2339: Property 'processing' does not exist on type 'SyncQueue'.
src/utils/sync/SyncQueue.ts(170,14): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
src/utils/sync/SyncQueue.ts(173,29): error TS2551: Property 'queue' does not exist on type 'SyncQueue'. Did you mean 'enqueue'?
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
src/utils/testing/storeTestUtils.ts(9,10): error TS2339: Property 'storeHook' does not exist on type 'StoreTestHelper'.
src/utils/testing/storeTestUtils.ts(10,10): error TS2339: Property 'storeName' does not exist on type 'StoreTestHelper'.
src/utils/testing/storeTestUtils.ts(11,10): error TS2339: Property 'initialState' does not exist on type 'StoreTestHelper'.
src/utils/testing/storeTestUtils.ts(18,46): error TS2339: Property 'storeHook' does not exist on type 'StoreTestHelper'.
src/utils/testing/storeTestUtils.ts(19,10): error TS2339: Property 'initialState' does not exist on type 'StoreTestHelper'.
src/utils/testing/storeTestUtils.ts(27,14): error TS2339: Property 'storeHook' does not exist on type 'StoreTestHelper'.
src/utils/testing/storeTestUtils.ts(29,14): error TS2339: Property 'storeHook' does not exist on type 'StoreTestHelper'.
src/utils/testing/storeTestUtils.ts(38,46): error TS2339: Property 'storeHook' does not exist on type 'StoreTestHelper'.
src/utils/testing/storeTestUtils.ts(51,31): error TS2339: Property 'storeHook' does not exist on type 'StoreTestHelper'.
src/utils/testing/storeTestUtils.ts(62,17): error TS2339: Property 'storeHook' does not exist on type 'StoreTestHelper'.
src/utils/transactions/__tests__/filtering.test.ts(15,1): error TS2708: Cannot use namespace 'jest' as a value.
src/utils/transactions/__tests__/filtering.test.ts(17,12): error TS2708: Cannot use namespace 'jest' as a value.
src/utils/transactions/__tests__/filtering.test.ts(62,5): error TS2708: Cannot use namespace 'jest' as a value.
src/utils/transactions/__tests__/filtering.test.ts(67,14): error TS2554: Expected 2 arguments, but got 1.
src/utils/transactions/__tests__/filtering.test.ts(111,14): error TS2554: Expected 2 arguments, but got 1.
src/utils/transactions/__tests__/filtering.test.ts(130,14): error TS2554: Expected 2 arguments, but got 1.
src/utils/transactions/__tests__/filtering.test.ts(158,14): error TS2554: Expected 2 arguments, but got 1.
src/utils/transactions/__tests__/filtering.test.ts(193,14): error TS2554: Expected 2 arguments, but got 1.
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
src/utils/transactions/fileParser.ts(11,9): error TS2339: Property '_index' does not exist on type '{}'.
src/utils/transactions/fileParser.ts(42,23): error TS2339: Property 'date' does not exist on type '{ _index: any; }'.
src/utils/transactions/fileParser.ts(42,43): error TS2339: Property 'date' does not exist on type '{ _index: any; }'.
src/utils/transactions/fileParser.ts(43,37): error TS2339: Property 'date' does not exist on type '{ _index: any; }'.
src/utils/transactions/fileParser.ts(44,21): error TS2339: Property 'date' does not exist on type '{ _index: any; }'.
src/utils/transactions/fileParser.ts(60,41): error TS2339: Property 'date' does not exist on type '{}'.
src/utils/transactions/fileParser.ts(62,15): error TS2339: Property 'description' does not exist on type '{}'.
src/utils/transactions/fileParser.ts(64,15): error TS2339: Property 'amount' does not exist on type '{}'.
src/utils/transactions/fileParser.ts(65,45): error TS2339: Property 'category' does not exist on type '{}'.
src/utils/transactions/filtering.ts(196,7): error TS2339: Property 'dateRange' does not exist on type '{}'.
src/utils/transactions/filtering.ts(197,7): error TS2339: Property 'envelopeId' does not exist on type '{}'.
src/utils/transactions/filtering.ts(198,7): error TS2339: Property 'category' does not exist on type '{}'.
src/utils/transactions/filtering.ts(199,7): error TS2339: Property 'type' does not exist on type '{}'.
src/utils/transactions/filtering.ts(200,7): error TS2339: Property 'searchQuery' does not exist on type '{}'.
src/utils/transactions/filtering.ts(201,7): error TS2339: Property 'sortBy' does not exist on type '{}'.
src/utils/transactions/filtering.ts(202,7): error TS2339: Property 'sortOrder' does not exist on type '{}'.
src/utils/transactions/filtering.ts(203,7): error TS2339: Property 'limit' does not exist on type '{}'.
src/utils/transactions/index.ts(2,10): error TS2305: Module '"./envelopeMatching.ts"' has no exported member 'default'.
src/utils/transactions/index.ts(3,10): error TS2305: Module '"./fileParser.ts"' has no exported member 'default'.
src/utils/transactions/operations.ts(294,29): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/transactions/operations.ts(294,58): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
src/utils/transactions/operations.ts(333,7): error TS2339: Property 'timeWindowMinutes' does not exist on type '{}'.
src/utils/transactions/operations.ts(334,7): error TS2339: Property 'amountTolerance' does not exist on type '{}'.
src/utils/transactions/operations.ts(335,7): error TS2339: Property 'checkDescription' does not exist on type '{}'.
src/utils/transactions/operations.ts(336,7): error TS2339: Property 'checkAccount' does not exist on type '{}'.
src/utils/transactions/operations.ts(399,13): error TS2339: Property 'currency' does not exist on type '{}'.
src/utils/transactions/operations.ts(399,31): error TS2339: Property 'dateFormat' does not exist on type '{}'.
src/utils/transactions/operations.ts(399,53): error TS2339: Property 'includeTime' does not exist on type '{}'.
```

