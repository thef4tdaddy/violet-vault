import React from "react";
import { useExportData } from "./useExportData";
import { useImportData } from "./useImportData";
import { useResetEncryption } from "./useResetEncryption";
import logger from "@/utils/core/common/logger";

/**
 * Data management hook return type
 */
interface UseDataManagementReturn {
  exportData: () => Promise<void>;
  importData: (event: React.ChangeEvent<HTMLInputElement>) => Promise<
    | {
        success: boolean;
        imported: {
          envelopes: number;
          bills: number;
          transactions: number;
          savingsGoals: number;
          debts: number;
          paycheckHistory: number;
          auditLog: number;
        };
      }
    | undefined
  >;
  resetEncryptionAndStartFresh: () => void;
}

/**
 * Custom hook for data import/export operations
 * Extracts data management logic from Layout component
 */
const useDataManagement = (): UseDataManagementReturn => {
  const { exportData } = useExportData();
  const { executeImport } = useImportData();
  const { resetEncryptionAndStartFresh } = useResetEncryption();

  // Adapter to match the expected interface (React Change Event vs direct data)
  // Since useImportData expects the *data*, we need to read the file here or change the interface.
  // Wait, let's look at the interface. importData takes a ChangeEvent.
  // But executeImport takes "importedData: unknown".
  // So we need to read the file here.

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    return new Promise<
      | {
          success: boolean;
          imported: {
            envelopes: number;
            bills: number;
            transactions: number;
            savingsGoals: number;
            debts: number;
            paycheckHistory: number;
            auditLog: number;
          };
        }
      | undefined
    >((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          const result = await executeImport(data);

          if (result && result.success && result.counts) {
            resolve({
              success: true,
              imported: {
                envelopes: result.counts.envelopes,
                transactions: result.counts.transactions,
                bills: 0,
                savingsGoals: 0,
                debts: 0,
                paycheckHistory: 0,
                auditLog: result.counts.auditLog,
              },
            });
          } else {
            resolve(undefined);
          }
        } catch (error) {
          logger.error("Import error details:", error);
          resolve(undefined);
        }
      };
      reader.readAsText(file);
    });
  };

  return {
    exportData,
    importData,
    resetEncryptionAndStartFresh,
  };
};

export default useDataManagement;
