import { useEffect, useState } from "react";
import {
  FolderKanban,
  ListTodo,
  CheckCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import StatsCard from "@/components/StatsCard";
import Skeleton from "@/components/ui/Skeleton";

const STATUS_COLORS = { todo: "#94a3b8", in_progress: "#3a62fb", completed: "#10b981" };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get("/dashboard/stats")
      .then((res) => alive && setStats(res.data))
      .catch((err) => toast.error(apiError(err, "Failed to load dashboard")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="h-72 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!stats) return null;
  const { totals, charts } = stats;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Here's a snapshot of your team's work.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatsCard label="Projects" value={totals.projects} icon={FolderKanban} tone="brand" />
        <StatsCard label="Tasks" value={totals.tasks} icon={ListTodo} tone="blue" />
        <StatsCard label="Completed" value={totals.completedTasks} icon={CheckCheck} tone="green" />
        <StatsCard label="Pending" value={totals.pendingTasks} icon={Clock} tone="amber" />
        <StatsCard label="Overdue" value={totals.overdueTasks} icon={AlertTriangle} tone="rose" />
        <StatsCard
          label="My tasks"
          value={totals.myTasks}
          icon={TrendingUp}
          tone="brand"
          hint={`${totals.teamPerformance}% team progress`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Task status">
          {totals.tasks === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={charts.statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {charts.statusBreakdown.map((d) => (
                    <Cell key={d.status} fill={STATUS_COLORS[d.status]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, labelize(n)]} />
                <Legend formatter={(v) => labelize(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Project progress" className="lg:col-span-2">
          {charts.perProject.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts.perProject} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="title" tick={{ fontSize: 12 }} interval={0} angle={-15} dy={10} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </section>

      <section className="grid gap-4">
        <ChartCard title="Weekly productivity (tasks completed)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={charts.weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#3a62fb"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
    </div>
  );
}

function ChartCard({ title, children, className }) {
  return (
    <div className={`card p-5 ${className || ""}`}>
      <div className="mb-3 text-sm font-medium text-slate-700">{title}</div>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="grid h-[260px] place-items-center text-sm text-slate-400">
      No data yet — create a project and add some tasks.
    </div>
  );
}

function labelize(s) {
  if (s === "in_progress") return "In Progress";
  if (typeof s !== "string") return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
