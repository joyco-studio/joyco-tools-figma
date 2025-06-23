export interface Variable {
  id: string;
  name: string;
  resolvedType: string;
  description?: string;
  collectionName?: string;
  resolvedValue?: string | number;
}

export interface VariableCollection {
  id: string;
  name: string;
  modes: string[];
  defaultModeId: string;
}

export interface ColorMode {
  id: string;
  name: string;
}

export interface ColorEntry {
  id: string;
  name: string;
  values: Record<string, string>; // modeId -> color value
  variable?: Variable | null;
}

export interface ColorVariableConfig {
  name: string;
  collectionId?: string;
  modes: ColorMode[];
  entries: ColorEntry[];
  generateOpacityVariants: boolean;
  opacitySteps: number[];
}

export interface ValidationErrors {
  name?: string;
  collection?: string;
  modes?: string;
  entries?: string;
}

export type ToolMode = "create" | "edit";

export interface ColorManagerProps {
  mode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  onConfigurationChange?: (
    config: ColorVariableConfig,
    isValid: boolean
  ) => void;
}

// Default opacity steps for variant generation
export const DEFAULT_OPACITY_STEPS = [
  0, 2.5, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
  95,
];
