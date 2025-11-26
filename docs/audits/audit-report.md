# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 3 | +1 |
| TypeScript Errors | 7 | -5 |
| TypeScript Strict Mode Errors | 37 | -18 |

*Last updated: 2025-11-26 18:48:18 UTC*

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
- 2 issues in `violet-vault/src/hooks/bills/useBillDetail.ts`
- 1 issues in `violet-vault/src/hooks/budgeting/useSmartSuggestions.ts`
- 1 issues in `violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution.ts`
- 1 issues in `violet-vault/src/components/receipts/ReceiptScanner.tsx`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 2 | `react-hooks/exhaustive-deps` |
| 2 | `max-lines-per-function` |
| 1 | `complexity` |

### Detailed Lint Report
```
violet-vault/src/components/receipts/ReceiptScanner.tsx:67:79 - 1 - Arrow function has a complexity of 17. Maximum allowed is 15. (complexity)
violet-vault/src/hooks/bills/useBillDetail.ts:53:30 - 1 - Arrow function has too many lines (157). Maximum allowed is 150. (max-lines-per-function)
violet-vault/src/hooks/bills/useBillDetail.ts:82:6 - 1 - React Hook useMemo has a missing dependency: 'bill'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
violet-vault/src/hooks/budgeting/autofunding/useAutoFundingExecution.ts:52:9 - 1 - The 'budgetWithDefaults' logical expression could make the dependencies of useCallback Hook (at line 130) change on every render. To fix this, wrap the initialization of 'budgetWithDefaults' in its own useMemo() Hook. (react-hooks/exhaustive-deps)
violet-vault/src/hooks/budgeting/useSmartSuggestions.ts:104:29 - 1 - Arrow function has too many lines (151). Maximum allowed is 150. (max-lines-per-function)
```

## Typecheck Audit

### Files with Most Type Errors
- 3 errors in `src/hooks/analytics/useAnalyticsData.ts`
- 2 errors in `src/components/auth/AuthGateway.tsx`
- 1 errors in `src/hooks/common/usePrompt.ts`
- 1 errors in `src/components/transactions/TransactionLedger.tsx`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 6 | `TS2345` |
| 1 | `TS2322` |

### Detailed Type Error Report
```
src/components/auth/AuthGateway.tsx(26,28): error TS2345: Argument of type 'LocalOnlyUser' is not assignable to parameter of type 'import("violet-vault/src/types/auth").LocalOnlyUser'.
  Property 'userName' is optional in type 'LocalOnlyUser' but required in type 'LocalOnlyUser'.
src/components/auth/AuthGateway.tsx(79,30): error TS2345: Argument of type 'LocalOnlyUser' is not assignable to parameter of type 'import("violet-vault/src/types/auth").LocalOnlyUser'.
  Property 'userName' is optional in type 'LocalOnlyUser' but required in type 'LocalOnlyUser'.
src/components/transactions/TransactionLedger.tsx(188,7): error TS2322: Type 'unknown[]' is not assignable to type 'Record<string, unknown>[] | { data: Record<string, unknown>[]; }'.
  Type 'unknown[]' is not assignable to type 'Record<string, unknown>[]'.
    Type 'unknown' is not assignable to type 'Record<string, unknown>'.
      Index signature for type 'string' is missing in type '{}'.
src/hooks/analytics/useAnalyticsData.ts(61,59): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type '{}' is missing the following properties from type 'Envelope': id, name
src/hooks/analytics/useAnalyticsData.ts(78,64): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Property 'name' is missing in type '{}' but required in type 'Envelope'.
src/hooks/analytics/useAnalyticsData.ts(82,57): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Property 'name' is missing in type '{}' but required in type 'Envelope'.
src/hooks/common/usePrompt.ts(117,20): error TS2345: Argument of type 'string | void' is not assignable to parameter of type 'string'.
  Type 'void' is not assignable to type 'string'.
```

## Typecheck Strict Mode Audit

