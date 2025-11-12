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

## Fixture Updates

### Synthetic Recurring Bills

- Implemented in `createRecurringBillCandidates()` within `public/test-data/generate-test-data.cjs`.
- Merchants (e.g. Brightstream Broadband, Evergreen Water Services) now emit 4–5 30-day-spaced expenses with identical providers and no linked bills/envelopes.
- These drive the Discover Bills modal so QA can add the suggestion immediately.

### Uncategorized Merchant Clusters

- Implemented in `createUncategorizedTransactionClusters()` in the same generator.
- Merchants such as **Starbucks Coffee**, **Amazon Marketplace**, and **Fresh Harvest Grocers** receive 5–6 high-value expenses with blank categories.
- The transaction form now shows Sparkle suggestions (category + “Apply” button) using this data.

## Unit Tests

- Added `src/hooks/analytics/__tests__/useSmartSuggestions.test.ts` to assert:
  - Merchant clusters yield transaction category recommendations (e.g. Starbucks → Food & Dining).
  - Bill names with fuzzy matches produce icon + category suggestions.
- This keeps the shared hook safe from regressions when heuristics change.

## Manual test checklist

- [ ] Load the generated dataset and create a new transaction with a merchant present in the uncategorised cluster → verify the category badge appears in `TransactionForm` and applies correctly.
- [ ] Create/Edit a bill with a fuzzy provider name (e.g. “Comcast Internet Bundle”) and empty category → confirm the category + icon suggestion banner shows up.
- [ ] Confirm suggestions disappear once the user selects a category manually (ensures we are not overriding intentional choices).

## Next Steps

- Wire fixture summary into `docs/TEST-DATA-GUIDE.md` when we refresh that guide.
- Expand smart suggestion coverage if new heuristics land (e.g. supplemental account-based suggestions).
