export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
      {Icon && <Icon className="h-12 w-12 opacity-40" />}
      <p className="text-base font-medium text-gray-500">{title}</p>
      {description && <p className="text-sm text-center max-w-xs">{description}</p>}
    </div>
  );
}
