import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, FolderKanban, ListTodo, User } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function GlobalSearch({ open, onClose }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState({ projects: [], tasks: [], users: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQ("");
      setResults({ projects: [], tasks: [], users: [] });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      const term = q.trim();
      if (!term) {
        setResults({ projects: [], tasks: [], users: [] });
        return;
      }
      setLoading(true);
      try {
        const [p, ts, u] = await Promise.all([
          api.get("/projects", { params: { search: term } }),
          api.get("/tasks", { params: { search: term } }),
          api.get("/users", { params: { search: term } }),
        ]);
        setResults({
          projects: p.data.projects.slice(0, 6),
          tasks: ts.data.tasks.slice(0, 8),
          users: u.data.users.slice(0, 6),
        });
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, open]);

  return (
    <Modal open={open} onClose={onClose} title="Search" size="lg">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          autoFocus
          className="pl-9"
          placeholder="Search projects, tasks, members…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto">
        {loading && <div className="text-sm text-slate-400">Searching…</div>}
        <Section title="Projects" icon={FolderKanban}>
          {results.projects.length === 0 ? (
            <Empty />
          ) : (
            results.projects.map((p) => (
              <Link
                key={p._id}
                to={`/projects/${p._id}`}
                onClick={onClose}
                className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-slate-50"
              >
                <span className="text-sm font-medium">{p.title}</span>
                <span className="text-xs text-slate-400">{p.status}</span>
              </Link>
            ))
          )}
        </Section>
        <Section title="Tasks" icon={ListTodo}>
          {results.tasks.length === 0 ? (
            <Empty />
          ) : (
            results.tasks.map((t) => (
              <Link
                key={t._id}
                to={`/projects/${t.project._id}`}
                onClick={onClose}
                className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-slate-50"
              >
                <span className="text-sm">{t.title}</span>
                <span className="text-xs text-slate-400">in {t.project.title}</span>
              </Link>
            ))
          )}
        </Section>
        <Section title="Members" icon={User}>
          {results.users.length === 0 ? (
            <Empty />
          ) : (
            results.users.map((u) => (
              <div key={u._id} className="flex items-center justify-between px-2 py-2">
                <div>
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </div>
                <span className="text-xs uppercase tracking-wide text-slate-400">{u.role}</span>
              </div>
            ))
          )}
        </Section>
      </div>
    </Modal>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5" /> {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Empty() {
  return <div className="px-2 py-1 text-xs text-slate-400">No matches.</div>;
}
