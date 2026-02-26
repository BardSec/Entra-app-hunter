import { useState } from "react";
import { Key, Award, AlertTriangle } from "lucide-react";
import { useApps } from "../hooks/useApps";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import TopBar from "../components/layout/TopBar";
import AppDetailPanel from "../components/apps/AppDetailPanel";
import { expiryConfig, formatDate, formatDaysUntil } from "../lib/utils";

const TABS = [
  { key: "expired", label: "Expired" },
  { key: "expiring_critical", label: "< 30 days" },
  { key: "expiring_soon", label: "30–60 days" },
  { key: "expiring", label: "60–90 days" },
  { key: "healthy", label: "Healthy" },
  { key: "none", label: "No credentials" },
];

function CredRow({ app, cred, onSelectApp, selected }) {
  const cfg = expiryConfig[cred.expiryStatus] || expiryConfig.none;
  const Icon = cred.type === "certificate" ? Award : Key;

  return (
    <tr
      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selected ? "bg-indigo-50" : ""}`}
      onClick={() => onSelectApp(app)}
    >
      <td className="py-3 px-4">
        <p className="text-sm font-medium text-gray-800">{app.displayName}</p>
        <p className="text-xs text-gray-400">{app.publisher || (app.type === "registration" ? "App Registration" : "Enterprise App")}</p>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-700">{cred.displayName}</p>
            <p className="text-xs text-gray-400 capitalize">{cred.type}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(cred.endDateTime)}</td>
      <td className="py-3 px-4">
        <span className={`text-sm font-semibold ${cfg.text}`}>
          {formatDaysUntil(cred.daysUntilExpiry)}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          {cfg.label}
        </span>
      </td>
    </tr>
  );
}

export default function Credentials() {
  const [activeTab, setActiveTab] = useState("expired");
  const [selectedApp, setSelectedApp] = useState(null);
  const { data: apps, isPending, error } = useApps();

  if (isPending) return <LoadingSpinner message="Loading credentials…" />;
  if (error) return <div className="p-8 text-red-600 text-sm">Error: {error.message}</div>;

  // Build flat list of (app, cred) pairs
  const allCredPairs = (apps || []).flatMap((app) => {
    if (!app.credentials || app.credentials.length === 0) {
      // Include apps with no credentials under "none" tab
      return [{ app, cred: { id: app.id + "-none", type: "none", displayName: "—", expiryStatus: "none", daysUntilExpiry: null, endDateTime: null } }];
    }
    return app.credentials.map((cred) => ({ app, cred }));
  });

  const counts = TABS.reduce((acc, { key }) => {
    acc[key] = allCredPairs.filter(({ cred }) => cred.expiryStatus === key).length;
    return acc;
  }, {});

  const tabPairs = allCredPairs.filter(({ cred }) => cred.expiryStatus === activeTab);
  const appForPanel = selectedApp ? apps?.find((a) => a.id === selectedApp?.id) : null;

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Credentials"
        subtitle="Client secrets and certificates, by expiry status"
      />

      {/* Alert banner */}
      {(counts.expired > 0 || counts.expiring_critical > 0) && (
        <div className="mx-6 mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>{counts.expired + counts.expiring_critical} credential{counts.expired + counts.expiring_critical !== 1 ? "s" : ""}</strong> require immediate attention —{" "}
            {counts.expired > 0 && `${counts.expired} already expired`}
            {counts.expired > 0 && counts.expiring_critical > 0 && ", "}
            {counts.expiring_critical > 0 && `${counts.expiring_critical} expiring within 30 days`}.
          </span>
        </div>
      )}

      <div className={`flex-1 overflow-auto ${appForPanel ? "lg:mr-[448px]" : ""}`}>
        <div className="p-6 space-y-4">
          {/* Tab bar */}
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            {TABS.map(({ key, label }) => {
              const cfg = expiryConfig[key];
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    activeTab === key
                      ? "bg-white shadow-sm font-medium text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === key ? `${cfg.bg} ${cfg.text}` : "bg-gray-200 text-gray-500"}`}>
                    {counts[key] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">App</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Credential</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Expiry Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Time Left</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {tabPairs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                      No credentials in this category.
                    </td>
                  </tr>
                ) : (
                  tabPairs.map(({ app, cred }) => (
                    <CredRow
                      key={`${app.id}-${cred.id}`}
                      app={app}
                      cred={cred}
                      onSelectApp={setSelectedApp}
                      selected={selectedApp?.id === app.id}
                    />
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
