import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { encryptionUtils } from "../../../utils/security/encryption";
import logger from "../../../utils/common/logger";
import { identifyUser } from "../../../utils/common/highlight";
import localStorageService from "../../../services/storage/localStorageService";
import type { UserData } from "../../../types/auth";
import type { SessionData } from "../../../contexts/authConstants";

interface UserInfo {
  userName?: string;
  email?: string;
  userColor?: string;
  [key: string]: unknown;
}

interface JoinBudgetData {
  budgetId: string;
  password: string;
  userInfo: UserInfo;
  sharedBy: string;
}

interface JoinBudgetResult {
  success: boolean;
  user?: UserData;
  sessionData?: SessionData;
  sharedBudget?: boolean;
  error?: string;
}

/**
 * Helper function to process join budget operation
 */
const processJoinBudget = async (joinData: JoinBudgetData): Promise<JoinBudgetResult> => {
  const keyData = await encryptionUtils.deriveKey(joinData.password);
  const newSalt = keyData.salt;
  const key = keyData.key;

  const finalUserData = {
    ...joinData.userInfo,
    budgetId: joinData.budgetId,
    joinedVia: "shareCode",
    sharedBy: joinData.sharedBy,
    userName: joinData.userInfo?.userName?.trim() || "Shared User",
    userColor: joinData.userInfo?.userColor || "#a855f7",
  };

  // Save user profile
  const profileData = {
    userName: finalUserData.userName,
    userColor: finalUserData.userColor,
    joinedVia: "shareCode",
    sharedBy: joinData.sharedBy,
  };
  localStorageService.setUserProfile(profileData);

  // Save encrypted budget data for persistence
  const initialBudgetData = JSON.stringify({
    ...finalUserData,
    bills: [],
    categories: [],
    createdAt: Date.now(),
    lastModified: Date.now(),
  });

  const encrypted = await encryptionUtils.encrypt(initialBudgetData, key);
  localStorageService.setBudgetData({
    encryptedData: encrypted.data,
    salt: Array.from(newSalt),
    iv: encrypted.iv,
  });

  // Identify shared user for tracking
  identifyUser(finalUserData.budgetId, {
    userName: finalUserData.userName,
    userColor: finalUserData.userColor,
    accountType: "shared_user",
    sharedBy: joinData.sharedBy,
  });

  return {
    success: true,
    user: finalUserData,
    sessionData: { encryptionKey: key, salt: newSalt },
    sharedBudget: true,
  };
};

/**
 * Hook for joining budget with share code
 */
export const useJoinBudgetMutation = () => {
  const { setAuthenticated, setError, setLoading } = useAuth();

  return useMutation<JoinBudgetResult, Error, JoinBudgetData>({
    mutationFn: async (joinData: JoinBudgetData): Promise<JoinBudgetResult> => {
      logger.auth("Join budget attempt started.", {
        budgetId: joinData.budgetId?.substring(0, 8) + "...",
        hasPassword: !!joinData.password,
        hasUserInfo: !!joinData.userInfo,
        sharedBy: joinData.sharedBy,
      });

      const timeoutPromise = new Promise<JoinBudgetResult>((_, reject) =>
        setTimeout(() => reject(new Error("Join timeout after 10 seconds")), 10000)
      );

      const joinPromise = async () => {
        try {
          return await processJoinBudget(joinData);
        } catch (error) {
          logger.error("Join budget failed.", error);
          return {
            success: false,
            error: "Failed to join budget. Please try again.",
          };
        }
      };

      return Promise.race([joinPromise(), timeoutPromise]);
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: async (result: JoinBudgetResult) => {
      if (result.success && result.user) {
        setAuthenticated(result.user, result.sessionData);

        // Start background sync
        try {
          const syncDelay = 2500;
          await new Promise((resolve) => setTimeout(resolve, syncDelay));

          const { useBudgetStore } = await import("../../../stores/ui/uiStore");
          const budgetState = useBudgetStore.getState();

          if (budgetState.cloudSyncEnabled) {
            await budgetState.startBackgroundSync();
          }
        } catch (error) {
          logger.error("Failed to start background sync after join", error);
        }
      } else {
        setError(result.error);
      }
      setLoading(false);
    },
    onError: (error: Error) => {
      logger.error("Join budget mutation failed", error);
      setError(error.message || "Failed to join budget");
      setLoading(false);
    },
  });
};
