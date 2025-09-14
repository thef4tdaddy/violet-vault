import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/common/queryClient";
import MainLayout from "./components/layout/MainLayout";
import { cloudSyncService } from "./services/cloudSyncService";
import BugReportButton from "./components/feedback/BugReportButton";
import ConfirmProvider from "./components/ui/ConfirmProvider";
import PromptProvider from "./components/ui/PromptProvider";

// Lazy load monitoring to reduce main bundle size
const HighlightLoader = React.lazy(() => import("./components/monitoring/HighlightLoader"));

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <div className="font-sans">
        <MainLayout firebaseSync={cloudSyncService} />
        <BugReportButton />
        <ConfirmProvider />
        <PromptProvider />
        {/* Load monitoring system after main app renders */}
        <Suspense fallback={null}>
          <HighlightLoader />
        </Suspense>
      </div>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
