"""
Credential expiry tracking for app registration secrets and certificates.
"""

from datetime import datetime, timezone
from typing import Literal

ExpiryStatus = Literal["expired", "expiring_critical", "expiring_soon", "expiring", "healthy", "none"]


def _parse_dt(dt_str: str | None) -> datetime | None:
    if not dt_str:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%S+00:00"):
        try:
            dt = datetime.strptime(dt_str, fmt)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def annotate_credential(cred: dict) -> dict:
    """
    Add expiry metadata to a credential dict in-place:
      - daysUntilExpiry : int (negative = already expired)
      - expiryStatus    : ExpiryStatus string
    Returns the mutated dict.
    """
    end_dt = _parse_dt(cred.get("endDateTime"))
    if end_dt is None:
        cred["daysUntilExpiry"] = None
        cred["expiryStatus"] = "none"
        return cred

    now = datetime.now(timezone.utc)
    delta = end_dt - now
    days = int(delta.total_seconds() / 86400)
    cred["daysUntilExpiry"] = days

    if days < 0:
        cred["expiryStatus"] = "expired"
    elif days < 30:
        cred["expiryStatus"] = "expiring_critical"
    elif days < 60:
        cred["expiryStatus"] = "expiring_soon"
    elif days < 90:
        cred["expiryStatus"] = "expiring"
    else:
        cred["expiryStatus"] = "healthy"

    return cred


def annotate_app_credentials(app: dict) -> dict:
    """
    Annotate all credentials on an app and add a summary:
      - credentialStatus : worst-case ExpiryStatus across all credentials
    Returns the mutated dict.
    """
    credentials: list[dict] = app.get("credentials", [])
    for cred in credentials:
        annotate_credential(cred)

    _priority = {
        "expired": 5,
        "expiring_critical": 4,
        "expiring_soon": 3,
        "expiring": 2,
        "healthy": 1,
        "none": 0,
    }

    if not credentials:
        app["credentialStatus"] = "none"
    else:
        worst = max(credentials, key=lambda c: _priority.get(c.get("expiryStatus", "none"), 0))
        app["credentialStatus"] = worst.get("expiryStatus", "none")

    return app
