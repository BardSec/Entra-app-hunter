import { expiryConfig, formatDate, formatDaysUntil } from "../../lib/utils";
import { Key, Award } from "lucide-react";

function CredentialRow({ cred }) {
  const cfg = expiryConfig[cred.expiryStatus] || expiryConfig.none;
  const Icon = cred.type === "certificate" ? Award : Key;

  return (
    <div className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${cfg.border} ${cfg.bg}`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className={`h-4 w-4 flex-shrink-0 ${cfg.text}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{cred.displayName}</p>
          <p className="text-xs text-gray-500">
            {cred.type === "secret" ? "Client secret" : "Certificate"} · Expires {formatDate(cred.endDateTime)}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <span className={`text-xs font-semibold ${cfg.text}`}>
          {formatDaysUntil(cred.daysUntilExpiry)}
        </span>
      </div>
    </div>
  );
}

export default function CredentialStatus({ credentials = [] }) {
  if (credentials.length === 0) {
    return <p className="text-sm text-gray-400 italic">No credentials configured.</p>;
  }

  return (
    <ul className="space-y-2">
      {credentials.map((cred) => (
        <li key={cred.id}>
          <CredentialRow cred={cred} />
        </li>
      ))}
    </ul>
  );
}
