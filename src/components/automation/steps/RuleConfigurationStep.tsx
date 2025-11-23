import { RULE_TYPES, type AutoFundingRule } from "@/utils/budgeting/autofunding";
import FixedAmountConfig from "./config/FixedAmountConfig";
import PercentageConfig from "./config/PercentageConfig";
import SplitRemainderConfig from "./config/SplitRemainderConfig";
import PriorityFillConfig from "./config/PriorityFillConfig";
import React from "react";

interface Envelope {
  id: string | number;
  name: string;
  currentBalance?: number;
  monthlyAmount?: number;
}

interface RuleConfigurationStepProps {
  ruleData: AutoFundingRule;
  updateConfig: (updates: Partial<AutoFundingRule["config"]>) => void;
  envelopes: Envelope[];
  toggleTargetEnvelope: (envelopeId: string | number) => void;
  errors: Record<string, string>;
}

const RuleConfigurationStep: React.FC<RuleConfigurationStepProps> = ({
  ruleData,
  updateConfig,
  envelopes,
  toggleTargetEnvelope,
  errors,
}) => {
  return (
    <div className="space-y-6">
      {ruleData.type === RULE_TYPES.FIXED_AMOUNT && (
        <FixedAmountConfig
          ruleData={ruleData}
          updateConfig={updateConfig}
          envelopes={envelopes}
          errors={errors}
        />
      )}

      {ruleData.type === RULE_TYPES.PERCENTAGE && (
        <PercentageConfig
          ruleData={ruleData}
          updateConfig={updateConfig}
          envelopes={envelopes}
          errors={errors}
        />
      )}

      {ruleData.type === RULE_TYPES.SPLIT_REMAINDER && (
        <SplitRemainderConfig
          ruleData={ruleData}
          envelopes={envelopes}
          toggleTargetEnvelope={toggleTargetEnvelope}
          errors={errors}
        />
      )}

      {ruleData.type === RULE_TYPES.PRIORITY_FILL && (
        <PriorityFillConfig
          ruleData={ruleData}
          updateConfig={updateConfig}
          envelopes={envelopes}
          errors={errors}
        />
      )}
    </div>
  );
};

export default RuleConfigurationStep;
