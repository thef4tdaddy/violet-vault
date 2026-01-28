import { render, screen, waitFor } from "@/test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import ShareTargetHandler from "../ShareTargetHandler";

// Mock dependencies
vi.mock("@/stores/ui/importDashboardStore", () => ({
  useImportDashboardStore: vi.fn(),
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
const mockOpenImportDashboard = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ShareTargetHandler", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const { useImportDashboardStore } = await import("@/stores/ui/importDashboardStore");
    (useImportDashboardStore as any).mockImplementation((selector: any) =>
      selector ? selector({ open: mockOpenImportDashboard }) : mockOpenImportDashboard
    );
  });

  it("renders nothing when no shared data is present", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/app/dashboard"]}>
        <ShareTargetHandler />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it("opens import dashboard modal when files are shared", async () => {
    // Simulate share target with files
    const searchParams = "?title=Receipt&files=true";

    render(
      <MemoryRouter initialEntries={[`/app/import${searchParams}`]}>
        <ShareTargetHandler />
      </MemoryRouter>
    );

    // Should show processing initially
    expect(screen.getByText(/Processing Shared Data/i)).toBeInTheDocument();

    // Wait for auto-redirect timeout (3 seconds + 100ms for modal opening)
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/app/dashboard");
      },
      { timeout: 4000 }
    );

    await waitFor(
      () => {
        expect(mockOpenImportDashboard).toHaveBeenCalled();
      },
      { timeout: 4000 }
    );
  });

  it("navigates to transactions for CSV data", async () => {
    const searchParams = "?title=Transactions&text=csv%20data";

    render(
      <MemoryRouter initialEntries={[`/app/import${searchParams}`]}>
        <ShareTargetHandler />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/app/transactions", {
          state: expect.objectContaining({
            importData: expect.any(Object),
            showImport: true,
          }),
        });
      },
      { timeout: 4000 }
    );
  });

  it("navigates to settings for bank URLs", async () => {
    const searchParams = "?url=https://mybank.com/transactions";

    render(
      <MemoryRouter initialEntries={[`/app/import${searchParams}`]}>
        <ShareTargetHandler />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/app/settings", {
          state: expect.objectContaining({
            importUrl: expect.stringContaining("bank"),
          }),
        });
      },
      { timeout: 4000 }
    );
  });

  it("displays shared data preview", async () => {
    const searchParams = "?title=MyTitle&text=SomeText&url=https://example.com";

    render(
      <MemoryRouter initialEntries={[`/app/import${searchParams}`]}>
        <ShareTargetHandler />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("MyTitle")).toBeInTheDocument();
    });

    expect(screen.getByText(/SomeText/)).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/example.com/)).toBeInTheDocument();
  });

  it("displays countdown message", async () => {
    const searchParams = "?text=test";

    render(
      <MemoryRouter initialEntries={[`/app/import${searchParams}`]}>
        <ShareTargetHandler />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Redirecting to the appropriate section in 3 seconds.../i)
      ).toBeInTheDocument();
    });
  });

  it("passes actual File object to openImportDashboard when available in state", async () => {
    const mockFile = new File(["test data"], "bill.pdf", { type: "application/pdf" });
    const searchParams = "?title=Bill&files=true";

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/app/import",
            search: searchParams,
            state: { files: [mockFile] },
          },
        ]}
      >
        <ShareTargetHandler />
      </MemoryRouter>
    );

    // Wait for auto-redirect timeout
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/app/dashboard");
      },
      { timeout: 4000 }
    );

    await waitFor(
      () => {
        expect(mockOpenImportDashboard).toHaveBeenCalledWith({ preloadFile: mockFile });
      },
      { timeout: 4000 }
    );
  });
});
