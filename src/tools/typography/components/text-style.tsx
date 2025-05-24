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
import { Input } from "@/components/ui/input";
import { Label } from "../../../components/ui/label";
import { FormField } from "../../../components/ui/form-field";
import { Switch } from "../../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Check,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Type,
  Pencil,
  Trash2,
  Hexagon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AutoResizeInput } from "./auto-resize-input";
import { ManualSizes, type SizeEntry } from "./manual-sizes";
import { VariableSelector } from "./variable-selector";
import { useFontsStore, useVariablesStore } from "../../../stores/fonts";
import { pluginApi } from "../../../api";

interface Font {
  family: string;
  styles: string[];
}

interface Variable {
  id: string;
  name: string;
  resolvedType: string;
  description?: string;
  collectionName?: string;
  resolvedValue?: string | number;
}

interface TextStyleProps {
  currentFont?: { family: string; style: string };
  onChange?: (style: {
    name: string;
    fontName: { family: string; style: string };
  }) => void;
  onDelete?: () => void;
  mode: "add" | "edit";
}

interface ValidationErrors {
  fontFamily?: string;
  styles?: string;
  lineHeight?: string;
  letterSpacing?: string;
  scaleRatio?: string;
  manualSizes?: string;
}

const RATIO_OPTIONS = [
  { value: "1.067", label: "Minor Second (1.067)" },
  { value: "1.125", label: "Major Second (1.125)" },
  { value: "1.2", label: "Minor Third (1.2)" },
  { value: "1.25", label: "Major Third (1.25)" },
  { value: "1.333", label: "Perfect Fourth (1.333)" },
  { value: "1.5", label: "Perfect Fifth (1.5)" },
  { value: "1.618", label: "Golden Ratio (1.618)" },
  { value: "2.0", label: "Octave (2.0)" },
];

// Standard fallback weights when no font match is found
const FALLBACK_WEIGHTS = [
  "Thin",
  "Extra Light",
  "Light",
  "Regular",
  "Medium",
  "Semi Bold",
  "Bold",
  "Extra Bold",
  "Black",
  "Thin Italic",
  "Extra Light Italic",
  "Light Italic",
  "Italic",
  "Medium Italic",
  "Semi Bold Italic",
  "Bold Italic",
  "Extra Bold Italic",
  "Black Italic",
];

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

export function TextStyle({
  currentFont,
  onChange,
  onDelete,
  mode,
}: TextStyleProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isEditingName, setIsEditingName] = React.useState(false);

  // Use global stores
  const { fonts, isLoading: fontsLoading } = useFontsStore();
  const { variables, isLoading: variablesLoading } = useVariablesStore();

  // Form state
  const [styleName, setStyleName] = React.useState("Untitled style");
  const [fontSource, setFontSource] = React.useState("type"); // "type" or "variable"
  const [selectedFontFamily, setSelectedFontFamily] =
    React.useState<string>("");
  const [selectedStyles, setSelectedStyles] = React.useState<string[]>([]);
  const [selectedRatio, setSelectedRatio] = React.useState("1.2"); // Default to Minor Third
  const [lineHeight, setLineHeight] = React.useState("1.4");
  const [letterSpacing, setLetterSpacing] = React.useState("0");
  const [isManualScale, setIsManualScale] = React.useState(false);
  const [manualSizes, setManualSizes] = React.useState<SizeEntry[]>([
    { id: "1", name: "1", size: 10, lineHeight: 1.4, letterSpacing: 0 },
  ]);

  // Error and submit state
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Initial state for change detection
  const [initialState] = React.useState({
    styleName,
    fontSource,
    selectedFontFamily,
    selectedStyles,
    selectedRatio,
    lineHeight,
    letterSpacing,
    isManualScale,
    manualSizes,
  });

  // Variables state
  const [selectedVariable, setSelectedVariable] =
    React.useState<Variable | null>(null);

  // Initialize value based on current font
  const initialValue = currentFont ? currentFont.family.trim() : "";
  const [value, setValue] = React.useState(initialValue);

  // Get available styles for the selected font family or variable
  const availableStyles = React.useMemo(() => {
    if (fontSource === "type" && selectedFontFamily) {
      // Standard font family selection
      const selectedFont = fonts.find(
        (font) => font.family === selectedFontFamily
      );
      return selectedFont?.styles || [];
    } else if (fontSource === "variable" && selectedVariable) {
      // Variable selection - try to match the variable's resolved value to a font family
      console.log("🔍 Debugging variable matching:");
      console.log("Selected variable:", selectedVariable);
      console.log(
        "Available fonts:",
        fonts.map((f) => f.family)
      );

      // Use the resolved value if available, otherwise fall back to name parsing
      let primaryCandidate: string | null = null;

      if (
        selectedVariable.resolvedValue &&
        typeof selectedVariable.resolvedValue === "string"
      ) {
        primaryCandidate = selectedVariable.resolvedValue;
        console.log("✅ Using resolved value:", primaryCandidate);
      } else {
        console.log("⚠️ No resolved value available, parsing name");
        // Fallback to parsing the variable name
        const nameParts = selectedVariable.name.split("/");
        primaryCandidate = nameParts[nameParts.length - 1];
      }

      // Try to find exact match first
      let matchingFont = fonts.find((font) => font.family === primaryCandidate);

      if (matchingFont) {
        console.log(
          `✅ Found exact match for "${primaryCandidate}":`,
          matchingFont
        );
        return matchingFont.styles;
      }

      // Try case-insensitive match
      matchingFont = fonts.find(
        (font) => font.family.toLowerCase() === primaryCandidate?.toLowerCase()
      );

      if (matchingFont) {
        console.log(
          `✅ Found case-insensitive match for "${primaryCandidate}":`,
          matchingFont
        );
        return matchingFont.styles;
      }

      // No match found, use fallback weights
      console.log(
        `❌ No matching font found for "${primaryCandidate}", using fallback weights`
      );
      return FALLBACK_WEIGHTS;
    }
    return [];
  }, [selectedFontFamily, selectedVariable, fontSource, fonts]);

  // Update selected styles when font family changes
  React.useEffect(() => {
    if (selectedFontFamily && availableStyles.length > 0) {
      // Auto-select all available styles
      setSelectedStyles(availableStyles);
    } else {
      setSelectedStyles([]);
    }
  }, [selectedFontFamily, availableStyles]);

  // Update value when currentFont prop changes
  React.useEffect(() => {
    if (currentFont) {
      const newValue = currentFont.family.trim();
      setValue(newValue);
      setSelectedFontFamily(newValue);
      console.log("Setting value from currentFont:", newValue);
      console.log("Available fonts count:", fonts.length);

      // Check if this font exists in the fonts array
      const fontExists = fonts.some((font) => font.family.trim() === newValue);
      console.log("Font exists in fonts array:", fontExists);
    }
  }, [currentFont, fonts]);

  // Filter fonts based on search query for better performance
  const filteredFonts = React.useMemo(() => {
    if (!searchQuery.trim()) {
      // Show first 100 fonts
      return fonts.slice(0, 100);
    }

    const query = searchQuery.toLowerCase();
    const filtered = fonts.filter((font) =>
      font.family.toLowerCase().includes(query)
    );

    // Limit filtered results to 100 for performance
    return filtered.slice(0, 100);
  }, [searchQuery, fonts]);

  // Multi-select for styles
  const [stylesOpen, setStylesOpen] = React.useState(false);

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

  const handleStyleToggle = (styleValue: string) => {
    const newStyles = selectedStyles.includes(styleValue)
      ? selectedStyles.filter((s) => s !== styleValue)
      : [...selectedStyles, styleValue];

    setSelectedStyles(newStyles);

    if (newStyles.length > 0) {
      clearError("styles");
    }
  };

  const handleToggleAllStyles = () => {
    if (selectedStyles.length === availableStyles.length) {
      // All are selected, so clear them
      setSelectedStyles([]);
    } else {
      // Not all are selected, so select all
      setSelectedStyles([...availableStyles]);
    }
  };

  const getAllClearStylesButtonText = () => {
    return selectedStyles.length === availableStyles.length ? "Clear" : "All";
  };

  // Single-select for ratio
  const [ratioOpen, setRatioOpen] = React.useState(false);

  const getRatioDisplayText = () => {
    const ratio = RATIO_OPTIONS.find((r) => r.value === selectedRatio);
    return ratio?.label || "Select ratio...";
  };

  const handleRatioSelect = (ratioValue: string) => {
    setSelectedRatio(ratioValue);
    setRatioOpen(false);
  };

  const handleVariableSelect = (variable: Variable) => {
    setSelectedVariable(variable);

    // Switch to variable mode and update display
    setFontSource("variable");
    setValue(variable.name); // Show variable name in the input
    setSelectedFontFamily(""); // Clear font family since we're using variable
    clearError("fontFamily");

    console.log("Selected variable:", variable);
  };

  const handleVariableUnlink = () => {
    setSelectedVariable(null);
    setFontSource("type");
    setValue(""); // Clear the display value
    setSelectedFontFamily(""); // Clear font family
    console.log("Unlinked variable");
  };

  const handleSelect = (currentValue: string) => {
    const trimmedValue = currentValue.trim();
    setValue(trimmedValue);
    setSelectedFontFamily(trimmedValue);
    setOpen(false);
    setSearchQuery(""); // Reset search when selecting
    clearError("fontFamily");

    // Switch to type mode and clear variable
    setFontSource("type");
    setSelectedVariable(null);

    const styleData = {
      name: styleName || `Style ${trimmedValue}`,
      fontName: { family: trimmedValue, style: currentFont?.style || "" },
    };

    if (onChange) {
      onChange(styleData);
    }
  };

  const handleNameSubmit = () => {
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    }
    if (e.key === "Escape") {
      setIsEditingName(false);
    }
  };

  const handleDelete = () => {
    if (
      onDelete &&
      window.confirm("Are you sure you want to delete this style?")
    ) {
      onDelete();
    }
  };

  // Updated handlers with error clearing
  const handleLineHeightChange = (value: string) => {
    setLineHeight(value);
    const num = parseFloat(value);
    if (value.trim() && !isNaN(num) && num >= 0.5 && num <= 5) {
      clearError("lineHeight");
    }
  };

  const handleLetterSpacingChange = (value: string) => {
    setLetterSpacing(value);
    const num = parseFloat(value);
    if (value.trim() && !isNaN(num) && num >= -100 && num <= 200) {
      clearError("letterSpacing");
    }
  };

  const handleManualSizesChange = (newSizes: SizeEntry[]) => {
    setManualSizes(newSizes);

    // Check if all sizes are valid
    const allValid = newSizes.every(
      (size) =>
        size.name.trim() &&
        size.size > 0 &&
        size.lineHeight >= 0.5 &&
        size.lineHeight <= 5 &&
        size.letterSpacing >= -100 &&
        size.letterSpacing <= 200
    );

    if (allValid) {
      clearError("manualSizes");
    }
  };

  // Validation functions
  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    // Font family or variable validation
    if (fontSource === "type" && !selectedFontFamily.trim()) {
      newErrors.fontFamily = "Font family is required";
    }

    if (fontSource === "variable" && !selectedVariable) {
      newErrors.fontFamily = "Variable selection is required";
    }

    // Styles validation (for both type and variable modes)
    if (
      (fontSource === "type" || fontSource === "variable") &&
      selectedStyles.length === 0
    ) {
      newErrors.styles = "At least one style must be selected";
    }

    // Line height validation (only when not manual mode)
    if (!isManualScale) {
      const lineHeightNum = parseFloat(lineHeight);
      if (
        !lineHeight.trim() ||
        isNaN(lineHeightNum) ||
        lineHeightNum < 0.5 ||
        lineHeightNum > 5
      ) {
        newErrors.lineHeight = "Line height must be between 0.5 and 5";
      }
    }

    // Letter spacing validation (only when not manual mode)
    if (!isManualScale) {
      const letterSpacingNum = parseFloat(letterSpacing);
      if (
        !letterSpacing.trim() ||
        isNaN(letterSpacingNum) ||
        letterSpacingNum < -100 ||
        letterSpacingNum > 200
      ) {
        newErrors.letterSpacing =
          "Letter spacing must be between -100% and 200%";
      }
    }

    // Scale ratio validation (when not manual)
    if (!isManualScale && !selectedRatio) {
      newErrors.scaleRatio = "Scale ratio is required";
    }

    // Manual sizes validation (when manual)
    if (isManualScale) {
      const hasInvalidSize = manualSizes.some(
        (size) =>
          !size.name.trim() ||
          size.size <= 0 ||
          size.lineHeight < 0.5 ||
          size.lineHeight > 5 ||
          size.letterSpacing < -100 ||
          size.letterSpacing > 200
      );
      if (hasInvalidSize) {
        newErrors.manualSizes = "All manual sizes must have valid values";
      }
    }

    return newErrors;
  };

  // Check if form has changes
  const hasChanges = React.useMemo(() => {
    return (
      styleName !== initialState.styleName ||
      fontSource !== initialState.fontSource ||
      selectedFontFamily !== initialState.selectedFontFamily ||
      JSON.stringify(selectedStyles) !==
        JSON.stringify(initialState.selectedStyles) ||
      selectedRatio !== initialState.selectedRatio ||
      lineHeight !== initialState.lineHeight ||
      letterSpacing !== initialState.letterSpacing ||
      isManualScale !== initialState.isManualScale ||
      JSON.stringify(manualSizes) !== JSON.stringify(initialState.manualSizes)
    );
  }, [
    styleName,
    fontSource,
    selectedFontFamily,
    selectedStyles,
    selectedRatio,
    lineHeight,
    letterSpacing,
    isManualScale,
    manualSizes,
  ]);

  // Check if form is valid
  const isFormValid = React.useMemo(() => {
    const currentErrors = validateForm();
    return Object.keys(currentErrors).length === 0;
  }, [
    selectedFontFamily,
    selectedStyles,
    lineHeight,
    letterSpacing,
    selectedRatio,
    isManualScale,
    manualSizes,
  ]);

  // Clear specific error when field becomes valid
  const clearError = (field: keyof ValidationErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Generate configuration for external submission
  const generateConfig = React.useCallback(() => {
    return {
      name: styleName,
      fontSource: fontSource as "type" | "variable",

      // Font-based configuration
      ...(fontSource === "type" && {
        fontFamily: selectedFontFamily,
        styles: selectedStyles,
      }),

      // Variable-based configuration
      ...(fontSource === "variable" && {
        variableId: selectedVariable?.id,
      }),

      // Typography settings (only when not manual mode)
      ...(!isManualScale && {
        lineHeight: parseFloat(lineHeight),
        letterSpacing: parseFloat(letterSpacing),
      }),

      // Scale configuration
      isManualScale,
      ...(isManualScale
        ? {
            manualSizes: manualSizes.map((size) => ({
              id: size.id,
              name: size.name,
              size: size.size,
              lineHeight: size.lineHeight,
              letterSpacing: size.letterSpacing,
            })),
          }
        : {
            scaleRatio: parseFloat(selectedRatio),
          }),
    };
  }, [
    styleName,
    fontSource,
    selectedFontFamily,
    selectedStyles,
    selectedVariable,
    isManualScale,
    lineHeight,
    letterSpacing,
    manualSizes,
    selectedRatio,
  ]);

  // Handle submit
  const handleSubmit = async () => {
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const config = generateConfig();
      console.log("🚀 Submitting typography system configuration:", config);

      const result = await pluginApi.createTypographySystem(config);

      if (result.success) {
        console.log("✅ Typography system created successfully:", result);
        await pluginApi.notify(
          `Successfully created ${result.styles.length} text styles!`
        );
      } else {
        throw new Error(result.message || "Failed to create typography system");
      }
    } catch (error) {
      console.error("❌ Error creating typography system:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to create typography system"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full transition-colors border rounded-lg border-muted-foreground/25 hover:border-muted-foreground/50">
      {/* Header with inline editable name and collapse toggle */}
      <div className="flex items-center justify-between gap-2 px-4 py-1 pr-1 border-b border-border">
        <div className="flex items-center flex-1 gap-2">
          {/* Prefix with Type icon and slash */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Type className="size-3" />
            <span>/</span>
          </div>

          {/* Editable style name */}
          <div className="relative flex-1">
            {isEditingName ? (
              <AutoResizeInput
                value={styleName}
                onValueChange={setStyleName}
                onBlur={handleNameSubmit}
                onKeyDown={handleNameKeyDown}
                className="px-3 py-2 text-sm font-medium h-7"
                style={{ lineHeight: "12px" }}
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-left rounded-md cursor-default h-7 text-foreground/50 hover:text-foreground/80 focus:outline-none focus:text-foreground/80 hover:bg-muted/50"
                style={{ lineHeight: "12px" }}
              >
                <span>{styleName}</span>
                <span className="ml-1">
                  <Pencil className="size-3 opacity-60" />
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Delete Button */}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 px-2 cursor-default text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              title="Delete style"
            >
              <Trash2 className="size-4" />
            </Button>
          )}

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-3 py-1 cursor-default"
          >
            {isExpanded ? (
              <ChevronDown className="size-5" />
            ) : (
              <ChevronRight className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <>
          <div className="flex flex-col gap-6 px-4 py-6">
            {/* Font Source & Family - Full Width Row */}
            <FormField label="Font Family">
              <div className="flex">
                {/* Font Family Input */}
                <div className="flex-1">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="justify-between w-full border-r rounded-r-none cursor-default"
                        disabled={fontsLoading}
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
                          onValueChange={setSearchQuery}
                          className="focus:outline-none focus:ring-0"
                        />
                        <CommandList className="max-h-[300px] overflow-auto">
                          <CommandEmpty>
                            {searchQuery
                              ? "No matching fonts found."
                              : "No fonts available."}
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredFonts.map((font, index) => {
                              const fontValue = font.family.trim();
                              const isSelected = value?.trim() === fontValue;

                              return (
                                <CommandItem
                                  key={`${font.family}-${font.styles.join(
                                    ","
                                  )}`}
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
                                Showing first 100 fonts. Use search to find
                                more.
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
                  onVariableSelect={handleVariableSelect}
                  onUnlink={handleVariableUnlink}
                  allowedTypes={["STRING"]}
                  className="border-l-0 rounded-l-none"
                />
              </div>
            </FormField>

            {/* 2-column grid for other options */}
            <div className="grid items-end grid-cols-2 gap-x-4 gap-y-6">
              {/* Line Height */}
              <FormField label="Line Height" disabled={isManualScale}>
                <div className="space-y-1">
                  <Input
                    type="text"
                    placeholder="1.4"
                    value={lineHeight}
                    onChange={(e) => handleLineHeightChange(e.target.value)}
                    disabled={isManualScale}
                    className={cn(
                      "w-full",
                      errors.lineHeight && "border-red-500"
                    )}
                  />
                  {errors.lineHeight && !isManualScale && (
                    <p className="text-xs text-red-600">{errors.lineHeight}</p>
                  )}
                </div>
              </FormField>

              {/* Letter Spacing */}
              <FormField label="Letter Spacing" disabled={isManualScale}>
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="0"
                      value={letterSpacing}
                      onChange={(e) =>
                        handleLetterSpacingChange(e.target.value)
                      }
                      disabled={isManualScale}
                      className={cn(
                        "pr-8",
                        errors.letterSpacing && "border-red-500"
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  {errors.letterSpacing && !isManualScale && (
                    <p className="text-xs text-red-600">
                      {errors.letterSpacing}
                    </p>
                  )}
                </div>
              </FormField>

              {/* Font Styles Multi-Select */}
              <FormField label="Styles">
                <div className="space-y-1">
                  <Popover open={stylesOpen} onOpenChange={setStylesOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={stylesOpen}
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
                          errors.styles && "border-red-500"
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
                          <span className="text-sm font-medium">
                            Select Styles
                          </span>
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
                                onSelect={() => handleStyleToggle(style)}
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

              {/* Scale Ratio Single-Select */}
              <FormField label="Scale Ratio">
                <div className="space-y-1">
                  <Popover open={ratioOpen} onOpenChange={setRatioOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={ratioOpen}
                        disabled={isManualScale}
                        className={cn(
                          "justify-between w-full cursor-default",
                          isManualScale && "opacity-50",
                          errors.scaleRatio &&
                            !isManualScale &&
                            "border-red-500"
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
                            {RATIO_OPTIONS.map((ratio) => (
                              <CommandItem
                                key={ratio.value}
                                onSelect={() => handleRatioSelect(ratio.value)}
                                className="cursor-default"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedRatio === ratio.value
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
                  {errors.scaleRatio && !isManualScale && (
                    <p className="text-xs text-red-600">{errors.scaleRatio}</p>
                  )}
                </div>
              </FormField>

              {/* Manual Scale Toggle */}
              <div className="flex items-center col-span-2 gap-2">
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  OR
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsManualScale(!isManualScale)}
                  className={cn(
                    "h-10 px-3 cursor-default",
                    isManualScale &&
                      "bg-foreground text-background hover:bg-foreground/90"
                  )}
                >
                  Manual Scale
                </Button>
              </div>

              {/* Generate Button */}
              <div className="col-span-2 pt-4">
                {submitError && (
                  <div className="p-3 mb-3 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                    {submitError}
                  </div>
                )}
                {errors.manualSizes && isManualScale && (
                  <div className="p-3 mb-3 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                    {errors.manualSizes}
                  </div>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={!hasChanges || !isFormValid || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
          </div>

          {/* Manual Sizes Section */}
          {isManualScale && (
            <ManualSizes
              sizes={manualSizes}
              onSizesChange={handleManualSizesChange}
              defaultRatio={parseFloat(selectedRatio)}
            />
          )}
        </>
      )}
    </div>
  );
}
