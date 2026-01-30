/**
 * Review Step - Review and confirm allocations (Step 2)
 * Placeholder - Full implementation in Issue #1838
 * Part of Epic #156: Polyglot Human-Centered Paycheck Flow v2.1
 */

import React from "react";

interface ReviewStepProps {
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white hard-border rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-xl font-black text-slate-900 mb-6">REVIEW YOUR ALLOCATION</h2>

        {/* Summary Card */}
        <div className="bg-fuchsia-50 hard-border rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">Total Paycheck</div>
              <div className="text-3xl font-black text-slate-900">$2,500.00</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 mb-1">Allocated</div>
              <div className="text-3xl font-black text-green-600">$2,500.00</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Allocation Status</span>
            <span className="px-3 py-1 bg-green-500 text-white font-bold rounded">✓ Complete</span>
          </div>
        </div>

        {/* Allocations List */}
        <div className="space-y-3 mb-6">
          {[
            { envelope: "Rent", amount: 1000, percent: 40 },
            { envelope: "Groceries", amount: 500, percent: 20 },
            { envelope: "Utilities", amount: 200, percent: 8 },
            { envelope: "Savings", amount: 800, percent: 32 },
          ].map((item) => (
            <div
              key={item.envelope}
              className="flex items-center justify-between p-4 bg-slate-50 hard-border rounded-lg"
            >
              <div>
                <div className="font-bold text-slate-900">{item.envelope}</div>
                <div className="text-sm text-slate-600">{item.percent}% of paycheck</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-slate-900">${item.amount.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Optional Adjustments Note */}
        <div className="bg-blue-50 hard-border rounded-lg p-4">
          <p className="text-sm text-blue-900">
            💡 <strong>Need changes?</strong> You can still edit individual allocations by clicking
            on them above, or go back to adjust your strategy.
          </p>
        </div>
      </div>

      {/* Placeholder note */}
      <div className="mt-4 p-4 bg-amber-50 hard-border rounded-lg">
        <p className="text-sm text-amber-900">
          <strong>🚧 Placeholder Component</strong>
          <br />
          Full implementation coming in Issue #1838 with transaction creation and database
          integration.
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;
