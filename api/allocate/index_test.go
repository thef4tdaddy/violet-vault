package allocate

import (
	"testing"
)

// TestEvenSplitStrategy tests the even split allocation strategy
func TestEvenSplitStrategy(t *testing.T) {
	t.Run("distributes weighted by monthly targets", func(t *testing.T) {
		envelopes := []Envelope{
			{ID: "rent", MonthlyTargetCents: 100000},     // $1000 (40%)
			{ID: "groceries", MonthlyTargetCents: 50000}, // $500 (20%)
			{ID: "savings", MonthlyTargetCents: 100000},  // $1000 (40%)
		}

		allocations := EvenSplitStrategy(250000, envelopes) // $2500

		// Verify allocations sum to exact paycheck amount
		var total int64
		for _, alloc := range allocations {
			total += alloc.AmountCents
		}
		if total != 250000 {
			t.Errorf("Total allocated %d does not equal paycheck %d", total, 250000)
		}

		// Verify each envelope gets proportional amount
		expected := map[string]int64{
			"rent":      100000, // 40% of 250000
			"groceries": 50000,  // 20% of 250000
			"savings":   100000, // 40% of 250000
		}

		for _, alloc := range allocations {
			if alloc.AmountCents != expected[alloc.EnvelopeID] {
				t.Errorf("Envelope %s: expected %d, got %d", alloc.EnvelopeID, expected[alloc.EnvelopeID], alloc.AmountCents)
			}
		}
	})

	t.Run("handles dust correctly with largest remainder method", func(t *testing.T) {
		envelopes := []Envelope{
			{ID: "a", MonthlyTargetCents: 33333},
			{ID: "b", MonthlyTargetCents: 33333},
			{ID: "c", MonthlyTargetCents: 33334},
		}

		allocations := EvenSplitStrategy(100000, envelopes) // $1000

		// Verify exact sum
		var total int64
		for _, alloc := range allocations {
			total += alloc.AmountCents
		}
		if total != 100000 {
			t.Errorf("Total allocated %d does not equal paycheck %d", total, 100000)
		}
	})

	t.Run("handles zero targets with even split", func(t *testing.T) {
		envelopes := []Envelope{
			{ID: "a", MonthlyTargetCents: 0},
			{ID: "b", MonthlyTargetCents: 0},
			{ID: "c", MonthlyTargetCents: 0},
		}

		allocations := EvenSplitStrategy(300000, envelopes) // $3000

		// Should split evenly: $1000 each
		var total int64
		for _, alloc := range allocations {
			total += alloc.AmountCents
		}
		if total != 300000 {
			t.Errorf("Total allocated %d does not equal paycheck %d", total, 300000)
		}

		// Each should get approximately 1/3
		for _, alloc := range allocations {
			if alloc.AmountCents != 100000 {
				t.Errorf("Envelope %s: expected 100000, got %d", alloc.EnvelopeID, alloc.AmountCents)
			}
		}
	})

	t.Run("handles empty envelopes", func(t *testing.T) {
		allocations := EvenSplitStrategy(250000, []Envelope{})
		if len(allocations) != 0 {
			t.Errorf("Expected 0 allocations for empty envelopes, got %d", len(allocations))
		}
	})

	t.Run("handles large numbers without overflow", func(t *testing.T) {
		envelopes := []Envelope{
			{ID: "savings", MonthlyTargetCents: 9_999_999},
		}

		allocations := EvenSplitStrategy(9_999_999, envelopes)

		var total int64
		for _, alloc := range allocations {
			total += alloc.AmountCents
		}
		if total != 9_999_999 {
			t.Errorf("Total allocated %d does not equal paycheck %d", total, 9_999_999)
		}
	})
}

// TestLastSplitStrategy tests the last split allocation strategy
func TestLastSplitStrategy(t *testing.T) {
	t.Run("scales previous allocation to new paycheck amount", func(t *testing.T) {
		envelopes := []Envelope{
			{ID: "rent"},
			{ID: "groceries"},
		}

		previous := &[]AllocationItem{
			{EnvelopeID: "rent", AmountCents: 100000},     // 50% of $2000
			{EnvelopeID: "groceries", AmountCents: 100000}, // 50% of $2000
		}

		allocations := LastSplitStrategy(300000, envelopes, previous) // $3000

		// Should scale to: $1500 each (50% of $3000)
		var total int64
		for _, alloc := range allocations {
			total += alloc.AmountCents
		}
		if total != 300000 {
			t.Errorf("Total allocated %d does not equal paycheck %d", total, 300000)
		}

		expected := map[string]int64{
			"rent":      150000,
			"groceries": 150000,
		}

		for _, alloc := range allocations {
			if alloc.AmountCents != expected[alloc.EnvelopeID] {
				t.Errorf("Envelope %s: expected %d, got %d", alloc.EnvelopeID, expected[alloc.EnvelopeID], alloc.AmountCents)
			}
		}
	})

	t.Run("falls back to even split when no previous allocation", func(t *testing.T) {
		envelopes := []Envelope{
			{ID: "rent", MonthlyTargetCents: 100000},
			{ID: "savings", MonthlyTargetCents: 100000},
		}

		allocations := LastSplitStrategy(200000, envelopes, nil)

		var total int64
		for _, alloc := range allocations {
			total += alloc.AmountCents
		}
		if total != 200000 {
			t.Errorf("Total allocated %d does not equal paycheck %d", total, 200000)
		}
	})

	t.Run("handles cents-perfect math", func(t *testing.T) {
		envelopes := []Envelope{
			{ID: "a"},
			{ID: "b"},
			{ID: "c"},
		}

		previous := &[]AllocationItem{
			{EnvelopeID: "a", AmountCents: 33333},
			{EnvelopeID: "b", AmountCents: 33333},
			{EnvelopeID: "c", AmountCents: 33334},
		}

		allocations := LastSplitStrategy(250000, envelopes, previous)

		var total int64
		for _, alloc := range allocations {
			total += alloc.AmountCents
		}
		if total != 250000 {
			t.Errorf("Total allocated %d does not equal paycheck %d (dust error)", total, 250000)
		}
	})
}

