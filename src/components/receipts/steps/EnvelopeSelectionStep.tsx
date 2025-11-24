import React from "react";
import { getIcon } from "../../../utils";
import { formatCurrency } from "../../../utils/receipts/receiptHelpers";

interface Envelope {
  id: string;
  name: string;
  category: string;
  allocated: number;
  spent: number;
}

interface TransactionForm {
  description: string;
  amount: number;
  date: string;
  category: string;
  envelopeId: string;
}

interface EnvelopeSelectionStepProps {
  transactionForm: TransactionForm;
  envelopes: Envelope[];
  handleFormChange: (field: string, value: string | number) => void;
}

const EnvelopeSelectionStep = ({ transactionForm, envelopes, handleFormChange }: EnvelopeSelectionStepProps) => {
  const selectedEnvelope = envelopes.find((env) => env.id === transactionForm.envelopeId);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-black">SELECT ENVELOPE</h3>
        <p className="text-sm text-purple-800 font-medium mt-2">
          Choose which envelope this expense should be allocated to.
        </p>
      </div>

      {/* Transaction Summary */}
      <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl p-4 border-2 border-black shadow-lg">
        <h4 className="font-black text-gray-900 mb-3">TRANSACTION SUMMARY</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-800">Description:</span>
            <span className="font-bold text-gray-900">{transactionForm.description}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-800">Amount:</span>
            <span className="font-black text-lg text-gray-900">
              {formatCurrency(transactionForm.amount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-800">Date:</span>
            <span className="font-bold text-gray-900">{transactionForm.date}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-800">Category:</span>
            <span className="font-bold text-gray-900 capitalize">{transactionForm.category}</span>
          </div>
        </div>
      </div>

      {/* Envelope Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          {React.createElement(getIcon("Package"), {
            className: "h-4 w-4 inline mr-2 text-purple-600",
          })}
          CHOOSE ENVELOPE
        </label>

        <div className="grid gap-3 max-h-64 overflow-y-auto pr-2">
          {envelopes.map((envelope) => (
            <div
              key={envelope.id}
              onClick={() => handleFormChange("envelopeId", envelope.id)}
              className={`p-4 rounded-xl border-2 border-black cursor-pointer transition-all shadow-md hover:shadow-lg ${
                transactionForm.envelopeId === envelope.id
                  ? "bg-gradient-to-r from-blue-100/80 to-purple-100/80 backdrop-blur-sm border-purple-500"
                  : "bg-white/60 backdrop-blur-sm hover:bg-white/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-bold text-gray-900">{envelope.name}</h5>
                  <p className="text-sm text-purple-800 font-medium">{envelope.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-purple-800 font-medium">Available:</div>
                  <div className="font-black text-gray-900">
                    {formatCurrency(envelope.allocated - envelope.spent)}
                  </div>
                </div>
                {transactionForm.envelopeId === envelope.id && (
                  <div className="ml-3 glassmorphism rounded-full p-1 border border-purple-300">
                    {React.createElement(getIcon("ArrowRight"), {
                      className: "h-4 w-4 text-purple-600",
                    })}
                  </div>
                )}
              </div>

              {/* Show warning if insufficient funds */}
              {envelope.allocated - envelope.spent < transactionForm.amount && (
                <div className="mt-2 text-xs text-red-600 font-medium bg-red-50/80 backdrop-blur-sm px-2 py-1 rounded border border-red-200">
                  ⚠️ This transaction exceeds available funds
                </div>
              )}
            </div>
          ))}
        </div>

        {envelopes.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50/80 backdrop-blur-sm rounded-xl border-2 border-black">
            {React.createElement(getIcon("Package"), {
              className: "h-8 w-8 mx-auto mb-2 text-gray-400",
            })}
            <p className="font-medium">No envelopes available. Create an envelope first.</p>
          </div>
        )}
      </div>

      {/* Selected Envelope Impact */}
      {selectedEnvelope && (
        <div className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 backdrop-blur-sm rounded-xl p-4 border-2 border-black shadow-lg">
          <h4 className="font-black text-gray-900 mb-3">ENVELOPE IMPACT</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-orange-800 font-medium">Current Available:</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(selectedEnvelope.allocated - selectedEnvelope.spent)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-800 font-medium">After Transaction:</span>
              <span
                className={`font-bold ${
                  selectedEnvelope.allocated - selectedEnvelope.spent - transactionForm.amount >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {formatCurrency(
                  selectedEnvelope.allocated - selectedEnvelope.spent - transactionForm.amount
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvelopeSelectionStep;
