import { useState } from "react";
import { useConfirm } from "@/hooks/platform/ux/useConfirm";
import { globalToast } from "@/stores/ui/toastStore";
import AutoFundingRuleBuilder from "./AutoFundingRuleBuilder";
import RulesTab from "./tabs/RulesTab";
import HistoryTab from "./tabs/HistoryTab";
import { useAutoFunding } from "@/hooks/budgeting/allocations";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import logger from "@/utils/common/logger";
import { DashboardHeader, DashboardTabs, DashboardContent } from "./AutoFundingDashboardComponents";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";
import type { AutoFundingRule } from "@/utils/budgeting/autofunding/rules";
import type { Envelope } from "@/types/finance";

interface AutoFundingDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const AutoFundingDashboard = ({ isOpen, onClose }: AutoFundingDashboardProps) => {
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

  const handleSaveRule = async (ruleData: Partial<AutoFundingRule>) => {
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
      const errorMessage = error instanceof Error ? error.message : String(error);
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
        const errorMessage = error instanceof Error ? error.message : String(error);
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
      const result = await executeRules("manual");

      if (result.success && "execution" in result) {
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
            5000
          );
        }
      } else {
        globalToast.showError("Failed to execute rules: " + result.error, "Execution Failed", 8000);
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

            <div className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <DashboardTabs
                  activeTab={activeTab}
                  setActiveTab={(tab: string) => setActiveTab(tab as "rules" | "history")}
                  rules={rules}
                  executionHistory={executionHistory}
                />
              </div>

              <DashboardContent
                activeTab={activeTab}
                rules={rules}
                executionHistory={executionHistory}
                showExecutionDetails={showExecutionDetails}
                setShowExecutionDetails={(show: string | null) => setShowExecutionDetails(show)}
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
      </div>

      <AutoFundingRuleBuilder
        isOpen={showRuleBuilder}
        onClose={() => {
          setShowRuleBuilder(false);
          setEditingRule(null);
        }}
        envelopes={(envelopes as unknown as Envelope[]) || []}
        onSaveRule={handleSaveRule}
        editingRule={editingRule}
      />
    </>
  );
};

export default AutoFundingDashboard;
