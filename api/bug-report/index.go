package bug_report

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"text/template"
	"time"
)

// BugReportPayload represents the incoming bug report data from the frontend
type BugReportPayload struct {
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	Steps       string                 `json:"steps"`
	Expected    string                 `json:"expected"`
	Actual      string                 `json:"actual"`
	Severity    string                 `json:"severity"`
	Labels      []string               `json:"labels"`
	SystemInfo  map[string]interface{} `json:"systemInfo"`
	Screenshot  string                 `json:"screenshot"`
}

// GitHubIssueRequest represents the GitHub API issue creation request
type GitHubIssueRequest struct {
	Title  string   `json:"title"`
	Body   string   `json:"body"`
	Labels []string `json:"labels"`
}

// GitHubIssueResponse represents the GitHub API issue creation response
type GitHubIssueResponse struct {
	Number  int    `json:"number"`
	HTMLURL string `json:"html_url"`
}

// BugReportResponse represents the response sent back to the frontend
type BugReportResponse struct {
	Success     bool   `json:"success"`
	Provider    string `json:"provider"`
	Error       string `json:"error,omitempty"`
	IssueNumber int    `json:"issueNumber,omitempty"`
	URL         string `json:"url,omitempty"`
}

const issueBodyTemplate = `## 🐛 Bug Report

**Description:**
{{.Description}}

{{if .Steps}}
**Steps to Reproduce:**
{{.Steps}}
{{end}}

{{if .Expected}}
**Expected Behavior:**
{{.Expected}}
{{end}}

{{if .Actual}}
**Actual Behavior:**
{{.Actual}}
{{end}}

**Severity:** {{.Severity}}

---

### 📊 System Information

**App Version:** {{.AppVersion}}
**Browser:** {{.UserAgent}}
**Platform:** {{.Platform}}
**Viewport:** {{.Viewport}}
**Timestamp:** {{.Timestamp}}

{{if .RecentErrors}}
### 🔴 Recent Errors
` + "```" + `
{{.RecentErrors}}
` + "```" + `
{{end}}

{{if .HasScreenshot}}
### 📸 Screenshot
Screenshot was provided but omitted from issue body ({{.ScreenshotSize}} bytes). Consider uploading to an image hosting service.
{{end}}

---
*Submitted via VioletVault Bug Reporter v2.0 (Go Backend)*
`

// getAllowedOrigin returns the request Origin if it is present in the
// BUG_REPORT_ALLOWED_ORIGINS environment variable (comma-separated list).
// If no match is found, it returns an empty string and no CORS headers
// will be set, preventing browsers from making cross-origin requests.
func getAllowedOrigin(r *http.Request) string {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return ""
	}

	allowed := os.Getenv("BUG_REPORT_ALLOWED_ORIGINS")
	if allowed == "" {
		return ""
	}

	for _, o := range strings.Split(allowed, ",") {
		if strings.TrimSpace(o) == origin {
			return origin
		}
	}

	return ""
}

