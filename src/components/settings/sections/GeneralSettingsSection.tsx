import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import useUiStore from "../../../stores/ui/uiStore";
import pwaManager from "../../../utils/pwa/pwaManager";
import logger from "../../../utils/common/logger";

interface PwaStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  canPromptInstall: boolean;
}

// Custom hook for PWA status management
const usePwaStatus = (): PwaStatus => {
  const [pwaStatus, setPwaStatus] = useState({
    isInstalled: false,
    isInstallable: false,
    isIOS: false,
    canPromptInstall: false,
  });

  useEffect(() => {
    const updatePwaStatus = () => {
      const status = pwaManager.getInstallationStatus();
      setPwaStatus(status);
    };

    updatePwaStatus();

    const handleAppInstalled = () => {
      updatePwaStatus();
      logger.info("PWA installation detected in settings");
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    const interval = setInterval(updatePwaStatus, 5000);

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearInterval(interval);
    };
  }, []);

  return pwaStatus;
};

interface LocalOnlyModeSectionProps {
  onOpenLocalOnlySettings: () => void;
}

// Local-only mode section component
const LocalOnlyModeSection: React.FC<LocalOnlyModeSectionProps> = ({ onOpenLocalOnlySettings }) => (
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
);

interface CloudSyncSectionProps {
  cloudSyncEnabled: boolean;
  isSyncing: boolean;
  onToggleCloudSync: () => void;
  onManualSync: () => void;
}

// Cloud sync section component
const CloudSyncSection: React.FC<CloudSyncSectionProps> = ({
  cloudSyncEnabled,
  isSyncing,
  onToggleCloudSync,
  onManualSync,
}) => (
  <div className="glassmorphism rounded-lg p-4 border-2 border-black ring-1 ring-gray-800/10 space-y-4">
    <h4 className="font-semibold text-gray-900">Cloud Sync</h4>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-900">Sync your data across devices</p>
        <p className="text-xs text-gray-700 mt-1">
          Status: {cloudSyncEnabled ? "Enabled" : "Disabled"}
        </p>
      </div>
      <Button
        onClick={onToggleCloudSync}
        className={`relative inline-flex h-6 w-14 items-center rounded-full transition-colors border-2 border-black ${
          cloudSyncEnabled ? "bg-green-600" : "bg-gray-200"
        }`}
      >
        {/* Toggle text */}
        <span
          className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${
            cloudSyncEnabled ? "text-white" : "text-gray-600"
          }`}
        >
          {cloudSyncEnabled ? "ON" : "OFF"}
        </span>
        {/* Toggle circle */}
        <span
          className={`relative inline-block h-4 w-4 transform rounded-full bg-white transition-transform border border-black z-10 ${
            cloudSyncEnabled ? "translate-x-7" : "translate-x-1"
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
);

interface PwaInstallSectionProps {
  pwaStatus: PwaStatus;
  isInstalling: boolean;
  onInstall: () => Promise<void>;
}

// PWA install section component
const PwaInstallSection: React.FC<PwaInstallSectionProps> = ({
  pwaStatus,
  isInstalling,
  onInstall,
}) => (
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
      <PwaInstallPrompt pwaStatus={pwaStatus} isInstalling={isInstalling} onInstall={onInstall} />
    )}
  </div>
);

interface PwaInstallPromptProps {
  pwaStatus: PwaStatus;
  isInstalling: boolean;
  onInstall: () => Promise<void>;
}

// PWA installation prompt component
const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  pwaStatus,
  isInstalling,
  onInstall,
}) => (
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
        onClick={onInstall}
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

    <div className="grid grid-cols-2 gap-2 mt-3">
      {[
        { icon: "WifiOff", label: "Offline access" },
        { icon: "Zap", label: "Faster loading" },
        { icon: "Home", label: "Home screen icon" },
        { icon: "Bell", label: "Native experience" },
      ].map(({ icon, label }) => (
        <div key={label} className="flex items-center space-x-2 text-xs text-gray-600">
          {React.createElement(getIcon(icon), {
            className: "w-3 h-3 text-green-600",
          })}
          <span>{label}</span>
        </div>
      ))}
    </div>
  </div>
);

interface GeneralSettingsSectionProps {
  isLocalOnlyMode: boolean;
  cloudSyncEnabled: boolean;
  isSyncing: boolean;
  onOpenLocalOnlySettings: () => void;
  onToggleCloudSync: () => void;
  onManualSync: () => void;
}

const GeneralSettingsSection: React.FC<GeneralSettingsSectionProps> = ({
  isLocalOnlyMode,
  cloudSyncEnabled,
  isSyncing,
  onOpenLocalOnlySettings,
  onToggleCloudSync,
  onManualSync,
}) => {
  const manualInstall = useUiStore((state) => state.manualInstall);
  const pwaStatus = usePwaStatus();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleManualInstall = async () => {
    setIsInstalling(true);
    try {
      const result = await manualInstall();

      if (result.success) {
        logger.info("Manual PWA install successful");
      } else {
        const messages: Record<string, string> = {
          already_installed: "App is already installed",
          not_available: "Installation not available on this browser",
          declined: "Installation cancelled",
        };
        logger.info("Manual PWA install:", {
          message: messages[result.reason] || "Installation failed",
        });
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
        <LocalOnlyModeSection onOpenLocalOnlySettings={onOpenLocalOnlySettings} />
      )}

      {!isLocalOnlyMode && (
        <CloudSyncSection
          cloudSyncEnabled={cloudSyncEnabled}
          isSyncing={isSyncing}
          onToggleCloudSync={onToggleCloudSync}
          onManualSync={onManualSync}
        />
      )}

      <PwaInstallSection
        pwaStatus={pwaStatus}
        isInstalling={isInstalling}
        onInstall={handleManualInstall}
      />
    </div>
  );
};

export default GeneralSettingsSection;
