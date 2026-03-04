
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "Farmer" | "Expert" | "Logistics";

export type AppLanguage = 
  | "English" | "Hindi" | "Bhojpuri" | "Punjabi" | "Haryanvi" 
  | "Bengali" | "Marathi" | "Rajasthani" | "Gujarati" | "Pahadi" 
  | "Kannada" | "Tamil" | "Telugu" | "Malayalam" | "Oriya" | "Magahi";

export type AppTheme = "farmer" | "dark" | "contrast";

interface Notification {
  id: string;
  type: 'alert' | 'update' | 'system';
  title: string;
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
  language: AppLanguage;
  theme: AppTheme;
  notifications: Notification[];
  
  // Actions
  login: (role: UserRole) => void;
  logout: () => void;
  setName: (name: string) => void;
  setCity: (city: string) => void;
  setProfileImage: (img: string | null) => void;
  setLanguage: (lang: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
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
      language: "English",
      theme: "farmer",
      notifications: [
        { id: "1", type: "alert", title: "Pest Alert", message: "Locust swarm spotted in nearby sector.", createdAt: new Date().toISOString(), isRead: false },
        { id: "2", type: "system", title: "Market Update", message: "Wheat prices rising in local Mandi.", createdAt: new Date().toISOString(), isRead: false }
      ],
      
      login: (role) => set({ role, isAuthenticated: true }),
      logout: () => set({ role: null, isAuthenticated: false }),
      setName: (name) => set({ name }),
      setCity: (city) => set({ city }),
      setProfileImage: (profileImage) => set({ profileImage }),
      setLanguage: (language) => {
        set({ language });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-lang', language);
        }
      },
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },
      markNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      })),
    }),
    {
      name: "kisan-mitra-storage-v2",
    }
  )
);
