
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "Farmer" | "Expert" | "Authority" | "Logistics";

export type AppLanguage = 
  | "English" | "Hindi" | "Bhojpuri" | "Punjabi" | "Haryanvi" 
  | "Bengali" | "Marathi" | "Rajasthani" | "Gujarati" | "Pahadi" 
  | "Kannada" | "Tamil" | "Telugu" | "Malayalam" | "Oriya" | "Magahi";

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
  name: string;
  city: string;
  profileImage: string | null;
  login: (role: UserRole) => void;
  logout: () => void;
  setName: (name: string) => void;
  setCity: (city: string) => void;
  setProfileImage: (img: string | null) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
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
      name: "Aman Kumar",
      city: "Bengaluru",
      profileImage: null,
      login: (role) => set({ role, isAuthenticated: true }),
      logout: () => set({ role: null, isAuthenticated: false }),
      setName: (name) => set({ name }),
      setCity: (city) => set({ city }),
      setProfileImage: (profileImage) => set({ profileImage }),
      language: "English",
      setLanguage: (language) => {
        set({ language });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-lang', language);
        }
      },
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
