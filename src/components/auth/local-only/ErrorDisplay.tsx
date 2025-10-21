import React from "react";
import { getIcon } from "@/utils";

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        {React.createElement(getIcon("AlertTriangle"), {
          className: "h-4 w-4 text-red-600 mr-2 mt-0.5",
        })}
        <div className="text-sm text-red-800">{error}</div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
