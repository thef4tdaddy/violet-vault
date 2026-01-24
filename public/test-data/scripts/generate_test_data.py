#!/usr/bin/env python3
"""
Generate Unified v2.0 Test Data for Violet Vault
Consolidated Python version replacing legacy JS scripts.

DESIGN PRINCIPLES:
1. Single Source of Truth: All data generation logic lives here.
2. Unified Model: Everything is an Envelope or a Transaction.
3. Realistic Data: Merchants, amounts, and connections.
4. Smart Date Scaling: All dates are relative to "Now" to prevent stale data.
"""

import json
import os
import random
from datetime import datetime, timedelta
from typing import Any

# --- CONFIGURATION ---

# Paths relative to this script
SCRIPT_DIR: str = os.path.dirname(os.path.abspath(__file__))
DATA_OUT_DIR: str = os.path.join(SCRIPT_DIR, "../data")

OUTPUT_FILES: dict[str, str] = {
    "standard": os.path.join(DATA_OUT_DIR, "violet-vault-budget.json"),
    "autofunding": os.path.join(DATA_OUT_DIR, "violet-vault-budget-autofunding.json"),
    "ofx": os.path.join(DATA_OUT_DIR, "violet-vault-transactions.ofx"),
}

# --- HELPERS ---


def get_timestamp(days_ago: int = 0, seconds_offset: int = 0) -> int:
    dt: datetime = datetime.now() - timedelta(days=days_ago) + timedelta(seconds=seconds_offset)
    return int(dt.timestamp() * 1000)


def get_date_string(days_ago: int = 0) -> str:
    dt: datetime = datetime.now() - timedelta(days=days_ago)
    return dt.strftime("%Y-%m-%d")


def generate_ofx(transactions: list[dict[str, Any]]) -> str:
    """Generate OFX content for bank import testing."""
    dt_server: str = datetime.now().strftime("%Y%m%d%H%M%S")
    dt_start: str = get_date_string(30).replace("-", "") + "000000"
    dt_end: str = get_date_string(0).replace("-", "") + "000000"

    header: str = f"""OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<DTSERVER>{dt_server}
<LANGUAGE>ENG
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>USD
<BANKACCTFROM>
<BANKID>123456789
<ACCTID>987654321
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>{dt_start}
<DTEND>{dt_end}
"""

    txn_items: list[str] = []
    for t in transactions:
        date_str: str = t["date"].replace("-", "") + "120000"
        txn_type: str = "DEBIT" if t["amount"] < 0 else "CREDIT"
        txn_items.append(f"""<STMTTRN>
<TRNTYPE>{txn_type}
<DTPOSTED>{date_str}
<TRNAMT>{t["amount"]}
<FITID>{t["id"]}
<NAME>{t.get("merchant") or t.get("description")}
<MEMO>{t["description"]}
</STMTTRN>""")

    footer: str = f"""</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>5000.00
<DTASOF>{dt_end}
</LEDGERBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>"""

    return header + "\n".join(txn_items) + footer


# --- DATA GENERATION ---


