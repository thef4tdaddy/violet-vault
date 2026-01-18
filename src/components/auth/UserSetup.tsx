import React, { useCallback, useState } from "react";
import { useUserSetup } from "@/hooks/auth/useUserSetup";
import type { UserSetupPayload } from "@/hooks/auth/useUserSetup";
import UserSetupLayout from "./components/UserSetupLayout";
import { useAuth } from "@/hooks/auth/useAuth";
import type { JoinBudgetVariables } from "@/hooks/auth/useAuth.types";
import type { UserSetupProps as UserSetupPropsType } from "@/types/auth";
import UserSetupHeader from "./components/UserSetupHeader";
import PasswordInput from "./components/PasswordInput";
import UserNameInput from "./components/UserNameInput";
import ColorPicker from "./components/ColorPicker";
import ReturningUserActions from "./components/ReturningUserActions";
import StepButtons from "./components/StepButtons";
import ShareCodeDisplay from "./components/ShareCodeDisplay";
import JoinBudgetSection from "./components/JoinBudgetSection";
import JoinBudgetModal from "../sharing/JoinBudgetModal";
import logger from "@/utils/core/common/logger";

/**
 * User Setup Component (Refactored)
 * Multi-step user onboarding and authentication flow
 */
type UserSetupProps = Partial<UserSetupPropsType>;

const UserSetup = ({ onSetupComplete }: UserSetupProps) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const auth = useAuth();
  const { joinBudget } = auth;
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

  const handleJoinSuccess = useCallback(
    async (_joinData?: unknown) => {
      logger.info("Join budget successful, setting up auth", _joinData as Record<string, unknown>);
      try {
        const joinInfo = _joinData as JoinBudgetVariables;
        const result = await joinBudget(joinInfo);
        if (result.success) logger.auth("Shared budget join completed - auth state already set");
      } catch (error) {
        logger.error("Failed to complete join budget setup", error);
      }
    },
    [joinBudget]
  );

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
                onSubmit={() =>
                  handleStep1Continue({ preventDefault: () => {} } as React.FormEvent)
                }
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

      <JoinBudgetSection
        isVisible={step === 1 && !isReturningUser}
        onJoinClick={() => setShowJoinModal(true)}
      />

      <JoinBudgetModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinSuccess={handleJoinSuccess}
      />
    </UserSetupLayout>
  );
};

export default UserSetup;
