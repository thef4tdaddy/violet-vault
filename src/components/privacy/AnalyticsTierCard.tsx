import React from "react";
import Button from "@/components/ui/buttons/Button";
import { getIcon } from "@/utils/ui/icons";
import type { AnalyticsTierInfo } from "@/stores/ui/allocationAnalyticsStore";

interface AnalyticsTierCardProps {
  tier: AnalyticsTierInfo;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * AnalyticsTierCard Component
 * Reusable card component for displaying analytics tier options
 *
 * Features:
 * - Privacy level indicator with shield icon
 * - Bundle size estimate display
 * - Feature list with bullet points
 * - Disabled state for coming soon tiers
 * - Accessible with proper ARIA labels
 * - Responsive glassmorphic design
 *
 * Usage:
 * <AnalyticsTierCard
 *   tier={ANALYTICS_TIERS[0]}
 *   isSelected={selectedTier === 'offline'}
 *   onSelect={() => handleSelect('offline')}
 * />
 */
const AnalyticsTierCard: React.FC<AnalyticsTierCardProps> = ({ tier, isSelected, onSelect }) => {
  const privacyColors = {
    Maximum: "text-green-600 bg-green-100",
    High: "text-blue-600 bg-blue-100",
    Standard: "text-purple-600 bg-purple-100",
  };

  const borderColors = {
    Maximum: "border-green-400",
    High: "border-blue-400",
    Standard: "border-purple-400",
  };

  return (
    <Button
      type="button"
      onClick={tier.disabled ? undefined : onSelect}
      disabled={tier.disabled}
      className={`
        w-full text-left p-4 rounded-2xl border-2 transition-all
        ${tier.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-lg"}
        ${
          isSelected
            ? `${borderColors[tier.privacyLevel]} bg-white shadow-lg scale-[1.02]`
            : "border-gray-300 bg-white/60 hover:border-gray-400"
        }
      `}
      aria-label={`${tier.title} - ${tier.description}`}
      aria-pressed={isSelected}
      aria-disabled={tier.disabled}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`
          shrink-0 p-3 rounded-xl border-2 border-black
          ${isSelected ? privacyColors[tier.privacyLevel] : "bg-gray-100 text-gray-600"}
        `}
        >
          {React.createElement(getIcon(tier.icon), {
            className: "h-6 w-6",
            "aria-hidden": "true",
          })}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Coming Soon Badge */}
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-bold text-gray-900">{tier.title}</h4>
            {tier.comingSoon && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
                Coming Soon
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 mb-3">{tier.description}</p>

          {/* Badges: Privacy Level & Bundle Size */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className={`
              px-2 py-1 text-xs font-semibold rounded-lg border
              ${privacyColors[tier.privacyLevel]} border-black
            `}
            >
              🛡️ {tier.privacyLevel} Privacy
            </span>
            <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-800 border border-black">
              📦 {tier.bundleSize}
            </span>
          </div>

          {/* Features List */}
          <ul className="space-y-1" role="list">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-green-600 font-bold mt-0.5" aria-hidden="true">
                  ✓
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Radio Indicator */}
        <div className="shrink-0 mt-1">
          <div
            className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center
            ${isSelected ? "border-blue-600 bg-blue-600" : "border-gray-400 bg-white"}
          `}
            aria-hidden="true"
          >
            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </div>
      </div>
    </Button>
  );
};

export default AnalyticsTierCard;
