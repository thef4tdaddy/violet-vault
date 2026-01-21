#!/usr/bin/env python3
"""
Generate Unified v2.0 Test Data for Violet Vault
Consolidated Python version replacing legacy JS scripts.

DESIGN PRINCIPLES:
1. Single Source of Truth: All data generation logic lives here.
2. Unified Model: Everything is an Envelope or a Transaction.
3. Realistic Data: Merchants, amounts, and connections.
4. Future-Proof: Includes v2.0 specific fields (allocations, scheduled flags, recurrence).
"""

import json
import os
import random
import uuid
import time
from datetime import datetime, timedelta

# --- CONFIGURATION ---

# Paths relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_OUT_DIR = os.path.join(SCRIPT_DIR, "../data")

OUTPUT_FILES = {
    "standard": os.path.join(DATA_OUT_DIR, "violet-vault-budget.json"),
    "autofunding": os.path.join(DATA_OUT_DIR, "violet-vault-budget-autofunding.json"),
    "ofx": os.path.join(DATA_OUT_DIR, "violet-vault-transactions.ofx")
}

# --- HELPERS ---

def get_timestamp(days_ago=0):
    dt = datetime.now() - timedelta(days=days_ago)
    return int(dt.timestamp() * 1000)

def get_date_string(days_ago=0):
    dt = datetime.now() - timedelta(days=days_ago)
    return dt.strftime("%Y-%m-%d")

def generate_ofx(transactions):
    """Generate OFX content for bank import testing."""
    dt_server = datetime.now().strftime("%Y%m%d%H%M%S")
    dt_start = get_date_string(30).replace("-", "") + "000000"
    dt_end = get_date_string(0).replace("-", "") + "000000"
    
    header = f"""OFXHEADER:100
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
    
    txn_items = []
    for t in transactions:
        date_str = t['date'].replace("-", "") + "120000"
        txn_type = "DEBIT" if t['amount'] < 0 else "CREDIT"
        txn_items.append(f"""<STMTTRN>
<TRNTYPE>{txn_type}
<DTPOSTED>{date_str}
<TRNAMT>{t['amount']}
<FITID>{t['id']}
<NAME>{t.get('merchant') or t.get('description')}
<MEMO>{t['description']}
</STMTTRN>""")

    footer = f"""</BANKTRANLIST>
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

