import React from "react";
import { Button, StylizedButtonText } from "@/components/ui";
import { getIcon } from "../../utils";
import { usePaycheckProcessor } from "@/hooks/budgeting/transactions/scheduled/income/usePaycheckProcessor";
import { usePaycheckHistory } from "@/hooks/budgeting/transactions/scheduled/income/usePaycheckHistory";
import type { Envelope, PaycheckHistory as PaycheckHistoryRecord } from "@/db/types";
import { type PaycheckTransaction } from "@/utils/budgeting/paycheckUtils";
import type { PaycheckHistoryItem } from "./paycheck/PaycheckHistoryComponents";
import PaycheckAmountInput from "./paycheck/PaycheckAmountInput";
import PaycheckPayerSelector from "./paycheck/PaycheckPayerSelector";
import PaycheckAllocationModes from "./paycheck/PaycheckAllocationModes";
import PaycheckAllocationPreview from "./paycheck/PaycheckAllocationPreview";
import PaycheckHistoryList from "./paycheck/PaycheckHistory";

interface User {
  userName: string;
}

interface PaycheckProcessorProps {
  envelopes?: Envelope[];
  paycheckHistory?: PaycheckHistoryRecord[];
  onProcessPaycheck: (data: PaycheckTransaction) => Promise<void>;
  onDeletePaycheck: (paycheck: PaycheckHistoryRecord) => Promise<void>;
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
  // Use the new standard composition hook
  const processor = usePaycheckProcessor({
    envelopes,
    paycheckHistory,
    onAddPaycheck: onProcessPaycheck,
    currentUser,
  });

  const historyHook = usePaycheckHistory({
    onDeletePaycheck: async (id: string | number) => {
      const paycheck = paycheckHistory.find((p) => p.id === id);
      if (paycheck) await onDeletePaycheck(paycheck);
    },
  });

  // Calculate allocation preview
  const preview = processor.showPreview ? processor.allocationPreview : null;

  return (
    <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6">
      {/* Header - Outside white content area */}
      <PaycheckHeader />

      {/* Process New Paycheck Section */}
      <div className="glassmorphism rounded-3xl p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <PaycheckForm processor={processor} />

          {/* Allocation Preview */}
          <PaycheckAllocationPreview
            preview={preview}
            hasAmount={!!processor.paycheckAmount}
            envelopes={envelopes as unknown as import("@/types/finance").Envelope[]}
          />
        </div>
      </div>

      {/* Paycheck History */}
      <PaycheckHistoryList
        paycheckHistory={paycheckHistory as unknown as PaycheckHistoryItem[]}
        onDeletePaycheck={
          historyHook.handleDeletePaycheck as unknown as (
            paycheck: PaycheckHistoryItem
          ) => void | Promise<void>
        }
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
const PaycheckForm: React.FC<{ processor: ReturnType<typeof usePaycheckProcessor> }> = ({
  processor,
}) => (
  <div className="space-y-6">
    <PaycheckAmountInput
      value={processor.paycheckAmount}
      onChange={processor.setPaycheckAmount}
      disabled={processor.isProcessing}
    />

    <PaycheckPayerSelector
      payerName={processor.payerName}
      uniquePayers={processor.uniquePayers}
      showAddNewPayer={processor.showAddNewPayer}
      newPayerName={processor.newPayerName}
      isProcessing={processor.isProcessing}
      onPayerChange={processor.handlePayerChange}
      onNewPayerNameChange={processor.setNewPayerName}
      onAddNewPayer={processor.handleAddNewPayer}
      onToggleAddNewPayer={processor.setShowAddNewPayer}
      getPayerPrediction={processor.getPayerPrediction}
    />

    <PaycheckAllocationModes
      allocationMode={processor.allocationMode as "allocate" | "leftover"}
      onChange={processor.setAllocationMode}
      disabled={processor.isProcessing}
    />

    <PaycheckFormButtons processor={processor} />
  </div>
);

/**
 * Form action buttons component
 */
const PaycheckFormButtons: React.FC<{ processor: ReturnType<typeof usePaycheckProcessor> }> = ({
  processor,
}) => (
  <div className="flex gap-4">
    <Button
      onClick={() => processor.setShowPreview(true)}
      disabled={!processor.canSubmit}
      className="flex-1 btn btn-secondary py-4 text-lg font-semibold rounded-2xl border-2 border-black"
    >
      {React.createElement(getIcon("Calculator"), {
        className: "h-5 w-5 mr-2",
      })}
      Preview Allocation
    </Button>

    {processor.showPreview && (
      <Button
        onClick={processor.handleProcessPaycheck}
        disabled={processor.isProcessing}
        className="flex-1 btn btn-success py-4 text-lg font-semibold rounded-2xl border-2 border-black"
        data-tour="add-paycheck"
      >
        {processor.isProcessing ? (
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
