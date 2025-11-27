# Combined Audit Report

## Summary

| Category                      | Current | Change |
| ----------------------------- | ------- | ------ |
| ESLint Issues                 | 0       | -7     |
| TypeScript Errors             | 17      | -4     |
| TypeScript Strict Mode Errors | 17      | -4     |

_Last updated: 2025-11-27 12:26:27 UTC_

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

✅ **All files passed ESLint validation!**

Last check: 2025-11-27 12:26:03 UTC

## Typecheck Audit

### Files with Most Type Errors

- 5 errors in `src/hooks/transactions/useTransactionMutations.ts`
- 4 errors in `src/hooks/bills/useBills/billMutations.ts`
- 2 errors in `src/hooks/debts/useDebts.ts`
- 2 errors in `src/hooks/debts/helpers/debtManagementHelpers.ts`
- 2 errors in `src/hooks/budgeting/mutations/useUpdateEnvelope.ts`
- 1 errors in `src/utils/sync/syncHealthChecker.ts`
- 1 errors in `src/utils/sync/syncFlowValidator.ts`

### Type Error Breakdown by Category

| Count | Error Code |
| ----- | ---------- |
| 4     | `TS7006`   |
| 4     | `TS2724`   |
| 4     | `TS2345`   |
| 3     | `TS2353`   |
| 1     | `TS2352`   |
| 1     | `TS2322`   |

### Detailed Type Error Report

```
src/hooks/bills/useBills/billMutations.ts(7,10): error TS2724: '"@/domain/schemas/bill"' has no exported member named 'validateBillPartialSafe'. Did you mean 'validateBillPartial'?
src/hooks/bills/useBills/billMutations.ts(83,32): error TS2345: Argument of type '{ id: string; name: string; dueDate: string | Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; lastModified: number; frequency?: "monthly" | "quarterly" | "annually" | undefined; envelopeId?: string | undefined; createdAt?: number | undefined; description?: string | undefined; paymentMe...' is not assignable to parameter of type 'Bill'.
  Types of property 'dueDate' are incompatible.
    Type 'string | Date' is not assignable to type 'Date'.
      Type 'string' is not assignable to type 'Date'.
src/hooks/bills/useBills/billMutations.ts(154,17): error TS7006: Parameter 'issue' implicitly has an 'any' type.
src/hooks/bills/useBills/billMutations.ts(313,39): error TS2345: Argument of type '{ id: string; date: string | Date; amount: number; envelopeId: string; category: string; type: "income" | "expense" | "transfer"; lastModified: number; createdAt?: number | undefined; ... 6 more ...; toEnvelopeId?: string | undefined; }' is not assignable to parameter of type 'Transaction'.
  Types of property 'date' are incompatible.
    Type 'string | Date' is not assignable to type 'Date'.
      Type 'string' is not assignable to type 'Date'.
src/hooks/budgeting/mutations/useUpdateEnvelope.ts(6,10): error TS2724: '"@/domain/schemas/envelope"' has no exported member named 'validateEnvelopePartialSafe'. Did you mean 'validateEnvelopePartial'?
src/hooks/budgeting/mutations/useUpdateEnvelope.ts(52,17): error TS7006: Parameter 'issue' implicitly has an 'any' type.
src/hooks/debts/helpers/debtManagementHelpers.ts(279,44): error TS2352: Conversion of type 'Debt' to type '{ billId: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Property 'billId' is missing in type 'Debt' but required in type '{ billId: string; }'.
src/hooks/debts/helpers/debtManagementHelpers.ts(339,7): error TS2353: Object literal may only specify known properties, and 'envelopeId' does not exist in type '{ amount: number; description: string; category: string; debtId: string; date: string; notes: string; }'.
src/hooks/debts/useDebts.ts(7,28): error TS2724: '"@/domain/schemas/debt"' has no exported member named 'validateDebtPartialSafe'. Did you mean 'validateDebtPartial'?
src/hooks/debts/useDebts.ts(88,62): error TS7006: Parameter 'issue' implicitly has an 'any' type.
src/hooks/transactions/useTransactionMutations.ts(10,3): error TS2724: '"@/domain/schemas/transaction"' has no exported member named 'validateTransactionPartialSafe'. Did you mean 'validateTransactionPartial'?
src/hooks/transactions/useTransactionMutations.ts(133,39): error TS2345: Argument of type '{ id: string; date: string | Date; amount: number; envelopeId: string; category: string; type: "income" | "expense" | "transfer"; lastModified: number; createdAt?: number | undefined; ... 6 more ...; toEnvelopeId?: string | undefined; }' is not assignable to parameter of type 'Transaction'.
  Types of property 'date' are incompatible.
    Type 'string | Date' is not assignable to type 'Date'.
      Type 'string' is not assignable to type 'Date'.
src/hooks/transactions/useTransactionMutations.ts(134,42): error TS2345: Argument of type '{ id: string; date: string | Date; amount: number; envelopeId: string; category: string; type: "income" | "expense" | "transfer"; lastModified: number; createdAt?: number | undefined; ... 6 more ...; toEnvelopeId?: string | undefined; }' is not assignable to parameter of type 'Transaction'.
  Types of property 'date' are incompatible.
    Type 'string | Date' is not assignable to type 'Date'.
      Type 'string' is not assignable to type 'Date'.
src/hooks/transactions/useTransactionMutations.ts(135,7): error TS2322: Type '{ id: string; date: string | Date; amount: number; envelopeId: string; category: string; type: "income" | "expense" | "transfer"; lastModified: number; createdAt?: number | undefined; ... 6 more ...; toEnvelopeId?: string | undefined; }' is not assignable to type 'Transaction'.
  Types of property 'date' are incompatible.
    Type 'string | Date' is not assignable to type 'Date'.
      Type 'string' is not assignable to type 'Date'.
src/hooks/transactions/useTransactionMutations.ts(229,17): error TS7006: Parameter 'issue' implicitly has an 'any' type.
src/utils/sync/syncFlowValidator.ts(34,5): error TS2353: Object literal may only specify known properties, and 'savingsGoals' does not exist in type 'DexieData'.
src/utils/sync/syncHealthChecker.ts(43,5): error TS2353: Object literal may only specify known properties, and 'savingsGoals' does not exist in type 'DexieData'.
```

