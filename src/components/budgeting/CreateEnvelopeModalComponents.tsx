import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import EnvelopeTypeSelector from "./shared/EnvelopeTypeSelector";
import EnvelopeBasicFields from "./envelope/EnvelopeBasicFields";
import EnvelopeBudgetFields from "./envelope/EnvelopeBudgetFields";
import AllocationModeSelector from "./shared/AllocationModeSelector";
import BillConnectionSelector from "./shared/BillConnectionSelector";
import { ENVELOPE_TYPES, type EnvelopeType } from "@/constants/categories";

interface ColorSelectorProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  disabled?: boolean;
}

/**
 * Color selection component for envelope colors
 */
export const ColorSelector = ({
  selectedColor,
  onColorSelect,
  disabled = false,
}: ColorSelectorProps) => {
  const colors = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Envelope Color</label>
      <div className="grid grid-cols-8 gap-2">
        {colors.map((color) => (
          <Button
            key={color}
            type="button"
            onClick={() => onColorSelect(color)}
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
};

interface ActionButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isLoading: boolean;
}

/**
 * Action buttons for Create Envelope modal
 */
export const ActionButtons = ({ onCancel, onSubmit, canSubmit, isLoading }: ActionButtonsProps) => {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 border-2 border-black text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-green-500 transition-colors"
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || isLoading}
        className="flex items-center px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 border-2 border-black disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {React.createElement(getIcon("Save"), { className: "h-4 w-4 mr-2" })}
        {isLoading ? "Creating..." : "Create Envelope"}
      </Button>
    </div>
  );
};

interface Bill {
  id: string;
  name: string;
  amount: number;
}

interface ModalContentProps {
  formData: {
    envelopeType: string;
    color: string;
    autoAllocate: boolean;
    billId?: string;
  };
  errors: Record<string, string>;
  calculatedAmounts: Record<string, number>;
  isLoading: boolean;
  canSubmit: boolean;
  allBills: Bill[];
  onUpdateField: (field: string, value: unknown) => void;
  onBillSelection: (billId: string) => void;
  onCreateBill?: (() => void) | null;
  onCancel: () => void;
  onSubmit: () => void;
}

/**
 * Modal content for Create Envelope modal
 */
export const ModalContent = ({
  formData,
  errors,
  calculatedAmounts,
  isLoading,
  canSubmit,
  allBills,
  onUpdateField,
  onBillSelection,
  onCreateBill,
  onCancel,
  onSubmit,
}: ModalContentProps) => {
  return (
    <div className="space-y-6">
      {/* Envelope Type Selection */}
      <EnvelopeTypeSelector
        selectedType={formData.envelopeType}
        onTypeChange={(type: string) => onUpdateField("envelopeType", type)}
        excludeTypes={[ENVELOPE_TYPES.SAVINGS as EnvelopeType, ENVELOPE_TYPES.SINKING_FUND as EnvelopeType]}
        disabled={isLoading}
      />

      {/* Basic Fields */}
      <EnvelopeBasicFields
        formData={formData}
        errors={errors}
        onUpdateField={onUpdateField}
        disabled={isLoading}
      />

      {/* Budget Fields */}
      <EnvelopeBudgetFields
        formData={formData}
        errors={errors}
        calculatedAmounts={calculatedAmounts}
        onUpdateField={onUpdateField}
        disabled={isLoading}
      />

      {/* Allocation Mode */}
      <AllocationModeSelector
        autoAllocate={formData.autoAllocate}
        onAutoAllocateChange={(value: boolean) => onUpdateField("autoAllocate", value)}
        disabled={isLoading}
      />

      {/* Bill Connection */}
      {allBills.length > 0 && (
        <BillConnectionSelector
          allBills={allBills}
          selectedBillId={formData.billId}
          onBillSelection={onBillSelection}
          onCreateBill={onCreateBill || undefined}
          disabled={isLoading}
        />
      )}

      {/* Color Selection */}
      <ColorSelector
        selectedColor={formData.color}
        onColorSelect={(color) => onUpdateField("color", color)}
        disabled={isLoading}
      />

      {/* Action Buttons */}
      <ActionButtons
        onCancel={onCancel}
        onSubmit={onSubmit}
        canSubmit={canSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

interface DesktopModalHeaderProps {
  onClose: () => void;
}

/**
 * Desktop modal header for Create Envelope
 */
export const DesktopModalHeader = ({ onClose }: DesktopModalHeaderProps) => {
  return (
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
              <span className="text-lg">C</span>REATE <span className="text-lg">E</span>NVELOPE
            </h2>
            <p className="text-green-100 text-sm">Set up a new budget envelope</p>
          </div>
        </div>
        <ModalCloseButton onClick={onClose} />
      </div>
    </div>
  );
};
