import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TextCase } from "@/lib/types/typography";

interface TextCaseToggleProps {
  value?: TextCase;
  onValueChange: (value: TextCase) => void;
  size?: "sm" | "md";
  className?: string;
}

const textCaseOptions: {
  value: TextCase;
  label: string;
  display: string;
  className: string;
}[] = [
  { value: "UPPER", label: "Uppercase", display: "AG", className: "uppercase" },
  { value: "LOWER", label: "Lowercase", display: "ag", className: "lowercase" },
  {
    value: "TITLE",
    label: "Title Case",
    display: "Ag",
    className: "capitalize",
  },
];

export function TextCaseToggle({
  value,
  onValueChange,
  size = "md",
  className,
}: TextCaseToggleProps) {
  const buttonSize = size === "sm" ? "h-6 w-8 text-xs" : "h-8 w-10 text-sm";

  return (
    <div className={cn("flex overflow-hidden rounded-md border", className)}>
      {textCaseOptions.map((option, index) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onValueChange(option.value)}
          className={cn(
            buttonSize,
            "rounded-none border-0 font-mono font-medium",
            option.className,
            index > 0 && "border-l",
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          )}
          title={option.label}
        >
          {option.display}
        </Button>
      ))}
    </div>
  );
}
