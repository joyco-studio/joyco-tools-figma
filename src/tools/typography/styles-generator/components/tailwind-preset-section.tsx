import * as React from "react";
import { Button } from "@/components/ui/button";
import { ManualSizes, type SizeEntry } from "./manual-sizes";

interface TailwindPresetSectionProps {
  sizes: SizeEntry[];
  availableStyles: string[];
  onSizesChange: (sizes: SizeEntry[]) => void;
  error?: string;
}

// Tailwind CSS font size presets from https://tailwindcss.com/docs/font-size
const TAILWIND_PRESETS: Omit<SizeEntry, 'id' | 'styles' | 'sizeVariable' | 'lineHeightVariable' | 'letterSpacingVariable'>[] = [
  {
    name: "xs",
    size: 12, // 0.75rem
    lineHeight: 133.33, // calc(1 / 0.75) * 100 = 133.33%
    letterSpacing: 0,
    textCase: "ORIGINAL",
  },
  {
    name: "sm", 
    size: 14, // 0.875rem
    lineHeight: 142.86, // calc(1.25 / 0.875) * 100 = 142.86%
    letterSpacing: 0,
    textCase: "ORIGINAL",
  },
  {
    name: "base",
    size: 16, // 1rem
    lineHeight: 150, // calc(1.5 / 1) * 100 = 150%
    letterSpacing: 0,
    textCase: "ORIGINAL",
  },
  {
    name: "lg",
    size: 18, // 1.125rem
    lineHeight: 155.56, // calc(1.75 / 1.125) * 100 = 155.56%
    letterSpacing: 0,
    textCase: "ORIGINAL",
  },
  {
    name: "xl",
    size: 20, // 1.25rem
    lineHeight: 140, // calc(1.75 / 1.25) * 100 = 140%
    letterSpacing: 0,
    textCase: "ORIGINAL",
  },
  {
    name: "2xl",
    size: 24, // 1.5rem
    lineHeight: 133.33, // calc(2 / 1.5) * 100 = 133.33%
    letterSpacing: 0,
    textCase: "ORIGINAL",
  },
  {
    name: "3xl",
    size: 30, // 1.875rem
    lineHeight: 120, // calc(2.25 / 1.875) * 100 = 120%
    letterSpacing: 0,
    textCase: "ORIGINAL",
  },
  {
    name: "4xl",
    size: 36, // 2.25rem
    lineHeight: 111.11, // calc(2.5 / 2.25) * 100 = 111.11%
    letterSpacing: 0,
    textCase: "ORIGINAL",
  },
  {
    name: "5xl",
    size: 48, // 3rem
    lineHeight: 100, // 1 * 100 = 100%
    letterSpacing: 0,
    textCase: "ORIGINAL",
  },
  {
    name: "6xl",
    size: 60, // 3.75rem
    lineHeight: 100, // 1 * 100 = 100%
    letterSpacing: 0,
    textCase: "ORIGINAL",
  },
  {
    name: "7xl",
    size: 72, // 4.5rem
    lineHeight: 100, // 1 * 100 = 100%
    letterSpacing: 0,
    textCase: "ORIGINAL",
  },
  {
    name: "8xl",
    size: 96, // 6rem
    lineHeight: 100, // 1 * 100 = 100%
    letterSpacing: 0,
    textCase: "ORIGINAL",
  },
  {
    name: "9xl",
    size: 128, // 8rem
    lineHeight: 100, // 1 * 100 = 100%
    letterSpacing: 0,
    textCase: "ORIGINAL",
  },
];

export function TailwindPresetSection({
  sizes,
  availableStyles,
  onSizesChange,
  error,
}: TailwindPresetSectionProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize with Tailwind presets if sizes are empty
  React.useEffect(() => {
    if (sizes.length === 0 && availableStyles.length > 0 && !isInitialized) {
      const tailwindSizes: SizeEntry[] = TAILWIND_PRESETS.map((preset, index) => ({
        ...preset,
        id: (index + 1).toString(),
        styles: availableStyles.slice(0, 1), // Default to first available style
        sizeVariable: null,
        lineHeightVariable: null,
        letterSpacingVariable: null,
      }));
      
      onSizesChange(tailwindSizes);
      setIsInitialized(true);
    }
  }, [sizes.length, availableStyles, onSizesChange, isInitialized]);

  const handleLoadTailwindPresets = () => {
    if (availableStyles.length === 0) return;
    
    const tailwindSizes: SizeEntry[] = TAILWIND_PRESETS.map((preset, index) => ({
      ...preset,
      id: (index + 1).toString(),
      styles: availableStyles.slice(0, 1), // Default to first available style
      sizeVariable: null,
      lineHeightVariable: null,
      letterSpacingVariable: null,
    }));
    
    onSizesChange(tailwindSizes);
  };

  return (
    <div className="space-y-1">
      {/* Load Tailwind Presets Button */}
      {sizes.length === 0 && (
        <div className="p-4 space-y-3 text-center">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Tailwind CSS Font Size Scale</h3>
            <p className="text-xs text-muted-foreground">
              Start with the complete Tailwind CSS font size scale (text-xs to text-9xl) with proper line heights.
            </p>
          </div>
          <Button
            onClick={handleLoadTailwindPresets}
            disabled={availableStyles.length === 0}
            className="cursor-default"
          >
            Load Tailwind Presets
          </Button>
          {availableStyles.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Select a font family first to enable presets
            </p>
          )}
        </div>
      )}

      {/* Manual Sizes Component */}
      {sizes.length > 0 && (
        <>
          <div className="px-4 py-2 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Tailwind CSS Font Sizes</h3>
                <p className="text-xs text-muted-foreground">
                  Based on Tailwind's font size scale. Customize as needed.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadTailwindPresets}
                disabled={availableStyles.length === 0}
                className="cursor-default"
              >
                Reset to Presets
              </Button>
            </div>
          </div>
          
          <ManualSizes
            sizes={sizes}
            onSizesChange={onSizesChange}
            availableStyles={availableStyles}
            defaultRatio={1.2}
            editingId={editingId}
            onEditingIdChange={setEditingId}
          />
        </>
      )}
      
      {error && !editingId && <p className="text-xs text-red-600 px-4">{error}</p>}
    </div>
  );
}
