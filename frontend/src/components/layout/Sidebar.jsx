import { NavLink } from "react-router-dom";
import { LayoutDashboard, FolderKanban, ListChecks, User, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "My Tasks", icon: ListChecks },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-900/40 lg:hidden",
          open ? "block" : "hidden"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <CheckSquare className="h-5 w-5" />
          </div>
          <span className="text-base font-semibold tracking-tight">Team Tasks</span>
        </div>
        <nav className="space-y-1 p-3">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
