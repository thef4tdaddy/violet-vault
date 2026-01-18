import React from "react";
import { Button } from "@/components/ui";
import { renderIcon } from "@/utils";

interface JoinBudgetSectionProps {
  onJoinClick: () => void;
  isVisible: boolean;
}

const JoinBudgetSection: React.FC<JoinBudgetSectionProps> = ({ onJoinClick, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="mt-6 pt-6 border-t border-white/20">
      <div className="text-center">
        <p className="text-sm text-purple-900 mb-3">Already have a shared budget?</p>
        <Button
          type="button"
          onClick={onJoinClick}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-black transition-colors border-2 border-black flex items-center justify-center gap-2"
        >
          {renderIcon("UserPlus", { className: "h-4 w-4" })}
          JOIN SHARED BUDGET
        </Button>
      </div>
    </div>
  );
};

export default JoinBudgetSection;
