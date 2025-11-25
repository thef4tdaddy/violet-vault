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
  shareCode?: string;
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
  // For shared budgets, derive a DETERMINISTIC salt from the shareCode
  // This ensures the same salt is used on re-login after refresh
  const encoder = new TextEncoder();
  const shareCodeBytes = encoder.encode(joinData.shareCode || "default-salt");
  const deterministicSalt = await crypto.subtle.digest("SHA-256", shareCodeBytes);
  const saltArray = new Uint8Array(deterministicSalt);

  // Log salt for debugging
  if (import.meta?.env?.MODE === "development") {
    const saltPreview =
      Array.from(saltArray.slice(0, 8))
        .map((b: number) => b.toString(16).padStart(2, "0"))
        .join("") + "...";
    logger.info("Join: Derived deterministic salt from share code", {
      saltPreview,
      shareCodePreview: joinData.shareCode?.split(" ").slice(0, 2).join(" ") + " ...",
    });
  }

  // Derive key using the deterministic salt
  const key = await encryptionUtils.deriveKeyFromSalt(joinData.password, saltArray);
  const newSalt = saltArray;

  const finalUserData = {
    ...joinData.userInfo,
    budgetId: joinData.budgetId,
    joinedVia: "shareCode",
    sharedBy: joinData.sharedBy,
    userName: joinData.userInfo?.userName?.trim() || "Shared User",
    userColor: joinData.userInfo?.userColor || "#a855f7",
    shareCode: joinData.shareCode, // Preserve the share code used to join
  };

  // Save user profile with share code
  const profileData = {
    userName: finalUserData.userName,
    userColor: finalUserData.userColor,
    joinedVia: "shareCode",
    sharedBy: joinData.sharedBy,
    shareCode: joinData.shareCode, // Preserve the share code used to join
  };
  localStorageService.setUserProfile(profileData);

  logger.info("Saved share code to profile during join", {
    hasShareCode: !!joinData.shareCode,
    shareCodePreview: joinData.shareCode?.split(" ").slice(0, 2).join(" ") + " ...",
  });

  // Save encrypted budget data for persistence with deterministic salt
  // The salt is derived from shareCode, so it will be the same on re-login
  // Structure must match handleNewUserSetup for consistent re-login
  const initialBudgetData = JSON.stringify({
    currentUser: {
      ...finalUserData,
      shareCode: joinData.shareCode, // Store shareCode for re-login salt derivation
    },
    envelopes: [],
    bills: [],
    transactions: [],
    actualBalance: { amount: 0, isManual: false },
    unassignedCash: 0,
    metadata: {
      version: "2.0.0",
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      shareCodeSystem: true,
    },
  });

  const encrypted = await encryptionUtils.encrypt(initialBudgetData, key);
  const budgetDataToSave = {
    encryptedData: encrypted.data,
    salt: Array.from(newSalt) as number[],
    iv: encrypted.iv,
  };

  localStorageService.setBudgetData(budgetDataToSave);

  // Verify save succeeded
  const verifyData = localStorageService.getBudgetData();
  logger.info("Budget data saved to localStorage with deterministic salt", {
    saved: !!verifyData,
    hasEncryptedData: !!verifyData?.encryptedData,
    hasSalt: !!verifyData?.salt,
    saltDerivedFrom: "shareCode",
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

        // Log successful budget join
        logger.info("✅ User joined shared budget", {
          userName: result.user.userName,
          budgetId: result.user.budgetId?.substring(0, 8) + "...",
          sharedBy: result.user.sharedBy,
        });

        // Start background sync
        try {
          const syncDelay = 2500;
          await new Promise((resolve) => setTimeout(resolve, syncDelay));

          const { useBudgetStore } = await import("../../../stores/ui/uiStore");
          const budgetState = (useBudgetStore as { getState: () => { cloudSyncEnabled: boolean; startBackgroundSync: (sessionData?: unknown) => Promise<void> } }).getState();

          if (budgetState.cloudSyncEnabled) {
            await budgetState.startBackgroundSync(result.sessionData ?? undefined);
          }
        } catch (error) {
          logger.error("Failed to start background sync after join", error);
        }
      } else {
        setError(result.error ?? null);
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
