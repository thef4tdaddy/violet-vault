import StandardTabs, { type Tab } from "../ui/StandardTabs";
import StandardFilters, { type FilterConfig } from "../ui/StandardFilters";
import type { FilterOptions } from "@/hooks/budgeting/transactions/scheduled/expenses/useBillCalculations";

interface BillViewTabsProps {
  viewModes: Tab[];
  viewMode: string;
  setViewMode: (mode: string) => void;
  filterOptions: FilterOptions;
  setFilterOptions: (options: FilterOptions) => void;
  envelopes?: Array<{ id: string | number; name?: string }>;
}

const BillViewTabs = ({
  viewModes,
  viewMode,
  setViewMode,
  filterOptions,
  setFilterOptions,
  envelopes = [],
}: BillViewTabsProps) => {
  const filterConfigs: FilterConfig[] = [
    {
      key: "urgency",
      label: "Urgency",
      type: "select",
      defaultValue: "all",
      options: [
        { value: "all", label: "All" },
        { value: "overdue", label: "Overdue" },
        { value: "due_soon", label: "Due Soon" },
        { value: "upcoming", label: "Upcoming" },
        { value: "paid", label: "Paid" },
      ],
    },
    {
      key: "envelope",
      label: "Envelope",
      type: "select",
      defaultValue: "",
      options: [
        { value: "", label: "All Envelopes" },
        ...envelopes.map((envelope) => ({
          value: String(envelope.id),
          label: envelope.name || String(envelope.id),
        })),
      ],
    },
    {
      key: "amountMin",
      label: "Min Amount",
      type: "text",
      placeholder: "$0.00",
      defaultValue: "",
    },
    {
      key: "amountMax",
      label: "Max Amount",
      type: "text",
      placeholder: "$0.00",
      defaultValue: "",
    },
  ];

  const defaultFilters = filterConfigs.reduce<Record<string, string | boolean>>((acc, config) => {
    if (typeof config.defaultValue !== "undefined") {
      acc[config.key] = config.defaultValue;
    }
    return acc;
  }, {});
  defaultFilters.search = "";

  return (
    <div className="space-y-0">
      <StandardTabs
        tabs={viewModes}
        activeTab={viewMode}
        onTabChange={setViewMode}
        variant="colored"
        size="md"
        className="pl-4"
      />

      <StandardFilters
        filters={filterOptions as Record<string, string | boolean>}
        filterConfigs={filterConfigs}
        defaultFilters={defaultFilters}
        onFilterChange={(key, value) =>
          setFilterOptions({
            ...filterOptions,
            [key]: value as string,
          })
        }
        onResetFilters={() =>
          setFilterOptions({
            ...filterOptions,
            ...defaultFilters,
          })
        }
        searchPlaceholder="Search bills..."
        searchValue={filterOptions.search ?? ""}
        onSearchChange={(value) =>
          setFilterOptions({
            ...filterOptions,
            search: value,
          })
        }
        mode="collapsible"
      />
    </div>
  );
};

export default BillViewTabs;
