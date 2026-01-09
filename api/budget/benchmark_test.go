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
	bills := make([]Bill, 100)

	for i := 0; i < 100; i++ {
		envelopes[i] = Envelope{
			ID:                 formatBenchID("env", i),
			Name:               "Test Envelope",
			CurrentBalance:     1000.0,
			MonthlyBudget:      500.0,
			BiweeklyAllocation: 230.77,
			EnvelopeType:       EnvelopeTypeVariable,
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

	for i := 0; i < 100; i++ {
		bills[i] = Bill{
			ID:         formatBenchID("bill", i),
			EnvelopeID: formatBenchID("env", i),
			Amount:     -100.0,
			DueDate:    date(i % 30),
			IsPaid:     false,
			Name:       "Test Bill",
		}
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, _ = Calculate(envelopes, transactions, bills)
	}
}

// BenchmarkCalculateSmall benchmarks with small dataset
func BenchmarkCalculateSmall(b *testing.B) {
	envelopes := []Envelope{
		{ID: "env1", CurrentBalance: 500, MonthlyBudget: 600},
		{ID: "env2", CurrentBalance: 1200, BiweeklyAllocation: 600},
	}

	transactions := []Transaction{
		{ID: "tx1", EnvelopeID: "env1", Type: "expense", Amount: -50, Date: date(-1)},
		{ID: "tx2", EnvelopeID: "env2", Type: "expense", Amount: -100, Date: date(-2)},
	}

	bills := []Bill{
		{ID: "bill1", EnvelopeID: "env2", Amount: -1200, DueDate: date(5), IsPaid: false},
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, _ = Calculate(envelopes, transactions, bills)
	}
}

// BenchmarkCalculateMedium benchmarks with medium dataset
func BenchmarkCalculateMedium(b *testing.B) {
	envelopes := make([]Envelope, 50)
	transactions := make([]Transaction, 500)
	bills := make([]Bill, 50)

	for i := 0; i < 50; i++ {
		envelopes[i] = Envelope{
			ID:             formatBenchID("env", i),
			CurrentBalance: 1000.0,
			MonthlyBudget:  500.0,
		}
	}

	for i := 0; i < 500; i++ {
		transactions[i] = Transaction{
			ID:         formatBenchID("tx", i),
			EnvelopeID: formatBenchID("env", i%50),
			Type:       "expense",
			Amount:     -50.0,
			Date:       date(-i % 90),
		}
	}

	for i := 0; i < 50; i++ {
		bills[i] = Bill{
			ID:         formatBenchID("bill", i),
			EnvelopeID: formatBenchID("env", i),
			Amount:     -100.0,
			DueDate:    date(i % 30),
			IsPaid:     false,
		}
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, _ = Calculate(envelopes, transactions, bills)
	}
}

// BenchmarkCalculateLarge benchmarks with large dataset
func BenchmarkCalculateLarge(b *testing.B) {
	envelopes := make([]Envelope, 500)
	transactions := make([]Transaction, 5000)
	bills := make([]Bill, 500)

	for i := 0; i < 500; i++ {
		envelopes[i] = Envelope{
			ID:             formatBenchID("env", i),
			CurrentBalance: 1000.0,
			MonthlyBudget:  500.0,
		}
	}

	for i := 0; i < 5000; i++ {
		transactions[i] = Transaction{
			ID:         formatBenchID("tx", i),
			EnvelopeID: formatBenchID("env", i%500),
			Type:       "expense",
			Amount:     -50.0,
			Date:       date(-i % 365),
		}
	}

	for i := 0; i < 500; i++ {
		bills[i] = Bill{
			ID:         formatBenchID("bill", i),
			EnvelopeID: formatBenchID("env", i),
			Amount:     -100.0,
			DueDate:    date(i % 30),
			IsPaid:     false,
		}
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, _ = Calculate(envelopes, transactions, bills)
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
				MonthlyBudget:  500.0,
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
			Bills:        []Bill{},
		}
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, _ = ProcessBatch(requests)
	}
}

// BenchmarkProcessBatchLarge benchmarks large batch processing
func BenchmarkProcessBatchLarge(b *testing.B) {
	requests := make([]BatchItem, 100)

	for i := 0; i < 100; i++ {
		envelopes := make([]Envelope, 5)
		transactions := make([]Transaction, 50)

		for j := 0; j < 5; j++ {
			envelopes[j] = Envelope{
				ID:             formatBenchID("env", i*5+j),
				CurrentBalance: 1000.0,
				MonthlyBudget:  500.0,
			}
		}

		for j := 0; j < 50; j++ {
			transactions[j] = Transaction{
				ID:         formatBenchID("tx", i*50+j),
				EnvelopeID: formatBenchID("env", i*5+(j%5)),
				Type:       "expense",
				Amount:     -50.0,
				Date:       date(-j),
			}
		}

		requests[i] = BatchItem{
			UserID:       formatBenchID("user", i),
			Envelopes:    envelopes,
			Transactions: transactions,
			Bills:        []Bill{},
		}
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, _ = ProcessBatch(requests)
	}
}

// BenchmarkValidateRequest benchmarks request validation
func BenchmarkValidateRequest(b *testing.B) {
	envelopes := make([]Envelope, 100)
	transactions := make([]Transaction, 1000)
	bills := make([]Bill, 100)

	for i := 0; i < 100; i++ {
		envelopes[i] = Envelope{
			ID:             formatBenchID("env", i),
			Name:           "Test Envelope",
			CurrentBalance: 1000.0,
			MonthlyBudget:  500.0,
			EnvelopeType:   EnvelopeTypeVariable,
		}
	}

	for i := 0; i < 1000; i++ {
		transactions[i] = Transaction{
			ID:         formatBenchID("tx", i),
			EnvelopeID: formatBenchID("env", i%100),
			Type:       "expense",
			Amount:     -50.0,
			Date:       date(-i),
		}
	}

	for i := 0; i < 100; i++ {
		bills[i] = Bill{
			ID:         formatBenchID("bill", i),
			EnvelopeID: formatBenchID("env", i),
			Amount:     -100.0,
			DueDate:    date(i),
			Name:       "Test Bill",
			Frequency:  "monthly",
		}
	}

	req := BudgetCalculationRequest{
		Envelopes:    envelopes,
		Transactions: transactions,
		Bills:        bills,
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_ = ValidateRequest(req)
	}
}

// BenchmarkValidateBatchRequest benchmarks batch validation
func BenchmarkValidateBatchRequest(b *testing.B) {
	requests := make([]BatchItem, 50)

	for i := 0; i < 50; i++ {
		envelopes := make([]Envelope, 10)
		transactions := make([]Transaction, 100)

		for j := 0; j < 10; j++ {
			envelopes[j] = Envelope{
				ID:             formatBenchID("env", i*10+j),
				CurrentBalance: 1000.0,
				MonthlyBudget:  500.0,
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
			Bills:        []Bill{},
		}
	}

	req := BatchRequest{
		Requests: requests,
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_ = ValidateBatchRequest(req)
	}
}

// Helper function to format benchmark IDs
func formatBenchID(prefix string, id int) string {
	return prefix + "-" + string(rune(id%10+'0')) + string(rune(id/10%10+'0')) + string(rune(id/100%10+'0'))
}
