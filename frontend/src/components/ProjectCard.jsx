import { Link } from "react-router-dom";
import { CalendarDays, Users } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { formatDate, isOverdue } from "@/lib/utils";

export default function ProjectCard({ project }) {
  const overdue = isOverdue(project.deadline, project.status);
  return (
    <Link
      to={`/projects/${project._id}`}
      className="card group block p-5 transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-700">
          {project.title}
        </h3>
        <Badge tone={project.status === "completed" ? "green" : "brand"}>
          {project.status === "completed" ? "Completed" : "Active"}
        </Badge>
      </div>
      {project.description && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{project.description}</p>
      )}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5" />
          <span className={overdue ? "text-rose-600" : ""}>
            {project.deadline ? formatDate(project.deadline) : "No deadline"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Users className="h-3.5 w-3.5" />
          <span>{project.members?.length || 0}</span>
          <div className="ml-2 flex -space-x-2">
            {(project.members || []).slice(0, 3).map((m) => (
              <Avatar key={m._id} name={m.name} size={22} className="ring-2 ring-white" />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
