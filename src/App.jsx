import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/queryClient";
import MainLayout from "./components/layout/MainLayout";
import { cloudSyncService } from "./services/cloudSyncService";
import BugReportButton from "./components/feedback/BugReportButton";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <div className="font-sans">
      <MainLayout firebaseSync={cloudSyncService} />
      <BugReportButton />
    </div>
  </QueryClientProvider>
);

export default App;
