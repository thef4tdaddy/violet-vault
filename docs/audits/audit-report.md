# Combined Audit Report

## Summary

| Category          | Current | Change |
| ----------------- | ------- | ------ |
| ESLint Issues     | 0       | -25    |
| TypeScript Errors | 165     | +15    |

_Last updated: 2025-10-29 17:11:16 UTC_

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

✅ **All files passed ESLint validation!**

Last check: 2025-10-29 17:11:05 UTC

## Typecheck Audit

### Files with Most Type Errors

- 10 errors in `src/hooks/debts/useDebtManagement.ts`
- 9 errors in `src/hooks/bills/useBillManager.ts`
- 7 errors in `src/hooks/budgeting/autofunding/useAutoFunding.ts`
- 4 errors in `src/hooks/transactions/useTransactionOperations.ts`
- 3 errors in `src/hooks/bills/useBillForm.ts`
- 2 errors in `src/hooks/transactions/useTransactionOperationsHelpers.ts`
- 2 errors in `src/hooks/auth/mutations/useJoinBudgetMutation.ts`
- 2 errors in `src/hooks/analytics/useAnalyticsIntegration.ts`
- 2 errors in `src/hooks/accounts/__tests__/useSupplementalAccounts.test.ts`
- 2 errors in `src/contexts/__tests__/authUtils.test.ts`
- 2 errors in `src/components/transactions/TransactionLedger.tsx`
- 2 errors in `src/components/security/LockScreen.tsx`
- 2 errors in `src/components/pwa/ShareTargetHandler.tsx`
- 2 errors in `src/components/modals/UnassignedCashModal.tsx`
- 2 errors in `src/components/mobile/ResponsiveModal.tsx`
- 2 errors in `src/components/layout/MainLayout.tsx`
- 2 errors in `src/components/history/ObjectHistoryViewer.tsx`
- 2 errors in `src/components/feedback/hooks/useBugReportState.ts`
- 2 errors in `src/components/debt/ui/DebtList.tsx`
- 2 errors in `src/components/debt/modals/DebtFormSections.tsx`
- 2 errors in `src/components/charts/CategoryBarChart.tsx`
- 2 errors in `src/components/budgeting/envelope/EnvelopeHistoryModal.tsx`
- 2 errors in `src/components/budgeting/EditEnvelopeModalComponents.tsx`
- 2 errors in `src/components/budgeting/CreateEnvelopeModalComponents.tsx`
- 2 errors in `src/components/budgeting/CreateEnvelopeModal.tsx`
- 2 errors in `src/components/automation/AutoFundingRuleBuilder.tsx`
- 2 errors in `src/components/automation/AutoFundingDashboard.tsx`
- 2 errors in `src/components/analytics/ChartsAndAnalytics.tsx`
- 1 errors in `src/utils/sync/dataDetectionHelper.ts`
- 1 errors in `src/utils/security/errorViewer.ts`
- 1 errors in `src/utils/common/typeTransforms.ts`
- 1 errors in `src/utils/common/transactionArchiving.ts`
- 1 errors in `src/utils/common/highlight.ts`
- 1 errors in `src/stores/ui/onboardingStore.ts`
- 1 errors in `src/stores/ui/fabStore.ts`
- 1 errors in `src/services/typedFirebaseSyncService.ts`
- 1 errors in `src/services/typedChunkedSyncService.ts`
- 1 errors in `src/services/transactions/__tests__/transactionSplitterService.test.ts`
- 1 errors in `src/services/keys/keyManagementService.ts`
- 1 errors in `src/services/chunkedSyncService.ts`
- 1 errors in `src/services/bugReport/systemInfoService.ts`
- 1 errors in `src/services/bugReport/performanceInfoService.ts`
- 1 errors in `src/services/bugReport/pageDetectionService.ts`
- 1 errors in `src/services/bugReport/index.ts`
- 1 errors in `src/hooks/transactions/useTransactionMutations.ts`
- 1 errors in `src/hooks/transactions/useTransactionLedger.ts`
- 1 errors in `src/hooks/transactions/useTransactionFileUpload.ts`
- 1 errors in `src/hooks/sync/useManualSync.ts`
- 1 errors in `src/hooks/settings/useTransactionArchiving.ts`
- 1 errors in `src/hooks/settings/useEnvelopeIntegrity.ts`
- 1 errors in `src/hooks/layout/useLayoutData.ts`
- 1 errors in `src/hooks/debts/helpers/debtManagementHelpers.ts`
- 1 errors in `src/hooks/dashboard/useMainDashboard.ts`
- 1 errors in `src/hooks/common/useConnectionManager.ts`
- 1 errors in `src/hooks/common/useBugReport.ts`
- 1 errors in `src/hooks/common/useActivityLogger.ts`
- 1 errors in `src/hooks/budgeting/usePaycheckProcessor.ts`
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
- 1 errors in `src/hooks/auth/mutations/__tests__/useJoinBudgetMutation.test.ts`
- 1 errors in `src/hooks/auth/__tests__/useUserSetup.test.ts`
- 1 errors in `src/hooks/analytics/utils/pdfGeneratorUtils.ts`
- 1 errors in `src/hooks/analytics/queries/usePaycheckTrendsQuery.ts`
- 1 errors in `src/components/ui/VersionFooter.tsx`
- 1 errors in `src/components/ui/LoadingSpinner.tsx`
- 1 errors in `src/components/ui/ConnectionDisplay.tsx`
- 1 errors in `src/components/transactions/splitter/SplitterHeader.tsx`
- 1 errors in `src/components/transactions/components/DeleteConfirmation.tsx`
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
- 1 errors in `src/components/debt/modals/DebtDetailModal.tsx`
- 1 errors in `src/components/debt/modals/AddDebtModal.tsx`
- 1 errors in `src/components/dashboard/AccountBalanceOverview.tsx`
- 1 errors in `src/components/charts/DistributionPieChart.tsx`
- 1 errors in `src/components/charts/ComposedFinancialChart.tsx`
- 1 errors in `src/components/budgeting/paycheck/PaycheckHistory.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeSummary.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx`
- 1 errors in `src/components/budgeting/PaycheckProcessor.tsx`
- 1 errors in `src/components/budgeting/EditEnvelopeModal.tsx`
- 1 errors in `src/components/automation/steps/RuleConfigurationStep.tsx`
- 1 errors in `src/components/automation/AutoFundingView.tsx`
- 1 errors in `src/components/auth/KeyManagementSettings.tsx`
- 1 errors in `src/components/analytics/SmartCategoryManager.tsx`
- 1 errors in `src/components/accounts/AccountsGrid.tsx`
- 1 errors in `src/components/accounts/AccountFormModal.tsx`

