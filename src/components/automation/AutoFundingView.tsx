import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AutoFundingRuleBuilder from "./AutoFundingRuleBuilder";
import RulesTab from "./tabs/RulesTab";
import HistoryTab from "./tabs/HistoryTab";
import { useAutoFunding } from "@/hooks/budgeting/autofunding";
import { useBudgetStore } from "@/stores/ui/uiStore";
import { globalToast } from "@/stores/ui/toastStore";
import logger from "@/utils/common/logger";
import { ViewHeader, ViewTabs, ViewContent } from "./AutoFundingViewComponents";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import { useAutoFundingHandlers } from "./useAutoFundingHandlers";

function AutoFundingView() {
  const navigate = useNavigate();
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

  // Get handlers from custom hook
  const { handleCreateRule, handleEditRule, handleSaveRule, handleDeleteRule, handleToggleRule } =
    useAutoFundingHandlers({
      editingRule,
      setEditingRule,
      setShowRuleBuilder,
      ruleActions: { updateRule, addRule, deleteRule, toggleRule },
    });

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
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate("/app/envelopes")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg border-2 border-black font-medium"
            title="Back to Envelopes"
          >
            {React.createElement(getIcon("ArrowLeft"), { className: "h-4 w-4" })}
            Back to Envelopes
          </Button>
        </div>
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
}

export default AutoFundingView;
