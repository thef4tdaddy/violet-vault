import React from "react";
import { getIcon } from "@/utils";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

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
      <ModalCloseButton
        onClick={() => {
          if (!loading) {
            onClose();
          }
        }}
        className={loading ? "opacity-50 pointer-events-none" : ""}
      />
    </div>
  );
};

export default LocalOnlyHeader;
