#!/usr/bin/env python3
"""
Test script for the AutoFunding API endpoint
Can be used to test locally or against deployed API
"""

import json
import sys
from datetime import UTC, datetime
from unittest.mock import patch

import pytest


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


def test_api_locally() -> None:
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
    if not result["success"]:
        print(f"❌ Error: {result.get('error', 'Unknown error')}")
        raise AssertionError(f"Simulation failed: {result.get('error')}")

    return None  # Pytest expects None return on success


def generate_curl_command() -> None:
    """Generate a curl command to test the API"""
    payload = generate_test_payload()
    json_payload = json.dumps(payload, indent=2)

    print("\n📝 Curl command to test deployed API:")
    print("\ncurl -X POST https://YOUR_VERCEL_URL/api/autofunding \\")
    print("  -H 'Content-Type: application/json' \\")
    print("  -d '" + json_payload.replace("'", "'\\''") + "'")
    print("\n")


def test_generate_curl_command() -> None:
    """Test the generate_curl_command function output"""
    with patch("builtins.print") as mock_print:
        generate_curl_command()

        # Verify that print was called with expected content
        assert mock_print.call_count >= 4, "Should print multiple lines"

        # Check that key elements are printed
        call_args = [str(call) for call in mock_print.call_args_list]
        output_text = " ".join(call_args)

        assert "curl" in output_text.lower(), "Should contain curl command"
        assert "POST" in output_text, "Should specify POST method"
        assert "Content-Type" in output_text, "Should include Content-Type header"
        assert "rules" in output_text, "Should include rules in payload"


@pytest.fixture(autouse=True)
def ensure_path_for_imports():
    """Fixture to ensure api module can be imported in tests"""
    added = False
    if "." not in sys.path:
        sys.path.insert(0, ".")
        added = True
    yield
    # Cleanup: remove the path if we added it
    if added and "." in sys.path:
        sys.path.remove(".")


def test_api_locally_error_handling() -> None:
    """Test error handling in test_api_locally when simulation fails"""
    with patch("api.autofunding.simulate_rule_execution") as mock_simulate:
        # Mock a failed simulation
        mock_simulate.return_value = {"success": False, "error": "Test error message"}

        # Should raise AssertionError on failure
        with pytest.raises(AssertionError) as exc_info:
            test_api_locally()

        # Verify the error message contains expected content
        assert "Simulation failed" in str(exc_info.value)
        assert "Test error message" in str(exc_info.value)


def test_component_functions_work() -> None:
    """Test that component functions can be called successfully"""
    # Verify generate_test_payload returns valid data
    payload = generate_test_payload()
    assert payload is not None, "Should generate valid payload"

    # Verify generate_curl_command doesn't crash
    with patch("builtins.print"):
        generate_curl_command()


def test_generate_test_payload() -> None:
    """Test that generate_test_payload creates valid structure"""
    payload = generate_test_payload()

    # Verify structure
    assert "rules" in payload, "Should have rules"
    assert "context" in payload, "Should have context"
    assert isinstance(payload["rules"], list), "Rules should be a list"
    assert len(payload["rules"]) == 2, "Should have 2 test rules"

    # Verify rule structure
    rule1 = payload["rules"][0]
    assert rule1["id"] == "rule1", "First rule should have correct ID"
    assert rule1["type"] == "fixed_amount", "Should have correct type"
    assert rule1["config"]["amount"] == 200.0, "Should have correct amount"

    # Verify context structure
    context = payload["context"]
    assert "data" in context, "Context should have data"
    assert "trigger" in context, "Context should have trigger"
    assert "currentDate" in context, "Context should have currentDate"
    assert context["data"]["unassignedCash"] == 1000.0, "Should have unassigned cash"


if __name__ == "__main__":
    try:
        test_api_locally()  # No return value check needed, it raises assert
        generate_curl_command()
        print("\n✅ All tests passed!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
