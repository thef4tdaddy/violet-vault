---
title: CRUD Verification Matrix
lastVerified: 2025-11-12
---

# CRUD Verification Matrix

This matrix enumerates the create/read/update/delete (CRUD) flows and cross-entity
connections that exist in Violet Vault’s budgeting domain. Each entry lists the
primary implementation surface, automated coverage, and the latest verification
status recorded on **2025-11-12**.

> **Legend**
>
> - ✅ Pass – automated coverage executed successfully.
> - ⚠️ Partial – coverage exists, but the latest run surfaced defects or
>   environment gaps.
> - ⛔ Blocked – automated coverage not runnable; follow-up required.

## Envelopes

| Operation                                        | Implementation Surface                         | Automated Coverage                                        | Latest Status | Notes                                                                                                                                                                                                            |
| ------------------------------------------------ | ---------------------------------------------- | --------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create / Edit envelope metadata                  | `useEnvelopeForm`, `useEnvelopeOperations`     | `src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts`   | ⛔ Blocked    | Test harness now fails because `convertZodErrors` expects `error.errors` (Zod v4 supplies `issues`) and `handleClose` behaviour diverged from historic confirm-dialog flow. Needs schema adapter + spec refresh. |
| Delete envelope (with optional cascade to bills) | `useEnvelopeOperations.deleteEnvelope`         | Covered indirectly through the same suite above           | ⛔ Blocked    | Same reason as create/edit.                                                                                                                                                                                      |
| List + filter envelopes                          | `useEnvelopesQuery`, `useEnvelopeCalculations` | `src/hooks/budgeting/__tests__/useEnvelopesQuery.test.ts` | ⛔ Blocked    | Suite stubs Dexie via Firebase mocks; current run fails because IndexedDB APIs are unavailable in Vitest node env. Requires fake-indexeddb wiring (see `IDBRequest is not defined` errors).                      |
| Transfer between envelopes                       | `useEnvelopeOperations.transferFunds`          | No automated coverage                                     | ⛔ Blocked    | Manual verification required; create targeted unit tests.                                                                                                                                                        |

**Action items**

- Update `convertZodErrors` to respect `error.issues` and realign tests with the
  toast-based unsaved-change UX.
- Inject `fake-indexeddb/auto` in envelope query tests so Dexie + Firebase mocks
  pass under Vitest.
- Add dedicated tests for `transferFunds` workflow.

## Bills

| Operation                       | Implementation Surface                                   | Automated Coverage                                         | Latest Status        | Notes                                                                                          |
| ------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------- |
| Create / Update / Delete bills  | `useBills` mutations, `billMutations.ts`, `AddBillModal` | `src/hooks/bills/useBills/__tests__/billMutations.test.ts` | ✅ Pass              | Ran `npx vitest run …billMutations.test.ts`. IndexedDB warnings only.                          |
| Fetch + filter bills            | `useBills` queries                                       | `src/hooks/bills/useBills/__tests__/billQueries.test.ts`   | ✅ Pass              | Same run; all assertions green.                                                                |
| Bulk update / smart suggestions | `useBulkBillUpdate`, `useBillManager` helpers            | `src/hooks/bills/__tests__/useBulkBillUpdate.test.tsx`     | ✅ Pass (not re-run) | Existing coverage validated in prior regression suite; optional to rerun if behaviour changes. |
| Bill ↔ Envelope linkage        | `useBillOperations`, `useBillPayment`                    | Covered by mutations and payment tests                     | ✅ Pass              | Payment mutation suite asserts envelope balance deduction.                                     |

## Savings Goals

| Operation                  | Implementation Surface                                  | Automated Coverage                                                   | Latest Status | Notes                                                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create / Edit savings goal | `useSavingsGoalFormValidated`, `useSavingsGoalsActions` | `src/hooks/savings/__tests__/useSavingsGoalFormValidated.test.ts`    | ⚠️ Partial    | Suite executes but the vitest worker exits (heap OOM) when batched with other savings suites. Re-run individually with elevated `NODE_OPTIONS=--max-old-space-size=4096` or split executions. |
| Delete savings goal        | `useSavingsGoalsActions.deleteSavingsGoal`              | Same suite                                                           | ⚠️ Partial    | Impacted by the OOM above.                                                                                                                                                                    |
| Query savings goals        | `useSavingsGoals` queries                               | `src/hooks/savings/useSavingsGoals/__tests__/savingsQueries.test.ts` | ⚠️ Partial    | Tests pass before the worker crash; add fake-indexeddb + memory tuning to stabilise.                                                                                                          |

## Supplemental Accounts

