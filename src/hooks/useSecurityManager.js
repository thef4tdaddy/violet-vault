import { useState, useCallback, useEffect, useRef } from "react";
import { useBudgetStore } from "../stores/budgetStore";
import logger from "../utils/logger";

/**
 * Security Manager Hook
 * Handles session expiration, auto-lock, security events, and clipboard protection
 */
export const useSecurityManager = () => {
  const budget = useBudgetStore();
  const [isLocked, setIsLocked] = useState(false);
  const [securitySettings, setSecuritySettings] = useState(() => {
    const saved = localStorage.getItem("violetVault_securitySettings");
    return saved
      ? JSON.parse(saved)
      : {
          autoLockEnabled: true,
          autoLockTimeout: 15, // minutes
          clipboardClearTimeout: 30, // seconds
          securityLoggingEnabled: true,
          lockOnPageHide: true,
        };
  });

  const lastActivityRef = useRef(Date.now());
  const autoLockTimerRef = useRef(null);
  const clipboardTimerRef = useRef(null);
  const [securityEvents, setSecurityEvents] = useState(() => {
    const saved = localStorage.getItem("violetVault_securityEvents");
    return saved ? JSON.parse(saved) : [];
  });

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem(
      "violetVault_securitySettings",
      JSON.stringify(securitySettings),
    );
  }, [securitySettings]);

  // Save security events to localStorage
  useEffect(() => {
    localStorage.setItem(
      "violetVault_securityEvents",
      JSON.stringify(securityEvents),
    );
  }, [securityEvents]);

  /**
   * Log a security event
   */
  const logSecurityEvent = useCallback(
    (event) => {
      if (!securitySettings.securityLoggingEnabled) return;

      try {
        // Safely serialize metadata to avoid circular references
        const safeMetadata = {
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          url: window.location.href,
        };

        // Safely add event metadata, avoiding circular references
        if (event.metadata) {
          Object.keys(event.metadata).forEach((key) => {
            try {
              const value = event.metadata[key];
              // Only include serializable values
              if (
                typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean" ||
                value === null ||
                value === undefined ||
                (typeof value === "object" && JSON.stringify(value))
              ) {
                safeMetadata[key] = value;
              }
            } catch (err) {
              // Skip non-serializable values
              console.warn(
                `Skipping non-serializable metadata key: ${key}`,
                err,
              );
            }
          });
        }

        const securityEvent = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          type: event.type,
          description: event.description,
          metadata: safeMetadata,
        };

        setSecurityEvents((prev) => {
          const updated = [securityEvent, ...prev];
          // Keep only last 100 events to prevent storage bloat
          return updated.slice(0, 100);
        });

        logger.info(`Security event logged: ${event.type}`, securityEvent);
      } catch (error) {
        console.error("Failed to log security event:", error);
        // Still try to log a minimal event
        try {
          const minimalEvent = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            type: event.type || "UNKNOWN",
            description: event.description || "Security event (logging error)",
            metadata: { error: "Logging error occurred" },
          };
          setSecurityEvents((prev) => [minimalEvent, ...prev.slice(0, 99)]);
        } catch (fallbackError) {
          console.error("Failed to log minimal security event:", fallbackError);
        }
      }
    },
    [securitySettings.securityLoggingEnabled],
  );

  /**
   * Update last activity timestamp
   */
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  /**
   * Check if session should be locked due to inactivity
   */
  const checkAutoLock = useCallback(() => {
    if (!securitySettings.autoLockEnabled || isLocked) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    const timeoutMs = securitySettings.autoLockTimeout * 60 * 1000;

    if (timeSinceActivity >= timeoutMs) {
      setIsLocked(true);
      logSecurityEvent({
        type: "AUTO_LOCK",
        description: `Session automatically locked after ${securitySettings.autoLockTimeout} minutes of inactivity`,
        metadata: {
          inactiveTime: timeSinceActivity,
          timeoutSetting: securitySettings.autoLockTimeout,
        },
      });
    }
  }, [
    securitySettings.autoLockEnabled,
    securitySettings.autoLockTimeout,
    isLocked,
    logSecurityEvent,
  ]);

  /**
   * Start auto-lock monitoring
   */
  const startAutoLockTimer = useCallback(() => {
    if (autoLockTimerRef.current) {
      clearInterval(autoLockTimerRef.current);
    }

    if (securitySettings.autoLockEnabled) {
      // Check every 30 seconds
      autoLockTimerRef.current = setInterval(checkAutoLock, 30000);
    }
  }, [securitySettings.autoLockEnabled, checkAutoLock]);

  /**
   * Stop auto-lock monitoring
   */
  const stopAutoLockTimer = useCallback(() => {
    if (autoLockTimerRef.current) {
      clearInterval(autoLockTimerRef.current);
      autoLockTimerRef.current = null;
    }
  }, []);

  /**
   * Lock the application immediately
   */
  const lockApp = useCallback(
    (reason = "Manual lock") => {
      try {
        setIsLocked(true);
        logSecurityEvent({
          type: "MANUAL_LOCK",
          description: reason,
          metadata: { trigger: "manual" },
        });
      } catch (error) {
        console.error("Error during app lock:", error);
        // Still lock the app even if logging fails
        setIsLocked(true);
      }
    },
    [logSecurityEvent],
  );

  /**
   * Attempt to unlock the application
   */
  const unlockApp = useCallback(
    async (password) => {
      try {
        // Check if validatePassword function exists
        if (!budget.validatePassword) {
          console.warn(
            "validatePassword function not available on budget store",
          );
          return { success: false, error: "Security validation not available" };
        }

        console.log("🔐 Attempting password validation...");
        // Validate password against stored budget
        const isValidPassword = await budget.validatePassword(password);
        console.log("🔐 Password validation result:", isValidPassword);

        if (isValidPassword) {
          setIsLocked(false);
          updateActivity();
          logSecurityEvent({
            type: "SUCCESSFUL_UNLOCK",
            description: "Application unlocked with correct password",
            metadata: { method: "password" },
          });
          return { success: true };
        } else {
          logSecurityEvent({
            type: "FAILED_UNLOCK",
            description: "Failed unlock attempt with incorrect password",
            metadata: { method: "password" },
          });
          return { success: false, error: "Invalid password" };
        }
      } catch (error) {
        console.error("Error during unlock attempt:", error);
        try {
          logSecurityEvent({
            type: "UNLOCK_ERROR",
            description: `Error during unlock attempt: ${error.message}`,
            metadata: { error: error.message },
          });
        } catch (logError) {
          console.error("Failed to log security event:", logError);
        }
        return { success: false, error: "Unlock failed" };
      }
    },
    [budget, updateActivity, logSecurityEvent],
  );

  /**
   * Clear clipboard after timeout for sensitive data
   */
  const copyToClipboardSecure = useCallback(
    async (text, description = "sensitive data") => {
      try {
        await navigator.clipboard.writeText(text);

        logSecurityEvent({
          type: "CLIPBOARD_COPY",
          description: `Copied ${description} to clipboard`,
          metadata: { dataType: description },
        });

        // Clear clipboard after timeout
        if (clipboardTimerRef.current) {
          clearTimeout(clipboardTimerRef.current);
        }

        clipboardTimerRef.current = setTimeout(async () => {
          try {
            await navigator.clipboard.writeText(""); // Clear clipboard
            logSecurityEvent({
              type: "CLIPBOARD_CLEARED",
              description: `Automatically cleared clipboard after ${securitySettings.clipboardClearTimeout} seconds`,
              metadata: {
                timeout: securitySettings.clipboardClearTimeout,
                dataType: description,
              },
            });
          } catch (error) {
            logger.warn("Failed to clear clipboard:", error);
          }
        }, securitySettings.clipboardClearTimeout * 1000);

        return { success: true };
      } catch (error) {
        logger.error("Failed to copy to clipboard:", error);
        return { success: false, error: "Failed to copy to clipboard" };
      }
    },
    [securitySettings.clipboardClearTimeout, logSecurityEvent],
  );

  /**
   * Update security settings
   */
  const updateSecuritySettings = useCallback(
    (updates) => {
      setSecuritySettings((prev) => {
        const newSettings = { ...prev, ...updates };

        logSecurityEvent({
          type: "SETTINGS_CHANGED",
          description: "Security settings updated",
          metadata: {
            changes: updates,
            // Only log serializable parts of previous settings
            previousSettingsKeys: Object.keys(prev),
          },
        });

        return newSettings;
      });
    },
    [logSecurityEvent],
  );

  /**
   * Clear security event log
   */
  const clearSecurityEvents = useCallback(() => {
    setSecurityEvents([]);
    logSecurityEvent({
      type: "LOG_CLEARED",
      description: "Security event log manually cleared",
      metadata: { clearTime: new Date().toISOString() },
    });
  }, [logSecurityEvent]);

  /**
   * Export security events for audit
   */
  const exportSecurityEvents = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      events: securityEvents,
      settings: securitySettings,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `violetvault-security-audit-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logSecurityEvent({
      type: "AUDIT_EXPORT",
      description: "Security events exported for audit",
      metadata: { eventCount: securityEvents.length },
    });
  }, [securityEvents, securitySettings, logSecurityEvent]);

  // Set up activity listeners
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const activityHandler = () => {
      updateActivity();
    };

    events.forEach((event) => {
      document.addEventListener(event, activityHandler, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, activityHandler, true);
      });
    };
  }, [updateActivity]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && securitySettings.lockOnPageHide) {
        lockApp("Page hidden - automatic lock");
      } else if (!document.hidden) {
        updateActivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [securitySettings.lockOnPageHide, lockApp, updateActivity]);

  // Start/stop auto-lock timer based on settings
  useEffect(() => {
    if (securitySettings.autoLockEnabled && !isLocked) {
      startAutoLockTimer();
    } else {
      stopAutoLockTimer();
    }

    return stopAutoLockTimer;
  }, [
    securitySettings.autoLockEnabled,
    isLocked,
    startAutoLockTimer,
    stopAutoLockTimer,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoLockTimer();
      if (clipboardTimerRef.current) {
        clearTimeout(clipboardTimerRef.current);
      }
    };
  }, [stopAutoLockTimer]);

  return {
    // State
    isLocked,
    securitySettings,
    securityEvents: securityEvents.slice(0, 50), // Return only recent events for UI

    // Actions
    lockApp,
    unlockApp,
    updateActivity,
    copyToClipboardSecure,
    updateSecuritySettings,
    clearSecurityEvents,
    exportSecurityEvents,
    logSecurityEvent,

    // Utils
    getSecurityStatus: () => ({
      isLocked,
      lastActivity: lastActivityRef.current,
      autoLockEnabled: securitySettings.autoLockEnabled,
      timeUntilAutoLock: securitySettings.autoLockEnabled
        ? Math.max(
            0,
            securitySettings.autoLockTimeout * 60 * 1000 -
              (Date.now() - lastActivityRef.current),
          )
        : null,
    }),
  };
};

export default useSecurityManager;
