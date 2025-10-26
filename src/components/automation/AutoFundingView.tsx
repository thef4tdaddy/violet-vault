import { useState } from "react";
import { Button } from "@/components/ui";
import { useConfirm } from "@/hooks/common/useConfirm";
import { globalToast } from "@/stores/ui/toastStore";
import AutoFundingRuleBuilder from "./AutoFundingRuleBuilder";
import RulesTab from "./tabs/RulesTab";
import HistoryTab from "./tabs/HistoryTab";
import { useAutoFunding } from "@/hooks/budgeting/autofunding";
import { useBudgetStore } from "@/stores/ui/uiStore";
import logger from "@/utils/common/logger";

// Header component
const AutoFundingHeader = ({ activeRules, totalRules }: { activeRules: number; totalRules: number }) => (
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
          {activeRules} Active Rules
        </span>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
          {totalRules} Total Rules
        </span>
      </div>
    </div>
  </div>
);

// Tab navigation component
const TabNavigation = ({ 
  activeTab, 
  onTabChange, 
  rulesCount, 
  historyCount 
}: { 
  activeTab: string;
  onTabChange: (tab: string) => void;
  rulesCount: number;
  historyCount: number;
}) => (
  <div className="flex space-x-8 border-b border-gray-200">
    <Button
      onClick={() => onTabChange("rules")}
      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
        activeTab === "rules"
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      Rules ({rulesCount})
    </Button>
    <Button
      onClick={() => onTabChange("history")}
      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
        activeTab === "history"
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      History ({historyCount})
    </Button>
  </div>
);

// Custom hook for rule handlers
const useRuleHandlers = ({
  addRule,
  updateRule,
  deleteRule,
  toggleRule,
  executeRules,
  setShowRuleBuilder,
  setEditingRule,
  editingRule,
}: {
  addRule: (rule: unknown) => void;
  updateRule: (id: string, rule: unknown) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  executeRules: () => Promise<unknown>;
  setShowRuleBuilder: (show: boolean) => void;
  setEditingRule: (rule: unknown) => void;
  editingRule: unknown;
}) => {
  const confirm = useConfirm();
  const [isExecuting, setIsExecuting] = useState(false);

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
        updateRule((editingRule as { id: string }).id, ruleData);
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
      globalToast.showError("Failed to save rule: " + (error as Error).message, "Save Failed", 8000);
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
        globalToast.showError("Failed to delete rule: " + (error as Error).message, "Delete Failed", 8000);
      }
    }
  };

  const handleToggleRule = (ruleId: string) => {
    try {
      toggleRule(ruleId);
    } catch (error) {
      logger.error("Failed to toggle rule", error);
      globalToast.showError("Failed to toggle rule: " + (error as Error).message, "Toggle Failed", 8000);
    }
  };

  const handleExecuteRules = async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    try {
      const result = await executeRules();

      if ((result as { success: boolean }).success && "execution" in result) {
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
        globalToast.showError("Failed to execute rules: " + (result as { error: string }).error, "Execution Failed", 8000);
      }
    } catch (error) {
      logger.error("Failed to execute rules", error);
      globalToast.showError("Failed to execute rules: " + (error as Error).message, "Execution Failed", 8000);
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    handleCreateRule,
    handleEditRule,
    handleSaveRule,
    handleDeleteRule,
    handleToggleRule,
    handleExecuteRules,
    isExecuting,
  };
};

const AutoFundingView = () => {
  const envelopes = useBudgetStore((state) => state.envelopes) as unknown[];
  const { rules, executeRules, addRule, updateRule, deleteRule, toggleRule, getHistory } =
    useAutoFunding();
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [activeTab, setActiveTab] = useState("rules");
  const [showExecutionDetails, setShowExecutionDetails] = useState(null);

  const displayHistory = getHistory(20);

  const {
    handleCreateRule,
    handleEditRule,
    handleSaveRule,
    handleDeleteRule,
    handleToggleRule,
    handleExecuteRules,
    isExecuting,
  } = useRuleHandlers({
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    executeRules,
    setShowRuleBuilder,
    setEditingRule,
    editingRule,
  });

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <AutoFundingHeader 
            activeRules={rules.filter((r) => r.enabled).length}
            totalRules={rules.length}
          />
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            rulesCount={rules.length}
            historyCount={displayHistory.length}
          />
        </div>

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
