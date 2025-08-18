import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { initHighlight } from "./utils/highlight.js";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./utils/queryClient";

// Expose diagnostic tools for debugging
if (
  typeof window !== "undefined" &&
  (import.meta.env.MODE === "development" ||
    window.location.hostname.includes("f4tdaddy.com") ||
    window.location.hostname.includes("vercel.app"))
) {
  import("./utils/dataDiagnostic.js").then(({ runDataDiagnostic }) => {
    window.dataDiagnostic = runDataDiagnostic;
  });
  import("./utils/syncDiagnostic.js").then(({ runSyncDiagnostic }) => {
    window.syncDiagnostic = runSyncDiagnostic;
  });
  import("./utils/fixMetadata.js").then(({ fixMetadata }) => {
    window.fixMetadata = fixMetadata;
  });
}

initHighlight();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
