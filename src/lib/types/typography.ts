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

export type TextCase =
  | "ORIGINAL"
  | "UPPER"
  | "LOWER"
  | "TITLE"
  | "SMALL_CAPS"
  | "SMALL_CAPS_FORCED";

export interface SizeEntry {
  id: string;
  name: string;
  size: number;
  lineHeight: number;
  letterSpacing: number;
  styles: string[];
  textCase?: TextCase;
  sizeVariable?: Variable | null;
  lineHeightVariable?: Variable | null;
  letterSpacingVariable?: Variable | null;
}

export interface TypographyConfig {
  name: string;
  fontSource: "type" | "variable";
  fontFamily?: string;
  styles: string[];
  variableId?: string;
  initialSize?: number;
  steps?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textCase?: TextCase;
  lineHeightVariable?: Variable | null;
  letterSpacingVariable?: Variable | null;
  isManualScale: boolean;
  scaleRatio?: number;
  manualSizes?: SizeEntry[];
}

export interface ValidationErrors {
  fontFamily?: string;
  styles?: string;
  initialSize?: string;
  steps?: string;
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

export type ScalingMode = "auto" | "manual" | "tailwind";
export type FontSource = "type" | "variable";
