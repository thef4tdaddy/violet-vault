/**
 * EncryptedPayloadInspector Component Tests
 */

import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { EncryptedPayloadInspector } from "../EncryptedPayloadInspector";

describe("EncryptedPayloadInspector", () => {
  it("should render the data inspector", async () => {
    render(<EncryptedPayloadInspector />);

    await waitFor(() => {
      expect(screen.getByText("Data Inspector")).toBeInTheDocument();
    });

    expect(screen.getByText(/End-to-End Encryption/)).toBeInTheDocument();
  });

  it("should show original data section", async () => {
    render(<EncryptedPayloadInspector />);

    await waitFor(() => {
      expect(screen.getByText("Original Data (Your Device)")).toBeInTheDocument();
    });
  });

  it("should show encrypted data section", async () => {
    render(<EncryptedPayloadInspector />);

    await waitFor(() => {
      expect(screen.getByText("Encrypted (In Transit)")).toBeInTheDocument();
    });
  });

  it("should display encryption details", async () => {
    render(<EncryptedPayloadInspector />);

    await waitFor(() => {
      expect(screen.getByText(/IV:/)).toBeInTheDocument();
      expect(screen.getByText(/Auth Tag:/)).toBeInTheDocument();
      expect(screen.getByText(/Encryption Time:/)).toBeInTheDocument();
    });
  });

  it("should show what data is included", async () => {
    render(<EncryptedPayloadInspector />);

    await waitFor(() => {
      expect(screen.getByText("What data is included:")).toBeInTheDocument();
    });

    expect(screen.getByText(/Transaction amounts/)).toBeInTheDocument();
    expect(screen.getByText(/Envelope IDs/)).toBeInTheDocument();
    expect(screen.getByText(/Dates/)).toBeInTheDocument();
    expect(screen.getByText(/Allocation strategies/)).toBeInTheDocument();
  });

  it("should show what data is excluded", async () => {
    render(<EncryptedPayloadInspector />);

    await waitFor(() => {
      expect(screen.getByText(/No personally identifiable information/)).toBeInTheDocument();
    });

    expect(screen.getByText(/No account numbers or bank details/)).toBeInTheDocument();
    expect(screen.getByText(/No email addresses or names/)).toBeInTheDocument();
  });

  it("should show sample data with transactions", async () => {
    render(<EncryptedPayloadInspector />);

    await waitFor(() => {
      const originalDataSection = screen.getByText("Original Data (Your Device)").parentElement;
      expect(originalDataSection).toBeInTheDocument();
    });

    // Check that sample transaction data is present
    expect(screen.getByText(/transactions/i)).toBeInTheDocument();
  });

  it("should show loading state initially", () => {
    render(<EncryptedPayloadInspector />);

    expect(screen.getByText(/Loading sample data/i)).toBeInTheDocument();
  });
});
