"""
Auto-Funding Simulation Core Logic
Port of src/utils/budgeting/autofunding/simulation.ts
Pure functions for simulating rule executions and planning transfers
"""
from typing import List, Dict, Any, Optional
from .models import (
    AutoFundingRule,
    AutoFundingContext,
    PlannedTransfer,
    RuleResult,
    ErrorResult,
    SimulationResult,
    EnvelopeData,
)
from .rules import (
    RULE_TYPES,
    calculate_funding_amount,
    sort_rules_by_priority,
)
from .conditions import should_rule_execute
from .currency import split_amount


def simulate_rule_execution(
    rules: List[AutoFundingRule],
    context: AutoFundingContext
) -> Dict[str, Any]:
    """
    Simulates execution of all applicable rules without making changes
    
    Args:
        rules: List of AutoFunding rules to simulate
        context: Execution context with trigger, envelopes, and cash data
        
    Returns:
        Dictionary with success status and simulation results
    """
    simulation = SimulationResult(
        totalPlanned=0.0,
        rulesExecuted=0,
        plannedTransfers=[],
        ruleResults=[],
        remainingCash=context.data.unassignedCash,
        errors=[],
    )
    
    try:
        # Filter and sort rules by priority
        executable_rules = [
            rule for rule in rules
            if should_rule_execute(rule, context)
        ]
        sorted_rules = sort_rules_by_priority(executable_rules)
        
        available_cash = context.data.unassignedCash
        
        # Simulate each rule execution
        for rule in sorted_rules:
            try:
                rule_result = simulate_single_rule(rule, context, available_cash)
                
                if rule_result.success and rule_result.amount > 0:
                    simulation.ruleResults.append(rule_result)
                    simulation.plannedTransfers.extend(rule_result.plannedTransfers)
                    simulation.totalPlanned += rule_result.amount
                    simulation.rulesExecuted += 1
                    available_cash -= rule_result.amount
                elif not rule_result.success:
                    simulation.ruleResults.append(rule_result)
                    if rule_result.error:
                        simulation.errors.append(
                            ErrorResult(
                                ruleId=rule.id,
                                ruleName=rule.name,
                                error=rule_result.error
                            )
                        )
            except Exception as e:
                error_message = str(e)
                error_result = RuleResult(
                    ruleId=rule.id,
                    ruleName=rule.name,
                    success=False,
                    error=error_message,
                    amount=0.0,
                    plannedTransfers=[],
                )
                simulation.ruleResults.append(error_result)
                simulation.errors.append(
                    ErrorResult(
                        ruleId=rule.id,
                        ruleName=rule.name,
                        error=error_message
                    )
                )
        
        simulation.remainingCash = max(0.0, available_cash)
        
        return {
            "success": True,
            "simulation": simulation,
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "simulation": None,
        }


def simulate_single_rule(
    rule: AutoFundingRule,
    context: AutoFundingContext,
    available_cash: float
) -> RuleResult:
    """
    Simulates execution of a single rule
    
    Args:
        rule: The rule to simulate
        context: Execution context
        available_cash: Available cash for this rule
        
    Returns:
        RuleResult with simulation outcome
    """
    try:
        # Create modified context with available cash
        modified_data = context.data.model_copy(deep=True)
        modified_data.unassignedCash = available_cash
        
        modified_context = AutoFundingContext(
            data=modified_data,
            trigger=context.trigger,
            currentDate=context.currentDate,
        )
        
        # Calculate funding amount considering available cash
        funding_amount = calculate_funding_amount(rule, modified_context)
        
        if funding_amount <= 0:
            error_msg = "No funds available" if available_cash <= 0 else "Amount calculated as zero"
            return RuleResult(
                ruleId=rule.id,
                ruleName=rule.name,
                success=False,
                error=error_msg,
                amount=0.0,
                plannedTransfers=[],
            )
        
        # Plan transfers for this rule
        planned_transfers = plan_rule_transfers(rule, funding_amount)
        
        return RuleResult(
            ruleId=rule.id,
            ruleName=rule.name,
            success=True,
            amount=funding_amount,
            plannedTransfers=planned_transfers,
            targetEnvelopes=[t.toEnvelopeId for t in planned_transfers],
        )
    except Exception as e:
        return RuleResult(
            ruleId=rule.id,
            ruleName=rule.name,
            success=False,
            error=str(e),
            amount=0.0,
            plannedTransfers=[],
        )


