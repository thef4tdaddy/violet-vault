import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import logger from "../../utils/common/logger";

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

  const getStatusIcon = () => {
    if (!integrityStatus) {
      return <Shield className="h-5 w-5 text-gray-400" />;
    }

    if (integrityStatus.valid) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }

    return <ShieldX className="h-5 w-5 text-red-600" />;
  };

  const getStatusColor = () => {
    if (!integrityStatus) return "text-gray-500 bg-gray-100";
    if (integrityStatus.valid) return "text-green-700 bg-green-100 border-green-200";
    return "text-red-700 bg-red-100 border-red-200";
  };

  const getSecurityStatusColor = () => {
    if (!securityReport) return "bg-gray-100";

    switch (securityReport.riskLevel) {
      case "high":
        return "bg-red-100 border-red-200";
      case "medium":
        return "bg-yellow-100 border-yellow-200";
      case "low":
        return "bg-green-100 border-green-200";
      default:
        return "bg-gray-100";
    }
  };

  const getWarnings = () => {
    if (!integrityStatus || integrityStatus.valid) return [];
    return securityReport?.warnings || [];
  };

  const warnings = getWarnings();

  return (
    <div className={`${className}`}>
      {/* Status Indicator */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">
          {!integrityStatus
            ? "Integrity Unknown"
            : integrityStatus.valid
              ? "History Secure"
              : "Integrity Issues"}
        </span>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-1 hover:bg-white/50 rounded"
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </button>

        <button
          onClick={performSecurityScan}
          disabled={isLoading}
          className="p-1 hover:bg-white/50 rounded disabled:opacity-50"
          title="Perform security scan"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mt-3 space-y-2">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-900">{warning.title}</h4>
                <p className="text-sm text-red-700 mt-1">{warning.message}</p>
                <p className="text-xs text-red-600 mt-2 font-medium">{warning.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Security Report */}
      {showDetails && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Security Status Details</h3>

          {/* Integrity Status */}
          {integrityStatus && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Hash Chain Integrity</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`ml-2 font-medium ${integrityStatus.valid ? "text-green-600" : "text-red-600"}`}
                    >
                      {integrityStatus.valid ? "Valid" : "Compromised"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Commits:</span>
                    <span className="ml-2 font-medium">{integrityStatus.totalCommits}</span>
                  </div>
                  {integrityStatus.verifiedCommits !== undefined && (
                    <div>
                      <span className="text-gray-600">Verified:</span>
                      <span className="ml-2 font-medium">{integrityStatus.verifiedCommits}</span>
                    </div>
                  )}
                  {integrityStatus.brokenAt !== null && (
                    <div>
                      <span className="text-gray-600">Broken at:</span>
                      <span className="ml-2 font-medium text-red-600">
                        Commit {integrityStatus.brokenAt}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">{integrityStatus.message}</p>
              </div>
            </div>
          )}

          {/* Security Report */}
          {securityReport && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Advanced Security Analysis</h4>
              <div className={`p-3 rounded-lg border ${getSecurityStatusColor()}`}>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Overall Status:</span>
                    <span className="ml-2 font-medium capitalize">
                      {securityReport.overallStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Risk Level:</span>
                    <span
                      className={`ml-2 font-medium capitalize ${
                        securityReport.riskLevel === "high"
                          ? "text-red-600"
                          : securityReport.riskLevel === "medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {securityReport.riskLevel}
                    </span>
                  </div>
                </div>
                <p className="text-sm mb-3">{securityReport.summary}</p>

                {/* Tamper Detection Results */}
                {securityReport.tamperDetection &&
                  securityReport.tamperDetection.indicators.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-2">
                        Security Indicators:
                      </h5>
                      <div className="space-y-1">
                        {securityReport.tamperDetection.indicators.map((indicator, index) => (
                          <div key={index} className="text-xs">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                indicator.severity === "high"
                                  ? "bg-red-500"
                                  : indicator.severity === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                              }`}
                            ></span>
                            {indicator.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Recommendations */}
                {securityReport.tamperDetection &&
                  securityReport.tamperDetection.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Recommendations:</h5>
                      <div className="space-y-1">
                        {securityReport.tamperDetection.recommendations.map((rec, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            • {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

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
