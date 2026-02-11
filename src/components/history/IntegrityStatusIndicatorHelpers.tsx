import React from "react";
import { getIcon } from "../../utils";

// Type definitions for integrity status
interface IntegrityStatus {
  valid: boolean;
  message: string;
  totalCommits?: number;
  verifiedCommits?: number;
  brokenAt?: number | null;
}

interface SecurityIndicator {
  severity: string;
  description: string;
}

interface TamperDetection {
  indicators: SecurityIndicator[];
  recommendations: string[];
}

interface SecurityReport {
  integrity: IntegrityStatus;
  warnings: Array<{
    title: string;
    message: string;
    recommendation: string;
  }>;
  recommendations: string[];
  timestamp?: string;
  riskLevel?: string;
  overallStatus?: string;
  summary?: string;
  tamperDetection?: TamperDetection;
}

// Helper functions
export const getStatusIcon = (integrityStatus: IntegrityStatus | null) => {
  if (!integrityStatus) {
    return React.createElement(getIcon("Shield"), {
      className: "h-5 w-5 text-gray-400",
    });
  }

  if (integrityStatus.valid) {
    return React.createElement(getIcon("CheckCircle"), {
      className: "h-5 w-5 text-green-600",
    });
  }

  return React.createElement(getIcon("ShieldX"), {
    className: "h-5 w-5 text-red-600",
  });
};

export const getStatusColor = (integrityStatus: IntegrityStatus | null) => {
  if (!integrityStatus) return "text-gray-500 bg-gray-100";
  if (integrityStatus.valid) return "text-green-700 bg-green-100 border-green-200";
  return "text-red-700 bg-red-100 border-red-200";
};

export const getSecurityStatusColor = (securityReport: SecurityReport | null) => {
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

export const getRiskLevelColor = (riskLevel: string) => {
  if (riskLevel === "high") return "text-red-600";
  if (riskLevel === "medium") return "text-yellow-600";
  return "text-green-600";
};

// Sub-components
interface WarningsListProps {
  warnings: Array<{
    title: string;
    message: string;
    recommendation: string;
  }>;
}

export const WarningsList = ({ warnings }: WarningsListProps) => {
  if (warnings.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {warnings.map((warning, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          {React.createElement(getIcon("AlertTriangle"), {
            className: "h-5 w-5 text-red-600 mt-0.5",
          })}
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-900">{warning.title}</h4>
            <p className="text-sm text-red-700 mt-1">{warning.message}</p>
            <p className="text-xs text-red-600 mt-2 font-medium">{warning.recommendation}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

interface IntegrityDetailsProps {
  integrityStatus: IntegrityStatus | null;
}

export const IntegrityDetails = ({ integrityStatus }: IntegrityDetailsProps) => {
  if (!integrityStatus) return null;

  return (
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
  );
};

interface SecurityReportDetailsProps {
  securityReport: SecurityReport | null;
  getSecurityStatusColor: (report: SecurityReport | null) => string;
}

export const SecurityReportDetails = ({
  securityReport,
  getSecurityStatusColor,
}: SecurityReportDetailsProps) => {
  if (!securityReport) return null;

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Advanced Security Analysis</h4>
      <div className={`p-3 rounded-lg border ${getSecurityStatusColor(securityReport)}`}>
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>
            <span className="text-gray-600">Overall Status:</span>
            <span className="ml-2 font-medium capitalize">{securityReport.overallStatus}</span>
          </div>
          <div>
            <span className="text-gray-600">Risk Level:</span>
            <span
              className={`ml-2 font-medium capitalize ${getRiskLevelColor(securityReport.riskLevel ?? "unknown")}`}
            >
              {securityReport.riskLevel}
            </span>
          </div>
        </div>
        <p className="text-sm mb-3">{securityReport.summary}</p>

        {/* Tamper Detection Results */}
        {securityReport.tamperDetection && securityReport.tamperDetection.indicators.length > 0 && (
          <TamperIndicators indicators={securityReport.tamperDetection.indicators} />
        )}

        {/* Recommendations */}
        {securityReport.tamperDetection &&
          securityReport.tamperDetection.recommendations.length > 0 && (
            <Recommendations recommendations={securityReport.tamperDetection.recommendations} />
          )}
      </div>
    </div>
  );
};

interface TamperIndicatorsProps {
  indicators: SecurityIndicator[];
}

const TamperIndicators = ({ indicators }: TamperIndicatorsProps) => {
  const getSeverityColor = (severity: string) => {
    if (severity === "high") return "bg-red-500";
    if (severity === "medium") return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div>
      <h5 className="text-xs font-medium text-gray-700 mb-2">Security Indicators:</h5>
      <div className="space-y-1">
        {indicators.map((indicator, index) => (
          <div key={index} className="text-xs">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${getSeverityColor(indicator.severity)}`}
            ></span>
            {indicator.description}
          </div>
        ))}
      </div>
    </div>
  );
};

interface RecommendationsProps {
  recommendations: string[];
}

const Recommendations = ({ recommendations }: RecommendationsProps) => {
  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <h5 className="text-xs font-medium text-gray-700 mb-2">Recommendations:</h5>
      <div className="space-y-1">
        {recommendations.map((rec, index) => (
          <div key={index} className="text-xs text-gray-600">
            • {rec}
          </div>
        ))}
      </div>
    </div>
  );
};
