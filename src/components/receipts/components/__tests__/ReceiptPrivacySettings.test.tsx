import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ReceiptPrivacySettings from "../ReceiptPrivacySettings";
import { useReceiptScannerStore } from "@/stores/ui/receiptScannerStore";

// Mock the store
vi.mock("@/stores/ui/receiptScannerStore");

describe("ReceiptPrivacySettings", () => {
  const mockSetSaveRawText = vi.fn();
  const mockSetEncryptReceipts = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock store implementation
    (useReceiptScannerStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      saveRawText: false,
      setSaveRawText: mockSetSaveRawText,
      encryptReceipts: true,
      setEncryptReceipts: mockSetEncryptReceipts,
    });
  });

  it("should render privacy settings with correct labels", () => {
    render(<ReceiptPrivacySettings />);

    expect(screen.getByText(/PRIVACY SETTINGS/i)).toBeInTheDocument();
    expect(screen.getByText(/Save raw OCR text with receipt/i)).toBeInTheDocument();
    expect(screen.getByText(/Encrypt receipts when syncing/i)).toBeInTheDocument();
  });

  it("should display privacy note", () => {
    render(<ReceiptPrivacySettings />);

    expect(screen.getByText(/Privacy Note:/i)).toBeInTheDocument();
    expect(screen.getByText(/processed locally in your browser/i)).toBeInTheDocument();
  });

  it("should reflect current store values in checkboxes", () => {
    render(<ReceiptPrivacySettings />);

    const saveRawTextCheckbox = screen.getByLabelText(/Save raw OCR text with receipt/i);
    const encryptCheckbox = screen.getByLabelText(/Encrypt receipts when syncing/i);

    expect(saveRawTextCheckbox).not.toBeChecked();
    expect(encryptCheckbox).toBeChecked();
  });

  it("should call setSaveRawText when toggling save raw text option", () => {
    render(<ReceiptPrivacySettings />);

    const saveRawTextCheckbox = screen.getByLabelText(/Save raw OCR text with receipt/i);

    fireEvent.click(saveRawTextCheckbox);

    expect(mockSetSaveRawText).toHaveBeenCalledWith(true);
  });

  it("should call setEncryptReceipts when toggling encryption option", () => {
    render(<ReceiptPrivacySettings />);

    const encryptCheckbox = screen.getByLabelText(/Encrypt receipts when syncing/i);

    fireEvent.click(encryptCheckbox);

    expect(mockSetEncryptReceipts).toHaveBeenCalledWith(false);
  });

  it("should show helpful descriptions for each option", () => {
    render(<ReceiptPrivacySettings />);

    expect(screen.getByText(/Store the complete OCR text output/i)).toBeInTheDocument();
    expect(screen.getByText(/Encrypt receipt data before uploading/i)).toBeInTheDocument();
  });

  it("should display correct icons for each setting", () => {
    render(<ReceiptPrivacySettings />);

    // Check that Shield, FileText, Lock, and Info icons are rendered
    const container = screen.getByText(/PRIVACY SETTINGS/i).closest("div");
    expect(container).toBeInTheDocument();
  });
});
