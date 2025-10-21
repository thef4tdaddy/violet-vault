# React Hooks exhaustive-deps Fix Plan

## Executive Summary

**Total Issues: 17** across components and hooks
**Pattern:** Missing dependencies in useEffect/useCallback dependency arrays
**Root Cause:** Functions/variables used in effect but not listed in dependencies
**Risk Level:** HIGH - Can cause stale closures, missed updates, memory leaks
**Estimated Time:** 2-3 hours total (≈ 10 minutes per file)

---

## The Problem

### Current (Bad) Pattern:

```typescript
// ❌ Function defined outside, used in effect, but not in deps array
const validateShareCode = async (code) => {
  // validation logic
};

export function JoinBudgetModal() {
  useEffect(() => {
    validateShareCode(inputCode); // Uses validateShareCode
  }, []); // ❌ Missing dependency! Will use stale version
}
```

### The Issue:

- Effects use variables/functions but don't declare them in dependency array
- Effect runs with stale closure (old version of variables)
- Can cause: missed updates, wrong data, infinite loops, memory leaks
- React warning: "missing dependency in useEffect"

### Fixed (Good) Pattern:

```typescript
// ✅ Option 1: Add to dependency array
useEffect(() => {
  validateShareCode(inputCode);
}, [validateShareCode, inputCode]); // ✅ All deps listed

// ✅ Option 2: Move inside effect
useEffect(() => {
  const validateShareCode = async (code) => {
    // validation logic
  };
  validateShareCode(inputCode);
}, [inputCode]); // ✅ Only real external deps

// ✅ Option 3: Wrap in useCallback
const validateShareCode = useCallback(async (code) => {
  // validation logic
}, []); // Declare where it's defined

useEffect(() => {
  validateShareCode(inputCode);
}, [validateShareCode, inputCode]);
```

---

## Root Cause Analysis

### Distribution by Type:

| Missing Dependency | Count | Files                                                   | Severity |
| ------------------ | ----- | ------------------------------------------------------- | -------- |
| Function reference | 8     | `useConfirm`, `usePrompt`, `useFABActions`              | CRITICAL |
| State setter       | 5     | `setShowAddNewPayer`, `setOnlineStatus`, `setExpanded`  | HIGH     |
| Callback/handler   | 3     | `handleSharedContent`, `resetValidation`, `getProgress` | HIGH     |
| Computed value     | 1     | `updateBiweeklyAllocations`                             | MEDIUM   |

### Common Patterns:

1. **Callback/Handler Missing:**

   ```typescript
   const resetForm = () => {
     /* ... */
   };
   useEffect(() => {
     resetForm(); // Missing resetForm in deps
   }, []);
   ```

2. **State Setter Missing:**

   ```typescript
   const [status, setStatus] = useState();
   useEffect(() => {
     setStatus("online"); // Missing setStatus
   }, []);
   ```

3. **Function Parameter Missing:**

   ```typescript
   function useCustom(onComplete) {
     useEffect(() => {
       doSomething(onComplete); // Missing onComplete
     }, []);
   }
   ```

4. **Derived Value Missing:**
   ```typescript
   const filteredItems = useMemo(() => [...], [items]);
   useEffect(() => {
     processItems(filteredItems); // Missing filteredItems
   }, []);
   ```

---

## File-by-File Breakdown (17 Instances)

### CRITICAL - Function References (8 instances)

1. **`src/components/bills/AddBillModal.tsx`**
   - Line 102
   - Missing: `resetForm` in useEffect deps
   - Used: `resetForm()` is called in effect
   - Fix: Add `resetForm` to deps OR move inside effect

2. **`src/components/sharing/JoinBudgetModal.tsx`**
   - Line 43: Missing `validateShareCode`
   - Line 54: Missing `resetValidation`
   - Used: Both called in effects
   - Fix: Add both to respective dependency arrays

3. **`src/hooks/common/useFABActions.ts`**
   - Line 40: Missing `registerPrimaryAction`, `unregisterPrimaryAction`
   - Line 58: Missing `registerSecondaryAction`, `unregisterSecondaryAction`
   - Line 63: Missing `setVisibility`
   - Line 79: Missing `setDefaultActionHandler`
   - Line 95: Missing `setCurrentScreen`
   - Complex: FAB store operations, multiple handlers
   - Fix: Either add all to deps or useCallback for stability

4. **`src/hooks/common/useNetworkStatus.ts`**
   - Line 39: Missing `setOnlineStatus`
   - Used: `setOnlineStatus('online')` in effect
   - Fix: Add to deps (usually safe for setState)

5. **`src/components/onboarding/OnboardingTutorial.tsx`**
   - Line 52: Missing `getProgress`
   - Used: Fetches progress in effect
   - Fix: Add to deps or wrap in useCallback

6. **`src/components/pwa/ShareTargetHandler.tsx`**
   - Line 23: Missing `handleSharedContent`
   - Used: Called when shared content arrives
   - Fix: Add to deps or define with useCallback

