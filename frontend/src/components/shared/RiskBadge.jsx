import { riskConfig } from "../../lib/utils";

export default function RiskBadge({ level, size = "sm" }) {
  const cfg = riskConfig[level] || riskConfig.low;
  const sizeClass = size === "lg" ? "px-3 py-1 text-sm font-semibold" : "px-2 py-0.5 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
