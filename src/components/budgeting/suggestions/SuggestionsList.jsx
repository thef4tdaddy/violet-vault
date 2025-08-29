import React from "react";
import { AlertTriangle, Lightbulb, Target, Eye } from "lucide-react";
import SuggestionCard from "./SuggestionCard";

const SuggestionsList = ({
  suggestions,
  onApplySuggestion,
  onDismissSuggestion,
  isCompact = false,
}) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No suggestions available</p>
        <p className="text-sm mt-1">
          Your budget looks well-organized! Check back after more transactions.
        </p>
      </div>
    );
  }

  // Group suggestions by priority for better organization
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.priority]) {
      acc[suggestion.priority] = [];
    }
    acc[suggestion.priority].push(suggestion);
    return acc;
  }, {});

  const priorityConfig = {
    high: {
      label: "High Priority",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    medium: {
      label: "Medium Priority",
      icon: Lightbulb,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    low: {
      label: "Low Priority",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
  };

  return (
    <div className="space-y-4">
      {["high", "medium", "low"].map((priority) => {
        const prioritySuggestions = groupedSuggestions[priority];
        if (!prioritySuggestions || prioritySuggestions.length === 0) return null;

        const config = priorityConfig[priority];
        const PriorityIcon = config.icon;

        return (
          <div key={priority} className="space-y-3">
            {!isCompact && (
              <div className={`flex items-center px-3 py-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
                <PriorityIcon className={`h-4 w-4 mr-2 ${config.color}`} />
                <h4 className={`font-medium ${config.color}`}>
                  {config.label} ({prioritySuggestions.length})
                </h4>
              </div>
            )}
            
            <div className={`grid gap-3 ${
              isCompact
                ? "grid-cols-1"
                : "grid-cols-1 lg:grid-cols-2"
            }`}>
              {prioritySuggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onApply={onApplySuggestion}
                  onDismiss={onDismissSuggestion}
                  isCompact={isCompact}
                />
              ))}
            </div>
          </div>
        );
      })}
      
      {/* Summary footer for non-compact view */}
      {!isCompact && suggestions.length > 0 && (
        <div className="text-center py-4 border-t border-gray-200 mt-6">
          <p className="text-sm text-gray-600">
            Showing {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""} based on your recent spending patterns
          </p>
        </div>
      )}
    </div>
  );
};

export default SuggestionsList;