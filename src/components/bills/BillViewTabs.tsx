import StandardTabs from "../ui/StandardTabs";
import StandardFilters from "../ui/StandardFilters";

/**
 * View mode tabs for BillManager using standardized tabs component
 * Pure UI component that preserves exact visual appearance
 */
const BillViewTabs = ({ viewModes, viewMode, setViewMode, filterOptions, setFilterOptions }) => {
  return (
    <div className="space-y-0">
      {/* View Mode Tabs */}
      <StandardTabs
        tabs={viewModes}
        activeTab={viewMode}
        onTabChange={setViewMode}
        variant="colored"
        size="md"
        className="pl-4"
      />

      {/* Connected Filters */}
      <StandardFilters
        filters={filterOptions}
        onFilterChange={(key, value) => setFilterOptions((prev) => ({ ...prev, [key]: value }))}
        filterConfigs={[
          {
            key: "urgency",
            type: "select",
            defaultValue: "all",
            options: [
              { value: "all", label: "All Urgency" },
              { value: "overdue", label: "Overdue" },
              { value: "urgent", label: "Urgent" },
              { value: "soon", label: "Soon" },
              { value: "normal", label: "Normal" },
            ],
          },
          {
            key: "envelope",
            type: "select",
            defaultValue: "all",
            options: [
              { value: "all", label: "All Envelopes" },
              { value: "connected", label: "Connected" },
              { value: "unconnected", label: "Unconnected" },
            ],
          },
        ]}
        searchPlaceholder="Search bills..."
        size="md"
        mode="collapsible"
      />
    </div>
  );
};

export default BillViewTabs;
