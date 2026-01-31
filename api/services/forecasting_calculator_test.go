package services

import (
	"testing"
)

func TestCalculateBillCoverage_Comprehensive(t *testing.T) {
	req := CoverageRequest{
		Bills: []BillCoverageInput{
			{ID: "bill1_covered", AmountCents: 1000, DueDateDays: 5, EnvelopeID: "env1"},
			{ID: "bill2_partial", AmountCents: 1000, DueDateDays: 5, EnvelopeID: "env2"},
			{ID: "bill3_uncovered", AmountCents: 1000, DueDateDays: 5, EnvelopeID: "env3"},
			{ID: "bill4_no_env", AmountCents: 1000, DueDateDays: 5, EnvelopeID: "missing"},
			{ID: "bill5_zero", AmountCents: 0, DueDateDays: 5, EnvelopeID: "env1"},
		},
		Envelopes: []EnvelopeCoverageInput{
			{ID: "env1", CurrentBalanceCents: 1000, MonthlyTargetCents: 1000}, // Fully covered
			{ID: "env2", CurrentBalanceCents: 200, MonthlyTargetCents: 1000},  // 200 + 300 alloc = 500 (50%)
			{ID: "env3", CurrentBalanceCents: 0, MonthlyTargetCents: 1000},    // 0 + 100 alloc = 100 (10%)
		},
		Allocations: []AllocationInput{
			{EnvelopeID: "env1", AmountCents: 0},
			{EnvelopeID: "env2", AmountCents: 300},
			{EnvelopeID: "env3", AmountCents: 100},
			{EnvelopeID: "missing", AmountCents: 100},
		},
	}

	res := CalculateBillCoverage(req)

	if len(res.Bills) != 5 {
		t.Fatalf("Expected 5 bill results, got %d", len(res.Bills))
	}

	// Status Verification
	statusMap := make(map[string]string)
	for _, b := range res.Bills {
		statusMap[b.BillID] = b.Status
	}

	if statusMap["bill1_covered"] != "covered" {
		t.Errorf("bill1: Expected covered, got %s", statusMap["bill1_covered"])
	}
	if statusMap["bill2_partial"] != "partial" {
		t.Errorf("bill2: Expected partial, got %s", statusMap["bill2_partial"])
	}
	if statusMap["bill3_uncovered"] != "uncovered" {
		t.Errorf("bill3: Expected uncovered, got %s", statusMap["bill3_uncovered"])
	}
	if statusMap["bill4_no_env"] != "uncovered" {
		t.Errorf("bill4: Expected uncovered (missing env), got %s", statusMap["bill4_no_env"])
	}
	if statusMap["bill5_zero"] != "covered" {
		t.Errorf("bill5: Expected covered (zero amount), got %s", statusMap["bill5_zero"])
	}

	// Total Shortage:
	// bill1: 1000 - 1000 = 0
	// bill2: 1000 - 500 = 500
	// bill3: 1000 - 100 = 900
	// bill4: 1000 - 100 = 900
	// Total: 2300
	if res.TotalShortage != 2300 {
		t.Errorf("Expected 2300 total shortage, got %d", res.TotalShortage)
	}

	// Critical Count: bill3, bill4 (bill2 is 50% so not critical by current logic)
	if res.CriticalCount != 2 {
		t.Errorf("Expected 2 critical bills, got %d", res.CriticalCount)
	}
}