def generate_data() -> dict[str, Any]:
    # 1. Metadata
    actual_balance: float = 24500.75
    unassigned_cash: float = 1850.25

    budget_metadata: list[dict[str, Any]] = [
        {
            "id": "metadata",
            "unassignedCash": unassigned_cash,
            "actualBalance": actual_balance,
            "lastModified": get_timestamp(),
        }
    ]

    # 2. Envelopes
    envelopes: list[dict[str, Any]] = []

    core_configs: list[dict[str, Any]] = [
        {
            "id": "env-groceries",
            "name": "Groceries",
            "category": "Food & Dining",
            "targetAmount": 800,
            "color": "#10b981",
        },
        {
            "id": "env-gas",
            "name": "Gas & Fuel",
            "category": "Transportation",
            "targetAmount": 300,
            "color": "#f59e0b",
        },
        {
            "id": "env-rent",
            "name": "Rent",
            "category": "Housing",
            "targetAmount": 2200,
            "color": "#3b82f6",
            "type": "liability",
        },
        {
            "id": "env-utilities",
            "name": "Utilities",
            "category": "Bills & Utilities",
            "targetAmount": 350,
            "color": "#6366f1",
        },
        {
            "id": "env-entertainment",
            "name": "Fun Money",
            "category": "Entertainment",
            "targetAmount": 400,
            "color": "#ec4899",
        },
        {
            "id": "env-emergency",
            "name": "Emergency Fund",
            "category": "Emergency",
            "targetAmount": 25000,
            "color": "#f43f5e",
        },
    ]

    for env in core_configs:
        # Varied balances: some over, some under
        current_balance: float = 0.0
        if env["id"] == "env-groceries":
            current_balance = 845.50  # Over budget
        elif env["id"] == "env-emergency":
            current_balance = 12500.00  # Halfway
        else:
            target_amount: float = float(env["targetAmount"])
            current_balance = round(random.uniform(0.1, 0.9) * target_amount, 2)

        envelope_type: str = "standard"
        if "env-emergency" in str(env.get("id", "")):
            envelope_type = "standard"  # Emergency is standard but special category
        elif env.get("type"):
            envelope_type = str(env.get("type"))

        envelopes.append(
            {
                **env,
                "type": envelope_type,
                "archived": False,
                "autoAllocate": True,
                "currentBalance": current_balance,
                "monthlyBudget": env["targetAmount"],
                "lastModified": get_timestamp(),
                "createdAt": get_timestamp(365),
                "description": f"Standard {env['name']} envelope",
            }
        )

    # Add special variants
    # Biweekly Needs
    envelopes.append(
        {
            "id": "env-car-insurance",
            "name": "Car Insurance",
            "category": "Bills & Utilities",
            "type": "standard",
            "archived": False,
            "autoAllocate": True,
            "currentBalance": 120.00,
            "biweeklyAllocation": 60.00,
            "monthlyBudget": 120.00,
            "color": "#64748b",
            "description": "Biweekly savings for insurance",
            "lastModified": get_timestamp(),
            "createdAt": get_timestamp(30),
        }
    )

    # Savings Goals
    current_year: int = datetime.now().year
    goals: list[dict[str, Any]] = [
        {
            "id": "goal-wedding",
            "name": "Summer Wedding",
            "target": 15000,
            "current": 7500,
            "date": f"{current_year}-08-15",
            "pri": "high",
        },
        {
            "id": "goal-tesla",
            "name": "New Car Fund",
            "target": 45000,
            "current": 12000,
            "date": f"{current_year + 1}-12-01",
            "pri": "medium",
        },
        {
            "id": "goal-europe",
            "name": "Euro Trip",
            "target": 6000,
            "current": 3200,
            "date": f"{current_year}-10-20",
            "pri": "low",
        },
    ]

    for g in goals:
        target: float = float(g["target"])
        envelopes.append(
            {
                "id": g["id"],
                "name": g["name"],
                "category": "Savings",
                "type": "goal",
                "archived": False,
                "currentBalance": g["current"],
                "targetAmount": target,
                "targetDate": g["date"],
                "priority": g["pri"],
                "isPaused": False,
                "isCompleted": False,
                "monthlyContribution": round(target / 24, 2),
                "color": "#8b5cf6",
                "description": f"Saving for {g['name']}",
                "lastModified": get_timestamp(),
                "createdAt": get_timestamp(180),
            }
        )

    # Supplemental Accounts (Varied types)
    supplementals: list[dict[str, Any]] = [
        {"id": "sa-hsa", "name": "Work HSA", "type": "HSA", "bal": 4250.75, "cont": 4150},
        {
            "id": "sa-transit",
            "name": "Transit Benefit",
            "type": "other",  # SupplementalAccountTypeSchema requires "other" for Transit
            "bal": 125,
            "cont": 1500,
        },
        {
            "id": "sa-fsa",
            "name": "Dependent Care FSA",
            "type": "FSA",
            "bal": 900,
            "cont": 5000,
            "exp": f"{current_year}-12-31",
        },
    ]

    for sa in supplementals:
        envelopes.append(
            {
                "id": sa["id"],
                "name": sa["name"],
                "category": "Supplemental",
                "type": "supplemental",
                "accountType": sa["type"]
                if sa["type"] in ["FSA", "HSA", "529", "IRA", "401K"]
                else "other",
                "archived": False,
                "currentBalance": sa["bal"],
                "annualContribution": sa["cont"],
                "expirationDate": sa.get("exp"),
                "isActive": True,
                "color": "#0d9488",
                "description": sa["name"],
                "lastModified": get_timestamp(),
                "createdAt": get_timestamp(365),
            }
        )

    # Debts
    liabilities: list[dict[str, Any]] = [
        {
            "id": "debt-chase",
            "name": "Chase Sapphire",
            "bal": 1250.40,
            "min": 50,
            "rate": 22.99,
            "due": 18,
        },
        {
            "id": "debt-student",
            "name": "Navient Loan",
            "bal": 18500,
            "min": 225,
            "rate": 5.4,
            "due": 1,
        },
        {
            "id": "debt-mortgage",
            "name": "Home Mortgage",
            "bal": 345000,
            "min": 2150,
            "rate": 3.25,
            "due": 1,
        },
    ]

    for d in liabilities:
        creditor_name: str = str(d["name"]).split(" ")[0]
        envelopes.append(
            {
                "id": d["id"],
                "name": d["name"],
                "category": "Debt",
                "type": "liability",
                "status": "active",
                "archived": False,
                "currentBalance": d["bal"],
                "interestRate": d["rate"],
                "minimumPayment": d["min"],
                "dueDate": d["due"],
                "creditor": creditor_name,
                "color": "#475569",
                "description": d["name"],
                "lastModified": get_timestamp(),
                "createdAt": get_timestamp(730),
            }
        )

    # Bill Envelopes
    bills_config: list[dict[str, Any]] = [
        {"id": "bill-netflix", "name": "Netflix", "amt": 22.99, "due_day": 15},
        {"id": "bill-internet", "name": "Google Fiber", "amt": 70.00, "due_day": 10},
        {"id": "bill-electric", "name": "PG&E", "amt": 185.20, "due_day": 5},
        {"id": "bill-hulu", "name": "Hulu", "amt": 14.99, "due_day": 20},
    ]

    for b in bills_config:
        # Calculate next due date
        now: datetime = datetime.now()
        due_day: int = int(b["due_day"])
        due_date: datetime = datetime(now.year, now.month, due_day)
        if due_date < now:
            # If past this month, move to next month
            if now.month == 12:
                due_date = datetime(now.year + 1, 1, due_day)
            else:
                due_date = datetime(now.year, now.month + 1, due_day)

        envelopes.append(
            {
                "id": b["id"],
                "name": b["name"],
                "category": "Bills & Utilities",
                "type": "bill",
                "archived": False,
                "autoAllocate": True,
                "currentBalance": 0,
                "targetAmount": b["amt"],
                "dueDate": due_date.strftime("%Y-%m-%d"),
                "isPaid": False,
                "isRecurring": True,
                "frequency": "monthly",
                "color": "#475569",
                "description": f"{b['name']} monthly bill",
                "lastModified": get_timestamp(),
                "createdAt": get_timestamp(365),
            }
        )

    # 3. Transactions
    transactions: list[dict[str, Any]] = []
    merchants: dict[str, list[str]] = {
        "groceries": ["Whole Foods", "Trader Joes", "Costco", "Safeway", "Sprouts"],
        "gas": ["Shell", "Chevron", "7-Eleven", "Arco"],
        "entertainment": ["Movie Ticket", "Bowling", "Steam Game", "Audible"],
        "restaurants": ["Starbucks", "Chipotle", "Shake Shack", "Local Pizza", "Thai Place"],
        "shopping": ["Amazon", "Target", "Walmart", "Best Buy"],
        "utilities": ["Verizon", "PG&E", "Comcast"],
    }

    txn_count: int = 1000

    # 4 months history
    for months_ago in range(4):
        month_start_days: int = months_ago * 30

        # Expenses
        for _ in range(15):
            days_ago_txn: int = month_start_days + random.randint(0, 28)
            cat_idx: int = random.randint(0, 4)

            env_id_txn: str = "env-groceries"
            cat_txn: str = "Food & Dining"
            m_list_txn: list[str] = merchants["groceries"]
            desc_txn: str = "Groceries"
            amt_txn: float = random.uniform(40, 150)
            merchant_txn: str = random.choice(m_list_txn)

            if cat_idx == 0:
                pass  # Default
            elif cat_idx == 1:
                env_id_txn, cat_txn, m_list_txn, desc_txn, amt_txn = (
                    "env-gas",
                    "Transportation",
                    merchants["gas"],
                    "Gas",
                    random.uniform(35, 75),
                )
            elif cat_idx == 2:
                env_id_txn, cat_txn, m_list_txn, desc_txn, amt_txn = (
                    "env-entertainment",
                    "Entertainment",
                    merchants["entertainment"],
                    "Fun",
                    random.uniform(10, 45),
                )
            elif cat_idx == 3:
                env_id_txn, cat_txn, m_list_txn, desc_txn, amt_txn = (
                    "env-groceries",
                    "Food & Dining",
                    merchants["restaurants"],
                    "Dinner",
                    random.uniform(25, 80),
                )
            else:
                env_id_txn, cat_txn, m_list_txn, desc_txn, amt_txn = (
                    "env-entertainment",
                    "Shopping",
                    merchants["shopping"],
                    "Shopping",
                    random.uniform(15, 200),
                )

            transactions.append(
                {
                    "id": f"txn-{txn_count}",
                    "date": get_date_string(days_ago_txn),
                    "amount": -round(amt_txn, 2),
                    "envelopeId": env_id_txn,
                    "category": cat_txn,
                    "type": "expense",
                    "lastModified": get_timestamp(days_ago_txn),
                    "createdAt": get_timestamp(days_ago_txn),
                    "description": desc_txn,
                    "merchant": merchant_txn,
                }
            )
            txn_count += 1

        # Paychecks (Realistic allocations for history)
        for day_offset in [1, 15]:
            pd_days: int = month_start_days + day_offset
            pay_amt: float = 3250.00

            # Detailed allocations for the history component
            allocs: dict[str, float] = {
                "env-rent": 1100.00,
                "env-groceries": 400.00,
                "env-gas": 150.00,
                "env-emergency": 500.00,
                "goal-wedding": 250.00,
            }

            total_alloc: float = sum(allocs.values())

            transactions.append(
                {
                    "id": f"pay-{txn_count}",
                    "date": get_date_string(pd_days),
                    "amount": pay_amt,
                    "type": "income",
                    "envelopeId": "unassigned",
                    "category": "Income",
                    "payerName": "Acme Global Tech",
                    "processedBy": "Admin User",
                    "processedAt": get_date_string(
                        pd_days
                    ),  # Matching current component expectation
                    "totalAllocated": total_alloc,
                    "remainingAmount": pay_amt - total_alloc,
                    "allocationMode": "allocate",
                    "allocations": allocs,
                    "description": "Bi-weekly Payroll",
                    "lastModified": get_timestamp(pd_days),
                    "createdAt": get_timestamp(pd_days),
                }
            )
            txn_count += 1

    # Future Scheduled Bills
    for b in bills_config:
        now_f: datetime = datetime.now()
        due_day_f: int = int(b["due_day"])
        due_date_f: datetime = datetime(now_f.year, now_f.month, due_day_f)
        if due_date_f < now_f:
            due_date_f = due_date_f + timedelta(days=30)

        transactions.append(
            {
                "id": f"scheduled-{b['id']}",
                "date": due_date_f.strftime("%Y-%m-%d"),
                "amount": -float(b["amt"]),
                "envelopeId": b["id"],
                "category": "Bills & Utilities",
                "type": "expense",
                "isScheduled": True,
                "description": f"Scheduled: {b['name']}",
                "merchant": b["name"],
                "lastModified": get_timestamp(),
                "createdAt": get_timestamp(),
            }
        )

    transactions.sort(key=lambda x: str(x["date"]), reverse=True)

    return {
        "budget": budget_metadata,
        "envelopes": envelopes,
        "transactions": transactions,
        "import_txns": transactions[:15],
    }


