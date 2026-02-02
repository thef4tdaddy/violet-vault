package handler

import (
	"fmt"
	"math/rand"
	"time"
)

// Realistic merchant names organized by category
var merchantData = map[string][]string{
	"Groceries": {
		"Whole Foods Market", "Trader Joe's", "Safeway", "Kroger", "Publix",
		"Walmart Supercenter", "Target", "Costco Wholesale", "Aldi", "Food Lion",
		"Giant Eagle", "H-E-B", "Wegmans", "Fresh Market", "Sprouts Farmers Market",
	},
	"Dining": {
		"Chipotle Mexican Grill", "Panera Bread", "Olive Garden", "Chick-fil-A",
		"Starbucks", "McDonald's", "Subway", "The Cheesecake Factory", "Red Lobster",
		"Applebee's", "Buffalo Wild Wings", "Five Guys", "In-N-Out Burger",
		"Dunkin'", "Pizza Hut", "Domino's Pizza", "Taco Bell", "Wendy's",
	},
	"Transportation": {
		"Shell Gas Station", "Chevron", "BP", "ExxonMobil", "Uber",
		"Lyft", "AutoZone", "O'Reilly Auto Parts", "Jiffy Lube",
		"Tesla Supercharger", "Enterprise Rent-A-Car", "Hertz",
	},
	"Entertainment": {
		"AMC Theatres", "Regal Cinemas", "Netflix", "Spotify Premium",
		"Amazon Prime Video", "Hulu", "Disney+", "HBO Max", "Apple Music",
		"YouTube Premium", "Nintendo eShop", "PlayStation Store", "Xbox Live",
		"Steam", "Epic Games Store",
	},
	"Shopping": {
		"Amazon.com", "Best Buy", "Home Depot", "Lowe's", "IKEA",
		"Macy's", "Nordstrom", "Gap", "Old Navy", "H&M",
		"Zara", "Nike Store", "Adidas", "Foot Locker", "Dick's Sporting Goods",
	},
	"Healthcare": {
		"CVS Pharmacy", "Walgreens", "Rite Aid", "Kaiser Permanente",
		"UnitedHealthcare", "Blue Cross Blue Shield", "Minute Clinic",
		"Planned Parenthood", "Quest Diagnostics", "LabCorp",
	},
	"Utilities": {
		"PG&E", "Duke Energy", "Southern California Edison", "Con Edison",
		"Xcel Energy", "Comcast Xfinity", "AT&T", "Verizon", "T-Mobile",
		"Spectrum Internet", "CenturyLink",
	},
	"Personal": {
		"Planet Fitness", "LA Fitness", "Equinox", "Gold's Gym",
		"Ulta Beauty", "Sephora", "Great Clips", "Sport Clips", "SuperCuts",
	},
}

var envelopeCategories = []string{
	"Groceries", "Dining", "Transportation", "Entertainment",
	"Shopping", "Healthcare", "Utilities", "Personal", "Savings", "Housing",
}

var envelopeColors = []string{
	"#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
	"#EC4899", "#14B8A6", "#F97316", "#06B6D4", "#84CC16",
}

// GenerateMockData generates realistic financial data with balanced math
func GenerateMockData(targetRecords int) *DemoDataResponse {
	startTime := time.Now()
	
	// Use a fixed seed for reproducibility in benchmarks
	rng := rand.New(rand.NewSource(42))
	
	// Generate envelopes (aim for ~1/3 of total records)
	envelopeCount := targetRecords / 30
	if envelopeCount < 10 {
		envelopeCount = 10
	}
	
	envelopes := generateEnvelopes(rng, envelopeCount)
	bills := generateBills(rng, 15) // Fixed number of bills
	
	// Calculate remaining records for transactions
	transactionCount := targetRecords - len(envelopes) - len(bills)
	if transactionCount < 100 {
		transactionCount = 100
	}
	
	transactions := generateTransactions(rng, envelopes, bills, transactionCount)
	
	generationTime := time.Since(startTime).Milliseconds()
	
	return &DemoDataResponse{
		Envelopes:        envelopes,
		Transactions:     transactions,
		Bills:            bills,
		GeneratedAt:      time.Now().UTC().Format(time.RFC3339),
		RecordCount:      len(envelopes) + len(transactions) + len(bills),
		GenerationTimeMs: generationTime,
	}
}

func generateEnvelopes(rng *rand.Rand, count int) []Envelope {
	envelopes := make([]Envelope, count)
	now := time.Now().Unix()
	
	for i := 0; i < count; i++ {
		category := envelopeCategories[rng.Intn(len(envelopeCategories))]
		color := envelopeColors[rng.Intn(len(envelopeColors))]
		balance := float64(rng.Intn(5000)) + rng.Float64()*1000
		
		var envelopeType string
		if i%5 == 0 {
			envelopeType = "goal"
		} else {
			envelopeType = "standard"
		}
		
		envelope := Envelope{
			ID:             fmt.Sprintf("env-%d", i+1),
			Name:           fmt.Sprintf("%s Fund", category),
			Type:           envelopeType,
			Category:       category,
			CurrentBalance: balance,
			Color:          color,
			AutoAllocate:   true,
			Archived:       false,
			LastModified:   now * 1000,
			CreatedAt:      (now - int64(rng.Intn(31536000))) * 1000, // Random time in past year
		}
		
		// Add type-specific fields
		if envelopeType == "standard" {
			monthlyBudget := float64(rng.Intn(2000)) + 100
			biweeklyAlloc := monthlyBudget / 2
			envelope.MonthlyBudget = &monthlyBudget
			envelope.BiweeklyAllocation = &biweeklyAlloc
		} else if envelopeType == "goal" {
			targetAmount := balance + float64(rng.Intn(10000)) + 1000
			priority := []string{"low", "medium", "high"}[rng.Intn(3)]
			isPaused := false
			isCompleted := false
			monthlyContrib := float64(rng.Intn(500)) + 50
			
			envelope.TargetAmount = &targetAmount
			envelope.Priority = &priority
			envelope.IsPaused = &isPaused
			envelope.IsCompleted = &isCompleted
			envelope.MonthlyContribution = &monthlyContrib
			
			targetDate := time.Now().AddDate(0, rng.Intn(24)+1, 0)
			envelope.TargetDate = &targetDate
		}
		
		envelopes[i] = envelope
	}
	
	return envelopes
}

