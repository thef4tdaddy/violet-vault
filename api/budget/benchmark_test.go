package budget

import (
	"testing"
	"time"
)

// BenchmarkCalculate benchmarks the core Calculate function
func BenchmarkCalculate(b *testing.B) {
	// Setup test data
	envelopes := make([]Envelope, 100)
	transactions := make([]Transaction, 1000)

	for i := 0; i < 100; i++ {
		envelopes[i] = Envelope{
			ID:             formatBenchID("env", i),
			Name:           "Test Envelope",
			CurrentBalance: 1000.0,
			Type:           EnvelopeTypeStandard,
		}
	}

	for i := 0; i < 1000; i++ {
		transactions[i] = Transaction{
			ID:         formatBenchID("tx", i),
			EnvelopeID: formatBenchID("env", i%100),
			Type:       "expense",
			Amount:     -50.0,
			Date:       time.Now().Format("2006-01-02"),
		}
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, _ = Calculate(envelopes, transactions)
	}
}

// BenchmarkProcessBatch benchmarks batch processing
func BenchmarkProcessBatch(b *testing.B) {
	requests := make([]BatchItem, 10)

	for i := 0; i < 10; i++ {
		envelopes := make([]Envelope, 10)
		transactions := make([]Transaction, 100)

		for j := 0; j < 10; j++ {
			envelopes[j] = Envelope{
				ID:             formatBenchID("env", i*10+j),
				CurrentBalance: 1000.0,
				Type:           EnvelopeTypeStandard,
			}
		}

		for j := 0; j < 100; j++ {
			transactions[j] = Transaction{
				ID:         formatBenchID("tx", i*100+j),
				EnvelopeID: formatBenchID("env", i*10+(j%10)),
				Type:       "expense",
				Amount:     -50.0,
				Date:       date(-j),
			}
		}

		requests[i] = BatchItem{
			UserID:       formatBenchID("user", i),
			Envelopes:    envelopes,
			Transactions: transactions,
		}
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, _ = ProcessBatch(requests)
	}
}

// Helper function to format benchmark IDs
func formatBenchID(prefix string, id int) string {
	return prefix + "-" + string(rune(id%10+'0')) + string(rune(id/10%10+'0')) + string(rune(id/100%10+'0'))
}
