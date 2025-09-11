// components/SavingsGoals.jsx
import React from "react";
import { Plus, Gift } from "lucide-react";

// Import the new modular components
import SavingsSummaryCard from "./SavingsSummaryCard";
import SavingsGoalCard from "./SavingsGoalCard";
import AddEditGoalModal from "./AddEditGoalModal";
import DistributeModal from "./DistributeModal";
import useSavingsGoalsActions from "../../hooks/savings/useSavingsGoalsActions";
import { SAVINGS_PRIORITIES } from "../../utils/savings/savingsFormUtils";

const SavingsGoals = ({
  savingsGoals = [],
  unassignedCash = 0,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDistributeToGoals,
}) => {
  const {
    showDistributeModal,
    editingGoal,
    handleGoalSubmit,
    handleEditGoal,
    handleDeleteGoal,
    handleDistribute,
    openAddForm,
    openDistributeModal,
    handleCloseModals,
    isAddEditModalOpen,
  } = useSavingsGoalsActions({
    onAddGoal,
    onUpdateGoal,
    onDeleteGoal,
    onDistributeToGoals,
  });

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <SavingsSummaryCard savingsGoals={savingsGoals} />

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          {/* Add Goal Button */}
          <button
            onClick={openAddForm}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Goal</span>
          </button>

          {/* Distribute Cash Button */}
          {unassignedCash > 0 && savingsGoals.length > 0 && (
            <button
              onClick={openDistributeModal}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Gift className="h-4 w-4" />
              <span>Distribute Cash (${unassignedCash.toFixed(2)})</span>
            </button>
          )}
        </div>
      </div>

      {/* Goals Grid or Empty State */}
      {savingsGoals.length === 0 ? (
        <div className="glassmorphism rounded-2xl p-8 text-center text-gray-500 border border-white/20">
          <p>No savings goals yet. Click "Add Goal" to create your first savings goal!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsGoals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              priorities={SAVINGS_PRIORITIES}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      <AddEditGoalModal
        isOpen={isAddEditModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleGoalSubmit}
        editingGoal={editingGoal}
      />

      {/* Distribute Cash Modal */}
      <DistributeModal
        isOpen={showDistributeModal}
        onClose={handleCloseModals}
        onDistribute={handleDistribute}
        savingsGoals={savingsGoals}
        unassignedCash={unassignedCash}
      />
    </div>
  );
};

export default SavingsGoals;
