import React from "react";
import { getIcon } from "../../../utils";
import { Button, Select, Radio } from "../../ui";

interface Bill {
  id: string;
  name?: string;
  provider?: string;
  amount?: number;
  frequency?: string;
  envelopeId?: string;
  [key: string]: unknown;
}

interface Envelope {
  id: string | number;
  name?: string;
  [key: string]: unknown;
}

// Helper to get available bills for selection
const getAvailableBills = (allBills: Bill[], envelopeId: string | null) => {
  return allBills.filter((bill) => !bill.envelopeId || bill.envelopeId === envelopeId);
};

// Helper to find selected bill
const findSelectedBill = (allBills: Bill[], selectedBillId: string | null) => {
  if (!selectedBillId) return null;
  return allBills.find((bill) => bill.id === selectedBillId) || null;
};

// Helper to format bill option text
const formatBillOption = (bill: Bill) => {
  const name = bill.name || bill.provider || "Unnamed Bill";
  const amount = bill.amount?.toFixed(2) || "0.00";
  const frequency = bill.frequency || "monthly";
  return `${name} - $${amount} (${frequency})`;
};

// ConnectedBillDisplay - shows details of selected bill
const ConnectedBillDisplay: React.FC<{ bill: Bill | null }> = ({ bill }) => {
  if (!bill) return null;

  return (
    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
      <div className="flex items-center mb-2">
        {React.createElement(getIcon("CheckCircle"), {
          className: "h-5 w-5 text-green-600 mr-2",
        })}
        <span className="font-medium text-green-800">Bill Connected</span>
      </div>
      <div className="text-sm text-green-700">
        <p>
          <strong>{bill.name || bill.provider}</strong>
        </p>
        <p>
          Amount: ${bill.amount || "N/A"} ({bill.frequency || "monthly"})
        </p>
        <p className="text-xs mt-1">Bill settings will override manual envelope settings.</p>
      </div>
    </div>
  );
};

interface BillConnectionSelectorProps {
  selectedBillId: string | null;
  onBillSelection: (billId: string) => void;
  allBills?: Bill[];
  envelopeId?: string | null;
  onCreateBill?: (() => void) | null;
  showCreateOption?: boolean;
  disabled?: boolean;
}

/**
 * Shared component for bill connection functionality
 * Handles connecting to existing bills or creating new ones
 */
const BillConnectionSelector: React.FC<BillConnectionSelectorProps> = ({
  selectedBillId,
  onBillSelection,
  allBills = [],
  envelopeId = null,
  onCreateBill = null,
  showCreateOption = false,
  disabled = false,
}) => {
  const availableBills = getAvailableBills(allBills, envelopeId);
  const selectedBill = findSelectedBill(allBills, selectedBillId);

  return (
    <div className="space-y-4">
      {/* Bill Connection Dropdown */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6">
        <label className="block text-lg font-bold text-purple-800 mb-4 flex items-center">
          {React.createElement(getIcon("Sparkles"), {
            className: "h-6 w-6 mr-3",
          })}
          🔗 Connect to Bill
        </label>

        <Select
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
              {formatBillOption(bill)}
            </option>
          ))}
        </Select>

        {/* Connected Bill Display */}
        <ConnectedBillDisplay bill={selectedBill} />

        {/* Create New Bill Option */}
        {showCreateOption && !selectedBillId && onCreateBill && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-purple-700 font-medium">
              Don't see your bill? Create a new one:
            </div>

            <div className="glassmorphism border-2 border-white/20 rounded-xl p-3">
              <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
                <Radio
                  id="createNewBill"
                  name="billOption"
                  value="create"
                  disabled={disabled}
                  className="mt-0.5 justify-self-start"
                />
                <div>
                  <div className="flex items-center mb-1">
                    {React.createElement(getIcon("Plus"), {
                      className: "h-4 w-4 mr-2 text-purple-600",
                    })}
                    <span className="font-medium text-sm">Create corresponding bill</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-tight">
                    Create a new bill that will be automatically connected to this envelope
                  </p>
                  {!disabled && (
                    <Button onClick={onCreateBill} size="sm" className="mt-2">
                      Create Bill
                    </Button>
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
