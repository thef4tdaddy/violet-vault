import React, { lazy, Suspense, memo } from "react";
import { useBudgetStore, type UiStore } from "@/stores/ui/uiStore";
import { usePrompt } from "@/hooks/platform/ux/usePrompt";
import { useActualBalance } from "@/hooks/budgeting/metadata/useBudgetMetadata";
import { MetricCard } from "@/components/primitives/cards/MetricCard";
import { useSummaryMetrics } from "./hooks/useSummaryMetrics";

const UnassignedCashModal = lazy(() => import("../modals/UnassignedCashModal"));

/**
 * Summary cards component showing financial overview
 * Uses MetricCard primitive for consistent UI
 * Business logic extracted to useSummaryMetrics hook
 */
const SummaryCards = () => {
  const openUnassignedCashModal = useBudgetStore((state: UiStore) => state.openUnassignedCashModal);
  const { actualBalance, updateActualBalance } = useActualBalance();
  const prompt = usePrompt();

  // Handler for setting actual balance
  const handleSetActualBalance = async () => {
    const newBalance = await prompt({
      title: "Set Actual Balance",
      message: "Enter your current bank account balance:",
      defaultValue: actualBalance?.toString() || "0",
      inputType: "number",
      placeholder: "0.00",
      validation: (value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) {
          return { valid: false, error: "Please enter a valid number" };
        }
        return { valid: true };
      },
    });

    if (newBalance !== null) {
      await updateActualBalance(parseFloat(newBalance as string), {
        isManual: true,
        author: "User",
      });
    }
  };

  // Get metrics from custom hook
  const { metrics, isLoading } = useSummaryMetrics(openUnassignedCashModal, handleSetActualBalance);

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <MetricCard
            key={i}
            title=""
            value={0}
            format="currency"
            variant="default"
            loading={true}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-6 mb-6">
        {metrics.map((metric) => {
          const isNegativeUnassignedCash =
            metric.key === "unassigned-cash" &&
            typeof metric.value === "number" &&
            metric.value < 0;

          const title = isNegativeUnassignedCash ? `⚠️ ${metric.label}` : metric.label;

          // Compute subtitle with helpful guidance
          let computedSubtitle = metric.subtitle;
          if (isNegativeUnassignedCash) {
            computedSubtitle = "⚠️ Overspending - click to address";
          } else if (!computedSubtitle && metric.onClick) {
            computedSubtitle = "Click to distribute";
          }

          const cardElement = (
            <MetricCard
              title={title}
              value={metric.value}
              icon={metric.icon}
              variant={metric.variant}
              format="currency"
              subtitle={computedSubtitle}
              onClick={metric.onClick}
            />
          );

          // Wrap with div for animation and data attributes
          return (
            <div
              key={metric.key}
              className={isNegativeUnassignedCash ? "animate-pulse" : undefined}
              data-tour={metric.dataTour}
              aria-label={metric.ariaLabel}
              role={metric.onClick ? "button" : undefined}
              tabIndex={metric.onClick ? 0 : undefined}
              onKeyDown={
                metric.onClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        metric.onClick?.();
                      }
                    }
                  : undefined
              }
            >
              {cardElement}
            </div>
          );
        })}
      </div>

      <Suspense fallback={null}>
        <UnassignedCashModal />
      </Suspense>
    </>
  );
};

export default memo(SummaryCards);