def generate_data():
    # 1. Metadata
    budget_metadata = [{
        "id": "metadata",
        "unassignedCash": 1250.5,
        "actualBalance": 15750.5,
        "lastModified": get_timestamp(),
    }]

    # 2. Envelopes
    envelopes = []
    
    core_configs = [
        {"id": "env-groceries", "name": "Groceries", "category": "Food & Dining", "targetAmount": 600, "color": "#10b981"},
        {"id": "env-gas", "name": "Gas & Fuel", "category": "Transportation", "targetAmount": 300, "color": "#f59e0b"},
        {"id": "env-rent", "name": "Rent", "category": "Housing", "targetAmount": 1800, "color": "#3b82f6", "type": "liability"},
        {"id": "env-utilities", "name": "Utilities", "category": "Bills & Utilities", "targetAmount": 250, "color": "#6366f1"},
        {"id": "env-entertainment", "name": "Fun Money", "category": "Entertainment", "targetAmount": 200, "color": "#ec4899"},
        {"id": "env-emergency", "name": "Emergency Fund", "category": "Emergency", "targetAmount": 10000, "color": "#f43f5e"},
    ]

    for idx, env in enumerate(core_configs):
        variance = 0.8
        if idx == 0: variance = 1.2 # Over budget groceries
        if idx == 4: variance = 0.1 # Mostly empty fun money
        
        current_balance = int(random.random() * env['targetAmount'] * variance)
        
        envelopes.append({
            **env,
            "type": env.get("type", "standard"),
            "archived": False,
            "autoAllocate": True,
            "currentBalance": current_balance,
            "monthlyBudget": env['targetAmount'],
            "lastModified": get_timestamp(),
            "createdAt": get_timestamp(365),
            "description": f"Standard {env['name']} envelope",
        })

    # Add special variants
    envelopes.append({
        "id": "env-over-budget",
        "name": "Excessive Spending",
        "category": "Shopping",
        "type": "standard",
        "archived": False,
        "autoAllocate": True,
        "currentBalance": 50,
        "monthlyBudget": 100,
        "color": "#ef4444",
        "description": "Envelope with unrealistic percentage (> 100%)",
        "lastModified": get_timestamp(),
        "createdAt": get_timestamp(10),
    })

    envelopes.append({
        "id": "env-biweekly-need-demo",
        "name": "Biweekly Savings",
        "category": "Savings",
        "type": "standard",
        "archived": False,
        "autoAllocate": True,
        "currentBalance": 250,
        "biweeklyAllocation": 125,
        "monthlyBudget": 270,
        "color": "#8b5cf6",
        "description": "Has biweekly need but 0 bills due",
        "lastModified": get_timestamp(),
        "createdAt": get_timestamp(30),
    })

    # Savings Goals
    goals = [
        {"id": "goal-wedding", "name": "Summer Wedding", "target": 15000, "current": 4500, "date": "2026-08-15", "pri": "high"},
        {"id": "goal-tesla", "name": "Tesla Model 3", "target": 45000, "current": 8000, "date": "2027-12-01", "pri": "medium"},
        {"id": "goal-europe", "name": "Euro Trip 2026", "target": 5000, "current": 1200, "date": "2026-06-01", "pri": "low"},
    ]

    for g in goals:
        envelopes.append({
            "id": g['id'],
            "name": g['name'],
            "category": "Savings",
            "type": "goal",
            "archived": False,
            "currentBalance": g['current'],
            "targetAmount": g['target'],
            "targetDate": g['date'],
            "priority": g['pri'],
            "isPaused": False,
            "isCompleted": False,
            "monthlyContribution": int(g['target'] / 24),
            "color": "#8b5cf6",
            "description": f"Saving for {g['name']}",
            "lastModified": get_timestamp(),
            "createdAt": get_timestamp(180),
        })

    # Supplemental Accounts
    supplementals = [
        {"id": "sa-hsa", "name": "HSA Savings", "type": "HSA", "bal": 3450, "cont": 3850},
        {"id": "sa-fsa", "name": "FSA (Use it/Lose it)", "type": "FSA", "bal": 850, "cont": 3050, "exp": "2026-12-31"},
    ]

    for sa in supplementals:
        envelopes.append({
            "id": sa['id'],
            "name": sa['name'],
            "category": "Supplemental",
            "type": "supplemental",
            "accountType": sa['type'],
            "archived": False,
            "currentBalance": sa['bal'],
            "annualContribution": sa['cont'],
            "expirationDate": sa.get('exp'),
            "isActive": True,
            "color": "#0d9488",
            "description": sa['name'],
            "lastModified": get_timestamp(),
            "createdAt": get_timestamp(365),
        })

    # Debts
    liabilities = [
        {"id": "debt-chase", "name": "Chase Freedom", "bal": 2450, "min": 85, "rate": 18.99, "due": 15},
        {"id": "debt-student", "name": "Great Lakes Loan", "bal": 12500, "min": 150, "rate": 4.5, "due": 1},
        {"id": "debt-auto", "name": "Ally Car Loan", "bal": 18400, "min": 425, "rate": 5.2, "due": 22},
    ]

    for d in liabilities:
        envelopes.append({
            "id": d['id'],
            "name": d['name'],
            "category": "Debt",
            "type": "liability",
            "status": "active",
            "archived": False,
            "currentBalance": d['bal'],
            "interestRate": d['rate'],
            "minimumPayment": d['min'],
            "dueDate": d['due'],
            "creditor": d['name'].split(" ")[0],
            "color": "#475569",
            "description": d['name'],
            "lastModified": get_timestamp(),
            "createdAt": get_timestamp(365),
        })

    # Bill Envelopes
    bills_config = [
        {"id": "bill-netflix", "name": "Netflix", "amt": 19.99, "due_offset": 15},
        {"id": "bill-internet", "name": "Comcast Xfinity", "amt": 89.99, "due_offset": 10},
        {"id": "bill-electric", "name": "General Electric", "amt": 125.50, "due_offset": 5},
        {"id": "bill-water", "name": "City Water", "amt": 45.00, "due_offset": 25},
        {"id": "bill-trash", "name": "Waste Management", "amt": 30.00, "due_offset": 28},
        {"id": "bill-insurance", "name": "Geico Insurance", "amt": 120.00, "due_offset": -2},
    ]

    for b in bills_config:
        due_date = get_date_string(-b['due_offset']) # Negative offset for future
        envelopes.append({
            "id": b['id'],
            "name": b['name'],
            "category": "Bills & Utilities",
            "type": "bill",
            "archived": False,
            "autoAllocate": True,
            "currentBalance": 0,
            "targetAmount": b['amt'],
            "dueDate": due_date,
            "isPaid": False,
            "isRecurring": True,
            "frequency": "monthly",
            "color": "#475569",
            "description": f"{b['name']} monthly bill",
            "lastModified": get_timestamp(),
            "createdAt": get_timestamp(365),
        })

    # 3. Transactions
    transactions = []
    merchants = {
        "groceries": ["Whole Foods", "Trader Joes", "Costco", "Kroger", "Aldi", "Publix", "Safeway", "H-E-B", "Wegmans", "Lidl"],
        "gas": ["Shell", "Chevron", "BP", "Exxon", "7-Eleven", "Arco", "Circle K", "Valero", "Wawa", "QuikTrip"],
        "entertainment": ["Netflix", "Spotify", "Steam", "AMC Theaters", "Disney+", "Hulu", "Apple", "Nintendo", "PlayStation", "Xbox", "Audible"],
        "restaurants": ["Starbucks", "Chipotle", "McDonalds", "Subway", "Sweetgreen", "Shake Shack", "Olive Garden", "Panera Bread", "Taco Bell", "Chick-fil-A"],
        "shopping": ["Amazon", "Target", "Walmart", "Best Buy", "Home Depot", "Lowes", "TJ Maxx", "Marshalls"],
        "utilities": ["Verizon", "AT&T", "T-Mobile", "Comcast", "Spectrum", "ConEd", "PG&E", "Duke Energy"]
    }

    txn_count = 1000
    
    # 6 months history
    for months_ago in range(6):
        month_start = months_ago * 30
        
        # 25 Random expenses
        for i in range(25):
            days_ago = month_start + random.randint(0, 27)
            cat_type = i % 5
            
            env_id = "env-groceries"
            category = "Food & Dining"
            merchant_list = merchants["groceries"]
            desc = "Grocery shopping"
            amount = random.uniform(20, 100)
            
            if cat_type == 1:
                env_id = "env-gas"
                category = "Transportation"
                merchant_list = merchants["gas"]
                desc = "Fuel"
                amount = random.uniform(30, 80)
            elif cat_type == 2:
                env_id = "env-entertainment"
                category = "Entertainment"
                merchant_list = merchants["entertainment"]
                desc = "Subscription/Entertainment"
                amount = random.uniform(5, 35)
            elif cat_type == 3:
                env_id = "env-groceries"
                category = "Food & Dining"
                merchant_list = merchants["restaurants"]
                desc = "Dining Out"
                amount = random.uniform(10, 50)
            elif cat_type == 4:
                env_id = "env-over-budget"
                category = "Shopping"
                merchant_list = merchants["shopping"]
                desc = "Retail Purchase"
                amount = random.uniform(10, 160)

            transactions.append({
                "id": f"txn-{txn_count}",
                "date": get_date_string(days_ago),
                "amount": -round(amount, 2),
                "envelopeId": env_id,
                "category": category,
                "type": "expense",
                "lastModified": get_timestamp(days_ago),
                "createdAt": get_timestamp(days_ago),
                "description": desc,
                "merchant": random.choice(merchant_list)
            })
            txn_count += 1

        # Big Payments
        for day_offset, (env_id, merchant, amount) in zip([2, 5, 10], [
            ("env-rent", "Rent Management", 1800),
            ("bill-electric", "General Electric", 125.5),
            ("bill-internet", "Comcast Xfinity", 89.99)
        ]):
            days_ago = month_start + day_offset
            transactions.append({
                "id": f"txn-{txn_count}",
                "date": get_date_string(days_ago),
                "amount": -amount,
                "envelopeId": env_id,
                "category": "Housing" if "rent" in env_id else "Bills & Utilities",
                "type": "expense",
                "isScheduled": True,
                "lastModified": get_timestamp(days_ago),
                "createdAt": get_timestamp(days_ago),
                "description": f"Monthly payment: {merchant}",
                "merchant": merchant
            })
            txn_count += 1

        # Paychecks
        for day_offset in [3, 17]:
            days_ago = month_start + day_offset
            transactions.append({
                "id": f"txn-pay-{txn_count}",
                "date": get_date_string(days_ago),
                "amount": 2500.0,
                "envelopeId": "unassigned",
                "category": "Income",
                "type": "income",
                "lastModified": get_timestamp(days_ago),
                "createdAt": get_timestamp(days_ago),
                "description": "Biweekly Paycheck",
                "merchant": "Acme Corp",
                "allocations": {"env-rent": 900, "env-groceries": 300, "env-gas": 150}
            })
            txn_count += 1

    # Recent feeling
    for days_ago in range(3):
        transactions.append({
            "id": f"txn-recent-{days_ago}",
            "date": get_date_string(days_ago),
            "amount": -round(random.uniform(5, 30), 2),
            "envelopeId": "env-groceries",
            "category": "Food & Dining",
            "type": "expense",
            "lastModified": get_timestamp(days_ago),
            "createdAt": get_timestamp(days_ago),
            "description": "Recent Coffee/Snack",
            "merchant": random.choice(merchants["restaurants"])
        })

    # Scheduled Bills (Future)
    for idx, b in enumerate(bills_config):
        due_date = datetime.now() + timedelta(days=b['due_offset'])
        transactions.append({
            "id": f"scheduled-bill-{idx}",
            "date": due_date.strftime("%Y-%m-%d"),
            "amount": -abs(b['amt']),
            "envelopeId": b['id'],
            "category": "Bills & Utilities",
            "type": "expense",
            "isScheduled": True,
            "recurrenceRule": "FREQ=MONTHLY",
            "description": f"{b['name']} - Monthly Bill",
            "merchant": b['name'],
            "lastModified": get_timestamp(),
            "createdAt": get_timestamp(),
            "notes": f"Recurring bill for {b['name']}"
        })

    # Sort final list
    transactions.sort(key=lambda x: x['date'], reverse=True)
    
    # Split for OFX
    import_txns = transactions[:20]
    budget_txns = transactions[20:]

    return {
        "budget": budget_metadata,
        "envelopes": envelopes,
        "transactions": budget_txns,
        "import_txns": import_txns
    }

