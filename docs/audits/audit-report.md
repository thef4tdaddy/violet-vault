# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 2 | +2 |
| TypeScript Errors | 16 | +16 |
| TypeScript Strict Mode Errors | 68 | +68 |

*Last updated: 2025-11-26 18:05:51 UTC*

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
- 2 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/bills/useBillDetail.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/useSmartSuggestions.ts`
- 1 issues in `/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution.ts`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 2 | `react-hooks/exhaustive-deps` |
| 2 | `max-lines-per-function` |

### Detailed Lint Report
```
/home/runner/work/violet-vault/violet-vault/src/hooks/bills/useBillDetail.ts:53:30 - 1 - Arrow function has too many lines (157). Maximum allowed is 150. (max-lines-per-function)
/home/runner/work/violet-vault/violet-vault/src/hooks/bills/useBillDetail.ts:82:6 - 1 - React Hook useMemo has a missing dependency: 'bill'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution.ts:52:9 - 1 - The 'budgetWithDefaults' logical expression could make the dependencies of useCallback Hook (at line 123) change on every render. To fix this, wrap the initialization of 'budgetWithDefaults' in its own useMemo() Hook. (react-hooks/exhaustive-deps)
/home/runner/work/violet-vault/violet-vault/src/hooks/budgeting/useSmartSuggestions.ts:104:29 - 1 - Arrow function has too many lines (151). Maximum allowed is 150. (max-lines-per-function)
```

## Typecheck Audit

### Files with Most Type Errors
- 3 errors in `src/components/receipts/ReceiptScanner.tsx`
- 2 errors in `src/components/layout/ViewRenderer.tsx`
- 2 errors in `src/components/auth/AuthGateway.tsx`
- 2 errors in `src/components/analytics/components/TabContent.tsx`
- 1 errors in `src/hooks/layout/usePaycheckOperations.ts`
- 1 errors in `src/hooks/common/usePrompt.ts`
- 1 errors in `src/components/transactions/TransactionLedger.tsx`
- 1 errors in `src/components/settings/TransactionArchiving.tsx`
- 1 errors in `src/components/receipts/components/ReceiptActionButtons.tsx`
- 1 errors in `src/components/layout/MainLayout.tsx`
- 1 errors in `src/App.tsx`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 8 | `TS2322` |
| 7 | `TS2345` |
| 1 | `TS2741` |

### Detailed Type Error Report
```
src/App.tsx(30,7): error TS2322: Type '() => UiStore' is not assignable to type '() => { setUpdateAvailable: (available: boolean) => void; setInstallPromptEvent: (event: BeforeInstallPromptEvent) => void; showInstallModal: () => void; installPromptEvent: BeforeInstallPromptEvent; loadPatchNotesForUpdate: (fromVersion: string, toVersion: string) => Promise<...>; }'.
  Call signature return types 'UiStore' and '{ setUpdateAvailable: (available: boolean) => void; setInstallPromptEvent: (event: BeforeInstallPromptEvent) => void; showInstallModal: () => void; installPromptEvent: BeforeInstallPromptEvent; loadPatchNotesForUpdate: (fromVersion: string, toVersion: string) => Promise<...>; }' are incompatible.
    The types returned by 'loadPatchNotesForUpdate(...)' are incompatible between these types.
      Type 'Promise<unknown>' is not assignable to type 'Promise<void>'.
        Type 'unknown' is not assignable to type 'void'.
src/components/analytics/components/TabContent.tsx(56,25): error TS2322: Type 'unknown[]' is not assignable to type 'Record<string, unknown>[]'.
  Type 'unknown' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type '{}'.
src/components/analytics/components/TabContent.tsx(56,55): error TS2322: Type 'EnvelopeSpendingEntry[]' is not assignable to type 'Record<string, unknown>[]'.
  Type 'EnvelopeSpendingEntry' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type 'EnvelopeSpendingEntry'.
src/components/auth/AuthGateway.tsx(26,28): error TS2345: Argument of type 'LocalOnlyUser' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/auth").LocalOnlyUser'.
  Property 'userName' is optional in type 'LocalOnlyUser' but required in type 'LocalOnlyUser'.
src/components/auth/AuthGateway.tsx(79,30): error TS2345: Argument of type 'LocalOnlyUser' is not assignable to parameter of type 'import("/home/runner/work/violet-vault/violet-vault/src/types/auth").LocalOnlyUser'.
  Property 'userName' is optional in type 'LocalOnlyUser' but required in type 'LocalOnlyUser'.
