import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { initHighlight } from "./utils/common/highlight.js";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./utils/common/queryClient";
import { SystemInfoService } from "./services/bugReport/systemInfoService.js";

// Initialize Firebase at app startup
import "./services/chunkedSyncService.js";

// Expose diagnostic tools for debugging
import { runDataDiagnostic } from "./utils/common/dataDiagnostic.js";
import { runSyncDiagnostic } from "./utils/sync/syncDiagnostic.js";
import { fixMetadata } from "./utils/common/fixMetadata.js";
import { runImmediateSyncHealthCheck } from "./utils/sync/syncHealthChecker.js";
import syncEdgeCaseTester from "./utils/sync/syncEdgeCaseTester.js";
import { validateAllSyncFlows } from "./utils/sync/syncFlowValidator.js";
import { runMasterSyncValidation, getQuickSyncStatus } from "./utils/sync/masterSyncValidator.js";
import { fixAutoAllocateUndefined } from "./utils/common/fixAutoAllocateUndefined.js";

if (
  typeof window !== "undefined" &&
  (import.meta.env.MODE === "development" ||
    window.location.hostname.includes("f4tdaddy.com") ||
    window.location.hostname.includes("vercel.app"))
) {
  window.dataDiagnostic = runDataDiagnostic;
  window.syncDiagnostic = runSyncDiagnostic;
  window.fixMetadata = fixMetadata;
  window.runSyncHealthCheck = runImmediateSyncHealthCheck;
  window.runSyncEdgeCaseTests = () => syncEdgeCaseTester.runAllTests();
  window.validateAllSyncFlows = validateAllSyncFlows;
  window.runMasterSyncValidation = runMasterSyncValidation;
  window.getQuickSyncStatus = getQuickSyncStatus;
  window.fixAutoAllocateUndefined = fixAutoAllocateUndefined;

  // Emergency corruption recovery tool
  window.forceCloudDataReset = async () => {
    console.log("🚨 Force clearing all cloud data and re-uploading from local...");
    try {
      const { cloudSyncService } = await import("./services/cloudSyncService.js");
      
      // Stop any ongoing sync
      cloudSyncService.stop();
      console.log("⏸️ Stopped background sync");
      
      // Clear all cloud data completely
      await cloudSyncService.clearAllData();
      console.log("🧹 Cleared all cloud data");
      
      // Force push local data to cloud (bypasses corruption checks)
      const result = await cloudSyncService.forcePushToCloud();
      console.log("🚀 Force pushed local data to cloud:", result);
      
      // Restart sync service
      const { useAuth } = await import("./stores/auth/authStore.jsx");
      const authState = useAuth.getState();
      if (authState.isUnlocked && authState.currentUser && authState.encryptionKey) {
        cloudSyncService.start({
          budgetId: authState.budgetId,
          encryptionKey: authState.encryptionKey,
          currentUser: authState.currentUser,
        });
        console.log("🔄 Restarted sync service");
      }
      
      return { success: true, message: "Cloud data reset completed" };
    } catch (error) {
      console.error("❌ Force reset failed:", error);
      return { success: false, error: error.message };
    }
  };

  // Bug report testing tools
  window.testBugReportCapture = async () => {
    const { SystemInfoService } = await import("./services/bugReport/systemInfoService.js");
    const { ScreenshotService } = await import("./services/bugReport/screenshotService.js");

    console.log("🐛 Testing bug report capture...");

    // Test console log capture
    const errors = SystemInfoService.getRecentErrors();
    console.log("📝 Console logs captured:", errors.consoleLogs?.length || 0);
    console.log("❌ Errors captured:", errors.recentErrors?.length || 0);

    // Test screenshot capture
    try {
      const screenshot = await ScreenshotService.captureScreenshot();
      const info = screenshot ? ScreenshotService.getScreenshotInfo(screenshot) : null;
      console.log("📸 Screenshot capture:", info ? `Success (${info.sizeKB}KB)` : "Failed");
      return {
        success: true,
        errors,
        screenshot: !!screenshot,
        screenshotInfo: info,
      };
    } catch (error) {
      console.log("📸 Screenshot capture failed:", error.message);
      return {
        success: false,
        errors,
        screenshot: false,
        error: error.message,
      };
    }
  };
}

initHighlight();

// Initialize console log and error capture for bug reports
SystemInfoService.initializeErrorCapture();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
