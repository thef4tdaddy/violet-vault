import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import useUiStore from "@/stores/ui/uiStore";
import patchNotesManager from "@/utils/pwa/patchNotesManager";
import { APP_VERSION } from "@/utils/common/version";
import logger from "@/utils/common/logger";

interface PatchNote {
  type: "feature" | "fix" | "breaking" | "other";
  text: string;
}

/**
 * Hook to fetch patch notes
 */
const usePatchNotes = (shouldFetch: boolean) => {
  const [patchNotes, setPatchNotes] = useState<PatchNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    if (!shouldFetch) return;
    
    const fetchNotes = async () => {
      try {
        const notes = await patchNotesManager.getPatchNotesForVersion(APP_VERSION);
        if (notes && notes.hasContent) {
          const highlights = patchNotesManager.getTopHighlights(notes);
          setPatchNotes(highlights);
          logger.info("Loaded patch notes for version popup", { version: APP_VERSION });
        }
      } catch (error) {
        logger.warn("Could not load patch notes for popup", error);
      } finally {
        setLoadingNotes(false);
      }
    };
    
    fetchNotes();
  }, [shouldFetch]);

  return { patchNotes, loadingNotes };
};

/**
 * Update Available Modal
 * Shows when a new version of the PWA is available
 * Displays actual patch notes when available (for release builds)
 */
const UpdateAvailableModal: React.FC = () => {
  const updateAvailable = useUiStore((state) => state.updateAvailable);
  const isUpdating = useUiStore((state) => state.isUpdating);
  const setUpdateAvailable = useUiStore((state) => state.setUpdateAvailable);
  const updateApp = useUiStore((state) => state.updateApp);
  
  const { patchNotes, loadingNotes } = usePatchNotes(updateAvailable);

  if (!updateAvailable) return null;

  const handleUpdate = async (): Promise<void> => {
    await updateApp();
  };

  const handleDismiss = (): void => {
    setUpdateAvailable(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glassmorphism rounded-lg max-w-md w-full p-6 border-2 border-black bg-white/90 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-black shadow-xl">
            {React.createElement(getIcon("Download"), {
              className: "w-8 h-8 text-white",
            })}
          </div>

          <h2 className="font-black text-black text-xl mb-2">
            🚀 <span className="text-2xl">N</span>EW <span className="text-2xl">V</span>ERSION{" "}
            <span className="text-2xl">R</span>EADY!
          </h2>

          <p className="text-purple-900 text-sm leading-relaxed">
            We've updated VioletVault with new features and fixes. Update now to get the latest
            improvements.
          </p>
        </div>

        {/* Features Preview */}
        <div className="bg-purple-50/60 rounded-lg p-4 mb-6 border border-purple-200">
          {loadingNotes ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-sm text-gray-600">Loading release notes...</span>
            </div>
          ) : patchNotes.length > 0 ? (
            <div className="space-y-2 text-sm">
              {patchNotes.map((note, index) => {
                const iconName =
                  note.type === "feature"
                    ? "PlusCircle"
                    : note.type === "fix"
                      ? "CheckCircle"
                      : note.type === "breaking"
                        ? "AlertTriangle"
                        : "CheckCircle";
                const iconColor =
                  note.type === "feature"
                    ? "text-green-600"
                    : note.type === "fix"
                      ? "text-blue-600"
                      : note.type === "breaking"
                        ? "text-orange-600"
                        : "text-purple-600";

                return (
                  <div key={index} className="flex items-start space-x-2">
                    {React.createElement(getIcon(iconName), {
                      className: `w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`,
                    })}
                    <span className="text-gray-700 flex-1">{note.text}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                {React.createElement(getIcon("CheckCircle"), {
                  className: "w-4 h-4 text-green-600 flex-shrink-0",
                })}
                <span className="text-gray-700">Latest security updates</span>
              </div>
              <div className="flex items-center space-x-2">
                {React.createElement(getIcon("CheckCircle"), {
                  className: "w-4 h-4 text-green-600 flex-shrink-0",
                })}
                <span className="text-gray-700">Performance improvements</span>
              </div>
              <div className="flex items-center space-x-2">
                {React.createElement(getIcon("CheckCircle"), {
                  className: "w-4 h-4 text-green-600 flex-shrink-0",
                })}
                <span className="text-gray-700">Enhanced offline functionality</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                {React.createElement(getIcon("RefreshCw"), {
                  className: "w-4 h-4",
                })}
                <span>Update Now</span>
              </>
            )}
          </Button>

          <Button
            onClick={handleDismiss}
            disabled={isUpdating}
            className="w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remind Me Later
          </Button>
        </div>

        {/* Update Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Updates happen automatically in the background.
            <br />
            This ensures you always have the latest features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdateAvailableModal;
