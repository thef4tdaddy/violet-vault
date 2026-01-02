"""
VioletVault Analytics API
FastAPI application providing analytics endpoints for the frontend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api.models import AuditSnapshot, IntegrityAuditResult
from api.analytics import EnvelopeIntegrityAuditor

# Create FastAPI app
app = FastAPI(
    title="VioletVault Analytics API",
    description="Heavy compute analytics endpoints for VioletVault budget data",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "service": "VioletVault Analytics API",
        "version": "1.0.0",
        "status": "healthy"
    }


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
        raise HTTPException(
            status_code=500,
            detail=f"Audit failed: {str(e)}"
        )


@app.get("/health")
def health_check():
    """
    Detailed health check endpoint
    Returns service status and capabilities
    """
    return {
        "status": "healthy",
        "service": "VioletVault Analytics API",
        "version": "1.0.0",
        "endpoints": {
            "audit": "/audit/envelope-integrity"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
