import { useState, useCallback, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { securityService } from "@/services/security/securityService";
import type { SecuritySettings, SecurityEvent } from "@/services/security/securityService";
import logger from "@/utils/common/logger";

export type SecurityEventInput = Partial<SecurityEvent> & {
  type: string;
  description: string;
  metadata?: Record<string, unknown>;
};

/**
 * Hook for security manager UI state and session management
 * Extracts session control and security state management
 */
export const useSecurityManagerUI = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() =>
    securityService.loadSettings()
  );
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(() =>
    securityService.loadSecurityEvents()
  );

  const lastActivityRef = useRef<number | null>(null);
  const autoLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clipboardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const updateSecuritySettings = useCallback((updates: Partial<SecuritySettings>) => {
    setSecuritySettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const addSecurityEvent = useCallback((event: SecurityEventInput) => {
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

  const getActivityDescription = (activity: SecurityEvent | null) => {
    if (!activity) return "No recent activity";

    const timeAgoMinutes = Math.floor(
      (Date.now() - new Date(activity.timestamp).getTime()) / 1000 / 60
    );
    const timeUnit = timeAgoMinutes === 1 ? "minute" : timeAgoMinutes < 60 ? "minutes" : "hours";
    const timeValue =
      timeUnit === "hours" ? Math.max(1, Math.floor(timeAgoMinutes / 60)) : timeAgoMinutes;

    return `${activity.type} ${timeValue}${timeValue === 1 ? "" : "s"} ago`;
  };

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

    // Utilities
    getActivityDescription,
  };
};

/**
 * Hook for security event logging and management
 * Extracts security event handling logic
 */
export const useSecurityEventManager = (
  securitySettings: SecuritySettings,
  addSecurityEvent: (event: SecurityEventInput) => void
) => {
  const logSecurityEvent = useCallback(
    (event: SecurityEventInput) => {
      if (!securitySettings.securityLoggingEnabled) return;

      try {
        addSecurityEvent(event);
        logger.debug("Security event logged:", {
          type: event.type,
          description: event.description?.substring(0, 50),
        });
      } catch (error) {
        logger.error("Failed to log security event:", error as Record<string, unknown>);
      }
    },
    [securitySettings.securityLoggingEnabled, addSecurityEvent]
  );

  const logLoginAttempt = useCallback(
    (success: boolean, metadata: Record<string, unknown> = {}) => {
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
    (activity: string, metadata: Record<string, unknown> = {}) => {
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
    (action: string, metadata: Record<string, unknown> = {}) => {
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
  securitySettings: SecuritySettings,
  isLocked: boolean,
  lockSession: () => void,
  lastActivityRef: MutableRefObject<number | null>,
  autoLockTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
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
      const lastActivityTimestamp = lastActivityRef.current ?? Date.now();
      const timeSinceActivity = Date.now() - lastActivityTimestamp;

      if (timeSinceActivity >= timeoutMs) {
        lockSession();
        logger.debug("Auto-lock activated after timeout", {
          timeoutMinutes: securitySettings.autoLockTimeout,
        });
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
export const useClipboardSecurity = (
  securitySettings: SecuritySettings,
  clipboardTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
  logSecurityEvent: (event: SecurityEventInput) => void
) => {
  const secureClipboardCopy = useCallback(
    async (text: string, description = "Sensitive data") => {
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
            logger.warn("Could not auto-clear clipboard:", err as Record<string, unknown>);
          }
        }, securitySettings.clipboardClearTimeout * 1000);

        return true;
      } catch (error) {
        logger.error("Failed to copy to clipboard:", error as Record<string, unknown>);
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
