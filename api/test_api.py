#!/usr/bin/env python3
"""
Test script for the AutoFunding API endpoint
Can be used to test locally or against deployed API
"""

import json
import sys
from datetime import UTC, datetime


def generate_test_payload() -> dict:
    """Generate a test payload for the autofunding API"""
    # Use current date for testing instead of hardcoded date
    current_date = datetime.now(UTC).isoformat().replace("+00:00", "Z")

    return {
        "rules": [
            {
                "id": "rule1",
                "name": "Groceries Top-up",
                "description": "Fill groceries envelope",
                "type": "fixed_amount",
                "trigger": "manual",
                "priority": 1,
                "enabled": True,
                "createdAt": "2024-01-01T00:00:00.000Z",
                "lastExecuted": None,
                "executionCount": 0,
                "config": {
                    "sourceType": "unassigned",
                    "sourceId": None,
                    "targetType": "envelope",
                    "targetId": "env1",
                    "targetIds": [],
                    "amount": 200.0,
                    "percentage": 0.0,
                    "conditions": [],
                    "scheduleConfig": {},
                },
            },
            {
                "id": "rule2",
                "name": "Rent Priority Fill",
                "description": "Fill rent to monthly amount",
                "type": "priority_fill",
                "trigger": "manual",
                "priority": 2,
                "enabled": True,
                "createdAt": "2024-01-01T00:00:00.000Z",
                "lastExecuted": None,
                "executionCount": 0,
                "config": {
                    "sourceType": "unassigned",
                    "sourceId": None,
                    "targetType": "envelope",
                    "targetId": "env2",
                    "targetIds": [],
                    "amount": 0.0,
                    "percentage": 0.0,
                    "conditions": [],
                    "scheduleConfig": {},
                },
            },
        ],
        "context": {
            "data": {
                "unassignedCash": 1000.0,
                "newIncomeAmount": 2500.0,
                "envelopes": [
                    {
                        "id": "env1",
                        "name": "Groceries",
                        "currentBalance": 150.0,
                        "monthlyAmount": 400.0,
                    },
                    {
                        "id": "env2",
                        "name": "Rent",
                        "currentBalance": 800.0,
                        "monthlyAmount": 1200.0,
                    },
                ],
            },
            "trigger": "manual",
            "currentDate": current_date,
        },
    }


def test_api_locally() -> bool:
    """Test the API using the local Python modules"""
    print("Testing API locally using Python modules...\n")

    sys.path.insert(0, ".")
    from api.autofunding import AutoFundingRequest, simulate_rule_execution

    payload = generate_test_payload()

    # Validate request
    request = AutoFundingRequest(**payload)

    # Run simulation
    result = simulate_rule_execution(request.rules, request.context)

    print("✅ Request validation passed")
    print(f"✅ Simulation success: {result['success']}")

    if result["success"]:
        sim = result["simulation"]
        print("\n📊 Simulation Results:")
        print(f"   - Rules executed: {sim.rulesExecuted}")
        print(f"   - Total planned: ${sim.totalPlanned:.2f}")
        print(f"   - Remaining cash: ${sim.remainingCash:.2f}")
        print(f"   - Planned transfers: {len(sim.plannedTransfers)}")
        print(f"   - Errors: {len(sim.errors)}")

        if sim.plannedTransfers:
            print("\n💰 Planned Transfers:")
            for transfer in sim.plannedTransfers:
                print(
                    f"   - ${transfer.amount:.2f} to {transfer.toEnvelopeId}: {transfer.description}"
                )
    else:
        print(f"❌ Error: {result.get('error', 'Unknown error')}")

    return bool(result["success"])


def generate_curl_command() -> None:
    """Generate a curl command to test the API"""
    payload = generate_test_payload()
    json_payload = json.dumps(payload, indent=2)

    print("\n📝 Curl command to test deployed API:")
    print("\ncurl -X POST https://YOUR_VERCEL_URL/api/autofunding \\")
    print("  -H 'Content-Type: application/json' \\")
    print("  -d '" + json_payload.replace("'", "'\\''") + "'")
    print("\n")


if __name__ == "__main__":
    try:
        success = test_api_locally()
        generate_curl_command()

        if success:
            print("\n✅ All tests passed!")
            sys.exit(0)
        else:
            print("\n❌ Tests failed!")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
