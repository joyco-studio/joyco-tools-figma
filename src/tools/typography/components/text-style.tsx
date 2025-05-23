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
  style: string;
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

const WEIGHT_OPTIONS = [
  { value: "100", label: "Thin (100)" },
  { value: "200", label: "Extra Light (200)" },
  { value: "300", label: "Light (300)" },
  { value: "400", label: "Regular (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semi Bold (600)" },
  { value: "700", label: "Bold (700)" },
  { value: "800", label: "Extra Bold (800)" },
  { value: "900", label: "Black (900)" },
];

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

  // Form state - default to all weights selected
  const [styleName, setStyleName] = React.useState("Untitled style");
  const [fontSource, setFontSource] = React.useState("type"); // "type" or "variable"
  const [selectedWeights, setSelectedWeights] = React.useState<string[]>(
    WEIGHT_OPTIONS.map((w) => w.value) // Select all weights by default
  );
  const [includeItalics, setIncludeItalics] = React.useState(false);
  const [selectedRatio, setSelectedRatio] = React.useState("1.2");
  const [isManualScale, setIsManualScale] = React.useState(false);
  const [manualSizes, setManualSizes] = React.useState<SizeEntry[]>([
    { id: "1", name: "size-1", size: 10 },
  ]);

  // Variables state
  const [variablesOpen, setVariablesOpen] = React.useState(false);
  const [variableSearchQuery, setVariableSearchQuery] = React.useState("");
  const [selectedVariable, setSelectedVariable] =
    React.useState<Variable | null>(null);

  // Initialize value based on current font
  const initialValue = currentFont
    ? `${currentFont.family.trim()} - ${currentFont.style.trim()}`
    : "";
  const [value, setValue] = React.useState(initialValue);

  // Update value when currentFont prop changes
  React.useEffect(() => {
    if (currentFont) {
      const newValue = `${currentFont.family.trim()} - ${currentFont.style.trim()}`;
      setValue(newValue);
      console.log("Setting value from currentFont:", newValue);
      console.log("Available fonts count:", fonts.length);

      // Check if this font exists in the fonts array
      const fontExists = fonts.some(
        (font) => `${font.family.trim()} - ${font.style.trim()}` === newValue
      );
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
    const filtered = fonts.filter(
      (font) =>
        font.family.toLowerCase().includes(query) ||
        font.style.toLowerCase().includes(query)
    );

    // Limit filtered results to 100 for performance
    return filtered.slice(0, 100);
  }, [searchQuery, fonts]);

  // Multi-select for weights
  const [weightsOpen, setWeightsOpen] = React.useState(false);

  const getWeightsDisplayText = () => {
    if (selectedWeights.length === 0) return "Select weights...";
    if (selectedWeights.length === WEIGHT_OPTIONS.length) return "All weights";
    if (selectedWeights.length === 1) {
      const weight = WEIGHT_OPTIONS.find((w) => w.value === selectedWeights[0]);
      return weight?.label || selectedWeights[0];
    }
    return `${selectedWeights.length} weights selected`;
  };

  const handleWeightToggle = (weightValue: string) => {
    setSelectedWeights((prev) =>
      prev.includes(weightValue)
        ? prev.filter((w) => w !== weightValue)
        : [...prev, weightValue]
    );
  };

  const handleToggleAllWeights = () => {
    if (selectedWeights.length === WEIGHT_OPTIONS.length) {
      // All are selected, so clear them
      setSelectedWeights([]);
    } else {
      // Not all are selected, so select all
      setSelectedWeights(WEIGHT_OPTIONS.map((w) => w.value));
    }
  };

  const getAllClearButtonText = () => {
    return selectedWeights.length === WEIGHT_OPTIONS.length ? "Clear" : "All";
  };

  const handleSelect = (currentValue: string) => {
    const trimmedValue = currentValue.trim();
    setValue(trimmedValue);
    setOpen(false);
    setSearchQuery(""); // Reset search when selecting

    const [family, style] = trimmedValue.split(" - ");
    const styleData = {
      name: styleName || `Style ${family}`,
      fontName: { family: family.trim(), style: style.trim() },
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
            <div className="flex flex-col gap-4">
              <Label>Font Family</Label>
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
                  <div className="flex-1 space-y-2">
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
                                const fontValue = `${font.family.trim()} - ${font.style.trim()}`;
                                const isSelected = value?.trim() === fontValue;

                                return (
                                  <CommandItem
                                    key={`${font.family}-${font.style}`}
                                    value={fontValue}
                                    onSelect={handleSelect}
                                    className={cn("cursor-default")}
                                  >
                                    <div className="flex items-center w-4 mr-2">
                                      {isSelected && (
                                        <Check className="w-4 h-4 text-foreground" />
                                      )}
                                    </div>
                                    <span>
                                      {font.family.trim()} - {font.style.trim()}
                                    </span>
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
                  <div className="flex-1 space-y-2">
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
                                <span className="truncate">
                                  {selectedVariable.name}
                                </span>
                                <span className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground shrink-0">
                                  {selectedVariable.resolvedType}
                                </span>
                              </>
                            ) : (
                              "Select variable..."
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
                                        <span className="font-medium">
                                          {variable.name}
                                        </span>
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
            </div>

            {/* 2-column grid for other options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Font Weights Multi-Select */}
              <div className="space-y-2">
                <Label>Font Weights</Label>
                <Popover open={weightsOpen} onOpenChange={setWeightsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={weightsOpen}
                      className="justify-between w-full cursor-default"
                    >
                      {getWeightsDisplayText()}
                      <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <div className="flex items-center justify-between p-2 border-b">
                        <span className="text-sm font-medium">
                          Select Weights
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs cursor-default"
                            onClick={handleToggleAllWeights}
                          >
                            {getAllClearButtonText()}
                          </Button>
                        </div>
                      </div>
                      <CommandList className="max-h-[200px] overflow-auto">
                        <CommandGroup>
                          {WEIGHT_OPTIONS.map((weight) => (
                            <CommandItem
                              key={weight.value}
                              onSelect={() => handleWeightToggle(weight.value)}
                              className="cursor-default"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedWeights.includes(weight.value)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span style={{ fontWeight: weight.value }}>
                                {weight.label}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Scale Ratio */}
              <div className="space-y-2">
                <Label>Scale Ratio</Label>
                <Select value={selectedRatio} onValueChange={setSelectedRatio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    {RATIO_OPTIONS.map((ratio) => (
                      <SelectItem key={ratio.value} value={ratio.value}>
                        {ratio.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Include Italics */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-italics"
                  checked={includeItalics}
                  onCheckedChange={setIncludeItalics}
                />
                <Label htmlFor="include-italics">Include Italics</Label>
              </div>

              {/* Empty space for grid balance */}
              <div></div>
            </div>

            {/* Manual Scale Toggle - Full width below grid */}
            <div className="flex items-center space-x-2">
              <Switch
                id="manual-scale"
                checked={isManualScale}
                onCheckedChange={setIsManualScale}
              />
              <Label htmlFor="manual-scale">Manual Scale</Label>
            </div>
          </div>

          {/* Manual Sizes Section */}
          {isManualScale && (
            <ManualSizes sizes={manualSizes} onSizesChange={setManualSizes} />
          )}
        </>
      )}
    </div>
  );
}
