import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Select = forwardRef(function Select(
  { label, error, className, id, options = [], children, ...props },
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
      <select
        ref={ref}
        id={inputId}
        className={cn("input pr-8", error && "border-rose-400", className)}
        {...props}
      >
        {children ||
          options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
});

export default Select;
