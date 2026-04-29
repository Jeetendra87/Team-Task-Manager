import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => Boolean(get().token),
      isAdmin: () => get().user?.role === "admin",
    }),
    { name: "ttm-auth" }
  )
);
