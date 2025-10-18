import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
      <Button
        onClick={() => onTabChange("export")}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === "export"
            ? "bg-white text-purple-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        {React.createElement(getIcon("Download"), {
          className: "h-4 w-4 inline mr-2",
        })}
        Export Key
      </Button>
      <Button
        onClick={() => onTabChange("import")}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === "import"
            ? "bg-white text-purple-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        {React.createElement(getIcon("Upload"), {
          className: "h-4 w-4 inline mr-2",
        })}
        Import Key
      </Button>
    </div>
  );
};

export default TabNavigation;
