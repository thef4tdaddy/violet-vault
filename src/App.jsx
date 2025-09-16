import React, { Suspense, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/common/queryClient";
import MainLayout from "./components/layout/MainLayout";
import { cloudSyncService } from "./services/cloudSyncService";
import BugReportButton from "./components/feedback/BugReportButton";
import ConfirmProvider from "./components/ui/ConfirmProvider";
import PromptProvider from "./components/ui/PromptProvider";
import UpdateAvailableModal from "./components/pwa/UpdateAvailableModal";
import InstallPromptModal from "./components/pwa/InstallPromptModal";
import pwaManager from "./utils/pwa/pwaManager";
import useUiStore from "./stores/ui/uiStore";

// Lazy load monitoring to reduce main bundle size
const HighlightLoader = React.lazy(
  () => import("./components/monitoring/HighlightLoader"),
);

const App = () => {
  // Initialize PWA manager
  useEffect(() => {
    const initializePWA = async () => {
      await pwaManager.initialize(useUiStore.getState());
    };

    initializePWA();
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <div className="font-sans">
          <MainLayout firebaseSync={cloudSyncService} />
          <BugReportButton />
          <ConfirmProvider />
          <PromptProvider />

          {/* PWA Modals */}
          <UpdateAvailableModal />
          <InstallPromptModal />

          {/* Load monitoring system after main app renders */}
          <Suspense fallback={null}>
            <HighlightLoader />
          </Suspense>
        </div>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
