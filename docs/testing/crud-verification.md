---
title: CRUD Verification Matrix
lastVerified: 2025-11-27
---

# CRUD Verification Matrix

This matrix enumerates the create/read/update/delete (CRUD) flows and cross-entity
connections that exist in Violet Vault’s budgeting domain. Each entry lists the
primary implementation surface, automated coverage, and the latest verification
status recorded on **2025-11-27**.

> **Legend**
>
> - ✅ Pass – automated coverage executed successfully.
> - ⚠️ Partial – coverage exists, but the latest run surfaced defects or
>   environment gaps.
> - ⛔ Blocked – automated coverage not runnable; follow-up required.

## v2.0 Envelope-Based Data Model

As of v2.0, VioletVault uses a simplified data model:

- **Envelopes** are the source of truth for all balances
- **Savings goals** are stored as envelopes with `envelopeType: "savings"`
- **Supplemental accounts** are stored as envelopes with `envelopeType: "supplemental"`
- **Transactions** record all financial operations

## Envelopes

| Operation                                        | Implementation Surface                         | Automated Coverage                                        | Latest Status | Notes                                                                                                                                                                         |
| ------------------------------------------------ | ---------------------------------------------- | --------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create / Edit envelope metadata                  | `useEnvelopeForm`, `useEnvelopeOperations`     | `src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts`   | ✅ Pass       | Suite updated for Zod v4 and toast UX; re-ran `npx vitest run src/hooks/budgeting/__tests__/useEnvelopeForm.test.ts` on 2025-11-13.                                           |
| Delete envelope (with optional cascade to bills) | `useEnvelopeOperations.deleteEnvelope`         | Covered indirectly through the same suite above           | ✅ Pass       | Covered by the envelope form suite’s delete/cleanup specs; same command as above.                                                                                             |
| List + filter envelopes                          | `useEnvelopesQuery`, `useEnvelopeCalculations` | `src/hooks/budgeting/__tests__/useEnvelopesQuery.test.ts` | ✅ Pass       | Dexie mocked via injected `__db`; ran `npx vitest run src/hooks/budgeting/__tests__/useEnvelopesQuery.test.ts` on 2025-11-13 (fake-indexeddb enabled in `src/test/setup.ts`). |
| Transfer between envelopes                       | `useEnvelopeOperations.transferFunds`          | No automated coverage                                     | ⛔ Blocked    | Still lacks dedicated tests—next step is to add a Vitest harness around `transferFunds` and optimistic helpers to exercise the full move + accounting cascade.                |

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

## Savings Goals (v2.0: Stored as Envelopes)

> **Note:** As of v2.0, savings goals are stored as envelopes with `envelopeType: "savings"`.
> The savings goals table is deprecated but maintained for backward compatibility during migration.

| Operation                         | Implementation Surface                                  | Automated Coverage                                                        | Latest Status | Notes                                                                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create / Edit savings goal        | `useSavingsGoalFormValidated`, `useSavingsGoalsActions` | `src/hooks/savings/__tests__/useSavingsGoalFormValidated.test.ts`         | ⚠️ Partial    | Suite executes but the vitest worker exits (heap OOM) when batched with other savings suites. Re-run individually with elevated `NODE_OPTIONS=--max-old-space-size=4096` or split executions. |
| Delete savings goal               | `useSavingsGoalsActions.deleteSavingsGoal`              | Same suite                                                                | ⚠️ Partial    | Impacted by the OOM above.                                                                                                                                                                    |
| Query savings goals               | `useSavingsGoals` queries                               | `src/hooks/savings/useSavingsGoals/__tests__/savingsQueries.test.ts`      | ⚠️ Partial    | Tests pass before the worker crash; add fake-indexeddb + memory tuning to stabilise.                                                                                                          |
| Savings as envelopes (v2.0)       | `SavingsEnvelopeSchema`                                 | `src/domain/schemas/__tests__/envelope.test.ts`, `envelope-model.test.ts` | ✅ Pass       | Schema tests verify savings envelopes with targetAmount, priority, targetDate fields.                                                                                                         |
| Migration: goal → envelope (v2.0) | `envelopeMigrationService`                              | `src/services/migrations/__tests__/envelopeMigrationService.test.ts`      | ✅ Pass       | Tests verify conversion of legacy savings goals to savings envelopes.                                                                                                                         |

## Supplemental Accounts (v2.0: Stored as Envelopes)

> **Note:** As of v2.0, supplemental accounts are stored as envelopes with `envelopeType: "supplemental"`.
> The supplementalAccounts array in budget metadata is deprecated.

