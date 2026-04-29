import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

export default function Button({
  variant = "primary",
  loading = false,
  className,
  children,
  disabled,
  ...rest
}) {
  return (
    <button
      className={cn(variants[variant] || variants.primary, className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
