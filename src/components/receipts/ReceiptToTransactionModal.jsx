import React, { useState, useEffect } from "react";
import { Receipt, DollarSign, Calendar, Building, FileText, ArrowRight, Check } from "lucide-react";
import { useReceipts } from "../../hooks/useReceipts";
import { useTransactions } from "../../hooks/useTransactions";
import { useEnvelopes } from "../../hooks/useEnvelopes";
import logger from "../../utils/logger";

/**
 * Modal for converting receipt data into a transaction
 * Allows editing extracted data and selecting envelope
 */
const ReceiptToTransactionModal = ({ receiptData, onClose, onComplete }) => {
  const { addReceiptAsync } = useReceipts();
  const { addTransactionAsync } = useTransactions();
  const { envelopes } = useEnvelopes();

  const [transactionForm, setTransactionForm] = useState({
    description: receiptData.merchant || "",
    amount: receiptData.total || 0,
    date: receiptData.date || new Date().toISOString().split("T")[0],
    envelopeId: "",
    category: "shopping",
    type: "expense",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Edit data, 2: Select envelope, 3: Confirm

  // Auto-suggest envelope based on merchant
  useEffect(() => {
    if (receiptData.merchant && envelopes.length > 0) {
      const merchant = receiptData.merchant.toLowerCase();

      // Simple merchant-to-envelope matching
      const suggestions = [
        { keywords: ["walmart", "target", "grocery", "food", "market"], category: "groceries" },
        { keywords: ["gas", "shell", "exxon", "chevron", "fuel"], category: "transportation" },
        { keywords: ["restaurant", "mcdonald", "pizza", "cafe", "dining"], category: "dining" },
        { keywords: ["pharmacy", "cvs", "walgreens", "health"], category: "healthcare" },
        { keywords: ["home depot", "lowes", "hardware"], category: "home" },
      ];

      for (const suggestion of suggestions) {
        if (suggestion.keywords.some((keyword) => merchant.includes(keyword))) {
          const matchingEnvelope = envelopes.find(
            (env) =>
              env.category?.toLowerCase().includes(suggestion.category) ||
              env.name?.toLowerCase().includes(suggestion.category)
          );

          if (matchingEnvelope) {
            setTransactionForm((prev) => ({
              ...prev,
              envelopeId: matchingEnvelope.id,
              category: suggestion.category,
            }));
            break;
          }
        }
      }
    }
  }, [receiptData.merchant, envelopes]);

  const handleFormChange = (field, value) => {
    setTransactionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!transactionForm.description || !transactionForm.amount) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the transaction
      const transaction = await addTransactionAsync({
        ...transactionForm,
        amount: Math.abs(parseFloat(transactionForm.amount)),
      });

      // Save the receipt with reference to transaction
      const receipt = await addReceiptAsync({
        merchant: receiptData.merchant,
        amount: receiptData.total,
        date: receiptData.date,
        transactionId: transaction.id,
        imageData: receiptData.imageData,
        ocrData: {
          rawText: receiptData.rawText,
          confidence: receiptData.confidence,
          items: receiptData.items,
          tax: receiptData.tax,
          subtotal: receiptData.subtotal,
          processingTime: receiptData.processingTime,
        },
      });

      logger.info("✅ Receipt converted to transaction successfully", {
        transactionId: transaction.id,
        receiptId: receipt.id,
        merchant: receiptData.merchant,
        amount: receiptData.total,
      });

      onComplete?.(transaction, receipt);
    } catch (error) {
      logger.error("❌ Failed to create transaction from receipt:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Extracted Data</h3>
              <p className="text-sm text-gray-600 mb-6">
                Please verify and edit the information extracted from your receipt.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4 inline mr-2" />
                  Merchant/Description
                </label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter merchant name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={(e) => handleFormChange("amount", parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={transactionForm.category}
                  onChange={(e) => handleFormChange("category", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="shopping">Shopping</option>
                  <option value="groceries">Groceries</option>
                  <option value="dining">Dining</option>
                  <option value="transportation">Transportation</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="utilities">Utilities</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-2" />
                Notes (optional)
              </label>
              <textarea
                value={transactionForm.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Add any additional notes about this transaction..."
              />
            </div>

            {/* Show extracted items if available */}
            {receiptData.items && receiptData.items.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-3">Items Found</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {receiptData.items.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-600">
                      <span>{item.description}</span>
                      <span>${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  {receiptData.items.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{receiptData.items.length - 5} more items
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Envelope</h3>
              <p className="text-sm text-gray-600 mb-6">
                Select which envelope this transaction should be assigned to.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {envelopes.map((envelope) => (
                <button
                  key={envelope.id}
                  onClick={() => handleFormChange("envelopeId", envelope.id)}
                  className={`p-4 border rounded-xl text-left transition-colors ${
                    transactionForm.envelopeId === envelope.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{envelope.name}</h4>
                      <p className="text-sm text-gray-500">{envelope.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${(envelope.currentBalance || 0).toFixed(2)}
                      </p>
                      {transactionForm.envelopeId === envelope.id && (
                        <Check className="h-5 w-5 text-purple-600 mt-1" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {!transactionForm.envelopeId && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Please select an envelope to continue</p>
              </div>
            )}
          </div>
        );

      case 3: {
        const selectedEnvelope = envelopes.find((env) => env.id === transactionForm.envelopeId);
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Transaction</h3>
              <p className="text-sm text-gray-600 mb-6">
                Review the transaction details before creating.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium text-gray-900">{transactionForm.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-gray-900">${transactionForm.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(transactionForm.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Envelope</p>
                  <p className="font-medium text-gray-900">
                    {selectedEnvelope?.name || "None selected"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">{transactionForm.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{transactionForm.type}</p>
                </div>
              </div>

              {transactionForm.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-700">{transactionForm.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <Receipt className="h-4 w-4 inline mr-2" />
                Receipt will be attached to this transaction and stored securely.
              </p>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          {/* Header with progress */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Create Transaction from Receipt</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

          {/* Progress indicators */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNum === step
                      ? "bg-purple-600 text-white"
                      : stepNum < step
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNum < step ? <Check className="h-4 w-4" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <ArrowRight
                    className={`h-4 w-4 mx-2 ${
                      stepNum < step ? "text-green-500" : "text-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">{renderStepContent()}</div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Back
              </button>
            )}

            <div className="flex-1" />

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={
                  (step === 1 && (!transactionForm.description || !transactionForm.amount)) ||
                  (step === 2 && !transactionForm.envelopeId)
                }
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting || !transactionForm.envelopeId}
              >
                {isSubmitting ? "Creating..." : "Create Transaction"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptToTransactionModal;
