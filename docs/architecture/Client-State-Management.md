# Client State Management

## 📋 Overview

Complete architectural guide for UI state development in VioletVault v2.0. This guide establishes patterns to ensure safe, performant, and type-safe state management in a modular TypeScript environment using Zustand.

**Last Updated**: January 18, 2026
**Architecture Level**: Client State (v2.0)

---

## 🏗️ Architecture Principles

### 1. **Clear Separation of Concerns**

#### **What Belongs in Zustand**

- ✅ **Global UI State**: Modal visibility, sidebar toggles, drawer states.
- ✅ **Temporary Form State**: Draft data during multi-step processes.
- ✅ **Local UX Preferences**: Chart view toggles, filter presets (stored in `localStorage` via middleware).

#### **What Belongs in React Context**

- ✅ **Authentication State**: `AuthContext` provides the current `user`, `session`, and `encryptionKey` (derived).
- ✅ **Theme/Styling**: Global tokens if not handled by CSS variables.

#### **What Belongs in TanStack Query**

- ❌ **Server Data**: All budget data (envelopes, transactions) belongs in TanStack Query + Dexie.
- ❌ **Derived Calculations**: Total unassigned cash, envelope balances, etc.

---

## 🛡️ Safety Patterns (TypeScript)

### 1. **Selective Subscriptions**

Never subscribe to the entire store. This prevents unnecessary re-renders when unrelated properties change.

```tsx
// ✅ GOOD: Re-renders only when 'isOpen' changes
const isOpen = useUIStore((state) => state.isOpen);

// ❌ BAD: Re-renders on ANY store change
const { isOpen } = useUIStore();
```

### 2. **Type-Safe Store Definition**

Always define an interface for your store state and actions.

```tsx
interface UIState {
  isOpen: boolean;
  activeTab: string;
  setIsOpen: (val: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isOpen: false,
  activeTab: "summary",
  setIsOpen: (val) => set({ isOpen: val }),
}));
```

### 3. **Avoid `get()` in Actions**

Using `get()` inside store actions can lead to stale state or infinite loops if called during a render cycle. Prefer passing necessary data into the action or using static access via `Store.getState()`.

---

## 🔄 Data Flow Hierarchy (v2.0)

VioletVault follows a strict pyramid of state:

1.  **Cloud (Firestore)**: Persistent multi-device storage.
2.  **Local (Dexie)**: Primary source of truth; persistent IndexedDB.
3.  **Server State (TanStack Query)**: Optimized caching, invalidation, and background sync.
4.  **Client State (Zustand)**: Ephemeral UI interactions.
5.  **Local State (`useState`)**: Component-specific toggles.

---

## 📦 Middleware Standards

We use a standard stack for persistent UI stores:

```tsx
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      immer((set) => ({
        // ... state
      })),
      { name: "vv-settings-v2" }
    )
  )
);
```

---

## 🧪 Testing Patterns

Reset store state between tests to ensure isolation.

```tsx
import { renderHook, act } from "@testing-library/react";
import { useUIStore } from "./uiStore";

describe("UIStore", () => {
  beforeEach(() => {
    useUIStore.setState({ isOpen: false });
  });

  it("toggles open state", () => {
    const { result } = renderHook(() => useUIStore());
    act(() => result.current.setIsOpen(true));
    expect(result.current.isOpen).toBe(true);
  });
});
```

---

## 🔗 Related Documentation

- [Client State Patterns](./Client-State-Patterns.md)
- [Client State Templates](./Client-State-Templates.md)
- [Source Code Directory](./Source-Code-Directory.md)
- [Data Model Simplification](./DATA_MODEL_SIMPLIFICATION.md)
