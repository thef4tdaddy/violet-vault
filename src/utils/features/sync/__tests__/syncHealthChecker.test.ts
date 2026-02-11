import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runImmediateSyncHealthCheck } from "../syncHealthChecker";
import { budgetDb } from "@/db/budgetDb";
import { syncOrchestrator } from "@/services/sync/syncOrchestrator";
import { detectLocalData } from "@/utils/features/sync/dataDetectionHelper";

// Mock dependencies
vi.mock("@/db/budgetDb");
vi.mock("@/services/sync/syncOrchestrator");
vi.mock("@/utils/features/sync/dataDetectionHelper");
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Sync Health Checker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should pass all checks when system is healthy", async () => {
    // Setup healthy state
    vi.mocked(budgetDb.getDatabaseStats).mockResolvedValue({ envelopes: 10, transactions: 100 });

    // Mock sync orchestrator state
    (syncOrchestrator as any).fetchLocalData = vi.fn().mockResolvedValue({ envelopes: [] });
    (syncOrchestrator as any).isRunning = true;

    vi.mocked(detectLocalData).mockResolvedValue({ hasData: true, totalItems: 50, timestamp: 0 });

    const results = await runImmediateSyncHealthCheck();

    expect(results.passed).toBe(5);
    expect(results.failed).toBe(0);
    expect(results.tests).toHaveLength(5);
    expect(results.tests.every((t) => t.status === "✅ PASSED")).toBe(true);
  });

  it("should fail gracefully when DB check crashes", async () => {
    // Force crash
    vi.mocked(budgetDb.getDatabaseStats).mockRejectedValue(new Error("DB Connection Failed"));

    const results = await runImmediateSyncHealthCheck();

    expect(results.failed).toBeGreaterThan(0);
    const dbTest = results.tests.find((t) => t.name === "General System Health");
    expect(dbTest?.error).toContain("DB Connection Failed");
  });

  it("should detect missing orchestrator", async () => {
    // Setup minimal DB mock to pass first check
    vi.mocked(budgetDb.getDatabaseStats).mockResolvedValue({});

    // Mock missing orchestrator readiness
    // We can't delete imports, but we can verify the check logic by mocking fetchLocalData to undefined if possible
    // Alternatively, verify logic handles it.
    // In our mock, fetchLocalData is a spy. Let's make it undefined.
    // @ts-ignore
    syncOrchestrator.fetchLocalData = undefined;

    const results = await runImmediateSyncHealthCheck();

    const orchTest = results.tests.find((t) => t.name === "SyncOrchestrator Readiness");
    expect(orchTest?.status).toBe("❌ FAILED");
  });

  it("should detect invalid data schema", async () => {
    vi.mocked(budgetDb.getDatabaseStats).mockResolvedValue({});
    (syncOrchestrator as any).fetchLocalData = vi.fn().mockResolvedValue({ invalid: true });

    const results = await runImmediateSyncHealthCheck();

    const schemaTest = results.tests.find((t) => t.name.includes("Extract"));
    expect(schemaTest?.status).toBe("❌ FAILED");
  });
});
