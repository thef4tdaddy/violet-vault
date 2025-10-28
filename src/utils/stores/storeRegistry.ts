import logger from "../common/logger.ts";

/**
 * Global store registry for development and debugging
 */
class StoreRegistry {
  stores: Map<string, { store: unknown; metadata: Record<string, unknown> }>;
  initialized: boolean;

  constructor() {
    this.stores = new Map();
    this.initialized = false;
  }

  /**
   * Register a store in the global registry
   */
  register(name: string, store: unknown, metadata: Record<string, unknown> = {}): void {
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
      const globalWindow = window as unknown as Record<string, unknown>;
      if (!globalWindow.__VIOLET_VAULT_STORES__) {
        globalWindow.__VIOLET_VAULT_STORES__ = {};
      }
      (globalWindow.__VIOLET_VAULT_STORES__ as Record<string, unknown>)[name] = store;
    }
  }

  /**
   * Get a registered store
   */
  get(name: string): unknown {
    const entry = this.stores.get(name);
    return entry ? entry.store : null;
  }

  /**
   * Get all registered stores
   */
  getAll(): Array<{ name: string; store: unknown; metadata: Record<string, unknown> }> {
    return Array.from(this.stores.entries()).map(([name, { store, metadata }]) => ({
      name,
      store,
      metadata,
    }));
  }

  /**
   * Get store metadata
   */
  getMetadata(name: string): Record<string, unknown> | null {
    const entry = this.stores.get(name);
    return entry ? entry.metadata : null;
  }

  /**
   * Reset all stores (for testing)
   */
  resetAll(): void {
    this.stores.forEach(({ store }, name) => {
      const storeWithReset = store as { getState?: () => { reset?: () => void } };
      if (storeWithReset.getState && typeof storeWithReset.getState().reset === "function") {
        storeWithReset.getState().reset?.();
        logger.debug(`Reset store: ${name}`);
      }
    });
  }

  /**
   * Get debug information for all stores
   */
  getDebugInfo(): Record<string, unknown> {
    const info: Record<string, unknown> = {};

    this.stores.forEach(({ store, metadata }, name) => {
      try {
        const storeWithState = store as { getState: () => Record<string, unknown> & { reset?: () => void; getDebugInfo?: () => unknown } };
        const state = storeWithState.getState();
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
          error: (error as Error).message,
        };
      }
    });

    return info;
  }

  /**
   * Initialize global debugging helpers
   */
  initializeDevHelpers(): void {
    if (this.initialized || !import.meta.env.DEV) return;

    // Global debugging functions
    (window as Window & {
      __VIOLET_VAULT_DEBUG__?: {
        stores: () => Record<string, unknown>;
        resetAll: () => void;
        getStore: (name: string) => unknown;
        listStores: () => string[];
      };
    }).__VIOLET_VAULT_DEBUG__ = {
      stores: () => this.getDebugInfo(),
      resetAll: () => this.resetAll(),
      getStore: (name: string) => this.get(name),
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
