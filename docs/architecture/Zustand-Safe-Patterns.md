# Zustand Safe Patterns Guide

## 📋 Overview

Comprehensive guide to safe Zustand patterns that prevent React error #185 and ensure optimal performance. This guide provides detailed examples and explanations for every common Zustand use case.

**Status**: Production-Ready Patterns
**Related**: Epic #658, Issues #659-662

## 🚨 Critical Safety Rules

### Rule #1: NEVER Use get() in Store Actions

This is the **#1 cause** of React error #185 ("Maximum update depth exceeded").

#### ❌ DANGEROUS - Causes Infinite Loops

```javascript
const useDangerousStore = create((set, get) => ({
  count: 0,

  // ❌ FORBIDDEN - Will crash app
  increment: () => {
    const current = get().count; // Triggers infinite render loops
    set({ count: current + 1 });
  },

  // ❌ FORBIDDEN - Async get() calls
  saveCount: async () => {
    const state = get(); // Dangerous in async operations
    await api.save(state.count);
  },
}));
```

#### ✅ SAFE - Prevents React Error #185

```javascript
const useSafeStore = create((set) => ({
  count: 0,

  // ✅ SAFE - Use set with function parameter
  increment: () => set((state) => ({ count: state.count + 1 })),

  // ✅ SAFE - External store access for async
  saveCount: async () => {
    const state = useSafeStore.getState(); // Safe external access
    await api.save(state.count);
  },
}));
```

## 🔄 Safe Async Patterns

### Pattern 1: Store Reference Pattern

For complex async operations that need to call multiple store actions:

```javascript
const useAsyncStore = create((set) => {
  // Store object for safe cross-references
  const store = {
    status: "idle",
    data: null,
    error: null,

    // Safe async action
    fetchData: async (id) => {
      // Set loading state
      set({ status: "loading", error: null });

      try {
        const response = await api.fetchData(id);

        // ✅ SAFE - Use store reference for subsequent actions
        store.setData(response.data);
        store.scheduleRefresh(response.refreshInterval);
      } catch (error) {
        // ✅ SAFE - Error handling with store reference
        store.setError(error.message);
      }
    },

    setData: (data) => set({ data, status: "success" }),

    setError: (error) => set({ error, status: "error" }),

    scheduleRefresh: (interval) => {
      // ✅ SAFE - setTimeout with store reference
      setTimeout(() => {
        store.fetchData(store.lastFetchedId);
      }, interval);
    },
  };

  return store;
});
```

### Pattern 2: External State Access

For simple async operations:

```javascript
const useSimpleAsyncStore = create((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Date.now();
    const newNotification = { ...notification, id };

    // Add to store
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // ✅ SAFE - Auto-remove with external access
    setTimeout(() => {
      const currentState = useSimpleAsyncStore.getState();
      set({
        notifications: currentState.notifications.filter((n) => n.id !== id),
      });
    }, notification.duration || 5000);
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
```

## 📱 Component Integration Patterns

### Pattern 1: Selective Subscriptions

Always subscribe to specific values, never the entire store:

```javascript
// ✅ OPTIMAL - Selective subscriptions
const OptimizedComponent = () => {
  // Each subscription is specific and optimized
  const username = useUserStore((state) => state.username);
  const isOnline = useStatusStore((state) => state.isOnline);
  const notifications = useNotificationStore((state) => state.notifications);

  return (
    <div>
      <h1>Welcome, {username}</h1>
      <div>Status: {isOnline ? "Online" : "Offline"}</div>
      <NotificationList notifications={notifications} />
    </div>
  );
};

// ❌ PERFORMANCE PROBLEM - Over-subscription
const SlowComponent = () => {
  const userStore = useUserStore(); // Re-renders on ANY user store change
  const statusStore = useStatusStore(); // Re-renders on ANY status change

  return (
    <div>
      <h1>Welcome, {userStore.username}</h1>
      <div>Status: {statusStore.isOnline ? "Online" : "Offline"}</div>
    </div>
  );
};
```

