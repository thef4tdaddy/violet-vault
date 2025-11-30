# Zustand Architecture Guide

## 📋 Overview

Complete architectural guide for Zustand store development in VioletVault. This guide establishes patterns, principles, and practices to ensure safe, performant, and maintainable state management.

**Related Issues**: Epic #658, Issues #659-662
**Last Updated**: September 2025

## 🏗️ Architecture Principles

### 1. **Clear Separation of Concerns**

#### **What Belongs in Zustand**

- ✅ **Persistent UI Settings**: Theme, preferences, user settings
- ✅ **Global UI State**: Modal visibility, loading states
- ✅ **Temporary Form State**: Form inputs, draft data
- ✅ **App-Level UI Configuration**: Feature flags, UI preferences

#### **What Belongs in React Context**

- ✅ **Authentication State**: User info, tokens, session data (AuthContext)
- ✅ **Auth Operations**: Login, logout, session management (via TanStack Query)

**Note**: Auth state moved from Zustand to React Context in v2.0. See [Auth Architecture](#auth-architecture) section.

#### **What DOESN'T Belong in Zustand**

- ❌ **Computed/Derived State**: Use TanStack Query instead
- ❌ **Server Data**: Use TanStack Query + Dexie instead
- ❌ **Temporary Component State**: Use React useState instead
- ❌ **Complex Business Logic**: Extract to custom hooks

### 2. **Store Types & Patterns**

#### **Core State Stores**

For persistent, global application state:

```javascript
// Example: uiStore.js, authStore.jsx
const useCoreStore = create(
  persist(
    (set) => ({
      // Persistent settings only
      setting: defaultValue,
      setSetting: (value) => set({ setting: value }),
    }),
    { name: "core-store" }
  )
);
```

#### **Feature State Stores**

For scoped functionality (like FAB, notifications):

```javascript
// Example: fabStore.js, toastStore.js
const useFeatureStore = create((set) => ({
  // Feature-specific state
  isActive: false,
  items: [],

  // Simple actions only
  setActive: (active) => set({ isActive: active }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));
```

## 🛡️ Safety Patterns

### 1. **NEVER Use get() in Actions**

#### ❌ Dangerous Pattern (Causes React Error #185)

```javascript
const useStore = create((set, get) => ({
  action: async () => {
    const state = get(); // ❌ FORBIDDEN - Infinite render loops
    await someAsyncCall(state.value);
  },
}));
```

#### ✅ Safe Pattern

```javascript
const useStore = create((set) => ({
  action: async () => {
    // Safe external store access
    const state = useStore.getState();
    await someAsyncCall(state.value);
  },
}));
```

### 2. **Selective Subscriptions Only**

#### ❌ Performance Problem

```javascript
const MyComponent = () => {
  const store = useStore(); // ❌ Subscribes to entire store
  return <div>{store.specificValue}</div>;
};
```

#### ✅ Optimized Pattern

```javascript
const MyComponent = () => {
  const specificValue = useStore((state) => state.specificValue); // ✅ Selective
  return <div>{specificValue}</div>;
};
```

### 3. **Store Reference Pattern for Async**

#### ❌ Unsafe Async Pattern

```javascript
const useToastStore = create((set, get) => ({
  addToast: (toast) => {
    set((state) => ({ toasts: [...state.toasts, toast] }));

    // ❌ BAD - get() in setTimeout
    setTimeout(() => {
      get().removeToast(toast.id);
    }, 3000);
  },
}));
```

#### ✅ Safe Async Pattern

```javascript
const useToastStore = create((set) => {
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

## 🔄 When to Use Alternatives

### **TanStack Query** (Recommended for)

- Server data fetching and caching
- Computed/derived values
- Complex data transformations
- Background data synchronization

```javascript
// Use TanStack Query for computed state
const useEnvelopeTotal = () => {
  return useQuery({
    queryKey: ["envelope-total", envelopeId],
    queryFn: () => calculateEnvelopeTotal(envelopeId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
```

### **React Context** (Use for)

- Feature-scoped state that doesn't need global access
- Component tree specific data
- When you need dependency injection patterns

### **Component State** (Use for)

- Temporary UI state (form inputs, local toggles)
- Component-specific interactions
- One-off modal visibility

```javascript
// Component state for temporary UI
const MyComponent = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div>
      <button onClick={() => setIsExpanded(!isExpanded)}>Toggle</button>
      {isExpanded && <div>Content</div>}
    </div>
  );
};
```

## 📦 Middleware Standards

### **Recommended Middleware Stack**

```javascript
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Standard middleware configuration
const useStandardStore = create(
  subscribeWithSelector(
    devtools(
      persist(
        immer((set) => ({
          // Store definition
        })),
        {
          name: "store-name",
          version: 1,
        }
      ),
      { name: "store-devtools" }
    )
  )
);
```

### **Middleware Guidelines**

- **immer**: Use for complex state updates with nested objects
- **persist**: Use for data that should survive page refreshes
- **devtools**: Always include for debugging (strips in production)
- **subscribeWithSelector**: Use when you need selective subscriptions

## 🧪 Testing Patterns

### **Store Testing Template**

```javascript
import { renderHook, act } from "@testing-library/react";
import { useMyStore } from "../myStore";

describe("MyStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useMyStore.setState(useMyStore.getInitialState());
  });

  it("should update state safely", () => {
    const { result } = renderHook(() => useMyStore());

    act(() => {
      result.current.setSomeValue("test");
    });

    expect(result.current.someValue).toBe("test");
  });

  it("should handle async operations safely", async () => {
    const { result } = renderHook(() => useMyStore());

    await act(async () => {
      await result.current.asyncAction();
    });

    expect(result.current.actionCompleted).toBe(true);
  });
});
```

## 🚨 Common Pitfalls

### 1. **Store Pollution**

- **Problem**: Putting everything in one giant store
- **Solution**: Create focused, single-purpose stores

### 2. **State Complexity**

- **Problem**: Complex computed values in stores
- **Solution**: Move to TanStack Query or custom hooks

### 3. **Subscription Overhead**

- **Problem**: Components re-rendering on unrelated state changes
- **Solution**: Use selective subscriptions consistently

### 4. **Memory Leaks**

- **Problem**: Conditional store subscriptions
- **Solution**: Always subscribe, conditionally use data

## 📊 Performance Guidelines

### **Store Size Limits**

- Keep stores focused and small
- Prefer multiple small stores over one large store
- Extract complex logic to custom hooks

### **Subscription Optimization**

```javascript
// ✅ Good - Specific subscriptions
const name = useUserStore((state) => state.name);
const email = useUserStore((state) => state.email);

