import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { api, apiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  // Refresh profile on mount so role/name stay in sync after token refresh.
  useEffect(() => {
    let alive = true;
    api
      .get("/auth/profile")
      .then((res) => alive && setUser(res.data.user))
      .catch((err) => {
        if (err?.response?.status === 401) {
          logout();
        } else {
          toast.error(apiError(err, "Could not load profile"));
        }
      });
    return () => {
      alive = false;
    };
  }, [setUser, logout]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
