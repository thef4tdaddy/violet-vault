# ESLint Zustand Safety Rules

## Overview

This document describes the custom ESLint rules designed to prevent React error #185 and enforce safe Zustand store patterns in VioletVault.

## 🚨 Why These Rules Exist

The React error #185 ("Maximum update depth exceeded") was caused by unsafe Zustand store patterns. These rules prevent those patterns and enforce best practices.

## Rules Reference

### 1. `zustand-no-get-in-actions` ⚠️ **CRITICAL**

**Purpose**: Prevent `get()` calls inside Zustand store actions to avoid React error #185.

**Level**: `warn` (will become `error` after store refactors)

#### ❌ Bad - Triggers React Error #185

```javascript
const useStore = create((set, get) => ({
  count: 0,
  increment: () => {
    const current = get().count; // ❌ FORBIDDEN - Causes infinite render loops
    set({ count: current + 1 });
  },

  asyncAction: async () => {
    const state = get(); // ❌ FORBIDDEN - Unsafe in async operations
    await someAsyncCall(state.value);
  },
}));
```

#### ✅ Good - Safe Patterns

```javascript
const useStore = create((set, get) => ({
  count: 0,

  // Use set with function parameter
  increment: () => set((state) => ({ count: state.count + 1 })),

  // Store reference pattern for async operations
  asyncAction: async () => {
    // Define store object to reference actions safely
    const store = useStore.getState();
    await someAsyncCall(store.value);
  },
}));
```

### 2. `zustand-store-reference-pattern` 📋 **BEST PRACTICE**

**Purpose**: Enforce store reference pattern for async operations.

**Level**: `warn`

#### ❌ Bad - Unsafe Async Patterns

```javascript
const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    set((state) => ({ toasts: [...state.toasts, toast] }));

    // ❌ BAD - get() call in setTimeout
    setTimeout(() => {
      get().removeToast(toast.id);
    }, 3000);
  },
}));
```

#### ✅ Good - Store Reference Pattern

```javascript
const useToastStore = create((set, get) => {
  const store = {
    toasts: [],

    addToast: (toast) => {
      set((state) => ({ toasts: [...state.toasts, toast] }));

      // ✅ GOOD - Store reference pattern
      setTimeout(() => {
        store.removeToast(toast.id);
      }, 3000);
    },

    removeToast: (id) =>
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
  };

  return store;
});
```

### 3. `zustand-selective-subscriptions` ⚡ **PERFORMANCE**

**Purpose**: Encourage selective subscriptions to prevent unnecessary re-renders.

**Level**: `warn`

#### ❌ Bad - Full Store Subscription

```javascript
const MyComponent = () => {
  const store = useMyStore(); // ❌ Subscribes to entire store

  return <div>{store.specificValue}</div>;
};
```

#### ✅ Good - Selective Subscription

```javascript
const MyComponent = () => {
  const specificValue = useMyStore((state) => state.specificValue); // ✅ Selective subscription

  return <div>{specificValue}</div>;
};
```

### 4. `zustand-no-conditional-subscriptions` 🔒 **MEMORY SAFETY**

**Purpose**: Prevent conditional store subscriptions that violate React hooks rules.

**Level**: `warn`

#### ❌ Bad - Conditional Subscriptions

```javascript
const MyComponent = ({ shouldUseStore }) => {
  // ❌ BAD - Violates hooks rules, causes memory leaks
  if (shouldUseStore) {
    const data = useMyStore((state) => state.data);
    return <div>{data}</div>;
  }

  return <div>No store</div>;
};
```

#### ✅ Good - Unconditional Subscription with Conditional Usage

```javascript
const MyComponent = ({ shouldUseStore }) => {
  // ✅ GOOD - Always subscribe, conditionally use
  const data = useMyStore((state) => state.data);

  if (shouldUseStore) {
    return <div>{data}</div>;
  }

  return <div>No store</div>;
};
```

## Rule Progression Plan

### Phase 1: Warning Mode (Current)

- All rules set to `warn` level
- Allows existing code to continue working
- Developers see warnings for new violations

### Phase 2: Error Mode (After Store Refactors)

After issues #660-662 are completed:

```javascript
// Will be upgraded to:
"zustand-safe-patterns/zustand-no-get-in-actions": "error",
"zustand-safe-patterns/zustand-store-reference-pattern": "error",
"zustand-safe-patterns/zustand-selective-subscriptions": "warn", // Keep as warn for flexibility
"zustand-safe-patterns/zustand-no-conditional-subscriptions": "error",
```

## Testing the Rules

Run ESLint to see current violations:

```bash
npm run lint
```

Focus on Zustand-related warnings:

```bash
npm run lint | grep "zustand-safe-patterns"
```

## Exceptions

### Temporary Exclusions

The following stores are temporarily excluded during refactoring:

- `src/stores/ui/onboardingStore.js` - Being refactored in #660
- `src/stores/ui/fabStore.js` - Being refactored in #660
- `src/stores/ui/toastStore.js` - Recently fixed, may need minor adjustments

### Permanent Exclusions

None planned - all stores should follow safe patterns.

## Related Documentation

- [Zustand Safe Patterns Guide](./Zustand-Safe-Patterns.md) - Detailed safe patterns
- [Store Refactoring Standards](./Component-Refactoring-Standards.md) - General refactoring methodology
- [Issue #658](https://github.com/thef4tdaddy/violet-vault/issues/658) - Epic for store architecture improvements

## Quick Reference

| Rule                                   | Purpose                  | Level      | Fix Strategy                        |
| -------------------------------------- | ------------------------ | ---------- | ----------------------------------- |
| `zustand-no-get-in-actions`            | Prevent React error #185 | warn→error | Use `set((state) => ...)`           |
| `zustand-store-reference-pattern`      | Safe async operations    | warn→error | Create store object reference       |
| `zustand-selective-subscriptions`      | Performance optimization | warn       | Use `useStore(state => state.prop)` |
| `zustand-no-conditional-subscriptions` | Memory leak prevention   | warn→error | Move conditions inside component    |