7. **`src/components/budgeting/usePaycheckForm.ts`** (Hook)
   - Line 16: Missing `setShowAddNewPayer`
   - Fix: Add to deps (setState is usually stable)

8. **`src/hooks/mobile/useFABBehavior.ts`**
   - Line 83: Missing `setExpanded`
   - Fix: Add to deps

### FUNCTION PARAMETERS (3 instances)

9. **`src/components/notifications/useFirebaseMessaging.ts`**
   - Line 145: Missing `updatePermissionStatus`
   - Context: Hook parameter passed from parent
   - Fix: Add to deps or useCallback wrap

10. **`src/components/budgeting/EnvelopeSystem.tsx`**
    - Line 126: Missing `updateBiweeklyAllocations`
    - Context: Effect updates envelope state
    - Fix: Add to deps

11. **`src/components/budgeting/useEnvelopes.ts`** (Hook)
    - Missing dependency (exact line TBD)
    - Fix: Add missing callback/handler

### COMPLEX INTERDEPENDENCIES (6 instances)

12. **`src/components/auth/LocalOnlyModeSettings.tsx`**
    - Line 55: Missing `getStats`
    - Line 65: Missing `clearError`
    - Context: Two separate effects with missing deps
    - Fix: Add both to respective arrays

13. **`src/hooks/budgeting/usePaycheckProcessor.ts`**
    - Additional validation function dependency
    - Fix: Add validation function to deps

14-17. **Other hooks/components** with similar patterns

---

## Implementation Strategy

### Phase 1: Analysis (Identify Root Cause per File)

For each of the 17 instances, determine:

1. **What's missing?** - Function, setState, callback?
2. **Where's it defined?** - Parent component, hook param, same file?
3. **How's it used?** - Called? Passed? Condition check?
4. **Best fix?** - Add to deps, move inside, or useCallback wrap?

### Phase 2: Categorize by Fix Type

**Category A: Safe to Add to Deps (6 files)**

- setState functions (usually stable)
- Simple callbacks from props
- **Strategy:** Just add to array

```typescript
// BEFORE
useEffect(() => {
  setOnlineStatus("online");
}, []);

// AFTER
useEffect(() => {
  setOnlineStatus("online");
}, [setOnlineStatus]); // or just leave empty [], setState is stable
```

**Category B: Need useCallback Wrapper (5 files)**

- Complex functions defined in component
- Functions called multiple times
- **Strategy:** useCallback(fn, deps) then add to effect deps

```typescript
// BEFORE
const resetForm = () => {
  // ... 10 lines of logic
};
useEffect(() => {
  resetForm();
}, []); // ❌ Missing

// AFTER
const resetForm = useCallback(
  () => {
    // ... 10 lines of logic
  },
  [
    /* deps of resetForm */
  ]
);

useEffect(() => {
  resetForm();
}, [resetForm]); // ✅ Now safe
```

**Category C: Move Inside Effect (4 files)**

- Utility functions that don't need to be component-scoped
- Functions only used in one effect
- **Strategy:** Move function definition into effect

```typescript
// BEFORE
const validateInput = (value) => value.length > 0;
useEffect(() => {
  if (validateInput(inputCode)) {
    // ...
  }
}, []); // ❌ Missing

// AFTER
useEffect(() => {
  const validateInput = (value) => value.length > 0;
  if (validateInput(inputCode)) {
    // ...
  }
}, [inputCode]); // ✅ No external deps
```

**Category D: Complex - Multiple Effects (2 files)**

- Multiple useEffects with different missing deps
- Interdependent state updates
- **Strategy:** Handle each effect separately

```typescript
// BEFORE
const getStats = async () => {
  /* ... */
};
const clearError = () => {
  /* ... */
};

useEffect(() => {
  getStats(); // Missing
}, []);

useEffect(() => {
  clearError(); // Missing
}, []);

// AFTER
useEffect(() => {
  getStats();
}, [getStats]); // Add getStats

useEffect(() => {
  clearError();
}, [clearError]); // Add clearError
```

---

## Fix Patterns by Scenario

### Pattern 1: Missing Function Parameter

```diff
// BEFORE
function useCustom(onComplete) {
  useEffect(() => {
    fetchData().then(onComplete);
-  }, []);
+  }, [onComplete]);
}

// AFTER
function useCustom(onComplete) {
  useEffect(() => {
    fetchData().then(onComplete);
  }, [onComplete]); // ✅ Now onComplete is in deps
}
```

### Pattern 2: setState Missing (Usually not needed)

```diff
// BEFORE
const [status, setStatus] = useState(false);
useEffect(() => {
  api.check().then(() => setStatus(true));
- }, []);
+ }, []); // ✅ setState is stable, usually safe to omit

// AFTER - If concerned, wrap in useCallback
const handleStatusUpdate = useCallback(() => {
  setStatus(true);
}, []); // setState is stable reference

useEffect(() => {
  api.check().then(handleStatusUpdate);
}, [handleStatusUpdate]);
```

### Pattern 3: Complex Function in Component

