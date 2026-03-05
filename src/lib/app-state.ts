
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "Farmer" | "Expert" | "Logistics" | "Authority";

export type AppLanguage = 
  | "English" | "Hindi" | "Bhojpuri" | "Punjabi" | "Haryanvi" 
  | "Bengali" | "Marathi" | "Rajasthani" | "Gujarati" | "Pahadi" 
  | "Kannada" | "Tamil" | "Telugu" | "Malayalam" | "Oriya" | "Magahi";

export type AppTheme = "farmer" | "dark" | "contrast";

export const LANG_CODES: Record<AppLanguage, string> = {
  English: "en",
  Hindi: "hi",
  Bhojpuri: "hi",
  Punjabi: "pa",
  Haryanvi: "hi",
  Bengali: "bn",
  Marathi: "mr",
  Rajasthani: "hi",
  Gujarati: "gu",
  Pahadi: "hi",
  Kannada: "kn",
  Tamil: "ta",
  Telugu: "te",
  Malayalam: "ml",
  Oriya: "or",
  Magahi: "hi",
};

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
  langCode: string;
  theme: AppTheme;
  notifications: Notification[];
  fleetActiveTab: string;
  
  // Actions
  login: (role: UserRole) => void;
  logout: () => void;
  setName: (name: string) => void;
  setCity: (city: string) => void;
  setProfileImage: (img: string | null) => void;
  setLanguage: (lang: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  setFleetActiveTab: (tab: string) => void;
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
      langCode: "en",
      theme: "farmer",
      fleetActiveTab: "bookings",
      notifications: [
        { id: "1", type: 'alert', title: "Pest Alert", message: "Locust swarm spotted in nearby sector.", createdAt: new Date().toISOString(), isRead: false },
        { id: "2", type: 'system', title: "Market Update", message: "Wheat prices rising in local Mandi.", createdAt: new Date().toISOString(), isRead: false }
      ],
      
      login: (role) => set({ role, isAuthenticated: true }),
      logout: () => set({ role: null, isAuthenticated: false }),
      setName: (name) => set({ name }),
      setCity: (city) => set({ city }),
      setProfileImage: (profileImage) => set({ profileImage }),
      setLanguage: (language) => {
        const langCode = LANG_CODES[language] || "en";
        set({ language, langCode });
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
      setFleetActiveTab: (fleetActiveTab) => set({ fleetActiveTab }),
      markNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      })),
    }),
    {
      name: "kisan-mitra-storage-v3",
    }
  )
);
