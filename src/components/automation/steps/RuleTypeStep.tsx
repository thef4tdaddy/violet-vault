import React from "react";
import { getIcon } from "../../../utils";
import { RULE_TYPES } from "../../../utils/budgeting/autofunding";

interface RuleData {
  name: string;
  description: string;
  type: string;
}

interface RuleErrors {
  name?: string;
  type?: string;
}

interface RuleTypeStepProps {
  ruleData: RuleData;
  updateRuleData: (data: Partial<RuleData>) => void;
  errors: RuleErrors;
}

const RuleTypeStep: React.FC<RuleTypeStepProps> = ({ ruleData, updateRuleData, errors }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name *</label>
        <input
          type="text"
          value={ruleData.name}
          onChange={(e) => updateRuleData({ name: e.target.value })}
          placeholder="e.g., Monthly Rent Funding"
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? "border-red-300 ring-2 ring-red-200" : ""
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            {React.createElement(getIcon("AlertCircle"), {
              className: "h-4 w-4",
            })}
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={ruleData.description}
          onChange={(e) => updateRuleData({ description: e.target.value })}
          placeholder="Describe what this rule does and when it should run..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Rule Type *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              type: RULE_TYPES.FIXED_AMOUNT,
              icon: "DollarSign",
              title: "Fixed Amount",
              description: "Move a specific dollar amount to an envelope",
            },
            {
              type: RULE_TYPES.PERCENTAGE,
              icon: "Percent",
              title: "Percentage",
              description: "Move a percentage of available funds",
            },
            {
              type: RULE_TYPES.SPLIT_REMAINDER,
              icon: "Target",
              title: "Split Remainder",
              description: "Divide remaining funds across multiple envelopes",
            },
            {
              type: RULE_TYPES.PRIORITY_FILL,
              icon: "ArrowRight",
              title: "Priority Fill",
              description: "Fill envelope to target amount before others",
            },
          ].map(({ type, icon, title, description }) => (
            <div
              key={type}
              onClick={() => updateRuleData({ type })}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                ruleData.type === type
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                {React.createElement(getIcon(icon), {
                  className: `h-5 w-5 mt-0.5 ${
                    ruleData.type === type ? "text-blue-600" : "text-gray-600"
                  }`,
                })}
                <div>
                  <h4
                    className={`font-medium ${
                      ruleData.type === type ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    {title}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      ruleData.type === type ? "text-blue-700" : "text-gray-600"
                    }`}
                  >
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.type && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            {React.createElement(getIcon("AlertCircle"), {
              className: "h-4 w-4",
            })}
            {errors.type}
          </p>
        )}
      </div>
    </div>
  );
};

export default RuleTypeStep;
