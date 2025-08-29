import React, { useState, useEffect } from "react";
import { useConfirm } from "../../hooks/common/useConfirm";
import { globalToast } from "../../stores/ui/toastStore";
import {
  Plus,
  Play,
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

const AutoFundingView = () => {
  const budget = useBudgetStore();
  const confirm = useConfirm();
  const [rules, setRules] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [activeTab, setActiveTab] = useState("rules");
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
      globalToast.showError("Failed to save rule: " + error.message, "Rule Save Failed");
    }
  };

  const handleDeleteRule = async (ruleId) => {
    const confirmed = await confirm({
      title: "Delete Auto-Funding Rule",
      message: "Are you sure you want to delete this rule? This action cannot be undone.",
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
        globalToast.showError("Failed to delete rule: " + error.message, "Delete Failed");
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
            "Auto-Funding Complete"
          );
        } else {
          globalToast.showWarning(
            "Rules executed but no funds were transferred. Check your rules and available balances.",
            "No Funds Transferred"
          );
        }
      } else {
        globalToast.showError("Failed to execute rules: " + result.error, "Execution Failed");
      }

      loadRulesAndHistory();
    } catch (error) {
      logger.error("Failed to execute rules", error);
      globalToast.showError("Failed to execute rules: " + error.message, "Execution Failed");
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

  return (
    <div className="glassmorphism rounded-3xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Auto-Funding Rules</h2>
              <p className="text-gray-600">Automate your envelope funding with smart rules</p>
            </div>
          </div>
          <button
            onClick={handleExecuteRules}
            disabled={isExecuting || rules.filter((r) => r.enabled).length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isExecuting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Execute Rules
              </>
            )}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
                <p className="text-sm text-gray-600">Total Rules</p>
              </div>
            </div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {rules.filter((r) => r.enabled).length}
                </p>
                <p className="text-sm text-gray-600">Active Rules</p>
              </div>
            </div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  ${(budget.unassignedCash || 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Available Cash</p>
              </div>
            </div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="flex items-center gap-3">
              <History className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-900">
                  {executionHistory.length > 0
                    ? new Date(executionHistory[0].executedAt).toLocaleDateString()
                    : "Never"}
                </p>
                <p className="text-sm text-gray-600">Last Execution</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "rules"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Rules ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-3 text-sm font-medium ${
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
      <div className="min-h-96">
        {activeTab === "rules" && (
          <div className="space-y-6">
            {/* Create Rule Button */}
            <div className="text-center">
              <button
                onClick={handleCreateRule}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                <Plus className="h-5 w-5" />
                Create New Rule
              </button>
            </div>

            {/* Rules List */}
            {rules.length === 0 ? (
              <div className="text-center py-16">
                <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Rules Created</h3>
                <p className="text-gray-600 mb-6">
                  Create your first auto-funding rule to automate envelope management
                </p>
                <button
                  onClick={handleCreateRule}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Plus className="h-5 w-5" />
                  Get Started
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {rules.map((rule) => {
                  const Icon = getRuleTypeIcon(rule.type);
                  const colorClass = getRuleTypeColor(rule.type);

                  return (
                    <div
                      key={rule.id}
                      className={`bg-white/50 backdrop-blur-sm border rounded-xl p-6 ${
                        rule.enabled ? "border-white/20" : "border-gray-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${colorClass}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3
                              className={`text-lg font-semibold ${
                                rule.enabled ? "text-gray-900" : "text-gray-500"
                              }`}
                            >
                              {rule.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span>{formatRuleType(rule.type)}</span>
                              <span>•</span>
                              <span>{formatTriggerType(rule.trigger)}</span>
                              <span>•</span>
                              <span>Priority: {rule.priority}</span>
                              {rule.executionCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span>Executed {rule.executionCount} times</span>
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
                            title={rule.enabled ? "Disable rule" : "Enable rule"}
                          >
                            {rule.enabled ? (
                              <Eye className="h-5 w-5" />
                            ) : (
                              <EyeOff className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditRule(rule)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit rule"
                          >
                            <Edit3 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete rule"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {rule.description && (
                        <p className="text-gray-600 mt-3 ml-16">{rule.description}</p>
                      )}

                      {/* Rule Details */}
                      <div className="ml-16 mt-4 flex flex-wrap items-center gap-2">
                        {rule.config.amount > 0 && (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            <DollarSign className="h-4 w-4" />${rule.config.amount.toFixed(2)}
                          </span>
                        )}
                        {rule.config.percentage > 0 && (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            <Percent className="h-4 w-4" />
                            {rule.config.percentage}%
                          </span>
                        )}
                        {rule.config.targetId && (
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                            <Target className="h-4 w-4" />
                            {budget.envelopes?.find((e) => e.id === rule.config.targetId)?.name ||
                              "Unknown"}
                          </span>
                        )}
                        {rule.config.targetIds && rule.config.targetIds.length > 0 && (
                          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                            <Target className="h-4 w-4" />
                            {rule.config.targetIds.length} envelopes
                          </span>
                        )}
                        {rule.lastExecuted && (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                            <Clock className="h-4 w-4" />
                            Last: {new Date(rule.lastExecuted).toLocaleDateString()}
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
              <div className="text-center py-16">
                <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Execution History</h3>
                <p className="text-gray-600 mb-6">
                  Rule executions will appear here once you start running your auto-funding rules
                </p>
                <button
                  onClick={handleExecuteRules}
                  disabled={rules.filter((r) => r.enabled).length === 0}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
                >
                  <Play className="h-5 w-5" />
                  Execute Rules Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {executionHistory.map((execution, index) => (
                  <div
                    key={execution.id}
                    className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl ${
                            execution.totalFunded > 0
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {execution.totalFunded > 0 ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <AlertTriangle className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Execution #{executionHistory.length - index}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>{new Date(execution.executedAt).toLocaleString()}</span>
                            <span>•</span>
                            <span>{formatTriggerType(execution.trigger)} trigger</span>
                            <span>•</span>
                            <span>{execution.rulesExecuted} rules executed</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            execution.totalFunded > 0 ? "text-green-600" : "text-gray-600"
                          }`}
                        >
                          ${(execution.totalFunded || 0).toFixed(2)}
                        </p>
                        <button
                          onClick={() =>
                            setShowExecutionDetails(
                              showExecutionDetails === execution.id ? null : execution.id
                            )
                          }
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          {showExecutionDetails === execution.id ? "Hide Details" : "Show Details"}
                        </button>
                      </div>
                    </div>

                    {showExecutionDetails === execution.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="space-y-3">
                          {execution.results?.map((result, resultIndex) => (
                            <div
                              key={resultIndex}
                              className={`p-4 rounded-lg ${
                                result.success
                                  ? "bg-green-50 border border-green-200"
                                  : "bg-red-50 border border-red-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4
                                    className={`font-medium ${
                                      result.success ? "text-green-900" : "text-red-900"
                                    }`}
                                  >
                                    {result.ruleName}
                                  </h4>
                                  {result.success ? (
                                    <p className="text-sm text-green-700 mt-1">
                                      Funded ${(result.amount || 0).toFixed(2)}
                                      {result.targetEnvelopes &&
                                        result.targetEnvelopes.length > 0 && (
                                          <span>
                                            {" "}
                                            to {result.targetEnvelopes.length} envelope
                                            {result.targetEnvelopes.length > 1 ? "s" : ""}
                                          </span>
                                        )}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-red-700 mt-1">{result.error}</p>
                                  )}
                                </div>
                                <div
                                  className={`text-sm font-medium ${
                                    result.success ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {result.success ? "Success" : "Failed"}
                                </div>
                              </div>
                            </div>
                          ))}
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
    </div>
  );
};

export default AutoFundingView;
