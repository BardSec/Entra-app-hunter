from flask import Blueprint, request, jsonify
from services.graph_service import get_service

compliance_bp = Blueprint("compliance", __name__)

# Apps meeting ANY of these criteria are surfaced in the compliance view
_EXTERNAL_AUDIENCES = {
    "AzureADMultipleOrgs",
    "AzureADandPersonalMicrosoftAccount",
    "PersonalMicrosoftAccount",
}


def _token_from_request() -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


def _compliance_score(app: dict) -> int:
    """
    Higher score = more review-worthy.
    Used to sort the compliance list.
    """
    score = 0
    risk_points = {"critical": 40, "high": 20, "medium": 5, "low": 0}
    score += risk_points.get(app.get("riskLevel", "low"), 0)
    if not app.get("owners"):
        score += 15
    if app.get("signInAudience") in _EXTERNAL_AUDIENCES:
        score += 10
    if app.get("credentialStatus") in ("expired", "expiring_critical"):
        score += 10
    return score


def _meets_compliance_criteria(app: dict) -> bool:
    if app.get("riskLevel") in ("critical", "high"):
        return True
    if not app.get("owners"):
        return True
    if app.get("signInAudience") in _EXTERNAL_AUDIENCES:
        return True
    return False


@compliance_bp.route("/compliance")
def get_compliance():
    svc = get_service(access_token=_token_from_request())
    apps = svc.get_apps()

    flagged = [a for a in apps if _meets_compliance_criteria(a)]
    flagged.sort(key=_compliance_score, reverse=True)

    for app in flagged:
        app["complianceScore"] = _compliance_score(app)
        app["complianceReasons"] = _build_reasons(app)

    return jsonify({
        "total": len(flagged),
        "apps": flagged,
    })


def _build_reasons(app: dict) -> list[str]:
    reasons: list[str] = []
    if app.get("riskLevel") == "critical":
        reasons.append("Has one or more critical-risk permissions (can modify directory, users, or mail at scale)")
    elif app.get("riskLevel") == "high":
        reasons.append("Has one or more high-risk permissions (broad read access across the organization)")
    if not app.get("owners"):
        reasons.append("No assigned owner — unowned apps are a governance gap and FERPA/COPPA risk")
    if app.get("signInAudience") in _EXTERNAL_AUDIENCES:
        reasons.append("Sign-in audience allows external accounts — may expose student data to non-district users")
    if app.get("credentialStatus") == "expired":
        reasons.append("Has expired credentials — consider whether this app is still actively maintained")
    return reasons
