# Comprehensive Refactoring Plan: Address All 129 Lint Warnings

**Total Issues:** 129 violations across the codebase
**Estimated Timeline:** 40-50 hours of focused work
**Strategic Value:** CRITICAL - Improves maintainability, testability, code quality, and team velocity

---

## 📊 TIER 1 ACTUAL STATUS (VERIFIED FROM LINT)

### ✅ COMPLETED & VIOLATIONS CLEARED (4/5):

1. ✅ **BugReportButton.tsx** - DONE
   - Original: 332 lines → Actual: 150 lines
   - Violations: RESOLVED ✅

2. ✅ **SyncIndicator.tsx** - DONE
   - Original: 287 lines → Actual: 143 lines
   - Violations: RESOLVED ✅

3. ✅ **EnvelopeItem.tsx** - DONE
   - Original: 307 lines → Actual: 131 lines
   - Violations: RESOLVED ✅

4. ✅ **useBugReport.ts** (renamed from useBugReportV2) - DONE
   - Refactored into sub-hooks directory with 5 focused hooks
   - Violations: RESOLVED ✅

### ❌ NOT DONE - STILL FAILING (1/5):

5. ❌ **useAutoFundingRules.ts** - INCOMPLETE
   - Status: 296 lines → STILL 296 lines
   - Lint violation: ⚠️ max-lines-per-function (296 > 150)
   - Action required: MUST be refactored

---

## 📈 CURRENT PROGRESS

| Metric                | Status                                         |
| --------------------- | ---------------------------------------------- |
| **Total Violations**  | 129 → 118 (11 resolved)                        |
| **Progress**          | ~30% (not 40%)                                 |
| **Tier 1 Files Done** | 4/5 completed                                  |
| **Remaining**         | useAutoFundingRules.ts + All Tier 2 (15 files) |

---

## 📊 Violation Breakdown (Complete Analysis)

| Category                 | Count   | % of Total | Priority | Fix Strategy                              |
| ------------------------ | ------- | ---------- | -------- | ----------------------------------------- |
| `max-lines-per-function` | 71      | 55%        | CRITICAL | Extract to sub-functions/hooks/components |
| `complexity`             | 36      | 28%        | CRITICAL | Simplify conditions, extract logic        |
| `max-statements`         | 21      | 16%        | HIGH     | Break into smaller functions              |
| `max-depth`              | 1       | <1%        | LOW      | Reduce nesting                            |
| **TOTAL**                | **129** | **100%**   | —        | —                                         |

### Violation Categories Breakdown:

**CRITICAL (107 violations):**

- `max-lines-per-function`: 71 violations
  - Functions over 150 lines
  - Range: 151 - 369 lines
  - Main culprits: Components, hooks, utilities

- `complexity`: 36 violations
  - Functions with cyclomatic complexity > 15
  - Range: 16 - 46 complexity
  - Main culprits: Status calculation, validation, calculation functions

**HIGH (21 violations):**

- `max-statements`: 21 violations
  - Functions/methods with > 25 statements
  - Often bundled with max-lines issues
  - Main culprits: Async functions, mutation handlers

**LOW (1 violation):**

- `max-depth`: 1 violation
  - Nested blocks > 5 levels
  - In `src/hooks/budgeting/useBudgetData/mutations.ts`

---

## 📑 Complete File Index: All 129 Violations

### **Files with Most Issues (5+)**

1. **src/services/authService.ts** - 5 issues
   - 3 × max-lines-per-function (200, 190, 369 lines)
   - 2 × max-statements (29, 66, 25+ allowed)
   - 1 × complexity (36, max 15)

2. **src/hooks/analytics/useReportExporter.ts** - 2 issues
   - 1 × max-lines-per-function (299 lines)
   - 1 × max-statements (67)

3. **src/hooks/common/useBugReportV2.ts** - 2 issues
   - 1 × max-lines-per-function (293 lines)
   - 1 × max-statements (30)

### **All 71 Files with max-lines-per-function Violations:**

**TIER 1: 250+ lines (5 files) - START HERE:**

1. EnvelopeIntegrityChecker.tsx - 345 lines ⭐ **HIGHEST**
2. BugReportButton.tsx - 332 lines ⭐
3. useEnvelopes.ts - 332 lines ⭐
4. useAnalytics.ts - 353 lines ⭐
5. EnvelopeItem.tsx - 307 lines ⭐

**TIER 2: Remaining High-Priority Files (15 files with active violations):**

