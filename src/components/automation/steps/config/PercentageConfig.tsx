import React from "react";
import { Select } from "@/components/ui";
import { getIcon } from "../../../../utils";
import type { AutoFundingRule } from "@/utils/budgeting/autofunding";

interface Envelope {
  id: string | number;
  name: string;
  currentBalance?: number;
}

interface PercentageConfigProps {
  ruleData: AutoFundingRule;
  updateConfig: (updates: Partial<AutoFundingRule["config"]>) => void;
  envelopes: Envelope[];
  errors: Record<string, string>;
}

const PercentageConfig: React.FC<PercentageConfigProps> = ({
  ruleData,
  updateConfig,
  envelopes,
  errors,
}) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Percentage to Transfer *
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={ruleData.config.percentage}
            onChange={(e) =>
              updateConfig({
                percentage: parseFloat(e.target.value) || 0,
              })
            }
            className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.percentage ? "border-red-300 ring-2 ring-red-200" : ""
            }`}
          />
          <span className="text-gray-500">%</span>
        </div>
        {errors.percentage && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            {React.createElement(getIcon("AlertCircle"), {
              className: "h-4 w-4",
            })}
            {errors.percentage}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Target Envelope *</label>
        <Select
          value={ruleData.config.targetId || ""}
          onChange={(e) => updateConfig({ targetId: e.target.value })}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.targetId ? "border-red-300 ring-2 ring-red-200" : ""
          }`}
        >
          <option value="">Select envelope...</option>
          {envelopes.map((envelope: Envelope) => (
            <option key={envelope.id} value={envelope.id}>
              {envelope.name} ($
              {envelope.currentBalance?.toFixed(2) || "0.00"})
            </option>
          ))}
        </Select>
        {errors.targetId && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            {React.createElement(getIcon("AlertCircle"), {
              className: "h-4 w-4",
            })}
            {errors.targetId}
          </p>
        )}
      </div>
    </>
  );
};

export default PercentageConfig;
