import { renderHook } from "@testing-library/react";
import { useImportData } from "../useImportData";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastHelpers } from "../../../utils/common/toastHelpers";
import { useConfirm } from "../useConfirm";
import { readFileContent } from "../../../utils/dataManagement/fileUtils";
import { validateImportedData } from "../../../utils/dataManagement/validationUtils";
import { backupCurrentData } from "../../../utils/dataManagement/backupUtils";
import { clearAllDexieData, importDataToDexie } from "../../../utils/dataManagement/dexieUtils";
import { clearFirebaseData, forcePushToCloud } from "../../../utils/dataManagement/firebaseUtils";
import { queryClient } from "../../../utils/common/queryClient";
import { vi } from "vitest";

vi.mock("../../../contexts/AuthContext");
vi.mock("../../../utils/common/toastHelpers");
vi.mock("../useConfirm");
vi.mock("../../../utils/dataManagement/fileUtils");
vi.mock("../../../utils/dataManagement/validationUtils");
vi.mock("../../../utils/dataManagement/backupUtils");
vi.mock("../../../utils/dataManagement/dexieUtils");
vi.mock("../../../utils/dataManagement/firebaseUtils");
vi.mock("../../../utils/common/queryClient");

describe("useImportData", () => {
  it("should import data successfully", async () => {
    (useAuth as any).mockReturnValue({
      currentUser: { userName: "testuser", budgetId: "123" },
    });
    const showSuccessToast = vi.fn();
    (useToastHelpers as any).mockReturnValue({
      showSuccessToast,
      showErrorToast: vi.fn(),
    });
    (useConfirm as any).mockReturnValue(vi.fn().mockResolvedValue(true));
    (readFileContent as any).mockResolvedValue(JSON.stringify({ envelopes: [] }));
    (validateImportedData as any).mockReturnValue({
      validatedData: { envelopes: [] },
      hasBudgetIdMismatch: false,
    });
    (forcePushToCloud as any).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useImportData());
    const event = { target: { files: [new Blob()] } };
    await result.current.importData(event);

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
});
