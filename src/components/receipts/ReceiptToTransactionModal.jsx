import React from "react";
import { Receipt, ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import { useReceiptToTransaction } from "../../hooks/receipts/useReceiptToTransaction";
import logger from "../../utils/common/logger";
import ReceiptDataStep from "./steps/ReceiptDataStep";
import EnvelopeSelectionStep from "./steps/EnvelopeSelectionStep";
import ConfirmationStep from "./steps/ConfirmationStep";

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
            envelopes={envelopes}
            handleFormChange={handleFormChange}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            receiptData={receiptData}
            transactionForm={transactionForm}
            envelopes={envelopes}
          />
        );
      default:
        return null;
    }
  };

  if (!receiptData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-black">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="glassmorphism rounded-full p-3 border-2 border-purple-300 mr-4">
                <Receipt className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-black">CONVERT RECEIPT TO TRANSACTION</h2>
                <p className="text-sm text-purple-800 font-medium mt-1">
                  Step {step} of 3:{" "}
                  {step === 1 ? "Review Data" : step === 2 ? "Select Envelope" : "Confirm"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 glassmorphism backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-black"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 border-black shadow-md ${
                      stepNum <= step
                        ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                        : "bg-white/60 backdrop-blur-sm text-gray-500"
                    }`}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`flex-1 h-3 mx-4 rounded-full border-2 border-black shadow-sm ${
                        stepNum < step
                          ? "bg-gradient-to-r from-purple-500 to-blue-600"
                          : "bg-gray-200/60 backdrop-blur-sm"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="mb-8 overflow-y-auto max-h-[50vh] pr-2">{renderStepContent()}</div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t-2 border-black">
            <button
              onClick={step > 1 ? handleBack : onClose}
              className="px-6 py-3 text-gray-700 hover:text-gray-900 glassmorphism backdrop-blur-sm rounded-lg border-2 border-black shadow-md hover:shadow-lg transition-all font-bold flex items-center"
            >
              {step > 1 && <ArrowLeft className="h-4 w-4 mr-2" />}
              {step > 1 ? "Back" : "Cancel"}
            </button>

            <div className="flex gap-4">
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all border-2 border-black shadow-md hover:shadow-lg font-black flex items-center"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleFormSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all border-2 border-black shadow-md hover:shadow-lg font-black flex items-center"
                >
                  {isSubmitting ? "Creating..." : "Create Transaction"}
                  <Check className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptToTransactionModal;
