import React from "react";
import { getIcon } from "../../../utils";
import { RULE_TYPES, TRIGGER_TYPES } from "@/utils/budgeting/autofunding/rules";
import type { Envelope } from "../../../types/finance";
import type { AutoFundingRule } from "@/utils/budgeting/autofunding/rules";

// Get display name for rule type
const getRuleTypeLabel = (type: string): string => {
  const labels = {
    [RULE_TYPES.FIXED_AMOUNT]: "Fixed Amount",
    [RULE_TYPES.PERCENTAGE]: "Percentage",
    [RULE_TYPES.SPLIT_REMAINDER]: "Split Remainder",
    [RULE_TYPES.PRIORITY_FILL]: "Priority Fill",
  };
  return labels[type] || type;
};

// Get display name for trigger type
const getTriggerTypeLabel = (trigger: string): string => {
  const labels = {
    [TRIGGER_TYPES.MANUAL]: "Manual",
    [TRIGGER_TYPES.INCOME_DETECTED]: "Income Detected",
    [TRIGGER_TYPES.MONTHLY]: "Monthly",
    [TRIGGER_TYPES.BIWEEKLY]: "Biweekly",
  };
  return labels[trigger] || trigger;
};

// Field row component
interface FieldRowProps {
  label: string;
  value: string | number;
}

const FieldRow = ({ label, value }: FieldRowProps) => (
  <div className="flex justify-between">
    <span className="text-blue-700">{label}:</span>
    <span className="font-medium text-blue-900">{value}</span>
  </div>
);

// Amount field component
interface AmountFieldProps {
  amount: number | null | undefined;
}

const AmountField = ({ amount }: AmountFieldProps) => {
  if (!amount || amount <= 0) return null;

  return <FieldRow label="Amount" value={`$${amount.toFixed(2)}`} />;
};

// Percentage field component
interface PercentageFieldProps {
  percentage: number | null | undefined;
}

const PercentageField = ({ percentage }: PercentageFieldProps) => {
  if (!percentage || percentage <= 0) return null;

  return <FieldRow label="Percentage" value={`${percentage}%`} />;
};

// Single target field component
interface SingleTargetFieldProps {
  targetId: string | null | undefined;
  envelopes: Envelope[];
}

const SingleTargetField = ({ targetId, envelopes }: SingleTargetFieldProps) => {
  if (!targetId) return null;

  const targetName = envelopes.find((e: Envelope) => e.id === targetId)?.name || "Unknown";
  return <FieldRow label="Target" value={targetName} />;
};

// Multiple targets field component
interface MultipleTargetsFieldProps {
  targetIds: string[] | null | undefined;
  envelopes: Envelope[];
}

const MultipleTargetsField = ({ targetIds, envelopes }: MultipleTargetsFieldProps) => {
  if (!targetIds || targetIds.length === 0) return null;

  return (
    <div>
      <span className="text-blue-700">Targets:</span>
      <div className="mt-1">
        {targetIds.map((id: string) => {
          const envelope = envelopes.find((e: Envelope) => e.id === id);
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
interface DescriptionSectionProps {
  description: string | null | undefined;
}

const DescriptionSection = ({ description }: DescriptionSectionProps) => {
  if (!description) return null;

  return (
    <div className="mt-4 pt-4 border-t border-blue-200">
      <span className="text-blue-700 text-sm">Description:</span>
      <p className="text-blue-900 text-sm mt-1">{description}</p>
    </div>
  );
};

interface ReviewStepProps {
  ruleData: AutoFundingRule;
  envelopes: Envelope[];
}

const ReviewStep = ({ ruleData, envelopes }: ReviewStepProps) => {
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
