import React from "react";
import { Settings } from "lucide-react";
import { RULE_TYPES, TRIGGER_TYPES } from "../../../utils/budgeting/autofunding";

const ReviewStep = ({ ruleData, envelopes }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Rule Summary
        </h4>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Name:</span>
            <span className="font-medium text-blue-900">{ruleData.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-blue-700">Type:</span>
            <span className="font-medium text-blue-900">
              {ruleData.type === RULE_TYPES.FIXED_AMOUNT && "Fixed Amount"}
              {ruleData.type === RULE_TYPES.PERCENTAGE && "Percentage"}
              {ruleData.type === RULE_TYPES.SPLIT_REMAINDER && "Split Remainder"}
              {ruleData.type === RULE_TYPES.PRIORITY_FILL && "Priority Fill"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-blue-700">Trigger:</span>
            <span className="font-medium text-blue-900">
              {ruleData.trigger === TRIGGER_TYPES.MANUAL && "Manual"}
              {ruleData.trigger === TRIGGER_TYPES.INCOME_DETECTED && "Income Detected"}
              {ruleData.trigger === TRIGGER_TYPES.MONTHLY && "Monthly"}
              {ruleData.trigger === TRIGGER_TYPES.BIWEEKLY && "Biweekly"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-blue-700">Priority:</span>
            <span className="font-medium text-blue-900">{ruleData.priority}</span>
          </div>

          {ruleData.config.amount > 0 && (
            <div className="flex justify-between">
              <span className="text-blue-700">Amount:</span>
              <span className="font-medium text-blue-900">
                ${ruleData.config.amount.toFixed(2)}
              </span>
            </div>
          )}

          {ruleData.config.percentage > 0 && (
            <div className="flex justify-between">
              <span className="text-blue-700">Percentage:</span>
              <span className="font-medium text-blue-900">{ruleData.config.percentage}%</span>
            </div>
          )}

          {ruleData.config.targetId && (
            <div className="flex justify-between">
              <span className="text-blue-700">Target:</span>
              <span className="font-medium text-blue-900">
                {envelopes.find((e) => e.id === ruleData.config.targetId)?.name || "Unknown"}
              </span>
            </div>
          )}

          {ruleData.config.targetIds && ruleData.config.targetIds.length > 0 && (
            <div>
              <span className="text-blue-700">Targets:</span>
              <div className="mt-1">
                {ruleData.config.targetIds.map((id) => {
                  const envelope = envelopes.find((e) => e.id === id);
                  return envelope ? (
                    <span
                      key={id}
                      className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1 mb-1"
                    >
                      {envelope.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {ruleData.description && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <span className="text-blue-700 text-sm">Description:</span>
            <p className="text-blue-900 text-sm mt-1">{ruleData.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewStep;
