import { shareCodeUtils } from "../../utils/security/shareCodeUtils";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import logger from "../../utils/common/logger";

interface CreatorInfo {
  userName: string;
  userColor: string;
  createdAt?: string;
}

/**
 * Custom hook for QR code processing logic
 * Extracted from JoinBudgetModal to reduce complexity
 */
export const useQRCodeProcessing = () => {
  const { showErrorToast } = useToastHelpers();

  const processQRData = (
    qrData: string,
    setShareCode: (code: string) => void,
    setCreatorInfo: (info: CreatorInfo) => void,
    validateShareCode: (code: string) => void
  ) => {
    try {
      const parsed = shareCodeUtils.parseQRData(qrData);
      if (parsed && parsed.shareCode) {
        setShareCode(parsed.shareCode);

        // Set creator info if available
        if (parsed.createdBy) {
          setCreatorInfo({
            userName: parsed.createdBy,
            userColor: parsed.creatorColor || "#a855f7",
            createdAt: parsed.createdAt,
          });
        }

        validateShareCode(parsed.shareCode);
        return true;
      }
    } catch (error) {
      logger.warn("Failed to parse QR data", error);
    }
    return false;
  };

  const handleQRScan = () => {
    // TODO: Implement camera-based QR scanning
    showErrorToast(
      "QR scanning not yet implemented. Please enter the share code manually or paste QR data."
    );
  };

  return {
    processQRData,
    handleQRScan,
  };
};
