import React, { useState } from "react";
import { Button } from "@/components/ui";
import { useConfirm } from "../../hooks/common/useConfirm";
import { globalToast } from "../../stores/ui/toastStore";
import { getIcon } from "../../utils";
import AutoFundingRuleBuilder from "./AutoFundingRuleBuilder";
import RulesTab from "./tabs/RulesTab";
import HistoryTab from "./tabs/HistoryTab";
import { TRIGGER_TYPES } from "../../utils/budgeting/autofunding";
import { useAutoFunding } from "../../hooks/budgeting/autofunding";
import { useBudgetStore } from "../../stores/ui/uiStore";
import logger from "../../utils/common/logger";

// Dashboard header component
const DashboardHeader = ({ 
  activeRules, 
  totalRules, 
  onClose 
}: { 
  activeRules: number; 
  totalRules: number; 
  onClose: () => void;
}) => (
  <div className="p-6 border-b border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Auto-Funding Dashboard</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {activeRules} Active
          </span>
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
            {totalRules} Total
          </span>
        </div>
      </div>
      <Button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
      >
        {React.createElement(getIcon("X"), { className: "h-5 w-5" })}
      </Button>
    </div>
  </div>
);

// Tab navigation
const TabNav = ({ 
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
  <div className="flex space-x-8 mt-6">
    <Button
      onClick={() => onTabChange("rules")}
      className={`py-2 px-1 border-b-2 font-medium text-sm ${
        activeTab === "rules"
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      Rules ({rulesCount})
    </Button>
    <Button
      onClick={() => onTabChange("history")}
      className={`py-2 px-1 border-b-2 font-medium text-sm ${
        activeTab === "history"
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      History ({historyCount})
    </Button>
  </div>
);

// Custom hook for dashboard handlers
const useDashboardHandlers = ({
  addRule,
  updateRule,
  deleteRule,
  toggleRule,
  executeRules,
  setShowRuleBuilder,
  setEditingRule,
  editingRule,
  envelopes,
  unassignedCash,
  allTransactions,
}: {
  addRule: (rule: unknown) => void;
  updateRule: (id: string, rule: unknown) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  executeRules: (type: string, data: unknown) => Promise<{ success: boolean; execution?: { totalFunded?: number; rulesExecuted?: number }; error?: string }>;
  setShowRuleBuilder: (show: boolean) => void;
  setEditingRule: (rule: unknown) => void;
  editingRule: unknown;
  envelopes: unknown[];
  unassignedCash: number;
  allTransactions: unknown[];
}) => {
  const confirm = useConfirm();
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCreateRule = () => {
    setEditingRule(null);
    setShowRuleBuilder(true);
  };

  const handleEditRule = (rule: unknown) => {
    setEditingRule(rule);
    setShowRuleBuilder(true);
  };

  const handleSaveRule = async (ruleData: unknown) => {
    try {
      if (editingRule) {
        updateRule((editingRule as { id: string }).id, ruleData);
      } else {
        addRule(ruleData);
      }
      setShowRuleBuilder(false);
      setEditingRule(null);
    } catch (error) {
      logger.error("Failed to save rule", error);
      globalToast.showError("Failed to save rule: " + (error as Error).message, "Rule Save Failed", 8000);
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

      const result = await executeRules(TRIGGER_TYPES.MANUAL, triggerData);

      if (result.success) {
        const totalFunded = result.execution?.totalFunded || 0;
        const rulesExecuted = result.execution?.rulesExecuted || 0;

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

const AutoFundingDashboard = ({ isOpen, onClose }) => {
  const envelopes = useBudgetStore((state) => state.envelopes);
  const unassignedCash = useBudgetStore((state) => state.unassignedCash);
  const allTransactions = useBudgetStore((state) => state.allTransactions);
  const { rules, executeRules, addRule, updateRule, deleteRule, toggleRule, getHistory } =
    useAutoFunding();
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [activeTab, setActiveTab] = useState("rules");
  const [showExecutionDetails, setShowExecutionDetails] = useState(null);

  const executionHistory = getHistory(20);

  const {
    handleCreateRule,
    handleEditRule,
    handleSaveRule,
    handleDeleteRule,
    handleToggleRule,
    handleExecuteRules,
    isExecuting,
  } = useDashboardHandlers({
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    executeRules,
    setShowRuleBuilder,
    setEditingRule,
    editingRule,
    envelopes: envelopes || [],
    unassignedCash: unassignedCash || 0,
    allTransactions: allTransactions || [],
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="flex flex-col h-full">
            <DashboardHeader
              activeRules={rules.filter((r) => r.enabled).length}
              totalRules={rules.length}
              onClose={onClose}
            />

            <div className="px-6">
              <TabNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                rulesCount={rules.length}
                historyCount={executionHistory.length}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
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
                  executionHistory={executionHistory}
                  showExecutionDetails={showExecutionDetails}
                  onToggleDetails={setShowExecutionDetails}
                />
              )}
            </div>
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

export default AutoFundingDashboard;
