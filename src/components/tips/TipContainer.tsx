import React, { useMemo, useCallback } from "react";
import { TipContext, type TipConfig } from "@/domain/schemas/tip";
import { tipService } from "@/services/tipService";
import useTipStore from "@/stores/ui/tipStore";
import TipCard from "./TipCard";

interface TipContainerProps {
  context: TipContext;
  userState: {
    hasEnvelopes: boolean;
    hasTransactions: boolean;
    hasDebts: boolean;
    hasBills: boolean;
    hasPaychecks: boolean;
    daysSinceSignup: number;
  };
  maxTips?: number;
  compact?: boolean;
  className?: string;
}

/**
 * TipContainer Component
 * Displays context-aware tips based on user state and preferences
 * Filters and sorts tips automatically
 */
const TipContainer: React.FC<TipContainerProps> = ({
  context,
  userState,
  maxTips = 1,
  compact = false,
  className = "",
}) => {
  const { preferences, dismissTip } = useTipStore();

  // Get applicable tips for current context
  const applicableTips = useMemo(() => {
    const tips = tipService.getApplicableTips(context, preferences, userState);
    return tips.slice(0, maxTips);
  }, [context, preferences, userState, maxTips]);

  const handleDismiss = useCallback(
    (tipId: string) => {
      dismissTip(tipId);
    },
    [dismissTip]
  );

  // Don't render if no tips to show
  if (applicableTips.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {applicableTips.map((tip: TipConfig) => (
        <TipCard key={tip.id} tip={tip} onDismiss={() => handleDismiss(tip.id)} compact={compact} />
      ))}
    </div>
  );
};

export default React.memo(TipContainer);
