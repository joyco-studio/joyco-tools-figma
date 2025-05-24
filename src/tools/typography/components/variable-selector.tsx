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
import { Check, ChevronsUpDown, Unlink2 } from "lucide-react";
import { VariableIcon } from "@/components/icons/variable-icon";
import { cn } from "@/lib/utils";
import { useVariablesStore } from "../../../stores/fonts";

interface Variable {
  id: string;
  name: string;
  resolvedType: string;
  description?: string;
  collectionName?: string;
  resolvedValue?: string | number;
}

interface VariableSelectorProps {
  selectedVariable?: Variable | null;
  onVariableSelect: (variable: Variable) => void;
  allowedTypes?: string[]; // Filter variables by type (e.g., ["STRING", "FLOAT"])
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
  width?: number; // Fixed width in pixels
  onUnlink?: () => void; // New prop for unlinking functionality
}

export function VariableSelector({
  selectedVariable,
  onVariableSelect,
  allowedTypes = ["STRING", "FLOAT"], // Default to typography-relevant types
  placeholder = "Select variable...",
  disabled = false,
  className,
  align = "end",
  width = 400,
  onUnlink,
}: VariableSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { variables, isLoading: variablesLoading } = useVariablesStore();

  // Filter variables based on allowed types and search query
  const filteredVariables = React.useMemo(() => {
    let filtered = variables.filter((variable) =>
      allowedTypes.includes(variable.resolvedType)
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (variable) =>
          variable.name.toLowerCase().includes(query) ||
          variable.collectionName?.toLowerCase().includes(query) ||
          variable.resolvedType.toLowerCase().includes(query)
      );
    }

    // Limit to 100 for performance
    return filtered.slice(0, 100);
  }, [variables, allowedTypes, searchQuery]);

  const handleVariableSelect = (variable: Variable) => {
    onVariableSelect(variable);
    setOpen(false);
    setSearchQuery("");
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedVariable && onUnlink) {
      onUnlink();
    } else {
      setOpen(!open);
    }
  };

  // Helper function to render variable name with dimmed path
  const renderVariableName = (name: string) => {
    const lastSlashIndex = name.lastIndexOf("/");
    if (lastSlashIndex === -1) {
      return <span className="font-medium">{name}</span>;
    }

    const path = name.substring(0, lastSlashIndex + 1);
    const actualName = name.substring(lastSlashIndex + 1);

    return (
      <span className="font-medium">
        <span className="opacity-50">{path}</span>
        <span>{actualName}</span>
      </span>
    );
  };

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

  return (
    <Popover open={open && !selectedVariable} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "px-3 cursor-default",
            disabled && "opacity-50",
            className
          )}
          disabled={disabled || variablesLoading}
          onClick={handleClick}
        >
          {selectedVariable ? (
            <Unlink2 className="size-4" />
          ) : (
            <VariableIcon className="size-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`w-[${width}px] p-0`} align={align}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search variables..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="focus:outline-none focus:ring-0"
          />
          <CommandList className="max-h-[300px] overflow-auto">
            <CommandEmpty>
              {searchQuery
                ? "No matching variables found."
                : variables.length === 0
                ? `No ${allowedTypes.join("/")} variables available.`
                : "No variables found."}
            </CommandEmpty>
            <CommandGroup>
              {filteredVariables.map((variable) => {
                const isSelected = selectedVariable?.id === variable.id;

                return (
                  <CommandItem
                    key={variable.id}
                    value={`${variable.name}-${variable.id}`}
                    onSelect={() => handleVariableSelect(variable)}
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
                          {getTypeLabel(variable.resolvedType)}
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
              {!searchQuery && filteredVariables.length === 100 && (
                <div className="px-2 py-1 text-xs text-center border-t text-muted-foreground">
                  Showing first 100 variables. Use search to find more.
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
