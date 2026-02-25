// ── Risk helpers ──────────────────────────────────────────────────────────────

export const RISK_LEVELS = ["critical", "high", "medium", "low"];

export const riskConfig = {
  critical: {
    label: "Critical",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    bar: "bg-red-500",
  },
  high: {
    label: "High",
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
    bar: "bg-orange-500",
  },
  medium: {
    label: "Medium",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
    bar: "bg-yellow-400",
  },
  low: {
    label: "Low",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
    bar: "bg-green-500",
  },
};

// ── Credential expiry helpers ─────────────────────────────────────────────────

export const expiryConfig = {
  expired: {
    label: "Expired",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  },
  expiring_critical: {
    label: "< 30 days",
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  expiring_soon: {
    label: "30–60 days",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  expiring: {
    label: "60–90 days",
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  healthy: {
    label: "Healthy",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  none: {
    label: "No credentials",
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
  },
};

// ── Sign-in audience labels ───────────────────────────────────────────────────

export const audienceLabels = {
  AzureADMyOrg: "This org only",
  AzureADMultipleOrgs: "Any Azure AD org",
  AzureADandPersonalMicrosoftAccount: "Azure AD + Personal MS",
  PersonalMicrosoftAccount: "Personal MS accounts",
};

// ── Date formatting ───────────────────────────────────────────────────────────

export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDaysUntil(days) {
  if (days === null || days === undefined) return "—";
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return "Expires today";
  return `${days}d remaining`;
}

// ── Owner initials ────────────────────────────────────────────────────────────

export function getInitials(displayName = "") {
  return displayName
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0] || "")
    .join("")
    .toUpperCase();
}

// ── Risk flag labels ──────────────────────────────────────────────────────────

export const flagLabels = {
  critical_permission: "Critical permission",
  high_permission: "High-risk permission",
  no_owner: "No owner",
  external_audience: "External audience",
};