### Pattern 2: Computed Selectors

Use selectors for derived values:

```javascript
// ✅ EFFICIENT - Computed selectors
const CartSummary = () => {
  // Memoized selectors prevent unnecessary re-renders
  const itemCount = useCartStore((state) => state.items.length);

  const totalPrice = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const hasItems = useCartStore((state) => state.items.length > 0);

  return (
    <div>
      <p>Items: {itemCount}</p>
      <p>Total: ${totalPrice.toFixed(2)}</p>
      <button disabled={!hasItems}>Checkout</button>
    </div>
  );
};
```

### Pattern 3: Action Binding

Separate action binding from state subscriptions:

```javascript
// ✅ CLEAN SEPARATION - Actions and state separated
const TodoList = () => {
  // State subscriptions
  const todos = useTodoStore((state) => state.todos);
  const filter = useTodoStore((state) => state.filter);

  // Action bindings (don't cause re-renders)
  const actions = useTodoStore((state) => ({
    addTodo: state.addTodo,
    toggleTodo: state.toggleTodo,
    deleteTodo: state.deleteTodo,
    setFilter: state.setFilter,
  }));

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (filter === "completed") return todo.completed;
      if (filter === "active") return !todo.completed;
      return true;
    });
  }, [todos, filter]);

  return (
    <div>
      <FilterButtons onFilterChange={actions.setFilter} currentFilter={filter} />
      <TodoItems
        todos={filteredTodos}
        onToggle={actions.toggleTodo}
        onDelete={actions.deleteTodo}
      />
      <AddTodoForm onAdd={actions.addTodo} />
    </div>
  );
};
```

## 🏗️ Store Architecture Patterns

### Pattern 1: Core State Store

For persistent application settings:

```javascript
// Core settings that survive page refreshes
const useAppSettingsStore = create(
  persist(
    (set) => ({
      // Persistent settings
      theme: "light",
      language: "en",
      notifications: {
        email: true,
        push: false,
        sounds: true,
      },

      // Simple setters only
      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => set({ language }),

      updateNotificationSetting: (key, value) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: value,
          },
        })),

      // Bulk update for settings import
      importSettings: (settings) =>
        set((state) => ({
          ...state,
          ...settings,
          // Validate critical settings
          theme: ["light", "dark"].includes(settings.theme) ? settings.theme : state.theme,
        })),
    }),
    {
      name: "app-settings",
      version: 1,
    }
  )
);
```

### Pattern 2: Feature State Store

For scoped functionality:

```javascript
// Feature-specific state (e.g., search, filters, modal state)
const useSearchStore = create((set, get) => ({
  // Search state
  query: "",
  results: [],
  isLoading: false,
  filters: {
    category: "all",
    sortBy: "relevance",
    dateRange: null,
  },

  // Actions
  setQuery: (query) => set({ query }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  // ✅ SAFE - Async search with external access
  performSearch: async (searchQuery) => {
    set({ isLoading: true, query: searchQuery });

    try {
      const currentState = useSearchStore.getState();
      const results = await searchAPI.search(searchQuery, currentState.filters);

      set({
        results,
        isLoading: false,
      });
    } catch (error) {
      set({
        results: [],
        isLoading: false,
        error: error.message,
      });
    }
  },

  clearSearch: () =>
    set({
      query: "",
      results: [],
      error: null,
    }),

  reset: () =>
    set({
      query: "",
      results: [],
      isLoading: false,
      error: null,
      filters: {
        category: "all",
        sortBy: "relevance",
        dateRange: null,
      },
    }),
}));
```

### Pattern 3: Ephemeral UI Store

For temporary UI state (modals, toasts, etc.):

