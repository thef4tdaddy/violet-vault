import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

interface LocalOnlyHeaderProps {
  onClose: () => void;
  loading: boolean;
}

const LocalOnlyHeader: React.FC<LocalOnlyHeaderProps> = ({ onClose, loading }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold flex items-center">
        {React.createElement(getIcon("Monitor"), {
          className: "h-5 w-5 mr-2 text-blue-600",
        })}
        Local-Only Mode Settings
      </h3>
      <Button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 text-xl"
        disabled={loading}
      >
        {React.createElement(getIcon("X"), {
          className: "h-5 w-5",
        })}
      </Button>
    </div>
  );
};

export default LocalOnlyHeader;
