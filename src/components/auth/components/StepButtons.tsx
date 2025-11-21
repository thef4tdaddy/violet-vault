import React from "react";
import { Button } from "@/components/ui";

interface StepButtonsProps {
  step: number;
  onContinue?: (e: React.SyntheticEvent) => void;
  onBack?: () => void;
  onStartTracking?: (e: React.SyntheticEvent) => void;
  isLoading: boolean;
  canContinue?: boolean;
  canStartTracking?: boolean;
  showBackButton?: boolean;
}

/**
 * Step Navigation Buttons Component
 * Continue, back, and start tracking buttons for multi-step flow
 * Extracted from UserSetup with UI standards compliance
 */
const StepButtons: React.FC<StepButtonsProps> = ({
  step,
  onContinue,
  onBack,
  onStartTracking,
  isLoading,
  canContinue,
  canStartTracking,
  showBackButton = true,
}) => {
  // Step 1 continue button (for new users)
  if (step === 1) {
    return (
      <Button
        type="submit"
        onClick={onContinue}
        disabled={!canContinue || isLoading}
        className="w-full btn btn-primary py-4 text-lg font-black rounded-lg border-2 border-black uppercase tracking-wider"
      >
        {isLoading ? "Creating..." : "Continue"}
      </Button>
    );
  }

  // Step 2 buttons (back + start tracking)
  if (step === 2) {
    return (
      <div className="flex gap-3">
        {showBackButton && (
          <Button
            type="button"
            onClick={onBack}
            className="flex-1 btn btn-secondary py-3 rounded-lg border-2 border-black font-black uppercase tracking-wider"
            disabled={isLoading}
          >
            Back
          </Button>
        )}
        <Button
          type="button"
          onClick={onStartTracking}
          disabled={!canStartTracking || isLoading}
          className="flex-1 btn btn-primary py-3 rounded-lg border-2 border-black font-black uppercase tracking-wider"
        >
          {isLoading ? "Setting up..." : "Start Tracking"}
        </Button>
      </div>
    );
  }

  return null;
};

export default StepButtons;
