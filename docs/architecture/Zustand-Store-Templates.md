# Zustand Store Templates

## 📋 Overview

Ready-to-use templates for creating safe, consistent Zustand stores in VioletVault. These templates follow the architectural patterns established in the [Zustand Architecture Guide](./Zustand-Architecture-Guide.md) and implement the safety patterns from [Zustand Safe Patterns](./Zustand-Safe-Patterns.md).

**Related Issues**: Epic #658, Issue #662
**Last Updated**: September 2025

## 🏗️ Template Categories

### 1. **Core State Store Template**

For persistent, global application state like settings and authentication:

```javascript
// template-core-store.js
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import logger from "../../utils/common/logger.js";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

/**
 * Core State Store Template
 *
 * Use for: Persistent settings, global app state, user preferences
 * Characteristics: Persisted, global access, simple state
 */
const createCoreStoreInitializer = (storeName, initialState, actions) => (set, _get) => {
  const store = {
    // Initial state
    ...initialState,

    // Actions with safe patterns
    ...Object.entries(actions).reduce((acc, [key, actionFn]) => {
      acc[key] = (...args) => {
        try {
          // Safe external store access pattern
          const getCurrentState = () => useStore.getState();

          return actionFn(set, getCurrentState, ...args);
        } catch (error) {
          logger.error(`Action ${key} failed in ${storeName}`, error);
          throw error;
        }
      };
      return acc;
    }, {}),

    // Reset utility
    reset: () => set(() => initialState),
  };

  return store;
};

// Usage example:
const useSettingsStore = create(
  subscribeWithSelector(
    devtools(
      persist(
        immer(
          createCoreStoreInitializer(
            "settings-store",
            {
              theme: "light",
              language: "en",
              notifications: true,
            },
            {
              setTheme: (set, _getCurrentState, theme) =>
                set((state) => {
                  state.theme = theme;
                  logger.info("Theme updated", { theme });
                }),

              setLanguage: (set, _getCurrentState, language) =>
                set((state) => {
                  state.language = language;
                  logger.info("Language updated", { language });
                }),
            }
          )
        ),
        {
          name: "violet-vault-settings",
          version: 1,
        }
      ),
      { name: "settings-devtools" }
    )
  )
);

export default useSettingsStore;
```

### 2. **Feature State Store Template**

For scoped functionality like modals, notifications, and UI features:

```javascript
// template-feature-store.js
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import logger from "../../utils/common/logger.js";

/**
 * Feature State Store Template
 *
 * Use for: UI features, modals, notifications, temporary state
 * Characteristics: Not persisted, feature-scoped, may have async actions
 */
const createFeatureStore = (storeName, initialState, actions) => {
  const storeInitializer = (set, _get) => {
    const store = {
      // Feature state
      ...initialState,

      // Safe async actions using store reference pattern
      ...Object.entries(actions).reduce((acc, [key, actionFn]) => {
        acc[key] = async (...args) => {
          try {
            // For async operations, use store reference pattern
            return await actionFn(set, store, ...args);
          } catch (error) {
            logger.error(`Async action ${key} failed in ${storeName}`, error);
            throw error;
          }
        };
        return acc;
      }, {}),

      // Feature cleanup
      cleanup: () => set(() => initialState),
    };

    return store;
  };

  return create(
    subscribeWithSelector(devtools(immer(storeInitializer), { name: `${storeName}-devtools` }))
  );
};

// Usage example:
const useNotificationStore = createFeatureStore(
  "notification-store",
  {
    notifications: [],
    isLoading: false,
  },
  {
    addNotification: async (set, store, notification) => {
      const id = Date.now().toString();
      const newNotification = { id, ...notification, timestamp: Date.now() };

      set((state) => {
        state.notifications.push(newNotification);
      });

      // Safe async operation using store reference
      if (notification.autoRemove !== false) {
        setTimeout(() => {
          store.removeNotification(id);
        }, notification.duration || 5000);
      }

      return id;
    },

    removeNotification: (set, _store, id) =>
      set((state) => {
        state.notifications = state.notifications.filter((n) => n.id !== id);
      }),
  }
);

export default useNotificationStore;
```

