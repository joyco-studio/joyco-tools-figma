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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AutoResizeInput } from "./auto-resize-input";
import { ManualSizes, type SizeEntry } from "./manual-sizes";

interface Font {
  family: string;
  style: string;
}

interface TextStyleProps {
  fonts: Font[];
  fontsLoading: boolean;
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
  fonts,
  fontsLoading,
  currentFont,
  onChange,
  onDelete,
  mode,
}: TextStyleProps) {
  // Debug log to see if onDelete is being passed
  React.useEffect(() => {
    console.log("TextStyle component props:", { mode, onDelete: !!onDelete });
  }, [mode, onDelete]);

  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isEditingName, setIsEditingName] = React.useState(false);

  // Form state
  const [styleName, setStyleName] = React.useState("Untitled style");
  const [selectedWeights, setSelectedWeights] = React.useState<string[]>([
    "400",
  ]);
  const [includeItalics, setIncludeItalics] = React.useState(false);
  const [selectedRatio, setSelectedRatio] = React.useState("1.2");
  const [isManualScale, setIsManualScale] = React.useState(false);
  const [manualSizes, setManualSizes] = React.useState<SizeEntry[]>([
    { id: "1", name: "size-1", size: 10 },
  ]);

  // Initialize value based on current font
  const initialValue = currentFont
    ? `${currentFont.family} - ${currentFont.style}`
    : "";
  const [value, setValue] = React.useState(initialValue);

  // Update value when currentFont prop changes
  React.useEffect(() => {
    if (currentFont) {
      setValue(`${currentFont.family} - ${currentFont.style}`);
    }
  }, [currentFont]);

  // Filter fonts based on search query for better performance
  const filteredFonts = React.useMemo(() => {
    if (!searchQuery.trim()) {
      // Show only first 50 fonts initially for better performance
      return fonts.slice(0, 50);
    }

    const query = searchQuery.toLowerCase();
    const filtered = fonts.filter(
      (font) =>
        font.family.toLowerCase().includes(query) ||
        font.style.toLowerCase().includes(query)
    );

    // Limit filtered results to 100 for performance
    return filtered.slice(0, 100);
  }, [fonts, searchQuery]);

  const handleSelect = (currentValue: string) => {
    setValue(currentValue);
    setOpen(false);
    setSearchQuery(""); // Reset search when selecting

    const [family, style] = currentValue.split(" - ");
    const styleData = {
      name: styleName || `Style ${family}`,
      fontName: { family, style },
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
                className="flex items-center px-3 py-2 text-sm font-medium text-left rounded-md cursor-pointer h-7 text-foreground/50 hover:text-foreground/80 focus:outline-none focus:text-foreground/80 hover:bg-muted/50"
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
          {/* Delete Button - temporarily always shown for debugging */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 px-2 border border-red-300 border-dashed text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            title={`Delete style (onDelete: ${!!onDelete})`}
            disabled={!onDelete}
          >
            <Trash2 className="size-4" />
          </Button>

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-3 py-1"
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
          <div className="p-4 space-y-4">
            {/* Font Family */}
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between w-full"
                    disabled={fontsLoading}
                  >
                    {fontsLoading
                      ? "Loading fonts..."
                      : value
                      ? value
                      : "Select font..."}
                    <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search font..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList className="max-h-[300px] overflow-auto">
                      <CommandEmpty>
                        {searchQuery
                          ? "No matching fonts found."
                          : "No fonts available."}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredFonts.map((font) => (
                          <CommandItem
                            key={`${font.family}-${font.style}`}
                            value={`${font.family} - ${font.style}`}
                            onSelect={handleSelect}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === `${font.family} - ${font.style}`
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {font.family} - {font.style}
                          </CommandItem>
                        ))}
                        {!searchQuery && fonts.length > 50 && (
                          <div className="px-2 py-1 text-xs text-center border-t text-muted-foreground">
                            Showing first 50 fonts. Use search to find more.
                          </div>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Weight Selection */}
            <div className="space-y-2">
              <Label>Font Weights</Label>
              <ToggleGroup
                type="multiple"
                value={selectedWeights}
                onValueChange={(value) => setSelectedWeights(value as string[])}
                className="flex-wrap justify-start"
              >
                {WEIGHT_OPTIONS.map((weight) => (
                  <ToggleGroupItem
                    key={weight.value}
                    value={weight.value}
                    className="text-xs"
                    style={{ fontWeight: weight.value }}
                  >
                    {weight.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
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

            {/* Manual Scale Toggle */}
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
