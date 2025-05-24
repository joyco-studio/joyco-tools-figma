import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Label } from "./label";

const cardSwitchVariants = cva(
  "relative flex w-full items-start gap-2 border p-4 shadow-xs outline-none transition-colors cursor-pointer",
  {
    variants: {
      variant: {
        default: "border-input hover:border-border",
        selected: "border-primary/50 bg-primary/5",
      },
      position: {
        standalone: "rounded-md",
        left: "rounded-l-md rounded-r-none border-r-0",
        right: "rounded-r-md rounded-l-none",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "standalone",
    },
  }
);

export interface CardSwitchProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    VariantProps<typeof cardSwitchVariants> {
  label: string;
  sublabel?: string;
  description: string;
  icon?: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const CardSwitch = React.forwardRef<HTMLDivElement, CardSwitchProps>(
  (
    {
      className,
      variant,
      position,
      label,
      sublabel,
      description,
      icon,
      checked = false,
      onCheckedChange,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const computedVariant = checked ? "selected" : "default";

    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          cardSwitchVariants({
            variant: computedVariant,
            position,
            className,
          }),
          disabled && "opacity-50 cursor-not-allowed"
        )}
        data-state={checked ? "checked" : "unchecked"}
        onClick={handleClick}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            handleClick();
          }
        }}
        {...props}
      >
        <div className="flex items-center gap-3 grow">
          {icon && <div className="shrink-0">{icon}</div>}
          <div className="grid gap-2 grow">
            <Label htmlFor={id} className="cursor-pointer pointer-events-none">
              {label}
              {sublabel && (
                <span className="text-muted-foreground text-xs leading-[inherit] font-normal">
                  {" "}
                  ({sublabel})
                </span>
              )}
            </Label>
            <p
              id={`${id}-description`}
              className="text-xs text-muted-foreground"
            >
              {description}
            </p>
          </div>
        </div>

        {/* Visual indicator */}
        <div className="flex items-center">
          <div
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-colors",
              checked
                ? "bg-primary border-primary"
                : "border-input bg-background"
            )}
          >
            {checked && (
              <div className="w-full h-full scale-50 rounded-full bg-primary-foreground" />
            )}
          </div>
        </div>
      </div>
    );
  }
);

CardSwitch.displayName = "CardSwitch";

export { CardSwitch, cardSwitchVariants };
