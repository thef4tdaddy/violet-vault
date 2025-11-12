import React, { useCallback } from "react";
import { getIcon } from "@/utils";
import useTipStore from "@/stores/ui/tipStore";
import { TIP_CONFIGS } from "@/constants/tips";

/**
 * TipSettings Component
 * Allows users to manage tip preferences and view/revisit dismissed tips
 * Pure UI component for settings panel
 */
const TipSettings: React.FC = () => {
  const { preferences, setTipsEnabled, undismissTip, resetPreferences } = useTipStore();

  const handleToggleTips = useCallback(() => {
    setTipsEnabled(!preferences.tipsEnabled);
  }, [preferences.tipsEnabled, setTipsEnabled]);

  const handleUndismissTip = useCallback(
    (tipId: string) => {
      undismissTip(tipId);
    },
    [undismissTip]
  );

  const handleResetPreferences = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to reset all tip preferences? This will re-enable all dismissed tips."
      )
    ) {
      resetPreferences();
    }
  }, [resetPreferences]);

  // Get dismissed tips details
  const dismissedTips = TIP_CONFIGS.filter((tip) => preferences.dismissedTips.includes(tip.id));

  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {React.createElement(getIcon("Lightbulb"), {
                className: "h-5 w-5 text-blue-600",
              })}
              <h3 className="text-lg font-semibold text-gray-900">Tips & Hints</h3>
            </div>
            <p className="text-sm text-gray-600">
              Show helpful tips and hints throughout the app to guide you through features and best
              practices.
            </p>
          </div>
          <button
            onClick={handleToggleTips}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              preferences.tipsEnabled ? "bg-blue-600" : "bg-gray-200"
            }`}
            role="switch"
            aria-checked={preferences.tipsEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                preferences.tipsEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            {React.createElement(getIcon("Eye"), {
              className: "h-4 w-4 text-gray-400",
            })}
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Viewed
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{preferences.viewedTips.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            {React.createElement(getIcon("XCircle"), {
              className: "h-4 w-4 text-gray-400",
            })}
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Dismissed
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{preferences.dismissedTips.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            {React.createElement(getIcon("TrendingUp"), {
              className: "h-4 w-4 text-gray-400",
            })}
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Maturity Score
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{preferences.userMaturityScore}%</p>
        </div>
      </div>

      {/* Dismissed Tips */}
      {dismissedTips.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">Dismissed Tips</h4>
            <p className="text-xs text-gray-600 mt-1">Click to restore any dismissed tips</p>
          </div>
          <div className="divide-y divide-gray-200">
            {dismissedTips.map((tip) => (
              <div key={tip.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {tip.title && (
                      <h5 className="text-sm font-medium text-gray-900 mb-1">{tip.title}</h5>
                    )}
                    <p className="text-xs text-gray-600 line-clamp-2">{tip.content}</p>
                  </div>
                  <button
                    onClick={() => handleUndismissTip(tip.id)}
                    className="flex-shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <button
          onClick={handleResetPreferences}
          className="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          Reset All Tip Preferences
        </button>
        <p className="text-xs text-gray-500 mt-2">
          This will re-enable all tips and clear your viewing history
        </p>
      </div>
    </div>
  );
};

export default React.memo(TipSettings);
