import React from "react";

/**
 * Props for the recommendations component
 */
interface EnvelopeIntegrityRecommendationsProps {
  recommendations: string[];
}

/**
 * Recommendations panel for envelope integrity checker
 * Displays list of recommendations for fixing envelope issues
 * Extracted from EnvelopeIntegrityChecker.tsx for reusability
 */
export const EnvelopeIntegrityRecommendations: React.FC<EnvelopeIntegrityRecommendationsProps> = ({
  recommendations,
}) => {
  if (recommendations.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-blue-900 mb-3">Recommendations</h3>
      <ul className="list-disc list-inside text-blue-800 space-y-1">
        {recommendations.map((rec, idx) => (
          <li key={idx} className="text-sm">
            {rec}
          </li>
        ))}
      </ul>
    </div>
  );
};
