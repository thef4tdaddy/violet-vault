import React from "react";
import { getIcon } from "../../../utils";
import {
  formatCurrency,
  formatDisplayDate,
  getConfidenceDescription,
} from "@/utils/features/receipts/receiptHelpers";

interface TransactionForm {
  description: string;
  amount: number;
  date: string | number | Date;
  category: string;
  notes?: string;
  envelopeId: string;
}

interface Envelope {
  id: string;
  name: string;
  category: string;
  allocated: number;
  spent: number;
}

interface ReceiptData {
  merchant: string;
  total: number;
  date: string | number | Date;
  confidence?: number;
  items?: unknown[];
}

// TransactionDetailsCard - displays transaction information
const TransactionDetailsCard: React.FC<{ transactionForm: TransactionForm }> = ({
  transactionForm,
}) => (
  <div className="bg-gradient-to-r from-green-50/80 to-blue-50/80 backdrop-blur-sm rounded-xl p-6 border-2 border-black shadow-lg">
    <h4 className="font-black text-gray-900 mb-4 flex items-center">
      {React.createElement(getIcon("Receipt"), {
        className: "h-5 w-5 mr-2 text-green-600",
      })}
      TRANSACTION DETAILS
    </h4>
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Description:</span>
        <span className="font-bold text-gray-900">{transactionForm.description}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 flex items-center">
          {React.createElement(getIcon("DollarSign"), { className: "h-4 w-4 mr-1" })}
          Amount:
        </span>
        <span className="font-black text-xl text-gray-900">
          {formatCurrency(transactionForm.amount)}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 flex items-center">
          {React.createElement(getIcon("Calendar"), { className: "h-4 w-4 mr-1" })}
          Date:
        </span>
        <span className="font-bold text-gray-900">
          {formatDisplayDate(
            transactionForm.date instanceof Date
              ? transactionForm.date.toISOString()
              : typeof transactionForm.date === "number"
                ? new Date(transactionForm.date).toISOString()
                : String(transactionForm.date)
          )}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Category:</span>
        <span className="font-bold text-gray-900 capitalize bg-purple-100 px-2 py-1 rounded-lg">
          {transactionForm.category}
        </span>
      </div>
      {transactionForm.notes && (
        <div className="pt-2 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700 block mb-1">Notes:</span>
          <span className="text-sm text-gray-600 italic">{transactionForm.notes}</span>
        </div>
      )}
    </div>
  </div>
);

// EnvelopeAssignmentCard - displays envelope assignment info
const EnvelopeAssignmentCard: React.FC<{
  selectedEnvelope: Envelope | null | undefined;
  transactionForm: TransactionForm;
}> = ({ selectedEnvelope, transactionForm }) => {
  if (!selectedEnvelope) return null;

  const availableAfter =
    selectedEnvelope.allocated - selectedEnvelope.spent - transactionForm.amount;

  return (
    <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-xl p-6 border-2 border-black shadow-lg">
      <h4 className="font-black text-gray-900 mb-4 flex items-center">
        {React.createElement(getIcon("Package"), { className: "h-5 w-5 mr-2 text-purple-600" })}
        ENVELOPE ASSIGNMENT
      </h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Envelope:</span>
          <span className="font-bold text-gray-900">{selectedEnvelope.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Category:</span>
          <span className="font-bold text-gray-900">{selectedEnvelope.category}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Available Before:</span>
          <span className="font-bold text-gray-900">
            {formatCurrency(selectedEnvelope.allocated - selectedEnvelope.spent)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Available After:</span>
          <span className={`font-bold ${availableAfter >= 0 ? "text-green-700" : "text-red-700"}`}>
            {formatCurrency(availableAfter)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ReceiptInformationCard - displays original receipt data
const ReceiptInformationCard: React.FC<{ receiptData: ReceiptData }> = ({ receiptData }) => (
  <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm rounded-xl p-6 border-2 border-black shadow-lg">
    <h4 className="font-black text-gray-900 mb-4">RECEIPT INFORMATION</h4>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-700 font-medium">Original Merchant:</span>
        <span className="font-bold text-gray-900">{receiptData.merchant}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-700 font-medium">Original Amount:</span>
        <span className="font-bold text-gray-900">{formatCurrency(receiptData.total)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-700 font-medium">Original Date:</span>
        <span className="font-bold text-gray-900">
          {formatDisplayDate(
            receiptData.date instanceof Date
              ? receiptData.date.toISOString()
              : typeof receiptData.date === "number"
                ? new Date(receiptData.date).toISOString()
                : String(receiptData.date)
          )}
        </span>
      </div>
      {receiptData.confidence && (
        <div className="flex justify-between">
          <span className="text-gray-700 font-medium">OCR Confidence:</span>
          <span className="font-bold text-gray-900">
            {getConfidenceDescription(receiptData.confidence)} (
            {(receiptData.confidence * 100).toFixed(0)}%)
          </span>
        </div>
      )}
      {receiptData.items && receiptData.items.length > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-700 font-medium">Items Found:</span>
          <span className="font-bold text-gray-900">{receiptData.items.length} items</span>
        </div>
      )}
    </div>
  </div>
);

// ChangesWarningBanner - shows warning when data was modified
const ChangesWarningBanner: React.FC<{
  receiptData: ReceiptData;
  transactionForm: TransactionForm;
}> = ({ receiptData, transactionForm }) => {
  const hasChanges =
    Math.abs(receiptData.total - transactionForm.amount) > 0.01 ||
    receiptData.merchant !== transactionForm.description ||
    receiptData.date !== transactionForm.date;

  if (!hasChanges) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-400 shadow-lg">
      <h5 className="font-bold text-yellow-800 mb-2 flex items-center">⚠️ Changes Detected</h5>
      <p className="text-sm text-yellow-700 font-medium">
        You've made changes to the extracted receipt data. The original receipt information will be
        preserved for reference.
      </p>
    </div>
  );
};

const ConfirmationStep: React.FC<{
  receiptData: ReceiptData;
  transactionForm: TransactionForm;
  envelopes: Envelope[];
}> = ({ receiptData, transactionForm, envelopes }) => {
  const selectedEnvelope = envelopes.find((env) => env.id === transactionForm.envelopeId);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="glassmorphism rounded-full p-4 w-16 h-16 mx-auto mb-4 border-2 border-green-300">
          {React.createElement(getIcon("Check"), {
            className: "h-8 w-8 text-green-600 mx-auto",
          })}
        </div>
        <h3 className="text-lg font-black text-black">CONFIRM TRANSACTION</h3>
        <p className="text-sm text-purple-800 font-medium mt-2">
          Review all details before creating the transaction.
        </p>
      </div>

      <TransactionDetailsCard transactionForm={transactionForm} />
      <EnvelopeAssignmentCard
        selectedEnvelope={selectedEnvelope}
        transactionForm={transactionForm}
      />
      <ReceiptInformationCard receiptData={receiptData} />
      <ChangesWarningBanner receiptData={receiptData} transactionForm={transactionForm} />
    </div>
  );
};

export default ConfirmationStep;
