# Comprehensive Refactoring Plan: 56 Remaining Files

**Current Status:** 73 lint violations in 56 files
**Completed:** 1 file (BillDiscoveryModal)
**Remaining:** 56 files to refactor

---

## 🎯 STRICT Rules - Apply to EVERY File

These rules are NON-NEGOTIABLE for every single file refactored:

1. ✅ **No new lint warnings** - Run `npm run lint` after every change
2. ✅ **No new TypeScript errors** - Run `npm run typecheck` after every change
3. ✅ **Build must succeed** - Run `npm run build` after completing the file
4. ✅ **All imports use `@/` alias** - NO `../../` relative paths
5. ✅ **Components = UI ONLY** - Zero business logic in components
6. ✅ **Service calls ONLY in hooks** - Never call services from components
7. ✅ **Large hooks split into sub-hooks** - Then reconnect in main hook
8. ✅ **Run prettier before commit** - `npx prettier --write [file]`
9. ✅ **Test functionality after changes** - Verify all interactions work
10. ✅ **Commit after each file** - One file = one commit

---

## 📋 ALL 56 FILES TO REFACTOR

### AUTH/SETTINGS (3 files)

**1. KeyManagementSettings.tsx** (232 lines)

- **Issue:** Direct service calls in component (architecture violation)
- **Action:** Remove all `keyManagementService` calls, move to hooks
- **Extract:** UI sections into sub-components
- **Notes:** This is UI only - all logic must move to useKeyManagement hook

**2. LocalOnlyModeSettings.tsx** (369 lines)

- **Issue:** Multiple settings/modes combined
- **Action:** Extract UI sections, use hook only
- **Extract:** Settings groups into separate components

**3. LocalOnlySetup.tsx** (258 lines)

- **Issue:** Setup steps combined in one component
- **Action:** Extract as step components
- **Extract:** Setup steps/screens

---

### ANALYTICS (5 files)

**4. AnalyticsDashboard.tsx**

- **Action:** Extract chart sections into components
- **Notes:** Keep dashboard as orchestrator only

**5. useAnalyticsData.ts** (241 lines)

- **Issue:** Multiple data queries bundled
- **Action:** Split into focused query hooks
- **Extract:** Query hooks for each data type

**6. useAnalyticsIntegration.ts**

- **Issue:** Multiple integrations bundled
- **Action:** Split each integration into separate hook

**7. usePerformanceMonitor.ts** (249 lines)

- **Issue:** Metrics collection combined
- **Action:** Extract metric collectors into sub-hooks

**8. useReportExporter.ts** (299 lines)

- **Issue:** PDF/CSV/Chart export logic bundled
- **Action:** Split into 3 separate hooks (PDF, CSV, Chart)
- **Extract:** usePDFExport, useCSVExport, useChartExport
- **Notes:** Main hook orchestrates the three sub-hooks

---

### AUTOMATION (3 files)

**9. AutoFundingDashboard.tsx**

- **Action:** Extract dashboard sections into components

**10. AutoFundingView.tsx**

- **Action:** Extract view/screen components

**11. RulesTab.tsx**

- **Action:** Extract rule list and form into separate components

---

### BILLS (6 files)

**12. BillManager.tsx**

- **Action:** Extract bill operations to hooks

**13. BillTable.tsx**

- **Action:** Extract table logic and rendering

**14. BulkBillUpdateModal.tsx**

- **Action:** Extract bulk operation logic

**15. BulkUpdateEditor.tsx**

- **Action:** Extract editor sections/steps

**16. SmartBillMatcher.tsx**

- **Action:** Extract matching algorithm logic

**17. BillDetailModal.tsx**

- **Action:** Extract detail sections into components

---

### BUDGETING (3 files)

**18. CreateEnvelopeModal.tsx**

- **Action:** Extract as step components

**19. EditEnvelopeModal.tsx**

- **Action:** Extract as step components

**20. PaydayPrediction.tsx**

- **Action:** Extract prediction calculation logic to hooks

---

### DEBT (2 files)

**21. DebtDashboard.tsx**

- **Action:** Extract dashboard sections

**22. DebtDetailModal.tsx**

- **Action:** Extract detail sections

---

### HISTORY (2 files)

**23. IntegrityStatusIndicator.tsx**

- **Action:** Extract status display components

**24. ObjectHistoryViewer.tsx**

- **Action:** Extract history filtering and display logic

---

### LAYOUT (2 files)

**25. MainLayout.tsx**

- **Action:** Extract layout sections into components

**26. ViewRenderer.tsx**

- **Action:** Extract view type detection logic to utilities/hooks

---

### MOBILE (1 file)

**27. SlideUpModal.tsx**

- **Action:** Extract modal logic to hooks

---

### MODALS (1 file)

**28. UnassignedCashModal.tsx**

- **Action:** Extract cash assignment logic

---

