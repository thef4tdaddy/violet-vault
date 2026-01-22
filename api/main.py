"""
VioletVault Analytics API
FastAPI application providing analytics endpoints for the frontend

Features:
- SentinelShare receipts integration (PostgreSQL backend)
- Envelope integrity auditing
- CORS configuration for frontend access
"""

from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from api.models import AuditSnapshot, IntegrityAuditResult, IntegrityViolation
from api.sentinel.receipts import router as sentinel_router

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


@app.get("/")
def get_root() -> dict[str, str]:
    """Health check endpoint"""
    return {"service": "VioletVault Analytics API", "version": "1.0.0", "status": "healthy"}


class EnvelopeIntegrityAuditor:
    """
    Audits budget data for integrity violations.

    Checks for:
    - Orphaned transactions (pointing to non-existent envelopes)
    - Negative envelopes (unless allowed)
    - Balance leakage (sum mismatch)
    """

    def audit(self, snapshot: AuditSnapshot) -> IntegrityAuditResult:
        """Perform integrity audit on budget snapshot"""
        violations: list[IntegrityViolation] = []

        # Get envelope IDs
        envelope_ids = {e.get("id") for e in snapshot.envelopes if e.get("id")}

        # Check for orphaned transactions
        for txn in snapshot.transactions:
            envelope_id = txn.get("envelopeId")
            if envelope_id and envelope_id not in envelope_ids:
                violations.append(
                    IntegrityViolation(
                        type="orphaned_transaction",
                        severity="error",
                        message=f"Transaction references non-existent envelope: {envelope_id}",
                        entity_id=txn.get("id"),
                        details={"envelopeId": envelope_id},
                    )
                )

        # Check for negative envelopes
        if not snapshot.allow_negative:
            for envelope in snapshot.envelopes:
                balance = envelope.get("balance", 0)
                if balance < 0:
                    violations.append(
                        IntegrityViolation(
                            type="negative_balance",
                            severity="warning",
                            message=f"Envelope has negative balance: {balance}",
                            entity_id=envelope.get("id"),
                            details={"balance": balance, "name": envelope.get("name")},
                        )
                    )

        # Check for balance leakage
        total_envelope_balance = sum(e.get("balance", 0) for e in snapshot.envelopes)
        expected_total = snapshot.actual_balance
        computed_total = total_envelope_balance + snapshot.unassigned_cash

        if abs(computed_total - expected_total) > 0.01:  # Allow for floating point errors
            violations.append(
                IntegrityViolation(
                    type="balance_leakage",
                    severity="error",
                    message="Sum of envelope balances + unassigned cash != actual balance",
                    details={
                        "expected": expected_total,
                        "computed": computed_total,
                        "difference": expected_total - computed_total,
                    },
                )
            )

        # Build summary
        summary: dict[str, int] = {}
        for v in violations:
            summary[v.type] = summary.get(v.type, 0) + 1

        return IntegrityAuditResult(
            is_valid=len(violations) == 0,
            violations=violations,
            summary=summary,
        )


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
        "endpoints": {
            "audit": "/audit/envelope-integrity",
            "receipts": "/api/receipts",
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
