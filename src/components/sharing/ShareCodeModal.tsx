import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { QRCodeSVG } from "qrcode.react";
import { renderIcon } from "@/utils";
import { shareCodeManager } from "@/utils/auth/shareCodeManager";
import { useAuthManager } from "@/hooks/auth/useAuthManager";
import { useConfirm } from "@/hooks/common/useConfirm";
import { useToastHelpers } from "@/utils/common/toastHelpers";
import logger from "@/utils/common/logger";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

interface ShareData {
  shareCode: string;
  qrData: string;
  shareUrl: string;
  expiresAt: number;
}

interface ShareCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Share Code Modal - Generate and display share codes with QR codes
 * Addresses GitHub Issue #580 - Secure budget sharing system
 */
const ShareCodeModal: React.FC<ShareCodeModalProps> = ({ isOpen, onClose }) => {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const { user: currentUser, updateProfile } = useAuthManager();
  const { showSuccessToast, showErrorToast } = useToastHelpers();
  const confirm = useConfirm();

  useEffect(() => {
    if (isOpen && !shareData) {
      loadExistingShareCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, shareData]);

  const loadExistingShareCode = async () => {
    if (!currentUser?.userName) {
      showErrorToast("Cannot load share code - user not properly authenticated");
      return;
    }

    // Check if user already has a share code
    if (currentUser.shareCode) {
      setIsGenerating(true);
      try {
        const shareCode = currentUser.shareCode;
        const displayCode = shareCodeManager.formatForDisplay(shareCode);
        const qrData = shareCodeManager.generateQRData(shareCode, currentUser as never);

        const result = {
          shareCode: displayCode,
          qrData,
          shareUrl: `${window.location.origin}?share=${encodeURIComponent(shareCode)}`,
          expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
        };

        setShareData(result);

        logger.info("Loaded existing BIP39 share code", {
          shareCodePreview: shareCode.split(" ").slice(0, 2).join(" ") + " ...",
          displayCode: displayCode.split(" ").slice(0, 2).join(" ") + " ...",
        });
      } catch (error) {
        logger.error("Failed to load existing share code", error);
        // Fall back to generating a new one
        await generateShareCode();
      } finally {
        setIsGenerating(false);
      }
    } else {
      // No existing share code, generate a new one
      await generateShareCode();
    }
  };

  const generateShareCode = async () => {
    if (!currentUser?.userName) {
      showErrorToast("Cannot generate share code - user not properly authenticated");
      return;
    }

    setIsGenerating(true);
    try {
      // Generate a new 4-word BIP39 share code
      const shareCode = shareCodeManager.generateShareCode();
      const displayCode = shareCodeManager.formatForDisplay(shareCode);
      const qrData = shareCodeManager.generateQRData(shareCode, currentUser as never);

      const result = {
        shareCode: displayCode,
        qrData,
        shareUrl: `${window.location.origin}?share=${encodeURIComponent(shareCode)}`,
        expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      };

      setShareData(result);

      // Save the share code to the user profile for persistence
      try {
        await updateProfile({
          ...currentUser,
          shareCode: shareCode,
        } as never);
        logger.info("Share code saved to user profile for persistence");
      } catch (error) {
        logger.error("Failed to save share code to user profile", error);
        showErrorToast(
          "Share code generated but failed to save. It may not persist across sessions."
        );
      }

      showSuccessToast("Share code generated successfully!");

      logger.info("Generated BIP39 share code", {
        shareCodePreview: shareCode.split(" ").slice(0, 2).join(" ") + " ...",
        displayCode: displayCode.split(" ").slice(0, 2).join(" ") + " ...",
      });
    } catch (error) {
      logger.error("Failed to generate share code", error);
      showErrorToast("Failed to generate share code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyShareCode = async () => {
    if (!shareData?.shareCode) return;

    try {
      await navigator.clipboard.writeText(shareData.shareCode);
      setCopied(true);
      showSuccessToast("Share code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.warn("Failed to copy to clipboard", error as Record<string, unknown>);
      showErrorToast("Failed to copy share code");
    }
  };

  const copyShareUrl = async () => {
    if (!shareData?.shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      showSuccessToast("Share URL copied to clipboard!");
    } catch (error) {
      logger.warn("Failed to copy URL to clipboard", error as Record<string, unknown>);
      showErrorToast("Failed to copy share URL");
    }
  };

  const generateNewCode = async () => {
    const confirmed = await confirm({
      title: "Generate New Share Code",
      message: "This will generate a completely new share code. Are you sure you want to continue?",
      confirmLabel: "Generate New",
      cancelLabel: "Cancel",
    });
    if (!confirmed) return;

    await generateShareCode();
  };

  const modalRef = useModalAutoScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl border-2 border-black max-w-md w-full max-h-[90vh] overflow-y-auto my-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-black">
              <span className="text-2xl">S</span>HARE <span className="text-2xl">B</span>UDGET
            </h2>
            <ModalCloseButton onClick={onClose} />
          </div>
          <p className="text-sm text-purple-900 mt-2">
            Let others join your budget with a secure share code
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isGenerating ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-purple-600/20 border-t-purple-600 rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Generating secure share code...</p>
            </div>
          ) : shareData ? (
            <>
              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-4 border-2 border-black rounded-lg inline-block">
                  <QRCodeSVG
                    value={shareData.qrData}
                    size={200}
                    level="M"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Scan with another device or share the code manually
                </p>
              </div>

              {/* Share Code */}
              <div>
                <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                  Share Code
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareData.shareCode}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border-2 border-black rounded-lg text-lg font-mono text-center tracking-wider"
                  />
                  <Button
                    onClick={copyShareCode}
                    className={`px-4 py-3 rounded-lg font-black transition-colors border-2 border-black ${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {copied ? renderIcon("Check", { className: "h-5 w-5" }) : renderIcon("Copy", { className: "h-5 w-5" })}
                  </Button>
                </div>
              </div>

              {/* Share URL */}
              <div>
                <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                  Share URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareData.shareUrl}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm"
                  />
                  <Button
                    onClick={copyShareUrl}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-black transition-colors border-2 border-black"
                  >
                    {renderIcon("Copy", { className: "h-4 w-4" })}
                  </Button>
                </div>
              </div>

              {/* Budget Info */}
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {renderIcon("Shield", { className: "h-5 w-5 text-green-600 mt-0.5" })}
                  <div>
                    <h4 className="font-black text-green-800 text-sm">DETERMINISTIC BUDGET</h4>
                    <p className="text-xs text-green-700 mt-1">
                      This 4-word code creates the same budget for anyone who uses it with the
                      correct password.
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Code never expires - share with trusted users only
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <h4 className="font-black text-purple-800 text-sm mb-2">HOW TO USE</h4>
                <ol className="text-xs text-purple-700 space-y-1">
                  <li>1. Share the code or QR image with trusted users</li>
                  <li>2. They'll scan the QR code or enter the share code</li>
                  <li>3. They'll set their own password for local encryption</li>
                  <li>4. Both of you can now sync to the same budget</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={generateShareCode}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-black transition-colors border-2 border-black"
                >
                  {renderIcon("RefreshCw", { className: "h-4 w-4 mr-2" })}
                  NEW CODE
                </Button>
                <Button
                  onClick={generateNewCode}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-black transition-colors border-2 border-black"
                >
                  {renderIcon("Shuffle", { className: "h-4 w-4 mr-2" })}
                  NEW CODE
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Button
                onClick={generateShareCode}
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-black transition-colors border-2 border-black"
              >
                {renderIcon("Share", { className: "h-5 w-5 mr-2" })}
                GENERATE SHARE CODE
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareCodeModal;
