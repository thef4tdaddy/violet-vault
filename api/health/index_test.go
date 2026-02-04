package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestHealthHandler(t *testing.T) {
	// Create a request
	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	w := httptest.NewRecorder()

	// Call handler
	Handler(w, req)

	// Check status code
	if w.Code != http.StatusOK {
		t.Errorf("Expected status OK, got %v", w.Code)
	}

	// Check CORS headers
	if w.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("Missing or incorrect Access-Control-Allow-Origin header")
	}

	// Check response body
	var response HealthResponse
	if err := json.NewDecoder(w.Body).Decode(&response); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if response.Status != "healthy" {
		t.Errorf("Expected status healthy, got %v", response.Status)
	}
	if response.Service != "VioletVault Backend" {
		t.Errorf("Expected service VioletVault Backend, got %v", response.Service)
	}

	// Default region
	if response.Region != "unknown" {
		t.Errorf("Expected default region unknown, got %v", response.Region)
	}
}

func TestHealthHandlerMethods(t *testing.T) {
	// Test POST (Method Not Allowed)
	req := httptest.NewRequest(http.MethodPost, "/api/health", nil)
	w := httptest.NewRecorder()
	Handler(w, req)
	if w.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected Method Not Allowed for POST, got %v", w.Code)
	}

	// Test OPTIONS (OK)
	req = httptest.NewRequest(http.MethodOptions, "/api/health", nil)
	w = httptest.NewRecorder()
	Handler(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("Expected OK for OPTIONS, got %v", w.Code)
	}
}

func TestHealthHandlerEnv(t *testing.T) {
	// Set region env
	os.Setenv("VERCEL_REGION", "sfo1")
	defer os.Unsetenv("VERCEL_REGION")

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	w := httptest.NewRecorder()
	Handler(w, req)

	var response HealthResponse
	json.NewDecoder(w.Body).Decode(&response)

	if response.Region != "sfo1" {
		t.Errorf("Expected region sfo1, got %v", response.Region)
	}
}
