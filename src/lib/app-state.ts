
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "Farmer" | "Expert" | "Authority" | "Logistics";

interface AppState {
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  verifiedRemedies: string[];
  addVerifiedRemedy: (id: string) => void;
}

export const useAppState = create<AppState>()(
  persist(
    (set) => ({
      role: null,
      isAuthenticated: false,
      login: (role) => set({ role, isAuthenticated: true }),
      logout: () => set({ role: null, isAuthenticated: false }),
      language: "English",
      setLanguage: (language) => set({ language }),
      verifiedRemedies: [],
      addVerifiedRemedy: (id) => set((state) => ({ verifiedRemedies: [...state.verifiedRemedies, id] })),
    }),
    {
      name: "kisan-mitra-storage",
    }
  )
);
