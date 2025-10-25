import React from "react";

interface StepThreeProps {
  expected: string;
  actual: string;
  onExpectedChange: (expected: string) => void;
  onActualChange: (actual: string) => void;
}

export const StepThree: React.FC<StepThreeProps> = ({
  expected,
  actual,
  onExpectedChange,
  onActualChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expected Behavior (Optional)
        </label>
        <textarea
          value={expected}
          onChange={(e) => onExpectedChange(e.target.value)}
          placeholder="What should have happened?"
          className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Actual Behavior (Optional)
        </label>
        <textarea
          value={actual}
          onChange={(e) => onActualChange(e.target.value)}
          placeholder="What actually happened?"
          className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          rows={2}
        />
      </div>
    </div>
  );
};
