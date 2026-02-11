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
  /** Data URL of the last try-on result image (Nano Banana Pro) */
  tryOnResultImage: string | null;
  /** Product used for last try-on (for showing details next to result) */
  tryOnProduct: { title: string; source?: string; price?: string; product_link?: string; serpapi_immersive_product_api?: string; rating?: number; reviews?: number } | null;
  /** Try-on error message, cleared on dismiss or new try-on */
  tryOnError: string | null;
  /** Current chat session ID (MongoDB Sessions); used for persist & history */
  currentSessionId: string | null;
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
  setTryOnResultImage: (image: string | null) => void;
  setTryOnProduct: (product: AppState["tryOnProduct"]) => void;
  setTryOnError: (error: string | null) => void;
  setCurrentSessionId: (id: string | null) => void;
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
  tryOnResultImage: null,
  tryOnProduct: null,
  tryOnError: null,
  currentSessionId: null,
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
  setTryOnResultImage: (tryOnResultImage) => set({ tryOnResultImage }),
  setTryOnProduct: (tryOnProduct) => set({ tryOnProduct }),
  setTryOnError: (tryOnError) => set({ tryOnError }),
  setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),
  clearProfile: () => set({ profile: null }),
  clearChat: () => set({ chatMessages: [], currentTopic: null }),
}));
