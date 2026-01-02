# Python Analytics Service - Deployment Guide

## Overview

This guide covers production deployment of the VioletVault Python Analytics Service.

## Prerequisites

- Python 3.11 or higher
- pip
- Production server (e.g., AWS EC2, DigitalOcean Droplet, or container platform)

## Deployment Options

### Option 1: Docker Deployment (Recommended)

Create `api/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run as non-root user
RUN useradd -m -u 1000 apiuser && chown -R apiuser:apiuser /app
USER apiuser

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
# Build image
docker build -t violet-vault-analytics ./api

# Run container
docker run -d -p 8000:8000 \
  -e ALLOWED_ORIGINS="https://your-frontend.com" \
  --name analytics-api \
  violet-vault-analytics
```

### Option 2: Systemd Service

Create `/etc/systemd/system/violet-vault-analytics.service`:

```ini
[Unit]
Description=VioletVault Analytics API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/violet-vault-analytics
Environment="PATH=/opt/violet-vault-analytics/venv/bin"
ExecStart=/opt/violet-vault-analytics/venv/bin/uvicorn api.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable violet-vault-analytics
sudo systemctl start violet-vault-analytics
```

### Option 3: Cloud Platform

#### Vercel

While Vercel is optimized for Node.js, you can deploy Python using serverless functions.

#### Heroku

```bash
# Create Procfile
echo "web: uvicorn api.main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
heroku create violet-vault-analytics
git push heroku main
```

#### AWS Lambda

Use AWS Lambda with API Gateway for serverless deployment. Consider using [Mangum](https://mangum.io/) for ASGI support.

## Production Configuration

### Environment Variables

Create `.env` file (or set in your deployment platform):

```bash
# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com

# Optional: API Key for authentication
API_KEY=your-secret-api-key-here

# Optional: Log level
LOG_LEVEL=info
```

### Update CORS in `api/main.py`

```python
import os

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)
```

### Add API Key Authentication (Optional)

```python
from fastapi import Header, HTTPException

API_KEY = os.getenv("API_KEY")

async def verify_api_key(x_api_key: str = Header(None)):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True

@app.post("/audit/envelope-integrity",
          response_model=IntegrityAuditResult,
          dependencies=[Depends(verify_api_key)])
def audit_envelope_integrity(snapshot: AuditSnapshot):
    # ... existing code
```

## Monitoring & Logging

### Add Structured Logging

```python
import logging
import sys

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("violet-vault-analytics")
```

### Add Health Metrics

Consider adding:

- Response time tracking
- Error rate monitoring
- Audit request count
- Violation type frequency

Tools: Prometheus, Datadog, CloudWatch

## Performance Optimization

### Caching

For repeated audits on the same data:

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def audit_cached(snapshot_hash: str, snapshot: AuditSnapshot):
    # Audit logic
    pass
```

### Rate Limiting

Add rate limiting to prevent abuse:

```bash
pip install slowapi
```

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/audit/envelope-integrity")
@limiter.limit("10/minute")
def audit_envelope_integrity(request: Request, snapshot: AuditSnapshot):
    # ... existing code
```

## Security Checklist

- [ ] Set specific CORS origins (no wildcards)
- [ ] Add API key authentication
- [ ] Enable HTTPS only
- [ ] Set up rate limiting
- [ ] Configure firewall rules
- [ ] Keep dependencies updated
- [ ] Use secrets management (AWS Secrets Manager, etc.)
- [ ] Enable request logging
- [ ] Set up monitoring and alerts

## Scaling

### Horizontal Scaling

Deploy multiple instances behind a load balancer (nginx, AWS ALB, etc.).

### Database for Caching

For high-traffic scenarios, consider adding Redis for caching:

```bash
pip install redis
```

## Backup & Recovery

- Use infrastructure-as-code (Terraform, CloudFormation)
- Maintain deployment scripts in version control
- Document rollback procedures

## Cost Optimization

- Use auto-scaling based on demand
- Consider serverless for low-traffic scenarios
- Set up cost alerts

## Support & Maintenance

- Monitor error logs regularly
- Set up automated dependency updates (Dependabot)
- Test new versions in staging before production
- Maintain runbook for common issues

## Integration with Frontend

Update frontend environment variables:

```bash
# .env.production
VITE_ANALYTICS_API_URL=https://analytics.your-domain.com
VITE_ANALYTICS_API_KEY=your-api-key-here
```

## Troubleshooting

### Common Issues

1. **CORS errors**: Check ALLOWED_ORIGINS configuration
2. **Connection refused**: Verify firewall rules and port binding
3. **Slow responses**: Check server resources and consider caching
4. **Memory issues**: Monitor heap size, optimize data processing

### Useful Commands

```bash
# Check service status
systemctl status violet-vault-analytics

# View logs
journalctl -u violet-vault-analytics -f

# Restart service
systemctl restart violet-vault-analytics

# Test endpoint
curl -X POST https://analytics.your-domain.com/health
```
