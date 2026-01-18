import React from "react";
import { Button, Checkbox } from "@/components/ui";
import { getIcon } from "@/utils";
import { BillItemContent } from "./BillItemContent";
import type { DiscoveredBill, Envelope } from "../BillDiscoveryModal";

interface BillDiscoveryStepProps {
  discoveredBills: DiscoveredBill[];
  selectedBills: Set<string>;
  billEnvelopeMap: Record<string, string>;
  availableEnvelopes: Envelope[];
  onToggleSelection: (billId: string) => void;
  onUpdateEnvelope: (billId: string, envelopeId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const BillDiscoveryStep: React.FC<BillDiscoveryStepProps> = ({
  discoveredBills,
  selectedBills,
  billEnvelopeMap,
  availableEnvelopes,
  onToggleSelection,
  onUpdateEnvelope,
  onSelectAll,
  onClearAll,
}) => {
  if (discoveredBills.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {React.createElement(getIcon("Search"), {
          className: "h-12 w-12 mx-auto mb-3 opacity-50",
        })}
        <p className="font-medium">No new bills discovered</p>
        <p className="text-sm mt-1">
          Try adding more transaction history or check back later as you make more purchases.
        </p>
      </div>
    );
  }

  const totalAmount = discoveredBills
    .filter((bill: DiscoveredBill) => selectedBills.has(bill.id))
    .reduce((sum: number, bill: DiscoveredBill) => sum + Math.abs(bill.amount), 0);

  return (
    <>
      {/* Summary Bar */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-blue-700">
              <span className="font-medium">{selectedBills.size}</span> of{" "}
              <span className="font-medium">{discoveredBills.length}</span> bills selected
            </div>
            <div className="text-sm text-blue-600">
              Total estimated monthly: ${totalAmount.toFixed(2)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onSelectAll}
              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Select All
            </Button>
            <Button
              onClick={onClearAll}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="overflow-y-auto max-h-96 space-y-3">
        {discoveredBills.map((bill: DiscoveredBill) => {
          const isSelected = selectedBills.has(bill.id);

          return (
            <div
              key={bill.id}
              className={`p-4 border rounded-lg transition-all ${
                isSelected
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className="flex items-center gap-3">
                  <Checkbox checked={isSelected} onChange={() => onToggleSelection(bill.id)} />
                </div>

                {/* Bill Item Content */}
                <BillItemContent
                  bill={bill}
                  billEnvelopeMap={billEnvelopeMap}
                  availableEnvelopes={availableEnvelopes}
                  onUpdateEnvelope={onUpdateEnvelope}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
