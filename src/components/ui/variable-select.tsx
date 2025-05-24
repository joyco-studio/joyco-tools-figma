import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { VariableSelector } from "../../tools/typography/components/variable-selector";
import { cn } from "@/lib/utils";
import { Unlink2 } from "lucide-react";
import { Button } from "./button";

interface Variable {
  id: string;
  name: string;
  resolvedType: string;
  description?: string;
  collectionName?: string;
}

interface Option {
  value: string;
  label: string;
}

interface VariableSelectProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  options?: Option[];
  onValueChange?: (value: string) => void;
  selectedVariable?: Variable | null;
  onVariableSelect?: (variable: Variable) => void;
  onVariableUnlink?: () => void;
  allowedTypes?: string[];
}

export function VariableSelect({
  value,
  placeholder = "Select option...",
  disabled = false,
  className,
  options = [],
  onValueChange,
  selectedVariable,
  onVariableSelect,
  onVariableUnlink,
  allowedTypes = ["STRING"],
}: VariableSelectProps) {
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

  const handleUnlink = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVariableUnlink?.();
  };

  // If a variable is selected, show the unlink pattern
  if (selectedVariable) {
    return (
      <div className={cn("flex", className)}>
        <Button
          variant="outline"
          className={cn(
            "px-3 cursor-default min-w-0 flex-1 justify-start rounded-r-none border-r-0",
            disabled && "opacity-50"
          )}
          disabled={disabled}
          onClick={handleUnlink}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="truncate text-sm font-medium">
              {selectedVariable.name}
            </span>
            <span className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground shrink-0">
              {getTypeLabel(selectedVariable.resolvedType)}
            </span>
          </div>
          <Unlink2 className="size-4 ml-1 shrink-0" />
        </Button>
      </div>
    );
  }

  // Default state: show regular select with variable selector
  return (
    <div className={cn("flex", className)}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn("rounded-r-none border-r-0", disabled && "opacity-50")}
          disabled={disabled}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <VariableSelector
        selectedVariable={selectedVariable}
        onVariableSelect={onVariableSelect}
        onUnlink={onVariableUnlink}
        allowedTypes={allowedTypes}
        disabled={disabled}
        className="rounded-l-none border-l-0"
      />
    </div>
  );
}
