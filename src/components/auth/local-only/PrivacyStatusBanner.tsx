import React from "react";
import { getIcon } from "@/utils";

const PrivacyStatusBanner: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        {React.createElement(getIcon("Shield"), {
          className: "h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0",
        })}
        <div className="text-sm">
          <p className="text-blue-900 font-medium mb-1">Privacy-First Mode Active</p>
          <p className="text-blue-800">
            Your data is stored only on this device. No cloud sync or password required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyStatusBanner;
