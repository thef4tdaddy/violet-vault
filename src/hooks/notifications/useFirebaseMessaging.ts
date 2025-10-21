import { useState, useEffect, useCallback } from "react";
import firebaseMessagingService from "../../services/firebaseMessaging";
import {
  getPermissionStatusForUI,
  requestNotificationPermission,
  trackPermissionDenial,
} from "../../utils/notifications/permissionUtils";
import logger from "../../utils/common/logger";

/**
 * React hook for Firebase Cloud Messaging integration
 * Provides easy access to FCM functionality with permission management
 */
export const useFirebaseMessaging = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);

  // Update permission status
  const updatePermissionStatus = useCallback(() => {
    const status = getPermissionStatusForUI();
    setPermissionStatus(status);
    return status;
  }, []);

  // Initialize Firebase Messaging
  const initialize = useCallback(async () => {
    if (isInitialized) return true;

    setIsLoading(true);
    setError(null);

    try {
      const success = await firebaseMessagingService.initialize();
      setIsInitialized(success);

      if (success) {
        updatePermissionStatus();

        // Check if we already have a token
        const existingToken = firebaseMessagingService.getCurrentToken();
        if (existingToken) {
          setToken(existingToken);
        }
      }

      return success;
    } catch (err) {
      logger.error("Failed to initialize Firebase Messaging", err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, updatePermissionStatus]);

  // Request permission and get token
  const requestPermissionAndGetToken = useCallback(async () => {
    if (!isInitialized) {
      const initialized = await initialize();
      if (!initialized) {
        return { success: false, reason: "initialization_failed" };
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const permissionResult = await requestNotificationPermission();
      updatePermissionStatus();

      if (!permissionResult.success) {
        if (permissionResult.reason === "denied") {
          trackPermissionDenial();
        }
        return permissionResult;
      }

      const tokenResult = await firebaseMessagingService.requestPermissionAndGetToken();
      if (tokenResult.success && tokenResult.token) {
        setToken(tokenResult.token);
        logger.info("📱 FCM token obtained successfully");
      }

      return tokenResult;
    } catch (err) {
      logger.error("Failed to request permission and get token", err);
      setError(err.message);
      return { success: false, reason: "error", error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize, updatePermissionStatus]);

  // Handle permission denial gracefully
  const handlePermissionDenied = useCallback(() => {
    trackPermissionDenial();
    updatePermissionStatus();
    logger.info("User denied notification permission");
  }, [updatePermissionStatus]);

  // Clear token and reset
  const clearToken = useCallback(() => {
    firebaseMessagingService.clearToken();
    setToken(null);
    updatePermissionStatus();
  }, [updatePermissionStatus]);

  // Send test message (development)
  const sendTestMessage = useCallback(async () => {
    if (!token) {
      logger.warn("No FCM token available for test message");
      return false;
    }
    return await firebaseMessagingService.sendTestMessage();
  }, [token]);

  // Listen for foreground messages
  useEffect(() => {
    const handleFCMMessage = (event) => {
      const { payload, timestamp } = event.detail;
      setLastMessage({ payload, timestamp });
      logger.info("📨 Received FCM message in hook", payload);
    };

    window.addEventListener("fcm-message", handleFCMMessage);
    return () => window.removeEventListener("fcm-message", handleFCMMessage);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Update permission status periodically
  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(updatePermissionStatus, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isInitialized, updatePermissionStatus]); // updatePermissionStatus is stable in useCallback

  return {
    // State
    isInitialized,
    isLoading,
    token,
    permissionStatus,
    error,
    lastMessage,

    // Actions
    initialize,
    requestPermissionAndGetToken,
    clearToken,
    handlePermissionDenied,
    sendTestMessage,
    updatePermissionStatus,

    // Computed values
    isAvailable: isInitialized && firebaseMessagingService.isAvailable(),
    hasToken: !!token,
    canRequestPermission: permissionStatus?.canShowPrompt ?? false,
    isSupported: permissionStatus?.isSupported ?? false,

    // Service status
    getServiceStatus: () => firebaseMessagingService.getStatus(),
  };
};
