import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DevBlogGrid } from "../DevBlogGrid";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock fetch
global.fetch = vi.fn();

// Setup QueryClient
const createTestClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithClient = (ui: React.ReactElement) => {
  const testClient = createTestClient();
  const { rerender, ...result } = render(
    <QueryClientProvider client={testClient}>{ui}</QueryClientProvider>
  );
  return {
    ...result,
    rerender: (rerenderUi: React.ReactElement) =>
      rerender(<QueryClientProvider client={testClient}>{rerenderUi}</QueryClientProvider>),
  };
};

describe("DevBlogGrid", () => {
  it("renders the section title", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithClient(<DevBlogGrid />);
    expect(screen.getByText(/BUILDING IN/)).toBeInTheDocument();
    expect(screen.getByText(/PUBLIC/)).toBeInTheDocument();
  });

  it("renders skeletons while loading", () => {
    // Mock a pending fetch
    (fetch as any).mockImplementation(() => new Promise(() => {}));

    const { container } = renderWithClient(<DevBlogGrid />);

    // Check for skeletons (presence of animate-pulse)
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(3);
  });

  it("renders articles when loaded", async () => {
    const mockArticles = [
      {
        id: 1,
        title: "Test Article 1",
        description: "Description 1",
        url: "https://dev.to/test/1",
        cover_image: "https://example.com/img1.jpg",
        reading_time_minutes: 5,
        tag_list: ["react", "go"],
      },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockArticles,
    });

    renderWithClient(<DevBlogGrid />);

    await waitFor(() => {
      expect(screen.getByText("Test Article 1")).toBeInTheDocument();
    });
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("5 MIN READ")).toBeInTheDocument();
    expect(screen.getByText("#react")).toBeInTheDocument();
  });

  it("renders error state on fetch failure", async () => {
    (fetch as any).mockRejectedValueOnce(new Error("Failed to fetch"));

    renderWithClient(<DevBlogGrid />);

    await waitFor(() => {
      expect(screen.getByText("Unable to load feed")).toBeInTheDocument();
    });
    expect(screen.getByText("System functionality is unaffected.")).toBeInTheDocument();
  });

  it("sanitizes unsafe URLs", async () => {
    const mockArticles = [
      {
        id: 1,
        title: "Unsafe Link",
        description: "Bad link",
        url: "javascript:alert(1)",
        cover_image: "",
        reading_time_minutes: 1,
        tag_list: [],
      },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockArticles,
    });

    renderWithClient(<DevBlogGrid />);

    await waitFor(() => {
      expect(screen.getByText("Unsafe Link")).toBeInTheDocument();
    });

    const link = screen.getByRole("link", { name: /Unsafe Link/i });
    expect(link).toHaveAttribute("href", "#");
  });
});
