import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import logger from "../common/logger.js";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

// Validation helpers
const validateConfig = (name, initialState) => {
  if (!name || typeof name !== "string") {
    throw new Error("Store name is required and must be a string");
  }
  if (!initialState || typeof initialState !== "object") {
    throw new Error("Initial state is required and must be an object");
  }
};

// Action wrapper utility
const wrapActions = (actions, name, set, useStore, store) => {
  return Object.entries(actions).reduce((acc, [actionName, actionFn]) => {
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
const buildMiddlewareStack = (storeInitializer, options, name) => {
  const { enablePersist, persistedKeys, enableImmer, enableDevtools, version } = options;
  let middlewareStack = storeInitializer;

  if (enableImmer) {
    middlewareStack = immer(middlewareStack);
  }

  if (enablePersist && !LOCAL_ONLY_MODE) {
    const persistConfig = { name: `violet-vault-${name}`, version };

    if (persistedKeys && Array.isArray(persistedKeys)) {
      persistConfig.partialize = (state) =>
        persistedKeys.reduce((acc, key) => {
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
export const createSafeStore = ({ name, initialState, actions = {}, options = {} }) => {
  const {
    persist: enablePersist = false,
    persistedKeys = null,
    immer: enableImmer = true,
    devtools: enableDevtools = true,
    version = 1,
  } = options;

  validateConfig(name, initialState);

  let useStore;

  const storeInitializer = (set, _get) => {
    const store = {
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
