package handler

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// Transaction represents a normalized transaction object
type Transaction struct {
	ID           string  `json:"id"`
	Date         string  `json:"date"`
	Amount       float64 `json:"amount"`
	EnvelopeID   string  `json:"envelopeId"`
	Category     string  `json:"category"`
	Type         string  `json:"type"`
	LastModified int64   `json:"lastModified"`
	CreatedAt    int64   `json:"createdAt"`
	Description  string  `json:"description,omitempty"`
	Merchant     string  `json:"merchant,omitempty"`
	Notes        string  `json:"notes,omitempty"`
}

// ImportRequest represents the import request payload
type ImportRequest struct {
	File         multipart.File
	FieldMapping map[string]string
	FileType     string
}

// ImportResponse represents the API response
type ImportResponse struct {
	Success      bool          `json:"success"`
	Transactions []Transaction `json:"transactions,omitempty"`
	Invalid      []InvalidRow  `json:"invalid,omitempty"`
	Error        string        `json:"error,omitempty"`
	Message      string        `json:"message,omitempty"`
}

// InvalidRow represents a row that failed validation
type InvalidRow struct {
	Index  int      `json:"index"`
	Row    string   `json:"row"`
	Errors []string `json:"errors"`
}

// Handler is the main Vercel serverless function handler
func Handler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	// Handle preflight OPTIONS request
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only accept POST requests
	if r.Method != "POST" {
		sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse multipart form with 10MB limit
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		sendError(w, "Failed to parse form data: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Get the uploaded file
	file, header, err := r.FormFile("file")
	if err != nil {
		sendError(w, "Failed to get file: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Determine file type
	fileType := ""
	if strings.HasSuffix(strings.ToLower(header.Filename), ".csv") {
		fileType = "csv"
	} else if strings.HasSuffix(strings.ToLower(header.Filename), ".json") {
		fileType = "json"
	} else {
		sendError(w, "Unsupported file type. Please use CSV or JSON files.", http.StatusBadRequest)
		return
	}

	// Get field mapping if provided
	fieldMapping := make(map[string]string)
	mappingStr := r.FormValue("fieldMapping")
	if mappingStr != "" {
		err := json.Unmarshal([]byte(mappingStr), &fieldMapping)
		if err != nil {
			sendError(w, "Invalid field mapping: "+err.Error(), http.StatusBadRequest)
			return
		}
	}

	// Process the file based on type
	var transactions []Transaction
	var invalidRows []InvalidRow

	if fileType == "csv" {
		transactions, invalidRows, err = processCSV(file, fieldMapping)
	} else {
		transactions, invalidRows, err = processJSON(file, fieldMapping)
	}

	if err != nil {
		sendError(w, "Failed to process file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Send successful response
	response := ImportResponse{
		Success:      true,
		Transactions: transactions,
		Invalid:      invalidRows,
		Message:      fmt.Sprintf("Successfully processed %d transactions (%d invalid)", len(transactions), len(invalidRows)),
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// processCSV handles CSV file parsing with streaming
func processCSV(file multipart.File, fieldMapping map[string]string) ([]Transaction, []InvalidRow, error) {
	reader := csv.NewReader(file)
	reader.TrimLeadingSpace = true

	// Read header row
	headers, err := reader.Read()
	if err != nil {
		return nil, nil, fmt.Errorf("failed to read CSV header: %v", err)
	}

	// Auto-detect field mapping if not provided
	if len(fieldMapping) == 0 {
		fieldMapping = autoDetectFieldMapping(headers)
	}

	transactions := []Transaction{}
	invalidRows := []InvalidRow{}
	index := 0

	// Stream CSV rows line-by-line
	for {
		row, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			invalidRows = append(invalidRows, InvalidRow{
				Index:  index,
				Row:    strings.Join(row, ","),
				Errors: []string{fmt.Sprintf("CSV parse error: %v", err)},
			})
			index++
			continue
		}

		// Convert row to map
		rowMap := make(map[string]string)
		for i, value := range row {
			if i < len(headers) {
				rowMap[headers[i]] = value
			}
		}

		// Validate and normalize the row
		transaction, errors := normalizeTransaction(rowMap, fieldMapping, index)
		if len(errors) > 0 {
			invalidRows = append(invalidRows, InvalidRow{
				Index:  index,
				Row:    strings.Join(row, ","),
				Errors: errors,
			})
		} else {
			transactions = append(transactions, transaction)
		}

		index++
	}

	return transactions, invalidRows, nil
}

// processJSON handles JSON file parsing
func processJSON(file multipart.File, fieldMapping map[string]string) ([]Transaction, []InvalidRow, error) {
	var rawData []map[string]interface{}
	decoder := json.NewDecoder(file)
	err := decoder.Decode(&rawData)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to parse JSON: %v", err)
	}

	transactions := []Transaction{}
	invalidRows := []InvalidRow{}

	for index, row := range rawData {
		// Convert map[string]interface{} to map[string]string
		rowMap := make(map[string]string)
		for key, value := range row {
			rowMap[key] = fmt.Sprintf("%v", value)
		}

		// Validate and normalize the row
		transaction, errors := normalizeTransaction(rowMap, fieldMapping, index)
		if len(errors) > 0 {
			rowJSON, _ := json.Marshal(row)
			invalidRows = append(invalidRows, InvalidRow{
				Index:  index,
				Row:    string(rowJSON),
				Errors: errors,
			})
		} else {
			transactions = append(transactions, transaction)
		}
	}

	return transactions, invalidRows, nil
}

// normalizeTransaction validates and normalizes a single transaction row
func normalizeTransaction(row map[string]string, fieldMapping map[string]string, index int) (Transaction, []string) {
	errors := []string{}
	now := time.Now().UnixMilli()

	// Get field names from mapping or use defaults
	dateField := getFieldName(fieldMapping, "date", []string{"date", "Date", "DATE", "transaction_date", "Transaction Date"})
	amountField := getFieldName(fieldMapping, "amount", []string{"amount", "Amount", "AMOUNT", "value", "Value"})
	descriptionField := getFieldName(fieldMapping, "description", []string{"description", "Description", "DESCRIPTION", "memo", "Memo", "payee", "Payee"})
	categoryField := getFieldName(fieldMapping, "category", []string{"category", "Category", "CATEGORY"})
	merchantField := getFieldName(fieldMapping, "merchant", []string{"merchant", "Merchant", "MERCHANT"})
	notesField := getFieldName(fieldMapping, "notes", []string{"notes", "Notes", "NOTES", "memo", "Memo"})

	// Parse date
	dateStr := row[dateField]
	if dateStr == "" {
		errors = append(errors, "Date is required")
	}
	parsedDate, err := parseDate(dateStr)
	if err != nil {
		errors = append(errors, fmt.Sprintf("Invalid date format: %v", err))
	} else if !parsedDate.IsZero() && parsedDate.After(time.Now().Add(24*time.Hour)) {
		// Check for future dates only when the parsed date is valid and non-zero
		errors = append(errors, "Future dates are not allowed")
	}

	// Parse amount
	amountStr := row[amountField]
	if amountStr == "" {
		errors = append(errors, "Amount is required")
	}
	amount, err := parseAmount(amountStr)
	if err != nil {
		errors = append(errors, fmt.Sprintf("Invalid amount: %v", err))
	}

	// Determine transaction type based on amount
	transactionType := "expense"
	if amount >= 0 {
		transactionType = "income"
	} else {
		// Ensure expenses are negative (already negative, keep it)
		// amount is already negative, no change needed
	}

	// Get description
	description := row[descriptionField]
	if description == "" {
		description = "Imported Transaction"
	}

	// Get category
	category := row[categoryField]
	if category == "" {
		category = "Imported"
	}

	// Validate required fields
	if len(errors) > 0 {
		return Transaction{}, errors
	}

	// Build transaction object
	transaction := Transaction{
		ID:           fmt.Sprintf("import_%d_%d", now, index),
		Date:         parsedDate.Format("2006-01-02"),
		Amount:       amount,
		EnvelopeID:   "unassigned", // Default to unassigned envelope
		Category:     category,
		Type:         transactionType,
		LastModified: now,
		CreatedAt:    now,
		Description:  description,
		Merchant:     row[merchantField],
		Notes:        row[notesField],
	}

	return transaction, nil
}

// autoDetectFieldMapping attempts to automatically detect field mapping from headers
func autoDetectFieldMapping(headers []string) map[string]string {
	mapping := make(map[string]string)

	for _, header := range headers {
		headerLower := strings.ToLower(strings.TrimSpace(header))

		// Date detection
		if strings.Contains(headerLower, "date") || strings.Contains(headerLower, "time") {
			if _, exists := mapping["date"]; !exists {
				mapping["date"] = header
			}
		}

		// Amount detection
		if strings.Contains(headerLower, "amount") || strings.Contains(headerLower, "value") || strings.Contains(headerLower, "price") {
			if _, exists := mapping["amount"]; !exists {
				mapping["amount"] = header
			}
		}

		// Description detection
		if strings.Contains(headerLower, "description") || strings.Contains(headerLower, "memo") || strings.Contains(headerLower, "payee") || strings.Contains(headerLower, "name") {
			if _, exists := mapping["description"]; !exists {
				mapping["description"] = header
			}
		}

		// Category detection
		if strings.Contains(headerLower, "category") || strings.Contains(headerLower, "type") {
			if _, exists := mapping["category"]; !exists {
				mapping["category"] = header
			}
		}

		// Merchant detection
		if strings.Contains(headerLower, "merchant") || strings.Contains(headerLower, "vendor") {
			if _, exists := mapping["merchant"]; !exists {
				mapping["merchant"] = header
			}
		}

		// Notes detection
		if strings.Contains(headerLower, "note") {
			if _, exists := mapping["notes"]; !exists {
				mapping["notes"] = header
			}
		}
	}

	return mapping
}

// getFieldName returns the mapped field name or tries to find it in the row
func getFieldName(mapping map[string]string, field string, alternatives []string) string {
	// Check if field is in mapping
	if mapped, exists := mapping[field]; exists {
		return mapped
	}

	// Return the first alternative (used as fallback)
	if len(alternatives) > 0 {
		return alternatives[0]
	}

	return field
}

// parseDate attempts to parse various date formats
func parseDate(dateStr string) (time.Time, error) {
	dateStr = strings.TrimSpace(dateStr)

	// Common date formats
	formats := []string{
		"2006-01-02",
		"01/02/2006",
		"1/2/2006",
		"2006/01/02",
		"02-01-2006",
		"2-1-2006",
		"Jan 2, 2006",
		"January 2, 2006",
		"2006-01-02T15:04:05Z",
		"2006-01-02 15:04:05",
	}

	for _, format := range formats {
		if parsed, err := time.Parse(format, dateStr); err == nil {
			return parsed, nil
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse date: %s", dateStr)
}

// parseAmount parses amount strings, handling currency symbols and formatting
func parseAmount(amountStr string) (float64, error) {
	// Remove currency symbols and commas
	cleaned := strings.TrimSpace(amountStr)
	cleaned = strings.ReplaceAll(cleaned, "$", "")
	cleaned = strings.ReplaceAll(cleaned, "€", "")
	cleaned = strings.ReplaceAll(cleaned, "£", "")
	cleaned = strings.ReplaceAll(cleaned, ",", "")
	cleaned = strings.TrimSpace(cleaned)

	// Handle parentheses as negative (accounting format)
	isNegative := false
	if strings.HasPrefix(cleaned, "(") && strings.HasSuffix(cleaned, ")") {
		isNegative = true
		cleaned = strings.Trim(cleaned, "()")
	}

	// Parse the number
	amount, err := strconv.ParseFloat(cleaned, 64)
	if err != nil {
		return 0, err
	}

	if isNegative {
		amount = -amount
	}

	return amount, nil
}

// sendError sends an error response
func sendError(w http.ResponseWriter, message string, statusCode int) {
	w.WriteHeader(statusCode)
	response := ImportResponse{
		Success: false,
		Error:   message,
	}
	json.NewEncoder(w).Encode(response)
}