### ONBOARDING (2 files)

**29. EmptyStateHints.tsx**

- **Action:** Extract hint display components

**30. OnboardingProgress.tsx**

- **Action:** Extract progress steps

---

### PAGES (1 file)

**31. MainDashboard.tsx**

- **Action:** Extract dashboard sections into components

---

### SETTINGS (3 files)

**32. DataManagementSection.tsx**

- **Action:** Extract data operation logic

**33. GeneralSettingsSection.tsx**

- **Action:** Extract setting groups

**34. NotificationSettingsSection.tsx**

- **Action:** Extract notification options

---

### UI (1 file)

**35. EditableBalance.tsx**

- **Action:** Extract edit logic to hooks

---

### HOOKS: ACCOUNTS (1 file)

**36. useSupplementalAccounts.ts**

- **Action:** Split account operations into sub-hooks

---

### HOOKS: BILLS (2 files)

**37. useBillForm.ts**

- **Action:** Split form validation and submission logic

**38. useBillManager.ts**

- **Action:** Split CRUD operations

---

### HOOKS: BUDGETING (3 files)

**39. useAutoFunding.ts** (274 lines)

- **Action:** Split funding logic into sub-hooks

**40. useAutoFundingData.ts** (259 lines)

- **Action:** Split data queries into focused hooks

**41. useBudgetData/mutations.ts**

- **Action:** Extract mutations into separate functions/hooks

---

### HOOKS: COMMON (1 file)

**42. useExportData.ts**

- **Action:** Split export formats (PDF, CSV, JSON) into sub-hooks

---

### HOOKS: DEBTS (1 file)

**43. useDebtManagement.ts** (293 lines)

- **Action:** Split debt operations into sub-hooks

---

### HOOKS: TRANSACTIONS (6 files)

**44. useTransactionData.ts** (202 lines)

- **Action:** Split data queries

**45. useTransactionLedger.ts** (191 lines)

- **Action:** Split ledger logic

**46. useTransactionOperations.ts** (278 lines)

- **Action:** Split transaction operations (create, update, delete, etc.)

**47. useTransactionQuery.ts**

- **Action:** Split query logic into focused hooks

**48. useTransactionSplitter.ts**

- **Action:** Extract transaction splitting logic

**49. useTransactionsV2.ts**

- **Action:** Split transaction management into operations/queries/subscriptions

---

### UTILS: BILLS (1 file)

**50. billCalculations.ts**

- **Action:** Extract calculation functions (modular approach)

---

### UTILS: BUDGETING (2 files)

**51. autofunding/rules.ts**

- **Action:** Extract rule validators into separate functions

**52. envelopeFormUtils.ts**

- **Action:** Extract form utility functions (modular approach)

---

### UTILS: COMMON (2 files)

**53. billDiscovery.ts**

- **Action:** Extract discovery algorithm logic

**54. transactionArchiving.ts**

- **Action:** Extract archiving logic

---

### UTILS: DEBTS (2 files)

**55. debtFormValidation.ts**

- **Action:** Extract validators into focused functions

**56. debtStrategies.ts**

- **Action:** Extract strategy functions

---

## 📝 Per-File Process (10 Steps)

Follow this process for EVERY file:

1. **Read** the entire file
2. **Identify** violations and separate concerns
3. **Plan** extractions (sketches on paper)
4. **Refactor** - extract as needed
5. **Update imports** - all use `@/` alias
6. **Run Prettier** - `npx prettier --write [file]`
7. **Run Lint** - `npm run lint` (must pass, 0 warnings)
8. **Run TypeCheck** - `npm run typecheck` (must pass, 0 errors)
9. **Run Build** - `npm run build` (must succeed)
10. **Test** - verify functionality works
11. **Commit** - one file = one atomic commit

---

## 💾 Commit Template

```
refactor: [file name] - extract [what was extracted]

Changes:
- Extracted [detail 1] to [new file/hook]
- Extracted [detail 2] to [new file/hook]
- Simplified main [component/hook] to orchestrator

Validation:
✅ npm run lint (0 warnings)
✅ npm run typecheck (0 errors)
✅ npm run build (success)

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## ✅ Validation Checklist

Before commit, verify:

- [ ] No new lint warnings: `npm run lint`
- [ ] No new TypeScript errors: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] All imports use `@/` alias
- [ ] Components have zero business logic
- [ ] Large hooks split into sub-hooks
- [ ] All new code tested
- [ ] File formatted with Prettier
- [ ] Commit message clear and descriptive

---

## 🚀 Getting Started

1. Start with file #1 (KeyManagementSettings.tsx)
2. Follow the 10-step process strictly
3. After each file, commit before moving to next
4. Track progress: X/56 files completed

---

**Last Updated:** Oct 20, 2025
**Status:** Ready to refactor - 56 files remaining
**Validation:** Strict - lint, typecheck, and build must pass after EVERY file