### Type Error Breakdown by Category

| Count | Error Code |
| ----- | ---------- |
| 51    | `TS2345`   |
| 42    | `TS2322`   |
| 19    | `TS2339`   |
| 7     | `TS2554`   |
| 6     | `TS6133`   |
| 6     | `TS2353`   |
| 6     | `TS2352`   |
| 5     | `TS2741`   |
| 5     | `TS2698`   |
| 4     | `TS2739`   |
| 3     | `TS2769`   |
| 3     | `TS2559`   |
| 2     | `TS2307`   |
| 1     | `TS4104`   |
| 1     | `TS2740`   |
| 1     | `TS2677`   |
| 1     | `TS2538`   |
| 1     | `TS2416`   |
| 1     | `TS2365`   |

### Detailed Type Error Report

```
src/components/accounts/AccountFormModal.tsx(129,15): error TS2698: Spread types may only be created from object types.
src/components/accounts/AccountsGrid.tsx(40,17): error TS2698: Spread types may only be created from object types.
src/components/analytics/ChartsAndAnalytics.tsx(145,9): error TS2740: Type '{}' is missing the following properties from type 'Transaction[]': length, pop, push, concat, and 29 more.
src/components/analytics/ChartsAndAnalytics.tsx(146,9): error TS2322: Type 'unknown' is not assignable to type 'AnalyticsMetrics'.
  Index signature for type 'string' is missing in type '{}'.
src/components/analytics/SmartCategoryManager.tsx(60,9): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Suggestion[]'.
  Type '{}' is missing the following properties from type 'Suggestion[]': length, pop, push, concat, and 29 more.
src/components/auth/KeyManagementSettings.tsx(159,11): error TS2739: Type '{}' is missing the following properties from type '{ success: boolean; importResult: { budgetId: string; fingerprint: string; exportedAt?: string; deviceFingerprint?: string; }; loginResult: { success: boolean; error?: string; suggestion?: string; code?: string; canCreateNew?: boolean; data?: unknown; }; }': success, importResult, loginResult
src/components/automation/AutoFundingDashboard.tsx(24,39): error TS2345: Argument of type 'number' is not assignable to parameter of type 'Record<string, unknown>'.
src/components/automation/AutoFundingDashboard.tsx(83,41): error TS2345: Argument of type 'boolean' is not assignable to parameter of type 'string'.
src/components/automation/AutoFundingRuleBuilder.tsx(62,8): error TS2741: Property 'updateConfig' is missing in type '{ ruleData: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }' but required in type '{ ruleData: any; updateConfig: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }'.
src/components/automation/AutoFundingRuleBuilder.tsx(67,13): error TS2698: Spread types may only be created from object types.
src/components/automation/AutoFundingView.tsx(27,37): error TS2345: Argument of type 'number' is not assignable to parameter of type 'Record<string, unknown>'.
src/components/automation/steps/RuleConfigurationStep.tsx(37,11): error TS2322: Type '{ ruleData: any; updateConfig: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }' is not assignable to type 'IntrinsicAttributes & { ruleData: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }'.
  Property 'updateConfig' does not exist on type 'IntrinsicAttributes & { ruleData: any; envelopes: any; toggleTargetEnvelope: any; errors: any; }'.
src/components/budgeting/CreateEnvelopeModal.tsx(85,42): error TS2554: Expected 0 arguments, but got 1.
src/components/budgeting/CreateEnvelopeModal.tsx(111,42): error TS2554: Expected 0 arguments, but got 1.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(142,9): error TS2559: Type '{ envelopeType: string; color: string; autoAllocate: boolean; billId?: string; }' has no properties in common with type '{ name?: string; category?: string; description?: string; }'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(152,9): error TS2322: Type 'unknown' is not assignable to type 'Record<string, number>'.
  Index signature for type 'string' is missing in type '{}'.
src/components/budgeting/EditEnvelopeModal.tsx(126,13): error TS2322: Type 'unknown' is not assignable to type 'boolean'.
src/components/budgeting/EditEnvelopeModalComponents.tsx(188,9): error TS2559: Type '{ envelopeType: string; priority?: string; autoAllocate?: boolean; }' has no properties in common with type '{ name?: string; category?: string; description?: string; }'.
src/components/budgeting/EditEnvelopeModalComponents.tsx(210,11): error TS2322: Type 'unknown' is not assignable to type 'Record<string, number>'.
  Index signature for type 'string' is missing in type '{}'.
src/components/budgeting/envelope/EnvelopeHistoryModal.tsx(44,14): error TS2741: Property 'onClose' is missing in type '{ objectType: string; objectId: any; objectName: any; }' but required in type 'ObjectHistoryViewerProps'.
src/components/budgeting/envelope/EnvelopeHistoryModal.tsx(48,19): error TS2698: Spread types may only be created from object types.
src/components/budgeting/envelope/EnvelopeStatusDisplay.tsx(39,42): error TS2339: Property 'balanceLabel' does not exist on type 'unknown'.
src/components/budgeting/envelope/EnvelopeSummary.tsx(6,49): error TS2698: Spread types may only be created from object types.
src/components/budgeting/paycheck/PaycheckHistory.tsx(92,47): error TS2554: Expected 0 arguments, but got 1.
src/components/budgeting/PaycheckProcessor.tsx(63,9): error TS2322: Type '{ paycheckHistory: any[]; onDeletePaycheck: (paycheck: any) => Promise<void>; deletingPaycheckId: any; }' is not assignable to type 'IntrinsicAttributes & { paycheckHistory?: any[]; paycheckStats: any; onSelectPaycheck?: () => void; }'.
  Property 'onDeletePaycheck' does not exist on type 'IntrinsicAttributes & { paycheckHistory?: any[]; paycheckStats: any; onSelectPaycheck?: () => void; }'. Did you mean 'onSelectPaycheck'?
src/components/charts/CategoryBarChart.tsx(92,12): error TS2322: Type '{ fontSize: number; tickFormatter: (value: any) => string; type: string; stroke: any; dataKey?: undefined; } | { fontSize: number; tickFormatter: (value: any) => string; dataKey: string; stroke: any; type?: undefined; }' is not assignable to type 'IntrinsicAttributes & Omit<PresentationAttributesAdaptChildEvent<any, SVGElement>, "ref" | "scale"> & XAxisProps'.
  Type '{ fontSize: number; tickFormatter: (value: any) => string; type: string; stroke: any; dataKey?: undefined; }' is not assignable to type 'XAxisProps'.
    Types of property 'type' are incompatible.
      Type 'string' is not assignable to type 'AxisDomainType'.
src/components/charts/CategoryBarChart.tsx(97,12): error TS2322: Type '{ fontSize: number; tickFormatter: (value: any) => string; dataKey: string; type: string; stroke: any; width: number; } | { fontSize: number; tickFormatter: (value: any) => string; stroke: any; dataKey?: undefined; type?: undefined; width?: undefined; }' is not assignable to type 'IntrinsicAttributes & Omit<PresentationAttributesAdaptChildEvent<any, SVGElement>, "ref" | "scale"> & YAxisProps'.
  Type '{ fontSize: number; tickFormatter: (value: any) => string; dataKey: string; type: string; stroke: any; width: number; }' is not assignable to type 'YAxisProps'.
    Types of property 'type' are incompatible.
      Type 'string' is not assignable to type 'AxisDomainType'.
src/components/charts/ComposedFinancialChart.tsx(182,11): error TS2739: Type '{ title: string; data: any; series: ({ type: string; dataKey: string; name: string; fill: string; stroke?: undefined; strokeWidth?: undefined; } | { type: string; dataKey: string; name: string; stroke: string; strokeWidth: number; fill?: undefined; })[]; }' is missing the following properties from type '{ [x: string]: any; title?: string; subtitle: any; data?: any[]; series?: any[]; height?: number; className?: string; loading?: boolean; error?: any; emptyMessage?: string; actions: any; showGrid?: boolean; showLegend?: boolean; formatTooltip: any; xAxisKey?: string; }': subtitle, actions, formatTooltip
src/components/charts/DistributionPieChart.tsx(141,8): error TS2739: Type '{ title: any; subtitle: any; data: any[]; dataKey: string; nameKey: string; className: string; showLegend: false; outerRadius: number; }' is missing the following properties from type '{ [x: string]: any; title?: string; subtitle: any; data?: any[]; dataKey?: string; nameKey?: string; height?: number; className?: string; loading?: boolean; error?: any; emptyMessage?: string; actions: any; showLegend?: boolean; ... 5 more ...; maxItems?: number; }': actions, formatTooltip, labelFormatter
src/components/dashboard/AccountBalanceOverview.tsx(58,13): error TS2322: Type '{ value: any; onChange: any; title: string; subtitle: string; className: string; currencyClassName: string; subtitleClassName: string; }' is not assignable to type 'IntrinsicAttributes & { value: any; onChange: any; title?: string; subtitle?: string; className?: string; colorClass?: string; bgClass?: string; hoverClass?: string; isManuallySet?: boolean; confirmThreshold?: number; formatCurrency?: boolean; }'.
  Property 'currencyClassName' does not exist on type 'IntrinsicAttributes & { value: any; onChange: any; title?: string; subtitle?: string; className?: string; colorClass?: string; bgClass?: string; hoverClass?: string; isManuallySet?: boolean; confirmThreshold?: number; formatCurrency?: boolean; }'.
src/components/debt/modals/AddDebtModal.tsx(74,11): error TS2322: Type '{ formData: { name: string; creditor: string; type: "personal"; currentBalance: string; originalBalance: string; interestRate: string; minimumPayment: string; paymentFrequency: "monthly"; paymentDueDate: string; ... 5 more ...; newEnvelopeName: string; }; ... 12 more ...; debtMetrics: DebtMetrics; }' is not assignable to type 'IntrinsicAttributes & { formData: any; setFormData: any; errors: any; canEdit: any; isEditMode: any; isSubmitting: any; handleFormSubmit: any; onClose: any; bills: any; billsLoading: any; }'.
  Property 'envelopes' does not exist on type 'IntrinsicAttributes & { formData: any; setFormData: any; errors: any; canEdit: any; isEditMode: any; isSubmitting: any; handleFormSubmit: any; onClose: any; bills: any; billsLoading: any; }'.
src/components/debt/modals/DebtDetailModal.tsx(48,32): error TS2554: Expected 1 arguments, but got 6.
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
src/components/transactions/components/DeleteConfirmation.tsx(20,11): error TS2322: Type 'string' is not assignable to type 'number'.
src/components/transactions/splitter/SplitterHeader.tsx(13,9): error TS2353: Object literal may only specify known properties, and 'confirmText' does not exist in type 'ConfirmConfig'.
src/components/transactions/TransactionLedger.tsx(174,9): error TS2322: Type 'Envelope[]' is not assignable to type 'import("violet-vault/src/types/finance").Envelope[]'.
  Type 'Envelope' is not assignable to type 'import("violet-vault/src/types/finance").Envelope'.
    Property 'currentBalance' is optional in type 'Envelope' but required in type 'Envelope'.
src/components/transactions/TransactionLedger.tsx(176,9): error TS2322: Type '(allocations: unknown[]) => void' is not assignable to type '(splitTransactions: Transaction[], transaction: Transaction) => Promise<void>'.
  Type 'void' is not assignable to type 'Promise<void>'.
src/components/ui/ConnectionDisplay.tsx(55,33): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'string | FunctionComponent<{ className: string; }> | ComponentClass<{ className: string; }, any>'.
src/components/ui/LoadingSpinner.tsx(4,32): error TS2339: Property 'message' does not exist on type '{}'.
src/components/ui/VersionFooter.tsx(34,60): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type '{}'.
src/contexts/__tests__/authUtils.test.ts(403,9): error TS2741: Property 'userColor' is missing in type '{ userName: string; }' but required in type 'UserData'.
src/contexts/__tests__/authUtils.test.ts(430,9): error TS2741: Property 'userColor' is missing in type '{ userName: string; }' but required in type 'UserData'.
src/hooks/accounts/__tests__/useSupplementalAccounts.test.ts(298,78): error TS2353: Object literal may only specify known properties, and 'balance' does not exist in type 'SetStateAction<AccountForm>'.
src/hooks/accounts/__tests__/useSupplementalAccounts.test.ts(308,40): error TS2322: Type 'number' is not assignable to type 'string'.
src/hooks/analytics/queries/usePaycheckTrendsQuery.ts(13,30): error TS2339: Property 'paycheckHistory' does not exist on type 'unknown'.
src/hooks/analytics/useAnalyticsIntegration.ts(44,36): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'MonthlyGroupData[]'.
  Type '{}' is missing the following properties from type 'MonthlyGroupData': month, income, expenses, net, and 2 more.
src/hooks/analytics/useAnalyticsIntegration.ts(103,12): error TS2339: Property 'map' does not exist on type 'unknown'.
src/hooks/analytics/utils/pdfGeneratorUtils.ts(93,54): error TS2339: Property 'envelopeAnalysis' does not exist on type 'unknown'.
src/hooks/auth/__tests__/useUserSetup.test.ts(36,27): error TS2339: Property 'mockClear' does not exist on type '(message: string, title?: string, duration?: number) => number'.
src/hooks/auth/mutations/__tests__/useJoinBudgetMutation.test.ts(190,11): error TS6133: 'joinData' is declared but its value is never read.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(139,26): error TS2352: Conversion of type 'UserData' to type 'import("violet-vault/src/types/auth").UserData' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Property 'userColor' is missing in type 'UserData' but required in type 'import("violet-vault/src/types/auth").UserData'.
src/hooks/auth/mutations/useJoinBudgetMutation.ts(139,74): error TS2559: Type 'SessionData' has no properties in common with type 'SessionData'.
src/hooks/auth/useAuthCompatibility.ts(63,38): error TS2339: Property 'refetch' does not exist on type '{ password: any; enabled: boolean; }'.
src/hooks/auth/useAuthenticationManager.ts(132,7): error TS2322: Type '(userDataOrPassword: any) => Promise<LoginResult>' is not assignable to type '(userDataOrPassword: unknown) => Promise<void>'.
  Type 'Promise<LoginResult>' is not assignable to type 'Promise<void>'.
    Type 'LoginResult' is not assignable to type 'void'.
src/hooks/auth/useSecurityManagerUI.ts(181,85): error TS2554: Expected 1-2 arguments, but got 3.
src/hooks/bills/useBillForm.ts(100,14): error TS2352: Conversion of type 'Bill' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Index signature for type 'string' is missing in type 'Bill'.
src/hooks/bills/useBillForm.ts(104,47): error TS2345: Argument of type 'Bill' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'Bill'.
src/hooks/bills/useBillForm.ts(171,5): error TS4104: The type 'readonly string[]' is 'readonly' and cannot be assigned to the mutable type 'string[]'.
src/hooks/bills/useBillManager.ts(123,72): error TS2345: Argument of type 'import("violet-vault/src/db/types").Transaction[]' is not assignable to parameter of type 'Transaction[]'.
  Type 'import("violet-vault/src/db/types").Transaction' is not assignable to type 'Transaction'.
    Index signature for type 'string' is missing in type 'Transaction'.
src/hooks/bills/useBillManager.ts(124,63): error TS2345: Argument of type 'Envelope[]' is not assignable to parameter of type 'Envelope[]'.
  Type 'Envelope' is not assignable to type 'Envelope'. Two different types with this name exist, but they are unrelated.
    Index signature for type 'string' is missing in type 'Envelope'.
src/hooks/bills/useBillManager.ts(125,64): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, amount
src/hooks/bills/useBillManager.ts(126,40): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Bill[]'.
  Type '{}' is missing the following properties from type 'Bill': id, name, amount, dueDate
src/hooks/bills/useBillManager.ts(168,9): error TS2322: Type 'unknown[]' is not assignable to type 'Transaction[]'.
  Type '{}' is missing the following properties from type 'Transaction': id, date, amount
src/hooks/bills/useBillManager.ts(169,9): error TS2322: Type 'unknown[]' is not assignable to type 'Bill[]'.
  Type '{}' is missing the following properties from type 'Bill': id, name, amount, dueDate
src/hooks/bills/useBillManager.ts(170,9): error TS2322: Type 'unknown[]' is not assignable to type 'Envelope[]'.
  Type '{}' is missing the following properties from type 'Envelope': id, name
src/hooks/bills/useBillManager.ts(186,9): error TS2322: Type 'unknown[]' is not assignable to type 'Bill[]'.
  Type '{}' is missing the following properties from type 'Bill': id, name, amount, dueDate
src/hooks/bills/useBillManager.ts(188,9): error TS2322: Type '(bill: unknown) => void' is not assignable to type '(bill: Bill) => Promise<void>'.
  Type 'void' is not assignable to type 'Promise<void>'.
src/hooks/bills/useBills/__tests__/billMutations.test.ts(6,22): error TS6133: 'waitFor' is declared but its value is never read.
src/hooks/bills/useBills/billMutations.ts(224,39): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/hooks/bills/useBills/billQueries.ts(213,49): error TS2322: Type '(filters?: {}) => {}[]' is not assignable to type 'readonly unknown[]'.
src/hooks/bills/useBills/index.ts(22,60): error TS2339: Property 'daysAhead' does not exist on type '{}'.
src/hooks/bills/useBillValidation.ts(20,40): error TS2339: Property 'errors' does not exist on type 'ZodError<{ id: string; name: string; amount: number; category: string; isPaid: boolean; isRecurring: boolean; lastModified: number; dueDate?: string | Date; frequency?: "monthly" | "quarterly" | "annually"; envelopeId?: string; createdAt?: number; description?: string; paymentMethod?: string; }>'.
src/hooks/budgeting/__tests__/useEnvelopesQuery.test.ts(11,3): error TS6133: 'expectQuerySuccess' is declared but its value is never read.
src/hooks/budgeting/autofunding/queries/useExecutableRules.ts(21,57): error TS2345: Argument of type 'Rule' is not assignable to parameter of type 'import("violet-vault/src/utils/budgeting/autofunding/conditions").Rule'.
  Type 'Rule' is missing the following properties from type 'Rule': enabled, trigger, type
src/hooks/budgeting/autofunding/queries/useRuleFilters.ts(21,41): error TS2345: Argument of type 'Rule[]' is not assignable to parameter of type 'AutoFundingRule[]'.
  Type 'Rule' is missing the following properties from type 'AutoFundingRule': id, name, description, type, and 7 more.
src/hooks/budgeting/autofunding/useAutoFunding.ts(32,24): error TS2339: Property 'envelopes' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(33,29): error TS2339: Property 'unassignedCash' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(34,30): error TS2339: Property 'allTransactions' does not exist on type 'unknown'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(73,61): error TS2345: Argument of type '{ isExecuting: boolean; lastExecution: any; executeRules: (rules: any, trigger?: string, triggerData?: {}) => Promise<{ success: boolean; execution: { id: string; trigger: any; executedAt: string; ... 4 more ...; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; } | { ...; }...' is not assignable to parameter of type 'UseAutoFundingExecutionReturn'.
  The types returned by 'executeRules(...)' are incompatible between these types.
    Type 'Promise<{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; } | { ...; }>' is not assignable to type 'Promise<ExecutionResult>'.
      Type '{ success: boolean; execution: { id: string; trigger: any; executedAt: string; rulesExecuted: number; totalFunded: any; results: any[]; remainingCash: any; initialCash: any; }; results: any[]; error?: undefined; executionId?: undefined; } | { ...; } | { ...; }' is not assignable to type 'ExecutionResult'.
        Type '{ success: boolean; error: any; executionId: string; execution?: undefined; results?: undefined; }' is not assignable to type 'ExecutionResult'.
          Property 'execution' is optional in type '{ success: boolean; error: any; executionId: string; execution?: undefined; results?: undefined; }' but required in type 'ExecutionResult'.
src/hooks/budgeting/autofunding/useAutoFunding.ts(88,63): error TS2345: Argument of type '(trigger?: string, triggerData?: Record<string, unknown>) => Promise<ExecutionResult | { success: boolean; error: any; }>' is not assignable to parameter of type '(trigger: string, data: Record<string, unknown>) => Promise<ExecutionResult>'.
  Type 'Promise<ExecutionResult | { success: boolean; error: any; }>' is not assignable to type 'Promise<ExecutionResult>'.
    Type 'ExecutionResult | { success: boolean; error: any; }' is not assignable to type 'ExecutionResult'.
      Type '{ success: boolean; error: any; }' is missing the following properties from type 'ExecutionResult': execution, results
src/hooks/budgeting/autofunding/useAutoFunding.ts(101,61): error TS2345: Argument of type '{ envelopes: unknown[]; unassignedCash: number; allTransactions: unknown[]; }' is not assignable to parameter of type 'BudgetContext'.
  Types of property 'envelopes' are incompatible.
    Type 'unknown[]' is not assignable to type 'Envelope[]'.
      Type '{}' is missing the following properties from type 'Envelope': id, name, currentBalance, targetAmount
src/hooks/budgeting/autofunding/useAutoFunding.ts(149,50): error TS2345: Argument of type '{ envelopes: unknown[]; unassignedCash: number; allTransactions: unknown[]; }' is not assignable to parameter of type 'BudgetContext'.
  Types of property 'envelopes' are incompatible.
    Type 'unknown[]' is not assignable to type 'Envelope[]'.
      Type '{}' is missing the following properties from type 'Envelope': id, name, currentBalance, targetAmount
src/hooks/budgeting/autofunding/useAutoFundingHelpers.ts(193,30): error TS2345: Argument of type 'ExecutionDetails' is not assignable to parameter of type 'ExecutionHistoryEntry'.
  Property 'timestamp' is optional in type 'ExecutionDetails' but required in type 'ExecutionHistoryEntry'.
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
src/hooks/budgeting/useBudgetData/paycheckMutations.ts(37,35): error TS2345: Argument of type 'void' is not assignable to parameter of type 'string'.
src/hooks/budgeting/useEnvelopeForm.ts(52,22): error TS2538: Type 'any' cannot be used as an index type.
src/hooks/budgeting/usePaycheckProcessor.ts(40,5): error TS2345: Argument of type '(allocations: AllocationItem[], paycheckAmount: number) => { isValid: boolean; message: string; overage?: number; }' is not assignable to parameter of type '(allocations: Allocation[], amount: number) => AllocationValidationResult'.
  Types of parameters 'allocations' and 'allocations' are incompatible.
    Type 'Allocation[]' is not assignable to type 'AllocationItem[]'.
      Type 'Allocation' is missing the following properties from type 'AllocationItem': envelopeId, envelopeName, amount, monthlyAmount, and 2 more.
src/hooks/common/useActivityLogger.ts(16,37): error TS2345: Argument of type 'UserData' is not assignable to parameter of type 'ActivityUser'.
  Property 'id' is missing in type 'UserData' but required in type 'ActivityUser'.
src/hooks/common/useBugReport.ts(39,5): error TS2322: Type 'string' is not assignable to type '"low" | "medium" | "high" | "critical"'.
src/hooks/common/useConnectionManager.ts(103,9): error TS2322: Type 'Envelope | Bill | Debt' is not assignable to type 'Envelope'.
  Property 'archived' is missing in type 'Bill' but required in type 'Envelope'.
src/hooks/dashboard/useMainDashboard.ts(78,43): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/hooks/debts/helpers/debtManagementHelpers.ts(455,69): error TS2345: Argument of type 'Bill' is not assignable to parameter of type 'import("violet-vault/src/db/types").Bill'.
  Type 'Bill' is missing the following properties from type 'Bill': name, category, isPaid, isRecurring, lastModified
src/hooks/debts/useDebtManagement.ts(57,7): error TS2345: Argument of type 'BillWithDebtId[]' is not assignable to parameter of type 'Bill[]'.
  Type 'BillWithDebtId' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/debts/useDebtManagement.ts(100,7): error TS2322: Type 'UseMutateFunction<{ envelopeType: string; name: string; category: string; targetAmount: number; description?: string; id: string; currentBalance: number; archived: boolean; createdAt: number; lastModified: number; }, Error, AddEnvelopeData, unknown>' is not assignable to type '(data: { name: string; targetAmount: number; currentBalance: number; category: string; }) => Promise<Envelope>'.
  Type 'void' is not assignable to type 'Promise<Envelope>'.
src/hooks/debts/useDebtManagement.ts(101,29): error TS2322: Type 'Promise<{ createdAt: number; id: string; name: string; dueDate: Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; lastModified: number; }>' is not assignable to type 'Promise<Bill>'.
  Type '{ createdAt: number; id: string; name: string; dueDate: Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; lastModified: number; }' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/debts/useDebtManagement.ts(102,33): error TS2322: Type 'Promise<{ id: string; lastModified: number; name: string; dueDate: Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; frequency?: "monthly" | "quarterly" | "annually"; envelopeId?: string; createdAt?: number; description?: string; paymentMethod?: string; }>' is not assignable to type 'Promise<void>'.
  Type '{ id: string; lastModified: number; name: string; dueDate: Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; frequency?: "monthly" | "quarterly" | "annually"; envelopeId?: string; createdAt?: number; description?: string; paymentMethod?: string; }' is not assignable to type 'void'.
src/hooks/debts/useDebtManagement.ts(116,36): error TS2322: Type 'void' is not assignable to type 'Promise<void>'.
src/hooks/debts/useDebtManagement.ts(126,7): error TS2322: Type 'BillWithDebtId[]' is not assignable to type 'Bill[]'.
  Type 'BillWithDebtId' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/debts/useDebtManagement.ts(127,33): error TS2322: Type 'Promise<{ id: string; lastModified: number; name: string; dueDate: Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; frequency?: "monthly" | "quarterly" | "annually"; envelopeId?: string; createdAt?: number; description?: string; paymentMethod?: string; }>' is not assignable to type 'Promise<void>'.
  Type '{ id: string; lastModified: number; name: string; dueDate: Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; frequency?: "monthly" | "quarterly" | "annually"; envelopeId?: string; createdAt?: number; description?: string; paymentMethod?: string; }' is not assignable to type 'void'.
src/hooks/debts/useDebtManagement.ts(136,7): error TS2322: Type 'BillWithDebtId[]' is not assignable to type 'Bill[]'.
  Type 'BillWithDebtId' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/debts/useDebtManagement.ts(159,7): error TS2322: Type '(Bill & { debtId?: string; } & Record<string, unknown>)[]' is not assignable to type 'Bill[]'.
  Type 'Bill & { debtId?: string; } & Record<string, unknown>' is not assignable to type 'Bill'.
    Types of property 'dueDate' are incompatible.
      Type 'Date' is not assignable to type 'string'.
src/hooks/debts/useDebtManagement.ts(160,27): error TS2322: Type 'Promise<string>' is not assignable to type 'Promise<void>'.
  Type 'string' is not assignable to type 'void'.
src/hooks/layout/useLayoutData.ts(74,28): error TS2339: Property 'error' does not exist on type '{ envelopes: Envelope[]; transactions: any; bills: Bill[]; savingsGoals: SavingsGoal[]; paycheckHistory: PaycheckHistory[]; dashboardSummary: {}; ... 33 more ...; dashboardError: Error; }'.
src/hooks/settings/useEnvelopeIntegrity.ts(49,17): error TS2345: Argument of type '{ total: number; corrupted: number; healthy: number; corruptedEnvelopes: { id: string | number; name: string; category: string; monthlyAmount: number; currentBalance: number; createdAt: string; issues: string[]; }[]; recommendations: string[]; } | { ...; }' is not assignable to parameter of type 'SetStateAction<IntegrityReport>'.
  Type '{ total: number; corrupted: number; healthy: number; corruptedEnvelopes: { id: string | number; name: string; category: string; monthlyAmount: number; currentBalance: number; createdAt: string; issues: string[]; }[]; recommendations: string[]; }' is not assignable to type 'SetStateAction<IntegrityReport>'.
    Type '{ total: number; corrupted: number; healthy: number; corruptedEnvelopes: { id: string | number; name: string; category: string; monthlyAmount: number; currentBalance: number; createdAt: string; issues: string[]; }[]; recommendations: string[]; }' is not assignable to type 'IntegrityReport'.
      Types of property 'corruptedEnvelopes' are incompatible.
        Type '{ id: string | number; name: string; category: string; monthlyAmount: number; currentBalance: number; createdAt: string; issues: string[]; }[]' is not assignable to type '{ id: string; name?: string; category?: string; currentBalance?: number; monthlyAmount?: number; issues: string[]; }[]'.
          Type '{ id: string | number; name: string; category: string; monthlyAmount: number; currentBalance: number; createdAt: string; issues: string[]; }' is not assignable to type '{ id: string; name?: string; category?: string; currentBalance?: number; monthlyAmount?: number; issues: string[]; }'.
            Types of property 'id' are incompatible.
              Type 'string | number' is not assignable to type 'string'.
                Type 'number' is not assignable to type 'string'.
src/hooks/settings/useTransactionArchiving.ts(94,22): error TS2345: Argument of type '{ totalCount: number; cutoffDate: string; categories: Record<string, { count: number; amount: number; }>; envelopes: Record<string, { count: number; amount: number; }>; totalAmount: number; dateRange: { ...; }; }' is not assignable to parameter of type 'SetStateAction<{ totalCount: number; cutoffDate: Date; categories: Record<string, { count: number; amount: number; }>; envelopes: Record<string, { count: number; amount: number; }>; totalAmount: number; dateRange: { ...; }; }>'.
  Type '{ totalCount: number; cutoffDate: string; categories: Record<string, { count: number; amount: number; }>; envelopes: Record<string, { count: number; amount: number; }>; totalAmount: number; dateRange: { ...; }; }' is not assignable to type '{ totalCount: number; cutoffDate: Date; categories: Record<string, { count: number; amount: number; }>; envelopes: Record<string, { count: number; amount: number; }>; totalAmount: number; dateRange: { ...; }; }'.
    Types of property 'cutoffDate' are incompatible.
      Type 'string' is not assignable to type 'Date'.
src/hooks/sync/useManualSync.ts(234,22): error TS2352: Conversion of type '{ isSyncing: boolean; isRunning: boolean; lastSyncTime: number; syncIntervalMs: number; syncType: string; hasConfig: boolean; }' to type 'ServiceStatus' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'lastSyncTime' are incompatible.
    Type 'number' is not comparable to type 'Date'.
src/hooks/transactions/useTransactionFileUpload.ts(57,48): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'ParsedRow[]'.
  Property '_index' is missing in type '{}' but required in type 'ParsedRow'.
src/hooks/transactions/useTransactionLedger.ts(101,5): error TS2554: Expected 4 arguments, but got 5.
src/hooks/transactions/useTransactionMutations.ts(102,9): error TS2353: Object literal may only specify known properties, and 'reconciledAt' does not exist in type 'Transaction'.
src/hooks/transactions/useTransactionOperations.ts(36,46): error TS2345: Argument of type '{ mutationKey: string[]; mutationFn: (transactionData: unknown) => Promise<string>; onSuccess: (data: { id: string; }) => void; onError: (error: Error) => void; }' is not assignable to parameter of type 'UseMutationOptions<string, Error, unknown, unknown>'.
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
src/hooks/transactions/useTransactionOperations.ts(65,70): error TS2353: Object literal may only specify known properties, and 'updates' does not exist in type '{ id: string; }'.
src/hooks/transactions/useTransactionOperations.ts(108,9): error TS2353: Object literal may only specify known properties, and 'transactions' does not exist in type '{ operation: string; }'.
src/hooks/transactions/useTransactionOperationsHelpers.ts(20,77): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type '{ keywords: string[]; category: string; name?: string; }[]'.
  Type '{}' is missing the following properties from type '{ keywords: string[]; category: string; name?: string; }': keywords, category
src/hooks/transactions/useTransactionOperationsHelpers.ts(150,132): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type '{ keywords: string[]; category: string; name?: string; }[]'.
  Type '{}' is missing the following properties from type '{ keywords: string[]; category: string; name?: string; }': keywords, category
src/services/bugReport/index.ts(201,19): error TS2352: Conversion of type 'SystemInfo | Promise<SystemInfo>' to type 'SystemInfo' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Promise<SystemInfo>' is not comparable to type 'SystemInfo'.
    Index signature for type 'string' is missing in type 'Promise<SystemInfo>'.
src/services/bugReport/pageDetectionService.ts(255,32): error TS2339: Property 'offsetParent' does not exist on type 'Element'.
src/services/bugReport/performanceInfoService.ts(187,11): error TS2322: Type 'string | number' is not assignable to type 'number'.
  Type 'string' is not assignable to type 'number'.
src/services/bugReport/systemInfoService.ts(72,65): error TS2345: Argument of type 'SystemInfo' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'SystemInfo'.
src/services/chunkedSyncService.ts(300,9): error TS2416: Property 'saveToCloud' in type 'ChunkedSyncService' is not assignable to the same property in base type 'IChunkedSyncService'.
  Type '(data: unknown, currentUser: { readonly uid: string; readonly userName: string; }) => Promise<{ success: boolean; }>' is not assignable to type '(data: unknown, currentUser: { readonly uid: string; readonly userName: string; }) => Promise<boolean>'.
    Type 'Promise<{ success: boolean; }>' is not assignable to type 'Promise<boolean>'.
      Type '{ success: boolean; }' is not assignable to type 'boolean'.
src/services/keys/keyManagementService.ts(41,64): error TS2769: No overload matches this call.
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
src/utils/common/highlight.ts(131,10): error TS6133: '_setupConsoleCapture' is declared but its value is never read.
src/utils/common/transactionArchiving.ts(445,39): error TS2345: Argument of type 'import("violet-vault/src/types/finance").Transaction' is not assignable to parameter of type 'import("/Users/thef4tdaddy/Git/violet-vault/src/db/types").Transaction'.
  Property 'lastModified' is missing in type 'import("violet-vault/src/types/finance").Transaction' but required in type 'import("/Users/thef4tdaddy/Git/violet-vault/src/db/types").Transaction'.
src/utils/common/typeTransforms.ts(64,3): error TS2322: Type '{ id: string; name: string; category: string; amount: number; dueDate: string; isPaid: boolean; isRecurring: boolean; frequency: "monthly" | "quarterly" | "annually"; envelopeId: string; createdAt: string; description: string; paymentMethod: string; } & Record<...>' is not assignable to type 'Bill & Record<string, unknown>'.
  Property 'lastModified' is missing in type '{ id: string; name: string; category: string; amount: number; dueDate: string; isPaid: boolean; isRecurring: boolean; frequency: "monthly" | "quarterly" | "annually"; envelopeId: string; createdAt: string; description: string; paymentMethod: string; } & Record<...>' but required in type 'Bill'.
src/utils/security/errorViewer.ts(27,9): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Record<string, unknown>'.
src/utils/sync/dataDetectionHelper.ts(27,39): error TS2345: Argument of type 'DatabaseStats' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'DatabaseStats'.
```
