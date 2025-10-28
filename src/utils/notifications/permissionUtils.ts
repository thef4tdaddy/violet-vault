import logger from "../common/logger";

// Type declarations for browser APIs
type NotificationPermission = "default" | "denied" | "granted";
/// <reference types="../../vite-env.d.ts" />

/**
 * Notification Permission Utilities
 * Handles browser compatibility and permission management for push notifications
 */

export interface BrowserSupport {
  serviceWorker: boolean;
  pushManager: boolean;
  notifications: boolean;
  showNotification: boolean;
  firebase: boolean;
}

export interface BrowserInfo {
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
}

export interface BrowserSupportResult {
  isSupported: boolean;
  support: BrowserSupport;
  browserInfo: BrowserInfo;
  details: {
    userAgent: string;
    platform: string;
  };
}

export interface NotificationPermissionStatus {
  status: NotificationPermission | "unsupported";
  granted: boolean;
  denied: boolean;
  default: boolean;
  canRequest: boolean;
}

export interface PermissionRequestResult {
  success: boolean;
  permission: NotificationPermission | "unsupported" | "error";
  reason: string;
  timestamp?: number;
  error?: string;
  browserSupport?: BrowserSupportResult;
  instructions?: PermissionInstructions;
}

export interface PermissionInstructions {
  browser: string;
  steps: string[];
  alternative?: string;
  note?: string;
}

export interface NotificationHistory {
  hasGranted: boolean;
  hasDenied: boolean;
  hasDismissed: boolean;
  grantedAt: Date | null;
  deniedAt: Date | null;
  dismissedAt: Date | null;
}

export interface PromptAvailability {
  canShow: boolean;
  reason: string;
  nextAvailable: Date | null;
}

export interface PermissionStatusForUI extends NotificationPermissionStatus, BrowserSupportResult {
  canShowPrompt: boolean;
  promptCooldownReason: string;
  nextPromptAvailable: Date | null;
  hasHistory: boolean;
  instructions: PermissionInstructions | null;
}

/**
 * Check if push notifications are supported in the current browser
 */
export const isPushNotificationSupported = (): boolean => {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    "showNotification" in ServiceWorkerRegistration.prototype
  );
};

/**
 * Get detailed browser support information
 */
export const getBrowserSupport = (): BrowserSupportResult => {
  const support: BrowserSupport = {
    serviceWorker: "serviceWorker" in navigator,
    pushManager: "PushManager" in window,
    notifications: "Notification" in window,
    showNotification: "showNotification" in ServiceWorkerRegistration.prototype,
    firebase: true, // Assume Firebase is supported if others are
  };

  const isFullySupported = Object.values(support).every(Boolean);

  // Detect browser and platform
  const userAgent = navigator.userAgent;
  const browserInfo: BrowserInfo = {
    isChrome: /Chrome/.test(userAgent),
    isFirefox: /Firefox/.test(userAgent),
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    isEdge: /Edg/.test(userAgent),
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent),
    isMobile: /Mobi|Android/i.test(userAgent),
  };

  return {
    isSupported: isFullySupported,
    support,
    browserInfo,
    details: {
      userAgent: userAgent,
      platform: navigator.platform,
    },
  };
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermissionStatus => {
  if (!isPushNotificationSupported()) {
    return {
      status: "unsupported",
      granted: false,
      denied: false,
      default: false,
      canRequest: false,
    };
  }

  const permission = Notification.permission;

  return {
    status: permission,
    granted: permission === "granted",
    denied: permission === "denied",
    default: permission === "default",
    canRequest: permission !== "denied",
  };
};

/**
 * Request notification permission with user-friendly messaging
 */
export const requestNotificationPermission = async (): Promise<PermissionRequestResult> => {
  const browserSupport = getBrowserSupport();

  if (!browserSupport.isSupported) {
    logger.warn("Push notifications not supported in this browser", browserSupport as unknown as Record<string, unknown>);
    return {
      success: false,
      permission: "unsupported",
      reason: "browser_not_supported",
      browserSupport,
    };
  }

  const currentPermission = getNotificationPermission();

  if (currentPermission.denied) {
    logger.warn("Notification permission previously denied");
    return {
      success: false,
      permission: "denied",
      reason: "permission_previously_denied",
      instructions: getPermissionInstructions(browserSupport.browserInfo),
    };
  }

  if (currentPermission.granted) {
    logger.info("Notification permission already granted");
    return {
      success: true,
      permission: "granted",
      reason: "already_granted",
    };
  }

  try {
    logger.info("Requesting notification permission...");
    const permission = await Notification.requestPermission();

    const success = permission === "granted";
    const reason = success ? "granted" : "denied";

    logger.info(`Notification permission ${reason}`, { permission });

    if (success) {
      // Store permission grant timestamp
      localStorage.setItem("notification_permission_granted", Date.now().toString());
    }

    return {
      success,
      permission,
      reason,
      timestamp: Date.now(),
    };
  } catch (error) {
    logger.error("Failed to request notification permission", error);
    return {
      success: false,
      permission: "error",
      reason: "request_failed",
      error: (error as Error).message,
    };
  }
};

