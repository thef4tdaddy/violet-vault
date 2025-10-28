// hooks/savings/useSavingsGoalsActions.js - UI action handlers for savings goals
import { useState } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import { useConfirm } from "../common/useConfirm";
import logger from "../../utils/common/logger";

/**
 * Custom hook for managing savings goals UI actions and modal states
 */
const useSavingsGoalsActions = ({ onAddGoal, onUpdateGoal, onDeleteGoal, onDistributeToGoals }) => {
  // Modal state management
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const confirm = useConfirm();

  // Goal submission handler (add/edit)
  const handleGoalSubmit = async (goalData, goalId = null) => {
    try {
      if (goalId) {
        // Update existing goal
        await onUpdateGoal(goalId, goalData);
        globalToast.showSuccess("Savings goal updated successfully!", "Success", 5000);
        setEditingGoal(null);
      } else {
        // Add new goal
        await onAddGoal(goalData);
        globalToast.showSuccess("Savings goal added successfully!", "Success", 5000);
        setShowAddForm(false);
      }
    } catch (error) {
      globalToast.showError(
        goalId ? "Failed to update savings goal" : "Failed to add savings goal",
        "Error",
        8000
      );
      logger.error("Error saving goal:", error);
    }
  };

  // Edit goal handler
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
  };

  // Delete goal handler with confirmation
  const handleDeleteGoal = async (goal) => {
    const isConfirmed = await confirm({
      title: "Delete Savings Goal",
      message: `Are you sure you want to delete "${goal.name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });

    if (isConfirmed) {
      try {
        await onDeleteGoal(goal.id);
        globalToast.showSuccess("Savings goal deleted successfully!", "Success", 5000);
      } catch (error) {
        globalToast.showError("Failed to delete savings goal", "Error", 8000);
        logger.error("Error deleting goal:", error);
      }
    }
  };

  // Distribute funds handler
  const handleDistribute = async (distribution) => {
    try {
      await onDistributeToGoals(distribution);
      globalToast.showSuccess("Funds distributed successfully!", "Success", 5000);
    } catch (error) {
      globalToast.showError("Failed to distribute funds", "Error", 8000);
      logger.error("Error distributing funds:", error);
    }
  };

  // Modal state helpers
  const openAddForm = () => setShowAddForm(true);
  const openDistributeModal = () => setShowDistributeModal(true);

  const handleCloseModals = () => {
    setShowAddForm(false);
    setEditingGoal(null);
    setShowDistributeModal(false);
  };

  return {
    // Modal states
    showAddForm,
    showDistributeModal,
    editingGoal,

    // Action handlers
    handleGoalSubmit,
    handleEditGoal,
    handleDeleteGoal,
    handleDistribute,

    // Modal controls
    openAddForm,
    openDistributeModal,
    handleCloseModals,

    // Computed states
    isAddEditModalOpen: showAddForm || !!editingGoal,
  };
};

export default useSavingsGoalsActions;
