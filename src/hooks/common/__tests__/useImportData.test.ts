import { renderHook, waitFor } from "@testing-library/react";
import { useImportData } from "../useImportData";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToastHelpers } from "../../../utils/common/toastHelpers";
import { useConfirm } from "../useConfirm";
import { readFileContent } from "../../../utils/dataManagement/fileUtils";
import { validateImportedData } from "../../../utils/dataManagement/validationUtils";
import { backupCurrentData } from "../../../utils/dataManagement/backupUtils";
import { clearAllDexieData, importDataToDexie } from "../../../utils/dataManagement/dexieUtils";
import { clearFirebaseData, forcePushToCloud } from "../../../utils/dataManagement/firebaseUtils";
import { queryClient } from "../../../utils/common/queryClient";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";

vi.mock("@/hooks/auth/useAuth");
vi.mock("../../../utils/common/toastHelpers");
vi.mock("../useConfirm");
vi.mock("../../../utils/dataManagement/fileUtils");
vi.mock("../../../utils/dataManagement/validationUtils");
vi.mock("../../../utils/dataManagement/backupUtils");
vi.mock("../../../utils/dataManagement/dexieUtils");
vi.mock("../../../utils/dataManagement/firebaseUtils");
vi.mock("../../../utils/common/queryClient");

