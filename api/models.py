"""
Data Models for VioletVault Analytics Service
Mirrors the TypeScript/Zod schemas from the frontend
"""

from typing import Optional, Literal, List, Dict
from pydantic import BaseModel, Field


class Envelope(BaseModel):
    """
    Envelope entity representing budget categories
    Mirrors src/domain/schemas/envelope.ts
    """
    id: str = Field(..., min_length=1, description="Envelope ID")
    name: str = Field(..., min_length=1, max_length=100, description="Envelope name")
    category: str = Field(..., min_length=1, description="Category")
    archived: bool = Field(default=False, description="Whether envelope is archived")
    lastModified: int = Field(..., gt=0, description="Last modified timestamp")
    createdAt: Optional[int] = Field(None, gt=0, description="Creation timestamp")
    currentBalance: Optional[float] = Field(None, description="Current balance (can be negative)")
    targetAmount: Optional[float] = Field(None, ge=0, description="Target amount")
    description: Optional[str] = Field(None, max_length=500, description="Description")
    envelopeType: Optional[Literal["bill", "variable", "savings", "sinking_fund", "supplemental"]] = None
    autoAllocate: Optional[bool] = None
    monthlyBudget: Optional[float] = Field(None, ge=0)
    biweeklyAllocation: Optional[float] = Field(None, ge=0)
    billId: Optional[str] = None
    debtId: Optional[str] = None
    priority: Optional[Literal["low", "medium", "high"]] = None
    isPaused: Optional[bool] = None
    isCompleted: Optional[bool] = None
    targetDate: Optional[str] = None
    monthlyContribution: Optional[float] = Field(None, ge=0)
    annualContribution: Optional[float] = Field(None, ge=0)
    expirationDate: Optional[str] = None
    isActive: Optional[bool] = None
    accountType: Optional[str] = None

    class Config:
        extra = "allow"  # Allow additional fields like passthrough() in Zod


class Transaction(BaseModel):
    """
    Transaction entity representing financial operations
    Mirrors src/domain/schemas/transaction.ts
    """
    id: str = Field(..., min_length=1, description="Transaction ID")
    date: str = Field(..., description="Transaction date (ISO format)")
    amount: float = Field(..., description="Amount (negative for expenses, positive for income)")
    envelopeId: str = Field(..., min_length=1, description="Envelope ID")
    category: str = Field(..., min_length=1, description="Category")
    type: Literal["income", "expense", "transfer"] = Field(default="expense", description="Transaction type")
    lastModified: int = Field(..., gt=0, description="Last modified timestamp")
    createdAt: Optional[int] = Field(None, gt=0, description="Creation timestamp")
    description: Optional[str] = Field(None, max_length=500, description="Description")
    merchant: Optional[str] = Field(None, max_length=200, description="Merchant name")
    receiptUrl: Optional[str] = None
    isInternalTransfer: Optional[bool] = None
    paycheckId: Optional[str] = None
    fromEnvelopeId: Optional[str] = None
    toEnvelopeId: Optional[str] = None

    class Config:
        extra = "allow"  # Allow additional fields


class BudgetMetadata(BaseModel):
    """
    Budget metadata containing high-level balance information
    Mirrors src/domain/schemas/budget-record.ts
    """
    id: str = Field(..., min_length=1, description="Budget record ID")
    lastModified: int = Field(..., gt=0, description="Last modified timestamp")
    version: Optional[int] = Field(None, gt=0, description="Version number")
    actualBalance: Optional[float] = Field(None, description="Actual account balance")
    unassignedCash: Optional[float] = Field(None, description="Unassigned cash balance")
    totalEnvelopeBalance: Optional[float] = Field(None, description="Sum of all envelope balances")

    class Config:
        extra = "allow"  # Allow additional fields


class AuditSnapshot(BaseModel):
    """
    Complete snapshot of budget data for integrity audit
    Contains all envelopes, transactions, and metadata needed for analysis
    """
    envelopes: List[Envelope] = Field(..., description="All envelopes in the budget")
    transactions: List[Transaction] = Field(..., description="All transactions")
    metadata: BudgetMetadata = Field(..., description="Budget metadata")


class IntegrityViolation(BaseModel):
    """
    Represents a single integrity violation found during audit
    """
    severity: Literal["error", "warning", "info"] = Field(..., description="Violation severity")
    type: str = Field(..., description="Type of violation (e.g., 'orphaned_transaction', 'negative_balance')")
    message: str = Field(..., description="Human-readable description of the violation")
    entityId: Optional[str] = Field(None, description="ID of the entity involved (envelope or transaction)")
    entityType: Optional[Literal["envelope", "transaction", "budget"]] = Field(None, description="Type of entity")
    details: Optional[Dict] = Field(default_factory=dict, description="Additional details about the violation")


class IntegrityAuditResult(BaseModel):
    """
    Result of an integrity audit operation
    Contains all violations found and summary statistics
    """
    violations: List[IntegrityViolation] = Field(..., description="List of all violations found")
    summary: Dict = Field(..., description="Summary statistics (counts by severity and type)")
    timestamp: str = Field(..., description="When the audit was performed (ISO format)")
    snapshotSize: Dict = Field(..., description="Size of the data snapshot analyzed")
