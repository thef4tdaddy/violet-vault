import React from "react";
import { Select } from "@/components/ui";

interface StepTwoProps {
  steps: string;
  severity: string;
  onStepsChange: (steps: string) => void;
  onSeverityChange: (severity: string) => void;
}

export const StepTwo: React.FC<StepTwoProps> = ({
  steps,
  severity,
  onStepsChange,
  onSeverityChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Steps to Reproduce (Optional)
        </label>
        <textarea
          value={steps}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onStepsChange(e.target.value)}
          placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
          className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
        <Select
          value={severity}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSeverityChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="low">Low - Minor issue</option>
          <option value="medium">Medium - Normal bug</option>
          <option value="high">High - Important issue</option>
          <option value="critical">Critical - Blocking</option>
        </Select>
      </div>
    </div>
  );
};