| #   | File                        | Lines | Status            |
| --- | --------------------------- | ----- | ----------------- |
| 6   | BillDiscoveryModal.tsx      | 313   | ❌ Needs refactor |
| 7   | useReportExporter.ts        | 299   | ❌ Needs refactor |
| 8   | useDebtManagement.ts        | 293   | ❌ Needs refactor |
| 9   | useKeyManagement.ts         | 272   | ❌ Needs refactor |
| 10  | useAutoFunding.ts           | 274   | ❌ Needs refactor |
| 11  | useAnalyticsData.ts         | 241   | ❌ Needs refactor |
| 12  | LocalOnlyModeSettings.tsx   | 369   | ❌ LARGEST        |
| 13  | LockScreen.tsx              | 260   | ❌ Needs refactor |
| 14  | UnassignedCashModal.tsx     | 245   | ❌ Needs refactor |
| 15  | SyncHealthDashboard.tsx     | 258   | ❌ Needs refactor |
| 16  | useTransactionOperations.ts | 278   | ❌ Needs refactor |
| 17  | useAutoFundingData.ts       | 259   | ❌ Needs refactor |
| 18  | ReportExporter.tsx          | 279   | ❌ Needs refactor |
| 19  | CreateEnvelopeModal.tsx     | 184   | ❌ Needs refactor |
| 20  | EditEnvelopeModal.tsx       | 224   | ❌ Needs refactor |

**TIER 3: 150-200 lines (remaining 51 files):**
Listed in detailed format below

### **All 36 Files with Complexity Violations:**

**Complexity > 30 (2 files) - HIGHEST PRIORITY:**

1. authService.ts - complexity 36
2. envelopeFormUtils.ts - complexity 31

**Complexity 20-30 (12 files):**

1. SyncIndicator.tsx - complexity 46 ⭐ **WORST**
2. patchNotesManager.ts - complexity 28
3. syncHealthChecker.ts - complexity 31
4. syncFlowValidator.ts - complexity 16
5. PatchNotesModal.tsx - complexity 25
6. billDiscovery.ts - complexity 25
7. autofunding/rules.ts - complexity 32 & 16
8. EnvelopeItem.tsx - complexity 21
9. IntegrityStatusIndicator.tsx - complexity 20
10. UnassignedCashModal.tsx - complexity 20
11. SyncHealthDashboard.tsx - complexity 16
12. And 24 more with complexity 15-19

---

## 🎯 Core Problem

### Current State (Bad):

- Components mixing UI, business logic, and data fetching
- Functions attempting too many responsibilities
- Complex conditional logic bundled together
- Difficult to test individual concerns
- High cognitive load for new developers
- Prone to bugs and regressions

### Target State (Good):

- Single-responsibility components and functions
- Business logic in custom hooks
- Data fetching in service layer
- Clear separation of concerns
- Easy to test and maintain
- Clear, readable code

---

## 📋 Three-Phase Approach

### Phase 1: Foundation & Preparation (Hours 1-4)

**Goals:**

- Understand current architecture and dependencies
- Map out extraction strategies
- Plan component hierarchies
- Set up branch and development environment

**Tasks:**

1. Review all 20 priority files identified in MAX-LINES plan
2. Understand data flow for each component
3. Create extraction strategy for each file
4. Set up feature branch: `refactor/reduce-complexity`

**Deliverable:** Detailed extraction strategy document per file

---

### Phase 2: Tier 1 Refactoring - CRITICAL FILES (Hours 5-20)

**5 Files - 250+ lines AND complexity > 30**

#### 2.1: `src/components/feedback/BugReportButton.tsx`

- **Current:** 332 lines
- **Issue:** Multi-step form, validation, API calls
- **Strategy:** Strategy A (Multi-Step Forms)

**Extract:**

```
src/components/feedback/
├── BugReportButton.tsx (simplified orchestrator, ~40 lines)
├── steps/
│   ├── StepOne.tsx (~40 lines)
│   ├── StepTwo.tsx (~40 lines)
│   ├── StepThree.tsx (~40 lines)
│   └── StepFour.tsx (~40 lines)
├── hooks/
│   └── useBugReportState.ts (~80 lines - state management)
└── utils/
    └── bugReportValidation.ts (~50 lines - validation logic)
```

**Steps:**

1. [ ] Extract state management to `useBugReportState.ts`
2. [ ] Extract step components to `steps/` directory
3. [ ] Extract validation to `utils/bugReportValidation.ts`
4. [ ] Simplify main component to orchestrator
5. [ ] Test all interactions
6. [ ] Update tests for new structure
7. [ ] Run lint, ensure all pass
8. [ ] Commit with clear message

**Expected Result:** 332 → ~80 lines, Complexity reduction of 40%+

---

#### 2.2: `src/components/sync/SyncIndicator.tsx`

- **Current:** 287 lines, Complexity: 46
- **Issue:** Status calculation, display logic, handlers
- **Strategy:** Strategy E (Status Display)

