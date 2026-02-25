"""
Realistic mock data for a K-12 school district (Lakewood Unified School District).
Dates are computed relative to runtime so the demo always shows current-looking data.
"""

from datetime import datetime, timedelta, timezone


def _dt(days_offset: int) -> str:
    """Return an ISO-8601 UTC string N days from now (negative = in the past)."""
    return (datetime.now(timezone.utc) + timedelta(days=days_offset)).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )


MOCK_TENANT = {
    "id": "d9f8e7a6-b5c4-4321-a0ff-123456789abc",
    "displayName": "Lakewood Unified School District",
    "verifiedDomain": "lakewood.edu",
}

# ── Owners ────────────────────────────────────────────────────────────────────

_ALICE = {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "displayName": "Alice Johnson",
    "userPrincipalName": "alice.johnson@lakewood.edu",
    "jobTitle": "IT Systems Administrator",
}
_BOB = {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "displayName": "Bob Smith",
    "userPrincipalName": "bob.smith@lakewood.edu",
    "jobTitle": "IT Director",
}
_CAROL = {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "displayName": "Carol White",
    "userPrincipalName": "carol.white@lakewood.edu",
    "jobTitle": "SIS Administrator",
}
_DAVID = {
    "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
    "displayName": "David Lee",
    "userPrincipalName": "david.lee@lakewood.edu",
    "jobTitle": "Director of Communications",
}
_EVE = {
    "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
    "displayName": "Eve Brown",
    "userPrincipalName": "eve.brown@lakewood.edu",
    "jobTitle": "Director of Curriculum",
}


