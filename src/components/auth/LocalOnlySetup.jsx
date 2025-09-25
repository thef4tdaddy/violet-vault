import React from "react";
import { useLocalOnlySetup } from "./localOnlySetup/hooks/useLocalOnlySetup";
import { useLocalOnlyStepNavigation } from "./localOnlySetup/hooks/useLocalOnlyStepNavigation";
import LocalOnlyUnsupportedMessage from "./localOnlySetup/steps/LocalOnlyUnsupportedMessage";
import LocalOnlyHeader from "./localOnlySetup/steps/LocalOnlyHeader";
import LocalOnlyErrorDisplay from "./localOnlySetup/steps/LocalOnlyErrorDisplay";
import LocalOnlyWelcome from "./localOnlySetup/steps/LocalOnlyWelcome";
import LocalOnlyCustomizeStep from "./localOnlySetup/steps/LocalOnlyCustomizeStep";
import LocalOnlyImportStep from "./localOnlySetup/steps/LocalOnlyImportStep";

/**
 * LocalOnlySetup - Main component for local-only mode setup wizard
 * Refactored to use extracted step components and custom hooks for better maintainability
 * Reduced from 374 lines to under 75 lines while maintaining exact functionality
 */
const LocalOnlySetup = ({ onModeSelected, onSwitchToAuth }) => {
  // Custom hooks for state management
  const {
    userName,
    setUserName,
    userColor,
    setUserColor,
    importFile,
    setImportFile,
    loading,
    error,
    handleStartLocalOnly,
    handleImportAndStart,
    isLocalOnlyModeSupported,
  } = useLocalOnlySetup();

  const {
    isWelcomeStep,
    isCustomizeStep,
    isImportStep,
    goToWelcome,
    goToCustomize,
    goToImport,
  } = useLocalOnlyStepNavigation();

  // Check browser support
  const support = isLocalOnlyModeSupported();
  if (!support.supported) {
    return <LocalOnlyUnsupportedMessage onSwitchToAuth={onSwitchToAuth} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glassmorphism rounded-2xl w-full max-w-2xl border border-white/30 shadow-2xl overflow-hidden">
        <LocalOnlyHeader />
        <div className="p-6">
          <LocalOnlyErrorDisplay error={error} />
          {isWelcomeStep && (
            <LocalOnlyWelcome
              onStartFresh={goToCustomize}
              onImportData={goToImport}
              onSwitchToAuth={onSwitchToAuth}
              loading={loading}
            />
          )}
          {isCustomizeStep && (
            <LocalOnlyCustomizeStep
              userName={userName}
              setUserName={setUserName}
              userColor={userColor}
              setUserColor={setUserColor}
              onBack={goToWelcome}
              onStartLocalOnly={() => handleStartLocalOnly(onModeSelected)}
              loading={loading}
            />
          )}
          {isImportStep && (
            <LocalOnlyImportStep
              importFile={importFile}
              setImportFile={setImportFile}
              onBack={goToWelcome}
              onImportAndStart={() => handleImportAndStart(onModeSelected)}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalOnlySetup;
