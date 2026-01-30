/**
 * Success Step - Celebration and summary (Step 3)
 * Placeholder - Full implementation in Issue #161
 * Part of Epic #156: Polyglot Human-Centered Paycheck Flow v2.1
 */

import React from "react";

interface SuccessStepProps {
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ onFinish }) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success Icon */}
      <div className="mb-8">
        <div className="inline-block p-8 bg-green-50 hard-border rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-6xl">✓</div>
        </div>
      </div>

      {/* Success Message */}
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">PAYCHECK ALLOCATED!</h2>
      <p className="text-lg text-slate-600 mb-8">
        Your $2,500.00 paycheck has been successfully distributed across your envelopes.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white hard-border rounded-lg p-6">
          <div className="text-sm text-slate-600 mb-1">Envelopes Funded</div>
          <div className="text-3xl font-black text-fuchsia-600">4</div>
        </div>
        <div className="bg-white hard-border rounded-lg p-6">
          <div className="text-sm text-slate-600 mb-1">Monthly Progress</div>
          <div className="text-3xl font-black text-green-600">82%</div>
        </div>
      </div>

      {/* Top Allocations */}
      <div className="bg-white hard-border rounded-lg p-6 mb-8">
        <h3 className="font-black text-slate-900 mb-4">TOP ALLOCATIONS</h3>
        <div className="space-y-3">
          {[
            { envelope: "Rent", amount: 1000, status: "Covered ✅" },
            { envelope: "Savings", amount: 800, status: "+$200" },
            { envelope: "Groceries", amount: 500, status: "Covered ✅" },
          ].map((item) => (
            <div
              key={item.envelope}
              className="flex items-center justify-between p-3 bg-slate-50 rounded"
            >
              <span className="font-bold text-slate-900">{item.envelope}</span>
              <span className="text-slate-600">
                ${item.amount.toFixed(2)} <span className="text-green-600">{item.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={onFinish}
        className="
          px-12 py-4
          bg-fuchsia-500 text-white
          hard-border
          rounded-lg
          font-black
          text-lg
          tracking-wide
          hover:bg-fuchsia-600
          focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2
          transition-all
          shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
          active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
          active:translate-x-[3px] active:translate-y-[3px]
        "
      >
        BACK TO DASHBOARD
      </Button>

      {/* Placeholder note */}
      <div className="mt-8 p-4 bg-amber-50 hard-border rounded-lg">
        <p className="text-sm text-amber-900 text-left">
          <strong>🚧 Placeholder Component</strong>
          <br />
          Full implementation coming in Issue #161 with confetti animation and query invalidation.
        </p>
      </div>
    </div>
  );
};

export default SuccessStep;
