import { useCallback } from "react";
import { logger } from "../../utils/common/logger";

/**
 * Quick Add Hook - Handles quick action functionality
 *
 * Provides handlers for common quick add actions like transactions,
 * bills, and envelopes. Can be extended with actual implementation
 * logic or modal triggers.
 */
export const useQuickAdd = () => {
  const onQuickTransaction = useCallback(() => {
    logger.userAction("Quick add transaction triggered", {
      component: "QuickAddCard",
      action: "transaction",
    });
    // TODO: Implement quick transaction modal/flow
  }, []);

  const onQuickBill = useCallback(() => {
    logger.userAction("Quick add bill triggered", {
      component: "QuickAddCard",
      action: "bill",
    });
    // TODO: Implement quick bill creation modal/flow
  }, []);

  const onQuickEnvelope = useCallback(() => {
    logger.userAction("Quick add envelope triggered", {
      component: "QuickAddCard",
      action: "envelope",
    });
    // TODO: Implement quick envelope creation modal/flow
  }, []);

  return {
    onQuickTransaction,
    onQuickBill,
    onQuickEnvelope,
  };
};
