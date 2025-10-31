import { useState, useCallback, useEffect, useRef } from "react";
import { securityService } from "../../services/security/securityService";
import logger from "../../utils/common/logger";

/**
 * Hook for security manager UI state and session management
 * Extracts session control and security state management
 */
export const useSecurityManagerUI = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [securitySettings, setSecuritySettings] = useState(() => securityService.loadSettings());
  const [securityEvents, setSecurityEvents] = useState(() => securityService.loadSecurityEvents());

  const lastActivityRef = useRef(null);
  const autoLockTimerRef = useRef(null);
  const clipboardTimerRef = useRef(null);

  // Initialize lastActivityRef with current time on mount
  useEffect(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Save settings to localStorage when changed
  useEffect(() => {
    securityService.saveSettings(securitySettings);
  }, [securitySettings]);

  // Save security events to localStorage
  useEffect(() => {
    securityService.saveSecurityEvents(securityEvents);
  }, [securityEvents]);

  const updateSecuritySettings = useCallback((updates) => {
    setSecuritySettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const addSecurityEvent = useCallback((event) => {
    const securityEvent = securityService.createSecurityEvent(event);
    setSecurityEvents((prev) => [...prev, securityEvent]);
  }, []);

  const clearSecurityEvents = useCallback(() => {
    setSecurityEvents([]);
    securityService.clearSecurityEvents();
  }, []);

  const lockSession = useCallback(() => {
    setIsLocked(true);
    logger.debug("Session locked");
  }, []);

  const unlockSession = useCallback(() => {
    setIsLocked(false);
    lastActivityRef.current = Date.now();
    logger.debug("Session unlocked");
  }, []);

  return {
    // State
    isLocked,
    securitySettings,
    securityEvents,
    lastActivityRef,
    autoLockTimerRef,
    clipboardTimerRef,

    // Actions
    updateSecuritySettings,
    addSecurityEvent,
    clearSecurityEvents,
    lockSession,
    unlockSession,
    setSecurityEvents,
  };
};

/**
 * Hook for security event logging and management
 * Extracts security event handling logic
 */
export const useSecurityEventManager = (securitySettings, addSecurityEvent) => {
  const logSecurityEvent = useCallback(
    (event) => {
      if (!securitySettings.securityLoggingEnabled) return;

      try {
        addSecurityEvent(event);
        logger.debug("Security event logged:", {
          type: event.type,
          description: event.description?.substring(0, 50),
        });
      } catch (error) {
        logger.error("Failed to log security event:", error);
      }
    },
    [securitySettings.securityLoggingEnabled, addSecurityEvent]
  );

  const logLoginAttempt = useCallback(
    (success, metadata = {}) => {
      logSecurityEvent({
        type: success ? "LOGIN_SUCCESS" : "LOGIN_FAILURE",
        description: success ? "User logged in successfully" : "Failed login attempt",
        metadata: {
          ...metadata,
          success,
          timestamp: Date.now(),
        },
      });
    },
    [logSecurityEvent]
  );

  const logSessionActivity = useCallback(
    (activity, metadata = {}) => {
      logSecurityEvent({
        type: "SESSION_ACTIVITY",
        description: `Session activity: ${activity}`,
        metadata: {
          ...metadata,
          activity,
          timestamp: Date.now(),
        },
      });
    },
    [logSecurityEvent]
  );

  const logSecurityAction = useCallback(
    (action, metadata = {}) => {
      logSecurityEvent({
        type: "SECURITY_ACTION",
        description: `Security action: ${action}`,
        metadata: {
          ...metadata,
          action,
          timestamp: Date.now(),
        },
      });
    },
    [logSecurityEvent]
  );

  return {
    logSecurityEvent,
    logLoginAttempt,
    logSessionActivity,
    logSecurityAction,
  };
};

/**
 * Hook for auto-lock functionality
 * Extracts automatic session locking logic
 */
export const useAutoLockManager = (
  securitySettings,
  isLocked,
  lockSession,
  lastActivityRef,
  autoLockTimerRef
) => {
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, [lastActivityRef]);

  const startAutoLockTimer = useCallback(() => {
    if (!securitySettings.autoLockEnabled || isLocked) return;

    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
    }

    const timeoutMs = securitySettings.autoLockTimeout * 60 * 1000;

    autoLockTimerRef.current = setTimeout(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;

      if (timeSinceActivity >= timeoutMs) {
        lockSession();
        logger.debug("Auto-lock activated after timeout", { timeoutMinutes: securitySettings.autoLockTimeout });
      } else {
        // Restart timer for remaining time
        const remainingTime = timeoutMs - timeSinceActivity;
        autoLockTimerRef.current = setTimeout(() => {
          lockSession();
        }, remainingTime);
      }
    }, timeoutMs);
  }, [securitySettings, isLocked, lockSession, lastActivityRef, autoLockTimerRef]);

  const stopAutoLockTimer = useCallback(() => {
    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
      autoLockTimerRef.current = null;
    }
  }, [autoLockTimerRef]);

  const resetAutoLockTimer = useCallback(() => {
    updateActivity();
    startAutoLockTimer();
  }, [updateActivity, startAutoLockTimer]);

  return {
    updateActivity,
    startAutoLockTimer,
    stopAutoLockTimer,
    resetAutoLockTimer,
  };
};

/**
 * Hook for clipboard security management
 * Extracts clipboard clearing and protection logic
 */
export const useClipboardSecurity = (securitySettings, clipboardTimerRef, logSecurityEvent) => {
  const secureClipboardCopy = useCallback(
    async (text, description = "Sensitive data") => {
      try {
        await navigator.clipboard.writeText(text);

        logSecurityEvent({
          type: "CLIPBOARD_COPY",
          description: `Copied ${description} to clipboard`,
          metadata: { description, length: text.length },
        });

        // Clear clipboard after timeout
        if (clipboardTimerRef.current) {
          clearTimeout(clipboardTimerRef.current);
        }

        clipboardTimerRef.current = setTimeout(async () => {
          try {
            const currentClipboard = await navigator.clipboard.readText();
            if (currentClipboard === text) {
              await navigator.clipboard.writeText("");
              logSecurityEvent({
                type: "CLIPBOARD_CLEAR",
                description: "Clipboard automatically cleared",
                metadata: {
                  reason: "timeout",
                  timeout: securitySettings.clipboardClearTimeout,
                },
              });
            }
          } catch (err) {
            logger.warn("Could not auto-clear clipboard:", err);
          }
        }, securitySettings.clipboardClearTimeout * 1000);

        return true;
      } catch (error) {
        logger.error("Failed to copy to clipboard:", error);
        return false;
      }
    },
    [securitySettings.clipboardClearTimeout, clipboardTimerRef, logSecurityEvent]
  );

  const clearClipboardTimer = useCallback(() => {
    if (clipboardTimerRef.current) {
      clearTimeout(clipboardTimerRef.current);
      clipboardTimerRef.current = null;
    }
  }, [clipboardTimerRef]);

  return {
    secureClipboardCopy,
    clearClipboardTimer,
  };
};
