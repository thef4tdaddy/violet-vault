import React from "react";
import { getIcon } from "../../../utils";
import { RULE_TYPES, TRIGGER_TYPES } from "../../../utils/budgeting/autofunding";

// Get display name for rule type
const getRuleTypeLabel = (type) => {
  const labels = {
    [RULE_TYPES.FIXED_AMOUNT]: "Fixed Amount",
    [RULE_TYPES.PERCENTAGE]: "Percentage",
    [RULE_TYPES.SPLIT_REMAINDER]: "Split Remainder",
    [RULE_TYPES.PRIORITY_FILL]: "Priority Fill",
  };
  return labels[type] || type;
};

// Get display name for trigger type
const getTriggerTypeLabel = (trigger) => {
  const labels = {
    [TRIGGER_TYPES.MANUAL]: "Manual",
    [TRIGGER_TYPES.INCOME_DETECTED]: "Income Detected",
    [TRIGGER_TYPES.MONTHLY]: "Monthly",
    [TRIGGER_TYPES.BIWEEKLY]: "Biweekly",
  };
  return labels[trigger] || trigger;
};

// Field row component
const FieldRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-blue-700">{label}:</span>
    <span className="font-medium text-blue-900">{value}</span>
  </div>
);

// Amount field component
const AmountField = ({ amount }) => {
  if (!amount || amount <= 0) return null;
  
  return <FieldRow label="Amount" value={`$${amount.toFixed(2)}`} />;
};

// Percentage field component
const PercentageField = ({ percentage }) => {
  if (!percentage || percentage <= 0) return null;
  
  return <FieldRow label="Percentage" value={`${percentage}%`} />;
};

// Single target field component
const SingleTargetField = ({ targetId, envelopes }) => {
  if (!targetId) return null;
  
  const targetName = envelopes.find((e) => e.id === targetId)?.name || "Unknown";
  return <FieldRow label="Target" value={targetName} />;
};

// Multiple targets field component
const MultipleTargetsField = ({ targetIds, envelopes }) => {
  if (!targetIds || targetIds.length === 0) return null;

  return (
    <div>
      <span className="text-blue-700">Targets:</span>
      <div className="mt-1">
        {targetIds.map((id) => {
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
  );
};

// Description section component
const DescriptionSection = ({ description }) => {
  if (!description) return null;

  return (
    <div className="mt-4 pt-4 border-t border-blue-200">
      <span className="text-blue-700 text-sm">Description:</span>
      <p className="text-blue-900 text-sm mt-1">{description}</p>
    </div>
  );
};

const ReviewStep = ({ ruleData, envelopes }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
          {React.createElement(getIcon("Settings"), {
            className: "h-5 w-5",
          })}
          Rule Summary
        </h4>

        <div className="space-y-3 text-sm">
          <FieldRow label="Name" value={ruleData.name} />
          <FieldRow label="Type" value={getRuleTypeLabel(ruleData.type)} />
          <FieldRow label="Trigger" value={getTriggerTypeLabel(ruleData.trigger)} />
          <FieldRow label="Priority" value={ruleData.priority} />
          
          <AmountField amount={ruleData.config.amount} />
          <PercentageField percentage={ruleData.config.percentage} />
          <SingleTargetField targetId={ruleData.config.targetId} envelopes={envelopes} />
          <MultipleTargetsField targetIds={ruleData.config.targetIds} envelopes={envelopes} />
        </div>

        <DescriptionSection description={ruleData.description} />
      </div>
    </div>
  );
};

export default ReviewStep;
