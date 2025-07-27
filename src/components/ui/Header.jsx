import React, { useState, memo, useCallback } from "react";
import { Upload, Download, LogOut, AlertTriangle, RefreshCw } from "lucide-react";
import UserIndicator from "../auth/UserIndicator";
import logoWithText from "../../assets/Logo with Text Final.png";

const Header = memo(
  ({ onExport, onImport, onLogout, onResetEncryption, currentUser, onUserChange }) => {
    const [showResetMenu, setShowResetMenu] = useState(false);

    const handleToggleResetMenu = useCallback(() => {
      setShowResetMenu((prev) => !prev);
    }, []);

    // Close menu when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (showResetMenu && !event.target.closest(".reset-menu-container")) {
          setShowResetMenu(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showResetMenu]);
    return (
      <div className="glassmorphism rounded-3xl p-6 mb-6">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center">
            <img
              src={logoWithText}
              alt="VioletVault Logo"
              style={{
                height: "180px",
                width: "auto",
                maxWidth: "450px",
                objectFit: "contain",
              }}
            />
            <p className="text-gray-600 text-sm mt-3 font-medium">
              Encryption First, Family Budgeting Management
            </p>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-center flex-wrap gap-4">
            <UserIndicator currentUser={currentUser} onUserChange={onUserChange} />

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
                className="btn btn-secondary flex items-center cursor-pointer rounded-xl"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </label>

              <button onClick={onExport} className="btn btn-secondary flex items-center rounded-xl">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>

              <div className="relative reset-menu-container" style={{ zIndex: 50 }}>
                <button
                  onClick={handleToggleResetMenu}
                  className="btn text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 flex items-center rounded-xl"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </button>

                {showResetMenu && (
                  <div
                    className="absolute glassmorphism rounded-xl border shadow-xl"
                    style={{
                      right: "0",
                      top: "100%",
                      marginTop: "0.5rem",
                      width: "256px",
                      zIndex: 99999,
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start space-x-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-amber-800">Reset Options</div>
                          <div className="text-sm text-amber-600 mt-1">
                            Choose your reset option
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setShowResetMenu(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 border border-gray-200"
                        >
                          <div className="font-medium">Logout Only</div>
                          <div className="text-xs text-gray-500">Keep your data, just logout</div>
                        </button>

                        <button
                          onClick={() => {
                            setShowResetMenu(false);
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
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default Header;
