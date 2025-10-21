import React, { Suspense, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/common/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import { cloudSyncService } from "./services/cloudSyncService";
import BugReportButton from "./components/feedback/BugReportButton";
import ConfirmProvider from "./components/ui/ConfirmProvider";
import PromptProvider from "./components/ui/PromptProvider";
import UpdateAvailableModal from "./components/pwa/UpdateAvailableModal";
import InstallPromptModal from "./components/pwa/InstallPromptModal";
import PatchNotesModal from "./components/pwa/PatchNotesModal";
import OfflineStatusIndicator from "./components/pwa/OfflineStatusIndicator";
import pwaManager from "./utils/pwa/pwaManager";
import useUiStore from "./stores/ui/uiStore";
import { initializeTouchFeedback } from "./utils/ui/touchFeedback";
import { initializeStoreRegistry } from "./utils/stores/storeRegistry";

// Lazy load monitoring to reduce main bundle size
const HighlightLoader = React.lazy(() => import("./components/monitoring/HighlightLoader"));

const App = () => {
  // Initialize PWA manager, touch feedback, and store registry
  useEffect(() => {
    const initializePWA = async () => {
      // Pass the actual store, not just state data
      await pwaManager.initialize(useUiStore);
    };

    initializePWA();

    // Initialize haptic feedback for mobile interactions
    initializeTouchFeedback();

    // Initialize store registry dev helpers (must be after component mount to avoid React Error #185)
    initializeStoreRegistry();
  }, []); // Empty deps - only initialize once

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="font-sans">
            <MainLayout firebaseSync={cloudSyncService} />
            <BugReportButton />
            <ConfirmProvider />
            <PromptProvider />

            {/* PWA Modals */}
            <UpdateAvailableModal />
            <InstallPromptModal />
            <PatchNotesModal />

            {/* PWA Status Indicators */}
            <OfflineStatusIndicator />

            {/* Load monitoring system after main app renders */}
            <Suspense fallback={null}>
              <HighlightLoader />
            </Suspense>
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
