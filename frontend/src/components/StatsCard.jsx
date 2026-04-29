import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand-50 text-brand-700",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
};

export default function StatsCard({ label, value, icon: Icon, tone = "brand", hint }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </div>
          {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
        </div>
        {Icon && (
          <div className={cn("grid h-9 w-9 place-items-center rounded-lg", tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
