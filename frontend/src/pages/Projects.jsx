import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import ProjectCard from "@/components/ProjectCard";
import ProjectFormModal from "@/components/ProjectFormModal";
import { api, apiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function Projects() {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects", {
        params: { status: statusFilter || undefined },
      });
      setProjects(res.data.projects);
    } catch (err) {
      toast.error(apiError(err, "Failed to load projects"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }, [projects, search]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500">All the work your team is shipping.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        )}
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search projects…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="sm:w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "", label: "All status" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
          ]}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card grid place-items-center p-10 text-center text-sm text-slate-500">
          {projects.length === 0
            ? isAdmin
              ? "No projects yet. Create your first one."
              : "You haven't been added to any projects yet."
            : "No projects match your filters."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      )}

      <ProjectFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={(p) => setProjects((curr) => [p, ...curr])}
      />
    </div>
  );
}
