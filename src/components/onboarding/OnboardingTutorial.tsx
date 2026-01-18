import React, { useState, useEffect } from "react";
import useOnboardingStore from "@/stores/ui/onboardingStore";
import { useShallow } from "zustand/react/shallow";
import logger from "@/utils/core/common/logger";
import { useTutorialSteps } from "./hooks/useTutorialSteps";
import { useTutorialPositioning } from "./hooks/useTutorialPositioning";
import { useTutorialHighlight } from "./hooks/useTutorialHighlight";
import { useTutorialControls } from "./hooks/useTutorialControls";
import TutorialOverlay from "./components/TutorialOverlay";

interface OnboardingState {
  isOnboarded: boolean;
  getProgress: () => { completed: number };
  preferences: { showHints: boolean; tourCompleted: boolean };
}

/**
 * OnboardingTutorial - Provides guided tours and contextual hints for new users
 */
const OnboardingTutorial = ({ children }: { children: React.ReactNode }) => {
  const { isOnboarded, getProgress, preferences } = useOnboardingStore(
    useShallow(
      (state): OnboardingState => ({
        isOnboarded: (state as OnboardingState).isOnboarded,
        getProgress: (state as OnboardingState).getProgress,
        preferences: (state as OnboardingState).preferences,
      })
    )
  );

  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Use extracted hooks
  const { tutorialSteps, getCurrentStepElement } = useTutorialSteps();
  const { getTooltipPosition } = useTutorialPositioning();
  const { useHighlightEffect } = useTutorialHighlight();
  const { closeTutorial, nextStep, prevStep, skipTutorial } = useTutorialControls(
    tutorialSteps,
    currentStep,
    setCurrentStep,
    setShowTutorial
  );

  // Get current step data
  const step = tutorialSteps[currentStep];
  const currentStepElement = getCurrentStepElement(currentStep);

  // Show tutorial for new users
  useEffect(() => {
    if (!isOnboarded && preferences.showHints && !preferences.tourCompleted) {
      const progress = getProgress();
      const isTrulyNew = progress.completed === 0;
      const delay = isTrulyNew ? 500 : 1000;

      const timer = setTimeout(() => {
        setShowTutorial(true);
        logger.info("🎯 Starting onboarding tutorial", {
          progress: progress.completed,
          isTrulyNew,
          delay,
        });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isOnboarded, preferences, getProgress]); // getProgress is stable in Zustand

  // Handle escape key to close tutorial
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showTutorial) {
        closeTutorial();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]); // closeTutorial is stable (store actions are stable)

  // Use highlight effect hook
  useHighlightEffect(showTutorial, currentStepElement);

  if (!showTutorial || isOnboarded) {
    return children;
  }

  // Get tooltip position
  const tooltipPosition = getTooltipPosition(currentStepElement, step);

  return (
    <>
      {children}
      {showTutorial && (
        <TutorialOverlay
          currentStepElement={currentStepElement}
          step={step}
          currentStep={currentStep}
          tutorialStepsLength={tutorialSteps.length}
          tooltipPosition={tooltipPosition}
          onClose={closeTutorial}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTutorial}
        />
      )}
    </>
  );
};

export default OnboardingTutorial;
