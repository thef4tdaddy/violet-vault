package allocate

import (
	"fmt"
	"sort"
)

// adjustTargetsForFrequency adjusts monthly targets based on paycheck frequency
// Weekly = monthlyTarget / 4, Biweekly = monthlyTarget / 2, Monthly = monthlyTarget (unchanged)
func adjustTargetsForFrequency(envelopes []Envelope, frequency string) []Envelope {
	if frequency == "" || frequency == "monthly" {
		return envelopes // No adjustment needed for monthly or empty
	}

	adjusted := make([]Envelope, len(envelopes))
	for i, env := range envelopes {
		adjusted[i] = env // Copy all fields

		switch frequency {
		case "weekly":
			// Weekly = monthlyTarget / 4 (rounded with +2 for fair rounding)
			adjusted[i].MonthlyTargetCents = (env.MonthlyTargetCents + 2) / 4
		case "biweekly":
			// Biweekly = monthlyTarget / 2 (rounded with +1 for fair rounding)
			adjusted[i].MonthlyTargetCents = (env.MonthlyTargetCents + 1) / 2
		default:
			// Unknown frequency, leave unchanged
			adjusted[i].MonthlyTargetCents = env.MonthlyTargetCents
		}
	}

	return adjusted
}

// EvenSplitStrategy allocates funds weighted by monthly targets
// Formula: allocation = (envelope.target / total_targets) * paycheck_amount
// If frequency is provided, adjusts monthly targets before allocation
func EvenSplitStrategy(paycheckCents int64, envelopes []Envelope, frequency string) []AllocationItem {
	if len(envelopes) == 0 {
		return []AllocationItem{}
	}

	// Adjust targets based on frequency (if provided)
	adjustedEnvelopes := adjustTargetsForFrequency(envelopes, frequency)

	// Calculate total of all monthly targets
	var totalTargets int64
	for _, env := range adjustedEnvelopes {
		totalTargets += env.MonthlyTargetCents
	}

	// If no targets set, split evenly
	if totalTargets == 0 {
		return splitEvenly(paycheckCents, adjustedEnvelopes)
	}

	// Allocate proportionally using integer math
	allocations := make([]AllocationItem, 0, len(adjustedEnvelopes))
	var allocated int64

	// First pass: Calculate integer portions
	for _, env := range adjustedEnvelopes {
		// Calculate: (target / totalTargets) * paycheckCents
		amount := (env.MonthlyTargetCents * paycheckCents) / totalTargets

		percentage := float64(env.MonthlyTargetCents) / float64(totalTargets) * 100
		allocations = append(allocations, AllocationItem{
			EnvelopeID:  env.ID,
			AmountCents: amount,
			Reason:      fmt.Sprintf("Even split (%.1f%%)", percentage),
		})
		allocated += amount
	}

	// Distribute dust using largest remainder method
	dust := paycheckCents - allocated
	if dust != 0 {
		allocations = distributeDust(dust, allocations, adjustedEnvelopes, paycheckCents, totalTargets)
	}

	return allocations
}

// LastSplitStrategy clones the previous allocation
func LastSplitStrategy(paycheckCents int64, envelopes []Envelope, previous *[]AllocationItem) []AllocationItem {
	if previous == nil || len(*previous) == 0 {
		// Fallback to even split if no previous allocation
		return EvenSplitStrategy(paycheckCents, envelopes, "")
	}

	// Calculate total from previous allocation
	var previousTotal int64
	for _, item := range *previous {
		previousTotal += item.AmountCents
	}

	if previousTotal == 0 {
		return EvenSplitStrategy(paycheckCents, envelopes, "")
	}

	// Scale previous allocation to new paycheck amount
	allocations := make([]AllocationItem, 0, len(*previous))
	var allocated int64

	// First pass: Calculate integer portions
	for _, prevItem := range *previous {
		// Calculate: (prevAmount / previousTotal) * paycheckCents
		amount := (prevItem.AmountCents * paycheckCents) / previousTotal

		percentage := float64(prevItem.AmountCents) / float64(previousTotal) * 100
		allocations = append(allocations, AllocationItem{
			EnvelopeID:  prevItem.EnvelopeID,
			AmountCents: amount,
			Reason:      fmt.Sprintf("Last split (%.1f%%)", percentage),
		})
		allocated += amount
	}

	// Distribute dust
	dust := paycheckCents - allocated
	if dust != 0 {
		// For last split, distribute dust proportionally to previous amounts
		allocations = distributeDustByPreviousAmounts(dust, allocations, *previous, previousTotal, paycheckCents)
	}

	return allocations
}