/**
 * Get browser-specific instructions for enabling notifications
 */
export const getPermissionInstructions = (browserInfo: BrowserInfo): PermissionInstructions => {
  if (browserInfo.isChrome) {
    return {
      browser: "Chrome",
      steps: [
        "Click the lock icon in the address bar",
        'Set Notifications to "Allow"',
        "Refresh the page",
      ],
      alternative: "Go to Chrome Settings > Privacy and Security > Site Settings > Notifications",
    };
  }

  if (browserInfo.isFirefox) {
    return {
      browser: "Firefox",
      steps: [
        "Click the shield icon in the address bar",
        'Click "Turn off Blocking" for notifications',
        "Refresh the page",
      ],
      alternative: "Go to Firefox Preferences > Privacy & Security > Permissions > Notifications",
    };
  }

  if (browserInfo.isSafari) {
    return {
      browser: "Safari",
      steps: [
        "Go to Safari > Preferences > Websites",
        'Click "Notifications" in the left sidebar',
        'Set this website to "Allow"',
      ],
      note: "Safari requires macOS 10.14+ for web push notifications",
    };
  }

  if (browserInfo.isEdge) {
    return {
      browser: "Edge",
      steps: [
        "Click the lock icon in the address bar",
        'Set Notifications to "Allow"',
        "Refresh the page",
      ],
      alternative: "Go to Edge Settings > Site Permissions > Notifications",
    };
  }

  if (browserInfo.isIOS) {
    return {
      browser: "iOS Safari",
      steps: [
        "Notifications are not supported in iOS Safari",
        'Install the app using "Add to Home Screen"',
        "Open the installed app to enable notifications",
      ],
      note: "iOS 16.4+ supports web push in installed PWAs only",
    };
  }

  // Generic instructions
  return {
    browser: "Your browser",
    steps: [
      "Look for a notification icon in the address bar",
      'Click it and select "Allow"',
      "Refresh the page if needed",
    ],
    alternative: "Check your browser settings for notification permissions",
  };
};

/**
 * Check if user has interacted with notifications before
 */
export const hasNotificationHistory = (): NotificationHistory => {
  const grantedTime = localStorage.getItem("notification_permission_granted");
  const deniedTime = localStorage.getItem("notification_permission_denied");
  const dismissedTime = localStorage.getItem("notification_prompt_dismissed");

  return {
    hasGranted: !!grantedTime,
    hasDenied: !!deniedTime,
    hasDismissed: !!dismissedTime,
    grantedAt: grantedTime ? new Date(parseInt(grantedTime)) : null,
    deniedAt: deniedTime ? new Date(parseInt(deniedTime)) : null,
    dismissedAt: dismissedTime ? new Date(parseInt(dismissedTime)) : null,
  };
};

/**
 * Track notification permission denial
 */
export const trackPermissionDenial = (): void => {
  localStorage.setItem("notification_permission_denied", Date.now().toString());
  logger.info("Notification permission denial tracked");
};

/**
 * Track notification prompt dismissal
 */
export const trackPromptDismissal = (): void => {
  localStorage.setItem("notification_prompt_dismissed", Date.now().toString());
  logger.info("Notification prompt dismissal tracked");
};

/**
 * Check if enough time has passed to show permission prompt again
 */
export const canShowPermissionPrompt = (): PromptAvailability => {
  const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours
  const history = hasNotificationHistory();

  // Never show if permission was denied
  if (history.hasDenied) {
    return {
      canShow: false,
      reason: "permission_denied",
      nextAvailable: null,
    };
  }

  // Check if recently dismissed
  if (history.hasDismissed && history.dismissedAt) {
    const timeSinceDismissed = Date.now() - history.dismissedAt.getTime();
    if (timeSinceDismissed < cooldownPeriod) {
      return {
        canShow: false,
        reason: "recently_dismissed",
        nextAvailable: new Date(history.dismissedAt.getTime() + cooldownPeriod),
      };
    }
  }

  return {
    canShow: true,
    reason: "allowed",
    nextAvailable: null,
  };
};

/**
 * Get notification permission status for UI display
 */
export const getPermissionStatusForUI = (): PermissionStatusForUI => {
  const permission = getNotificationPermission();
  const browserSupport = getBrowserSupport();
  const canShow = canShowPermissionPrompt();
  const history = hasNotificationHistory();

  return {
    ...permission,
    ...browserSupport,
    canShowPrompt: canShow.canShow,
    promptCooldownReason: canShow.reason,
    nextPromptAvailable: canShow.nextAvailable,
    hasHistory: history.hasGranted || history.hasDenied || history.hasDismissed,
    instructions: permission.denied ? getPermissionInstructions(browserSupport.browserInfo) : null,
  };
};

/**
 * Clear all notification permission tracking data
 */
export const clearPermissionHistory = (): void => {
  localStorage.removeItem("notification_permission_granted");
  localStorage.removeItem("notification_permission_denied");
  localStorage.removeItem("notification_prompt_dismissed");
  logger.info("Notification permission history cleared");
};
