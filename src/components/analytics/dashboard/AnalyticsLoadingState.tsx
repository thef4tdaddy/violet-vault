import React from "react";

const AnalyticsLoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <span className="ml-3 text-gray-600">Loading analytics...</span>
    </div>
  );
};

export default AnalyticsLoadingState;
