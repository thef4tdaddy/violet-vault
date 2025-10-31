import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import SplitAllocationRow from "./SplitAllocationRow";
import type { SplitAllocation, Envelope } from "@/types/finance";

interface SplitAllocationsSectionProps {
  splitAllocations: SplitAllocation[];
  availableCategories: string[];
  envelopes: Envelope[];
  onUpdateSplit: (id: string | number, field: string, value: string | number) => void;
  onRemoveSplit: (id: string | number) => void;
  onAddSplit: () => void;
  onSmartSplit: () => void;
  onAutoBalance: () => void;
  canAutoBalance: boolean;
}

const SplitAllocationsSection: React.FC<SplitAllocationsSectionProps> = ({
  splitAllocations,
  availableCategories,
  envelopes,
  onUpdateSplit,
  onRemoveSplit,
  onAddSplit,
  onSmartSplit,
  onAutoBalance,
  canAutoBalance,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-gray-900 flex items-center">
          <div className="glassmorphism rounded-full p-1 mr-2 border border-purple-300">
            {React.createElement(getIcon("Tag"), {
              className: "h-4 w-4 text-purple-600",
            })}
          </div>
          SPLIT ALLOCATIONS ({splitAllocations.length})
        </h3>

        <div className="flex gap-2">
          <Button
            onClick={onSmartSplit}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all border-2 border-black shadow-md hover:shadow-lg font-bold"
          >
            {React.createElement(getIcon("Target"), { className: "h-4 w-4" })}
            Smart Split
          </Button>

          <Button
            onClick={onAddSplit}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all border-2 border-black shadow-md hover:shadow-lg font-bold"
          >
            {React.createElement(getIcon("Plus"), { className: "h-4 w-4" })}
            Add Split
          </Button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-gradient-to-r from-gray-100/80 to-purple-100/80 backdrop-blur-sm rounded-xl border border-gray-300 shadow-sm">
        <div className="col-span-4">
          <span className="text-xs font-black text-gray-700 uppercase">DESCRIPTION</span>
        </div>
        <div className="col-span-2">
          <span className="text-xs font-black text-gray-700 uppercase">AMOUNT</span>
        </div>
        <div className="col-span-3">
          <span className="text-xs font-black text-gray-700 uppercase">CATEGORY</span>
        </div>
        <div className="col-span-2">
          <span className="text-xs font-black text-gray-700 uppercase">ENVELOPE</span>
        </div>
        <div className="col-span-1">
          <span className="text-xs font-black text-gray-700 uppercase">ACTION</span>
        </div>
      </div>

      {/* Split Rows */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {splitAllocations.map((split, index) => (
          <SplitAllocationRow
            key={split.id}
            split={split}
            index={index}
            canRemove={splitAllocations.length > 1}
            onUpdate={onUpdateSplit}
            onRemove={onRemoveSplit}
            availableCategories={availableCategories}
            envelopes={envelopes}
          />
        ))}
      </div>

      {/* Auto Balance Button */}
      {canAutoBalance && (
        <div className="flex justify-center pt-2">
          <Button
            onClick={onAutoBalance}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all border-2 border-black shadow-md hover:shadow-lg font-bold"
          >
            {React.createElement(getIcon("RefreshCw"), {
              className: "h-4 w-4",
            })}
            Auto Balance Remaining ${Math.abs(0).toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SplitAllocationsSection;
