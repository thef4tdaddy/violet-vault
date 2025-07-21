import React from "react";
import { Shield, Upload, Download, LogOut, Sparkles } from "lucide-react";
import UserIndicator from "./UserIndicator";

const Header = ({
  onExport,
  onImport,
  onLogout,
  currentUser,
  onUserChange,
}) => {
  return (
    <div className="glassmorphism rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between">
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

        <div className="flex items-center gap-6">
          <UserIndicator
            currentUser={currentUser}
            onUserChange={onUserChange}
          />

          <div className="flex gap-3">
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

            <button
              onClick={onLogout}
              className="btn text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 flex items-center rounded-xl"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
