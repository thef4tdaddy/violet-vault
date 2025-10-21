import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

interface ModalHeaderProps {
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose }) => {
  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {React.createElement(getIcon("Shield"), {
            className: "h-6 w-6 text-purple-600 mr-3",
          })}
          <h2 className="text-xl font-semibold text-gray-900">Key Management</h2>
        </div>
        <Button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          {React.createElement(getIcon("X"), {
            className: "h-6 w-6",
          })}
        </Button>
      </div>
    </div>
  );
};

export default ModalHeader;
