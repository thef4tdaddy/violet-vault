import { useEffect } from "react";
import { useFABActions, useFABSelectors } from "../../stores/ui/fabStore";

/**
 * Hook for components to easily register and manage FAB actions
 * Automatically handles cleanup on unmount
 *
 * @param {Object} options - Configuration options
 * @param {Object} [options.primaryAction] - Primary action to register for current screen
 * @param {Array} [options.secondaryActions] - Array of secondary actions to register
 * @param {boolean} [options.visible=true] - Whether FAB should be visible
 * @param {string} [options.screenId] - Override screen ID (defaults to current screen from store)
 */
export const useRegisterFABActions = ({
  primaryAction = null,
  secondaryActions = [],
  visible = true,
  screenId = null,
} = {}) => {
  const { currentScreen } = useFABSelectors();
  const {
    registerPrimaryAction,
    unregisterPrimaryAction,
    registerSecondaryAction,
    unregisterSecondaryAction,
    setVisibility,
  } = useFABActions();

  const targetScreenId = screenId || currentScreen;

  // Register primary action
  useEffect(() => {
    if (primaryAction && targetScreenId) {
      registerPrimaryAction(targetScreenId, primaryAction);

      return () => {
        unregisterPrimaryAction(targetScreenId);
      };
    }
  }, [primaryAction, targetScreenId, registerPrimaryAction, unregisterPrimaryAction]); // FAB actions are stable in Zustand

  // Register secondary actions
  useEffect(() => {
    const actionIds = [];

    secondaryActions.forEach((action) => {
      if (action.id) {
        registerSecondaryAction(action);
        actionIds.push(action.id);
      }
    });

    return () => {
      actionIds.forEach((id) => {
        unregisterSecondaryAction(id);
      });
    };
  }, [secondaryActions, registerSecondaryAction, unregisterSecondaryAction]); // FAB actions are stable in Zustand

  // Set visibility
  useEffect(() => {
    setVisibility(visible);
  }, [visible]); // setVisibility is stable Zustand action, safe to omit from deps
};

/**
 * Hook to set default action handlers (like bug report, sync)
 * Typically used by layout components
 *
 * @param {Object} handlers - Object mapping action IDs to handler functions
 */
export const useSetFABDefaults = (handlers = {}) => {
  const { setDefaultActionHandler } = useFABActions();

  useEffect(() => {
    Object.entries(handlers).forEach(([actionId, handler]) => {
      setDefaultActionHandler(actionId, handler);
    });
  }, [handlers]); // setDefaultActionHandler is stable Zustand action, safe to omit from deps
};

/**
 * Hook to sync current screen with route
 * Typically used by layout components
 *
 * @param {string} screenId - Current screen identifier
 */
export const useSyncFABScreen = (screenId) => {
  const { setCurrentScreen } = useFABActions();

  useEffect(() => {
    if (screenId) {
      setCurrentScreen(screenId);
    }
  }, [screenId]); // setCurrentScreen is stable Zustand action, safe to omit from deps
};

export default useRegisterFABActions;
