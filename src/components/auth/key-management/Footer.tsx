import React from "react";
import { Button } from "@/components/ui";

interface FooterProps {
  onClose: () => void;
}

const Footer: React.FC<FooterProps> = ({ onClose }) => {
  return (
    <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg">
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="flex items-center hover:text-gray-700"
          >
            Learn more about VioletVault encryption
          </a>
        </div>
        <Button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default Footer;
