import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import Avatar from "@/components/ui/Avatar";
import GlobalSearch from "@/components/GlobalSearch";

export default function Topbar({ onOpenSidebar }) {
  const { user, logout } = useAuthStore();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onOpenSidebar} className="btn-ghost rounded-md p-2 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden w-72 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 sm:flex"
        >
          <Search className="h-4 w-4" />
          <span>Search projects, tasks, members…</span>
          <kbd className="ml-auto text-[10px] font-medium text-slate-400">⌘K</kbd>
        </button>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((s) => !s)}
          className="flex items-center gap-2 rounded-md p-1 hover:bg-slate-100"
        >
          <Avatar name={user?.name} />
          <div className="hidden text-left sm:block">
            <div className="text-sm font-medium text-slate-900">{user?.name}</div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">{user?.role}</div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg animate-fade-in">
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => {
                setMenuOpen(false);
                nav("/profile");
              }}
            >
              Profile
            </button>
            <button
              className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
              onClick={() => {
                logout();
                nav("/login");
              }}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