```javascript
// Temporary UI state - keep minimal
const useUIStore = create((set) => {
  const store = {
    // Modal state
    modals: new Map(),

    // Toast notifications
    toasts: [],

    // Loading states
    loadingStates: new Map(),

    // Modal management
    openModal: (modalId, props = {}) =>
      set((state) => {
        const newModals = new Map(state.modals);
        newModals.set(modalId, { isOpen: true, props });
        return { modals: newModals };
      }),

    closeModal: (modalId) =>
      set((state) => {
        const newModals = new Map(state.modals);
        newModals.delete(modalId);
        return { modals: newModals };
      }),

    // ✅ SAFE - Toast with auto-removal
    addToast: (toast) => {
      const id = Date.now();
      const newToast = { ...toast, id };

      set((state) => ({
        toasts: [...state.toasts, newToast],
      }));

      // Auto-remove with store reference
      if (toast.duration !== Infinity) {
        setTimeout(() => {
          store.removeToast(id);
        }, toast.duration || 5000);
      }
    },

    removeToast: (id) =>
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),

    // Loading state management
    setLoading: (key, isLoading) =>
      set((state) => {
        const newLoadingStates = new Map(state.loadingStates);
        if (isLoading) {
          newLoadingStates.set(key, true);
        } else {
          newLoadingStates.delete(key);
        }
        return { loadingStates: newLoadingStates };
      }),
  };

  return store;
});
```

## 🧪 Testing Patterns

### Pattern 1: Store Testing Setup

```javascript
import { renderHook, act } from "@testing-library/react";
import { useMyStore } from "../stores/myStore";

describe("MyStore", () => {
  // Reset store before each test
  beforeEach(() => {
    act(() => {
      useMyStore.setState(useMyStore.getInitialState());
    });
  });

  it("should handle safe async operations", async () => {
    const { result } = renderHook(() => useMyStore());

    // Test async action
    await act(async () => {
      await result.current.fetchData("test-id");
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.status).toBe("success");
  });

  it("should handle store reference pattern", () => {
    const { result } = renderHook(() => useMyStore());

    act(() => {
      result.current.addNotification({
        message: "Test notification",
        duration: 100, // Short duration for testing
      });
    });

    expect(result.current.notifications).toHaveLength(1);

    // Wait for auto-removal
    setTimeout(() => {
      expect(result.current.notifications).toHaveLength(0);
    }, 150);
  });
});
```

### Pattern 2: Integration Testing

```javascript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyComponent } from "../components/MyComponent";

describe("Store Integration", () => {
  it("should update UI when store changes", async () => {
    render(<MyComponent />);

    const button = screen.getByRole("button", { name: /increment/i });

    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
    });
  });
});
```

## 🔧 Migration Patterns

### Migrating from Unsafe to Safe Patterns

#### Before (Unsafe)

```javascript
const useUnsafeStore = create((set, get) => ({
  items: [],

  // ❌ UNSAFE - get() in action
  addItem: (item) => {
    const currentItems = get().items;
    set({ items: [...currentItems, item] });
  },

  // ❌ UNSAFE - get() in async
  saveItems: async () => {
    const items = get().items;
    await api.save(items);
  },
}));
```

#### After (Safe)

```javascript
const useSafeStore = create((set) => ({
  items: [],

  // ✅ SAFE - Use set function parameter
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  // ✅ SAFE - External store access
  saveItems: async () => {
    const { items } = useSafeStore.getState();
    await api.save(items);
  },
}));
```

## 📊 Performance Optimization

### Subscription Optimization

```javascript
// ✅ OPTIMIZED - Specific subscriptions
const UserProfile = () => {
  const name = useUserStore((state) => state.name);
  const avatar = useUserStore((state) => state.avatar);

  return (
    <div>
      {name} <img src={avatar} />
    </div>
  );
};

// ❌ UNOPTIMIZED - Object creation causes re-renders
const UserProfile = () => {
  const { name, avatar } = useUserStore((state) => ({
    name: state.name,
    avatar: state.avatar,
  })); // New object every render

  return (
    <div>
      {name} <img src={avatar} />
    </div>
  );
};
```

