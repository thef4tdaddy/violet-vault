// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { encryptionUtils } from "../utils/encryption";
import logger from "../utils/logger"; // Import the logger

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [salt, setSalt] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [lastActivity, setLastActivity] = useState(null);
  const [budgetId, setBudgetId] = useState(null);

  // Auto-lock after inactivity
  useEffect(() => {
    if (isUnlocked) {
      const TIMEOUT = 30 * 60 * 1000; // 30 minutes
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

      // Listen for user activity
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
  }, [isUnlocked]);

  const login = async (password, userData = null) => {
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

          // Ensure budgetId is present, generate if not.
          const finalUserData = {
            ...userData,
            budgetId: userData.budgetId || encryptionUtils.generateBudgetId(password),
          };

          logger.auth("Setting auth state for new user.", {
            budgetId: finalUserData.budgetId,
          });
          setSalt(newSalt);
          setEncryptionKey(key);
          setCurrentUser(finalUserData);
          setBudgetId(finalUserData.budgetId);
          setIsUnlocked(true);
          setLastActivity(Date.now());

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

            // Re-encrypt and save the migrated data
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

          setSalt(saltArray);
          setEncryptionKey(key);
          setCurrentUser(currentUserData);
          setBudgetId(currentUserData.budgetId);
          setIsUnlocked(true);
          setLastActivity(Date.now());

          return { success: true, data: migratedData };
        }
      } catch (error) {
        logger.error("Login failed.", error);
        // Provide a more specific error for decryption failures
        if (error.name === "OperationError" || error.message.toLowerCase().includes("decrypt")) {
          return { success: false, error: "Invalid password." };
        }
        return { success: false, error: "Invalid password or corrupted data." };
      }
    })();

    return Promise.race([loginPromise, timeoutPromise]);
  };

  const logout = () => {
    logger.auth("Logging out and clearing auth state.");
    setIsUnlocked(false);
    setEncryptionKey(null);
    setSalt(null);
    setCurrentUser(null);
    setLastActivity(null);
    setBudgetId(null);
  };

  const updateUser = (updatedUser) => {
    if (!updatedUser) {
      logger.warn("updateUser called with null/undefined user");
      return;
    }
    logger.auth("Updating user.", updatedUser);
    setCurrentUser(updatedUser);
    if (updatedUser.budgetId !== budgetId) {
      setBudgetId(updatedUser.budgetId);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
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

      setSalt(newSalt);
      setEncryptionKey(newKey);
      return { success: true };
    } catch (error) {
      logger.error("Password change failed.", error);
      if (error.name === "OperationError" || error.message.toLowerCase().includes("decrypt")) {
        return { success: false, error: "Invalid current password." };
      }
      return { success: false, error: error.message };
    }
  };

  const contextValue = {
    isUnlocked,
    encryptionKey,
    salt,
    currentUser,
    lastActivity,
    budgetId,
    login,
    logout,
    updateUser,
    changePassword,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
