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
        searchPlaceholder="Search bills..."
        mode="collapsible"
      />
    </div>
  );
};

export default BillViewTabs;
