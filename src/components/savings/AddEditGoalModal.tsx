// components/savings/AddEditGoalModal.jsx
import { Select } from "@/components/ui";
import { Button } from "@/components/ui";
import React, { useState, useEffect } from "react";
import { getIcon } from "@/utils";
import {
  SAVINGS_CATEGORIES,
  SAVINGS_PRIORITIES,
  SAVINGS_COLORS,
} from "@/utils/savings/savingsFormUtils";

const getInitialFormData = () => ({
  name: "",
  targetAmount: "",
  currentAmount: "",
  targetDate: "",
  category: "General",
  color: "#3B82F6",
  description: "",
  priority: "medium",
});

const mapGoalToFormData = (goal) => ({
  name: goal.name || "",
  targetAmount: goal.targetAmount?.toString() || "",
  currentAmount: goal.currentAmount?.toString() || "",
  targetDate: goal.targetDate || "",
  category: goal.category || "General",
  color: goal.color || "#3B82F6",
  description: goal.description || "",
  priority: goal.priority || "medium",
});

const validateFormData = (formData) => {
  return formData.name.trim() && formData.targetAmount && parseFloat(formData.targetAmount) > 0;
};

const createGoalData = (formData) => ({
  name: formData.name.trim(),
  targetAmount: parseFloat(formData.targetAmount),
  currentAmount: parseFloat(formData.currentAmount) || 0,
  targetDate: formData.targetDate || null,
  category: formData.category,
  color: formData.color,
  description: formData.description.trim(),
  priority: formData.priority,
});

const AddEditGoalModal = ({ isOpen, onClose, onSubmit, editingGoal = null }) => {
  const [formData, setFormData] = useState(getInitialFormData());

  // Reset form when modal opens/closes or when editing goal changes
  useEffect(() => {
    if (isOpen) {
      setFormData(editingGoal ? mapGoalToFormData(editingGoal) : getInitialFormData());
    }
  }, [isOpen, editingGoal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateFormData(formData)) return;
    onSubmit(createGoalData(formData), editingGoal?.id);
  };

  const handleClose = () => {
    setFormData(getInitialFormData());
    onClose();
  };

  if (!isOpen) return null;

  const updateFormField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
        <ModalHeader
          title={editingGoal ? "Edit Savings Goal" : "Add New Savings Goal"}
          onClose={handleClose}
        />
        <form onSubmit={handleSubmit} className="space-y-6">
          <GoalFormFields formData={formData} updateFormField={updateFormField} />
          <FormActions onCancel={handleClose} isEdit={!!editingGoal} />
        </form>
      </div>
    </div>
  );
};

const ModalHeader = ({ title, onClose }) => (
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-xl font-semibold">{title}</h3>
    <Button onClick={onClose} className="text-gray-400 hover:text-gray-600">
      {React.createElement(getIcon("X"), { className: "h-6 w-6" })}
    </Button>
  </div>
);

const GoalFormFields = ({ formData, updateFormField }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name *</label>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => updateFormField("name", e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        placeholder="e.g., Emergency Fund, Vacation, New Car"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount *</label>
      <input
        type="number"
        step="0.01"
        value={formData.targetAmount}
        onChange={(e) => updateFormField("targetAmount", e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        placeholder="0.00"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount</label>
      <input
        type="number"
        step="0.01"
        value={formData.currentAmount}
        onChange={(e) => updateFormField("currentAmount", e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        placeholder="0.00"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Target Date (Optional)</label>
      <input
        type="date"
        value={formData.targetDate}
        onChange={(e) => updateFormField("targetDate", e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
      <Select
        value={formData.priority}
        onChange={(e) => updateFormField("priority", e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
      >
        {SAVINGS_PRIORITIES.map((priority) => (
          <option key={priority.value} value={priority.value}>
            {priority.label}
          </option>
        ))}
      </Select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
      <Select
        value={formData.category}
        onChange={(e) => updateFormField("category", e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
      >
        {SAVINGS_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>
    </div>
    <ColorPicker
      selectedColor={formData.color}
      onColorSelect={(color) => updateFormField("color", color)}
    />
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
      <textarea
        value={formData.description}
        onChange={(e) => updateFormField("description", e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        rows={3}
        placeholder="Add any additional details about this savings goal..."
      />
    </div>
  </div>
);

const ColorPicker = ({ selectedColor, onColorSelect }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
    <div className="flex gap-2 flex-wrap">
      {SAVINGS_COLORS.map((color) => (
        <Button
          key={color}
          type="button"
          onClick={() => onColorSelect(color)}
          className={`w-8 h-8 rounded-full border-2 ${
            selectedColor === color ? "border-gray-800" : "border-gray-300"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  </div>
);

const FormActions = ({ onCancel, isEdit }) => (
  <div className="flex justify-end space-x-3 pt-4 border-t">
    <Button
      type="button"
      onClick={onCancel}
      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
    >
      Cancel
    </Button>
    <Button
      type="submit"
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
    >
      {React.createElement(getIcon("Save"), { className: "h-4 w-4" })}
      <span>{isEdit ? "Update Goal" : "Create Goal"}</span>
    </Button>
  </div>
);

export default AddEditGoalModal;
