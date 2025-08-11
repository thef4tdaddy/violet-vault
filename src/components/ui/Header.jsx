import { useState, memo, useCallback } from "react";
import {
  Upload,
  Download,
  AlertTriangle,
  RefreshCw,
  Cloud,
  CloudOff,
  Key,
  History,
  ShieldOff,
  Monitor,
} from "lucide-react";
import UserIndicator from "../auth/UserIndicator";
import logoWithText from "../../assets/Shield Text Logo.webp";
import ChangePasswordModal from "../auth/ChangePasswordModal";
import BudgetHistoryViewer from "../history/BudgetHistoryViewer";
import LocalOnlyModeSettings from "../auth/LocalOnlyModeSettings";
import { useBudgetStore } from "../../stores/budgetStore";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

const Header = memo(
  ({
    onExport,
    onImport,
    onLogout,
    onResetEncryption,
    onSync,
    onChangePassword,
    currentUser,
    onUserChange,
    onUpdateProfile,
    isLocalOnlyMode = false,
  }) => {
    const [showResetModal, setShowResetModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showLocalOnlySettings, setShowLocalOnlySettings] = useState(false);

    // Cloud sync state
    const { cloudSyncEnabled, setCloudSyncEnabled } = useBudgetStore();

    const handleToggleResetModal = useCallback(() => {
      setShowResetModal((prev) => !prev);
    }, []);

    const handleTogglePasswordModal = useCallback(() => {
      setShowPasswordModal((prev) => !prev);
    }, []);

    const handleToggleHistoryModal = useCallback(() => {
      setShowHistoryModal((prev) => !prev);
    }, []);

    const handleToggleLocalOnlySettings = useCallback(() => {
      setShowLocalOnlySettings((prev) => !prev);
    }, []);

    const handleToggleCloudSync = useCallback(async () => {
      const newValue = !cloudSyncEnabled;
      setCloudSyncEnabled(newValue);

      if (newValue) {
        console.log("🌩️ Cloud sync enabled - starting background sync");

        // Start the background sync service
        try {
          const { default: CloudSyncService } = await import("../../services/cloudSyncService");
          const { useAuth } = await import("../../stores/authStore");
          const authState = useAuth.getState();

          if (authState.encryptionKey && authState.currentUser && authState.budgetId) {
            CloudSyncService.start({
              encryptionKey: authState.encryptionKey,
              currentUser: authState.currentUser,
              budgetId: authState.budgetId,
            });
          }
        } catch (error) {
          console.error("Failed to start cloud sync:", error);
        }
      } else {
        console.log("💾 Cloud sync disabled - stopping background sync");

        // Stop the background sync service
        try {
          const { default: CloudSyncService } = await import("../../services/cloudSyncService");
          CloudSyncService.stop();
        } catch (error) {
          console.error("Failed to stop cloud sync:", error);
        }
      }
    }, [cloudSyncEnabled, setCloudSyncEnabled]);
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
              <input
                type="file"
                accept=".json"
                onChange={onImport}
                className="hidden"
                id="import-data"
              />
              <label
                htmlFor="import-data"
                className="btn btn-secondary flex items-center cursor-pointer rounded-2xl px-3 sm:px-4 py-2 text-sm font-medium hover:shadow-lg transition-all"
              >
                <Upload className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Import</span>
              </label>

              <button
                onClick={onExport}
                className="btn btn-secondary flex items-center rounded-2xl px-3 sm:px-4 py-2 text-sm font-medium hover:shadow-lg transition-all"
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={handleTogglePasswordModal}
                className="btn btn-secondary flex items-center rounded-2xl px-3 sm:px-4 py-2 text-sm font-medium hover:shadow-lg transition-all"
              >
                <Key className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Change Password</span>
              </button>

              <button
                onClick={handleToggleHistoryModal}
                className="btn btn-secondary flex items-center rounded-2xl px-3 sm:px-4 py-2 text-sm font-medium hover:shadow-lg transition-all"
              >
                <History className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">History</span>
              </button>

              {!isLocalOnlyMode && (
                <button
                  onClick={handleToggleCloudSync}
                  className={`btn flex items-center rounded-2xl px-3 sm:px-4 py-2 text-sm font-medium hover:shadow-lg transition-all ${
                    cloudSyncEnabled
                      ? "btn-primary text-white bg-green-600 border-green-600 hover:bg-green-700"
                      : "btn-secondary text-gray-600 bg-gray-100 border-gray-300 hover:bg-gray-200"
                  }`}
                  title={cloudSyncEnabled ? "Turn off cloud sync" : "Turn on cloud sync"}
                >
                  {cloudSyncEnabled ? (
                    <Cloud className="h-4 w-4 sm:mr-2" />
                  ) : (
                    <CloudOff className="h-4 w-4 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {cloudSyncEnabled ? "Turn Off Sync" : "Turn On Sync"}
                  </span>
                </button>
              )}

              {LOCAL_ONLY_MODE && (
                <button
                  onClick={onSync}
                  className="btn btn-primary flex items-center rounded-2xl px-3 sm:px-4 py-2 text-sm font-medium hover:shadow-lg transition-all"
                >
                  <Cloud className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sync to Cloud</span>
                </button>
              )}

              <div className="relative" style={{ zIndex: 50 }}>
                <button
                  onClick={handleToggleResetModal}
                  className="btn text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:shadow-lg flex items-center rounded-2xl px-3 sm:px-4 py-2 text-sm font-medium transition-all"
                >
                  <RefreshCw className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {showResetModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowResetModal(false)}
          >
            <div
              className="glassmorphism rounded-3xl p-8 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start space-x-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-800">Reset Options</div>
                  <div className="text-sm text-amber-600 mt-1">Choose your reset option</div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 border border-gray-200"
                >
                  <div className="font-medium">Logout Only</div>
                  <div className="text-xs text-gray-500">Keep your data, just logout</div>
                </button>

                <button
                  onClick={() => {
                    setShowResetModal(false);
                    onResetEncryption();
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50 border border-red-200 text-red-600"
                >
                  <div className="font-medium">Clear All Data</div>
                  <div className="text-xs text-red-500">Delete everything and start fresh</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {showPasswordModal && (
          <ChangePasswordModal
            isOpen={showPasswordModal}
            onClose={handleTogglePasswordModal}
            onChangePassword={onChangePassword}
          />
        )}

        {showHistoryModal && <BudgetHistoryViewer onClose={handleToggleHistoryModal} />}

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
