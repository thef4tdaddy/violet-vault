import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { encryptionUtils } from "../../utils/security/encryption";
import logger from "../../utils/common/logger";
import { identifyUser } from "../../utils/common/highlight";

/**
 * TanStack Query hooks for authentication operations
 *
 * Replaces Zustand authStore methods with proper query/mutation patterns
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

// Query Keys
export const authQueryKeys = {
  all: ["auth"],
  user: () => [...authQueryKeys.all, "user"],
  session: () => [...authQueryKeys.all, "session"],
  validation: (password) => [...authQueryKeys.all, "validation", password],
};

/**
 * Hook for login mutation
 * Handles both new user setup and existing user login
 */
export const useLoginMutation = () => {
  const { setAuthenticated, setError, setLoading } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ password, userData = null }) => {
      logger.auth("TanStack Login attempt started.", {
        hasPassword: !!password,
        hasUserData: !!userData,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Login timeout after 10 seconds")),
          10000,
        ),
      );

      const loginPromise = async () => {
        try {
          if (userData) {
            // New user setup path
            logger.auth("New user setup path.", userData);

            const keyData = await encryptionUtils.deriveKey(password);
            const newSalt = keyData.salt;
            const key = keyData.key;

            if (import.meta?.env?.MODE === "development") {
              const saltPreview =
                Array.from(newSalt.slice(0, 8))
                  .map((b) => b.toString(16).padStart(2, "0"))
                  .join("") + "...";
              logger.auth(
                "Key derived deterministically for cross-browser sync",
                {
                  saltPreview,
                  keyType: key.constructor?.name || "unknown",
                },
              );
            }

            const shareCode = userData.shareCode;
            if (!shareCode) {
              throw new Error("Share code missing from user data during login");
            }

            const deterministicBudgetId =
              await encryptionUtils.generateBudgetId(password, shareCode);

            const finalUserData = {
              ...userData,
              budgetId: deterministicBudgetId,
              userName: userData.userName?.trim() || "User",
            };

            logger.auth("Setting auth state for new user.", {
              budgetId: finalUserData.budgetId,
            });

            // Create initial budget data
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

            // Encrypt and save to localStorage
            const encrypted = await encryptionUtils.encrypt(
              initialBudgetData,
              key,
            );
            localStorage.setItem(
              "envelopeBudgetData",
              JSON.stringify({
                encryptedData: encrypted.data,
                salt: Array.from(newSalt),
                iv: encrypted.iv,
              }),
            );

            // Save user profile
            const profileData = {
              userName: finalUserData.userName,
              userColor: finalUserData.userColor,
            };
            localStorage.setItem("userProfile", JSON.stringify(profileData));

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
          } else {
            // Existing user login path
            logger.auth("Existing user login path.");
            const savedData = localStorage.getItem("envelopeBudgetData");
            if (!savedData) {
              return {
                success: false,
                error: "No budget data found for this password.",
                suggestion: "Would you like to start fresh with a new budget?",
                code: "NO_DATA_FOUND_OFFER_NEW_BUDGET",
                canCreateNew: true,
              };
            }

            const {
              salt: savedSalt,
              encryptedData,
              iv,
            } = JSON.parse(savedData);
            if (!savedSalt || !encryptedData || !iv) {
              return {
                success: false,
                error:
                  "Local data is corrupted. Please clear data and start fresh.",
              };
            }

            // Validate password first
            const keyData = await encryptionUtils.deriveKey(password);
            const key = keyData.key;

            try {
              const decryptedData = await encryptionUtils.decrypt(
                encryptedData,
                key,
                iv,
              );
              let currentUserData = decryptedData.currentUser;

              if (
                !currentUserData ||
                !currentUserData.budgetId ||
                !currentUserData.shareCode
              ) {
                localStorage.removeItem("envelopeBudgetData");
                throw new Error(
                  "Legacy data cleared - please create a new budget with share code system",
                );
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
                sessionData: { encryptionKey: key, salt: keyData.salt },
                data: decryptedData,
              };
            } catch {
              logger.auth(
                "Password validation failed - offering new budget creation",
              );
              return {
                success: false,
                error: "This password doesn't match the existing budget.",
                suggestion: "Would you like to create a new budget instead?",
                code: "INVALID_PASSWORD_OFFER_NEW_BUDGET",
                canCreateNew: true,
              };
            }
          }
        } catch (error) {
          logger.error("Login failed.", error);
          if (
            error.name === "OperationError" ||
            error.message.toLowerCase().includes("decrypt")
          ) {
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
    onSuccess: async (result) => {
      if (result.success) {
        setAuthenticated(result.user, result.sessionData);

        // Start background sync for successful logins
        try {
          const syncDelay = 2500;
          logger.auth(
            `⏱️ Adding universal sync delay to prevent race conditions (${syncDelay}ms)`,
            {
              isNewUser: result.isNewUser || false,
              delayMs: syncDelay,
            },
          );

          await new Promise((resolve) => setTimeout(resolve, syncDelay));

          const { useBudgetStore } = await import("../../stores/ui/uiStore");
          const budgetState = useBudgetStore.getState();

          if (budgetState.cloudSyncEnabled) {
            await budgetState.startBackgroundSync();
            logger.auth("Background sync started successfully after login");
          }
        } catch (error) {
          logger.error("Failed to start background sync after login", error);
        }

        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      } else {
        setError(result.error);
      }
      setLoading(false);
    },
    onError: (error) => {
      logger.error("Login mutation failed", error);
      setError(error.message || "Login failed");
      setLoading(false);
    },
  });
};

/**
 * Hook for joining budget with share code
 */
export const useJoinBudgetMutation = () => {
  const { setAuthenticated, setError, setLoading } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (joinData) => {
      logger.auth("Join budget attempt started.", {
        budgetId: joinData.budgetId?.substring(0, 8) + "...",
        hasPassword: !!joinData.password,
        hasUserInfo: !!joinData.userInfo,
        sharedBy: joinData.sharedBy,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Join timeout after 10 seconds")),
          10000,
        ),
      );

      const joinPromise = async () => {
        try {
          const keyData = await encryptionUtils.deriveKey(joinData.password);
          const newSalt = keyData.salt;
          const key = keyData.key;

          const finalUserData = {
            ...joinData.userInfo,
            budgetId: joinData.budgetId,
            joinedVia: "shareCode",
            sharedBy: joinData.sharedBy,
            userName: joinData.userInfo?.userName?.trim() || "Shared User",
          };

          // Save user profile
          const profileData = {
            userName: finalUserData.userName,
            userColor: finalUserData.userColor,
            joinedVia: "shareCode",
            sharedBy: joinData.sharedBy,
          };
          localStorage.setItem("userProfile", JSON.stringify(profileData));

          // Save encrypted budget data for persistence
          const initialBudgetData = JSON.stringify({
            ...finalUserData,
            bills: [],
            categories: [],
            createdAt: Date.now(),
            lastModified: Date.now(),
          });

          const encrypted = await encryptionUtils.encrypt(
            initialBudgetData,
            key,
          );
          localStorage.setItem(
            "envelopeBudgetData",
            JSON.stringify({
              encryptedData: encrypted.data,
              salt: Array.from(newSalt),
              iv: encrypted.iv,
            }),
          );

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
    onSuccess: async (result) => {
      if (result.success) {
        setAuthenticated(result.user, result.sessionData);

        // Start background sync
        try {
          const syncDelay = 2500;
          await new Promise((resolve) => setTimeout(resolve, syncDelay));

          const { useBudgetStore } = await import("../../stores/ui/uiStore");
          const budgetState = useBudgetStore.getState();

          if (budgetState.cloudSyncEnabled) {
            await budgetState.startBackgroundSync();
          }
        } catch (error) {
          logger.error("Failed to start background sync after join", error);
        }

        queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      } else {
        setError(result.error);
      }
      setLoading(false);
    },
    onError: (error) => {
      logger.error("Join budget mutation failed", error);
      setError(error.message || "Failed to join budget");
      setLoading(false);
    },
  });
};

/**
 * Hook for logout mutation
 */
export const useLogoutMutation = () => {
  const { clearAuth } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      logger.auth("Logging out and clearing auth state.");
      // Clear any sensitive data if needed
      return { success: true };
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear(); // Clear all cached data on logout
    },
    onError: (error) => {
      logger.error("Logout failed", error);
      // Still clear auth state even if something goes wrong
      clearAuth();
    },
  });
};

