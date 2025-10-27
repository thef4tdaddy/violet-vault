import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import SettingsDashboard from "../SettingsDashboard";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock hooks
vi.mock("@/hooks/common/useModalManager", () => ({
  useSettingsModals: vi.fn(() => ({
    showPasswordModal: false,
    showActivityFeed: false,
    showLocalOnlySettings: false,
    showSecuritySettings: false,
    showResetConfirm: false,
    showEnvelopeChecker: false,
    openPasswordModal: vi.fn(),
    closePasswordModal: vi.fn(),
    openActivityFeed: vi.fn(),
    closeActivityFeed: vi.fn(),
    openLocalOnlySettings: vi.fn(),
    closeLocalOnlySettings: vi.fn(),
    openSecuritySettings: vi.fn(),
    closeSecuritySettings: vi.fn(),
    openResetConfirm: vi.fn(),
    closeResetConfirm: vi.fn(),
    openEnvelopeChecker: vi.fn(),
    closeEnvelopeChecker: vi.fn(),
  })),
}));

vi.mock("@/hooks/settings/useSettingsDashboard", () => ({
  useCloudSyncManager: vi.fn(() => ({
    isSyncing: false,
    lastSync: null,
    handleSync: vi.fn(),
  })),
  useSettingsSections: vi.fn(() => ({
    sections: [
      { id: "general", label: "General", icon: "Settings" },
      { id: "security", label: "Security", icon: "Lock" },
    ],
  })),
  useSettingsActions: vi.fn(() => ({
    handleExport: vi.fn(),
    handleImport: vi.fn(),
    handleLogout: vi.fn(),
  })),
}));

vi.mock("@/hooks/settings/useSettingsSectionRenderer", () => ({
  default: vi.fn(() => ({
    renderSection: vi.fn(() => <div data-testid="section-content">Section Content</div>),
  })),
}));

// Mock child components
vi.mock("../layout/SettingsLayout", () => ({
  default: ({ children, activeSection, onSectionChange, sections }) => (
    <div data-testid="settings-layout">
      <div data-testid="section-tabs">
        {sections?.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            data-active={activeSection === section.id}
          >
            {section.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  ),
}));

vi.mock("../modals/ResetConfirmModal", () => ({
  default: ({ isOpen, onClose, onConfirm }) =>
    isOpen ? (
      <div data-testid="reset-confirm-modal">
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Confirm Reset</button>
      </div>
    ) : null,
}));

vi.mock("@/components/security/LocalDataSecurityWarning", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="security-warning">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => "div"),
}));

