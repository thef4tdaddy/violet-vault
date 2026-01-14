import React from "react";
import { getIcon } from "../../../utils";
import { TRIGGER_TYPES } from "@/utils/domain/budgeting/autofunding";

interface RuleData {
  trigger: string;
  priority: number;
}

interface TriggerScheduleStepProps {
  ruleData: RuleData;
  updateRuleData: (updates: Partial<RuleData>) => void;
}

const TriggerScheduleStep = ({ ruleData, updateRuleData }: TriggerScheduleStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          When should this rule run? *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              type: TRIGGER_TYPES.MANUAL,
              icon: "Play",
              title: "Manual",
              description: 'Run when you click "Execute Rules"',
            },
            {
              type: TRIGGER_TYPES.INCOME_DETECTED,
              icon: "Plus",
              title: "Income Detected",
              description: "Run when new income is added",
            },
            {
              type: TRIGGER_TYPES.MONTHLY,
              icon: "Calendar",
              title: "Monthly",
              description: "Run automatically every month",
            },
            {
              type: TRIGGER_TYPES.BIWEEKLY,
              icon: "Clock",
              title: "Biweekly",
              description: "Run automatically every two weeks",
            },
          ].map(({ type, icon, title, description }) => (
            <div
              key={type}
              onClick={() => updateRuleData({ trigger: type })}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                ruleData.trigger === type
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                {React.createElement(getIcon(icon), {
                  className: `h-5 w-5 mt-0.5 ${
                    ruleData.trigger === type ? "text-blue-600" : "text-gray-600"
                  }`,
                })}
                <div>
                  <h4
                    className={`font-medium ${
                      ruleData.trigger === type ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    {title}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      ruleData.trigger === type ? "text-blue-700" : "text-gray-600"
                    }`}
                  >
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority (Lower = Higher Priority)
        </label>
        <input
          type="number"
          min="1"
          max="999"
          value={ruleData.priority}
          onChange={(e) =>
            updateRuleData({
              priority: parseInt(e.target.value) || 100,
            })
          }
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Rules with lower priority numbers execute first
        </p>
      </div>
    </div>
  );
};

export default TriggerScheduleStep;
