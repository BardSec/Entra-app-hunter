"""
Permission risk classification for Microsoft Entra / Graph API permissions.

Risk levels (K-12 context):
  critical — Can modify directory, all users, all mailboxes, or all files at scale
  high     — Broad read access across all users, mail, or directory objects
  medium   — Moderate data access (own groups, calendars, contacts)
  low      — Minimal access (sign-in, basic profile, own account only)
"""

from typing import Literal

RiskLevel = Literal["critical", "high", "medium", "low"]

# Ordered for priority: first match wins when looking up by name
RISK_DEFINITIONS: dict[str, RiskLevel] = {
    # ── CRITICAL ──────────────────────────────────────────────────────────────
    "Directory.ReadWrite.All": "critical",
    "User.ReadWrite.All": "critical",
    "Mail.ReadWrite": "critical",
    "Mail.ReadWrite.All": "critical",
    "Files.ReadWrite.All": "critical",
    "Group.ReadWrite.All": "critical",
    "Application.ReadWrite.All": "critical",
    "RoleManagement.ReadWrite.Directory": "critical",
    "Policy.ReadWrite.All": "critical",
    "MailboxSettings.ReadWrite": "critical",
    "DeviceManagementConfiguration.ReadWrite.All": "critical",
    "DeviceManagementApps.ReadWrite.All": "critical",
    "DeviceManagementManagedDevices.ReadWrite.All": "critical",
    "Directory.AccessAsUser.All": "critical",
    "full_access_as_user": "critical",
    "Sites.FullControl.All": "critical",
    "Sites.ReadWrite.All": "critical",
    "Exchange.ManageAsApp": "critical",
    "EduRoster.ReadWrite.All": "critical",
    # ── HIGH ──────────────────────────────────────────────────────────────────
    "Directory.Read.All": "high",
    "User.Read.All": "high",
    "Mail.Read": "high",
    "Mail.ReadBasic.All": "high",
    "Group.Read.All": "high",
    "Files.Read.All": "high",
    "AuditLog.Read.All": "high",
    "IdentityRiskyUser.Read.All": "high",
    "IdentityRiskySignIn.Read.All": "high",
    "Reports.Read.All": "high",
    "SecurityEvents.Read.All": "high",
    "SecurityEvents.ReadWrite.All": "high",
    "Sites.Read.All": "high",
    "DeviceManagementManagedDevices.Read.All": "high",
    "Organization.Read.All": "high",
    "People.Read.All": "high",
    "EduRoster.Read.All": "high",
    "Member.Read.Hidden": "high",
    "TeamMember.Read.All": "high",
    "ChannelMessage.Read.All": "high",
    # ── MEDIUM ────────────────────────────────────────────────────────────────
    "User.ReadBasic.All": "medium",
    "Calendars.ReadWrite": "medium",
    "Contacts.ReadWrite": "medium",
    "Tasks.ReadWrite": "medium",
    "People.Read": "medium",
    "Notes.ReadWrite": "medium",
    "Group.ReadWrite": "medium",
    "Calendars.Read": "medium",
    "MailboxSettings.Read": "medium",
    # ── LOW ───────────────────────────────────────────────────────────────────
    "User.Read": "low",
    "User.ReadWrite": "low",
    "openid": "low",
    "profile": "low",
    "email": "low",
    "offline_access": "low",
}

_LEVEL_ORDER: dict[RiskLevel, int] = {
    "critical": 4,
    "high": 3,
    "medium": 2,
    "low": 1,
}


def classify_permission(name: str) -> RiskLevel:
    """Return the risk level for a single permission scope / role name."""
    return RISK_DEFINITIONS.get(name, "low")


def compute_app_risk(permissions: list[dict]) -> RiskLevel:
    """
    Return the overall risk level for an app, based on its highest-risk permission.
    Expects each permission dict to have at least a 'name' key.
    """
    highest: RiskLevel = "low"
    for perm in permissions:
        level = classify_permission(perm.get("name", ""))
        if _LEVEL_ORDER[level] > _LEVEL_ORDER[highest]:
            highest = level
    return highest


def annotate_app(app: dict) -> dict:
    """
    Add risk metadata to an app dict in-place:
      - riskLevel         : overall app risk level
      - riskFlags         : list of human-readable flag strings
      - criticalPermCount : number of critical permissions
      - highPermCount     : number of high permissions
    Returns the mutated dict.
    """
    permissions: list[dict] = app.get("permissions", [])

    # Annotate each permission with its risk level if not already present
    for perm in permissions:
        if "riskLevel" not in perm:
            perm["riskLevel"] = classify_permission(perm.get("name", ""))

    app["riskLevel"] = compute_app_risk(permissions)
    app["criticalPermCount"] = sum(
        1 for p in permissions if p.get("riskLevel") == "critical"
    )
    app["highPermCount"] = sum(
        1 for p in permissions if p.get("riskLevel") == "high"
    )

    flags: list[str] = []
    if app["riskLevel"] == "critical":
        flags.append("critical_permission")
    elif app["riskLevel"] == "high":
        flags.append("high_permission")
    if not app.get("owners"):
        flags.append("no_owner")
    if app.get("signInAudience") in (
        "AzureADMultipleOrgs",
        "AzureADandPersonalMicrosoftAccount",
        "PersonalMicrosoftAccount",
    ):
        flags.append("external_audience")

    app["riskFlags"] = flags
    return app
