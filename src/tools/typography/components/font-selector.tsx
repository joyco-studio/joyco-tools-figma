import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
import { VariableSelector } from "./variable-selector";
import type { Font, Variable } from "../../../lib/types/typography";

const getTypeLabel = (resolvedType: string) => {
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
};

interface FontSelectorProps {
  value: string;
  selectedVariable: Variable | null;
  searchQuery: string;
  fonts: Font[];
  isLoading: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSearchChange: (query: string) => void;
  onFontSelect: (fontFamily: string) => void;
  onVariableSelect: (variable: Variable) => void;
  onVariableUnlink: () => void;
}

export function FontSelector({
  value,
  selectedVariable,
  searchQuery,
  fonts,
  isLoading,
  isOpen,
  onOpenChange,
  onSearchChange,
  onFontSelect,
  onVariableSelect,
  onVariableUnlink,
}: FontSelectorProps) {
  const handleSelect = (currentValue: string) => {
    const trimmedValue = currentValue.trim();
    onFontSelect(trimmedValue);
    onOpenChange(false);
  };

  return (
    <div className="flex">
      {/* Font Family Input */}
      <div className="flex-1">
        <Popover open={isOpen} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="justify-between w-full border-r rounded-r-none cursor-default"
              disabled={isLoading}
            >
              <div className="flex items-center flex-1 min-w-0 gap-2">
                {selectedVariable ? (
                  <>
                    <span className="text-sm font-medium truncate">
                      {selectedVariable.name}
                    </span>
                    <span className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground shrink-0">
                      {getTypeLabel(selectedVariable.resolvedType)}
                    </span>
                  </>
                ) : (
                  <span className="truncate">
                    {value ? value : "Select font..."}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search font..."
                value={searchQuery}
                onValueChange={onSearchChange}
                className="focus:outline-none focus:ring-0"
              />
              <CommandList className="max-h-[300px] overflow-auto">
                <CommandEmpty>
                  {searchQuery
                    ? "No matching fonts found."
                    : "No fonts available."}
                </CommandEmpty>
                <CommandGroup>
                  {fonts.map((font, index) => {
                    const fontValue = font.family.trim();
                    const isSelected = value?.trim() === fontValue;

                    return (
                      <CommandItem
                        key={`${font.family}-${font.styles.join(",")}`}
                        value={fontValue}
                        onSelect={handleSelect}
                        className={cn("cursor-default")}
                      >
                        <div className="flex items-center w-4 mr-2">
                          {isSelected && (
                            <Check className="w-4 h-4 text-foreground" />
                          )}
                        </div>
                        <span>{font.family.trim()}</span>
                      </CommandItem>
                    );
                  })}
                  {!searchQuery && fonts.length > 100 && (
                    <div className="px-2 py-1 text-xs text-center border-t text-muted-foreground">
                      Showing first 100 fonts. Use search to find more.
                    </div>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Variable Selector Button */}
      <VariableSelector
        selectedVariable={selectedVariable}
        onVariableSelect={onVariableSelect}
        onUnlink={onVariableUnlink}
        allowedTypes={["STRING"]}
        className="border-l-0 rounded-l-none"
      />
    </div>
  );
}
