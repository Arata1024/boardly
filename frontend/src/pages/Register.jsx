import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../components/AuthLayout.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (value) => setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form.email, form.password, form.name);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create your workspace" subtitle="Takes about ten seconds.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name" type="text" value={form.name} onChange={update("name")} autoFocus />
        <Field label="Email" type="email" value={form.email} onChange={update("email")} />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={update("password")}
          hint="At least 8 characters."
        />
        {error && <p className="text-sm text-signal-coral">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-teal-600 py-2.5 font-medium text-white transition hover:bg-teal-700 disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-signal-slate">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-teal-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

function Field({ label, type, value, onChange, autoFocus, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        required
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
      />
      {hint && <span className="mt-1 block text-xs text-signal-slate">{hint}</span>}
    </label>
  );
}