describe("useImportData", () => {
  const mockUser = { userName: "testuser", budgetId: "123", userColor: "#000000" };
  const mockFile = new Blob([JSON.stringify({ envelopes: [] })], { type: "application/json" });
  const mockEvent = {
    target: { files: [mockFile] as unknown as FileList, value: "" },
  } as React.ChangeEvent<HTMLInputElement>;

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({
      user: mockUser,
      budgetId: "123",
      encryptionKey: {} as CryptoKey,
    });
  });

  it("should import data successfully", async () => {
    const showSuccessToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast,
      showErrorToast: vi.fn(),
      showWarningToast: vi.fn(),
    });
    (useConfirm as Mock).mockReturnValue(vi.fn().mockResolvedValue(true));
    (readFileContent as Mock).mockResolvedValue(JSON.stringify({ envelopes: [] }));
    (validateImportedData as Mock).mockReturnValue({
      validatedData: { envelopes: [] },
      hasBudgetIdMismatch: false,
      importBudgetId: undefined,
      validationWarnings: [],
    });
    (forcePushToCloud as Mock).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useImportData());
    await result.current.importData(mockEvent);

    expect(backupCurrentData).toHaveBeenCalled();
    expect(clearFirebaseData).toHaveBeenCalled();
    expect(clearAllDexieData).toHaveBeenCalled();
    expect(importDataToDexie).toHaveBeenCalled();
    expect(forcePushToCloud).toHaveBeenCalled();
    expect(queryClient.invalidateQueries).toHaveBeenCalled();
    expect(showSuccessToast).toHaveBeenCalledWith(
      "Import complete! Data synced to cloud successfully."
    );
  });

  it("should handle file read errors", async () => {
    const showErrorToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast: vi.fn(),
      showErrorToast,
      showWarningToast: vi.fn(),
    });
    (readFileContent as Mock).mockRejectedValue(new Error("File read failed"));

    const { result } = renderHook(() => useImportData());
    await expect(result.current.importData(mockEvent)).rejects.toThrow();

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith(
        expect.stringContaining("Import failed"),
        "Import Failed"
      );
    });
  });

  it("should handle JSON parsing errors", async () => {
    const showErrorToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast: vi.fn(),
      showErrorToast,
      showWarningToast: vi.fn(),
    });
    (readFileContent as Mock).mockResolvedValue("invalid json {");

    const { result } = renderHook(() => useImportData());
    await expect(result.current.importData(mockEvent)).rejects.toThrow();

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalled();
    });
  });

  it("should handle validation errors", async () => {
    const showErrorToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast: vi.fn(),
      showErrorToast,
      showWarningToast: vi.fn(),
    });
    (readFileContent as Mock).mockResolvedValue(JSON.stringify({ invalid: "data" }));
    (validateImportedData as Mock).mockImplementation(() => {
      throw new Error("Validation failed: Invalid data structure");
    });

    const { result } = renderHook(() => useImportData());
    await expect(result.current.importData(mockEvent)).rejects.toThrow();

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalled();
    });
  });

  it("should handle budget ID mismatch with user confirmation", async () => {
    const showSuccessToast = vi.fn();
    const confirmFn = vi.fn().mockResolvedValue(true);
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast,
      showErrorToast: vi.fn(),
      showWarningToast: vi.fn(),
    });
    (useConfirm as Mock).mockReturnValue(confirmFn);
    (readFileContent as Mock).mockResolvedValue(JSON.stringify({ envelopes: [] }));
    (validateImportedData as Mock).mockReturnValue({
      validatedData: { envelopes: [] },
      hasBudgetIdMismatch: true,
      importBudgetId: "different-budget-id",
      validationWarnings: [],
    });
    (forcePushToCloud as Mock).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useImportData());
    await result.current.importData(mockEvent);

    expect(confirmFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining("Encryption Context Change"),
        destructive: true,
      })
    );
    expect(showSuccessToast).toHaveBeenCalled();
  });

  it("should cancel import when user declines confirmation", async () => {
    const confirmFn = vi.fn().mockResolvedValue(false);
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast: vi.fn(),
      showErrorToast: vi.fn(),
      showWarningToast: vi.fn(),
    });
    (useConfirm as Mock).mockReturnValue(confirmFn);
    (readFileContent as Mock).mockResolvedValue(JSON.stringify({ envelopes: [] }));
    (validateImportedData as Mock).mockReturnValue({
      validatedData: { envelopes: [] },
      hasBudgetIdMismatch: true,
      importBudgetId: "different-budget-id",
      validationWarnings: [],
    });

    const { result } = renderHook(() => useImportData());
    await result.current.importData(mockEvent);

    expect(confirmFn).toHaveBeenCalled();
    expect(backupCurrentData).not.toHaveBeenCalled();
    expect(clearAllDexieData).not.toHaveBeenCalled();
  });

  it("should handle validation warnings", async () => {
    const showSuccessToast = vi.fn();
    const showWarningToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast,
      showErrorToast: vi.fn(),
      showWarningToast,
    });
    (useConfirm as Mock).mockReturnValue(vi.fn().mockResolvedValue(true));
    (readFileContent as Mock).mockResolvedValue(JSON.stringify({ envelopes: [] }));
    (validateImportedData as Mock).mockReturnValue({
      validatedData: { envelopes: [] },
      hasBudgetIdMismatch: false,
      importBudgetId: undefined,
      validationWarnings: ["Invalid envelope: env-1", "Invalid transaction: txn-1"],
    });
    (forcePushToCloud as Mock).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useImportData());
    await result.current.importData(mockEvent);

    await waitFor(() => {
      expect(showWarningToast).toHaveBeenCalledWith(
        expect.stringContaining("validation warning"),
        "Import Warnings"
      );
    });
  });

  it("should handle import data failures", async () => {
    const showErrorToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast: vi.fn(),
      showErrorToast,
      showWarningToast: vi.fn(),
    });
    (useConfirm as Mock).mockReturnValue(vi.fn().mockResolvedValue(true));
    (readFileContent as Mock).mockResolvedValue(JSON.stringify({ envelopes: [] }));
    (validateImportedData as Mock).mockReturnValue({
      validatedData: { envelopes: [] },
      hasBudgetIdMismatch: false,
      importBudgetId: undefined,
      validationWarnings: [],
    });
    (importDataToDexie as Mock).mockRejectedValue(new Error("Dexie import failed"));

    const { result } = renderHook(() => useImportData());
    await expect(result.current.importData(mockEvent)).rejects.toThrow();

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalled();
    });
  });

  it("should handle cloud sync failures", async () => {
    const showErrorToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast: vi.fn(),
      showErrorToast,
      showWarningToast: vi.fn(),
    });
    (useConfirm as Mock).mockReturnValue(vi.fn().mockResolvedValue(true));
    (readFileContent as Mock).mockResolvedValue(JSON.stringify({ envelopes: [] }));
    (validateImportedData as Mock).mockReturnValue({
      validatedData: { envelopes: [] },
      hasBudgetIdMismatch: false,
      importBudgetId: undefined,
      validationWarnings: [],
    });
    (forcePushToCloud as Mock).mockRejectedValue(new Error("Cloud sync failed"));

    const { result } = renderHook(() => useImportData());
    await expect(result.current.importData(mockEvent)).rejects.toThrow();

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalled();
    });
  });

  it("should handle empty file", async () => {
    const { result } = renderHook(() => useImportData());
    const emptyEvent = {
      target: { files: null as unknown as FileList, value: "" },
    } as React.ChangeEvent<HTMLInputElement>;

    await result.current.importData(emptyEvent);

    expect(readFileContent).not.toHaveBeenCalled();
  });

  it("should reset file input after import", async () => {
    const inputElement = { files: [mockFile] as unknown as FileList, value: "test.json" };
    const event = {
      target: inputElement,
    } as React.ChangeEvent<HTMLInputElement>;

    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast: vi.fn(),
      showErrorToast: vi.fn(),
      showWarningToast: vi.fn(),
    });
    (useConfirm as Mock).mockReturnValue(vi.fn().mockResolvedValue(true));
    (readFileContent as Mock).mockResolvedValue(JSON.stringify({ envelopes: [] }));
    (validateImportedData as Mock).mockReturnValue({
      validatedData: { envelopes: [] },
      hasBudgetIdMismatch: false,
      importBudgetId: undefined,
      validationWarnings: [],
    });
    (importDataToDexie as Mock).mockResolvedValue(undefined);
    (forcePushToCloud as Mock).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useImportData());
    await result.current.importData(event);

    expect(inputElement.value).toBe("");
  });
});
