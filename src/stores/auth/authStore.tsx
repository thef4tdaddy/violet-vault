import React, { useEffect } from "react";
import { create } from "zustand";
import { encryptionUtils } from "@/utils/security/encryption";
import logger from "@/utils/common/logger";
import { identifyUser } from "@/utils/common/highlight";

// --- TYPE DEFINITIONS ---

interface NewUserData {
  shareCode: string;
  userName?: string;
  userColor?: string;
  [key: string]: unknown;
}

interface JoinData {
  budgetId: string;
  password: string;
  userInfo: {
    userName?: string;
    userColor?: string;
  };
  sharedBy: string;
}

interface CurrentUser {
  budgetId: string;
  shareCode: string;
  userName: string;
  userColor: string;
  [key: string]: unknown;
}

interface AuthState {
  isUnlocked: boolean;
  encryptionKey: CryptoKey | null;
  salt: Uint8Array | null;
  currentUser: CurrentUser | null;
  lastActivity: number | null;
  budgetId: string | null;
}

// Response types for async actions
type LoginResponse = {
  success: boolean;
  error?: string;
  suggestion?: string;
  code?: string;
  canCreateNew?: boolean;
  data?: unknown;
};

type JoinResponse = { success: boolean; sharedBudget?: boolean; error?: string };
type ChangePasswordResponse = { success: boolean; error?: string };
type UpdateProfileResponse = { success: boolean; error?: string };

interface AuthActions {
  login: (password: string, userData?: NewUserData | null) => Promise<LoginResponse>;
  joinBudgetWithShareCode: (joinData: JoinData) => Promise<JoinResponse>;
  logout: () => void;
  updateUser: (updatedUser: CurrentUser) => void;
  startBackgroundSyncAfterLogin: (isNewUser?: boolean) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<ChangePasswordResponse>;
  setLastActivity: (value: number) => void;
  setEncryption: ({ key, salt }: { key: CryptoKey; salt: Uint8Array }) => void;
  updateProfile: (updatedProfile: CurrentUser) => Promise<UpdateProfileResponse>;
  validatePassword: (password: string) => Promise<boolean>;
}

type AuthStore = AuthState & AuthActions;

interface SavedData {
  encryptedData: string;
  salt: number[];
  iv: string;
}

interface DecryptedData {
  currentUser: CurrentUser;
  [key: string]: unknown;
}

// --- ZUSTAND STORE ---

