import React from "react";
import { getIcon } from "@/utils";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

interface ModalHeaderProps {
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose }) => {
  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {React.createElement(getIcon("Shield"), {
            className: "h-6 w-6 text-purple-600 mr-3",
          })}
          <h2 className="text-xl font-semibold text-gray-900">Key Management</h2>
        </div>
        <ModalCloseButton onClick={onClose} />
      </div>
    </div>
  );
};

export default ModalHeader;
