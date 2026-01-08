import { render, screen, waitFor } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import React from "react";
import MainLayout from "../MainLayout";
import { QueryClient } from "@tanstack/react-query";

// ============================================================================
// Standardized Mocking Strategy: Use @/ Aliases for EVERYTHING
// Vitest's resolver handles these most reliably regardless of directory depth.
// ============================================================================

// 1. Hook Mock Results (Defined once for reference stability)
const MOCK_AUTH = {
  isUnlocked: true,
  isAuthenticated: true,
  shouldShowAuthGateway: () => false,
  user: { userName: "Standard User", userColor: "#6B21A8" },
  securityContext: { budgetId: "test-budget", encryptionKey: "test-key" as any },
  handleLogout: vi.fn(),
  handleSetup: vi.fn(),
  handleChangePassword: vi.fn(),
  updateUser: vi.fn(),
  securityManager: { lockApp: vi.fn(), logEvent: vi.fn() },
};

const MOCK_LAYOUT_DATA = {
  unassignedCash: 100,
  bills: {},
  envelopes: [],
  transactions: [],
  processPaycheck: vi.fn(),
  paycheckHistory: [],
  isLoading: false,
  budget: {},
  totalBiweeklyNeed: 0,
};

const MOCK_LAYOUT_HANDLERS = {
  isLocalOnlyMode: false,
  handleLogout: vi.fn(),
  handleSetup: vi.fn(),
  handleChangePassword: vi.fn(),
  securityManager: MOCK_AUTH.securityManager,
};

const MOCK_CONTENT_MODALS = {
  settings: { open: vi.fn(), close: vi.fn(), isOpen: false },
  security: { open: vi.fn(), close: vi.fn(), isOpen: false },
};

vi.mock("@/hooks/auth/useAuth", () => ({
  useAuth: vi.fn(() => MOCK_AUTH),
}));

vi.mock("@/hooks/layout", () => ({
  useLayoutData: vi.fn(() => MOCK_LAYOUT_DATA),
}));

vi.mock("@/hooks/layout/useMainLayoutHandlers", () => ({
  useMainLayoutHandlers: vi.fn(() => MOCK_LAYOUT_HANDLERS),
}));

vi.mock("@/hooks/layout/useMainContentModals", () => ({
  useMainContentModals: vi.fn(() => MOCK_CONTENT_MODALS),
}));

// 2. Component Mocks (Use @/ aliases for EVERYTHING)
// We use the @/ alias even if the source uses ./ so that Vitest matches the resolved path.
vi.mock("@/components/layout/NavigationTabs", () => ({
  default: () => <div data-testid="navigation-tabs">Nav Tabs</div>,
}));

vi.mock("@/components/layout/SummaryCards", () => ({
  default: () => <div data-testid="summary-cards">Summary Cards</div>,
}));

vi.mock("@/components/layout/AppRoutes", () => ({
  default: () => <div data-testid="app-routes">App Routes</div>,
}));

vi.mock("@/components/ui/Header", () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock("@/components/ui/Toast", () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
}));

vi.mock("@/components/auth/AuthGateway", () => ({
  default: () => <div data-testid="auth-gateway">Auth Gateway</div>,
}));

vi.mock("@/components/security/LockScreen", () => ({
  default: () => <div data-testid="lock-screen">Lock Screen</div>,
}));

vi.mock("@/components/mobile/BottomNavigationBar", () => ({
  default: () => <div data-testid="bottom-nav">Bottom Nav</div>,
}));

vi.mock("@/components/sync/SyncStatusIndicators", () => ({
  default: () => <div data-testid="sync-indicators" />,
}));

vi.mock("@/components/sync/ConflictResolutionModal", () => ({
  default: () => null,
}));

vi.mock("@/components/feedback/BugReportButton", () => ({
  default: () => null,
}));

vi.mock("@/components/settings/SecuritySettings", () => ({
  default: () => null,
}));

vi.mock("@/components/settings/SettingsDashboard", () => ({
  default: () => null,
}));

vi.mock("@/components/onboarding/OnboardingTutorial", () => ({
  default: ({ children }: any) => <div data-testid="onboarding-tutorial">{children}</div>,
}));

