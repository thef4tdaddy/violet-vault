import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface StepFourProps {
  includeScreenshot: boolean;
  screenshot: string | null;
  onIncludeScreenshotChange: (include: boolean) => void;
  onCaptureScreenshot: () => void;
  onScreenCapture: () => void;
  onScreenshotPreview: () => void;
  onRemoveScreenshot: () => void;
}

export const StepFour: React.FC<StepFourProps> = ({
  includeScreenshot,
  screenshot,
  onIncludeScreenshotChange,
  onCaptureScreenshot,
  onScreenCapture,
  onScreenshotPreview,
  onRemoveScreenshot,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
          <input
            id="include-screenshot-checkbox"
            type="checkbox"
            checked={includeScreenshot}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onIncludeScreenshotChange(e.target.checked)
            }
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
            <Button
              onClick={onCaptureScreenshot}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              title="Automatically capture screenshot using html2canvas"
            >
              {React.createElement(getIcon("Camera"), {
                className: "h-4 w-4 mr-1",
              })}
              Auto Capture
            </Button>
            <Button
              onClick={onScreenCapture}
              className="text-sm text-green-600 hover:text-green-800 flex items-center"
              title="Use browser's native screen capture (requires permission)"
            >
              {React.createElement(getIcon("Camera"), {
                className: "h-4 w-4 mr-1",
              })}
              Screen Capture
            </Button>
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
              onClick={onScreenshotPreview}
            />
            <Button
              onClick={onRemoveScreenshot}
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              title="Remove screenshot"
            >
              {React.createElement(getIcon("X"), {
                className: "h-3 w-3",
              })}
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">✅ Screenshot ready (click to view full size)</p>
            <p className="text-xs text-gray-400">{Math.round(screenshot.length / 1024)}KB</p>
          </div>
        </div>
      )}
    </div>
  );
};
