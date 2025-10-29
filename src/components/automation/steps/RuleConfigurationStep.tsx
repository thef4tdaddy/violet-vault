import { RULE_TYPES } from "../../../utils/budgeting/autofunding";
import FixedAmountConfig from "./config/FixedAmountConfig";
import PercentageConfig from "./config/PercentageConfig";
import SplitRemainderConfig from "./config/SplitRemainderConfig";
import PriorityFillConfig from "./config/PriorityFillConfig";

const RuleConfigurationStep = ({
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
