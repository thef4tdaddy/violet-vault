import React from "react";
import { Button } from "@/components/ui";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import type { AutoFundingRule } from "@/utils/budgeting/autofunding/rules";
import type { ExecutionRecord } from "@/db/types";

interface RulesTabProps {
  rules: AutoFundingRule[];
  onCreateRule: () => void;
  onEditRule: (rule: AutoFundingRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string) => void;
  onExecuteRules: () => void;
  isExecuting: boolean;
}

interface HistoryTabProps {
  executionHistory: ExecutionRecord[];
  showExecutionDetails: string | null;
  onToggleDetails: (show: string | null) => void;
}

interface DashboardHeaderProps {
  rules: AutoFundingRule[];
  onClose: () => void;
}

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  rules: AutoFundingRule[];
  executionHistory: ExecutionRecord[];
}

interface DashboardContentProps {
  activeTab: string;
  rules: AutoFundingRule[];
  executionHistory: ExecutionRecord[];
  showExecutionDetails: string | null;
  setShowExecutionDetails: (show: string | null) => void;
  handleCreateRule: () => void;
  handleEditRule: (rule: AutoFundingRule) => void;
  handleDeleteRule: (ruleId: string) => void;
  handleToggleRule: (ruleId: string) => void;
  handleExecuteRules: () => void;
  isExecuting: boolean;
  RulesTabComponent: React.ComponentType<RulesTabProps>;
  HistoryTabComponent: React.ComponentType<HistoryTabProps>;
}

/**
 * Dashboard header component
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ rules, onClose }) => {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Auto-Funding Dashboard</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {rules.filter((rule) => rule.enabled).length} Active
            </span>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
              {rules.length} Total
            </span>
          </div>
        </div>
        <ModalCloseButton onClick={onClose} />
      </div>
    </div>
  );
};

/**
 * Dashboard tabs component
 */
export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeTab,
  setActiveTab,
  rules,
  executionHistory,
}) => {
  return (
    <div className="flex space-x-8 mt-6">
      <Button
        onClick={() => setActiveTab("rules")}
        className={`py-2 px-1 border-b-2 font-medium text-sm ${
          activeTab === "rules"
            ? "border-blue-500 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        Rules ({rules.length})
      </Button>
      <Button
        onClick={() => setActiveTab("history")}
        className={`py-2 px-1 border-b-2 font-medium text-sm ${
          activeTab === "history"
            ? "border-blue-500 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        History ({executionHistory.length})
      </Button>
    </div>
  );
};

/**
 * Dashboard content component
 */
export const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab,
  rules,
  executionHistory,
  showExecutionDetails,
  setShowExecutionDetails,
  handleCreateRule,
  handleEditRule,
  handleDeleteRule,
  handleToggleRule,
  handleExecuteRules,
  isExecuting,
  RulesTabComponent,
  HistoryTabComponent,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {activeTab === "rules" && (
        <RulesTabComponent
          rules={rules}
          onCreateRule={handleCreateRule}
          onEditRule={handleEditRule}
          onDeleteRule={handleDeleteRule}
          onToggleRule={handleToggleRule}
          onExecuteRules={handleExecuteRules}
          isExecuting={isExecuting}
        />
      )}

      {activeTab === "history" && (
        <HistoryTabComponent
          executionHistory={executionHistory}
          showExecutionDetails={showExecutionDetails}
          onToggleDetails={setShowExecutionDetails}
        />
      )}
    </div>
  );
};
