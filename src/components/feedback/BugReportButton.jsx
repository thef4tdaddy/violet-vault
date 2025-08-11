import React from "react";
import { Bug, Camera, Send, X, AlertCircle } from "lucide-react";
import useBugReport from "../../hooks/useBugReport";

/**
 * Floating bug report button with screenshot capability
 * Pure UI component that uses useBugReport hook for logic
 */
const BugReportButton = () => {
  const {
    isModalOpen,
    description,
    includeScreenshot,
    isSubmitting,
    screenshot,
    openModal,
    closeModal,
    setDescription,
    setIncludeScreenshot,
    submitReport,
    previewScreenshot,
  } = useBugReport();

  const handleSubmit = async () => {
    const result = await submitReport();
    if (result) {
      // Show success message with GitHub issue link if available
      if (result.issueUrl) {
        const message = `Thanks! Your bug report has been submitted.\n\nGitHub Issue: ${result.issueUrl}\n\nClick OK to view the issue.`;
        if (confirm(message)) {
          window.open(result.issueUrl, "_blank");
        }
      } else if (result.localFallback) {
        // Service unavailable, but we logged it locally
        alert(
          `Thanks! Your bug report has been logged locally.\n\nThe bug report service is temporarily unavailable (${result.fallbackReason}), but your report including screenshot and session data has been saved to the browser console for manual review.\n\nPlease check the browser console (F12) for the full report details.`,
        );
      } else {
        alert(
          "Thanks! Your bug report has been submitted. Check the console for details.",
        );
      }
    } else {
      alert(
        "Failed to submit bug report. Please try again or check the browser console for error details.",
      );
    }
  };

  return (
    <>
      {/* Floating Bug Report Button */}
      <button
        onClick={openModal}
        className="fixed bottom-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
        title="Report a Problem"
        data-bug-report="true"
      >
        <Bug className="h-5 w-5" />
      </button>

      {/* Bug Report Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          data-bug-report="true"
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            data-bug-report="true"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Report a Problem
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the problem
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened? What were you trying to do?"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeScreenshot}
                    onChange={(e) => setIncludeScreenshot(e.target.checked)}
                    className="mr-2 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">
                    Include screenshot
                  </span>
                </label>

                {includeScreenshot && (
                  <button
                    onClick={previewScreenshot}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Preview
                  </button>
                )}
              </div>

              {screenshot && (
                <div className="border border-gray-200 rounded-lg p-2">
                  <img
                    src={screenshot}
                    alt="Screenshot preview"
                    className="w-full h-32 object-contain rounded"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">
                    Screenshot captured
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!description.trim() || isSubmitting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Your report will help us improve VioletVault.
              {includeScreenshot &&
                " Screenshots may contain sensitive info - review before submitting."}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default BugReportButton;
