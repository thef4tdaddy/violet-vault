/**
 */
import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useReceiptScanner } from "../useReceiptScanner";
import { processReceiptImage } from "../../../../utils/core/common/ocrProcessor";

// Mock the OCR processor
vi.mock("../../../../utils/core/common/ocrProcessor");
vi.mock("../../../../utils/core/common/logger");
vi.mock("../../../../utils/core/common/imageUtils", () => ({
  resizeImage: vi.fn((file) => Promise.resolve(file)),
}));

describe("useReceiptScanner", () => {
  const mockOnReceiptProcessed = vi.fn();
  let mockFile: File;

  beforeEach(() => {
    mockFile = new File(["receipt content"], "receipt.jpg", {
      type: "image/jpeg",
    } as any);
    mockOnReceiptProcessed.mockClear();
    (processReceiptImage as any).mockClear();

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => "mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useReceiptScanner(mockOnReceiptProcessed));

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.uploadedImage).toBeNull();
    expect(result.current.extractedData).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.showImagePreview).toBe(false);
  });

  it("should validate file types correctly", async () => {
    const { result } = renderHook(() => useReceiptScanner(mockOnReceiptProcessed));
    const invalidFile = new File(["text"], "document.txt", {
      type: "text/plain",
    });

    await act(async () => {
      await result.current.handleFileUpload(invalidFile);
    });

    expect(result.current.error).toBe("Please upload an image file (JPG, PNG, etc.)");
    expect(processReceiptImage).not.toHaveBeenCalled();
  });

  it("should validate file size correctly", async () => {
    const { result } = renderHook(() => useReceiptScanner(mockOnReceiptProcessed));
    // Create a large file (mock size check by rejecting in processReceiptImage)
    const largeFile = new File(["x".repeat(11 * 1024 * 1024)], "large.jpg", {
      type: "image/jpeg",
    });

    await act(async () => {
      await result.current.handleFileUpload(largeFile);
    });

    expect(result.current.error).toBe(
      "Image file is too large. Please use a file smaller than 10MB."
    );
    expect(processReceiptImage).not.toHaveBeenCalled();
  });

  it("should process valid file successfully", async () => {
    const mockResult = {
      merchant: "Test Store",
      total: 29.99,
      confidence: { merchant: "high", total: "high" },
      rawText: "Receipt text",
      processingTime: 1500,
    };

    (processReceiptImage as any).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useReceiptScanner(mockOnReceiptProcessed));

    await act(async () => {
      await result.current.handleFileUpload(mockFile);
    });

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.uploadedImage).toMatchObject({
      name: "receipt.jpg",
      size: mockFile.size, // Use actual file size
    });
    expect(result.current.uploadedImage?.url).toBe("mock-url");
    expect(result.current.extractedData).toEqual(mockResult);
    expect(result.current.error).toBeNull();
  });

  it("should handle OCR processing errors", async () => {
    (processReceiptImage as any).mockRejectedValue(new Error("OCR failed"));

    const { result } = renderHook(() => useReceiptScanner(mockOnReceiptProcessed));

    await act(async () => {
      await result.current.handleFileUpload(mockFile);
    });

    expect(result.current.error).toBe(
      "Failed to process receipt. Please try again with a clearer image."
    );
    expect(result.current.extractedData).toBeNull();
    expect(result.current.isProcessing).toBe(false);
  });

  it("should handle drag and drop", async () => {
    const mockResult = { merchant: "Store", total: 10.0 };
    (processReceiptImage as any).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useReceiptScanner(mockOnReceiptProcessed));

    const mockEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { files: [mockFile] },
    };

    await act(async () => {
      await result.current.handleDrop(mockEvent as any);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.extractedData).toEqual(mockResult);
  });

  it("should confirm receipt and call callback", async () => {
    const mockExtractedData = {
      merchant: "Store",
      total: "15.5",
      rawText: "Receipt text",
      processingTime: 1000,
      date: null,
      time: null,
      tax: null,
      subtotal: null,
      items: [],
      confidence: {},
    };

    (processReceiptImage as any).mockResolvedValue(mockExtractedData);

    const { result } = renderHook(() => useReceiptScanner(mockOnReceiptProcessed));

    // Upload a file first to set the state
    await act(async () => {
      await result.current.handleFileUpload(mockFile);
    });

    // Now confirm
    act(() => {
      result.current.handleConfirmReceipt();
    });

    expect(mockOnReceiptProcessed).toHaveBeenCalledWith({
      ...mockExtractedData,
      imageData: result.current.uploadedImage,
    });
  });

  it("should reset scanner state", async () => {
    const mockExtractedData = {
      merchant: "Store",
      total: "15.5",
      rawText: "Receipt text",
      processingTime: 1000,
      date: null,
      time: null,
      tax: null,
      subtotal: null,
      items: [],
      confidence: {},
    };

    (processReceiptImage as any).mockResolvedValue(mockExtractedData);

    const { result } = renderHook(() => useReceiptScanner(mockOnReceiptProcessed));

    // Upload a file first to set some state
    await act(async () => {
      await result.current.handleFileUpload(mockFile);
    });

    // Verify state is set
    expect(result.current.uploadedImage).not.toBeNull();
    expect(result.current.extractedData).not.toBeNull();

    // Now reset
    act(() => {
      result.current.resetScanner();
    });

    expect(result.current.uploadedImage).toBeNull();
    expect(result.current.extractedData).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.showImagePreview).toBe(false);
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it("should toggle image preview", () => {
    const { result } = renderHook(() => useReceiptScanner(mockOnReceiptProcessed));

    act(() => {
      result.current.toggleImagePreview();
    });

    expect(result.current.showImagePreview).toBe(true);

    act(() => {
      result.current.toggleImagePreview();
    });

    expect(result.current.showImagePreview).toBe(false);
  });
});
