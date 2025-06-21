import type {
  ScaleRatioOption,
  SizeEntry,
  TypographyConfig,
  ValidationErrors,
} from "../types/typography";

export const SCALE_RATIO_OPTIONS: ScaleRatioOption[] = [
  { value: "1.067", label: "Minor Second (1.067)" },
  { value: "1.125", label: "Major Second (1.125)" },
  { value: "1.2", label: "Minor Third (1.2)" },
  { value: "1.25", label: "Major Third (1.25)" },
  { value: "1.333", label: "Perfect Fourth (1.333)" },
  { value: "1.5", label: "Perfect Fifth (1.5)" },
  { value: "1.618", label: "Golden Ratio (1.618)" },
  { value: "2.0", label: "Octave (2.0)" },
];

export const FALLBACK_FONT_WEIGHTS = [
  "Thin",
  "Extra Light",
  "Light",
  "Regular",
  "Medium",
  "Semi Bold",
  "Bold",
  "Extra Bold",
  "Black",
  "Thin Italic",
  "Extra Light Italic",
  "Light Italic",
  "Italic",
  "Medium Italic",
  "Semi Bold Italic",
  "Bold Italic",
  "Extra Bold Italic",
  "Black Italic",
];

export const INITIAL_TYPOGRAPHY_STATE: TypographyConfig = {
  name: "Untitled style",
  fontSource: "type",
  fontFamily: "",
  styles: [],
  initialSize: 12,
  steps: 9,
  lineHeight: 120,
  letterSpacing: 0,
  textCase: "TITLE",
  lineHeightVariable: null,
  letterSpacingVariable: null,
  isManualScale: false,
  scaleRatio: 1.2,
  manualSizes: [],
};

export const INITIAL_MANUAL_SIZE: Omit<SizeEntry, "id"> = {
  name: "1",
  size: 10,
  lineHeight: 120,
  letterSpacing: 0,
  styles: [],
  textCase: "TITLE",
  sizeVariable: null,
  lineHeightVariable: null,
  letterSpacingVariable: null,
};

export const INITIAL_VALIDATION_ERRORS: ValidationErrors = {};

export const VALIDATION_RULES = {
  lineHeight: { min: 50, max: 500 },
  letterSpacing: { min: -100, max: 200 },
  fontSize: { min: 1, max: 1000 },
} as const;
