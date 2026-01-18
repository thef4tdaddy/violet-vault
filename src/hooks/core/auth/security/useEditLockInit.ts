import { useEffect } from "react";
import { initializeEditLocks } from "@/services/sync/editLockService";

interface CurrentUser {
  userName: string;
  userColor: string;
  userId?: string;
}

/**
 * Hook to initialize the edit lock service with current user context
 * This fulfills the architectural requirement of not importing services directly in components
 */
export const useEditLockInit = (budgetId: string | null, currentUser: CurrentUser | null) => {
  useEffect(() => {
    if (budgetId && currentUser) {
      initializeEditLocks(budgetId, currentUser);
    }
  }, [budgetId, currentUser]);
};
