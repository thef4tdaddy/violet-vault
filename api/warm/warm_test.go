package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWarmHandler(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/warm", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(Handler)

	handler.ServeHTTP(rr, req)

	// Check the status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Check the response body
	expected := WarmResponse{
		Status:  "warmed",
		Service: "VioletVault Go Sentinel",
	}
	var actual WarmResponse
	if err := json.NewDecoder(rr.Body).Decode(&actual); err != nil {
		t.Fatalf("could not decode response: %v", err)
	}

	if actual != expected {
		t.Errorf("handler returned unexpected body: got %+v want %+v",
			actual, expected)
	}

	// Check CORS headers
	if origin := rr.Header().Get("Access-Control-Allow-Origin"); origin != "*" {
		t.Errorf("handler returned wrong access control origin: got %v want %v",
			origin, "*")
	}
}
