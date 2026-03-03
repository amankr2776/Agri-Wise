
"use client";

import { create } from "zustand";

export type UserRole = "Farmer" | "Expert" | "Authority" | "Logistics";

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: string;
  setLanguage: (lang: string) => void;
  verifiedRemedies: string[];
  addVerifiedRemedy: (id: string) => void;
}

export const useAppState = create<AppState>((set) => ({
  role: "Farmer",
  setRole: (role) => set({ role }),
  language: "English",
  setLanguage: (language) => set({ language }),
  verifiedRemedies: [],
  addVerifiedRemedy: (id) => set((state) => ({ verifiedRemedies: [...state.verifiedRemedies, id] })),
}));
