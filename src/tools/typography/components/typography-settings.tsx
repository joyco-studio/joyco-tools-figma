import * as React from "react";
import {
  Command,
  CommandGroup,
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
import { FormField } from "@/components/ui/form-field";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ScaleRatioOption,
  ValidationErrors,
} from "../../../lib/types/typography";

interface TypographySettingsProps {
  lineHeight: number;
  letterSpacing: number;
  scaleRatio: number;
  onLineHeightChange: (value: number) => void;
  onLetterSpacingChange: (value: number) => void;
  onScaleRatioChange: (value: number) => void;
  ratioOptions: ScaleRatioOption[];
  isRatioOpen: boolean;
  onRatioOpenChange: (open: boolean) => void;
  errors: ValidationErrors;
}

export function TypographySettings({
  lineHeight,
  letterSpacing,
  scaleRatio,
  onLineHeightChange,
  onLetterSpacingChange,
  onScaleRatioChange,
  ratioOptions,
  isRatioOpen,
  onRatioOpenChange,
  errors,
}: TypographySettingsProps) {
  const getRatioDisplayText = () => {
    const ratio = ratioOptions.find((r) => r.value === scaleRatio.toString());
    return ratio?.label || "Select ratio...";
  };

  const handleRatioSelect = (ratioValue: string) => {
    onScaleRatioChange(parseFloat(ratioValue));
    onRatioOpenChange(false);
  };

  const handleLineHeightChange = (value: string) => {
    const num = parseFloat(value);
    if (value.trim() && !isNaN(num)) {
      onLineHeightChange(num);
    }
  };

  const handleLetterSpacingChange = (value: string) => {
    const num = parseFloat(value);
    if (value.trim() && !isNaN(num)) {
      onLetterSpacingChange(num);
    }
  };

  return (
    <div className="grid items-end grid-cols-2 gap-x-4 gap-y-6">
      {/* Line Height */}
      <FormField label="Line Height">
        <div className="space-y-1">
          <Input
            type="text"
            placeholder="1.4"
            value={lineHeight.toString()}
            onChange={(e) => handleLineHeightChange(e.target.value)}
            className={cn("w-full", errors.lineHeight && "border-red-500")}
          />
          {errors.lineHeight && (
            <p className="text-xs text-red-600">{errors.lineHeight}</p>
          )}
        </div>
      </FormField>

      {/* Letter Spacing */}
      <FormField label="Letter Spacing">
        <div className="space-y-1">
          <div className="relative">
            <Input
              type="text"
              placeholder="0"
              value={letterSpacing.toString()}
              onChange={(e) => handleLetterSpacingChange(e.target.value)}
              className={cn("pr-8", errors.letterSpacing && "border-red-500")}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          {errors.letterSpacing && (
            <p className="text-xs text-red-600">{errors.letterSpacing}</p>
          )}
        </div>
      </FormField>

      {/* Scale Ratio */}
      <FormField label="Scale Ratio" className="col-span-2">
        <div className="space-y-1">
          <Popover open={isRatioOpen} onOpenChange={onRatioOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isRatioOpen}
                className={cn(
                  "justify-between w-full cursor-default",
                  errors.scaleRatio && "border-red-500"
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
                    {ratioOptions.map((ratio) => (
                      <CommandItem
                        key={ratio.value}
                        onSelect={() => handleRatioSelect(ratio.value)}
                        className="cursor-default"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            scaleRatio.toString() === ratio.value
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
          {errors.scaleRatio && (
            <p className="text-xs text-red-600">{errors.scaleRatio}</p>
          )}
        </div>
      </FormField>
    </div>
  );
}