def plan_rule_transfers(
    rule: AutoFundingRule,
    total_amount: float
) -> List[PlannedTransfer]:
    """
    Plans transfers for a rule execution
    
    Args:
        rule: The rule to plan transfers for
        total_amount: Total amount to transfer
        
    Returns:
        List of planned transfers
    """
    transfers: List[PlannedTransfer] = []
    
    rule_type = rule.type
    
    if rule_type in [
        RULE_TYPES["FIXED_AMOUNT"],
        RULE_TYPES["PERCENTAGE"],
        RULE_TYPES["CONDITIONAL"],
        RULE_TYPES["PRIORITY_FILL"],
    ]:
        if rule.config.targetId:
            transfers.append(
                PlannedTransfer(
                    fromEnvelopeId="unassigned",
                    toEnvelopeId=rule.config.targetId,
                    amount=total_amount,
                    description=f"Auto-funding: {rule.name}",
                    ruleId=rule.id,
                    ruleName=rule.name,
                )
            )
    elif rule_type == RULE_TYPES["SPLIT_REMAINDER"]:
        if rule.config.targetIds and len(rule.config.targetIds) > 0:
            num_targets = len(rule.config.targetIds)
            # Use currency utility for proper splitting
            amounts = split_amount(total_amount, num_targets)
            
            for index, envelope_id in enumerate(rule.config.targetIds):
                transfers.append(
                    PlannedTransfer(
                        fromEnvelopeId="unassigned",
                        toEnvelopeId=envelope_id,
                        amount=amounts[index],
                        description=f"Auto-funding (split): {rule.name}",
                        ruleId=rule.id,
                        ruleName=rule.name,
                    )
                )
    
    return transfers


def calculate_transfer_impact(
    transfers: List[PlannedTransfer],
    context: AutoFundingContext
) -> Dict[str, Any]:
    """
    Calculates the impact of proposed transfers on envelope balances
    
    Args:
        transfers: List of planned transfers
        context: Execution context with current envelope data
        
    Returns:
        Dictionary with envelope impacts, unassigned change, and total transferred
    """
    envelopes_map: Dict[str, Dict[str, Any]] = {}
    
    # Initialize envelope impact tracking
    for envelope in context.data.envelopes:
        current_balance = envelope.currentBalance or 0.0
        monthly_amount = envelope.monthlyAmount
        
        fill_percentage = 0.0
        if monthly_amount and monthly_amount > 0:
            fill_percentage = (current_balance / monthly_amount) * 100
        
        envelopes_map[envelope.id] = {
            "id": envelope.id,
            "name": envelope.name or envelope.id,
            "currentBalance": current_balance,
            "change": 0.0,
            "newBalance": current_balance,
            "monthlyAmount": monthly_amount,
            "fillPercentage": fill_percentage,
            "newFillPercentage": 0.0,
        }
    
    # Track unassigned cash impact
    total_transferred = sum(t.amount for t in transfers)
    unassigned_change = -total_transferred
    
    # Calculate per-envelope impact
    for transfer in transfers:
        if transfer.toEnvelopeId in envelopes_map:
            envelope_impact = envelopes_map[transfer.toEnvelopeId]
            envelope_impact["change"] += transfer.amount
            envelope_impact["newBalance"] = (
                envelope_impact["currentBalance"] + envelope_impact["change"]
            )
            
            if envelope_impact["monthlyAmount"] and envelope_impact["monthlyAmount"] > 0:
                envelope_impact["newFillPercentage"] = (
                    envelope_impact["newBalance"] / envelope_impact["monthlyAmount"]
                ) * 100
    
    return {
        "envelopes": envelopes_map,
        "unassignedChange": unassigned_change,
        "totalTransferred": total_transferred,
    }