export const useAuth = create<AuthStore>((set, get) => ({
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

    const timeoutPromise = new Promise<LoginResponse>((_, reject) =>
      setTimeout(() => reject(new Error("Login timeout after 10 seconds")), 10000)
    );

    const loginPromise = (async (): Promise<LoginResponse> => {
      try {
        if (userData) {
          logger.auth("New user setup path.", userData);

          const keyData = await encryptionUtils.deriveKey(password);
          const newSalt = keyData.salt;
          const key = keyData.key;

          if (import.meta?.env?.MODE === "development") {
            const saltPreview =
              Array.from(newSalt.slice(0, 8))
                .map((b: number) => b.toString(16).padStart(2, "0"))
                .join("") + "...";
            logger.auth("Key derived deterministically for cross-browser sync", {
              saltPreview,
              keyType: key.constructor?.name || "unknown",
            });
          }
          logger.auth("Generated/restored key and salt for user.");

          const shareCode = userData.shareCode;
          if (!shareCode) {
            throw new Error("Share code missing from user data during login");
          }
          const deterministicBudgetId = await encryptionUtils.generateBudgetId(password, shareCode);

          const finalUserData: CurrentUser = {
            ...userData,
            budgetId: deterministicBudgetId,
            userName: userData.userName?.trim() || "User",
            shareCode: userData.shareCode,
            userColor: userData.userColor || "#000000",
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

          await get().startBackgroundSyncAfterLogin(true);
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

          const { salt: savedSalt, encryptedData, iv }: SavedData = JSON.parse(savedData);
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

          logger.auth("Validating password before allowing login");
          const passwordValid = await get().validatePassword(password);
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

          const keyData = await encryptionUtils.deriveKey(password);
          const deterministicSalt = keyData.salt;
          const key = keyData.key;

          if (import.meta?.env?.MODE === "development") {
            const saltPreview =
              Array.from(deterministicSalt.slice(0, 8))
                .map((b: number) => b.toString(16).padStart(2, "0"))
                .join("") + "...";
            logger.auth("Using deterministic key derivation for cross-browser sync", {
              saltPreview,
              passwordLength: password?.length || 0,
              keyType: key.constructor?.name || "unknown",
            });
          }

          let decryptedData: DecryptedData;
          try {
            decryptedData = (await encryptionUtils.decrypt(
              encryptedData,
              key,
              iv
            )) as DecryptedData;
            logger.auth("Successfully decrypted local data.");
          } catch (decryptError: unknown) {
            const message =
              decryptError instanceof Error ? decryptError.message : String(decryptError);
            logger.error("Unexpected decryption failure after password validation", {
              error: message,
              errorType:
                decryptError instanceof Error
                  ? decryptError.constructor?.name
                  : typeof decryptError,
            });
            return {
              success: false,
              error: "Unable to decrypt data. Please try again or contact support.",
              code: "DECRYPTION_FAILED",
            };
          }

          const currentUserData = decryptedData.currentUser;

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

          const sanitizedUserData: CurrentUser = {
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

          identifyUser(sanitizedUserData.budgetId, {
            userName: sanitizedUserData.userName,
            userColor: sanitizedUserData.userColor,
            accountType: "returning_user",
          });

          await get().startBackgroundSyncAfterLogin();

          return { success: true, data: decryptedData };
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error("Login failed.", error);
        if (
          error instanceof Error &&
          (error.name === "OperationError" || message.toLowerCase().includes("decrypt"))
        ) {
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

    const timeoutPromise = new Promise<JoinResponse>((_, reject) =>
      setTimeout(() => reject(new Error("Join timeout after 10 seconds")), 10000)
    );

    const joinPromise = (async (): Promise<JoinResponse> => {
      try {
        const keyData = await encryptionUtils.deriveKey(joinData.password);
        const newSalt = keyData.salt;
        const key = keyData.key;

        const finalUserData: CurrentUser = {
          budgetId: joinData.budgetId,
          joinedVia: "shareCode",
          sharedBy: joinData.sharedBy,
          userName: joinData.userInfo?.userName?.trim() || "Shared User",
          userColor: joinData.userInfo?.userColor || "#000000",
          shareCode: "", // Share code not needed for joining user
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

        identifyUser(finalUserData.budgetId, {
          userName: finalUserData.userName,
          userColor: finalUserData.userColor,
          accountType: "shared_user",
          sharedBy: joinData.sharedBy,
        });

        const profileData = {
          userName: finalUserData.userName,
          userColor: finalUserData.userColor,
          joinedVia: "shareCode",
          sharedBy: joinData.sharedBy,
        };
        localStorage.setItem("userProfile", JSON.stringify(profileData));
        logger.auth("Saved shared user profile to localStorage.");

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

        await get().startBackgroundSyncAfterLogin(false);

        return { success: true, sharedBudget: true };
      } catch (error: unknown) {
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

      const syncDelay = 2500;
      logger.auth(`⏱️ Adding universal sync delay to prevent race conditions (${syncDelay}ms)`, {
        isNewUser,
        delayMs: syncDelay,
      });
      await new Promise((resolve) => setTimeout(resolve, syncDelay));

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

      const { encryptedData, iv }: SavedData = JSON.parse(savedData);
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

      set({ salt: newSalt, encryptionKey: newKey });

      if (import.meta?.env?.MODE === "development") {
        const saltPreview =
          Array.from(newSalt.slice(0, 8))
            .map((b: number) => b.toString(16).padStart(2, "0"))
            .join("") + "...";
        logger.auth("Password changed with deterministic key", {
          saltPreview,
          keyType: newKey.constructor?.name || "unknown",
        });
      }
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("Password change failed.", error);
      if (
        error instanceof Error &&
        (error.name === "OperationError" || message.toLowerCase().includes("decrypt"))
      ) {
        return { success: false, error: "Invalid current password." };
      }
      return { success: false, error: message };
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
      const { encryptionKey, salt: currentSalt } = get();

      if (!encryptionKey || !currentSalt) {
        return { success: false, error: "Not authenticated." };
      }

      set(() => ({
        currentUser: updatedProfile,
      }));

      const profileData = {
        userName: updatedProfile.userName,
        userColor: updatedProfile.userColor,
      };
      localStorage.setItem("userProfile", JSON.stringify(profileData));

      const savedData = localStorage.getItem("envelopeBudgetData");
      if (savedData) {
        const { encryptedData, iv }: SavedData = JSON.parse(savedData);
        const decryptedData = await encryptionUtils.decrypt(encryptedData, encryptionKey, iv);

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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("Failed to update profile:", error);
      return { success: false, error: message };
    }
  },

  async validatePassword(password) {
    try {
      logger.production("Password validation started", {
        hasPassword: !!password,
      });
      logger.auth("validatePassword: Starting validation");

      const authState = get();
      const savedData = localStorage.getItem("envelopeBudgetData");

      logger.auth("validatePassword: Data check", {
        hasSavedData: !!savedData,
        hasAuthSalt: !!authState.salt,
        hasEncryptionKey: !!authState.encryptionKey,
        authStateKeys: Object.keys(authState),
      });

      if (!savedData) {
        logger.auth("validatePassword: No saved data found - cannot validate password");
        logger.production("Password validation failed", {
          reason: "no_encrypted_data_to_validate_against",
        });
        return false;
      }

      let parsedData: SavedData;
      try {
        parsedData = JSON.parse(savedData) as SavedData;
      } catch (parseError: unknown) {
        const message = parseError instanceof Error ? parseError.message : String(parseError);
        logger.auth("validatePassword: Failed to parse saved data", {
          error: message,
        });
        return false;
      }

      const { salt: savedSalt, encryptedData, iv } = parsedData;

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

      const keyData = await encryptionUtils.deriveKey(password);
      const testKey = keyData.key;

      logger.auth("validatePassword: Key derived successfully");

      try {
        await encryptionUtils.decrypt(encryptedData, testKey, iv);
        logger.auth("validatePassword: Decryption successful - password is correct");
        logger.production("Password validation successful", {
          method: "encrypted_data_validation",
        });
        return true;
      } catch (decryptError: unknown) {
        const message = decryptError instanceof Error ? decryptError.message : String(decryptError);
        logger.auth("validatePassword: Decryption failed - password is incorrect", {
          error: message,
          errorType:
            decryptError instanceof Error ? decryptError.constructor?.name : typeof decryptError,
        });
        logger.production("Password validation failed", {
          reason: "decryption_failed",
        });
        return false;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("validatePassword: Unexpected error", error);
      logger.production("Password validation failed", {
        reason: "unexpected_error",
        error: message,
      });
      return false;
    }
  },
}));

// --- AUTH PROVIDER ---

// Get stable actions once, outside the component scope.
// This is safe because Zustand actions are stable and don't change.
const { logout, setLastActivity } = useAuth.getState();

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const isUnlocked = useAuth((state) => state.isUnlocked);

  useEffect(() => {
    if (isUnlocked) {
      const TIMEOUT = 30 * 60 * 1000; // 30 minutes
      let timeoutId: ReturnType<typeof setTimeout>;

      const resetTimeout = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          logger.info("Auto-locking due to inactivity.");
          logout(); // Use the stable action
        }, TIMEOUT);
      };

      const handleActivity = () => {
        setLastActivity(Date.now()); // Use the stable action
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
  }, [isUnlocked]); // Only depend on isUnlocked - store actions are stable.

  return <>{children}</>;
};
