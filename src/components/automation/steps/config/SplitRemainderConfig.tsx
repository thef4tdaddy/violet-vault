import React from "react";
import { getIcon } from "../../../../utils";
import { Checkbox } from "@/components/ui";
import type { AutoFundingRule } from "@/utils/budgeting/autofunding";

interface Envelope {
  id: string | number;
  name: string;
  currentBalance?: number;
  monthlyAmount?: number;
}

interface SplitRemainderConfigProps {
  ruleData: AutoFundingRule;
  envelopes: Envelope[];
  toggleTargetEnvelope: (envelopeId: string | number) => void;
  errors: Record<string, string>;
}

const SplitRemainderConfig: React.FC<SplitRemainderConfigProps> = ({
  ruleData,
  envelopes,
  toggleTargetEnvelope,
  errors,
}) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Target Envelopes *</label>
        <p className="text-sm text-gray-600 mb-4">
          Select multiple envelopes to split the remaining funds between:
        </p>
        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
          {envelopes.map((envelope: Envelope) => {
            const isSelected = ruleData.config.targetIds?.includes(String(envelope.id)) || false;
            return (
              <div
                key={envelope.id}
                onClick={() => toggleTargetEnvelope(envelope.id)}
                className={`p-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                  isSelected ? "bg-blue-50 border-blue-200" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleTargetEnvelope(envelope.id)}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{envelope.name}</p>
                      <p className="text-sm text-gray-600">
                        Current: ${envelope.currentBalance?.toFixed(2) || "0.00"}
                        {envelope.monthlyAmount && (
                          <span className="text-gray-500 ml-2">
                            / ${envelope.monthlyAmount.toFixed(2)} monthly
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {errors.targetIds && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            {React.createElement(getIcon("AlertCircle"), {
              className: "h-4 w-4",
            })}
            {errors.targetIds}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Funds will be split equally among selected envelopes
        </p>
      </div>
    </>
  );
};

export default SplitRemainderConfig;
