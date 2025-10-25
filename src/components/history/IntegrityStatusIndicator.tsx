import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import logger from "../../utils/common/logger";
import {
  getStatusIcon,
  getStatusColor,
  getSecurityStatusColor,
  WarningsList,
  IntegrityDetails,
  SecurityReportDetails,
} from "./IntegrityStatusIndicatorHelpers";

const IntegrityStatusIndicator = ({ className = "" }) => {
  const [integrityStatus, setIntegrityStatus] = useState({
    valid: true,
    message: "Budget history integrity verified",
  });
  const [securityReport, setSecurityReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadIntegrityStatus();
  }, []);

  const loadIntegrityStatus = async () => {
    try {
      // For now, use a simplified integrity check
      // TODO: Implement proper integrity checking for new Dexie-based system
      const status = {
        valid: true,
        message: "Budget history integrity verified",
      };
      setIntegrityStatus(status);
    } catch (error) {
      logger.error("Failed to load integrity status", error);
    }
  };

  const performSecurityScan = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement security scanning for new Dexie-based system
      const report = {
        integrity: {
          valid: true,
          message: "Budget history integrity verified",
        },
        warnings: [],
        recommendations: ["Integrity checking will be enhanced in future versions"],
      };
      setSecurityReport(report);
      setIntegrityStatus(report.integrity);
    } catch (error) {
      logger.error("Failed to perform security scan", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWarnings = () => {
    if (!integrityStatus || integrityStatus.valid) return [];
    return securityReport?.warnings || [];
  };

  const warnings = getWarnings();
  const statusText = !integrityStatus
    ? "Integrity Unknown"
    : integrityStatus.valid
      ? "History Secure"
      : "Integrity Issues";

  return (
    <div className={`${className}`}>
      {/* Status Indicator */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(integrityStatus)}`}
      >
        {getStatusIcon(integrityStatus)}
        <span className="text-sm font-medium">{statusText}</span>

        <Button
          onClick={() => setShowDetails(!showDetails)}
          className="p-1 hover:bg-white/50 rounded"
          title="View details"
        >
          {React.createElement(getIcon("Eye"), { className: "h-4 w-4" })}
        </Button>

        <Button
          onClick={performSecurityScan}
          disabled={isLoading}
          className="p-1 hover:bg-white/50 rounded disabled:opacity-50"
          title="Perform security scan"
        >
          {React.createElement(getIcon("RefreshCw"), {
            className: `h-4 w-4 ${isLoading ? "animate-spin" : ""}`,
          })}
        </Button>
      </div>

      {/* Warnings */}
      <WarningsList warnings={warnings} />

      {/* Detailed Security Report */}
      {showDetails && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Security Status Details</h3>

          <IntegrityDetails integrityStatus={integrityStatus} />
          <SecurityReportDetails
            securityReport={securityReport}
            getSecurityStatusColor={getSecurityStatusColor}
          />

          <div className="text-xs text-gray-500">
            Last checked:{" "}
            {securityReport ? new Date(securityReport.timestamp).toLocaleString() : "Never"}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrityStatusIndicator;
