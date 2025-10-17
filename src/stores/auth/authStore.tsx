import { useEffect } from "react";
import { create } from "zustand";
import { encryptionUtils } from "../../utils/security/encryption";
import logger from "../../utils/common/logger";
import { identifyUser } from "../../utils/common/highlight";

/**
 * Compare two Uint8Array objects byte-wise for equality
 * More reliable than JSON.stringify comparison
 */
function _compareUint8Arrays(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

 
export const useAuth = create((set, _get) => ({
  isUnlocked: false,
  encryptionKey: null,
  salt: null,
  currentUser: null,
  lastActivity: null,
  budgetId: null,

  async login(password, userData = null) {
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
          logger.auth("New user setup path.", userData);

          // Always use deterministic key generation for cross-browser consistency
          // Even for imported salt scenarios, we ensure deterministic derivation
          const keyData = await encryptionUtils.deriveKey(password);
          const newSalt = keyData.salt;
          const key = keyData.key;

          // Log key derivation for cross-browser sync debugging
          if (import.meta?.env?.MODE === "development") {
            const saltPreview =
              Array.from(newSalt.slice(0, 8))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("") + "...";
            logger.auth("Key derived deterministically for cross-browser sync", {
              saltPreview,
              keyType: key.constructor?.name || "unknown",
            });
          }
          logger.auth("Generated/restored key and salt for user.");

          // ALWAYS use deterministic budgetId generation for cross-browser consistency
          // Use share code from userData for deterministic budget ID
          const shareCode = userData.shareCode;
          if (!shareCode) {
            throw new Error("Share code missing from user data during login");
          }
          const deterministicBudgetId = await encryptionUtils.generateBudgetId(password, shareCode);

          const finalUserData = {
            ...userData,
            budgetId: deterministicBudgetId,
            // Set default userName if empty or missing
            userName: userData.userName?.trim() || "User",
          };

          logger.auth("Setting auth state for new user.", {
            budgetId: finalUserData.budgetId,
          });

          set({
            salt: newSalt,
            encryptionKey: key,
            currentUser: finalUserData,
            budgetId: finalUserData.budgetId,
            isUnlocked: true,
            lastActivity: Date.now(),
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

          // Create initial empty budget data with user info and save to localStorage
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

          // Start background sync after successful login (new user path)
          // Use get() parameter to avoid React error #185
          const currentState = _get();
          await currentState.startBackgroundSyncAfterLogin(true); // Pass true for new user

          return { success: true };
        } else {
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

          // SECURITY FIX: Validate password BEFORE setting auth state (Issue #577)
          logger.auth("Validating password before allowing login");
          // Use get() parameter to avoid React error #185
          const currentState = _get();
          const passwordValid = await currentState.validatePassword(password);
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
          // Instead of using saved salt, always derive from password
          const keyData = await encryptionUtils.deriveKey(password);
          const deterministicSalt = keyData.salt;
          const key = keyData.key;

          // Debug encryption key derivation for cross-browser sync troubleshooting
          if (import.meta?.env?.MODE === "development") {
            const saltPreview =
              Array.from(deterministicSalt.slice(0, 8))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("") + "...";
            logger.auth("Using deterministic key derivation for cross-browser sync", {
              saltPreview,
              passwordLength: password?.length || 0,
              keyType: key.constructor?.name || "unknown",
            });
          }

          // Debug derived key (safe preview only)
          let keyPreview = "none";
          try {
            // CryptoKey objects cannot be directly viewed as Uint8Array
            if (key instanceof CryptoKey) {
              keyPreview = `CryptoKey(${key.algorithm.name})`;
            } else {
              // If it's an ArrayBuffer, get first 16 bytes as hex for debugging (safe to log)
              const keyView = new Uint8Array(key);
              keyPreview = Array.from(keyView.slice(0, 16))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
            }
          } catch {
            keyPreview = "error";
          }

          logger.auth("Encryption key derived successfully", {
            keyPreview,
            keyType: key?.constructor?.name || "unknown",
          });

          let decryptedData;
          try {
            decryptedData = await encryptionUtils.decrypt(encryptedData, key, iv);
            logger.auth("Successfully decrypted local data.");
          } catch (decryptError) {
            // This should not happen since we validated the password above
            logger.error("Unexpected decryption failure after password validation", {
              error: decryptError.message,
              errorType: decryptError.constructor?.name,
            });
            return {
              success: false,
              error: "Unable to decrypt data. Please try again or contact support.",
              code: "DECRYPTION_FAILED",
            };
          }

          let migratedData = decryptedData;
          let currentUserData = decryptedData.currentUser;

          if (!currentUserData || !currentUserData.budgetId || !currentUserData.shareCode) {
            logger.auth("Legacy data detected - clearing for fresh start with share code system.");
            // Clear legacy data - all budgets now require share codes
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

          set({
            salt: deterministicSalt,
            encryptionKey: key,
            currentUser: sanitizedUserData,
            budgetId: sanitizedUserData.budgetId,
            isUnlocked: true,
            lastActivity: Date.now(),
          });

          // Identify returning user in Highlight.io for session tracking
          identifyUser(sanitizedUserData.budgetId, {
            userName: sanitizedUserData.userName,
            userColor: sanitizedUserData.userColor,
            accountType: "returning_user",
          });

          // Start background sync after successful login
          // Use get() parameter to avoid React error #185
          const authState = _get();
          await authState.startBackgroundSyncAfterLogin();

          return { success: true, data: migratedData };
        }
      } catch (error) {
        logger.error("Login failed.", error);
        if (error.name === "OperationError" || error.message.toLowerCase().includes("decrypt")) {
          return { success: false, error: "Invalid password." };
        }
        return { success: false, error: "Invalid password or corrupted data." };
      }
    })();

    return Promise.race([loginPromise, timeoutPromise]);
  },

  async joinBudgetWithShareCode(joinData) {
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
          budgetId: joinData.budgetId, // Use shared budgetId
          joinedVia: "shareCode",
          sharedBy: joinData.sharedBy,
          // Set default userName if empty or missing
          userName: joinData.userInfo?.userName?.trim() || "Shared User",
        };

        logger.auth("Setting auth state for shared budget user.", {
          budgetId: finalUserData.budgetId?.substring(0, 8) + "...",
          userName: finalUserData.userName,
          sharedBy: joinData.sharedBy,
          joinMethod: "shareCode",
        });

        set({
          salt: newSalt,
          encryptionKey: key,
          currentUser: finalUserData,
          budgetId: finalUserData.budgetId,
          isUnlocked: true,
          lastActivity: Date.now(),
        });

        // Identify shared user in Highlight.io for session tracking
        identifyUser(finalUserData.budgetId, {
          userName: finalUserData.userName,
          userColor: finalUserData.userColor,
          accountType: "shared_user",
          sharedBy: joinData.sharedBy,
        });

        // Save user profile to localStorage (with their own encryption key)
        const profileData = {
          userName: finalUserData.userName,
          userColor: finalUserData.userColor,
          joinedVia: "shareCode",
          sharedBy: joinData.sharedBy,
        };
        localStorage.setItem("userProfile", JSON.stringify(profileData));
        logger.auth("Saved shared user profile to localStorage.");

        // Save encrypted budget data to localStorage for persistence across refreshes
        // This creates an initial encrypted budget structure that can be restored on refresh
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

        // Start background sync after successful join
        // Use get() parameter to avoid React error #185
        const currentState = _get();
        await currentState.startBackgroundSyncAfterLogin(false); // Not a new user

        return { success: true, sharedBudget: true };
      } catch (error) {
        logger.error("Join budget failed.", error);
        return {
          success: false,
          error: "Failed to join budget. Please try again.",
        };
      }
    })();

    return Promise.race([joinPromise, timeoutPromise]);
  },

  logout() {
    logger.auth("Logging out and clearing auth state.");
    set({
      isUnlocked: false,
      encryptionKey: null,
      salt: null,
      currentUser: null,
      lastActivity: null,
      budgetId: null,
    });
  },

  updateUser(updatedUser) {
    if (!updatedUser) {
      logger.warn("updateUser called with null/undefined user");
      return;
    }
    logger.auth("Updating user.", updatedUser);
    set((state) => ({
      currentUser: updatedUser,
      budgetId: updatedUser.budgetId !== state.budgetId ? updatedUser.budgetId : state.budgetId,
    }));
  },

  async startBackgroundSyncAfterLogin(isNewUser = false) {
    try {
      logger.auth("Starting background sync after successful login", {
        isNewUser,
      });

      // GitHub Issue #576 Phase 2: Universal race condition prevention for ALL users
      // Same delay for all users to prevent race conditions
      const syncDelay = 2500; // 2.5s for all users to ensure encryption context is ready
      logger.auth(`⏱️ Adding universal sync delay to prevent race conditions (${syncDelay}ms)`, {
        isNewUser,
        delayMs: syncDelay,
      });
      await new Promise((resolve) => setTimeout(resolve, syncDelay));

      // Import UI store to access startBackgroundSync
      const { useBudgetStore } = await import("../ui/uiStore");
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
  },

  async changePassword(oldPassword, newPassword) {
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
          salt: Array.from(newSalt), // Deterministic salt from new password
          iv: encrypted.iv,
        })
      );

      set({ salt: newSalt, encryptionKey: newKey });

      // Log password change for cross-browser sync debugging
      if (import.meta?.env?.MODE === "development") {
        const saltPreview =
          Array.from(newSalt.slice(0, 8))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("") + "...";
        logger.auth("Password changed with deterministic key", {
          saltPreview,
          keyType: newKey.constructor?.name || "unknown",
        });
      }
      return { success: true };
    } catch (error) {
      logger.error("Password change failed.", error);
      if (error.name === "OperationError" || error.message.toLowerCase().includes("decrypt")) {
        return { success: false, error: "Invalid current password." };
      }
      return { success: false, error: error.message };
    }
  },

  setLastActivity(value) {
    set({ lastActivity: value });
  },

  setEncryption({ key, salt }) {
    set({
      encryptionKey: key,
      salt,
    });
  },

  async updateProfile(updatedProfile) {
    try {
      // TEMP: Get state via store reference - need to restructure this method
      const storeState = useAuth.getState();
      const { encryptionKey, salt: currentSalt } = storeState;

      if (!encryptionKey || !currentSalt) {
        return { success: false, error: "Not authenticated." };
      }

      // Update the current user in the store
      set(() => ({
        currentUser: updatedProfile,
      }));

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

      return { success: true };
    } catch (error) {
      logger.error("Failed to update profile:", error);
      return { success: false, error: error.message };
    }
  },

  async validatePassword(password) {
    try {
      logger.production("Password validation started", {
        hasPassword: !!password,
      });
      logger.auth("validatePassword: Starting validation");

      const { encryptionUtils } = await import("../../utils/security/encryption");
      // Get current state without triggering React error #185
      const authState = _get();
      const savedData = localStorage.getItem("envelopeBudgetData");

      logger.auth("validatePassword: Data check", {
        hasSavedData: !!savedData,
        hasAuthSalt: !!authState.salt,
        hasEncryptionKey: !!authState.encryptionKey,
        authStateKeys: Object.keys(authState),
      });

      // SECURITY FIX: Always validate against actual encrypted data when it exists
      // The fallback method was insecure and allowed any password for session unlock
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
          error: parseError.message,
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

      const saltArray = new Uint8Array(savedSalt);
      logger.auth("validatePassword: Using deterministic key derivation for validation", {
        saltLength: saltArray.length,
        ivLength: iv.length,
        hasEncryptedData: !!encryptedData,
      });

      // Use deterministic key derivation to validate password
      const keyData = await encryptionUtils.deriveKey(password);
      const testKey = keyData.key;

      logger.auth("validatePassword: Key derived successfully");

      // Try to decrypt actual data to validate password
      try {
        await encryptionUtils.decrypt(encryptedData, testKey, iv);
        logger.auth("validatePassword: Decryption successful - password is correct");
        logger.production("Password validation successful", {
          method: "encrypted_data_validation",
        });
        return true;
      } catch (decryptError) {
        logger.auth("validatePassword: Decryption failed - password is incorrect", {
          error: decryptError.message,
          errorType: decryptError.constructor?.name,
        });
        logger.production("Password validation failed", {
          reason: "decryption_failed",
        });
        return false;
      }
    } catch (error) {
      logger.error("validatePassword: Unexpected error", error);
      logger.production("Password validation failed", {
        reason: "unexpected_error",
        error: error.message,
      });
      return false;
    }
  },
}));

export const AuthProvider = ({ children }) => {
  const isUnlocked = useAuth((state) => state.isUnlocked);
  const logout = useAuth((state) => state.logout);
  const setLastActivity = useAuth((state) => state.setLastActivity);

  useEffect(() => {
    if (isUnlocked) {
      const TIMEOUT = 30 * 60 * 1000;
      let timeoutId;

      const resetTimeout = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          logger.info("Auto-locking due to inactivity.");
          logout();
        }, TIMEOUT);
      };

      const handleActivity = () => {
        setLastActivity(Date.now());
        resetTimeout();
      };

      const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
      events.forEach((event) => {
        document.addEventListener(event, handleActivity, true);
      });

      resetTimeout();

      return () => {
        clearTimeout(timeoutId);
        events.forEach((event) => {
          document.removeEventListener(event, handleActivity, true);
        });
      };
    }
  }, [isUnlocked]); // Only depend on isUnlocked - store actions are stable

  return <>{children}</>;
};
