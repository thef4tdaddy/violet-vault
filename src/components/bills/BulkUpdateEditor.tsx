import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import BulkUpdateBillRow from "./BulkUpdateBillRow";
import type { Bill } from "@/types/bills";

type BillEntity = Record<string, unknown> & {
  id: string;
  name?: string;
};

type UpdateMode = "amounts" | "dates" | "both";

type BillField = "amount" | "dueDate";

interface BillChanges {
  [billId: string]: {
    amount?: number;
    dueDate?: string;
    originalDueDate?: string;
  };
}

interface BulkUpdateEditorProps {
  selectedBills: Bill[];
  changes: BillChanges;
  updateMode: UpdateMode;
  updateChange: (billId: string, field: BillField, value: number | string) => void;
  applyBulkChange: (field: BillField, value: number | string) => void;
  resetChanges: () => void;
}

const BulkUpdateEditor: React.FC<BulkUpdateEditorProps> = ({
  selectedBills,
  changes,
  updateMode,
  updateChange,
  applyBulkChange,
  resetChanges,
}) => {
  return (
    <>
      {/* Bulk Actions */}
      <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/80 backdrop-blur-sm p-4 rounded-xl mb-6 border-2 border-black shadow-lg">
        <h4 className="font-black text-gray-900 mb-3">APPLY TO ALL SELECTED BILLS</h4>
        <div className="flex gap-3 flex-wrap">
          {(updateMode === "amounts" || updateMode === "both") && (
            <div className="flex items-center gap-2">
              <div className="glassmorphism rounded-full p-2 border border-gray-300">
                {React.createElement(getIcon("DollarSign"), {
                  className: "h-4 w-4 text-purple-600",
                })}
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="Set all amounts to..."
                className="px-3 py-2 border-2 border-black rounded-lg text-sm w-40 glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all"
                onChange={(e) => {
                  if (e.target.value) {
                    applyBulkChange("amount", parseFloat(e.target.value) || 0);
                  }
                }}
              />
            </div>
          )}

          {(updateMode === "dates" || updateMode === "both") && (
            <div className="flex items-center gap-2">
              <div className="glassmorphism rounded-full p-2 border border-gray-300">
                {React.createElement(getIcon("Calendar"), {
                  className: "h-4 w-4 text-purple-600",
                })}
              </div>
              <input
                type="date"
                className="px-3 py-2 border-2 border-black rounded-lg text-sm glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all"
                onChange={(e) => {
                  if (e.target.value) {
                    applyBulkChange("dueDate", e.target.value);
                  }
                }}
              />
            </div>
          )}

          <Button
            onClick={resetChanges}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 glassmorphism backdrop-blur-sm rounded-lg text-sm border-2 border-black shadow-md hover:shadow-lg transition-all font-medium"
          >
            {React.createElement(getIcon("Undo2"), { className: "h-4 w-4" })}
            Reset All
          </Button>
        </div>
      </div>

      {/* Bills List */}
      <div className="overflow-y-auto max-h-80">
        <div className="space-y-3">
          {selectedBills.map((bill) => (
            <BulkUpdateBillRow
              key={bill.id}
              bill={bill as unknown as BillEntity}
              change={changes[bill.id]}
              updateMode={updateMode as UpdateMode}
              updateChange={updateChange}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default BulkUpdateEditor;
