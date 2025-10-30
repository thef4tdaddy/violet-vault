import { EmptyRulesList, RuleCard, CreateRuleButton, ExecuteAllButton } from "./RulesTabComponents";

const RulesTab = ({
  rules,
  onCreateRule,
  onEditRule,
  onDeleteRule,
  onToggleRule,
  onExecuteRules,
  isExecuting,
}) => {
  const hasActiveRules = rules.filter((r) => r.enabled).length > 0;

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
          {rules.map((rule) => (
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
