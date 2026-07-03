export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel — the one signature moment on the auth screens: a
          quiet grid of "task" dots that nods to the kanban board without
          literally showing one. */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-teal-700 p-12 text-white lg:flex">
        <BrandDots />
        <div className="relative z-10">
          <span className="font-display text-2xl font-semibold tracking-tight">Boardly</span>
        </div>
        <div className="relative z-10 max-w-sm">
          <p className="font-display text-3xl font-medium leading-snug">
            Small teams move fast when the board tells the truth.
          </p>
          <p className="mt-4 text-sm text-teal-100">
            Workspaces, roles, and a board that stays honest about what's actually done.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="font-display text-xl font-semibold text-teal-700">Boardly</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-signal-slate">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

function BrandDots() {
  // A quiet field of status-colored dots — TODO/in-progress/done — arranged
  // like scattered task cards. Purely decorative, low-opacity, no motion.
  const dots = Array.from({ length: 48 }, (_, i) => i);
  const colors = ["#F3F5F4", "#E8A33D", "#2C8B85"];
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
      <svg width="100%" height="100%">
        {dots.map((i) => {
          const x = (i % 8) * 60 + 20;
          const y = Math.floor(i / 8) * 60 + 20;
          return <circle key={i} cx={x} cy={y} r="4" fill={colors[i % colors.length]} />;
        })}
      </svg>
    </div>
  );
}
