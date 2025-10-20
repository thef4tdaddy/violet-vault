# Zustand Safe Patterns Fix Plan

## Executive Summary

**Total Issues:** Variable across 6 different patterns
**Root Cause:** Improper Zustand store usage patterns that can trigger React error #185
**Goal:** Enforce defensive patterns to prevent store-related React bugs
**Impact:** Prevents infinite loops, race conditions, and closure staling
**Estimated Time:** 3-5 hours total

---

## The Problem: React Error #185

Zustand can cause **React error #185** when:

1. Store operations execute during module load (auto-executing)
2. Store getState() called inside useEffect (bypasses subscriptions)
3. Store actions included in useEffect dependencies (creates circular deps)
4. Conditional subscriptions (component doesn't re-render when needed)
5. Server data stored in Zustand (breaks client/server boundary)

---

## Pattern 1: No Auto-Executing Store Calls

### The Issue

```typescript
// ❌ DANGEROUS - Executes during module load
const someValue = store.getState().value;
console.log(someValue);

// Or:
store.setState({ initialized: true }); // Auto-executes!
```

**Why It's Bad:**

- Runs before React renders
- Can cause initialization order bugs
- Zustand not fully initialized
- May execute multiple times during bundling

### The Fix

```typescript
// ✅ CORRECT - Execute in React lifecycle
export function MyComponent() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Now safely inside React
    const value = store.getState().value;
    store.setState({ initialized: true });
    setInitialized(true);
  }, []);

  return <div>{initialized && 'Ready'}</div>;
}

// OR - For initialization
export function initializeApp() {
  // Call this from App component or main.tsx
  store.setState({ initialized: true });
}
```

### Files Affected

- `src/main.tsx`: Line 245 - Auto-executing store call in module scope

---

## Pattern 2: No getState() in useEffect

### The Issue

```typescript
// ❌ WRONG - getState() creates stale closures
useEffect(() => {
  const state = store.getState();
  doSomething(state.value);
}, []); // State is stale!
```

**Why It's Bad:**

- `getState()` returns snapshot at that moment
- If store updates, effect still uses old data
- Closure becomes stale
- Should use subscription instead

### The Fix

```typescript
// ✅ CORRECT - Subscribe to changes
useEffect(() => {
  const handleChange = (state) => {
    doSomething(state.value);
  };

  // Subscribe returns unsubscribe function
  const unsubscribe = store.subscribe((state) => state.value, handleChange);

  return unsubscribe; // Cleanup
}, []);

// OR - Use hook directly
const value = useStore((state) => state.value);
useEffect(() => {
  doSomething(value);
}, [value]); // Now has proper dependency
```

---

## Pattern 3: Store Reference Pattern

### The Issue

```typescript
// ❌ WRONG - Storing store reference, causes stale closures
const useMyHook = () => {
  const store = useStore(); // Don't do this!

  useEffect(() => {
    console.log(store.value); // Stale!
  }, []);
};

// OR - Passing store as prop
function Component({ store }) {
  useEffect(() => {
    store.doSomething();
  }, [store]); // Dependencies break!
}
```

**Why It's Bad:**

- Store reference becomes stale
- Props change constantly if store is passed
- Causes unnecessary re-renders
- Prevents proper dependency tracking

### The Fix

```typescript
// ✅ CORRECT - Subscribe directly, no reference
useEffect(() => {
  const value = useStore.getState().value;
  // Do something once at mount
}, []);

// ✅ BETTER - Use selector hook
const value = useStore((state) => state.value);
useEffect(() => {
  doSomething(value);
}, [value]); // Proper dependency

// ✅ CORRECT - Don't pass store as prop
function Component({ id }) {
  const data = useStore((state) => state.data[id]);
  return <div>{data}</div>;
}
```

---

## Pattern 4: No Store Actions in Dependencies

### The Issue

```typescript
// ❌ WRONG - Store action in effect dependencies
const resetForm = useStore((state) => state.resetForm);

useEffect(() => {
  return () => resetForm(); // Cleanup
}, [resetForm]); // resetForm creates circular dependency!
```

**Why It's Bad:**

- Store actions are functions that change reference
- Including in dependencies = re-run on every store update
- Creates circular dependency: action → effect → action
- Effect runs too often

### The Fix

```typescript
// ✅ CORRECT - Don't depend on actions, use state
const reset = useStore((state) => state.reset); // The state flag
const doReset = useStore((state) => state.resetForm); // The function

useEffect(() => {
  if (reset) {
    // Effect runs when state changes, not function reference
    doReset();
  }
}, [reset]); // Depend on state, not action

// ✅ BEST - Use useCallback for stable action reference
const memoizedReset = useCallback(() => {
  store.getState().resetForm();
}, []);

useEffect(() => {
  return memoizedReset;
}, [memoizedReset]); // Now stable
```

---

## Pattern 5: No Conditional Subscriptions

### The Issue

```typescript
// ❌ WRONG - Conditionally subscribing
useEffect(() => {
  if (someCondition) {
    subscribe(store, ...); // Only subscribes sometimes!
  }
}, [someCondition]);

// Component doesn't re-render when store changes (if condition false)
```

**Why It's Bad:**

- Component may not re-render when needed
- Subscription lifecycle doesn't match render lifecycle
- Can miss important state changes
- Inconsistent component behavior

### The Fix

```typescript
// ✅ CORRECT - Always subscribe, conditionally use
useEffect(() => {
  // Always set up subscription
  const unsubscribe = store.subscribe(handleChange);
  return unsubscribe;
}, []); // Set up once

// Conditionally render based on state
if (!someCondition) {
  return null; // Render nothing if condition false
}

return <Content />;

// OR - Conditional in selector
const data = useStore((state) =>
  someCondition ? state.data : null
);

// Component re-renders, but data is null if condition false
```

---

## Pattern 6: No Server Data in Zustand

### The Issue

```typescript
// ❌ WRONG - Storing server data in Zustand
const store = create((set) => ({
  user: null,
  fetchUser: async (id) => {
    const response = await api.getUser(id);
    set({ user: response }); // Server data in store!
  },
}));
```

**Why It's Bad:**

- Server state should use TanStack Query/API cache
- Zustand is for UI state only
- Creates sync problems between server and client
- Breaks cache invalidation patterns
- Hard to reason about data flow

### The Fix

```typescript
// ✅ CORRECT - Use TanStack Query for server data
import { useQuery } from '@tanstack/react-query';

// Server state (TanStack Query)
const { data: user } = useQuery({
  queryKey: ['user', id],
  queryFn: () => api.getUser(id),
});

// UI state (Zustand) - only UI concerns
const store = create((set) => ({
  isModalOpen: false,
  selectedTab: 'profile',
  toggleModal: () => set(state => ({ isModalOpen: !state.isModalOpen })),
}));

// Usage
const isModalOpen = useStore(state => state.isModalOpen);
const { data: user } = useQuery(['user', id], ...);

return (
  <div>
    {isModalOpen && <Modal user={user} />}
  </div>
);
```

### Data Flow Architecture

```
Firebase (Cloud)
    ↓
Dexie (Local IndexedDB)
    ↓
TanStack Query (Server state cache) ← USE FOR: API data, sync state
    ↓
React Components
    ↑
Zustand (UI state only) ← USE FOR: Modals, form state, tabs
```

**Server Data Examples (Use TanStack Query):**

- User profile data
- Fetched bills, transactions, envelopes
- Sync data from Firebase
- API responses

**UI State Examples (Use Zustand):**

- Modal open/close
- Form errors
- Selected tab
- Sidebar collapsed state
- Theme preference

---

## Implementation Order

### Phase 1: Auto-Executing Calls (1-2 hours)

- Find all module-scope store operations
- Move to useEffect or initialization functions
- Most common: `src/main.tsx`

### Phase 2: getState() in useEffect (1-2 hours)

- Replace with proper subscriptions
- Use hook selectors instead
- Add proper dependencies

### Phase 3: Store References (1-2 hours)

- Remove store prop passing
- Use selectors in components
- Stabilize action references with useCallback if needed

### Phase 4: Action Dependencies (30-45 minutes)

- Remove actions from effect dependencies
- Depend on state instead
- Use useCallback for functions

### Phase 5: Conditional Subscriptions (30-45 minutes)

- Always subscribe, conditionally render
- Fix lifecycle mismatches
- Ensure re-renders happen

### Phase 6: Server Data Migration (2-4 hours)

- Audit store for server data
- Migrate to TanStack Query
- Update data flow

---

## Validation Checklist

For each pattern fix:

- [ ] **No console errors** - ESLint reports 0 violations
- [ ] **Correct behavior** - Component re-renders when expected
- [ ] **No stale data** - Effects use fresh state
- [ ] **Proper cleanup** - Subscriptions unsubscribed
- [ ] **Performance** - No infinite loops or excessive re-renders
- [ ] **Type safety** - TypeScript has no errors

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Mixing patterns

```typescript
// DON'T do this
const state = store.getState();
const subscription = store.subscribe(() => {
  const value = store.getState().value; // Mix of patterns!
});
```

### ❌ Mistake 2: Forgetting cleanup

```typescript
// DON'T do this
useEffect(() => {
  store.subscribe(handler); // Missing unsubscribe!
}, []);
```

### ❌ Mistake 3: Creating new functions in deps

```typescript
// DON'T do this
useEffect(() => {
  doSomething();
}, [() => store.getState()]); // New function each render!
```

### ✅ Correct approach

```typescript
// DO this
useEffect(() => {
  const unsubscribe = store.subscribe(handler);
  return unsubscribe; // Always cleanup
}, []); // Stable dependencies
```

---

## Files to Check

Look for these patterns in:

- `src/main.tsx` - Module-scope initialization
- `src/hooks/**/*.ts` - Custom hooks using Zustand
- `src/components/**/*.tsx` - Components accessing store
- `src/services/**/*.ts` - Services with store access

---

## Documentation References

- **ChastityOS Architecture**: `/docs/architecture/` - State management rules
- **Zustand Docs**: Selective subscriptions, store usage
- **React Guidelines**: useEffect dependencies, cleanup

---

## Quick Reference

| Pattern         | Issue                 | Fix                | Impact             |
| --------------- | --------------------- | ------------------ | ------------------ |
| Auto-executing  | Runs at module load   | Move to useEffect  | Prevents init bugs |
| getState()      | Stale closure         | Use subscription   | Fresh data         |
| Store reference | Circular dependencies | Use selectors      | Proper deps        |
| Action in deps  | Too many re-renders   | Depend on state    | Performance        |
| Conditional sub | Missed updates        | Always subscribe   | Correct renders    |
| Server in store | Wrong layer           | Use TanStack Query | Clean architecture |
