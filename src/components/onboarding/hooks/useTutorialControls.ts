import { useCallback } from "react";
import useOnboardingStore from "../../../stores/ui/onboardingStore";
import logger from "@/utils/common/logger";
import { TutorialStep } from "./useTutorialPositioning";

/**
 * Hook for tutorial control functions
 * Extracted from OnboardingTutorial.jsx to reduce complexity
 */
export const useTutorialControls = (
  tutorialSteps: TutorialStep[],
  currentStep: number,
  setCurrentStep: (step: number) => void,
  setShowTutorial: (show: boolean) => void
) => {
  const endTutorialStep = useOnboardingStore((state) => state.endTutorialStep);
  const markStepComplete = useOnboardingStore((state) => state.markStepComplete);
  const setPreference = useOnboardingStore((state) => state.setPreference);

  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
    endTutorialStep();
    setPreference("tourCompleted", true);
    logger.info("🏁 Tutorial closed by user");
  }, [setShowTutorial, endTutorialStep, setPreference]);

  const nextStep = useCallback(() => {
    const step = tutorialSteps[currentStep];

    if (currentStep < tutorialSteps.length - 1) {
      if (step?.action) {
        step.action();
        setTimeout(() => {
          setCurrentStep(currentStep + 1);
        }, 200);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      markStepComplete("accountSetup");
      closeTutorial();
    }
  }, [tutorialSteps, currentStep, setCurrentStep, markStepComplete, closeTutorial]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, setCurrentStep]);

  const skipTutorial = useCallback(() => {
    setPreference("showHints", false);
    closeTutorial();
  }, [setPreference, closeTutorial]);

  return {
    closeTutorial,
    nextStep,
    prevStep,
    skipTutorial,
  };
};
