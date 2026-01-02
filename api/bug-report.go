package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"text/template"
	"time"
)

// BugReportRequest represents the incoming bug report payload
type BugReportRequest struct {
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	Steps       string                 `json:"steps"`
	Expected    string                 `json:"expected"`
	Actual      string                 `json:"actual"`
	Severity    string                 `json:"severity"`
	Labels      []string               `json:"labels"`
	SystemInfo  map[string]interface{} `json:"systemInfo"`
	Screenshot  string                 `json:"screenshot,omitempty"`
	SessionURL  string                 `json:"sessionUrl,omitempty"`
	ContextInfo map[string]interface{} `json:"contextInfo,omitempty"`
	Logs        []string               `json:"logs,omitempty"`
}

// GitHubIssuePayload represents the GitHub API issue creation payload
type GitHubIssuePayload struct {
	Title  string   `json:"title"`
	Body   string   `json:"body"`
	Labels []string `json:"labels"`
}

// GitHubIssueResponse represents the GitHub API response
type GitHubIssueResponse struct {
	Number  int    `json:"number"`
	HTMLURL string `json:"html_url"`
	URL     string `json:"url"`
}

// APIResponse represents the response sent back to the client
type APIResponse struct {
	Success     bool   `json:"success"`
	IssueNumber int    `json:"issueNumber,omitempty"`
	URL         string `json:"url,omitempty"`
	Error       string `json:"error,omitempty"`
	Provider    string `json:"provider"`
}

const issueTemplate = `## Bug Description
{{.Description}}

## Steps to Reproduce
{{.Steps}}

## Expected Behavior
{{.Expected}}

## Actual Behavior
{{.Actual}}
{{if .ContextInfo}}
## 📍 User Location
**URL:** {{.ContextURL}}
**Page Context:** {{.UserLocation}}
{{end}}
## Environment
{{.EnvironmentInfo}}

## Console Logs & Errors
{{.ConsoleInfo}}
{{if .HasLogs}}
## Console Logs
` + "```" + `
{{.LogsText}}
` + "```" + `
{{end}}
{{if .Screenshot}}
## Screenshot
{{.ScreenshotInfo}}
{{end}}
{{if .SessionURL}}
## Session Replay
[View Session Recording]({{.SessionURL}})

**Note:** Session replay may contain sensitive information. Review before sharing.
{{end}}
---
**Severity:** {{.Severity}}
**Reporter:** Automated Bug Reporter
**Timestamp:** {{.Timestamp}}

_This issue was automatically generated from a user bug report._`

// Handler is the main entry point for the Vercel serverless function
func Handler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	// Handle preflight
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only accept POST
	if r.Method != "POST" {
		respondWithError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Parse request body
	var bugReport BugReportRequest
	if err := json.NewDecoder(r.Body).Decode(&bugReport); err != nil {
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid JSON payload: %v", err))
		return
	}

	// Validate required fields
	if bugReport.Title == "" {
		respondWithError(w, http.StatusBadRequest, "Title is required")
		return
	}

	// Get GitHub token from environment
	githubToken := os.Getenv("GITHUB_TOKEN")
	if githubToken == "" {
		respondWithError(w, http.StatusInternalServerError, "GitHub token not configured")
		return
	}

	// Format the issue body
	issueBody, err := formatIssueBody(bugReport)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to format issue: %v", err))
		return
	}

	// Prepare labels
	labels := append(bugReport.Labels, "bug", "automated-report")

	// Create GitHub issue
	payload := GitHubIssuePayload{
		Title:  bugReport.Title,
		Body:   issueBody,
		Labels: labels,
	}

	issueNumber, issueURL, err := createGitHubIssue(payload, githubToken)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create GitHub issue: %v", err))
		return
	}

	// Return success response
	response := APIResponse{
		Success:     true,
		IssueNumber: issueNumber,
		URL:         issueURL,
		Provider:    "github",
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// formatIssueBody formats the bug report into a GitHub issue body using templates
func formatIssueBody(report BugReportRequest) (string, error) {
	tmpl, err := template.New("issue").Parse(issueTemplate)
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}

	data := map[string]interface{}{
		"Description":      getOrDefault(report.Description, "No description provided"),
		"Steps":            getOrDefault(report.Steps, "No steps provided"),
		"Expected":         getOrDefault(report.Expected, "No expected behavior specified"),
		"Actual":           getOrDefault(report.Actual, "No actual behavior specified"),
		"Severity":         getOrDefault(report.Severity, "Medium"),
		"Timestamp":        time.Now().UTC().Format(time.RFC3339),
		"EnvironmentInfo":  formatEnvironmentInfo(report.SystemInfo),
		"ConsoleInfo":      formatConsoleInfo(report.SystemInfo),
		"HasLogs":          len(report.Logs) > 0,
		"LogsText":         formatLogs(report.Logs),
		"Screenshot":       report.Screenshot != "",
		"ScreenshotInfo":   formatScreenshot(report.Screenshot),
		"SessionURL":       report.SessionURL,
	}

	// Add context info if available
	if report.ContextInfo != nil {
		if userLocation, ok := report.ContextInfo["userLocation"].(string); ok && userLocation != "" {
			data["ContextInfo"] = true
			data["UserLocation"] = userLocation
			data["ContextURL"] = getContextURL(report.ContextInfo)
		}
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("failed to execute template: %w", err)
	}

	return buf.String(), nil
}

