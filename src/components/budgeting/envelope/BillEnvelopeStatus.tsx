import React, { Suspense } from "react";
import { ENVELOPE_TYPES } from "../../../constants/categories";
import { getBillEnvelopeDisplayInfo } from "../../../utils/budgeting/billEnvelopeCalculations";
import type { BillEnvelopeResult } from "../../../utils/budgeting/billEnvelopeCalculations";
import type { Envelope as DbEnvelope, Bill as DbBill } from "@/db/types";

interface BillEnvelopeStatusProps {
  envelope: DbEnvelope;
  bills: DbBill[];
}

export const BillEnvelopeStatus: React.FC<BillEnvelopeStatusProps> = ({ envelope, bills }) => {
  if (envelope.envelopeType !== ENVELOPE_TYPES.BILL || bills.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-3 border-t border-gray-200">
      <Suspense fallback={<div className="text-xs text-gray-500">Loading funding info...</div>}>
        {(() => {
          const displayInfo = getBillEnvelopeDisplayInfo(envelope, bills);

          if (!displayInfo) return null;

          const typedInfo = displayInfo as BillEnvelopeResult;
          const nextBill = typedInfo.nextBill;
          const daysUntilNextBill = typedInfo.daysUntilNextBill ?? 0;
          const primaryStatus = typedInfo.displayText?.primaryStatus ?? "";

          return (
            <div className="space-y-1">
              {/* Status Text */}
              <div
                className={`text-sm font-medium ${
                  primaryStatus === "Fully Funded"
                    ? "text-green-600"
                    : primaryStatus === "On Track"
                      ? "text-blue-600"
                      : primaryStatus.startsWith("Behind")
                        ? "text-red-600"
                        : "text-orange-600"
                }`}
              >
                {primaryStatus}
              </div>

              {/* Next Bill Info */}
              {nextBill && (
                <div className="text-xs text-gray-500">
                  Next: {nextBill.name} in {daysUntilNextBill} day
                  {daysUntilNextBill !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })()}
      </Suspense>
    </div>
  );
};
