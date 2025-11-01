import { Button } from "@/components/ui";

/**
 * Returning User Actions Component
 * Login, change profile, and start fresh buttons for returning users
 * Extracted from UserSetup with UI standards compliance
 */
const ReturningUserActions = ({
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
          <span>
            <span className="text-xl">U</span>NLOCKING...
          </span>
        ) : (
          <span>
            <span className="text-xl">L</span>OGIN
          </span>
        )}
      </Button>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={onChangeProfile}
          disabled={isLoading}
          className="flex-1 py-3 text-sm font-black rounded-lg border-2 border-black bg-orange-600 hover:bg-orange-700 text-white uppercase tracking-wider"
        >
          <span>
            <span className="text-base">C</span>HANGE{" "}
            <span className="text-base">P</span>ROFILE
          </span>
        </Button>
        <Button
          type="button"
          onClick={onStartFresh}
          disabled={isLoading}
          className="flex-1 py-3 text-sm font-black rounded-lg border-2 border-black bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
        >
          <span>
            <span className="text-base">S</span>TART{" "}
            <span className="text-base">F</span>RESH
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ReturningUserActions;