// formatEnvironmentInfo formats system information into markdown
func formatEnvironmentInfo(systemInfo map[string]interface{}) string {
	var lines []string

	// App version
	if appVersion, ok := systemInfo["appVersion"].(string); ok && appVersion != "" {
		lines = append(lines, fmt.Sprintf("- **App Version:** %s", appVersion))
	} else {
		lines = append(lines, "- **App Version:** unknown")
	}

	lines = append(lines, "- **Environment:** Production")

	// Browser info
	if browser, ok := systemInfo["browser"].(map[string]interface{}); ok {
		name := getStringFromMap(browser, "name")
		version := getStringFromMap(browser, "version")
		if name != "" {
			lines = append(lines, fmt.Sprintf("- **Browser:** %s %s", name, version))
		}
	}

	// Viewport
	if viewport, ok := systemInfo["viewport"].(map[string]interface{}); ok {
		width := getIntFromMap(viewport, "width")
		height := getIntFromMap(viewport, "height")
		if width > 0 && height > 0 {
			lines = append(lines, fmt.Sprintf("- **Viewport:** %dx%d", width, height))
		}
	}

	// User agent (truncated)
	if userAgent, ok := systemInfo["userAgent"].(string); ok && userAgent != "" {
		shortUA := userAgent
		if len(userAgent) > 100 {
			shortUA = userAgent[:100] + "..."
		}
		lines = append(lines, fmt.Sprintf("- **User Agent:** %s", shortUA))
	}

	// Memory usage
	if performance, ok := systemInfo["performance"].(map[string]interface{}); ok {
		if memory, ok := performance["memory"].(map[string]interface{}); ok {
			if usedHeap, ok := memory["usedJSHeapSize"].(float64); ok {
				memMB := int(usedHeap / 1024 / 1024)
				lines = append(lines, fmt.Sprintf("- **Memory Usage:** %dMB used", memMB))
			}
		}
	}

	// Timestamp
	if timestamp, ok := systemInfo["timestamp"].(string); ok && timestamp != "" {
		lines = append(lines, fmt.Sprintf("- **Timestamp:** %s", timestamp))
	} else {
		lines = append(lines, fmt.Sprintf("- **Timestamp:** %s", time.Now().UTC().Format(time.RFC3339)))
	}

	return strings.Join(lines, "\n")
}