**Extract:**

```
src/components/sync/
├── SyncIndicator.tsx (orchestrator, ~40 lines)
├── hooks/
│   └── useSyncStatus.ts (~90 lines - status logic)
└── status/
    ├── SyncingStatus.tsx (~30 lines)
    ├── SyncedStatus.tsx (~30 lines)
    ├── ErrorStatus.tsx (~40 lines)
    ├── IdleStatus.tsx (~20 lines)
    └── ConflictStatus.tsx (~25 lines)
```

**Steps:**

1. [ ] Extract status calculation logic to `useSyncStatus.ts`
2. [ ] Create status display components in `status/`
3. [ ] Simplify main component to router
4. [ ] Test status transitions
5. [ ] Update component tests
6. [ ] Run lint
7. [ ] Commit

**Expected Result:** 287 lines → ~60 lines, Complexity: 46 → 8

---

#### 2.3: `src/components/budgeting/envelope/EnvelopeItem.tsx`

- **Current:** 307 lines, Complexity: 21
- **Issue:** Status display, actions, modal logic
- **Strategy:** Strategy C (Complex Conditions) + Strategy E (Status Display)

**Extract:**

```
src/components/budgeting/envelope/
├── EnvelopeItem.tsx (orchestrator, ~50 lines)
├── EnvelopeStatusDisplay.tsx (~40 lines)
├── EnvelopeActions.tsx (~50 lines)
├── hooks/
│   └── useEnvelopeItem.ts (~100 lines - state + logic)
└── utils/
    └── envelopeHelpers.ts (~40 lines - calculations)
```

**Steps:**

1. [ ] Extract state and handlers to `useEnvelopeItem.ts`
2. [ ] Extract status display logic to `EnvelopeStatusDisplay.tsx`
3. [ ] Extract action buttons to `EnvelopeActions.tsx`
4. [ ] Extract calculations to `utils/envelopeHelpers.ts`
5. [ ] Simplify main component
6. [ ] Test all interactions and states
7. [ ] Update tests
8. [ ] Commit

**Expected Result:** 307 lines → ~80 lines, Complexity: 21 → 5

---

#### 2.4: `src/hooks/common/useBugReportV2.ts`

- **Current:** 303 lines
- **Issue:** Report gathering, validation, submission bundled
- **Strategy:** Strategy B (Data Fetching) + Strategy D (Event Handlers)

**Extract:**

```
src/hooks/common/
├── useBugReportV2.ts (orchestrator hook, ~50 lines)
├── useBugReportGathering.ts (~80 lines - data collection)
├── useBugReportValidation.ts (~50 lines - validation)
└── useBugReportSubmission.ts (~70 lines - API calls)
```

**Steps:**

1. [ ] Extract data gathering logic to `useBugReportGathering.ts`
2. [ ] Extract validation to `useBugReportValidation.ts`
3. [ ] Extract submission logic to `useBugReportSubmission.ts`
4. [ ] Create orchestrator hook combining all three
5. [ ] Test each sub-hook in isolation
6. [ ] Update tests
7. [ ] Commit

**Expected Result:** 303 lines → ~70 lines, Complexity reduction of 50%+

---

#### 2.5: `src/hooks/budgeting/useAutoFundingRules.ts`

- **Current:** 296 lines
- **Issue:** Rule management, execution, validation
- **Strategy:** Strategy B (Data Fetching) + Strategy D (Event Handlers)

**Extract:**

```
src/hooks/budgeting/
├── useAutoFundingRules.ts (orchestrator, ~60 lines)
├── useAutoFundingRuleExecution.ts (~90 lines - execution)
├── useAutoFundingRuleValidation.ts (~50 lines - validation)
└── utils/
    └── autoFundingHelpers.ts (~40 lines - calculations)
```

**Steps:**

1. [ ] Extract rule execution logic to `useAutoFundingRuleExecution.ts`
2. [ ] Extract validation to `useAutoFundingRuleValidation.ts`
3. [ ] Extract calculations to `utils/autoFundingHelpers.ts`
4. [ ] Create orchestrator combining all pieces
5. [ ] Test each sub-concern
6. [ ] Update tests
7. [ ] Commit

**Expected Result:** 296 lines → ~80 lines, Complexity reduction of 45%+

---

### Phase 3: Tier 2 Refactoring - HIGH PRIORITY FILES (Hours 21-45)

**15 Files across 5 Batches - 200-250+ lines AND/OR complexity 15-30**

---

#### Batch 1: Analytics Components (4 files, ~8 hours)

