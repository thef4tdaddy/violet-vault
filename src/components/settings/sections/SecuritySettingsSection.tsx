import React from "react";
import { getIcon } from "../../../utils";

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
            <Button
              onClick={securityManager.lockApp}
              className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {React.createElement(getIcon("Lock"), {
                className: "h-5 w-5 text-gray-600 mr-3",
              })}
              <div className="text-left">
                <p className="font-medium text-gray-900">Lock Application</p>
                <p className="text-sm text-gray-500">Immediately lock the app</p>
              </div>
            </Button>

            <Button
              onClick={onOpenSecuritySettings}
              className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {React.createElement(getIcon("Shield"), {
                className: "h-5 w-5 text-gray-600 mr-3",
              })}
              <div className="text-left">
                <p className="font-medium text-gray-900">Advanced Security</p>
                <p className="text-sm text-gray-500">Auto-lock, logging, and privacy</p>
              </div>
            </Button>

            <Button
              onClick={onShowLocalDataSecurity}
              className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {React.createElement(getIcon("AlertTriangle"), {
                className: "h-5 w-5 text-yellow-600 mr-3",
              })}
              <div className="text-left">
                <p className="font-medium text-gray-900">Local Data Security</p>
                <p className="text-sm text-gray-500">
                  View information about local data encryption
                </p>
              </div>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SecuritySettingsSection;
