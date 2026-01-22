"""
Pydantic models for VioletVault API
Defines request/response schemas for API endpoints
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class IntegrityViolation(BaseModel):
    """A single integrity violation found during audit"""

    type: str = Field(..., description="Type of violation")
    severity: str = Field(..., description="Severity level: error, warning, info")
    message: str = Field(..., description="Human-readable description")
    entity_id: str | None = Field(None, description="ID of affected entity")
    details: dict[str, Any] | None = Field(None, description="Additional details")


class IntegrityAuditResult(BaseModel):
    """Result of an envelope integrity audit"""

    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_valid: bool = Field(..., description="Whether the budget passed integrity checks")
    violations: list[IntegrityViolation] = Field(
        default_factory=list, description="List of violations found"
    )
    summary: dict[str, int] = Field(
        default_factory=dict, description="Count of violations by type"
    )


class AuditSnapshot(BaseModel):
    """Budget snapshot for integrity audit"""

    envelopes: list[dict[str, Any]] = Field(default_factory=list)
    transactions: list[dict[str, Any]] = Field(default_factory=list)
    actual_balance: float = Field(0.0, description="Total actual balance")
    unassigned_cash: float = Field(0.0, description="Unassigned cash amount")
    allow_negative: bool = Field(False, description="Whether negative envelopes are allowed")
