# Max-Lines & Complexity Refactor Plan

## Executive Summary

**Combined Issues: 107**

- `max-lines-per-function`: 71 instances (functions over 150 lines)
- `complexity`: 36 instances (cyclomatic complexity over 15)

**Root Cause:** Functions attempting to do too much, poorly separated concerns
**Approach:** Decompose into smaller, single-responsibility functions
**Estimated Time:** 20-30 hours (highest effort of all fixes)
**Strategic Value:** HIGH - Improves maintainability, testability, readability

---

## The Problem

### Current (Bad) Pattern:

```typescript
// ❌ 400+ line component with 50+ local variables and 20+ conditions
export function BugReportButton() {
  // 30 lines of state
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  // ... 20 more useState calls

  // 50 lines of data fetching
  useEffect(() => {
    // Complex async logic with error handling
    // Multiple nested conditions
  }, [dependencies]);

  // 80 lines of event handlers
  const handleSubmit = async () => {
    // Validation
    // API calls
    // State updates
    // Error handling
  };

  // 200+ lines of JSX
  return (
    <div>
      {isOpen && (
        <Modal>
          {step === 0 && <StepOne />}
          {step === 1 && <StepTwo />}
          {/* ... many more steps ... */}
        </Modal>
      )}
    </div>
  );
}

// Complexity: 45 (max allowed: 15)
// Lines: 400+ (max allowed: 150)
```

### Problems This Creates:

1. **Hard to test** - Can't test individual pieces
2. **Hard to maintain** - Changes affect multiple flows
3. **Prone to bugs** - Complex logic hidden in long function
4. **Hard to understand** - New developers need 30 minutes to read
5. **Reusability** - Can't reuse parts in other components

### Fixed (Good) Pattern:

```typescript
// ✅ Decomposed into focused units
// 1. Custom hooks for logic
export function useBugReportState() {
  // Logic for managing bug report state
}

// 2. Separate components for each step
function StepOne() { /* 30 lines */ }
function StepTwo() { /* 30 lines */ }
function StepThree() { /* 30 lines */ }

// 3. Modal wrapper component
function BugReportModal() {
  // Only handles modal presentation (50 lines)
}

// 4. Main component
export function BugReportButton() {
  // Simple 30-line component that composes pieces
  return <BugReportModal />;
}
```

---

## Root Cause Analysis

### Distribution by Category:

| Category                        | Count | Typical Size  | Main Issues                         |
| ------------------------------- | ----- | ------------- | ----------------------------------- |
| Components with long JSX        | 35    | 200-350 lines | Too many conditions in render       |
| Data fetching/mutation handlers | 20    | 150-250 lines | Multiple async operations bundled   |
| Complex validation logic        | 15    | 160-200 lines | Nested conditions, many branches    |
| Utility calculation functions   | 12    | 150-180 lines | Multiple algorithms in one function |
| Hook orchestration functions    | 15    | 150-300 lines | Too many sub-concerns               |
| Modal/form components           | 10    | 200-280 lines | Multi-step flows bundled            |

### Complexity Distribution:

| Complexity | Count | Typical Causes                 |
| ---------- | ----- | ------------------------------ |
| 15-20      | 15    | 5-7 if/else branches           |
| 20-30      | 12    | 10-15 conditions               |
| 30-50      | 7     | 20+ complex branches           |
| 50+        | 2     | 30+ conditions (sync services) |

---

## Top 20 Priority Files (Highest Impact)

### Tier 1: CRITICAL - 250+ lines AND complexity > 30 (5 files)

1. **src/components/feedback/BugReportButton.tsx**
   - Lines: 332
   - Complexity: Not specified but high
   - Issues: Multi-step form, validation, API calls
   - Extract: StepOne, StepTwo, StepThree components + useBugReportState hook

2. **src/components/budgeting/envelope/EnvelopeItem.tsx**
   - Lines: 307
   - Complexity: 21
   - Issues: Status display, actions, modal logic
   - Extract: EnvelopeStatusDisplay, EnvelopeActions as separate components

3. **src/hooks/common/useBugReportV2.ts**
   - Lines: 303
   - Complexity: High
   - Issues: Report gathering, validation, submission
   - Extract: useReportGathering, useReportValidation, useReportSubmission

4. **src/components/sync/SyncIndicator.tsx**
   - Lines: 287
   - Complexity: 46
   - Issues: Status calculation, display logic, handlers
   - Extract: useSyncStatus, SyncStatusDisplay, SyncActionButtons

