import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";
import TaskCard from "../components/TaskCard.jsx";
import NewTaskModal from "../components/NewTaskModal.jsx";
import StatsBar from "../components/StatsBar.jsx";

const COLUMNS = [
  { key: "TODO", label: "To do" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "DONE", label: "Done" },
];

export default function ProjectBoard() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const [projectRes, tasksRes, statsRes] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/tasks`),
      api.get(`/projects/${id}/stats`),
    ]);
    setProject(projectRes.data.project);
    setTasks(tasksRes.data.tasks);
    setStats(statsRes.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function moveTask(task, direction) {
    const idx = COLUMNS.findIndex((c) => c.key === task.status);
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= COLUMNS.length) return;
    const nextStatus = COLUMNS[nextIdx].key;

    // Optimistic update so the board feels instant.
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    try {
      await api.patch(`/tasks/${task.id}`, { status: nextStatus });
      const statsRes = await api.get(`/projects/${id}/stats`);
      setStats(statsRes.data);
    } catch {
      load(); // roll back by reloading from source of truth
    }
  }

  async function deleteTask(task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    await api.delete(`/tasks/${task.id}`);
    const statsRes = await api.get(`/projects/${id}/stats`);
    setStats(statsRes.data);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <p className="mx-auto max-w-6xl px-6 py-10 font-mono text-sm text-signal-slate">loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/" className="text-sm text-signal-slate hover:text-teal-700">
          ← All projects
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{project.title}</h1>
            {project.description && <p className="mt-1 text-sm text-signal-slate">{project.description}</p>}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
          >
            New task
          </button>
        </div>

        <div className="mt-6">
          <StatsBar stats={stats} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.key} className="rounded-xl bg-teal-50/60 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="font-mono text-xs font-medium uppercase tracking-wide text-teal-700">
                  {col.label}
                </h2>
                <span className="font-mono text-xs text-signal-slate">
                  {tasks.filter((t) => t.status === col.key).length}
                </span>
              </div>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === col.key)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      canMoveLeft={col.key !== "TODO"}
                      canMoveRight={col.key !== "DONE"}
                      onMove={(dir) => moveTask(task, dir)}
                      onDelete={() => deleteTask(task)}
                    />
                  ))}
                {tasks.filter((t) => t.status === col.key).length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-signal-slate">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {showForm && (
        <NewTaskModal
          projectId={id}
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}
