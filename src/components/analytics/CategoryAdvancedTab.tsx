import React from "react";
import { Button } from "@/components/ui";

interface CategoryAdvancedTabProps {
  dateRange: string;
  onDateRangeChange: (dateRange: string) => void;
  dismissedSuggestions: string[];
  onUndismissSuggestion: (suggestionId: string) => void;
}

const CategoryAdvancedTab = ({
  dateRange,
  onDateRangeChange,
  dismissedSuggestions,
  onUndismissSuggestion,
}: CategoryAdvancedTabProps) => {
  const dateRangeOptions = [
    { value: "7", label: "7 Days" },
    { value: "30", label: "30 Days" },
    { value: "90", label: "90 Days" },
    { value: "6months", label: "6 Months" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-white/60 to-purple-50/60 backdrop-blur-sm rounded-xl p-4 border-2 border-black shadow-lg">
        <h4 className="font-black text-gray-900 mb-4">DATE RANGE</h4>
        <div className="flex gap-2 flex-wrap">
          {dateRangeOptions.map((option) => (
            <Button
              key={option.value as string}
              onClick={() => onDateRangeChange(option.value)}
              className={`px-3 py-2 text-sm rounded-lg border-2 border-black shadow-md hover:shadow-lg transition-all font-bold ${
                dateRange === option.value
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                  : "bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80"
              }`}
            >
              {option.label as React.ReactNode}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-linear-to-r from-white/60 to-purple-50/60 backdrop-blur-sm rounded-xl p-4 border-2 border-black shadow-lg">
        <h4 className="font-black text-gray-900 mb-4">DISMISSED SUGGESTIONS</h4>
        {dismissedSuggestions.length === 0 ? (
          <p className="text-purple-800 font-medium text-sm">No dismissed suggestions</p>
        ) : (
          <div className="space-y-2">
            {Array.from(dismissedSuggestions).map((suggestionId: string) => (
              <div
                key={suggestionId as string}
                className="flex items-center justify-between p-2 bg-linear-to-r from-gray-50/80 to-purple-50/80 backdrop-blur-sm rounded border border-gray-200 shadow-sm"
              >
                <span className="text-sm text-purple-800 font-medium">{String(suggestionId)}</span>
                <Button
                  onClick={() => onUndismissSuggestion(suggestionId)}
                  className="text-emerald-600 hover:text-emerald-800 text-sm font-bold border border-emerald-300 px-2 py-1 rounded hover:bg-emerald-50 transition-all"
                >
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryAdvancedTab;
