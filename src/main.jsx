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

if (
  typeof window !== "undefined" &&
  (import.meta.env.MODE === "development" ||
    window.location.hostname.includes("f4tdaddy.com") ||
    window.location.hostname.includes("vercel.app"))
) {
  window.dataDiagnostic = runDataDiagnostic;
  window.syncDiagnostic = runSyncDiagnostic;
  window.fixMetadata = fixMetadata;
}

initHighlight();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
