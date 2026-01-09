import { useEffect } from "react";
import { predictNextPayday, checkRecentPayday } from "@/utils/budgeting/paydayPredictor";
import useToast from "@/hooks/platform/ux/useToast";
import logger from "@/utils/common/logger";
import localStorageService from "@/services/storage/localStorageService";

interface PaycheckHistoryItem {
  date: string | Date;
  amount: number;
  [key: string]: unknown;
}

/**
 * Custom hook for payday prediction and notifications
 * Extracts payday prediction logic from MainLayout component
 */
const usePaydayPrediction = (
  paycheckHistory: PaycheckHistoryItem[] | null,
  isUnlocked: boolean
) => {
  const { showPayday } = useToast();

  // Check for payday predictions and show notifications
  useEffect(() => {
    if (!isUnlocked || !paycheckHistory || paycheckHistory.length < 2) return;

    const checkPayday = () => {
      try {
        const prediction = predictNextPayday(paycheckHistory);
        if (!prediction.nextPayday) return;

        const recentPayday = checkRecentPayday(prediction);

        // Check if we should show a payday notification
        const lastNotification = localStorageService.getLastPaydayNotification();
        const today = new Date().toDateString();

        // Show notification if:
        // 1. Today is predicted payday OR
        // 2. Payday was yesterday and we haven't shown notification yet
        if (recentPayday.occurred && (!lastNotification || lastNotification !== today)) {
          let title, message;

          if (recentPayday.wasToday) {
            title = "🎉 Payday Today!";
            message = `Based on your ${prediction.pattern} paycheck pattern, today should be payday! Consider processing your paycheck.`;
          } else if (recentPayday.wasYesterday) {
            title = "💰 Payday Was Yesterday";
            message = `Based on your ${prediction.pattern} pattern, payday was yesterday. Don't forget to process your paycheck!`;
          } else if (recentPayday.daysAgo === 2) {
            title = "📅 Recent Payday";
            message = `Based on your ${prediction.pattern} pattern, payday was ${recentPayday.daysAgo} days ago.`;
          }

          if (title && message) {
            showPayday(title, message, 10000); // Show for 10 seconds
            localStorageService.setLastPaydayNotification(today);
          }
        }
      } catch (error) {
        logger.error("Error checking payday prediction:", error);
      }
    };

    // Check immediately
    checkPayday();

    // Check daily at midnight and every few hours
    const interval = setInterval(checkPayday, 4 * 60 * 60 * 1000); // Every 4 hours

    return () => clearInterval(interval);
  }, [paycheckHistory, isUnlocked, showPayday]);
};

export default usePaydayPrediction;
