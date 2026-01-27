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
  badgeCount?: number;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onClick,
  variant = "primary",
  color = "blue",
  disabled = false,
  badgeCount = 0,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      color={color}
      icon={renderIcon(icon, { className: "h-5 w-5" })}
      fullWidth
      className="flex-col h-24 gap-1 pt-4 pb-2 relative"
    >
      {badgeCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center min-w-[22px] h-[22px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10 animate-in zoom-in-50 duration-200">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
      <span className="text-[10px] font-black uppercase tracking-wider mt-auto">{label}</span>
    </Button>
  );
};

export default QuickActionButton;
