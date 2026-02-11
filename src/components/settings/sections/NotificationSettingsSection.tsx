import React, { useState } from "react";
import { Button, Checkbox } from "@/components/ui";
import { getIcon } from "../../../utils";
import { useFirebaseMessaging } from "@/hooks/platform/notifications/useFirebaseMessaging";
import logger from "@/utils/core/common/logger";

interface PermissionStatus {
  granted: boolean;
  denied: boolean;
  isSupported: boolean;
}

interface PermissionStatusUIProps {
  permissionStatus: PermissionStatus | null;
}

// Permission status UI component
const PermissionStatusUI: React.FC<PermissionStatusUIProps> = ({ permissionStatus }) => {
  if (!permissionStatus) return null;
  const { granted, denied, isSupported: supported } = permissionStatus;

  if (!supported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          {React.createElement(getIcon("AlertTriangle"), {
            className: "w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5",
          })}
          <div>
            <p className="font-medium text-yellow-800">Not Supported</p>
            <p className="text-sm text-yellow-700 mt-1">
              Push notifications are not supported in your current browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (granted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          {React.createElement(getIcon("CheckCircle"), {
            className: "w-5 h-5 text-green-600 flex-shrink-0 mt-0.5",
          })}
          <div className="flex-1">
            <p className="font-medium text-green-800">Notifications Enabled</p>
            <p className="text-sm text-green-700 mt-1">
              You'll receive push notifications for important updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (denied) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          {React.createElement(getIcon("XCircle"), {
            className: "w-5 h-5 text-red-600 flex-shrink-0 mt-0.5",
          })}
          <div>
            <p className="font-medium text-red-800">Notifications Blocked</p>
            <p className="text-sm text-red-700 mt-1">
              Update your browser settings to enable notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        {React.createElement(getIcon("Bell"), {
          className: "w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5",
        })}
        <div>
          <p className="font-medium text-blue-800">Enable Notifications</p>
          <p className="text-sm text-blue-700 mt-1">
            Get notified about budget updates and bill reminders.
          </p>
        </div>
      </div>
    </div>
  );
};

interface NotificationActionsProps {
  isSupported: boolean;
  hasToken: boolean;
  canRequestPermission: boolean;
  isLoading: boolean;
  isTestingMessage: boolean;
  onEnable: () => void;
  onDisable: () => void;
  onTest: () => void;
}

// Notification action buttons component
const NotificationActions: React.FC<NotificationActionsProps> = ({
  isSupported,
  hasToken,
  canRequestPermission,
  isLoading,
  isTestingMessage,
  onEnable,
  onDisable,
  onTest,
}) => {
  if (!isSupported) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {!hasToken && canRequestPermission && (
        <Button
          onClick={onEnable}
          disabled={isLoading}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg border-2 border-black shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading
            ? React.createElement(getIcon("Loader"), {
                className: "w-4 h-4 animate-spin",
              })
            : React.createElement(getIcon("Bell"), {
                className: "w-4 h-4",
              })}
          <span>Enable Notifications</span>
        </Button>
      )}

      {hasToken && (
        <>
          <Button
            onClick={onDisable}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg border-2 border-black shadow-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            {React.createElement(getIcon("BellOff"), {
              className: "w-4 h-4",
            })}
            <span>Disable Notifications</span>
          </Button>

          <Button
            onClick={onTest}
            disabled={isTestingMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg border-2 border-black shadow-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isTestingMessage
              ? React.createElement(getIcon("Loader"), {
                  className: "w-4 h-4 animate-spin",
                })
              : React.createElement(getIcon("Send"), {
                  className: "w-4 h-4",
                })}
            <span>Test Message</span>
          </Button>
        </>
      )}
    </div>
  );
};

/**
 * Notification Settings Section
 * Manages push notification preferences and FCM token
 */
