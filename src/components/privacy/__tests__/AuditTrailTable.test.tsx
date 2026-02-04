import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuditTrailTable } from "../AuditTrailTable";
import React from "react";

describe("AuditTrailTable", () => {
  const mockLogs = [
    {
      id: "1",
      timestamp: 1672531200000, // 2023-01-01
      endpoint: "/api/test",
      encrypted: true,
      encryptedPayloadSize: 1024,
      responseTimeMs: 50,
      success: true,
    },
    {
      id: "2",
      timestamp: 1672617600000, // 2023-01-02
      endpoint: "/api/error",
      encrypted: false,
      encryptedPayloadSize: 0,
      responseTimeMs: 120,
      success: false,
      errorMessage: "Bad Request",
    },
  ];

  it("renders table headers correctly", () => {
    render(<AuditTrailTable logs={[]} />);
    expect(screen.getByText("Timestamp")).toBeDefined();
    expect(screen.getByText("Endpoint")).toBeDefined();
    expect(screen.getByText("Encrypted")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();
  });

  it("renders log entries correctly", () => {
    render(<AuditTrailTable logs={mockLogs} />);

    // Check Endpoint
    expect(screen.getByText("/api/test")).toBeDefined();
    expect(screen.getByText("/api/error")).toBeDefined();

    // Check Status
    expect(screen.getByText("Success")).toBeDefined();
    expect(screen.getByText("Error")).toBeDefined();
  });

  it("displays encrypted status correctly", () => {
    render(<AuditTrailTable logs={mockLogs} />);
    expect(screen.getByText("✓ Encrypted")).toBeDefined();
    expect(screen.getByText("✗ Not Encrypted")).toBeDefined();
  });

  it("displays error message in title attribute", () => {
    render(<AuditTrailTable logs={mockLogs} />);
    const errorSpan = screen.getByText("Error");
    expect(errorSpan.getAttribute("title")).toBe("Bad Request");
  });

  it("limits comparison to 50 logs", () => {
    const manyLogs = Array.from({ length: 60 }, (_, i) => ({
      id: `${i}`,
      timestamp: Date.now(),
      endpoint: `/api/test/${i}`,
      encrypted: true,
      encryptedPayloadSize: 100,
      responseTimeMs: 10,
      success: true,
    }));

    render(<AuditTrailTable logs={manyLogs} />);
    const rows = screen.getAllByText(/Success/);
    expect(rows.length).toBe(50);
  });
});
