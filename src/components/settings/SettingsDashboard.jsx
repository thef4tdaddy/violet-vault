import React, { useState, lazy, Suspense } from "react";
import {
  X,
  Settings,
  User,
  Key,
  Shield,
  Cloud,
  CloudOff,
  History,
  Upload,
  Download,
  RefreshCw,
  Lock,
  Monitor,
  AlertTriangle,
} from "lucide-react";
import { useBudgetStore } from "../../stores/budgetStore";
import LoadingSpinner from "../ui/LoadingSpinner";
import logger from "../../utils/logger";

// Lazy load heavy components
const ChangePasswordModal = lazy(() => import("../auth/ChangePasswordModal"));
const BudgetHistoryViewer = lazy(() => import("../history/BudgetHistoryViewer"));
const LocalOnlyModeSettings = lazy(() => import("../auth/LocalOnlyModeSettings"));
const SecuritySettings = lazy(() => import("./SecuritySettings"));

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

/**
 * Unified Settings Dashboard
 * Consolidates all app settings into organized categories
 */
const SettingsDashboard = ({
  isOpen,
  onClose,
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
  securityManager,
}) => {
  const [activeSection, setActiveSection] = useState("general");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLocalOnlySettings, setShowLocalOnlySettings] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Cloud sync state
  const { cloudSyncEnabled, setCloudSyncEnabled } = useBudgetStore();
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleToggleCloudSync = async () => {
    const newValue = !cloudSyncEnabled;
    setCloudSyncEnabled(newValue);

    if (newValue) {
      logger.debug("🌩️ Cloud sync enabled - starting background sync");
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
        logger.error("Failed to start cloud sync:", error);
      }
    } else {
      logger.debug("💾 Cloud sync disabled - stopping background sync");
      try {
        const { default: CloudSyncService } = await import("../../services/cloudSyncService");
        CloudSyncService.stop();
      } catch (error) {
        logger.error("Failed to stop cloud sync:", error);
      }
    }
  };

  const handleManualSync = async () => {
    if (!cloudSyncEnabled || isSyncing) return;

    setIsSyncing(true);
    try {
      logger.debug("🔄 Manual sync triggered from settings");
      const { default: CloudSyncService } = await import("../../services/cloudSyncService");

      if (!CloudSyncService.serviceIsRunning) {
        logger.warn("⚠️ Cloud sync service not running, starting temporarily...");
        const { useAuth } = await import("../../stores/authStore");
        const authState = useAuth.getState();

        if (authState.encryptionKey && authState.currentUser && authState.budgetId) {
          CloudSyncService.start({
            encryptionKey: authState.encryptionKey,
            currentUser: authState.currentUser,
            budgetId: authState.budgetId,
          });
        } else {
          throw new Error("Missing authentication context for sync");
        }
      }

      const result = await CloudSyncService.forceSync();

      if (result.success) {
        logger.info("✅ Manual sync completed", result);
        // TODO: Could add a success toast notification here
      } else {
        logger.error("❌ Manual sync failed", result.error);
        // TODO: Could add an error toast notification here
      }
    } catch (error) {
      logger.error("❌ Manual sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const sections = [
    { id: "general", label: "General", icon: Settings },
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "data", label: "Data", icon: Cloud },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>

            {isLocalOnlyMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Monitor className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-blue-900">Local-Only Mode</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      You're running in local-only mode. Data is stored locally only.
                    </p>
                    <button
                      onClick={() => setShowLocalOnlySettings(true)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Manage Local-Only Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isLocalOnlyMode && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Cloud Sync</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sync your data across devices</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Status: {cloudSyncEnabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleCloudSync}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      cloudSyncEnabled ? "bg-green-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        cloudSyncEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {cloudSyncEnabled && (
                  <div className="pt-2">
                    <button
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="flex items-center px-3 py-2 text-sm border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                      {isSyncing ? "Syncing..." : "Sync Now"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Current User</h4>
                <p className="text-sm text-gray-600">{currentUser?.name || "User"}</p>
              </div>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Key className="h-5 w-5 text-gray-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-500">Update your encryption password</p>
                </div>
              </button>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">Danger Zone</h4>
                    <p className="text-sm text-red-700 mt-1">These actions cannot be undone.</p>
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={onLogout}
                        className="block w-full text-left px-3 py-2 text-sm border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Logout Only (Keep Data)
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="block w-full text-left px-3 py-2 text-sm bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors text-red-800"
                      >
                        Clear All Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>

            <div className="space-y-4">
              {securityManager && (
                <>
                  <button
                    onClick={securityManager.lockApp}
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Lock className="h-5 w-5 text-gray-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Lock Application</p>
                      <p className="text-sm text-gray-500">Immediately lock the app</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowSecuritySettings(true)}
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Shield className="h-5 w-5 text-gray-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Advanced Security</p>
                      <p className="text-sm text-gray-500">Auto-lock, logging, and privacy</p>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>

            <div className="space-y-4">
              <button
                onClick={() => setShowHistoryModal(true)}
                className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <History className="h-5 w-5 text-gray-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">View History</p>
                  <p className="text-sm text-gray-500">Browse budget change history</p>
                </div>
              </button>

              <button
                onClick={async () => {
                  try {
                    const { createTestBudgetHistory } = await import(
                      "../../utils/testBudgetHistory"
                    );
                    await createTestBudgetHistory();
                    alert("✅ Test budget history created! Check console for details.");
                  } catch (error) {
                    alert("❌ Failed to create test history: " + error.message);
                  }
                }}
                className="w-full flex items-center p-3 border border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <History className="h-5 w-5 text-yellow-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-yellow-900">🧪 Test Budget History</p>
                  <p className="text-sm text-yellow-700">
                    Create test commits for family collaboration
                  </p>
                </div>
              </button>

              <button
                onClick={onExport}
                className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-5 w-5 text-gray-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Export Data</p>
                  <p className="text-sm text-gray-500">Download your budget data</p>
                </div>
              </button>

              <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  accept=".json"
                  onChange={onImport}
                  className="hidden"
                  id="settings-import-data"
                />
                <label
                  htmlFor="settings-import-data"
                  className="w-full flex items-center cursor-pointer"
                >
                  <Upload className="h-5 w-5 text-gray-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Import Data</p>
                    <p className="text-sm text-gray-500">Upload budget data from file</p>
                  </div>
                </label>
              </div>

              {LOCAL_ONLY_MODE && (
                <button
                  onClick={onSync}
                  className="w-full flex items-center p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Cloud className="h-5 w-5 text-blue-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-blue-900">Sync to Cloud</p>
                    <p className="text-sm text-blue-600">Upload your data to cloud storage</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-gray-300 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative">
        {/* Close Button - Top Right Corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all border border-gray-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </h2>
              </div>

              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? "bg-purple-100 text-purple-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">{renderSectionContent()}</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white border border-gray-300 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h4 className="font-semibold text-gray-900">Confirm Data Reset</h4>
            </div>
            <p className="text-gray-600 mb-6">
              This will permanently delete all your budget data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onClose();
                  onResetEncryption();
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={<LoadingSpinner />}>
        {showPasswordModal && (
          <ChangePasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            onChangePassword={onChangePassword}
          />
        )}

        {showHistoryModal && <BudgetHistoryViewer onClose={() => setShowHistoryModal(false)} />}

        {showLocalOnlySettings && (
          <LocalOnlyModeSettings
            isOpen={showLocalOnlySettings}
            onClose={() => setShowLocalOnlySettings(false)}
            onModeSwitch={(mode) => {
              if (mode === "standard") {
                window.location.reload();
              }
            }}
          />
        )}

        {showSecuritySettings && securityManager && (
          <SecuritySettings
            isOpen={showSecuritySettings}
            onClose={() => setShowSecuritySettings(false)}
          />
        )}
      </Suspense>
    </div>
  );
};

export default SettingsDashboard;
