import { readFileContent } from "../fileUtils";
import { vi } from "vitest";

describe("fileUtils", () => {
  describe("readFileContent", () => {
    it("should read file content successfully", async () => {
      const file = new Blob(["test content"], { type: "text/plain" });
      const content = await readFileContent(file);
      expect(content).toBe("test content");
    });

    it("should reject if no file is provided", async () => {
      await expect(readFileContent(null)).rejects.toThrow("No file provided.");
    });

    it("should handle FileReader errors", async () => {
      const file = new Blob(["test content"], { type: "text/plain" });
      const error = new Error("Test error");

      // Create a mock FileReader class
      class MockFileReader {
        onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
        onerror: ((e: ProgressEvent<FileReader>) => void) | null = null;
        readAsText = vi.fn(() => {
          // Simulate error asynchronously
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(error as unknown as ProgressEvent<FileReader>);
            }
          }, 0);
        });
      }

      // Mock the global FileReader
      const originalFileReader = global.FileReader;
      global.FileReader = MockFileReader as unknown as typeof FileReader;

      try {
        await expect(readFileContent(file)).rejects.toThrow("Failed to read file.");
      } finally {
        // Restore original FileReader
        global.FileReader = originalFileReader;
      }
    });
  });
});
