import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../../../components/ui/label";
import { Plus, X } from "lucide-react";

export interface SizeEntry {
  id: string;
  name: string;
  size: number;
}

interface ManualSizesProps {
  sizes: SizeEntry[];
  onSizesChange: (sizes: SizeEntry[]) => void;
  className?: string;
}

export function ManualSizes({
  sizes,
  onSizesChange,
  className,
}: ManualSizesProps) {
  const addManualSize = () => {
    const newId = (sizes.length + 1).toString();
    const newSizes = [...sizes, { id: newId, name: `size-${newId}`, size: 12 }];
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
    field: "name" | "size",
    value: string | number
  ) => {
    const newSizes = sizes.map((size) =>
      size.id === id ? { ...size, [field]: value } : size
    );
    onSizesChange(newSizes);
  };

  return (
    <div className={`border-t border-border ${className || ""}`}>
      <div className="p-4 space-y-3">
        <Label>Manual Sizes</Label>
        {sizes.map((sizeEntry) => (
          <div key={sizeEntry.id} className="flex items-center space-x-2">
            <Input
              placeholder="Name"
              value={sizeEntry.name}
              onChange={(e) =>
                updateManualSize(sizeEntry.id, "name", e.target.value)
              }
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Size"
              value={sizeEntry.size}
              onChange={(e) =>
                updateManualSize(
                  sizeEntry.id,
                  "size",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">px</span>
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
    </div>
  );
}