### 3. **Ephemeral State Store Template**

For temporary, non-persistent state that doesn't need to survive page refreshes:

```javascript
// template-ephemeral-store.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

/**
 * Ephemeral State Store Template
 *
 * Use for: Temporary UI state, form state, transient interactions
 * Characteristics: No persistence, lightweight, simple actions
 */
const createEphemeralStore = (storeName, initialState) => {
  return create(
    devtools(
      immer((set) => ({
        // State
        ...initialState,

        // Simple setters
        ...Object.keys(initialState).reduce((acc, key) => {
          const setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
          acc[setterName] = (value) =>
            set((state) => {
              state[key] = value;
            });
          return acc;
        }, {}),

        // Batch update
        updateState: (updates) =>
          set((state) => {
            Object.assign(state, updates);
          }),

        // Reset
        reset: () => set(() => initialState),
      })),
      { name: `${storeName}-ephemeral-devtools` }
    )
  );
};

// Usage example:
const useFormStore = createEphemeralStore("form-state", {
  currentStep: 0,
  isValid: false,
  isDirty: false,
  errors: {},
});

export default useFormStore;
```

## 🔧 Store Creation Utilities

### Safe Store Creator

```javascript
// utils/stores/createSafeStore.js
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import logger from "../common/logger.js";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

/**
 * Creates a safe Zustand store with standard middleware and error handling
 *
 * @param {Object} config - Store configuration
 * @param {string} config.name - Store name for devtools and persistence
 * @param {Object} config.initialState - Initial store state
 * @param {Object} config.actions - Store actions (functions)
 * @param {Object} config.options - Additional options
 * @param {boolean} config.options.persist - Enable persistence (default: false)
 * @param {Array<string>} config.options.persistedKeys - Keys to persist (if not specified, persists all)
 * @param {boolean} config.options.immer - Enable immer middleware (default: true)
 * @param {boolean} config.options.devtools - Enable devtools (default: true)
 * @param {number} config.options.version - Persistence version (default: 1)
 *
 * @returns {Function} Zustand store hook
 */
export const createSafeStore = ({ name, initialState, actions = {}, options = {} }) => {
  const {
    persist: enablePersist = false,
    persistedKeys = null,
    immer: enableImmer = true,
    devtools: enableDevtools = true,
    version = 1,
  } = options;

  // Validate configuration
  if (!name || typeof name !== "string") {
    throw new Error("Store name is required and must be a string");
  }

  if (!initialState || typeof initialState !== "object") {
    throw new Error("Initial state is required and must be an object");
  }

  // Store initializer with safe patterns
  const storeInitializer = (set, _get) => {
    const store = {
      // Initial state
      ...initialState,

      // Wrap actions with error handling and safe patterns
      ...Object.entries(actions).reduce((acc, [actionName, actionFn]) => {
        acc[actionName] = (...args) => {
          try {
            // Safe external store access for actions that need current state
            const getCurrentState = () => useStore.getState();

            // Handle both sync and async actions
            const result = actionFn(set, getCurrentState, store, ...args);

            // Log action execution
            logger.debug(`Action ${actionName} executed in ${name}`, {
              actionName,
              storeName: name,
              args: args.length,
            });

            return result;
          } catch (error) {
            logger.error(`Action ${actionName} failed in ${name}`, error);
            throw error;
          }
        };
        return acc;
      }, {}),

      // Built-in utilities
      reset: () => {
        logger.info(`Resetting store ${name}`);
        set(() => initialState);
      },

      getDebugInfo: () => {
        const state = useStore.getState();
        return {
          storeName: name,
          stateKeys: Object.keys(state),
          timestamp: Date.now(),
          version,
        };
      },
    };

    return store;
  };

  // Build middleware stack
  let middlewareStack = storeInitializer;

  // Add immer middleware
  if (enableImmer) {
    middlewareStack = immer(middlewareStack);
  }

  // Add persistence middleware
  if (enablePersist && !LOCAL_ONLY_MODE) {
    const persistConfig = {
      name: `violet-vault-${name}`,
      version,
    };

    // Add partialize if specific keys are requested
    if (persistedKeys && Array.isArray(persistedKeys)) {
      persistConfig.partialize = (state) =>
        persistedKeys.reduce((acc, key) => {
          if (key in state) {
            acc[key] = state[key];
          }
          return acc;
        }, {});
    }

    middlewareStack = persist(middlewareStack, persistConfig);
  }

  // Add devtools middleware
  if (enableDevtools) {
    middlewareStack = devtools(middlewareStack, { name: `${name}-devtools` });
  }

  // Add subscription middleware for selective subscriptions
  middlewareStack = subscribeWithSelector(middlewareStack);

  // Create the store
  const useStore = create(middlewareStack);

  // Log store creation
  logger.info(`Created safe store: ${name}`, {
    persist: enablePersist && !LOCAL_ONLY_MODE,
    immer: enableImmer,
    devtools: enableDevtools,
    actions: Object.keys(actions),
  });

  return useStore;
};

/**
 * Creates a persisted store with safe patterns
 */
export const createPersistedStore = (config) => {
  return createSafeStore({
    ...config,
    options: {
      ...config.options,
      persist: true,
    },
  });
};

/**
 * Creates an ephemeral (non-persisted) store
 */
export const createEphemeralStore = (config) => {
  return createSafeStore({
    ...config,
    options: {
      ...config.options,
      persist: false,
    },
  });
};
```

