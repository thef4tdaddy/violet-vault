import React from "react";
import { useSyncHealthIndicator } from "../../hooks/sync/useSyncHealthIndicator";
import SyncStatusIndicator from "./health/SyncStatusIndicator";

const SyncHealthIndicator = () => {
  const {
    syncStatus,
    isBackgroundSyncing,
  } = useSyncHealthIndicator();

  return (
    <SyncStatusIndicator
      syncStatus={syncStatus}
      isBackgroundSyncing={isBackgroundSyncing}
      onClick={() => {}} // No dropdown - controls moved to settings
      showDetails={false}
    />
  );
};

export default SyncHealthIndicator;
