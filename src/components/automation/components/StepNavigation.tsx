import React from "react";
import { getIcon } from "../../../utils";

interface StepNavigationProps {
  currentStep: number;
  onStepChange?: (step: number) => void;
}

const StepNavigation = ({ currentStep, onStepChange }: StepNavigationProps) => {
  const steps = [
    { number: 1, title: "Rule Type & Name" },
    { number: 2, title: "Trigger & Schedule" },
    { number: 3, title: "Configuration" },
    { number: 4, title: "Review & Save" },
  ];

  return (
    <div className="mt-4">
      <div className="flex justify-between mb-2">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer ${
              step.number === currentStep
                ? "bg-blue-600 text-white"
                : step.number < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600"
            }`}
            onClick={() => onStepChange?.(step.number)}
          >
            {step.number < currentStep
              ? React.createElement(getIcon("Check"), {
                  className: "h-4 w-4",
                })
              : step.number}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep - 1) * 33.33}%` }}
        />
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-600">
          Step {currentStep} of 4: {steps[currentStep - 1]?.title}
        </p>
      </div>
    </div>
  );
};

export default StepNavigation;
