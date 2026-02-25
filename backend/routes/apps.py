from flask import Blueprint, request, jsonify
from services.graph_service import get_service

apps_bp = Blueprint("apps", __name__)


def _token_from_request() -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


def _apply_filters(apps: list[dict], args: dict) -> list[dict]:
    result = apps

    # Filter by type: registration | enterprise | all
    type_filter = args.get("type", "all")
    if type_filter != "all":
        result = [a for a in result if a.get("type") == type_filter]

    # Filter by risk level
    risk_filter = args.get("risk")
    if risk_filter:
        result = [a for a in result if a.get("riskLevel") == risk_filter]

    # Filter ownerless
    if args.get("ownerless") == "true":
        result = [a for a in result if not a.get("owners")]

    # Filter by credential expiry window (days)
    expiring = args.get("expiring")
    if expiring:
        try:
            window = int(expiring)
            result = [
                a for a in result
                if any(
                    0 <= (c.get("daysUntilExpiry") or 999) <= window
                    for c in a.get("credentials", [])
                )
                or any(
                    (c.get("daysUntilExpiry") or 0) < 0
                    for c in a.get("credentials", [])
                )
            ]
        except ValueError:
            pass

    # Search by name
    search = args.get("search", "").lower()
    if search:
        result = [a for a in result if search in a.get("displayName", "").lower()]

    return result


@apps_bp.route("/apps")
def list_apps():
    svc = get_service(access_token=_token_from_request())
    apps = svc.get_apps()
    filtered = _apply_filters(apps, request.args)
    return jsonify(filtered)


@apps_bp.route("/apps/<app_id>")
def get_app(app_id: str):
    svc = get_service(access_token=_token_from_request())
    app = svc.get_app(app_id)
    if app is None:
        return jsonify({"error": "App not found"}), 404
    return jsonify(app)
