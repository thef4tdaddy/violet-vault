import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import { useBugReportState } from "./hooks/useBugReportState";
import { StepOne } from "./steps/StepOne";
import { StepTwo } from "./steps/StepTwo";
import { StepThree } from "./steps/StepThree";
import { StepFour } from "./steps/StepFour";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

/**
 * Floating bug report button with screenshot capability
 * Refactored to use extracted components and hooks for better maintainability
 */
const BugReportButton: React.FC = () => {
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
    captureScreenshot,
    handleSubmit,
    handleScreenCapture,
    openScreenshotPreview,
    removeScreenshot,
  } = useBugReportState();

  const modalRef = useModalAutoScroll(isModalOpen);

  return (
    <>
      {/* Floating Bug Report Button */}
      <Button
        onClick={openModal}
        className="fixed bottom-24 right-4 lg:bottom-4 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
        title="Report a Problem"
        data-bug-report="true"
      >
        {React.createElement(getIcon("Bug"), { className: "h-5 w-5" })}
      </Button>

      {/* Bug Report Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          data-bug-report="true"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl my-auto border-2 border-black"
            data-bug-report="true"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {React.createElement(getIcon("AlertCircle"), {
                  className: "h-5 w-5 text-red-500 mr-2",
                })}
                <h3 className="text-lg font-semibold text-gray-900">Report a Problem</h3>
              </div>
              <ModalCloseButton onClick={closeModal} />
            </div>

            <div className="space-y-4">
              <StepOne
                title={title}
                description={description}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
              />

              <StepTwo
                steps={steps}
                severity={severity}
                onStepsChange={setSteps}
                onSeverityChange={setSeverity}
              />

              <StepThree
                expected={expected}
                actual={actual}
                onExpectedChange={setExpected}
                onActualChange={setActual}
              />

              <StepFour
                includeScreenshot={includeScreenshot}
                screenshot={screenshot}
                onIncludeScreenshotChange={setIncludeScreenshot}
                onCaptureScreenshot={captureScreenshot}
                onScreenCapture={handleScreenCapture}
                onScreenshotPreview={openScreenshotPreview}
                onRemoveScreenshot={removeScreenshot}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={(!title.trim() && !description.trim()) || isSubmitting}
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
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Your detailed report helps us improve VioletVault. System info and browser details
              will be included automatically.
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
