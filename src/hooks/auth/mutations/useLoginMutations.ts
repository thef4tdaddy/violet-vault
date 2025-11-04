import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { SessionData } from "../../../contexts/authConstants";
import { encryptionUtils } from "../../../utils/security/encryption";
import logger from "../../../utils/common/logger";
import { identifyUser } from "../../../utils/common/highlight";
import localStorageService from "../../../services/storage/localStorageService";

/**
 * Login-related TanStack Query mutations
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

interface LoginMutationVariables {
  password: string;
  userData?: Record<string, unknown>;
}

interface UserData {
  id?: string;
  email?: string;
  budgetId?: string;
  userName?: string;
  [key: string]: unknown;
}

interface LoginResult {
  success: boolean;
  user?: UserData;
  sessionData?: SessionData;
  isNewUser?: boolean;
  error?: string;
  data?: Record<string, unknown>;
  suggestion?: string;
  code?: string;
  canCreateNew?: boolean;
}

/**
 * Helper function to start background sync after successful login
 */
const startBackgroundSyncAfterLogin = async (isNewUser: boolean) => {
  try {
    const syncDelay = 2500;
    logger.auth(`⏱️ Adding universal sync delay to prevent race conditions (${syncDelay}ms)`, {
      isNewUser: isNewUser || false,
      delayMs: syncDelay,
    });

    await new Promise((resolve) => setTimeout(resolve, syncDelay));

    const { useBudgetStore } = await import("../../../stores/ui/uiStore");
    const budgetState = useBudgetStore.getState();

    if (budgetState.cloudSyncEnabled) {
      await budgetState.startBackgroundSync();
      logger.auth("Background sync started successfully after login");
    }
  } catch (error) {
    logger.error("Failed to start background sync after login", error);
  }
};

/**
 * Helper function to log authentication debug info
 */
const logAuthenticationDebugInfo = (result: LoginResult): void => {
  logger.auth("🔍 DEBUG: About to call setAuthenticated with:", {
    hasSessionData: !!result.sessionData,
    hasEncryptionKey: !!result.sessionData?.encryptionKey,
    encryptionKeyType: result.sessionData?.encryptionKey?.constructor?.name || "undefined",
    hasSalt: !!result.sessionData?.salt,
    saltType: result.sessionData?.salt?.constructor?.name || "undefined",
  });
};

/**
 * Helper function to log successful authentication
 */
const logSuccessfulAuthentication = (result: LoginResult): void => {
  logger.info("✅ User authenticated", {
    userName: result.user?.userName,
    budgetId: result.user?.budgetId?.substring(0, 8) + "...",
    isNewUser: result.isNewUser || false,
    hasEncryptionKey: !!result.sessionData?.encryptionKey,
  });
};

/**
 * Helper function to handle successful login authentication
 */
const handleSuccessfulAuthentication = (
  result: LoginResult,
  setAuthenticated: (user: import("@/types/auth").UserData, sessionData?: SessionData) => void
): void => {
  logAuthenticationDebugInfo(result);

  // Pass the encryption key and salt from login result to auth context
  setAuthenticated(result.user as unknown as import("@/types/auth").UserData, result.sessionData);

  logSuccessfulAuthentication(result);
};

/**
 * Helper function for new user setup path
 */
