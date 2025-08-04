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
          <div className="flex flex-col items-center w-full -my-2">
            <img
              src={logoWithText}
              alt="VioletVault Logo"
              loading="lazy"
              className="h-40 sm:h-52 md:h-64 lg:h-72 xl:h-80 2xl:h-96 w-auto max-w-full object-contain"
              style={{
                imageRendering: "high-quality",
              }}
            />
            <p className="text-gray-600 text-sm font-medium -mt-6">
              Encryption First, Family Budgeting Management
            </p>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-center flex-wrap gap-4 pt-2 pb-4 px-4">
          <div className="flex items-center justify-center flex-wrap gap-4 pt-2 pb-4 px-4">
            <UserIndicator
              currentUser={currentUser}
              onUserChange={onUserChange}
              onUpdateProfile={onUpdateProfile}
            />

            <div className="flex gap-3 items-center justify-center">
              <input
                type="file"
                accept=".json"
                onChange={onImport}
                className="hidden"
                id="import-data"
              />
              <label
                htmlFor="import-data"
                className="btn btn-secondary flex items-center cursor-pointer rounded-2xl px-4 py-2 font-medium hover:shadow-lg transition-all"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </label>

              <button
                onClick={onExport}
                className="btn btn-secondary flex items-center rounded-2xl px-4 py-2 font-medium hover:shadow-lg transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>

              <button
                onClick={handleTogglePasswordModal}
                className="btn btn-secondary flex items-center rounded-2xl px-4 py-2 font-medium hover:shadow-lg transition-all"
              >
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </button>

              {LOCAL_ONLY_MODE && (
                <button
                  onClick={onSync}
                  className="btn btn-primary flex items-center rounded-2xl px-4 py-2 font-medium hover:shadow-lg transition-all"
                >
                  <Cloud className="h-4 w-4 mr-2" />
                  Sync to Cloud
                </button>
              )}

              <div className="relative" style={{ zIndex: 50 }}>
                <button
                  onClick={handleToggleResetModal}
                  className="btn text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:shadow-lg flex items-center rounded-2xl px-4 py-2 font-medium transition-all"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
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
