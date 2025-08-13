import { useState, memo, useCallback } from "react";
import { Settings, Monitor } from "lucide-react";
import UserIndicator from "../auth/UserIndicator";
import logoWithText from "../../assets/Shield Text Logo.webp";
import LocalOnlyModeSettings from "../auth/LocalOnlyModeSettings";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

const Header = memo(
  ({
    currentUser,
    onUserChange,
    onUpdateProfile,
    isLocalOnlyMode = false,
    onShowSettings,
  }) => {
    const [showLocalOnlySettings, setShowLocalOnlySettings] = useState(false);

    const handleToggleLocalOnlySettings = useCallback(() => {
      setShowLocalOnlySettings((prev) => !prev);
    }, []);
    return (
      <div
        className="rounded-3xl mb-6 py-2 backdrop-blur-md border border-white/20 shadow-2xl"
        style={{
          background: "rgba(255, 254, 255, 0.95)", // Using your logo's white #fffeff
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center w-full px-6 py-8">
            <div
              className={`rounded border-4 bg-white/95 mb-4 ${
                // Environment-specific border colors for better differentiation
                import.meta.env.MODE === "development"
                  ? "border-orange-500" // Local development
                  : window.location.hostname.includes("dev.f4tdaddy.com") ||
                      (window.location.hostname.includes("vercel.app") &&
                        !window.location.hostname.includes("violet-vault-production"))
                    ? "border-red-500" // Preview/staging environments
                    : "border-purple-600" // Production
              }`}
            >
              <img
                src={logoWithText}
                alt="VioletVault Logo"
                loading="lazy"
                className="h-40 sm:h-52 md:h-64 lg:h-72 xl:h-80 2xl:h-96 w-auto max-w-full object-contain"
                style={{
                  imageRendering: "high-quality",
                }}
              />
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">
                Encryption First, Family Budgeting Management
              </p>
              {isLocalOnlyMode && (
                <button
                  onClick={handleToggleLocalOnlySettings}
                  className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 border border-blue-300 hover:bg-blue-200 hover:border-blue-400 transition-colors"
                  title="Click to manage Local-Only Mode settings"
                >
                  <Monitor className="h-3 w-3 text-blue-600 mr-1" />
                  <span className="text-xs font-medium text-blue-800">Local-Only Mode</span>
                </button>
              )}
            </div>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 pt-2 pb-4 px-2 sm:px-4">
            <UserIndicator
              currentUser={currentUser}
              onUserChange={onUserChange}
              onUpdateProfile={onUpdateProfile}
            />

            <div className="flex gap-2 sm:gap-3 items-center justify-center flex-wrap">
              <button
                onClick={onShowSettings}
                className="btn btn-primary flex items-center rounded-2xl px-3 sm:px-4 py-2 text-sm font-medium hover:shadow-lg transition-all"
                title="Open Settings Dashboard"
              >
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>


        {showLocalOnlySettings && (
          <LocalOnlyModeSettings
            isOpen={showLocalOnlySettings}
            onClose={handleToggleLocalOnlySettings}
            onModeSwitch={(mode) => {
              if (mode === "standard") {
                // Redirect to standard authentication
                window.location.reload();
              }
            }}
          />
        )}
      </div>
    );
  }
);

export default Header;
