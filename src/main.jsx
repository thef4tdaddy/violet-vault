import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { initHighlight } from "./utils/common/highlight.js";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./utils/common/queryClient";

// Initialize Firebase at app startup
import "./utils/sync/chunkedFirebaseSync.js";

// Expose diagnostic tools for debugging
import { runDataDiagnostic } from "./utils/common/dataDiagnostic.js";
import { runSyncDiagnostic } from "./utils/sync/syncDiagnostic.js";
import { fixMetadata } from "./utils/common/fixMetadata.js";
import { runImmediateSyncHealthCheck } from "./utils/sync/syncHealthChecker.js";
import syncEdgeCaseTester from "./utils/sync/syncEdgeCaseTester.js";
import { validateAllSyncFlows } from "./utils/sync/syncFlowValidator.js";
import {
  runMasterSyncValidation,
  getQuickSyncStatus,
} from "./utils/sync/masterSyncValidator.js";
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
}

initHighlight();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
