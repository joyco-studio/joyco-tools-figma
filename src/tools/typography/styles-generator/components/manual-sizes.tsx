import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
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
import { TextCaseToggle } from "./text-case-toggle";
import { cn } from "@/lib/utils";
import { formatLineHeightForDisplay } from "@/lib/utils/typography";
import type { TextCase } from "@/lib/types/typography";

export interface SizeEntry {
  id: string;
  name: string;
  size: number;
  lineHeight: number;
  letterSpacing: number;
  styles: string[]; // Add styles to each size
  // Optional variable binding for all numeric fields
  sizeVariable?: Variable | null;
  lineHeightVariable?: Variable | null;
  letterSpacingVariable?: Variable | null;
  textCase?: TextCase;
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
  // Local state for input values to allow typing intermediate states
  const [inputValues, setInputValues] = React.useState<{
    [sizeId: string]: {
      lineHeight: string;
      letterSpacing: string;
    };
  }>({});

  // Initialize input values when sizes change
  React.useEffect(() => {
    const newInputValues: typeof inputValues = {};
    sizes.forEach((size) => {
      newInputValues[size.id] = {
        lineHeight: formatLineHeightForDisplay(size.lineHeight),
        letterSpacing:
          size.letterSpacing === 0 ? "" : size.letterSpacing.toString(),
      };
    });
    setInputValues(newInputValues);
  }, [sizes.length]); // Only re-initialize when sizes array length changes

  const addManualSize = () => {
    const newIndex = sizes.length + 1;
    const newId = newIndex.toString();
    const prevSize = sizes[sizes.length - 1];

    // Use previous size as reference, or defaults
    const baseSize = prevSize ? prevSize.size : 10;
    const baseLineHeight = prevSize ? prevSize.lineHeight : 1.2;
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
      lineHeightVariable: null,
      letterSpacingVariable: null,
      textCase: prevSize ? prevSize.textCase : "TITLE",
    };

