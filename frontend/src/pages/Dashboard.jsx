import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function loadProjects() {
    const res = await api.get("/projects");
    setProjects(res.data.projects);
    setLoading(false);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Your projects</h1>
            <p className="mt-1 text-sm text-signal-slate">
              {projects.length === 0 ? "Nothing here yet." : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
          >
            New project
          </button>
        </div>

        {loading ? (
          <p className="font-mono text-sm text-signal-slate">loading…</p>
        ) : projects.length === 0 ? (
          <EmptyState onCreate={() => setShowForm(true)} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <NewProjectModal
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-xl border border-line bg-white p-5 transition hover:border-teal-400 hover:shadow-sm"
    >
      <h3 className="font-display font-semibold text-ink">{project.title}</h3>
      {project.description && (
        <p className="mt-1 line-clamp-2 text-sm text-signal-slate">{project.description}</p>
      )}
      <div className="mt-4 font-mono text-xs text-signal-slate">
        {project._count?.tasks ?? 0} task{project._count?.tasks === 1 ? "" : "s"}
      </div>
    </Link>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white py-16 text-center">
      <p className="text-sm text-signal-slate">Create your first project to start tracking work.</p>
      <button
        onClick={onCreate}
        className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
      >
        New project
      </button>
    </div>
  );
}

function NewProjectModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/projects", { title, description: description || undefined });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || "Could not create project.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-semibold text-ink">New project</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Title</span>
            <input
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Description (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
          </label>
          {error && <p className="text-sm text-signal-coral">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-signal-slate hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