### Files with Most Strict Mode Errors
- 4 errors in `src/hooks/analytics/useAnalyticsData.ts`
- 2 errors in `src/utils/security/keyExport.ts`
- 2 errors in `src/utils/dataManagement/firebaseUtils.ts`
- 2 errors in `src/utils/bills/billUpdateHelpers.ts`
- 2 errors in `src/services/firebaseMessaging.ts`
- 2 errors in `src/hooks/common/useEditLock.ts`
- 2 errors in `src/components/debt/DebtDashboard.tsx`
- 1 errors in `src/hooks/analytics/useReportExporter.ts`
- 1 errors in `src/components/transactions/TransactionLedger.tsx`
- 1 errors in `src/components/history/BudgetHistoryViewer.tsx`
- 1 errors in `src/components/charts/CategoryBarChart.tsx`
- 1 errors in `src/components/budgeting/suggestions/SuggestionsList.tsx`
- 1 errors in `src/components/budgeting/SmartEnvelopeSuggestions.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeModalHeader.tsx`
- 1 errors in `src/components/budgeting/envelope/EnvelopeGridView.tsx`
- 1 errors in `src/components/budgeting/CreateEnvelopeModalComponents.tsx`
- 1 errors in `src/components/bills/modals/BulkUpdateConfirmModal.tsx`
- 1 errors in `src/components/bills/modals/BillDetailModal.tsx`
- 1 errors in `src/components/bills/BulkUpdateEditor.tsx`
- 1 errors in `src/components/bills/BillManagerModals.tsx`
- 1 errors in `src/components/bills/BillFormSections.tsx`
- 1 errors in `src/components/automation/AutoFundingView.tsx`
- 1 errors in `src/components/automation/AutoFundingRuleBuilder.tsx`
- 1 errors in `src/components/auth/UserSetup.tsx`
- 1 errors in `src/components/auth/KeyManagementSettings.tsx`
- 1 errors in `src/components/auth/key-management/MainContent.tsx`
- 1 errors in `src/components/analytics/CategorySuggestionsTab.tsx`
- 1 errors in `src/components/accounts/SupplementalAccounts.tsx`

### Strict Mode Error Breakdown
| Count | Error Code |
|---|---|
| 17 | `TS2322` |
| 16 | `TS2345` |
| 2 | `TS2769` |
| 1 | `TS7016` |
| 1 | `TS2722` |