src/components/layout/MainLayout.tsx(497,11): error TS2741: Property 'lockApp' is missing in type '{}' but required in type 'SecurityManager'.
src/components/layout/ViewRenderer.tsx(325,15): error TS2345: Argument of type '{ id: string | number; amount?: number; allocations?: unknown[]; }[]' is not assignable to parameter of type 'PaycheckHistory[]'.
  Type '{ id: string | number; amount?: number; allocations?: unknown[]; }' is not assignable to type 'PaycheckHistory'.
    Property 'amount' is optional in type '{ id: string | number; amount?: number; allocations?: unknown[]; }' but required in type 'PaycheckHistory'.
src/components/layout/ViewRenderer.tsx(337,9): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]' is not assignable to type 'Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to type 'Transaction'.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/receipts/ReceiptScanner.tsx(61,5): error TS2345: Argument of type '(data: { merchant: string; total: string; date: string; time: string; tax: string; subtotal: string; items: { description: string; amount: number; rawLine: string; }[]; confidence: Record<string, string>; rawText: string; processingTime: number; imageData: { ...; }; }) => void' is not assignable to parameter of type 'OnReceiptProcessedCallback'.
  Types of parameters 'data' and 'data' are incompatible.
    Type 'ReceiptProcessedData' is not assignable to type '{ merchant: string; total: string; date: string; time: string; tax: string; subtotal: string; items: { description: string; amount: number; rawLine: string; }[]; confidence: Record<string, string>; rawText: string; processingTime: number; imageData: { ...; }; }'.
      Types of property 'imageData' are incompatible.
        Property 'preview' is missing in type 'UploadedImage' but required in type '{ file: File; preview: string; }'.
src/components/receipts/ReceiptScanner.tsx(110,17): error TS2322: Type '{ merchant?: string; total?: number; date?: string; tax?: number; subtotal?: number; processingTime?: number; items?: unknown[]; confidence: { merchant?: number; total?: number; date?: number; tax?: number; subtotal?: number; }; }' is not assignable to type 'ExtractedData'.
  Types of property 'items' are incompatible.
    Type 'unknown[]' is not assignable to type 'ReceiptItem[]'.
      Type '{}' is missing the following properties from type 'ReceiptItem': description, amount
src/components/receipts/ReceiptScanner.tsx(134,17): error TS2322: Type 'ExtendedReceiptData' is not assignable to type 'ExtractedData'.
  Index signature for type 'string' is missing in type 'ExtendedReceiptData'.
src/components/receipts/components/ReceiptActionButtons.tsx(36,44): error TS2345: Argument of type 'ExtractedData' is not assignable to parameter of type 'ReceiptData'.
  Types of property 'total' are incompatible.
    Type 'string' is not assignable to type 'number'.
src/components/settings/TransactionArchiving.tsx(106,9): error TS2322: Type '{ totalCount: number; cutoffDate: Date; categories: Record<string, { count: number; amount: number; }>; envelopes: Record<string, { count: number; amount: number; }>; totalAmount: number; dateRange: { ...; }; }' is not assignable to type 'PreviewData'.
  The types of 'dateRange.earliest' are incompatible between these types.
    Type 'Date' is not assignable to type 'string'.
src/components/transactions/TransactionLedger.tsx(188,7): error TS2322: Type 'unknown[]' is not assignable to type 'Record<string, unknown>[] | { data: Record<string, unknown>[]; }'.
  Type 'unknown[]' is not assignable to type 'Record<string, unknown>[]'.
    Type 'unknown' is not assignable to type 'Record<string, unknown>'.
      Index signature for type 'string' is missing in type '{}'.
src/hooks/common/usePrompt.ts(117,20): error TS2345: Argument of type 'string | void' is not assignable to parameter of type 'string'.
  Type 'void' is not assignable to type 'string'.
src/hooks/layout/usePaycheckOperations.ts(61,11): error TS2345: Argument of type '() => Promise<BudgetRecord | null>' is not assignable to parameter of type '() => Promise<{ actualBalance?: number; unassignedCash?: number; }>'.
  Type 'Promise<BudgetRecord>' is not assignable to type 'Promise<{ actualBalance?: number; unassignedCash?: number; }>'.
    Type 'BudgetRecord' has no properties in common with type '{ actualBalance?: number; unassignedCash?: number; }'.
