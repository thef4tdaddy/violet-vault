# Zustand Selective Subscriptions Fix Plan

## Executive Summary

**Total Issues: 42** across components and hooks
**Pattern:** Improper store subscriptions causing unnecessary re-renders
**Solution:** Replace whole-store subscriptions with selective property subscriptions
**Performance Impact:** Significant - prevents re-renders when unrelated store properties change
**Estimated Time:** 4-6 hours total (≈ 7 minutes per file)

---

## The Problem

### Current (Bad) Pattern:

```typescript
// ❌ Subscribes to ENTIRE store - causes re-render on ANY property change
const { modalOpen, sidebarOpen, theme, loading, notifications } = useUIStore();

// Component re-renders when ANY of these change, even if only using one or two
```

### The Issue:

- When **any** property in `useUIStore` changes, components subscribed to the whole store re-render
- Example: If loading state changes, but component only uses `theme`, it still re-renders
- With 42 instances × multiple components = massive performance degradation
- This violates React error #185 prevention patterns

### Fixed (Good) Pattern:

```typescript
// ✅ Selective subscription - only re-render on specific property changes
const modalOpen = useUIStore((state) => state.modalOpen);
const sidebarOpen = useUIStore((state) => state.sidebarOpen);
const theme = useUIStore((state) => state.theme);
// Component only re-renders if these specific properties change
```

---

## Root Cause Analysis

### Where These Occur:

| Category   | Count | Files                                     |
| ---------- | ----- | ----------------------------------------- |
| Components | 28    | Most UI components using `useUIStore()`   |
| Hooks      | 11    | Utility hooks, FAB actions, tutorialsteps |
| Services   | 2     | Service initialization files              |
| Utilities  | 1     | Toast helpers                             |

### Pattern Distribution:

1. **Full Store Subscription (Most Common):**

   ```typescript
   const uiState = useUIStore(); // Then access: uiState.property
   // OR
   const { prop1, prop2, prop3 } = useUIStore();
   ```

2. **Partial Destructuring (Less Common):**

   ```typescript
   const { showModal } = useUIStore(); // Still getting whole store in selector
   ```

3. **Already Selective (Rare):**
   ```typescript
   const showModal = useUIStore((state) => state.showModal); // ✅ Already good
   ```

---

## Implementation Strategy

### Phase 1: Analysis (Document Current State)

1. ✅ Identify all 42 instances from lint report
2. ✅ Categorize by component type
3. ✅ Map dependencies per file
4. ✅ Create fix list with before/after patterns

### Phase 2: Batch Fixes (7 files at a time)

**Batch 1 - Core Components (7 files):**

- `EnvelopeGrid.tsx` - Uses 6+ properties
- `EnvelopeSummaryCards.tsx` - Uses 2-3 properties
- `MainLayout.tsx` - Uses 2-3 properties
- `SyncHealthDashboard.tsx` - Uses multiple state props
- `PatchNotesModal.tsx` - Uses modal state
- `BudgetHistoryViewer.tsx` - Uses modal/filter state
- `UnassignedCashModal.tsx` - Uses modal state

**Batch 2 - Modal/Form Components (7 files):**

- `CreateEnvelopeModal.tsx`
- `EditEnvelopeModal.tsx`
- `AutoFundingDashboard.tsx`
- `AutoFundingView.tsx`
- `OnboardingProgress.tsx`
- `OnboardingTutorial.tsx`
- `OnboardingEmptyStateHints.tsx`

**Batch 3 - Hooks (7 files):**

- `useFABActions.ts` - Multiple FAB states
- `useTutorialSteps.ts` - Tutorial modal state
- `useTutorialControls.ts` - Tutorial state
- `useAnalytics.ts` - Analytics state
- `useAutoFunding.ts` - Auto-funding state
- `useAutoFundingExecution.ts` - Execution state
- `useAutoFundingRules.ts` - Rules state

**Batch 4 - Remaining Components (7 files):**

- `ActivityBanner.tsx`
- `OfflineStatusIndicator.tsx`
- `ShareTargetHandler.tsx`
- `Confirm/Prompt hooks`
- Other utility hooks