| #   | File                                           | Lines | Complexity | Strategy | Expected  | Status |
| --- | ---------------------------------------------- | ----- | ---------- | -------- | --------- | ------ |
| 3.1 | `src/components/analytics/ReportExporter.tsx`  | 279   | —          | A + B    | 279 → ~80 | 🔲     |
| 3.2 | `src/hooks/analytics/useReportExporter.ts`     | 299   | —          | B + D    | 299 → ~70 | 🔲     |
| 3.3 | `src/hooks/analytics/useAnalyticsData.ts`      | 241   | —          | B + C    | 241 → ~70 | 🔲     |
| 3.4 | `src/hooks/analytics/usePerformanceMonitor.ts` | 249   | —          | B + D    | 249 → ~75 | 🔲     |

**Batch 1 Goals:**

- Extract export workflow into step components
- Separate data gathering from rendering
- Create reusable analytics utilities
- Expected violations resolved: 8-10

**Steps:**

1. [ ] Create `ReportExporter/steps/` for export phases
2. [ ] Extract `useReportExporterData` hook (data gathering)
3. [ ] Extract `useReportExporterSubmit` hook (submission)
4. [ ] Extract `useAnalyticsData` into focused query hooks
5. [ ] Extract performance calculation utilities
6. [ ] Run tests & lint
7. [ ] Commit: "refactor: decompose analytics components"

---

#### Batch 2: Settings & Configuration (3 files, ~6 hours)

| #   | File                                                               | Lines | Complexity | Strategy | Expected  | Status |
| --- | ------------------------------------------------------------------ | ----- | ---------- | -------- | --------- | ------ |
| 3.5 | `src/components/settings/sections/NotificationSettingsSection.tsx` | 230   | —          | C + E    | 230 → ~70 | 🔲     |
| 3.6 | `src/components/settings/EnvelopeIntegrityChecker.tsx`             | 345   | —          | A + C    | 345 → ~90 | 🔲     |
| 3.7 | `src/hooks/auth/useKeyManagement.ts`                               | 272   | —          | B + D    | 272 → ~70 | 🔲     |

**Batch 2 Goals:**

- Break settings into focused sections
- Extract integrity checking into steps
- Modularize key management operations
- Expected violations resolved: 6-8

**Steps:**

1. [ ] Extract notification settings sections as components
2. [ ] Create `EnvelopeIntegrityChecker/steps/` directory
3. [ ] Extract check logic to `useIntegrityCheck` hook
4. [ ] Extract key operations (create, rotate, revoke, export)
5. [ ] Create validation utilities for settings
6. [ ] Run tests & lint
7. [ ] Commit: "refactor: decompose settings components"

---

#### Batch 3: History & Status Display (3 files, ~6 hours)

| #    | File                                                  | Lines | Complexity | Strategy | Expected           | Status |
| ---- | ----------------------------------------------------- | ----- | ---------- | -------- | ------------------ | ------ |
| 3.8  | `src/components/history/IntegrityStatusIndicator.tsx` | 251   | 20         | E        | 251 → ~60 (20 → 6) | 🔲     |
| 3.9  | `src/components/history/ObjectHistoryViewer.tsx`      | 199   | —          | C + B    | 199 → ~60          | 🔲     |
| 3.10 | `src/components/sync/SyncHealthDashboard.tsx`         | 258   | 16         | E        | 258 → ~65 (16 → 5) | 🔲     |

**Batch 3 Goals:**

- Create status display components for different states
- Extract history filtering logic
- Simplify sync dashboard rendering
- Expected violations resolved: 5-7

**Steps:**

1. [ ] Create status components: Valid/Invalid/Warning/Error
2. [ ] Extract `useIntegrityStatus` hook
3. [ ] Extract history filtering to `useHistoryFilter` hook
4. [ ] Create `SyncStatus/` components for different states
5. [ ] Extract sync calculations to utilities
6. [ ] Run tests & lint
7. [ ] Commit: "refactor: decompose status display components"

---

#### Batch 4: Modal Components (3 files, ~6 hours)

| #    | File                                              | Lines | Complexity | Strategy | Expected  | Status |
| ---- | ------------------------------------------------- | ----- | ---------- | -------- | --------- | ------ |
| 3.11 | `src/components/bills/modals/BillDetailModal.tsx` | 251   | —          | A + B    | 251 → ~80 | 🔲     |
| 3.12 | `src/components/bills/BillDiscoveryModal.tsx`     | 313   | —          | A + C    | 313 → ~90 | 🔲     |
| 3.13 | `src/components/budgeting/PaydayPrediction.tsx`   | 171   | —          | C + B    | 171 → ~60 | 🔲     |

**Batch 4 Goals:**

- Break modals into step/section components
- Extract modal logic to hooks
- Simplify prediction calculations
- Expected violations resolved: 5-7

**Steps:**

