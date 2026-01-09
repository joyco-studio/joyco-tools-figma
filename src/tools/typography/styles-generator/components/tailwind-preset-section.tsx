import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormField } from "@/components/ui/form-field";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [globalStyles, setGlobalStyles] = React.useState<string[]>([]);
  const [isStylesOpen, setIsStylesOpen] = React.useState(false);

  // Initialize global styles from first size entry if available
  React.useEffect(() => {
    if (sizes.length > 0 && globalStyles.length === 0) {
      setGlobalStyles(sizes[0].styles || availableStyles.slice(0, 1));
    }
  }, [sizes, availableStyles, globalStyles.length]);

  // Initialize with Tailwind presets if sizes are empty
  React.useEffect(() => {
    if (sizes.length === 0 && availableStyles.length > 0 && !isInitialized) {
      const defaultStyles = availableStyles.slice(0, 1);
      const tailwindSizes: SizeEntry[] = TAILWIND_PRESETS.map((preset, index) => ({
        ...preset,
        id: (index + 1).toString(),
        styles: defaultStyles,
        sizeVariable: null,
        lineHeightVariable: null,
        letterSpacingVariable: null,
      }));
      
      setGlobalStyles(defaultStyles);
      onSizesChange(tailwindSizes);
      setIsInitialized(true);
    }
  }, [sizes.length, availableStyles, onSizesChange, isInitialized]);

  const handleLoadTailwindPresets = () => {
    if (availableStyles.length === 0) return;
    
    const defaultStyles = globalStyles.length > 0 ? globalStyles : availableStyles.slice(0, 1);
    const tailwindSizes: SizeEntry[] = TAILWIND_PRESETS.map((preset, index) => ({
      ...preset,
      id: (index + 1).toString(),
      styles: defaultStyles,
      sizeVariable: null,
      lineHeightVariable: null,
      letterSpacingVariable: null,
    }));
    
    onSizesChange(tailwindSizes);
  };

  const handleGlobalStyleToggle = (style: string) => {
    const newGlobalStyles = globalStyles.includes(style)
      ? globalStyles.filter((s) => s !== style)
      : [...globalStyles, style];
    
    setGlobalStyles(newGlobalStyles);
    
    // Apply to all sizes
    const updatedSizes = sizes.map((size) => ({
      ...size,
      styles: newGlobalStyles,
    }));
    onSizesChange(updatedSizes);
  };

  const handleSetAllGlobalStyles = (styles: string[]) => {
    setGlobalStyles(styles);
    
    // Apply to all sizes
    const updatedSizes = sizes.map((size) => ({
      ...size,
      styles: styles,
    }));
    onSizesChange(updatedSizes);
  };

  const getGlobalStylesDisplayText = () => {
    if (globalStyles.length === 0) return "Select styles...";
    if (globalStyles.length === availableStyles.length && availableStyles.length > 0)
      return "All styles";
    if (globalStyles.length === 1) {
      return globalStyles[0];
    }
    return `${globalStyles.length} styles selected`;
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
          <div className="px-4 py-3 space-y-4 border-b border-border">
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
            
            {/* Global Styles Selector */}
            <FormField label="Font Styles (applies to all sizes)" size="sm">
              <Popover open={isStylesOpen} onOpenChange={setIsStylesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={availableStyles.length === 0}
                    className={cn(
                      "justify-between w-full cursor-default h-8",
                      availableStyles.length === 0 && "opacity-50"
                    )}
                  >
                    {availableStyles.length === 0
                      ? "No styles available"
                      : getGlobalStylesDisplayText()}
                    <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <div className="flex items-center justify-between p-2 border-b">
                      <span className="text-sm font-medium">Select Styles</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs cursor-default"
                          onClick={() => {
                            const allSelected =
                              globalStyles.length === availableStyles.length;
                            handleSetAllGlobalStyles(
                              allSelected ? [] : [...availableStyles]
                            );
                          }}
                        >
                          {globalStyles.length === availableStyles.length
                            ? "Clear"
                            : "All"}
                        </Button>
                      </div>
                    </div>
                    <CommandList className="max-h-[200px] overflow-auto">
                      <CommandGroup>
                        {availableStyles.map((style) => (
                          <CommandItem
                            key={style}
                            onSelect={() => handleGlobalStyleToggle(style)}
                            className="cursor-default"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                globalStyles.includes(style)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span>{style}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormField>
          </div>
          
          <ManualSizes
            sizes={sizes}
            onSizesChange={onSizesChange}
            availableStyles={availableStyles}
            defaultRatio={1.2}
            editingId={editingId}
            onEditingIdChange={setEditingId}
            hideStylesColumn
          />
        </>
      )}
      
      {error && !editingId && <p className="text-xs text-red-600 px-4">{error}</p>}
    </div>
  );
}
