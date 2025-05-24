import * as React from "react";
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
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StylesSelectorProps {
  selectedStyles: string[];
  availableStyles: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleStyle: (style: string) => void;
  onSetAllStyles: (styles: string[]) => void;
  error?: string;
  fontSource?: "type" | "variable";
  selectedFontFamily?: string;
  selectedVariable?: any;
}

export function StylesSelector({
  selectedStyles,
  availableStyles,
  isOpen,
  onOpenChange,
  onToggleStyle,
  onSetAllStyles,
  error,
  fontSource,
  selectedFontFamily,
  selectedVariable,
}: StylesSelectorProps) {
  const getStylesDisplayText = () => {
    if (selectedStyles.length === 0) return "Select styles...";
    if (
      selectedStyles.length === availableStyles.length &&
      availableStyles.length > 0
    )
      return "All styles";
    if (selectedStyles.length === 1) {
      return selectedStyles[0];
    }
    return `${selectedStyles.length} styles selected`;
  };

  const handleToggleAllStyles = () => {
    if (selectedStyles.length === availableStyles.length) {
      // All are selected, so clear them
      onSetAllStyles([]);
    } else {
      // Not all are selected, so select all
      onSetAllStyles([...availableStyles]);
    }
  };

  const getAllClearStylesButtonText = () => {
    return selectedStyles.length === availableStyles.length ? "Clear" : "All";
  };

  return (
    <div className="space-y-1">
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            disabled={
              (!selectedFontFamily && fontSource === "type") ||
              (!selectedVariable && fontSource === "variable") ||
              availableStyles.length === 0
            }
            className={cn(
              "justify-between w-full cursor-default",
              ((!selectedFontFamily && fontSource === "type") ||
                (!selectedVariable && fontSource === "variable") ||
                availableStyles.length === 0) &&
                "opacity-50",
              error && "border-red-500"
            )}
          >
            {fontSource === "type" && !selectedFontFamily
              ? "Select font family first..."
              : fontSource === "variable" && !selectedVariable
              ? "Select variable first..."
              : availableStyles.length === 0
              ? "No styles available"
              : getStylesDisplayText()}
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
                  onClick={handleToggleAllStyles}
                >
                  {getAllClearStylesButtonText()}
                </Button>
              </div>
            </div>
            <CommandList className="max-h-[200px] overflow-auto">
              <CommandGroup>
                {availableStyles.map((style) => (
                  <CommandItem
                    key={style}
                    onSelect={() => onToggleStyle(style)}
                    className="cursor-default"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedStyles.includes(style)
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
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