def get_mock_apps() -> list[dict]:
    """
    Return list of enriched app objects (registrations + enterprise apps).
    Each object already has permissions and credentials embedded.
    """
    return [
        # ── 1. Clever Rostering ──────────────────────────────────────────────
        {
            "id": "11111111-0000-0000-0000-000000000001",
            "appId": "cccccccc-1111-1111-1111-000000000001",
            "displayName": "Clever Rostering",
            "type": "enterprise",
            "publisher": "Clever Inc.",
            "createdDateTime": _dt(-720),
            "signInAudience": "AzureADMultipleOrgs",
            "owners": [],  # ownerless!
            "permissions": [
                {
                    "name": "User.ReadWrite.All",
                    "type": "Application",
                    "riskLevel": "critical",
                    "description": "Read and write all users' full profiles",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "Group.Read.All",
                    "type": "Application",
                    "riskLevel": "high",
                    "description": "Read all groups",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "EduRoster.Read.All",
                    "type": "Application",
                    "riskLevel": "high",
                    "description": "Read the organization's roster",
                    "resource": "Microsoft Graph",
                },
            ],
            "credentials": [
                {
                    "id": "cred-c-1",
                    "type": "secret",
                    "displayName": "Production Secret",
                    "startDateTime": _dt(-395),
                    "endDateTime": _dt(-15),  # already expired
                },
            ],
        },
        # ── 2. Canvas LMS Integration ─────────────────────────────────────────
        {
            "id": "11111111-0000-0000-0000-000000000002",
            "appId": "cccccccc-2222-2222-2222-000000000002",
            "displayName": "Canvas LMS",
            "type": "enterprise",
            "publisher": "Instructure, Inc.",
            "createdDateTime": _dt(-1100),
            "signInAudience": "AzureADMyOrg",
            "owners": [_ALICE],
            "permissions": [
                {
                    "name": "User.Read",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "Sign in and read user profile",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "Group.Read.All",
                    "type": "Delegated",
                    "riskLevel": "high",
                    "description": "Read all groups",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "openid",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "Sign users in",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "profile",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "View users' basic profile",
                    "resource": "Microsoft Graph",
                },
            ],
            "credentials": [
                {
                    "id": "cred-canvas-1",
                    "type": "certificate",
                    "displayName": "Canvas SSO Certificate",
                    "startDateTime": _dt(-200),
                    "endDateTime": _dt(45),  # expiring in 45 days
                },
            ],
        },
        # ── 3. Google Workspace Connector ────────────────────────────────────
        {
            "id": "11111111-0000-0000-0000-000000000003",
            "appId": "cccccccc-3333-3333-3333-000000000003",
            "displayName": "Google Workspace Connector",
            "type": "enterprise",
            "publisher": "Google LLC",
            "createdDateTime": _dt(-900),
            "signInAudience": "AzureADMyOrg",
            "owners": [_BOB, _ALICE],
            "permissions": [
                {
                    "name": "Directory.Read.All",
                    "type": "Application",
                    "riskLevel": "high",
                    "description": "Read data in your organization's directory",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "User.Read.All",
                    "type": "Application",
                    "riskLevel": "high",
                    "description": "Read all users' full profiles",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "Group.ReadWrite.All",
                    "type": "Application",
                    "riskLevel": "critical",
                    "description": "Read and write all groups",
                    "resource": "Microsoft Graph",
                },
            ],
            "credentials": [
                {
                    "id": "cred-gws-1",
                    "type": "secret",
                    "displayName": "Sync Service Secret",
                    "startDateTime": _dt(-340),
                    "endDateTime": _dt(28),  # expiring in 28 days
                },
            ],
        },
        # ── 4. PowerSchool SSO ────────────────────────────────────────────────
        {
            "id": "11111111-0000-0000-0000-000000000004",
            "appId": "cccccccc-4444-4444-4444-000000000004",
            "displayName": "PowerSchool SSO",
            "type": "enterprise",
            "publisher": "PowerSchool Group LLC",
            "createdDateTime": _dt(-1400),
            "signInAudience": "AzureADMyOrg",
            "owners": [_CAROL],
            "permissions": [
                {
                    "name": "openid",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "Sign users in",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "profile",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "View users' basic profile",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "email",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "View users' email address",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "User.Read",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "Sign in and read user profile",
                    "resource": "Microsoft Graph",
                },
            ],
            "credentials": [
                {
                    "id": "cred-ps-1",
                    "type": "certificate",
                    "displayName": "SAML Signing Certificate",
                    "startDateTime": _dt(-245),
                    "endDateTime": _dt(120),  # healthy
                },
            ],
        },
        # ── 5. Zoom Education ─────────────────────────────────────────────────
        {
            "id": "11111111-0000-0000-0000-000000000005",
            "appId": "cccccccc-5555-5555-5555-000000000005",
            "displayName": "Zoom for Education",
            "type": "enterprise",
            "publisher": "Zoom Video Communications, Inc.",
            "createdDateTime": _dt(-600),
            "signInAudience": "AzureADMultipleOrgs",
            "owners": [_ALICE],
            "permissions": [
                {
                    "name": "User.Read",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "Sign in and read user profile",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "User.Read.All",
                    "type": "Application",
                    "riskLevel": "high",
                    "description": "Read all users' full profiles",
                    "resource": "Microsoft Graph",
                },
            ],
            "credentials": [
                {
                    "id": "cred-zoom-1",
                    "type": "secret",
                    "displayName": "OAuth App Secret",
                    "startDateTime": _dt(-343),
                    "endDateTime": _dt(22),  # expiring very soon
                },
            ],
        },
        # ── 6. Naviance College Counseling ────────────────────────────────────
        {
            "id": "11111111-0000-0000-0000-000000000006",
            "appId": "cccccccc-6666-6666-6666-000000000006",
            "displayName": "Naviance College Counseling",
            "type": "registration",
            "publisher": None,
            "createdDateTime": _dt(-800),
            "signInAudience": "AzureADMyOrg",
            "owners": [],  # ownerless!
            "permissions": [
                {
                    "name": "Files.ReadWrite.All",
                    "type": "Application",
                    "riskLevel": "critical",
                    "description": "Read and write all files that user can access",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "Group.Read.All",
                    "type": "Application",
                    "riskLevel": "high",
                    "description": "Read all groups",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "User.Read",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "Sign in and read user profile",
                    "resource": "Microsoft Graph",
                },
            ],
            "credentials": [
                {
                    "id": "cred-nav-1",
                    "type": "secret",
                    "displayName": "Integration Secret",
                    "startDateTime": _dt(-298),
                    "endDateTime": _dt(67),  # 60–90 day window
                },
            ],
        },
        # ── 7. ParentSquare ───────────────────────────────────────────────────
        {
            "id": "11111111-0000-0000-0000-000000000007",
            "appId": "cccccccc-7777-7777-7777-000000000007",
            "displayName": "ParentSquare",
            "type": "enterprise",
            "publisher": "ParentSquare, Inc.",
            "createdDateTime": _dt(-500),
            "signInAudience": "AzureADMyOrg",
            "owners": [_DAVID],
            "permissions": [
                {
                    "name": "Mail.ReadWrite",
                    "type": "Application",
                    "riskLevel": "critical",
                    "description": "Read and write access to all mailboxes",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "User.Read.All",
                    "type": "Application",
                    "riskLevel": "high",
                    "description": "Read all users' full profiles",
                    "resource": "Microsoft Graph",
                },
            ],
            "credentials": [
                {
                    "id": "cred-ps2-1",
                    "type": "secret",
                    "displayName": "Mail API Secret",
                    "startDateTime": _dt(-280),
                    "endDateTime": _dt(82),  # 60–90 day window
                },
            ],
        },
        # ── 8. iReady ─────────────────────────────────────────────────────────
        {
            "id": "11111111-0000-0000-0000-000000000008",
            "appId": "cccccccc-8888-8888-8888-000000000008",
            "displayName": "iReady Diagnostic",
            "type": "enterprise",
            "publisher": "Curriculum Associates, LLC",
            "createdDateTime": _dt(-1000),
            "signInAudience": "AzureADMyOrg",
            "owners": [_EVE],
            "permissions": [
                {
                    "name": "User.Read",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "Sign in and read user profile",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "openid",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "Sign users in",
                    "resource": "Microsoft Graph",
                },
            ],
            "credentials": [
                {
                    "id": "cred-ir-1",
                    "type": "certificate",
                    "displayName": "SSO Certificate",
                    "startDateTime": _dt(-165),
                    "endDateTime": _dt(200),  # healthy
                },
            ],
        },
        # ── 9. Newsela ────────────────────────────────────────────────────────
        {
            "id": "11111111-0000-0000-0000-000000000009",
            "appId": "cccccccc-9999-9999-9999-000000000009",
            "displayName": "Newsela",
            "type": "registration",
            "publisher": None,
            "createdDateTime": _dt(-700),
            "signInAudience": "AzureADMyOrg",
            "owners": [_EVE],
            "permissions": [
                {
                    "name": "User.Read",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "Sign in and read user profile",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "openid",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "Sign users in",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "profile",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "View users' basic profile",
                    "resource": "Microsoft Graph",
                },
            ],
            "credentials": [
                {
                    "id": "cred-news-1",
                    "type": "secret",
                    "displayName": "OAuth Secret",
                    "startDateTime": _dt(-215),
                    "endDateTime": _dt(150),  # healthy
                },
            ],
        },
        # ── 10. SchoolDude Facilities ─────────────────────────────────────────
        {
            "id": "11111111-0000-0000-0000-000000000010",
            "appId": "cccccccc-aaaa-aaaa-aaaa-00000000000a",
            "displayName": "SchoolDude Facilities",
            "type": "registration",
            "publisher": None,
            "createdDateTime": _dt(-1200),
            "signInAudience": "AzureADMyOrg",
            "owners": [],  # ownerless!
            "permissions": [
                {
                    "name": "Directory.Read.All",
                    "type": "Application",
                    "riskLevel": "high",
                    "description": "Read data in your organization's directory",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "AuditLog.Read.All",
                    "type": "Application",
                    "riskLevel": "high",
                    "description": "Read all audit log data",
                    "resource": "Microsoft Graph",
                },
            ],
            "credentials": [],  # no credentials configured
        },
        # ── 11. Test App — Dev (DO NOT USE) ───────────────────────────────────
        {
            "id": "11111111-0000-0000-0000-000000000011",
            "appId": "cccccccc-bbbb-bbbb-bbbb-00000000000b",
            "displayName": "Test App — Dev (DO NOT USE)",
            "type": "registration",
            "publisher": None,
            "createdDateTime": _dt(-950),
            "signInAudience": "AzureADandPersonalMicrosoftAccount",
            "owners": [],  # ownerless!
            "permissions": [
                {
                    "name": "Directory.ReadWrite.All",
                    "type": "Application",
                    "riskLevel": "critical",
                    "description": "Read and write all data in your organization's directory",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "Application.ReadWrite.All",
                    "type": "Application",
                    "riskLevel": "critical",
                    "description": "Read and write all applications",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "User.ReadWrite.All",
                    "type": "Application",
                    "riskLevel": "critical",
                    "description": "Read and write all users' full profiles",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "RoleManagement.ReadWrite.Directory",
                    "type": "Application",
                    "riskLevel": "critical",
                    "description": "Read and write all RBAC settings for your company's directory",
                    "resource": "Microsoft Graph",
                },
            ],
            "credentials": [
                {
                    "id": "cred-test-1",
                    "type": "secret",
                    "displayName": "Dev Secret",
                    "startDateTime": _dt(-410),
                    "endDateTime": _dt(-45),  # already expired
                },
                {
                    "id": "cred-test-2",
                    "type": "certificate",
                    "displayName": "Dev Certificate",
                    "startDateTime": _dt(-375),
                    "endDateTime": _dt(-10),  # already expired
                },
            ],
        },
        # ── 12. Remind Communication ──────────────────────────────────────────
        {
            "id": "11111111-0000-0000-0000-000000000012",
            "appId": "cccccccc-cccc-cccc-cccc-00000000000c",
            "displayName": "Remind Communication",
            "type": "enterprise",
            "publisher": "Remind101, Inc.",
            "createdDateTime": _dt(-400),
            "signInAudience": "AzureADMyOrg",
            "owners": [_DAVID],
            "permissions": [
                {
                    "name": "Mail.Read",
                    "type": "Application",
                    "riskLevel": "high",
                    "description": "Read access to all mailboxes",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "User.Read.All",
                    "type": "Application",
                    "riskLevel": "high",
                    "description": "Read all users' full profiles",
                    "resource": "Microsoft Graph",
                },
                {
                    "name": "openid",
                    "type": "Delegated",
                    "riskLevel": "low",
                    "description": "Sign users in",
                    "resource": "Microsoft Graph",
                },
            ],
            "credentials": [
                {
                    "id": "cred-remind-1",
                    "type": "secret",
                    "displayName": "Messaging API Secret",
                    "startDateTime": _dt(-310),
                    "endDateTime": _dt(55),  # 30–60 day window
                },
            ],
        },
    ]