```

## Typecheck Strict Mode Audit

### Files with Most Strict Mode Errors
- 3 errors in `src/components/receipts/ReceiptScanner.tsx`
- 3 errors in `src/components/mobile/SlideUpModal.tsx`
- 3 errors in `src/components/layout/ViewRenderer.tsx`
- 3 errors in `src/components/debt/DebtDashboard.tsx`
- 2 errors in `src/utils/security/keyExport.ts`
- 2 errors in `src/utils/dataManagement/firebaseUtils.ts`
- 2 errors in `src/utils/bills/billUpdateHelpers.ts`
- 2 errors in `src/services/firebaseMessaging.ts`
- 2 errors in `src/components/history/BudgetHistoryViewer.tsx`
- 2 errors in `src/components/budgeting/paycheck/AllocationPreview.tsx`
- 2 errors in `src/components/budgeting/envelope/EnvelopeItem.tsx`
- 2 errors in `src/components/bills/BulkBillUpdateModal.tsx`
- 2 errors in `src/components/bills/AddBillModal.tsx`
- 2 errors in `src/components/auth/UserIndicator.tsx`
- 2 errors in `src/components/analytics/components/TabContent.tsx`
- 2 errors in `src/components/analytics/AnalyticsDashboard.tsx`
- 2 errors in `src/App.tsx`
- 1 errors in `src/hooks/transactions/useTransactionImport.ts`
- 1 errors in `src/hooks/settings/useSettingsSectionRenderer.ts`
- 1 errors in `src/hooks/notifications/useFirebaseMessaging.ts`
- 1 errors in `src/hooks/layout/usePaycheckOperations.ts`
- 1 errors in `src/hooks/budgeting/usePaycheckFormValidated.ts`
- 1 errors in `src/hooks/budgeting/autofunding/useAutoFundingExecution.ts`
- 1 errors in `src/hooks/bills/useBillOperations.ts`
- 1 errors in `src/hooks/analytics/useReportExporter.ts`
- 1 errors in `src/components/transactions/TransactionLedger.tsx`
- 1 errors in `src/components/settings/TransactionArchiving.tsx`
- 1 errors in `src/components/receipts/components/ReceiptActionButtons.tsx`
- 1 errors in `src/components/pages/MainDashboard.tsx`
- 1 errors in `src/components/layout/MainLayout.tsx`
- 1 errors in `src/components/charts/CategoryBarChart.tsx`
- 1 errors in `src/components/budgeting/suggestions/SuggestionsList.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeModalHeader.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeGridView.tsx`
- 1 errors in `src/components/budgeting/SmartEnvelopeSuggestions.tsx`
- 1 errors in `src/components/budgeting/CreateEnvelopeModalComponents.tsx`
- 1 errors in `src/components/bills/modals/BulkUpdateConfirmModal.tsx`
- 1 errors in `src/components/bills/modals/BillDetailModal.tsx`
- 1 errors in `src/components/bills/BillManagerModals.tsx`
- 1 errors in `src/components/bills/BillFormSections.tsx`
- 1 errors in `src/components/automation/AutoFundingView.tsx`
- 1 errors in `src/components/automation/AutoFundingRuleBuilder.tsx`
- 1 errors in `src/components/auth/key-management/MainContent.tsx`
- 1 errors in `src/components/auth/UserSetup.tsx`
- 1 errors in `src/components/auth/KeyManagementSettings.tsx`
- 1 errors in `src/components/analytics/CategorySuggestionsTab.tsx`
- 1 errors in `src/components/accounts/SupplementalAccounts.tsx`

### Strict Mode Error Breakdown
| Count | Error Code |
|---|---|
| 39 | `TS2322` |
| 18 | `TS2345` |
| 4 | `TS2769` |
| 2 | `TS2719` |
| 2 | `TS18048` |
| 1 | `TS7016` |
| 1 | `TS2722` |
| 1 | `TS2349` |

### Detailed Strict Mode Report
```
src/App.tsx(30,7): error TS2322: Type '() => UiStore' is not assignable to type '() => { setUpdateAvailable: (available: boolean) => void; setInstallPromptEvent: (event: BeforeInstallPromptEvent | null) => void; showInstallModal: () => void; installPromptEvent: BeforeInstallPromptEvent | null; loadPatchNotesForUpdate: (fromVersion: string, toVersion: string) => Promise<...>; }'.
  Call signature return types 'UiStore' and '{ setUpdateAvailable: (available: boolean) => void; setInstallPromptEvent: (event: BeforeInstallPromptEvent | null) => void; showInstallModal: () => void; installPromptEvent: BeforeInstallPromptEvent | null; loadPatchNotesForUpdate: (fromVersion: string, toVersion: string) => Promise<...>; }' are incompatible.
    The types returned by 'loadPatchNotesForUpdate(...)' are incompatible between these types.
      Type 'Promise<unknown>' is not assignable to type 'Promise<void>'.
        Type 'unknown' is not assignable to type 'void'.
