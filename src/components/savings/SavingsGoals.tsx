// components/SavingsGoals.jsx
import { Button } from "@/components/ui";
import React from "react";
import { getIcon } from "../../utils";
import type { SavingsGoal } from "@/db/types";

// Import the new modular components
import SavingsSummaryCard from "./SavingsSummaryCard";
import SavingsGoalCard from "./SavingsGoalCard";
import AddEditGoalModal, { type Goal as LocalGoal } from "./AddEditGoalModal";
import DistributeModal from "./DistributeModal";
import useSavingsGoalsActions from "@/hooks/budgeting/envelopes/goals/useSavingsGoalsActions";
import { SAVINGS_PRIORITIES } from "../../utils/savings/savingsFormUtils";

const SavingsGoals = ({
  savingsGoals = [],
  unassignedCash = 0,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDistributeToGoals,
}: {
  savingsGoals?: SavingsGoal[];
  unassignedCash?: number;
  onAddGoal: (goal: Partial<SavingsGoal>) => void;
  onUpdateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  onDeleteGoal: (id: string) => void;
  onDistributeToGoals: (distribution: Record<string, number>) => void;
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
      {/* Header with Add Button */}
      <div className="flex flex-wrap md:flex-nowrap justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-black text-black text-xl flex items-center">
            <div className="relative mr-4">
              <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-purple-500 p-3 rounded-2xl">
                {React.createElement(getIcon("Target"), {
                  className: "h-6 w-6 text-white",
                })}
              </div>
            </div>
            <span className="text-2xl">S</span>AVINGS&nbsp;&nbsp;<span className="text-2xl">G</span>
            OALS
          </h2>
          <p className="text-purple-900 mt-1">
            {savingsGoals.length} {savingsGoals.length === 1 ? "goal" : "goals"} • Track your
            financial targets
          </p>
        </div>

        <div className="flex flex-row gap-3">
          <Button
            onClick={openAddForm}
            className="btn btn-primary border-2 border-black flex items-center"
          >
            {React.createElement(getIcon("Plus"), {
              className: "h-4 w-4 mr-2",
            })}
            Add Goal
          </Button>
          {unassignedCash > 0 && savingsGoals.length > 0 && (
            <Button
              onClick={openDistributeModal}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors border-2 border-black shadow-lg"
            >
              {React.createElement(getIcon("Gift"), { className: "h-4 w-4" })}
              <span>Distribute (${unassignedCash.toFixed(2)})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards - Page-specific cards like Debt page */}
      <SavingsSummaryCard savingsGoals={savingsGoals as SavingsGoal[]} onAddGoal={openAddForm} />

      {/* White block for goals list */}
      <div className="bg-white rounded-xl p-6 border-2 border-black shadow-sm">
        {/* Sub-header for goals section */}
        {savingsGoals.length > 0 && (
          <div className="mb-6">
            <h3 className="font-black text-black text-base tracking-wide flex items-center">
              {React.createElement(getIcon("Target"), {
                className: "h-4 w-4 mr-2 text-purple-600",
              })}
              <span className="text-lg">Y</span>OUR&nbsp;&nbsp;<span className="text-lg">G</span>
              OALS ({savingsGoals.length})
            </h3>
          </div>
        )}

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savingsGoals.map((goal: SavingsGoal) => (
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
        onSubmit={
          handleGoalSubmit as unknown as (goalData: Omit<LocalGoal, "id">, goalId?: string) => void
        }
        editingGoal={editingGoal as unknown as LocalGoal}
      />

      <DistributeModal
        isOpen={showDistributeModal}
        onClose={handleCloseModals}
        onDistribute={handleDistribute}
        savingsGoals={savingsGoals.map((g) => ({
          ...g,
          currentAmount:
            typeof g.currentAmount === "string"
              ? parseFloat(g.currentAmount)
              : (g.currentAmount ?? 0),
        }))}
        unassignedCash={unassignedCash}
      />
    </div>
  );
};

export default SavingsGoals;
