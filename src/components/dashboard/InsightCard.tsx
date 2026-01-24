import React from "react";
import { Button } from "@/components/ui";
import { renderIcon } from "@/utils/ui/icons";

export type InsightType = "success" | "warning" | "info" | "error";

interface InsightCardProps {
  iconName: string;
  title: string;
  description: string;
  type: InsightType;
  actionLabel?: string;
  onAction?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({
  iconName,
  title,
  description,
  type,
  actionLabel,
  onAction,
}) => {
  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-900",
    warning: "bg-orange-50 border-orange-200 text-orange-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
    error: "bg-red-50 border-red-200 text-red-900",
  };

  const iconColors = {
    success: "text-green-600",
    warning: "text-orange-600",
    info: "text-blue-600",
    error: "text-red-600",
  };

  return (
    <div
      className={`p-4 rounded-xl border-2 border-black ${typeStyles[type]} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg bg-white border-2 border-black ${iconColors[type]}`}>
          {renderIcon(iconName, { className: "h-5 w-5" })}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-sm uppercase tracking-tight mb-1">{title}</h4>
          <p className="text-sm opacity-80 leading-snug">{description}</p>
          {actionLabel && onAction && (
            <Button
              variant="ghost"
              onClick={onAction}
              className="mt-2 p-0 h-auto text-[10px] font-black uppercase tracking-widest text-current border-b-2 border-current rounded-none bg-transparent hover:opacity-70"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
