/**
 * Converts hex color to RGB values
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB values to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Applies opacity to a color value
 */
export function applyOpacity(color: string, opacity: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const alpha = Math.round(opacity * 255) / 100;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Validates if a string is a valid color format
 */
export function isValidColor(color: string): boolean {
  // Test hex colors
  if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color)) {
    return true;
  }

  // Test rgb/rgba colors
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
    return true;
  }

  // Test hsl/hsla colors
  if (
    /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/.test(color)
  ) {
    return true;
  }

  return false;
}

/**
 * Normalizes color format to hex when possible
 */
export function normalizeColorFormat(color: string): string {
  // Already hex
  if (color.startsWith("#")) {
    return color.toUpperCase();
  }

  // Try to parse RGB and convert to hex
  const rgbMatch = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)/
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return rgbToHex(r, g, b);
  }

  // Return as-is if can't convert
  return color;
}

/**
 * Generates opacity variants for a base color
 */
export function generateOpacityVariants(
  baseColor: string,
  steps: number[] = [2.5, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]
): Record<string, string> {
  const variants: Record<string, string> = {};

  for (const step of steps) {
    variants[step.toString()] = applyOpacity(baseColor, step);
  }

  return variants;
}