src/App.tsx(63,25): error TS2322: Type 'CloudSyncService' is not assignable to type 'FirebaseSyncService'.
  Types of property 'start' are incompatible.
    Type '(config: SyncConfig) => void' is not assignable to type '(config: unknown) => void'.
      Types of parameters 'config' and 'config' are incompatible.
        Type 'unknown' is not assignable to type 'SyncConfig'.
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
src/components/analytics/components/TabContent.tsx(56,25): error TS2322: Type 'unknown[]' is not assignable to type 'Record<string, unknown>[]'.
  Type 'unknown' is not assignable to type 'Record<string, unknown>'.
src/components/analytics/components/TabContent.tsx(56,55): error TS2322: Type 'EnvelopeSpendingEntry[]' is not assignable to type 'Record<string, unknown>[]'.
  Type 'EnvelopeSpendingEntry' is not assignable to type 'Record<string, unknown>'.
    Index signature for type 'string' is missing in type 'EnvelopeSpendingEntry'.
src/components/auth/KeyManagementSettings.tsx(166,11): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/components/auth/UserIndicator.tsx(71,23): error TS2349: This expression is not callable.
  Type 'never' has no call signatures.
src/components/auth/UserIndicator.tsx(116,11): error TS2322: Type '((updates: { [key: string]: unknown; userName: string; userColor: string; budgetId?: string | undefined; }) => Promise<void>) | undefined' is not assignable to type '(updates: Record<string, unknown>) => void | Promise<void>'.
  Type 'undefined' is not assignable to type '(updates: Record<string, unknown>) => void | Promise<void>'.
src/components/auth/UserSetup.tsx(159,13): error TS2322: Type '(e: FormEvent) => Promise<void>' is not assignable to type '(e?: FormEvent<Element> | undefined) => void | Promise<void>'.
  Types of parameters 'e' and 'e' are incompatible.
    Type 'FormEvent<Element> | undefined' is not assignable to type 'FormEvent<Element>'.
      Type 'undefined' is not assignable to type 'FormEvent<Element>'.
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
src/components/bills/AddBillModal.tsx(211,5): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/components/bills/AddBillModal.tsx(316,13): error TS2322: Type 'unknown' is not assignable to type 'LockData | null | undefined'.
src/components/bills/BillFormSections.tsx(266,17): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Object literal may only specify known properties, and 'className' does not exist in type 'Attributes'.
src/components/bills/BillManagerModals.tsx(115,11): error TS2322: Type '(billId: string, deleteEnvelope?: boolean | undefined) => Promise<void>' is not assignable to type '(id: unknown, deleteEnvelope?: boolean | undefined) => void | Promise<void>'.
  Types of parameters 'billId' and 'id' are incompatible.
    Type 'unknown' is not assignable to type 'string'.
src/components/bills/BulkBillUpdateModal.tsx(111,17): error TS2322: Type '(billId: string, field: BillField, value: string | number) => void' is not assignable to type '(billId: string, field: string, value: string | number) => void'.
  Types of parameters 'field' and 'field' are incompatible.
    Type 'string' is not assignable to type 'BillField'.
src/components/bills/BulkBillUpdateModal.tsx(112,17): error TS2322: Type '(field: BillField, value: string | number) => void' is not assignable to type '(field: string, value: string | number) => void'.
  Types of parameters 'field' and 'field' are incompatible.
    Type 'string' is not assignable to type 'BillField'.
src/components/bills/modals/BillDetailModal.tsx(140,11): error TS2322: Type '(e: FormEvent<HTMLFormElement>) => Promise<void>' is not assignable to type '(e: FormEvent<Element>) => void | Promise<void>'.
  Types of parameters 'e' and 'e' are incompatible.
    Type 'FormEvent<Element>' is not assignable to type 'FormEvent<HTMLFormElement>'.
      Type 'Element' is missing the following properties from type 'HTMLFormElement': acceptCharset, action, autocomplete, elements, and 148 more.
