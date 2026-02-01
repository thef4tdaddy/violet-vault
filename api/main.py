import os
import re
from typing import Any

import sentry_sdk
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sentry_sdk.integrations.fastapi import FastApiIntegration

from api.analytics import EnvelopeIntegrityAuditor
from api.marketing.status import router as marketing_status_router
from api.models import AuditSnapshot, IntegrityAuditResult
from api.sentinel.receipts import router as sentinel_router


# Sentry PII Scrubbing
def scrub_pii(text: str) -> str:
    if not text:
        return text
    # 1. Redact IDs (UUIDs)
    text = re.sub(
        r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
        "[REDACTED_ID]",
        text,
        flags=re.IGNORECASE,
    )
    # 2. Redact Amounts ($100.00, 100.00)
    text = re.sub(r"[+-]?\$?\d+\.\d{2}\b", "[REDACTED_AMOUNT]", text)
    # 3. Redact Emails
    text = re.sub(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", "[REDACTED_EMAIL]", text)
    return text


def before_send(event: dict[str, Any], hint: dict[str, Any]) -> dict[str, Any] | None:
    # Redact sensitive data from message and exceptions
    if "message" in event:
        # Event message can be str or None
        msg = event.get("message")
        if msg:
            event["message"] = scrub_pii(str(msg))

    if "exception" in event:
        exc_container = event.get("exception")
        if isinstance(exc_container, dict) and "values" in exc_container:
            for exc in exc_container["values"]:
                if isinstance(exc, dict) and "value" in exc and exc["value"]:
                    exc["value"] = scrub_pii(str(exc["value"]))

    # Redact request data
    if "request" in event:
        req = event["request"]
        if isinstance(req, dict):
            # Clear cookies and environment variables
            req["cookies"] = ""
            if "env" in req:
                req["env"] = None

            if "data" in req:
                # Python SDK sometimes puts dicts or strings in 'data'
                data_str = str(req["data"])
                req["data"] = scrub_pii(data_str)

    return event


# Initialize Sentry
dsn = os.getenv("SENTRY_DSN")
if dsn:
    sentry_sdk.init(
        dsn=dsn,
        integrations=[FastApiIntegration()],
        environment=os.getenv("SENTRY_ENVIRONMENT", "production"),
        release=os.getenv("SENTRY_RELEASE"),
        traces_sample_rate=1.0,
        before_send=before_send,  # type: ignore[arg-type]
    )

# Create FastAPI app
app = FastAPI(
    title="VioletVault Analytics API",
    description="Heavy compute analytics endpoints for VioletVault budget data",
    version="1.0.0",
)

# Configure CORS for frontend access
# TODO: For production, configure specific allowed origins via environment variable
# Example: VITE_FRONTEND_URL=https://violet-vault.vercel.app
# For now, allowing all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production: Replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route Mounting
app.include_router(sentinel_router, prefix="/api")
app.include_router(marketing_status_router, prefix="/api/marketing")


@app.get("/")
def get_root() -> dict[str, str]:
    """Health check endpoint"""
    return {"service": "VioletVault Analytics API", "version": "1.0.0", "status": "healthy"}


@app.post("/audit/envelope-integrity", response_model=IntegrityAuditResult)
def audit_envelope_integrity(snapshot: AuditSnapshot) -> IntegrityAuditResult:
    """
    Perform envelope integrity audit on budget data snapshot

    This endpoint analyzes a complete snapshot of budget data and reports
    integrity violations that the UI might miss:

    - **Orphaned Transactions**: Transactions pointing to non-existent envelopes
    - **Negative Envelopes**: Envelopes with negative balances (unless allowed)
    - **Balance Leakage**: Sum of envelope balances + unassigned cash != actual balance

    Args:
        snapshot: Complete budget snapshot with envelopes, transactions, and metadata

    Returns:
        IntegrityAuditResult with all violations found and summary statistics

    Raises:
        HTTPException: If snapshot data is invalid or processing fails
    """
    try:
        auditor = EnvelopeIntegrityAuditor()
        result = auditor.audit(snapshot)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit failed: {str(e)}") from e


@app.get("/api/warm")
async def warm_up() -> dict[str, str]:
    """
    Lightweight warm-up endpoint to mitigate cold starts.
    Used by CI or external monitoring to keep the service warm during peak traffic.
    """
    return {"status": "warmed", "service": "VioletVault Analytics API"}


@app.get("/health")
def health_check() -> dict[str, Any]:
    """
    Detailed health check endpoint
    Returns service status and capabilities
    """
    return {
        "status": "healthy",
        "service": "VioletVault Analytics API",
        "version": "1.0.0",
        "endpoints": {"audit": "/audit/envelope-integrity"},
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
