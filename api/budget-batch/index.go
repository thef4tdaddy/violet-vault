package budget_batch

import (
	"net/http"

	"github.com/thef4tdaddy/violet-vault/api/budget"
)

// Handler is the Vercel entry point for batch budget calculations
// This wraps the BatchHandler from the budget package
func Handler(w http.ResponseWriter, r *http.Request) {
	budget.BatchHandler(w, r)
}
