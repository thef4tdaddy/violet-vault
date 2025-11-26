import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface ReceiptUploadAreaProps {
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Receipt Upload Area Component
 * Handles drag and drop, file upload, and camera capture UI with standards compliance
 */
const ReceiptUploadArea = ({
  onDrop,
  onDragOver,
  fileInputRef,
  cameraInputRef,
  onFileInputChange,
}: ReceiptUploadAreaProps) => {
  return (
    <>
      <div
        className="glassmorphism rounded-lg p-8 text-center border-2 border-black bg-purple-100/40 backdrop-blur-sm hover:bg-purple-200/40 transition-colors"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <div className="glassmorphism p-3 rounded-lg border-2 border-black bg-purple-200/40">
              {React.createElement(getIcon("Upload"), {
                className: "h-8 w-8 text-purple-900",
              })}
            </div>
            <div className="glassmorphism p-3 rounded-lg border-2 border-black bg-blue-100/40">
              {React.createElement(getIcon("Camera"), {
                className: "h-8 w-8 text-blue-900",
              })}
            </div>
          </div>

          <div>
            <p className="font-black text-black text-base mb-2">
              <span className="text-lg">U</span>PLOAD <span className="text-lg">R</span>ECEIPT{" "}
              <span className="text-lg">I</span>MAGE
            </p>
            <p className="text-sm text-purple-900 mb-4">
              Drag and drop an image here, or click to browse
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="glassmorphism px-6 py-2 bg-purple-600/80 text-white rounded-lg hover:bg-purple-700/80 transition-colors border-2 border-black backdrop-blur-sm"
            >
              <span className="font-black text-white">
                <span className="text-base">B</span>ROWSE <span className="text-base">F</span>ILES
              </span>
            </Button>
            <Button
              onClick={() => cameraInputRef.current?.click()}
              className="glassmorphism px-6 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/80 transition-colors border-2 border-black backdrop-blur-sm"
            >
              <span className="font-black text-white">
                <span className="text-base">T</span>AKE <span className="text-base">P</span>HOTO
              </span>
            </Button>
          </div>

          <p className="text-xs text-purple-900">
            Supports JPG, PNG, and other image formats • Max 10MB
          </p>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileInputChange}
        className="hidden"
      />
    </>
  );
};

export default ReceiptUploadArea;
