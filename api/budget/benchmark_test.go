package handler

import (
	"testing"
	"time"

	"github.com/thef4tdaddy/violet-vault/api/_pkg/budget"
)

// BenchmarkCalculate benchmarks the core Calculate function
func BenchmarkCalculate(b *testing.B) {
	// Setup test data
	envelopes := make([]budget.Envelope, 100)
	transactions := make([]budget.Transaction, 1000)

	for i := 0; i < 100; i++ {
		envelopes[i] = budget.Envelope{
			ID:             formatBenchID("env", i),
			Name:           "Test Envelope",
			CurrentBalance: 1000.0,
			Type:           budget.EnvelopeTypeStandard,
		}
	}

	for i := 0; i < 1000; i++ {
		transactions[i] = budget.Transaction{
			ID:         formatBenchID("tx", i),
			EnvelopeID: formatBenchID("env", i%100),
			Type:       "expense",
			Amount:     -50.0,
			Date:       time.Now().Format("2006-01-02"),
		}
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, _ = budget.Calculate(envelopes, transactions)
	}
}

// Helper function to format benchmark IDs
func formatBenchID(prefix string, id int) string {
	return prefix + "-" + string(rune(id%10+'0')) + string(rune(id/10%10+'0')) + string(rune(id/100%10+'0'))
}
