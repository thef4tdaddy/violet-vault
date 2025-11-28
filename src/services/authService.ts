/**
 * Auth Service - Pure functions for authentication operations
 *
 * Extracted from Zustand authStore to provide clean, testable auth logic.
 * Used by TanStack Query mutations/queries for auth operations.
 *
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

import { encryptionUtils } from "../utils/security/encryption";
import logger from "../utils/common/logger";
import { identifyUser } from "../utils/common/sentry";

interface UserData {
  userName: string;
  userColor?: string;
  shareCode?: string;
  budgetId?: string;
  [key: string]: unknown;
}

interface SessionData {
  encryptionKey: CryptoKey;
  salt: Uint8Array;
}

interface JoinData {
  budgetId: string;
  password: string;
  userInfo: UserData;
  sharedBy?: string;
}

/**
 * Validate a password against stored encrypted data
 * @param {string} password - Password to validate
 * @returns {Promise<boolean>} - Whether password is valid
 */
export const validatePassword = async (password: string): Promise<boolean> => {
  try {
    logger.production("Password validation started", {
      hasPassword: !!password,
    });
    logger.auth("validatePassword: Starting validation");

    const savedData = localStorage.getItem("envelopeBudgetData");

    logger.auth("validatePassword: Data check", {
      hasSavedData: !!savedData,
    });

    // SECURITY FIX: Always validate against actual encrypted data when it exists
    if (!savedData) {
      logger.auth("validatePassword: No saved data found - cannot validate password");
      logger.production("Password validation failed", {
        reason: "no_encrypted_data_to_validate_against",
      });
      return false;
    }

    // Parse and validate the saved encrypted data
    let parsedData;
    try {
      parsedData = JSON.parse(savedData);
    } catch (parseError) {
      logger.auth("validatePassword: Failed to parse saved data", {
        error: (parseError as Error).message,
      });
      return false;
    }

    const { salt: savedSalt, encryptedData, iv } = parsedData;

    // Validate that we have all required encryption components
    if (!savedSalt || !encryptedData || !iv) {
      logger.auth("validatePassword: Missing required encryption components", {
        hasSavedSalt: !!savedSalt,
        hasEncryptedData: !!encryptedData,
        hasIv: !!iv,
      });
      return false;
    }

    // Use deterministic key derivation to validate password
    logger.auth("validatePassword: Using deterministic key derivation for validation", {
      saltLength: savedSalt.length,
      ivLength: iv.length,
      hasEncryptedData: !!encryptedData,
    });

    const keyData = await encryptionUtils.deriveKey(password);
    const key = keyData.key;

    logger.auth("validatePassword: Key derived successfully");

    // Attempt to decrypt the data to validate the password
    await encryptionUtils.decrypt(encryptedData, key, iv);

    logger.auth("validatePassword: Decryption successful - password is correct");
    logger.production("Password validation successful", {
      method: "encrypted_data_validation",
    });

    return true;
  } catch (error) {
    const err = error as Error;
    logger.auth("validatePassword: Validation failed", {
      error: err.message,
      errorType: err.constructor?.name,
    });
    logger.production("Password validation failed", {
      error: err.message,
      method: "encrypted_data_validation",
    });
    return false;
  }
};

/**
 * Login with password and optional user data for new users
 * @param {string} password - User's password
 * @param {UserData|null} userData - New user data for registration
 * @returns {Promise<Object>} - Login result with success/error info
 */
