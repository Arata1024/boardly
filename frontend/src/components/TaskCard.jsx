const PRIORITY_COLOR = {
  LOW: "bg-signal-slate/10 text-signal-slate",
  MEDIUM: "bg-teal-50 text-teal-700",
  HIGH: "bg-signal-amber/15 text-signal-amber",
  URGENT: "bg-signal-coral/15 text-signal-coral",
};

export default function TaskCard({ task, onMove, onDelete, canMoveLeft, canMoveRight }) {
  const shortId = `T-${task.id.slice(0, 4).toUpperCase()}`;
  const overdue =
    task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date();

  return (
    <div className="group rounded-lg border border-line bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-signal-slate">{shortId}</span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${PRIORITY_COLOR[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <p className="mt-1.5 text-sm font-medium text-ink">{task.title}</p>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-signal-slate">{task.description}</p>
      )}
      {task.dueDate && (
        <p className={`mt-2 font-mono text-[11px] ${overdue ? "text-signal-coral" : "text-signal-slate"}`}>
          due {new Date(task.dueDate).toLocaleDateString()}
          {overdue ? " · overdue" : ""}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between opacity-0 transition group-hover:opacity-100">
        <div className="flex gap-1">
          <button
            disabled={!canMoveLeft}
            onClick={() => onMove(-1)}
            className="rounded px-1.5 py-0.5 text-xs text-signal-slate hover:bg-paper disabled:opacity-30"
            aria-label="Move to previous column"
          >
            ←
          </button>
          <button
            disabled={!canMoveRight}
            onClick={() => onMove(1)}
            className="rounded px-1.5 py-0.5 text-xs text-signal-slate hover:bg-paper disabled:opacity-30"
            aria-label="Move to next column"
          >
            →
          </button>
        </div>
        <button
          onClick={onDelete}
          className="text-xs text-signal-slate hover:text-signal-coral"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
