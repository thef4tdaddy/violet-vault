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

      const reader = {
        readAsText: vi.fn(),
        onload: vi.fn(),
        onerror: vi.fn(),
      };

      vi.spyOn(window, "FileReader").mockImplementation(() => reader);

      const promise = readFileContent(file);
      reader.onerror(error);

      await expect(promise).rejects.toThrow("Failed to read file.");
    });
  });
});
