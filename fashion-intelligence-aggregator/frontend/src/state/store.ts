"use client";

import { create } from "zustand";
import type { Topic } from "@/types";
import type { Product, Profile, ChatMessage } from "@/types";

interface AppState {
  selectedProductId: string | null;
  selectedComparisonIds: string[];
  profile: Profile | null;
  chatMessages: ChatMessage[];
  currentTopic: Topic | null;
  products: Product[];
  productsLoading: boolean;
  chatOpen: boolean;
  darkMode: boolean;
  reduceMotion: boolean;
  setSelectedProductId: (id: string | null) => void;
  setSelectedComparisonIds: (ids: string[]) => void;
  setProfile: (profile: Profile | null) => void;
  setChatMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setCurrentTopic: (topic: Topic | null) => void;
  setProducts: (products: Product[]) => void;
  setProductsLoading: (loading: boolean) => void;
  setChatOpen: (open: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  setReduceMotion: (reduce: boolean) => void;
  clearProfile: () => void;
  clearChat: () => void;
}

export const useStore = create<AppState>((set) => ({
  selectedProductId: null,
  selectedComparisonIds: [],
  profile: null,
  chatMessages: [],
  currentTopic: null,
  products: [],
  productsLoading: false,
  chatOpen: false,
  darkMode: false,
  reduceMotion: false,
  setSelectedProductId: (id) => set({ selectedProductId: id }),
  setSelectedComparisonIds: (ids) => set({ selectedComparisonIds: ids }),
  setProfile: (profile) => set({ profile }),
  setChatMessages: (messages) =>
    set((s) => ({
      chatMessages: typeof messages === "function" ? messages(s.chatMessages) : messages,
    })),
  setCurrentTopic: (topic) => set({ currentTopic: topic }),
  setProducts: (products) => set({ products }),
  setProductsLoading: (loading) => set({ productsLoading: loading }),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  setDarkMode: (darkMode) => set({ darkMode }),
  setReduceMotion: (reduceMotion) => set({ reduceMotion }),
  clearProfile: () => set({ profile: null }),
  clearChat: () => set({ chatMessages: [], currentTopic: null }),
}));
