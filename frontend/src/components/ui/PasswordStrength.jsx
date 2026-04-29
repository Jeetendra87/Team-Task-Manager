import { Check, X } from "lucide-react";

const RULES = [
  { test: (v) => v.length >= 8, label: "At least 8 characters" },
  { test: (v) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v) => /[0-9]/.test(v), label: "One number" },
];

const TIERS = [
  { color: "bg-rose-500", label: "Weak", text: "text-rose-600" },
  { color: "bg-amber-500", label: "Fair", text: "text-amber-600" },
  { color: "bg-yellow-500", label: "Good", text: "text-yellow-700" },
  { color: "bg-emerald-500", label: "Strong", text: "text-emerald-600" },
];

export default function PasswordStrength({ value = "" }) {
  const passed = RULES.map((r) => r.test(value));
  const score = passed.filter(Boolean).length;
  const tier = TIERS[Math.max(0, score - 1)];

  if (!value) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? tier.color : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${tier.text}`}>{tier.label}</span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-600">
        {RULES.map((r, i) => (
          <li key={r.label} className="flex items-center gap-1.5">
            {passed[i] ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <X className="h-3.5 w-3.5 text-slate-300" />
            )}
            <span className={passed[i] ? "text-slate-700" : "text-slate-400"}>
              {r.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
