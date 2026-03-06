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

export interface Notification {
  id: string;
  type: 'alert' | 'update' | 'system';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface AppState {
  role: UserRole;
  isAuthenticated: boolean;
  name: string;
  city: string;
  state: string;
  profileImage: string | null;
  language: AppLanguage;
  langCode: string;
  theme: AppTheme;
  notifications: Notification[];
  activeAlert: Notification | null;
  fleetActiveTab: string;
  
  // Actions
  login: (role: UserRole, name: string) => void;
  logout: () => void;
  setName: (name: string) => void;
  setCity: (city: string) => void;
  setState: (state: string) => void;
  setProfileImage: (img: string | null) => void;
  setLanguage: (lang: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  setFleetActiveTab: (tab: string) => void;
  setNotifications: (notifications: Notification[]) => void;
  setActiveAlert: (alert: Notification | null) => void;
  markNotificationsAsRead: () => void;
}

export const useAppState = create<AppState>()(
  persist(
    (set) => ({
      role: "Farmer",
      isAuthenticated: false, // Default false, set true on selection
      name: "Guest Farmer",
      city: "Bengaluru",
      state: "Karnataka",
      profileImage: null,
      language: "English",
      langCode: "en",
      theme: "farmer",
      fleetActiveTab: "bookings",
      notifications: [],
      activeAlert: null,
      
      login: (role, name) => set({ role, name, isAuthenticated: true }),
      logout: () => set({ role: "Farmer", isAuthenticated: false, name: "Guest Farmer" }),
      setName: (name) => set({ name }),
      setCity: (city) => set({ city }),
      setState: (state) => set({ state }),
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
      setNotifications: (notifications) => set({ notifications }),
      setActiveAlert: (activeAlert) => set({ activeAlert }),
      markNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      })),
    }),
    {
      name: "kisan-mitra-auth-v1", // New storage version for authenticated grid
    }
  )
);