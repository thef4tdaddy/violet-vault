import { useState } from "react";
import { shareCodeUtils } from "@/utils/security/shareCodeUtils";
import { useToastHelpers } from "@/utils/common/toastHelpers";
import logger from "@/utils/common/logger";

interface JoinBudgetParams {
  shareCode: string;
  password: string;
  userName: string;
  userColor: string;
  onJoinSuccess?: (budgetInfo: {
    budgetId: string;
    password: string;
    userInfo: {
      id: string;
      userName: string;
      userColor: string;
      joinedVia: string;
      joinedAt: number;
    };
    shareCode: string;
    sharedBy: string;
    userCount: number;
  }) => void;
  onClose: () => void;
}

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
  }: JoinBudgetParams) => {
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
      const errorMessage = error instanceof Error ? error.message : "Failed to join budget";
      showErrorToast(errorMessage);
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
