import React, { useRef, useCallback, useMemo } from "react";
import { useVirtualizer, type Virtualizer, type VirtualItem } from "@tanstack/react-virtual";

/**
 * Column definition for DataTable
 */
export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

/**
 * Props for DataTable component
 */
export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  getRowId: (row: T) => string;
  virtualized?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Loading skeleton for table rows
 */
const LoadingSkeleton: React.FC<{ columns: number }> = ({ columns }) => (
  <div className="divide-y divide-gray-200">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="px-6 py-4 flex gap-4">
        {[...Array(columns)].map((_, colIndex) => (
          <div
            key={colIndex}
            className="h-4 bg-gray-200 rounded animate-pulse"
            style={{ width: colIndex === 0 ? "3rem" : "8rem" }}
          />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Empty state for table
 */
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="px-6 py-12 text-center">
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

// Stable empty Set to avoid recreating on every render
const EMPTY_SET = new Set<string>();

/**
 * DataTable - Reusable virtualized table component
 *
 * Features:
 * - Virtualization with @tanstack/react-virtual for performance
 * - Row selection with checkboxes
 * - Click handlers for rows
 * - Loading and empty states
 * - Responsive grid layout
 * - Customizable columns
 *
 * Performance Notes:
 * - For optimal performance, memoize the `columns` and `data` arrays in the parent component
 * - The `gridTemplate` calculation depends on the `columns` array
 * - The `handleSelectAll` callback depends on the `data` array
 */
/**
 * Internal Row component to handle rendering of a single row
 */
const TableRow = <T,>({
  row,
  columns,
  gridTemplate,
  isSelected,
  selectable,
  onRowClick,
  onRowSelect,
  style,
  className = "",
}: {
  row: T;
  columns: Column<T>[];
  gridTemplate: string;
  isSelected: boolean;
  selectable: boolean;
  onRowClick?: (row: T) => void;
  onRowSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
  className?: string;
}) => (
  <div
    role="row"
    className={`grid items-center hover:bg-gray-50 cursor-pointer border-b border-gray-200 ${className}`}
    style={{ ...style, gridTemplateColumns: gridTemplate }}
    onClick={() => onRowClick?.(row)}
  >
    {selectable && (
      <div className="px-4 flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onRowSelect}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
    )}
    {columns.map((column) => (
      <div key={column.key} role="cell" className="px-4 py-3 text-sm text-gray-900">
        {column.accessor(row)}
      </div>
    ))}
  </div>
);

/**
 * Internal Header component
 */
const DataTableHeader = <T,>({
  gridTemplate,
  selectable,
  isAllSelected,
  onSelectAll,
  columns,
}: {
  gridTemplate: string;
  selectable: boolean;
  isAllSelected: boolean;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  columns: Column<T>[];
}) => (
  <div
    role="row"
    className="bg-white sticky top-0 z-10 border-b-2 border-gray-300 grid"
    style={{ gridTemplateColumns: gridTemplate }}
  >
    {selectable && (
      <div role="columnheader" className="px-4 py-4 flex items-center justify-center">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onSelectAll}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
    )}
    {columns.map((column) => (
      <div
        key={column.key}
        role="columnheader"
        className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        <div className="flex items-center gap-1">
          {column.header}
          {column.sortable && (
            <span className="text-gray-400" aria-label="Sortable column">
              ⇅
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
);

/**
 * Internal Body component
 */
const TableBody = <T,>({
  data,
  columns,
  gridTemplate,
  selectedRowsSet,
  selectable,
  onRowClick,
  handleRowSelect,
  getRowId,
  virtualized,
  rowVirtualizer,
}: {
  data: T[];
  columns: Column<T>[];
  gridTemplate: string;
  selectedRowsSet: Set<string>;
  selectable: boolean;
  onRowClick?: (row: T) => void;
  handleRowSelect: (rowId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  getRowId: (row: T) => string;
  virtualized: boolean;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
}) => (
  <div role="rowgroup">
    {virtualized ? (
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
          const row = data[virtualRow.index];
          const rowId = getRowId(row);
          return (
            <TableRow
              key={rowId}
              row={row}
              columns={columns}
              gridTemplate={gridTemplate}
              isSelected={selectedRowsSet.has(rowId)}
              selectable={selectable}
              onRowClick={onRowClick}
              onRowSelect={(e) => handleRowSelect(rowId, e)}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            />
          );
        })}
      </div>
    ) : (
      <div>
        {data.map((row) => {
          const rowId = getRowId(row);
          return (
            <TableRow
              key={rowId}
              row={row}
              columns={columns}
              gridTemplate={gridTemplate}
              isSelected={selectedRowsSet.has(rowId)}
              selectable={selectable}
              onRowClick={onRowClick}
              onRowSelect={(e) => handleRowSelect(rowId, e)}
            />
          );
        })}
      </div>
    )}
  </div>
);

/**
 * DataTable - Reusable virtualized table component
 */
export const DataTable = <T,>({
  data,
  columns,
  onRowClick,
  selectable = false,
  selectedRows,
  onSelectionChange,
  getRowId,
  virtualized = true,
  loading = false,
  emptyMessage = "No data available",
  className = "",
}: DataTableProps<T>) => {
  const parentRef = useRef<HTMLDivElement | null>(null);

  // Use stable empty Set if selectedRows is not provided
  const selectedRowsSet = selectedRows ?? EMPTY_SET;

  // Setup virtualization
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 64, []),
    overscan: 10,
    enabled: virtualized,
  });

  // Calculate grid template columns
  const gridTemplate = useMemo(() => {
    const selectColumn = selectable ? "3rem" : "";
    const dataColumns = columns.map((col) => col.width || "1fr").join(" ");
    return `${selectColumn} ${dataColumns}`.trim();
  }, [columns, selectable]);

  // Handle row selection toggle
  const handleRowSelect = useCallback(
    (rowId: string, event: React.ChangeEvent<HTMLInputElement>) => {
      if (!onSelectionChange) return;

      const newSelection = new Set(selectedRowsSet);
      if (event.target.checked) {
        newSelection.add(rowId);
      } else {
        newSelection.delete(rowId);
      }
      onSelectionChange(newSelection);
    },
    [selectedRowsSet, onSelectionChange]
  );

  // Handle select all
  const handleSelectAll = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!onSelectionChange) return;

      if (event.target.checked) {
        const allIds = new Set(data.map(getRowId));
        onSelectionChange(allIds);
      } else {
        onSelectionChange(new Set());
      }
    },
    [data, getRowId, onSelectionChange]
  );

  // Check if all rows are selected
  const isAllSelected = useMemo(() => {
    return data.length > 0 && selectedRowsSet.size === data.length;
  }, [data.length, selectedRowsSet.size]);

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white shadow-sm rounded-lg overflow-hidden ${className}`}>
        <LoadingSkeleton columns={columns.length + (selectable ? 1 : 0)} />
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={`bg-white shadow-sm rounded-lg overflow-hidden ${className}`}>
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`bg-white shadow-sm rounded-lg overflow-auto max-h-full ${className}`}
    >
      <div role="table" className="w-full min-w-full">
        <DataTableHeader
          gridTemplate={gridTemplate}
          selectable={selectable}
          isAllSelected={isAllSelected}
          onSelectAll={handleSelectAll}
          columns={columns}
        />

        <TableBody
          data={data}
          columns={columns}
          gridTemplate={gridTemplate}
          selectedRowsSet={selectedRowsSet}
          selectable={selectable}
          onRowClick={onRowClick}
          handleRowSelect={handleRowSelect}
          getRowId={getRowId}
          virtualized={virtualized}
          rowVirtualizer={rowVirtualizer}
        />
      </div>
    </div>
  );
};

export default DataTable;
