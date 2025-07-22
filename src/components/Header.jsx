import React, { useState } from "react";
import { Shield, Upload, Download, LogOut, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import UserIndicator from "./UserIndicator";

const Header = ({
  onExport,
  onImport,
  onLogout,
  onResetEncryption,
  currentUser,
  onUserChange,
}) => {
  const [showResetMenu, setShowResetMenu] = useState(false);
  
  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showResetMenu && !event.target.closest('.reset-menu-container')) {
        setShowResetMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showResetMenu]);
  return (
    <div className="glassmorphism rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between min-h-[80px]">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center">
            <div className="relative mr-4">
              <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-purple-500 p-3 rounded-2xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            Envelope Budget
            <Sparkles className="h-6 w-6 text-purple-500 ml-2" />
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Encrypted family financial management
          </p>
        </div>

        <div className="flex items-center gap-6 pr-4">
          <UserIndicator
            currentUser={currentUser}
            onUserChange={onUserChange}
          />

          <div className="flex gap-3 justify-center">
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

            <button
              onClick={onExport}
              className="btn btn-secondary flex items-center rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>

            <div className="relative reset-menu-container">
              <button
                onClick={() => setShowResetMenu(!showResetMenu)}
                className="btn text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 flex items-center rounded-xl"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </button>
              
              {showResetMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 glassmorphism rounded-xl border border-white/20 shadow-2xl z-50">
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
                        <div className="text-xs text-red-500">Delete everything and start fresh</div>
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
};

export default Header;
