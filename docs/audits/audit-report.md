# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 20 | 0 |
| TypeScript Errors | 19 | 0 |
| TypeScript Strict Mode Errors | 19 | 0 |

*Last updated: 2025-11-10 19:38:57 UTC*

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
- 11 issues in `violet-vault/src/components/analytics/SmartCategoryManager.tsx`
- 3 issues in `violet-vault/src/components/analytics/ReportExporter.tsx`
- 2 issues in `violet-vault/src/components/ui/ModalCloseButton.tsx`
- 1 issues in `violet-vault/src/stores/ui/uiStore.ts`
- 1 issues in `violet-vault/src/hooks/transactions/useTransactionTable.ts`
- 1 issues in `violet-vault/src/components/ui/StandardFilters.tsx`
- 1 issues in `violet-vault/src/components/security/LockScreen.tsx`

### Issue Count by Category
| Count | Rule ID |
|---|---|
| 13 | `@typescript-eslint/no-unused-vars` |
| 2 | `null` |
| 2 | `no-console` |
| 1 | `no-redeclare` |
| 1 | `enforce-ui-library/enforce-ui-library` |
| 1 | `@typescript-eslint/no-explicit-any` |

### Detailed Lint Report
```
violet-vault/src/components/analytics/ReportExporter.tsx:1:17 - 1 - 'useState' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/analytics/ReportExporter.tsx:3:8 - 1 - 'logger' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/analytics/ReportExporter.tsx:13:11 - 1 - 'ExportOptions' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/analytics/SmartCategoryManager.tsx:11:8 - 1 - 'logger' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/analytics/SmartCategoryManager.tsx:36:3 - 1 - 'onAddCategory' is defined but never used. Allowed unused args must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/analytics/SmartCategoryManager.tsx:37:3 - 1 - 'onRemoveCategory' is defined but never used. Allowed unused args must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/analytics/SmartCategoryManager.tsx:38:3 - 1 - 'onApplyToTransactions' is defined but never used. Allowed unused args must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/analytics/SmartCategoryManager.tsx:39:3 - 1 - 'onApplyToBills' is defined but never used. Allowed unused args must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/analytics/SmartCategoryManager.tsx:55:5 - 1 - 'applySuggestion' is assigned a value but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/analytics/SmartCategoryManager.tsx:83:40 - 1 - 'suggestion' is defined but never used. Allowed unused args must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/analytics/SmartCategoryManager.tsx:88:7 - 2 - Unexpected console statement. (no-console)
violet-vault/src/components/analytics/SmartCategoryManager.tsx:93:9 - 2 - 'handleUndismissSuggestion' is already defined. (no-redeclare)
violet-vault/src/components/analytics/SmartCategoryManager.tsx:93:44 - 1 - 'suggestionId' is defined but never used. Allowed unused args must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/analytics/SmartCategoryManager.tsx:98:7 - 2 - Unexpected console statement. (no-console)
violet-vault/src/components/security/LockScreen.tsx:102:11 - 1 - Use <Button> from @/components/ui instead of <button> element. Import: import { Button } from "@/components/ui" (enforce-ui-library/enforce-ui-library)
violet-vault/src/components/ui/ModalCloseButton.tsx:2:10 - 1 - 'getIcon' is defined but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/ui/ModalCloseButton.tsx:20:7 - 1 - 'ICON_STYLES' is assigned a value but never used. Allowed unused vars must match /^_/u. (@typescript-eslint/no-unused-vars)
violet-vault/src/components/ui/StandardFilters.tsx:347:53 - 2 - Parsing error: Identifier expected. (null)
violet-vault/src/hooks/transactions/useTransactionTable.ts:56:3 - 2 - Parsing error: ';' expected. (null)
violet-vault/src/stores/ui/uiStore.ts:283:20 - 1 - Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)
```

## Typecheck Audit

### Files with Most Type Errors
- 17 errors in `src/components/ui/StandardFilters.tsx`
- 2 errors in `src/hooks/transactions/useTransactionTable.ts`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 14 | `TS1005` |
| 1 | `TS1434` |
| 1 | `TS1160` |
| 1 | `TS1109` |
| 1 | `TS1003` |
| 1 | `TS1002` |

### Detailed Type Error Report
```
src/components/ui/StandardFilters.tsx(347,54): error TS1003: Identifier expected.
src/components/ui/StandardFilters.tsx(347,59): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(347,60): error TS1002: Unterminated string literal.
src/components/ui/StandardFilters.tsx(348,6): error TS1005: ',' expected.
src/components/ui/StandardFilters.tsx(353,23): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(353,27): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(353,31): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(356,23): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(356,31): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(356,43): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(387,29): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(387,33): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(387,41): error TS1434: Unexpected keyword or identifier.
src/components/ui/StandardFilters.tsx(389,37): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(389,50): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(389,70): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(403,1): error TS1160: Unterminated template literal.
src/hooks/transactions/useTransactionTable.ts(56,4): error TS1005: ';' expected.
src/hooks/transactions/useTransactionTable.ts(66,3): error TS1109: Expression expected.
```

## Typecheck Strict Mode Audit

### Files with Most Strict Mode Errors
- 17 errors in `src/components/ui/StandardFilters.tsx`
- 2 errors in `src/hooks/transactions/useTransactionTable.ts`

### Strict Mode Error Breakdown
| Count | Error Code |
|---|---|
| 14 | `TS1005` |
| 1 | `TS1434` |
| 1 | `TS1160` |
| 1 | `TS1109` |
| 1 | `TS1003` |
| 1 | `TS1002` |

### Detailed Strict Mode Report
```
src/components/ui/StandardFilters.tsx(347,54): error TS1003: Identifier expected.
src/components/ui/StandardFilters.tsx(347,59): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(347,60): error TS1002: Unterminated string literal.
src/components/ui/StandardFilters.tsx(348,6): error TS1005: ',' expected.
src/components/ui/StandardFilters.tsx(353,23): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(353,27): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(353,31): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(356,23): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(356,31): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(356,43): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(387,29): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(387,33): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(387,41): error TS1434: Unexpected keyword or identifier.
src/components/ui/StandardFilters.tsx(389,37): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(389,50): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(389,70): error TS1005: ';' expected.
src/components/ui/StandardFilters.tsx(403,1): error TS1160: Unterminated template literal.
src/hooks/transactions/useTransactionTable.ts(56,4): error TS1005: ';' expected.
src/hooks/transactions/useTransactionTable.ts(66,3): error TS1109: Expression expected.
```

