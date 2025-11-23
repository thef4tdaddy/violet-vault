import React from "react";
import { Select } from "@/components/ui";
import { getIcon } from "../../../../utils";
import type { AutoFundingRule } from "@/utils/budgeting/autofunding";

interface Envelope {
  id: string | number;
  name: string;
  currentBalance?: number;
  monthlyAmount?: number;
}

interface PriorityFillConfigProps {
  ruleData: AutoFundingRule;
  updateConfig: (updates: Partial<AutoFundingRule["config"]>) => void;
  envelopes: Envelope[];
  errors: Record<string, string>;
}

const PriorityFillConfig: React.FC<PriorityFillConfigProps> = ({ ruleData, updateConfig, envelopes, errors }) => {
  return (
    <>
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
          {envelopes.map((envelope: Envelope) => {
            const remaining = Math.max(
              0,
              (envelope.monthlyAmount || 0) - (envelope.currentBalance || 0)
            );
            return (
              <option key={envelope.id} value={envelope.id}>
                {envelope.name} - Need ${remaining.toFixed(2)} to fill (
                {envelope.currentBalance?.toFixed(2) || "0.00"} / $
                {envelope.monthlyAmount?.toFixed(2) || "0.00"})
              </option>
            );
          })}
        </Select>
        {errors.targetId && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            {React.createElement(getIcon("AlertCircle"), {
              className: "h-4 w-4",
            })}
            {errors.targetId}
          </p>
        )}
        <p className="text-sm text-gray-600 mt-2">
          This rule will fill the selected envelope to its monthly target amount before other rules
          execute.
        </p>
      </div>

      {ruleData.config.targetId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          {(() => {
            const envelope = envelopes.find((e: Envelope) => e.id === ruleData.config.targetId);
            if (!envelope) return null;

            const current = envelope.currentBalance || 0;
            const target = envelope.monthlyAmount || 0;
            const needed = Math.max(0, target - current);
            const fillPercentage = target > 0 ? (current / target) * 100 : 0;

            return (
              <>
                <h4 className="font-medium text-blue-900 mb-2">Envelope Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Current Balance:</span>
                    <span className="font-medium">${current.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Monthly Target:</span>
                    <span className="font-medium">${target.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Amount Needed:</span>
                    <span className="font-medium text-orange-600">${needed.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Fill Progress:</span>
                    <span className="font-medium">{fillPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </>
  );
};

export default PriorityFillConfig;
