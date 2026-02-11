interface DebtCardProgressData {
  hasProgress: boolean;
  percentage: number;
}

/**
 * Progress bar component for debt card display
 * Pure UI component - receives progress data as props
 */
const DebtCardProgressBar = ({ progressData }: { progressData: DebtCardProgressData }) => {
  if (!progressData.hasProgress) {
    return <div className="text-xs text-gray-500">No progress data</div>;
  }

  const { percentage } = progressData;

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Progress</span>
        <span>{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default DebtCardProgressBar;
