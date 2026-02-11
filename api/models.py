"""
Data Models for VioletVault Analytics Service
Mirrors the TypeScript/Zod schemas from the frontend
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class Envelope(BaseModel):
    """
    Envelope entity representing budget categories
    Mirrors src/domain/schemas/envelope.ts
    """

    model_config = ConfigDict(extra="allow")

    id: str = Field(..., min_length=1, description="Envelope ID")
    name: str = Field(..., min_length=1, max_length=100, description="Envelope name")
    category: str = Field(..., min_length=1, description="Category")
    archived: bool = Field(default=False, description="Whether envelope is archived")
    lastModified: int = Field(..., gt=0, description="Last modified timestamp")
    createdAt: int | None = Field(None, gt=0, description="Creation timestamp")
    currentBalance: float = Field(default=0.0, description="Current balance")
    description: str | None = Field(None, max_length=500, description="Description")

    # Discriminated Union Type
    type: Literal["standard", "goal", "liability", "supplemental"] = Field(
        default="standard", description="Envelope type"
    )

    # Goal specific
    targetAmount: float | None = Field(None, ge=0)
    targetDate: str | None = None
    priority: Literal["low", "medium", "high"] | None = None
    isPaused: bool | None = None
    isCompleted: bool | None = None
    monthlyContribution: float | None = None

    # Liability specific
    minimumPayment: float | None = None
    interestRate: float | None = None
    dueDateDay: int | None = Field(None, ge=1, le=31)

    # Supplemental specific
    accountType: Literal["FSA", "HSA", "529", "IRA", "401K", "other"] | None = None
    annualContribution: float | None = None
    expirationDate: str | None = None


class Transaction(BaseModel):
    """
    Transaction entity representing financial operations
    Mirrors src/domain/schemas/transaction.ts
    """

    model_config = ConfigDict(extra="allow")

    id: str = Field(..., min_length=1, description="Transaction ID")
    date: str = Field(..., description="Transaction date (ISO format)")
    amount: float = Field(..., description="Amount (negative for expenses, positive for income)")
    envelopeId: str = Field(..., min_length=1, description="Envelope ID")
    category: str = Field(..., min_length=1, description="Category")
    type: Literal["income", "expense", "transfer"] = Field(
        default="expense", description="Transaction type"
    )
    lastModified: int = Field(..., gt=0, description="Last modified timestamp")
    createdAt: int | None = Field(None, gt=0, description="Creation timestamp")
    description: str | None = Field(None, max_length=500, description="Description")
    merchant: str | None = Field(None, max_length=200, description="Merchant name")
    receiptUrl: str | None = None

    # Scheduled Transaction support
    isScheduled: bool = Field(default=False)
    recurrenceRule: str | None = None  # iCal RRule string

    # Paycheck support
    allocations: dict[str, float] | None = None  # envelopeId -> amount

    # Connection properties
    isInternalTransfer: bool | None = None
    paycheckId: str | None = None
    fromEnvelopeId: str | None = None
    toEnvelopeId: str | None = None


class BudgetMetadata(BaseModel):
    """
    Budget metadata containing high-level balance information
    Mirrors src/domain/schemas/budget-record.ts
    """

    model_config = ConfigDict(extra="allow")

    id: str = Field(..., min_length=1, description="Budget record ID")
    lastModified: int = Field(..., gt=0, description="Last modified timestamp")
    version: int | None = Field(None, gt=0, description="Version number")
    actualBalance: float | None = Field(None, description="Actual account balance")
    unassignedCash: float | None = Field(None, description="Unassigned cash balance")
    totalEnvelopeBalance: float | None = Field(None, description="Sum of all envelope balances")


class AuditSnapshot(BaseModel):
    """
    Complete snapshot of budget data for integrity audit
    Contains all envelopes, transactions, and metadata needed for analysis
    """

    envelopes: list[Envelope] = Field(..., description="All envelopes in the budget")
    transactions: list[Transaction] = Field(..., description="All transactions")
    metadata: BudgetMetadata = Field(..., description="Budget metadata")


class IntegrityViolation(BaseModel):
    """
    Represents a single integrity violation found during audit
    """

    severity: Literal["error", "warning", "info"] = Field(..., description="Violation severity")
    type: str = Field(
        ..., description="Type of violation (e.g., 'orphaned_transaction', 'negative_balance')"
    )
    message: str = Field(..., description="Human-readable description of the violation")
    entityId: str | None = Field(
        None, description="ID of the entity involved (envelope or transaction)"
    )
    entityType: Literal["envelope", "transaction", "budget"] | None = Field(
        None, description="Type of entity"
    )
    details: dict | None = Field(
        default_factory=lambda: {}, description="Additional details about the violation"
    )


class IntegrityAuditResult(BaseModel):
    """
    Result of an integrity audit operation
    Contains all violations found and summary statistics
    """

    violations: list[IntegrityViolation] = Field(..., description="List of all violations found")
    summary: dict = Field(..., description="Summary statistics (counts by severity and type)")
    timestamp: str = Field(..., description="When the audit was performed (ISO format)")
    snapshotSize: dict = Field(..., description="Size of the data snapshot analyzed")
