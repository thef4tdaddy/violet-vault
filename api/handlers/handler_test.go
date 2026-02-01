package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/thef4tdaddy/violet-vault/api/models"
	"github.com/thef4tdaddy/violet-vault/api/services"
)

func TestExecuteAutofundingHandler(t *testing.T) {
	// 1. Test invalid payload
	req1 := httptest.NewRequest("POST", "/api/autofunding", bytes.NewBufferString("invalid json"))
	w1 := httptest.NewRecorder()
	ExecuteAutofundingHandler(w1, req1)
	if w1.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for invalid json, got %d", w1.Code)
	}

	// 2. Test empty rules (temporary logic returns empty response)
	requestBody := models.AutofundingRequest{
		Trigger: "manual",
		Context: models.AllocationContext{UnassignedCash: 1000},
	}
	body, _ := json.Marshal(requestBody)
	req2 := httptest.NewRequest("POST", "/api/autofunding", bytes.NewBuffer(body))
	w2 := httptest.NewRecorder()
	ExecuteAutofundingHandler(w2, req2)
	if w2.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w2.Code)
	}

	// 3. Test unimplemented rule ID fetch
	requestBody3 := models.AutofundingRequest{
		RuleIDs: []string{"r1"},
	}
	body3, _ := json.Marshal(requestBody3)
	req3 := httptest.NewRequest("POST", "/api/autofunding", bytes.NewBuffer(body3))
	w3 := httptest.NewRecorder()
	ExecuteAutofundingHandler(w3, req3)
	if w3.Code != http.StatusNotImplemented {
		t.Errorf("Expected status 501 for rule fetching, got %d", w3.Code)
	}
}

func TestExecuteAutofundingWithRulesHandler(t *testing.T) {
	requestBody := struct {
		Rules   []models.Rule            `json:"rules"`
		Context models.AllocationContext `json:"context"`
	}{
		Rules: []models.Rule{
			{
				ID:      "r1",
				Enabled: true,
				Type:    "fixed_amount",
				Config: models.RuleConfig{
					Amount:   500,
					TargetID: stringPtr("env1"),
					Conditions: []models.Condition{
						{Type: "unassigned_greater_than", Value: 10},
					},
				},
			},
		},
		Context: models.AllocationContext{UnassignedCash: 1000},
	}
	body, _ := json.Marshal(requestBody)
	req := httptest.NewRequest("POST", "/api/autofunding/with-rules", bytes.NewBuffer(body))
	w := httptest.NewRecorder()
	ExecuteAutofundingWithRulesHandler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var resp models.AutofundingResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	if len(resp.Allocations) != 1 || resp.TotalAllocatedCents != 500 {
		t.Errorf("Unexpected response: %+v", resp)
	}
}

func TestCalculateCoverageHandler(t *testing.T) {
	requestBody := services.CoverageRequest{
		Bills: []services.BillCoverageInput{
			{ID: "b1", AmountCents: 1000, EnvelopeID: "env1"},
		},
		Envelopes: []services.EnvelopeCoverageInput{
			{ID: "env1", CurrentBalanceCents: 500},
		},
		Allocations: []services.AllocationInput{
			{EnvelopeID: "env1", AmountCents: 500},
		},
	}
	body, _ := json.Marshal(requestBody)
	req := httptest.NewRequest("POST", "/api/forecasting/coverage", bytes.NewBuffer(body))
	w := httptest.NewRecorder()
	CalculateCoverageHandler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var resp services.CoverageResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	if len(resp.Bills) != 1 || resp.Bills[0].Status != "covered" {
		t.Errorf("Unexpected response: %+v", resp)
	}
}

func stringPtr(s string) *string {
	return &s
}
