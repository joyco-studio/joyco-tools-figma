import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "checked" | "onChange"
  > {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        ref={ref}
        className="sr-only"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
      <div
        className={cn(
          "relative w-11 h-6 bg-muted rounded-md transition-colors duration-200 ease-in-out",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          checked && "bg-primary",
          className
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 left-0.5 bg-background rounded-sm h-5 w-5 transition-transform duration-200 ease-in-out shadow-sm",
            checked && "translate-x-5"
          )}
        />
      </div>
    </label>
  )
);
Switch.displayName = "Switch";

export { Switch };
