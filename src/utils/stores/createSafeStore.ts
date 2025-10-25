import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools, PersistOptions } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import logger from "../common/logger.ts";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

interface StoreOptions {
  persist?: boolean;
  persistedKeys?: string[] | null;
  immer?: boolean;
  devtools?: boolean;
  version?: number;
}

interface CreateSafeStoreConfig<T> {
  name: string;
  initialState: T;
  actions?: Record<string, (...args: any[]) => any>;
  options?: StoreOptions;
}

// Validation helpers
const validateConfig = (name: string, initialState: any) => {
  if (!name || typeof name !== "string") {
    throw new Error("Store name is required and must be a string");
  }
  if (!initialState || typeof initialState !== "object") {
    throw new Error("Initial state is required and must be an object");
  }
};

// Action wrapper utility
const wrapActions = (
  actions: Record<string, (...args: any[]) => any>,
  name: string,
  set: any,
  useStore: any,
  store: any
) => {
  return Object.entries(actions).reduce((acc: any, [actionName, actionFn]) => {
    acc[actionName] = (...args) => {
      try {
        const getCurrentState = () => useStore.getState();
        const result = actionFn(set, getCurrentState, store, ...args);

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
  }, {});
};

// Middleware stack builder
const buildMiddlewareStack = (storeInitializer: any, options: any, name: string) => {
  const { enablePersist, persistedKeys, enableImmer, enableDevtools, version } = options;
  let middlewareStack: any = storeInitializer;

  if (enableImmer) {
    middlewareStack = immer(middlewareStack);
  }

  if (enablePersist && !LOCAL_ONLY_MODE) {
    const persistConfig: PersistOptions<any, any> = {
      name: `violet-vault-${name}`,
      version,
    } as PersistOptions<any, any>;

    if (persistedKeys && Array.isArray(persistedKeys)) {
      persistConfig.partialize = (state: any) =>
        persistedKeys.reduce((acc: any, key: string) => {
          if (key in state) acc[key] = state[key];
          return acc;
        }, {});
    }

    middlewareStack = persist(middlewareStack, persistConfig);
  }

  if (enableDevtools) {
    middlewareStack = devtools(middlewareStack, { name: `${name}-devtools` });
  }

  return subscribeWithSelector(middlewareStack);
};

/**
 * Creates a safe Zustand store with standard middleware and error handling
 */
export const createSafeStore = <T extends object>({
  name,
  initialState,
  actions = {},
  options = {},
}: CreateSafeStoreConfig<T>) => {
  const {
    persist: enablePersist = false,
    persistedKeys = null,
    immer: enableImmer = true,
    devtools: enableDevtools = true,
    version = 1,
  } = options;

  validateConfig(name, initialState);

  let useStore: any;

  const storeInitializer = (set: any, _get: any) => {
    const store: any = {
      ...initialState,
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

    // Add wrapped actions
    Object.assign(store, wrapActions(actions, name, set, useStore, store));
    return store;
  };

  const middlewareStack = buildMiddlewareStack(
    storeInitializer,
    {
      enablePersist,
      persistedKeys,
      enableImmer,
      enableDevtools,
      version,
    },
    name
  );

  useStore = create(middlewareStack);

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
export const createPersistedStore = <T extends object>(config: CreateSafeStoreConfig<T>) => {
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
export const createEphemeralStore = <T extends object>(config: CreateSafeStoreConfig<T>) => {
  return createSafeStore({
    ...config,
    options: {
      ...config.options,
      persist: false,
    },
  });
};
