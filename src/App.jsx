import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/common/queryClient";
import MainLayout from "./components/layout/MainLayout";
import { cloudSyncService } from "./services/cloudSyncService";
import BugReportButton from "./components/feedback/BugReportButton";
import ConfirmProvider from "./components/ui/ConfirmProvider";
import PromptProvider from "./components/ui/PromptProvider";

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <div className="font-sans">
        <MainLayout firebaseSync={cloudSyncService} />
        <BugReportButton />
        <ConfirmProvider />
        <PromptProvider />
      </div>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
