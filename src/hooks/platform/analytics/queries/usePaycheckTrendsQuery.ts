import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/utils/core/common/queryClient";
import useUiStore, { type UiStore } from "@/stores/ui/uiStore";
import { useShallow } from "zustand/react/shallow";

interface PaycheckItem {
  date: string | number | Date;
  amount: number;
}

/**
 * Hook for paycheck trends analytics data fetching and calculations
 */
export const usePaycheckTrendsQuery = () => {
  // Get data from Zustand store
  const { paycheckHistory } = useUiStore(
    useShallow((state: UiStore) => ({
      paycheckHistory: state.paycheckHistory || [],
    }))
  ) as { paycheckHistory: PaycheckItem[] };

  return useQuery({
    queryKey: queryKeys.paycheckPredictions(),
    queryFn: async () => {
      if (!paycheckHistory || paycheckHistory.length === 0) {
        return {
          trends: [],
          averageAmount: 0,
          frequency: null,
          growth: 0,
        };
      }

      // Sort paychecks by date
      const sortedPaychecks = [...paycheckHistory].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const averageAmount =
        sortedPaychecks.reduce((sum: number, pc) => sum + pc.amount, 0) / sortedPaychecks.length;

      // Calculate frequency (days between paychecks)
      const intervals: number[] = [];
      for (let i = 1; i < sortedPaychecks.length; i++) {
        const current = new Date(sortedPaychecks[i].date);
        const previous = new Date(sortedPaychecks[i - 1].date);
        const days = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
        intervals.push(days);
      }

      const averageInterval =
        intervals.length > 0
          ? intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
          : 0;

      // Determine frequency type
      let frequency = "irregular";
      if (averageInterval >= 13 && averageInterval <= 15) frequency = "biweekly";
      else if (averageInterval >= 6 && averageInterval <= 8) frequency = "weekly";
      else if (averageInterval >= 27 && averageInterval <= 33) frequency = "monthly";

      // Calculate growth rate (compare recent vs older paychecks)
      let growth = 0;
      if (sortedPaychecks.length >= 4) {
        const recentAvg =
          sortedPaychecks.slice(-2).reduce((sum: number, pc) => sum + pc.amount, 0) / 2;
        const olderAvg =
          sortedPaychecks.slice(0, 2).reduce((sum: number, pc) => sum + pc.amount, 0) / 2;
        growth = ((recentAvg - olderAvg) / olderAvg) * 100;
      }

      return {
        trends: sortedPaychecks,
        averageAmount,
        frequency,
        averageInterval,
        growth,
        totalEarned: sortedPaychecks.reduce((sum: number, pc) => sum + pc.amount, 0),
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!paycheckHistory,
  });
};