def get_autofunding_rules():
    """Define the advanced auto-funding rules."""
    now = datetime.now().isoformat()
    return [
        {
            "id": "rule-rent-priority",
            "name": "Prioritize Rent",
            "description": "Ensure rent is covered first",
            "type": "priority_fill",
            "trigger": "income_detected",
            "priority": 10,
            "enabled": True,
            "createdAt": now,
            "config": {"sourceType": "unassigned", "targetType": "envelope", "targetId": "env-rent", "scheduleConfig": {}},
            "executionCount": 5, "lastExecuted": now
        },
        {
            "id": "rule-savings-tithe",
            "name": "Save 10%",
            "description": "Allocate 10% of income to General Savings",
            "type": "percentage",
            "trigger": "income_detected",
            "priority": 20,
            "enabled": True,
            "createdAt": now,
            "config": {"sourceType": "income", "targetType": "envelope", "targetId": "env-emergency", "percentage": 10, "scheduleConfig": {}},
            "executionCount": 5, "lastExecuted": now
        },
        {
            "id": "rule-gas-fixed",
            "name": "Gas Stipend",
            "description": "Add $50 to Gas envelope per paycheck",
            "type": "fixed_amount",
            "trigger": "income_detected",
            "priority": 30,
            "enabled": True,
            "createdAt": now,
            "config": {"sourceType": "unassigned", "targetType": "envelope", "targetId": "env-gas", "amount": 50, "scheduleConfig": {}},
            "executionCount": 5, "lastExecuted": now
        },
        {
            "id": "rule-emergency-overflow",
            "name": "Emergency Overflow",
            "description": "If Unassigned Cash > $2000, move surplus to Emergency Fund",
            "type": "conditional",
            "trigger": "manual",
            "priority": 90,
            "enabled": True,
            "createdAt": now,
            "config": {
                "sourceType": "unassigned", "targetType": "envelope", "targetId": "env-emergency", "amount": 500,
                "conditions": [{"field": "unassigned_cash", "operator": "gt", "value": 2000}],
                "scheduleConfig": {}
            },
            "executionCount": 1, "lastExecuted": now
        },
        {
            "id": "rule-split-fun-travel",
            "name": "Split Leftovers",
            "description": "Split remaining unassigned cash between Fun and Travel",
            "type": "split_remainder",
            "trigger": "manual",
            "priority": 100,
            "enabled": False,
            "createdAt": now,
            "config": {"sourceType": "unassigned", "targetType": "multiple", "targetIds": ["env-entertainment", "env-groceries"], "scheduleConfig": {}},
            "executionCount": 0, "lastExecuted": None
        }
    ]