1. [ ] Create `BillDetailModal/sections/` (basic, payment, linked)
2. [ ] Create `BillDiscoveryModal/steps/` (search, match, review)
3. [ ] Extract `useBillDetail` hook (state + mutations)
4. [ ] Extract discovery logic to `useBillDiscovery` hook
5. [ ] Extract prediction calculations to utilities
6. [ ] Run tests & lint
7. [ ] Commit: "refactor: decompose modal components"

---

#### Batch 5: Complex Hooks & Views (2 files, ~4 hours)

| #    | File                                                 | Lines | Complexity | Strategy | Expected  | Status |
| ---- | ---------------------------------------------------- | ----- | ---------- | -------- | --------- | ------ |
| 3.14 | `src/components/layout/ViewRenderer.tsx`             | 230   | —          | C        | 230 → ~60 | 🔲     |
| 3.15 | `src/hooks/transactions/useTransactionOperations.ts` | 278   | —          | C + B    | 278 → ~75 | 🔲     |

**Batch 5 Goals:**

- Extract view type detection logic
- Simplify transaction operations
- Create reusable view helpers
- Expected violations resolved: 4-6

**Steps:**

1. [ ] Extract view detection to `useViewDetection` hook
2. [ ] Create view type validators (pure functions)
3. [ ] Extract transaction operation types (split, merge, categorize, etc.)
4. [ ] Create separate hooks for each operation
5. [ ] Extract operation validators to utilities
6. [ ] Run tests & lint
7. [ ] Commit: "refactor: decompose complex hooks"

---

### Phase 4: Testing & Validation (Hours 46-48)

**Goals:**

- Ensure all refactoring maintains functionality
- Verify all lint warnings resolved
- Test performance impact
- Update documentation

**Tasks:**

1. [ ] Run full test suite: `npm run test`
   - Verify: 0 test failures
   - Expected: All new extracted code has tests

2. [ ] Run linter: `npm run lint`
   - Verify: 0 warnings
   - Check: All 129 violations resolved

3. [ ] Run TypeScript check: `npm run type-check`
   - Verify: 0 type errors
   - Check: All types properly inferred

4. [ ] Manual testing
   - [ ] Test all major user flows
   - [ ] Test error scenarios
   - [ ] Test edge cases
   - [ ] Mobile responsiveness check

5. [ ] Performance check
   - [ ] Bundle size impact: should be same or smaller
   - [ ] Runtime performance: should be same or better
   - [ ] Dev server startup: should be same or faster

6. [ ] Documentation update
   - [ ] Update component extraction patterns doc
   - [ ] Document new component hierarchies
   - [ ] Update architecture diagrams

---

### Phase 5: Final Integration (Hours 49-50)

**Tasks:**

1. [ ] Format all files: `npx prettier --write src/`
2. [ ] Run final lint check
3. [ ] Commit final cleanup with message
4. [ ] Create comprehensive PR summary
5. [ ] Link all related issues
6. [ ] Request code review

---

## 🔑 Key Extraction Strategies Applied

### Strategy A: Multi-Step Forms → Step Components

**When:** Forms with multiple steps, conditional rendering
**Result:** 200+ line component → 5-6 components of 30-50 lines each
**Examples:** BugReportButton, BillDiscoveryModal, UnassignedCashModal

### Strategy B: Data Fetching → Custom Hooks

**When:** Async operations, API calls, data transformations
**Result:** 80-100 lines of useEffect logic → focused, testable hook
**Examples:** useBugReportV2, useReportExporter, useAutoFundingRules

### Strategy C: Complex Conditions → Utility Functions

**When:** Complex decision logic, validation, calculations
**Result:** 30-50 line nested condition → 3-4 small utility functions
**Examples:** ViewRenderer, IntegrityStatusIndicator, TransactionOperations

### Strategy D: Event Handlers → Separate Functions

**When:** Multiple event handlers bundled in one component
**Result:** Component with 5-10 inline handlers → 1-2 focused handler hooks
**Examples:** useBugReportV2, useAutoFundingRules

### Strategy E: Status Display → Separate Components

**When:** Complex conditional rendering for different states
**Result:** 200+ line component with many conditions → 4-6 simple status components
**Examples:** SyncIndicator, IntegrityStatusIndicator, LockScreen

---

## 📊 Expected Metrics After Refactoring

### Code Quality

| Metric                              | Before  | After | Change       |
| ----------------------------------- | ------- | ----- | ------------ |
| Files over 250 lines                | 20      | 0     | -100% ✅     |
| Avg complexity                      | 18      | 6     | -67% ✅      |
| `max-lines-per-function` violations | 71      | 0     | -100% ✅     |
| `complexity` violations             | 36      | 0     | -100% ✅     |
| Other lint violations               | 22      | 0     | -100% ✅     |
| **Total lint warnings**             | **129** | **0** | **-100% ✅** |