5. **src/hooks/budgeting/useAutoFundingRules.ts**
   - Lines: 296
   - Complexity: High
   - Issues: Rule management, execution, validation
   - Extract: useRuleExecution, useRuleValidation

### Tier 2: HIGH - 200-250 lines AND/OR complexity 15-30 (15 files)

6. **src/components/analytics/ReportExporter.tsx** - 279 lines
7. **src/hooks/analytics/useReportExporter.ts** - 299 lines
8. **src/components/settings/sections/NotificationSettingsSection.tsx** - 230 lines
9. **src/components/history/IntegrityStatusIndicator.tsx** - 251 lines, complexity 20
10. **src/components/modals/UnassignedCashModal.tsx** - 242 lines, complexity 20
11. **src/components/settings/EnvelopeIntegrityChecker.tsx** - 345 lines
12. **src/hooks/auth/useKeyManagement.ts** - 272 lines
13. **src/components/budgeting/PaydayPrediction.tsx** - 171 lines
14. **src/components/bills/BillDiscoveryModal.tsx** - 313 lines
15. **src/components/history/ObjectHistoryViewer.tsx** - 199 lines
16. **src/hooks/transactions/useTransactionOperations.ts** - 278 lines
17. **src/components/layout/ViewRenderer.tsx** - 230 lines
18. **src/hooks/debts/useDebtManagement.ts** - 287 lines
19. **src/components/bills/modals/BillDetailModal.tsx** - 251 lines
20. **src/components/security/LockScreen.tsx** - 260 lines

---

## Refactoring Strategies

### Strategy A: Multi-Step Forms → Step Components

**When to use:** Forms with multiple steps, conditional rendering

**Before:**

```typescript
export function BugReportButton() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});

  return (
    <Modal>
      {step === 0 && (
        <div>
          {/* 50 lines of form fields for step 1 */}
        </div>
      )}
      {step === 1 && (
        <div>
          {/* 50 lines of form fields for step 2 */}
        </div>
      )}
      {/* ... more steps ... */}
    </Modal>
  );
}
```

**After:**

```typescript
// Separate component per step
function Step1({ formData, onChange }) {
  return <div>{/* 50 lines */}</div>;
}

function Step2({ formData, onChange }) {
  return <div>{/* 50 lines */}</div>;
}

// Main orchestrator
export function BugReportButton() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});

  const steps = [Step1, Step2, Step3];
  const CurrentStep = steps[step];

  return (
    <Modal>
      <CurrentStep formData={formData} onChange={setFormData} />
      <Navigation onNext={() => setStep(step + 1)} />
    </Modal>
  );
}
```

**Files to apply:** BugReportButton, BillDetailModal, etc.

---

### Strategy B: Data Fetching → Custom Hook

**When to use:** Async operations, API calls, data transformations

**Before:**

```typescript
export function DashboardComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 50 lines of fetching logic
    // 20 lines of error handling
    // 15 lines of transformation
    fetchData()
      .then(transform)
      .catch(handleError);
  }, [dependencies]);

  return <>{/* render data */}</>;
}
```

**After:**

```typescript
// Extract hook
function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Same 85 lines of logic
  }, [dependencies]);

  return { data, loading };
}

// Component becomes simple
export function DashboardComponent() {
  const { data, loading } = useDashboardData();
  return <>{/* render data */}</>;
}
```

**Files to apply:** Sync components, analytics, report generators

---

### Strategy C: Complex Conditions → Utility Functions

**When to use:** Complex decision logic, validation, calculations

**Before:**

```typescript
function processTransaction() {
  const isValid =
    amount > 0 &&
    recipient !== null &&
    account.balance >= amount &&
    account.type !== "readonly" &&
    !hasActiveBlock &&
    timestamp > startDate &&
    (!requiresApproval || isApproved) &&
    !isDuplicate;

  const category =
    transaction.type === "transfer" && transaction.from === transaction.to
      ? "self-transfer"
      : transaction.type === "payment" && transaction.recurring
        ? "recurring-payment"
        : transaction.type === "payment"
          ? "regular-payment"
          : "other";

  const priority = transaction.urgent
    ? "critical"
    : transaction.deadline && isOverdue(transaction.deadline)
      ? "high"
      : transaction.deadline
        ? "medium"
        : "low";

  // 20+ more conditions...
}
```

**After:**

