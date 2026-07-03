export default function StatsBar({ stats }) {
  if (!stats) return null;

  const items = [
    { label: "Total", value: stats.total },
    { label: "In progress", value: stats.byStatus.IN_PROGRESS },
    { label: "Done", value: stats.byStatus.DONE },
    { label: "Overdue", value: stats.overdue, warn: stats.overdue > 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-line bg-white px-4 py-3">
          <p className="font-mono text-2xl font-medium text-ink">
            <span className={item.warn ? "text-signal-coral" : ""}>{item.value}</span>
          </p>
          <p className="mt-0.5 text-xs text-signal-slate">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