## Typecheck Strict Mode Audit

### Files with Most Strict Mode Errors

- 5 errors in `src/hooks/transactions/useTransactionMutations.ts`
- 4 errors in `src/hooks/bills/useBills/billMutations.ts`
- 2 errors in `src/hooks/debts/useDebts.ts`
- 2 errors in `src/hooks/debts/helpers/debtManagementHelpers.ts`
- 2 errors in `src/hooks/budgeting/mutations/useUpdateEnvelope.ts`
- 1 errors in `src/utils/sync/syncHealthChecker.ts`
- 1 errors in `src/utils/sync/syncFlowValidator.ts`

### Strict Mode Error Breakdown

| Count | Error Code |
| ----- | ---------- |
| 4     | `TS7006`   |
| 4     | `TS2724`   |
| 4     | `TS2345`   |
| 3     | `TS2353`   |
| 1     | `TS2352`   |
| 1     | `TS2322`   |

### Detailed Strict Mode Report

```
src/hooks/bills/useBills/billMutations.ts(7,10): error TS2724: '"@/domain/schemas/bill"' has no exported member named 'validateBillPartialSafe'. Did you mean 'validateBillPartial'?
src/hooks/bills/useBills/billMutations.ts(83,32): error TS2345: Argument of type '{ id: string; name: string; dueDate: string | Date; amount: number; category: string; isPaid: boolean; isRecurring: boolean; lastModified: number; frequency?: "monthly" | "quarterly" | "annually" | undefined; envelopeId?: string | undefined; createdAt?: number | undefined; description?: string | undefined; paymentMe...' is not assignable to parameter of type 'Bill'.
  Types of property 'dueDate' are incompatible.
    Type 'string | Date' is not assignable to type 'Date'.
      Type 'string' is not assignable to type 'Date'.
src/hooks/bills/useBills/billMutations.ts(154,17): error TS7006: Parameter 'issue' implicitly has an 'any' type.
src/hooks/bills/useBills/billMutations.ts(313,39): error TS2345: Argument of type '{ id: string; date: string | Date; amount: number; envelopeId: string; category: string; type: "income" | "expense" | "transfer"; lastModified: number; createdAt?: number | undefined; ... 6 more ...; toEnvelopeId?: string | undefined; }' is not assignable to parameter of type 'Transaction'.
  Types of property 'date' are incompatible.
    Type 'string | Date' is not assignable to type 'Date'.
      Type 'string' is not assignable to type 'Date'.
src/hooks/budgeting/mutations/useUpdateEnvelope.ts(6,10): error TS2724: '"@/domain/schemas/envelope"' has no exported member named 'validateEnvelopePartialSafe'. Did you mean 'validateEnvelopePartial'?
src/hooks/budgeting/mutations/useUpdateEnvelope.ts(52,17): error TS7006: Parameter 'issue' implicitly has an 'any' type.
src/hooks/debts/helpers/debtManagementHelpers.ts(279,44): error TS2352: Conversion of type 'Debt' to type '{ billId: string; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Property 'billId' is missing in type 'Debt' but required in type '{ billId: string; }'.
src/hooks/debts/helpers/debtManagementHelpers.ts(339,7): error TS2353: Object literal may only specify known properties, and 'envelopeId' does not exist in type '{ amount: number; description: string; category: string; debtId: string; date: string; notes: string; }'.
src/hooks/debts/useDebts.ts(7,28): error TS2724: '"@/domain/schemas/debt"' has no exported member named 'validateDebtPartialSafe'. Did you mean 'validateDebtPartial'?
src/hooks/debts/useDebts.ts(88,62): error TS7006: Parameter 'issue' implicitly has an 'any' type.
src/hooks/transactions/useTransactionMutations.ts(10,3): error TS2724: '"@/domain/schemas/transaction"' has no exported member named 'validateTransactionPartialSafe'. Did you mean 'validateTransactionPartial'?
src/hooks/transactions/useTransactionMutations.ts(133,39): error TS2345: Argument of type '{ id: string; date: string | Date; amount: number; envelopeId: string; category: string; type: "income" | "expense" | "transfer"; lastModified: number; createdAt?: number | undefined; ... 6 more ...; toEnvelopeId?: string | undefined; }' is not assignable to parameter of type 'Transaction'.
  Types of property 'date' are incompatible.
    Type 'string | Date' is not assignable to type 'Date'.
      Type 'string' is not assignable to type 'Date'.
src/hooks/transactions/useTransactionMutations.ts(134,42): error TS2345: Argument of type '{ id: string; date: string | Date; amount: number; envelopeId: string; category: string; type: "income" | "expense" | "transfer"; lastModified: number; createdAt?: number | undefined; ... 6 more ...; toEnvelopeId?: string | undefined; }' is not assignable to parameter of type 'Transaction'.
  Types of property 'date' are incompatible.
    Type 'string | Date' is not assignable to type 'Date'.
      Type 'string' is not assignable to type 'Date'.
src/hooks/transactions/useTransactionMutations.ts(135,7): error TS2322: Type '{ id: string; date: string | Date; amount: number; envelopeId: string; category: string; type: "income" | "expense" | "transfer"; lastModified: number; createdAt?: number | undefined; ... 6 more ...; toEnvelopeId?: string | undefined; }' is not assignable to type 'Transaction'.
  Types of property 'date' are incompatible.
    Type 'string | Date' is not assignable to type 'Date'.
      Type 'string' is not assignable to type 'Date'.
src/hooks/transactions/useTransactionMutations.ts(229,17): error TS7006: Parameter 'issue' implicitly has an 'any' type.
src/utils/sync/syncFlowValidator.ts(34,5): error TS2353: Object literal may only specify known properties, and 'savingsGoals' does not exist in type 'DexieData'.
src/utils/sync/syncHealthChecker.ts(43,5): error TS2353: Object literal may only specify known properties, and 'savingsGoals' does not exist in type 'DexieData'.
```
