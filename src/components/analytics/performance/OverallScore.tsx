import React from "react";
import { getPerformanceMessage } from "@/utils/performanceUtils";

interface OverallScoreProps {
  score: number;
}

/**
 * OverallScore component - displays the main performance score
 * Extracted from PerformanceMonitor.jsx for better organization
 */
const OverallScore: React.FC<OverallScoreProps> = ({ score }) => {
  return (
    <div className="mb-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-r from-purple-500 to-blue-600 text-white mb-4">
          <span className="text-2xl font-bold">{score}</span>
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Overall Financial Health</h4>
        <p className="text-gray-600 max-w-md mx-auto">{getPerformanceMessage(score)}</p>
      </div>
    </div>
  );
};

export default OverallScore;