### Action Memoization

```javascript
// ✅ MEMOIZED - Actions don't cause re-renders
const TodoList = () => {
  const todos = useTodoStore((state) => state.todos);

  // Memoize actions to prevent child re-renders
  const actions = useMemo(
    () => ({
      toggle: useTodoStore.getState().toggleTodo,
      delete: useTodoStore.getState().deleteTodo,
    }),
    []
  ); // Empty deps - actions are stable

  return (
    <div>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={actions.toggle} onDelete={actions.delete} />
      ))}
    </div>
  );
};
```

## 🚨 Common Anti-Patterns

### 1. Store Coupling

```javascript
// ❌ BAD - Direct store coupling
const useStoreA = create((set, get) => ({
  value: 0,
  updateBasedOnB: () => {
    const bValue = useStoreB.getState().value; // Tight coupling
    set({ value: bValue * 2 });
  },
}));

// ✅ GOOD - Event-based communication
const useStoreA = create((set) => ({
  value: 0,

  updateValue: (newValue) => set({ value: newValue }),
}));

// Listen to events instead of direct coupling
useEffect(() => {
  const handleBChange = (event) => {
    useStoreA.getState().updateValue(event.detail * 2);
  };

  window.addEventListener("store-b-change", handleBChange);
  return () => window.removeEventListener("store-b-change", handleBChange);
}, []);
```

### 2. State Normalization Issues

```javascript
// ❌ BAD - Denormalized state
const useBadStore = create((set) => ({
  users: [
    {
      id: 1,
      name: "John",
      posts: [
        /* post objects */
      ],
    },
    {
      id: 2,
      name: "Jane",
      posts: [
        /* post objects */
      ],
    },
  ],
}));

// ✅ GOOD - Normalized state
const useUserStore = create((set) => ({
  users: { 1: { id: 1, name: "John" }, 2: { id: 2, name: "Jane" } },
  posts: { 1: { id: 1, userId: 1, content: "..." } },
  userPosts: { 1: [1], 2: [2, 3] },
}));
```

## 🔗 Integration Examples

### With TanStack Query

```javascript
// Use Zustand for UI state, TanStack Query for server state
const usePostsPage = () => {
  // UI state in Zustand
  const filter = useUIStore((state) => state.postsFilter);
  const setFilter = useUIStore((state) => state.setPostsFilter);

  // Server state in TanStack Query
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", filter],
    queryFn: () => fetchPosts(filter),
  });

  return { posts, isLoading, filter, setFilter };
};
```

### With React Context

```javascript
// Use Context for feature-scoped state
const FeatureContext = createContext();

const FeatureProvider = ({ children }) => {
  // Feature-specific state that doesn't need global access
  const [localState, setLocalState] = useState();

  return (
    <FeatureContext.Provider value={{ localState, setLocalState }}>
      {children}
    </FeatureContext.Provider>
  );
};

// Use Zustand for global state
const useGlobalSettings = () => {
  return useSettingsStore((state) => state.featureSettings);
};
```

## 📚 Quick Reference

### ✅ Safe Patterns Checklist

- [ ] No `get()` calls inside store actions
- [ ] Use `useStore.getState()` for external access
- [ ] Selective subscriptions only
- [ ] Store reference pattern for async operations
- [ ] Separate persistent from ephemeral state
- [ ] Use TanStack Query for computed state
- [ ] Memoize actions in components
- [ ] Normalize complex state structures

### ❌ Patterns to Avoid

- [ ] `get()` calls in store actions
- [ ] Full store subscriptions
- [ ] Conditional store subscriptions
- [ ] Complex computed values in stores
- [ ] Tight coupling between stores
- [ ] Mixing concerns in single store
- [ ] Direct DOM manipulation in stores

---

**Safe Patterns Guide maintained by**: VioletVault Development Team
**Next Review**: After any Zustand version update
