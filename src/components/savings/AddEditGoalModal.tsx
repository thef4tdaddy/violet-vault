// components/savings/AddEditGoalModal.jsx
import React, { useState, useEffect } from "react";
import { getIcon } from "../../utils";
import {
  SAVINGS_CATEGORIES,
  SAVINGS_PRIORITIES,
  SAVINGS_COLORS,
} from "../../utils/savings/savingsFormUtils";

const AddEditGoalModal = ({ isOpen, onClose, onSubmit, editingGoal = null }) => {
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

  // Reset form when modal opens/closes or when editing goal changes
  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        setFormData({
          name: editingGoal.name || "",
          targetAmount: editingGoal.targetAmount?.toString() || "",
          currentAmount: editingGoal.currentAmount?.toString() || "",
          targetDate: editingGoal.targetDate || "",
          category: editingGoal.category || "General",
          color: editingGoal.color || "#3B82F6",
          description: editingGoal.description || "",
          priority: editingGoal.priority || "medium",
        });
      } else {
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
      }
    }
  }, [isOpen, editingGoal]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim() || !formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      return;
    }

    const goalData = {
      name: formData.name.trim(),
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      targetDate: formData.targetDate || null,
      category: formData.category,
      color: formData.color,
      description: formData.description.trim(),
      priority: formData.priority,
    };

    onSubmit(goalData, editingGoal?.id);
  };

  const handleClose = () => {
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {editingGoal ? "Edit Savings Goal" : "Add New Savings Goal"}
          </h3>
          <Button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            {React.createElement(getIcon("X"), { className: "h-6 w-6" })}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Goal Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Emergency Fund, Vacation, New Car"
                required
              />
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
                required
              />
            </div>

            {/* Current Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount</label>
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

            {/* Target Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date (Optional)
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {SAVINGS_PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {SAVINGS_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {SAVINGS_COLORS.map((color) => (
                  <Button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? "border-gray-800" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows="3"
                placeholder="Add any additional details about this savings goal..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              {React.createElement(getIcon("Save"), { className: "h-4 w-4" })}
              <span>{editingGoal ? "Update Goal" : "Create Goal"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditGoalModal;
