import RiskBadge from "../shared/RiskBadge";

export default function PermissionList({ permissions = [] }) {
  if (permissions.length === 0) {
    return <p className="text-sm text-gray-400 italic">No permissions configured.</p>;
  }

  const sorted = [...permissions].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.riskLevel] ?? 4) - (order[b.riskLevel] ?? 4);
  });

  return (
    <ul className="space-y-2">
      {sorted.map((perm, i) => (
        <li
          key={i}
          className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{perm.name}</p>
            {perm.description && (
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{perm.description}</p>
            )}
            <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-mono">
              {perm.type}
            </span>
          </div>
          <div className="flex-shrink-0">
            <RiskBadge level={perm.riskLevel} />
          </div>
        </li>
      ))}
    </ul>
  );
}
