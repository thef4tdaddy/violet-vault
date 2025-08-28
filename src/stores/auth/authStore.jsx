import { useEffect } from "react";
import { create } from "zustand";
import { encryptionUtils } from "../utils/encryption";
import logger from "../utils/common/logger";
import { identifyUser } from "../utils/highlight";

/**
 * Compare two Uint8Array objects byte-wise for equality
 * More reliable than JSON.stringify comparison
 */
function compareUint8Arrays(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = create((set, get) => ({
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
          const deterministicBudgetId = await encryptionUtils.generateBudgetId(password);

          const finalUserData = {
            ...userData,
            budgetId: deterministicBudgetId,
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

          // Start background sync after successful login
          const { startBackgroundSyncAfterLogin } = get();
          await startBackgroundSyncAfterLogin();

          return { success: true };
        } else {
          logger.auth("Existing user login path.");
          const savedData = localStorage.getItem("envelopeBudgetData");
          if (!savedData) {
            logger.warn("No saved data found in localStorage for existing user.");
            return {
              success: false,
              error: "No saved data found. Try creating a new budget.",
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

          const decryptedData = await encryptionUtils.decrypt(encryptedData, key, iv);
          logger.auth("Successfully decrypted local data.");

          let migratedData = decryptedData;
          let currentUserData = decryptedData.currentUser;

          if (!currentUserData || !currentUserData.budgetId) {
            logger.auth("Migrating legacy data structure.");
            const newBudgetId = encryptionUtils.generateBudgetId(password);
            currentUserData = {
              ...currentUserData,
              budgetId: newBudgetId,
              userName: currentUserData?.userName || "Legacy User",
              userColor: currentUserData?.userColor || "#a855f7",
              id: currentUserData?.id || `user_${Date.now()}`,
            };
            migratedData = { ...decryptedData, currentUser: currentUserData };

            const encrypted = await encryptionUtils.encrypt(migratedData, key);
            localStorage.setItem(
              "envelopeBudgetData",
              JSON.stringify({
                encryptedData: encrypted.data,
                salt: Array.from(deterministicSalt),
                iv: encrypted.iv,
              })
            );
            logger.auth("Data migration complete and saved.", { newBudgetId });
          }

          logger.auth("Setting auth state for existing user.", {
            hasKey: !!key,
            budgetId: currentUserData.budgetId,
            userName: currentUserData.userName,
          });

          set({
            salt: deterministicSalt,
            encryptionKey: key,
            currentUser: currentUserData,
            budgetId: currentUserData.budgetId,
            isUnlocked: true,
            lastActivity: Date.now(),
          });

          // Identify returning user in Highlight.io for session tracking
          identifyUser(currentUserData.budgetId, {
            userName: currentUserData.userName,
            userColor: currentUserData.userColor,
            accountType: "returning_user",
          });

          // Start background sync after successful login
          const { startBackgroundSyncAfterLogin } = get();
          await startBackgroundSyncAfterLogin();

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

  async startBackgroundSyncAfterLogin() {
    try {
      logger.auth("Starting background sync after successful login");

      // Import UI store to access startBackgroundSync
      const { useBudgetStore } = await import("./uiStore");
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
      const { encryptionKey, salt: currentSalt } = useAuth.getState();

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
      logger.production("Password validation started", { hasPassword: !!password });
      logger.auth("validatePassword: Starting validation");

      const { encryptionUtils } = await import("../utils/encryption");
      const authState = useAuth.getState();
      const savedData = localStorage.getItem("envelopeBudgetData");

      logger.auth("validatePassword: Data check", {
        hasSavedData: !!savedData,
        hasAuthSalt: !!authState.salt,
        hasEncryptionKey: !!authState.encryptionKey,
        authStateKeys: Object.keys(authState),
      });

      // If we have no encrypted data saved yet, validate against the current auth salt
      if (!savedData && authState.salt) {
        logger.auth("validatePassword: No saved data, validating against auth salt");

        try {
          // For the no-data case, we don't have encrypted data to test against
          // So we'll use a simple approach: try to derive a key and assume it's valid
          // This is less secure but necessary when no encrypted data exists yet
          const saltArray = new Uint8Array(authState.salt);
          const testKey = await encryptionUtils.deriveKeyFromSalt(password, saltArray);

          logger.auth("validatePassword: Key derived successfully for no-data case");
          logger.production("Password validation successful", { method: "no_data_fallback" });
          return true;
        } catch (error) {
          logger.auth("validatePassword: Auth salt validation failed", {
            error: error.message,
          });
          return false;
        }
      }

      // If we have encrypted data, validate against it (original logic)
      if (savedData && authState.salt) {
        const parsedData = JSON.parse(savedData);
        const { salt: savedSalt, encryptedData, iv } = parsedData;
        const saltArray = new Uint8Array(savedSalt);

        logger.auth("validatePassword: Parsed data", {
          hasSavedSalt: !!savedSalt,
          hasEncryptedData: !!encryptedData,
          hasIv: !!iv,
          saltLength: saltArray.length,
          ivLength: iv ? iv.length : 0,
        });

        // Validate that we have all required components
        if (!encryptedData || !iv) {
          logger.auth("validatePassword: Missing required encryption components");
          return false;
        }

        // Try to derive the key with the provided password
        const testKey = await encryptionUtils.deriveKeyFromSalt(password, saltArray);

        logger.auth("validatePassword: Key derived successfully");

        // Try to decrypt actual data to validate password
        try {
          await encryptionUtils.decrypt(encryptedData, testKey, iv);
          logger.auth("validatePassword: Decryption successful - password is correct");
          return true;
        } catch (decryptError) {
          logger.auth("validatePassword: Decryption failed - password is incorrect", {
            error: decryptError.message,
            errorType: decryptError.constructor?.name,
          });
          return false;
        }
      }

      logger.auth("validatePassword: No data to validate against - treating as valid");
      return true;
    } catch (error) {
      logger.error("validatePassword: Unexpected error", error);
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
  }, [isUnlocked, logout, setLastActivity]);

  return <>{children}</>;
};
