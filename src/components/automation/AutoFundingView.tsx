import React, { useState } from "react";
import { useConfirm } from "../../hooks/common/useConfirm";
import { globalToast } from "../../stores/ui/toastStore";
import AutoFundingRuleBuilder from "./AutoFundingRuleBuilder";
import RulesTab from "./tabs/RulesTab";
import HistoryTab from "./tabs/HistoryTab";
import { useAutoFunding } from "../../hooks/budgeting/autofunding";
import { TRIGGER_TYPES } from "../../utils/budgeting/autofunding";
import { useBudgetStore } from "../../stores/ui/uiStore";
import logger from "../../utils/common/logger";

const AutoFundingView = () => {
  const confirm = useConfirm();
  const budget = useBudgetStore();
  const { rules, executeRules, addRule, updateRule, deleteRule, toggleRule, getHistory } =
    useAutoFunding();
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [activeTab, setActiveTab] = useState("rules");
  const [showExecutionDetails, setShowExecutionDetails] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Get execution history
  const displayHistory = getHistory(20);

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
        updateRule(editingRule.id, ruleData);
      } else {
        addRule(ruleData);
      }
      setShowRuleBuilder(false);
      setEditingRule(null);
      globalToast.showSuccess(
        editingRule ? "Rule updated successfully!" : "Rule created successfully!",
        "Success"
      );
    } catch (error) {
      logger.error("Failed to save rule", error);
      globalToast.showError("Failed to save rule: " + error.message, "Save Failed");
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
        deleteRule(ruleId);
        globalToast.showSuccess("Rule deleted successfully!", "Success");
      } catch (error) {
        logger.error("Failed to delete rule", error);
        globalToast.showError("Failed to delete rule: " + error.message, "Delete Failed");
      }
    }
  };

  const handleToggleRule = (ruleId) => {
    try {
      toggleRule(ruleId);
    } catch (error) {
      logger.error("Failed to toggle rule", error);
      globalToast.showError("Failed to toggle rule: " + error.message, "Toggle Failed");
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

      const result = await executeRules(context, budget);

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
    } catch (error) {
      logger.error("Failed to execute rules", error);
      globalToast.showError("Failed to execute rules: " + error.message, "Execution Failed");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auto-Funding</h1>
              <p className="text-gray-600 mt-1">
                Automate your envelope funding with custom rules and triggers
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                {rules.filter((r) => r.enabled).length} Active Rules
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {rules.length} Total Rules
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 mt-6 border-b border-gray-200">
            <Button
              onClick={() => setActiveTab("rules")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "rules"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Rules ({rules.length})
            </Button>
            <Button
              onClick={() => setActiveTab("history")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              History ({displayHistory.length})
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            {activeTab === "rules" && (
              <RulesTab
                rules={rules}
                onCreateRule={handleCreateRule}
                onEditRule={handleEditRule}
                onDeleteRule={handleDeleteRule}
                onToggleRule={handleToggleRule}
                onExecuteRules={handleExecuteRules}
                isExecuting={isExecuting}
              />
            )}

            {activeTab === "history" && (
              <HistoryTab
                executionHistory={displayHistory}
                showExecutionDetails={showExecutionDetails}
                onToggleDetails={setShowExecutionDetails}
              />
            )}
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
        onSaveRule={handleSaveRule}
        editingRule={editingRule}
      />
    </>
  );
};

export default AutoFundingView;
