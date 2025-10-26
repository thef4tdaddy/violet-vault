import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import useEnvelopeForm from "../../hooks/budgeting/useEnvelopeForm";
import { useMobileDetection } from "../../hooks/ui/useMobileDetection";
import SlideUpModal from "../mobile/SlideUpModal";
import EnvelopeTypeSelector from "./shared/EnvelopeTypeSelector";
import EnvelopeBasicFields from "./envelope/EnvelopeBasicFields";
import EnvelopeBudgetFields from "./envelope/EnvelopeBudgetFields";
import AllocationModeSelector from "./shared/AllocationModeSelector";
import BillConnectionSelector from "./shared/BillConnectionSelector";

// Constants
const ENVELOPE_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

// Color selector component
const ColorSelector = ({ 
  selectedColor, 
  onColorChange, 
  disabled 
}: { 
  selectedColor: string; 
  onColorChange: (color: string) => void; 
  disabled: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Envelope Color</label>
    <div className="grid grid-cols-8 gap-2">
      {ENVELOPE_COLORS.map((color) => (
        <Button
          key={color}
          type="button"
          onClick={() => onColorChange(color)}
          disabled={disabled}
          className={`w-8 h-8 rounded-lg border-2 transition-all ${
            selectedColor === color
              ? "border-gray-800 scale-110"
              : "border-gray-200 hover:border-gray-400"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  </div>
);

// Modal actions component
const ModalActions = ({ 
  onClose, 
  onSubmit, 
  canSubmit, 
  isLoading 
}: { 
  onClose: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isLoading: boolean;
}) => (
  <div className="flex justify-end gap-3 pt-4">
    <Button
      type="button"
      onClick={onClose}
      className="px-6 py-2 border-2 border-black text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-green-500 transition-colors"
    >
      Cancel
    </Button>
    <Button
      type="submit"
      onClick={onSubmit}
      disabled={!canSubmit || isLoading}
      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-purple-500 transition-all"
    >
      {isLoading ? "Creating..." : "Create Envelope"}
    </Button>
  </div>
);

// Main modal content
const ModalContentSection = ({
  formData,
  errors,
  calculatedAmounts,
  updateFormField,
  isLoading,
  allBills,
  handleBillSelection,
  onCreateBill,
}: {
  formData: unknown;
  errors: unknown;
  calculatedAmounts: unknown;
  updateFormField: (field: string, value: unknown) => void;
  isLoading: boolean;
  allBills: unknown[];
  handleBillSelection: (billId: string) => void;
  onCreateBill?: () => void;
}) => (
  <div className="space-y-6">
    <EnvelopeTypeSelector
      selectedType={(formData as { envelopeType: string }).envelopeType}
      onTypeChange={(type) => updateFormField("envelopeType", type)}
      disabled={isLoading}
    />

    <EnvelopeBasicFields
      formData={formData}
      errors={errors}
      onUpdateField={updateFormField}
      disabled={isLoading}
    />

    <EnvelopeBudgetFields
      formData={formData}
      errors={errors}
      calculatedAmounts={calculatedAmounts}
      onUpdateField={updateFormField}
      disabled={isLoading}
      showBiweeklyPreview={true}
    />

    <AllocationModeSelector
      autoAllocate={(formData as { autoAllocate: boolean }).autoAllocate}
      onAutoAllocateChange={(value) => updateFormField("autoAllocate", value)}
      disabled={isLoading}
    />

    {allBills.length > 0 && (
      <BillConnectionSelector
        allBills={allBills}
        selectedBillId={(formData as { billId?: string }).billId}
        onBillSelection={handleBillSelection}
        onCreateBill={onCreateBill}
        disabled={isLoading}
      />
    )}

    <ColorSelector
      selectedColor={(formData as { color: string }).color}
      onColorChange={(color) => updateFormField("color", color)}
      disabled={isLoading}
    />
  </div>
);

const CreateEnvelopeModal = ({
  isOpen = false,
  onClose,
  onCreateEnvelope,
  onCreateBill,
  existingEnvelopes = [],
  allBills = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
  _forceMobileMode = false,
}) => {
  const isMobile = useMobileDetection();

  const {
    formData,
    errors,
    isLoading,
    canSubmit,
    calculatedAmounts,
    updateFormField,
    updateFormData,
    handleSubmit,
    handleClose,
  } = useEnvelopeForm({
    envelope: null,
    existingEnvelopes,
    onSave: onCreateEnvelope,
    onClose,
    currentUser,
  });

  const handleBillSelection = (billId) => {
    if (!billId) return;

    const selectedBill = allBills.find((bill) => bill.id === billId);
    if (!selectedBill) return;

    const billData = {
      name: selectedBill.name || selectedBill.provider || "",
      category: selectedBill.category || "",
      color: selectedBill.color || formData.color,
      frequency: selectedBill.frequency || formData.frequency,
      monthlyAmount: selectedBill.amount?.toString() || "",
      description: `Bill envelope for ${selectedBill.name || selectedBill.provider}`,
      envelopeType: "BILL",
    };

    updateFormData(billData);
  };

  if (!isOpen) return null;

  const content = (
    <>
      <ModalContentSection
        formData={formData}
        errors={errors}
        calculatedAmounts={calculatedAmounts}
        updateFormField={updateFormField}
        isLoading={isLoading}
        allBills={allBills}
        handleBillSelection={handleBillSelection}
        onCreateBill={onCreateBill}
      />
      <ModalActions
        onClose={handleClose}
        onSubmit={handleSubmit}
        canSubmit={canSubmit}
        isLoading={isLoading}
      />
    </>
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
        <div className="px-6 pb-6">{content}</div>
      </SlideUpModal>
    );
  }

  // Desktop centered modal
  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-xl mr-3">
                {React.createElement(getIcon("Plus"), { className: "h-5 w-5 text-white" })}
              </div>
              <div>
                <h2 className="font-black text-white text-base">
                  <span className="text-lg">C</span>REATE <span className="text-lg">E</span>NVELOPE
                </h2>
                <p className="text-green-100 text-sm">Set up a new budget envelope</p>
              </div>
            </div>
            <Button
              onClick={handleClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {React.createElement(getIcon("X"), { className: "h-5 w-5" })}
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {content}
        </div>
      </div>
    </div>
  );
};

export default CreateEnvelopeModal;
