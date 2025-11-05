import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import BillTableHeader from "./BillTableHeader";
import BillTableEmptyState from "./BillTableEmptyState";
import BillTableBulkActions from "./BillTableBulkActions";
import { validateComponentProps } from "@/utils/validation/propValidator";
import { BillTablePropsSchema } from "@/domain/schemas/component-props";

/**
 * Bill entity type - flexible structure to accept any bill-like object
 */
type BillEntity = Record<string, unknown> & {
  id: string;
  name: string;
  category?: string;
  isPaid?: boolean;
};

/**
 * Selection state interface
 */
interface SelectionState {
  hasSelection: boolean;
  selectedCount: number;
}

/**
 * Bill display data interface
 */
interface BillDisplayData {
  isSelected: boolean;
  Icon: React.ComponentType<{ className?: string }>;
  amount: string;
  dueDateDisplay: string;
  daysDisplay?: string;
  urgencyColors: string;
  statusText: string;
}

/**
 * Props for BillTable component
 */
interface BillTableProps {
  filteredBills: BillEntity[];
  selectionState: SelectionState;
  clearSelection: () => void;
  selectAllBills: () => void;
  toggleBillSelection: (billId: string) => void;
  setShowBulkUpdateModal: (show: boolean) => void;
  setShowBillDetail: (bill: BillEntity) => void;
  getBillDisplayData: (bill: BillEntity) => BillDisplayData;
  billOperations: {
    handlePayBill: (billId: string) => Promise<void>;
  };
  categorizedBills: Record<string, BillEntity[]>;
  viewMode: string;
}

/**
 * Bill table with bulk actions and selection
 * Pure UI component that preserves exact visual appearance
 */
const BillTable: React.FC<BillTableProps> = ({
  filteredBills,
  selectionState,
  clearSelection,
  selectAllBills,
  toggleBillSelection,
  setShowBulkUpdateModal,
  setShowBillDetail,
  getBillDisplayData,
  billOperations,
  categorizedBills,
  viewMode,
}) => {
  // Validate props in development
  validateComponentProps(
    "BillTable",
    {
      filteredBills,
      selectionState,
      clearSelection,
      selectAllBills,
      toggleBillSelection,
      setShowBulkUpdateModal,
      setShowBillDetail,
      getBillDisplayData,
      billOperations,
      categorizedBills,
      viewMode,
    },
    BillTablePropsSchema
  );

  return (
    <>
      {/* Bulk Actions */}
      <BillTableBulkActions
        selectionState={selectionState}
        setShowBulkUpdateModal={setShowBulkUpdateModal}
        clearSelection={clearSelection}
      />

      {/* Bills Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border-2 border-black">
        <table className="min-w-full divide-y divide-gray-200">
          <BillTableHeader
            selectionState={selectionState}
            clearSelection={clearSelection}
            selectAllBills={selectAllBills}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBills.map((bill) => {
              const displayData = getBillDisplayData(bill);

              return (
                <tr
                  key={bill.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setShowBillDetail(bill)}
                >
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={displayData.isSelected}
                      onChange={() => toggleBillSelection(bill.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <displayData.Icon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bill.name}</div>
                        <div className="text-sm text-gray-500">{bill.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof bill.amount === "number" ? `$${bill.amount.toFixed(2)}` : "No amount"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {displayData.dueDateDisplay}
                    {displayData.daysDisplay && (
                      <div className="text-xs text-gray-500">{displayData.daysDisplay}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${displayData.urgencyColors}`}
                    >
                      {displayData.statusText}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      {!bill.isPaid && (
                        <Button
                          onClick={() => billOperations.handlePayBill(bill.id)}
                          className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors font-medium text-xs flex items-center gap-1.5"
                          title="Mark as Paid"
                        >
                          {React.createElement(getIcon("CheckCircle"), {
                            className: "h-3.5 w-3.5",
                          })}
                          Pay
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredBills.length === 0 && (
          <BillTableEmptyState
            viewMode={viewMode}
            filteredBills={filteredBills}
            categorizedBills={categorizedBills}
          />
        )}
      </div>
    </>
  );
};

export default BillTable;
