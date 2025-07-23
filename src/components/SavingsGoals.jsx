// components/SavingsGoals.jsx
import React, { useState } from "react";
import {
  Target,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  Gift,
  Trash2,
  Edit3,
  X,
  Save,
} from "lucide-react";

const SavingsGoals = ({
  savingsGoals,
  unassignedCash,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDistributeToGoals,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [distribution, setDistribution] = useState({});
  const [totalToDistribute, setTotalToDistribute] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    category: "General",
    color: "#3B82F6",
    description: "",
    priority: "medium",
  });

  const categories = [
    "Emergency Fund",
    "Vacation",
    "Car",
    "Home",
    "Education",
    "Electronics",
    "General",
    "Investment",
    "Gift",
    "Other",
  ];

  const priorities = [
    { value: "high", label: "High Priority", color: "bg-red-100 text-red-800" },
    {
      value: "medium",
      label: "Medium Priority",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "low",
      label: "Low Priority",
      color: "bg-green-100 text-green-800",
    },
  ];

  const colors = [
    "#3B82F6",
    "#10B981",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#EF4444",
    "#14B8A6",
    "#6366F1",
    "#84CC16",
    "#F97316",
    "#06B6D4",
    "#8B5A2B",
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      targetAmount: "",
      currentAmount: "",
      targetDate: "",
      category: "General",
      color: "#3B82F6",
      description: "",
      priority: "medium",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.targetAmount) {
      alert("Please fill in goal name and target amount");
      return;
    }

    const targetAmount = parseFloat(formData.targetAmount);
    const currentAmount = parseFloat(formData.currentAmount) || 0;

    if (targetAmount <= 0) {
      alert("Target amount must be greater than 0");
      return;
    }

    if (currentAmount > targetAmount) {
      alert("Current amount cannot be greater than target amount");
      return;
    }

    const goalData = {
      ...formData,
      targetAmount,
      currentAmount,
      createdAt: new Date().toISOString(),
    };

    if (editingGoal) {
      onUpdateGoal(editingGoal.id, goalData);
      setEditingGoal(null);
    } else {
      onAddGoal(goalData);
      setShowAddForm(false);
    }

    resetForm();
  };

  const startEdit = (goal) => {
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate || "",
      category: goal.category,
      color: goal.color,
      description: goal.description || "",
      priority: goal.priority,
    });
    setEditingGoal(goal);
    setShowAddForm(false);
  };

  const handleDelete = (goal) => {
    if (
      confirm(
        `Are you sure you want to delete the savings goal "${goal.name}"?`
      )
    ) {
      onDeleteGoal(goal.id);
    }
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getTimeRemaining = (targetDate) => {
    if (!targetDate) return null;

    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Past due", color: "text-red-600" };
    if (diffDays === 0) return { text: "Today", color: "text-orange-600" };
    if (diffDays === 1) return { text: "1 day left", color: "text-orange-600" };
    if (diffDays <= 30)
      return { text: `${diffDays} days`, color: "text-blue-600" };

    const months = Math.floor(diffDays / 30);
    return {
      text: `${months} month${months !== 1 ? "s" : ""}`,
      color: "text-gray-600",
    };
  };

  const initializeDistribution = () => {
    const dist = {};
    savingsGoals.forEach((goal) => {
      dist[goal.id] = "";
    });
    setDistribution(dist);
    setTotalToDistribute("");
  };

  const handleDistributeModalOpen = () => {
    initializeDistribution();
    setShowDistributeModal(true);
  };

  const calculateDistributionTotal = () => {
    return Object.values(distribution).reduce((sum, amount) => {
      return sum + (parseFloat(amount) || 0);
    }, 0);
  };

  const handleAutoDistribute = () => {
    const amount = parseFloat(totalToDistribute) || 0;
    if (amount <= 0 || amount > unassignedCash) return;

    // Sort goals by priority and progress
    const sortedGoals = [...savingsGoals].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;

      if (aPriority !== bPriority) return bPriority - aPriority;

      // If same priority, sort by progress (less complete first)
      const aProgress = getProgressPercentage(a.currentAmount, a.targetAmount);
      const bProgress = getProgressPercentage(b.currentAmount, b.targetAmount);
      return aProgress - bProgress;
    });

    let remainingAmount = amount;
    const newDistribution = {};

    sortedGoals.forEach((goal) => {
      const needed = goal.targetAmount - goal.currentAmount;
      const allocation = Math.min(needed, remainingAmount / sortedGoals.length);

      if (allocation > 0 && remainingAmount > 0) {
        newDistribution[goal.id] = Math.min(
          allocation,
          remainingAmount
        ).toFixed(2);
        remainingAmount -= allocation;
      }
    });

    setDistribution(newDistribution);
  };

  const handleDistribute = () => {
    const totalDistributed = calculateDistributionTotal();

    if (totalDistributed <= 0) {
      alert("Please enter amounts to distribute");
      return;
    }

    if (totalDistributed > unassignedCash) {
      alert("Total distribution exceeds available unassigned cash");
      return;
    }

    onDistributeToGoals(distribution, totalDistributed);
    setShowDistributeModal(false);
    initializeDistribution();
  };

  const totalSaved = savingsGoals.reduce(
    (sum, goal) => sum + goal.currentAmount,
    0
  );
  const totalTargets = savingsGoals.reduce(
    (sum, goal) => sum + goal.targetAmount,
    0
  );
  const overallProgress =
    totalTargets > 0 ? (totalSaved / totalTargets) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            Savings Goals ({savingsGoals.length})
          </h2>
          <p className="text-sm text-gray-800 mt-1">
            ${totalSaved.toFixed(2)} of ${totalTargets.toFixed(2)} saved (
            {overallProgress.toFixed(1)}%)
          </p>
        </div>
        <div className="flex gap-3">
          {unassignedCash > 0 && savingsGoals.length > 0 && (
            <button
              onClick={handleDistributeModalOpen}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 border border-emerald-500/50 font-semibold"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Distribute Cash
            </button>
          )}
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingGoal(null);
              resetForm();
            }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 border border-purple-500/50 font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      {savingsGoals.length === 0 ? (
        <div className="glassmorphism rounded-2xl p-8 text-center text-gray-500 border border-white/20">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>
            No savings goals yet. Click "Add Goal" to start saving for something
            special!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsGoals.map((goal) => {
            const progress = getProgressPercentage(
              goal.currentAmount,
              goal.targetAmount
            );
            const remaining = goal.targetAmount - goal.currentAmount;
            const timeInfo = getTimeRemaining(goal.targetDate);
            const priority = priorities.find((p) => p.value === goal.priority);

            return (
              <div
                key={goal.id}
                className="glassmorphism rounded-2xl p-6 hover:shadow-xl transition-all border border-white/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {goal.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${priority.color}`}
                      >
                        {priority.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => startEdit(goal)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Saved:</span>
                      <div className="font-bold text-green-600">
                        ${goal.currentAmount.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Target:</span>
                      <div className="font-bold">
                        ${goal.targetAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-medium ml-1">
                        ${remaining.toFixed(2)}
                      </span>
                    </div>
                    {timeInfo && (
                      <span className={timeInfo.color}>{timeInfo.text}</span>
                    )}
                  </div>

                  {goal.description && (
                    <p className="text-sm text-gray-600 border-t pt-2">
                      {goal.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {(showAddForm || editingGoal) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glassmorphism rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingGoal ? "Edit Savings Goal" : "Add New Savings Goal"}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingGoal(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Emergency Fund, Vacation, New Car"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.currentAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentAmount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          formData.color === color
                            ? "border-gray-800 scale-110"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="What are you saving for and why?"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingGoal(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 border border-purple-500/50 font-semibold"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingGoal ? "Update Goal" : "Add Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Distribute Cash Modal */}
      {showDistributeModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glassmorphism rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                Distribute Unassigned Cash
              </h3>
              <button
                onClick={() => setShowDistributeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800">
                  Available Unassigned Cash:
                </span>
                <span className="text-xl font-bold text-green-600">
                  ${unassignedCash.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount to Distribute
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    max={unassignedCash}
                    value={totalToDistribute}
                    onChange={(e) => setTotalToDistribute(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAutoDistribute}
                    disabled={!totalToDistribute}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Auto-Distribute
                  </button>
                </div>
              </div>

              {savingsGoals.map((goal) => {
                const remaining = goal.targetAmount - goal.currentAmount;
                const priority = priorities.find(
                  (p) => p.value === goal.priority
                );

                return (
                  <div key={goal.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                        <div>
                          <span className="font-medium">{goal.name}</span>
                          <span
                            className={`ml-2 text-xs px-2 py-1 rounded-full ${priority.color}`}
                          >
                            {priority.label}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        Need: ${remaining.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      max={Math.min(remaining, unassignedCash)}
                      value={distribution[goal.id] || ""}
                      onChange={(e) =>
                        setDistribution({
                          ...distribution,
                          [goal.id]: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                    />
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total to Distribute:</span>
                <span className="text-lg font-bold">
                  ${calculateDistributionTotal().toFixed(2)}
                </span>
              </div>
              {calculateDistributionTotal() > unassignedCash && (
                <p className="text-red-600 text-sm mt-1">
                  Exceeds available cash by $
                  {(calculateDistributionTotal() - unassignedCash).toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDistributeModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDistribute}
                disabled={
                  calculateDistributionTotal() <= 0 ||
                  calculateDistributionTotal() > unassignedCash
                }
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:transform-none font-semibold"
              >
                Distribute ${calculateDistributionTotal().toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoals;
