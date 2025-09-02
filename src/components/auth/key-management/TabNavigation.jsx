import { Download, Upload } from "lucide-react";

const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onTabChange("export")}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === "export"
            ? "bg-white text-purple-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Download className="h-4 w-4 inline mr-2" />
        Export Key
      </button>
      <button
        onClick={() => onTabChange("import")}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === "import"
            ? "bg-white text-purple-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Upload className="h-4 w-4 inline mr-2" />
        Import Key
      </button>
    </div>
  );
};

export default TabNavigation;
