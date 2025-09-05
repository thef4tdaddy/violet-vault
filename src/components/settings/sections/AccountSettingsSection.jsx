import React from "react";
import { Key, AlertTriangle } from "lucide-react";

const AccountSettingsSection = ({
  currentUser,
  onOpenPasswordModal,
  onLogout,
  onOpenResetConfirm,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Current User</h4>
          <p className="text-sm text-gray-600">
            {currentUser?.userName || currentUser?.name || "User"}
          </p>
        </div>

        <button
          onClick={onOpenPasswordModal}
          className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Key className="h-5 w-5 text-gray-600 mr-3" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Change Password</p>
            <p className="text-sm text-gray-500">
              Update your encryption password
            </p>
          </div>
        </button>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900">Danger Zone</h4>
              <p className="text-sm text-red-700 mt-1">
                These actions cannot be undone.
              </p>
              <div className="mt-3 space-y-2">
                <button
                  onClick={onLogout}
                  className="block w-full text-left px-3 py-2 text-sm border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Logout Only (Keep Data)
                </button>
                <button
                  onClick={onOpenResetConfirm}
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
};

export default AccountSettingsSection;