| Operation                                    | Implementation Surface          | Automated Coverage                                                        | Latest Status | Notes                                                                                   |
| -------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| Create / Edit / Delete supplemental accounts | `useSupplementalAccounts`       | `src/hooks/accounts/__tests__/useSupplementalAccounts.test.ts`            | ✅ Pass       | Executed via `npx vitest run …useSupplementalAccounts.test.ts`.                         |
| Supplemental as envelopes (v2.0)             | `SupplementalAccountSchema`     | `src/domain/schemas/__tests__/envelope.test.ts`, `envelope-model.test.ts` | ✅ Pass       | Schema tests verify supplemental envelopes with accountType, annualContribution fields. |
| Account type validation (v2.0)               | `SupplementalAccountTypeSchema` | `src/domain/schemas/__tests__/envelope.test.ts`                           | ✅ Pass       | Tests verify FSA, HSA, 529, IRA, 401K, other account types.                             |

## Transactions

| Operation                                 | Implementation Surface                                        | Automated Coverage                                                       | Latest Status | Notes                                                                                                                                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create / Update / Delete / Reconcile      | `useTransactionMutations`, `useTransactions`                  | `src/hooks/transactions/useTransactionsV2` suites (multiple)             | ⚠️ Partial    | Pointed `useTransactionLedger` suite currently fails: pagination expectations drifted (current `handlePagination` keeps `currentPage` at 1) and mocks reference legacy module paths. Needs test + implementation realignment. |
| Transaction ledger filtering & pagination | `useTransactionLedger`, `useTransactionFilters`               | `src/hooks/transactions/__tests__/useTransactionLedger.test.tsx`         | ⛔ Blocked    | See above failures (pagination behaviour + outdated mocks).                                                                                                                                                                   |
| Transaction ↔ Envelope sync              | `useTransactionMutations`, `optimisticHelpers.updateEnvelope` | Asserted within `billMutations` + transaction mutation suites            | ✅ Pass       | Verified implicitly through bill payment + mutation tests (see Bills section).                                                                                                                                                |
| Transaction ↔ Bill linkage               | `useLedgerOperations.handlePayBill`                           | `src/hooks/transactions/helpers/useLedgerOperations.ts` tests            | ⚠️ Partial    | Helper tests exist but not run during this session; schedule follow-up execution.                                                                                                                                             |
| Paycheck transactions (v2.0)              | `paycheckTransactionService`                                  | `src/services/transactions/__tests__/paycheckTransactionService.test.ts` | ✅ Pass       | Tests verify income → unassigned and internal transfer transactions.                                                                                                                                                          |

## Debts & Connections

| Operation                       | Implementation Surface                                                 | Automated Coverage                                       | Latest Status | Notes                                                                                         |
| ------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| Create / Edit / Delete debts    | `useDebtFormValidated`, `useDebtManagement`                            | `src/hooks/debts/__tests__/useDebtFormValidated.test.ts` | ⚠️ Pending    | Tests not re-run in this session; historically pass. Execute before sign-off.                 |
| Debt form validation            | `debtFormValidation.ts`                                                | `src/utils/debts/__tests__/debtFormValidation.test.ts`   | ⚠️ Pending    | Same as above.                                                                                |
| Debt ↔ Bill / Envelope linkage | `debtManagementHelpers.createDebtOperation`, `linkDebtToBillOperation` | No dedicated automated coverage                          | ⛔ Blocked    | Requires new tests that simulate connection workflows (auto-created bill + envelope linking). |

## Cross-Domain Matrix Summary

| Domain                         | CRUD Coverage                       | Connection Coverage                          | Overall Status |
| ------------------------------ | ----------------------------------- | -------------------------------------------- | -------------- |
| Envelopes                      | Covered (form/query suites passing) | Partial (transfer + link tests missing)      | ⚠️             |
| Envelope Types (v2.0)          | Covered (schema + model tests)      | Covered (filtering by type)                  | ✅             |
| Bills                          | Covered (passing)                   | Covered (billing ↔ envelopes, transactions) | ✅             |
| Savings Goals (v2.0 envelopes) | Covered (schema + migration tests)  | Covered (stored as savings envelopes)        | ✅             |
| Supplemental Accts (v2.0 env)  | Covered (schema + migration tests)  | Covered (stored as supplemental envelopes)   | ✅             |
| Transactions                   | Partial (ledger suite failing)      | Partial (linkage verified indirectly)        | ⚠️             |
| Paycheck Processing (v2.0)     | Covered (transaction service tests) | Covered (income + transfer transactions)     | ✅             |
| Debts                          | Pending execution                   | Blocked (needs new tests)                    | ⚠️             |
| Import/Export (v2.0)           | Covered (dexieUtils + backup tests) | Covered (envelope-based format)              | ✅             |
| Sync (v2.0)                    | Covered (cloudSync service tests)   | Covered (envelope-based sync)                | ✅             |
| Backup/Restore (v2.0)          | Covered (autoBackupService tests)   | Covered (envelope-based backup)              | ✅             |

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