// ❌ Bad - Single subscription for multiple values
const { name, email } = useUserStore((state) => ({
  name: state.name,
  email: state.email,
})); // Creates new object every render
```

### **Action Optimization**

```javascript
// ✅ Good - Batch related updates
const updateUser = (userData) =>
  set((state) => ({
    ...state,
    name: userData.name,
    email: userData.email,
    lastUpdated: Date.now(),
  }));

// ❌ Bad - Multiple separate updates
const updateUser = (userData) => {
  set((state) => ({ ...state, name: userData.name }));
  set((state) => ({ ...state, email: userData.email }));
  set((state) => ({ ...state, lastUpdated: Date.now() }));
};
```

## 🔐 Auth Architecture (v2.0+)

### **React Context for Auth State**

As of v2.0, authentication state is managed via React Context, not Zustand:

- **AuthContext**: Provides user, session, and auth status
- **TanStack Query**: Handles auth operations (login, logout, session management)
- **Zustand**: Only for UI state (modals, forms, temporary interactions)

**Migration Note**: If you have code using `authStore` from Zustand, update to use `AuthContext` instead.

### **Example: Using AuthContext**

```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return <div>Welcome, {user?.email}</div>;
};
```

## 🔗 Integration with VioletVault Architecture

### **Data Flow Hierarchy**

1. **Firebase** (optional cloud storage)
2. **Dexie** (local IndexedDB storage)
3. **TanStack Query** (computed state, server data, auth operations)
4. **React Context** (auth state)
5. **Zustand** (UI state, auth state only)
6. **React State** (component-local state)

### **Store Coordination**

```javascript
// Stores should be loosely coupled
const useAuthStore = create((set) => ({
  user: null,
  login: async (credentials) => {
    // Handle auth logic
    const user = await authenticate(credentials);
    set({ user });

    // Notify other systems without direct coupling
    window.dispatchEvent(new CustomEvent("auth:login", { detail: user }));
  },
}));

// Other stores listen to events, not direct store coupling
const useUIStore = create((set) => {
  // Listen for auth events
  useEffect(() => {
    const handleLogin = () => set({ showWelcome: true });
    window.addEventListener("auth:login", handleLogin);
    return () => window.removeEventListener("auth:login", handleLogin);
  }, []);

  return {
    showWelcome: false,
    // ... other UI state
  };
});
```

## 📚 Additional Resources

- [ESLint Zustand Rules](./ESLint-Zustand-Rules.md) - Automated safety validation
- [Zustand Safe Patterns](./Zustand-Safe-Patterns.md) - Detailed pattern examples
- [Zustand Store Templates](./Zustand-Store-Templates.md) - Copy-paste ready templates and utilities
- [Official Zustand Docs](https://zustand-demo.pmnd.rs/) - Zustand documentation

---

**Architecture Guide maintained by**: VioletVault Development Team
**Review Schedule**: After each major Zustand update or architectural change
