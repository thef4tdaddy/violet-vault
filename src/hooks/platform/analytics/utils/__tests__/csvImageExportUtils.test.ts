import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  convertToCSV,
  downloadCSV,
  exportChartAsImage,
  getChartElements,
} from "../csvImageExportUtils";
import logger from "@/utils/core/common/logger";

// Mock logger to avoid noise
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("csvImageExportUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the document body
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("convertToCSV", () => {
    it("should convert analytics data with transactions to CSV format", () => {
      const analyticsData = {
        transactions: [
          {
            date: "2024-01-15",
            description: "Grocery shopping",
            amount: 150.5,
            category: "Food",
            envelopeName: "Groceries",
          },
          {
            date: "2024-01-16",
            description: "Gas station",
            amount: 45.0,
            category: "Transportation",
            envelopeName: "Car",
          },
        ],
      };

      const result = convertToCSV(analyticsData);

      expect(result).toContain("Date,Description,Amount,Category,Envelope");
      expect(result).toContain("2024-01-15,Grocery shopping,150.5,Food,Groceries");
      expect(result).toContain("2024-01-16,Gas station,45,Transportation,Car");
    });

    it("should handle transaction fields with commas by wrapping in quotes", () => {
      const analyticsData = {
        transactions: [
          {
            date: "2024-01-15",
            description: "Store A, Store B",
            amount: 100,
            category: "Shopping, Retail",
            envelopeName: "General",
          },
        ],
      };

      const result = convertToCSV(analyticsData);

      expect(result).toContain('"Store A, Store B"');
      expect(result).toContain('"Shopping, Retail"');
    });

    it("should handle missing optional fields with defaults", () => {
      const analyticsData = {
        transactions: [
          {
            // All fields missing
          },
        ],
      };

      const result = convertToCSV(analyticsData);

      expect(result).toContain("Date,Description,Amount,Category,Envelope");
      expect(result).toContain(",,0,Uncategorized,None");
    });

    it("should handle partially missing fields", () => {
      const analyticsData = {
        transactions: [
          {
            date: "2024-01-15",
            amount: 50,
            // description, category, and envelopeName missing
          },
        ],
      };

      const result = convertToCSV(analyticsData);

      expect(result).toContain("2024-01-15,,50,Uncategorized,None");
    });

    it("should handle empty transactions array", () => {
      const analyticsData = {
        transactions: [],
      };

      const result = convertToCSV(analyticsData);

      expect(result).toBe("Date,Description,Amount,Category,Envelope");
    });

    it("should handle undefined transactions", () => {
      const analyticsData = {};

      const result = convertToCSV(analyticsData);

      expect(result).toBe("Date,Description,Amount,Category,Envelope");
    });

    it("should handle null analytics data", () => {
      const analyticsData = {
        transactions: undefined,
      };

      const result = convertToCSV(analyticsData);

      expect(result).toBe("Date,Description,Amount,Category,Envelope");
    });

    it("should properly format multiple transactions", () => {
      const analyticsData = {
        transactions: [
          {
            date: "2024-01-01",
            description: "Transaction 1",
            amount: 100,
            category: "Category 1",
            envelopeName: "Envelope 1",
          },
          {
            date: "2024-01-02",
            description: "Transaction 2",
            amount: 200,
            category: "Category 2",
            envelopeName: "Envelope 2",
          },
          {
            date: "2024-01-03",
            description: "Transaction 3",
            amount: 300,
            category: "Category 3",
            envelopeName: "Envelope 3",
          },
        ],
      };

      const result = convertToCSV(analyticsData);
      const lines = result.split("\\n");

      expect(lines).toHaveLength(4); // 1 header + 3 data rows
      expect(lines[0]).toBe("Date,Description,Amount,Category,Envelope");
      expect(lines[1]).toBe("2024-01-01,Transaction 1,100,Category 1,Envelope 1");
      expect(lines[2]).toBe("2024-01-02,Transaction 2,200,Category 2,Envelope 2");
      expect(lines[3]).toBe("2024-01-03,Transaction 3,300,Category 3,Envelope 3");
    });
  });

  describe("downloadCSV", () => {
    let createElementSpy: ReturnType<typeof vi.spyOn>;
    let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let mockLink: HTMLAnchorElement;

    beforeEach(() => {
      mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: { visibility: "" },
        download: "",
      } as unknown as HTMLAnchorElement;

      createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(mockLink);
      createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
      revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

      // Mock appendChild and removeChild
      vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink);
      vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink);
    });

    afterEach(() => {
      createElementSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it("should create a blob and download CSV file", () => {
      const csvContent = "Date,Description,Amount\\n2024-01-15,Test,100";
      const fileName = "test-export.csv";

      downloadCSV(csvContent, fileName);

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(mockLink.setAttribute).toHaveBeenCalledWith("href", "blob:mock-url");
      expect(mockLink.setAttribute).toHaveBeenCalledWith("download", fileName);
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
    });

    it("should set link visibility to hidden", () => {
      const csvContent = "test content";
      const fileName = "test.csv";

      downloadCSV(csvContent, fileName);

      expect(mockLink.style.visibility).toBe("hidden");
    });

    it("should handle empty CSV content", () => {
      const csvContent = "";
      const fileName = "empty.csv";

      downloadCSV(csvContent, fileName);

      expect(mockLink.click).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it("should handle long CSV content", () => {
      const csvContent = "test,data\\n" + "value1,value2\\n".repeat(100);
      const fileName = "large-data.csv";

      downloadCSV(csvContent, fileName);

      expect(mockLink.click).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });
  });

  describe("exportChartAsImage", () => {
    let mockElement: Element;
    let mockCanvas: HTMLCanvasElement;
    let mockHtml2Canvas: ReturnType<typeof vi.fn>;
    let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let mockLink: HTMLAnchorElement;

    beforeEach(() => {
      mockElement = document.createElement("div");
      mockElement.setAttribute("data-chart-export", "test-chart");

      // Create a real mock link
      mockLink = {
        href: "",
        download: "",
        click: vi.fn(),
      } as unknown as HTMLAnchorElement;

      mockCanvas = {
        toBlob: vi.fn((callback) => {
          const blob = new Blob(["mock-image-data"], { type: "image/png" });
          callback(blob);
        }),
      } as unknown as HTMLCanvasElement;

      mockHtml2Canvas = vi.fn().mockResolvedValue(mockCanvas);

      createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-image-url");
      revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

      // Mock document.createElement to return our mock link
      vi.spyOn(document, "createElement").mockReturnValue(mockLink);
    });

    afterEach(() => {
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it("should export chart as PNG image successfully", async () => {
      const chartName = "test-chart";

      await exportChartAsImage(mockElement, chartName, mockHtml2Canvas);

      expect(mockHtml2Canvas).toHaveBeenCalledWith(mockElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });
      expect(mockCanvas.toBlob).toHaveBeenCalled();
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-image-url");
    });

    it("should create download link with correct filename format", async () => {
      const chartName = "spending-chart";
      const mockDate = new Date("2024-01-15T10:00:00Z");
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      await exportChartAsImage(mockElement, chartName, mockHtml2Canvas);

      expect(mockLink.download).toContain("VioletVault-");
      expect(mockLink.download).toContain("spending-chart");
      expect(mockLink.download).toContain(".png");
      expect(mockLink.click).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it("should handle null blob from canvas.toBlob", async () => {
      const chartName = "test-chart";
      mockCanvas.toBlob = vi.fn((callback) => {
        callback(null);
      }) as unknown as HTMLCanvasElement["toBlob"];

      await exportChartAsImage(mockElement, chartName, mockHtml2Canvas);

      expect(mockHtml2Canvas).toHaveBeenCalled();
      // Should not throw error, just not create download link
      expect(createObjectURLSpy).not.toHaveBeenCalled();
    });

    it("should handle html2canvas errors gracefully", async () => {
      const chartName = "test-chart";
      const error = new Error("html2canvas failed");
      mockHtml2Canvas.mockRejectedValue(error);

      await exportChartAsImage(mockElement, chartName, mockHtml2Canvas);

      expect(logger.warn).toHaveBeenCalledWith(
        `Failed to export chart: ${chartName}`,
        expect.objectContaining({
          error: error.message,
        })
      );
    });

    it("should handle non-Error exceptions", async () => {
      const chartName = "test-chart";
      const errorMessage = "string error";
      mockHtml2Canvas.mockRejectedValue(errorMessage);

      await exportChartAsImage(mockElement, chartName, mockHtml2Canvas);

      expect(logger.warn).toHaveBeenCalledWith(
        `Failed to export chart: ${chartName}`,
        expect.objectContaining({
          error: errorMessage,
        })
      );
    });

    it("should use image/png format for blob", async () => {
      const chartName = "test-chart";
      const toBlobSpy = vi.fn((callback, type) => {
        expect(type).toBe("image/png");
        const blob = new Blob(["mock-image-data"], { type: "image/png" });
        callback(blob);
      });
      mockCanvas.toBlob = toBlobSpy as unknown as HTMLCanvasElement["toBlob"];

      await exportChartAsImage(mockElement, chartName, mockHtml2Canvas);

      expect(toBlobSpy).toHaveBeenCalledWith(expect.any(Function), "image/png");
    });
  });

  describe("getChartElements", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("should return elements with data-chart-export attribute", () => {
      const chart1 = document.createElement("div");
      chart1.setAttribute("data-chart-export", "chart1");
      document.body.appendChild(chart1);

      const chart2 = document.createElement("div");
      chart2.setAttribute("data-chart-export", "chart2");
      document.body.appendChild(chart2);

      const result = getChartElements();

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(chart1);
      expect(result[1]).toBe(chart2);
    });

    it("should return empty array when no chart elements exist", () => {
      const result = getChartElements();

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should only return elements with data-chart-export attribute", () => {
      const chart = document.createElement("div");
      chart.setAttribute("data-chart-export", "chart1");
      document.body.appendChild(chart);

      const nonChart = document.createElement("div");
      nonChart.setAttribute("data-other-attribute", "value");
      document.body.appendChild(nonChart);

      const result = getChartElements();

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(chart);
    });

    it("should return elements from anywhere in the document", () => {
      const container = document.createElement("div");
      const chart1 = document.createElement("canvas");
      chart1.setAttribute("data-chart-export", "nested-chart");
      container.appendChild(chart1);
      document.body.appendChild(container);

      const result = getChartElements();

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(chart1);
    });

    it("should work with different element types", () => {
      const divChart = document.createElement("div");
      divChart.setAttribute("data-chart-export", "div-chart");
      document.body.appendChild(divChart);

      const canvasChart = document.createElement("canvas");
      canvasChart.setAttribute("data-chart-export", "canvas-chart");
      document.body.appendChild(canvasChart);

      const svgChart = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgChart.setAttribute("data-chart-export", "svg-chart");
      document.body.appendChild(svgChart);

      const result = getChartElements();

      expect(result).toHaveLength(3);
      expect(result[0]).toBe(divChart);
      expect(result[1]).toBe(canvasChart);
      expect(result[2]).toBe(svgChart);
    });
  });
});