## 📝 Store Registry System

```javascript
// utils/stores/storeRegistry.js
import logger from "../common/logger.js";

/**
 * Global store registry for development and debugging
 */
class StoreRegistry {
  constructor() {
    this.stores = new Map();
    this.initialized = false;
  }

  /**
   * Register a store in the global registry
   */
  register(name, store, metadata = {}) {
    if (this.stores.has(name)) {
      logger.warn(`Store ${name} already registered, overwriting`);
    }

    this.stores.set(name, {
      store,
      metadata: {
        ...metadata,
        registeredAt: Date.now(),
        name,
      },
    });

    logger.debug(`Registered store: ${name}`, metadata);

    // Make available globally in development
    if (import.meta.env.DEV) {
      if (!window.__VIOLET_VAULT_STORES__) {
        window.__VIOLET_VAULT_STORES__ = {};
      }
      window.__VIOLET_VAULT_STORES__[name] = store;
    }
  }

  /**
   * Get a registered store
   */
  get(name) {
    const entry = this.stores.get(name);
    return entry ? entry.store : null;
  }

  /**
   * Get all registered stores
   */
  getAll() {
    return Array.from(this.stores.entries()).map(([name, { store, metadata }]) => ({
      name,
      store,
      metadata,
    }));
  }

  /**
   * Get store metadata
   */
  getMetadata(name) {
    const entry = this.stores.get(name);
    return entry ? entry.metadata : null;
  }

  /**
   * Reset all stores (for testing)
   */
  resetAll() {
    this.stores.forEach(({ store }, name) => {
      if (store.getState && typeof store.getState().reset === "function") {
        store.getState().reset();
        logger.debug(`Reset store: ${name}`);
      }
    });
  }

  /**
   * Get debug information for all stores
   */
  getDebugInfo() {
    const info = {};

    this.stores.forEach(({ store, metadata }, name) => {
      try {
        const state = store.getState();
        info[name] = {
          metadata,
          stateKeys: Object.keys(state),
          hasReset: typeof state.reset === "function",
          hasDebugInfo: typeof state.getDebugInfo === "function",
          debugInfo: state.getDebugInfo ? state.getDebugInfo() : null,
        };
      } catch (error) {
        info[name] = {
          metadata,
          error: error.message,
        };
      }
    });

    return info;
  }

  /**
   * Initialize global debugging helpers
   */
  initializeDevHelpers() {
    if (this.initialized || !import.meta.env.DEV) return;

    // Global debugging functions
    window.__VIOLET_VAULT_DEBUG__ = {
      stores: () => this.getDebugInfo(),
      resetAll: () => this.resetAll(),
      getStore: (name) => this.get(name),
      listStores: () => Array.from(this.stores.keys()),
    };

    logger.info("Store registry dev helpers initialized", {
      stores: Array.from(this.stores.keys()),
    });

    this.initialized = true;
  }
}

// Global instance
export const storeRegistry = new StoreRegistry();

// Auto-initialize in development
if (import.meta.env.DEV) {
  storeRegistry.initializeDevHelpers();
}
```

