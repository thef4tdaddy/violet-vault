package handler

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// TestHandler_OptionsRequest tests CORS preflight OPTIONS request
func TestHandler_OptionsRequest(t *testing.T) {
	req := httptest.NewRequest("OPTIONS", "/api/import", nil)
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	// Check CORS headers
	if w.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("Expected CORS header to allow all origins")
	}
}

// TestHandler_InvalidMethod tests rejection of non-POST methods
func TestHandler_InvalidMethod(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/import", nil)
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected status 405, got %d", w.Code)
	}

	var response ImportResponse
	json.NewDecoder(w.Body).Decode(&response)

	if response.Success {
		t.Error("Expected success to be false for invalid method")
	}
}

// TestHandler_MissingFile tests error when no file is provided
func TestHandler_MissingFile(t *testing.T) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.Close()

	req := httptest.NewRequest("POST", "/api/import", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

// TestHandler_UnsupportedFileType tests rejection of unsupported file types
func TestHandler_UnsupportedFileType(t *testing.T) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.txt")
	part.Write([]byte("some text"))
	writer.Close()

	req := httptest.NewRequest("POST", "/api/import", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	var response ImportResponse
	json.NewDecoder(w.Body).Decode(&response)

	if !strings.Contains(response.Error, "Unsupported file type") {
		t.Errorf("Expected unsupported file type error, got: %s", response.Error)
	}
}

// TestHandler_ValidCSV tests successful CSV import
func TestHandler_ValidCSV(t *testing.T) {
	// Use negative amounts for expenses, positive for income (matching parseAmount behavior)
	csvContent := `Date,Description,Amount,Category
2024-01-15,Coffee Shop,($5.99),Dining
2024-01-16,Grocery Store,($125.50),Groceries
2024-01-17,Paycheck,$2500.00,Income`

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.csv")
	part.Write([]byte(csvContent))
	writer.Close()

	req := httptest.NewRequest("POST", "/api/import", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response ImportResponse
	json.NewDecoder(w.Body).Decode(&response)

	if !response.Success {
		t.Errorf("Expected success, got error: %s", response.Error)
	}

	if len(response.Transactions) != 3 {
		t.Errorf("Expected 3 transactions, got %d", len(response.Transactions))
	}

	// Check first transaction
	if response.Transactions[0].Description != "Coffee Shop" {
		t.Errorf("Expected description 'Coffee Shop', got '%s'", response.Transactions[0].Description)
	}

	// Check amount signs (parentheses create negative amounts = expenses)
	if response.Transactions[0].Amount >= 0 {
		t.Errorf("Expected negative amount for expense, got %f", response.Transactions[0].Amount)
	}

	if response.Transactions[2].Amount <= 0 {
		t.Errorf("Expected positive amount for income, got %f", response.Transactions[2].Amount)
	}
}

// TestHandler_ValidJSON tests successful JSON import
func TestHandler_ValidJSON(t *testing.T) {
	jsonContent := `[
		{"date": "2024-01-15", "description": "Coffee", "amount": -5.99, "category": "Dining"},
		{"date": "2024-01-16", "description": "Salary", "amount": 2500.00, "category": "Income"}
	]`

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.json")
	part.Write([]byte(jsonContent))
	writer.Close()

	req := httptest.NewRequest("POST", "/api/import", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response ImportResponse
	json.NewDecoder(w.Body).Decode(&response)

	if !response.Success {
		t.Errorf("Expected success, got error: %s", response.Error)
	}

	if len(response.Transactions) != 2 {
		t.Errorf("Expected 2 transactions, got %d", len(response.Transactions))
	}
}

// TestHandler_CSVWithInvalidRows tests CSV with validation errors
func TestHandler_CSVWithInvalidRows(t *testing.T) {
	csvContent := `Date,Description,Amount,Category
2024-01-15,Valid Transaction,($50.00),Groceries
2024-13-45,Invalid Date,($25.00),Dining
2024-01-17,Missing Amount,,Transportation`

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.csv")
	part.Write([]byte(csvContent))
	writer.Close()

	req := httptest.NewRequest("POST", "/api/import", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response ImportResponse
	json.NewDecoder(w.Body).Decode(&response)

	if !response.Success {
		t.Errorf("Expected success, got error: %s", response.Error)
	}

	if len(response.Transactions) != 1 {
		t.Errorf("Expected 1 valid transaction, got %d", len(response.Transactions))
	}

	if len(response.Invalid) != 2 {
		t.Errorf("Expected 2 invalid rows, got %d", len(response.Invalid))
	}
}

// TestHandler_CustomFieldMapping tests custom field mapping
func TestHandler_CustomFieldMapping(t *testing.T) {
	csvContent := `Transaction Date,Payee,Amount
01/15/2024,Coffee Shop,5.99`

	fieldMapping := map[string]string{
		"date":        "Transaction Date",
		"description": "Payee",
		"amount":      "Amount",
	}
	mappingJSON, _ := json.Marshal(fieldMapping)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.csv")
	part.Write([]byte(csvContent))
	writer.WriteField("fieldMapping", string(mappingJSON))
	writer.Close()

	req := httptest.NewRequest("POST", "/api/import", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response ImportResponse
	json.NewDecoder(w.Body).Decode(&response)

	if !response.Success {
		t.Errorf("Expected success, got error: %s", response.Error)
	}

	if len(response.Transactions) != 1 {
		t.Errorf("Expected 1 transaction, got %d", len(response.Transactions))
	}

	if response.Transactions[0].Description != "Coffee Shop" {
		t.Errorf("Expected description 'Coffee Shop', got '%s'", response.Transactions[0].Description)
	}
}

// TestProcessCSV tests CSV processing
func TestProcessCSV(t *testing.T) {
	csvContent := `Date,Description,Amount
2024-01-15,Test Transaction,$50.00`

	// Create a proper test file using multipart writer
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.csv")
	part.Write([]byte(csvContent))
	writer.Close()

	// Parse the multipart to extract the file
	reader := multipart.NewReader(body, writer.Boundary())
	form, _ := reader.ReadForm(10 << 20)
	file := form.File["file"][0]
	openedFile, _ := file.Open()
	defer openedFile.Close()

	transactions, invalid, err := processCSV(openedFile, nil)

	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	if len(transactions) != 1 {
		t.Errorf("Expected 1 transaction, got %d", len(transactions))
	}

	if len(invalid) != 0 {
		t.Errorf("Expected 0 invalid rows, got %d", len(invalid))
	}
}

// TestProcessJSON tests JSON processing
func TestProcessJSON(t *testing.T) {
	jsonContent := `[{"date": "2024-01-15", "description": "Test", "amount": -50.00}]`

	// Create a proper test file using multipart writer
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.json")
	part.Write([]byte(jsonContent))
	writer.Close()

	// Parse the multipart to extract the file
	reader := multipart.NewReader(body, writer.Boundary())
	form, _ := reader.ReadForm(10 << 20)
	file := form.File["file"][0]
	openedFile, _ := file.Open()
	defer openedFile.Close()

	transactions, invalid, err := processJSON(openedFile, nil)

	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	if len(transactions) != 1 {
		t.Errorf("Expected 1 transaction, got %d", len(transactions))
	}

	if len(invalid) != 0 {
		t.Errorf("Expected 0 invalid rows, got %d", len(invalid))
	}
}

// TestAutoDetectFieldMapping tests field mapping auto-detection
func TestAutoDetectFieldMapping(t *testing.T) {
	tests := []struct {
		name     string
		headers  []string
		expected map[string]string
	}{
		{
			name:    "Standard fields",
			headers: []string{"Date", "Description", "Amount", "Category"},
			expected: map[string]string{
				"date":        "Date",
				"description": "Description",
				"amount":      "Amount",
				"category":    "Category",
			},
		},
		{
			name:    "Bank export format",
			headers: []string{"Transaction Date", "Payee", "Amount"},
			expected: map[string]string{
				"date":        "Transaction Date",
				"description": "Payee",
				"amount":      "Amount",
			},
		},
		{
			name:    "Alternative names",
			headers: []string{"date", "memo", "value", "merchant"},
			expected: map[string]string{
				"date":        "date",
				"description": "memo",
				"amount":      "value",
				"merchant":    "merchant",
			},
		},
		{
			name:    "Avoid type ambiguity",
			headers: []string{"Type", "Category", "Amount"},
			expected: map[string]string{
				"category": "Category",
				"amount":   "Amount",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mapping := autoDetectFieldMapping(tt.headers)

			for key, expectedValue := range tt.expected {
				if mapping[key] != expectedValue {
					t.Errorf("Expected %s to map to '%s', got '%s'", key, expectedValue, mapping[key])
				}
			}
		})
	}
}

// TestParseDate tests date parsing with various formats
func TestParseDate(t *testing.T) {
	tests := []struct {
		input    string
		expected string
		valid    bool
	}{
		{"2024-01-15", "2024-01-15", true},
		{"01/15/2024", "2024-01-15", true},
		{"1/15/2024", "2024-01-15", true},
		{"Jan 15, 2024", "2024-01-15", true},
		{"invalid-date", "", false},
		{"2024-13-45", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			result, err := parseDate(tt.input)

			if tt.valid && err != nil {
				t.Errorf("Expected valid date, got error: %v", err)
			}

			if !tt.valid && err == nil {
				t.Errorf("Expected invalid date, got valid result")
			}

			if tt.valid && result.Format("2006-01-02") != tt.expected {
				t.Errorf("Expected %s, got %s", tt.expected, result.Format("2006-01-02"))
			}
		})
	}
}

// TestParseAmount tests amount parsing with various formats
func TestParseAmount(t *testing.T) {
	tests := []struct {
		input    string
		expected float64
		valid    bool
	}{
		{"50.00", 50.00, true},
		{"$50.00", 50.00, true},
		{"€100.50", 100.50, true},
		{"1,000.00", 1000.00, true},
		{"(50.00)", -50.00, true},
		{"-25.50", -25.50, true},
		{"invalid", 0, false},
		{"", 0, false},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			result, err := parseAmount(tt.input)

			if tt.valid && err != nil {
				t.Errorf("Expected valid amount, got error: %v", err)
			}

			if !tt.valid && err == nil {
				t.Errorf("Expected invalid amount, got valid result")
			}

			if tt.valid && result != tt.expected {
				t.Errorf("Expected %f, got %f", tt.expected, result)
			}
		})
	}
}

// TestNormalizeTransaction tests transaction normalization and validation
func TestNormalizeTransaction(t *testing.T) {
	tests := []struct {
		name          string
		row           map[string]string
		fieldMapping  map[string]string
		expectValid   bool
		expectedType  string
		expectedError string
	}{
		{
			name: "Valid expense",
			row: map[string]string{
				"Date":        "2024-01-15",
				"Description": "Coffee",
				"Amount":      "($5.99)", // Parentheses = negative = expense
				"Category":    "Dining",
			},
			fieldMapping: map[string]string{
				"date":        "Date",
				"description": "Description",
				"amount":      "Amount",
				"category":    "Category",
			},
			expectValid:  true,
			expectedType: "expense",
		},
		{
			name: "Valid income",
			row: map[string]string{
				"Date":        "2024-01-15",
				"Description": "Salary",
				"Amount":      "$2500.00",
				"Category":    "Income",
			},
			fieldMapping: map[string]string{
				"date":        "Date",
				"description": "Description",
				"amount":      "Amount",
				"category":    "Category",
			},
			expectValid:  true,
			expectedType: "income",
		},
		{
			name: "Missing date",
			row: map[string]string{
				"Date":        "",
				"Description": "Test",
				"Amount":      "$50.00",
			},
			fieldMapping: map[string]string{
				"date":        "Date",
				"description": "Description",
				"amount":      "Amount",
			},
			expectValid:   false,
			expectedError: "Date is required",
		},
		{
			name: "Missing amount",
			row: map[string]string{
				"Date":        "2024-01-15",
				"Description": "Test",
				"Amount":      "",
			},
			fieldMapping: map[string]string{
				"date":        "Date",
				"description": "Description",
				"amount":      "Amount",
			},
			expectValid:   false,
			expectedError: "Amount is required",
		},
		{
			name: "Invalid amount",
			row: map[string]string{
				"Date":        "2024-01-15",
				"Description": "Test",
				"Amount":      "not-a-number",
			},
			fieldMapping: map[string]string{
				"date":        "Date",
				"description": "Description",
				"amount":      "Amount",
			},
			expectValid:   false,
			expectedError: "Invalid amount",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			transaction, errors := normalizeTransaction(tt.row, tt.fieldMapping, 0)

			if tt.expectValid {
				if len(errors) > 0 {
					t.Errorf("Expected valid transaction, got errors: %v", errors)
				}
				if transaction.Type != tt.expectedType {
					t.Errorf("Expected type %s, got %s", tt.expectedType, transaction.Type)
				}
			} else {
				if len(errors) == 0 {
					t.Error("Expected validation errors, got none")
				}
				if tt.expectedError != "" {
					found := false
					for _, err := range errors {
						if strings.Contains(err, tt.expectedError) {
							found = true
							break
						}
					}
					if !found {
						t.Errorf("Expected error containing '%s', got: %v", tt.expectedError, errors)
					}
				}
			}
		})
	}
}

// TestGetFieldName tests field name resolution
func TestGetFieldName(t *testing.T) {
	mapping := map[string]string{
		"date": "Transaction Date",
	}

	// Test mapped field
	result := getFieldName(mapping, "date", []string{"date", "Date"})
	if result != "Transaction Date" {
		t.Errorf("Expected 'Transaction Date', got '%s'", result)
	}

	// Test unmapped field with alternatives
	result = getFieldName(mapping, "amount", []string{"amount", "Amount"})
	if result != "amount" {
		t.Errorf("Expected first alternative 'amount', got '%s'", result)
	}

	// Test unmapped field without alternatives
	result = getFieldName(mapping, "category", []string{})
	if result != "category" {
		t.Errorf("Expected field name 'category', got '%s'", result)
	}
}
