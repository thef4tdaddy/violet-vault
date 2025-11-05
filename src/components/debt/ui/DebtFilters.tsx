/**
 * DebtFilters - Wrapper around StandardFilters for debt-specific configuration
 *
 * This component configures StandardFilters with debt-specific options (type, status, sort, etc.)
 * and maintains the debt dashboard's unique filter requirements.
 *
 * All filter UI logic is centralized in StandardFilters to ensure consistency across
 * Debt, Transactions, and Bills pages. This approach follows DRY principles and makes
 * filter behavior updates apply universally.
 */
import StandardFilters from "../../ui/StandardFilters";
import { DEBT_TYPE_CONFIG } from "../../../constants/debts";

/**
 * Debt filtering and sorting controls
 * Configures StandardFilters with debt-specific options
 */
const DebtFilters = ({ filterOptions, setFilterOptions, debtTypes = {}, debtsByType = {} }) => {
  // Build debt type options dynamically
  const debtTypeOptions = [
    { value: "all", label: "All Types" },
    ...Object.values(debtTypes || {}).map((type) => {
      const typeStr = String(type);
      const config = DEBT_TYPE_CONFIG[typeStr as keyof typeof DEBT_TYPE_CONFIG];
      const count = debtsByType?.[typeStr]?.length || 0;
      return {
        value: typeStr,
        label: `${config?.name || typeStr}${count > 0 ? ` (${count})` : ""}`,
      };
    }),
  ];

  // Configure filters for debt dashboard
  const filterConfigs = [
    {
      key: "type",
      label: "Debt Type",
      type: "select" as const,
      options: debtTypeOptions,
      defaultValue: "all",
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "paid_off", label: "Paid Off" },
        { value: "deferred", label: "Deferred" },
      ],
      defaultValue: "all",
    },
    {
      key: "sortBy",
      label: "Sort By",
      type: "select" as const,
      options: [
        { value: "balance_desc", label: "Highest Balance" },
        { value: "balance_asc", label: "Lowest Balance" },
        { value: "payment_desc", label: "Highest Payment" },
        { value: "rate_desc", label: "Highest Interest Rate" },
        { value: "name", label: "Name A-Z" },
      ],
      defaultValue: "balance_desc",
    },
    {
      key: "showPaidOff",
      label: "Show Paid Off",
      type: "checkbox" as const,
      defaultValue: false,
    },
  ];

  // Default filter values when disabled
  const defaultFilters = {
    type: "all",
    status: "all",
    sortBy: "balance_desc",
    showPaidOff: false,
  };

  return (
    <StandardFilters
      filterConfigs={filterConfigs}
      filters={filterOptions}
      onFilterChange={(key, value) => {
        setFilterOptions((prev) => ({
          ...prev,
          [key]: value,
        }));
      }}
      defaultFilters={defaultFilters}
      mode="collapsible"
    />
  );
};

export default DebtFilters;
