import { CheckSquare, Layers, Users, BarChart3, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Organized projects",
    body: "Group work into projects with kanban boards, owners, and clear status.",
  },
  {
    icon: Users,
    title: "Built for teams",
    body: "Assign tasks, mention members, and keep everyone aligned in real time.",
  },
  {
    icon: BarChart3,
    title: "Insightful dashboards",
    body: "Track velocity, throughput, and bottlenecks at a glance.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "JWT auth, rate limiting, and role-based access — production-ready.",
  },
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left: brand / marketing panel */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-brand-300/40 blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                <CheckSquare className="h-5 w-5" />
              </div>
              <span className="text-base font-semibold tracking-tight">
                Team Task Manager
              </span>
            </div>
          </div>

          <div className="relative mt-12 max-w-md">
            <h2 className="text-3xl font-semibold leading-tight">
              Ship work faster, together.
            </h2>
            <p className="mt-3 text-brand-50/90">
              Plan projects, assign tasks, and keep your team in sync — all from
              a single, focused workspace.
            </p>

            <ul className="mt-10 space-y-5">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex gap-3">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15 ring-1 ring-white/20">
                    <f.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-medium">{f.title}</p>
                    <p className="text-sm text-brand-50/80">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative text-xs text-brand-50/70">
            © {new Date().getFullYear()} Team Task Manager
          </div>
        </aside>

        {/* Right: form panel */}
        <main className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
                <CheckSquare className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Team Task Manager
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && (
                <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
              )}
              <div className="mt-6">{children}</div>
            </div>

            {footer && (
              <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
