interface DebtProgressData {
  hasProgress: boolean;
  percentage: number;
  remaining?: number;
  original?: number;
}

/**
 * Progress bar component for displaying debt payoff progress
 * Pure UI component - receives progress data as props
 */
const DebtProgressBar = ({ progressData }: { progressData: DebtProgressData }) => {
  if (!progressData.hasProgress) {
    return null;
  }

  const { percentage, remaining, original } = progressData;

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Payoff Progress</span>
        <span>{percentage.toFixed(1)}% paid off</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-green-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Original: ${original?.toFixed(2)}</span>
        <span>Remaining: ${remaining?.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default DebtProgressBar;
