import React from "react";

const CategoryAdvancedTab = ({ 
  dateRange, 
  onDateRangeChange, 
  dismissedSuggestions, 
  onUndismissSuggestion 
}) => {
  const dateRangeOptions = [
    { value: "7", label: "7 Days" },
    { value: "30", label: "30 Days" },
    { value: "90", label: "90 Days" },
    { value: "6months", label: "6 Months" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-white/60 to-purple-50/60 backdrop-blur-sm rounded-xl p-4 border-2 border-black shadow-lg">
        <h4 className="font-black text-gray-900 mb-4">DATE RANGE</h4>
        <div className="flex gap-2 flex-wrap">
          {dateRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onDateRangeChange(option.value)}
              className={`px-3 py-2 text-sm rounded-lg border-2 border-black shadow-md hover:shadow-lg transition-all font-bold ${
                dateRange === option.value
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                  : "bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-white/60 to-purple-50/60 backdrop-blur-sm rounded-xl p-4 border-2 border-black shadow-lg">
        <h4 className="font-black text-gray-900 mb-4">DISMISSED SUGGESTIONS</h4>
        {dismissedSuggestions.size === 0 ? (
          <p className="text-purple-800 font-medium text-sm">No dismissed suggestions</p>
        ) : (
          <div className="space-y-2">
            {Array.from(dismissedSuggestions).map((suggestionId) => (
              <div
                key={suggestionId}
                className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50/80 to-purple-50/80 backdrop-blur-sm rounded border border-gray-200 shadow-sm"
              >
                <span className="text-sm text-purple-800 font-medium">{suggestionId}</span>
                <button
                  onClick={() => onUndismissSuggestion(suggestionId)}
                  className="text-emerald-600 hover:text-emerald-800 text-sm font-bold border border-emerald-300 px-2 py-1 rounded hover:bg-emerald-50 transition-all"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryAdvancedTab;