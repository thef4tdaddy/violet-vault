import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { budgetDb } from "@/db/budgetDb";
import { tipService } from "@/services/tipService";
import useTipStore from "@/stores/ui/tipStore";
import logger from "@/utils/common/logger";

/**
 * Hook to get user state for tip filtering
 * Queries the database to determine what features the user has used
 */
export const useUserStateForTips = () => {
  const { updateUserMaturityScore } = useTipStore();

  // Query to check if user has envelopes
  const { data: hasEnvelopes = false } = useQuery({
    queryKey: ["tips-user-state", "envelopes"],
    queryFn: async () => {
      try {
        const count = await budgetDb.envelopes.count();
        return count > 0;
      } catch (error) {
        logger.error("Error checking envelopes for tips", error);
        return false;
      }
    },
    staleTime: 60000, // Cache for 1 minute
  });

  // Query to check if user has transactions
  const { data: hasTransactions = false } = useQuery({
    queryKey: ["tips-user-state", "transactions"],
    queryFn: async () => {
      try {
        const count = await budgetDb.transactions.count();
        return count > 0;
      } catch (error) {
        logger.error("Error checking transactions for tips", error);
        return false;
      }
    },
    staleTime: 60000,
  });

  // Query to check if user has debts
  const { data: hasDebts = false } = useQuery({
    queryKey: ["tips-user-state", "debts"],
    queryFn: async () => {
      try {
        const count = await budgetDb.debts.count();
        return count > 0;
      } catch (error) {
        logger.error("Error checking debts for tips", error);
        return false;
      }
    },
    staleTime: 60000,
  });

  // Query to check if user has bills
  const { data: hasBills = false } = useQuery({
    queryKey: ["tips-user-state", "bills"],
    queryFn: async () => {
      try {
        const count = await budgetDb.bills.count();
        return count > 0;
      } catch (error) {
        logger.error("Error checking bills for tips", error);
        return false;
      }
    },
    staleTime: 60000,
  });

  // Query to check if user has paychecks
  const { data: hasPaychecks = false } = useQuery({
    queryKey: ["tips-user-state", "paychecks"],
    queryFn: async () => {
      try {
        const count = await budgetDb.paycheckHistory.count();
        return count > 0;
      } catch (error) {
        logger.error("Error checking paychecks for tips", error);
        return false;
      }
    },
    staleTime: 60000,
  });

  // Calculate days since signup (placeholder - would need actual user creation date)
  const daysSinceSignup = useMemo(() => {
    // TODO: Get actual user creation date from auth context or user profile
    // For now, use a placeholder value
    return 0;
  }, []);

  // Build user state object
  const userState = useMemo(
    () => ({
      hasEnvelopes,
      hasTransactions,
      hasDebts,
      hasBills,
      hasPaychecks,
      daysSinceSignup,
    }),
    [hasEnvelopes, hasTransactions, hasDebts, hasBills, hasPaychecks, daysSinceSignup]
  );

  // Calculate and update user maturity score
  useMemo(() => {
    const score = tipService.calculateUserMaturityScore(userState);
    updateUserMaturityScore(score);
  }, [userState, updateUserMaturityScore]);

  return userState;
};
