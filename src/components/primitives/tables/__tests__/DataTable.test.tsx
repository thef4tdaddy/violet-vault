import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { DataTable, type Column } from "../DataTable";
import "@testing-library/jest-dom";
import * as virtual from "@tanstack/react-virtual";

// Mock @tanstack/react-virtual
vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: vi.fn(() => ({
    getVirtualItems: () => [],
    getTotalSize: () => 0,
  })),
}));

interface TestItem {
  id: string;
  name: string;
  email: string;
  role: string;
}

describe("DataTable", () => {
  const mockData: TestItem[] = [
    { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
    { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "User" },
  ];

  const mockColumns: Column<TestItem>[] = [
    {
      key: "name",
      header: "Name",
      accessor: (row) => row.name,
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      accessor: (row) => row.email,
    },
    {
      key: "role",
      header: "Role",
      accessor: (row) => row.role,
      width: "10rem",
    },
  ];

  const getRowId = (row: TestItem) => row.id;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render table with all columns", () => {
      render(
        <DataTable data={mockData} columns={mockColumns} getRowId={getRowId} virtualized={false} />
      );

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Role")).toBeInTheDocument();
    });

    it("should render all rows with non-virtualized mode", () => {
      render(
        <DataTable data={mockData} columns={mockColumns} getRowId={getRowId} virtualized={false} />
      );

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    });

    it("should show sortable indicator on sortable columns", () => {
      render(
        <DataTable data={mockData} columns={mockColumns} getRowId={getRowId} virtualized={false} />
      );

      const nameHeader = screen.getByText("Name").parentElement;
      expect(nameHeader).toHaveTextContent("⇅");
    });

    it("should not show sortable indicator on non-sortable columns", () => {
      render(
        <DataTable data={mockData} columns={mockColumns} getRowId={getRowId} virtualized={false} />
      );

      const emailHeader = screen.getByRole("columnheader", { name: /email/i });
      expect(within(emailHeader).queryByLabelText("Sortable column")).not.toBeInTheDocument();
      expect(emailHeader).not.toHaveTextContent("⇅");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          virtualized={false}
          className="custom-table"
        />
      );

      expect(container.querySelector(".custom-table")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when loading is true", () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          loading={true}
          virtualized={false}
        />
      );

      const skeletons = screen
        .getAllByRole("generic")
        .filter((el) => el.classList.contains("animate-pulse"));
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should not render data when loading", () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          loading={true}
          virtualized={false}
        />
      );

      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty state when data is empty", () => {
      render(<DataTable data={[]} columns={mockColumns} getRowId={getRowId} virtualized={false} />);

      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("should show custom empty message", () => {
      render(
        <DataTable
          data={[]}
          columns={mockColumns}
          getRowId={getRowId}
          emptyMessage="No items found"
          virtualized={false}
        />
      );

      expect(screen.getByText("No items found")).toBeInTheDocument();
    });

    it("should not render headers in empty state", () => {
      render(<DataTable data={[]} columns={mockColumns} getRowId={getRowId} virtualized={false} />);

      expect(screen.queryByText("Name")).not.toBeInTheDocument();
    });
  });

  describe("Row Selection", () => {
    it("should render checkboxes when selectable is true", () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          selectable={true}
          virtualized={false}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBe(mockData.length + 1); // +1 for select all
    });

    it("should not render checkboxes when selectable is false", () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          selectable={false}
          virtualized={false}
        />
      );

      expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    });

    it("should check selected rows", () => {
      const selectedRows = new Set(["1", "2"]);

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          selectable={true}
          selectedRows={selectedRows}
          virtualized={false}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      // Skip the first checkbox (select all)
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).toBeChecked();
      expect(checkboxes[3]).not.toBeChecked();
    });

    it("should call onSelectionChange when row is selected", async () => {
      const onSelectionChange = vi.fn();
      const selectedRows = new Set<string>();

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          selectable={true}
          selectedRows={selectedRows}
          onSelectionChange={onSelectionChange}
          virtualized={false}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      await userEvent.click(checkboxes[1]); // Click first row checkbox

      expect(onSelectionChange).toHaveBeenCalledWith(new Set(["1"]));
    });

    it("should call onSelectionChange when row is deselected", async () => {
      const onSelectionChange = vi.fn();
      const selectedRows = new Set(["1"]);

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          selectable={true}
          selectedRows={selectedRows}
          onSelectionChange={onSelectionChange}
          virtualized={false}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      await userEvent.click(checkboxes[1]); // Click first row checkbox

      expect(onSelectionChange).toHaveBeenCalledWith(new Set());
    });

    it("should select all rows when select all is clicked", async () => {
      const onSelectionChange = vi.fn();
      const selectedRows = new Set<string>();

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          selectable={true}
          selectedRows={selectedRows}
          onSelectionChange={onSelectionChange}
          virtualized={false}
        />
      );

      const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
      await userEvent.click(selectAllCheckbox);

      expect(onSelectionChange).toHaveBeenCalledWith(new Set(["1", "2", "3"]));
    });

    it("should deselect all rows when select all is unchecked", async () => {
      const onSelectionChange = vi.fn();
      const selectedRows = new Set(["1", "2", "3"]);

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          selectable={true}
          selectedRows={selectedRows}
          onSelectionChange={onSelectionChange}
          virtualized={false}
        />
      );

      const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
      await userEvent.click(selectAllCheckbox);

      expect(onSelectionChange).toHaveBeenCalledWith(new Set());
    });

    it("should check select all when all rows are selected", () => {
      const selectedRows = new Set(["1", "2", "3"]);

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          selectable={true}
          selectedRows={selectedRows}
          virtualized={false}
        />
      );

      const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
      expect(selectAllCheckbox).toBeChecked();
    });
  });

  describe("Row Click", () => {
    it("should call onRowClick when row is clicked", async () => {
      const onRowClick = vi.fn();

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          onRowClick={onRowClick}
          virtualized={false}
        />
      );

      await userEvent.click(screen.getByText("John Doe"));

      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it("should not call onRowClick when checkbox is clicked", async () => {
      const onRowClick = vi.fn();
      const onSelectionChange = vi.fn();

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          onRowClick={onRowClick}
          selectable={true}
          selectedRows={new Set()}
          onSelectionChange={onSelectionChange}
          virtualized={false}
        />
      );

      const checkbox = screen.getAllByRole("checkbox")[1];
      await userEvent.click(checkbox);

      expect(onRowClick).not.toHaveBeenCalled();
      expect(onSelectionChange).toHaveBeenCalled();
    });
  });

  describe("Virtualization", () => {
    it("should use virtualization when virtualized is true", () => {
      render(
        <DataTable data={mockData} columns={mockColumns} getRowId={getRowId} virtualized={true} />
      );

      // useVirtualizer is mocked at the top of the file
      expect(virtual.useVirtualizer).toHaveBeenCalledWith(
        expect.objectContaining({
          count: mockData.length,
          enabled: true,
        })
      );
    });

    it("should not use virtualization when virtualized is false", () => {
      render(
        <DataTable data={mockData} columns={mockColumns} getRowId={getRowId} virtualized={false} />
      );

      // Data should render normally
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  describe("Column Widths", () => {
    it("should apply custom column widths", () => {
      const { container } = render(
        <DataTable data={mockData} columns={mockColumns} getRowId={getRowId} virtualized={false} />
      );

      const headers = container.querySelectorAll("[role='row']");
      expect(headers.length).toBeGreaterThan(0);

      const headerRow = Array.from(headers).find((el) =>
        (el as HTMLElement).style.gridTemplateColumns.includes("10rem")
      );
      expect(headerRow).toBeDefined();
    });
  });
});
