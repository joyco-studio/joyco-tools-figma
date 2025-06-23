import * as React from "react";
import { TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DraggableTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
}

export function DraggableTableRow({
  index,
  onReorder,
  children,
  className,
  ...props
}: DraggableTableRowProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [draggedOver, setDraggedOver] = React.useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDraggedOver(true);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);

    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    const toIndex = index;

    if (fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }
  };

  return (
    <TableRow
      {...props}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "transition-all duration-200",
        isDragging && "opacity-50 scale-95",
        draggedOver && "bg-muted/50 border-primary/50",
        className
      )}
    >
      {children}
    </TableRow>
  );
}
