import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../../../components/ui/label";
import { FormField } from "../../../components/ui/form-field";
import { Plus, X } from "lucide-react";

export interface SizeEntry {
  id: string;
  name: string;
  size: number;
  lineHeight: number;
  letterSpacing: number;
}

interface ManualSizesProps {
  sizes: SizeEntry[];
  onSizesChange: (sizes: SizeEntry[]) => void;
  defaultRatio?: number;
  className?: string;
}

export function ManualSizes({
  sizes,
  onSizesChange,
  defaultRatio = 1.2,
  className,
}: ManualSizesProps) {
  const addManualSize = () => {
    const newId = (sizes.length + 1).toString();
    const prevSize = sizes[sizes.length - 1];

    // Use previous size as reference, or defaults
    const baseSize = prevSize ? prevSize.size : 10;
    const baseLineHeight = prevSize ? prevSize.lineHeight : 1.4;
    const baseLetterSpacing = prevSize ? prevSize.letterSpacing : 0;

    const newSize = {
      id: newId,
      name: `size-${newId}`,
      size: Math.round(baseSize * defaultRatio),
      lineHeight: baseLineHeight, // Copy from previous
      letterSpacing: baseLetterSpacing, // Copy from previous
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
    field: "name" | "size" | "lineHeight" | "letterSpacing",
    value: string | number
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
                className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 items-center"
              >
                <Input
                  placeholder="Name"
                  value={sizeEntry.name}
                  onChange={(e) =>
                    updateManualSize(sizeEntry.id, "name", e.target.value)
                  }
                />
                <Input
                  type="text"
                  placeholder="Size"
                  value={sizeEntry.size}
                  onChange={(e) =>
                    updateManualSize(
                      sizeEntry.id,
                      "size",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-16"
                />
                <span className="text-xs text-muted-foreground">px</span>
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
                  className="w-16"
                />
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
                    className="w-16 pr-6"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
                {sizes.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeManualSize(sizeEntry.id)}
                    className="px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
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
