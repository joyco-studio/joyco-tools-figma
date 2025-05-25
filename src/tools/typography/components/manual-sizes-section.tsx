import * as React from "react";
import { ManualSizes, type SizeEntry } from "./manual-sizes";

interface ManualSizesSectionProps {
  sizes: SizeEntry[];
  availableStyles: string[];
  onSizesChange: (sizes: SizeEntry[]) => void;
  onAddSize: () => void;
  onRemoveSize: (id: string) => void;
  onUpdateSize: (id: string, field: string, value: any) => void;
  error?: string;
}

export function ManualSizesSection({
  sizes,
  availableStyles,
  onSizesChange,
  error,
}: ManualSizesSectionProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);

  return (
    <div className="space-y-1">
      <ManualSizes
        sizes={sizes}
        onSizesChange={onSizesChange}
        availableStyles={availableStyles}
        defaultRatio={1.2}
        editingId={editingId}
        onEditingIdChange={setEditingId}
      />
      {error && !editingId && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
