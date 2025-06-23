import * as React from "react";
import { cn } from "@/lib/utils";

export interface InlineInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onSave?: (value: string) => void;
  onCancel?: () => void;
}

const InlineInput = React.forwardRef<HTMLInputElement, InlineInputProps>(
  ({ className, onSave, onCancel, onBlur, onKeyDown, ...props }, ref) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [localValue, setLocalValue] = React.useState(
      props.value?.toString() || ""
    );

    React.useEffect(() => {
      setLocalValue(props.value?.toString() || "");
    }, [props.value]);

    const handleSave = () => {
      onSave?.(localValue);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setLocalValue(props.value?.toString() || "");
      onCancel?.();
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
      onKeyDown?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      handleSave();
      onBlur?.(e);
    };

    if (!isEditing) {
      return (
        <div
          className={cn(
            "min-h-[2rem] px-2 py-1 cursor-text hover:bg-muted/50 rounded-sm transition-colors flex items-center",
            className
          )}
          onClick={() => setIsEditing(true)}
        >
          {localValue || props.placeholder || "Click to edit"}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type="text"
        className={cn(
          "flex h-8 w-full rounded-md bg-transparent px-2 py-1 text-sm shadow-sm transition-colors",
          "border-none outline-none ring-2 ring-ring ring-offset-2 ring-offset-background",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        {...props}
      />
    );
  }
);
InlineInput.displayName = "InlineInput";

export { InlineInput };