export const login = async (password: string, userData: UserData | null = null) => {
  logger.auth("Login attempt started.", {
    hasPassword: !!password,
    hasUserData: !!userData,
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Login timeout after 10 seconds")), 10000)
  );

  const loginPromise = (async () => {
    try {
      if (userData) {
        // New user setup path
        logger.auth("New user setup path.", userData);

        // Always use deterministic key generation for cross-browser consistency
        const keyData = await encryptionUtils.deriveKey(password);
        const newSalt = keyData.salt;
        const key = keyData.key;

        // Log key derivation for cross-browser sync debugging
        if (import.meta?.env?.MODE === "development") {
          const saltPreview =
            Array.from(newSalt.slice(0, 8) as Uint8Array)
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("") + "...";
          logger.auth("Key derived deterministically for cross-browser sync", {
            saltPreview,
            keyType: key.constructor?.name || "unknown",
          });
        }
        logger.auth("Generated/restored key and salt for user.");

        // ALWAYS use deterministic budgetId generation for cross-browser consistency
        const shareCode = userData.shareCode;
        if (!shareCode) {
          throw new Error("Share code missing from user data during login");
        }
        const deterministicBudgetId = await encryptionUtils.generateBudgetId(password, shareCode);

        const finalUserData = {
          ...userData,
          budgetId: deterministicBudgetId,
          userName: userData.userName?.trim() || "User",
        };

        logger.auth("Setting auth state for new user.", {
          budgetId: finalUserData.budgetId,
        });

        // Identify user in Highlight.io for session tracking
        identifyUser(finalUserData.budgetId, {
          userName: finalUserData.userName,
          userColor: finalUserData.userColor,
          accountType: "new_user",
        });

        const profileData = {
          userName: finalUserData.userName,
          userColor: finalUserData.userColor,
        };
        localStorage.setItem("userProfile", JSON.stringify(profileData));
        logger.auth("Saved user profile to localStorage.");

        // Create initial empty budget data and save to localStorage
        const initialBudgetData = {
          currentUser: finalUserData,
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

        // Encrypt and save the initial budget data to localStorage
        const encrypted = await encryptionUtils.encrypt(initialBudgetData, key);
        localStorage.setItem(
          "envelopeBudgetData",
          JSON.stringify({
            encryptedData: encrypted.data,
            salt: Array.from(newSalt),
            iv: encrypted.iv,
          })
        );

        logger.auth("New budget created and saved with share code system.", {
          budgetId: finalUserData.budgetId,
          shareCodePreview: shareCode.split(" ").slice(0, 2).join(" ") + " ...",
        });

        return {
          success: true,
          user: finalUserData,
          sessionData: {
            encryptionKey: key,
            salt: newSalt,
          },
          isNewUser: true,
        };
      } else {
        // Existing user login path
        logger.auth("Existing user login path.");
        const savedData = localStorage.getItem("envelopeBudgetData");
        if (!savedData) {
          logger.warn("No saved data found in localStorage for existing user.");
          return {
            success: false,
            error: "No budget data found for this password.",
            suggestion: "Would you like to start fresh with a new budget?",
            code: "NO_DATA_FOUND_OFFER_NEW_BUDGET",
            canCreateNew: true,
          };
        }

        const { salt: savedSalt, encryptedData, iv } = JSON.parse(savedData);
        if (!savedSalt || !encryptedData || !iv) {
          logger.error("Corrupted local data found.", {
            hasSalt: !!savedSalt,
            hasData: !!encryptedData,
            hasIv: !!iv,
          });
          return {
            success: false,
            error: "Local data is corrupted. Please clear data and start fresh.",
          };
        }

        // SECURITY FIX: Validate password BEFORE proceeding
        logger.auth("Validating password before allowing login");
        const passwordValid = await validatePassword(password);
        if (!passwordValid) {
          logger.auth("Password validation failed - offering new budget creation");
          return {
            success: false,
            error: "This password doesn't match the existing budget.",
            suggestion: "Would you like to create a new budget instead?",
            code: "INVALID_PASSWORD_OFFER_NEW_BUDGET",
            canCreateNew: true,
          };
        }
        logger.auth("Password validation successful - proceeding with login");

        // CRITICAL: Use deterministic key generation for cross-browser consistency
        const keyData = await encryptionUtils.deriveKey(password);
        const deterministicSalt = keyData.salt;
        const key = keyData.key;

        // Debug encryption key derivation for cross-browser sync troubleshooting
        if (import.meta?.env?.MODE === "development") {
          const saltPreview =
            Array.from(deterministicSalt.slice(0, 8) as Uint8Array)
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("") + "...";
          logger.auth("Using deterministic key derivation for cross-browser sync", {
            saltPreview,
            passwordLength: password?.length || 0,
            keyType: key.constructor?.name || "unknown",
          });
        }

        logger.auth("Encryption key derived successfully", {
          keyPreview: key instanceof CryptoKey ? `CryptoKey(${key.algorithm.name})` : "error",
          keyType: key?.constructor?.name || "unknown",
        });

        let decryptedData;
        try {
          decryptedData = await encryptionUtils.decrypt(encryptedData, key, iv);
          logger.auth("Successfully decrypted local data.");
        } catch (decryptError) {
          const err = decryptError as Error;
          logger.error("Unexpected decryption failure after password validation", {
            error: err.message,
            errorType: err.constructor?.name,
          });
          return {
            success: false,
            error: "Unable to decrypt data. Please try again or contact support.",
            code: "DECRYPTION_FAILED",
          };
        }

        let currentUserData = decryptedData.currentUser;

        if (!currentUserData || !currentUserData.budgetId || !currentUserData.shareCode) {
          logger.auth("Legacy data detected - clearing for fresh start with share code system.");
          localStorage.removeItem("envelopeBudgetData");
          throw new Error(
            "Legacy data cleared - please create a new budget with share code system"
          );
        }

        logger.auth("Setting auth state for existing user.", {
          hasKey: !!key,
          budgetId: currentUserData.budgetId,
          userName: currentUserData.userName,
        });

        // Ensure userName is not empty
        const sanitizedUserData = {
          ...currentUserData,
          userName: currentUserData.userName?.trim() || "User",
        };

        // Identify user in Highlight.io for session tracking
        identifyUser(sanitizedUserData.budgetId, {
          userName: sanitizedUserData.userName,
          userColor: sanitizedUserData.userColor,
          accountType: "returning_user",
        });

        return {
          success: true,
          user: sanitizedUserData,
          sessionData: {
            encryptionKey: key,
            salt: deterministicSalt,
          },
          data: decryptedData,
          isNewUser: false,
        };
      }
    } catch (error) {
      const err = error as Error;
      logger.error("Login failed.", error);
      if (err.name === "OperationError" || err.message.toLowerCase().includes("decrypt")) {
        return { success: false, error: "Invalid password." };
      }
      return { success: false, error: "Invalid password or corrupted data." };
    }
  })();

  return Promise.race([loginPromise, timeoutPromise]);
};

/**
 * Join a shared budget using a share code
 * @param {JoinData} joinData - Join data with budgetId, password, userInfo, etc.
 * @returns {Promise<Object>} - Join result
 */
export const joinBudgetWithShareCode = async (joinData: JoinData) => {
  logger.auth("Join budget attempt started.", {
    budgetId: joinData.budgetId?.substring(0, 8) + "...",
    hasPassword: !!joinData.password,
    hasUserInfo: !!joinData.userInfo,
    sharedBy: joinData.sharedBy,
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Join timeout after 10 seconds")), 10000)
  );

  const joinPromise = (async () => {
    try {
      // Generate encryption key for this user's password
      const keyData = await encryptionUtils.deriveKey(joinData.password);
      const newSalt = keyData.salt;
      const key = keyData.key;

      // Use the shared budgetId (not device-unique for sharing)
      const finalUserData = {
        ...joinData.userInfo,
        budgetId: joinData.budgetId,
        joinedVia: "shareCode",
        sharedBy: joinData.sharedBy,
        userName: joinData.userInfo.userName?.trim() || "User",
      };

      // Identify user in Highlight.io for session tracking
      identifyUser(finalUserData.budgetId, {
        userName: finalUserData.userName,
        userColor: finalUserData.userColor,
        accountType: "shared_budget_user",
      });

      const profileData = {
        userName: finalUserData.userName,
        userColor: finalUserData.userColor,
        joinedVia: "shareCode",
        sharedBy: joinData.sharedBy,
      };
      localStorage.setItem("userProfile", JSON.stringify(profileData));
      logger.auth("Saved shared user profile to localStorage.");

      // Save encrypted budget data to localStorage for persistence across refreshes
      const initialBudgetData = JSON.stringify({
        ...finalUserData,
        bills: [],
        categories: [],
        createdAt: Date.now(),
        lastModified: Date.now(),
      });

      const encrypted = await encryptionUtils.encrypt(initialBudgetData, key);
      localStorage.setItem(
        "envelopeBudgetData",
        JSON.stringify({
          encryptedData: encrypted.data,
          salt: Array.from(newSalt),
          iv: encrypted.iv,
        })
      );
      logger.auth("Saved encrypted shared budget data to localStorage for persistence.");

      return {
        success: true,
        sharedBudget: true,
        user: finalUserData,
        sessionData: {
          encryptionKey: key,
          salt: newSalt,
        },
        isNewUser: false,
      };
    } catch (error) {
      logger.error("Join budget failed.", error);
      return {
        success: false,
        error: "Failed to join budget. Please try again.",
      };
    }
  })();

  return Promise.race([joinPromise, timeoutPromise]);
};

/**
 * Update user profile information
 * @param {UserData} updatedProfile - Updated profile data
 * @param {SessionData} currentSession - Current session data (encryptionKey, salt)
 * @returns {Promise<Object>} - Update result
 */
export const updateProfile = async (updatedProfile: UserData, currentSession: SessionData) => {
  try {
    const { encryptionKey, salt: currentSalt } = currentSession;

    if (!encryptionKey || !currentSalt) {
      return { success: false, error: "Not authenticated." };
    }

    // Update localStorage profile
    const profileData = {
      userName: updatedProfile.userName,
      userColor: updatedProfile.userColor,
    };
    localStorage.setItem("userProfile", JSON.stringify(profileData));

    // Update the encrypted budget data to include the updated user profile
    const savedData = localStorage.getItem("envelopeBudgetData");
    if (savedData) {
      const { encryptedData, iv } = JSON.parse(savedData);
      const decryptedData = await encryptionUtils.decrypt(encryptedData, encryptionKey, iv);

      // Update the currentUser in the encrypted data
      const updatedData = {
        ...decryptedData,
        currentUser: updatedProfile,
      };

      const encrypted = await encryptionUtils.encrypt(updatedData, encryptionKey);
      localStorage.setItem(
        "envelopeBudgetData",
        JSON.stringify({
          encryptedData: encrypted.data,
          salt: Array.from(currentSalt),
          iv: encrypted.iv,
        })
      );
    }

    return { success: true, user: updatedProfile };
  } catch (error) {
    logger.error("Failed to update profile:", error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Change user password
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Change result
 */
export const changePassword = async (oldPassword: string, newPassword: string) => {
  try {
    const savedData = localStorage.getItem("envelopeBudgetData");
    if (!savedData) {
      return { success: false, error: "No saved data found." };
    }

    const { encryptedData, iv } = JSON.parse(savedData);
    // Use deterministic key derivation for old password
    const oldKeyData = await encryptionUtils.deriveKey(oldPassword);
    const oldKey = oldKeyData.key;

    const decryptedData = await encryptionUtils.decrypt(encryptedData, oldKey, iv);

    const { key: newKey, salt: newSalt } = await encryptionUtils.generateKey(newPassword);
    const encrypted = await encryptionUtils.encrypt(decryptedData, newKey);

    localStorage.setItem(
      "envelopeBudgetData",
      JSON.stringify({
        encryptedData: encrypted.data,
        salt: Array.from(newSalt),
        iv: encrypted.iv,
      })
    );

    return {
      success: true,
      sessionData: {
        encryptionKey: newKey,
        salt: newSalt,
      },
    };
  } catch (error) {
    const err = error as Error;
    logger.error("Password change failed:", error);
    if (err.name === "OperationError" || err.message.toLowerCase().includes("decrypt")) {
      return { success: false, error: "Current password is incorrect." };
    }
    return {
      success: false,
      error: "Password change failed. Please try again.",
    };
  }
};

/**
 * Initialize background sync after login
 * @param {boolean} isNewUser - Whether this is a new user
 * @returns {Promise<void>}
 */
export const startBackgroundSyncAfterLogin = async (isNewUser = false) => {
  try {
    // Add delay to prevent race conditions
    const syncDelay = isNewUser ? 3000 : 2500;
    logger.auth("⏱️ Adding universal sync delay to prevent race conditions", {
      isNewUser,
      delayMs: syncDelay,
    });
    await new Promise((resolve) => setTimeout(resolve, syncDelay));

    // Import UI store to access startBackgroundSync
    const { useBudgetStore } = (await import("../stores/ui/uiStore")) as {
      useBudgetStore: {
        getState: () => { cloudSyncEnabled: boolean; startBackgroundSync: () => Promise<void> };
      };
    };
    const budgetState = useBudgetStore.getState();

    if (budgetState.cloudSyncEnabled) {
      await budgetState.startBackgroundSync();
      logger.auth("Background sync started successfully after login");
    } else {
      logger.auth("Cloud sync disabled - skipping background sync");
    }
  } catch (error) {
    logger.error("Failed to start background sync after login", error);
  }
};

/**
 * Clear all auth-related data (logout)
 * @returns {Promise<void>}
 */
export const logout = async () => {
  logger.auth("Logging out and clearing auth state.");

  // Clear localStorage data
  localStorage.removeItem("userProfile");

  // Note: We don't clear envelopeBudgetData on logout to preserve user's budget
  // It will be re-encrypted with new login

  logger.auth("Auth data cleared successfully.");
};
