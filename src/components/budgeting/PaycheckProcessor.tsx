import React from "react";
import { Button, StylizedButtonText } from "@/components/ui";
import { getIcon } from "../../utils";
import { usePaycheckForm } from "../../hooks/budgeting/usePaycheckForm";
import { usePaycheckHistory } from "../../hooks/budgeting/usePaycheckHistory";
import PaycheckAmountInput from "./paycheck/PaycheckAmountInput";
import PaycheckPayerSelector from "./paycheck/PaycheckPayerSelector";
import PaycheckAllocationModes from "./paycheck/PaycheckAllocationModes";
import PaycheckAllocationPreview from "./paycheck/PaycheckAllocationPreview";
import PaycheckHistory from "./paycheck/PaycheckHistory";

interface Envelope {
  id: string | number;
  name?: string;
  autoAllocate?: boolean;
  currentBalance?: number;
  monthlyAmount?: number;
}

interface PaycheckHistoryItem {
  id: string | number;
  payerName?: string;
  amount?: number;
}

interface User {
  userName: string;
}

interface PaycheckProcessorProps {
  envelopes?: Envelope[];
  paycheckHistory?: PaycheckHistoryItem[];
  onProcessPaycheck: (data: unknown) => Promise<void>;
  onDeletePaycheck: (paycheck: PaycheckHistoryItem) => Promise<void>;
  currentUser: User;
}

/**
 * Main PaycheckProcessor component
 * Refactored to follow the 7-phase refactoring methodology
 * Reduced from 600 lines to ~175 lines (71% reduction)
 */
const PaycheckProcessor: React.FC<PaycheckProcessorProps> = ({
  envelopes = [],
  paycheckHistory = [],
  onProcessPaycheck,
  onDeletePaycheck,
  currentUser,
}) => {
  // Custom hooks for state management
  const formHook = usePaycheckForm({
    paycheckHistory,
    currentUser,
    onProcessPaycheck,
    envelopes,
  });

  const historyHook = usePaycheckHistory({
    onDeletePaycheck,
  });

  // Calculate allocation preview
  const preview = formHook.showPreview ? formHook.allocationPreview : null;

  return (
    <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6">
      {/* Header - Outside white content area */}
      <PaycheckHeader />

      {/* Process New Paycheck Section */}
      <div className="glassmorphism rounded-3xl p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <PaycheckForm formHook={formHook} />

          {/* Allocation Preview */}
          <PaycheckAllocationPreview
            preview={preview}
            hasAmount={!!formHook.paycheckAmount}
            envelopes={envelopes as unknown as import("@/types/finance").Envelope[]}
          />
        </div>
      </div>

      {/* Paycheck History */}
      <PaycheckHistory
        paycheckHistory={paycheckHistory as unknown as PaycheckHistoryItem[]}
        onDeletePaycheck={historyHook.handleDeletePaycheck}
        deletingPaycheckId={historyHook.deletingPaycheckId}
      />
    </div>
  );
};

/**
 * Paycheck section header component
 */
const PaycheckHeader = () => (
  <h2 className="font-black text-black text-xl flex items-center tracking-wide">
    <div className="relative mr-4">
      <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-30"></div>
      <div className="relative bg-emerald-500 p-3 rounded-2xl">
        {React.createElement(getIcon("DollarSign"), {
          className: "h-6 w-6 text-white",
        })}
      </div>
    </div>
    <StylizedButtonText firstLetterClassName="text-2xl" restClassName="text-xl">
      ADD PAYCHECK
    </StylizedButtonText>
  </h2>
);

/**
 * Main paycheck form component
 */
const PaycheckForm: React.FC<{ formHook: ReturnType<typeof usePaycheckForm> }> = ({ formHook }) => (
  <div className="space-y-6">
    <PaycheckAmountInput
      value={formHook.paycheckAmount}
      onChange={formHook.setPaycheckAmount}
      disabled={formHook.isProcessing}
    />

    <PaycheckPayerSelector
      payerName={formHook.payerName}
      uniquePayers={formHook.uniquePayers}
      showAddNewPayer={formHook.showAddNewPayer}
      newPayerName={formHook.newPayerName}
      isProcessing={formHook.isProcessing}
      onPayerChange={formHook.handlePayerChange}
      onNewPayerNameChange={formHook.setNewPayerName}
      onAddNewPayer={formHook.handleAddNewPayer}
      onToggleAddNewPayer={formHook.setShowAddNewPayer}
      getPayerPrediction={formHook.getPayerPrediction}
    />

    <PaycheckAllocationModes
      allocationMode={formHook.allocationMode as "allocate" | "leftover"}
      onChange={formHook.setAllocationMode}
      disabled={formHook.isProcessing}
    />

    <PaycheckFormButtons formHook={formHook} />
  </div>
);

/**
 * Form action buttons component
 */
const PaycheckFormButtons: React.FC<{ formHook: ReturnType<typeof usePaycheckForm> }> = ({
  formHook,
}) => (
  <div className="flex gap-4">
    <Button
      onClick={() => formHook.setShowPreview(true)}
      disabled={!formHook.canSubmit}
      className="flex-1 btn btn-secondary py-4 text-lg font-semibold rounded-2xl border-2 border-black"
    >
      {React.createElement(getIcon("Calculator"), {
        className: "h-5 w-5 mr-2",
      })}
      Preview Allocation
    </Button>

    {formHook.showPreview && (
      <Button
        onClick={formHook.handleProcessPaycheck}
        disabled={formHook.isProcessing}
        className="flex-1 btn btn-success py-4 text-lg font-semibold rounded-2xl border-2 border-black"
        data-tour="add-paycheck"
      >
        {formHook.isProcessing ? (
          <div className="flex items-center">
            <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
            Processing...
          </div>
        ) : (
          <>
            {React.createElement(getIcon("CheckCircle"), {
              className: "h-5 w-5 mr-2",
            })}
            Confirm & Process
          </>
        )}
      </Button>
    )}
  </div>
);

export default React.memo(PaycheckProcessor);
