import React from "react";
import { getIcon } from "@/utils/ui/icons";
import { Button } from "@/components/ui";
import type { ImportMode } from "@/types/import-dashboard.types";

const Cloud = getIcon("Cloud");
const Upload = getIcon("Upload");

interface ImportSidebarProps {
  selectedMode: ImportMode;
  onModeChange: (mode: ImportMode) => void;
  pendingCounts?: {
    digital: number;
    scan: number;
  };
  className?: string;
}

/**
 * ImportSidebar - Mode selector for Digital and Scan import sources
 * Uses Hard Line v2.1 aesthetic with thick borders and strong visual hierarchy
 */
const ImportSidebar: React.FC<ImportSidebarProps> = ({
  selectedMode,
  onModeChange,
  pendingCounts = { digital: 0, scan: 0 },
  className = "",
}) => {
  const modes: Array<{ id: ImportMode; label: string; icon: React.ElementType; count: number }> = [
    { id: "digital", label: "Digital", icon: Cloud, count: pendingCounts.digital },
    { id: "scan", label: "Scan", icon: Upload, count: pendingCounts.scan },
  ];

  return (
    <div
      className={`
        flex flex-row md:flex-col
        justify-around md:justify-start
        gap-2 md:gap-4
        bg-white md:bg-transparent
        p-2 md:p-0
        border-t-2 md:border-t-0 border-black
        ${className}
      `}
      data-testid="import-sidebar"
    >
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = selectedMode === mode.id;

        return (
          <Button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            disabled={isActive}
            variant={isActive ? "primary" : "ghost"}
            color={isActive ? "purple" : "blue"}
            className={`
              group relative flex items-center justify-center md:justify-between
              flex-1 md:flex-none
              h-12 md:h-auto
              min-h-[44px]
              p-0
              ${
                isActive
                  ? "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  : "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1"
              }
            `}
            data-testid={`import-mode-${mode.id}`}
            aria-pressed={isActive}
          >
            {/* Main content */}
            <div className="flex items-center gap-2 md:gap-3 p-2 md:p-4">
              <Icon
                className={`h-5 w-5 ${isActive ? "text-white" : "text-purple-600"}`}
                aria-hidden="true"
              />
              <span className="font-mono font-black uppercase tracking-tight text-xs md:text-sm">
                {mode.label}
              </span>
            </div>

            {/* Count badge */}
            {mode.count > 0 && (
              <div
                className={`
                  hidden md:block
                  mr-4 px-2 py-1 rounded-md border border-black
                  font-bold text-xs
                  ${isActive ? "bg-white text-purple-600" : "bg-purple-100 text-purple-700"}
                `}
                aria-label={`${mode.count} pending ${mode.label.toLowerCase()} receipts`}
              >
                {mode.count}
              </div>
            )}

            {/* Mobile Count badge dot */}
            {mode.count > 0 && (
              <div
                className="md:hidden absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border border-white"
                aria-hidden="true"
              />
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default ImportSidebar;
