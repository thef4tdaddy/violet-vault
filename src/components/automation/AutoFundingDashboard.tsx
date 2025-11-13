import { useState } from "react";
import type React from "react";
import { useConfirm } from "@/hooks/common/useConfirm";
import { globalToast } from "@/stores/ui/toastStore";
import AutoFundingRuleBuilder from "./AutoFundingRuleBuilder";
import RulesTab from "./tabs/RulesTab";
import HistoryTab from "./tabs/HistoryTab";
import { useAutoFunding } from "@/hooks/budgeting/autofunding";
import { useEnvelopes } from "@/hooks/budgeting/useEnvelopes";
import logger from "@/utils/common/logger";
import { DashboardHeader, DashboardTabs, DashboardContent } from "./AutoFundingDashboardComponents";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";
import type { AutoFundingRule } from "@/utils/budgeting/autofunding/rules";

interface AutoFundingDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AutoFundingExecution {
  id: string;
  success?: boolean;
  execution?: {
    totalFunded?: number;
    rulesExecuted?: number;
  };
  error?: string;
  message?: string;
}

const AutoFundingDashboard: React.FC<AutoFundingDashboardProps> = ({ isOpen, onClose }) => {
  const { envelopes = [] } = useEnvelopes();
  const confirm = useConfirm();
  const { rules, executeRules, addRule, updateRule, deleteRule, toggleRule, getHistory } =
    useAutoFunding();
  const [isExecuting, setIsExecuting] = useState(false);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoFundingRule | null>(null);
  const [activeTab, setActiveTab] = useState<"rules" | "history">("rules");
  const [showExecutionDetails, setShowExecutionDetails] = useState<string | null>(null);
  const modalRef = useModalAutoScroll(isOpen);

  // Get execution history
  const executionHistory = getHistory(20);

  const handleCreateRule = () => {
    setEditingRule(null);
    setShowRuleBuilder(true);
  };

  const handleEditRule = (rule: AutoFundingRule) => {
    setEditingRule(rule);
    setShowRuleBuilder(true);
  };

  const handleSaveRule = async (ruleData: AutoFundingRule) => {
    try {
      if (editingRule && ruleData.id === editingRule.id) {
        updateRule(editingRule.id, ruleData);
      } else {
        addRule(ruleData);
      }
      setShowRuleBuilder(false);
      setEditingRule(null);
    } catch (error) {
      logger.error("Failed to save rule", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      globalToast.showError("Failed to save rule: " + errorMessage, "Rule Save Failed", 8000);
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
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        globalToast.showError("Failed to delete rule: " + errorMessage, "Delete Failed", 8000);
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
      const result = (await executeRules("manual")) as unknown as AutoFundingExecution;

      if (result.success && "execution" in result && result.execution) {
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
        globalToast.showError(
          "Failed to execute rules: " + (result.error || "Unknown error"),
          "Execution Failed",
          8000
        );
      }
    } catch (error) {
      logger.error("Failed to execute rules", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      globalToast.showError("Failed to execute rules: " + errorMessage, "Execution Failed", 8000);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div
          ref={modalRef}
          className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border-2 border-black shadow-2xl my-auto"
        >
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
