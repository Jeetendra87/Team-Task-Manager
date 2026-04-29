import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";

import { api, apiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatDate, isOverdue } from "@/lib/utils";

import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import Skeleton from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";
import KanbanBoard from "@/components/KanbanBoard";
import TaskFormModal from "@/components/TaskFormModal";
import TaskDetailModal from "@/components/TaskDetailModal";
import ProjectFormModal from "@/components/ProjectFormModal";
import MemberPicker from "@/components/MemberPicker";

export default function ProjectDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const me = useAuthStore((s) => s.user);
  const isAdmin = me?.role === "admin";

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ priority: "", assignedTo: "", search: "" });
  const [editProject, setEditProject] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [taskForm, setTaskForm] = useState({ open: false, task: null });
  const [detail, setDetail] = useState({ open: false, task: null });

  const isProjectAdmin = isAdmin || project?.createdBy?._id === me?.id;

  async function load() {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get("/tasks", { params: { project: id } }),
      ]);
      setProject(p.data.project);
      setTasks(t.data.tasks);
    } catch (err) {
      toast.error(apiError(err, "Failed to load project"));
      nav("/projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.assignedTo && t.assignedTo?._id !== filters.assignedTo) return false;
      if (q && !t.title.toLowerCase().includes(q) && !(t.description || "").toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [tasks, filters]);

  function canDragTask(task) {
    if (isProjectAdmin) return true;
    return task.assignedTo?._id === me?.id;
  }

  async function moveTask(task, newStatus) {
    const prev = task.status;
    setTasks((curr) => curr.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t)));
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks((curr) => curr.map((t) => (t._id === task._id ? res.data.task : t)));
    } catch (err) {
      toast.error(apiError(err, "Could not update task"));
      setTasks((curr) => curr.map((t) => (t._id === task._id ? { ...t, status: prev } : t)));
    }
  }

  async function addMember(user) {
    try {
      const res = await api.post(`/projects/${id}/members`, { userId: user._id });
      setProject(res.data.project);
      toast.success(`Added ${user.name}`);
    } catch (err) {
      toast.error(apiError(err, "Could not add member"));
    }
  }

  async function removeMember(userId) {
    if (!confirm("Remove this member from the project?")) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data.project);
    } catch (err) {
      toast.error(apiError(err, "Could not remove member"));
    }
  }

  async function deleteProject() {
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted");
      nav("/projects");
    } catch (err) {
      toast.error(apiError(err, "Delete failed"));
    }
  }

  if (loading || !project) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-24" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const overdue = isOverdue(project.deadline, project.status);

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      <header className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{project.title}</h1>
            <Badge tone={project.status === "completed" ? "green" : "brand"}>
              {project.status === "completed" ? "Completed" : "Active"}
            </Badge>
          </div>
          {project.description && (
            <p className="mt-1 text-sm text-slate-600">{project.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span className={overdue ? "text-rose-600" : ""}>
                {project.deadline ? formatDate(project.deadline) : "No deadline"}
              </span>
            </span>
            <span>Created by {project.createdBy?.name}</span>
          </div>
        </div>
        {isProjectAdmin && (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setEditProject(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button variant="danger" onClick={deleteProject}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        )}
      </header>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Members ({project.members.length})</h2>
          {isProjectAdmin && (
            <Button variant="secondary" onClick={() => setShowMemberPicker(true)}>
              <UserPlus className="h-4 w-4" /> Add member
            </Button>
          )}
        </div>
        <ul className="flex flex-wrap gap-3">
          {project.members.map((m) => (
            <li
              key={m._id}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3"
            >
              <Avatar name={m.name} size={28} />
              <span className="text-sm">{m.name}</span>
              <span className="text-xs text-slate-400">({m.role})</span>
              {isProjectAdmin && m._id !== project.createdBy?._id && (
                <button
                  onClick={() => removeMember(m._id)}
                  className="ml-1 text-slate-400 hover:text-rose-600"
                  title="Remove"
                >
                  <UserMinus className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search tasks…"
              className="w-56"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
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
            <Select
              className="w-48"
              value={filters.assignedTo}
              onChange={(e) => setFilters((f) => ({ ...f, assignedTo: e.target.value }))}
            >
              <option value="">All assignees</option>
              {project.members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
          {isProjectAdmin && (
            <Button onClick={() => setTaskForm({ open: true, task: null })}>
              <Plus className="h-4 w-4" /> New task
            </Button>
          )}
        </div>

        <KanbanBoard
          tasks={filtered}
          onMove={moveTask}
          onOpen={(t) => setDetail({ open: true, task: t })}
          canDrag={canDragTask}
        />
      </section>

      <ProjectFormModal
        open={editProject}
        project={project}
        onClose={() => setEditProject(false)}
        onSaved={(p) => setProject(p)}
      />

      <MemberPicker
        open={showMemberPicker}
        exclude={project.members.map((m) => m._id)}
        onClose={() => setShowMemberPicker(false)}
        onPick={addMember}
      />

      <TaskFormModal
        open={taskForm.open}
        task={taskForm.task}
        projectId={id}
        members={project.members}
        onClose={() => setTaskForm({ open: false, task: null })}
        onSaved={(saved) => {
          setTasks((curr) => {
            const exists = curr.some((t) => t._id === saved._id);
            return exists ? curr.map((t) => (t._id === saved._id ? saved : t)) : [saved, ...curr];
          });
        }}
      />

      <TaskDetailModal
        open={detail.open}
        task={detail.task}
        canEdit={isProjectAdmin}
        canDelete={isProjectAdmin}
        onClose={() => setDetail({ open: false, task: null })}
        onEdit={(t) => {
          setDetail({ open: false, task: null });
          setTaskForm({ open: true, task: t });
        }}
        onDeleted={(t) => setTasks((curr) => curr.filter((x) => x._id !== t._id))}
      />
    </div>
  );
}
