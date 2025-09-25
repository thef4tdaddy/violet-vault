import { useState, useCallback } from "react";
import { SETUP_STEPS } from "../utils/localOnlySetupUtils";

/**
 * Hook for managing step navigation in local-only setup
 * Extracted from LocalOnlySetup.jsx to reduce component complexity
 */
export const useLocalOnlyStepNavigation = () => {
  const [step, setStep] = useState(SETUP_STEPS.WELCOME);

  // Navigate to welcome step
  const goToWelcome = useCallback(() => {
    setStep(SETUP_STEPS.WELCOME);
  }, []);

  // Navigate to customize step
  const goToCustomize = useCallback(() => {
    setStep(SETUP_STEPS.CUSTOMIZE);
  }, []);

  // Navigate to import step
  const goToImport = useCallback(() => {
    setStep(SETUP_STEPS.IMPORT);
  }, []);

  return {
    step,
    setStep,
    goToWelcome,
    goToCustomize,
    goToImport,
    isWelcomeStep: step === SETUP_STEPS.WELCOME,
    isCustomizeStep: step === SETUP_STEPS.CUSTOMIZE,
    isImportStep: step === SETUP_STEPS.IMPORT,
  };
};