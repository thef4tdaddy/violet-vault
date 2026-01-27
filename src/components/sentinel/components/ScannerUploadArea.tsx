import React from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";

interface ScannerUploadAreaProps {
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * ScannerUploadArea - Hard-lined upload and camera capture area
 */
const ScannerUploadArea = ({
  onDrop,
  onDragOver,
  fileInputRef,
  cameraInputRef,
  onFileInputChange,
}: ScannerUploadAreaProps) => {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="border-4 border-dashed border-purple-800 bg-white/50 p-12 transition-all duration-200 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-purple-50"
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Hidden camera input for mobile integration */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={onFileInputChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <div className="mb-6 p-4 border-2 border-black bg-white group-hover:scale-110 transition-transform duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-active:shadow-none group-active:translate-x-[2px] group-active:translate-y-[2px]">
        {React.createElement(getIcon("ImagePlus"), { className: "h-12 w-12 text-black" })}
      </div>

      <h3 className="text-lg font-black text-black uppercase tracking-tight font-mono mb-2">
        DROP RECEIPT OR CLICK TO UPLOAD
      </h3>

      <p className="text-sm font-bold text-purple-900 uppercase tracking-wide font-mono mb-8">
        JPG, PNG, WEBP (MAX 10MB)
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="flex-1 px-4 py-3 border-2 border-black bg-purple-600 text-white font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[4px] active:translate-y-[4px] transition-all font-mono text-sm"
        >
          BROWSE FILES
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            cameraInputRef.current?.click();
          }}
          className="flex-1 px-4 py-3 border-2 border-black bg-black text-white font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[4px] active:translate-y-[4px] transition-all font-mono text-sm flex items-center justify-center gap-2"
        >
          {React.createElement(getIcon("Camera"), { className: "h-4 w-4" })}
          OPEN CAMERA
        </Button>
      </div>

      <div className="mt-8 flex items-center gap-4 text-purple-900/40">
        <div className="h-px w-12 bg-current" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">
          SECURE PROCESSING
        </span>
        <div className="h-px w-12 bg-current" />
      </div>
    </div>
  );
};

export default ScannerUploadArea;