```typescript
// Utility functions with clear intent
function isValidTransaction(transaction, account) {
  return (
    transaction.amount > 0 &&
    transaction.recipient !== null &&
    account.balance >= transaction.amount &&
    account.type !== "readonly" &&
    !transaction.hasActiveBlock &&
    transaction.timestamp > account.startDate &&
    (!transaction.requiresApproval || transaction.isApproved) &&
    !transaction.isDuplicate
  );
}

function categorizeTransaction(transaction) {
  if (transaction.type === "transfer" && transaction.from === transaction.to) {
    return "self-transfer";
  }
  if (transaction.type === "payment" && transaction.recurring) {
    return "recurring-payment";
  }
  // ...
}

function calculateTransactionPriority(transaction) {
  if (transaction.urgent) return "critical";
  if (transaction.deadline && isOverdue(transaction.deadline)) return "high";
  if (transaction.deadline) return "medium";
  return "low";
}

// Main function now simple and readable
function processTransaction(transaction, account) {
  if (!isValidTransaction(transaction, account)) return null;
  const category = categorizeTransaction(transaction);
  const priority = calculateTransactionPriority(transaction);
  // ...
}
```

**Files to apply:** Validation logic, calculations, categorization

---

### Strategy D: Event Handlers → Separate Functions

**When to use:** Multiple event handlers bundled in one component

**Before:**

```typescript
export function FormComponent() {
  const handleSubmit = async (e) => {
    // 40 lines
  };

  const handleChange = (field) => (e) => {
    // 20 lines
  };

  const handleValidation = (field) => {
    // 30 lines
  };

  const handleReset = () => {
    // 15 lines
  };

  const handleCancel = () => {
    // 10 lines
  };

  // Total component: 200+ lines
}
```

**After:**

```typescript
// Create handler module
export function FormComponent() {
  const { formData, setFormData } = useFormState();
  const handlers = useFormHandlers(formData, setFormData);

  return <Form data={formData} {...handlers} />;
}

// Extract to custom hook
function useFormHandlers(formData, setFormData) {
  return {
    handleSubmit: /* 40 lines */,
    handleChange: /* 20 lines */,
    handleValidation: /* 30 lines */,
    handleReset: /* 15 lines */,
    handleCancel: /* 10 lines */,
  };
}
```

**Files to apply:** Modal components, form components

---

### Strategy E: Status Display → Separate Component

**When to use:** Complex conditional rendering for status/states

**Before:**

```typescript
function SyncIndicator() {
  // 287 lines
  // 46 complexity

  return (
    <div>
      {status === 'syncing' && (
        // 30 lines of UI
      )}
      {status === 'synced' && (
        // 30 lines of UI
      )}
      {status === 'error' && (
        // 40 lines of UI
      )}
      {status === 'idle' && (
        // 20 lines of UI
      )}
      {/* ... more conditions ... */}
    </div>
  );
}
```

**After:**

```typescript
// Status display components
function SyncingStatus() { /* 30 lines */ }
function SyncedStatus() { /* 30 lines */ }
function ErrorStatus() { /* 40 lines */ }
function IdleStatus() { /* 20 lines */ }

// Main component
function SyncIndicator() {
  const status = useSyncStatus(); // Extract logic to hook

  const statusComponents = {
    syncing: SyncingStatus,
    synced: SyncedStatus,
    error: ErrorStatus,
    idle: IdleStatus,
  };

  const StatusComponent = statusComponents[status];
  return <StatusComponent />;
}
```

**Files to apply:** SyncIndicator, IntegrityStatusIndicator, status displays

---

## Implementation Plan (Phases)

### Phase 1: Preparation (2-3 hours)

- [ ] Read this entire plan
- [ ] Review target files
- [ ] Create feature branch: `refactor/reduce-complexity`
- [ ] Understand current component logic
- [ ] Plan extraction strategy per file

### Phase 2: Tier 1 Refactoring (6-8 hours) - CRITICAL FILES

**Day 1:**

- [ ] BugReportButton.tsx - Extract steps + hooks
- [ ] SyncIndicator.tsx - Extract status components
- [ ] Test & commit

**Day 2:**

- [ ] EnvelopeItem.tsx - Extract status/actions
- [ ] useBugReportV2.ts - Extract concern hooks
- [ ] Test & commit

**Day 3:**

- [ ] useAutoFundingRules.ts - Extract logic
- [ ] Test & commit

### Phase 3: Tier 2 Refactoring (10-15 hours) - HIGH PRIORITY

