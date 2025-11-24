import React from "react";
import { Select } from "@/components/ui";
import { getIcon } from "../../../utils";
import { formatCurrency } from "../../../utils/receipts/receiptHelpers";

interface ReceiptItem {
  description: string;
  amount: number;
}

interface ReceiptDataType {
  items?: ReceiptItem[];
  [key: string]: unknown;
}

interface TransactionForm {
  description: string;
  amount: number;
  date: string;
  category: string;
  notes: string;
}

interface ReceiptDataStepProps {
  receiptData: ReceiptDataType;
  transactionForm: TransactionForm;
  handleFormChange: (field: string, value: string | number) => void;
}

const ReceiptDataStep = ({ receiptData, transactionForm, handleFormChange }: ReceiptDataStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-black">REVIEW EXTRACTED DATA</h3>
        <p className="text-sm text-purple-800 font-medium mt-2">
          Please verify and edit the information extracted from your receipt.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            {React.createElement(getIcon("Building"), {
              className: "h-4 w-4 inline mr-2 text-purple-600",
            })}
            MERCHANT/DESCRIPTION
          </label>
          <input
            type="text"
            value={transactionForm.description}
            onChange={(e) => handleFormChange("description", e.target.value)}
            className="w-full px-4 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all"
            placeholder="Enter merchant name"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            {React.createElement(getIcon("DollarSign"), {
              className: "h-4 w-4 inline mr-2 text-purple-600",
            })}
            AMOUNT
          </label>
          <input
            type="number"
            step="0.01"
            value={transactionForm.amount}
            onChange={(e) => handleFormChange("amount", parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            {React.createElement(getIcon("Calendar"), {
              className: "h-4 w-4 inline mr-2 text-purple-600",
            })}
            DATE
          </label>
          <input
            type="date"
            value={transactionForm.date}
            onChange={(e) => handleFormChange("date", e.target.value)}
            className="w-full px-4 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">CATEGORY</label>
          <Select
            value={transactionForm.category}
            onChange={(e) => handleFormChange("category", e.target.value)}
            className="w-full px-4 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all font-medium"
          >
            <option value="shopping">Shopping</option>
            <option value="groceries">Groceries</option>
            <option value="dining">Dining</option>
            <option value="transportation">Transportation</option>
            <option value="healthcare">Healthcare</option>
            <option value="entertainment">Entertainment</option>
            <option value="utilities">Utilities</option>
            <option value="other">Other</option>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          {React.createElement(getIcon("FileText"), {
            className: "h-4 w-4 inline mr-2 text-purple-600",
          })}
          NOTES (OPTIONAL)
        </label>
        <textarea
          value={transactionForm.notes}
          onChange={(e) => handleFormChange("notes", e.target.value)}
          className="w-full px-4 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all"
          rows={3}
          placeholder="Add any additional notes about this transaction..."
        />
      </div>

      {/* Show extracted items if available */}
      {receiptData.items && receiptData.items.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl p-4 border-2 border-black shadow-lg">
          <h4 className="font-black text-gray-900 mb-3">ITEMS FOUND</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {receiptData.items.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between text-sm text-purple-800 font-medium">
                <span>{item.description}</span>
                <span className="font-bold">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            {receiptData.items.length > 5 && (
              <div className="text-xs text-gray-600 mt-2 font-medium">
                ... and {receiptData.items.length - 5} more items
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptDataStep;
