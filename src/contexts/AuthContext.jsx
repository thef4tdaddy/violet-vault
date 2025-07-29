// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect } from "react";
import { encryptionUtils } from "../utils/encryption";
import logger from "../utils/logger"; // Import the logger
import useAuthStore from "../stores/authStore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const {
    isUnlocked,
    encryptionKey,
    salt,
    currentUser,
    lastActivity,
    budgetId,
    login,
    logout,
    updateUser,
  } = useAuthStore();

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
        useAuthStore.getState().setLastActivity(Date.now());
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

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
