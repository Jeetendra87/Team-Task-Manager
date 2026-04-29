import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  // Portal to <body> so the modal escapes any parent stacking context
  // (e.g. the Topbar uses backdrop-blur, which would otherwise trap it).
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          "card mt-16 w-full animate-slide-up",
          sizes[size] || sizes.md
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="btn-ghost rounded-md p-1.5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
