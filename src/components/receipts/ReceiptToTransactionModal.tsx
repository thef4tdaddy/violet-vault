import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import { useReceiptToTransaction } from "../../hooks/receipts/useReceiptToTransaction";
import logger from "../../utils/common/logger";
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

const ReceiptToTransactionModal = ({ receiptData, onClose, onComplete }) => {
  const {
    transactionForm,
    isSubmitting,
    step,
    envelopes,
    handleFormChange,
    handleNext,
    handleBack,
    handleSubmit,
  } = useReceiptToTransaction(receiptData);

  const modalRef = useModalAutoScroll(Boolean(receiptData));

  const handleFormSubmit = async () => {
    const result = await handleSubmit();
    if (result.success) {
      onComplete?.(result.transaction, result.receipt);
    } else {
      logger.error("Failed to submit receipt-to-transaction conversion:", result.error);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return transactionForm.description && transactionForm.amount > 0;
    }
    if (step === 2) {
      return transactionForm.envelopeId;
    }
    return true;
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <ReceiptDataStep
            receiptData={receiptData}
            transactionForm={transactionForm}
            handleFormChange={handleFormChange}
          />
        );
      case 2:
        return (
          <EnvelopeSelectionStep
            transactionForm={transactionForm}
            envelopes={
              envelopes as unknown as Array<{
                id: string;
                name: string;
                category: string;
                allocated: number;
                spent: number;
              }>
            }
            handleFormChange={handleFormChange}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            receiptData={receiptData}
            transactionForm={transactionForm}
            envelopes={
              envelopes as unknown as Array<{
                id: string;
                name: string;
                category: string;
                allocated: number;
                spent: number;
              }>
            }
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
            isSubmitting={isSubmitting}
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
