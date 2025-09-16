import React from "react";
import { getIcon } from "../../utils";
import useUiStore from "../../stores/ui/uiStore";

/**
 * Install PWA Prompt Modal
 * Shows when the app can be installed as a PWA
 */
const InstallPromptModal = () => {
  const { showInstallPrompt, hideInstallModal, installApp } = useUiStore();

  if (!showInstallPrompt) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (!success) {
      // If install failed, just hide the modal
      hideInstallModal();
    }
  };

  const handleDismiss = () => {
    hideInstallModal();
  };

  // Check if this is iOS (different install process)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glassmorphism rounded-lg max-w-md w-full p-6 border-2 border-black bg-white/90 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-black shadow-xl">
            <span className="text-white font-black text-2xl">V</span>
          </div>

          <h2 className="font-black text-black text-xl mb-2">
            📱 <span className="text-2xl">I</span>NSTALL{" "}
            <span className="text-2xl">V</span>IOLET
            <span className="text-2xl">V</span>AULT
          </h2>

          <p className="text-purple-900 text-sm leading-relaxed">
            Install VioletVault on your device for a better experience with
            offline access and quick launch.
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-purple-50/60 rounded-lg p-4 mb-6 border border-purple-200">
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              {getIcon("smartphone", "w-4 h-4 text-purple-600 flex-shrink-0")}
              <span className="text-gray-700">Works like a native app</span>
            </div>
            <div className="flex items-center space-x-2">
              {getIcon("wifi-off", "w-4 h-4 text-purple-600 flex-shrink-0")}
              <span className="text-gray-700">Full offline functionality</span>
            </div>
            <div className="flex items-center space-x-2">
              {getIcon("zap", "w-4 h-4 text-purple-600 flex-shrink-0")}
              <span className="text-gray-700">
                Faster loading and performance
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {getIcon("home", "w-4 h-4 text-purple-600 flex-shrink-0")}
              <span className="text-gray-700">Add to home screen</span>
            </div>
          </div>
        </div>

        {/* iOS Instructions */}
        {isIOS && (
          <div className="bg-blue-50/60 rounded-lg p-4 mb-6 border border-blue-200">
            <div className="flex items-start space-x-2 text-sm">
              {getIcon("info", "w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5")}
              <div className="text-gray-700">
                <p className="font-medium mb-1">To install on iOS:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>
                    Tap the Share button {getIcon("share", "w-3 h-3 inline")}
                  </li>
                  <li>Select "Add to Home Screen"</li>
                  <li>Tap "Add" to confirm</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {getIcon("download", "w-4 h-4")}
              <span>Install App</span>
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-lg border-2 border-black shadow-lg hover:bg-gray-50 transition-colors"
          >
            {isIOS ? "Got It" : "Maybe Later"}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Installing VioletVault will not use additional storage space.
            <br />
            You can uninstall anytime from your device settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstallPromptModal;
