import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../../../components/ui/label";
import { FormField } from "../../../components/ui/form-field";
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
import { Plus, X, Check, ChevronsUpDown } from "lucide-react";
import { VariableSelector } from "./variable-selector";
import { cn } from "@/lib/utils";

export interface SizeEntry {
  id: string;
  name: string;
  size: number;
  lineHeight: number;
  letterSpacing: number;
  styles: string[]; // Add styles to each size
  // Optional variable binding only for size
  sizeVariable?: Variable | null;
}

interface Variable {
  id: string;
  name: string;
  resolvedType: string;
  description?: string;
  collectionName?: string;
  resolvedValue?: string | number;
}

interface ManualSizesProps {
  sizes: SizeEntry[];
  onSizesChange: (sizes: SizeEntry[]) => void;
  availableStyles: string[]; // Available styles from font family/variable
  defaultRatio?: number;
  className?: string;
}

// Helper function to get human-readable type
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

export function ManualSizes({
  sizes,
  onSizesChange,
  availableStyles,
  defaultRatio = 1.2,
  className,
}: ManualSizesProps) {
  const addManualSize = () => {
    const newIndex = sizes.length + 1;
    const newId = newIndex.toString();
    const prevSize = sizes[sizes.length - 1];

    // Use previous size as reference, or defaults
    const baseSize = prevSize ? prevSize.size : 10;
    const baseLineHeight = prevSize ? prevSize.lineHeight : 1.4;
    const baseLetterSpacing = prevSize ? prevSize.letterSpacing : 0;
    const baseStyles = prevSize ? prevSize.styles : availableStyles.slice(0, 1); // Default to first style

    const newSize = {
      id: newId,
      name: newIndex.toString(), // Default to number only
      size: Math.round(baseSize * defaultRatio),
      lineHeight: baseLineHeight, // Copy from previous
      letterSpacing: baseLetterSpacing, // Copy from previous
      styles: baseStyles, // Copy from previous or default
      sizeVariable: null,
    };

    const newSizes = [...sizes, newSize];
    onSizesChange(newSizes);
  };

  const removeManualSize = (id: string) => {
    if (sizes.length > 1) {
      const newSizes = sizes.filter((size) => size.id !== id);
      onSizesChange(newSizes);
    }
  };

  const updateManualSize = (
    id: string,
    field:
      | "name"
      | "size"
      | "lineHeight"
      | "letterSpacing"
      | "styles"
      | "sizeVariable",
    value: string | number | string[] | Variable | null
  ) => {
    const newSizes = sizes.map((size) =>
      size.id === id ? { ...size, [field]: value } : size
    );
    onSizesChange(newSizes);
  };

  const handleStyleToggle = (sizeId: string, styleValue: string) => {
    const size = sizes.find((s) => s.id === sizeId);
    if (!size) return;

    const newStyles = size.styles.includes(styleValue)
      ? size.styles.filter((s) => s !== styleValue)
      : [...size.styles, styleValue];

    updateManualSize(sizeId, "styles", newStyles);
  };

  const getStylesDisplayText = (styles: string[]) => {
    if (styles.length === 0) return "Select styles...";
    if (styles.length === availableStyles.length && availableStyles.length > 0)
      return "All styles";
    if (styles.length === 1) {
      return styles[0];
    }
    return `${styles.length} styles selected`;
  };

  return (
    <div className={cn(className)}>
      <div className="p-4">
        <FormField label="Manual Sizes">
          <div className="space-y-3">
            {sizes.map((sizeEntry) => (
              <div
                key={sizeEntry.id}
                className="p-4 space-y-4 border rounded-lg border-border"
              >
                {/* Name Field - Full Width */}
                <FormField label="Name">
                  <Input
                    placeholder="1"
                    value={sizeEntry.name}
                    onChange={(e) =>
                      updateManualSize(sizeEntry.id, "name", e.target.value)
                    }
                  />
                </FormField>

                {/* Styles Multi-Select - Full Width */}
                <FormField label="Styles">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={availableStyles.length === 0}
                        className={cn(
                          "justify-between w-full cursor-default",
                          availableStyles.length === 0 && "opacity-50"
                        )}
                      >
                        {availableStyles.length === 0
                          ? "No styles available"
                          : getStylesDisplayText(sizeEntry.styles)}
                        <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <div className="flex items-center justify-between p-2 border-b">
                          <span className="text-sm font-medium">
                            Select Styles
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs cursor-default"
                              onClick={() => {
                                const allSelected =
                                  sizeEntry.styles.length ===
                                  availableStyles.length;
                                updateManualSize(
                                  sizeEntry.id,
                                  "styles",
                                  allSelected ? [] : [...availableStyles]
                                );
                              }}
                            >
                              {sizeEntry.styles.length ===
                              availableStyles.length
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
                                onSelect={() =>
                                  handleStyleToggle(sizeEntry.id, style)
                                }
                                className="cursor-default"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    sizeEntry.styles.includes(style)
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

                {/* 2-Column Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Size with Variable Selector */}
                  <FormField label="Size">
                    <div className="flex items-stretch">
                      <div className="relative flex-1">
                        <Input
                          type="text"
                          placeholder="10"
                          value={
                            sizeEntry.sizeVariable
                              ? "" // Empty when variable is selected, we'll show it differently
                              : sizeEntry.size
                          }
                          onChange={(e) =>
                            updateManualSize(
                              sizeEntry.id,
                              "size",
                              parseInt(e.target.value) || 0
                            )
                          }
                          disabled={!!sizeEntry.sizeVariable}
                          readOnly={!!sizeEntry.sizeVariable}
                          className="border-r rounded-r-none"
                        />
                        {/* Variable display overlay */}
                        {sizeEntry.sizeVariable && (
                          <div className="absolute inset-[2px] flex items-center px-3 pointer-events-none bg-background rounded-sm">
                            <div className="flex items-center flex-1 min-w-0 gap-2">
                              <span className="text-sm font-medium truncate text-foreground">
                                {sizeEntry.sizeVariable.name}
                              </span>
                              <span className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground shrink-0">
                                {getTypeLabel(
                                  sizeEntry.sizeVariable.resolvedType
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                        {!sizeEntry.sizeVariable && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <span className="text-xs text-muted-foreground">
                              px
                            </span>
                          </div>
                        )}
                      </div>
                      <VariableSelector
                        selectedVariable={sizeEntry.sizeVariable}
                        onVariableSelect={(variable) =>
                          updateManualSize(
                            sizeEntry.id,
                            "sizeVariable",
                            variable
                          )
                        }
                        onUnlink={() =>
                          updateManualSize(sizeEntry.id, "sizeVariable", null)
                        }
                        allowedTypes={["FLOAT"]}
                        className="border-l-0 rounded-l-none"
                        width={300}
                      />
                    </div>
                  </FormField>

                  {/* Line Height */}
                  <FormField label="Line Height">
                    <Input
                      type="text"
                      placeholder="1.4"
                      value={sizeEntry.lineHeight}
                      onChange={(e) =>
                        updateManualSize(
                          sizeEntry.id,
                          "lineHeight",
                          parseFloat(e.target.value) || 1.4
                        )
                      }
                    />
                  </FormField>

                  {/* Letter Spacing */}
                  <FormField label="Letter Spacing">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="0"
                        value={sizeEntry.letterSpacing}
                        onChange={(e) =>
                          updateManualSize(
                            sizeEntry.id,
                            "letterSpacing",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="pr-8"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  </FormField>

                  {/* Delete Button - Spans both columns */}
                  <div className="flex justify-end col-span-2">
                    {sizes.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeManualSize(sizeEntry.id)}
                        className="px-2"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={addManualSize}
              className="w-full"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Size
            </Button>
          </div>
        </FormField>
      </div>
    </div>
  );
}