**Batch 5 - Final Batch (14 files):**

- All remaining instances

### Phase 3: Testing

1. Run `npm run lint` to verify fixes
2. Check that selective subscriptions removed all warnings
3. Manual testing of affected components

---

## Fix Strategy by File Type

### Strategy A: Components with Destructuring

**Before:**

```typescript
// src/components/sync/SyncHealthDashboard.tsx
const { isOnboarded, showDebug, debugMode, lastLogKey } = useUIStore();

// Uses all 4 properties throughout component
useEffect(() => {
  if (isOnboarded) { ... }
  if (showDebug && debugMode) { ... }
}, [isOnboarded, showDebug, debugMode, lastLogKey]);
```

**After:**

```typescript
// src/components/sync/SyncHealthDashboard.tsx
const isOnboarded = useUIStore(state => state.isOnboarded);
const showDebug = useUIStore(state => state.showDebug);
const debugMode = useUIStore(state => state.debugMode);
const lastLogKey = useUIStore(state => state.lastLogKey);

// Selective dependencies in useEffect
useEffect(() => {
  if (isOnboarded) { ... }
  if (showDebug && debugMode) { ... }
}, [isOnboarded, showDebug, debugMode, lastLogKey]);
```

### Strategy B: Components with Whole Store Reference

**Before:**

```typescript
// src/components/budgeting/EnvelopeGrid.tsx
const uiState = useUIStore();

// Later: uiState.showModal, uiState.editingId, etc.
if (uiState.showModal) { ... }
const editing = uiState.editingId;
```

**After:**

```typescript
// src/components/budgeting/EnvelopeGrid.tsx
const showModal = useUIStore(state => state.showModal);
const editingId = useUIStore(state => state.editingId);

// Direct variable access
if (showModal) { ... }
const editing = editingId;
```

### Strategy C: Hooks with Selective Logic

**Before:**

```typescript
// src/hooks/common/useFABActions.ts
const { visibility, primaryAction, secondaryActions } = useUIStore();

useEffect(() => {
  // Only depends on visibility
  console.log(visibility);
}, []);
```

**After:**

```typescript
// src/hooks/common/useFABActions.ts
const visibility = useUIStore((state) => state.visibility);
// Don't subscribe to primaryAction/secondaryActions if not used

useEffect(() => {
  console.log(visibility);
}, [visibility]); // Now only re-runs on visibility change
```

---

## Common Patterns to Find & Replace

### Pattern 1: Destructured Imports

```diff
- const { modalOpen, sidebarOpen, theme } = useUIStore();
+ const modalOpen = useUIStore(state => state.modalOpen);
+ const sidebarOpen = useUIStore(state => state.sidebarOpen);
+ const theme = useUIStore(state => state.theme);
```

### Pattern 2: Whole Store Reference

```diff
- const uiStore = useUIStore();
- if (uiStore.showModal) { ... }
+ const showModal = useUIStore(state => state.showModal);
+ if (showModal) { ... }
```

### Pattern 3: Multiple Property Accesses

```diff
- const state = useUIStore();
- return state.prop1 + state.prop2 + state.prop3;
+ const prop1 = useUIStore(s => s.prop1);
+ const prop2 = useUIStore(s => s.prop2);
+ const prop3 = useUIStore(s => s.prop3);
+ return prop1 + prop2 + prop3;
```

---

## Properties in useUIStore

(From lint warnings and code patterns, commonly used properties)

```typescript
// Modal/UI Visibility
-showModal / modalOpen -
  isOpen / open -
  visible / visibility -
  // Editing State
  editingId / editingEnvelope -
  selectedId / currentSelection -
  editingItem -
  // UI Theme/Display
  theme / darkMode / sidebarOpen -
  debugMode / showDebug / showDetails -
  // Form State
  formData / formErrors -
  selectedTab / activeTab -
  // Navigation
  currentView / viewMode -
  lastLogKey -
  // Notifications/Alerts
  showNotification / notification -
  toasts(array);
```

---

## File-by-File Breakdown (42 Instances)

### HIGH PRIORITY (Most Properties Used)

