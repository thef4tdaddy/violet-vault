import { screen, act } from "@/test/test-utils";
import { render as baseRender } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ShareTargetHandler from "../ShareTargetHandler";

// Mock dependencies
const mockNavigate = vi.fn();
const mockOpenImportDashboard = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/stores/ui/importDashboardStore", () => ({
  useImportDashboardStore: vi.fn(),
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ShareTargetHandler", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    const { useImportDashboardStore } = await import("@/stores/ui/importDashboardStore");
    (useImportDashboardStore as any).mockImplementation((selector: any) =>
      selector ? selector({ open: mockOpenImportDashboard }) : { open: mockOpenImportDashboard }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders nothing when no shared data is present", async () => {
    const { container } = baseRender(
      <MemoryRouter initialEntries={["/app/dashboard"]}>
        <ShareTargetHandler />
      </MemoryRouter>
    );
    await act(async () => {});
    expect(container.firstChild).toBeNull();
  });

  it("opens import dashboard modal when files are shared", async () => {
    const searchParams = "?title=Receipt&files=true";

    baseRender(
      <MemoryRouter initialEntries={[`/app/import${searchParams}`]}>
        <ShareTargetHandler />
      </MemoryRouter>
    );

    // Flush microtasks
    await act(async () => {});

    // Advance for redirection
    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/app/dashboard");
    expect(mockOpenImportDashboard).toHaveBeenCalled();
  });

  it("navigates to transactions for CSV data", async () => {
    const searchParams = "?title=Transactions&text=csv%20data";

    baseRender(
      <MemoryRouter initialEntries={[`/app/import${searchParams}`]}>
        <ShareTargetHandler />
      </MemoryRouter>
    );

    await act(async () => {});

    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/app/transactions", expect.any(Object));
  });

  it("navigates to settings for bank URLs", async () => {
    const searchParams = "?url=https://mybank.com/transactions";

    baseRender(
      <MemoryRouter initialEntries={[`/app/import${searchParams}`]}>
        <ShareTargetHandler />
      </MemoryRouter>
    );

    await act(async () => {});

    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/app/settings", expect.any(Object));
  });

  it("displays shared data preview", async () => {
    const searchParams = "?title=MyTitle&text=SomeText&url=https://example.com";

    baseRender(
      <MemoryRouter initialEntries={[`/app/import${searchParams}`]}>
        <ShareTargetHandler />
      </MemoryRouter>
    );

    await act(async () => {});

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/SHARED DATA RECEIVED/i);
    expect(screen.getByText(/MyTitle/)).toBeInTheDocument();
  });

  it("displays countdown message", async () => {
    const searchParams = "?text=test";

    baseRender(
      <MemoryRouter initialEntries={[`/app/import${searchParams}`]}>
        <ShareTargetHandler />
      </MemoryRouter>
    );

    await act(async () => {});

    expect(screen.getByText(/Redirecting to the appropriate section/i)).toBeInTheDocument();
  });

  it("passes actual File object to openImportDashboard when available in state", async () => {
    const mockFile = new File(["test data"], "bill.pdf", { type: "application/pdf" });
    const searchParams = "?title=Bill&files=true";

    baseRender(
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

    await act(async () => {});

    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/app/dashboard");
    expect(mockOpenImportDashboard).toHaveBeenCalledWith({ preloadFile: mockFile });
  });
});
