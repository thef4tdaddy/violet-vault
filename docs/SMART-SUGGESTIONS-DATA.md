# Smart Suggestions Data & Test Coverage

This note inventories how the "smart" categorisation pipeline works, which datasets it touches, and what we still need in fixtures to validate the experience end‑to‑end (UI + automated tests).

## Pipeline Overview

- `useSmartSuggestions` (new): thin wrapper that exposes quick lookup helpers for forms. Internally it calls `useSmartCategoryAnalysis` so we reuse the exact logic that powers the Smart Category Manager dashboard.
- `useSmartCategoryAnalysis` fan-outs into:
  - `useTransactionAnalysis` → `analyzeUncategorizedTransactions` & `analyzeUnusedCategories` in `src/utils/analytics/transactionAnalyzer.ts`.
  - `useBillAnalysis` → `analyzeBillCategorization` & `analyzeBillCategoryOptimization` in `src/utils/analytics/billAnalyzer.ts`.
- Transaction suggestions are merchant-based. Defaults: `minTransactionCount = 5`, `minAmount = 25`, so we only surface advice when we have at least five uncategorised transactions for the same merchant worth ≥ $25 total.
- Bill suggestions are mostly pattern driven (bill-name regex + `suggestBillCategoryAndIcon`). Icon hints come from `getBillIconOptions`, so we stay aligned with the existing icon catalogue.

## Data Requirements (Runtime)

| Data source                                 | Needed fields                                           | Notes                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Transactions (TanStack query / Dexie cache) | `description`, `merchant`, `amount`, `category`, `type` | We now pull the global transaction list via `useLayoutData` or `useTransactions` and run the analysis locally in forms. |
| Bills (TanStack query / Dexie cache)        | `name`, `category`, `notes`, `amount`                   | Used for name-based category & icon heuristics.                                                                         |
| Pattern libraries                           | `MERCHANT_CATEGORY_PATTERNS`, `CATEGORY_PATTERNS`       | Shared constants already live in `src/constants/categories.ts` & `src/utils/billIcons`.                                 |

## Fixture & Test Gaps

1. **Uncategorised transaction clusters**
   - The generator in `public/test-data/generate-test-data.cjs` currently assigns categories to every synthetic transaction.
   - To exercise the smart pipeline we need at least two merchant clusters with ≥5 uncategorised items each (e.g. “Starbucks” & “Amazon”), with per-item amounts > $25 so they clear `minAmount`.
   - Recommendation: extend the generator to append a dedicated `uncategorisedSamples` section (10–12 transactions) and document it in `public/test-data/README.md`.

2. **Bill discovery samples**
   - `suggestBillCategory` looks for keywords (“electric”, “loan”, etc.). We already cover the basics but we lack mixed-case or noisy provider names.
   - Add at least one bill with a descriptive name (e.g. “Consolidated Edison Utility Statement”) and blank category so the suggestion pathway is obvious in manual QA.

3. **Unit tests**
   - `hooks/analytics/__tests__/useSmartCategoryManager.test.tsx` covers the dashboard flows, but we do not have form-level tests yet.
   - TODO (follow-up PR): add focused tests for `useSmartSuggestions` verifying that a cluster of uncategorised transactions produces the expected lookup output and that bill suggestions fall back to icon heuristics.

4. **Manual test checklist**
   - [ ] Load the generated dataset and create a new transaction with a merchant present in the uncategorised cluster → verify the category badge appears in `TransactionForm` and applies correctly.
   - [ ] Create/Edit a bill with a fuzzy provider name (e.g. “Comcast Internet Bundle”) and empty category → confirm the category + icon suggestion banner shows up.
   - [ ] Confirm suggestions disappear once the user selects a category manually (ensures we are not overriding intentional choices).

## Next Steps

- Update `generate-test-data.cjs` to inject uncategorised merchant groups (plan is to keep them in a clearly labelled section so we can toggle counts easily).
- Backfill a Vitest suite for `useSmartSuggestions` (cover “analysis hit”, “pattern fallback”, “no suggestion”).
- Wire these fixture adjustments into documentation (`docs/TEST-DATA-GUIDE.md`) once implemented.

> These items are tracked in the “Smart suggestions test data” todo so we can prioritise them after landing the UI integration.