def get_autofunding_rules() -> list[dict[str, Any]]:
    now: str = datetime.now().isoformat()
    return [
        {
            "id": "rule-rent",
            "name": "Rent Priority",
            "description": "Fund rent envelope immediately from income",
            "type": "priority_fill",
            "trigger": "income_detected",
            "priority": 1,
            "enabled": True,
            "createdAt": now,
            "config": {
                "sourceType": "unassigned",
                "targetType": "envelope",
                "targetId": "env-rent",
                "scheduleConfig": {},
            },
            "executionCount": 12,
            "lastExecuted": now,
        }
    ]


def main() -> None:
    print("✨ Overhauling Test Data with Smart Dates & High Realism...")
    data: dict[str, Any] = generate_data()

    standard_budget: dict[str, Any] = {
        "budget": data["budget"],
        "envelopes": data["envelopes"],
        "transactions": data["transactions"],
        "allTransactions": data["transactions"],  # Required for v2.0 ingestion
        "budgetCommits": [],
        "budgetChanges": [],
        "exportMetadata": {
            "appVersion": "2.0.1",
            "budgetId": "vv-production-test-data",
            "exportDate": datetime.now().isoformat(),
            "isV2Schema": True,
            "description": "Overhauled v2.1 Smart Test Data",
        },
    }

    os.makedirs(DATA_OUT_DIR, exist_ok=True)

    with open(OUTPUT_FILES["standard"], "w") as f:
        json.dump(standard_budget, f, indent=2)

    with open(OUTPUT_FILES["autofunding"], "w") as f:
        # Clone and add rules
        af: dict[str, Any] = json.loads(json.dumps(standard_budget))
        af["autoFundingRules"] = get_autofunding_rules()
        json.dump(af, f, indent=2)

    with open(OUTPUT_FILES["ofx"], "w") as f:
        f.write(generate_ofx(data["import_txns"]))

    print("\n✅ Overhaul Complete!")
    print(f"   - Envelopes: {len(data['envelopes'])}")
    print(f"   - Transactions: {len(data['transactions'])}")
    print(
        f"   - Metadata: Actual Balance ${data['budget'][0]['actualBalance']}, Unassigned ${data['budget'][0]['unassignedCash']}"
    )
    print("   - Supplemental: HSA, Transit, FSA included with non-zero balances.")
    print("   - Paychecks: Full history with allocations (Fixed Invalid Date bug).")


if __name__ == "__main__":
    main()
