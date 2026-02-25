"""
Graph service — wraps Microsoft Graph API calls (real tenant) OR returns
mock data depending on MOCK_MODE config.

In AUTH_MODE=app   : acquires a client-credentials token via MSAL.
In AUTH_MODE=delegated : expects the caller to pass an access_token obtained
                         from the frontend (MSAL.js).
"""

import requests
from config import Config
from data.mock_data import get_mock_apps, MOCK_TENANT
from services.risk_analyzer import annotate_app
from services.credential_tracker import annotate_app_credentials


def _enrich(apps: list[dict]) -> list[dict]:
    """Apply risk and credential annotations to a list of apps."""
    for app in apps:
        annotate_app(app)
        annotate_app_credentials(app)
    return apps


# ── Mock mode ─────────────────────────────────────────────────────────────────

class MockGraphService:
    def get_tenant(self) -> dict:
        return MOCK_TENANT

    def get_apps(self) -> list[dict]:
        return _enrich(get_mock_apps())

    def get_app(self, app_id: str) -> dict | None:
        apps = self.get_apps()
        return next((a for a in apps if a["id"] == app_id), None)


# ── Real Graph API mode ───────────────────────────────────────────────────────

class RealGraphService:
    """
    Wraps Microsoft Graph API calls using either app-only or delegated tokens.
    """

    def __init__(self, access_token: str | None = None):
        self._token = access_token or self._acquire_app_token()

    def _acquire_app_token(self) -> str:
        """Acquire an app-only token using the client credentials flow."""
        import msal  # deferred import so mock mode doesn't require msal install
        app = msal.ConfidentialClientApplication(
            Config.CLIENT_ID,
            authority=Config.GRAPH_AUTHORITY,
            client_credential=Config.CLIENT_SECRET,
        )
        result = app.acquire_token_for_client(scopes=Config.GRAPH_SCOPES)
        if "access_token" not in result:
            raise RuntimeError(
                f"Failed to acquire access token: {result.get('error_description', result)}"
            )
        return result["access_token"]

    def _get(self, path: str, params: dict | None = None) -> dict:
        url = f"{Config.GRAPH_API_BASE}{path}"
        headers = {"Authorization": f"Bearer {self._token}"}
        resp = requests.get(url, headers=headers, params=params, timeout=30)
        resp.raise_for_status()
        return resp.json()

    def _get_all(self, path: str, params: dict | None = None) -> list[dict]:
        """Follow @odata.nextLink pagination and return all items."""
        items: list[dict] = []
        url: str | None = f"{Config.GRAPH_API_BASE}{path}"
        headers = {"Authorization": f"Bearer {self._token}"}
        _params = params or {}
        while url:
            resp = requests.get(url, headers=headers, params=_params, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            items.extend(data.get("value", []))
            url = data.get("@odata.nextLink")
            _params = {}  # nextLink already contains params
        return items

    def get_tenant(self) -> dict:
        org = self._get("/organization")
        orgs = org.get("value", [{}])
        tenant = orgs[0] if orgs else {}
        return {
            "id": tenant.get("id", ""),
            "displayName": tenant.get("displayName", ""),
            "verifiedDomain": next(
                (d["name"] for d in tenant.get("verifiedDomains", []) if d.get("isDefault")),
                "",
            ),
        }

    def _resolve_permission_name(self, resource_app_id: str, perm_id: str) -> tuple[str, str]:
        """
        Return (name, description) for a Graph permission ID.
        Falls back to the raw ID if lookup fails.
        """
        try:
            sp_data = self._get_all(
                "/servicePrincipals",
                {"$filter": f"appId eq '{resource_app_id}'", "$select": "appRoles,oauth2PermissionScopes"},
            )
            if not sp_data:
                return perm_id, ""
            sp = sp_data[0]
            for role in sp.get("appRoles", []):
                if role.get("id") == perm_id:
                    return role.get("value", perm_id), role.get("description", "")
            for scope in sp.get("oauth2PermissionScopes", []):
                if scope.get("id") == perm_id:
                    return scope.get("value", perm_id), scope.get("adminConsentDescription", "")
        except Exception:
            pass
        return perm_id, ""

    def _build_permissions(self, raw_access: list[dict]) -> list[dict]:
        """Convert requiredResourceAccess entries to enriched permission dicts."""
        permissions: list[dict] = []
        for resource in raw_access:
            resource_app_id = resource.get("resourceAppId", "")
            for entry in resource.get("resourceAccess", []):
                perm_id = entry.get("id", "")
                perm_type_raw = entry.get("type", "")
                perm_type = "Application" if perm_type_raw == "Role" else "Delegated"
                name, description = self._resolve_permission_name(resource_app_id, perm_id)
                permissions.append({
                    "name": name,
                    "type": perm_type,
                    "description": description,
                    "resource": "Microsoft Graph",
                    "riskLevel": "low",  # will be set by annotate_app
                })
        return permissions

    def _build_owners(self, raw_owners: list[dict]) -> list[dict]:
        return [
            {
                "id": o.get("id", ""),
                "displayName": o.get("displayName", ""),
                "userPrincipalName": o.get("userPrincipalName", ""),
                "jobTitle": o.get("jobTitle", ""),
            }
            for o in raw_owners
        ]

    def _build_credentials(self, password_creds: list[dict], key_creds: list[dict]) -> list[dict]:
        creds: list[dict] = []
        for pc in password_creds:
            creds.append({
                "id": pc.get("keyId", ""),
                "type": "secret",
                "displayName": pc.get("displayName", "Client Secret"),
                "startDateTime": pc.get("startDateTime"),
                "endDateTime": pc.get("endDateTime"),
            })
        for kc in key_creds:
            creds.append({
                "id": kc.get("keyId", ""),
                "type": "certificate",
                "displayName": kc.get("displayName", "Certificate"),
                "startDateTime": kc.get("startDateTime"),
                "endDateTime": kc.get("endDateTime"),
            })
        return creds

    def get_apps(self) -> list[dict]:
        select = "id,appId,displayName,createdDateTime,signInAudience,requiredResourceAccess,passwordCredentials,keyCredentials"

        raw_registrations = self._get_all(f"/applications?$select={select}")
        raw_enterprises = self._get_all(f"/servicePrincipals?$select=id,appId,displayName,createdDateTime,servicePrincipalType,appOwnerOrganizationId&$filter=servicePrincipalType eq 'Application'")

        apps: list[dict] = []

        for reg in raw_registrations:
            try:
                owners_raw = self._get_all(f"/applications/{reg['id']}/owners?$select=id,displayName,userPrincipalName,jobTitle")
            except Exception:
                owners_raw = []

            apps.append({
                "id": reg.get("id", ""),
                "appId": reg.get("appId", ""),
                "displayName": reg.get("displayName", ""),
                "type": "registration",
                "publisher": None,
                "createdDateTime": reg.get("createdDateTime"),
                "signInAudience": reg.get("signInAudience", ""),
                "owners": self._build_owners(owners_raw),
                "permissions": self._build_permissions(reg.get("requiredResourceAccess", [])),
                "credentials": self._build_credentials(
                    reg.get("passwordCredentials", []),
                    reg.get("keyCredentials", []),
                ),
            })

        _enrich(apps)
        return apps

    def get_app(self, app_id: str) -> dict | None:
        apps = self.get_apps()
        return next((a for a in apps if a["id"] == app_id), None)


# ── Factory ───────────────────────────────────────────────────────────────────

def get_service(access_token: str | None = None):
    """Return the appropriate service based on MOCK_MODE config."""
    if Config.MOCK_MODE:
        return MockGraphService()
    return RealGraphService(access_token=access_token)
