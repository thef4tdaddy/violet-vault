import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";

interface SelectionState {
  isAllSelected: boolean;
  selectedCount?: number;
}

interface BillTableHeaderProps {
  selectionState: SelectionState;
  clearSelection: () => void;
  selectAllBills: () => void;
}

/**
 * Table header component for BillTable
 * Extracted to reduce BillTable complexity
 */
const BillTableHeader: React.FC<BillTableHeaderProps> = ({
  selectionState,
  clearSelection,
  selectAllBills,
}) => {
  return (
    <thead className="bg-gray-50 border-b-2 border-black">
      <tr>
        <th className="px-6 py-3 text-center">
          <Button
            onClick={selectionState.isAllSelected ? clearSelection : selectAllBills}
            className="flex items-center justify-center w-6 h-6 mx-auto hover:bg-gray-200 rounded transition-colors"
            title={selectionState.isAllSelected ? "Deselect all bills" : "Select all bills"}
          >
            {selectionState.isAllSelected
              ? React.createElement(getIcon("CheckSquare"), {
                  className: "h-5 w-5 text-blue-600",
                })
              : React.createElement(getIcon("Square"), {
                  className: "h-5 w-5 text-gray-400",
                })}
          </Button>
        </th>
        <th className="px-6 py-3 text-left text-base font-black text-black tracking-wider">
          <span className="text-lg">B</span>ILL
        </th>
        <th className="px-6 py-3 text-left text-base font-black text-black tracking-wider">
          <span className="text-lg">A</span>MOUNT
        </th>
        <th className="px-6 py-3 text-left text-base font-black text-black tracking-wider">
          <span className="text-lg">D</span>UE <span className="text-lg">D</span>ATE
        </th>
        <th className="px-6 py-3 text-left text-base font-black text-black tracking-wider">
          <span className="text-lg">S</span>TATUS
        </th>
        <th className="px-6 py-3 text-right text-base font-black text-black tracking-wider">
          <span className="text-lg">A</span>CTIONS
        </th>
      </tr>
    </thead>
  );
};

export default BillTableHeader;
