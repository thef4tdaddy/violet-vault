import { useConfirm } from "@/hooks/platform/ux/useConfirm";
import { globalToast } from "@/stores/ui/toastStore";
import logger from "@/utils/core/common/logger";

interface AutoFundingHandlersProps {
  editingRule: unknown;
  setEditingRule: (rule: unknown) => void;
  setShowRuleBuilder: (show: boolean) => void;
  ruleActions: {
    updateRule: (id: unknown, data: unknown) => void;
    addRule: (data: unknown) => void;
    deleteRule: (id: string) => void;
    toggleRule: (id: string) => void;
  };
}

export function useAutoFundingHandlers({
  editingRule,
  setEditingRule,
  setShowRuleBuilder,
  ruleActions,
}: AutoFundingHandlersProps) {
  const confirm = useConfirm();
  const { updateRule, addRule, deleteRule, toggleRule } = ruleActions;

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
        updateRule((editingRule as { id: unknown }).id, ruleData);
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
      globalToast.showError(
        "Failed to save rule: " + (error as Error).message,
        "Save Failed",
        8000
      );
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
        globalToast.showError(
          "Failed to delete rule: " + (error as Error).message,
          "Delete Failed",
          8000
        );
      }
    }
  };

  const handleToggleRule = (ruleId: string) => {
    try {
      toggleRule(ruleId);
    } catch (error) {
      logger.error("Failed to toggle rule", error);
      globalToast.showError(
        "Failed to toggle rule: " + (error as Error).message,
        "Toggle Failed",
        8000
      );
    }
  };

  return {
    handleCreateRule,
    handleEditRule,
    handleSaveRule,
    handleDeleteRule,
    handleToggleRule,
  };
}