src/components/bills/modals/BulkUpdateConfirmModal.tsx(74,53): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/budgeting/CreateEnvelopeModalComponents.tsx(173,11): error TS2322: Type 'string | undefined' is not assignable to type 'string | null'.
  Type 'undefined' is not assignable to type 'string | null'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(230,5): error TS2322: Type '(envelope: Partial<Envelope>) => void' is not assignable to type '(data: unknown) => void | Promise<void>'.
  Types of parameters 'envelope' and 'data' are incompatible.
    Type 'unknown' is not assignable to type 'Partial<Envelope>'.
src/components/budgeting/envelope/EnvelopeGridView.tsx(112,30): error TS2345: Argument of type '(envelope: { id: string; [key: string]: unknown; }) => JSX.Element' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => Element'.
  Types of parameters 'envelope' and 'value' are incompatible.
    Type 'unknown' is not assignable to type '{ [key: string]: unknown; id: string; }'.
src/components/budgeting/envelope/EnvelopeItem.tsx(78,9): error TS2719: Type '((envelope: Envelope) => void) | undefined' is not assignable to type '((envelope: Envelope) => void) | undefined'. Two different types with this name exist, but they are unrelated.
  Type '(envelope: Envelope) => void' is not assignable to type '(envelope: Envelope) => void'. Two different types with this name exist, but they are unrelated.
    Types of parameters 'envelope' and 'envelope' are incompatible.
      Type 'Envelope' is not assignable to type 'Envelope'. Two different types with this name exist, but they are unrelated.
        Type 'Envelope' is missing the following properties from type 'Envelope': archived, lastModified
src/components/budgeting/envelope/EnvelopeItem.tsx(79,9): error TS2719: Type '((envelope: Envelope) => void) | undefined' is not assignable to type '((envelope: Envelope) => void) | undefined'. Two different types with this name exist, but they are unrelated.
  Type '(envelope: Envelope) => void' is not assignable to type '(envelope: Envelope) => void'. Two different types with this name exist, but they are unrelated.
    Types of parameters 'envelope' and 'envelope' are incompatible.
      Type 'Envelope' is not assignable to type 'Envelope'. Two different types with this name exist, but they are unrelated.
        Type 'Envelope' is missing the following properties from type 'Envelope': archived, lastModified
src/components/budgeting/envelope/EnvelopeModalHeader.tsx(70,31): error TS2322: Type '(() => void) | undefined' is not assignable to type '() => void'.
  Type 'undefined' is not assignable to type '() => void'.
src/components/budgeting/paycheck/AllocationPreview.tsx(147,51): error TS18048: 'allocation.monthlyAmount' is possibly 'undefined'.
src/components/budgeting/paycheck/AllocationPreview.tsx(149,44): error TS18048: 'allocation.monthlyAmount' is possibly 'undefined'.
src/components/budgeting/suggestions/SuggestionsList.tsx(128,19): error TS2322: Type '(suggestion: import("/home/runner/work/violet-vault/violet-vault/src/components/budgeting/suggestions/SuggestionsList").Suggestion) => void' is not assignable to type '(suggestion: Suggestion) => void'.
  Types of parameters 'suggestion' and 'suggestion' are incompatible.
    Type 'Suggestion' is not assignable to type 'import("/home/runner/work/violet-vault/violet-vault/src/components/budgeting/suggestions/SuggestionsList").Suggestion'.
      Index signature for type 'string' is missing in type 'Suggestion'.
src/components/charts/CategoryBarChart.tsx(159,17): error TS2769: No overload matches this call.
  Overload 1 of 2, '(props: Props, context?: any): string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<...> | Promise<...> | Component<...> | null | undefined', gave the following error.
    Type 'number[]' is not assignable to type 'number | [number, number, number, number] | undefined'.
      Type 'number[]' is not assignable to type '[number, number, number, number]'.
        Target requires 4 element(s) but source may have fewer.
  Overload 2 of 2, '(props: Props): string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<...> | Component<...> | null | undefined', gave the following error.
    Type 'number[]' is not assignable to type 'number | [number, number, number, number] | undefined'.
      Type 'number[]' is not assignable to type '[number, number, number, number]'.
        Target requires 4 element(s) but source may have fewer.
