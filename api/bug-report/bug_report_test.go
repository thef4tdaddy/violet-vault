package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

func TestGetSeverityLabel(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"critical", "🔴 Critical"},
		{"Critical", "🔴 Critical"}, // Case insensitive
		{"high", "🟠 High"},
		{"medium", "🟡 Medium"},
		{"low", "🟢 Low"},
		{"unknown", "⚪ Unknown"},
		{"", "⚪ Unknown"},
	}

	for _, tt := range tests {
		got := getSeverityLabel(tt.input)
		if got != tt.expected {
			t.Errorf("getSeverityLabel(%q) = %q, want %q", tt.input, got, tt.expected)
		}
	}
}

func TestFormatIssueBody(t *testing.T) {
	payload := BugReportPayload{
		Description: "Something broke",
		Steps:       "1. Click button",
		Expected:    "Work",
		Actual:      "Crash",
		Severity:    "high",
		SystemInfo: map[string]interface{}{
			"appVersion": "1.0.0",
			"userAgent":  "GoTestBrowser",
			"platform":   "TestOS",
			"viewport": map[string]interface{}{
				"width":  1920.0,
				"height": 1080.0,
			},
		},
	}

	body, err := formatIssueBody(payload)
	if err != nil {
		t.Fatalf("formatIssueBody failed: %v", err)
	}

	// assertions
	if !strings.Contains(body, "Something broke") {
		t.Error("Body missing description")
	}
	if !strings.Contains(body, "🟠 High") {
		t.Error("Body missing severity label")
	}
	if !strings.Contains(body, "1920x1080") {
		t.Error("Body missing viewport")
	}
}

func TestGetAllowedOrigin(t *testing.T) {
	// Setup Env
	if err := os.Setenv("BUG_REPORT_ALLOWED_ORIGINS", "https://app.violetvault.com,http://localhost:3000"); err != nil {
		t.Fatalf("Failed to set env: %v", err)
	}
	defer func() { _ = os.Unsetenv("BUG_REPORT_ALLOWED_ORIGINS") }()

	tests := []struct {
		origin   string
		expected string
	}{
		{"https://app.violetvault.com", "https://app.violetvault.com"},
		{"http://localhost:3000", "http://localhost:3000"},
		{"http://evil.com", ""},
		{"", ""},
	}

	for _, tt := range tests {
		req := httptest.NewRequest("POST", "/", nil)
		if tt.origin != "" {
			req.Header.Set("Origin", tt.origin)
		}
		got := getAllowedOrigin(req)
		if got != tt.expected {
			t.Errorf("getAllowedOrigin(%q) = %q, want %q", tt.origin, got, tt.expected)
		}
	}
}

func TestHandler_MethodNotAllowed(t *testing.T) {
	req := httptest.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()

	Handler(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusMethodNotAllowed {
		t.Errorf("Expected 405 Method Not Allowed, got %d", resp.StatusCode)
	}
}

func TestHandler_Options(t *testing.T) {
	req := httptest.NewRequest("OPTIONS", "/", nil)
	w := httptest.NewRecorder()

	Handler(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK for OPTIONS, got %d", resp.StatusCode)
	}
}

func TestHandler_BadRequest(t *testing.T) {
	req := httptest.NewRequest("POST", "/", strings.NewReader("invalid-json"))
	w := httptest.NewRecorder()

	Handler(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request, got %d", resp.StatusCode)
	}
}

func TestHandler_MissingMetadata(t *testing.T) {
	// Valid JSON but missing Title/Desc
	payload := BugReportPayload{}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest("POST", "/", bytes.NewReader(body))
	w := httptest.NewRecorder()

	Handler(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for empty payload, got %d", resp.StatusCode)
	}
}
