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
import type { Dispatch, SetStateAction } from "react";
import StandardFilters from "../../ui/StandardFilters";
import { DEBT_TYPE_CONFIG } from "../../../constants/debts";

interface DebtFiltersProps {
  filterOptions: Record<string, string | boolean>;
  setFilterOptions: Dispatch<SetStateAction<Record<string, string | boolean>>>;
  debtTypes?: Record<string, string>;
  debtsByType?: Record<string, unknown[]>;
}

const DebtFilters = ({ filterOptions, setFilterOptions, debtTypes = {}, debtsByType = {} }: DebtFiltersProps) => {
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

  const defaultFilters = {
    type: "all",
    status: "all",
    sortBy: "balance_desc",
    showPaidOff: false,
  } as const;

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilterOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilterOptions({ ...defaultFilters });
  };

  return (
    <StandardFilters
      filters={filterOptions}
      filterConfigs={filterConfigs}
      defaultFilters={defaultFilters}
      onFilterChange={handleFilterChange}
      onResetFilters={handleResetFilters}
      mode="collapsible"
    />
  );
};

export default DebtFilters;
