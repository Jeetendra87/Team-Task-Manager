import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { useAuthStore } from "@/store/auth";
import { formatDate } from "@/lib/utils";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <div className="card flex items-center gap-4 p-6">
        <Avatar name={user.name} size={64} className="text-base" />
        <div>
          <div className="text-lg font-semibold">{user.name}</div>
          <div className="text-sm text-slate-500">{user.email}</div>
          <div className="mt-1">
            <Badge tone={user.role === "admin" ? "brand" : "slate"} className="capitalize">
              {user.role}
            </Badge>
          </div>
        </div>
      </div>
      <div className="card grid grid-cols-2 gap-4 p-6 text-sm">
        <Field label="Joined">{formatDate(user.createdAt)}</Field>
        <Field label="User ID">
          <code className="break-all text-xs">{user.id}</code>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-slate-800">{children}</div>
    </div>
  );
}
