import { useNavigate } from "react-router-dom";
import {
  AppWindow,
  AlertTriangle,
  ShieldAlert,
  UserX,
  TrendingUp,
} from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import StatCard from "../components/shared/StatCard";
import RiskBadge from "../components/shared/RiskBadge";
import TopBar from "../components/layout/TopBar";
import { riskConfig, RISK_LEVELS } from "../lib/utils";

function RiskBar({ byRisk, total }) {
  if (!total) return null;
  return (
    <div>
      <div className="flex rounded-full overflow-hidden h-3 mb-3">
        {RISK_LEVELS.map((level) => {
          const count = byRisk[level] || 0;
          const pct = (count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={level}
              className={`${riskConfig[level].bar} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${riskConfig[level].label}: ${count}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        {RISK_LEVELS.map((level) => {
          const count = byRisk[level] || 0;
          return (
            <div key={level} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${riskConfig[level].dot}`} />
              <span className="text-xs text-gray-500">
                {riskConfig[level].label}: <strong className="text-gray-700">{count}</strong>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlertRow({ alert }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <RiskBadge level={alert.riskLevel} />
        <span className="text-sm font-medium text-gray-800 truncate">{alert.displayName}</span>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        {alert.riskFlags?.includes("no_owner") && (
          <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-full">No owner</span>
        )}
        {alert.credentialStatus === "expired" && (
          <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-full">Expired cred</span>
        )}
        {alert.credentialStatus === "expiring_critical" && (
          <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-1.5 py-0.5 rounded-full">&lt;30d</span>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isPending, error } = useDashboard();
  const navigate = useNavigate();

  // isPending stays true for the entire pending state (including retry back-off),
  // whereas isLoading flips false during the retry delay while data is still undefined.
  if (isPending) return <LoadingSpinner message="Loading dashboard…" />;
  if (error) {
    return (
      <div className="p-8 text-red-600 text-sm">
        Failed to load dashboard: {error.message}
      </div>
    );
  }

  const { tenant, summary, recentAlerts } = data;
  const expiringTotal = summary.expiredCredentials + summary.credentialsExpiring30;

  return (
    <div>
      <TopBar
        title="Dashboard"
        subtitle={tenant?.displayName ? `${tenant.displayName} · ${tenant.verifiedDomain}` : "Security Overview"}
      />

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={AppWindow}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            label="Total Apps"
            value={summary.totalApps}
            sub={`${summary.byType.registration} registrations · ${summary.byType.enterprise} enterprise`}
            onClick={() => navigate("/apps")}
          />
          <StatCard
            icon={AlertTriangle}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            label="Critical Risk"
            value={summary.byRisk.critical}
            sub={`${summary.byRisk.high} high-risk apps`}
            onClick={() => navigate("/apps?risk=critical")}
          />
          <StatCard
            icon={ShieldAlert}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
            label="Credential Issues"
            value={expiringTotal}
            sub={`${summary.expiredCredentials} expired · ${summary.credentialsExpiring30} expiring <30d`}
            onClick={() => navigate("/credentials")}
          />
          <StatCard
            icon={UserX}
            iconBg="bg-yellow-50"
            iconColor="text-yellow-600"
            label="Ownerless Apps"
            value={summary.ownerlessApps}
            sub="Apps with no assigned owner"
            onClick={() => navigate("/apps?ownerless=true")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk distribution */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Risk Distribution</h2>
            </div>
            <RiskBar byRisk={summary.byRisk} total={summary.totalApps} />
          </div>

          {/* Credential expiry breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Credential Expiry</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Already expired", count: summary.expiredCredentials, color: "text-red-600 bg-red-50 border-red-100" },
                { label: "Expiring < 30 days", count: summary.credentialsExpiring30, color: "text-orange-600 bg-orange-50 border-orange-100" },
                { label: "Expiring 30–60 days", count: summary.credentialsExpiring60, color: "text-yellow-600 bg-yellow-50 border-yellow-100" },
                { label: "Expiring 60–90 days", count: summary.credentialsExpiring90, color: "text-blue-600 bg-blue-50 border-blue-100" },
              ].map(({ label, count, color }) => (
                <div key={label} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${color}`}>
                  <span className="text-sm">{label}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent alerts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Top Risk Apps</h2>
          <p className="text-xs text-gray-400 mb-4">Apps with the highest combined risk score.</p>
          {recentAlerts.length === 0 ? (
            <p className="text-sm text-gray-400">No flagged apps.</p>
          ) : (
            <div>
              {recentAlerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
