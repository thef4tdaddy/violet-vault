import React, { Suspense, useEffect, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/common/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import { cloudSyncService } from "./services/cloudSyncService";
// import BugReportButton from "./components/feedback/BugReportButton"; // Now in MainLayout
import ConfirmProvider from "./components/ui/ConfirmProvider";
import PromptProvider from "./components/ui/PromptProvider";
import UpdateAvailableModal from "./components/pwa/UpdateAvailableModal";
import InstallPromptModal from "./components/pwa/InstallPromptModal";
import PatchNotesModal from "./components/pwa/PatchNotesModal";
// import OfflineStatusIndicator from "./components/pwa/OfflineStatusIndicator"; // Removed per UX cleanup
import pwaManager, { type PWAManagerUiStore } from "./utils/pwa/pwaManager";
import useUiStore from "./stores/ui/uiStore";
import { initializeTouchFeedback } from "./utils/ui/touchFeedback";
import { initializeStoreRegistry } from "./utils/stores/storeRegistry";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

// Lazy load monitoring to reduce main bundle size
const SentryLoader = React.lazy(() => import("./components/monitoring/SentryLoader"));

const App = () => {
  const uiStoreApiRef = useRef<PWAManagerUiStore | null>(null);

  if (!uiStoreApiRef.current) {
    uiStoreApiRef.current = {
      setUpdateAvailable: (available: boolean) =>
        useUiStore.getState().setUpdateAvailable(available),
      getState: () => {
        const state = useUiStore.getState();
        return {
          setUpdateAvailable: state.setUpdateAvailable,
          setInstallPromptEvent: state.setInstallPromptEvent,
          showInstallModal: state.showInstallModal,
          installPromptEvent: state.installPromptEvent,
          loadPatchNotesForUpdate: async (fromVersion: string, toVersion: string) => {
            await state.loadPatchNotesForUpdate(fromVersion, toVersion);
          },
        };
      },
      hideInstallModal: () => useUiStore.getState().hideInstallModal(),
      get updateAvailable() {
        return useUiStore.getState().updateAvailable;
      },
      get installPromptEvent() {
        return useUiStore.getState().installPromptEvent ?? null;
      },
    };
  }

  // Initialize PWA manager, touch feedback, and store registry
  useEffect(() => {
    const initializePWA = async () => {
      if (uiStoreApiRef.current) {
        await pwaManager.initialize(uiStoreApiRef.current);
      }
    };

    initializePWA();

    // Initialize haptic feedback for mobile interactions
    initializeTouchFeedback();

    // Initialize store registry dev helpers (must be after component mount to avoid React Error #185)
    initializeStoreRegistry();
  }, []); // Empty deps - only initialize once

  return (
    <ErrorBoundary context="App" showReload={true}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <div className="font-sans">
              <ErrorBoundary context="MainLayout">
                <MainLayout
                  firebaseSync={
                    cloudSyncService as unknown as {
                      start: (config: unknown) => void;
                      forceSync: () => Promise<unknown>;
                      isRunning: boolean;
                    }
                  }
                />
              </ErrorBoundary>
              <ConfirmProvider />
              <PromptProvider />

              {/* PWA Modals */}
              <UpdateAvailableModal />
              <InstallPromptModal />
              <PatchNotesModal />

              {/* PWA Status Indicators - Removed per user request for cleaner UI */}
              {/* <OfflineStatusIndicator /> */}

              {/* Load monitoring system after main app renders */}
              <Suspense fallback={null}>
                <SentryLoader />
              </Suspense>
            </div>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
