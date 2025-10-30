import useBugReport from "../../../hooks/common/useBugReport";
import useToast from "../../../hooks/common/useToast";
import logger from "../../../utils/common/logger";

interface BugReportHookReturn {
  isModalOpen: boolean;
  title: string;
  description: string;
  steps: string;
  expected: string;
  actual: string;
  includeScreenshot: boolean;
  isSubmitting: boolean;
  screenshot: string | null;
  severity: string;
  submitResult: {
    success: boolean;
    submissionId?: string;
    url?: string;
    provider?: string;
    screenshotStatus?: unknown;
  } | null;
  openModal: () => void;
  closeModal: () => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setSteps: (steps: string) => void;
  setExpected: (expected: string) => void;
  setActual: (actual: string) => void;
  setIncludeScreenshot: (include: boolean) => void;
  setSeverity: (severity: string) => void;
  setScreenshot: (screenshot: string | null) => void;
  submitReport: () => Promise<boolean>;
  captureScreenshot: () => Promise<string | null>;
}

export interface BugReportState {
  // Modal state
  isModalOpen: boolean;

  // Form state from hook
  title: string;
  description: string;
  steps: string;
  expected: string;
  actual: string;
  includeScreenshot: boolean;
  isSubmitting: boolean;
  screenshot: string | null;
  severity: string;

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setSteps: (steps: string) => void;
  setExpected: (expected: string) => void;
  setActual: (actual: string) => void;
  setIncludeScreenshot: (include: boolean) => void;
  setSeverity: (severity: string) => void;
  setScreenshot: (screenshot: string | null) => void;
  submitReport: () => Promise<boolean>;
  captureScreenshot: () => void;

  // UI actions
  handleSubmit: () => Promise<void>;
  handleScreenCapture: () => Promise<void>;
  openScreenshotPreview: () => void;
  removeScreenshot: () => void;
}

export interface ToastHook {
  addToast: (toast: { type: string; title: string; message: string; duration?: number }) => void;
}

export const useBugReportState = (): BugReportState => {
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
    submitResult,
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
  } = useBugReport() as BugReportHookReturn;

  const { addToast } = useToast() as ToastHook;

  const handleSubmit = async (): Promise<void> => {
    const success = await submitReport();
    if (success && submitResult) {
      // Show success message with GitHub issue link if available
      if (submitResult.url) {
        addToast({
          type: "success",
          title: "Bug Report Submitted!",
          message: `Your report has been created as GitHub issue #${submitResult.submissionId || "N/A"}. Thank you for helping improve VioletVault!`,
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

  const handleScreenCapture = async (): Promise<void> => {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();

        await new Promise<void>((resolve) => (video.onloadedmetadata = () => resolve()));

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
        }

        stream.getTracks().forEach((track) => track.stop());

        const screenshotDataUrl = canvas.toDataURL("image/png", 0.9);
        setScreenshot(screenshotDataUrl);
      } catch (error) {
        logger.warn("Manual screen capture failed:", { error: error instanceof Error ? error.message : String(error) });
        addToast({
          type: "error",
          title: "Screen Capture Failed",
          message: "Please try the Auto Capture option or include a manual screenshot.",
        });
      }
    } else {
      addToast({
        type: "warning",
        title: "Screen Capture Not Supported",
        message: "Please use Auto Capture or include a manual screenshot.",
      });
    }
  };

  const openScreenshotPreview = (): void => {
    if (!screenshot) return;

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
  };

  const removeScreenshot = (): void => {
    setScreenshot(null);
  };

  return {
    // Modal state
    isModalOpen,

    // Form state
    title,
    description,
    steps,
    expected,
    actual,
    includeScreenshot,
    isSubmitting,
    screenshot,
    severity,

    // Actions
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

    // UI actions
    handleSubmit,
    handleScreenCapture,
    openScreenshotPreview,
    removeScreenshot,
  };
};
