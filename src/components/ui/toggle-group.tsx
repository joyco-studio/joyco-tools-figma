import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleGroupProps {
  type: "single" | "multiple";
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
  className?: string;
}

export interface ToggleGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
  "data-selected"?: boolean;
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, type, value, onValueChange, children, ...props }, ref) => {
    const handleItemClick = (itemValue: string) => {
      if (type === "single") {
        const newValue = value === itemValue ? "" : itemValue;
        onValueChange?.(newValue);
      } else {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(itemValue)
          ? currentValues.filter((v) => v !== itemValue)
          : [...currentValues, itemValue];
        onValueChange?.(newValues);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement<ToggleGroupItemProps>(child)) {
            const isSelected =
              type === "single"
                ? value === child.props.value
                : Array.isArray(value) && value.includes(child.props.value);

            return React.cloneElement(child, {
              ...child.props,
              onClick: () => handleItemClick(child.props.value),
              "data-selected": isSelected,
            });
          }
          return child;
        })}
      </div>
    );
  }
);

const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  ToggleGroupItemProps
>(({ className, value, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
      "hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      "border border-input bg-background px-3 py-2",
      "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
      className
    )}
    {...props}
  >
    {children}
  </button>
));

ToggleGroup.displayName = "ToggleGroup";
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
