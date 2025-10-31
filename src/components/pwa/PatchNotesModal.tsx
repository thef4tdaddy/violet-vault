import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import useUiStore from "../../stores/ui/uiStore";
import { markVersionAsSeen } from "../../utils/common/version";

/**
 * Patch Notes Modal
 * Shows what's new after app updates
 */
const PatchNotesModal = () => {
  const showPatchNotes = useUiStore((state) => state.showPatchNotes);
  const patchNotesData = useUiStore((state) => state.patchNotesData);
  const loadingPatchNotes = useUiStore((state) => state.loadingPatchNotes);
  const hidePatchNotesModal = useUiStore((state) => state.hidePatchNotesModal);

  if (!showPatchNotes || !patchNotesData) return null;

  const handleClose = () => {
    // Mark the current version as seen so this doesn't show again
    markVersionAsSeen();
    hidePatchNotesModal();
  };

  const handleViewFullNotes = () => {
    // Open GitHub releases page in new tab
    const repoUrl = "https://github.com/thef4tdaddy/violet-vault";
    const releaseUrl = `${repoUrl}/releases/tag/v${patchNotesData.version}`;
    window.open(releaseUrl, "_blank");
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return React.createElement(getIcon("PlusCircle"), {
          className: "w-4 h-4 text-green-600 flex-shrink-0",
        });
      case "fix":
        return React.createElement(getIcon("CheckCircle"), {
          className: "w-4 h-4 text-blue-600 flex-shrink-0",
        });
      case "breaking":
        return React.createElement(getIcon("AlertTriangle"), {
          className: "w-4 h-4 text-orange-600 flex-shrink-0",
        });
      default:
        return React.createElement(getIcon("ArrowRight"), {
          className: "w-4 h-4 text-purple-600 flex-shrink-0",
        });
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "text-green-700";
      case "fix":
        return "text-blue-700";
      case "breaking":
        return "text-orange-700";
      default:
        return "text-gray-700";
    }
  };

  // Get top highlights for display
  const highlights = [];

  // Add features first
  if (patchNotesData.features?.length > 0) {
    highlights.push(
      ...patchNotesData.features.slice(0, 3).map((text) => ({ type: "feature", text }))
    );
  }

  // Add fixes if we have room
  if (highlights.length < 4 && patchNotesData.fixes?.length > 0) {
    const remaining = 4 - highlights.length;
    highlights.push(
      ...patchNotesData.fixes.slice(0, remaining).map((text) => ({ type: "fix", text }))
    );
  }

  // Add other changes if we still have room
  if (highlights.length < 4 && patchNotesData.other?.length > 0) {
    const remaining = 4 - highlights.length;
    highlights.push(
      ...patchNotesData.other.slice(0, remaining).map((text) => ({ type: "other", text }))
    );
  }

  const totalChanges =
    (patchNotesData.features?.length || 0) +
    (patchNotesData.fixes?.length || 0) +
    (patchNotesData.other?.length || 0);

  if (loadingPatchNotes) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glassmorphism rounded-lg max-w-md w-full p-6 border-2 border-black bg-white/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading patch notes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glassmorphism rounded-lg max-w-lg w-full p-6 border-2 border-black bg-white/90 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-black shadow-xl">
            {React.createElement(getIcon("Sparkles"), {
              className: "w-8 h-8 text-white",
            })}
          </div>

          <h2 className="font-black text-black text-xl mb-2">
            🎉 <span className="text-2xl">W</span>HAT'S <span className="text-2xl">N</span>EW
          </h2>

          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-sm text-gray-600">Version</span>
            <span className="font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded border border-purple-200">
              {patchNotesData.version}
            </span>
          </div>

          {patchNotesData.summary && (
            <p className="text-purple-900 text-sm leading-relaxed">{patchNotesData.summary}</p>
          )}
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="bg-purple-50/60 rounded-lg p-4 mb-6 border border-purple-200">
            <h3 className="font-bold text-black text-sm mb-3 flex items-center space-x-2">
              {React.createElement(getIcon("Star"), {
                className: "w-4 h-4 text-purple-600",
              })}
              <span>Key Updates</span>
            </h3>

            <div className="space-y-2 text-sm">
              {highlights.map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  {getChangeIcon(item.type)}
                  <span className={getChangeColor(item.type)}>{item.text}</span>
                </div>
              ))}
            </div>

            {totalChanges > highlights.length && (
              <div className="mt-3 pt-2 border-t border-purple-200">
                <p className="text-xs text-purple-600 font-medium">
                  + {totalChanges - highlights.length} more improvement
                  {totalChanges - highlights.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Update Info */}
        {patchNotesData.isUpdate && patchNotesData.fromVersion && (
          <div className="bg-blue-50/60 rounded-lg p-4 mb-6 border border-blue-200">
            <div className="flex items-center space-x-2 text-sm">
              {React.createElement(getIcon("ArrowUp"), {
                className: "w-4 h-4 text-blue-600",
              })}
              <span className="text-blue-700">
                Updated from <span className="font-mono">{patchNotesData.fromVersion}</span> to{" "}
                <span className="font-mono">{patchNotesData.toVersion}</span>
              </span>
            </div>
          </div>
        )}

        {/* Fallback Notice */}
        {patchNotesData.isFallback && (
          <div className="bg-yellow-50/60 rounded-lg p-3 mb-6 border border-yellow-200">
            <div className="flex items-start space-x-2 text-sm">
              {React.createElement(getIcon("Info"), {
                className: "w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5",
              })}
              <span className="text-yellow-700">
                Full release notes are being loaded. The information above shows general
                improvements.
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleViewFullNotes}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {React.createElement(getIcon("ExternalLink"), {
              className: "w-4 h-4",
            })}
            <span>View Full Release Notes</span>
          </Button>

          <Button
            onClick={handleClose}
            className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-lg border-2 border-black shadow-lg hover:bg-gray-50 transition-colors"
          >
            Continue Using VioletVault
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Thanks for using VioletVault! We're constantly improving your budgeting experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatchNotesModal;
