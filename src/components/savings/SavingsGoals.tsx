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
    <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6">
      {/* Summary Card - Always show, even when empty */}
      <SavingsSummaryCard savingsGoals={savingsGoals} onAddGoal={openAddForm} />

      {/* Sub-header and Add Goal Button */}
      <div className="flex justify-between items-center">
        <h3 className="font-black text-black text-base tracking-wide">
          <span className="text-lg">Y</span>OUR&nbsp;&nbsp;<span className="text-lg">S</span>AVINGS&nbsp;&nbsp;<span className="text-lg">G</span>OALS
        </h3>
        <div className="flex gap-3">
          <Button
            onClick={openAddForm}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors border-2 border-black shadow-lg"
          >
            {React.createElement(getIcon("Plus"), { className: "h-4 w-4" })}
            <span>Add Savings Goal</span>
          </Button>

          {unassignedCash > 0 && (
            <Button
              onClick={openDistributeModal}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors border-2 border-black shadow-lg"
            >
              {React.createElement(getIcon("Gift"), { className: "h-4 w-4" })}
              <span>Distribute Cash (${unassignedCash.toFixed(2)})</span>
            </Button>
          )}
        </div>
      </div>

      {/* White block for goals */}
      <div className="bg-white rounded-xl p-6 border-2 border-black shadow-sm">
        {/* Goals Grid or Empty State */}
        {savingsGoals.length === 0 ? (
          <div className="text-center py-12">
            {React.createElement(getIcon("Target"), {
              className: "h-16 w-16 mx-auto mb-4 text-purple-600",
            })}
            <h3 className="text-xl font-black text-black mb-2">No Savings Goals Yet</h3>
            <p className="text-purple-900 mb-6">
              Create your first goal to start saving for the future!
            </p>
            <Button
              onClick={openAddForm}
              className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors mx-auto border-2 border-black shadow-lg"
            >
              {React.createElement(getIcon("Plus"), { className: "h-5 w-5" })}
              <span className="font-bold">Add Your First Goal</span>
            </Button>
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
      </div>

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
