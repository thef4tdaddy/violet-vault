import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface AdvancedSectionProps {
  showAdvanced: boolean;
  keyFingerprint: string | null;
  onToggleAdvanced: () => void;
}

const AdvancedSection: React.FC<AdvancedSectionProps> = ({
  showAdvanced,
  keyFingerprint,
  onToggleAdvanced,
}) => {
  return (
    <div>
      <Button
        onClick={onToggleAdvanced}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        {React.createElement(getIcon("Info"), {
          className: "h-4 w-4 mr-1",
        })}
        Advanced Options & Security Info
      </Button>

      {showAdvanced && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
          {/* Key Fingerprint */}
          <div>
            <div className="flex items-center mb-2">
              {React.createElement(getIcon("Key"), {
                className: "h-4 w-4 text-gray-500 mr-2",
              })}
              <h5 className="text-sm font-medium text-gray-900">Current Key Fingerprint</h5>
            </div>
            <code className="text-xs bg-white p-2 rounded border font-mono text-purple-600 block">
              {keyFingerprint || "Loading..."}
            </code>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              {React.createElement(getIcon("FileText"), {
                className: "h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0",
              })}
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Security Notice</p>
                <p>
                  Your encryption key is unique to your vault. Keep it secure and create backups.
                  Without it, your data cannot be recovered.
                </p>
              </div>
            </div>
          </div>

          {/* Learn More */}
          <div>
            <a
              href="#"
              className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700"
              onClick={(e) => e.preventDefault()}
            >
              {React.createElement(getIcon("ExternalLink"), {
                className: "h-3 w-3 mr-1",
              })}
              Learn more about key management
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSection;
