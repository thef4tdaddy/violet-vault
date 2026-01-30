/**
 * Amount Entry Step - Paycheck amount input (Step 0)
 * Placeholder - Full implementation in Issue #1837
 * Part of Epic #156: Polyglot Human-Centered Paycheck Flow v2.1
 */

import React from "react";

interface AmountEntryStepProps {
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
}

const AmountEntryStep: React.FC<AmountEntryStepProps> = ({ onNext }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white hard-border rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-xl font-black text-slate-900 mb-4">HOW MUCH DID YOU GET PAID?</h2>

        <div className="mb-6">
          <label htmlFor="paycheck-amount" className="block text-sm font-bold text-slate-700 mb-2">
            Paycheck Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">
              $
            </span>
            <input
              type="number"
              id="paycheck-amount"
              placeholder="2,500.00"
              className="
                w-full pl-12 pr-4 py-4
                text-2xl font-black
                hard-border rounded-lg
                focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2
                focus:border-transparent
                transition-all
              "
              min="1"
              max="1000000"
              step="0.01"
            />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Enter the total amount from your paycheck ($1.00 - $1,000,000.00)
          </p>
        </div>

        <div className="bg-slate-100 hard-border rounded-lg p-4">
          <p className="text-sm text-slate-600">
            💡 <strong>Tip:</strong> This wizard will help you allocate your paycheck across your
            envelopes with smart suggestions and real-time validation.
          </p>
        </div>
      </div>

      {/* Placeholder note */}
      <div className="mt-4 p-4 bg-amber-50 hard-border rounded-lg">
        <p className="text-sm text-amber-900">
          <strong>🚧 Placeholder Component</strong>
          <br />
          Full implementation coming in Issue #1837 with validation and state integration.
        </p>
      </div>
    </div>
  );
};

export default AmountEntryStep;
