import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Download,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import useManualSync from "../../hooks/common/useManualSync";

/**
 * Manual sync controls component for family budget collaboration
 * Allows explicit control over Dexie ↔ Firebase synchronization
 */
export const ManualSyncControls = ({ className = "" }) => {
  const {
    forceUploadSync,
    forceDownloadSync,
    forceFullSync,
    getSyncStatus,
    isUploadingSyncInProgress,
    isDownloadingSyncInProgress,
    isSyncInProgress,
    lastSyncTime,
    syncError,
    clearSyncError,
  } = useManualSync();

  const syncStatus = getSyncStatus();

  const handleUploadSync = async () => {
    clearSyncError();
    const result = await forceUploadSync();
    if (result.success) {
      console.log("✅ Upload sync completed:", result.message);
    } else {
      console.error("❌ Upload sync failed:", result.error);
    }
  };

  const handleDownloadSync = async () => {
    clearSyncError();
    const result = await forceDownloadSync();
    if (result.success) {
      console.log("✅ Download sync completed:", result.message);
    } else {
      console.error("❌ Download sync failed:", result.error);
    }
  };

  const handleFullSync = async () => {
    clearSyncError();
    const result = await forceFullSync();
    if (result.success) {
      console.log("✅ Full sync completed:", result.message);
    } else {
      console.error("❌ Full sync failed:", result.error);
    }
  };

  const formatLastSyncTime = (time) => {
    if (!time) return "Never";

    const now = new Date();
    const diff = now - time;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return time.toLocaleDateString();
  };

  return (
    <Card className={`w-full max-w-2xl ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Manual Sync Controls
          <Badge variant={syncStatus.isServiceRunning ? "success" : "destructive"}>
            {syncStatus.isServiceRunning ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sync Error Alert */}
        {syncError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {syncError}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-1"
                onClick={clearSyncError}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Sync Status Info */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Last sync: {formatLastSyncTime(lastSyncTime)}</span>
          </div>
          {lastSyncTime && (
            <Badge variant="outline">
              <CheckCircle className="h-3 w-3 mr-1" />
              Synced
            </Badge>
          )}
        </div>

        {/* Sync Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Upload Sync */}
          <Button
            onClick={handleUploadSync}
            disabled={isSyncInProgress || !syncStatus.isServiceRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isUploadingSyncInProgress ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Changes
          </Button>

          {/* Download Sync */}
          <Button
            onClick={handleDownloadSync}
            disabled={isSyncInProgress || !syncStatus.isServiceRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isDownloadingSyncInProgress ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download Changes
          </Button>

          {/* Full Sync */}
          <Button
            onClick={handleFullSync}
            disabled={isSyncInProgress || !syncStatus.isServiceRunning}
            variant="default"
            className="flex items-center gap-2"
          >
            {isSyncInProgress ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Full Sync
          </Button>
        </div>

        {/* Sync Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Upload Changes:</strong> Send your local changes to the cloud for family members
            to see
          </p>
          <p>
            <strong>Download Changes:</strong> Get the latest changes made by family members
          </p>
          <p>
            <strong>Full Sync:</strong> Automatically determine the best sync direction based on
            data freshness
          </p>
        </div>

        {/* Service Status Details */}
        {syncStatus.serviceStatus && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">Advanced Status</summary>
            <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
              <pre>{JSON.stringify(syncStatus.serviceStatus, null, 2)}</pre>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

export default ManualSyncControls;