src/components/debt/DebtDashboard.tsx(66,52): error TS2322: Type 'Dispatch<SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>>' is not assignable to type 'Dispatch<SetStateAction<Record<string, string | boolean>>>'.
  Type 'SetStateAction<Record<string, string | boolean>>' is not assignable to type 'SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>'.
    Type 'Record<string, string | boolean>' is not assignable to type 'SetStateAction<{ type: string; status: string; sortBy: string; sortOrder: string; }>'.
      Type 'Record<string, string | boolean>' is missing the following properties from type '{ type: string; status: string; sortBy: string; sortOrder: string; }': type, status, sortBy, sortOrder
src/components/debt/DebtDashboard.tsx(88,15): error TS2322: Type '(debt: DebtAccount) => void' is not assignable to type '(debt: DebtAccount | Debt) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/debt/DebtDashboard.tsx(89,15): error TS2322: Type '(debt: DebtAccount, amount: number) => void' is not assignable to type '(debt: DebtAccount | Debt, amount: number) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/history/BudgetHistoryViewer.tsx(115,30): error TS2322: Type '{ totalCommits: number; lastCommitDate: number; lastCommitMessage: string; lastCommitAuthor: string; } | { totalCommits: number; lastCommitDate: null; lastCommitMessage: null; lastCommitAuthor: null; } | undefined' is not assignable to type 'HistoryStatisticsData | null'.
  Type 'undefined' is not assignable to type 'HistoryStatisticsData | null'.
src/components/history/BudgetHistoryViewer.tsx(139,15): error TS2322: Type '{ commit?: BudgetCommit | undefined; changes: BudgetChange[]; } | null' is not assignable to type 'CommitDetails | null'.
  Type '{ commit?: BudgetCommit | undefined; changes: BudgetChange[]; }' is not assignable to type 'CommitDetails'.
    Types of property 'commit' are incompatible.
      Type 'BudgetCommit | undefined' is not assignable to type 'Commit | undefined'.
        Type 'BudgetCommit' is not assignable to type 'Commit'.
          Types of property 'parentHash' are incompatible.
            Type 'string | null | undefined' is not assignable to type 'string | undefined'.
              Type 'null' is not assignable to type 'string | undefined'.
src/components/layout/MainLayout.tsx(497,11): error TS2322: Type 'unknown' is not assignable to type 'SecurityManager | null'.
src/components/layout/ViewRenderer.tsx(321,9): error TS2322: Type '(paycheck: PaycheckHistory) => Promise<void>' is not assignable to type '(paycheck: PaycheckHistoryItem) => Promise<void>'.
  Types of parameters 'paycheck' and 'paycheck' are incompatible.
    Property 'lastModified' is missing in type 'PaycheckHistoryItem' but required in type 'PaycheckHistory'.
src/components/layout/ViewRenderer.tsx(325,15): error TS2345: Argument of type '{ id: string | number; amount?: number | undefined; allocations?: unknown[] | undefined; }[]' is not assignable to parameter of type 'PaycheckHistory[]'.
  Type '{ id: string | number; amount?: number | undefined; allocations?: unknown[] | undefined; }' is not assignable to type 'PaycheckHistory'.
    Types of property 'amount' are incompatible.
      Type 'number | undefined' is not assignable to type 'number'.
        Type 'undefined' is not assignable to type 'number'.
src/components/layout/ViewRenderer.tsx(337,9): error TS2322: Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction[]' is not assignable to type 'Transaction[]'.
  Type 'import("/home/runner/work/violet-vault/violet-vault/src/types/finance").Transaction' is not assignable to type 'Transaction'.
    Types of property 'id' are incompatible.
      Type 'string | number' is not assignable to type 'string'.
        Type 'number' is not assignable to type 'string'.
src/components/mobile/SlideUpModal.tsx(302,5): error TS2345: Argument of type 'RefObject<HTMLDivElement | null>' is not assignable to parameter of type 'RefObject<HTMLDivElement>'.
  Type 'HTMLDivElement | null' is not assignable to type 'HTMLDivElement'.
    Type 'null' is not assignable to type 'HTMLDivElement'.
src/components/mobile/SlideUpModal.tsx(350,9): error TS2322: Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'RefObject<HTMLDivElement>'.
  Type 'HTMLDivElement | null' is not assignable to type 'HTMLDivElement'.
    Type 'null' is not assignable to type 'HTMLDivElement'.
