import React from "react";
import { getIcon } from "@/utils";

/**
 * Props for the corrupted envelopes list component
 */
interface EnvelopeIntegrityCorruptedListProps {
  corruptedEnvelopes: Array<{
    id: string;
    name?: string;
    category?: string;
    currentBalance?: number;
    monthlyAmount?: number;
    issues: string[];
  }>;
  selectedEnvelopes: Set<string>;
  onSelectEnvelope: (envelopeId: string) => void;
}

/**
 * Corrupted envelopes list component for envelope integrity checker
 * Displays list of corrupted envelopes with checkboxes and details
 * Extracted from EnvelopeIntegrityChecker.tsx for reusability
 */
export const EnvelopeIntegrityCorruptedList: React.FC<EnvelopeIntegrityCorruptedListProps> = ({
  corruptedEnvelopes,
  selectedEnvelopes,
  onSelectEnvelope,
}) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
        {React.createElement(getIcon("AlertTriangle"), {
          className: "h-5 w-5 mr-2",
        })}
        Corrupted Envelopes ({corruptedEnvelopes.length})
      </h3>

      <div className="space-y-3">
        {corruptedEnvelopes.map((envelope) => (
          <div key={envelope.id} className="bg-white border border-yellow-300 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={selectedEnvelopes.has(envelope.id)}
                  onChange={() => onSelectEnvelope(envelope.id)}
                  className="mt-1 mr-3"
                />
                <div>
                  <p className="font-medium text-gray-900">{envelope.name || "[MISSING NAME]"}</p>
                  <p className="text-sm text-gray-600">
                    ID: {envelope.id} | Category: {envelope.category || "[MISSING]"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Balance: ${envelope.currentBalance ?? "N/A"} | Monthly: $
                    {envelope.monthlyAmount ?? "N/A"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {envelope.issues.map((issue, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                  >
                    {issue}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
