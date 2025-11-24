import { useEffect } from "react";
import { useFABActions, useFABSelectors } from "../../stores/ui/fabStore";

/**
 * FABAction interface - matches the interface in fabStore.ts
 * Note: This is duplicated here as fabStore.ts doesn't export the type.
 * If the original interface changes, this must be updated accordingly.
 */
interface FABAction {
  id: string;
  icon: string;
  label: string;
  color: string;
  action: (() => void) | null;
}

interface RegisterFABActionsOptions {
  primaryAction?: FABAction | null;
  secondaryActions?: FABAction[];
  visible?: boolean;
  screenId?: string | null;
}

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
}: RegisterFABActionsOptions = {}) => {
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
    const actionIds: string[] = [];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]); // setVisibility is stable Zustand action
};

/**
 * Hook to set default action handlers (like bug report, sync)
 * Typically used by layout components
 *
 * @param {Object} handlers - Object mapping action IDs to handler functions
 */
export const useSetFABDefaults = (handlers: Record<string, () => void> = {}) => {
  const { setDefaultActionHandler } = useFABActions();

  useEffect(() => {
    Object.entries(handlers).forEach(([actionId, handler]) => {
      setDefaultActionHandler(actionId, handler);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlers]); // setDefaultActionHandler is stable Zustand action
};

/**
 * Hook to sync current screen with route
 * Typically used by layout components
 *
 * @param {string} screenId - Current screen identifier
 */
export const useSyncFABScreen = (screenId: string) => {
  const { setCurrentScreen } = useFABActions();

  useEffect(() => {
    if (screenId) {
      setCurrentScreen(screenId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setCurrentScreen is stable Zustand action
  }, [screenId]);
};

export default useRegisterFABActions;
