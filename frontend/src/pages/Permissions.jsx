import { useState } from "react";
import { Search } from "lucide-react";
import { useApps } from "../hooks/useApps";
import RiskBadge from "../components/shared/RiskBadge";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import TopBar from "../components/layout/TopBar";
import AppDetailPanel from "../components/apps/AppDetailPanel";
import { riskConfig, RISK_LEVELS } from "../lib/utils";

function PermRow({ perm }) {
  const cfg = riskConfig[perm.riskLevel] || riskConfig.low;
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4">
        <p className="text-sm font-medium text-gray-800">{perm.name}</p>
        {perm.description && (
          <p className="text-xs text-gray-400 mt-0.5">{perm.description}</p>
        )}
      </td>
      <td className="py-3 px-4">
        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
          {perm.type}
        </span>
      </td>
      <td className="py-3 px-4">
        <RiskBadge level={perm.riskLevel} />
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">{perm.appName}</td>
    </tr>
  );
}

export default function Permissions() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const { data: apps, isPending, error } = useApps();

  if (isPending) return <LoadingSpinner message="Loading permissions…" />;
  if (error) return <div className="p-8 text-red-600 text-sm">Error: {error.message}</div>;

  // Flatten permissions from all apps
  const allPerms = (apps || []).flatMap((app) =>
    (app.permissions || []).map((perm) => ({
      ...perm,
      appId: app.id,
      appName: app.displayName,
      appType: app.type,
    }))
  );

  // Filter + sort
  let filtered = allPerms;
  if (riskFilter) filtered = filtered.filter((p) => p.riskLevel === riskFilter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.appName.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }

  const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  filtered.sort((a, b) => (riskOrder[a.riskLevel] ?? 4) - (riskOrder[b.riskLevel] ?? 4));

  // Stats
  const stats = RISK_LEVELS.reduce((acc, lvl) => {
    acc[lvl] = allPerms.filter((p) => p.riskLevel === lvl).length;
    return acc;
  }, {});

  const appForPanel = selectedApp
    ? apps?.find((a) => a.id === selectedApp)
    : null;

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Permission Auditor"
        subtitle={`${allPerms.length} permissions across ${apps?.length ?? 0} apps`}
      />

      <div className={`flex-1 overflow-auto ${appForPanel ? "lg:mr-[448px]" : ""}`}>
        <div className="p-6 space-y-5">
          {/* Risk summary pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRiskFilter("")}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                !riskFilter ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              All ({allPerms.length})
            </button>
            {RISK_LEVELS.map((lvl) => {
              const cfg = riskConfig[lvl];
              const active = riskFilter === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setRiskFilter(active ? "" : lvl)}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                    active
                      ? `${cfg.bg} ${cfg.text} ${cfg.border} font-medium`
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {cfg.label} ({stats[lvl] || 0})
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search permissions or app…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Permission</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Risk</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button
                      className="hover:text-gray-800"
                      onClick={() => {}}
                    >
                      App
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-gray-400">
                      No permissions match your filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((perm, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedApp(perm.appId === selectedApp ? null : perm.appId)}
                    >
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-800">{perm.name}</p>
                        {perm.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{perm.description}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {perm.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={perm.riskLevel} />
                      </td>
                      <td className="py-3 px-4 text-sm text-indigo-600 hover:underline">
                        {perm.appName}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {appForPanel && (
        <AppDetailPanel
          app={appForPanel}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}
