import React from "react";

type ModalCloseVariant = "filledRed" | "outlineRed";

interface ModalCloseButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  variant?: ModalCloseVariant;
  children?: React.ReactNode;
}

const VARIANT_STYLES: Record<ModalCloseVariant, { button: string; icon: string }> = {
  filledRed: {
    button:
      "bg-red-600 hover:bg-red-700 text-white border-2 border-black shadow-lg hover:shadow-xl focus:ring-red-500",
    icon: "",
  },
  outlineRed: {
    button: "bg-white hover:bg-red-50 text-black border-2 border-red-600 focus:ring-red-600",
    icon: "text-black",
  },
};

const ModalCloseButton = ({
  onClick,
  ariaLabel,
  className,
  variant = "outlineRed",
  children,
}: ModalCloseButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${VARIANT_STYLES[variant].button} ${className || ""}`}
    >
      {children}
    </button>
  );
};

export default ModalCloseButton;
