import { useState } from "react";
import { shareCodeUtils } from "../../utils/security/shareCodeUtils";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import logger from "../../utils/common/logger";

/**
 * Custom hook for budget joining logic
 * Extracted from JoinBudgetModal to reduce complexity
 */
export const useBudgetJoining = () => {
  const [isJoining, setIsJoining] = useState(false);

  const { showSuccessToast, showErrorToast } = useToastHelpers();

  const joinBudget = async ({
    shareCode,
    password,
    userName,
    userColor,
    onJoinSuccess,
    onClose,
  }) => {
    if (!shareCode || !password || !userName.trim()) {
      showErrorToast("Please fill in all required fields");
      return false;
    }

    setIsJoining(true);
    try {
      const normalizedShareCode = shareCodeUtils.normalizeShareCode(shareCode.trim());

      // Generate deterministic budget ID from password and share code
      const budgetId = await shareCodeUtils.generateBudgetId(password, normalizedShareCode);

      const userInfo = {
        id: `user_${Date.now()}`,
        userName: userName.trim(),
        userColor,
        joinedVia: "shareCode",
        joinedAt: Date.now(),
      };

      logger.info("Generated budget ID for join", {
        budgetIdPreview: budgetId.substring(0, 10) + "...",
        shareCodePreview: normalizedShareCode.split(" ").slice(0, 2).join(" ") + " ...",
      });

      showSuccessToast("Successfully joined shared budget!");

      // Call parent success handler with the joined budget info
      if (onJoinSuccess) {
        onJoinSuccess({
          budgetId,
          password,
          userInfo,
          shareCode: normalizedShareCode,
          sharedBy: "Shared Budget",
          userCount: 1,
        });
      }

      onClose();

      // Clear URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("share");
      window.history.replaceState({}, "", url.toString());

      return true;
    } catch (error) {
      logger.error("Failed to join budget", error);
      showErrorToast(error.message || "Failed to join budget");
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  return {
    isJoining,
    joinBudget,
  };
};
