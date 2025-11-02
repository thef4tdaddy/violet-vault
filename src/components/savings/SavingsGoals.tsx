// components/SavingsGoals.jsx
import { Button } from "@/components/ui";
import React from "react";
import { getIcon } from "../../utils";

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
      {/* Summary Card - Always show, even when empty */}
      <SavingsSummaryCard savingsGoals={savingsGoals} />

      {/* Goals Grid or Empty State */}
      {savingsGoals.length === 0 ? (
        <div className="glassmorphism rounded-2xl p-12 text-center border-2 border-purple-200">
          {React.createElement(getIcon("Target"), {
            className: "h-16 w-16 mx-auto mb-4 text-purple-400",
          })}
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Savings Goals Yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first goal to start saving for the future!
          </p>
          <Button
            onClick={openAddForm}
            className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors mx-auto border-2 border-black"
          >
            {React.createElement(getIcon("Plus"), { className: "h-5 w-5" })}
            <span className="font-bold">Add Your First Goal</span>
          </Button>
        </div>
      ) : (
        <>
          {/* Action Buttons - Only show when there are goals */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <Button
                onClick={openAddForm}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors border-2 border-black"
              >
                {React.createElement(getIcon("Plus"), { className: "h-4 w-4" })}
                <span>Add Goal</span>
              </Button>

              {unassignedCash > 0 && (
                <Button
                  onClick={openDistributeModal}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors border-2 border-black"
                >
                  {React.createElement(getIcon("Gift"), { className: "h-4 w-4" })}
                  <span>Distribute Cash (${unassignedCash.toFixed(2)})</span>
                </Button>
              )}
            </div>
          </div>
          {/* Goals Grid */}
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
        </>
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
