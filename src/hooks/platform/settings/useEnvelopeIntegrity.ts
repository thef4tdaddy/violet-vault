import { useState, useCallback } from "react";
import {
  removeCorruptedEnvelopes,
  repairCorruptedEnvelopes,
  getEnvelopeIntegrityReport,
} from "@/utils/budgeting/envelopeIntegrityChecker";
import { useConfirm } from "@/hooks/platform/ux/useConfirm";
import useToast from "@/hooks/platform/ux/useToast";
import logger from "@/utils/common/logger";

/**
 * Envelope integrity report structure
 */
interface IntegrityReport {
  total: number;
  healthy: number;
  corrupted: number;
  corruptedEnvelopes: Array<{
    id: string;
    name?: string;
    category?: string;
    currentBalance?: number;
    monthlyAmount?: number;
    issues: string[];
  }>;
  recommendations: string[];
}

/**
 * Hook for managing envelope integrity checking operations
 * Extracted from EnvelopeIntegrityChecker.tsx to reduce complexity
 */
export const useEnvelopeIntegrity = () => {
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedEnvelopes, setSelectedEnvelopes] = useState(new Set<string>());
  const { addToast } = useToast();
  const confirm = useConfirm();

  /**
   * Scan for corrupted envelopes
   */
  const scanForCorruptedEnvelopes = useCallback(async (): Promise<void> => {
    setIsScanning(true);
    try {
      logger.debug("🔍 Scanning envelopes for integrity issues...");
      const integrityReport = await getEnvelopeIntegrityReport();
      setReport(integrityReport);

      if (integrityReport.corrupted > 0) {
        addToast({
          type: "warning",
          title: "Envelope Issues Found",
          message: `Found ${integrityReport.corrupted} corrupted envelope${integrityReport.corrupted === 1 ? "" : "s"}`,
          duration: 5000,
        });
      } else {
        addToast({
          type: "success",
          title: "All Envelopes Healthy",
          message: "No integrity issues found",
          duration: 3000,
        });
      }
    } catch (error) {
      logger.error("❌ Failed to scan envelopes", error);
      addToast({
        type: "error",
        title: "Scan Failed",
        message: "Could not scan envelopes for integrity issues",
        duration: 5000,
      });
    } finally {
      setIsScanning(false);
    }
  }, [addToast]);

  /**
   * Handle envelope selection
   */
  const handleSelectEnvelope = useCallback(
    (envelopeId: string): void => {
      const newSelected = new Set(selectedEnvelopes);
      if (newSelected.has(envelopeId)) {
        newSelected.delete(envelopeId);
      } else {
        newSelected.add(envelopeId);
      }
      setSelectedEnvelopes(newSelected);
    },
    [selectedEnvelopes]
  );

  /**
   * Handle select all/deselect all
   */
  const handleSelectAll = useCallback((): void => {
    if (selectedEnvelopes.size === report?.corruptedEnvelopes.length) {
      setSelectedEnvelopes(new Set());
    } else {
      setSelectedEnvelopes(new Set(report?.corruptedEnvelopes.map((env) => env.id) || []));
    }
  }, [selectedEnvelopes.size, report?.corruptedEnvelopes]);

  /**
   * Remove selected corrupted envelopes
   */
  const handleRemoveSelected = useCallback(async (): Promise<void> => {
    if (selectedEnvelopes.size === 0) return;

    const confirmed = await confirm({
      title: "Remove Corrupted Envelopes",
      message: `Are you sure you want to permanently remove ${selectedEnvelopes.size} corrupted envelope${selectedEnvelopes.size === 1 ? "" : "s"}? This action cannot be undone.`,
      confirmLabel: "Remove Envelopes",
      cancelLabel: "Cancel",
      destructive: true,
    });

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const result = await removeCorruptedEnvelopes([...selectedEnvelopes]);

      if (result.success) {
        addToast({
          type: "success",
          title: "Envelopes Removed",
          message: result.message,
          duration: 3000,
        });

        // Rescan after removal
        setSelectedEnvelopes(new Set());
        await scanForCorruptedEnvelopes();
      } else {
        addToast({
          type: "error",
          title: "Removal Failed",
          message: result.message,
          duration: 5000,
        });
      }
    } catch (error) {
      logger.error("❌ Failed to remove envelopes", error);
      addToast({
        type: "error",
        title: "Removal Failed",
        message: "Could not remove corrupted envelopes",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedEnvelopes, confirm, addToast, scanForCorruptedEnvelopes]);

  /**
   * Repair selected corrupted envelopes
   */
  const handleRepairSelected = useCallback(async (): Promise<void> => {
    if (selectedEnvelopes.size === 0) return;

    const selectedEnvelopeObjects =
      report?.corruptedEnvelopes.filter((env) => selectedEnvelopes.has(env.id)) || [];

    setIsProcessing(true);
    try {
      const result = await repairCorruptedEnvelopes(selectedEnvelopeObjects);

      if (result.success) {
        addToast({
          type: "success",
          title: "Envelopes Repaired",
          message: result.message,
          duration: 3000,
        });

        // Rescan after repair
        setSelectedEnvelopes(new Set());
        await scanForCorruptedEnvelopes();
      } else {
        addToast({
          type: "error",
          title: "Repair Failed",
          message: result.message,
          duration: 5000,
        });
      }
    } catch (error) {
      logger.error("❌ Failed to repair envelopes", error);
      addToast({
        type: "error",
        title: "Repair Failed",
        message: "Could not repair corrupted envelopes",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedEnvelopes, report?.corruptedEnvelopes, addToast, scanForCorruptedEnvelopes]);

  return {
    // State
    report,
    isScanning,
    isProcessing,
    selectedEnvelopes,

    // Actions
    scanForCorruptedEnvelopes,
    handleSelectEnvelope,
    handleSelectAll,
    handleRemoveSelected,
    handleRepairSelected,
  };
};
