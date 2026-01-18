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
	MaxBatchSize    = 100
	MaxIDLength     = 100
	MaxNameLength   = 200
)

// ValidateRequest validates a budget calculation request
func ValidateRequest(req BudgetCalculationRequest) ValidationResult {
	result := ValidationResult{Valid: true}

	if len(req.Envelopes) > MaxEnvelopes {
		result.Valid = false
		result.Errors = append(result.Errors, ValidationError{
			Field:   "envelopes",
			Message: fmt.Sprintf("exceeds maximum of %d envelopes", MaxEnvelopes),
		})
	}

	if len(req.Transactions) > MaxTransactions {
		result.Valid = false
		result.Errors = append(result.Errors, ValidationError{
			Field:   "transactions",
			Message: fmt.Sprintf("exceeds maximum of %d transactions", MaxTransactions),
		})
	}

	for i, env := range req.Envelopes {
		if errs := validateEnvelope(env, i); len(errs) > 0 {
			result.Valid = false
			result.Errors = append(result.Errors, errs...)
		}
	}

	for i, tx := range req.Transactions {
		if errs := validateTransaction(tx, i); len(errs) > 0 {
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

	if len(env.Name) > MaxNameLength {
		errors = append(errors, ValidationError{
			Field:   prefix + ".name",
			Message: fmt.Sprintf("name exceeds maximum length of %d", MaxNameLength),
		})
	}

	if env.Type != "" {
		validTypes := []string{
			EnvelopeTypeStandard,
			EnvelopeTypeGoal,
			EnvelopeTypeLiability,
			EnvelopeTypeSupplemental,
		}
		if !contains(validTypes, env.Type) {
			errors = append(errors, ValidationError{
				Field:   prefix + ".type",
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

	if tx.Type == "" {
		errors = append(errors, ValidationError{
			Field:   prefix + ".type",
			Message: "type is required",
		})
	} else {
		validTypes := []string{"expense", "income", "transfer"}
		if !contains(validTypes, tx.Type) {
			errors = append(errors, ValidationError{
				Field:   prefix + ".type",
				Message: fmt.Sprintf("invalid type, must be one of: %s", strings.Join(validTypes, ", ")),
			})
		}
	}

	if tx.Date != "" {
		if parseDate(tx.Date).IsZero() {
			errors = append(errors, ValidationError{
				Field:   prefix + ".date",
				Message: "invalid date format, must be ISO 8601 (YYYY-MM-DD or RFC3339)",
			})
		}
	}

	return errors
}

// ValidateBatchRequest validates a batch request
func ValidateBatchRequest(req BatchRequest) ValidationResult {
	result := ValidationResult{Valid: true}

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

	for i, item := range req.Requests {
		prefix := fmt.Sprintf("requests[%d]", i)

		if item.UserID == "" {
			result.Valid = false
			result.Errors = append(result.Errors, ValidationError{
				Field:   prefix + ".userId",
				Message: "userId is required for batch items",
			})
		}

		itemReq := BudgetCalculationRequest{
			Envelopes:    item.Envelopes,
			Transactions: item.Transactions,
		}
		itemResult := ValidateRequest(itemReq)
		if !itemResult.Valid {
			result.Valid = false
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
