import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import logger from '../common/logger.js';

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === 'true';

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
export const createSafeStore = ({
  name,
  initialState,
  actions = {},
  options = {}
}) => {
  const {
    persist: enablePersist = false,
    persistedKeys = null,
    immer: enableImmer = true,
    devtools: enableDevtools = true,
    version = 1
  } = options;

  // Validate configuration
  if (!name || typeof name !== 'string') {
    throw new Error('Store name is required and must be a string');
  }

  if (!initialState || typeof initialState !== 'object') {
    throw new Error('Initial state is required and must be an object');
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
              args: args.length
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
          version
        };
      }
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
      version
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
    actions: Object.keys(actions)
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
      persist: true
    }
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
      persist: false
    }
  });
};