// Handler is the Vercel serverless function entry point
func Handler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers only for allowed origins
	if allowedOrigin := getAllowedOrigin(r); allowedOrigin != "" {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	}
	w.Header().Set("Content-Type", "application/json")

	// Handle preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only accept POST requests
	if r.Method != http.MethodPost {
		sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var payload BugReportPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		sendErrorResponse(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	// Validate payload
	if payload.Title == "" && payload.Description == "" {
		sendErrorResponse(w, "Either title or description is required", http.StatusBadRequest)
		return
	}

	// Get GitHub token from environment
	githubToken := os.Getenv("GITHUB_TOKEN")
	if githubToken == "" {
		sendErrorResponse(w, "GitHub token not configured", http.StatusInternalServerError)
		return
	}

	// Format issue body using template
	issueBody, err := formatIssueBody(payload)
	if err != nil {
		sendErrorResponse(w, fmt.Sprintf("Failed to format issue body: %v", err), http.StatusInternalServerError)
		return
	}

	// Default labels
	labels := []string{"bug", "auto-generated"}
	if payload.Severity != "" {
		labels = append(labels, fmt.Sprintf("severity:%s", payload.Severity))
	}
	if len(payload.Labels) > 0 {
		labels = append(labels, payload.Labels...)
	}

	// Create GitHub issue
	issueNumber, issueURL, err := createGitHubIssue(payload.Title, issueBody, labels, githubToken)
	if err != nil {
		sendErrorResponse(w, fmt.Sprintf("Failed to create GitHub issue: %v", err), http.StatusInternalServerError)
		return
	}

	// Send success response
	response := BugReportResponse{
		Success:     true,
		Provider:    "github",
		IssueNumber: issueNumber,
		URL:         issueURL,
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

// formatIssueBody formats the bug report data into a Markdown issue body
func formatIssueBody(payload BugReportPayload) (string, error) {
	tmpl, err := template.New("issue").Parse(issueBodyTemplate)
	if err != nil {
		return "", err
	}

	data := map[string]interface{}{
		"Description":    payload.Description,
		"Steps":          payload.Steps,
		"Expected":       payload.Expected,
		"Actual":         payload.Actual,
		"Severity":       getSeverityLabel(payload.Severity),
		"AppVersion":     getStringFromMap(payload.SystemInfo, "appVersion", "unknown"),
		"UserAgent":      getStringFromMap(payload.SystemInfo, "userAgent", "unknown"),
		"Platform":       getStringFromMap(payload.SystemInfo, "platform", "unknown"),
		"Viewport":       formatViewport(payload.SystemInfo),
		"Timestamp":      getStringFromMap(payload.SystemInfo, "timestamp", time.Now().Format(time.RFC3339)),
		"RecentErrors":   formatRecentErrors(payload.SystemInfo),
		"HasScreenshot":  payload.Screenshot != "",
		"ScreenshotSize": len(payload.Screenshot),
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

// createGitHubIssue creates an issue on GitHub
func createGitHubIssue(title, body string, labels []string, token string) (int, string, error) {
	apiURL := "https://api.github.com/repos/thef4tdaddy/violet-vault/issues"

	issueReq := GitHubIssueRequest{
		Title:  title,
		Body:   body,
		Labels: labels,
	}

	jsonData, err := json.Marshal(issueReq)
	if err != nil {
		return 0, "", err
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return 0, "", err
	}

	req.Header.Set("Authorization", fmt.Sprintf("token %s", token))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return 0, "", err
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode != http.StatusCreated {
		bodyBytes, _ := io.ReadAll(resp.Body)
		// Log the error body from GitHub for easier debugging on the server-side.
		log.Printf("GitHub API error: status %d, body: %s", resp.StatusCode, string(bodyBytes))
		return 0, "", fmt.Errorf("failed to create GitHub issue: unexpected status %d", resp.StatusCode)
	}

	var issueResp GitHubIssueResponse
	if err := json.NewDecoder(resp.Body).Decode(&issueResp); err != nil {
		return 0, "", err
	}

	return issueResp.Number, issueResp.HTMLURL, nil
}

// Helper functions

func sendErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(BugReportResponse{
		Success:  false,
		Provider: "github",
		Error:    message,
	})
}

func getSeverityLabel(severity string) string {
	severity = strings.ToLower(severity)
	switch severity {
	case "critical":
		return "🔴 Critical"
	case "high":
		return "🟠 High"
	case "medium":
		return "🟡 Medium"
	case "low":
		return "🟢 Low"
	default:
		return "⚪ Unknown"
	}
}

func getStringFromMap(m map[string]interface{}, key, defaultValue string) string {
	if val, ok := m[key]; ok {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return defaultValue
}

func formatViewport(systemInfo map[string]interface{}) string {
	if viewport, ok := systemInfo["viewport"].(map[string]interface{}); ok {
		width := 0
		height := 0
		if w, ok := viewport["width"].(float64); ok {
			width = int(w)
		}
		if h, ok := viewport["height"].(float64); ok {
			height = int(h)
		}
		if width > 0 && height > 0 {
			return fmt.Sprintf("%dx%d", width, height)
		}
	}
	return "unknown"
}

func formatRecentErrors(systemInfo map[string]interface{}) string {
	if errors, ok := systemInfo["recentErrors"].([]interface{}); ok && len(errors) > 0 {
		var lines []string
		for i, err := range errors {
			if i >= 5 { // Limit to 5 errors
				break
			}
			if errMap, ok := err.(map[string]interface{}); ok {
				if msg, ok := errMap["message"].(string); ok {
					lines = append(lines, msg)
				}
			}
		}
		return strings.Join(lines, "\n")
	}
	return ""
}
