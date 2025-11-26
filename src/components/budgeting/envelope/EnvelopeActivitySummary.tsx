import { ENVELOPE_TYPES } from "../../../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../../../constants/frequency";

interface EnvelopeForSummary {
  envelopeType?: string;
  totalSpent?: number;
  monthlyBudget?: number;
  targetAmount?: number;
  currentBalance?: number;
  progress?: number;
  lastFunded?: string | Date | null;
  totalUpcoming?: number;
  totalOverdue?: number;
}

/**
 * Envelope activity summary component
 * Shows different metrics based on envelope type (Variable vs Bill)
 *
 * Part of EnvelopeItem refactoring for ESLint compliance
 * Related to Epic #158 - Mobile UI/UX Enhancements
 */
const EnvelopeActivitySummary = ({ envelope }: { envelope: EnvelopeForSummary }) => {
  if (envelope.envelopeType === ENVELOPE_TYPES.VARIABLE) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 py-4">
        {/* Spent Box */}
        <div className="flex xl:flex-col items-center xl:items-stretch justify-between xl:justify-start bg-rose-50 rounded-lg p-3 xl:p-4 border border-rose-200">
          <p className="text-sm font-medium text-rose-700 xl:mb-2">Spent (30d)</p>
          <p className="text-lg xl:text-xl font-bold text-rose-700 whitespace-nowrap">
            ${(envelope.totalSpent ?? 0).toFixed(2)}
          </p>
        </div>
        {/* Monthly Budget Box */}
        <div className="flex xl:flex-col items-center xl:items-stretch justify-between xl:justify-start bg-sky-50 rounded-lg p-3 xl:p-4 border border-sky-200">
          <p className="text-sm font-medium text-sky-700 xl:mb-2">Monthly Budget</p>
          <p className="text-lg xl:text-xl font-bold text-sky-700 whitespace-nowrap">
            ${(envelope.monthlyBudget || 0).toFixed(2)}
          </p>
        </div>
        {/* Biweekly Box */}
        <div className="flex xl:flex-col items-center xl:items-stretch justify-between xl:justify-start bg-emerald-50 rounded-lg p-3 xl:p-4 border border-emerald-200">
          <p className="text-sm font-medium text-emerald-700 xl:mb-2">Biweekly</p>
          <p className="text-lg xl:text-xl font-bold text-emerald-700 whitespace-nowrap">
            ${((envelope.monthlyBudget || 0) / BIWEEKLY_MULTIPLIER).toFixed(2)}
          </p>
        </div>
      </div>
    );
  }

  // Bill envelope summary
  return (
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="text-center">
        <p className="text-gray-500">Spent</p>
        <p className="font-medium text-red-600">${(envelope.totalSpent ?? 0).toFixed(2)}</p>
      </div>
      <div className="text-center">
        <p className="text-gray-500">Upcoming</p>
        <p className="font-medium text-orange-600">${(envelope.totalUpcoming ?? 0).toFixed(2)}</p>
      </div>
      <div className="text-center">
        <p className="text-gray-500">Overdue</p>
        <p className="font-medium text-red-700">${(envelope.totalOverdue ?? 0).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default EnvelopeActivitySummary;
