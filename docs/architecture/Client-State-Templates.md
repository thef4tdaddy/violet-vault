# Client State Templates

## 📋 Overview

Ready-to-use TypeScript templates for creating safe, consistent Zustand stores in VioletVault v2.0. These templates follow the patterns established in [Client State Management](./Client-State-Management.md).

**Last Updated**: January 18, 2026
**Architecture Level**: Client State (v2.0)

---

## 🏗️ Template Categories

### 1. **Persistent Settings Store**

Use for UI preferences, feature flags, or theme settings that must survive a page refresh.

```tsx
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface SettingsState {
  theme: "dark" | "light" | "system";
  showBalances: boolean;
  setTheme: (theme: SettingsState["theme"]) => void;
  toggleBalances: () => void;
  reset: () => void;
}

const initialState = {
  theme: "system" as const,
  showBalances: true,
};

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,
        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
          }),
        toggleBalances: () =>
          set((state) => {
            state.showBalances = !state.showBalances;
          }),
        reset: () => set(initialState),
      })),
      { name: "vv-settings-v2" }
    ),
    { name: "SettingsStore" }
  )
);
```

### 2. **Ephemeral UI Store**

Use for transient page state like modal visibility, multi-step form progress, or temporary filter states.

```tsx
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface UIState {
  isFilterExpanded: boolean;
  activeModal: "none" | "add-transaction" | "edit-envelope";
  setFilterExpanded: (expanded: boolean) => void;
  setActiveModal: (modal: UIState["activeModal"]) => void;
  closeAll: () => void;
}

const initialState = {
  isFilterExpanded: false,
  activeModal: "none" as const,
};

export const useUIStore = create<UIState>()(
  devtools(
    immer((set) => ({
      ...initialState,
      setFilterExpanded: (expanded) =>
        set((state) => {
          state.isFilterExpanded = expanded;
        }),
      setActiveModal: (modal) =>
        set((state) => {
          state.activeModal = modal;
        }),
      closeAll: () => set(initialState),
    })),
    { name: "UIStore" }
  )
);
```

---

## 🛠️ Advanced Patterns

### Complex Object Updates (Immer)

Immer allows you to mutate state directly in a type-safe way, which is cleaner for deep objects.

```tsx
updateNotification: (id: string, updates: Partial<Notification>) =>
  set((state) => {
    const index = state.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      state.notifications[index] = { ...state.notifications[index], ...updates };
    }
  }),
```

### Async Operations

While server data should reside in TanStack Query, some UI-specific async logic (like timeouts or artificial delays) can exist in Zustand. Use static access to state for safety.

```tsx
addToastWithTimeout: async (message: string) => {
  const id = uuid();
  set((state) => {
    state.toasts.push({ id, message });
  });

  setTimeout(() => {
    // ✅ Use static access to ensure we have the absolute latest state
    const { toasts } = useToastStore.getState();
    set({ toasts: toasts.filter((t) => t.id !== id) });
  }, 3000);
};
```

---

## 🧪 Testing Template

```tsx
import { renderHook, act } from "@testing-library/react";
import { useSettingsStore } from "./settingsStore";

describe("SettingsStore", () => {
  beforeEach(() => {
    // Always reset state before each test
    useSettingsStore.setState({ theme: "system", showBalances: true });
  });

  it("updates the theme", () => {
    const { result } = renderHook(() => useSettingsStore());
    act(() => result.current.setTheme("dark"));
    expect(result.current.theme).toBe("dark");
  });
});
```

---

## 🔗 Related Documentation

- [Client State Management](./Client-State-Management.md)
- [Client State Patterns](./Client-State-Patterns.md)
- [Source Code Directory](./Source-Code-Directory.md)
