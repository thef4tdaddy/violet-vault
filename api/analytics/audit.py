"""
Envelope Integrity Audit Logic
Analyzes budget data for integrity violations and inconsistencies
"""

from typing import List, Dict, Set
from datetime import datetime
from api.models import (
    AuditSnapshot,
    IntegrityViolation,
    IntegrityAuditResult,
    Envelope,
    Transaction
)


class EnvelopeIntegrityAuditor:
    """
    Performs integrity checks on envelope budget data
    Detects orphaned transactions, negative balances, and balance leakage
    
    This class is stateless - each audit() call is independent.
    """

    def audit(self, snapshot: AuditSnapshot) -> IntegrityAuditResult:
        """
        Perform complete integrity audit on budget snapshot
        
        Args:
            snapshot: Complete budget data snapshot
            
        Returns:
            IntegrityAuditResult with all violations found
        """
        violations: List[IntegrityViolation] = []
        
        # Build envelope ID set for efficient lookup
        envelope_ids = self._build_envelope_id_set(snapshot.envelopes)
        
        # Run all audit checks
        self._check_orphaned_transactions(snapshot.transactions, envelope_ids, violations)
        self._check_negative_envelopes(snapshot.envelopes, violations)
        self._check_balance_leakage(snapshot, violations)
        
        # Generate summary statistics
        summary = self._generate_summary(violations)
        
        return IntegrityAuditResult(
            violations=violations,
            summary=summary,
            timestamp=datetime.utcnow().isoformat(),
            snapshotSize={
                "envelopes": len(snapshot.envelopes),
                "transactions": len(snapshot.transactions),
                "metadata": 1
            }
        )

    def _build_envelope_id_set(self, envelopes: List[Envelope]) -> Set[str]:
        """
        Build a set of valid envelope IDs for fast lookup
        
        Args:
            envelopes: List of all envelopes
            
        Returns:
            Set of envelope IDs (including "unassigned" special envelope)
        """
        envelope_ids = {env.id for env in envelopes}
        # Add special "unassigned" envelope ID that's used for income
        envelope_ids.add("unassigned")
        return envelope_ids

    def _check_orphaned_transactions(
        self, 
        transactions: List[Transaction], 
        envelope_ids: Set[str],
        violations: List[IntegrityViolation]
    ) -> None:
        """
        Check for transactions pointing to non-existent envelopes
        
        Args:
            transactions: List of all transactions
            envelope_ids: Set of valid envelope IDs
            violations: List to append violations to
        """
        for txn in transactions:
            # Check main envelopeId
            if txn.envelopeId and txn.envelopeId not in envelope_ids:
                violations.append(IntegrityViolation(
                    severity="error",
                    type="orphaned_transaction",
                    message=f"Transaction references non-existent envelope: {txn.envelopeId}",
                    entityId=txn.id,
                    entityType="transaction",
                    details={
                        "transactionId": txn.id,
                        "missingEnvelopeId": txn.envelopeId,
                        "amount": txn.amount,
                        "date": txn.date,
                        "description": txn.description
                    }
                ))
            
            # Check fromEnvelopeId for transfers
            if txn.fromEnvelopeId and txn.fromEnvelopeId not in envelope_ids:
                violations.append(IntegrityViolation(
                    severity="error",
                    type="orphaned_transaction",
                    message=f"Transfer transaction references non-existent source envelope: {txn.fromEnvelopeId}",
                    entityId=txn.id,
                    entityType="transaction",
                    details={
                        "transactionId": txn.id,
                        "missingEnvelopeId": txn.fromEnvelopeId,
                        "amount": txn.amount,
                        "type": "transfer_from"
                    }
                ))
            
            # Check toEnvelopeId for transfers
            if txn.toEnvelopeId and txn.toEnvelopeId not in envelope_ids:
                violations.append(IntegrityViolation(
                    severity="error",
                    type="orphaned_transaction",
                    message=f"Transfer transaction references non-existent destination envelope: {txn.toEnvelopeId}",
                    entityId=txn.id,
                    entityType="transaction",
                    details={
                        "transactionId": txn.id,
                        "missingEnvelopeId": txn.toEnvelopeId,
                        "amount": txn.amount,
                        "type": "transfer_to"
                    }
                ))

    def _check_negative_envelopes(
        self, 
        envelopes: List[Envelope],
        violations: List[IntegrityViolation]
    ) -> None:
        """
        Check for envelopes with negative balances (unless explicitly allowed)
        
        Args:
            envelopes: List of all envelopes
            violations: List to append violations to
        """
        for env in envelopes:
            # Skip if balance is not set or envelope is archived
            if env.currentBalance is None or env.archived:
                continue
                
            # Check for negative balance
            if env.currentBalance < 0:
                # Determine severity based on envelope type
                # Some envelope types like credit cards might allow negative balances
                severity = "warning" if env.envelopeType in ["bill", "variable"] else "error"
                
                violations.append(IntegrityViolation(
                    severity=severity,
                    type="negative_balance",
                    message=f"Envelope has negative balance: {env.name} (${env.currentBalance:.2f})",
                    entityId=env.id,
                    entityType="envelope",
                    details={
                        "envelopeId": env.id,
                        "envelopeName": env.name,
                        "currentBalance": env.currentBalance,
                        "envelopeType": env.envelopeType,
                        "category": env.category
                    }
                ))

    def _check_balance_leakage(
        self, 
        snapshot: AuditSnapshot,
        violations: List[IntegrityViolation]
    ) -> None:
        """
        Check for balance leakage: Sum of envelope balances + unassigned != total account balance
        
        Args:
            snapshot: Complete budget snapshot
            violations: List to append violations to
        """
        # Calculate sum of all envelope balances
        total_envelope_balance = sum(
            env.currentBalance or 0 
            for env in snapshot.envelopes 
            if not env.archived
        )
        
        # Get unassigned cash from metadata
        unassigned_cash = snapshot.metadata.unassignedCash or 0
        
        # Get actual account balance from metadata
        actual_balance = snapshot.metadata.actualBalance
        
        # If actual balance is not set, we can't check for leakage
        if actual_balance is None:
            violations.append(IntegrityViolation(
                severity="warning",
                type="missing_data",
                message="Cannot check balance leakage: actualBalance not set in metadata",
                entityId=snapshot.metadata.id,
                entityType="budget",
                details={
                    "totalEnvelopeBalance": total_envelope_balance,
                    "unassignedCash": unassigned_cash
                }
            ))
            return
        
        # Calculate expected balance
        expected_balance = total_envelope_balance + unassigned_cash
        
        # Check for discrepancy (allow small floating point differences)
        discrepancy = abs(expected_balance - actual_balance)
        # Tolerance for floating point errors (configurable via instance attribute)
        tolerance = getattr(self, "balance_leakage_tolerance", 0.01)
        
        if discrepancy > tolerance:
            violations.append(IntegrityViolation(
                severity="error",
                type="balance_leakage",
                message=f"Balance leakage detected: Expected ${expected_balance:.2f}, but actual is ${actual_balance:.2f} (diff: ${discrepancy:.2f})",
                entityId=snapshot.metadata.id,
                entityType="budget",
                details={
                    "actualBalance": actual_balance,
                    "expectedBalance": expected_balance,
                    "totalEnvelopeBalance": total_envelope_balance,
                    "unassignedCash": unassigned_cash,
                    "discrepancy": discrepancy,
                    "percentageOff": (discrepancy / actual_balance * 100) if actual_balance != 0 else 0
                }
            ))

    def _generate_summary(self, violations: List[IntegrityViolation]) -> Dict:
        """
        Generate summary statistics for violations
        
        Args:
            violations: List of all violations found
            
        Returns:
            Dictionary with counts by severity and type
        """
        summary = {
            "total": len(violations),
            "by_severity": {
                "error": 0,
                "warning": 0,
                "info": 0
            },
            "by_type": {}
        }
        
        for violation in violations:
            # Count by severity
            summary["by_severity"][violation.severity] += 1
            
            # Count by type
            if violation.type not in summary["by_type"]:
                summary["by_type"][violation.type] = 0
            summary["by_type"][violation.type] += 1
        
        return summary
