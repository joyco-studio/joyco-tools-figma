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
import {
  Plus,
  X,
  Check,
  ChevronsUpDown,
  Hash,
  Pencil,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { VariableSelector } from "./variable-selector";
import { AutoResizeInput } from "./auto-resize-input";
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
  editingId?: string | null;
  onEditingIdChange?: (id: string | null) => void;
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
  editingId,
  onEditingIdChange,
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

  const handleNameSubmit = (id: string) => {
    onEditingIdChange?.(null);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") handleNameSubmit(id);
    if (e.key === "Escape") onEditingIdChange?.(null);
  };

  const moveManualSize = (id: string, direction: "up" | "down") => {
    const currentIndex = sizes.findIndex((size) => size.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sizes.length) return;

    const newSizes = [...sizes];
    [newSizes[currentIndex], newSizes[newIndex]] = [
      newSizes[newIndex],
      newSizes[currentIndex],
    ];
    onSizesChange(newSizes);
  };

  return (
    <div className={cn(className)}>
      <div className="">
        {sizes.map((sizeEntry) => (
          <div
            key={sizeEntry.id}
            className="border-b border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
          >
            {/* Compact Header */}
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="flex items-center flex-1 gap-2">
                <div className="relative flex-1">
                  {editingId === sizeEntry.id ? (
                    <AutoResizeInput
                      value={sizeEntry.name}
                      onValueChange={(value) =>
                        updateManualSize(sizeEntry.id, "name", value)
                      }
                      onBlur={() => handleNameSubmit(sizeEntry.id)}
                      onKeyDown={(e) => handleNameKeyDown(e, sizeEntry.id)}
                      className="h-6 px-2 py-1 text-sm font-medium"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => onEditingIdChange?.(sizeEntry.id)}
                      className="flex items-center h-6 px-2 py-1 text-sm font-medium text-left rounded-md cursor-default text-foreground/50 hover:text-foreground/80 focus:outline-none focus:text-foreground/80 hover:bg-muted/50"
                    >
                      <span>{sizeEntry.name}</span>
                      <span className="ml-1">
                        <Pencil className="size-3 opacity-60" />
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveManualSize(sizeEntry.id, "up")}
                  disabled={sizes.findIndex((s) => s.id === sizeEntry.id) === 0}
                  className="h-6 px-1 cursor-default text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ChevronUp className="size-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveManualSize(sizeEntry.id, "down")}
                  disabled={
                    sizes.findIndex((s) => s.id === sizeEntry.id) ===
                    sizes.length - 1
                  }
                  className="h-6 px-1 cursor-default text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ChevronDown className="size-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeManualSize(sizeEntry.id)}
                  disabled={sizes.length <= 1}
                  className="h-6 px-2 cursor-default text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent"
                  title="Remove size"
                >
                  <X className="size-3" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3 border-t border-border">
              {/* First Row: Size and Styles */}
              <div className="grid grid-cols-2 gap-3">
                {/* Size with Variable Selector */}
                <FormField label="Size" size="sm">
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
                        className="h-8 border-r rounded-r-none"
                      />
                      {/* Variable display overlay */}
                      {sizeEntry.sizeVariable && (
                        <div className="absolute inset-[2px] flex items-center px-2 pointer-events-none bg-background rounded-sm">
                          <div className="flex items-center flex-1 min-w-0 gap-1">
                            <span className="text-xs font-medium truncate text-foreground">
                              {sizeEntry.sizeVariable.name}
                            </span>
                            <span className="px-1 py-0.5 text-xs rounded bg-muted text-muted-foreground shrink-0">
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
                        updateManualSize(sizeEntry.id, "sizeVariable", variable)
                      }
                      onUnlink={() =>
                        updateManualSize(sizeEntry.id, "sizeVariable", null)
                      }
                      allowedTypes={["FLOAT"]}
                      className="h-8 border-l-0 rounded-l-none"
                      width={300}
                    />
                  </div>
                </FormField>

                {/* Styles Multi-Select */}
                <FormField label="Styles" size="sm">
                  <Popover>
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
              </div>

              {/* Second Row: Line Height and Letter Spacing */}
              <div className="grid grid-cols-2 gap-3">
                {/* Line Height */}
                <FormField label="Line Height" size="sm">
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
                    className="h-8"
                  />
                </FormField>

                {/* Letter Spacing */}
                <FormField label="Letter Spacing" size="sm">
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
                      className="h-8 pr-6"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                </FormField>
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          size="lg"
          onClick={addManualSize}
          className="w-full h-8 border-none rounded-none bg-muted/50 hover:bg-muted"
        >
          <Plus className="w-3 h-3 mr-2" />
          Add Size
        </Button>
      </div>
    </div>
  );
}