1. **EnvelopeGrid.tsx** - 2 instances (uses 5+ properties)
2. **EnvelopeSummaryCards.tsx** - 1 instance (uses 2+ properties)
3. **SyncHealthDashboard.tsx** - 1 instance (uses 4+ properties)
4. **BudgetHistoryViewer.tsx** - 2 instances (uses modal + history state)

### MEDIUM PRIORITY (3-4 Properties)

5. **AutoFundingDashboard.tsx** - 2 instances
6. **AutoFundingView.tsx** - 2 instances
7. **MainLayout.tsx** - 1 instance
8. **CreateEnvelopeModal.tsx** - Not in 42 but related
9. **PatchNotesModal.tsx** - 1 instance
10. **UnassignedCashModal.tsx** - 2 instances

### COMPONENTS/HOOKS (1-2 Properties)

- **useFABActions.ts** - 5 instances (FAB visibility/actions)
- **useTutorialSteps.ts** - 1 instance
- **useTutorialControls.ts** - 1 instance
- **useAnalytics.ts** - 1 instance
- **useAutoFunding.ts** - 2 instances
- Plus 20+ more single-property accesses

### SPECIAL CASES

- **onboarding/hooks/** - Tutorial state (3 instances)
- **auth/** - Security manager state (1 instance)
- **settings/** - Settings state (multiple)

---

## Validation Criteria

After fixing, verify:

1. ✅ **Lint:** `npm run lint` shows 0 `zustand-selective-subscriptions` warnings
2. ✅ **Syntax:** No TypeScript errors introduced
3. ✅ **Logic:** Component behavior unchanged
4. ✅ **Dependencies:** useEffect/useCallback dependencies align with subscriptions
5. ✅ **Performance:** Components only re-render when subscribed properties change

---

## Implementation Checklist

### Pre-Implementation

- [ ] Read this plan
- [ ] Understand selective subscriptions concept
- [ ] Run current lint to baseline: `npm run lint | grep zustand-selective`

### Per File

- [ ] Identify all `useUIStore()` calls
- [ ] Map which properties are actually used
- [ ] Replace with selective subscriptions
- [ ] Update useEffect dependencies
- [ ] Test component behavior
- [ ] Format with Prettier

### Post-Implementation

- [ ] Run full lint check
- [ ] Verify 42 warnings reduced to 0
- [ ] Commit batch fixes
- [ ] Test in browser/functionality

---

## Expected Outcomes

### Before Fixes:

```
42 × zustand-safe-patterns/zustand-selective-subscriptions warnings
Performance: High re-render churn in modals, components
```

### After Fixes:

```
0 × zustand-safe-patterns/zustand-selective-subscriptions warnings
Performance: Minimal re-renders, only on relevant state changes
Better cache hit rates in React fiber scheduler
```

---

## Related Documentation

- **Pattern:** ChastityOS v4.0.0 Zustand state management rules
- **Issue:** React error #185 prevention (auto-executing store calls)
- **Performance:** Selective subscriptions prevent unnecessary re-renders
- **Guide:** `docs/development/architecture/data-flow.md`

---

## Quick Reference: Before/After Template

```typescript
// ============================================
// BEFORE (❌ Causes unnecessary re-renders)
// ============================================
import { useUIStore } from '@/stores';

export function MyComponent() {
  const { prop1, prop2, prop3 } = useUIStore();

  return <div>{prop1}</div>;
}

// ============================================
// AFTER (✅ Selective subscription)
// ============================================
import { useUIStore } from '@/stores';

export function MyComponent() {
  const prop1 = useUIStore(state => state.prop1);

  return <div>{prop1}</div>;
}
```

---

## Notes for Implementation

1. **Don't Change Store Definition** - Only fix consumption (subscriber side)
2. **Maintain Variable Names** - Keep refactoring minimal, focus on selector pattern
3. **Test Interactions** - Some components may have subtle dependencies
4. **Watch useEffect Deps** - Update dependency arrays to match new subscriptions
5. **Commit per Batch** - Group fixes: "Fix zustand subscriptions: Batch 1 - EnvelopeComponents"
