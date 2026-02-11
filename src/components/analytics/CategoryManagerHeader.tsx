import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

interface CategoryManagerHeaderProps {
  suggestionCount: number;
  onToggleSettings: () => void;
}

const CategoryManagerHeader = ({
  suggestionCount,
  onToggleSettings,
}: CategoryManagerHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-xl font-black text-black flex items-center">
          <div className="relative mr-3">
            <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-lg opacity-30"></div>
            <div className="relative bg-emerald-500 p-2 rounded-xl border-2 border-black shadow-md">
              {React.createElement(getIcon("Zap"), {
                className: "h-5 w-5 text-white",
              })}
            </div>
          </div>
          SMART CATEGORY MANAGER
        </h3>
        <p className="text-purple-800 font-medium mt-2">
          AI-powered category optimization for bills and transactions
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-purple-800 font-medium">{suggestionCount} suggestions</span>
        <Button
          onClick={onToggleSettings}
          className="p-2 text-gray-400 hover:text-gray-600 glassmorphism backdrop-blur-sm rounded-lg border-2 border-black shadow-md hover:shadow-lg transition-all"
        >
          {React.createElement(getIcon("Settings"), { className: "h-4 w-4" })}
        </Button>
      </div>
    </div>
  );
};

export default CategoryManagerHeader;
