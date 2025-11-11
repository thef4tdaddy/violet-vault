import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useReceiptScannerStore } from "../receiptScannerStore";

describe("useReceiptScannerStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useReceiptScannerStore());
    act(() => {
      result.current.resetPreferences();
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useReceiptScannerStore());

    expect(result.current.saveRawText).toBe(false);
    expect(result.current.encryptReceipts).toBe(true);
    expect(result.current.showConfidenceIndicators).toBe(true);
    expect(result.current.lastScanTimestamp).toBeNull();
    expect(result.current.lastProcessingTime).toBeNull();
    expect(result.current.averageProcessingTime).toBeNull();
  });

  it("should update saveRawText preference", () => {
    const { result } = renderHook(() => useReceiptScannerStore());

    act(() => {
      result.current.setSaveRawText(true);
    });

    expect(result.current.saveRawText).toBe(true);
  });

  it("should update encryptReceipts preference", () => {
    const { result } = renderHook(() => useReceiptScannerStore());

    act(() => {
      result.current.setEncryptReceipts(false);
    });

    expect(result.current.encryptReceipts).toBe(false);
  });

  it("should update showConfidenceIndicators preference", () => {
    const { result } = renderHook(() => useReceiptScannerStore());

    act(() => {
      result.current.setShowConfidenceIndicators(false);
    });

    expect(result.current.showConfidenceIndicators).toBe(false);
  });

  it("should record scan metrics", () => {
    const { result } = renderHook(() => useReceiptScannerStore());

    const processingTime = 1500;

    act(() => {
      result.current.recordScan(processingTime);
    });

    expect(result.current.lastProcessingTime).toBe(processingTime);
    expect(result.current.averageProcessingTime).toBe(processingTime);
    expect(result.current.lastScanTimestamp).toBeGreaterThan(0);
  });

  it("should calculate average processing time correctly", () => {
    const { result } = renderHook(() => useReceiptScannerStore());

    act(() => {
      result.current.recordScan(1000);
    });

    expect(result.current.averageProcessingTime).toBe(1000);

    act(() => {
      result.current.recordScan(2000);
    });

    // Average of 1000 and 2000 should be 1500
    expect(result.current.averageProcessingTime).toBe(1500);
  });

  it("should reset preferences to default values", () => {
    const { result } = renderHook(() => useReceiptScannerStore());

    // Change some values
    act(() => {
      result.current.setSaveRawText(true);
      result.current.setEncryptReceipts(false);
      result.current.recordScan(1500);
    });

    // Reset
    act(() => {
      result.current.resetPreferences();
    });

    expect(result.current.saveRawText).toBe(false);
    expect(result.current.encryptReceipts).toBe(true);
    expect(result.current.showConfidenceIndicators).toBe(true);
    expect(result.current.lastScanTimestamp).toBeNull();
    expect(result.current.lastProcessingTime).toBeNull();
    expect(result.current.averageProcessingTime).toBeNull();
  });
});
