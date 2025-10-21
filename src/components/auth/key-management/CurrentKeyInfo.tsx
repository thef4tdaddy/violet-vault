import React from "react";
import { getIcon } from "@/utils";

interface CurrentKeyInfoProps {
  keyFingerprint: string | null;
}

const CurrentKeyInfo: React.FC<CurrentKeyInfoProps> = ({ keyFingerprint }) => {
  if (!keyFingerprint) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        {React.createElement(getIcon("Shield"), {
          className: "h-4 w-4 text-green-600 mr-2",
        })}
        <div className="text-sm">
          <p className="text-green-800 font-medium">Current Key</p>
          <p className="text-green-700 font-mono text-xs mt-1">
            Fingerprint: {keyFingerprint.substring(0, 16)}...
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrentKeyInfo;
