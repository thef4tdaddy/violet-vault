import logger from "../common/logger.ts";

/**
 * Global store registry for development and debugging
 */
class StoreRegistry {
  stores: Map<string, any>;
  initialized: boolean;

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
      if (!(window as any).__VIOLET_VAULT_STORES__) {
        (window as any).__VIOLET_VAULT_STORES__ = {};
      }
      (window as any).__VIOLET_VAULT_STORES__[name] = store;
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

/**
 * Initialize store registry dev helpers
 * MUST be called from App.tsx useEffect during mount, not at module scope
 * to avoid React Error #185 infinite render loops
 */
export const initializeStoreRegistry = () => {
  if (import.meta.env.DEV) {
    storeRegistry.initializeDevHelpers();
  }
};
