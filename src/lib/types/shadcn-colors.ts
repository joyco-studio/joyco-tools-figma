export interface ShadcnColorEntry {
  id: string;
  name: string;
  type: "single" | "twin"; // single color or color + foreground pair
  colors: {
    [modeId: string]: {
      main: string; // main color
      foreground?: string; // foreground color (only for twin type)
    };
  };
}

export interface ShadcnColorMode {
  id: string;
  name: string;
}

export interface ShadcnColorConfig {
  name: string;
  modes: ShadcnColorMode[];
  entries: ShadcnColorEntry[];
  generateOpacityVariants: boolean;
  opacitySteps: number[];
}

export interface ShadcnValidationErrors {
  name?: string;
  modes?: string;
  entries?: string;
}

// Default shadcn color entries
export const DEFAULT_SHADCN_COLORS: Omit<ShadcnColorEntry, "id">[] = [
  {
    name: "background",
    type: "single",
    colors: {},
  },
  {
    name: "foreground",
    type: "single",
    colors: {},
  },
  {
    name: "card",
    type: "twin",
    colors: {},
  },
  {
    name: "popover",
    type: "twin",
    colors: {},
  },
  {
    name: "primary",
    type: "twin",
    colors: {},
  },
  {
    name: "secondary",
    type: "twin",
    colors: {},
  },
  {
    name: "muted",
    type: "twin",
    colors: {},
  },
  {
    name: "accent",
    type: "twin",
    colors: {},
  },
  {
    name: "destructive",
    type: "twin",
    colors: {},
  },
  {
    name: "border",
    type: "single",
    colors: {},
  },
  {
    name: "input",
    type: "single",
    colors: {},
  },
  {
    name: "ring",
    type: "single",
    colors: {},
  },
  {
    name: "chart-1",
    type: "single",
    colors: {},
  },
  {
    name: "chart-2",
    type: "single",
    colors: {},
  },
  {
    name: "chart-3",
    type: "single",
    colors: {},
  },
  {
    name: "chart-4",
    type: "single",
    colors: {},
  },
  {
    name: "chart-5",
    type: "single",
    colors: {},
  },
  {
    name: "sidebar",
    type: "twin",
    colors: {},
  },
  {
    name: "sidebar-primary",
    type: "twin",
    colors: {},
  },
  {
    name: "sidebar-accent",
    type: "twin",
    colors: {},
  },
  {
    name: "sidebar-border",
    type: "single",
    colors: {},
  },
  {
    name: "sidebar-ring",
    type: "single",
    colors: {},
  },
];

// Default modes
export const DEFAULT_SHADCN_MODES: ShadcnColorMode[] = [
  {
    id: "light",
    name: "Light",
  },
  {
    id: "dark",
    name: "Dark",
  },
];

// Default opacity steps for variant generation
export const DEFAULT_SHADCN_OPACITY_STEPS = [
  0, 2.5, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
  95,
];