    const newSizes = [...sizes, newSize];
    onSizesChange(newSizes);
  };

  const removeManualSize = (id: string) => {
    if (sizes.length > 1) {
      const newSizes = sizes.filter((size) => size.id !== id);
      onSizesChange(newSizes);

      // Clean up input values for removed size
      setInputValues((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
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
      | "sizeVariable"
      | "lineHeightVariable"
      | "letterSpacingVariable"
      | "textCase",
    value: string | number | string[] | Variable | null | TextCase
  ) => {
    const newSizes = sizes.map((size) =>
      size.id === id ? { ...size, [field]: value } : size
    );
    onSizesChange(newSizes);
  };

  const handleLineHeightChange = (sizeId: string, value: string) => {
    // Update local input state
    setInputValues((prev) => ({
      ...prev,
      [sizeId]: {
        ...prev[sizeId],
        lineHeight: value,
      },
    }));

    // Only update parent state if it's a valid number
    if (value.trim() && value !== "-" && value !== ".") {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        updateManualSize(sizeId, "lineHeight", num);
      }
    }
  };

  const handleLetterSpacingChange = (sizeId: string, value: string) => {
    // Update local input state
    setInputValues((prev) => ({
      ...prev,
      [sizeId]: {
        ...prev[sizeId],
        letterSpacing: value,
      },
    }));

    // Don't update parent state for intermediate/incomplete values
    const isEmpty = value.trim() === "";
    const isJustMinus = value === "-";
    const isJustDot = value === ".";
    const isMinusDot = value === "-.";
    const isMinusZero = value === "-0";
    const isMinusZeroDot = value === "-0.";

    // Skip parent update for these intermediate states
    if (
      isEmpty ||
      isJustMinus ||
      isJustDot ||
      isMinusDot ||
      isMinusZero ||
      isMinusZeroDot
    ) {
      return;
    }

    // Only update parent state if it's a valid complete number
    const num = parseFloat(value);
    if (!isNaN(num)) {
      updateManualSize(sizeId, "letterSpacing", num);
    }
  };

  const handleLineHeightBlur = (sizeId: string) => {
    const currentValue = inputValues[sizeId]?.lineHeight || "";
    const size = sizes.find((s) => s.id === sizeId);

    if (!size) return;

    // On blur, ensure we have a valid value or reset to the actual size value
    if (
      currentValue.trim() === "" ||
      currentValue === "-" ||
      currentValue === "."
    ) {
      setInputValues((prev) => ({
        ...prev,
        [sizeId]: {
          ...prev[sizeId],
          lineHeight: formatLineHeightForDisplay(size.lineHeight),
        },
      }));
    } else {
      const num = parseFloat(currentValue);
      if (isNaN(num)) {
        setInputValues((prev) => ({
          ...prev,
          [sizeId]: {
            ...prev[sizeId],
            lineHeight: formatLineHeightForDisplay(size.lineHeight),
          },
        }));
      }
    }
  };

  const handleLetterSpacingBlur = (sizeId: string) => {
    const currentValue = inputValues[sizeId]?.letterSpacing || "";
    const size = sizes.find((s) => s.id === sizeId);

    if (!size) return;

    // On blur, ensure we have a valid value or reset to the actual size value
    const isEmpty = currentValue.trim() === "";
    const isJustMinus = currentValue === "-";
    const isJustDot = currentValue === ".";
    const isMinusDot = currentValue === "-.";
    const isMinusZero = currentValue === "-0";
    const isMinusZeroDot = currentValue === "-0.";

    if (
      isEmpty ||
      isJustMinus ||
      isJustDot ||
      isMinusDot ||
      isMinusZero ||
      isMinusZeroDot
    ) {
      setInputValues((prev) => ({
        ...prev,
        [sizeId]: {
          ...prev[sizeId],
          letterSpacing:
            size.letterSpacing === 0 ? "" : size.letterSpacing.toString(),
        },
      }));
    } else {
      const num = parseFloat(currentValue);
      if (isNaN(num)) {
        setInputValues((prev) => ({
          ...prev,
          [sizeId]: {
            ...prev[sizeId],
            letterSpacing:
              size.letterSpacing === 0 ? "" : size.letterSpacing.toString(),
          },
        }));
      }
    }
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
                            e.target.value || 0
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
                  <div className="flex items-stretch">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="120"
                        value={
                          sizeEntry.lineHeightVariable
                            ? ""
                            : inputValues[sizeEntry.id]?.lineHeight || ""
                        }
                        onChange={(e) =>
                          handleLineHeightChange(sizeEntry.id, e.target.value)
                        }
                        onBlur={() => handleLineHeightBlur(sizeEntry.id)}
                        disabled={!!sizeEntry.lineHeightVariable}
                        readOnly={!!sizeEntry.lineHeightVariable}
                        className="h-8 border-r rounded-r-none"
                      />
                      {/* Variable display overlay */}
                      {sizeEntry.lineHeightVariable && (
                        <div className="absolute inset-[2px] flex items-center px-2 pointer-events-none bg-background rounded-sm">
                          <div className="flex items-center flex-1 min-w-0 gap-1">
                            <span className="text-xs font-medium truncate text-foreground">
                              {sizeEntry.lineHeightVariable.name}
                            </span>
                            <span className="px-1 py-0.5 text-xs rounded bg-muted text-muted-foreground shrink-0">
                              {getTypeLabel(
                                sizeEntry.lineHeightVariable.resolvedType
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                      {!sizeEntry.lineHeightVariable && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <span className="text-xs text-muted-foreground">
                            %
                          </span>
                        </div>
                      )}
                    </div>
                    <VariableSelector
                      selectedVariable={sizeEntry.lineHeightVariable}
                      onVariableSelect={(variable) =>
                        updateManualSize(
                          sizeEntry.id,
                          "lineHeightVariable",
                          variable
                        )
                      }
                      onUnlink={() =>
                        updateManualSize(
                          sizeEntry.id,
                          "lineHeightVariable",
                          null
                        )
                      }
                      allowedTypes={["FLOAT"]}
                      className="h-8 border-l-0 rounded-l-none"
                      width={300}
                    />
                  </div>
                </FormField>

                {/* Letter Spacing */}
                <FormField label="Letter Spacing" size="sm">
                  <div className="flex items-stretch">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="0"
                        value={
                          sizeEntry.letterSpacingVariable
                            ? ""
                            : inputValues[sizeEntry.id]?.letterSpacing || ""
                        }
                        onChange={(e) =>
                          handleLetterSpacingChange(
                            sizeEntry.id,
                            e.target.value
                          )
                        }
                        onBlur={() => handleLetterSpacingBlur(sizeEntry.id)}
                        disabled={!!sizeEntry.letterSpacingVariable}
                        readOnly={!!sizeEntry.letterSpacingVariable}
                        className="h-8 border-r rounded-r-none"
                      />
                      {/* Variable display overlay */}
                      {sizeEntry.letterSpacingVariable && (
                        <div className="absolute inset-[2px] flex items-center px-2 pointer-events-none bg-background rounded-sm">
                          <div className="flex items-center flex-1 min-w-0 gap-1">
                            <span className="text-xs font-medium truncate text-foreground">
                              {sizeEntry.letterSpacingVariable.name}
                            </span>
                            <span className="px-1 py-0.5 text-xs rounded bg-muted text-muted-foreground shrink-0">
                              {getTypeLabel(
                                sizeEntry.letterSpacingVariable.resolvedType
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                      {!sizeEntry.letterSpacingVariable && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <span className="text-xs text-muted-foreground">
                            %
                          </span>
                        </div>
                      )}
                    </div>
                    <VariableSelector
                      selectedVariable={sizeEntry.letterSpacingVariable}
                      onVariableSelect={(variable) =>
                        updateManualSize(
                          sizeEntry.id,
                          "letterSpacingVariable",
                          variable
                        )
                      }
                      onUnlink={() =>
                        updateManualSize(
                          sizeEntry.id,
                          "letterSpacingVariable",
                          null
                        )
                      }
                      allowedTypes={["FLOAT"]}
                      className="h-8 border-l-0 rounded-l-none"
                      width={300}
                    />
                  </div>
                </FormField>
              </div>

              {/* Third Row: Text Case */}
              <div className="grid grid-cols-1 gap-3">
                <FormField label="Text Case" size="sm">
                  <TextCaseToggle
                    value={sizeEntry.textCase || "ORIGINAL"}
                    onValueChange={(value) =>
                      updateManualSize(sizeEntry.id, "textCase", value)
                    }
                    size="sm"
                  />
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
