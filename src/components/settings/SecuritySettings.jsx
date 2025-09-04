import React, { useState } from "react";
import {
  Shield,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  RotateCcw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from "lucide-react";
import { useSecurityManager } from "../../hooks/auth/useSecurityManager";

const SecuritySettings = ({ isOpen, onClose }) => {
  const {
    isLocked,
    securitySettings,
    securityEvents,
    updateSettings,
    clearSecurityEvents,
  } = useSecurityManager();

  const [showEvents, setShowEvents] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSettingChange = (setting, value) => {
    updateSettings({ [setting]: value });
  };

  const exportSecurityEvents = () => {
    const dataStr = JSON.stringify(securityEvents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `security-events-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const timeUntilAutoLock = () => {
    if (!securitySettings.autoLockEnabled || isLocked) return null;
    // For now, return a simple status since we don't have time remaining calculation
    return "Active";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-black bg-purple-100/40 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-black text-black">
                  <span className="text-xl">S</span>ECURITY <span className="text-xl">S</span>ETTINGS
                </h3>
                <p className="text-sm text-purple-900">Configure app security and privacy options</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 border-2 border-black rounded">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Security Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Current Security Status
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Session Status:</span>
                  <span
                    className={`font-medium ${isLocked ? "text-red-600" : "text-green-600"}`}
                  >
                    {isLocked ? "Locked" : "Active"}
                  </span>
                </div>
                {securitySettings.autoLockEnabled && !isLocked && (
                  <div className="flex justify-between">
                    <span>Auto-lock in:</span>
                    <span className="font-medium text-orange-600">
                      {timeUntilAutoLock() || "Calculating..."}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Security Events:</span>
                  <span className="font-medium text-gray-600">
                    {securityEvents.length} recorded
                  </span>
                </div>
              </div>
            </div>

            {/* Auto-Lock Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-orange-500" />
                Auto-Lock Settings
              </h4>

              <div className="space-y-4 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enable Auto-Lock</label>
                    <p className="text-xs text-gray-500">
                      Automatically lock the app after period of inactivity
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleSettingChange("autoLockEnabled", !securitySettings.autoLockEnabled)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      securitySettings.autoLockEnabled ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        securitySettings.autoLockEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {securitySettings.autoLockEnabled && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Auto-Lock Timeout: {securitySettings.autoLockTimeout} minutes
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="120"
                      value={securitySettings.autoLockTimeout}
                      onChange={(e) =>
                        handleSettingChange("autoLockTimeout", parseInt(e.target.value))
                      }
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 min</span>
                      <span>2 hours</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Lock on Page Hide</label>
                    <p className="text-xs text-gray-500">
                      Lock when switching tabs or minimizing window
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleSettingChange("lockOnPageHide", !securitySettings.lockOnPageHide)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      securitySettings.lockOnPageHide ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        securitySettings.lockOnPageHide ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Clipboard Security */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-purple-500" />
                Clipboard Security
              </h4>

              <div className="pl-6">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Auto-Clear Timeout: {securitySettings.clipboardClearTimeout} seconds
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Automatically clear clipboard after copying sensitive data
                </p>
                <input
                  type="range"
                  min="5"
                  max="300"
                  value={securitySettings.clipboardClearTimeout}
                  onChange={(e) =>
                    handleSettingChange("clipboardClearTimeout", parseInt(e.target.value))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 sec</span>
                  <span>5 min</span>
                </div>
              </div>
            </div>

            {/* Security Logging */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-500" />
                Security Logging
              </h4>

              <div className="space-y-4 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Enable Security Logging
                    </label>
                    <p className="text-xs text-gray-500">
                      Track security events and access attempts
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleSettingChange(
                        "securityLoggingEnabled",
                        !securitySettings.securityLoggingEnabled
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      securitySettings.securityLoggingEnabled ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        securitySettings.securityLoggingEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {securitySettings.securityLoggingEnabled && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowEvents(!showEvents)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        {showEvents ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showEvents ? "Hide" : "View"} Security Events ({securityEvents.length})
                      </button>
                      <button
                        onClick={exportSecurityEvents}
                        className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear
                      </button>
                    </div>

                    {showEvents && (
                      <div className="bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {securityEvents.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No security events recorded yet
                            </p>
                          ) : (
                            securityEvents.map((event) => (
                              <div key={event.id} className="bg-white p-2 rounded text-xs">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span
                                      className={`font-medium ${
                                        event.type.includes("FAILED") ||
                                        event.type.includes("ERROR")
                                          ? "text-red-600"
                                          : event.type.includes("LOCK")
                                            ? "text-orange-600"
                                            : "text-green-600"
                                      }`}
                                    >
                                      {event.type}
                                    </span>
                                    <p className="text-gray-600 mt-1">{event.description}</p>
                                  </div>
                                  <span className="text-gray-400">
                                    {new Date(event.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">Security settings are automatically saved</div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 border-2 border-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h4 className="font-semibold text-gray-900">Clear Security Events</h4>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to clear all security event logs? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearSecurityEvents();
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear Events
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
