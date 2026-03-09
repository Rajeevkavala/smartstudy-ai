import { create } from "zustand";

interface Subscription {
  plan: "free" | "pro" | "university";
  status: string;
  currentPeriodEnd: string | null;
}

interface Gamification {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyMinutes: number;
}

interface AppState {
  subscription: Subscription;
  gamification: Gamification;
  sidebarOpen: boolean;
  setSubscription: (sub: Subscription) => void;
  setGamification: (gam: Gamification) => void;
  addXP: (amount: number) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  subscription: { plan: "free", status: "active", currentPeriodEnd: null },
  gamification: { xp: 0, level: 1, currentStreak: 0, longestStreak: 0, totalStudyMinutes: 0 },
  sidebarOpen: true,
  setSubscription: (sub) => set({ subscription: sub }),
  setGamification: (gam) => set({ gamification: gam }),
  addXP: (amount) =>
    set((state) => {
      const newXP = state.gamification.xp + amount;
      const newLevel = Math.floor(newXP / 500) + 1;
      return {
        gamification: { ...state.gamification, xp: newXP, level: newLevel },
      };
    }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
