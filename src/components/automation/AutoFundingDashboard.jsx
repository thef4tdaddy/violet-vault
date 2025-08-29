import React, { useState, useEffect } from "react";
import { useConfirm } from "../../hooks/common/useConfirm";
import { globalToast } from "../../stores/ui/toastStore";
import {
  Plus,
  Play,
  Pause,
  Settings,
  History,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Target,
  DollarSign,
  Percent,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  RotateCcw,
} from "lucide-react";
import AutoFundingRuleBuilder from "./AutoFundingRuleBuilder";
import {
  autoFundingEngine,
  RULE_TYPES,
  TRIGGER_TYPES,
} from "../../utils/budgeting/autoFundingEngine";
import { useBudgetStore } from "../../stores/ui/uiStore";
import logger from "../../utils/common/logger";

const AutoFundingDashboard = ({ isOpen, onClose }) => {
  const budget = useBudgetStore();
  const confirm = useConfirm();
  const [rules, setRules] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [activeTab, setActiveTab] = useState("rules"); // 'rules' | 'history'
  const [showExecutionDetails, setShowExecutionDetails] = useState(null);

  // Load rules and history on component mount
  useEffect(() => {
    loadRulesAndHistory();
  }, []);

  const loadRulesAndHistory = () => {
    try {
      setRules(autoFundingEngine.getRules());
      setExecutionHistory(autoFundingEngine.getExecutionHistory(20));
    } catch (error) {
      logger.error("Failed to load auto-funding data", error);
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setShowRuleBuilder(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setShowRuleBuilder(true);
  };

  const handleSaveRule = async (ruleData) => {
    try {
      if (editingRule) {
        autoFundingEngine.updateRule(editingRule.id, ruleData);
      } else {
        autoFundingEngine.addRule(ruleData);
      }
      loadRulesAndHistory();
      setShowRuleBuilder(false);
      setEditingRule(null);
    } catch (error) {
      logger.error("Failed to save rule", error);
      globalToast.showError(
        "Failed to save rule: " + error.message,
        "Rule Save Failed",
      );
    }
  };

  const handleDeleteRule = async (ruleId) => {
    const confirmed = await confirm({
      title: "Delete Auto-Funding Rule",
      message:
        "Are you sure you want to delete this rule? This action cannot be undone.",
      confirmLabel: "Delete Rule",
      cancelLabel: "Cancel",
      destructive: true,
    });

    if (confirmed) {
      try {
        autoFundingEngine.deleteRule(ruleId);
        loadRulesAndHistory();
      } catch (error) {
        logger.error("Failed to delete rule", error);
        globalToast.showError(
          "Failed to delete rule: " + error.message,
          "Delete Failed",
        );
      }
    }
  };

  const handleToggleRule = (ruleId) => {
    try {
      const rule = autoFundingEngine.rules.get(ruleId);
      if (rule) {
        autoFundingEngine.updateRule(ruleId, { enabled: !rule.enabled });
        loadRulesAndHistory();
      }
    } catch (error) {
      logger.error("Failed to toggle rule", error);
    }
  };

  const handleExecuteRules = async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    try {
      const context = {
        trigger: TRIGGER_TYPES.MANUAL,
        currentDate: new Date().toISOString(),
        data: {
          envelopes: budget.envelopes || [],
          unassignedCash: budget.unassignedCash || 0,
          transactions: budget.allTransactions || [],
        },
      };

      const result = await autoFundingEngine.executeRules(context, budget);

      if (result.success) {
        const totalFunded = result.execution.totalFunded || 0;
        const rulesExecuted = result.execution.rulesExecuted || 0;

        if (totalFunded > 0) {
          globalToast.showSuccess(
            `Successfully executed ${rulesExecuted} rules and funded $${totalFunded.toFixed(2)} total!`,
            "Auto-Funding Complete",
          );
        } else {
          globalToast.showWarning(
            "Rules executed but no funds were transferred. Check your rules and available balances.",
            "No Funds Transferred",
          );
        }
      } else {
        globalToast.showError(
          "Failed to execute rules: " + result.error,
          "Execution Failed",
        );
      }

      loadRulesAndHistory();
    } catch (error) {
      logger.error("Failed to execute rules", error);
      globalToast.showError(
        "Failed to execute rules: " + error.message,
        "Execution Failed",
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const getRuleTypeIcon = (type) => {
    switch (type) {
      case RULE_TYPES.FIXED_AMOUNT:
        return DollarSign;
      case RULE_TYPES.PERCENTAGE:
        return Percent;
      case RULE_TYPES.SPLIT_REMAINDER:
        return Target;
      case RULE_TYPES.PRIORITY_FILL:
        return ArrowRight;
      default:
        return Settings;
    }
  };

  const getRuleTypeColor = (type) => {
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

  const formatTriggerType = (trigger) => {
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

  const formatRuleType = (type) => {
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Settings className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Auto-Funding Rules
                    </h3>
                    <p className="text-sm text-gray-600">
                      Automate your envelope funding with smart rules
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExecuteRules}
                    disabled={
                      isExecuting || rules.filter((r) => r.enabled).length === 0
                    }
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isExecuting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Execute Rules
                      </>
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <Plus className="h-6 w-6 rotate-45" />
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Total Rules</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {rules.length}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Active Rules</span>
                  </div>
                  <p className="text-lg font-semibold text-green-900 mt-1">
                    {rules.filter((r) => r.enabled).length}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600">
                      Available Cash
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-blue-900 mt-1">
                    ${(budget.unassignedCash || 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-600">
                      Last Execution
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-purple-900 mt-1">
                    {executionHistory.length > 0
                      ? new Date(
                          executionHistory[0].executedAt,
                        ).toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("rules")}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "rules"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Rules ({rules.length})
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "history"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Execution History ({executionHistory.length})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "rules" && (
                <div className="space-y-4">
                  {/* Create Rule Button */}
                  <div className="text-center py-4">
                    <button
                      onClick={handleCreateRule}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="h-5 w-5" />
                      Create New Rule
                    </button>
                  </div>

                  {/* Rules List */}
                  {rules.length === 0 ? (
                    <div className="text-center py-12">
                      <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No Rules Created
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Create your first auto-funding rule to automate envelope
                        management
                      </p>
                      <button
                        onClick={handleCreateRule}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                        Get Started
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rules.map((rule) => {
                        const Icon = getRuleTypeIcon(rule.type);
                        const colorClass = getRuleTypeColor(rule.type);

                        return (
                          <div
                            key={rule.id}
                            className={`border rounded-lg p-4 ${
                              rule.enabled
                                ? "border-gray-200 bg-white"
                                : "border-gray-100 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${colorClass}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4
                                    className={`font-medium ${
                                      rule.enabled
                                        ? "text-gray-900"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {rule.name}
                                  </h4>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                    <span>{formatRuleType(rule.type)}</span>
                                    <span>•</span>
                                    <span>
                                      {formatTriggerType(rule.trigger)}
                                    </span>
                                    <span>•</span>
                                    <span>Priority: {rule.priority}</span>
                                    {rule.executionCount > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>
                                          Executed {rule.executionCount} times
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleRule(rule.id)}
                                  className={`p-2 rounded-lg ${
                                    rule.enabled
                                      ? "text-green-600 hover:bg-green-50"
                                      : "text-gray-400 hover:bg-gray-100"
                                  }`}
                                  title={
                                    rule.enabled
                                      ? "Disable rule"
                                      : "Enable rule"
                                  }
                                >
                                  {rule.enabled ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleEditRule(rule)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Edit rule"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Delete rule"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {rule.description && (
                              <p className="text-sm text-gray-600 mt-2 ml-11">
                                {rule.description}
                              </p>
                            )}

                            {/* Rule Details */}
                            <div className="ml-11 mt-3 flex flex-wrap items-center gap-2">
                              {rule.config.amount > 0 && (
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                  <DollarSign className="h-3 w-3" />$
                                  {rule.config.amount.toFixed(2)}
                                </span>
                              )}
                              {rule.config.percentage > 0 && (
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  <Percent className="h-3 w-3" />
                                  {rule.config.percentage}%
                                </span>
                              )}
                              {rule.config.targetId && (
                                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                  <Target className="h-3 w-3" />
                                  {budget.envelopes?.find(
                                    (e) => e.id === rule.config.targetId,
                                  )?.name || "Unknown"}
                                </span>
                              )}
                              {rule.config.targetIds &&
                                rule.config.targetIds.length > 0 && (
                                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                                    <Target className="h-3 w-3" />
                                    {rule.config.targetIds.length} envelopes
                                  </span>
                                )}
                              {rule.lastExecuted && (
                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                  <Clock className="h-3 w-3" />
                                  Last:{" "}
                                  {new Date(
                                    rule.lastExecuted,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-4">
                  {executionHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No Execution History
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Rule executions will appear here once you start running
                        your auto-funding rules
                      </p>
                      <button
                        onClick={handleExecuteRules}
                        disabled={rules.filter((r) => r.enabled).length === 0}
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                      >
                        <Play className="h-4 w-4" />
                        Execute Rules Now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {executionHistory.map((execution, index) => (
                        <div
                          key={execution.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  execution.totalFunded > 0
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {execution.totalFunded > 0 ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Execution #{executionHistory.length - index}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <span>
                                    {new Date(
                                      execution.executedAt,
                                    ).toLocaleString()}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {formatTriggerType(execution.trigger)}{" "}
                                    trigger
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {execution.rulesExecuted} rules executed
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <p
                                className={`text-lg font-semibold ${
                                  execution.totalFunded > 0
                                    ? "text-green-600"
                                    : "text-gray-600"
                                }`}
                              >
                                ${(execution.totalFunded || 0).toFixed(2)}
                              </p>
                              <button
                                onClick={() =>
                                  setShowExecutionDetails(
                                    showExecutionDetails === execution.id
                                      ? null
                                      : execution.id,
                                  )
                                }
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                {showExecutionDetails === execution.id
                                  ? "Hide Details"
                                  : "Show Details"}
                              </button>
                            </div>
                          </div>

                          {showExecutionDetails === execution.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="space-y-2">
                                {execution.results?.map(
                                  (result, resultIndex) => (
                                    <div
                                      key={resultIndex}
                                      className={`p-3 rounded-lg ${
                                        result.success
                                          ? "bg-green-50 border border-green-200"
                                          : "bg-red-50 border border-red-200"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h5
                                            className={`font-medium ${
                                              result.success
                                                ? "text-green-900"
                                                : "text-red-900"
                                            }`}
                                          >
                                            {result.ruleName}
                                          </h5>
                                          {result.success ? (
                                            <p className="text-sm text-green-700 mt-1">
                                              Funded $
                                              {(result.amount || 0).toFixed(2)}
                                              {result.targetEnvelopes &&
                                                result.targetEnvelopes.length >
                                                  0 && (
                                                  <span>
                                                    {" "}
                                                    to{" "}
                                                    {
                                                      result.targetEnvelopes
                                                        .length
                                                    }{" "}
                                                    envelope
                                                    {result.targetEnvelopes
                                                      .length > 1
                                                      ? "s"
                                                      : ""}
                                                  </span>
                                                )}
                                            </p>
                                          ) : (
                                            <p className="text-sm text-red-700 mt-1">
                                              {result.error}
                                            </p>
                                          )}
                                        </div>
                                        <div
                                          className={`text-sm font-medium ${
                                            result.success
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {result.success
                                            ? "Success"
                                            : "Failed"}
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rule Builder Modal */}
      <AutoFundingRuleBuilder
        isOpen={showRuleBuilder}
        onClose={() => {
          setShowRuleBuilder(false);
          setEditingRule(null);
        }}
        envelopes={budget.envelopes || []}
        unassignedCash={budget.unassignedCash || 0}
        onSaveRule={handleSaveRule}
        editingRule={editingRule}
      />
    </>
  );
};

export default AutoFundingDashboard;
