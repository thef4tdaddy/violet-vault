import { useState, memo, useCallback } from "react";
import {
  Upload,
  Download,
  AlertTriangle,
  RefreshCw,
  Cloud,
  Key,
} from "lucide-react";
import UserIndicator from "../auth/UserIndicator";
import logoWithText from "../../assets/Shield Text Logo.webp";
import ChangePasswordModal from "../auth/ChangePasswordModal";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";
const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.6.1";
const APP_ENV = import.meta.env.VITE_APP_ENV || "production";
const IS_DEV = APP_ENV === "development";

// Smart version detection for dev branch target
const getNextVersion = (currentVersion) => {
  if (!currentVersion) return "1.8.0";
  
  const [major, minor, patch] = currentVersion.replace(/[^0-9.]/g, '').split('.').map(Number);
  
  // If we're on a dev version (has -dev suffix), show the target version
  if (currentVersion.includes('-dev')) {
    return `${major}.${minor}.${patch}`;
  }
  
  // Otherwise, increment minor version for next milestone
  return `${major}.${minor + 1}.0`;
};

const NEXT_VERSION = getNextVersion(APP_VERSION);

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
  }) => {
    const [showResetModal, setShowResetModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const handleToggleResetModal = useCallback(() => {
      setShowResetModal((prev) => !prev);
    }, []);

    const handleTogglePasswordModal = useCallback(() => {
      setShowPasswordModal((prev) => !prev);
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
            <div className="rounded border-4 border-purple-600 bg-white/95 mb-4">
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
            <p className="text-gray-600 text-sm font-medium mb-2">
              Encryption First, Family Budgeting Management
            </p>
            {/* Version and environment indicator */}
            <div className="flex items-center justify-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                IS_DEV 
                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                  : "bg-green-100 text-green-800 border border-green-200"
              }`}>
                v{APP_VERSION}
              </span>
              {IS_DEV && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  DEV → v{NEXT_VERSION}
                </span>
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
                  <div className="font-medium text-amber-800">
                    Reset Options
                  </div>
                  <div className="text-sm text-amber-600 mt-1">
                    Choose your reset option
                  </div>
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
                  <div className="text-xs text-gray-500">
                    Keep your data, just logout
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowResetModal(false);
                    onResetEncryption();
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50 border border-red-200 text-red-600"
                >
                  <div className="font-medium">Clear All Data</div>
                  <div className="text-xs text-red-500">
                    Delete everything and start fresh
                  </div>
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
      </div>
    );
  },
);

export default Header;
