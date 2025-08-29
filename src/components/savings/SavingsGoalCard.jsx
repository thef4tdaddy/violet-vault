// components/savings/SavingsGoalCard.jsx
import React from "react";
import { Edit3, Trash2, Calendar } from "lucide-react";

const SavingsGoalCard = ({ goal, onEdit, onDelete, priorities }) => {
  const getProgressPercentage = (current, target) => {
    return target > 0 ? (current / target) * 100 : 0;
  };

  const getTimeRemaining = (targetDate) => {
    if (!targetDate) return null;
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Overdue", status: "overdue" };
    if (diffDays === 0) return { text: "Due today", status: "due" };
    if (diffDays <= 7)
      return { text: `${diffDays} days left`, status: "urgent" };
    if (diffDays <= 30)
      return { text: `${diffDays} days left`, status: "soon" };

    const diffWeeks = Math.ceil(diffDays / 7);
    const diffMonths = Math.ceil(diffDays / 30);

    if (diffDays <= 84)
      return { text: `${diffWeeks} weeks left`, status: "normal" };
    return { text: `${diffMonths} months left`, status: "normal" };
  };

  const progressPercentage = getProgressPercentage(
    goal.currentAmount,
    goal.targetAmount,
  );
  const timeRemaining = getTimeRemaining(goal.targetDate);
  const priority = priorities.find((p) => p.value === goal.priority);

  const getTimeRemainingColor = (status) => {
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
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: goal.color }}
          />
          <div>
            <h3 className="font-semibold text-lg">{goal.name}</h3>
            {priority && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${priority.color} bg-opacity-20`}
              >
                {priority.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(goal)}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(goal)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span className="font-medium">
              {progressPercentage.toFixed(1)}%
            </span>
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
            <div className="font-bold text-green-600">
              ${goal.currentAmount.toFixed(2)}
            </div>
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
              <Calendar className="h-3 w-3" />
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
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
            {goal.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default SavingsGoalCard;
