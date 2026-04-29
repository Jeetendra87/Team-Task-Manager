import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { api, apiError } from "@/lib/api";

const schema = z.object({
  title: z.string().min(2, "Required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in_progress", "completed"]),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
});

export default function TaskFormModal({ open, onClose, projectId, task, members = [], onSaved }) {
  const isEdit = Boolean(task);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        title: task?.title || "",
        description: task?.description || "",
        priority: task?.priority || "medium",
        status: task?.status || "todo",
        dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
        assignedTo: task?.assignedTo?._id || "",
      });
    }
  }, [open, task, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        assignedTo: data.assignedTo || null,
        project: projectId,
      };
      const res = isEdit
        ? await api.put(`/tasks/${task._id}`, payload)
        : await api.post("/tasks", payload);
      toast.success(isEdit ? "Task updated" : "Task created");
      onSaved?.(res.data.task);
      onClose();
    } catch (err) {
      toast.error(apiError(err, "Save failed"));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit task" : "New task"} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Title" {...register("title")} error={errors.title?.message} />
        <Textarea label="Description" rows={4} {...register("description")} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            label="Priority"
            {...register("priority")}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />
          <Select
            label="Status"
            {...register("status")}
            options={[
              { value: "todo", label: "Todo" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
            ]}
          />
          <Input label="Due date" type="date" {...register("dueDate")} />
        </div>
        <Select label="Assigned to" {...register("assignedTo")}>
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name} ({m.email})
            </option>
          ))}
        </Select>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