// formatConsoleInfo formats console logs and errors
func formatConsoleInfo(systemInfo map[string]interface{}) string {
	var sections []string

	if errors, ok := systemInfo["errors"].(map[string]interface{}); ok {
		if recentErrors, ok := errors["recentErrors"].([]interface{}); ok && len(recentErrors) > 0 {
			sections = append(sections, "### Recent JavaScript Errors", "")

			// Show last 3 errors
			maxErrors := 3
			if len(recentErrors) < maxErrors {
				maxErrors = len(recentErrors)
			}

			for i := 0; i < maxErrors; i++ {
				if errorMap, ok := recentErrors[i].(map[string]interface{}); ok {
					errorType := getStringFromMap(errorMap, "type")
					message := getStringFromMap(errorMap, "message")
					stack := getStringFromMap(errorMap, "stack")
					timestamp := getStringFromMap(errorMap, "timestamp")

					sections = append(sections, fmt.Sprintf("**Error %d:**", i+1))
					sections = append(sections, "```javascript")
					sections = append(sections, fmt.Sprintf("%s: %s", getOrDefault(errorType, "Error"), getOrDefault(message, "Unknown error")))
					if stack != "" {
						sections = append(sections, fmt.Sprintf("Stack: %s", stack))
					}
					sections = append(sections, fmt.Sprintf("Time: %s", getOrDefault(timestamp, "Unknown")))
					sections = append(sections, "```")
					sections = append(sections, "")
				}
			}

			if len(recentErrors) > maxErrors {
				sections = append(sections, fmt.Sprintf("_... and %d more errors_", len(recentErrors)-maxErrors), "")
			}
		}
	}

	if len(sections) == 0 {
		return "No recent errors or console logs captured."
	}

	return strings.Join(sections, "\n")
}

// formatLogs formats the logs array
func formatLogs(logs []string) string {
	if len(logs) == 0 {
		return ""
	}

	// Take last 20 logs
	start := 0
	if len(logs) > 20 {
		start = len(logs) - 20
	}

	return strings.Join(logs[start:], "\n")
}

// formatScreenshot handles screenshot data
func formatScreenshot(screenshot string) string {
	if screenshot == "" {
		return ""
	}

	if strings.HasPrefix(screenshot, "data:image") {
		return fmt.Sprintf("📸 Screenshot captured (%d chars) - available in original bug report data", len(screenshot))
	}

	return fmt.Sprintf("![Bug Screenshot](%s)", screenshot)
}

// createGitHubIssue creates an issue on GitHub
func createGitHubIssue(payload GitHubIssuePayload, token string) (int, string, error) {
	// Get repository from environment or use default
	repo := os.Getenv("GITHUB_REPO")
	if repo == "" {
		repo = "thef4tdaddy/violet-vault"
	}
	
	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/issues", repo)

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return 0, "", fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return 0, "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("token %s", token))
	req.Header.Set("Accept", "application/vnd.github.v3+json")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return 0, "", fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, "", fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusCreated {
		return 0, "", fmt.Errorf("GitHub API returned status %d: %s", resp.StatusCode, string(body))
	}

	var issueResp GitHubIssueResponse
	if err := json.Unmarshal(body, &issueResp); err != nil {
		return 0, "", fmt.Errorf("failed to parse response: %w", err)
	}

	return issueResp.Number, issueResp.HTMLURL, nil
}

// Helper functions

func getOrDefault(value, defaultValue string) string {
	if value == "" {
		return defaultValue
	}
	return value
}

func getStringFromMap(m map[string]interface{}, key string) string {
	if val, ok := m[key].(string); ok {
		return val
	}
	return ""
}

func getIntFromMap(m map[string]interface{}, key string) int {
	if val, ok := m[key].(float64); ok {
		return int(val)
	}
	return 0
}

func getContextURL(contextInfo map[string]interface{}) string {
	if url, ok := contextInfo["url"].(string); ok && url != "" {
		return url
	}
	return "unknown"
}

func respondWithError(w http.ResponseWriter, statusCode int, message string) {
	w.WriteHeader(statusCode)
	response := APIResponse{
		Success:  false,
		Error:    message,
		Provider: "github",
	}
	json.NewEncoder(w).Encode(response)
}
