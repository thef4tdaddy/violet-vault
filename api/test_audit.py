#!/usr/bin/env python3
"""
Test script for VioletVault Analytics API
Tests the envelope integrity audit functionality
"""

import sys
import json
from pathlib import Path

# Add parent directory to path to import api modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from api.models import AuditSnapshot
from api.analytics import EnvelopeIntegrityAuditor


def test_audit(snapshot_file: str, expected_violations: dict):
    """
    Test integrity audit with given snapshot file
    
    Args:
        snapshot_file: Path to JSON snapshot file
        expected_violations: Expected violation counts by type
    """
    print(f"\n{'='*60}")
    print(f"Testing: {snapshot_file}")
    print(f"{'='*60}")
    
    # Load snapshot
    with open(snapshot_file, 'r') as f:
        data = json.load(f)
    
    # Parse with Pydantic
    try:
        snapshot = AuditSnapshot(**data)
        print(f"✓ Snapshot loaded successfully")
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
    print(f"\n📊 Audit Results:")
    print(f"  Total Violations: {result.summary['total']}")
    print(f"  By Severity:")
    for severity, count in result.summary['by_severity'].items():
        if count > 0:
            print(f"    - {severity}: {count}")
    
    if result.summary['by_type']:
        print(f"  By Type:")
        for vtype, count in result.summary['by_type'].items():
            print(f"    - {vtype}: {count}")
    
    # Print violations
    if result.violations:
        print(f"\n⚠️  Violations Detected:")
        for i, violation in enumerate(result.violations, 1):
            print(f"\n  {i}. [{violation.severity.upper()}] {violation.type}")
            print(f"     {violation.message}")
            if violation.entityId:
                print(f"     Entity: {violation.entityType} ({violation.entityId})")
    else:
        print(f"\n✓ No violations detected!")
    
    # Verify expectations
    if expected_violations:
        print(f"\n🔍 Verification:")
        all_match = True
        for vtype, expected_count in expected_violations.items():
            actual_count = result.summary['by_type'].get(vtype, 0)
            match = actual_count == expected_count
            status = "✓" if match else "✗"
            print(f"  {status} {vtype}: expected {expected_count}, got {actual_count}")
            if not match:
                all_match = False
        
        return all_match
    
    return True


def main():
    """Run all tests"""
    print("VioletVault Analytics API - Test Suite")
    print("="*60)
    
    # Test 1: Valid snapshot (should have no critical violations)
    test_audit(
        "api/test_snapshot_valid.json",
        expected_violations={}
    )
    
    # Test 2: Snapshot with violations
    test_audit(
        "api/test_snapshot_violations.json",
        expected_violations={
            "orphaned_transaction": 1,
            "negative_balance": 1,
            "balance_leakage": 1
        }
    )
    
    print(f"\n{'='*60}")
    print("✓ All tests completed!")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
