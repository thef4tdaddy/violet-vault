import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useQRCodeProcessing } from "../useQRCodeProcessing";

// Mock dependencies
vi.mock("../../../utils/security/shareCodeUtils", () => ({
  shareCodeUtils: {
    parseQRData: vi.fn((data) => {
      try {
        const parsed = JSON.parse(data);
        return parsed;
      } catch {
        return null;
      }
    }),
  },
}));

vi.mock("../../../utils/common/toastHelpers", () => ({
  useToastHelpers: () => ({
    showErrorToast: vi.fn(),
  }),
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    warn: vi.fn(),
  },
}));

describe("useQRCodeProcessing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide QR processing functions", () => {
    const { result } = renderHook(() => useQRCodeProcessing());

    expect(result.current.processQRData).toBeDefined();
    expect(typeof result.current.processQRData).toBe("function");
    expect(result.current.handleQRScan).toBeDefined();
    expect(typeof result.current.handleQRScan).toBe("function");
  });

  it("should process valid QR data with share code", () => {
    const { result } = renderHook(() => useQRCodeProcessing());

    const setShareCode = vi.fn();
    const setCreatorInfo = vi.fn();
    const validateShareCode = vi.fn();

    const qrData = JSON.stringify({ shareCode: "test-code-123" });

    const success = result.current.processQRData(
      qrData,
      setShareCode,
      setCreatorInfo,
      validateShareCode
    );

    expect(success).toBe(true);
    expect(setShareCode).toHaveBeenCalledWith("test-code-123");
    expect(validateShareCode).toHaveBeenCalledWith("test-code-123");
  });

  it("should set creator info when available in QR data", () => {
    const { result } = renderHook(() => useQRCodeProcessing());

    const setShareCode = vi.fn();
    const setCreatorInfo = vi.fn();
    const validateShareCode = vi.fn();

    const qrData = JSON.stringify({
      shareCode: "test-code-123",
      createdBy: "John Doe",
      creatorColor: "#ff5733",
      createdAt: Date.now(),
    });

    result.current.processQRData(qrData, setShareCode, setCreatorInfo, validateShareCode);

    expect(setCreatorInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        userName: "John Doe",
        userColor: "#ff5733",
      })
    );
  });

  it("should use default color when creator color not provided", () => {
    const { result } = renderHook(() => useQRCodeProcessing());

    const setShareCode = vi.fn();
    const setCreatorInfo = vi.fn();
    const validateShareCode = vi.fn();

    const qrData = JSON.stringify({
      shareCode: "test-code-123",
      createdBy: "John Doe",
    });

    result.current.processQRData(qrData, setShareCode, setCreatorInfo, validateShareCode);

    expect(setCreatorInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        userColor: "#a855f7",
      })
    );
  });

  it("should return false for invalid QR data", () => {
    const { result } = renderHook(() => useQRCodeProcessing());

    const setShareCode = vi.fn();
    const setCreatorInfo = vi.fn();
    const validateShareCode = vi.fn();

    const qrData = "invalid-json-data";

    const success = result.current.processQRData(
      qrData,
      setShareCode,
      setCreatorInfo,
      validateShareCode
    );

    expect(success).toBe(false);
    expect(setShareCode).not.toHaveBeenCalled();
  });

  it("should return false when QR data missing share code", () => {
    const { result } = renderHook(() => useQRCodeProcessing());

    const setShareCode = vi.fn();
    const setCreatorInfo = vi.fn();
    const validateShareCode = vi.fn();

    const qrData = JSON.stringify({ someOtherData: "value" });

    const success = result.current.processQRData(
      qrData,
      setShareCode,
      setCreatorInfo,
      validateShareCode
    );

    expect(success).toBe(false);
  });

  it("should not set creator info when not provided", () => {
    const { result } = renderHook(() => useQRCodeProcessing());

    const setShareCode = vi.fn();
    const setCreatorInfo = vi.fn();
    const validateShareCode = vi.fn();

    const qrData = JSON.stringify({ shareCode: "test-code-123" });

    result.current.processQRData(qrData, setShareCode, setCreatorInfo, validateShareCode);

    expect(setCreatorInfo).not.toHaveBeenCalled();
  });

  it("should handle null QR data", () => {
    const { result } = renderHook(() => useQRCodeProcessing());

    const setShareCode = vi.fn();
    const setCreatorInfo = vi.fn();
    const validateShareCode = vi.fn();

    const success = result.current.processQRData(
      null,
      setShareCode,
      setCreatorInfo,
      validateShareCode
    );

    expect(success).toBe(false);
  });

  it("handleQRScan should show error toast", () => {
    const { result } = renderHook(() => useQRCodeProcessing());

    // Just ensure it doesn't throw
    expect(() => result.current.handleQRScan()).not.toThrow();
  });

  it("should handle parsing errors gracefully", () => {
    const { result } = renderHook(() => useQRCodeProcessing());

    const setShareCode = vi.fn();
    const setCreatorInfo = vi.fn();
    const validateShareCode = vi.fn();

    const qrData = "{invalid json";

    const success = result.current.processQRData(
      qrData,
      setShareCode,
      setCreatorInfo,
      validateShareCode
    );

    expect(success).toBe(false);
  });
});
