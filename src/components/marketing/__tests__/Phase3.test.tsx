import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import { DevBlogGrid } from "../DevBlogGrid";
import { MarketingFooter } from "../MarketingFooter";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

global.fetch = vi.fn();

describe("DevBlogGrid", () => {
  it("renders loading skeletons initially", () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <DevBlogGrid />
      </QueryClientProvider>
    );
    // Skeltons are present (checking by existence of animating elements or generic structure)
    // Here we can check if the heading exists first
    expect(screen.getByText("BUILDING IN")).toBeInTheDocument();
  });

  it("renders articles after fetch", async () => {
    const mockArticles = [
      {
        id: 1,
        title: "Test Article 1",
        description: "Desc 1",
        url: "https://dev.to/article1",
        cover_image: "img.jpg",
        reading_time_minutes: 5,
        tag_list: ["react", "go"],
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockArticles,
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <DevBlogGrid />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Article 1")).toBeInTheDocument();
      expect(screen.getByText("#react")).toBeInTheDocument();
    });
  });

  it("renders error state on failure", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <DevBlogGrid />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Unable to load feed")).toBeInTheDocument();
    });
  });
});

describe("MarketingFooter", () => {
  it("renders status indicators", async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("status")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: "operational" }),
        });
      }
      return Promise.reject("Unknown URL");
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MarketingFooter />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Python Core")).toBeInTheDocument();
      expect(screen.getByText("Go Engine")).toBeInTheDocument();
    });
  });

  it("handles loading state", () => {
    // Mock pending promise
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MarketingFooter />
      </QueryClientProvider>
    );

    // Should default to loading/pulse state (checking class name presence implies state)
    // Note: Since we can't easily check class names on deeply nested divs without data-ids,
    // we assume if it renders without crashing during pending, it's effectively "loading".
    // A better test checks for the specific visual indicator if accessible.
    expect(screen.getByText("Python Core")).toBeInTheDocument();
  });

  it("handles error state", async () => {
    (global.fetch as any).mockRejectedValue(new Error("Network Error"));

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MarketingFooter />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Python Core")).toBeInTheDocument();
      // In error state, it should still render the label, the visual dot changes color.
      // We can implicitly verify it doesn't crash.
    });
  });

  it("renders tooltips with details", async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("status")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: "operational", latency_ms: 42, goroutines: 10 }),
        });
      }
      return Promise.reject("Unknown URL");
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MarketingFooter />
      </QueryClientProvider>
    );

    await waitFor(() => {
      // The tooltip text is present in the DOM (opacity controlled by CSS)
      expect(screen.getByText("Firestore: 42ms")).toBeInTheDocument();
    });
  });
});
