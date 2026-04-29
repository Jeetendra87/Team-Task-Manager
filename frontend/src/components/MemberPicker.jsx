import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { api, apiError } from "@/lib/api";

export default function MemberPicker({ open, onClose, exclude = [], onPick }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api
      .get("/users", { params: { search: search || undefined } })
      .then((res) => setUsers(res.data.users))
      .catch((err) => toast.error(apiError(err, "Failed to load users")))
      .finally(() => setLoading(false));
  }, [open, search]);

  const excluded = new Set(exclude.map(String));
  const visible = users.filter((u) => !excluded.has(u._id));

  return (
    <Modal open={open} onClose={onClose} title="Add member">
      <Input
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul className="mt-3 max-h-72 divide-y divide-slate-100 overflow-y-auto">
        {loading && <li className="py-3 text-sm text-slate-400">Loading…</li>}
        {!loading && visible.length === 0 && (
          <li className="py-3 text-sm text-slate-400">No users found.</li>
        )}
        {visible.map((u) => (
          <li key={u._id} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Avatar name={u.name} />
              <div>
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-slate-500">{u.email}</div>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                onPick?.(u);
                onClose();
              }}
            >
              <UserPlus className="h-4 w-4" /> Add
            </Button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