// TestTargetFirstStrategy tests the target first allocation strategy
func TestTargetFirstStrategy(t *testing.T) {
	t.Run("prioritizes bills category first", func(t *testing.T) {
		envelopes := []Envelope{
			{ID: "fun", MonthlyTargetCents: 50000, CurrentBalanceCents: 0, Category: "discretionary"},
			{ID: "rent", MonthlyTargetCents: 100000, CurrentBalanceCents: 0, Category: "bills"},
			{ID: "utilities", MonthlyTargetCents: 30000, CurrentBalanceCents: 0, Category: "bills"},
		}

		allocations := TargetFirstStrategy(180000, envelopes) // $1800

		// Verify total
		var total int64
		for _, alloc := range allocations {
			total += alloc.AmountCents
		}
		if total != 180000 {
			t.Errorf("Total allocated %d does not equal paycheck %d", total, 180000)
		}

		// Bills should be fully funded before discretionary
		expected := map[string]int64{
			"rent":      100000, // Bill - fully funded
			"utilities": 30000,  // Bill - fully funded
			"fun":       50000,  // Discretionary - gets remainder
		}

		for _, alloc := range allocations {
			if alloc.AmountCents != expected[alloc.EnvelopeID] {
				t.Errorf("Envelope %s: expected %d, got %d", alloc.EnvelopeID, expected[alloc.EnvelopeID], alloc.AmountCents)
			}
		}
	})

	t.Run("handles insufficient funds", func(t *testing.T) {
		envelopes := []Envelope{
			{ID: "rent", MonthlyTargetCents: 150000, CurrentBalanceCents: 0, Category: "bills"},
			{ID: "fun", MonthlyTargetCents: 50000, CurrentBalanceCents: 0, Category: "discretionary"},
		}

		allocations := TargetFirstStrategy(100000, envelopes) // Only $1000

		// Should allocate all to rent (bills priority)
		var total int64
		for _, alloc := range allocations {
			total += alloc.AmountCents
		}
		if total != 100000 {
			t.Errorf("Total allocated %d does not equal paycheck %d", total, 100000)
		}

		// Rent gets priority
		if allocations[0].EnvelopeID != "rent" {
			t.Error("Expected rent to be funded first")
		}
		if allocations[0].AmountCents != 100000 {
			t.Errorf("Expected rent to get all $1000, got %d", allocations[0].AmountCents)
		}
	})

	t.Run("respects priority within same category", func(t *testing.T) {
		envelopes := []Envelope{
			{ID: "groceries", MonthlyTargetCents: 50000, CurrentBalanceCents: 0, Category: "bills", Priority: 2},
			{ID: "rent", MonthlyTargetCents: 100000, CurrentBalanceCents: 0, Category: "bills", Priority: 1},
		}

		allocations := TargetFirstStrategy(150000, envelopes)

		// Lower priority number should come first
		if allocations[0].EnvelopeID != "rent" {
			t.Error("Expected rent (priority 1) to be funded before groceries (priority 2)")
		}
	})

	t.Run("distributes extra funds evenly after targets met", func(t *testing.T) {
		envelopes := []Envelope{
			{ID: "rent", MonthlyTargetCents: 100000, CurrentBalanceCents: 0, Category: "bills"},
		}

		allocations := TargetFirstStrategy(150000, envelopes) // $1500, target is $1000

		var total int64
		for _, alloc := range allocations {
			total += alloc.AmountCents
		}
		if total != 150000 {
			t.Errorf("Total allocated %d does not equal paycheck %d", total, 150000)
		}

		// Should get all funds (target $1000 + $500 extra)
		if allocations[0].AmountCents != 150000 {
			t.Errorf("Expected rent to get all $1500, got %d", allocations[0].AmountCents)
		}
	})
}

// TestCentsPerfectMath tests that all strategies handle cents-perfect integer math
func TestCentsPerfectMath(t *testing.T) {
	testCases := []struct {
		name          string
		paycheckCents int64
		envelopes     []Envelope
	}{
		{
			name:          "prime-ish numbers",
			paycheckCents: 333333,
			envelopes: []Envelope{
				{ID: "a", MonthlyTargetCents: 111111},
				{ID: "b", MonthlyTargetCents: 111111},
				{ID: "c", MonthlyTargetCents: 111111},
			},
		},
		{
			name:          "single cent",
			paycheckCents: 1,
			envelopes: []Envelope{
				{ID: "a", MonthlyTargetCents: 100},
			},
		},
		{
			name:          "maximum amount",
			paycheckCents: 9_999_999,
			envelopes: []Envelope{
				{ID: "a", MonthlyTargetCents: 5_000_000},
				{ID: "b", MonthlyTargetCents: 4_999_999},
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Test Even Split
			allocations := EvenSplitStrategy(tc.paycheckCents, tc.envelopes)
			var total int64
			for _, alloc := range allocations {
				total += alloc.AmountCents
			}
			if total != tc.paycheckCents {
				t.Errorf("Even Split: total %d != paycheck %d", total, tc.paycheckCents)
			}

			// Test Target First
			allocations = TargetFirstStrategy(tc.paycheckCents, tc.envelopes)
			total = 0
			for _, alloc := range allocations {
				total += alloc.AmountCents
			}
			if total != tc.paycheckCents {
				t.Errorf("Target First: total %d != paycheck %d", total, tc.paycheckCents)
			}
		})
	}
}
