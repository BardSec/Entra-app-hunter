export default function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, onClick }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-start gap-4 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className={`flex-shrink-0 rounded-lg p-2.5 ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 leading-none mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value ?? "—"}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
