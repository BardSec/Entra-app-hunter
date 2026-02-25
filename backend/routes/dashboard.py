from flask import Blueprint, request, jsonify
from services.graph_service import get_service

dashboard_bp = Blueprint("dashboard", __name__)


def _token_from_request() -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


@dashboard_bp.route("/dashboard")
def get_dashboard():
    svc = get_service(access_token=_token_from_request())
    tenant = svc.get_tenant()
    apps = svc.get_apps()

    total = len(apps)
    by_risk = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    ownerless_count = 0
    expiring_30 = 0
    expiring_60 = 0
    expiring_90 = 0
    expired_count = 0
    by_type = {"registration": 0, "enterprise": 0}

    for app in apps:
        risk = app.get("riskLevel", "low")
        by_risk[risk] = by_risk.get(risk, 0) + 1

        if not app.get("owners"):
            ownerless_count += 1

        if app.get("type") in by_type:
            by_type[app["type"]] += 1

        for cred in app.get("credentials", []):
            status = cred.get("expiryStatus")
            days = cred.get("daysUntilExpiry")
            if status == "expired":
                expired_count += 1
            elif days is not None:
                if days <= 30:
                    expiring_30 += 1
                elif days <= 60:
                    expiring_60 += 1
                elif days <= 90:
                    expiring_90 += 1

    # Top 5 riskiest apps (for recent alerts)
    risk_order = {"critical": 4, "high": 3, "medium": 2, "low": 1}
    top_risk = sorted(apps, key=lambda a: risk_order.get(a.get("riskLevel", "low"), 0), reverse=True)[:5]
    recent_alerts = [
        {
            "id": a["id"],
            "displayName": a["displayName"],
            "riskLevel": a.get("riskLevel"),
            "riskFlags": a.get("riskFlags", []),
            "credentialStatus": a.get("credentialStatus"),
        }
        for a in top_risk
    ]

    return jsonify({
        "tenant": tenant,
        "summary": {
            "totalApps": total,
            "byRisk": by_risk,
            "byType": by_type,
            "ownerlessApps": ownerless_count,
            "expiredCredentials": expired_count,
            "credentialsExpiring30": expiring_30,
            "credentialsExpiring60": expiring_60,
            "credentialsExpiring90": expiring_90,
        },
        "recentAlerts": recent_alerts,
    })
