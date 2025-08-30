import React from "react";
import { DollarSign } from "lucide-react";
import usePaycheckProcessor from "../../hooks/budgeting/usePaycheckProcessor";
import PaycheckForm from "./paycheck/PaycheckForm";
import AllocationPreview from "./paycheck/AllocationPreview";
import PaycheckHistory from "./paycheck/PaycheckHistory";

const PaycheckProcessor = ({
  envelopes = [],
  paycheckHistory = [],
  onProcessPaycheck,
  onDeletePaycheck,
  currentUser = { userName: "User" },
}) => {
  const {
    // Form state
    formData,
    errors,
    isLoading,
    canSubmit,

    // Allocation state
    currentAllocations,

    // Payer data
    uniquePayers,
    paycheckStats,
    selectedPayerStats,

    // Form actions
    updateFormField,
    applyPayerPrediction,
    processPaycheck,
    resetForm,

    // Computed values
    hasAmount,
    hasAllocations,
    allocationPreview,
  } = usePaycheckProcessor({
    envelopes,
    paycheckHistory,
    onAddPaycheck: onProcessPaycheck,
    currentUser,
  });

  const handleSelectPaycheck = (paycheck) => {
    // Optional: Auto-fill form with selected paycheck data
    updateFormField("payerName", paycheck.payerName);
    updateFormField("amount", paycheck.amount.toString());
    updateFormField("allocationMode", paycheck.allocationMode || "allocate");
  };

  return (
    <div className="space-y-6">
      {/* Process New Paycheck */}
      <div className="glassmorphism rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-8 flex items-center text-gray-900">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-emerald-500 p-3 rounded-2xl">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          Add Paycheck
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Paycheck Form */}
          <PaycheckForm
            formData={formData}
            errors={errors}
            uniquePayers={uniquePayers}
            selectedPayerStats={selectedPayerStats}
            onUpdateField={updateFormField}
            onApplyPrediction={applyPayerPrediction}
            canSubmit={canSubmit}
            isLoading={isLoading}
            onProcess={processPaycheck}
            onReset={resetForm}
          />

          {/* Allocation Preview */}
          <AllocationPreview
            allocationPreview={allocationPreview}
            hasAmount={hasAmount}
            allocationMode={formData.allocationMode}
          />
        </div>
      </div>

      {/* Paycheck History */}
      <PaycheckHistory
        paycheckHistory={paycheckHistory}
        paycheckStats={paycheckStats}
        onSelectPaycheck={handleSelectPaycheck}
      />
    </div>
  );
};

export default PaycheckProcessor;