```diff
// BEFORE
export function MyComponent() {
  const resetForm = () => {
    setInput('');
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    resetForm();
-  }, []);
+  }, [resetForm]); // ❌ Still missing, resetForm will change on every render

// AFTER
export function MyComponent() {
  const resetForm = useCallback(() => {
    setInput('');
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    resetForm();
  }, [resetForm]); // ✅ Now resetForm is stable
}
```

### Pattern 4: Async Handler

```diff
// BEFORE
const handleSharedContent = async (data) => {
  const result = await processContent(data);
  setProcessed(result);
};

useEffect(() => {
  window.addEventListener('share', handleSharedContent);
- }, []);
+ }, [handleSharedContent]); // ❌ Will re-attach listener on every render

// AFTER
const handleSharedContent = useCallback(async (data) => {
  const result = await processContent(data);
  setProcessed(result);
}, []);

useEffect(() => {
  window.addEventListener('share', handleSharedContent);
  return () => window.removeEventListener('share', handleSharedContent);
}, [handleSharedContent]); // ✅ Stable, proper cleanup
```

---

## Validation Checklist

After fixing each file:

- [ ] **No more warnings:** `npm run lint` shows 0 warnings for this file
- [ ] **Logic unchanged:** Component behaves the same
- [ ] **No infinite loops:** Effects don't cause recursive updates
- [ ] **Proper cleanup:** addEventListener/subscriptions cleaned up
- [ ] **Closure correct:** Effect captures right values at right time
- [ ] **Types correct:** No TypeScript errors introduced

---

## Testing Strategy

### Per File:

1. Run component with dev tools open
2. Verify useEffect runs at expected times
3. Check that effect captures current values (not stale)
4. Test interactions that trigger the effect
5. Look for console warnings/errors

### Integration:

- Test modals open/close correctly
- Test form resets work
- Test async operations complete
- Test cleanup (no memory leaks)

---

## Quick Reference Table

| File                      | Missing Dep               | Type     | Line | Fix Strategy            |
| ------------------------- | ------------------------- | -------- | ---- | ----------------------- |
| AddBillModal.tsx          | resetForm                 | callback | 102  | useCallback             |
| JoinBudgetModal.tsx       | validateShareCode         | function | 43   | useCallback             |
| JoinBudgetModal.tsx       | resetValidation           | callback | 54   | Add to deps             |
| useFABActions.ts          | multiple handlers         | multiple | 40+  | useCallback per handler |
| useNetworkStatus.ts       | setOnlineStatus           | setState | 39   | Add to deps             |
| OnboardingTutorial.tsx    | getProgress               | callback | 52   | Add to deps             |
| ShareTargetHandler.tsx    | handleSharedContent       | handler  | 23   | useCallback             |
| usePaycheckForm.ts        | setShowAddNewPayer        | setState | 16   | Add to deps             |
| useFABBehavior.ts         | setExpanded               | setState | 83   | Add to deps             |
| useFirebaseMessaging.ts   | updatePermissionStatus    | param    | 145  | Add to deps             |
| EnvelopeSystem.tsx        | updateBiweeklyAllocations | function | 126  | Add to deps             |
| LocalOnlyModeSettings.tsx | getStats                  | callback | 55   | useCallback             |
| LocalOnlyModeSettings.tsx | clearError                | callback | 65   | useCallback             |
| usePaycheckProcessor.ts   | validation fn             | function | TBD  | useCallback             |
| useEnvelopes.ts           | callback                  | callback | TBD  | Add to deps             |
| useConfirm.ts             | handler                   | callback | TBD  | Add to deps             |
| usePrompt.ts              | handler                   | callback | TBD  | Add to deps             |

---

## Implementation Order (by Impact)

### Priority 1: Multi-Effect Files (Fix All at Once)

- `LocalOnlyModeSettings.tsx` (2 effects)
- `useFABActions.ts` (5 effects)
- `JoinBudgetModal.tsx` (2 effects)

### Priority 2: Complex Handlers

- `ShareTargetHandler.tsx`
- `OnboardingTutorial.tsx`
- `AddBillModal.tsx`

### Priority 3: Simple State Setters

- `useFABBehavior.ts`
- `useNetworkStatus.ts`
- `usePaycheckForm.ts`

### Priority 4: Function Parameters

- `useFirebaseMessaging.ts`
- `EnvelopeSystem.tsx`
- Remaining hooks

---

## Notes for Implementation

1. **useCallback is often better than adding functions to deps**
   - Functions recreated on every render otherwise
   - Makes dependency array grow unbounded
   - Signals intent: "this function should be stable"

2. **setState is usually stable** (safe to omit from deps)
   - React guarantees same reference
   - But can add for clarity if desired

3. **Test before/after behavior carefully**
   - Stale closures can be subtle bugs
   - Effect not running when it should
   - Effect running when it shouldn't

4. **Cleanup is important**
   - addEventListener → removeEventListener
   - Subscriptions → unsubscribe
   - Timers → clearTimeout/clearInterval

5. **Document why if deps are intentionally omitted**
   - Comment: `// setState is stable reference`
   - Or: `// Intentionally empty - one-time setup`
