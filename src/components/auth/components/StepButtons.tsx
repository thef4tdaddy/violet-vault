import React from "react";

/**
 * Step Navigation Buttons Component
 * Continue, back, and start tracking buttons for multi-step flow
 * Extracted from UserSetup with UI standards compliance
 */
const StepButtons = ({
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
      <button
        type="submit"
        onClick={onContinue}
        disabled={!canContinue || isLoading}
        className="w-full btn btn-primary py-4 text-lg font-black rounded-lg border-2 border-black uppercase tracking-wider"
      >
        {isLoading ? "Creating..." : "Continue"}
      </button>
    );
  }

  // Step 2 buttons (back + start tracking)
  if (step === 2) {
    return (
      <div className="flex gap-3">
        {showBackButton && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 btn btn-secondary py-3 rounded-lg border-2 border-black font-black uppercase tracking-wider"
            disabled={isLoading}
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onStartTracking}
          disabled={!canStartTracking || isLoading}
          className="flex-1 btn btn-primary py-3 rounded-lg border-2 border-black font-black uppercase tracking-wider"
        >
          {isLoading ? "Setting up..." : "Start Tracking"}
        </button>
      </div>
    );
  }

  return null;
};

export default StepButtons;
