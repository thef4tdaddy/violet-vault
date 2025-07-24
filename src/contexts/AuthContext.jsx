// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { encryptionUtils } from "../utils/encryption";

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
          logout();
        }, TIMEOUT);
      };

      const handleActivity = () => {
        setLastActivity(Date.now());
        resetTimeout();
      };

      // Listen for user activity
      const events = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
      ];
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
    try {
      if (userData) {
        // New user setup
        const { salt: newSalt, key } =
          await encryptionUtils.deriveKey(password);
        setSalt(newSalt);
        setEncryptionKey(key);
        setCurrentUser(userData);
        setBudgetId(userData.budgetId);
        setIsUnlocked(true);
        setLastActivity(Date.now());
        return { success: true };
      } else {
        // Existing user login
        const savedData = localStorage.getItem("envelopeBudgetData");
        if (!savedData) {
          return { success: false, error: "No saved data found" };
        }

        const { salt: savedSalt, encryptedData, iv } = JSON.parse(savedData);
        const saltArray = new Uint8Array(savedSalt);
        const key = await encryptionUtils.deriveKeyFromSalt(
          password,
          saltArray
        );

        const decryptedData = await encryptionUtils.decrypt(
          encryptedData,
          key,
          iv
        );

        // Handle data migration for pre-refactor data
        let migratedData = decryptedData;
        let currentUserData = decryptedData.currentUser;

        // If currentUser doesn't exist or doesn't have budgetId, create/migrate it
        if (!currentUserData || !currentUserData.budgetId) {
          console.log("🔄 Migrating pre-refactor data...");

          // Generate budgetId from password for cross-device sync
          const budgetId = encryptionUtils.generateBudgetId(password);

          // Create or update currentUser
          currentUserData = {
            ...currentUserData,
            budgetId,
            userName: currentUserData?.userName || "Legacy User",
            userColor: currentUserData?.userColor || "#a855f7",
            id: currentUserData?.id || `user_${Date.now()}`,
          };

          // Update the data structure
          migratedData = {
            ...decryptedData,
            currentUser: currentUserData,
          };

          // Save the migrated data back to localStorage
          try {
            const encrypted = await encryptionUtils.encrypt(migratedData, key);
            localStorage.setItem(
              "envelopeBudgetData",
              JSON.stringify({
                encryptedData: encrypted.data,
                salt: Array.from(saltArray),
                iv: encrypted.iv,
              })
            );
            console.log("✅ Data migration completed and saved");
          } catch (saveError) {
            console.warn("⚠️ Failed to save migrated data:", saveError);
          }
        }

        console.log("🔑 AuthContext: Setting auth state after login", {
          hasKey: !!key,
          hasCurrentUser: !!currentUserData,
          hasBudgetId: !!currentUserData.budgetId,
          userName: currentUserData.userName,
          budgetId: currentUserData.budgetId,
        });

        setSalt(saltArray);
        setEncryptionKey(key);
        setCurrentUser(currentUserData);
        setBudgetId(currentUserData.budgetId);
        setIsUnlocked(true);
        setLastActivity(Date.now());

        console.log("✅ AuthContext: Auth state set successfully");

        return { success: true, data: migratedData };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: "Invalid password or corrupted data" };
    }
  };

  const logout = () => {
    setIsUnlocked(false);
    setEncryptionKey(null);
    setSalt(null);
    setCurrentUser(null);
    setLastActivity(null);
    setBudgetId(null);
  };

  const updateUser = (updatedUser) => {
    if (!updatedUser) {
      console.warn("updateUser called with null/undefined user");
      return;
    }
    setCurrentUser(updatedUser);
    if (updatedUser.budgetId !== budgetId) {
      setBudgetId(updatedUser.budgetId);
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
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