// TargetFirstStrategy prioritizes "bills" category envelopes before discretionary
func TargetFirstStrategy(paycheckCents int64, envelopes []Envelope) []AllocationItem {
	if len(envelopes) == 0 {
		return []AllocationItem{}
	}

	// Sort envelopes: bills first, then by priority, then by ID
	sortedEnvelopes := make([]Envelope, len(envelopes))
	copy(sortedEnvelopes, envelopes)

	sort.Slice(sortedEnvelopes, func(i, j int) bool {
		// Bills category first
		if sortedEnvelopes[i].Category == "bills" && sortedEnvelopes[j].Category != "bills" {
			return true
		}
		if sortedEnvelopes[i].Category != "bills" && sortedEnvelopes[j].Category == "bills" {
			return false
		}
		// Then by priority (lower number = higher priority)
		if sortedEnvelopes[i].Priority != sortedEnvelopes[j].Priority {
			return sortedEnvelopes[i].Priority < sortedEnvelopes[j].Priority
		}
		// Finally by ID for consistency
		return sortedEnvelopes[i].ID < sortedEnvelopes[j].ID
	})

	allocations := make([]AllocationItem, 0, len(sortedEnvelopes))
	remaining := paycheckCents

	// Fill each envelope to its monthly target, in priority order
	for _, env := range sortedEnvelopes {
		if remaining <= 0 {
			break
		}

		// Calculate how much this envelope needs to reach target
		needed := env.MonthlyTargetCents - env.CurrentBalanceCents
		if needed < 0 {
			needed = 0 // Envelope already at or above target
		}

		// Allocate the minimum of what's needed and what's remaining
		amount := needed
		if amount > remaining {
			amount = remaining
		}

		if amount > 0 {
			reason := "Target first"
			if env.Category == "bills" {
				reason = "Bills priority"
			}

			allocations = append(allocations, AllocationItem{
				EnvelopeID:  env.ID,
				AmountCents: amount,
				Reason:      reason,
			})
			remaining -= amount
		}
	}

	// If funds remain after filling all targets, distribute evenly
	if remaining > 0 && len(sortedEnvelopes) > 0 {
		extraPerEnvelope := remaining / int64(len(sortedEnvelopes))
		extraDust := remaining % int64(len(sortedEnvelopes))

		for i := range allocations {
			allocations[i].AmountCents += extraPerEnvelope
		}

		// Distribute dust to first N envelopes
		for i := int64(0); i < extraDust; i++ {
			allocations[i].AmountCents++
		}
	}

	return allocations
}

// Helper: Split evenly when no targets are set
func splitEvenly(paycheckCents int64, envelopes []Envelope) []AllocationItem {
	if len(envelopes) == 0 {
		return []AllocationItem{}
	}

	amountPerEnvelope := paycheckCents / int64(len(envelopes))
	dust := paycheckCents % int64(len(envelopes))

	allocations := make([]AllocationItem, len(envelopes))
	for i, env := range envelopes {
		allocations[i] = AllocationItem{
			EnvelopeID:  env.ID,
			AmountCents: amountPerEnvelope,
			Reason:      fmt.Sprintf("Even split (%.1f%%)", 100.0/float64(len(envelopes))),
		}
	}

	// Distribute dust to first N envelopes
	for i := int64(0); i < dust; i++ {
		allocations[i].AmountCents++
	}

	return allocations
}

// Helper: Distribute dust using largest remainder method
func distributeDust(dust int64, allocations []AllocationItem, envelopes []Envelope, paycheckCents, totalTargets int64) []AllocationItem {
	// Calculate remainders for each envelope
	type remainder struct {
		index int
		value float64
	}

	remainders := make([]remainder, len(envelopes))
	for i, env := range envelopes {
		// Calculate exact allocation: (target / totalTargets) * paycheckCents
		exactAllocation := float64(env.MonthlyTargetCents) * float64(paycheckCents) / float64(totalTargets)
		integerPart := float64(allocations[i].AmountCents)
		remainders[i] = remainder{
			index: i,
			value: exactAllocation - integerPart,
		}
	}

	// Sort by remainder (largest first)
	sort.Slice(remainders, func(i, j int) bool {
		return remainders[i].value > remainders[j].value
	})

	// Distribute dust to envelopes with largest remainders
	dustAbs := dust
	if dustAbs < 0 {
		dustAbs = -dustAbs
	}

	for i := int64(0); i < dustAbs && i < int64(len(remainders)); i++ {
		idx := remainders[i].index
		if dust > 0 {
			allocations[idx].AmountCents++
		} else {
			allocations[idx].AmountCents--
		}
	}

	return allocations
}

// Helper: Distribute dust by previous amounts (for last split)
func distributeDustByPreviousAmounts(dust int64, allocations []AllocationItem, previous []AllocationItem, previousTotal, paycheckCents int64) []AllocationItem {
	type remainder struct {
		index int
		value float64
	}

	remainders := make([]remainder, len(previous))
	for i, prevItem := range previous {
		// Calculate exact allocation
		exactAllocation := float64(prevItem.AmountCents) * float64(paycheckCents) / float64(previousTotal)
		integerPart := float64(allocations[i].AmountCents)
		remainders[i] = remainder{
			index: i,
			value: exactAllocation - integerPart,
		}
	}

	// Sort by remainder (largest first)
	sort.Slice(remainders, func(i, j int) bool {
		return remainders[i].value > remainders[j].value
	})

	// Distribute dust
	dustAbs := dust
	if dustAbs < 0 {
		dustAbs = -dustAbs
	}

	for i := int64(0); i < dustAbs && i < int64(len(remainders)); i++ {
		idx := remainders[i].index
		if dust > 0 {
			allocations[idx].AmountCents++
		} else {
			allocations[idx].AmountCents--
		}
	}

	return allocations
}
