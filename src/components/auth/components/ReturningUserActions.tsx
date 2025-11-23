import { Button } from "@/components/ui";
import StylizedButtonText from "@/components/ui/StylizedButtonText";
import React from "react";

interface ReturningUserActionsProps {
  onSubmit: () => void;
  onChangeProfile: () => void;
  onStartFresh: () => void;
  isLoading: boolean;
  canSubmit: boolean;
}

/**
 * Returning User Actions Component
 * Login, change profile, and start fresh buttons for returning users
 * Extracted from UserSetup with UI standards compliance
 */
const ReturningUserActions: React.FC<ReturningUserActionsProps> = ({
  onSubmit,
  onChangeProfile,
  onStartFresh,
  isLoading,
  canSubmit,
}) => {
  return (
    <div className="space-y-3">
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={!canSubmit || isLoading}
        className="w-full btn btn-primary py-4 text-lg font-black rounded-lg border-2 border-black uppercase tracking-wider"
      >
        {isLoading ? (
          <StylizedButtonText firstLetterClassName="text-xl">UNLOCKING...</StylizedButtonText>
        ) : (
          <StylizedButtonText firstLetterClassName="text-xl">LOGIN</StylizedButtonText>
        )}
      </Button>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={onChangeProfile}
          disabled={isLoading}
          className="flex-1 py-3 text-sm font-black rounded-lg border-2 border-black bg-orange-600 hover:bg-orange-700 text-white uppercase tracking-wider"
        >
          <StylizedButtonText>CHANGE PROFILE</StylizedButtonText>
        </Button>
        <Button
          type="button"
          onClick={onStartFresh}
          disabled={isLoading}
          className="flex-1 py-3 text-sm font-black rounded-lg border-2 border-black bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
        >
          <StylizedButtonText>START FRESH</StylizedButtonText>
        </Button>
      </div>
    </div>
  );
};

export default ReturningUserActions;
