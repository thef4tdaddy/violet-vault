import React, { useRef, useState, useCallback } from "react";
import { getIcon, IconComponent } from "@/utils";
import { Button } from "@/components/ui/buttons";

interface ScanUploadZoneProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
  acceptedFormats?: string[];
  maxFileSizeMB?: number;
}

/**
 * sub-components for cleaner structure
 */

const ProcessingContent: React.FC<{ LoaderIcon: IconComponent }> = ({ LoaderIcon }) => (
  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
    <div className="mb-6 p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <LoaderIcon className="h-12 w-12 text-purple-600 animate-spin" />
    </div>
    <h3 className="text-lg font-black text-black uppercase tracking-tight font-mono">
      Processing Receipt...
    </h3>
    <p className="text-sm font-bold text-purple-900 uppercase tracking-wide font-mono mt-2">
      Extracting merchant and total
    </p>
  </div>
);

const IdleContent: React.FC<{
  isDragging: boolean;
  ImagePlusIcon: IconComponent;
  CameraIcon: IconComponent;
  acceptedFormats: string[];
  maxFileSizeMB: number;
  isProcessing: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
}> = ({
  isDragging,
  ImagePlusIcon,
  CameraIcon,
  acceptedFormats,
  maxFileSizeMB,
  isProcessing,
  fileInputRef,
  cameraInputRef,
}) => (
  <>
    <div className="mb-6 p-4 border-2 border-black bg-white group-hover:scale-110 transition-transform duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-active:shadow-none group-active:translate-x-[2px] group-active:translate-y-[2px]">
      <ImagePlusIcon className={`h-12 w-12 ${isDragging ? "text-purple-600" : "text-black"}`} />
    </div>

    <h3 className="text-lg font-black text-black uppercase tracking-tight font-mono mb-2">
      {isDragging ? "Drop to Upload" : "Drop Receipt or Click to Upload"}
    </h3>

    <p className="text-xs font-bold text-purple-900/60 uppercase tracking-widest font-mono mb-8">
      {acceptedFormats
        .map((f) => {
          const subtype = f.split("/")[1];
          return subtype === "*" ? "IMAGES" : subtype.toUpperCase();
        })
        .join(", ")}{" "}
      (MAX {maxFileSizeMB}MB)
    </p>

    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
      <Button
        onClick={(e) => {
          if (isProcessing) return;
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
        variant="secondary"
        disabled={isProcessing}
        className="flex-1 border-2 border-black bg-purple-600 text-white font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-50 disabled:cursor-wait disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono text-xs"
      >
        Browse Files
      </Button>
      <Button
        onClick={(e) => {
          if (isProcessing) return;
          e.stopPropagation();
          cameraInputRef.current?.click();
        }}
        disabled={isProcessing}
        className="flex-1 border-2 border-black bg-black text-white font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-50 disabled:cursor-wait disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono text-xs flex items-center justify-center gap-2"
      >
        <CameraIcon className="h-4 w-4" />
        Capture
      </Button>
    </div>

    <div className="mt-8 flex items-center gap-4 text-purple-900/40">
      <div className="h-px w-12 bg-current" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">
        Secure Local Processing
      </span>
      <div className="h-px w-12 bg-current" />
    </div>
  </>
);

/**
 * ScanUploadZone - Premium drag-and-drop upload zone for the Import Dashboard
 * Implements "Hard Lines" high-contrast aesthetic.
 */
const ScanUploadZone: React.FC<ScanUploadZoneProps> = ({
  onFileSelected,
  isProcessing,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp"],
  maxFileSizeMB = 10,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) setIsDragging(true);
    },
    [isDragging]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (isProcessing) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFileSelected(files[0]);
      }
    },
    [onFileSelected, isProcessing]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFileSelected(e.target.files[0]);
      }
    },
    [onFileSelected]
  );

  const ImagePlusIcon = getIcon("ImagePlus") as IconComponent;
  const CameraIcon = getIcon("Camera") as IconComponent;
  const LoaderIcon = getIcon("Loader2") as IconComponent;

  return (
    <div
      className={`relative w-full border-4 border-dashed transition-all duration-200 p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer group
        ${
          isDragging
            ? "border-purple-600 bg-purple-100/50 scale-[0.99] shadow-inner"
            : "border-purple-800 bg-white/50 hover:bg-purple-50 hover:border-purple-600"
        }
        ${isProcessing ? "cursor-wait opacity-80" : ""}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !isProcessing && fileInputRef.current?.click()}
      data-testid="scan-upload-zone"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={acceptedFormats.join(",")}
        className="hidden"
        data-testid="file-input"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleInputChange}
        accept="image/*"
        capture="environment"
        className="hidden"
        data-testid="camera-input"
      />

      {isProcessing ? (
        <ProcessingContent LoaderIcon={LoaderIcon} />
      ) : (
        <IdleContent
          isDragging={isDragging}
          ImagePlusIcon={ImagePlusIcon}
          CameraIcon={CameraIcon}
          acceptedFormats={acceptedFormats}
          maxFileSizeMB={maxFileSizeMB}
          isProcessing={isProcessing}
          fileInputRef={fileInputRef}
          cameraInputRef={cameraInputRef}
        />
      )}
    </div>
  );
};

export default ScanUploadZone;