## 🚀 Usage Examples

### Creating a Settings Store

```javascript
// stores/ui/settingsStore.js
import { createPersistedStore } from "../../utils/stores/createSafeStore.js";
import { storeRegistry } from "../../utils/stores/storeRegistry.js";
import logger from "../../utils/common/logger.js";

const useSettingsStore = createPersistedStore({
  name: "settings",
  initialState: {
    theme: "light",
    language: "en",
    autoSave: true,
    notifications: {
      push: true,
      email: false,
      sound: true,
    },
  },
  actions: {
    setTheme: (set, _getCurrentState, _store, theme) => {
      set((state) => {
        state.theme = theme;
      });
      logger.info("Theme updated", { theme });
    },

    updateNotificationSettings: (set, _getCurrentState, _store, settings) => {
      set((state) => {
        state.notifications = { ...state.notifications, ...settings };
      });
      logger.info("Notification settings updated", settings);
    },

    toggleAutoSave: (set, getCurrentState) => {
      const currentAutoSave = getCurrentState().autoSave;
      set((state) => {
        state.autoSave = !currentAutoSave;
      });
      logger.info("Auto-save toggled", { autoSave: !currentAutoSave });
    },
  },
  options: {
    version: 1,
    persistedKeys: ["theme", "language", "autoSave", "notifications"],
  },
});

// Register for debugging
storeRegistry.register("settings", useSettingsStore, {
  type: "core",
  description: "Global application settings",
  persistent: true,
});

export default useSettingsStore;
```

### Creating a Modal Store

```javascript
// stores/ui/modalStore.js
import { createEphemeralStore } from "../../utils/stores/createSafeStore.js";
import { storeRegistry } from "../../utils/stores/storeRegistry.js";

const useModalStore = createEphemeralStore({
  name: "modal",
  initialState: {
    activeModal: null,
    modalProps: {},
    isClosing: false,
    history: [],
  },
  actions: {
    openModal: (set, _getCurrentState, store, modalName, props = {}) => {
      set((state) => {
        state.history.push({
          modal: state.activeModal,
          props: state.modalProps,
        });
        state.activeModal = modalName;
        state.modalProps = props;
        state.isClosing = false;
      });

      // Auto-focus management
      setTimeout(() => {
        const modal = document.querySelector("[data-modal-focus]");
        if (modal) modal.focus();
      }, 100);
    },

    closeModal: (set, getCurrentState, store) => {
      const state = getCurrentState();
      if (!state.activeModal) return;

      set((state) => {
        state.isClosing = true;
      });

      // Animate out, then clear
      setTimeout(() => {
        set((state) => {
          state.activeModal = null;
          state.modalProps = {};
          state.isClosing = false;
        });
      }, 150);
    },

    goBack: (set, getCurrentState) => {
      const state = getCurrentState();
      const lastModal = state.history.pop();

      if (lastModal) {
        set((state) => {
          state.activeModal = lastModal.modal;
          state.modalProps = lastModal.props;
          state.history = state.history.slice(0, -1);
        });
      } else {
        store.closeModal();
      }
    },
  },
});

// Register for debugging
storeRegistry.register("modal", useModalStore, {
  type: "feature",
  description: "Modal state management",
  persistent: false,
});

export default useModalStore;
```

## 🧪 Testing Templates

### Store Testing Utility

