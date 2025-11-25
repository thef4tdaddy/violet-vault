import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface SecurityManager {
  lockApp?: () => void;
}

interface SecuritySettingsSectionProps {
  securityManager?: SecurityManager;
  onOpenSecuritySettings?: () => void;
  onShowLocalDataSecurity?: () => void;
}

const SecuritySettingsSection: React.FC<SecuritySettingsSectionProps> = ({
  securityManager,
  onOpenSecuritySettings = () => {},
  onShowLocalDataSecurity = () => {},
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>

      <div className="space-y-4">
        {securityManager && (
          <>
            {securityManager.lockApp && (
              <Button
                onClick={securityManager.lockApp}
                className="w-full flex items-center p-3 border-2 border-black bg-red-50 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
              >
                {React.createElement(getIcon("Lock"), {
                  className: "h-5 w-5 text-red-600 mr-3",
                })}
                <div className="text-left">
                  <p className="font-medium text-gray-900">Lock Application</p>
                  <p className="text-sm text-gray-700">Immediately lock the app</p>
                </div>
              </Button>
            )}

            <Button
              onClick={onOpenSecuritySettings}
              className="w-full flex items-center p-3 border-2 border-black bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors shadow-sm"
            >
              {React.createElement(getIcon("Shield"), {
                className: "h-5 w-5 text-purple-600 mr-3",
              })}
              <div className="text-left">
                <p className="font-medium text-gray-900">Advanced Security</p>
                <p className="text-sm text-gray-700">Auto-lock, logging, and privacy</p>
              </div>
            </Button>

            <Button
              onClick={onShowLocalDataSecurity}
              className="w-full flex items-center p-3 border-2 border-black bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors shadow-sm"
            >
              {React.createElement(getIcon("AlertTriangle"), {
                className: "h-5 w-5 text-yellow-600 mr-3",
              })}
              <div className="text-left">
                <p className="font-medium text-gray-900">Local Data Security</p>
                <p className="text-sm text-gray-700">
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
