import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef(function Input(
  { label, error, className, id, ...props },
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
      <input
        ref={ref}
        id={inputId}
        className={cn("input", error && "border-rose-400 focus:ring-rose-100", className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
});

export default Input;