### Codebase Structure

| Metric                      | Before | After | Change                    |
| --------------------------- | ------ | ----- | ------------------------- |
| Component files             | 45     | ~65   | +44% (better granularity) |
| Hook files                  | 30     | ~45   | +50% (better separation)  |
| Utility files               | 15     | ~25   | +67% (focused utilities)  |
| Lines per function (avg)    | 120    | 45    | -63% ✅                   |
| Cyclomatic complexity (avg) | 18     | 6     | -67% ✅                   |

### Test Coverage (Estimated)

| Category             | Before  | After   | Impact   |
| -------------------- | ------- | ------- | -------- |
| Component unit tests | 60%     | 85%     | +42%     |
| Hook unit tests      | 55%     | 90%     | +64%     |
| Utility tests        | 50%     | 95%     | +90%     |
| Integration tests    | 70%     | 75%     | +7%      |
| **Overall coverage** | **62%** | **86%** | **+39%** |

---

## 📝 Implementation Guidelines

### Per-File Checklist

For each file to refactor, follow this process:

#### 1. Preparation

- [ ] Read entire file completely
- [ ] Identify all distinct concerns
- [ ] Map data flow in/out of file
- [ ] Plan extraction strategy (which Strategy A-E)
- [ ] Sketch out new file structure
- [ ] Document current functionality

#### 2. Extraction

- [ ] Create new hook/component files
- [ ] Move logic to extracted files
- [ ] Import extracted code into original
- [ ] Remove dead code from original
- [ ] Verify original file structure

#### 3. Testing

- [ ] Test component/hook in isolation
- [ ] Test all user interactions
- [ ] Check browser console for errors
- [ ] Run unit tests: `npm run test -- [file]`
- [ ] Run linter: `npm run lint`

#### 4. Validation

- [ ] Lines < 150 per function ✅
- [ ] Complexity < 15 ✅
- [ ] Single responsibility ✅
- [ ] No duplication ✅
- [ ] Proper error handling ✅
- [ ] TypeScript strict mode ✅

#### 5. Commit & Push

- [ ] Format with Prettier: `npx prettier --write [file]`
- [ ] Git add: `git add .`
- [ ] Commit with clear message
- [ ] Push to branch: `git push -u origin refactor/reduce-complexity`

### Commit Message Format

```
refactor: decompose [ComponentName] into focused units

Breakdown of changes:
- Extracted [detail 1] to new hook/component
- Extracted [detail 2] to new hook/component
- Simplified main component to orchestrator

Metrics:
- Lines: XXX → YYY (% reduction)
- Complexity: XX → YY (% reduction)

Lint violations resolved: X/Y ✅
Tests passing: ✅
Type check: ✅
```

---

## 🎯 Success Criteria

### Must-Have (Phase 4 Validation)

- ✅ **All 129 violations resolved** (0 warnings)
- ✅ **All tests passing** (0 failures)
- ✅ **No TypeScript errors** (0 errors)
- ✅ **No regressions** (functionality preserved)
- ✅ **Prettier formatted** (consistent style)

### Should-Have (Quality Improvements)

- ✅ **50%+ code reduction** in refactored files
- ✅ **90%+ test coverage** on new code
- ✅ **Improved code clarity** (reviewable in <5 minutes)
- ✅ **Better reusability** (components/hooks in other places)

### Nice-to-Have (Documentation)

- ✅ Architecture diagram updated
- ✅ Component hierarchy documented
- ✅ Extraction patterns documented
- ✅ Performance analysis included

---

## ⏱️ Timeline Summary

| Phase       | Duration     | Tasks                        | Status            |
| ----------- | ------------ | ---------------------------- | ----------------- |
| **Phase 1** | 4 hours      | Planning & preparation       | ✅ Complete       |
| **Phase 2** | 16 hours     | 5 critical files refactoring | 🔄 80% (4/5 done) |
| **Phase 3** | 24 hours     | 15 high-priority files       | 🔲 Not Started    |
| **Phase 4** | 3 hours      | Testing & validation         | 🔲 Pending        |
| **Phase 5** | 2 hours      | Final integration & PR       | 🔲 Pending        |
| **TOTAL**   | **49 hours** | **20 files refactored**      | **30% Complete**  |

---

## 🚀 Getting Started

### Before You Start

1. Create feature branch: `git checkout -b refactor/reduce-complexity`
2. Review this entire plan
3. Read `/docs/Component-Refactoring-Standards.md`
4. Read `/docs/audits/MAX-LINES-AND-COMPLEXITY-REFACTOR-PLAN.md`
5. Understand your architecture diagram

