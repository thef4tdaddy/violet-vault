import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import { useReceiptToTransaction } from "../../hooks/receipts/useReceiptToTransaction";
import ReceiptDataStep from "./steps/ReceiptDataStep";
import EnvelopeSelectionStep from "./steps/EnvelopeSelectionStep";
import ConfirmationStep from "./steps/ConfirmationStep";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

// ModalHeader - displays title and close button
const ModalHeader: React.FC<{ step: number; onClose: () => void }> = ({ step, onClose }) => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center">
      <div className="glassmorphism rounded-full p-3 border-2 border-purple-300 mr-4">
        {React.createElement(getIcon("Receipt"), {
          className: "h-6 w-6 text-purple-600",
        })}
      </div>
      <div>
        <h2 className="text-xl font-black text-black">CONVERT RECEIPT TO TRANSACTION</h2>
        <p className="text-sm text-purple-800 font-medium mt-1">
          Step {step} of 3:{" "}
          {step === 1 ? "Review Data" : step === 2 ? "Select Envelope" : "Confirm"}
        </p>
      </div>
    </div>
    <ModalCloseButton onClick={onClose} />
  </div>
);

// ProgressBar - shows step progression
const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between">
      {[1, 2, 3].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 border-black shadow-md ${
              stepNum <= currentStep
                ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                : "bg-white/60 backdrop-blur-sm text-gray-500"
            }`}
          >
            {stepNum}
          </div>
          {stepNum < 3 && (
            <div
              className={`flex-1 h-3 mx-4 rounded-full border-2 border-black shadow-sm ${
                stepNum < currentStep
                  ? "bg-gradient-to-r from-purple-500 to-blue-600"
                  : "bg-gray-200/60 backdrop-blur-sm"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

// ModalFooter - navigation and submit buttons
const ModalFooter: React.FC<{
  step: number;
  isSubmitting: boolean;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onClose: () => void;
}> = ({ step, isSubmitting, canProceed, onBack, onNext, onSubmit, onClose }) => (
  <div className="flex items-center justify-between pt-6 border-t-2 border-black">
    <Button
      onClick={step > 1 ? onBack : onClose}
      className="px-6 py-3 text-gray-700 hover:text-gray-900 glassmorphism backdrop-blur-sm rounded-lg border-2 border-black shadow-md hover:shadow-lg transition-all font-bold flex items-center"
    >
      {step > 1 && React.createElement(getIcon("ArrowLeft"), { className: "h-4 w-4 mr-2" })}
      {step > 1 ? "Back" : "Cancel"}
    </Button>
    <div className="flex gap-4">
      {step < 3 ? (
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all border-2 border-black shadow-md hover:shadow-lg font-black flex items-center"
        >
          Next
          {React.createElement(getIcon("ArrowRight"), { className: "h-4 w-4 ml-2" })}
        </Button>
      ) : (
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all border-2 border-black shadow-md hover:shadow-lg font-black flex items-center"
        >
          {isSubmitting ? "Creating..." : "Create Transaction"}
          {React.createElement(getIcon("Check"), { className: "h-4 w-4 ml-2" })}
        </Button>
      )}
    </div>
  </div>
);

interface ReceiptData {
  merchant?: string;
  total?: number;
  date?: string;
  imageData?: string;
  rawText?: string;
  confidence?: number;
  items?: unknown[];
  tax?: number;
  subtotal?: number;
  processingTime?: number;
}

interface ReceiptToTransactionModalProps {
  receiptData: ReceiptData | null;
  onClose: () => void;
  onComplete?: () => void;
}

const ReceiptToTransactionModal: React.FC<ReceiptToTransactionModalProps> = ({
  receiptData,
  onClose,
  onComplete: _onComplete,
}) => {
  const {
    transactionForm,
    isSubmitting,
    step,
    envelopes,
    handleFormChange,
    handleNext,
    handleBack,
    handleSubmit,
  } = useReceiptToTransaction(receiptData ?? {});

  const modalRef = useModalAutoScroll(Boolean(receiptData));

  const handleFormSubmit = () => {
    handleSubmit();
  };

  const canProceed = () => {
    if (step === 1) {
      return Boolean(transactionForm.description) && Number(transactionForm.amount) > 0;
    }
    if (step === 2) {
      return Boolean(transactionForm.envelopeId);
    }
    return true;
  };

  const renderStepContent = () => {
    // Cast the receiptData to match what step components expect
    // Items need to be cast to ReceiptItem[] format or undefined
    const stepReceiptItems = receiptData?.items?.map((item) => {
      const typedItem = item as { description?: string; amount?: number; [key: string]: unknown };
      return {
        description: String(typedItem?.description ?? ""),
        amount: Number(typedItem?.amount ?? 0),
      };
    });

    const stepReceiptData = {
      merchant: receiptData?.merchant ?? "",
      total: receiptData?.total ?? 0,
      date: receiptData?.date ?? new Date().toISOString(),
      items: stepReceiptItems,
      confidence: receiptData?.confidence,
    };

    // Cast transactionForm to match step component types
    const stepTransactionForm = {
      description: transactionForm.description,
      amount: Number(transactionForm.amount) || 0,
      date: transactionForm.date,
      category: transactionForm.category,
      notes: transactionForm.notes,
      envelopeId: transactionForm.envelopeId,
    };

    // Cast envelopes to match step component types
    // Map from finance.ts Envelope to step component's Envelope
    const stepEnvelopes = (envelopes ?? []).map((e) => ({
      id: String(e.id),
      name: e.name ?? "",
      category: e.category ?? "",
      allocated: e.targetAmount ?? 0,
      spent: (e.targetAmount ?? 0) - (e.currentBalance ?? 0),
    }));

    switch (step) {
      case 1:
        return (
          <ReceiptDataStep
            receiptData={stepReceiptData}
            transactionForm={stepTransactionForm}
            handleFormChange={handleFormChange}
          />
        );
      case 2:
        return (
          <EnvelopeSelectionStep
            transactionForm={stepTransactionForm}
            envelopes={stepEnvelopes}
            handleFormChange={handleFormChange}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            receiptData={stepReceiptData}
            transactionForm={stepTransactionForm}
            envelopes={stepEnvelopes}
          />
        );
      default:
        return null;
    }
  };

  if (!receiptData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-black my-auto"
      >
        <div className="p-8">
          <ModalHeader step={step} onClose={onClose} />
          <ProgressBar currentStep={step} />
          <div className="mb-8 overflow-y-auto max-h-[50vh] pr-2">{renderStepContent()}</div>
          <ModalFooter
            step={step}
            isSubmitting={isSubmitting as boolean}
            canProceed={canProceed()}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleFormSubmit}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default ReceiptToTransactionModal;