def main():
    print("🚀 Generating Unified v2.0 Test Data...")
    
    # 1. Generate base components
    data = generate_data()
    
    # 2. Build Standard Budget
    standard_budget = {
        "budget": data["budget"],
        "envelopes": data["envelopes"],
        "transactions": data["transactions"],
        "budgetCommits": [], # Placeholder for v2 control
        "budgetChanges": [],
        "exportMetadata": {
            "appVersion": "2.0.0-beta.16",
            "budgetId": "violet-vault-viable-v2",
            "exportDate": datetime.now().isoformat(),
            "isV2Schema": True,
            "description": "Complete v2.0 Unified Test Data (Standard)"
        }
    }
    
    # 3. Build Auto-Funding Budget
    autofunding_budget = json.loads(json.dumps(standard_budget)) # Deep copy
    autofunding_budget["autoFundingRules"] = get_autofunding_rules()
    autofunding_budget["exportMetadata"]["description"] = "Complete v2.0 Budget with Auto-Funding Rules"

    # 4. Ensure directory exists
    os.makedirs(DATA_OUT_DIR, exist_ok=True)

    # 5. Write outputs
    with open(OUTPUT_FILES["standard"], "w") as f:
        json.dump(standard_budget, f, indent=2)
    
    with open(OUTPUT_FILES["autofunding"], "w") as f:
        json.dump(autofunding_budget, f, indent=2)
        
    with open(OUTPUT_FILES["ofx"], "w") as f:
        f.write(generate_ofx(data["import_txns"]))

    print(f"\n✅ Data Generation Complete!")
    print(f"   - Envelopes: {len(data['envelopes'])}")
    print(f"   - Transactions: {len(data['transactions'])} historical + {len(data['import_txns'])} importable")
    print(f"   - Standard Budget: {OUTPUT_FILES['standard']}")
    print(f"   - Enhanced Budget: {OUTPUT_FILES['autofunding']}")
    print(f"   - OFX File: {OUTPUT_FILES['ofx']}\n")

if __name__ == "__main__":
    main()
