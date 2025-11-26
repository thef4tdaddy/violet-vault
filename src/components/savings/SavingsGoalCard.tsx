// components/savings/SavingsGoalCard.jsx
import { Button } from "@/components/ui";
import React from "react";
import { getIcon } from "../../utils";

// Type definitions
interface SavingsGoal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  targetDate?: string | Date;
  color?: string;
  priority: string;
  description?: string;
}

interface Priority {
  value: string;
  label: string;
  color: string;
}

interface TimeRemaining {
  text: string;
  status: "overdue" | "due" | "urgent" | "soon" | "normal";
}

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (goal: SavingsGoal) => void;
  priorities: Priority[];
}

const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  priorities,
}) => {
  const getProgressPercentage = (current: number, target: number): number => {
    return target > 0 ? (current / target) * 100 : 0;
  };

  const getTimeRemaining = (targetDate?: string | Date): TimeRemaining | null => {
    if (!targetDate) return null;
    const today = new Date();
    const target = targetDate instanceof Date ? targetDate : new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Overdue", status: "overdue" };
    if (diffDays === 0) return { text: "Due today", status: "due" };
    if (diffDays <= 7) return { text: `${diffDays} days left`, status: "urgent" };
    if (diffDays <= 30) return { text: `${diffDays} days left`, status: "soon" };

    const diffWeeks = Math.ceil(diffDays / 7);
    const diffMonths = Math.ceil(diffDays / 30);

    if (diffDays <= 84) return { text: `${diffWeeks} weeks left`, status: "normal" };
    return { text: `${diffMonths} months left`, status: "normal" };
  };

  const progressPercentage = getProgressPercentage(goal.currentAmount, goal.targetAmount);
  const timeRemaining = getTimeRemaining(goal.targetDate);
  const priority = priorities.find((p) => p.value === goal.priority);

  const getTimeRemainingColor = (status: TimeRemaining["status"]): string => {
    switch (status) {
      case "overdue":
        return "text-red-600 bg-red-50 border-red-200";
      case "due":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "urgent":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "soon":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="glassmorphism rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: goal.color }} />
          <div>
            <h3 className="font-semibold text-lg">{goal.name}</h3>
            {priority && (
              <span className={`text-xs px-2 py-1 rounded-full ${priority.color} bg-opacity-20`}>
                {priority.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => onEdit(goal)}
            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg transition-all"
            title="Edit goal"
          >
            {React.createElement(getIcon("Pencil"), { className: "h-4 w-4" })}
          </Button>
          <Button
            onClick={() => onDelete(goal)}
            className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 rounded-lg transition-all"
            title="Delete goal"
          >
            {React.createElement(getIcon("XCircle"), { className: "h-4 w-4" })}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(progressPercentage, 100)}%`,
                backgroundColor: goal.color,
              }}
            />
          </div>
        </div>

        {/* Amount Information */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Current:</span>
            <div className="font-bold text-green-600">${goal.currentAmount.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-gray-600">Target:</span>
            <div className="font-bold">${goal.targetAmount.toFixed(2)}</div>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex justify-between items-center text-sm">
          {timeRemaining && (
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full border ${getTimeRemainingColor(timeRemaining.status)}`}
            >
              {React.createElement(getIcon("Calendar"), {
                className: "h-3 w-3",
              })}
              <span>{timeRemaining.text}</span>
            </div>
          )}
          <div className="text-gray-600">
            <span className="font-medium">
              ${(goal.targetAmount - goal.currentAmount).toFixed(2)}
            </span>{" "}
            remaining
          </div>
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">{goal.description}</p>
        )}
      </div>
    </div>
  );
};

export default SavingsGoalCard;
