import React from "react";
import { getIcon } from "../../utils";

const BillTabs = ({ activeTab, onTabChange, bills }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex">
        <button
          onClick={() => onTabChange("monthly")}
          className={`px-6 py-4 text-sm font-medium border-b-2 ${
            activeTab === "monthly"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {React.createElement(getIcon("Calendar"), {
            className: "h-4 w-4 inline mr-2",
          })}
          Monthly Bills ({bills.monthly?.length || 0})
        </button>
        <button
          onClick={() => onTabChange("longerTerm")}
          className={`px-6 py-4 text-sm font-medium border-b-2 ${
            activeTab === "longerTerm"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {React.createElement(getIcon("Clock"), {
            className: "h-4 w-4 inline mr-2",
          })}
          Longer Term Bills ({bills.longerTerm?.length || 0})
        </button>
      </nav>
    </div>
  );
};

export default BillTabs;
