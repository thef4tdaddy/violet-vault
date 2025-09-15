import { useState } from "react";
import { shareCodeUtils } from "../../utils/security/shareCodeUtils";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import logger from "../../utils/common/logger";

/**
 * Custom hook for share code validation logic
 * Extracted from JoinBudgetModal to reduce complexity
 */
export const useShareCodeValidation = () => {
  const [shareInfo, setShareInfo] = useState(null);
  const [creatorInfo, setCreatorInfo] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const { showSuccessToast, showErrorToast } = useToastHelpers();

  const validateShareCode = async (code) => {
    if (!code.trim()) {
      logger.warn("validateShareCode called with empty code");
      return false;
    }

    logger.info("Validating share code", { code: code.trim() });
    setIsValidating(true);

    try {
      const normalizedCode = shareCodeUtils.normalizeShareCode(code.trim());
      const isValid = shareCodeUtils.validateShareCode(normalizedCode);

      logger.info("Share code validation result", {
        originalCode: code,
        normalizedCode,
        isValid,
      });

      if (isValid) {
        setShareInfo({
          createdBy: "Shared Budget",
          createdAt: Date.now(),
          expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
          userCount: "Multiple users can join",
        });

        setCreatorInfo(null);
        showSuccessToast("Share code is valid! Now set your password.");
        return true;
      } else {
        logger.warn("Share code validation failed", { normalizedCode });
        showErrorToast(
          "Invalid share code format. Please enter 4 valid words.",
        );
        setShareInfo(null);
        return false;
      }
    } catch (error) {
      logger.error("Failed to validate share code", error);
      showErrorToast("Failed to validate share code");
      setShareInfo(null);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const resetValidation = () => {
    setShareInfo(null);
    setCreatorInfo(null);
  };

  return {
    shareInfo,
    creatorInfo,
    isValidating,
    validateShareCode,
    resetValidation,
  };
};
