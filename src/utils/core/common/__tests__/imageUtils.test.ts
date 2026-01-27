import { describe, it, expect, vi, beforeEach } from "vitest";
import { resizeImage } from "../imageUtils";

describe("imageUtils", () => {
  // Mock Image and FileReader since they are browser APIs
  beforeEach(() => {
    vi.stubGlobal(
      "Image",
      class {
        width = 0;
        height = 0;
        onload: () => void = () => {};
        onerror: () => void = () => {};
        set src(_val: string) {
          setTimeout(() => this.onload(), 0);
        }
      }
    );

    vi.stubGlobal(
      "FileReader",
      class {
        onload: (e: any) => void = () => {};
        onerror: () => void = () => {};
        readAsDataURL() {
          setTimeout(() => this.onload({ target: { result: "data:image/png;base64,fake" } }), 0);
        }
      }
    );

    vi.stubGlobal("document", {
      createElement: vi.fn().mockReturnValue({
        getContext: vi.fn().mockReturnValue({
          imageSmoothingEnabled: true,
          imageSmoothingQuality: "high",
          drawImage: vi.fn(),
        }),
        toBlob: (cb: (b: any) => void) => cb(new Blob(["fake"], { type: "image/png" })),
        width: 0,
        height: 0,
      }),
    });
  });

  it("should not resize image if dimensions are within limits", async () => {
    const file = new Blob(["test"], { type: "image/png" }) as any;
    // Set mock image dimensions
    vi.stubGlobal(
      "Image",
      class {
        width = 800;
        height = 600;
        onload: () => void = () => {};
        set src(_val: string) {
          setTimeout(() => this.onload(), 0);
        }
      }
    );

    const result = await resizeImage(file, 1280);
    expect(result).toBe(file);
  });

  it("should resize image if width exceeds limit", async () => {
    const file = new Blob(["test"], { type: "image/png" }) as any;
    const createElementSpy = vi.spyOn(document, "createElement");

    // Set mock image dimensions to exceed limit
    vi.stubGlobal(
      "Image",
      class {
        width = 2000;
        height = 1000;
        onload: () => void = () => {};
        set src(_val: string) {
          setTimeout(() => this.onload(), 0);
        }
      }
    );

    const result = await resizeImage(file, 1280);
    expect(result).not.toBe(file);
    expect(createElementSpy).toHaveBeenCalledWith("canvas");

    const canvas = createElementSpy.mock.results[0].value;
    expect(canvas.width).toBe(1280);
    expect(canvas.height).toBe(640); // 1000 * 1280 / 2000
  });

  it("should resize image if height exceeds limit", async () => {
    const file = new Blob(["test"], { type: "image/png" }) as any;
    const createElementSpy = vi.spyOn(document, "createElement");

    // Set mock image dimensions to exceed limit
    vi.stubGlobal(
      "Image",
      class {
        width = 1000;
        height = 2000;
        onload: () => void = () => {};
        set src(_val: string) {
          setTimeout(() => this.onload(), 0);
        }
      }
    );

    const result = await resizeImage(file, 1280);
    expect(result).not.toBe(file);
    expect(createElementSpy).toHaveBeenCalledWith("canvas");

    const canvas = createElementSpy.mock.results[0].value;
    expect(canvas.width).toBe(640); // 1000 * 1280 / 2000
    expect(canvas.height).toBe(1280);
  });
});
