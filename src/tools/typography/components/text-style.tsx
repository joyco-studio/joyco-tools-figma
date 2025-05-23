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
  ToggleGroup,
  ToggleGroupItem,
} from "../../../components/ui/toggle-group";
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
import { useFontsStore, useVariablesStore } from "../../../stores/fonts";

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
    { id: "1", name: "size-1", size: 10, lineHeight: 1.4, letterSpacing: 0 },
  ]);

  // Variables state
  const [variablesOpen, setVariablesOpen] = React.useState(false);
  const [variableSearchQuery, setVariableSearchQuery] = React.useState("");
  const [selectedVariable, setSelectedVariable] =
    React.useState<Variable | null>(null);

  // Initialize value based on current font
  const initialValue = currentFont ? currentFont.family.trim() : "";
  const [value, setValue] = React.useState(initialValue);

  // Get available styles for the selected font family
  const availableStyles = React.useMemo(() => {
    if (!selectedFontFamily) return [];
    const selectedFont = fonts.find(
      (font) => font.family === selectedFontFamily
    );
    return selectedFont?.styles || [];
  }, [selectedFontFamily, fonts]);

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
    setSelectedStyles((prev) =>
      prev.includes(styleValue)
        ? prev.filter((s) => s !== styleValue)
        : [...prev, styleValue]
    );
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

  const handleSelect = (currentValue: string) => {
    const trimmedValue = currentValue.trim();
    setValue(trimmedValue);
    setSelectedFontFamily(trimmedValue);
    setOpen(false);
    setSearchQuery(""); // Reset search when selecting

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

  // Filter variables based on search query for better performance
  const filteredVariables = React.useMemo(() => {
    if (!variableSearchQuery.trim()) {
      // Show first 100 variables
      return variables.slice(0, 100);
    }

    const query = variableSearchQuery.toLowerCase();
    const filtered = variables.filter(
      (variable) =>
        variable.name.toLowerCase().includes(query) ||
        variable.collectionName?.toLowerCase().includes(query) ||
        variable.resolvedType.toLowerCase().includes(query)
    );

    // Limit filtered results to 100 for performance
    return filtered.slice(0, 100);
  }, [variables, variableSearchQuery]);

  const handleVariableSelect = (variable: Variable) => {
    setSelectedVariable(variable);
    setVariablesOpen(false);
    setVariableSearchQuery(""); // Reset search when selecting

    // TODO: Handle variable selection for typography
    console.log("Selected variable:", variable);
  };

  // Helper function to render variable name with dimmed path
  const renderVariableName = (name: string) => {
    const lastSlashIndex = name.lastIndexOf("/");
    if (lastSlashIndex === -1) {
      // No slash found, return the name as is
      return <span className="font-medium">{name}</span>;
    }

    const path = name.substring(0, lastSlashIndex + 1); // Include the slash
    const actualName = name.substring(lastSlashIndex + 1);

    return (
      <span className="font-medium">
        <span className="opacity-50">{path}</span>
        <span>{actualName}</span>
      </span>
    );
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
              <div className="flex gap-4">
                {/* Font Source Toggle */}
                <ToggleGroup
                  type="single"
                  value={fontSource}
                  onValueChange={(value) =>
                    value && setFontSource(value as string)
                  }
                  className="justify-start gap-0 [&>*]:border-r-0 [&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:last-child]:border-r"
                >
                  <ToggleGroupItem
                    value="type"
                    className="border-r-0 rounded-r-none"
                  >
                    <Type className="size-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="variable" className="rounded-l-none">
                    <Hexagon className="size-4" />
                  </ToggleGroupItem>
                </ToggleGroup>

                {/* Font Family - Only show when type is selected */}
                {fontSource === "type" && (
                  <div className="flex-1">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="justify-between w-full cursor-default"
                          disabled={fontsLoading}
                        >
                          {value ? value : "Select font..."}
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
                )}

                {/* Variable Selector - Only show when variable is selected */}
                {fontSource === "variable" && (
                  <div className="flex-1">
                    <Popover
                      open={variablesOpen}
                      onOpenChange={setVariablesOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={variablesOpen}
                          className="justify-between w-full cursor-default"
                          disabled={variablesLoading}
                        >
                          <div className="flex items-center min-w-0 gap-2">
                            {variablesLoading ? (
                              "Loading variables..."
                            ) : selectedVariable ? (
                              <>
                                {renderVariableName(selectedVariable.name)}
                                <span className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground shrink-0">
                                  {selectedVariable.resolvedType}
                                </span>
                              </>
                            ) : (
                              <span className="font-normal text-muted-foreground">
                                Select variable...
                              </span>
                            )}
                          </div>
                          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search variables..."
                            value={variableSearchQuery}
                            onValueChange={setVariableSearchQuery}
                            className="focus:outline-none focus:ring-0"
                          />
                          <CommandList className="max-h-[300px] overflow-auto">
                            <CommandEmpty>
                              {variableSearchQuery
                                ? "No matching variables found."
                                : variables.length === 0
                                ? "No typography variables available."
                                : "No variables found."}
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredVariables.map((variable) => {
                                const isSelected =
                                  selectedVariable?.id === variable.id;

                                return (
                                  <CommandItem
                                    key={variable.id}
                                    value={`${variable.name}-${variable.id}`}
                                    onSelect={() =>
                                      handleVariableSelect(variable)
                                    }
                                    className={cn("cursor-default")}
                                  >
                                    <div className="flex items-center w-4 mr-2">
                                      {isSelected && (
                                        <Check className="w-4 h-4 text-foreground" />
                                      )}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        {renderVariableName(variable.name)}
                                        <span className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                                          {variable.resolvedType}
                                        </span>
                                      </div>
                                      {variable.collectionName && (
                                        <span className="text-xs truncate text-muted-foreground">
                                          {variable.collectionName}
                                        </span>
                                      )}
                                    </div>
                                  </CommandItem>
                                );
                              })}
                              {!variableSearchQuery &&
                                variables.length > 100 && (
                                  <div className="px-2 py-1 text-xs text-center border-t text-muted-foreground">
                                    Showing first 100 variables. Use search to
                                    find more.
                                  </div>
                                )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </FormField>

            {/* 2-column grid for other options */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 items-end">
              {/* Line Height */}
              <FormField label="Line Height">
                <Input
                  type="text"
                  placeholder="1.4"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(e.target.value)}
                  className="w-full"
                />
              </FormField>

              {/* Letter Spacing */}
              <FormField label="Letter Spacing">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="0"
                    value={letterSpacing}
                    onChange={(e) => setLetterSpacing(e.target.value)}
                    className="pr-8"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </FormField>

              {/* Font Styles Multi-Select */}
              <FormField label="Styles">
                <Popover open={stylesOpen} onOpenChange={setStylesOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={stylesOpen}
                      disabled={
                        !selectedFontFamily || availableStyles.length === 0
                      }
                      className={cn(
                        "justify-between w-full cursor-default",
                        (!selectedFontFamily || availableStyles.length === 0) &&
                          "opacity-50"
                      )}
                    >
                      {!selectedFontFamily
                        ? "Select font family first..."
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
              </FormField>

              {/* Scale Ratio Single-Select */}
              <FormField label="Scale Ratio">
                <Popover open={ratioOpen} onOpenChange={setRatioOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={ratioOpen}
                      disabled={isManualScale}
                      className={cn(
                        "justify-between w-full cursor-default",
                        isManualScale && "opacity-50"
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
              </FormField>

              {/* Manual Scale Toggle */}
              <div className="flex items-center gap-2 col-span-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
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
            </div>
          </div>

          {/* Manual Sizes Section */}
          {isManualScale && (
            <ManualSizes
              sizes={manualSizes}
              onSizesChange={setManualSizes}
              defaultRatio={parseFloat(selectedRatio)}
            />
          )}
        </>
      )}
    </div>
  );
}
