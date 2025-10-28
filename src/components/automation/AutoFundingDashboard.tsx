import { useState } from "react";
import { useConfirm } from "@/hooks/common/useConfirm";
import { globalToast } from "@/stores/ui/toastStore";
import AutoFundingRuleBuilder from "./AutoFundingRuleBuilder";
import RulesTab from "./tabs/RulesTab";
import HistoryTab from "./tabs/HistoryTab";
import { TRIGGER_TYPES } from "@/utils/budgeting/autofunding";
import { useAutoFunding } from "@/hooks/budgeting/autofunding";
import { useBudgetStore } from "@/stores/ui/uiStore";
import logger from "@/utils/common/logger";
import {
  DashboardHeader,
  DashboardTabs,
  DashboardContent,
} from "./AutoFundingDashboardComponents";

const AutoFundingDashboard = ({ isOpen, onClose }) => {
  const envelopes = useBudgetStore((state) => state.envelopes);
  const unassignedCash = useBudgetStore((state) => state.unassignedCash);
  const allTransactions = useBudgetStore((state) => state.allTransactions);
  const confirm = useConfirm();
  const { rules, executeRules, addRule, updateRule, deleteRule, toggleRule, getHistory } =
    useAutoFunding();
  const [isExecuting, setIsExecuting] = useState(false);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [activeTab, setActiveTab] = useState("rules"); // 'rules' | 'history'
  const [showExecutionDetails, setShowExecutionDetails] = useState(null);

  // Get execution history
  const executionHistory = getHistory(20);

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
    } catch (error) {
      logger.error("Failed to save rule", error);
      globalToast.showError("Failed to save rule: " + error.message, "Rule Save Failed", 8000);
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
      } catch (error) {
        logger.error("Failed to delete rule", error);
        globalToast.showError("Failed to delete rule: " + error.message, "Delete Failed", 8000);
      }
    }
  };

  const handleToggleRule = (ruleId) => {
    try {
      toggleRule(ruleId);
    } catch (error) {
      logger.error("Failed to toggle rule", error);
    }
  };

  const handleExecuteRules = async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    try {
      const triggerData = {
        currentDate: new Date().toISOString(),
        envelopes: envelopes || [],
        unassignedCash: unassignedCash || 0,
        transactions: allTransactions || [],
      };

      const result = await executeRules(TRIGGER_TYPES.MANUAL);

      if (result.success && 'execution' in result) {
        const totalFunded = result.execution.totalFunded || 0;
        const rulesExecuted = result.execution.rulesExecuted || 0;

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
            6000
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="flex flex-col h-full">
            <DashboardHeader rules={rules} onClose={onClose} />

            <div className="px-6">
              <DashboardTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                rules={rules}
                executionHistory={executionHistory}
              />
            </div>

            <DashboardContent
              activeTab={activeTab}
              rules={rules}
              executionHistory={executionHistory}
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
        </div>
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

export default AutoFundingDashboard;
