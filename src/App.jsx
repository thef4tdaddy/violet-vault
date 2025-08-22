import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/queryClient";
import MainLayout from "./components/layout/MainLayout";
import { AuthProvider } from "./stores/authStore";
import { ToastProvider } from "./stores/toastStore";
import { cloudSyncService } from "./services/cloudSyncService";
import BugReportButton from "./components/feedback/BugReportButton";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <AuthProvider>
        <div className="font-sans">
          <MainLayout firebaseSync={cloudSyncService} />
          <BugReportButton />
        </div>
      </AuthProvider>
    </ToastProvider>
  </QueryClientProvider>
);

export default App;
