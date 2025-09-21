import React from "react";
import { getIcon } from "../../utils";
import useEnvelopeForm from "../../hooks/budgeting/useEnvelopeForm";
import { useMobileDetection } from "../../hooks/ui/useMobileDetection";
import SlideUpModal from "../mobile/SlideUpModal";
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
  _forceMobileMode = false, // Internal prop for testing
}) => {
  const isMobile = useMobileDetection();

  const {
    // Form state
    formData,
    errors,
    isLoading,
    canSubmit,
    calculatedAmounts,
    _isDirty,

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

  // Extract the modal content into a component for reuse
  const ModalContent = () => (
    <div className="space-y-6">
      {/* Envelope Type Selection */}
      <EnvelopeTypeSelector
        selectedType={formData.envelopeType}
        onChange={(type) => updateFormField("envelopeType", type)}
        disabled={isLoading}
      />

      {/* Basic Fields */}
      <EnvelopeBasicFields
        formData={formData}
        errors={errors}
        onChange={updateFormField}
        disabled={isLoading}
      />

      {/* Budget Fields */}
      <EnvelopeBudgetFields
        formData={formData}
        errors={errors}
        calculatedAmounts={calculatedAmounts}
        onChange={updateFormField}
        disabled={isLoading}
        showBiweeklyPreview={true}
      />

      {/* Allocation Mode */}
      <AllocationModeSelector
        selectedMode={formData.allocationMode}
        onChange={(mode) => updateFormField("allocationMode", mode)}
        disabled={isLoading}
      />

      {/* Bill Connection */}
      {allBills.length > 0 && (
        <BillConnectionSelector
          bills={allBills}
          selectedBillId={formData.billId}
          onChange={handleBillSelection}
          onCreateBill={onCreateBill}
          disabled={isLoading}
        />
      )}

      {/* Color Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Envelope Color
        </label>
        <div className="grid grid-cols-8 gap-2">
          {[
            "#ef4444", // red
            "#f97316", // orange
            "#eab308", // yellow
            "#22c55e", // green
            "#06b6d4", // cyan
            "#3b82f6", // blue
            "#8b5cf6", // violet
            "#ec4899", // pink
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

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={handleClose}
          className="px-6 py-2 border-2 border-black text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-green-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading}
          className="flex items-center px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 border-2 border-black disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {React.createElement(getIcon("Save"), { className: "h-4 w-4 mr-2" })}
          {isLoading ? "Creating..." : "Create Envelope"}
        </button>
      </div>
    </div>
  );

  // Mobile slide-up modal
  if (isMobile || _forceMobileMode) {
    return (
      <SlideUpModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Create Envelope"
        height="auto"
        showHandle={true}
        backdrop={true}
      >
        <div className="px-6 pb-6">
          <ModalContent />
        </div>
      </SlideUpModal>
    );
  }

  // Desktop centered modal
  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-xl mr-3">
                {React.createElement(getIcon("Plus"), {
                  className: "h-5 w-5 text-white",
                })}
              </div>
              <div>
                <h2 className="font-black text-white text-base">
                  <span className="text-lg">C</span>REATE{" "}
                  <span className="text-lg">E</span>NVELOPE
                </h2>
                <p className="text-green-100 text-sm">
                  Set up a new budget envelope
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {React.createElement(getIcon("X"), { className: "h-5 w-5" })}
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <ModalContent />
        </div>
      </div>
    </div>
  );
};

export default CreateEnvelopeModal;