### First Steps (Phase 1)

1. Pick first CRITICAL file: `BugReportButton.tsx`
2. Read entire file completely
3. Sketch extraction plan on paper
4. Create new files for extracted code
5. Move logic incrementally
6. Test after each move

### Ongoing

- Commit frequently (after each file)
- Run tests after each commit
- Keep PR comments focused
- Document complex logic with comments

---

## 💡 Pro Tips

1. **Start with extracting hooks first** - easier to test, less risky
2. **Create utility files for pure functions** - most reusable
3. **Extract UI components last** - dependencies are clear by then
4. **Use TypeScript strict mode** - catches issues early
5. **Test extracted code thoroughly** - easier now than debugging later
6. **Keep commits atomic** - one file = one commit
7. **Document why, not what** - comments explain the "why"

---

## 🔗 Related Documentation

- `/docs/Component-Refactoring-Standards.md` - Detailed refactoring standards
- `/docs/audits/MAX-LINES-AND-COMPLEXITY-REFACTOR-PLAN.md` - Original analysis
- Architecture docs (to be updated after refactoring)
- CLAUDE.md - Project-specific instructions

---

## 📋 APPENDIX: Complete Violation Reference

### Components (58 violations total)

| File                                             | Lines | Complexity | Issues                | Tier |
| ------------------------------------------------ | ----- | ---------- | --------------------- | ---- |
| components/feedback/BugReportButton.tsx          | 150   | —          | ✅ RESOLVED           | 1    |
| components/budgeting/envelope/EnvelopeItem.tsx   | 131   | —          | ✅ RESOLVED           | 1    |
| components/sync/SyncIndicator.tsx                | 143   | —          | ✅ RESOLVED           | 2    |
| components/sync/SyncHealthDashboard.tsx          | 258   | 16         | max-lines, complexity | 2    |
| components/settings/EnvelopeIntegrityChecker.tsx | 345   | —          | max-lines             | 1    |
| components/history/IntegrityStatusIndicator.tsx  | 251   | 20         | max-lines, complexity | 2    |
| components/modals/UnassignedCashModal.tsx        | 245   | 20         | max-lines, complexity | 2    |
| components/bills/modals/BillDetailModal.tsx      | 251   | —          | max-lines             | 2    |
| components/bills/BillDiscoveryModal.tsx          | 313   | —          | max-lines             | 2    |
| components/security/LockScreen.tsx               | 260   | —          | max-lines             | 2    |
| components/layout/ViewRenderer.tsx               | 230   | —          | max-lines             | 2    |
| components/pwa/PatchNotesModal.tsx               | 191   | 25         | max-lines, complexity | 3    |
| components/onboarding/OnboardingProgress.tsx     | 238   | —          | max-lines             | 3    |
| components/onboarding/EmptyStateHints.tsx        | 200   | —          | max-lines             | 3    |
| components/analytics/ReportExporter.tsx          | 279   | —          | max-lines             | 2    |
| components/auth/LocalOnlyModeSettings.tsx        | 369   | —          | max-lines             | 1    |
| components/auth/KeyManagementSettings.tsx        | 232   | —          | max-lines             | 2    |
| components/auth/LocalOnlySetup.tsx               | 258   | —          | max-lines             | 2    |
| components/ui/EditableBalance.tsx                | 190   | 19         | max-lines, complexity | 3    |
| **And 39 more component files...**               | —     | —          | —                     | —    |

### Hooks (40+ violations)

