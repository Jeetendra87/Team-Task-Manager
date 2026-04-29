import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Textarea = forwardRef(function Textarea(
  { label, error, className, id, rows = 4, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn("input resize-y", error && "border-rose-400 focus:ring-rose-100", className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
});

export default Textarea;
