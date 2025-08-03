import React, { useEffect } from "react";
import { create } from "zustand";
import { encryptionUtils } from "../utils/encryption";
import logger from "../utils/logger";
import { identifyUser } from "../utils/highlight";

export const useAuth = create((set) => ({
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
          const { salt: newSalt, key } = await encryptionUtils.deriveKey(password);
          logger.auth("Generated key and salt for new user.");

          const finalUserData = {
            ...userData,
            budgetId: userData.budgetId || encryptionUtils.generateBudgetId(password),
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
          const saltArray = new Uint8Array(savedSalt);
          const key = await encryptionUtils.deriveKeyFromSalt(password, saltArray);

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
                salt: Array.from(saltArray),
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
            salt: saltArray,
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

  async changePassword(oldPassword, newPassword) {
    try {
      const savedData = localStorage.getItem("envelopeBudgetData");
      if (!savedData) {
        return { success: false, error: "No saved data found." };
      }

      const { salt: savedSalt, encryptedData, iv } = JSON.parse(savedData);
      const saltArray = new Uint8Array(savedSalt);
      const oldKey = await encryptionUtils.deriveKeyFromSalt(oldPassword, saltArray);

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