/**
 * Hook for password change mutation
 */
export const useChangePasswordMutation = () => {
  const { updateUser, setError } = useAuth();

  return useMutation({
    mutationFn: async ({ oldPassword, newPassword }) => {
      try {
        const savedData = localStorage.getItem("envelopeBudgetData");
        if (!savedData) {
          return { success: false, error: "No saved data found." };
        }

        const { encryptedData, iv } = JSON.parse(savedData);
        const oldKeyData = await encryptionUtils.deriveKey(oldPassword);
        const oldKey = oldKeyData.key;

        const decryptedData = await encryptionUtils.decrypt(
          encryptedData,
          oldKey,
          iv,
        );

        const { key: newKey, salt: newSalt } =
          await encryptionUtils.generateKey(newPassword);
        const encrypted = await encryptionUtils.encrypt(decryptedData, newKey);

        localStorage.setItem(
          "envelopeBudgetData",
          JSON.stringify({
            encryptedData: encrypted.data,
            salt: Array.from(newSalt),
            iv: encrypted.iv,
          }),
        );

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

        return { success: true, newKey, newSalt };
      } catch (error) {
        logger.error("Password change failed.", error);
        if (
          error.name === "OperationError" ||
          error.message.toLowerCase().includes("decrypt")
        ) {
          return { success: false, error: "Invalid current password." };
        }
        return { success: false, error: error.message };
      }
    },
    onSuccess: (result) => {
      if (!result.success) {
        setError(result.error);
      }
    },
    onError: (error) => {
      logger.error("Change password mutation failed", error);
      setError(error.message || "Failed to change password");
    },
  });
};

