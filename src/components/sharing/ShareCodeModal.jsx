import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { renderIcon } from "../../utils";
import { shareCodeUtils } from "../../utils/security/shareCodeUtils";
import { useAuth } from "../../stores/auth/authStore";
import { useConfirm } from "../../hooks/common/useConfirm";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import logger from "../../utils/common/logger";

/**
 * Share Code Modal - Generate and display share codes with QR codes
 * Addresses GitHub Issue #580 - Secure budget sharing system
 */
const ShareCodeModal = ({ isOpen, onClose }) => {
  const [shareData, setShareData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const { currentUser, encryptionKey } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastHelpers();
  const confirm = useConfirm();

  useEffect(() => {
    if (isOpen && !shareData) {
      generateShareCode();
    }
  }, [isOpen]);

  const generateShareCode = async () => {
    if (!currentUser?.userName) {
      showErrorToast(
        "Cannot generate share code - user not properly authenticated",
      );
      return;
    }

    setIsGenerating(true);
    try {
      // Generate a new 4-word BIP39 share code
      const shareCode = shareCodeUtils.generateShareCode();
      const displayCode = shareCodeUtils.formatForDisplay(shareCode);
      const qrData = shareCodeUtils.generateQRData(shareCode, currentUser);

      const result = {
        shareCode: displayCode,
        qrData,
        shareUrl: `${window.location.origin}?share=${encodeURIComponent(shareCode)}`,
        expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      };

      setShareData(result);
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
      logger.warn("Failed to copy to clipboard", error);
      showErrorToast("Failed to copy share code");
    }
  };

  const copyShareUrl = async () => {
    if (!shareData?.shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      showSuccessToast("Share URL copied to clipboard!");
    } catch (error) {
      logger.warn("Failed to copy URL to clipboard", error);
      showErrorToast("Failed to copy share URL");
    }
  };

  const generateNewCode = async () => {
    const confirmed = await confirm({
      title: "Generate New Share Code",
      message:
        "This will generate a completely new share code. Are you sure you want to continue?",
      confirmText: "Generate New",
      cancelText: "Cancel",
      variant: "default",
    });
    if (!confirmed) return;

    await generateShareCode();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border-2 border-black max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-black">
              <span className="text-2xl">S</span>HARE{" "}
              <span className="text-2xl">B</span>UDGET
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black transition-colors p-1"
            >
              {renderIcon("X", "h-6 w-6")}
            </button>
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
                  <button
                    onClick={copyShareCode}
                    className={`px-4 py-3 rounded-lg font-black transition-colors border-2 border-black ${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {copied
                      ? renderIcon("Check", "h-5 w-5")
                      : renderIcon("Copy", "h-5 w-5")}
                  </button>
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
                  <button
                    onClick={copyShareUrl}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-black transition-colors border-2 border-black"
                  >
                    {renderIcon("Copy", "h-4 w-4")}
                  </button>
                </div>
              </div>

              {/* Budget Info */}
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {renderIcon("Shield", "h-5 w-5 text-green-600 mt-0.5")}
                  <div>
                    <h4 className="font-black text-green-800 text-sm">
                      DETERMINISTIC BUDGET
                    </h4>
                    <p className="text-xs text-green-700 mt-1">
                      This 4-word code creates the same budget for anyone who
                      uses it with the correct password.
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Code never expires - share with trusted users only
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <h4 className="font-black text-purple-800 text-sm mb-2">
                  HOW TO USE
                </h4>
                <ol className="text-xs text-purple-700 space-y-1">
                  <li>1. Share the code or QR image with trusted users</li>
                  <li>2. They'll scan the QR code or enter the share code</li>
                  <li>
                    3. They'll set their own password for local encryption
                  </li>
                  <li>4. Both of you can now sync to the same budget</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={generateShareCode}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-black transition-colors border-2 border-black"
                >
                  {renderIcon("RefreshCw", "h-4 w-4 mr-2")}
                  NEW CODE
                </button>
                <button
                  onClick={generateNewCode}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-black transition-colors border-2 border-black"
                >
                  {renderIcon("Shuffle", "h-4 w-4 mr-2")}
                  NEW CODE
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <button
                onClick={generateShareCode}
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-black transition-colors border-2 border-black"
              >
                {renderIcon("Share", "h-5 w-5 mr-2")}
                GENERATE SHARE CODE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareCodeModal;
