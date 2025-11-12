import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import type { Suggestion } from "@/utils/analytics/categoryHelpers";

interface CategorySuggestionsTabProps {
  suggestions: Suggestion[];
  onApplySuggestion: (suggestion: Suggestion) => void;
  onDismissSuggestion: (suggestionId: string) => void;
}

const CategorySuggestionsTab = ({
  suggestions,
  onApplySuggestion,
  onDismissSuggestion,
}: CategorySuggestionsTabProps) => {
  const getPriorityIcon = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return React.createElement(getIcon("AlertCircle"), {
          className: "h-4 w-4 text-red-500",
        });
      case "medium":
        return React.createElement(getIcon("Lightbulb"), {
          className: "h-4 w-4 text-amber-500",
        });
      case "low":
        return React.createElement(getIcon("Target"), {
          className: "h-4 w-4 text-blue-500",
        });
      default:
        return React.createElement(getIcon("Zap"), {
          className: "h-4 w-4 text-gray-500",
        });
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "add_category":
        return React.createElement(getIcon("Plus"), {
          className: "h-3 w-3",
        });
      case "remove_category":
        return React.createElement(getIcon("Minus"), {
          className: "h-3 w-3",
        });
      case "consolidate_categories":
        return React.createElement(getIcon("Archive"), {
          className: "h-3 w-3",
        });
      default:
        return React.createElement(getIcon("Tag"), {
          className: "h-3 w-3",
        });
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8 text-purple-800">
        <div className="glassmorphism rounded-full p-4 w-20 h-20 mx-auto mb-4 border-2 border-green-300">
          {React.createElement(getIcon("CheckCircle"), {
            className: "h-12 w-12 text-green-600 mx-auto",
          })}
        </div>
        <p className="text-lg font-black text-black">ALL OPTIMIZED!</p>
        <p className="font-medium">No category suggestions at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="bg-linear-to-r from-white/60 to-purple-50/60 backdrop-blur-sm rounded-xl p-4 border-2 border-black shadow-md hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getPriorityIcon(suggestion.priority)}
              <h4 className="font-bold text-gray-900">{suggestion.title}</h4>
              <span className="bg-linear-to-r from-gray-100 to-purple-100 text-purple-900 px-2 py-1 rounded-full text-xs font-bold border border-gray-300 shadow-sm">
                {suggestion.category}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onApplySuggestion(suggestion)}
                className="flex items-center gap-1 px-3 py-1 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-lg text-xs font-bold hover:from-emerald-600 hover:to-green-700 transition-all border-2 border-black shadow-md hover:shadow-lg"
              >
                {getActionIcon(suggestion.action)}
                Apply
              </Button>
              <Button
                onClick={() => onDismissSuggestion(suggestion.id)}
                className="p-1 text-gray-400 hover:text-gray-600 glassmorphism backdrop-blur-sm rounded border border-gray-300 shadow-sm hover:shadow-md transition-all"
              >
                <React.Fragment>
                  {React.createElement(getIcon("X"), {
                    className: "h-3 w-3",
                  })}
                </React.Fragment>
              </Button>
            </div>
          </div>

          <p className="text-sm text-purple-800 font-medium mb-3">{suggestion.description}</p>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-purple-700 font-medium">
                Impact:{" "}
                <span className="font-bold">
                  {typeof suggestion.impact === "number" ? suggestion.impact.toFixed(1) : "0"}
                </span>
              </span>
              <span className="text-purple-700 font-medium">
                Priority: <span className="font-bold capitalize">{suggestion.priority}</span>
              </span>
            </div>
            {suggestion.data && (
              <div className="text-purple-700 font-medium">
                {suggestion.data.transactionCount && (
                  <span>{String(suggestion.data.transactionCount)} transactions</span>
                )}
                {suggestion.data.totalAmount && (
                  <span className="ml-2 font-bold">
                    {typeof suggestion.data.totalAmount === "number"
                      ? suggestion.data.totalAmount.toFixed(2)
                      : "0.00"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategorySuggestionsTab;
