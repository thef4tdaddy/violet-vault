# VioletVault Bug Reporter API - Usage Guide

This guide provides practical examples and best practices for using the VioletVault Bug Reporter API.

## Table of Contents

- [Getting Started](#getting-started)
- [Submitting Bug Reports](#submitting-bug-reports)
- [Working with Screenshots](#working-with-screenshots)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Integration Examples](#integration-examples)

## Getting Started

### Base URLs

- **Production**: `https://bug-reporter.violetvault.workers.dev`
- **Local Development**: `http://localhost:8787`

### Authentication

Most endpoints are public and don't require authentication. Admin endpoints require an API key:

```javascript
const response = await fetch('https://bug-reporter.violetvault.workers.dev/stats', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
```

## Submitting Bug Reports

### Minimal Bug Report

The simplest bug report only needs a title OR description:

```javascript
const response = await fetch('https://bug-reporter.violetvault.workers.dev/report-issue', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'App crashes when creating envelope',
    description: 'When I try to create a new envelope, the app crashes immediately'
  })
});

const result = await response.json();
console.log('Issue created:', result.issueUrl);
```

### Complete Bug Report

Include all available context for better issue tracking:

```javascript
const bugReport = {
  title: 'Sync failure after network timeout',
  description: 'Detailed description of what happened',
  
  // Steps to reproduce
  steps: `
    1. Open the VioletVault app
    2. Disconnect from internet
    3. Try to sync budget data
    4. Observe the error
  `,
  
  // Expected vs actual behavior
  expected: 'App should queue the sync for later and show offline message',
  actual: 'App shows error and doesn\'t queue the sync',
  
  // Severity level
  severity: 'high', // Options: low, medium, high, critical
  
  // Environment context
  env: {
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    appVersion: '1.9.0',
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    referrer: document.referrer
  },
  
  // System information
  systemInfo: {
    browser: 'Chrome',
    version: '120.0.0',
    os: 'Windows',
    platform: 'desktop',
    deviceMemory: navigator.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency
  },
  
  // Highlight.io session URL (if available)
  sessionUrl: 'https://app.highlight.io/sessions/abc123',
  
  // Screenshot (see next section)
  screenshot: screenshotDataUrl
};

const response = await fetch('https://bug-reporter.violetvault.workers.dev/report-issue', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(bugReport)
});

const result = await response.json();
if (result.success) {
  console.log('GitHub Issue:', result.issueUrl);
  console.log('Screenshot:', result.screenshotUrl);
}
```

### Nested Payload Format

The API also accepts a nested format with a `data` field:

```javascript
const payload = {
  type: 'bug-report',
  data: {
    title: 'Bug title',
    description: 'Bug description'
  }
};
```

## Working with Screenshots

### Capturing Screenshots

Use HTML5 Canvas API to capture screenshots:

```javascript
async function captureScreenshot() {
  try {
    // Method 1: Using html2canvas
    const canvas = await html2canvas(document.body, {
      allowTaint: true,
      useCORS: true,
      logging: false,
      width: window.innerWidth,
      height: window.innerHeight
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return null;
  }
}

// Method 2: Using native browser API (if supported)
async function captureWithNativeAPI() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: 'screen' }
    });
    
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    stream.getTracks().forEach(track => track.stop());
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Native screenshot failed:', error);
    return null;
  }
}
```

### Optimizing Screenshot Size

Large screenshots can slow down submission. Optimize before sending:

```javascript
function optimizeScreenshot(dataUrl, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    
    img.src = dataUrl;
  });
}

// Usage
const rawScreenshot = await captureScreenshot();
const optimizedScreenshot = await optimizeScreenshot(rawScreenshot);
```

## Error Handling

### Handling API Errors

```javascript
async function submitBugReport(bugReport) {
  try {
    const response = await fetch('https://bug-reporter.violetvault.workers.dev/report-issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bugReport)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit bug report');
    }
    
    return result;
  } catch (error) {
    console.error('Bug report submission failed:', error);
    
    // Handle specific errors
    if (error.message.includes('title or description')) {
      alert('Please provide either a title or description for your bug report');
    } else if (error.message.includes('network')) {
      alert('Network error. Please check your connection and try again');
    } else {
      alert('Failed to submit bug report. Please try again later');
    }
    
    throw error;
  }
}
```

### Retry Logic

Implement exponential backoff for failed requests:

```javascript
async function submitWithRetry(bugReport, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch('https://bug-reporter.violetvault.workers.dev/report-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bugReport)
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw lastError;
      }
    } catch (error) {
      lastError = error;
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}
```

## Best Practices

### 1. Always Provide Context

```javascript
// ❌ Bad - minimal context
{
  title: 'App crashed'
}

// ✅ Good - rich context
{
  title: 'App crashed when creating envelope with long name',
  description: 'Reproducible crash when envelope name exceeds 100 characters',
  steps: '1. Go to Budget\n2. Create envelope\n3. Enter 101 character name\n4. Click save',
  severity: 'high',
  env: { /* full environment */ }
}
```

### 2. Sanitize User Input

Remove sensitive data before submitting:

```javascript
function sanitizeBugReport(report) {
  return {
    ...report,
    // Remove potential PII
    env: {
      ...report.env,
      url: report.env?.url?.replace(/([?&])(token|key|auth)=[^&]*/gi, '$1$2=REDACTED')
    },
    // Truncate large fields
    description: report.description?.slice(0, 5000),
    steps: report.steps?.slice(0, 2000)
  };
}
```

### 3. Rate Limiting

Don't spam the API with repeated reports:

```javascript
class BugReportService {
  constructor() {
    this.lastSubmission = null;
    this.minInterval = 60000; // 1 minute
  }
  
  async submit(bugReport) {
    const now = Date.now();
    
    if (this.lastSubmission && now - this.lastSubmission < this.minInterval) {
      throw new Error('Please wait before submitting another report');
    }
    
    const result = await submitBugReport(bugReport);
    this.lastSubmission = now;
    
    return result;
  }
}
```

### 4. User Feedback

Provide clear feedback to users:

```javascript
async function submitBugReportWithFeedback(bugReport) {
  const statusEl = document.getElementById('submission-status');
  
  try {
    statusEl.textContent = 'Submitting bug report...';
    statusEl.className = 'status pending';
    
    const result = await submitBugReport(bugReport);
    
    statusEl.textContent = `Bug report submitted! Issue #${result.issueNumber}`;
    statusEl.className = 'status success';
    
    // Optionally, open the GitHub issue
    if (confirm('Would you like to view the GitHub issue?')) {
      window.open(result.issueUrl, '_blank');
    }
    
    return result;
  } catch (error) {
    statusEl.textContent = `Failed to submit: ${error.message}`;
    statusEl.className = 'status error';
    throw error;
  }
}
```

## Integration Examples

### React Component

```javascript
import { useState } from 'react';

function BugReportButton() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      const screenshot = await captureScreenshot();
      
      const response = await fetch('https://bug-reporter.violetvault.workers.dev/report-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'User reported bug',
          description: document.getElementById('bug-description').value,
          screenshot,
          env: {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
          }
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit bug report');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div>
      <textarea id="bug-description" placeholder="Describe the bug..." />
      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Report Bug'}
      </button>
      
      {result && (
        <div>
          <p>Bug report submitted!</p>
          <a href={result.issueUrl} target="_blank">View on GitHub</a>
        </div>
      )}
    </div>
  );
}
```

### Vue Component

```vue
<template>
  <div class="bug-reporter">
    <textarea v-model="description" placeholder="Describe the bug..." />
    <button @click="submitReport" :disabled="submitting">
      {{ submitting ? 'Submitting...' : 'Report Bug' }}
    </button>
    
    <div v-if="result" class="success">
      <p>Bug report submitted!</p>
      <a :href="result.issueUrl" target="_blank">View on GitHub</a>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      description: '',
      submitting: false,
      result: null
    };
  },
  
  methods: {
    async submitReport() {
      this.submitting = true;
      
      try {
        const response = await fetch('https://bug-reporter.violetvault.workers.dev/report-issue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: this.description,
            env: {
              userAgent: navigator.userAgent,
              url: window.location.href,
              timestamp: new Date().toISOString()
            }
          })
        });
        
        this.result = await response.json();
      } catch (error) {
        console.error('Submission failed:', error);
        alert('Failed to submit bug report');
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>
```

### Node.js / Backend

```javascript
const fetch = require('node-fetch');

async function createBugReport(title, description, additionalContext) {
  const response = await fetch('https://bug-reporter.violetvault.workers.dev/report-issue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title,
      description,
      severity: 'high',
      env: {
        timestamp: new Date().toISOString(),
        appVersion: process.env.APP_VERSION,
        ...additionalContext
      }
    })
  });
  
  return await response.json();
}

// Usage
createBugReport(
  'Server crashed during data sync',
  'Full error stack trace...',
  { server: 'api-01', region: 'us-west' }
);
```

## Further Reading

- [API Reference](./API.md) - Complete API documentation
- [OpenAPI Spec](./openapi.yaml) - Machine-readable API specification
- [Main README](./README.md) - Worker setup and deployment
- [GitHub Issues](https://github.com/thef4tdaddy/violet-vault/issues) - View submitted issues

## Support

For issues with the Bug Reporter API:
- Create an issue: [GitHub Issues](https://github.com/thef4tdaddy/violet-vault/issues)
- Check logs: `wrangler tail` for worker logs
- Test locally: `npm run dev` to run development server