src/components/mobile/SlideUpModal.tsx(351,9): error TS2322: Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'RefObject<HTMLDivElement>'.
  Type 'HTMLDivElement | null' is not assignable to type 'HTMLDivElement'.
    Type 'null' is not assignable to type 'HTMLDivElement'.
src/components/pages/MainDashboard.tsx(167,9): error TS2322: Type '(updates: Partial<TransactionFormState>) => void' is not assignable to type '(updates: Partial<NewTransaction>) => void'.
  Types of parameters 'updates' and 'updates' are incompatible.
    Type 'Partial<NewTransaction>' is not assignable to type 'Partial<TransactionFormState>'.
      Types of property 'type' are incompatible.
        Type 'string | undefined' is not assignable to type '"income" | "expense" | undefined'.
          Type 'string' is not assignable to type '"income" | "expense" | undefined'.
src/components/receipts/ReceiptScanner.tsx(61,5): error TS2345: Argument of type '(data: { merchant: string | null; total: string | null; date: string | null; time: string | null; tax: string | null; subtotal: string | null; items: { description: string; amount: number; rawLine: string; }[]; confidence: Record<...>; rawText: string; processingTime: number; imageData: { ...; }; }) => void' is not assignable to parameter of type 'OnReceiptProcessedCallback'.
  Types of parameters 'data' and 'data' are incompatible.
    Type 'ReceiptProcessedData' is not assignable to type '{ merchant: string | null; total: string | null; date: string | null; time: string | null; tax: string | null; subtotal: string | null; items: { description: string; amount: number; rawLine: string; }[]; confidence: Record<...>; rawText: string; processingTime: number; imageData: { ...; }; }'.
      Types of property 'imageData' are incompatible.
        Property 'preview' is missing in type 'UploadedImage' but required in type '{ file: File; preview: string; }'.
src/components/receipts/ReceiptScanner.tsx(110,17): error TS2322: Type '{ merchant?: string | undefined; total?: number | undefined; date?: string | undefined; tax?: number | undefined; subtotal?: number | undefined; processingTime?: number | undefined; items?: unknown[] | undefined; confidence: { ...; }; } | null | undefined' is not assignable to type 'ExtractedData | null | undefined'.
  Type '{ merchant?: string | undefined; total?: number | undefined; date?: string | undefined; tax?: number | undefined; subtotal?: number | undefined; processingTime?: number | undefined; items?: unknown[] | undefined; confidence: { ...; }; }' is not assignable to type 'ExtractedData'.
    Types of property 'items' are incompatible.
      Type 'unknown[] | undefined' is not assignable to type 'ReceiptItem[] | undefined'.
        Type 'unknown[]' is not assignable to type 'ReceiptItem[]'.
          Type 'unknown' is not assignable to type 'ReceiptItem'.
src/components/receipts/ReceiptScanner.tsx(134,17): error TS2322: Type 'ExtendedReceiptData' is not assignable to type 'ExtractedData'.
  Index signature for type 'string' is missing in type 'ExtendedReceiptData'.
src/components/receipts/components/ReceiptActionButtons.tsx(36,44): error TS2345: Argument of type 'ExtractedData' is not assignable to parameter of type 'ReceiptData'.
  Types of property 'total' are incompatible.
    Type 'string | null | undefined' is not assignable to type 'number | null | undefined'.
      Type 'string' is not assignable to type 'number'.
src/components/settings/TransactionArchiving.tsx(106,9): error TS2322: Type '{ totalCount: number; cutoffDate: Date; categories: Record<string, { count: number; amount: number; }>; envelopes: Record<string, { count: number; amount: number; }>; totalAmount: number; dateRange: { ...; }; } | null' is not assignable to type 'PreviewData | null'.
  Type '{ totalCount: number; cutoffDate: Date; categories: Record<string, { count: number; amount: number; }>; envelopes: Record<string, { count: number; amount: number; }>; totalAmount: number; dateRange: { ...; }; }' is not assignable to type 'PreviewData'.
    The types of 'dateRange.earliest' are incompatible between these types.
      Type 'Date | null' is not assignable to type 'string | undefined'.
        Type 'null' is not assignable to type 'string | undefined'.
