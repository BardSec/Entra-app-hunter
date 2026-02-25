import { useState, useEffect } from "react";
import { X, UserX, ExternalLink } from "lucide-react";
import RiskBadge from "../shared/RiskBadge";
import PermissionList from "../permissions/PermissionList";
import CredentialStatus from "../credentials/CredentialStatus";
import { audienceLabels, formatDate, getInitials, flagLabels } from "../../lib/utils";

function OwnerList({ owners }) {
  if (!owners || owners.length === 0) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <UserX className="h-4 w-4" />
        <span>No owner assigned — governance gap</span>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {owners.map((o) => (
        <li key={o.id} className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold flex-shrink-0">
            {getInitials(o.displayName)}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 leading-tight">{o.displayName}</p>
            <p className="text-xs text-gray-400 truncate">{o.userPrincipalName}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function RiskFlags({ flags = [] }) {
  if (flags.length === 0) return null;
  const colorMap = {
    critical_permission: "bg-red-50 text-red-700 border-red-100",
    high_permission: "bg-orange-50 text-orange-700 border-orange-100",
    no_owner: "bg-red-50 text-red-700 border-red-100",
    external_audience: "bg-yellow-50 text-yellow-700 border-yellow-100",
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <span
          key={flag}
          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colorMap[flag] || "bg-gray-50 text-gray-600 border-gray-100"}`}
        >
          {flagLabels[flag] || flag}
        </span>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{title}</h3>
      {children}
    </div>
  );
}

export default function AppDetailPanel({ app, onClose }) {
  const [tab, setTab] = useState("permissions");

  // Reset tab when app changes
  useEffect(() => setTab("permissions"), [app?.id]);

  if (!app) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-30 lg:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 shadow-xl z-40 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0 pr-3">
            <h2 className="text-base font-semibold text-gray-900 leading-tight truncate">
              {app.displayName}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">{app.appId}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Meta strip */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0 space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <RiskBadge level={app.riskLevel} size="lg" />
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              app.type === "registration" ? "bg-purple-50 text-purple-700" : "bg-sky-50 text-sky-700"
            }`}>
              {app.type === "registration" ? "App Registration" : "Enterprise App"}
            </span>
          </div>
          <RiskFlags flags={app.riskFlags} />

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="font-medium text-gray-400">Audience</span>
            <span>{audienceLabels[app.signInAudience] || app.signInAudience}</span>
            <span className="font-medium text-gray-400">Created</span>
            <span>{formatDate(app.createdDateTime)}</span>
            {app.publisher && (
              <>
                <span className="font-medium text-gray-400">Publisher</span>
                <span>{app.publisher}</span>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          {["permissions", "credentials", "owners"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                tab === t
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "permissions" && app.permissions?.length > 0 && (
                <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                  {app.permissions.length}
                </span>
              )}
              {t === "credentials" && app.credentials?.length > 0 && (
                <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                  {app.credentials.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === "permissions" && (
            <Section title={`Permissions (${app.permissions?.length ?? 0})`}>
              {app.criticalPermCount > 0 && (
                <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                  <strong>{app.criticalPermCount} critical permission{app.criticalPermCount > 1 ? "s" : ""}</strong> — this app can modify
                  directory objects, users, or mailboxes at scale.
                </div>
              )}
              <PermissionList permissions={app.permissions} />
            </Section>
          )}

          {tab === "credentials" && (
            <Section title={`Credentials (${app.credentials?.length ?? 0})`}>
              <CredentialStatus credentials={app.credentials} />
            </Section>
          )}

          {tab === "owners" && (
            <Section title="Owners">
              <OwnerList owners={app.owners} />
            </Section>
          )}
        </div>
      </aside>
    </>
  );
}
