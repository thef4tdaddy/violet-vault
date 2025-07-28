// Extracted from old BillManager - proper bill creation modal
import React, { useState } from "react";
import { X, Save } from "lucide-react";

const AddBillModal = ({ isOpen, onClose, onAddBill, onAddEnvelope }) => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    frequency: "monthly",
    dueDate: "",
    category: "Bills",
    color: "#3B82F6",
    notes: "",
    createEnvelope: true,
    customFrequency: "",
  });

  const frequencies = [
    { value: "weekly", label: "Weekly", multiplier: 52 },
    { value: "biweekly", label: "Bi-weekly", multiplier: 26 },
    { value: "monthly", label: "Monthly", multiplier: 12 },
    { value: "quarterly", label: "Quarterly", multiplier: 4 },
    { value: "semiannual", label: "Semi-annual", multiplier: 2 },
    { value: "yearly", label: "Yearly", multiplier: 1 },
    { value: "custom", label: "Custom", multiplier: 1 },
  ];

  const categories = [
    "Bills",
    "Housing",
    "Transportation",
    "Insurance",
    "Subscriptions",
    "Healthcare",
    "Debt",
    "Savings",
    "Other",
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

  if (!isOpen) return null;

  // Calculate how much needs to be saved biweekly for any bill frequency
  const calculateBiweeklyAmount = (amount, frequency, customFrequency = 1) => {
    const yearlyAmount =
      frequency === "custom"
        ? amount * customFrequency
        : amount * (frequencies.find((f) => f.value === frequency)?.multiplier || 1);
    return yearlyAmount / 26; // 26 biweekly periods per year
  };

  const calculateMonthlyAmount = (amount, frequency, customFrequency = 1) => {
    const yearlyAmount =
      frequency === "custom"
        ? amount * customFrequency
        : amount * (frequencies.find((f) => f.value === frequency)?.multiplier || 1);
    return yearlyAmount / 12; // 12 months per year
  };

  const getNextDueDate = (frequency, dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();

    // If the due date is in the future, return as is
    if (date > now) return dueDate;

    // Calculate next occurrence based on frequency
    switch (frequency) {
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "biweekly":
        date.setDate(date.getDate() + 14);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "semiannual":
        date.setMonth(date.getMonth() + 6);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        return dueDate;
    }

    return date.toISOString().split("T")[0];
  };

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      frequency: "monthly",
      dueDate: "",
      category: "Bills",
      color: "#3B82F6",
      notes: "",
      createEnvelope: true,
      customFrequency: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.amount) {
      return;
    }

    const amount = parseFloat(formData.amount);

    const billData = {
      id: `bill_${Date.now()}`,
      name: formData.name.trim(),
      amount,
      frequency: formData.frequency,
      category: formData.category,
      color: formData.color,
      notes: formData.notes,
      dueDate: formData.dueDate,
      customFrequency:
        formData.frequency === "custom" ? parseFloat(formData.customFrequency) || 1 : undefined,
      biweeklyAmount: calculateBiweeklyAmount(amount, formData.frequency, formData.customFrequency),
      monthlyAmount: calculateMonthlyAmount(amount, formData.frequency, formData.customFrequency),
      nextDueDate: getNextDueDate(formData.frequency, formData.dueDate),
      // For unified system compatibility
      type: "recurring_bill",
      isPaid: false,
      source: "manual",
      provider: formData.name.trim(),
      description: formData.name.trim(),
      createdAt: new Date().toISOString(),
      date: formData.dueDate || new Date().toISOString().split("T")[0],
    };

    onAddBill?.(billData);

    // Create associated envelope if requested
    if (formData.createEnvelope && onAddEnvelope) {
      const envelopeData = {
        id: `envelope_${Date.now()}`,
        name: formData.name.trim(),
        budget: calculateMonthlyAmount(amount, formData.frequency, formData.customFrequency),
        currentBalance: 0,
        color: formData.color,
        category: formData.category,
        notes: `Auto-created for ${formData.name} bill`,
      };
      onAddEnvelope(envelopeData);
    }

    resetForm();
    onClose();
  };

  const cancelEdit = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Add New Bill</h3>
          <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Car Insurance, Netflix, Property Tax"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.frequency === "custom" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Times per Year
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.customFrequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customFrequency: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3 for every 4 months"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
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
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes about this bill..."
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-start space-x-3">
                <input
                  id="create-envelope-checkbox"
                  type="checkbox"
                  checked={formData.createEnvelope}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      createEnvelope: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1 flex-shrink-0"
                />
                <label htmlFor="create-envelope-checkbox" className="flex-1">
                  <span className="text-sm font-medium text-gray-700 block">
                    Create associated envelope for budgeting
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    This will create an envelope to help you save for this bill
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.amount && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Savings Preview:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Monthly equivalent:</span>
                  <span className="font-medium ml-2">
                    $
                    {calculateMonthlyAmount(
                      parseFloat(formData.amount) || 0,
                      formData.frequency,
                      formData.customFrequency
                    ).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Biweekly needed:</span>
                  <span className="font-medium ml-2">
                    $
                    {calculateBiweeklyAmount(
                      parseFloat(formData.amount) || 0,
                      formData.frequency,
                      formData.customFrequency
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 border border-purple-400/30 w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Add Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBillModal;