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
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Check, ChevronsUpDown } from "lucide-react";
import { VariableSelector } from "./variable-selector";
import { cn } from "@/lib/utils";
import {
  formatLineHeightForDisplay,
  lineHeightFromPercentage,
  lineHeightToPercentage,
} from "@/lib/utils/typography";
import type {
  ScaleRatioOption,
  ValidationErrors,
  Variable,
} from "@/lib/types/typography";

interface TypographySettingsProps {
  initialSize: number;
  steps: number;
  lineHeight: number;
  letterSpacing: number;
  scaleRatio: number;
  selectedStyles: string[];
  availableStyles: string[];
  lineHeightVariable?: Variable | null;
  letterSpacingVariable?: Variable | null;
  onInitialSizeChange: (value: number) => void;
  onStepsChange: (value: number) => void;
  onLineHeightChange: (value: number) => void;
  onLetterSpacingChange: (value: number) => void;
  onScaleRatioChange: (value: number) => void;
  onToggleStyle: (style: string) => void;
  onSetAllStyles: (styles: string[]) => void;
  onLineHeightVariableSelect: (variable: Variable | null) => void;
  onLetterSpacingVariableSelect: (variable: Variable | null) => void;
  ratioOptions: ScaleRatioOption[];
  isRatioOpen: boolean;
  onRatioOpenChange: (open: boolean) => void;
  isStylesOpen: boolean;
  onStylesOpenChange: (open: boolean) => void;
  errors: ValidationErrors;
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

export function TypographySettings({
  initialSize,
  steps,
  lineHeight,
  letterSpacing,
  scaleRatio,
  selectedStyles,
  availableStyles,
  lineHeightVariable,
  letterSpacingVariable,
  onInitialSizeChange,
  onStepsChange,
  onLineHeightChange,
  onLetterSpacingChange,
  onScaleRatioChange,
  onToggleStyle,
  onSetAllStyles,
  onLineHeightVariableSelect,
  onLetterSpacingVariableSelect,
  ratioOptions,
  isRatioOpen,
  onRatioOpenChange,
  isStylesOpen,
  onStylesOpenChange,
  errors,
}: TypographySettingsProps) {
  // Local state for input values to allow typing intermediate states
  const [lineHeightInput, setLineHeightInput] = React.useState(
    formatLineHeightForDisplay(lineHeight)
  );
  const [letterSpacingInput, setLetterSpacingInput] = React.useState(
    letterSpacing === 0 ? "" : letterSpacing.toString()
  );

  // Update local state when props change (e.g., when switching between styles)
  React.useEffect(() => {
    setLineHeightInput(formatLineHeightForDisplay(lineHeight));
  }, [lineHeight]);

  React.useEffect(() => {
    setLetterSpacingInput(letterSpacing === 0 ? "" : letterSpacing.toString());
  }, [letterSpacing]);

  const getRatioDisplayText = () => {
    const ratio = ratioOptions.find((r) => r.value === scaleRatio.toString());
    return ratio?.label || "Select ratio...";
  };

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

  const handleRatioSelect = (ratioValue: string) => {
    onScaleRatioChange(parseFloat(ratioValue));
    onRatioOpenChange(false);
  };

  const handleInitialSizeChange = (value: string) => {
    const num = parseInt(value);
    if (value.trim() && !isNaN(num) && num > 0) {
      onInitialSizeChange(num);
    }
  };

  const handleStepsChange = (value: string) => {
    const num = parseInt(value);
    if (value.trim() && !isNaN(num) && num > 0) {
      onStepsChange(num);
    }
  };

  const handleLineHeightChange = (value: string) => {
    setLineHeightInput(value);

    // Only update parent state if it's a valid number
    if (value.trim() && value !== "-" && value !== ".") {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        onLineHeightChange(num);
      }
    }
  };

  const handleLetterSpacingChange = (value: string) => {
    setLetterSpacingInput(value);

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
      onLetterSpacingChange(num);
    }
  };

  const handleLineHeightBlur = () => {
    // On blur, ensure we have a valid value or reset to the prop value
    if (
      lineHeightInput.trim() === "" ||
      lineHeightInput === "-" ||
      lineHeightInput === "."
    ) {
      setLineHeightInput(formatLineHeightForDisplay(lineHeight));
    } else {
      const num = parseFloat(lineHeightInput);
      if (isNaN(num)) {
        setLineHeightInput(formatLineHeightForDisplay(lineHeight));
      }
    }
  };

  const handleLetterSpacingBlur = () => {
    // On blur, ensure we have a valid value or reset to the prop value
    const isEmpty = letterSpacingInput.trim() === "";
    const isJustMinus = letterSpacingInput === "-";
    const isJustDot = letterSpacingInput === ".";
    const isMinusDot = letterSpacingInput === "-.";
    const isMinusZero = letterSpacingInput === "-0";
    const isMinusZeroDot = letterSpacingInput === "-0.";

    if (
      isEmpty ||
      isJustMinus ||
      isJustDot ||
      isMinusDot ||
      isMinusZero ||
      isMinusZeroDot
    ) {
      setLetterSpacingInput(
        letterSpacing === 0 ? "" : letterSpacing.toString()
      );
    } else {
      const num = parseFloat(letterSpacingInput);
      if (isNaN(num)) {
        setLetterSpacingInput(
          letterSpacing === 0 ? "" : letterSpacing.toString()
        );
      }
    }
  };

  return (
    <div className="grid items-end grid-cols-2 gap-x-4 gap-y-6">
      {/* Row 1: Initial Size and Styles */}
      <FormField label="Initial Size">
        <div className="space-y-1">
          <div className="relative">
            <Input
              type="text"
              placeholder="12"
              value={initialSize.toString()}
              onChange={(e) => handleInitialSizeChange(e.target.value)}
              className={cn("pr-8", errors.initialSize && "border-red-500")}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-sm text-muted-foreground">px</span>
            </div>
          </div>
          {errors.initialSize && (
            <p className="text-xs text-red-600">{errors.initialSize}</p>
          )}
        </div>
      </FormField>

      <FormField label="Styles">
        <div className="space-y-1">
          <Popover open={isStylesOpen} onOpenChange={onStylesOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                disabled={availableStyles.length === 0}
                className={cn(
                  "justify-between w-full cursor-default",
                  availableStyles.length === 0 && "opacity-50",
                  errors.styles && "border-red-500"
                )}
              >
                {availableStyles.length === 0
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
                      onClick={() => {
                        const allSelected =
                          selectedStyles.length === availableStyles.length;
                        onSetAllStyles(allSelected ? [] : [...availableStyles]);
                      }}
                    >
                      {selectedStyles.length === availableStyles.length
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
          {errors.styles && (
            <p className="text-xs text-red-600">{errors.styles}</p>
          )}
        </div>
      </FormField>

      {/* Row 2: Line Height and Letter Spacing */}
      <FormField label="Line Height">
        <div className="space-y-1">
          <div className="flex items-stretch">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="120"
                value={lineHeightVariable ? "" : lineHeightInput}
                onChange={(e) => handleLineHeightChange(e.target.value)}
                onBlur={handleLineHeightBlur}
                disabled={!!lineHeightVariable}
                readOnly={!!lineHeightVariable}
                className={cn(
                  "border-r rounded-r-none",
                  errors.lineHeight && "border-red-500"
                )}
              />
              {/* Variable display overlay */}
              {lineHeightVariable && (
                <div className="absolute inset-[2px] flex items-center px-2 pointer-events-none bg-background rounded-sm">
                  <div className="flex items-center flex-1 min-w-0 gap-1">
                    <span className="text-xs font-medium truncate text-foreground">
                      {lineHeightVariable.name}
                    </span>
                    <span className="px-1 py-0.5 text-xs rounded bg-muted text-muted-foreground shrink-0">
                      {getTypeLabel(lineHeightVariable.resolvedType)}
                    </span>
                  </div>
                </div>
              )}
              {!lineHeightVariable && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              )}
            </div>
            <VariableSelector
              selectedVariable={lineHeightVariable}
              onVariableSelect={onLineHeightVariableSelect}
              onUnlink={() => onLineHeightVariableSelect(null)}
              allowedTypes={["FLOAT"]}
              className="border-l-0 rounded-l-none"
              width={300}
            />
          </div>
          {errors.lineHeight && (
            <p className="text-xs text-red-600">{errors.lineHeight}</p>
          )}
        </div>
      </FormField>

      <FormField label="Letter Spacing">
        <div className="space-y-1">
          <div className="flex items-stretch">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="0"
                value={letterSpacingVariable ? "" : letterSpacingInput}
                onChange={(e) => handleLetterSpacingChange(e.target.value)}
                onBlur={handleLetterSpacingBlur}
                disabled={!!letterSpacingVariable}
                readOnly={!!letterSpacingVariable}
                className={cn(
                  "border-r rounded-r-none",
                  errors.letterSpacing && "border-red-500"
                )}
              />
              {/* Variable display overlay */}
              {letterSpacingVariable && (
                <div className="absolute inset-[2px] flex items-center px-2 pointer-events-none bg-background rounded-sm">
                  <div className="flex items-center flex-1 min-w-0 gap-1">
                    <span className="text-xs font-medium truncate text-foreground">
                      {letterSpacingVariable.name}
                    </span>
                    <span className="px-1 py-0.5 text-xs rounded bg-muted text-muted-foreground shrink-0">
                      {getTypeLabel(letterSpacingVariable.resolvedType)}
                    </span>
                  </div>
                </div>
              )}
              {!letterSpacingVariable && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              )}
            </div>
            <VariableSelector
              selectedVariable={letterSpacingVariable}
              onVariableSelect={onLetterSpacingVariableSelect}
              onUnlink={() => onLetterSpacingVariableSelect(null)}
              allowedTypes={["FLOAT"]}
              className="border-l-0 rounded-l-none"
              width={300}
            />
          </div>
          {errors.letterSpacing && (
            <p className="text-xs text-red-600">{errors.letterSpacing}</p>
          )}
        </div>
      </FormField>

      {/* Row 3: Scale Ratio and Steps */}
      <FormField label="Scale Ratio">
        <div className="space-y-1">
          <Popover open={isRatioOpen} onOpenChange={onRatioOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isRatioOpen}
                className={cn(
                  "justify-between w-full cursor-default",
                  errors.scaleRatio && "border-red-500"
                )}
              >
                {getRatioDisplayText()}
                <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandList className="max-h-[200px] overflow-auto">
                  <CommandGroup>
                    {ratioOptions.map((ratio) => (
                      <CommandItem
                        key={ratio.value}
                        onSelect={() => handleRatioSelect(ratio.value)}
                        className="cursor-default"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            scaleRatio.toString() === ratio.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <span>{ratio.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.scaleRatio && (
            <p className="text-xs text-red-600">{errors.scaleRatio}</p>
          )}
        </div>
      </FormField>

      <FormField label="Steps">
        <div className="space-y-1">
          <Input
            type="text"
            placeholder="9"
            value={steps.toString()}
            onChange={(e) => handleStepsChange(e.target.value)}
            className={cn("w-full", errors.steps && "border-red-500")}
          />
          {errors.steps && (
            <p className="text-xs text-red-600">{errors.steps}</p>
          )}
        </div>
      </FormField>
    </div>
  );
}
