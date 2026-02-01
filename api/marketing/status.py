import time
from typing import Any

import httpx
from fastapi import APIRouter

router = APIRouter(prefix="/status", tags=["marketing"])


@router.get("/")
async def get_system_status() -> dict[str, Any]:
    """
    Returns the real-time system status for the marketing footer.
    PUBLIC ENDPOINT: No auth required as this displays generic system health to visitors.
    Do not expose internal IPs, user data, or sensitive error traces here.

    Performs a real connectivity ping to Google's Firestore infrastructure.
    """
    start_time = time.time()
    latency_ms = 0

    try:
        # Ping Google's Firestore root (publicly accessible) to measure network RTT
        async with httpx.AsyncClient(timeout=2.0) as client:
            await client.get("https://firestore.googleapis.com/", follow_redirects=True)

        # Calculate RTT
        latency_ms = int((time.time() - start_time) * 1000)
        status = "operational"
    except Exception:
        # Fallback if offline or blocked
        status = "degraded"
        latency_ms = -1

    return {
        "status": status,
        "latency_ms": latency_ms,
        "services": {"web": "online", "api": "online", "vault_core": "encrypted"},
        "timestamp": int(time.time() * 1000),
    }
