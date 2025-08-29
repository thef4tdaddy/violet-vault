// hooks/savings/useSavingsGoalsActions.js - UI action handlers for savings goals
import { useState } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import { useConfirm } from "../common/useConfirm";

/**
 * Custom hook for managing savings goals UI actions and modal states
 */
const useSavingsGoalsActions = ({
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDistributeToGoals,
}) => {
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
        globalToast.success("Savings goal updated successfully!");
        setEditingGoal(null);
      } else {
        // Add new goal
        await onAddGoal(goalData);
        globalToast.success("Savings goal added successfully!");
        setShowAddForm(false);
      }
    } catch (error) {
      globalToast.error(
        goalId ? "Failed to update savings goal" : "Failed to add savings goal",
      );
      console.error("Error saving goal:", error);
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
      confirmText: "Delete",
      variant: "danger",
    });

    if (isConfirmed) {
      try {
        await onDeleteGoal(goal.id);
        globalToast.success("Savings goal deleted successfully!");
      } catch (error) {
        globalToast.error("Failed to delete savings goal");
        console.error("Error deleting goal:", error);
      }
    }
  };

  // Distribute funds handler
  const handleDistribute = async (distribution) => {
    try {
      await onDistributeToGoals(distribution);
      globalToast.success("Funds distributed successfully!");
    } catch (error) {
      globalToast.error("Failed to distribute funds");
      console.error("Error distributing funds:", error);
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
