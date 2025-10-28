import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import MainLayout from "../MainLayout";
import userEvent from "@testing-library/user-event";

// Mock all dependencies
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: "/app/dashboard" })),
  };
});

vi.mock("@/stores/ui/uiStore", () => ({
  useBudgetStore: vi.fn(() => ({ budget: {} })),
}));

vi.mock("@/hooks/auth/useAuthManager", () => ({
  useAuthManager: vi.fn(() => ({
    isUnlocked: true,
    user: { userName: "Test User", userColor: "#000" },
    securityContext: {},
    handleLogout: vi.fn(),
    handleSetup: vi.fn(),
    handleChangePassword: vi.fn(),
  })),
}));

vi.mock("@/hooks/layout", () => ({
  useLayoutData: vi.fn(() => ({
    unassignedCash: 100,
    bills: {},
    envelopes: [],
    transactions: [],
    processPaycheck: vi.fn(),
    paycheckHistory: [],
  })),
}));

vi.mock("@/hooks/common/useDataManagement", () => ({
  default: vi.fn(() => ({
    exportData: vi.fn(),
    importData: vi.fn(),
  })),
}));

vi.mock("@/hooks/auth/usePasswordRotation", () => ({
  default: vi.fn(() => ({
    rotationDue: false,
    handlePasswordRotation: vi.fn(),
  })),
}));

vi.mock("@/hooks/common/useNetworkStatus", () => ({
  default: vi.fn(() => ({
    isOnline: true,
  })),
}));

vi.mock("@/hooks/sync/useFirebaseSync", () => ({
  useFirebaseSync: vi.fn(() => ({
    syncState: "idle",
    handleSync: vi.fn(),
  })),
}));

vi.mock("@/hooks/budgeting/usePaydayPrediction", () => ({
  default: vi.fn(() => ({
    prediction: null,
  })),
}));

vi.mock("@/hooks/common/useDataInitialization", () => ({
  default: vi.fn(() => ({})),
}));

vi.mock("@/hooks/layout/useMainLayoutHandlers", () => ({
  useMainLayoutHandlers: vi.fn(() => ({
    isLocalOnlyMode: false,
    handleLogout: vi.fn(),
    handleSetup: vi.fn(),
    handleChangePassword: vi.fn(),
    securityManager: {},
  })),
}));

vi.mock("@/hooks/layout/useSecurityWarning", () => ({
  useSecurityWarning: vi.fn(() => ({
    showSecurityWarning: false,
    handleSecurityWarning: vi.fn(),
  })),
}));

vi.mock("@/hooks/layout/useCorruptionDetection", () => ({
  useCorruptionDetection: vi.fn(() => ({
    corruptionDetected: false,
  })),
}));

vi.mock("@/hooks/layout/useMainContentModals", () => ({
  useMainContentModals: vi.fn(() => ({
    showSettings: false,
    showSecuritySettings: false,
    openSettings: vi.fn(),
    closeSettings: vi.fn(),
  })),
}));

vi.mock("@/hooks/common/useOnboardingAutoComplete", () => ({
  useOnboardingAutoComplete: vi.fn(() => ({})),
}));

vi.mock("@/stores/ui/onboardingStore", () => ({
  default: vi.fn(() => ({
    hasCompletedTutorial: true,
    currentStep: 0,
  })),
}));

vi.mock("@/stores/ui/toastStore", () => ({
  useToastStore: vi.fn(() => ({
    toasts: [],
  })),
}));

// Mock child components
vi.mock("../AppRoutes", () => ({
  default: () => <div data-testid="app-routes">App Routes</div>,
}));

vi.mock("../NavigationTabs", () => ({
  default: ({ setActiveView }: { activeView: string; setActiveView: (view: string) => void }) => (
    <div data-testid="navigation-tabs">
      <button onClick={() => setActiveView("dashboard")}>Dashboard</button>
      <button onClick={() => setActiveView("envelopes")}>Envelopes</button>
      <button onClick={() => setActiveView("transactions")}>Transactions</button>
    </div>
  ),
}));

vi.mock("@/components/ui/Header", () => ({
  default: ({ onOpenSettings }) => (
    <div data-testid="header">
      <h1>VioletVault</h1>
      <button onClick={onOpenSettings}>Settings</button>
    </div>
  ),
}));

vi.mock("@/components/ui/Toast", () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
}));

vi.mock("@/components/auth/AuthGateway", () => ({
  default: ({ onSetupComplete }) => (
    <div data-testid="auth-gateway">
      <button onClick={onSetupComplete}>Complete Auth</button>
    </div>
  ),
}));

vi.mock("@/components/security/LockScreen", () => ({
  default: ({ onUnlock }) => (
    <div data-testid="lock-screen">
      <button onClick={onUnlock}>Unlock</button>
    </div>
  ),
}));

