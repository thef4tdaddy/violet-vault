import React from "react";
import { getIcon } from "@/utils";

type ModalCloseVariant = "filledRed" | "outlineRed";

interface ModalCloseButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  variant?: ModalCloseVariant;
}

const VARIANT_STYLES: Record<ModalCloseVariant, { button: string; icon: string }> = {
  filledRed:
    "bg-red-600 hover:bg-red-700 text-white border-2 border-black shadow-lg hover:shadow-xl focus:ring-red-500",
  outlineRed:
    "bg-white hover:bg-red-50 text-black border-2 border-red-600 focus:ring-red-600",
};

const ICON_STYLES: Record<ModalCloseVariant, string> = {
  filledRed: "",
  outlineRed: "text-black",
};

const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  onClick,
  ariaLabel = "Close modal",
  className = "",
  variant = "filledRed",
}) => {
  const variantStyles = VARIANT_STYLES[variant];
  const iconStyles = ICON_STYLES[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantStyles} ${className}`.trim()}
    >
      {React.createElement(getIcon("X"), { className: `h-4 w-4 ${iconStyles}`.trim() })}
    </button>
  );
};

export default ModalCloseButton;
