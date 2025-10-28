import { create, StoreApi, StateCreator } from "zustand";
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

type StoreAction = (
  set: (fn: (state: Record<string, unknown>) => Record<string, unknown> | void) => void,
  getState: () => Record<string, unknown>,
  store: Record<string, unknown>,
  ...args: unknown[]
) => unknown;

interface CreateSafeStoreConfig<T> {
  name: string;
  initialState: T;
  actions?: Record<string, StoreAction>;
  options?: StoreOptions;
}

// Validation helpers
const validateConfig = (name: string, initialState: Record<string, unknown>): void => {
  if (!name || typeof name !== "string") {
    throw new Error("Store name is required and must be a string");
  }
  if (!initialState || typeof initialState !== "object") {
    throw new Error("Initial state is required and must be an object");
  }
};

// Action wrapper utility
const wrapActions = (
  actions: Record<string, StoreAction>,
  name: string,
  set: (fn: (state: Record<string, unknown>) => Record<string, unknown> | void) => void,
  useStore: StoreApi<Record<string, unknown>>,
  store: Record<string, unknown>
): Record<string, unknown> => {
  return Object.entries(actions).reduce<Record<string, unknown>>((acc, [actionName, actionFn]) => {
    acc[actionName] = (...args: unknown[]) => {
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
interface MiddlewareOptions {
  enablePersist: boolean;
  persistedKeys: string[] | null;
  enableImmer: boolean;
  enableDevtools: boolean;
  version: number;
}

const buildMiddlewareStack = (
  storeInitializer: StateCreator<Record<string, unknown>>,
  options: MiddlewareOptions,
  name: string
): StateCreator<Record<string, unknown>> => {
  const { enablePersist, persistedKeys, enableImmer, enableDevtools, version } = options;
  let middlewareStack: StateCreator<Record<string, unknown>, [], []> = storeInitializer as StateCreator<Record<string, unknown>, [], []>;

  if (enableImmer) {
    middlewareStack = immer(middlewareStack) as unknown as StateCreator<Record<string, unknown>, [], []>;
  }

  if (enablePersist && !LOCAL_ONLY_MODE) {
    const persistConfig: PersistOptions<Record<string, unknown>> = {
      name: `violet-vault-${name}`,
      version,
    };

    if (persistedKeys && Array.isArray(persistedKeys)) {
      persistConfig.partialize = (state: Record<string, unknown>): Record<string, unknown> =>
        persistedKeys.reduce<Record<string, unknown>>((acc, key: string) => {
          if (key in state) acc[key] = state[key];
          return acc;
        }, {});
    }

    middlewareStack = persist(middlewareStack, persistConfig) as unknown as StateCreator<Record<string, unknown>, [], []>;
  }

  if (enableDevtools) {
    middlewareStack = devtools(middlewareStack, { name: `${name}-devtools` }) as unknown as StateCreator<Record<string, unknown>, [], []>;
  }

  return subscribeWithSelector(middlewareStack) as unknown as StateCreator<Record<string, unknown>>;
};

/**
 * Creates a safe Zustand store with standard middleware and error handling
 */
export const createSafeStore = <T extends object>({
  name,
  initialState,
  actions = {},
  options = {},
}: CreateSafeStoreConfig<T>): StoreApi<T & Record<string, unknown>> => {
  const {
    persist: enablePersist = false,
    persistedKeys = null,
    immer: enableImmer = true,
    devtools: enableDevtools = true,
    version = 1,
  } = options;

  validateConfig(name, initialState as Record<string, unknown>);

  let useStore: StoreApi<T & Record<string, unknown>>;

  const storeInitializer: StateCreator<T & Record<string, unknown>> = (set, _get) => {
    const store: T & Record<string, unknown> = {
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

    // Add wrapped actions - cast set to the correct type
    const wrappedActions = wrapActions(
      actions, 
      name, 
      set as (fn: (state: Record<string, unknown>) => Record<string, unknown> | void) => void, 
      useStore, 
      store
    );
    Object.assign(store, wrappedActions);
    return store as T & Record<string, unknown>;
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

  useStore = create(middlewareStack) as unknown as StoreApi<T & Record<string, unknown>>;

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
