import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
}

// Helper to validate and format color value
const formatColorValue = (value: string): string => {
  if (!value) return "#000000";

  // Handle various color formats
  if (value.startsWith("#")) {
    return value;
  }

  // Handle rgb/rgba values - for now just return as is
  if (value.startsWith("rgb") || value.startsWith("hsl")) {
    return value;
  }

  // Try to parse as hex without #
  if (/^[0-9A-Fa-f]{3,6}$/.test(value)) {
    return `#${value}`;
  }

  // Return as-is for other formats
  return value;
};

// Helper to parse color values from pasted content
const parseColorFromPaste = (pastedText: string): string => {
  const trimmed = pastedText.trim();

  // Try to extract hex color
  const hexMatch = trimmed.match(/#([0-9A-Fa-f]{3,6})/);
  if (hexMatch) {
    return hexMatch[0];
  }

  // Try to extract rgb/rgba
  const rgbMatch = trimmed.match(/rgba?\([^)]+\)/);
  if (rgbMatch) {
    return rgbMatch[0];
  }

  // Try to extract hsl/hsla
  const hslMatch = trimmed.match(/hsla?\([^)]+\)/);
  if (hslMatch) {
    return hslMatch[0];
  }

  // Return the first "word" that looks like a color
  const words = trimmed.split(/\s+/);
  for (const word of words) {
    if (
      word.startsWith("#") ||
      word.startsWith("rgb") ||
      word.startsWith("hsl")
    ) {
      return word;
    }
    // Check for hex without #
    if (/^[0-9A-Fa-f]{3,6}$/.test(word)) {
      return `#${word}`;
    }
  }

  return trimmed;
};

export function ColorPicker({
  color,
  onChange,
  onBlur,
  className,
  disabled = false,
}: ColorPickerProps) {
  const [localColor, setLocalColor] = React.useState(color);
  const [open, setOpen] = React.useState(false);

  // Update local state when prop changes
  React.useEffect(() => {
    setLocalColor(color);
  }, [color]);

  const handleColorChange = (value: string) => {
    setLocalColor(value);
    const formattedValue = formatColorValue(value);
    onChange(formattedValue);
  };

  const handleColorPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const colorValue = parseColorFromPaste(pastedText);
    handleColorChange(colorValue);
  };

  const handleBlur = () => {
    const formattedValue = formatColorValue(localColor);
    setLocalColor(formattedValue);
    onChange(formattedValue);
    onBlur?.();
  };

  // Get a safe color for display (fallback to black if invalid)
  const displayColor = React.useMemo(() => {
    try {
      // Test if the color is valid by creating a dummy element
      const div = document.createElement("div");
      div.style.color = localColor;
      return div.style.color ? localColor : "#000000";
    } catch {
      return "#000000";
    }
  }, [localColor]);

  return (
    <div className={cn("relative flex items-center", className)}>
      <Input
        type="text"
        value={localColor}
        onChange={(e) => handleColorChange(e.target.value)}
        onPaste={handleColorPaste}
        onBlur={handleBlur}
        disabled={disabled}
        className="pr-12 font-mono text-sm"
        placeholder="#000000"
      />

      {/* Color preview and picker trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="absolute right-1 h-8 w-8 p-0 border border-border/50 rounded"
            style={{ backgroundColor: displayColor }}
          >
            <span className="sr-only">Pick color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Color Picker
              </label>
              <input
                type="color"
                value={displayColor.startsWith("#") ? displayColor : "#000000"}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-20 rounded border cursor-pointer"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Hex Value
              </label>
              <Input
                type="text"
                value={localColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