const handleNewUserSetup = async (userData: UserData, password: string): Promise<LoginResult> => {
  logger.auth("New user setup path.", userData);

  const shareCode = userData.shareCode;
  if (!shareCode) {
    throw new Error("Share code missing from user data during login");
  }

  // For shared budgets, derive deterministic salt from shareCode (same as join flow)
  const encoder = new TextEncoder();
  const shareCodeBytes = encoder.encode(shareCode);
  const deterministicSalt = await crypto.subtle.digest("SHA-256", shareCodeBytes);
  const newSalt = new Uint8Array(deterministicSalt);
  
  // Derive key using the deterministic salt
  const key = await encryptionUtils.deriveKeyFromSalt(password, newSalt);

  if (import.meta?.env?.MODE === "development") {
    const saltPreview =
      Array.from(newSalt.slice(0, 8))
        .map((b: number) => b.toString(16).padStart(2, "0"))
        .join("") + "...";
    logger.auth("New user: Derived deterministic salt from share code", {
      saltPreview,
      keyType: key.constructor?.name || "unknown",
      shareCodePreview: shareCode.split(" ").slice(0, 2).join(" ") + " ...",
    });
  }

  const deterministicBudgetId = await encryptionUtils.generateBudgetId(password, shareCode);

  const finalUserData = {
    ...userData,
    budgetId: deterministicBudgetId,
    userName: userData.userName?.trim() || "User",
    userColor: (userData.userColor as string) || "#a855f7",
  };

  logger.auth("Setting auth state for new user.", {
    budgetId: finalUserData.budgetId,
  });

  // Create initial budget data with share code
  const initialBudgetData = {
    currentUser: {
      ...finalUserData,
      shareCode: shareCode, // Include share code in encrypted data
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
  };

  // Encrypt and save to localStorage
  const encrypted = await encryptionUtils.encrypt(initialBudgetData, key);
  localStorageService.setBudgetData({
    encryptedData: encrypted.data,
    salt: Array.from(newSalt) as number[],
    iv: encrypted.iv,
  });

  // Save user profile with share code for re-login
  const profileData = {
    userName: finalUserData.userName,
    userColor: finalUserData.userColor,
    shareCode: shareCode, // Save share code for deterministic salt on re-login
  };
  localStorageService.setUserProfile(profileData);

  // Identify user for tracking
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
 * Helper function for existing user login path
 */
const handleExistingUserLogin = async (password: string): Promise<LoginResult> => {
  logger.auth("Existing user login path.");
  const savedData = localStorageService.getBudgetData();
  if (!savedData) {
    return {
      success: false,
      error: "No budget data found for this password.",
      suggestion: "Would you like to start fresh with a new budget?",
      code: "NO_DATA_FOUND_OFFER_NEW_BUDGET",
      canCreateNew: true,
    };
  }

  const { salt: savedSalt, encryptedData, iv } = savedData;
  
  if (!savedSalt || !encryptedData || !iv) {
    return {
      success: false,
      error: "Local data is corrupted. Please clear data and start fresh.",
    };
  }

  // Check if user has a shareCode in their profile (shared budget)
  // If so, use deterministic salt derived from shareCode for consistency
  const savedProfile = localStorageService.getUserProfile();
  const hasShareCode = savedProfile?.shareCode;
  
  let key: CryptoKey;
  let usedSalt: Uint8Array;
  
  if (hasShareCode) {
    // For shared budgets, derive deterministic salt from shareCode
    const encoder = new TextEncoder();
    const shareCodeBytes = encoder.encode(hasShareCode);
    const deterministicSalt = await crypto.subtle.digest("SHA-256", shareCodeBytes);
    usedSalt = new Uint8Array(deterministicSalt);
    
    if (import.meta?.env?.MODE === "development") {
      const saltPreview =
        Array.from(usedSalt.slice(0, 8))
          .map((b: number) => b.toString(16).padStart(2, "0"))
          .join("") + "...";
      logger.auth("Shared budget login - using deterministic salt", {
        shareCodePreview: hasShareCode.split(" ").slice(0, 2).join(" ") + " ...",
        saltPreview,
      });
    }
    
    key = await encryptionUtils.deriveKeyFromSalt(password, usedSalt);
  } else {
    // For regular budgets, use saved salt from localStorage
    usedSalt = new Uint8Array(savedSalt);
    key = await encryptionUtils.deriveKeyFromSalt(password, usedSalt);
  }

  try {
    const decryptedData = await encryptionUtils.decrypt(encryptedData, key, iv);
    let currentUserData = decryptedData.currentUser;

    if (!currentUserData || !currentUserData.budgetId || !currentUserData.shareCode) {
      localStorageService.removeBudgetData();
      throw new Error("Legacy data cleared - please create a new budget with share code system");
    }

    const sanitizedUserData = {
      ...currentUserData,
      userName: currentUserData.userName?.trim() || "User",
    };

    // Identify returning user for tracking
    identifyUser(sanitizedUserData.budgetId, {
      userName: sanitizedUserData.userName,
      userColor: sanitizedUserData.userColor,
      accountType: "returning_user",
    });

    return {
      success: true,
      user: sanitizedUserData,
      sessionData: { encryptionKey: key, salt: usedSalt },
      data: decryptedData,
    };
  } catch {
    logger.auth("Password validation failed - offering new budget creation");
    return {
      success: false,
      error: "This password doesn't match the existing budget.",
      suggestion: "Would you like to create a new budget instead?",
      code: "INVALID_PASSWORD_OFFER_NEW_BUDGET",
      canCreateNew: true,
    };
  }
};

/**
 * Hook for login mutation
 * Handles both new user setup and existing user login
 */
export const useLoginMutation = () => {
  const { setAuthenticated, setError, setLoading } = useAuth();

  return useMutation<LoginResult, Error, LoginMutationVariables>({
    mutationFn: async ({
      password,
      userData = null,
    }: LoginMutationVariables): Promise<LoginResult> => {
      logger.auth("TanStack Login attempt started.", {
        hasPassword: !!password,
        hasUserData: !!userData,
      });

      const timeoutPromise = new Promise<LoginResult>((_, reject) =>
        setTimeout(() => reject(new Error("Login timeout after 10 seconds")), 10000)
      );

      const loginPromise = async () => {
        try {
          if (userData) {
            return await handleNewUserSetup(userData, password);
          } else {
            return await handleExistingUserLogin(password);
          }
        } catch (error: unknown) {
          logger.error("Login failed.", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorName = error instanceof Error ? error.name : "";
          if (errorName === "OperationError" || errorMessage.toLowerCase().includes("decrypt")) {
            return { success: false, error: "Invalid password." };
          }
          return {
            success: false,
            error: "Invalid password or corrupted data.",
          };
        }
      };

      return Promise.race([loginPromise(), timeoutPromise]);
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: async (result: LoginResult) => {
      if (result.success && result.user) {
        handleSuccessfulAuthentication(result, setAuthenticated);
        await startBackgroundSyncAfterLogin(result.isNewUser || false);
      } else {
        setError(result.error);
      }
      setLoading(false);
    },
    onError: (error: Error) => {
      logger.error("Login mutation failed", error);
      setError(error.message || "Login failed");
      setLoading(false);
    },
  });
};
