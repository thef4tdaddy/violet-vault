import React from "react";
import { Select, Checkbox } from "@/components/ui";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface ArchivingConfigurationProps {
  selectedPeriod: number;
  isArchiving: boolean;
  showAdvancedOptions: boolean;
  handlePeriodChange: (period: string) => void;
  toggleAdvancedOptions: () => void;
}

const ArchivingConfiguration = ({
  selectedPeriod,
  isArchiving,
  showAdvancedOptions,
  handlePeriodChange,
  toggleAdvancedOptions,
}: ArchivingConfigurationProps) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Archive Configuration</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Archive transactions older than:
          </label>
          <Select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            disabled={isArchiving}
          >
            <option value={1}>1 month</option>
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months (1 year)</option>
            <option value={18}>18 months</option>
            <option value={24}>24 months (2 years)</option>
            <option value={36}>36 months (3 years)</option>
            <option value={48}>48 months (4 years)</option>
            <option value={60}>60 months (5 years)</option>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Transactions older than this period will be archived but analytics will be preserved
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            {React.createElement(getIcon("Info"), {
              className: "h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0",
            })}
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">What happens during archiving:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Old transactions are compressed and moved to archives</li>
                <li>Analytics data is preserved in aggregated form</li>
                <li>Historical insights remain available in reports</li>
                <li>Database performance is improved</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div>
          <Button
            onClick={toggleAdvancedOptions}
            className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700"
          >
            {React.createElement(getIcon("Settings"), { className: "h-4 w-4" })}
            <span>Advanced Options</span>
          </Button>

          {showAdvancedOptions && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="preserveAnalytics" checked={true} disabled={true} />
                <label htmlFor="preserveAnalytics" className="text-sm text-gray-700">
                  Preserve analytics data (recommended)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="optimizeDatabase" checked={true} disabled={true} />
                <label htmlFor="optimizeDatabase" className="text-sm text-gray-700">
                  Optimize database after archiving
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchivingConfiguration;
