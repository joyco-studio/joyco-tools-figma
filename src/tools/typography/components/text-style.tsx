import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluginApi } from "@/api";

interface TextStyleProps {
  mode: "add" | "edit";
  onAdd?: (style: {
    name: string;
    fontName: { family: string; style: string };
  }) => void;
}

interface Font {
  family: string;
  style: string;
}

export function TextStyle({ mode = "add", onAdd }: TextStyleProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [fonts, setFonts] = React.useState<Font[]>([]);

  React.useEffect(() => {
    const loadFonts = async () => {
      const availableFonts = await pluginApi.getAvailableFonts();
      setFonts(availableFonts);
    };

    loadFonts();
  }, []);

  const handleSelect = (currentValue: string) => {
    setValue(currentValue);
    setOpen(false);

    if (onAdd) {
      const [family, style] = currentValue.split(" - ");
      onAdd({
        name: `Style ${family}`,
        fontName: { family, style },
      });
    }
  };

  return (
    <div className="w-full p-4 transition-colors border-2 border-dashed rounded-lg border-muted-foreground/25 hover:border-muted-foreground/50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full"
          >
            {value ? value : "Select font..."}
            <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search font..." />
            <CommandEmpty>No font found.</CommandEmpty>
            <CommandGroup>
              {fonts.map((font) => (
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
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
