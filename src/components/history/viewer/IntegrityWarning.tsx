import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface IntegrityCheck {
  valid: boolean;
  totalCommits?: number;
  message: string;
  brokenAt?: string;
  details?: {
    lastValidCommit?: {
      hash: string;
      message: string;
    };
    suspiciousCommit?: {
      shortHash: string;
      message: string;
    };
  };
}

interface IntegrityWarningProps {
  integrityCheck: IntegrityCheck | null;
  showIntegrityDetails: boolean;
  toggleIntegrityDetails: () => void;
}

const IntegrityWarning: React.FC<IntegrityWarningProps> = ({
  integrityCheck,
  showIntegrityDetails,
  toggleIntegrityDetails,
}) => {
  if (!integrityCheck) return null;

  // Integrity Success
  if (integrityCheck.valid && integrityCheck.totalCommits && integrityCheck.totalCommits > 0) {
    return (
      <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center">
          {React.createElement(getIcon("Shield"), {
            className: "h-4 w-4 text-green-600 mr-2",
          })}
          <div className="text-sm text-green-800">
            <strong>✓ History Verified:</strong> {integrityCheck.message}
          </div>
        </div>
      </div>
    );
  }

  // Integrity Warning
  if (!integrityCheck.valid) {
    return (
      <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          {React.createElement(getIcon("ShieldAlert"), {
            className: "h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0",
          })}
          <div className="flex-1">
            <h3 className="font-medium text-red-900 mb-2">History Integrity Warning</h3>
            <p className="text-sm text-red-800 mb-3">{integrityCheck.message}</p>

            {integrityCheck.details && (
              <div className="space-y-2">
                <Button
                  onClick={toggleIntegrityDetails}
                  className="text-sm text-red-700 hover:text-red-900 underline"
                >
                  {showIntegrityDetails ? "Hide Details" : "Show Details"}
                </Button>

                {showIntegrityDetails && (
                  <div className="bg-red-100 p-3 rounded border border-red-200 text-sm">
                    <div className="space-y-2">
                      <div>
                        <strong>Broken at commit:</strong> {integrityCheck.brokenAt}
                      </div>

                      {integrityCheck.details.lastValidCommit && (
                        <div>
                          <strong>Last valid commit:</strong>
                          <div className="ml-2 font-mono text-xs">
                            {integrityCheck.details.lastValidCommit.hash.substring(0, 8)} -
                            {integrityCheck.details.lastValidCommit.message}
                          </div>
                        </div>
                      )}

                      {integrityCheck.details.suspiciousCommit && (
                        <div>
                          <strong>Suspicious commit:</strong>
                          <div className="ml-2 font-mono text-xs">
                            {integrityCheck.details.suspiciousCommit.shortHash} -
                            {integrityCheck.details.suspiciousCommit.message}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 text-xs text-red-700">
              ⚠️ Your budget history may have been tampered with. Consider exporting your data and
              investigating recent changes.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default IntegrityWarning;
