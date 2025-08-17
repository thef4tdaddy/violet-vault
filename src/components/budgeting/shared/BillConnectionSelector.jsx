import React from "react";
import { Sparkles, CheckCircle, Plus } from "lucide-react";

/**
 * Shared component for bill connection functionality
 * Handles connecting to existing bills or creating new ones
 */
const BillConnectionSelector = ({
  selectedBillId,
  onBillSelection,
  allBills = [],
  envelopeId = null,
  onCreateBill = null,
  showCreateOption = false,
  disabled = false,
}) => {
  const availableBills = allBills.filter(
    (bill) => !bill.envelopeId || bill.envelopeId === envelopeId
  );

  const selectedBill = selectedBillId ? allBills.find((bill) => bill.id === selectedBillId) : null;

  return (
    <div className="space-y-4">
      {/* Bill Connection Dropdown */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6">
        <label className="block text-lg font-bold text-purple-800 mb-4 flex items-center">
          <Sparkles className="h-6 w-6 mr-3" />
          🔗 Connect to Bill
        </label>

        <select
          value={selectedBillId || ""}
          onChange={(e) => !disabled && onBillSelection(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-4 border-2 border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-md text-base"
        >
          <option value="">
            {availableBills.length > 0
              ? "Choose a bill to auto-populate settings..."
              : "No bills available"}
          </option>
          {availableBills.map((bill) => (
            <option key={bill.id} value={bill.id}>
              {bill.name || bill.provider || "Unnamed Bill"} - ${bill.amount?.toFixed(2) || "0.00"}{" "}
              ({bill.frequency || "monthly"})
            </option>
          ))}
        </select>

        {/* Connected Bill Display */}
        {selectedBill && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">Bill Connected</span>
            </div>
            <div className="text-sm text-green-700">
              <p>
                <strong>{selectedBill.name || selectedBill.provider}</strong>
              </p>
              <p>
                Amount: ${selectedBill.amount || "N/A"} ({selectedBill.frequency || "monthly"})
              </p>
              <p className="text-xs mt-1">Bill settings will override manual envelope settings.</p>
            </div>
          </div>
        )}

        {/* Create New Bill Option */}
        {showCreateOption && !selectedBillId && onCreateBill && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-purple-700 font-medium">
              Don't see your bill? Create a new one:
            </div>

            <div className="glassmorphism border-2 border-white/20 rounded-xl p-3">
              <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
                <input
                  type="radio"
                  id="createNewBill"
                  name="billOption"
                  value="create"
                  disabled={disabled}
                  className="w-4 h-4 text-purple-600 mt-0.5 justify-self-start"
                />
                <div>
                  <div className="flex items-center mb-1">
                    <Plus className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="font-medium text-sm">Create corresponding bill</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-tight">
                    Create a new bill that will be automatically connected to this envelope
                  </p>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={onCreateBill}
                      className="mt-2 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Create Bill
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillConnectionSelector;
