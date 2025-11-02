import { ENVELOPE_TYPES } from "../../../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../../../constants/frequency";

/**
 * Envelope activity summary component
 * Shows different metrics based on envelope type (Variable vs Bill)
 *
 * Part of EnvelopeItem refactoring for ESLint compliance
 * Related to Epic #158 - Mobile UI/UX Enhancements
 */
const EnvelopeActivitySummary = ({ envelope }) => {
  if (envelope.envelopeType === ENVELOPE_TYPES.VARIABLE) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 py-4">
        {/* Spent Box */}
        <div className="flex lg:flex-col items-center lg:items-stretch justify-between lg:justify-start bg-red-50 rounded-lg p-3 lg:p-4 border border-red-100">
          <p className="text-sm font-medium text-red-700 lg:mb-2">Spent (30d)</p>
          <p className="text-lg lg:text-xl font-bold text-red-600 whitespace-nowrap">${envelope.totalSpent.toFixed(2)}</p>
        </div>
        {/* Monthly Budget Box */}
        <div className="flex lg:flex-col items-center lg:items-stretch justify-between lg:justify-start bg-blue-50 rounded-lg p-3 lg:p-4 border border-blue-100">
          <p className="text-sm font-medium text-blue-700 lg:mb-2">Monthly Budget</p>
          <p className="text-lg lg:text-xl font-bold text-blue-600 whitespace-nowrap">
            ${(envelope.monthlyBudget || 0).toFixed(2)}
          </p>
        </div>
        {/* Biweekly Box */}
        <div className="flex lg:flex-col items-center lg:items-stretch justify-between lg:justify-start bg-green-50 rounded-lg p-3 lg:p-4 border border-green-100">
          <p className="text-sm font-medium text-green-700 lg:mb-2">Biweekly</p>
          <p className="text-lg lg:text-xl font-bold text-green-600 whitespace-nowrap">
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
        <p className="font-medium text-red-600">${envelope.totalSpent.toFixed(2)}</p>
      </div>
      <div className="text-center">
        <p className="text-gray-500">Upcoming</p>
        <p className="font-medium text-orange-600">${envelope.totalUpcoming.toFixed(2)}</p>
      </div>
      <div className="text-center">
        <p className="text-gray-500">Overdue</p>
        <p className="font-medium text-red-700">${envelope.totalOverdue.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default EnvelopeActivitySummary;
