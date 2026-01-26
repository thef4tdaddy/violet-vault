#!/usr/bin/env python3
"""
Test script for VioletVault Analytics API
Tests the envelope integrity audit functionality
"""

import json
import sys
from pathlib import Path

# Add parent directory to path to import api modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from api.analytics import EnvelopeIntegrityAuditor  # noqa: E402
from api.models import AuditSnapshot  # noqa: E402


def run_audit_check(snapshot_file: str, expected_violations: dict) -> bool:
    """
    Test integrity audit with given snapshot file

    Args:
        snapshot_file: Path to JSON snapshot file
        expected_violations: Expected violation counts by type
    """
    print(f"\n{'=' * 60}")
    print(f"Testing: {snapshot_file}")
    print(f"{'=' * 60}")

    # Load snapshot relative to this test file
    base_path = Path(__file__).parent
    file_path = (
        base_path / snapshot_file if not Path(snapshot_file).is_absolute() else Path(snapshot_file)
    )

    # Handle case where file specified is relative to api root but we are in api/
    if not file_path.exists() and (base_path / "test_data" / Path(snapshot_file).name).exists():
        file_path = base_path / "test_data" / Path(snapshot_file).name

    # Fallback for direct execution vs pytest execution
    if not file_path.exists():
        # Try relative to repo root
        repo_root = base_path.parent
        file_path = repo_root / snapshot_file

    with open(file_path) as f:
        data = json.load(f)

    # Parse with Pydantic
    try:
        snapshot = AuditSnapshot(**data)
        print("✓ Snapshot loaded successfully")
        print(f"  - Envelopes: {len(snapshot.envelopes)}")
        print(f"  - Transactions: {len(snapshot.transactions)}")
        print(f"  - Metadata ID: {snapshot.metadata.id}")
    except Exception as e:
        print(f"✗ Failed to load snapshot: {e}")
        return False

    # Run audit
    auditor = EnvelopeIntegrityAuditor()
    result = auditor.audit(snapshot)

    # Print results
    print("\n📊 Audit Results:")
    print(f"  Total Violations: {result.summary['total']}")
    print("  By Severity:")
    for severity, count in result.summary["by_severity"].items():
        if count > 0:
            print(f"    - {severity}: {count}")

    if result.summary["by_type"]:
        print("  By Type:")
        for vtype, count in result.summary["by_type"].items():
            print(f"    - {vtype}: {count}")

    # Print violations
    if result.violations:
        print("\n⚠️  Violations Detected:")
        for i, violation in enumerate(result.violations, 1):
            print(f"\n  {i}. [{violation.severity.upper()}] {violation.type}")
            print(f"     {violation.message}")
            if violation.entityId:
                print(f"     Entity: {violation.entityType} ({violation.entityId})")
    else:
        print("\n✓ No violations detected!")

    # Verify expectations
    if expected_violations:
        print("\n🔍 Verification:")
        all_match = True
        for vtype, expected_count in expected_violations.items():
            actual_count = result.summary["by_type"].get(vtype, 0)
            match = actual_count == expected_count
            status = "✓" if match else "✗"
            print(f"  {status} {vtype}: expected {expected_count}, got {actual_count}")
            if not match:
                all_match = False

        return all_match

    return True


def test_valid_snapshot() -> None:
    """Test 1: Valid snapshot (should have no critical violations)"""
    success = run_audit_check("test_snapshot_valid.json", expected_violations={})
    assert success, "Valid snapshot audit failed"


def test_violations_snapshot() -> None:
    """Test 2: Snapshot with violations"""
    success = run_audit_check(
        "test_snapshot_violations.json",
        expected_violations={
            "orphaned_transaction": 1,
            "negative_balance": 1,
            "balance_leakage": 1,
        },
    )
    assert success, "Violations snapshot audit failed"


if __name__ == "__main__":
    # For manual execution
    try:
        test_valid_snapshot()
        test_violations_snapshot()
        print("\n✓ All tests completed (Manual Run)!")
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
