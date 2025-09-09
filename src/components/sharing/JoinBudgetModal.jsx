import React, { useState, useEffect } from "react";
import { renderIcon } from "../../utils";
import { budgetSharingService } from "../../utils/sharing/budgetSharingService";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import logger from "../../utils/common/logger";

/**
 * Join Budget Modal - Enter share codes or scan QR codes to join budgets
 * Addresses GitHub Issue #580 - Two-factor authentication for joining
 */
const JoinBudgetModal = ({ isOpen, onClose, onJoinSuccess }) => {
  const [shareCode, setShareCode] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userColor, setUserColor] = useState("#a855f7");
  const [shareInfo, setShareInfo] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter code, 2: Set password, 3: Join

  const { showSuccessToast, showErrorToast } = useToastHelpers();

  // Check URL for share code on mount
  useEffect(() => {
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlShareCode = urlParams.get("share");
      if (urlShareCode && urlShareCode.match(/^VV-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
        setShareCode(urlShareCode);
        validateShareCode(urlShareCode);
      }
    }
  }, [isOpen]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShareCode("");
      setPassword("");
      setUserName("");
      setShareInfo(null);
      setStep(1);
    }
  }, [isOpen]);

  const validateShareCode = async (code = shareCode) => {
    if (!code.trim()) {
      logger.warn("validateShareCode called with empty code");
      return;
    }

    logger.info("Validating share code", { code: code.trim() });
    setIsValidating(true);
    try {
      const result = await budgetSharingService.validateShareCode(
        code.toUpperCase().trim(),
      );
      logger.info("Share code validation result", result);

      if (result.valid) {
        setShareInfo(result.shareData);
        setStep(2);
        showSuccessToast("Share code is valid! Now set your password.");
      } else {
        logger.warn("Share code validation failed", result);
        showErrorToast(result.error || "Invalid share code");
        setShareInfo(null);
      }
    } catch (error) {
      logger.error("Failed to validate share code", error);
      showErrorToast("Failed to validate share code");
      setShareInfo(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoinBudget = async () => {
    if (!shareCode || !password || !userName.trim()) {
      showErrorToast("Please fill in all required fields");
      return;
    }

    setIsJoining(true);
    try {
      const userInfo = {
        id: `user_${Date.now()}`,
        userName: userName.trim(),
        userColor,
        joinedVia: "shareCode",
        joinedAt: Date.now(),
      };

      const result = await budgetSharingService.joinBudgetWithCode(
        shareCode.toUpperCase().trim(),
        password,
        userInfo,
      );

      if (result.success) {
        showSuccessToast(`Successfully joined ${result.sharedBy}'s budget!`);

        // Call parent success handler with the joined budget info
        if (onJoinSuccess) {
          onJoinSuccess({
            budgetId: result.budgetId,
            password,
            userInfo,
            sharedBy: result.sharedBy,
            userCount: result.userCount,
          });
        }

        onClose();

        // Clear URL parameter
        const url = new URL(window.location);
        url.searchParams.delete("share");
        window.history.replaceState({}, "", url);
      }
    } catch (error) {
      logger.error("Failed to join budget", error);
      showErrorToast(error.message || "Failed to join budget");
    } finally {
      setIsJoining(false);
    }
  };

  const handleQRScan = () => {
    // TODO: Implement camera-based QR scanning
    showErrorToast(
      "QR scanning not yet implemented. Please enter the share code manually.",
    );
  };

  const generateRandomColor = () => {
    const colors = [
      "#ef4444", // red
      "#f97316", // orange
      "#eab308", // yellow
      "#22c55e", // green
      "#06b6d4", // cyan
      "#3b82f6", // blue
      "#a855f7", // purple
      "#ec4899", // pink
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setUserColor(randomColor);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border-2 border-black max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-black">
              <span className="text-2xl">J</span>OIN{" "}
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
            Join someone else's budget with a share code
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Enter Share Code */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                  Share Code or QR Code
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareCode}
                      onChange={(e) =>
                        setShareCode(e.target.value.toUpperCase())
                      }
                      placeholder="VV-XXXX-XXXX"
                      className="flex-1 px-4 py-3 bg-white border-2 border-black rounded-lg text-lg font-mono text-center tracking-wider uppercase"
                      maxLength={11}
                    />
                    <button
                      onClick={handleQRScan}
                      className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-black transition-colors border-2 border-black"
                      title="Scan QR Code"
                    >
                      {renderIcon("QrCode", "h-5 w-5")}
                    </button>
                  </div>

                  <button
                    onClick={() => validateShareCode()}
                    disabled={!shareCode.trim() || isValidating}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-black transition-colors border-2 border-black disabled:opacity-50"
                  >
                    {isValidating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                        VALIDATING...
                      </>
                    ) : (
                      <>
                        {renderIcon("Search", "h-4 w-4 mr-2")}
                        VALIDATE CODE
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <h4 className="font-black text-purple-800 text-sm mb-2">
                  HOW TO JOIN
                </h4>
                <ol className="text-xs text-purple-700 space-y-1">
                  <li>1. Get a share code from the budget owner</li>
                  <li>2. Enter the code above or scan their QR code</li>
                  <li>3. Set your own password for local encryption</li>
                  <li>4. Choose your display name and color</li>
                </ol>
              </div>
            </>
          )}

          {/* Step 2: Share Code Info & Password Setup */}
          {step === 2 && shareInfo && (
            <>
              {/* Share Info */}
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {renderIcon("CheckCircle", "h-5 w-5 text-green-600 mt-0.5")}
                  <div>
                    <h4 className="font-black text-green-800 text-sm">
                      VALID SHARE CODE
                    </h4>
                    <p className="text-xs text-green-700 mt-1">
                      Created by: <strong>{shareInfo.createdBy}</strong>
                    </p>
                    <p className="text-xs text-green-700">
                      Users: {shareInfo.userCount}
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Expires: {new Date(shareInfo.expiresAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Setup */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                    Your Display Name *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                    Your Color
                  </label>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full border-2 border-black"
                      style={{ backgroundColor: userColor }}
                    />
                    <input
                      type="color"
                      value={userColor}
                      onChange={(e) => setUserColor(e.target.value)}
                      className="w-16 h-12 rounded border-2 border-black cursor-pointer"
                    />
                    <button
                      onClick={generateRandomColor}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-black transition-colors border-2 border-black text-xs"
                    >
                      RANDOM
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                    Your Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Choose a secure password"
                      className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                    >
                      {renderIcon(showPassword ? "EyeOff" : "Eye", "h-5 w-5")}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    This encrypts your local data. Different from the share
                    code!
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-black transition-colors border-2 border-black"
                >
                  {renderIcon("ArrowLeft", "h-4 w-4 mr-2")}
                  BACK
                </button>
                <button
                  onClick={handleJoinBudget}
                  disabled={
                    !shareCode || !password || !userName.trim() || isJoining
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-black transition-colors border-2 border-black disabled:opacity-50"
                >
                  {isJoining ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                      JOINING...
                    </>
                  ) : (
                    <>
                      {renderIcon("UserPlus", "h-4 w-4 mr-2")}
                      JOIN BUDGET
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinBudgetModal;
