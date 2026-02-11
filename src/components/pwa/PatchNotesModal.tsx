import React, { useMemo } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";
import useUiStore, { type UiStore } from "@/stores/ui/uiStore";
import { markVersionAsSeen } from "@/utils/core/common/version";

type ChangeType = "feature" | "fix" | "breaking" | "other";

type PatchNotesData = {
  version: string;
  summary?: string;
  features?: string[];
  fixes?: string[];
  breaking?: string[];
  other?: string[];
  isUpdate?: boolean;
  fromVersion?: string;
  toVersion?: string;
  isFallback?: boolean;
};

const buildHighlightsList = (data: PatchNotesData): Array<{ type: ChangeType; text: string }> => {
  if (!data) return [];

  const highlights: Array<{ type: ChangeType; text: string }> = [];

  if (data.features?.length) {
    highlights.push(
      ...data.features.slice(0, 4).map((text) => ({ type: "feature" as const, text }))
    );
  }

  if (highlights.length < 4 && data.breaking?.length) {
    const remaining = 4 - highlights.length;
    highlights.push(
      ...data.breaking.slice(0, remaining).map((text) => ({ type: "breaking" as const, text }))
    );
  }

  if (highlights.length < 4 && data.fixes?.length) {
    const remaining = 4 - highlights.length;
    highlights.push(
      ...data.fixes.slice(0, remaining).map((text) => ({ type: "fix" as const, text }))
    );
  }

  if (highlights.length < 4 && data.other?.length) {
    const remaining = 4 - highlights.length;
    highlights.push(
      ...data.other.slice(0, remaining).map((text) => ({ type: "other" as const, text }))
    );
  }

  return highlights.slice(0, 4);
};

const getChangeIcon = (type: ChangeType): React.ReactNode => {
  const iconMap: Record<ChangeType, { icon: string; color: string }> = {
    feature: { icon: "PlusCircle", color: "text-green-600" },
    fix: { icon: "CheckCircle", color: "text-blue-600" },
    breaking: { icon: "AlertTriangle", color: "text-orange-600" },
    other: { icon: "Sparkles", color: "text-purple-600" },
  };

  const { icon, color } = iconMap[type];
  return React.createElement(getIcon(icon), {
    className: `w-4 h-4 ${color} flex-shrink-0 mt-0.5`,
  });
};

const getChangeColor = (type: ChangeType): string => {
  const colorMap: Record<ChangeType, string> = {
    feature: "text-green-700",
    fix: "text-blue-700",
    breaking: "text-orange-700",
    other: "text-purple-700",
  };

  return colorMap[type];
};

/**
 * Patch Notes Modal
 * Shows what's new after app updates
 */
const PatchNotesModal: React.FC = () => {
  const showPatchNotes = useUiStore((state: UiStore) => state.showPatchNotes);
  const patchNotesData = useUiStore(
    (state: UiStore) => state.patchNotesData
  ) as PatchNotesData | null;
  const loadingPatchNotes = useUiStore((state: UiStore) => state.loadingPatchNotes);
  const hidePatchNotesModal = useUiStore((state: UiStore) => state.hidePatchNotesModal);
  const shouldRender = showPatchNotes && Boolean(patchNotesData);
  const modalRef = useModalAutoScroll(shouldRender);

  const highlights: Array<{ type: ChangeType; text: string }> = useMemo(() => {
    if (!patchNotesData) {
      return [];
    }
    return buildHighlightsList(patchNotesData);
  }, [patchNotesData]);

  const totalChanges = useMemo(() => {
    if (!patchNotesData) return 0;
    return (
      (patchNotesData.features?.length || 0) +
      (patchNotesData.fixes?.length || 0) +
      (patchNotesData.other?.length || 0)
    );
  }, [patchNotesData]);

  if (!shouldRender) return null;

  const handleClose = (): void => {
    // Mark the current version as seen so this doesn't show again
    markVersionAsSeen();
    hidePatchNotesModal();
  };

  const handleViewFullNotes = (): void => {
    if (!patchNotesData) return;
    // Open GitHub releases page in new tab
    const repoUrl = "https://github.com/thef4tdaddy/violet-vault";
    const releaseUrl = `${repoUrl}/releases/tag/v${patchNotesData.version}`;
    window.open(releaseUrl, "_blank");
  };

  if (loadingPatchNotes) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          ref={modalRef}
          className="glassmorphism rounded-lg max-w-md w-full p-6 border-2 border-black bg-white/90 backdrop-blur-sm my-auto"
        >
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Loading Patch Notes</h3>
            <ModalCloseButton onClick={handleClose} />
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading patch notes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Guard against null patchNotesData
  if (!patchNotesData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className="glassmorphism rounded-lg max-w-lg w-full p-6 border-2 border-black bg-white/90 backdrop-blur-sm max-h-[90vh] overflow-y-auto my-auto"
      >
        {/* Header */}
        <div className="text-center mb-6 relative">
          <div className="absolute top-0 right-0">
            <ModalCloseButton onClick={handleClose} />
          </div>
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
        {patchNotesData.isUpdate && patchNotesData.fromVersion && patchNotesData.toVersion && (
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
