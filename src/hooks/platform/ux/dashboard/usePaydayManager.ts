import { useMemo, useCallback } from "react";
import { globalToast } from "@/stores/ui/toastStore";
import { predictNextPayday, type PaycheckEntry } from "@/utils/budgeting/paydayPredictor";
import logger from "@/utils/common/logger";
import type { PaycheckHistoryItem } from "./types";

/**
 * Hook for payday prediction and related actions
 * Extracts payday prediction logic and navigation handlers
 */
export const usePaydayManager = (
  paycheckHistory: PaycheckHistoryItem[] = [],
  setActiveView: (view: string) => void
) => {
  const normalizedHistory = useMemo<PaycheckEntry[]>(
    () =>
      paycheckHistory.map(
        (entry) =>
          ({
            ...entry,
            date: entry.date,
          }) as PaycheckEntry
      ),
    [paycheckHistory]
  );

  const paydayPrediction = useMemo(() => {
    return normalizedHistory.length >= 2 ? predictNextPayday(normalizedHistory) : null;
  }, [normalizedHistory]);

  const handleProcessPaycheck = useCallback(() => {
    setActiveView("paycheck");
    logger.debug("Navigating to paycheck processor");
  }, [setActiveView]);

  const handlePrepareEnvelopes = useCallback(() => {
    globalToast.showInfo(
      "Navigate to envelope management for funding planning!",
      "Funding Planning"
    );
    // Future enhancement: Direct navigation to envelope planning interface
  }, []);

  return {
    paydayPrediction,
    handleProcessPaycheck,
    handlePrepareEnvelopes,
  };
};
