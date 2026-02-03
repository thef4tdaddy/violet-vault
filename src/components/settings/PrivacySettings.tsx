import React, { useState } from "react";
import Button from "@/components/ui/buttons/Button";
import { getIcon } from "@/utils/ui/icons";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";
import {
  useAllocationAnalyticsStore,
  ANALYTICS_TIERS,
  type AnalyticsTier,
} from "@/stores/ui/allocationAnalyticsStore";
import AnalyticsTierCard from "@/components/privacy/AnalyticsTierCard";
import PrivacyExplainerModal from "@/components/privacy/PrivacyExplainerModal";

interface PrivacySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Bundle size progress percentages for each tier
 * Maps tier ID to progress bar percentage (0-100)
 */
const TIER_PROGRESS_PERCENTAGES: Record<AnalyticsTier, number> = {
  offline: 25,
  "private-backend": 60,
  "cloud-sync": 100,
} as const;

/**
 * Get progress percentage for a given tier
 */
const getTierProgress = (tier: AnalyticsTier): number => {
  return TIER_PROGRESS_PERCENTAGES[tier];
};

/**
 * PrivacySettings Component
 * User interface for selecting analytics tier with clear privacy trade-offs
 *
 * Features:
 * - Radio group with 3 analytics tier options
 * - Visual tier cards showing privacy level, bundle size, and features
 * - Privacy explainer modal with data flow diagrams
 * - Real-time bundle size display
 * - Persistent tier selection via localStorage
 * - Fully accessible (WCAG 2.1 AA)
 * - Mobile responsive glassmorphic design
 *
 * Usage:
 * <PrivacySettings
 *   isOpen={showPrivacySettings}
 *   onClose={() => setShowPrivacySettings(false)}
 * />
 */
const PrivacySettings: React.FC<PrivacySettingsProps> = ({ isOpen, onClose }) => {
  const modalRef = useModalAutoScroll(isOpen);
  const { analyticsTier, setAnalyticsTier } = useAllocationAnalyticsStore();
  const [showExplainer, setShowExplainer] = useState(false);

  const ShieldIcon = getIcon("Shield");
  const HelpCircleIcon = getIcon("HelpCircle");

  const handleTierSelect = (tier: AnalyticsTier) => {
    setAnalyticsTier(tier);
  };

  const currentTier = ANALYTICS_TIERS.find((t) => t.id === analyticsTier);
  const currentBundleSize = currentTier?.bundleSize || "~50 KB";

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div
          ref={modalRef}
          className="glassmorphism rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-black bg-purple-100/40 backdrop-blur-3xl my-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="glassmorphism rounded-full p-3 bg-purple-500/20 border border-purple-400">
                  <ShieldIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-black uppercase tracking-wide">
                    Privacy Settings
                  </h3>
                  <p className="text-sm text-purple-800 font-medium mt-1">
                    🔐 Choose your analytics tier and privacy level
                  </p>
                </div>
              </div>
              <ModalCloseButton onClick={onClose} />
            </div>

            {/* Scrollable Content */}
            <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2">
              {/* Info Banner */}
              <div className="glassmorphism rounded-2xl p-4 bg-blue-50/80 border-2 border-blue-400">
                <div className="flex items-start gap-3">
                  <HelpCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      <strong>Choose your privacy level:</strong> Each tier balances privacy with
                      performance. All tiers keep your financial data encrypted and secure.
                    </p>
                    <Button
                      onClick={() => setShowExplainer(true)}
                      className="text-sm text-blue-600 font-semibold hover:text-blue-800 underline mt-2"
                    >
                      Learn more about what data is sent where →
                    </Button>
                  </div>
                </div>
              </div>

              {/* Current Selection Summary */}
              <div className="glassmorphism rounded-2xl p-4 bg-white/60 border-2 border-gray-300">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                      Current Selection
                    </p>
                    <p className="text-lg font-bold text-gray-900">{currentTier?.title}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                        Privacy Level
                      </p>
                      <p className="text-sm font-bold text-gray-900">{currentTier?.privacyLevel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                        Bundle Size
                      </p>
                      <p className="text-sm font-bold text-gray-900">{currentBundleSize}</p>
                    </div>
                  </div>
                </div>

                {/* Bundle Size Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>Download Size</span>
                    <span className="font-semibold">{currentBundleSize}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full border border-gray-300 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 rounded-full"
                      style={{
                        width: `${getTierProgress(analyticsTier)}%`,
                      }}
                      role="progressbar"
                      aria-valuenow={getTierProgress(analyticsTier)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Bundle size: ${currentBundleSize}`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Minimal</span>
                    <span>Maximum</span>
                  </div>
                </div>
              </div>

              {/* Analytics Tier Cards */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Select Analytics Tier
                </h4>
                {ANALYTICS_TIERS.map((tier) => (
                  <AnalyticsTierCard
                    key={tier.id}
                    tier={tier}
                    isSelected={analyticsTier === tier.id}
                    onSelect={() => handleTierSelect(tier.id)}
                  />
                ))}
              </div>

              {/* Privacy Note */}
              <div className="glassmorphism rounded-2xl p-4 bg-green-50/80 border-2 border-green-400">
                <div className="flex items-start gap-3">
                  <ShieldIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>Privacy First:</strong> Your financial data always stays encrypted.
                      Violet Vault never sells, shares, or uses your data for advertising. You can
                      switch tiers anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setShowExplainer(true)}
                className="px-4 py-2 bg-white/60 text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:bg-white hover:border-gray-400 transition-colors shadow-sm"
              >
                Learn More
              </Button>
              <Button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg border-2 border-black hover:bg-blue-700 transition-colors shadow-sm"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Explainer Modal */}
      <PrivacyExplainerModal isOpen={showExplainer} onClose={() => setShowExplainer(false)} />
    </>
  );
};

export default PrivacySettings;
