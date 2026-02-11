import React from "react";
import { getIcon } from "@/utils";

const SecurityWarning: React.FC = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start">
        {React.createElement(getIcon("AlertTriangle"), {
          className: "h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0",
        })}
        <div className="text-sm">
          <p className="text-amber-800 font-medium mb-1">Critical Security Information</p>
          <p className="text-amber-700">
            Without your encryption key, your data is <strong>unrecoverable</strong>. Store backups
            securely and never share your key with untrusted parties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityWarning;
