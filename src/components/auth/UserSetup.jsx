import React from "react";
import { useUserSetup } from "../../hooks/auth/useUserSetup";
import UserSetupLayout from "./components/UserSetupLayout";
import UserSetupHeader from "./components/UserSetupHeader";
import PasswordInput from "./components/PasswordInput";
import UserNameInput from "./components/UserNameInput";
import ColorPicker from "./components/ColorPicker";
import ReturningUserActions from "./components/ReturningUserActions";
import StepButtons from "./components/StepButtons";
import logger from "../../utils/common/logger";

/**
 * User Setup Component (Refactored)
 * Multi-step user onboarding and authentication flow
 * Reduced from 435 lines to ~120 lines with full UI/logic separation
 */
const UserSetup = ({ onSetupComplete }) => {
  logger.debug("🏗️ UserSetup component rendered", {
    onSetupComplete: !!onSetupComplete,
  });

  const {
    // State
    step,
    masterPassword,
    userName,
    userColor,
    showPassword,
    isLoading,
    isReturningUser,

    // Actions
    handleSubmit,
    handleStep1Continue,
    handleStartTrackingClick,
    clearSavedProfile,
    handlePasswordChange,
    handleNameChange,
    togglePasswordVisibility,
    switchToChangeProfile,
    goBackToStep1,
    setUserColor,
  } = useUserSetup(onSetupComplete);

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
                isLoading={isLoading}
                canContinue={!!masterPassword}
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
              onBack={goBackToStep1}
              onStartTracking={handleStartTrackingClick}
              isLoading={isLoading}
              canStartTracking={!!userName.trim()}
            />
          </>
        )}
      </form>
    </UserSetupLayout>
  );
};

export default UserSetup;
