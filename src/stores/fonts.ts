import { create } from "zustand";
import { pluginApi } from "@/api";

interface Font {
  family: string;
  styles: string[];
}

interface Variable {
  id: string;
  name: string;
  resolvedType: string;
  description?: string;
  collectionName?: string;
}

interface FontsState {
  fonts: Font[];
  isLoading: boolean;
  error: string | null;
  loadFonts: () => Promise<void>;
  revalidateFonts: () => Promise<void>;
}

interface VariablesState {
  variables: Variable[];
  isLoading: boolean;
  error: string | null;
  loadVariables: () => Promise<void>;
  revalidateVariables: () => Promise<void>;
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

  revalidateFonts: async () => {
    set({ isLoading: true, error: null });

    try {
      console.log("Revalidating fonts...");
      const availableFonts = await pluginApi.getAvailableFonts();
      console.log("Fonts revalidated:", availableFonts.length, "fonts");

      set({
        fonts: availableFonts,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error revalidating fonts:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to revalidate fonts",
      });
    }
  },
}));

export const useVariablesStore = create<VariablesState>((set, get) => ({
  variables: [],
  isLoading: false,
  error: null,

  loadVariables: async () => {
    // Don't reload if already loaded or currently loading
    if (get().variables.length > 0 || get().isLoading) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      console.log("Loading variables globally...");
      const availableVariables = await pluginApi.getAvailableVariables();
      console.log(
        "Variables loaded globally:",
        availableVariables.length,
        "variables"
      );

      set({
        variables: availableVariables,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error loading variables:", error);
      set({
        variables: [],
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to load variables",
      });
    }
  },

  revalidateVariables: async () => {
    set({ isLoading: true, error: null });

    try {
      console.log("Revalidating variables...");
      const availableVariables = await pluginApi.getAvailableVariables();
      console.log(
        "Variables revalidated:",
        availableVariables.length,
        "variables"
      );

      set({
        variables: availableVariables,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error revalidating variables:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to revalidate variables",
      });
    }
  },
}));
