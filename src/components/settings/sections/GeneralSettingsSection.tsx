import React, { useState, useEffect } from "react";
import { Select } from "@/components/ui";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import useUiStore from "../../../stores/ui/uiStore";
import pwaManager from "../../../utils/pwa/pwaManager";
import logger from "../../../utils/common/logger";

const GeneralSettingsSection = ({
  isLocalOnlyMode,
  cloudSyncEnabled,
  isSyncing,
  onOpenLocalOnlySettings,
  onToggleCloudSync,
  onManualSync,
}) => {
  const { manualInstall } = useUiStore();
  const [pwaStatus, setPwaStatus] = useState({
    isInstalled: false,
    isInstallable: false,
    isIOS: false,
    canPromptInstall: false,
  });
  const [isInstalling, setIsInstalling] = useState(false);

  // Update PWA status
  useEffect(() => {
    const updatePwaStatus = () => {
      const status = pwaManager.getInstallationStatus();
      setPwaStatus(status);
    };

    updatePwaStatus();

    // Listen for installation events
    const handleAppInstalled = () => {
      updatePwaStatus();
      logger.info("PWA installation detected in settings");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Update status periodically
    const interval = setInterval(updatePwaStatus, 5000);

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearInterval(interval);
    };
  }, []);

  const handleManualInstall = async () => {
    setIsInstalling(true);
    try {
      const result = await manualInstall();

      if (result.success) {
        logger.info("Manual PWA install successful");
      } else {
        let message = "Installation failed";
        if (result.reason === "already_installed") {
          message = "App is already installed";
        } else if (result.reason === "not_available") {
          message = "Installation not available on this browser";
        } else if (result.reason === "declined") {
          message = "Installation cancelled";
        }
        logger.info("Manual PWA install:", message);
      }
    } catch (error) {
      logger.error("Manual PWA install failed:", error);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-black text-black text-base">
        <span className="text-lg">G</span>ENERAL <span className="text-lg">S</span>ETTINGS
      </h3>

      {isLocalOnlyMode && (
        <div className="glassmorphism rounded-lg p-4 border-2 border-black ring-1 ring-gray-800/10 bg-blue-100/60">
          <div className="flex items-start">
            {React.createElement(getIcon("Monitor"), {
              className: "h-5 w-5 text-blue-600 mt-0.5 mr-3",
            })}
            <div>
              <h4 className="font-medium text-purple-900">Local-Only Mode</h4>
              <p className="text-sm text-purple-700 mt-1">
                You're running in local-only mode. Data is stored locally only.
              </p>
              <Button
                onClick={onOpenLocalOnlySettings}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline border-2 border-black px-2 py-1 rounded bg-white/60"
              >
                Manage Local-Only Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isLocalOnlyMode && (
        <div className="glassmorphism rounded-lg p-4 border-2 border-black ring-1 ring-gray-800/10 space-y-4">
          <h4 className="font-medium text-purple-900">Cloud Sync</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-900">Sync your data across devices</p>
              <p className="text-xs text-purple-700 mt-1">
                Status: {cloudSyncEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
            <Button
              onClick={onToggleCloudSync}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors border-2 border-black ${
                cloudSyncEnabled ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform border border-black ${
                  cloudSyncEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </Button>
          </div>

          {cloudSyncEnabled && (
            <div className="pt-2">
              <Button
                onClick={onManualSync}
                disabled={isSyncing}
                className="flex items-center px-3 py-2 text-sm border-2 border-black bg-purple-200/60 rounded-lg hover:bg-purple-300/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {React.createElement(getIcon("RefreshCw"), {
                  className: `h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`,
                })}
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* PWA Install Section */}
      <div className="glassmorphism rounded-lg p-4 border-2 border-black ring-1 ring-gray-800/10 space-y-4">
        <h4 className="font-medium text-purple-900 flex items-center space-x-2">
          {React.createElement(getIcon("Smartphone"), {
            className: "w-5 h-5 text-purple-600",
          })}
          <span>Progressive Web App</span>
        </h4>

        {pwaStatus.isInstalled ? (
          <div className="flex items-start space-x-3">
            {React.createElement(getIcon("CheckCircle"), {
              className: "w-5 h-5 text-green-600 mt-0.5 flex-shrink-0",
            })}
            <div>
              <p className="text-sm text-purple-900 font-medium">App is installed</p>
              <p className="text-xs text-purple-700 mt-1">
                VioletVault is installed and running as a native app with offline support.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              {React.createElement(getIcon("Download"), {
                className: "w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0",
              })}
              <div className="flex-1">
                <p className="text-sm text-purple-900 font-medium">Install VioletVault as an app</p>
                <p className="text-xs text-purple-700 mt-1">
                  Get faster loading, offline access, and a native app experience.
                </p>
              </div>
            </div>

            {pwaStatus.isIOS ? (
              <div className="bg-blue-50/60 rounded-lg p-3 border border-blue-200">
                <div className="flex items-start space-x-2 text-sm">
                  {React.createElement(getIcon("Info"), {
                    className: "w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5",
                  })}
                  <div className="text-gray-700">
                    <p className="font-medium mb-1">To install on iOS Safari:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>
                        Tap the Share button{" "}
                        {React.createElement(getIcon("Share"), {
                          className: "w-3 h-3 inline",
                        })}
                      </li>
                      <li>Select "Add to Home Screen"</li>
                      <li>Tap "Add" to confirm</li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : pwaStatus.canPromptInstall ? (
              <Button
                onClick={handleManualInstall}
                disabled={isInstalling}
                className="flex items-center px-3 py-2 text-sm border-2 border-black bg-blue-200/60 rounded-lg hover:bg-blue-300/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInstalling ? (
                  <>
                    {React.createElement(getIcon("Loader"), {
                      className: "w-4 h-4 mr-2 animate-spin",
                    })}
                    Installing...
                  </>
                ) : (
                  <>
                    {React.createElement(getIcon("Download"), {
                      className: "w-4 h-4 mr-2",
                    })}
                    Install App
                  </>
                )}
              </Button>
            ) : (
              <p className="text-xs text-gray-500 italic">
                Installation not available in this browser or app is already installed.
              </p>
            )}

            {/* Installation benefits */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                {React.createElement(getIcon("WifiOff"), {
                  className: "w-3 h-3 text-green-600",
                })}
                <span>Offline access</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                {React.createElement(getIcon("Zap"), {
                  className: "w-3 h-3 text-green-600",
                })}
                <span>Faster loading</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                {React.createElement(getIcon("Home"), {
                  className: "w-3 h-3 text-green-600",
                })}
                <span>Home screen icon</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                {React.createElement(getIcon("Bell"), {
                  className: "w-3 h-3 text-green-600",
                })}
                <span>Native experience</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralSettingsSection;
