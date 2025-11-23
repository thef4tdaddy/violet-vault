import type { AutoFundingRule } from "@/utils/budgeting/autofunding/rules";
import { EmptyRulesList, RuleCard, CreateRuleButton, ExecuteAllButton } from "./RulesTabComponents";

interface RulesTabProps {
  rules: AutoFundingRule[];
  onCreateRule: () => void;
  onEditRule: (rule: AutoFundingRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string) => void;
  onExecuteRules: () => void;
  isExecuting: boolean;
}

const RulesTab = ({
  rules,
  onCreateRule,
  onEditRule,
  onDeleteRule,
  onToggleRule,
  onExecuteRules,
  isExecuting,
}: RulesTabProps) => {
  const hasActiveRules = rules.filter((r: AutoFundingRule) => r.enabled).length > 0;

  return (
    <div className="space-y-4">
      <CreateRuleButton onCreateRule={onCreateRule} />

      <ExecuteAllButton
        onExecuteRules={onExecuteRules}
        isExecuting={isExecuting}
        hasActiveRules={hasActiveRules}
      />

      {rules.length === 0 ? (
        <EmptyRulesList />
      ) : (
        <div className="space-y-3">
          {rules.map((rule: AutoFundingRule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggleRule={onToggleRule}
              onEditRule={onEditRule}
              onDeleteRule={onDeleteRule}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RulesTab;
