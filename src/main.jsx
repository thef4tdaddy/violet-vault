import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { initHighlight } from "./utils/highlight.js";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./utils/queryClient";

// Initialize Firebase at app startup
import "./utils/chunkedFirebaseSync.js";

// Expose diagnostic tools for debugging
import { runDataDiagnostic } from "./utils/dataDiagnostic.js";
import { runSyncDiagnostic } from "./utils/syncDiagnostic.js";
import { fixMetadata } from "./utils/fixMetadata.js";
import { runImmediateSyncHealthCheck } from "./utils/syncHealthChecker.js";
import syncEdgeCaseTester from "./utils/syncEdgeCaseTester.js";
import { validateAllSyncFlows } from "./utils/syncFlowValidator.js";
import { runMasterSyncValidation, getQuickSyncStatus } from "./utils/masterSyncValidator.js";

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
}

initHighlight();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
