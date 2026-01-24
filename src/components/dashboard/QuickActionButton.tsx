import React from "react";
import { Button, type ButtonVariant, type ButtonColor } from "@/components/ui";
import { renderIcon } from "@/utils/ui/icons";

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  color?: ButtonColor;
  disabled?: boolean;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onClick,
  variant = "primary",
  color = "blue",
  disabled = false,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      color={color}
      icon={renderIcon(icon, { className: "h-5 w-5" })}
      fullWidth
      className="flex-col h-24 gap-1 pt-4 pb-2"
    >
      <span className="text-[10px] font-black uppercase tracking-wider mt-auto">{label}</span>
    </Button>
  );
};

export default QuickActionButton;
