import { useMemo } from "react";
import { DndContext, useDroppable, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import TaskCard from "@/components/TaskCard";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { id: "todo", title: "Todo", tone: "bg-slate-50" },
  { id: "in_progress", title: "In Progress", tone: "bg-blue-50/60" },
  { id: "completed", title: "Completed", tone: "bg-emerald-50/60" },
];

export default function KanbanBoard({ tasks, onMove, onOpen, canDrag }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const grouped = useMemo(() => {
    const map = { todo: [], in_progress: [], completed: [] };
    for (const t of tasks) (map[t.status] || map.todo).push(t);
    return map;
  }, [tasks]);

  function onDragEnd(event) {
    const { over, active } = event;
    if (!over) return;
    const target = over.id;
    const task = active.data.current?.task;
    if (!task || task.status === target) return;
    if (!canDrag?.(task)) return;
    onMove?.(task, target);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => (
          <Column key={col.id} column={col} count={grouped[col.id].length}>
            {grouped[col.id].length === 0 ? (
              <div className="grid place-items-center rounded-md border border-dashed border-slate-200 py-8 text-xs text-slate-400">
                Drop tasks here
              </div>
            ) : (
              grouped[col.id].map((t) => (
                <TaskCard
                  key={t._id}
                  task={t}
                  onClick={onOpen}
                  draggable={canDrag ? canDrag(t) : true}
                />
              ))
            )}
          </Column>
        ))}
      </div>
    </DndContext>
  );
}

function Column({ column, count, children }) {
  const { isOver, setNodeRef } = useDroppable({ id: column.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border border-slate-200 p-3 transition-colors",
        column.tone,
        isOver && "ring-2 ring-brand-300"
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-slate-700">{column.title}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 shadow-sm">
          {count}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
