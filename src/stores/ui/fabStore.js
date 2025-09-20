import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import logger from "../../utils/common/logger";

/**
 * Default secondary actions that are always available
 */
const getDefaultSecondaryActions = () => ({
  "bug-report": {
    id: "bug-report",
    icon: "Bug",
    label: "Report Bug",
    color: "bg-red-500 hover:bg-red-600",
    action: null, // Will be set by components
  },
  "manual-sync": {
    id: "manual-sync",
    icon: "RefreshCw",
    label: "Sync",
    color: "bg-blue-500 hover:bg-blue-600",
    action: null, // Will be set by components
  },
});

/**
 * Get current primary action for screen
 */
const getCurrentPrimaryAction = (state) => {
  const { currentScreen, primaryActions } = state;
  return primaryActions.get(currentScreen) || null;
};

/**
 * Get all secondary actions (default + custom)
 */
const getAllSecondaryActions = (state) => {
  const { secondaryActions, defaultSecondaryActions } = state;
  const actions = [];

  // Add default actions that have handlers
  Object.values(defaultSecondaryActions).forEach(action => {
    if (action.action) {
      actions.push(action);
    }
  });

  // Add custom secondary actions
  secondaryActions.forEach(action => {
    actions.push(action);
  });

  return actions;
};

/**
 * Check if FAB should be shown
 */
const getShouldShowFAB = (state) => {
  const { isVisible } = state;
  const primaryAction = getCurrentPrimaryAction(state);
  const secondaryActions = getAllSecondaryActions(state);

  return isVisible && (primaryAction !== null || secondaryActions.length > 0);
};

/**
 * FAB Store - Manages floating action button state using Zustand
 * Provides global state management for FAB actions and visibility
 */
export const useFABStore = create(
  subscribeWithSelector(
    devtools(
      immer((set, get) => ({
        // Core state
        isVisible: true,
        isExpanded: false,
        currentScreen: "dashboard",

        // Actions registry
        primaryActions: new Map(), // Map<screenId, action>
        secondaryActions: new Map(), // Map<actionId, action>

        // Default secondary actions
        defaultSecondaryActions: getDefaultSecondaryActions(),

        // Actions
        setCurrentScreen: (screenId) => {
          set((state) => {
            state.currentScreen = screenId;
            state.isExpanded = false; // Auto-collapse on screen change
          });
        },

        setVisibility: (visible) => {
          set((state) => {
            state.isVisible = visible;
            if (!visible) {
              state.isExpanded = false;
            }
          });
        },

        setExpanded: (expanded) => {
          set((state) => {
            state.isExpanded = expanded;
          });
        },

        toggleExpanded: () => {
          set((state) => {
            state.isExpanded = !state.isExpanded;
          });
        },

        // Primary action management
        registerPrimaryAction: (screenId, action) => {
          set((state) => {
            state.primaryActions.set(screenId, action);
          });
          logger.debug(`FAB: Registered primary action for ${screenId}`, { action: action.label });
        },

        unregisterPrimaryAction: (screenId) => {
          set((state) => {
            state.primaryActions.delete(screenId);
          });
          logger.debug(`FAB: Unregistered primary action for ${screenId}`);
        },

        // Secondary action management
        registerSecondaryAction: (action) => {
          if (!action.id) {
            logger.warn("FAB: Secondary action must have an id", action);
            return;
          }

          set((state) => {
            state.secondaryActions.set(action.id, action);
          });
          logger.debug(`FAB: Registered secondary action ${action.id}`, { action: action.label });
        },

        unregisterSecondaryAction: (actionId) => {
          set((state) => {
            state.secondaryActions.delete(actionId);
          });
          logger.debug(`FAB: Unregistered secondary action ${actionId}`);
        },

        // Set default action handlers (like bug report)
        setDefaultActionHandler: (actionId, handler) => {
          set((state) => {
            if (state.defaultSecondaryActions[actionId]) {
              state.defaultSecondaryActions[actionId].action = handler;
            }
          });
        },

        // Clear all actions for current screen
        clearScreenActions: (screenId) => {
          set((state) => {
            state.primaryActions.delete(screenId);
          });
          logger.debug(`FAB: Cleared actions for ${screenId}`);
        },

        // Getters (computed values)
        getCurrentPrimaryAction: () => getCurrentPrimaryAction(get()),
        getAllSecondaryActions: () => getAllSecondaryActions(get()),
        getShouldShowFAB: () => getShouldShowFAB(get()),

        // Debug method
        getDebugInfo: () => {
          const state = get();
          return {
            currentScreen: state.currentScreen,
            isVisible: state.isVisible,
            isExpanded: state.isExpanded,
            primaryActionsCount: state.primaryActions.size,
            secondaryActionsCount: state.secondaryActions.size,
            defaultActionsWithHandlers: Object.values(state.defaultSecondaryActions)
              .filter(a => a.action !== null).length,
          };
        },
      })),
      {
        name: "fab-store",
        // Only store non-function values in devtools
        serialize: {
          options: {
            map: false, // Don't serialize Maps
            function: false, // Don't serialize functions
          },
        },
      }
    )
  )
);

/**
 * Hook for easy access to FAB store selectors
 */
export const useFABSelectors = () => {
  const currentScreen = useFABStore((state) => state.currentScreen);
  const isVisible = useFABStore((state) => state.isVisible);
  const isExpanded = useFABStore((state) => state.isExpanded);
  const shouldShowFAB = useFABStore((state) => state.getShouldShowFAB());
  const primaryAction = useFABStore((state) => state.getCurrentPrimaryAction());
  const secondaryActions = useFABStore((state) => state.getAllSecondaryActions());

  return {
    currentScreen,
    isVisible,
    isExpanded,
    shouldShowFAB,
    primaryAction,
    secondaryActions,
  };
};

/**
 * Hook for FAB actions
 */
export const useFABActions = () => {
  const setCurrentScreen = useFABStore((state) => state.setCurrentScreen);
  const setVisibility = useFABStore((state) => state.setVisibility);
  const setExpanded = useFABStore((state) => state.setExpanded);
  const toggleExpanded = useFABStore((state) => state.toggleExpanded);
  const registerPrimaryAction = useFABStore((state) => state.registerPrimaryAction);
  const unregisterPrimaryAction = useFABStore((state) => state.unregisterPrimaryAction);
  const registerSecondaryAction = useFABStore((state) => state.registerSecondaryAction);
  const unregisterSecondaryAction = useFABStore((state) => state.unregisterSecondaryAction);
  const setDefaultActionHandler = useFABStore((state) => state.setDefaultActionHandler);
  const clearScreenActions = useFABStore((state) => state.clearScreenActions);

  return {
    setCurrentScreen,
    setVisibility,
    setExpanded,
    toggleExpanded,
    registerPrimaryAction,
    unregisterPrimaryAction,
    registerSecondaryAction,
    unregisterSecondaryAction,
    setDefaultActionHandler,
    clearScreenActions,
  };
};

export default useFABStore;