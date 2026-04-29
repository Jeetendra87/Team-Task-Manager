import { useDraggable } from "@dnd-kit/core";
import { CalendarDays } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { PriorityBadge } from "@/components/ui/Badge";
import { cn, formatDate, isOverdue } from "@/lib/utils";

export default function TaskCard({ task, onClick, draggable = true }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    disabled: !draggable,
    data: { task },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Distinguish click from drag.
        if (!isDragging) onClick?.(task);
        e.stopPropagation();
      }}
      className={cn(
        "card cursor-pointer p-3 hover:border-brand-300",
        isDragging && "rotate-1 opacity-80 shadow-lg"
      )}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-tight text-slate-900">{task.title}</h4>
        <PriorityBadge priority={task.priority} />
      </div>
      {task.description && (
        <p className="line-clamp-2 text-xs text-slate-500">{task.description}</p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <CalendarDays className="h-3 w-3" />
          <span className={overdue ? "text-rose-600" : ""}>
            {task.dueDate ? formatDate(task.dueDate, "MMM d") : "—"}
          </span>
        </div>
        {task.assignedTo ? (
          <Avatar name={task.assignedTo.name} size={22} />
        ) : (
          <span className="text-[11px] text-slate-400">Unassigned</span>
        )}
      </div>
    </div>
  );
}
