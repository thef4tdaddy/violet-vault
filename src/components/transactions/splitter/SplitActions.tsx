import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

const SplitActions = ({ totals, hasUnsavedChanges, isSaving, errors = [], onSave, onCancel }) => {
  const { isValid, isOverAllocated, remaining } = totals;

  const getValidationMessage = () => {
    if (isValid) return null;
    if (isOverAllocated) {
      return `Over-allocated by $${Math.abs(remaining).toFixed(2)}`;
    }
    return `Under-allocated by $${Math.abs(remaining).toFixed(2)}`;
  };

  const canSave = isValid && hasUnsavedChanges && !isSaving;

  return (
    <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/80 backdrop-blur-sm border-t-2 border-black px-6 py-4">
      {/* Validation Message */}
      {(!isValid || errors.length > 0) && (
        <div className="mb-4 p-3 bg-gradient-to-r from-orange-50/80 to-red-50/80 backdrop-blur-sm border-2 border-orange-300 rounded-xl shadow-md">
          {getValidationMessage() && (
            <div className="flex items-center">
              {React.createElement(getIcon("AlertCircle"), {
                className: "h-5 w-5 text-orange-600 mr-2",
              })}
              <span className="text-sm font-bold text-orange-800">{getValidationMessage()}</span>
            </div>
          )}
          {errors.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-xs font-semibold text-red-600 space-y-1">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-purple-800">
          {hasUnsavedChanges ? (
            <span className="font-bold">You have unsaved changes</span>
          ) : (
            <span className="font-medium">All changes saved</span>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-200/80 rounded-lg hover:bg-gray-300/80 transition-all border-2 border-black shadow-md hover:shadow-lg font-bold"
          >
            {React.createElement(getIcon("X"), { className: "h-4 w-4" })}
            Cancel
          </Button>

          <Button
            onClick={onSave}
            disabled={!canSave}
            className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-all border-2 border-black shadow-md hover:shadow-lg font-black ${
              canSave
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isSaving
              ? React.createElement(getIcon("RefreshCw"), {
                  className: "h-4 w-4 animate-spin",
                })
              : React.createElement(getIcon("Save"), { className: "h-4 w-4" })}
            {isSaving ? "Saving..." : "Save Split"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SplitActions;
