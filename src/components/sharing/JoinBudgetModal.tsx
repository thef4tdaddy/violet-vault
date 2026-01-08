import React, { useState, useEffect } from "react";
import { shareCodeUtils } from "@/utils/security/shareCodeUtils";
import { useShareCodeValidation } from "@/hooks/platform/sharing/useShareCodeValidation";
import { useBudgetJoining } from "@/hooks/platform/sharing/useBudgetJoining";
import { useQRCodeProcessing } from "@/hooks/platform/sharing/useQRCodeProcessing";
import { generateRandomColor } from "@/utils/sharing/colorUtils";
import ShareCodeStep from "./steps/ShareCodeStep";
import UserSetupStep from "./steps/UserSetupStep";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

interface JoinBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: () => void;
}

/**
 * Join Budget Modal - Enter share codes or scan QR codes to join budgets
 * Refactored to use custom hooks and step components for better maintainability
 * Addresses GitHub Issue #580 - Two-factor authentication for joining
 */
const JoinBudgetModal: React.FC<JoinBudgetModalProps> = ({ isOpen, onClose, onJoinSuccess }) => {
  const [shareCode, setShareCode] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userColor, setUserColor] = useState("#a855f7");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter code, 2: Set password, 3: Join

  // Custom hooks for business logic
  const { shareInfo, creatorInfo, isValidating, validateShareCode, resetValidation } =
    useShareCodeValidation();

  const { isJoining, joinBudget } = useBudgetJoining();

  const { handleQRScan } = useQRCodeProcessing();

  // Check URL for share code on mount
  useEffect(() => {
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlShareCode = urlParams.get("share");
      if (urlShareCode && shareCodeUtils.validateShareCode(urlShareCode)) {
        setShareCode(urlShareCode);
        validateShareCode(urlShareCode);
      }
    }
  }, [isOpen, validateShareCode]); // validateShareCode is stable in Zustand

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShareCode("");
      setPassword("");
      setUserName("");
      setStep(1);
      resetValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetValidation is stable Zustand action
  }, [isOpen]); // resetValidation is stable in Zustand, no need to include

  // Handlers for step actions
  const handleValidateCode = async () => {
    const isValid = await validateShareCode(shareCode);
    if (isValid) {
      setStep(2);
    }
  };

  const handleJoinBudget = async () => {
    await joinBudget({ shareCode, password, userName, userColor, onJoinSuccess, onClose });
  };

  const handleGenerateRandomColor = () => {
    setUserColor(generateRandomColor());
  };

  const handleBack = () => {
    setStep(1);
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
              <span className="text-2xl">J</span>OIN <span className="text-2xl">B</span>UDGET
            </h2>
            <ModalCloseButton onClick={onClose} />
          </div>
          <p className="text-sm text-purple-900 mt-2">
            Join someone else's budget with a share code
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Enter Share Code */}
          {step === 1 && (
            <ShareCodeStep
              shareCode={shareCode}
              setShareCode={setShareCode}
              onValidate={handleValidateCode}
              onQRScan={handleQRScan}
              isValidating={isValidating}
            />
          )}

          {/* Step 2: Set Password & User Details */}
          {step === 2 && shareInfo && (
            <UserSetupStep
              shareInfo={shareInfo}
              creatorInfo={creatorInfo}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              userName={userName}
              setUserName={setUserName}
              userColor={userColor}
              onGenerateRandomColor={handleGenerateRandomColor}
              onJoin={handleJoinBudget}
              onBack={handleBack}
              isJoining={isJoining}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinBudgetModal;