func generateBills(rng *rand.Rand, count int) []Envelope {
	bills := make([]Envelope, count)
	now := time.Now().Unix()
	
	billNames := []string{
		"Rent/Mortgage", "Electric Bill", "Water Bill", "Internet",
		"Phone Plan", "Car Insurance", "Health Insurance", "Netflix",
		"Spotify", "Gym Membership", "Car Payment", "Student Loan",
		"Credit Card Payment", "Home Insurance", "Gas/Heating",
	}
	
	for i := 0; i < count; i++ {
		amount := float64(rng.Intn(500)) + 50
		dueDate := rng.Intn(28) + 1
		interestRate := 0.0
		if i >= 10 { // Some bills have interest (loans, credit cards)
			interestRate = float64(rng.Intn(20)) + rng.Float64()*5
		}
		
		creditor := billNames[i]
		status := "active"
		isPaid := false
		minPayment := amount * 0.15
		
		bill := Envelope{
			ID:             fmt.Sprintf("bill-%d", i+1),
			Name:           billNames[i],
			Type:           "liability",
			Category:       "Bills",
			CurrentBalance: amount,
			Color:          "#EF4444",
			AutoAllocate:   true,
			Archived:       false,
			LastModified:   now * 1000,
			CreatedAt:      (now - int64(rng.Intn(31536000))) * 1000,
			Status:         &status,
			DueDate:        &dueDate,
			InterestRate:   &interestRate,
			MinimumPayment: &minPayment,
			Creditor:       &creditor,
			IsPaid:         &isPaid,
			OriginalBalance: &amount,
		}
		
		bills[i] = bill
	}
	
	return bills
}

func generateTransactions(rng *rand.Rand, envelopes []Envelope, bills []Envelope, count int) []Transaction {
	transactions := make([]Transaction, count)
	now := time.Now()
	
	// Calculate total income needed to balance expenses
	totalIncome := 0.0
	incomeCount := count / 20 // 5% of transactions are income
	expenseCount := count - incomeCount
	
	// Generate expenses first to know how much income we need
	for i := 0; i < expenseCount; i++ {
		category := envelopeCategories[rng.Intn(len(envelopeCategories))]
		merchants := merchantData[category]
		if len(merchants) == 0 {
			category = "Shopping"
			merchants = merchantData[category]
		}
		
		merchant := merchants[rng.Intn(len(merchants))]
		amount := -(float64(rng.Intn(200)) + rng.Float64()*50) // Negative for expenses
		
		// Pick random envelope
		envelopeID := envelopes[rng.Intn(len(envelopes))].ID
		
		// Random date within last 90 days
		daysAgo := rng.Intn(90)
		txDate := now.AddDate(0, 0, -daysAgo)
		
		description := fmt.Sprintf("Purchase at %s", merchant)
		
		transactions[i] = Transaction{
			ID:           fmt.Sprintf("txn-%d", i+1),
			Date:         txDate.Format("2006-01-02"),
			Amount:       amount,
			EnvelopeID:   envelopeID,
			Category:     category,
			Type:         "expense",
			Merchant:     &merchant,
			Description:  &description,
			LastModified: now.Unix() * 1000,
			CreatedAt:    txDate.Unix() * 1000,
			IsScheduled:  false,
		}
		
		totalIncome += -amount // Add absolute value to income needed
	}
	
	// Add 20% buffer to ensure positive balance
	totalIncome = totalIncome * 1.2
	
	// Generate income transactions
	incomePerTransaction := totalIncome / float64(incomeCount)
	incomeSources := []string{
		"Direct Deposit - Salary", "Freelance Payment", "Bonus",
		"Investment Returns", "Side Hustle Income", "Refund",
	}
	
	for i := expenseCount; i < count; i++ {
		source := incomeSources[rng.Intn(len(incomeSources))]
		amount := incomePerTransaction + (rng.Float64()-0.5)*200 // Add some variation
		
		// Pick random envelope for income allocation
		envelopeID := envelopes[rng.Intn(len(envelopes))].ID
		
		daysAgo := rng.Intn(90)
		txDate := now.AddDate(0, 0, -daysAgo)
		
		description := source
		
		transactions[i] = Transaction{
			ID:           fmt.Sprintf("txn-%d", i+1),
			Date:         txDate.Format("2006-01-02"),
			Amount:       amount, // Positive for income
			EnvelopeID:   envelopeID,
			Category:     "Income",
			Type:         "income",
			Merchant:     &source,
			Description:  &description,
			LastModified: now.Unix() * 1000,
			CreatedAt:    txDate.Unix() * 1000,
			IsScheduled:  false,
		}
	}
	
	return transactions
}
