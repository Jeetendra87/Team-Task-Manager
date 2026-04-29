import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export default function Avatar({ name = "?", size = 32, className }) {
  return (
    <div
      className={cn(
        "flex select-none items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700",
        className
      )}
      style={{ width: size, height: size }}
      title={name}
    >
      {initials(name) || "?"}
    </div>
  );
}
