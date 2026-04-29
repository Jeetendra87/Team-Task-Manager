import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CalendarDays } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import Avatar from "@/components/ui/Avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { api, apiError } from "@/lib/api";
import { formatDate, isOverdue } from "@/lib/utils";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
    mine: "true",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/tasks", {
        params: {
          mine: filters.mine,
          status: filters.status || undefined,
          priority: filters.priority || undefined,
          search: filters.search || undefined,
        },
      });
      setTasks(res.data.tasks);
    } catch (err) {
      toast.error(apiError(err, "Failed to load tasks"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority, filters.mine]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q)
    );
  }, [tasks, filters.search]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-slate-500">All work assigned across your projects.</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search tasks…"
          className="w-64"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <Select
          className="w-44"
          value={filters.mine}
          onChange={(e) => setFilters((f) => ({ ...f, mine: e.target.value }))}
          options={[
            { value: "true", label: "Assigned to me" },
            { value: "false", label: "All visible" },
          ]}
        />
        <Select
          className="w-40"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          options={[
            { value: "", label: "All status" },
            { value: "todo", label: "Todo" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
          ]}
        />
        <Select
          className="w-40"
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
          options={[
            { value: "", label: "All priorities" },
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
          ]}
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card grid place-items-center p-10 text-sm text-slate-500">
          No tasks match your filters.
        </div>
      ) : (
        <ul className="card divide-y divide-slate-100 overflow-hidden">
          {filtered.map((t) => {
            const overdue = isOverdue(t.dueDate, t.status);
            return (
              <li key={t._id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/projects/${t.project._id}`}
                      className="truncate text-sm font-medium text-slate-900 hover:text-brand-700"
                    >
                      {t.title}
                    </Link>
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span>in {t.project.title}</span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      <span className={overdue ? "text-rose-600" : ""}>
                        {t.dueDate ? formatDate(t.dueDate) : "No due date"}
                      </span>
                    </span>
                  </div>
                </div>
                {t.assignedTo ? (
                  <Avatar name={t.assignedTo.name} size={28} />
                ) : (
                  <span className="text-xs text-slate-400">Unassigned</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
