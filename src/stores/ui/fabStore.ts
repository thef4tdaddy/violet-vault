import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import logger from "@/utils/common/logger";

// Type definitions for FAB store
interface FABAction {
  id: string;
  icon: string;
  label: string;
  color: string;
  action: (() => void) | null;
}

interface DefaultSecondaryActions {
  [key: string]: FABAction;
}

interface FABState {
  // Core state
  isVisible: boolean;
  isExpanded: boolean;
  currentScreen: string;

  // Actions registry
  primaryActions: Map<string, FABAction>;
  secondaryActions: Map<string, FABAction>;
  defaultSecondaryActions: DefaultSecondaryActions;

  // Actions
  setCurrentScreen: (screenId: string) => void;
  setVisibility: (visible: boolean) => void;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
  registerPrimaryAction: (screenId: string, action: FABAction) => void;
  unregisterPrimaryAction: (screenId: string) => void;
  registerSecondaryAction: (action: FABAction) => void;
  unregisterSecondaryAction: (actionId: string) => void;
  setDefaultActionHandler: (actionId: string, handler: () => void) => void;
  clearScreenActions: (screenId: string) => void;
  getDebugInfo: () => {
    currentScreen: string;
    isVisible: boolean;
    isExpanded: boolean;
    primaryActionsCount: number;
    secondaryActionsCount: number;
    defaultActionsWithHandlers: number;
  };
}

/**
 * Default secondary actions that are always available
 */
const getDefaultSecondaryActions = (): DefaultSecondaryActions => ({
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
const getCurrentPrimaryAction = (state: FABState): FABAction | null => {
  const { currentScreen, primaryActions } = state;
  return primaryActions.get(currentScreen) || null;
};

/**
 * Get all secondary actions (default + custom)
 */
const getAllSecondaryActions = (state: FABState): FABAction[] => {
  const { secondaryActions, defaultSecondaryActions } = state;
  const actions: FABAction[] = [];

  // Add default actions that have handlers
  Object.values(defaultSecondaryActions).forEach((action) => {
    if (action.action) {
      actions.push(action);
    }
  });

  // Add custom secondary actions
  secondaryActions.forEach((action) => {
    actions.push(action);
  });

  return actions;
};

/**
 * Create store actions object
 */
const createStoreActions = (
  set: (fn: (state: FABState) => void) => void,
  _get: () => FABState
) => ({
  setCurrentScreen: (screenId: string) => {
    set((state) => {
      state.currentScreen = screenId;
      state.isExpanded = false;
    });
  },

  setVisibility: (visible: boolean) => {
    set((state) => {
      state.isVisible = visible;
      if (!visible) {
        state.isExpanded = false;
      }
    });
  },

  setExpanded: (expanded: boolean) => {
    set((state) => {
      state.isExpanded = expanded;
    });
  },

  toggleExpanded: () => {
    set((state) => {
      state.isExpanded = !state.isExpanded;
    });
  },
});

/**
 * Create action management methods
 */
const createActionManagement = (
  set: (fn: (state: FABState) => void) => void,
  _get: () => FABState
) => ({
  registerPrimaryAction: (screenId: string, action: FABAction) => {
    set((state) => {
      state.primaryActions.set(screenId, action);
    });
    logger.debug(`FAB: Registered primary action for ${screenId}`, {
      action: action.label,
    });
  },

  unregisterPrimaryAction: (screenId: string) => {
    set((state) => {
      state.primaryActions.delete(screenId);
    });
    logger.debug(`FAB: Unregistered primary action for ${screenId}`);
  },

  registerSecondaryAction: (action: FABAction) => {
    if (!action.id) {
      logger.warn("FAB: Secondary action must have an id", {
        actionId: action.id,
        actionLabel: action.label,
      });
      return;
    }

    set((state) => {
      state.secondaryActions.set(action.id, action);
    });
    logger.debug(`FAB: Registered secondary action ${action.id}`, {
      action: action.label,
    });
  },

  unregisterSecondaryAction: (actionId: string) => {
    set((state) => {
      state.secondaryActions.delete(actionId);
    });
    logger.debug(`FAB: Unregistered secondary action ${actionId}`);
  },

  setDefaultActionHandler: (actionId: string, handler: () => void) => {
    set((state) => {
      if (state.defaultSecondaryActions[actionId]) {
        state.defaultSecondaryActions[actionId].action = handler;
      }
    });
  },

  clearScreenActions: (screenId: string) => {
    set((state) => {
      state.primaryActions.delete(screenId);
    });
    logger.debug(`FAB: Cleared actions for ${screenId}`);
  },
});

/**
 * Check if FAB should be shown
 */
const getShouldShowFAB = (state: FABState): boolean => {
  const { isVisible } = state;
  const primaryAction = getCurrentPrimaryAction(state);
  const secondaryActions = getAllSecondaryActions(state);

  return isVisible && (primaryAction !== null || secondaryActions.length > 0);
};

/**
 * FAB Store - Manages floating action button state using Zustand
 * Provides global state management for FAB actions and visibility
 */
export const useFABStore = create<FABState>()(
  subscribeWithSelector(
    devtools(
      immer((set, get) => {
        const storeActions = createStoreActions(
          set as (fn: (state: FABState) => void) => void,
          get
        );
        const actionManagement = createActionManagement(
          set as (fn: (state: FABState) => void) => void,
          get
        );

        return {
          // Core state
          isVisible: true,
          isExpanded: false,
          currentScreen: "dashboard",

          // Actions registry
          primaryActions: new Map<string, FABAction>(),
          secondaryActions: new Map<string, FABAction>(),

          // Default secondary actions
          defaultSecondaryActions: getDefaultSecondaryActions(),

          // Spread all actions
          ...storeActions,
          ...actionManagement,

          // Computed values are now accessed directly in selectors

          // Debug method
          getDebugInfo: () => {
            // Safe external store access (prevents React error #185)
            const state = useFABStore.getState();
            return {
              currentScreen: state.currentScreen,
              isVisible: state.isVisible,
              isExpanded: state.isExpanded,
              primaryActionsCount: state.primaryActions.size,
              secondaryActionsCount: state.secondaryActions.size,
              defaultActionsWithHandlers: (
                Object.values(state.defaultSecondaryActions) as FABAction[]
              ).filter((a) => a.action !== null).length,
            };
          },
        };
      }),
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
  const shouldShowFAB = useFABStore((state) => getShouldShowFAB(state));
  const primaryAction = useFABStore((state) => getCurrentPrimaryAction(state));
  const secondaryActions = useFABStore((state) => getAllSecondaryActions(state));

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
