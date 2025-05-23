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
  mode: "add" | "edit";
}

export function TextStyle({
  fonts,
  fontsLoading,
  currentFont,
  onChange,
}: TextStyleProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

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
      name: `Style ${family}`,
      fontName: { family, style },
    };

    if (onChange) {
      onChange(styleData);
    }
  };

  return (
    <div className="w-full p-4 transition-colors border-2 rounded-lg border-muted-foreground/25 hover:border-muted-foreground/50">
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
  );
}
