import { create } from "zustand";
import { pluginApi } from "@/api";

interface Font {
  family: string;
  style: string;
}

interface FontsState {
  fonts: Font[];
  isLoading: boolean;
  error: string | null;
  loadFonts: () => Promise<void>;
}

export const useFontsStore = create<FontsState>((set, get) => ({
  fonts: [],
  isLoading: false,
  error: null,

  loadFonts: async () => {
    // Don't reload if already loaded or currently loading
    if (get().fonts.length > 0 || get().isLoading) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      console.log("Loading fonts globally...");
      const availableFonts = await pluginApi.getAvailableFonts();
      console.log("Fonts loaded globally:", availableFonts.length, "fonts");

      set({
        fonts: availableFonts,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error loading fonts:", error);
      set({
        fonts: [],
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load fonts",
      });
    }
  },
}));
