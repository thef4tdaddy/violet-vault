import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import { RULE_TYPES, TRIGGER_TYPES } from "@/utils/budgeting/autofunding";

/**
 * Helper functions for rule types and triggers
 */
export const getRuleTypeIcon = (type) => {
  switch (type) {
    case RULE_TYPES.FIXED_AMOUNT:
      return "DollarSign";
    case RULE_TYPES.PERCENTAGE:
      return "Percent";
    case RULE_TYPES.SPLIT_REMAINDER:
      return "Target";
    case RULE_TYPES.PRIORITY_FILL:
      return "ArrowRight";
    default:
      return "Settings";
  }
};

export const getRuleTypeColor = (type) => {
  switch (type) {
    case RULE_TYPES.FIXED_AMOUNT:
      return "text-green-600 bg-green-100";
    case RULE_TYPES.PERCENTAGE:
      return "text-blue-600 bg-blue-100";
    case RULE_TYPES.SPLIT_REMAINDER:
      return "text-purple-600 bg-purple-100";
    case RULE_TYPES.PRIORITY_FILL:
      return "text-orange-600 bg-orange-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const formatTriggerType = (trigger) => {
  switch (trigger) {
    case TRIGGER_TYPES.MANUAL:
      return "Manual";
    case TRIGGER_TYPES.INCOME_DETECTED:
      return "Income Detected";
    case TRIGGER_TYPES.MONTHLY:
      return "Monthly";
    case TRIGGER_TYPES.BIWEEKLY:
      return "Biweekly";
    case TRIGGER_TYPES.WEEKLY:
      return "Weekly";
    case TRIGGER_TYPES.PAYDAY:
      return "Payday";
    default:
      return "Unknown";
  }
};

export const formatRuleType = (type) => {
  switch (type) {
    case RULE_TYPES.FIXED_AMOUNT:
      return "Fixed Amount";
    case RULE_TYPES.PERCENTAGE:
      return "Percentage";
    case RULE_TYPES.SPLIT_REMAINDER:
      return "Split Remainder";
    case RULE_TYPES.PRIORITY_FILL:
      return "Priority Fill";
    default:
      return "Unknown";
  }
};

/**
 * Empty state component when no rules exist
 */
export const EmptyRulesList = () => {
  return (
    <div className="text-center py-12">
      {React.createElement(getIcon("Settings"), {
        className: "h-12 w-12 text-gray-400 mx-auto mb-4",
      })}
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Auto-Funding Rules</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        Create your first rule to automate envelope funding based on your preferences and triggers.
      </p>
    </div>
  );
};

/**
 * Rule card component
 */
export const RuleCard = ({ rule, onToggleRule, onEditRule, onDeleteRule }) => {
  const iconName = getRuleTypeIcon(rule.type);
  const colorClasses = getRuleTypeColor(rule.type);

  return (
    <div
      key={rule.id}
      className={`p-4 border rounded-lg transition-all ${
        rule.enabled ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${colorClasses}`}>
            {React.createElement(getIcon(iconName), {
              className: "h-5 w-5",
            })}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h4 className={`font-medium ${rule.enabled ? "text-gray-900" : "text-gray-500"}`}>
                {rule.name}
              </h4>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  rule.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {rule.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Type: {formatRuleType(rule.type)}</span>
              <span>Trigger: {formatTriggerType(rule.trigger)}</span>
              <span>Priority: {rule.priority || 100}</span>
            </div>
            {rule.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{rule.description}</p>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Executed {rule.executionCount || 0} times
              {rule.lastExecuted && (
                <span className="ml-2">
                  Last: {new Date(rule.lastExecuted).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            onClick={() => onToggleRule(rule.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title={rule.enabled ? "Disable rule" : "Enable rule"}
          >
            {rule.enabled
              ? React.createElement(getIcon("Eye"), {
                  className: "h-4 w-4",
                })
              : React.createElement(getIcon("EyeOff"), {
                  className: "h-4 w-4",
                })}
          </Button>
          <Button
            onClick={() => onEditRule(rule)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
            title="Edit rule"
          >
            {React.createElement(getIcon("Edit3"), {
              className: "h-4 w-4",
            })}
          </Button>
          <Button
            onClick={() => onDeleteRule(rule.id)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
            title="Delete rule"
          >
            {React.createElement(getIcon("Trash2"), {
              className: "h-4 w-4",
            })}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Create rule button component
 */
export const CreateRuleButton = ({ onCreateRule }) => {
  return (
    <div className="text-center py-4">
      <Button
        onClick={onCreateRule}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium border-2 border-black"
      >
        {React.createElement(getIcon("Plus"), { className: "h-5 w-5" })}
        Create New Rule
      </Button>
    </div>
  );
};

/**
 * Execute all rules button component
 */
export const ExecuteAllButton = ({ onExecuteRules, isExecuting, hasActiveRules }) => {
  if (!hasActiveRules) return null;

  return (
    <div className="text-center py-2">
      <Button
        onClick={onExecuteRules}
        disabled={isExecuting}
        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium border-2 border-black"
      >
        {React.createElement(getIcon("Play"), { className: "h-4 w-4" })}
        {isExecuting ? "Executing..." : "Execute All Rules"}
      </Button>
    </div>
  );
};
