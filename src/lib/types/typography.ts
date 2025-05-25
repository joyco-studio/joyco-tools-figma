export interface Font {
  family: string;
  styles: string[];
}

export interface Variable {
  id: string;
  name: string;
  resolvedType: string;
  description?: string;
  collectionName?: string;
  resolvedValue?: string | number;
}

export interface SizeEntry {
  id: string;
  name: string;
  size: number;
  lineHeight: number;
  letterSpacing: number;
  styles: string[];
  sizeVariable?: Variable | null;
}

export interface TypographyConfig {
  name: string;
  fontSource: "type" | "variable";
  fontFamily?: string;
  styles: string[];
  variableId?: string;
  lineHeight?: number;
  letterSpacing?: number;
  isManualScale: boolean;
  scaleRatio?: number;
  manualSizes?: SizeEntry[];
}

export interface ValidationErrors {
  fontFamily?: string;
  styles?: string;
  lineHeight?: string;
  letterSpacing?: string;
  scaleRatio?: string;
  manualSizes?: string;
}

export interface TextStyleProps {
  styleId: string;
  onDelete?: () => void;
  mode: "add" | "edit";
  onConfigurationChange?: (config: TypographyConfig, isValid: boolean) => void;
}

export interface ScaleRatioOption {
  value: string;
  label: string;
}

export type ScalingMode = "auto" | "manual";
export type FontSource = "type" | "variable";
