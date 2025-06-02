import type {
  Font,
  Variable,
  SizeEntry,
  TypographyConfig,
  ValidationErrors,
  ScalingMode,
} from "../types/typography";
import {
  FALLBACK_FONT_WEIGHTS,
  VALIDATION_RULES,
} from "../constants/typography";

export function getTypeLabel(resolvedType: string): string {
  switch (resolvedType) {
    case "STRING":
      return "text";
    case "FLOAT":
      return "number";
    case "BOOLEAN":
      return "boolean";
    case "COLOR":
      return "color";
    default:
      return resolvedType.toLowerCase();
  }
}

/**
 * Convert line height from multiplier (storage) to percentage (UI display)
 * Example: 1.2 -> 120
 */
export function lineHeightToPercentage(lineHeight: number): number {
  return lineHeight * 100;
}

/**
 * Convert line height from percentage (UI input) to multiplier (storage)
 * Example: 120 -> 1.2
 */
export function lineHeightFromPercentage(percentage: number): number {
  return percentage / 100;
}

/**
 * Format line height as percentage string for display
 * Example: 120 -> "120"
 */
export function formatLineHeightForDisplay(lineHeight: number): string {
  return lineHeight.toString();
}

export function findMatchingFont(fonts: Font[], variable: Variable): string[] {
  let primaryCandidate: string | null = null;

  if (variable.resolvedValue && typeof variable.resolvedValue === "string") {
    primaryCandidate = variable.resolvedValue;
  } else {
    const nameParts = variable.name.split("/");
    primaryCandidate = nameParts[nameParts.length - 1];
  }

  // Try exact match first
  const exactMatch = fonts.find((font) => font.family === primaryCandidate);
  if (exactMatch) return exactMatch.styles;

  // Try case-insensitive match
  const caseInsensitiveMatch = fonts.find(
    (font) => font.family.toLowerCase() === primaryCandidate?.toLowerCase()
  );
  if (caseInsensitiveMatch) return caseInsensitiveMatch.styles;

  // Return fallback weights
  return FALLBACK_FONT_WEIGHTS;
}

export function getAvailableStyles(
  fontSource: "type" | "variable",
  selectedFontFamily: string,
  selectedVariable: Variable | null,
  fonts: Font[]
): string[] {
  if (fontSource === "type" && selectedFontFamily) {
    const selectedFont = fonts.find(
      (font) => font.family === selectedFontFamily
    );
    return selectedFont?.styles || [];
  } else if (fontSource === "variable" && selectedVariable) {
    return findMatchingFont(fonts, selectedVariable);
  }
  return [];
}

export function generateManualSizeId(existingSizes: SizeEntry[]): string {
  return (existingSizes.length + 1).toString();
}

export function createNewManualSize(
  existingSizes: SizeEntry[],
  availableStyles: string[],
  defaultRatio: number = 1.2
): SizeEntry {
  const newId = generateManualSizeId(existingSizes);
  const prevSize = existingSizes[existingSizes.length - 1];

  const baseSize = prevSize?.size || 10;
  const baseLineHeight = prevSize?.lineHeight || 1.2;
  const baseLetterSpacing = prevSize?.letterSpacing || 0;
  const baseStyles =
    prevSize?.styles ||
    (availableStyles.length > 0 ? [availableStyles[0]] : []);

  return {
    id: newId,
    name: newId,
    size: Math.round(baseSize * defaultRatio),
    lineHeight: baseLineHeight,
    letterSpacing: baseLetterSpacing,
    styles: baseStyles,
    sizeVariable: null,
  };
}

export function validateTypographyConfig(
  config: TypographyConfig,
  scalingMode: ScalingMode,
  availableStyles: string[]
): ValidationErrors {
  const errors: ValidationErrors = {};

  // Font validation
  if (config.fontSource === "type" && !config.fontFamily?.trim()) {
    errors.fontFamily = "Font family is required";
  }

  // Only validate styles if a font is selected and styles are available
  const hasFontSelected =
    config.fontSource === "variable" || config.fontFamily?.trim();

  // Styles validation (only in auto mode and when font is selected)
  if (
    scalingMode === "auto" &&
    hasFontSelected &&
    availableStyles.length > 0 &&
    config.styles.length === 0
  ) {
    errors.styles = "At least one style must be selected";
  }

  // Auto mode validations
  if (scalingMode === "auto") {
    if (
      !config.lineHeight ||
      config.lineHeight < VALIDATION_RULES.lineHeight.min ||
      config.lineHeight > VALIDATION_RULES.lineHeight.max
    ) {
      errors.lineHeight = `Line height must be between ${lineHeightToPercentage(
        VALIDATION_RULES.lineHeight.min
      )}% and ${lineHeightToPercentage(VALIDATION_RULES.lineHeight.max)}%`;
    }

    if (
      config.letterSpacing === undefined ||
      config.letterSpacing < VALIDATION_RULES.letterSpacing.min ||
      config.letterSpacing > VALIDATION_RULES.letterSpacing.max
    ) {
      errors.letterSpacing = `Letter spacing must be between ${VALIDATION_RULES.letterSpacing.min}% and ${VALIDATION_RULES.letterSpacing.max}%`;
    }

    if (!config.scaleRatio) {
      errors.scaleRatio = "Scale ratio is required";
    }
  }

  // Manual mode validations - only validate if there are available styles
  if (
    scalingMode === "manual" &&
    config.manualSizes &&
    availableStyles.length > 0
  ) {
    // Only validate if there are manual sizes to validate
    if (config.manualSizes.length > 0) {
      const hasInvalidSize = config.manualSizes.some(
        (size) =>
          !size.name.trim() ||
          size.size <= 0 ||
          size.lineHeight < VALIDATION_RULES.lineHeight.min ||
          size.lineHeight > VALIDATION_RULES.lineHeight.max ||
          size.letterSpacing < VALIDATION_RULES.letterSpacing.min ||
          size.letterSpacing > VALIDATION_RULES.letterSpacing.max ||
          size.styles.length === 0
      );

      if (hasInvalidSize) {
        errors.manualSizes =
          "All manual sizes must have valid values and at least one style";
      }
    }
    // Note: We don't require manual sizes to exist immediately when switching to manual mode
    // The user can add them when ready
  }

  return errors;
}

export function getStylesDisplayText(
  selectedStyles: string[],
  availableStyles: string[]
): string {
  if (selectedStyles.length === 0) return "Select styles...";
  if (
    selectedStyles.length === availableStyles.length &&
    availableStyles.length > 0
  ) {
    return "All styles";
  }
  if (selectedStyles.length === 1) {
    return selectedStyles[0];
  }
  return `${selectedStyles.length} styles selected`;
}

export function filterFontsByQuery(
  fonts: Font[],
  query: string,
  limit: number = 100
): Font[] {
  if (!query.trim()) {
    return fonts.slice(0, limit);
  }

  const lowerQuery = query.toLowerCase();
  const filtered = fonts.filter((font) =>
    font.family.toLowerCase().includes(lowerQuery)
  );

  return filtered.slice(0, limit);
}
