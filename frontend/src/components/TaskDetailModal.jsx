import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Trash2, Pencil, Send } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { api, apiError, } from "@/lib/api";
import { formatDate, formatRelative } from "@/lib/utils";

export default function TaskDetailModal({
  open,
  onClose,
  task,
  canEdit,
  canDelete,
  onEdit,
  onDeleted,
}) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open || !task) return;
    setComments([]);
    api
      .get(`/tasks/${task._id}/comments`)
      .then((res) => setComments(res.data.comments))
      .catch((err) => toast.error(apiError(err, "Failed to load comments")));
  }, [open, task]);

  if (!task) return null;

  async function addComment(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/tasks/${task._id}/comments`, { message: text.trim() });
      setComments((c) => [...c, res.data.comment]);
      setText("");
    } catch (err) {
      toast.error(apiError(err, "Failed to comment"));
    } finally {
      setSending(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      toast.success("Task deleted");
      onDeleted?.(task);
      onClose();
    } catch (err) {
      toast.error(apiError(err, "Delete failed"));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={task.title} size="xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          {task.description ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {task.description}
            </p>
          ) : (
            <p className="text-sm italic text-slate-400">No description.</p>
          )}

          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">Comments</h3>
            <ul className="space-y-3">
              {comments.length === 0 && (
                <li className="text-sm text-slate-400">No comments yet.</li>
              )}
              {comments.map((c) => (
                <li key={c._id} className="flex gap-2">
                  <Avatar name={c.author?.name} size={28} />
                  <div className="flex-1 rounded-lg bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{c.author?.name}</span>
                      <span>{formatRelative(c.createdAt)}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                      {c.message}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <form onSubmit={addComment} className="mt-3 flex gap-2">
              <Input
                placeholder="Write a comment…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button type="submit" loading={sending} disabled={!text.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <aside className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          <Field label="Assignee">
            {task.assignedTo ? (
              <div className="flex items-center gap-2">
                <Avatar name={task.assignedTo.name} size={24} />
                <span>{task.assignedTo.name}</span>
              </div>
            ) : (
              <span className="text-slate-400">Unassigned</span>
            )}
          </Field>
          <Field label="Created by">
            <span>{task.createdBy?.name || "—"}</span>
          </Field>
          <Field label="Due date">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              {task.dueDate ? formatDate(task.dueDate) : "—"}
            </span>
          </Field>
          <Field label="Created">{formatRelative(task.createdAt)}</Field>

          {(canEdit || canDelete) && (
            <div className="flex gap-2 pt-2">
              {canEdit && (
                <Button variant="secondary" className="flex-1" onClick={() => onEdit?.(task)}>
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              )}
              {canDelete && (
                <Button variant="danger" className="flex-1" onClick={remove}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              )}
            </div>
          )}
        </aside>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