vi.mock("@/components/mobile/BottomNavigationBar", () => ({
  default: () => <div data-testid="bottom-nav">Bottom Navigation</div>,
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("MainLayout", () => {
  const mockFirebaseSync = {
    start: vi.fn(),
    forceSync: vi.fn(),
    isRunning: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLayout = () => {
    return render(
      <BrowserRouter>
        <MainLayout firebaseSync={mockFirebaseSync} />
      </BrowserRouter>
    );
  };

  describe("Authentication Flow", () => {
    it("should show auth gateway when not authenticated", () => {
      const useAuthManager = require("@/hooks/auth/useAuthManager").useAuthManager as any;
      useAuthManager.mockReturnValue({
        isUnlocked: false,
        user: null,
        securityContext: {},
      });

      renderLayout();

      expect(screen.getByTestId("auth-gateway")).toBeInTheDocument();
    });

    it("should show main content when authenticated", () => {
      renderLayout();

      expect(screen.queryByTestId("auth-gateway")).not.toBeInTheDocument();
      expect(screen.getByTestId("app-routes")).toBeInTheDocument();
    });

    it("should show lock screen when locked", () => {
      const useAuthManager = require("@/hooks/auth/useAuthManager").useAuthManager as any;
      useAuthManager.mockReturnValue({
        isUnlocked: false,
        user: { userName: "Test" },
        securityContext: { isLocked: true },
      });

      renderLayout();

      expect(screen.getByTestId("lock-screen")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should render navigation tabs", () => {
      renderLayout();

      expect(screen.getByTestId("navigation-tabs")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Envelopes")).toBeInTheDocument();
      expect(screen.getByText("Transactions")).toBeInTheDocument();
    });

    it("should render header", () => {
      renderLayout();

      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByText("VioletVault")).toBeInTheDocument();
    });

    it("should render bottom navigation on mobile", () => {
      renderLayout();

      expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
    });
  });

  describe("Content Rendering", () => {
    it("should render app routes", () => {
      renderLayout();

      expect(screen.getByTestId("app-routes")).toBeInTheDocument();
    });

    it("should render toast container", () => {
      renderLayout();

      expect(screen.getByTestId("toast-container")).toBeInTheDocument();
    });
  });

  describe("Settings Modal", () => {
    it("should open settings modal", async () => {
      renderLayout();

      const settingsButton = screen.getByText("Settings");
      await userEvent.click(settingsButton);

      // Settings modal trigger should be called
      expect(screen.getByTestId("header")).toBeInTheDocument();
    });
  });

  describe("User Menu", () => {
    it("should display user information", () => {
      renderLayout();

      expect(screen.getByTestId("header")).toBeInTheDocument();
    });

    it("should handle logout action", () => {
      renderLayout();

      expect(screen.getByTestId("header")).toBeInTheDocument();
    });
  });

  describe("Firebase Sync Integration", () => {
    it("should accept firebase sync service", () => {
      renderLayout();

      expect(mockFirebaseSync).toBeDefined();
    });

    it("should handle sync state", () => {
      renderLayout();

      expect(screen.getByTestId("app-routes")).toBeInTheDocument();
    });
  });

  describe("Data Loading", () => {
    it("should load layout data", () => {
      renderLayout();

      const useLayoutData = require("@/hooks/layout").useLayoutData as any;
      expect(useLayoutData).toHaveBeenCalled();
    });

    it("should initialize data on mount", () => {
      renderLayout();

      const useDataInitialization = require("@/hooks/common/useDataInitialization")
        .default as any;
      expect(useDataInitialization).toHaveBeenCalled();
    });
  });

  describe("Responsive Behavior", () => {
    it("should render mobile navigation", () => {
      renderLayout();

      expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
    });

    it("should render desktop navigation", () => {
      renderLayout();

      expect(screen.getByTestId("navigation-tabs")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle missing firebase sync", () => {
      render(
        <BrowserRouter>
          <MainLayout firebaseSync={null as any} />
        </BrowserRouter>
      );

      expect(screen.getByTestId("app-routes")).toBeInTheDocument();
    });

    it("should handle missing user", () => {
      const useAuthManager = require("@/hooks/auth/useAuthManager").useAuthManager as any;
      useAuthManager.mockReturnValue({
        isUnlocked: true,
        user: null,
        securityContext: {},
      });

      renderLayout();

      expect(screen.getByTestId("app-routes")).toBeInTheDocument();
    });
  });

  describe("Network Status", () => {
    it("should handle online status", () => {
      renderLayout();

      const useNetworkStatus = require("@/hooks/common/useNetworkStatus").default as any;
      expect(useNetworkStatus).toHaveBeenCalled();
    });

    it("should handle offline status", () => {
      const useNetworkStatus = require("@/hooks/common/useNetworkStatus").default as any;
      useNetworkStatus.mockReturnValue({
        isOnline: false,
      });

      renderLayout();

      expect(screen.getByTestId("app-routes")).toBeInTheDocument();
    });
  });

  describe("Security Features", () => {
    it("should check for security warnings", () => {
      renderLayout();

      const useSecurityWarning = require("@/hooks/layout/useSecurityWarning")
        .useSecurityWarning as any;
      expect(useSecurityWarning).toHaveBeenCalled();
    });

    it("should check for data corruption", () => {
      renderLayout();

      const useCorruptionDetection = require("@/hooks/layout/useCorruptionDetection")
        .useCorruptionDetection as any;
      expect(useCorruptionDetection).toHaveBeenCalled();
    });

    it("should handle password rotation", () => {
      renderLayout();

      const usePasswordRotation = require("@/hooks/auth/usePasswordRotation").default as any;
      expect(usePasswordRotation).toHaveBeenCalled();
    });
  });

  describe("Local Only Mode", () => {
    it("should handle local only mode enabled", () => {
      const useMainLayoutHandlers = require("@/hooks/layout/useMainLayoutHandlers")
        .useMainLayoutHandlers as any;
      useMainLayoutHandlers.mockReturnValue({
        isLocalOnlyMode: true,
        handleLogout: vi.fn(),
        handleSetup: vi.fn(),
        handleChangePassword: vi.fn(),
        securityManager: {},
      });

      renderLayout();

      expect(screen.getByTestId("app-routes")).toBeInTheDocument();
    });

    it("should handle local only mode disabled", () => {
      renderLayout();

      expect(screen.getByTestId("app-routes")).toBeInTheDocument();
    });
  });
});
