import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-lg font-semibold text-teal-700">
          Boardly
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-signal-slate">{user?.name}</span>
          <button
            onClick={logout}
            className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:border-teal-600 hover:text-teal-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