### Detailed Strict Mode Report
```
src/components/accounts/SupplementalAccounts.tsx(157,11): error TS2322: Type '(accountId: string) => Promise<void>' is not assignable to type '(accountId: string | number) => void'.
  Types of parameters 'accountId' and 'accountId' are incompatible.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.
src/components/analytics/CategorySuggestionsTab.tsx(93,32): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/auth/key-management/MainContent.tsx(116,9): error TS2322: Type 'string | null' is not assignable to type 'string'.
  Type 'null' is not assignable to type 'string'.
src/components/auth/KeyManagementSettings.tsx(166,11): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/components/auth/UserSetup.tsx(159,13): error TS2322: Type '(e: FormEvent) => Promise<void>' is not assignable to type '(e?: FormEvent<Element> | undefined) => void | Promise<void>'.
  Types of parameters 'e' and 'e' are incompatible.
    Type 'FormEvent<Element> | undefined' is not assignable to type 'FormEvent<Element>'.
      Type 'undefined' is not assignable to type 'FormEvent<Element>'.
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
src/components/bills/BillFormSections.tsx(266,17): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Object literal may only specify known properties, and 'className' does not exist in type 'Attributes'.
src/components/bills/BillManagerModals.tsx(115,11): error TS2322: Type '(billId: string, deleteEnvelope?: boolean | undefined) => Promise<void>' is not assignable to type '(id: unknown, deleteEnvelope?: boolean | undefined) => void | Promise<void>'.
  Types of parameters 'billId' and 'id' are incompatible.
    Type 'unknown' is not assignable to type 'string'.
src/components/bills/BulkUpdateEditor.tsx(106,15): error TS2322: Type '(billId: string, field: BillField, value: string | number) => void' is not assignable to type '(billId: string, field: string, value: string | number) => void'.
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
src/components/budgeting/envelope/EnvelopeGridView.tsx(112,30): error TS2345: Argument of type '(envelope: { id: string; [key: string]: unknown; }) => JSX.Element' is not assignable to parameter of type '(value: unknown, index: number, array: unknown[]) => Element'.
  Types of parameters 'envelope' and 'value' are incompatible.
    Type 'unknown' is not assignable to type '{ [key: string]: unknown; id: string; }'.
src/components/budgeting/envelope/EnvelopeModalHeader.tsx(70,31): error TS2322: Type '(() => void) | undefined' is not assignable to type '() => void'.
  Type 'undefined' is not assignable to type '() => void'.
src/components/budgeting/SmartEnvelopeSuggestions.tsx(230,5): error TS2322: Type '(envelope: Partial<Envelope>) => void' is not assignable to type '(data: unknown) => void | Promise<void>'.
  Types of parameters 'envelope' and 'data' are incompatible.
    Type 'unknown' is not assignable to type 'Partial<Envelope>'.
src/components/budgeting/suggestions/SuggestionsList.tsx(128,19): error TS2322: Type '(suggestion: import("violet-vault/src/components/budgeting/suggestions/SuggestionsList").Suggestion) => void' is not assignable to type '(suggestion: Suggestion) => void'.
  Types of parameters 'suggestion' and 'suggestion' are incompatible.
    Type 'Suggestion' is not assignable to type 'import("violet-vault/src/components/budgeting/suggestions/SuggestionsList").Suggestion'.
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
src/components/debt/DebtDashboard.tsx(94,15): error TS2322: Type '(debt: DebtAccount) => void' is not assignable to type '(debt: DebtAccount | Debt) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/debt/DebtDashboard.tsx(95,15): error TS2322: Type '(debt: DebtAccount, amount: number) => void' is not assignable to type '(debt: DebtAccount | Debt, amount: number) => void'.
  Types of parameters 'debt' and 'debt' are incompatible.
    Type 'DebtAccount | Debt' is not assignable to type 'DebtAccount'.
      Type 'Debt' is missing the following properties from type 'DebtAccount': balance, interestRate, minimumPayment, status, and 2 more.
src/components/history/BudgetHistoryViewer.tsx(153,15): error TS2322: Type '{ commit?: BudgetCommit | undefined; changes: BudgetChange[]; } | null' is not assignable to type 'CommitDetails | null'.
  Type '{ commit?: BudgetCommit | undefined; changes: BudgetChange[]; }' is not assignable to type 'CommitDetails'.
    Types of property 'commit' are incompatible.
      Type 'BudgetCommit | undefined' is not assignable to type 'Commit | undefined'.
        Type 'BudgetCommit' is not assignable to type 'Commit'.
          Types of property 'parentHash' are incompatible.
            Type 'string | null | undefined' is not assignable to type 'string | undefined'.
              Type 'null' is not assignable to type 'string | undefined'.
src/components/transactions/TransactionLedger.tsx(188,7): error TS2322: Type 'unknown[]' is not assignable to type 'Record<string, unknown>[] | { data: Record<string, unknown>[]; }'.
  Type 'unknown[]' is not assignable to type 'Record<string, unknown>[]'.
    Type 'unknown' is not assignable to type 'Record<string, unknown>'.
src/hooks/analytics/useAnalyticsData.ts(49,36): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Transaction[]'.
  Type 'unknown' is not assignable to type 'Transaction'.
src/hooks/analytics/useAnalyticsData.ts(61,59): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type 'unknown' is not assignable to type 'Envelope'.
src/hooks/analytics/useAnalyticsData.ts(78,64): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type 'unknown' is not assignable to type 'Envelope'.
src/hooks/analytics/useAnalyticsData.ts(82,57): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'Envelope[]'.
  Type 'unknown' is not assignable to type 'Envelope'.
src/hooks/analytics/useReportExporter.ts(46,9): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'AnalyticsData'.
src/hooks/common/useEditLock.ts(120,37): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/hooks/common/useEditLock.ts(162,54): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/services/firebaseMessaging.ts(175,36): error TS2345: Argument of type 'Messaging | null' is not assignable to parameter of type 'Messaging'.
  Type 'null' is not assignable to type 'Messaging'.
src/services/firebaseMessaging.ts(294,38): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/utils/bills/billUpdateHelpers.ts(106,71): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/bills/billUpdateHelpers.ts(107,5): error TS2722: Cannot invoke an object which is possibly 'undefined'.
src/utils/dataManagement/firebaseUtils.ts(15,74): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/dataManagement/firebaseUtils.ts(40,60): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'SyncConfig | null | undefined'.
src/utils/security/keyExport.ts(268,58): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.
src/utils/security/keyExport.ts(319,35): error TS7016: Could not find a declaration file for module 'qrcode'. 'violet-vault/node_modules/qrcode/lib/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/qrcode` if it exists or add a new declaration (.d.ts) file containing `declare module 'qrcode';`
```

