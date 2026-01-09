package budget

import (
	"fmt"
	"net/http"
	"strings"
)

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidationResult contains validation errors
type ValidationResult struct {
	Valid  bool              `json:"valid"`
	Errors []ValidationError `json:"errors,omitempty"`
}

// RequestLimits defines maximum allowed sizes
const (
	MaxEnvelopes    = 1000
	MaxTransactions = 10000
	MaxBills        = 5000
	MaxBatchSize    = 100
	MaxIDLength     = 100
	MaxNameLength   = 200
)

// ValidateRequest validates a budget calculation request
func ValidateRequest(req BudgetCalculationRequest) ValidationResult {
	result := ValidationResult{Valid: true}

	// Check envelope count
	if len(req.Envelopes) > MaxEnvelopes {
		result.Valid = false
		result.Errors = append(result.Errors, ValidationError{
			Field:   "envelopes",
			Message: fmt.Sprintf("exceeds maximum of %d envelopes", MaxEnvelopes),
		})
	}

	// Check transaction count
	if len(req.Transactions) > MaxTransactions {
		result.Valid = false
		result.Errors = append(result.Errors, ValidationError{
			Field:   "transactions",
			Message: fmt.Sprintf("exceeds maximum of %d transactions", MaxTransactions),
		})
	}

	// Check bill count
	if len(req.Bills) > MaxBills {
		result.Valid = false
		result.Errors = append(result.Errors, ValidationError{
			Field:   "bills",
			Message: fmt.Sprintf("exceeds maximum of %d bills", MaxBills),
		})
	}

	// Validate envelopes
	for i, env := range req.Envelopes {
		if errs := validateEnvelope(env, i); len(errs) > 0 {
			result.Valid = false
			result.Errors = append(result.Errors, errs...)
		}
	}

	// Validate transactions
	for i, tx := range req.Transactions {
		if errs := validateTransaction(tx, i); len(errs) > 0 {
			result.Valid = false
			result.Errors = append(result.Errors, errs...)
		}
	}

	// Validate bills
	for i, bill := range req.Bills {
		if errs := validateBill(bill, i); len(errs) > 0 {
			result.Valid = false
			result.Errors = append(result.Errors, errs...)
		}
	}

	return result
}

// validateEnvelope validates a single envelope
func validateEnvelope(env Envelope, index int) []ValidationError {
	var errors []ValidationError
	prefix := fmt.Sprintf("envelopes[%d]", index)

	// Required: ID
	if env.ID == "" {
		errors = append(errors, ValidationError{
			Field:   prefix + ".id",
			Message: "id is required",
		})
	} else if len(env.ID) > MaxIDLength {
		errors = append(errors, ValidationError{
			Field:   prefix + ".id",
			Message: fmt.Sprintf("id exceeds maximum length of %d", MaxIDLength),
		})
	}

	// Validate name length
	if len(env.Name) > MaxNameLength {
		errors = append(errors, ValidationError{
			Field:   prefix + ".name",
			Message: fmt.Sprintf("name exceeds maximum length of %d", MaxNameLength),
		})
	}

	// Validate envelope type if provided
	if env.EnvelopeType != "" {
		validTypes := []string{
			EnvelopeTypeBill,
			EnvelopeTypeVariable,
			EnvelopeTypeSavings,
			EnvelopeTypeSinkingFund,
			EnvelopeTypeSupplemental,
		}
		if !contains(validTypes, env.EnvelopeType) {
			errors = append(errors, ValidationError{
				Field:   prefix + ".envelopeType",
				Message: fmt.Sprintf("invalid envelope type, must be one of: %s", strings.Join(validTypes, ", ")),
			})
		}
	}

	return errors
}

// validateTransaction validates a single transaction
func validateTransaction(tx Transaction, index int) []ValidationError {
	var errors []ValidationError
	prefix := fmt.Sprintf("transactions[%d]", index)

	// Required: ID
	if tx.ID == "" {
		errors = append(errors, ValidationError{
			Field:   prefix + ".id",
			Message: "id is required",
		})
	} else if len(tx.ID) > MaxIDLength {
		errors = append(errors, ValidationError{
			Field:   prefix + ".id",
			Message: fmt.Sprintf("id exceeds maximum length of %d", MaxIDLength),
		})
	}

	// Required: EnvelopeID
	if tx.EnvelopeID == "" {
		errors = append(errors, ValidationError{
			Field:   prefix + ".envelopeId",
			Message: "envelopeId is required",
		})
	} else if len(tx.EnvelopeID) > MaxIDLength {
		errors = append(errors, ValidationError{
			Field:   prefix + ".envelopeId",
			Message: fmt.Sprintf("envelopeId exceeds maximum length of %d", MaxIDLength),
		})
	}

	// Required: Type
	if tx.Type == "" {
		errors = append(errors, ValidationError{
			Field:   prefix + ".type",
			Message: "type is required",
		})
	} else {
		validTypes := []string{"expense", "income", "transfer", "bill", "recurring_bill"}
		if !contains(validTypes, tx.Type) {
			errors = append(errors, ValidationError{
				Field:   prefix + ".type",
				Message: fmt.Sprintf("invalid type, must be one of: %s", strings.Join(validTypes, ", ")),
			})
		}
	}

	// Validate date format if provided
	if tx.Date != "" {
		if parseDate(tx.Date).IsZero() {
			errors = append(errors, ValidationError{
				Field:   prefix + ".date",
				Message: "invalid date format, must be ISO 8601 (YYYY-MM-DD or RFC3339)",
			})
		}
	}

	// Validate dueDate format if provided
	if tx.DueDate != "" {
		if parseDate(tx.DueDate).IsZero() {
			errors = append(errors, ValidationError{
				Field:   prefix + ".dueDate",
				Message: "invalid dueDate format, must be ISO 8601 (YYYY-MM-DD or RFC3339)",
			})
		}
	}

	return errors
}

