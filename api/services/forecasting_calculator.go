package services

import (
	"math"
	"violet-vault/api/models"
)

// BillCoverageInput represents anonymized bill data for coverage calculation
type BillCoverageInput struct {
	ID           string `json:"id"`
	AmountCents  int64  `json:"amountCents"`
	DueDateDays  int    `json:"dueDateDays"`  // Days until due (relative)
	EnvelopeID   string `json:"envelopeId"`
}

// EnvelopeCoverageInput represents anonymized envelope data
type EnvelopeCoverageInput struct {
	ID                  string `json:"id"`
	CurrentBalanceCents int64  `json:"currentBalanceCents"`
	MonthlyTargetCents  int64  `json:"monthlyTargetCents"`
	IsDiscretionary     bool   `json:"isDiscretionary"`
}

// AllocationInput represents allocation amount for an envelope
type AllocationInput struct {
	EnvelopeID  string `json:"envelopeId"`
	AmountCents int64  `json:"amountCents"`
}

// CoverageRequest is the request for coverage calculation
type CoverageRequest struct {
	Bills               []BillCoverageInput     `json:"bills"`
	Envelopes           []EnvelopeCoverageInput `json:"envelopes"`
	Allocations         []AllocationInput       `json:"allocations"`
	PaycheckAmountCents int64                   `json:"paycheckAmountCents"`
	DaysUntilNextPayday int                     `json:"daysUntilNextPayday"`
}

// BillCoverageResult represents coverage status for a single bill
type BillCoverageResult struct {
	BillID            string  `json:"billId"`
	EnvelopeID        string  `json:"envelopeId"`
	CurrentBalance    int64   `json:"currentBalance"`
	AllocationAmount  int64   `json:"allocationAmount"`
	ProjectedBalance  int64   `json:"projectedBalance"`
	BillAmount        int64   `json:"billAmount"`
	Shortage          int64   `json:"shortage"`
	CoveragePercent   float64 `json:"coveragePercent"`
	Status            string  `json:"status"` // "covered", "partial", "uncovered"
	DaysUntilDue      int     `json:"daysUntilDue"`
}

// CoverageResponse is the response from coverage calculation
type CoverageResponse struct {
	Bills          []BillCoverageResult `json:"bills"`
	TotalShortage  int64                `json:"totalShortage"`
	CriticalCount  int                  `json:"criticalCount"`
}

// CalculateBillCoverage calculates coverage status for all bills
// Performance target: <1ms for 20 bills
func CalculateBillCoverage(req CoverageRequest) CoverageResponse {
	// Create map for quick envelope lookup
	envelopeMap := make(map[string]EnvelopeCoverageInput)
	for _, env := range req.Envelopes {
		envelopeMap[env.ID] = env
	}

	// Create map for allocation lookup
	allocationMap := make(map[string]int64)
	for _, alloc := range req.Allocations {
		allocationMap[alloc.EnvelopeID] = alloc.AmountCents
	}

	// Calculate coverage for each bill
	results := make([]BillCoverageResult, 0, len(req.Bills))
	totalShortage := int64(0)
	criticalCount := 0

	for _, bill := range req.Bills {
		envelope, envelopeExists := envelopeMap[bill.EnvelopeID]
		allocationAmount := allocationMap[bill.EnvelopeID]

		var result BillCoverageResult
		if !envelopeExists {
			// Bill has no envelope - mark as uncovered
			result = BillCoverageResult{
				BillID:           bill.ID,
				EnvelopeID:       bill.EnvelopeID,
				CurrentBalance:   0,
				AllocationAmount: allocationAmount,
				ProjectedBalance: allocationAmount,
				BillAmount:       bill.AmountCents,
				Shortage:         bill.AmountCents - allocationAmount,
				CoveragePercent:  0.0,
				Status:           "uncovered",
				DaysUntilDue:     bill.DueDateDays,
			}
		} else {
			// Calculate projected balance
			currentBalance := envelope.CurrentBalanceCents
			projectedBalance := currentBalance + allocationAmount
			billAmount := bill.AmountCents

			// Calculate shortage (positive = short, negative = surplus)
			shortage := billAmount - projectedBalance
			if shortage < 0 {
				shortage = 0 // No shortage
			}

			// Calculate coverage percentage
			coveragePercent := 0.0
			if billAmount > 0 {
				coveragePercent = (float64(projectedBalance) / float64(billAmount)) * 100.0
			}

			// Determine status
			status := "uncovered"
			if coveragePercent >= 100.0 {
				status = "covered"
			} else if coveragePercent >= 50.0 {
				status = "partial"
			}

			result = BillCoverageResult{
				BillID:           bill.ID,
				EnvelopeID:       bill.EnvelopeID,
				CurrentBalance:   currentBalance,
				AllocationAmount: allocationAmount,
				ProjectedBalance: projectedBalance,
				BillAmount:       billAmount,
				Shortage:         shortage,
				CoveragePercent:  math.Round(coveragePercent*10) / 10, // Round to 1 decimal
				Status:           status,
				DaysUntilDue:     bill.DueDateDays,
			}
		}

		// Track totals
		if result.Shortage > 0 {
			totalShortage += result.Shortage
		}
		if result.Status == "uncovered" || (result.Status == "partial" && result.CoveragePercent < 50) {
			criticalCount++
		}

		results = append(results, result)
	}

	return CoverageResponse{
		Bills:         results,
		TotalShortage: totalShortage,
		CriticalCount: criticalCount,
	}
}