| Operation                                    | Implementation Surface    | Automated Coverage                                             | Latest Status | Notes                                                           |
| -------------------------------------------- | ------------------------- | -------------------------------------------------------------- | ------------- | --------------------------------------------------------------- |
| Create / Edit / Delete supplemental accounts | `useSupplementalAccounts` | `src/hooks/accounts/__tests__/useSupplementalAccounts.test.ts` | ✅ Pass       | Executed via `npx vitest run …useSupplementalAccounts.test.ts`. |

## Transactions

| Operation                                 | Implementation Surface                                        | Automated Coverage                                               | Latest Status | Notes                                                                                                                                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create / Update / Delete / Reconcile      | `useTransactionMutations`, `useTransactions`                  | `src/hooks/transactions/useTransactionsV2` suites (multiple)     | ⚠️ Partial    | Pointed `useTransactionLedger` suite currently fails: pagination expectations drifted (current `handlePagination` keeps `currentPage` at 1) and mocks reference legacy module paths. Needs test + implementation realignment. |
| Transaction ledger filtering & pagination | `useTransactionLedger`, `useTransactionFilters`               | `src/hooks/transactions/__tests__/useTransactionLedger.test.tsx` | ⛔ Blocked    | See above failures (pagination behaviour + outdated mocks).                                                                                                                                                                   |
| Transaction ↔ Envelope sync              | `useTransactionMutations`, `optimisticHelpers.updateEnvelope` | Asserted within `billMutations` + transaction mutation suites    | ✅ Pass       | Verified implicitly through bill payment + mutation tests (see Bills section).                                                                                                                                                |
| Transaction ↔ Bill linkage               | `useLedgerOperations.handlePayBill`                           | `src/hooks/transactions/helpers/useLedgerOperations.ts` tests    | ⚠️ Partial    | Helper tests exist but not run during this session; schedule follow-up execution.                                                                                                                                             |

## Debts & Connections

| Operation                       | Implementation Surface                                                 | Automated Coverage                                       | Latest Status | Notes                                                                                         |
| ------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| Create / Edit / Delete debts    | `useDebtFormValidated`, `useDebtManagement`                            | `src/hooks/debts/__tests__/useDebtFormValidated.test.ts` | ⚠️ Pending    | Tests not re-run in this session; historically pass. Execute before sign-off.                 |
| Debt form validation            | `debtFormValidation.ts`                                                | `src/utils/debts/__tests__/debtFormValidation.test.ts`   | ⚠️ Pending    | Same as above.                                                                                |
| Debt ↔ Bill / Envelope linkage | `debtManagementHelpers.createDebtOperation`, `linkDebtToBillOperation` | No dedicated automated coverage                          | ⛔ Blocked    | Requires new tests that simulate connection workflows (auto-created bill + envelope linking). |

## Cross-Domain Matrix Summary

| Domain                | CRUD Coverage                        | Connection Coverage                          | Overall Status |
| --------------------- | ------------------------------------ | -------------------------------------------- | -------------- |
| Envelopes             | Blocked (tests failing)              | Partial (transfer + link tests missing)      | ⛔             |
| Bills                 | Covered (passing)                    | Covered (billing ↔ envelopes, transactions) | ✅             |
| Savings Goals         | Covered but unstable (memory issues) | N/A                                          | ⚠️             |
| Supplemental Accounts | Covered (passing)                    | N/A                                          | ✅             |
| Transactions          | Partial (ledger suite failing)       | Partial (linkage verified indirectly)        | ⚠️             |
| Debts                 | Pending execution                    | Blocked (needs new tests)                    | ⚠️             |

## Next Steps

1. **Stabilise core test harness**
   - Patch `convertZodErrors` to read `error.issues`.
   - Ensure Vitest loads `fake-indexeddb/auto` before running hooks that hit Dexie.
   - Fix transaction ledger pagination spec to match current behaviour (or adjust implementation).

2. **Extend coverage for missing operations**
   - Add targeted tests for envelope transfers, debt↔bill/envelope linking, and transaction
     linkage cascades.
   - Split high-memory savings goal suites or run with higher heap size.

3. **Re-run verification**
   - After stabilising, re-run the grouped commands captured in this document and update the
     `lastVerified` timestamp.

4. **Manual smoke checklist**
   - Until automated coverage is green, schedule manual UI walkthrough covering:
     - Envelope add/edit/delete with category filters.
     - Bill creation tied to envelopes, payment marking, and ledger reconciliation.
     - Savings goal creation and progress adjustments.
     - Debt creation with auto-bill+envelope linkage and subsequent transaction posting.
     - Transaction ledger combining splits, envelope reassignment, and deletion cascades.

By tracking the scenarios and current verification status here we can systematically
drive the remaining failures and gaps to resolution before sign-off.
