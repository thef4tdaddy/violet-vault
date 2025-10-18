import React from "react";
import { Button } from "@/components/ui";

interface SecurityActionsSectionProps {
  onClose: () => void;
}

/**
 * Security settings actions section with save info and close button
 * Extracted from SecuritySettings.jsx with UI standards compliance
 */
const SecurityActionsSection: React.FC<SecurityActionsSectionProps> = ({ onClose }) => {
  return (
    <div className="mt-6 pt-6 border-t-2 border-black">
      <div className="flex justify-between items-center">
        <div className="glassmorphism px-4 py-2 rounded-lg border border-gray-300 bg-white/40">
          <div className="text-xs font-bold text-purple-800 uppercase tracking-wide">
            💾 Security settings are automatically saved
          </div>
        </div>
        <Button
          onClick={onClose}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-black uppercase tracking-wide shadow-lg hover:shadow-xl border-2 border-black transition-all hover:from-blue-600 hover:to-purple-700"
        >
          ✅ DONE
        </Button>
      </div>
    </div>
  );
};

export default SecurityActionsSection;