```javascript
// utils/testing/storeTestUtils.js
import { renderHook, act } from "@testing-library/react";
import { storeRegistry } from "../stores/storeRegistry.js";

/**
 * Utility for testing Zustand stores
 */
export class StoreTestHelper {
  constructor(storeHook, storeName) {
    this.storeHook = storeHook;
    this.storeName = storeName;
    this.initialState = null;
  }

  /**
   * Setup test environment
   */
  setup() {
    const { result } = renderHook(() => this.storeHook());
    this.initialState = { ...result.current };
    return result;
  }

  /**
   * Reset store to initial state
   */
  reset() {
    if (this.storeHook.getState().reset) {
      act(() => {
        this.storeHook.getState().reset();
      });
    }
  }

  /**
   * Execute action and return new state
   */
  async executeAction(actionName, ...args) {
    const { result } = renderHook(() => this.storeHook());

    await act(async () => {
      await result.current[actionName](...args);
    });

    return result.current;
  }

  /**
   * Assert state matches expected values
   */
  assertState(expected) {
    const currentState = this.storeHook.getState();

    Object.entries(expected).forEach(([key, value]) => {
      expect(currentState[key]).toEqual(value);
    });
  }

  /**
   * Get current state snapshot
   */
  getState() {
    return this.storeHook.getState();
  }
}

/**
 * Create a test helper for a store
 */
export const createStoreTestHelper = (storeHook, storeName) => {
  return new StoreTestHelper(storeHook, storeName);
};

/**
 * Reset all registered stores (for test cleanup)
 */
export const resetAllStores = () => {
  storeRegistry.resetAll();
};
```

### Test Template

```javascript
// __tests__/stores/settingsStore.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { createStoreTestHelper, resetAllStores } from "../../utils/testing/storeTestUtils.js";
import useSettingsStore from "../../stores/ui/settingsStore.js";

describe("Settings Store", () => {
  let storeHelper;

  beforeEach(() => {
    resetAllStores();
    storeHelper = createStoreTestHelper(useSettingsStore, "settings");
    storeHelper.setup();
  });

  it("should initialize with default state", () => {
    storeHelper.assertState({
      theme: "light",
      language: "en",
      autoSave: true,
    });
  });

  it("should update theme correctly", async () => {
    await storeHelper.executeAction("setTheme", "dark");

    storeHelper.assertState({
      theme: "dark",
    });
  });

  it("should toggle auto-save", async () => {
    await storeHelper.executeAction("toggleAutoSave");

    storeHelper.assertState({
      autoSave: false,
    });

    await storeHelper.executeAction("toggleAutoSave");

    storeHelper.assertState({
      autoSave: true,
    });
  });

  it("should update notification settings partially", async () => {
    await storeHelper.executeAction("updateNotificationSettings", {
      push: false,
      sound: false,
    });

    const state = storeHelper.getState();
    expect(state.notifications).toEqual({
      push: false,
      email: false, // unchanged
      sound: false,
    });
  });

  it("should reset to initial state", async () => {
    // Make changes
    await storeHelper.executeAction("setTheme", "dark");
    await storeHelper.executeAction("toggleAutoSave");

    // Reset
    storeHelper.reset();

    // Verify reset
    storeHelper.assertState({
      theme: "light",
      autoSave: true,
    });
  });
});
```

## 📋 Checklist for New Stores

### ✅ Store Creation Checklist

**Planning:**

- [ ] Determine store type (Core/Feature/Ephemeral)
- [ ] Define clear purpose and scope
- [ ] Identify state that belongs in this store
- [ ] Plan action signatures and behaviors

**Implementation:**

- [ ] Use appropriate template (Core/Feature/Ephemeral)
- [ ] Follow safe patterns (no `get()` in actions)
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Include reset functionality

**Safety:**

- [ ] No `get()` calls in store actions
- [ ] Use store reference pattern for async operations
- [ ] Implement external state access with `getState()`
- [ ] Avoid conditional subscriptions
- [ ] Use selective subscriptions in components

**Testing:**

- [ ] Create comprehensive test suite
- [ ] Test all actions and state changes
- [ ] Test error scenarios
- [ ] Test reset functionality
- [ ] Test persistence (if applicable)

**Integration:**

- [ ] Register in store registry
- [ ] Add to ESLint exclusions if needed
- [ ] Update CLAUDE.md if patterns change
- [ ] Document any special considerations

**Performance:**

- [ ] Verify selective subscriptions work
- [ ] Test with large state objects
- [ ] Verify persistence performance
- [ ] Check for memory leaks

---

**Template Library maintained by**: VioletVault Development Team
**Review Schedule**: After each major Zustand update or architectural change
