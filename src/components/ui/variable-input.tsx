import * as React from "react";
import { Input } from "./input";
import { VariableSelector } from "../../tools/typography/components/variable-selector";
import { cn } from "@/lib/utils";

interface Variable {
  id: string;
  name: string;
  resolvedType: string;
  description?: string;
  collectionName?: string;
}

interface VariableInputProps {
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  selectedVariable?: Variable | null;
  onVariableSelect?: (variable: Variable) => void;
  onVariableUnlink?: () => void;
  allowedTypes?: string[];
  unit?: string; // Optional unit display (e.g., "px", "%")
  type?: "text" | "number";
}

export function VariableInput({
  value,
  placeholder,
  disabled = false,
  className,
  onChange,
  selectedVariable,
  onVariableSelect,
  onVariableUnlink,
  allowedTypes = ["STRING", "FLOAT"],
  unit,
  type = "text",
}: VariableInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={cn("flex", className)}>
      <div className="relative flex-1">
        <Input
          type={type}
          placeholder={placeholder}
          value={selectedVariable ? selectedVariable.name : value || ""}
          onChange={handleChange}
          disabled={disabled || !!selectedVariable}
          className={cn(
            "rounded-r-none border-r-0",
            unit && "pr-8",
            selectedVariable && "text-foreground font-medium"
          )}
          readOnly={!!selectedVariable}
        />
        {unit && !selectedVariable && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
        )}
      </div>

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
