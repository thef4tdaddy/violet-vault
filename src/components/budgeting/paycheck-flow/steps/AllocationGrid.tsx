import React from "react";

interface AllocationItem {
  envelopeId: string;
  amountCents: number;
}

interface AllocationGridProps {
  envelopes: Array<{ id: string; name: string; currentBalance?: number }>;
  allocations: AllocationItem[];
  paycheckAmountCents: number | null;
  remainingCents: number;
  onManualChange: (envelopeId: string, value: string) => void;
  formatCents: (cents: number) => string;
}

export const AllocationGrid: React.FC<AllocationGridProps> = ({
  envelopes,
  allocations,
  paycheckAmountCents,
  remainingCents,
  onManualChange,
  formatCents,
}) => {
  const getAllocationForEnvelope = (envelopeId: string): number => {
    const allocation = allocations.find((a) => a.envelopeId === envelopeId);
    return allocation ? allocation.amountCents : 0;
  };

  return (
    <div className="bg-slate-50 hard-border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-slate-900">ALLOCATIONS</h3>
        <div className="text-sm font-bold">
          <span className="text-slate-600">Remaining:</span>
          <span
            className={`ml-2 text-lg ${
              remainingCents === 0
                ? "text-green-600"
                : remainingCents < 0
                  ? "text-red-600"
                  : "text-fuchsia-600"
            }`}
          >
            {formatCents(remainingCents)}
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {envelopes.length === 0 ? (
          <div className="text-center text-slate-600 py-8">
            <p>No envelopes found. Create envelopes first to allocate funds.</p>
          </div>
        ) : (
          envelopes.map((envelope) => {
            const allocationCents = getAllocationForEnvelope(envelope.id);
            const percentage =
              paycheckAmountCents && paycheckAmountCents > 0
                ? (allocationCents / paycheckAmountCents) * 100
                : 0;

            return (
              <div
                key={envelope.id}
                className="flex items-center justify-between p-4 bg-white hard-border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{envelope.name}</div>
                  <div className="text-sm text-slate-600">{percentage.toFixed(2)}% allocated</div>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={allocationCents > 0 ? (allocationCents / 100).toFixed(2) : ""}
                  onChange={(e) => onManualChange(envelope.id, e.target.value)}
                  placeholder="$0.00"
                  className="w-32 px-3 py-2 text-right font-black hard-border rounded focus:ring-2 focus:ring-fuchsia-500"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
