import { useState } from "react";
import { ChevronUp, ChevronDown, UserX } from "lucide-react";
import RiskBadge from "../shared/RiskBadge";
import { expiryConfig, audienceLabels, formatDate, getInitials } from "../../lib/utils";

function SortHeader({ label, field, sortField, sortDir, onSort }) {
  const active = sortField === field;
  return (
    <button
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800"
      onClick={() => onSort(field)}
    >
      {label}
      <span className="flex flex-col">
        <ChevronUp className={`h-3 w-3 -mb-1 ${active && sortDir === "asc" ? "text-indigo-600" : "opacity-30"}`} />
        <ChevronDown className={`h-3 w-3 ${active && sortDir === "desc" ? "text-indigo-600" : "opacity-30"}`} />
      </span>
    </button>
  );
}

function OwnerCell({ owners }) {
  if (!owners || owners.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
        <UserX className="h-3 w-3" />
        No owner
      </span>
    );
  }
  return (
    <div className="flex -space-x-1">
      {owners.slice(0, 3).map((o) => (
        <span
          key={o.id}
          title={`${o.displayName} (${o.userPrincipalName})`}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold ring-2 ring-white"
        >
          {getInitials(o.displayName)}
        </span>
      ))}
      {owners.length > 3 && (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-semibold ring-2 ring-white">
          +{owners.length - 3}
        </span>
      )}
    </div>
  );
}

function CredentialCell({ status }) {
  const cfg = expiryConfig[status] || expiryConfig.none;
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

const SORT_FIELDS = {
  displayName: (a) => a.displayName.toLowerCase(),
  riskLevel: (a) => ({ critical: 0, high: 1, medium: 2, low: 3 }[a.riskLevel] ?? 4),
  createdDateTime: (a) => a.createdDateTime || "",
  credentialStatus: (a) => ({ expired: 0, expiring_critical: 1, expiring_soon: 2, expiring: 3, healthy: 4, none: 5 }[a.credentialStatus] ?? 6),
};

export default function AppTable({ apps, onSelect, selectedId }) {
  const [sortField, setSortField] = useState("riskLevel");
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = [...apps].sort((a, b) => {
    const fn = SORT_FIELDS[sortField] || ((x) => x[sortField] || "");
    const va = fn(a);
    const vb = fn(b);
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  if (apps.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No apps match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4">
              <SortHeader label="Name" field="displayName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            </th>
            <th className="text-left py-3 px-4 hidden lg:table-cell">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Type</span>
            </th>
            <th className="text-left py-3 px-4">
              <SortHeader label="Risk" field="riskLevel" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            </th>
            <th className="text-left py-3 px-4 hidden md:table-cell">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Owner(s)</span>
            </th>
            <th className="text-left py-3 px-4 hidden xl:table-cell">
              <SortHeader label="Credentials" field="credentialStatus" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            </th>
            <th className="text-left py-3 px-4 hidden xl:table-cell">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Audience</span>
            </th>
            <th className="text-left py-3 px-4 hidden lg:table-cell">
              <SortHeader label="Created" field="createdDateTime" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((app) => (
            <tr
              key={app.id}
              onClick={() => onSelect(app)}
              className={`cursor-pointer transition-colors ${
                selectedId === app.id
                  ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium text-gray-900 leading-snug">{app.displayName}</p>
                  {app.publisher && (
                    <p className="text-xs text-gray-400 mt-0.5">{app.publisher}</p>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 hidden lg:table-cell">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  app.type === "registration"
                    ? "bg-purple-50 text-purple-700"
                    : "bg-sky-50 text-sky-700"
                }`}>
                  {app.type === "registration" ? "Registration" : "Enterprise"}
                </span>
              </td>
              <td className="py-3 px-4">
                <RiskBadge level={app.riskLevel} />
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                <OwnerCell owners={app.owners} />
              </td>
              <td className="py-3 px-4 hidden xl:table-cell">
                <CredentialCell status={app.credentialStatus} />
              </td>
              <td className="py-3 px-4 hidden xl:table-cell">
                <span className="text-xs text-gray-500">
                  {audienceLabels[app.signInAudience] || app.signInAudience}
                </span>
              </td>
              <td className="py-3 px-4 hidden lg:table-cell text-xs text-gray-500">
                {formatDate(app.createdDateTime)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
