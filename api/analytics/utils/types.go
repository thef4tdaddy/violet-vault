package utils

import "time"

// EncryptedRequest represents an encrypted API request
type EncryptedRequest struct {
	Encrypted EncryptedPayload `json:"encrypted"`
}

// EncryptedPayload contains encrypted data and metadata
type EncryptedPayload struct {
	Ciphertext string `json:"ciphertext"` // Base64 encoded
	IV         string `json:"iv"`         // Base64 encoded initialization vector
	AuthTag    string `json:"authTag"`    // Base64 encoded authentication tag
	Algorithm  string `json:"algorithm"`  // Should be "AES-256-GCM"
}

// EncryptedResponse wraps an encrypted response
type EncryptedResponse struct {
	Encrypted EncryptedPayload `json:"encrypted"`
}

// AllocationTransaction represents a budget allocation transaction
type AllocationTransaction struct {
	ID           string    `json:"id"`
	Amount       float64   `json:"amount"`
	EnvelopeID   string    `json:"envelopeId"`
	EnvelopeName string    `json:"envelopeName,omitempty"`
	Date         time.Time `json:"date"`
	Category     string    `json:"category,omitempty"`
	Strategy     string    `json:"strategy,omitempty"`
	Frequency    string    `json:"frequency,omitempty"`
}

// DateRange represents a time period
type DateRange struct {
	Start string `json:"start"` // ISO date string
	End   string `json:"end"`   // ISO date string
}

// HeatmapRequest payload for heatmap generation
type HeatmapRequest struct {
	Transactions []AllocationTransaction `json:"transactions"`
	DateRange    DateRange               `json:"dateRange"`
}

// HeatmapDataPoint represents a single day in the heatmap
type HeatmapDataPoint struct {
	Date      string  `json:"date"`      // ISO date
	Intensity float64 `json:"intensity"` // 0-100
	Amount    float64 `json:"amount"`
	Count     int     `json:"count"`
}

// TrendRequest payload for trend aggregation
type TrendRequest struct {
	Transactions []AllocationTransaction `json:"transactions"`
	EnvelopeIDs  []string                `json:"envelopeIds"`
	Granularity  string                  `json:"granularity"` // "daily", "weekly", "monthly"
}

// TrendDataPoint represents aggregated trend data
type TrendDataPoint struct {
	Date      string             `json:"date"`
	Envelopes map[string]float64 `json:"envelopes"` // envelope ID -> amount
}

// TrendMetadata contains trend analysis results
type TrendMetadata struct {
	Direction string  `json:"direction"` // "up", "down", "flat"
	Slope     float64 `json:"slope"`     // Linear regression slope
	R2        float64 `json:"r2"`        // R-squared value (0-1)
}

// TrendResponse contains trend data and metadata
type TrendResponse struct {
	Data     []TrendDataPoint         `json:"data"`
	Metadata map[string]TrendMetadata `json:"metadata"` // envelope ID -> metadata
}

// HealthRequest payload for health calculation
type HealthRequest struct {
	Transactions []AllocationTransaction `json:"transactions"`
}

// HealthComponentScore represents a single health component
type HealthComponentScore struct {
	Component   string  `json:"component"`   // "consistency", "billCoverage", etc.
	Score       float64 `json:"score"`       // 0-100
	Weight      float64 `json:"weight"`      // Component weight in overall score
	Description string  `json:"description"` // Human-readable description
}

// HealthResponse contains overall health and component breakdown
type HealthResponse struct {
	Overall    float64                `json:"overall"` // 0-100
	Components []HealthComponentScore `json:"components"`
}

// ErrorResponse represents an API error
type ErrorResponse struct {
	Error   string `json:"error"`
	Code    int    `json:"code"`
	Details string `json:"details,omitempty"`
}
