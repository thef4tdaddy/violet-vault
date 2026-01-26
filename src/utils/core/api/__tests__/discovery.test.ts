import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveServiceUrl, getServicePath } from "../discovery";

describe("Service Discovery", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("should resolve Go backend in production", () => {
    vi.stubEnv("PROD", true);
    const url = resolveServiceUrl("go-backend");
    expect(url).toBe("/api/bug-report");
  });

  it("should resolve Python analytics in production", () => {
    vi.stubEnv("PROD", true);
    const url = resolveServiceUrl("py-analytics");
    expect(url).toBe("/api/analytics");
  });

  it("should resolve Python OCR in production", () => {
    vi.stubEnv("PROD", true);
    const url = resolveServiceUrl("py-ocr");
    expect(url).toBe("/api");
  });

  it("should resolve Python OCR in development", () => {
    // PROD is undefined/falsy by default after unstubAllEnvs in beforeEach
    const url = resolveServiceUrl("py-ocr");
    expect(url).toBe("http://localhost:8000/api");
  });

  it("should allow environment overrides", () => {
    vi.stubEnv("VITE_GO_API_URL", "https://custom-go.io");
    const url = resolveServiceUrl("go-backend");
    expect(url).toBe("https://custom-go.io");
  });

  it("should resolve correct paths for absolute URLs", () => {
    vi.stubEnv("VITE_GO_API_URL", "http://localhost:3001/api");
    const path = getServicePath("go-backend", "/test");
    expect(path).toBe("http://localhost:3001/api/test");
  });

  it("should resolve correct paths for relative URLs", () => {
    vi.stubEnv("PROD", true);
    const path = getServicePath("go-backend", "test");
    expect(path).toBe("/api/bug-report/test");
  });
});
