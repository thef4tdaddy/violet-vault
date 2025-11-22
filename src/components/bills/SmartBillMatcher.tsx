// components/SmartBillMatcher.jsx
import { Button } from "@/components/ui";
import React from "react";
import { getIcon } from "../../utils";
import { useSmartBillSuggestions } from "../../hooks/bills/useSmartBillSuggestions";
import { getConfidenceColor, getConfidenceIcon } from "./smartBillMatcherHelpers";

interface Envelope {
  id: string;
  name: string;
  color: string;
  [key: string]: unknown;
}

interface Suggestion {
  envelope: Envelope;
  confidence: number;
  reason: string;
}

const SmartBillMatcher = ({
  bills,
  envelopes,
  onSuggestEnvelope,
  searchQuery,
}: {
  bills: unknown[];
  envelopes: unknown[];
  onSuggestEnvelope: (envelope: Envelope) => void;
  searchQuery: string;
}) => {
  const suggestions = useSmartBillSuggestions(bills, envelopes, searchQuery) as Suggestion[];

  if (!searchQuery || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 mt-2">
      <div className="flex items-center mb-3">
        {React.createElement(getIcon("Search"), {
          className: "h-4 w-4 mr-2 text-gray-500",
        })}
        <span className="text-sm font-medium text-gray-700">
          Smart envelope suggestions for "{searchQuery}"
        </span>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion, index) => {
          const confidenceIconName = getConfidenceIcon(suggestion.confidence);

          return (
            <Button
              key={`${suggestion.envelope.id}-${index}`}
              onClick={() => onSuggestEnvelope(suggestion.envelope)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: suggestion.envelope.color }}
                />
                <div>
                  <div className="font-medium text-gray-900">{suggestion.envelope.name}</div>
                  <div className="text-sm text-gray-600">{suggestion.reason}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(
                    suggestion.confidence
                  )}`}
                >
                  {suggestion.confidence}%
                </span>
                {React.createElement(getIcon(confidenceIconName), {
                  className: "h-4 w-4 text-gray-400",
                })}
              </div>
            </Button>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Click a suggestion to assign this transaction to that envelope
        </p>
      </div>
    </div>
  );
};

export default SmartBillMatcher;
