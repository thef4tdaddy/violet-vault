import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import { useLocalOnlyMode } from "../../hooks/platform/data/useLocalOnlyMode";
import logger from "@/utils/core/common/logger";
import UserSetup from "./UserSetup";
import LocalOnlySetup from "./LocalOnlySetup";
import type { AuthGatewayProps } from "@/types/auth";

/**
 * AuthGateway - Decides between standard auth, local-only mode, or mode selection
 */
const AuthGateway: React.FC<AuthGatewayProps> = ({ onSetupComplete, onLocalOnlyReady }) => {
  const { isLocalOnlyMode, localOnlyUser, checkLocalOnlyMode } = useLocalOnlyMode();
  const [authMode, setAuthMode] = useState<"standard" | "local-only" | null>(null);
  const [isCheckingLocalMode, setIsCheckingLocalMode] = useState(true);

  // Check for existing local-only mode on startup
  useEffect(() => {
    const checkExistingMode = async () => {
      try {
        const result = await checkLocalOnlyMode();
        if (result.success && localOnlyUser) {
          // Already in local-only mode
          setAuthMode("local-only");
          onLocalOnlyReady(localOnlyUser);
        } else {
          // Check if there's saved encrypted data (standard mode)
          // eslint-disable-next-line no-restricted-syntax -- Auth layer checking for encrypted data before authentication
          const savedData = localStorage.getItem("envelopeBudgetData");
          if (savedData) {
            setAuthMode("standard");
          } else {
            // New user - default to standard mode instead of showing mode selection
            setAuthMode("standard");
          }
        }
      } catch (error) {
        logger.error("Failed to check existing mode:", error);
        // Default to standard mode on error instead of showing mode selection
        setAuthMode("standard");
      } finally {
        setIsCheckingLocalMode(false);
      }
    };

    checkExistingMode();
  }, [checkLocalOnlyMode, onLocalOnlyReady, localOnlyUser]);

  // Loading state while checking for existing modes
  if (isCheckingLocalMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600/20 border-t-purple-600 rounded-full mx-auto mb-3" />
          <div className="text-sm text-gray-600">Loading VioletVault...</div>
        </div>
      </div>
    );
  }

  // Local-only mode is active and user is ready
  if (isLocalOnlyMode && localOnlyUser) {
    return null; // Let MainLayout render the budget interface
  }

  // Standard authentication mode
  if (authMode === "standard") {
    return <UserSetup onSetupComplete={onSetupComplete} />;
  }

  // Local-only setup mode
  if (authMode === "local-only") {
    return (
      <LocalOnlySetup
        onModeSelected={(mode) => {
          if (mode === "local-only") {
            // Local-only setup complete, let MainLayout take over
            onLocalOnlyReady(localOnlyUser ?? null);
          }
        }}
        onSwitchToAuth={() => setAuthMode("standard")}
      />
    );
  }

  // Mode selection for new users
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glassmorphism rounded-2xl w-full max-w-2xl border-2 border-black shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-white/20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to VioletVault</h1>
          <p className="text-gray-600">Choose how you'd like to manage your budget</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Mode */}
            <Button
              onClick={() => setAuthMode("standard")}
              className="p-6 border border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
            >
              <div className="flex items-center mb-4">
                {React.createElement(getIcon("Shield"), {
                  className: "h-8 w-8 text-purple-600 mr-3",
                })}
                <h3 className="text-xl font-semibold text-gray-900">Standard Mode</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Password-protected encryption</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Optional cloud sync across devices</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Key export for backup</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Full feature set</span>
                </div>
              </div>
            </Button>

            {/* Local-Only Mode */}
            <Button
              onClick={() => setAuthMode("local-only")}
              className="p-6 border border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-center mb-4">
                {React.createElement(getIcon("ShieldOff"), {
                  className: "h-8 w-8 text-blue-600 mr-3",
                })}
                <h3 className="text-xl font-semibold text-gray-900">Local-Only Mode</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Complete privacy - no cloud sync</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>No password or account required</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Works completely offline</span>
                </div>
                <div className="flex items-start">
                  <span className="text-amber-600 mr-2">!</span>
                  <span>Data stored only on this device</span>
                </div>
              </div>
            </Button>
          </div>

          <div className="mt-8 text-center">
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium mb-1">Not sure which to choose?</p>
              <p>
                Standard Mode is recommended for most users. You can export your data and switch
                modes later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthGateway;
