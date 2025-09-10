import React from "react";
import { Lock, Shield, AlertTriangle } from "lucide-react";

const SecuritySettingsSection = ({
  securityManager,
  onOpenSecuritySettings,
  onShowLocalDataSecurity,
}) => {
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
                <p className="text-sm text-gray-500">
                  Immediately lock the app
                </p>
              </div>
            </button>

            <button
              onClick={onOpenSecuritySettings}
              className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="h-5 w-5 text-gray-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Advanced Security</p>
                <p className="text-sm text-gray-500">
                  Auto-lock, logging, and privacy
                </p>
              </div>
            </button>

            <button
              onClick={onShowLocalDataSecurity}
              className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Local Data Security</p>
                <p className="text-sm text-gray-500">
                  View information about local data encryption
                </p>
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SecuritySettingsSection;
