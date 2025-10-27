import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useReceiptScanner } from "../useReceiptScanner";
import { processReceiptImage } from "../../../utils/common/ocrProcessor";

// Mock the OCR processor
vi.mock("../../../utils/common/ocrProcessor");
vi.mock("../../../utils/common/logger");

describe("useReceiptScanner", () => {
  const mockOnReceiptProcessed = vi.fn();
  let mockFile;

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
    const largeFile = new File(["large content"], "large.jpg", {
      type: "image/jpeg",
    } as FilePropertyBag);

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
    };

    (processReceiptImage as any).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useReceiptScanner(mockOnReceiptProcessed));

    await act(async () => {
      await result.current.handleFileUpload(mockFile);
    });

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.uploadedImage).toEqual({
      file: mockFile,
      url: "mock-url",
      name: "receipt.jpg",
      size: 1024,
    });
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
      await result.current.handleDrop(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.extractedData).toEqual(mockResult);
  });

  it("should confirm receipt and call callback", () => {
    const mockExtractedData = { merchant: "Store", total: 15.5 };
    const mockUploadedImage = { url: "mock-url", name: "receipt.jpg" };

    const { result } = renderHook(() => useReceiptScanner(mockOnReceiptProcessed));

    // Manually set state for testing confirmation
    act(() => {
      result.current.extractedData = mockExtractedData;
      result.current.uploadedImage = mockUploadedImage;
    });

    act(() => {
      result.current.handleConfirmReceipt();
    });

    expect(mockOnReceiptProcessed).toHaveBeenCalledWith({
      ...mockExtractedData,
      imageData: mockUploadedImage,
    });
  });

  it("should reset scanner state", () => {
    const { result } = renderHook(() => useReceiptScanner(mockOnReceiptProcessed));

    // Set some state
    act(() => {
      result.current.uploadedImage = { url: "mock-url" };
      result.current.extractedData = { merchant: "Store" };
      result.current.error = "Some error";
      result.current.isProcessing = true;
      result.current.showImagePreview = true;
    });

    act(() => {
      result.current.resetScanner();
    });

    expect(result.current.uploadedImage).toBeNull();
    expect(result.current.extractedData).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.showImagePreview).toBe(false);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("mock-url");
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
