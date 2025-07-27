// components/BillManager.jsx
import React, { useState } from "react";
import { Plus, Edit3, Trash2, Calendar, DollarSign, Clock, Save, X } from "lucide-react";

const BillManager = ({ bills, onAddBill, onUpdateBill, onDeleteBill, onAddEnvelope }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    frequency: "monthly",
    dueDate: "",
    category: "Bills",
    color: "#3B82F6",
    notes: "",
    createEnvelope: true,
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

  // Calculate how much needs to be saved biweekly for any bill frequency
  const calculateBiweeklyAmount = (amount, frequency, customFrequency = 1) => {
    const yearlyAmount =
      frequency === "custom"
        ? amount * customFrequency
        : amount * frequencies.find((f) => f.value === frequency)?.multiplier || 12;

    return yearlyAmount / 26; // 26 biweekly periods per year
  };

  const calculateMonthlyAmount = (amount, frequency, customFrequency = 1) => {
    const yearlyAmount =
      frequency === "custom"
        ? amount * customFrequency
        : amount * frequencies.find((f) => f.value === frequency)?.multiplier || 12;

    return yearlyAmount / 12; // 12 months per year
  };

  const getNextDueDate = (frequency, currentDue) => {
    if (!currentDue) return "";

    const date = new Date(currentDue);

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
        return currentDue;
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
      customFrequency: "",
      createEnvelope: true,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.amount) {
      alert("Please fill in bill name and amount");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    const billData = {
      ...formData,
      id: editingBill
        ? editingBill.id
        : `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      customFrequency:
        formData.frequency === "custom" ? parseFloat(formData.customFrequency) || 1 : undefined,
      biweeklyAmount: calculateBiweeklyAmount(amount, formData.frequency, formData.customFrequency),
      monthlyAmount: calculateMonthlyAmount(amount, formData.frequency, formData.customFrequency),
      nextDueDate: getNextDueDate(formData.frequency, formData.dueDate),
    };

    if (editingBill) {
      onUpdateBill(editingBill.id, billData);
      setEditingBill(null);
    } else {
      onAddBill(billData);

      // Create envelope if requested
      if (formData.createEnvelope && onAddEnvelope) {
        const envelopeData = {
          id: `envelope_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: formData.name,
          targetAmount: billData.biweeklyAmount,
          currentBalance: 0,
          category: formData.category,
          color: formData.color,
          priority: "medium",
          dueDate: formData.dueDate,
          billId: billData.id,
          notes: `Auto-created for ${formData.name} bill`,
        };
        onAddEnvelope(envelopeData);
      }

      setShowAddForm(false);
    }

    resetForm();
  };

  const startEdit = (bill) => {
    setFormData({
      name: bill.name,
      amount: bill.amount,
      frequency: bill.frequency,
      dueDate: bill.dueDate,
      category: bill.category,
      color: bill.color,
      notes: bill.notes || "",
      customFrequency: bill.customFrequency || "",
      createEnvelope: false, // Don't show toggle for editing
    });
    setEditingBill(bill);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setShowAddForm(false);
    setEditingBill(null);
    resetForm();
  };

  const handleDelete = (bill) => {
    if (
      confirm(`Are you sure you want to delete "${bill.name}"? This will also remove its envelope.`)
    ) {
      onDeleteBill(bill.id);
    }
  };

  const getFrequencyLabel = (bill) => {
    if (bill.frequency === "custom") {
      return `${bill.customFrequency}x per year`;
    }
    return frequencies.find((f) => f.value === bill.frequency)?.label || bill.frequency;
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Overdue", color: "text-red-600" };
    if (diffDays === 0) return { text: "Due Today", color: "text-red-600" };
    if (diffDays === 1) return { text: "Due Tomorrow", color: "text-orange-600" };
    if (diffDays <= 7) return { text: `${diffDays} days`, color: "text-orange-600" };
    if (diffDays <= 30) return { text: `${diffDays} days`, color: "text-blue-600" };

    return {
      text: `${Math.floor(diffDays / 30)} months`,
      color: "text-gray-600",
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Manage Bills ({bills.length})
        </h2>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingBill(null);
            resetForm();
          }}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 border border-purple-500/50 font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bill
        </button>
      </div>

      {/* Bills List */}
      <div className="glassmorphism rounded-2xl border border-white/20 shadow-xl overflow-hidden">
        {bills.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No bills added yet. Click "Add Bill" to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bills.map((bill, index) => {
              const dueInfo = getDaysUntilDue(bill.dueDate);

              return (
                <div key={bill.id || `bill-${index}`} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: bill.color }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">{bill.name}</h3>
                          <span className="text-sm px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                            {bill.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />${bill.amount.toFixed(2)}{" "}
                            {getFrequencyLabel(bill)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />${bill.biweeklyAmount.toFixed(2)}{" "}
                            biweekly
                          </div>
                          {dueInfo && (
                            <div className={`flex items-center ${dueInfo.color}`}>
                              <Calendar className="h-4 w-4 mr-1" />
                              {dueInfo.text}
                            </div>
                          )}
                        </div>
                        {bill.notes && <p className="text-sm text-gray-500 mt-1">{bill.notes}</p>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(bill)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bill)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingBill) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glassmorphism rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingBill ? "Edit Bill" : "Add New Bill"}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingBill(null);
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

                {!editingBill && (
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
                )}
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
                  {editingBill ? "Update Bill" : "Add Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(BillManager);
