import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils/icons";

// Type definitions
interface TutorialStep {
  title: string;
  description: string;
  selector?: string;
}

interface TooltipPosition {
  top?: string | number;
  left?: string | number;
  bottom?: string | number;
  right?: string | number;
  transform?: string;
  maxWidth?: string;
  width?: string;
}

interface TutorialOverlayProps {
  currentStepElement: Element | null;
  step: TutorialStep;
  currentStep: number;
  tutorialStepsLength: number;
  tooltipPosition: TooltipPosition;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

/**
 * Tutorial overlay component with spotlight effect
 * Extracted from OnboardingTutorial.jsx to reduce complexity
 */
const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  currentStepElement,
  step,
  currentStep,
  tutorialStepsLength,
  tooltipPosition,
  onClose,
  onNext,
  onPrev,
  onSkip,
}) => {
  const getSpotlightStyle = (): string => {
    if (!currentStepElement) return "rgba(0,0,0,0.5)";

    const rect = currentStepElement.getBoundingClientRect();
    const padding = 8;
    return `
      radial-gradient(ellipse at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, 
        transparent ${Math.max(rect.width, rect.height) / 2 + padding}px, 
        rgba(0,0,0,0.7) ${Math.max(rect.width, rect.height) / 2 + padding + 20}px)
    `;
  };

  return (
    <div
      className="fixed inset-0 z-1000"
      style={{
        zIndex: 1000,
        background: getSpotlightStyle(),
      }}
    >
      {/* Tutorial Tooltip */}
      <div
        className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        style={tooltipPosition}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            {React.createElement(getIcon("Target"), {
              className: "w-5 h-5 text-purple-500",
            })}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {tutorialStepsLength}
            </span>
          </div>
          <Button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Close tutorial"
          >
            {React.createElement(getIcon("X"), { className: "w-5 h-5" })}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / tutorialStepsLength) * 100}%`,
            }}
          />
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              onClick={onPrev}
              disabled={currentStep === 0}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {React.createElement(getIcon("ChevronLeft"), {
                className: "w-4 h-4",
              })}
              <span>Back</span>
            </Button>

            <Button
              onClick={onSkip}
              className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Skip Tour
            </Button>
          </div>

          <Button
            onClick={onNext}
            className="flex items-center space-x-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <span>{currentStep === tutorialStepsLength - 1 ? "Finish" : "Next"}</span>
            {currentStep === tutorialStepsLength - 1
              ? React.createElement(getIcon("CheckCircle"), {
                  className: "w-4 h-4",
                })
              : React.createElement(getIcon("ChevronRight"), {
                  className: "w-4 h-4",
                })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
