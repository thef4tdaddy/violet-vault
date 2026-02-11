import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

interface AnalyticsErrorStateProps {
  error: string;
  onRetry?: () => void;
}

const AnalyticsErrorState: React.FC<AnalyticsErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center">
        {React.createElement(getIcon("AlertCircle"), {
          className: "h-5 w-5 text-red-600 mr-2",
        })}
        <h3 className="text-red-900 font-medium">Analytics Error</h3>
      </div>
      <p className="text-red-700 mt-2">{error}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default AnalyticsErrorState;
