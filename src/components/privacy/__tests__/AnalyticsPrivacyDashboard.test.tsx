/**
 * AnalyticsPrivacyDashboard Component Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AnalyticsPrivacyDashboard } from "../AnalyticsPrivacyDashboard";
import { auditTrailService } from "@/services/privacy/auditTrailService";

// Mock fake-indexeddb for testing
import "fake-indexeddb/auto";

// Mock fetch
global.fetch = vi.fn();

describe("AnalyticsPrivacyDashboard", () => {
  beforeEach(async () => {
    await auditTrailService.clearLogs();
    vi.clearAllMocks();
  });

  it("should render the dashboard", async () => {
    render(<AnalyticsPrivacyDashboard />);

    expect(screen.getByText("Analytics Privacy Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Test Connection")).toBeInTheDocument();
    expect(screen.getByText("Show Data Inspector")).toBeInTheDocument();
  });

  it("should show empty state when no logs exist", async () => {
    render(<AnalyticsPrivacyDashboard />);

    await waitFor(() => {
      expect(screen.getByText("No API calls logged yet.")).toBeInTheDocument();
    });
  });

  it("should display audit logs", async () => {
    // Add test logs
    await auditTrailService.logApiCall({
      timestamp: Date.now(),
      endpoint: "/api/analytics/test",
      method: "POST",
      encryptedPayloadSize: 1024,
      responseTimeMs: 50,
      success: true,
      encrypted: true,
    });

    render(<AnalyticsPrivacyDashboard />);

    await waitFor(() => {
      expect(screen.getByText("/api/analytics/test")).toBeInTheDocument();
    });

    expect(screen.getByText("✓ Encrypted")).toBeInTheDocument();
    expect(screen.getByText("50ms")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("should test connection to backend", async () => {
    const mockResponse = {
      status: "healthy",
      version: "2.1.0",
      timestamp: new Date().toISOString(),
      service: "VioletVault Backend",
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<AnalyticsPrivacyDashboard />);

    const testButton = screen.getByText("Test Connection");
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText("Connected")).toBeInTheDocument();
    });

    expect(screen.getByText(/Connected to VioletVault Backend/)).toBeInTheDocument();
  });

  it("should handle connection test failure", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

    render(<AnalyticsPrivacyDashboard />);

    const testButton = screen.getByText("Test Connection");
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText("Connection failed")).toBeInTheDocument();
    });

    expect(screen.getByText(/Connection failed: Network error/)).toBeInTheDocument();
  });

  it("should toggle data inspector", async () => {
    render(<AnalyticsPrivacyDashboard />);

    const toggleButton = screen.getByText("Show Data Inspector");
    expect(screen.queryByText("Data Inspector")).not.toBeInTheDocument();

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText("Data Inspector")).toBeInTheDocument();
    });

    expect(screen.getByText("Hide Data Inspector")).toBeInTheDocument();
  });

  it("should export logs to CSV", async () => {
    // Mock document.createElement and click
    const mockLink = {
      href: "",
      download: "",
      click: vi.fn(),
    };
    vi.spyOn(document, "createElement").mockReturnValue(mockLink as unknown as HTMLAnchorElement);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    // Add test log
    await auditTrailService.logApiCall({
      timestamp: Date.now(),
      endpoint: "/api/test",
      method: "POST",
      encryptedPayloadSize: 100,
      responseTimeMs: 10,
      success: true,
      encrypted: true,
    });

    render(<AnalyticsPrivacyDashboard />);

    await waitFor(() => {
      expect(screen.getByText("/api/test")).toBeInTheDocument();
    });

    const exportButton = screen.getByText("Export CSV");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  it("should clear logs with confirmation", async () => {
    // Mock window.confirm
    vi.spyOn(window, "confirm").mockReturnValue(true);

    // Add test log
    await auditTrailService.logApiCall({
      timestamp: Date.now(),
      endpoint: "/api/test",
      method: "POST",
      encryptedPayloadSize: 100,
      responseTimeMs: 10,
      success: true,
      encrypted: true,
    });

    render(<AnalyticsPrivacyDashboard />);

    await waitFor(() => {
      expect(screen.getByText("/api/test")).toBeInTheDocument();
    });

    const clearButton = screen.getByText("Clear Log");
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText("No API calls logged yet.")).toBeInTheDocument();
    });
  });

  it("should not clear logs if user cancels confirmation", async () => {
    // Mock window.confirm to return false
    vi.spyOn(window, "confirm").mockReturnValue(false);

    // Add test log
    await auditTrailService.logApiCall({
      timestamp: Date.now(),
      endpoint: "/api/test",
      method: "POST",
      encryptedPayloadSize: 100,
      responseTimeMs: 10,
      success: true,
      encrypted: true,
    });

    render(<AnalyticsPrivacyDashboard />);

    await waitFor(() => {
      expect(screen.getByText("/api/test")).toBeInTheDocument();
    });

    const clearButton = screen.getByText("Clear Log");
    fireEvent.click(clearButton);

    // Log should still be there
    expect(screen.getByText("/api/test")).toBeInTheDocument();
  });
});
