import { useCallback, useState } from "react";
import { Button } from "@/components/ui";
import { useUserSetup } from "@/hooks/auth/useUserSetup";
import type { UserSetupPayload } from "@/hooks/auth/useUserSetup";
import type { UserSetupProps as UserSetupPropsType } from "@/types/auth";
import UserSetupLayout from "./components/UserSetupLayout";
import UserSetupHeader from "./components/UserSetupHeader";
import PasswordInput from "./components/PasswordInput";
import UserNameInput from "./components/UserNameInput";
import ColorPicker from "./components/ColorPicker";
import ReturningUserActions from "./components/ReturningUserActions";
import StepButtons from "./components/StepButtons";
import ShareCodeDisplay from "./components/ShareCodeDisplay";
import JoinBudgetModal from "../sharing/JoinBudgetModal";
import { useAuthManager } from "@/hooks/auth/useAuthManager";
import { renderIcon } from "@/utils";
import logger from "@/utils/common/logger";

/**
 * User Setup Component (Refactored)
 * Multi-step user onboarding and authentication flow
 * Reduced from 435 lines to ~120 lines with full UI/logic separation
 */
type UserSetupProps = Partial<UserSetupPropsType>;

const UserSetup = ({ onSetupComplete }: UserSetupProps) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const authManager = useAuthManager();
  const joinBudget = authManager.joinBudget as (data: unknown) => Promise<{ success: boolean }>;

  const handleSetupComplete = useCallback(
    async (payload: UserSetupPayload) => {
      if (!onSetupComplete) {
        logger.warn("onSetupComplete handler missing during user setup", {
          payloadType: typeof payload,
        });
        return;
      }

      await onSetupComplete(payload);
    },
    [onSetupComplete]
  );

  // Removed noisy debug log - component renders on every prop change/keystroke

  const {
    // State
    step,
    masterPassword,
    userName,
    userColor,
    showPassword,
    isLoading,
    isReturningUser,
    shareCode,

    // Actions
    handleSubmit,
    handleStep1Continue,
    handleStartTrackingClick,
    handleCreateBudget,
    clearSavedProfile,
    handlePasswordChange,
    handleNameChange,
    togglePasswordVisibility,
    switchToChangeProfile,
    goBackToStep1,
    goBackToStep2,
    setUserColor,
  } = useUserSetup(handleSetupComplete);

  const handleJoinSuccess = async (joinData) => {
    logger.info("Join budget successful, setting up auth", joinData);

    try {
      const result = await joinBudget(joinData);
      if (result.success) {
        // Don't call onSetupComplete for shared budget joins -
        // the auth state is already set by joinBudget
        logger.auth("Shared budget join completed - auth state already set");
        // The AuthGateway will automatically hide once shouldShowAuthGateway returns false
      }
    } catch (error) {
      logger.error("Failed to complete join budget setup", error);
    }
  };

  return (
    <UserSetupLayout>
      <UserSetupHeader
        step={step}
        isReturningUser={isReturningUser}
        userName={userName}
        userColor={userColor}
      />

      <form
        onSubmit={isReturningUser || step === 1 ? handleStep1Continue : handleSubmit}
        className="space-y-6"
      >
        {/* Password Input (Step 1 and Returning Users) */}
        {(step === 1 || isReturningUser) && (
          <>
            <PasswordInput
              value={masterPassword}
              onChange={handlePasswordChange}
              showPassword={showPassword}
              onToggleVisibility={togglePasswordVisibility}
              disabled={isLoading}
            />

            {isReturningUser ? (
              <ReturningUserActions
                onSubmit={handleStep1Continue}
                onChangeProfile={switchToChangeProfile}
                onStartFresh={clearSavedProfile}
                isLoading={isLoading}
                canSubmit={!!masterPassword}
              />
            ) : (
              <StepButtons
                step={step}
                onContinue={handleStep1Continue}
                onBack={() => {}}
                onStartTracking={() => {}}
                isLoading={isLoading}
                canContinue={!!masterPassword}
                canStartTracking={false}
              />
            )}
          </>
        )}

        {/* User Profile Setup (Step 2) */}
        {step === 2 && !isReturningUser && (
          <>
            <UserNameInput value={userName} onChange={handleNameChange} disabled={isLoading} />

            <ColorPicker
              selectedColor={userColor}
              onColorChange={setUserColor}
              disabled={isLoading}
            />

            <StepButtons
              step={step}
              onContinue={() => {}}
              onBack={goBackToStep1}
              onStartTracking={handleStartTrackingClick}
              isLoading={isLoading}
              canContinue={false}
              canStartTracking={!!userName.trim()}
            />
          </>
        )}

        {/* Share Code Display (Step 3) */}
        {step === 3 && !isReturningUser && (
          <ShareCodeDisplay
            shareCode={shareCode}
            onCreateBudget={handleCreateBudget}
            onBack={goBackToStep2}
            isLoading={isLoading}
          />
        )}
      </form>

      {/* Join Budget Option - Always visible */}
      {step === 1 && !isReturningUser && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="text-center">
            <p className="text-sm text-purple-900 mb-3">Already have a shared budget?</p>
            <Button
              type="button"
              onClick={() => setShowJoinModal(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-black transition-colors border-2 border-black flex items-center justify-center gap-2"
            >
              {renderIcon("UserPlus", { className: "h-4 w-4" })}
              JOIN SHARED BUDGET
            </Button>
          </div>
        </div>
      )}

      {/* Join Budget Modal */}
      <JoinBudgetModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinSuccess={handleJoinSuccess}
      />
    </UserSetupLayout>
  );
};

export default UserSetup;
