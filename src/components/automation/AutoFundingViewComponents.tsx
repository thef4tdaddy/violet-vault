import { Button } from "@/components/ui";

/**
 * View header component
 */
export const ViewHeader = ({ rules }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auto-Funding</h1>
          <p className="text-gray-600 mt-1">
            Automate your envelope funding with custom rules and triggers
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
            {rules.filter((r) => r.enabled).length} Active Rules
          </span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
            {rules.length} Total Rules
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * View tabs component
 */
export const ViewTabs = ({ activeTab, setActiveTab, rules, displayHistory }) => {
  return (
    <div className="flex space-x-8 mt-6 border-b border-gray-200">
      <Button
        onClick={() => setActiveTab("rules")}
        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
          activeTab === "rules"
            ? "border-blue-500 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        Rules ({rules.length})
      </Button>
      <Button
        onClick={() => setActiveTab("history")}
        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
          activeTab === "history"
            ? "border-blue-500 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        History ({displayHistory.length})
      </Button>
    </div>
  );
};

/**
 * View content component
 */
export const ViewContent = ({
  activeTab,
  rules,
  displayHistory,
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
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6">
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
            executionHistory={displayHistory}
            showExecutionDetails={showExecutionDetails}
            onToggleDetails={setShowExecutionDetails}
          />
        )}
      </div>
    </div>
  );
};
