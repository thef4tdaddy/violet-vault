import { useState } from "react";
import { useConfirm } from "@/hooks/common/useConfirm";
import { globalToast } from "@/stores/ui/toastStore";
import AutoFundingRuleBuilder from "./AutoFundingRuleBuilder";
import RulesTab from "./tabs/RulesTab";
import HistoryTab from "./tabs/HistoryTab";
import { useAutoFunding } from "@/hooks/budgeting/autofunding";
import { useBudgetStore } from "@/stores/ui/uiStore";
import logger from "@/utils/common/logger";
import { ViewHeader, ViewTabs, ViewContent } from "./AutoFundingViewComponents";

const AutoFundingView = () => {
  const confirm = useConfirm();
  const envelopes = useBudgetStore((state) => state.envelopes) as unknown[];
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

  const handleEditRule = (rule: unknown) => {
    if (rule && typeof rule === "object") {
      setEditingRule(rule);
      setShowRuleBuilder(true);
    }
  };

  const handleSaveRule = async (ruleData: unknown) => {
    if (!ruleData || typeof ruleData !== "object") return;
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
        "Success",
        5000
      );
    } catch (error) {
      logger.error("Failed to save rule", error);
      globalToast.showError("Failed to save rule: " + error.message, "Save Failed", 8000);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
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
        globalToast.showSuccess("Rule deleted successfully!", "Success", 5000);
      } catch (error) {
        logger.error("Failed to delete rule", error);
        globalToast.showError("Failed to delete rule: " + error.message, "Delete Failed", 8000);
      }
    }
  };

  const handleToggleRule = (ruleId: string) => {
    try {
      toggleRule(ruleId);
    } catch (error) {
      logger.error("Failed to toggle rule", error);
      globalToast.showError("Failed to toggle rule: " + error.message, "Toggle Failed", 8000);
    }
  };

  const handleExecuteRules = async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    try {
      const result = await executeRules();

      if (result.success && "execution" in result) {
        const resultWithExecution = result as {
          execution: { totalFunded?: number; rulesExecuted?: number };
        };
        const totalFunded = resultWithExecution.execution?.totalFunded || 0;
        const rulesExecuted = resultWithExecution.execution?.rulesExecuted || 0;

        if (totalFunded > 0) {
          globalToast.showSuccess(
            `Successfully executed ${rulesExecuted} rules and funded $${totalFunded.toFixed(2)} total!`,
            "Auto-Funding Complete",
            5000
          );
        } else {
          globalToast.showWarning(
            "Rules executed but no funds were transferred. Check your rules and available balances.",
            "No Funds Transferred",
            5000
          );
        }
      } else {
        globalToast.showError("Failed to execute rules: " + result.error, "Execution Failed", 8000);
      }
    } catch (error) {
      logger.error("Failed to execute rules", error);
      globalToast.showError("Failed to execute rules: " + error.message, "Execution Failed", 8000);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        <ViewHeader rules={rules} />

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ViewTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            rules={rules}
            displayHistory={displayHistory}
          />
        </div>

        <ViewContent
          activeTab={activeTab}
          rules={rules}
          displayHistory={displayHistory}
          showExecutionDetails={showExecutionDetails}
          setShowExecutionDetails={setShowExecutionDetails}
          handleCreateRule={handleCreateRule}
          handleEditRule={handleEditRule}
          handleDeleteRule={handleDeleteRule}
          handleToggleRule={handleToggleRule}
          handleExecuteRules={handleExecuteRules}
          isExecuting={isExecuting}
          RulesTabComponent={RulesTab}
          HistoryTabComponent={HistoryTab}
        />
      </div>

      {/* Rule Builder Modal */}
      <AutoFundingRuleBuilder
        isOpen={showRuleBuilder}
        onClose={() => {
          setShowRuleBuilder(false);
          setEditingRule(null);
        }}
        envelopes={envelopes || []}
        onSaveRule={handleSaveRule}
        editingRule={editingRule}
      />
    </>
  );
};

export default AutoFundingView;
