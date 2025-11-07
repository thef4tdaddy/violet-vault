import React from "react";
import { getIcon } from "@/utils";

interface ModalCloseButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}

const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  onClick,
  ariaLabel = "Close modal",
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 text-white border-2 border-black rounded-full shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${className}`.trim()}
    >
      {React.createElement(getIcon("X"), { className: "h-4 w-4" })}
    </button>
  );
};

export default ModalCloseButton;
