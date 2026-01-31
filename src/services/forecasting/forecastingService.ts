/**
 * Forecasting Service - Issue #1853
 * Bill coverage calculation with Go backend integration and JavaScript fallback
 */

export interface BillCoverageInput {
  id: string;
  amountCents: number;
  dueDateDays: number; // Relative days until due
  envelopeId: string;
}

export interface EnvelopeCoverageInput {
  id: string;
  currentBalanceCents: number;
  monthlyTargetCents: number;
  isDiscretionary: boolean;
}

export interface AllocationInput {
  envelopeId: string;
  amountCents: number;
}

export interface CoverageRequest {
  bills: BillCoverageInput[];
  envelopes: EnvelopeCoverageInput[];
  allocations: AllocationInput[];
  paycheckAmountCents: number;
  daysUntilNextPayday: number;
}

export interface BillCoverageResult {
  billId: string;
  envelopeId: string;
  currentBalance: number;
  allocationAmount: number;
  projectedBalance: number;
  billAmount: number;
  shortage: number;
  coveragePercent: number;
  status: "covered" | "partial" | "uncovered";
  daysUntilDue: number;
}

export interface CoverageResponse {
  bills: BillCoverageResult[];
  totalShortage: number;
  criticalCount: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const COVERAGE_ENDPOINT = "/api/forecasting/calculate-coverage";

/**
 * Calculate bill coverage using Go engine with JavaScript fallback
 */
export async function calculateBillCoverage(
  request: CoverageRequest
): Promise<CoverageResponse> {
  try {
    // Try Go engine first
    const response = await fetch(`${API_BASE_URL}${COVERAGE_ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (response.ok) {
      return await response.json();
    }

    console.warn(
      `Go forecasting engine failed with status ${response.status}, falling back to JavaScript`
    );
  } catch (error) {
    console.warn(
      `Go forecasting engine unavailable (${error instanceof Error ? error.message : "unknown error"}), falling back to JavaScript`
    );
  }

  // Fallback to JavaScript implementation
  return calculateBillCoverageJS(request);
}

/**
 * JavaScript fallback implementation for bill coverage calculation
 */
export function calculateBillCoverageJS(
  request: CoverageRequest
): CoverageResponse {
  // Create maps for quick lookup
  const envelopeMap = new Map(request.envelopes.map((e) => [e.id, e]));
  const allocationMap = new Map(request.allocations.map((a) => [a.envelopeId, a.amountCents]));

  const results: BillCoverageResult[] = [];
  let totalShortage = 0;
  let criticalCount = 0;

  for (const bill of request.bills) {
    const envelope = envelopeMap.get(bill.envelopeId);
    const allocationAmount = allocationMap.get(bill.envelopeId) || 0;

    if (!envelope) {
      // Bill has no envelope
      const result: BillCoverageResult = {
        billId: bill.id,
        envelopeId: bill.envelopeId,
        currentBalance: 0,
        allocationAmount,
        projectedBalance: allocationAmount,
        billAmount: bill.amountCents,
        shortage: Math.max(0, bill.amountCents - allocationAmount),
        coveragePercent: 0,
        status: "uncovered",
        daysUntilDue: bill.dueDateDays,
      };
      results.push(result);
      totalShortage += result.shortage;
      criticalCount++;
      continue;
    }

    // Calculate coverage
    const currentBalance = envelope.currentBalanceCents;
    const projectedBalance = currentBalance + allocationAmount;
    const billAmount = bill.amountCents;
    const shortage = Math.max(0, billAmount - projectedBalance);
    const coveragePercent =
      billAmount > 0 ? Math.round((projectedBalance / billAmount) * 1000) / 10 : 0;

    // Determine status
    let status: "covered" | "partial" | "uncovered";
    if (coveragePercent >= 100) status = "covered";
    else if (coveragePercent >= 50) status = "partial";
    else status = "uncovered";

    const result: BillCoverageResult = {
      billId: bill.id,
      envelopeId: bill.envelopeId,
      currentBalance,
      allocationAmount,
      projectedBalance,
      billAmount,
      shortage,
      coveragePercent,
      status,
      daysUntilDue: bill.dueDateDays,
    };

    results.push(result);

    if (shortage > 0) {
      totalShortage += shortage;
    }
    if (status === "uncovered" || (status === "partial" && coveragePercent < 50)) {
      criticalCount++;
    }
  }

  return {
    bills: results,
    totalShortage,
    criticalCount,
  };
}