vi.mock("@/components/onboarding/OnboardingProgress", () => ({
  default: () => <div data-testid="onboarding-progress" />,
}));

vi.mock("@/components/modals/CorruptionRecoveryModal", () => ({
  CorruptionRecoveryModal: () => null,
}));

vi.mock("@/components/auth/PasswordRotationModal", () => ({
  default: () => null,
}));

vi.mock("@/components/security/LocalDataSecurityWarning", () => ({
  default: () => null,
}));

vi.mock("@/components/mobile/GlobalPullToRefresh", () => ({
  GlobalPullToRefreshProvider: ({ children }: any) => <>{children}</>,
}));

// 3. Utils & Fallbacks
vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    auth: vi.fn(),
    budgetSync: vi.fn(),
  },
}));
vi.mock("@/stores/ui/onboardingStore", () => ({
  default: vi.fn(() => ({ hasCompletedTutorial: true, currentStep: 0, isOnboarded: true })),
}));
vi.mock("@/hooks/common/useDataManagement", () => ({
  default: vi.fn(() => ({
    exportData: vi.fn(),
    importData: vi.fn(),
    resetEncryptionAndStartFresh: vi.fn(),
  })),
}));
vi.mock("@/hooks/auth/usePasswordRotation", () => ({
  default: vi.fn(() => ({
    rotationDue: false,
    showRotationModal: false,
    dismissRotation: vi.fn(),
    handlePasswordRotation: vi.fn(),
  })),
}));
vi.mock("@/hooks/sync/useFirebaseSync", () => ({
  useFirebaseSync: vi.fn(() => ({ syncState: "idle", handleSync: vi.fn() })),
}));
vi.mock("@/hooks/common/useNetworkStatus", () => ({ default: vi.fn(() => ({ isOnline: true })) }));
vi.mock("@/hooks/budgeting/usePaydayPrediction", () => ({
  default: vi.fn(() => ({ prediction: null })),
}));
vi.mock("@/hooks/common/useDataInitialization", () => ({ default: vi.fn(() => ({})) }));
vi.mock("@/hooks/layout/useSecurityWarning", () => ({
  useSecurityWarning: vi.fn(() => ({ showSecurityWarning: false })),
}));
vi.mock("@/hooks/layout/useCorruptionDetection", () => ({
  useCorruptionDetection: vi.fn(() => ({ corruptionDetected: false })),
}));
vi.mock("@/hooks/common/useOnboardingAutoComplete", () => ({
  useOnboardingAutoComplete: vi.fn(() => ({})),
}));
vi.mock("@/stores/ui/toastStore", () => ({ useToastStore: vi.fn(() => ({ toasts: [] })) }));
vi.mock("@/stores/ui/uiStore", () => {
  const mockStore = vi.fn(() => ({ budget: {} }));
  return {
    default: mockStore,
    useBudgetStore: mockStore,
  };
});

// ============================================================================
// Test Suite
// ============================================================================

import { useAuth } from "@/hooks/auth/useAuth";

describe("MainLayout (Full Alias Standardization)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();
  });

  const mockFirebaseSync = {
    start: vi.fn(),
    forceSync: vi.fn(),
    isRunning: false,
  };

  const renderLayout = () => {
    return render(<MainLayout firebaseSync={mockFirebaseSync} />, { queryClient });
  };

  it("should render main shell components successfully via aliased mocks", async () => {
    renderLayout();

    expect(await screen.findByTestId("header")).toBeInTheDocument();
    expect(await screen.findByTestId("navigation-tabs")).toBeInTheDocument();
    expect(await screen.findByTestId("app-routes")).toBeInTheDocument();
    expect(screen.queryByTestId("auth-gateway")).not.toBeInTheDocument();
  });

  it("should show AuthGateway when shouldShowAuthGateway returns true", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      shouldShowAuthGateway: () => true,
    } as any);

    renderLayout();
    expect(await screen.findByTestId("auth-gateway")).toBeInTheDocument();
  });

  it("should show LockScreen when isUnlocked is false", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isUnlocked: false,
      shouldShowAuthGateway: () => false,
    } as any);

    renderLayout();
    expect(await screen.findByTestId("lock-screen")).toBeInTheDocument();
  });
});
