import { cn } from "@/lib/utils";

const tones = {
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  brand: "bg-brand-100 text-brand-700",
};

export default function Badge({ tone = "slate", className, children }) {
  return <span className={cn("badge", tones[tone], className)}>{children}</span>;
}

export const PriorityBadge = ({ priority }) => {
  const map = { low: "blue", medium: "amber", high: "rose" };
  return (
    <Badge tone={map[priority] || "slate"} className="capitalize">
      {priority}
    </Badge>
  );
};

export const StatusBadge = ({ status }) => {
  const map = { todo: "slate", in_progress: "blue", completed: "green" };
  const label = { todo: "Todo", in_progress: "In Progress", completed: "Completed" };
  return <Badge tone={map[status] || "slate"}>{label[status] || status}</Badge>;
};