/**
 * Hook for profile update mutation
 */
export const useUpdateProfileMutation = () => {
  const { updateUser, encryptionKey, salt } = useAuth();

  return useMutation({
    mutationFn: async (updatedProfile) => {
      try {
        if (!encryptionKey || !salt) {
          return { success: false, error: "Not authenticated." };
        }

        // Update localStorage profile
        const profileData = {
          userName: updatedProfile.userName,
          userColor: updatedProfile.userColor,
        };
        localStorage.setItem("userProfile", JSON.stringify(profileData));

        // Update encrypted budget data
        const savedData = localStorage.getItem("envelopeBudgetData");
        if (savedData) {
          const { encryptedData, iv } = JSON.parse(savedData);
          const decryptedData = await encryptionUtils.decrypt(
            encryptedData,
            encryptionKey,
            iv,
          );

          const updatedData = {
            ...decryptedData,
            currentUser: updatedProfile,
          };

          const encrypted = await encryptionUtils.encrypt(
            updatedData,
            encryptionKey,
          );
          localStorage.setItem(
            "envelopeBudgetData",
            JSON.stringify({
              encryptedData: encrypted.data,
              salt: Array.from(salt),
              iv: encrypted.iv,
            }),
          );
        }

        return { success: true, profile: updatedProfile };
      } catch (error) {
        logger.error("Failed to update profile:", error);
        return { success: false, error: error.message };
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        updateUser(result.profile);
      }
    },
    onError: (error) => {
      logger.error("Update profile mutation failed", error);
    },
  });
};

/**
 * Hook for password validation query
 */
export const usePasswordValidation = (password, options = {}) => {
  return useQuery({
    queryKey: authQueryKeys.validation(password),
    queryFn: async () => {
      if (!password) return null;

      try {
        logger.auth("TanStack: Password validation started", {
          hasPassword: !!password,
        });

        const savedData = localStorage.getItem("envelopeBudgetData");
        if (!savedData) {
          logger.auth(
            "TanStack: No saved data found - cannot validate password",
          );
          return {
            isValid: false,
            reason: "no_encrypted_data_to_validate_against",
          };
        }

        const parsedData = JSON.parse(savedData);
        const { salt: savedSalt, encryptedData, iv } = parsedData;

        if (!savedSalt || !encryptedData || !iv) {
          logger.auth("TanStack: Missing required encryption components");
          return { isValid: false, reason: "missing_encryption_components" };
        }

        const keyData = await encryptionUtils.deriveKey(password);
        const testKey = keyData.key;

        try {
          await encryptionUtils.decrypt(encryptedData, testKey, iv);
          logger.auth("TanStack: Password validation successful");
          return { isValid: true };
        } catch {
          logger.auth(
            "TanStack: Password validation failed - decryption failed",
          );
          return { isValid: false, reason: "decryption_failed" };
        }
      } catch (error) {
        logger.error("TanStack: Password validation error", error);
        return {
          isValid: false,
          reason: "unexpected_error",
          error: error.message,
        };
      }
    },
    enabled: !!password && password.length > 0,
    staleTime: 0, // Always fresh validation
    cacheTime: 0, // Don't cache password validation results
    ...options,
  });
};
