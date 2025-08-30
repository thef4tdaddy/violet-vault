import React from "react";
import { Save, Plus, X, Palette } from "lucide-react";
import useEnvelopeForm from "../../hooks/budgeting/useEnvelopeForm";
import EnvelopeTypeSelector from "./shared/EnvelopeTypeSelector";
import EnvelopeBasicFields from "./envelope/EnvelopeBasicFields";
import EnvelopeBudgetFields from "./envelope/EnvelopeBudgetFields";
import AllocationModeSelector from "./shared/AllocationModeSelector";
import BillConnectionSelector from "./shared/BillConnectionSelector";

const CreateEnvelopeModal = ({
  isOpen = false,
  onClose,
  onCreateEnvelope,
  onCreateBill,
  existingEnvelopes = [],
  allBills = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
}) => {
  const {
    // Form state
    formData,
    errors,
    isLoading,
    canSubmit,
    calculatedAmounts,
    isDirty,

    // Form actions
    updateFormField,
    updateFormData,
    handleSubmit,
    handleClose,
  } = useEnvelopeForm({
    envelope: null, // New envelope
    existingEnvelopes,
    onSave: onCreateEnvelope,
    onClose,
    currentUser,
  });

  // Handle bill selection and auto-populate envelope data
  const handleBillSelection = (billId) => {
    if (!billId) return;

    const selectedBill = allBills.find((bill) => bill.id === billId);
    if (!selectedBill) return;

    // Auto-populate envelope fields from the selected bill
    const billData = {
      name: selectedBill.name || selectedBill.provider || "",
      category: selectedBill.category || "",
      color: selectedBill.color || formData.color,
      frequency: selectedBill.frequency || formData.frequency,
      monthlyAmount: selectedBill.amount?.toString() || "",
      description: `Bill envelope for ${selectedBill.name || selectedBill.provider}`,
      envelopeType: "BILL", // Set to bill type when bill is selected
    };

    updateFormData(billData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-xl mr-3">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create Envelope</h2>
                <p className="text-green-100 text-sm">Set up a new budget envelope</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Envelope Type Selection */}
            <EnvelopeTypeSelector
              selectedType={formData.envelopeType}
              onTypeChange={(type) => updateFormField("envelopeType", type)}
              canEdit={true}
            />

            {/* Bill Connection (Optional) */}
            <BillConnectionSelector
              selectedBillId=""
              onBillSelection={handleBillSelection}
              allBills={allBills}
              onCreateBill={onCreateBill}
              canEdit={true}
            />

            {/* Basic Information */}
            <EnvelopeBasicFields
              formData={formData}
              onUpdateField={updateFormField}
              errors={errors}
              canEdit={true}
            />

            {/* Budget Settings */}
            <EnvelopeBudgetFields
              formData={formData}
              onUpdateField={updateFormField}
              errors={errors}
              calculatedAmounts={calculatedAmounts}
              canEdit={true}
            />

            {/* Allocation Mode */}
            <AllocationModeSelector
              selectedMode={formData.priority || "medium"}
              autoAllocate={formData.autoAllocate}
              onModeChange={(priority) => updateFormField("priority", priority)}
              onAutoAllocateChange={(autoAllocate) => updateFormField("autoAllocate", autoAllocate)}
              canEdit={true}
            />

            {/* Color Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Palette className="h-4 w-4 mr-2 text-green-600" />
                Appearance
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    "#a855f7",
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#06b6d4",
                    "#84cc16",
                    "#f97316",
                    "#ec4899",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateFormField("color", color)}
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-green-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isLoading}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Creating..." : "Create Envelope"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEnvelopeModal;
