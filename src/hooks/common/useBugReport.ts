import { useState } from "react";
import { useBugReportScreenshot } from "./useBugReportScreenshot";
import { useBugReportSubmission } from "./useBugReportSubmission";

/**
 * Custom hook for bug report functionality
 * Uses centralized services for screenshot, system info, and API submission
 */
const useBugReport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [includeScreenshot, setIncludeScreenshot] = useState(true);

  // Use focused sub-hooks
  const { screenshot, setScreenshot, captureScreenshot } = useBugReportScreenshot();
  const { isSubmitting, submitReport: submitBugReport } = useBugReportSubmission();

  const submitReport = async () => {
    if (!description.trim()) return false;

    // Capture screenshot if requested
    let screenshotData = null;
    if (includeScreenshot) {
      try {
        screenshotData = screenshot || (await captureScreenshot());
      } catch {
        // Screenshot capture is optional, continue without it
      }
    }

    const success = await submitBugReport(description, screenshotData);

    if (success) {
      // Reset form
      setDescription("");
      setScreenshot(null);
      setIsModalOpen(false);
      return true;
    }

    return false;
  };

  return {
    // State
    isModalOpen,
    description,
    includeScreenshot,
    isSubmitting,
    screenshot,

    // Actions
    setIsModalOpen,
    setDescription,
    setIncludeScreenshot,
    captureScreenshot,
    submitReport,
  };
};

export default useBugReport;
