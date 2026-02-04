import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils/ui/icons";
import { useAllocationAnalyticsStore, ANALYTICS_TIERS } from "@/stores/ui/allocationAnalyticsStore";

interface PrivacySettingsSectionProps {
  onOpenPrivacySettings: () => void;
}

/**
 * PrivacySettingsSection Component
 * Section in settings dashboard for privacy and analytics tier configuration
 *
 * Features:
 * - Shows current analytics tier selection
 * - Button to open full privacy settings modal
 * - Quick summary of current privacy level
 */
const EyeIcon = getIcon("Eye");
const ShieldIcon = getIcon("Shield");

const PrivacySettingsSection: React.FC<PrivacySettingsSectionProps> = ({
  onOpenPrivacySettings,
}) => {
  const analyticsTier = useAllocationAnalyticsStore((state) => state.analyticsTier);
  const currentTier = ANALYTICS_TIERS.find((t) => t.id === analyticsTier);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Privacy & Analytics</h3>

      {/* Current Selection Display */}
      <div className="glassmorphism rounded-2xl p-4 bg-white/60 border-2 border-gray-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 border border-black">
              <ShieldIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                Current Tier
              </p>
              <p className="text-base font-bold text-gray-900">{currentTier?.title}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
              Privacy Level
            </p>
            <p className="text-sm font-bold text-gray-900">{currentTier?.privacyLevel}</p>
          </div>
        </div>

        <p className="text-sm text-gray-700">{currentTier?.description}</p>
      </div>

      {/* Privacy Settings Button */}
      <div className="space-y-4">
        <Button
          onClick={onOpenPrivacySettings}
          className="w-full flex items-center p-3 border-2 border-black bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors shadow-sm"
        >
          <EyeIcon className="h-5 w-5 text-purple-600 mr-3" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Analytics Tier Selection</p>
            <p className="text-sm text-gray-700">Choose your privacy level and bundle size</p>
          </div>
        </Button>
      </div>

      {/* Privacy Info */}
      <div className="glassmorphism rounded-2xl p-4 bg-green-50/80 border-2 border-green-400">
        <div className="flex items-start gap-3">
          <ShieldIcon className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Privacy First</p>
            <p className="text-xs text-gray-700">
              Your financial data is always encrypted and secure. Choose the analytics tier that
              best matches your privacy needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettingsSection;
