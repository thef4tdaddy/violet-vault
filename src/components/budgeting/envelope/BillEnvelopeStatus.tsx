import React, { Suspense } from 'react';
import { ENVELOPE_TYPES } from '../../../constants/categories';
import { getBillEnvelopeDisplayInfo } from '../../../utils/budgeting/billEnvelopeCalculations';

interface Envelope {
  id: string;
  envelopeType: string;
}

interface Bill {
  id: string;
  name: string;
  envelopeId: string;
  dueDate: string;
}

interface BillEnvelopeStatusProps {
  envelope: Envelope;
  bills: Bill[];
}

export const BillEnvelopeStatus: React.FC<BillEnvelopeStatusProps> = ({
  envelope,
  bills,
}) => {
  if (envelope.envelopeType !== ENVELOPE_TYPES.BILL || bills.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-3 border-t border-gray-200">
      <Suspense
        fallback={<div className="text-xs text-gray-500">Loading funding info...</div>}
      >
        {(() => {
          // Use the imported function
          const displayInfo = getBillEnvelopeDisplayInfo(envelope, bills);

          if (!displayInfo) return null;

          const displayInfoTyped = displayInfo as {
            nextBill: { name: string } | null;
            daysUntilNextBill: number;
            displayText: { primaryStatus: string };
          };
          const { nextBill, daysUntilNextBill, displayText } = displayInfoTyped;

          return (
            <div className="space-y-1">
              {/* Status Text */}
              <div
                className={`text-sm font-medium ${
                  displayText.primaryStatus === "Fully Funded"
                    ? "text-green-600"
                    : displayText.primaryStatus === "On Track"
                      ? "text-blue-600"
                      : displayText.primaryStatus.startsWith("Behind")
                        ? "text-red-600"
                        : "text-orange-600"
                }`}
              >
                {displayText.primaryStatus}
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