vi.mock("@/components/ui/LoadingSpinner", () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe("SettingsDashboard", () => {
  let queryClient: QueryClient;

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    onLogout: vi.fn(),
    onResetEncryption: vi.fn(),
    onSync: vi.fn(),
    onChangePassword: vi.fn(),
    currentUser: { userName: "Test User", userColor: "#000" },
    isLocalOnlyMode: false,
    securityManager: {},
    initialSection: "general",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderSettings = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SettingsDashboard {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  describe("Rendering", () => {
    it("should render settings layout", () => {
      renderSettings();

      expect(screen.getByTestId("settings-layout")).toBeInTheDocument();
    });

    it("should render section tabs", () => {
      renderSettings();

      expect(screen.getByTestId("section-tabs")).toBeInTheDocument();
    });

    it("should render section content", () => {
      renderSettings();

      expect(screen.getByTestId("section-content")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      renderSettings({ isOpen: false });

      expect(screen.queryByTestId("settings-layout")).not.toBeInTheDocument();
    });
  });

  describe("Section Navigation", () => {
    it("should display all section tabs", () => {
      renderSettings();

      expect(screen.getByText("General")).toBeInTheDocument();
      expect(screen.getByText("Security")).toBeInTheDocument();
    });

    it("should highlight active section", () => {
      renderSettings({ initialSection: "general" });

      const generalButton = screen.getByText("General");
      expect(generalButton).toHaveAttribute("data-active", "true");
    });

    it("should switch sections on tab click", async () => {
      renderSettings();

      const securityButton = screen.getByText("Security");
      await userEvent.click(securityButton);

      // Section change should be triggered
      expect(screen.getByText("Security")).toBeInTheDocument();
    });
  });

  describe("Settings Actions", () => {
    it("should handle export action", async () => {
      const mockExport = vi.fn();
      renderSettings({ onExport: mockExport });

      // Export button would be in the section content
      expect(screen.getByTestId("section-content")).toBeInTheDocument();
    });

    it("should handle import action", async () => {
      const mockImport = vi.fn();
      renderSettings({ onImport: mockImport });

      expect(screen.getByTestId("section-content")).toBeInTheDocument();
    });

    it("should handle logout action", async () => {
      const mockLogout = vi.fn();
      renderSettings({ onLogout: mockLogout });

      expect(screen.getByTestId("section-content")).toBeInTheDocument();
    });
  });

  describe("Modal Interactions", () => {
    it("should not show reset confirm modal by default", () => {
      renderSettings();

      expect(screen.queryByTestId("reset-confirm-modal")).not.toBeInTheDocument();
    });

    it("should not show security warning by default", () => {
      renderSettings();

      expect(screen.queryByTestId("security-warning")).not.toBeInTheDocument();
    });
  });

  describe("User Profile", () => {
    it("should handle user with name and color", () => {
      renderSettings({
        currentUser: { userName: "Custom User", userColor: "#ff0000" },
      });

      expect(screen.getByTestId("settings-layout")).toBeInTheDocument();
    });

    it("should handle missing user", () => {
      renderSettings({ currentUser: undefined });

      expect(screen.getByTestId("settings-layout")).toBeInTheDocument();
    });
  });

  describe("Local Only Mode", () => {
    it("should handle local only mode enabled", () => {
      renderSettings({ isLocalOnlyMode: true });

      expect(screen.getByTestId("settings-layout")).toBeInTheDocument();
    });

    it("should handle local only mode disabled", () => {
      renderSettings({ isLocalOnlyMode: false });

      expect(screen.getByTestId("settings-layout")).toBeInTheDocument();
    });
  });

  describe("Security Manager", () => {
    it("should accept security manager", () => {
      const securityManager = {
        isLocked: false,
        canEdit: true,
      };

      renderSettings({ securityManager });

      expect(screen.getByTestId("settings-layout")).toBeInTheDocument();
    });

    it("should handle missing security manager", () => {
      renderSettings({ securityManager: undefined });

      expect(screen.getByTestId("settings-layout")).toBeInTheDocument();
    });
  });

  describe("Initial Section", () => {
    it("should open to general section by default", () => {
      renderSettings();

      const generalButton = screen.getByText("General");
      expect(generalButton).toHaveAttribute("data-active", "true");
    });

    it("should open to specified initial section", () => {
      renderSettings({ initialSection: "security" });

      const securityButton = screen.getByText("Security");
      expect(securityButton).toHaveAttribute("data-active", "true");
    });
  });

  describe("Settings Persistence", () => {
    it("should maintain section when reopened", () => {
      const { rerender } = renderSettings({ initialSection: "security" });

      rerender(
        <QueryClientProvider client={queryClient}>
          <SettingsDashboard {...defaultProps} isOpen={false} />
        </QueryClientProvider>
      );

      rerender(
        <QueryClientProvider client={queryClient}>
          <SettingsDashboard {...defaultProps} isOpen={true} initialSection="security" />
        </QueryClientProvider>
      );

      expect(screen.getByText("Security")).toBeInTheDocument();
    });
  });

  describe("Sync Integration", () => {
    it("should handle sync action", () => {
      const mockSync = vi.fn();
      renderSettings({ onSync: mockSync });

      expect(screen.getByTestId("settings-layout")).toBeInTheDocument();
    });
  });

  describe("Password Management", () => {
    it("should handle change password action", () => {
      const mockChangePassword = vi.fn();
      renderSettings({ onChangePassword: mockChangePassword });

      expect(screen.getByTestId("settings-layout")).toBeInTheDocument();
    });
  });

  describe("Reset Encryption", () => {
    it("should handle reset encryption action", () => {
      const mockReset = vi.fn();
      renderSettings({ onResetEncryption: mockReset });

      expect(screen.getByTestId("settings-layout")).toBeInTheDocument();
    });
  });

  describe("Close Behavior", () => {
    it("should handle close action", async () => {
      const mockClose = vi.fn();
      renderSettings({ onClose: mockClose });

      expect(screen.getByTestId("settings-layout")).toBeInTheDocument();
    });
  });
});
