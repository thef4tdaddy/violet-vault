import React from "react";
import { getIcon } from "../../../utils";
import IntegrityStatusIndicator from "../IntegrityStatusIndicator";
import HelpTooltip from "../../ui/HelpTooltip";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

interface HistoryHeaderProps {
  onClose: () => void;
}

const HistoryHeader = ({ onClose }: HistoryHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex-1">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
          {React.createElement(getIcon("History"), {
            className: "h-6 w-6 mr-3 text-blue-600",
          })}
          Change History
          <HelpTooltip
            title="Budget History"
            content="Track all changes to your budget with git-like version control. Each change creates a commit that can be restored or analyzed for family collaboration."
            position="right"
          />
        </h2>
        <p className="text-gray-600 mt-1">View and restore previous versions of your budget</p>

        {/* Integrity Status Indicator */}
        <div className="mt-3">
          <IntegrityStatusIndicator />
        </div>
      </div>
      <ModalCloseButton onClick={onClose} />
    </div>
  );
};

export default HistoryHeader;