const NotificationSettingsSection = () => {
  const {
    isInitialized,
    isLoading,
    permissionStatus,
    error,
    requestPermissionAndGetToken,
    clearToken,
    handlePermissionDenied,
    sendTestMessage,
    hasToken,
    canRequestPermission,
    isSupported,
    getServiceStatus,
  } = useFirebaseMessaging();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isTestingMessage, setIsTestingMessage] = useState(false);

  const handleEnableNotifications = async () => {
    try {
      const result = await requestPermissionAndGetToken();
      if (result.success) {
        logger.info("✅ Notifications enabled successfully");
      } else {
        logger.warn("❌ Failed to enable notifications:", { reason: result.reason });
        if (result.reason === "permission_denied") {
          handlePermissionDenied();
        }
      }
    } catch (err) {
      logger.error("Error enabling notifications:", err);
    }
  };

  const handleDisableNotifications = () => {
    clearToken();
    logger.info("🔕 Notifications disabled");
  };

  const handleTestMessage = async () => {
    setIsTestingMessage(true);
    try {
      const success = await sendTestMessage();
      if (success) {
        logger.info("🧪 Test message token logged - check console");
      }
    } catch (err) {
      logger.error("Failed to send test message:", err);
    } finally {
      setIsTestingMessage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-black text-base">
          🔔 <span className="text-lg">N</span>OTIFICATION <span className="text-lg">S</span>ETTINGS
        </h3>
        <p className="text-purple-900 text-sm mt-1">
          Manage push notifications and alerts for your budget management.
        </p>
      </div>

      {/* Not Yet Implemented Notice */}
      <div className="bg-blue-50 border-2 border-black rounded-lg p-4">
        <div className="flex items-start space-x-3">
          {React.createElement(getIcon("Info"), {
            className: "w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5",
          })}
          <div>
            <p className="font-bold text-blue-900">Feature Under Development</p>
            <p className="text-sm text-blue-800 mt-1">
              Push notifications are currently being developed and will be available in a future
              release. The settings below are for development and testing purposes only.
            </p>
          </div>
        </div>
      </div>

      {!isInitialized && !isLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            {React.createElement(getIcon("Loader"), {
              className: "w-4 h-4 text-yellow-600 animate-spin",
            })}
            <span className="text-yellow-800 text-sm">Initializing notification service...</span>
          </div>
        </div>
      )}

      <PermissionStatusUI permissionStatus={permissionStatus} />

      <NotificationActions
        isSupported={isSupported}
        hasToken={hasToken}
        canRequestPermission={canRequestPermission}
        isLoading={isLoading}
        isTestingMessage={isTestingMessage}
        onEnable={handleEnableNotifications}
        onDisable={handleDisableNotifications}
        onTest={handleTestMessage}
      />

      {hasToken && (
        <div className="bg-white rounded-lg border-2 border-black p-4">
          <h4 className="font-bold text-gray-900 mb-3">Notification Preferences</h4>
          <div className="space-y-3">
            <Checkbox label="Bill payment reminders" defaultChecked />
            <Checkbox label="Budget alerts and warnings" defaultChecked />
            <Checkbox label="Account activity notifications" defaultChecked />
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-900 hover:text-purple-700 flex items-center space-x-1 font-medium"
        >
          {React.createElement(getIcon("ChevronRight"), {
            className: `w-4 h-4 transition-transform ${showAdvanced ? "rotate-90" : ""}`,
          })}
          <span>Advanced Debug Info</span>
        </Button>
        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-black shadow-sm">
            <h4 className="font-medium text-gray-900 mb-3">Debug Information</h4>
            <div className="space-y-2 text-xs font-mono overflow-x-auto">
              <div className="whitespace-pre-wrap break-all">
                Service Status: {JSON.stringify(getServiceStatus(), null, 2)}
              </div>
              <div className="whitespace-pre-wrap break-all">
                Permission Status: {JSON.stringify(permissionStatus, null, 2)}
              </div>
              {error && (
                <div className="text-red-600 whitespace-pre-wrap break-all">Error: {error}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettingsSection;
