import React from "react";
import { getIcon } from "../../utils";
import useBugReportV2 from "../../hooks/common/useBugReportV2";
import useToast from "../../hooks/common/useToast";
import logger from "../../utils/common/logger";

/**
 * Floating bug report button with screenshot capability
 * Enhanced to use all V2 hook features for comprehensive bug reporting
 */
const BugReportButton = () => {
  const {
    isModalOpen,
    title,
    description,
    steps,
    expected,
    actual,
    includeScreenshot,
    isSubmitting,
    screenshot,
    severity,
    openModal,
    closeModal,
    setTitle,
    setDescription,
    setSteps,
    setExpected,
    setActual,
    setIncludeScreenshot,
    setSeverity,
    setScreenshot,
    submitReport,
    captureScreenshot,
  } = useBugReportV2();

  const { addToast } = useToast();

  const handleSubmit = async () => {
    const result = await submitReport();
    if (result) {
      // Show success message with GitHub issue link if available
      if (result.issueUrl) {
        addToast({
          type: "success",
          title: "Bug Report Submitted!",
          message: `Your report has been created as GitHub issue #${result.issueNumber || "N/A"}. Thank you for helping improve VioletVault!`,
          duration: 8000,
        });
      } else if (result.localFallback) {
        // Service unavailable, but we logged it locally
        addToast({
          type: "warning",
          title: "Report Logged Locally",
          message: `Service temporarily unavailable, but your report has been saved. Check browser console for details.`,
          duration: 8000,
        });
      } else {
        addToast({
          type: "success",
          title: "Report Submitted!",
          message: "Your bug report has been submitted successfully.",
          duration: 4000,
        });
      }
    } else {
      addToast({
        type: "error",
        title: "Submission Failed",
        message: "Failed to submit bug report. Please try again.",
        duration: 5000,
      });
    }
  };

  return (
    <>
      {/* Floating Bug Report Button */}
      <button
        onClick={openModal}
        className="fixed bottom-24 right-4 lg:bottom-4 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
        title="Report a Problem"
        data-bug-report="true"
      >
        {React.createElement(getIcon("Bug"), { className: "h-5 w-5" })}
      </button>

      {/* Bug Report Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          data-bug-report="true"
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
            data-bug-report="true"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {React.createElement(getIcon("AlertCircle"), {
                  className: "h-5 w-5 text-red-500 mr-2",
                })}
                <h3 className="text-lg font-semibold text-gray-900">
                  Report a Problem
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                {React.createElement(getIcon("X"), { className: "h-5 w-5" })}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of the issue"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened? What were you trying to do?&#10;&#10;📝 Tip: You can include code blocks using:&#10;```&#10;your code here&#10;```"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Steps to Reproduce (Optional)
                  </label>
                  <textarea
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="low">Low - Minor issue</option>
                    <option value="medium">Medium - Normal bug</option>
                    <option value="high">High - Important issue</option>
                    <option value="critical">Critical - Blocking</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Behavior (Optional)
                  </label>
                  <textarea
                    value={expected}
                    onChange={(e) => setExpected(e.target.value)}
                    placeholder="What should have happened?"
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Behavior (Optional)
                  </label>
                  <textarea
                    value={actual}
                    onChange={(e) => setActual(e.target.value)}
                    placeholder="What actually happened?"
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
                  <input
                    id="include-screenshot-checkbox"
                    type="checkbox"
                    checked={includeScreenshot}
                    onChange={(e) => setIncludeScreenshot(e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-0.5 justify-self-start"
                  />
                  <label
                    htmlFor="include-screenshot-checkbox"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Include screenshot
                  </label>
                </div>

                {includeScreenshot && (
                  <div className="flex gap-2">
                    <button
                      onClick={captureScreenshot}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      title="Automatically capture screenshot using html2canvas"
                    >
                      {React.createElement(getIcon("Camera"), {
                        className: "h-4 w-4 mr-1",
                      })}
                      Auto Capture
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          navigator.mediaDevices &&
                          navigator.mediaDevices.getDisplayMedia
                        ) {
                          try {
                            const stream =
                              await navigator.mediaDevices.getDisplayMedia({
                                video: {
                                  width: { ideal: 1920 },
                                  height: { ideal: 1080 },
                                },
                                audio: false,
                              });
                            const video = document.createElement("video");
                            video.srcObject = stream;
                            video.play();

                            await new Promise(
                              (resolve) => (video.onloadedmetadata = resolve),
                            );

                            const canvas = document.createElement("canvas");
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            const ctx = canvas.getContext("2d");
                            ctx.drawImage(video, 0, 0);

                            stream.getTracks().forEach((track) => track.stop());

                            const screenshotDataUrl = canvas.toDataURL(
                              "image/png",
                              0.9,
                            );
                            setScreenshot(screenshotDataUrl);
                          } catch (error) {
                            logger.warn("Manual screen capture failed:", error);
                            addToast({
                              type: "error",
                              title: "Screen Capture Failed",
                              message:
                                "Please try the Auto Capture option or include a manual screenshot.",
                            });
                          }
                        } else {
                          addToast({
                            type: "warning",
                            title: "Screen Capture Not Supported",
                            message:
                              "Please use Auto Capture or include a manual screenshot.",
                          });
                        }
                      }}
                      className="text-sm text-green-600 hover:text-green-800 flex items-center"
                      title="Use browser's native screen capture (requires permission)"
                    >
                      {React.createElement(getIcon("Camera"), {
                        className: "h-4 w-4 mr-1",
                      })}
                      Screen Capture
                    </button>
                  </div>
                )}
              </div>

              {screenshot && (
                <div className="border border-gray-200 rounded-lg p-2">
                  <div className="relative">
                    <img
                      src={screenshot}
                      alt="Screenshot preview"
                      className="w-full h-32 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        // Open screenshot in new tab for full view
                        const win = window.open();
                        if (win) {
                          win.document.write(`
                            <html>
                              <head><title>Bug Report Screenshot</title></head>
                              <body style="margin: 0; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
                                <img src="${screenshot}" style="max-width: 95%; max-height: 95%; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
                              </body>
                            </html>
                          `);
                        }
                      }}
                    />
                    <button
                      onClick={() => setScreenshot(null)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Remove screenshot"
                    >
                      {React.createElement(getIcon("X"), {
                        className: "h-3 w-3",
                      })}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      ✅ Screenshot ready (click to view full size)
                    </p>
                    <p className="text-xs text-gray-400">
                      {Math.round(screenshot.length / 1024)}KB
                    </p>
                  </div>
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
                disabled={
                  (!title.trim() && !description.trim()) || isSubmitting
                }
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    {React.createElement(getIcon("Send"), {
                      className: "h-4 w-4 mr-2",
                    })}
                    Submit Report
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Your detailed report helps us improve VioletVault. System info and
              browser details will be included automatically.
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