| File                                               | Lines | Complexity | Issues                           | Tier |
| -------------------------------------------------- | ----- | ---------- | -------------------------------- | ---- |
| hooks/analytics/useAnalytics.ts                    | 353   | —          | max-lines                        | 1    |
| hooks/analytics/useReportExporter.ts               | 299   | —          | max-lines + max-statements (67)  | 2    |
| hooks/budgeting/useEnvelopes.ts                    | 332   | —          | max-lines                        | 1    |
| hooks/budgeting/autofunding/useAutoFundingRules.ts | 296   | —          | max-lines                        | 2    |
| hooks/budgeting/autofunding/useAutoFunding.ts      | 274   | —          | max-lines                        | 2    |
| hooks/common/useBugReport.ts (refactored)          | Split | —          | ✅ RESOLVED (5 sub-hooks)        | 2    |
| hooks/auth/useKeyManagement.ts                     | 272   | —          | max-lines                        | 2    |
| hooks/auth/useUserSetup.ts                         | 269   | —          | max-lines + max-statements (26)  | 2    |
| hooks/debts/useDebtManagement.ts                   | 293   | —          | max-lines                        | 2    |
| hooks/transactions/useTransactionOperations.ts     | 278   | —          | max-lines                        | 2    |
| hooks/transactions/useTransactionLedger.ts         | 191   | —          | max-lines + max-statements (33)  | 3    |
| hooks/transactions/useTransactionData.ts           | 202   | —          | max-lines                        | 3    |
| hooks/transactions/useTransactionQuery.ts          | —     | 18         | max-statements (30) + complexity | 3    |
| hooks/bills/useBillForm.ts                         | 227   | 21 & 20    | max-lines, complexity (2×)       | 3    |
| hooks/bills/useBillManager.ts                      | 190   | —          | max-lines + max-statements (28)  | 3    |
| hooks/analytics/useAnalyticsData.ts                | 241   | —          | max-lines                        | 2    |
| hooks/analytics/usePerformanceMonitor.ts           | 249   | —          | max-lines                        | 2    |
| hooks/analytics/useAnalyticsIntegration.ts         | 193   | —          | max-lines + max-statements (27)  | 3    |
| hooks/accounts/useSupplementalAccounts.ts          | 205   | —          | max-lines                        | 3    |
| hooks/budgeting/autofunding/useAutoFundingData.ts  | 259   | —          | max-lines                        | 2    |
| **And 20+ more hook files...**                     | —     | —          | —                                | —    |

### Services & Utils (30+ violations)

| File                                         | Lines     | Complexity | Issues                                           | Tier |
| -------------------------------------------- | --------- | ---------- | ------------------------------------------------ | ---- |
| services/authService.ts                      | 200 & 190 | 36         | max-lines (3×), max-statements (66) + complexity | 1    |
| utils/sync/syncHealthChecker.ts              | 238       | 31         | max-lines + max-statements (84) + complexity     | 1    |
| utils/sync/syncFlowValidator.ts              | 249       | 16         | max-lines + max-statements (66) + complexity     | 1    |
| utils/budgeting/envelopeFormUtils.ts         | —         | 31 & 20    | max-statements (36) + complexity (2×)            | 1    |
| utils/budgeting/autofunding/rules.ts         | —         | 32 & 16    | complexity (2×)                                  | 1    |
| utils/budgeting/envelopeIntegrityChecker.ts  | —         | 20         | max-statements (37) + complexity                 | 1    |
| utils/common/billDiscovery.ts                | —         | 25         | max-statements (27) + complexity                 | 1    |
| utils/pwa/patchNotesManager.ts               | —         | 28         | max-statements (30) + complexity                 | 1    |
| utils/common/transactionArchiving.ts         | —         | —          | max-statements (28)                              | 1    |
| utils/debts/debtFormValidation.ts            | —         | 18         | complexity                                       | 2    |
| utils/debts/debtStrategies.ts                | —         | —          | max-statements (28)                              | 2    |
| utils/pwa/serviceWorkerDiagnostics.ts        | —         | —          | max-statements (29)                              | 2    |
| services/bugReport/apiService.ts             | —         | 19         | complexity                                       | 2    |
| services/bugReport/browserInfoService.ts     | —         | 19 & 20    | complexity (2×)                                  | 2    |
| services/bugReport/githubApiService.ts       | —         | 17         | complexity                                       | 2    |
| services/bugReport/performanceInfoService.ts | —         | 22         | complexity                                       | 2    |
| services/types/firebaseServiceTypes.ts       | —         | 34         | complexity                                       | 1    |
| utils/bills/billCalculations.ts              | —         | —          | max-statements (26)                              | 2    |
| hooks/budgeting/useBudgetData/mutations.ts   | —         | —          | max-depth (6) + max-statements (30)              | 2    |
| **And 11+ more utils...**                    | —         | —          | —                                                | —    |

### Summary by Directory (Current Status):

- **components/**: 55 violations (48% of 118 remaining) - 3 RESOLVED ✅
- **hooks/**: 39 violations (33% of 118 remaining) - 1 RESOLVED ✅
- **services/**: 15 violations (13% of 118 remaining)
- **utils/**: 16 violations (14% of 118 remaining)
- **Other**: 1 max-depth violation remaining

### Suggested Refactoring Order (by impact):

1. **Start with services/authService.ts** (5 violations, highest complexity)
2. **Then utils/sync/** (3 files, complex async logic)
3. **Then utils/budgeting/** (4 files, complex calculations)
4. **Then hooks/analytics/** (3 files, heavy data processing)
5. **Then components/** (systematically by tier)

---

**Last Updated:** Oct 20, 2025
**Status:** IN PROGRESS - 30% Complete (118/129 violations remain)
**Verified:** Actual lint check run + code inspection
**Real Progress:** 4/5 Tier 1 files done, 11 violations resolved
