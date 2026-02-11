# Client State Patterns

## 📋 Overview

Comprehensive guide to safe state management patterns in VioletVault v2.0. These practices prevent React re-render loops (error #185), ensure optimal performance on mobile devices, and leverage TypeScript for global state safety using Zustand.

**Last Updated**: January 18, 2026
**Architecture Level**: Client State (v2.0)

---

## 🚨 Critical Safety Rules

### Rule #1: NEVER Use `get()` in Store Actions

Using `get()` inside a store's internal action definition is the primary cause of "Maximum update depth exceeded" errors (React Error #185).

#### ❌ DANGEROUS (Causes Infinite Loops)

```tsx
const useDangerousStore = create<CountState>((set, get) => ({
  count: 0,
  increment: () => {
    const current = get().count; // Triggers infinite re-render cycles
    set({ count: current + 1 });
  },
}));
```

#### ✅ SAFE (Functional Updates)

```tsx
const useSafeStore = create<CountState>((set) => ({
  count: 0,
  // Use the state parameter provided by 'set'
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

---

## 🔄 Safe Async Patterns

### Pattern 1: Static State Access (`getState`)

For async actions that need a snapshot of state _after_ an await call, use the stable `Store.getState()` method to avoid reactivity issues during the transition.

```tsx
export const useAsyncStore = create<AsyncState>((set) => ({
  query: "",
  results: [],
  performSearch: async (searchQuery: string) => {
    set({ query: searchQuery, isLoading: true });

    // Perform async work
    const results = await api.search(searchQuery);

    // ✅ SAFE: Static access doesn't trigger reactivity loops
    const { isDisposed } = useAsyncStore.getState();
    if (!isDisposed) {
      set({ results, isLoading: false });
    }
  },
}));
```

---

## 📱 Component Integration Patterns

### Selective Subscriptions

Always extract values individually or use a memoized selector function.

```tsx
// ✅ OPTIMAL: Re-renders only when 'username' changes
const username = useUserStore((state) => state.username);

// ❌ PERFORMANCE LEAK: Component re-renders on ANY change to the user store
const { username, lastLogin } = useUserStore();
```

---

## 🏗️ Store Architecture Patterns

### Persistent UI Stores

Use the `persist` middleware for settings that should survive a page refresh (e.g., Theme, Filter Presets).

```tsx
import { persist } from "zustand/middleware";

interface UIPreferences {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIPreferences>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    { name: "vv-ui-preferences" }
  )
);
```

---

## 🧪 Testing Patterns

Always reset the store to its initial state using `setState` in a `beforeEach` block to ensure test isolation.

```tsx
import { renderHook, act } from "@testing-library/react";
import { useUIStore } from "./uiStore";

describe("UIStore", () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarOpen: true });
  });

  it("handles updates correctly", () => {
    const { result } = renderHook(() => useUIStore());
    act(() => result.current.setSidebarOpen(false));
    expect(result.current.sidebarOpen).toBe(false);
  });
});
```

---

## 🔗 Related Documentation

- [Client State Management](./Client-State-Management.md)
- [Client State Templates](./Client-State-Templates.md)
- [Source Code Directory](./Source-Code-Directory.md)
