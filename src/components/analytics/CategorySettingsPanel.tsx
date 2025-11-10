interface AnalysisSettings {
  minTransactionCount: number;
  minAmount?: number;
  unusedCategoryThreshold?: number;
}

interface CategorySettingsPanelProps {
  isVisible: boolean;
  analysisSettings: AnalysisSettings;
  onSettingsChange: (settings: Partial<AnalysisSettings>) => void;
}

const CategorySettingsPanel = ({ isVisible, analysisSettings, onSettingsChange }: CategorySettingsPanelProps) => {
  if (!isVisible) return null;

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-gray-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl border-2 border-black shadow-lg">
      <h4 className="font-black text-gray-900 mb-4">ANALYSIS SETTINGS</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <label className="block text-purple-800 font-bold mb-1">MIN TRANSACTIONS</label>
          <input
            type="number"
            value={analysisSettings.minTransactionCount}
            onChange={(e) =>
              onSettingsChange({
                minTransactionCount: parseInt(e.target.value) || 5,
              })
            }
            className="w-full px-2 py-1 border-2 border-black rounded glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all"
            min="1"
            max="20"
          />
        </div>
        <div>
          <label className="block text-purple-800 font-bold mb-1">MIN AMOUNT ($)</label>
          <input
            type="number"
            value={analysisSettings.minAmount}
            onChange={(e) =>
              onSettingsChange({
                minAmount: parseInt(e.target.value) || 25,
              })
            }
            className="w-full px-2 py-1 border-2 border-black rounded glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all"
            min="1"
            max="500"
          />
        </div>
        <div>
          <label className="block text-purple-800 font-bold mb-1">UNUSED THRESHOLD (MONTHS)</label>
          <input
            type="number"
            value={analysisSettings.unusedCategoryThreshold}
            onChange={(e) =>
              onSettingsChange({
                unusedCategoryThreshold: parseInt(e.target.value) || 3,
              })
            }
            className="w-full px-2 py-1 border-2 border-black rounded glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all"
            min="1"
            max="12"
          />
        </div>
      </div>
    </div>
  );
};

export default CategorySettingsPanel;