src/components/transactions/TransactionLedger.tsx(188,7): error TS2322: Type 'unknown[]' is not assignable to type 'Record<string, unknown>[] | { data: Record<string, unknown>[]; }'.
  Type 'unknown[]' is not assignable to type 'Record<string, unknown>[]'.
    Type 'unknown' is not assignable to type 'Record<string, unknown>'.
src/hooks/analytics/useReportExporter.ts(46,9): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'AnalyticsData'.
src/hooks/bills/useBillOperations.ts(68,7): error TS2322: Type '(updatedBills: Bill[]) => Promise<BulkOperationResult>' is not assignable to type '(updatedBills: unknown[]) => Promise<{ success: boolean; successCount: number; errorCount: number; errors: string[]; message: string; }>'.
  Types of parameters 'updatedBills' and 'updatedBills' are incompatible.
    Type 'unknown[]' is not assignable to type 'Bill[]'.
      Type 'unknown' is not assignable to type 'Bill'.
src/hooks/budgeting/autofunding/useAutoFundingExecution.ts(66,5): error TS2345: Argument of type 'BudgetData & { transferFunds: ((from: string, to: string, amount: number, description?: string | undefined) => Promise<void>) | undefined; }' is not assignable to parameter of type 'Budget'.
  Types of property 'transferFunds' are incompatible.
    Type '((from: string, to: string, amount: number, description?: string | undefined) => Promise<void>) | undefined' is not assignable to type '(from: string, to: string, amount: number, description?: string | undefined) => Promise<void>'.
      Type 'undefined' is not assignable to type '(from: string, to: string, amount: number, description?: string | undefined) => Promise<void>'.
src/hooks/budgeting/usePaycheckFormValidated.ts(62,26): error TS2769: No overload matches this call.
  Overload 1 of 4, '(value: string | number | Date): Date', gave the following error.
    Argument of type 'Date | undefined' is not assignable to parameter of type 'string | number | Date'.
      Type 'undefined' is not assignable to type 'string | number | Date'.
  Overload 2 of 4, '(value: string | number): Date', gave the following error.
    Argument of type 'Date | undefined' is not assignable to parameter of type 'string | number'.
      Type 'undefined' is not assignable to type 'string | number'.
src/hooks/layout/usePaycheckOperations.ts(61,11): error TS2345: Argument of type '() => Promise<BudgetRecord | null>' is not assignable to parameter of type '() => Promise<{ actualBalance?: number | undefined; unassignedCash?: number | undefined; } | null>'.
  Type 'Promise<BudgetRecord | null>' is not assignable to type 'Promise<{ actualBalance?: number | undefined; unassignedCash?: number | undefined; } | null>'.
    Type 'BudgetRecord | null' is not assignable to type '{ actualBalance?: number | undefined; unassignedCash?: number | undefined; } | null'.
      Type 'BudgetRecord' has no properties in common with type '{ actualBalance?: number | undefined; unassignedCash?: number | undefined; }'.
src/hooks/notifications/useFirebaseMessaging.ts(98,7): error TS2322: Type 'TokenResult' is not assignable to type 'PermissionResult'.
  Types of property 'token' are incompatible.
    Type 'string | null | undefined' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/hooks/settings/useSettingsSectionRenderer.ts(117,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type 'SecurityManager | null' is not assignable to type 'SecurityManager'.
      Type 'null' is not assignable to type 'SecurityManager'.
src/hooks/transactions/useTransactionImport.ts(53,38): error TS2345: Argument of type 'unknown' is not assignable to parameter of type '{ userName?: string | undefined; } | undefined'.
src/services/firebaseMessaging.ts(175,36): error TS2345: Argument of type 'Messaging | null' is not assignable to parameter of type 'Messaging'.
  Type 'null' is not assignable to type 'Messaging'.
src/services/firebaseMessaging.ts(294,38): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/utils/bills/billUpdateHelpers.ts(106,71): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/bills/billUpdateHelpers.ts(107,5): error TS2722: Cannot invoke an object which is possibly 'undefined'.
src/utils/dataManagement/firebaseUtils.ts(15,74): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/dataManagement/firebaseUtils.ts(40,60): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'SyncConfig | null | undefined'.
src/utils/security/keyExport.ts(268,58): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/security/keyExport.ts(319,35): error TS7016: Could not find a declaration file for module 'qrcode'. '/home/runner/work/violet-vault/violet-vault/node_modules/qrcode/lib/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/qrcode` if it exists or add a new declaration (.d.ts) file containing `declare module 'qrcode';`
```

