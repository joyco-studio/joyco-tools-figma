import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../../../components/ui/label";
import { FormField } from "../../../components/ui/form-field";
import { Plus, X } from "lucide-react";
import { VariableSelector } from "./variable-selector";
import { cn } from "@/lib/utils";

export interface SizeEntry {
  id: string;
  name: string;
  size: number;
  lineHeight: number;
  letterSpacing: number;
  // Optional variable binding only for size
  sizeVariable?: Variable | null;
}

interface Variable {
  id: string;
  name: string;
  resolvedType: string;
  description?: string;
  collectionName?: string;
}

interface ManualSizesProps {
  sizes: SizeEntry[];
  onSizesChange: (sizes: SizeEntry[]) => void;
  defaultRatio?: number;
  className?: string;
}

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

export function ManualSizes({
  sizes,
  onSizesChange,
  defaultRatio = 1.2,
  className,
}: ManualSizesProps) {
  const addManualSize = () => {
    const newIndex = sizes.length + 1;
    const newId = newIndex.toString();
    const prevSize = sizes[sizes.length - 1];

    // Use previous size as reference, or defaults
    const baseSize = prevSize ? prevSize.size : 10;
    const baseLineHeight = prevSize ? prevSize.lineHeight : 1.4;
    const baseLetterSpacing = prevSize ? prevSize.letterSpacing : 0;

    const newSize = {
      id: newId,
      name: newIndex.toString(), // Default to number only
      size: Math.round(baseSize * defaultRatio),
      lineHeight: baseLineHeight, // Copy from previous
      letterSpacing: baseLetterSpacing, // Copy from previous
      sizeVariable: null,
    };

    const newSizes = [...sizes, newSize];
    onSizesChange(newSizes);
  };

  const removeManualSize = (id: string) => {
    if (sizes.length > 1) {
      const newSizes = sizes.filter((size) => size.id !== id);
      onSizesChange(newSizes);
    }
  };

  const updateManualSize = (
    id: string,
    field: "name" | "size" | "lineHeight" | "letterSpacing" | "sizeVariable",
    value: string | number | Variable | null
  ) => {
    const newSizes = sizes.map((size) =>
      size.id === id ? { ...size, [field]: value } : size
    );
    onSizesChange(newSizes);
  };

  return (
    <div className={`border-t border-border ${className || ""}`}>
      <div className="p-4">
        <FormField label="Manual Sizes">
          <div className="space-y-3">
            {sizes.map((sizeEntry) => (
              <div
                key={sizeEntry.id}
                className="space-y-4 p-4 border rounded-lg border-border"
              >
                {/* Name Field - Full Width */}
                <FormField label="Name">
                  <Input
                    placeholder="1"
                    value={sizeEntry.name}
                    onChange={(e) =>
                      updateManualSize(sizeEntry.id, "name", e.target.value)
                    }
                  />
                </FormField>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Size with Variable Selector */}
                  <FormField label="Size">
                    <div className="flex items-stretch">
                      <div className="relative flex-1">
                        <Input
                          type="text"
                          placeholder="10"
                          value={
                            sizeEntry.sizeVariable
                              ? "" // Empty when variable is selected, we'll show it differently
                              : sizeEntry.size
                          }
                          onChange={(e) =>
                            updateManualSize(
                              sizeEntry.id,
                              "size",
                              parseInt(e.target.value) || 0
                            )
                          }
                          disabled={!!sizeEntry.sizeVariable}
                          readOnly={!!sizeEntry.sizeVariable}
                          className={cn(
                            "rounded-r-none border-r-0",
                            !sizeEntry.sizeVariable && "pr-8"
                          )}
                        />
                        {/* Variable display overlay */}
                        {sizeEntry.sizeVariable && (
                          <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="truncate text-sm font-medium text-foreground">
                                {sizeEntry.sizeVariable.name}
                              </span>
                              <span className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground shrink-0">
                                {getTypeLabel(
                                  sizeEntry.sizeVariable.resolvedType
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                        {!sizeEntry.sizeVariable && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <span className="text-xs text-muted-foreground">
                              px
                            </span>
                          </div>
                        )}
                      </div>
                      <VariableSelector
                        selectedVariable={sizeEntry.sizeVariable}
                        onVariableSelect={(variable) =>
                          updateManualSize(
                            sizeEntry.id,
                            "sizeVariable",
                            variable
                          )
                        }
                        onUnlink={() =>
                          updateManualSize(sizeEntry.id, "sizeVariable", null)
                        }
                        allowedTypes={["FLOAT"]}
                        className="rounded-l-none border-l-0"
                        width={300}
                      />
                    </div>
                  </FormField>

                  {/* Line Height */}
                  <FormField label="Line Height">
                    <Input
                      type="text"
                      placeholder="1.4"
                      value={sizeEntry.lineHeight}
                      onChange={(e) =>
                        updateManualSize(
                          sizeEntry.id,
                          "lineHeight",
                          parseFloat(e.target.value) || 1.4
                        )
                      }
                    />
                  </FormField>

                  {/* Letter Spacing */}
                  <FormField label="Letter Spacing">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="0"
                        value={sizeEntry.letterSpacing}
                        onChange={(e) =>
                          updateManualSize(
                            sizeEntry.id,
                            "letterSpacing",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="pr-8"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  </FormField>

                  {/* Delete Button - Spans both columns */}
                  <div className="col-span-2 flex justify-end">
                    {sizes.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeManualSize(sizeEntry.id)}
                        className="px-2"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={addManualSize}
              className="w-full"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Size
            </Button>
          </div>
        </FormField>
      </div>
    </div>
  );
}
