package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandler_OPTIONS(t *testing.T) {
	req := httptest.NewRequest("OPTIONS", "/api/bug-report", nil)
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status OK, got %d", w.Code)
	}

	// Check CORS headers
	if w.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("Expected CORS header to allow all origins")
	}
}

func TestHandler_MethodNotAllowed(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/bug-report", nil)
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected status MethodNotAllowed, got %d", w.Code)
	}
}

func TestHandler_InvalidJSON(t *testing.T) {
	req := httptest.NewRequest("POST", "/api/bug-report", bytes.NewBufferString("invalid json"))
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status BadRequest, got %d", w.Code)
	}
}

func TestHandler_MissingTitle(t *testing.T) {
	payload := BugReportRequest{
		Description: "Test description",
	}
	jsonData, _ := json.Marshal(payload)

	req := httptest.NewRequest("POST", "/api/bug-report", bytes.NewBuffer(jsonData))
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status BadRequest, got %d", w.Code)
	}

	var response APIResponse
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.Error != "Title is required" {
		t.Errorf("Expected error message about title, got %s", response.Error)
	}
}

func TestFormatIssueBody(t *testing.T) {
	report := BugReportRequest{
		Title:       "Test Bug",
		Description: "This is a test",
		Steps:       "1. Do this\n2. Do that",
		Expected:    "Should work",
		Actual:      "Doesn't work",
		Severity:    "high",
		SystemInfo: map[string]interface{}{
			"appVersion": "1.0.0",
			"browser": map[string]interface{}{
				"name":    "Chrome",
				"version": "120.0",
			},
		},
	}

	body, err := formatIssueBody(report)
	if err != nil {
		t.Fatalf("formatIssueBody failed: %v", err)
	}

	// Check that body contains expected sections
	expectedSections := []string{
		"## Bug Description",
		"This is a test",
		"## Steps to Reproduce",
		"## Expected Behavior",
		"## Actual Behavior",
		"## Environment",
		"Chrome 120.0",
	}

	for _, section := range expectedSections {
		if !containsString(body, section) {
			t.Errorf("Expected body to contain '%s'", section)
		}
	}
}

func TestFormatEnvironmentInfo(t *testing.T) {
	systemInfo := map[string]interface{}{
		"appVersion": "1.0.0",
		"browser": map[string]interface{}{
			"name":    "Firefox",
			"version": "119.0",
		},
		"viewport": map[string]interface{}{
			"width":  1920.0,
			"height": 1080.0,
		},
	}

	result := formatEnvironmentInfo(systemInfo)

	expectedParts := []string{
		"App Version:** 1.0.0",
		"Firefox 119.0",
		"1920x1080",
	}

	for _, part := range expectedParts {
		if !containsString(result, part) {
			t.Errorf("Expected environment info to contain '%s'", part)
		}
	}
}

func TestFormatScreenshot(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Empty screenshot",
			input:    "",
			expected: "",
		},
		{
			name:     "Base64 screenshot",
			input:    "data:image/png;base64,iVBORw0KGgo...",
			expected: "Screenshot captured",
		},
		{
			name:     "URL screenshot",
			input:    "https://example.com/image.png",
			expected: "![Bug Screenshot](https://example.com/image.png)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := formatScreenshot(tt.input)
			if !containsString(result, tt.expected) && tt.expected != "" {
				t.Errorf("Expected '%s' to contain '%s'", result, tt.expected)
			}
		})
	}
}

func TestGetOrDefault(t *testing.T) {
	tests := []struct {
		value    string
		fallback string
		expected string
	}{
		{"value", "default", "value"},
		{"", "default", "default"},
		{"   ", "default", "   "}, // Non-empty whitespace is not considered empty
	}

	for _, tt := range tests {
		result := getOrDefault(tt.value, tt.fallback)
		if result != tt.expected {
			t.Errorf("getOrDefault(%q, %q) = %q, expected %q", tt.value, tt.fallback, result, tt.expected)
		}
	}
}

func containsString(haystack, needle string) bool {
	return bytes.Contains([]byte(haystack), []byte(needle))
}
