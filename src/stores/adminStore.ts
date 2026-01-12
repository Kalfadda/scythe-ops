import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ADMIN_PASSWORD, ADMIN_SESSION_DURATION } from "@/lib/constants";

interface AdminState {
  isAdminAuthenticated: boolean;
  adminSessionExpiry: number | null;
  authenticateAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  checkAdminSession: () => boolean;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAdminAuthenticated: false,
      adminSessionExpiry: null,

      authenticateAdmin: (password: string) => {
        if (password === ADMIN_PASSWORD) {
          const expiry = Date.now() + ADMIN_SESSION_DURATION;
          set({ isAdminAuthenticated: true, adminSessionExpiry: expiry });
          return true;
        }
        return false;
      },

      logoutAdmin: () => {
        set({ isAdminAuthenticated: false, adminSessionExpiry: null });
      },

      checkAdminSession: () => {
        const { adminSessionExpiry } = get();
        if (!adminSessionExpiry || Date.now() > adminSessionExpiry) {
          set({ isAdminAuthenticated: false, adminSessionExpiry: null });
          return false;
        }
        return true;
      },
    }),
    {
      name: "scythe-admin",
    }
  )
);
