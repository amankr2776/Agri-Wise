"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "Farmer" | "Expert" | "Authority" | "Logistics";

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'verify';
  from: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface AppState {
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  verifiedRemedies: string[];
  addVerifiedRemedy: (id: string) => void;
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;
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
      notifications: [],
      addNotification: (notif) => set((state) => ({ 
        notifications: [
          { 
            ...notif, 
            id: Math.random().toString(36).substr(2, 9), 
            createdAt: new Date().toISOString(), 
            isRead: false 
          }, 
          ...state.notifications 
        ] 
      })),
      clearNotifications: () => set({ notifications: [] }),
      markNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      })),
    }),
    {
      name: "kisan-mitra-storage",
    }
  )
);