/**
 * GotPaidCTA Component - Issue #157
 * High-visibility entry point for Paycheck Wizard
 * Part of Epic #156: Polyglot Human-Centered Paycheck Flow v2.1
 *
 * Design: "Hard Lines" aesthetic with pulse animation
 * Visibility: Only shows when paycheck envelope exists OR within ±3 days of pay date
 */

import React from "react";
import { usePaycheckFlowStore } from "@/stores/ui/paycheckFlowStore";
import { usePaydayProgress } from "@/hooks/dashboard/usePaydayProgress";
import Button from "@/components/ui/buttons/Button";

interface GotPaidCTAProps {
  /** Optional CSS classes */
  className?: string;
}

/**
 * Check if we should show the "Got Paid?" CTA
 * Shows when:
 * - User has upcoming payday (from usePaydayProgress)
 * - Within ±3 days of expected pay date
 */
const useShouldShowCTA = (): boolean => {
  const { daysUntilPayday, hasError } = usePaydayProgress();

  // Don't show if there's an error or no payday data
  if (hasError || daysUntilPayday === null) {
    return false;
  }

  // Show if within -3 to +3 days of payday (±3 day window)
  // Negative days = overdue, positive = upcoming
  const isNearPayday = Math.abs(daysUntilPayday) <= 3;

  return isNearPayday;
};

/**
 * GotPaidCTA - Prominent call-to-action for paycheck wizard
 *
 * Features:
 * - Pulse animation on dollar icon
 * - Hard Lines aesthetic (thick borders, sharp corners, neo-brutalist shadow)
 * - Tactile feedback (active:scale-95)
 * - Opens paycheck wizard on click
 * - Conditional visibility (only when near payday)
 *
 * @example
 * ```tsx
 * <GotPaidCTA />
 * ```
 */
const GotPaidCTA: React.FC<GotPaidCTAProps> = ({ className = "" }) => {
  const openWizard = usePaycheckFlowStore((state) => state.openWizard);
  const shouldShow = useShouldShowCTA();

  // Don't render if conditions not met
  if (!shouldShow) {
    return null;
  }

  return (
    <Button
      onClick={openWizard}
      className={`
        group relative
        w-full px-6 py-4
        bg-slate-50 border-2 border-fuchsia-500 rounded-lg
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        active:scale-95 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
        transition-all duration-150
        ${className}
      `}
      data-testid="got-paid-cta"
      aria-label="Start paycheck allocation wizard"
    >
      <div className="flex items-center justify-center gap-4">
        {/* Dollar Icon with Pulse Animation */}
        <div className="relative">
          <span className="text-4xl animate-pulse" role="img" aria-label="Money">
            💵
          </span>
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-fuchsia-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* CTA Text */}
        <div className="text-left">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight font-mono">
            GOT PAID?
          </h2>
          <p className="text-sm text-slate-600 font-semibold mt-1">
            Allocate your paycheck in 60 seconds
          </p>
        </div>

        {/* Arrow Indicator */}
        <div className="ml-auto">
          <svg
            className="w-8 h-8 text-fuchsia-500 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </Button>
  );
};

export default GotPaidCTA;
