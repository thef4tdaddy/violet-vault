import { useCallback, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import {
  useSecurityManagerUI,
  useSecurityEventManager,
  useAutoLockManager,
  useClipboardSecurity,
  type SecurityEventInput,
} from "@/hooks/auth/useSecurityManagerUI";
import logger from "@/utils/core/common/logger";
import type { SecuritySettings } from "@/services/security/securityService";

/**
 * Helper to create visibility change handler with unlock grace period
 */
const createVisibilityHandler = (
  lastUnlockTimeRef: MutableRefObject<number>,
  logSecurityEvent: (event: SecurityEventInput) => void,
  lockSession: () => void
) => {
  const UNLOCK_GRACE_PERIOD = 2000;

  return () => {
    if (document.hidden) {
      const now = Date.now();
      const lastUnlock = lastUnlockTimeRef.current;
      const timeSinceUnlock = now - lastUnlock;

      logger.debug("🔒 Visibility handler - PAGE_HIDDEN", {
        now,
        lastUnlock,
        timeSinceUnlock,
        gracePeriod: UNLOCK_GRACE_PERIOD,
        withinGracePeriod: timeSinceUnlock < UNLOCK_GRACE_PERIOD,
      });

      if (timeSinceUnlock < UNLOCK_GRACE_PERIOD) {
        logger.debug("✅ Skipping auto-lock - within grace period after unlock", {
          timeSinceUnlock,
          gracePeriod: UNLOCK_GRACE_PERIOD,
        });
        return;
      }

      logger.debug("🔒 Locking session - outside grace period", {
        timeSinceUnlock,
        gracePeriod: UNLOCK_GRACE_PERIOD,
      });

      logSecurityEvent({
        type: "PAGE_HIDDEN",
        description: "Page hidden, session locked for security",
      });
      lockSession();
    } else {
      logSecurityEvent({
        type: "PAGE_VISIBLE",
        description: "Page visible, user may need to unlock",
      });
    }
  };
};

/**
 * Security Manager Hook
 * Orchestrates session expiration, auto-lock, security events, and clipboard protection
 */
export const useSecurityManager = () => {
  const lastUnlockTimeRef = useRef(0);

  const {
    isLocked,
    securitySettings,
    securityEvents,
    lastActivityRef,
    autoLockTimerRef,
    clipboardTimerRef,
    updateSecuritySettings,
    addSecurityEvent,
    clearSecurityEvents,
    lockSession,
    unlockSession,
  } = useSecurityManagerUI();

  const { logSecurityEvent, logLoginAttempt, logSessionActivity, logSecurityAction } =
    useSecurityEventManager(securitySettings, addSecurityEvent);

  const { updateActivity, startAutoLockTimer, stopAutoLockTimer, resetAutoLockTimer } =
    useAutoLockManager(securitySettings, isLocked, lockSession, lastActivityRef, autoLockTimerRef);

  const { secureClipboardCopy, clearClipboardTimer } = useClipboardSecurity(
    securitySettings,
    clipboardTimerRef,
    logSecurityEvent
  );

  // Initialize auto-lock on mount
  useEffect(() => {
    if (securitySettings.autoLockEnabled && !isLocked) {
      startAutoLockTimer();
    }

    return () => {
      stopAutoLockTimer();
      clearClipboardTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    securitySettings.autoLockEnabled,
    isLocked,
    // startAutoLockTimer, stopAutoLockTimer, clearClipboardTimer are stable
  ]);

  // Handle page visibility changes for lock-on-hide feature
  useEffect(() => {
    if (!securitySettings.lockOnPageHide) return;

    const handleVisibilityChange = createVisibilityHandler(
      lastUnlockTimeRef,
      logSecurityEvent,
      lockSession
    );

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [securitySettings.lockOnPageHide]);

  // Update unlock timestamp when session is unlocked
  useEffect(() => {
    if (!isLocked) {
      const now = Date.now();
      lastUnlockTimeRef.current = now;
      logger.debug("🔓 Unlock grace period started", {
        duration: 2000,
        timestamp: now,
        willExpireAt: now + 2000,
      });
    }
  }, [isLocked]);

  // Enhanced security functions with logging
  const enhancedLockSession = useCallback(() => {
    logSecurityEvent({
      type: "SESSION_LOCKED",
      description: "Session manually locked",
      metadata: { trigger: "manual" },
    });
    lockSession();
  }, [lockSession, logSecurityEvent]);

  const enhancedUnlockSession = useCallback(() => {
    // Password validation would happen in auth store
    logSecurityEvent({
      type: "SESSION_UNLOCKED",
      description: "Session unlocked successfully",
      metadata: { trigger: "manual" },
    });
    unlockSession();
    resetAutoLockTimer();
  }, [unlockSession, logSecurityEvent, resetAutoLockTimer]);

  const updateSettings = useCallback(
    (newSettings: Partial<SecuritySettings>) => {
      const oldSettings = securitySettings;
      updateSecuritySettings(newSettings);

      logSecurityEvent({
        type: "SECURITY_SETTINGS_CHANGED",
        description: "Security settings updated",
        metadata: {
          changed: Object.keys(newSettings),
          autoLockWasEnabled: oldSettings.autoLockEnabled,
          autoLockNowEnabled: newSettings.autoLockEnabled ?? oldSettings.autoLockEnabled,
        },
      });

      // Restart auto-lock timer if settings changed
      if (newSettings.autoLockEnabled !== undefined || newSettings.autoLockTimeout !== undefined) {
        if (newSettings.autoLockEnabled !== false) {
          resetAutoLockTimer();
        } else {
          stopAutoLockTimer();
        }
      }
    },
    [
      securitySettings,
      updateSecuritySettings,
      logSecurityEvent,
      resetAutoLockTimer,
      stopAutoLockTimer,
    ]
  );

  // Activity tracking with throttling
  const trackActivity = useCallback(() => {
    updateActivity();

    // Throttle activity logging to avoid spam
    const now = Date.now();
    const lastLog = lastActivityRef.current ?? 0;
    if (now - lastLog > 60000) {
      // Log activity at most once per minute
      logSecurityEvent({
        type: "USER_ACTIVITY",
        description: "User activity detected",
        metadata: { lastActivity: lastLog },
      });
    }
  }, [updateActivity, lastActivityRef, logSecurityEvent]);

  // Cleanup function
  const cleanup = useCallback(() => {
    stopAutoLockTimer();
    clearClipboardTimer();
    logger.debug("Security manager cleaned up");
  }, [stopAutoLockTimer, clearClipboardTimer]);

  return {
    // State
    isLocked,
    securitySettings,
    securityEvents,

    // Session Control
    lockSession: enhancedLockSession,
    unlockSession: enhancedUnlockSession,

    // Activity Tracking
    trackActivity,
    resetAutoLockTimer,

    // Settings Management
    updateSettings,

    // Security Event Management
    logSecurityEvent,
    logLoginAttempt,
    logSessionActivity,
    logSecurityAction,
    clearSecurityEvents,

    // Clipboard Security
    secureClipboardCopy,

    // Cleanup
    cleanup,
  };
};
