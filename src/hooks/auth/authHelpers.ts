import { encryptionUtils } from "@/utils/platform/security/encryption";
import logger from "@/utils/core/common/logger";
import { identifyUser } from "@/utils/core/common/sentry";
import localStorageService from "@/services/storage/localStorageService";
import type { UserData, LoginResult } from "./useAuth.types";

/**
 * Helper function to start background sync after successful login
 */
export const startBackgroundSyncAfterLogin = async (
  budgetId: string,
  encryptionKey: CryptoKey,
  isNewUser: boolean
) => {
  try {
    const syncDelay = 2500;
    logger.auth(`⏱️ Universal sync delay (${syncDelay}ms)`, { isNewUser, delayMs: syncDelay });

    await new Promise((resolve) => setTimeout(resolve, syncDelay));

    const { syncOrchestrator } = await import("@/services/sync/syncOrchestrator");
    const { FirebaseSyncProvider } = await import("@/services/sync/providers/firebaseSyncProvider");

    await syncOrchestrator.start({
      budgetId,
      encryptionKey,
      provider: new FirebaseSyncProvider(),
    });

    logger.auth("SyncOrchestrator started successfully after login");
  } catch (error) {
    logger.error("Failed to start SyncOrchestrator after login", error);
  }
};

/**
 * Derive encryption key for login based on whether user has a share code
 */
export const deriveLoginEncryptionKey = async (
  password: string,
  savedSalt: number[],
  shareCode?: string
): Promise<{ key: CryptoKey; salt: Uint8Array }> => {
  if (shareCode) {
    const encoder = new TextEncoder();
    const shareCodeBytes = encoder.encode(shareCode);
    const deterministicSalt = await crypto.subtle.digest("SHA-256", shareCodeBytes);
    const usedSalt = new Uint8Array(deterministicSalt);

    if (import.meta?.env?.MODE === "development") {
      const saltPreview =
        Array.from(usedSalt.slice(0, 8))
          .map((b: number) => b.toString(16).padStart(2, "0"))
          .join("") + "...";
      logger.auth("Shared budget login - using deterministic salt", {
        shareCodePreview: shareCode.split(" ").slice(0, 2).join(" ") + " ...",
        saltPreview,
      });
    }

    const key = await encryptionUtils.deriveKeyFromSalt(password, usedSalt);
    return { key, salt: usedSalt };
  }

  const usedSalt = new Uint8Array(savedSalt);
  const key = await encryptionUtils.deriveKeyFromSalt(password, usedSalt);
  return { key, salt: usedSalt };
};

/**
 * Helper function for new user setup path
 */
export const handleNewUserSetup = async (
  userData: UserData,
  password: string
): Promise<LoginResult> => {
  logger.auth("New user setup path.", userData);

  if (!userData.shareCode) {
    throw new Error("Share code missing from user data during login");
  }

  const shareCode = userData.shareCode as string;

  // For shared budgets, derive deterministic salt from shareCode
  const encoder = new TextEncoder();
  const shareCodeBytes = encoder.encode(shareCode);
  const deterministicSalt = await crypto.subtle.digest("SHA-256", shareCodeBytes);
  const newSalt = new Uint8Array(deterministicSalt);

  // Derive key using the deterministic salt
  const key = await encryptionUtils.deriveKeyFromSalt(password, newSalt);

  const deterministicBudgetId = await encryptionUtils.generateBudgetId(password, shareCode);

  const finalUserData = {
    ...userData,
    budgetId: deterministicBudgetId,
    userName: userData.userName?.trim() || "User",
    userColor: (userData.userColor as string) || "#a855f7",
  };

  const { fullBudgetState } = await import("@/utils/core/testing/factories/fixtures");

  const initialBudgetData = {
    currentUser: {
      ...finalUserData,
      shareCode: shareCode,
    },
    envelopes: fullBudgetState.envelopes,
    bills: fullBudgetState.bills,
    transactions: fullBudgetState.transactions,
    actualBalance: { amount: fullBudgetState.unassignedCash + 5000, isManual: true },
    unassignedCash: fullBudgetState.unassignedCash,
    metadata: {
      version: "2.0.0",
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      shareCodeSystem: true,
    },
  };

  const encrypted = await encryptionUtils.encrypt(initialBudgetData, key);
  localStorageService.setBudgetData({
    encryptedData: encrypted.data,
    salt: Array.from(newSalt) as number[],
    iv: encrypted.iv,
  });

  localStorageService.setUserProfile({
    userName: finalUserData.userName,
    userColor: finalUserData.userColor,
    shareCode: shareCode,
  });

  identifyUser(finalUserData.budgetId, {
    userName: finalUserData.userName,
    userColor: finalUserData.userColor,
    accountType: "new_user",
  });

  return {
    success: true,
    user: finalUserData,
    sessionData: { encryptionKey: key, salt: newSalt },
    isNewUser: true,
  };
};

/**
 * Process join budget operation
 */
export const processJoinBudget = async (joinData: {
  budgetId: string;
  password: string;
  userInfo: UserData;
  sharedBy: string;
  shareCode?: string;
}): Promise<LoginResult> => {
  const encoder = new TextEncoder();
  const shareCodeBytes = encoder.encode(joinData.shareCode || "default-salt");
  const deterministicSalt = await crypto.subtle.digest("SHA-256", shareCodeBytes);
  const saltArray = new Uint8Array(deterministicSalt);

  const key = await encryptionUtils.deriveKeyFromSalt(joinData.password, saltArray);
  const newSalt = saltArray;

  const finalUserData = {
    ...joinData.userInfo,
    budgetId: joinData.budgetId,
    joinedVia: "shareCode" as const,
    sharedBy: joinData.sharedBy,
    userName: joinData.userInfo?.userName?.trim() || "Shared User",
    userColor: joinData.userInfo?.userColor || "#a855f7",
    shareCode: joinData.shareCode,
  };

  localStorageService.setUserProfile({
    userName: finalUserData.userName,
    userColor: finalUserData.userColor,
    joinedVia: "shareCode",
    sharedBy: joinData.sharedBy,
    shareCode: joinData.shareCode,
  });

  const initialBudgetData = JSON.stringify({
    currentUser: {
      ...finalUserData,
      shareCode: joinData.shareCode,
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
  localStorageService.setBudgetData({
    encryptedData: encrypted.data,
    salt: Array.from(newSalt) as number[],
    iv: encrypted.iv,
  });

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
  };
};
