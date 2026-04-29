import { useEffect, useState } from "react";
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
  deadline: z.string().optional(),
  status: z.enum(["active", "completed"]),
});

export default function ProjectFormModal({ open, onClose, project, onSaved }) {
  const isEdit = Boolean(project);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        title: project?.title || "",
        description: project?.description || "",
        deadline: project?.deadline ? project.deadline.slice(0, 10) : "",
        status: project?.status || "active",
      });
    }
  }, [open, project, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      };
      const res = isEdit
        ? await api.put(`/projects/${project._id}`, payload)
        : await api.post("/projects", payload);
      toast.success(isEdit ? "Project updated" : "Project created");
      onSaved?.(res.data.project);
      onClose();
    } catch (err) {
      toast.error(apiError(err, "Save failed"));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit project" : "New project"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Title" {...register("title")} error={errors.title?.message} />
        <Textarea label="Description" rows={4} {...register("description")} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Deadline" type="date" {...register("deadline")} />
          <Select
            label="Status"
            {...register("status")}
            options={[
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" },
            ]}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Save changes" : "Create project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
