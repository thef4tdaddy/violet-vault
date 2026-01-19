import React, { useCallback } from "react";
import AccountCard from "./AccountCard";
import { useAccountBalances } from "@/hooks/dashboard/useAccountBalances";
import { useBudgetStore } from "@/stores/ui/uiStore";

/**
 * Props for AccountCards container
 */
export interface AccountCardsProps {
  /** Custom className for grid container */
  className?: string;
}

/**
 * Glassmorphic account cards container component
 *
 * Displays three account cards in a responsive grid:
 * 1. Checking Account Card - Current balance + recent transactions
 * 2. Savings Account Card - Total savings + goals progress
 * 3. Unassigned Cash Card - Unassigned funds + "Allocate Funds" button
 *
 * Features:
 * - Real-time data updates via TanStack Query
 * - Responsive grid layout (1 col mobile, 3 cols desktop)
 * - Loading skeletons during data fetch
 * - Error state handling
 * - Direct action buttons for common operations
 *
 * @example
 * ```tsx
 * <AccountCards className="mb-8" />
 * ```
 */
export const AccountCards: React.FC<AccountCardsProps> = ({ className = "" }) => {
  // Fetch account balances data
  const { accountBalances, isLoading, error } = useAccountBalances();

  // Get modal opener from Zustand store (UI state only)
  const openUnassignedCashModal = useBudgetStore(
    (state: { openUnassignedCashModal?: () => void }) => state.openUnassignedCashModal
  );

  // Handle "Allocate Funds" button click
  const handleAllocateFunds = useCallback(() => {
    openUnassignedCashModal?.();
  }, [openUnassignedCashModal]);

  // Error state
  if (error) {
    return (
      <div
        className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center"
        data-testid="account-cards-error"
      >
        <p className="text-red-600 font-semibold">Failed to load account data</p>
        <p className="text-red-500 text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      data-testid="account-cards-container"
    >
      {/* Checking Account Card */}
      <AccountCard
        type="checking"
        balance={accountBalances.checking.balance}
        subtitle={accountBalances.checking.isManual ? "Manual entry" : "Calculated balance"}
        isLoading={isLoading}
      />

      {/* Savings Account Card */}
      <AccountCard
        type="savings"
        balance={accountBalances.savings.balance}
        subtitle="Savings goals tracked"
        isLoading={isLoading}
      />

      {/* Unassigned Cash Card */}
      <AccountCard
        type="unassigned"
        balance={accountBalances.unassigned.amount}
        subtitle={
          accountBalances.unassigned.isNegative
            ? "Needs attention - overspent"
            : accountBalances.unassigned.isHigh
              ? "High balance - consider allocating"
              : "Available for allocation"
        }
        action={{
          label: "Allocate Funds",
          onClick: handleAllocateFunds,
          icon: "ArrowRight",
        }}
        isLoading={isLoading}
        isWarning={accountBalances.unassigned.isHigh || accountBalances.unassigned.isNegative}
      />
    </div>
  );
};

export default AccountCards;
