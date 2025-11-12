import React from "react";

type ModalCloseVariant = "filledRed" | "outlineRed";

interface ModalCloseButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  variant?: ModalCloseVariant;
  children?: React.ReactNode;
}

const BASE_BUTTON_CLASSES =
  "inline-flex h-10 w-10 items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";

const DEFAULT_ICON_BASE_CLASSES = "text-base font-semibold leading-none";

const VARIANT_STYLES: Record<ModalCloseVariant, { button: string; icon: string }> = {
  filledRed: {
    button:
      "bg-red-600 hover:bg-red-700 text-white border-2 border-black shadow-lg hover:shadow-xl focus:ring-red-500",
    icon: "text-white",
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
  const { button: variantButtonClasses, icon: variantIconClasses } = VARIANT_STYLES[variant];
  const content = children ?? (
    <span className={`${DEFAULT_ICON_BASE_CLASSES} ${variantIconClasses}`} aria-hidden="true">
      X
    </span>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? "Close modal"}
      className={`${BASE_BUTTON_CLASSES} ${variantButtonClasses} ${className || ""}`}
    >
      {content}
    </button>
  );
};

export default ModalCloseButton;
