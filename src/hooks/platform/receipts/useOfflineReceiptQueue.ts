import { useState, useEffect, useCallback } from "react";
import { captureError } from "@/utils/core/common/sentry";
import { logger } from "@/utils/core/common/logger";
import useToast from "@/hooks/platform/ux/useToast";
import { db } from "@/db/offlineReceiptsDB";

// --- Hook ---

interface UseOfflineReceiptQueueReturn {
  addToQueue: (file: File) => Promise<void>;
  retryQueue: () => Promise<void>;
  pendingCount: number;
  isOnline: boolean;
  isSyncing: boolean;
}

export const useOfflineReceiptQueue = (
  onUpload: (file: File) => Promise<void>
): UseOfflineReceiptQueueReturn => {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { showSuccess, showError } = useToast();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Monitor queue size
  useEffect(() => {
    let isMounted = true;
    const updateCount = async () => {
      try {
        const count = await db.uploads.where("status").equals("pending").count();
        if (isMounted) setPendingCount(count);
      } catch (e) {
        // Suppress errors during unmount/test teardown
        if (isMounted) {
          logger.error("Failed to count pending uploads", {
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }
    };

    updateCount();

    return () => {
      isMounted = false;
    };
  }, [isSyncing]);

  // Process queue
  const retryQueue = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const pendingItems = await db.uploads.where("status").equals("pending").toArray();

      if (pendingItems.length === 0) {
        setIsSyncing(false);
        return;
      }

      showSuccess("Syncing", `Uploading ${pendingItems.length} offline receipts...`);

      for (const item of pendingItems) {
        try {
          // Reconstruct File object
          const file = new File([item.file], item.filename, { type: item.file.type });

          await onUpload(file);

          // Delete from DB on success
          await db.uploads.delete(item.id);
        } catch (err) {
          logger.error("Failed to sync item", {
            id: item.id,
            error: err instanceof Error ? err.message : String(err),
          });
          // Update retry count or status if needed, leaving as pending for now to retry later
          await db.uploads.update(item.id, {
            retryCount: item.retryCount + 1,
          });
        }
      }

      const remaining = await db.uploads.where("status").equals("pending").count();
      setPendingCount(remaining);

      if (remaining === 0) {
        showSuccess("Sync Complete", "All offline receipts uploaded.");
      } else {
        showError("Sync Incomplete", `${remaining} receipts failed to upload.`);
      }
    } catch (error) {
      captureError(error as Error, { tags: { component: "OfflineQueueSync" } });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, onUpload, showSuccess, showError]);

  // Add to queue
  const addToQueue = useCallback(
    async (file: File) => {
      try {
        await db.uploads.add({
          id: crypto.randomUUID(),
          file: file,
          filename: file.name,
          timestamp: Date.now(),
          status: "pending",
          retryCount: 0,
        });

        const count = await db.uploads.where("status").equals("pending").count();
        setPendingCount(count);

        showSuccess("Saved Offline", "Receipt queued for upload when back online.");

        // Auto-process if online
        if (isOnline) {
          retryQueue();
        }
      } catch (error) {
        captureError(error as Error, { tags: { component: "OfflineQueue" } });
        showError("Offline Storage Error", "Could not save receipt offline.");
      }
    },
    [isOnline, showSuccess, showError, retryQueue]
  );

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      retryQueue();
    }
  }, [isOnline, retryQueue]);

  return {
    addToQueue,
    retryQueue,
    pendingCount,
    isOnline,
    isSyncing,
  };
};
