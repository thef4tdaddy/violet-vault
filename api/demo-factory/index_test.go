package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandler_GET_Success(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/demo-factory", nil)
	w := httptest.NewRecorder()
	
	Handler(w, req)
	
	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
	
	var result DemoDataResponse
	if err := json.NewDecoder(w.Body).Decode(&result); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	
	if len(result.Envelopes) == 0 {
		t.Error("Expected envelopes in response")
	}
	
	if len(result.Transactions) == 0 {
		t.Error("Expected transactions in response")
	}
	
	if len(result.Bills) == 0 {
		t.Error("Expected bills in response")
	}
}

func TestHandler_GET_WithCustomCount(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/demo-factory?count=5000", nil)
	w := httptest.NewRecorder()
	
	Handler(w, req)
	
	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
	
	var result DemoDataResponse
	if err := json.NewDecoder(w.Body).Decode(&result); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	
	// Should have close to 5000 total records
	if result.RecordCount < 4500 || result.RecordCount > 5500 {
		t.Errorf("Expected ~5000 records, got %d", result.RecordCount)
	}
}

func TestHandler_OPTIONS_CORS(t *testing.T) {
	req := httptest.NewRequest(http.MethodOptions, "/api/demo-factory", nil)
	w := httptest.NewRecorder()
	
	Handler(w, req)
	
	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
	
	if w.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("Expected CORS header to be set")
	}
}

func TestHandler_POST_MethodNotAllowed(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/api/demo-factory", nil)
	w := httptest.NewRecorder()
	
	Handler(w, req)
	
	if w.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected status 405, got %d", w.Code)
	}
	
	var errResp ErrorResponse
	if err := json.NewDecoder(w.Body).Decode(&errResp); err != nil {
		t.Fatalf("Failed to decode error response: %v", err)
	}
	
	if errResp.Success {
		t.Error("Expected success to be false")
	}
	
	if errResp.Error == "" {
		t.Error("Expected error message")
	}
}

func TestHandler_InvalidCount_UsesDefault(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/demo-factory?count=invalid", nil)
	w := httptest.NewRecorder()
	
	Handler(w, req)
	
	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
	
	var result DemoDataResponse
	if err := json.NewDecoder(w.Body).Decode(&result); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	
	// Should use default count (10000)
	if result.RecordCount < 9000 {
		t.Errorf("Expected default count ~10000, got %d", result.RecordCount)
	}
}

func TestHandler_ExcessiveCount_Capped(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/demo-factory?count=999999", nil)
	w := httptest.NewRecorder()
	
	Handler(w, req)
	
	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
	
	var result DemoDataResponse
	if err := json.NewDecoder(w.Body).Decode(&result); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	
	// Should be capped or use default, not generate 999999 records
	if result.RecordCount > 20000 {
		t.Errorf("Expected count to be reasonable, got %d", result.RecordCount)
	}
}

func TestHandler_ContentType(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/demo-factory", nil)
	w := httptest.NewRecorder()
	
	Handler(w, req)
	
	contentType := w.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("Expected Content-Type 'application/json', got '%s'", contentType)
	}
}

func BenchmarkHandler(b *testing.B) {
	req := httptest.NewRequest(http.MethodGet, "/api/demo-factory?count=10000", nil)
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		w := httptest.NewRecorder()
		Handler(w, req)
		
		if w.Code != http.StatusOK {
			b.Fatalf("Expected status 200, got %d", w.Code)
		}
	}
}
