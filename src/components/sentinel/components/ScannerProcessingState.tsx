import React from "react";
import { motion } from "framer-motion";
import { getIcon } from "@/utils";

interface ScannerProcessingStateProps {
  previewUrl?: string;
}

/**
 * ScannerProcessingState - Laser-scan animation and processing feedback
 */
const ScannerProcessingState = ({ previewUrl }: ScannerProcessingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-12 max-w-sm w-full aspect-3/4">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Scanning preview"
            className="w-full h-full object-cover grayscale opacity-50"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            {React.createElement(getIcon("FileText"), { className: "h-20 w-20 text-gray-300" })}
          </div>
        )}

        {/* Laser Scanning Line */}
        <motion.div
          className="absolute left-0 right-0 h-1 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)] z-10"
          initial={{ top: "-5%" }}
          animate={{ top: "105%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Scanning Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[20px_20px] opacity-10 pointer-events-none" />
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black text-black uppercase tracking-tighter font-mono flex items-center justify-center gap-3">
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-3 h-3 bg-red-600 border border-black"
          />
          ANALYZING RECEIPT...
        </h3>
        <p className="text-sm font-bold text-purple-900 uppercase tracking-widest font-mono">
          EXTRACTING ENTITIES | SENTINEL OCR ENGINE
        </p>
      </div>

      <div className="mt-12 w-full max-w-xs h-3 border-2 border-black bg-white p-0.5 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <motion.div
          className="h-full bg-purple-600"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>
    </div>
  );
};

export default ScannerProcessingState;
