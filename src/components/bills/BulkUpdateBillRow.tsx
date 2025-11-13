import React from "react";
import { hasChanges, formatAmountChange } from "@/utils/bills/billUpdateHelpers";
import type { BillChange } from "@/utils/bills/billUpdateHelpers";
import {
  AmountUpdateField,
  DateUpdateField,
  BillInfo,
  ChangeIndicator,
  shouldShowAmountField,
  shouldShowDateField,
} from "./BulkUpdateBillRowComponents";

/**
 * Bill entity type - flexible to accept any bill-like structure
 */
type BillEntity = Record<string, unknown> & {
  id: string;
  name?: string;
};

/**
 * Update mode type
 */
type UpdateMode = "amount" | "date" | "both";

/**
 * Props for BulkUpdateBillRow component
 */
interface BulkUpdateBillRowProps {
  bill: BillEntity;
  change: BillChange | undefined;
  updateMode: UpdateMode;
  updateChange: (billId: string, field: string, value: string | number) => void;
}

/**
 * Individual bill row component for BulkUpdateEditor
 * Extracted to reduce complexity
 */
const BulkUpdateBillRow: React.FC<BulkUpdateBillRowProps> = ({
  bill,
  change,
  updateMode,
  updateChange,
}) => {
  const billHasChanges = hasChanges(change);
  const amountChange = formatAmountChange(change?.originalAmount, change?.amount);

  return (
    <div
      key={bill.id}
      className={`p-4 rounded-xl border-2 border-black shadow-md transition-all ${
        billHasChanges
          ? "bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm shadow-lg"
          : "bg-white/60 backdrop-blur-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <BillInfo bill={bill} />

        <div className="flex items-center gap-4">
          {shouldShowAmountField(updateMode) && (
            <AmountUpdateField
              change={change}
              amountChange={amountChange}
              billId={bill.id}
              updateChange={updateChange}
            />
          )}

          {shouldShowDateField(updateMode) && (
            <DateUpdateField change={change} billId={bill.id} updateChange={updateChange} />
          )}

          {billHasChanges && <ChangeIndicator />}
        </div>
      </div>
    </div>
  );
};

export default BulkUpdateBillRow;