// validateBill validates a single bill
func validateBill(bill Bill, index int) []ValidationError {
	var errors []ValidationError
	prefix := fmt.Sprintf("bills[%d]", index)

	// Required: ID
	if bill.ID == "" {
		errors = append(errors, ValidationError{
			Field:   prefix + ".id",
			Message: "id is required",
		})
	} else if len(bill.ID) > MaxIDLength {
		errors = append(errors, ValidationError{
			Field:   prefix + ".id",
			Message: fmt.Sprintf("id exceeds maximum length of %d", MaxIDLength),
		})
	}

	// Validate envelopeId length if provided
	if bill.EnvelopeID != "" && len(bill.EnvelopeID) > MaxIDLength {
		errors = append(errors, ValidationError{
			Field:   prefix + ".envelopeId",
			Message: fmt.Sprintf("envelopeId exceeds maximum length of %d", MaxIDLength),
		})
	}

	// Validate name length
	if len(bill.Name) > MaxNameLength {
		errors = append(errors, ValidationError{
			Field:   prefix + ".name",
			Message: fmt.Sprintf("name exceeds maximum length of %d", MaxNameLength),
		})
	}

	// Validate dueDate format if provided
	if bill.DueDate != "" {
		if parseDate(bill.DueDate).IsZero() {
			errors = append(errors, ValidationError{
				Field:   prefix + ".dueDate",
				Message: "invalid dueDate format, must be ISO 8601 (YYYY-MM-DD or RFC3339)",
			})
		}
	}

	// Validate frequency if provided
	if bill.Frequency != "" {
		validFrequencies := []string{"monthly", "biweekly", "weekly", "quarterly", "yearly"}
		if !contains(validFrequencies, bill.Frequency) {
			errors = append(errors, ValidationError{
				Field:   prefix + ".frequency",
				Message: fmt.Sprintf("invalid frequency, must be one of: %s", strings.Join(validFrequencies, ", ")),
			})
		}
	}

	return errors
}

// ValidateBatchRequest validates a batch request
func ValidateBatchRequest(req BatchRequest) ValidationResult {
	result := ValidationResult{Valid: true}

	// Check batch size
	if len(req.Requests) == 0 {
		result.Valid = false
		result.Errors = append(result.Errors, ValidationError{
			Field:   "requests",
			Message: "batch must contain at least one request",
		})
		return result
	}

	if len(req.Requests) > MaxBatchSize {
		result.Valid = false
		result.Errors = append(result.Errors, ValidationError{
			Field:   "requests",
			Message: fmt.Sprintf("exceeds maximum batch size of %d", MaxBatchSize),
		})
		return result
	}

	// Validate each batch item
	for i, item := range req.Requests {
		prefix := fmt.Sprintf("requests[%d]", i)

		// Require userId
		if item.UserID == "" {
			result.Valid = false
			result.Errors = append(result.Errors, ValidationError{
				Field:   prefix + ".userId",
				Message: "userId is required for batch items",
			})
		}

		// Validate the calculation request
		itemReq := BudgetCalculationRequest{
			Envelopes:    item.Envelopes,
			Transactions: item.Transactions,
			Bills:        item.Bills,
		}
		itemResult := ValidateRequest(itemReq)
		if !itemResult.Valid {
			result.Valid = false
			// Prefix errors with batch item index
			for _, err := range itemResult.Errors {
				result.Errors = append(result.Errors, ValidationError{
					Field:   prefix + "." + err.Field,
					Message: err.Message,
				})
			}
		}
	}

	return result
}

// AddSecurityHeaders adds security headers to the response
func AddSecurityHeaders(w http.ResponseWriter) {
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("X-Frame-Options", "DENY")
	w.Header().Set("X-XSS-Protection", "1; mode=block")
	w.Header().Set("Referrer-Policy", "no-referrer")
	w.Header().Set("Content-Security-Policy", "default-src 'none'")
}

// Helper function to check if slice contains string
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