- Batch 1: Analytics components (ReportExporter, useReportExporter)
- Batch 2: Settings components (NotificationSettings, EnvelopeIntegrityChecker)
- Batch 3: History/Status components (IntegrityStatusIndicator, ObjectHistoryViewer)
- Batch 4: Modal components (UnassignedCashModal, BillDetailModal)
- Batch 5: Hook files (useKeyManagement, useDebtManagement, useTransactionOperations)

### Phase 4: Testing & Validation (3-4 hours)

- [ ] Run full test suite
- [ ] Manual testing of affected features
- [ ] Performance check
- [ ] Lint verification: 0 violations
- [ ] TypeScript: 0 errors

### Phase 5: Final Cleanup (1-2 hours)

- [ ] Commit final batch
- [ ] Create PR with summary
- [ ] Document extracted components/hooks

---

## Refactoring Checklist Per File

For each file to refactor:

1. **Preparation**
   - [ ] Read entire file
   - [ ] Identify concerns/sections
   - [ ] Plan extraction strategy
   - [ ] Create branch if needed

2. **Extraction**
   - [ ] Create new hook/component files
   - [ ] Move logic out of original file
   - [ ] Import extracted components/hooks
   - [ ] Remove dead code

3. **Testing**
   - [ ] Run component in isolation
   - [ ] Test all user interactions
   - [ ] Check console for errors/warnings
   - [ ] Run lint: `npm run lint`
   - [ ] Run tests: `npm run test`

4. **Validation**
   - [ ] Lines: < 150 per function
   - [ ] Complexity: < 15
   - [ ] Clear, single responsibility
   - [ ] Reusable components extracted
   - [ ] No duplication introduced

5. **Commit**
   - [ ] Format with Prettier
   - [ ] Git add changes
   - [ ] Write clear commit message
   - [ ] Push branch

---

## Key Principles

1. **Single Responsibility**
   - Each component/function does ONE thing well
   - Each hook manages ONE concern
   - Each utility solves ONE problem

2. **Composability**
   - Extract reusable pieces
   - Build complex UIs from simple blocks
   - Easier to test, maintain, reuse

3. **Readability**
   - Function name describes what it does
   - Logic is easy to follow
   - Comments unnecessary if code is clear

4. **Testability**
   - Small functions are easy to unit test
   - Hooks can be tested in isolation
   - Mock dependencies easier

5. **Performance**
   - Smaller components = easier to memoize
   - Re-renders only when needed
   - Better cache hit rates

---

## Expected Outcomes

### Before:

```
71 × max-lines-per-function warnings
36 × complexity warnings
Difficulty: Hard to understand, test, maintain
```

### After:

```
0 × max-lines-per-function warnings
0 × complexity warnings
Difficulty: Easy to understand, test, extend
Bonus: Code is more reusable and performant
```

---

## Files Rank-Ordered by Priority

1. BugReportButton.tsx (332 lines)
2. SyncIndicator.tsx (287 lines, complexity 46)
3. EnvelopeItem.tsx (307 lines, complexity 21)
4. useBugReportV2.ts (303 lines)
5. useAutoFundingRules.ts (296 lines)
6. useReportExporter.ts (299 lines)
7. EnvelopeIntegrityChecker.tsx (345 lines)
8. useKeyManagement.ts (272 lines)
9. BillDiscoveryModal.tsx (313 lines)
10. ReportExporter.tsx (279 lines)
11. useTransactionOperations.ts (278 lines)
12. useDebtManagement.ts (287 lines)
13. BillDetailModal.tsx (251 lines)
14. IntegrityStatusIndicator.tsx (251 lines, complexity 20)
15. UnassignedCashModal.tsx (242 lines, complexity 20)
16. LockScreen.tsx (260 lines)
17. ViewRenderer.tsx (230 lines)
18. NotificationSettingsSection.tsx (230 lines)
19. ObjectHistoryViewer.tsx (199 lines)
20. PaydayPrediction.tsx (171 lines)

---

## Notes for Implementation

1. **Don't be afraid to create new files**
   - Better to have 10 files with 30 lines each than 1 with 300 lines
   - Clear structure > fewer files

2. **Use descriptive names**
   - `useFormValidation` > `useForm`
   - `SyncingStatus` > `Status`
   - `calculatePriority` > `calc`

3. **Group related extractions**
   - If extracting 5 step components, create `steps/` directory
   - If extracting 3 utility functions, create `utils.ts`

4. **Keep test files with components**
   - `Component.tsx` + `Component.test.tsx`
   - `useHook.ts` + `useHook.test.ts`

5. **Document complex logic**
   - Comment why, not what
   - Use JSDoc for public functions
   - Examples: "This handles circular dependencies"
