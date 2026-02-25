import { useState } from "react";
import { ClipboardCheck, Info, UserX, Globe, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useCompliance } from "../hooks/useApps";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import RiskBadge from "../components/shared/RiskBadge";
import TopBar from "../components/layout/TopBar";
import AppDetailPanel from "../components/apps/AppDetailPanel";
import { audienceLabels, formatDate, getInitials } from "../lib/utils";

function ComplianceAppCard({ app, onSelect, selected }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
        selected ? "border-indigo-300 shadow-md" : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between gap-3 p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => onSelect(app)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900">{app.displayName}</h3>
            <RiskBadge level={app.riskLevel} />
            {!app.owners?.length && (
              <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                <UserX className="h-3 w-3" /> No owner
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {app.type === "registration" ? "App Registration" : "Enterprise App"} ·{" "}
            {audienceLabels[app.signInAudience] || app.signInAudience} · Created {formatDate(app.createdDateTime)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-400">Score: <strong className="text-gray-700">{app.complianceScore}</strong></span>
          <button
            className="text-gray-400 hover:text-gray-700"
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Reason list */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Review reasons</p>
          {app.complianceReasons?.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>{reason}</span>
            </div>
          ))}

          {/* Permission summary */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Permissions ({app.permissions?.length ?? 0})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(app.permissions || []).map((perm, i) => {
                const riskColors = {
                  critical: "bg-red-50 text-red-700 border-red-100",
                  high: "bg-orange-50 text-orange-700 border-orange-100",
                  medium: "bg-yellow-50 text-yellow-700 border-yellow-100",
                  low: "bg-gray-50 text-gray-600 border-gray-100",
                };
                return (
                  <span
                    key={i}
                    className={`text-xs px-2 py-0.5 rounded-full border font-mono ${riskColors[perm.riskLevel] || riskColors.low}`}
                  >
                    {perm.name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Owners */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Owners</p>
            {!app.owners?.length ? (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <UserX className="h-4 w-4" /> Unowned — assign an owner in Entra ID
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {app.owners.map((o) => (
                  <div key={o.id} className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                      {getInitials(o.displayName)}
                    </span>
                    <span className="text-xs text-gray-700">{o.displayName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Compliance() {
  const [selectedApp, setSelectedApp] = useState(null);
  const { data, isLoading, error } = useCompliance();

  if (isLoading) return <LoadingSpinner message="Loading compliance view…" />;
  if (error) return <div className="p-8 text-red-600 text-sm">Error: {error.message}</div>;

  const { total, apps } = data;

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Compliance Review"
        subtitle={`${total} app${total !== 1 ? "s" : ""} flagged for review`}
      />

      <div className={`flex-1 overflow-auto ${selectedApp ? "lg:mr-[448px]" : ""}`}>
        <div className="p-6 space-y-5">
          {/* Informational callout */}
          <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 space-y-1">
              <p className="font-semibold">FERPA &amp; COPPA Relevance</p>
              <p>
                This view surfaces apps most likely to require review under FERPA (student records) and COPPA
                (children under 13). Apps are flagged when they hold broad data-access permissions, lack an
                assigned owner, or are configured to accept external accounts — all factors that elevate risk
                of unauthorized student data access.
              </p>
              <p className="text-blue-600 text-xs mt-1">
                This tool highlights risk signals — it does not constitute a compliance audit. Consult your
                district's legal counsel for formal compliance determinations.
              </p>
            </div>
          </div>

          {/* Results */}
          {apps?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <ClipboardCheck className="h-12 w-12 opacity-30" />
              <p className="text-base font-medium text-gray-500">No flagged apps</p>
              <p className="text-sm">All apps currently pass the compliance filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map((app) => (
                <ComplianceAppCard
                  key={app.id}
                  app={app}
                  onSelect={(a) => setSelectedApp(a.id === selectedApp?.id ? null : a)}
                  selected={selectedApp?.id === app.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedApp && (
        <AppDetailPanel
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}
