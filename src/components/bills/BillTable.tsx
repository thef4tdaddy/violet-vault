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
  isAllSelected: boolean;
  selectedCount: number;
  selectedBillIds: string[];
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
    handlePayBill: (
      billId: string,
      overrides?: { amount?: number; paidDate?: string; envelopeId?: string }
    ) => Promise<void>;
  };
  categorizedBills: Record<string, BillEntity[]>;
  viewMode: string;
}

type BillTableDesktopProps = Pick<
  BillTableProps,
  | "filteredBills"
  | "selectionState"
  | "clearSelection"
  | "selectAllBills"
  | "toggleBillSelection"
  | "setShowBillDetail"
  | "getBillDisplayData"
  | "billOperations"
>;

type BillTableMobileProps = Pick<
  BillTableProps,
  | "filteredBills"
  | "toggleBillSelection"
  | "setShowBillDetail"
  | "getBillDisplayData"
  | "billOperations"
>;

const BillTableDesktop = ({
  filteredBills,
  selectionState,
  clearSelection,
  selectAllBills,
  toggleBillSelection,
  setShowBillDetail,
  getBillDisplayData,
  billOperations,
}: BillTableDesktopProps) => {
  if (filteredBills.length === 0) {
    return null;
  }

  return (
    <div className="hidden md:block">
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
                        variant="secondary"
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
    </div>
  );
};

const BillTableMobile = ({
  filteredBills,
  toggleBillSelection,
  setShowBillDetail,
  getBillDisplayData,
  billOperations,
}: BillTableMobileProps) => {
  if (filteredBills.length === 0) {
    return null;
  }

  return (
    <div className="md:hidden divide-y divide-purple-200">
      {filteredBills.map((bill) => {
        const displayData = getBillDisplayData(bill);

        const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setShowBillDetail(bill);
          }
        };

        return (
          <div
            key={bill.id}
            role="button"
            tabIndex={0}
            className="w-full text-left p-4 flex flex-col gap-3 bg-white"
            onClick={() => setShowBillDetail(bill)}
            onKeyDown={handleKeyPress}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700 border border-purple-200 shrink-0">
                  <displayData.Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{bill.name}</p>
                  <p className="text-xs text-gray-500">{bill.category || "Uncategorized"}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={displayData.isSelected}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  event.stopPropagation();
                  toggleBillSelection(bill.id);
                }}
                className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Amount</p>
                <p className="font-semibold">
                  {typeof bill.amount === "number" ? `$${bill.amount.toFixed(2)}` : "Pending"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
                <span
                  className={`mt-1 inline-flex w-max items-center rounded-full px-2 py-0.5 text-xs font-semibold ${displayData.urgencyColors}`}
                >
                  {displayData.statusText}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Due</p>
                <p className="font-medium">
                  {displayData.dueDateDisplay}
                  {displayData.daysDisplay && (
                    <span className="block text-xs text-gray-500">{displayData.daysDisplay}</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Payment</p>
                <p className="font-medium">{bill.isPaid ? "Paid" : "Awaiting"}</p>
              </div>
            </div>

            {!bill.isPaid && (
              <div className="flex justify-end">
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    billOperations.handlePayBill(bill.id);
                  }}
                  className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-full shadow-sm hover:bg-green-700 transition-colors flex items-center gap-1.5"
                  variant="primary"
                  color="green"
                  type="button"
                >
                  {React.createElement(getIcon("CheckCircle"), {
                    className: "h-4 w-4",
                  })}
                  Pay from envelope
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

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
        <BillTableDesktop
          filteredBills={filteredBills}
          selectionState={selectionState}
          clearSelection={clearSelection}
          selectAllBills={selectAllBills}
          toggleBillSelection={toggleBillSelection}
          setShowBillDetail={setShowBillDetail}
          getBillDisplayData={getBillDisplayData}
          billOperations={billOperations}
        />
        <BillTableMobile
          filteredBills={filteredBills}
          toggleBillSelection={toggleBillSelection}
          setShowBillDetail={setShowBillDetail}
          getBillDisplayData={getBillDisplayData}
          billOperations={billOperations}
        />

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
